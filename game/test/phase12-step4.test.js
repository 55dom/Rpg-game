// Phase 12 Step 4: character quests (§18.1: "bond-gated, 3 parts each, reveal backstory and change relationships")
// and Fork & Fold (§18.2: Quest A "The Black Knight's Well", Quest B "Letters from the Fen", Quest C "Burned Memory").
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SIDE_QUESTS, SIDE_PLACES, SIDEQUEST_SCRIPT } from "../src/data/story/sidequests.js";
import { QUESTS } from "../src/data/quests.js";
import { QuestLog, DONE } from "../src/core/quests.js";
import { BONDS } from "../src/data/bonds.js";
import { ITEMS } from "../src/data/items.js";
import { Inventory } from "../src/core/inventory.js";
import { FlagStore, compileExpr, truthy } from "../src/core/flags.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { ZONES } from "../src/data/zones.js";
import { constrain } from "../src/sim/bounds.js";
import { rumorBoard } from "../src/data/rumors.js";
import { found } from "../src/core/clues.js";

const nodes = parseScript(WORLD_SCRIPT, "world");
const play = (node, f, picks = []) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  let i = 0;
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") lines.push(s);
    if (s.type === "options") r.choose(picks[i++] ?? 0);
    if (s.type === "command") { cmds.push(`${s.name} ${(s.args ?? []).join(" ")}`); if (s.name === "quest" && s.args[0] === "start") f.set(`Q_${s.args[1].toUpperCase()}`, f.get(`Q_${s.args[1].toUpperCase()}`) || 1); }
  }
  return { lines, cmds, text: lines.map((l) => l.text).join(" ") };
};
const holds = (expr, f) => truthy(compileExpr(expr)(f));
const CQ = ["juno", "bas", "tamsin", "lio", "dagrun"];

test("a character quest for each of the squad who's there through the story: three parts, bond-gated, a keepsake at the end", () => {
  for (const id of CQ) {
    const q = QUESTS[`cq_${id}`];
    assert.ok(q && q.character === id, id);
    assert.equal(q.available, `$BOND_EV_${id.toUpperCase()}_2`);
    assert.equal(q.stages[0].done, `$BOND_EV_${id.toUpperCase()}_2`, "part one: the rank-2 chapter");
    assert.equal(q.stages[1].done, `$BOND_EV_${id.toUpperCase()}_4`, "part two: the rank-4 chapter");
    assert.ok(q.stages.length >= 3 && q.stages.length <= 4, "part three: out in the world, and a scene");
    assert.ok(BONDS[id].events[2] && BONDS[id].events[4] && nodes[BONDS[id].events[4]], `${id}'s rank-4 chapter is written`);
    const it = ITEMS[q.reward.item];
    assert.ok(it && it.kind === "charm" && it.keepsake && it.price === 0, `${id}: a keepsake`);
  }
  assert.ok(!QUESTS.cq_cal, "Cal's chapter ends at Ep 18 (and the clues are counted)");
});

test("the character quests run start to finish on the flags: they start themselves, and each part opens the next", () => {
  const f = new FlagStore(), log = new QuestLog(QUESTS, f);
  const auto = Object.keys(QUESTS).filter((id) => QUESTS[id].character);
  const tick = () => { for (const id of auto) if (log.canStart(id)) log.start(id); log.update(); };
  tick(); assert.equal(log.state("cq_bas"), 0, "not before their first chapter");
  f.set("BOND_EV_BAS_2", 1); tick();
  assert.equal(log.state("cq_bas"), 2, "started, and part one's already done");
  f.set("BOND_EV_BAS_4", 1); tick(); assert.equal(log.state("cq_bas"), 3);
  // Part three: the stone by the mill race, then the wall.
  const stone = ZONES.thornwick.pickups.find((p) => p.id === "millStone");
  assert.ok(holds(stone.show, f));
  play(stone.node, f); tick();
  assert.ok(!holds(stone.show, f)); assert.equal(log.state("cq_bas"), 4);
  const r = play("W_Bas", f);
  assert.match(r.text, /mended walls all winter/);
  tick(); assert.equal(log.state("cq_bas"), DONE);
  assert.equal(f.get("BAS_WALL_MENDED"), 1, "the relationship changes: a flag later lines can read");
});

test("each part three: where to go, who says what, and the finale's flag", () => {
  // Juno: the loom at the vendor's house, Juno there in person.
  const f = new FlagStore({ Q_CQ_JUNO: 3 });
  const juno = ZONES.home.cast.find((c) => c.id === "juno");
  assert.ok(holds(juno.when, f) && !holds(juno.when, new FlagStore()));
  assert.match(play("W_Juno", f).text, /vendor's house/);
  assert.match(play(juno.node, f).text, /my mum's thread/i);
  assert.equal(f.get("CQ_JUNO_DONE"), 1);
  // Tamsin: the shell, then the third line.
  const t = new FlagStore({ Q_CQ_TAMSIN: 3 });
  play(ZONES.thornwick.pickups.find((p) => p.id === "shell").node, t);
  assert.match(play("W_Tamsin", t).text, /The sea went home/);
  assert.equal(t.get("TAMSIN_THIRD_LINE"), 1);
  // Lio: the fish cook's wrapping paper, then laughing.
  const l = new FlagStore({ Q_CQ_LIO: 3 });
  assert.match(play("W_Cook", l).text, /bookbinder/);
  assert.match(play("W_Lio", l).text, /cookbook/);
  assert.equal(l.get("LIO_LAUGHED"), 1);
  const lh = new FlagStore({ Q_CQ_LIO: 3, CQ_LIO_PAGES: 1 });
  assert.match(play("W_LioHall", lh).text, /cookbook/, "the same ending if he's at the Hall");
  // Dagrun: the Proctor's twenty-year-old ribbon.
  const d = new FlagStore({ Q_CQ_DAGRUN: 3 });
  assert.match(play("W_Proctor", d).text, /Twenty years in my desk/);
  assert.match(play("W_Dagrun", d).text, /Last isn't a rank, Holt/);
  assert.equal(d.get("DAGRUN_RIBBON_GIVEN"), 1);
});

test("keepsakes are given, not sold, and only once", () => {
  const inv = new Inventory();
  assert.ok(inv.give("junoKnot")); assert.ok(!inv.give("junoKnot")); assert.ok(!inv.give("nope"));
  assert.ok(inv.equip("charm1", "junoKnot"));
  const shop = readFileSync(new URL("../src/data/items.js", import.meta.url), "utf8");
  for (const id of ["junoKnot", "basStone", "tamsinLine", "lioBookmark", "dagrunRibbon"]) assert.ok(!new RegExp(`stock: \\[[^\\]]*"${id}"`).test(shop), `${id} isn't in a shop`);
  assert.match(readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8"), /r\.item && this\.inventory\.give\(r\.item\)/);
});

test("Fork & Fold (§18.2): Mirren saved, Quest A, she takes you; lost, Quest B, a letter tells it; both fold at the same well", () => {
  // A: saved.
  const a = new FlagStore({ EP4_DONE: 1, MIRREN_SAVED: 1, EP24_DONE: 1 });
  assert.ok(holds(QUESTS.well_a.available, a) && !holds(QUESTS.well_b.available, a));
  const fensAt = (f) => ZONES.fens.cast.filter((c) => c.id === "mirren" && holds(c.when, f));
  assert.equal(fensAt(a).length, 1);
  assert.ok(play("W_Mirren", a).cmds.includes("quest start well_a"));
  assert.equal(fensAt(a)[0].node, "W_MirrenWell", "she's at the well now, waiting");
  const seenA = play("W_MirrenWell", a);
  assert.match(seenA.text, /bleeding|blood/);
  assert.ok(a.get("WELL_SEEN") && a.get("WELL_DETAIL"));
  // B: lost.
  const b = new FlagStore({ EP4_DONE: 1, MIRREN_SAVED: 0, EP24_DONE: 1 });
  assert.ok(holds(QUESTS.well_b.available, b) && !holds(QUESTS.well_a.available, b));
  assert.equal(fensAt(b).length, 0, "no Mirren in the Fens");
  const letter = ZONES.lighthouse.pickups.find((p) => p.id === "wellLetter");
  assert.ok(holds(letter.show, b));
  assert.ok(play(letter.node, b).cmds.includes("quest start well_b"));
  const well = ZONES.fens.pickups.find((p) => p.id === "oldWell");
  assert.ok(holds(well.show, b));
  play(well.node, b);
  assert.ok(b.get("WELL_SEEN") && !b.get("WELL_DETAIL"), "the fold: the same well, less of what happened at it");
  // The residue: the rumor board remembers it, with more if you were shown.
  const board = (f) => rumorBoard(new FlagStore({ ...Object.fromEntries(f.values), SABLE_ENCOUNTER: 1 })).seen.join(" ");
  assert.match(board(a), /Mirren watched him/); assert.match(board(b), /a letter from Mirren's grandmother/);
  assert.doesNotMatch(board(a) + board(b), /door|mind the step|lantern/i, "no new bridge clue (§15.5's are counted)");
});

test("Quest C (§18.2, A5): with the notebook read, Lio tries to rebuild the last minute; it burns out at the light", () => {
  const f = new FlagStore({ CLUE_A4: 1, EP28_DONE: 1 });
  assert.ok(holds(QUESTS.burned.available, f));
  assert.ok(!holds(QUESTS.burned.available, new FlagStore({ EP28_DONE: 1 })), "only with the notebook (A4)");
  assert.ok(!holds(QUESTS.burned.available, new FlagStore({ CLUE_A4: 1, EP28_DONE: 1, EP48_DONE: 1 })), "never after the reveal");
  assert.ok(play("W_Lio", f).cmds.includes("quest start burned"));
  const petal = ZONES.hollowmarch.pickups.find((p) => p.id === "petal");
  assert.ok(holds(petal.show, f));
  play(petal.node, f);
  const r = play("W_Lio", f);
  assert.match(r.text, /And then the light/);
  assert.match(r.text, /The light destroyed the memory itself/, "§15.5's alibi, word for word");
  assert.ok(found(f, "A5"));
});

test("the places: open ground, in zones on the map by then; the scripts' speakers are the cast; no clue words in the character quests", () => {
  for (const [k, p] of Object.entries(SIDE_PLACES)) {
    const q = constrain({ x: p.x, z: p.z }, 0.45, ZONES[p.zone].bounds);
    assert.ok(Math.hypot(q.x - p.x, q.z - p.z) < 0.01, `${k} (${p.zone}) is clear`);
  }
  const cqText = ["CQ_Juno_Loom", "CQ_MillStone", "CQ_Bas_Wall", "CQ_Shell", "CQ_Tamsin_Shell", "CQ_Lio_Pages", "CQ_Dagrun_Ribbon"].map((n) => JSON.stringify(nodes[n].body)).join(" ")
    + ["B_Tamsin_4", "B_Lio_4", "B_Dagrun_4"].map((n) => JSON.stringify(nodes[n].body)).join(" ");
  assert.doesNotMatch(cqText, /\bcal\b|\bdoors?\b|\bkeys?\b|mind the step|lanterns? (?:go|goes|went|going|is|was) (?:out|dark)|\bwick/i); // (the Last Lanterns may be named; a lantern going out may not)
  const src = readFileSync(new URL("../src/data/story/sidequests.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /\bsable\b/i, "(this file names him in Quest C: so never the other)");
  parseScript(SIDEQUEST_SCRIPT, "sidequests");
});
