import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World, Tuning } from "../src/sim/world.js";
import { ENEMIES, WAVES } from "../src/data/enemies.js";
import { ACOLYTE_ABILITIES } from "../src/data/acolyte.js";

const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const solo = (seed = 1) => { const w = new World({ seed }); w.drainEvents(); return w; };
const place = (w, kind, x, z, { brain = false, hp } = {}) => {
  const e = w.spawnEnemy(kind, x, z); if (!brain) e.brain = null; if (hp) e.combatant.health.max = e.combatant.health.current = hp;
  e.yaw = Math.atan2(w.player.pos.x - x, w.player.pos.z - z); w.drainEvents(); return e;
};
const types = (log) => log.map((x) => x.type);

test("five enemy types; spawnWave() walks the wave list", () => {
  assert.equal(Object.keys(ENEMIES).length, 5);
  const w = solo();
  for (let i = 0; i < WAVES.length; i++) {
    w.spawnWave(); const ev = w.drainEvents().find((x) => x.type === "wave");
    assert.deepEqual(ev.kinds, WAVES[i]);
    assert.deepEqual(w.enemies.map((e) => e.kind).sort(), [...WAVES[i]].sort());
  }
});

test("Fen Hound lunges across the gap", () => {
  const w = solo();
  const h = place(w, "hound", 0, 0.5, { brain: true });
  const log = []; run(w, 120, log);
  assert.ok(log.some((x) => x.type === "hit" && x.attacker === h && x.ability.id === "Lunge"), types(log).join());
});

test("Cantor bolts fly, hit, and freeze in a time stop", () => {
  const w = solo();
  const c = place(w, "cantor", 0, 6, { brain: true });
  const log = []; run(w, 150, log);
  assert.ok(log.some((x) => x.type === "projectile"));
  assert.ok(log.some((x) => x.type === "hit" && x.attacker === c && x.ability.id === "SoundBolt"), "a bolt landed");
  // Time stop freezes bolts mid-air.
  w.fireProjectile(c, ENEMIES.cantor.abilities.SoundBolt, "Bolt", 13);
  const p = w.projectiles.at(-1); const z = p.pos.z;
  w.stopFrames = 10; run(w, 5);
  assert.equal(p.pos.z, z);
});

test("Rook's sword deflects a bolt; parrying one doesn't stagger the distant singer", () => {
  const w = solo();
  const c = place(w, "cantor", 0, 8);
  c.target = w.player;
  w.fireProjectile(c, ENEMIES.cantor.abilities.SoundBolt, "Bolt", 13);
  const log = [];
  run(w, 38, log); // the bolt crosses most of the 11 m gap
  w.press(Intent.Light); run(w, 14, log);
  assert.ok(types(log).includes("deflect"), types(log).join());
  assert.equal(w.player.combatant.health.current, w.player.combatant.health.max);
  w.fireProjectile(c, ENEMIES.cantor.abilities.SoundBolt, "Bolt", 13);
  const log2 = []; run(w, 38, log2); w.press(Intent.Block); run(w, 16, log2);
  assert.ok(types(log2).includes("parry"), types(log2).join());
  assert.ok(!c.combatant.isStaggered, "the far-away singer is unaffected");
});

test("Hymn wards allies (super armor, less damage); wind Dispels it", () => {
  const w = solo();
  const c = place(w, "cantor", 3, 2);
  const a = place(w, "acolyte", 0, -2.2, { hp: 500 });
  c.controller.startDirect(ENEMIES.cantor.abilities.Hymn, w.frame);
  const log = []; run(w, 40, log);
  assert.ok(a.tags.has("WARDED") && types(log).includes("ward"));
  a.controller.startDirect(ACOLYTE_ABILITIES.Slash, w.frame);
  w.press(Intent.Light); run(w, 12, log);
  const hit = log.find((x) => x.type === "hit" && x.defender === a);
  assert.equal(hit.result.healthDamage, 12 * 0.7);
  assert.equal(a.current?.id, "Slash", "super armor: not interrupted");
  run(w, 40);
  w.press(Intent.Spell1); run(w, 20, log);
  assert.ok(log.some((x) => x.type === "reaction" && x.reaction.name === "Dispel"));
  assert.ok(!a.tags.has("WARDED"));
});

test("Bulwark: blocks from the front, not from behind; bound by thread it can't guard", () => {
  const w = solo();
  const b = place(w, "bulwark", 0, -2.2, { hp: 500 });
  const log = []; w.press(Intent.Light); run(w, 14, log);
  assert.ok(types(log).includes("block"), "front: blocked");
  b.yaw = 0; // turn its back to Rook
  const log2 = []; run(w, 30); w.press(Intent.Light); run(w, 14, log2);
  assert.ok(log2.some((x) => x.type === "hit" && x.defender === b), "behind: hit");
  b.yaw = Math.PI; b.tags.add("BOUND", 120);
  const log3 = []; run(w, 30); w.press(Intent.Light); run(w, 14, log3);
  assert.ok(log3.some((x) => x.type === "hit" && x.defender === b), "bound: hit");
});

test("Bog Beast: too heavy to launch until broken, armored attacks, unblockable slam", () => {
  const w = solo();
  const bb = place(w, "beast", 0, -2.0, { hp: 2000 });
  w.press(Intent.Light); run(w, 12); w.press(Intent.Light); run(w, 12); w.press(Intent.Heavy); run(w, 16);
  assert.ok(bb.grounded, "launcher can't lift it");
  bb.combatant.takePostureDamage(999);
  run(w, 30); w.press(Intent.Heavy); run(w, 16);
  assert.ok(!bb.grounded, "posture broken: up it goes");
  run(w, 200);
  bb.combatant.reset();
  bb.controller.startDirect(ENEMIES.beast.abilities.Swipe, w.frame);
  w.press(Intent.Light); run(w, 10);
  assert.equal(bb.current?.id, "Swipe", "hits don't interrupt its attacks");
  run(w, 60);
  w.player.holdBlock = true; w.press(Intent.Block); run(w, 30);
  bb.controller.startDirect(ENEMIES.beast.abilities.MudSlam, w.frame);
  const log = []; run(w, 45, log);
  assert.ok(log.some((x) => x.type === "hit" && x.defender === w.player && x.ability.id === "MudSlam"), "the slam goes through a block");
});

test("juggle decay: each air hit makes the target fall faster; resets on landing", () => {
  const w = solo();
  const e = place(w, "acolyte", 0, -2.4, { hp: 900 });
  w.press(Intent.Light); run(w, 12); w.press(Intent.Light); run(w, 12); w.press(Intent.Heavy); run(w, 14);
  w.press(Intent.Jump); run(w, 9);
  for (let i = 0; i < 3; i++) { w.press(Intent.Light); run(w, 11); }
  assert.ok(e.juggleHits >= 2, `air hits counted: ${e.juggleHits}`);
  run(w, 200);
  assert.ok(e.grounded && e.juggleHits === 0);
  assert.ok(Tuning.juggleDecay > 0 && Tuning.juggleDecayMax > 1);
});
