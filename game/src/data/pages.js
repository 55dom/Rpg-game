// Page evolution (GDD §8, §21.3 SpellData.evolution). Every spell page levels up as its
// hits land; at the threshold the player picks one of two branches, which replaces the
// spell on its button. Branches are ability variants: data only, except Wind Wall's
// zone behaviors (reflect, downdraft), which are options of the "windwall" event.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { ROOK_ABILITIES as A } from "./rook.js";

/** A variant of `base`: same frames and cancels unless overridden. Keeps the base animation. */
function variant(base, id, o) {
  return defineAbility({
    id, animation: base.animation, startup: base.startup, active: base.active, recovery: base.recovery,
    events: base.events, cancels: base.cancels, manaCost: base.manaCost, cooldownFrames: base.cooldownFrames,
    hit: base.hit, tags: base.tags, ...o,
  });
}
const sound = (frame, key = "gale") => ({ frame, type: E.PlaySound, key });

export const PAGE_HITBOXES = Object.freeze({
  Lance: { center: [0, 1, 4.2], size: [1.2, 1.4, 8.4] },
  Maelstrom: { center: [0, 1, 3.4], size: [7.0, 3.4, 6.8] },
  Burst: { center: [0, 1, 1.8], size: [4.2, 2.4, 4.0],
    hit: hitSpec({ damage: 10, posture: 14, hitstop: 5, hitstun: 30, launch: 10 }) },
});

export const PAGES = Object.freeze({
  Spell1: { name: "Gale Cutter", base: A.GaleCutter, hitsToEvolve: 8, branches: [
    { key: "A", name: "Twin Cutter", desc: "A second crescent follows the first: two launches.",
      ability: variant(A.GaleCutter, "TwinCutter", { recovery: 22, events: [...A.GaleCutter.events,
        { frame: 18, type: E.SpawnVfx, key: "gale" }, sound(18), { frame: 18, type: E.SpawnHitbox, key: "Cutter", value: 6 }],
        cancels: [{ from: 24, to: 37, into: A.GaleCutter.cancels[0].into, requiresHit: true }, { from: 24, to: 37, into: A.GaleCutter.cancels[1].into }] }) },
    { key: "B", name: "Gale Lance", desc: "A long piercing blade of wind: twice the reach, harder hit, no launch.",
      ability: variant(A.GaleCutter, "GaleLance", { hit: hitSpec({ damage: 24, posture: 30, hitstop: 7, hitstun: 26, knockback: 3 }),
        events: A.GaleCutter.events.map((e) => (e.type === E.SpawnHitbox ? { ...e, key: "Lance" } : e)) }) },
  ] },
  Spell2: { name: "Vacuum Pull", base: A.VacuumPull, hitsToEvolve: 8, branches: [
    { key: "A", name: "Maelstrom", desc: "A wider vortex that holds its catch in place longer.",
      ability: variant(A.VacuumPull, "Maelstrom", { hit: hitSpec({ damage: 6, posture: 14, hitstop: 5, hitstun: 60, pull: 7 }),
        events: A.VacuumPull.events.map((e) => (e.type === E.SpawnHitbox ? { ...e, key: "Maelstrom" } : e)) }) },
    { key: "B", name: "Undertow", desc: "Pull them in, then a burst of wind throws them skyward.",
      ability: variant(A.VacuumPull, "Undertow", { recovery: 22, events: [...A.VacuumPull.events,
        sound(22, "swingHeavy"), { frame: 24, type: E.SpawnHitbox, key: "Burst", value: 4 }] }) },
  ] },
  Spell3: { name: "Tempest Edge", base: A.TempestEdge, hitsToEvolve: 12, branches: [
    { key: "A", name: "Cyclone", desc: "Five spinning cuts instead of three.",
      ability: variant(A.TempestEdge, "Cyclone", { active: 24, events: [...A.TempestEdge.events,
        { frame: 26, type: E.SpawnHitbox, key: "Ring", value: 4 }, { frame: 30, type: E.SpawnHitbox, key: "Ring", value: 4 }, sound(24, "swing")],
        cancels: [{ from: 26, to: 47, into: A.TempestEdge.cancels[0].into, requiresHit: true }, { from: 32, to: 47, into: A.TempestEdge.cancels[1].into }] }) },
    { key: "B", name: "Tempest Step", desc: "Spins forward through the crowd, harder hits.",
      ability: variant(A.TempestEdge, "TempestStep", { hit: hitSpec({ damage: 12, posture: 14, hitstop: 3, hitstun: 22, knockback: 0.6 }),
        events: A.TempestEdge.events.map((e) => (e.type === E.Move ? { ...e, value: 4.5 } : e)) }) },
  ] },
  Spell4: { name: "Wind Wall", base: A.WindWall, hitsToEvolve: 6, branches: [
    { key: "A", name: "Mirror Gale", desc: "The wall throws enemy bolts back at their owners.",
      ability: variant(A.WindWall, "MirrorGale", { events: A.WindWall.events.map((e) => (e.key === "windwall" ? { ...e, key: "windwallMirror" } : e)) }) },
    { key: "B", name: "Downdraft", desc: "Anyone who touches the wall is thrown into the air.",
      ability: variant(A.WindWall, "Downdraft", { events: A.WindWall.events.map((e) => (e.key === "windwall" ? { ...e, key: "windwallDown" } : e)) }) },
  ] },
});
