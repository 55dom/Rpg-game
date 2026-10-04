// Rook, the Lantern Knight squire. Every number a designer would tune lives here.
// Frames are 60 Hz logic frames. Poses are shoulder rotations [pitch, yaw, roll] in radians:
// +pitch tips the blade down, +yaw swings it to Rook's right.

import { Intent, parseMask } from "../core/input.js";
import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E, ComboGraph, MoveContext as C } from "../core/abilities.js";

export const ROOK_STATS = Object.freeze({
  maxHealth: 220, maxPosture: 100, maxMana: 100, manaRegenPerSecond: 6,
  runSpeed: 6.5, turnRate: 0.35, radius: 0.45, height: 1.9,
  maxSurge: 100,
  surgeGain: { dealt: 0.35, taken: 0.5, parry: 12, perfectDodge: 12, reaction: 8 }, // per damage point / per event
  counterWindowFrames: 45, // after a parry or a perfect dodge
  afterimageCooldownFrames: 180,
});

export const ROOK_HITBOXES = Object.freeze({
  Blade: { center: [0, 1, 1.1], size: [2.2, 1.6, 2.0] },
  Wide: { center: [0, 1, 1.2], size: [3.2, 1.9, 2.6] },
  Cutter: { center: [0, 1, 2.6], size: [1.2, 1.4, 5.0] },
  Slam: { center: [0, 0.5, 0.8], size: [3.0, 1.4, 3.0] },
  Vortex: { center: [0, 1, 3.2], size: [5.0, 3.0, 5.4] },
  Ring: { center: [0, 1, 0], size: [4.4, 2.0, 4.4] },
  // Skyrender: each hitbox carries its own hit, so one ultimate can launch, juggle, and finish.
  SkyRing: { center: [0, 1, 0], size: [18, 3, 18],
    hit: hitSpec({ damage: 12, posture: 20, hitstop: 6, hitstun: 60, launch: 14 }) },
  SkyCut: { center: [0, 0, 0], size: [9, 7, 9],
    hit: hitSpec({ damage: 6, posture: 6, hitstop: 2, hitstun: 40, pull: 4 }) },
  SkyFinal: { center: [0, -1.5, 0], size: [11, 7, 11],
    hit: hitSpec({ damage: 40, posture: 40, hitstop: 18, hitstun: 50, knockback: 4, applyTags: [["MARKED", 300]] }) },
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
  AirJump: { from: [0.3, 0.8, 0], to: [0.3, 0.8, 0], lean: -0.3, spin: -1 },
  AirDash: { from: [0.9, 1.0, 0], to: [0.9, 1.0, 0], lean: 0.7 },
  TempestEdge: { from: [0.1, 1.7, 0], to: [0.3, 1.7, 0], lean: 0.2, spin: 3 },
  VacuumPull: { from: [-0.4, 0.2, 0], to: [0.2, -0.6, 0.6], lean: -0.15, grimoire: true },
  GaleCutter: { from: [-1.5, -0.7, 0], to: [1.0, 0.5, 0], grimoire: true },
  Guard: { from: [-0.3, -0.95, 0.9], to: [-0.3, -0.95, 0.9], lean: -0.1 },
  Counter: { from: [0.2, 1.9, 0], to: [0.3, -1.9, 0], lean: 0.45 },
  LanternBreak: { from: [-2.7, 0, 0], to: [1.4, 0, 0], lean: 0.55, grimoire: true },
  Skyrender: { from: [-2.4, 0.3, 0], to: [1.3, -0.2, 0], lean: 0.4, spin: 6, grimoire: true },
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
    hit: hitSpec({ damage: 24, posture: 30, hitstop: 10, hitstun: 30, knockback: 6, applyTags: [["MARKED", 240]] }),
    events: [swing(7, "swingHeavy"), { frame: 10, type: E.Move, value: 1.2 }, blade(10, 4), { frame: 10, type: E.CameraCue, key: "punch" }],
    cancels: [{ from: 20, to: 35, into: m("Dodge|AnySpell") }] });
  add({ id: "Launcher", startup: 9, active: 3, recovery: 18,
    hit: hitSpec({ damage: 14, posture: 15, hitstop: 6, hitstun: 24, launch: 11, applyTags: [["MARKED", 240]] }),
    events: [swing(7, "swingHeavy"), step(6, 0.5), blade(9, 3)],
    cancels: [{ from: 12, to: 29, into: m("Jump"), requiresHit: true }, { from: 12, to: 29, into: m("Dodge") }] });
  add({ id: "Jump", startup: 0, active: 4, recovery: 2,
    events: [{ frame: 0, type: E.Custom, key: "jump", value: 10 }, swing(0, "jump")],
    cancels: [{ from: 2, to: 5, into: m("Light|Heavy|Dodge|AnySpell|Jump") }] });
  // Step 4: one air jump and one air dash per airtime (refreshed on landing).
  add({ id: "AirJump", startup: 0, active: 4, recovery: 4,
    events: [{ frame: 0, type: E.Custom, key: "airJump", value: 9 }, swing(0, "jump")],
    cancels: [{ from: 3, to: 7, into: m("Light|Heavy|Dodge|AnySpell") }] });
  add({ id: "AirDash", startup: 0, active: 9, recovery: 10,
    events: [{ frame: 0, type: E.Custom, key: "airDash", value: 19 }, { frame: 0, type: E.Move, key: "toTarget", value: 4.5 },
      { frame: 0, type: E.Invulnerable, value: 6 }, swing(0, "dodge")],
    cancels: [{ from: 6, to: 18, into: m("Light|Heavy|Jump|AnySpell") }] });

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
  add({ id: "GaleCutter", startup: 10, active: 6, recovery: 18, manaCost: 15, tags: ["burst", "gust"],
    hit: hitSpec({ damage: 16, posture: 20, hitstop: 6, hitstun: 24, launch: 11 }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "grimoire" }, swing(8, "gale"), { frame: 10, type: E.SpawnVfx, key: "gale" },
      { frame: 10, type: E.SpawnHitbox, key: "Cutter", value: 6 }],
    cancels: [{ from: 16, to: 33, into: m("Jump"), requiresHit: true }, { from: 16, to: 33, into: m("Dodge") }] });

  // Step 4: second spell. Pulls everything in the vortex to Rook's blade (works in the air too).
  add({ id: "VacuumPull", startup: 12, active: 6, recovery: 16, manaCost: 20, tags: ["burst", "gust"],
    hit: hitSpec({ damage: 6, posture: 12, hitstop: 5, hitstun: 34, pull: 6 }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "grimoire" }, swing(6, "vacuum"), { frame: 12, type: E.SpawnVfx, key: "vortex" },
      { frame: 12, type: E.SpawnHitbox, key: "Vortex", value: 6 }],
    cancels: [{ from: 18, to: 33, into: m("Light|Heavy|Jump|Dodge|Spell1|Spell3") }, { from: 14, to: 33, into: m("Light|Heavy"), requiresHit: true }] });

  // Third spell, added as data only (Definition of Done #4): a wind-wrapped spin, three hits.
  add({ id: "TempestEdge", startup: 8, active: 18, recovery: 16, manaCost: 25, tags: ["burst", "gust"],
    hit: hitSpec({ damage: 9, posture: 11, hitstop: 3, hitstun: 22, knockback: 0.3 }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "grimoire" }, { frame: 8, type: E.Move, value: 1.2 },
      { frame: 8, type: E.SpawnVfx, key: "tempest" }, swing(6, "gale"), swing(12), swing(18),
      { frame: 8, type: E.SpawnHitbox, key: "Ring", value: 4 }, { frame: 14, type: E.SpawnHitbox, key: "Ring", value: 4 },
      { frame: 20, type: E.SpawnHitbox, key: "Ring", value: 4 }],
    cancels: [{ from: 20, to: 41, into: m("Jump"), requiresHit: true }, { from: 26, to: 41, into: followUps }] });

  // Step 3: the defensive game and its rewards.
  add({ id: "Guard", startup: 0, active: 8, recovery: 12,
    events: [{ frame: 0, type: E.Custom, key: "parry", value: 8 }],
    cancels: [{ from: 8, to: 19, into: m("Light|Heavy|Dodge|Jump|AnySpell") }] });
  add({ id: "Counter", startup: 4, active: 4, recovery: 16, tags: ["counter"],
    hit: hitSpec({ damage: 30, posture: 35, hitstop: 10, hitstun: 30, knockback: 4, applyTags: [["MARKED", 300]] }),
    events: [{ frame: 0, type: E.Invulnerable, value: 8 }, { frame: 0, type: E.Move, key: "toTarget", value: 6 }, swing(2, "swingHeavy"),
      { frame: 4, type: E.SpawnHitbox, key: "Wide", value: 4 }, { frame: 4, type: E.CameraCue, key: "punch" }],
    cancels: [{ from: 8, to: 23, into: followUps }] });
  add({ id: "LanternBreak", startup: 14, active: 4, recovery: 30, tags: ["finisher"],
    hit: hitSpec({ damage: 70, posture: 0, hitstop: 18, hitstun: 40, knockback: 9, launch: 7 }),
    events: [{ frame: 0, type: E.Invulnerable, value: 20 }, { frame: 0, type: E.SpawnVfx, key: "charge" }, swing(0, "charge"),
      { frame: 10, type: E.Move, key: "toTarget", value: 3 }, { frame: 14, type: E.SpawnHitbox, key: "Wide", value: 4 },
      { frame: 14, type: E.CameraCue, key: "finisher" }],
    cancels: [{ from: 30, to: 47, into: m("Dodge|Jump|AnySpell") }] });

  // Phase 2: the ultimate. Timed to the GDD §19.4 template: activation, charge, close-up,
  // release, impact, aftermath, return. Camera shots are cues; everything else stops for the charge.
  add({ id: "Skyrender", startup: 48, active: 72, recovery: 36, surgeCost: 100, tags: ["ultimate", "burst", "gust"],
    events: [
      { frame: 0, type: E.Invulnerable, value: 156 }, { frame: 0, type: E.Custom, key: "timeStop", value: 48 },
      { frame: 0, type: E.CameraCue, key: "ult-activate" }, { frame: 0, type: E.PlaySound, key: "ultActivate" },
      { frame: 0, type: E.SpawnVfx, key: "ultCharge" },
      { frame: 22, type: E.CameraCue, key: "ult-charge" }, { frame: 22, type: E.PlaySound, key: "charge" },
      { frame: 34, type: E.CameraCue, key: "ult-closeup" }, { frame: 34, type: E.SpawnVfx, key: "ultName" },
      { frame: 48, type: E.SpawnHitbox, key: "SkyRing", value: 3 }, { frame: 48, type: E.CameraCue, key: "ult-release" },
      { frame: 48, type: E.PlaySound, key: "gale" }, { frame: 48, type: E.SpawnVfx, key: "ultBurst" },
      { frame: 51, type: E.Custom, key: "jump", value: 15 },
      { frame: 60, type: E.Custom, key: "hover", value: 54 },
      ...[60, 68, 76, 84, 92, 100, 108].flatMap((f) => [
        { frame: f, type: E.SpawnHitbox, key: "SkyCut", value: 3 }, { frame: f, type: E.PlaySound, key: "swing" }]),
      { frame: 114, type: E.Custom, key: "slam", value: 34 }, { frame: 114, type: E.SpawnHitbox, key: "SkyFinal", value: 6 },
      { frame: 114, type: E.CameraCue, key: "ult-impact" },
      { frame: 124, type: E.CameraCue, key: "ult-aftermath" },
      { frame: 148, type: E.CameraCue, key: "ult-return" },
    ] });
  return Object.freeze(a);
})();

/** Rook's combo graph. Order matters inside each list: first match wins. */
export function buildRookGraph(contextProvider, A = ROOK_ABILITIES) {
  const g = new ComboGraph(contextProvider);
  // Finisher outranks every combo route once the target's posture is broken.
  g.addPriority(Intent.Heavy, A.LanternBreak, C.Grounded | C.TargetStaggered);
  g.addPriority(Intent.Ultimate, A.Skyrender, C.Grounded | C.SurgeFull);
  g.addEntry(Intent.Light, A.Counter, C.AfterParry)
    .addEntry(Intent.Light, A.DashStrike, C.Grounded | C.AfterDash)
    .addEntry(Intent.Light, A.L1, C.Grounded)
    .addEntry(Intent.Light, A.AirL1, C.Airborne)
    .addEntry(Intent.Heavy, A.AirSlam, C.Airborne)
    .addEntry(Intent.Heavy, A.Launcher, C.Grounded)
    .addEntry(Intent.Jump, A.Jump, C.Grounded)
    .addEntry(Intent.Jump, A.AirJump, C.Airborne | C.AirJumpReady)
    .addEntry(Intent.Dodge, A.Dodge, C.Grounded)
    .addEntry(Intent.Dodge, A.AirDash, C.Airborne | C.AirDashReady)
    .addEntry(Intent.Block, A.Guard, C.Grounded)
    .addEntry(Intent.Spell1, A.GaleCutter)
    .addEntry(Intent.Spell2, A.VacuumPull)
    .addEntry(Intent.Spell3, A.TempestEdge, C.Grounded);
  g.addEdge(A.L1, Intent.Light, A.L2).addEdge(A.L2, Intent.Light, A.L3).addEdge(A.L3, Intent.Light, A.L4)
    .addEdge(A.L2, Intent.Heavy, A.Launcher)
    .addEdge(A.AirL1, Intent.Light, A.AirL2).addEdge(A.AirL2, Intent.Light, A.AirL3)
    .addEdge(A.AirL1, Intent.Heavy, A.AirSlam).addEdge(A.AirL2, Intent.Heavy, A.AirSlam).addEdge(A.AirL3, Intent.Heavy, A.AirSlam);
  g.addGlobal(Intent.Light, A.Counter, C.AfterParry)
    .addGlobal(Intent.Dodge, A.Dodge, C.Grounded)
    .addGlobal(Intent.Dodge, A.AirDash, C.Airborne | C.AirDashReady)
    .addGlobal(Intent.Spell1, A.GaleCutter)
    .addGlobal(Intent.Spell2, A.VacuumPull)
    .addGlobal(Intent.Spell3, A.TempestEdge, C.Grounded)
    .addGlobal(Intent.Jump, A.Jump, C.Grounded)
    .addGlobal(Intent.Jump, A.AirJump, C.Airborne | C.AirJumpReady)
    .addGlobal(Intent.Light, A.DashStrike, C.Grounded | C.AfterDash)
    .addGlobal(Intent.Light, A.AirL1, C.Airborne)
    .addGlobal(Intent.Heavy, A.AirSlam, C.Airborne);
  return g;
}
