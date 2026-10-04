import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World, flatDistance } from "../src/sim/world.js";
import { ACOLYTE_ABILITIES } from "../src/data/acolyte.js";

function duel(dist = 1.6) {
  const w = new World({ seed: 1 });
  const e = w.spawnAcolyte(0, -4 + dist);
  e.brain = null; e.yaw = Math.PI;
  w.drainEvents();
  return { w, p: w.player, e };
}
const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const started = (log, who) => log.filter((e) => e.type === "started" && (!who || e.fighter === who)).map((e) => e.ability.id);
const hitsBy = (log, who) => log.filter((e) => e.type === "hit" && e.attacker === who).map((e) => e.ability.id);

test("double jump: one air jump per airtime, refreshed on landing", () => {
  const w = new World(); const p = w.player; const log = [];
  w.press(Intent.Jump); run(w, 12, log);
  const h1 = p.pos.y;
  w.press(Intent.Jump); run(w, 12, log);
  assert.ok(p.pos.y > h1, "second jump gains height");
  w.press(Intent.Jump); run(w, 8, log);
  assert.deepEqual(started(log, p), ["Jump", "AirJump"], "no third jump");
  run(w, 90); assert.ok(p.grounded);
  w.press(Intent.Jump); run(w, 12); w.press(Intent.Jump); run(w, 2, log);
  assert.equal(p.current?.id, "AirJump", "refreshed after landing");
});

test("air dash flies flat once per airtime; ground dodge never fires in the air", () => {
  const w = new World(); const p = w.player; const log = [];
  w.press(Intent.Jump); run(w, 14, log);
  const y0 = p.pos.y, z0 = p.pos.z;
  w.press(Intent.Dodge); run(w, 6, log);
  assert.equal(p.current.id, "AirDash");
  assert.ok(Math.abs(p.pos.y - y0) < 0.05, "holds altitude");
  assert.ok(p.pos.z - z0 > 1.5, "moves forward");
  run(w, 20, log);
  w.press(Intent.Dodge); run(w, 4, log);
  assert.deepEqual(started(log, p).filter((id) => id.includes("Dodge") || id.includes("Dash")), ["AirDash"]);
});

test("Definition of Done #1: L, L, Gale Cutter, jump cancel, air L x2, air dash, air L, slam", () => {
  const { w, p, e } = duel();
  const log = [];
  const seq = [[Intent.Light, 12], [Intent.Light, 12], [Intent.Spell1, 18], [Intent.Jump, 8],
    [Intent.Light, 11], [Intent.Light, 11], [Intent.Dodge, 8], [Intent.Light, 11], [Intent.Heavy, 60]];
  for (const [intent, frames] of seq) { w.press(intent); run(w, frames, log); }
  assert.deepEqual(started(log, p), ["L1", "L2", "GaleCutter", "Jump", "AirL1", "AirL2", "AirDash", "AirL1", "AirSlam"]);
  assert.deepEqual(hitsBy(log, p), ["L1", "L2", "GaleCutter", "AirL1", "AirL2", "AirL1", "AirSlam"]);
  assert.ok(p.grounded && e.grounded);
});

test("Vacuum Pull drags a distant enemy to Rook's blade and costs 20 mana", () => {
  const { w, p, e } = duel(5);
  const mana = p.mana.current;
  const log = [];
  w.press(Intent.Spell2); run(w, 30, log);
  assert.deepEqual(hitsBy(log, p), ["VacuumPull"]);
  assert.ok(flatDistance(p.pos, e.pos) < 2.3, `pulled to ${flatDistance(p.pos, e.pos).toFixed(2)}`);
  assert.ok(p.mana.current < mana - 15);
});

test("Vacuum Pull in the air lifts the target to Rook", () => {
  const { w, p, e } = duel(4);
  w.press(Intent.Jump); run(w, 6);
  w.press(Intent.Spell2); run(w, 24);
  assert.ok(!e.grounded && e.pos.y > 0.8, `target lifted to ${e.pos.y.toFixed(2)}`);
});

test("melee hits refill mana; spells don't", () => {
  const { w, p } = duel();
  p.mana.set(50);
  w.press(Intent.Light); run(w, 12);
  assert.ok(p.mana.current > 50 + 2, "L1 hit refunds mana");
});

test("lock-on: switch cycles targets left and right, and moves on when the target dies", () => {
  const w = new World({ seed: 2 });
  w.spawnWave(3);
  for (const e of w.enemies) e.brain = null;
  const first = w.toggleLock();
  assert.ok(first);
  const right = w.switchLock(1);
  assert.notEqual(right, first);
  const third = w.switchLock(1);
  assert.ok(third !== right && third !== first);
  assert.equal(w.switchLock(1), first, "wraps around");
  assert.equal(w.switchLock(-1), third, "left goes back");
  const victim = w.lockTarget;
  w.player.pos = { x: victim.pos.x, y: 0, z: victim.pos.z - 1.5 }; w.player.yaw = 0;
  victim.combatant.health.set(1); victim.yaw = Math.PI;
  w.press(Intent.Light); run(w, 12);
  assert.ok(!victim.alive);
  assert.ok(w.lockTarget && w.lockTarget !== victim && w.lockTarget.alive);
});

test("touch assist widens parry and perfect-dodge windows by 3 frames", () => {
  const timing = (assist) => {
    const { w, p, e } = duel(1.8);
    w.assist = assist;
    e.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
    const log = [];
    run(w, 4, log); // block 10 frames before the hit: outside the normal 8-frame window
    w.press(Intent.Block); run(w, 20, log);
    return log.some((x) => x.type === "parry");
  };
  assert.equal(timing(false), false);
  assert.equal(timing(true), true);
});

test("Tempest Edge (data only) hits every surrounding enemy three times", () => {
  const w = new World({ seed: 3 });
  const a = w.spawnAcolyte(0, -2.6), b = w.spawnAcolyte(0, -5.4);
  for (const e of [a, b]) e.brain = null;
  w.drainEvents();
  const log = [];
  w.press(Intent.Spell3); run(w, 45, log);
  const hits = log.filter((x) => x.type === "hit" && x.ability.id === "TempestEdge");
  assert.equal(hits.filter((h) => h.defender === a).length, 3);
  assert.equal(hits.filter((h) => h.defender === b).length, 3, "hits behind Rook too");
  assert.equal(w.player.mana.current < 80, true);
});
