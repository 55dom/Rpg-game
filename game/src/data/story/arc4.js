// What Arc 3 and the earlier Arc 4 episodes leave behind, for an Arc 4 episode started straight from the menu.
// Like arc3.js: an episode's `setup` only fills in flags a save doesn't already have.

import { AFTER_EP27 } from "./arc3.js";

/** By the end of Episode 28: Severin came home, Annotation woke, and someone left a flower on Aurek's grave. */
export const AFTER_EP28 = Object.freeze({ ...AFTER_EP27, EP28_DONE: 1, ARC3_DONE: 1, SEVERIN_ECLIPSED: 1, ANNOTATION: 1, CLAUSE_I: "home",
  CRYPT_FLOWER: 1, CRYPT_SEEN: 1, RUMOR_AUREK: 1 });

/** By the end of Episode 29: Severin lives at the Lighthouse, and Aldric's Lances have been sent packing. */
export const AFTER_EP29 = Object.freeze({ ...AFTER_EP28, EP29_DONE: 1, SEVERIN_AT_LIGHTHOUSE: 1, AUREK_THEORY: 1, ELODIE_DRUMS: 1, LANCES_MET: 1 });

/** By the end of Episode 30: the Storm Warden sleeps again, and the Lances have the Writ. */
export const AFTER_EP30 = Object.freeze({ ...AFTER_EP29, EP30_DONE: 1, WARDEN_DEFEATED: 1, WRIT_TAKEN: 1 });

/** By the end of Episode 31: the poor quarter's children are home, Wraithe is dead, and the masked knight was there. */
export const AFTER_EP31 = Object.freeze({ ...AFTER_EP30, EP31_DONE: 1, SABLE_ENCOUNTER: 3, CLUE_B4: 1, WRAITHE_DEAD: 1, KIDS_HOME: 1, RUMOR_FERRYMAN: 1 });

/** By the end of Episode 32: Aldric showed Severin the Writ (a map of a door under the Lowmarket), and Hesper has his ear. */
export const AFTER_EP32 = Object.freeze({ ...AFTER_EP31, EP32_DONE: 1, HESPER_ALDRIC: 1, WRIT_MAP: 1 });

/** By the end of Episode 33: Elodie found the door under the Lowmarket (it knew her name), and Halvard gave away the route. */
export const AFTER_EP33 = Object.freeze({ ...AFTER_EP32, EP33_DONE: 1, ELODIE_DOOR: 1, HOLLOW_DOOR: 1, CONVOY_ROUTE: 1 });

/** By the end of Episode 34: the masked knight took the Writ from Aldric, and stopped when Severin said his brother's name. */
export const AFTER_EP34 = Object.freeze({ ...AFTER_EP33, EP34_DONE: 1, SABLE_ENCOUNTER: 4, WRIT_STOLEN: 1, SEVERIN_SAVED_ALDRIC: 1 });
