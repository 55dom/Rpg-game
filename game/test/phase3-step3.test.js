import { test } from "node:test";
import assert from "node:assert/strict";
import { World, flatDistance } from "../src/sim/world.js";
import { SEVERIN_TUNING } from "../src/data/severin.js";

const until = (w, pred, max, log) => { for (let i = 0; i < max; i++) { if (pred()) return i; w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } assert.fail("condition never held"); };
const duel = () => { const w = new World({ seed: 5, companions: false }); w.spawnWave(["severin"]); w.drainEvents(); return { w, s: w.boss, p: w.player }; };
const phase2 = (w, s) => { s.combatant.health.set(s.combatant.health.max * 0.5); };

test("Severin spawns as a boss and fans Star Needles at range", () => {
  const { w, s, p } = duel();
  assert.equal(s.kind, "severin");
  assert.equal(s.boss.phase, 1);
  p.pos = { x: 0, y: 0, z: -4 }; // ten meters away
  const log = [];
  until(w, () => log.some((e) => e.type === "projectile" && e.projectile.owner === s), 400, log);
  const fan = log.filter((e) => e.type === "projectile" && e.projectile.owner === s);
  assert.equal(fan.length, 3, "three needles");
  const dirs = fan.map((e) => Math.atan2(e.projectile.dir.x, e.projectile.dir.z));
  assert.ok(Math.max(...dirs) - Math.min(...dirs) > 0.4, "spread out");
});

test("phase 2: he walks to Polaris and pins five stars joined as a constellation", () => {
  const { w, s, p } = duel();
  p.pos = { x: 0, y: 0, z: -8 };
  s.pos = { x: 4, y: 0, z: 2 };
  phase2(w, s);
  const log = [];
  until(w, () => s.boss.state === "anchored", 600, log);
  assert.ok(log.some((e) => e.type === "bossPhase" && e.phase === 2));
  const placed = log.find((e) => e.type === "starsPlaced");
  assert.equal(placed.stars.length, SEVERIN_TUNING.starCount);
  assert.equal(placed.lines.length, SEVERIN_TUNING.starCount);
  assert.ok(flatDistance(s.pos, s.boss.polaris) < 1);
});

test("star lines warn, then strike anyone standing on them, but not someone mid-jump", () => {
  const { w, s, p } = duel();
  phase2(w, s);
  until(w, () => s.boss.state === "anchored", 900);
  s.brain = null; // keep him still so only the lines act
  const L = s.boss.lines[0];
  const stand = () => { p.pos = { x: (L.a.x + L.b.x) / 2, y: 0, z: (L.a.z + L.b.z) / 2 }; p.vel = { x: 0, y: 0, z: 0 }; p.grounded = true; };
  stand();
  s.boss.pulse = 1;
  const log = [];
  until(w, () => log.some((e) => e.type === "starWarn"), 5, log);
  const hp = p.combatant.health.current;
  until(w, () => s.boss.active === 0 && log.some((e) => e.type === "starStrike"), SEVERIN_TUNING.warnFrames + SEVERIN_TUNING.activeFrames + 4, (stand(), log));
  assert.ok(p.combatant.health.current < hp, "the line hurts");
  // Next pulse: in the air above the line.
  w.player.combatant.reset();
  s.boss.pulse = 1;
  until(w, () => s.boss.warn > 0, 5);
  const hp2 = p.combatant.health.current;
  for (let i = 0; i < SEVERIN_TUNING.warnFrames + SEVERIN_TUNING.activeFrames; i++) { stand(); p.pos.y = 1.2; p.grounded = false; w.step(); w.drainEvents(); }
  assert.equal(p.combatant.health.current, hp2, "jumping clears it");
});

test("knocked off Polaris, the stars go dark and he reels; later he relights them", () => {
  const { w, s } = duel();
  phase2(w, s);
  until(w, () => s.boss.state === "anchored", 900);
  s.pos.x += 3; // shoved off his point
  const log = [];
  w.step(); log.push(...w.drainEvents());
  assert.ok(log.some((e) => e.type === "starsDim" && e.dimmed));
  assert.equal(s.boss.lines.length, 0);
  assert.ok(s.combatant.isStaggered);
  s.boss.timer = 1;
  until(w, () => s.boss.state === "anchored", 900);
});

test("a downed player can be revived mid-duel", () => {
  const { w, p } = duel();
  p.combatant.health.set(0);
  w.revivePlayer(0.5);
  assert.ok(p.alive);
  assert.equal(p.combatant.health.current, p.combatant.health.max * 0.5);
  assert.equal(w.drainEvents().at(-1).type, "playerRevive");
});

import { EP2_SCRIPT, EPISODE_2 } from "../src/data/story/ep2.js";
import { EP1_SCRIPT, EPISODE_1 } from "../src/data/story/ep1.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CAST } from "../src/data/story/cast.js";

const play = (r, pick) => { const out = []; for (let i = 0; i < 800; i++) { const s = r.next(); out.push(s); if (s.type === "end") return out; if (s.type === "options") r.choose(s.options.filter((o) => o.enabled)[Math.min(pick, s.options.filter((o) => o.enabled).length - 1)].index); } throw new Error("runaway"); };

test("Episode 2: valid, every speaker cast, every staged actor on stage, both duel outcomes play through", () => {
  const nodes = { ...parseScript(EP1_SCRIPT, "ep1"), ...parseScript(EP2_SCRIPT, "ep2") };
  validateEpisode(EPISODE_2, nodes);
  assert.equal(EPISODE_1.beats.at(-1).nextEpisode, "ep2");
  for (const b of EPISODE_2.beats.filter((x) => x.node)) {
    const onStage = new Set([...(b.cast ?? []).map((c) => c.id), ...(b.rook === null ? [] : ["player"])]);
    const walk = (block) => { for (const s of block) {
      if (s.type === "line" && s.speaker) assert.ok(CAST[s.speaker], `unknown speaker ${s.speaker}`);
      if (s.type === "cmd" && ["move", "pose", "face"].includes(s.name)) assert.ok(onStage.has(CAST[s.args[0]].actor), `${b.id}: ${s.args[0]} isn't on stage`);
      if (s.type === "cmd" && s.name === "shot" && s.args[0] !== "wide") for (const who of s.args.slice(1)) assert.ok(onStage.has(CAST[who].actor), `${b.id}: shot of ${who}, who isn't on stage`);
      if (s.type === "options") for (const o of s.items) walk(o.body);
      if (s.type === "if") { for (const x of s.branches) walk(x.body); walk(s.otherwise); }
    } };
    walk(nodes[b.node].body);
  }
  for (const [won, ups] of [[1, 0], [0, 3], [0, 1]]) for (const pick of [0, 1, 2]) {
    const f = new FlagStore({ EXAM_DUEL_WON: won, EXAM_GET_UPS: ups });
    for (const b of EPISODE_2.beats.filter((x) => x.node)) {
      const out = play(new DialogueRunner(nodes, f, { name: "Kit", pronouns: "they" }).start(b.node), pick);
      assert.ok(!out.some((s) => s.type === "line" && /\{[\w$]+\}/.test(s.text)), "no unfilled tokens");
    }
    assert.equal(f.get("JOINED_LANTERNS"), 1);
  }
  const duel = EPISODE_2.beats.find((b) => b.id === "duel");
  assert.deepEqual(duel.wave, ["severin"]);
  assert.equal(duel.getUps, 3);
});
