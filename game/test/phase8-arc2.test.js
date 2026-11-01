import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { EPISODE_8 } from "../src/data/story/ep8.js";
import { EPISODE_19 } from "../src/data/story/ep19.js";
import * as A from "../src/data/story/arc12.js";
import { ARC3_BASE } from "../src/data/story/arc3.js";
import { ENEMIES } from "../src/data/enemies.js";
import { BOSS_KINDS } from "../src/sim/world.js";
import { BOUNTIES } from "../src/data/items.js";
import { DROPS } from "../src/data/crafting.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";
import { CLUE_TRACKS } from "../src/core/clues.js";
import { keyItemsHeld } from "../src/data/keyItems.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const N = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const mods = Object.fromEntries(await Promise.all(N.map(async (n) => [n, await import(`../src/data/story/ep${n}.js`)])));
const ep = (n) => mods[n][`EPISODE_${n}`], script = (n) => mods[n][`EP${n}_SCRIPT`];
const nodes = Object.fromEntries(N.map((n) => [n, parseScript(script(n), `e${n}`)]));
const run = (n, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes[n], f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};
const beat = (n, id) => ep(n).beats.find((b) => b.id === id);

test("Arc 2 runs Ep 8 → 18 → 19: every episode registered, valid, chained, and started from what came before", () => {
  assert.equal(EPISODE_8.beats.find((b) => b.type === "preview").nextEpisode, "ep9");
  const ids = Object.values(CLUE_TRACKS).flat();
  for (const n of N) {
    const e = ep(n);
    validateEpisode(e, nodes[n]);
    assert.equal(e.number, n);
    assert.equal(e.arc, "Arc 2 · The Lantern That Went Out");
    assert.deepEqual(e.setup, { ...A[`AFTER_EP${n - 1}`] });
    assert.match(src("main.js"), new RegExp(`from "\\./data/story/ep${n}\\.js"`));
    assert.equal(e.beats.find((b) => b.type === "preview").nextEpisode, `ep${n + 1}`);
    for (const b of e.beats) {
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of b.cast ?? []) if (c.look) assert.ok(LOOKS[c.look], c.look);
      for (const k of [...(b.wave ?? []), ...(b.siege?.foes ?? []).map((f) => f.kind)]) assert.ok(ENEMIES[k] || BOSS_KINDS.includes(k), k);
      if (b.type === "explore") for (const id of b.required) assert.ok([...b.cast, ...(b.pickups ?? [])].some((c) => c.id === id), id);
    }
    for (const t of Object.keys(nodes[n])) for (const k of [0, 1, 2]) for (const l of run(n, t, {}, k).out) if (l.speaker && l.speaker !== "Rook") assert.ok(CAST[l.speaker], `ep${n} ${t}: ${l.speaker}`);
    for (const m of script(n).matchAll(/\$CLUE_([A-Z]\d+)/g)) assert.ok(ids.includes(m[1]), m[1]);
    assert.doesNotMatch(src(`data/story/ep${n}.js`), /\bdemons?\b|ash line|ash eleven|\bsable\b/i);
  }
  // Ep 19 starts from what Ep 18 leaves: every flag Arc 3's base expects is set by the end of Arc 2.
  for (const [k, v] of Object.entries(ARC3_BASE)) assert.equal(A.AFTER_EP18[k], v, k);
  assert.ok(EPISODE_19.setup.CAL_STATE === A.AFTER_EP18.CAL_STATE);
});

test("The Festival and the Hall (Eps 9–10): Juno's stall (S6's alibi), Elodie in a doorway, Aurek's pendant; a lantern with your name, and the wick that turns to ash", () => {
  assert.match(run(9, "Ep9_Stall").text, /Two coppers each/);
  assert.equal(run(9, "Ep9_Window").f.get("ELODIE_GLIMPSE"), 1);
  const p = run(9, "Ep9_Pendant");
  assert.match(p.text, /Severin: It was my brother's\. Aurek\./);
  assert.match(p.text, /The Hollowmarch, six years ago/);
  assert.match(run(9, "Ep9_Severin").text, /Severin: You missed one\./);
  const k = run(10, "Ep10_Keeper");
  assert.match(k.text, /When a knight dies, the wick goes to ash\./);
  assert.match(run(10, "Ep10_Ash").text, /a little grey curl of ash/);
  const l = run(10, "Ep10_Light");
  assert.equal(l.f.get("LANTERN_LIT"), 1);
  assert.equal(beat(10, "shelves").pickups.find((p) => p.id === "light").z, 8.0);
});

test("Beneath the Festival and the Drowned Cistern (Eps 11–12): Severin on the bench; the shoe, the hymn; Gullmaw (B5); Severin in front", () => {
  for (const id of ["nest", "sentinel"]) assert.deepEqual(beat(11, id).world.party, ["severin"]);
  assert.match(run(11, "Ep11_Scrap").text, /The Choir\. Down here\. Taking children\./);
  assert.deepEqual(beat(12, "gullmaw").wave, ["gullmaw"]);
  assert.deepEqual(beat(12, "gullmaw").world.party, ["severin"]);
  const a = run(12, "Ep12_After");
  assert.match(a.text, /The toad's tongue was meant for you\. He was in front of it/);
  assert.equal(a.f.get("CHOIR_CISTERN"), 1);
});

test("The Garden, Tamsin, and the Twins (Eps 13–15): the offer refused at a cost; why she sings; 'Spear-wall, three lines deep' (D7); Boss 6 and the Choir's target", () => {
  for (const k of [0, 2]) { const g = run(13, "Ep13_Garden", { REP_SQUAD: 10 }, k); assert.equal(g.f.get("VALCOURT_HOSTILE"), 1); assert.equal(g.f.get("REP_SQUAD"), 5); }
  assert.match(run(13, "Ep13_Garden").text, /Lend it to us\. For study\./);
  const t = run(14, "Ep14_After");
  assert.match(t.text, /It was never for the key\./);
  assert.equal(t.f.get("MERIT_CLIMB"), 1);
  assert.equal(run(14, "Ep14_Contest").f.get("TAMSIN_SANG"), 1);
  const pl = run(15, "Ep15_Plans");
  assert.match(pl.text, /Cal: Spear-wall, three lines deep, marshal at the rear\./);
  assert.match(pl.text, /Cal: Nobody fights like that anymore\./);
  assert.equal(pl.f.get("CLUE_D7"), 1);
  assert.deepEqual(beat(15, "twins").wave, ["twinMirror", "twinSmoke"]);
  for (const k of ["twinMirror", "twinSmoke"]) { assert.ok(ENEMIES[k] && LOOKS[k], k); assert.ok(BOUNTIES[k] != null && DROPS[k], k); }
  const m = run(15, "Ep15_Mirror");
  assert.match(m.text, /The Mother is going to open the Hollowmarch Gate\./);
  assert.equal(m.f.get("CHOIR_TARGET"), "gate");
});

test("The night before (Ep 16): 'Where I grew up, nobody had names. Just numbers.' (D10); 'keep the key. Doors remember who holds them.'", () => {
  const s = run(16, "Ep16_Step");
  assert.match(s.text, /Cal: Where I grew up, nobody had names\. Just numbers\./);
  assert.equal(s.f.get("CLUE_D10"), 1);
  assert.match(s.text, /keep the key\. Doors remember who holds them\./);
  assert.match(s.text, /That's a joke\./, "played as a joke");
});

test("The Hollowmarch (Ep 17, a new set): the key warm (A3); the armoured husks and 'Rest, soldier.' (D8); the Bloom begun; split up", () => {
  assert.equal(ZONES.hollowmarch.stage, "hollowmarch");
  assert.match(src("runtime/sets.js"), /hollowmarch: buildHollowmarch/);
  const e = run(17, "Ep17_Edge");
  assert.match(e.text, /Everything metal out here runs warm\./);
  assert.equal(e.f.get("CLUE_A3"), 1);
  assert.match(keyItemsHeld(new FlagStore({ HAS_BRASS_KEY: 1 }), "hollowmarch")[0].text, /Everything metal is warm out here/, "the key's text changes there too");
  const h = run(17, "Ep17_Husk");
  assert.match(h.text, /Cal: Rest, soldier\./);
  assert.equal(h.f.get("CLUE_D8"), 1);
  assert.ok(beat(17, "march").cast.filter((c) => c.look === "husk").every((c) => c.down));
  assert.equal(beat(17, "alone").world.companions, false);
  assert.equal(run(17, "Ep17_Bloom").f.get("SQUAD_SPLIT"), 1);
});

test("I'll Hold the Door (Ep 18, the end of Arc 2): the Bloom (B7); the door; 'I'll hold the door. Don't wait up.'; no residue (A1); his lantern dark", () => {
  const b = beat(18, "bloom");
  assert.equal(b.siege.foes[0].kind, "hollowBloom");
  assert.ok(b.siege.foes[0].floor > 0, "it can't be killed, only held back");
  assert.equal(LOOKS.hollowBloom.shape, "bloom");
  assert.match(src("runtime/objects.js"), /case "bloom":/);
  assert.match(run(18, "Ep18_Door").text, /Cal: I'll hold the door\. Don't wait up\./);
  const d = CUTSCENES.ep18_door.events;
  assert.ok(d.some((e) => e.tear?.kind === "gold") && d.some((e) => e.hide === "cal") && d.some((e) => e.flash >= 0.4));
  const n = run(18, "Ep18_Nothing");
  assert.match(n.text, /No body\. No grimoire\./);
  assert.match(n.text, /Lio: There's no residue\. None\./);
  assert.equal(n.f.get("CLUE_A1"), 1);
  const l = run(18, "Ep18_Lantern");
  assert.equal(l.f.get("CAL_STATE"), 1, "the Lighthouse shows his wick dark (runtime/sets.js: $CAL_STATE)");
  assert.equal(l.f.get("ARC2_DONE"), 1);
  assert.doesNotMatch(script(18), /\bdemon|tear\b/i);
});

test("The new bosses hold together in the sim: finite stats, and no NaN when the Bloom and the Twins fight", () => {
  for (const k of ["twinMirror", "twinSmoke", "hollowBloom"]) for (const s of ["runSpeed", "circleSpeed", "turnRate", "radius", "height"]) assert.ok(Number.isFinite(ENEMIES[k].stats[s]), `${k}.${s}`);
  const b = beat(18, "bloom"), w = new World({ seed: 9, ...b.world }), s = new Siege(w, b.siege).start();
  for (let i = 0; i < 600; i++) { w.step({}); s.step(); }
  for (const f of w.fighters) assert.ok(Number.isFinite(f.pos.x) && Number.isFinite(f.pos.z), f.kind);
  const t = new World({ seed: 4, bounds: ZONES.fens.bounds });
  t.spawnWave?.(["twinMirror", "twinSmoke"]);
  for (let i = 0; i < 300; i++) t.step({});
  for (const f of t.fighters) assert.ok(Number.isFinite(f.pos.x) && Number.isFinite(f.pos.z), f.kind);
});
