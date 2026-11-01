// Boss 6, the Cantor Twins (GDD §16 B6, Ep 15) as a duo: one song in two throats.
// Each twin (and each of P3's reflections) carries a TwinController; the two twins share one TwinDuo, which runs
// the phases off their health together: the swap (P2), the smoke and mirrors (P3), and the absorbing (P4).

import { EnemyBrain } from "../core/ai.js";
import { ENEMIES } from "../data/enemies.js"; // (read only inside methods: the enemy table imports this file)
import { RESONANCE, TWINS_TUNING as T } from "../data/twins.js";

const TWINS = new Set(["twinMirror", "twinSmoke"]);
const gusty = (a) => !!a?.tags?.includes?.("gust");
const look = (f) => (f.kind === "twinMirror" || f.kind === "twinEchoMirror" ? "twinMirror" : "twinSmoke");

/** Their magic: the glass (Mirror's, a guard that turns away what hits it head-on) or the song (Smoke's: bolts and the hymn). */
const MAGIC = {
  glass: { kind: "twinMirror", guard: true, ranged: false },
  song: { kind: "twinSmoke", guard: false, ranged: true },
};

export class TwinDuo {
  constructor(w) {
    this.w = w; this.wave = w.wave; this.twins = []; this.phase = 1; this.frame = -1;
    this.swapTimer = 0; this.smoke = null; this.smokeTimer = 0; this.echoes = []; this.absorbed = null; this.wardTimer = 0; this._n = 0;
  }
  static for(w) { if (!w.twinDuo || w.twinDuo.wave !== w.wave) w.twinDuo = new TwinDuo(w); return w.twinDuo; }
  add(f) { this.twins.push(f); f.magic = f.kind === "twinMirror" ? "glass" : "song"; }
  /** The pair's health together (the fallen count as nothing). */
  get health() {
    let c = 0, m = 0;
    for (const t of this.twins) { c += t.alive ? t.combatant.health.current : 0; m += t.combatant.health.max; }
    return m ? c / m : 0;
  }
  tick() {
    const w = this.w;
    if (this.frame === w.frame) return;
    this.frame = w.frame;
    if (this.twins.length < 2) return; // one alone is no duo
    const alive = this.twins.filter((t) => t.alive);
    if (!alive.length) { this._clearSmoke(false); return; }
    for (const t of alive) if (t.glassBroken > 0 && --t.glassBroken === 0) { this._apply(t, t.magic); w.emit({ type: "glassMend", fighter: t }); } // the crack closes
    if (alive.length === 1 && !this.absorbed) this._absorb(alive[0]);
    if (this.absorbed) { this._absorbedStep(); return; }
    const hp = this.health;
    if (this.phase < 2 && hp <= T.swapAt) { this.phase = 2; this._swap(); this.swapTimer = T.swapEvery; w.emit({ type: "twinPhase", phase: 2, fighters: alive }); }
    if (this.phase < 3 && hp <= T.smokeAt) { this.phase = 3; w.emit({ type: "twinPhase", phase: 3, fighters: alive }); this._smokeUp(); }
    if (this.phase >= 2) {
      if (--this.swapTimer === T.swapWarn) w.emit({ type: "twinSwapWarn", fighters: alive });
      if (this.swapTimer <= 0) { this._swap(); this.swapTimer = T.swapEvery; }
    }
    if (this.smoke) this._smokeStep();
    else if (this.phase >= 3 && --this.smokeTimer <= 0) this._smokeUp();
  }

  // ---- P2: the swap ----
  _apply(f, magic) {
    const M = magic === "both" ? null : MAGIC[magic], def = ENEMIES[M ? M.kind : f.kind];
    f.magic = magic;
    f.traits = { ...f.traits, frontalGuard: (f.glassBroken ?? 0) > 0 ? false : magic === "both" ? true : M.guard, ranged: magic === "both" ? true : M.ranged }; // (cracked glass guards nothing)
    const opts = magic === "both" ? [...ENEMIES.twinMirror.options(), ...ENEMIES.twinSmoke.options()] : def.options();
    const was = f.brain; f.brain = new EnemyBrain(f.id, was.pool, opts, this.w.rng); f.brain.aggroRange = 40;
  }
  _swap() {
    const [a, b] = this.twins;
    if (!a.alive || !b.alive) return;
    const ma = a.magic; this._apply(a, b.magic); this._apply(b, ma);
    this.w.emit({ type: "twinSwap", fighters: [a, b], at: [{ x: a.pos.x, y: 1.4, z: a.pos.z }, { x: b.pos.x, y: 1.4, z: b.pos.z }] });
  }

  // ---- P3: the smoke and mirrors ----
  _smokeUp() {
    const w = this.w, S = T.smoke, alive = this.twins.filter((t) => t.alive);
    const c = { x: alive.reduce((s, t) => s + t.pos.x, 0) / alive.length, z: alive.reduce((s, t) => s + t.pos.z, 0) / alive.length };
    this.smoke = { frames: S.frames, shift: S.shiftEvery, center: c };
    this.echoes = [];
    for (let i = 0; i < S.echoes; i++) {
      const a = (i / S.echoes) * Math.PI * 2 + 0.4, of = this.twins[i % 2];
      const e = w.spawnEnemy(of.kind === "twinMirror" ? "twinEchoMirror" : "twinEchoSmoke", c.x + Math.sin(a) * S.ring, c.z + Math.cos(a) * S.ring, 90 + ++this._n);
      e.look = look(of); e.echoOf = of;
      e.brain.aggroRange = 40;
      this.echoes.push(e);
    }
    w.emit({ type: "smokeUp", center: { ...c, y: 0 }, r: S.ring + 3, frames: S.frames, echoes: this.echoes });
  }
  _smokeStep() {
    const w = this.w, s = this.smoke;
    const live = this.echoes.filter((e) => e.alive), twins = this.twins.filter((t) => t.alive);
    if (!live.length) { this._clearSmoke(true); return; }
    if (--s.frames <= 0) { this._clearSmoke(false); return; }
    if (--s.shift <= 0) { // the real one steps into a mirror, and out of another
      s.shift = T.smoke.shiftEvery;
      const t = twins[Math.floor(w.rng() * twins.length) % twins.length], e = live[Math.floor(w.rng() * live.length) % live.length];
      const from = { x: t.pos.x, y: 1.2, z: t.pos.z }, to = { x: e.pos.x, y: 1.2, z: e.pos.z };
      t.pos.x = t.prev.x = to.x; t.pos.z = t.prev.z = to.z; e.pos.x = e.prev.x = from.x; e.pos.z = e.prev.z = from.z;
      w.emit({ type: "mirrorShift", fighter: t, from, to });
    }
  }
  /** Gale on the smoke: it's blown away, and every reflection with it. */
  disperse(by) {
    if (!this.smoke) return false;
    const at = { ...this.smoke.center, y: 1.2 };
    for (const e of this.echoes) if (e.alive) { e.combatant.health.set(0); this.w.emit({ type: "echoShatter", fighter: e, at: { x: e.pos.x, y: 1.2, z: e.pos.z } }); }
    this.w.emit({ type: "smokeDispersed", by, at });
    this._clearSmoke(false);
    return true;
  }
  _clearSmoke(shattered) {
    if (!this.smoke) return;
    for (const e of this.echoes) if (e.alive) { e.combatant.health.set(0); this.w.emit({ type: "echoShatter", fighter: e, at: { x: e.pos.x, y: 1.2, z: e.pos.z } }); }
    this.echoes = []; this.smoke = null; this.smokeTimer = T.smoke.every;
    this.w.emit({ type: "smokeClear", shattered });
  }

  // ---- P4: the absorbing ----
  _absorb(s) {
    const w = this.w, A = T.absorb, fallen = this.twins.find((t) => t !== s);
    this._clearSmoke(false);
    this.absorbed = s;
    this._apply(s, "both");
    s.stats = { ...s.stats, runSpeed: s.stats.runSpeed * A.speed, circleSpeed: s.stats.circleSpeed * A.speed };
    const hp = s.combatant.health; hp.set(Math.min(hp.max, hp.current + hp.max * A.heal));
    s.tags.add("ABSORBED", 1e9);
    this.wardTimer = 60;
    w.emit({ type: "twinAbsorb", fighter: s, fallen, at: { x: s.pos.x, y: 1.4, z: s.pos.z } });
  }
  _absorbedStep() {
    const s = this.absorbed;
    if (!s.alive) return;
    if (!s.runner.isRunning && s.combatant.canAct && s.grounded && --this.wardTimer <= 0) { // she sings for herself now
      this.wardTimer = T.absorb.wardEvery;
      s.controller.startDirect(ENEMIES.twinSmoke.abilities.Hymn, this.w.frame);
    }
  }
}

/**
 * Resonance (Tamsin's Shatter Note): every reflection within reach of the note breaks at once, and a twin's glass cracks
 * (no guard) for a while. Returns what it broke.
 */
export function shatterNote(w, owner, at) {
  const broke = [], cracked = [];
  for (const e of w.fighters) {
    if (!e.alive || e.team === owner.team || Math.hypot(e.pos.x - at.x, e.pos.z - at.z) > RESONANCE.r) continue;
    if (e.traits.echo) { e.combatant.health.set(0); broke.push(e); w.emit({ type: "echoShatter", fighter: e, at: { x: e.pos.x, y: 1.2, z: e.pos.z }, by: owner }); continue; }
    if (TWINS.has(e.kind) && (e.magic === "glass" || e.magic === "both")) {
      e.glassBroken = RESONANCE.glassFrames; e.traits = { ...e.traits, frontalGuard: false }; cracked.push(e);
      w.emit({ type: "glassShatter", fighter: e, by: owner, frames: RESONANCE.glassFrames, at: { x: e.pos.x, y: 1.4, z: e.pos.z } });
    }
  }
  return { broke, cracked };
}

/** On each twin and each reflection: the twins tick the duo; anything of theirs hit by Gale blows the smoke away. */
export class TwinController {
  constructor(world, f) {
    this.world = world; this.f = f;
    if (TWINS.has(f.kind)) { this.duo = TwinDuo.for(world); this.duo.add(f); }
  }
  get brainActive() { return true; }
  get untouchable() { return false; }
  tick() { this.duo?.tick(); }
  onHit(att, ability) {
    const duo = this.duo ?? this.world.twinDuo;
    if (att === this.world.player && gusty(ability)) duo?.disperse(att);
  }
}
