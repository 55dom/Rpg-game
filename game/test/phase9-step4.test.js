import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");

test("§19.8's toggles, all in one place (the controls card), phones included: flashes, shake, blur, speed lines, Ultimates", () => {
  for (const k of ["flashes", "shake", "blur", "speedLines", "ult", "sound", "frameData", "assist"]) assert.match(tpl, new RegExp(`data-a11y="${k}"`), k);
  assert.match(tpl, /<h3>ACCESSIBILITY<\/h3>/);
  assert.doesNotMatch(tpl, /\.a11y[^{]*\{[^}]*display: none/, "never hidden on a small screen");
  const main = src("main.js");
  assert.match(main, /const ULT_MODES = \["full", "short", "off"\]/);
  assert.match(main, /settings\.ult = ULT_MODES\[\(ULT_MODES\.indexOf\(settings\.ult\) \+ 1\) % ULT_MODES\.length\]/, "the Ultimates button cycles full → short → skip");
});

test("Each toggle does what it says", () => {
  const main = src("main.js");
  assert.match(main, /camera\.shakeScale = settings\.shake \? 1 : 0/, "shake");
  assert.match(main, /root\.classList\.toggle\("no-speedlines", !settings\.speedLines\)/, "speed lines");
  assert.match(tpl, /\.no-speedlines \.speedlines \{ display: none !important; \}/);
  assert.match(main, /if \(settings\.blur\) \{ root\.classList\.add\("hopblur"\)/, "motion blur");
  assert.match(main, /rig\?\.snapshot && settings\.blur/, "and the ghost trail");
  assert.match(main, /e\.key === "ultName" && settings\.ult === "full"/, "the Ultimate's name card only in full");
  assert.match(main, /settings\.ult !== "off" && !\(settings\.ult === "short" && ULT_SHORT_SKIPS\.has\(e\.key\)\)/, "short skips to the release; off skips the cinematic");
  assert.match(main, /const ULT_SHORT_SKIPS = new Set\(\["ult-activate", "ult-charge", "ult-closeup"\]\)/);
});

test("Camera shake off: no shake at all, only a small push-in", async () => {
  class V3 { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } copyFrom(v) { return this.set(v.x, v.y, v.z); } }
  const was = globalThis.BABYLON;
  globalThis.BABYLON = { Vector3: V3, FreeCamera: class { constructor(n, p) { this.position = p; this.fov = 0.8; } setTarget() {} } };
  try {
    const { FollowCamera } = await import("../src/runtime/camera.js");
    const cam = new FollowCamera(null);
    cam.shake(0.8); assert.ok(cam.trauma > 0.7);
    cam.trauma = 0; cam.shakeScale = 0;
    cam.shake(0.8); assert.equal(cam.trauma, 0, "still");
    cam.kick(1); assert.ok(cam.punch > 0 && cam.punch <= 0.3 + 1e-9, "a small push-in is all that's left");
  } finally { globalThis.BABYLON = was; }
});

test("Settings are remembered on this device (and a blocked store is fine); people who ask for less motion start with less", () => {
  const main = src("main.js");
  assert.match(main, /const SETTINGS_KEY = "unwritten-settings"/);
  assert.match(main, /try \{\s*const saved = JSON\.parse\(localStorage\.getItem\(SETTINGS_KEY\)/);
  assert.match(main, /catch \{ \/\* nothing saved, or no storage: the defaults stand \*\/ \}/);
  assert.match(main, /const saveSettings = \(\) => \{ try \{ localStorage\.setItem\(SETTINGS_KEY, JSON\.stringify\(settings\)\); \} catch/);
  assert.match(main, /typeof v === typeof settings\[k\] && \(k !== "ult" \|\| ULT_MODES\.includes\(v\)\)/, "only known settings, of the right kind");
  assert.match(main, /shake: !reduced, blur: !reduced, speedLines: !reduced, ult: reduced \? "short" : "full"/, "prefers-reduced-motion");
  assert.match(main, /applySettings\(false\);/, "the first apply doesn't overwrite what's saved");
  assert.match(main, /if \(save\) saveSettings\(\);/);
});

test("Settings come before the first frame of play: a button on the title opens them, over the title, at the top of the card", () => {
  assert.match(tpl, /<button class="go alt" data-start-settings>SETTINGS & ACCESSIBILITY<\/button>/);
  assert.match(src("main.js"), /\[data-start-settings\]"\)\?\.addEventListener\("click", \(e\) => \{ e\.stopPropagation\(\); sfx\.play\("ui"\); toggleHelp\(true\); \}\)/);
  const z = (sel) => Number(new RegExp(`\\n\\${sel} \\{[^}]*z-index: (\\d+)`).exec(tpl)[1]);
  assert.ok(z(".help") > z(".start"), "the card sits over the title");
  assert.ok(tpl.indexOf("<h2>SETTINGS</h2>") < tpl.indexOf("<h2>CONTROLS</h2>"), "first thing on the card");
  assert.match(tpl, /Story · Episodes 1–70/, "and the title says what's there now");
});
