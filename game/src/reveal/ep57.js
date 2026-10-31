// Episode 57 · Larkspur (GDD §14 Arc 6 "Larkspur's ruins"; §15.5 S7 the brass key; Phase 7 Step 4, §23.6).
//
// Fifteen years after the fire. Grass over the ash, the houses down to their chimney stacks, the well, the stone the
// Crown put up with forty-one names on it, and at the bottom, cut later and neater, "and one child, carried out." In
// the house where the child was there are no walls left at all: only a door frame, gold, standing on its own, sealed,
// its pane as dark as a shut eye. The brass key in Rook's pocket is warm as a hand. The last of the Choir's faithful
// come for the door their Mother promised would open for the unwritten.
//
// The last margin, under the drawing of the key on Rook's page: "Keep the key." Held up to the door, the key finds a
// keyhole in the seam that wasn't there before. Not yet. Lio sees how the village burned: outward, from here, as if
// something landed (it lands in Arc 7). They go home to fetch everyone.

import { AFTER_EP56 } from "./arcs.js";
import { ZONES, RUINS_LAYOUT as RU } from "../data/zones.js";

export const EP57_SCRIPT = `
title: Ep57_Road
---
<<shot wide>>
The road into Larkspur hasn't been mended in fifteen years. Grass has come up through the ash everywhere, green and ordinary, as if nothing ever happened here.
<<shot on Juno>>
Juno: You were born here.
-> "I don't remember any of it."
    <<set $LARKSPUR_FEEL to "nothing">>
    <<shot on Rook>>
    Rook: I don't remember any of it. Not a thing.
    <<shot on Juno>>
    Juno: You were a baby. Nobody remembers being a baby. That's allowed.
-> "Somewhere here."
    <<set $LARKSPUR_FEEL to "here">>
    <<shot on Rook>>
    Rook: Somewhere here. One of these.
    <<shot on Juno>>
    Juno takes your hand for a moment, and lets go, and doesn't say anything about it.
<<shot on Lio>>
Lio: The Crown's report says lightning. There wasn't a storm that night. I checked the almanac. I checked three.
<<shot on Severin>>
Severin: Moss said the book turned its pages the night this burned.
<<shot on Tamsin>>
Tamsin: It's pretty. Is that awful? The flowers. It's pretty.
<<shot on Bas>>
Bas: Key warm?
<<shot on Rook>>
You take the brass key out of your pocket. It is. Warm as a hand.
===

title: Ep57_Stone
---
<<shot on Rook>>
The stone the Crown put up. Forty-one names, in the Crown mason's square letters, and a line about lightning.
<<shot on Rook>>
And at the very bottom, cut later, smaller and neater than the rest, as if someone came back with his own chisel: "and one child, carried out."
===

title: Ep57_Cradle
---
<<shot on Rook>>
In the ash of the last house, the runner of a cradle, under a fallen beam.
<<shot on Rook>>
Somebody lifted that beam once. Fifteen winters have let it back down, a little at a time.
===

title: Ep57_Door
---
<<shot on Rook>>
A door frame, gold, standing on its own where a house used to be. There's no wall either side of it. You could walk round it.
<<shot on Rook>>
Through it, the pane is as dark as a shut eye, with one thin line of gold down the middle where the halves meet. The key in your hand is warmer here than anywhere.
===

title: Ep57_Margin
---
<<shot wide>>
The last of the Choir's faithful lie in the grass. Lio has the Field Notes open at your page, at the drawing of the key, at the one margin nobody has read.
<<shot on Lio>>
Lio: I've had it for days. I didn't want to read it to you until we were here. It's two words.
<<shot on Lio>>
Lio: "Keep the key."
<<set $MARGIN_ROOK to 1>>
<<shot on Rook>>
You hold the key up to the door. Where the line of gold runs down the dark, a keyhole opens that wasn't there before, small and bright, exactly the key's size.
<<sfx starRing>>
<<set $KEY_HOLE to 1>>
<<shot on Juno>>
Juno: Don't. Rook. Not yet.
<<shot on Lio>>
Lio is looking at the ground, at the ash, at the way the chimney stacks all lean.
<<shot on Lio>>
Lio: It burned outward. From here. From this door. Every house leans away from it, like something landed.
<<set $LARKSPUR_BURN to 1>>
<<shot on Severin>>
Severin: Or something left.
-> "Not without everyone."
    <<set $KEY_WAIT to "everyone">>
    <<shot on Rook>>
    Rook: Not without everyone. We go home, and we come back with Dagrun, and then we open it.
    <<shot on Bas>>
    Bas: Good. I'd have tied you to the well.
-> "Not without Dagrun."
    <<set $KEY_WAIT to "dagrun">>
    <<shot on Rook>>
    Rook: Not without Dagrun. He took him in. He gets to be here when we knock.
    <<shot on Juno>>
    Juno: ...Yeah. He does.
<<shot wide>>
You put the key back in your pocket. Behind you, the keyhole stays lit, small and patient, like a light somebody left on.
<<set $EP57_DONE to 1>>
===
`;

const RUIN = { stage: "ruins" };
const D = RU.door, FRONT = { x: D.x + Math.sin(D.yaw) * 2.2, z: D.z + Math.cos(D.yaw) * 2.2 }, FACE = D.yaw + Math.PI; // standing in front of it, looking at it

export const EPISODE_57 = {
  id: "ep57",
  number: 57,
  unlockAt: 5,
  setup: { ...AFTER_EP56 },
  title: "Larkspur",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "ruins", type: "cutscene", cutscene: "ep57_ruins" },
    { id: "title", type: "title" },
    { id: "road", type: "scene", node: "Ep57_Road", ...RUIN,
      rook: { x: 0, z: -5.6, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: -1.7, z: -6.2, yaw: 0.3 },
        { id: "bas", look: "bas", x: 1.8, z: -6.4, yaw: -0.3 },
        { id: "lio", look: "lio", x: -3.2, z: -7.2, yaw: 0.4 },
        { id: "tamsin", look: "tamsin", x: 3.3, z: -7.4, yaw: -0.4 },
        { id: "severin", look: "severin", x: -0.4, z: -8.4, yaw: 0.1 },
      ] },
    { id: "village", type: "explore", ...RUIN,
      rook: { x: 0, z: -4, yaw: 0 },
      objective: "Larkspur. The stone with the names, the last house, and the door ({n}/{total}).",
      required: ["stone", "cradle", "door"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 1.6, z: 2.4, yaw: -0.6 },
        { id: "severin", look: "severin", x: -1.4, z: 8.6, yaw: 0.4 },
      ],
      pickups: [
        { id: "stone", x: RU.stone.x + 0.3, z: RU.stone.z - 1.2, node: "Ep57_Stone", label: "The stone with the names" },
        { id: "cradle", x: RU.cradle.x - 0.6, z: RU.cradle.z + 1.0, node: "Ep57_Cradle", label: "The last house" },
        { id: "door", x: FRONT.x, z: FRONT.z, node: "Ep57_Door", label: "The door" },
      ] },
    // The Choir's last faithful, come for the door their Mother promised would open for the unwritten.
    { id: "faithful", type: "fight", ...RUIN, wave: ["acolyte", "acolyte", "cantor", "bulwark"], tokens: 2,
      world: { bounds: ZONES.ruins.bounds, origin: { x: 2, z: 8 } },
      tutorial: [{ at: 0.5, text: "The last of the Choir, come to see their Mother's door open. The cantor's hymn wards the rest: Gale breaks it." }],
      lines: [["Acolyte", "She promised! The door opens for the unwritten!"], ["Juno", "Nobody's opening anything!"]],
      retry: "Up. Not here. Not at this door." },
    { id: "margin", type: "scene", node: "Ep57_Margin", ...RUIN,
      rook: { x: FRONT.x, z: FRONT.z, yaw: FACE },
      cast: [
        { id: "lio", look: "lio", x: FRONT.x - 1.4, z: FRONT.z + 0.4, yaw: FACE + 0.3 },
        { id: "juno", look: "juno", x: FRONT.x - 1.0, z: FRONT.z - 1.3, yaw: FACE + 0.1 },
        { id: "bas", look: "bas", x: FRONT.x + 0.9, z: FRONT.z - 1.4, yaw: FACE - 0.2 },
        { id: "severin", look: "severin", x: FRONT.x - 2.6, z: FRONT.z - 1.0, yaw: FACE + 0.4 },
        { id: "tamsin", look: "tamsin", x: FRONT.x + 2.2, z: FRONT.z - 0.9, yaw: FACE - 0.5 },
      ],
      set: { EP57_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep58",
      lines: [
        "Next time on UNWRITTEN: the end of Arc 6.",
        "Thornwick's ledger. The Bell's last word. A knot, tied again.",
        "Everyone.",
      ] },
  ],
};
