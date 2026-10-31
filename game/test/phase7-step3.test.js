import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EPISODE_54 } from "../src/reveal/ep54.js";
import { EPISODE_55, EP55_SCRIPT } from "../src/reveal/ep55.js";
import { EPISODE_56, EP56_SCRIPT } from "../src/reveal/ep56.js";
import { AFTER_EP54, AFTER_EP55, AFTER_EP56 } from "../src/reveal/arcs.js";
import { fieldNotes } from "../src/reveal/notes.js";
import { ENEMIES } from "../src/data/enemies.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { LOOKS } from "../src/runtime/rig.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const n55 = parseScript(EP55_SCRIPT, "e55"), n56 = parseScript(EP56_SCRIPT, "e56");
const run = (nodes, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};

test("Ep 54 leads into Ep 55 and Ep 55 into Ep 56; both registered, valid, and starting from what came before", () => {
  assert.equal(EPISODE_54.beats.find((b) => b.type === "preview").nextEpisode, "ep55");
  assert.equal(EPISODE_55.beats.find((b) => b.type === "preview").nextEpisode, "ep56");
  assert.deepEqual(EPISODE_55.setup, { ...AFTER_EP54 });
  assert.deepEqual(EPISODE_56.setup, { ...AFTER_EP55 });
  for (const [ep, nodes] of [[EPISODE_55, n55], [EPISODE_56, n56]]) {
    validateEpisode(ep);
    assert.equal(ep.arc, "Arc 6 · The Light Left On");
    assert.match(src("main.js"), new RegExp(`from "\\./reveal/${ep.id}\\.js"`));
    for (const b of ep.beats) {
      if (b.node) assert.ok(nodes[b.node], b.node);
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) { if (c.node) assert.ok(nodes[c.node], c.node); if (c.look) assert.ok(LOOKS[c.look], c.look); }
      for (const k of b.wave ?? []) assert.ok(ENEMIES[k], k);
      if (b.type === "explore") for (const id of b.required) assert.ok([...b.cast, ...(b.pickups ?? [])].some((c) => c.id === id), id);
    }
    for (const t of Object.keys(nodes)) for (const k of [0, 1, 2]) for (const l of run(nodes, t, {}, k).out) if (l.speaker) assert.ok(CAST[l.speaker], `${t}: ${l.speaker}`);
  }
});

test("Hesper captured (§14 Arc 6): out of the Hollow by her own torn pages, and in the seal ring: 'A boy with no grimoire taught me about the Hollow.'", () => {
  const pages = EPISODE_55.beats.find((b) => b.id === "white");
  assert.equal(pages.stage, "hollow");
  assert.deepEqual(pages.required, ["page1", "page2", "page3"]);
  assert.match(run(n55, "Ep55_Page3").text, /He told me it was freedom in here\./);
  const found = run(n55, "Ep55_Hesper");
  assert.equal(found.f.get("HESPER_CAPTURED"), 1);
  const cell = run(n55, "Ep55_Cell");
  assert.match(cell.text, /Hesper: A boy with no grimoire taught me about the Hollow\./);
  assert.match(cell.text, /He said grimoires were chains\./);
  assert.match(cell.text, /Hesper: He didn't have one\. Not yet\. He hadn't picked one\./, "before he was anybody's Cal (Backlash Ch 7)");
  assert.equal(cell.f.get("HESPER_BOY"), 1);
  assert.deepEqual([0, 1].map((k) => run(n55, "Ep55_Cell", {}, k).f.get("HESPER_ASKED")), ["yes", "silent"]);
  assert.equal(EPISODE_55.beats.find((b) => b.id === "cell").cast.find((c) => c.id === "hesper").pose, "sit", "she sits in the ring, where the accused sit");
});

test("Brother Moss's truth (§2, §8.6): the last Keeper; the book scraped bare to hide who it wanted; nothing ever written for Rook; and no star is shown or named before the Rite", () => {
  const t = run(n56, "Ep56_Truth");
  assert.match(t.text, /Moss: I'm the last Keeper of the Scribe's books\./);
  assert.match(t.text, /three hundred years/);
  assert.match(t.text, /Nothing was ever written for you\. Not even a blank\./);
  assert.match(t.text, /So I scraped it bare\. All of it but one page, so you'd pass for ordinary\./);
  assert.match(t.text, /whether the Scribe wrote the rules or only read them/);
  assert.equal(t.f.get("MOSS_TRUTH"), 1);
  assert.deepEqual([0, 1, 2].map((k) => run(n56, "Ep56_Truth", {}, k).f.get("MOSS_ANSWER")), ["twice", "erased", "now"]);
  const fl = run(n56, "Ep56_Floor");
  assert.match(fl.text, /"Let what is written be read\. Let what is unwritten write\."/);
  assert.match(fl.text, /It won't cost you anything, because it won't be a trade\./, "the Shared Star's seed (§25.4), without saying the word");
  for (const s of [EP55_SCRIPT, EP56_SCRIPT]) assert.doesNotMatch(s, /★|\bstars?\b|rating/i, "Star Sight waits for the Rite (§25.3)");
  assert.match(src("runtime/sets.js"), /K\.when\("\$SCRIBE_FLOOR"\)/, "the sealed floor's ring of script shows once it's opened");
  assert.ok(EPISODE_56.beats.find((b) => b.id === "keepers").wave.every((k) => k === "clockwork"));
});

test("Lio's and Dagrun's margins; the Journal shows five read, Rook's still waiting", () => {
  assert.match(run(n55, "Ep55_Margin").text, /Lio: "Hello, Lio\. Slower on the third line\."/);
  const d = run(n56, "Ep56_Margin");
  assert.match(d.text, /Lio: "He took me in when nobody would\. Of all of them, he's the one I can't look at\."/);
  assert.deepEqual([0, 1].map((k) => run(n56, "Ep56_Margin", {}, k).f.get("DAGRUN_QUEST")), ["look", "light"]);
  const pages = fieldNotes(new FlagStore(AFTER_EP56)).pages;
  assert.deepEqual(pages.filter((p) => !p.read).map((p) => p.who), ["Rook"]);
  assert.equal(AFTER_EP55.EP55_DONE, 1);
  assert.equal(AFTER_EP56.EP56_DONE, 1);
});
