import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { EPISODE_18 } from "../src/data/story/ep18.js";
import { COMPANIONS } from "../src/data/companions.js";
import { THRESHOLD } from "../src/data/cal.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const beat = EPISODE_18.beats.find((x) => x.id === "bloom");
const bloomFight = () => {
  const w = new World({ seed: 9, ...beat.world }), s = new Siege(w, beat.siege).start(); w.drainEvents();
  const b = w.fighters.find((f) => f.kind === "hollowBloom"), cal = w.companions.find((c) => c.kind === "cal");
  w.player.combatant.health.max = w.player.combatant.health.current = 5000;
  return { w, s, b, cal };
};
const put = (f, x, z) => { f.pos.x = f.prev.x = x; f.pos.z = f.prev.z = z; f.pos.y = f.prev.y = 0; f.vel.x = f.vel.z = 0; f.knock.x = f.knock.z = 0; };

test("P1: Cal fights beside you at the Bloom (with Bas and Juno), on the party panel as the third, called with 3", () => {
  assert.deepEqual(beat.world.companions, ["bas", "juno", "cal"]);
  const { w, cal } = bloomFight();
  assert.ok(cal && !cal.guest && cal.assistAbility === THRESHOLD, "his Assist is his door");
  assert.equal(w.companions.filter((c) => !c.guest).indexOf(cal), 2);
  assert.match(src("runtime/controls.js"), /Digit3"\) this\.commands\.push\("assist:third"\)/);
  assert.match(src("runtime/hud.js"), /keyboard: \["1", "2", "3"\]/);
  const b = w.fighters.find((f) => f.kind === "hollowBloom"); put(w.player, b.pos.x, b.pos.z - 8);
  const r = w.callAssist("third");
  assert.ok(r.ok);
  const l = run(w, THRESHOLD.startup + 2);
  const door = l.find((e) => e.type === "threshold");
  assert.ok(door && door.fighter === cal, "3: Cal opens his door");
  const p = w.player, d = Math.hypot(door.zone.pos.x - p.pos.x, door.zone.pos.z - p.pos.z);
  assert.ok(Math.abs(d - 1.8) < 0.3, "in front of you, wherever he is");
  assert.ok(COMPANIONS.cal.supports().some((s) => s.ability === THRESHOLD && s.kind === "shield"), "and he opens it himself when something's about to land on you");
});

test("Threshold: nothing comes through the door: the Bloom's pulse doesn't reach you behind it, and its petals turn on it", () => {
  const { w, b, cal } = bloomFight();
  for (const f of w.fighters) if (f.kind === "shell") f.combatant.health.set(0);
  const p = w.player; put(p, b.pos.x, b.pos.z - 3.6); p.yaw = 0; p.combatant.invulnerableFrames = 0;
  for (const c of w.companions) put(c, b.pos.x + 12, b.pos.z - 12); // out of the way
  cal.target = b;
  const z = w.threshold(cal, THRESHOLD, 400);
  assert.ok(z.pos.z > p.pos.z && z.pos.z < b.pos.z, "between you and it");
  b.runner.interrupt(); b.controller.startDirect(b.abilities?.Pulse ?? b.brain.options.find((o) => o.ability.id === "Pulse").ability, w.frame);
  const hp = p.combatant.health.current;
  const l = run(w, 70);
  assert.ok(l.some((e) => e.type === "doorHeld" && e.defender === p), "the door holds");
  assert.ok(!l.some((e) => e.type === "hit" && e.defender === p && e.ability?.id === "Pulse"));
  assert.equal(p.combatant.health.current, hp);
  // A petal at you: it turns on the door.
  b.runner.interrupt(); b.target = p;
  w.fireProjectile(b, b.brain.options.find((o) => o.ability.id === "Petals").ability, "Petal", 11);
  const l2 = run(w, 30);
  assert.ok(l2.some((e) => e.type === "deflect" && e.by === cal), "turned on the door");
  // Its far side isn't covered: someone standing beside the Bloom still takes the pulse.
  assert.equal(w._doorBetween(b, { team: p.team, pos: { x: b.pos.x + 3, z: b.pos.z } }), null);
});

test("Its Final: when it opens, you and Cal hold it back: hold Guard and the gauge fills, let go and it slips; it can't be lost", () => {
  const { w, s, b } = bloomFight();
  assert.ok(beat.siege.hold && beat.siege.hold.frames >= 120);
  s.meter = 0.0001; s.cap = 0.0001;
  s.step(); const l = w.drainEvents();
  assert.ok(l.some((e) => e.type === "holdBegin") && !s.done, "it doesn't end: it opens, and you hold it");
  assert.ok(w.foesHeld && w.gauge.hold, "the Bloom and its shells hold still");
  assert.ok(s.drainLines().some(([who]) => who === "Cal"));
  const bx = b.pos.x; run(w, 30); assert.equal(b.pos.x, bx);
  const p = w.player;
  p.holdBlock = true; for (let i = 0; i < 100; i++) s.step();
  const at = w.gauge.value; assert.ok(at > 0.3 && w.gauge.held);
  p.holdBlock = false; for (let i = 0; i < 40; i++) s.step();
  assert.ok(w.gauge.value < at && w.gauge.value > 0, "let go: it slips back");
  for (let i = 0; i < 2000; i++) s.step();
  assert.ok(!s.done && w.gauge.value === 0, "and waits for you: there's no losing it");
  p.holdBlock = true; for (let i = 0; i < beat.siege.hold.frames + 2; i++) s.step();
  assert.ok(s.done && !w.foesHeld, "held: the door's next");
  assert.ok(w.drainEvents().some((e) => e.type === "holdDone"));
  const next = EPISODE_18.beats[EPISODE_18.beats.indexOf(beat) + 1];
  assert.equal(next.id, "doorScene");
});

test("Ep 18 says so; the door and the hold are drawn; nobody new is named where they shouldn't be", () => {
  assert.match(beat.eventHints.holdBegin, /Hold GUARD/);
  assert.ok(beat.tutorial.some((t) => /Cal's with you/.test(t.text)));
  const main = src("main.js");
  for (const ev of ["threshold", "doorHeld", "holdBegin", "holdDone"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
  assert.match(src("runtime/hud.js"), /"data-hold"/);
  assert.doesNotMatch(src("data/cal.js"), /\bsable\b|masked/i);
  assert.doesNotMatch(main, /\bcal\b/i);
});
