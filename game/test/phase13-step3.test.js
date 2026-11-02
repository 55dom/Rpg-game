// Phase 13 Step 3: the camera language library (GDD §19.5: "Camera presets, each a reusable data asset… Storyboards
// reference them by name (CAM_WHIP_PAN_FAST)") and storyboards as data (§19.2: the 5-column storyboard is where the
// pipeline starts; storyboard() lays out the timeline from it).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CAMERA_PRESETS, SECTION_19_5, SIZES, storyboard, cutKeys, cutAt, BOARD_FPS } from "../src/core/storyboard.js";
import { sampleCamera } from "../src/core/timeline.js";

const actors = [
  { id: "a", look: "player", x: 0, z: 0, yaw: 0 },
  { id: "b", look: "cal", x: 1.2, z: 2.0, yaw: Math.PI },
];
const one = (cam, extra = {}) => storyboard({ id: "t", stage: "yard", actors, cuts: [{ cut: "001", sec: 2, size: "MS", cam, on: "a", ...extra }] });
const first = (cs) => cs.camera[0], last = (cs) => cs.camera.at(-1);
const flatDist = (k) => Math.hypot(k.pos[0] - k.look[0], k.pos[2] - k.look[2]);

test("§19.5's fifteen, each a named preset in the library", () => {
  assert.deepEqual(Object.keys(SECTION_19_5), ["Pan", "Tilt", "Dolly", "Tracking", "Crane", "Zoom", "Orbit", "Handheld shake", "Whip pan", "Snap zoom", "Dutch angle", "Low angle", "High angle", "ECU", "Wide establishing"]);
  for (const [name, id] of Object.entries(SECTION_19_5)) { assert.ok(CAMERA_PRESETS[id], id); assert.equal(CAMERA_PRESETS[id].name, name); }
  assert.ok(CAMERA_PRESETS.CAM_WHIP_PAN_FAST, "the name §19.5 itself uses");
  for (const s of ["ECU", "CU", "MS", "WIDE", "ESTABLISHING", "TWO", "INSERT"]) assert.ok(SIZES[s], s);
});

test("each preset does what it's called", () => {
  { const c = one("CAM_CRANE_DOWN"); assert.ok(first(c).pos[1] > last(c).pos[1] + 1, "crane: comes down"); }
  { const c = one("CAM_TILT_UP"); assert.ok(first(c).look[1] < last(c).look[1] - 1, "tilt: up"); }
  { const c = one("CAM_DOLLY_IN"); assert.ok(flatDist(first(c)) > flatDist(last(c)) * 1.2, "dolly: in"); }
  { const c = one("CAM_ZOOM_IN"); assert.ok(first(c).fov > last(c).fov * 1.4 && first(c).pos.join() === last(c).pos.join(), "zoom: the lens, not the camera"); }
  { const c = one("CAM_PAN_LEFT"); assert.notDeepEqual(first(c).look, last(c).look); assert.deepEqual(first(c).pos, last(c).pos); }
  { const c = one("CAM_ORBIT"); const ang = (k) => Math.atan2(k.pos[0] - k.look[0], k.pos[2] - k.look[2]); assert.ok(Math.abs(ang(first(c)) - ang(last(c))) > 0.9, "orbit: an arc round them"); assert.ok(c.camera.length >= 5, "an arc, not a chord"); }
  { const c = one("CAM_HANDHELD"); assert.ok(first(c).shake > 0 && sampleCamera(c.camera, 1).shake > 0); }
  { const c = one("CAM_WHIP_PAN_FAST"); assert.ok(c.camera[1].t - c.camera[0].t <= 0.16 + 1e-9); assert.deepEqual(c.camera[1].look, last(c).look, "on the subject by then"); }
  { const c = one("CAM_SNAP_ZOOM"); assert.ok(c.camera[1].t <= 0.1 + 1e-9 && c.camera[0].fov > c.camera[1].fov * 2); }
  { const c = one("CAM_DUTCH"); assert.ok(Math.abs(sampleCamera(c.camera, 1).roll) > 0.15, "the frame tilts"); }
  { const c = one("CAM_LOW_ANGLE"); assert.ok(first(c).pos[1] < first(c).look[1] - 0.8, "from below"); }
  { const c = one("CAM_HIGH_ANGLE"); assert.ok(first(c).pos[1] > first(c).look[1] + 2, "from above"); }
  { const c = one("CAM_ECU", { size: undefined }); assert.equal(first(c).ecu, true); assert.ok(flatDist(first(c)) < 1.5 && first(c).fov <= 0.35); }
  { const c = one("CAM_WIDE_ESTABLISHING", { size: undefined }); assert.ok(flatDist(first(c)) > 15 && first(c).pos[1] > 6); }
  { // tracking: the camera goes where they go
    const c = storyboard({ id: "t", stage: "yard", actors, cuts: [{ cut: "001", sec: 2, size: "MS", cam: "CAM_TRACKING", on: "a", events: [{ at: 0, move: { id: "a", to: [0, 6], dur: 2 } }] }] });
    assert.ok(last(c).look[2] - first(c).look[2] > 5.5 && last(c).pos[2] - first(c).pos[2] > 5.5);
  }
  { const c = one("CAM_OTS", { on: "b", ots: "a" }); assert.equal(first(c).ots, "a"); assert.ok(Math.hypot(first(c).pos[0], first(c).pos[2]) < 1.8, "behind a's shoulder"); }
  assert.throws(() => one("CAM_NOPE"), /no camera preset CAM_NOPE/);
});

test("stacked: a cut can be low, tilting up and Dutch at once (§19.3 cut 008)", () => {
  const c = one("CAM_LOW_ANGLE CAM_TILT_UP CAM_DUTCH");
  assert.ok(first(c).pos[1] < 0.5); assert.ok(first(c).look[1] < last(c).look[1]); assert.ok(first(c).roll > 0.15);
});

test("a storyboard (§19.2's five columns) lays out the timeline: TIME / FRAMES at 24 fps, a line per cut, the cut each moment's in", () => {
  const cs = storyboard({ id: "t", stage: "yard", actors, cuts: [
    { cut: "001", picture: "Wide", action: "Slow crane down", audio: "Wind", frames: 72, size: "WIDE", cam: "CAM_CRANE_DOWN_SLOW", on: ["a", "b"] },
    { cut: "002", picture: "MS: a", action: "Static", audio: "A: Hello.", sec: 1.5, cam: "CAM_HOLD", on: "a", say: "A: Hello." },
    { cut: "003", picture: "Flash", action: "2-frame flash", audio: "Slam", frames: 4, cam: "CAM_HOLD", on: "b", events: [{ at: 0, flash: 0.15 }] },
  ] });
  assert.equal(BOARD_FPS, 24);
  assert.equal(cs.duration, +(3 + 1.5 + 4 / 24).toFixed(3));
  assert.deepEqual(cs.cuts.map((c) => [c.cut, c.t]), [["001", 0], ["002", 3], ["003", 4.5]]);
  assert.equal(cs.camera.filter((k) => k.cut).length, 3, "a hard cut per cut");
  assert.ok(cs.events.some((e) => e.t === 3 && e.caption === "A: Hello.") && cs.events.some((e) => e.caption === null && e.t > 4 && e.t < 4.5));
  assert.ok(cs.events.some((e) => e.flash && e.t === 4.5));
  assert.deepEqual(cutAt(cs, 0), { cut: "001", frame: 1, of: 72 }); assert.deepEqual(cutAt(cs, 4.5 + 1 / 24), { cut: "003", frame: 2, of: 4 });
});

test("the player: roll and hand-held reach the camera; the shake setting stills the hand-held", () => {
  const story = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8"), cam = readFileSync(new URL("../src/runtime/camera.js", import.meta.url), "utf8");
  assert.match(story, /\{ fov: cam\.fov, cut: true, roll: cam\.roll, shake: cam\.shake \}/);
  assert.match(cam, /this\.cam\.rotation\.z = s\.roll \?\? 0;/);
  assert.match(cam, /hh = \(s\.shake \?\? 0\) \* this\.shakeScale/);
});
