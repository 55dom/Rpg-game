// Phase 13 Step 2: the cinematic tiers as data (GDD §19.1): T1 combat cues from one table (FEEDBACK), speed lines as a
// cue (§19.6), and T2: Team Attacks as 3–6 s sequences (control taken, skippable, a short version after the first
// view), built, like Skyrender now, by filling §19.4's template (seven beats, six standard track slots).
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FEEDBACK, T2_BEATS, TRACKS, SHORT_BEATS, sequence, TEAM_SEQUENCES, t2Mode, t2MarkSeen, t2Reset, t2Seen } from "../src/data/cinematics.js";
import { ROOK_ABILITIES as R } from "../src/data/rook.js";
import { EventType as E } from "../src/core/abilities.js";
import { World, BOND_GAUGE } from "../src/sim/world.js";
import { SHOTS } from "../src/runtime/shots.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const cues = (a) => a.events.filter((e) => e.type === E.CameraCue).map((e) => [e.frame, e.key]);
beforeEach(() => t2Reset());

test("T1 (§19.1): shake, FOV punch, impact frames and speed lines come from one table, by the cue's name", () => {
  for (const k of ["punch", "finisher", "speed"]) assert.ok(FEEDBACK[k], k);
  const main = src("main.js");
  assert.match(main, /if \(!t2key\) \{ if \(e\.key !== "speed" \|\| isPlayer\(f\)\) feedback\(e\.key\); \}/);
  assert.doesNotMatch(main, /if \(e\.key === "punch"\) \{ camera\.kick/, "no cue hard-coded in the handler any more");
  for (const k of Object.keys(FEEDBACK)) for (const f of Object.keys(FEEDBACK[k])) assert.ok(["kick", "shake", "impact", "strong", "speedLines"].includes(f), `${k}.${f}`);
});

test("speed lines (§19.6: 'a screen-space overlay… driven by… cue'): lunges, air dashes and releases, and the setting turns them off", () => {
  assert.ok(cues(R.AirDash).some(([f, k]) => f === 0 && k === "speed"));
  assert.ok(cues(R.DashStrike).some(([, k]) => k === "speed"));
  assert.ok(FEEDBACK.speed.speedLines > 0 && FEEDBACK["ult-release"].speedLines > 0 && FEEDBACK["team-release"].speedLines > 0);
  assert.match(src("main.js"), /const speedLines = \(sec\) => \{ if \(!settings\.speedLines\) return;/);
  assert.match(readFileSync(new URL("../template.html", import.meta.url), "utf8"), /\.speeding \.speedlines \{ opacity/);
});

test("the template (§19.4): seven beats at their default lengths, six track slots; Skyrender is it filled in, frame for frame", () => {
  assert.deepEqual(T2_BEATS.map((b) => [b.beat, b.sec]), [["activation", 0.4], ["charge", 0.8], ["closeup", 0.6], ["release", 0.8], ["impact", 0.2], ["aftermath", 0.8], ["return", 0.4]]);
  assert.deepEqual(Object.keys(TRACKS), ["camera", "anim", "vfx", "sfx", "voice", "post"]);
  const sky = R.Skyrender;
  assert.equal(sky.total, 156); assert.deepEqual([sky.startup, sky.active, sky.recovery], [48, 72, 36]);
  assert.deepEqual(cues(sky).filter(([, k]) => k.startsWith("ult-") && k !== "ult-flash"), [[0, "ult-activate"], [22, "ult-charge"], [34, "ult-closeup"], [48, "ult-release"], [114, "ult-impact"], [124, "ult-aftermath"], [148, "ult-return"]]);
  const hits = sky.events.filter((e) => e.type === E.SpawnHitbox).map((e) => `${e.frame}:${e.key}`);
  assert.deepEqual(hits, ["48:SkyRing", "60:SkyCut", "68:SkyCut", "76:SkyCut", "84:SkyCut", "92:SkyCut", "100:SkyCut", "108:SkyCut", "114:SkyFinal"]);
  assert.ok(sky.events.some((e) => e.type === E.SpawnVfx && e.key === "ultName" && e.frame === 34), "the voice track: the name, on the close-up");
  assert.match(src("data/rook.js"), /add\(sequence\(\{\n\s+id: "Skyrender"/);
  assert.throws(() => sequence({ id: "Bad", tracks: { camera: { overture: "x" } } }), /no beat "overture"/);
});

test("a Team Attack is a T2 sequence: 3–6 s on the defaults, every beat shot; the short version goes straight to the release", () => {
  const full = TEAM_SEQUENCES.full, short = TEAM_SEQUENCES.short;
  assert.equal(full.total, 240); assert.ok(full.total / 60 >= 3 && full.total / 60 <= 6, "§19.1: 3–6 s");
  assert.deepEqual(cues(full.ability).filter(([, k]) => k.startsWith("team-") && k !== "team-flash").map(([, k]) => k), ["team-activate", "team-charge", "team-closeup", "team-release", "team-impact", "team-aftermath", "team-return"]);
  assert.deepEqual(SHORT_BEATS, ["release", "impact", "return"]);
  assert.equal(short.total, 84);
  assert.deepEqual(cues(short.ability).filter(([, k]) => k !== "team-flash").map(([, k]) => k), ["team-release", "team-impact", "team-return"]);
  for (const s of [full, short]) {
    const inv = s.ability.events.find((e) => e.type === E.Invulnerable);
    assert.equal(inv.frame, 0); assert.equal(inv.value, s.total, "untouchable for the whole sequence (its control is taken)");
  }
  for (const k of ["team-activate", "team-charge", "team-closeup", "team-release", "team-impact", "team-aftermath", "team-return"]) assert.ok(SHOTS[k], k);
  assert.equal(SHOTS["team-closeup"].subject, "ally", "the close-up is the squadmate's");
});

test("in the fight: Rook's controls are taken, the field holds, the squadmate moves on the release, the strike lands on the impact", () => {
  for (const mode of ["full", "short"]) {
    const w = new World({ seed: 9, companions: ["bas"], teamAttacks: ["bas"], t2Mode: () => mode }); w.drainEvents();
    const e = w.spawnEnemy("acolyte", 0, 3); e.brain = null; e.combatant.health.max = e.combatant.health.current = 5000; w.drainEvents();
    w.bondGauge = BOND_GAUGE.max;
    const f0 = w.frame, seq = TEAM_SEQUENCES[mode];
    assert.ok(w.callAssist("bas").ok);
    const log = []; let assistAt = null, strikeAt = null, frozen = 0, locked = 0;
    for (let i = 0; i < seq.total + 20; i++) {
      w.step(); const ev = w.drainEvents(); log.push(...ev);
      if (ev.some((x) => x.type === "assist" && x.team)) assistAt = w.frame - f0;
      if (ev.some((x) => x.type === "teamStrike")) strikeAt = w.frame - f0;
      if (w.stopFrames > 0) frozen++;
      if (w.player.current?.id === "TeamSequence") locked++;
    }
    assert.ok(log.some((x) => x.type === "teamAttack" && x.mode === mode));
    assert.ok(Math.abs(assistAt - seq.at.release) <= 1, `${mode}: the squadmate's move on the release (${assistAt})`);
    assert.ok(Math.abs(strikeAt - seq.at.impact) <= 1, `${mode}: the strike on the impact (${strikeAt})`);
    assert.ok(frozen >= seq.at.impact - 2, `${mode}: the field holds until the strike`);
    assert.ok(locked >= seq.total - 3, `${mode}: Rook's controls are the sequence's`);
    assert.ok(log.some((x) => x.type === "hit" && x.ability.id === "TeamAttack"));
  }
});

test("skippable, with the short version after the first view (§19.1); the skip and the hand-back are in the game", () => {
  assert.equal(t2Mode("short", "team-bas"), "full", "first time: the whole thing");
  t2MarkSeen("team-bas");
  assert.ok(t2Seen("team-bas")); assert.equal(t2Mode("short", "team-bas"), "short"); assert.equal(t2Mode("short", "team-juno"), "full");
  assert.equal(t2Mode("full", "team-bas"), "full"); assert.equal(t2Mode("off", "Skyrender"), "off");
  const main = src("main.js");
  assert.match(main, /addEventListener\("keydown", \(e\) => \{ if \(state\.t2 && !e\.repeat/, "any key skips");
  assert.match(main, /canvas\.addEventListener\("pointerdown", \(\) => \{ if \(state\.t2\) t2Skip\(\); \}\)/, "and a tap");
  assert.match(main, /if \(finished && t\.mode === "full" && !t\.skipped\) t2MarkSeen\(t\.id\)/, "seen once it's played through");
  assert.match(main, /world\.t2Mode = \(id\) => t2Mode\(settings\.ult, id\)/);
  assert.match(main, /case "ended": if \(isPlayer\(ev\.fighter\) && state\.t2/, "cut short (a fight ends mid-sequence): the camera comes home");
});
