// Episode 50's fighters (GDD §15.8, the fight against Cal, Phases 4–6; docs/BACKLASH.md §1, the Perspective Choice).
// This folder is the sanctioned exception (GDD §15.11).
//
//   calSeated     Phase 4, "Not serious": he sits on the golden door frame he opened, swinging one leg, and grades you.
//                 He can't be hurt here, and he never moves first: something interesting (a perfect dodge, a parry, a
//                 team attack) gets an answer, a golden door under your feet; anything else, commentary.
//   calBonds      Phase 6, "Bonds": he fights properly now, the saber and the doors, and can't be brought down by
//                 wearing; what ends it is the party back together (the Links) and the Lantern Chain.
//   Whose story? If the player chooses Cal, they wear him (CAL_WEAR: a saber, a door for a dodge, the drill grown into
//   the Ascended Demon Slash), and the Lanterns fight them: rookFoe, junoFoe, basFoe.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { ROOK_ABILITIES as R, ROOK_STATS, ROOK_HITBOXES, ROOK_POSES } from "../data/rook.js";
import { COMPANIONS } from "../data/companions.js";
import { UNMASKED_ABILITIES as U, UNMASKED_HITBOXES, UNMASKED_STATS } from "./duel.js";
import { recut } from "./backlash.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

export const FINALE_TUNING = Object.freeze({
  answer: { delay: 34, r: 1.5, spec: hitSpec({ damage: 9, posture: 10, hitstop: 4, hitstun: 16, knockback: 2 }) }, // his answer: a door under you
  bondsFloor: 0.45,
});
export const ANSWER = defineAbility({ id: "Answer", startup: 1, active: 1, recovery: 1, hit: FINALE_TUNING.answer.spec, events: [] });

export const FINALE_ENEMIES = Object.freeze({
  calSeated: {
    stats: { ...UNMASKED_STATS, boss: false, name: "Cal", maxHealth: 5000, runSpeed: 0, circleSpeed: 0, turnRate: 0.06 },
    hitboxes: UNMASKED_HITBOXES, abilities: U, options: () => [new AttackOption(U.DoorCut, 0, 2.4, 1, 99999)], // never on his own (finaleSim.js)
    traits: { heavy: true },
  },
  calBonds: {
    stats: { ...UNMASKED_STATS, boss: false, name: "Cal", maxHealth: 2600, maxPosture: 260 },
    hitboxes: UNMASKED_HITBOXES, abilities: U,
    options: () => [new AttackOption(U.DoorCut, 0, 2.4, 4, 34), new AttackOption(U.DoorThrust, 1.5, 3.8, 2, 120)],
    traits: { heavy: true },
  },
  // The Lanterns, when it's his story (the player is Cal): what they'd do to him.
  rookFoe: {
    stats: { ...ROOK_STATS, name: "Rook", maxHealth: 900, maxPosture: 180, runSpeed: 5.6, circleSpeed: 3.0, turnRate: 0.22 },
    hitboxes: ROOK_HITBOXES, abilities: R, poses: ROOK_POSES,
    options: () => [new AttackOption(R.L1, 0, 2.2, 4, 26), new AttackOption(R.L3, 0, 2.4, 2, 70), new AttackOption(R.DashStrike, 2, 6, 2, 130), new AttackOption(R.Launcher, 0, 2.0, 1, 160)],
    traits: {},
  },
  // Companions never circle, so their stats carry no circleSpeed: an enemy brain needs one (sim/world.js).
  junoFoe: { ...COMPANIONS.juno, stats: { ...COMPANIONS.juno.stats, maxHealth: 700, circleSpeed: 3.2 }, traits: {} },
  basFoe: { ...COMPANIONS.bas, stats: { ...COMPANIONS.bas.stats, maxHealth: 900, circleSpeed: 2.2 }, traits: { heavy: true } },
});

// ---- Wearing him (the Cal perspective) ----
const saber = hitSpec({ damage: 12, posture: 12, hitstop: 4, hitstun: 16, knockback: 1.2 });
export const CAL_KIT = Object.freeze({
  ...R,
  L1: recut(R.L1, "Cut", { startup: 6, active: 4, recovery: 12, hit: saber, events: [sound(4), box(6, "Saber", 4)] }),
  L2: recut(R.L2, "Cut", { startup: 6, active: 4, recovery: 12, hit: saber, events: [sound(4), box(6, "Saber", 4)] }),
  L3: recut(R.L3, "Cut", { startup: 8, active: 4, recovery: 16, hit: hitSpec({ damage: 14, posture: 16, hitstop: 5, hitstun: 18, knockback: 2 }), events: [sound(6), box(8, "Saber", 4)] }),
  L4: recut(R.L4, "Thrust", { startup: 14, active: 5, recovery: 20, hit: hitSpec({ damage: 18, posture: 24, hitstop: 6, hitstun: 22, knockback: 4 }),
    events: [sound(10, "swingHeavy"), { frame: 12, type: E.Move, value: 2.2 }, box(14, "Point", 5)] }),
  Launcher: recut(R.Launcher, "Thrust", { startup: 14, active: 5, recovery: 20, hit: hitSpec({ damage: 18, posture: 24, hitstop: 6, hitstun: 22, knockback: 4 }),
    events: [sound(10, "swingHeavy"), { frame: 12, type: E.Move, value: 2.2 }, box(14, "Point", 5)] }),
  // The drill, grown up: out of the door-step, the Ascended Demon Slash, edged in gold.
  DashStrike: recut(R.DashStrike, "AscendedSlash", { startup: 8, active: 5, recovery: 14, tags: ["drill"],
    hit: hitSpec({ damage: 22, posture: 34, hitstop: 5, hitstun: 24, knockback: 4 }),
    events: [sound(0, "door"), { frame: 1, type: E.Move, value: -0.6 }, sound(6, "swingHeavy"), { frame: 7, type: E.Move, value: 3.2 }, box(8, "Cut", 5)] }),
  Dodge: recut(R.Dodge, "DoorStep", { startup: 0, active: 14, recovery: 10, events: [{ frame: 0, type: E.Invulnerable, value: 14 }, { frame: 0, type: E.Move, value: 4.6 }, sound(0, "door")] }),
});
export const CAL_STATS = Object.freeze({ ...ROOK_STATS, name: "Cal", maxHealth: 600, maxMana: 0, manaRegenPerSecond: 0, runSpeed: 7.0 });
export const CAL_WEAR = Object.freeze({ kind: "calPlayer", title: "WHOSE STORY", stats: CAL_STATS, hitboxes: { ...ROOK_HITBOXES, ...UNMASKED_HITBOXES }, abilities: CAL_KIT, loadout: {} });
/** Phase 4 from his side: he sits on his door and isn't trying. He can step aside; nothing he swings lands. */
export const CAL_SEATED_WEAR = Object.freeze({ ...CAL_WEAR, attackScale: 0.01 });

/** How they look (runtime/rig.js LOOKS). */
export function finaleLooks(LOOKS) {
  return {
    calSeated: { ...LOOKS.unmasked }, calBonds: { ...LOOKS.unmasked }, calPlayer: { ...LOOKS.unmasked },
    unmaskedGrin: { ...LOOKS.unmasked, grin: true }, // the match cut: the same grin, on the face he has now
    rookFoe: { ...LOOKS.player }, junoFoe: { ...LOOKS.juno }, basFoe: { ...LOOKS.bas },
  };
}
