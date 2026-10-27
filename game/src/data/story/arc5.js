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

/** By the end of Episode 43: Encounter VI. The masked knight took the Paragon's half of the key on the road under the Hall. */
export const AFTER_EP43 = Object.freeze({ ...AFTER_EP42, EP43_DONE: 1, KEY_CARRIED: 1, KEY_TAKEN: 1, SABLE_ENCOUNTER: 6 });

/** By the end of Episode 44: the first Paragon's account was cut; Lio found the hymnal: the invitation needs no key, only a name. */
export const AFTER_EP44 = Object.freeze({ ...AFTER_EP43, EP44_DONE: 1, ACCOUNT_CUT: 1, HYMNAL_FOUND: 1, INVITATION_KNOWN: 1 });

/** By the end of Episode 45: Founding Eve. The clause on Elodie's wrist is fading, and she heard a knock from the other side. */
export const AFTER_EP45 = Object.freeze({ ...AFTER_EP44, EP45_DONE: 1, CLAUSE_FADING: 1, KNOCK_HEARD: 1 });

/** By the end of Episode 46: Hesper took Elodie again; the Chancellor's Lances tried to take the Archive and Halvard stopped them; Elodie
 *  wrote her name on the lock and it turned from the other side; the Gate is open in the sky over the Crown Ward. */
export const AFTER_EP46 = Object.freeze({ ...AFTER_EP45, EP46_DONE: 1, ELODIE_TAKEN_AGAIN: 1, LOCK_TURNED: 1, GATE_OPEN: 1 });
