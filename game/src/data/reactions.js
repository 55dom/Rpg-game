// The reaction table (GDD §7.2). One row per reaction; more rows arrive with each new magic.
// `when`: tag already on the target. `with`: a tag the hit applies, or a condition of the hit
// (ability tags such as "burst", "gust", "heavy", or the state "airborne"). `name` is what players see.

import { defineReactions } from "../core/tags.js";

export const REACTIONS = defineReactions([
  // Rook's heavy finishers MARK; any spell detonates the mark.
  { id: "Detonate", when: "MARKED", with: "burst", consume: true,
    effect: { damage: 22, posture: 25, hitstop: 8, radius: 2.5 } },
  // Thread + Stone: a line strung to a pillar anchor goes taut (GDD §7.3). Either order works.
  { id: "TautLine", name: "Taut Line", when: "ANCHORED", with: "BOUND", consume: true,
    effect: { damage: 12, posture: 45, stagger: 120, hitstop: 8 } },
  { id: "TautLineB", name: "Taut Line", when: "BOUND", with: "ANCHORED", consume: true,
    effect: { damage: 12, posture: 45, stagger: 120, hitstop: 8 } },
  // Wind + Thread: a gust hits a bound target and the thread flings it skyward.
  { id: "Slingshot", name: "Slingshot", when: "BOUND", with: "gust", consume: true,
    effect: { damage: 18, launch: 12, hitstop: 6 } },
  // Heavy blow on an anchored target: the pillar shatters, spraying stone.
  { id: "Shatterstone", name: "Shatterstone", when: "ANCHORED", with: "heavy", consume: true,
    effect: { damage: 20, posture: 20, radius: 3, launch: 6, hitstop: 8 } },
]);
