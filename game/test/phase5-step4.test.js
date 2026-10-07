import { test } from "node:test";
import assert from "node:assert/strict";
import { FlagStore } from "../src/core/flags.js";
import { Inventory } from "../src/core/inventory.js";
import { Crafting, temperedMods } from "../src/core/crafting.js";
import { HQ, TEMPER, MATERIALS, DROPS } from "../src/data/crafting.js";
import { ENEMIES } from "../src/data/enemies.js";
import { ZONES } from "../src/data/zones.js";
import { World } from "../src/sim/world.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript } from "../src/core/script.js";

test("every regular foe drops a material; the counts live in flags (so they save)", () => {
  for (const kind of Object.keys(ENEMIES)) if (kind !== "dummy") assert.ok(DROPS[kind] && MATERIALS[DROPS[kind][0]], `${kind} drops something`);
  const f = new FlagStore(), c = new Crafting(f, new Inventory());
  assert.deepEqual(c.drop("hound", () => 0.9), [{ id: "hide", n: 1 }]);
  assert.deepEqual(c.drop("hound", () => 0.1), [{ id: "hide", n: 2 }]);
  assert.equal(f.get("MAT_HIDE"), 3);
  assert.deepEqual(c.drop("nobody"), []);
});

test("HQ rooms need the squad's Merit (never spent), Marks and materials", () => {
  const f = new FlagStore(), inv = new Inventory({ marks: 100 }), c = new Crafting(f, inv);
  assert.equal(c.buildBlocker("kitchen"), "needs 10 Merit");
  f.set("MERIT", 12);
  assert.equal(c.buildBlocker("kitchen"), "materials");
  c.addMat("hide", 2);
  assert.ok(c.build("kitchen"));
  assert.equal(inv.marks, 100 - HQ.kitchen.marks); assert.equal(c.count("hide"), 0); assert.equal(f.get("MERIT"), 12);
  assert.equal(c.buildBlocker("kitchen"), "built");
  // The kitchen's meal: once a day, a buff until midnight.
  assert.ok(c.eat(3)); assert.equal(c.eat(3), false);
  assert.deepEqual(c.mods(3), { health: 20, attack: 0.05 }); assert.deepEqual(c.mods(4), {});
});

test("tempering: +1 anywhere, +2 needs the Forge; tempered gear changes your stats", () => {
  const f = new FlagStore(), inv = new Inventory({ marks: 500 }), c = new Crafting(f, inv);
  assert.equal(c.temperBlocker("squireBlade"), "materials");
  c.addMat("plate", 5); c.addMat("gear", 2);
  const before = inv.mods.attack;
  assert.ok(c.temper("squireBlade"));
  assert.ok(Math.abs(inv.mods.attack - before - TEMPER.weapon.per.attack) < 1e-9);
  assert.equal(c.temperBlocker("squireBlade"), "needs the Forge");
  f.set("HQ_FORGE", 1);
  assert.ok(c.temper("squireBlade"));
  assert.equal(c.temperBlocker("squireBlade"), "fully tempered");
  // Charms grow their own effect; the level saves with the bag.
  assert.ok(Math.abs(temperedMods("brassBell", 1).surge - 0.26) < 1e-9);
  const back = new Inventory(JSON.parse(JSON.stringify(inv.toJSON())));
  assert.equal(back.temperOf("squireBlade"), 2);
});

test("the Lighthouse has the squad board, the workbench and the meal table; the library speeds up mastery", () => {
  const ids = ZONES.lighthouse.pickups.map((p) => p.id);
  for (const id of ["squadBoard", "workbench", "meal"]) assert.ok(ids.includes(id));
  assert.ok(parseScript(WORLD_SCRIPT, "w").W_Meal);
  const w = new World({ seed: 1, pageXpBonus: 0.5 }); assert.equal(w.pageXpMult, 1.5);
});
