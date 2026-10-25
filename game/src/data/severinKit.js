// Severin as a playable partner (GDD §10: tag-swap for Rook and Severin; Cal after the reveal).
// His kit is Rook's frame data and combo routes with a rapier: narrow, long thrusts instead of cuts,
// a lunging finisher, a riposte launcher, and Star Needles (a fan of three) as his spell.
// No ultimate yet (his Polaris ultimate is a later chapter).

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { parseMask } from "../core/input.js";
import { ROOK_ABILITIES as R, ROOK_POSES, ROOK_STATS, ROOK_HITBOXES } from "./rook.js";
import { SEVERIN_HITBOXES } from "./severin.js";

/** A Rook move re-cut for a rapier: same timing and cancels, its Blade box swapped for the Rapier. */
function rapier(base, id, o = {}) {
  return defineAbility({
    id, animation: id, startup: base.startup, active: base.active, recovery: base.recovery, cancels: base.cancels,
    manaCost: base.manaCost, tags: base.tags,
    events: (o.events ?? base.events).map((e) => (e.type === E.SpawnHitbox && e.key === "Blade" ? { ...e, key: "Rapier" } : e)),
    hit: o.hit ?? base.hit,
  });
}

const thrust = hitSpec({ damage: 11, posture: 9, hitstop: 3, hitstun: 15, knockback: 0.8 });

export const SEVERIN_KIT = Object.freeze({
  ...R,
  L1: rapier(R.L1, "Thrust1", { hit: thrust }),
  L2: rapier(R.L2, "Thrust2", { hit: thrust }),
  L3: rapier(R.L3, "Flurry3", { hit: hitSpec({ damage: 6, posture: 6, hitstop: 2, hitstun: 16, knockback: 0.4 }),
    events: [{ frame: 6, type: E.PlaySound, key: "swing" }, { frame: 8, type: E.SpawnHitbox, key: "Rapier", value: 1 },
      { frame: 9, type: E.SpawnHitbox, key: "Rapier", value: 1 }, { frame: 10, type: E.SpawnHitbox, key: "Rapier", value: 1 }] }),
  L4: rapier(R.L4, "Lunge4", { hit: hitSpec({ damage: 26, posture: 30, hitstop: 9, hitstun: 30, knockback: 6, applyTags: [["MARKED", 240]] }),
    events: [{ frame: 6, type: E.PlaySound, key: "dodge" }, { frame: 10, type: E.Move, value: 3.4 }, { frame: 10, type: E.SpawnHitbox, key: "Rapier", value: 4 },
      { frame: 10, type: E.CameraCue, key: "punch" }] }),
  Launcher: rapier(R.Launcher, "Riposte"),
  DashStrike: rapier(R.DashStrike, "Fleche", { events: [{ frame: 4, type: E.PlaySound, key: "dodge" }, { frame: 6, type: E.Move, value: 3.2 }, { frame: 6, type: E.SpawnHitbox, key: "Rapier", value: 4 }] }),
  AirL1: rapier(R.AirL1, "AirThrust1"), AirL2: rapier(R.AirL2, "AirThrust2"), AirL3: rapier(R.AirL3, "AirThrust3"),
  Counter: rapier(R.Counter, "ParryRiposte"),
  // Star Needles: a fan of three needles of starlight.
  StarFan: defineAbility({ id: "StarFan", startup: 12, active: 2, recovery: 18, manaCost: 15, tags: ["burst"],
    events: [{ frame: 0, type: E.SpawnVfx, key: "starcharge" }, { frame: 10, type: E.PlaySound, key: "glint" }, { frame: 12, type: E.Custom, key: "fan", value: 3 }],
    cancels: [{ from: 14, to: 31, into: parseMask("Light|Heavy|Jump|Dodge") }] }),
});

export const SEVERIN_KIT_STATS = Object.freeze({ ...ROOK_STATS, name: "Severin", maxHealth: 200, maxMana: 90, manaRegenPerSecond: 7.5, runSpeed: 7.0 });
export const SEVERIN_KIT_HITBOXES = Object.freeze({ ...ROOK_HITBOXES, Rapier: SEVERIN_HITBOXES.Rapier,
  Needle: { ...SEVERIN_HITBOXES.Needle, hit: hitSpec({ damage: 9, posture: 10, hitstop: 3, hitstun: 16, knockback: 1 }) } });
export const SEVERIN_KIT_LOADOUT = Object.freeze({ Spell1: SEVERIN_KIT.StarFan, Spell2: null, Spell3: null, Spell4: null });
/** What his spell buttons show. */
export const SEVERIN_KIT_SPELLS = Object.freeze({ Spell1: "STAR FAN" });

const thrustPose = { from: [0.35, 0.05, 0], to: [-0.1, 0, 0], lean: 0.3 };
export const SEVERIN_KIT_POSES = Object.freeze({
  ...ROOK_POSES,
  rest: [0.55, 0.35, 0],
  Thrust1: thrustPose, Thrust2: { ...thrustPose, from: [0.3, -0.2, 0] }, Flurry3: { from: [0.2, -0.3, 0], to: [-0.05, 0.3, 0], lean: 0.25 },
  Lunge4: { from: [0.3, 0.1, 0], to: [-0.05, 0, 0], lean: 0.55 }, Riposte: { from: [1.2, 0.2, 0], to: [-1.6, 0.1, 0], lean: -0.15 },
  Fleche: { from: [0.3, 0.1, 0], to: [-0.05, 0, 0], lean: 0.5 }, AirThrust1: thrustPose, AirThrust2: thrustPose, AirThrust3: thrustPose,
  ParryRiposte: thrustPose, StarFan: { from: [-1.2, 0.3, 0], to: [-0.2, 0.2, 0], lean: -0.15 },
});
