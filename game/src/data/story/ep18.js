// Episode 18 · I'll Hold the Door (GDD §14 Arc 2; Boss 7; §15.5 A1). The end of Arc 2.
//
// The Hollow Bloom at the heart of the stones, the height of a house, and Hesper gone into the light smiling. When it
// opens all the way it erases the border, and Aurelin is on the other side of the border. Boss 7. In its last phase,
// Cal opens a Threshold, pushes the Bloom through, and steps through after it, and the door slams shut in white light.
// Nothing remains: no body, no grimoire. His last line, to Rook: "I'll hold the door. Don't wait up." Lio: "There's no
// residue. None." (A1.) At the Lighthouse that night his lantern is dark. Nobody says anything. No music.

import { AFTER_EP17 } from "./arc12.js";
import { ZONES, HOLLOWMARCH_LAYOUT as H } from "../zones.js";

export const EP18_SCRIPT = `
title: Ep18_Stones
---
<<shot wide>>
The Bloom stands in the ring of stones where Hesper stood: a pale flower the height of a house, petals like blank paper, a white heart that hurts to look at. Hesper's gone. She smiled, and stepped into the light, and it closed over her.
<<shot on Lio>>
Lio: It's still opening. When it opens all the way it'll erase everything around it. The stones. The border.
<<shot on Lio>>
Lio: Aurelin's on the other side of the border.
<<shot on Dagrun>>
Dagrun: Then it doesn't open all the way. Lanterns.
<<shot on Cal>>
Cal: Stay behind me. All of you. I'm serious, for once. Write it down.
===

title: Ep18_Door
---
<<shot wide>>
The Bloom is coming apart and coming open at once, its petals peeling white into the air, its heart swelling. The ground under it is starting to go blank, like paper.
<<shot on Lio>>
Lio: It's going to go! It's going to go and we can't stop it!
<<shot on Cal>>
Cal steps past you. Past all of you. Between you and it. He's not hurrying.
<<shot on Cal>>
Cal: Doors, Lio. I make doors.
<<shot on Cal>>
He looks back at you, just once, over his shoulder, and smiles the way he does when he's about to say something stupid.
<<shot on Cal>>
Cal: I'll hold the door. Don't wait up.
===

title: Ep18_Nothing
---
<<shot wide>>
White. Then less white. Then the Hollowmarch again, grey and quiet, and the ring of stones, and nothing in the middle of it at all.
<<shot wide>>
No Bloom. No door. No body. No grimoire. The ground where he stood is just ground.
<<shot on Juno>>
Juno: Cal.
<<shot on Juno>>
Juno: Cal!
<<shot on Lio>>
Lio is on his knees at the edge of the ring with his hands flat on the grey, the way he'd read a page.
<<shot on Lio>>
Lio: There's no residue. None. Not his. Not anything. It's like he was never here.
<<set $CLUE_A1 to 1>>
<<shot on Dagrun>>
Dagrun doesn't say anything. He stands at the edge of the stones for a long time, and then he turns round and starts walking south, and one by one, so do the rest of you.
===

title: Ep18_Lantern
---
<<shot wide>>
The Lighthouse, that night. The lamp in the lantern room still turns. Nobody's lit the stove. Nobody's eaten.
<<shot wide>>
On the shelf by the door, seven lanterns in a row. The second from the left has gone dark.
<<set $CAL_STATE to 1>>
<<shot wide>>
Nobody says anything. There isn't anything to say.
<<set $EP18_DONE to 1>>
<<set $ARC2_DONE to 1>>
===
`;

const HM = { stage: "hollowmarch" }, LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.05 } }, G = H.gate;

export const EPISODE_18 = {
  id: "ep18",
  number: 18,
  setup: { ...AFTER_EP17 },
  title: "I'll Hold the Door",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "stones", type: "scene", node: "Ep18_Stones", ...HM,
      rook: { x: 0, z: 2.6, yaw: 0 },
      cast: [
        { id: "lio", look: "lio", x: -2.0, z: 2.2, yaw: 0.4 },
        { id: "dagrun", look: "dagrun", x: 2.4, z: 1.6, yaw: -0.4 },
        { id: "cal", look: "cal", x: 0.8, z: 4.8, yaw: 0 },
        { id: "juno", look: "juno", x: -3.4, z: 0.8, yaw: 0.6 },
      ] },
    // Boss 7: the Bloom can't be killed, only held back until it opens; then he holds the door.
    { id: "bloom", type: "fight", ...HM, wave: [], tokens: 2, camera: { pitch: 0.1 }, // a flatter look: the whole flower in frame
      world: { bounds: ZONES.hollowmarch.bounds, origin: { x: G.x, z: G.z - 6 } },
      siege: {
        foes: [
          { kind: "hollowBloom", x: G.x, z: G.z, yaw: Math.PI, floor: 0.25, bar: true },
          { kind: "shell", x: G.x - 4, z: G.z - 4, yaw: Math.PI },
          { kind: "shell", x: G.x + 4, z: G.z - 4, yaw: Math.PI },
        ],
        meter: { label: "Until It Opens", start: 1, end: 0, seconds: 70, perKill: 0 },
        marks: [
          { frame: 700, say: ["Cal", "It's getting bigger. I don't like bigger."] },
          { frame: 1500, say: ["Juno", "It's not stopping! Why isn't it stopping?"] },
          { frame: 1960, say: ["Rook", "...I've been here. I've never been here."] }, // inside its petals (P3): a fire, long ago
          { frame: 2460, say: ["Juno", "Hey! You went somewhere. Stay with us!"] },
          { frame: 2600, say: ["Lio", "It's nearly open!"] },
          { frame: 3600, say: ["Cal", "All right. My turn."] },
        ],
      },
      tutorial: [{ at: 0.5, low: true, text: "BOSS 7 · THE HOLLOW BLOOM. Its pulse erases whatever stands in it: when the core flashes, get out. Hold it back as long as you can." }],
      eventHints: { // its phases (GDD §16 B7), on the clock
        holeOpen: "It's erasing the ground. Don't stand on the blank: it takes a bite out of you too.",
        pageErased: "It's erasing your pages! That spell's blank for a few seconds: use another.",
      },
      lowHints: true,
      lines: [["Dagrun", "Hold it! Hold it back!"]],
      retryBy: "Dagrun", retry: "Up. Together. Again.",
      set: { BLOOM_FOUGHT: 1 } },
    { id: "doorScene", type: "scene", node: "Ep18_Door", ...HM,
      rook: { x: 0, z: G.z - 9.0, yaw: 0 },
      cast: [
        { id: "cal", look: "cal", x: 0.4, z: G.z - 6.8, yaw: Math.PI - 0.3 },
        { id: "lio", look: "lio", x: -2.0, z: G.z - 9.6, yaw: 0.4 },
        { id: "juno", look: "juno", x: 2.0, z: G.z - 9.8, yaw: -0.4 },
      ] },
    { id: "door", type: "cutscene", cutscene: "ep18_door" },
    { id: "nothing", type: "scene", node: "Ep18_Nothing", ...HM,
      rook: { x: 0, z: G.z - 9.0, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: 2.0, z: G.z - 9.4, yaw: -0.3 },
        { id: "lio", look: "lio", x: -0.6, z: G.z - 6.4, yaw: 0.2, pose: "kneel" },
        { id: "dagrun", look: "dagrun", x: -3.0, z: G.z - 10.2, yaw: 0.4 },
        { id: "bas", look: "bas", x: 3.6, z: G.z - 11.0, yaw: -0.5 },
      ] },
    { id: "lantern", type: "scene", node: "Ep18_Lantern", ...LH, ...NIGHT,
      rook: null,
      cast: [
        { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
        { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
        { id: "dagrun", look: "dagrun", x: -4.0, z: 9.7, yaw: Math.PI, pose: "sit" },
      ],
      set: { EP18_DONE: 1, ARC2_DONE: 1, CAL_STATE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep19",
      lines: [
        "UNWRITTEN",
        "Arc 2 · The Lantern That Went Out",
        "Next: Arc 3, Ashes and Echoes.",
      ] },
  ],
};
