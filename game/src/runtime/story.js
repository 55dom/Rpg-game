// Story mode (Phase 3): plays an episode's beats on top of the combat game.
// Scenes stage actors and frame them with simple anime camera shots, dialogue runs from the
// Yarn-style scripts, fights reuse the combat world, and every beat autosaves.

import { Rig } from "./rig.js";
import { FlagStore } from "../core/flags.js";
import { parseScript, DialogueRunner, fillText } from "../core/script.js";
import { EpisodeDirector, validateEpisode, BeatType } from "../sim/episode.js";
import { CAST, speakerName } from "../data/story/cast.js";
import { CUTSCENES } from "../data/story/cutscenes.js";
import { validateCutscene, sampleCamera, eventsBetween, sampleMove } from "../core/timeline.js";
import { B, toon2, glow } from "./look.js";
import { ZONES, arrivalPoint } from "../data/zones.js";
import { Inventory } from "../core/inventory.js";
import { EPISODE_REWARD } from "../data/items.js";
import { QuestLog } from "../core/quests.js";
import { QUESTS } from "../data/quests.js";
import { compileExpr, truthy } from "../core/flags.js";
import { inRect } from "../sim/bounds.js";
import { Ambient } from "./ambient.js";
import { WorldClock } from "../sim/weather.js";
import { RainFX } from "./weather.js";

/** Gesture poses for dialogue: weapon-arm and off-arm rotations, a bow, a head tilt. */
const GESTURES = Object.freeze({
  none: {},
  point: { arm: [0.05, 0.1, 0] },
  raise: { arm: [-1.3, 0.2, 0] },
  hand: { arm: [0.55, -0.65, 0] },              // holding something in front of the chest
  cross: { arm: [0.85, -1.15, 0], off: [-0.5, 0, 1.25] },
  bow: { bow: 0.38 },
  tilt: { tilt: -0.2 },
  fist: { arm: [0.35, -0.3, 0.2] },
});

const CPS = 48; // typewriter characters per second
const CAPS = /^[A-Z0-9 .,'·-]+$/;

/** A stand-in "fighter" for a story actor, with just what Rig.update reads. */
function makeActor(x, z, yaw, down = false) {
  const pos = { x, y: 0, z };
  return {
    pos, prev: { ...pos }, yaw, prevYaw: yaw, targetYaw: yaw, vel: { x: 0, y: 0, z: 0 }, current: null, down,
    runner: { frame: 0, isRunning: false }, frozen: false, grounded: true, alive: true, deadFrames: 0, submerged: false,
    timeScale: 1, timeAcc: 0, relaxed: true, combatant: { isStaggered: false, postureBroken: false, blocking: false }, tags: { has: () => false },
  };
}
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
/** Ground-plane distance from point p to the segment a→b (for camera occlusion checks). */
function segDist(a, b, p) {
  const dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / L));
  return Math.hypot(a.x + dx * t - p.x, a.z + dz * t - p.z);
}

/** Actors on the current set, plus the shot math for scenes. */
class Stage {
  constructor(scene, getWorld) {
    this.scene = scene;
    this.getWorld = getWorld;
    this.actors = new Map(); // id → { actor, rig }
  }

  setup(beat) {
    this.clear();
    const p = this.getWorld().player;
    const r = beat.rook === undefined ? { x: 0, z: -4, yaw: 0 } : beat.rook;
    this.setPlayerVisible?.(!!r);
    this.setSquadVisible?.(false); // scenes stage their own Bas and Juno; hide the fighting copies
    if (r) {
      p.pos.x = p.prev.x = r.x; p.pos.z = p.prev.z = r.z; p.pos.y = p.prev.y = 0;
      p.yaw = p.prevYaw = r.yaw ?? 0; p.vel.x = p.vel.y = p.vel.z = 0;
    }
    p.relaxed = true;
    for (const c of beat.cast ?? beat.actors ?? []) {
      const actor = makeActor(c.x, c.z, c.yaw ?? 0, c.down);
      actor.pos.y = actor.prev.y = c.y ?? 0;
      const rig = new Rig(this.scene, c.look, `story-${c.id}`);
      if (c.hidden) { rig.setVisible(false); actor.hiddenActor = true; }
      this.actors.set(c.id, { actor, rig, look: c.look });
    }
  }

  /** Walk an actor to (x, z) over `dur` seconds (or at walking pace). */
  move(id, x, z, dur) {
    const a = this.get(id);
    if (!a) return 0;
    const d = Math.hypot(x - a.pos.x, z - a.pos.z);
    const time = dur ?? Math.max(0.4, d / 2.4);
    a.move = { from: [a.pos.x, a.pos.z], to: [x, z], t: 0, dur: time };
    a.targetYaw = Math.atan2(x - a.pos.x, z - a.pos.z);
    if (a === this.getWorld().player) a.yaw = a.prevYaw = a.targetYaw;
    return time;
  }

  pose(id, name) {
    const a = this.get(id);
    const g = GESTURES[name] ?? GESTURES.none;
    if (!a) return;
    a.armPose = g.arm ?? null; a.offPose = g.off ?? null; a.bow = g.bow ?? 0; a.headTilt = g.tilt ?? 0;
  }

  face(id, targetId) {
    const a = this.get(id), t = this.get(targetId);
    if (!a || !t) return;
    const yaw = Math.atan2(t.pos.x - a.pos.x, t.pos.z - a.pos.z);
    if (a === this.getWorld().player) a.yaw = a.prevYaw = yaw; else a.targetYaw = yaw;
  }

  show(id, on) { const a = this.actors.get(id); if (!a) return; a.rig.setVisible(on); a.actor.hiddenActor = !on; }

  clear() {
    const p = this.getWorld()?.player;
    if (p) { p.relaxed = false; p.armPose = p.offPose = null; p.bow = p.headTilt = 0; p.move = null; }
    this.setPlayerVisible?.(true);
    this.setSquadVisible?.(true);
    for (const { rig } of this.actors.values()) rig.dispose();
    this.actors.clear();
  }

  /** "player" or a cast id → something with pos and yaw. */
  get(id) {
    if (!id) return null;
    if (id === "player") return this.getWorld().player;
    return this.actors.get(id)?.actor ?? null;
  }

  /** Listeners turn toward whoever is talking; the speaker turns to whoever they're addressing. */
  lookAt(speakerId, addresseeId = null) {
    const sp = this.get(speakerId);
    if (!sp) return;
    const face = (who, target) => {
      if (!who || !target || who === target || who.down) return;
      const yaw = Math.atan2(target.pos.x - who.pos.x, target.pos.z - who.pos.z);
      if (who === this.getWorld().player) { who.yaw = who.prevYaw = who.yaw + wrap(yaw - who.yaw) * 0.8; } else who.targetYaw = yaw;
    };
    for (const { actor } of this.actors.values()) if (actor !== sp) face(actor, sp);
    if (speakerId !== "player") face(this.getWorld().player, sp);
    face(sp, this.get(addresseeId) ?? (speakerId !== "player" ? this.getWorld().player : this.nearest(sp)));
  }

  nearest(a) {
    let best = null, bd = Infinity;
    for (const { actor } of this.actors.values()) { const d = Math.hypot(actor.pos.x - a.pos.x, actor.pos.z - a.pos.z); if (!actor.down && d < bd) { bd = d; best = actor; } }
    return best;
  }

  update(dt, time) {
    const p = this.getWorld().player;
    if (p.move) this._step(p, dt);
    for (const { actor, rig } of this.actors.values()) {
      if (actor.move) this._step(actor, dt);
      actor.yaw += wrap(actor.targetYaw - actor.yaw) * Math.min(1, dt * 5);
      actor.prevYaw = actor.yaw;
      rig.update(actor, 1, dt);
      if (actor.down) { rig.root.rotation.x = -1.45; rig.root.position.y = 0.32; } // lying on their back
      if (actor.talking) { rig.body.rotation.y += Math.sin(time * 5.5) * 0.06; if (rig.head !== rig.shoulder) rig.head.rotation.x = Math.sin(time * 8.5) * 0.06; }
      else if (rig.head !== rig.shoulder) rig.head.rotation.x = 0;
    }
  }

  _step(a, dt) {
    const m = a.move;
    m.t += dt;
    const [x, z] = sampleMove(m.from, m.to, 0, m.dur, m.t);
    a.prev.x = a.pos.x = x; a.prev.z = a.pos.z = z;
    const moving = m.t < m.dur;
    const speed = moving ? Math.hypot(m.to[0] - m.from[0], m.to[1] - m.from[1]) / m.dur : 0;
    a.vel.x = Math.sin(a.targetYaw ?? a.yaw) * speed; a.vel.z = Math.cos(a.targetYaw ?? a.yaw) * speed;
    if (!moving) { a.move = null; a.vel.x = a.vel.z = 0; }
  }

  /** Camera framings. Returns { pos, look, fov } or null. */
  shot(kind, ids = []) {
    const pts = [this.getWorld().player, ...[...this.actors.values()].map((a) => a.actor)];
    if (kind === "wide") { // ids[0]: "front" looks back from the far side of the set, "side" from the right
      const vis = pts.filter((p) => !p.hiddenActor);
      let cx = 0, cz = 0;
      for (const p of vis) { cx += p.pos.x; cz += p.pos.z; }
      cx /= vis.length; cz /= vis.length;
      const span = Math.max(...vis.map((p) => Math.hypot(p.pos.x - cx, p.pos.z - cz)));
      const cy = vis.reduce((m, p) => m + (p.pos.y ?? 0), 0) / vis.length;
      const d = 5 + span * 1.3, front = ids[0] === "front" ? -1 : 1;
      if (ids[0] === "side") return { pos: { x: cx + d, y: cy + 2.4 + span * 0.2, z: cz - d * 0.3 }, look: { x: cx, y: cy + 1.3, z: cz + 0.6 }, fov: 0.8 };
      return { pos: { x: cx + d * 0.35, y: cy + 2.6 + span * 0.25, z: cz - d * front }, look: { x: cx, y: cy + 1.3, z: cz + front }, fov: 0.8 };
    }
    if (kind === "on") {
      const a = this.get(ids[0]);
      if (!a) return null;
      const scale = a === this.getWorld().player ? 1 : this.actors.get(ids[0])?.rig.look.scale ?? 1;
      const down = !!a.down;
      const look = { x: a.pos.x, y: (a.pos.y ?? 0) + (down ? 0.4 : 1.75 * scale), z: a.pos.z };
      // Try a few angles around the subject and keep the one with the clearest line of sight.
      const others = pts.filter((p) => p !== a);
      let best = null, bestScore = -1;
      for (const off of down ? [1.6, -1.6, 2.4, -2.4] : [0.3, -0.3, 0.7, -0.7, 1.1, -1.1]) {
        const ang = (a.targetYaw ?? a.yaw) + off, dist = down ? 3.3 : 2.7;
        const pos = { x: a.pos.x + Math.sin(ang) * dist, y: down ? 2.9 : look.y + 0.15, z: a.pos.z + Math.cos(ang) * dist };
        let clear = 9;
        for (const o of others) clear = Math.min(clear, segDist(pos, look, o.pos));
        const score = Math.min(clear, 1.2) - Math.abs(off) * 0.05;
        if (score > bestScore) { bestScore = score; best = pos; }
      }
      return { pos: best, look, fov: down ? 0.7 : 0.55 };
    }
    if (kind === "two") { // over the shoulder of ids[1], looking at ids[0]
      const a = this.get(ids[0]), b = this.get(ids[1]);
      if (!a || !b) return null;
      const dx = a.pos.x - b.pos.x, dz = a.pos.z - b.pos.z, sep = Math.hypot(dx, dz) || 1;
      const ux = dx / sep, uz = dz / sep;
      // Shoulder side: the one that keeps the camera toward the front of the set (−z).
      let rx = uz, rz = -ux;
      if (rz > 0) { rx = -rx; rz = -rz; }
      const sb = b === this.getWorld().player ? 1 : this.actors.get(ids[1])?.rig.look.scale ?? 1;
      const wide = sb * (this.actors.get(ids[1])?.rig.look.shoulders ?? 1); // big shoulders need a wider offset
      const back = 1.5 + sep * 0.25 + (sb - 1) * 1.5;
      const side = 0.95 + (wide - 1) * 0.9;
      const pos = { x: b.pos.x - ux * back + rx * side, y: 2.05 * sb + (b.pos.y ?? 0), z: b.pos.z - uz * back + rz * side };
      const look = { x: a.pos.x - ux * 0.3, y: 1.6 + (a.pos.y ?? 0), z: a.pos.z - uz * 0.3 };
      return { pos, look, fov: 0.62 };
    }
    return null;
  }
}

/** The dialogue box: typewriter text, name plate, choices. */
class DialogueView {
  constructor(root, sfx) {
    this.el = root.querySelector("[data-dialog]");
    this.plate = root.querySelector("[data-plate]");
    this.say = root.querySelector("[data-say]");
    this.choices = root.querySelector("[data-choices]");
    this.more = root.querySelector("[data-more]");
    this.sfx = sfx;
    this.full = ""; this.shown = 0; this.waiting = null; this.choosing = null; this.sel = 0;
    this.el.addEventListener("click", (e) => { if (!e.target.closest("button")) this.advance(); });
  }

  get typing() { return this.shown < this.full.length; }

  line(name, color, text) {
    this.el.hidden = false;
    this.plate.textContent = name ?? "";
    this.plate.style.background = color ?? "";
    this.say.classList.toggle("narration", !name);
    this.full = text; this.shown = 0;
    this.say.textContent = "";
    this.choices.innerHTML = "";
    this.more.hidden = true;
    return new Promise((res) => { this.waiting = res; });
  }

  options(opts) {
    this.more.hidden = true;
    this.sel = opts.findIndex((o) => o.enabled);
    this.choices.innerHTML = "";
    opts.forEach((o, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.textContent = o.text; b.dataset.n = String(i + 1); b.disabled = !o.enabled;
      b.addEventListener("click", (e) => { e.stopPropagation(); if (o.enabled) this.pick(i); });
      li.appendChild(b); this.choices.appendChild(li);
    });
    this.opts = opts;
    this.highlight();
    return new Promise((res) => { this.choosing = res; });
  }

  highlight() { [...this.choices.querySelectorAll("button")].forEach((b, i) => b.classList.toggle("sel", i === this.sel)); }
  move(d) {
    if (!this.choosing) return;
    const n = this.opts.length;
    for (let k = 1; k <= n; k++) { const i = (this.sel + d * k + n * 4) % n; if (this.opts[i].enabled) { this.sel = i; break; } }
    this.highlight(); this.sfx?.play("ui");
  }
  pick(i = this.sel) {
    if (!this.choosing || !this.opts[i]?.enabled) return;
    const res = this.choosing; this.choosing = null;
    this.choices.innerHTML = ""; this.sfx?.play("ui");
    res(i);
  }

  /** Confirm: finish typing, then continue (or pick the highlighted choice). */
  advance() {
    if (this.choosing) { this.pick(); return; }
    if (this.typing) { this.shown = this.full.length; this.say.textContent = this.full; this.more.hidden = false; return; }
    if (this.waiting) { const res = this.waiting; this.waiting = null; res(); }
  }

  update(dt, fast) {
    if (!this.typing) return;
    this.shown = fast ? this.full.length : Math.min(this.full.length, this.shown + Math.max(1, Math.floor(dt * CPS + Math.random())));
    this.say.textContent = this.full.slice(0, this.shown);
    if (!this.typing) this.more.hidden = false;
  }

  hide() { this.el.hidden = true; this.choices.innerHTML = ""; }
}

/**
 * Drives one episode. ctx is supplied by main.js:
 * { root, scene, camera, hud, sfx, vfx, controls, getWorld, makeWorld(opts), onEvents, saves, onExit(kind) }
 */
export class StoryPlayer {
  constructor(ctx, episodes, extraScripts = []) {
    this.ctx = ctx;
    this.episodes = episodes; // [{ episode, script }]
    this.nodes = {};
    for (const [i, src] of extraScripts.entries()) Object.assign(this.nodes, parseScript(src, `extra${i}`));
    for (const { episode, script } of episodes) {
      Object.assign(this.nodes, parseScript(script, episode.id));
      validateEpisode(episode, this.nodes);
    }
    this.flags = new FlagStore();
    this.player = { name: "Rook", pronouns: "they" };
    this.inventory = new Inventory();
    this.quests = new QuestLog(QUESTS, this.flags, {
      onReward: (q, r) => { if (r.marks) this.inventory.earn(r.marks); },
      onEvent: (e) => this.ctx.onQuest?.(e),
    });
    let updating = false;
    this.flags.onChange(() => { // any flag write can finish a quest stage
      if (updating) return;
      updating = true;
      try { this.quests.update(); } finally { updating = false; }
    });
    for (const cs of Object.values(CUTSCENES)) validateCutscene(cs);
    for (const { episode } of episodes) for (const b of episode.beats) if (b.cutscene && !CUTSCENES[b.cutscene]) throw new Error(`${episode.id}/${b.id}: no cutscene ${b.cutscene}`);
    this.stage = new Stage(ctx.scene, ctx.getWorld);
    this.stage.setPlayerVisible = (on) => ctx.setPlayerVisible?.(on);
    this.stage.setSquadVisible = (on) => ctx.setSquadVisible?.(on);
    this.tweens = [];
    this.time = 0;
    this.cut = null; // the cutscene playing, if any
    this.view = new DialogueView(ctx.root, ctx.sfx);
    const r = ctx.root;
    this.ui = {
      story: r.querySelector("[data-story]"), cold: r.querySelector("[data-coldopen]"), coldText: r.querySelector("[data-co-text]"),
      title: r.querySelector("[data-titlecard]"), preview: r.querySelector("[data-preview]"), hint: r.querySelector("[data-hint]"),
      objective: r.querySelector("[data-objective]"), talk: r.querySelector("[data-talk]"),
      skip: r.querySelector("[data-skip]"), fade: r.querySelector("[data-fade]"), caption: r.querySelector("[data-caption]"),
    };
    this.ui.skip.addEventListener("click", (e) => { e.stopPropagation(); this.skipping = true; this.view.advance(); });
    for (const el of [this.ui.cold, this.ui.title]) el.addEventListener("click", () => this.confirm());
    this.ui.talk.addEventListener("click", (e) => { e.stopPropagation(); this.interact(); });
    r.querySelector("[data-cutskip]")?.addEventListener("click", (e) => { e.stopPropagation(); this.confirm(); });
    this.timers = [];
    this.active = false;     // an episode is playing
    this.blocking = false;   // a scene/card is up: the world doesn't step and gameplay input is ignored
    this.skipping = false;
    this.fight = null;
    this.waitingCard = null;
  }

  episodeById(id) { return this.episodes.find((e) => e.episode.id === id)?.episode; }

  // ---- timers driven by the render loop (they pause with the game) ----
  sleep(s) { return new Promise((res) => this.timers.push({ t: s, res })); }

  update(dt, paused) {
    if (!paused) for (let i = this.timers.length - 1; i >= 0; i--) { const t = this.timers[i]; t.t -= dt; if (t.t <= 0) { this.timers.splice(i, 1); t.res(); } }
    if (paused) return;
    this.time += dt;
    this.view.update(dt, this.skipping);
    if (this.skipping && !this.view.typing && this.view.waiting) this.view.advance();
    for (const a of this.stage.actors.values()) a.actor.talking = a.actor === this.talker && this.view.typing;
    this.stage.update(dt, this.time);
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      tw.t += dt;
      tw.fn(Math.min(1, tw.t / tw.dur));
      if (tw.t >= tw.dur) { this.tweens.splice(i, 1); tw.done?.(); }
    }
    if (this.cut) this._cutStep(dt);
    if (this.fight) this._tutorial(dt);
    if (this.roaming && this.clock && this.exploring) this._weatherTick(dt);
    if (this.ambient && this.exploring) { // townsfolk go about their day (runtime/ambient.js)
      const p = this.ctx.getWorld().player, x = this.exploring;
      this.ambient.update({ dt, player: { x: p.pos.x, z: p.pos.z, moving: Math.hypot(p.vel.x, p.vel.z) > 0.4 }, combat: x.combat?.at ?? null,
        raining: !!this.weather?.raining, night: !!this.weather?.night, busy: x.busy });
    }
    if (this.exploring) this._exploreTick(dt);
  }

  /** Light / Enter / tap while a scene or card is up. */
  confirm() {
    if (this.cut) { this.cut.t = this.cut.cs.duration; return; } // skip the cutscene
    if (this.waitingCard) { const r = this.waitingCard; this.waitingCard = null; r(); return; }
    this.view.advance();
  }
  nav(d) { this.view.move(d); }
  choose(i) { if (this.view.choosing) { this.view.sel = i; this.view.pick(i); } }

  // ---- episode flow ----
  async play(episodeId, beatIndex = 0) {
    const ep = this.episodeById(episodeId);
    this.ep = ep;
    this.active = true;
    this.ctx.makeWorld({ ...ep.world });
    this.director = new EpisodeDirector(ep, this.flags, { onBeat: () => this.autosave() });
    let beat = this.director.start(beatIndex);
    while (beat && this.active) {
      const result = await this.runBeat(beat);
      if (!this.active) return;
      beat = this.director.complete(result);
    }
    if (this.active && this.director.done && !this.flags.get(`${ep.id.toUpperCase()}_PAID`)) { // a little pay for finishing an episode
      this.flags.set(`${ep.id.toUpperCase()}_PAID`, 1);
      this.inventory.earn(EPISODE_REWARD);
    }
    if (this.active) this.autosave();
  }

  /** The current resume point as a save record (for the slots menu). */
  snapshot() {
    if (!this.director || !this.ep) return null;
    const { episode, beat } = this.director.done ? { episode: this.ep.id, beat: this.ep.beats.length } : this.director.resumePoint;
    return { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), episode, beat };
  }

  autosave() {
    if (!this.director) return;
    this.ctx.saves.reach(this.ep.number + (this.director.done ? 1 : 0));
    const { episode, beat } = this.director.done ? { episode: this.ep.id, beat: this.ep.beats.length } : this.director.resumePoint;
    this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), episode, beat });
  }

  stop() {
    this.active = false; this.blocking = false; this.fight = null; this.skipping = false;
    this.timers.length = 0;
    if (this.cut) { const c = this.cut; this.cut = null; c.resolve(); }
    this.ctx.root.classList.remove("in-cut");
    for (const tw of this.tweens) tw.done?.();
    this.tweens.length = 0;
    this._caption(null); this._fade(false, 0);
    this.stage.clear(); this.view.hide();
    this.ctx.sets?.use("yard");
    for (const el of [this.ui.cold, this.ui.title, this.ui.preview]) el.hidden = true;
    this._hint("");
    this._endExplore();
    this.roaming = false; this.zone = null;
    this.rain?.stop(); this.weather = null;
    this.ctx.root.classList.remove("in-scene");
    this.ctx.camera.release();
  }

  async runBeat(beat) {
    switch (beat.type) {
      case BeatType.ColdOpen: return this.coldOpen(beat);
      case BeatType.Cutscene: { this._enterScene(true); await this.playCutscene(beat.cutscene); return {}; }
      case BeatType.Title: return this.titleCard();
      case BeatType.Scene: return this.scene(beat);
      case BeatType.Fight: return this.runFight(beat);
      case BeatType.Explore: return this.explore(beat);
      case BeatType.Preview: return this.preview(beat);
      default: return {};
    }
  }

  _enterScene(on) {
    this.blocking = on;
    this.ctx.root.classList.toggle("in-scene", on);
    if (!on) { this.view.hide(); this.ctx.camera.release(); }
  }

  async coldOpen(beat) {
    this._enterScene(true);
    this.surface = "cold";
    const c = this.ui.cold;
    c.hidden = false; c.className = "coldopen";
    await this.runNode(beat.node);
    await this.sleep(0.4);
    c.hidden = true; this.surface = null;
    return {};
  }

  async titleCard() {
    this._enterScene(true);
    const t = this.ui.title, ep = this.ep;
    t.querySelector("[data-tc-ep]").textContent = `EPISODE ${ep.number}`;
    t.querySelector("[data-tc-title]").textContent = ep.title.toUpperCase();
    t.querySelector("[data-tc-arc]").textContent = ep.arc ?? "";
    t.hidden = false; // un-hiding restarts the CSS animations
    this.ctx.sfx.play("bossIntro");
    await Promise.race([this.sleep(3.4), new Promise((r) => { this.waitingCard = r; })]);
    this.waitingCard = null;
    t.hidden = true;
    return {};
  }

  async scene(beat) {
    this._enterScene(true);
    this.ctx.sets?.use(beat.stage ?? "yard");
    this.stage.setup(beat);
    const wide = this.stage.shot("wide");
    if (wide) this.ctx.camera.frame(wide.pos, wide.look, { fov: wide.fov, cut: true });
    this.currentShot = { kind: "wide", ids: [] };
    await this.runNode(beat.node);
    this.skipping = false;
    this.view.hide();
    return {};
  }

  async runNode(name) {
    const r = new DialogueRunner(this.nodes, this.flags, this.player).start(name);
    for (;;) {
      const s = r.next();
      if (s.type === "end") break;
      if (s.type === "line") await this.showLine(s);
      else if (s.type === "options") {
        this.skipping = false;
        const i = await this.view.options(s.options);
        r.choose(i);
      } else if (s.type === "command") await this.command(s.name, s.args);
      if (!this.active) return;
    }
  }

  async showLine(s) {
    if (this.surface === "cold") {
      const p = this.ui.coldText;
      p.textContent = s.text; p.className = CAPS.test(s.text) ? "caps" : "";
      await Promise.race([this.sleep(this.skipping ? 0.2 : 1.2 + s.text.length * 0.05), new Promise((r) => { this.waitingCard = r; })]);
      this.waitingCard = null;
      return;
    }
    if (!s.speaker && CAPS.test(s.text)) { // captions ("FIFTEEN YEARS LATER") get the big banner
      this.ctx.hud.banner(s.text);
      await this.sleep(this.skipping ? 0.2 : 1.6);
      return;
    }
    const cast = CAST[s.speaker];
    this.talker = cast?.actor ? this.stage.get(cast.actor) : null;
    if (cast?.actor) { // turn first, then frame, so close-ups catch the face
      const cur = this.currentShot;
      const other = cur.kind === "two" && cur.ids.includes(cast.actor) ? cur.ids.find((i) => i !== cast.actor) : null;
      this.stage.lookAt(cast.actor, other);
    }
    if (s.speaker) this._autoFrame(cast?.actor);
    const name = s.speaker ? speakerName(s.speaker, this.player.name).toUpperCase() : null;
    await this.view.line(name, cast?.color, s.text);
  }

  /** Cut to the speaker unless the current shot already shows them. */
  _autoFrame(actorId) {
    if (!actorId || this.stage.get(actorId) == null) return;
    const cur = this.currentShot;
    if (cur.kind === "two" && cur.ids[1] === actorId) { this._shot("two", [cur.ids[1], cur.ids[0]]); return; } // reverse angle
    if (cur.kind === "on" && cur.ids[0] === actorId) { // re-aim if they turned since the shot was set
      const a = this.stage.get(actorId), yaw = a.targetYaw ?? a.yaw;
      if (Math.abs(wrap(yaw - (cur.yaw ?? yaw))) > 0.5) this._shot("on", [actorId]);
      return;
    }
    if (cur.kind === "wide" || (cur.kind === "two" && cur.ids[0] === actorId)) return;
    this._shot("on", [actorId]);
  }

  _shot(kind, ids, cut = true) {
    const sh = this.stage.shot(kind, ids);
    if (!sh) return;
    const subj = kind === "on" ? this.stage.get(ids[0]) : null;
    this.currentShot = { kind, ids, yaw: subj ? subj.targetYaw ?? subj.yaw : null };
    this.ctx.camera.frame(sh.pos, sh.look, { fov: sh.fov, cut });
  }

  async command(name, args) {
    const actorOf = (n) => CAST[n]?.actor ?? n;
    switch (name) {
      case "shot": {
        const [kind, ...who] = args;
        this._shot(kind, kind === "wide" ? who : who.map(actorOf), kind !== "wide");
        break;
      }
      case "wait": await this.sleep(this.skipping ? 0 : Number(args[0]) || 0.5); break;
      case "sfx": this.ctx.sfx.play(args[0]); break;
      case "fx": await this.fx(args); break;
      case "move": { // <<move Severin x z>> walks there; add "wait" to finish first
        const t = this.stage.move(actorOf(args[0]), Number(args[1]), Number(args[2]));
        if (args[3] === "wait") await this.sleep(this.skipping ? 0 : t);
        break;
      }
      case "pose": this.stage.pose(actorOf(args[0]), args[1] ?? "none"); break;
      case "face": this.stage.face(actorOf(args[0]), actorOf(args[1])); break;
      case "cue": this.ctx.sets?.cue(args[0]); break;
      case "show": case "hide": this.stage.show(actorOf(args[0]), name === "show"); break;
      case "quest": if (args[0] === "start") this.quests.start(args[1]); break;
      case "pay": { // <<pay N>>: spend Marks; $PAID says whether it worked
        const n = Number(args[0]) || 0, ok = this.inventory.marks >= n;
        if (ok) this.inventory.marks -= n;
        this.flags.set("PAID", ok ? 1 : 0);
        break;
      }
      case "earn": this.inventory.earn(Number(args[0]) || 0); this.ctx.hud.toast(`+${args[0]} MARKS`, "clear"); break;
      case "cutscene": await this.playCutscene(args[0]); break;
      default: break;   // unknown commands are ignored (forward-compatible scripts)
    }
  }

  async fx([kind, who]) {
    const c = this.ui.cold;
    if (this.surface === "cold") {
      if (kind === "fire") c.classList.add("fire");
      if (kind === "silhouette") c.classList.add("figure");
      if (kind === "clear") c.classList.remove("figure");
      return;
    }
    if (kind === "door") { await this.doorOfLight(CAST[who]?.actor ?? who); return; }
    if (kind === "book") await this.bookDescends(CAST[who]?.actor ?? who, who === "Severin" ? "tome" : "thin");
  }

  /** A grimoire floats down out of the light into someone's hands. */
  async bookDescends(id, kind) {
    const a = this.stage.get(id);
    if (!a) return;
    const BB = B(), MB = BB.MeshBuilder, scene = this.ctx.scene, { vfx, sfx } = this.ctx;
    const tome = kind === "tome";
    const node = new BB.TransformNode("story-book", scene);
    const mats = [];
    const part = (mesh, mat) => { mesh.parent = node; mesh.material = mat; mesh.isPickable = false; mats.push(mat); mesh.renderOutline = true; mesh.outlineWidth = 0.02; return mesh; };
    part(MB.CreateBox("bookCover", { width: tome ? 0.5 : 0.36, height: tome ? 0.62 : 0.46, depth: tome ? 0.22 : 0.05 }, scene), toon2(scene, "story-cover", tome ? "#f1ead8" : "#6a4a32"));
    part(MB.CreateBox("bookPages", { width: tome ? 0.44 : 0.32, height: tome ? 0.56 : 0.42, depth: tome ? 0.18 : 0.03 }, scene), glow(scene, "story-pages", "#fff2cf")).position.x = 0.03;
    if (tome) for (let i = 0; i < 7; i++) part(MB.CreateBox("clasp", { width: 0.08, height: 0.05, depth: 0.25 }, scene), glow(scene, `story-clasp${i}`, "#ffd27a")).position.set(0.26, -0.24 + i * 0.08, 0);
    const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw);
    const end = { x: a.pos.x + fx * 0.5, y: 1.35, z: a.pos.z + fz * 0.5 };
    const start = { ...end, y: 6.5 };
    sfx.play("bookDescend");
    vfx.ring({ x: a.pos.x, y: 0.06, z: a.pos.z }, 4, "#e6b54e", 0.8);
    const dur = this.skipping ? 0.05 : 1.6;
    await new Promise((res) => this.tweens.push({ t: 0, dur, fn: (k) => {
      const e = 1 - (1 - k) * (1 - k);
      node.position.set(start.x, start.y + (end.y - start.y) * e + Math.sin(k * 9) * 0.05 * (1 - k), start.z);
      node.rotation.y = a.yaw + Math.PI / 2 + (1 - e) * 4;
    }, done: res }));
    vfx.flash(end, tome ? 3 : 1.6, "#fff2cf", 0.35);
    vfx.sparksAt(end, tome ? 18 : 6, "gold", 4, 3);
    this.stage.pose(id, "hand");
    this.heldBook = node;
    const dispose = () => { node.dispose(false, true); if (this.heldBook === node) this.heldBook = null; };
    this.tweens.push({ t: 0, dur: tome ? 6 : 3.5, fn: () => {}, done: dispose });
  }

  /** A golden door frame opens in the air in front of someone, then closes. */
  async doorOfLight(id) {
    const a = this.stage.get(id);
    if (!a) return;
    const BB = B(), MB = BB.MeshBuilder, scene = this.ctx.scene;
    const node = new BB.TransformNode("story-door", scene);
    const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw);
    node.position.set(a.pos.x + fx * 1.8, 0, a.pos.z + fz * 1.8); node.rotation.y = a.yaw;
    const gold = glow(scene, "story-doorFrame", "#ffd36a"), inner = glow(scene, "story-doorLight", "#fff3d0", 0.35, true);
    for (const [w, h, x, y] of [[0.14, 2.6, -0.75, 1.3], [0.14, 2.6, 0.75, 1.3], [1.64, 0.14, 0, 2.6], [1.64, 0.14, 0, 0.02]]) {
      const m = MB.CreateBox("doorBar", { width: w, height: h, depth: 0.1 }, scene); m.parent = node; m.position.set(x, y, 0); m.material = gold; m.isPickable = false;
    }
    const pane = MB.CreatePlane("doorPane", { width: 1.4, height: 2.5, sideOrientation: BB.Mesh.DOUBLESIDE }, scene); pane.parent = node; pane.position.y = 1.3; pane.material = inner; pane.isPickable = false;
    this.ctx.sfx.play("door");
    this.ctx.vfx.ring({ x: node.position.x, y: 0.06, z: node.position.z }, 3, "#ffd36a", 0.6);
    const dur = this.skipping ? 0.05 : 3.2;
    await new Promise((res) => this.tweens.push({ t: 0, dur, fn: (k) => {
      const open = Math.min(1, k * 5), close = Math.min(1, (1 - k) * 5);
      node.scaling.set(Math.min(open, close), Math.min(open, close), 1);
      inner.alpha = 0.35 * Math.min(open, close) + Math.sin(k * 30) * 0.03;
    }, done: res }));
    node.dispose(false, true);
  }

  // ---- Exploration (hubs): walk freely, talk to people ----
  async explore(beat) {
    this._enterScene(false);
    this.ctx.sets?.use(beat.stage ?? "yard");
    this.ctx.sets?.applyFlags?.((cond) => truthy(compileExpr(cond)(this.flags))); // aftermath and repairs follow the story
    this.stage.setup(beat);
    const p = this.ctx.getWorld().player;
    p.relaxed = true;
    this.ctx.root.classList.add("exploring");
    this.ctx.camera.release();
    this.ambient = beat.zone ? new Ambient(this.stage, beat.zone, this.flags) : null;
    this.exploring = { beat, talked: new Set(), near: null, busy: false, pickups: this._makePickups(beat.pickups ?? []),
      encounters: (beat.encounters ?? []).map((e) => ({ ...e, cond: compileExpr(e.when ?? "1"), armed: true, done: false })), combat: null };
    this._objective();
    const out = await new Promise((res) => { this.exploring.resolve = res; });
    this._endExplore();
    return out ?? {};
  }

  _endExplore() {
    if (this.exploring?.combat) this._endCombat(false);
    for (const pk of this.exploring?.pickups ?? []) pk.node.dispose(false, true);
    this.exploring = null;
    this.ambient = null;
    this.ctx.root.classList.remove("exploring");
    if (this.ui.objective) this.ui.objective.hidden = true;
    if (this.ui.talk) this.ui.talk.hidden = true;
  }

  /** Glowing things on the ground you can pick up (quest items). Shown while their condition holds. */
  _makePickups(list) {
    const BB = B(), MB = BB.MeshBuilder, scene = this.ctx.scene;
    return list.map((p) => {
      const node = new BB.TransformNode(`pickup-${p.id}`, scene);
      node.position.set(p.x, 0, p.z);
      const lamp = MB.CreateBox("pickupLamp", { width: 0.28, height: 0.36, depth: 0.28 }, scene); lamp.parent = node; lamp.position.y = 0.4; lamp.material = glow(scene, `pickup-${p.id}-m`, "#ffd36a");
      const ring = MB.CreateTorus("pickupRing", { diameter: 1, thickness: 0.04, tessellation: 24 }, scene); ring.parent = node; ring.position.y = 0.03; ring.material = lamp.material;
      for (const m of [lamp, ring]) m.isPickable = false;
      return { ...p, script: p.node, node, lamp, cond: compileExpr(p.show ?? "1") }; // node = the 3D marker; script = its dialogue
    });
  }

  /** The world clock: time of day and weather drive the sky, rain, crowd and townsfolk (GDD §29.10). */
  _weatherTick(dt) {
    const c = this.clock, sets = this.ctx.sets;
    c.update(dt);
    this.weather = { raining: c.raining, night: c.night };
    this.rain ??= new RainFX(this.ctx.scene, { mobile: this.ctx.mobile });
    this.rain.update(c.wet, this.ctx.scene.activeCamera?.position);
    const p = this.ctx.getWorld().player.pos, fight = !!this.exploring?.combat;
    const set = sets?.built?.get(sets.current);
    if (set) set.mood = { density: c.density * (fight ? 0.1 : 1), hurry: 1 + c.wet * 0.7, wind: c.wet + c.cloud * 0.3, player: { x: p.x, z: p.z } };
    if ((this.atmoT = (this.atmoT ?? 0) - dt) <= 0) {
      this.atmoT = 0.5;
      sets?.atmosphere?.({ daylight: c.daylight, cloud: c.cloud, wet: c.wet });
      const label = `${c.label} · ${c.raining ? "Rain" : c.cloud > 0.5 ? "Overcast" : c.night ? "Night" : "Clear"}`;
      if (label !== this.skyLabel) { this.skyLabel = label; this._objective(); }
    }
  }

  _objective() {
    const x = this.exploring, b = x.beat, npcs = b.cast.filter((c) => c.node);
    const n = npcs.filter((c) => x.talked.has(c.id)).length;
    this.ui.objective.innerHTML = fillText(b.objective ?? "", { ...this.player, flags: this.flags }).replace("{n}", n).replace("{total}", npcs.length).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    if (this.roaming) {
      const q = this.quests.entries().find((e) => !e.done);
      const track = q ? ` · <b>Quest:</b> ${fillText(q.objective, { ...this.player, flags: this.flags })}` : "";
      this.ui.objective.innerHTML = `<b>${this.zone.name}</b>${this.skyLabel ? ` · ${this.skyLabel}` : ""}${track}`;
      this.ui.objective.hidden = false;
    }
    this.ui.objective.hidden = !b.objective;
  }

  _exploreTick(dt) {
    const x = this.exploring;
    if (!x || x.busy) return;
    if (x.cooldown > 0) x.cooldown -= dt;
    const pp = this.ctx.getWorld().player.pos;
    if (x.encounters.length && this._encounterTick(x, pp)) { // fighting: no talking, no leaving
      if (!this.ui.talk.hidden) this.ui.talk.hidden = true;
      x.near = null;
      return;
    }
    for (const e of x.beat.exits ?? []) {
      if (!inRect(pp, e.rect)) continue;
      x.busy = true; x.resolve({ exit: e }); return; // leaving the zone
    }
    const p = this.ctx.getWorld().player;
    let near = null, best = 2.4;
    for (const pk of x.pickups) {
      const on = truthy(pk.cond(this.flags));
      pk.node.setEnabled(on);
      if (!on) continue;
      pk.lamp.position.y = 0.4 + Math.sin(this.time * 3) * 0.08; pk.lamp.rotation.y += dt * 1.5;
      const d = Math.hypot(pk.x - p.pos.x, pk.z - p.pos.z);
      if (d < best) { best = d; near = { id: pk.id, pickup: pk }; }
    }
    for (const c of x.beat.cast) {
      const a = this.stage.get(c.id);
      if (!a || a.hiddenActor) continue; // gone home for the night
      const d = Math.hypot(a.pos.x - p.pos.x, a.pos.z - p.pos.z);
      if (d < 0.95 && d > 0.01) { const k = (0.95 - d) / d; p.pos.x += (p.pos.x - a.pos.x) * k; p.pos.z += (p.pos.z - a.pos.z) * k; } // don't walk through people
      if (c.node && d < best) { best = d; near = c; }
    }
    const t = this.ui.talk;
    if (t.hidden !== !near) t.hidden = !near; // checked every frame, so it can never get stuck
    if (near !== x.near) {
      x.near = near;
      if (near) {
        const c = this.ctx.controls;
        const device = c.device === "keyboard" && !c.keyboardUsed && this.ctx.root.classList.contains("is-touch") ? "touch" : c.device;
        t.innerHTML = `<kbd>${this.ctx.hud.label(device, "Light")}</kbd>${near.pickup ? near.pickup.label : `Talk to ${Object.values(CAST).find((k) => k.actor === near.id)?.name ?? near.id}`}`;
      }
    }
    if (near && !near.pickup) { const a = this.stage.get(near.id); if (!a.down) a.targetYaw = Math.atan2(p.pos.x - a.pos.x, p.pos.z - a.pos.z); }
  }

  /** Talk to whoever is close (exploration). */
  async interact() {
    const x = this.exploring;
    if (!x || x.busy || !x.near || x.cooldown > 0) return false;
    const c = x.near;
    if (c.pickup) { // pick it up (or read it): set its flag (quests notice); most then disappear
      const pk = c.pickup;
      if (pk.flag) this.flags.set(pk.flag, 1);
      if (pk.marks) { this.inventory.earn(pk.marks); this.ctx.hud.banner(`+${pk.marks} MARKS`); }
      if (pk.script) {
        x.busy = true; this.ui.talk.hidden = true;
        this._enterScene(true);
        const p = this.ctx.getWorld().player;
        p.vel.x = p.vel.z = 0; p.moveInput.x = p.moveInput.z = 0; p.runner.interrupt();
        await this.runNode(pk.script);
        if (!this.exploring) return true;
        this.skipping = false;
        this._enterScene(false);
        this.view.hide();
        x.busy = false;
      } else {
        this.ctx.sfx.play("surgeFull");
        this.ctx.hud.toast(pk.label.replace(/^(Pick up|Open) (the )?/, "").toUpperCase(), "clear");
      }
      x.near = null; x.cooldown = 0.6; this._objective();
      if (this.roaming) this.saveNow();
      return true;
    }
    x.busy = true; this.ui.talk.hidden = true;
    this._enterScene(true);
    const p = this.ctx.getWorld().player;
    p.vel.x = p.vel.z = 0; p.moveInput.x = p.moveInput.z = 0; p.runner.interrupt();
    this.stage.face("player", c.id);
    this.stage.face(c.id, "player");
    this._shot("two", [c.id, "player"]);
    const node = x.talked.has(c.id) && c.again ? c.again : c.node;
    await this.runNode(node);
    if (!this.exploring) return true;
    if (c.shop) { this.view.hide(); await this.ctx.openShop?.(c.shop); }
    x.talked.add(c.id);
    this.skipping = false;
    this._enterScene(false);
    this.view.hide();
    x.busy = false; x.near = null; x.cooldown = 0.6; // the key that closed the last line mustn't reopen it
    this._objective();
    if (this.roaming) this.saveNow(); // talking can start or finish quests
    if (x.beat.required?.length && x.beat.required.every((id) => x.talked.has(id))) x.resolve();
    return true;
  }

  // ---- Field and dungeon fights (GDD §13): walk into an encounter's area and it starts ----
  /** Start encounters the player walks into; while one runs, returns true. */
  _encounterTick(x, pp) {
    const c = x.combat;
    if (c) {
      // Field fights give up if you run far enough; dungeon rooms are barred shut.
      if (!c.lock && Math.hypot(pp.x - c.at.x, pp.z - c.at.z) > (c.leash ?? 12)) {
        this._endCombat(false);
        this.ctx.hud.toast("GOT AWAY", "afterimage");
        return false;
      }
      return true;
    }
    for (const e of x.encounters) {
      if (e.done || (e.flag && this.flags.get(e.flag)) || !truthy(e.cond(this.flags))) continue;
      if (!inRect(pp, e.rect)) { e.armed = true; continue; }
      if (e.armed) { this._startCombat(x, e); return true; }
    }
    return false;
  }

  _startCombat(x, e) {
    const world = this.ctx.getWorld();
    x.combat = e; e.armed = false;
    if (e.lock?.length) { // bar the passages: solid while the fight lasts, with glowing bars to show it
      this.openBounds = world.bounds;
      world.bounds = { ...world.bounds, solids: [...(world.bounds.solids ?? []), ...e.lock.map((b) => ({ box: b }))] };
      const BB = B(), scene = this.ctx.scene, iron = toon2(scene, "enc-iron", "#3a3f48"), lit = glow(scene, "enc-rail", "#3fb8c8");
      this.bars = e.lock.map(([x0, z0, x1, z1]) => { // iron bars drop across the passage, with a glowing rail on top
        const node = new BB.TransformNode("enc-gate", scene);
        node.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
        const w = x1 - x0, d = z1 - z0, along = w >= d, len = along ? w : d;
        for (let i = 0; i <= 6; i++) {
          const bar = BB.MeshBuilder.CreateBox("enc-bar", { width: 0.1, height: 1.9, depth: 0.1 }, scene);
          bar.parent = node; bar.material = iron; bar.isPickable = false;
          const off = -len / 2 + (i / 6) * len;
          bar.position.set(along ? off : 0, 0.95, along ? 0 : off);
        }
        const rail = BB.MeshBuilder.CreateBox("enc-rail", { width: along ? len + 0.2 : 0.12, height: 0.08, depth: along ? 0.12 : len + 0.2 }, scene);
        rail.parent = node; rail.position.y = 1.9; rail.material = lit; rail.isPickable = false;
        return node;
      });
      this.ctx.sfx.play("slam");
    }
    world.player.relaxed = false;
    world.spawnWave(e.wave, e.at);
    this.ctx.onEvents(world.drainEvents());
    this.ctx.hud.banner(e.label ?? "AMBUSH");
  }

  /** The fight ends: won (flags, rewards, a breather) or not (escaped or fell: enemies leave). */
  _endCombat(won) {
    const x = this.exploring, e = x?.combat;
    if (!e) return;
    x.combat = null;
    const world = this.ctx.getWorld();
    if (this.openBounds) { world.bounds = this.openBounds; this.openBounds = null; }
    for (const b of this.bars ?? []) b.dispose(false, true);
    this.bars = null;
    if (won) {
      e.done = true;
      if (e.flag) { this.flags.set(e.flag, 1); this.flags.set(`${e.flag}_VISIT`, Number(this.flags.get(`VISITS_${this.zone.id.toUpperCase()}`)) || 1); }
      const p = world.player.combatant.health;
      p.add(p.max * 0.3); // catch your breath
      this.ctx.hud.banner(`${e.label ?? "AMBUSH"} · CLEARED`);
      this.saveNow();
    } else {
      world.clearEnemies();
      this.ctx.onEvents(world.drainEvents());
    }
    world.player.relaxed = true;
  }

  /** Falling in the field: wake up back at the zone's entrance, enemies gone, nothing lost. */
  async _fallInField() {
    const x = this.exploring;
    await this.sleep(2.2);
    if (this.exploring !== x || !x.combat) return;
    this._fade(true, 0.4);
    await this.sleep(0.5);
    if (this.exploring !== x) return;
    const e = x.combat;
    this._endCombat(false);
    e.armed = false; // walk out of its area before it can start again
    const world = this.ctx.getWorld(), p = world.player, at = arrivalPoint(this.zone, this.arrival);
    world.revivePlayer(1);
    p.pos.x = p.prev.x = at.x; p.pos.z = p.prev.z = at.z; p.pos.y = p.prev.y = 0; p.yaw = p.prevYaw = at.yaw ?? 0;
    this.ctx.onEvents(world.drainEvents());
    this._fade(false, 0.6);
    this.ctx.hud.banner(`${this.player.name.toUpperCase()} WAKES UP AT THE ${this.zone.dungeon ? "STAIRS" : "ROADSIDE"}`);
  }

  // ---- Free roam: walk between zones (GDD §13) ----
  /** Wander the world from `zoneId`, arriving at `arrival` (a key in the zone's arrivals). Runs until stopped. */
  async roam(zoneId, arrival = null) {
    this.active = true;
    this.roaming = true;
    this.ep = null; this.director = null;
    this.ctx.makeWorld({ companions: false, ultimate: true, pages: true });
    let id = zoneId, arr = arrival;
    while (this.active) {
      const zone = ZONES[id];
      this.zone = zone; this.arrival = arr;
      const world = this.ctx.getWorld();
      world.bounds = zone.bounds;
      this.ctx.camera.bounds = zone.bounds;
      this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), zone: id, arrival: arr, episode: null, beat: 0, clock: this.clock?.toJSON() });
      this.ctx.onZone?.(zone);
      const at = arrivalPoint(zone, arr);
      this._fade(false, 0.5);
      this.ctx.hud.banner(`${zone.name.toUpperCase()} · ${zone.region.toUpperCase()}`);
      this.flags.set(`VISITED_${id.toUpperCase()}`, 1);
      this.flags.set(`VISITS_${id.toUpperCase()}`, (Number(this.flags.get(`VISITS_${id.toUpperCase()}`)) || 0) + 1);
      this.clock ??= new WorldClock();
      this.clock.setClimate(id);
      this.skyLabel = null; this.atmoT = 0;
      world.resetPlayer(); // a new zone: back to full health (explore puts Rook at the arrival point)
      const out = await this.explore({ id: `zone-${id}`, zone, stage: zone.stage, rook: at, cast: [...zone.cast, ...(zone.extras ?? [])], exits: zone.exits, pickups: zone.pickups, encounters: zone.encounters,
        objective: zone.exits.map((e) => `<b>Exit:</b> ${e.label}`).join(" · ") });
      if (!this.active) return;
      this._fade(true, 0.35);
      await this.sleep(0.4);
      if (out.travel) { id = out.travel; arr = null; continue; }
      if (out.exit) { id = out.exit.to; arr = out.exit.spawn; }
    }
  }

  /** Save right now (after shopping, etc.): the current zone when roaming, else the episode's resume point. */
  saveNow() {
    if (this.roaming && this.zone) this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), zone: this.zone.id, arrival: this.arrival ?? null, episode: null, beat: 0, clock: this.clock?.toJSON() });
    else this.autosave();
  }

  /** Map travel: jump to another zone's main arrival point. */
  travel(zoneId) { if (this.exploring && !this.exploring.busy && !this.exploring.combat && ZONES[zoneId]) { this.exploring.busy = true; this.exploring.resolve({ travel: zoneId }); } }

  // ---- Cutscenes (timeline playback) ----
  playCutscene(id) {
    const cs = CUTSCENES[id];
    if (!cs) return Promise.resolve();
    this.ctx.sets?.use(cs.stage ?? "yard");
    this.stage.setup({ actors: cs.actors, rook: null });
    this.view.hide();
    this.ctx.root.classList.add("in-cut");
    return new Promise((resolve) => {
      this.cut = { cs, t: 0, prev: -Infinity, resolve };
      this._cutStep(0);
    });
  }

  _cutStep(dt) {
    const c = this.cut, cs = c.cs;
    c.t = Math.min(cs.duration, c.t + dt);
    for (const e of eventsBetween(cs.events, c.prev, c.t)) {
      if ("caption" in e) this._caption(e.caption);
      if (e.sfx) this.ctx.sfx.play(e.sfx);
      if (e.show) this.stage.show(e.show, true);
      if (e.hide) this.stage.show(e.hide, false);
      if (e.move) this.stage.move(e.move.id, e.move.to[0], e.move.to[1], e.move.dur);
      if (e.pose) this.stage.pose(e.pose.id, e.pose.name);
      if (e.cue) this.ctx.sets?.cue(e.cue);
      if (e.fade) this._fade(e.fade === "out", 1);
    }
    c.prev = c.t;
    const cam = sampleCamera(cs.camera, c.t);
    this.ctx.camera.frame({ x: cam.pos[0], y: cam.pos[1], z: cam.pos[2] }, { x: cam.look[0], y: cam.look[1], z: cam.look[2] }, { fov: cam.fov, cut: true });
    if (c.t >= cs.duration) {
      this.cut = null;
      this.ctx.root.classList.remove("in-cut");
      this._caption(null);
      this.stage.clear();
      this._fade(false, 0.6);
      c.resolve();
    }
  }

  _caption(text) {
    const el = this.ui.caption;
    if (!el) return;
    if (!text) { el.classList.remove("show"); return; }
    el.textContent = text;
    el.className = `caption${CAPS.test(text) ? " caps" : ""}`;
    void el.offsetWidth; el.classList.add("show");
  }

  _fade(black, seconds) {
    const el = this.ui.fade;
    if (!el) return;
    el.style.transitionDuration = `${seconds}s`;
    el.classList.toggle("on", black);
  }

  async runFight(beat) {
    this._enterScene(false);
    this.stage.clear();
    this.ctx.sets?.use(beat.stage ?? "yard");
    const world = this.ctx.makeWorld({ ...this.ep.world, tokens: beat.tokens ?? this.ep.world?.tokens });
    for (;;) {
      world.resetPlayer();
      world.spawnWave(beat.wave);
      this.ctx.onEvents(world.drainEvents());
      this.fight = { beat, t: 0, hints: [...(beat.tutorial ?? [])], result: null, getUps: beat.getUps ?? 0, falls: 0 };
      for (const [who, text] of beat.lines ?? []) this.say(who, text); // squad chatter as the fight starts
      const won = await new Promise((res) => { this.fight.resolve = res; });
      this._hint("");
      if (won || !beat.retry) { this.fight = null; return { won }; }
      this.fight = null;
      this.say("Rook", beat.retry);
      await this.sleep(2.2);
    }
  }

  /** World events main.js forwards while a story fight runs. */
  onWorldEvent(ev) {
    const x = this.exploring;
    if (x?.combat && !this.fight) {
      if (ev.type === "waveClear") this._endCombat(true);
      if (ev.type === "playerDown") this._fallInField();
      return;
    }
    const f = this.fight;
    if (!f || f.done) return;
    const hint = f.beat.eventHints?.[ev.type];
    if (hint && !f.shown?.has(ev.type)) { (f.shown ??= new Set()).add(ev.type); this._showHint(hint); }
    if (ev.type === "waveClear") { f.done = true; this.sleep(0.4).then(() => f.resolve(true)); }
    if (ev.type === "playerDown") {
      f.falls++;
      if (f.getUps > 0) { // story duels: you can get back up a few times
        f.getUps--;
        this.flags.set(f.beat.countFlag ?? "GET_UPS", f.falls);
        const lines = f.beat.getUpLines ?? [];
        if (lines[f.falls - 1]) this.say(lines[f.falls - 1][0], lines[f.falls - 1][1]);
        this.sleep(1.8).then(() => { if (this.fight === f) { this.ctx.getWorld().revivePlayer(0.5); this.ctx.onEvents(this.ctx.getWorld().drainEvents()); } });
        return;
      }
      f.done = true; this.sleep(2.4).then(() => f.resolve(false));
    }
  }

  _tutorial(dt) {
    const f = this.fight;
    f.t += dt;
    if (f.hints.length && f.t >= f.hints[0].at) this._showHint(f.hints.shift().text);
    if (this.hintTimer > 0 && (this.hintTimer -= dt) <= 0) this._hint("");
  }

  /** A subtitle line during a fight, with the player's name and pronouns filled in. */
  say(speakerId, text) { this.ctx.hud.say(speakerName(speakerId, this.player.name), fillText(text, { ...this.player, flags: this.flags })); }

  /** A tutorial pill; {Light}, {Dodge}… become the current device's buttons. */
  _showHint(text) {
    const c = this.ctx.controls;
    const device = c.device === "keyboard" && !c.keyboardUsed && this.ctx.root.classList.contains("is-touch") ? "touch" : c.device;
    this._hint(text.replace(/\{(\w+)\}/g, (_, k) => `<b>${this.ctx.hud.label(device, k) ?? k}</b>`));
    this.hintTimer = 5.5;
  }

  _hint(html) {
    const el = this.ui.hint;
    if (!html) { el.classList.remove("show"); return; }
    el.innerHTML = html;
    el.classList.add("show");
  }

  async preview(beat) {
    this._enterScene(true);
    const pv = this.ui.preview;
    const lines = pv.querySelector("[data-pv-lines]"), next = pv.querySelector("[data-pv-next]"), buttons = pv.querySelector("[data-pv-buttons]");
    lines.innerHTML = beat.lines.map((l) => `<p>${l}</p>`).join("");
    next.textContent = beat.next ?? ""; next.classList.remove("on");
    buttons.innerHTML = "";
    pv.hidden = false;
    this.ctx.sfx.play("surgeFull");
    for (const p of lines.querySelectorAll("p")) { await this.sleep(0.9); p.classList.add("on"); }
    await this.sleep(0.9); next.classList.add("on");
    await this.sleep(0.4);
    const nextEp = beat.nextEpisode && this.episodeById(beat.nextEpisode);
    const choice = await new Promise((res) => {
      const add = (label, value, alt) => {
        const b = document.createElement("button");
        b.className = `go${alt ? " alt" : ""}`; b.textContent = label;
        b.addEventListener("click", () => { this.ctx.sfx.play("ui"); res(value); });
        buttons.appendChild(b);
      };
      if (nextEp) add(`PLAY EPISODE ${nextEp.number}`, "next");
      else add("TO BE CONTINUED", "title");
      add("EPISODE 4 RUN", "run", true);
      this.waitingCard = () => res(nextEp ? "next" : "title");
    });
    this.waitingCard = null;
    pv.hidden = true;
    this.pendingExit = choice === "next" ? { kind: "episode", id: beat.nextEpisode } : { kind: choice };
    return {};
  }
}

export { Stage };
