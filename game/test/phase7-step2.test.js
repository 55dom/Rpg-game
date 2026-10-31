import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EPISODE_52 } from "../src/reveal/ep52.js";
import { EPISODE_53, EP53_SCRIPT } from "../src/reveal/ep53.js";
import { EPISODE_54, EP54_SCRIPT } from "../src/reveal/ep54.js";
import { AFTER_EP52, AFTER_EP53, AFTER_EP54 } from "../src/reveal/arcs.js";
import { fieldNotes } from "../src/reveal/notes.js";
import { ENEMIES } from "../src/data/enemies.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { LOOKS } from "../src/runtime/rig.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const n53 = parseScript(EP53_SCRIPT, "e53"), n54 = parseScript(EP54_SCRIPT, "e54");
const run = (nodes, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};
const beat = (ep, id) => ep.beats.find((b) => b.id === id);

test("Arc 6 goes on: Ep 52 leads into Ep 53 and Ep 53 into Ep 54; both registered, valid, and starting from what came before", () => {
  assert.equal(EPISODE_52.beats.find((b) => b.type === "preview").nextEpisode, "ep53");
  assert.equal(EPISODE_53.beats.find((b) => b.type === "preview").nextEpisode, "ep54");
  assert.deepEqual(EPISODE_53.setup, { ...AFTER_EP52 });
  assert.deepEqual(EPISODE_54.setup, { ...AFTER_EP53 });
  for (const [ep, nodes] of [[EPISODE_53, n53], [EPISODE_54, n54]]) {
    validateEpisode(ep);
    assert.equal(ep.arc, "Arc 6 · The Light Left On");
    assert.match(src("main.js"), new RegExp(`from "\\./reveal/${ep.id}\\.js"`));
    for (const b of ep.beats) {
      if (b.node) assert.ok(nodes[b.node], b.node);
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) { if (c.node) assert.ok(nodes[c.node], c.node); if (c.look) assert.ok(LOOKS[c.look], c.look); }
      for (const f of b.siege?.foes ?? []) assert.ok(ENEMIES[f.kind], f.kind);
      for (const k of b.wave ?? []) assert.ok(ENEMIES[k], k);
    }
    for (const t of Object.keys(nodes)) for (const k of [0, 1, 2]) for (const l of run(nodes, t, {}, k).out) if (l.speaker) assert.ok(CAST[l.speaker], `${t}: ${l.speaker}`);
  }
  for (const b of EPISODE_53.beats.filter((x) => x.type === "explore")) for (const id of b.required) assert.ok([...b.cast, ...(b.pickups ?? [])].some((c) => c.id === id), id);
});

test("The soldiers the Gate left behind (§14 Arc 6): they hold their last order until it breaks, then ask questions; a name is something to think about", () => {
  const order = beat(EPISODE_53, "order");
  assert.equal(order.siege.foes.length, 3);
  for (const f of order.siege.foes) { assert.equal(f.kind, "lineSoldier"); assert.ok(f.floor > 0, "they can't be put down: nobody here wants them dead"); }
  assert.ok(order.siege.meter.seconds > 0);
  const found = run(n53, "Ep53_Line");
  assert.match(found.text, /Four: The order is: hold the line\. Destroy the intruders\./);
  const q = run(n53, "Ep53_Questions");
  assert.match(q.text, /Four: What is the order now\?/);
  assert.match(q.text, /Left, left, back, cut\. Who was he\?/);
  assert.match(q.text, /He asked a sergeant why\. The sergeant said, "He served\." He asked, "That's all\?"/, "the one who stepped out of the line, seen from seven places down");
  assert.equal(q.f.get("FOUR_ASKED_NAME"), 1);
  assert.deepEqual([0, 1, 2].map((k) => run(n53, "Ep53_Questions", {}, k).f.get("STRANDED")), ["hidden", "watch", "bell"]);
  for (const k of [0, 1, 2]) assert.ok(run(n53, "Ep53_Questions", {}, k).f.get("FOUR_ORDER"));
});

test("V4, once and only once (§28.4): 'The Wings left the King. Now the black ones come for those who fall wrong.' He won't say more; nobody is named", () => {
  const q = run(n53, "Ep53_Questions");
  assert.match(q.text, /Four: The Wings left the King\. Now the black ones come for those who fall wrong\./);
  assert.match(q.text, /Four: I will not say more\./);
  assert.equal(q.f.get("V4_HEARD"), 1);
  // The budget: never two in one episode, one an arc before Arc 7. Nothing else in Arc 6 so far speaks of them.
  for (const s of [EP53_SCRIPT, EP54_SCRIPT, src("reveal/ep51.js"), src("reveal/ep52.js")]) {
    assert.equal((s.match(/those who fall wrong/g) ?? []).length, s === EP53_SCRIPT ? 1 : 0);
    if (s !== EP53_SCRIPT) assert.doesNotMatch(s, /black ones/);
    assert.doesNotMatch(s, /Ghorran|Vaelith|butler|maid|funeral|humming/i);
  }
  for (const s of [src("reveal/cast.js")]) assert.doesNotMatch(s, /unkA|unkB/, "the two who came through the void have no cast entry");
});

test("The Crown against Aldric Valcourt (§14 Arc 6): Halvard, Severin, Elodie and Rook; who told him where to look; Ironhold", () => {
  const t = run(n54, "Ep54_Trial");
  assert.match(t.text, /Halvard: .*"Fire is quickest," he said\. I said no\./);
  assert.match(t.text, /Severin: .*a son who could read it was worth more to him than a son\./);
  assert.match(t.text, /Elodie: .*Like a page you mean to fill in later\./);
  assert.match(t.text, /Aldric: Hesper told me\. And someone told Hesper\./);
  assert.equal(t.f.get("ALDRIC_HINT"), 1);
  assert.equal(t.f.get("ALDRIC_SENTENCE"), "ironhold");
  assert.deepEqual([0, 1, 2].map((k) => run(n54, "Ep54_Trial", {}, k).f.get("ALDRIC_TESTIMONY")), ["mercy", "truth", "question"]);
  assert.doesNotMatch(EP54_SCRIPT, /\bCal\b|Calder/, "the trial doesn't say who; Arc 7 does");
  const out = beat(EPISODE_54, "breakout");
  assert.ok(out.wave.every((k) => k === "lance"));
  const f = run(n54, "Ep54_Father");
  assert.match(f.text, /A Valcourt walks to his own cell\./);
  assert.equal(f.f.get("SEVERIN_FLOWER"), "given", "the flower from Aurek's grave, kept since Ep 51, goes to his father");
});

test("The margins, a line an episode: Tamsin's (Ep 53) and Bas's (Ep 54) show their translations in the Journal", () => {
  const m53 = run(n53, "Ep53_Margin", AFTER_EP52), m54 = run(n54, "Ep54_Margin", AFTER_EP53);
  assert.match(m53.text, /Lio: "She asked me if I liked it here\. I said yes\. I should find out whether that was a lie\."/);
  assert.match(m54.text, /Lio: "Never let him carry it alone\. He'll try\."/);
  assert.match(m54.text, /Bas: \.\.\.Before or after he broke my arm\?/);
  assert.deepEqual([0, 1].map((k) => run(n53, "Ep53_Margin", {}, k).f.get("TAMSIN_LIKE")), ["find", "mine"]);
  assert.deepEqual([0, 1].map((k) => run(n54, "Ep54_Margin", {}, k).f.get("BAS_RESOLVE")), ["together", "right"]);
  const read = (flags) => fieldNotes(new FlagStore(flags)).pages.filter((p) => p.read).map((p) => p.who);
  assert.deepEqual(read(AFTER_EP52), ["Juno"]);
  assert.deepEqual(read(AFTER_EP53), ["Juno", "Tamsin"]);
  assert.deepEqual(read(AFTER_EP54), ["Juno", "Bas", "Tamsin"]);
  assert.equal(AFTER_EP54.EP54_DONE, 1);
  assert.equal(AFTER_EP53.EP53_DONE, 1);
});
