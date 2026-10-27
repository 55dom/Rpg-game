// Episode 45 · Eve (GDD §14 Arc 5). The night before the Founding. In Aurelin, Halvard tells the Chancellor where the
// Lances will be at noon, and doesn't say where he'll be. At the Lighthouse, lanterns in every window: an evening with
// each of the squad (Juno hanging lanterns on the rail, Bas with the brace off, Lio and Mother Vey's lantern, Dagrun on
// the porch, Severin and Elodie). The line on Elodie's wrist has gone faint, like ink that's being read. On the roof,
// with the whole city lit up across the dry sea, Elodie hears it: a knock, from the other side.

import { AFTER_EP44 } from "./arc5.js";

export const EP45_SCRIPT = `
title: Ep45_Cold
---
<<shot wide>>
Aurelin, the night before the Founding. Lanterns strung across every street, and in the empty plaza under the Hall of Lanterns, the Chancellor and his Lance-Commander.
<<shot on Aldric>>
Aldric: The Lances will be on the Archive steps at noon, Commander. In their best. The Crown likes a show.
<<shot on Halvard>>
Halvard: The Lances will be on the steps at noon, my lord.
<<shot on Aldric>>
Aldric: And you?
<<shot on Halvard>>
Halvard: I'll be where I'm needed.
===

title: Ep45_Juno
---
<<shot on Juno>>
Juno: Hold the ladder. No, hold it. Holding means not letting go of it, {name}.
<<shot on Juno>>
Juno: One in every window, for the Founding. One for each of us. I made an extra. I always make an extra. Don't ask who it's for. It's for whoever.
<<shot two Juno Rook>>
-> "It's for whoever." #earnest
    Juno: ...Yes. Thank you.
-> "You missed a window." #wry
    Juno: I did not. ...I did. Hand me that one.
===

title: Ep45_Bas
---
Bas: Brace is off. Look. All five fingers. I can hold a fork and a sword at the same time, if the occasion calls for it.
Bas: He could have taken the arm off, in the vault. He didn't. I've been thinking about that for a long time and I still don't know what to do with it.
===

title: Ep45_Lio
---
Lio: The Keeper sent this. Mother Vey's lantern. He said a Choir lantern belongs with whoever she taught to read.
Lio: I crossed every seven in the Archive ledger. Ottoline thinks I'm mad. I think Vey would have laughed.
===

title: Ep45_Dagrun
---
Dagrun: Founding Eve. Every year the old captain lit a lantern on this porch and said, "One more year, and nobody's dead." Some years he was lying.
Dagrun: Tomorrow, you stay with your squad. Whatever comes out of whatever door. You hear me? You stay together.
===

title: Ep45_Severin
---
<<shot on Severin>>
Severin: Look at her wrist.
<<shot on Elodie>>
The line Rook wrote is still there, on the inside of her wrist. But it's faint now, grey as pencil, as if something's been reading it over and over, and wearing it thin.
<<shot on Elodie>>
Elodie: It doesn't hurt. It just feels like being looked at.
<<shot on Severin>>
Severin: Write it again. Darker. Can you?
<<shot two Severin Rook>>
-> "I'll try." #earnest
    Rook opens the grimoire to the margin and writes the line again, over the first. It holds for a moment, black as fresh ink. Then it fades back to grey.
-> "I don't think it works like that." #wry
    Severin: Then how does it work? ...Sorry. I know. Nobody knows.
<<set $CLAUSE_FADING to 1>>
===

title: Ep45_Roof
---
<<shot wide>>
The Lighthouse roof, late. The whole squad, and Elodie wrapped in a blanket between Severin and Juno. Across the dry sea, Aurelin is lit up from one wall to the other.
<<shot on Dagrun>>
Dagrun: To the Lanterns.
<<shot on Juno>>
Juno: To the Lanterns. And whoever.
<<shot on Elodie>>
Elodie: ...Shh.
<<shot on Elodie>>
Elodie: Can you hear it?
<<shot on Severin>>
Severin: The drums?
<<shot on Elodie>>
Elodie: No. Somebody's knocking. From the other side.
<<set $KNOCK_HEARD to 1>>
===
`;

const AU = { stage: "aurelin" }, LH = { stage: "lighthouse" };
const EVE = { sky: { daylight: 0.18 } }, NIGHT = { sky: { daylight: 0.05 } };
const SEAT = { x: -3.4, z: 9.4 }, TABLE = { x: 5, z: 6 };

export const EPISODE_45 = {
  id: "ep45",
  number: 45,
  unlockAt: 5,
  setup: { ...AFTER_EP44 },
  title: "Eve",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep45_Cold", ...AU, ...NIGHT, rook: null,
      cast: [
        { id: "aldric", look: "aldric", x: -0.8, z: 14.4, yaw: 0.9 },
        { id: "halvard", look: "halvardFace", x: 1.2, z: 15.6, yaw: -2.2 },
      ] },
    { id: "title", type: "title" },
    { id: "evening", type: "explore", ...LH, ...EVE,
      rook: { x: 0, z: -4, yaw: 0 },
      objective: "Founding Eve at the Lighthouse. Spend a moment with each of them ({n}/{total}).",
      required: ["juno", "bas", "lio", "dagrun", "severin"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 6.4, z: -1.6, yaw: -1.2, node: "Ep45_Juno" },
        { id: "bas", look: "bas", x: -5.6, z: -2.6, yaw: 0.6, node: "Ep45_Bas" },
        { id: "lio", look: "lio", x: 2.2, z: 3.2, yaw: 0.6, node: "Ep45_Lio" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "Ep45_Dagrun" },
        { id: "severin", look: "severin", x: SEAT.x + 1.4, z: SEAT.z - 0.8, yaw: -1.46, node: "Ep45_Severin" },
        { id: "elodie", look: "elodie", x: SEAT.x, z: SEAT.z, yaw: Math.PI * 0.85 },
      ] },
    { id: "roof", type: "scene", node: "Ep45_Roof", ...LH, ...NIGHT,
      rook: { x: 2.6, z: 9.6, yaw: Math.PI },
      cast: [
        { id: "elodie", look: "elodie", x: 0.4, z: 9.0, yaw: Math.PI * 0.85 },
        { id: "severin", look: "severin", x: -1.0, z: 9.8, yaw: Math.PI * 0.8 },
        { id: "juno", look: "juno", x: 1.6, z: 7.8, yaw: -2.6 },
        { id: "dagrun", look: "dagrun", x: -2.4, z: 7.6, yaw: 2.4 },
      ],
      set: { EP45_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep46",
      lines: [
        "Next time on UNWRITTEN:",
        "The Founding. The Paragon on the Archive steps, and the whole city in the streets.",
        "And a door that opens from the other side.",
      ] },
  ],
};
