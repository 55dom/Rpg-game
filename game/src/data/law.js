// The law (GDD §12.3 Reputation): crimes, who sees them, the Watch, bounties and prison.
//
// Anyone who catches you at it (within 3 m, inside their field of view) is a witness. Guards come to arrest
// you; most grown-ups fight back; children and old folk run and shout for the Watch; squadmates fight you
// and think less of you. Hit a guard and he whistles for another, and they keep coming until you
// surrender, fall, or get away (and getting away is a crime too). Bounties are kept per region; you can
// pay one at the Watch House, to a guard on the spot, or sit it out in the cells.
//
// The Watch grows with the story: the more missions and episodes behind you, the more guards walk the
// streets. Since Luke joined, more young men sign up every week (nobody, least of all Luke, knows why).

import { QUESTS } from "./quests.js";

/** A witness's field of view: how far, and how far round from where they're facing (radians each side). */
export const POV = Object.freeze({ radius: 3, half: 1.05 });

/** bounty in Marks; renown and squad (reputation) change when someone sees it. petty: a trusted face gets a warning. */
export const CRIMES = Object.freeze({
  theft: { label: "THEFT", bounty: 30, renown: -3, squad: -1, petty: true },
  pickpocket: { label: "PICKPOCKETING", bounty: 25, renown: -3, squad: -1, petty: true },
  assault: { label: "ASSAULT", bounty: 50, renown: -5, squad: -2 },
  assaultGuard: { label: "ASSAULTING THE WATCH", bounty: 80, renown: -6, squad: -3 },
  eluding: { label: "ELUDING THE WATCH", bounty: 40, renown: -4, squad: -1 },
  guardDown: { label: "A GUARD KNOCKED OUT", bounty: 20, renown: -2, squad: 0 },
});

/** Regions with a law of their own. `renown`: the flag your standing there is kept in. comrades: the squad's home (no Watch, no bounty). */
export const LAW_REGIONS = Object.freeze({
  aurelin: { id: "AURELIN", name: "Aurelin", renown: "RENOWN_AURELIN", watch: "the City Watch" },
  thornwick: { id: "THORNWICK", name: "Thornwick", renown: "RENOWN_THORNWICK", watch: "the village watch" },
  fens: { id: "FENS", name: "the Greywater Fens", renown: "RENOWN_FENS", watch: "the Watch's Fens post" },
  ironhold: { id: "IRONHOLD", name: "Ironhold", renown: "REP_SQUAD", watch: "the Iron Wardens" },
  lighthouse: { id: "LIGHTHOUSE", name: "the Lighthouse", renown: "REP_SQUAD", comrades: true },
});

/** Which region's law a zone falls under (interiors belong to their town). */
export const ZONE_REGION = Object.freeze({
  aurelin: "aurelin", cafe: "aurelin", home: "aurelin", hall: "aurelin", watchhouse: "aurelin", tower: "aurelin",
  thornwick: "thornwick", fens: "fens", fenhome: "fens", lighthouse: "lighthouse", ironhold: "ironhold",
});

/** Standing in a region, by renown. price: what the shops charge. warn: a guard lets a petty first offence go. */
export const RENOWN_TIERS = Object.freeze([
  { min: 40, name: "Hero", price: 0.8, warn: true },
  { min: 10, name: "Trusted", price: 0.9, warn: true },
  { min: -10, name: "Known", price: 1, warn: false },
  { min: -30, name: "Troublemaker", price: 1.1, warn: false },
  { min: -Infinity, name: "Outlaw", price: 1.25, warn: false },
]);
export const renownTier = (renown) => RENOWN_TIERS.find((t) => (Number(renown) || 0) >= t.min);

/** Bosses and missions out in the world that count toward the Watch's size (besides quests and episodes). */
const MISSION_FLAGS = ["BANDITS_CLEARED", "UNDERCROFT_CLEARED", "ILSE_DEFEATED", "GALEN_DEFEATED", "GULLMAW_DEFEATED", "BOG_BEAST_DOWN", "ELSIE_SAVED"];

/** Missions behind you: finished episodes, finished quests, and the world's bosses. */
export function missionsDone(flags) {
  let n = 0;
  for (let e = 1; e <= 60; e++) if (Number(flags.get(`EP${e}_PAID`))) n++;
  for (const id of Object.keys(QUESTS)) if (Number(flags.get(`Q_${id.toUpperCase()}`)) === 999) n++;
  for (const f of MISSION_FLAGS) if (Number(flags.get(f))) n++;
  return n;
}

/** How many extra guards walk the streets (0–8): one per two missions, three more once Luke has joined. */
export function watchStrength(flags) {
  return Math.min(8, Math.floor(missionsDone(flags) / 2) + (Number(flags.get("LUKE_GUARD")) ? 3 : 0));
}

/** Prison: the bounty is served as time in the cells (hours), plus a fine if you had to be carried in. */
export function sentence(bounty, { surrendered }) {
  return { hours: Math.min(14, 4 + Math.round(bounty / 25)), fineShare: surrendered ? 0 : 0.5 };
}

/**
 * Things you can steal, by zone: once a day each. Whoever owns it doesn't need to see you; anyone who
 * does is a witness. gift: a gift item (data/bonds.js) instead of Marks.
 */
export const STEAL_SPOTS = Object.freeze({
  aurelin: [
    { id: "fruit", x: 18, z: -6.6, label: "a bag of plums", marks: 6, owner: "vendor" },
    { id: "spice", x: 30, z: -6.6, label: "a pouch of saffron", marks: 14, owner: "vendor" },
    { id: "ribbon", x: 24, z: 0.6, label: "a spool of silver thread", gift: "thread", owner: "vendor" },
  ],
  thornwick: [{ id: "smithbox", x: -8, z: -5, label: "the smith's coin box", marks: 12, owner: "smith" }],
  fens: [{ id: "nessbasket", x: 11.6, z: -7.6, label: "a dried fish from Ness's basket", gift: "driedfish", owner: "ness" }],
  lighthouse: [
    { id: "coinjar", x: -6.4, z: 4.6, label: "Dagrun's coin jar", marks: 15, owner: "dagrun" },
    { id: "tiptin", x: 2.6, z: 4.2, label: "Juno's tip tin", marks: 8, owner: "juno" },
  ],
});

/** People who won't fight you: they run and shout for the Watch instead. */
export const TIMID_ROLES = Object.freeze(["child", "elder"]);

/** What people shout when they catch you, by crime. */
export const SHOUTS = Object.freeze({
  theft: ["Thief! THIEF!", "Put that back!", "Oi! That's not yours!"],
  pickpocket: ["Get your hand out of my pocket!", "Pickpocket! Guards!", "I felt that!"],
  assault: ["Help! Somebody, help!", "Guards! GUARDS!", "Are you mad?!"],
  assaultGuard: ["Assaulting the Watch? Right."],
});

/** Squadmates who catch you (at the Lighthouse): what they say before they put you on the floor. */
export const COMRADE_LINES = Object.freeze({
  dagrun: ["{name}. Put. It. Back.", "In my own house? Right. Up you come, then."],
  juno: ["That's my tin. I'm going to staple you to the wall.", "Hand. Out. Of. My. Tin."],
  bas: ["We're family. Family doesn't pickpocket family.", "Want to wrestle? Fine. Let's wrestle."],
  tamsin: ["I'm writing a song about this. It's a sad one.", "Oh, it's like that? It's like THAT?"],
  lio: ["I saw that. I'm very sorry. I'm going to have to hit you.", "That was... unkind."],
});
