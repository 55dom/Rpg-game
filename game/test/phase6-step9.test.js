import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EPISODE_44 } from "../src/data/story/ep44.js";
import { EPISODE_45, EP45_SCRIPT } from "../src/data/story/ep45.js";
import { EPISODE_46, EP46_SCRIPT } from "../src/data/story/ep46.js";
import { AFTER_EP44, AFTER_EP45 } from "../src/data/story/arc5.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { ZONES } from "../src/data/zones.js";

const nodes = { ...parseScript(EP45_SCRIPT, "e45"), ...parseScript(EP46_SCRIPT, "e46") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s); if (s.type === "command") cmds.push(s); if (s.type === "options") r.choose(pick); }
  return { f, lines, cmds, text: lines.map((l) => l.text).join(" ") };
};
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");

test("Eps 45–46 follow Ep 44, each startable from the menu with what came before; Ep 46's preview names Ep 47 and nothing it shows", () => {
  for (const ep of [EPISODE_45, EPISODE_46]) {
    validateEpisode(ep);
    for (const b of ep.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); }
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview");
  assert.deepEqual([EPISODE_44, EPISODE_45, EPISODE_46].map((ep) => next(ep).nextEpisode), ["ep45", "ep46", "ep47"]);
  assert.deepEqual([EPISODE_45.setup, EPISODE_46.setup], [{ ...AFTER_EP44 }, { ...AFTER_EP45 }]);
  assert.match(next(EPISODE_46).lines.join(" "), /Lanterns in the Smoke/, "Ep 47's title (GDD §15.11)");
  assert.doesNotMatch(next(EPISODE_46).lines.join(" "), /mask/i);
  const main = src("main.js");
  for (const n of [45, 46]) assert.match(main, new RegExp(`episode: EPISODE_${n}, script: EP${n}_SCRIPT`));
});

test("Ep 45, Eve: an evening with each of the squad, the line on Elodie's wrist fading, and a knock from the other side", () => {
  const evening = EPISODE_45.beats.find((b) => b.id === "evening");
  assert.deepEqual(evening.required, ["juno", "bas", "lio", "dagrun", "severin"]);
  assert.match(play("Ep45_Cold").text, /where I'm needed/);
  assert.equal(play("Ep45_Severin").f.get("CLAUSE_FADING"), 1);
  const roof = play("Ep45_Roof");
  assert.equal(roof.f.get("KNOCK_HEARD"), 1);
  assert.match(roof.text, /knocking\. From the other side/);
});

test("Ep 46, The Gate: Elodie taken before dawn, the Lances in the Archive and Halvard against them, her own name on the lock, and the sky torn open", () => {
  const cold = play("Ep46_Cold");
  assert.equal(cold.f.get("ELODIE_TAKEN_AGAIN"), 1);
  assert.match(cold.text, /already inside/);
  const seize = EPISODE_46.beats.find((b) => b.id === "seize");
  assert.equal(seize.stage, "archive");
  assert.deepEqual(seize.world.bounds, ZONES.archive.bounds);
  assert.ok(seize.wave.every((k) => k === "lance"));
  assert.match(play("Ep46_Halvard").text, /Those of you who still answer to me/);
  assert.match(play("Ep46_Page").text, /write her name/);
  const door = play("Ep46_Door");
  assert.equal(door.f.get("LOCK_TURNED"), 1);
  assert.match(door.text, /That isn't the Hollow/, "Hesper meant to open the Hollow; it goes further (GDD §15.8)");
  const sky = EPISODE_46.beats.find((b) => b.id === "sky");
  assert.equal(sky.stage, "aurelin");
  assert.equal(sky.set.GATE_OPEN, 1);
  const body = EP46_SCRIPT.slice(EP46_SCRIPT.indexOf("title: Ep46_Sky"));
  assert.match(body, /<<cue gateOpen>>/);
  assert.match(body, /<<shot sky -?\d/);
  assert.match(body, /<<sfx drums>>/);
  assert.match(body, /field of spears/);
});

test("The Gate over Aurelin: a red tear in the sky the story can open (cue gateOpen) and that stays open ($GATE_OPEN); a shot that looks up at it", () => {
  const sets = src("runtime/sets.js");
  const au = sets.slice(sets.indexOf("function buildAurelin("), sets.indexOf("function buildThornwick("));
  assert.match(au, /makeTear\(scene, "au-gateTear", \{[^}]*kind: "gate"/);
  assert.match(au, /K\.when\("\$GATE_OPEN"\)/);
  assert.match(au, /if \(name === "gateOpen"\) gateWant = 1;/);
  assert.match(src("runtime/tears.js"), /gate: \{ edge: glow\(scene, "tear-gateEdge"/);
  assert.match(src("runtime/story.js"), /if \(kind === "sky"\) \{/);
});

test("Eps 44–46 keep the leak rules: nobody named, nothing through the Gate named either", () => {
  assert.doesNotMatch(src("runtime/sets.js"), /\bdemons?\b|ash line|ash eleven/i, "the Gate's set dressing"); // (the lantern rack mourns a squadmate by name: allowed)
  for (const f of ["data/story/ep44.js", "data/story/ep45.js", "data/story/ep46.js", "data/story/arc5.js"]) {
    const s = src(f);
    assert.doesNotMatch(s, /\bsable\b/i, f);
    assert.doesNotMatch(s, /\bdemons?\b|ash line|ash eleven/i, f);
    assert.doesNotMatch(s, /\bcal\b|calder|CAL_[A-Z]/, f);
    assert.doesNotMatch(s, /\bB4\b|\bB6\b|red cord|wrist cord|mind the step/i, f);
  }
});

test("The Gate hangs where it can be seen: above the Crown Ward, over the Hall of Lanterns' roof from the street, and Ep 46's shots look at it", async () => {
  const { AURELIN_GATE: G, AURELIN_LAYOUT: A } = await import("../src/data/zones.js");
  const from = { x: 0, y: 1.1, z: 3 }; // low in the street below the Hall, where Ep 46 looks up
  const up = Math.atan2(G.y - from.y, Math.hypot(G.x - from.x, G.z - from.z));
  // Where the sight line passes the Hall's front, is it clear of the Hall (to the side of it, or above its roof)?
  const t = (A.hall.z0 - from.z) / (G.z - from.z), x = from.x + (G.x - from.x) * t, y = from.y + (G.y - from.y) * t;
  assert.ok(x < A.hall.x0 || x > A.hall.x1 || y > 19, `through the Hall at x ${x.toFixed(1)}, y ${y.toFixed(1)}`);
  assert.ok(up > 0.3 && up < 0.8, "up, but not straight up");
  for (const m of EP46_SCRIPT.matchAll(/<<shot sky (-?[\d.]+) (-?[\d.]+) (-?[\d.]+)>>/g)) {
    assert.ok(Math.hypot(+m[1] - G.x, +m[3] - G.z) < 2 && Math.abs(+m[2] - G.y) < 6, m[0]);
  }
});
