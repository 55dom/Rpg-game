// Story mode (Phase 3): plays an episode's beats on top of the combat game.
// Scenes stage actors and frame them with simple anime camera shots, dialogue runs from the
// Yarn-style scripts, fights reuse the combat world, and every beat autosaves.

import { Rig } from "./rig.js";
import { FlagStore } from "../core/flags.js";
import { parseScript, DialogueRunner } from "../core/script.js";
import { EpisodeDirector, validateEpisode, BeatType } from "../sim/episode.js";
import { CAST, speakerName } from "../data/story/cast.js";

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
    const r = beat.rook ?? { x: 0, z: -4, yaw: 0 };
    p.pos.x = p.prev.x = r.x; p.pos.z = p.prev.z = r.z; p.pos.y = p.prev.y = 0;
    p.yaw = p.prevYaw = r.yaw ?? 0; p.vel.x = p.vel.y = p.vel.z = 0;
    p.relaxed = true;
    for (const c of beat.cast ?? []) {
      const actor = makeActor(c.x, c.z, c.yaw ?? 0, c.down);
      const rig = new Rig(this.scene, c.look, `story-${c.id}`);
      this.actors.set(c.id, { actor, rig, look: c.look });
    }
  }

  clear() {
    const p = this.getWorld()?.player;
    if (p) p.relaxed = false;
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

  update(dt) {
    for (const { actor, rig } of this.actors.values()) {
      actor.prevYaw = actor.yaw;
      actor.yaw += wrap(actor.targetYaw - actor.yaw) * Math.min(1, dt * 5);
      actor.prevYaw = actor.yaw;
      rig.update(actor, 1, dt);
      if (actor.down) { rig.root.rotation.x = -1.45; rig.root.position.y = 0.32; } // lying on their back
    }
  }

  /** Camera framings. Returns { pos, look, fov } or null. */
  shot(kind, ids = []) {
    const pts = [this.getWorld().player, ...[...this.actors.values()].map((a) => a.actor)];
    if (kind === "wide") {
      let cx = 0, cz = 0;
      for (const p of pts) { cx += p.pos.x; cz += p.pos.z; }
      cx /= pts.length; cz /= pts.length;
      const span = Math.max(...pts.map((p) => Math.hypot(p.pos.x - cx, p.pos.z - cz)));
      const d = 5 + span * 1.3;
      return { pos: { x: cx + d * 0.35, y: 2.6 + span * 0.25, z: cz - d }, look: { x: cx, y: 1.3, z: cz + 1 }, fov: 0.8 };
    }
    if (kind === "on") {
      const a = this.get(ids[0]);
      if (!a) return null;
      const scale = a === this.getWorld().player ? 1 : this.actors.get(ids[0])?.rig.look.scale ?? 1;
      const down = !!a.down;
      const look = { x: a.pos.x, y: down ? 0.4 : 1.75 * scale, z: a.pos.z };
      // Try a few angles around the subject and keep the one with the clearest line of sight.
      const others = pts.filter((p) => p !== a);
      let best = null, bestScore = -1;
      for (const off of down ? [1.6, -1.6, 2.4, -2.4] : [0.3, -0.3, 0.7, -0.7, 1.1, -1.1]) {
        const ang = a.yaw + off, dist = down ? 3.3 : 2.7;
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
      const back = 1.5 + sep * 0.25;
      const pos = { x: b.pos.x - ux * back + rx * 0.95, y: 2.05, z: b.pos.z - uz * back + rz * 0.95 };
      const look = { x: a.pos.x - ux * 0.3, y: 1.6, z: a.pos.z - uz * 0.3 };
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
  constructor(ctx, episodes) {
    this.ctx = ctx;
    this.episodes = episodes; // [{ episode, script }]
    this.nodes = {};
    for (const { episode, script } of episodes) {
      Object.assign(this.nodes, parseScript(script, episode.id));
      validateEpisode(episode, this.nodes);
    }
    this.flags = new FlagStore();
    this.player = { name: "Rook", pronouns: "they" };
    this.stage = new Stage(ctx.scene, ctx.getWorld);
    this.view = new DialogueView(ctx.root, ctx.sfx);
    const r = ctx.root;
    this.ui = {
      story: r.querySelector("[data-story]"), cold: r.querySelector("[data-coldopen]"), coldText: r.querySelector("[data-co-text]"),
      title: r.querySelector("[data-titlecard]"), preview: r.querySelector("[data-preview]"), hint: r.querySelector("[data-hint]"),
      skip: r.querySelector("[data-skip]"),
    };
    this.ui.skip.addEventListener("click", (e) => { e.stopPropagation(); this.skipping = true; this.view.advance(); });
    for (const el of [this.ui.cold, this.ui.title]) el.addEventListener("click", () => this.confirm());
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
    this.view.update(dt, this.skipping);
    if (this.skipping && !this.view.typing && this.view.waiting) this.view.advance();
    this.stage.update(dt);
    if (this.fight) this._tutorial(dt);
  }

  /** Light / Enter / tap while a scene or card is up. */
  confirm() {
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
    if (this.active) this.autosave();
  }

  autosave() {
    if (!this.director) return;
    const { episode, beat } = this.director.done ? { episode: this.ep.id, beat: this.ep.beats.length } : this.director.resumePoint;
    this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), episode, beat });
  }

  stop() {
    this.active = false; this.blocking = false; this.fight = null; this.skipping = false;
    this.timers.length = 0;
    this.stage.clear(); this.view.hide();
    for (const el of [this.ui.cold, this.ui.title, this.ui.preview]) el.hidden = true;
    this._hint("");
    this.ctx.root.classList.remove("in-scene");
    this.ctx.camera.release();
  }

  async runBeat(beat) {
    switch (beat.type) {
      case BeatType.ColdOpen: return this.coldOpen(beat);
      case BeatType.Title: return this.titleCard();
      case BeatType.Scene: return this.scene(beat);
      case BeatType.Fight: return this.runFight(beat);
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
    if (s.speaker) this._autoFrame(cast?.actor);
    if (cast?.actor) {
      const cur = this.currentShot;
      const other = cur.kind === "two" && cur.ids.includes(cast.actor) ? cur.ids.find((i) => i !== cast.actor) : null;
      this.stage.lookAt(cast.actor, other);
    }
    const name = s.speaker ? speakerName(s.speaker, this.player.name).toUpperCase() : null;
    await this.view.line(name, cast?.color, s.text);
  }

  /** Cut to the speaker unless the current shot already shows them. */
  _autoFrame(actorId) {
    if (!actorId || this.stage.get(actorId) == null) return;
    const cur = this.currentShot;
    if (cur.kind === "two" && cur.ids[1] === actorId) { this._shot("two", [cur.ids[1], cur.ids[0]]); return; } // reverse angle
    if (cur.kind === "wide" || (cur.kind === "two" && cur.ids[0] === actorId) || (cur.kind === "on" && cur.ids[0] === actorId)) return;
    this._shot("on", [actorId]);
  }

  _shot(kind, ids, cut = true) {
    const sh = this.stage.shot(kind, ids);
    if (!sh) return;
    this.currentShot = { kind, ids };
    this.ctx.camera.frame(sh.pos, sh.look, { fov: sh.fov, cut });
  }

  async command(name, args) {
    const actorOf = (n) => CAST[n]?.actor ?? n;
    switch (name) {
      case "shot": {
        const [kind, ...who] = args;
        this._shot(kind, who.map(actorOf), kind !== "wide");
        break;
      }
      case "wait": await this.sleep(this.skipping ? 0 : Number(args[0]) || 0.5); break;
      case "sfx": this.ctx.sfx.play(args[0]); break;
      case "fx": await this.fx(args); break;
      case "set": break; // flags are handled by the runner
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
    if (kind === "book") {
      const a = this.stage.get(CAST[who]?.actor ?? who);
      if (!a) return;
      const { vfx, sfx } = this.ctx;
      const at = { x: a.pos.x, y: 2.4, z: a.pos.z };
      vfx.flash(at, 2.6, "#fff2cf", 0.5);
      vfx.ring({ x: a.pos.x, y: 0.06, z: a.pos.z }, 4, "#e6b54e", 0.6);
      vfx.sparksAt(at, 14, "gold", 4, 4);
      sfx.play("surgeFull");
      await this.sleep(this.skipping ? 0 : 0.6);
    }
  }

  async runFight(beat) {
    this._enterScene(false);
    this.stage.clear();
    const world = this.ctx.makeWorld({ ...this.ep.world, tokens: beat.tokens ?? this.ep.world?.tokens });
    for (;;) {
      world.resetPlayer();
      world.spawnWave(beat.wave);
      this.ctx.onEvents(world.drainEvents());
      this.fight = { beat, t: 0, hints: [...(beat.tutorial ?? [])], result: null };
      const won = await new Promise((res) => { this.fight.resolve = res; });
      this._hint("");
      if (won || !beat.retry) { this.fight = null; return { won }; }
      this.fight = null;
      this.ctx.hud.say("Rook", beat.retry);
      await this.sleep(2.2);
    }
  }

  /** World events main.js forwards while a story fight runs. */
  onWorldEvent(ev) {
    const f = this.fight;
    if (!f || f.done) return;
    if (ev.type === "waveClear") { f.done = true; this.sleep(0.4).then(() => f.resolve(true)); }
    if (ev.type === "playerDown") { f.done = true; this.sleep(2.4).then(() => f.resolve(false)); }
  }

  _tutorial(dt) {
    const f = this.fight;
    f.t += dt;
    if (f.hints.length && f.t >= f.hints[0].at) {
      const h = f.hints.shift();
      const c = this.ctx.controls;
      const device = c.device === "keyboard" && !c.keyboardUsed && this.ctx.root.classList.contains("is-touch") ? "touch" : c.device;
      const text = h.text.replace(/\{(\w+)\}/g, (_, k) => `<b>${this.ctx.hud.label(device, k) ?? k}</b>`);
      this._hint(text);
      this.hintTimer = 5.5;
    }
    if (this.hintTimer > 0 && (this.hintTimer -= dt) <= 0) this._hint("");
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
