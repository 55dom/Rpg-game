// Secret pages (GDD §8.4): pages found only by doing a hidden thing, never sold, never given in the story. Each is a
// passive you pin in your grimoire's margin: two at a time (§8.1's two Margin Notes). Found pages are story flags
// (SECRET_<ID>), the two pinned are MARGIN_1 and MARGIN_2, so they save, load and replay with everything else.
//
//   hint   what the Grimoire says before you've found it (a nudge, not the answer)
//   how    the hidden condition, said plainly once it's found
//   effect read by the World (sim/world.js `margin`)
//
// Blank Verse (reach Corruption 50, then cleanse to 0) is found by core/corruption.js.

export const MARGIN_SLOTS = 2;

export const SECRET_PAGES = Object.freeze({
  lanternsAnswer: Object.freeze({
    name: "Lantern's Answer", flag: "SECRET_LANTERN",
    hint: "The Hall of Lanterns keeps its own hours. Go when nobody else does. More than once.",
    how: "Visited the Hall of Lanterns at night, on three different nights, after the Bloom.",
    desc: "Once a fight, when you fall below a quarter of your health, a warm light gives a fifth of it back.",
  }),
  jurorsThread: Object.freeze({
    name: "Juror's Thread", flag: "SECRET_JUROR",
    hint: "Juno says a good parry sounds like a seam pulled tight. She'd know. She'd count, too.",
    how: "Parried a hundred blows with Juno beside you.",
    desc: "Your parry window is 2 frames wider, and whoever you parry is BOUND by a thread for two seconds.",
  }),
  secondReading: Object.freeze({
    name: "Second Reading", flag: "SECRET_SECOND",
    hint: "Brother Moss likes his tea strong and his visitors regular.",
    how: "Brought Brother Moss tea seven times. He remembered a page.",
    desc: "The first time you cast each page in a fight, its mana comes straight back.",
  }),
  weightOfNothing: Object.freeze({
    name: "Weight of Nothing", flag: "SECRET_WEIGHT",
    hint: "Hask's mud has caught everyone who ever fought it. Everyone so far.",
    how: "Beat Hask without its mud ever touching you.",
    desc: "Mud and bile slide off you: WEIGHTED never sticks.",
  }),
  blankVerse: Object.freeze({
    name: "Blank Verse", flag: "SECRET_BLANK",
    hint: "A page can go dark and come back clean. It remembers having been both.",
    how: "Let Corruption reach 50, then cleansed it all the way back to nothing.",
    desc: "While your Corruption is 0: 10% more damage, and mana comes back 2 a second faster.",
  }),
  starChart: Object.freeze({
    name: "Star Chart", flag: "SECRET_STARS",
    hint: "Someone has been drawing the sky on stones, a piece at a time. Twelve pieces.",
    how: "Found all twelve constellation murals.",
    desc: "Your marks last twice as long, and a Detonate hits a quarter harder.",
  }),
});

/** The tunings the World reads. */
export const MARGIN_TUNING = Object.freeze({
  lanternBelow: 0.25, lanternHeal: 0.2,   // Lantern's Answer
  jurorParry: 2, jurorBind: 120,           // Juror's Thread
  markFactor: 2, detonateBonus: 0.25,      // Star Chart
  blankAttack: 0.1, blankMana: 2,          // Blank Verse
});

/** How far along each hidden condition is (the story's flags), and what finds it. */
export const SECRET_NEEDS = Object.freeze({ hallNights: 3, jurorParries: 100, mossTea: 7, murals: 12 });

/**
 * The twelve constellation murals (Star Chart): chalk-and-gilt pieces of a night sky, painted small in odd corners of
 * the world by somebody patient. `zone`, where; `x`, `z`, the spot; `name`, the constellation; `line`, what it shows.
 */
export const MURALS = Object.freeze([
  { n: 1, zone: "lighthouse", name: "The Lamplighter", line: "A figure holding up a pole with a star on the end of it." },
  { n: 2, zone: "lighthouse", name: "The Keel", line: "Seven stars in the curve of an upturned boat." },
  { n: 3, zone: "aurelin", name: "The Crown", line: "Five stars in a ring, the top one a little brighter than the rest." },
  { n: 4, zone: "aurelin", name: "The Bell", line: "A bell of stars with no clapper." },
  { n: 5, zone: "aurelin", name: "The Weaver", line: "A loom of stars, the threads running off the edge of the stone." },
  { n: 6, zone: "hall", name: "The Wick", line: "One bright star, and a trail of small ones going up like smoke." },
  { n: 7, zone: "tower", name: "The Open Book", line: "Two pages of stars; the left one has only one star on it." },
  { n: 8, zone: "thornwick", name: "The Hound", line: "A running dog, its tail a comet." },
  { n: 9, zone: "thornwick", name: "The Oak", line: "A tree of stars with its roots drawn as carefully as its branches." },
  { n: 10, zone: "fens", name: "The Heron", line: "A long-legged bird standing in a pool of painted-over stars." },
  { n: 11, zone: "fens", name: "The Lantern", line: "A small square of stars with a brighter one inside it." },
  { n: 12, zone: "undercroft", name: "The Gear", line: "A wheel of stars with teeth, turning nothing." },
]);
