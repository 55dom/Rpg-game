// Sparring partner: Vice Captain Cal (Episode 3's dodge lesson). Quick saber cuts, one red-glint
// thrust to dodge, and evasions of his own. He taps out when worn down; nobody gets hurt.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

export const CAL_STATS = Object.freeze({
  name: "Cal", maxHealth: 320, maxPosture: 150, runSpeed: 4.4, circleSpeed: 2.6, turnRate: 0.16,
  radius: 0.42, height: 1.9, boss: true, yields: true,
  bossTitle: "SPARRING · VICE CAPTAIN CAL", defeatText: "CAL TAPS OUT", phaseMarks: [],
});

export const CAL_HITBOXES = Object.freeze({
  Saber: { center: [0, 1.2, 1.3], size: [1.8, 1.0, 1.9] },
  Point: { center: [0, 1.2, 1.6], size: [0.8, 0.9, 2.6] },
});

export const CAL_POSES = Object.freeze({
  rest: [0.6, 0.3, 0],
  Cut: { from: [-0.4, 1.4, 0], to: [0.3, -1.3, 0], lean: 0.25 },
  Thrust: { from: [0.4, 0.2, 0], to: [-0.05, 0, 0], lean: 0.5 },
  SideStep: { from: [0.6, 0.3, 0], to: [0.6, 0.3, 0], lean: -0.2 },
  BackStep: { from: [0.6, 0.3, 0], to: [0.6, 0.3, 0], lean: -0.4 },
});

export const CAL_ABILITIES = Object.freeze({
  Cut: defineAbility({ id: "Cut", startup: 12, active: 4, recovery: 22,
    hit: hitSpec({ damage: 5, posture: 10, hitstop: 3, hitstun: 14, knockback: 2 }),
    events: [sound(9), box(12, "Saber", 4)] }),
  // Red glint: can't be blocked. The lesson is to dodge it.
  Thrust: defineAbility({ id: "Thrust", startup: 28, active: 5, recovery: 30,
    hit: hitSpec({ damage: 8, posture: 18, hitstop: 5, hitstun: 22, knockback: 4, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(24, "swingHeavy"), { frame: 28, type: E.Move, value: 2.6 }, box(28, "Point", 5)] }),
  SideStep: defineAbility({ id: "SideStep", startup: 1, active: 9, recovery: 8,
    events: [sound(0, "dodge"), { frame: 0, type: E.Invulnerable, value: 11 }, { frame: 1, type: E.Move, key: "left", value: 2.6 }] }),
  BackStep: defineAbility({ id: "BackStep", startup: 1, active: 9, recovery: 8,
    events: [sound(0, "dodge"), { frame: 0, type: E.Invulnerable, value: 11 }, { frame: 1, type: E.Move, value: -3 }] }),
});

export const calOptions = () => [
  new AttackOption(CAL_ABILITIES.Cut, 0, 2.4, 3, 40),
  new AttackOption(CAL_ABILITIES.Thrust, 1.5, 3.6, 2, 150),
];

export const CAL_TUNING = Object.freeze({ evadeRange: 3, evadeCooldown: 80, pattern: ["SideStep", "SideStep", "BackStep"] });

// ---- Cal beside you (Ep 18, the Hollow Bloom: GDD §16 B7 P1, "his strongest Assists") -------------------------------
// The saber he spars with, in earnest; and Threshold, his door, the way he'd use it to keep you alive: a golden door
// stands up in front of you, facing the threat, and nothing comes through it (no petal, no pulse) for a few seconds.
// He opens it himself when something's about to land on you (or call it: 3).
export const THRESHOLD = defineAbility({ id: "Threshold", startup: 10, active: 4, recovery: 18, tags: ["assist"],
  events: [sound(4, "door"), { frame: 10, type: E.Custom, key: "threshold", value: 170 }] });
const SQUAD_CUT = defineAbility({ id: "Cut", startup: 11, active: 4, recovery: 18,
  hit: hitSpec({ damage: 13, posture: 14, hitstop: 4, hitstun: 16, knockback: 2 }), events: [sound(8), box(11, "Saber", 4)] });
const SQUAD_THRUST = defineAbility({ id: "Thrust", startup: 18, active: 5, recovery: 24,
  hit: hitSpec({ damage: 20, posture: 22, hitstop: 5, hitstun: 22, knockback: 3 }),
  events: [sound(15, "swingHeavy"), { frame: 18, type: E.Move, value: 2.2 }, box(18, "Point", 5)] });
export const CAL_SQUAD = Object.freeze({
  stats: { name: "Cal", maxHealth: 340, maxPosture: 150, runSpeed: 5.8, turnRate: 0.2, radius: 0.42, height: 1.9, assistCooldownFrames: 420, reviveFrames: 480 },
  hitboxes: CAL_HITBOXES, assist: THRESHOLD, assistInPlace: true, slot: [0, -2.2],
  options: () => [new AttackOption(SQUAD_CUT, 0, 2.4, 3, 30), new AttackOption(SQUAD_THRUST, 1.5, 3.6, 2, 100)],
  supports: () => [{ ability: THRESHOLD, kind: "shield", cooldownFrames: 540 }],
});
