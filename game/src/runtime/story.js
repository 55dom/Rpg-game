// Story mode (Phase 3): plays an episode's beats on top of the combat game.
// Scenes stage actors and frame them with simple anime camera shots, dialogue runs from the
// Yarn-style scripts, fights reuse the combat world, and every beat autosaves.

import { Rig } from "./rig.js";
import { FlagStore } from "../core/flags.js";
import { parseScript, DialogueRunner, fillText } from "../core/script.js";
import { EpisodeDirector, validateEpisode, BeatType, objectiveCount } from "../sim/episode.js";
import { Siege } from "../sim/siege.js";
import { CAST, speakerName } from "../data/story/cast.js";
import { maskIntegrity } from "../data/masked.js";
import { CUTSCENES } from "../data/story/cutscenes.js";
import { validateCutscene, sampleCamera, eventsBetween, sampleMove } from "../core/timeline.js";
import { wideShot, closeUp, segDist } from "../core/framing.js";
import { B, toon2, glow, color3 } from "./look.js";
import { makeTear, makeDoor, makeVoid } from "./tears.js";
import { GuideTrail } from "./trail.js";
import { theatreMark, theatreNotes } from "../data/theatre.js";
import { findPath, trailMarks, guideTarget } from "../sim/guide.js";
import { ZONES, arrivalPoint } from "../data/zones.js";
import { Inventory } from "../core/inventory.js";
import { Progress } from "../core/progress.js";
import { Bonds } from "../core/bonds.js";
import { Crafting } from "../core/crafting.js";
import { BONDS, BOND_GAIN } from "../data/bonds.js";
import { EPISODE_XP, QUEST_XP } from "../data/skills.js";
import { EPISODE_REWARD } from "../data/items.js";
import { QuestLog } from "../core/quests.js";
import { QUESTS } from "../data/quests.js";
import { compileExpr, truthy } from "../core/flags.js";
import { inRect, YARD } from "../sim/bounds.js";
import { Ambient } from "./ambient.js";
import { WorldClock } from "../sim/weather.js";
import { RainFX } from "./weather.js";
import { LawWatch } from "./law.js";
import { makeSentries, stepSentries, SENTRY } from "../sim/sentry.js";

/** Gesture poses for dialogue: weapon-arm and off-arm rotations, a bow, a head tilt. */
const GESTURES = Object.freeze({
  none: {},
  point: { arm: [0.05, 0.1, 0] },
  raise: { arm: [-1.2, 0.75, 0] }, // up and out to the side, so it never crosses the face in a close-up
  hand: { arm: [0.55, -0.65, 0] },              // holding something in front of the chest
  cross: { arm: [0.85, -1.15, 0], off: [-0.5, 0, 1.25] },
  bow: { bow: 0.38 },
  tilt: { tilt: -0.2 },
  sit: { arm: [0.75, -0.3, 0], bow: 0.05, seated: 0.5 },   // on a bunk, a bench
  kneel: { arm: [0.6, -0.4, 0], bow: 0.32, seated: 0.42 }, // down on one knee, head bowed
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
// The follow camera's limits for a zone. Indoors it stays in the room: from behind a wall (which isn't drawn from
// outside) whatever hangs on it, a banner or a shelf, would fill the screen.
const cameraBounds = (zone) => (zone.interior ? { ...zone.bounds, interior: true } : zone.bounds);

/** Actors on the current set, plus the shot math for scenes. */
class Stage {
  constructor(scene, getWorld) {
    this.scene = scene;
    this.getWorld = getWorld;
    this.actors = new Map(); // id → { actor, rig }
  }

  setup(beat) {
    this.clear();
    // The set's walls, for close-ups: an episode beat on a zone's set (or the zone it names) has that zone's walls.
    const zone = beat.zone ?? Object.values(ZONES).find((z) => z.stage === (beat.stage ?? "yard") && !z.roamOnly); // free roam passes the zone itself
    this.walls = zone ? { ...zone.bounds, interior: !!zone.interior } : null;
    const p = this.getWorld().player;
    const r = beat.rook === undefined ? { x: 0, z: -4, yaw: 0 } : beat.rook;
    this.setPlayerVisible?.(!!r); this.playerHidden = !r;
    this.setSquadVisible?.(false); // scenes stage their own Bas and Juno; hide the fighting copies
    if (r) {
      p.pos.x = p.prev.x = r.x; p.pos.z = p.prev.z = r.z; p.pos.y = p.prev.y = 0;
      p.yaw = p.prevYaw = r.yaw ?? 0; p.vel.x = p.vel.y = p.vel.z = 0;
    }
    p.relaxed = true;
    if (beat.rookStars != null) this.playerStar = { stars: beat.rookStars }; // what the King sees over you (Ep 49)
    for (const c of (beat.cast ?? beat.actors ?? []).filter((c) => !c.when || !this.when || this.when(c.when))) this.add(c); // `when`: only if the story says they're here
  }

  /** Put someone on the set: { id, look, x, z, yaw?, y?, down?, hidden?, crowd? }. */
  add(c) {
    const actor = makeActor(c.x, c.z, c.yaw ?? 0, c.down);
    actor.pos.y = actor.prev.y = c.y ?? 0;
    const rig = new Rig(this.scene, c.look, `story-${c.id}`);
    if (c.hidden) { rig.setVisible(false); actor.hiddenActor = true; }
    this.actors.set(c.id, { actor, rig, look: c.look, crowd: !!c.crowd, stars: c.stars });
    if (c.pose) this.pose(c.id, c.pose); // sitting at a bench, kneeling, a hand up
    if (this.starsOn && c.stars != null) this._starOver(c.id);
    return actor;
  }

  /**
   * What the King sees (Backlash, Ep 49): a star over everyone's head, or a hollow one where there's nothing left.
   * Cast entries carry `stars`; <<stars on|off>> shows them, <<star X n>> changes one.
   */
  showStars(on) {
    this.starsOn = on;
    for (const [id, a] of this._starred()) { if (on && a.stars != null) this._starOver(id); else { a.starMesh?.dispose(false, true); a.starMesh = null; } }
  }

  setStars(id, n) {
    const a = id === "player" ? (this.playerStar ??= {}) : this.actors.get(id);
    if (!a) return;
    a.stars = n;
    if (this.starsOn) this._starOver(id);
  }

  /** Everyone who can carry a star: the cast, and the player (a scene's `rookStars`). */
  _starred() { return [...this.actors, ...(this.playerStar ? [["player", this.playerStar]] : [])]; }

  _starOver(id) {
    const a = id === "player" ? this.playerStar : this.actors.get(id), BB = B(), n = a.stars;
    const root = id === "player" ? this.playerRoot?.() : a.rig.root;
    a.starMesh?.dispose(false, true); a.starMesh = null;
    if (!root) return;
    const w = Math.max(1, n), tex = new BB.DynamicTexture(`stars-${id}`, { width: 96 * w, height: 96 }, this.scene, true), c = tex.getContext();
    c.clearRect(0, 0, 96 * w, 96);
    for (let k = 0; k < w; k++) { // a five-pointed star, drawn (no font needed): filled gold, or only its outline
      c.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 42, t = (i / 10) * Math.PI * 2 - Math.PI / 2; c[i ? "lineTo" : "moveTo"](48 + k * 96 + Math.cos(t) * r, 50 + Math.sin(t) * r); }
      c.closePath();
      if (n > 0) { c.fillStyle = "#ffd36a"; c.fill(); } else { c.strokeStyle = "#ffe8b0"; c.lineWidth = 5; c.stroke(); }
    }
    tex.hasAlpha = true; tex.update();
    const mat = new BB.StandardMaterial(`starsM-${id}`, this.scene);
    mat.diffuseTexture = tex; mat.emissiveTexture = tex; mat.opacityTexture = tex; mat.disableLighting = true; mat.backFaceCulling = false;
    const plane = BB.MeshBuilder.CreatePlane(`stars-${id}`, { width: 0.36 * w, height: 0.36 }, this.scene);
    plane.material = mat; plane.billboardMode = BB.Mesh.BILLBOARDMODE_ALL; plane.isPickable = false;
    plane.parent = root; plane.position.set(0, 2.65, 0);
    a.starMesh = plane;
  }

  /** Walk an actor to (x, z) over `dur` seconds (or at walking pace). */
  move(id, x, z, dur, y = null, ease = "inOut", back = false) {
    const a = this.get(id);
    if (!a) return 0;
    const d = Math.hypot(x - a.pos.x, z - a.pos.z);
    const time = dur ?? Math.max(0.4, d / 2.4);
    a.move = { from: [a.pos.x, a.pos.z], to: [x, z], t: 0, dur: time, y: y == null ? null : [a.pos.y ?? 0, y], ease }; // y: up a step, down off a throne; "linear": a steady march
    if (d > 0.05 && !back) { // thrown back (or lifted straight up), they keep facing the way they were
      a.targetYaw = Math.atan2(x - a.pos.x, z - a.pos.z);
      if (a === this.getWorld().player) a.yaw = a.prevYaw = a.targetYaw;
    }
    return time;
  }

  pose(id, name) {
    const a = this.get(id);
    const g = GESTURES[name] ?? GESTURES.none;
    if (!a) return;
    if (name === "down" || name === "up") { a.down = name === "down"; return; } // on the ground, flat on their back (and up again)
    a.armPose = g.arm ?? null; a.offPose = g.off ?? null; a.bow = g.bow ?? 0; a.headTilt = g.tilt ?? 0;
    if ("seated" in g || name === "none") a.seated = g.seated ?? 0; // a hand raised doesn't get you out of your chair
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
    if (p) { p.relaxed = false; p.armPose = p.offPose = null; p.bow = p.headTilt = p.seated = 0; p.move = null; }
    this.setPlayerVisible?.(true);
    this.setSquadVisible?.(true);
    for (const { rig, starMesh } of this.actors.values()) { starMesh?.dispose(false, true); rig.dispose(); }
    this.actors.clear();
    this.playerStar?.starMesh?.dispose(false, true); this.playerStar = null;
    this.starsOn = false;
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
      if (actor.down) { rig.root.rotation.x = -1.45; rig.root.position.y = (actor.pos.y ?? 0) + 0.32; } // lying on their back (or carried, held up off the ground)
      if (actor.talking) { rig.body.rotation.y += Math.sin(time * 5.5) * 0.06; if (rig.head !== rig.shoulder) rig.head.rotation.x = Math.sin(time * 8.5) * 0.06; }
      else if (rig.head !== rig.shoulder) rig.head.rotation.x = 0;
    }
  }

  _step(a, dt) {
    const m = a.move;
    m.t += dt;
    const [x, z] = sampleMove(m.from, m.to, 0, m.dur, m.t, m.ease);
    a.prev.x = a.pos.x = x; a.prev.z = a.pos.z = z;
    if (m.y) a.prev.y = a.pos.y = m.y[0] + (m.y[1] - m.y[0]) * Math.min(1, m.t / m.dur);
    const moving = m.t < m.dur;
    const speed = moving ? Math.hypot(m.to[0] - m.from[0], m.to[1] - m.from[1]) / m.dur : 0;
    a.vel.x = Math.sin(a.targetYaw ?? a.yaw) * speed; a.vel.z = Math.cos(a.targetYaw ?? a.yaw) * speed;
    if (!moving) { a.move = null; a.vel.x = a.vel.z = 0; }
  }

  /** Camera framings. Returns { pos, look, fov } or null. */
  shot(kind, ids = []) {
    const pts = [this.getWorld().player, ...[...this.actors.values()].map((a) => a.actor)];
    if (kind === "wide") { // ids[0]: "front" looks back from the far side of the set, "side" from the right (core/framing.js)
      const vis = pts.filter((p) => !p.hiddenActor && !(p === this.getWorld().player && this.playerHidden));
      if (!vis.length) return null;
      const entry = (p) => [...this.actors.values()].find((a) => a.actor === p);
      return wideShot(vis.map((p) => ({ x: p.pos.x, z: p.pos.z, y: p.pos.y ?? 0, scale: entry(p)?.rig.look.scale ?? 1, crowd: !!entry(p)?.crowd })), ids[0], this.walls);
    }
    if (kind === "sky") { // <<shot sky x y z>>: low, just behind everyone, looking up at something in the sky (Ep 46: the Gate)
      const [tx, ty, tz] = ids.map(Number);
      const vis = pts.filter((p) => !p.hiddenActor && !(p === this.getWorld().player && this.playerHidden));
      const c = vis.length ? vis.reduce((m, p) => ({ x: m.x + p.pos.x / vis.length, z: m.z + p.pos.z / vis.length }), { x: 0, z: 0 }) : { x: 0, z: 0 };
      const dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz) || 1;
      return { pos: { x: c.x - (dx / d) * 4.5, y: 1.1, z: c.z - (dz / d) * 4.5 }, look: { x: tx, y: ty, z: tz }, fov: 0.78 };
    }
    if (kind === "board") { // <<shot board>>: high over the set, looking down on everyone like pieces on a board (Ep 50)
      const vis = pts.filter((p) => !p.hiddenActor && !(p === this.getWorld().player && this.playerHidden));
      const c = vis.length ? vis.reduce((m, p) => ({ x: m.x + p.pos.x / vis.length, z: m.z + p.pos.z / vis.length }), { x: 0, z: 0 }) : { x: 0, z: 0 };
      return { pos: { x: c.x, y: 26, z: c.z - 4 }, look: { x: c.x, y: 0, z: c.z }, fov: 0.85 };
    }
    if (kind === "eye") { // <<shot eye X [Y]>>: through X's eyes (Ep 49: the King's), at Y, or down and ahead of them
      const a = this.get(ids[0]);
      if (!a) return null;
      const sc = a === this.getWorld().player ? 1 : this.actors.get(ids[0])?.rig.look.scale ?? 1, yaw = a.targetYaw ?? a.yaw;
      const sit = a.seated ? Math.max(0, (0.86 - a.seated / sc) * sc) : 0; // as core/framing.js closeUp
      const eye = { x: a.pos.x + Math.sin(yaw) * 0.5 * sc, y: (a.pos.y ?? 0) + 1.9 * sc - sit, z: a.pos.z + Math.cos(yaw) * 0.5 * sc };
      const t = ids[1] ? this.get(ids[1]) : null;
      const look = t ? { x: t.pos.x, y: (t.pos.y ?? 0) + 2.1, z: t.pos.z } : { x: eye.x + Math.sin(yaw) * 12, y: eye.y - 2.4, z: eye.z + Math.cos(yaw) * 12 };
      return { pos: eye, look, fov: t ? 0.42 : 0.9 };
    }
    if (kind === "on") { // in front of their face, clear of everyone else and inside the set's walls (core/framing.js)
      const a = this.get(ids[0]);
      if (!a) return null;
      const scale = a === this.getWorld().player ? 1 : this.actors.get(ids[0])?.rig.look.scale ?? 1;
      return closeUp({ x: a.pos.x, z: a.pos.z, y: a.pos.y ?? 0, yaw: a.targetYaw ?? a.yaw, scale, down: !!a.down, seated: a.seated ?? 0 },
        pts.filter((p) => p !== a).map((p) => p.pos), this.walls);
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
      const back = 1.8 + sep * 0.25 + (sb - 1) * 1.5;
      const side = 1.3 + (wide - 1) * 0.9; // far enough to the side that the near shoulder frames the shot instead of filling it
      const pos = { x: b.pos.x - ux * back + rx * side, y: 2.05 * sb + (b.pos.y ?? 0), z: b.pos.z - uz * back + rz * side };
      const sa = a === this.getWorld().player ? 1 : this.actors.get(ids[0])?.rig.look.scale ?? 1;
      const look = { x: a.pos.x - ux * 0.3, y: 1.82 * sa + (a.pos.y ?? 0), z: a.pos.z - uz * 0.3 }; // their face, whatever their height
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

  /** timer: seconds to choose, or 0. When it runs out, the last choice is taken (Ep 48: the memory, under the glaive). */
  options(opts, timer = 0) {
    this.more.hidden = true;
    this.sel = opts.findIndex((o) => o.enabled);
    this.choices.innerHTML = "";
    this.timeMax = this.timeLeft = timer;
    opts.forEach((o, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.textContent = o.text; b.dataset.n = String(i + 1); b.disabled = !o.enabled;
      b.addEventListener("click", (e) => { e.stopPropagation(); if (o.enabled) this.pick(i); });
      li.appendChild(b); this.choices.appendChild(li);
    });
    this.opts = opts;
    if (timer > 0) { const li = document.createElement("li"); li.className = "choice-timer"; li.innerHTML = "<i></i>"; this.choices.appendChild(li); this.timerBar = li.firstChild; }
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
    if (this.choosing && this.timeLeft > 0) {
      this.timeLeft -= dt;
      if (this.timerBar) this.timerBar.style.width = `${Math.max(0, (this.timeLeft / this.timeMax) * 100)}%`;
      if (this.timeLeft <= 0) { const last = this.opts.map((o, i) => (o.enabled ? i : -1)).filter((i) => i >= 0).pop(); this.pick(last); }
    }
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
    this.progress = new Progress();
    this.bonds = new Bonds(this.flags); // bond state lives in the flags
    this.quests = new QuestLog(QUESTS, this.flags, {
      onReward: (q, r) => { if (r.marks) this.inventory.earn(r.marks); this.gainXp(r.xp ?? QUEST_XP); for (const [id, n] of Object.entries(r.bond ?? {})) this.bondGain(id, n); },
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
    this.stage.when = (cond) => truthy(compileExpr(cond)(this.flags));
    this.stage.setPlayerVisible = (on) => ctx.setPlayerVisible?.(on);
    this.stage.playerRoot = () => ctx.playerRoot?.();
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
    this.law = new LawWatch(this); // free roam: crimes, witnesses, the Watch (runtime/law.js)
    r.querySelector("[data-steal]")?.addEventListener("click", (e) => { e.stopPropagation(); this.law.pickpocket(); });
    r.querySelector("[data-surrender]")?.addEventListener("click", (e) => { e.stopPropagation(); this.law.surrender(); });
  }

  episodeById(id) { return this.episodes.find((e) => e.episode.id === id)?.episode; }

  // ---- timers driven by the render loop (they pause with the game) ----
  sleep(s) { return new Promise((res) => this.timers.push({ t: s, res })); }

  update(dt, paused) {
    if (!paused) for (let i = this.timers.length - 1; i >= 0; i--) { const t = this.timers[i]; t.t -= dt; if (t.t <= 0) { this.timers.splice(i, 1); t.res(); } }
    if (paused) return;
    this.time += dt;
    this.view.update(dt, this.skipping);
    if (this.clash) this.clash.update(dt);
    if (this.skipping && !this.view.typing && this.view.waiting) this.view.advance();
    for (const a of this.stage.actors.values()) a.actor.talking = a.actor === this.talker && this.view.typing;
    this.stage.update(dt, this.time);
    this._occlusion();
    this._frameBias();
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      tw.t += dt;
      tw.fn(Math.min(1, tw.t / tw.dur));
      if (tw.t >= tw.dur) { this.tweens.splice(i, 1); tw.done?.(); }
    }
    if (this.cut) this._cutStep(dt);
    if (this.theatre) this._theatreTick();
    if (this.fight) this._tutorial(dt);
    if (this.fight && this.siege) this._siegeTick();
    if (this.roaming && this.clock && this.exploring) this._weatherTick(dt);
    else if (this.ep) { // an episode: the street keeps clear of the story (passers-by walked through close-ups and duels)
      const set = this.ctx.sets?.built?.get(this.ctx.sets.current), p = this.ctx.getWorld().player.pos;
      if (set) set.mood = { density: this.fight || this.exploring?.combat ? 0 : this.exploring ? 0.6 : 0.15, player: { x: p.x, z: p.z } };
    }
    if (this.ambient && this.exploring) { // townsfolk go about their day (runtime/ambient.js)
      const p = this.ctx.getWorld().player, x = this.exploring;
      this.ambient.update({ dt, player: { x: p.pos.x, z: p.pos.z, moving: Math.hypot(p.vel.x, p.vel.z) > 0.4 }, combat: x.combat?.at ?? null,
        raining: !!this.weather?.raining, night: !!this.weather?.night, busy: x.busy });
    }
    if (this.roaming && this.exploring) this.law.tick(dt);
    if (this.exploring) this._exploreTick(dt);
    this._guideTick(dt);
  }

  /**
   * The floor trail (runtime/trail.js): on an episode's walk-around, arrows on the ground lead to the nearest
   * person or thing the beat still needs, around buildings. Gone while you talk or fight, or once you're there.
   */
  _guideTick(dt) {
    const x = this.exploring;
    if (!x && !this.trail) return;
    const scene = this.ctx.scene;
    if (!scene || !globalThis.BABYLON) return;
    this.trail ??= new GuideTrail(scene);
    const g = this.guide ??= { t: 0, id: null, from: null, to: null, marks: [] };
    let on = false;
    if (x && !this.roaming && !x.busy && !x.combat && x.beat.guide !== false && x.beat.required?.length) {
      const p = this.ctx.getWorld().player.pos;
      const goal = guideTarget(p, x.beat.required, x.talked, (id) => {
        const pk = x.pickups.find((q) => q.id === id);
        if (pk) return truthy(pk.cond(this.flags)) ? { x: pk.x, z: pk.z } : null;
        const a = this.stage.get(id);
        return a && !a.hiddenActor ? { x: a.pos.x, z: a.pos.z } : null;
      });
      on = !!goal && goal.d > 2.1; // close enough: the talk prompt takes over
      g.t -= dt;
      const moved = (a, b, k) => !a || Math.hypot(a.x - b.x, a.z - b.z) > k;
      if (on && g.t <= 0 && (goal.id !== g.id || moved(g.from, p, 0.6) || moved(g.to, goal, 0.5))) {
        g.t = 0.25; g.id = goal.id; g.from = { x: p.x, z: p.z }; g.to = { x: goal.x, z: goal.z };
        const path = findPath(g.from, g.to, this.ctx.getWorld().bounds);
        g.marks = trailMarks(path, { max: this.trail.max });
        const pk = x.pickups.find((q) => q.id === goal.id);
        this.trail.set(g.marks, pk && pk.marker !== false ? null : g.to); // a glowing pickup already marks its spot
      }
    }
    this.trail.show(on);
    this.trail.update(dt);
  }

  // ---- Lore Archive · Theatre (GDD §15.10): replay a watched scene from its timeline ----
  /** The scene clock this frame: the Theatre can slow it, pause it, or step it one frame at a time. */
  sceneDt(dt) {
    const th = this.theatre;
    if (!th) return dt;
    if (th.paused) { const s = th.step; th.step = 0; return s; }
    return dt * th.speed;
  }

  /** Play a watched cutscene again (from the EPISODES & SAVES screen). Resolves when the viewer leaves. */
  async replay(id) {
    if (!CUTSCENES[id]) return;
    const th = this.theatre = { id, speed: 1, paused: false, step: 0, restart: false, exit: false, notes: theatreNotes(id, this.flags) };
    theatreMark(id, "rewatch");
    this.active = true;
    this._enterScene(true); // no fight controls or HUD over the scene
    this.ctx.root.classList.add("theatre");
    this.ctx.onTheatre?.(th);
    for (;;) {
      await this.playCutscene(id);
      if (th.restart && !th.exit) { th.restart = false; continue; }
      break;
    }
    this.theatre = null; this.active = false;
    this._enterScene(false);
    this.ctx.root.classList.remove("theatre");
    this.ctx.onTheatre?.(null);
  }

  theatreControl(cmd, value) {
    const th = this.theatre;
    if (!th) return;
    if (cmd === "pause") th.paused = !th.paused;
    if (cmd === "step") { th.paused = true; th.step = 1 / 30; } // one frame forward
    if (cmd === "speed") { th.speed = value; th.paused = false; }
    if (cmd === "restart" && this.cut) { th.restart = true; this.cut.t = this.cut.cs.duration; th.paused = false; }
    if (cmd === "exit" && this.cut) { th.exit = true; this.cut.t = this.cut.cs.duration; th.paused = false; th.step = 0; }
    this.ctx.onTheatre?.(th);
  }

  /** Margin notes (the Annotated Edition) appear at their moments, if this edition is open. */
  _theatreTick() {
    const th = this.theatre, c = this.cut;
    if (!c || !th.notes.length) return;
    const note = th.notes.filter((n) => c.t >= n.t && c.t < n.t + (n.dur ?? 3)).at(-1) ?? null;
    if (note !== th.note) { th.note = note; this.ctx.onTheatre?.(th); }
  }

  /** Light / Enter / tap while a scene or card is up. */
  confirm() {
    if (this.clash) { this.clash.press(); return; } // the Clash takes every press (timed, never mashed)
    if (this.theatre) { this.theatreControl("pause"); return; } // in the Theatre, a tap pauses
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
    // Starting a later chapter directly: what the earlier story would have left behind (never overwrites what it did).
    for (const [k, v] of Object.entries(ep.setup ?? {})) if (!this.flags.has(k)) this.flags.set(k, v);
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
      this.flags.add("REP_SQUAD", 2); this.flags.add("RENOWN_AURELIN", 1); // a mission done: word gets around (GDD §12.3)
      this.inventory.earn(EPISODE_REWARD);
      this.gainXp(EPISODE_XP);
    }
    if (this.active) this.autosave();
  }

  /** A bond grows (talks, gifts, fights, quests); the host shows it. */
  bondGain(id, n) {
    const r = this.bonds.add(id, n);
    if (r.gained || r.rankUp) this.ctx.onBond?.(id, r);
    return r;
  }
  get day() { return this.clock?.day ?? 1; }
  /** Materials, tempering and HQ rooms (follows the current inventory, which is replaced on load). */
  get crafting() { if (this._crafting?.inventory !== this.inventory) this._crafting = new Crafting(this.flags, this.inventory); return this._crafting; }

  /** Rook earns XP (fights, quests, episodes); the host shows level-ups. */
  gainXp(n, at = null) {
    if (!n) return 0;
    const levels = this.progress.gainXp(n);
    this.ctx.onXp?.(n, levels, at);
    return levels;
  }

  /** The current resume point as a save record (for the slots menu). */
  snapshot() {
    if (!this.director || !this.ep) return null;
    const { episode, beat } = this.director.done ? { episode: this.ep.id, beat: this.ep.beats.length } : this.director.resumePoint;
    return { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), prog: this.progress.toJSON(), episode, beat };
  }

  autosave() {
    if (!this.director) return;
    this.ctx.saves.reach(this.ep.number + (this.director.done ? 1 : 0));
    const { episode, beat } = this.director.done ? { episode: this.ep.id, beat: this.ep.beats.length } : this.director.resumePoint;
    this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), prog: this.progress.toJSON(), episode, beat });
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
    this.ctx.setMemory?.(false, true);
    this.ctx.camera.release();
  }

  async runBeat(beat) {
    this.ctx.setMemory?.(!!(beat.memory ?? this.ep?.memory), true); // inside a memory (Ep 49): ash grey, the red kept (runtime/grade.js)
    if (beat.fresh) this.ctx.makeWorld({ ...this.ep?.world }); // back in your own body after wearing someone else's (Ep 50)
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
    if (!on) { this.view.hide(); this.ctx.camera.release(); this.currentShot = null; this._occlusion(); }
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
    this.ctx.sets?.use(beat.stage ?? "yard"); this._refreshSet(); this._sky(beat); // set pieces follow the story (a cairn, a wreck…)
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
        const shown = s.options.filter((o) => o.enabled || !o.tags?.includes("secret")); // #secret: a line you only see if you've earned it
        const i = await this.view.options(shown, this.choiceTimer ?? 0);
        this.choiceTimer = 0;
        r.choose(shown[i].index);
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
      const other = cur?.kind === "two" && cur.ids.includes(cast.actor) ? cur.ids.find((i) => i !== cast.actor) : null; // no shot yet: a voice through a door
      this.stage.lookAt(cast.actor, other);
    }
    if (s.speaker) this._autoFrame(cast?.actor);
    const name = s.speaker ? speakerName(s.speaker, this.player.name, this.flags).toUpperCase() : null;
    if (cast?.voice === "mask" && !this.skipping) this.ctx.sfx?.maskVoice?.(maskIntegrity(Number(this.flags.get("SABLE_ENCOUNTER")) || 0), 2 + Math.min(3, Math.floor(s.text.length / 28)));
    await this.view.line(name, cast?.color, s.text);
  }

  /** Cut to the speaker unless the current shot already shows them. */
  _autoFrame(actorId) {
    if (!actorId || this.stage.get(actorId) == null) return;
    const cur = this.currentShot;
    if (!cur) { this._shot("on", [actorId]); return; }
    if (cur.kind === "two" && cur.ids[1] === actorId) { this._shot("two", [cur.ids[1], cur.ids[0]]); return; } // reverse angle
    if (cur.kind === "on" && cur.ids[0] === actorId) { // re-aim if they turned since the shot was set
      const a = this.stage.get(actorId), yaw = a.targetYaw ?? a.yaw;
      if (Math.abs(wrap(yaw - (cur.yaw ?? yaw))) > 0.5) this._shot("on", [actorId]);
      return;
    }
    if (cur.kind === "wide" || (cur.kind === "two" && cur.ids[0] === actorId)) return;
    this._shot("on", [actorId]);
  }

  /**
   * Nobody blocks the shot: anyone who isn't in it and stands between the camera and its subject
   * (or right against the lens) is faded out until the camera moves on.
   */
  _occlusion() {
    const cam = this.ctx.camera, faded = this._faded ?? (this._faded = new Map());
    const want = new Set();
    if (cam.isScripted && this.blocking && !this.cut && this.currentShot) {
      const P = cam.scripted.pos, Q = cam.scripted.look, keep = new Set(this.currentShot.kind === "wide" ? [] : this.currentShot.ids);
      const world = this.ctx.getWorld(), entries = [["player", world.player, 1], ...[...this.stage.actors.entries()].map(([id, a]) => [id, a.actor, a.rig.look.scale ?? 1])];
      for (const [id, a, sc] of entries) {
        if (id === "player" && this.stage.playerHidden) continue;
        if (keep.has(id) || a.hiddenActor || !a.pos) continue;
        const near = (this.currentShot.kind === "on" ? 2.4 : 1.7) * sc; // close-ups: nobody else gets that close to the lens
        let block = Math.hypot(a.pos.x - P.x, a.pos.z - P.z) < near; // right against the lens: a head filling the frame
        for (let i = 0; i <= 10 && !block && this.currentShot.kind !== "wide"; i++) { // a wide shot looks at the middle of the group, not at anyone in it
          const t = i / 11, y = P.y + (Q.y - P.y) * t;
          if (y < (a.pos.y ?? 0) || y > (a.pos.y ?? 0) + 2.05 * sc) continue;
          const x = P.x + (Q.x - P.x) * t, z = P.z + (Q.z - P.z) * t;
          if (Math.hypot(x - a.pos.x, z - a.pos.z) < 0.5 * sc) block = true;
        }
        if (block) want.add(id);
      }
    }
    for (const id of [...faded.keys()]) if (!want.has(id)) { this._fadeActor(id, false); faded.delete(id); }
    for (const id of want) if (!faded.has(id)) { this._fadeActor(id, true); faded.set(id, true); }
  }
  /** Where faces should sit on screen: in the clear band between the top of the screen and the dialogue box. */
  _frameBias() {
    const cam = this.ctx.camera;
    if (!this.blocking || this.cut || typeof innerHeight === "undefined") { cam.frameBias = 0; return; }
    const H = innerHeight, el = this.view.el;
    if (!el.hidden) { const r = el.getBoundingClientRect(); if (r.height > 0) this._boxTop = r.top; }
    const top = H * 0.07 + (H < 560 ? H * 0.12 : H * 0.04); // letterbox, plus room for the menu or the host's title bar on short screens
    const bottom = Math.min(H * 0.93, this._boxTop ?? H * 0.93 - 140);
    const y = top + Math.max(0, bottom - top) * 0.42;
    cam.frameBias = Math.max(-0.1, Math.min(0.55, 1 - (2 * y) / H));
  }
  _fadeActor(id, out) {
    if (id === "player") { this.ctx.setPlayerVisible?.(!out); return; }
    const a = this.stage.actors.get(id);
    if (a && !a.actor.hiddenActor) a.rig.setVisible(!out);
  }

  _shot(kind, ids, cut = true) {
    const sh = this.stage.shot(kind, ids);
    if (!sh) return;
    const subj = kind === "on" ? this.stage.get(ids[0]) : null;
    this.currentShot = { kind, ids, yaw: subj ? subj.targetYaw ?? subj.yaw : null };
    // A phone held sideways has a short strip between the letterbox and the dialogue box: close shots open up to fit a whole head in it.
    const short = kind !== "wide" && typeof innerHeight !== "undefined" && innerHeight < 560;
    this.ctx.camera.frame(sh.pos, sh.look, { fov: sh.fov * (short ? 1.3 : 1), cut });
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
      case "shake": if (!this.skipping) this.ctx.camera.shake(Number(args[0]) || 0.4); break;
      case "timer": this.choiceTimer = Number(args[0]) || 8; break; // the next choice has this long; then the last one is taken
      case "stars": this.stage.showStars(args[0] !== "off"); break; // what the King sees (Ep 49)
      case "star": this.stage.setStars(actorOf(args[0]), Number(args[1]) || 0); break;
      case "clash": await this._clash(Number(args[0]) || 6); break;
      case "fx": await this.fx(args); break;
      case "survey": if (!this.skipping) await this.ctx.openSurvey?.(args[0]); break; // the playtest kit's end-of-arc survey (core/playtest.js)
      case "move": { // <<move Severin x z>> walks there; add "wait" to finish first
        const t = this.stage.move(actorOf(args[0]), Number(args[1]), Number(args[2]));
        if (args[3] === "wait") await this.sleep(this.skipping ? 0 : t);
        break;
      }
      case "pose": this.stage.pose(actorOf(args[0]), args[1] ?? "none"); break;
      case "face": this.stage.face(actorOf(args[0]), actorOf(args[1])); break;
      case "cue": this.ctx.sets?.cue(args[0]); break;
      case "splice": this._splice(); break; // a memory, cut (Ep 49): a door-frame outline for four frames
      case "show": case "hide": this.stage.show(actorOf(args[0]), name === "show"); break;
      case "quest": if (args[0] === "start") this.quests.start(args[1]); break;
      case "pay": { // <<pay N>>: spend Marks; $PAID says whether it worked
        const n = Number(args[0]) || 0, ok = this.inventory.marks >= n;
        if (ok) this.inventory.marks -= n;
        this.flags.set("PAID", ok ? 1 : 0);
        break;
      }
      case "earn": this.inventory.earn(Number(args[0]) || 0); this.ctx.hud.toast(`+${args[0]} MARKS`, "clear"); break;
      case "law": this.law.command(args); break; // <<law check>> (the bounty here, and whether you can pay), <<law pay>>
      case "gift": { // <<gift bas honeybun>>: give it; $GIFT_REACT says how it went (-1: already had one today)
        const r = this.bonds.give(args[0], args[1], this.day);
        this.flags.set("GIFT_REACT", r.react);
        if (r.react >= 0) this.ctx.onBond?.(args[0], { ...r, gift: args[1] });
        break;
      }
      case "meal": { // the Lighthouse kitchen: one bowl a day, a buff until midnight
        const ok = this.crafting.eat(this.day);
        this.flags.set("MEAL_OK", ok ? 1 : 0);
        if (ok) { this.ctx.onMeal?.(); }
        break;
      }
      case "heal": { // a good meal: full health and mana
        const p = this.ctx.getWorld().player; p.combatant.health.fill(); p.mana?.fill();
        this.ctx.hud.toast(args[0] ? args.join(" ").toUpperCase() : "WARM AND FULL", "clear"); this.ctx.sfx.play("heal"); break;
      }
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
    if (kind === "rift") { this.riftAt(CAST[who]?.actor ?? who); return; } // a pale seam where someone is about to step out
    if (kind === "tear") { this.riftAt(CAST[who]?.actor ?? who, "black"); return; } // a black one
    if (kind === "floor") { // a black tear in the ground under someone (Ep 47: under the Line Marshal)
      const a = this.stage.get(CAST[who]?.actor ?? who);
      if (a) this.tearAt({ x: a.pos.x, y: 0.05, z: a.pos.z }, 0, { kind: "black", r: 1.7 * (this.stage.actors.get(CAST[who]?.actor ?? who)?.rig.look.scale ?? 1), ground: true });
      return;
    }
    if (kind === "book") await this.bookDescends(CAST[who]?.actor ?? who, who === "Severin" ? "tome" : "thin");
  }

  /**
   * The Clash (Ep 48, GDD §15.8 Phase 5): two ultimates meet, and it's held by timing, not by mashing. A ring closes on a
   * mark; press as they meet. Too early or too late and the ring starts again. Every hit pushes the ink a little further
   * against the black light. If nothing lands for a while the memory of every fight so far carries the press anyway:
   * the Clash can be lost a hundred times and never fail. (The outcome is the story's; the timing is yours.)
   */
  _clash(n) {
    if (this.skipping) return Promise.resolve();
    const root = this.ctx.root, el = document.createElement("div");
    el.className = "clash";
    el.innerHTML = `<div class="clash-bar"><i></i></div><div class="clash-mark"></div><div class="clash-ring"></div><p class="clash-label">${this.ctx.hud?.label?.(this.ctx.controls?.device ?? "keyboard", "Light") ?? "PRESS"}</p>`;
    root.appendChild(el);
    const bar = el.querySelector(".clash-bar i"), ring = el.querySelector(".clash-ring");
    const PERIOD = 1.15, WINDOW = 0.17, GIVE = 6;
    return new Promise((resolve) => {
      const c = this.clash = {
        hits: 0, t: 0, idle: 0,
        update: (dt) => {
          c.t += dt; c.idle += dt;
          ring.style.transform = `translate(-50%, -50%) scale(${Math.max(0.3, 1 + 2.2 * (1 - c.t / PERIOD))})`;
          ring.classList.toggle("near", Math.abs(c.t - PERIOD) <= WINDOW);
          if (c.t > PERIOD + WINDOW + 0.25) c.t = 0; // missed it: round again
          if (c.idle > GIVE) c.land(); // the memory carries it
        },
        press: () => { if (Math.abs(c.t - PERIOD) <= WINDOW) c.land(); else { c.t = 0; this.ctx.sfx.play("ui"); } },
        land: () => {
          c.hits++; c.t = 0; c.idle = 0;
          bar.style.width = `${50 + (c.hits / n) * 50}%`;
          this.ctx.sfx.play("clash"); this.ctx.camera.shake(0.25 + c.hits * 0.05);
          el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
          if (c.hits >= n) { this.clash = null; el.remove(); resolve(); }
        },
      };
    });
  }

  /** A tear in the air at an actor's spot (pale, or black), facing where they face. It doesn't hold up the script. */
  riftAt(id, kind = "pale") {
    const a = this.stage.get(id);
    if (!a) return;
    const sc = this.stage.actors.get(id)?.rig.look.scale ?? 1; // a child's seam is a child's size
    this.tearAt({ x: a.pos.x, y: (a.pos.y ?? 0) + 1.15 * sc, z: a.pos.z }, a.yaw, { kind, r: 0.85 * sc });
  }

  /** A tear at a point: it opens fast, hangs for `life` seconds, and seals (cutscenes place them with `tear` events). */
  /** A tear (or a golden door, or the void) opens at a point: `grow` seconds to open (half a second by default). */
  tearAt(at, yaw, { kind = "pale", r = 0.85, life = 3, ground = false, grow = 0.5, pane = true } = {}) {
    const scene = this.ctx.scene;
    const node = kind === "gold" ? makeDoor(scene, "story-door", { w: r * 1.6, h: r * 2.8, ground, pane })
      : kind === "void" ? makeVoid(scene, "story-void", { r }) // the void makes no sound of its own
      : makeTear(scene, "story-rift", { r, kind, seed: kind === "black" ? 13 : 7, ground });
    node.position.set(at.x, at.y ?? 0, at.z);
    if (!ground) node.rotation.y = yaw;
    node.scaling.setAll(0.01);
    if (kind !== "void") this.ctx.sfx.play(kind === "black" ? "tear" : kind === "gold" ? "door" : "rift");
    const dur = this.skipping ? 0.05 : life;
    this.tweens.push({ t: 0, dur, fn: (k) => node.scaling.setAll(Math.max(0.01, Math.min(1, (k * dur) / Math.max(0.05, grow), (1 - k) * dur * 1.3))), done: () => node.dispose(false, false) });
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
    this._sky(beat);
    this.stage.setup(beat);
    const world = this.ctx.getWorld(), p = world.player;
    p.relaxed = true;
    // Episode beats on a zone's set use that zone's walls and buildings, so nothing can be walked through.
    const zone = beat.zone ?? Object.values(ZONES).find((z) => z.stage === beat.stage && !z.roamOnly);
    if (zone && !beat.zone) { world.bounds = zone.bounds; this.ctx.camera.bounds = cameraBounds(zone); }
    else if (!zone && !beat.zone) { world.bounds = YARD; this.ctx.camera.bounds = null; } // a set with no zone (the vault): its round floor
    // The Lighthouse's straw dummies are real targets: hit them as long as you like.
    const set = this.ctx.sets?.get?.(beat.stage);
    if (set?.dummies) {
      set.dummies.forEach(([x, z], i) => world.spawnDummy(x, z, Math.atan2(-x, -4 - z), i));
      this.ctx.onEvents(world.drainEvents());
    }
    this.ctx.root.classList.add("exploring");
    this.ctx.camera.release();
    this.ambient = beat.zone ? new Ambient(this.stage, beat.zone, this.flags) : null;
    this.exploring = { beat, talked: new Set(), near: null, busy: false, pickups: this._makePickups(beat.pickups ?? []),
      encounters: (beat.encounters ?? []).map((e) => ({ ...e, cond: compileExpr(e.when ?? "1"), armed: true, done: false })), combat: null };
    if (this.roaming) this.law.enter(); // its steal spots, and how big the Watch has grown
    if (beat.sentries) this._makeSentries(beat);
    this._objective();
    const done = new Promise((res) => { this.exploring.resolve = res; });
    if (beat.intro || beat.zone?.intro) this.sleep(0.4).then(() => this._intro(beat.intro ? { intro: { node: beat.intro } } : beat.zone)); // an opening line before you can move
    const out = await done;
    this._endExplore();
    return out ?? {};
  }

  _endExplore() {
    if (this.roaming) this.law.leave(); // walking out on the Watch is a crime of its own
    if (this.exploring?.combat) this._endCombat(false);
    const w = this.ctx.getWorld?.();
    if (w?.dummies?.length) { // the dummies stay on the set; their targets leave with the walk-around
      if (w.lockTarget?.traits.dummy) w.lockTarget = null;
      w.fighters = w.fighters.filter((f) => !f.traits.dummy);
    }
    for (const pk of this.exploring?.pickups ?? []) pk.node.dispose(false, true);
    for (const s of this.exploring?.sentries ?? []) s.cone.dispose(false, true);
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
      if (p.marker === false) { lamp.setEnabled(false); ring.setEnabled(false); } // furniture: no glowing marker, just the prompt
      if (p.faint) { lamp.scaling.setAll(0.45); ring.scaling.setAll(0.5); lamp.material = glow(scene, `pickup-${p.id}-faint`, "#bfe8ff"); } // hidden lore: a faint glint
      return { ...p, script: p.node, node, lamp, cond: compileExpr(p.show ?? "1") }; // node = the 3D marker; script = its dialogue
    });
  }

  /** The world clock: time of day and weather drive the sky, rain, crowd and townsfolk (GDD §29.10). */
  _weatherTick(dt) {
    const c = this.clock, sets = this.ctx.sets, indoor = !!this.zone?.interior;
    c.update(dt);
    this.weather = { raining: c.raining && !indoor, night: c.night }; // indoors it never rains
    this.rain ??= new RainFX(this.ctx.scene, { mobile: this.ctx.mobile });
    this.rain.update(indoor ? 0 : c.wet, this.ctx.scene.activeCamera?.position);
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
    const x = this.exploring, b = x.beat, { n, total } = objectiveCount(b, x.talked); // sim/episode.js
    this.ui.objective.innerHTML = fillText(b.objective ?? "", { ...this.player, flags: this.flags }).replace("{n}", n).replace("{total}", total).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
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
    if (x.combat?.law) { // a run-in with the law: no talking, but the way out is open (running is a choice)
      if (!this.ui.talk.hidden) this.ui.talk.hidden = true;
      x.near = null;
      for (const e of x.beat.exits ?? []) if (inRect(pp, e.rect) && this._exitOpen(e)) { x.busy = true; x.resolve({ exit: e }); return; }
      return;
    }
    if ((x.encounters.length || x.combat) && this._encounterTick(x, pp)) { // fighting (an encounter, or a sentry who saw you): no talking, no leaving
      if (!this.ui.talk.hidden) this.ui.talk.hidden = true;
      x.near = null;
      return;
    }
    for (const e of x.beat.exits ?? []) {
      if (!inRect(pp, e.rect) || !this._exitOpen(e)) continue;
      x.busy = true; x.resolve({ exit: e }); return; // leaving the zone
    }
    if (x.sentries && this._sentryTick(x, dt)) return; // spotted: a fight
    const p = this.ctx.getWorld().player;
    if (p.seated && (Math.abs(p.moveInput?.x ?? 0) + Math.abs(p.moveInput?.z ?? 0) > 0.1 || p.current)) p.seated = 0; // up from the chair
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
        t.innerHTML = `<kbd>${this.ctx.hud.label(device, "Light")}</kbd>${near.pickup ? near.pickup.label : `Talk to ${near.name ?? Object.values(CAST).find((k) => k.actor === near.id)?.name ?? near.id}${this.roaming && this.bonds.eventReady(near.id) ? " <b class=\"bond-ready\">♥ BOND EVENT</b>" : ""}`}`;
      }
    }
    if (near && !near.pickup) { const a = this.stage.get(near.id); if (!a.down) a.targetYaw = Math.atan2(p.pos.x - a.pos.x, p.pos.z - a.pos.z); }
  }

  // ---- Sentries (sim/sentry.js): Lances on their beats, each with a lantern's cone of sight on the ground ----
  _makeSentries(beat) {
    const BB = B(), scene = this.ctx.scene, x = this.exploring;
    x.sentries = makeSentries(beat.sentries).map((s, i) => {
      const def = beat.sentries[i];
      s.actor = this.stage.add({ id: s.id, look: def.look ?? "lance", x: s.x, z: s.z, yaw: s.yaw });
      // The cone: a flat fan on the ground, as far and as wide as they can see; it warms to red as they notice you.
      const n = 16, pos = [0, 0, 0], idx = [];
      for (let k = 0; k <= n; k++) { const a = -s.pov.half + (2 * s.pov.half * k) / n; pos.push(Math.sin(a) * s.pov.radius, 0, Math.cos(a) * s.pov.radius); }
      for (let k = 1; k <= n; k++) idx.push(0, k, k + 1);
      const cone = new BB.Mesh(`sentry-cone-${s.id}`, scene), vd = new BB.VertexData();
      vd.positions = pos; vd.indices = idx; vd.applyToMesh(cone);
      cone.material = glow(scene, `sentry-cone-${s.id}-m`, "#ffd36a", 0.3);
      cone.isPickable = false; cone.position.y = 0.04;
      // Its edge, drawn as a line, so the light reads on pale stone too.
      const edge = [];
      for (let k = 0; k < pos.length; k += 3) edge.push(new BB.Vector3(pos[k], 0.02, pos[k + 2]));
      edge.push(edge[0].clone());
      const rim = BB.MeshBuilder.CreateLines(`sentry-rim-${s.id}`, { points: edge }, scene);
      rim.parent = cone; rim.isPickable = false; rim.color = color3("#ffb43a").clone();
      s.cone = cone; s.rim = rim;
      return s;
    });
    x.spotted = 0;
  }

  /** Walk the sentries and look for Rook. True if one of them just shouted (a fight starts). */
  _sentryTick(x, dt) {
    const world = this.ctx.getWorld(), p = world.player;
    const spotted = stepSentries(x.sentries, dt, p.pos, world.bounds.solids ?? []);
    const idle = color3("#ffd36a"), alarm = color3("#ff3a2a");
    for (const s of x.sentries) {
      const a = s.actor;
      a.prev.x = a.pos.x = s.x; a.prev.z = a.pos.z = s.z; a.targetYaw = s.yaw;
      a.vel.x = s.moving ? Math.sin(s.yaw) * SENTRY.speed : 0; a.vel.z = s.moving ? Math.cos(s.yaw) * SENTRY.speed : 0;
      s.cone.position.x = s.x; s.cone.position.z = s.z; s.cone.rotation.y = a.yaw;
      const k = Math.min(1, s.seen / SENTRY.notice);
      B().Color3.LerpToRef(idle, alarm, k, s.cone.material.emissiveColor); s.cone.material.alpha = 0.3 + 0.25 * k;
      B().Color3.LerpToRef(color3("#ffb43a"), alarm, k, s.rim.color);
      const d = Math.hypot(s.x - p.pos.x, s.z - p.pos.z); // don't walk through them
      if (!s.out && d < 0.95 && d > 0.01) { const m = (0.95 - d) / d; p.pos.x += (p.pos.x - s.x) * m; p.pos.z += (p.pos.z - s.z) * m; }
    }
    if (!spotted) return false;
    // "There!": he's the fight now (a Lance where he stood, and any friends the beat sends), and his lantern goes out.
    const b = x.beat;
    spotted.out = true; spotted.cone.setEnabled(false); this.stage.show(spotted.id, false);
    x.spotted++;
    if (b.spottedFlag) this.flags.set(b.spottedFlag, (Number(this.flags.get(b.spottedFlag)) || 0) + 1);
    this.ctx.sfx.play("guardWhistle");
    this.ui.talk.hidden = true; x.near = null;
    this._startCombat(x, { id: `sentry-${spotted.id}`, at: { x: spotted.x, z: spotted.z, r: 2 }, wave: b.spotted?.wave ?? ["lance"],
      label: b.spotted?.label ?? "SPOTTED", leash: b.spotted?.leash ?? 14, sentry: spotted });
    return true;
  }

  /** Got away from a sentry's fight: he goes back to his beat from the start, and he's forgotten you. */
  _sentryBack(s) {
    s.out = false; s.seen = 0; s.x = s.route[0][0]; s.z = s.route[0][1]; s.leg = s.route.length > 1 ? 1 : 0; s.dir = 1; s.pause = s.route.length > 1 ? 0 : Infinity;
    s.cone.setEnabled(true); this.stage.show(s.id, true);
  }

  /** A door that opens with the story (`when`), like Luke's house in the Fens. */
  _exitOpen(e) { return !e.when || truthy(compileExpr(e.when)(this.flags)); }

  /**
   * An episode beat's sky (`sky: { daylight }`, 0 = night) on an outdoor set; a beat without one puts back the
   * set's own light if the last beat changed it. Free roam keeps the world clock's sky.
   */
  _sky(beat) {
    if (this.roaming) return;
    const d = beat?.sky?.daylight ?? 1;
    if (d >= 1 && !this._skyChanged) return;
    this._skyChanged = d < 1;
    this.ctx.sets?.atmosphere?.({ daylight: d, cloud: beat?.sky?.cloud ?? 0, wet: 0 });
  }

  /** Story flags changed: conditional set dressing follows (a cake goes back in its case…). */
  _refreshSet() { this.ctx.sets?.applyFlags?.((cond) => truthy(compileExpr(cond)(this.flags))); }

  /** A zone's opening scene (the first time in): played like a conversation, before you can move. */
  async _intro(zone) {
    const it = zone.intro, x = this.exploring;
    if (!it || !x || !truthy(compileExpr(it.when ?? "1")(this.flags))) return;
    x.busy = true; this.ui.talk.hidden = true;
    this._enterScene(true);
    await this.runNode(it.node);
    if (!this.exploring) return;
    this.skipping = false;
    this._enterScene(false);
    this.view.hide(); this._refreshSet();
    x.busy = false; x.cooldown = 0.6; this._objective();
    if (this.roaming) this.saveNow();
  }

  /** Talk to whoever is close (exploration). */
  async interact() {
    const x = this.exploring;
    if (!x || x.busy || !x.near || x.cooldown > 0) return false;
    const c = x.near;
    if (c.pickup) { // pick it up (or read it): set its flag (quests notice); most then disappear
      const pk = c.pickup;
      if (pk.steal) { // a stall, a coin jar (runtime/law.js): somebody may be watching
        this.law.steal(pk);
        x.near = null; x.cooldown = 0.6; this._objective();
        if (this.exploring && !this.exploring.busy) this.saveNow();
        return true;
      }
      if (pk.ui) { // a screen rather than a conversation: the squad board, the workbench
        x.busy = true; this.ui.talk.hidden = true;
        const p = this.ctx.getWorld().player; p.vel.x = p.vel.z = 0; p.moveInput.x = p.moveInput.z = 0;
        await this.ctx.openUI?.(pk.ui);
        if (!this.exploring) return true;
        this._refreshSet();
        x.busy = false; x.near = null; x.cooldown = 0.6; this._objective();
        if (this.roaming) this.saveNow();
        return true;
      }
      if (pk.flag) this.flags.set(pk.flag, 1);
      if (pk.marks) { this.inventory.earn(pk.marks); this.ctx.hud.banner(`+${pk.marks} MARKS`); }
      if (pk.script) {
        x.busy = true; this.ui.talk.hidden = true;
        this._enterScene(true);
        const p = this.ctx.getWorld().player;
        p.vel.x = p.vel.z = 0; p.moveInput.x = p.moveInput.z = 0; p.runner.interrupt();
        if (pk.sit) { // take a seat: until Rook moves off again
          const [sx, sz, syaw] = pk.sit;
          p.pos.x = p.prev.x = sx; p.pos.z = p.prev.z = sz; p.yaw = p.prevYaw = syaw; p.seated = 0.5; p.relaxed = true;
          this._shot("on", ["player"]);
        }
        await this.runNode(pk.script);
        if (!this.exploring) return true;
        this.skipping = false;
        this._enterScene(false);
        this.view.hide();
        this._refreshSet();
        x.busy = false;
      } else {
        this.ctx.sfx.play("surgeFull");
        this.ctx.hud.toast(pk.label.replace(/^(Pick up|Open) (the )?/, "").toUpperCase(), "clear");
      }
      x.talked.add(pk.id); // reading something can be part of a beat's goal, like talking to someone
      x.near = null; x.cooldown = 0.6; this._objective();
      if (this.roaming) this.saveNow();
      if (x.beat.required?.length && x.beat.required.every((id) => x.talked.has(id))) x.resolve();
      return true;
    }
    x.busy = true; this.ui.talk.hidden = true;
    this._enterScene(true);
    const p = this.ctx.getWorld().player;
    p.vel.x = p.vel.z = 0; p.moveInput.x = p.moveInput.z = 0; p.runner.interrupt();
    this.stage.face("player", c.id);
    this.stage.face(c.id, "player");
    this._shot("two", [c.id, "player"]);
    // A squadmate whose bond has reached a gate: their bond event plays instead of small talk.
    const event = this.roaming && BONDS[c.id] ? this.bonds.eventReady(c.id) : null;
    const node = event ?? (x.talked.has(c.id) && c.again ? c.again : c.node);
    await this.runNode(node);
    if (!this.exploring) return true;
    if (event) this.ctx.onBond?.(c.id, { event: true, rank: this.bonds.rank(c.id) });
    if (this.roaming && BONDS[c.id]) { // the first chat of the day brings you closer; then a gift, if you have one
      const r = this.bonds.talk(c.id, this.day);
      if (r && (r.gained || r.rankUp)) this.ctx.onBond?.(c.id, r);
      if (!event) await this.runNode(`B_Menu_${c.id}`);
      if (!this.exploring) return true;
    }
    if (c.after) { await this.runNode(c.after); if (!this.exploring) return true; } // e.g. a stall's gifts
    if (c.shop) { this.view.hide(); await this.ctx.openShop?.(c.shop); }
    x.talked.add(c.id);
    this.skipping = false;
    this._enterScene(false);
    this._refreshSet();
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
      if (!c.lock && !c.boss && Math.hypot(pp.x - c.at.x, pp.z - c.at.z) > (c.leash ?? 12)) { // bosses don't give up
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
    // Boss fights: the squad comes with you (and leaves again after).
    this.squadIn = [];
    for (const k of e.squad ?? []) if (!world.companions.some((c) => c.kind === k)) { world.addCompanion(k); this.squadIn.push(k); }
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
    if (this.squadIn?.length) { // the squad heads home; a won boss fight brings everyone closer
      if (won) for (const k of this.squadIn) this.bondGain(k, BOND_GAIN.fight * 2);
      for (const c of world.companions.filter((c) => this.squadIn.includes(c.kind))) { world.emit({ type: "despawn", fighter: c }); world.fighters = world.fighters.filter((f) => f !== c); }
      world.companions = world.companions.filter((c) => !this.squadIn.includes(c.kind));
      this.squadIn = [];
      this.ctx.onEvents(world.drainEvents());
    }
    for (const b of this.bars ?? []) b.dispose(false, true);
    this.bars = null;
    if (won) {
      e.done = true;
      if (e.flag) { // (an episode's walk-around has no zone, and no visits to count)
        this.flags.set(e.flag, 1);
        if (this.zone) this.flags.set(`${e.flag}_VISIT`, Number(this.flags.get(`VISITS_${this.zone.id.toUpperCase()}`)) || 1);
      }
      if (e.mark) this.flags.set(e.mark, 1); // beaten at least once (the fight itself comes back)
      const pp = world.player.pos; // a fight over the same ground waits until you've walked out and back in
      for (const o of x.encounters) if (inRect(pp, o.rect)) o.armed = false;
      const p = world.player.combatant.health;
      p.add(p.max * 0.3); // catch your breath
      this.ctx.hud.banner(`${e.label ?? "AMBUSH"} · CLEARED`);
      this.saveNow();
    } else {
      world.clearEnemies();
      this.ctx.onEvents(world.drainEvents());
      if (e.sentry) this._sentryBack(e.sentry);
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
    const world = this.ctx.getWorld(), p = world.player; // free roam: the zone's way in; an episode's walk-around: where it started
    const at = this.zone ? arrivalPoint(this.zone, this.arrival) : (x.beat.rook ?? { x: 0, z: -4, yaw: 0 });
    world.revivePlayer(1);
    p.pos.x = p.prev.x = at.x; p.pos.z = p.prev.z = at.z; p.pos.y = p.prev.y = 0; p.yaw = p.prevYaw = at.yaw ?? 0;
    this.ctx.onEvents(world.drainEvents());
    this._fade(false, 0.6);
    this.ctx.hud.banner(`${this.player.name.toUpperCase()} WAKES UP ${this.zone ? `AT THE ${this.zone.dungeon ? "STAIRS" : "ROADSIDE"}` : "WHERE THEY STARTED"}`);
  }

  // ---- Free roam: walk between zones (GDD §13) ----
  /** Wander the world from `zoneId`, arriving at `arrival` (a key in the zone's arrivals). Runs until stopped. */
  async roam(zoneId, arrival = null) {
    this.active = true;
    this.roaming = true;
    this.ep = null; this.director = null;
    // Free roam: once the Knight Exam is behind you, Severin can tag in during field fights (T / TAG).
    this.ctx.makeWorld({ companions: false, ultimate: true, pages: true, party: this.flags.get("EP2_PAID") ? ["severin"] : [] });
    let id = zoneId, arr = arrival;
    while (this.active) {
      const zone = ZONES[id];
      this.zone = zone; this.arrival = arr;
      const world = this.ctx.getWorld();
      world.bounds = zone.bounds;
      this.ctx.camera.bounds = cameraBounds(zone);
      this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), prog: this.progress.toJSON(), zone: id, arrival: arr, episode: null, beat: 0, clock: this.clock?.toJSON() });
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
      this.law.beforeZone(); // night or day, and how big the Watch is: who's here can depend on both
      const out = await this.explore({ id: `zone-${id}`, zone, stage: zone.stage, rook: at,
        cast: [...zone.cast, ...(zone.extras ?? [])].filter((c) => !c.when || truthy(compileExpr(c.when)(this.flags))), // who is here depends on the story
        exits: zone.exits, pickups: zone.pickups, encounters: zone.encounters,
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
    if (this.roaming && this.zone) this.ctx.saves.write("auto", { player: this.player, flags: this.flags.snapshot(), inv: this.inventory.toJSON(), prog: this.progress.toJSON(), zone: this.zone.id, arrival: this.arrival ?? null, episode: null, beat: 0, clock: this.clock?.toJSON() });
    else this.autosave();
  }

  /** Map travel: jump to another zone's main arrival point. */
  travel(zoneId) { if (this.exploring && !this.exploring.busy && !this.exploring.combat && ZONES[zoneId]) { this.exploring.busy = true; this.exploring.resolve({ travel: zoneId }); } }

  // ---- Cutscenes (timeline playback) ----
  playCutscene(id) {
    const cs = CUTSCENES[id];
    if (!cs) return Promise.resolve();
    if (!this.theatre) theatreMark(id, "seen"); // the Lore Archive keeps every scene you've watched
    this.ctx.sets?.use(cs.stage ?? "yard"); this._refreshSet(); this._sky(cs); // set pieces follow the story (a cairn, a wreck…)
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
      if (e.move) this.stage.move(e.move.id, e.move.to[0], e.move.to[1], e.move.dur, e.move.to[2], e.move.ease, e.move.back);
      if (e.face) this.stage.face(e.face[0], e.face[1]); // turn to look at someone
      if (e.pose) this.stage.pose(e.pose.id, e.pose.name);
      if (e.cue) this.ctx.sets?.cue(e.cue);
      if (e.tear) { const [x, y, z] = e.tear.at; this.tearAt({ x, y, z }, e.tear.yaw ?? 0, e.tear); }
      if (e.fade) this._fade(e.fade === "out", e.dur ?? 1); // dur: a cut to black (0), or a slow fade
      if (e.flash) this._flash(e.flash);                   // an impact frame: white, for a fraction of a second
      if ("memory" in e) this.ctx.setMemory?.(!!e.memory, false); // into a memory (Ep 49): the colour drains out over a second and a half
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

  /** A visible cut in a memory (BACKLASH.md §15.2): a thin door-frame outline flickers across the screen. */
  _splice() {
    if (this.skipping) return;
    const el = document.createElement("div");
    el.className = "splice";
    this.ctx.root.appendChild(el);
    setTimeout(() => el.remove(), 140);
  }

  _flash(seconds) {
    if (this.skipping) return;
    const el = document.createElement("div");
    el.className = "impact-white";
    this.ctx.root.appendChild(el);
    setTimeout(() => el.remove(), Math.max(40, seconds * 1000));
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
    this.ctx.sets?.use(beat.stage ?? "yard"); this._refreshSet(); this._sky(beat); // set pieces follow the story (a cairn, a wreck…)
    const world = this.ctx.makeWorld({ ...this.ep.world, ...(beat.world ?? {}), tokens: beat.tokens ?? this.ep.world?.tokens }); // a fight can change the rules (Mirrorlake: the margin)
    // A new world frees the camera; indoors (the Hall of Lanterns in Ep 41) it has to stay in the room.
    const room = Object.values(ZONES).find((z) => z.stage === (beat.stage ?? "yard") && !z.roamOnly && z.interior);
    if (room) this.ctx.camera.bounds = cameraBounds(room);
    for (;;) {
      world.resetPlayer();
      if (beat.siege) { // a staged battle, not a wave to clear (sim/siege.js: the Siege of Aurelin)
        for (const e of world.enemies) world.emit({ type: "despawn", fighter: e });
        world.fighters = world.fighters.filter((f) => f.team === world.player.team);
        this.siege = new Siege(world, beat.siege).start(); this.siegeFrame = world.frame;
      } else world.spawnWave(beat.wave);
      this.ctx.onEvents(world.drainEvents());
      this.fight = { beat, t: 0, hints: [...(beat.tutorial ?? [])], result: null, getUps: beat.getUps ?? 0, falls: 0 };
      for (const [who, text] of beat.lines ?? []) this.say(who, text); // squad chatter as the fight starts
      const won = await new Promise((res) => { this.fight.resolve = res; });
      if (this.siege) { this.siege.end(); this.ctx.onEvents(world.drainEvents()); this.siege = null; }
      if (won && (beat.endOn || beat.siege)) { // the story ended it, not the last blow: whoever's still standing (and any guest) leaves the set with the fight
        for (const f of world.fighters.filter((x) => x.team !== world.player.team || x.guest)) world.emit({ type: "despawn", fighter: f });
        world.fighters = world.fighters.filter((x) => x.team === world.player.team && !x.guest);
        world.companions = world.companions.filter((c) => !c.guest);
        if (world.boss && !world.fighters.includes(world.boss)) world.boss = null;
        this.ctx.onEvents(world.drainEvents());
      }
      this._hint("");
      if (won) { // fighting side by side brings the squad closer
        const comp = this.ep?.world?.companions, party = comp === true || comp === undefined ? ["bas", "juno"] : Array.isArray(comp) ? comp : [];
        for (const id of party) this.bondGain(id, BOND_GAIN.fight);
      }
      if (won || !beat.retry) { this.fight = null; return { won }; }
      this.fight = null;
      this.say(beat.retryBy ?? "Rook", beat.retry); // inside a memory (Ep 49) it is the narrator who corrects it
      await this.sleep(2.2);
    }
  }

  /** A staged battle runs on the world's frames: the meter, the Line's ranks, the lines spoken; and it says when it's over. */
  _siegeTick() {
    const s = this.siege, f = this.fight, w = this.ctx.getWorld();
    while (this.siegeFrame < w.frame) { s.step(); this.siegeFrame++; }
    for (const [who, text] of s.drainLines()) this.say(who, text);
    for (const k of s.drainMarks()) {
      if (k.cue) this.ctx.sets?.cue(k.cue);
      if (k.sfx) this.ctx.sfx.play(k.sfx);
      if (k.say) this.say(k.say[0], k.say[1]);
      for (const [flag, v] of Object.entries(k.set ?? {})) this.flags.set(flag, v);
      if (k.shake) this.ctx.camera.shake(k.shake);
      if (k.remove) for (const e of w.liveEnemies.filter((x) => x.kind === k.remove)) { e.combatant.floor = 0; e.combatant.takeDamage(1e9); } // one of them falls, for good (Ep 49: the archer)
      if (k.join && !w.companions.some((c) => c.kind === k.join)) w.addCompanion(k.join); // back at your side (Ep 50: the Links)
    }
    if (s.done && !f.done) { f.done = true; this.sleep(0.3).then(() => f.resolve(true)); }
  }

  /** World events main.js forwards while a story fight runs. */
  onWorldEvent(ev) {
    const x = this.exploring;
    if (ev.type === "softHit") { this.law.onSoftHit(ev); return; } // a blade or a spell landed on a townsperson
    if (x?.combat?.law) { if (ev.type === "playerDown") this.law.fell(); return; } // the Watch, or a street fight
    if (x?.combat && !this.fight) {
      if (ev.type === "waveClear") this._endCombat(true);
      if (ev.type === "playerDown") this._fallInField();
      return;
    }
    const f = this.fight;
    if (!f || f.done) return;
    const hint = f.beat.eventHints?.[ev.type];
    if (hint && !f.shown?.has(ev.type)) { (f.shown ??= new Set()).add(ev.type); this._showHint(hint); }
    const wake = f.beat.awaken; // a stage of the Palimpsest waking mid-fight (Ep 40: Revision, as the Dawnbreak comes)
    if (wake && ev.type === wake.on && !this.flags.get(wake.flag)) {
      this.flags.set(wake.flag, 1);
      const w = this.ctx.getWorld();
      if (wake.flag === "REVISION") { w.revision = true; w.player.surge?.fill(); }
      if (wake.say) this.say(wake.say[0], wake.say[1]);
    }
    if (this.siege) this.siege.onEvent(ev);
    if (ev.type === "waveClear" && !this.siege) { f.done = true; this.sleep(0.4).then(() => f.resolve(true)); }
    if (f.beat.endOn && ev.type === f.beat.endOn) { f.done = true; this.sleep(0.6).then(() => f.resolve(true)); } // a fight the story ends (Ep 48: the Underline)
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
  say(speakerId, text, name = null) { this.ctx.hud.say(name ?? speakerName(speakerId, this.player.name, this.flags), fillText(text, { ...this.player, flags: this.flags })); }

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
    const nextEp = beat.nextEpisode && this.episodeById(beat.nextEpisode);
    next.textContent = beat.next ?? (nextEp ? `Episode ${nextEp.number} · ${nextEp.title}` : ""); next.classList.remove("on"); // the next episode names itself
    buttons.innerHTML = "";
    pv.hidden = false;
    this.ctx.sfx.play("surgeFull");
    for (const p of lines.querySelectorAll("p")) { await this.sleep(0.9); p.classList.add("on"); }
    await this.sleep(0.9); next.classList.add("on");
    await this.sleep(0.4);
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
