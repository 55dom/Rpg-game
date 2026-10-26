// B13 · The Eraser's controller (data/eraser.js): the Blank that rubs out mana and Surge, the blank patches that open
// under you in P2, and the wall of blank that rolls out of it in P3.

import { PhasedBoss } from "./boss.js";
import { constrain } from "./bounds.js";
import { ERASER_PHASES, ERASER_TUNING, UNWRITE, ERASURE, eraserOptions } from "../data/eraser.js";

export class EraserController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, ERASER_PHASES, eraserOptions);
    this.blanks = []; this.holeT = ERASER_TUNING.holeEvery; this.erasureT = 120;
  }

  onCustom(key) {
    if (key !== "blank") return false;
    const w = this.world, f = this.f, T = ERASER_TUNING, fw = f.forward;
    const at = constrain({ x: f.pos.x + fw.x * T.blankAhead, z: f.pos.z + fw.z * T.blankAhead }, 0.3, w.bounds);
    this.blanks.push({ ...at, t: T.blankDelay });
    w.emit({ type: "blankRing", fighter: f, at: { x: at.x, y: 0, z: at.z }, r: T.blankR, delay: T.blankDelay });
    return true;
  }

  enterPhase(p) {
    const w = this.world, f = this.f;
    if (p === 2) w.emit({ type: "unwrite", fighter: f });
    if (p === 3) w.emit({ type: "erasure", fighter: f });
  }

  step() {
    const w = this.world, f = this.f, T = ERASER_TUNING;
    for (const b of this.blanks) { // the Blank lands: whoever's in the ring is rubbed out
      if (--b.t > 0) continue;
      for (const t of w.fighters) {
        if (t.team === f.team || !t.alive || t.traits.object || t.pos.y > 2) continue;
        if (Math.hypot(t.pos.x - b.x, t.pos.z - b.z) > T.blankR + t.stats.radius * 0.5) continue;
        t.mana?.set(0); t.surge?.set(0);
        w.emit({ type: "blanked", fighter: t, at: { x: t.pos.x, y: 1, z: t.pos.z } });
      }
    }
    this.blanks = this.blanks.filter((b) => b.t > 0);
    if (!f.alive) return;
    if (this.phase >= 2 && --this.holeT <= 0) { // blank patches: one under Rook, one where Rook is going
      this.holeT = T.holeEvery;
      const p = w.player, v = p.vel ?? { x: 0, z: 0 };
      const spots = [{ x: p.pos.x, z: p.pos.z }, { x: p.pos.x + (v.x || 0) * 0.9, z: p.pos.z + (v.z || 0) * 0.9 + 1.6 }].slice(0, T.holes);
      for (const s of spots) w.addStrike(f, s.x, s.z, { delay: T.holeDelay, r: T.holeR, spec: T.hole, ability: UNWRITE, kind: "rift", lift: T.dropHeight });
    }
    if (this.phase >= 3 && --this.erasureT <= 0) {
      this.erasureT = T.erasureEvery;
      w.addWave(f, f.pos.x, f.pos.z, { ...T.erasure, spec: T.erasureHit, ability: ERASURE, kind: "erasure" });
    }
  }
}
