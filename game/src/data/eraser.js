// B13 · The Eraser (Ep 37). In the Hollow, the thing that keeps it blank: tall, faceless, made of paper with nothing
// written on it, and long arms that rub out whatever they touch. It stands between the Lanterns and Elodie.
//
//   P1 (100–60%): Swipe (both arms, close), Reach (one long arm, red glint: it can't be blocked), and Blank: a pale
//     ring in front of it. Caught in the ring when it lands, and your mana and your Surge are rubbed out.
//   P2 (60%): Unwrite. The floor goes blank in patches under you: step off a pale patch before it opens, or you drop
//     through it and fall out of the white sky.
//   P3 (30%): Erasure. A wall of blank rolls out from it every few seconds: jump it. The patches keep coming.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

export const ERASER_STATS = Object.freeze({
  name: "The Eraser", maxHealth: 2400, maxPosture: 300, runSpeed: 3.4, circleSpeed: 1.8, turnRate: 0.09, radius: 0.8, height: 3.4,
  boss: true, bossTitle: "BOSS 13 · THE ERASER", defeatText: "THE ERASER COMES APART INTO BLANK PAGES", phaseMarks: [0.6, 0.3],
});

export const ERASER_HITBOXES = Object.freeze({
  Swipe: { center: [0, 1.2, 1.6], size: [4.0, 2.2, 2.6] },
  Reach: { center: [0, 1.3, 2.8], size: [1.2, 1.4, 4.6] },
});

export const ERASER_POSES = Object.freeze({
  rest: [0.5, 0.5, 0],
  Swipe: { from: [-0.6, 1.9, 0], to: [0.6, -1.9, 0], lean: 0.25 },
  Reach: { from: [-0.2, 0.4, 0], to: [-1.5, 0, 0], lean: 0.5 },
  Blank: { from: [-2.6, 0.5, 0], to: [-0.6, 0.2, 0], lean: -0.2 },
});

export const ERASER_TUNING = Object.freeze({
  blankAhead: 2.4, blankR: 2.3, blankDelay: 30,          // the Blank's ring: how far in front, how wide, how long it shows
  holeEvery: 230, holes: 2, holeR: 1.5, holeDelay: 54, dropHeight: 7, // P2: blank patches under you
  hole: hitSpec({ damage: 10, posture: 10, hitstop: 4, hitstun: 44, knockback: 0, unblockable: true }),
  erasureEvery: 360, erasure: { speed: 6.5, maxR: 13, width: 0.9 },   // P3: the wall of blank
  erasureHit: hitSpec({ damage: 14, posture: 20, hitstop: 4, hitstun: 26, knockback: 6, unblockable: true }),
});

export const ERASER_ABILITIES = Object.freeze({
  Swipe: defineAbility({ id: "Swipe", startup: 18, active: 6, recovery: 24,
    hit: hitSpec({ damage: 16, posture: 22, hitstop: 5, hitstun: 22, knockback: 4 }),
    events: [sound(14, "swingHeavy"), box(18, "Swipe", 6)] }),
  Reach: defineAbility({ id: "Reach", startup: 26, active: 5, recovery: 28,
    hit: hitSpec({ damage: 20, posture: 26, hitstop: 6, hitstun: 24, knockback: 5, unblockable: true }),
    events: [glint(0), sound(22, "swingHeavy"), box(26, "Reach", 5)] }),
  Blank: defineAbility({ id: "Blank", startup: 24, active: 2, recovery: 30,
    events: [sound(18, "vacuum"), custom(20, "blank")] }),
});

export const eraserOptions = (phase) => {
  const A = ERASER_ABILITIES;
  return [
    new AttackOption(A.Swipe, 0, 3.4, 3, 50),
    new AttackOption(A.Reach, 2.2, 5.2, 2, 140),
    new AttackOption(A.Blank, 0, 5, 2, phase >= 2 ? 220 : 280),
  ];
};

export const ERASER_PHASES = Object.freeze([{ phase: 1, above: 0.6 }, { phase: 2, above: 0.3 }, { phase: 3, above: 0 }]);
/** What the blank patches and the wall of blank are called when they land (the controller fires them). */
export const UNWRITE = defineAbility({ id: "Unwrite", startup: 1, active: 1, recovery: 1, hit: ERASER_TUNING.hole, events: [] });
export const ERASURE = defineAbility({ id: "Erasure", startup: 1, active: 1, recovery: 1, hit: ERASER_TUNING.erasureHit, events: [] });
