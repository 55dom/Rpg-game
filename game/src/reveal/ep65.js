// Episode 65 · The Warning (GDD §27.6; Phase 7 Step 8, §23.6).
//
// In the caverns under the castle, in front of the mural (a wounded King pouring himself into two kneeling Wings), the
// Lanterns learn what he doesn't know. Three sources: Elodie, who came through the Larkspur door because she could hear
// the drums on the far side, and they aren't marching, they're counting to three; Ash Line Four, the soldier the Gate
// left behind, who came with her and has heard the Line-keepers speak of the waking; and King D's oldest record of the
// Trial, a page about a Rite at a coffin, centuries ago. The Rite needs three offerings: the two who serve, and the one
// they brought home. Rook tries to tell him. He laughs: "They'd have told me." Bas decides something.

import { AFTER_EP64 } from "./arcs.js";
import { ZONES } from "../data/zones.js";

export const EP65_SCRIPT = `
title: Ep65_Mural
---
<<shot wide>>
The caverns under the castle, where nobody goes. Glyphs on the walls in his script. And across the far wall, the mural: a wounded King, pouring black out of himself into two kneeling shapes with wings; and the same two, risen, wingless, robed.
<<shot on Elodie>>
Elodie: I could hear them from Aurelin. The drums. From the other side of the door. So I came through it.
<<shot on Elodie>>
Elodie: They're not marching. Listen. They're counting. One. Two. Three. And again. Three.
<<shot on Four>>
Four: I came with her. Somebody had to. I am the only one of us who knew the way.
<<shot on Four>>
Four: The Line-keepers speak of the waking. The two who went away have come home. The King wakes when three are given at the coffin. The two who serve. And the one they brought back with them.
<<shot on KingD>>
KingD: The oldest page in the Trial's records. Centuries before Corin. A King asleep, a coffin, and a rite: "three given, and the lid lifted." It's never made sense. It does now.
<<shot on Lio>>
Lio: The one they brought back. Fifteen years ago. Through the void, past a soldier's body, and he grinned.
<<shot on Juno>>
Juno: It's him. They're going to give him to it.
<<shot on Juno>>
Juno: And he doesn't know.
===

title: Ep65_Tell
---
<<sfx door>>
<<shot on Cal>>
Cal: You found the mural. Good, isn't it. I spent a long time in front of it, once.
-> "They're going to use you in the Rite."
    <<set $WARNED to "straight">>
    <<shot on Rook>>
    Rook: The Rite needs three. The two of them, and the one they brought back. That's you. They're going to give you to it.
-> "Did they ever tell you what you're for?"
    <<set $WARNED to "ask">>
    <<shot on Rook>>
    Rook: Did they ever tell you what you're for? Ever? In fifteen years?
    <<shot on Cal>>
    For a moment, nothing on his face moves at all.
<<shot on Cal>>
Cal: They'd have told me.
<<shot on Cal>>
He laughs. It's a good laugh. It almost works.
<<shot on Cal>>
Cal: Partners, Rook. I found them as much as they found me. I'm not a piece. I'm the one who moves them.
-> "Please. Just listen to me once."
    <<set $BOND_CAL to $BOND_CAL + 20>>
    <<shot on Rook>>
    Rook: Please. Just once. Listen to me the way I listened to you. Every lesson. Every one.
    <<shot on Cal>>
    Cal: …I'm listening. I just don't believe you. That's different.
-> "Then ask them. To their faces."
    <<shot on Rook>>
    Rook: Then ask them. To their faces. See if they answer.
    <<shot on Cal>>
    Cal: They never answer. That's rather their charm.
<<shot on Bas>>
Bas: He won't listen. Fine.
<<shot on Bas>>
Bas: Then when it happens, I'll be standing next to him. Not for him. Because somebody has to carry the heavy end, and he never let anyone carry his.
-> "We all will."
    <<set $BAS_TRUCE to 1>>
    <<shot on Rook>>
    Rook: We all will. Next to him.
    <<shot on Cal>>
    Cal looks at Bas for a long moment. At the arm he broke.
    <<shot on Cal>>
    Cal: …You're an idiot, Bas.
    <<shot on Bas>>
    Bas: Yeah. You said that in the margin. Different words.
-> "You don't owe him that."
    <<set $BAS_TRUCE to 0>>
    <<shot on Rook>>
    Rook: You don't owe him that, Bas.
    <<shot on Bas>>
    Bas: No. I don't. That's the point.
===

title: Ep65_Drums
---
<<sfx drums>>
<<shot wide>>
The drums change. Not counting now: marching, all through the rock over their heads, every Line in the castle moving at once.
<<shot on Four>>
Four: That is the order. The last Lines. To the coffin.
<<shot on Cal>>
Cal goes quiet. Then the smile comes back, the way a door closes: neatly.
<<shot on Cal>>
Cal: Well. Let's go and see what I'm for.
<<set $EP65_DONE to 1>>
===
`;

const CAV = { stage: "caverns" };

export const EPISODE_65 = {
  id: "ep65",
  number: 65,
  unlockAt: 5,
  setup: { ...AFTER_EP64 },
  title: "The Warning",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "mural", type: "scene", node: "Ep65_Mural", ...CAV,
      rook: { x: 0, z: 9.6, yaw: 0 },
      cast: [
        { id: "elodie", look: "elodie", x: -2.2, z: 11.2, yaw: 0.6 },
        { id: "four", look: "lineSoldier", x: 2.4, z: 11.0, yaw: -0.6 },
        { id: "kingD", look: "kingD", x: 3.4, z: 8.6, yaw: -0.9 },
        { id: "lio", look: "lio", x: -1.8, z: 8.0, yaw: 0.3 },
        { id: "juno", look: "juno", x: -3.4, z: 9.2, yaw: 0.8 },
        { id: "bas", look: "bas", x: 1.6, z: 7.6, yaw: -0.2 },
      ] },
    { id: "title", type: "title" },
    { id: "tell", type: "scene", node: "Ep65_Tell", ...CAV,
      rook: { x: 0, z: 9.6, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 0.6, z: 12.8, yaw: Math.PI },
        { id: "bas", look: "bas", x: 1.9, z: 8.8, yaw: -0.3 },
        { id: "juno", look: "juno", x: -1.9, z: 8.8, yaw: 0.3 },
      ] },
    { id: "keepers", type: "fight", ...CAV, wave: ["throneGuard", "lineSoldier", "throneGuard", "lineSoldier"], tokens: 2,
      world: { bounds: ZONES.caverns.bounds, origin: { x: 0, z: 2 }, companions: ["bas", "juno", "maelisAlly"] },
      tutorial: [{ at: 0.5, text: "The Line-keepers, come for the intruders in the caverns. Maelis prays; keep them off her." }],
      lines: [["Cal", "Don't mind me. I'm just here for the mural."], ["Bas", "Help, then!"]],
      retry: "Up. The drums haven't stopped." },
    { id: "drums", type: "scene", node: "Ep65_Drums", ...CAV,
      rook: { x: 0, z: 4.0, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 0.4, z: 7.2, yaw: Math.PI },
        { id: "four", look: "lineSoldier", x: -2.2, z: 5.6, yaw: 0.8 },
        { id: "juno", look: "juno", x: 2.0, z: 4.4, yaw: -0.4 },
      ],
      set: { EP65_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep66",
      lines: [
        "Next time on UNWRITTEN:",
        "The last Lines, to the coffin. Rook and Cal, side by side.",
        "The Thousand-Door Verse.",
      ] },
  ],
};
