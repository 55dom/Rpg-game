// Episode 68 · Write Me (GDD §27.9, the final battle, first part; §25.3; Phase 7 Step 10, §23.6).
//
// The arena is the world's page tearing. He uses everything: every door, the Line's drill, the Marshal's weight, the
// stolen power of the Rite. Above the scale, nothing below it marks him much: with Star Sight it's there to see, and
// everyone does (the set-piece rule §25.3 allows: shown on screen, explained by the fiction). The Lanterns fight him
// together, and go down one by one. Rook alone. Then Rook on one knee, and his glaive coming down, and Maelis getting up.

import { AFTER_EP67 } from "./arcs.js";
import { ZONES } from "../data/zones.js";

export const EP68_SCRIPT = `
title: Ep68_Page
---
<<stars on>>
<<shot wide>>
The throne chamber is coming apart at the seams: white cracks across the walls, across the air, the floor under the runner thinning like old paper held up to a light.
<<shot on Cal>>
Cal: Everything I have, Rook. Don't you dare hold anything back. I'd be insulted.
<<shot on Corin>>
Corin: Look at him. Look at what's over him. He's past five. Nothing below it is going to mark him much.
<<shot on Maelis>>
Maelis: Then we hit him together, and keep hitting him.
===

title: Ep68_Down
---
<<stars on>>
<<shot wide>>
One by one, they go down. Juno, her thread cut by a door that opened through it. Bas, his pillar folded back on him. Severin, out-fenced. Corin, at last, on both knees, like fifteen years ago.
<<shot on Cal>>
Cal: Is that all? I wrote better for you than this.
<<shot on Cal>>
Cal: Just you, then. The way it was always going to be.
===

title: Ep68_Knee
---
<<stars on>>
<<pose Rook kneel>>
<<shot wide>>
You're on one knee on a floor that's mostly crack. He stands over you with the glaive up, the way he stood on the bridge.
<<shot on Cal>>
Cal: It's all right. You did well. Better than anyone. I'm proud of you, you know. I always was.
<<shot on Maelis>>
Behind him, Maelis gets up. Slowly. One star over her head, flickering like a candle in a draught.
<<shot on Maelis>>
Maelis: Rook. Take mine.
<<set $EP68_DONE to 1>>
===
`;

const THRONE = { stage: "throne" };

export const EPISODE_68 = {
  id: "ep68",
  number: 68,
  unlockAt: 5,
  setup: { ...AFTER_EP67 },
  title: "Write Me",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "page", type: "scene", node: "Ep68_Page", ...THRONE,
      rook: { x: -0.4, z: 6.0, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 0, z: 10.4, yaw: Math.PI, stars: "?" },
        { id: "corin", look: "corinNow", x: 2.4, z: 5.6, yaw: -0.3, stars: 5 },
        { id: "maelis", look: "maelisNow", x: -2.6, z: 5.2, yaw: 0.4, stars: 1 },
      ] },
    { id: "title", type: "title" },
    // Together: above the scale, he can't be worn far down; hold on as long as you can.
    { id: "together", type: "fight", ...THRONE, wave: [], tokens: 3,
      world: { bounds: ZONES.throne.bounds, origin: { x: 0, z: 6 }, companions: ["bas", "juno", "maelisAlly"], party: ["severin"] },
      siege: {
        foes: [{ kind: "calRite", x: 0, z: 10.4, yaw: Math.PI, floor: 0.75 }],
        meter: { label: "Write Me", start: 1, end: 0, seconds: 55, perKill: 0 },
        marks: [
          { frame: 400, say: ["Cal", "Juno's needles. Bas's pillar. I watched you all for six years."] },
          { frame: 1300, say: ["Corin", "Our blows slide off him!"] },
          { frame: 2400, say: ["Cal", "Left, left, back. You know how this ends."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "ABOVE THE SCALE. With Star Sight you can see it: nothing below his rating marks him much. Hold on, together, as long as you can." }],
      lines: [["Cal", "All of you. Good."]],
      retryBy: "Cal", retry: "Again. I'm not finished with you." },
    { id: "down", type: "scene", node: "Ep68_Down", ...THRONE,
      rook: { x: -0.4, z: 6.4, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 0.4, z: 9.6, yaw: Math.PI, stars: "?" },
        { id: "juno", look: "juno", x: -2.6, z: 7.6, yaw: 0.6, down: true },
        { id: "bas", look: "bas", x: 2.6, z: 7.4, yaw: -0.6, down: true },
        { id: "corin", look: "corinNow", x: 3.4, z: 5.2, yaw: -0.4, pose: "kneel", stars: 5 },
      ] },
    // Rook alone.
    { id: "alone", type: "fight", ...THRONE, wave: [], tokens: 2,
      world: { bounds: ZONES.throne.bounds, origin: { x: 0, z: 6 }, companions: false },
      siege: {
        foes: [{ kind: "calRite", x: 0, z: 10.0, yaw: Math.PI, floor: 0.6 }],
        meter: { label: "Alone", start: 1, end: 0, seconds: 40, perKill: 0 },
        marks: [
          { frame: 600, say: ["Cal", "There. That. You've always had that."] },
          { frame: 1600, say: ["Cal", "Mind the step."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "ROOK ALONE. Hold on." }],
      lines: [["Cal", "Just us."]],
      retryBy: "Cal", retry: "Again. You were so close to interesting." },
    { id: "knee", type: "scene", node: "Ep68_Knee", ...THRONE,
      rook: { x: -0.2, z: 6.6, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 0.2, z: 8.4, yaw: Math.PI, stars: "?" },
        { id: "maelis", look: "maelisNow", x: -2.8, z: 4.6, yaw: 0.6, stars: 1 },
      ],
      set: { EP68_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep69",
      lines: [
        "Next time on UNWRITTEN:",
        "Every star the world has ever moved was a trade.",
        "The Shared Star.",
      ] },
  ],
};
