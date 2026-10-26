import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../src/sim/world.js";
import { EPISODE_38 } from "../src/data/story/ep38.js";
import { EPISODE_39, EP39_SCRIPT } from "../src/data/story/ep39.js";
import { EPISODE_40, EP40_SCRIPT } from "../src/data/story/ep40.js";
import { AFTER_EP38 } from "../src/data/story/arc4.js";
import { AFTER_EP39 } from "../src/data/story/arc5.js";
import { CAST } from "../src/data/story/cast.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { REVISION } from "../src/data/inscription.js";
import { PARAGON_TUNING, PARAGON_STATS } from "../src/data/paragon.js";
import { LOOKS } from "../src/runtime/rig.js";

const nodes = { ...parseScript(EP39_SCRIPT, "e39"), ...parseScript(EP40_SCRIPT, "e40") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s); if (s.type === "options") r.choose(pick); }
  return { f, lines, text: lines.map((l) => l.text).join(" ") };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const boss = (kind, seed = 3, opts = {}) => { const w = new World({ seed, ...opts }); w.drainEvents(); w.spawnWave([kind]); w.drainEvents(); return { w, b: w.boss }; };

test("Arc 5 opens after Arc 4: Eps 39–40 chained from Ep 38, each startable from the menu with what came before", () => {
  for (const ep of [EPISODE_39, EPISODE_40]) {
    validateEpisode(ep);
    for (const b of ep.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); }
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([EPISODE_38, EPISODE_39, EPISODE_40].map(next), ["ep39", "ep40", "ep41"]);
  assert.deepEqual([EPISODE_39.setup, EPISODE_40.setup], [{ ...AFTER_EP38 }, { ...AFTER_EP39 }]);
  assert.ok(CAST.Paragon && LOOKS[CAST.Paragon.actor]);
});

test("Revision: a hit that would drop Rook with half a Surge gauge rewinds three seconds for Rook alone; without it, Rook falls", () => {
  const setup = (revision) => {
    const w = new World({ seed: 4, revision }); w.drainEvents();
    w.spawnWave(["shell"]); w.drainEvents();
    const e = w.liveEnemies[0]; e.brain.aggroRange = 0;
    const p = w.player; p.surge.fill();
    run(w, REVISION.frames + 20);
    const was = { x: p.pos.x, z: p.pos.z };
    p.pos.x += 4; p.combatant.health.set(5);
    e.combatant.health.set(e.combatant.health.max * 0.5);
    w.addStrike(e, p.pos.x, p.pos.z, { delay: 2, r: 1.5, spec: { damage: 999, posture: 10, hitstop: 1, hitstun: 10, knockback: 0, unblockable: true }, kind: "thunder" });
    return { w, p, e, was, log: run(w, 6) };
  };
  const yes = setup(true);
  assert.ok(yes.log.some((ev) => ev.type === "revision") && !yes.log.some((ev) => ev.type === "playerDown"));
  assert.ok(yes.p.alive && Math.hypot(yes.p.pos.x - yes.was.x, yes.p.pos.z - yes.was.z) < 0.5, "back where Rook stood three seconds ago");
  assert.ok(yes.p.combatant.health.current > 5, "and the damage taken since, undone");
  assert.ok(Math.abs(yes.p.surge.current - yes.p.surge.max * (1 - REVISION.cost)) < 1e-6, "for half the gauge");
  assert.equal(yes.e.combatant.health.normalized, 0.5, "what Rook did to them stands");
  const no = setup(false);
  assert.ok(!no.p.alive && no.log.some((ev) => ev.type === "playerDown"));
  const empty = setup(true);
  assert.ok(empty.log.some((ev) => ev.type === "revision"));
  // With less than half a gauge, the page stays where it is.
  const w = new World({ seed: 4, revision: true }); w.drainEvents(); w.spawnWave(["shell"]); w.drainEvents();
  w.liveEnemies[0].brain.aggroRange = 0; run(w, 60); w.player.surge.set(w.player.surge.max * 0.4); w.player.combatant.health.set(5);
  w.addStrike(w.liveEnemies[0], w.player.pos.x, w.player.pos.z, { delay: 2, r: 1.5, spec: { damage: 999, posture: 10, hitstop: 1, hitstun: 10, knockback: 0, unblockable: true } });
  assert.ok(run(w, 6).some((ev) => ev.type === "playerDown"));
  assert.ok(new World({ revision: true }).playerStats.manaRegenPerSecond > new World({}).playerStats.manaRegenPerSecond, "ink comes back faster");
});

test("The Paragon spars: Noon falls where you stand, Zenith's cross at 50%, and Dawnbreak once at 20%; he yields, never dies", () => {
  const { w, b } = boss("paragon", 5);
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  b.brain.aggroRange = 0;
  assert.ok(PARAGON_STATS.yields);
  b.boss.onCustom("noon");
  const noon = run(w, 2).find((e) => e.type === "strikeWarn");
  assert.ok(noon && Math.hypot(noon.strike.x - w.player.pos.x, noon.strike.z - w.player.pos.z) < 0.01 && noon.strike.kind === "sun");
  b.combatant.health.set(b.stats.maxHealth * 0.45);
  const cross = run(w, 120).filter((e) => e.type === "strikeWarn" && e.strike.kind === "sun").map((e) => e.strike);
  assert.ok(cross.length >= 16, "four arms of light");
  b.combatant.health.set(b.stats.maxHealth * 0.18);
  const dawn = run(w, 3);
  assert.ok(dawn.some((e) => e.type === "dawnbreak"));
  const big = dawn.find((e) => e.type === "strikeWarn" && e.strike.r === PARAGON_TUNING.dawnR);
  assert.ok(big && big.strike.spec.damage >= 999, "nobody walks away from it");
  b.combatant.health.set(b.stats.maxHealth * 0.1);
  assert.ok(!run(w, 3).some((e) => e.type === "dawnbreak"), "once");
});

test("Revision wakes in the middle of the spar, as the Dawnbreak comes, and the Journal can say what it does", () => {
  const spar = EPISODE_40.beats.find((b) => b.type === "fight");
  assert.deepEqual(spar.wave, ["paragon"]);
  assert.deepEqual([spar.awaken.on, spar.awaken.flag], ["dawnbreak", "REVISION"]);
  assert.ok(spar.eventHints.revision && spar.eventHints.dawnbreak);
  assert.equal(EPISODE_40.beats.find((b) => b.id === "after").set.REVISION, 1, "whether or not the page had to turn");
  assert.match(play("Ep40_After").text, /Revision/);
  assert.match(play("Ep39_Visit").text, /broke its key in half/);
});
