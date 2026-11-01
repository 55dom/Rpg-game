// Episode 70 · The Clause (GDD §27.10, the ending, `$CAL_FATE`; Phase 7 Step 10, §23.6). The last episode.
//
// He's on one knee on the torn page, laughing, a hand on his ribs. Rook writes one clause about him.
//   "Fall."     He drops to nothing. Time stops. A perfect black circle opens behind him, and two figures in black step
//               out of it. He laughs: "Another one? Lucky me." (Bittersweet; sequel-shaped.)
//   "Stay."     He's written back to one star: an ordinary man in Liraen, powerless, alive. "A soldier again. Huh."
//   "Lantern."  (Juno's, Dagrun's and Bas's Arc 7 quests resolved, and his bond high enough.) No rating at all: "You're a
//               Lantern. That's all you have to be." Unwritten too, outside every hierarchy. The last shot is the
//               lighthouse, with his lantern relit. (The earned ending.)
// All three share the epilogue: on the continent, soldiers choosing names (how far that spreads depends on the clause),
// and the Lighthouse at night, everyone home, and the light on.

import { AFTER_EP69 } from "./arcs.js";
import { CAMP_LAYOUT as C } from "./places.js";

const LANTERN_READY = "$CAL_JUNO == \"family\" and $DAGRUN_LOOKED and $BAS_TRUCE and $BOND_CAL >= 150";

export const EP70_SCRIPT = `
title: Ep70_Clause
---
<<stars on>>
<<shot wide>>
The torn page goes quiet. He's down on one knee in the cracks, a hand on his ribs, laughing softly, the way he did on the bridge. The stolen stars are going out of him one by one, like lamps along a street at dawn.
<<shot on Cal>>
Cal: Go on, then. One clause. You've earned it.
<<shot on Cal>>
Cal: I'd write one about you, if I could. I tried, you know. For years. You're the only thing I never could.
<<shot on Rook>>
The Palimpsest is open in your hands, and the margin is empty, and it's waiting.
-> "Fall."
    <<set $CAL_FATE to "fall">>
    <<shot on Rook>>
    You write one word. "Fall."
    <<star cal 0>>
    <<shot on Cal>>
    Over his head, the question mark goes out, and the star with it, down to the hollow of one. Nothing left.
    <<shot on Cal>>
    Cal: …Fair. That's fair. I'd have written it too.
-> "Stay."
    <<set $CAL_FATE to "stay">>
    <<shot on Rook>>
    You write one word. "Stay."
    <<star cal 1>>
    <<shot on Cal>>
    Over his head, one star. Plain, and gold, and ordinary. He looks up at it for a long time.
    <<shot on Cal>>
    Cal: One. A soldier again. Huh.
-> "You're a Lantern." <<if ${LANTERN_READY}>>
    <<set $CAL_FATE to "lantern">>
    <<shot on Rook>>
    You don't write a rating. You write what's true. "You're a Lantern."
    <<stars off>>
    <<shot on Cal>>
    Over his head, the question mark goes out, and then the star, and then there's nothing there at all. Not zero. Nothing. Like you.
    <<shot on Rook>>
    Rook: You're a Lantern. That's all you have to be.
    <<shot on Cal>>
    For a long moment he doesn't say anything. He doesn't smile. Then he does, and it isn't any of the smiles you know.
    <<shot on Cal>>
    Cal: …Mind the step, then.
    <<set $CAL_STATE to 0>>
<<set $CLAUSE_III to 1>>
===

title: Ep70_Names
---
<<shot wide>>
Afterwards. The camp under the black castle, and ash, still falling. At the long iron table, soldiers of the Line sit because they want to.
<<shot on Four>>
Four: I have thought about it. What a name is for. I would like to be called Tally. For the marks on the bunk. So that somebody counts.
<<shot on LineSergeant>>
LineSergeant: Then I will be the one who found the part after the cut. That is too long. I will think about it.
<<if $CAL_FATE == "lantern">>
<<shot wide>>
And it spreads, down the table, out of the camp, along every Line on the continent, one soldier at a time, a name each, until nobody is a place in a line any more unless they want to be.
<<elseif $CAL_FATE == "stay">>
<<shot wide>>
And it spreads through the camp, tent by tent. Further than that, it's slow. But it's started.
<<else>>
<<shot wide>>
A few of them, at the table. The rest of the Line still stands where it was told. It's a start. Somebody has to start.
<<endif>>
===

title: Ep70_Home
---
<<shot wide>>
The Lighthouse, at night, on the dry Sea of Marrow. Everyone home. The table's too small for all of them, the way it always was.
<<shot on Juno>>
Juno has her new knot on her wrist, and her sketchbook open, and she's drawing the table. All of it.
<<shot on Dagrun>>
Dagrun: Everyone in? Everyone home?
<<if $CAL_FATE == "lantern">>
<<shot on Cal>>
Cal: Everyone. I counted. Twice.
<<shot on Dagrun>>
Dagrun: …Good.
<<elseif $CAL_FATE == "stay">>
<<shot on Dagrun>>
Dagrun: There's a man in Thornwick mending fences who says he'll come for dinner on the first of the month. We'll see.
<<else>>
<<shot on Dagrun>>
Dagrun looks at the empty chair for a while. Then he leaves it where it is.
<<endif>>
<<shot on Dagrun>>
Dagrun: Then I'll leave the light on.
<<shot wide>>
Up in the lantern room, the light burns all night. Nobody puts it out.
<<set $EP70_DONE to 1>>
<<set $STORY_COMPLETE to 1>>
===
`;

const THRONE = { stage: "throne" }, CAMP = { stage: "camp" }, LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.06 } };
const M = C.mess;

export const EPISODE_70 = {
  id: "ep70",
  number: 70,
  unlockAt: 5,
  setup: { ...AFTER_EP69 },
  title: "The Clause",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "clause", type: "scene", node: "Ep70_Clause", ...THRONE,
      rook: { x: -0.2, z: 7.2, yaw: 0 },
      cast: [{ id: "cal", look: "unmasked", x: 0.2, z: 9.4, yaw: Math.PI, pose: "kneel", stars: "?" }] },
    { id: "title", type: "title" },
    { id: "fall", type: "cutscene", cutscene: "ep70_fall", if: "$CAL_FATE == \"fall\"" },
    { id: "stay", type: "cutscene", cutscene: "ep70_stay", if: "$CAL_FATE == \"stay\"" },
    { id: "lantern", type: "cutscene", cutscene: "ep70_lantern", if: "$CAL_FATE == \"lantern\"" },
    { id: "names", type: "scene", node: "Ep70_Names", ...CAMP,
      rook: { x: M.x + 0.6, z: M.z - 2.2, yaw: 0 },
      cast: [
        { id: "four", look: "lineSoldier", x: M.x - 1, z: M.z + 1.25, yaw: Math.PI, pose: "sit" },
        { id: "lineSergeant", look: "lineSoldier", x: M.x + 1, z: M.z + 1.25, yaw: Math.PI, pose: "sit" },
        { id: "m0", look: "lineSoldier", x: M.x - 3, z: M.z + 1.25, yaw: Math.PI, pose: "sit" },
        { id: "m1", look: "lineSoldier", x: M.x + 3, z: M.z + 1.25, yaw: Math.PI, pose: "sit" },
      ] },
    { id: "home", type: "scene", node: "Ep70_Home", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
        { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
        { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
        { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
        { id: "dagrun", look: "dagrun", x: 5.0, z: 9.6, yaw: Math.PI },
        { id: "cal", look: "cal", x: 6.55, z: 3.5, yaw: -Math.PI / 2, pose: "sit", when: "$CAL_FATE == \"lantern\"" },
      ],
      set: { EP70_DONE: 1, STORY_COMPLETE: 1 } },
    { id: "preview", type: "preview", end: true, // the last card: ROLL CREDITS (src/reveal/credits.js)
      lines: [
        "UNWRITTEN",
        "The end.",
        "Somebody's left the light on.",
      ] },
  ],
};
