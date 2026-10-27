// Episode 43 · Go Home, Lantern (GDD §15.7 Encounter VI, §14 Arc 5). Three days are up. The Paragon gives Rook the
// case with the key's other half in it, and the Lanterns carry it into Aurelin with him. In the plaza the Choir comes
// out of seams all round the fountain, and its cantors sing a ring round the Paragon and hold him there. The Lanterns
// go on alone, and on the road under the Hall of Lanterns a black tear opens in front of them: the second full duel
// with the masked knight (data/masked.js Encounter VI: everything from the vault, plus the Draw and the Ring of Edges).
// He takes the half-key out of the case and says three words. Now he has both halves of the only key to the door.

import { AFTER_EP42 } from "./arc5.js";
import { ZONES } from "../zones.js";

export const EP43_SCRIPT = `
title: Ep43_Cold
---
<<shot wide>>
The Lighthouse, before dawn. Juno comes down for water and finds Elodie in the window seat, awake, with her ear against the glass.
<<shot on Elodie>>
Elodie: The drums are back.
<<shot on Juno>>
Juno: Elodie, there's no sea out there. There's never been a drum.
<<shot on Elodie>>
Elodie: They stopped after the Hollow. Now they've started again. ...They're closer.
===

title: Ep43_Case
---
<<shot wide>>
Morning in the Lighthouse yard. The Paragon sets a plain iron case on the table and opens it. Inside, on grey velvet, half of a white-gold key, snapped clean across the bow. It hums.
<<shot on Paragon>>
Paragon: You carry it, Lantern.
<<shot on Juno>>
Juno: Rook? Not you?
<<shot on Paragon>>
Paragon: Everyone in Aurelin knows what I look like. Anyone after the key will come at me. Nobody will look twice at a squire carrying a box.
<<shot on Severin>>
Severin: I'll stay. Someone should be here with Elodie. With the drums.
<<shot two Paragon Rook>>
-> "I won't let go of it." #earnest
    Paragon: I know. That's why it's you.
-> "And if somebody does look twice?" #wry
    Paragon: Then you'll have me, and Juno, and Bas, and a very heavy iron box to hit them with.
<<set $KEY_CARRIED to 1>>
===

title: Ep43_Holt
---
Sergeant: The Paragon, through my gate, twice in a week. My wife won't believe it. She doesn't believe most things I tell her.
Sergeant: The road's clear to the plaza. After that it's the Crown Ward's problem.
===

title: Ep43_Luke
---
Luke: They've put me on the gate for the Paragon. Me. I polished the helmet. Twice.
Luke: ...Go on, then. Carry your box. Everyone's looking at him, not you.
===

title: Ep43_Juno
---
Juno: If anyone asks, it's a box of buttons. Very important buttons.
===

title: Ep43_Bas
---
Bas: Brace is off tomorrow. Today I've got one good arm and a lot of opinions.
===

title: Ep43_Plaza
---
<<shot two Paragon Rook>>
Paragon: Quiet, isn't it? The Choir's been quiet since the Lighthouse. I don't like it when singers are quiet.
<<shot on Paragon>>
Paragon: Keep the case between you and me. North, past the Hall of Lanterns, and the Archive's at the top of the hill.
===

title: Ep43_Split
---
<<shot wide>>
The last of the acolytes are down, but the cantors have made a ring round the Paragon by the fountain, and they're singing, and he can't move. The light on his spear has gone thin.
<<shot on Paragon>>
Paragon: Go. North. Get it to the Archive.
<<shot on Juno>>
Juno: We're not leaving you!
<<shot on Paragon>>
Paragon: You're not leaving me, you're carrying my key. I'll be right behind you. I'm very hard to keep still for long.
===

title: Ep43_Tear
---
<<set $SABLE_ENCOUNTER to 6>>
<<shot wide>>
The road under the Hall of Lanterns, empty in the middle of the morning. The case is heavy and humming under Rook's arm.
<<fx tear Masked>>
<<show Masked>>
<<shot on Masked>>
And a black tear opens across the road ahead, and he walks out of it with the glaive held low, and stops.
<<shot on Juno>>
Juno: Him.
<<shot on Bas>>
Bas: Last time I met him I lost an arm for two months. I've still got the other one.
<<shot two Rook Masked>>
-> "Get behind me." #bold
    Juno: Not a chance.
-> "Juno. Bas. Run." #earnest
    Bas: Not a chance.
===

title: Ep43_Taken
---
<<shot wide>>
When the dust settles he's standing on the Hall steps with the case open at his feet. The half of the key is in his hand.
<<shot two Rook Masked>>
-> "Give it back." #bold
    His head tilts, a little, as if he's listening. He doesn't give it back.
-> "Why? What is it for?" #earnest
    His head tilts, a little, as if he's listening. He doesn't answer.
<<shot on Masked>>
Masked: Go home, Lantern.
<<fx tear Masked>>
<<hide Masked>>
<<shot wide>>
And the tear closes behind him, and the road is just a road, and the case is empty.
<<set $KEY_TAKEN to 1>>
===

title: Ep43_After
---
<<shot on Paragon>>
The Paragon comes up the road at a run, with his spear blazing and three cantors' worth of silence still ringing in his ears, and stops when he sees the empty case.
<<shot on Paragon>>
Paragon: Are you hurt? All three of you?
<<shot on Bas>>
Bas: No. ...No. He had us, and he stopped. Again.
<<shot on Paragon>>
Paragon: Then he has both halves. The one from the vault, and mine. Two hundred years, and the only key to that door is in one pair of hands.
<<shot on Juno>>
Juno: So nobody can open it. Not Hesper. Not anyone. That's good. Isn't that good?
<<shot on Paragon>>
Paragon: It depends entirely on what he wants it for.
===
`;

const LH = { stage: "lighthouse" }, AU = { stage: "aurelin" };
const SEAT = { x: -3.4, z: 9.4 };   // Elodie's window seat
const TABLE = { x: 5, z: 6 };       // the Lighthouse's long table
const PLAZA = { radius: 15, solids: ZONES.aurelin.bounds.solids };
const HALL_ROAD = { rect: [-12, 5, 12, 24], solids: ZONES.aurelin.bounds.solids }; // under the Hall of Lanterns

export const EPISODE_43 = {
  id: "ep43",
  number: 43,
  unlockAt: 5,
  setup: { ...AFTER_EP42 },
  title: "Go Home, Lantern",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep43_Cold", ...LH, rook: null, sky: { daylight: 0.15 },
      cast: [
        { id: "elodie", look: "elodie", x: SEAT.x, z: SEAT.z, yaw: Math.PI * 0.85 },
        { id: "juno", look: "juno", x: SEAT.x + 1.8, z: SEAT.z - 1.4, yaw: -0.9 },
      ] },
    { id: "title", type: "title" },
    { id: "case", type: "scene", node: "Ep43_Case", ...LH,
      rook: { x: TABLE.x - 1.5, z: TABLE.z - 3.4, yaw: 0.5 },
      cast: [
        { id: "paragon", look: "paragon", x: TABLE.x + 1.6, z: TABLE.z - 3.0, yaw: -1.6 },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.6, yaw: 2.2 },
        { id: "severin", look: "severin", x: TABLE.x + 2.8, z: TABLE.z - 0.2, yaw: -2.4 },
        { id: "bas", look: "basSling", x: TABLE.x - 3.4, z: TABLE.z - 2.0, yaw: 1.2 },
      ] },
    { id: "road", type: "explore", ...AU, sky: { daylight: 0.6 },
      rook: { x: 0, z: -30, yaw: 0 },
      objective: "Carry the case through the city. Catch up with the Paragon at the fountain.",
      required: ["paragon"], counts: "required",
      cast: [
        { id: "paragon", look: "paragon", x: 0.6, z: -8.6, yaw: Math.PI, node: "Ep43_Plaza" },
        { id: "holt", look: "sergeant", x: -3.6, z: -30.6, yaw: 1.2, node: "Ep43_Holt" },
        { id: "luke", look: "luke", x: 3.8, z: -30.6, yaw: -1.2, node: "Ep43_Luke", when: "$LUKE_GUARD" },
        { id: "juno", look: "juno", x: -2.2, z: -26.4, yaw: 0.4, node: "Ep43_Juno" },
        { id: "bas", look: "basSling", x: 2.4, z: -26.8, yaw: -0.4, node: "Ep43_Bas" },
      ] },
    { id: "ambush", type: "fight", ...AU, sky: { daylight: 0.6 }, wave: ["acolyte", "acolyte", "cantor", "acolyte", "bulwark"], tokens: 2,
      world: { bounds: PLAZA },
      tutorial: [{ at: 0.5, text: "The Choir, out of seams all round the fountain. Keep the case: the Paragon's holding the singers." }],
      lines: [["Paragon", "Seams! Lanterns, keep the case moving!"], ["Juno", "Buttons! It's a box of buttons!"]],
      retry: "Up. The case is still under your arm." },
    { id: "split", type: "scene", node: "Ep43_Split", ...AU, sky: { daylight: 0.6 },
      rook: { x: 0.4, z: 4.2, yaw: 0 },
      cast: [
        { id: "paragon", look: "paragon", x: 0.2, z: 7.4, yaw: Math.PI },
        { id: "cantor1", look: "cantor", x: -2.8, z: 9.0, yaw: 2.2, crowd: true },
        { id: "cantor2", look: "cantor", x: 3.2, z: 9.2, yaw: -2.2, crowd: true },
        { id: "juno", look: "juno", x: -1.8, z: 4.4, yaw: 0.4 },
        { id: "bas", look: "basSling", x: 2.4, z: 4.0, yaw: -0.4 },
      ] },
    { id: "tear", type: "scene", node: "Ep43_Tear", ...AU, sky: { daylight: 0.6 },
      rook: { x: 0, z: 9.6, yaw: 0 },
      cast: [
        { id: "masked", look: "masked", x: 0, z: 15.6, yaw: Math.PI, hidden: true },
        { id: "juno", look: "juno", x: -1.8, z: 9.0, yaw: 0.2 },
        { id: "bas", look: "basSling", x: 2.0, z: 8.8, yaw: -0.2 },
      ] },
    { id: "duel", type: "fight", ...AU, sky: { daylight: 0.6 }, wave: ["maskedVI"], tokens: 2,
      world: { bounds: HALL_ROAD, origin: { x: 0, z: 13 } },
      tutorial: [
        { at: 0.5, text: "Everything he did in the vault, he still does: the blink to your left (hit him as he comes out), the floor that opens, left, left, back." },
        { at: 14, text: "He's after the case. He won't finish you. That isn't the same as not hurting you." },
      ],
      eventHints: {
        severExposed: "The seam behind him is still open. He's exposed: hit him now.",
        drawMark: "A black tear under your feet, and another in front of him. Step off it, or you come out at his glaive.",
        drawn: "Drawn in: the Cleave's already coming down. Parry it, or dodge.",
        edgeRing: "Tears in a ring all round you. The middle is the one place the cuts don't reach.",
        hardLanding: "Dropped out of the air? Jump or dash before you land and you'll come down on your feet.",
      },
      lines: [["Juno", "Watch his left! He always comes in on the left!"], ["Bas", "Keep the box away from him!"]],
      retry: "Up. The case is on the ground. Get to it first." },
    { id: "taken", type: "scene", node: "Ep43_Taken", ...AU, sky: { daylight: 0.6 },
      rook: { x: 0, z: 12.4, yaw: 0 },
      cast: [
        { id: "masked", look: "masked", x: 0.4, z: 17.0, yaw: Math.PI },
        { id: "juno", look: "juno", x: -2.2, z: 11.6, yaw: 0.3 },
        { id: "bas", look: "basSling", x: 2.4, z: 11.4, yaw: -0.3 },
      ] },
    { id: "after", type: "scene", node: "Ep43_After", ...AU, sky: { daylight: 0.6 },
      rook: { x: 0, z: 12.4, yaw: Math.PI },
      cast: [
        { id: "paragon", look: "paragon", x: 0.6, z: 8.4, yaw: 0 },
        { id: "juno", look: "juno", x: -2.2, z: 11.0, yaw: 2.4 },
        { id: "bas", look: "basSling", x: 2.6, z: 11.2, yaw: -2.4 },
      ],
      set: { EP43_DONE: 1, KEY_TAKEN: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep44",
      lines: [
        "Next time on UNWRITTEN:",
        "The Grand Archive, and a lock two hundred years old.",
        "And what Hesper's been writing all this time.",
      ] },
  ],
};
