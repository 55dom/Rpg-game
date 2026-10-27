// Backlash's controllers (data in ./backlash.js).
//
//   TrialKnightController  Trial 5 (BACKLASH.md §1 Ch 2, E6). ORDER: ATTACK THE KNIGHT. He charges; when the charge
//     ends he's overextended, and for a moment (`opening`) the kill is right there. The memory is fixed: Cal didn't take
//     it. Strike him in the opening and the memory corrects itself ("No. That's not how it went.") and he charges again.
//     Let the opening pass, and the order flickers and fades, and the Knight retreats, alive: "spared".
//   SaintController        her prayer: ten seconds, nothing stops it (Ch 4). When it completes: "sacrifice".

import { PhasedBoss } from "../sim/boss.js";
import { TRIAL_KNIGHT_TUNING, trialKnightOptions } from "./backlash.js";

export class TrialKnightController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, [{ phase: 1, above: 0 }], trialKnightOptions);
    f.combatant.floor = Math.ceil(f.stats.maxHealth * TRIAL_KNIGHT_TUNING.floor);
    this.opening = 0; this.spared = false;
  }

  get brainActive() { return this.opening <= 0 && !this.spared; }

  onCustom(key) {
    if (key !== "chargeEnd") return false;
    this.opening = TRIAL_KNIGHT_TUNING.opening;
    this.f.runner.interrupt();
    this.world.emit({ type: "opening", fighter: this.f, frames: this.opening });
    return true;
  }

  onHit(att) {
    if (this.opening <= 0 || att !== this.world.player || this.spared) return;
    this.opening = 0; // you took it: that isn't how it went
    this.world.emit({ type: "memoryCorrect", fighter: this.f });
  }

  step() {
    if (this.spared || this.opening <= 0) return;
    if (--this.opening === 0) {
      this.spared = true;
      this.world.strikes = this.world.strikes.filter((s) => s.owner !== this.f);
      this.world.emit({ type: "spared", fighter: this.f });
    }
  }
}

export class SaintController {
  constructor(world, f) { this.world = world; this.f = f; this.praying = false; }
  onCustom(key) {
    if (key === "prayStart") { this.praying = true; this.world.emit({ type: "prayer", fighter: this.f }); return true; }
    if (key === "prayEnd") { this.praying = false; this.world.emit({ type: "sacrifice", fighter: this.f }); return true; }
    return false;
  }
}
