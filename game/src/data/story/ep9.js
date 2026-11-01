// Episode 9 · The Royal Festival (GDD §14 Arc 2; §15.5 S6 alibi; §15.7 Aurek).
//
// Aurelin in bunting. The Lanterns are promoted a rank on the Merit roll (a ribbon, handed to Dagrun, who'd rather be
// asleep). The festival: Juno's stall in the Lowmarket, selling her Quill-knot cords to anyone with a copper (so anyone
// can own one, S6's alibi); a girl in the doorway of a tall blue-roofed house in the Crown Ward, gone inside before you
// can wave (first glimpse of Elodie). Pickpockets in the crowd; and while you chase them, Severin pulls a child out from
// under a collapsing stall you never saw fall. Afterwards he snubs you in front of everyone, and then, by the fountain,
// the pendant: "It was my brother's. Aurek. The Hollowmarch, six years ago. They never found him."

import { AFTER_EP8 } from "./arc12.js";
import { ZONES } from "../zones.js";

export const EP9_SCRIPT = `
title: Ep9_Ribbon
---
<<shot wide>>
The Royal Festival. Bunting across every street in Aurelin, bells in every tower, and a crier in a new coat reading out the Merit roll by the fountain.
<<shot on Crier>>
Crier: The Last Lanterns, Captain Dagrun Holt! Up one rank on the roll! For services in the Greywater Fens and at the Tower of Choosing!
<<shot on Dagrun>>
Dagrun takes the ribbon the way you'd take a wet fish.
<<shot on Dagrun>>
Dagrun: Thanks. Lovely. Can I go home now.
<<shot on Cal>>
Cal: No. You're going to stand in the sun and be proud of us, and then you're going to buy me a honey bun. Those are the rules.
<<set $RANK_UP to 1>>
===

title: Ep9_Stall
---
<<shot on Juno>>
Juno has a stall in the Lowmarket, a board on two barrels, covered in red cords, every one of them tied in a Quill knot.
<<shot on Juno>>
Juno: Two coppers each. Three for five. They're lucky. I don't know if they're lucky. People think they're lucky, which is the same thing for business purposes.
<<shot on Juno>>
Juno: Don't look at me like that. The squad's ones are different. The squad's ones I tie myself. These I tie myself too, but… differently.
<<set $JUNO_STALL to 1>>
===

title: Ep9_Window
---
<<shot on Elodie>>
In the doorway of a tall house in the Crown Ward, a girl about your age is watching the street the way you'd watch a play you weren't allowed to be in.
<<shot on Elodie>>
She sees you seeing her. Somebody calls from inside the house. She goes in, and the door closes.
<<set $ELODIE_GLIMPSE to 1>>
===

title: Ep9_Severin
---
<<shot wide>>
The pickpockets are down. Behind you, a stall that sold glass lanterns has come down across the lane, and under it, a child, and over the child, holding the whole frame up on his back, Severin Valcourt.
<<shot on Severin>>
Severin: You missed one.
<<shot on Severin>>
He sets the frame down. The child runs. Half the Lowmarket is watching. He makes sure they're watching.
<<shot on Severin>>
Severin: The one-page mage. Up a rank. The Lanterns must be very proud. It must be very easy, to be proud of the last squad.
-> "Thank you. For the kid."
    <<set $SEVERIN_THANKED to 1>>
    <<shot on Rook>>
    Rook: Thank you. For the kid.
    <<shot on Severin>>
    For a second he doesn't know what to do with that.
    <<shot on Severin>>
    Severin: …Don't thank me. Watch where you're going.
-> "Jealous?"
    <<set $SEVERIN_THANKED to 0>>
    <<shot on Rook>>
    Rook: Jealous?
    <<shot on Severin>>
    Severin: Of what? A ribbon and a lighthouse with no sea?
===

title: Ep9_Pendant
---
<<shot wide>>
Later. The fireworks have started over the Hall of Lanterns. Severin is alone on the fountain's rim, turning something in his fingers.
<<shot on Severin>>
A silver pendant, worn smooth, a lion on it that's nearly gone.
<<shot on Severin>>
Severin: It was my brother's. Aurek.
<<shot on Severin>>
Severin: The Hollowmarch, six years ago. A patrol went in and didn't come out. They never found him. They never found any of them.
<<shot on Severin>>
Severin: I'm only telling you because you're standing there. Go and watch the fireworks.
<<set $AUREK_PENDANT to 1>>
<<set $EP9_DONE to 1>>
===
`;

const AU = { stage: "aurelin" }, DAY = { sky: { daylight: 0.6 } }, DUSK = { sky: { daylight: 0.2 } };

export const EPISODE_9 = {
  id: "ep9",
  number: 9,
  setup: { ...AFTER_EP8 },
  title: "The Royal Festival",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "ribbon", type: "scene", node: "Ep9_Ribbon", ...AU, ...DAY,
      rook: { x: 0.8, z: -6.0, yaw: 0.2 },
      cast: [
        { id: "crier", look: "herald", x: -0.6, z: -4.4, yaw: Math.PI - 0.3 },
        { id: "dagrun", look: "dagrun", x: 1.8, z: -4.0, yaw: Math.PI + 0.4 },
        { id: "cal", look: "cal", x: 2.8, z: -6.0, yaw: -0.8 },
        { id: "tamsin", look: "tamsin", x: -1.6, z: -6.6, yaw: 0.6 },
      ] },
    { id: "festival", type: "explore", ...AU, ...DAY,
      rook: { x: 8, z: -6, yaw: Math.PI / 2 },
      objective: "The Royal Festival. Juno's stall in the Lowmarket, and the Crown Ward ({n}/{total}).",
      required: ["juno", "elodie"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 24, z: -5.4, yaw: Math.PI, node: "Ep9_Stall" },
        { id: "elodie", look: "elodie", x: -22.6, z: 16.4, yaw: 1.6, node: "Ep9_Window" },
        { id: "cal", look: "cal", x: 5.4, z: 5.6, yaw: -2.6 },
      ] },
    { id: "pickpockets", type: "fight", ...AU, ...DAY, wave: ["bandit", "bandit", "bandit"], tokens: 2,
      world: { bounds: ZONES.aurelin.bounds, origin: { x: 24, z: -14 } },
      tutorial: [{ at: 0.5, text: "Pickpockets in the festival crowd. Catch them before they're gone." }],
      lines: [["Bas", "Oi! That's the baker's purse!"], ["Juno", "And my takings!"]],
      retry: "Again. They're getting away." },
    { id: "severin", type: "scene", node: "Ep9_Severin", ...AU, ...DAY,
      rook: { x: 22.4, z: -13.6, yaw: 0.4 },
      cast: [
        { id: "severin", look: "severin", x: 23.6, z: -11.4, yaw: Math.PI + 0.4 },
        { id: "kid", look: "kid", x: 25.6, z: -11.0, yaw: -1.4 },
        { id: "bas", look: "bas", x: 20.4, z: -14.4, yaw: 0.8 },
      ] },
    { id: "pendant", type: "scene", node: "Ep9_Pendant", ...AU, ...DUSK,
      rook: { x: 1.2, z: -5.4, yaw: 0 },
      cast: [{ id: "severin", look: "severin", x: 0.2, z: -3.6, yaw: Math.PI - 0.3, pose: "sit" }],
      set: { EP9_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep10",
      lines: [
        "Next time on UNWRITTEN:",
        "The Hall of Lanterns. A shelf of lanterns, one for every knight in the kingdom.",
        "And yours.",
      ] },
  ],
};
