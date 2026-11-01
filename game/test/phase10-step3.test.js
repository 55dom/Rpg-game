import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { RESONANCE } from "../src/data/twins.js";
import { COMPANIONS } from "../src/data/companions.js";
import { EPISODE_15, EP15_SCRIPT } from "../src/data/story/ep15.js";
import { EP25_SCRIPT } from "../src/data/story/ep25.js";
import { creditsFor } from "../src/reveal/credits.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const beat = EPISODE_15.beats.find((b) => b.id === "twins");
const fight = () => {
  const w = new World({ seed: 5, ...beat.world }); w.spawnWave(["twinMirror", "twinSmoke"]); w.drainEvents(); run(w, 2);
  const [m, s] = ["twinMirror", "twinSmoke"].map((k) => w.fighters.find((f) => f.kind === k));
  const tam = w.companions.find((c) => c.kind === "tamsin");
  return { w, m, s, tam, duo: w.twinDuo };
};
const echoes = (w) => w.fighters.filter((f) => f.alive && f.traits.echo);
const play = (script, node, flags = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(parseScript(script, "t"), flags, {}).start(node), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s.text); if (s.type === "options") r.choose(pick); }
  return { lines, flags };
};

test("Tamsin fights at the Twins (Resonance, GDD §6): notes from a little way back, and her Assist on 3", () => {
  assert.deepEqual(beat.world.companions, ["bas", "juno", "tamsin"]);
  const { w, tam } = fight();
  assert.ok(tam && !tam.guest);
  assert.equal(tam.assistAbility.id, "ShatterNote");
  assert.ok(tam.assistAbility.tags.includes("resonance"));
  assert.ok(COMPANIONS.tamsin.options().some((o) => o.ability.id === "Note" && o.minRange >= 3), "she sings from a little way back");
  assert.equal(w.companions.filter((c) => !c.guest).indexOf(tam), 2, "the third: key 3");
  assert.ok(COMPANIONS.tamsin.supports().some((x) => x.ability.id === "ShatterNote"), "and she rings it herself (on a phone or a pad, there's no key 3)");
});

test("Resonance shatters mirrors: her note breaks every reflection near it at once", () => {
  const { w, m, s, tam, duo } = fight();
  m.combatant.health.set(m.combatant.health.max * 0.38); s.combatant.health.set(s.combatant.health.max * 0.38);
  run(w, 3);
  const before = echoes(w);
  assert.ok(before.length >= 3, "smoke and mirrors");
  const t = before[0];
  const near = before.filter((e) => Math.hypot(e.pos.x - t.pos.x, e.pos.z - t.pos.z) <= RESONANCE.r);
  tam.target = t;
  const out = w.shatterNoteAt(tam, tam.assistAbility);
  assert.equal(out.broke.length, near.length, "every one in reach of the note");
  const l = w.drainEvents();
  assert.ok(l.some((e) => e.type === "shatterNote") && l.filter((e) => e.type === "echoShatter" && e.by === tam).length === near.length);
  assert.ok(near.every((e) => !e.alive));
  void duo;
});

test("…and it cracks the glass: no guard for a while, then it mends (and a swap can't hand over a cracked guard)", () => {
  const { w, m, tam } = fight();
  assert.ok(m.traits.frontalGuard, "the glass, whole");
  tam.target = m;
  const hp = m.combatant.health.current;
  const out = w.shatterNoteAt(tam, tam.assistAbility);
  assert.ok(out.cracked.includes(m) && !m.traits.frontalGuard, "cracked: hit her head-on");
  assert.ok(m.combatant.health.current < hp, "and the note rings her too");
  assert.ok(w.drainEvents().some((e) => e.type === "glassShatter" && e.fighter === m));
  w.twinDuo._apply(m, "glass");
  assert.ok(!m.traits.frontalGuard, "still cracked, whoever holds it");
  const l = run(w, RESONANCE.glassFrames + 2);
  assert.ok(l.some((e) => e.type === "glassMend" && e.fighter === m));
  assert.ok(m.traits.frontalGuard, "mended");
});

test("Lio can read the dying twin (a lore branch): the cold cloister, the Mother, the garden under the Gate; and he stops", () => {
  const read = play(EP15_SCRIPT, "Ep15_Mirror", new FlagStore(), 0);
  assert.equal(read.flags.get("LIO_READ_TWIN"), 1);
  const all = read.lines.join("\n");
  for (const w of ["cold cloister", "Mother", "garden under the Gate", "That's all"]) assert.ok(all.includes(w), w);
  assert.equal(read.flags.get("CHOIR_TARGET"), "gate", "the Gate either way");
  const no = play(EP15_SCRIPT, "Ep15_Mirror", new FlagStore(), 1);
  assert.equal(no.flags.get("LIO_READ_TWIN"), 0);
  assert.ok(!no.lines.join("\n").includes("cloister"));
  assert.equal(no.flags.get("CHOIR_TARGET"), "gate");
  assert.ok(EPISODE_15.beats.find((b) => b.id === "mirror").cast.some((c) => c.id === "lio"), "he's there to ask");
});

test("…and it comes back: in Ep 25 he says why he stopped; the credits remember you asked", () => {
  const f = new FlagStore(); f.set("LIO_READ_TWIN", 1);
  const yes = play(EP25_SCRIPT, "Ep25_Confession", f).lines.join("\n");
  assert.ok(yes.includes("I'd been there"));
  const no = play(EP25_SCRIPT, "Ep25_Confession", new FlagStore()).lines.join("\n");
  assert.ok(!no.includes("I'd been there"));
  const roll = (o) => creditsFor({ get: (k) => o[k] }, "Rook").flatMap((s) => s.lines.flat()).join("\n");
  assert.ok(roll({ LIO_READ_TWIN: 1 }).includes("You asked Lio to read the twin"));
  assert.ok(!roll({ LIO_READ_TWIN: 0 }).includes("Lio to read"));
});

test("Ep 15 says so, and the note and the glass are drawn", () => {
  assert.ok(beat.tutorial.some((t) => /Shatter Note/.test(t.text)));
  assert.match(beat.eventHints.glassShatter, /cracked/);
  const main = src("main.js");
  for (const ev of ["shatterNote", "glassShatter", "glassMend"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
});
