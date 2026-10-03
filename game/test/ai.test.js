import { test } from "node:test";
import assert from "node:assert/strict";
import { defineAbility } from "../src/core/abilities.js";
import { seededRandom } from "../src/core/timing.js";
import { AttackTokenPool, AttackOption, EnemyBrain, BrainState, MoveIntent } from "../src/core/ai.js";

const slash = defineAbility({ id: "Slash", startup: 5, active: 2, recovery: 5 });
const thrust = defineAbility({ id: "Thrust", startup: 10, active: 2, recovery: 5 });
const p = (o) => ({ frame: 0, hasTarget: true, distance: 2, isStaggered: false, isDead: false, abilityRunning: false, ...o });

test("token pool caps attackers and expires hogs", () => {
  const pool = new AttackTokenPool(2);
  assert.ok(pool.tryAcquire("a", 0) && pool.tryAcquire("b", 0));
  assert.ok(!pool.tryAcquire("c", 0));
  assert.ok(pool.tryAcquire("a", 1), "re-acquire is fine");
  pool.release("a");
  assert.ok(pool.tryAcquire("c", 2));
  assert.ok(pool.tryAcquire("d", 300), "old holders expired");
  assert.equal(pool.inUse, 1);
});

test("brain approaches, attacks, recovers, releases", () => {
  const pool = new AttackTokenPool(1);
  const b = new EnemyBrain("e1", pool, [new AttackOption(slash, 0, 2.4, 1, 40)], seededRandom(1));
  b.recoverFrames = 2;
  assert.equal(b.think(p({ distance: 30 })).move, MoveIntent.Hold);
  assert.equal(b.think(p({ distance: 8 })).move, MoveIntent.Approach);
  const d = b.think(p({ frame: 1 }));
  assert.equal(d.attack, slash);
  assert.ok(pool.holds("e1"));
  b.think(p({ frame: 2, abilityRunning: true }));
  assert.equal(b.state, BrainState.Attacking);
  b.think(p({ frame: 3 })); b.think(p({ frame: 4 }));
  assert.ok(pool.holds("e1"));
  assert.equal(b.think(p({ frame: 5 })).move, MoveIntent.Circle, "slash cooling down, in range → circle");
  assert.ok(!pool.holds("e1"));
});

test("brain without token circles; stagger releases token", () => {
  const pool = new AttackTokenPool(1);
  pool.tryAcquire("other", 0);
  const b = new EnemyBrain("e1", pool, [new AttackOption(slash, 0, 3)], seededRandom(2));
  assert.equal(b.think(p({})).move, MoveIntent.Circle);
  pool.release("other");
  b.think(p({}));
  assert.ok(pool.holds("e1"));
  b.think(p({ isStaggered: true }));
  assert.ok(!pool.holds("e1"));
  assert.equal(b.state, BrainState.Staggered);
});

test("brain retreats when too close for every option and weights choices", () => {
  const b = new EnemyBrain("e", new AttackTokenPool(5), [new AttackOption(thrust, 2.5, 5)], seededRandom(3));
  assert.equal(b.think(p({ distance: 1 })).move, MoveIntent.Retreat);
  let heavy = 0;
  for (let i = 0; i < 400; i++) {
    const br = new EnemyBrain("w" + i, new AttackTokenPool(1), [new AttackOption(slash, 0, 3, 3), new AttackOption(thrust, 0, 3, 1)], seededRandom(i + 10));
    if (br.think(p({})).attack === slash) heavy++;
  }
  assert.ok(heavy > 250 && heavy < 350, `slash picked ${heavy}/400`);
});

test("attackFailed releases", () => {
  const pool = new AttackTokenPool(1);
  const b = new EnemyBrain("e", pool, [new AttackOption(slash, 0, 3)]);
  b.think(p({}));
  b.attackFailed();
  assert.ok(!pool.holds("e"));
  assert.equal(b.state, BrainState.Idle);
});
