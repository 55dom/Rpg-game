// The reaction table (GDD §7.2). One row per reaction; more rows arrive with each new magic.
// `when`: tag already on the target. `with`: a tag the hit applies, or a condition of the hit
// (ability tags such as "burst" and "gust", or the state "airborne").

import { defineReactions } from "../core/tags.js";

export const REACTIONS = defineReactions([
  // Rook's heavy finishers MARK; any spell detonates the mark.
  { id: "Detonate", when: "MARKED", with: "burst", consume: true,
    effect: { damage: 22, posture: 25, hitstop: 8, radius: 2.5 } },
]);
