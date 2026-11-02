// The Greywater Fens roster (GDD §13, §14 Arc 1): five enemy types with distinct jobs.
// Each entry: stats, hitboxes, moves, AI options, and traits the simulation understands:
//   heavy: can't be launched or pulled until its posture breaks
//   armoredAttacks: super armor while attacking (hits don't interrupt)
//   frontalGuard: blocks every blockable hit from the front while not attacking

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { ACOLYTE_STATS, ACOLYTE_HITBOXES, ACOLYTE_ABILITIES, ACOLYTE_POSES, acolyteOptions } from "./acolyte.js";
import { ASHFALL_ENEMIES } from "./ashfall.js";
import { ECLIPSE_ENEMIES } from "./eclipse.js";
import { ISLES_ENEMIES } from "./isles.js";
import { SAELITH_ENEMIES } from "./saelith.js";
import { HOLLOW_ENEMIES } from "./hollow.js";
import { LEGION_ENEMIES } from "../reveal/legion.js";
import { HERO_ENEMIES, DRILL_PARTNER } from "../reveal/backlash.js";
import { SaintController, DrillController } from "../reveal/backlashSim.js";
import { FINALE_ENEMIES } from "../reveal/finale.js";
import { CalSeatedController, CalBondsController } from "../reveal/finaleSim.js";
import { BELL_ENEMIES } from "./bell.js";
import { ARC7_ENEMIES } from "../reveal/arc7.js";
import { TwinController } from "../sim/twins.js";
import { BloomController } from "../sim/bloom.js";

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

// ---- Undercroft Rat: weak, fast, comes in swarms -----------------------------------------
const RAT_ABILITIES = Object.freeze({
  Nip: defineAbility({ id: "Nip", startup: 8, active: 3, recovery: 16,
    hit: hitSpec({ damage: 5, posture: 6, hitstop: 2, hitstun: 10, knockback: 0.6 }),
    events: [sound(6), box(8, "Teeth", 3)] }),
  Pounce: defineAbility({ id: "Pounce", startup: 14, active: 5, recovery: 24,
    hit: hitSpec({ damage: 8, posture: 8, hitstop: 3, hitstun: 14, knockback: 1.2 }),
    events: [sound(10, "dodge"), { frame: 14, type: E.Move, value: 3 }, box(14, "Teeth", 5)] }),
});

// ---- Clockwork Sentinel: slow brass guardian of the Undercroft ----------------------------
const CLOCKWORK_ABILITIES = Object.freeze({
  Piston: defineAbility({ id: "Piston", startup: 20, active: 4, recovery: 26,
    hit: hitSpec({ damage: 16, posture: 24, hitstop: 6, hitstun: 22, knockback: 5 }),
    events: [sound(16, "swingHeavy"), { frame: 19, type: E.Move, value: 1 }, box(20, "Fist", 4)] }),
  // Gearspin: winds up (glint), then spins its arms: hits all around, unblockable. Dodge it.
  Gearspin: defineAbility({ id: "Gearspin", startup: 32, active: 18, recovery: 36,
    hit: hitSpec({ damage: 20, posture: 30, hitstop: 5, hitstun: 24, knockback: 6, unblockable: true }),
    events: [glint(0), sound(28, "slam"), box(32, "Spin", 18), { frame: 32, type: E.CameraCue, key: "punch" }] }),
});

// ---- Thornwick Bandit: a desperate road thief with a knife --------------------------------
const BANDIT_ABILITIES = Object.freeze({
  Hack: defineAbility({ id: "Hack", startup: 12, active: 4, recovery: 20,
    hit: hitSpec({ damage: 11, posture: 16, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(9), box(12, "Knife", 4)] }),
  KnifeToss: defineAbility({ id: "KnifeToss", startup: 18, active: 2, recovery: 24, tags: ["projectile"],
    events: [glint(4), sound(16), { frame: 18, type: E.Projectile, key: "Thrown", value: 16 }] }),
});

// ---- The Watch (data/law.js): a guard with a spear, and anybody else who fights back ------------
// Named Slash and Thrust so every townsperson's arms (ACOLYTE_POSES) swing with them.
const GUARD_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 13, active: 4, recovery: 20,
    hit: hitSpec({ damage: 10, posture: 16, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(10), box(13, "Haft", 4)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 20, active: 4, recovery: 26,
    hit: hitSpec({ damage: 15, posture: 22, hitstop: 5, hitstun: 22, knockback: 3 }),
    events: [glint(2), { frame: 18, type: E.Move, value: 1.6 }, sound(18, "swingHeavy"), box(20, "Spear", 4)] }),
});
const BRAWLER_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 12, active: 3, recovery: 18,
    hit: hitSpec({ damage: 6, posture: 10, hitstop: 3, hitstun: 14, knockback: 1.2 }),
    events: [sound(9), box(12, "Fist", 3)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 16, active: 4, recovery: 24,
    hit: hitSpec({ damage: 8, posture: 14, hitstop: 4, hitstun: 18, knockback: 3.5 }),
    events: [{ frame: 14, type: E.Move, value: 0.8 }, sound(14), box(16, "Fist", 4)] }),
});

// Boss 6, the Cantor Twins (Ep 15): Mirror, who turns your spells back off a shield of glass, and Smoke, who sings
// the other one whole again. Their hymns ward each other: break the ward (Gale), then take one down while it's open.
// The duo (the swap, the smoke and mirrors, the absorbing) is sim/twins.js; its numbers, data/twins.js.
const TWIN_MIRROR = {
  stats: { name: "The Cantor Twins · Mirror", maxHealth: 760, maxPosture: 180, runSpeed: 3.8, circleSpeed: 2.2, turnRate: 0.16, radius: 0.48, height: 2.0 },
  hitboxes: { Bolt: { center: [0, 0, 0], size: [0.8, 0.8, 0.8], range: 16, hit: hitSpec({ damage: 14, posture: 16, hitstop: 4, hitstun: 18, knockback: 2 }) },
    Palm: { center: [0, 1, 1.0], size: [1.8, 1.8, 1.8] } },
  abilities: CANTOR_ABILITIES, poses: { rest: [0.6, 0.3, 0], SoundBolt: { from: [-0.6, 0.2, 0], to: [0.1, 0, 0] }, Hymn: { from: [-1.6, 0, 0], to: [-1.4, 0, 0], lean: -0.2 },
    Shove: { from: [0.3, 0.5, 0], to: [0.1, -0.2, 0], lean: 0.3 } },
  options: () => [new AttackOption(CANTOR_ABILITIES.SoundBolt, 3, 13, 3, 60), new AttackOption(CANTOR_ABILITIES.Shove, 0, 2.0, 3, 50), new AttackOption(CANTOR_ABILITIES.Hymn, 0, 16, 1, 720)],
  traits: { frontalGuard: true },
};
const TWIN_SMOKE = {
  stats: { name: "The Cantor Twins · Smoke", maxHealth: 680, maxPosture: 150, runSpeed: 4.6, circleSpeed: 3.0, turnRate: 0.18, radius: 0.46, height: 2.0 },
  hitboxes: { Bolt: { center: [0, 0, 0], size: [0.7, 0.7, 0.7], range: 16, hit: hitSpec({ damage: 12, posture: 14, hitstop: 3, hitstun: 16, knockback: 1.5 }) },
    Palm: { center: [0, 1, 1.0], size: [1.6, 1.6, 1.6] } },
  abilities: CANTOR_ABILITIES, poses: { rest: [0.6, 0.3, 0], SoundBolt: { from: [-0.6, 0.2, 0], to: [0.1, 0, 0] }, Hymn: { from: [-1.6, 0, 0], to: [-1.4, 0, 0], lean: -0.2 },
    Shove: { from: [0.3, 0.5, 0], to: [0.1, -0.2, 0], lean: 0.3 } },
  options: () => [new AttackOption(CANTOR_ABILITIES.SoundBolt, 3.5, 14, 3, 50), new AttackOption(CANTOR_ABILITIES.Hymn, 0, 16, 2, 480), new AttackOption(CANTOR_ABILITIES.Shove, 0, 1.8, 2, 60)],
  traits: { ranged: true },
};
// P3's reflections: each looks (and is named) like one of the twins, whole, and breaks at a touch. Their bolts sting less.
const echoOf = (t) => ({ ...t, stats: { ...t.stats, maxHealth: 1, maxPosture: 1 },
  hitboxes: { ...t.hitboxes, Bolt: { ...t.hitboxes.Bolt, hit: hitSpec({ damage: 6, posture: 6, hitstop: 2, hitstun: 10, knockback: 1 }) } },
  options: () => [new AttackOption(CANTOR_ABILITIES.SoundBolt, 3, 14, 3, 140)], traits: { ranged: true, echo: true } });

export const ENEMIES = Object.freeze({
  guard: {
    stats: { name: "City Watch", maxHealth: 150, maxPosture: 70, runSpeed: 4.6, circleSpeed: 2.4, turnRate: 0.14, radius: 0.45, height: 2.0 },
    hitboxes: { Haft: { center: [0, 1, 1.1], size: [2.0, 1.6, 1.9] }, Spear: { center: [0, 1.1, 1.8], size: [0.9, 1.2, 3.2] } },
    abilities: GUARD_ABILITIES,
    options: () => [new AttackOption(GUARD_ABILITIES.Slash, 0, 2.3, 3, 45), new AttackOption(GUARD_ABILITIES.Thrust, 1.8, 3.6, 2, 110)],
    traits: { watch: true },
  },
  brawler: {
    stats: { name: "Angry Townsperson", maxHealth: 90, maxPosture: 40, runSpeed: 4.2, circleSpeed: 2.4, turnRate: 0.15, radius: 0.42, height: 1.9 },
    hitboxes: { Fist: { center: [0, 1, 0.9], size: [1.7, 1.5, 1.6] } },
    abilities: BRAWLER_ABILITIES,
    options: () => [new AttackOption(BRAWLER_ABILITIES.Slash, 0, 2.0, 3, 35), new AttackOption(BRAWLER_ABILITIES.Thrust, 0, 2.2, 1, 120)],
    traits: { brawler: true },
  },
  ...ASHFALL_ENEMIES, // the Iron Front (Arc 3)
  ...ISLES_ENEMIES, // Arc 4: Aldric's Lances, the Severed Isles' riders and wisps
  ...SAELITH_ENEMIES, // Mirrorlake Saelith's mirror wraiths (GDD §13; Phase 12)
  ...HOLLOW_ENEMIES, // Arc 4: the empty armor that walks out of the door under the Lowmarket
  ...LEGION_ENEMIES, // Arc 5: the Line, through the Gate (src/reveal/, the one sanctioned exception to the leak rules)
  ...HERO_ENEMIES, heroSacrifice: { ...HERO_ENEMIES.heroSacrifice, Controller: SaintController }, // Backlash (Ep 49): the Trial's Hero Party
  drillPartner: { ...DRILL_PARTNER, Controller: DrillController },
  ...FINALE_ENEMIES, // Ep 50: him on his door, him in earnest, and (if it's his story) the Lanterns
  calSeated: { ...FINALE_ENEMIES.calSeated, Controller: CalSeatedController },
  calBonds: { ...FINALE_ENEMIES.calBonds, Controller: CalBondsController },
  ...ECLIPSE_ENEMIES, // Mirrorlake (Ep 28): the Lion and the reflection
  ...BELL_ENEMIES, // Arc 6: the Crimson Bell's wardens (Ep 52, the Silencing)
  ...ARC7_ENEMIES, // Arc 7: the Throne Guard, Corin fifteen years on, and Cal at the end (src/reveal/arc7.js)
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
  twinMirror: { ...TWIN_MIRROR, Controller: TwinController }, twinSmoke: { ...TWIN_SMOKE, Controller: TwinController }, // Boss 6 (the duo: sim/twins.js)
  twinEchoMirror: { ...echoOf(TWIN_MIRROR), Controller: TwinController }, twinEchoSmoke: { ...echoOf(TWIN_SMOKE), Controller: TwinController },
  // Boss 7, the Hollow Bloom (Ep 18): Hesper's ritual flower at the heart of the Hollowmarch. It creeps; it throws blank
  // petals that cut; and it pulses, a ring of white that erases whatever's standing in it (the glint is your warning).
  hollowBloom: {
    stats: { name: "The Hollow Bloom", maxHealth: 2600, maxPosture: 999, runSpeed: 0.5, circleSpeed: 0.25, turnRate: 0.05, radius: 1.5, height: 4.0 },
    hitboxes: { Petal: { center: [0, 0, 0], size: [0.9, 0.5, 0.9], range: 18, hit: hitSpec({ damage: 13, posture: 14, hitstop: 3, hitstun: 16, knockback: 2 }) },
      Pulse: { center: [0, 1, 0], size: [8, 3, 8] }, Lash: { center: [0, 1, 2.2], size: [2.4, 2, 3.2] } },
    abilities: {
      Petals: defineAbility({ id: "Petals", startup: 20, active: 2, recovery: 30, tags: ["projectile"],
        events: [{ frame: 16, type: E.PlaySound, key: "vacuum" }, { frame: 20, type: E.Projectile, key: "Petal", value: 11 }] }),
      Pulse: defineAbility({ id: "Pulse", startup: 54, active: 4, recovery: 50, tags: ["heavy"],
        hit: hitSpec({ damage: 22, posture: 30, hitstop: 6, hitstun: 26, knockback: 7, unblockable: true }),
        events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, { frame: 48, type: E.PlaySound, key: "slam" }, { frame: 54, type: E.SpawnHitbox, key: "Pulse", value: 4 }, { frame: 54, type: E.CameraCue, key: "punch" }] }),
      Lash: defineAbility({ id: "Lash", startup: 18, active: 4, recovery: 26,
        hit: hitSpec({ damage: 14, posture: 18, hitstop: 4, hitstun: 18, knockback: 4 }),
        events: [{ frame: 14, type: E.PlaySound, key: "swingHeavy" }, { frame: 18, type: E.SpawnHitbox, key: "Lash", value: 4 }] }),
    },
    poses: { rest: [0, 0, 0] },
    options: () => { const A = ENEMIES.hollowBloom.abilities; return [new AttackOption(A.Petals, 3, 18, 3, 60), new AttackOption(A.Pulse, 0, 4.2, 2, 300), new AttackOption(A.Lash, 0, 3.2, 2, 70)]; },
    traits: { heavy: true }, Controller: BloomController, // its phases run on the clock it's held back against (sim/bloom.js)
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
  rat: {
    stats: { name: "Undercroft Rat", maxHealth: 34, maxPosture: 20, runSpeed: 6, circleSpeed: 4.2, turnRate: 0.3, radius: 0.35, height: 0.7 },
    hitboxes: { Teeth: { center: [0, 0.4, 0.7], size: [1.1, 0.9, 1.3] } },
    abilities: RAT_ABILITIES,
    poses: { rest: [0.2, 0, 0], Nip: { from: [-0.5, 0, 0], to: [0.4, 0, 0], lean: 0.3 }, Pounce: { from: [-0.7, 0, 0], to: [0.3, 0, 0], lean: 0.5 } },
    options: () => [new AttackOption(RAT_ABILITIES.Nip, 0, 1.4, 3, 24), new AttackOption(RAT_ABILITIES.Pounce, 1.8, 4, 2, 90)],
    traits: {},
  },
  clockwork: {
    stats: { name: "Clockwork Sentinel", maxHealth: 210, maxPosture: 110, runSpeed: 2.6, circleSpeed: 1.2, turnRate: 0.06, radius: 0.6, height: 2.2 },
    hitboxes: { Fist: { center: [0, 1.1, 1.3], size: [1.6, 1.6, 2.2] }, Spin: { center: [0, 1, 0], size: [4.4, 1.8, 4.4] } },
    abilities: CLOCKWORK_ABILITIES,
    poses: { rest: [0.4, 0.5, 0], Piston: { from: [0.3, 0.2, 0], to: [1.4, 0, 0], lean: 0.35 }, Gearspin: { from: [-1.5, 0, 0], to: [-1.5, 0, 0], lean: -0.1 } },
    options: () => [new AttackOption(CLOCKWORK_ABILITIES.Piston, 0, 2.6, 3, 70), new AttackOption(CLOCKWORK_ABILITIES.Gearspin, 0, 2.4, 1, 280)],
    traits: { armoredAttacks: true },
  },
  bandit: {
    stats: { name: "Road Bandit", maxHealth: 95, maxPosture: 50, runSpeed: 4.4, circleSpeed: 2.6, turnRate: 0.14, radius: 0.45, height: 1.9 },
    hitboxes: { Knife: { center: [0, 1, 1.0], size: [1.8, 1.6, 1.7] },
      Thrown: { center: [0, 0, 0], size: [0.5, 0.5, 0.5], range: 14, hit: hitSpec({ damage: 8, posture: 8, hitstop: 3, hitstun: 12, knockback: 1 }) } },
    abilities: BANDIT_ABILITIES,
    poses: { rest: [0.7, 0.35, 0], Hack: { from: [-0.6, 1.8, 0], to: [0.5, -1.4, 0] }, KnifeToss: { from: [-1.2, 0.4, 0], to: [0.6, 0, 0] } },
    options: () => [new AttackOption(BANDIT_ABILITIES.Hack, 0, 2.2, 3, 40), new AttackOption(BANDIT_ABILITIES.KnifeToss, 4, 11, 2, 160)],
    traits: {},
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
  ["hask"], // Boss 2: Hask the Bogwarden
]);
