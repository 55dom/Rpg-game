// Arc 7 · Unwritten (GDD §27, §25, §28; Phase 7 Steps 6–10, §23.6). This folder is the one allowed to name him
// (§15.11). Who fights in it, how they look, and what the stars say once everyone can see them.
//
//   The Hero Party, fifteen years on: Corin (5★ since the throne room, the only 5★ anyone outside it knows of), Maelis
//   (1★, frail; one more Sacrifice and she falls off the page), and King D, the archer (the Trial's fourth by that name).
//   Maelis as a guest (§27.3): Low Heal, a long prayer that mends whoever's hurt worst (protect her while she prays).
//   Cal beside Rook (§27.7): a guest at first, then on the tag-swap bench (the player can be him).
//   The Throne Guard Lines and the Line Marshals: the army's last orders, fifteen years old, still obeyed.
//   Cal at the end (§27.9): every door he has, the Line's drill, the Marshal's weight, and what he took from the Rite.
//   Star Sight (§25.3): from the Rite on, ratings over everyone in a fight, in ink. Over Rook, nothing.

import { AttackOption } from "../core/ai.js";
import { LEGION_ENEMIES, LINE_ABILITIES as L, LINE_HITBOXES } from "./legion.js";
import { UNMASKED_ABILITIES as U, UNMASKED_HITBOXES, UNMASKED_STATS } from "./duel.js";
import { CAL_KIT, CAL_STATS, CAL_WEAR } from "./finale.js";


// ---- Allies (src/reveal/allies.js, where data/companions.js can reach them without a cycle) ----
export { PRAYER, MAELIS_ALLY, CAL_ALLY } from "./allies.js";

/** On the tag-swap bench (sim/world.js takes a member spec): the player can be him. */
export const CAL_MEMBER = Object.freeze({ id: "cal", kind: "calPlayer", name: "Cal", stats: CAL_STATS, hitboxes: CAL_WEAR.hitboxes, abilities: CAL_KIT, loadout: {} });

// ---- Enemies ----
export const ARC7_ENEMIES = Object.freeze({
  throneGuard: { ...LEGION_ENEMIES.lineSoldier,
    stats: { ...LEGION_ENEMIES.lineSoldier.stats, name: "Throne Guard", maxHealth: 190, maxPosture: 100, runSpeed: 2.8 } },
  heroKnightNow: { // Corin, fifteen years on: testing the demon-friends before he'll stand beside them (he yields; he never dies)
    stats: { name: "Corin, the Knight Hero", maxHealth: 2200, maxPosture: 320, runSpeed: 5.8, circleSpeed: 2.8, turnRate: 0.18, radius: 0.5, height: 2.1 },
    hitboxes: LINE_HITBOXES, abilities: { Chop: L.Chop, Thrust: L.Thrust, Maul: L.Maul },
    options: () => [new AttackOption(L.Thrust, 1.0, 3.0, 4, 40), new AttackOption(L.Chop, 0, 2.2, 3, 90), new AttackOption(L.Maul, 0, 2.8, 1, 260)],
    traits: { heavy: true },
  },
  // Cal at the end: doors, the drill, the Marshal's weight; with what he took in the Rite, and his own regard for you.
  calRite: {
    stats: { ...UNMASKED_STATS, name: "Cal", boss: true, maxHealth: 5200, maxPosture: 420, runSpeed: 6.4, circleSpeed: 3.2 },
    hitboxes: { ...UNMASKED_HITBOXES, ...LINE_HITBOXES }, abilities: { DoorCut: U.DoorCut, DoorThrust: U.DoorThrust, Drill: L.Drill, Maul: L.Maul },
    options: () => [new AttackOption(U.DoorCut, 0, 2.4, 4, 30), new AttackOption(U.DoorThrust, 1.5, 3.8, 2, 110), new AttackOption(L.Drill, 1.5, 3.6, 2, 220),
      new AttackOption(L.Maul, 0, 2.8, 1, 300)],
    traits: { heavy: true },
  },
});

// ---- How they look (runtime/rig.js LOOKS) ----
export function arc7Looks(LOOKS) {
  return {
    corinNow: { ...LOOKS.heroKnight, scale: 1.1, hairColor: "#8a8478", trail: "#cfe0ff" },
    heroKnightNow: { ...LOOKS.heroKnight, scale: 1.1, hairColor: "#8a8478", trail: "#cfe0ff" },
    maelisNow: { ...LOOKS.heroSaint, scale: 0.92, hairColor: "#e8e4dc", trail: "#fff2c0" },
    maelisAlly: { ...LOOKS.heroSaint, scale: 0.92, hairColor: "#e8e4dc", trail: "#fff2c0" },
    kingD: { ...LOOKS.heroArcher, coat: "#3a4a6a", hairColor: "#6a4a2a" },
    calAlly: { ...LOOKS.unmasked }, calRite: { ...LOOKS.unmasked, trail: "#e8dca0" },
    throneGuard: { ...LOOKS.lineSoldier, scale: 1.12, coat: "#2a0a0a", edgeColor: "#e8c060", trail: "#e8c060" },
  };
}

// ---- Star Sight (§25.3): what the Rite makes everyone see, from then on ----
export const RATINGS = Object.freeze({
  bas: 2, juno: 2, tamsin: 1, lio: 2, dagrun: 3, severin: 3, severinAlly: 3, maelis: 1, maelisNow: 1, maelisAlly: 1, corin: 5, corinNow: 5, heroKnightNow: 5,
  kingD: 3, lineSoldier: 1, throneGuard: 1, lineMarshal: 2, calAlly: "?", calRite: "?", calPlayer: "?", unkATrue: 5, unkBTrue: 5,
});
/** The rating over this kind of fighter once Star Sight is on, or null (over Rook: nothing, ever). */
export function ratingOf(kind) { return kind === "player" ? null : RATINGS[kind] ?? null; }

/** The final clash, once the stars are given (§25.4): Rook can't be described by the scale, and hits like it. */
export const UNWRITTEN_MODS = Object.freeze({ attack: 1.2, defense: 0.6, posture: 1.0 });
