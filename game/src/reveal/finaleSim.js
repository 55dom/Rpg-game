// Episode 50's controllers (data in ./finale.js).
//
//   CalSeatedController  Phase 4: he sits on his door and watches. He can't be hurt, and his brain never acts on its own.
//                        The story's rising gauge (sim/siege.js `rise`) hands him what caught his eye, and he answers it:
//                        a golden door opens under whoever did it (an attack you can see coming, and step out of).
//   CalBondsController   Phase 6: he can't be brought below a share of his health; the Links and the Chain end it.

import { FINALE_TUNING, ANSWER } from "./finale.js";

export class CalSeatedController {
  constructor(world, f) {
    this.world = world; this.f = f; this.answers = 0;
    f.combatant.floor = f.stats.maxHealth; // not a scratch: he isn't fighting yet
    f.seated = 0.55;                       // on the lower edge of his door frame, one leg swinging
  }
  get brainActive() { return false; }
  tick() {}
  answer(ev) {
    const who = ev.attacker?.alive ? ev.attacker : ev.fighter?.alive ? ev.fighter : this.world.player, T = FINALE_TUNING.answer;
    if (!who || who.team === this.f.team) return;
    this.answers++;
    this.world.addStrike(this.f, who.pos.x, who.pos.z, { delay: T.delay, r: T.r, spec: T.spec, ability: ANSWER, kind: "gold" });
  }
}

export class CalBondsController {
  constructor(world, f) { this.world = world; this.f = f; f.combatant.floor = Math.ceil(f.stats.maxHealth * FINALE_TUNING.bondsFloor); }
  get brainActive() { return true; }
  tick() {}
}
