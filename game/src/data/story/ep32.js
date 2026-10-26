// Episode 32 · The Crown Ward (GDD §14 Arc 4: Aldric's coup takes shape). Halvard carried the Writ of Return down
// the chain and straight to the Chancellor's house, and Hesper Voss steps out of the air to tell Aldric what it's
// for. Severin means to walk into his own house the way he did as a boy, through the kitchen. The Crown Ward at
// night is full of Lances with lanterns (sim/sentry.js): stay out of their light, and let walls and hedges hide you.
// Aldric is waiting in the garden anyway. He shows them the Writ: not words, a map of a door under the Lowmarket.

import { AFTER_EP31 } from "./arc4.js";

export const EP32_SCRIPT = `
title: Ep32_Cold
---
<<shot wide>>
The Crown Ward, after midnight. Every window on the street is dark but one.
<<shot on Aldric>>
Aldric: The Writ of Return. Two hundred years in a box on a mountain, and it fits in my hand.
<<shot on Halvard>>
Halvard: The Lanterns did the climbing, my lord. My men did the carrying.
<<shot on Aldric>>
Aldric: And my son stood there and watched you take it. Good. Let him learn what it costs to be polite.
<<fx rift Hesper>>
<<show Hesper>>
<<shot on Hesper>>
The air beside the hedge opens, pale at the edges, and a woman steps out of it as if she'd come through a door.
Hesper: You've read it, then.
<<shot on Aldric>>
Aldric: It says what was sent away may be written back. It doesn't say where the door is.
<<shot on Hesper>>
Hesper: It tells you where to look. Under the old city, where the drums are. Doors need keys, Chancellor. That's a separate conversation.
<<shot on Halvard>>
Halvard: My lord. She came out of the air.
<<shot on Aldric>>
Aldric: Everyone comes to me somehow, Halvard. Go to bed.
<<set $HESPER_ALDRIC to 1>>
===

title: Ep32_Plan
---
<<shot wide>>
Evening at the Lighthouse. Severin has drawn the Crown Ward on the back of a map of somewhere else.
<<shot on Severin>>
Severin: Halvard carried it down the chain and straight to my father's house. It'll be in his study. Everything he loves is in his study.
<<shot on Dagrun>>
Dagrun: You want to break into the High Chancellor's house.
<<shot on Severin>>
Severin: I want to walk into my own house, through the kitchen, the way I did every night until I was fourteen. The cook never locks it.
<<shot on Juno>>
Juno: And the Lances on every corner?
<<shot on Severin>>
Severin: They carry lanterns. You can see where they're looking. Stay out of the light, and nobody sees anything.
<<shot on Lio>>
Lio: And the light doesn't go through walls. Or hedges. ...I've done this before. Not for good reasons.
<<shot on Elodie>>
Elodie: The drums were louder last night. They're under the city now, not under us. ...Will you bring me something from my room?
<<shot on Severin>>
Severin: The rabbit. I know.
<<shot on Dagrun>>
Dagrun: Two of you. Rook and Severin. Juno watches the street. If it goes wrong, nobody's a Lantern tonight. You're two idiots who got lost.
<<shot two Severin Rook>>
-> "Two idiots who got lost. I can do that." #wry
    Severin: You're a natural.
-> "And if your father's waiting for us?" #earnest
    Severin: Then I'll finally get to say what I came to say.
===

title: Ep32_Juno
---
Juno: I'll be on this corner, admiring the architecture. If you hear me singing, run.
Juno: Severin went round by the back lane. He said to meet him at the kitchen door, and he said "don't be seen" twice, like I'd forget.
===

title: Ep32_Door
---
<<if $EP32_SPOTTED >= 1>>
    Severin: I heard the shouting. Very subtle. Very Lantern.
<<else>>
    Severin: Not a single shout. Halvard is going to have a very bad morning.
<<endif>>
Severin: The kitchen door. Twenty years, and it still sticks.
===

title: Ep32_Garden
---
<<shot wide side>>
The kitchen door sticks, and while Severin is still leaning on it, a lamp comes up behind you in the garden.
<<shot on Aldric>>
Aldric: Severin. You used to come in this way when you were eleven. The cook told me. I let her think I didn't know.
<<shot on Severin>>
Severin: Where is it?
<<if $EP32_SPOTTED >= 1>>
    <<shot on Aldric>>
    Aldric: Halvard tells me you knocked down some of his men on the way in. Thank you for not using the front door, at least.
<<else>>
    <<shot on Aldric>>
    Aldric: Not one of Halvard's men saw you. I'll be having words with Halvard.
<<endif>>
Aldric: You want the Writ. Here.
He takes the leather case from under his coat and opens it so you can both see. The Paragon's sun on the seal, and under it, not words. A map.
<<shot on Severin>>
Severin: That's... the Lowmarket. The old city under it. There's a door drawn under the grate.
<<shot on Aldric>>
Aldric: Two hundred years ago the Paragon closed a door, sent something away through it, and the Crown has been a regency ever since. Clerks and chancellors, minding a chair for a king who never came back.
Aldric: The Writ says what was sent away may be written back. I intend to be the one holding the pen.
<<shot on Severin>>
Severin: And what comes back?
<<shot on Aldric>>
Aldric: Whatever we're strong enough to command.
<<show Halvard>>
<<show lance1>>
<<show lance2>>
<<shot wide side>>
Lanterns come up all round the garden. Halvard, and his Lances, spears grounded.
<<shot on Halvard>>
Halvard: My lord.
<<shot on Aldric>>
Aldric: Let them go, Halvard. They're my son's friends. They'll go home to their lighthouse. When this is done, everyone comes home to the winner.
<<shot two Severin Rook>>
-> "We're not leaving without the Writ." #bold
    <<shot on Severin>>
    Severin: Yes, we are. He wants us to fight, here, in his own garden. Then he gets to call it treason.
-> "Severin. Let's go." #earnest
    <<shot on Severin>>
    Severin: ...Yes.
<<shot on Severin>>
Severin: You're not the Crown, Father. You're a man minding a chair.
<<shot on Aldric>>
Aldric: Good night, Severin. Shut the kitchen door on your way out. It sticks.
===

title: Ep32_Home
---
<<shot wide>>
The Lighthouse, an hour before dawn. Elodie is asleep at the table with her head on her arms. Severin puts a very worn stuffed rabbit next to her hand.
<<shot on Dagrun>>
Dagrun: Well?
<<shot on Severin>>
Severin: He let us see it. That's worse than hiding it. He wants us to know.
Severin: It's a map of a door under the Lowmarket. He's going to open it, and take the city with whatever comes out.
<<shot on Lio>>
Lio: Under the Lowmarket. Where the Choir took the children from. Where Elodie hears the drums.
<<shot on Juno>>
Juno: That's three things in one place. I don't like three things in one place.
<<shot on Dagrun>>
Dagrun: Then we go and look at that door before he does.
<<set $WRIT_MAP to 1>>
===
`;

const AU = { stage: "aurelin" }, NIGHT = { sky: { daylight: 0.05 } }, LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 };          // the Lighthouse's long table
const KITCHEN = { x: -30.5, z: 27.3 }; // the Valcourt townhouse's kitchen door, on its garden side (the house is at -28, 32)

export const EPISODE_32 = {
  id: "ep32",
  number: 32,
  unlockAt: 5,
  setup: { ...AFTER_EP31 },
  title: "The Crown Ward",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep32_Cold", ...AU, ...NIGHT, rook: null,
      cast: [
        { id: "aldric", look: "aldric", x: -25.0, z: 25.2, yaw: 0.8 },
        { id: "halvard", look: "halvardFace", x: -22.6, z: 24.2, yaw: -1.3 },
        { id: "hesper", look: "hesper", x: -26.8, z: 26.8, yaw: 2.4, hidden: true },
      ] },
    { id: "title", type: "title" },
    { id: "plan", type: "scene", node: "Ep32_Plan", ...LH, sky: { daylight: 0.4 },
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "severin", look: "severin", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "elodie", look: "elodie", x: TABLE.x + 0.4, z: TABLE.z - 3.4, yaw: -0.2 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ] },
    { id: "ward", type: "explore", ...AU, ...NIGHT,
      rook: { x: -10.4, z: 10.0, yaw: -Math.PI / 2 },
      objective: "Reach the Valcourt kitchen door without being seen. Stay out of the Lances' lantern light: walls and hedges hide you.",
      required: ["severin"], counts: "required",
      cast: [
        { id: "severin", look: "severin", x: KITCHEN.x, z: KITCHEN.z, yaw: Math.PI, node: "Ep32_Door" },
        { id: "juno", look: "juno", x: -11.6, z: 12.6, yaw: -1.4, node: "Ep32_Juno" },
      ],
      // Two ways round: up the west street and across the square, or the back lane behind the houses. Either way,
      // somebody walks past the kitchen door.
      sentries: [
        { id: "street", route: [[-22.4, 21.5], [-22.4, 9.0]] },
        { id: "square", route: [[-12.8, 23.4], [-21.0, 23.4]] },
        { id: "porch", route: [[-20.2, 27.6]], yaw: -2.4 },
        { id: "lane", route: [[-38.2, 9.5], [-38.2, 24.0]] },
        { id: "garden", route: [[-24.4, 25.4], [-34.0, 25.4]], wait: 2.4 },
      ],
      spotted: { wave: ["lance"], label: "SPOTTED" }, spottedFlag: "EP32_SPOTTED" },
    { id: "garden", type: "scene", node: "Ep32_Garden", ...AU, ...NIGHT,
      rook: { x: KITCHEN.x - 1.4, z: KITCHEN.z - 0.6, yaw: Math.PI },
      cast: [
        { id: "severin", look: "severin", x: KITCHEN.x + 0.4, z: KITCHEN.z - 0.4, yaw: Math.PI },
        { id: "aldric", look: "aldric", x: KITCHEN.x - 0.4, z: KITCHEN.z - 3.6, yaw: 0 },
        { id: "halvard", look: "halvardFace", x: KITCHEN.x + 3.0, z: KITCHEN.z - 4.4, yaw: -0.6, hidden: true },
        { id: "lance1", look: "lance", x: KITCHEN.x - 3.6, z: KITCHEN.z - 3.0, yaw: 0.9, hidden: true },
        { id: "lance2", look: "lance", x: KITCHEN.x + 3.8, z: KITCHEN.z - 1.8, yaw: -1.4, hidden: true },
      ] },
    { id: "home", type: "scene", node: "Ep32_Home", ...LH, sky: { daylight: 0.15 },
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "elodie", look: "elodie", x: TABLE.x + 0.4, z: TABLE.z - 0.6, yaw: 0, down: false },
        { id: "severin", look: "severin", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z + 1.0, yaw: Math.PI / 2 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ],
      set: { EP32_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep33",
      lines: [
        "Next time on UNWRITTEN:",
        "Down the grate, under the Lowmarket, into the old city.",
        "And a door that hums.",
      ] },
  ],
};
