import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { World } from "../src/sim/world.js";
import { EPISODE_22 } from "../src/data/story/ep22.js";
import { EPISODE_23, EP23_SCRIPT, NOTEBOOK_READ } from "../src/data/story/ep23.js";
import { EPISODE_24, EP24_SCRIPT } from "../src/data/story/ep24.js";
import { AFTER_EP22, AFTER_EP23 } from "../src/data/story/arc3.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { ZONES, IRONHOLD_LAYOUT } from "../src/data/zones.js";
import { keyItemsHeld } from "../src/data/keyItems.js";
import { WRAITHE_ABILITIES, WRAITHE_TUNING, WRAITHE_STATS } from "../src/data/wraithe.js";
import { rumorBoard, RUMOR_BOARD } from "../src/data/rumors.js";
import { found, investigationScore } from "../src/core/clues.js";
import { LOOKS } from "../src/runtime/rig.js";
import { sheetFor } from "../src/data/sheets.js";
import { tearOutline } from "../src/runtime/tears.js";

const nodes = { ...parseScript(WORLD_SCRIPT, "w"), ...parseScript(EP23_SCRIPT, "e23"), ...parseScript(EP24_SCRIPT, "e24") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s.text); if (s.type === "options") r.choose(pick); }
  return { f, lines, text: lines.join(" ") };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const tough = (w) => { w.player.combatant.health.max = w.player.combatant.health.current = 1e6; };

test("Eps 23–24 are whole episodes chained from Ep 22, each starting Arc 3 from the menu with what came before", () => {
  for (const ep of [EPISODE_23, EPISODE_24]) {
    validateEpisode(ep, nodes);
    assert.equal(ep.unlockAt, 5);
    for (const b of ep.beats) for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node);
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([next(EPISODE_22), next(EPISODE_23)], ["ep23", "ep24"]);
  assert.equal(EPISODE_23.beats.find((b) => b.type === "preview").next, undefined, "Ep 23's preview takes Ep 24's own title");
  assert.equal(next(EPISODE_24), "ep25", "on to What Lio Knew");
  assert.deepEqual(EPISODE_23.setup, { ...AFTER_EP22 });
  assert.deepEqual(EPISODE_24.setup, { ...AFTER_EP23 });
  assert.equal(AFTER_EP22.BRANNOC_DEAD, 1); assert.equal(AFTER_EP23.EP23_DONE, 1);
  assert.deepEqual(EPISODE_23.world.companions, ["bas", "juno"], "Brannoc is gone: the squad fights as a squad again");
  assert.ok(EPISODE_23.beats.some((b) => b.type === "fight" && b.wave.includes("wraithe")));
  assert.ok(EPISODE_24.beats.some((b) => b.type === "cutscene" && b.cutscene === "ep24_tear"));
});

test("Juno's thread: ask the squad, then the loose stone at the foot of the tower, where the notebook was", () => {
  const ask = EPISODE_23.beats.find((b) => b.id === "ask"), tower = EPISODE_23.beats.find((b) => b.id === "tower");
  assert.deepEqual(ask.required, ["dagrun", "bas", "tamsin"]);
  assert.deepEqual(tower.required, ["towerStone"]);
  // Lio and Juno can be talked to as well, but the objective only counts who you have to ask.
  const camp = EPISODE_24.beats.find((b) => b.id === "camp");
  for (const b of [ask, camp]) assert.ok(b.counts === "required" && b.cast.filter((c) => c.node).length > b.required.length, b.id);
  assert.ok(play("Ep23_Tamsin").text.includes("foot of the tower"), "someone saw where he went");
  assert.equal(play("Ep23_Stone").f.get("NOTEBOOK_FOUND"), 1);
  const lh = ZONES.lighthouse, [x0, z0, x1, z1] = lh.bounds.rect, stone = tower.pickups[0];
  const blocked = lh.bounds.solids.some((s) => s.circle ? Math.hypot(stone.x - s.circle[0], stone.z - s.circle[1]) < s.circle[2] + 0.35
    : stone.x > s.box[0] - 0.35 && stone.x < s.box[2] + 0.35 && stone.z > s.box[1] - 0.35 && stone.z < s.box[3] + 0.35);
  assert.ok(stone.x > x0 && stone.x < x1 && stone.z > z0 && stone.z < z1 && !blocked, "the stone can be reached");
  assert.ok(!EPISODE_23.beats.some((b) => (b.cast ?? []).some((c) => c.id === "cal")), "he's never on stage");
});

test("clue A4: Juno shares the notebook only at bond rank 4 (else later, at the Lighthouse); it always reads as him knowing he'd die", () => {
  const trusted = new FlagStore(); trusted.set("BOND_JUNO", 75);
  const r = play("Ep23_Notebook", trusted);
  assert.ok(found(r.f, "A4") && r.f.get("HAS_CAL_NOTEBOOK") === 1);
  assert.ok(r.text.includes("wrong side of his own door") && r.text.includes("depends which side is wrong"), "the note");
  assert.ok(r.text.includes("left holding a door"), "with its alibi: he knew he'd die");
  assert.ok(r.text.includes("Tell Juno it held."));
  assert.equal(investigationScore(r.f), 1);
  // Not trusted yet: she keeps it, and the clue is missed for now.
  const early = play("Ep23_Notebook", new FlagStore());
  assert.ok(!found(early.f, "A4") && early.f.get("JUNO_HAS_NOTEBOOK") === 1);
  assert.ok(!play("W_Juno", early.f).text.includes("wrong side"), "not until the bond is there");
  early.f.set("BOND_JUNO", 80);
  const later = play("W_Juno", early.f);
  assert.ok(found(later.f, "A4") && later.text.includes("depends which side is wrong") && later.f.get("JUNO_HAS_NOTEBOOK") === 0);
  assert.ok(!play("W_Juno").text.includes("notebook"), "before Ep 23 she has nothing to share");
  assert.ok(NOTEBOOK_READ.includes("<<set $CLUE_A4 to 1>>"), "one text for both readings");
  const item = keyItemsHeld(later.f).find((k) => k.id === "calNotebook");
  assert.ok(item && item.text.includes("Tell Juno it held"));
});

test("the vigil: Wraithe steps out of a pale tear and never says a word; Dagrun names him, Lio knows too much", () => {
  const vigil = EPISODE_23.beats.find((b) => b.id === "vigil");
  assert.ok(vigil.cast.find((c) => c.id === "wraithe").hidden, "he arrives through the air");
  assert.ok(/<<fx rift Wraithe>>[\s\S]*<<show Wraithe>>/.test(EP23_SCRIPT));
  assert.equal(CAST.Wraithe.actor, "wraithe");
  for (const src of [EP23_SCRIPT, EP24_SCRIPT, WORLD_SCRIPT]) assert.ok(!/^\s*Wraithe:/m.test(src), "the silent school: no lines");
  assert.ok(play("Ep23_Vigil").text.includes("rift-walker"));
  const after = play("Ep23_After");
  assert.ok(after.text.includes("Pale Choir's oldest school") && after.text.includes("I read a lot"), "space-tearing is now a Choir technique");
  assert.equal(after.f.get("WRAITHE_SEEN"), 1);
  for (const n of ["Ep23_Lio", "Ep23_After"]) assert.ok(nodes[n], n);
});

test("Wraithe: in through one tear, out of another behind you; untouchable in between; the stab can be parried", () => {
  const w = new World({ seed: 5, companions: ["bas", "juno"] }); w.drainEvents(); tough(w);
  const b = w.spawnBoss("wraithe", 0, 6); w.drainEvents();
  assert.ok(!WRAITHE_ABILITIES.RiftStep.hit.unblockable, "the warning is the tear, not a red glint");
  b.controller.startDirect(WRAITHE_ABILITIES.RiftStep, w.frame);
  const log = [];
  let hidden = 0;
  for (let i = 0; i < 40; i++) { w.step(); const ev = w.drainEvents(); log.push(...ev.map((e) => ({ ...e, frame: i }))); if (b.submerged) { hidden++; assert.ok(b.boss.untouchable); } }
  const tear = (role) => log.find((e) => e.type === "riftOpen" && e.role === role);
  assert.ok(tear("out") && tear("mark") && tear("in"), "out, the warning, back in");
  assert.ok(tear("in").frame - tear("mark").frame >= 12, "the exit tear opens well before he steps out");
  assert.ok(hidden >= 20, "gone while he's in the tear");
  assert.ok(!b.submerged);
  assert.ok(Math.hypot(b.pos.x - w.player.pos.x, b.pos.z - w.player.pos.z) < WRAITHE_TUNING.exitBehind + 0.6, "right behind you");
});

test("the Undertow: a pale tear under your feet; step off and nothing happens; stay and you fall out of the sky", () => {
  const w = new World({ seed: 6 }); w.drainEvents(); tough(w);
  const b = w.spawnBoss("wraithe", 0, 8); w.drainEvents();
  b.boss.onCustom("undertow");
  const warn = w.drainEvents().find((e) => e.type === "strikeWarn");
  assert.ok(warn && warn.strike.kind === "rift" && warn.strike.lift === WRAITHE_TUNING.dropHeight);
  const drop = run(w, WRAITHE_TUNING.undertowDelay + 1).find((e) => e.type === "riftDrop");
  assert.ok(drop && drop.fighter === w.player && w.player.pos.y > 5, "through the floor and out of the air above");
  run(w, 90);
  assert.ok(w.player.grounded && w.player.pos.y < 0.01, "and down again");
  b.boss.onCustom("undertow"); w.drainEvents();
  w.player.pos.x = w.player.prev.x = w.player.pos.x + 4;
  assert.ok(!run(w, WRAITHE_TUNING.undertowDelay + 1).some((e) => e.type === "riftDrop"), "off the seam: nothing");
});

test("Wraithe calls two acolytes at 65%; at 30% he leaves through a tear and takes them; the fight ends with him alive", () => {
  const w = new World({ seed: 4 }); w.drainEvents(); tough(w);
  w.spawnWave(["wraithe"]); w.drainEvents();
  const b = w.boss;
  b.combatant.takeDamage(WRAITHE_STATS.maxHealth * 0.38);
  const call = run(w, 3).find((e) => e.type === "riftCall");
  assert.equal(call?.called.length, WRAITHE_TUNING.acolytes);
  b.combatant.takeDamage(1e6);
  assert.ok(b.combatant.health.current > 0, "nobody finishes him here");
  const esc = run(w, 3).filter((e) => e.type === "riftEscape");
  assert.deepEqual(esc.map((e) => e.fighter.kind).sort(), ["acolyte", "acolyte", "wraithe"]);
  assert.ok(b.vanished, "gone, not dead on the field");
  assert.ok(run(w, 160).some((e) => e.type === "waveClear"));
});

test("Encounter I: the Cindermaw rolls, a black tear opens under it, it falls out of the sky; a masked figure on the ridge walks away", () => {
  const cs = validateCutscene(CUTSCENES.ep24_tear), RG = IRONHOLD_LAYOUT.ridge;
  const cues = cs.events.filter((e) => e.cue).map((e) => e.cue);
  assert.deepEqual(cues, ["engineRoll", "tear", "sky"]);
  const knight = cs.actors.find((a) => a.look === "masked");
  assert.ok(knight && knight.y === RG.h && knight.x > IRONHOLD_LAYOUT.rect[2], "standing on the ridge, past where anyone can walk");
  const cut = cs.events.find((e) => e.pose?.id === knight.id && e.pose.name === "raise"), tear = cs.events.find((e) => e.cue === "tear");
  assert.ok(cut && cut.t <= tear.t, "far off, the glaive comes up before the ground opens (B1)");
  assert.ok(cs.events.some((e) => e.move?.id === knight.id) && cs.events.some((e) => e.hide === knight.id), "then he leaves");
  const beat = EPISODE_24.beats.find((b) => b.type === "cutscene");
  assert.deepEqual(beat.set, { CLUE_B1: 1, SABLE_ENCOUNTER: 1, CINDERMAW_DOWN: 1 });
  assert.ok(EP24_SCRIPT.includes("<<cue enginePark>>"), "it's waiting up the field before it rolls");
  assert.ok(!/^\s*(Knight|Masked|\?\?\?):/m.test(EP24_SCRIPT), "he says nothing in Encounter I");
  assert.ok(play("Ep24_Ridge").text.includes("Their tears are pale. That one was black."), "Lio tells the two apart");
});

test("the rumor board: hidden until Encounter I, then every theory the camp tells you; named once the Crown names him", () => {
  const f = new FlagStore();
  assert.equal(rumorBoard(f).show, false);
  for (const [k, v] of Object.entries(EPISODE_24.beats.find((b) => b.type === "cutscene").set)) f.set(k, v);
  const camp = EPISODE_24.beats.find((b) => b.id === "camp");
  for (const id of camp.required) play(camp.cast.find((c) => c.id === id).node, f);
  const board = rumorBoard(f);
  assert.equal(board.title, "WHO IS THE MASKED KNIGHT?");
  assert.deepEqual(board.rumors.map((r) => r.theory), RUMOR_BOARD.rumors.slice(0, 4).map((r) => r.theory), "four theories, four people");
  assert.equal(board.seen.length, 1);
  f.set("SABLE_ENCOUNTER", 2);
  assert.equal(rumorBoard(f).title, "WHO IS THE MASKED KNIGHT?", "seen again, still nameless");
  f.set("SABLE_NAMED", 1);
  assert.equal(rumorBoard(f).title, "WHO IS THE SABLE KNIGHT?");
  const all = JSON.stringify(RUMOR_BOARD);
  assert.ok(!/\bcal\b|calder|lantern knight who died/i.test(all), "in-world, he's dead and mourned: nobody suggests it");
  assert.ok(!/demon/i.test(all), "nobody in Liraen knows that word yet");
});

test("the masked knight follows the Disguise Bible: full mask with slits, glaive, one left pauldron, a long high-collared cloak", () => {
  const L = LOOKS.masked, S = sheetFor("masked").outfit;
  assert.equal(L.head, "fullmask"); assert.equal(L.weapon, "glaive");
  assert.ok(S.pauldron && !S.pauldrons, "asymmetric: one pauldron only");
  assert.ok(S.cloak && S.cloakLength === "ankle" && S.cloakCollar);
  assert.ok(L.shoulders > 1.2, "padding makes him broader");
  assert.equal(L.scale, LOOKS.cal.scale, "same height, exactly (never shown side by side)");
  assert.ok(LOOKS.wraithe.riftwalk && LOOKS.wraithe.mask, "Wraithe: hidden inside his tears, mouth bound");
});

// ---- Leak prevention (GDD §15.11): his name stays in his own files; tears are never round ----
const files = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : p.endsWith(".js") ? [p] : []; });
const SRC = files(new URL("../src", import.meta.url).pathname);

test("leak test: only the knight's own files carry his name; everything else calls him 'masked'", () => {
  const named = SRC.filter((p) => /\bsable\b/i.test(readFileSync(p, "utf8"))).map((p) => p.split("/src/")[1]).sort();
  assert.deepEqual(named, ["core/playtest.js", "data/masked.js", "data/rumors.js", "data/story/ep24.js", "data/story/ep26.js"]);
  for (const p of SRC.filter((p) => /story\/(arc3|ep23)\.js$/.test(p))) assert.ok(!/\bsable\b|masked/i.test(readFileSync(p, "utf8")), p);
});

test("no tear is ever a circle: every outline is a ragged star with deep notches", () => {
  for (const seed of [1, 7, 24, 42, 99]) {
    const rs = tearOutline(1, 13, seed).map(([x, y]) => Math.hypot(x / 1.3, y / 0.72));
    assert.ok(Math.min(...rs) / Math.max(...rs) < 0.7, `seed ${seed}`);
  }
});
