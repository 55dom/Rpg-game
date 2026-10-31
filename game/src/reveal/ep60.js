// Episode 60 · The Continent Today (GDD §27.2; Backlash Ch 1; Phase 7 Step 6, §23.6).
//
// The same map as Backlash, fifteen years later. The mess table, where the soldiers sit because sitting was in the
// order; the drill yard, one soldier alone at the posts (left, left, back, cut); the Line Smith, old now; and in the
// barracks, the bunk with tally marks scratched by its frame, and under them, newer, a line someone added: "He served.
// That is not all." The Line-keepers still give the old order; a Marshal and his Throne Guard come to carry it out,
// and the soldiers who've started asking questions step aside. That night, over the camp, a pillar of light: the
// Monthly Trial hasn't stopped either.

import { AFTER_EP59 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { CAMP_LAYOUT as C } from "./places.js";

export const EP60_SCRIPT = `
title: Ep60_Mess
---
<<shot wide>>
The long iron table. Soldiers sit along it in their plate, not eating, because sitting at the table at this hour was in the order, and nobody has told them otherwise.
<<shot on Soldier>>
Soldier: The sergeant says you stand close together because you want to. May I sit close to you? I would like to see what it is for.
<<shot on Tamsin>>
Tamsin: …Yeah. Shove up, Bas.
<<shot on Bas>>
Bas: I'm not shoving up for— fine. Fine.
<<shot on Soldier>>
Soldier: Another one of you, a long time ago, asked a sergeant if a soldier who fell was important. We still say what the sergeant said. "He served."
<<shot on Soldier>>
Soldier: Some of us have started saying the rest.
===

title: Ep60_Bunk
---
<<shot on Rook>>
A bunk in the barracks, the frame scratched with tally marks, rows and rows, the way a soldier counts days when nobody gives him anything else to count. And one small circle, filled in.
<<shot on Rook>>
Under them, newer, in a careful hand: "He served. That is not all."
===

title: Ep60_Drill
---
<<shot on LineSergeant>>
One soldier alone at the training posts in the yard. Left. Left. Back. Cut. Left. Left. Back. Cut.
<<shot on LineSergeant>>
LineSergeant: I am practising the part after the cut. Nobody ever taught it. He said there was a part after. I have not found it.
===

title: Ep60_Smith
---
<<shot on Smith>>
Smith: Glaives, glaives. Fifteen years, nothing but glaives. I made a spoon last month. Nobody ordered it. I don't know what to do with it.
<<shot on Smith>>
He holds it out to you. It's a good spoon.
===

title: Ep60_Order
---
<<shot on Linekeeper>>
Linekeeper: The order stands. Hold the line. Destroy the intruders. Marshal.
<<shot wide>>
The Marshal comes through the camp with his Throne Guard behind him, and the soldiers at the mess table, one by one, stand up, and step aside.
<<shot on Dagrun>>
Dagrun: Look at that. Nobody told them to.
===

title: Ep60_Light
---
<<shot wide>>
The Marshal kneels in the ash. The Throne Guard have gone back to the castle wall, because that was in the order too.
<<shot on LineSergeant>>
LineSergeant: You did not destroy him.
<<shot on Rook>>
Rook: No.
<<shot on LineSergeant>>
LineSergeant: Nobody has ever not destroyed us.
<<shot wide>>
Then, over the camp, a pillar of light comes down out of the ash-grey sky, gold and enormous, exactly where it came down every month for fifteen years.
<<shot on Juno>>
Juno: What is that?
<<shot on LineSergeant>>
LineSergeant: The Trial. The heroes. They come back every month. Same three. They do not like us.
<<set $EP60_DONE to 1>>
===
`;

const CAMP = { stage: "camp" }, DUSK = { sky: { daylight: 0.25 } };
const M = C.mess, Y = C.yard;
// Along the long table (a low box 8 × 1.4 at the mess): soldiers on the north side, sitting.
const table = [-3, -1, 1, 3].map((dx, i) => ({ id: i === 1 ? "soldier" : `m${i}`, look: "lineSoldier", x: M.x + dx, z: M.z + 1.25, yaw: Math.PI, pose: "sit" }));

export const EPISODE_60 = {
  id: "ep60",
  number: 60,
  unlockAt: 5,
  setup: { ...AFTER_EP59 },
  title: "The Continent Today",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "mess", type: "scene", node: "Ep60_Mess", ...CAMP,
      rook: { x: M.x - 0.6, z: M.z - 1.9, yaw: 0 },
      cast: [
        ...table,
        { id: "tamsin", look: "tamsin", x: M.x + 1.4, z: M.z - 1.9, yaw: 0 },
        { id: "bas", look: "bas", x: M.x - 2.6, z: M.z - 2.0, yaw: 0.2 },
      ] },
    { id: "camp", type: "explore", ...CAMP,
      rook: { x: -2, z: 6, yaw: Math.PI },
      objective: "The camp today. The barracks, the drill yard, and the smith ({n}/{total}).",
      required: ["bunk", "lineSergeant", "smith"], counts: "required",
      cast: [
        { id: "lineSergeant", look: "lineSoldier", x: -1.4, z: -6.6, yaw: Math.PI, node: "Ep60_Drill" },
        { id: "smith", look: "lineSoldier", x: 9.6, z: 3.0, yaw: -1.6, node: "Ep60_Smith" },
        ...table,
      ],
      pickups: [{ id: "bunk", x: -18, z: -10.8, node: "Ep60_Bunk", label: "A bunk with tally marks" }] },
    { id: "order", type: "scene", node: "Ep60_Order", ...CAMP,
      rook: { x: Y.x, z: Y.z - 1.0, yaw: Math.PI },
      cast: [
        { id: "linekeeper", look: "lineSoldier", x: Y.x - 1.2, z: Y.z - 5.6, yaw: 0 },
        { id: "dagrun", look: "dagrun", x: Y.x + 1.9, z: Y.z - 0.2, yaw: Math.PI - 0.3 },
        { id: "juno", look: "juno", x: Y.x - 1.9, z: Y.z + 0.2, yaw: Math.PI + 0.3 },
      ] },
    { id: "marshal", type: "fight", ...CAMP, ...DUSK, wave: ["lineMarshal", "throneGuard", "throneGuard"], tokens: 2,
      world: { bounds: ZONES.camp.bounds, origin: { x: Y.x, z: Y.z } },
      tutorial: [{ at: 0.5, text: "A Line Marshal and his Throne Guard, carrying out a fifteen-year-old order. The Marshal's maul is slow and enormous: be somewhere else." }],
      lines: [["Bas", "Him I don't mind hitting."], ["Juno", "The ones at the table aren't fighting. Look!"]],
      retry: "Up. They're watching what we do." },
    { id: "light", type: "scene", node: "Ep60_Light", ...CAMP, ...DUSK,
      rook: { x: Y.x + 0.4, z: Y.z - 1.6, yaw: 0 },
      cast: [
        { id: "lineSergeant", look: "lineSoldier", x: Y.x - 1.5, z: Y.z + 0.6, yaw: Math.PI - 0.4 },
        { id: "juno", look: "juno", x: Y.x + 2.2, z: Y.z - 2.6, yaw: -0.2 },
        { id: "dagrun", look: "dagrun", x: Y.x - 1.6, z: Y.z - 3.0, yaw: 0.2 },
      ],
      set: { EP60_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep61",
      lines: [
        "Next time on UNWRITTEN:",
        "Two figures in black, home from very far away, at a coffin.",
        "And three heroes, out of a pillar of light, who hate demons.",
      ] },
  ],
};
