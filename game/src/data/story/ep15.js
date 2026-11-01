// Episode 15 · Two Faces of the Choir (GDD §14 Arc 2; Boss 6; §15.5 D7).
//
// A strategy evening at the Lighthouse: Lio's found an old military treatise, Bas wants a formation, and Cal names one
// nobody uses, without looking up: "Spear-wall, three lines deep, marshal at the rear. Nobody fights like that anymore."
// (D7.) Then the Fens at night, a drowned chapel the Choir has made its own, and Boss 6: the Cantor Twins, Mirror and
// Smoke, whose hymns ward each other. Mirror, on her knees, gives up the Choir's target: the Hollowmarch Gate. The Mother
// will open it, and the Bloom will sing the border away.

import { AFTER_EP14 } from "./arc12.js";
import { ZONES } from "../zones.js";

export const EP15_SCRIPT = `
title: Ep15_Plans
---
<<shot wide>>
Evening at the Lighthouse. Maps on the long table, held down with mugs. Lio has a book open that's older than the Lighthouse.
<<shot on Lio>>
Lio: The Choir's been gathering in the Fens. Thirty of them, maybe forty. If they come at us in numbers, we need a better shape than "everybody hit whoever's nearest."
<<shot on Bas>>
Bas: A formation. Captain Brannoc's Wardens use a shield line. Could we—
<<shot on Cal>>
Cal: Spear-wall, three lines deep, marshal at the rear.
<<shot on Cal>>
He says it without looking up from the bread he's buttering.
<<shot on Lio>>
Lio: …That's in here. Page ninety. Nobody's used it in three hundred years.
<<shot on Cal>>
Cal: Nobody fights like that anymore. I read a lot. Pass the jam.
<<set $CLUE_D7 to 1>>
<<shot on Dagrun>>
Dagrun: Three of us aren't a spear-wall. We'll do "everybody hit whoever's nearest." It's worked so far.
===

title: Ep15_Mirror
---
<<shot wide>>
The drowned chapel in the Fens. Smoke's hymn has frayed into silence. Mirror is on her knees in the black water with her glass shield cracked across.
<<shot on Mirror>>
Mirror: You think you've stopped something. You've stopped two singers. The choir is very large.
<<shot on Mirror>>
Mirror: The Mother is going to open the Hollowmarch Gate. The Bloom will sing, and the border will go quiet, and everything behind it with it. Free.
<<shot on Juno>>
Juno: The Hollowmarch. Nobody goes into the Hollowmarch.
<<shot on Mirror>>
Mirror: Nobody comes out. That's different.
<<shot on Lio>>
Lio has come down into the water behind you. He's looking at her the way he looks at a page nobody else can see.
-> "Lio. Can you read her?"
    <<set $LIO_READ_TWIN to 1>>
    <<shot on Lio>>
    He kneels beside her. He doesn't touch her. For a moment his eyes go pale, the way they do over a page that isn't there.
    Lio: Two girls in a cold cloister. Nobody speaks. Not a word, for years. There's a woman they call Mother, and she hums, and the walls hum back.
    Lio: She tells them the Bloom is a kindness. That a place with nothing written on it can't hurt anyone.
    Lio: There's a garden under the Gate. White flowers, in rows. They've been tending it since they were small.
    <<shot on Lio>>
    He stops, all at once, like a door shutting. His hands are shaking in the black water.
    Lio: ...That's all. That's all there is.
    <<shot on Juno>>
    Juno: You all right?
    <<shot on Lio>>
    Lio: Cold water. I'm fine.
-> "Let her be."
    <<set $LIO_READ_TWIN to 0>>
    <<shot on Lio>>
    Lio looks at her a long moment, then away, and doesn't say anything at all.
<<set $CHOIR_TARGET to "gate">>
<<shot on Cal>>
Cal is looking north, where the Hollowmarch would be, if you could see it from here. You can't. He looks anyway.
<<set $EP15_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, FENS = { stage: "fens" }, DUSK = { sky: { daylight: 0.2 } }, NIGHT = { sky: { daylight: 0.06 } };
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
];

export const EPISODE_15 = {
  id: "ep15",
  number: 15,
  setup: { ...AFTER_EP14 },
  title: "Two Faces of the Choir",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "plans", type: "scene", node: "Ep15_Plans", ...LH, ...DUSK,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [...atTable, { id: "dagrun", look: "dagrun", x: 5.0, z: 9.6, yaw: Math.PI }, { id: "cal", look: "cal", x: 6.55, z: 3.5, yaw: -Math.PI / 2, pose: "sit" }] },
    { id: "chapel", type: "fight", ...FENS, ...NIGHT, wave: ["acolyte", "acolyte", "cantor", "bulwark"], tokens: 2,
      world: { bounds: ZONES.fens.bounds, origin: { x: 8, z: -6 } },
      lines: [["Juno", "The chapel's lit. They're inside."], ["Bas", "Shield first. Then the singer."]],
      retry: "Again. The chapel." },
    { id: "twins", type: "fight", ...FENS, ...NIGHT, wave: ["twinMirror", "twinSmoke"], tokens: 2,
      world: { bounds: ZONES.fens.bounds, origin: { x: 10, z: -4 }, companions: ["bas", "juno", "tamsin"] }, // Tamsin's Resonance (§16 B6)
      tutorial: [{ at: 0.5, text: "BOSS 6 · THE CANTOR TWINS. Mirror's glass turns away whatever hits it head-on: get round her. Smoke's hymn wards her sister: Gale breaks it." },
        { at: 9, text: "Tamsin's with you. Her Shatter Note (3) breaks glass: Mirror's guard cracks for a while, and every reflection near the note breaks at once." }],
      lines: [["Cal", "Two faces, one song. Break the song."], ["Juno", "Smoke first! She's keeping the other one whole!"], ["Tamsin", "Glass, I can do. Glass, I'm actually good at."]],
      eventHints: { // the duo (GDD §16 B6): the swap, the smoke and mirrors, the absorbing
        twinSwap: "They've swapped! Whoever holds the glass now turns you away head-on: get round her.",
        smokeUp: "Smoke and mirrors. The real two are hurt (watch the bars); a reflection breaks at a touch. Gale ({Spell1}) blows the smoke away.",
        twinAbsorb: "One's down, and the other's taken her song: the glass and the ward both. Gale the ward, then get round the glass.",
        glassShatter: "The glass is cracked! Hit her head-on while it's down. It mends in a few seconds.",
      },
      retry: "Again. Break the song.",
      set: { TWINS_DEFEATED: 1 } },
    { id: "mirror", type: "scene", node: "Ep15_Mirror", ...FENS, ...NIGHT,
      rook: { x: 9.0, z: -6.4, yaw: 0.6 },
      cast: [
        { id: "twinMirror", look: "twinMirror", x: 10.6, z: -4.2, yaw: Math.PI + 0.6, pose: "kneel" },
        { id: "juno", look: "juno", x: 7.4, z: -5.2, yaw: 1.2 },
        { id: "lio", look: "lio", x: 11.6, z: -6.6, yaw: -0.4 }, // (to read her, if you ask: GDD §16 B6)
        { id: "cal", look: "cal", x: 8.4, z: -8.6, yaw: 0.2 },
      ],
      set: { EP15_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep16",
      lines: [
        "Next time on UNWRITTEN:",
        "The night before the march. Everyone at the Lighthouse, and the light going round.",
        "And something said as a joke.",
      ] },
  ],
};
