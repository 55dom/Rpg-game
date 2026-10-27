// Episode 48 · The Other Side of the Door (GDD §15.8, Phases 3–5 and the fight's first three phases; §15.11: the title
// is set). This file lives in src/reveal/, the one folder allowed to name him.
//
// Rook and the masked knight on the Lowmarket Bridge: the third full duel. He can't be worn down; break his guard and
// Underline it (the Inscription finisher), and the mask cracks. A memory, under the glaive, with a few seconds to find
// it: what Rook says depends on what Rook has seen. He answers with something only one person could know, and laughs,
// once. A war-horn through the Gate; a second wave; the two of them turn on each other one last time, the Clash, and the
// face in the smoke (the storyboard, cut for cut). "Told you not to wait up." Then the fight: the companion's kit used
// against you, the evolution, what he actually is; and at the end of it, Larkspur. "You really want to know?"

import { AFTER_EP47 } from "../data/story/arc5.js";
import { ZONES, BRIDGE_LAYOUT as L } from "../data/zones.js";

export const EP48_SCRIPT = `
title: Ep48_Cold
---
<<shot wide>>
The Lowmarket Bridge, littered with plate that isn't moving. Smoke going up on both banks. The masked knight with his glaive held low, and between him and the hill, Rook.
<<shot on Juno>>
Juno: {name}! Get out of his way!
<<shot on Dagrun>>
Dagrun: Let them. There are still people coming over that bridge, and soldiers coming after them. That's ours.
<<shot on Masked>>
His head tilts, a little, the way it does. Then the glaive comes up.
===

title: Ep48_Memory
---
<<shot two Rook Masked>>
The mask is cracked from brow to chin. The blood has reached the edge of it. He isn't moving, and the glaive isn't either, and Rook is breathing hard enough to hear, and the whole battle has gone quiet, as if it's very far away.
<<shot on Rook>>
There's something. A thing Rook knows. It's right there.
<<timer 10>>
-> Hold up the brass key. "You still owe me a snack cupboard." <<if $HAS_BRASS_KEY>> #secret
    <<set $MEMORY_LINE to "key">>
    <<shot on Masked>>
    Masked: ...It never had a lock.
-> "Mind the step." <<if $CLUE_B4 and $HEARD_S2>> #secret
    <<set $MEMORY_LINE to "step">>
    <<shot on Masked>>
    Masked: ...Tell Juno the knot held.
-> "Whoever you are, Dagrun still leaves a lantern lit." <<if $SEEN_CAL_LANTERN and $CAL_STATE>> #secret
    <<set $MEMORY_LINE to "lantern">>
    <<shot on Masked>>
    Masked: ...He always did leave the light on.
-> "WHO ARE YOU?!"
    <<set $MEMORY_LINE to "who">>
    <<shot on Rook>>
    And Rook, shaking, pulls the brass key out anyway, and holds it up, without knowing why.
    <<shot on Masked>>
    Masked: ...It never had a lock.
<<shot on Masked>>
And for the first time, his composure breaks. A half-step back. For one syllable, the voice under the mask isn't processed at all.
<<sfx laugh>>
<<shot on Masked>>
And he laughs. Once, quietly. Not at Rook. Like someone who's just been surprised in a game he thought he'd mastered.
<<shot on Rook>>
Rook can't move.
===

title: Ep48_Horn
---
<<sfx warHorn>>
<<shake 0.5>>
<<shot sky -34 44 78>>
A horn, from the other side of the Gate. Long and low. And out of the red, down the hill, the second wave comes on.
<<sfx drums>>
<<shot two Masked Rook>>
He looks at the hill, and then at Rook, and the glaive comes up, and so does the grimoire, and there's nothing left to say.
<<shot two Rook Masked>>
Ink, and black light, and everything either of them has.
<<clash 6>>
===

title: Ep48_Door
---
<<shot on Cal>>
He rolls his shoulders, like he's just woken up.
<<fx door Cal>>
<<shot wide>>
A door opens. A golden one. The first anyone's seen since the Hollowmarch. He steps through it, and out of another, behind Rook.
<<shot on Juno>>
Juno: ...Cal?
<<shot on Cal>>
Cal: Come on. Show me what you learned.
===

title: Ep48_Larkspur
---
<<shot on Cal>>
He stops. Not tired. He just stops, and lets the glaive rest on his shoulder, and looks at Rook, and smiles.
<<shot on Cal>>
Cal: You were lighter than my glaive, you know. That night in Larkspur.
<<shot on Rook>>
Rook has never told anyone the name of that village. Not anyone.
<<shot on Rook>>
Rook: ...What are you?
<<shot on Cal>>
His head tilts. The battle goes on around them, and doesn't touch them. He holds the silence just long enough.
<<shot on Cal>>
Cal: You really want to know?
<<set $LARKSPUR_SAID to 1>>
===
`;

const BR = { stage: "bridge" };
const ROOK = { x: 0, z: 2.4 }, HIM = { x: 0, z: 5.4 }; // as in the cutscenes (src/reveal/cutscenes.js)
const DUEL = { bounds: ZONES.bridge.bounds, origin: { x: 0, z: -2 } };
const squad = [
  { id: "juno", look: "juno", x: -2.0, z: -4.4, yaw: 0.3 },
  { id: "dagrun", look: "dagrun", x: 3.2, z: -3.0, yaw: -0.3 },
  { id: "bas", look: "bas", x: 1.4, z: -4.6, yaw: -0.1 },
];

export const EPISODE_48 = {
  id: "ep48",
  number: 48,
  unlockAt: 5,
  setup: { ...AFTER_EP47 },
  title: "The Other Side of the Door",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep48_Cold", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "masked", look: "masked", x: HIM.x, z: HIM.z, yaw: Math.PI }, ...squad] },
    { id: "title", type: "title" },
    { id: "duel", type: "fight", ...BR, wave: ["maskFinal"], tokens: 2,
      world: { companions: false, ...DUEL }, endOn: "underline",
      tutorial: [
        { at: 0.5, text: "The third duel. You know him now: the blink to your left, the floor, the Draw, the Ring. He can't be worn down. Break his guard." },
        { at: 14, text: "When his guard breaks: HEAVY, on him. The Inscription finisher. Underline it." },
      ],
      eventHints: {
        postureBreak: "His guard's broken. HEAVY, now: Underline.",
        severExposed: "The seam behind him is still open. He's exposed: hit him now.",
        severRain: "Tears in the air round you, and the glaive comes out of each. Keep moving.",
        drawMark: "A tear under your feet, and another in front of him. Step off it.",
      },
      lines: [["Rook", "Not another step."]],
      retry: "Up. He's still between you and the Archive." },
    { id: "crack", type: "cutscene", cutscene: "ep48_crack", set: { MASK_CRACKED: 1 } },
    { id: "memory", type: "scene", node: "Ep48_Memory", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "masked", look: "maskCracked", x: HIM.x, z: HIM.z, yaw: Math.PI }] },
    { id: "horn", type: "scene", node: "Ep48_Horn", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "masked", look: "maskCracked", x: HIM.x, z: HIM.z, yaw: Math.PI }] },
    { id: "face", type: "cutscene", cutscene: "ep48_face", set: { CAL_IDENTITY_REVEALED: 1 } },
    { id: "door", type: "scene", node: "Ep48_Door", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "cal", look: "unmasked", x: 0, z: 6.2, yaw: Math.PI }, ...squad] },
    { id: "fight", type: "fight", ...BR, wave: ["unmasked"], tokens: 2,
      world: { ...DUEL }, endOn: "larkspur",
      tutorial: [
        { at: 0.5, text: "He fights the way he fought beside you: golden doors, the saber, the Drop that used to juggle enemies for you, the swap that used to save you. Now they're for you." },
      ],
      eventHints: {
        doorSwap: "The door-swap: you're where he was, and the cut's already coming. Dodge.",
        evolve: "His doors are going black. He was holding back. The whole time.",
        scramble: "Everyone, somewhere else on the bridge. Get back together.",
        godfall: "Left, left, back: GODFALL. A cut down the whole bridge. Get out of the line.",
        regen: "He heals when nobody's touching him. Stay on him.",
      },
      lines: [["Juno", "Cal! CAL! What are you doing?!"], ["Bas", "Juno, he's not stopping. Fight!"]],
      retry: "Up. He's waiting. He's smiling." },
    { id: "larkspur", type: "scene", node: "Ep48_Larkspur", ...BR,
      rook: { x: ROOK.x, z: ROOK.z, yaw: 0 },
      cast: [{ id: "cal", look: "unmasked", x: 0, z: 6.2, yaw: Math.PI }, ...squad],
      set: { EP48_DONE: 1, CAL_IDENTITY_REVEALED: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep49",
      lines: [
        "Next time on UNWRITTEN:",
        "In there, an hour. Out here, a breath.",
      ] },
  ],
};
