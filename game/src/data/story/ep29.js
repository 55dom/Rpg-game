// Episode 29 · Home, Whether He Likes It (GDD §14 Arc 4 "The Unanswered Door", Eps 29–38). Arc 4 opens at the
// Lighthouse: Severin lives there now, on the dishes with Rook. He's sure the man who left a flower on Aurek's
// grave is his brother. Elodie visits, and hears drums under the floor where there's no sea and no army. Aldric
// sends his Lances to bring his children home by force; Dagrun won't have it on his porch. The Chancellor's answer
// is an order: the Lanterns go to the Severed Isles, a long way from Aurelin.

import { AFTER_EP28 } from "./arc4.js";

export const EP29_SCRIPT = `
title: Ep29_Cold
---
<<shot wide>>
The Lighthouse, before dawn. Someone is up already, and it isn't Dagrun.
<<shot on Severin>>
Severin is out on the steps with a broken pendant in his hand, turning it over and over.
Severin: A man in a mask knelt at my brother's grave and left him a flower.
Severin: Who leaves a flower for a stranger? Nobody. Nobody does that.
===

title: Ep29_Breakfast
---
<<shot wide>>
Breakfast. Juno has laid a seventh place at the table, and nobody has said anything about it.
<<shot on Tamsin>>
Tamsin: So, Severin. Do you snore? Because Bas snores, and the rest of us have formed a union.
<<shot on Severin>>
Severin: Valcourts do not snore. We breathe with conviction.
<<shot on Bas>>
Bas: He snores.
<<shot on Dagrun>>
Dagrun: House rules. You eat what Juno cooks. You don't touch the lanterns. You're on the dishes with the one-pager.
<<shot on Severin>>
Severin: I have never washed a dish in my life.
<<shot on Juno>>
Juno: Then today is going to be very educational for you.
<<shot on Severin>>
Severin: The guards at the crypt said he wore black and carried a glaive, and never said a word. My brother never said a word when he was angry, either.
<<shot on Juno>>
Juno: Your brother's been gone six years, Severin. A mask isn't anybody's brother.
<<shot two Severin Rook>>
-> "What if he's right?" #earnest
    Severin: ...Thank you.
    Juno: Don't encourage him.
-> "And if he isn't? It'll break you twice." #wry
    Severin: Then it breaks. I've been broken before. You were there for most of it.
<<set $AUREK_THEORY to 1>>
===

title: Ep29_Severin
---
Severin has the pendant open on the workbench. Half a silver star, the other half snapped clean away.
Severin: Aurek taught me the constellations off the roof of the house. Every one. He'd point, and I'd have to name it before he counted three.
Severin: He went into the Hollowmarch on the Crown's business and didn't come out. They never found him. They found this.
-> "You'll find the other half." #earnest
    Severin: I intend to. And I intend to ask him why he's been kneeling at his own grave.
-> "Dishes first. Then brothers." #wry
    Severin: You are a very small and very irritating person, {name}.
===

title: Ep29_Elodie
---
Elodie is sitting on the floor by the lantern shelf with her ear pressed to the boards.
Elodie: Can you hear that? Under the floor.
Elodie: Drums. Slow ones. Like a lot of people marching, very far away.
-> "It's the sea." #wry
    Elodie: There isn't a sea. It's a dry sea. Lio told me. Everyone keeps calling it a sea and there isn't one.
-> "I can't hear anything." #earnest
    Elodie: Nobody ever can. I hear the humming under Aurelin, and now the drums under here. They're getting closer, I think. Or I'm getting closer to them.
Elodie: Don't tell Severin. He worries in a very loud way.
<<set $ELODIE_DRUMS to 1>>
===

title: Ep29_Lio
---
Lio has three maps, two star charts and a teapot on the table, and he's looking at none of them.
Lio: The Severed Isles slipped their moorings last week. They drift over the Spindle Peaks now, low enough to reach by the old gondola.
Lio: The Choir's books say the Paragon left something in the sky temple up there. A writ. Nobody agrees what it's a writ of.
Lio: ...I'm telling you this because I'm trying to tell people things now. It's going badly. It's very tiring.
===

title: Ep29_Bas
---
Bas is doing push-ups with one arm. The other's still bound to his chest.
Bas: Doc says six more weeks. I say four. We've agreed to disagree.
Bas: The new one's all right. Severin. He tried to carry the water in from the well and fell in it.
===

title: Ep29_Tamsin
---
Tamsin: I'm writing a song about Severin doing the dishes. It's called The Prince and the Pan.
Tamsin: It's got eleven verses. He's broken a plate in every one.
===

title: Ep29_Dagrun
---
Dagrun: Letter from the Chancellor's office. Very good paper. I've used it to wedge the door.
Dagrun: He'll come for his children. He won't come himself. Men like Aldric never come themselves.
===

title: Ep29_Lances
---
<<shot wide>>
Horses on the road from Aurelin. Three riders in Valcourt blue and gold, lances up, and a fourth out in front who doesn't need a lance to look dangerous.
<<shot on Halvard>>
Halvard: Lance-Commander Halvard, of the Crown's Lances. By order of the High Chancellor, Severin and Elodie Valcourt are to come home.
<<shot on Severin>>
Severin: No.
<<shot on Halvard>>
Halvard: Your father anticipated that answer, my lord. He asked me to bring you anyway.
<<shot on Dagrun>>
Dagrun: Not on my porch, you won't.
<<shot on Halvard>>
Halvard: Then off it.
<<set $LANCES_MET to 1>>
===

title: Ep29_Orders
---
<<shot wide>>
The Lances pick themselves up off the dry seabed. Halvard hasn't moved. He watched the whole thing.
<<shot on Halvard>>
Halvard: Good. The Chancellor said you would be. He has a use for good.
Halvard: Crown orders, Captain. The Severed Isles have come loose. The Lanterns will go up and bring back what the Paragon left in the sky temple, and hand it to me.
<<shot on Dagrun>>
Dagrun: And while we're up a mountain on a string, you'll be doing what in Aurelin, exactly?
<<shot on Halvard>>
Halvard: My job, Captain. As you'll be doing yours.
<<shot on Severin>>
Severin: He wants us out of the city. All of us.
<<shot two Severin Rook>>
-> "Then we go, and we come back fast." #bold
    Severin: Yes. That's what Aurek would have said.
-> "Elodie stays here, with Bas." #earnest
    Severin: ...Yes. Somewhere with walls my father doesn't own.
<<set $SEVERIN_AT_LIGHTHOUSE to 1>>
===
`;

const LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 };   // the long table
const SAND = { x: 2, z: -9 };   // the dry sea's edge, south of the house

export const EPISODE_29 = {
  id: "ep29",
  number: 29,
  unlockAt: 5,
  setup: { ...AFTER_EP28 },
  title: "Home, Whether He Likes It",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep29_Cold", ...LH, rook: null, sky: { daylight: 0.25 },
      cast: [{ id: "severin", look: "severin", x: -3.6, z: 9.3, yaw: Math.PI }] }, // on the house steps
    { id: "title", type: "title" },
    { id: "breakfast", type: "scene", node: "Ep29_Breakfast", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "severin", look: "severin", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "tamsin", look: "tamsin", x: TABLE.x + 0.4, z: TABLE.z - 3.4, yaw: -0.2 },
        { id: "bas", look: "basSling", x: TABLE.x - 2.8, z: TABLE.z - 1.4, yaw: 1.1 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ] },
    { id: "morning", type: "explore", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.4, yaw: Math.PI },
      objective: "A morning at the Lighthouse. See Severin, Elodie and Lio ({n}/{total}).",
      required: ["severin", "elodie", "lio"], counts: "required",
      cast: [
        { id: "severin", look: "severin", x: -8.2, z: 1.4, yaw: -1.6, node: "Ep29_Severin" }, // at the workbench
        { id: "elodie", look: "elodie", x: -3.4, z: 9.4, yaw: 0, node: "Ep29_Elodie" },
        { id: "lio", look: "lio", x: TABLE.x - 1.35, z: TABLE.z + 1.4, yaw: Math.PI / 2, node: "Ep29_Lio" },
        { id: "bas", look: "basSling", x: -5.3, z: -3.4, yaw: -1.75, node: "Ep29_Bas" },
        { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep29_Tamsin" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "Ep29_Dagrun" },
      ] },
    { id: "lances", type: "scene", node: "Ep29_Lances", ...LH,
      rook: { x: SAND.x + 0.6, z: SAND.z + 3.6, yaw: Math.PI },
      cast: [
        { id: "halvard", look: "halvardFace", x: SAND.x, z: SAND.z - 1.4, yaw: 0 },
        { id: "lance1", look: "lance", x: SAND.x - 2.2, z: SAND.z - 2.8, yaw: 0.3 },
        { id: "lance2", look: "lance", x: SAND.x + 2.2, z: SAND.z - 2.8, yaw: -0.3 },
        { id: "severin", look: "severin", x: SAND.x - 1.6, z: SAND.z + 4.4, yaw: Math.PI * 0.9 },
        { id: "dagrun", look: "dagrun", x: SAND.x + 2.6, z: SAND.z + 4.6, yaw: -2.8 },
      ] },
    { id: "porch", type: "fight", ...LH, wave: ["lance", "lance", "lance"], tokens: 2,
      tutorial: [
        { at: 0.5, text: "Lances keep their shields up while they aren't attacking. Get round the side, or break their guard." },
        { at: 10, text: "A red glint, then a charge: the thrust can't be blocked. Step out of its line." },
      ],
      lines: [["Dagrun", "Off my porch!"], ["Juno", "Valcourt blue. I'd know that tailoring anywhere."]],
      retry: "Up. They're not taking anyone." },
    { id: "orders", type: "scene", node: "Ep29_Orders", ...LH,
      rook: { x: SAND.x + 0.6, z: SAND.z + 3.2, yaw: Math.PI },
      cast: [
        { id: "halvard", look: "halvardFace", x: SAND.x, z: SAND.z - 1.0, yaw: 0 },
        { id: "severin", look: "severin", x: SAND.x - 1.8, z: SAND.z + 4.2, yaw: Math.PI * 0.85 },
        { id: "dagrun", look: "dagrun", x: SAND.x + 2.6, z: SAND.z + 4.4, yaw: -2.8 },
        { id: "juno", look: "juno", x: SAND.x - 3.6, z: SAND.z + 2.4, yaw: 2.2 },
      ],
      set: { EP29_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep30",
      lines: [
        "Next time on UNWRITTEN:",
        "The Severed Isles, adrift in the sky, and a temple that has waited a long time to be woken.",
        "And the Lances, who always seem to get there first.",
      ] },
  ],
};
