import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCutscene, sampleCamera, eventsBetween, sampleMove, EASE } from "../src/core/timeline.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { EPISODE_1, EP1_SCRIPT } from "../src/data/story/ep1.js";
import { parseScript } from "../src/core/script.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CAST } from "../src/data/story/cast.js";

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test("camera keys interpolate with easing, hold after the last key, and hard-cut on cut keys", () => {
  const keys = [
    { t: 0, pos: [0, 0, 0], look: [0, 0, 1], fov: 1 },
    { t: 2, pos: [2, 0, 0], look: [0, 0, 1], fov: 0.5, ease: "linear" },
    { t: 2, cut: true, pos: [10, 5, 0], look: [0, 0, 0], fov: 0.4 },
    { t: 4, pos: [10, 5, 4], look: [0, 0, 0], ease: "inOut" },
  ];
  assert.deepEqual(sampleCamera(keys, 0).pos, [0, 0, 0]);
  const mid = sampleCamera(keys, 1);
  assert.ok(near(mid.pos[0], 1) && near(mid.fov, 0.75));
  assert.deepEqual(sampleCamera(keys, 2).pos, [10, 5, 0], "the cut key takes over exactly at its time");
  assert.ok(near(sampleCamera(keys, 3).pos[2], 2), "inOut is halfway at the midpoint");
  assert.deepEqual(sampleCamera(keys, 99).pos, [10, 5, 4]);
  assert.equal(sampleCamera(keys, 3).fov, 0.4 + (0.8 - 0.4) * EASE.inOut(0.5), "a key without fov uses the default");
});

test("events fire once as time passes them, including t = 0", () => {
  const ev = [{ t: 0, sfx: "a" }, { t: 1, sfx: "b" }, { t: 1, caption: "c" }, { t: 3, fade: "out" }];
  assert.deepEqual(eventsBetween(ev, -Infinity, 0).map((e) => e.sfx), ["a"]);
  assert.equal(eventsBetween(ev, 0, 0.99).length, 0);
  assert.equal(eventsBetween(ev, 0.99, 1).length, 2);
  assert.equal(eventsBetween(ev, 1, 10).length, 1);
});

test("moves ease from start to end and clamp outside their window", () => {
  assert.deepEqual(sampleMove([0, 0], [4, 2], 1, 2, 0), [0, 0]);
  assert.deepEqual(sampleMove([0, 0], [4, 2], 1, 2, 2), [2, 1]);
  assert.deepEqual(sampleMove([0, 0], [4, 2], 1, 2, 9), [4, 2]);
});

test("validation catches out-of-order keys, unknown actors, empty events, and out-of-range times", () => {
  const ok = { id: "x", duration: 2, actors: [{ id: "a" }], camera: [{ t: 0, pos: [0, 0, 0], look: [0, 0, 1] }], events: [{ t: 1, show: "a" }] };
  validateCutscene(ok);
  assert.throws(() => validateCutscene({ ...ok, camera: [{ t: 1, pos: [0, 0, 0], look: [0, 0, 1] }, { t: 0, pos: [0, 0, 0], look: [0, 0, 1] }] }), /time order/);
  assert.throws(() => validateCutscene({ ...ok, events: [{ t: 1, show: "ghost" }] }), /unknown actor ghost/);
  assert.throws(() => validateCutscene({ ...ok, events: [{ t: 1 }] }), /does nothing/);
  assert.throws(() => validateCutscene({ ...ok, events: [{ t: 5, sfx: "x" }] }), /outside/);
  assert.throws(() => validateCutscene({ ...ok, camera: [{ t: 0, pos: [0, 0], look: [0, 0, 1] }] }), /needs pos and look/);
});

test("every cutscene is valid and every episode cutscene beat points at one", () => {
  for (const cs of Object.values(CUTSCENES)) validateCutscene(cs);
  for (const b of EPISODE_1.beats) if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
  const cold = CUTSCENES[EPISODE_1.beats[0].cutscene];
  assert.equal(cold.stage, "larkspur");
  assert.ok(cold.events.some((e) => e.caption === "FIFTEEN YEARS AGO"));
});

test("Episode 1 staging commands name real cast members and real gestures", () => {
  const nodes = parseScript(EP1_SCRIPT, "ep1");
  validateEpisode(EPISODE_1, nodes);
  const GESTURES = ["none", "point", "raise", "hand", "cross", "bow", "tilt", "fist"];
  const walk = (block, fn) => { for (const s of block) { fn(s); if (s.type === "options") for (const o of s.items) walk(o.body, fn); if (s.type === "if") { for (const b of s.branches) walk(b.body, fn); walk(s.otherwise, fn); } } };
  let count = 0;
  for (const node of Object.values(nodes)) walk(node.body, (s) => {
    if (s.type !== "cmd") return;
    if (["move", "pose", "face", "show", "hide"].includes(s.name)) { count++; assert.ok(CAST[s.args[0]], `${node.title}: ${s.name} ${s.args[0]}`); }
    if (s.name === "face") assert.ok(CAST[s.args[1]], `${node.title}: face target ${s.args[1]}`);
    if (s.name === "pose") assert.ok(GESTURES.includes(s.args[1]), `${node.title}: gesture ${s.args[1]}`);
    if (s.name === "move") assert.ok(Number.isFinite(Number(s.args[1])) && Number.isFinite(Number(s.args[2])), `${node.title}: move coordinates`);
    if (s.name === "shot") assert.ok(["wide", "on", "two"].includes(s.args[0]), `${node.title}: shot ${s.args[0]}`);
  });
  assert.ok(count >= 10, "Episode 1 is staged");
  // Scenes and fights happen on the Tower sets.
  for (const b of EPISODE_1.beats) if (b.type === "scene" || b.type === "fight") assert.ok(["towerSteps", "towerHall"].includes(b.stage), b.id);
});
