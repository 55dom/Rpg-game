// Episode 34 · Brother? (GDD §14 Arc 4, §15.7 Encounter IV). Aldric walks the Writ down through the Lowmarket himself,
// on foot, under guard. The Lanterns watch from under the fish stall. At the grate, the door below sends for its map:
// empty armor climbs up out of the dark, and the Lanterns and the Lances fight it side by side. Then a black tear opens
// in the street. Halvard steps into the knight's way and goes down; the knight takes the Writ out of the Chancellor's
// hands and raises the glaive over him, and Severin gets there first. "...Brother?" The knight stops, and goes.

import { AFTER_EP33 } from "./arc4.js";
import { ZONES } from "../zones.js";
import { CONVOY as CV } from "./cutscenes.js";

export const EP34_SCRIPT = `
title: Ep34_Cold
---
<<shot wide>>
The Crown Ward, an hour before midnight. Four Lances with a lantern each, and the Chancellor on foot between them.
<<shot on Halvard>>
Halvard: My lord, there's a carriage.
<<shot on Aldric>>
Aldric: Carriages can be stopped. I'll walk. If anyone asks what's in the case, it's a will.
<<shot on Halvard>>
Halvard: Whose, my lord?
<<shot on Aldric>>
Aldric: Whoever asks.
===

title: Ep34_Stalls
---
<<shot wide>>
The Lowmarket after midnight, the stalls shut up and roped. The Lanterns wait in the dark under the fish stall's canopy, where it still smells of fish.
<<shot on Severin>>
Severin: He's walking it himself. My father doesn't walk anywhere.
<<shot on Juno>>
Juno: Then he's scared of something.
<<shot on Lio>>
Lio: Or he wants to be seen carrying it.
<<sfx drums>>
<<shot on Tamsin>>
Tamsin: ...Is anyone else hearing that? Please say yes.
<<shot two Severin Rook>>
-> "We watch. That's all." #earnest
    Severin: We watch.
-> "If it goes wrong, we go in." #bold
    Severin: If it goes wrong, I go in first. He's my father.
===

title: Ep34_Grate
---
<<shot wide>>
The convoy comes down the street toward the grate, lanterns swinging. Then the iron cover of the grate lifts by itself, and slides away into the gutter.
<<show shellA>>
<<show shellB>>
<<shot on shellA>>
Empty armor, climbing up out of the dark, hand over hand.
<<shot on Lio>>
Lio: The door wants its map.
<<shot on Halvard>>
Halvard: Lances! Round the Chancellor!
<<shot on Severin>>
Severin: Lanterns. Now.
===

title: Ep34_Brother
---
<<shot two Severin Masked>>
Severin stands between the glaive and his father with his rapier up, and his arm is shaking, and he doesn't move.
<<shot on Severin>>
Severin: ...Brother?
<<shot on Masked>>
The masked knight doesn't move either. The glaive stays up. For a long moment, the only sound in the street is the drums under it.
<<shot on Severin>>
Severin: Aurek. It's me. It's Sev.
<<shot on Masked>>
Then, slowly, the glaive comes down.
<<shot two Rook Masked>>
-> "Who are you?" #earnest
    He doesn't answer. He doesn't even look at you. He's looking at Severin.
-> "Put the Writ down." #bold
    He doesn't answer. The case stays under his arm.
<<fx tear Masked>>
<<hide Masked>>
<<shot wide>>
A black tear, and he's gone, and the Writ with him.
<<set $SABLE_ENCOUNTER to 4>>
<<set $WRIT_STOLEN to 1>>
===

title: Ep34_After
---
<<shot on Aldric>>
Aldric: You stood in front of me.
<<shot on Severin>>
Severin: He stopped. Did you see? He stopped for me. Aurek would have stopped.
<<shot on Aldric>>
Aldric: Your brother is dead, Severin. I buried an empty box with his name on it, and I know exactly how empty it was.
<<shot on Severin>>
Severin: Then who did you bury?
<<shot on Halvard>>
Halvard: My lord. The Writ.
<<shot on Aldric>>
Aldric: Let it go. I've read it. I know where the door is. And so, it seems, does he.
<<shot on Aldric>>
Aldric: Go home, Severin. Thank your friends for me. I find I can't.
<<set $SEVERIN_SAVED_ALDRIC to 1>>
===

title: Ep34_Home
---
<<shot wide>>
The Lighthouse, near dawn. Nobody has gone to bed.
<<shot on Elodie>>
Elodie: Was it him?
<<shot on Severin>>
Severin: He stopped. When I said his name, he stopped.
<<shot on Juno>>
Juno: A mask isn't anybody's brother, Severin. I said it before.
<<shot on Severin>>
Severin: Then why did it stop?
<<shot on Juno>>
Juno: ...I don't know.
<<shot on Lio>>
Lio: The Writ was a map of the door. Whoever has it knows where to stand when it opens.
<<shot on Dagrun>>
Dagrun: And Aldric doesn't need it any more. He's read it. Which means the next thing he needs isn't a map. It's the city.
===
`;

const AU = { stage: "aurelin" }, NIGHT = { sky: { daylight: 0.05 } }, LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 };   // the Lighthouse's long table
const GRATE = { x: 30, z: -24 };
// The fight by the grate: the Lowmarket's south end, with its stalls, shacks and lamp in the way, centred where the convoy stood.
const STREET = { rect: [14, -30, 40, -9.5], solids: ZONES.aurelin.bounds.solids };

export const EPISODE_34 = {
  id: "ep34",
  number: 34,
  unlockAt: 5,
  setup: { ...AFTER_EP33 },
  title: "Brother?",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep34_Cold", ...AU, ...NIGHT, rook: null,
      cast: [
        { id: "aldric", look: "aldric", x: -24.0, z: 24.6, yaw: 2.2 },
        { id: "halvard", look: "halvardFace", x: -22.0, z: 23.4, yaw: -1.6 },
        { id: "lance1", look: "lance", x: -25.8, z: 22.4, yaw: 0.8 },
        { id: "lance2", look: "lance", x: -21.8, z: 25.8, yaw: -2.4 },
      ] },
    { id: "title", type: "title" },
    { id: "stalls", type: "scene", node: "Ep34_Stalls", ...AU, ...NIGHT,
      rook: { x: 19.8, z: -11.4, yaw: 2.6 },
      cast: [
        { id: "severin", look: "severin", x: 18.2, z: -12.6, yaw: 2.4 },
        { id: "juno", look: "juno", x: 21.2, z: -12.8, yaw: -2.8 },
        { id: "lio", look: "lio", x: 17.4, z: -10.8, yaw: 2.0 },
        { id: "tamsin", look: "tamsin", x: 21.0, z: -10.0, yaw: -2.4 },
      ] },
    { id: "grate", type: "scene", node: "Ep34_Grate", ...AU, ...NIGHT,
      rook: { x: 19.8, z: -11.6, yaw: 2.4 },
      cast: [
        { id: "aldric", look: "aldric", x: CV.aldric.x, z: CV.aldric.z, yaw: 2.4 },
        { id: "halvard", look: "halvardFace", x: CV.halvard.x, z: CV.halvard.z, yaw: 2.6 },
        { id: "lance1", look: "lance", x: 25.6, z: -14.6, yaw: 2.6 },
        { id: "lance2", look: "lance", x: 22.4, z: -12.6, yaw: 2.6 },
        { id: "shellA", look: "shell", x: GRATE.x - 1.2, z: GRATE.z + 1.8, yaw: -0.8, hidden: true },
        { id: "shellB", look: "shell", x: GRATE.x + 1.4, z: GRATE.z + 1.6, yaw: -1.2, hidden: true },
        { id: "severin", look: "severin", x: 18.2, z: -12.8, yaw: 2.4 },
        { id: "juno", look: "juno", x: 18.0, z: -10.4, yaw: 2.2 },
        { id: "lio", look: "lio", x: 16.6, z: -11.6, yaw: 2.0 },
      ] },
    { id: "hollow", type: "fight", ...AU, ...NIGHT, wave: ["shell", "shell", "shell"], tokens: 2,
      world: { bounds: STREET, origin: { x: 25, z: -18 } },
      tutorial: [{ at: 0.5, text: "Empty armor again. A red glint is the overhead (step aside), and each one gets up once." }],
      eventHints: { reform: "It's pulling itself back together. Knock it down again, and it stays down." },
      lines: [["Juno", "Fighting next to Lances. Don't tell anyone."], ["Severin", "Keep them off my father!"]],
      retry: "Up. The Writ's still in the street." },
    { id: "brother-cut", type: "cutscene", cutscene: "ep34_brother" },
    { id: "brother", type: "scene", node: "Ep34_Brother", ...AU, ...NIGHT,
      rook: { x: 20.6, z: -13.4, yaw: 2.0 },
      cast: [
        { id: "masked", look: "masked", x: CV.knight.x, z: CV.knight.z, yaw: 0 },
        { id: "severin", look: "severin", x: CV.between.x, z: CV.between.z, yaw: Math.PI },
        { id: "aldric", look: "aldric", x: CV.back.x, z: CV.back.z, yaw: Math.PI },
        { id: "halvard", look: "halvardFace", x: CV.block.x, z: CV.block.z, yaw: 0.6, down: true },
        { id: "juno", look: "juno", x: 26.4, z: -13.6, yaw: -2.2 },
      ] },
    { id: "after", type: "scene", node: "Ep34_After", ...AU, ...NIGHT,
      rook: { x: 21.0, z: -13.2, yaw: 2.0 },
      cast: [
        { id: "aldric", look: "aldric", x: CV.back.x, z: CV.back.z, yaw: Math.PI },
        { id: "severin", look: "severin", x: CV.between.x, z: CV.between.z, yaw: 0 },
        { id: "halvard", look: "halvardFace", x: CV.block.x + 0.4, z: CV.block.z + 0.4, yaw: 0.4 },
        { id: "juno", look: "juno", x: 26.4, z: -13.6, yaw: -2.2 },
      ],
      set: { SABLE_ENCOUNTER: 4 } },
    { id: "home", type: "scene", node: "Ep34_Home", ...LH, sky: { daylight: 0.2 },
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "severin", look: "severin", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "elodie", look: "elodie", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "juno", look: "juno", x: TABLE.x + 0.4, z: TABLE.z - 3.4, yaw: -0.2 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ],
      set: { EP34_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep35",
      lines: [
        "Next time on UNWRITTEN:",
        "The Chancellor has read his map. Now he wants the city.",
        "And the only thing between him and the gates is the City Watch.",
      ] },
  ],
};
