// Curated equipment (GDD §17: weapon, cloak, two charms; clear identities, no random affixes).
// mods: attack (+% damage dealt), defense (+% damage taken off), health (+max HP), manaRegen (+/s),
// posture (+% posture damage dealt), surge (+% Surge gained), speed (+% run speed).

export const SLOTS = Object.freeze(["weapon", "cloak", "charm1", "charm2"]);
export const slotKind = (slot) => (slot.startsWith("charm") ? "charm" : slot);

export const ITEMS = Object.freeze({
  // Weapons
  squireBlade: { name: "Squire's Blade", kind: "weapon", price: 0, mods: {}, desc: "The sword the Lanterns gave you. Plain, honest, balanced." },
  thornwickSaber: { name: "Thornwick Saber", kind: "weapon", price: 120, mods: { attack: 0.12 }, desc: "A border-forged saber. Hits harder; nothing fancy." },
  breakerEdge: { name: "Breaker's Edge", kind: "weapon", price: 180, mods: { posture: 0.25, attack: 0.04 }, desc: "A heavy, notched blade. Cracks guards open." },
  galeWhisper: { name: "Gale Whisper", kind: "weapon", price: 220, mods: { manaRegen: 2, attack: 0.05 }, desc: "A light sword that hums in the wind. Your mana returns faster." },
  // Cloaks
  lanternCloak: { name: "Lantern Cloak", kind: "cloak", price: 0, mods: {}, desc: "Squad colors. Warm, at least." },
  wardenMantle: { name: "Warden's Mantle", kind: "cloak", price: 140, mods: { defense: 0.12, health: 20 }, desc: "Iron Warden surplus. Heavy, and worth it." },
  riderCoat: { name: "Rider's Coat", kind: "cloak", price: 150, mods: { speed: 0.1, defense: 0.04 }, desc: "Cut for Tempest Riders. You move like the wind is behind you." },
  // Charms
  brassBell: { name: "Brass Bell Charm", kind: "charm", price: 60, mods: { surge: 0.2 }, desc: "It rings when you fight well. Surge fills faster." },
  hearthStone: { name: "Hearthstone", kind: "charm", price: 70, mods: { health: 25 }, desc: "A warm pebble from a Thornwick hearth. More health." },
  inkDrop: { name: "Ink Drop", kind: "charm", price: 90, mods: { manaRegen: 1.5 }, desc: "A bead of old ink that never dries. Mana returns faster." },
  whetCharm: { name: "Whetstone Charm", kind: "charm", price: 85, mods: { attack: 0.06 }, desc: "A tiny whetstone on a cord. Every cut lands a little cleaner." },
  fenReed: { name: "Fen Reed Knot", kind: "charm", price: 55, mods: { defense: 0.06 }, desc: "A knot of bog reed. Fen folk swear it turns bad luck." },
});

export const SHOPS = Object.freeze({
  lowmarket: { name: "Lowmarket Stall", stock: ["thornwickSaber", "breakerEdge", "galeWhisper", "wardenMantle", "riderCoat", "brassBell", "hearthStone", "inkDrop", "whetCharm", "fenReed"] },
});

/** Marks for defeating each enemy kind (GDD §17). */
export const BOUNTIES = Object.freeze({ acolyte: 6, hound: 4, cantor: 8, bulwark: 10, beast: 22, rat: 2, clockwork: 16, bandit: 7, hask: 80, severin: 0, cal: 0, ilse: 120, galen: 150, gullmaw: 180, ashLegion: 11, ashMage: 10, varka: 200, engine: 0, brannocSpar: 0 });
export const EPISODE_REWARD = 40;
