// Phase 13 Step 4: Ep 18, "I'll Hold the Door", as GDD §19.3 storyboards it: sixteen cuts, each with its picture, its
// stage direction, its sound and its length, laid out by core/storyboard.js; and the Lore Archive's Theatre, where the
// fairness check's moments can be stepped through a frame at a time (§15.10), with the rewatch §15.9 describes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CUTSCENES, EP18_BOARD, EP18_DUSK_BOARD, BOARD_SCALES } from "../src/data/story/cutscenes.js";
import { EPISODE_18 } from "../src/data/story/ep18.js";
import { THEATRE, ANNOTATED } from "../src/data/theatre.js";
import { cutAt, BOARD_FPS } from "../src/core/storyboard.js";
import { actorsAt } from "../src/core/framing.js";
import { LOOKS } from "../src/runtime/rig.js";

const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const BOARD = GDD.slice(GDD.indexOf("### 19.3 Storyboard"), GDD.indexOf("### 19.4"));
const ROWS = [...BOARD.matchAll(/^\| (\d{3}) \| (.+?) \| (.+?) \| (.+?) \| ([\d.]+)s \/ (\d+) \|$/gm)].map((m) => ({ cut: m[1], picture: m[2], action: m[3], audio: m[4], sec: +m[5], frames: +m[6] }));
const CUTS = [...EP18_BOARD.cuts, ...EP18_DUSK_BOARD.cuts];
const plain = (s) => s.replace(/\*\*|\*|🔒\s*/g, "").replace(/\s+/g, " ").trim();
const at = (cut) => { const cs = CUTS.indexOf(cut) < EP18_BOARD.cuts.length ? CUTSCENES.ep18_door : CUTSCENES.ep18_dusk; return { cs, c: cs.cuts.find((x) => x.cut === cut.cut) }; };
const eventsIn = (cut) => { const { cs, c } = at(cut); return cs.events.filter((e) => e.t >= c.t - 1e-6 && e.t < c.t + c.dur - 1e-6); };

test("all sixteen cuts, in order, with §19.3's picture, stage direction and sound, word for word, and its length at 24 fps", () => {
  assert.equal(ROWS.length, 16, "the board in the design");
  assert.equal(BOARD_FPS, 24);
  assert.deepEqual(CUTS.map((c) => c.cut), ROWS.map((r) => r.cut));
  for (const [i, r] of ROWS.entries()) {
    const c = CUTS[i];
    for (const k of ["picture", "action", "audio"]) assert.equal(plain(c[k]).replace(/\\"/g, '"'), plain(r[k]).replace(/\(🔒 /, "("), `${r.cut} ${k}`);
    const frames = c.frames ?? Math.round(c.sec * BOARD_FPS);
    assert.ok(Math.abs(frames - r.frames) <= 1, `${r.cut}: ${frames} frames, the board says ${r.frames}`);
  }
  const cs = CUTSCENES.ep18_door;
  assert.ok(Math.abs(cs.duration + CUTSCENES.ep18_dusk.duration - ROWS.reduce((s, r) => s + r.frames / 24, 0)) < 0.1, "the whole scene runs the board's length");
});

test("the camera does what the ACTION column says (§19.5's presets, by name)", () => {
  const want = { "001": ["CAM_CRANE_DOWN_SLOW"], "002": ["CAM_HANDHELD"], "003": ["CAM_SNAP_ZOOM"], "004": ["CAM_DOLLY_IN_SLOW"], "005": ["CAM_HOLD"], "006": ["CAM_HOLD"], "007": ["CAM_ECU"],
    "008": ["CAM_LOW_ANGLE", "CAM_TILT_UP", "CAM_DUTCH"], "009": ["CAM_WHIP_PAN_FAST"], "010": ["CAM_TRACKING"], "011": ["CAM_HOLD"], "012": ["CAM_TRACKING"], "013": ["CAM_HOLD"],
    "014": ["CAM_HOLD"], "015": ["CAM_PUSH_IN_SLOW"], "016": ["CAM_PULL_BACK_SLOW"] };
  for (const c of CUTS) assert.deepEqual(String(c.cam).split(/\s+/), want[c.cut], c.cut);
  const sizes = { "001": "WIDE", "002": "MS", "003": "CU", "004": "MS", "005": "CU", "006": "TWO", "009": "WIDE", "010": "MS", "011": "CU", "012": "MS", "014": "WIDE", "015": "INSERT", "016": "WIDE" };
  for (const c of CUTS) if (sizes[c.cut]) assert.equal(c.size, sizes[c.cut], `${c.cut} (the PICTURE column)`);
  assert.equal(EP18_BOARD.cuts.find((c) => c.cut === "004").ots, "cal", "OTS from Cal");
  for (const [look, k] of Object.entries(BOARD_SCALES)) assert.equal(LOOKS[look]?.scale ?? 1, k, `${look}'s size, for the layout`);
});

test("the dialogue column: every line, on its cut, Rook's in the name the player chose", () => {
  const lines = { "004": "Cal: Huh. That's a big one.", "006": "Cal: Kid. Keep the key.", "007": "{name}: Cal, what are you…", "011": "Cal: I'll hold the door. Don't wait up.", "012": "{name}: CAL!" };
  for (const c of CUTS) {
    const said = eventsIn(c).filter((e) => e.caption).map((e) => e.caption);
    assert.deepEqual(said, lines[c.cut] ? [lines[c.cut]] : [], c.cut);
  }
  assert.match(src("runtime/story.js"), /el\.textContent = fillText\(text, \{ \.\.\.this\.player, flags: this\.flags \}\)/);
  assert.match(src("data/story/ep18.js"), /Cal: Doors, Lio\. I make doors\./, "the scene before keeps his line (Arc 7 echoes it, V6)");
  assert.doesNotMatch(src("data/story/ep18.js"), /Cal: I'll hold the door/, "said once, on cut 011");
});

test("§19.3's fairness check: each cut that 'contains truth' carries it", () => {
  const ev = (cut) => eventsIn(CUTS.find((c) => c.cut === cut));
  assert.ok(ev("005").some((e) => e.sfx === "tuneThree") && ev("005").some((e) => e.pose?.name === "tilt"), "005: the tune, three notes, and the head tilt");
  assert.match(src("runtime/audio.js"), /case "tuneThree":[^]*?\[659, 784, 880\]\.entries\(\)/, "three of the four (the whistle is 659, 784, 880, 587)");
  assert.ok(ev("006").some((e) => e.pose?.id === "cal" && e.pose.name === "pat"), "006: a hand on Rook's head");
  const walk = ev("010").find((e) => e.move?.id === "cal");
  assert.ok(walk && walk.move.to[1] > 6, "010: he walks toward the door");
  assert.ok(ev("011").some((e) => e.face?.[0] === "cal" && e.face[1] === "rook"), "011: turning his head back");
  // 013: the door slams toward the camera (shut from the far side), an inverted impact frame, and for one frame at 24, a figure in the doorway.
  const e13 = ev("013"), c13 = at(CUTS.find((c) => c.cut === "013")).c;
  assert.ok(e13.some((e) => e.cue === "slam") && e13.some((e) => e.invert > 0) && e13.some((e) => e.hide === "cal"));
  const shown = e13.find((e) => e.show === "figure"), hidden = e13.find((e) => e.hide === "figure");
  assert.ok(shown && hidden && Math.abs(hidden.t - shown.t - 1 / 24) < 1e-3, "exactly one frame");
  const fig = actorsAt(CUTSCENES.ep18_door, shown.t + 0.01).find((a) => a.id === "figure");
  assert.ok(fig.shown && Math.abs(fig.z - EP18_BOARD.actors.find((a) => a.id === "figure").z) < 1e-6);
  assert.deepEqual(cutAt(CUTSCENES.ep18_door, shown.t + 0.01), { cut: "013", frame: 2, of: 4 });
  assert.match(src("runtime/sets.js"), /hinge\.rotation\.y = -1\.35 \* \(1 - st\.slam\); \} \/\/ shut, from the far side, toward us/);
  assert.ok(ev("014").some((e) => e.cue === "gone"), "014: nothing remains");
  assert.ok(ev("015").some((e) => e.cue === "palm") && ev("015").some((e) => e.sfx === "keyRing"), "015: the key, ringing");
  // 016: one lantern dark. The flag that puts it out is set before the cut plays.
  const beats = EPISODE_18.beats.map((b) => b.id);
  assert.deepEqual(beats.slice(beats.indexOf("doorScene"), beats.indexOf("lantern") + 1), ["doorScene", "door", "nothing", "dusk", "lantern"]);
  assert.match(src("data/story/ep18.js"), /so do the rest of you\.\n<<set \$CAL_STATE to 1>>/);
  assert.match(src("runtime/sets.js"), /calDarkN = K\.when\("\$CAL_STATE"\)/);
  assert.equal(CUTSCENES.ep18_dusk.stage, "lighthouse"); assert.ok(CUTSCENES.ep18_dusk.sky.daylight < 0.5, "at dusk");
});

test("the Theatre (§15.10, §19.3): Ep 18 in the archive, the board played through, frame-stepped at 24, the cut and frame on screen", () => {
  const e = THEATRE.find((x) => x.id === "ep18_door");
  assert.ok(e && e.then === "ep18_dusk" && e.episode === 18);
  const story = src("runtime/story.js");
  assert.match(story, /th\.step = 1 \/ \(this\.cut\?\.cs\.fps \?\? 30\)/);
  assert.match(story, /const then = THEATRE\.find\(\(x\) => x\.id === id\)\?\.then;/);
  assert.match(story, /`CUT \$\{at\.cut\} · FRAME \$\{at\.frame\}\/\$\{at\.of\}`/);
  assert.match(readFileSync(new URL("../template.html", import.meta.url), "utf8"), /data-th-cut/);
  // The rewatch §15.9 describes: margin notes on the moments, only in the Annotated Edition (after the reveal).
  assert.equal(ANNOTATED.opens, "$CAL_IDENTITY_REVEALED");
  const notes = ANNOTATED.notes.ep18_door;
  for (const cut of ["004", "005", "006", "010", "013", "015"]) {
    const c = CUTSCENES.ep18_door.cuts.find((x) => x.cut === cut);
    assert.ok(notes.some((n) => n.t >= c.t - 1e-6 && n.t < c.t + Math.max(c.dur, 0.2)), `a note on cut ${cut}`);
  }
  assert.match(notes.map((n) => n.text).join(" "), /Three notes\. He always whistled four\./);
  assert.doesNotMatch(src("data/theatre.js"), /\bsable\b|\bdemons?\b|ash line/i);
});

test("skipping a cutscene puts everyone where they end up, without every sound at once", () => {
  assert.match(src("runtime/story.js"), /if \(c\.skipped && \(e\.sfx \|\| e\.flash \|\| e\.invert \|\| e\.speed \|\| "caption" in e \|\| e\.tear\)\) continue;/);
  assert.ok(EP18_BOARD.cuts.at(-1).events.some((e) => e.cue === "gone" && e.at === 2.0), "and the set is cleared at the end either way");
});
