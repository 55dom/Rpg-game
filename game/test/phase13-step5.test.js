import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Phase 13 Step 5: GDD §19 (the anime-style cinematic system), walked line by line the way Phases 10–12 walk their
// chapters. Each line is quoted from the design (the test fails if the words leave it, so the list can't drift) and
// pointed at what answers it. The lines nothing answers are named, with the reason, and held to exactly that list.

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");
const has = (p, re) => (p === "template.html" ? tpl : src(p)).match(re) !== null;
const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const S19 = GDD.slice(GDD.indexOf("## 19. "), GDD.indexOf("## 20. "));
const sub = (n) => S19.slice(S19.indexOf(`### ${n} `), S19.indexOf("### ", S19.indexOf(`### ${n} `) + 5));
const inSec = (where, words) => (where === "§19" ? S19 : sub(where.slice(1))).includes(words);

const CHECKLIST = [
  // §19.1 · Three cinematic tiers
  ["§19.1", "Hitstop, shake, FOV punch, impact frame, speed lines", [["core/combat.js", /hitstop/], ["data/cinematics.js", /punch: \{ kick: 0\.35, shake: 0\.2 \}/], ["main.js", /const impact = \(frames, strong = false\)/], ["main.js", /const speedLines = \(sec\) =>/]]],
  ["§19.1", "Player keeps control", [["main.js", /const feedback = \(key\) =>/]]], // (a T1 cue is camera and screen only: nothing in it takes a move)
  ["§19.1", "`CameraCue` + `FeedbackData` assets, triggered by ability events", [["core/abilities.js", /CameraCue: 3/], ["data/cinematics.js", /export const FEEDBACK = Object\.freeze/], ["main.js", /feedback\(e\.key\); \} \/\/ T1/]]],
  ["§19.1", "**T2: Ultimates / Team Attacks** (3–6s)", [["data/cinematics.js", /export const TEAM_SEQUENCES/], ["data/rook.js", /id: "Skyrender", tags: \["ultimate"/]]],
  ["§19.1", "Temporarily taken", [["sim/world.js", /pl\.controller\.startDirect\(seq\.ability, this\.frame\)/], ["data/cinematics.js", /type: E\.Invulnerable, value: \(F\) => F\.total/]]],
  ["§19.1", "Timeline sequence, **skippable**, with a \"short version\" option after first view", [["main.js", /const t2Skip = \(\) =>/], ["data/cinematics.js", /export const t2Mode = \(setting, id\) =>/], ["main.js", /t2MarkSeen\(t\.id\)/]]],
  ["§19.1", "Episode cinematics", [["data/story/cutscenes.js", /export const CUTSCENES = \{/]]],
  ["§19.1", "JSON timeline + camera director + dialogue system, built from storyboards", [["core/timeline.js", /export function validateCutscene/], ["runtime/story.js", /playCutscene\(id\) \{/], ["core/storyboard.js", /export function storyboard\(board/]]],
  // §19.2 · Production pipeline
  ["§19.2", "Storyboard (5-column doc)", [["core/storyboard.js", /CUT, PICTURE, ACTION \/ STAGE, DIALOGUE \/ AUDIO,/], ["core/storyboard.js", /export const BOARD_FPS = 24/]]],
  ["§19.2", "Animatic (Timeline with grey-box poses and temp audio)", [["runtime/story.js", /const GESTURES = Object\.freeze/], ["runtime/audio.js", /case "tuneThree":/]]],
  ["§19.2", "Layout (final cameras)", [["core/storyboard.js", /export function cutKeys\(cs, cut, t0, dur/]]],
  ["§19.2", "Key animation", [["data/rook.js", /export const ROOK_POSES/]]],
  ["§19.2", "In-betweens/cleanup", [["runtime/rig.js", /rot = mix\(p\.from, p\.to, k\)/], ["core/stepping.js", /export function steppedFrame/]]],
  ["§19.2", "Compositing (post FX)", [["runtime/grade.js", /export class MemoryGrade/], ["main.js", /canvas\.style\.filter = strong \? "invert\(1\)/]]],
  // §19.3 · The Ep 18 storyboard
  ["§19.3", "Storyboard: Ep 18, \"I'll Hold the Door\" (Cal's sacrifice)", [["data/story/cutscenes.js", /export const EP18_BOARD = Object\.freeze/], ["data/story/ep18.js", /cutscene: "ep18_door"/], ["data/story/ep18.js", /cutscene: "ep18_dusk"/]]],
  ["§19.3", "the Lore Archive's Theatre mode allows frame-stepping (§15.10)", [["data/theatre.js", /id: "ep18_door", title: "I'll Hold the Door"/], ["runtime/story.js", /th\.step = 1 \/ \(this\.cut\?\.cs\.fps \?\? 30\)/]]],
  // §19.4 · Ultimate template
  ["§19.4", "Camera snaps behind the character, background desaturates", [["data/cinematics.js", /beat: "activation", sec: 0\.4/], ["runtime/shots.js", /"ult-activate": \{ mode: "behind"[^}]*desaturate: true/]]],
  ["§19.4", "Low-angle orbit, environment reacts (debris floats, wind)", [["data/cinematics.js", /beat: "charge", sec: 0\.8/], ["runtime/shots.js", /"ult-charge": \{ mode: "orbit"/]]],
  ["§19.4", "ECU on eyes or grimoire, technique name shout", [["data/cinematics.js", /beat: "closeup", sec: 0\.6/], ["data/rook.js", /voice: \{ closeup: "ultName" \}/], ["data/cinematics.js", /voice: \{ closeup: "teamName" \}/]]],
  ["§19.4", "Whip pan or rapid dolly through the battlefield", [["data/cinematics.js", /beat: "release", sec: 0\.8/], ["data/cinematics.js", /"ult-release": \{ speedLines/]]],
  ["§19.4", "Impact frame (2–4f) + hitstop", [["data/cinematics.js", /"ult-flash": \{ impact: 4, strong: true/]]],
  ["§19.4", "Wide; debris, smoke, **silence beat**", [["data/cinematics.js", /beat: "aftermath", sec: 0\.8/], ["runtime/shots.js", /"ult-aftermath": \{ mode: "wide"/]]],
  ["§19.4", "Blend back to the gameplay camera; damage numbers resolve", [["runtime/camera.js", /if \(this\.returnBlend > 0\)/]]],
  ["§19.4", "**Timeline asset with standard track slots** (Camera, Character anim, VFX, SFX, Voice, Post-FX)", [["data/cinematics.js", /export const TRACKS = Object\.freeze\(\{ camera: E\.CameraCue, anim: null, vfx: E\.SpawnVfx, sfx: E\.PlaySound, voice: E\.SpawnVfx, post: E\.CameraCue \}\)/]]],
  ["§19.4", "building a new one is filling a template, not starting over", [["data/cinematics.js", /export function sequence\(spec/], ["data/rook.js", /add\(sequence\(\{/]]],
  // §19.5 · Camera language library
  ["§19.5", "Camera presets, each a reusable data asset", [["core/storyboard.js", /export const CAMERA_PRESETS = Object\.freeze/]]],
  ["§19.5", "**Pan, Tilt, Dolly, Tracking, Crane, Zoom, Orbit, Handheld shake, Whip pan, Snap zoom, Dutch angle, Low angle, High angle, ECU, Wide establishing**", [["core/storyboard.js", /export const SECTION_19_5 = Object\.freeze/]]],
  ["§19.5", "Storyboards reference them by name (`CAM_WHIP_PAN_FAST`)", [["data/story/cutscenes.js", /cam: "CAM_WHIP_PAN_FAST"/]]],
  // §19.6 · 2D-in-3D visual language
  ["§19.6", "2–3 tone ramp shader + rim light", [["runtime/look.js", /export function toon2\(scene, name, hex/], ["runtime/look.js", /col \+= rimColor \*/]]],
  ["§19.6", "**inverted-hull outlines**", [["runtime/look.js", /export function inkOutline/]]],
  ["§19.6", "full-screen post effect (invert / posterize / high-contrast lines), 2–4 frames", [["main.js", /"invert\(1\) contrast\(1\.7\) saturate\(0\)"/]]],
  ["§19.6", "screen-space overlay shader driven by camera velocity or cue", [["template.html", /\.speeding \.speedlines \{/], ["data/rook.js", /key: "speed"/]]],
  ["§19.6", "authored smear meshes or vertex-stretch shader on major attacks only", [["runtime/rig.js", /animTier\(a\) !== "A"/], ["runtime/vfx.js", /const smeared = i < this\.fan/]]],
  ["§19.6", "flipbook textures (2D-drawn) on particles, not physically simulated effects", [["runtime/vfx.js", /hitSpark\(at, size = 1\.8/], ["main.js", /vfx\.hitSpark\(at,/]]],
  ["§19.6", "an **animation stepping** option per move", [["core/abilities.js", /step: o\.step \?\? null/], ["core/stepping.js", /if \(ability\.step\)/]]],
  ["§19.6", "Pose playback can be sampled at 12 fps (\"animating on twos\")", [["core/stepping.js", /SIM_HZ = 60, STEP_FPS = 12/], ["runtime/rig.js", /steppedFrame\(a, raw, \{ on: Rig\.twos \}\)/]]],
  ["§19.6", "Major attacks switch to full-rate for smoothness at the key moment", [["core/stepping.js", /mode === "hybrid" \? f : arrive\(s, act\)/]]],
  // §19.6.1 · Color grading and character shading
  ["§19.6.1", "**Shadows shift hue**", [["runtime/look.js", /const toward = 245/]]],
  ["§19.6.1", "One crisp shadow step on characters (two tones), plus a soft gradient only on large forms", [["runtime/look.js", /softShadow = 0/]]],
  ["§19.6.1", "a bright **\"angel ring\" band**", [["runtime/look.js", /"angel ring"/], ["runtime/look.js", /export function glossOf/]]],
  ["§19.6.1", "Large and glossy, with layered highlights (one big, one small)", [["runtime/rig.js", /Layered eye highlights \(one big, one small\)/]]],
  ["§19.6.1", "**tinted dark lines** (local color, darkened)", [["runtime/look.js", /export function lineOf/]]],
  ["§19.6.1", "a **rim light** on every character", [["runtime/look.js", /m\.setColor3\("rimColor"/]]],
  ["§19.6.1", "Soft bloom on light sources, magic, and highlights", [["main.js", /new BB\.GlowLayer\("glow"/]]],
  ["§19.6.1", "Painterly and slightly softer, lower in contrast than characters", [["runtime/look.js", /export function toon\(scene, name, hex\)/], ["runtime/sets.js", /fogDensity/]]],
  ["§19.6.1", "stay **colorful-dark**", [["runtime/sets.js", /clear: "#14111f", fog: "#1d1830"/]]],
  // §19.7 · Animation quality tiers
  ["§19.7", "Stepped (on twos)", [["core/stepping.js", /A: Object\.freeze\(\{ name: "Standard", mode: "twos"/]]],
  ["§19.7", "Hybrid: stepped anticipation, full-rate release", [["core/stepping.js", /B: Object\.freeze\(\{ name: "Major", mode: "hybrid"/]]],
  ["§19.7", "Authored per shot", [["core/stepping.js", /C: Object\.freeze\(\{ name: "Cinematic", mode: "full"/]]],
  // §19.8 · Accessibility
  ["§19.8", "Toggles for camera shake, motion blur, impact-frame flashes", [["template.html", /data-a11y="shake"/], ["template.html", /data-a11y="blur"/], ["template.html", /data-a11y="flashes"/]]],
  ["§19.8", "impact frames are softened to a dim flash when off", [["main.js", /if \(!settings\.flashes\) \{ canvas\.style\.filter = "brightness\(1\.35\)"/]]],
  ["§19.8", "speed lines", [["template.html", /data-a11y="speedLines"/]]],
  ["§19.8", "skip/shorten Ultimates", [["main.js", /const ULT_MODES = \["full", "short", "off"\]/]]],
];

// Named, with the reason; held to exactly these.
const EXCEPTIONS = [
  ["§19.1", "Ultimate sequences", "Skyrender plays in 2.6 s, under §19.1's 3 to 6: Phase 2 tuned it to the fight (the field holds only for its charge), and stretching it would lock the player longer; the other T2, a Team Attack, runs 4 s on the template's defaults"],
  ["§19.2", "Audio & voice", "the game has no voice acting: lines are text with a placeholder tick (§10), so the voice track carries the technique's name as a card; the audio itself is synthesized in the browser"],
  ["§19.3", "Speed lines, smear frames", "cut 012's speed lines play; smear frames are drawn on a blade's swing (a major attack's release), and Rook's lunge in a cutscene isn't a swing"],
  ["§19.6", "later, SDF face shadows", "§19.6 marks them 'later': faces take a lighter shadow (toon2's softShadow) instead; a signed-distance face shadow needs an authored face map per head, which the heads (built, not painted) don't have"],
  ["§19.7", "locomotion", "walking and running stay full rate: the body glides through the world, so a held leg pose slides the planted foot up to half a metre a drawing; hair, scarves, capes and coat tails are held on twos instead"],
];

test("§19, line by line: every line checked is still in the design, and the code that answers it is there", () => {
  const missing = [];
  for (const [where, words, at] of CHECKLIST) {
    assert.ok(inSec(where, words), `${where}: "${words}" is no longer in the design (update the checklist with it)`);
    for (const [file, re] of at) if (!has(file, re)) missing.push(`${where} · ${words} · ${file} ${re}`);
  }
  assert.deepEqual(missing, [], "lines with nothing answering them");
  for (const n of ["§19.1", "§19.2", "§19.3", "§19.4", "§19.5", "§19.6", "§19.6.1", "§19.7", "§19.8"]) assert.ok(CHECKLIST.some(([w]) => w === n), `${n} is on the list`);
  assert.ok(CHECKLIST.length >= 50);
});

test("The exceptions are exactly these five, each in the design, with the reason", () => {
  assert.equal(EXCEPTIONS.length, 5);
  for (const [where, words, why] of EXCEPTIONS) {
    assert.ok(inSec(where, words), `${where}: "${words}"`);
    assert.ok(why.length > 40, where);
    assert.ok(!CHECKLIST.some(([, w]) => w === words), `${words} can't be both answered and an exception`);
  }
  // Still true: Skyrender's length, and nothing stepping the walk cycle.
  assert.match(src("data/rook.js"), /phases: \{ startup: 48, active: 72, recovery: 36 \}/);
  assert.doesNotMatch(src("runtime/motion.js"), /steppedFrame|core\/stepping/);
});

test("the hand-drawn spark is a flipbook: four drawings on one sheet, a new one every twelfth of a second, on the big blows", () => {
  const vfx = src("runtime/vfx.js");
  assert.match(vfx, /const SHEET = 4, cell = 128/);
  assert.match(vfx, /const frame = Math\.floor\(f\.life \* 12\);/);
  assert.match(vfx, /f\.tex\.uOffset = frame \/ this\.flipFrames;/);
  assert.doesNotMatch(vfx.slice(vfx.indexOf("hitSheet"), vfx.indexOf("this.flipFrames = SHEET")), /ParticleSystem|gravity|velocity/, "drawn, not simulated");
  assert.match(src("main.js"), /if \(heavy \|\| finisher\) vfx\.hitSpark\(/);
});
