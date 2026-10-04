import { test } from "node:test";
import assert from "node:assert/strict";
import { FlagStore, evalExpr } from "../src/core/flags.js";
import { parseScript, DialogueRunner, fillText } from "../src/core/script.js";
import { SaveStore, memoryStorage, migrate, cleanName, SAVE_VERSION } from "../src/core/save.js";
import { EpisodeDirector, validateEpisode } from "../src/sim/episode.js";

/** Run a dialogue to the end, picking options by index from `picks`. Returns everything it produced. */
const play = (runner, picks = []) => {
  const out = [];
  for (let guard = 0; guard < 500; guard++) {
    const s = runner.next();
    out.push(s);
    if (s.type === "end") return out;
    if (s.type === "options") runner.choose(picks.shift() ?? s.options.find((o) => o.enabled).index);
  }
  throw new Error("runaway dialogue");
};

test("flags: unset reads 0, booleans become numbers, listeners fire on change only", () => {
  const f = new FlagStore();
  assert.equal(f.get("NOPE"), 0);
  const seen = [];
  f.onChange((k, v) => seen.push([k, v]));
  f.set("A", true); f.set("A", 1); f.add("B", 2); f.add("B");
  assert.deepEqual(seen, [["A", 1], ["B", 2], ["B", 3]]);
  assert.deepEqual(f.snapshot(), { A: 1, B: 3 });
});

test("expressions: precedence, words, strings, parens, unknown words rejected", () => {
  const f = new FlagStore({ X: 3, NAME: "Juno", WON: 1 });
  assert.equal(evalExpr("$X + 2 * 3", f), 9);
  assert.equal(evalExpr("($X + 2) * 3", f), 15);
  assert.equal(evalExpr("$X >= 3 and not $LOST", f), 1);
  assert.equal(evalExpr("$WON is true or $X > 10", f), 1);
  assert.equal(evalExpr('$NAME == "Juno"', f), 1);
  assert.equal(evalExpr("$MISSING", f), 0);
  assert.throws(() => evalExpr("X + 1", f), /unknown word/);
  assert.throws(() => evalExpr("($X + 1", f), /missing \)/);
  assert.throws(() => evalExpr("alert(1)", f));
});

const SRC = `
title: Start
---
// comment lines are ignored
Moss: Some books are better read twice.
The sweeper goes back to his broom.
<<cam close Moss>>
-> Bold: "Read it twice? There's one page." #bold
    Moss: Then it won't take long.
    <<set $ASKED to 1>>
-> Say nothing. #wry
-> Secret option <<if $KNOWS>>
    Moss: You knew.
<<if $ASKED>>
    Rook: I'll be back.
<<elseif $TEMPER_WRY > 0>>
    Rook: ...
<<else>>
    Rook: Never mind.
<<endif>>
<<jump End>>
===
title: End
tags: short
---
Herald: Next! {They} {is} the last. {Their} book, {name}.
<<stop>>
Herald: never shown
===
`;

test("script: lines, narration, commands, options with tags and conditions, if/elseif, jump, stop", () => {
  const nodes = parseScript(SRC);
  assert.deepEqual(Object.keys(nodes), ["Start", "End"]);
  assert.deepEqual(nodes.End.tags, ["short"]);
  const f = new FlagStore();
  const r = new DialogueRunner(nodes, f, { name: "Ash", pronouns: "she" }).start("Start");
  const out = play(r, [0]);
  assert.deepEqual(out[0], { type: "line", speaker: "Moss", text: "Some books are better read twice.", tags: [] });
  assert.equal(out[1].speaker, null);
  assert.deepEqual(out[2], { type: "command", name: "cam", args: ["close", "Moss"] });
  const opts = out[3];
  assert.equal(opts.type, "options");
  assert.deepEqual(opts.options.map((o) => o.enabled), [true, true, false]);
  assert.equal(opts.options[0].text, 'Bold: "Read it twice? There\'s one page."');
  assert.equal(f.get("TEMPER_BOLD"), 1);
  assert.equal(f.get("ASKED"), 1);
  const lines = out.filter((s) => s.type === "line").map((s) => s.text);
  assert.ok(lines.includes("I'll be back."));
  assert.ok(lines.includes("Next! She is the last. Her book, Ash."));
  assert.ok(!lines.includes("never shown"));
  assert.equal(out.at(-1).type, "end");
});

test("script: the elseif branch and Temper from a wry pick", () => {
  const f = new FlagStore();
  const r = new DialogueRunner(parseScript(SRC), f, { pronouns: "they" }).start("Start");
  const lines = play(r, [1]).filter((s) => s.type === "line").map((s) => s.text);
  assert.equal(f.get("TEMPER_WRY"), 1);
  assert.ok(lines.includes("..."));
  assert.ok(lines.includes("Next! They are the last. Their book, Rook."));
});

test("script: errors carry line numbers; bad jumps and unclosed ifs are caught", () => {
  assert.throws(() => parseScript("title: A\n---\n<<jump Nowhere>>\n==="), /unknown node "Nowhere"/);
  assert.throws(() => parseScript("title: A\n---\n<<if $X>>\nhi\n==="), /without <<endif>>/);
  assert.throws(() => parseScript("title: A\n---\nhi\n"), /missing its closing ===/);
  assert.throws(() => parseScript("title: A\n---\n<<set X 1>>\n==="), /script:3: bad <<set>>/);
  assert.throws(() => parseScript("title: A\n---\nx\n===\ntitle: A\n---\ny\n==="), /duplicate/);
});

test("pronoun tokens: verbs agree, capitals follow the token, unknown tokens stay visible", () => {
  assert.equal(fillText("{They} walk{s} home; {they} {has} {their} book.", { pronouns: "he" }), "He walks home; he has his book.");
  assert.equal(fillText("{They} walk{s} home; {they} {has} {their} book.", { pronouns: "they" }), "They walk home; they have their book.");
  assert.equal(fillText("Talk to {them}. It's {theirs}, {themself}.", { pronouns: "she" }), "Talk to her. It's hers, herself.");
  assert.equal(fillText("{nope} {name}", { name: "Kit" }), "{nope} Kit");
});

test("saves: write/read round trip, latest across slots, corrupt and future saves ignored, migration", () => {
  const storage = memoryStorage();
  const s = new SaveStore(storage);
  assert.equal(s.read("auto"), null);
  assert.ok(s.write("auto", { player: { name: "Kit", pronouns: "she" }, flags: { A: 1 }, episode: "ep1", beat: 2 }));
  const back = s.read("auto");
  assert.equal(back.version, SAVE_VERSION);
  assert.equal(back.player.name, "Kit");
  assert.equal(back.beat, 2);
  storage.setItem("unwritten.save.1", "{not json");
  assert.equal(s.read("1"), null);
  storage.setItem("unwritten.save.2", JSON.stringify({ version: 99 }));
  assert.equal(s.read("2"), null);
  assert.equal(s.latest().slot, "auto");
  const old = migrate({ flags: { X: 1 } });
  assert.equal(old.version, SAVE_VERSION);
  assert.deepEqual(old.player, { name: "Rook", pronouns: "they" });
  assert.throws(() => s.write("9", {}), RangeError);
});

test("names are cleaned and never empty", () => {
  assert.equal(cleanName("  Kit   Ash  "), "Kit Ash");
  assert.equal(cleanName("<script>"), "script");
  assert.equal(cleanName(""), "Rook");
  assert.equal(cleanName("A".repeat(40)).length, 16);
});

test("episode director: beats in order, conditions skip, fight flags, done flag, resume", () => {
  const ep = validateEpisode({ id: "ep9", beats: [
    { id: "a", type: "title" },
    { id: "b", type: "fight", wave: ["acolyte"], setWin: { WON: 1 }, setLose: { WON: 0, GOT_UP: 1 } },
    { id: "c", type: "scene", node: "Win", if: "$WON" },
    { id: "d", type: "scene", node: "Lose", if: "not $WON", set: { SEEN_D: 1 } },
    { id: "e", type: "preview" },
  ] });
  const seen = [];
  const f = new FlagStore();
  const d = new EpisodeDirector(ep, f, { onBeat: (b) => seen.push(b.id) });
  d.start();
  d.complete();
  d.complete({ won: false });
  assert.equal(d.beat.id, "d");
  assert.deepEqual(d.resumePoint, { episode: "ep9", beat: 3 });
  d.complete(); d.complete();
  assert.ok(d.done);
  assert.deepEqual(seen, ["a", "b", "d", "e"]);
  assert.equal(f.get("GOT_UP"), 1);
  assert.equal(f.get("SEEN_D"), 1);
  assert.equal(f.get("EP9_DONE"), 1);
  // Resume mid-episode with the win path.
  const f2 = new FlagStore({ WON: 1 });
  const d2 = new EpisodeDirector(ep, f2);
  assert.equal(d2.start(2).id, "c");
  assert.throws(() => validateEpisode({ id: "x", beats: [{ id: "a", type: "dance" }] }), /unknown beat type/);
  assert.throws(() => validateEpisode({ id: "x", beats: [{ id: "a", type: "title", set: "tower" }] }), /must be \{ FLAG: value \}/);
  assert.throws(() => validateEpisode({ id: "x", beats: [{ id: "a", type: "scene", node: "Nope" }] }, {}), /no dialogue node/);
});

import { EP1_SCRIPT, EPISODE_1 } from "../src/data/story/ep1.js";
import { CAST } from "../src/data/story/cast.js";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";

test("Episode 1: script parses, beats validate, every speaker is in the cast, every path ends", () => {
  const nodes = parseScript(EP1_SCRIPT, "ep1");
  validateEpisode(EPISODE_1, nodes);
  for (const node of Object.values(nodes)) {
    const walkLines = (block) => { for (const s of block) {
      if (s.type === "line" && s.speaker) assert.ok(CAST[s.speaker], `${node.title}: unknown speaker ${s.speaker}`);
      if (s.type === "options") for (const o of s.items) walkLines(o.body);
      if (s.type === "if") { for (const b of s.branches) walkLines(b.body); walkLines(s.otherwise); }
    } };
    walkLines(node.body);
  }
  for (const pick of [0, 1, 2]) {
    const f = new FlagStore();
    for (const b of EPISODE_1.beats.filter((x) => x.node)) {
      const out = play(new DialogueRunner(nodes, f, { name: "Kit", pronouns: "she" }).start(b.node), [pick, pick, pick]);
      assert.equal(out.at(-1).type, "end");
      assert.ok(!out.some((s) => s.type === "line" && /\{[\w$]+\}/.test(s.text)), "no unfilled tokens");
    }
    assert.equal(f.get("MET_MOSS"), 1);
    assert.equal(f.get("EP1_ITS_YOU"), 1);
  }
});

test("story worlds lock pages and the ultimate", () => {
  const w = new World({ seed: 3, ...EPISODE_1.world });
  w.drainEvents();
  const p = w.player;
  assert.equal(w.companions.length, 0);
  p.mana.fill();
  w.press(Intent.Spell2);
  for (let i = 0; i < 20; i++) w.step();
  assert.equal(p.current, null, "a locked page does nothing");
  w.press(Intent.Spell1);
  w.step();
  assert.equal(p.current?.id, "GaleCutter");
  p.surge.set(p.surge.max);
  w._surge(50);
  for (let i = 0; i < 80; i++) w.step();
  w.press(Intent.Ultimate);
  for (let i = 0; i < 3; i++) w.step();
  assert.notEqual(p.current?.id, "Skyrender");
});
