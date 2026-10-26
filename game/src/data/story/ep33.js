// Episode 33 · The Room Before the Door (GDD §14 Arc 4). Elodie walks out of the Lighthouse in her nightdress,
// following the drums. She went down the Lowmarket grate, through a crack in the Undercroft's last passage, into the
// old city the Paragon built Aurelin on top of. Follow her bare footprints past empty armor that walks; at the north
// end of the old city she stands with her palms on a door in the rock that hums, and says it knows her name. The
// crack in it widens a hand's width, and Hollow Shells walk out. Halvard comes down after with surveyors' chains:
// the door is Crown property now, and tomorrow night the Chancellor brings the Writ down to it.

import { AFTER_EP32 } from "./arc4.js";
import { ZONES, OLDCITY_LAYOUT as OC } from "../zones.js";

export const EP33_SCRIPT = `
title: Ep33_Cold
---
<<sfx drums>>
<<shot wide>>
The Lighthouse, three hours before dawn. Under the floor, the drums again. Slower than before, and closer.
<<shot on Elodie>>
Elodie is standing in the doorway in her nightdress, with no shoes on, listening.
Elodie: ...Yes. I'm coming.
<<move Elodie -2.2 2.0>>
<<shot wide>>
She walks out onto the dry sea, toward the city, and doesn't look back.
===

title: Ep33_Grate
---
<<shot wide>>
The Lowmarket grate at first light. The iron cover is off and lying in the gutter.
<<if $LUKE_GUARD>>
    <<shot on Luke>>
    Luke: A girl in a nightdress, barefoot, about the right age to be somebody's sister. She went down there an hour ago. I'd have followed her, but the Captain says the Undercroft is "not a Watch matter."
    Luke: ...Go on. Bring her up. I'll put the cover back after you, so nobody else's kid gets ideas.
<<else>>
    <<shot on Sergeant>>
    Sergeant: Girl in a nightdress went down there an hour ago, bare feet. I'm not paid enough to follow anybody into the Undercroft. You lot are.
<<endif>>
<<shot on Severin>>
Severin: Elodie. It's Elodie.
<<shot on Lio>>
Lio: Before the Gear Hall there's a crack in the passage wall. The Choir used it. It goes down a long way.
<<shot two Severin Rook>>
-> "Then we go down a long way." #bold
    Severin: Yes.
-> "Stay close, Severin. Don't run ahead." #earnest
    Severin: I'm going to run ahead. I'm telling you now so you're not surprised.
===

title: Ep33_Lio
---
Lio: This is the city before the city. The Paragon built Aurelin on top of it and never told anyone why.
Lio: The Choir had a word for this place. It means "the room before the door."
===

title: Ep33_Tamsin
---
Tamsin: Drums. I can feel them in my teeth.
Tamsin: I hate it here. I'd like that written down somewhere.
===

title: Ep33_Print1
---
Small bare footprints in the dust of the street, heading north in a straight line. She didn't stop to look at anything.
<<set $PRINT_1 to 1>>
===

title: Ep33_Print2
---
The footprints go down into the dry canal and up the far side, nowhere near the bridge, as if she never saw the drop.
<<set $PRINT_2 to 1>>
===

title: Ep33_Print3
---
A ribbon from a nightdress, caught on a broken pillar. The drums are very loud here.
<<set $PRINT_3 to 1>>
===

title: Ep33_Severin
---
Severin: She's there. At the door. She's just standing there with her hands on it.
Severin: ...Why are her hands on it?
===

title: Ep33_Door
---
<<sfx hum>>
<<shot wide>>
The plaza in front of the door. Elodie stands at the foot of it with both palms flat on the stone, and the crack down its middle is breathing light.
<<shot on Elodie>>
Elodie: It knows my name.
<<shot on Severin>>
Severin: Elodie. Come away from it. Slowly.
<<shot on Elodie>>
Elodie: It's asking me to open it. It asks so nicely.
<<sfx drums>>
<<cue doorOpen>>
<<shot wide>>
The crack widens. Not much, a hand's width. Light comes through, pale and cold, and then something heavier comes through behind it.
<<show shell1>>
<<show shell2>>
<<show shell3>>
<<shot on shell2>>
Armor. Old armor, walking, with a sword in its hand and nobody inside it.
<<shot on Juno>>
Juno: Lanterns! Up!
<<set $ELODIE_DOOR to 1>>
===

title: Ep33_After
---
<<cue doorShut>>
<<shot wide>>
The crack in the door narrows to a thread of light, and the humming stops as if a hand had been laid over it.
<<shot two Severin Elodie>>
Severin has Elodie in his arms. She's awake, and very cold.
Elodie: It said my name. Not the way you say it. The way Mother used to.
Severin: Mother's dead, Elodie.
Elodie: I know. That's why.
<<shot on Lio>>
Lio has his hand flat on the carving, the way Elodie had hers.
Lio: The sun is the Paragon's. Under it, the same line as the mural on the Isles. What was sent away... and a word I don't know. Not Choir. Older.
<<shot on Juno>>
Juno: The armor. There was nobody in it. I hit one in the face and there wasn't a face.
<<show Halvard>>
<<show lance1>>
<<show lance2>>
<<shot wide>>
Lanterns on the steps. Halvard, and a dozen men with surveyors' chains and the Chancellor's seal.
<<shot on Halvard>>
Halvard: By order of the High Chancellor, this door is Crown property. ...You found it before we did. He won't like that.
<<shot on Severin>>
Severin: Then tell him his door tried to eat his daughter.
<<shot on Halvard>>
Halvard: ...I'll tell him. The Chancellor brings the Writ down here tomorrow night, through the Lowmarket, under guard.
Halvard: I'm telling you so that afterwards, I can say I told you.
<<shot two Rook Halvard>>
-> "Why tell us?" #earnest
    Halvard: Because I've served the Crown for thirty years, and I'd like to go on being able to say so.
-> "Is that a threat?" #bold
    Halvard: It's a route, Lantern. Do what you like with it.
<<set $CONVOY_ROUTE to 1>>
<<set $HOLLOW_DOOR to 1>>
===
`;

const LH = { stage: "lighthouse" }, AU = { stage: "aurelin" }, OLD = { stage: "oldcity" };
const GRATE = { x: 30, z: -24 }; // the Lowmarket grate, down to the Undercroft
const D = OC.door;

export const EPISODE_33 = {
  id: "ep33",
  number: 33,
  unlockAt: 5,
  setup: { ...AFTER_EP32 },
  title: "The Room Before the Door",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep33_Cold", ...LH, rook: null, sky: { daylight: 0.05 },
      cast: [{ id: "elodie", look: "elodie", x: -3.6, z: 9.2, yaw: Math.PI }] },
    { id: "title", type: "title" },
    { id: "grate", type: "scene", node: "Ep33_Grate", ...AU, sky: { daylight: 0.3 },
      rook: { x: GRATE.x - 2.6, z: GRATE.z + 3.0, yaw: 2.4 },
      cast: [
        { id: "severin", look: "severin", x: GRATE.x - 1.0, z: GRATE.z + 2.6, yaw: 2.8 },
        { id: "juno", look: "juno", x: GRATE.x - 3.8, z: GRATE.z + 1.6, yaw: 2.0 },
        { id: "lio", look: "lio", x: GRATE.x - 2.4, z: GRATE.z + 4.6, yaw: 2.6 },
        { id: "tamsin", look: "tamsin", x: GRATE.x - 4.4, z: GRATE.z + 3.4, yaw: 2.2 },
        { id: "luke", look: "luke", x: GRATE.x + 1.6, z: GRATE.z + 1.2, yaw: -1.6, when: "$LUKE_GUARD" },
        { id: "sergeant", look: "sergeant", x: GRATE.x + 2.2, z: GRATE.z - 1.4, yaw: -1.2, when: "not $LUKE_GUARD" },
      ] },
    { id: "under", type: "explore", ...OLD,
      rook: { x: 0, z: OC.stairs.z + 2.6, yaw: 0 },
      objective: "Follow Elodie's footprints through the old city to Severin ({n}/{total}).",
      required: ["print1", "print2", "print3", "severin"], counts: "required",
      cast: [
        { id: "severin", look: "severin", x: 0.4, z: -4.2, yaw: 0, node: "Ep33_Severin" },
        { id: "lio", look: "lio", x: 2.6, z: -36.2, yaw: -0.4, node: "Ep33_Lio" },
        { id: "tamsin", look: "tamsin", x: -2.8, z: -35.4, yaw: 0.6, node: "Ep33_Tamsin" },
      ],
      pickups: [
        { id: "print1", x: -1.2, z: -31.5, node: "Ep33_Print1", label: "Look at the footprints" },
        { id: "print2", x: 4.2, z: -19.2, node: "Ep33_Print2", label: "Look at the footprints" },
        { id: "print3", x: -8.6, z: -6.0, node: "Ep33_Print3", label: "Pick up the ribbon" },
      ],
      encounters: [
        { id: "street", rect: [-9, -31, 9, -23], at: { x: 0, z: -27, r: 4 }, wave: ["shell"], flag: "EP33_STREET", label: "EMPTY ARMOR" },
        { id: "canal", rect: [-12, -13, 12, -8.5], at: { x: 0, z: -10.5, r: 4 }, wave: ["shell", "shell"], flag: "EP33_CANAL", label: "EMPTY ARMOR" },
      ] },
    { id: "door", type: "scene", node: "Ep33_Door", ...OLD,
      rook: { x: 0.6, z: 5.6, yaw: 0 },
      cast: [
        { id: "elodie", look: "elodie", x: 0, z: D.z - 2.6, yaw: 0 },
        { id: "severin", look: "severin", x: -1.6, z: 6.6, yaw: 0.2 },
        { id: "juno", look: "juno", x: 2.4, z: 5.0, yaw: -0.3 },
        { id: "lio", look: "lio", x: 3.4, z: 6.8, yaw: -0.5 },
        { id: "tamsin", look: "tamsin", x: -3.4, z: 5.2, yaw: 0.4 },
        { id: "shell1", look: "shell", x: -2.4, z: D.z - 2.0, yaw: Math.PI, hidden: true },
        { id: "shell2", look: "shell", x: 0.2, z: D.z - 0.9, yaw: Math.PI, hidden: true },
        { id: "shell3", look: "shell", x: 2.6, z: D.z - 2.0, yaw: Math.PI, hidden: true },
      ] },
    { id: "hollow", type: "fight", ...OLD, wave: ["shell", "shell", "shell"], tokens: 2,
      world: { bounds: { radius: 13, solids: ZONES.oldcity.bounds.solids } },
      tutorial: [
        { at: 0.5, text: "Hollow Shells: nothing staggers them mid-swing. A red glint is the overhead, and it can't be blocked: step aside." },
      ],
      eventHints: { reform: "It's pulling itself back together. Knock it down again: the second time, it stays down." },
      lines: [["Juno", "There's nobody in them!"], ["Severin", "Elodie, behind me. Behind me!"]],
      retry: "Up. Elodie's still at the door." },
    { id: "after", type: "scene", node: "Ep33_After", ...OLD,
      rook: { x: 1.8, z: 4.4, yaw: -0.4 },
      cast: [
        { id: "elodie", look: "elodie", x: -0.6, z: 6.4, yaw: 0.4 },
        { id: "severin", look: "severin", x: -1.8, z: 7.2, yaw: 0.8 },
        { id: "lio", look: "lio", x: 0.8, z: D.z - 2.4, yaw: 0 },
        { id: "juno", look: "juno", x: 3.4, z: 5.8, yaw: -0.8 },
        { id: "halvard", look: "halvardFace", x: 0.4, z: -2.6, yaw: 0, hidden: true },
        { id: "lance1", look: "lance", x: -2.2, z: -3.8, yaw: 0.2, hidden: true },
        { id: "lance2", look: "lance", x: 2.8, z: -3.6, yaw: -0.2, hidden: true },
      ],
      set: { EP33_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep34",
      lines: [
        "Next time on UNWRITTEN:",
        "The Chancellor brings the Writ through the Lowmarket at night, under guard.",
        "And somebody else has been told the route.",
      ] },
  ],
};

/** Free roam in the old city (after Ep 33): the door, humming to itself. */
export const OLDCITY_SCRIPT = `
title: W_HollowDoor
---
<<sfx hum>>
The door is cold under your hand. The crack down its middle is a thread of pale light, and the carving of the Paragon's sun is worn almost smooth.
Under the floor, very far off, the drums.
<<if $ELODIE_DOOR>>
    It said her name. It doesn't say yours.
<<endif>>
===
`;
