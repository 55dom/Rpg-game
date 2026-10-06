import { test } from "node:test";
import assert from "node:assert/strict";
import { solveLeg, ankleAt, footInCycle, cycleBob } from "../src/core/ik.js";
import { SHEETS, BUILDS, GAITS, IDLES, HEAD_Y, sheetFor } from "../src/data/sheets.js";

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("two-bone IK puts the ankle exactly on any reachable target, knee bending forward", () => {
  const a = 0.45, b = 0.43;
  for (const [dy, dz] of [[-0.8, 0], [-0.7, 0.25], [-0.6, -0.3], [-0.5, 0.1], [-0.84, 0.15]]) {
    const s = solveLeg(a, b, dy, dz);
    const p = ankleAt(a, b, s.hip, s.knee);
    near(p.dy, dy, 1e-6); near(p.dz, dz, 1e-6);
    assert.ok(s.knee >= 0, "knees never bend backwards");
    near(s.hip + s.knee + s.ankle, 0); // the foot stays flat
  }
});

test("out-of-reach targets straighten the leg toward them instead of breaking", () => {
  const s = solveLeg(0.45, 0.43, -2, 0.1);
  assert.ok(s.knee < 0.05 && !s.reach);
  const p = ankleAt(0.45, 0.43, s.hip, s.knee);
  near(Math.atan2(p.dz, -p.dy), Math.atan2(0.1, 2), 0.02);
});

test("walk cycle: a planted foot travels back at exactly the body's speed (no skating), then swings forward", () => {
  const stride = 1.2, stance = 0.6, n = 600;
  for (let i = 0; i < n; i++) {
    const q0 = i / n, q1 = (i + 1) / n;
    const f0 = footInCycle(q0, stride, { stance }), f1 = footInCycle(q1, stride, { stance });
    if (f0.planted && f1.planted) {
      near(f0.along - f1.along, stride / n, 1e-9); // body moves stride/n per step; foot moves back the same
      assert.equal(f0.lift, 0);
    }
  }
  const mid = footInCycle(stance + (1 - stance) / 2, stride, { stance, lift: 0.1 });
  near(mid.lift, 0.1); // highest at mid-swing
  // Contact and lift-off match up, so the foot never jumps.
  near(footInCycle(0, stride, { stance }).along, footInCycle(0.99999, stride, { stance }).along, 1e-3);
});

test("body bob: lowest at the two contacts, highest at passing", () => {
  near(cycleBob(0, 0.03), -0.03); near(cycleBob(0.5, 0.03), -0.03);
  near(cycleBob(0.25, 0.03), 0.03); near(cycleBob(0.75, 0.03), 0.03);
});

test("every character sheet is complete: a known build, gait, idle and an outfit with a top color", () => {
  for (const [k, s] of Object.entries(SHEETS)) {
    assert.ok(BUILDS[s.build], `${k} build`); assert.ok(GAITS[s.gait], `${k} gait`); assert.ok(IDLES[s.idle], `${k} idle`);
    assert.match(s.outfit.top, /^#[0-9a-f]{6}$/i, `${k} top`);
    for (const key of ["legs", "bootColor", "belt", "apron", "vest", "breastplate", "pauldrons", "tabard", "cloak", "satchel", "gloves", "bracers"]) {
      if (s.outfit[key]) assert.match(s.outfit[key], /^#[0-9a-f]{6}$/i, `${k}.${key}`);
    }
  }
  assert.ok(sheetFor("someone-new", { coat: "#123456" }).outfit.top === "#123456");
});

test("bodies are fitted under the head: long slender legs, a torso that reaches the shoulders, no two builds alike", () => {
  for (const [k, b] of Object.entries(BUILDS)) {
    const legs = b.hip, torso = HEAD_Y - 0.32 - b.hip;
    if (k !== "brute") assert.ok(legs > torso * 1.3, `${k}: legs longer than the torso (anime proportions)`); // brutes are squat on purpose
    assert.ok(b.ankle < b.calf && b.calf < b.thigh, `${k}: thigh > calf > ankle`);
    assert.ok(torso > 0.45, `${k}: room for a chest`);
  }
  const sig = Object.values(BUILDS).map((b) => `${b.sw}|${b.hip}|${b.thigh}`);
  assert.equal(new Set(sig).size, sig.length);
});

test("occupations dress the part: the smith wears an apron and gloves, guards armor and the city's colors, farmers get dirty", () => {
  assert.ok(SHEETS.smith.outfit.apron && SHEETS.smith.outfit.gloves && SHEETS.smith.outfit.toolbelt);
  assert.ok(SHEETS.guard.outfit.breastplate && SHEETS.guard.outfit.tabard);
  assert.ok(SHEETS.farmer.outfit.grime > 0.5 && SHEETS.farmer.outfit.patches);
  assert.ok(SHEETS.severin.outfit.grime === 0 && SHEETS.severin.outfit.brooch); // nobility: spotless, jewelled
  assert.ok(SHEETS.cook.outfit.apron && SHEETS.cook.outfit.sleeves === "rolled");
});
