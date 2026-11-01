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
 * Row: { id, name?: display name, when: tag already on the target, with: incoming tag or condition,
 *        consume?: remove `when` after firing, foes?: only on the player's enemies, effect }
 * effect (all optional): damage, posture, hitstop, radius (splash onto the target's side), launch, stagger,
 *   chain (a tag: jump to every fighter carrying it within `radius`, either side: Conduction),
 *   spread ({ length, width, frames }: fire carried along the hit's direction onto the target's side: Firestorm),
 *   slam (driven down at this speed: Meteor), breakPosture (Crush), burn (frames of SCORCHED: Wildfire),
 *   tag ([name, frames] put on every target: Flash Freeze's FROZEN), corrode (armour lost for the fight: Corrode),
 *   fling (thrown along the hit's line at this speed: Railgun).
 */
export function defineReactions(rows) {
  const ids = new Set();
  return Object.freeze(rows.map((r) => {
    if (!r.id || !r.when || !r.with) throw new Error("reaction needs id, when, and with");
    if (ids.has(r.id)) throw new Error(`duplicate reaction ${r.id}`);
    ids.add(r.id);
    const e = r.effect ?? {};
    for (const k of ["damage", "posture", "hitstop", "radius", "launch", "stagger", "slam", "burn", "corrode", "fling"]) {
      if ((e[k] ?? 0) < 0) throw new RangeError(`${r.id}: ${k} can't be negative`);
    }
    if (e.spread && !(e.spread.length > 0 && e.spread.width > 0 && e.spread.frames > 0)) throw new RangeError(`${r.id}: spread needs length, width, frames`);
    if (e.tag && !(e.tag[0] && e.tag[1] > 0)) throw new RangeError(`${r.id}: tag is [name, frames]`);
    return Object.freeze({ consume: true, name: r.id, ...r, effect: Object.freeze({ ...e }) });
  }));
}

/**
 * Which reactions fire when a target carrying `targetTags` is hit by something that brings
 * `incoming` (a Set of tags it applies plus conditions such as "burst", "gust", "airborne").
 * Each `when` tag can fire at most once per hit (first matching row wins). `allow(row)`: an extra filter
 * (the World uses it for rows that only fire on the player's enemies).
 */
export function matchReactions(table, targetTags, incoming, allow = null) {
  const out = [];
  const used = new Set();
  for (const row of table) {
    if (used.has(row.when) || !targetTags.has(row.when) || !incoming.has(row.with) || (allow && !allow(row))) continue;
    used.add(row.when);
    out.push(row);
  }
  return out;
}
