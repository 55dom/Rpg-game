// Episode 67 · The Rite of Waking (GDD §27.8; §25.3 Star Sight; §28.4 V8; Phase 7 Step 9, §23.6).
//
// The circle closes round the coffin. The Rite is written onto the hidden system itself, so everyone inside it is
// forced to see: Star Sight. Two over Juno; five over Corin; one, flickering, over Maelis; five each over the two at the
// coffin; over him, one star and a question mark; and over Rook, nothing. He mutters three syllables, and from inside
// the sealed coffin one word answers (V8); the two go perfectly still. They kneel, and offer themselves, and the circle
// reaches for him, and his smile falters: he understands, at last, what he was for. Then he laughs, with something like
// respect, and opens a door inside the Rite, and their stars pour into him instead. The coffin shudders, and stays shut.
// Layer 10, all at once: Hesper, Aldric, the Gate, "Take the one-pager", and Larkspur. The sky cracks like a page.
// "Now, Rook. Write me."

import { AFTER_EP66 } from "./arcs.js";
import { THRONE_LAYOUT as T } from "./places.js";

export const EP67_SCRIPT = `
title: Ep67_Circle
---
<<set $RITE_BEGUN to 1>>
<<sfx starRing>>
<<shot wide>>
A circle of gold light closes round the dais, round the coffin, round him standing at its heart. It isn't drawn on the floor. It's drawn on something under the floor, under everything: the thing the world is written on.
<<shot wide>>
And everyone inside it is forced to see.
<<stars on>>
<<set $STAR_SIGHT to 1>>
<<shot on Juno>>
Over Juno's head, two stars, in ink. Over Bas, two. Over Tamsin, one, bright as anything. Over Lio, two.
<<shot on Dagrun>>
Three over Dagrun, quiet as he is. Three over Severin.
<<shot on Corin>>
Five over Corin. One, flickering like a candle in a draught, over Maelis.
<<shot two unkA unkB>>
Five over each of the two at the coffin.
<<shot on Cal>>
Over him, one star, and a question mark.
<<shot on Lio>>
Lio: Rook. There's nothing over you.
<<shot on Lio>>
Lio: Not none. Nothing. There's nothing there at all.
<<shot on Rook>>
Over your own head, when you look up into the gold: nothing. Not zero. Nothing was ever written for you. Not even a blank.
===

title: Ep67_Answer
---
<<stars on>>
<<shot on Cal>>
He looks at the coffin, and says three syllables, under his breath, in a language no one here has ever heard.
<<sfx unkSpeechFaint>>
<<shot on Cal>>
From inside the sealed coffin, one word answers. In the same tongue.
<<set $V8_HEARD to 1>>
<<shot two unkA unkB>>
The two in black go perfectly still. Not calm. Still.
<<shot on Cal>>
For once, he says nothing at all.
<<pose unkA kneel>>
<<pose unkB kneel>>
<<shot two unkA unkB>>
Then they kneel, one on each side of the coffin, where the Wings once stood, and bow their heads. Offering. And the gold circle tightens, and reaches for the third thing inside it.
<<shot on Cal>>
His smile falters. You watch him understand it, all of it, in a second: what he was for. Why they were excited, fifteen years ago, in a world with the time stopped. Why they never told him.
<<shot on Cal>>
Cal: …Oh.
<<shot on Cal>>
Cal: Oh, that's good. That's very good. I'd have done the same.
<<shot on Cal>>
And he laughs, with something that's almost respect, and opens a door. Inside the Rite.
<<sfx door>>
<<star unkA 0>>
<<star unkB 0>>
<<star cal ?>>
<<shot two unkA unkB>>
Their stars come out of them like breath on a cold morning and pour into him through the door. They don't resist. They only turn their masks toward him: her painted smile, his painted frown.
<<sfx slam>>
<<shot wide>>
The coffin shudders. Once. And stays shut.
<<set $CAL_ASCENDED to 1>>
===

title: Ep67_Truth
---
<<stars on>>
<<shot on Cal>>
Cal: You came all this way to find out what I've been doing. Fine. You've earned that much.
<<shot on Cal>>
Cal: Hesper: a boy at a gate. I gave her the Hollow and watched what she built on it. Aldric: I told Hesper where the Writ was, and she told him, and he thought he'd found it. The Gate: I needed a door from your side, and someone to knock.
<<shot on Cal>>
Cal: You: "Take the one-pager." I said three words to Dagrun from the captains' box. You think the Lanterns picked you?
<<shot on Dagrun>>
Dagrun: …I picked you because you asked me to.
<<shot on Cal>>
Cal: And Larkspur.
<<shot on Cal>>
Cal: I didn't choose where I landed. I landed. Something like me arriving takes room, and a village was in the room. I carried you out of it. I never told you.
<<shot on Cal>>
Cal: That's the only part I'm sorry for.
<<set $LAYER_TEN to 1>>
<<shot wide>>
And he rises, out of the scale altogether. Above him, the throne chamber's dark splits, a long white crack across the air, and another, and another, as if the hall were drawn on paper and somebody had pulled.
<<set $PAGE_TORN to 1>>
<<sfx slam>>
<<shot on Cal>>
Cal: The Palimpsest writes what it's told. Everything else in this world was written by somebody. You weren't. Neither am I, now.
<<shot on Cal>>
Cal: Now, Rook. Write me.
<<set $EP67_DONE to 1>>
===
`;

const THRONE = { stage: "throne" };
const circle = [
  { id: "cal", look: "unmasked", x: 0, z: 12.6, yaw: 0, stars: "?" },
  { id: "unkA", look: "unkATrue", x: T.places[0][0], z: T.places[0][1], yaw: Math.PI, stars: 5 },
  { id: "unkB", look: "unkBTrue", x: T.places[1][0], z: T.places[1][1], yaw: Math.PI, stars: 5 },
];
const outside = [
  { id: "juno", look: "juno", x: -2.2, z: 8.0, yaw: 0.2, stars: 2 },
  { id: "bas", look: "bas", x: 1.8, z: 7.8, yaw: -0.2, stars: 2 },
  { id: "tamsin", look: "tamsin", x: -3.6, z: 7.0, yaw: 0.4, stars: 1 },
  { id: "lio", look: "lio", x: 3.4, z: 7.0, yaw: -0.4, stars: 2 },
  { id: "dagrun", look: "dagrun", x: 0.4, z: 6.4, yaw: 0, stars: 3 },
  { id: "severin", look: "severin", x: -1.6, z: 5.8, yaw: 0.2, stars: 3 },
  { id: "corin", look: "corinNow", x: 2.8, z: 5.6, yaw: -0.3, stars: 5 },
  { id: "maelis", look: "maelisNow", x: -3.2, z: 5.0, yaw: 0.4, stars: 1 },
];

export const EPISODE_67 = {
  id: "ep67",
  number: 67,
  unlockAt: 5,
  setup: { ...AFTER_EP66 },
  title: "The Rite of Waking",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "circle", type: "scene", node: "Ep67_Circle", ...THRONE,
      rook: { x: -0.4, z: 8.6, yaw: 0 }, cast: [...circle, ...outside] },
    { id: "title", type: "title" },
    { id: "answer", type: "scene", node: "Ep67_Answer", ...THRONE,
      rook: { x: -0.4, z: 8.6, yaw: 0 }, cast: [...circle, ...outside] },
    { id: "truth", type: "scene", node: "Ep67_Truth", ...THRONE,
      rook: { x: -0.4, z: 8.6, yaw: 0 },
      cast: [{ ...circle[0], stars: "?" }, { ...circle[1], stars: 0, pose: "kneel" }, { ...circle[2], stars: 0, pose: "kneel" }, ...outside],
      set: { EP67_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep68",
      lines: [
        "Next time on UNWRITTEN:",
        "The world's page, tearing. Every door he has, and what he took.",
        "Rook against Cal.",
      ] },
  ],
};
