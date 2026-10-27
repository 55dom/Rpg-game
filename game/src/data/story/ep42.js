// Episode 42 · A Name for Elodie (GDD §14 Arc 5). Mother Vey said: write on her first, a line the door can't read. In
// the Lighthouse at night Rook opens the Palimpsest's margin and writes the second clause, about Elodie, on the inside of
// her wrist (CLAUSE_II, the player's choice of words). The Choir comes for her that same night, over the Lighthouse wall.
// When they're beaten, Hesper opens a seam beside Elodie's window seat and reaches through, and the door's voice says
// Elodie's name the way her mother used to, and then stops, because the page has writing on it now. The seam closes.

import { AFTER_EP41 } from "./arc5.js";

export const EP42_SCRIPT = `
title: Ep42_Cold
---
<<shot wide>>
The old city under the Lowmarket. Hesper Voss is standing at the cracked door with her palm flat on the stone, as if she were feeling for a heartbeat.
<<shot on Hesper>>
Hesper: Mother Vey always did love a good student. She'll have told them about the page.
<<shot on Hesper>>
Hesper: Then tonight. Before anyone thinks of anything clever.
===

title: Ep42_Margin
---
<<shot wide>>
The Lighthouse, late. Elodie is in the window seat with her sleeve rolled up, holding out her wrist like someone waiting for a bandage.
<<shot on Lio>>
Lio: Vey said write on her first. A line the door can't read, because it isn't the door's. It's yours.
<<shot on Severin>>
Severin: You're going to write on my sister.
<<shot on Elodie>>
Elodie: I asked. Nobody's ever written anything on me, Sev. Everyone else got a whole book.
<<shot on Lio>>
Lio: The margin's open, {name}. One line. Make it true enough that she can stand on it.
<<shot two Elodie Rook>>
-> Write: "Elodie is nobody's page." #bold
    <<set $CLAUSE_II to "nobody">>
    Elodie: Nobody's. ...I like that. It sounds like a door slamming.
-> Write: "Elodie stays." #earnest
    <<set $CLAUSE_II to "stays">>
    Elodie: Stays. ...Like a cat. All right.
<<shot on Elodie>>
The words come up out of the grimoire in ink that isn't ink, and settle on the inside of her wrist, and sink in until they're only a faint grey line.
Elodie: It tickles.
<<shot on Severin>>
Severin: ...Thank you.
===

title: Ep42_Dagrun
---
Dagrun: Every door locked. Every window shuttered. Juno's on the roof with a bell and Bas is asleep in a chair in front of the kitchen door, which he calls guarding.
Dagrun: If they come, they come tonight. People like Hesper don't wait to see if you've been clever.
===

title: Ep42_Severin
---
Severin: She's asleep. She's never slept with her sleeve rolled up before. She keeps looking at it.
Severin: My father gave me a grimoire, a sword, and a name that opens doors. Nobody gave her anything. And then you did.
===

title: Ep42_Bas
---
Bas: I'm not asleep. I'm resting my eyes in a strategic direction.
===

title: Ep42_Lio
---
Lio: I crossed my sevens in the ledger tonight. All of them. It took an hour.
Lio: ...I'm all right. Go and check the doors.
===

title: Ep42_Seam
---
<<shot wide>>
The last of them go back over the wall. Inside, the Lighthouse is very quiet, and the air beside Elodie's window seat is opening, pale at the edges.
<<fx rift Hesper>>
<<show Hesper>>
<<shot on Hesper>>
Hesper: Hello, little page. Don't be frightened. Somebody very old wants to meet you.
<<shot on Elodie>>
And from somewhere far behind Hesper, from the white, comes the voice that says Elodie's name the way her mother used to. "Elo..."
<<shot on Elodie>>
And then it stops. As if it's reading something it can't make out.
<<shot on Hesper>>
Hesper: ...Oh. Oh, that's clever. Somebody's written on you.
<<shot two Hesper Rook>>
Hesper: Vey's idea, and your hand. It won't hold forever, Palimpsest. Nothing written does. But it's very good work.
<<hide Hesper>>
<<shot wide>>
The seam closes like an eye.
<<shot on Elodie>>
Elodie: It said my name. And then it said "who?"
<<shot on Severin>>
Severin: Nobody. It's nobody's business who.
<<set $HESPER_REFUSED to 1>>
===
`;

const LH = { stage: "lighthouse" }, OLD = { stage: "oldcity" };
const NIGHT = { sky: { daylight: 0.08 } };
const SEAT = { x: -3.4, z: 9.4 };   // the window seat where Elodie watches the dry sea

export const EPISODE_42 = {
  id: "ep42",
  number: 42,
  unlockAt: 5,
  setup: { ...AFTER_EP41 },
  title: "A Name for Elodie",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep42_Cold", ...OLD, rook: null,
      cast: [
        { id: "hesper", look: "hesper", x: 1.6, z: 13.0, yaw: 0 },
        { id: "cantor", look: "cantor", x: -1.4, z: 10.6, yaw: 0.4 },
      ] },
    { id: "title", type: "title" },
    { id: "margin", type: "scene", node: "Ep42_Margin", ...LH, ...NIGHT,
      rook: { x: SEAT.x + 1.4, z: SEAT.z - 2.0, yaw: -0.6 },
      cast: [
        { id: "elodie", look: "elodie", x: SEAT.x, z: SEAT.z, yaw: Math.PI * 0.85 },
        { id: "severin", look: "severin", x: SEAT.x - 1.6, z: SEAT.z - 1.2, yaw: 0.9 },
        { id: "lio", look: "lio", x: SEAT.x + 2.4, z: SEAT.z - 0.4, yaw: -1.7 },
      ] },
    { id: "watch", type: "explore", ...LH, ...NIGHT,
      rook: { x: SEAT.x + 1.4, z: SEAT.z - 2.2, yaw: Math.PI },
      objective: "Night at the Lighthouse. Check on the squad before the Choir comes ({n}/{total}).",
      required: ["dagrun", "severin"], counts: "required",
      cast: [
        { id: "dagrun", look: "dagrun", x: 4.2, z: -4.6, yaw: Math.PI, node: "Ep42_Dagrun" },
        { id: "severin", look: "severin", x: SEAT.x - 1.6, z: SEAT.z - 1.2, yaw: 0.9, node: "Ep42_Severin" },
        { id: "bas", look: "basSling", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep42_Bas" },
        { id: "lio", look: "lio", x: 3.2, z: 2.6, yaw: 0.4, node: "Ep42_Lio" },
      ] },
    { id: "wall", type: "fight", ...LH, ...NIGHT, wave: ["acolyte", "acolyte", "cantor", "acolyte", "cantor", "bulwark"], tokens: 3,
      tutorial: [{ at: 0.5, text: "They're over the wall. A bulwark's shield faces you: get round it, or break its guard." }],
      lines: [["Juno", "Over the wall! Six of them!"], ["Bas", "I was resting my eyes! Strategically!"]],
      retry: "Up. Elodie's inside." },
    { id: "seam", type: "scene", node: "Ep42_Seam", ...LH, ...NIGHT,
      rook: { x: SEAT.x + 2.0, z: SEAT.z - 2.6, yaw: -0.5 },
      cast: [
        { id: "elodie", look: "elodie", x: SEAT.x, z: SEAT.z, yaw: Math.PI * 0.85 },
        { id: "hesper", look: "hesper", x: SEAT.x - 2.2, z: SEAT.z - 0.4, yaw: 1.39, hidden: true }, // the house is at Elodie's back: the seam opens beside her
        { id: "severin", look: "severin", x: SEAT.x + 1.4, z: SEAT.z - 0.8, yaw: -1.46 },
      ],
      set: { EP42_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep43",
      lines: [
        "Next time on UNWRITTEN:",
        "Three days are up. The Paragon, the key, and the road to the Archive.",
        "And a black tear across it.",
      ] },
  ],
};
