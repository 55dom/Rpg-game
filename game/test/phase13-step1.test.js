// Phase 13 Step 1: limited animation (GDD §19.6: "Pose playback can be sampled at 12 fps ('animating on twos')… while
// gameplay logic stays at 60 Hz. Major attacks switch to full-rate for smoothness at the key moment") and the animation
// quality tiers (§19.7: A stepped, B hybrid, C authored), and smear frames on major attacks only.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { animTier, stepMode, steppedFrame, drawings, holdK, STEP_FRAMES, TIERS } from "../src/core/stepping.js";
import { phaseAt, defineAbility } from "../src/core/abilities.js";
import { ROOK_ABILITIES as R } from "../src/data/rook.js";
import { ACOLYTE_ABILITIES } from "../src/data/acolyte.js";
import { TEAM_ATTACK } from "../src/sim/world.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");

test("the tiers (§19.7): lights and enemy basics stepped, heavies, spells and finishers hybrid, ultimates and Team Attacks full", () => {
  assert.equal(STEP_FRAMES, 5, "60 Hz sim, 12 drawings a second");
  for (const id of ["L1", "L2", "L3", "AirL1", "DashStrike"]) assert.equal(animTier(R[id]), "A", id);
  for (const id of ["L4", "Launcher", "AirSlam", "Stonebreaker", "GaleCutter", "VacuumPull", "TempestEdge", "LanternBreak", "Counter"]) assert.equal(animTier(R[id]), "B", id);
  assert.equal(animTier(R.Skyrender), "C"); assert.equal(animTier(TEAM_ATTACK), "C");
  assert.ok(Object.values(ACOLYTE_ABILITIES).some((a) => animTier(a) === "A"), "enemy basics");
  assert.deepEqual(Object.values(TIERS).map((t) => t.mode), ["twos", "hybrid", "full"]);
  // §19.6: "an animation stepping option per move": a move can say its own.
  assert.equal(stepMode(defineAbility({ id: "X", startup: 5, active: 2, recovery: 5, tags: ["heavy"], step: "full" })), "full");
});

test("stepped: each phase drawn on drawings five frames apart, never skipping a phase or crossing into the next", () => {
  const a = R.L1; // 7 / 3 / 14
  const drawn = [];
  for (let f = 0; f < a.total; f += 1 / 6) {
    const g = steppedFrame(a, f);
    assert.equal(phaseAt(a, g), phaseAt(a, f), `frame ${f.toFixed(2)}: drawn in its own phase`);
    if (drawn.at(-1) !== +g.toFixed(3)) drawn.push(+g.toFixed(3)); // (a phase's first instant shows the pose the last one held)
  }
  assert.ok(drawn.length <= 1 + drawings(7) + drawings(3) + drawings(14), `${drawn.length} drawings, not ${a.total * 6} frames`);
  assert.ok(drawn.length >= 4, "the windup, the blow and the follow-through are all drawn");
  // A long phase: at most one new drawing per five frames.
  const long = defineAbility({ id: "Y", startup: 40, active: 2, recovery: 2 });
  let last = steppedFrame(long, 0), changedAt = -10;
  for (let f = 0; f < 40; f += 0.25) { const g = steppedFrame(long, f); if (g !== last) { assert.ok(f - changedAt >= STEP_FRAMES - 0.01, `held at ${f}`); changedAt = f; last = g; } }
  // The windup and the release arrive on their key pose and hold it; the follow-through holds first.
  assert.equal(holdK(0.01, 2, true), 0.5); assert.equal(holdK(0.99, 2, false), 0.5); assert.equal(holdK(0.4, 2, false), 0);
});

test("hybrid (§19.7 B): stepped anticipation, the release at full rate; full (C) and the setting off draw every frame", () => {
  const a = R.L4; // 10 / 4 / 22
  for (let f = a.startup; f < a.startup + a.active; f += 0.25) assert.equal(steppedFrame(a, f), f, "the release");
  assert.notEqual(steppedFrame(a, 3.3), 3.3, "the anticipation steps");
  for (let f = 0; f < R.Skyrender.total; f += 0.7) assert.equal(steppedFrame(R.Skyrender, f), f);
  for (let f = 0; f < R.L1.total; f += 0.7) assert.equal(steppedFrame(R.L1, f, { on: false }), f);
});

test("only what's drawn steps: the sim never reads it, the rig draws through it, and the setting is in the accessibility block", () => {
  for (const f of readdirSync(new URL("../src/sim/", import.meta.url))) assert.doesNotMatch(src(`sim/${f}`), /stepping\.js/, f);
  const rig = src("runtime/rig.js");
  assert.match(rig, /const f = steppedFrame\(a, raw, \{ on: Rig\.twos \}\)/);
  assert.match(rig, /Secondary motion \(hair, scarf, cape, coat tails\) is held for two frames at a time/, "secondary motion was already on twos");
  const main = src("main.js");
  assert.match(main, /twos: true/); assert.match(main, /Rig\.twos = settings\.twos !== false/);
  assert.match(readFileSync(new URL("../template.html", import.meta.url), "utf8"), /data-a11y="twos"[^>]*>ANIMATE ON TWOS/);
});

test("smear frames (§19.6): on major attacks only, the blade's whole arc drawn in the first frames of the release", () => {
  const rig = src("runtime/rig.js"), vfx = src("runtime/vfx.js");
  assert.match(rig, /this\.smear = isAttack\(a\) && animTier\(a\) !== "A" && raw >= s && raw < s \+ Math\.min\(act, 3\)/);
  assert.match(src("main.js"), /tr\.push\(hilt, tip, rig\.swinging, dt, rig\.smear\)/);
  assert.match(vfx, /push\(hilt, tip, on, dt, smear = 0\)/);
  assert.match(vfx, /round the hilt, from the last drawing to this one/, "a jump between drawings fills with its arc, not a chord");
});
