// The Journal's rumor board (GDD §15.6, red herring 3): what people say about the masked knight, collected
// as you hear it. Every theory on it is somebody's honest wrong answer. The board only ever records what
// Rook has seen and heard; it never knows more than that (GDD §15.11).
//
// Later chapters add to it: the Crown's bounty posters give him a name (Encounter II, Ep 26), and Severin's
// theory about his brother Aurek joins the board at the end of Arc 3.

import { compileExpr, truthy } from "../core/flags.js";

export const RUMOR_BOARD = Object.freeze({
  show: "$SABLE_ENCOUNTER >= 1",
  titles: Object.freeze([
    { when: "$SABLE_NAMED", text: "WHO IS THE SABLE KNIGHT?" },
    { text: "WHO IS THE MASKED KNIGHT?" },
  ]),
  /** What Rook has seen of him, one line per encounter. */
  seen: Object.freeze([
    { when: "$SABLE_ENCOUNTER >= 1", text: "Ironhold, the gate field: a black tear opened under the Cindermaw, and it fell out of the sky onto the Ashfall camp. A masked figure with a long glaive watched from the east ridge, then walked away." },
    { when: "$SABLE_ENCOUNTER >= 2", text: "The vault beneath Ironhold: he stepped out of the wall, cut the Crown's door open, and fought the whole squad. He broke Bas's arm, took a sealed reliquary, and let you live. He spoke twice." },
    { when: "$SABLE_NAMED", text: "Aurelin: the Crown's bounty is on every notice board. Five thousand Marks for the Sable Knight." },
  ]),
  /** Theories, in the order they can be heard (the flag is set by whoever says it). */
  rumors: Object.freeze([
    { flag: "RUMOR_DEFECTOR", theory: "A Choir defector", who: "an Iron Warden",
      text: "\"Same trick as that Choir creature at the vigil, different color. He learned it in the same school.\"" },
    { flag: "RUMOR_ASHFALL", theory: "An Ashfall war hero", who: "a Warden scout",
      text: "\"Varka had a champion in black at Coldwater who walked out on her. Maybe he's back, finishing the war his own way.\"" },
    { flag: "RUMOR_HOLLOW", theory: "A Hollow thing wearing a man's armor", who: "Tamsin",
      text: "\"Nothing alive cuts a hole in the world. And the Hollowmarch is full of armor with nobody inside it.\"" },
    { flag: "RUMOR_PARAGON", theory: "The Paragon's secret executioner", who: "Dagrun",
      text: "\"The Paragon keeps one knight off the rolls. No squad, no lantern, no name.\"" },
    { flag: "RUMOR_AUREK", theory: "Aurek Valcourt, Severin's brother", who: "Severin",
      text: "\"Father's guards saw him leave our family's crypt. He'd left a flower on my brother's grave.\"" },
    { flag: "RUMOR_CROWN", theory: "One of the Crown's own", who: "a townsperson at the notice board",
      text: "\"He walked through the vault's wards like he'd been taught them. You don't learn that outside the Crown.\"" },
  ]),
});

const holds = (flags, cond) => truthy(compileExpr(cond)(flags));

/** What the board shows for these flags: { show, title, seen: [text], rumors: [{ theory, text, who }] }. */
export function rumorBoard(flags, board = RUMOR_BOARD) {
  if (!holds(flags, board.show)) return { show: false, title: "", seen: [], rumors: [] };
  return {
    show: true,
    title: board.titles.find((t) => !t.when || holds(flags, t.when)).text,
    seen: board.seen.filter((s) => holds(flags, s.when)).map((s) => s.text),
    rumors: board.rumors.filter((r) => flags.get(r.flag)).map(({ theory, text, who }) => ({ theory, text, who })),
  };
}
