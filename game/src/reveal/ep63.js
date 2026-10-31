// Episode 63 · The Soldier Who Stepped Aside (GDD §27.4; §15.9; §28.4 V5; Phase 7 Step 8, §23.6).
//
// A golden door opens at the edge of the camp, and he steps out of it as if he's late for dinner. Everyone gets their
// moment: Dagrun stands in front of him until he looks (his Arc 7 quest); Tamsin asks him, to his face; Juno's new knot;
// Bas; Severin; Hesper's question about the garden. Then Corin: "You. The one who didn't kill me." "You were more
// interesting alive." And, cheerfully: "You did kill me, actually. Didn't take." He grades Rook once more, from inside
// a door. And Juno's sketchbook (V5): two odd outfits a stranger once paid her for, and in the margin the same white mask
// drawn twice, once smiling, once upside down. He goes quiet for a full beat. "Don't make those for anyone."

import { AFTER_EP62 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { CAMP_LAYOUT as C } from "./places.js";

export const EP63_SCRIPT = `
title: Ep63_Door
---
<<sfx door>>
<<shot wide>>
A golden door frame opens at the edge of the camp, and he steps out of it the way he used to step into the Lighthouse kitchen: late, unbothered, already smiling.
<<shot on Cal>>
Cal: You found the key. And the door. And the Line, and the Trial, and the mess table. I'm almost proud. Don't tell anyone.
<<shot on Dagrun>>
Dagrun walks up to him. Right up. Close enough that he'd have to step back, or look.
<<shot on Dagrun>>
Dagrun: Look at me.
<<shot on Cal>>
For a long moment he looks anywhere else. The tents. The ash. The door behind him.
<<shot on Cal>>
Cal: …Hello, Dagrun.
<<set $DAGRUN_LOOKED to 1>>
<<shot on Dagrun>>
Dagrun: There. Was that so hard.
<<shot on Cal>>
Cal: Yes. Actually.
<<shot on Tamsin>>
Tamsin: Did you like it? Living with us. You said you did. Did you mean it?
<<shot on Cal>>
Cal: …Yes. That was the trouble.
<<shot on Cal>>
His eyes go to Juno's wrist, to the new red knot there.
<<shot on Cal>>
Cal: You tied a better one.
<<shot on Juno>>
Juno: Not for you.
<<shot on Bas>>
Bas: One step closer and I break your arm. Fair's fair.
<<shot on Severin>>
Severin: You used my father. You used my brother's grave.
<<shot on Cal>>
Cal: Your father used himself. I held the door. Aurek… I was fond of Aurek. Leave it there.
-> "Hesper asked: do you remember the garden?"
    <<set $GARDEN_ASKED to 1>>
    <<shot on Rook>>
    Rook: Someone asked me to ask you something. Do you remember the garden?
    <<shot on Cal>>
    His smile slips, just for a moment, like a foot on a stair that isn't there.
    <<shot on Cal>>
    Cal: …Tell her yes. Don't tell her anything else.
-> "Why didn't you come back?"
    <<set $GARDEN_ASKED to 0>>
    <<shot on Rook>>
    Rook: Why didn't you come back? You knew where we were. You always knew.
    <<shot on Cal>>
    Cal: I did come back. Every day for six years. You just thought I lived there.
===

title: Ep63_Corin
---
<<shot two Corin Cal>>
Corin has been staring at him since the door opened.
<<shot on Corin>>
Corin: You. The one who didn't kill me.
<<shot on Cal>>
Cal: You were more interesting alive.
<<shot on Cal>>
Cal: You did kill me, actually. At the throne-room doors. Didn't take.
<<shot on Corin>>
Corin: …Fifteen years. I've wondered every month why a soldier let me go.
<<shot on Cal>>
Cal: And now you know: it was a whim. Isn't that worse? Come on, Rook. Let me see what the margins taught you.
===

title: Ep63_Sketch
---
<<shot wide>>
Afterwards, by the cart, Juno has her sketchbook open on her knee, the one she's carried since she was twelve. She isn't drawing. She's turning pages.
<<shot on Juno>>
Juno: A stranger paid me for these once. Years ago, before the squad. Two outfits. Odd ones. I never saw them again.
<<shot on Juno>>
Two black suits. One with a dark-blue tie. One with a pink tie, a long skirt slit to the thigh, frills at the cuffs. And in the margin, the same white mask drawn twice: once smiling, once upside down, frowning.
<<shot on Cal>>
He goes quiet. Not the quiet he does for effect. A full beat of nothing at all.
<<shot on Cal>>
Cal: Don't make those for anyone.
<<shot on Juno>>
Juno: …Fashion critic now?
<<shot on Cal>>
He doesn't answer. He opens a door, and steps through it, and it closes behind him from the other side.
<<set $V5_SEEN to 1>>
<<set $BOND_CAL to $BOND_CAL + 10>>
<<set $EP63_DONE to 1>>
===
`;

const CAMP = { stage: "camp" };
const E = { x: -4, z: -16 }; // the edge of the camp, south of the yard, where his door opens

export const EPISODE_63 = {
  id: "ep63",
  number: 63,
  unlockAt: 5,
  setup: { ...AFTER_EP62 },
  title: "The Soldier Who Stepped Aside",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "door", type: "scene", node: "Ep63_Door", ...CAMP,
      rook: { x: E.x + 0.4, z: E.z + 3.4, yaw: Math.PI },
      cast: [
        { id: "cal", look: "unmasked", x: E.x, z: E.z, yaw: 0 },
        { id: "dagrun", look: "dagrun", x: E.x - 0.4, z: E.z + 1.6, yaw: Math.PI },
        { id: "tamsin", look: "tamsin", x: E.x - 2.2, z: E.z + 3.2, yaw: Math.PI - 0.5 },
        { id: "juno", look: "juno", x: E.x + 2.0, z: E.z + 3.6, yaw: Math.PI + 0.4 },
        { id: "bas", look: "bas", x: E.x + 3.0, z: E.z + 2.0, yaw: Math.PI + 0.8 },
        { id: "severin", look: "severin", x: E.x - 3.2, z: E.z + 1.6, yaw: Math.PI - 0.9 },
      ] },
    { id: "title", type: "title" },
    { id: "corinMeets", type: "scene", node: "Ep63_Corin", ...CAMP,
      rook: { x: E.x + 1.6, z: E.z + 3.0, yaw: Math.PI + 0.3 },
      cast: [
        { id: "cal", look: "unmasked", x: E.x, z: E.z, yaw: 0.4 },
        { id: "corin", look: "corinNow", x: E.x + 1.4, z: E.z + 1.4, yaw: Math.PI + 0.8 },
        { id: "maelis", look: "maelisNow", x: E.x + 3.2, z: E.z + 2.2, yaw: Math.PI + 0.9 },
      ] },
    // He grades Rook once more, from his door: he can't be put down, and he isn't trying.
    { id: "grade", type: "fight", ...CAMP, wave: [], tokens: 2,
      world: { bounds: ZONES.camp.bounds, origin: { x: E.x, z: E.z + 2 }, companions: false },
      siege: {
        foes: [{ kind: "calRite", x: E.x, z: E.z, yaw: 0, floor: 0.7 }],
        meter: { label: "Graded", start: 1, end: 0, seconds: 35, perKill: 0 },
        marks: [
          { frame: 500, say: ["Cal", "Better. Your left foot's still lazy."] },
          { frame: 1200, say: ["Cal", "There. That one. Do that again."] },
          { frame: 1800, say: ["Cal", "Ha. All right. You've been practising."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "Cal, grading you again. He can't be put down, and he isn't trying. Show him something interesting." }],
      lines: [["Cal", "Come on, then."]],
      retryBy: "Cal", retry: "Again. You were doing so well." },
    { id: "sketch", type: "scene", node: "Ep63_Sketch", ...CAMP,
      rook: { x: C.carts[0][0] - 2.6, z: C.carts[0][1] - 2.8, yaw: 0.6 },
      cast: [
        { id: "juno", look: "juno", x: C.carts[0][0] - 2.2, z: C.carts[0][1] - 1.0, yaw: 1.2, pose: "sit" },
        { id: "cal", look: "unmasked", x: C.carts[0][0] - 4.2, z: C.carts[0][1] - 1.4, yaw: 1.4 },
      ],
      set: { EP63_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep64",
      lines: [
        "Next time on UNWRITTEN:",
        "The castle. The Throne Guard Lines, in formation.",
        "And two places beside the throne that have stood empty for fifteen years.",
      ] },
  ],
};
