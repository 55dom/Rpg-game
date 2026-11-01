// Secret pages (GDD §8.4) over the story's FlagStore: which are found, which two are pinned in the margin (§8.1),
// and the hidden conditions as they're met. All state is flags, so it saves, loads and replays with the rest.
//
//   SECRET_<…>        found (data/secretPages.js `flag`)
//   MARGIN_1/2        the pages pinned (ids), the passives a fight reads
//   HALL_NIGHTS, HALL_NIGHT_DAY   Lantern's Answer: nights in the Hall of Lanterns after the Bloom (one a day)
//   JUROR_PARRIES     Juror's Thread: parries with Juno beside you
//   MOSS_TEA, MOSS_TEA_DAY        Second Reading: tea for Brother Moss (one a day)
//   MURALS            Star Chart: constellation murals found (MURAL_<n> each)

import { SECRET_PAGES, MARGIN_SLOTS, SECRET_NEEDS } from "../data/secretPages.js";

export class Secrets {
  /** @param flags a FlagStore (get/set) */
  constructor(flags) { this.flags = flags; }

  found(id) { return !!SECRET_PAGES[id] && !!this.flags.get(SECRET_PAGES[id].flag); }
  get all() { return Object.keys(SECRET_PAGES).filter((id) => this.found(id)); }

  /** Found now (true), or already (false). */
  find(id) {
    if (!SECRET_PAGES[id] || this.found(id)) return false;
    this.flags.set(SECRET_PAGES[id].flag, 1);
    if (this.margin.length < MARGIN_SLOTS) this.pin(id); // a free slot: it goes straight in
    return true;
  }

  /** The pinned pages, in slot order (only ones still found). */
  get margin() {
    const out = [];
    for (let i = 1; i <= MARGIN_SLOTS; i++) { const id = this.flags.get(`MARGIN_${i}`); if (id && this.found(id) && !out.includes(id)) out.push(id); }
    return out;
  }
  pinned(id) { return this.margin.includes(id); }
  /** Pin into the first free slot; with both full, into the last. */
  pin(id) {
    if (!this.found(id) || this.pinned(id)) return false;
    let slot = 1;
    while (slot < MARGIN_SLOTS && this.found(this.flags.get(`MARGIN_${slot}`))) slot++;
    this.flags.set(`MARGIN_${slot}`, id);
    return true;
  }
  unpin(id) {
    for (let i = 1; i <= MARGIN_SLOTS; i++) if (this.flags.get(`MARGIN_${i}`) === id) this.flags.set(`MARGIN_${i}`, 0);
  }
  toggle(id) { if (this.pinned(id)) { this.unpin(id); return false; } return this.pin(id); }

  // ---- the hidden conditions; each returns the id it found, or null ----
  /** In the Hall of Lanterns: at night, after the Bloom, one count a day. Three nights: Lantern's Answer. */
  hallVisit(day, night) {
    if (!night || !this.flags.get("EP18_DONE") || Number(this.flags.get("HALL_NIGHT_DAY")) === day) return null;
    this.flags.set("HALL_NIGHT_DAY", day);
    const n = (Number(this.flags.get("HALL_NIGHTS")) || 0) + 1;
    this.flags.set("HALL_NIGHTS", n);
    return n >= SECRET_NEEDS.hallNights && this.find("lanternsAnswer") ? "lanternsAnswer" : null;
  }
  /** A parry with Juno beside you. A hundred: Juror's Thread. */
  parry(withJuno) {
    if (!withJuno || this.found("jurorsThread")) return null;
    const n = (Number(this.flags.get("JUROR_PARRIES")) || 0) + 1;
    this.flags.set("JUROR_PARRIES", n);
    return n >= SECRET_NEEDS.jurorParries && this.find("jurorsThread") ? "jurorsThread" : null;
  }
  /** Tea for Brother Moss (one a day, from the bag). Returns 2 (the seventh: Second Reading), 1 (given), 0 (none to give), -1 (already today). */
  mossTea(day) {
    if ((Number(this.flags.get("GIFT_TEA")) || 0) <= 0) return 0;
    if (Number(this.flags.get("MOSS_TEA_DAY")) === day) return -1;
    this.flags.set("MOSS_TEA_DAY", day);
    this.flags.set("GIFT_TEA", Number(this.flags.get("GIFT_TEA")) - 1);
    this.flags.set("GIFTS_OWNED", Math.max(0, (Number(this.flags.get("GIFTS_OWNED")) || 0) - 1));
    const n = (Number(this.flags.get("MOSS_TEA")) || 0) + 1;
    this.flags.set("MOSS_TEA", n);
    return n >= SECRET_NEEDS.mossTea && this.find("secondReading") ? 2 : 1;
  }
  /** Hask down: clean (its mud never touched you) finds Weight of Nothing. */
  haskDown(clean) { return clean && this.find("weightOfNothing") ? "weightOfNothing" : null; }
  /** A mural found (its MURAL_<n> flag is set by the pickup). All twelve: Star Chart. */
  mural() {
    const n = (Number(this.flags.get("MURALS")) || 0) + 1;
    this.flags.set("MURALS", n);
    return n >= SECRET_NEEDS.murals && this.find("starChart") ? "starChart" : null;
  }
}
