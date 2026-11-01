// The reaction table (GDD §7.2). One row per reaction, authored once: any magic that puts the tag on
// (or brings the condition) can use it. `when`: tag already on the target. `with`: a tag the hit (or
// the world: burning reeds, a fallen arc-lamp) puts on, or a condition of the hit or the target:
//   ability tags  "burst", "gust", "heavy", "resonance"   ·   "hit" every hit   ·   "spark" a hit that burns or charges
//   the target    "airborne" off the ground   ·   "glass" a reflection, a twin holding the glass, or anything FROZEN
//                 "armor" a tower shield, a heavy body
// `name` is what players see. `foes`: only on the player's enemies (Meteor and Crush are combos for you,
// not traps for you). The §7.2 names map onto this game's tags: BURNING is SCORCHED, the ASH cloud is ASH.
//
// Who brings what (Phase 11 Step 2):
//   WET       Gullmaw always; its flood jet and belly-flop splash soak whoever they hit (Ep 12)
//   CHARGED   Varka's Storm (Ep 22); an arc-lamp knocked into Gullmaw's cistern charges the water round it
//   SCORCHED  burning reeds (Ep 4, either side), Varka's wreckage
//   ROOTED    Hask, down in a reed bed (Ep 4)
//   WEIGHTED  Hask's mud (on you, and its own hounds: the mud doesn't care whose feet), Gullmaw's bile
//   BOUND     Juno's Snare Line, the Bell's seals · ANCHORED Bas's pillars · MARKED Rook's finishers
//   RESONANT  Tamsin's sung notes (Ep 15)
// Nobody in any party or fight brings CHILLED, ASH, POLARIZED, DROWSY or ROTTING yet: those rows wait in the
// table for the magic that will (the §7–§12 check names them, test/phase11-step5.test.js).

import { defineReactions } from "../core/tags.js";

export const REACTIONS = defineReactions([
  // ---- §7.2's twelve -----------------------------------------------------------------------------------
  // WET + CHARGED: lightning chains to every WET target in reach, whoever's side it's on.
  { id: "Conduction", when: "WET", with: "CHARGED", consume: true,
    effect: { damage: 14, posture: 22, stagger: 45, chain: "WET", radius: 7, hitstop: 6 } },
  // WET + CHILLED: frozen solid; the next heavy blow shatters it.
  { id: "FlashFreeze", name: "Flash Freeze", when: "WET", with: "CHILLED", consume: true,
    effect: { stagger: 150, tag: ["FROZEN", 150], hitstop: 8 } },
  { id: "Shatter", when: "FROZEN", with: "heavy", consume: true,
    effect: { damage: 30, posture: 40, hitstop: 10 } },
  // BURNING + a gust: the fire runs on down the wind.
  { id: "Firestorm", when: "SCORCHED", with: "gust", consume: false,
    effect: { damage: 12, posture: 10, spread: { length: 7, width: 2.4, frames: 240 }, hitstop: 6 } },
  // BURNING + ROOTED: it burns down to the root and out of it.
  { id: "Wildfire", when: "ROOTED", with: "SCORCHED", consume: true,
    effect: { damage: 20, posture: 25, burn: 480, hitstop: 8 } },
  // An ASH cloud + any spark: it goes up.
  { id: "Flashpoint", when: "ASH", with: "spark", consume: true,
    effect: { damage: 24, posture: 20, radius: 3.5, launch: 6, hitstop: 8 } },
  // WEIGHTED + airborne: it comes down like a stone and the ground jumps under the rest.
  { id: "Meteor", when: "WEIGHTED", with: "airborne", consume: true, foes: true,
    effect: { damage: 16, posture: 24, slam: 22, radius: 3, hitstop: 8 } },
  // WEIGHTED + BOUND (either order): crushed flat, guard and all.
  { id: "Crush", when: "WEIGHTED", with: "BOUND", consume: true, foes: true,
    effect: { damage: 10, breakPosture: true, hitstop: 8 } },
  { id: "CrushB", name: "Crush", when: "BOUND", with: "WEIGHTED", consume: true, foes: true,
    effect: { damage: 10, breakPosture: true, hitstop: 8 } },
  // CHARGED + POLARIZED: fired down the magnet line.
  { id: "Railgun", when: "CHARGED", with: "POLARIZED", consume: true,
    effect: { damage: 26, posture: 30, fling: 16, hitstop: 10 } },
  // RESONANT + glass (or crystal, or ice): it shatters, and the shards fly.
  { id: "ShatterChorus", name: "Shatter Chorus", when: "RESONANT", with: "glass", consume: true,
    effect: { damage: 18, posture: 30, radius: 4, hitstop: 7 } },
  // MARKED + any burst: Rook's heavy finishers MARK; any spell detonates the mark.
  { id: "Detonate", when: "MARKED", with: "burst", consume: true,
    effect: { damage: 22, posture: 25, hitstop: 8, radius: 2.5 } },
  // DROWSY + any hit: a guaranteed crit, and awake.
  { id: "RudeAwakening", name: "Rude Awakening", when: "DROWSY", with: "hit", consume: true,
    effect: { damage: 20, posture: 15, hitstop: 8 } },
  // ROTTING + armour: the armour goes soft, for the rest of the fight.
  { id: "Corrode", when: "ROTTING", with: "armor", consume: true,
    effect: { corrode: 0.15, posture: 10, hitstop: 4 } },

  // ---- This game's own (the squad's magic) --------------------------------------------------------------
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
  // Wind scatters a Cantor's hymn: the ward breaks and the singer's flock reels.
  { id: "Dispel", name: "Dispel", when: "WARDED", with: "gust", consume: true,
    effect: { posture: 20, stagger: 30, hitstop: 5 } },
]);

/** §7.2's twelve, by the id of their first row (the table also holds this game's own). */
export const SECTION_7_2 = Object.freeze(["Conduction", "FlashFreeze", "Firestorm", "Wildfire", "Flashpoint", "Meteor", "Crush", "Railgun", "ShatterChorus", "Detonate", "RudeAwakening", "Corrode"]);
