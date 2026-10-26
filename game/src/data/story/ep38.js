// Episode 38 · The Unanswered Door (GDD §14 Arc 4 finale, §15.7 Encounter V). Further into the Hollow, where nobody
// comes back from, the white took the others too: it's Rook and Severin alone. Doors stand up in the white with other
// places behind them. Then a black tear opens, and the masked knight walks out of it carrying Elodie, asleep, and puts
// her into Rook's arms without a word, and goes. For about a second, in one shot, there's something round his wrist
// under the gauntlet's edge (B6). Juno isn't there to see it. Halvard is waiting at the door when they come out.

import { AFTER_EP37 } from "./arc4.js";
import { OLDCITY_LAYOUT as OC, HOLLOW_LAYOUT as HL } from "../zones.js";

export const EP38_SCRIPT = `
title: Ep38_Further
---
<<shot wide>>
Further in, the white is different. Quieter, and the floor gives a little underfoot, like snow. The others are gone.
<<shot on Severin>>
Severin: Dagrun? Juno? ...They were right behind us.
<<shot on Severin>>
Severin: Elodie came this way. I'd know. I'd know if she hadn't.
<<shot two Severin Rook>>
-> "Then we keep going." #bold
    Severin: We keep going.
-> "Stay where I can see you." #earnest
    Severin: You too. I mean it. I'm not losing anybody else in here.
===

title: Ep38_Severin
---
Severin: Aurek came into the Hollowmarch after something, six years ago, and didn't come out. I used to think about where he went.
Severin: I think it was here. I think he walked about in the white until he forgot which door he came in by.
===

title: Ep38_Door1
---
You open the door. Behind it, the Lighthouse kitchen at suppertime, the table set for seven. Nobody's there. The soup's still hot.
You close it.
<<set $HOLLOW_DOOR_1 to 1>>
===

title: Ep38_Door2
---
You open the door. Behind it, a plain of black stone under a red sky, and far off, rows and rows of something standing very still, like a field of spears.
Something in the nearest row turns its head.
You close it, fast.
<<set $HOLLOW_DOOR_2 to 1>>
===

title: Ep38_Door3
---
You open the door. Behind it, rain on a doorstep at night, and a basket on the step, and somebody's footsteps going away.
You know that door. You close it very gently.
<<set $HOLLOW_DOOR_3 to 1>>
===

title: Ep38_Arms
---
<<pose Rook cross>>
<<shot two Rook Severin>>
You're holding Elodie. She's asleep, and warm, and much lighter than you expected.
<<shot on Severin>>
Severin: Aurek... Aurek!
<<shot wide>>
But the tear has closed, and there's nothing in the white where he was.
<<shot on Severin>>
Severin: He gave her to you. Not to me. To you.
<<shot two Severin Rook>>
-> "I don't know why." #earnest
    Severin: Neither do I. ...Thank you for catching her.
-> "Maybe because you'd have gone after him." #wry
    Severin: ...I would have.
<<show Juno>>
<<show Dagrun>>
<<show Lio>>
<<shot wide>>
Footsteps in the white, running: Juno, then Dagrun, then Lio, out of nowhere, as if a door had let them go.
<<shot on Juno>>
Juno: Is she...?
<<shot on Severin>>
Severin: Asleep. She's asleep.
<<shot on Juno>>
Juno: What happened?
<<shot on Severin>>
Severin: He walked out of a black tear with her in his arms, and he gave her to Rook, and he left.
<<shot on Juno>>
Juno: ...He gave her to Rook.
<<shot on Dagrun>>
Dagrun: Later. Out. Now.
<<set $SABLE_ENCOUNTER to 5>>
<<set $ELODIE_HOME to 1>>
===

title: Ep38_Out
---
<<pose Severin cross>>
<<cue doorShut>>
<<shot wide>>
The door under the Lowmarket lets them out one at a time, and shuts behind the last of them, and the humming stops.
<<shot on Halvard>>
Halvard: Six went in. Six came out. And one more.
<<shot on Elodie>>
Elodie wakes up in Severin's arms and looks at the stone ceiling for a long time.
Elodie: Somebody carried me. It was like being carried home when you're small and you've fallen asleep somewhere, and you pretend you're still asleep so they'll keep carrying you.
<<shot on Severin>>
Severin: That was him. That was Aurek.
<<shot on Lio>>
Lio is looking at the door, not at any of them.
Lio: The door wanted her because she has no grimoire. Nothing written on her. Something in there wants a page it can write on.
===

title: Ep38_Roof
---
<<shot wide>>
Night on the Lighthouse roof. The lamp turning, the dry sea silver under it, and the city lit up on the horizon.
<<shot on Severin>>
Severin: He stopped when I said his name. He carried her out for you. Whoever he is, he's watching over us.
<<shot on Severin>>
Severin: My brother used to watch over me like that. From a distance, so I wouldn't notice. I always noticed.
<<shot two Severin Rook>>
-> "Then we'll find him." #earnest
    Severin: Yes. And then I'm going to hit him, and then I'm going to ask him where he's been.
-> "And if it isn't him?" #wry
    Severin: Then someone else loves my sister enough to walk into the Hollow for her. I'll take that too.
<<set $ARC4_DONE to 1>>
===

title: Ep38_Survey
---
<<survey arc4>>
===
`;

const OLD = { stage: "oldcity" }, HO = { stage: "hollow" }, LH = { stage: "lighthouse" };
const D = OC.door, [, , [dx3, dz3], [dx2, dz2], [dx1, dz1]] = HL.doors;

export const EPISODE_38 = {
  id: "ep38",
  number: 38,
  unlockAt: 5,
  setup: { ...AFTER_EP37 },
  title: "The Unanswered Door",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: false },
  beats: [
    { id: "further", type: "scene", node: "Ep38_Further", ...HO,
      rook: { x: 0, z: -12, yaw: 0 },
      cast: [{ id: "severin", look: "severin", x: -1.6, z: -11.2, yaw: 0.4 }] },
    { id: "title", type: "title" },
    { id: "doors", type: "explore", ...HO,
      rook: { x: 0, z: -12, yaw: 0 },
      objective: "Find Elodie, or a way out. Try the doors ({n}/{total}).",
      required: ["door1", "door2", "door3"], counts: "required",
      cast: [{ id: "severin", look: "severin", x: -1.8, z: -11.0, yaw: 0.4, node: "Ep38_Severin" }],
      pickups: [
        { id: "door1", x: dx1 + 1.2, z: dz1 - 0.6, marker: false, node: "Ep38_Door1", label: "Open the door" },
        { id: "door2", x: dx2 - 1.2, z: dz2 - 0.4, marker: false, node: "Ep38_Door2", label: "Open the door" },
        { id: "door3", x: dx3 + 1.2, z: dz3 - 0.4, marker: false, node: "Ep38_Door3", label: "Open the door" },
      ],
      encounters: [
        { id: "shells", rect: [-8, -4, 8, 4], at: { x: 0, z: 0, r: 4 }, wave: ["shell", "shell", "shell"], flag: "EP38_SHELLS", label: "EMPTY ARMOR" },
      ] },
    { id: "carried", type: "cutscene", cutscene: "ep38_carried", set: { CLUE_B6: 1 } },
    { id: "arms", type: "scene", node: "Ep38_Arms", ...HO,
      rook: { x: 0, z: -2, yaw: 0 },
      cast: [
        { id: "elodie", look: "elodie", x: 0, z: -1.58, y: 0.72, yaw: Math.PI / 2, down: true }, // in Rook's arms
        { id: "severin", look: "severin", x: -2.0, z: -1.0, yaw: 0.9 },
        { id: "juno", look: "juno", x: 2.6, z: -4.4, yaw: -0.6, hidden: true },
        { id: "dagrun", look: "dagrun", x: 1.0, z: -5.4, yaw: -0.2, hidden: true },
        { id: "lio", look: "lio", x: -1.4, z: -4.8, yaw: 0.3, hidden: true },
      ] },
    { id: "out", type: "scene", node: "Ep38_Out", ...OLD,
      rook: { x: 1.6, z: 9.2, yaw: Math.PI },
      cast: [
        { id: "halvard", look: "halvardFace", x: 0.6, z: 5.4, yaw: 0 },
        { id: "severin", look: "severin", x: -1.2, z: 9.8, yaw: Math.PI },
        { id: "elodie", look: "elodie", x: -1.2, z: 9.38, y: 0.72, yaw: Math.PI / 2, down: true }, // in his arms
        { id: "lio", look: "lio", x: 0.6, z: D.z - 2.4, yaw: 0 },
        { id: "juno", look: "juno", x: 3.4, z: 8.4, yaw: -2.6 },
        { id: "dagrun", look: "dagrun", x: -3.4, z: 8.0, yaw: 2.6 },
      ] },
    { id: "roof", type: "scene", node: "Ep38_Roof", ...LH, sky: { daylight: 0.05 },
      rook: { x: 2.6, z: 9.6, yaw: Math.PI },
      cast: [{ id: "severin", look: "severin", x: 1.0, z: 9.8, yaw: Math.PI * 0.8 }] },
    { id: "survey", type: "scene", node: "Ep38_Survey", ...LH, rook: null, cast: [],
      set: { EP38_DONE: 1, ARC4_DONE: 1 } },
    { id: "preview", type: "preview", next: "Arc 5 · Writ of Return",
      lines: [
        "Next on UNWRITTEN:",
        "The Paragon left a key for every door he ever closed. Hesper Voss wants the last one.",
        "And the masked knight is already looking for it.",
      ] },
  ],
};
