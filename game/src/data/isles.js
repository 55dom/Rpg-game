// Arc 4 opens (GDD §14 Arc 4, §13 Spindle Peaks / Severed Isles). Aldric's Lances, the Tempest Riders who nest in
// the drifting sky temples, the storm wisps that crackle round them, and Boss 11, the Storm Warden.
//
//   Lance        a Crown knight in Valcourt blue: shield up while he isn't attacking (frontal guard), a slash, and a
//                charging thrust that covers ground fast (red glint). Get round the shield, or break it.
//   Tempest Rider  a sky raider in a storm cloak: quick cuts, and a Dive from a leap (glint first) that lands where
//                you stood. Throws a gust that knocks you back.
//   Storm Wisp   a ball of weather on a string: bolts from range, and when it's hit hard it bursts in a ring.
//
// B11 · The Storm Warden (Ep 30): the stone guardian of the sky temple, woken when the Lances broke its seal.
//   P1 (100–60%): Slam (a shockwave in front), Sweep (an arm round the whole of it, unblockable: jump or dodge),
//     and Gale (a wall of wind rolls out from it: jump it).
//   P2 (60%): three lightning rods rise round the temple floor. While any rod stands the Warden is charged
//     (warded, and its hits shock): thunder falls on whoever is near a rod. Break the rods.
//   P3 (30%): the mural's constellation lights up on the floor: thunder falls along its lines, star by star,
//     in the order they were drawn. Read the lines; stand between them.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

// ---- The Lances: named Slash and Thrust so the townsfolk arm poses swing with them ----
const LANCE_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 12, active: 4, recovery: 20,
    hit: hitSpec({ damage: 12, posture: 18, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(9), box(12, "Blade", 4)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 22, active: 6, recovery: 28,
    hit: hitSpec({ damage: 18, posture: 26, hitstop: 6, hitstun: 24, knockback: 4, unblockable: true }),
    events: [glint(0), sound(18, "swingHeavy"), { frame: 20, type: E.Move, value: 5 }, box(22, "Lance", 6)] }),
});
// ---- Tempest Riders ----
const RIDER_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 9, active: 3, recovery: 16,
    hit: hitSpec({ damage: 9, posture: 12, hitstop: 3, hitstun: 16, knockback: 1.5 }),
    events: [sound(7), box(9, "Blade", 3)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 26, active: 5, recovery: 26, // the Dive: up and over, onto where you stood
    hit: hitSpec({ damage: 16, posture: 20, hitstop: 5, hitstun: 22, knockback: 4 }),
    events: [glint(0), sound(14, "dodge"), { frame: 16, type: E.Move, value: 6 }, sound(25, "slam"), box(26, "Dive", 5)] }),
  Gust: defineAbility({ id: "Gust", startup: 20, active: 2, recovery: 24, tags: ["projectile"],
    events: [sound(16, "gale"), { frame: 20, type: E.Projectile, key: "Gust", value: 14 }] }),
});
// ---- Storm Wisps ----
const WISP_ABILITIES = Object.freeze({
  Bolt: defineAbility({ id: "Bolt", startup: 24, active: 2, recovery: 30, tags: ["projectile"],
    events: [glint(4), sound(20, "glint"), { frame: 24, type: E.Projectile, key: "Bolt", value: 15 }] }),
  Crackle: defineAbility({ id: "Crackle", startup: 18, active: 4, recovery: 30,
    hit: hitSpec({ damage: 8, posture: 10, hitstop: 4, hitstun: 18, knockback: 3 }),
    events: [glint(0), sound(16, "detonate"), box(18, "Arc", 4)] }),
});

export const LANCE_POSES = Object.freeze({ rest: [0.6, 0.3, 0], Slash: { from: [-0.6, 1.7, 0], to: [0.5, -1.3, 0] }, Thrust: { from: [0.3, 0.9, 0], to: [0.1, 0, 0], lean: 0.5 } });

export const ISLES_ENEMIES = Object.freeze({
  lance: {
    stats: { name: "Lance of the Crown", maxHealth: 170, maxPosture: 90, runSpeed: 4.3, circleSpeed: 2.2, turnRate: 0.12, radius: 0.46, height: 2.0 },
    hitboxes: { Blade: { center: [0, 1, 1.1], size: [2.0, 1.6, 1.9] }, Lance: { center: [0, 1.1, 1.8], size: [1.0, 1.3, 3.4] } },
    abilities: LANCE_ABILITIES, poses: LANCE_POSES,
    options: () => [new AttackOption(LANCE_ABILITIES.Slash, 0, 2.3, 3, 45), new AttackOption(LANCE_ABILITIES.Thrust, 2.4, 6.5, 2, 150)],
    traits: { frontalGuard: true },
  },
  rider: {
    stats: { name: "Tempest Rider", maxHealth: 110, maxPosture: 55, runSpeed: 5.2, circleSpeed: 3.2, turnRate: 0.16, radius: 0.42, height: 1.9 },
    hitboxes: { Blade: { center: [0, 1, 1.0], size: [1.8, 1.5, 1.7] }, Dive: { center: [0, 0.8, 0.4], size: [2.6, 1.8, 2.6] },
      Gust: { center: [0, 0, 0], size: [0.9, 0.9, 0.9], range: 12, hit: hitSpec({ damage: 6, posture: 14, hitstop: 3, hitstun: 18, knockback: 6 }) } },
    abilities: RIDER_ABILITIES, poses: LANCE_POSES,
    options: () => [new AttackOption(RIDER_ABILITIES.Slash, 0, 2.1, 3, 35), new AttackOption(RIDER_ABILITIES.Thrust, 3, 7, 2, 160), new AttackOption(RIDER_ABILITIES.Gust, 4, 11, 1, 200)],
    traits: {},
  },
  wisp: {
    stats: { name: "Storm Wisp", maxHealth: 60, maxPosture: 30, runSpeed: 3.0, circleSpeed: 2.6, turnRate: 0.2, radius: 0.4, height: 1.6 },
    hitboxes: { Arc: { center: [0, 1, 0], size: [3.2, 2, 3.2] },
      Bolt: { center: [0, 0, 0], size: [0.6, 0.6, 0.6], range: 16, hit: hitSpec({ damage: 9, posture: 8, hitstop: 3, hitstun: 14, knockback: 1 }) } },
    abilities: WISP_ABILITIES, poses: { rest: [0, 0, 0] },
    options: () => [new AttackOption(WISP_ABILITIES.Bolt, 3, 14, 2, 120), new AttackOption(WISP_ABILITIES.Crackle, 0, 2.4, 1, 160)],
    traits: { ranged: true },
  },
});

// ---- B11 · The Storm Warden ----
export const WARDEN_STATS = Object.freeze({
  name: "The Storm Warden", maxHealth: 2200, maxPosture: 300, runSpeed: 2.6, circleSpeed: 1.4, turnRate: 0.07, radius: 1.0, height: 3.8,
  boss: true, bossTitle: "BOSS 11 · THE STORM WARDEN", defeatText: "THE WARDEN SETTLES INTO STONE", phaseMarks: [0.6, 0.3],
});
export const WARDEN_HITBOXES = Object.freeze({
  Slam: { center: [0, 0.8, 2.2], size: [3.6, 2.2, 3.4] },
  Sweep: { center: [0, 1.0, 0], size: [6.4, 2.4, 6.4] },
});
export const WARDEN_POSES = Object.freeze({
  rest: [0.7, 0.4, 0],
  Slam: { from: [-1.8, 0.2, 0], to: [1.2, -0.1, 0], lean: 0.4 },
  Sweep: { from: [0.2, 1.8, 0], to: [0.2, -1.8, 0], lean: 0.1 },
  Gale: { from: [-1.2, 0.8, 0], to: [-0.4, 0.6, 0], lean: -0.2 },
});
export const WARDEN_TUNING = Object.freeze({
  rods: 3, rodRadius: 7.5,
  rodEvery: 150, rodStrikeR: 2.2, rodDelay: 60,      // thunder near a standing rod: every 2.5 s, a 1 s warning
  starEvery: 300, starStep: 14, starR: 1.7, starDelay: 54, // the constellation: one line every 5 s, a star every ~0.23 s down it
  gale: { speed: 7, maxR: 13, width: 0.9 },
  thunder: hitSpec({ damage: 16, posture: 16, hitstop: 4, hitstun: 30, knockback: 2, unblockable: true }),
  galeHit: hitSpec({ damage: 10, posture: 18, hitstop: 4, hitstun: 26, knockback: 7, unblockable: true }),
});
export const WARDEN_ABILITIES = Object.freeze({
  Slam: defineAbility({ id: "Slam", startup: 26, active: 4, recovery: 30,
    hit: hitSpec({ damage: 22, posture: 30, hitstop: 7, hitstun: 26, knockback: 5 }),
    events: [sound(20, "swingHeavy"), box(26, "Slam", 4), { frame: 26, type: E.CameraCue, key: "punch" }, sound(26, "stone")] }),
  Sweep: defineAbility({ id: "Sweep", startup: 34, active: 8, recovery: 32,
    hit: hitSpec({ damage: 18, posture: 26, hitstop: 5, hitstun: 26, knockback: 6, unblockable: true }),
    events: [glint(0), sound(30, "swingHeavy"), box(34, "Sweep", 8)] }),
  Gale: defineAbility({ id: "Gale", startup: 30, active: 2, recovery: 34,
    events: [sound(24, "gale"), custom(30, "gale")] }),
});
export const wardenOptions = (phase) => {
  const A = WARDEN_ABILITIES;
  return [
    new AttackOption(A.Slam, 0, 3.6, 3, 70),
    new AttackOption(A.Sweep, 0, 3.4, 1, phase >= 2 ? 220 : 300),
    new AttackOption(A.Gale, 3, 14, 1, phase >= 3 ? 200 : 260),
  ];
};
export const WARDEN_PHASES = Object.freeze([{ phase: 1, above: 0.6 }, { phase: 2, above: 0.3 }, { phase: 3, above: 0 }]);
/** What the thunder and the gale are called when they land (the controller fires them; they're not moves). */
export const WARDEN_THUNDER = defineAbility({ id: "Thunder", startup: 1, active: 1, recovery: 1, hit: WARDEN_TUNING.thunder, events: [] });
export const WARDEN_GALE = defineAbility({ id: "Gale", startup: 1, active: 1, recovery: 1, hit: WARDEN_TUNING.galeHit, events: [] });

/** The mural's constellation, as lines of stars across the temple floor (x, z offsets from the floor's middle). */
export const WARDEN_STARS = Object.freeze([
  [[-8, -4], [-4, -1], [0, -3], [4, 0], [8, -2]],
  [[-6, 5], [-2, 2], [2, 5], [6, 3]],
  [[0, -8], [0, -4], [1, 0], [0, 4], [-1, 8]],
  [[-8, 3], [-4, 6], [0, 7], [4, 6], [8, 3]],
]);

/** The Warden's lightning rods (immobile things you break, like Ilse's bells). */
export const ISLES_OBJECTS = Object.freeze({
  rod: { stats: { name: "Lightning Rod", maxHealth: 150, maxPosture: 999, runSpeed: 0, circleSpeed: 0, turnRate: 0, radius: 0.5, height: 3.2 }, shape: "rod" },
});
