import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent, Mask, mask, maskHas, maskNames, parseMask, InputBuffer } from "../src/core/input.js";
import { FrameClock, seededRandom, SECONDS_PER_TICK } from "../src/core/timing.js";
import { ResourcePool } from "../src/core/stats.js";
import { Combatant, Team, HitOutcome, Rules, hitSpec, resolveHit, isHitSet } from "../src/core/combat.js";

test("masks and parsing", () => {
  const m = parseMask("Light|Dodge");
  assert.ok(maskHas(m, Intent.Light) && maskHas(m, Intent.Dodge) && !maskHas(m, Intent.Heavy));
  assert.ok(maskHas(parseMask("AnySpell"), Intent.Spell3));
  assert.deepEqual(maskNames(mask(Intent.Heavy, Intent.Jump)), ["Heavy", "Jump"]);
  assert.equal(maskHas(Mask.All, Intent.None), false);
  assert.throws(() => parseMask("Kick"));
});

test("buffer returns oldest allowed press and expires old ones", () => {
  const b = new InputBuffer();
  b.push(Intent.Heavy, 0); b.push(Intent.Light, 2);
  assert.equal(b.consume(mask(Intent.Light), 3), Intent.Light);
  assert.equal(b.consume(Mask.All, 3), Intent.Heavy);
  assert.equal(b.consume(Mask.All, 3), 0);
  b.push(Intent.Light, 0);
  assert.equal(b.consume(Mask.All, 11), 0, "expired after window");
});

test("buffer delay keeps presses alive through hitstop", () => {
  const b = new InputBuffer();
  b.push(Intent.Light, 0);
  for (let i = 0; i < 8; i++) b.delay(1);
  assert.equal(b.consume(Mask.All, 15), Intent.Light);
});

test("frame clock is rate independent and caps hitches", () => {
  const c = new FrameClock();
  let n = 0; for (let i = 0; i < 30; i++) n += c.advance(1 / 30);
  assert.equal(n, 60);
  const d = new FrameClock();
  let m = 0; for (let i = 0; i < 144; i++) m += d.advance(1 / 144);
  assert.equal(m, 60);
  assert.equal(new FrameClock().advance(5), 5);
  assert.ok(new FrameClock().advance(SECONDS_PER_TICK / 2) === 0);
});

test("seeded random is deterministic", () => {
  const a = seededRandom(7), b = seededRandom(7);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test("resource pool", () => {
  const p = new ResourcePool(100, 30);
  const seen = [];
  p.onChange = (o, n) => seen.push([o, n]);
  assert.equal(p.trySpend(40), false);
  assert.ok(p.trySpend(30));
  assert.ok(p.isEmpty);
  p.add(500);
  assert.ok(p.isFull);
  assert.deepEqual(seen, [[30, 0], [0, 100]]);
  assert.throws(() => p.trySpend(-1));
});

const fighters = () => [new Combatant(Team.Player, 100, 50), new Combatant(Team.Enemy, 100, 50)];

test("plain hit damages and staggers", () => {
  const [a, d] = fighters();
  const r = resolveHit(a, d, hitSpec({ damage: 10, posture: 5, hitstun: 12, hitstop: 4 }));
  assert.equal(r.outcome, HitOutcome.Hit);
  assert.equal(d.health.current, 90);
  assert.equal(d.staggerFrames, 12);
  assert.equal(r.attackerHitstop, 4);
  assert.ok(r.connected);
});

test("same team and dead targets are ignored", () => {
  const a = new Combatant(Team.Enemy, 10, 10), d = new Combatant(Team.Enemy, 10, 10);
  assert.equal(resolveHit(a, d, hitSpec({ damage: 5 })).outcome, HitOutcome.Ignored);
  const [p, e] = fighters(); e.takeDamage(999);
  assert.equal(resolveHit(p, e, hitSpec({ damage: 5 })).outcome, HitOutcome.Ignored);
});

test("perfect dodge only early in i-frames", () => {
  const [a, d] = fighters();
  d.startInvulnerability(12);
  assert.equal(resolveHit(a, d, hitSpec({ damage: 5 })).outcome, HitOutcome.PerfectDodge);
  for (let i = 0; i < Rules.PerfectDodgeFrames; i++) d.tick();
  assert.equal(resolveHit(a, d, hitSpec({ damage: 5 })).outcome, HitOutcome.Dodged);
  assert.equal(d.health.current, 100);
});

test("parry hurts attacker posture; unblockable ignores parry and block", () => {
  const [a, d] = fighters();
  d.startParry();
  const r = resolveHit(a, d, hitSpec({ damage: 10, posture: 20 }));
  assert.equal(r.outcome, HitOutcome.Parried);
  assert.equal(a.posture.current, 0);
  assert.ok(r.attackerPostureBroken && a.isStaggered);
  const [a2, d2] = fighters();
  d2.startParry(); d2.blocking = true;
  assert.equal(resolveHit(a2, d2, hitSpec({ damage: 10, unblockable: true })).outcome, HitOutcome.Hit);
});

test("block chips health and can guard-break", () => {
  const [a, d] = fighters();
  d.blocking = true;
  const r = resolveHit(a, d, hitSpec({ damage: 10, posture: 40, hitstop: 6 }));
  assert.equal(r.outcome, HitOutcome.Blocked);
  assert.equal(d.health.current, 98);
  assert.equal(r.attackerHitstop, 3);
  const r2 = resolveHit(a, d, hitSpec({ damage: 10, posture: 40 }));
  assert.ok(r2.defenderPostureBroken);
  assert.equal(d.blocking, false);
});

test("posture break staggers, refills after, and regen waits", () => {
  const [, d] = fighters();
  assert.ok(d.takePostureDamage(50));
  assert.equal(d.staggerFrames, Rules.PostureBreakStaggerFrames);
  for (let i = 0; i < Rules.PostureBreakStaggerFrames; i++) d.tick();
  assert.ok(!d.isStaggered && d.posture.isFull);
  d.takePostureDamage(10);
  for (let i = 0; i < 90; i++) d.tick();
  assert.equal(d.posture.current, 40);
  d.tick();
  assert.equal(d.posture.current, 40.5);
});

test("super armor absorbs hitstun", () => {
  const [a, d] = fighters();
  d.superArmor = true;
  resolveHit(a, d, hitSpec({ damage: 5, posture: 5 }));
  assert.equal(d.isStaggered, false);
});

test("hitSpec validates", () => {
  assert.throws(() => hitSpec({ damage: -1 }));
  assert.ok(Object.isFrozen(hitSpec()));
  assert.equal(isHitSet(hitSpec()), false);
  assert.ok(isHitSet(hitSpec({ launch: 2 })));
});
