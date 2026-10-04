import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World } from "../src/sim/world.js";
import { ACOLYTE_ABILITIES } from "../src/data/acolyte.js";

function duel(dist = 1.6) {
  const w = new World({ seed: 1 });
  const e = w.spawnAcolyte(0, -4 + dist);
  e.brain = null; e.yaw = Math.PI;
  w.drainEvents();
  return { w, p: w.player, e };
}
const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };

test("Launcher marks the target; a spell detonates the mark once", () => {
  const { w, e } = duel();
  e.combatant.health.max = e.combatant.health.current = 500;
  const log = [];
  w.press(Intent.Light); run(w, 12, log);
  w.press(Intent.Light); run(w, 12, log);
  w.press(Intent.Heavy); run(w, 20, log);
  assert.ok(e.tags.has("MARKED"), "launcher marks");
  run(w, 50, log);
  const before = e.combatant.health.current;
  w.press(Intent.Spell3); run(w, 45, log); // Tempest Edge: three hits
  const reactions = log.filter((x) => x.type === "reaction");
  assert.equal(reactions.length, 1, "one detonation for one mark");
  assert.equal(reactions[0].reaction.id, "Detonate");
  assert.ok(!e.tags.has("MARKED"), "mark consumed");
  assert.equal(before - e.combatant.health.current, 27 + 22, "three Tempest hits plus Detonate");
});

test("Detonate splashes nearby enemies", () => {
  const w = new World({ seed: 1 });
  const a = w.spawnAcolyte(0, -2.4), b = w.spawnAcolyte(1.6, -1.6);
  for (const e of [a, b]) { e.brain = null; e.combatant.health.max = e.combatant.health.current = 500; }
  a.tags.add("MARKED", 300);
  w.drainEvents();
  const log = [];
  w.press(Intent.Spell1); run(w, 20, log);
  const r = log.find((x) => x.type === "reaction");
  assert.ok(r, "gale detonated the mark");
  assert.ok(r.targets.includes(b), "splash reached the neighbor");
  assert.equal(b.combatant.health.max - b.combatant.health.current >= 22, true);
});

test("surge fills from dealing and taking damage, and from parries", () => {
  const { w, p, e } = duel(1.8);
  assert.equal(p.surge.current, 0);
  w.press(Intent.Light); run(w, 12);
  const afterHit = p.surge.current;
  assert.ok(afterHit > 3);
  run(w, 40);
  e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  run(w, 10); w.press(Intent.Block); run(w, 8);
  assert.ok(p.surge.current >= afterHit + 12, "parry adds surge");
});

test("the ultimate needs a full surge gauge", () => {
  const { w, p } = duel();
  const log = [];
  w.press(Intent.Ultimate); run(w, 5, log);
  assert.ok(!log.some((x) => x.type === "started" && x.ability.id === "Skyrender"));
  p.surge.fill();
  w.press(Intent.Ultimate); run(w, 2, log);
  assert.equal(p.current.id, "Skyrender");
  assert.equal(p.surge.current, 0, "spent on start");
});

test("Skyrender: time stop, launches everyone, aerial hits, invulnerable, everyone lands", () => {
  const w = new World({ seed: 4 });
  w.spawnWave(3);
  const enemies = w.enemies;
  for (const e of enemies) { e.combatant.health.max = e.combatant.health.current = 400; }
  // Put them in range, one mid-swing at Rook.
  enemies.forEach((e, i) => { const a = (i / 3) * Math.PI * 2; e.pos = { x: Math.sin(a) * 4, y: 0, z: -4 + Math.cos(a) * 4 }; });
  w.drainEvents();
  const p = w.player;
  enemies[0].brain = null;
  enemies[0].pos = { x: 0, y: 0, z: -2.2 }; enemies[0].yaw = Math.PI;
  enemies[0].controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  p.surge.fill();
  w.press(Intent.Ultimate);
  const log = [];
  run(w, 20, log);
  const frozenFrame = enemies[0].runner.frame;
  run(w, 20, log);
  assert.equal(enemies[0].runner.frame, frozenFrame, "time stop holds enemies during the charge");
  run(w, 150, log);
  const hits = log.filter((x) => x.type === "hit" && x.ability.id === "Skyrender");
  for (const e of enemies) {
    const n = hits.filter((h) => h.defender === e).length;
    assert.ok(n >= 5, `${e.id} hit ${n} times`);
  }
  assert.equal(p.combatant.health.current, p.combatant.health.max, "untouchable during the ultimate");
  assert.ok(log.some((x) => x.type === "slamLand" && x.fighter === p));
  run(w, 60);
  assert.ok(p.grounded && enemies.every((e) => e.grounded));
});
