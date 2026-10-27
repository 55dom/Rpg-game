import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { EPISODE_46 } from "../src/data/story/ep46.js";
import { EPISODE_47, EP47_SCRIPT } from "../src/data/story/ep47.js";
import { AFTER_EP46 } from "../src/data/story/arc5.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { LEGION_ENEMIES, LINE_ABILITIES } from "../src/reveal/legion.js";
import { KNIGHT_ALLY } from "../src/reveal/allies.js";
import { ZONES } from "../src/data/zones.js";
import { CAST } from "../src/data/story/cast.js";
import { LOOKS } from "../src/runtime/rig.js";
import { EventType as E } from "../src/core/abilities.js";

const nodes = parseScript(EP47_SCRIPT, "e47");
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s); if (s.type === "options") r.choose(pick); }
  return { f, lines, text: lines.map((l) => l.text).join(" ") };
};
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const bridge = (opts = {}) => { const w = new World({ seed: 7, bounds: ZONES.bridge.bounds, ...opts }); w.drainEvents(); return w; };
const LINE = { kind: "lineSoldier", rows: 3, cols: 4, at: { x: 0, z: 6 }, gap: [2, 1.8] };
const kill = (w, f) => { f.combatant.health.set(0); w.emit({ type: "kill", attacker: w.player, defender: f }); };

test("The reveal has its own folder, and only there: the Line and the masked knight's side of the bridge live in src/reveal/", () => {
  assert.equal(LEGION_ENEMIES.lineSoldier.stats.name, "Demon Soldier");
  assert.ok(LEGION_ENEMIES.lineMarshal && LOOKS.lineSoldier && LOOKS.lineMarshal && LOOKS.knightAlly);
  for (const f of ["data/story/ep47.js", "data/story/arc5.js", "sim/siege.js", "data/enemies.js", "data/companions.js", "runtime/rig.js"]) {
    assert.doesNotMatch(src(f), /\bdemons?\b|ash line|ash eleven/i, f);
    assert.doesNotMatch(src(f), /\bsable\b/i, f);
  }
  assert.doesNotMatch(src("data/story/ep47.js"), /\bcal\b|calder|CAL_[A-Z]/);
});

test("The Line drills one thing from its first day: left, left, back, cut; the cut can't be blocked", () => {
  const moves = LINE_ABILITIES.Drill.events.filter((e) => e.type === E.Move).map((e) => (e.key === "left" ? "left" : e.value < 0 ? "back" : "cut"));
  assert.deepEqual(moves, ["left", "left", "back", "cut"]);
  assert.ok(LINE_ABILITIES.Drill.hit.unblockable);
  assert.ok(LEGION_ENEMIES.lineSoldier.traits.frontalGuard, "a wall: guards up until they strike");
});

test("The Siege: three ranks at the start and the Marshal at the rear; a meter that falls whatever you do, slower for every one you put down", () => {
  const spec = { meter: { label: "x", start: 1, end: 0.6, seconds: 10, perKill: 0.05 }, line: { ...LINE, every: 120, max: 14 }, rear: { kind: "lineMarshal", at: { x: 0, z: 30 }, floor: 0.5 } };
  const w = bridge(), s = new Siege(w, spec).start();
  assert.equal(w.liveEnemies.filter((f) => f.kind === "lineSoldier").length, 12);
  assert.equal(s.rear.kind, "lineMarshal");
  assert.equal(s.rear.brain.aggroRange, 0, "he keeps to the rear");
  s.rear.combatant.takeDamage(1e7);
  assert.ok(s.rear.alive && s.rear.combatant.health.normalized >= 0.5, "not yours to finish");
  assert.deepEqual(w.gauge, { label: "x", value: 1 });
  let frames = 0;
  while (!s.done && frames < 2000) { s.step(); frames++; }
  assert.ok(Math.abs(frames - 600) < 5, `about ten seconds without a kill (${frames})`);
  // With kills it takes longer, but it still always gets there: the arrival comes at a threshold, never a loss.
  const w2 = bridge(), s2 = new Siege(w2, spec).start();
  let f2 = 0;
  while (!s2.done && f2 < 5000) { s2.step(); f2++; if (f2 % 60 === 0) { const e = w2.liveEnemies.find((x) => x.kind === "lineSoldier"); if (e) s2.onEvent({ type: "kill", attacker: w2.player, defender: e }); } }
  assert.ok(s2.done && f2 > frames + 60, `slower with kills (${f2} > ${frames})`);
  assert.ok(f2 <= frames * 3 + 5, `but it still gets there: at worst at a third of the pace (${f2})`);
});

test("The Line keeps coming: a new rank at the rear while too few stand, never an empty bridge; marks fire as the meter falls", () => {
  const spec = { meter: { start: 1, end: 0, seconds: 100 }, line: { ...LINE, rows: 1, every: 60, max: 6 },
    marks: [{ meter: 0.99, cue: "collapse1", set: { BRIDGE_FALLEN: 1 } }] };
  const w = bridge(), s = new Siege(w, spec).start();
  assert.equal(s.standing, 4);
  for (let i = 0; i < 61; i++) s.step();
  assert.equal(s.standing, 8, "a rank at the rear");
  for (let i = 0; i < 61; i++) s.step();
  assert.equal(s.standing, 8, "not past the cap");
  for (const f of w.liveEnemies) kill(w, f);
  s.step();
  assert.ok(s.standing >= 8, "never an empty bridge");
  for (let i = 0; i < 70; i++) s.step();
  const marks = s.drainMarks();
  assert.equal(marks.length, 1);
  assert.equal(marks[0].cue, "collapse1");
  assert.equal(s.drainMarks().length, 0, "once");
  s.end();
  assert.equal(w.enemies.length, 0);
  assert.equal(w.gauge, null);
});

test("The masked knight beside the Lanterns: a guest, not a squadmate; one cut is enough; he murmurs to the ones he puts down, no more often than he should", () => {
  assert.ok(KNIGHT_ALLY.guest);
  assert.ok(KNIGHT_ALLY.options().every((o) => o.ability.hit.damage >= LEGION_ENEMIES.lineSoldier.stats.maxHealth), "one cut");
  const w = bridge({ companions: ["juno", "knightAlly"] });
  const k = w.companions.find((c) => c.kind === "knightAlly");
  assert.ok(k.guest);
  assert.match(src("runtime/hud.js"), /world\.companions\.filter\(\(c\) => !c\.guest\)\.forEach/, "not on the party panel");
  const s = new Siege(w, { line: LINE, until: { kills: 99 }, killLines: [{ by: "knightAlly", of: "lineSoldier", say: ["Masked", "Rest, soldier."], every: 300 }] }).start();
  const soldiers = w.liveEnemies;
  s.onEvent({ type: "kill", attacker: k, defender: soldiers[0] });
  s.onEvent({ type: "kill", attacker: k, defender: soldiers[1] });
  s.onEvent({ type: "kill", attacker: w.player, defender: soldiers[2] });
  assert.deepEqual(s.drainLines(), [["Masked", "Rest, soldier."]]);
  for (let i = 0; i < 301; i++) s.step();
  s.onEvent({ type: "kill", attacker: k, defender: soldiers[3] });
  assert.equal(s.drainLines().length, 1);
  assert.equal(s.kills, 4);
});

test("Ep 47 follows Ep 46: hold the bridge, a choice in the chaos, the arrival, his storm, the Marshal, and Rook in his way", () => {
  validateEpisode(EPISODE_47);
  for (const b of EPISODE_47.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); }
  assert.deepEqual(EPISODE_47.setup, { ...AFTER_EP46 });
  assert.equal(EPISODE_46.beats.find((b) => b.type === "preview").nextEpisode, "ep47");
  assert.equal(EPISODE_47.title, "Lanterns in the Smoke", "GDD §15.11");
  const pv = EPISODE_47.beats.find((b) => b.type === "preview");
  assert.equal(pv.nextEpisode, "ep48");
  assert.match(pv.lines.join(" "), /The Other Side of the Door/);
  assert.doesNotMatch(pv.lines.join(" "), /mask|face|crack|break/i, "the preview never shows the mask breaking (§15.11)");
  const fights = EPISODE_47.beats.filter((b) => b.type === "fight");
  assert.deepEqual(fights.map((b) => b.id), ["hold", "hold2", "storm"]);
  for (const b of fights) { assert.equal(b.stage, "bridge"); assert.ok(b.siege); }
  assert.ok(fights[1].siege.meter.end > 0, "the arrival comes at a threshold: the meter never has to empty");
  assert.ok(fights[2].world.companions.includes("knightAlly"));
  assert.deepEqual(fights[2].siege.killLines[0].say, ["Masked", "Rest, soldier."]);
  assert.equal(play("Ep47_Chaos", new FlagStore(), 0).f.get("SIEGE_FIRST"), "juno");
  assert.equal(play("Ep47_Chaos", new FlagStore(), 1).f.get("SIEGE_FIRST"), "bas");
  const arr = play("Ep47_Arrival");
  assert.equal(arr.f.get("SIEGE_ARRIVAL"), 1);
  assert.match(arr.text, /Is he with them/);
  const m = play("Ep47_Marshal");
  assert.ok(m.f.get("GATE_THRONE") && m.f.get("COFFIN_SHIFTED") && m.f.get("MARSHAL_DOWN"));
  assert.match(m.text, /That technique/);
  const body = EP47_SCRIPT.slice(EP47_SCRIPT.indexOf("title: Ep47_Marshal"));
  assert.match(body, /<<fx floor Marshal>>/);
  assert.match(body, /<<cue gateThrone>>[\s\S]*<<cue coffinShift>>/);
  assert.equal(CAST.Marshal.actor, "marshal");
  assert.equal(EPISODE_47.beats.find((b) => b.id === "marshal").cast.find((c) => c.id === "marshal").look, "lineMarshal");
  assert.equal(play("Ep47_Turn").f.get("SIEGE_TURN"), 1);
  assert.match(src("main.js"), /episode: EPISODE_47, script: EP47_SCRIPT/);
});

test("The Lowmarket Bridge: a story-only set, the fight kept north of where the Lanterns hold; its spans fall in on cue; the Gate shows a throne and a coffin", () => {
  const z = ZONES.bridge;
  assert.ok(!z.exits.length);
  const sets = src("runtime/sets.js");
  assert.match(sets, /bridge: buildBridge/);
  const b = sets.slice(sets.indexOf("function buildBridge("), sets.indexOf("function buildIronhold("));
  assert.match(b, /if \(name === "collapse1"\) fall\(0\); if \(name === "collapse2"\) fall\(1\);/);
  assert.match(b, /buildGate\(scene, K, "br", L\.gate\)/);
  assert.match(src("runtime/story.js"), /if \(kind === "floor"\) \{/);
});
