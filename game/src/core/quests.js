// Side quests (GDD §18) as data driven by story flags. A quest is a list of stages; each stage
// completes when its condition holds. State lives in the FlagStore (Q_<ID>: 0 = not started,
// 1..n = on stage n, DONE = finished), so quests save with everything else for free.

import { compileExpr, truthy } from "./flags.js";

export const DONE = 999;

/** Reputation and merit (GDD §12.2, §12.3): plain flags with these names. */
export const REP = Object.freeze({ squad: "REP_SQUAD", aurelin: "RENOWN_AURELIN", fens: "RENOWN_FENS", merit: "MERIT" });

/** The Lanterns' place in the Crown's Merit ranking (seven squads; they start last). */
export function squadRank(merit) {
  const ladder = [0, 30, 70, 120, 180, 250, 330]; // merit needed to pass each squad above
  let place = 7;
  for (let i = 1; i < ladder.length; i++) if (merit >= ladder[i]) place = 7 - i;
  return { place, next: ladder[8 - place] ?? null };
}

export function validateQuests(quests) {
  for (const [id, q] of Object.entries(quests)) {
    if (!q.title || !q.stages?.length) throw new Error(`quest ${id}: needs a title and stages`);
    if (q.available) compileExpr(q.available);
    for (const s of q.stages) { if (!s.text) throw new Error(`quest ${id}: a stage without text`); compileExpr(s.done); }
  }
  return quests;
}

export class QuestLog {
  /** @param {object} quests data/quests.js QUESTS @param {import("./flags.js").FlagStore} flags @param {(q, reward) => void} onReward */
  constructor(quests, flags, { onReward = null, onEvent = null } = {}) {
    this.quests = validateQuests(quests);
    this.flags = flags;
    this.onReward = onReward;
    this.onEvent = onEvent; // ({ type: "questStart" | "questStage" | "questDone", quest, stage })
    this.compiled = Object.fromEntries(Object.entries(quests).map(([id, q]) => [id, { available: q.available ? compileExpr(q.available) : null, stages: q.stages.map((s) => compileExpr(s.done)) }]));
  }

  key(id) { return `Q_${id.toUpperCase()}`; }
  state(id) { return Number(this.flags.get(this.key(id))) || 0; }
  isActive(id) { const s = this.state(id); return s > 0 && s < DONE; }
  isDone(id) { return this.state(id) === DONE; }
  canStart(id) { const c = this.compiled[id]; return !!c && this.state(id) === 0 && (!c.available || truthy(c.available(this.flags))); }

  start(id) {
    if (!this.canStart(id)) return false;
    this.flags.set(this.key(id), 1);
    this.onEvent?.({ type: "questStart", quest: this.quests[id], id });
    this.update();
    return true;
  }

  /** Advance every active quest whose current stage is satisfied (several in a row if they already are). */
  update() {
    for (const id of Object.keys(this.quests)) {
      for (let guard = 0; guard < 20 && this.isActive(id); guard++) {
        const n = this.state(id);
        if (!truthy(this.compiled[id].stages[n - 1](this.flags))) break;
        if (n >= this.quests[id].stages.length) this._complete(id);
        else { this.flags.set(this.key(id), n + 1); this.onEvent?.({ type: "questStage", quest: this.quests[id], id, stage: this.quests[id].stages[n] }); }
      }
    }
  }

  _complete(id) {
    const q = this.quests[id];
    this.flags.set(this.key(id), DONE);
    for (const [flag, n] of Object.entries(q.reward?.flags ?? {})) this.flags.add(flag, n);
    this.onReward?.(q, q.reward ?? {});
    this.onEvent?.({ type: "questDone", quest: q, id });
  }

  /** For the journal: active quests with their current objective, then finished ones. */
  entries() {
    const out = [];
    for (const [id, q] of Object.entries(this.quests)) {
      const s = this.state(id);
      if (s === 0) continue;
      out.push({ id, title: q.title, giver: q.giver, region: q.region, done: s === DONE, objective: s === DONE ? q.summary ?? "Done." : q.stages[s - 1].text });
    }
    return out.sort((a, b) => a.done - b.done);
  }
}
