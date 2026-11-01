// Episode 12 · The Drowned Cistern (GDD §14 Arc 2; Boss 5).
//
// Under the Gear Hall the old cistern has flooded, and in the black water: rusted cages, children in them, and the thing
// someone has been feeding. Boss 5: Gullmaw, the Cistern Toad. When its tongue comes for Rook, Severin is in front of it.
// The children up the stairs to their mothers; a hymn sheet nailed to a cage (the Choir, again); and a rivalry that has
// quietly become something else.

import { AFTER_EP11 } from "./arc12.js";
import { ZONES } from "../zones.js";

export const EP12_SCRIPT = `
title: Ep12_Cistern
---
<<shot wide>>
The Gear Hall, and under its grating, the old cistern: black water to the knee, rusted cages hung from the beams, and in the cages, children, very quiet.
<<shot on Severin>>
Severin: There. Seven. All of them. Alive.
<<shot on Juno>>
Juno: Then what's been eating the—
<<shot wide>>
The water at the far end rises, and keeps rising, and two yellow eyes the size of shields open at the top of it.
<<shot on Bas>>
Bas: Oh. That.
===

title: Ep12_After
---
<<shot wide>>
The toad sinks into the cistern for the last time. Bas wrenches the cages open one after another, and the children go up the stairs in a chain, hand to hand, Juno counting every one.
<<shot on Severin>>
Severin is sitting on the steps. There's blood on his sleeve. The toad's tongue was meant for you. He was in front of it before either of you had thought about it.
<<shot on Rook>>
-> "You got in front of me."
    <<set $SEVERIN_RESPECT to "shield">>
    <<shot on Rook>>
    Rook: You got in front of me. Why?
    <<shot on Severin>>
    Severin: I don't know. Don't ask me again. …You'd have done the same. I've watched you. You do it without thinking.
-> Offer him a hand up.
    <<set $SEVERIN_RESPECT to "hand">>
    <<shot wide>>
    You hold out a hand. He looks at it, the way he looked at yours on the Tower steps, a long time ago. This time he takes it.
<<shot on Severin>>
Severin: Somebody nailed a hymn to that cage. The Choir's been bringing children down here and feeding them to that thing. Children nobody counts.
<<shot on Severin>>
Severin: I'll tell my father. He'll say it's a rumour. I'll tell him again.
<<set $CHOIR_CISTERN to 1>>
<<set $EP12_DONE to 1>>
===
`;

const UC = { stage: "undercroft" };

export const EPISODE_12 = {
  id: "ep12",
  number: 12,
  setup: { ...AFTER_EP11 },
  title: "The Drowned Cistern",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "cistern", type: "scene", node: "Ep12_Cistern", ...UC,
      rook: { x: 0.4, z: 33.4, yaw: 0 },
      cast: [
        { id: "severin", look: "severin", x: -1.6, z: 34.2, yaw: 0.3 },
        { id: "juno", look: "juno", x: 2.2, z: 33.8, yaw: -0.3 },
        { id: "bas", look: "bas", x: 3.6, z: 35.4, yaw: -0.6 },
      ] },
    { id: "gullmaw", type: "fight", ...UC, wave: ["gullmaw"], tokens: 2,
      world: { bounds: ZONES.undercroft.bounds, origin: { x: 0, z: 38 }, party: ["severin"] },
      tutorial: [{ at: 0.5, text: "BOSS 5 · GULLMAW, THE CISTERN TOAD. When it swallows the water, its tongue comes next: be somewhere else. Severin is on the bench." }],
      lines: [["Severin", "Watch the tongue!"], ["Juno", "Keep it away from the cages!"]],
      retry: "Again. The cages.",
      set: { GULLMAW_DEFEATED: 1 } },
    { id: "after", type: "scene", node: "Ep12_After", ...UC,
      rook: { x: 0.6, z: 36.0, yaw: Math.PI },
      cast: [
        { id: "severin", look: "severin", x: -0.6, z: 34.0, yaw: 0.2, pose: "sit" },
        { id: "bas", look: "bas", x: 3.2, z: 39.0, yaw: -2.4 },
        { id: "juno", look: "juno", x: -3.4, z: 37.4, yaw: 1.6 },
      ],
      set: { EP12_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep13",
      lines: [
        "Next time on UNWRITTEN:",
        "The Chancellor's garden, and an offer you can refuse.",
        "It'll cost you.",
      ] },
  ],
};
