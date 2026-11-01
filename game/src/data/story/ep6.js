// Episode 6 · The Silence Sermon (GDD §14 Arc 1; Boss 3; §15.5 D3).
//
// A fen town where nobody can speak: the Pale Choir held a sermon in the square, and every voice in the place went into
// the hymn nailed to the well. Old Ness writes on a slate. The Choir is still here, singing. Boss 3: Deacon Ilse
// Marrowind, Silence magic. Afterwards, in the reeds at dusk, Hesper Voss in a vision: "They gave you one page so you'd
// stay small. I can give you none, and you'll be free." The voices come back. On the road home Juno asks Cal why he
// never shouts a spell like everyone else does (D3): "Shouting's for show-offs. I'm shy."

import { AFTER_EP5 } from "./arc12.js";
import { ZONES } from "../zones.js";

export const EP6_SCRIPT = `
title: Ep6_Silent
---
<<shot wide>>
The fen town is quiet the way a held breath is quiet. People in doorways, at the well, by the boats. Nobody says a word. Their mouths move, and nothing comes out.
<<shot on Ness>>
Old Ness holds up a slate. In chalk, shaky: THE CHOIR SANG IN THE SQUARE. NOW WE CAN'T.
<<shot on Ness>>
He rubs it out with his sleeve and writes again: THEY'RE STILL HERE. LISTEN.
<<shot on Juno>>
Juno: Hymns. From the far end of the village. Same as the Fens, last time.
<<shot on Cal>>
Cal: A Silence sermon. They take the voices and keep them in the song. Clever. Rude, but clever.
<<shot on Cal>>
Cal: Find what they nailed up. Words hold words. Break the words, the voices come home.
===

title: Ep6_Woman
---
<<shot on Townswoman>>
She's trying to tell you something. She points at the well, then at her throat, then at the well again.
<<shot on Juno>>
Juno: She says it's on the well. The thing they nailed up. …I can read lips. Don't look at me like that, I grew up in a loud house.
===

title: Ep6_Hymn
---
<<shot on Rook>>
A hymn sheet nailed to the well, the ink still wet after three days. Under every line of the hymn, in smaller writing, a list of names.
<<shot on Rook>>
You tear it down. Somewhere at the end of the village, the singing falters, and then gets louder.
<<set $HYMN_READ to 1>>
===

title: Ep6_Vision
---
<<shot wide>>
Dusk in the reeds. The Deacon's gone down in the water, and the hymn with her. And then the reeds go still, and the light goes pale, and there's a woman standing in it who isn't there.
<<shot on Hesper>>
Hesper: So you're the one-page mage. They told me about you.
<<shot on Hesper>>
Hesper: They gave you one page so you'd stay small. I can give you none, and you'll be free.
-> "I don't want to be free. I want to be good at this."
    <<set $HESPER_VISION to "good">>
    <<shot on Rook>>
    Rook: I don't want to be free. I want to be good at this.
    <<shot on Hesper>>
    Hesper: You'll learn the difference. Everybody does.
-> "Who are you?"
    <<set $HESPER_VISION to "who">>
    <<shot on Rook>>
    Rook: Who are you?
    <<shot on Hesper>>
    Hesper: Somebody who was given the wrong book too.
-> Say nothing.
    <<set $HESPER_VISION to "small">>
    <<shot on Hesper>>
    Hesper: Quiet. Good. It's a start.
<<shot wide>>
The light goes out of the reeds. She's gone, if she was ever there.
===

title: Ep6_Road
---
<<shot wide>>
The fen town is noisy again, everybody talking at once, laughing, a baby howling and nobody minding. Old Ness won't stop thanking Bas.
<<shot on Juno>>
Juno: Can I ask you something, Cal?
<<shot on Juno>>
Juno: Every mage in the kingdom shouts their spell. Gale Cutter, Stone Pillar, the lot. You never say a word. You just… open a door.
<<shot on Cal>>
Cal: Shouting's for show-offs. I'm shy.
<<set $CLUE_D3 to 1>>
<<shot on Juno>>
Juno: You are not shy.
<<shot on Cal>>
Cal: I'm very shy. I'm shy right now. Look at me being shy.
<<set $EP6_DONE to 1>>
===
`;

const FENS = { stage: "fens" }, DUSK = { sky: { daylight: 0.22 } };
const squad = [
  { id: "juno", look: "juno", x: -1.6, z: 4.2, yaw: 0.3 },
  { id: "bas", look: "bas", x: 2.2, z: 3.8, yaw: -0.3 },
  { id: "cal", look: "cal", x: -3.2, z: 5.6, yaw: 0.6 },
];

export const EPISODE_6 = {
  id: "ep6",
  number: 6,
  setup: { ...AFTER_EP5 },
  title: "The Silence Sermon",
  arc: "Arc 1 · The One-Page Mage",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "silent", type: "scene", node: "Ep6_Silent", ...FENS,
      rook: { x: 0.4, z: 5.4, yaw: 0.2 },
      cast: [
        { id: "ness", look: "ness", x: 1.2, z: 7.8, yaw: Math.PI },
        { id: "townswoman", look: "townswoman", x: -1.0, z: 9.4, yaw: Math.PI - 0.3 },
        ...squad,
      ] },
    { id: "village", type: "explore", ...FENS,
      rook: { x: 0.4, z: 5.4, yaw: 0 },
      objective: "The silent town. Find what the Choir nailed up ({n}/{total}).",
      required: ["townswoman", "hymn"], counts: "required",
      cast: [
        { id: "townswoman", look: "townswoman", x: -1.0, z: 9.4, yaw: Math.PI - 0.3, node: "Ep6_Woman" },
        { id: "juno", look: "juno", x: 2.4, z: 7.0, yaw: -0.4 },
      ],
      pickups: [{ id: "hymn", x: 1.6, z: 11.4, node: "Ep6_Hymn", label: "A hymn nailed to the well" }] },
    { id: "choir", type: "fight", ...FENS, wave: ["acolyte", "acolyte", "cantor", "acolyte"], tokens: 2,
      world: { bounds: ZONES.fens.bounds, origin: { x: 8, z: 2 } },
      lines: [["Juno", "There's the choir. Singer first!"], ["Bas", "They're singing our voices. That's not allowed."]],
      retry: "Again. Singer first." },
    { id: "ilse", type: "fight", ...FENS, ...DUSK, wave: ["ilse"], tokens: 2,
      world: { bounds: ZONES.fens.bounds, origin: { x: 15, z: -1 } },
      tutorial: [{ at: 0.5, text: "BOSS 3 · DEACON ILSE MARROWIND. Silence magic: when the hymn takes your voice, your spells won't come. Keep hitting." }],
      lines: [["Cal", "Mind the Deacon's hands. That's where the hush comes from."], ["Juno", "Shut her up. Politely."]],
      eventHints: { // §16 B3: the choir pit, and her last hymn
        pitHide: "She's gone down into the choir pit, out of reach. Her acolytes keep her there: put them down and she has to climb out.",
        unsingingBegin: "She's singing the whole town's memory of her away. All of it. Hold on to your grimoire.",
        grimoireResists: "Your grimoire won't let her. The song broke on your page, and so did she: finish it!",
      },
      retry: "Again. Sing over her.",
      set: { ILSE_DEFEATED: 1 }, add: { RENOWN_FENS: 4 } }, // a town remembers you (§16 B3)
    { id: "vision", type: "scene", node: "Ep6_Vision", ...FENS, ...DUSK,
      rook: { x: 12.4, z: -2.4, yaw: 0.5 },
      cast: [{ id: "hesper", look: "hesper", x: 14.4, z: 0.6, yaw: Math.PI + 0.6 }] },
    { id: "road", type: "scene", node: "Ep6_Road", ...FENS, ...DUSK,
      rook: { x: 0.4, z: 0.4, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: -1.2, z: 2.4, yaw: 0.5 },
        { id: "cal", look: "cal", x: 1.4, z: 2.6, yaw: -0.6 },
        { id: "bas", look: "bas", x: 3.6, z: 5.4, yaw: -0.8 },
        { id: "ness", look: "ness", x: 4.8, z: 6.6, yaw: -2.4 },
      ],
      set: { EP6_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep7",
      lines: [
        "Next time on UNWRITTEN:",
        "Festival prep at the Lighthouse. A song nobody can stop Tamsin singing.",
        "And a cheap brass key, as a joke.",
      ] },
  ],
};
