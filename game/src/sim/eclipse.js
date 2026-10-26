// Severin Eclipsed's controllers (data/eclipse.js, Boss 10). The dark stars that drag you in, the Lion he
// calls out of the sky, the reflection that stands up out of Mirrorlake and trades places with him, the
// Eclipse clause that erases your Surge, and the moment the lake takes Rook. The last phase is its own
// fight: three clauses of ink (Inscribe) and the corruption breaks.

import { PhasedBoss } from "./boss.js";
import { constrain } from "./bounds.js";
import { ECLIPSED_ABILITIES, ECLIPSED_PHASES, ECLIPSED_TUNING, eclipsedOptions } from "../data/eclipse.js";
import { defineAbility } from "../core/abilities.js";

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const WELL = defineAbility({ id: "DarkStar", startup: 1, active: 1, recovery: 1, hit: ECLIPSED_TUNING.well, events: [] });

export class EclipseController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, ECLIPSED_PHASES, eclipsedOptions);
    this.wells = []; this.lion = null; this.reflection = null; this.swapT = 0; this.eclipseT = 0; this.sunk = false;
    f.combatant.floor = Math.ceil(f.stats.maxHealth * ECLIPSED_TUNING.sinkAt); // this fight ends when the lake takes Rook
  }

  _target() { const t = this.f.target; return t?.alive ? t : this.world.player; }

  onCustom(key) {
    const w = this.world, f = this.f, T = ECLIPSED_TUNING;
    if (key === "darkStars") { // three wells of night around his target
      const t = this._target(), a0 = Math.atan2(f.pos.x - t.pos.x, f.pos.z - t.pos.z);
      for (let i = 0; i < T.wells.count; i++) {
        const a = a0 + Math.PI / 3 + (i / T.wells.count) * Math.PI * 2;
        const at = constrain({ x: t.pos.x + Math.sin(a) * T.wells.ring, z: t.pos.z + Math.cos(a) * T.wells.ring }, 0.5, w.bounds);
        const well = { x: at.x, z: at.z, t: T.wells.life, tick: 0 };
        this.wells.push(well);
        w.emit({ type: "darkStar", fighter: f, at: { x: at.x, y: 0, z: at.z }, frames: T.wells.life, radius: T.wells.pullRadius, well });
      }
      return true;
    }
    if (key === "lion") { this._callLion(); return true; }
    if (key === "mirror") { this._raiseReflection(); return true; }
    if (key === "eclipse") { this._eclipse(); return true; }
    return false;
  }

  _callLion() {
    const w = this.world, f = this.f;
    if (this.lion?.alive) return;
    const c = w.player.pos, a = Math.atan2(f.pos.x - c.x, f.pos.z - c.z) + 1.3;
    const at = constrain({ x: c.x + Math.sin(a) * 5, z: c.z + Math.cos(a) * 5 }, 1, w.bounds);
    this.lion = w.spawnEnemy("lion", at.x, at.z, 60);
    this.damageFactor = ECLIPSED_TUNING.lionWard; this.postureFactor = ECLIPSED_TUNING.lionWard;
    f.tags.add("WARDED", 99999);
    w.emit({ type: "lionCalled", fighter: f, lion: this.lion, at: { x: at.x, y: 0, z: at.z } });
  }

  _raiseReflection() {
    const w = this.world, f = this.f;
    if (this.reflection?.alive) return;
    const at = constrain({ x: -f.pos.x, z: -f.pos.z }, 0.6, w.bounds); // across the lake from him
    this.reflection = w.spawnEnemy("reflection", at.x, at.z, 61);
    this.swapT = ECLIPSED_TUNING.swapEvery;
    w.emit({ type: "mirrorRise", fighter: f, reflection: this.reflection, at: { x: at.x, y: 0, z: at.z } });
  }

  /** Real and reflection trade places. */
  _swap() {
    const r = this.reflection, f = this.f, w = this.world;
    if (!r?.alive || f.runner.isRunning && f.runner.current?.id === "Eclipse") return;
    const a = { x: f.pos.x, z: f.pos.z };
    f.pos.x = f.prev.x = r.pos.x; f.pos.z = f.prev.z = r.pos.z;
    r.pos.x = r.prev.x = a.x; r.pos.z = r.prev.z = a.z;
    w.emit({ type: "mirrorSwap", fighter: f, reflection: r, at: { x: f.pos.x, y: 0, z: f.pos.z }, from: { x: a.x, y: 0, z: a.z } });
  }

  /** The Eclipse clause: your Surge is gone, and won't come back for a while. */
  _eclipse() {
    const w = this.world, T = ECLIPSED_TUNING.eclipse;
    w.player.surge?.set(0);
    w.surgeLock = Math.max(w.surgeLock ?? 0, T.lock);
    this.eclipseT = T.every;
    w.emit({ type: "eclipseClause", fighter: this.f, frames: T.lock });
  }

  enterPhase(p) {
    if (p === 2) this.pending = "CallLion";
    if (p === 3) this.pending = "Mirror";
    if (p === 4) { this.pending = "Eclipse"; this._clearReflection(); }
    if (p === 5) this.sink();
  }

  get brainActive() { return !this.pending && !this.sunk; }

  _clearReflection() {
    const r = this.reflection;
    if (r?.alive) { this.world.emit({ type: "mirrorFade", fighter: r, at: { x: r.pos.x, y: 0, z: r.pos.z } }); r.vanished = true; r.combatant.floor = 0; r.combatant.health.set(0); }
    this.reflection = null;
  }

  /** 12%: the fight turns, and the lake takes Rook. Everything he summoned goes dark. */
  sink() {
    if (this.sunk) return;
    const w = this.world, f = this.f;
    this.sunk = true;
    f.runner.interrupt();
    this._clearReflection();
    if (this.lion?.alive) { this.lion.vanished = true; this.lion.combatant.health.set(0); }
    for (const wl of this.wells) w.emit({ type: "darkStarEnd", well: wl });
    this.wells = [];
    w.surgeLock = 0;
    w.emit({ type: "eclipseSink", fighter: f, at: { x: w.player.pos.x, y: 0, z: w.player.pos.z } });
    f.vanished = true; f.combatant.floor = 0; f.combatant.health.set(0);
  }

  _wells() {
    const w = this.world, f = this.f, T = ECLIPSED_TUNING.wells;
    for (const wl of this.wells) {
      wl.t--;
      for (const t of w.fighters) {
        if (t.team === f.team || !t.alive || t.traits.object || t.traits.dummy || t.pos.y > 1.5) continue;
        const d = flat(t.pos, wl);
        if (d > T.pullRadius) continue;
        if (d > 0.05) { // stronger the closer you are
          const k = (T.pull / 60) * (1 - d / T.pullRadius) * 1.6;
          t.pos.x += ((wl.x - t.pos.x) / d) * Math.min(k, d); t.pos.z += ((wl.z - t.pos.z) / d) * Math.min(k, d);
        }
        if (d < T.core && wl.tick <= 0) w._resolve(f, t, { spec: ECLIPSED_TUNING.well, ability: WELL, hitSet: new Set(), origin: { x: wl.x, y: 0.5, z: wl.z }, projectile: true });
      }
      if (wl.tick <= 0) wl.tick = T.tick; else wl.tick--; // the core burns every T.tick frames
      if (wl.t <= 0) w.emit({ type: "darkStarEnd", well: wl });
    }
    this.wells = this.wells.filter((wl) => wl.t > 0);
  }

  step() {
    const w = this.world, f = this.f;
    if (this.sunk) return;
    if (this.wells.length) this._wells();
    if (this.lion && !this.lion.alive) { // the Lion falls: his ward goes with it
      this.lion = null; this.damageFactor = 1; this.postureFactor = 1; f.tags.remove("WARDED");
      w.emit({ type: "lionFalls", fighter: f });
    }
    if (this.reflection?.alive && --this.swapT <= 0) { this._swap(); this.swapT = ECLIPSED_TUNING.swapEvery; }
    if (this.phase >= 4 && !this.pending && --this.eclipseT <= 0) this.pending = "Eclipse";
    if (this.pending && !f.runner.isRunning && f.combatant.canAct && f.grounded) {
      const a = ECLIPSED_ABILITIES[this.pending];
      this.pending = null;
      f.controller.startDirect(a, w.frame);
    }
  }
}

/**
 * The last phase (after the lake): he's barely standing and he still fights. Nothing kills him. Write on him:
 * three Inscribe hits and the corruption breaks (Ink & Starlight).
 */
export class EclipseFinalController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, [{ phase: 1, above: 0 }], () => []);
    this.inscribed = 0; this.done = false;
    f.combatant.floor = 1;
  }

  onHit(att, ability) {
    if (this.done || att !== this.world.player || ability?.id !== "Inscribe") return;
    this.inscribed++;
    this.world.emit({ type: "inscription", fighter: this.f, n: this.inscribed, of: ECLIPSED_TUNING.inscriptions, at: { x: this.f.pos.x, y: 1.4, z: this.f.pos.z } });
    if (this.inscribed >= ECLIPSED_TUNING.inscriptions) this.finish();
  }

  finish() {
    const w = this.world, f = this.f;
    this.done = true;
    f.runner.interrupt();
    w.emit({ type: "inkStarlight", fighter: f, at: { x: f.pos.x, y: 1.2, z: f.pos.z } });
    f.vanished = true; f.combatant.floor = 0; f.combatant.health.set(0);
  }
}
