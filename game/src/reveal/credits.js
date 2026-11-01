// The credits after Ep 70 (GDD §23.8, Phase 9 Step 5): what you wrote in the margin, the choices that were yours along
// the way, the people, and the light left on. Built from your flags, so no two rolls need be the same.

const ENDINGS = {
  fall: { said: "“Fall.”", line: "One word, and he let it be fair." },
  stay: { said: "“Stay.”", line: "One star, plain and gold. A soldier again." },
  lantern: { said: "“You're a Lantern.”", line: "Not a rating. What was true. There's a chair for him at the table." },
};

/** Your choices, as they happened (only the ones you made). */
const CHOICES = [
  (f) => f.EXAM_DUEL_WON ? "You beat Severin at the Knight Exam." : "You lost the Knight Exam, and got up three times.",
  (f) => f.MIRREN_SAVED === 1 ? "You saved the girl in the bog. Her name is Mirren." : f.MIRREN_SAVED === 0 ? "You chased the acolyte into the fog." : null,
  (f) => f.ALDRIC_OFFER === "refused" ? "You told the Chancellor the grimoire was yours." : f.ALDRIC_OFFER === "deferred" ? "You told the Chancellor you'd think about it." : null,
  (f) => f.LIO_READ_TWIN === 1 ? "You asked Lio to read the twin in the chapel." : null,
  (f) => f.LUKE_HOME_VISITED ? "You knocked on Luke's door in the Fens." : null,
  (f) => f.PERSPECTIVE === "cal" ? "When it asked whose story, you said his." : f.PERSPECTIVE === "rook" ? "When it asked whose story, you said yours." : null,
  (f) => f.MAELIS_PROMISE === "dont" ? "You asked Maelis not to." : f.MAELIS_PROMISE === "why" ? "You asked Maelis why she keeps offering." : null,
];

/** The Lanterns, and everyone else (`who` is the player's name). */
const LANTERNS = (who, fate) => [
  [who, "the one-page mage"],
  ["Cal", fate === "lantern" ? "who held the door, and came home" : "who held the door"],
  ["Juno", "who tied the knots"],
  ["Bas", "who stood in front"],
  ["Lio", "who read everything"],
  ["Tamsin", "who sang it off-key"],
  ["Captain Dagrun", "who left the light on"],
];
const AND = (f) => [
  ["Severin Valcourt", "who came back"],
  ["Elodie", "in the doorway"],
  ["Luke", "of the Watch"],
  ...(f.MIRREN_SAVED === 1 ? [["Mirren", "out of the bog"]] : []),
  ["Mother Wren", "at the orphanage door"],
  ["Captain Brannoc", "who didn't get up"],
  ["Brother Moss", "the last scribe"],
  ["Maelis", "who kept offering"],
  ["Hesper Voss", "who learned about the Hollow"],
];

/**
 * The roll, as sections of lines. `flags` is the FlagStore (or any `get(name)`), `who` the name the player chose.
 * @returns {{ head?: string, lines: (string | [string, string])[], big?: boolean }[]}
 */
export function creditsFor(flags, who = "Rook") {
  const f = new Proxy({}, { get: (_, k) => flags.get(String(k)) });
  const fate = flags.get("CAL_FATE"), end = ENDINGS[fate];
  return [
    { lines: ["UNWRITTEN", "KNIGHTS OF THE LAST LANTERN"], big: true },
    ...(end ? [{ head: "WHAT YOU WROTE", lines: [end.said, end.line] }] : []),
    { head: "WHAT WAS YOURS", lines: CHOICES.map((c) => c(f)).filter(Boolean) },
    { head: "THE LANTERNS", lines: LANTERNS(who, fate) },
    { head: "AND", lines: AND(f) },
    { head: "MADE WITH", lines: ["Babylon.js, in a browser", "Web Audio, every sound made on the spot", "Stepped animation, frame by frame"] },
    { lines: ["Every episode you've reached stays open in EPISODES & SAVES.", "Thank you for playing."] },
    { lines: ["Somebody's left the light on."], big: true },
  ];
}

export const CREDITS_SECONDS = 48; // how long the roll takes, top to bottom
