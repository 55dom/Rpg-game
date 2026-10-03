// Rook, the Lantern Knight squire. Every number a designer would tune lives here.
// Frames are 60 Hz logic frames. Poses are shoulder rotations [pitch, yaw, roll] in radians:
// +pitch tips the blade down, +yaw swings it to Rook's right.

import { Intent, parseMask } from "../core/input.js";
import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E, ComboGraph, MoveContext as C } from "../core/abilities.js";

export const ROOK_STATS = Object.freeze({
  maxHealth: 220, maxPosture: 100, maxMana: 100, manaRegenPerSecond: 6,
  runSpeed: 6.5, turnRate: 0.35, radius: 0.45, height: 1.9,
  counterWindowFrames: 45, // after a parry or a perfect dodge
  afterimageCooldownFrames: 180,
});

export const ROOK_HITBOXES = Object.freeze({
  Blade: { center: [0, 1, 1.1], size: [2.2, 1.6, 2.0] },
  Wide: { center: [0, 1, 1.2], size: [3.2, 1.9, 2.6] },
  Cutter: { center: [0, 1, 2.6], size: [1.2, 1.4, 5.0] },
  Slam: { center: [0, 0.5, 0.8], size: [3.0, 1.4, 3.0] },
});

const m = parseMask;
const blade = (frame, frames) => ({ frame, type: E.SpawnHitbox, key: "Blade", value: frames });
const swing = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const step = (frame, distance) => ({ frame, type: E.Move, value: distance }); // spread over the active frames

export const ROOK_POSES = Object.freeze({
  rest: [0.55, 0.5, 0],
  L1: { from: [0.2, 1.7, 0], to: [0.35, -1.5, 0] },
  L2: { from: [0.15, -1.6, 0], to: [0.3, 1.6, 0] },
  L3: { from: [-1.0, 1.3, 0], to: [0.9, -1.1, 0] },
  L4: { from: [-2.3, 0.15, 0], to: [1.2, 0, 0], lean: 0.35 },
  Launcher: { from: [1.3, 0.4, 0], to: [-1.9, 0.1, 0], lean: -0.2 },
  AirL1: { from: [0.1, 1.6, 0], to: [0.3, -1.4, 0] },
  AirL2: { from: [0.1, -1.5, 0], to: [0.3, 1.5, 0] },
  AirL3: { from: [-1.1, 1.0, 0], to: [1.0, -0.9, 0] },
  AirSlam: { from: [-2.5, 0, 0], to: [1.3, 0, 0], lean: 0.5 },
  DashStrike: { from: [0.2, 1.4, 0], to: [0.3, -1.6, 0], lean: 0.4 },
  Dodge: { from: [0.8, 0.9, 0], to: [0.8, 0.9, 0], lean: 0.5 },
  Jump: { from: [0.4, 0.7, 0], to: [0.4, 0.7, 0], lean: -0.1 },
  GaleCutter: { from: [-1.5, -0.7, 0], to: [1.0, 0.5, 0], grimoire: true },
  Guard: { from: [-0.3, -0.95, 0.9], to: [-0.3, -0.95, 0.9], lean: -0.1 },
  Counter: { from: [0.2, 1.9, 0], to: [0.3, -1.9, 0], lean: 0.45 },
  LanternBreak: { from: [-2.7, 0, 0], to: [1.4, 0, 0], lean: 0.55, grimoire: true },
});

const followUps = m("Light|Heavy|Jump|Dodge|AnySpell");

export const ROOK_ABILITIES = (() => {
  const a = {};
  const add = (o) => { a[o.id] = defineAbility(o); };
  const light = hitSpec({ damage: 12, posture: 10, hitstop: 3, hitstun: 16, knockback: 1 });

  add({ id: "L1", startup: 7, active: 3, recovery: 14, hit: light,
    events: [swing(5), step(5, 0.6), blade(7, 3)], cancels: [{ from: 10, to: 23, into: followUps }] });
  add({ id: "L2", startup: 7, active: 3, recovery: 15, hit: light,
    events: [swing(5), step(5, 0.6), blade(7, 3)], cancels: [{ from: 10, to: 24, into: followUps }] });
  add({ id: "L3", startup: 8, active: 3, recovery: 16,
    hit: hitSpec({ damage: 14, posture: 14, hitstop: 4, hitstun: 18, knockback: 1.5 }),
    events: [swing(6), step(6, 0.7), blade(8, 3)], cancels: [{ from: 11, to: 26, into: followUps }] });
  add({ id: "L4", startup: 10, active: 4, recovery: 22,
    hit: hitSpec({ damage: 24, posture: 30, hitstop: 10, hitstun: 30, knockback: 6 }),
    events: [swing(7, "swingHeavy"), { frame: 10, type: E.Move, value: 1.2 }, blade(10, 4), { frame: 10, type: E.CameraCue, key: "punch" }],
    cancels: [{ from: 20, to: 35, into: m("Dodge|AnySpell") }] });
  add({ id: "Launcher", startup: 9, active: 3, recovery: 18,
    hit: hitSpec({ damage: 14, posture: 15, hitstop: 6, hitstun: 24, launch: 11 }),
    events: [swing(7, "swingHeavy"), step(6, 0.5), blade(9, 3)],
    cancels: [{ from: 12, to: 29, into: m("Jump"), requiresHit: true }, { from: 12, to: 29, into: m("Dodge") }] });
  add({ id: "Jump", startup: 0, active: 4, recovery: 2,
    events: [{ frame: 0, type: E.Custom, key: "jump", value: 10 }, swing(0, "jump")],
    cancels: [{ from: 2, to: 5, into: m("Light|Heavy|Dodge|AnySpell|Jump") }] });

  const airHit = hitSpec({ damage: 10, posture: 8, hitstop: 3, hitstun: 16, launch: 3 });
  const airCancels = [{ from: 8, to: 19, into: followUps }];
  add({ id: "AirL1", startup: 5, active: 3, recovery: 12, hit: airHit, events: [swing(3), blade(5, 3)], cancels: airCancels });
  add({ id: "AirL2", startup: 5, active: 3, recovery: 12, hit: airHit, events: [swing(3), blade(5, 3)], cancels: airCancels });
  add({ id: "AirL3", startup: 6, active: 3, recovery: 14,
    hit: hitSpec({ damage: 12, posture: 10, hitstop: 4, hitstun: 18, launch: 3 }),
    events: [swing(4), blade(6, 3)], cancels: [{ from: 9, to: 22, into: m("Heavy|Dodge|AnySpell") }] });
  add({ id: "AirSlam", startup: 8, active: 8, recovery: 18,
    hit: hitSpec({ damage: 20, posture: 25, hitstop: 8, hitstun: 30, knockback: 3 }),
    events: [swing(6, "swingHeavy"), { frame: 8, type: E.Custom, key: "slam", value: 30 },
      { frame: 8, type: E.SpawnHitbox, key: "Slam", value: 8 }, { frame: 12, type: E.CameraCue, key: "punch" }] });
  add({ id: "DashStrike", startup: 6, active: 4, recovery: 16,
    hit: hitSpec({ damage: 14, posture: 12, hitstop: 4, hitstun: 18, knockback: 3 }),
    events: [swing(4), { frame: 6, type: E.Move, value: 2 }, blade(6, 4)],
    cancels: [{ from: 10, to: 25, into: followUps }] });
  add({ id: "Dodge", startup: 0, active: 12, recovery: 18,
    events: [{ frame: 0, type: E.Invulnerable, value: 12 }, { frame: 0, type: E.Move, value: 4.2 }, swing(0, "dodge")],
    cancels: [{ from: 14, to: 29, into: m("Light|Heavy|Jump|AnySpell") }] });
  add({ id: "GaleCutter", startup: 10, active: 6, recovery: 18, manaCost: 15,
    hit: hitSpec({ damage: 16, posture: 20, hitstop: 6, hitstun: 24, launch: 11 }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "grimoire" }, swing(8, "gale"), { frame: 10, type: E.SpawnVfx, key: "gale" },
      { frame: 10, type: E.SpawnHitbox, key: "Cutter", value: 6 }],
    cancels: [{ from: 16, to: 33, into: m("Jump"), requiresHit: true }, { from: 16, to: 33, into: m("Dodge") }] });

  // Step 3: the defensive game and its rewards.
  add({ id: "Guard", startup: 0, active: 8, recovery: 12,
    events: [{ frame: 0, type: E.Custom, key: "parry", value: 8 }],
    cancels: [{ from: 8, to: 19, into: m("Light|Heavy|Dodge|Jump|AnySpell") }] });
  add({ id: "Counter", startup: 4, active: 4, recovery: 16, tags: ["counter"],
    hit: hitSpec({ damage: 30, posture: 35, hitstop: 10, hitstun: 30, knockback: 4 }),
    events: [{ frame: 0, type: E.Invulnerable, value: 8 }, { frame: 0, type: E.Move, key: "toTarget", value: 6 }, swing(2, "swingHeavy"),
      { frame: 4, type: E.SpawnHitbox, key: "Wide", value: 4 }, { frame: 4, type: E.CameraCue, key: "punch" }],
    cancels: [{ from: 8, to: 23, into: followUps }] });
  add({ id: "LanternBreak", startup: 14, active: 4, recovery: 30, tags: ["finisher"],
    hit: hitSpec({ damage: 70, posture: 0, hitstop: 18, hitstun: 40, knockback: 9, launch: 7 }),
    events: [{ frame: 0, type: E.Invulnerable, value: 20 }, { frame: 0, type: E.SpawnVfx, key: "charge" }, swing(0, "charge"),
      { frame: 10, type: E.Move, key: "toTarget", value: 3 }, { frame: 14, type: E.SpawnHitbox, key: "Wide", value: 4 },
      { frame: 14, type: E.CameraCue, key: "finisher" }],
    cancels: [{ from: 30, to: 47, into: m("Dodge|Jump|AnySpell") }] });
  return Object.freeze(a);
})();

/** Rook's combo graph. Order matters inside each list: first match wins. */
export function buildRookGraph(contextProvider, A = ROOK_ABILITIES) {
  const g = new ComboGraph(contextProvider);
  // Finisher outranks every combo route once the target's posture is broken.
  g.addPriority(Intent.Heavy, A.LanternBreak, C.Grounded | C.TargetStaggered);
  g.addEntry(Intent.Light, A.Counter, C.AfterParry)
    .addEntry(Intent.Light, A.DashStrike, C.Grounded | C.AfterDash)
    .addEntry(Intent.Light, A.L1, C.Grounded)
    .addEntry(Intent.Light, A.AirL1, C.Airborne)
    .addEntry(Intent.Heavy, A.AirSlam, C.Airborne)
    .addEntry(Intent.Heavy, A.Launcher, C.Grounded)
    .addEntry(Intent.Jump, A.Jump)
    .addEntry(Intent.Dodge, A.Dodge)
    .addEntry(Intent.Block, A.Guard, C.Grounded)
    .addEntry(Intent.Spell1, A.GaleCutter);
  g.addEdge(A.L1, Intent.Light, A.L2).addEdge(A.L2, Intent.Light, A.L3).addEdge(A.L3, Intent.Light, A.L4)
    .addEdge(A.L2, Intent.Heavy, A.Launcher)
    .addEdge(A.AirL1, Intent.Light, A.AirL2).addEdge(A.AirL2, Intent.Light, A.AirL3)
    .addEdge(A.AirL1, Intent.Heavy, A.AirSlam).addEdge(A.AirL2, Intent.Heavy, A.AirSlam).addEdge(A.AirL3, Intent.Heavy, A.AirSlam);
  g.addGlobal(Intent.Light, A.Counter, C.AfterParry)
    .addGlobal(Intent.Dodge, A.Dodge)
    .addGlobal(Intent.Spell1, A.GaleCutter)
    .addGlobal(Intent.Jump, A.Jump)
    .addGlobal(Intent.Light, A.DashStrike, C.Grounded | C.AfterDash)
    .addGlobal(Intent.Light, A.AirL1, C.Airborne)
    .addGlobal(Intent.Heavy, A.AirSlam, C.Airborne);
  return g;
}
