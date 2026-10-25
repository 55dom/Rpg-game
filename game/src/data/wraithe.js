// Wraithe, the Pale Choir's rift-walker (GDD §14 Arc 3 Ep 23, §15.6 red herring 2). An assassin who cuts
// pale seams in the air and steps through them, and never says a word: the Choir's silent school casts
// without spell names. He comes for Rook at Brannoc's funeral, and when the fight turns he leaves the way
// he came. He isn't one of the ten bosses; he lives to be seen again.
//
// His kit (a mini-boss fight):
//   Flurry    two quick needle cuts up close.
//   RiftStep  he steps into a pale tear and is gone; a second tear opens behind his target, and he comes
//             out of it with a stab. Watch for the second tear: turn and parry, or dodge.
//   Undertow  a pale tear opens under your feet. Get out before it closes, or you fall through it and
//             drop out of the air above, hard.
// P1 (100–65%): Flurry, RiftStep, Undertow.
// P2 (65%): two Choir acolytes step out of tears to help him; tears come quicker, and the Undertow takes
//   a squadmate as well as you.
// At 30% he escapes through a tear (and takes his acolytes with him). That ends the fight.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

export const WRAITHE_STATS = Object.freeze({
  name: "Wraithe", maxHealth: 1300, maxPosture: 200, runSpeed: 4.8, circleSpeed: 3, turnRate: 0.2, radius: 0.42, height: 1.95,
  boss: true, bossTitle: "THE PALE CHOIR · WRAITHE", defeatText: "WRAITHE SLIPS AWAY", phaseMarks: [0.65, 0.3],
});

export const WRAITHE_HITBOXES = Object.freeze({
  Needle: { center: [0, 1.2, 1.2], size: [1.6, 1.0, 1.8] },
  Stab: { center: [0, 1.2, 1.4], size: [1.0, 1.2, 2.2] },
});

export const WRAITHE_POSES = Object.freeze({
  rest: [0.6, 0.4, 0],
  Flurry: { from: [-0.5, 1.4, 0], to: [0.4, -1.2, 0], lean: 0.3 },
  RiftStep: { from: [0.3, 0.2, 0], to: [-0.1, 0, 0], lean: 0.45 },
  Undertow: { from: [-1.6, 0.6, 0], to: [-1.4, 0.3, 0], lean: -0.15 },
});

export const WRAITHE_TUNING = Object.freeze({
  escapeAt: 0.3,         // he leaves at 30% health; nobody gets to finish him here
  exitBehind: 1.7,       // how far behind his target the second tear opens
  undertowRadius: 1.5, undertowDelay: 54, dropHeight: 7,
  undertow: hitSpec({ damage: 12, posture: 10, hitstop: 4, hitstun: 44, knockback: 0, unblockable: true }),
  acolytes: 2,
});

export const WRAITHE_ABILITIES = Object.freeze({
  Flurry: defineAbility({ id: "Flurry", startup: 8, active: 8, recovery: 18,
    hit: hitSpec({ damage: 7, posture: 8, hitstop: 3, hitstun: 14, knockback: 1 }),
    events: [sound(6), box(8, "Needle", 3), sound(11), box(12, "Needle", 3)] }),
  // Out through one tear (frame 0), the exit tear opens behind his target (frame 10), he steps out of it
  // (frame 24) and stabs (frame 34). The stab can be blocked and parried: the tear is the warning.
  RiftStep: defineAbility({ id: "RiftStep", startup: 34, active: 4, recovery: 26,
    hit: hitSpec({ damage: 14, posture: 18, hitstop: 5, hitstun: 20, knockback: 3 }),
    events: [custom(0, "riftOut"), custom(10, "riftMark"), custom(24, "riftIn"), sound(30, "swingHeavy"), box(34, "Stab", 4)] }),
  Undertow: defineAbility({ id: "Undertow", startup: 20, active: 2, recovery: 30,
    events: [custom(20, "undertow")] }),
});

export const wraitheOptions = (phase) => {
  const A = WRAITHE_ABILITIES, late = phase >= 2;
  return [
    new AttackOption(A.Flurry, 0, 2.2, 3, 40),
    new AttackOption(A.RiftStep, 2.4, 16, 2, late ? 150 : 210),
    new AttackOption(A.Undertow, 3, 16, late ? 2 : 1, late ? 210 : 300),
  ];
};

export const WRAITHE_PHASES = Object.freeze([{ phase: 1, above: 0.65 }, { phase: 2, above: 0.3, called: true }, { phase: 3, above: 0, escape: true }]);

/** What the Undertow is called when it drops someone (the controller fires it; there's no move of its own). */
export const UNDERTOW = defineAbility({ id: "Undertow", startup: 1, active: 1, recovery: 1, hit: WRAITHE_TUNING.undertow, events: [] });
