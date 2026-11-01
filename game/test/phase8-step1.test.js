import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { EPISODE_4_STORY } from "../src/data/story/ep4.js";
import { EPISODE_5, EP5_SCRIPT } from "../src/data/story/ep5.js";
import { EPISODE_6, EP6_SCRIPT } from "../src/data/story/ep6.js";
import { EPISODE_7, EP7_SCRIPT } from "../src/data/story/ep7.js";
import { EPISODE_8, EP8_SCRIPT } from "../src/data/story/ep8.js";
import * as A from "../src/data/story/arc12.js";
import { ARC3_BASE } from "../src/data/story/arc3.js";
import { ENEMIES } from "../src/data/enemies.js";
import { BOSS_KINDS } from "../src/sim/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { LOOKS } from "../src/runtime/rig.js";
import { CLUE_TRACKS } from "../src/core/clues.js";
import { keyItemsHeld } from "../src/data/keyItems.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const EPS = [[5, EPISODE_5, EP5_SCRIPT], [6, EPISODE_6, EP6_SCRIPT], [7, EPISODE_7, EP7_SCRIPT], [8, EPISODE_8, EP8_SCRIPT]];
const nodes = Object.fromEntries(EPS.map(([n, , s]) => [n, parseScript(s, `e${n}`)]));
const run = (n, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes[n], f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};
const beat = (ep, id) => ep.beats.find((b) => b.id === id);

test("Arc 1 is whole: Ep 4 leads into Eps 5–8, each registered, valid, started from what came before, and pointing at things that exist", () => {
  assert.equal(EPISODE_4_STORY.beats.find((b) => b.type === "preview").nextEpisode, "ep5");
  for (const [n, ep] of EPS) {
    validateEpisode(ep, nodes[n]);
    assert.equal(ep.number, n);
    assert.equal(ep.arc, "Arc 1 · The One-Page Mage");
    assert.deepEqual(ep.setup, { ...A[`AFTER_EP${n - 1}`] });
    assert.match(src("main.js"), new RegExp(`from "\\./data/story/ep${n}\\.js"`));
    for (const b of ep.beats) {
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of b.cast ?? []) if (c.look) assert.ok(LOOKS[c.look], c.look);
      for (const k of b.wave ?? []) assert.ok(ENEMIES[k] || BOSS_KINDS.includes(k), k);
      if (b.type === "explore") for (const id of b.required) assert.ok([...b.cast, ...(b.pickups ?? [])].some((c) => c.id === id), id);
    }
    for (const t of Object.keys(nodes[n])) for (const k of [0, 1, 2]) for (const l of run(n, t, {}, k).out) if (l.speaker && l.speaker !== "Rook") assert.ok(CAST[l.speaker], `ep${n} ${t}: ${l.speaker}`);
  }
  for (const n of [5, 6, 7]) assert.equal(EPS.find((e) => e[0] === n)[1].beats.find((b) => b.type === "preview").nextEpisode, `ep${n + 1}`);
  // Every clue flag a script sets is a real clue id.
  const ids = Object.values(CLUE_TRACKS).flat();
  for (const [, , s] of EPS) for (const m of s.matchAll(/\$CLUE_([A-Z]\d+)/g)) assert.ok(ids.includes(m[1]), m[1]);
});

test("Thread and Needle (Ep 5): Juno's net in Thornwick, Mother Wren, and a Quill knot on every wrist, his included (S6)", () => {
  assert.equal(beat(EPISODE_5, "net").stage, "thornwick");
  assert.deepEqual(beat(EPISODE_5, "net").required, ["post1", "post2", "post3"]);
  assert.match(run(5, "Ep5_Post").text, /Over, under, through, back\. That's a Quill knot\./);
  assert.match(run(5, "Ep5_Wren").text, /You used to hit that post by the oak with a stick until the stick broke\./, "the child at the Thornwick fence (Cal's Path; Ep 58)");
  const k = run(5, "Ep5_Knot");
  assert.match(k.text, /Cal holds out his wrist last/);
  assert.equal(k.f.get("CLUE_S6"), 1);
  assert.match(k.text, /Juno: It's a knot\. It holds\./);
});

test("The Silence Sermon (Ep 6): the town's voices in a hymn; Deacon Ilse (B3); Hesper in the reeds; 'Shouting's for show-offs.' (D3)", () => {
  assert.deepEqual(beat(EPISODE_6, "ilse").wave, ["ilse"]);
  assert.equal(beat(EPISODE_6, "ilse").set.ILSE_DEFEATED, 1);
  assert.equal(run(6, "Ep6_Hymn").f.get("HYMN_READ"), 1);
  assert.match(run(6, "Ep6_Vision").text, /Hesper: They gave you one page so you'd stay small\. I can give you none, and you'll be free\./);
  const r = run(6, "Ep6_Road");
  assert.match(r.text, /Cal: Shouting's for show-offs\. I'm shy\./);
  assert.equal(r.f.get("CLUE_D3"), 1);
});

test("Brass and Small Things (Ep 7): the brass key (S7); 'Somebody showed me a door once.' (V1); die and come back (D11); 'Good soldier.' (D2); Lio at night", () => {
  const c = run(7, "Ep7_Cal");
  assert.match(c.text, /Opens the snack cupboard/);
  assert.equal(c.f.get("HAS_BRASS_KEY"), 1);
  assert.equal(c.f.get("CLUE_S7"), 1);
  assert.match(c.text, /Cal: Somebody showed me a door once\./);
  assert.match(c.text, /If you could die, and come back stronger\. Would you\?/);
  assert.equal(c.f.get("CLUE_D11"), 1);
  assert.equal(run(7, "Ep7_Ring").f.get("CLUE_D2"), 1);
  assert.deepEqual(beat(EPISODE_7, "ring").wave, ["cal"], "the spar: his left, left, backstep (S3)");
  const keyText = keyItemsHeld(new FlagStore({ HAS_BRASS_KEY: 1 }))[0].text;
  assert.match(keyText, /snack cupboard doesn't have a lock/);
  const n = run(7, "Ep7_Night");
  assert.match(n.text, /There's something here\. Scraped\. Somebody scraped it\./, "what Brother Moss tells in Ep 56");
  assert.equal(n.f.get("LIO_READ_NIGHT"), 1);
  // V1 is the only reference to the two in black in Arc 1 (§28.4: one an arc before Arc 7).
  for (const [, , s] of EPS) assert.doesNotMatch(s, /two in black|black circle|humming/i);
});

test("Rust Remembers (Ep 8, the end of Arc 1): the glyph (D5) and the Saint mural (D6); Galen (B4); the page bleeds; Lio's 'Not yet.'", () => {
  assert.ok(CUTSCENES.ep8_rise.events.some((e) => e.show === "galen"));
  assert.match(run(8, "Ep8_Glyph").text, /Cal: Guessed\. Sounds like a word, right\?/);
  assert.equal(run(8, "Ep8_Glyph").f.get("CLUE_D5"), 1);
  const s = run(8, "Ep8_Saint");
  assert.match(s.text, /Tamsin: Never took you for an art lover\./);
  assert.equal(s.f.get("CLUE_D6"), 1);
  assert.deepEqual(beat(EPISODE_8, "galen").wave, ["galen"]);
  assert.equal(run(8, "Ep8_Ink").f.get("INK_BLED"), 1);
  const l = run(8, "Ep8_Lio");
  assert.match(l.text, /Lio: It's started\./);
  assert.match(l.text, /Lio: …No\. Not yet\./);
  assert.equal(l.f.get("ARC1_DONE"), 1);
});

test("Arcs 1–2 never name what Arc 5 reveals, and nothing in any script (story or reveal) makes up a speaker out of a colon", () => {
  for (const [, , s] of EPS) {
    assert.doesNotMatch(s, /\bdemons?\b|ash line|ash eleven|\bsable\b/i);
    assert.doesNotMatch(s, /masked knight/i);
  }
  for (const n of [5, 6, 7, 8]) assert.doesNotMatch(src(`data/story/ep${n}.js`), /\bdemons?\b|ash line|ash eleven/i);
  // The story folder has a test for this; the reveal folder needs one too.
  const dir = new URL("../src/reveal/", import.meta.url), bad = [];
  const walk = (items, where) => { for (const it of items ?? []) { if (it.type === "line" && it.speaker && it.speaker !== "Rook" && !CAST[it.speaker]) bad.push(`${where}: ${it.speaker}`); walk(it.body, where); walk(it.otherwise, where); for (const x of [...(it.items ?? []), ...(it.branches ?? [])]) walk(x.body, where); } };
  return Promise.all(readdirSync(dir).filter((f) => f.endsWith(".js")).map(async (f) => {
    const mod = await import(new URL(f, dir));
    for (const [k, v] of Object.entries(mod)) if (typeof v === "string" && v.includes("title:")) for (const [id, nd] of Object.entries(parseScript(v, k))) walk(nd.body, `${f} ${id}`);
  })).then(() => assert.deepEqual(bad, []));
});

test("By the end of Arc 1 the flags Arc 3 starts from are on their way: the key, the lantern still to light, the step heard", () => {
  assert.equal(A.AFTER_EP8.HAS_BRASS_KEY, ARC3_BASE.HAS_BRASS_KEY);
  assert.equal(A.AFTER_EP8.HEARD_S2, ARC3_BASE.HEARD_S2);
  assert.equal(A.AFTER_EP8.ARC1_DONE, 1);
});
