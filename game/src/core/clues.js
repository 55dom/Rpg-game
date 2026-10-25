// The clue network (GDD §15.4–15.5, §15.10). Clues are plain story flags, CLUE_<id>, set by scripts when
// the player sees or hears something. This module only knows clue ids and which track they belong to: no
// descriptions, no answers. What a clue *means* lives in the design document, never in the build (§15.11).
//
// The investigation score is derived from the flags each time it's asked for and is never stored.

/** Clue ids by track. A: early grief-arc doubts. B: rare links between two mysteries. S, D: character texture. */
export const CLUE_TRACKS = Object.freeze({
  A: Object.freeze(["A1", "A2", "A3", "A4", "A5"]),
  B: Object.freeze(["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"]),
  S: Object.freeze(["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]),
  D: Object.freeze(["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12"]),
});

export const clueFlag = (id) => `CLUE_${id}`;
const trackOf = (id) => Object.keys(CLUE_TRACKS).find((t) => CLUE_TRACKS[t].includes(id)) ?? null;

/** Has the player found this clue? */
export const found = (flags, id) => !!flags.get(clueFlag(id));

/** Mark a clue found (scripts usually do this with <<set $CLUE_A1 to 1>>). Unknown ids are refused. */
export function markClue(flags, id) {
  if (!trackOf(id)) throw new Error(`unknown clue ${id}`);
  flags.set(clueFlag(id), 1);
}

/** Clues found on one track. */
export const foundOn = (flags, track) => CLUE_TRACKS[track].filter((id) => found(flags, id));

/**
 * The investigation score (§15.10): Track A clues plus link clues found. Computed, never saved, so it can't
 * leak through a save file and never drifts from the flags.
 */
export const investigationScore = (flags) => foundOn(flags, "A").length + foundOn(flags, "B").length;
