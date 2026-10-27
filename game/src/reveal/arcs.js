// What the reveal episodes leave behind, for an episode started straight from the menu (like data/story/arc5.js; these
// name what only src/reveal/ may name, GDD §15.11).

import { AFTER_EP47 } from "../data/story/arc5.js";

/** By the end of Episode 48: the mask cracked; the face in the smoke; the fight; Larkspur. */
export const AFTER_EP48 = Object.freeze({ ...AFTER_EP47, EP48_DONE: 1, MASK_CRACKED: 1, MEMORY_LINE: "key", CAL_IDENTITY_REVEALED: 1, LARKSPUR_SAID: 1 });
