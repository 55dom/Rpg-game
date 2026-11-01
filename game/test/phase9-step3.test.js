import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { Siege } from "../src/sim/siege.js";
import { BLOOM_TUNING as T } from "../src/data/bloom.js";
import { EPISODE_18 } from "../src/data/story/ep18.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const beat = EPISODE_18.beats.find((x) => x.id === "bloom");
const bloom = () => {
  const w = new World({ seed: 9, ...beat.world, companions: true }), s = new Siege(w, beat.siege).start(); w.drainEvents();
  const b = w.fighters.find((f) => f.kind === "hollowBloom");
  w.player.combatant.health.max = w.player.combatant.health.current = 5000;
  return { w, s, b, c: b.boss };
};
const skipTo = (c, frame) => { c.t = frame - 1; };

test("The Bloom's phases run on the clock it's held back against (§16 B7), not its health", () => {
  const { w, b, c } = bloom();
  assert.equal(c.constructor.name, "BloomController");
  b.combatant.health.set(b.combatant.health.max * 0.3);
  assert.ok(!run(w, 30).some((e) => e.type === "bloomPhase"), "hurting it doesn't hurry it");
  skipTo(c, T.phases.holes);
  assert.ok(run(w, 1).some((e) => e.type === "bloomPhase" && e.phase === 2));
  assert.ok(T.phases.pages < beat.siege.meter.seconds * 60, "every phase comes before it opens");
});

test("P2: a white ring where one of you stands, then a hole in the world", () => {
  const { w, c } = bloom();
  skipTo(c, T.phases.holes); c.holeTimer = 1;
  const l = run(w, 2);
  const warn = l.find((e) => e.type === "eraseWarn");
  assert.ok(warn, "the warning first");
  const l2 = run(w, T.holes.warn + 1);
  const open = l2.find((e) => e.type === "holeOpen");
  assert.ok(open && Math.hypot(open.hole.x - warn.at.x, open.hole.z - warn.at.z) < 0.01, "where it warned");
  assert.equal(w.holes.length, 1);
  // Never more than four at once: the oldest closes over.
  for (let i = 0; i < 5; i++) { c.holeTimer = 1; run(w, T.holes.warn + 2); }
  assert.ok(w.holes.length <= T.holes.max);
  // And they close on their own.
  assert.ok(run(w, T.holes.frames + 2).some((e) => e.type === "holeClose"));
});

test("Stand on the blank and it takes a bite out of you (never the last of it); a run carries you across; the squad steps round", () => {
  const { w, c } = bloom();
  const p = w.player;
  const h = { x: p.pos.x + 6, z: p.pos.z, r: T.holes.r, frames: 9999 };
  w.holes.push(h);
  p.pos.x = p.prev.x = h.x; p.pos.z = p.prev.z = h.z; p.combatant.invulnerableFrames = 0; p.grounded = true;
  assert.ok(!run(w, T.holes.grace - 3).some((e) => e.type === "erased"), "a few frames' grace");
  const hp = p.combatant.health.current;
  const l = run(w, 6);
  assert.ok(l.some((e) => e.type === "erased" && e.fighter === p));
  assert.equal(hp - p.combatant.health.current, Math.round(p.combatant.health.max * T.holes.bite));
  assert.ok(Math.hypot(p.pos.x - h.x, p.pos.z - h.z) >= h.r, "you come to on its edge");
  p.combatant.health.set(2); p.combatant.invulnerableFrames = 0; p.pos.x = p.prev.x = h.x; p.pos.z = p.prev.z = h.z;
  run(w, T.holes.grace + 2);
  assert.ok(p.alive && p.combatant.health.current >= 1, "never the last of your health");
  const ally = w.companions[0];
  ally.pos.x = ally.prev.x = h.x + 0.3; ally.pos.z = ally.prev.z = h.z;
  run(w, 1);
  assert.ok(Math.hypot(ally.pos.x - h.x, ally.pos.z - h.z) >= h.r, "the squad steps round the blank");
  void c;
});

test("P3: its petals close over you: for a few seconds it's everywhere and nowhere (untouchable), and a fire long ago stands round you", () => {
  const { w, b, c } = bloom();
  skipTo(c, T.phases.memory);
  const l = run(w, 1);
  assert.ok(l.some((e) => e.type === "memoryBegin"));
  assert.ok(c.untouchable && !c.brainActive);
  // A slash on it does nothing while you're inside.
  const p = w.player; p.pos.x = p.prev.x = b.pos.x; p.pos.z = p.prev.z = b.pos.z - 2.4; p.yaw = 0;
  const hp = b.combatant.health.current;
  w.press(Intent.Light);
  const l2 = run(w, 14);
  assert.ok(!l2.some((e) => e.type === "hit" && e.defender === b));
  assert.equal(b.combatant.health.current, hp);
  assert.ok(run(w, T.memory.frames).some((e) => e.type === "memoryEnd"));
  assert.ok(!c.untouchable);
  const marks = beat.siege.marks.map((m) => m.frame);
  assert.ok(marks.some((f) => f > T.phases.memory && f < T.phases.memory + T.memory.frames), "someone says so inside it");
  assert.ok(beat.siege.marks.some((m) => m.say[0] === "Rook" && /been here/.test(m.say[1])));
});

test("P4: it erases your pages, one spell at a time, for a few seconds; a blank page won't cast", () => {
  const { w, c } = bloom();
  skipTo(c, T.phases.pages); c.pageTimer = 1;
  const l = run(w, 2);
  const er = l.find((e) => e.type === "pageErased");
  assert.ok(er && w.pageLocks[er.slot] > 0);
  w.player.mana.fill();
  const n = Number(er.slot.slice(-1));
  w.press(Intent.Spell1 + n - 1);
  assert.ok(w.drainEvents().some((e) => e.type === "pageBlank"));
  assert.ok(run(w, T.pages.frames + 2).some((e) => e.type === "pageRestored" && e.slot === er.slot), "written back");
  assert.ok(!(w.pageLocks[er.slot] > 0));
});

test("When the Bloom's fight ends (or you try again), the ground and the pages come back", () => {
  const { w, s, c } = bloom();
  skipTo(c, T.phases.pages); c.pageTimer = 1; c.holeTimer = 1;
  run(w, T.holes.warn + 3);
  assert.ok(w.holes.length && Object.keys(w.pageLocks).length);
  w.resetPlayer();
  assert.ok(w.drainEvents().some((e) => e.type === "erasuresClear"));
  assert.equal(w.holes.length, 0);
  c.holeTimer = 1; run(w, T.holes.warn + 3);
  s.end();
  assert.equal(w.holes.length, 0);
  assert.match(src("sim/siege.js"), /clearErasures/);
});

test("Ep 18 tells you (low hints, under the flower), and the fight draws it all", () => {
  assert.match(beat.eventHints.holeOpen, /blank/);
  assert.match(beat.eventHints.pageErased, /pages/);
  assert.ok(beat.lowHints);
  assert.match(src("runtime/story.js"), /this\._showHint\(hint, f\.beat\.lowHints\)/);
  const main = src("main.js");
  for (const ev of ["bloomPhase", "eraseWarn", "holeOpen", "holeClose", "erased", "memoryBegin", "memoryEnd", "pageErased", "pageRestored", "pageBlank", "erasuresClear"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
  assert.match(src("runtime/hud.js"), /pageLocks\?\.\[sp\.slot\] > 0 \? " erased"/);
  const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");
  assert.match(tpl, /\.spell\.erased \{/); assert.match(tpl, /\.memory \.stage \{/);
});
