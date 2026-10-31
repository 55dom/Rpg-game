// The Crimson Bell (GDD §12.1): the Crown's inquisition squad, Captain Ulric Graves. "Forbidden magic must be
// silenced." Their magic is Paper Seal (§9, Constructs 16): talismans that go off where they land, binding seals
// that hold you where you stand, and walls of folded paper. They're not villains, and they don't fight to kill:
// in the Bell Tower they test you (Ep 52, the Silencing).
//
//   Blast Talisman  a strip of paper thrown flat: it bursts on whoever it reaches.
//   Binding Seal    a seal laid on the floor under you; if you're still on it when it closes, you're bound in place.
//   Fold            up close, a palm and a snap of paper that shoves you back out of reach.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

export const BELL_TUNING = Object.freeze({
  seal: { delay: 54, r: 1.3, bound: 80 }, // frames until the seal closes; how long it holds you
});

/** The Binding Seal when it closes on you (sim/world.js addStrike, kind "seal"). */
export const SEAL = hitSpec({ damage: 7, posture: 10, hitstop: 4, hitstun: 16, knockback: 0, applyTags: [["BOUND", BELL_TUNING.seal.bound]] });

export const BELL_ABILITIES = Object.freeze({
  Talisman: defineAbility({ id: "Talisman", startup: 18, active: 2, recovery: 24, tags: ["projectile"],
    events: [sound(14, "glint"), { frame: 18, type: E.Projectile, key: "Talisman", value: 12 }] }),
  Binding: defineAbility({ id: "Binding", startup: 24, active: 2, recovery: 30,
    events: [sound(8, "glint"), { frame: 24, type: E.Custom, key: "seal", value: BELL_TUNING.seal.delay }] }),
  Fold: defineAbility({ id: "Fold", startup: 10, active: 3, recovery: 18,
    hit: hitSpec({ damage: 6, posture: 10, hitstop: 3, hitstun: 12, knockback: 5 }),
    events: [sound(8), box(10, "Palm", 3)] }),
});

export const BELL_ENEMIES = Object.freeze({
  bellWarden: {
    stats: { name: "Bell Warden", maxHealth: 130, maxPosture: 70, runSpeed: 4.0, circleSpeed: 2.2, turnRate: 0.14, radius: 0.45, height: 2.0 },
    hitboxes: {
      Talisman: { center: [0, 0, 0], size: [0.6, 0.6, 0.6], range: 15, hit: hitSpec({ damage: 9, posture: 10, hitstop: 3, hitstun: 14, knockback: 1.6 }) },
      Palm: { center: [0, 1, 1.0], size: [1.6, 1.6, 1.6] },
    },
    abilities: BELL_ABILITIES,
    poses: { rest: [0.6, 0.3, 0], Talisman: { from: [-0.8, 0.3, 0], to: [0.3, 0, 0] }, Binding: { from: [-1.5, 0, 0], to: [0.6, 0, 0], lean: 0.2 },
      Fold: { from: [0.3, 0.5, 0], to: [0.1, -0.2, 0], lean: 0.3 } },
    options: () => [new AttackOption(BELL_ABILITIES.Talisman, 3, 12, 3, 60), new AttackOption(BELL_ABILITIES.Binding, 0, 14, 2, 240),
      new AttackOption(BELL_ABILITIES.Fold, 0, 1.9, 2, 60)],
    traits: { ranged: true },
  },
});
