// Episode 46 · The Gate (GDD §14 Arc 5, §15.8 Setup). Before dawn on the Founding, the line on Elodie's wrist goes out
// like a candle, and Hesper is already inside the Lighthouse. At noon, in the Grand Archive, the Paragon renews the
// seal over the lock in front of the Crown, and the Chancellor walks in with his Lances to "secure" it. Halvard comes
// with the ones who still answer to him. Then Hesper steps out of a seam onto the dais with Elodie asleep on her feet,
// and puts Elodie's own finger to the stone, and the last line of fifteen years of hymns is written. The lock turns from
// the other side. Hesper meant to open the Hollow. Her face says that whatever's turning it isn't the Hollow. Out in
// the street, the sky above the Crown Ward tears open, red at the edges, and through it, very far off, rows of
// something standing very still, like a field of spears. And drums.

import { AFTER_EP45 } from "./arc5.js";
import { ARCHIVE_LAYOUT as L, ZONES } from "../zones.js";

export const EP46_SCRIPT = `
title: Ep46_Cold
---
<<shot wide>>
The Lighthouse, an hour before dawn on the Founding. Severin is asleep in the chair beside the window seat, his rapier across his knees. Elodie isn't asleep.
<<shot on Elodie>>
The line on her wrist flickers once, like a candle in a draught, and goes out.
<<fx rift Hesper>>
<<show Hesper>>
<<shot on Hesper>>
Hesper: Good morning, little page. It's time.
<<shot on Elodie>>
Elodie: Sev said not to open the door to anyone.
<<shot on Hesper>>
Hesper: And you didn't, darling. I'm not at the door. I'm already inside.
<<fx rift Elodie>>
<<hide Elodie>>
<<hide Hesper>>
<<shot wide>>
And the seam closes, and the window seat is empty, and Severin sleeps on for eleven more minutes.
<<set $ELODIE_TAKEN_AGAIN to 1>>
===

title: Ep46_Founding
---
<<shot wide>>
Noon in the Grand Archive. The Crown's officers along the stacks in their Founding blues, the eye in the dome full of sun, and the Paragon at the lock with Archivist Ottoline beside him and the seal in his hands.
<<shot on Paragon>>
Paragon: Two hundred years. Every Founding, someone stands here and promises it stays shut. This year it's me.
<<show Aldric>>
<<show Lance1>>
<<show Lance2>>
<<shot on Aldric>>
Aldric: And this year, Paragon, the Crown would like a little more than a promise. By the Regency Act, the Archive is under the Chancellor's protection until further notice.
<<shot on Paragon>>
Paragon: Aldric. The Crown is standing next to me.
<<shot on Aldric>>
Aldric: The Crown is a very old man in a very large chair. Lances. Secure the Archive.
<<shot on Juno>>
Juno: Where's Halvard? Halvard's not with them.
<<shot on Dagrun>>
Dagrun: Lanterns. Nobody touches the lock.
===

title: Ep46_Halvard
---
<<show Halvard>>
<<shot on Halvard>>
Halvard: Lances! To me. Those of you who still answer to me.
<<shot on Aldric>>
Aldric: You were always sentimental, Commander.
<<shot on Halvard>>
Halvard: I lost a duel, my lord. A man's allowed to be sentimental after that. Go home. The Founding's over.
<<shot on Aldric>>
Aldric: Oh, I don't think it's begun.
<<hide Aldric>>
<<show Severin>>
<<shot on Severin>>
Severin, out of breath, his collar torn, coming up the aisle between the stacks at a run.
<<shot on Severin>>
Severin: She's gone. Elodie. I fell asleep in the chair. The line went out, and she walked into a seam, and I didn't wake up.
<<shot two Severin Rook>>
-> "We'll find her." #earnest
    Severin: I know where she is. That's the problem.
-> "Where would Hesper take her?" #bold
    Severin: Where else? Here.
===

title: Ep46_Page
---
<<fx rift Hesper>>
<<show Hesper>>
<<show Elodie>>
<<shot wide>>
A seam opens over the dais and Hesper Voss steps down out of it onto the stone, holding Elodie by the hand. Elodie's eyes are open and she isn't looking at anything.
<<shot on Hesper>>
Hesper: Don't, Palimpsest. You'll only smudge it.
<<shot on Lio>>
Lio: The hymn. They're singing the last line. All of them, all over the city, I can hear it.
<<shot on Hesper>>
Hesper: Fifteen years of letters. Somebody has to sign them.
<<shot on Elodie>>
Elodie kneels, and puts one finger to the dark stone of the lock, and begins, very slowly, to write her name.
<<shot on Severin>>
Severin: ELODIE!
===

title: Ep46_Door
---
<<shot wide>>
The last cantor falls, and it doesn't matter. The name is written. The ring of script round the lock has gone from gold to red, and the two crescents of the keyhole are turning against each other, slowly, grinding.
<<shot on Ottoline>>
Ottoline: It's turning. Nobody's touching it. It's turning from the other side.
<<shot on Hesper>>
Hesper: Thank you, little page. Now. Let's see the Hollow open its...
<<shot on Hesper>>
For the first time since anyone has known her, Hesper Voss stops smiling.
<<shot on Hesper>>
Hesper: ...That isn't the Hollow.
<<fx rift Hesper>>
<<hide Hesper>>
<<hide Elodie>>
<<shot on Paragon>>
Paragon: Out. Everyone out of the Archive. Now!
<<set $LOCK_TURNED to 1>>
===

title: Ep46_Sky
---
<<shot wide>>
The street under the Hall of Lanterns. Half the city is out for the Founding, and all of it has stopped, and all of it is looking up.
<<cue gateOpen>>
<<shot sky -38 42 62>>
Above the Crown Ward the sky is tearing open, slowly, like cloth. Red at the edges. And the sky round it going red too, as if the light's coming through from somewhere else.
<<sfx drums>>
<<shot sky -38 36 62>>
And through it, very far off, rows of something standing very still. Like a field of spears.
<<shot on Bas>>
Bas: ...Spears.
<<shot on Severin>>
Severin: Elodie's in there. Somewhere. I know it.
<<shot on Dagrun>>
Dagrun: Lanterns. With me. We stay together.
<<set $GATE_OPEN to 1>>
===
`;

const LH = { stage: "lighthouse" }, AR = { stage: "archive" }, AU = { stage: "aurelin" };
const SEAT = { x: -3.4, z: 9.4 }, D = L.dais;
const FRONT = D.z - D.r; // the near edge of the dais

export const EPISODE_46 = {
  id: "ep46",
  number: 46,
  unlockAt: 5,
  setup: { ...AFTER_EP45 },
  title: "The Gate",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep46_Cold", ...LH, rook: null, sky: { daylight: 0.12 },
      cast: [
        { id: "elodie", look: "elodie", x: SEAT.x, z: SEAT.z, yaw: Math.PI * 0.85 },
        { id: "severin", look: "severin", x: SEAT.x + 1.8, z: SEAT.z - 1.4, yaw: -0.9, down: true },
        { id: "hesper", look: "hesper", x: SEAT.x - 2.2, z: SEAT.z - 0.4, yaw: 1.39, hidden: true },
      ] },
    { id: "title", type: "title" },
    { id: "founding", type: "scene", node: "Ep46_Founding", ...AR,
      rook: { x: 0, z: FRONT - 4.2, yaw: 0 },
      cast: [
        { id: "paragon", look: "paragon", x: 0.9, z: FRONT - 0.9, yaw: Math.PI },
        { id: "ottoline", look: "archivist", x: -1.9, z: FRONT - 0.8, yaw: 2.8 },
        { id: "juno", look: "juno", x: -2.0, z: FRONT - 4.0, yaw: 0.4 },
        { id: "bas", look: "bas", x: 2.2, z: FRONT - 4.2, yaw: -0.4 },
        { id: "dagrun", look: "dagrun", x: -3.6, z: FRONT - 2.4, yaw: 1.0 },
        { id: "officer1", look: "guard", x: -4.2, z: FRONT + 0.4, yaw: 1.4, crowd: true },
        { id: "officer2", look: "guard", x: 4.0, z: FRONT + 0.2, yaw: -1.4, crowd: true },
        { id: "aldric", look: "aldric", x: 0.2, z: FRONT - 7.6, yaw: 0, hidden: true },
        { id: "lance1", look: "lance", x: -1.3, z: FRONT - 8.6, yaw: 0.2, hidden: true },
        { id: "lance2", look: "lance", x: 1.4, z: FRONT - 8.8, yaw: -0.2, hidden: true },
      ] },
    { id: "seize", type: "fight", ...AR, wave: ["lance", "lance", "lance", "lance"], tokens: 2,
      world: { bounds: ZONES.archive.bounds },
      tutorial: [{ at: 0.5, text: "The Chancellor's Lances. Shields up whenever they aren't attacking: wait for the thrust, or get round them." }],
      lines: [["Juno", "In the Archive! On the Founding!"], ["Bas", "My arm's fine, thanks for asking!"]],
      retry: "Up. Nobody touches the lock." },
    { id: "halvard", type: "scene", node: "Ep46_Halvard", ...AR,
      rook: { x: 2.0, z: FRONT - 3.2, yaw: -2.6 },
      cast: [
        { id: "aldric", look: "aldric", x: -0.4, z: FRONT - 3.6, yaw: Math.PI * 0.9 },
        { id: "halvard", look: "halvardFace", x: 0.2, z: FRONT - 7.6, yaw: 0, hidden: true },
        { id: "juno", look: "juno", x: -2.6, z: FRONT - 2.6, yaw: 2.4 },
        { id: "paragon", look: "paragon", x: 0.9, z: FRONT - 0.9, yaw: Math.PI },
        { id: "severin", look: "severin", x: -0.4, z: FRONT - 9.6, yaw: 0, hidden: true },
      ] },
    { id: "page", type: "scene", node: "Ep46_Page", ...AR,
      rook: { x: 0, z: FRONT - 4.0, yaw: 0 },
      cast: [
        { id: "hesper", look: "hesper", x: -1.1, z: FRONT - 0.6, yaw: Math.PI, hidden: true },
        { id: "elodie", look: "elodie", x: 0.9, z: FRONT - 0.5, yaw: 0, hidden: true },
        { id: "lio", look: "lio", x: -2.4, z: FRONT - 3.6, yaw: 0.5 },
        { id: "severin", look: "severin", x: 2.2, z: FRONT - 3.8, yaw: -0.5 },
      ] },
    { id: "choir", type: "fight", ...AR, wave: ["cantor", "cantor", "acolyte", "acolyte", "bulwark"], tokens: 3,
      world: { bounds: ZONES.archive.bounds },
      tutorial: [{ at: 0.5, text: "Hesper's choir, between you and the lock. The cantors' hymn wards the rest: Gale breaks it." }],
      lines: [["Severin", "Elodie! Elodie, stop writing!"], ["Juno", "Get to the dais!"]],
      retry: "Up. She hasn't finished writing." },
    { id: "door", type: "scene", node: "Ep46_Door", ...AR,
      rook: { x: 0, z: FRONT - 4.0, yaw: 0 },
      cast: [
        { id: "hesper", look: "hesper", x: -1.1, z: FRONT - 0.6, yaw: Math.PI },
        { id: "elodie", look: "elodie", x: 0.9, z: FRONT - 0.5, yaw: 0 },
        { id: "ottoline", look: "archivist", x: -4.0, z: FRONT - 2.6, yaw: 1.2 },
        { id: "paragon", look: "paragon", x: 3.4, z: FRONT - 3.0, yaw: -1.1 },
        { id: "severin", look: "severin", x: 2.0, z: FRONT - 4.6, yaw: -0.4 },
      ] },
    { id: "sky", type: "scene", node: "Ep46_Sky", ...AU, sky: { daylight: 0.4 },
      rook: { x: 0, z: 9.0, yaw: 0 },
      cast: [
        { id: "bas", look: "bas", x: 2.2, z: 8.4, yaw: 0.1 },
        { id: "severin", look: "severin", x: -2.0, z: 8.6, yaw: -0.1 },
        { id: "dagrun", look: "dagrun", x: -0.6, z: 6.4, yaw: 0.2 },
        { id: "juno", look: "juno", x: 1.2, z: 6.2, yaw: -0.2 },
      ],
      set: { EP46_DONE: 1, GATE_OPEN: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep47",
      lines: [
        "Next time on UNWRITTEN: Lanterns in the Smoke.",
        "The Lowmarket Bridge, and the whole city running across it.",
        "Hold the line.",
      ] },
  ],
};
