// Episode 11 · Beneath the Festival (GDD §14 Arc 2).
//
// Children are going missing in the poor quarter, under the bunting: down the grate by the shacks, three this week. The
// Watch won't go down. Severin Valcourt is going down anyway, alone, and doesn't get to: a forced alliance (he's on the
// tag-swap bench). The Undercroft: a nest of rats, a child's shoe, a scrap of hymn sheet where no hymn should be, a
// clockwork sentinel; and from somewhere below the Gear Hall, children's voices, and water.

import { AFTER_EP10 } from "./arc12.js";
import { ZONES, AURELIN_LAYOUT as AU } from "../zones.js";

export const EP11_SCRIPT = `
title: Ep11_Grate
---
<<shot wide>>
The poor quarter at night, below the festival lights. A woman by the grate with a shawl over her head and nothing in her hands.
<<shot on Townswoman>>
Townswoman: My boy went down there. Three days. He's not the first. Three this week, and the Watch says it's rats.
<<shot on Severin>>
Severin is already there, at the grate, his rapier on his back and a lamp in his hand.
<<shot on Severin>>
Severin: The Watch won't go down. So I am. Alone.
<<shot on Juno>>
Juno: Absolutely not. You'll get eaten, and then your father will blame us.
<<shot on Severin>>
Severin: …Fine. Stay out of my way, one-page. And keep up.
-> "Together, then."
    <<set $SEVERIN_ALLY to "together">>
    <<shot on Rook>>
    Rook: Together, then.
    <<shot on Severin>>
    Severin: I said stay out of my way. That's not the same word.
-> "Try to keep up yourself."
    <<set $SEVERIN_ALLY to "race">>
    <<shot on Rook>>
    Rook: Try to keep up yourself.
    <<shot on Severin>>
    Severin almost smiles. He catches it in time.
===

title: Ep11_Shoe
---
<<shot on Rook>>
A child's shoe, wet through, at the edge of the rats' nest. Small. Recently new.
<<shot on Severin>>
Severin: …They came this way. All of them.
===

title: Ep11_Scrap
---
<<shot on Rook>>
A scrap of paper stuck to the wet stone: half a hymn, the Pale Choir's kind, the ink still sharp.
<<shot on Severin>>
Severin: The Choir. Down here. Taking children.
<<shot on Severin>>
Severin: My father says the Choir is a rumour the poor quarter tells itself. I'll tell him it bites.
===

title: Ep11_Voices
---
<<shot wide>>
The sentinel's springs wind down with a noise like a long sigh. And in the quiet after it, from below the floor, under the Gear Hall: voices. Children's. And water, a lot of water.
<<shot on Severin>>
Severin: The old cistern. It's flooded. Somebody's keeping them there.
<<shot on Severin>>
Severin: Somebody's feeding something.
<<shot on Severin>>
He looks at you, properly, for the first time since the Tower.
<<shot on Severin>>
Severin: You're not completely useless. Don't let it go to your head.
<<set $EP11_DONE to 1>>
===
`;

const AUR = { stage: "aurelin" }, UC = { stage: "undercroft" }, NIGHT = { sky: { daylight: 0.08 } };
const G = AU.grate;

export const EPISODE_11 = {
  id: "ep11",
  number: 11,
  setup: { ...AFTER_EP10 },
  title: "Beneath the Festival",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "grate", type: "scene", node: "Ep11_Grate", ...AUR, ...NIGHT,
      rook: { x: G.x - 1.6, z: G.z + 2.8, yaw: 2.6 },
      cast: [
        { id: "townswoman", look: "townswoman", x: G.x + 1.6, z: G.z + 1.8, yaw: -2.0 },
        { id: "severin", look: "severin", x: G.x - 3.6, z: G.z + 0.8, yaw: 1.2 },
        { id: "juno", look: "juno", x: G.x - 3.0, z: G.z + 4.2, yaw: 2.2 },
      ] },
    { id: "nest", type: "fight", ...UC, wave: ["rat", "rat", "rat", "rat", "rat"], tokens: 3,
      world: { bounds: ZONES.undercroft.bounds, origin: { x: 0, z: -4 }, party: ["severin"] },
      tutorial: [{ at: 0.5, text: "SEVERIN is on the tag-swap bench. Swap him in for his rapier and star needles; swap back when he's hurt." }],
      lines: [["Severin", "Rats. Of course it's rats."], ["Juno", "Big rats."]],
      retry: "Again. He's watching." },
    { id: "trail", type: "explore", ...UC,
      rook: { x: 0, z: -10, yaw: 0 },
      objective: "The children's trail through the Undercroft ({n}/{total}).",
      required: ["shoe", "scrap"], counts: "required",
      cast: [{ id: "severin", look: "severin", x: -2.0, z: -7.6, yaw: 0.4 }],
      pickups: [
        { id: "shoe", x: 6.0, z: -1.0, node: "Ep11_Shoe", label: "A child's shoe" },
        { id: "scrap", x: -6.4, z: 0.6, node: "Ep11_Scrap", label: "A scrap of paper" },
      ] },
    { id: "sentinel", type: "fight", ...UC, wave: ["clockwork", "rat", "rat"], tokens: 2,
      world: { bounds: ZONES.undercroft.bounds, origin: { x: 0, z: 19 }, party: ["severin"] },
      lines: [["Severin", "Clockwork. Old Crown make."], ["Bas", "Old means it's tough. Hit the joints."]],
      retry: "Again. Joints." },
    { id: "voices", type: "scene", node: "Ep11_Voices", ...UC,
      rook: { x: 0.4, z: 22.0, yaw: 0 },
      cast: [
        { id: "severin", look: "severin", x: -1.4, z: 23.6, yaw: 0.6 },
        { id: "juno", look: "juno", x: 2.0, z: 21.0, yaw: -0.6 },
      ],
      set: { EP11_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep12",
      lines: [
        "Next time on UNWRITTEN:",
        "The Drowned Cistern, and what somebody's been feeding down there.",
        "Rivals, shoulder to shoulder.",
      ] },
  ],
};
