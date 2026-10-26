// The Paragon, Elias Thorne (GDD cast #12): the kingdom's strongest knight, warm and unknowable, and in Ep 40 he spars
// with Rook in the Lighthouse yard to see what the Palimpsest can do. He doesn't fight to win. He fights to find out.
//
//   P1 (100–50%): Sunthrust (the Sunlance's long thrust, red glint: it can't be blocked), a Sweep round him, and Noon:
//     a column of light falls where you stand (a ring, then the light).
//   P2 (50%): Zenith. Lines of light run out from him in a cross, then turn; stand between them.
//   At 20%, once: Dawnbreak. The whole yard goes white. Nobody walks away from it. (In Ep 40, that's when the page
//     rewinds for the first time: Revision.)
//   It's a spar: at the end he grounds the Sunlance and laughs.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

export const PARAGON_STATS = Object.freeze({
  name: "Paragon Elias Thorne", maxHealth: 2600, maxPosture: 320, runSpeed: 4.6, circleSpeed: 2.6, turnRate: 0.14, radius: 0.48, height: 2.15,
  boss: true, yields: true, bossTitle: "THE PARAGON · ELIAS THORNE", defeatText: "THE PARAGON GROUNDS THE SUNLANCE", phaseMarks: [0.5, 0.2],
});

export const PARAGON_HITBOXES = Object.freeze({
  Blade: { center: [0, 1.1, 1.4], size: [3.2, 1.8, 2.6] },
  Lance: { center: [0, 1.1, 2.4], size: [1.0, 1.4, 4.6] },
});

// Named Slash and Thrust so the spear arm poses (data/isles.js) swing with them.
export const PARAGON_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 14, active: 6, recovery: 22,
    hit: hitSpec({ damage: 15, posture: 22, hitstop: 5, hitstun: 22, knockback: 3 }),
    events: [sound(10, "swingHeavy"), box(14, "Blade", 6)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 24, active: 6, recovery: 26,
    hit: hitSpec({ damage: 20, posture: 28, hitstop: 6, hitstun: 24, knockback: 5, unblockable: true }),
    events: [glint(0), sound(20, "swingHeavy"), { frame: 22, type: E.Move, value: 7 }, box(24, "Lance", 6)] }),
  Noon: defineAbility({ id: "Noon", startup: 20, active: 2, recovery: 28, events: [sound(14, "glint"), custom(18, "noon")] }),
});

export const PARAGON_TUNING = Object.freeze({
  noonDelay: 54, noonR: 1.8,
  noon: hitSpec({ damage: 16, posture: 20, hitstop: 4, hitstun: 26, knockback: 2, unblockable: true }),
  zenithEvery: 300, zenithArm: 11, zenithStep: 1.6, zenithDelay: 40, zenithR: 1.1, // P2: a cross of light, then the cross turned 45°
  dawnAt: 0.2, dawnWarn: 110, dawnR: 30,
  dawn: hitSpec({ damage: 9999, posture: 999, hitstop: 8, hitstun: 60, knockback: 6, unblockable: true }),
});

export const paragonOptions = (phase) => {
  const A = PARAGON_ABILITIES;
  return [
    new AttackOption(A.Slash, 0, 3.0, 3, 45),
    new AttackOption(A.Thrust, 2.4, 8, 2, phase >= 2 ? 120 : 160),
    new AttackOption(A.Noon, 3, 14, 2, 220),
  ];
};

export const PARAGON_PHASES = Object.freeze([{ phase: 1, above: 0.5 }, { phase: 2, above: 0 }]);
/** What his light is called when it lands (the controller fires it). */
export const SUNLIGHT = defineAbility({ id: "Sunlight", startup: 1, active: 1, recovery: 1, hit: PARAGON_TUNING.noon, events: [] });
export const DAWNBREAK = defineAbility({ id: "Dawnbreak", startup: 1, active: 1, recovery: 1, hit: PARAGON_TUNING.dawn, events: [] });
