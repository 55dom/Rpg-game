import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { hitSpec } from "../src/core/combat.js";
import { TWINS_TUNING as T } from "../src/data/twins.js";
import { ENEMIES } from "../src/data/enemies.js";
import { EPISODE_15 } from "../src/data/story/ep15.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const twins = (o = {}) => {
  const w = new World({ seed: 5, ...o }); w.spawnWave(["twinMirror", "twinSmoke"]); w.drainEvents(); run(w, 2);
  const [m, s] = ["twinMirror", "twinSmoke"].map((k) => w.fighters.find((f) => f.kind === k));
  return { w, m, s, duo: w.twinDuo };
};
const setPair = ({ m, s }, frac) => { m.combatant.health.set(m.combatant.health.max * frac); s.combatant.health.set(s.combatant.health.max * frac); };
const gale = (w, def) => w._resolve(w.player, def, { spec: hitSpec({ damage: 3, posture: 0, hitstop: 0, hitstun: 1 }), ability: { id: "GaleCutter", tags: ["burst", "gust"], manaCost: 0 }, hitSet: new Set(), origin: w.player.pos });
const echoes = (w) => w.fighters.filter((f) => f.alive && f.traits.echo);

test("One duo, two throats (§16 B6): Mirror holds the glass, Smoke the song", () => {
  const { m, s, duo } = twins();
  assert.ok(duo && duo.twins.length === 2);
  assert.equal(m.magic, "glass"); assert.ok(m.traits.frontalGuard);
  assert.equal(s.magic, "song"); assert.ok(!s.traits.frontalGuard);
  assert.ok(s.brain.options.some((o) => o.ability.id === "Hymn"));
});

test("P2 (the pair at 70%, together): they swap magic, and keep swapping, with a glint a second before", () => {
  const t = twins(); const { w, m, s } = t;
  setPair(t, 0.69);
  const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "twinPhase" && e.phase === 2));
  assert.ok(l.some((e) => e.type === "twinSwap"));
  assert.equal(m.magic, "song"); assert.ok(!m.traits.frontalGuard, "Mirror's lost the glass");
  assert.equal(s.magic, "glass"); assert.ok(s.traits.frontalGuard, "and Smoke has it");
  assert.ok(m.brain.options.some((o) => o.ability.id === "Hymn"), "Mirror sings now");
  const l2 = run(w, T.swapEvery);
  const warn = l2.findIndex((e) => e.type === "twinSwapWarn"), swap = l2.findIndex((e) => e.type === "twinSwap");
  assert.ok(warn >= 0 && swap > warn, "warned, then swapped back");
  assert.equal(m.magic, "glass");
});

test("P3 (40%): smoke and mirrors. Reflections, whole, named like the twins; the real two step from mirror to mirror", () => {
  const t = twins(); const { w, m, s, duo } = t;
  setPair(t, 0.39);
  const l = run(w, 2);
  const up = l.find((e) => e.type === "smokeUp");
  assert.ok(up, "the smoke comes up");
  const es = echoes(w);
  assert.equal(es.length, T.smoke.echoes);
  for (const e of es) {
    assert.ok([m.stats.name, s.stats.name].includes(e.stats.name), "named like one of them");
    assert.ok(["twinMirror", "twinSmoke"].includes(e.look), "and looks like her");
    assert.equal(e.combatant.health.normalized, 1, "whole (the real ones are hurt)");
  }
  // They trade places with a reflection.
  const l2 = run(w, T.smoke.shiftEvery + 2);
  assert.ok(l2.some((e) => e.type === "mirrorShift" && (e.fighter === m || e.fighter === s)));
  // A reflection breaks at a touch.
  const e = echoes(w)[0];
  w._resolve(w.player, e, { spec: hitSpec({ damage: 4, posture: 4, hitstop: 0, hitstun: 1 }), ability: { id: "x", tags: [], manaCost: 0 }, hitSet: new Set(), origin: w.player.pos });
  assert.ok(!e.alive, "glass");
  assert.ok(duo.smoke, "the smoke holds while any reflection does");
});

test("Gale blows the smoke away, and every reflection with it; the smoke comes back while both still stand", () => {
  const t = twins(); const { w, duo } = t;
  setPair(t, 0.39); run(w, 2);
  gale(w, echoes(w)[1]);
  const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "smokeDispersed"));
  assert.equal(echoes(w).length, 0);
  assert.equal(duo.smoke, null);
  const l2 = run(w, T.smoke.every + 2);
  assert.ok(l2.some((e) => e.type === "smokeUp"), "it comes back");
  // Left alone, it thins out on its own.
  assert.ok(run(w, T.smoke.frames + 2).some((e) => e.type === "smokeClear"));
  assert.equal(echoes(w).length, 0);
});

test("P4: kill one and the other absorbs her sister's magic (the glass and the song both, and faster); she wards herself", () => {
  const t = twins(); const { w, m, s } = t;
  setPair(t, 0.39); run(w, 2);
  const hp = s.combatant.health.current, speed = s.stats.runSpeed;
  m.combatant.health.set(0);
  const l = run(w, 2);
  const ab = l.find((e) => e.type === "twinAbsorb");
  assert.ok(ab && ab.fighter === s && ab.fallen === m);
  assert.equal(s.magic, "both");
  assert.ok(s.traits.frontalGuard && s.brain.options.some((o) => o.ability.id === "Hymn") && s.brain.options.some((o) => o.ability.id === "Shove"));
  assert.ok(s.stats.runSpeed > speed && s.combatant.health.current > hp);
  assert.equal(echoes(w).length, 0, "the smoke goes with her sister");
  const l2 = run(w, 600); // (between her own attacks)
  assert.ok(l2.some((e) => e.type === "started" && e.fighter === s && e.ability.id === "Hymn"), "she sings for herself");
  // And when she falls, nothing of theirs holds the fight open.
  s.combatant.health.set(0);
  assert.ok(run(w, 400).some((e) => e.type === "waveClear"));
});

test("Either can go first: kill Smoke and Mirror takes the song", () => {
  const t = twins(); const { w, m, s } = t;
  s.combatant.health.set(0);
  run(w, 2);
  assert.equal(m.magic, "both");
  assert.ok(m.brain.options.some((o) => o.ability.id === "Hymn"));
});

test("Ep 15 tells you (hints for the swap, the smoke, the absorbing), and the fight draws it all", () => {
  const b = EPISODE_15.beats.find((x) => x.id === "twins");
  assert.match(b.eventHints.twinSwap, /glass/);
  assert.match(b.eventHints.smokeUp, /Gale/);
  assert.match(b.eventHints.twinAbsorb, /ward/);
  assert.ok(ENEMIES.twinEchoMirror.traits.echo && ENEMIES.twinEchoSmoke.traits.echo);
  const main = src("main.js");
  for (const ev of ["twinPhase", "twinSwapWarn", "twinSwap", "smokeUp", "mirrorShift", "echoShatter", "smokeDispersed", "smokeClear", "twinAbsorb"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
  assert.match(main, /smokeFx\.clear\(\)/);
  assert.match(main, /ev\.defender\.traits\?\.echo/);
});
