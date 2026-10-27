// Episode 41 · The Silent School (GDD §14 Arc 5). A letter comes through a pale seam to the Lanterns' row in the Hall
// of Lanterns: Mother Vey, who taught Lio to read in the Choir's silent school, wants out. They meet her among the
// lanterns at night. She tells them what Hesper really needs: not the key. A page to write the invitation on, a child
// with nothing written on her, and the door already knows Elodie's name. The silent school comes for its own. Vey dies
// in the Hall, and the Keeper lights a lantern for her.

import { AFTER_EP40 } from "./arc5.js";
import { ZONES, HALL_LAYOUT as HL } from "../zones.js";

export const EP41_SCRIPT = `
title: Ep41_Cold
---
<<shot wide>>
The Hall of Lanterns after midnight. The Keeper is trimming wicks along the north wall when the air above the Lanterns' row opens, pale at the edges, and a folded letter drops out of it onto the shelf.
<<shot on Keeper>>
Keeper: ...We don't get a lot of post.
===

title: Ep41_Letter
---
<<shot wide>>
The Lighthouse. Lio has the letter open on the table and hasn't said anything for a long time.
<<shot on Lio>>
Lio: It's from Mother Vey. She taught me to read. In the silent school, before they sewed anything shut. She's the one who sent me to the Tower.
Lio: "The Choir is breaking. I want out. Meet me where the lanterns are."
<<shot on Juno>>
Juno: The last letter you got through a seam said "report or be silenced."
<<shot on Lio>>
Lio: I know. ...This one's in her hand. She used to cross her sevens. Nobody else in the Choir crosses their sevens.
<<shot on Dagrun>>
Dagrun: Tonight, then. The Hall. All of us, and nobody does anything brave.
<<shot two Lio Rook>>
-> "We'll keep you safe." #earnest
    Lio: It isn't me I'm worried about. It never was.
-> "And if it's a trap?" #wry
    Lio: Then it's a trap in the one building in Aurelin full of people who'd like to see us live. That's something.
===

title: Ep41_Vey
---
<<shot two Vey Lio>>
Mother Vey is an old woman in grey, sitting on the step under the Lanterns' row as if she'd been waiting there all her life.
Vey: Lio. You got tall. They feed you, out here.
<<shot on Lio>>
Lio: Juno feeds me. ...Mother, why are you here?
<<shot on Vey>>
Vey: Because Hesper Voss doesn't want the key. The key is for opening a door. Hesper wants what's on the other side to come through, and you can't ask something through a door. You have to write it an invitation.
Vey: For that, you need a page. A child with nothing written on her. No grimoire.
<<shot on Lio>>
Lio: Elodie.
<<shot on Vey>>
Vey: The door already knows her name. It said it, didn't it. The way her mother used to.
<<shot two Vey Rook>>
-> "How do we stop it?" #earnest
    Vey: Write on her first. Give her a line the door can't read. Your book can do it, Palimpsest. You've done it once already.
-> "Why help us now?" #bold
    Vey: Because I taught children to read, and Hesper wants to teach one to be a door. There's a difference, and I'm old enough to insist on it.
<<shot on Vey>>
Vey: They'll have followed me. The silent school always follows.
<<set $VEY_TOLD to 1>>
===

title: Ep41_Juno
---
Juno: Every squad's lanterns. Seven rows. Ours is the short one.
Juno: I come here sometimes and just stand. Don't tell anyone.
===

title: Ep41_Keeper
---
Keeper: An old woman in grey came in at the bell, and sat down under your row, and asked if she might wait. I said it's a hall, madam, waiting is most of what happens in it.
===

title: Ep41_Last
---
<<shot wide>>
The silencers are gone the way they came, through seams that close behind them. Mother Vey is sitting against the wall under the Lanterns' row, and the front of her grey robe is dark.
<<shot on Vey>>
Vey: They always follow. I did tell you.
<<shot on Lio>>
Lio: Mother. Mother, stay awake. Juno, do something...
<<shot on Juno>>
Juno: I am doing something, Lio. There isn't anything.
<<shot on Vey>>
Vey: Lio. Cross your sevens. So I know which letters are yours.
<<shot wide>>
And then she's still.
<<shot on Keeper>>
Keeper: We don't keep lanterns for the Choir.
<<shot on Keeper>>
Keeper: ...Tonight we do.
<<set $VEY_DEAD to 1>>
===
`;

const LH = { stage: "lighthouse" }, HA = { stage: "hall" };
const TABLE = { x: 5, z: 6 };   // the Lighthouse's long table
const ROW = HL.half[1] - 2.6;    // in front of the Lanterns' row, on the north wall

export const EPISODE_41 = {
  id: "ep41",
  number: 41,
  unlockAt: 5,
  setup: { ...AFTER_EP40 },
  title: "The Silent School",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep41_Cold", ...HA, rook: null,
      cast: [{ id: "keeper", look: "keeper", x: 1.4, z: ROW - 0.4, yaw: 0 }] },
    { id: "title", type: "title" },
    { id: "letter", type: "scene", node: "Ep41_Letter", ...LH, sky: { daylight: 0.3 },
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "lio", look: "lio", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "severin", look: "severin", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ] },
    { id: "hall", type: "explore", ...HA, sky: { daylight: 0.05 },
      rook: { x: 0, z: -8.4, yaw: 0 },
      objective: "Find Mother Vey among the lanterns.",
      required: ["vey"], counts: "required",
      cast: [
        { id: "vey", look: "vey", x: 0.6, z: ROW, yaw: Math.PI, node: "Ep41_Vey" },
        { id: "juno", look: "juno", x: -4.0, z: -2.2, yaw: Math.PI / 2, node: "Ep41_Juno" },
        { id: "keeper", look: "keeper", x: 1.6, z: -7.4, yaw: -2.6, node: "Ep41_Keeper" },
        { id: "lio", look: "lio", x: -1.4, z: 3.2, yaw: 0.2 },
      ] },
    { id: "silence", type: "fight", ...HA, sky: { daylight: 0.05 }, wave: ["acolyte", "acolyte", "cantor", "cantor"], tokens: 2,
      world: { bounds: ZONES.hall.bounds },
      tutorial: [{ at: 0.5, text: "The silent school: a cantor's hymn wards the others, and they shrug off your hits while it holds. Gale blows the hymn apart." }],
      lines: [["Juno", "In the Hall! In the Hall of Lanterns!"], ["Bas", "Keep them off the old woman."]],
      retry: "Up. Vey's behind you." },
    { id: "last", type: "scene", node: "Ep41_Last", ...HA, sky: { daylight: 0.05 },
      rook: { x: -1.2, z: ROW - 3.2, yaw: 0.3 },
      cast: [
        { id: "vey", look: "vey", x: 0.6, z: ROW, yaw: Math.PI, down: true },
        { id: "lio", look: "lio", x: 1.6, z: ROW - 1.4, yaw: -0.6 },
        { id: "juno", look: "juno", x: -0.6, z: ROW - 1.6, yaw: 0.6 },
        { id: "keeper", look: "keeper", x: 3.6, z: ROW - 3.4, yaw: -0.4 },
      ],
      set: { EP41_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep42",
      lines: [
        "Next time on UNWRITTEN:",
        "A line in the margin that the door can't read.",
        "And the Choir, at the Lighthouse door.",
      ] },
  ],
};
