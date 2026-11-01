import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { HASK_TUNING } from "../src/data/hask.js";
import { EPISODE_4_STORY } from "../src/data/story/ep4.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const until = (w, pred, max, log = []) => { for (let i = 0; i < max; i++) { if (pred()) return log; w.step(); log.push(...w.drainEvents()); } assert.fail("condition never held"); };
const bog = (o = {}) => { const w = new World({ seed: 7, ...o }); w.spawnWave(["hask"]); w.drainEvents(); const h = w.boss; run(w, 1); return { w, h, c: h.boss }; };
const R = HASK_TUNING.reeds, F = HASK_TUNING.fort;
const lanterns = (w) => w.fighters.filter((f) => f.kind === "fenLantern");
const logs = (w) => w.fighters.filter((f) => f.kind === "swampLog");

test("Hask's submerge points (§16 B2): three reed beds round the bog, a fen lantern on each one's edge", () => {
  const w = new World({ seed: 7 }); w.spawnWave(["hask"]); w.drainEvents();
  const l = run(w, 1), ev = l.find((e) => e.type === "reedBeds");
  assert.equal(ev?.beds.length, 3);
  assert.equal(lanterns(w).length, 3);
  for (const b of ev.beds) assert.ok(Math.abs(Math.hypot(b.lantern.x - b.x, b.lantern.z - b.z) - (b.r + 0.3)) < 0.01, "on the bed's edge");
  // To one side: never in the line between Rook's corner and where it starts.
  const h = w.boss;
  for (const f of lanterns(w)) assert.ok(Math.abs(f.pos.x - h.pos.x) > 1 || Math.abs(f.pos.z - h.pos.z) > R.r, "out of the opening line");
  // The squad leaves them to you, and your aim never drifts onto one.
  assert.ok(lanterns(w).every((f) => f.traits.prop && f.traits.object));
  assert.match(src("sim/world.js"), /e\.traits\.dummy \|\| e\.traits\.prop\) continue/);
  w.player.pos.x = lanterns(w)[0].pos.x; w.player.pos.z = lanterns(w)[0].pos.z - 1;
  assert.notEqual(w.nearestEnemy(30)?.kind, "fenLantern");
});

test("It can only go under in a reed bed: out of one, it wades over first (and it's touchable while it does)", () => {
  const { w, h, c } = bog();
  h.pos.x = h.prev.x = 0; h.pos.z = h.prev.z = 0; // the middle of the bog, away from every bed
  c.timer = 1;
  const log = until(w, () => h.submerged, 400);
  const wade = log.find((e) => e.type === "wading");
  assert.ok(wade, "it makes for the reeds");
  assert.ok(log.findIndex((e) => e.type === "wading") < log.findIndex((e) => e.type === "submerge"));
  const bed = c.beds[wade.bed.i];
  assert.ok(Math.hypot(h.pos.x - bed.x, h.pos.z - bed.z) <= bed.r, "it went under in the bed");
});

test("Knock a lantern down and its reeds burn: scorching whoever stands in them, and that bed's no use to it again", () => {
  const { w, h, c } = bog();
  const b = c.beds[1];
  b.lantern.combatant.health.set(0);
  const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "reedsBurn" && e.bed.i === 1));
  const p = w.player; p.pos.x = p.prev.x = b.x; p.pos.z = p.prev.z = b.z;
  run(w, 12);
  assert.ok(p.tags.has("SCORCHED"), "standing in burning reeds");
  // It never makes for a burnt bed.
  h.pos.x = h.prev.x = b.x; h.pos.z = h.prev.z = b.z; c.timer = 1;
  const log = run(w, 2);
  const wade = log.find((e) => e.type === "wading");
  assert.ok(!wade || wade.bed.i !== 1);
  assert.ok(run(w, R.burnFrames).some((e) => e.type === "reedsOut"), "the fire burns itself out");
  // Every bed burnt: nowhere to dive. It fans mud from where it stands instead.
  for (const x of c.beds) x.lantern.combatant.health.set(0);
  run(w, 2); c.state = "surface"; c.timer = 1;
  const l2 = run(w, 300);
  assert.ok(l2.some((e) => e.type === "noReeds"));
  assert.ok(!l2.some((e) => e.type === "submerge"));
});

test("Catch it going under and burn the bed: the fire flushes it out (uprooted, staggered)", () => {
  const { w, h, c } = bog();
  c.timer = 1;
  until(w, () => c.state === "diving", 300);
  c.diveBed.lantern.combatant.health.set(0);
  const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "flushed") && l.some((e) => e.type === "uprooted"));
  assert.ok(!h.submerged && h.combatant.isStaggered);
});

test("P2's barricade: the Roar drags log piles up round it; while enough stand it holds its ground and lobs mud through the gaps", () => {
  const { w, h, c } = bog({ companions: true });
  h.combatant.health.set(h.combatant.health.max * 0.6);
  const log = until(w, () => c.fort, 300);
  const rise = log.find((e) => e.type === "fortRise");
  assert.equal(rise.logs.length, F.logs);
  assert.equal(logs(w).length, F.logs);
  for (const l of logs(w)) assert.ok(Math.abs(Math.hypot(l.pos.x - c.fort.center.x, l.pos.z - c.fort.center.z) - F.r) < 1.2, "a ring round it");
  for (const l of logs(w)) for (const f of lanterns(w)) assert.ok(Math.hypot(l.pos.x - f.pos.x, l.pos.z - f.pos.z) > 1.0, "never on a lantern");
  // Rook's wind thuds into the logs.
  assert.ok(logs(w).every((l) => l.team === h.team), "the logs are its side: your spells hit them; its mud goes through");
  // It holds its ground: no dives, mud through the gaps.
  const l2 = run(w, 600);
  assert.ok(!l2.some((e) => e.type === "submerge" || e.type === "wading"), "behind its logs it doesn't dive");
  assert.ok(l2.filter((e) => e.type === "fortVolley").length >= 2);
  assert.ok(Math.hypot(h.pos.x - c.fort.center.x, h.pos.z - c.fort.center.z) <= F.r - 1.2 + 0.05, "it stays inside");
  // Break enough piles and out it comes, making for the reeds.
  for (const l of logs(w).slice(0, F.logs - F.holds + 1)) l.combatant.health.set(0);
  const l3 = run(w, 600); // (its dive clock only runs between attacks)
  assert.ok(l3.some((e) => e.type === "fortBroken"));
  assert.ok(l3.some((e) => e.type === "wading" || e.type === "submerge"), "back to the bog");
});

test("P3 drains the bog out from under the logs; and when it falls, its lanterns and logs go with it so the fight can end", () => {
  const { w, h, c } = bog();
  h.combatant.health.set(h.combatant.health.max * 0.6);
  until(w, () => c.fort, 300);
  h.combatant.health.set(h.combatant.health.max * 0.3);
  const l = run(w, 3);
  assert.ok(l.some((e) => e.type === "fortSink"));
  assert.ok(logs(w).every((x) => !x.alive));
  h.combatant.takeDamage(1e6);
  for (const e of w.liveEnemies) if (e.kind === "hound") e.combatant.health.set(0); // (the pack it called)
  const end = run(w, 400);
  assert.ok(lanterns(w).every((x) => !x.alive));
  assert.ok(end.some((e) => e.type === "waveClear"), "nothing left standing holds the fight open");
});

test("Ep 4 tells you so (the wading and barricade hints), and the bog draws it all", () => {
  const b = EPISODE_4_STORY.beats.find((x) => x.id === "hask");
  assert.match(b.eventHints.wading, /lantern/);
  assert.match(b.eventHints.fortRise, /gap/);
  const main = src("main.js"), objs = src("runtime/objects.js"), rig = src("runtime/rig.js");
  for (const ev of ["reedBeds", "reedsBurn", "reedsOut", "flushed", "noReeds", "fortRise", "fortBroken", "wading"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
  assert.match(main, /reedFx\.clear\(\)/);
  for (const s of ["fenLantern", "logs"]) assert.match(objs, new RegExp(`case "${s}"`));
  assert.match(rig, /fenLantern: \{ form: "object"/);
  assert.match(rig, /swampLog: \{ form: "object", shape: "logs"/);
});
