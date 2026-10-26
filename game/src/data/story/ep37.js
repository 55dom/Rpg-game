// Episode 37 · The Hollow (GDD §14 Arc 4). Elodie's footprints stop thirty paces from the Lighthouse door. The doors
// that come on their own are the Hollow's, and the door under the Lowmarket is the one that's always there: Halvard
// stands down his own guard, Lio asks the door the word under the Paragon's sun, and the Lanterns go through. The
// Hollow is a white nowhere (the `hollow` set): paper underfoot, holes where the floor isn't, doors standing up on their
// own. Elodie's voice from nowhere leads to the middle of it, where she sleeps in a column of light and the thing that
// keeps the Hollow blank stands guard. Boss 13, the Eraser. When it comes apart, the light goes out, and the white
// opens under her and takes her further in.

import { AFTER_EP36 } from "./arc4.js";
import { ZONES, OLDCITY_LAYOUT as OC, HOLLOW_LAYOUT as HL } from "../zones.js";

export const EP37_SCRIPT = `
title: Ep37_Prints
---
<<shot wide>>
Dawn on the dry sea. Elodie's footprints go thirty paces from the Lighthouse door, and stop.
<<shot on Severin>>
Severin: She said "I'm coming." Who says that to a door?
<<shot on Lio>>
Lio: The Hollow. Doors that come on their own are the Hollow's doors. And the one under the Lowmarket is the door that's always there.
<<shot on Dagrun>>
Dagrun: Then that's where we go in. Bas, you've got the Lighthouse. Don't argue.
<<shot on Bas>>
Bas: I wasn't going to. ...Bring her back.
===

title: Ep37_Door
---
<<shot wide>>
The plaza in front of the door. Halvard is there before them, without his helm, and two Lances with him.
<<shot on Halvard>>
Halvard: The Chancellor has the door under guard. I am the guard. ...Lances, go and get some breakfast. That's an order.
<<hide lance1>>
<<hide lance2>>
<<shot on Halvard>>
Halvard: I'd come with you, but somebody has to be standing here when you come out. And somebody has to stop the next fool going in after you.
<<shot on Severin>>
Severin: Thank you, Commander.
<<shot on Halvard>>
Halvard: Don't. I lost a duel. I'm allowed to be sentimental for a day.
<<shot on Lio>>
Lio: The word under the Paragon's sun. I couldn't read it yesterday. It isn't a word you read. It's one you're asked.
<<sfx hum>>
<<cue doorOpen>>
<<shot wide>>
Lio puts his hand on the stone and says something under his breath. The crack in the door widens until there's room for a person to walk through it, and beyond it, there's nothing but white.
<<shot on Dagrun>>
Dagrun: Lanterns. In.
===

title: Ep37_Echo1
---
From nowhere, very close, Elodie's voice.
Elodie: It's very quiet here. I like it. Nobody needs anything.
<<set $ECHO_1 to 1>>
===

title: Ep37_Echo2
---
Elodie's voice again, from somewhere further in.
Elodie: There's a man made of paper. He keeps rubbing me out. It doesn't hurt. It's like being tidied away.
<<set $ECHO_2 to 1>>
===

title: Ep37_Echo3
---
Elodie's voice, and this time it sounds worried.
Elodie: Sev? Is that you? Don't come here. He'll rub you out too.
<<set $ECHO_3 to 1>>
===

title: Ep37_Juno
---
Juno: Everything's white. I keep looking for a shadow and there isn't one. Not even mine.
===

title: Ep37_Lio
---
Lio: The Choir thought the Hollow was a room. It isn't a room. It's the space between rooms, where the doors go when they aren't anywhere.
===

title: Ep37_Keeper
---
<<shot wide>>
In the middle of the white, a column of pale light, and Elodie asleep inside it, a hand's breadth off the floor.
<<shot on eraser>>
In front of it stands something tall, and white, and faceless, made of paper with nothing written on it. Its long arms hang to its knees.
<<shot on Severin>>
Severin: Give her back.
<<shot on Juno>>
Juno: It's not going to answer you, Severin. It hasn't got a mouth.
<<shot two Rook eraser>>
-> "Then we take her." #bold
    Severin: Yes.
-> "Stay behind me, Severin." #earnest
    Severin: Not this time.
===

title: Ep37_Pages
---
<<shot wide>>
The Eraser comes apart into blank pages, thousands of them, and they fall like snow and are gone before they touch the floor.
<<cue pillarOff>>
<<shot on Elodie>>
The column of light goes out, and Elodie drops, and the white under her opens like water.
<<hide Elodie>>
<<shot on Severin>>
Severin: Elodie! ELODIE!
<<shot on Dagrun>>
Dagrun has him by the back of his coat before he can follow her.
Dagrun: If you go through that, you don't come back. Nobody comes back from further in.
<<shot on Severin>>
Severin: She did. She's further in, and she's alive. She has to be.
<<set $ERASER_DEFEATED to 1>>
===
`;

const LH = { stage: "lighthouse" }, OLD = { stage: "oldcity" }, HO = { stage: "hollow" };
const D = OC.door, PIL = HL.pillar;

export const EPISODE_37 = {
  id: "ep37",
  number: 37,
  unlockAt: 5,
  setup: { ...AFTER_EP36 },
  title: "The Hollow",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["juno"] },
  beats: [
    { id: "prints", type: "scene", node: "Ep37_Prints", ...LH, sky: { daylight: 0.25 },
      rook: { x: 2.2, z: -5.2, yaw: Math.PI },
      cast: [
        { id: "severin", look: "severin", x: 0.6, z: -7.6, yaw: Math.PI },
        { id: "lio", look: "lio", x: 3.6, z: -7.2, yaw: -2.4 },
        { id: "dagrun", look: "dagrun", x: -1.6, z: -5.6, yaw: 2.6 },
        { id: "bas", look: "basSling", x: -0.4, z: -3.8, yaw: Math.PI },
        { id: "juno", look: "juno", x: 4.0, z: -4.8, yaw: -2.6 },
      ] },
    { id: "title", type: "title" },
    { id: "door", type: "scene", node: "Ep37_Door", ...OLD,
      rook: { x: 0, z: 4.6, yaw: 0 },
      cast: [
        { id: "halvard", look: "halvardFace", x: 0.8, z: 9.6, yaw: Math.PI },
        { id: "lance1", look: "lance", x: -3.0, z: 10.6, yaw: Math.PI },
        { id: "lance2", look: "lance", x: 3.4, z: 10.4, yaw: Math.PI },
        { id: "severin", look: "severin", x: -1.7, z: 5.2, yaw: 0.2 },
        { id: "juno", look: "juno", x: 1.9, z: 4.8, yaw: -0.2 },
        { id: "lio", look: "lio", x: -0.6, z: 7.0, yaw: 0 },
        { id: "dagrun", look: "dagrun", x: 3.6, z: 3.2, yaw: -0.4 },
      ] },
    { id: "white", type: "explore", ...HO,
      rook: { x: 0, z: -22, yaw: 0 },
      objective: "Find Elodie in the white. Follow her voice ({n}/{total}).",
      required: ["echo1", "echo2", "echo3"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 2.4, z: -20.6, yaw: -0.4, node: "Ep37_Juno" },
        { id: "lio", look: "lio", x: -2.6, z: -20.2, yaw: 0.4, node: "Ep37_Lio" },
      ],
      pickups: [
        { id: "echo1", x: -9.0, z: -9.0, node: "Ep37_Echo1", label: "Listen" },
        { id: "echo2", x: 10.0, z: -3.0, node: "Ep37_Echo2", label: "Listen" },
        { id: "echo3", x: -4.0, z: 8.0, node: "Ep37_Echo3", label: "Listen" },
      ],
      encounters: [
        { id: "shells", rect: [-8, -6, 8, 2], at: { x: 0, z: -2, r: 4 }, wave: ["shell", "shell"], flag: "EP37_SHELLS", label: "EMPTY ARMOR" },
      ] },
    { id: "keeper", type: "scene", node: "Ep37_Keeper", ...HO,
      rook: { x: 0.4, z: 1.6, yaw: 0 },
      cast: [
        { id: "elodie", look: "elodie", x: PIL.x, z: PIL.z, y: 0.3, yaw: Math.PI },
        { id: "eraser", look: "eraser", x: 0, z: 9.4, yaw: Math.PI },
        { id: "severin", look: "severin", x: -1.8, z: 2.2, yaw: 0.2 },
        { id: "juno", look: "juno", x: 2.4, z: 1.2, yaw: -0.3 },
        { id: "dagrun", look: "dagrun", x: -3.6, z: 0.6, yaw: 0.4 },
      ] },
    { id: "eraser", type: "fight", ...HO, wave: ["eraser"], tokens: 2,
      world: { bounds: ZONES.hollow.bounds },
      tutorial: [
        { at: 0.5, text: "Its Swipe is close. A red glint is the long Reach: it can't be blocked. A pale ring in front of it is the Blank: get out of it, or lose your mana and your Surge." },
      ],
      eventHints: {
        unwrite: "The floor's going blank in patches under you. Step off a pale patch before it opens.",
        erasure: "A wall of blank is rolling out of it. Jump it.",
      },
      lines: [["Juno", "Don't let it touch you. Whatever it touches, it rubs out."], ["Severin", "Elodie, hold on!"]],
      retry: "Up. She's right there." },
    { id: "pages", type: "scene", node: "Ep37_Pages", ...HO,
      rook: { x: 0.4, z: 9.0, yaw: 0 },
      cast: [
        { id: "elodie", look: "elodie", x: PIL.x, z: PIL.z, y: 0.3, yaw: Math.PI },
        { id: "severin", look: "severin", x: -1.6, z: 11.2, yaw: 0.2 },
        { id: "dagrun", look: "dagrun", x: -2.8, z: 10.0, yaw: 0.5 },
        { id: "juno", look: "juno", x: 2.4, z: 9.8, yaw: -0.4 },
      ],
      set: { EP37_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep38",
      lines: [
        "Next time on UNWRITTEN:",
        "Further in, where nobody comes back from.",
        "Somebody does.",
      ] },
  ],
};
