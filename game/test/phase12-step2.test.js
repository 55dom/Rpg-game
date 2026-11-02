// Phase 12 Step 2: Technique Points and the mentors (§17: "sword techniques (new combo nodes, cancels, air options);
// training at HQ with mentors (Dagrun, Bas, Brannoc)"). A drill a day earns a point; the points buy techniques that
// change Rook's combo graph and what Rook can do in the air.
import { test } from "node:test";
import assert from "node:assert/strict";
import { TECHNIQUES, MENTORS, DRILL_POSTS, TP_FLAG, techFlag, learnTechnique, learnedTechniques, TP_PER_RANK } from "../src/data/techniques.js";
import { KNIGHT_RANKS } from "../src/data/ranks.js";
import { buildRookGraph, techniqueAbilities, ROOK_ABILITIES, ROOK_POSES } from "../src/data/rook.js";
import { Intent, parseMask } from "../src/core/input.js";
import { canCancel } from "../src/core/abilities.js";
import { World } from "../src/sim/world.js";
import { FlagStore } from "../src/core/flags.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { ZONES } from "../src/data/zones.js";

const nodes = parseScript(WORLD_SCRIPT, "world");
const options = (node, f) => { const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node); let s = r.next(); while (s.type !== "options" && s.type !== "end") s = r.next(); return s.options ?? []; };
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const edges = (g, id) => g.nodes.get(id)?.edges.map((e) => `${Object.keys(Intent).find((k) => Intent[k] === e.intent)}>${e.ability.id}`) ?? [];

test("six techniques, two a mentor, of §17's three kinds: combo nodes (Bas), air options (Dagrun), cancels (Brannoc)", () => {
  assert.equal(Object.keys(TECHNIQUES).length, 6);
  const by = (m) => Object.values(TECHNIQUES).filter((t) => t.mentor === m);
  assert.deepEqual(by("bas").map((t) => t.kind), ["combo node", "combo node"]);
  assert.deepEqual(by("dagrun").map((t) => t.kind), ["air option", "air option"]);
  assert.deepEqual(by("brannoc").map((t) => t.kind), ["cancel", "cancel"]);
  assert.deepEqual(Object.keys(MENTORS), ["bas", "dagrun", "brannoc"]);
});

test("the combo graph: nothing new without the techniques; with them, the new routes", () => {
  const plain = buildRookGraph(() => 0);
  assert.deepEqual(edges(plain, "L3"), ["Light>L4"]);
  assert.deepEqual(edges(plain, "L4"), []);
  const g = buildRookGraph(() => 0, ROOK_ABILITIES, undefined, { techniques: new Set(Object.keys(TECHNIQUES)) });
  assert.ok(edges(g, "L3").includes("Heavy>Launcher"), "Rising Edge");
  assert.ok(edges(g, "L4").includes("Heavy>Stonebreaker"), "Stonebreaker");
  assert.ok(edges(g, "L4").includes("Light>L1"), "Unbroken");
  assert.ok(g.globals.some((x) => x.intent === Intent.Block && x.ability.id === "Guard"), "Iron Answer");
  assert.ok(ROOK_POSES.Stonebreaker && ROOK_ABILITIES.Stonebreaker.hit.posture > ROOK_ABILITIES.L4.hit.posture, "it breaks guards");
});

test("the cancels: Iron Answer opens Block in a swing's recovery; Stonebreaker and Unbroken only off a fourth swing that landed", () => {
  const A = techniqueAbilities(new Set(["ironAnswer", "stonebreaker", "unbroken"]));
  const rec = A.L1.startup + A.L1.active + 1;
  assert.ok(!canCancel(ROOK_ABILITIES.L1, rec, false, Intent.Block));
  assert.ok(canCancel(A.L1, rec, false, Intent.Block));
  assert.ok(!canCancel(A.L4, 18, false, Intent.Heavy), "a whiffed fourth swing goes nowhere");
  assert.ok(canCancel(A.L4, 18, true, Intent.Heavy) && canCancel(A.L4, 18, true, Intent.Light));
  assert.equal(techniqueAbilities(new Set(["ironAnswer"])), techniqueAbilities(new Set(["ironAnswer"])), "built once");
});

test("in the world: the fourth swing lands, Heavy comes down as Stonebreaker", () => {
  const w = new World({ seed: 5, techniques: ["stonebreaker"] }); w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  w.spawnEnemy("bulwark", 0, -2.6); w.drainEvents();
  const e = w.fighters.find((f) => f.kind === "bulwark"); e.brain = null; e.combatant.health.max = e.combatant.health.current = 1e6;
  w.player.pos.x = 0; w.player.pos.z = -4; w.player.yaw = 0;
  const seen = new Set();
  for (let i = 0; i < 160; i++) {
    if (i % 13 === 0 && i < 52) w.press(Intent.Light);
    if (i === 64) w.press(Intent.Heavy);
    w.step(); w.drainEvents();
    if (w.player.runner.current) seen.add(w.player.runner.current.id);
  }
  assert.ok(seen.has("L4"), [...seen].join(","));
  assert.ok(seen.has("Stonebreaker"), [...seen].join(","));
});

test("Dagrun's air options: two dashes with Second Wind, two jumps with Hang Time; one each without", () => {
  const plain = new World({ seed: 2 }); run(plain, 3);
  assert.equal(plain.player.airDashes, 1); assert.equal(plain.player.airJumps, 1);
  const w = new World({ seed: 2, techniques: ["secondWind", "hangTime"] }); run(w, 3);
  assert.equal(w.player.airDashes, 2); assert.equal(w.player.airJumps, 2);
  w.setTechniques([]); run(w, 2);
  assert.equal(w.player.airDashes, 1, "forgotten (a new save): back to one");
});

test("points: a drill a day, and one with every rank; learning spends them, once", () => {
  for (const r of KNIGHT_RANKS.slice(1)) assert.equal(r.reward.flags.TECH_POINTS, TP_PER_RANK, r.name);
  const f = new FlagStore({ [TP_FLAG]: 2 });
  assert.ok(!learnTechnique(f, "nope"));
  assert.ok(learnTechnique(f, "risingEdge"));
  assert.ok(!learnTechnique(f, "risingEdge"), "known already");
  assert.ok(!learnTechnique(f, "stonebreaker"), "1 left, it costs 2");
  assert.equal(f.get(TP_FLAG), 1);
  assert.deepEqual(learnedTechniques(f), ["risingEdge"]);
});

test("the training menus: Bas and Dagrun after the chat, Brannoc at Ironhold; Bas takes on Brannoc's once he's gone", () => {
  const f = new FlagStore({ CAN_TRAIN: 1, DRILL_READY: 1, [TP_FLAG]: 1 });
  const bas = options("T_Menu_bas", f), en = (o, re) => o.find((x) => re.test(x.text))?.enabled;
  assert.equal(en(bas, /Drill/), true);
  assert.equal(en(bas, /Rising Edge/), true);
  assert.equal(en(bas, /Stonebreaker/), false, "two points");
  assert.equal(en(bas, /Iron Answer/), false, "Brannoc's, while Brannoc can teach it");
  f.set("BRANNOC_DEAD", 1);
  assert.equal(en(options("T_Menu_bas", f), /Iron Answer/), true);
  f.set("DRILL_READY", 0);
  assert.equal(en(options("T_Menu_dagrun", f), /Drill/), false, "once a day");
  assert.ok(options("B_Menu_bas", new FlagStore({ CAN_TRAIN: 1 })).some((o) => o.text === "Training." && o.enabled));
  assert.equal(options("B_Menu_juno", new FlagStore({ CAN_TRAIN: 1 })).some((o) => o.text === "Training."), false, "Juno isn't a mentor");
  const bran = ZONES.ironhold.cast.find((c) => c.id === "brannoc");
  assert.equal(bran.after, "T_Brannoc");
  assert.ok(nodes.T_Brannoc && nodes.T_Menu_brannoc);
});

test("the drills: the Lighthouse ring's straw dummies (posts go up only where there are none); Brannoc's is a bout", async () => {
  const src = (await import("node:fs")).readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  assert.match(src, /world\.dummies\.length \? \[\] : DRILL_POSTS/);
  assert.equal(DRILL_POSTS.length, 2);
  assert.equal(MENTORS.brannoc.drill.goal, "spar");
  assert.ok(MENTORS.bas.drill.n > 0 && MENTORS.dagrun.drill.goal === "air");
});
