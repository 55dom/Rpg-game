// Rook's progression (GDD §17): level and XP, skill points, the Grimoire Tree, and each page's mastery.
// Pure data plus rules, saved with the story. The fight reads it through `mods` (stats, like equipment)
// and `pageBonus` (per-page damage and mana); page records are shared with the World so mastery
// earned in a fight is already here when the story saves.

import { PAGES } from "../data/pages.js";
import {
  MAX_LEVEL, xpToNext, GROWTH, POINTS_PER_LEVEL, SKILLS, PAGE_LEVELS, PAGE_LEVEL_DAMAGE, PAGE_MASTERED_MANA,
} from "../data/skills.js";

/** A page's level (1–5) from the hits it has landed. */
export function pageLevel(slot, xp) {
  const need = PAGES[slot]?.hitsToEvolve ?? 1;
  let lv = 1;
  for (let i = 1; i < PAGE_LEVELS.length; i++) if (xp >= Math.ceil(PAGE_LEVELS[i] * need)) lv = i + 1;
  return lv;
}

/** Progress toward a page's next level, 0..1 (1 once mastered). */
export function pageLevelProgress(slot, xp) {
  const need = PAGES[slot]?.hitsToEvolve ?? 1, lv = pageLevel(slot, xp);
  if (lv >= PAGE_LEVELS.length) return 1;
  const a = Math.ceil(PAGE_LEVELS[lv - 1] * need), b = Math.ceil(PAGE_LEVELS[lv] * need);
  return Math.min(1, (xp - a) / Math.max(1, b - a));
}

/** A fresh page record: hits landed, ready to evolve, the chosen branch. */
export const blankPage = () => ({ xp: 0, ready: false, branch: null });

export class Progress {
  constructor(d = {}) {
    this.level = Math.min(MAX_LEVEL, Math.max(1, Math.floor(d.level ?? 1)));
    this.xp = Math.max(0, Math.floor(d.xp ?? 0));
    this.points = Math.max(0, Math.floor(d.points ?? 0));
    this.skills = new Set((d.skills ?? []).filter((id) => SKILLS[id]));
    this.pages = {};
    for (const slot of Object.keys(PAGES)) {
      const p = d.pages?.[slot] ?? {};
      const branch = PAGES[slot].branches.some((b) => b.key === p.branch) ? p.branch : null;
      const xp = Math.max(0, Math.floor(p.xp ?? 0));
      this.pages[slot] = { xp, branch, ready: !branch && pageLevel(slot, xp) >= 3 };
    }
  }

  toJSON() {
    return { level: this.level, xp: this.xp, points: this.points, skills: [...this.skills],
      pages: Object.fromEntries(Object.entries(this.pages).map(([k, p]) => [k, { xp: p.xp, branch: p.branch }])) };
  }

  get next() { return this.level >= MAX_LEVEL ? 0 : xpToNext(this.level); }

  /** Add XP; returns how many levels were gained. Each level gives skill points. */
  gainXp(n) {
    let gained = 0;
    if (this.level >= MAX_LEVEL) return 0;
    this.xp += Math.max(0, Math.floor(n));
    while (this.level < MAX_LEVEL && this.xp >= xpToNext(this.level)) {
      this.xp -= xpToNext(this.level); this.level++; gained++; this.points += POINTS_PER_LEVEL;
    }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    return gained;
  }

  /** Why a skill can't be learned yet, or null if it can. */
  blocker(id) {
    const s = SKILLS[id];
    if (!s) return "unknown";
    if (this.skills.has(id)) return "learned";
    if (s.requires && !this.skills.has(s.requires)) return `needs ${SKILLS[s.requires].name}`;
    if (this.level < s.level) return `level ${s.level}`;
    if (s.pageLevel && pageLevel(s.col, this.pages[s.col].xp) < s.pageLevel) return `page level ${["", "I", "II", "III", "IV", "V"][s.pageLevel]}`;
    if (this.points < s.cost) return `${s.cost} point${s.cost > 1 ? "s" : ""}`;
    return null;
  }

  learn(id) {
    if (this.blocker(id)) return false;
    this.points -= SKILLS[id].cost;
    this.skills.add(id);
    return true;
  }

  /** Stat mods from level growth and Margin skills (same keys as equipment mods). */
  get mods() {
    const up = this.level - 1;
    const m = { health: Math.round(GROWTH.health * up), mana: GROWTH.mana * up, attack: GROWTH.attack * up, posture: GROWTH.posture * up, manaRegen: 0, surge: 0 };
    for (const id of this.skills) for (const [k, v] of Object.entries(SKILLS[id].effect)) if (k in m) m[k] += v;
    return m;
  }

  /** Per-page bonuses: damage factor and mana factor, from page level and the page's skills. */
  pageBonus(slot) {
    const lv = pageLevel(slot, this.pages[slot]?.xp ?? 0);
    let dmg = (lv - 1) * PAGE_LEVEL_DAMAGE, mana = lv >= 5 ? PAGE_MASTERED_MANA : 0;
    for (const id of this.skills) { const s = SKILLS[id]; if (s.col === slot) { dmg += s.effect.dmg ?? 0; mana += s.effect.mana ?? 0; } }
    return { dmg: 1 + dmg, mana: Math.max(0.25, 1 + mana) };
  }
}

/** Add two sets of stat mods (equipment + progression). */
export function addMods(a, b) {
  const m = { ...a };
  for (const [k, v] of Object.entries(b)) m[k] = (m[k] ?? 0) + v;
  return m;
}
