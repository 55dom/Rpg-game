// Boss 10 · Severin Eclipsed (GDD §16 B10, Ep 28, the Arc 3 finale). Severin has read the forbidden page his
// father gave him, the Eclipse, to write a grimoire into his sister. It is writing him instead. At Mirrorlake
// Saelith his Starlight has turned: his stars are dark, and they pull.
//
//   P1 (100–70%) his rapier and his needles, and dark stars: three wells of night around you that drag you in;
//      their cores burn. Step out of their pull, or dash.
//   P2 (70%)  he calls the Lion out of the sky: a zodiac beast drawn in dark stars. While it stands he's warded.
//   P3 (45%)  Mirrorlake: his reflection stands up out of the water. It fights as he does, but nothing touches
//      it. Every few seconds they trade places, and the one in the water is the real one.
//   P4 (25%)  the Eclipse clause: he reads one line and your Surge is gone, and stays gone for a while.
//   At 12% the lake takes Rook (the episode goes on: the under-text wakes, Annotation, and the last phase).
// The last phase (eclipsedFinal): he starts where he fell; Rook writes on him. Three clauses of ink and the
// corruption breaks: Ink & Starlight. Nobody dies at Mirrorlake.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { SEVERIN_ABILITIES, SEVERIN_HITBOXES, SEVERIN_POSES } from "./severin.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

export const ECLIPSED_STATS = Object.freeze({
  name: "Severin Eclipsed", maxHealth: 2600, maxPosture: 240, runSpeed: 4.8, circleSpeed: 2.6, turnRate: 0.16, radius: 0.45, height: 1.9,
  boss: true, bossTitle: "BOSS 10 · SEVERIN ECLIPSED", defeatText: "THE LAKE TAKES YOU", phaseMarks: [0.7, 0.45, 0.25, 0.12],
});
export const ECLIPSED_FINAL_STATS = Object.freeze({ ...ECLIPSED_STATS, maxHealth: 900, bossTitle: "SEVERIN ECLIPSED · THE MARGIN", defeatText: "INK & STARLIGHT", phaseMarks: [] });

export const ECLIPSED_HITBOXES = SEVERIN_HITBOXES;
export const ECLIPSED_POSES = Object.freeze({
  ...SEVERIN_POSES,
  DarkStars: { from: [-2.4, 0.2, 0], to: [-2.6, 0.1, 0], lean: -0.3 },
  CallLion: { from: [-2.6, 0.4, 0], to: [-2.8, 0.2, 0], lean: -0.4 },
  Mirror: { from: [-1.6, 0.6, 0], to: [-1.8, 0.4, 0], lean: -0.2 },
  Eclipse: { from: [-2.8, 0.1, 0], to: [-2.8, 0.1, 0], lean: -0.5 },
});

export const ECLIPSED_TUNING = Object.freeze({
  sinkAt: 0.12,           // the lake takes Rook here (the first fight is "won")
  wells: { count: 3, ring: 4.2, pullRadius: 5.2, pull: 3.4, core: 1, life: 420, tick: 30 },
  well: hitSpec({ damage: 6, posture: 4, hitstop: 2, hitstun: 10, knockback: 0 }),
  lionWard: 0.35,         // his damage taken while the Lion stands
  swapEvery: 330,         // P3: real and reflection trade places
  eclipse: { every: 780, lock: 420 }, // P4: Surge erased, and no Surge for this long
  inscriptions: 3,        // the last phase: clauses of ink to break the corruption
});

export const ECLIPSED_ABILITIES = Object.freeze({
  Lunge: SEVERIN_ABILITIES.Lunge, Flurry: SEVERIN_ABILITIES.Flurry, Sweep: SEVERIN_ABILITIES.Sweep, StarNeedles: SEVERIN_ABILITIES.StarNeedles,
  DarkStars: defineAbility({ id: "DarkStars", startup: 30, active: 2, recovery: 26,
    events: [{ frame: 0, type: E.Invulnerable, value: 30 }, { frame: 4, type: E.SpawnVfx, key: "starcharge" }, sound(26, "tear"), custom(30, "darkStars")] }),
  CallLion: defineAbility({ id: "CallLion", startup: 40, active: 2, recovery: 30,
    events: [{ frame: 0, type: E.Invulnerable, value: 42 }, { frame: 6, type: E.SpawnVfx, key: "starcharge" }, sound(36, "surgeFull"), custom(40, "lion")] }),
  Mirror: defineAbility({ id: "Mirror", startup: 24, active: 2, recovery: 20,
    events: [{ frame: 0, type: E.Invulnerable, value: 26 }, sound(20, "rift"), custom(24, "mirror")] }),
  // The Eclipse clause: a slow read, a red glint at the end. You can't stop it; you'll feel it.
  Eclipse: defineAbility({ id: "Eclipse", startup: 50, active: 2, recovery: 30,
    events: [{ frame: 0, type: E.Invulnerable, value: 52 }, { frame: 20, type: E.SpawnVfx, key: "glint" }, sound(46, "tear"), custom(50, "eclipse")] }),
});

export const eclipsedOptions = (phase) => {
  const A = ECLIPSED_ABILITIES;
  return [
    new AttackOption(A.StarNeedles, 3.5, 15, 3, 80),
    new AttackOption(A.Lunge, 2.2, 5.5, 2, 70),
    new AttackOption(A.Flurry, 0, 2.4, 3, 55),
    new AttackOption(A.DarkStars, 0, 16, 2, phase >= 3 ? 300 : 380),
    ...(phase >= 2 ? [new AttackOption(A.Sweep, 0, 2.8, 2, 200)] : []),
  ];
};
/** The last phase: no more summoning or reading. He's barely standing; he still fights. */
export const eclipsedFinalOptions = () => {
  const A = ECLIPSED_ABILITIES;
  return [new AttackOption(A.Flurry, 0, 2.4, 3, 70), new AttackOption(A.Lunge, 2.2, 5.5, 2, 110), new AttackOption(A.StarNeedles, 3.5, 15, 2, 140)];
};

export const ECLIPSED_PHASES = Object.freeze([
  { phase: 1, above: 0.7 }, { phase: 2, above: 0.45, lion: true }, { phase: 3, above: 0.25, mirror: true },
  { phase: 4, above: 0.12, eclipse: true }, { phase: 5, above: 0, sink: true },
]);

// ---- The Lion: a zodiac beast drawn in dark stars (P2). A big cat made of points of light and the lines between them.
export const LION_STATS = Object.freeze({ name: "The Eclipsed Lion", maxHealth: 420, maxPosture: 120, runSpeed: 6.2, circleSpeed: 3.4, turnRate: 0.2, radius: 0.9, height: 1.7 });
export const LION_HITBOXES = Object.freeze({
  Claw: { center: [0, 0.9, 1.5], size: [2.4, 1.4, 2.0] },
  Pounce: { center: [0, 0.9, 1.6], size: [2.2, 1.6, 2.6] },
});
export const LION_ABILITIES = Object.freeze({
  Claw: defineAbility({ id: "Claw", startup: 12, active: 4, recovery: 20,
    hit: hitSpec({ damage: 10, posture: 12, hitstop: 4, hitstun: 16, knockback: 2 }),
    events: [sound(9), { frame: 12, type: E.SpawnHitbox, key: "Claw", value: 4 }] }),
  Pounce: defineAbility({ id: "Pounce", startup: 22, active: 6, recovery: 30,
    hit: hitSpec({ damage: 16, posture: 20, hitstop: 6, hitstun: 24, knockback: 5 }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(18, "swingHeavy"), { frame: 20, type: E.Move, value: 5.2 }, { frame: 22, type: E.SpawnHitbox, key: "Pounce", value: 6 }] }),
});
export const lionOptions = () => [new AttackOption(LION_ABILITIES.Claw, 0, 2.6, 3, 40), new AttackOption(LION_ABILITIES.Pounce, 3, 8, 2, 160)];
export const LION_POSES = Object.freeze({ rest: [0, 0, 0], Claw: { from: [0, 0, 0], to: [0, 0, 0], lean: 0.3 }, Pounce: { from: [0, 0, 0], to: [0, 0, 0], lean: 0.5 } });

/** The Lion's shape: star points (x, y, z, size) and the lines that join them, facing +z. Drawn by runtime/constellation.js. */
export const LION_FIGURE = Object.freeze({
  stars: [
    [0, 1.55, 1.25, 0.16], [0.28, 1.75, 1.0, 0.1], [-0.28, 1.75, 1.0, 0.1], [0, 1.25, 1.55, 0.1], // head, ears, muzzle
    [0, 1.3, 0.6, 0.14], [0, 1.25, -0.2, 0.12], [0, 1.15, -0.9, 0.14],                                   // spine
    [0.32, 0.05, 0.75, 0.09], [-0.32, 0.05, 0.75, 0.09], [0.3, 0.05, -0.85, 0.09], [-0.3, 0.05, -0.85, 0.09], // paws
    [0, 1.45, -1.5, 0.08], [0, 1.85, -1.8, 0.1],                                                          // tail
    [0.42, 1.45, 1.05, 0.08], [-0.42, 1.45, 1.05, 0.08],                                                  // mane
  ],
  lines: [[0, 1], [0, 2], [0, 3], [0, 13], [0, 14], [13, 4], [14, 4], [0, 4], [4, 5], [5, 6], [4, 7], [4, 8], [6, 9], [6, 10], [6, 11], [11, 12]],
  legs: { front: [7, 8], back: [9, 10] }, // these points step as it moves
});

// ---- Who he calls (spawned by name: data/enemies.js spreads these in) ----------------------------
export const REFLECTION_STATS = Object.freeze({ ...ECLIPSED_STATS, name: "Reflection", boss: false, maxHealth: 9999, phaseMarks: [] });
export const ECLIPSE_ENEMIES = Object.freeze({
  lion: { stats: LION_STATS, hitboxes: LION_HITBOXES, abilities: LION_ABILITIES, poses: LION_POSES, options: lionOptions, traits: { heavy: true } },
  // His reflection in Mirrorlake: it fights as he does; nothing touches it (traits.mirror).
  reflection: { stats: REFLECTION_STATS, hitboxes: ECLIPSED_HITBOXES, abilities: ECLIPSED_ABILITIES, poses: ECLIPSED_POSES,
    options: () => [new AttackOption(ECLIPSED_ABILITIES.Flurry, 0, 2.4, 3, 70), new AttackOption(ECLIPSED_ABILITIES.StarNeedles, 3.5, 15, 2, 120)],
    traits: { mirror: true } },
});
