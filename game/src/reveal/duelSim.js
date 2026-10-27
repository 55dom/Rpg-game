// The reveal fights' controllers (data in ./duel.js). Both grow out of the masked knight's own (sim/masked.js): the
// tears he steps through, the exposed moment after, left-left-back.

import { MaskedController, MaskedVIController } from "../sim/masked.js";
import { constrain } from "../sim/bounds.js";
import {
  MASK_FINAL_PHASES, MASK_FINAL_TUNING, RAIN_CUT, maskFinalOptions,
  UNMASKED_PHASES, UNMASKED_TUNING, UNMASKED_ABILITIES, DROP, BLADE, GODFALL, unmaskedOptions,
} from "./duel.js";

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** The third duel (Ep 48, Phase 3): he won't go down and he won't leave; break his guard and Underline it. */
export class MaskFinalController extends MaskedVIController {
  constructor(world, f) {
    super(world, f, MASK_FINAL_PHASES, maskFinalOptions);
    f.combatant.floor = Math.ceil(f.stats.maxHealth * MASK_FINAL_TUNING.floor);
    this.underlined = false;
  }

  enterPhase() {} // no leaving with what he came for, this time

  onCustom(key, value = 0) {
    if (key === "rain") { // tears in the air round Rook, and the glaive comes down out of each
      const w = this.world, t = this._target(), R = MASK_FINAL_TUNING.rain;
      for (let i = 0; i < R.n; i++) {
        const a = w.rng() * Math.PI * 2, r = 0.6 + w.rng() * R.spread;
        w.addStrike(this.f, t.pos.x + Math.sin(a) * r, t.pos.z + Math.cos(a) * r, { delay: R.delay + i * R.gap, r: R.r, spec: MASK_FINAL_TUNING.cut, ability: RAIN_CUT, kind: "sever" });
      }
      w.emit({ type: "severRain", fighter: this.f, at: { x: t.pos.x, y: 0, z: t.pos.z } });
      return true;
    }
    return super.onCustom(key, value);
  }

  /** The Inscription finisher on a broken guard: Underline. The mask cracks (the story takes it from here). */
  onHit(att, ability) {
    if (this.underlined || att !== this.world.player || !ability?.tags?.includes("finisher")) return;
    this.underlined = true;
    this.world.emit({ type: "underline", fighter: this.f, at: { x: this.f.pos.x, y: 1.9, z: this.f.pos.z } });
  }
}

/** The fight against Cal (Ep 48): the companion, the evolution, what he actually is; and at 20% he stops. */
export class UnmaskedController extends MaskedController {
  constructor(world, f) {
    super(world, f, UNMASKED_PHASES, unmaskedOptions);
    f.combatant.floor = Math.ceil(f.stats.maxHealth * UNMASKED_TUNING.floor);
    this.quiet = 0; this.stopped = false;
  }

  get brainActive() { return super.brainActive && !this.stopped; }

  /** In the first phase his doors are gold (the doors he opened for you for two arcs); after that, black tears. */
  _tear(at, role) { this.world.emit({ type: this.phase === 1 ? "doorOpen" : "severOpen", fighter: this.f, at: { x: at.x, y: 0, z: at.z }, role }); }

  enterPhase(p) { this.world.emit({ type: "evolve", fighter: this.f, phase: p }); }

  _party() { return this.world.fighters.filter((c) => c.team !== this.f.team && c.alive && !c.traits.object && !c.traits.dummy); }

  onCustom(key, value = 0) {
    const w = this.world, f = this.f, T = UNMASKED_TUNING, t = this._target();
    if (key === "drop") { // P1: a golden door under you, and you fall out of the sky. After: the whole party does.
      const kind = this.phase === 1 ? "gold" : "sever";
      for (const who of this.phase === 1 ? [t] : this._party()) {
        w.addStrike(f, who.pos.x, who.pos.z, { delay: T.drop.delay, r: T.drop.r, spec: T.drop.spec, ability: DROP, kind, lift: T.drop.lift, landing: T.drop.landing });
      }
      return true;
    }
    if (key === "swap") { // the door-swap: you where he was, him where you were, the cut already coming
      const a = { x: f.pos.x, z: f.pos.z }, b = { x: t.pos.x, z: t.pos.z };
      f.pos.x = f.prev.x = b.x; f.pos.z = f.prev.z = b.z; t.pos.x = t.prev.x = a.x; t.pos.z = t.prev.z = a.z;
      f.yaw = f.prevYaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
      w.emit({ type: "doorSwap", fighter: f, target: t, a: { x: a.x, y: 0, z: a.z }, b: { x: b.x, y: 0, z: b.z } });
      f.runner.interrupt();
      f.controller.startDirect(UNMASKED_ABILITIES.DoorCut, w.frame);
      return true;
    }
    if (key === "scramble") { // everyone on his side of the door, somewhere else
      const c = this.center();
      for (const who of this._party()) {
        const a = w.rng() * Math.PI * 2, r = T.scramble.rMin + w.rng() * (T.scramble.rMax - T.scramble.rMin);
        const to = constrain({ x: c.x + Math.sin(a) * r, z: c.z + Math.cos(a) * r }, who.stats.radius, w.bounds);
        w.emit({ type: "scramble", fighter: who, from: { x: who.pos.x, y: 0, z: who.pos.z }, to: { x: to.x, y: 0, z: to.z } });
        who.pos.x = who.prev.x = to.x; who.pos.z = who.prev.z = to.z; who.knock.x = who.knock.z = 0;
      }
      return true;
    }
    if (key === "blades") { // floating spatial blades, one after another down a line at you
      const B = T.blades, d = flat(t.pos, f.pos) || 1, ux = (t.pos.x - f.pos.x) / d, uz = (t.pos.z - f.pos.z) / d;
      for (let i = 1; i <= B.n; i++) {
        const s = Math.min(d + 2, i * B.step);
        w.addStrike(f, f.pos.x + ux * s, f.pos.z + uz * s, { delay: B.delay + i * B.gap, r: B.r, spec: B.spec, ability: BLADE, kind: "sever" });
      }
      w.emit({ type: "blades", fighter: f });
      return true;
    }
    if (key === "godfall") { // the cut that splits the bridge from end to end, through where you stand
      const G = T.godfall, d = flat(t.pos, f.pos) || 1, ux = (t.pos.x - f.pos.x) / d, uz = (t.pos.z - f.pos.z) / d;
      for (let s = 1; s <= G.length; s += G.step) w.addStrike(f, f.pos.x + ux * s, f.pos.z + uz * s, { delay: G.delay, r: G.r, spec: G.spec, ability: GODFALL, kind: "sever" });
      w.emit({ type: "godfall", fighter: f, from: { x: f.pos.x, y: 0, z: f.pos.z }, dir: { x: ux, z: uz }, length: G.length, frames: G.delay });
      return true;
    }
    return super.onCustom(key, value);
  }

  onHit() { this.quiet = 0; }

  step() {
    super.step();
    const f = this.f, w = this.world, hp = f.combatant.health, T = UNMASKED_TUNING;
    if (this.stopped) return;
    if (this.phase >= 3 && ++this.quiet > T.regen.after && hp.current < hp.max) { // the regeneration nobody human has
      hp.add(hp.max * T.regen.perFrame);
      if (this.quiet % 40 === 0) w.emit({ type: "regen", fighter: f });
    }
    if (hp.normalized <= T.floor + 0.002) { // he stops: the fight's over for now, and he has something to say
      this.stopped = true;
      f.runner.interrupt();
      w.strikes = w.strikes.filter((s) => s.owner !== f);
      w.emit({ type: "larkspur", fighter: f });
    }
  }
}
