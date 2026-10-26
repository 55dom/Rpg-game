// B11 · The Storm Warden's controller (data/isles.js): the Gale wave it sends out, the lightning rods it raises
// (it's charged, warded, while any stands, and thunder falls near them), and the constellation of thunder in P3.

import { PhasedBoss } from "./boss.js";
import { WARDEN_PHASES, WARDEN_TUNING, WARDEN_THUNDER, WARDEN_GALE, WARDEN_STARS, wardenOptions } from "../data/isles.js";

export class StormWardenController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, WARDEN_PHASES, wardenOptions);
    this.rods = []; this.rodT = WARDEN_TUNING.rodEvery; this.starT = 60; this.line = 0; this.queue = [];
  }

  onCustom(key) {
    if (key !== "gale") return false;
    const T = WARDEN_TUNING, f = this.f;
    this.world.addWave(f, f.pos.x, f.pos.z, { ...T.gale, spec: T.galeHit, ability: WARDEN_GALE, kind: "gale" });
    return true;
  }

  enterPhase(p) {
    const w = this.world, f = this.f;
    if (p === 2) { // the rods rise: charged while any of them stands
      this.rods = this._ring(WARDEN_TUNING.rods, WARDEN_TUNING.rodRadius, "rod");
      f.tags.add("WARDED", 99999);
      w.emit({ type: "rodsRise", fighter: f, rods: this.rods });
    }
    if (p === 3) w.emit({ type: "constellation", fighter: f });
  }

  step() {
    const w = this.world, f = this.f, T = WARDEN_TUNING;
    if (this.phase >= 2 && this.rods.length) {
      if (this.rods.every((r) => !r.alive)) { // every rod down: the charge goes out of it
        this.rods = [];
        f.tags.remove("WARDED");
        w.emit({ type: "rodsBroken", fighter: f });
      } else if (--this.rodT <= 0) { // thunder falls on whoever's nearest a standing rod
        this.rodT = T.rodEvery;
        for (const r of this.rods.filter((q) => q.alive)) {
          const t = w.fighters.filter((q) => q.team !== f.team && q.alive && !q.traits.object && !q.traits.dummy)
            .sort((a, b) => Math.hypot(a.pos.x - r.pos.x, a.pos.z - r.pos.z) - Math.hypot(b.pos.x - r.pos.x, b.pos.z - r.pos.z))[0];
          if (t && Math.hypot(t.pos.x - r.pos.x, t.pos.z - r.pos.z) < 9) w.addStrike(f, t.pos.x, t.pos.z, { delay: T.rodDelay, r: T.rodStrikeR, spec: T.thunder, ability: WARDEN_THUNDER, kind: "thunder" });
        }
      }
    }
    if (this.phase >= 3) { // the constellation: a line at a time, star by star, in the order they were drawn
      if (--this.starT <= 0) {
        this.starT = T.starEvery;
        const stars = WARDEN_STARS[this.line++ % WARDEN_STARS.length];
        stars.forEach(([dx, dz], i) => this.queue.push({ at: i * T.starStep, x: this.home.x + dx, z: this.home.z + dz }));
      }
      for (const q of this.queue) if (--q.at <= 0) w.addStrike(f, q.x, q.z, { delay: T.starDelay, r: T.starR, spec: T.thunder, ability: WARDEN_THUNDER, kind: "thunder" });
      this.queue = this.queue.filter((q) => q.at > 0);
    }
  }
}
