// Forbidden pages and Corruption (GDD §8.2, §8.3). A forbidden page is found, not given: Hollow Bite waits in a Pale
// Choir cache in the Fens (after Ilse). Pinned to your grimoire it takes Wind Wall's button. It bites hard and deletes
// what's guarding a foe (§7.3 Hollow: Null Bite deletes buffs), and it costs you: equipping it, and every cast, raises
// Corruption (0–100, kept with your save). Corruption only comes down slowly (a Verdant Oath shrine, Brother Moss's tea).
//
//   25   the page darkens at the edges: townsfolk talk differently, and Thornwick's children stay in when you're about
//   50   the Crimson Bell hears: two of its wardens stop you in Aurelin with questions (once), and the squad's standing drops
//   75   the Hollow whispers in your fights (the screen frays; the forbidden page bites a fifth harder)
//   100  Erased: you wake in the Hollow, and fight your way back out of it (a nightmare you can't lose for good) to 60

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";

export const CORRUPTION = Object.freeze({
  max: 100, stages: Object.freeze([25, 50, 75, 100]), equip: 5, cast: 2, back: 60, // Erased: climb back to 60
  whisperFactor: 1.2,          // at 75: the forbidden page bites a fifth harder
  bellRep: -4,                 // at 50: the Crimson Bell's questions cost the squad standing
  shrine: 10, tea: 5,          // the slow ways back: a Verdant Oath shrine (once a day), Brother Moss's tea
});

/** What each stage says when you cross it. */
export const CORRUPTION_STAGES = Object.freeze({
  25: "The page darkens at the edges. People notice before you do.",
  50: "The Crimson Bell has heard your name.",
  75: "The Hollow whispers when you fight.",
  100: "ERASED",
});

export const FORBIDDEN_HITBOXES = Object.freeze({
  Bite: { center: [0, 1.0, 1.9], size: [2.2, 1.8, 3.4] },
});

/** Hollow Bite (§8.2's example): huge damage, a lunge and a snap of black teeth. Costs Corruption. */
export const HOLLOW_BITE = defineAbility({ id: "HollowBite", startup: 12, active: 4, recovery: 22, manaCost: 25, cooldownFrames: 60, tags: ["forbidden"],
  hit: hitSpec({ damage: 52, posture: 46, hitstop: 11, hitstun: 34, knockback: 3 }),
  events: [{ frame: 0, type: E.SpawnVfx, key: "grimoire" }, { frame: 4, type: E.Move, key: "toTarget", value: 3 }, { frame: 8, type: E.PlaySound, key: "rift" },
    { frame: 12, type: E.SpawnHitbox, key: "Bite", value: 4 }, { frame: 12, type: E.Custom, key: "forbidden", value: 0 }, { frame: 12, type: E.CameraCue, key: "punch" }] });

/** The buffs a Hollow Bite deletes from what it bites (§7.3 Hollow: Null Bite). */
export const NULL_BITE = Object.freeze(["WARDED", "SHIELDED", "STAR_SURGE"]);
