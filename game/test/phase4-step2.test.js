import { test } from "node:test";
import assert from "node:assert/strict";
import { Inventory } from "../src/core/inventory.js";
import { ITEMS, SHOPS, BOUNTIES } from "../src/data/items.js";
import { ENEMIES } from "../src/data/enemies.js";
import { World } from "../src/sim/world.js";
import { ZONES } from "../src/data/zones.js";
import { hitSpec } from "../src/core/combat.js";

test("inventory: starter gear, buying needs marks and is one-time, round trip through JSON", () => {
  const inv = new Inventory();
  assert.equal(inv.equipped.weapon, "squireBlade");
  assert.equal(inv.buy("thornwickSaber").reason, "marks");
  inv.earn(200);
  assert.ok(inv.buy("thornwickSaber").ok);
  assert.equal(inv.marks, 230 - ITEMS.thornwickSaber.price);
  assert.equal(inv.buy("thornwickSaber").reason, "owned");
  const back = new Inventory(JSON.parse(JSON.stringify(inv)));
  assert.ok(back.owned.has("thornwickSaber"));
  assert.equal(back.marks, inv.marks);
});

test("equip: kinds must match, charms can't be doubled, mods add up and defense caps at half", () => {
  const inv = new Inventory({ marks: 9999 });
  for (const id of ["thornwickSaber", "wardenMantle", "whetCharm", "fenReed"]) inv.buy(id);
  assert.ok(!inv.equip("weapon", "wardenMantle"), "a cloak isn't a weapon");
  assert.ok(!inv.equip("cloak", "riderCoat"), "not owned");
  assert.ok(inv.equip("weapon", "thornwickSaber") && inv.equip("cloak", "wardenMantle"));
  assert.ok(inv.equip("charm1", "whetCharm") && inv.equip("charm2", "whetCharm"));
  assert.equal(inv.equipped.charm1, null, "moved, not doubled");
  inv.equip("charm1", "fenReed");
  const m = inv.mods;
  assert.ok(Math.abs(m.attack - 0.18) < 1e-9);
  assert.ok(Math.abs(m.defense - 0.18) < 1e-9);
  assert.equal(m.health, 20);
  assert.ok(new Inventory({ marks: 0 }).mods.defense === 0);
  // Saved equipment that isn't owned is ignored.
  assert.equal(new Inventory({ equipped: { weapon: "breakerEdge" } }).equipped.weapon, "squireBlade");
});

test("shops sell real items; every enemy has a bounty; a zone NPC opens the Lowmarket shop", () => {
  for (const shop of Object.values(SHOPS)) for (const id of shop.stock) assert.ok(ITEMS[id], id);
  for (const k of Object.keys(ENEMIES)) assert.ok(BOUNTIES[k] != null, `bounty for ${k}`);
  assert.ok(Object.values(ZONES).some((z) => z.cast.some((c) => c.shop === "lowmarket")));
});

test("equipment changes the fight: more health, harder hits, less damage taken", () => {
  const plain = new World({ seed: 2, companions: false });
  const geared = new World({ seed: 2, companions: false, mods: { health: 45, attack: 0.2, defense: 0.2 } });
  assert.equal(geared.player.combatant.health.max, plain.player.combatant.health.max + 45);
  const hit = (w, att, def) => {
    const before = def.combatant.health.current;
    w._resolve(att, def, { def: null, spec: hitSpec({ damage: 50, posture: 10, hitstop: 1, hitstun: 10, knockback: 0 }), ability: { id: "t", tags: [] }, hitSet: new Set(), origin: { x: 0, y: 1, z: 0 }, projectile: true });
    return before - def.combatant.health.current;
  };
  const e1 = plain.spawnEnemy("bulwark", 0, 2), e2 = geared.spawnEnemy("bulwark", 0, 2);
  e1.yaw = e2.yaw = 0; // facing away so the shield doesn't block
  assert.ok(hit(geared, geared.player, e2) > hit(plain, plain.player, e1));
  assert.ok(hit(geared, e2, geared.player) < hit(plain, e1, plain.player));
});
