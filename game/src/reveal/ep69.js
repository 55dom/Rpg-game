// Episode 69 · The Shared Star (GDD §25.4, §27.9; §8.6 "Unwritten"; Phase 7 Step 10, §23.6).
//
// Every star the world has ever moved was a trade: the Saint pays with her rating, soldiers with their lives, he with
// his world. Maelis offers her last (it would erase her). Then Juno: "Take mine." And Bas, Tamsin, Lio, Severin, and
// Dagrun. Given freely, expecting nothing. The system has no rule for a gift: the givers lose nothing, their stars
// still burning over their heads; and over Rook, who had nothing to add to, seven, on a scale that stops at five. The
// third reading, the one Brother Moss said wouldn't cost anything: Unwritten. The final clash, the Godfall glaive
// against the last line of the Palimpsest.

import { AFTER_EP68 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { UNWRITTEN_MODS } from "./arc7.js";

export const EP69_SCRIPT = `
title: Ep69_Gift
---
<<stars on>>
<<pose Rook kneel>>
<<shot on Maelis>>
Maelis: Take mine. It's the last one. I'll fall off the page. That's all right. I've had longer than most.
<<shot on Rook>>
Rook: No. Not you. Not like that.
<<shot on Juno>>
Juno is up on one elbow in the cracks, blood in her hair, the new knot on her wrist.
<<shot on Juno>>
Juno: Then take mine.
<<shot on Bas>>
Bas: …And mine. Heavy end. Told you.
<<shot on Tamsin>>
Tamsin: Mine. I mean it. Every time.
<<shot on Lio>>
Lio: Mine. Read it slowly.
<<shot on Severin>>
Severin: Take mine, Rook. Whether you like it or not.
<<shot on Dagrun>>
Dagrun: Mine. Nobody's written your story. So write it.
<<shot wide>>
They give them. Not as a trade. Nobody asks for anything back. And the stars go, every one, out of them and into you, and every one of them is still there, burning over the head it came from.
<<shot on Cal>>
Cal: …That's not a trade. There's no rule for that. There's no rule for that.
<<star Rook 7>>
<<set $SHARED_STAR to 1>>
<<shot on Rook>>
Over your head, where there was nothing: seven. On a scale that stops at five.
<<shot on Rook>>
You remember an old man on the Tower steps, with a cup of tea in both hands. There's a third reading. Somebody will try to tell you the price. There isn't one.
<<set $UNWRITTEN to 1>>
<<shot on Cal>>
Cal: Ha. Oh, Rook. Look at you.
<<shot on Cal>>
Cal: Unwritten.
===
`;

const THRONE = { stage: "throne" };

export const EPISODE_69 = {
  id: "ep69",
  number: 69,
  unlockAt: 5,
  setup: { ...AFTER_EP68 },
  title: "The Shared Star",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "gift", type: "scene", node: "Ep69_Gift", ...THRONE,
      rook: { x: -0.2, z: 6.6, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 0.2, z: 9.0, yaw: Math.PI, stars: "?" },
        { id: "maelis", look: "maelisNow", x: -2.8, z: 4.6, yaw: 0.6, stars: 1 },
        { id: "juno", look: "juno", x: -2.6, z: 7.6, yaw: 0.6, stars: 2, pose: "kneel" },
        { id: "bas", look: "bas", x: 2.6, z: 7.4, yaw: -0.6, stars: 2, pose: "kneel" },
        { id: "tamsin", look: "tamsin", x: -4.0, z: 6.4, yaw: 0.9, stars: 1 },
        { id: "lio", look: "lio", x: 3.9, z: 6.2, yaw: -0.9, stars: 2 },
        { id: "severin", look: "severin", x: 2.2, z: 4.4, yaw: -0.4, stars: 3, pose: "kneel" },
        { id: "dagrun", look: "dagrun", x: -1.0, z: 3.6, yaw: 0.1, stars: 3 },
      ] },
    { id: "title", type: "title" },
    // The final clash: Rook, given seven stars that cost nobody anything.
    { id: "unwritten", type: "fight", ...THRONE, wave: [], tokens: 2,
      world: { bounds: ZONES.throne.bounds, origin: { x: 0, z: 6 }, companions: false, mods: UNWRITTEN_MODS },
      siege: {
        foes: [{ kind: "calRite", x: 0, z: 10.0, yaw: Math.PI, floor: 0.04 }],
        meter: { label: "Unwritten", start: 1, end: 0, seconds: 75, perKill: 0 },
        marks: [
          { frame: 500, say: ["Cal", "There it is. There you are."] },
          { frame: 1500, say: ["Juno", "Go on, Rook!"] },
          { frame: 2600, say: ["Cal", "Left, left, back— no. You'd see it coming now. You see everything coming."] },
          { frame: 3600, say: ["Dagrun", "Finish it."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "UNWRITTEN. Seven stars, given, costing nobody anything. He can't shrug you off any more. End it." }],
      lines: [["Cal", "Come on, then. Write me."]],
      retryBy: "Cal", retry: "Again. You're so close.",
      set: { FINAL_CLASH: 1 } },
    { id: "clash", type: "cutscene", cutscene: "ep69_clash" },
    { id: "preview", type: "preview", nextEpisode: "ep70",
      lines: [
        "Next time on UNWRITTEN: the last episode.",
        "One clause.",
        "The Clause.",
      ] },
  ],
};
