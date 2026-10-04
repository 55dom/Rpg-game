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

import { CompanionBrain, Stance, AllyMove } from "../src/core/ai.js";

const jab = defineAbility({ id: "Jab", startup: 4, active: 2, recovery: 6 });
const heal = defineAbility({ id: "Heal", startup: 4, active: 2, recovery: 6 });
const shield = defineAbility({ id: "Shield", startup: 4, active: 2, recovery: 6 });
const cp = (o) => ({ frame: 0, isDead: false, isStaggered: false, abilityRunning: false, leaderDistance: 2, leaderHealth: 1, leaderThreatened: false, target: null, ...o });

test("companion follows the leader when there's nothing to fight", () => {
  const b = new CompanionBrain("c", [new AttackOption(jab, 0, 2)]);
  assert.equal(b.think(cp({ leaderDistance: 8 })).move, AllyMove.Follow);
  assert.equal(b.think(cp({ leaderDistance: 1 })).move, AllyMove.Hold);
});

test("companion stances set how far it roams", () => {
  const b = new CompanionBrain("c", [new AttackOption(jab, 0, 2)]);
  const far = cp({ target: { distance: 5, distanceToLeader: 8 } });
  assert.equal(b.think(far).move, AllyMove.Approach, "Press chases a target 8 m from the leader");
  b.stance = Stance.Guard;
  assert.equal(b.think(far).move, AllyMove.Hold, "Guard stays home");
  assert.equal(b.think(cp({ target: { distance: 1.5, distanceToLeader: 3 } })).attack, jab);
});

test("companion recovers after attacking, and Support attacks less often", () => {
  const b = new CompanionBrain("c", [new AttackOption(jab, 0, 2, 1, 30)]);
  const t = { distance: 1, distanceToLeader: 1 };
  assert.equal(b.think(cp({ frame: 0, target: t })).attack, jab);
  b.think(cp({ frame: 1, target: t, abilityRunning: true }));
  assert.equal(b.think(cp({ frame: 13, target: t })).attack, null, "recovering");
  b.stance = Stance.Support;
  const s = new CompanionBrain("s", [new AttackOption(jab, 0, 2, 1, 30)]); s.stance = Stance.Support;
  s.think(cp({ frame: 0, target: t }));
  assert.equal(s.options[0].readyFrame, 60, "cooldown doubled in Support");
});

test("companion heals and shields by stance, with cooldowns", () => {
  const b = new CompanionBrain("c", [new AttackOption(jab, 0, 2)], [
    { ability: heal, kind: "heal", cooldownFrames: 300 }, { ability: shield, kind: "shield", cooldownFrames: 300 }]);
  assert.equal(b.think(cp({ leaderHealth: 0.6 })).support, null, "Press only heals in emergencies");
  assert.equal(b.think(cp({ leaderHealth: 0.3 })).support, "heal");
  b.stance = Stance.Support;
  assert.equal(b.think(cp({ frame: 10, leaderHealth: 0.6 })).support, null, "heal on cooldown");
  assert.equal(b.think(cp({ frame: 10, leaderThreatened: true })).support, "shield");
  b.stance = Stance.Guard;
  assert.equal(b.think(cp({ frame: 400, leaderThreatened: true })).support, "shield");
});
