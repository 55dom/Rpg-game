// Progression data (GDD §17, §8.1): Rook's level curve and stat growth, the XP each foe is worth,
// page levels I–V, and the Grimoire Tree, a small skill tree bought with points from level-ups.
// Growth is modest on purpose: big jumps in power come from story moments, not grinding.

export const MAX_LEVEL = 60;

/** XP needed to go from `level` to `level + 1`. */
export const xpToNext = (level) => Math.round(60 * Math.pow(level, 1.35));

/** Stat growth per level above 1 (mods in the same units as equipment, core/inventory.js). */
export const GROWTH = Object.freeze({ health: 5, mana: 1, attack: 0.006, posture: 0.004 });

/** Skill points per level gained. */
export const POINTS_PER_LEVEL = 1;

/** XP per defeated foe, by kind. Bosses are worth a lot; rats hardly anything. */
export const XP_BY_KIND = Object.freeze({
  acolyte: 14, hound: 9, cantor: 16, bulwark: 20, beast: 50, rat: 4, clockwork: 34, bandit: 15, hask: 220, severin: 160, cal: 60,
});
export const EPISODE_XP = 120;
export const QUEST_XP = 60; // when a quest's reward doesn't say otherwise

/** Page levels I–V by hits landed, as multiples of the page's hitsToEvolve. III is where it evolves. */
export const PAGE_LEVELS = Object.freeze([0, 0.5, 1, 2.5, 4.5]);
export const PAGE_ROMAN = Object.freeze(["I", "II", "III", "IV", "V"]);
/** Each page level above I adds damage to that page; V (mastered) also cuts its mana cost by a quarter. */
export const PAGE_LEVEL_DAMAGE = 0.05;
export const PAGE_MASTERED_MANA = -0.25;

/**
 * The Grimoire Tree. Five columns: one per spell page plus the Margin (Rook's own passives).
 * A node needs the node above it in its column, a minimum level, and for a page's last node, that page at level III.
 * Effects: dmg/mana are per page (fractions); the rest add to Rook's stats like equipment does.
 */
export const TREE_COLUMNS = Object.freeze([
  { col: "Spell1", name: "Gale Cutter" }, { col: "Spell2", name: "Vacuum Pull" }, { col: "Spell3", name: "Tempest Edge" },
  { col: "Spell4", name: "Wind Wall" }, { col: "margin", name: "Margin Notes" },
]);

const page = (col, a, b, c) => [
  { id: `${col}.1`, col, tier: 1, cost: 1, level: 1, ...a },
  { id: `${col}.2`, col, tier: 2, cost: 1, level: 4, requires: `${col}.1`, ...b },
  { id: `${col}.3`, col, tier: 3, cost: 2, level: 8, requires: `${col}.2`, pageLevel: 3, ...c },
];

export const SKILLS = Object.freeze(Object.fromEntries([
  ...page("Spell1",
    { name: "Keen Edge", desc: "Gale Cutter hits 15% harder.", effect: { dmg: 0.15 } },
    { name: "Thrifty Gust", desc: "Gale Cutter costs a quarter less mana.", effect: { mana: -0.25 } },
    { name: "Razor Wind", desc: "Gale Cutter hits another 25% harder.", effect: { dmg: 0.25 } }),
  ...page("Spell2",
    { name: "Strong Draw", desc: "Vacuum Pull hits 15% harder.", effect: { dmg: 0.15 } },
    { name: "Quiet Breath", desc: "Vacuum Pull costs a quarter less mana.", effect: { mana: -0.25 } },
    { name: "Eye of the Storm", desc: "Vacuum Pull hits another 25% harder.", effect: { dmg: 0.25 } }),
  ...page("Spell3",
    { name: "Spinning Steel", desc: "Tempest Edge hits 15% harder.", effect: { dmg: 0.15 } },
    { name: "Light Feet", desc: "Tempest Edge costs a quarter less mana.", effect: { mana: -0.25 } },
    { name: "Hurricane Heart", desc: "Tempest Edge hits another 25% harder.", effect: { dmg: 0.25 } }),
  ...page("Spell4",
    { name: "Thick Air", desc: "Wind Wall hits 15% harder.", effect: { dmg: 0.15 } },
    { name: "Easy Ward", desc: "Wind Wall costs a third less mana.", effect: { mana: -0.33 } },
    { name: "Standing Gale", desc: "Wind Wall hits another 25% harder.", effect: { dmg: 0.25 } }),
  { id: "margin.1", col: "margin", tier: 1, cost: 1, level: 1, name: "Lantern Heart", desc: "+30 health.", effect: { health: 30 } },
  { id: "margin.2", col: "margin", tier: 2, cost: 1, level: 4, requires: "margin.1", name: "Ink Flow", desc: "Mana comes back 2 a second faster.", effect: { manaRegen: 2 } },
  { id: "margin.3", col: "margin", tier: 3, cost: 2, level: 8, requires: "margin.2", name: "Kindled", desc: "Surge fills 15% faster; +5% damage with everything.", effect: { surge: 0.15, attack: 0.05 } },
].map((n) => [n.id, Object.freeze(n)])));
