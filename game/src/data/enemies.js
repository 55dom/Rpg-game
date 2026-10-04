// The Greywater Fens roster (GDD §13, §14 Arc 1): five enemy types with distinct jobs.
// Each entry: stats, hitboxes, moves, AI options, and traits the simulation understands:
//   heavy: can't be launched or pulled until its posture breaks
//   armoredAttacks: super armor while attacking (hits don't interrupt)
//   frontalGuard: blocks every blockable hit from the front while not attacking

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { ACOLYTE_STATS, ACOLYTE_HITBOXES, ACOLYTE_ABILITIES, ACOLYTE_POSES, acolyteOptions } from "./acolyte.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });

// ---- Fen Hound: fast pack rusher ----------------------------------------------------------
const HOUND_ABILITIES = Object.freeze({
  Bite: defineAbility({ id: "Bite", startup: 10, active: 3, recovery: 18,
    hit: hitSpec({ damage: 8, posture: 10, hitstop: 3, hitstun: 14, knockback: 1 }),
    events: [sound(8), box(10, "Jaw", 3)] }),
  Lunge: defineAbility({ id: "Lunge", startup: 16, active: 6, recovery: 26,
    hit: hitSpec({ damage: 12, posture: 14, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(12, "dodge"), { frame: 16, type: E.Move, value: 4 }, box(16, "Jaw", 6)] }),
});

// ---- Choir Cantor: ranged singer and support ----------------------------------------------
const CANTOR_ABILITIES = Object.freeze({
  SoundBolt: defineAbility({ id: "SoundBolt", startup: 22, active: 2, recovery: 26, tags: ["projectile"],
    events: [{ frame: 6, type: E.SpawnVfx, key: "sing" }, sound(18, "glint"), { frame: 22, type: E.Projectile, key: "Bolt", value: 13 }] }),
  // Hymn: wards every Choir member nearby (super armor, -30% damage) for 5 s. Wind dispels it.
  Hymn: defineAbility({ id: "Hymn", startup: 30, active: 4, recovery: 30,
    events: [{ frame: 0, type: E.SpawnVfx, key: "sing" }, { frame: 30, type: E.Custom, key: "ward", value: 300 }, sound(28, "heal")] }),
  Shove: defineAbility({ id: "Shove", startup: 9, active: 3, recovery: 16,
    hit: hitSpec({ damage: 6, posture: 8, hitstop: 3, hitstun: 12, knockback: 5 }),
    events: [sound(7), box(9, "Palm", 3)] }),
});

// ---- Choir Bulwark: shield defender -------------------------------------------------------
const BULWARK_ABILITIES = Object.freeze({
  ShieldBash: defineAbility({ id: "ShieldBash", startup: 14, active: 4, recovery: 20,
    hit: hitSpec({ damage: 10, posture: 22, hitstop: 5, hitstun: 22, knockback: 4 }),
    events: [sound(11, "block"), { frame: 13, type: E.Move, value: 1.2 }, box(14, "Bash", 4)] }),
  SpearThrust: defineAbility({ id: "SpearThrust", startup: 20, active: 4, recovery: 24,
    hit: hitSpec({ damage: 16, posture: 18, hitstop: 5, hitstun: 22, knockback: 2 }),
    events: [sound(17, "swingHeavy"), box(20, "Spear", 4)] }),
});

// ---- Bog Beast: elite brute ---------------------------------------------------------------
const BEAST_ABILITIES = Object.freeze({
  Swipe: defineAbility({ id: "Swipe", startup: 18, active: 5, recovery: 24,
    hit: hitSpec({ damage: 18, posture: 26, hitstop: 6, hitstun: 24, knockback: 4 }),
    events: [sound(14, "swingHeavy"), box(18, "Claw", 5)] }),
  MudSlam: defineAbility({ id: "MudSlam", startup: 34, active: 6, recovery: 40,
    hit: hitSpec({ damage: 28, posture: 40, hitstop: 9, hitstun: 30, knockback: 6, unblockable: true }),
    events: [glint(0), sound(30, "slam"), box(34, "Quake", 6), { frame: 34, type: E.CameraCue, key: "punch" }, { frame: 34, type: E.SpawnVfx, key: "mudwave" }] }),
});

export const ENEMIES = Object.freeze({
  acolyte: {
    stats: { ...ACOLYTE_STATS, name: "Choir Acolyte" }, hitboxes: ACOLYTE_HITBOXES, abilities: ACOLYTE_ABILITIES,
    poses: ACOLYTE_POSES, options: acolyteOptions, traits: {},
  },
  hound: {
    stats: { name: "Fen Hound", maxHealth: 70, maxPosture: 40, runSpeed: 6.5, circleSpeed: 4, turnRate: 0.25, radius: 0.45, height: 1.1 },
    hitboxes: { Jaw: { center: [0, 0.6, 1.0], size: [1.4, 1.2, 1.8] } },
    abilities: HOUND_ABILITIES,
    poses: { rest: [0.2, 0, 0], Bite: { from: [-0.5, 0, 0], to: [0.4, 0, 0], lean: 0.3 }, Lunge: { from: [-0.7, 0, 0], to: [0.3, 0, 0], lean: 0.5 } },
    options: () => [new AttackOption(HOUND_ABILITIES.Bite, 0, 1.9, 3, 30), new AttackOption(HOUND_ABILITIES.Lunge, 2.5, 6, 2, 120)],
    traits: {},
  },
  cantor: {
    stats: { name: "Choir Cantor", maxHealth: 90, maxPosture: 50, runSpeed: 3.6, circleSpeed: 2, turnRate: 0.15, radius: 0.45, height: 2.0 },
    hitboxes: { Bolt: { center: [0, 0, 0], size: [0.7, 0.7, 0.7], range: 16,
      hit: hitSpec({ damage: 11, posture: 12, hitstop: 3, hitstun: 16, knockback: 1.5 }) },
      Palm: { center: [0, 1, 1.0], size: [1.6, 1.6, 1.6] } },
    abilities: CANTOR_ABILITIES,
    poses: { rest: [0.6, 0.3, 0], SoundBolt: { from: [-0.6, 0.2, 0], to: [0.1, 0, 0] }, Hymn: { from: [-1.6, 0, 0], to: [-1.4, 0, 0], lean: -0.2 },
      Shove: { from: [0.3, 0.5, 0], to: [0.1, -0.2, 0], lean: 0.3 } },
    options: () => [new AttackOption(CANTOR_ABILITIES.SoundBolt, 3.5, 13, 3, 70), new AttackOption(CANTOR_ABILITIES.Hymn, 0, 14, 1, 600),
      new AttackOption(CANTOR_ABILITIES.Shove, 0, 1.8, 2, 60)],
    traits: { ranged: true },
  },
  bulwark: {
    stats: { name: "Choir Bulwark", maxHealth: 150, maxPosture: 120, runSpeed: 3.2, circleSpeed: 1.6, turnRate: 0.09, radius: 0.55, height: 2.0 },
    hitboxes: { Bash: { center: [0, 1, 1.0], size: [2.0, 1.8, 1.6] }, Spear: { center: [0, 1.1, 1.8], size: [0.9, 1.0, 3.2] } },
    abilities: BULWARK_ABILITIES,
    poses: { rest: [0.5, 0.2, 0], ShieldBash: { from: [0.4, 0.2, 0], to: [0.4, 0.2, 0], lean: 0.4 }, SpearThrust: { from: [0.2, 0.9, 0], to: [0.1, 0.05, 0], lean: 0.35 } },
    options: () => [new AttackOption(BULWARK_ABILITIES.ShieldBash, 0, 2.0, 2, 80), new AttackOption(BULWARK_ABILITIES.SpearThrust, 1.6, 3.4, 2, 90)],
    traits: { frontalGuard: true },
  },
  beast: {
    stats: { name: "Bog Beast", maxHealth: 380, maxPosture: 160, runSpeed: 3.4, circleSpeed: 1.4, turnRate: 0.07, radius: 0.85, height: 2.8, elite: true },
    hitboxes: { Claw: { center: [0, 1.3, 1.6], size: [3.0, 2.2, 2.6] }, Quake: { center: [0, 0.6, 0.8], size: [6.0, 1.6, 6.0] } },
    abilities: BEAST_ABILITIES,
    poses: { rest: [0.8, 0.4, 0], Swipe: { from: [-0.8, 1.6, 0], to: [0.6, -1.3, 0], lean: 0.3 }, MudSlam: { from: [-2.6, 0, 0], to: [1.3, 0, 0], lean: 0.6 } },
    options: () => [new AttackOption(BEAST_ABILITIES.Swipe, 0, 2.9, 3, 70), new AttackOption(BEAST_ABILITIES.MudSlam, 0, 3.4, 1, 260)],
    traits: { heavy: true, armoredAttacks: true },
  },
});

/** Wave compositions for the sandbox (Step 5 replaces these with the scripted combat run). */
export const WAVES = Object.freeze([
  ["acolyte", "acolyte", "acolyte"],
  ["hound", "hound", "hound", "acolyte"],
  ["acolyte", "acolyte", "cantor", "bulwark"],
  ["bulwark", "cantor", "hound", "hound"],
  ["beast", "acolyte", "cantor"],
  ["beast", "bulwark", "hound", "hound", "cantor"],
]);
