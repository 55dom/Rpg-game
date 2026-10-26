import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { EPISODE_26 } from "../src/data/story/ep26.js";
import { EPISODE_27, EP27_SCRIPT } from "../src/data/story/ep27.js";
import { EPISODE_28, EP28_SCRIPT } from "../src/data/story/ep28.js";
import { AFTER_EP26, AFTER_EP27 } from "../src/data/story/arc3.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { ECLIPSED_STATS, ECLIPSED_TUNING, LION_FIGURE } from "../src/data/eclipse.js";
import { INSCRIBE, INSCRIPTION, SPELL_LABELS } from "../src/data/inscription.js";
import { rumorBoard } from "../src/data/rumors.js";
import { THEATRE, theatreMark, theatreNotes, theatreList, theatreReset } from "../src/data/theatre.js";
import { PlaytestLog, SURVEYS, playtestReset } from "../src/core/playtest.js";
import { ROOK_ABILITIES } from "../src/data/rook.js";
import { LOOKS } from "../src/runtime/rig.js";

const nodes = { ...parseScript(EP27_SCRIPT, "e27"), ...parseScript(EP28_SCRIPT, "e28") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s); if (s.type === "options") r.choose(pick); if (s.type === "command") cmds.push(s); }
  return { f, lines, cmds, text: lines.map((l) => l.text).join(" ") };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const tough = (w) => { w.player.combatant.health.max = w.player.combatant.health.current = 1e6; };
const boss = (kind, seed = 3, opts = {}) => { const w = new World({ seed, ...opts }); w.drainEvents(); tough(w); w.spawnWave([kind]); w.drainEvents(); return { w, b: w.boss }; };
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

test("Eps 27–28 close Arc 3: chained from Ep 26, each starting from the menu with what came before", () => {
  for (const ep of [EPISODE_27, EPISODE_28]) {
    validateEpisode(ep);
    for (const b of ep.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); }
    for (const b of ep.beats) if (b.cutscene) validateCutscene(CUTSCENES[b.cutscene]);
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([next(EPISODE_26), next(EPISODE_27), next(EPISODE_28)], ["ep27", "ep28", undefined], "Arc 4 isn't written yet");
  assert.deepEqual(EPISODE_27.setup, { ...AFTER_EP26 }); assert.deepEqual(EPISODE_28.setup, { ...AFTER_EP27 });
  for (const who of ["Elodie", "Aldric", "Hesper"]) assert.ok(CAST[who] && LOOKS[CAST[who].actor], who);
});

test("Elodie's Price: Lio comes home either way; Elodie hears something under the city; Severin reads the page", () => {
  const away = play("Ep27_Lio", new FlagStore({ LIO_STATUS: 1, BOND_LIO: 20 }));
  assert.deepEqual([away.f.get("LIO_STATUS"), away.f.get("LIO_RETURNED"), away.f.get("BOND_LIO")], [2, 1, 25]);
  const home = play("Ep27_Lio", new FlagStore({ LIO_STATUS: 2 }));
  assert.ok(!home.f.get("LIO_RETURNED")); assert.ok(/borrows them/.test(home.text));
  const city = EPISODE_27.beats.find((b) => b.id === "city");
  assert.deepEqual(city.required, ["elodie", "lio"], "both are always there to find");
  assert.ok(/crowd behind a door/.test(play("Ep27_Elodie").text));
  assert.equal(play("Ep27_After").f.get("SEVERIN_PAGE"), 1);
  assert.ok(EPISODE_27.beats.some((b) => b.type === "fight" && b.wave[0] === "severinDuel" && b.stage === "towerSteps"), "where they fought the first time");
});

test("Boss 10, dark stars: they drag you toward their cores, and the cores burn; out of reach, nothing", () => {
  const { w, b } = boss("eclipsed", 5);
  b.brain.aggroRange = 0;
  const p = w.player; p.pos.x = p.prev.x = 0; p.pos.z = p.prev.z = -2;
  b.boss.onCustom("darkStars");
  assert.equal(b.boss.wells.length, ECLIPSED_TUNING.wells.count);
  const well = b.boss.wells[0];
  p.pos.x = p.prev.x = well.x + 3; p.pos.z = p.prev.z = well.z;
  const d0 = flat(p.pos, well); run(w, 30);
  assert.ok(flat(p.pos, well) < d0 - 0.5, "pulled in");
  p.pos.x = p.prev.x = well.x + 0.3; p.pos.z = p.prev.z = well.z;
  const hp = p.combatant.health.current; run(w, 40);
  assert.ok(p.combatant.health.current < hp, "the core burns");
  const far = { x: well.x + ECLIPSED_TUNING.wells.pullRadius + 3, z: well.z };
  for (const wl of b.boss.wells) wl.x = wl.z = -999; // move them all out of the way but one
  b.boss.wells[0].x = well.x; b.boss.wells[0].z = well.z;
  p.pos.x = p.prev.x = far.x; p.pos.z = p.prev.z = far.z; run(w, 30);
  assert.ok(Math.abs(p.pos.x - far.x) < 0.3, "out of reach: nothing");
});

test("Boss 10 phases: the Lion wards him; the reflection can't be touched and trades places; the Eclipse clause erases Surge", () => {
  const { w, b } = boss("eclipsed", 6, { companions: ["bas", "juno"] });
  b.combatant.takeDamage(ECLIPSED_STATS.maxHealth * 0.32);
  const lion = run(w, 120).find((e) => e.type === "lionCalled")?.lion;
  assert.ok(lion && b.tags.has("WARDED") && b.boss.damageFactor < 1, "warded while the Lion stands");
  lion.combatant.takeDamage(1e6);
  assert.ok(run(w, 3).some((e) => e.type === "lionFalls") && !b.tags.has("WARDED"));
  b.combatant.takeDamage(ECLIPSED_STATS.maxHealth * 0.26);
  const rise = run(w, 120).find((e) => e.type === "mirrorRise");
  assert.ok(rise && rise.reflection.traits.mirror);
  const r = rise.reflection, hp = r.combatant.health.current;
  w.player.pos.x = w.player.prev.x = r.pos.x; w.player.pos.z = w.player.prev.z = r.pos.z - 1.6; w.player.yaw = w.player.prevYaw = 0;
  w.player.controller.startDirect(ROOK_ABILITIES.L1, w.frame);
  const hits = run(w, 20);
  assert.ok(hits.some((e) => e.type === "mirrorHit") && r.combatant.health.current === hp, "nothing touches it");
  assert.ok(run(w, ECLIPSED_TUNING.swapEvery + 5).some((e) => e.type === "mirrorSwap"), "they trade places");
  w.player.surge.set(w.player.surge.max);
  b.combatant.takeDamage(ECLIPSED_STATS.maxHealth * 0.21);
  assert.ok(run(w, 180).some((e) => e.type === "eclipseClause"), "the clause is read");
  assert.equal(w.player.surge.current, 0);
  assert.ok(w.surgeLock > 0); w._surge(50); assert.equal(w.player.surge.current, 0, "and won't build for a while");
  assert.ok(!r.alive && r.vanished, "the reflection fades for the clause");
});

test("at 12% the lake takes Rook: the first fight ends, and everything he called goes dark", () => {
  const { w, b } = boss("eclipsed", 7);
  b.combatant.takeDamage(1e6);
  assert.ok(b.combatant.health.current > 0, "nobody finishes him");
  b.combatant.takeDamage(ECLIPSED_STATS.maxHealth); // the floor holds at 12%
  const log = run(w, 240);
  assert.ok(log.some((e) => e.type === "eclipseSink") && b.vanished && log.some((e) => e.type === "waveClear"));
});

test("the margin: only Inscribe writes on him; three clauses and the corruption breaks (Ink & Starlight)", () => {
  const { w, b } = boss("eclipsedFinal", 8, { loadout: { Spell1: INSCRIBE }, annotation: true, pages: false, ultimate: false });
  b.brain.aggroRange = 0;
  b.combatant.takeDamage(1e6);
  assert.ok(b.alive, "nothing else can finish him");
  const log = [];
  for (let n = 0; n < 3; n++) {
    const p = w.player; p.pos.x = p.prev.x = b.pos.x; p.pos.z = p.prev.z = b.pos.z - 2; p.yaw = p.prevYaw = 0; p.mana.fill();
    b.runner.interrupt(); b.combatant.staggerFrames = 0;
    p.controller.startDirect(INSCRIBE, w.frame);
    run(w, 50, log);
  }
  const clauses = log.filter((e) => e.type === "inscription").map((e) => e.n);
  assert.deepEqual(clauses, [1, 2, 3]);
  assert.ok(log.some((e) => e.type === "inkStarlight") && run(w, 200).some((e) => e.type === "waveClear"));
  assert.equal(SPELL_LABELS.Inscribe, "Inscribe");
});

test("Annotation: a spell's hit leaves ink, and Rook's hits land harder on anything inked (only once it's awake)", () => {
  const hit = (annotation) => {
    const w = new World({ seed: 2, companions: false, annotation }); w.drainEvents();
    const e = w.spawnEnemy("acolyte", 0, -2.6); w.drainEvents(); e.brain.aggroRange = 0;
    const p = w.player; p.pos.x = p.prev.x = 0; p.pos.z = p.prev.z = -4.2; p.yaw = p.prevYaw = 0;
    p.controller.startDirect(ROOK_ABILITIES.GaleCutter, w.frame); run(w, 40);
    const inked = e.tags.has("INSCRIBED");
    e.combatant.health.set(e.combatant.health.max); e.pos.y = e.prev.y = 0; e.grounded = true; e.vel.y = 0;
    const hp = e.combatant.health.current; w._resolve(p, e, { spec: { ...ROOK_ABILITIES.L1.hit }, ability: ROOK_ABILITIES.L1, hitSet: new Set(), origin: p.pos });
    return { inked, dmg: hp - e.combatant.health.current };
  };
  const on = hit(true), off = hit(false);
  assert.ok(on.inked && !off.inked);
  assert.ok(on.dmg > off.dmg * (INSCRIPTION.bonus - 0.02));
});

test("Eclipse: the clause is written, Hesper takes the corruption, Severin comes home and names a theory", () => {
  const f = new FlagStore(); play("Ep28_Margin", f, 0);
  assert.deepEqual([f.get("ANNOTATION"), f.get("UNDERTEXT_STAGE"), f.get("CLAUSE_I")], [1, 1, "home"]);
  const h = play("Ep28_Hesper", f);
  assert.equal(f.get("HESPER_SEEN"), 1); assert.ok(/Palimpsest/.test(h.text) && /third letter/.test(h.text));
  play("Ep28_Home", f);
  f.set("SABLE_ENCOUNTER", 2); f.set("SABLE_NAMED", 1);
  assert.ok(rumorBoard(f).rumors.some((r) => r.theory.startsWith("Aurek Valcourt")), "the board's primary wrong answer");
  const crypt = EPISODE_28.beats.find((b) => b.id === "crypt");
  assert.equal(crypt.set.CRYPT_FLOWER, 1);
  assert.ok(CUTSCENES.ep28_crypt.actors.some((a) => a.look === "masked"), "kneeling at the grave");
  assert.ok(play("Ep28_Survey").cmds.some((c) => c.name === "survey"), "and the end-of-arc survey");
  const fin = EPISODE_28.beats.find((b) => b.id === "final");
  assert.equal(fin.world.loadout.Spell1, INSCRIBE); assert.ok(fin.world.annotation);
  assert.ok(LION_FIGURE.lines.every(([a, c]) => LION_FIGURE.stars[a] && LION_FIGURE.stars[c]), "the Lion is drawn star to star");
  assert.ok(LOOKS.reflection.alpha < 1 && LOOKS.lion.form === "stars");
});

test("the Theatre: watched scenes are kept; the Annotated Edition opens only on a rewatch, after the story's answers", () => {
  theatreReset();
  assert.ok(theatreList().every((s) => !s.seen));
  for (const id of THEATRE.map((s) => s.id)) assert.ok(CUTSCENES[id], id);
  theatreMark("ep24_tear", "seen");
  assert.ok(theatreList().find((s) => s.id === "ep24_tear").seen);
  const revealed = new FlagStore({ CAL_IDENTITY_REVEALED: 1 }), before = new FlagStore();
  assert.deepEqual(theatreNotes("ep24_tear", revealed), [], "a first replay has no notes");
  theatreMark("ep24_tear", "rewatch");
  assert.equal(theatreNotes("ep24_tear", before).length, 0, "nothing is pointed at before the answers");
  assert.ok(theatreNotes("ep24_tear", revealed).length > 0);
  theatreReset();
});

test("the playtest kit: opt-in only; each clue logged once when first seen; the survey keeps the guess and what had been found", () => {
  playtestReset();
  let t = 1000; const f = new FlagStore(), log = new PlaytestLog(f, { now: () => t, where: () => ({ episode: "ep24" }) });
  f.set("CLUE_A1", 1);
  assert.equal(log.data.clues.length, 0, "nothing without opting in");
  log.setOptIn(true); t = 5000;
  f.set("CLUE_B1", 1); f.set("CLUE_B1", 1); f.set("MERIT", 3);
  assert.deepEqual(log.data.clues.map((c) => [c.clue, c.at, c.episode]), [["B1", 4000, "ep24"]]);
  log.rewatch("ep24_tear");
  const s = log.survey("arc3", { guess: SURVEYS.arc3.guesses[0], sure: "A hunch", own: "" });
  assert.deepEqual(s.cluesFound.sort(), ["A1", "B1"]);
  const out = JSON.parse(log.export());
  assert.equal(out.surveys.length, 1); assert.equal(out.rewatches[0].scene, "ep24_tear");
  assert.ok(!/\bcal\b|calder/i.test(JSON.stringify(SURVEYS)), "no suspect the game doesn't already suggest");
  playtestReset();
});

test("leak test: the arc's last files name nobody they shouldn't", () => {
  const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
  for (const p of ["data/story/ep27.js", "data/story/ep28.js", "data/eclipse.js", "data/inscription.js", "data/theatre.js", "sim/eclipse.js", "core/playtest.js"])
    assert.ok(!/\bcal\b|calder|CAL_[A-Z]|\bdemons?\b/i.test(src(p)) || p === "data/theatre.js", p);
  assert.ok(!/\bcal\b|calder|\bdemons?\b/i.test(src("data/theatre.js").replace("$CAL_IDENTITY_REVEALED", "")), "theatre.js only waits on the reveal flag");
  for (const p of ["data/story/ep27.js", "data/story/ep28.js", "data/theatre.js", "sim/eclipse.js"]) assert.ok(!/\bsable\b/i.test(src(p)), p);
});

test("main.js only calls story methods and properties that exist (a missing one silently stalls every scene)", async () => {
  const { StoryPlayer } = await import("../src/runtime/story.js").catch(() => ({}));
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const src = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  const called = [...new Set([...main.matchAll(/\bstory\.([a-zA-Z_]\w*)\s*\(/g)].map((m) => m[1]))];
  const missing = called.filter((n) => !(StoryPlayer?.prototype && n in StoryPlayer.prototype) && !new RegExp(`(^|\\n)\\s*(async\\s+)?(get\\s+)?${n}\\s*\\(`).test(src) && !new RegExp(`this\\.${n}\\s*=`).test(src));
  assert.deepEqual(missing, []);
  assert.ok(!/story\.timeScale/.test(main), "the scene clock is story.sceneDt(dt)");
});
