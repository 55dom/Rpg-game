import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { World } from "../src/sim/world.js";

// Phase 14 Step 5: GDD §20 (engine & platforms) and §21 (technical architecture), walked line by line the way Phases
// 10–13 walk their chapters. Each line is quoted from the design (the test fails if the words leave it, so the list
// can't drift) and pointed at what answers it. The lines nothing answers are named, with the reason, and held to exactly
// that list.

const root = new URL("../", import.meta.url);
const file = (p) => readFileSync(new URL(/^(template\.html|build\.mjs|package\.json)$/.test(p) ? p : p.startsWith("docs/") ? `../${p}` : `src/${p}`, root), "utf8");
const has = (p, re) => file(p).match(re) !== null;
const GDD = file("docs/GDD.md");
const S20 = GDD.slice(GDD.indexOf("## 20. "), GDD.indexOf("## 21. ")), S21 = GDD.slice(GDD.indexOf("## 21. "), GDD.indexOf("## 22. "));
const sub = (S, n) => S.slice(S.indexOf(`### ${n} `), S.indexOf("### ", S.indexOf(`### ${n} `) + 5) === -1 ? undefined : S.indexOf("### ", S.indexOf(`### ${n} `) + 5));
const inSec = (where, words) => { const n = where.slice(1), S = n.startsWith("20") ? S20 : S21; return (n.includes(".") ? sub(S, n) : S).includes(words); };

const CHECKLIST = [
  // §20 · Decision: Babylon.js in the browser
  ["§20", "Babylon.js 9 (WebGL 2 / WebGPU), JavaScript, runs in the browser", [["template.html", /cdn\.jsdelivr\.net\/npm\/babylonjs@9\.\d+\.\d+\/babylon\.js/], ["main.js", /new BB\.Engine\(canvas/]]],
  ["§20", "the fixed 60 Hz logic clock, abilities as data, the combo graph, attack tokens, pooling, quality tiers", [["core/timing.js", /export class FrameClock/], ["core/abilities.js", /export function defineAbility/], ["core/abilities.js", /ComboGraph/], ["core/ai.js", /export class AttackTokenPool/], ["runtime/vfx.js", /class Pool \{/], ["main.js", /const quality = \{/]]],
  ["§20", "Cutscenes and camera states will be authored as data (JSON timelines)", [["core/timeline.js", /export function validateCutscene/], ["runtime/shots.js", /export const SHOTS/]]],
  // §20.1 · Platforms
  ["§20.1", "Keyboard and mouse or any standard gamepad", [["runtime/controls.js", /navigator\.getGamepads/], ["runtime/controls.js", /KeyJ: Intent\.Light/]]],
  ["§20.1", "Touch controls appear automatically on touch screens", [["main.js", /root\.classList\.toggle\("is-touch", coarse\)/], ["template.html", /\.is-touch \.touch \{ display: block; \}/]]],
  ["§20.1", "60 fps at 1080p on integrated graphics from 2020+", [["main.js", /get target\(\) \{ return this\.saver \? 30 : 60; \}/], ["main.js", /\$\{Math\.round\(fps\)\} FPS/]]], // (measured on real hardware at the Phase 4 gate)
  ["§20.1", "60 fps target, 30 fps floor on 2021+ mid-range phones", [["main.js", /engine\.setHardwareScalingLevel\(1 \/ Math\.min\(devicePixelRatio \|\| 1, mobile \? 1\.5 : 2\)\)/]]],
  ["§20.1", "There is **one codebase and one build**", [["build.mjs", /await writeFile\("dist\/index\.html", page\);/]]],
  // §20.2 · Native performance
  ["§20.2", "one 60 Hz frame of the whole fight simulation costs well under a millisecond", [["sim/world.js", /\n {2}step\(\) \{/]]], // (and measured, below)
  ["§20.2", "Rendering runs on the GPU through **WebGL 2**", [["main.js", /new BB\.Engine\(canvas/]]],
  // §20.3 · Mobile version
  ["§20.3", "Combat runs on a **fixed 60 Hz logic clock** independent of render frame rate", [["main.js", /const ticks = running \? clock\.advance\(dt \* scale\) : 0;/]]],
  ["§20.3", "Floating virtual stick (left half), on-screen buttons (right): Slash, Heavy, Dodge, Jump, Guard, Gale, Lock; drag the upper right to orbit the camera", [["template.html", /data-stick-zone/], ["template.html", /data-look-zone/], ["template.html", /class="b-lock" data-intent="Lock"/]]],
  ["§20.3", "Touch, keyboard, and gamepad all produce the same intents", [["runtime/controls.js", /Keyboard, mouse, gamepad, and touch all produce the same presses/]]],
  ["§20.3", "a **Magic button** that opens the 4-spell ring; Ultimate and Team Attack appear when charged", [["runtime/controls.js", /_bindRing\(root, magic, ring\)/], ["template.html", /\.surge-full \.pad \.b-ult \{ display: block; \}/], ["sim/world.js", /teamReady\(kind\) \{/]]],
  ["§20.3", "+3f parry and perfect-dodge windows; **Smart Combo** (hold Slash to continue the string)", [["sim/world.js", /assistFrames: 3/], ["runtime/controls.js", /this\.touch\.light && this\.smartCombo/]]],
  ["§20.3", "Assists never change damage", [["sim/world.js", /Touch assist: wider parry and perfect-dodge windows\. Never changes damage\./]]],
  ["§20.3", "Only **1** enemy attacks at a time on mobile (2 on PC) through the attack-token pool", [["main.js", /new World\(\{ tokens: mobile \? 1 : 2,/]]],
  ["§20.3", "Touch HUD layout, safe-area aware for notches", [["template.html", /env\(safe-area-inset-right\)/]]],
  ["§20.3", "the frame-data panel starts hidden", [["main.js", /frameData: !mobile/]]],
  ["§20.3", "render resolution capped at 1.5× pixel ratio, smaller glow buffer, fewer arena props and particles", [["main.js", /mainTextureRatio: mobile \? 0\.35 : 0\.5/], ["main.js", /buildArena\(scene, \{ mobile \}\)/], ["runtime/vfx.js", /mobile \? VFX_POOLS\.sparksMobile : VFX_POOLS\.sparks/]]],
  ["§20.3", "later dynamic resolution", [["main.js", /Adaptive resolution: drop render resolution when frames run long/]]],
  ["§20.3", "Autosave when the tab is hidden (`visibilitychange`)", [["main.js", /if \(state\.mode === "story" && story\.roaming && story\.zone\) story\.saveNow\(\);/]]],
  ["§20.3", "Engine from CDN (cached across sites)", [["template.html", /cdn\.jsdelivr\.net\/npm\/babylonjs@/]]],
  ["§20.3", "\"Battery Saver\" caps at 30 fps with lower resolution", [["main.js", /if \(settings\.battery && now - last < 1000 \/ 30 - 4\) return;/], ["main.js", /get cap\(\) \{ return this\.saver \? Math\.min\(1, maxRatio\) : maxRatio; \}/]]],
  // §20.3 · Supporting stack
  ["§20.3", "**Babylon.js 9** from jsDelivr", [["template.html", /cdn\.jsdelivr\.net\/npm\/babylonjs@9/]]],
  ["§20.3", "Modern JavaScript (ES modules) with JSDoc types", [["core/ai.js", /@param \{AttackOption\} o/], ["core/save.js", /^import|^export/m]]],
  ["§20.3", "**esbuild** → one self-contained HTML file", [["build.mjs", /import \{ build \} from "esbuild";/]]],
  ["§20.3", "`node --test`", [["package.json", /"test": "node --test"/]]],
  ["§20.3", "Own `Controls` layer: keyboard, mouse, Gamepad API, Pointer Events", [["runtime/controls.js", /export class Controls/], ["runtime/controls.js", /addEventListener\("pointerdown"/]]],
  ["§20.3", "Own camera director (follow, lock-on, shake, punch-in)", [["runtime/camera.js", /Third-person camera with lock-on framing, shake \(trauma\), and punch-in/]]],
  ["§20.3", "JSON timelines played by the same event system as abilities", [["core/timeline.js", /export function validateCutscene/], ["runtime/story.js", /playCutscene\(id\) \{/]]],
  ["§20.3", "a **Yarn-style plain-text script** with our own small parser (`core/script.js`)", [["core/script.js", /export class DialogueRunner/]]],
  ["§20.3", "Web Audio API: synthesized placeholders now", [["runtime/audio.js", /globalThis\.AudioContext \|\| globalThis\.webkitAudioContext/]]],
  ["§20.3", "Plain JS/JSON modules (abilities, enemies, combo graphs)", [["data/enemies.js", /export const ENEMIES/], ["data/rook.js", /export const ROOK_ABILITIES/]]],
  ["§20.3", "Designer-editable; validated on load", [["core/abilities.js", /throw new RangeError\(`\$\{o\.id\}: negative frames`\)/], ["sim/episode.js", /export function validateEpisode/], ["core/quests.js", /export function validateQuests/]]],
  ["§20.3", "Versioned JSON in IndexedDB, with export/import", [["runtime/idb.js", /export function idbBackend/], ["core/save.js", /exportSaves\(\) \{/], ["core/save.js", /importSaves\(doc\) \{/]]],
  // §21.1 · Layered module map
  ["§21.1", "FlagStore · SaveService · QuestService · DialogueService · PartyService", [["core/flags.js", /export class FlagStore/], ["core/save.js", /export class SaveStore/], ["core/quests.js", /export function validateQuests/], ["core/script.js", /export class DialogueRunner/], ["sim/world.js", /\n {2}tagSwap\(/]]],
  ["§21.1", "BondService · ReputationService · ZoneStreamer · PoolService · AudioService", [["core/bonds.js", /export class Bonds/], ["sim/law.js", /export function canSee/], ["runtime/sets.js", /export const SET_STREAMING/], ["runtime/vfx.js", /class Pool \{/], ["runtime/audio.js", /export class Sfx/]]],
  ["§21.1", "PlayerController ─▶ CombatController ─▶ AbilityRunner ─▶ Hit Detection ─▶ DamageSystem", [["core/abilities.js", /export class AbilityController/], ["core/abilities.js", /export class AbilityRunner/], ["sim/overlap.js", /export function boxHitsCapsule/], ["core/combat.js", /export function resolveHit/]]],
  ["§21.1", "Explore / Combat / LockOn / Ability / Ultimate / Cutscene", [["runtime/camera.js", /cue\(name, subject = null\)/], ["runtime/camera.js", /frame\(pos, look,/], ["runtime/shots.js", /"ult-activate"/]]],
  // §21.2 · Everything is an Ability
  ["§21.2", "Light attacks, spells, dodges, enemy attacks, assists, and ultimates are all `AbilityData`, a list of **timed events**", [["core/abilities.js", /export const EventType/], ["data/acolyte.js", /events: \[\{ frame: 10, type: E\.PlaySound/]]],
  ["§21.2", "A new spell is a new data asset.", [["data/rook.js", /add\(\{ id: "TempestEdge"/]]],
  ["§21.2", "New *behavior* only means writing a new **event type**", [["core/abilities.js", /CameraCue: 3/]]],
  // §21.3 · Core data schemas
  ["§21.3", "**CharacterData:**", [["data/companions.js", /export const COMPANIONS = Object\.freeze/]]],
  ["§21.3", "**SpellData (extends AbilityData):**", [["data/pages.js", /export const PAGES = Object\.freeze/]]],
  ["§21.3", "**EnemyData:**", [["data/enemies.js", /export const ENEMIES/]]],
  ["§21.3", "**QuestData:**", [["data/quests.js", /export const QUESTS = \{/], ["core/quests.js", /export function validateQuests/]]],
  ["§21.3", "**ReactionData:**", [["data/reactions.js", /export const REACTIONS = defineReactions\(/]]],
  ["§21.3", "**EpisodeData:**", [["sim/episode.js", /export function validateEpisode/]]],
  // §21.4 · How systems communicate
  ["§21.4", "direct references (Controller → Runner → Hitbox)", [["core/abilities.js", /export class AbilityController/]]],
  ["§21.4", "a **typed event bus**", [["sim/world.js", /emit\(e\) \{ this\.events\.push\(e\);/], ["core/flags.js", /onChange\(fn\)/]]],
  ["§21.4", "Quests don't know about combat; they listen.", [["core/quests.js", /\$|flags/]]], // (and scanned, below)
  ["§21.4", "is the single source of truth", [["core/flags.js", /the single source of truth/]]],
  ["§21.4", "`FlagConditionalObject` toggles Cal's room props", [["runtime/sets.js", /when: \(cond\) =>/], ["runtime/sets.js", /calDarkN = K\.when\("\$CAL_STATE"\)/]]],
  ["§21.4", "Only quests, dialogue, and scripted events *write* it.", [["runtime/story.js", /this\.flags\.set\(/]]], // (and scanned, below: the fight never does)
  // §21.5 · AI
  ["§21.5", "**Finite State Machine** per enemy", [["core/ai.js", /export const BrainState = Object\.freeze/]]],
  ["§21.5", "**utility scoring** for choosing *which* attack", [["core/ai.js", /export function utilityOf/]]],
  ["§21.5", "only N enemies (default 2) may attack the player at once", [["core/ai.js", /constructor\(capacity = 2\)/]]],
  ["§21.5", "full logic within 25m; reduced tick rate (5 Hz) within 60m; dormant beyond", [["sim/world.js", /AI_LOD = Object\.freeze\(\{ full: 25, reduced: 60, every: 12/]]],
  ["§21.5", "Companion AI uses the same framework with an \"ally\" profile", [["core/ai.js", /export class CompanionBrain/], ["core/ai.js", /pickByUtility\(ready, t,/]]],
  // §21.6 · Save system
  ["§21.6", "**Story flags drive the fake-death storyline**", [["runtime/sets.js", /calDarkN = K\.when\("\$CAL_STATE"\)/]]],
  ["§21.6", "Saves never store derived data (e.g., INVESTIGATION_SCORE is recomputed)", [["core/clues.js", /export const investigationScore = \(flags\) =>/], ["core/save.js", /Only source data is stored/]]],
  ["§21.6", "Autosave at episode beats + manual slots", [["runtime/story.js", /onBeat: \(\) => this\.autosave\(\)/], ["core/save.js", /SLOTS = Object\.freeze\(\["auto", "1", "2", "3"\]\)/]]],
  ["§21.6", "A **migration step** per version", [["core/save.js", /const MIGRATIONS = \{/]]],
  // §21.7 · Performance plan
  ["§21.7", "Hero 30–50k tris + 2 LODs (mobile uses LOD1, ~15k)", [["main.js", /LOD\.tess = mobile \? 0\.75 : 1/], ["main.js", /Rig\.outlineRange = mobile \? 20 : 22/]]],
  ["§21.7", "Max 8 active in combat (mobile: 5); attack tokens; pooled", [["sim/world.js", /active: 8, activeMobile: 5/]]],
  ["§21.7", "per-spell particle budget (≤ 300 normal, ≤ 1500 ultimate; **mobile: half**); flipbooks over simulation", [["runtime/vfx.js", /VFX_BUDGET = Object\.freeze\(\{ normal: 300, ultimate: 1500, mobileShare: 0\.5 \}\)/], ["runtime/vfx.js", /hitSpark\(at, size = 1\.8/]]],
  ["§21.7", "Exact box-vs-capsule tests in the pure-JS simulation; no physics engine in combat", [["sim/overlap.js", /export function boxHitsCapsule/]]],
  ["§21.7", "Zone streaming", [["runtime/sets.js", /export const SET_STREAMING/], ["runtime/sets.js", /\n {2}unload\(name\) \{/]]],
  ["§21.7", "LODs", [["runtime/sets.js", /bake\(keep = \[\]\)/], ["runtime/crowd.js", /export const CROWD_LOD/]]],
  ["§21.7", "Distant NPCs are animated impostors / no AI; crowds are cosmetic", [["runtime/crowd.js", /export const CROWD_LOD = Object\.freeze\(\{ near: 30, hide: 70, every: 3 \}\)/]]],
  ["§21.7", "Shared animation groups retargeted across characters", [["runtime/rig.js", /export const LOOKS = \{/]]], // (one rig, driven by each character's pose table)
  ["§21.7", "stepped (on-twos) playback halves evaluation cost", [["runtime/rig.js", /if \(held\.a === a && held\.f === f\) \{ Rig\.poseHeld\+\+; return held\.out; \}/]]],
  ["§21.7", "scripted debris for destruction (pooled, timed despawn)", [["runtime/sets.js", /if \(sm\.age >= sm\.life\) sm\.t\.dispose\(false, false\)/]]],
  ["§21.7", "unload previous zone", [["runtime/sets.js", /for \(const old of this\.recent\.splice\(this\.keep\)\) this\.unload\(old\);/]]],
  ["§21.7", "Pooled VFX, sparks, and damage numbers; no per-frame allocations in combat hot paths", [["runtime/vfx.js", /this\.numbers = new Pool/], ["core/ai.js", /A weighted pick by utility, without allocating/], ["sim/world.js", /in an array kept between frames \(no allocation in the fight's hot path\)/]]],
  ["§21.7", "PC ≤ 1,000; **mobile ≤ 250**", [["main.js", /budget = mobile \? 250 : 400/], ["runtime/sets.js", /BB\.Mesh\.MergeMeshes\(list, true, true\)/]]],
  ["§21.7", "dispose each zone's assets on exit", [["runtime/sets.js", /SET_STREAMING = Object\.freeze\(\{ keep: 4, keepMobile: 2 \}\)/]]],
  // §21.8 · Project layout
  ["§21.8", "**logic never touches rendering**", [["core/ai.js", /^/]]], // (scanned, below)
  ["§21.8", "How to run, test, build, and publish: `docs/DEV.md`", [["docs/DEV.md", /node build\.mjs|build/]]],
];

// Named, with the reason; held to exactly these.
const EXCEPTIONS = [
  ["§20.1", "Wrap the same build as a PWA, or with Capacitor (stores) / Electron or Tauri (Steam)", "the design marks it 'later, optional': a PWA needs a manifest and a service worker served beside the page, which a single-file page published as an artifact can't carry, and a store or Steam wrapper is a release decision, not this build's"],
  ["§20.2", "with **WebGPU** available in Babylon by switching engines", "not switched: Babylon's WebGPU engine compiles GLSL through WebAssembly it downloads from its own servers, outside the hosts the published page may load from, and the toon and outline shaders are GLSL; WebGL 2 runs on every platform §20.1 lists"],
  ["§20.3", "art streams per zone as compressed glTF (Draco/KTX2)", "there's no authored art to stream: every body, set and prop is built from primitives in code (§21.7's 'procedural placeholder rigs'); sets are built on entry and disposed on exit instead (Step 4)"],
  ["§20.3", "game code ~90 KB today", "that was Phase 1; the page now carries all seventy episodes, every set and every fight as code, about 1.7 MB in one file (compressed in transit)"],
  ["§20.3", "recorded SFX and adaptive music layers later", "the design marks them 'later': every sound is synthesized in the browser, and there's no music (Phase 13 named the audio and voice line too)"],
  ["§20.3", "type-checkable later with `tsc --checkJs`", "the design marks it 'later': the code carries JSDoc types, but the build has no TypeScript step (esbuild is its only dependency)"],
  ["§20.3", "Blender → glTF 2.0 (Draco meshes, KTX2 textures)", "as with streaming: nothing is modelled in Blender, so there's no glTF pipeline; the look comes from the toon shader, outlines and the character sheets in code (§29)"],
  ["§20.3", "Git + Git LFS", "Git, yes; LFS would have nothing to track, as there are no large binary assets"],
  ["§21.6", "{ version, player, grimoire, inventory, party, bonds, flags, quests, world, discoveries, lore, settings }", "the blocks are drawn differently: bonds, quests, party, discoveries and lore are flags (§21.4: the FlagStore is the single source of truth), the grimoire's pages are in progress, the world is the zone, arrival and clock, and settings belong to the device, not the save"],
  ["§21.7", "occlusion queries", "sets are merged into 24 m cells, each culled against the view on its own (bake); a GPU occlusion query answers a frame late and, in a browser, costs more than it saves for scenes this size"],
  ["§21.7", "baked lighting where possible", "nothing is painted, so there are no light maps to bake: the sets are lit by a sky light and a sun through the toon ramp, which costs no more"],
  ["§21.7", "Async loading", "after the page itself nothing is downloaded: a set is built from code on entry, during the beat's fade, and saves load from IndexedDB without waiting on anything"],
  ["§21.7", "audio streamed", "the sounds are synthesized as they play; there are no audio files to stream"],
];

test("§20 and §21, line by line: every line checked is still in the design, and the code that answers it is there", () => {
  const missing = [];
  for (const [where, words, at] of CHECKLIST) {
    assert.ok(inSec(where, words), `${where}: "${words}" is no longer in the design (update the checklist with it)`);
    for (const [f, re] of at) if (!has(f, re)) missing.push(`${where} · ${words} · ${f} ${re}`);
  }
  assert.deepEqual(missing, [], "lines with nothing answering them");
  for (const n of ["§20", "§20.1", "§20.2", "§20.3", "§21.1", "§21.2", "§21.3", "§21.4", "§21.5", "§21.6", "§21.7", "§21.8"]) assert.ok(CHECKLIST.some(([w]) => w === n), `${n} is on the list`);
  assert.ok(CHECKLIST.length >= 75);
});

test("the exceptions are exactly these thirteen, each in the design, with the reason", () => {
  assert.equal(EXCEPTIONS.length, 13);
  for (const [where, words, why] of EXCEPTIONS) {
    assert.ok(inSec(where, words), `${where}: "${words}"`);
    assert.ok(why.length > 40, where);
    assert.ok(!CHECKLIST.some(([, w]) => w === words), `${words} can't be both answered and an exception`);
  }
  // Still true: no glTF, no music, no TypeScript step.
  assert.doesNotMatch(file("runtime/sets.js") + file("runtime/rig.js"), /SceneLoader|\.glb|\.gltf/);
  assert.doesNotMatch(file("build.mjs"), /typescript|tsc/);
});

test("§20.2, measured: one 60 Hz frame of the whole fight costs well under a millisecond", () => {
  const w = new World({ seed: 11, companions: true }); w.drainEvents();
  for (let i = 0; i < 8; i++) w.spawnEnemy("acolyte", Math.sin(i) * 6, Math.cos(i) * 6, i);
  w.player.combatant.invulnerableFrames = 1e6;
  for (let i = 0; i < 120; i++) { w.step(); w.drainEvents(); } // warm up
  const n = 600, t0 = performance.now();
  for (let i = 0; i < n; i++) { if (i % 20 === 0) w.press(1); w.step(); w.drainEvents(); }
  const ms = (performance.now() - t0) / n;
  assert.ok(ms < 1, `${ms.toFixed(3)} ms a frame (eight enemies, the squad, Rook)`);
});

test("§21.8 and §21.4, scanned: logic never touches rendering, and the fight never writes the story's flags", () => {
  for (const dir of ["core", "sim"]) {
    for (const f of readdirSync(new URL(`src/${dir}/`, root)).filter((x) => x.endsWith(".js"))) {
      const s = file(`${dir}/${f}`);
      assert.doesNotMatch(s, /from "\.\.\/runtime\/|\bBABYLON\b|\bdocument\.\w|\bwindow\.\w/, `${dir}/${f}`); // (code, not a sentence: "a counter window.")
      // The writers §21.4 allows: the episode director (scripted events) and the Watch's book of crimes seen (reputation,
      // which the law's quests read). Nothing in the fight writes the story's state.
      if (dir === "sim" && !["episode.js", "law.js"].includes(f)) assert.doesNotMatch(s, /flags\.set\(|\.flags\.add\(/, `${dir}/${f} writes a flag`);
    }
  }
  assert.doesNotMatch(file("core/quests.js"), /from "\.\.\/(sim|runtime)\//, "the quests read flags; they don't know the fight");
});
