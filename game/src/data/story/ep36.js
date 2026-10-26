// Episode 36 · Lance-Commander (GDD §14 Arc 4). Dawn in front of the Hall of Lanterns, the whole city at its windows:
// Boss 12, Lance-Commander Halvard, for the Chancellor (data/halvard.js). He grounds his lance at the end and won't
// give the order Aldric sends after it. The Lances go back to barracks; the coup stalls. That night, out on the dry
// sea, a door opens in the empty air in front of Elodie, and she walks through it.

import { AFTER_EP35 } from "./arc4.js";
import { ZONES } from "../zones.js";

export const EP36_SCRIPT = `
title: Ep36_Cold
---
<<shot wide>>
The Crown Ward, the same night. A pale seam closes behind Hesper Voss in the Chancellor's garden.
<<shot on Hesper>>
Hesper: You've lost your map, and tomorrow you'll lose your gate.
<<shot on Aldric>>
Aldric: I don't need the map. I need the door, and I need the key.
<<shot on Hesper>>
Hesper: The door needs more than a key, Chancellor. It needs someone it knows. It already knows someone. You should keep a closer eye on your children.
===

title: Ep36_Hall
---
<<shot wide>>
Dawn on the plaza. The Lances in a line before the Hall of Lanterns, the Watch in a line behind the Lanterns, and every window round the square full of faces.
<<shot on Halvard>>
Halvard: The terms are simple. If I fall, the Lances go back to barracks. If you fall, the Watch goes home and the Lanterns go back to their lighthouse.
<<shot on Severin>>
Severin: And my father?
<<shot on Halvard>>
Halvard: Your father is watching from the Hall steps, my lord, where he can see everything and be seen to have nothing to do with any of it.
<<if $LUKE_GUARD>>
    <<shot on Luke>>
    Luke: For the record, I could take him. I'm letting you have this one.
<<endif>>
<<shot two Rook Halvard>>
-> "Let's get this over with." #bold
    Halvard: Agreed.
-> "You could still walk away." #earnest
    Halvard: I could. And then he'd send someone who enjoys it.
===

title: Ep36_Yield
---
<<shot wide>>
Halvard goes down on one knee and drives the butt of his lance into the paving, and leans on it, and doesn't get up.
<<shot on Halvard>>
Halvard: Thirty years. I'd like it noted that I lost to a Lantern, and not to the Chancellor's good sense.
<<show Aldric>>
<<shot on Aldric>>
Aldric comes down the Hall steps with a paper in his hand, already sealed.
Aldric: Commander. The Lowmarket has been sheltering rebels. You'll clear it. Fire is quickest.
<<shot on Halvard>>
Halvard: No, my lord.
<<shot on Aldric>>
Aldric: I don't remember asking.
<<shot on Halvard>>
Halvard: You didn't. I'm still saying no. Lances! Back to barracks.
<<shot on Severin>>
Severin: You heard him, Father. The terms were simple.
<<shot on Aldric>>
Aldric: ...The Crown Council will hear of this, Commander. And of you, Severin.
<<shot on Aldric>>
Aldric: It isn't over. It's barely started.
<<set $HALVARD_YIELDED to 1>>
===

title: Ep36_Door
---
<<sfx drums>>
<<shot wide>>
The Lighthouse, after midnight. Everyone is asleep except the drums.
<<shot on Elodie>>
Elodie is out on the sand in her nightdress again, and this time she isn't listening for anything. She's waiting.
<<fx rift Elodie>>
In front of her, in the empty air, a door opens. No wall and no frame, just a door-shaped piece of pale light standing on the dry sea.
Elodie: I know. I'm coming.
<<hide Elodie>>
<<show Severin>>
<<shot on Severin>>
Severin: Elodie? ...Elodie!
<<shot wide>>
The light folds shut. There's nothing on the sand but her footprints, and they stop.
<<set $ELODIE_TAKEN to 1>>
===
`;

const AU = { stage: "aurelin" }, LH = { stage: "lighthouse" };
// The duel in front of the Hall of Lanterns: the north half of the plaza, between the fountain and the colonnade.
const HALL_PLAZA = { rect: [-12, 5, 12, 24], solids: ZONES.aurelin.bounds.solids };

export const EPISODE_36 = {
  id: "ep36",
  number: 36,
  unlockAt: 5,
  setup: { ...AFTER_EP35 },
  title: "Lance-Commander",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep36_Cold", ...AU, rook: null, sky: { daylight: 0.05 },
      cast: [
        { id: "hesper", look: "hesper", x: -26.6, z: 26.4, yaw: 2.4 },
        { id: "aldric", look: "aldric", x: -24.8, z: 25.0, yaw: -0.8 },
      ] },
    { id: "title", type: "title" },
    { id: "hall", type: "scene", node: "Ep36_Hall", ...AU, sky: { daylight: 0.45 },
      rook: { x: 0, z: 9.6, yaw: 0 },
      cast: [
        { id: "halvard", look: "halvardFace", x: 0.4, z: 16.6, yaw: Math.PI },
        { id: "lance1", look: "lance", x: -2.8, z: 18.4, yaw: Math.PI },
        { id: "lance2", look: "lance", x: 3.2, z: 18.2, yaw: Math.PI },
        { id: "severin", look: "severin", x: -1.8, z: 8.8, yaw: 0.2 },
        { id: "juno", look: "juno", x: 1.9, z: 8.6, yaw: -0.2 },
        { id: "sergeant", look: "sergeant", x: -3.8, z: 7.6, yaw: 0.3 },
        { id: "luke", look: "luke", x: 3.8, z: 7.4, yaw: -0.3, when: "$LUKE_GUARD" },
      ] },
    { id: "duel", type: "fight", ...AU, sky: { daylight: 0.45 }, wave: ["halvard"], tokens: 2,
      world: { bounds: HALL_PLAZA, origin: { x: 0, z: 13 } },
      tutorial: [
        { at: 0.5, text: "His shield is up whenever he isn't attacking: get round it. The red glint is his charge; the Shield Bash can be parried." },
      ],
      eventHints: { lineCharge: "A red lane: the whole line is about to charge down it. Get out of the lane." },
      lines: [["Juno", "He's good. He's actually good."], ["Severin", "Mind his shield arm!"]],
      retry: "Up. The whole city's watching." },
    { id: "yield", type: "scene", node: "Ep36_Yield", ...AU, sky: { daylight: 0.5 },
      rook: { x: 0.2, z: 12.6, yaw: 0 },
      cast: [
        { id: "halvard", look: "halvardFace", x: 0.4, z: 15.6, yaw: Math.PI },
        { id: "severin", look: "severin", x: -1.8, z: 12.0, yaw: 0.4 },
        { id: "juno", look: "juno", x: 2.0, z: 11.8, yaw: -0.4 },
        { id: "aldric", look: "aldric", x: 3.6, z: 19.4, yaw: -2.6, hidden: true },
      ],
      set: { HALVARD_YIELDED: 1 } },
    { id: "door", type: "scene", node: "Ep36_Door", ...LH, rook: null, sky: { daylight: 0.05 },
      cast: [
        { id: "elodie", look: "elodie", x: 0.6, z: -7.4, yaw: Math.PI },
        { id: "severin", look: "severin", x: 1.6, z: -2.4, yaw: Math.PI, hidden: true },
      ],
      set: { EP36_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep37",
      lines: [
        "Next time on UNWRITTEN:",
        "Elodie is in the Hollow, on the other side of a door that wasn't there.",
        "And the Lanterns are going in after her.",
      ] },
  ],
};
