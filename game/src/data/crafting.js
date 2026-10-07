// Crafting-lite and the Squad HQ (GDD §17: equipment from the forge; Squad HQ rooms, meal buffs and
// research earned with Squad Merit). Materials drop from foes and are counted in flags (MAT_<ID>).
// Tempering raises one piece of gear to +1 or +2. HQ rooms need enough Merit (it's never spent: it's
// the squad's standing) plus Marks and materials, and show up as new set dressing at the Lighthouse.

export const MATERIALS = Object.freeze({
  hide: { name: "Fen Hide", desc: "From fen hounds. Tough and smelly." },
  thread: { name: "Choir Thread", desc: "Pale cord from Choir vestments. It hums if you pluck it." },
  plate: { name: "Iron Plate", desc: "Off a bulwark's tower shield." },
  heart: { name: "Bog Heart", desc: "A warm, slow-beating stone from a bog beast. Rare." },
  tail: { name: "Rat Tail", desc: "From the Undercroft. Nobody asks what it's for." },
  gear: { name: "Brass Gear", desc: "Clockwork teeth. Still turning, a little." },
  strap: { name: "Leather Strap", desc: "From road bandits' kit." },
});

/** What each foe drops (always one, plus a chance of a second). Bosses drop several. */
export const DROPS = Object.freeze({
  hound: ["hide", 0.3], acolyte: ["thread", 0.25], cantor: ["thread", 0.5], bulwark: ["plate", 0.4], beast: ["heart", 0.2],
  rat: ["tail", 0.2], clockwork: ["gear", 0.5], bandit: ["strap", 0.3],
  hask: ["heart", 2], ilse: ["thread", 4], galen: ["plate", 4], magistrate: ["gear", 5],
});

/** Tempering: what each level adds, by kind of gear, and what it costs. Charms grow their own effect by 30% a level. */
export const TEMPER = Object.freeze({
  weapon: { per: { attack: 0.05, posture: 0.03 }, cost: [{ marks: 30, mats: { plate: 1 } }, { marks: 70, mats: { plate: 2, gear: 1 } }] },
  cloak: { per: { health: 12, defense: 0.02 }, cost: [{ marks: 30, mats: { hide: 2 } }, { marks: 70, mats: { hide: 3, heart: 1 } }] },
  charm: { scale: 0.3, cost: [{ marks: 25, mats: { thread: 2 } }, { marks: 60, mats: { thread: 3, gear: 1 } }] },
});
export const MAX_TEMPER = 2;

/** Squad HQ rooms at the Lighthouse. merit: the squad's standing needed (not spent). */
export const HQ = Object.freeze({
  kitchen: { name: "Kitchen", merit: 10, marks: 40, mats: { hide: 2 }, desc: "Dagrun's stew pot, moved indoors. Eat at the Lighthouse table once a day: +20 health and +5% damage until midnight." },
  ring: { name: "Training Ring+", merit: 15, marks: 40, mats: { plate: 2 }, desc: "Proper posts, sand, a weapon rack. +20% XP from every fight." },
  forge: { name: "Forge", merit: 20, marks: 60, mats: { gear: 3 }, desc: "Bas's anvil and a real bellows. Gear can be tempered to +2." },
  library: { name: "Library Corner", merit: 25, marks: 50, mats: { thread: 3 }, desc: "Lio's shelves, finally. Pages gain mastery 50% faster." },
  infirmary: { name: "Infirmary", merit: 30, marks: 80, mats: { heart: 1 }, desc: "Juno's stitching table and clean linen. +30 health." },
});
export const MEAL = Object.freeze({ health: 20, attack: 0.05 });

export const CRAFT_SCRIPT = `
title: W_Meal
---
<<meal>>
<<if $MEAL_OK>>
    Dagrun: Sit. Eat. It's stew. It's always stew. Today it has a carrot in it.
    You eat. It's warm, it's salty, and for a moment nothing is chasing you.
<<else>>
    Dagrun: You already ate today, kid. Pot's for everyone.
<<endif>>
===
`;
