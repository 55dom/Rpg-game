// Arc 1–2 bosses (GDD §16 B3–B5), on the template: P1 learn → P2 strategy shift → P3 arena changes
// → P4 hidden ability. Controllers live in sim/boss.js; the objects they summon (bells, vow-seals,
// turrets, cages) are immobile fighters you break (data/enemies.js OBJECTS).

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

// ---- B3 · Deacon Ilse Marrowind (Ep 6, "The Silence Sermon") -----------------------------------------
// P1 silence zones: no spells inside them, so you fight in melee. P2 (65%) she calls two acolytes and is
// warded while they stand. P3 (35%) three bells ring: the whole field is silenced and she's shielded until
// you break them. P4 (15%) she silences your dodges in five-second windows: parry instead.
export const ILSE_STATS = Object.freeze({
  name: "Deacon Ilse Marrowind", maxHealth: 1100, maxPosture: 220, runSpeed: 3.2, circleSpeed: 2, turnRate: 0.12, radius: 0.45, height: 2.0,
  boss: true, bossTitle: "BOSS 3 · THE SILENCE SERMON", defeatText: "THE SERMON ENDS", phaseMarks: [0.65, 0.35, 0.15],
});
export const ILSE_HITBOXES = Object.freeze({
  Bolt: { center: [0, 0, 0], size: [0.7, 0.7, 0.7], range: 16, hit: hitSpec({ damage: 10, posture: 12, hitstop: 3, hitstun: 14, knockback: 1.5 }) },
  Palm: { center: [0, 1, 1.0], size: [1.8, 1.6, 1.8] },
});
export const ILSE_ABILITIES = Object.freeze({
  Psalm: defineAbility({ id: "Psalm", startup: 20, active: 2, recovery: 26, tags: ["projectile"],
    events: [{ frame: 4, type: E.SpawnVfx, key: "sing" }, sound(16, "glint"), custom(20, "psalm", 3)] }),
  Hush: defineAbility({ id: "Hush", startup: 26, active: 2, recovery: 24,
    events: [{ frame: 0, type: E.SpawnVfx, key: "sing" }, sound(22, "heal"), custom(26, "hush", 480)] }),
  Shove: defineAbility({ id: "Shove", startup: 10, active: 3, recovery: 18,
    hit: hitSpec({ damage: 9, posture: 12, hitstop: 4, hitstun: 14, knockback: 5 }), events: [sound(8), box(10, "Palm", 3)] }),
  // The toll: a ring of sound from her, unblockable. Jump it or dodge through.
  Toll: defineAbility({ id: "Toll", startup: 28, active: 2, recovery: 26,
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(24, "ultActivate"), custom(28, "toll", 7)] }),
});
export const ILSE_POSES = Object.freeze({
  rest: [0.6, 0.3, 0], Psalm: { from: [-1.2, 0.3, 0], to: [-0.3, 0.2, 0], lean: -0.15 }, Hush: { from: [-1.6, 0, 0], to: [-1.5, 0, 0], lean: -0.2 },
  Shove: { from: [0.3, 0.5, 0], to: [0.1, -0.2, 0], lean: 0.3 }, Toll: { from: [-2.2, 0.2, 0], to: [-2.4, 0.1, 0], lean: -0.3 },
});
export const ilseOptions = (phase) => {
  const A = ILSE_ABILITIES;
  const o = [new AttackOption(A.Psalm, 3, 14, 3, 80), new AttackOption(A.Hush, 0, 12, 2, 300), new AttackOption(A.Shove, 0, 2.2, 3, 50)];
  if (phase >= 2) o.push(new AttackOption(A.Toll, 0, 6, 2, 240));
  return o;
};
export const ILSE_PHASES = Object.freeze([{ phase: 1, above: 0.65 }, { phase: 2, above: 0.35, acolytes: 2 }, { phase: 3, above: 0.15, bells: 3 }, { phase: 4, above: 0, hushDodge: true }]);
export const ILSE_TUNING = Object.freeze({
  hushRadius: 3.6, bellRadius: 7, bellShield: 0.3, hushEvery: 420, hushWarn: 60, hushFrames: 300, tollWidth: 0.9,
  toll: hitSpec({ damage: 16, posture: 20, hitstop: 5, hitstun: 22, knockback: 4, unblockable: true }),
});

// ---- B4 · Sir Galen the Rusted (Ep 8, Arc 1 finale, "Rust Remembers") --------------------------------
// P1 a classical knight: tower shield up front, lance and shield bash. P2 (65%) Rot: rings of rust roll
// out from him, and a rusted guard takes 25% more damage. P3 (35%) his Oath: no stagger, no posture
// damage, until you break his three rusted vow-seals. P4 (15%) the desperation charge, across the hall.
export const GALEN_STATS = Object.freeze({
  name: "Sir Galen the Rusted", maxHealth: 1300, maxPosture: 260, runSpeed: 3.0, circleSpeed: 1.8, turnRate: 0.1, radius: 0.55, height: 2.1,
  boss: true, bossTitle: "BOSS 4 · RUST REMEMBERS", defeatText: "THE VOW BREAKS", phaseMarks: [0.65, 0.35, 0.15],
});
export const GALEN_HITBOXES = Object.freeze({
  Lance: { center: [0, 1.2, 2.2], size: [0.8, 0.9, 3.6] },
  Shield: { center: [0, 1.1, 1.0], size: [1.8, 1.8, 1.4] },
  Cleave: { center: [0, 1.0, 1.4], size: [3.0, 1.4, 2.2] },
});
export const GALEN_ABILITIES = Object.freeze({
  Thrust: defineAbility({ id: "Thrust", startup: 18, active: 4, recovery: 24,
    hit: hitSpec({ damage: 16, posture: 18, hitstop: 6, hitstun: 20, knockback: 3.5 }), events: [sound(14, "swingHeavy"), { frame: 18, type: E.Move, value: 1.2 }, box(18, "Lance", 4)] }),
  Bash: defineAbility({ id: "Bash", startup: 10, active: 3, recovery: 18,
    hit: hitSpec({ damage: 10, posture: 24, hitstop: 5, hitstun: 18, knockback: 6 }), events: [sound(8, "stone"), box(10, "Shield", 3)] }),
  Cleave: defineAbility({ id: "Cleave", startup: 26, active: 5, recovery: 30,
    hit: hitSpec({ damage: 22, posture: 26, hitstop: 8, hitstun: 26, knockback: 5 }), events: [sound(22, "swingHeavy"), box(26, "Cleave", 5), { frame: 26, type: E.CameraCue, key: "punch" }] }),
  // Red glint: a charge across the hall. Unblockable; dodge it.
  Charge: defineAbility({ id: "Charge", startup: 30, active: 24, recovery: 30,
    hit: hitSpec({ damage: 24, posture: 30, hitstop: 7, hitstun: 26, knockback: 7, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(26, "dodge"), { frame: 30, type: E.Move, value: 11 }, box(30, "Shield", 24)] }),
  Rot: defineAbility({ id: "Rot", startup: 24, active: 2, recovery: 24,
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(20, "mud"), custom(24, "rot", 9)] }),
});
export const GALEN_POSES = Object.freeze({
  rest: [0.5, 0.2, 0], Thrust: { from: [0.4, 0.1, 0], to: [-0.1, 0, 0], lean: 0.35 }, Bash: { from: [0.3, 0.6, 0], to: [0.1, -0.2, 0], lean: 0.35 },
  Cleave: { from: [-2.2, 0.2, 0], to: [1.1, -0.1, 0], lean: 0.4 }, Charge: { from: [0.4, 0.1, 0], to: [0.0, 0, 0], lean: 0.6 },
  Rot: { from: [-1.8, 0, 0], to: [-1.6, 0, 0], lean: -0.2 },
});
export const galenOptions = (phase) => {
  const A = GALEN_ABILITIES;
  const o = [new AttackOption(A.Thrust, 1.5, 4.2, 3, 60), new AttackOption(A.Bash, 0, 2, 3, 50), new AttackOption(A.Cleave, 0, 2.6, 2, 120)];
  if (phase >= 2) o.push(new AttackOption(A.Rot, 0, 10, 2, 300));
  if (phase >= 2) o.push(new AttackOption(A.Charge, 4, 14, 1, 360));
  return o;
};
export const GALEN_PHASES = Object.freeze([{ phase: 1, above: 0.65 }, { phase: 2, above: 0.35 }, { phase: 3, above: 0.15, seals: 3 }, { phase: 4, above: 0, desperate: true }]);
export const GALEN_TUNING = Object.freeze({
  sealRadius: 6.5, rotWidth: 0.9, rotSpeed: 6, rustFrames: 360, rustFactor: 1.25, sealStagger: 160, chargeEvery: 150,
  rot: hitSpec({ damage: 10, posture: 10, hitstop: 3, hitstun: 14, knockback: 2, applyTags: [["RUSTED", 360]] }),
});

// ---- B5 · The Clockwork Magistrate (Ep 12, the Undercroft, "The Clockwork Court") ---------------------
// P1 gavel slams (an unblockable shockwave) and two turrets that fire cogs. P2 (70%) court in session:
// a great hand of the clock sweeps the floor: jump it. P3 (40%) the sentence: it cages an ally (or, with
// none beside you, rebuilds its turrets). Break the cage. Heavy: no launch until its posture breaks.
export const MAGISTRATE_STATS = Object.freeze({
  name: "The Clockwork Magistrate", maxHealth: 1600, maxPosture: 300, runSpeed: 2.4, circleSpeed: 1.2, turnRate: 0.08, radius: 0.9, height: 3.0,
  boss: true, bossTitle: "BOSS 5 · THE CLOCKWORK COURT", defeatText: "COURT ADJOURNED", phaseMarks: [0.7, 0.4],
});
export const MAGISTRATE_HITBOXES = Object.freeze({
  Gavel: { center: [0, 1.0, 1.8], size: [2.4, 2.0, 2.4] },
  Sweep: { center: [0, 1.0, 1.6], size: [4.4, 1.6, 2.6] },
  Cog: { center: [0, 0, 0], size: [0.6, 0.6, 0.6], range: 16, hit: hitSpec({ damage: 9, posture: 10, hitstop: 3, hitstun: 14, knockback: 1.5 }) },
});
export const MAGISTRATE_ABILITIES = Object.freeze({
  Gavel: defineAbility({ id: "Gavel", startup: 30, active: 4, recovery: 30,
    hit: hitSpec({ damage: 24, posture: 28, hitstop: 9, hitstun: 26, knockback: 4, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(26, "slam"), box(30, "Gavel", 4), custom(30, "gavel", 5), { frame: 30, type: E.CameraCue, key: "punch" }] }),
  Sweep: defineAbility({ id: "Sweep", startup: 22, active: 6, recovery: 26,
    hit: hitSpec({ damage: 16, posture: 18, hitstop: 6, hitstun: 20, knockback: 4 }), events: [sound(18, "swingHeavy"), box(22, "Sweep", 6)] }),
  Verdict: defineAbility({ id: "Verdict", startup: 22, active: 2, recovery: 26, tags: ["projectile"],
    events: [{ frame: 4, type: E.SpawnVfx, key: "starcharge" }, sound(18, "glint"), custom(22, "cogs", 5)] }),
});
export const MAGISTRATE_POSES = Object.freeze({
  rest: [0.4, 0.3, 0], Gavel: { from: [-2.6, 0.1, 0], to: [1.4, 0, 0], lean: 0.5 }, Sweep: { from: [-0.3, 1.5, 0], to: [0.2, -1.4, 0], lean: 0.3 },
  Verdict: { from: [-1.4, 0.3, 0], to: [-0.4, 0.2, 0], lean: -0.1 },
});
export const magistrateOptions = (phase) => {
  const A = MAGISTRATE_ABILITIES;
  return [new AttackOption(A.Gavel, 0, 3.2, 3, 110), new AttackOption(A.Sweep, 0, 3, 2, 70), new AttackOption(A.Verdict, 4, 15, phase >= 2 ? 3 : 2, 150)];
};
export const MAGISTRATE_PHASES = Object.freeze([{ phase: 1, above: 0.7, turrets: 2 }, { phase: 2, above: 0.4, hand: true }, { phase: 3, above: 0, sentence: true }]);
export const MAGISTRATE_TUNING = Object.freeze({
  turretRadius: 7, handLength: 12, handSpeed: 0.011, handWidth: 0.5, handHeight: 0.75, handWarn: 90,
  hand: hitSpec({ damage: 14, posture: 16, hitstop: 4, hitstun: 20, knockback: 3, unblockable: true }),
  gavelRing: hitSpec({ damage: 10, posture: 12, hitstop: 3, hitstun: 16, knockback: 3, unblockable: true }),
});

// ---- The things bosses put on the field: immobile, breakable ----------------------------------------
export const OBJECT_HITBOXES = Object.freeze({
  Cog: MAGISTRATE_HITBOXES.Cog,
});
export const TURRET_ABILITIES = Object.freeze({
  Fire: defineAbility({ id: "Fire", startup: 30, active: 2, recovery: 40, tags: ["projectile"],
    events: [sound(26, "glint"), { frame: 30, type: E.Projectile, key: "Cog", value: 12 }] }),
});
export const OBJECTS = Object.freeze({
  bell: { stats: { name: "Silence Bell", maxHealth: 140, maxPosture: 999, runSpeed: 0, circleSpeed: 0, turnRate: 0, radius: 0.6, height: 2.4 }, shape: "bell" },
  seal: { stats: { name: "Rusted Vow-Seal", maxHealth: 160, maxPosture: 999, runSpeed: 0, circleSpeed: 0, turnRate: 0, radius: 0.55, height: 1.8 }, shape: "seal" },
  turret: { stats: { name: "Court Turret", maxHealth: 120, maxPosture: 999, runSpeed: 0, circleSpeed: 0, turnRate: 0.2, radius: 0.5, height: 1.4 }, shape: "turret",
    options: () => [new AttackOption(TURRET_ABILITIES.Fire, 0, 18, 1, 100)] },
  cage: { stats: { name: "Sentence Cage", maxHealth: 180, maxPosture: 999, runSpeed: 0, circleSpeed: 0, turnRate: 0, radius: 0.7, height: 2.4 }, shape: "cage" },
});
