// Backlash (Ep 49; docs/BACKLASH.md; this folder is the sanctioned exception, GDD §15.11): Cal's past life, playable.
//
// The body: Ash Line Eleven, a 1★ Demon Soldier (BACKLASH.md §6). Heavier, slower and simpler than anything the player
// has had in their hands for forty hours: a 12-frame thrust, a short hop, six frames of dodge and thirty to recover, no
// magic, no ultimate. One thing he has: the drill. Left, left, back, cut. Out of a dodge, the glaive comes up in a rising
// diagonal cleave from the backstep: the Demon Slash, Tier 1, the root of everything he is. (Players have seen Tier 2 as
// his Assist, Tier 3 from the masked knight and in the reveal. This is the first time they perform it.)
//
// The Hero Party (§8): the monthly Goddess Trial. Corin, the Knight Hero (sword and shield, the charge, too strong to
// beat); Maelis, the Goddess Saint (the only magic user anyone has seen: she prays); Teo, "King A", the archer.
// The Line beside him: soldiers in a line, as he is (a guest companion: not a squadmate, no Assist).
// Those above: the Demon Lord King, and his two Commanders. And two figures who arrive at the end (§1, The Void): IDs
// unkA and unkB, and nothing else about them anywhere in the build (§15.11).

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { ROOK_ABILITIES as R, ROOK_STATS, ROOK_HITBOXES } from "../data/rook.js";
import { LINE_POSES, LINE_HITBOXES, LINE_ABILITIES, LEGION_LOOKS } from "./legion.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

// ---- The body ----
/** A Rook move re-cut for the ash-glaive and a soldier's body: new timing, the glaive's boxes, the same routes. */
function recut(base, id, { startup, active, recovery, hit, events, tags } = {}) {
  const s = startup ?? base.startup, a = active ?? base.active, r = recovery ?? base.recovery;
  return defineAbility({ id, animation: id, startup: s, active: a, recovery: r, tags: tags ?? base.tags, hit: hit ?? base.hit,
    cancels: (base.cancels ?? []).map((c) => ({ ...c, from: c.from + (s - base.startup), to: c.to + (s - base.startup) + 4 })),
    events: events ?? base.events });
}
const thrust = hitSpec({ damage: 10, posture: 9, hitstop: 3, hitstun: 15, knockback: 0.8 });

export const ASH_KIT = Object.freeze({
  ...R,
  L1: recut(R.L1, "Thrust", { startup: 12, active: 4, recovery: 20, hit: thrust, events: [sound(9), { frame: 10, type: E.Move, value: 0.7 }, box(12, "Point", 4)] }),
  L2: recut(R.L2, "Thrust2", { startup: 12, active: 4, recovery: 22, hit: thrust, events: [sound(9), { frame: 10, type: E.Move, value: 0.7 }, box(12, "Point", 4)] }),
  L3: recut(R.L3, "Sweep", { startup: 16, active: 6, recovery: 26, hit: hitSpec({ damage: 12, posture: 14, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(13), box(16, "Cut", 6)] }),
  L4: recut(R.L4, "Chop", { startup: 22, active: 5, recovery: 30, hit: hitSpec({ damage: 18, posture: 26, hitstop: 7, hitstun: 24, knockback: 3 }),
    events: [sound(19, "swingHeavy"), box(22, "Chop", 5)] }),
  Launcher: recut(R.Launcher, "Chop", { startup: 22, active: 5, recovery: 30, hit: hitSpec({ damage: 18, posture: 26, hitstop: 7, hitstun: 24, knockback: 3 }),
    events: [sound(19, "swingHeavy"), box(22, "Chop", 5)] }),
  // The drill: out of the dodge (the backstep), the rising cleave. Bonus posture damage.
  DashStrike: recut(R.DashStrike, "DemonSlash", { startup: 10, active: 5, recovery: 18,
    hit: hitSpec({ damage: 16, posture: 30, hitstop: 3, hitstun: 22, knockback: 3 }), tags: ["drill"],
    events: [sound(0, "dodge"), { frame: 1, type: E.Move, value: -0.8 }, sound(8, "swingHeavy"), { frame: 9, type: E.Move, value: 2.2 }, box(10, "Cut", 5)] }),
  Dodge: recut(R.Dodge, "Step", { startup: 0, active: 6, recovery: 30, events: [{ frame: 0, type: E.Invulnerable, value: 6 }, { frame: 0, type: E.Move, value: 3.0 }, sound(0, "dodge")] }),
  Jump: recut(R.Jump, "Hop", { events: [{ frame: 0, type: E.Custom, key: "jump", value: 6 }, sound(0, "jump")] }), // a short hop, no more
  AirJump: recut(R.AirJump, "Hop2", { events: [] }),
  AirDash: recut(R.AirDash, "Stumble", { events: [] }),
  AirL1: recut(R.AirL1, "AirThrust", { hit: thrust, events: [sound(3), box(5, "Point", 3)] }),
  AirL2: recut(R.AirL2, "AirThrust", { hit: thrust, events: [sound(3), box(5, "Point", 3)] }),
  AirL3: recut(R.AirL3, "AirThrust", { hit: thrust, events: [sound(4), box(6, "Point", 3)] }),
  LanternBreak: recut(R.LanternBreak, "Chop", { events: [sound(10, "swingHeavy"), box(14, "Chop", 4)] }),
});

export const ASH_STATS = Object.freeze({ ...ROOK_STATS, name: "Ash Line Eleven", maxHealth: 150, maxMana: 0, manaRegenPerSecond: 0, runSpeed: 5.0, turnRate: 0.22 });
export const ASH_HITBOXES = Object.freeze({ ...ROOK_HITBOXES, ...LINE_HITBOXES });
/** Worn for the whole memory (sim/world.js `kit`). */
export const ASH_WEAR = Object.freeze({ kind: "ashSoldier", stats: ASH_STATS, hitboxes: ASH_HITBOXES, abilities: ASH_KIT, loadout: {} });
/** At 0★, after the kneel (Ch 5): weaker than he has ever been, never explained. */
export const ASH_EMPTY = Object.freeze({ ...ASH_WEAR, stats: { ...ASH_STATS, maxHealth: 110 }, attackScale: 0.55 });

// ---- The Line beside him ----
export const LINE_ALLY = Object.freeze({
  stats: { name: "Soldier", maxHealth: 160, maxPosture: 80, runSpeed: 3.0, turnRate: 0.14, radius: 0.46, height: 2.1, assistCooldownFrames: 99999, reviveFrames: 99999 },
  hitboxes: LINE_HITBOXES, guest: true, slot: [2.2, 0.4], assist: LINE_ABILITIES.Thrust,
  options: () => [new AttackOption(LINE_ABILITIES.Thrust, 1.2, 3.0, 3, 80), new AttackOption(LINE_ABILITIES.Chop, 0, 2.2, 1, 160)],
  supports: () => [],
});

// ---- The Hero Party ----
const HERO_POSES = Object.freeze({
  rest: [0.5, 0.3, 0],
  Cut: { from: [-1.2, 1.2, 0], to: [1.0, -1.2, 0], lean: 0.3 },
  Bash: { from: [0.4, 0.2, 0], to: [0.4, 0.2, 0], lean: 0.45 },
  Charge: { from: [0.5, 0.4, 0], to: [-0.1, 0, 0], lean: 0.6 },
  Arrow: { from: [-0.4, 0.8, 0], to: [-0.4, 0.8, 0], lean: -0.1 },
  Pray: { from: [-0.2, 0.9, 0], to: [-0.2, 0.9, 0], lean: 0.25 },
});
const HERO_HITBOXES = Object.freeze({
  Blade: { center: [0, 1.1, 1.3], size: [2.2, 1.4, 2.2] },
  Shield: { center: [0, 1.1, 1.0], size: [1.8, 1.8, 1.4] },
  Rush: { center: [0, 1.1, 1.0], size: [1.8, 1.8, 1.8] },
  Arrow: { center: [0, 0, 0], size: [0.5, 0.5, 0.5], range: 22, hit: hitSpec({ damage: 12, posture: 10, hitstop: 3, hitstun: 14, knockback: 1 }) },
});
export const HERO_ABILITIES = Object.freeze({
  Cut: defineAbility({ id: "Cut", startup: 10, active: 4, recovery: 16, hit: hitSpec({ damage: 16, posture: 16, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(7), box(10, "Blade", 4)] }),
  Bash: defineAbility({ id: "Bash", startup: 14, active: 4, recovery: 22, hit: hitSpec({ damage: 10, posture: 34, hitstop: 6, hitstun: 22, knockback: 4 }),
    events: [sound(11, "block"), { frame: 12, type: E.Move, value: 0.8 }, box(14, "Shield", 4)] }),
  // The charge: shield up and a lean (the tell), then across the yard. Unblockable.
  Charge: defineAbility({ id: "Charge", startup: 36, active: 14, recovery: 30, hit: hitSpec({ damage: 24, posture: 40, hitstop: 7, hitstun: 30, knockback: 6, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(30, "swingHeavy"), { frame: 34, type: E.Move, value: 9.0 }, box(36, "Rush", 14), { frame: 49, type: E.Custom, key: "chargeEnd" }] }),
  Arrow: defineAbility({ id: "Arrow", startup: 18, active: 2, recovery: 26, tags: ["projectile"], events: [sound(14, "glint"), { frame: 18, type: E.Projectile, key: "Arrow", value: 26 }] }),
  // The Saint's prayers: ten seconds, a voice through the chaos.
  Pray: defineAbility({ id: "Pray", startup: 1, active: 600, recovery: 20, events: [{ frame: 0, type: E.Custom, key: "prayStart" }, sound(0, "hymn"), { frame: 300, type: E.PlaySound, key: "hymn" }, { frame: 599, type: E.Custom, key: "prayEnd" }] }),
});

export const HERO_ENEMIES = Object.freeze({
  heroKnight: {
    stats: { name: "Corin, the Knight Hero", maxHealth: 900, maxPosture: 220, runSpeed: 5.6, circleSpeed: 2.6, turnRate: 0.18, radius: 0.5, height: 2.1 },
    hitboxes: HERO_HITBOXES, abilities: HERO_ABILITIES, poses: HERO_POSES,
    options: () => [new AttackOption(HERO_ABILITIES.Cut, 0, 2.4, 4, 30), new AttackOption(HERO_ABILITIES.Bash, 0, 2.0, 2, 120), new AttackOption(HERO_ABILITIES.Charge, 4, 14, 2, 300)],
    traits: { heavy: true, frontalGuard: true },
  },
  heroSaint: {
    stats: { name: "Maelis, the Goddess Saint", maxHealth: 360, maxPosture: 100, runSpeed: 4.0, circleSpeed: 2, turnRate: 0.15, radius: 0.42, height: 1.9 },
    hitboxes: HERO_HITBOXES, abilities: HERO_ABILITIES, poses: HERO_POSES,
    options: () => [new AttackOption(HERO_ABILITIES.Pray, 0, 30, 1, 900)],
    traits: { ranged: true },
  },
  heroArcher: {
    stats: { name: "Teo, \"King A\"", maxHealth: 420, maxPosture: 110, runSpeed: 5.0, circleSpeed: 3, turnRate: 0.2, radius: 0.42, height: 1.9 },
    hitboxes: HERO_HITBOXES, abilities: HERO_ABILITIES, poses: HERO_POSES,
    options: () => [new AttackOption(HERO_ABILITIES.Arrow, 4, 20, 3, 70), new AttackOption(HERO_ABILITIES.Cut, 0, 2.2, 1, 90)],
    traits: { ranged: true },
  },
});

/** Trial 5's Knight (a boss: the order is to kill him). He can't be killed here; what matters is whether you try. */
export const TRIAL_KNIGHT_STATS = Object.freeze({
  ...HERO_ENEMIES.heroKnight.stats, boss: true, maxHealth: 1200, bossTitle: "TRIAL FIVE · ORDER: ATTACK THE KNIGHT", defeatText: "", phaseMarks: [],
});
export const TRIAL_KNIGHT_TUNING = Object.freeze({ opening: 150, floor: 0.35 });
export const trialKnightOptions = () => [new AttackOption(HERO_ABILITIES.Charge, 2.5, 16, 3, 200), new AttackOption(HERO_ABILITIES.Cut, 0, 2.4, 1, 80)];

// ---- How they look ----
export function backlashLooks(LOOKS) {
  const knight = { poses: HERO_POSES, scale: 1.1, skirt: 0.9, coat: "#dfe6f2", trim: "#3a6ab8", hairColor: "#c8a050", skin: "#f0d0b4",
    head: "face", hair: "crop", weapon: "spear", shield: true, shieldColor: "#3a6ab8", shoulders: 1.35, eyeColor: "#2a4a8a", trail: "#cfe0ff" };
  return {
    ashSoldier: { ...LEGION_LOOKS.lineSoldier },
    lineAlly: { ...LEGION_LOOKS.lineSoldier },
    heroKnight: knight, trialKnight: knight,
    heroSaint: { poses: HERO_POSES, scale: 0.98, skirt: 1.35, coat: "#f6f2e8", trim: "#e6c040", hairColor: "#e8d8a8", skin: "#f3dcc8",
      head: "face", hair: "long", halo: true, weapon: "staff", orb: "#fff2c0", eyeColor: "#5a7ab0", trail: "#fff2c0" },
    heroArcher: { poses: HERO_POSES, scale: 1.02, skirt: 1.0, coat: "#3a6a3a", trim: "#c8a050", hairColor: "#3a2a1a", skin: "#d8a888",
      head: "face", hair: "tousled", hood: "#2a4a2a", weapon: "rod", eyeColor: "#2a3a1a", trail: "#c8e8a0" },
    // The King: vast, black and gold, a crown of horns. He never stands, until the end.
    demonKing: { ...LEGION_LOOKS.lineMarshal, scale: 1.9, coat: "#0e0a0c", trim: "#8a6a2a", maskColor: "#120c0e", edgeColor: "#e8c060", cape: "#1a0606", shoulders: 1.9, trail: "#e8c060" },
    // The Commanders, Ghorran (the Left Wing) and Vaelith (the Right): tall, dark, cloaked like folded wings.
    commanderL: { ...LEGION_LOOKS.lineMarshal, scale: 1.55, coat: "#2a0a0a", cape: "#140404", trail: "#c8402a" },
    commanderR: { ...LEGION_LOOKS.lineMarshal, scale: 1.5, coat: "#1a0a14", cape: "#0e040c", maskColor: "#1a0c14", trail: "#a04ac8" },
    // The two who arrive through the circle: identical black suits, gloves, and featureless black masks.
    unkA: { poses: LOOKS.acolyte.poses, scale: 1.04, skirt: 0.6, coat: "#0a0a0c", trim: "#0a0a0c", hairColor: "#0a0a0c", skin: "#0a0a0c", head: "blank", weapon: "none", trail: "#202024" },
    unkB: { poses: LOOKS.acolyte.poses, scale: 0.98, skirt: 0.6, coat: "#0a0a0c", trim: "#0a0a0c", hairColor: "#0a0a0c", skin: "#0a0a0c", head: "blank", weapon: "none", lute: true, trail: "#202024" },
  };
}
