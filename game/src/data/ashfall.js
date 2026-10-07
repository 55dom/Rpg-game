// The Iron Front (GDD §14 Arc 3, Eps 20–22): the Ashfall Dominion's soldiers, Captain Brannoc as a squad
// companion, and Boss 8, General Varka Ironsong, a Storm-and-Iron war mage with a siege engine.
// Ember hits leave you SCORCHED (a slow burn); Storm hits leave you CHARGED and call down Thunderheads:
// a ring on the ground, then a bolt from the sky. Step out of the ring.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

export const SCORCH = ["SCORCHED", 240]; // 4 s of burning: a little damage every half second
export const CHARGE = ["CHARGED", 300];

// ---- Ashfall Legionary: heavy halberd infantry ------------------------------------------------
const LEGION_ABILITIES = Object.freeze({
  Sweep: defineAbility({ id: "Sweep", startup: 18, active: 5, recovery: 24,
    hit: hitSpec({ damage: 12, posture: 16, hitstop: 5, hitstun: 18, knockback: 2.5 }), events: [sound(14, "swingHeavy"), box(18, "Sweep", 5)] }),
  // Red glint: an overhead brand with a burning blade. Unblockable; it leaves you SCORCHED.
  Brand: defineAbility({ id: "Brand", startup: 28, active: 4, recovery: 30,
    hit: hitSpec({ damage: 16, posture: 20, hitstop: 7, hitstun: 22, knockback: 3, unblockable: true, applyTags: [SCORCH] }),
    events: [glint(), sound(24, "swingHeavy"), { frame: 28, type: E.Move, value: 1.5 }, box(28, "Brand", 4), { frame: 28, type: E.SpawnVfx, key: "mudwave" }] }),
});
// ---- Ashfall War-Mage: Storm caster in the second rank ----------------------------------------
const MAGE_ABILITIES = Object.freeze({
  ArcLance: defineAbility({ id: "ArcLance", startup: 20, active: 2, recovery: 26, tags: ["projectile"],
    events: [{ frame: 4, type: E.SpawnVfx, key: "starcharge" }, sound(16, "glint"), { frame: 20, type: E.Projectile, key: "Arc", value: 16 }] }),
  // A storm cloud over the target: a ring on the ground, then lightning. Move.
  Thunderhead: defineAbility({ id: "Thunderhead", startup: 24, active: 2, recovery: 30,
    events: [{ frame: 0, type: E.SpawnVfx, key: "sing" }, sound(20, "ultActivate"), custom(24, "thunderhead", 60)] }),
  Shove: defineAbility({ id: "Shove", startup: 10, active: 3, recovery: 18,
    hit: hitSpec({ damage: 7, posture: 10, hitstop: 4, hitstun: 14, knockback: 5 }), events: [sound(8), box(10, "Palm", 3)] }),
});

const ARC = { center: [0, 0, 0], size: [0.6, 0.6, 0.6], range: 16, hit: hitSpec({ damage: 10, posture: 10, hitstop: 3, hitstun: 14, knockback: 1, applyTags: [CHARGE] }) };
export const THUNDER = hitSpec({ damage: 16, posture: 18, hitstop: 6, hitstun: 22, knockback: 2, unblockable: true, applyTags: [CHARGE] });

export const ASHFALL_ENEMIES = Object.freeze({
  ashLegion: {
    stats: { name: "Ashfall Legionary", maxHealth: 160, maxPosture: 90, runSpeed: 3.6, circleSpeed: 2, turnRate: 0.11, radius: 0.5, height: 2.0 },
    hitboxes: { Sweep: { center: [0, 1.0, 1.4], size: [3.2, 1.6, 2.2] }, Brand: { center: [0, 1.0, 1.7], size: [1.2, 2.0, 2.4] } },
    abilities: LEGION_ABILITIES,
    poses: { rest: [0.5, 0.25, 0], Sweep: { from: [-0.6, 1.7, 0], to: [0.4, -1.5, 0], lean: 0.3 }, Brand: { from: [-2.5, 0.1, 0], to: [1.3, 0, 0], lean: 0.5 } },
    options: () => [new AttackOption(LEGION_ABILITIES.Sweep, 0, 2.6, 3, 60), new AttackOption(LEGION_ABILITIES.Brand, 0, 3, 2, 180)],
    traits: {},
  },
  ashMage: {
    stats: { name: "Ashfall War-Mage", maxHealth: 95, maxPosture: 50, runSpeed: 3.5, circleSpeed: 2.2, turnRate: 0.15, radius: 0.45, height: 2.0 },
    hitboxes: { Arc: ARC, Palm: { center: [0, 1, 1.0], size: [1.6, 1.6, 1.6] } },
    abilities: MAGE_ABILITIES,
    poses: { rest: [0.6, 0.3, 0], ArcLance: { from: [-0.8, 0.2, 0], to: [0.1, 0, 0] }, Thunderhead: { from: [-2.4, 0.2, 0], to: [-2.2, 0.1, 0], lean: -0.25 },
      Shove: { from: [0.3, 0.5, 0], to: [0.1, -0.2, 0], lean: 0.3 } },
    options: () => [new AttackOption(MAGE_ABILITIES.ArcLance, 3.5, 14, 3, 80), new AttackOption(MAGE_ABILITIES.Thunderhead, 2, 14, 2, 260),
      new AttackOption(MAGE_ABILITIES.Shove, 0, 1.8, 2, 60)],
    traits: { ranged: true },
  },
});

// ---- Captain Brannoc Steelhart (Oath): a squad companion for the Iron Front ---------------------
export const BRANNOC_STATS = Object.freeze({
  name: "Brannoc", maxHealth: 420, maxPosture: 180, runSpeed: 5.2, turnRate: 0.18, radius: 0.55, height: 2.2,
  assistCooldownFrames: 420, reviveFrames: 600,
});
export const BRANNOC_HITBOXES = Object.freeze({
  Blade: { center: [0, 1.1, 1.4], size: [2.4, 1.8, 2.2] },
  Pledge: { center: [0, 1.1, 1.6], size: [3.4, 2.2, 3.0] },
});
export const BRANNOC_POSES = Object.freeze({
  rest: [0.5, 0.25, 0],
  OathCut: { from: [-0.6, 1.6, 0], to: [0.5, -1.4, 0], lean: 0.3 },
  OathThrust: { from: [0.3, 0.2, 0], to: [-0.1, 0, 0], lean: 0.4 },
  PledgedStrike: { from: [-2.6, 0.1, 0], to: [1.4, 0, 0], lean: 0.55 },
  Endurance: { from: [-1.4, 0, 0], to: [-1.2, 0, 0], lean: -0.15 },
});
export const BRANNOC_ABILITIES = Object.freeze({
  OathCut: defineAbility({ id: "OathCut", startup: 10, active: 4, recovery: 16,
    hit: hitSpec({ damage: 11, posture: 12, hitstop: 5, hitstun: 18, knockback: 1.5 }), events: [sound(8), box(10, "Blade", 4)] }),
  OathThrust: defineAbility({ id: "OathThrust", startup: 14, active: 4, recovery: 22, tags: ["heavy"],
    hit: hitSpec({ damage: 17, posture: 22, hitstop: 7, hitstun: 24, knockback: 3.5 }),
    events: [sound(10, "swingHeavy"), { frame: 13, type: E.Move, value: 1.4 }, box(14, "Blade", 4), { frame: 14, type: E.CameraCue, key: "punch" }] }),
  // Assist: Pledged Strike. "No step back." A great cut that breaks guards.
  PledgedStrike: defineAbility({ id: "PledgedStrike", startup: 8, active: 5, recovery: 24, tags: ["assist", "heavy"],
    hit: hitSpec({ damage: 24, posture: 40, hitstop: 9, hitstun: 30, knockback: 5 }),
    events: [glint(), sound(6, "swingHeavy"), { frame: 7, type: E.Move, value: 2 }, box(8, "Pledge", 5), { frame: 8, type: E.CameraCue, key: "punch" }] }),
  // Support: Oath of Endurance on the leader (half damage for 5 s), like Bas's wall.
  Endurance: defineAbility({ id: "Endurance", startup: 10, active: 2, recovery: 20,
    events: [{ frame: 10, type: E.Custom, key: "shield", value: 300 }, { frame: 10, type: E.SpawnVfx, key: "wall" }, sound(8, "block")] }),
});
// Ep 21, the Oath of Steel: Brannoc spars with you in the training ring (a boss with no phases; he's holding back).
export const BRANNOC_SPAR_STATS = Object.freeze({
  name: "Captain Brannoc", maxHealth: 900, maxPosture: 220, runSpeed: 4.4, circleSpeed: 2.2, turnRate: 0.12, radius: 0.55, height: 2.2,
  boss: true, bossTitle: "SPAR · THE OATH OF STEEL", defeatText: "\"GOOD. AGAIN TOMORROW.\"",
});
export const brannocSparOptions = () => [new AttackOption(BRANNOC_ABILITIES.OathCut, 0, 2.4, 3, 40), new AttackOption(BRANNOC_ABILITIES.OathThrust, 0, 2.8, 2, 90),
  new AttackOption(BRANNOC_ABILITIES.PledgedStrike, 0, 3, 1, 260)];
export const BRANNOC_COMPANION = Object.freeze({
  stats: BRANNOC_STATS, hitboxes: BRANNOC_HITBOXES, assist: BRANNOC_ABILITIES.PledgedStrike, slot: [0, -2.4],
  options: () => [new AttackOption(BRANNOC_ABILITIES.OathCut, 0, 2.4, 3, 30), new AttackOption(BRANNOC_ABILITIES.OathThrust, 0, 2.8, 2, 90)],
  supports: () => [{ ability: BRANNOC_ABILITIES.Endurance, kind: "shield", cooldownFrames: 720 }],
});

// ---- B8 · General Varka Ironsong (Ep 22, "Ironsong") --------------------------------------------
// P1 (100–65%): on the ground in front of her siege engine, the Ironsong, which fires bolt volleys.
// P2 (65%): the engine rolls: it drives across the field down a marked lane. Get out of the lane.
//   Her Magnet pulls you in close.
// P3 (35%): the engine breaks apart: burning wreckage falls all over the field (rings, then impact).
// P4 (15%): Railgun: she charges herself with Storm and dashes the length of the field. Dodge.
// Final (6%): Brannoc's Final Vow ends it (scripted). He doesn't get up.
export const VARKA_STATS = Object.freeze({
  name: "General Varka Ironsong", maxHealth: 2000, maxPosture: 320, runSpeed: 3.2, circleSpeed: 1.6, turnRate: 0.1, radius: 0.6, height: 2.3,
  boss: true, bossTitle: "BOSS 8 · IRONSONG", defeatText: "THE IRONSONG FALLS SILENT", phaseMarks: [0.65, 0.35, 0.15],
});
export const VARKA_HITBOXES = Object.freeze({
  Hammer: { center: [0, 1.0, 1.7], size: [2.4, 2.2, 2.6] },
  Arc: ARC,
  Rail: { center: [0, 1.1, 0.8], size: [2.2, 2.2, 2.4] },
  Bolt: { center: [0, 0, 0], size: [0.8, 0.8, 0.8], range: 22, hit: hitSpec({ damage: 12, posture: 12, hitstop: 4, hitstun: 16, knockback: 2 }) },
});
export const VARKA_ABILITIES = Object.freeze({
  // Red glint: a war hammer brought down with a crack of thunder. Unblockable; a shock ring rolls out.
  Hammer: defineAbility({ id: "Hammer", startup: 30, active: 4, recovery: 30,
    hit: hitSpec({ damage: 24, posture: 28, hitstop: 9, hitstun: 26, knockback: 4, unblockable: true }),
    events: [glint(), sound(26, "slam"), box(30, "Hammer", 4), custom(30, "shock", 6), { frame: 30, type: E.CameraCue, key: "punch" }] }),
  ArcLance: defineAbility({ id: "ArcLance", startup: 18, active: 2, recovery: 24, tags: ["projectile"],
    events: [{ frame: 4, type: E.SpawnVfx, key: "starcharge" }, sound(14, "glint"), custom(18, "arcFan", 3)] }),
  Thunderhead: defineAbility({ id: "Thunderhead", startup: 22, active: 2, recovery: 28,
    events: [{ frame: 0, type: E.SpawnVfx, key: "sing" }, sound(18, "ultActivate"), custom(22, "storm", 3)] }),
  // Magnet: iron in your gear answers her. A pull that drags you to her feet.
  Magnet: defineAbility({ id: "Magnet", startup: 20, active: 4, recovery: 26,
    hit: hitSpec({ damage: 6, posture: 8, hitstop: 4, hitstun: 20, pull: 6 }),
    events: [glint(), sound(16, "vacuum"), { frame: 20, type: E.SpawnHitbox, key: "Rail", value: 4 }, custom(20, "magnet", 9)] }),
  // Railgun (P4): Storm and iron together; she fires herself down the field. Unblockable.
  Railgun: defineAbility({ id: "Railgun", startup: 30, active: 18, recovery: 34,
    hit: hitSpec({ damage: 26, posture: 30, hitstop: 8, hitstun: 26, knockback: 7, unblockable: true }),
    events: [glint(), { frame: 4, type: E.SpawnVfx, key: "starcharge" }, sound(26, "dodge"), { frame: 30, type: E.Move, key: "toTarget", value: 16 }, box(30, "Rail", 18)] }),
});
// Final Vow (scripted, Brannoc's Oath ultimate): everything he has, in one cut. It ends the fight.
export const FINAL_VOW = defineAbility({ id: "FinalVow", startup: 1, active: 1, recovery: 1, tags: ["finisher", "heavy"],
  hit: hitSpec({ damage: 99999, posture: 999, hitstop: 24, hitstun: 60, knockback: 6, unblockable: true }), events: [] });
export const VARKA_POSES = Object.freeze({
  rest: [0.5, 0.3, 0], Hammer: { from: [-2.6, 0.1, 0], to: [1.4, 0, 0], lean: 0.5 }, ArcLance: { from: [-0.9, 0.2, 0], to: [0.1, 0, 0], lean: 0.1 },
  Thunderhead: { from: [-2.4, 0.3, 0], to: [-2.2, 0.2, 0], lean: -0.3 }, Magnet: { from: [0.3, 0.3, 0], to: [-0.5, 0.2, 0], lean: -0.2 },
  Railgun: { from: [0.4, 0.1, 0], to: [0.0, 0, 0], lean: 0.75 },
});
export const varkaOptions = (phase) => {
  const A = VARKA_ABILITIES;
  const o = [new AttackOption(A.Hammer, 0, 3.2, 3, 110), new AttackOption(A.ArcLance, 3, 15, 2, 110), new AttackOption(A.Thunderhead, 0, 16, 2, 240)];
  if (phase >= 2) o.push(new AttackOption(A.Magnet, 4, 10, 2, 300));
  if (phase >= 4) o.push(new AttackOption(A.Railgun, 4, 16, 3, 180));
  return o;
};
export const VARKA_PHASES = Object.freeze([{ phase: 1, above: 0.65 }, { phase: 2, above: 0.35, rolls: true }, { phase: 3, above: 0.15, wreck: true },
  { phase: 4, above: 0.06, railgun: true }, { phase: 5, above: 0, vow: true }]);
export const VARKA_TUNING = Object.freeze({
  engineBack: 7, laneHalf: 1.6, rollEvery: 330, rollWarn: 90, rollFrames: 70, rollSpan: 16,
  debrisEvery: 46, debrisRadius: 1.9, debrisDelay: 62, stormRadius: 1.7, stormDelay: 56,
  roll: hitSpec({ damage: 26, posture: 30, hitstop: 8, hitstun: 26, knockback: 8, unblockable: true }),
  debris: hitSpec({ damage: 16, posture: 18, hitstop: 5, hitstun: 20, knockback: 3, unblockable: true, applyTags: [SCORCH] }),
  shock: hitSpec({ damage: 10, posture: 12, hitstop: 3, hitstun: 16, knockback: 3, unblockable: true, applyTags: [CHARGE] }),
  thunder: THUNDER,
});

// ---- The siege engine (an object: immobile unless the controller drives it) ------------------------
export const ENGINE_ABILITIES = Object.freeze({
  Volley: defineAbility({ id: "Volley", startup: 34, active: 2, recovery: 50, tags: ["projectile"],
    events: [glint(20), sound(30, "slam"), { frame: 34, type: E.Projectile, key: "Bolt", value: 14 }] }),
});
export const ASH_OBJECTS = Object.freeze({
  engine: { stats: { name: "The Ironsong (siege engine)", maxHealth: 700, maxPosture: 999, runSpeed: 0, circleSpeed: 0, turnRate: 0.06, radius: 1.6, height: 4.5 }, shape: "engine",
    options: () => [new AttackOption(ENGINE_ABILITIES.Volley, 0, 24, 1, 110)] },
});
export const ASH_OBJECT_HITBOXES = Object.freeze({ Bolt: VARKA_HITBOXES.Bolt });
