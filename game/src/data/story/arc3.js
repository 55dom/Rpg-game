// What earlier chapters leave behind, for an Arc 3 episode started straight from the menu. An episode's
// `setup` only fills in flags a save doesn't already have, so a real play-through is never overwritten.

/** Arcs 1–2 (Arc 2 isn't written yet, so Arc 3 opens as its own chapter after Episode 4). */
export const ARC3_BASE = Object.freeze({ CAL_STATE: 1, LANTERN_LIT: 1, HAS_BRASS_KEY: 1, ARC2_DONE: 1, HEARD_S2: 1 });

/** By the end of Episode 22: the Iron Front, and Brannoc gone. */
export const AFTER_EP22 = Object.freeze({ ...ARC3_BASE, HAS_SUMMONS: 1, EP19_DONE: 1, EP20_DONE: 1, EP21_DONE: 1, EP22_DONE: 1, BRANNOC_DEAD: 1 });

/** By the end of Episode 23: the notebook is found (Juno keeps it unless she has shared it), Wraithe has been seen. */
export const AFTER_EP23 = Object.freeze({ ...AFTER_EP22, EP23_DONE: 1, NOTEBOOK_FOUND: 1, JUNO_HAS_NOTEBOOK: 1, WRAITHE_SEEN: 1 });

/** By the end of Episode 24: the Cindermaw fell out of the sky, and the camp told its theories. */
export const AFTER_EP24 = Object.freeze({ ...AFTER_EP23, EP24_DONE: 1, CLUE_B1: 1, SABLE_ENCOUNTER: 1, CINDERMAW_DOWN: 1,
  RUMOR_DEFECTOR: 1, RUMOR_ASHFALL: 1, RUMOR_HOLLOW: 1, RUMOR_PARAGON: 1 });

/** By the end of Episode 25: Lio's secret is out (forgiven, unless a save says he was sent away). */
export const AFTER_EP25 = Object.freeze({ ...AFTER_EP24, EP25_DONE: 1, LIO_SECRET: 1, LIO_STATUS: 2, HAS_VAULT_ORDERS: 1 });

/** By the end of Episode 26: the vault was opened and robbed, Bas's arm is broken, and the Crown has posted a bounty. */
export const AFTER_EP26 = Object.freeze({ ...AFTER_EP25, EP26_DONE: 1, SABLE_ENCOUNTER: 2, SABLE_NAMED: 1, VAULT_BREACHED: 1, VAULT_TAKEN: 1,
  BAS_ARM_BROKEN: 1, CLUE_B2: 1, CLUE_B3: 1, RUMOR_CROWN: 1 });

/** By the end of Episode 27: Elodie met, Lio home again, and Severin has read the page. */
export const AFTER_EP27 = Object.freeze({ ...AFTER_EP26, EP27_DONE: 1, ELODIE_MET: 1, SEVERIN_PAGE: 1, LIO_STATUS: 2 });
