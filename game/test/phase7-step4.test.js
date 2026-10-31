import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EPISODE_56 } from "../src/reveal/ep56.js";
import { EPISODE_57, EP57_SCRIPT } from "../src/reveal/ep57.js";
import { EPISODE_58, EP58_SCRIPT } from "../src/reveal/ep58.js";
import { AFTER_EP56, AFTER_EP57, AFTER_EP58 } from "../src/reveal/arcs.js";
import { fieldNotes } from "../src/reveal/notes.js";
import { ENEMIES } from "../src/data/enemies.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES, RUINS_LAYOUT } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const n57 = parseScript(EP57_SCRIPT, "e57"), n58 = parseScript(EP58_SCRIPT, "e58");
const run = (nodes, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};

test("Ep 56 leads into Ep 57 and Ep 57 into Ep 58, the end of Arc 6; both registered, valid, and starting from what came before", () => {
  assert.equal(EPISODE_56.beats.find((b) => b.type === "preview").nextEpisode, "ep57");
  assert.equal(EPISODE_57.beats.find((b) => b.type === "preview").nextEpisode, "ep58");
  assert.deepEqual(EPISODE_57.setup, { ...AFTER_EP56 });
  assert.deepEqual(EPISODE_58.setup, { ...AFTER_EP57 });
  for (const [ep, nodes] of [[EPISODE_57, n57], [EPISODE_58, n58]]) {
    validateEpisode(ep);
    assert.equal(ep.arc, "Arc 6 · The Light Left On");
    assert.match(src("main.js"), new RegExp(`from "\\./reveal/${ep.id}\\.js"`));
    for (const b of ep.beats) {
      if (b.node) assert.ok(nodes[b.node], b.node);
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) { if (c.node) assert.ok(nodes[c.node], c.node); if (c.look) assert.ok(LOOKS[c.look], c.look); }
      for (const k of [...(b.wave ?? []), ...(b.siege?.foes ?? []).map((f) => f.kind)]) assert.ok(ENEMIES[k], k);
      if (b.type === "explore") for (const id of b.required) assert.ok([...b.cast, ...(b.pickups ?? [])].some((c) => c.id === id), id);
    }
    for (const t of Object.keys(nodes)) for (const k of [0, 1, 2]) for (const l of run(nodes, t, {}, k).out) if (l.speaker) assert.ok(CAST[l.speaker], `${t}: ${l.speaker}`);
  }
});

test("Larkspur, fifteen years on (a new set): the fire's houses down to their chimneys, the names, and a door standing on its own", () => {
  assert.equal(ZONES.ruins.stage, "ruins");
  assert.match(src("runtime/sets.js"), /ruins: buildRuins/);
  assert.match(src("runtime/sets.js"), /K\.when\("not \$LARKSPUR_OPEN"\)/, "sealed until Arc 7 opens it");
  assert.match(src("runtime/sets.js"), /K\.when\("\$KEY_HOLE and not \$LARKSPUR_OPEN"\)/);
  assert.match(src("runtime/sets.js"), /function buildRuins[\s\S]*conditions: K\.conditions/);
  const posts = ZONES.ruins.bounds.solids.filter((s) => s.circle?.[2] === 0.2);
  assert.equal(posts.length, 2, "the frame's two posts stop you; the space between them doesn't");
  const gap = Math.hypot(posts[0].circle[0] - posts[1].circle[0], posts[0].circle[1] - posts[1].circle[1]);
  assert.ok(Math.abs(gap - RUINS_LAYOUT.door.w) < 1e-6);
  assert.match(run(n57, "Ep57_Stone").text, /"and one child, carried out\."/);
  const m = run(n57, "Ep57_Margin");
  assert.match(m.text, /Lio: "Keep the key\."/);
  assert.equal(m.f.get("MARGIN_ROOK"), 1);
  assert.equal(m.f.get("KEY_HOLE"), 1);
  assert.match(m.text, /It burned outward\. From here\. From this door\./, "his arrival erased it (Layer 10, Arc 7): seen, not said");
  assert.ok(!m.f.get("LARKSPUR_OPEN"), "nobody opens it in Arc 6: 'Doors don't have locks. They have keys.' is Arc 7's");
  assert.doesNotMatch(EP57_SCRIPT + EP58_SCRIPT, /They have keys/);
  const pages = fieldNotes(new FlagStore(AFTER_EP57)).pages;
  assert.ok(pages.every((p) => p.read), "every margin read by the end of Ep 57");
  assert.equal(fieldNotes(new FlagStore(AFTER_EP57)).hint, "Lio has read every margin.");
});

test("Everyone (the end of Arc 6): the ledger, the rolls, a knot tied again, Bas reluctant, Severin at the door, Dagrun's order, the light left on", () => {
  const w = run(n58, "Ep58_Wren");
  assert.match(w.text, /"Brought in by a boy who didn't speak\."/);
  assert.match(w.text, /watching you hit the post with a stick/, "Backlash Ch 7: Thornwick fence, years apart");
  const l = run(n58, "Ep58_Leave", AFTER_EP57);
  assert.equal(l.f.get("MERIT_FROZEN"), 0);
  assert.equal(l.f.get("BELL_WARDEN_POSTED"), 0);
  assert.equal(l.f.get("HESPER_MESSAGE"), 1);
  const t = run(n58, "Ep58_Table", AFTER_EP57);
  assert.equal(t.f.get("JUNO_KNOT"), 1);
  assert.equal(t.f.get("CAL_JUNO"), "unresolved", "§15.9: betrayed → (Arc 7) unresolved or family");
  assert.equal(t.f.get("BAS_CROSSING"), "reluctant");
  assert.equal(t.f.get("SEVERIN_CROSSING"), 1);
  assert.equal(t.f.get("DAGRUN_CROSSING"), 1);
  assert.match(t.text, /Dagrun: We're all going\. Everyone\. That's the order\./);
  const spar = EPISODE_58.beats.find((b) => b.id === "spar");
  assert.deepEqual(spar.siege.foes.map((f) => f.kind), ["junoFoe", "basFoe"]);
  for (const f of spar.siege.foes) assert.ok(f.floor > 0);
  const n = run(n58, "Ep58_Light");
  assert.equal(n.f.get("LIGHT_LEFT_ON"), 1);
  assert.equal(n.f.get("ARC6_DONE"), 1);
  assert.equal(AFTER_EP58.ARC6_DONE, 1);
});
