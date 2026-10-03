import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { boxHitsCapsule } from "../src/sim/overlap.js";
import { World, flatDistance } from "../src/sim/world.js";
import { ACOLYTE_ABILITIES } from "../src/data/acolyte.js";

/** A world with one passive acolyte standing in front of Rook. */
function duel(dist = 1.6) {
  const w = new World({ seed: 1 });
  const e = w.spawnAcolyte(0, -4 + dist);
  e.brain = null; // scripted
  e.yaw = Math.PI;
  w.drainEvents();
  return { w, p: w.player, e };
}
const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const types = (log) => log.map((e) => e.type);
const started = (log, who) => log.filter((e) => e.type === "started" && (!who || e.fighter === who)).map((e) => e.ability.id);

test("box vs capsule overlap", () => {
  const def = { center: [0, 1, 1], size: [2, 2, 2] };
  const o = { x: 0, y: 0, z: 0 };
  assert.ok(boxHitsCapsule(def, o, 0, { x: 0, y: 0, z: 2.3 }, 0.45, 1.9));
  assert.ok(!boxHitsCapsule(def, o, 0, { x: 0, y: 0, z: 2.6 }, 0.45, 1.9));
  assert.ok(!boxHitsCapsule(def, o, 0, { x: 0, y: 0, z: -1.5 }, 0.45, 1.9), "behind");
  assert.ok(boxHitsCapsule(def, o, Math.PI, { x: 0, y: 0, z: -1.5 }, 0.45, 1.9), "turned around");
  assert.ok(boxHitsCapsule(def, o, Math.PI / 2, { x: 1.5, y: 0, z: 0 }, 0.45, 1.9), "turned right");
  assert.ok(!boxHitsCapsule(def, o, 0, { x: 0, y: 3, z: 1 }, 0.45, 1.9), "above");
});

test("four-hit combo connects every hit and breaks posture; Lantern Break finishes", () => {
  const { w, p, e } = duel();
  const log = [];
  for (let i = 0; i < 4; i++) { w.press(Intent.Light); run(w, 12, log); }
  run(w, 30, log);
  const hits = log.filter((x) => x.type === "hit" && x.attacker === p).map((x) => x.ability.id);
  assert.deepEqual(hits, ["L1", "L2", "L3", "L4"]);
  assert.ok(types(log).includes("postureBreak"));
  assert.ok(e.combatant.postureBroken);
  assert.ok(flatDistance(p.pos, e.pos) < 3.8, `still in finisher range (${flatDistance(p.pos, e.pos).toFixed(2)})`);

  w.press(Intent.Heavy);
  const log2 = [];
  run(w, 40, log2);
  assert.deepEqual(started(log2, p), ["LanternBreak"]);
  assert.ok(types(log2).includes("kill"), "120 HP acolyte dies to a full combo plus finisher");
});

test("finisher cuts through combo recovery when posture breaks mid-string", () => {
  const { w, p, e } = duel();
  e.combatant.posture.set(15);
  const log = [];
  w.press(Intent.Light); run(w, 12, log);
  w.press(Intent.Light); run(w, 9, log);
  assert.ok(e.combatant.postureBroken);
  w.press(Intent.Heavy); run(w, 6, log); // after L2's hitstop
  assert.equal(p.current.id, "LanternBreak");
});

test("launcher, jump cancel, and an air combo juggle", () => {
  const { w, p, e } = duel();
  const log = [];
  w.press(Intent.Light); run(w, 12, log);
  w.press(Intent.Light); run(w, 12, log);
  w.press(Intent.Heavy); run(w, 14, log);
  assert.ok(!e.grounded, "enemy launched");
  w.press(Intent.Jump); run(w, 9, log); // buffered through the launcher's hitstop
  assert.ok(!p.grounded, "jump-cancelled after the launcher hit");
  for (let i = 0; i < 3; i++) { w.press(Intent.Light); run(w, 11, log); }
  const air = log.filter((x) => x.type === "hit" && x.attacker === p && x.ability.id.startsWith("Air")).map((x) => x.ability.id);
  assert.deepEqual(air, ["AirL1", "AirL2", "AirL3"]);
  w.press(Intent.Heavy); run(w, 60, log);
  assert.ok(started(log, p).includes("AirSlam"));
  assert.ok(types(log).includes("slamLand"));
  assert.ok(p.grounded && e.grounded);
});

test("perfect dodge triggers Afterimage, slows enemies, and opens the counter", () => {
  const { w, p, e } = duel(1.8);
  e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  const log = [];
  run(w, 11, log); // slash hitbox spawns at frame 14 of the slash
  w.press(Intent.Dodge);
  run(w, 6, log);
  assert.ok(types(log).includes("perfectDodge"), types(log).join());
  assert.ok(types(log).includes("afterimage"));
  assert.ok(w.afterimageActive);
  const before = e.runner.frame;
  run(w, 10, log);
  assert.ok(e.runner.frame - before <= 4, "enemy runs at about a third speed");
  w.press(Intent.Light); run(w, 2, log);
  assert.equal(p.current.id, "Counter", "counter cuts through the dodge");
  run(w, 10, log);
  assert.ok(log.some((x) => x.type === "hit" && x.ability.id === "Counter"));
});

test("Afterimage has a cooldown but the counter window doesn't", () => {
  const { w } = duel(1.8);
  w.afterimageReadyFrame = 1e9;
  const e = w.enemies[0];
  e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  const log = [];
  run(w, 11, log); w.press(Intent.Dodge); run(w, 6, log);
  assert.ok(types(log).includes("perfectDodge") && !types(log).includes("afterimage"));
  assert.ok(w.player.counterFrames > 0);
});

test("parry staggers the attacker and opens the counter; thrust can't be parried", () => {
  const { w, p, e } = duel(1.8);
  e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  const log = [];
  run(w, 10, log);
  w.press(Intent.Block); run(w, 6, log);
  assert.ok(types(log).includes("parry"), types(log).join());
  assert.ok(e.combatant.isStaggered && !e.runner.isRunning);
  assert.ok(p.counterFrames > 0);
  assert.equal(p.combatant.health.current, p.combatant.health.max);

  const t = duel(3.5);
  t.e.controller.startDirect(ACOLYTE_ABILITIES.Thrust, t.w.frame);
  const log2 = [];
  run(t.w, 22, log2);
  t.w.press(Intent.Block); run(t.w, 12, log2);
  assert.ok(!types(log2).includes("parry"));
  assert.ok(log2.some((x) => x.type === "hit" && x.defender === t.p), types(log2).join());
});

test("holding block after the parry window blocks with chip damage", () => {
  const { w, p, e } = duel(1.8);
  p.holdBlock = true;
  w.press(Intent.Block); run(w, 30);
  assert.ok(p.combatant.blocking);
  e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  const log = []; run(w, 20, log);
  assert.ok(types(log).includes("block"));
  assert.ok(p.combatant.health.current < p.combatant.health.max);
});

test("enemies attack on their own, sharing two tokens", () => {
  const w = new World({ seed: 5 });
  w.spawnWave(3);
  let maxHolders = 0, hurt = false;
  for (let i = 0; i < 60 * 12; i++) {
    w.step();
    for (const ev of w.drainEvents()) if (ev.type === "hit" && ev.defender === w.player) hurt = true;
    maxHolders = Math.max(maxHolders, w.tokens.inUse);
    if (!w.player.alive) w.resetPlayer();
  }
  assert.ok(hurt, "an idle player gets hit");
  assert.ok(maxHolders <= 2);
});

test("a cleared wave reports waveClear after the bodies fade", () => {
  const { w, e } = duel();
  e.combatant.takeDamage(999);
  const log = []; run(w, 120, log);
  assert.ok(types(log).includes("waveClear"));
  assert.equal(w.enemies.length, 0);
});
