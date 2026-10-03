import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent, Mask, mask, InputBuffer } from "../src/core/input.js";
import { ResourcePool } from "../src/core/stats.js";
import { hitSpec } from "../src/core/combat.js";
import {
  defineAbility, EventType, Phase, phaseAt, canCancel, AbilityRunner, StartResult,
  ComboGraph, MoveContext, AbilityController,
} from "../src/core/abilities.js";

const light = (id = "L1") => defineAbility({
  id, startup: 3, active: 2, recovery: 5,
  events: [{ frame: 3, type: EventType.SpawnHitbox, key: "Blade", value: 2 }, { frame: 0, type: EventType.PlaySound, key: "swing" }],
  cancels: [{ from: 5, to: 9, into: mask(Intent.Light, Intent.Dodge) }, { from: 5, to: 9, into: mask(Intent.Jump), requiresHit: true }],
  hit: hitSpec({ damage: 10 }),
});

test("defineAbility validates and sorts", () => {
  const a = light();
  assert.equal(a.total, 10);
  assert.deepEqual(a.events.map((e) => e.frame), [0, 3]);
  assert.ok(a.hasHit);
  assert.throws(() => defineAbility({ id: "x", startup: 1, events: [{ frame: 1, type: 0 }] }));
  assert.throws(() => defineAbility({ id: "x", startup: 5, cancels: [{ from: 1, to: 2, into: 0 }] }));
  assert.throws(() => defineAbility({ id: "x" }));
});

test("phases and cancels", () => {
  const a = light();
  assert.equal(phaseAt(a, 0), Phase.Startup);
  assert.equal(phaseAt(a, 3), Phase.Active);
  assert.equal(phaseAt(a, 5), Phase.Recovery);
  assert.equal(phaseAt(a, 10), Phase.Done);
  assert.ok(canCancel(a, 6, false, Intent.Light));
  assert.ok(!canCancel(a, 6, false, Intent.Jump));
  assert.ok(canCancel(a, 6, true, Intent.Jump));
  assert.ok(!canCancel(a, 4, true, Intent.Light));
});

test("runner fires events once, finishes, respects hitstop", () => {
  const log = [];
  const r = new AbilityRunner({ event: (_, e) => log.push(e.key), finished: (a) => log.push("done:" + a.id) });
  assert.equal(r.tryStart(light(), Intent.Light, 0), StartResult.Started);
  for (let i = 0; i < 4; i++) r.tick();
  r.notifyHit(3);
  assert.equal(r.acceptedIntents, 0);
  for (let i = 0; i < 3; i++) r.tick();
  assert.equal(r.frame, 4);
  for (let i = 0; i < 6; i++) r.tick();
  assert.deepEqual(log, ["swing", "Blade", "done:L1"]);
  assert.equal(r.acceptedIntents, Mask.All);
});

test("runner mana, cooldown, busy", () => {
  const spell = defineAbility({ id: "S", startup: 2, recovery: 2, manaCost: 10, cooldownFrames: 30 });
  const mana = new ResourcePool(15);
  const r = new AbilityRunner();
  assert.equal(r.tryStart(spell, Intent.Spell1, 0, mana), StartResult.Started);
  assert.equal(mana.current, 5);
  assert.equal(r.tryStart(light(), Intent.Light, 0), StartResult.Busy);
  for (let i = 0; i < 4; i++) r.tick();
  assert.equal(r.tryStart(spell, Intent.Spell1, 10, mana), StartResult.OnCooldown);
  assert.equal(r.tryStart(spell, Intent.Spell1, 30, mana), StartResult.NotEnoughMana);
});

test("handler replacing the ability mid-event stops old events", () => {
  const other = defineAbility({ id: "B", startup: 3 });
  const a = defineAbility({ id: "A", startup: 3, events: [{ frame: 0, type: 0, key: "x" }, { frame: 0, type: 0, key: "y" }] });
  const seen = [];
  const r = new AbilityRunner({ event: (_, e) => { seen.push(e.key); r.interrupt(); r.tryStart(other, 0, 0); } });
  r.tryStart(a, 0, 0);
  r.tick();
  assert.deepEqual(seen, ["x"]);
  assert.equal(r.current.id, "B");
  assert.equal(r.frame, 0);
});

test("combo graph routes by node, globals, entries and context", () => {
  let ctx = MoveContext.Grounded;
  const L1 = light("L1"), L2 = light("L2"), Air = light("Air"), Dash = light("Dash"), Dodge = defineAbility({ id: "Dodge", startup: 0, active: 4, recovery: 2 });
  const g = new ComboGraph(() => ctx);
  g.addEntry(Intent.Light, Dash, MoveContext.Grounded | MoveContext.AfterDash)
    .addEntry(Intent.Light, L1, MoveContext.Grounded)
    .addEntry(Intent.Light, Air, MoveContext.Airborne)
    .addEdge(L1, Intent.Light, L2)
    .addGlobal(Intent.Dodge, Dodge);
  const runner = new AbilityRunner();
  const c = new AbilityController(runner, new InputBuffer(), null, g);

  c.press(Intent.Light, 0); c.tick(0);
  assert.equal(runner.current.id, "L1");
  c.press(Intent.Light, 1);
  for (let f = 1; f <= 6; f++) c.tick(f);
  assert.equal(runner.current.id, "L2", "buffered press chains in cancel window");
  assert.equal(g.currentNodeId, "L2");

  c.press(Intent.Dodge, 7);
  for (let f = 7; f <= 12; f++) c.tick(f);
  assert.equal(runner.current.id, "Dodge");
  while (runner.isRunning) c.tick(100);

  ctx = MoveContext.Airborne;
  c.press(Intent.Light, 200); c.tick(200);
  assert.equal(runner.current.id, "Air");
  while (runner.isRunning) c.tick(300);

  ctx = MoveContext.Grounded | MoveContext.AfterDash;
  c.press(Intent.Light, 400); c.tick(400);
  assert.equal(runner.current.id, "Dash");
});

test("controller delays buffer during hitstop and honors lock", () => {
  const runner = new AbilityRunner();
  const L1 = light("L1"), L2 = light("L2");
  const g = new ComboGraph(() => MoveContext.Grounded).addEntry(Intent.Light, L1, MoveContext.Grounded).addEdge(L1, Intent.Light, L2);
  const c = new AbilityController(runner, new InputBuffer(), null, g);
  c.press(Intent.Light, 0); c.tick(0);
  for (let f = 1; f <= 3; f++) c.tick(f);
  runner.notifyHit(20);
  c.press(Intent.Light, 4);
  for (let f = 4; f < 24; f++) c.tick(f);
  for (let f = 24; f < 28; f++) c.tick(f);
  assert.equal(runner.current.id, "L2", "press survived 20 frames of hitstop");

  const r2 = new AbilityRunner();
  const c2 = new AbilityController(r2, new InputBuffer(), null);
  c2.bind(Intent.Light, L1);
  c2.locked = true;
  c2.press(Intent.Light, 0); c2.tick(0);
  assert.equal(r2.isRunning, false);
  assert.throws(() => new AbilityController(r2, new InputBuffer(), null, g).bind(Intent.Light, L1));
});

test("startDirect for AI", () => {
  const r = new AbilityRunner();
  const c = new AbilityController(r, new InputBuffer());
  assert.equal(c.startDirect(light(), 0), StartResult.Started);
  assert.equal(c.startDirect(light(), 0), StartResult.Busy);
});

test("override mask lets a global cut through a running move", () => {
  let ctx = MoveContext.Grounded;
  const Dodge = defineAbility({ id: "Dodge", startup: 0, active: 12, recovery: 18 });
  const Counter = defineAbility({ id: "Counter", startup: 4, active: 4, recovery: 10 });
  const g = new ComboGraph(() => ctx).addEntry(Intent.Dodge, Dodge).addGlobal(Intent.Light, Counter, MoveContext.AfterParry);
  const runner = new AbilityRunner();
  const c = new AbilityController(runner, new InputBuffer(), null, g);
  c.press(Intent.Dodge, 0); c.tick(0);
  c.press(Intent.Light, 2); c.tick(2);
  assert.equal(runner.current.id, "Dodge", "no counter without the window");
  ctx |= MoveContext.AfterParry;
  c.overrideMask = mask(Intent.Light);
  c.press(Intent.Light, 3); c.tick(3);
  assert.equal(runner.current.id, "Counter");
});

test("priority routes beat node edges only when their context holds", () => {
  let ctx = MoveContext.Grounded;
  const L1 = defineAbility({ id: "L1", startup: 3, active: 2, recovery: 5, cancels: [{ from: 5, to: 9, into: mask(Intent.Heavy) }] });
  const Launcher = light("Launcher"), Finisher = light("Finisher");
  const g = new ComboGraph(() => ctx)
    .addEntry(Intent.Light, L1, MoveContext.Grounded)
    .addEdge(L1, Intent.Heavy, Launcher)
    .addPriority(Intent.Heavy, Finisher, MoveContext.TargetStaggered);
  const run = (expect) => {
    const runner = new AbilityRunner();
    const c = new AbilityController(runner, new InputBuffer(), null, g);
    c.press(Intent.Light, 0); c.tick(0);
    for (let f = 1; f < 5; f++) c.tick(f);
    c.press(Intent.Heavy, 5); c.tick(5);
    assert.equal(runner.current.id, expect);
  };
  run("Launcher");
  ctx |= MoveContext.TargetStaggered;
  run("Finisher");
});
