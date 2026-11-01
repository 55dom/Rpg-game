// Episode 8 · Rust Remembers (GDD §14 Arc 1; Boss 4; §15.5 D5, D6). The end of Arc 1.
//
// The Choir broke into the Tower of Choosing in the night and sang at the old tomb under the dais, and Sir Galen the
// Rusted, an Iron Warden captain two hundred years in the floor, stood up. Brother Moss sweeping up the glass. In the
// hall, Cal reads an ancient glyph aloud and covers it ("Guessed. Sounds like a word, right?", D5), and stands too long in
// front of the Saint mural, a kneeling woman beneath stars (Tamsin: "Never took you for an art lover.", D6). Boss 4.
// Afterwards Rook's grimoire bleeds ink for the first time: a single line of under-text nobody can read. The hook: Lio,
// alone: "It's started. I have to tell them… no. Not yet."

import { AFTER_EP7 } from "./arc12.js";

export const EP8_SCRIPT = `
title: Ep8_Moss
---
<<shot wide>>
The Tower of Choosing, in the morning. Broken glass on the marble, scorch marks round the dais, and Brother Moss sweeping, as if this were any other mess.
<<shot on Moss>>
Moss: They came in the night and sang at the old tomb under the floor. An Iron Warden captain. Sir Galen. He's been asleep down there two hundred years, and now he isn't.
<<shot on Moss>>
Moss: He went up the north stair. I'd go after him before he finds the Choir again. They'll want him back.
<<shot on Cal>>
Cal: Two hundred years in a box, and the first thing he hears is a hymn. I'd be cross too.
===

title: Ep8_Glyph
---
<<shot on Rook>>
On the base of a pillar, older than the Tower round it, a line of carved glyphs: hooks and strokes, nothing like the script of any grimoire.
<<shot on Cal>>
Cal: "Here the first door was shut."
<<shot on Tamsin>>
Tamsin: You can read that?
<<shot on Cal>>
Cal: Guessed. Sounds like a word, right? Here. The. Door. Most old things say something about doors.
<<set $CLUE_D5 to 1>>
===

title: Ep8_Saint
---
<<shot on Rook>>
A mural on the east wall, faded almost to nothing: a woman kneeling beneath a night full of stars, her hands open, light going out of them into someone you can't see.
<<shot on Cal>>
Cal is standing in front of it. He's been standing in front of it a while.
<<shot on Tamsin>>
Tamsin: Never took you for an art lover.
<<shot on Cal>>
Cal: I'm not. I just like the stars. Somebody counted them very carefully.
<<set $CLUE_D6 to 1>>
===

title: Ep8_Ink
---
<<shot wide>>
Sir Galen kneels on the marble with his sword across his knees, and the rust runs out of him like water, and he's still.
<<shot on Rook>>
Your grimoire's open in your hand. You don't remember opening it. On the one page, under Gale Cutter, a line of ink has come up out of the paper: pale, thin, in letters you've never seen.
<<set $INK_BLED to 1>>
<<shot on Juno>>
Juno: Rook. Your book's bleeding.
<<shot on Cal>>
Cal looks at the page for a moment. Just a moment. Then he grins.
<<shot on Cal>>
Cal: Did you spill something? Moss'll have your hide. That's Tower paper.
<<shot on Moss>>
Brother Moss doesn't say anything. He goes on sweeping. He sweeps very slowly.
===

title: Ep8_Lio
---
<<shot wide>>
That night, at the Lighthouse. The library. One candle.
<<shot on Lio>>
Lio has a page of his own notes in front of him: a copy, as near as he could make it, of the line in Rook's book.
<<shot on Lio>>
Lio: It's started.
<<shot on Lio>>
Lio: I have to tell them. I have to—
<<shot on Lio>>
He folds the page in half, and in half again, and puts it inside his coat.
<<shot on Lio>>
Lio: …No. Not yet.
<<set $EP8_DONE to 1>>
<<set $ARC1_DONE to 1>>
===
`;

const HALL = { stage: "towerHall" }, LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.06 } };

export const EPISODE_8 = {
  id: "ep8",
  number: 8,
  setup: { ...AFTER_EP7 },
  title: "Rust Remembers",
  arc: "Arc 1 · The One-Page Mage",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "rise", type: "cutscene", cutscene: "ep8_rise" },
    { id: "title", type: "title" },
    { id: "moss", type: "scene", node: "Ep8_Moss", ...HALL,
      rook: { x: 0.6, z: -6.4, yaw: -0.4 },
      cast: [
        { id: "moss", look: "moss", x: -1.4, z: -4.6, yaw: Math.PI - 0.4 },
        { id: "cal", look: "cal", x: 2.4, z: -5.6, yaw: -0.8 },
        { id: "tamsin", look: "tamsin", x: -2.6, z: -7.6, yaw: 0.6 },
      ] },
    { id: "hall", type: "explore", ...HALL,
      rook: { x: 0.6, z: -6.4, yaw: 0 },
      objective: "The Tower after the break-in. The old glyphs, the east mural, and Brother Moss ({n}/{total}).",
      required: ["glyph", "saint", "moss"], counts: "required",
      cast: [
        { id: "moss", look: "moss", x: -1.4, z: -4.6, yaw: Math.PI - 0.4, node: "Ep8_Moss" },
        { id: "cal", look: "cal", x: 6.2, z: 9.4, yaw: 1.2 },
        { id: "tamsin", look: "tamsin", x: 4.2, z: 6.4, yaw: 0.8 },
      ],
      pickups: [
        { id: "glyph", x: -11.4, z: -8.0, node: "Ep8_Glyph", label: "Old glyphs on a pillar" },
        { id: "saint", x: 9.2, z: 10.8, node: "Ep8_Saint", label: "The east mural" },
      ] },
    { id: "choir", type: "fight", ...HALL, wave: ["acolyte", "cantor", "acolyte", "bulwark"], tokens: 2,
      lines: [["Juno", "Choir! They came back for him."], ["Cal", "Then let's be rude and get there first."]],
      retry: "Again. Before they reach him." },
    { id: "galen", type: "fight", ...HALL, wave: ["galen"], tokens: 2,
      tutorial: [{ at: 0.5, text: "BOSS 4 · SIR GALEN THE RUSTED. Iron and rust, and two hundred years of being angry. Break his stance." }],
      lines: [["Bas", "He's an Iron Warden. Captain Brannoc's lot. …Sorry, sir."], ["Cal", "Rust remembers. Remind it it's tired."]],
      eventHints: { // §16 B4's Final: the last vow, and the page
        inkMark: "Your grimoire's bleeding ink. The page has marked one seal, far out: his last vow. Break it while he charges.",
      },
      retry: "Again. He's slow. You're not.",
      set: { GALEN_DEFEATED: 1 } },
    { id: "ink", type: "scene", node: "Ep8_Ink", ...HALL,
      rook: { x: 0.4, z: 0.2, yaw: 0 },
      cast: [
        { id: "galen", look: "galen", x: 0.2, z: 3.0, yaw: Math.PI, pose: "kneel" },
        { id: "juno", look: "juno", x: -1.8, z: 0.4, yaw: 0.6 },
        { id: "cal", look: "cal", x: 2.0, z: 0.8, yaw: -0.8 },
        { id: "moss", look: "moss", x: -3.4, z: -2.2, yaw: 0.6 },
      ] },
    { id: "lio", type: "scene", node: "Ep8_Lio", ...LH, ...NIGHT,
      rook: null,
      cast: [{ id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" }],
      set: { EP8_DONE: 1, ARC1_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep9",
      lines: [
        "Next time on UNWRITTEN: Arc 2, The Lantern That Went Out.",
        "The Royal Festival. A rank, a snub, and a girl in a window.",
        "And a pendant that belonged to someone lost in the Hollowmarch.",
      ] },
  ],
};
