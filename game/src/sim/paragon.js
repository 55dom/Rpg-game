// The Paragon's controller (data/paragon.js): Noon's column of light, Zenith's cross in P2, and Dawnbreak, once, at 20%.

import { PhasedBoss } from "./boss.js";
import { PARAGON_PHASES, PARAGON_TUNING, SUNLIGHT, DAWNBREAK, paragonOptions } from "../data/paragon.js";

export class ParagonController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, PARAGON_PHASES, paragonOptions);
    this.zenithT = 90; this.turn = 0; this.dawn = false;
  }

  onCustom(key) {
    if (key !== "noon") return false;
    const w = this.world, p = w.player, T = PARAGON_TUNING;
    w.addStrike(this.f, p.pos.x, p.pos.z, { delay: T.noonDelay, r: T.noonR, spec: T.noon, ability: SUNLIGHT, kind: "sun" });
    return true;
  }

  enterPhase(p) { if (p === 2) this.world.emit({ type: "zenith", fighter: this.f }); }

  step() {
    const w = this.world, f = this.f, T = PARAGON_TUNING;
    if (!f.alive) return;
    if (this.phase >= 2 && --this.zenithT <= 0) { // a cross of light running out from him; the next one turned 45°
      this.zenithT = T.zenithEvery;
      const base = (this.turn++ % 2) * Math.PI / 4;
      for (let k = 0; k < 4; k++) {
        const a = base + (k * Math.PI) / 2;
        for (let d = T.zenithStep, i = 0; d <= T.zenithArm; d += T.zenithStep, i++)
          w.addStrike(f, f.pos.x + Math.sin(a) * d, f.pos.z + Math.cos(a) * d, { delay: T.zenithDelay + i * 3, r: T.zenithR, spec: T.noon, ability: SUNLIGHT, kind: "sun" });
      }
    }
    if (!this.dawn && f.combatant.health.normalized <= T.dawnAt) { // once: the whole yard goes white
      this.dawn = true;
      f.runner.interrupt();
      w.emit({ type: "dawnbreak", fighter: f, warn: T.dawnWarn });
      w.addStrike(f, f.pos.x, f.pos.z, { delay: T.dawnWarn, r: T.dawnR, spec: T.dawn, ability: DAWNBREAK, kind: "sun" });
    }
  }
}
