// Boss 2: Hask the Bogwarden (GDD §16 B2, Episode 4, Greywater Fens).
// P1 learn: it submerges and its mud waves make you WEIGHTED. Wind on its mound uproots it.
// P2 strategy shift (65%): enraged, calls Fen Hounds out of the bog, fans its mud waves.
// P3 arena change (35%): the bog drains. It can't submerge any more, its soft underside is EXPOSED, and it charges.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

export const HASK_STATS = Object.freeze({
  name: "Hask the Bogwarden", maxHealth: 1500, maxPosture: 260, runSpeed: 3.0, circleSpeed: 1.2, turnRate: 0.06,
  radius: 1.1, height: 3.2, elite: true, boss: true,
  bossTitle: "BOSS 2 · THE GREYWATER FENS", defeatText: "BOGWARDEN DEFEATED", drop: "RARE PAGE · VACUUM PULL", bog: true, phaseMarks: [0.65, 0.35],
});

export const HASK_HITBOXES = Object.freeze({
  Claw: { center: [0, 1.4, 2.0], size: [3.6, 2.6, 3.0] },
  Flop: { center: [0, 0.6, 0.6], size: [6.4, 1.8, 6.4] },
  Charge: { center: [0, 1.2, 1.4], size: [3.0, 2.4, 2.2] },
  Erupt: { center: [0, 1.2, 0], size: [4.4, 3.0, 4.4] },
  Spit: { center: [0, 0, 0], size: [0.8, 0.8, 0.8], range: 18,
    hit: hitSpec({ damage: 12, posture: 10, hitstop: 3, hitstun: 16, knockback: 1, applyTags: [["WEIGHTED", 240]] }) },
  // Mud waves skim the ground: jump over them or dodge through them.
  Wave: { center: [0, 0, 0], size: [1.6, 0.9, 1.6], range: 16, flat: true, height: 0.45,
    hit: hitSpec({ damage: 10, posture: 12, hitstop: 3, hitstun: 14, knockback: 2, applyTags: [["WEIGHTED", 300]] }) },
});

export const HASK_POSES = Object.freeze({
  rest: [0.9, 0.5, 0],
  Swipe: { from: [-0.9, 1.7, 0], to: [0.7, -1.4, 0], lean: 0.35 },
  BellyFlop: { from: [-2.4, 0, 0], to: [1.2, 0, 0], lean: 0.7 },
  MudSpit: { from: [0.2, 0.3, 0], to: [0.2, 0.3, 0], lean: -0.3 },
  Dive: { from: [1.2, 0, 0], to: [1.6, 0, 0], lean: 0.9 },
  Erupt: { from: [1.4, 0, 0], to: [-2.0, 0, 0], lean: -0.3 },
  Roar: { from: [-0.6, 1.2, 0], to: [-0.8, 1.4, 0], lean: -0.45 },
  Charge: { from: [0.6, 0.2, 0], to: [0.4, 0, 0], lean: 0.8 },
});

export const HASK_ABILITIES = Object.freeze({
  Swipe: defineAbility({ id: "Swipe", startup: 20, active: 6, recovery: 26,
    hit: hitSpec({ damage: 22, posture: 30, hitstop: 7, hitstun: 26, knockback: 5 }),
    events: [sound(16, "swingHeavy"), box(20, "Claw", 6)] }),
  // Leaps and lands on its belly: unblockable shockwave.
  BellyFlop: defineAbility({ id: "BellyFlop", startup: 36, active: 6, recovery: 44,
    hit: hitSpec({ damage: 30, posture: 40, hitstop: 9, hitstun: 30, knockback: 7, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, { frame: 14, type: E.Custom, key: "jump", value: 9 },
      sound(32, "slam"), box(36, "Flop", 6), { frame: 36, type: E.SpawnVfx, key: "mudwave" }, { frame: 36, type: E.CameraCue, key: "punch" }] }),
  MudSpit: defineAbility({ id: "MudSpit", startup: 24, active: 2, recovery: 26,
    events: [sound(20, "vacuum"), { frame: 24, type: E.Projectile, key: "Spit", value: 15 }] }),
  // Sinks into the bog (the controller takes over while it's under).
  Dive: defineAbility({ id: "Dive", startup: 28, active: 2, recovery: 2,
    events: [sound(10, "slam"), { frame: 20, type: E.SpawnVfx, key: "mudwave" }, { frame: 28, type: E.Custom, key: "submerge", value: 1 }] }),
  // Bursts up under its target (after the warning ring): launches, unblockable.
  Erupt: defineAbility({ id: "Erupt", startup: 2, active: 6, recovery: 34,
    hit: hitSpec({ damage: 26, posture: 30, hitstop: 8, hitstun: 36, launch: 10, unblockable: true }),
    events: [sound(0, "slam"), box(2, "Erupt", 6), { frame: 2, type: E.SpawnVfx, key: "mudwave" }, { frame: 2, type: E.CameraCue, key: "punch" }] }),
  Roar: defineAbility({ id: "Roar", startup: 30, active: 10, recovery: 20,
    events: [{ frame: 0, type: E.Invulnerable, value: 60 }, sound(24, "postureBreak"), { frame: 30, type: E.CameraCue, key: "finisher" },
      { frame: 30, type: E.Custom, key: "summon", value: 2 }] }),
  // Phase 3 only: a long, straight charge across the drained bed.
  Charge: defineAbility({ id: "Charge", startup: 26, active: 22, recovery: 34,
    hit: hitSpec({ damage: 24, posture: 30, hitstop: 7, hitstun: 26, knockback: 8 }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(22, "swingHeavy"), { frame: 26, type: E.Move, value: 11 }, box(26, "Charge", 22)] }),
});

/** The attacks Hask picks from while surfaced, by phase. Dives are scheduled by the boss controller. */
export const haskOptions = (phase) => {
  const A = HASK_ABILITIES;
  const base = [new AttackOption(A.Swipe, 0, 3.4, 3, 70), new AttackOption(A.MudSpit, 4, 14, 2, 120)];
  if (phase >= 2) base.push(new AttackOption(A.BellyFlop, 0, 4.2, 2, 200));
  if (phase >= 3) base.push(new AttackOption(A.Charge, 4, 13, 2, 220));
  return base;
};

/** Phase rules. `diveEvery`: frames on the surface between dives (0 = never). */
export const HASK_PHASES = Object.freeze([
  { phase: 1, above: 0.65, diveEvery: 540, waves: 1 },
  { phase: 2, above: 0.35, diveEvery: 420, waves: 3, summon: true },
  { phase: 3, above: 0, diveEvery: 0, waves: 0, drained: true },
]);
export const HASK_TUNING = Object.freeze({
  submergedFrames: 200, minUnderFrames: 90, burrowSpeed: 4.2, waveEvery: 55, warnFrames: 40,
  uprootStagger: 150, uprootPosture: 70, uprootLaunch: 9, exposedFactor: 1.5,
});
