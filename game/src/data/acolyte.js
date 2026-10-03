// Choir Acolyte: the first enemy. A readable fast slash and a telegraphed unblockable thrust.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

export const ACOLYTE_STATS = Object.freeze({
  maxHealth: 120, maxPosture: 60, runSpeed: 4, circleSpeed: 2.2, turnRate: 0.12, radius: 0.45, height: 1.9,
});

export const ACOLYTE_HITBOXES = Object.freeze({
  Blade: { center: [0, 1, 1.0], size: [2.0, 1.6, 1.8] },
  Lunge: { center: [0, 1, 1.6], size: [1.0, 1.4, 3.0] },
});

export const ACOLYTE_POSES = Object.freeze({
  rest: [0.7, 0.35, 0],
  Slash: { from: [-0.6, 1.8, 0], to: [0.5, -1.4, 0] },
  Thrust: { from: [0.2, 0.9, 0], to: [0.1, 0.05, 0], lean: 0.45 },
});

export const ACOLYTE_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 14, active: 4, recovery: 22,
    hit: hitSpec({ damage: 14, posture: 20, hitstop: 4, hitstun: 20, knockback: 2 }),
    events: [{ frame: 10, type: E.PlaySound, key: "swing" }, { frame: 14, type: E.SpawnHitbox, key: "Blade", value: 4 }] }),
  Thrust: defineAbility({ id: "Thrust", startup: 24, active: 5, recovery: 30,
    hit: hitSpec({ damage: 22, posture: 30, hitstop: 6, hitstun: 24, knockback: 4, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, { frame: 22, type: E.Move, value: 2.5 },
      { frame: 22, type: E.PlaySound, key: "swingHeavy" }, { frame: 24, type: E.SpawnHitbox, key: "Lunge", value: 5 }] }),
});

export const acolyteOptions = () => [
  new AttackOption(ACOLYTE_ABILITIES.Slash, 0, 2.4, 3, 40),
  new AttackOption(ACOLYTE_ABILITIES.Thrust, 2.5, 5, 1, 150),
];
