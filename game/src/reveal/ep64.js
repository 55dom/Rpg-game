// Episode 64 · The Empty Wings (GDD §27.5; §28.4 V6; Phase 7 Step 8, §23.6).
//
// He walks them as far as the castle gate (Tamsin: "Why don't you just portal us to the throne room?" "Doors, Tamsin.
// I make doors." Not a joke, for once: V6), and then he's elsewhere. The approach to the throne room is held by the
// Throne Guard Lines and a Marshal, in formation, the last orders of a King who's been asleep for fifteen years (a
// formation fight for Rook's party, Maelis praying behind them). Inside: the long chamber, the throne, the coffin
// behind it, and beside the throne two places that have stood empty since the night the King lay down. When he arrives,
// he looks at them a moment too long.

import { AFTER_EP63 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { CAMP_LAYOUT as C, THRONE_LAYOUT as T } from "./places.js";

export const EP64_SCRIPT = `
title: Ep64_Gate
---
<<shot wide>>
The castle wall, black and very tall, and its gate standing open the way it has for fifteen years. He walks beside them as far as the gate, whistling, as if they'd asked him to.
<<shot on Tamsin>>
Tamsin: Why don't you just portal us to the throne room? You could. You do it to everyone else.
<<shot on Cal>>
Cal: Doors, Tamsin. I make doors.
<<shot on Tamsin>>
Tamsin waits for the joke. It doesn't come.
<<set $V6_SEEN to 1>>
<<shot on Cal>>
Cal: The Guard holds the approach. Old orders, very loyal. I'd help, but I have somewhere to be. I'll see you inside. Probably.
<<shot wide>>
A door, and he's gone, and the gate's just a gate again.
<<shot on Bas>>
Bas: Every time. Every single time.
===

title: Ep64_Wings
---
<<shot wide>>
The throne chamber. A long hall of black pillars, a runner the colour of old blood, the throne at the end of it on its dais, and behind the throne, a black coffin, sealed.
<<shot on Maelis>>
Maelis: Fifteen years ago, I died on this floor. Twice.
<<shot on Corin>>
Corin: He didn't stand up. The whole fight. He didn't stand up once.
<<shot wide>>
Beside the throne, one on each side, two places on the dais where the stone is a different colour, cleaner, as if something stood there for a very long time and then stopped.
<<shot on Lio>>
Lio: The Wings. The King's Commanders. The soldiers say they stood there. Then one night they were gone, and the King lay down.
<<sfx door>>
<<shot on Cal>>
And he's there, by the runner, as if he'd always been. He looks at the throne. Then at the two empty places beside it.
<<shot on Cal>>
A moment longer than he needs to.
<<shot on Cal>>
Cal: Well. You got through the Guard. I'll admit I had money on Bas losing an arm again.
<<set $EP64_DONE to 1>>
===
`;

const CAMP = { stage: "camp" }, THRONE = { stage: "throne" };
const G = { x: 0, z: C.wall.z - 4 }; // just inside the gate

export const EPISODE_64 = {
  id: "ep64",
  number: 64,
  unlockAt: 5,
  setup: { ...AFTER_EP63 },
  title: "The Empty Wings",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "gate", type: "scene", node: "Ep64_Gate", ...CAMP,
      rook: { x: G.x - 0.6, z: G.z - 2.6, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: G.x + 0.8, z: G.z, yaw: Math.PI },
        { id: "tamsin", look: "tamsin", x: G.x - 2.2, z: G.z - 1.6, yaw: 0.5 },
        { id: "bas", look: "bas", x: G.x + 2.4, z: G.z - 2.4, yaw: -0.4 },
        { id: "juno", look: "juno", x: G.x - 2.6, z: G.z - 3.6, yaw: 0.3 },
      ] },
    { id: "title", type: "title" },
    // The Throne Guard Lines and a Marshal, in formation: the approach.
    { id: "guard", type: "fight", stage: "throne", wave: ["lineMarshal", "throneGuard", "throneGuard", "throneGuard", "throneGuard"], tokens: 3,
      world: { bounds: ZONES.throne.bounds, origin: { x: 0, z: -12 }, companions: ["bas", "juno", "maelisAlly"], party: ["severin"] },
      tutorial: [{ at: 0.5, text: "THE THRONE GUARD. A Marshal and his Lines, holding the approach in formation. Severin is on the bench: tag in for his rapier. Maelis prays behind you." }],
      lines: [["Corin", "They held this hall against us every month for fifteen years!"], ["Severin", "Then let's not make it sixteen."]],
      retry: "Up. The throne room's right there." },
    { id: "wings", type: "scene", node: "Ep64_Wings", ...THRONE,
      rook: { x: -0.4, z: 9.6, yaw: 0 },
      cast: [
        { id: "maelis", look: "maelisNow", x: -2.6, z: 8.8, yaw: 0.4 },
        { id: "corin", look: "corinNow", x: 2.2, z: 8.6, yaw: -0.3 },
        { id: "lio", look: "lio", x: -1.8, z: 7.2, yaw: 0.2 },
        { id: "cal", look: "unmasked", x: 1.4, z: 11.8, yaw: 0.2 },
      ],
      set: { EP64_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep65",
      lines: [
        "Next time on UNWRITTEN:",
        "Three sources, one warning. The Rite needs three offerings.",
        "\"They'd have told me.\"",
      ] },
  ],
};
