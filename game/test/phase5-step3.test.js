import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { LOOKS } from "../src/runtime/rig.js";
import { sheetFor } from "../src/data/sheets.js";
import { SEVERIN_KIT, SEVERIN_KIT_STATS } from "../src/data/severinKit.js";

const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const dummyFoe = (w, dz = 1.6) => { const e = w.spawnEnemy("acolyte", w.player.pos.x, w.player.pos.z + dz); e.brain = null; e.combatant.health.max = e.combatant.health.current = 5000; w.drainEvents(); return e; };

test("tag-swap: Severin comes in with his own kit, health and mana; Rook's are kept on the bench", () => {
  const w = new World({ seed: 3, companions: false, party: ["severin"] }); w.drainEvents();
  const p = w.player;
  assert.equal(w.bench, "severin");
  p.combatant.health.set(150); p.mana.set(40);
  assert.ok(w.tagSwap());
  const log = w.drainEvents();
  assert.ok(log.some((e) => e.type === "tagSwap" && e.to === "severin"));
  assert.equal(p.kind, "severinAlly"); assert.equal(w.active, "severin");
  assert.equal(p.combatant.health.max, SEVERIN_KIT_STATS.maxHealth); assert.equal(p.combatant.health.current, SEVERIN_KIT_STATS.maxHealth);
  assert.equal(w.altSpells.Spell1, "STAR FAN");
  assert.equal(w.tagSwap(), false, "a short cooldown between swaps");
  run(w, 160);
  assert.ok(w.tagSwap(), "and back");
  assert.equal(p.kind, "player"); assert.ok(p.combatant.health.current >= 150 && p.combatant.health.current < 156, "Rook rested a little on the bench"); assert.equal(Math.round(p.mana.current), 40);
  assert.ok(LOOKS.severinAlly && sheetFor("severinAlly"));
});

test("Severin fights with a rapier: his light string thrusts, and Star Fan throws three needles", () => {
  const w = new World({ seed: 3, companions: false, party: ["severin"] }); w.drainEvents();
  w.tagSwap(); w.drainEvents(); run(w, 30);
  const p = w.player; p.pos.x = 0; p.pos.z = 0; p.yaw = 0; dummyFoe(w);
  const log = [];
  for (let i = 0; i < 4; i++) { w.press(Intent.Light); run(w, 14, log); }
  const ids = log.filter((e) => e.type === "hit").map((e) => e.ability.id);
  assert.ok(ids.includes("Thrust1") && ids.includes("Thrust2"), ids.join(","));
  run(w, 60); p.mana.fill();
  const l2 = []; w.press(Intent.Spell1); run(w, 20, l2);
  assert.equal(l2.filter((e) => e.type === "projectile").length, 3);
  assert.equal(SEVERIN_KIT.L1.id, "Thrust1");
});

test("the tag-in strike knocks back anyone close; if the one on the field falls, the partner tags in", () => {
  const w = new World({ seed: 3, companions: false, party: ["severin"] }); w.drainEvents();
  const e = dummyFoe(w, 1.2);
  w.tagSwap(); const log = w.drainEvents();
  assert.ok(log.some((x) => x.type === "hit" && x.ability.id === "TagStrike" && x.defender === e));
  run(w, 10);
  // Severin falls: Rook comes back in instead of a game over.
  const p = w.player; p.combatant.invulnerableFrames = 0;
  p.combatant.health.set(1);
  const foe = w.spawnEnemy("acolyte", 0, p.pos.z + 1.2); w.drainEvents();
  w._resolve(foe, p, { spec: { damage: 50, posture: 0, hitstop: 1, hitstun: 1, knockback: 0, launch: 0, pull: 0 }, ability: { id: "x", tags: [], manaCost: 0 }, hitSet: new Set(), origin: foe.pos });
  const l2 = run(w, 3);
  assert.ok(!l2.some((x) => x.type === "playerDown"));
  assert.ok(l2.some((x) => x.type === "tagSwap" && x.forced && x.to === "player"));
  assert.ok(p.alive); assert.equal(w.bench, null, "Severin is down: nobody left to tag");
});

test("without a partner there's nothing to swap to", () => {
  const w = new World({ seed: 3 }); w.drainEvents();
  assert.equal(w.bench, null); assert.equal(w.tagSwap(), false);
});
