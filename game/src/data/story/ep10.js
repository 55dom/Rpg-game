// Episode 10 · The Hall of Lanterns (GDD §14 Arc 2; §15.5, the wick that turns to ash).
//
// The capital's great hall: every squad's shelf of lanterns, every knight's flame, mirrored by the lanterns their squads
// keep at home. The Keeper: when a knight dies, the wick turns to ash (and on the Iron Wardens' shelf there's one that
// has, years ago, a little grey curl nobody's cleared). Rook lights their lantern on the Lanterns' shelf, at the end of
// the row. Cal's: "Never once gone out. I'm very reliable." Lio at the Silent Quill's shelf, black lanterns for a squad
// that doesn't speak. The Choir slips in at closing to snuff a few; and afterwards, a flame on the shelf with your name.

import { AFTER_EP9 } from "./arc12.js";
import { ZONES, HALL_LAYOUT as H } from "../zones.js";

export const EP10_SCRIPT = `
title: Ep10_Keeper
---
<<shot wide>>
The Hall of Lanterns. A long cold hall of shelves, one for every squad in the kingdom, and on every shelf a row of lanterns, one for every knight, all of them lit.
<<shot on Keeper>>
Keeper: Every knight's flame burns here, and at home with their squad. Same flame, two lanterns. You'll find yours on the Lanterns' shelf, at the end. It's waiting.
<<shot on Keeper>>
Keeper: When a knight dies, the wick goes to ash. That's how we know, sometimes before anyone tells us.
<<shot on Cal>>
Cal: Cheerful. The Keeper's very cheerful. It's the cold.
<<shot on Cal>>
Cal: Mine's that one. Second from the left. Never once gone out. I'm very reliable.
===

title: Ep10_Ash
---
<<shot on Rook>>
On the Iron Wardens' shelf, in among the lit ones, one lantern isn't. Its wick is a little grey curl of ash, years old, that nobody has had the heart to clear away.
<<shot on Bas>>
Bas: Captain Brannoc's lot. He says you don't clear them. You leave them. So the shelf remembers.
===

title: Ep10_Quill
---
<<shot on Lio>>
Lio is standing at the Silent Quill's shelf. Their lanterns are black iron, and their flames are very small.
<<shot on Lio>>
Lio: The Silent Quill. They don't speak, on duty. They write. I used to think that was… peaceful.
<<shot on Lio>>
Lio: Never mind. It's nothing. Go and light yours.
===

title: Ep10_Light
---
<<shot wide>>
At the end of the Lanterns' row, after Lio's, one lantern stands cold. A brass tag on its hook, with your name scratched in.
<<shot on Dagrun>>
Dagrun hands you a taper lit from his own flame.
<<shot on Dagrun>>
Dagrun: Go on. It's yours. Took long enough.
<<set $LANTERN_LIT to 1>>
<<set $HALL_LANTERN to 1>>
<<shot on Rook>>
The wick takes. A small flame, one of seven in a row, the same height as everyone else's.
<<shot on Cal>>
Cal: There. Now you're on the shelf. Can't get rid of you now. We've tried, with others. It never works.
===

title: Ep10_After
---
<<shot wide>>
The Choir's people are gone out into the night, and not one lantern on any shelf went out. The Keeper is counting them anyway, all of them, out loud.
<<shot on Dagrun>>
Dagrun: You stood in front of the shelf. Didn't think about it. Just stood there.
<<shot on Dagrun>>
Dagrun: That's a Lantern. Good.
<<set $EP10_DONE to 1>>
===
`;

const HL = { stage: "hall" };
const SHELF_Z = 8.0;

export const EPISODE_10 = {
  id: "ep10",
  number: 10,
  setup: { ...AFTER_EP9 },
  title: "The Hall of Lanterns",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "keeper", type: "scene", node: "Ep10_Keeper", ...HL,
      rook: { x: 0, z: -7.0, yaw: 0 },
      cast: [
        { id: "keeper", look: "keeper", x: 1.4, z: -5.2, yaw: Math.PI - 0.4 },
        { id: "cal", look: "cal", x: -1.6, z: -5.6, yaw: 0.6 },
        { id: "dagrun", look: "dagrun", x: -2.8, z: -7.6, yaw: 0.4 },
      ] },
    { id: "shelves", type: "explore", ...HL,
      rook: { x: 0, z: -6.4, yaw: 0 },
      objective: "The Hall of Lanterns. The Wardens' shelf, Lio, and your own lantern ({n}/{total}).",
      required: ["ash", "lio", "light"], counts: "required",
      cast: [
        { id: "lio", look: "lio", x: 4.4, z: 0.4, yaw: Math.PI / 2, node: "Ep10_Quill" },
        { id: "bas", look: "bas", x: -3.8, z: 0.6, yaw: -1.2 },
        { id: "dagrun", look: "dagrun", x: -1.4, z: SHELF_Z - 0.8, yaw: 0.6 },
        { id: "cal", look: "cal", x: 1.6, z: SHELF_Z - 1.4, yaw: -0.4 },
      ],
      pickups: [
        { id: "ash", x: -4.6, z: 0, node: "Ep10_Ash", label: "The Iron Wardens' shelf" },
        { id: "light", x: H.lanternX(H.lanterns.indexOf("rook")), z: SHELF_Z, node: "Ep10_Light", label: "Your lantern" },
      ] },
    { id: "snuff", type: "fight", ...HL, wave: ["acolyte", "cantor", "acolyte"], tokens: 2,
      world: { bounds: ZONES.hall.bounds, origin: { x: 0, z: 0 } },
      tutorial: [{ at: 0.5, text: "The Choir, slipping in at closing to snuff the lanterns. Keep them off the shelves." }],
      lines: [["Keeper", "Not the lanterns! Not on my shelves!"], ["Juno", "Singer first. Always singer first."]],
      retry: "Again. Not one goes out." },
    { id: "after", type: "scene", node: "Ep10_After", ...HL,
      rook: { x: 0.4, z: SHELF_Z - 1.0, yaw: Math.PI },
      cast: [
        { id: "dagrun", look: "dagrun", x: -1.2, z: SHELF_Z - 2.4, yaw: 0.4 },
        { id: "keeper", look: "keeper", x: 3.8, z: 3.4, yaw: -1.0 },
      ],
      set: { EP10_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep11",
      lines: [
        "Next time on UNWRITTEN:",
        "Children are going missing under the festival.",
        "And Severin Valcourt, who wants to work alone, doesn't get to.",
      ] },
  ],
};
