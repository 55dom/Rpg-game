// Phase 12 Step 1: progression as §17 writes it. Knight Rank (Ember → Spark → Flame → Blaze → Sun) by promotion exam,
// the tree's rows opened by rank (page tiers), {rank} in dialogue, and power gating: a level curve the story actually
// climbs (it used to stall near 15 of 60: nothing after Arc 2 gave XP), with brackets on every episode.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { KNIGHT_RANKS, RANK_SCRIPT, rankOf, rankName, rankBracket } from "../src/data/ranks.js";
import { Ranks, storyEpisode, storyBracket } from "../src/core/ranks.js";
import { bracketOf, episodeXp, xpToReach, killXp, growthAt, GROWTH, MAX_LEVEL, STORY_LEVEL_END, SKILLS, TIER_RANK, XP_BY_KIND, CATCH_UP } from "../src/data/skills.js";
import { Progress } from "../src/core/progress.js";
import { FlagStore, compileExpr, truthy } from "../src/core/flags.js";
import { parseScript, DialogueRunner, fillText } from "../src/core/script.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { ZONES } from "../src/data/zones.js";
import { ENEMIES } from "../src/data/enemies.js";
import { BOSS_KINDS } from "../src/sim/world.js";
import { CAST } from "../src/data/story/cast.js";

const nodes = parseScript(WORLD_SCRIPT, "world");
const play = (node, f = new FlagStore(), picks = []) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  let i = 0;
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") lines.push(s);
    if (s.type === "options") r.choose(picks[i++] ?? 0);
    if (s.type === "command") cmds.push(`${s.name} ${(s.args ?? []).join(" ")}`);
  }
  return { f, lines, cmds, text: lines.map((l) => l.text).join(" ") };
};

test("five ranks in §17's order; every exam opens after its episode, near that episode's bracket", () => {
  assert.deepEqual(KNIGHT_RANKS.map((r) => r.name), ["Ember", "Spark", "Flame", "Blaze", "Sun"]);
  for (const r of KNIGHT_RANKS.slice(1)) {
    assert.ok(nodes[r.node], `${r.name}: an interview`);
    assert.ok(r.trial.wave.every((k) => ENEMIES[k]), `${r.name}: a trial of real foes`);
    assert.ok(r.level <= bracketOf(r.ep), `${r.name}: level ${r.level} by Ep ${r.ep} (bracket ${bracketOf(r.ep)})`);
    assert.equal(r.after, `$EP${r.ep}_DONE`);
  }
  assert.deepEqual([4, 12, 13, 29, 47, 70].map(rankBracket), [0, 1, 2, 3, 4, 4]);
});

test("the exam: story first, then level, then the interview, then the ring; the goal decides, not just winning", () => {
  const f = new FlagStore(), r = new Ranks(f);
  assert.equal(r.eligible(30).why, "story");
  f.set("EP4_DONE", 1);
  assert.equal(r.eligible(3).why, "level");
  assert.ok(r.eligible(5).ok);
  // Spark: three perfect dodges or parries.
  const me = { team: 0 }, foe = { team: 1 };
  r.startTrial();
  r.event({ type: "perfectDodge", defender: me }, me); r.event({ type: "parry", defender: me }, me);
  r.event({ type: "perfectDodge", defender: foe }, me); // (someone else's dodge isn't yours)
  assert.equal(r.finishTrial(true).promoted, null, "won, but only two");
  assert.equal(rankOf(f), 0);
  r.startTrial();
  for (let i = 0; i < 3; i++) r.event({ type: "parry", defender: me }, me);
  assert.equal(r.finishTrial(false).promoted, null, "met the goal and lost: no ribbon");
  r.startTrial();
  for (let i = 0; i < 3; i++) r.event({ type: "parry", defender: me }, me);
  f.set("EXAM_READY", 1);
  assert.equal(r.finishTrial(true).promoted.name, "Spark");
  assert.equal(rankOf(f), 1); assert.equal(f.get("EXAM_READY"), 0); assert.equal(rankName(f), "Spark");
  // Blaze: no more than three blows; Sun: inside ninety seconds.
  f.set("KNIGHT_RANK", 2); f.set("EP28_DONE", 1);
  r.startTrial();
  for (let i = 0; i < 4; i++) r.event({ type: "hit", defender: me }, me);
  assert.equal(r.finishTrial(true).promoted, null, "four blows: not a Blaze");
  f.set("KNIGHT_RANK", 3);
  r.startTrial(); r.tick(91);
  assert.equal(r.finishTrial(true).promoted, null, "too slow for Sun");
  r.startTrial(); r.tick(60);
  assert.equal(r.finishTrial(true).promoted.name, "Sun");
  assert.equal(r.next, null); assert.equal(r.eligible(60).why, "top");
});

test("the Proctor: what he says when it's too soon, and an interview passed opens the ring (failed, it doesn't)", () => {
  const soon = play("W_Proctor", new FlagStore({ RANK_NEXT: 2, RANK_WHY: 1, KNIGHT_RANK: 1 }));
  assert.match(soon.text, /barely got your boots wet/);
  const low = play("W_Proctor", new FlagStore({ RANK_NEXT: 1, RANK_WHY: 2, RANK_NEED_LV: 5 }));
  assert.match(low.text, /level 5/);
  const pass = play("R_Spark", new FlagStore(), [0, 0, 0]); // go (sound), the one-pager (not), say so (sound)
  assert.ok(pass.cmds.some((c) => /rank ring/.test(c)), "two sound answers: into the ring");
  const fail = play("R_Spark", new FlagStore(), [2, 0, 2]); // wait, the one-pager, nothing
  assert.ok(!fail.cmds.some((c) => /rank ring/.test(c)));
  assert.match(fail.text, /not a Spark yet/);
  for (const id of ["R_Flame", "R_Blaze", "R_Sun"]) assert.ok(play(id, new FlagStore(), [0, 0, 0]).cmds.some((c) => /rank ring/.test(c)), id);
  for (const n of Object.values(parseScript(RANK_SCRIPT, "ranks"))) for (const it of n.body) if (it.type === "line" && it.speaker) assert.ok(CAST[it.speaker], it.speaker);
});

test("the Exam Grounds: on the map once you're a knight, one trial a rank, armed only once the interview's done", () => {
  const z = ZONES.grounds;
  assert.equal(z.stage, "examGrounds");
  assert.ok(!truthy(compileExpr(z.mapWhen)(new FlagStore())) && truthy(compileExpr(z.mapWhen)(new FlagStore({ EP2_DONE: 1 }))));
  assert.ok(z.cast.some((c) => c.node === "W_Proctor"));
  assert.equal(z.encounters.length, 4);
  for (const [i, e] of z.encounters.entries()) {
    assert.equal(e.exam, i + 1);
    assert.ok(!truthy(compileExpr(e.when)(new FlagStore())) && truthy(compileExpr(e.when)(new FlagStore({ EXAM_READY: i + 1 }))));
    assert.ok(e.leash >= 30, "a trial you can't run out of");
  }
});

test("page tiers (§17): the tree's second row needs Spark, its third Flame; without a rank given, nothing's closed", () => {
  const pr = new Progress({ level: 20, points: 20, pages: { Spell1: { xp: 9999 } } });
  pr.learn("Spell1.1", 0);
  assert.equal(pr.blocker("Spell1.2", 0), "Spark rank");
  assert.ok(pr.learn("Spell1.2", 1));
  assert.equal(pr.blocker("Spell1.3", 1), "Flame rank");
  assert.equal(pr.blocker("Spell1.3", 2), null);
  assert.equal(pr.blocker("Spell1.3"), null, "old callers");
  for (const s of Object.values(SKILLS)) assert.ok(s.tier in TIER_RANK);
});

test("{rank} in dialogue: the guard, the crier, the Proctor", () => {
  assert.equal(fillText("Evening, {rank}.", { flags: new FlagStore({ KNIGHT_RANK: 3 }) }), "Evening, Blaze.");
  assert.equal(fillText("{rank}", {}), "Ember");
  assert.match(play("W_Guard", new FlagStore({ KNIGHT_RANK: 2 })).text, /Evening, Flame/);
  const crier = play("W_Crier", new FlagStore({ KNIGHT_RANK: 1 }));
  assert.match(crier.text, /to the rank of Spark/);
  assert.equal(crier.f.get("CRIED_RANK"), 1);
  assert.doesNotMatch(play("W_Crier", crier.f).text, /to the rank of/, "once a rank");
});

test("power gating: brackets climb to 48 by the Clause, and the story's own XP gets a player there", () => {
  assert.deepEqual([4, 8, 12, 18, 28, 46, 70].map(bracketOf), [5, 8, 11, 16, 23, 34, 48]);
  for (let n = 1; n <= 70; n++) assert.ok(bracketOf(n) >= bracketOf(n - 1));
  assert.ok(STORY_LEVEL_END < MAX_LEVEL, "the last levels are the world's");
  // Episodes alone: seven tenths of each bracket's step, and the catch-up floor at the end of each.
  const pr = new Progress();
  for (let n = 1; n <= 70; n++) {
    const floor = xpToReach(bracketOf(n) - CATCH_UP) - (xpToReach(pr.level) + pr.xp);
    pr.gainXp(Math.max(episodeXp(n), floor));
    assert.ok(pr.level >= bracketOf(n) - CATCH_UP, `Ep ${n}: level ${pr.level} vs ${bracketOf(n)}`);
  }
  assert.ok(pr.level >= 46 && pr.level <= 48, `the Clause at ${pr.level}`);
});

test("every foe is worth XP now (Arc 3 on gave none), scaled to the story, halved when you're far past it", () => {
  for (const k of [...Object.keys(ENEMIES), ...BOSS_KINDS]) {
    const hp = ENEMIES[k]?.stats?.maxHealth ?? 800;
    if (XP_BY_KIND[k] === 0) continue; // (a soap bubble)
    assert.ok(killXp(k, hp, 10, 10) > 0, k);
  }
  assert.ok(killXp("lance", 170, 28, 28) > killXp("lance", 170, 5, 5) * 5, "a late fight is worth a late level's share");
  assert.equal(killXp("hound", 70, 4, 4), XP_BY_KIND.hound, "early on, the numbers as they were");
  assert.equal(killXp("lance", 170, 20, 30), Math.round(killXp("lance", 170, 20, 20) / 2));
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /!world\.wearing/, "a memory worn as someone else earns Rook nothing");
});

test("growth stays modest: the full step to level 10, a third of it after; the story's end near the old tuning", () => {
  assert.equal(growthAt(10).health, GROWTH.health * 9);
  assert.ok(growthAt(48).health < 110 && growthAt(60).health < 130);
  assert.ok(growthAt(48).attack < 0.15);
  assert.equal(new Progress({ level: 48 }).mods.health, Math.round(growthAt(48).health));
});

test("where the story is: the last episode finished, and the Journal and title cards say the bracket", () => {
  assert.equal(storyEpisode(new FlagStore()), 0);
  assert.equal(storyEpisode(new FlagStore({ EP4_DONE: 1, EP12_DONE: 1 })), 12);
  assert.equal(storyBracket(new FlagStore({ EP18_DONE: 1 })), 16);
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8"), story = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  assert.match(main, /"KNIGHT RANK"/); assert.match(main, /the story expects about/);
  assert.match(story, /Lv \$\{bracketOf\(ep\.number\)\}/);
});
