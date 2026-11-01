// Episode 14 · Tamsin Sings Off-Key (GDD §14 Arc 2). Comedy and heart.
//
// The midsummer singing contest in the plaza tonight, and Tamsin has signed up, and nobody has had the heart to stop
// her. A Merit job first: Pip at the Gilded Spoon has rats in the cake case. Again. Then the contest, under lanterns:
// Tamsin sings, enormously and in no key at all, and the plaza laughs, and the squad stands up and sings with her, worse.
// Why she sings. The crier: the Last Lanterns are climbing the Merit roll.

import { AFTER_EP13 } from "./arc12.js";
import { ZONES } from "../zones.js";

export const EP14_SCRIPT = `
title: Ep14_Pip
---
<<shot on Pip>>
Pip: Oh thank goodness. The Lanterns. There are rats in the cake case. Again. They've got into the lemon tarts, and somebody very important has ordered lemon tarts.
<<shot on Tamsin>>
Tamsin: We'll do it! Quickly! The contest's at eighth bell and I have to warm up!
<<shot on Pip>>
Pip: You're singing? At the contest?
<<shot on Tamsin>>
Tamsin: I'm going to win it.
<<shot on Pip>>
Pip looks at you. You look at Pip. Neither of you says anything.
===

title: Ep14_Contest
---
<<shot wide>>
The plaza at night, strung with lanterns, a stage of planks by the fountain and half of Aurelin in front of it. The crier calls the next name.
<<shot on Crier>>
Crier: Tamsin, of the Last Lanterns!
<<shot on Tamsin>>
She walks up onto the planks like she's walking into a fight, plants her feet, and sings.
<<shot wide>>
It is very loud. It is very brave. It is in no key that has ever existed. Somewhere near the back, somebody laughs. Then more people do.
<<shot on Tamsin>>
Tamsin doesn't stop. Her ears go red. She doesn't stop.
-> Stand up and sing with her.
    <<set $SANG_WITH_TAMSIN to "rook">>
    <<shot wide>>
    You stand up and sing with her. You don't know the words. You sing louder than you know them.
-> Look at the squad.
    <<set $SANG_WITH_TAMSIN to "squad">>
    <<shot wide>>
    You look at the squad. Bas is already standing up.
<<shot on Bas>>
Bas sings. Bas cannot sing. Juno, furious about it, sings too. Cal sings beautifully and in the wrong song on purpose. Even Dagrun, from his chair, hums.
<<shot wide>>
By the end, half the plaza is singing, badly, and the half that isn't is laughing with you, not at you, and that's a different sound entirely.
<<set $TAMSIN_SANG to 1>>
===

title: Ep14_After
---
<<shot on Tamsin>>
Tamsin: Did I win?
-> "No."
    <<shot on Rook>>
    Rook: No.
    <<shot on Tamsin>>
    Tamsin: Good! Something to aim for. Next year.
-> "You won something."
    <<shot on Rook>>
    Rook: You won something. Just not the contest.
    <<shot on Tamsin>>
    Tamsin: That's what my dad used to say. Every time.
<<shot on Tamsin>>
Tamsin: My dad sang. Before the mine took his chest. After, he couldn't, so I did it for him, every night, as loud as I could, so he could hear it from his bed.
<<shot on Tamsin>>
Tamsin: He said it was like breathing. Having somebody do it for you. So I don't care if it's off-key. It was never for the key.
<<shot on Crier>>
Crier: And on the Merit roll tonight: the Last Lanterns, up two places! Seventh of seven to fifth!
<<shot on Dagrun>>
Dagrun: Fifth. Huh. Don't let it go to anyone's head. Especially mine.
<<set $MERIT_CLIMB to 1>>
<<set $EP14_DONE to 1>>
===
`;

const CAFE = { stage: "cafe" }, AU = { stage: "aurelin" }, NIGHT = { sky: { daylight: 0.1 } };

export const EPISODE_14 = {
  id: "ep14",
  number: 14,
  setup: { ...AFTER_EP13 },
  title: "Tamsin Sings Off-Key",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "pip", type: "scene", node: "Ep14_Pip", ...CAFE,
      rook: { x: 1.2, z: -0.4, yaw: 0.6 },
      cast: [
        { id: "pip", look: "pip", x: 3.4, z: 1.8, yaw: Math.PI + 0.6 },
        { id: "tamsin", look: "tamsin", x: -0.4, z: 1.6, yaw: 1.0 },
      ] },
    { id: "rats", type: "fight", ...CAFE, wave: ["rat", "rat", "rat", "rat", "rat"], tokens: 3,
      world: { bounds: ZONES.cafe.bounds, origin: { x: 0, z: 0 } },
      tutorial: [{ at: 0.5, text: "Rats in the Gilded Spoon. Mind the tables. Mind the tarts." }],
      lines: [["Tamsin", "Not the lemon tarts! Those are important tarts!"], ["Pip", "Mind the china!"]],
      retry: "Again. They're back in the cake case." },
    { id: "contest", type: "scene", node: "Ep14_Contest", ...AU, ...NIGHT,
      rook: { x: 1.0, z: -6.4, yaw: 0.2 },
      cast: [
        { id: "crier", look: "herald", x: -1.2, z: -4.2, yaw: Math.PI - 0.2 },
        { id: "tamsin", look: "tamsin", x: 0.6, z: -4.0, yaw: Math.PI },
        { id: "bas", look: "bas", x: 2.6, z: -6.8, yaw: -0.6 },
        { id: "juno", look: "juno", x: -1.0, z: -7.2, yaw: 0.4 },
        { id: "cal", look: "cal", x: 3.8, z: -8.4, yaw: -0.4 },
        { id: "dagrun", look: "dagrun", x: -2.8, z: -8.6, yaw: 0.6, pose: "sit" },
      ] },
    { id: "after", type: "scene", node: "Ep14_After", ...AU, ...NIGHT,
      rook: { x: 0.6, z: -6.0, yaw: 0 },
      cast: [
        { id: "tamsin", look: "tamsin", x: 0.4, z: -4.0, yaw: Math.PI },
        { id: "crier", look: "herald", x: -2.0, z: -3.0, yaw: Math.PI - 0.6 },
        { id: "dagrun", look: "dagrun", x: -2.8, z: -7.0, yaw: 0.8, pose: "sit" },
      ],
      set: { EP14_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep15",
      lines: [
        "Next time on UNWRITTEN:",
        "Two cantors, one face each. Mirror, and Smoke.",
        "And what the Choir wants with the Hollowmarch.",
      ] },
  ],
};
