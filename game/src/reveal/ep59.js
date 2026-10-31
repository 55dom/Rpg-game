// Episode 59 · The Key (GDD §27.1; §15.5 S7; Phase 7 Step 6, §23.6). Arc 7 opens. This folder is the one allowed to
// name him (§15.11).
//
// Larkspur at dawn, everyone at the door. The brass key that "opens the snack cupboard" (the cupboard never had a lock):
// "Doors don't have locks. They have keys." It opens from this side. The same long tunnel of dark aura he walked, and
// at its end, the camp under the black castle, fifteen years later: ash, the drill yard, and the Line standing in it
// exactly where it was told to stand, still obeying orders nobody has given in fifteen years. A patrol challenges them.
// Then one soldier lowers his glaive, and asks a question.

import { AFTER_EP58 } from "./arcs.js";
import { ZONES, RUINS_LAYOUT as RU } from "../data/zones.js";
import { CAMP_LAYOUT as C } from "./places.js";

export const EP59_SCRIPT = `
title: Ep59_Door
---
<<shot wide>>
Larkspur, at dawn. The keyhole is still lit, small and patient, exactly where they left it. Everyone's here.
<<shot on Dagrun>>
Dagrun: Go on, then. It's addressed to you.
<<shot on Bas>>
Bas: For the record, I think this is a terrible idea.
<<shot on Juno>>
Juno: It's on the record, Bas. It's been on the record since the bridge.
<<shot on Rook>>
You take out the brass key. A cheap thing, the kind a vice captain gives a squire as a joke. It opens the snack cupboard, he said. The cupboard never had a lock.
-> "Doors don't have locks. They have keys."
    <<set $KEY_WORDS to "keys">>
    <<shot on Rook>>
    Rook: Doors don't have locks. They have keys.
-> "You still owe me a snack cupboard."
    <<set $KEY_WORDS to "cupboard">>
    <<shot on Rook>>
    Rook: You still owe me a snack cupboard.
    <<shot on Rook>>
    And, under your breath, the thing he used to say, every time: doors don't have locks. They have keys.
<<sfx door>>
<<set $LARKSPUR_OPEN to 1>>
<<shot wide>>
The key turns from this side. The gold seam opens down the middle, and through the frame, where the rest of Larkspur should be, there's a long way down a tunnel of dark aura, and the sound of a drum: four beats, far off.
<<shot on Tamsin>>
Tamsin: That's where he went. Every time he went somewhere.
<<shot on Severin>>
Severin: Then that's where we go.
===

title: Ep59_Arrive
---
<<shot wide>>
Ash, falling like snow that's forgotten how to melt. A camp under a black castle: tents, braziers, a drill yard. And in the yard, the Line, standing exactly where it was told to stand.
<<shot on Lio>>
Lio: There's a sign on the post. It's his script. I can read it. "Hold the line."
<<shot on Lio>>
Lio: The ink's fifteen years old. Nobody's written a new one.
<<shot on Juno>>
Juno: They're just standing there. They've been standing there.
<<shot on Dagrun>>
Dagrun: Waiting for somebody to tell them something else.
<<shot on Soldier>>
Soldier: Intruders.
<<shot on Soldier>>
Soldier: The order is: hold the line. Destroy the intruders.
<<shot on Bas>>
Bas: Here we go.
===

title: Ep59_Questions
---
<<shot wide>>
The patrol is down in the ash. The rest of the Line hasn't moved; it was never told to. But one soldier, the one nearest, has lowered his glaive, slowly, as if the arm decided before he did.
<<shot on LineSergeant>>
LineSergeant: You fight like the Line. Left, left, back. One of you does.
<<shot on LineSergeant>>
LineSergeant: There was a soldier who fought like that. He stepped out of the line, once, and asked why. Then he came back, years later, with a different face, and asked us all why.
<<shot on Juno>>
Juno: …He's been here. Talking to you.
<<shot on LineSergeant>>
LineSergeant: He asks questions. He says we should ask them too. Some of us have started.
<<shot on Bas>>
Bas: He's using them. Same as he used us. Pieces on a board.
-> "Maybe. They're still asking."
    <<set $SOLDIERS_TREAT to "asking">>
    <<shot on Rook>>
    Rook: Maybe he is. They're still asking. That's theirs, whatever he wanted it for.
    <<shot on LineSergeant>>
    LineSergeant: …Yes. It is ours. I had not thought of it as ours.
-> "What do you want to ask?"
    <<set $SOLDIERS_TREAT to "ask">>
    <<shot on Rook>>
    Rook: What do you want to ask? Ask me.
    <<shot on LineSergeant>>
    LineSergeant: Why do your people stand so close together when nobody has ordered it?
    <<shot on Rook>>
    Rook: Because we want to.
    <<shot on LineSergeant>>
    The sergeant is silent a long time.
-> "Bas is right. Stay back."
    <<set $SOLDIERS_TREAT to "wary">>
    <<set $BAS_TRUST to $BAS_TRUST + 1>>
    <<shot on Rook>>
    Rook: Bas is right. Stay back. We'll talk when we know who's using who.
    <<shot on LineSergeant>>
    LineSergeant: Received.
<<set $EP59_DONE to 1>>
===
`;

const RUIN = { stage: "ruins" }, CAMP = { stage: "camp" }, DAWN = { sky: { daylight: 0.35 } };
const D = RU.door, FRONT = { x: D.x + Math.sin(D.yaw) * 2.4, z: D.z + Math.cos(D.yaw) * 2.4 }, FACE = D.yaw + Math.PI;
const Y = C.yard;
// The Line in the yard: two ranks, standing where they were told to stand fifteen years ago.
const line = Array.from({ length: 8 }, (_, i) => ({ id: `l${i}`, look: "lineSoldier", x: Y.x - 5.25 + (i % 4) * 3.5, z: Y.z + 3.2 + Math.floor(i / 4) * 2.4, yaw: Math.PI }));

export const EPISODE_59 = {
  id: "ep59",
  number: 59,
  unlockAt: 5,
  setup: { ...AFTER_EP58 },
  title: "The Key",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "door", type: "scene", node: "Ep59_Door", ...RUIN, ...DAWN,
      rook: { x: FRONT.x, z: FRONT.z, yaw: FACE },
      cast: [
        { id: "dagrun", look: "dagrun", x: FRONT.x - 1.6, z: FRONT.z - 0.5, yaw: FACE + 0.3 },
        { id: "juno", look: "juno", x: FRONT.x - 1.0, z: FRONT.z - 1.8, yaw: FACE + 0.1 },
        { id: "bas", look: "bas", x: FRONT.x + 1.0, z: FRONT.z - 1.6, yaw: FACE - 0.2 },
        { id: "tamsin", look: "tamsin", x: FRONT.x + 2.2, z: FRONT.z - 0.7, yaw: FACE - 0.5 },
        { id: "lio", look: "lio", x: FRONT.x - 2.8, z: FRONT.z - 1.4, yaw: FACE + 0.4 },
        { id: "severin", look: "severin", x: FRONT.x + 0.1, z: FRONT.z - 3.0, yaw: FACE },
      ] },
    { id: "cross", type: "cutscene", cutscene: "ep59_cross" },
    { id: "title", type: "title" },
    { id: "arrive", type: "scene", node: "Ep59_Arrive", ...CAMP,
      rook: { x: 0, z: -12.5, yaw: 0 },
      cast: [
        ...line,
        { id: "soldier", look: "lineSoldier", x: 0.4, z: -9.4, yaw: Math.PI },
        { id: "juno", look: "juno", x: -1.8, z: -13.0, yaw: 0.2 },
        { id: "bas", look: "bas", x: 1.9, z: -13.2, yaw: -0.2 },
        { id: "lio", look: "lio", x: -3.3, z: -13.8, yaw: 0.3 },
        { id: "dagrun", look: "dagrun", x: 3.4, z: -14.0, yaw: -0.3 },
      ] },
    { id: "patrol", type: "fight", ...CAMP, wave: ["lineSoldier", "lineSoldier", "lineSoldier", "lineSoldier"], tokens: 2,
      world: { bounds: ZONES.camp.bounds, origin: { x: 0, z: -10 } },
      tutorial: [{ at: 0.5, text: "The Line's patrol. Shields toward you whenever they aren't attacking; the drill (left, left, back) ends in a cut you can't block." }],
      lines: [["Juno", "Fifteen years of standing still, and they still know how to do this!"], ["Bas", "Left, left, back. I know. I KNOW."]],
      retry: "Up. We didn't come all this way to lie in the ash." },
    { id: "questions", type: "scene", node: "Ep59_Questions", ...CAMP,
      rook: { x: 0, z: -11.4, yaw: 0 },
      cast: [
        ...line,
        { id: "lineSergeant", look: "lineSoldier", x: 0.3, z: -8.6, yaw: Math.PI },
        { id: "juno", look: "juno", x: -1.8, z: -12.0, yaw: 0.3 },
        { id: "bas", look: "bas", x: 1.9, z: -12.2, yaw: -0.3 },
        { id: "dagrun", look: "dagrun", x: 3.4, z: -13.0, yaw: -0.4 },
      ],
      set: { EP59_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep60",
      lines: [
        "Next time on UNWRITTEN: Arc 7, Unwritten.",
        "The continent today. A mess table, a drill yard, a bunk with tally marks.",
        "And demons who are people.",
      ] },
  ],
};
