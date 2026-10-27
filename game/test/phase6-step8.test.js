import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { EPISODE_42 } from "../src/data/story/ep42.js";
import { EPISODE_43, EP43_SCRIPT } from "../src/data/story/ep43.js";
import { EPISODE_44, EP44_SCRIPT } from "../src/data/story/ep44.js";
import { AFTER_EP42, AFTER_EP43 } from "../src/data/story/arc5.js";
import { ZONES, ARCHIVE_LAYOUT } from "../src/data/zones.js";
import { CAST } from "../src/data/story/cast.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { MASKED_VI_TUNING, MASKED_VI_STATS, MASKED_TUNING, maskedVIOptions, maskIntegrity } from "../src/data/masked.js";
import { rumorBoard } from "../src/data/rumors.js";
import { LOOKS } from "../src/runtime/rig.js";

const nodes = { ...parseScript(EP43_SCRIPT, "e43"), ...parseScript(EP44_SCRIPT, "e44") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s); if (s.type === "options") r.choose(pick); }
  return { f, lines, text: lines.map((l) => l.text).join(" ") };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const duel = (seed = 3) => {
  const w = new World({ seed }); w.drainEvents();
  w.spawnWave(["maskedVI"]); w.drainEvents();
  const b = w.boss; b.brain.aggroRange = 0;
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  return { w, b, p: w.player };
};

test("Ep 43 follows Ep 42 and is startable from the menu with what came before", () => {
  validateEpisode(EPISODE_43);
  for (const b of EPISODE_43.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([EPISODE_42, EPISODE_43].map(next), ["ep43", "ep44"]);
  assert.deepEqual(EPISODE_43.setup, { ...AFTER_EP42 });
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /episode: EPISODE_43, script: EP43_SCRIPT/);
  assert.ok(LOOKS.maskedVI, "the duel's fighter has his look");
});

test("Encounter VI: the vault's kit and left-left-back are still his; the Draw from 70%, the Ring of Edges from 45%; he leaves at 25%", () => {
  const ids = (p) => maskedVIOptions(p).map((o) => o.ability.id);
  for (const id of ["Reap", "Cleave", "Lunge", "Sever"]) assert.ok(ids(1).includes(id), id);
  assert.ok(!ids(1).includes("Draw") && ids(2).includes("Draw") && ids(2).includes("Undercut"));
  assert.ok(!ids(2).includes("Ring") && ids(3).includes("Ring"));
  assert.deepEqual(MASKED_VI_STATS.phaseMarks, [0.7, 0.45, 0.25]);
  assert.deepEqual(MASKED_TUNING.pattern, ["Slip", "Slip", "Withdraw"], "B2, as in the vault");
  const { w, b } = duel();
  b.combatant.takeDamage(1e7); // this fight can't finish him: it stops at a quarter
  const log = run(w, 3);
  assert.ok(log.some((e) => e.type === "severLeave"), "he takes what he came for and goes");
  assert.ok(b.vanished && !b.alive);
});

test("The Draw: still on the mark when it closes, Rook comes out a step in front of him, facing him, as the Cleave starts; step off and nothing happens", () => {
  const { w, b, p } = duel();
  b.pos.x = b.prev.x = 0; b.pos.z = b.prev.z = 6; p.pos.x = p.prev.x = 0; p.pos.z = p.prev.z = 0;
  b.boss.onCustom("draw");
  const log = run(w, MASKED_VI_TUNING.draw.delay + 2);
  assert.ok(log.some((e) => e.type === "drawMark") && log.some((e) => e.type === "drawn"));
  assert.ok(Math.abs(Math.hypot(p.pos.x - b.pos.x, p.pos.z - b.pos.z) - MASKED_VI_TUNING.draw.front) < 0.3, "a glaive's length from him");
  assert.equal(b.runner.current?.id, "Cleave");
  const off = duel();
  off.b.pos.x = off.b.prev.x = 0; off.b.pos.z = off.b.prev.z = 6; off.p.pos.x = off.p.prev.x = 0; off.p.pos.z = off.p.prev.z = 0;
  off.b.boss.onCustom("draw");
  off.p.pos.x = off.p.prev.x = 3; // stepped off the tear
  assert.ok(!run(off.w, MASKED_VI_TUNING.draw.delay + 2).some((e) => e.type === "drawn"));
});

test("The Ring of Edges: cuts out of a ring of tears round Rook, one after another; standing still in the middle, none of them lands", () => {
  const { w, b, p } = duel();
  b.pos.x = b.prev.x = 0; b.pos.z = b.prev.z = 12; p.pos.x = p.prev.x = 0; p.pos.z = p.prev.z = 0;
  const hp = p.combatant.health.current;
  b.boss.onCustom("ring");
  const warns = w.drainEvents().filter((e) => e.type === "strikeWarn").map((e) => e.strike);
  const R = MASKED_VI_TUNING.ring;
  assert.equal(warns.length, R.n);
  for (const s of warns) assert.ok(Math.abs(Math.hypot(s.x, s.z) - R.radius) < 0.01 && s.kind === "sever");
  assert.deepEqual(warns.map((s) => s.delay), warns.map((_, i) => R.delay + i * R.gap), "one after another");
  run(w, R.delay + R.n * R.gap + 4);
  assert.equal(p.combatant.health.current, hp, "the middle is safe");
  const edge = duel();
  edge.b.pos.x = edge.b.prev.x = 0; edge.b.pos.z = edge.b.prev.z = 12; edge.p.pos.x = edge.p.prev.x = 0; edge.p.pos.z = edge.p.prev.z = 0;
  edge.b.boss.onCustom("ring");
  const first = edge.w.drainEvents().find((e) => e.type === "strikeWarn").strike;
  edge.p.pos.x = edge.p.prev.x = first.x; edge.p.pos.z = edge.p.prev.z = first.z; // standing where a cut comes out
  const h0 = edge.p.combatant.health.current;
  run(edge.w, R.delay + 2);
  assert.ok(edge.p.combatant.health.current < h0);
});

test("Ep 43: the Paragon gives Rook the case; the Choir pins him in the plaza; on the road under the Hall the knight takes the half-key: \"Go home, Lantern.\"", () => {
  assert.equal(play("Ep43_Case").f.get("KEY_CARRIED"), 1);
  const taken = play("Ep43_Taken", new FlagStore({ SABLE_ENCOUNTER: 6 }));
  assert.ok(taken.lines.some((l) => l.speaker === "Masked" && l.text === "Go home, Lantern."));
  assert.equal(taken.f.get("KEY_TAKEN"), 1);
  const tear = play("Ep43_Tear");
  assert.equal(tear.f.get("SABLE_ENCOUNTER"), 6, "set before he speaks: the mask's voice is lighter again (B7)");
  assert.ok(maskIntegrity(6) < maskIntegrity(5));
  const duelBeat = EPISODE_43.beats.find((b) => b.id === "duel");
  assert.deepEqual(duelBeat.wave, ["maskedVI"]);
  assert.ok(duelBeat.eventHints.drawMark && duelBeat.eventHints.edgeRing && duelBeat.eventHints.drawn);
  assert.ok(EPISODE_43.beats.find((b) => b.id === "tear").cast.find((c) => c.id === "masked").hidden, "out of a tear");
  assert.equal(EPISODE_43.beats.find((b) => b.id === "after").set.KEY_TAKEN, 1);
  assert.match(play("Ep43_After").text, /both halves/);
  const board = rumorBoard({ get: (k) => ({ SABLE_ENCOUNTER: 6, SABLE_NAMED: 1 })[k] });
  assert.match(board.seen.at(-1), /half of the key/);
});

test("Ep 43 names nobody: no knight's name, nothing pointed at", () => {
  for (const f of ["ep43.js", "ep44.js", "arc5.js"]) {
    const src = readFileSync(new URL(`../src/data/story/${f}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, /\bsable\b/i, f);
    assert.doesNotMatch(src, /\bdemons?\b|ash line|ash eleven/i, f);
    assert.doesNotMatch(src, /\bcal\b|calder|CAL_[A-Z]/, f);
    assert.doesNotMatch(src, /\bB4\b|\bB6\b|red cord|wrist cord|mind the step/i, f);
  }
});

test("In an episode the street keeps clear of the story: nobody walks through a fight, and only a few pass by in a scene", () => {
  const src = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  assert.match(src, /else if \(this\.ep\) \{[\s\S]{0,300}density: this\.fight \|\| this\.exploring\?\.combat \? 0 : this\.exploring \? 0\.6 : 0\.15/);
});

test("Ep 44: the Grand Archive (a new set, story only), the lock in its dais, the account with its pages cut out, and the hymnal that's an invitation", () => {
  validateEpisode(EPISODE_44);
  for (const b of EPISODE_44.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); }
  assert.deepEqual(EPISODE_44.setup, { ...AFTER_EP43 });
  assert.equal(EPISODE_44.beats.find((b) => b.type === "preview").nextEpisode, "ep45");
  const z = ZONES.archive;
  assert.ok(z.interior && !z.exits.length, "no way in from the map: the story brings you");
  assert.ok(z.bounds.solids.some((s) => s.circle && s.low && s.circle[0] === ARCHIVE_LAYOUT.dais.x && s.circle[1] === ARCHIVE_LAYOUT.dais.z), "the lock's dais");
  assert.ok(CAST.Ottoline && LOOKS[CAST.Ottoline.actor]);
  const sets = readFileSync(new URL("../src/runtime/sets.js", import.meta.url), "utf8");
  assert.match(sets, /archive: buildArchive/);
  const cold = play("Ep44_Cold");
  assert.match(cold.text, /I only mean to knock/);
  assert.match(cold.text, /The Founding/);
  const acc = play("Ep44_Account");
  assert.equal(acc.f.get("ACCOUNT_CUT"), 1);
  assert.match(acc.text, /cut out, cleanly/);
  const stacks = EPISODE_44.beats.find((b) => b.id === "stacks");
  assert.deepEqual(stacks.required, ["account", "lio"]);
  assert.equal(play("Ep44_Lio").f.get("HYMNAL_FOUND"), 1);
  const inv = play("Ep44_Invitation");
  assert.equal(inv.f.get("INVITATION_KNOWN"), 1);
  assert.match(inv.text, /doesn't need the key/);
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /episode: EPISODE_44, script: EP44_SCRIPT/);
});

test("A walk-around's counter counts what the beat needs, the things to find as well as the people (Ep 30's waystones read 0/0)", async () => {
  const { objectiveCount } = await import("../src/sim/episode.js");
  const { readdirSync } = await import("node:fs");
  let checked = 0;
  for (const f of readdirSync(new URL("../src/data/story/", import.meta.url)).filter((f) => /^ep\d+\.js$/.test(f))) {
    const mod = await import(`../src/data/story/${f}`);
    for (const ep of Object.values(mod).filter((v) => v?.beats)) for (const b of ep.beats.filter((x) => x.type === "explore" && /\{total\}/.test(x.objective ?? ""))) {
      const { n, total } = objectiveCount(b, new Set());
      assert.equal(n, 0);
      assert.ok(total > 0, `${ep.id}/${b.id} counts nothing`);
      if (b.counts === "required") assert.equal(total, b.required.length, `${ep.id}/${b.id}`);
      checked++;
    }
  }
  assert.ok(checked >= 15, `checked ${checked}`);
  assert.deepEqual(objectiveCount({ counts: "required", required: ["account", "lio"], cast: [{ id: "lio", node: "x" }] }, new Set(["account"])), { n: 1, total: 2 });
});
