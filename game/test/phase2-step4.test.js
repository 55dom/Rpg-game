import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World, flatDistance } from "../src/sim/world.js";
import { HASK_ABILITIES, HASK_TUNING } from "../src/data/hask.js";

const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const arena = (o = {}) => { const w = new World({ seed: 7, ...o }); w.spawnWave(["hask"]); w.drainEvents(); return { w, h: w.boss, p: w.player }; };
const types = (log) => log.map((x) => x.type);
/** Step until `pred()` holds (or fail after `max` frames). */
const until = (w, pred, max, log) => { for (let i = 0; i < max; i++) { if (pred()) return i; w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } assert.fail("condition never held"); };

test("Hask spawns with an intro and fights on the surface", () => {
  const w = new World({ seed: 7 });
  w.spawnWave(["hask"]);
  const ev = w.drainEvents();
  assert.ok(types(ev).includes("bossIntro"));
  const h = w.boss;
  assert.equal(h.stats.boss, true);
  const log = []; run(w, 400, log);
  assert.ok(log.some((x) => x.type === "started" && x.fighter === h && ["Swipe", "MudSpit"].includes(x.ability.id)), "it attacks");
});

test("dive → submerged (untouchable) → mud waves that WEIGH you down → warned eruption", () => {
  const { w, h, p } = arena();
  h.boss.timer = 1;
  const log = []; until(w, () => h.submerged, 200, log);
  assert.ok(types(log).includes("submerge"));
  // Untouchable while under: a slash on its position does nothing.
  p.pos = { x: h.pos.x, y: 0, z: h.pos.z - 1.6 }; p.yaw = 0;
  w.press(Intent.Light); run(w, 14, log);
  assert.ok(!log.some((x) => x.type === "hit" && x.defender === h));
  run(w, 260, log);
  assert.ok(log.some((x) => x.type === "projectile" && x.projectile.def.flat), "mud waves");
  assert.ok(types(log).includes("eruptWarning"), "warning before the eruption");
  const warnAt = log.findIndex((x) => x.type === "eruptWarning"), surfAt = log.findIndex((x) => x.type === "surface");
  assert.ok(surfAt > warnAt);
  assert.ok(!h.submerged);
});

test("mud makes Rook WEIGHTED (slower, lower jumps); Juno's Stitch cuts it away", () => {
  const w = new World({ seed: 7, companions: true });
  const p = w.player;
  p.tags.add("WEIGHTED", 300);
  p.moveInput.z = 1; run(w, 60);
  const slow = p.vel.z;
  p.tags.remove("WEIGHTED"); run(w, 60);
  assert.ok(slow < p.vel.z * 0.7, `weighted ${slow.toFixed(2)} vs ${p.vel.z.toFixed(2)}`);
  p.moveInput.z = 0;
  p.tags.add("WEIGHTED", 300); p.combatant.health.set(60);
  w.setStance("Support");
  const log = []; run(w, 120, log);
  assert.ok(log.some((x) => x.type === "heal" && x.target === p));
  assert.ok(!p.tags.has("WEIGHTED"));
});

test("wind on the mound uproots Hask: launched, staggered, posture hurt", () => {
  const { w, h, p } = arena();
  h.boss.timer = 1;
  until(w, () => h.submerged, 200);
  h.boss.timer = 999; // stay under for the test
  p.pos = { x: h.pos.x, y: 0, z: h.pos.z - 3 }; p.prev = { ...p.pos }; p.yaw = 0; p.mana.fill();
  const posture = h.combatant.posture.current;
  const log = []; w.press(Intent.Spell1); run(w, 14, log);
  assert.ok(types(log).includes("uprooted"), types(log).join());
  assert.ok(!h.submerged && !h.grounded && h.combatant.isStaggered);
  assert.ok(h.combatant.posture.current <= posture - HASK_TUNING.uprootPosture + 1);
});

test("phase 2 at 65%: roars and calls two Fen Hounds; phase 3 at 35%: bog drains, no more dives, EXPOSED", () => {
  const { w, h } = arena();
  h.combatant.health.set(h.combatant.health.max * 0.6);
  const log = []; until(w, () => log.some((x) => x.type === "summon"), 300, log);
  assert.ok(log.some((x) => x.type === "bossPhase" && x.phase === 2));
  assert.ok(log.some((x) => x.type === "summon" && x.summoned.length === 2));
  assert.equal(w.liveEnemies.filter((e) => e.kind === "hound").length, 2);
  h.combatant.health.set(h.combatant.health.max * 0.3);
  const log2 = []; run(w, 20, log2);
  assert.ok(log2.some((x) => x.type === "bossPhase" && x.phase === 3 && x.drained));
  assert.ok(h.tags.has("EXPOSED"));
  run(w, 900, log2);
  assert.ok(!log2.some((x) => x.type === "submerge"), "never dives on a drained bed");
});

test("EXPOSED: the drained Hask takes +50% damage", () => {
  const { w, h, p } = arena();
  h.brain = null; h.boss.timer = 1e9;
  p.pos = { x: h.pos.x, y: 0, z: h.pos.z - 2.6 }; p.prev = { ...p.pos }; p.yaw = 0;
  const log = []; w.press(Intent.Light); run(w, 14, log);
  const normal = log.find((x) => x.type === "hit" && x.defender === h).result.healthDamage;
  h.tags.add("EXPOSED", 1e9); run(w, 40);
  const log2 = []; w.press(Intent.Light); run(w, 14, log2);
  const exposed = log2.find((x) => x.type === "hit" && x.defender === h).result.healthDamage;
  assert.equal(exposed, normal * 1.5);
});

test("the Bogwarden can be beaten", () => {
  const { w, h } = arena();
  h.combatant.takeDamage(1e6);
  run(w, 2);
  assert.ok(!h.alive);
  run(w, 120);
  assert.ok(!w.enemies.includes(h));
});
