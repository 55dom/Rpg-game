// Difficulty (GDD §9.7): Story, Knight (the default) and Paragon. One AI, one set of kits: every
// difference is a multiplier or an offset here, read by the World (core/ai.js reads `pace`).
//
//   parry         frames added to (or taken from) a parry's window: Knight's 8 becomes 14 on Story (§9.3), 6 on Paragon
//   perfectDodge  the perfect-dodge window (the first N frames of a dodge's i-frames)
//   damageTaken   what reaches Rook and the squad
//   recover       how long an enemy waits after an attack before it may pick another (×)
//   cooldown      how long each attack waits before it can be picked again (×): on Paragon the big moves come round more often
//   tokens        how many more (or fewer) enemies may swing at once
//   autoCombo     holding Slash keeps the string going, on every device (§9.7 "auto-combo assist")

export const DIFFICULTY_KEYS = Object.freeze(["story", "knight", "paragon"]);

export const DIFFICULTIES = Object.freeze({
  story: Object.freeze({
    key: "story", name: "Story", parry: 6, perfectDodge: 10, damageTaken: 0.6, recover: 1.6, cooldown: 1.35, tokens: -1, autoCombo: true,
    desc: "For the story: wider parry and dodge windows, hits land softer, enemies take their time. Hold Slash to keep a combo going.",
  }),
  knight: Object.freeze({
    key: "knight", name: "Knight", parry: 0, perfectDodge: 6, damageTaken: 1, recover: 1, cooldown: 1, tokens: 0, autoCombo: false,
    desc: "As the fights were made.",
  }),
  paragon: Object.freeze({
    key: "paragon", name: "Paragon", parry: -2, perfectDodge: 4, damageTaken: 1.3, recover: 0.55, cooldown: 0.7, tokens: 1, autoCombo: false,
    desc: "Tighter windows, harder hits, and every enemy uses more of what it has, more often.",
  }),
});

/** A difficulty by key; anything unknown is Knight. */
export const difficultyOf = (key) => DIFFICULTIES[key] ?? DIFFICULTIES.knight;
