// What the reveal episodes leave behind, for an episode started straight from the menu (like data/story/arc5.js; these
// name what only src/reveal/ may name, GDD §15.11).

import { AFTER_EP47 } from "../data/story/arc5.js";

/** By the end of Episode 48: the mask cracked; the face in the smoke; the fight; Larkspur. */
export const AFTER_EP48 = Object.freeze({ ...AFTER_EP47, EP48_DONE: 1, MASK_CRACKED: 1, MEMORY_LINE: "key", CAL_IDENTITY_REVEALED: 1, LARKSPUR_SAID: 1 });

/** By the end of Episode 49: Backlash, played to the grin. */
export const AFTER_EP49 = Object.freeze({ ...AFTER_EP48, EP49_DONE: 1, BACKLASH_SEEN: 1, TRIAL4: "watch", SAW_SACRIFICE: 1, STAR_GIVEN: 1, TEO_FALLEN: 1 });

/** By the end of Episode 50: the Chain, the door closed from the other side, the siege over, and the Field Notes. */
export const AFTER_EP50 = Object.freeze({ ...AFTER_EP49, EP50_DONE: 1, PERSPECTIVE: "rook", CHAIN_DONE: 1, GATE_OPEN: 0, GATE_SEALED: 1, SIEGE_OVER: 1, FIELD_NOTES: 1 });

// ---- Arc 6 · The Light Left On ----
/** By the end of Episode 51: the morning after; Juno's knot cut; the Field Notes read; the Bell's notice; the summons. */
export const AFTER_EP51 = Object.freeze({ ...AFTER_EP50, EP51_DONE: 1, CAL_JUNO: "betrayed", JUNO_KNOT: 0, ROOK_ASKED: "why", LIO_SCRIPT: 1, FIELD_NOTES_READ: 1,
  DAGRUN_STEP: 1, BELL_NOTICE: 1, BELL_INQUIRY: 1, BELL_SEAL: 1, SEVERIN_FLOWER: "kept", NOTES_GIVEN: 0 });

/** By the end of Episode 52: heard by the Bell; the Silencing found nothing; struck off; Juno's margin; Dagrun spoke. */
export const AFTER_EP52 = Object.freeze({ ...AFTER_EP51, EP52_DONE: 1, BELL_ANSWER: "honest", SILENCED: 1, MERIT_FROZEN: 1, BELL_WARDEN_POSTED: 1, BELL_TOKEN: 1,
  MARGIN_JUNO: 1, DAGRUN_LIGHT: "fool", DAGRUN_SPOKE: 1 });

/** By the end of Episode 53: the three under the Lowmarket; the last order broken; their questions; V4; Tamsin's margin. */
export const AFTER_EP53 = Object.freeze({ ...AFTER_EP52, EP53_DONE: 1, WARDEN_ALONG: "asked", LINE_BROKEN: 1, FOUR_ORDER: "none", V4_HEARD: 1,
  STRANDED: "hidden", FOUR_ASKED_NAME: 1, MARGIN_TAMSIN: 1, TAMSIN_LIKE: "find" });

/** By the end of Episode 54: the Chancellor's trial; Hesper told him, and someone told Hesper; Ironhold; Bas's margin. */
export const AFTER_EP54 = Object.freeze({ ...AFTER_EP53, EP54_DONE: 1, SEVERIN_TRIAL: "behind", ALDRIC_TESTIMONY: "question", ALDRIC_HINT: 1,
  ALDRIC_SENTENCE: "ironhold", SEVERIN_FLOWER: "given", MARGIN_BAS: 1, BAS_RESOLVE: "together" });

/** By the end of Episode 55: into the Hollow after Hesper; she came out; "A boy with no grimoire taught me about the Hollow."; Lio's margin. */
export const AFTER_EP55 = Object.freeze({ ...AFTER_EP54, EP55_DONE: 1, HESPER_ORDER: "alive", HESPER_HAND: 1, HESPER_CAPTURED: 1, HESPER_ASKED: "yes",
  HESPER_BOY: 1, MARGIN_LIO: 1, LIO_MARGIN: "both" });

/** By the end of Episode 56: Brother Moss, the last Keeper; the book scraped bare; the sealed floor; the first line; Dagrun's margin. */
export const AFTER_EP56 = Object.freeze({ ...AFTER_EP55, EP56_DONE: 1, MOSS_ANSWER: "twice", MOSS_TRUTH: 1, SCRIBE_FLOOR: 1, PALIMPSEST_LINE: 1,
  MARGIN_DAGRUN: 1, DAGRUN_QUEST: "look" });

/** By the end of Episode 57: Larkspur; the names; the door; the Choir's last faithful; "Keep the key."; the keyhole. */
export const AFTER_EP57 = Object.freeze({ ...AFTER_EP56, EP57_DONE: 1, LARKSPUR_FEEL: "here", MARGIN_ROOK: 1, KEY_HOLE: 1, LARKSPUR_BURN: 1, KEY_WAIT: "everyone" });

/** By the end of Episode 58 (the end of Arc 6): Thornwick's ledger; back on the rolls; Hesper's message; a knot tied again; everyone. */
export const AFTER_EP58 = Object.freeze({ ...AFTER_EP57, EP58_DONE: 1, ARC6_DONE: 1, WREN_ANSWER: "watching", MERIT_FROZEN: 0, BELL_WARDEN_POSTED: 0,
  LANTERNS_RESTORED: 1, HESPER_MESSAGE: 1, JUNO_KNOT: 1, CAL_JUNO: "unresolved", BAS_CROSSING: "reluctant", SEVERIN_CROSSING: 1, DAGRUN_CROSSING: 1,
  ROOK_ORDER: "everyone", LAST_SPAR: 1, LIGHT_LEFT_ON: 1 });

// ---- Arc 7 · Unwritten ----
/** By the end of Episode 59: the key turned from this side; across; the Line still holding; a sergeant's question. */
export const AFTER_EP59 = Object.freeze({ ...AFTER_EP58, EP59_DONE: 1, KEY_WORDS: "keys", LARKSPUR_OPEN: 1, SOLDIERS_TREAT: "asking", BOND_CAL: 120 });

/** By the end of Episode 60: the continent today; the bunk, the drill, the spoon; the Marshal spared; the Trial's light. */
export const AFTER_EP60 = Object.freeze({ ...AFTER_EP59, EP60_DONE: 1 });

/** By the end of Episode 61: the coffin and the two at it; the Hero Party out of the pillar; Corin's test; a truce. */
export const AFTER_EP61 = Object.freeze({ ...AFTER_EP60, EP61_DONE: 1, HEROES_TOLD: "soldier", HERO_TRUCE: 1 });

/** By the end of Episode 62: Maelis by the brazier, one star left; the night attack; Maelis beside them. */
export const AFTER_EP62 = Object.freeze({ ...AFTER_EP61, EP62_DONE: 1, MAELIS_PROMISE: "dont", MAELIS_GUEST: 1 });

/** By the end of Episode 63: his door at the edge of the camp; Dagrun made him look; "You. The one who didn't kill me."; the sketchbook (V5). */
export const AFTER_EP63 = Object.freeze({ ...AFTER_EP62, EP63_DONE: 1, DAGRUN_LOOKED: 1, GARDEN_ASKED: 1, V5_SEEN: 1, BOND_CAL: 130 });

/** By the end of Episode 64: "Doors, Tamsin. I make doors." (V6); the Throne Guard; the two empty places. */
export const AFTER_EP64 = Object.freeze({ ...AFTER_EP63, EP64_DONE: 1, V6_SEEN: 1 });

/** By the end of Episode 65: the warning (three offerings); "They'd have told me."; Bas will stand next to him. */
export const AFTER_EP65 = Object.freeze({ ...AFTER_EP64, EP65_DONE: 1, WARNED: "straight", BOND_CAL: 150, BAS_TRUCE: 1 });

/** By the end of Episode 66: side by side; Cal on the bench; the Thousand-Door Verse; "Family. Sort of. Not yet." (V7); Juno. */
export const AFTER_EP66 = Object.freeze({ ...AFTER_EP65, EP66_DONE: 1, ALLIANCE: 1, V7_ASKED: 1, CAL_JUNO: "family", BOND_CAL: 170 });

/** By the end of Episode 67: the Rite; Star Sight; the coffin answered (V8); he took it; Layer 10; the page tearing. */
export const AFTER_EP67 = Object.freeze({ ...AFTER_EP66, EP67_DONE: 1, RITE_BEGUN: 1, STAR_SIGHT: 1, V8_HEARD: 1, CAL_ASCENDED: 1, LAYER_TEN: 1, PAGE_TORN: 1 });

/** By the end of Episode 68: the page tearing; together, and down; alone; on one knee; "Take mine." */
export const AFTER_EP68 = Object.freeze({ ...AFTER_EP67, EP68_DONE: 1 });

/** By the end of Episode 69: the Shared Star; seven over Rook; Unwritten; the final clash. */
export const AFTER_EP69 = Object.freeze({ ...AFTER_EP68, EP69_DONE: 1, SHARED_STAR: 1, UNWRITTEN: 1, FINAL_CLASH: 1 });

/** By the end of Episode 70: the Clause, and everyone home. */
export const AFTER_EP70 = Object.freeze({ ...AFTER_EP69, EP70_DONE: 1, CAL_FATE: "lantern", CLAUSE_III: 1, CAL_STATE: 0, STORY_COMPLETE: 1 });
