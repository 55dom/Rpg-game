// Marks, owned items, and what's equipped. Pure data plus rules, saved with the story.

import { ITEMS, SLOTS, slotKind } from "../data/items.js";
import { temperedMods } from "./crafting.js";

const STARTER = { weapon: "squireBlade", cloak: "lanternCloak", charm1: null, charm2: null };

export class Inventory {
  constructor(data = {}) {
    this.marks = Math.max(0, Math.floor(data.marks ?? 30));
    this.owned = new Set((data.owned ?? ["squireBlade", "lanternCloak"]).filter((id) => ITEMS[id]));
    this.equipped = { ...STARTER };
    this.temper = Object.fromEntries(Object.entries(data.temper ?? {}).filter(([id, n]) => ITEMS[id] && n > 0).map(([id, n]) => [id, Math.min(2, Math.floor(n))]));
    for (const s of SLOTS) if (data.equipped?.[s] !== undefined && (data.equipped[s] === null || this.owned.has(data.equipped[s]))) this.equipped[s] = data.equipped[s];
  }

  toJSON() { return { marks: this.marks, owned: [...this.owned], equipped: { ...this.equipped }, temper: { ...this.temper } }; }
  temperOf(id) { return this.temper[id] ?? 0; }

  earn(n) { this.marks += Math.max(0, Math.floor(n)); return this.marks; }

  /** Buy an item: needs enough marks and not already owned (equipment is unique). */
  buy(id, priceFactor = 1) {
    const it = ITEMS[id];
    if (!it) return { ok: false, reason: "unknown" };
    if (this.owned.has(id)) return { ok: false, reason: "owned" };
    const price = Math.round(it.price * priceFactor);
    if (this.marks < price) return { ok: false, reason: "marks" };
    this.marks -= price;
    this.owned.add(id);
    return { ok: true };
  }

  /** Equip an owned item into a slot of its kind (charms: either charm slot, never both). null empties a charm slot. */
  equip(slot, id) {
    if (!SLOTS.includes(slot)) return false;
    if (id === null) { if (slotKind(slot) !== "charm") return false; this.equipped[slot] = null; return true; }
    const it = ITEMS[id];
    if (!it || !this.owned.has(id) || it.kind !== slotKind(slot)) return false;
    const other = slot === "charm1" ? "charm2" : slot === "charm2" ? "charm1" : null;
    if (other && this.equipped[other] === id) this.equipped[other] = null;
    this.equipped[slot] = id;
    return true;
  }

  /** Sum of every equipped item's mods. */
  get mods() {
    const m = { attack: 0, defense: 0, health: 0, manaRegen: 0, posture: 0, surge: 0, speed: 0 };
    for (const s of SLOTS) {
      const id = this.equipped[s];
      if (!id) continue;
      for (const [k, v] of Object.entries(temperedMods(id, this.temperOf(id)))) m[k] += v;
    }
    m.defense = Math.min(0.5, m.defense); // never more than half off
    return m;
  }
}
