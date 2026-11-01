// What Arcs 1–2 leave behind, episode by episode (Phase 8), for an episode started straight from the menu (like
// arc3.js–arc5.js). Arc 3's own base (arc3.js ARC3_BASE: CAL_STATE, LANTERN_LIT, HAS_BRASS_KEY, ARC2_DONE, HEARD_S2) is
// what the end of Arc 2 has to add up to.

/** By the end of Episode 4: the Tower, the exam, the Lighthouse, the Fens. */
export const AFTER_EP4 = Object.freeze({ MET_MOSS: 1, JOINED_LANTERNS: 1, HEARD_S2: 1, LIO_SAW_GRIMOIRE: 1, NEW_LINES_SEEN: 1, MIRREN_SAVED: 1, EP4_DONE: 1 });

/** By the end of Episode 5: Thornwick's mill; Juno's threads; a red cord on every Lantern's wrist (S6). */
export const AFTER_EP5 = Object.freeze({ ...AFTER_EP4, EP5_DONE: 1, JUNO_RESPECT: 1, QUILL_CORD: 1, CLUE_S6: 1 });

/** By the end of Episode 6: the Silence Sermon; Deacon Ilse (B3); Hesper's voice in the reeds. */
export const AFTER_EP6 = Object.freeze({ ...AFTER_EP5, EP6_DONE: 1, HYMN_READ: 1, ILSE_DEFEATED: 1, HESPER_VISION: "small", CLUE_D3: 1 });

/** By the end of Episode 7: festival prep; the brass key (S7); "Somebody showed me a door once."; Lio at night. */
export const AFTER_EP7 = Object.freeze({ ...AFTER_EP6, EP7_DONE: 1, HAS_BRASS_KEY: 1, CLUE_S7: 1, CLUE_D11: 1, CLUE_D2: 1, LIO_READ_NIGHT: 1 });

/** By the end of Episode 8 (the end of Arc 1): Galen risen and laid down (B4); the page bleeds ink; Lio's silence. */
export const AFTER_EP8 = Object.freeze({ ...AFTER_EP7, EP8_DONE: 1, GALEN_DEFEATED: 1, INK_BLED: 1, CLUE_D5: 1, CLUE_D6: 1, ARC1_DONE: 1 });

// ---- Arc 2 · The Lantern That Went Out ----
/** By the end of Episode 9: the Festival; up a rank; Juno's stall (S6's alibi); a girl in a doorway; Aurek's pendant. */
export const AFTER_EP9 = Object.freeze({ ...AFTER_EP8, EP9_DONE: 1, RANK_UP: 1, JUNO_STALL: 1, ELODIE_GLIMPSE: 1, SEVERIN_THANKED: 1, AUREK_PENDANT: 1 });

/** By the end of Episode 10: the Hall of Lanterns; the wick that turns to ash; a lantern with your name, lit. */
export const AFTER_EP10 = Object.freeze({ ...AFTER_EP9, EP10_DONE: 1, LANTERN_LIT: 1, HALL_LANTERN: 1 });

/** By the end of Episode 11: under the festival with Severin; the shoe, the hymn scrap, the sentinel; voices below. */
export const AFTER_EP11 = Object.freeze({ ...AFTER_EP10, EP11_DONE: 1, SEVERIN_ALLY: "together" });

/** By the end of Episode 12: the Drowned Cistern; Gullmaw (B5); seven children up the stairs; Severin in front. */
export const AFTER_EP12 = Object.freeze({ ...AFTER_EP11, EP12_DONE: 1, GULLMAW_DEFEATED: 1, SEVERIN_RESPECT: "shield", CHOIR_CISTERN: 1 });

/** By the end of Episode 13: the Chancellor's garden; the offer refused; thieves after the book. */
export const AFTER_EP13 = Object.freeze({ ...AFTER_EP12, EP13_DONE: 1, ALDRIC_OFFER: "refused", VALCOURT_HOSTILE: 1 });

/** By the end of Episode 14: rats in the cake case; Tamsin sang; the squad sang with her; up the Merit roll. */
export const AFTER_EP14 = Object.freeze({ ...AFTER_EP13, EP14_DONE: 1, TAMSIN_SANG: 1, SANG_WITH_TAMSIN: "rook", MERIT_CLIMB: 1 });

/** By the end of Episode 15: "Spear-wall, three lines deep" (D7); the Cantor Twins (B6); the Choir's target, the Gate. */
export const AFTER_EP15 = Object.freeze({ ...AFTER_EP14, EP15_DONE: 1, CLUE_D7: 1, TWINS_DEFEATED: 1, CHOIR_TARGET: "gate" });

/** By the end of Episode 16: the night before the march; "nobody had names" (D10); "keep the key". */
export const AFTER_EP16 = Object.freeze({ ...AFTER_EP15, EP16_DONE: 1, CLUE_D10: 1, KEEP_KEY: "keep" });

/** By the end of Episode 17: into the Hollowmarch; the key warm (A3); "Rest, soldier." (D8); the Bloom begun; split up. */
export const AFTER_EP17 = Object.freeze({ ...AFTER_EP16, EP17_DONE: 1, CLUE_A3: 1, CLUE_D8: 1, SQUAD_SPLIT: 1 });

/** By the end of Episode 18 (the end of Arc 2): the Hollow Bloom (B7); "I'll hold the door. Don't wait up."; no residue (A1); his lantern dark. */
export const AFTER_EP18 = Object.freeze({ ...AFTER_EP17, EP18_DONE: 1, BLOOM_FOUGHT: 1, CLUE_A1: 1, CAL_STATE: 1, ARC2_DONE: 1 });
