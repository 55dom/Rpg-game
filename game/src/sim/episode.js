// Episode flow (GDD §18.3, §21.3 EpisodeData): an episode is an ordered list of beats
// (title card, dialogue scene, fight, exploration, preview). The director is pure logic: it says
// which beat is current, skips beats whose condition fails, applies a beat's flag writes when it
// completes, and reports where it is so the game can autosave at every beat (GDD §21.6).

import { compileExpr, truthy } from "../core/flags.js";

export const BeatType = Object.freeze({
  Title: "title", Scene: "scene", Fight: "fight", Explore: "explore", Preview: "preview", ColdOpen: "coldopen", Cutscene: "cutscene",
});

export function validateEpisode(ep, nodes = null) {
  if (!ep?.id || !Array.isArray(ep.beats) || !ep.beats.length) throw new Error("episode needs an id and beats");
  const ids = new Set();
  for (const b of ep.beats) {
    if (!b.id || ids.has(b.id)) throw new Error(`${ep.id}: beat ids must be unique (${b.id})`);
    ids.add(b.id);
    if (!Object.values(BeatType).includes(b.type)) throw new Error(`${ep.id}/${b.id}: unknown beat type ${b.type}`);
    if (b.if) compileExpr(b.if);
    for (const key of ["set", "setWin", "setLose"]) if (b[key] != null && (typeof b[key] !== "object" || Array.isArray(b[key]))) throw new Error(`${ep.id}/${b.id}: ${key} must be { FLAG: value }`);
    if (nodes) for (const key of ["node", "winNode", "loseNode"]) if (b[key] && !nodes[b[key]]) throw new Error(`${ep.id}/${b.id}: no dialogue node ${b[key]}`);
    if (b.type === BeatType.Fight && !Array.isArray(b.wave)) throw new Error(`${ep.id}/${b.id}: fight needs a wave`);
  }
  return ep;
}

export class EpisodeDirector {
  /** @param {object} episode @param {import("../core/flags.js").FlagStore} flags */
  constructor(episode, flags, { onBeat = null } = {}) {
    this.episode = validateEpisode(episode);
    this.flags = flags;
    this.onBeat = onBeat; // (beat, index) => void, called each time a beat becomes current
    this.index = -1;
    this.done = false;
  }

  get beat() { return this.done || this.index < 0 ? null : this.episode.beats[this.index]; }

  /** Begin at a beat index (0 for a new episode, or a saved index). */
  start(index = 0) {
    this.done = false;
    this.index = index - 1;
    return this._advance();
  }

  /**
   * Finish the current beat. result: { won?: boolean } for fights. Applies the beat's `set`
   * (always), `setWin` / `setLose` (fights), then moves on.
   */
  complete(result = {}) {
    const b = this.beat;
    if (!b) return null;
    for (const [k, v] of Object.entries(b.set ?? {})) this.flags.set(k, v);
    if (b.type === BeatType.Fight) {
      const writes = result.won ? b.setWin : b.setLose;
      for (const [k, v] of Object.entries(writes ?? {})) this.flags.set(k, v);
    }
    return this._advance();
  }

  _advance() {
    const beats = this.episode.beats;
    for (let i = this.index + 1; i < beats.length; i++) {
      const b = beats[i];
      if (b.if && !truthy(compileExpr(b.if)(this.flags))) continue;
      this.index = i;
      this.onBeat?.(b, i);
      return b;
    }
    this.index = beats.length;
    this.done = true;
    this.flags.set(`${this.episode.id.toUpperCase()}_DONE`, 1);
    return null;
  }

  /** Where to resume after a reload: the current beat, from its start. */
  get resumePoint() { return { episode: this.episode.id, beat: Math.max(0, this.index) }; }
}
