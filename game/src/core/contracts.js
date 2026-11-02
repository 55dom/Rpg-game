// Squad Contracts (GDD §18.1; the data is data/contracts.js): today's offers on the squad board, the one you've taken,
// and the pay. No DOM. Offers are made from the day (a seeded roll), so they're the same all day and nothing about them
// is saved but which one you took and which you've done: CONTRACT_ACTIVE (1–3, 0 for none), CONTRACT_DAY (the day it
// was offered), CONTRACT_DONE_DAY / CONTRACT_DONE_MASK (today's finished offers), CONTRACTS_DONE (all told).

import { compileExpr, truthy } from "./flags.js";
import { CONTRACT_SITES, CONTRACT_TEMPLATES, FOE_NAMES, THINGS, OFFERS_PER_DAY } from "../data/contracts.js";
import { rankOf } from "../data/ranks.js";

/** A small seeded roll (mulberry32), so a day's board is the same however often you read it. */
function roll(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (w, k) => (k === "Client" ? cap(v.client) : v[k] ?? w));

/** Sites open to this save: the story has been there, and the rank allows the tier. */
export function openSites(flags) {
  const rank = rankOf(flags);
  return CONTRACT_SITES.filter((s) => s.tier <= rank + 1 && (!s.when || truthy(compileExpr(s.when)(flags))));
}

/** The day's offers: up to three, at different sites where there are enough of them. */
export function offersFor(day, flags) {
  const sites = openSites(flags);
  if (!sites.length) return [];
  const r = roll(day * 7919 + 17), pool = [...sites], out = [];
  for (let i = 0; i < OFFERS_PER_DAY; i++) {
    const site = pool.length ? pool.splice(Math.floor(r() * pool.length) % pool.length, 1)[0] : pick(r, sites);
    const kind = pick(r, site.kinds ?? Object.keys(CONTRACT_TEMPLATES)), T = CONTRACT_TEMPLATES[kind];
    const foe = pick(r, site.foes), other = pick(r, site.foes), n = T.size + Math.floor(site.tier / 2);
    const wave = Array.from({ length: n }, (_, k) => (k % 3 === 2 ? other : foe));
    const v = { spot: site.spot, short: site.short, client: pick(r, site.clients), foes: FOE_NAMES[foe] ?? foe, thing: pick(r, THINGS) };
    out.push({ i, day, kind, site, wave, tier: site.tier, title: fill(T.title, v), text: fill(T.text, v),
      merit: T.merit[0] + T.merit[1] * site.tier, marks: T.marks[0] + T.marks[1] * site.tier });
  }
  return out;
}

export class Contracts {
  constructor(flags) { this.flags = flags; }

  /** Today's board, each offer marked taken or done. */
  board(day) {
    const done = this._doneMask(day), active = this.activeIndex(day);
    return offersFor(day, this.flags).map((o) => ({ ...o, done: !!(done & (1 << o.i)), active: active === o.i }));
  }
  _doneMask(day) { return Number(this.flags.get("CONTRACT_DONE_DAY")) === day ? Number(this.flags.get("CONTRACT_DONE_MASK")) || 0 : 0; }

  /** The offer you've taken (index), or -1. An offer from another day is still yours until you finish or drop it. */
  activeIndex(day) { const a = Number(this.flags.get("CONTRACT_ACTIVE")) || 0; return a && Number(this.flags.get("CONTRACT_DAY")) === day ? a - 1 : -1; }
  /** The taken contract, rebuilt from the day it was offered. */
  get active() {
    const a = Number(this.flags.get("CONTRACT_ACTIVE")) || 0;
    if (!a) return null;
    return offersFor(Number(this.flags.get("CONTRACT_DAY")) || 1, this.flags)[a - 1] ?? null;
  }

  /** Take an offer (one at a time; not one done already). */
  accept(day, i) {
    const o = this.board(day)[i];
    if (!o || o.done || this.active) return false;
    this.flags.set("CONTRACT_ACTIVE", i + 1); this.flags.set("CONTRACT_DAY", day);
    return o;
  }
  abandon() { this.flags.set("CONTRACT_ACTIVE", 0); }

  /** The fight's won: the pay (Merit, Marks, a little standing), and the offer's done for the day it was offered. */
  complete(today) {
    const o = this.active;
    if (!o) return null;
    this.flags.add("MERIT", o.merit); this.flags.add("REP_SQUAD", 1); this.flags.add("CONTRACTS_DONE", 1);
    if (o.day === today) {
      this.flags.set("CONTRACT_DONE_MASK", this._doneMask(today) | (1 << o.i)); this.flags.set("CONTRACT_DONE_DAY", today);
    }
    this.flags.set("CONTRACT_ACTIVE", 0);
    return o;
  }

  /** The fight for a contract taken here, as a zone encounter. */
  encounterFor(zoneId) {
    const o = this.active;
    if (!o || o.site.zone !== zoneId) return null;
    return { id: "contract", rect: o.site.rect, at: o.site.at, wave: o.wave, contract: true, label: `SQUAD CONTRACT · ${o.title.toUpperCase()}` };
  }
}
