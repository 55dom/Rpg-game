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
