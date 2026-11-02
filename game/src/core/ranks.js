// Knight Rank and its promotion exams (GDD §17; the ranks themselves are data/ranks.js), and where the story is, for
// power gating (data/skills.js bracketOf). No DOM: story.js runs the exam, this keeps the rules.

import { compileExpr, truthy } from "./flags.js";
import { KNIGHT_RANKS, RANK_FLAG, rankOf } from "../data/ranks.js";
import { bracketOf } from "../data/skills.js";

/** The last episode finished (EP<n>_DONE), 0 before the first. */
export function storyEpisode(flags) {
  for (let n = 70; n > 0; n--) if (flags.get(`EP${n}_DONE`)) return n;
  return 0;
}
/** The level the story expects of you now (the bracket of the last episode finished). */
export const storyBracket = (flags) => bracketOf(storyEpisode(flags));

export class Ranks {
  constructor(flags) { this.flags = flags; this.trial = null; }

  get rank() { return rankOf(this.flags); }
  get name() { return KNIGHT_RANKS[this.rank].name; }
  /** The next rank's record, or null at Sun. */
  get next() { return KNIGHT_RANKS[this.rank + 1] ?? null; }

  /** Can Rook sit the next exam? { ok, why } (why: "story" | "level" | "top"). */
  eligible(level) {
    const n = this.next;
    if (!n) return { ok: false, why: "top" };
    if (!truthy(compileExpr(n.after)(this.flags))) return { ok: false, why: "story", rank: n };
    if (level < n.level) return { ok: false, why: "level", rank: n };
    return { ok: true, why: null, rank: n };
  }

  /** The ring: start counting toward the trial's goal. */
  startTrial() {
    const n = this.next;
    if (!n) return null;
    this.trial = { rank: this.rank + 1, goal: n.trial.goal, n: n.trial.n, got: 0, t: 0 };
    return this.trial;
  }

  /** A world event during the trial (perfect dodges, parries, guard breaks, blows landing on you). */
  event(ev, player) {
    const t = this.trial;
    if (!t) return;
    if (t.goal === "evade" && (ev.type === "perfectDodge" || ev.type === "parry") && ev.defender === player) t.got++;
    else if (t.goal === "break" && ev.type === "postureBreak" && ev.defender !== player && ev.defender?.team !== player.team) t.got++;
    else if (t.goal === "clean" && ev.type === "hit" && ev.defender === player) t.got++;
  }

  tick(dt) { if (this.trial) { this.trial.t += dt; if (this.trial.goal === "fast") this.trial.got = Math.floor(this.trial.t); } }

  /** How the trial stands right now: met (so far) or not. */
  met(t = this.trial) {
    if (!t) return false;
    if (t.goal === "clean") return t.got <= t.n;
    if (t.goal === "fast") return t.t <= t.n;
    return t.got >= t.n;
  }

  /** The fight's over. Won and the goal met: promoted (returns the new rank's record). Otherwise null. */
  finishTrial(won) {
    const t = this.trial;
    this.trial = null;
    if (!t || !won || !this.met(t)) return { promoted: null, trial: t };
    this.flags.set(RANK_FLAG, t.rank);
    this.flags.set("EXAM_READY", 0);
    return { promoted: KNIGHT_RANKS[t.rank], trial: t };
  }
}
