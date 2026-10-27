// What Arc 4 and the earlier Arc 5 episodes leave behind, for an Arc 5 episode started straight from the menu.
// Like arc3.js and arc4.js: an episode's `setup` only fills in flags a save doesn't already have.

import { AFTER_EP38 } from "./arc4.js";

/** By the end of Episode 39: the Paragon is home, and the Lanterns will carry the key's other half with him. */
export const AFTER_EP39 = Object.freeze({ ...AFTER_EP38, EP39_DONE: 1, PARAGON_HOME: 1 });

/** By the end of Episode 40: the Paragon sparred with Rook, and the page turned back: Revision. */
export const AFTER_EP40 = Object.freeze({ ...AFTER_EP39, EP40_DONE: 1, REVISION: 1 });

/** By the end of Episode 41: Mother Vey told them what Hesper needs (a page: Elodie), and died in the Hall of Lanterns. */
export const AFTER_EP41 = Object.freeze({ ...AFTER_EP40, EP41_DONE: 1, VEY_TOLD: 1, VEY_DEAD: 1 });

/** By the end of Episode 42: the second clause is written on Elodie's wrist, and the door couldn't read her. */
export const AFTER_EP42 = Object.freeze({ ...AFTER_EP41, EP42_DONE: 1, CLAUSE_II: "nobody", HESPER_REFUSED: 1 });
