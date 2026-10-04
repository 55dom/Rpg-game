// Tags and Reactions (GDD §7.2). Hits put timed tags on targets; when a tagged target is hit
// by something matching a reaction row (another tag, or a condition like "burst" or "airborne"),
// the reaction fires. The table is data: new magic picks which tags it applies, no new combo code.

/** Timed tags on one fighter. */
export class TagSet {
  constructor() { this.frames = new Map(); }
  add(tag, frames) {
    if (!tag || frames <= 0) throw new RangeError("tag needs a name and a positive duration");
    this.frames.set(tag, Math.max(frames, this.frames.get(tag) ?? 0));
  }
  has(tag) { return this.frames.has(tag); }
  remaining(tag) { return this.frames.get(tag) ?? 0; }
  remove(tag) { this.frames.delete(tag); }
  clear() { this.frames.clear(); }
  get size() { return this.frames.size; }
  tick() {
    for (const [tag, f] of this.frames) {
      if (f <= 1) this.frames.delete(tag);
      else this.frames.set(tag, f - 1);
    }
  }
}

/**
 * Validate a reaction table.
 * Row: { id, when: tag already on the target, with: incoming tag or condition,
 *        consume?: remove `when` after firing, effect: { damage?, posture?, hitstop?, radius?, launch?, stagger? } }
 */
export function defineReactions(rows) {
  const ids = new Set();
  return Object.freeze(rows.map((r) => {
    if (!r.id || !r.when || !r.with) throw new Error("reaction needs id, when, and with");
    if (ids.has(r.id)) throw new Error(`duplicate reaction ${r.id}`);
    ids.add(r.id);
    const e = r.effect ?? {};
    for (const k of ["damage", "posture", "hitstop", "radius", "launch", "stagger"]) {
      if ((e[k] ?? 0) < 0) throw new RangeError(`${r.id}: ${k} can't be negative`);
    }
    return Object.freeze({ consume: true, ...r, effect: Object.freeze({ ...e }) });
  }));
}

/**
 * Which reactions fire when a target carrying `targetTags` is hit by something that brings
 * `incoming` (a Set of tags it applies plus conditions such as "burst", "gust", "airborne").
 * Each `when` tag can fire at most once per hit (first matching row wins).
 */
export function matchReactions(table, targetTags, incoming) {
  const out = [];
  const used = new Set();
  for (const row of table) {
    if (used.has(row.when) || !targetTags.has(row.when) || !incoming.has(row.with)) continue;
    used.add(row.when);
    out.push(row);
  }
  return out;
}
