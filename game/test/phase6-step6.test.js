import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { EPISODE_28 } from "../src/data/story/ep28.js";
import { EPISODE_29, EP29_SCRIPT } from "../src/data/story/ep29.js";
import { EPISODE_30, EP30_SCRIPT } from "../src/data/story/ep30.js";
import { EPISODE_31, EP31_SCRIPT } from "../src/data/story/ep31.js";
import { EPISODE_32, EP32_SCRIPT } from "../src/data/story/ep32.js";
import { AFTER_EP28, AFTER_EP29, AFTER_EP30, AFTER_EP31 } from "../src/data/story/arc4.js";
import { makeSentries, stepSentries, blocked, sees, SENTRY } from "../src/sim/sentry.js";
import { ZONES } from "../src/data/zones.js";
import { constrain } from "../src/sim/bounds.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { WARDEN_STARS } from "../src/data/isles.js";
import { WRAITHE_TUNING } from "../src/data/wraithe.js";
import { rumorBoard } from "../src/data/rumors.js";
import { found } from "../src/core/clues.js";
import { THEATRE } from "../src/data/theatre.js";
import { LOOKS } from "../src/runtime/rig.js";

const nodes = { ...parseScript(EP29_SCRIPT, "e29"), ...parseScript(EP30_SCRIPT, "e30"), ...parseScript(EP31_SCRIPT, "e31"), ...parseScript(EP32_SCRIPT, "e32") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s); if (s.type === "options") r.choose(pick); if (s.type === "command") cmds.push(s); }
  return { f, lines, cmds, text: lines.map((l) => l.text).join(" "), speakers: new Set(lines.map((l) => l.speaker)) };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const tough = (w) => { w.player.combatant.health.max = w.player.combatant.health.current = 1e6; };
const boss = (kind, seed = 3, opts = {}) => { const w = new World({ seed, ...opts }); w.drainEvents(); tough(w); w.spawnWave([kind]); w.drainEvents(); return { w, b: w.boss }; };
const to = (b, frac) => b.combatant.health.set(b.stats.maxHealth * frac);

test("Arc 4 opens after Arc 3 and chains episode to episode, each startable from the menu with what came before", () => {
  const eps = [EPISODE_29, EPISODE_30, EPISODE_31, EPISODE_32];
  for (const ep of eps) {
    validateEpisode(ep);
    for (const b of ep.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); for (const p of b.pickups ?? []) if (p.node) assert.ok(nodes[p.node], p.node); }
    for (const b of ep.beats) if (b.cutscene) validateCutscene(CUTSCENES[b.cutscene]);
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([EPISODE_28, ...eps].map(next), ["ep29", "ep30", "ep31", "ep32", "ep33"]);
  assert.deepEqual(eps.map((e) => e.setup), [{ ...AFTER_EP28 }, { ...AFTER_EP29 }, { ...AFTER_EP30 }, { ...AFTER_EP31 }]);
  for (const who of ["Halvard", "Mag", "Pip", "Luke"]) assert.ok(CAST[who] && LOOKS[CAST[who].actor], who);
  for (const look of ["nell", "tobin", "lance", "warden"]) assert.ok(LOOKS[look], look);
});

test("Boss 11, the Storm Warden: rods rise at 60% and ward it until every one is broken; at 30% thunder walks the star chart", () => {
  const { w, b } = boss("warden", 4);
  b.brain.aggroRange = 0;
  to(b, 0.55);
  const rise = run(w, 3);
  assert.ok(rise.some((e) => e.type === "rodsRise"));
  const rods = w.fighters.filter((f) => f.kind === "rod" && f.alive);
  assert.equal(rods.length, 3);
  assert.ok(b.tags.has("WARDED"), "charged while the rods stand");
  rods.slice(0, 2).forEach((r) => r.combatant.health.set(0));
  run(w, 3);
  assert.ok(b.tags.has("WARDED"), "one rod is enough");
  rods[2].combatant.health.set(0);
  const broken = run(w, 3);
  assert.ok(broken.some((e) => e.type === "rodsBroken") && !b.tags.has("WARDED"));
  to(b, 0.25);
  const stars = run(w, 420);
  assert.ok(stars.some((e) => e.type === "constellation"));
  const warned = stars.filter((e) => e.type === "strikeWarn" && e.strike.kind === "thunder").map((e) => e.strike);
  const home = b.boss.home;
  const onChart = (s) => WARDEN_STARS.some((line) => line.some(([dx, dz]) => Math.hypot(s.x - home.x - dx, s.z - home.z - dz) < 0.01));
  assert.ok(warned.length >= WARDEN_STARS[0].length && warned.every(onChart), "every bolt lands on a star of the chart");
});

test("Ep 31's Wraithe is hunted: black tears take his acolytes one at a time; on an ordinary night they stay", () => {
  const fight = (hunted) => {
    const { w, b } = boss("wraithe", 6, { hunted });
    b.brain.aggroRange = 0;
    to(b, 0.6);
    const log = run(w, 3);
    const called = w.fighters.filter((f) => f.kind === "acolyte");
    assert.equal(called.length, WRAITHE_TUNING.acolytes);
    log.push(...run(w, WRAITHE_TUNING.takenAfter + WRAITHE_TUNING.takenGap + 10));
    return { w, called, log };
  };
  const night = fight(true);
  const taken = night.log.filter((e) => e.type === "taken");
  assert.equal(taken.length, 2);
  assert.ok(night.called.every((a) => !a.alive && a.vanished));
  assert.ok(taken[1].at && taken[0].fighter !== taken[1].fighter);
  const quiet = fight(false);
  assert.ok(!quiet.log.some((e) => e.type === "taken") && quiet.called.every((a) => a.alive));
});

test("The Ferryman: Mag and the Watch (Luke, if he joined), frost where the seams opened, and a fight in the plaza with its fountain", () => {
  const q = EPISODE_31.beats.find((b) => b.id === "quarter");
  assert.deepEqual(q.required, ["mag", "watch", "frost1", "frost2", "frost3"]);
  const watch = q.cast.filter((c) => c.id === "watch");
  assert.deepEqual(watch.map((c) => c.when), ["$LUKE_GUARD", "not $LUKE_GUARD"], "one or the other is always there");
  assert.ok(play("Ep31_Luke").f.get("WATCH_ASKED") && play("Ep31_Sergeant").f.get("WATCH_ASKED"));
  const fight = EPISODE_31.beats.find((b) => b.type === "fight");
  assert.deepEqual(fight.wave, ["wraithe"]);
  assert.ok(fight.world.hunted && fight.world.bounds.solids.some((s) => s.circle && s.circle[0] === 0 && s.circle[1] === 0), "the fountain stands in the fight");
  assert.ok(fight.eventHints.taken);
  const luke = play("Ep31_Dawn", new FlagStore({ LUKE_GUARD: 1 })), holt = play("Ep31_Dawn", new FlagStore());
  assert.ok(luke.speakers.has("Luke") && !luke.speakers.has("Sergeant"));
  assert.ok(holt.speakers.has("Sergeant") && !holt.speakers.has("Luke"));
  assert.ok(luke.f.get("RUMOR_FERRYMAN") && luke.f.get("KIDS_HOME"));
});

test("Encounter III: he waits on the other side of Wraithe's tear, lifts the children out, and says it once; nobody follows it up", () => {
  const step = play("Ep31_Step");
  const said = step.lines.filter((l) => l.speaker === "Masked").map((l) => l.text);
  assert.deepEqual(said, ["Mind the step."], "one line, through the mask");
  const after = step.lines.findIndex((l) => l.speaker === "Masked");
  assert.equal(step.lines[after + 1].speaker, "Tamsin");
  assert.match(step.lines[after + 1].text, /weird thing to say/);
  assert.ok(!step.lines.slice(after + 2).some((l) => /step/i.test(l.text)), "and the scene moves on");
  const f = step.f;
  assert.ok(found(f, "B4"));
  assert.deepEqual([f.get("SABLE_ENCOUNTER"), f.get("WRAITHE_DEAD")], [3, 1]);
  const cs = CUTSCENES.ep31_step;
  validateCutscene(cs);
  assert.ok(cs.events.some((e) => e.pose?.id === "wraithe" && e.pose.name === "down") && cs.events.some((e) => e.hide === "wraithe"));
  assert.ok(cs.events.filter((e) => e.tear).every((e) => e.tear.kind === "pale"), "every tear in it is the Choir's");
  assert.ok(THEATRE.some((s) => s.id === "ep31_step") && !/step/i.test(THEATRE.find((s) => s.id === "ep31_step").title), "the Theatre doesn't point at it");
  assert.notEqual(EPISODE_31.title.toLowerCase().includes("step"), true, "nor does the episode's title");
  const board = rumorBoard(new FlagStore(AFTER_EP31));
  assert.equal(board.seen.length, 4);
  assert.ok(!/mind the step/i.test(board.seen.join(" ")), "the board says what he did, not what he said");
  assert.ok(board.rumors.some((r) => r.theory.startsWith("The Ferryman")));
});

test("sentries walk their beat back and forth, stop at each end and look both ways, and walls hide you from their lanterns", () => {
  assert.ok(blocked({ x: 0, z: 0 }, { x: 10, z: 0 }, [{ box: [4, -1, 6, 1] }]));
  assert.ok(!blocked({ x: 0, z: 0 }, { x: 10, z: 0 }, [{ box: [4, 2, 6, 3] }]));
  assert.ok(blocked({ x: 0, z: 0 }, { x: 0, z: 10 }, [{ circle: [0.3, 5, 0.5] }]) && !blocked({ x: 0, z: 0 }, { x: 0, z: 10 }, [{ circle: [2, 5, 0.5] }]));
  const [s] = makeSentries([{ id: "a", route: [[0, 0], [0, 6]] }]);
  assert.equal(s.yaw, 0, "facing up the route");
  for (let t = 0; t < 6 / SENTRY.speed + 0.1; t += 0.05) stepSentries([s], 0.05, null);
  assert.ok(Math.abs(s.z - 6) < 1e-6 && s.pause > 0, "at the end, waiting");
  const yaws = []; for (let t = 0; t < SENTRY.wait - 0.1; t += 0.05) { stepSentries([s], 0.05, null); yaws.push(s.yaw); }
  assert.ok(Math.max(...yaws) > 0.5 && Math.min(...yaws) < -0.5, "looking one way, then the other");
  for (let t = 0; t < 1; t += 0.05) stepSentries([s], 0.05, null);
  assert.ok(s.z < 6 && Math.abs(Math.abs(s.yaw) - Math.PI) < 1e-6, "and back the way they came");
  // Seen: in the cone, for long enough. A glimpse isn't enough; out of reach, behind them, or behind a wall is nothing.
  const watch = () => makeSentries([{ id: "b", route: [[0, 0]], yaw: 0 }]);
  const look = (at, secs, solids) => { const l = watch(); let hit = null; for (let t = 0; t < secs && !hit; t += 0.05) hit = stepSentries(l, 0.05, at, solids); return hit; };
  assert.ok(look({ x: 0.3, z: 4 }, 1), "in the light");
  assert.ok(!look({ x: 0.3, z: 4 }, SENTRY.notice * 0.6), "a glimpse");
  assert.ok(!look({ x: 0, z: SENTRY.pov.radius + 0.5 }, 2), "out of reach");
  assert.ok(!look({ x: 0, z: -3 }, 2), "behind him");
  assert.ok(!look({ x: 0.3, z: 4 }, 2, [{ box: [-1, 1.5, 1, 2.5] }]), "behind a wall");
});

test("The Crown Ward: Lances on every way in, each beat clear of the walls, and the kitchen door not watched every moment", () => {
  const ward = EPISODE_32.beats.find((b) => b.id === "ward");
  const B = ZONES.aurelin.bounds;
  assert.deepEqual(ward.required, ["severin"]);
  assert.ok(ward.sentries.length >= 4 && ward.spotted.wave.every((k) => k === "lance"));
  for (const d of ward.sentries) for (const [x, z] of d.route) {
    const p = constrain({ x, z }, 0.45, B);
    assert.ok(Math.hypot(p.x - x, p.z - z) < 1e-6, `${d.id} walks through a wall at ${x}, ${z}`);
  }
  const list = makeSentries(ward.sentries), door = ward.cast.find((c) => c.id === "severin"), start = ward.rook;
  let clear = 0, startSeen = false;
  for (let t = 0; t < 60; t += 0.1) {
    stepSentries(list, 0.1, null);
    if (!list.some((s) => sees(s, door, B.solids))) clear++;
    if (t < 4 && list.some((s) => sees(s, start, B.solids))) startSeen = true;
  }
  assert.ok(!startSeen, "nobody's looking where you start");
  assert.ok(clear > 50 && clear < 590, `the kitchen door is watched some of the time, not all of it (${clear}/600 clear)`);
  const quiet = play("Ep32_Door", new FlagStore()), loud = play("Ep32_Door", new FlagStore({ EP32_SPOTTED: 2 }));
  assert.match(quiet.text, /Not a single shout/); assert.match(loud.text, /shouting/);
  const g = play("Ep32_Garden", new FlagStore());
  assert.match(g.text, /A map/); assert.match(g.text, /door drawn under the grate/);
  assert.ok(play("Ep32_Home").f.get("WRIT_MAP") && play("Ep32_Cold").f.get("HESPER_ALDRIC"));
  assert.ok(!/mind the/i.test(EP32_SCRIPT), "nobody else borrows his line");
});

test("leak test: the poor quarter's files never name him, or anyone he might be", () => {
  const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
  for (const p of ["data/story/ep31.js", "data/story/ep32.js", "data/story/arc4.js", "sim/wraithe.js", "data/wraithe.js", "sim/sentry.js"]) {
    assert.ok(!/\bsable\b/i.test(src(p)), `${p} calls him "masked"`);
    assert.ok(!/\bcal\b|calder|CAL_[A-Z]|\bdemons?\b/i.test(src(p)), p);
  }
});
