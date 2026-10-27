import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { Intent } from "../src/core/input.js";
import { EPISODE_48 } from "../src/reveal/ep48.js";
import { EPISODE_49, EP49_SCRIPT } from "../src/reveal/ep49.js";
import { AFTER_EP48, AFTER_EP49 } from "../src/reveal/arcs.js";
import { ASH_WEAR, ASH_EMPTY, ASH_KIT, TRIAL_KNIGHT_TUNING } from "../src/reveal/backlash.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";

const nodes = parseScript(EP49_SCRIPT, "e49");
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const camp = (opts = {}) => { const w = new World({ seed: 7, bounds: ZONES.camp.bounds, origin: { x: 0, z: -2 }, kit: ASH_WEAR, ...opts }); w.drainEvents(); return w; };
const beat = (id) => EPISODE_49.beats.find((b) => b.id === id);
/** Every line a node can say, every branch taken (options are walked one at a time). */
const lines = (title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") { const shown = s.options.filter((o) => o.enabled || !o.tags?.includes("secret")); r.choose(shown[Math.min(pick, shown.length - 1)].index); }
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};

test("Ep 49 follows Ep 48; it's Backlash; it's a memory (all but the door); the player wears someone else's body", () => {
  validateEpisode(EPISODE_49);
  assert.equal(EPISODE_48.beats.find((b) => b.type === "preview").nextEpisode, "ep49");
  assert.deepEqual(EPISODE_49.setup, { ...AFTER_EP48 });
  assert.equal(EPISODE_49.title, "Backlash");
  assert.equal(EPISODE_49.memory, true);
  assert.equal(beat("door").memory, false, "the door opens on the bridge, in the present");
  assert.equal(beat("in").memory, false);
  assert.ok(CUTSCENES.ep49_in.events.some((e) => e.memory === true), "the colour drains during the door");
  assert.equal(EPISODE_49.world.kit, ASH_WEAR);
  assert.equal(beat("lastLine").world.kit, ASH_EMPTY, "the Last Line at 0★");
  for (const b of EPISODE_49.beats) {
    if (b.node) assert.ok(nodes[b.node], b.node);
    if (b.intro) assert.ok(nodes[b.intro], b.intro);
    for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) { if (c.node) assert.ok(nodes[c.node], c.node); if (c.look) assert.ok(LOOKS[c.look], c.look); }
    if (b.cutscene) { assert.ok(CUTSCENES[b.cutscene], b.cutscene); validateCutscene(CUTSCENES[b.cutscene]); }
  }
  assert.match(src("main.js"), /from "\.\/reveal\/ep49\.js"/);
  assert.equal(AFTER_EP49.EP49_DONE, 1);
  assert.match(src("runtime/story.js"), /setMemory\?\.\(!!\(beat\.memory \?\? this\.ep\?\.memory\), true\)/);
  assert.match(src("runtime/grade.js"), /new BB\.PostProcess\("memoryGrade"/, "the grade is on the 3D view (a post-process), never the HUD");
});

test("Everyone who speaks is in the cast; the present-day voice is Cal's, the soldier he was is Eleven (the player)", () => {
  for (const node of Object.values(nodes)) {
    for (const s of node.body ?? []) if (s.speaker) assert.ok(CAST[s.speaker], `${node.title}: ${s.speaker}`);
  }
  const all = Object.keys(nodes).flatMap((t) => [0, 1, 2].map((k) => lines(t, { TRIED_TO_OBEY: 1 }, k).out)).flat();
  for (const l of all) if (l.speaker) assert.ok(CAST[l.speaker], l.speaker);
  assert.equal(CAST.Eleven.actor, "player");
  assert.match(lines("Ep49_Barracks").text, /Bunkmate: That is enough\.[\s\S]*Cal: I was wrong\./);
  assert.ok(!/Je suis|L'homme/i.test(EP49_SCRIPT + JSON.stringify(EPISODE_49)), "never");
});

test("Ch 1: a soldier's body (slow, a hop, no magic); the drill is LEFT, LEFT, BACK, CUT: out of the backstep, the Demon Slash", () => {
  assert.equal(ASH_KIT.L1.startup, 12, "a 12-frame thrust");
  assert.equal(ASH_KIT.Dodge.recovery, 30);
  assert.equal(ASH_KIT.Dodge.id, "Dodge", "the world still knows it's a dodge");
  assert.ok(ASH_KIT.DashStrike.tags.includes("drill"));
  const w = camp();
  assert.equal(w.player.kind, "ashSoldier");
  assert.equal(w.player.combatant.health.max, 150);
  w.spawnWave(["drillPartner"]); w.drainEvents();
  const e = w.liveEnemies[0], p = w.player;
  e.combatant.takeDamage(1e7);
  assert.ok(e.alive, "he can't be beaten down: the drill is the lesson");
  e.brain.aggroRange = 0;
  p.pos.x = p.prev.x = e.pos.x; p.pos.z = p.prev.z = e.pos.z - 1.6; p.yaw = p.prevYaw = 0;
  const log = []; w.press(Intent.Dodge); run(w, 14, log); w.press(Intent.Light); run(w, 40, log);
  assert.ok(log.some((x) => x.type === "drill"), "the backstep, then the cut");
  assert.equal(beat("drill").endOn, "drill");
  assert.match(beat("drill").tutorial.map((t) => t.text).join(" "), /LEFT, LEFT, BACK, CUT/);
});

test("The march: \"Continue formation.\" \"Mind the step.\" Walk to the body, if you like. Nothing happens", () => {
  const cs = CUTSCENES.ep49_march;
  assert.ok(cs.events.some((e) => e.caption === "\"Continue formation.\""));
  assert.ok(cs.events.some((e) => e.caption === "\"Mind the step.\""));
  assert.ok(cs.events.some((e) => e.pose?.id === "fallen" && e.pose.name === "down"));
  assert.deepEqual(beat("column").required, ["lineSergeant"], "the body is never required");
  assert.match(lines("Ep49_Body").text, /Nothing happens\. Nobody turns\./);
});

test("Ch 2: Trial 1 is survived, not won (a clock and a Line beside you); in Trial 5 the opening is left alone", () => {
  // The Trial: the Hero Party can't be put down; the Line stands with you; the clock always runs out.
  const w = camp();
  const sp = beat("trial1").siege, s = new Siege(w, sp).start();
  assert.deepEqual(w.liveEnemies.map((f) => f.kind).sort(), ["heroArcher", "heroKnight", "heroSaint"]);
  assert.equal(w.companions.length, 8);
  assert.ok(w.companions.every((c) => c.guest && c.kind === "lineAlly"));
  for (const f of w.liveEnemies) { f.combatant.takeDamage(1e7); assert.ok(f.alive, f.kind); }
  for (let i = 0; i < 60 * 80 && !s.done; i++) s.step();
  assert.ok(s.done, "the clock runs out");
  // Trial 5: ORDER. ATTACK THE KNIGHT.
  const k = camp(); k.spawnWave(["trialKnight"]); k.drainEvents();
  const b = k.boss;
  b.boss.onCustom("chargeEnd");
  assert.ok(k.drainEvents().some((e) => e.type === "opening"));
  b.boss.onHit(k.player);
  assert.ok(k.drainEvents().some((e) => e.type === "memoryCorrect"), "\"No. That's not how it went.\"");
  b.boss.onCustom("chargeEnd");
  let spared = false;
  for (let i = 0; i < TRIAL_KNIGHT_TUNING.opening + 2; i++) { b.boss.step(); if (k.drainEvents().some((e) => e.type === "spared")) spared = true; }
  assert.ok(spared, "let the opening pass, and he's spared");
  assert.equal(beat("trial5").endOn, "spared");
  assert.equal(beat("trial5").awaken.flag, "TRIED_TO_OBEY");
  assert.match(lines("Ep49_Order", { TRIED_TO_OBEY: 1 }).text, /part of me still tried to obey[\s\S]*the sky stayed exactly where it was/);
  assert.doesNotMatch(lines("Ep49_Order").text, /tried to obey/);
});

test("Ch 3: the helm and its circle, the mural, a cut in the memory; then for one shot the King's eye: a star over every soldier", () => {
  assert.deepEqual(beat("caverns").required, ["helm", "mural"]);
  assert.match(lines("Ep49_Helm").text, /a circle, filled in/);
  assert.match(EP49_SCRIPT, /He stands in front of it for a long time\.\n<<splice>>/, "what happened in front of it isn't shown");
  assert.match(EP49_SCRIPT, /<<stars on>>[\s\S]*<<shot eye King Eleven>>[\s\S]*<<stars off>>[\s\S]*Eleven: What exactly are you\?/);
  const gaze = beat("gaze");
  assert.equal(gaze.rookStars, 1);
  assert.ok(gaze.cast.filter((c) => c.id.startsWith("rank")).every((c) => c.stars === 1));
  assert.ok(gaze.cast.filter((c) => c.id === "ghorran" || c.id === "vaelith").every((c) => c.stars === 3));
  assert.match(src("runtime/story.js"), /if \(kind === "eye"\)/);
});

test("Ch 4: the Saint's other prayer can't be stopped; when it completes, the fight is over", () => {
  const w = camp();
  new Siege(w, beat("losing").siege).start();
  const saint = w.liveEnemies.find((f) => f.kind === "heroSacrifice");
  saint.combatant.takeDamage(1e7);
  assert.ok(saint.alive, "she can't be stopped");
  saint.boss.onCustom("prayStart");
  assert.ok(w.drainEvents().some((e) => e.type === "prayer"));
  saint.boss.onCustom("prayEnd");
  assert.ok(w.drainEvents().some((e) => e.type === "sacrifice"));
  assert.equal(beat("losing").endOn, "sacrifice");
  assert.match(EP49_SCRIPT, /Eleven: If death isn't permanent\.\.\.\n<<wait 2>>\n<<shot on Eleven>>\nEleven: \.\.\.what exactly is death\?/);
});

test("Ch 5: the kneel gives the star away for nothing; at 0★ every cut lands lighter; the charge can't be stepped aside from", () => {
  assert.match(EP49_SCRIPT, /Eleven: For the Demon King\.[\s\S]*<<stars on>>[\s\S]*<<star Eleven 0>>[\s\S]*King: \.\.\.Four\.[\s\S]*King: Your service is accepted\. Return to the line\./);
  // 0★: the same cut, lighter.
  const hit = (kit) => {
    const w = camp({ kit }); w.spawnWave(["drillPartner"]); w.drainEvents();
    const e = w.liveEnemies[0], p = w.player; e.brain.aggroRange = 0;
    p.pos.x = p.prev.x = e.pos.x; p.pos.z = p.prev.z = e.pos.z - 1.6; p.yaw = p.prevYaw = 0;
    const before = e.combatant.health.current; w.press(Intent.Light); run(w, 30);
    return before - e.combatant.health.current;
  };
  const full = hit(ASH_WEAR), empty = hit(ASH_EMPTY);
  assert.ok(full > 0 && empty > 0 && empty < full * 0.7, `${empty} vs ${full}`);
  // Whatever you choose, the charge lands; and the body fails, three times.
  for (const pick of [0, 1, 2]) assert.match(lines("Ep49_Charge", {}, pick).text, /throws him back up the runner/);
  assert.equal((EP49_SCRIPT.match(/<<timer [456]>>/g) ?? []).length, 4);
  assert.match(lines("Ep49_Failing", {}, 0).text, /It buckles[\s\S]*Weaker[\s\S]*Nothing\.[\s\S]*He stops trying\./);
});

test("The void: a perfect black circle; two figures with no names and nothing written down; it ends on the grin", () => {
  const cs = CUTSCENES.ep49_void;
  assert.ok(cs.duration >= 85 && cs.duration <= 100, "≈ 95 s: the one scene allowed to run long");
  assert.ok(cs.events.some((e) => e.tear?.kind === "void"), "a perfect black circle");
  assert.match(src("runtime/tears.js"), /export function makeVoid/);
  const ids = cs.actors.map((a) => a.id);
  assert.ok(ids.includes("unkA") && ids.includes("unkB"));
  assert.ok(cs.actors.filter((a) => a.id.startsWith("unk")).every((a) => a.look === a.id), "known only by their ids");
  // What they say is sound and nothing else: no caption while anyone speaks it.
  const speech = cs.events.filter((e) => /^unkSpeech/.test(e.sfx ?? "")).map((e) => e.t);
  assert.ok(speech.length >= 5);
  const captions = cs.events.filter((e) => "caption" in e && e.caption);
  assert.ok(captions.every((c) => c.t < Math.min(...speech)), "the only caption is the King's \"...Five.\"");
  assert.deepEqual(captions.map((c) => c.caption), ["\"...Five.\""]);
  for (const k of ["unkSpeechA", "unkSpeechB", "unkSpeechFaint"]) assert.match(src("runtime/audio.js"), new RegExp(`case "${k}"`));
  // The dying view: the King, the Commanders made human-shaped, the coffin; then the hold; then the grin.
  assert.ok(cs.events.some((e) => e.cue === "lidClose"));
  assert.ok(cs.events.some((e) => e.show === "robedL") && cs.events.some((e) => e.show === "robedR"));
  assert.equal(cs.events.filter((e) => e.t > 32.6 && e.t < 42.5).length, 0, "the hold: nothing happens for far too long");
  assert.ok(cs.events.some((e) => e.show === "grin" && e.t > cs.duration - 3));
  assert.ok(LOOKS.ashSoldierGrin.grin);
  // Nowhere (here, or anywhere in the build) do they get a name.
  const everywhere = [src("reveal/backlash.js"), src("reveal/cutscenes.js"), src("reveal/ep49.js"), src("reveal/cast.js"), src("runtime/audio.js")].join("\n");
  assert.doesNotMatch(everywhere, /\b(butler|maid|archdemons?|musician)\b/i);
  assert.ok(!CAST.unkA && !CAST.unkB);
  assert.equal(beat("void").set.EP49_DONE, 1);
  assert.equal(beat("preview").nextEpisode, "ep50");
});
