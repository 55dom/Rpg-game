// Episode 58 · Everyone (GDD §14 Arc 6 "preparing to cross the Gate"; §15.9; Backlash Ch 6–7; Phase 7 Step 4, §23.6).
// The end of Arc 6.
//
// Thornwick: Mother Wren's ledger, "brought in by a boy who didn't speak", and the afternoon, years later, a Lantern
// stood at the fence and watched a child hit a post with a stick, and never came in. The Bell Tower: Captain Graves puts
// the Lanterns back on the Crown's rolls ("the paper said there was nothing in your book; I've decided that's the most
// honest thing anyone's shown me this year"), and Hesper, in the ring, has a message: ask him if he remembers the
// garden. The Lighthouse: Juno ties a new knot (§15.9: "later, quietly ties a new one"); Bas is coming, not for him;
// Severin at the door; Dagrun: everyone. One last spar in the yard. That night the light is on, and at dawn they go.

import { AFTER_EP57 } from "./arcs.js";
import { ZONES, BELLTOWER_LAYOUT as BTL } from "../data/zones.js";

export const EP58_SCRIPT = `
title: Ep58_Wren
---
<<shot on Wren>>
Wren: I wondered when you'd ask. Most of you ask at twelve, and then again at twenty. You never asked at all.
<<shot on Wren>>
She opens the ledger at a page gone soft with handling, and turns it so you can read it.
<<shot on Wren>>
Wren: "Brought in by a boy who didn't speak." That's all I wrote. There were nine of you that winter, and I was busy, and he was gone before I'd found a blanket.
<<shot on Wren>>
Wren: He came back, you know. Years later. Taller, in a Lantern's coat. He stood at that fence a whole afternoon, watching you hit the post with a stick.
<<shot on Wren>>
Wren: Never came in. I asked if he wanted to. He said, "No. Look at that. Nobody's told them how." And he laughed, and went.
-> "He was watching me grow up."
    <<set $WREN_ANSWER to "watching">>
    <<shot on Rook>>
    Rook: He was watching me. All that time.
    <<shot on Wren>>
    Wren: Somebody was. I'll take somebody, for a child of mine. I'll worry about who later.
-> "He should have come in."
    <<set $WREN_ANSWER to "in">>
    <<shot on Rook>>
    Rook: He should have come in.
    <<shot on Wren>>
    Wren: Yes. He should. Tell him I said so, when you find him. Tell him the kettle was on.
===

title: Ep58_Leave
---
<<shot on Ulric>>
Ulric: Cross where, exactly?
<<shot on Rook>>
Rook: Wherever that door goes.
<<shot on Ulric>>
Ulric: Mm. You know what's on the far side of the last door that opened in this city. You held the bridge against it.
<<shot on Ulric>>
Ulric: The Bell's finding, amended. The Last Lanterns go back on the Crown's rolls. The warden comes home. Merit stands.
<<set $MERIT_FROZEN to 0>>
<<set $BELL_WARDEN_POSTED to 0>>
<<set $LANTERNS_RESTORED to 1>>
<<set $REP_SQUAD to $REP_SQUAD + 15>>
<<shot on Ulric>>
Ulric: The paper never lied to me, Lantern. It said there was nothing in your book. I've decided that's the most honest thing anyone's shown me this year.
<<shot on Hesper>>
In the ring, Hesper lifts her head.
<<shot on Hesper>>
Hesper: When you find him. Ask him if he remembers the garden.
<<shot on Hesper>>
Hesper: Don't tell him it was me who asked.
<<set $HESPER_MESSAGE to 1>>
<<shot on Ulric>>
Ulric: And Lantern. You've still got my bell.
<<shot on Ulric>>
Ulric: Ring it.
===

title: Ep58_Table
---
<<shot wide>>
Evening at the Lighthouse. Nobody's said it yet. Everyone's packed anyway.
<<shot on Juno>>
Juno has a length of red cord across her knee, and she's tying it, slowly, the way you'd tie something you mean to keep.
<<shot on Juno>>
Juno: Don't. Don't say anything. I'm not doing it for him.
<<shot on Juno>>
Juno: ...I'm doing it because I'm scared. He was right about that. He doesn't get to be right about the rest.
<<set $JUNO_KNOT to 1>>
<<set $CAL_JUNO to "unresolved">>
<<shot on Bas>>
Bas: I'm coming. Before anyone asks. Not for him.
<<shot on Bas>>
Bas: For you lot. Somebody's got to carry the heavy end, and it won't be him. Not this time.
<<set $BAS_CROSSING to "reluctant">>
<<shot on Tamsin>>
Tamsin: I'm going to ask him. To his face. If he liked it here.
<<shot on Lio>>
Lio: I can read his writing now. Somebody should be there who can read his writing.
<<shot wide>>
There's a knock at the door. Severin, in travelling clothes, his rapier on his back, as if he'd been standing there a while deciding whether to knock.
<<shot on Severin>>
Severin: He used my father. He used my brother's grave. I want to hear him say why. I'm coming, unless anyone has a better argument than "you're a Valcourt."
<<set $SEVERIN_CROSSING to 1>>
<<shot on Dagrun>>
Dagrun stands up from the end of the table. Everyone stops.
<<shot on Dagrun>>
Dagrun: We're all going. Everyone. That's the order.
<<set $DAGRUN_CROSSING to 1>>
<<shot on Dagrun>>
Dagrun: First time I've given one in a while. Anybody got a problem with it, take it up with the squad board. It's been saying the same thing for fifteen years.
-> "Everyone."
    <<set $ROOK_ORDER to "everyone">>
    <<shot on Rook>>
    Rook: Everyone.
    <<shot on Dagrun>>
    Dagrun: Everyone.
-> "Then let's bring him home."
    <<set $ROOK_ORDER to "home">>
    <<shot on Rook>>
    Rook: Then let's go and bring him home.
    <<shot on Bas>>
    Bas: Or bring him back in a sack. Either way, we bring him.
<<shot on Juno>>
Juno: One more round in the yard first. I'm not crossing into anywhere with a squire who's gone soft sitting in a Bell Tower.
===

title: Ep58_Light
---
<<shot wide>>
That night. The packs are by the door. Up in the lantern room the light burns, and Dagrun is on the step under it.
<<pose Rook sit>>
<<shot wide>>
You sit down beside him, the way you have every night since the bridge.
<<shot on Dagrun>>
Dagrun: I'll leave it on. While we're gone.
<<shot on Dagrun>>
Dagrun: Somebody's got to find their way back.
<<set $LIGHT_LEFT_ON to 1>>
<<shot wide>>
At dawn the Lanterns walk out of the Lighthouse together, all of them, down the road toward Larkspur. Behind them, the light is still on.
<<set $EP58_DONE to 1>>
<<set $ARC6_DONE to 1>>
===
`;

const TW = { stage: "thornwick" }, BT = { stage: "belltower" }, LH = { stage: "lighthouse" };
const MORNING = { sky: { daylight: 0.5 } }, DUSK = { sky: { daylight: 0.22 } }, NIGHT = { sky: { daylight: 0.06 } };
const R = BTL.ring, J = BTL.judge;
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "dagrun", look: "dagrun", x: 5.0, z: 9.6, yaw: Math.PI },
];

export const EPISODE_58 = {
  id: "ep58",
  number: 58,
  unlockAt: 5,
  setup: { ...AFTER_EP57 },
  title: "Everyone",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "wren", type: "scene", node: "Ep58_Wren", ...TW, ...MORNING,
      rook: { x: 1.4, z: 11.4, yaw: 0.54 },
      cast: [
        { id: "wren", look: "wren", x: 2.6, z: 13.4, yaw: Math.PI + 0.54 },
        { id: "juno", look: "juno", x: -0.4, z: 10.8, yaw: 0.7 },
      ] },
    { id: "title", type: "title" },
    { id: "leave", type: "scene", node: "Ep58_Leave", ...BT,
      rook: { x: R.x + 1.4, z: R.z + 1.2, yaw: -0.2 },
      cast: [
        { id: "ulric", look: "ulric", x: J.x, z: J.z, yaw: Math.PI },
        { id: "hesper", look: "hesper", x: R.x - 0.6, z: R.z - 0.2, yaw: 0.6, pose: "sit" },
        { id: "bellWarden", look: "bellWarden", x: -2.6, z: J.z + 0.3, yaw: Math.PI },
      ] },
    { id: "table", type: "scene", node: "Ep58_Table", ...LH, ...DUSK,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [...atTable, { id: "severin", look: "severin", x: 1.6, z: 3.0, yaw: 1.0 }] },
    // One last round in the yard: Juno and Bas, sparring for real (they can't be put down).
    { id: "spar", type: "fight", ...LH, ...DUSK, wave: [], tokens: 2,
      world: { bounds: ZONES.lighthouse.bounds, origin: { x: 0, z: -4 }, companions: false },
      siege: {
        foes: [
          { kind: "junoFoe", x: -2.4, z: -1.6, yaw: Math.PI, floor: 0.3 },
          { kind: "basFoe", x: 2.4, z: -1.6, yaw: Math.PI, floor: 0.3 },
        ],
        meter: { label: "One More Round", start: 1, end: 0, seconds: 35, perKill: 0 },
        marks: [
          { frame: 500, say: ["Dagrun", "Feet, Rook. Watch your feet."] },
          { frame: 1200, say: ["Bas", "Left, left, back— no. We don't do that one."] },
          { frame: 1700, say: ["Juno", "Better. Not soft. Better."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "ONE MORE ROUND. Juno and Bas, sparring for real. Last until the round's up." }],
      lines: [["Juno", "Come on, squire."]],
      retryBy: "Juno", retry: "Again. You're not crossing anywhere like that.",
      set: { LAST_SPAR: 1 } },
    { id: "light", type: "scene", node: "Ep58_Light", ...LH, ...NIGHT,
      rook: { x: -2.9, z: 9.7, yaw: Math.PI },
      cast: [{ id: "dagrun", look: "dagrun", x: -4.2, z: 9.7, yaw: Math.PI, pose: "sit" }],
      set: { EP58_DONE: 1, ARC6_DONE: 1 } },
    { id: "preview", type: "preview",
      lines: [
        "Next time on UNWRITTEN: Arc 7, Unwritten.",
        "\"Doors don't have locks. They have keys.\"",
        "The other side.",
      ] },
  ],
};
