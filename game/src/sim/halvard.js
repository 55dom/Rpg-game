// B12 · Lance-Commander Halvard's controller (data/halvard.js): the Lances who fall in beside him in P2, his Line
// Charge down a red lane, and the shield that splits in P3.

import { PhasedBoss } from "./boss.js";
import { constrain } from "./bounds.js";
import { HALVARD_PHASES, HALVARD_TUNING, LINE_CHARGE, halvardOptions } from "../data/halvard.js";

export class HalvardController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, HALVARD_PHASES, halvardOptions);
    this.lineT = HALVARD_TUNING.lineEvery; this.line = null; this.called = [];
  }

  enterPhase(p) {
    const w = this.world, f = this.f, T = HALVARD_TUNING;
    if (p === 2) { // "Form the line!": two Lances, either side of him
      this.called = Array.from({ length: T.lances }, (_, i) => {
        const a = f.yaw + (i ? 1.3 : -1.3);
        const at = constrain({ x: f.pos.x + Math.sin(a) * 3, z: f.pos.z + Math.cos(a) * 3 }, 0.6, w.bounds);
        return w.spawnEnemy("lance", at.x, at.z, 90 + i);
      });
      w.emit({ type: "formLine", fighter: f, called: this.called });
    }
    if (p === 3) { // the shield splits
      f.traits = { ...f.traits, frontalGuard: false };
      w.emit({ type: "shieldBreak", fighter: f, at: { x: f.pos.x, y: 1.2, z: f.pos.z } });
    }
  }

  step() {
    const w = this.world, f = this.f, T = HALVARD_TUNING;
    if (this.phase < 2 || !f.alive) return;
    if (!this.line) {
      if (--this.lineT > 0) return;
      this.lineT = T.lineEvery;
      // A lane from him through where Rook stands, the length of the field.
      const p = w.player, dx = p.pos.x - f.pos.x, dz = p.pos.z - f.pos.z, d = Math.hypot(dx, dz) || 1;
      const from = { x: f.pos.x, z: f.pos.z }, to = constrain({ x: f.pos.x + (dx / d) * T.lineLength, z: f.pos.z + (dz / d) * T.lineLength }, 0.5, w.bounds);
      this.line = { from, to, t: T.lineWarn };
      w.emit({ type: "lineCharge", fighter: f, from, to, half: T.lineHalf, warn: T.lineWarn });
      return;
    }
    if (--this.line.t > 0) return;
    const { from, to } = this.line, len = Math.hypot(to.x - from.x, to.z - from.z), n = Math.max(1, Math.floor(len / T.lineStep));
    for (let i = 1; i <= n; i++) { // down the lane a stride at a time
      const k = i / n;
      w.addStrike(f, from.x + (to.x - from.x) * k, from.z + (to.z - from.z) * k, { delay: 2 + i * T.lineGap, r: T.lineHalf, spec: T.line, ability: LINE_CHARGE, kind: "charge" });
    }
    this.line = null;
  }
}
