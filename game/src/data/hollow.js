// The Hollow (GDD §13 Hollowmarch: "full of armor with nobody inside it"). Arc 4, Ep 33: under the Lowmarket the old
// city's door hums, and what walks out of it is armor with no one in it.
//
//   Hollow Shell  an empty suit of old armor with a sword. Slow and heavy: nothing staggers it mid-swing. A Cleave,
//                 and an Overhead that splits the ground (red glint: it can't be blocked). Knock it apart and it lies
//                 in pieces for a few seconds, then pulls itself back together, once, at less than half its strength.
//                 The second time, it stays down.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });

/** How a shell comes back: frames lying in pieces, and the share of its health it gets up with. */
export const REFORM = Object.freeze({ after: 210, health: 0.45 });

// Named Slash and Thrust so the townsfolk arm poses swing with them.
const SHELL_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 16, active: 5, recovery: 26,
    hit: hitSpec({ damage: 13, posture: 20, hitstop: 5, hitstun: 20, knockback: 2.5 }),
    events: [sound(12, "swingHeavy"), box(16, "Blade", 5)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 32, active: 5, recovery: 34, // the Overhead: up, and down through the floor
    hit: hitSpec({ damage: 20, posture: 30, hitstop: 7, hitstun: 26, knockback: 3, unblockable: true }),
    events: [glint(0), sound(28, "swingHeavy"), sound(32, "slam"), box(32, "Split", 5)] }),
});

export const SHELL_POSES = Object.freeze({ rest: [0.5, 0.5, 0], Slash: { from: [-0.9, 1.6, 0], to: [0.7, -1.4, 0] }, Thrust: { from: [-2.4, 0.1, 0], to: [0.4, 0, 0], lean: 0.35 } });

export const HOLLOW_ENEMIES = Object.freeze({
  shell: {
    stats: { name: "Hollow Shell", maxHealth: 190, maxPosture: 120, runSpeed: 3.2, circleSpeed: 1.6, turnRate: 0.09, radius: 0.5, height: 2.2 },
    hitboxes: { Blade: { center: [0, 1.1, 1.2], size: [2.4, 1.6, 2.0] }, Split: { center: [0, 0.6, 2.0], size: [1.2, 1.4, 3.6] } },
    abilities: SHELL_ABILITIES, poses: SHELL_POSES,
    options: () => [new AttackOption(SHELL_ABILITIES.Slash, 0, 2.4, 3, 55), new AttackOption(SHELL_ABILITIES.Thrust, 1.6, 4.2, 2, 170)],
    traits: { heavy: true, armoredAttacks: true, reform: true },
  },
});
