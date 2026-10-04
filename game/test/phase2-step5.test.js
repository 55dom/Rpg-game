import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World } from "../src/sim/world.js";
import { ENEMIES } from "../src/data/enemies.js";
import { PAGES } from "../src/data/pages.js";

const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const solo = () => { const w = new World({ seed: 11 }); w.drainEvents(); return w; };
const place = (w, kind, x, z, hp = 900) => { const e = w.spawnEnemy(kind, x, z); e.brain = null; e.combatant.health.max = e.combatant.health.current = hp; e.yaw = Math.PI; w.drainEvents(); return e; };

test("Wind Wall swallows bolts and shoves enemies back", () => {
  const w = solo(); const p = w.player; p.mana.fill();
  const c = place(w, "cantor", 0, 8); c.target = p;
  const a = place(w, "acolyte", 0, -1.4);
  const log = [];
  w.press(Intent.Spell4); run(w, 30, log);
  assert.ok(log.some((x) => x.type === "windWall"));
  assert.ok(a.pos.z > -0.6, `shoved from -1.4 to ${a.pos.z.toFixed(2)}`);
  w.fireProjectile(c, ENEMIES.cantor.abilities.SoundBolt, "Bolt", 13);
  run(w, 60, log);
  assert.ok(log.some((x) => x.type === "deflect"), "bolt swallowed");
  assert.equal(p.combatant.health.current, p.combatant.health.max);
});

test("pages gain XP from spell hits, become ready, and evolve into the chosen branch", () => {
  const w = solo(); const p = w.player;
  const e = place(w, "acolyte", 0, -2.0, 5000);
  const log = [];
  for (let i = 0; i < PAGES.Spell1.hitsToEvolve; i++) {
    e.pos = { x: 0, y: 0, z: 0 }; e.grounded = true; e.vel.y = 0; e.combatant.reset(); // Gale launches it; put it back
    p.pos = { x: 0, y: 0, z: -4 }; p.yaw = 0;
    p.mana.fill(); w.press(Intent.Spell1); run(w, 50, log);
  }
  assert.ok(w.pages.Spell1.ready && log.some((x) => x.type === "pageReady" && x.slot === "Spell1"));
  assert.equal(w.evolvePage("Spell1", "A"), true);
  assert.equal(w.evolvePage("Spell1", "B"), false, "a page evolves once");
  run(w, 100); e.pos = { x: 0, y: 0, z: 0 }; e.grounded = true; e.vel.y = 0; p.pos = { x: 0, y: 0, z: -4 }; p.yaw = 0;
  const log2 = []; p.mana.fill(); w.press(Intent.Spell1); run(w, 4, log2);
  assert.equal(p.current?.id, "TwinCutter", "the button now casts the evolved spell");
  run(w, 40, log2);
  assert.equal(log2.filter((x) => x.type === "hit" && x.ability.id === "TwinCutter").length, 2, "two cutters");
});

test("Mirror Gale throws a bolt back at the Cantor", () => {
  const w = solo(); const p = w.player;
  w.pages.Spell4.ready = true; w.evolvePage("Spell4", "A");
  const c = place(w, "cantor", 0, 6, 500); c.target = p;
  p.mana.fill(); w.press(Intent.Spell4); run(w, 10);
  w.fireProjectile(c, ENEMIES.cantor.abilities.SoundBolt, "Bolt", 13);
  const log = []; run(w, 120, log);
  assert.ok(log.some((x) => x.type === "reflect"));
  assert.ok(log.some((x) => x.type === "hit" && x.defender === c), "the singer is hit by its own bolt");
});

test("Downdraft launches whoever touches the wall; evolved pages keep combos working", () => {
  const w = solo(); const p = w.player;
  w.pages.Spell4.ready = true; w.evolvePage("Spell4", "B");
  const a = place(w, "acolyte", 0, -1.6);
  p.mana.fill(); w.press(Intent.Spell4); run(w, 12);
  assert.ok(!a.grounded, "launched");
  // Evolving a page rebuilds the graph: the ground string still works.
  run(w, 120);
  a.pos = { x: 0, y: 0, z: -2.4 }; a.grounded = true; a.vel.y = 0;
  const log = []; for (let i = 0; i < 4; i++) { w.press(Intent.Light); run(w, 12, log); }
  assert.deepEqual(log.filter((x) => x.type === "started" && x.fighter === p).map((x) => x.ability.id), ["L1", "L2", "L3", "L4"]);
});

test("every evolution branch is a working ability", () => {
  for (const [slot, page] of Object.entries(PAGES)) {
    for (const b of page.branches) {
      const w = solo(); const p = w.player;
      w.pages[slot].ready = true; w.evolvePage(slot, b.key);
      const e = place(w, "acolyte", 0, -1.6, 900);
      p.mana.fill();
      w.press(Intent[slot]); const log = []; run(w, 60, log);
      assert.ok(log.some((x) => x.type === "started" && x.ability.id === b.ability.id), `${slot}/${b.key} started`);
      assert.ok(log.some((x) => x.type === "hit" && x.defender === e) || log.some((x) => x.type === "windWall"), `${b.name} connects`);
    }
  }
});

import { EPISODE_4, runRank } from "../src/data/run.js";

/** A test-only autopilot: Rook simply wins each fight (the AI plays everyone else). */
const autoWin = (w) => { for (const e of w.liveEnemies) e.combatant.takeDamage(1e6); };

test("the Episode 4 run walks all seven encounters, rests between, and ends in results", () => {
  const w = new World({ seed: 21, companions: true });
  w.startRun(EPISODE_4);
  const log = [];
  let guard = 0;
  while (!w.run.finished && guard++ < 40000) {
    w.step(); log.push(...w.drainEvents());
    if (w.run.state === "fighting" && w.liveEnemies.length && w.frame % 120 === 0) autoWin(w);
  }
  const stages = log.filter((x) => x.type === "runStage").map((x) => x.encounter.title);
  assert.deepEqual(stages, EPISODE_4.encounters.map((e) => e.title));
  assert.equal(log.filter((x) => x.type === "runCleared").length, 6, "six clears before the boss");
  assert.ok(log.some((x) => x.type === "bossIntro"));
  const done = log.find((x) => x.type === "runComplete");
  assert.ok(done && ["S", "A", "B", "C"].includes(done.rank));
  assert.ok(log.filter((x) => x.type === "runLine").length >= 16, "squad lines every stage");
});

test("falling mid-encounter retries that encounter, keeping evolved pages", () => {
  const w = new World({ seed: 22, companions: true });
  w.startRun(EPISODE_4);
  const log = [];
  while (w.run.state !== "fighting") { w.step(); log.push(...w.drainEvents()); }
  w.pages.Spell1.ready = true; w.evolvePage("Spell1", "B");
  w.player.combatant.takeDamage(1e6);
  w.emit({ type: "playerDown" });
  for (let i = 0; i < 200; i++) { w.step(); log.push(...w.drainEvents()); }
  assert.ok(log.some((x) => x.type === "runRetry" && x.index === 0));
  assert.ok(w.player.alive && w.liveEnemies.length === 3);
  assert.equal(w.loadout.Spell1.id, "GaleLance");
  assert.equal(w.run.stats.retries, 1);
});

test("rank rewards clean, fast, stylish runs", () => {
  assert.equal(runRank({ retries: 0, damageTaken: 0, frames: 60 * 480, maxCombo: 45, reactions: 10 }), "S");
  assert.equal(runRank({ retries: 3, damageTaken: 1600, frames: 60 * 1200, maxCombo: 5, reactions: 0 }), "C");
});
