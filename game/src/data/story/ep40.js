// Episode 40 · Revision (GDD §8.6, §14 Arc 5). Hesper hears the Paragon is home and smiles. In the Lighthouse yard the
// Paragon spars with Rook (data/paragon.js): the Sunlance, Noon's column of light, Zenith's cross. Near the end, once,
// Dawnbreak, and the whole yard goes white; nobody walks away from it. Rook's page turns back three seconds instead:
// Revision, the Palimpsest's second stage (data/inscription.js REVISION). From now on, with half a Surge gauge, a fall
// comes undone for Rook, and ink comes back faster in a fight.

import { AFTER_EP39 } from "./arc5.js";

export const EP40_SCRIPT = `
title: Ep40_Cold
---
<<shot wide>>
The old city under the Lowmarket. A cantor kneels at the door with her ear to the stone, and Hesper Voss reads a letter by the light from the crack.
<<shot on Hesper>>
Hesper: The Paragon is home. He's carrying it himself.
<<shot on Hesper>>
Hesper: Good. Let him. People who carry things always set them down eventually. Usually where they think it's safe.
===

title: Ep40_Yard
---
<<shot wide>>
Morning in the Lighthouse yard. The Paragon is standing in the training ring with the Sunlance resting on his shoulder, and every Lantern who isn't on the dishes is sitting on the fence.
<<shot on Paragon>>
Paragon: Hit me as hard as you like. You won't hurt me. That isn't a boast, it's a fact about spears.
<<shot on Juno>>
Juno: Ten Marks on the Paragon.
<<shot on Bas>>
Bas: Everyone's betting on the Paragon, Juno. That isn't a bet, it's a fact about Paragons.
<<shot two Paragon Rook>>
-> "Ready." #bold
    Paragon: Good.
-> "What if I do hurt you?" #wry
    Paragon: Then I'll have learned something, and you'll be very famous.
===

title: Ep40_After
---
<<shot wide>>
The Paragon grounds the Sunlance, and laughs, and keeps laughing, and has to sit down on the fence.
<<shot on Paragon>>
Paragon: That. Whatever that was. Do it again.
<<shot on Lio>>
Lio: It rewound. The page went back. Three seconds. You were down, the light had you, and then it hadn't.
<<shot on Lio>>
Lio: The Choir's books have a word for it. Revision. When a palimpsest is written over, the old text doesn't go away. Sometimes it comes back up.
<<shot on Paragon>>
Paragon: Two hundred years the Crown's scholars have argued about what's under that book of yours. I think they're about to argue a great deal more.
<<shot on Paragon>>
Paragon: The Choir will want it more than ever now. Stay close to your squad, Lantern. In three days, we carry the key.
<<shot on Dagrun>>
Dagrun: You heard the man. Dishes.
<<set $REVISION to 1>>
===
`;

const LH = { stage: "lighthouse" }, OLD = { stage: "oldcity" };

export const EPISODE_40 = {
  id: "ep40",
  number: 40,
  unlockAt: 5,
  setup: { ...AFTER_EP39 },
  title: "Revision",
  arc: "Arc 5 · Writ of Return",
  world: { companions: false },
  beats: [
    { id: "cold", type: "scene", node: "Ep40_Cold", ...OLD, rook: null,
      cast: [
        { id: "hesper", look: "hesper", x: 1.6, z: 9.6, yaw: Math.PI * 0.9 },
        { id: "cantor", look: "cantor", x: -0.8, z: 12.4, yaw: 0 },
      ] },
    { id: "title", type: "title" },
    { id: "yard", type: "scene", node: "Ep40_Yard", ...LH,
      rook: { x: 0, z: -6.4, yaw: 0 },
      cast: [
        { id: "paragon", look: "paragon", x: 0.2, z: -1.6, yaw: Math.PI },
        { id: "juno", look: "juno", x: 4.4, z: -6.8, yaw: -0.9 },
        { id: "bas", look: "basSling", x: 4.6, z: -4.6, yaw: -1.4 },
        { id: "lio", look: "lio", x: -4.2, z: -6.2, yaw: 0.9 },
        { id: "dagrun", look: "dagrun", x: -3.0, z: -8.4, yaw: 0.6 },
      ] },
    { id: "spar", type: "fight", ...LH, wave: ["paragon"], tokens: 2,
      tutorial: [
        { at: 0.5, text: "He's sparring, but he means it. A red glint is the Sunthrust (it can't be blocked); a gold ring under you is Noon: step out before the light comes down." },
      ],
      eventHints: {
        zenith: "Lines of light run out from him in a cross, then the cross turns. Stand between the lines.",
        dawnbreak: "The whole yard is going white. There's nowhere to stand.",
        revision: "REVISION: the page turned back three seconds, for you alone. It's yours now: with half a Surge gauge, a fall comes undone.",
      },
      awaken: { on: "dawnbreak", flag: "REVISION", say: ["Lio", "Rook! Your book! The pages are turning backwards!"] },
      lines: [["Juno", "Don't let him hit you with the glowing end!"], ["Bas", "That's all of it, Juno. All of it's the glowing end."]],
      retry: "Up. He's waiting, and he's smiling." },
    { id: "after", type: "scene", node: "Ep40_After", ...LH,
      rook: { x: 0, z: -6.0, yaw: 0 },
      cast: [
        { id: "paragon", look: "paragon", x: 2.4, z: -2.6, yaw: -2.6 },
        { id: "lio", look: "lio", x: -2.2, z: -4.8, yaw: 1.0 },
        { id: "juno", look: "juno", x: 4.4, z: -6.8, yaw: -0.9 },
        { id: "dagrun", look: "dagrun", x: -3.0, z: -8.4, yaw: 0.6 },
      ],
      set: { REVISION: 1, EP40_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep41",
      lines: [
        "Next time on UNWRITTEN:",
        "The Choir has been very quiet since the Hollow. Lio knows what that means.",
        "It means they're singing somewhere else.",
      ] },
  ],
};
