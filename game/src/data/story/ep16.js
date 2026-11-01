// Episode 16 · Night Before the March (GDD §14 Arc 2; §15.5 D10). The calm before.
//
// Tomorrow the Lanterns march into the Hollowmarch after the Choir. Tonight, the Lighthouse: Juno re-tying cords that
// don't need re-tying, Bas polishing a shield that's already clean, Tamsin not singing for once, Lio reading the same
// page. On the step under the lantern room, Cal and Dagrun with a bottle. "Where I grew up, nobody had names. Just numbers." (D10.)
// And to Rook, as a joke, the way he says everything: "If I ever don't come back, keep the key. Doors remember who holds
// them."

import { AFTER_EP15 } from "./arc12.js";

export const EP16_SCRIPT = `
title: Ep16_Juno
---
<<shot on Juno>>
Juno is re-tying the red cord on her own wrist. It didn't need re-tying.
<<shot on Juno>>
Juno: Over, under, through, back. It holds. It always holds. I'm just checking.
===

title: Ep16_Bas
---
<<shot on Bas>>
Bas: Clean shield. Clean shield's a happy shield. Captain Brannoc says that. He doesn't, actually. I made it up. It sounds like him.
===

title: Ep16_Tamsin
---
<<shot on Tamsin>>
Tamsin: I'm not singing tonight. Everybody's nervous enough.
<<shot on Tamsin>>
Tamsin: …I'm humming. Humming doesn't count.
===

title: Ep16_Lio
---
<<shot on Lio>>
Lio has been reading the same page for an hour. When you look over his shoulder, it's a map of the Hollowmarch, and most of it is blank.
<<shot on Lio>>
Lio: Nobody's mapped it. Everyone who tried is a name on a list.
===

title: Ep16_Step
---
<<shot wide>>
The step under the lantern room, with the great lamp turning overhead. Cal and Dagrun are sitting with a bottle between them, and the dry sea going on forever under the stars.
<<pose Rook sit>>
<<shot wide>>
Dagrun moves the bottle over so there's room. Cal doesn't say anything clever, which is how you know it's late.
<<shot on Cal>>
Cal: Where I grew up, nobody had names. Just numbers.
<<set $CLUE_D10 to 1>>
<<shot on Dagrun>>
Dagrun: Orphanage?
<<shot on Cal>>
Cal: Something like that. A big one. Very strict about where you stood.
<<shot on Cal>>
Cal: That's why I like this place. Nobody here's a number. Dagrun can't count past six.
<<shot on Dagrun>>
Dagrun: Seven. There's seven of us.
<<shot on Cal>>
Cal: Seven. Look at that. He's been practising.
<<shot wide>>
For a while nobody says anything. The lamp goes round. Then Cal turns his head to you.
<<shot on Cal>>
Cal: Kid. If I ever don't come back from something, keep the key. Doors remember who holds them.
<<shot on Cal>>
Cal: That's a joke. That's from a play. A very bad play. Don't look at me like that.
-> "I'll keep it."
    <<set $KEEP_KEY to "keep">>
    <<shot on Rook>>
    Rook: I'll keep it.
    <<shot on Cal>>
    Cal: Good. It opens the snack cupboard. That's important.
-> "You're coming back."
    <<set $KEEP_KEY to "back">>
    <<shot on Rook>>
    Rook: You're coming back. From everything. That's an order.
    <<shot on Cal>>
    Cal: Ha. You can't give me orders, squire. …Fine. Received.
<<shot wide>>
Behind you, the Lighthouse windows go dark one by one. Overhead, the lamp keeps turning.
<<set $EP16_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.06 } };

export const EPISODE_16 = {
  id: "ep16",
  number: 16,
  setup: { ...AFTER_EP15 },
  title: "Night Before the March",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "evening", type: "explore", ...LH, ...NIGHT,
      rook: { x: 2.0, z: 1.4, yaw: 0 },
      objective: "The night before the march. Everyone's awake ({n}/{total}).",
      required: ["juno", "bas", "tamsin", "lio"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit", node: "Ep16_Juno" },
        { id: "bas", look: "bas", x: -5.0, z: -1.6, yaw: 0.6, node: "Ep16_Bas" },
        { id: "tamsin", look: "tamsin", x: 2.6, z: 9.9, yaw: 0, node: "Ep16_Tamsin" },
        { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit", node: "Ep16_Lio" },
      ] },
    { id: "step", type: "scene", node: "Ep16_Step", ...LH, ...NIGHT,
      rook: { x: -2.9, z: 9.7, yaw: Math.PI },
      cast: [
        { id: "cal", look: "cal", x: -4.2, z: 9.7, yaw: Math.PI, pose: "sit" },
        { id: "dagrun", look: "dagrun", x: -5.5, z: 9.7, yaw: Math.PI, pose: "sit" },
      ],
      set: { EP16_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep17",
      lines: [
        "Next time on UNWRITTEN:",
        "The Hollowmarch. The forbidden land, and the Choir's Bloom.",
        "The squad, split up.",
      ] },
  ],
};
