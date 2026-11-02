// Phase 14 Step 1: phones as GDD §20.3 writes them: "a Magic button that opens the 4-spell ring; Ultimate and Team
// Attack appear when charged", "Suspend & resume: autosave when the tab is hidden", and "Battery Saver caps at 30 fps
// with lower resolution".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World, BOND_GAUGE } from "../src/sim/world.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const html = readFileSync(new URL("../template.html", import.meta.url), "utf8");
const pad = html.slice(html.indexOf('<div class="pad">'), html.indexOf('<div class="perf"'));

test("the Magic button opens the four-spell ring (the spells no longer take four buttons of their own)", () => {
  assert.match(pad, /data-magic/);
  const ring = pad.slice(pad.indexOf("data-ring"), pad.indexOf("</div>", pad.indexOf("data-ring")));
  assert.deepEqual([...ring.matchAll(/data-intent="(Spell\d)" data-ring-item/g)].map((m) => m[1]), ["Spell1", "Spell2", "Spell3", "Spell4"]);
  assert.doesNotMatch(pad, /class="b-(pull|edge|wall)"/, "Pull, Edge and Wall live in the ring now");
  assert.match(pad, /class="b-gale" data-intent="Spell1"/, "Gale keeps its own button (§20.3's list: Slash, Heavy, Dodge, Jump, Guard, Gale, Lock)");
  for (const b of ["light", "heavy", "dodge", "jump", "guard", "gale", "lock"]) assert.match(pad, new RegExp(`class="b-${b}"`), b);
  assert.match(html, /\.ring-open \.ring \{ display: block; \}/);
  assert.match(html, /\[data-locked~="Spell2"\] \.r-pull, \[data-locked~="Spell3"\] \.r-edge, \[data-locked~="Spell4"\] \.r-wall/, "a page not yet written isn't in the ring");
  const c = src("runtime/controls.js");
  assert.match(c, /_bindRing\(root, magic, ring\)/);
  assert.match(c, /if \(r\.hot\) \{ this\.presses\.push\(Intent\[r\.hot\.dataset\.intent\]\); setOpen\(false\); return; \}/, "hold, slide, let go: that spell");
  assert.match(c, /r\.sticky = true; clearTimeout\(r\.timer\); r\.timer = setTimeout\(\(\) => setOpen\(false\), 2500\);/, "or tap, and tap the spell");
  assert.match(src("main.js"), /for \(const b of root\.querySelectorAll\('\[data-intent="Spell1"\]'\)\) b\.textContent = ink \? "INK" : "GALE";/, "renamed in the ring too");
  assert.match(html, /Hold MAGIC and slide to a spell/);
});

test("Ultimate and Team Attack appear when charged", () => {
  assert.match(html, /\.pad \.b-ult \{[^}]*display: none;/); assert.match(html, /\.surge-full \.pad \.b-ult \{ display: block; \}/);
  assert.match(html, /\[data-team~="bas"\] \.pad \.b-bas::after, \[data-team~="juno"\] \.pad \.b-juno::after \{ content: "TEAM";/);
  assert.match(src("runtime/hud.js"), /\["bas", "juno"\]\.filter\(\(k\) => world\.teamReady\(k\)\)/);
  const w = new World({ seed: 4, companions: ["bas", "juno"], teamAttacks: ["bas"] }); w.drainEvents();
  w.spawnEnemy("acolyte", 0, 3); w.drainEvents();
  assert.equal(w.teamReady("bas"), false, "not charged");
  w.bondGauge = BOND_GAUGE.max;
  assert.equal(w.teamReady("bas"), true); assert.equal(w.teamReady("juno"), false, "Juno's isn't unlocked");
  assert.ok(w.callAssist("bas").ok);
  assert.equal(w.teamReady("bas"), false, "spent");
  const odd = new World({ seed: 4, companions: ["bas", "tamsin"], teamAttacks: ["tamsin"] }); odd.bondGauge = BOND_GAUGE.max;
  assert.equal(odd.assistFor("juno")?.kind, "tamsin", "the second button calls the second squadmate");
  assert.equal(odd.teamReady("juno"), true);
});

test("Battery Saver: 30 frames a second at one pixel per CSS pixel; the 60 Hz fight underneath doesn't change", () => {
  const main = src("main.js");
  assert.match(main, /twos: true, battery: false, difficulty: "knight" \};/, "off by default, remembered");
  assert.match(html, /data-a11y="battery"[^>]*>BATTERY SAVER</);
  assert.match(main, /if \(settings\.battery && now - last < 1000 \/ 30 - 4\) return;/);
  assert.match(main, /get cap\(\) \{ return this\.saver \? Math\.min\(1, maxRatio\) : maxRatio; \}/);
  assert.match(main, /get target\(\) \{ return this\.saver \? 30 : 60; \}/, "the adaptive resolution aims at 30 then, not 60");
  assert.match(main, /const ticks = running \? clock\.advance\(dt \* scale\) : 0;/, "a long frame runs two fixed steps: the same frame data (§20.3 Logic)");
});

test("suspend & resume: a hidden tab pauses, and out in the world it saves", () => {
  const main = src("main.js");
  const h = main.slice(main.indexOf('document.addEventListener("visibilitychange"'));
  assert.match(h, /if \(state\.started && !state\.paused\) \{ state\.paused = true;/);
  assert.match(h, /if \(state\.mode === "story" && story\.roaming && story\.zone\) story\.saveNow\(\);/);
  assert.match(src("runtime/story.js"), /onBeat: \(\) => this\.autosave\(\)/, "an episode saves at every beat already");
});
