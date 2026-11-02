// Squad Contracts (GDD §18.1: "repeatable small missions for Merit. Template-generated from data to fill gaps without
// hand-authoring each one"). The squad board at the Lighthouse offers three a day, made from a template, a site and a
// client, seeded by the day (core/contracts.js). Knight Rank opens the tiers (§17: "mission tiers"): tier 1 for any
// knight, then one more with each rank. A contract is a fight at its site; win it and the squad's Merit grows.
//
// (Writers' note: contracts are errands. No keys, no doors, no lanterns going out; the mystery isn't told here.)

/** Tier t needs Knight Rank t - 1 (Ember 0 → tier 1 … Sun 4 → tier 5). */
export const CONTRACT_TIERS = 5;
export const OFFERS_PER_DAY = 3;

/**
 * Where contracts happen: a zone, a named spot, open ground for the fight (at, rect: walk in and it starts), the foes
 * found there, the tier, when the place is open to contracts at all, and which templates fit it (all of them, if not said).
 */
export const CONTRACT_SITES = Object.freeze([
  { id: "hedgerows", short: "hedgerows", zone: "thornwick", spot: "the hedgerows north-west of the green", at: { x: -18, z: 21, r: 4 }, rect: [-25, 14, -11, 28], tier: 1,
    foes: ["bandit", "hound"], clients: ["Farmer Odo", "the miller's wife"] },
  { id: "causeway", short: "causeway", zone: "fens", spot: "the old causeway in the north-west reeds", at: { x: -18, z: 22, r: 4 }, rect: [-26, 15, -10, 29], tier: 1, when: "$EP4_DONE",
    foes: ["hound", "acolyte"], clients: ["Ness", "a reed-cutter"] },
  { id: "drains", kinds: ["cull", "recover"], short: "drains", zone: "undercroft", spot: "the drains at the foot of the stairs", at: { x: 0, z: -25.5, r: 3 }, rect: [-6, -28, 6, -21], tier: 2, when: "$EP11_DONE",
    foes: ["rat", "clockwork"], clients: ["the fish cook", "a city drainman"] },
  { id: "towerHall", kinds: ["cull", "recover"], short: "great hall", zone: "tower", spot: "the Tower's great hall", at: { x: 0, z: -7, r: 3 }, rect: [-10, -9.5, 10, -4.6], tier: 2, when: "$GALEN_DEFEATED",
    foes: ["acolyte", "cantor"], clients: ["Brother Moss"] },
  { id: "gateField", kinds: ["cull", "escort"], short: "gate field", zone: "ironhold", spot: "the east end of the gate field", at: { x: 16, z: -14, r: 4 }, rect: [8, -22, 24, -6], tier: 3, when: "$HAS_SUMMONS",
    foes: ["ashLegion", "ashMage"], clients: ["the Wardens' quartermaster"] },
  { id: "eastSpur", kinds: ["cull", "escort"], short: "eastern spur", zone: "isles", spot: "the eastern spur", at: { x: 8, z: 8, r: 4 }, rect: [2, 3, 15, 15], tier: 4, when: "$EP30_DONE",
    foes: ["rider", "wisp"], clients: ["a Tempest Rider"] },
  { id: "lakeshore", kinds: ["cull", "recover"], short: "island", zone: "mirrorlake", spot: "the island on Mirrorlake", at: { x: -8, z: 6, r: 3 }, rect: [-14, 1, -3, 12], tier: 4, when: "$EP28_DONE",
    foes: ["mirrorWraith"], clients: ["a Verdant Oath pilgrim"] },
  { id: "oldStreets", kinds: ["cull", "recover"], short: "old streets", zone: "oldcity", spot: "the old streets under the Lowmarket", at: { x: 0, z: -25, r: 4 }, rect: [-8, -32, 8, -18], tier: 5, when: "$EP33_DONE",
    foes: ["shell", "wisp"], clients: ["the City Watch"] },
  { id: "stones", kinds: ["cull", "escort"], short: "standing stones", zone: "hollowmarch", spot: "the standing stones", at: { x: 0, z: 0, r: 4 }, rect: [-8, -8, 8, 8], tier: 5, when: "$EP17_DONE",
    foes: ["shell", "wisp"], clients: ["the Crown"] },
]);

/** What foes are called on a contract (plural). */
export const FOE_NAMES = Object.freeze({
  bandit: "bandits", hound: "fen hounds", acolyte: "Choir stragglers", rat: "rats", clockwork: "loose clockwork", cantor: "Choir cantors",
  ashLegion: "Ashfall raiders", ashMage: "Ashfall war-mages", rider: "rogue riders", wisp: "wisps", shell: "hollow shells", mirrorWraith: "mirror wraiths",
});

/** Things that go missing (recover contracts). */
export const THINGS = Object.freeze([
  "a sack of seed corn", "a wedding ring", "a crate of lamp oil", "a fishing net", "a hymnbook", "a satchel of letters", "a toolbox", "a cask of cider",
  "a lucky boot", "a surveyor's chain", "a bag of nails", "a goat (it answers to Duchess)",
]);

/**
 * The templates. size: foes in the fight (tier added); merit / marks: the pay, per tier. title and text take {spot},
 * {client}, {foes} and {thing}.
 */
export const CONTRACT_TEMPLATES = Object.freeze({
  cull: { size: 3, merit: [4, 2], marks: [10, 20], title: "Clear the {short}",
    text: "{Client} says the {foes} are back by {spot}. Somebody has to go and say no to them." },
  recover: { size: 2, merit: [3, 2], marks: [20, 28], title: "Lost: {thing}",
    text: "{Client} lost {thing} by {spot}. Whatever's there now isn't giving it back." },
  escort: { size: 3, merit: [5, 2], marks: [8, 18], title: "Clear the road by the {short}",
    text: "{Client} needs to get through by {spot} before dark, and the {foes} have other ideas." },
});
