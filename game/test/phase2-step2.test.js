import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World, flatDistance } from "../src/sim/world.js";
import { ACOLYTE_ABILITIES } from "../src/data/acolyte.js";
import { Stance } from "../src/core/ai.js";

const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const party = (seed = 1) => { const w = new World({ seed, companions: true }); w.drainEvents(); return w; };
const bas = (w) => w.companions.find((c) => c.kind === "bas");
const juno = (w) => w.companions.find((c) => c.kind === "juno");
const dummy = (w, x, z, hp = 600) => {
  const e = w.spawnAcolyte(x, z); e.brain = null; e.combatant.health.max = e.combatant.health.current = hp; w.drainEvents(); return e;
};

test("companions spawn in formation and follow Rook", () => {
  const w = party();
  assert.equal(w.companions.length, 2);
  w.player.moveInput.z = 1;
  run(w, 120);
  w.player.moveInput.z = 0;
  run(w, 90);
  for (const c of w.companions) assert.ok(flatDistance(c.pos, w.player.pos) < 4, `${c.kind} kept up (${flatDistance(c.pos, w.player.pos).toFixed(1)})`);
});

test("Press stance: companions fight on their own and deal damage", () => {
  const w = party();
  const e = dummy(w, 0, 1);
  const log = []; run(w, 300, log);
  const by = new Set(log.filter((x) => x.type === "hit" && x.defender === e).map((x) => x.attacker.kind));
  assert.ok(by.has("bas") && by.has("juno"), [...by].join());
});

test("Guard stance ignores far enemies; Press chases them", () => {
  const w = party();
  w.setStance(Stance.Guard);
  const e = dummy(w, 9, 5);
  const log = []; run(w, 240, log);
  assert.ok(!log.some((x) => x.type === "hit" && x.defender === e), "guard stayed home");
  w.setStance(Stance.Press);
  run(w, 300, log);
  assert.ok(log.some((x) => x.type === "hit" && x.defender === e), "press went after it");
});

test("Assist: Bas blinks to the target and launches it with an anchoring pillar; then cooldown", () => {
  const w = party();
  const e = dummy(w, 0, 3);
  const r = w.callAssist("bas");
  assert.ok(r.ok);
  assert.ok(flatDistance(bas(w).pos, e.pos) < 2, "blinked beside the target");
  const log = []; run(w, 16, log);
  assert.ok(log.some((x) => x.type === "hit" && x.ability.id === "PillarUppercut"));
  assert.ok(!e.grounded && e.tags.has("ANCHORED"));
  assert.equal(w.callAssist("bas").reason, "cooldown");
  assert.equal(w.callAssist("juno").ok, true, "each companion has its own cooldown");
});

test("Assist extends a juggle: Pillar Uppercut re-launches an airborne enemy", () => {
  const w = party();
  w.setStance(Stance.Guard);
  const e = dummy(w, 0, -2.4);
  e.yaw = Math.PI;
  w.press(Intent.Light); run(w, 12);
  w.press(Intent.Light); run(w, 12);
  w.press(Intent.Heavy); run(w, 30);
  const y = e.pos.y;
  assert.ok(!e.grounded);
  w.callAssist("bas"); run(w, 14);
  assert.ok(e.vel.y > 5 || e.pos.y > y + 0.5, "launched again");
});

test("Taut Line: Juno's snare on an anchored target", () => {
  const w = party();
  w.setStance(Stance.Guard);
  const e = dummy(w, 0, 3);
  w.callAssist("bas"); run(w, 70);
  assert.ok(e.tags.has("ANCHORED"));
  const log = [];
  w.callAssist("juno"); run(w, 12, log);
  const r = log.find((x) => x.type === "reaction");
  assert.equal(r?.reaction.name, "Taut Line");
  assert.ok(e.combatant.isStaggered);
});

test("Slingshot: a gust on a bound target flings it", () => {
  const w = party();
  w.setStance(Stance.Guard);
  const e = dummy(w, 0, -1.2);
  w.callAssist("juno"); run(w, 14);
  assert.ok(e.tags.has("BOUND"));
  const log = [];
  w.player.yaw = 0; w.player.pos = { x: 0, y: 0, z: -4 };
  w.press(Intent.Spell1); run(w, 20, log);
  assert.ok(log.some((x) => x.type === "reaction" && x.reaction.name === "Slingshot"));
});

test("Shatterstone: a heavy blow on an anchored target splashes", () => {
  const w = party();
  w.setStance(Stance.Guard);
  const e = dummy(w, 0, 3);
  w.callAssist("bas"); run(w, 80);
  e.pos = { x: 0, y: 0, z: -2.4 }; e.grounded = true; e.vel.y = 0; e.yaw = Math.PI;
  const log = [];
  for (let i = 0; i < 4; i++) { w.press(Intent.Light); run(w, 12, log); }
  assert.ok(log.some((x) => x.type === "reaction" && x.reaction.name === "Shatterstone"), log.filter((x) => x.type === "reaction").map((x) => x.reaction.id).join());
});

test("bound enemies can't walk", () => {
  const w = new World({ seed: 1 }); // no companions knocking it around
  const e = dummy(w, 0, 3);
  e.tags.add("BOUND", 120);
  e.moveInput.z = 1;
  const z = e.pos.z; run(w, 30);
  assert.ok(Math.abs(e.pos.z - z) < 0.3);
});

test("Bastion Wall halves damage to Rook; Stitch heals him", () => {
  const w = party();
  w.setStance(Stance.Support);
  const e = w.spawnAcolyte(0, -2.2); e.brain = null; e.yaw = Math.PI; e.target = w.player; w.drainEvents();
  w.player.combatant.health.set(100);
  const log = [];
  e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  run(w, 30, log);
  assert.ok(log.some((x) => x.type === "shield"), "Bas shields when Rook is threatened");
  assert.ok(log.some((x) => x.type === "heal" && x.target === w.player), "Juno stitches a hurt Rook");
  const hit = log.find((x) => x.type === "hit" && x.defender === w.player);
  if (hit) assert.equal(hit.result.healthDamage, 7, "slash 14 halved by the wall");
});

test("enemies spread out across the team, and a downed companion gets back up", () => {
  const w = party(3);
  w.spawnWave(3); w.drainEvents();
  const targets = new Set();
  const log = [];
  for (let i = 0; i < 600; i++) { w.step(); log.push(...w.drainEvents()); for (const e of w.liveEnemies) if (e.target) targets.add(e.target.id); }
  assert.ok(targets.size >= 2, `targets: ${[...targets]}`);
  const j = juno(w);
  j.combatant.takeDamage(999);
  run(w, 1);
  assert.ok(!j.alive);
  run(w, j.stats.reviveFrames + 5, log);
  assert.ok(j.alive && log.some((x) => x.type === "allyRevive"));
  assert.equal(j.combatant.health.current, j.combatant.health.max * 0.5);
});
