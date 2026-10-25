// Boss 1: Severin Valcourt, the Exam Duel (GDD §16 B1, Episode 2).
// P1 learn: Star Needles at range (dodge them, cut them, close the distance); a fast rapier up close.
// P2 strategy shift (60%): he takes his Polaris point and pins stars around it. The lines between
// them ignite after a warning: jump or dodge through. Knock him off Polaris and the stars go dark.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

export const SEVERIN_STATS = Object.freeze({
  name: "Severin Valcourt", maxHealth: 900, maxPosture: 200, runSpeed: 4.6, circleSpeed: 2.4, turnRate: 0.14,
  radius: 0.45, height: 1.9, boss: true, yields: true,
  bossTitle: "BOSS 1 · THE KNIGHT EXAM", defeatText: "SEVERIN YIELDS", phaseMarks: [0.6],
});

export const SEVERIN_HITBOXES = Object.freeze({
  Rapier: { center: [0, 1.2, 1.5], size: [0.8, 0.9, 2.4] },
  Sweep: { center: [0, 1.1, 1.1], size: [2.8, 1.0, 1.8] },
  Needle: { center: [0, 0, 0], size: [0.45, 0.45, 0.45], range: 18,
    hit: hitSpec({ damage: 6, posture: 8, hitstop: 2, hitstun: 12, knockback: 1 }) },
});

export const SEVERIN_POSES = Object.freeze({
  rest: [0.55, 0.35, 0],
  Lunge: { from: [0.3, 0.1, 0], to: [-0.05, 0, 0], lean: 0.45 },
  Flurry: { from: [0.2, -0.3, 0], to: [-0.05, 0.3, 0], lean: 0.2 },
  Sweep: { from: [-0.3, 1.5, 0], to: [0.2, -1.4, 0], lean: 0.3 },
  StarNeedles: { from: [-1.2, 0.3, 0], to: [-0.2, 0.2, 0], lean: -0.15 },
  Evade: { from: [0.6, 0.4, 0], to: [0.6, 0.4, 0], lean: -0.4 },
  PlaceStars: { from: [-2.4, 0.2, 0], to: [-2.6, 0.1, 0], lean: -0.3 },
});

export const SEVERIN_ABILITIES = Object.freeze({
  Lunge: defineAbility({ id: "Lunge", startup: 14, active: 5, recovery: 22,
    hit: hitSpec({ damage: 13, posture: 14, hitstop: 5, hitstun: 20, knockback: 3 }),
    events: [sound(10, "dodge"), { frame: 14, type: E.Move, value: 3.4 }, box(14, "Rapier", 5)] }),
  Flurry: defineAbility({ id: "Flurry", startup: 10, active: 14, recovery: 20,
    hit: hitSpec({ damage: 5, posture: 6, hitstop: 2, hitstun: 12, knockback: 0.5 }),
    events: [sound(9), box(10, "Rapier", 3), sound(14), box(15, "Rapier", 3), sound(19), box(20, "Rapier", 3)] }),
  // Red glint: a wide, unblockable sweep. Dodge it.
  Sweep: defineAbility({ id: "Sweep", startup: 24, active: 5, recovery: 28,
    hit: hitSpec({ damage: 18, posture: 26, hitstop: 7, hitstun: 26, knockback: 5, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(20, "swingHeavy"), box(24, "Sweep", 5)] }),
  StarNeedles: defineAbility({ id: "StarNeedles", startup: 20, active: 2, recovery: 24, tags: ["projectile"],
    events: [{ frame: 4, type: E.SpawnVfx, key: "starcharge" }, sound(16, "glint"), { frame: 20, type: E.Custom, key: "fan", value: 3 }] }),
  // Steps back out of reach (brief invulnerability).
  Evade: defineAbility({ id: "Evade", startup: 2, active: 10, recovery: 10,
    events: [sound(0, "dodge"), { frame: 0, type: E.Invulnerable, value: 12 }, { frame: 2, type: E.Move, value: -4.2 }] }),
  PlaceStars: defineAbility({ id: "PlaceStars", startup: 30, active: 4, recovery: 20,
    events: [{ frame: 0, type: E.Invulnerable, value: 34 }, { frame: 6, type: E.SpawnVfx, key: "starcharge" }, sound(26, "surgeFull"),
      { frame: 30, type: E.Custom, key: "stars", value: 1 }, { frame: 30, type: E.CameraCue, key: "punch" }] }),
});

export const severinOptions = (phase) => {
  const A = SEVERIN_ABILITIES;
  const o = [
    new AttackOption(A.StarNeedles, 3.5, 15, 3, 70),
    new AttackOption(A.Lunge, 2.2, 5.5, 2, 60),
    new AttackOption(A.Flurry, 0, 2.4, 3, 50),
    new AttackOption(A.Evade, 0, 1.6, 2, 150),
  ];
  if (phase >= 2) o.push(new AttackOption(A.Sweep, 0, 2.8, 2, 200));
  return o;
};

export const SEVERIN_PHASES = Object.freeze([
  { phase: 1, above: 0.6 },
  { phase: 2, above: 0, stars: true },
]);

export const SEVERIN_TUNING = Object.freeze({
  polaris: { x: 0, z: 6 },    // his anchor point (set per arena)
  starRadius: 7, starCount: 5,
  pulseEvery: 210, warnFrames: 50, activeFrames: 14, lineWidth: 0.55, lineHeight: 0.8, // feet above this = jumped clear
  offPolaris: 1.8,            // knocked this far from Polaris = the stars go dark
  dimStagger: 110, dimPosture: 40, relightAfter: 520,
  line: hitSpec({ damage: 12, posture: 14, hitstop: 4, hitstun: 20, knockback: 2.5 }),
});
