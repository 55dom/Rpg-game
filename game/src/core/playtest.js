// The playtest kit for the Phase 6 gate (GDD §15.5 note: 10–20% of testers suspect the right person before the
// reveal; 80%+ recall a clue on rewatch). Opt-in, and it stays in this browser unless the tester copies it out.
//   · Clue log: when each clue flag is first set (episode, beat, time into the session), and Theatre rewatches.
//   · End-of-arc survey: who the tester thinks the masked knight is, how sure they are, in their own words.
// Nothing here asks about a clue by name or describes one: the survey never points (§15.4 rule 4).

const KEY = "unwritten.playtest";
let memory = null;
const blank = () => ({ optIn: false, started: null, clues: [], rewatches: [], surveys: [] });
const load = () => { try { return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "null") ?? memory ?? blank(); } catch { return memory ?? blank(); } };
const save = (v) => { memory = v; try { globalThis.localStorage?.setItem(KEY, JSON.stringify(v)); } catch { /* this visit only */ } };

/** The end-of-arc survey's questions (Arc 3). Theories are the ones the game itself has put on the rumor board, plus open answers. */
export const SURVEYS = Object.freeze({
  arc3: Object.freeze({
    title: "WHO IS THE SABLE KNIGHT?",
    ask: "Who do you think the Sable Knight is?", howSure: "How sure are you?",
    intro: "Optional, and only for playtesting the mystery. Your answers stay in this browser unless you copy them out from the Journal.",
    guesses: ["Aurek Valcourt, Severin's brother", "A Choir defector", "An Ashfall war hero", "A Hollow thing wearing a man's armor",
      "The Paragon's secret executioner", "One of the Crown's own", "Someone we've already met", "Someone we haven't met yet", "No idea"],
    sure: ["A wild guess", "A hunch", "Pretty sure", "Certain"],
  }),
});

export class PlaytestLog {
  constructor(flags, { now = () => Date.now(), where = () => ({}) } = {}) {
    this.flags = flags; this.now = now; this.where = where;
    this.data = load();
    flags?.onChange?.((name, value, old) => {
      if (!this.data.optIn || !/^CLUE_/.test(name) || !value || old) return;
      this.record("clues", { clue: name.slice(5), ...this.where() });
    });
  }

  get optIn() { return this.data.optIn; }
  setOptIn(on) { this.data.optIn = !!on; if (on && !this.data.started) this.data.started = this.now(); save(this.data); }

  record(list, entry) {
    if (!this.data.optIn) return null;
    const e = { at: this.now() - (this.data.started ?? this.now()), ...entry };
    this.data[list].push(e); save(this.data);
    return e;
  }

  rewatch(id) { return this.record("rewatches", { scene: id }); }

  /** A finished survey. Clues found so far are attached, so a guess can be read against what the tester had seen. */
  survey(id, answers) {
    const found = Object.keys(this.flags?.snapshot?.() ?? {}).filter((k) => /^CLUE_/.test(k) && this.flags.get(k)).map((k) => k.slice(5));
    return this.record("surveys", { survey: id, ...answers, cluesFound: found });
  }

  /** The whole log, as text to paste into a report. */
  export() { return JSON.stringify({ game: "UNWRITTEN", build: "phase6", ...this.data }, null, 2); }

  clear() { this.data = { ...blank(), optIn: this.data.optIn, started: this.data.optIn ? this.now() : null }; save(this.data); }
}

export const playtestReset = () => save(blank());
