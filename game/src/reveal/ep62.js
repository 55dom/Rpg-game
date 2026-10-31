// Episode 62 · The Trial Continues (GDD §27.3; BACKLASH.md §12 Sacrifice; Phase 7 Step 7, §23.6).
//
// A night by the braziers with the Goddess Saint. Fifteen years of Trials; every month she prays, and someone comes
// back stronger, and she comes back one star lower. One more, and she falls off the page. She keeps offering anyway.
// Then the Line-keepers' old order brings a Line down on the camp in the dark, and Maelis fights beside the Lanterns
// as a guest: Low Heal, a ten-second prayer that mends whoever's hurt worst, if nobody reaches her first. Afterwards:
// "Nobody's stood in front of me in a long time. They only ever stand behind."

import { AFTER_EP61 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { CAMP_LAYOUT as C } from "./places.js";

export const EP62_SCRIPT = `
title: Ep62_Fire
---
<<shot wide>>
Night in the camp. The braziers burn the way they've burned for fifteen years. Maelis sits by the nearest one with her hands round a cup she isn't drinking from.
<<shot on Maelis>>
Maelis: Every month the light takes us home, and every month it brings us back. And every month, somewhere in the fighting, I pray.
<<shot on Maelis>>
Maelis: Whoever I pray for comes back stronger. I come back… less. A star less, the Goddess would say, if she said anything.
<<shot on Maelis>>
Maelis: I have one left. One more, and I fall off the page.
<<shot on Maelis>>
Maelis: I keep offering. Corin hates it. He was a boy when I gave him the first one.
-> "Don't. Not for us."
    <<set $MAELIS_PROMISE to "dont">>
    <<shot on Rook>>
    Rook: Don't. Not for us. Not for anyone.
    <<shot on Maelis>>
    Maelis: You say that as if it's yours to ask. …It's kind. Nobody's asked me not to, before. They only ever ask when.
-> "Why do you keep offering?"
    <<set $MAELIS_PROMISE to "why">>
    <<shot on Rook>>
    Rook: Why do you keep offering?
    <<shot on Maelis>>
    Maelis: Because every trade I've ever seen costs somebody something. I'd rather it was me. I've had longer than most.
<<shot on KingD>>
KingD: There's a page in the Trial's records nobody reads. Fifteen years ago, the throne room. The records stop there, mid-line.
<<shot on KingD>>
KingD: Corin reached five stars in that room. And lost anyway. The King didn't stand up.
<<shot on Corin>>
Corin: He didn't need to.
===

title: Ep62_After
---
<<shot wide>>
The Line lies in the ash, all of it, and nobody fell on the Lanterns' side. Maelis is still on her knees where she prayed, and Juno is standing over her with her needles out, daring anything else to come.
<<shot on Maelis>>
Maelis: Thank you. For standing in front of me.
<<shot on Maelis>>
Maelis: Nobody has, in a long time. They only ever stand behind.
<<shot on Juno>>
Juno: Well. You're with us now. We stand in front. It's a whole thing.
<<shot on Corin>>
Corin: Tomorrow, the castle. Whoever you're looking for, he'll be near the throne. Things like him always are.
<<set $MAELIS_GUEST to 1>>
<<set $EP62_DONE to 1>>
===
`;

const CAMP = { stage: "camp" }, NIGHT = { sky: { daylight: 0.08 } };
const B = { x: C.braziers[0][0], z: C.braziers[0][1] }; // the one by the west tents (-10, -4)

export const EPISODE_62 = {
  id: "ep62",
  number: 62,
  unlockAt: 5,
  setup: { ...AFTER_EP61 },
  title: "The Trial Continues",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "fire", type: "scene", node: "Ep62_Fire", ...CAMP, ...NIGHT,
      rook: { x: B.x + 2.2, z: B.z - 0.4, yaw: -1.7 },
      cast: [
        { id: "maelis", look: "maelisNow", x: B.x + 0.4, z: B.z - 1.4, yaw: 0.6, pose: "sit" },
        { id: "kingD", look: "kingD", x: B.x + 1.4, z: B.z + 1.8, yaw: Math.PI - 0.4 },
        { id: "corin", look: "corinNow", x: B.x - 1.4, z: B.z + 1.6, yaw: Math.PI * 0.8 },
      ] },
    { id: "title", type: "title" },
    // The Line-keepers' old order, in the dark. Maelis prays; keep them off her.
    { id: "night", type: "fight", ...CAMP, ...NIGHT, wave: ["lineSoldier", "lineSoldier", "throneGuard", "lineSoldier", "throneGuard"], tokens: 2,
      world: { bounds: ZONES.camp.bounds, origin: { x: B.x + 4, z: B.z }, companions: ["bas", "juno", "maelisAlly"] },
      tutorial: [{ at: 0.5, text: "MAELIS fights beside you. Her prayer takes ten seconds; then it mends whoever's hurt worst. Keep them off her while she prays." }],
      lines: [["Maelis", "Stand close. I'll pray."], ["Bas", "Nobody touches the Saint! …Did I just say that?"]],
      retry: "Up. She's still praying." },
    { id: "after", type: "scene", node: "Ep62_After", ...CAMP, ...NIGHT,
      rook: { x: B.x + 3.0, z: B.z - 1.0, yaw: -1.4 },
      cast: [
        { id: "maelis", look: "maelisNow", x: B.x + 1.4, z: B.z - 1.6, yaw: 1.0, pose: "kneel" },
        { id: "juno", look: "juno", x: B.x + 1.6, z: B.z - 3.0, yaw: 0.4 },
        { id: "corin", look: "corinNow", x: B.x + 3.4, z: B.z + 1.6, yaw: Math.PI },
      ],
      set: { EP62_DONE: 1, MAELIS_GUEST: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep63",
      lines: [
        "Next time on UNWRITTEN:",
        "A golden door opens at the edge of the camp.",
        "\"You. The one who didn't kill me.\"",
      ] },
  ],
};
