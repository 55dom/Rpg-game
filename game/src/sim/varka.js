// Boss 8 · General Varka Ironsong (data/ashfall.js): her siege engine, its rolls, its wreckage, the Railgun,
// and the Final Vow that ends the fight. The engine is an object (it can't walk); this controller drives it.

import { PhasedBoss } from "./boss.js";
import { constrain } from "./bounds.js";
import { VARKA_PHASES, VARKA_TUNING, FINAL_VOW, ENGINE_RAM, WRECKAGE, varkaOptions } from "../data/ashfall.js";

/** A spar (Brannoc in Ep 21): a boss with no phases and no tricks. */
export class SparBoss {
  constructor(world, f) { this.world = world; this.f = f; }
  get brainActive() { return true; }
  get untouchable() { return false; }
  tick() {}
}

export class VarkaController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, VARKA_PHASES, varkaOptions);
    this.engine = null; this.started = false; this.roll = null; this.rollTimer = VARKA_TUNING.rollEvery; this.debrisTimer = 0; this.vowed = false;
    this.onDeck = false; this.deckDone = false;
    f.combatant.floor = Math.ceil(f.stats.maxHealth * 0.05); // the last blow is Brannoc's
  }
  onCustom(key, value, a) {
    const w = this.world, f = this.f, T = VARKA_TUNING;
    if (key === "shock") { w.addWave(f, f.pos.x, f.pos.z, { speed: 9, maxR: value + 1, width: 0.7, spec: T.shock, ability: a, kind: "shock" }); return true; }
    if (key === "arcFan") { w.fireFan(f, a, "Arc", 16, value, 0.2); return true; }
    if (key === "storm") { // a Thunderhead over everyone on Rook's side, and one where Rook is running to (each on the floor they stand on)
      for (const t of w.fighters) if (t.team !== f.team && t.alive && !t.traits.object) w.addStrike(f, t.pos.x, t.pos.z, { delay: T.stormDelay, r: T.stormRadius, spec: T.thunder, ability: a, kind: "thunder", y: t.floor || 0 });
      const p = w.player; w.addStrike(f, p.pos.x + p.vel.x * 0.9, p.pos.z + p.vel.z * 0.9, { delay: T.stormDelay + 12, r: T.stormRadius, spec: T.thunder, ability: a, kind: "thunder", y: p.floor || 0 });
      return true;
    }
    if (key === "magnet") { w.emit({ type: "magnet", fighter: f }); return true; }
    return false;
  }
  enterPhase(p) {
    const w = this.world, f = this.f;
    if (p === 2) { w.emit({ type: "engineRolls", fighter: f }); if (this.engine?.alive && !this.deckDone) this._board(); }
    if (p === 3) {
      this.roll = null;
      const at = this.engine ? { x: this.engine.pos.x, z: this.engine.pos.z } : { x: f.pos.x, z: f.pos.z };
      if (this.engine?.alive) { this._breakDeck(true); this.engine.combatant.health.set(0); }
      w.emit({ type: "engineBreaks", fighter: f, at });
    }
    if (p === 4) w.emit({ type: "railgun", fighter: f });
    if (p === 5 && !this.vowed) this.finalVow();
  }
  /** Brannoc's Final Vow: one cut with everything he has. If he isn't on the field, the vow is Rook's to finish. */
  finalVow() {
    const w = this.world, f = this.f;
    this.vowed = true; this.roll = null; w.strikes = [];
    const by = w.companions.find((c) => c.kind === "brannoc" && c.alive) ?? w.player;
    w.emit({ type: "finalVow", fighter: f, by, at: { x: f.pos.x, y: 1.2, z: f.pos.z } });
    f.runner.interrupt(); f.combatant.floor = 0;
    w._resolve(by, f, { spec: FINAL_VOW.hit, ability: FINAL_VOW, hitSet: new Set(), origin: { x: f.pos.x, y: 1.2, z: f.pos.z }, projectile: true });
    if (f.alive) f.combatant.health.set(0); // nothing survives it
  }
  /** P2: she vaults up onto the engine's back, and its deck becomes a floor (sim/world.js _deck). */
  _board() {
    const w = this.world, f = this.f, e = this.engine, D = VARKA_TUNING.deck;
    w.deck = { engine: e, x: e.pos.x, z: e.pos.z, yaw: e.yaw, h: D.h, hw: D.hw, hl: D.hl, front: D.front, ramp: D.ramp, rampHalf: D.rampHalf, offLanding: D.offLanding };
    const c = Math.cos(e.yaw), s = Math.sin(e.yaw), lz = (D.front - D.hl) / 2; // the middle of the open deck, behind the tower
    f.runner.interrupt(); f.pos.x = f.prev.x = e.pos.x + lz * s; f.pos.z = f.prev.z = e.pos.z + lz * c;
    f.floor = D.h; f.pos.y = f.prev.y = D.h; f.vel.x = f.vel.y = f.vel.z = 0; f.knock.x = f.knock.z = 0; f.grounded = true;
    this.onDeck = true; this.rollTimer = 90;
    w.emit({ type: "deckUp", fighter: f, engine: e, deck: w.deck, at: { x: f.pos.x, y: D.h, z: f.pos.z } });
  }
  /**
   * The deck comes down: broken from below in P2 (she falls, staggered), or breaking apart at P3, when it goes up in three
   * burning sections that come down across the field, and whoever was aboard comes down with them.
   */
  _breakDeck(apart) {
    const w = this.world, f = this.f, e = this.engine, D = VARKA_TUNING.deck, d = w.deck;
    if (!d) return;
    const aboard = w.fighters.filter((t) => t.alive && t.floor === d.h);
    w.deck = null; this.onDeck = false; this.deckDone = true; this.roll = null;
    for (const t of aboard) {
      t.floor = 0; t.grounded = false; t.runner.interrupt();
      if (apart) { t.pos.y = t.prev.y = d.h + 1.4; t.vel.y = 3; } // thrown up as it splits
      if (t === w.player && apart) { t.dropLanding = D.sectionLanding; t.airJumps = 1; t.airDashes = 1; } // jump or dash before you land
    }
    if (!apart) { f.combatant.stagger(D.brokenStagger); w.emit({ type: "deckBroken", fighter: f, at: { x: e.pos.x, y: 0, z: e.pos.z } }); return; }
    const c = Math.cos(e.yaw), s = Math.sin(e.yaw);
    const sections = D.sections.map((lz, i) => { // each section lands a little off the line it was rolling, one after another
      const side = (i - 1) * 2.2, x = e.pos.x + lz * s + side * c, z = e.pos.z + lz * c - side * s;
      return w.addStrike(f, x, z, { delay: D.sectionDelay + i * 10, r: D.sectionRadius, spec: VARKA_TUNING.debris, ability: WRECKAGE, kind: "debris" });
    });
    w.emit({ type: "deckSections", fighter: f, sections, thrown: aboard });
  }
  step() {
    const w = this.world, f = this.f, T = VARKA_TUNING;
    if (!this.started) { // the Ironsong stands behind her, facing the field
      this.started = true;
      const back = f.forward;
      this.engine = w.spawnObject("engine", f.pos.x - back.x * T.engineBack, f.pos.z - back.z * T.engineBack, f);
      this.engine.yaw = f.yaw; // facing the field, its ramp at the back
      this.objects.push(this.engine);
    }
    if (this.onDeck && !this.engine?.alive) this._breakDeck(false); // broken from below: she comes down with it
    if (this.rules.rolls && this.engine?.alive) this._stepRoll();
    if (this.rules.wreck || this.rules.railgun) this._stepDebris();
  }
  _stepRoll() {
    const w = this.world, f = this.f, T = VARKA_TUNING, e = this.engine;
    if (!this.roll) {
      if (--this.rollTimer > 0) return;
      this.rollTimer = this.onDeck ? T.deck.rollEvery : T.rollEvery;
      // Down a lane through where Rook stands, the whole length of the field.
      const p = w.player, dx = p.pos.x - e.pos.x, dz = p.pos.z - e.pos.z, d = Math.hypot(dx, dz) || 1;
      const to = constrain({ x: e.pos.x + (dx / d) * T.rollSpan, z: e.pos.z + (dz / d) * T.rollSpan }, e.stats.radius + 0.5, w.bounds);
      this.roll = { from: { x: e.pos.x, z: e.pos.z }, to, t: -T.rollWarn, hit: new Set() };
      w.emit({ type: "engineRoll", fighter: f, engine: e, from: this.roll.from, to, half: T.laneHalf, warn: T.rollWarn });
      return;
    }
    const R = this.roll, heading = Math.atan2(R.to.x - R.from.x, R.to.z - R.from.z);
    R.t += f.timeScale;
    if (R.t < 0) { // the warning lane: get out of it (and it swings round to face down it, slowly: there may be people aboard)
      const d = Math.atan2(Math.sin(heading - e.yaw), Math.cos(heading - e.yaw));
      e.yaw += Math.sign(d) * Math.min(Math.abs(d), Math.PI / T.rollWarn * 1.2 * f.timeScale);
      return;
    }
    const k = Math.min(1, R.t / (this.onDeck ? T.deck.rollFrames : T.rollFrames)); // with her aboard, slower: a deck to fight on
    e.anchor.x = R.from.x + (R.to.x - R.from.x) * k; e.anchor.z = R.from.z + (R.to.z - R.from.z) * k;
    e.yaw = heading;
    for (const t of w.fighters) {
      if (t.team === f.team || !t.alive || R.hit.has(t) || t.traits.object || (t.floor || 0) > 0) continue; // (aboard, you ride it)
      if (Math.hypot(t.pos.x - e.anchor.x, t.pos.z - e.anchor.z) > e.stats.radius + T.laneHalf * 0.6 + t.stats.radius) continue;
      R.hit.add(t);
      w._resolve(e, t, { spec: T.roll, ability: ENGINE_RAM, hitSet: new Set(), origin: { x: e.anchor.x, y: 1, z: e.anchor.z }, projectile: true });
    }
    if (k >= 1) { this.roll = null; w.emit({ type: "engineStop", fighter: f, engine: e }); }
  }
  _stepDebris() {
    const w = this.world, T = VARKA_TUNING;
    if (--this.debrisTimer > 0) return;
    this.debrisTimer = this.rules.railgun ? T.debrisEvery * 1.6 : T.debrisEvery;
    const c = this.home, a = w.rng() * Math.PI * 2, r = 2 + w.rng() * 9, p = w.player;
    w.addStrike(this.f, c.x + Math.sin(a) * r, c.z + Math.cos(a) * r, { delay: T.debrisDelay, r: T.debrisRadius, spec: T.debris, ability: WRECKAGE, kind: "debris" });
    w.addStrike(this.f, p.pos.x + (w.rng() - 0.5) * 3, p.pos.z + (w.rng() - 0.5) * 3, { delay: T.debrisDelay, r: T.debrisRadius, spec: T.debris, ability: WRECKAGE, kind: "debris" });
  }
}
