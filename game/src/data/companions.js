// Rook's squadmates (GDD §6, §7.3, §10): AI companions with signature Assists.
// Bas (Stone, tank): pillars that launch and ANCHOR. Juno (Thread): lines that BIND and pull.
// Their tags are built to combine: a thread strung to a stone anchor goes taut (GDD §7.3 Thread combo).

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

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
export const COMPANIONS = Object.freeze({
  bas: { stats: BAS_STATS, hitboxes: BAS_HITBOXES, options: basOptions, supports: basSupports, assist: BAS_ABILITIES.PillarUppercut, slot: [1.8, -1.4] },
  juno: { stats: JUNO_STATS, hitboxes: JUNO_HITBOXES, options: junoOptions, supports: junoSupports, assist: JUNO_ABILITIES.SnareLine, slot: [-1.8, -1.4] },
});
