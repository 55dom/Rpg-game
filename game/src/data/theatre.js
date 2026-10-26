// Lore Archive · Theatre (GDD §15.10): every timeline scene you've watched, replayable with pause, slow motion
// and frame-step. What's been watched is kept per browser (it's an archive of the game, not of one save).
//
// The Annotated Edition: margin notes in Rook's hand at a few moments of a scene. It opens only once you've
// rewatched that scene yourself, and only after the story has given its answers (§15.4 rule 5: nothing is ever
// pointed at before then). The notes say what Rook saw, never what it meant.

import { compileExpr, truthy } from "../core/flags.js";

/** The scenes, in story order. */
export const THEATRE = Object.freeze([
  { id: "ep1_larkspur", title: "Larkspur Burning", episode: 1 },
  { id: "ep24_tear", title: "The Cindermaw Falls", episode: 24 },
  { id: "ep26_arm", title: "Reliquary Seven", episode: 26 },
  { id: "ep28_lake", title: "Under the Lake", episode: 28 },
  { id: "ep28_crypt", title: "The Valcourt Crypt", episode: 28 },
  { id: "ep31_step", title: "The Poor Quarter", episode: 31 },
  { id: "ep34_brother", title: "The Convoy", episode: 34 },
]);

/** When the Annotated Edition opens (and the notes it carries). */
export const ANNOTATED = Object.freeze({
  opens: "$CAL_IDENTITY_REVEALED",
  notes: Object.freeze({
    ep1_larkspur: [{ t: 9, text: "Someone walked out of that fire carrying something. Nobody else did." }],
    ep24_tear: [{ t: 8.4, text: "Not a tear in front of it. Under it." }, { t: 17, text: "He'd been standing there the whole time." }],
    ep26_arm: [{ t: 11.8, text: "He listened before he left. Like he was waiting for me to finish." }],
    ep28_crypt: [{ t: 9.5, text: "A flower. Somebody here is missed." }],
    ep31_step: [{ t: 13.6, text: "He set the boy down like he'd done it a hundred times." }],
  }),
});

const KEY = "unwritten.theatre";
let memory = {};
const load = () => { try { return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "null") ?? memory; } catch { return memory; } };
const save = (v) => { memory = v; try { globalThis.localStorage?.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: this visit only */ } };

/** Record a scene as seen (first time through) or rewatched (in the Theatre). */
export function theatreMark(id, how) {
  const all = load(), e = all[id] ?? { seen: 0, rewatched: 0 };
  if (how === "seen") e.seen = 1; else e.rewatched += 1;
  all[id] = e; save(all);
  return e;
}

/** The archive as the menu shows it: every scene, watched or not (unwatched ones stay locked). */
export const theatreList = () => { const all = load(); return THEATRE.map((s) => ({ ...s, seen: !!all[s.id]?.seen, rewatched: all[s.id]?.rewatched ?? 0 })); };

/** The notes for a replay: only in the Annotated Edition (a rewatch, after the story's answers). */
export function theatreNotes(id, flags) {
  const e = load()[id];
  if (!e || e.rewatched < 1 || !flags || !truthy(compileExpr(ANNOTATED.opens)(flags))) return [];
  return ANNOTATED.notes[id] ?? [];
}

/** For tests: forget everything. */
export const theatreReset = () => save({});
