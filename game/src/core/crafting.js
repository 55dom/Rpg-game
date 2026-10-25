// Crafting-lite rules over the story flags and the inventory: materials, tempering, HQ rooms, the daily meal.

import { MATERIALS, DROPS, TEMPER, MAX_TEMPER, HQ, MEAL } from "../data/crafting.js";
import { ITEMS } from "../data/items.js";

const MK = (id) => `MAT_${id.toUpperCase()}`;

export class Crafting {
  /** @param flags FlagStore @param inventory core/inventory.js Inventory (holds temper levels) */
  constructor(flags, inventory) { this.flags = flags; this.inventory = inventory; }

  count(id) { return Number(this.flags.get(MK(id))) || 0; }
  addMat(id, n = 1) { if (MATERIALS[id] && n > 0) this.flags.set(MK(id), this.count(id) + n); }
  hasMats(mats = {}) { return Object.entries(mats).every(([id, n]) => this.count(id) >= n); }
  spendMats(mats = {}) { for (const [id, n] of Object.entries(mats)) this.flags.set(MK(id), this.count(id) - n); }

  /** A foe went down: what it drops (rng in [0,1) decides the chance of a second). Returns [{ id, n }]. */
  drop(kind, rng = Math.random) {
    const d = DROPS[kind];
    if (!d) return [];
    const [id, x] = d, n = x >= 1 ? x : 1 + (rng() < x ? 1 : 0);
    this.addMat(id, n);
    return [{ id, n }];
  }

  // ---- HQ ----
  built(room) { return !!this.flags.get(`HQ_${room.toUpperCase()}`); }
  /** Why a room can't be built yet, or null. */
  buildBlocker(room) {
    const r = HQ[room];
    if (!r) return "unknown";
    if (this.built(room)) return "built";
    if ((Number(this.flags.get("MERIT")) || 0) < r.merit) return `needs ${r.merit} Merit`;
    if (this.inventory.marks < r.marks) return `${r.marks} Marks`;
    if (!this.hasMats(r.mats)) return "materials";
    return null;
  }
  build(room) {
    if (this.buildBlocker(room)) return false;
    const r = HQ[room];
    this.inventory.marks -= r.marks; this.spendMats(r.mats);
    this.flags.set(`HQ_${room.toUpperCase()}`, 1);
    return true;
  }

  // ---- Tempering ----
  maxTemper() { return this.built("forge") ? MAX_TEMPER : 1; }
  /** The next tempering step's cost for an item, or null if it's maxed. */
  temperCost(itemId) {
    const it = ITEMS[itemId], lv = this.inventory.temperOf(itemId);
    if (!it || lv >= MAX_TEMPER) return null;
    return TEMPER[it.kind].cost[lv];
  }
  temperBlocker(itemId) {
    const it = ITEMS[itemId], lv = this.inventory.temperOf(itemId);
    if (!it || !this.inventory.owned.has(itemId)) return "not owned";
    if (lv >= MAX_TEMPER) return "fully tempered";
    if (lv >= this.maxTemper()) return "needs the Forge";
    const c = this.temperCost(itemId);
    if (this.inventory.marks < c.marks) return `${c.marks} Marks`;
    if (!this.hasMats(c.mats)) return "materials";
    return null;
  }
  temper(itemId) {
    if (this.temperBlocker(itemId)) return false;
    const c = this.temperCost(itemId);
    this.inventory.marks -= c.marks; this.spendMats(c.mats);
    this.inventory.temper[itemId] = this.inventory.temperOf(itemId) + 1;
    return true;
  }

  // ---- The daily meal and room bonuses ----
  eat(day) {
    if (!this.built("kitchen") || Number(this.flags.get("MEAL_DAY")) === day) return false;
    this.flags.set("MEAL_DAY", day);
    return true;
  }
  /** Stat mods from HQ rooms (and today's meal). */
  mods(day) {
    const m = {};
    if (this.built("infirmary")) m.health = (m.health ?? 0) + 30;
    if (this.built("kitchen") && Number(this.flags.get("MEAL_DAY")) === day) { m.health = (m.health ?? 0) + MEAL.health; m.attack = (m.attack ?? 0) + MEAL.attack; }
    return m;
  }
  get xpBonus() { return this.built("ring") ? 0.2 : 0; }
  get pageXpBonus() { return this.built("library") ? 0.5 : 0; }
}

/** Mods one item gives at its temper level (core/inventory.js uses this). */
export function temperedMods(itemId, level) {
  const it = ITEMS[itemId];
  if (!it) return {};
  const m = { ...it.mods };
  if (!level) return m;
  const t = TEMPER[it.kind];
  if (t.scale) for (const k of Object.keys(m)) m[k] *= 1 + t.scale * level;
  for (const [k, v] of Object.entries(t.per ?? {})) m[k] = (m[k] ?? 0) + v * level;
  return m;
}
