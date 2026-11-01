// Episode 17 · The Hollowmarch (GDD §14 Arc 2; §15.5 D8, A3).
//
// The forbidden land past the northern border, after the Choir. Grey ground that's almost white, mist, bare white trees.
// The brass key is warm in Rook's pocket; so is every buckle and coin out here (A3). Armoured husks in the grass, dark red
// and black plate nobody in Liraen has ever made; Cal kneels by one, closes its visor, and murmurs "Rest, soldier." (D8).
// At the ring of standing stones Hesper Voss begins the Hollow Bloom, and the first pulse throws the squad apart.

import { AFTER_EP16 } from "./arc12.js";
import { ZONES, HOLLOWMARCH_LAYOUT as H } from "../zones.js";

export const EP17_SCRIPT = `
title: Ep17_Edge
---
<<shot wide>>
The northern border. Past the last marker stone, the ground goes grey, and then almost white, and the mist starts, and the trees stop having bark.
<<shot on Dagrun>>
Dagrun: Nobody goes in. Everybody knows that. Here we go.
<<shot on Dagrun>>
Dagrun: Stay together. If you lose sight of each other, stand still and shout. Don't wander. The Hollowmarch likes wanderers.
<<shot on Rook>>
The brass key in your pocket is warm. So is the buckle on your belt, and the coins in your purse, and the blade at your hip. Everything metal out here runs warm.
<<set $CLUE_A3 to 1>>
<<shot on Lio>>
Lio: The old accounts say that. Metal goes warm near the Gate. Nobody knows why.
===

title: Ep17_Husk
---
<<shot on Rook>>
In the pale grass, half sunk, a suit of armour: old plate the colour of dried blood, black at the edges, a smooth faceplate with a single slit for eyes. Empty. There are more of them, further in, all lying the same way, as if they fell from somewhere.
<<shot on Bas>>
Bas: Nobody makes armour like that. Not the Wardens, not the Lances. Not anyone.
<<shot on Cal>>
Cal kneels beside the nearest one. He reaches out and closes its visor, gently, the way you'd close someone's eyes.
<<shot on Cal>>
Cal: Rest, soldier.
<<set $CLUE_D8 to 1>>
<<shot on Juno>>
Juno: …You knew them?
<<shot on Cal>>
Cal: It's what you say to the fallen. Knights say it. Didn't they teach you that? Terrible school.
===

title: Ep17_Tracks
---
<<shot on Rook>>
Footprints in the white dust, dozens of them, all heading north toward the standing stones. Robes dragged. Somebody carrying something heavy enough to leave a groove.
===

title: Ep17_Bloom
---
<<shot wide>>
The ring of standing stones, and at its centre a pale light coming up out of the ground. Hesper Voss stands in it with her arms open, and the choir round her singing, and something in the light is growing.
<<shot on Hesper>>
Hesper: The Lanterns. Of course. Come and watch, one-page. This is what a page looks like when nobody's written on it.
<<shot on Hesper>>
Hesper: Bloom.
<<sfx slam>>
<<shot wide>>
The light goes white, all at once, and a ring of nothing goes out from it across the grey, and when you can see again, you're on your back in the grass, alone, and the stones are a long way off.
<<set $SQUAD_SPLIT to 1>>
===

title: Ep17_Regroup
---
<<shot wide>>
One by one they find you, out of the mist, shouting, the way Dagrun said: Bas with a cut over his eye, Juno with her thread out, Lio white as the ground. Cal last, walking, not hurrying.
<<shot on Cal>>
Cal: There you are. You wandered. He told you not to wander.
<<shot on Cal>>
He looks north at the stones. The light there isn't white any more. It's bigger.
<<shot on Cal>>
Cal: Stay behind me this time, kid. I mean it.
<<set $EP17_DONE to 1>>
===
`;

const HM = { stage: "hollowmarch" }, G = H.gate;
// The husks: lying in the grass all the same way, as if they fell from somewhere.
const husks = [[-3.4, -6.4, 0.4], [-1.2, -4.6, 0.3], [2.6, -7.0, 0.5], [4.2, -3.6, 0.2]].map(([x, z, yaw], i) => ({ id: `husk${i}`, look: "husk", x, z, yaw, down: true }));

export const EPISODE_17 = {
  id: "ep17",
  number: 17,
  setup: { ...AFTER_EP16 },
  title: "The Hollowmarch",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "edge", type: "scene", node: "Ep17_Edge", ...HM,
      rook: { x: 0, z: -19, yaw: 0 },
      cast: [
        { id: "dagrun", look: "dagrun", x: 0.6, z: -16.6, yaw: Math.PI },
        { id: "lio", look: "lio", x: -2.0, z: -18.0, yaw: 0.6 },
        { id: "juno", look: "juno", x: 2.2, z: -18.4, yaw: -0.6 },
        { id: "cal", look: "cal", x: -1.6, z: -20.6, yaw: 0.3 },
      ] },
    { id: "march", type: "explore", ...HM,
      rook: { x: 0, z: -15, yaw: 0 },
      objective: "Into the Hollowmarch. The armour in the grass, and the Choir's tracks ({n}/{total}).",
      required: ["husk", "tracks"], counts: "required",
      cast: [
        ...husks,
        { id: "cal", look: "cal", x: -0.2, z: -8.2, yaw: 0.6 },
        { id: "bas", look: "bas", x: 1.6, z: -9.6, yaw: 0.2 },
        { id: "juno", look: "juno", x: -2.6, z: -9.4, yaw: 0.4 },
      ],
      pickups: [
        { id: "husk", x: -1.8, z: -6.2, node: "Ep17_Husk", label: "Armour in the grass" },
        { id: "tracks", x: 1.0, z: 0.4, node: "Ep17_Tracks", label: "Footprints" },
      ] },
    { id: "choir", type: "fight", ...HM, wave: ["acolyte", "acolyte", "shell", "cantor"], tokens: 2,
      world: { bounds: ZONES.hollowmarch.bounds, origin: { x: 0, z: 0 } },
      lines: [["Juno", "Choir! And something with them. Empty armour, walking!"], ["Dagrun", "Together! Don't wander!"]],
      retry: "Again. Together." },
    { id: "bloom", type: "scene", node: "Ep17_Bloom", ...HM,
      rook: { x: 0, z: 4.0, yaw: 0 },
      cast: [
        { id: "hesper", look: "hesper", x: G.x, z: G.z - 2.4, yaw: Math.PI },
        { id: "a1", look: "acolyte", x: G.x - 2.6, z: G.z - 1.2, yaw: Math.PI + 0.6 },
        { id: "a2", look: "acolyte", x: G.x + 2.6, z: G.z - 1.2, yaw: Math.PI - 0.6 },
        { id: "cal", look: "cal", x: 1.6, z: 3.0, yaw: -0.2 },
        { id: "juno", look: "juno", x: -1.8, z: 3.2, yaw: 0.2 },
      ] },
    // Thrown apart by the first pulse: alone in the mist with the Hollow's empty armour.
    { id: "alone", type: "fight", ...HM, wave: ["shell", "shell", "shell"], tokens: 2,
      world: { bounds: ZONES.hollowmarch.bounds, origin: { x: -12, z: -6 }, companions: false },
      tutorial: [{ at: 0.5, text: "Alone in the mist. Empty armour, standing up out of the grass. Stand your ground until the others find you." }],
      lines: [["Rook", "Hello? …Anyone?"]],
      retry: "Again. Stand still and shout." },
    { id: "regroup", type: "scene", node: "Ep17_Regroup", ...HM,
      rook: { x: -11, z: -5, yaw: 0.6 },
      cast: [
        { id: "bas", look: "bas", x: -9.0, z: -4.0, yaw: -1.6 },
        { id: "juno", look: "juno", x: -12.6, z: -3.2, yaw: 2.6 },
        { id: "lio", look: "lio", x: -13.4, z: -6.4, yaw: 1.6 },
        { id: "cal", look: "cal", x: -9.6, z: -7.0, yaw: -0.8 },
      ],
      set: { EP17_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep18",
      lines: [
        "Next time on UNWRITTEN: the end of Arc 2.",
        "The Hollow Bloom.",
        "I'll hold the door.",
      ] },
  ],
};
