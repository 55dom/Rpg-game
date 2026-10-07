// Bond rules (GDD §11) over the story's FlagStore: points, ranks, gates, gifts and passives.
// All state is flags, so bonds save, load and migrate with the rest of the story.

import { BONDS, RANK_POINTS, RANK_TITLES, GATES, BOND_GAIN, GIFTS } from "../data/bonds.js";

const K = (id) => id.toUpperCase();

export class Bonds {
  /** @param flags a FlagStore (get/set) */
  constructor(flags) { this.flags = flags; }

  points(id) { return Number(this.flags.get(`BOND_${K(id)}`)) || 0; }
  seen(id, rank) { return !!this.flags.get(`BOND_EV_${K(id)}_${rank}`); }

  /** Rank 1–10 from points. */
  rank(id) {
    const p = this.points(id);
    let r = 1;
    for (let i = 1; i < RANK_POINTS.length; i++) if (p >= RANK_POINTS[i]) r = i + 1;
    return r;
  }
  title(id) { return RANK_TITLES[this.rank(id) - 1]; }

  /** The first gate rank whose event hasn't been seen: the bond can't grow past it. */
  gate(id) { return GATES.find((g) => !this.seen(id, g)) ?? null; }
  /** Highest points allowed right now. */
  cap(id) { const g = this.gate(id); return g == null || g >= RANK_POINTS.length ? Infinity : RANK_POINTS[g] - 1; }

  /** The bond event waiting at the gate (if it's reached and written), or null. */
  eventReady(id) {
    const g = this.gate(id), b = BONDS[id];
    return b && g != null && this.rank(id) >= g && b.events?.[g] ? b.events[g] : null;
  }
  /** Reached a gate whose scene isn't written yet: the story continues in a later chapter. */
  waiting(id) { const g = this.gate(id); return g != null && this.rank(id) >= g && !BONDS[id]?.events?.[g]; }

  /** Add points (never past the gate). Returns { gained, rankUp, rank }. */
  add(id, n) {
    if (!BONDS[id] || !n) return { gained: 0, rankUp: false, rank: this.rank(id) };
    const before = this.rank(id), p = this.points(id);
    const next = Math.min(this.cap(id), p + n);
    this.flags.set(`BOND_${K(id)}`, Math.max(p, next));
    const rank = this.rank(id);
    return { gained: Math.max(0, next - p), rankUp: rank > before, rank };
  }

  /** First chat of the day with someone. Returns the gain result, or null if already talked today. */
  talk(id, day) {
    if (!BONDS[id] || Number(this.flags.get(`BOND_TALKDAY_${K(id)}`)) === day) return null;
    this.flags.set(`BOND_TALKDAY_${K(id)}`, day);
    return this.add(id, BOND_GAIN.talk);
  }

  /** How someone feels about a gift: 3 loved, 2 liked, 1 fine, 0 disliked. */
  reaction(id, gift) { return BONDS[id]?.likes?.[gift] ?? 1; }
  lovedGift(id) { return Object.entries(BONDS[id]?.likes ?? {}).find(([, v]) => v === 3)?.[0] ?? null; }

  /** Give a gift (one per person per day). Returns { react: -1 (already today) | 0..3, gained }. */
  give(id, gift, day) {
    if (!BONDS[id] || !GIFTS[gift]) return { react: -2, gained: 0 };
    if ((Number(this.flags.get(`GIFT_${K(gift)}`)) || 0) <= 0) return { react: -2, gained: 0 };
    if (Number(this.flags.get(`BOND_GIFTDAY_${K(id)}`)) === day) return { react: -1, gained: 0 };
    this.flags.set(`BOND_GIFTDAY_${K(id)}`, day);
    this.flags.set(`GIFT_${K(gift)}`, (Number(this.flags.get(`GIFT_${K(gift)}`)) || 0) - 1);
    this.flags.set("GIFTS_OWNED", Math.max(0, (Number(this.flags.get("GIFTS_OWNED")) || 0) - 1));
    const react = this.reaction(id, gift);
    return { react, ...this.add(id, BOND_GAIN.gift[react]) };
  }

  /** Passive stat mods from rank 3 bonds. Party-only passives need that companion in the fight. */
  mods(party = []) {
    const m = {};
    for (const [id, b] of Object.entries(BONDS)) {
      if (!b.passive || this.rank(id) < 3) continue;
      if (b.passive.party && !party.includes(id)) continue;
      for (const [k, v] of Object.entries(b.passive.mods)) m[k] = (m[k] ?? 0) + v;
    }
    return m;
  }

  /** Companions with a Team Attack unlocked (rank 5). */
  teamAttacks() { return Object.keys(BONDS).filter((id) => BONDS[id].team && this.rank(id) >= 5); }
}
