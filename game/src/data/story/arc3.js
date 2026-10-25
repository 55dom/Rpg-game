// What earlier chapters leave behind, for an Arc 3 episode started straight from the menu. An episode's
// `setup` only fills in flags a save doesn't already have, so a real play-through is never overwritten.

/** Arcs 1–2 (Arc 2 isn't written yet, so Arc 3 opens as its own chapter after Episode 4). */
export const ARC3_BASE = Object.freeze({ CAL_STATE: 1, LANTERN_LIT: 1, HAS_BRASS_KEY: 1, ARC2_DONE: 1 });

/** By the end of Episode 22: the Iron Front, and Brannoc gone. */
export const AFTER_EP22 = Object.freeze({ ...ARC3_BASE, HAS_SUMMONS: 1, EP19_DONE: 1, EP20_DONE: 1, EP21_DONE: 1, EP22_DONE: 1, BRANNOC_DEAD: 1 });

/** By the end of Episode 23: the notebook is found (Juno keeps it unless she has shared it), Wraithe has been seen. */
export const AFTER_EP23 = Object.freeze({ ...AFTER_EP22, EP23_DONE: 1, NOTEBOOK_FOUND: 1, JUNO_HAS_NOTEBOOK: 1, WRAITHE_SEEN: 1 });
