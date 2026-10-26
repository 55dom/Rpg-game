// Episode 39 · Writ of Return (GDD §14 Arc 5, Eps 39–50). Arc 5 opens with the Paragon, Elias Thorne, walking home
// through the south gate on foot while every bell in Aurelin rings. He tells the Lanterns what the door under the
// Lowmarket is: two hundred years ago the first Paragon closed it and broke its key, so no one person could ever hold
// it. One half lay in the vault under Ironhold (the reliquary the masked knight took). The other half, he carries. In
// three days the Lanterns will escort it to the Grand Archive, where the lock is. And tomorrow, in the Lighthouse yard,
// he wants to see what Rook's grimoire can do.

import { AFTER_EP38 } from "./arc4.js";

export const EP39_SCRIPT = `
title: Ep39_Gate
---
<<shot wide>>
The south gate at sunrise. Every bell in Aurelin is ringing, because the Paragon has come home.
<<shot on Paragon>>
A tall man in white and gold, a spear of light over his shoulder, walking in on foot and waving at the children on the wall.
<<shot on Aldric>>
Aldric: Paragon. The city is honored. We weren't told you were coming.
<<shot on Paragon>>
Paragon: No, Chancellor. That was rather the idea. I hear you've been busy.
<<shot on Aldric>>
Aldric: The city needed order.
<<shot on Paragon>>
Paragon: The city has a Watch, and a Crown, and me. Between the three of us I expect we'll manage.
Paragon: Commander Halvard. I'm told you said no to something. Well done.
<<shot on Halvard>>
Halvard: ...Thank you, sir.
===

title: Ep39_Visit
---
<<shot wide>>
The Paragon of Liraen is sitting at the Lighthouse table with his boots off, eating Juno's soup, and nobody knows what to do with their hands.
<<shot on Paragon>>
Paragon: Two hundred years ago, the first Paragon closed a door under this city and broke its key in half, so that no one person could ever hold it.
Paragon: One half lay in the vault under Ironhold.
<<shot on Bas>>
Bas: The reliquary. The one he took. The night he broke my arm.
<<shot on Paragon>>
Paragon: The other half, I carry. In three days it goes to the Grand Archive, where the lock is, and I'd like the Lanterns to carry it there with me.
<<shot on Lio>>
Lio: The masked knight has the first half. And the Writ. That's the map.
<<shot on Paragon>>
Paragon: Then he has a box and a piece of paper. Without the other half, he has a very nice box.
<<shot on Severin>>
Severin: Sir. My brother. Aurek. Did you know him?
<<shot on Paragon>>
Paragon: He came to me once, six years ago, and asked to go into the Hollowmarch. I said no. He went anyway. I've been sorry ever since.
<<shot on Severin>>
Severin: The knight stopped when I said his name.
<<shot on Paragon>>
Paragon: Then I hope it's him. I truly do. And I hope, if it is, he has a very good reason.
<<shot two Paragon Rook>>
Paragon: You. The one with the strange book. Tomorrow, in your yard, show me what it does.
-> "Yes, sir." #earnest
    Paragon: "Sir." Listen to that. Dagrun, you've taught them manners. How dull.
-> "You'll regret asking." #bold
    Paragon: Oh, I hope so. I haven't regretted anything in years.
<<set $PARAGON_HOME to 1>>
===

title: Ep39_Juno
---
Juno: The Paragon ate my soup. He said it was the best soup he'd had in a year. I'm never washing that bowl.
Juno: ...I'm going to wash that bowl. But I'll think about it first.
===

title: Ep39_Bas
---
Bas: Three days. An escort. Sounds simple. The last simple thing we did, I lost the use of an arm for two months.
Bas: I'm coming anyway. Don't argue.
===

title: Ep39_Severin
---
Severin: "I hope he has a very good reason." That's what he said. As if he knew there'd need to be one.
Severin: Elodie's asleep. She sleeps a lot since the Hollow. She says it's quiet in her head now. I don't know if that's good.
===

title: Ep39_Elodie
---
Elodie is in the window seat with a blanket and the rabbit, watching the dry sea.
Elodie: The drums stopped. Since the Hollow. I thought I'd be glad.
Elodie: It's like a clock in the next room that's stopped ticking. You only notice it when it's gone.
===
`;

const AU = { stage: "aurelin" }, LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 };   // the Lighthouse's long table

export const EPISODE_39 = {
  id: "ep39",
  number: 39,
  unlockAt: 5,
  setup: { ...AFTER_EP38 },
  title: "Writ of Return",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "gate", type: "scene", node: "Ep39_Gate", ...AU, rook: null, sky: { daylight: 0.5 },
      cast: [
        { id: "paragon", look: "paragon", x: 0.2, z: -26.8, yaw: 0 },
        { id: "aldric", look: "aldric", x: 0.4, z: -22.6, yaw: Math.PI },
        { id: "halvard", look: "halvardFace", x: 2.6, z: -23.6, yaw: -2.4 },
        { id: "sergeant", look: "sergeant", x: -2.8, z: -24.2, yaw: 2.4 },
      ] },
    { id: "title", type: "title" },
    { id: "visit", type: "scene", node: "Ep39_Visit", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "paragon", look: "paragon", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "severin", look: "severin", x: TABLE.x + 0.4, z: TABLE.z - 3.4, yaw: -0.2 },
        { id: "bas", look: "basSling", x: TABLE.x - 2.8, z: TABLE.z - 1.4, yaw: 1.1 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ] },
    { id: "evening", type: "explore", ...LH, sky: { daylight: 0.25 },
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.4, yaw: Math.PI },
      objective: "An evening at the Lighthouse before the escort. See Juno, Bas and Severin ({n}/{total}).",
      required: ["juno", "bas", "severin"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep39_Juno" },
        { id: "bas", look: "basSling", x: -5.3, z: -3.4, yaw: -1.75, node: "Ep39_Bas" },
        { id: "severin", look: "severin", x: -8.2, z: 1.4, yaw: -1.6, node: "Ep39_Severin" },
        { id: "elodie", look: "elodie", x: -3.4, z: 9.4, yaw: 0, node: "Ep39_Elodie" },
      ],
      set: { EP39_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep40",
      lines: [
        "Next time on UNWRITTEN:",
        "The Paragon in the Lighthouse yard, with a spear made of light.",
        "And a page that turns back.",
      ] },
  ],
};
