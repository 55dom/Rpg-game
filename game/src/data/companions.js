// Rook's squadmates (GDD §6, §7.3, §10): AI companions with signature Assists.
// Bas (Stone, tank): pillars that launch and ANCHOR. Juno (Thread): lines that BIND and pull.
// Their tags are built to combine: a thread strung to a stone anchor goes taut (GDD §7.3 Thread combo).

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { BRANNOC_COMPANION } from "./ashfall.js";

const swing = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });

// ---- Bas ----------------------------------------------------------------------------------
export const BAS_STATS = Object.freeze({
  name: "Bas", maxHealth: 320, maxPosture: 140, runSpeed: 5.6, turnRate: 0.2, radius: 0.55, height: 2.2,
  assistCooldownFrames: 360, reviveFrames: 600,
});
export const BAS_HITBOXES = Object.freeze({
  Fist: { center: [0, 1, 1.2], size: [2.2, 1.8, 2.0] },
  Pillar: { center: [0, 2.6, 1.5], size: [2.6, 6.2, 2.6] }, // tall: reaches enemies already in the air
});
export const BAS_POSES = Object.freeze({
  rest: [0.9, 0.25, 0],
  StoneJab: { from: [0.4, 0.6, 0], to: [0.15, -0.1, 0], lean: 0.2 },
  BoulderFist: { from: [-1.4, 0.4, 0], to: [0.9, -0.2, 0], lean: 0.45 },
  PillarUppercut: { from: [1.4, 0.2, 0], to: [-1.8, 0, 0], lean: -0.25 },
  BastionWall: { from: [-0.6, 0, 0], to: [0.4, 0, 0], lean: 0.1 },
});
export const BAS_ABILITIES = Object.freeze({
  StoneJab: defineAbility({ id: "StoneJab", startup: 8, active: 3, recovery: 14, tags: ["stone"],
    hit: hitSpec({ damage: 9, posture: 10, hitstop: 4, hitstun: 18, knockback: 1 }),
    events: [swing(6), { frame: 8, type: E.SpawnHitbox, key: "Fist", value: 3 }] }),
  BoulderFist: defineAbility({ id: "BoulderFist", startup: 13, active: 4, recovery: 22, tags: ["stone", "heavy"],
    hit: hitSpec({ damage: 18, posture: 24, hitstop: 7, hitstun: 26, knockback: 4 }),
    events: [swing(10, "swingHeavy"), { frame: 11, type: E.Move, value: 1 }, { frame: 13, type: E.SpawnHitbox, key: "Fist", value: 4 },
      { frame: 13, type: E.CameraCue, key: "punch" }] }),
  // Signature (Assist): a stone pillar erupts under the target, launching it and leaving an anchor.
  PillarUppercut: defineAbility({ id: "PillarUppercut", startup: 6, active: 4, recovery: 22, tags: ["stone", "assist"],
    hit: hitSpec({ damage: 18, posture: 26, hitstop: 6, hitstun: 44, launch: 12, applyTags: [["ANCHORED", 240]] }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "pillarRise" }, swing(4, "slam"), { frame: 6, type: E.SpawnHitbox, key: "Pillar", value: 4 }] }),
  // Support: Bastion Wall shields the leader (half damage) for 5 s.
  BastionWall: defineAbility({ id: "BastionWall", startup: 10, active: 2, recovery: 20, tags: ["stone"],
    events: [{ frame: 10, type: E.Custom, key: "shield", value: 300 }, { frame: 10, type: E.SpawnVfx, key: "wall" }, swing(8, "block")] }),
});
export const basOptions = () => [
  new AttackOption(BAS_ABILITIES.StoneJab, 0, 2.3, 3, 30),
  new AttackOption(BAS_ABILITIES.BoulderFist, 0, 2.5, 2, 90),
  // Pillar Uppercut is Assist-only: launches happen when the player calls them, never mid-combo by surprise.
];
export const basSupports = () => [{ ability: BAS_ABILITIES.BastionWall, kind: "shield", cooldownFrames: 600 }];

// Bas with his left arm broken (BAS_ARM_BROKEN, after the vault in Ep 26): one-handed, slower, no Boulder Fist.
// He still holds the wall (Bastion Wall) and still calls the pillar; he just can't throw his weight behind a punch.
export const BAS_INJURED = Object.freeze({
  stats: Object.freeze({ ...BAS_STATS, maxHealth: 240, maxPosture: 100, runSpeed: 5 }),
  options: () => [new AttackOption(BAS_ABILITIES.StoneJab, 0, 2.3, 2, 55)],
  look: "basSling",
});

// ---- Juno ---------------------------------------------------------------------------------
export const JUNO_STATS = Object.freeze({
  name: "Juno", maxHealth: 180, maxPosture: 80, runSpeed: 7, turnRate: 0.3, radius: 0.42, height: 1.75,
  assistCooldownFrames: 300, reviveFrames: 600,
});
export const JUNO_HITBOXES = Object.freeze({
  Needle: { center: [0, 1, 1.0], size: [1.6, 1.4, 2.0] },
  Line: { center: [0, 1, 3.6], size: [1.4, 1.8, 7.2] },
  Snare: { center: [0, 1.8, 1.9], size: [2.8, 4.2, 3.8] },
});
export const JUNO_POSES = Object.freeze({
  rest: [0.5, 0.45, 0],
  NeedleFlurry: { from: [0.1, 0.4, 0], to: [0.15, -0.2, 0], lean: 0.25 },
  GarrotePull: { from: [0.0, 0.2, 0], to: [-0.4, 1.6, 0], lean: -0.2 },
  SnareLine: { from: [-0.2, -1.2, 0], to: [0.2, 1.4, 0], lean: 0.15, spin: 1 },
  Stitch: { from: [-0.4, 0.2, 0], to: [-0.6, -0.4, 0] },
});
export const JUNO_ABILITIES = Object.freeze({
  NeedleFlurry: defineAbility({ id: "NeedleFlurry", startup: 7, active: 9, recovery: 14, tags: ["thread"],
    hit: hitSpec({ damage: 5, posture: 6, hitstop: 2, hitstun: 16 }),
    events: [swing(6), swing(10), { frame: 7, type: E.SpawnHitbox, key: "Needle", value: 2 },
      { frame: 10, type: E.SpawnHitbox, key: "Needle", value: 2 }, { frame: 13, type: E.SpawnHitbox, key: "Needle", value: 2 }] }),
  // Yanks a target across the field to her.
  GarrotePull: defineAbility({ id: "GarrotePull", startup: 10, active: 4, recovery: 18, tags: ["thread"],
    hit: hitSpec({ damage: 8, posture: 12, hitstop: 4, hitstun: 30, pull: 5 }),
    events: [{ frame: 6, type: E.SpawnVfx, key: "threadCast" }, swing(8, "vacuum"), { frame: 10, type: E.SpawnHitbox, key: "Line", value: 4 }] }),
  // Signature (Assist): threads wrap the target and BIND it in place.
  SnareLine: defineAbility({ id: "SnareLine", startup: 4, active: 4, recovery: 18, tags: ["thread", "assist"],
    hit: hitSpec({ damage: 6, posture: 18, hitstop: 5, hitstun: 90, applyTags: [["BOUND", 180]] }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "threadCast" }, swing(2, "gale"), { frame: 4, type: E.SpawnHitbox, key: "Snare", value: 4 }] }),
  // Support: stitch the leader's wounds.
  Stitch: defineAbility({ id: "Stitch", startup: 14, active: 2, recovery: 16, tags: ["thread"],
    events: [{ frame: 14, type: E.Custom, key: "heal", value: 34 }, { frame: 14, type: E.SpawnVfx, key: "stitch" }] }),
});
export const junoOptions = () => [
  new AttackOption(JUNO_ABILITIES.NeedleFlurry, 0, 2.0, 3, 24),
  new AttackOption(JUNO_ABILITIES.GarrotePull, 3, 7, 2, 240),
];
export const junoSupports = () => [{ ability: JUNO_ABILITIES.Stitch, kind: "heal", cooldownFrames: 480 }];

/** Party roster: how each companion is built and which move their Assist call performs. */
// ---- Luke (the City Watch): beside you once, in the Lowmarket, when his soft spot shows (data/law.js) ----
const LUKE_STATS = Object.freeze({
  name: "Luke", maxHealth: 260, maxPosture: 110, runSpeed: 5.4, turnRate: 0.18, radius: 0.48, height: 2.1,
  assistCooldownFrames: 420, reviveFrames: 540,
});
const LUKE_HITBOXES = Object.freeze({
  Haft: { center: [0, 1, 1.1], size: [2.0, 1.6, 1.9] },
  Spear: { center: [0, 1.1, 1.8], size: [0.9, 1.2, 3.2] },
  Sweep: { center: [0, 1, 0.4], size: [4.0, 1.6, 4.0] },
});
const LUKE_ABILITIES = Object.freeze({ // Slash and Thrust: his arms swing with the townsfolk poses
  Slash: defineAbility({ id: "Slash", startup: 11, active: 4, recovery: 18,
    hit: hitSpec({ damage: 12, posture: 14, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [swing(8), { frame: 11, type: E.SpawnHitbox, key: "Haft", value: 4 }] }),
  Thrust: defineAbility({ id: "Thrust", startup: 16, active: 4, recovery: 22,
    hit: hitSpec({ damage: 18, posture: 22, hitstop: 5, hitstun: 22, knockback: 3 }),
    events: [{ frame: 14, type: E.Move, value: 1.4 }, swing(14, "swingHeavy"), { frame: 16, type: E.SpawnHitbox, key: "Spear", value: 4 }] }),
  // Assist: a full turn of the spear around him, everyone close sent sprawling.
  Sweep: defineAbility({ id: "Sweep", startup: 8, active: 5, recovery: 22, tags: ["assist"],
    hit: hitSpec({ damage: 16, posture: 24, hitstop: 5, hitstun: 30, knockback: 6 }),
    events: [swing(6, "swingHeavy"), { frame: 8, type: E.SpawnHitbox, key: "Sweep", value: 5 }, { frame: 8, type: E.CameraCue, key: "punch" }] }),
});
const LUKE_COMPANION = Object.freeze({
  stats: LUKE_STATS, hitboxes: LUKE_HITBOXES, assist: LUKE_ABILITIES.Sweep, slot: [1.8, -1.6],
  options: () => [new AttackOption(LUKE_ABILITIES.Slash, 0, 2.3, 3, 30), new AttackOption(LUKE_ABILITIES.Thrust, 1.6, 3.4, 2, 80)],
  supports: () => [],
});

export const COMPANIONS = Object.freeze({
  luke: LUKE_COMPANION,
  bas: { stats: BAS_STATS, hitboxes: BAS_HITBOXES, options: basOptions, supports: basSupports, assist: BAS_ABILITIES.PillarUppercut, slot: [1.8, -1.4], injured: BAS_INJURED },
  brannoc: BRANNOC_COMPANION, // fights beside the Lanterns on the Iron Front (Eps 20–22)
  juno: { stats: JUNO_STATS, hitboxes: JUNO_HITBOXES, options: junoOptions, supports: junoSupports, assist: JUNO_ABILITIES.SnareLine, slot: [-1.8, -1.4] },
});
