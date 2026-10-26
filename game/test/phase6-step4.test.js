import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { EPISODE_24 } from "../src/data/story/ep24.js";
import { EPISODE_25, EP25_SCRIPT } from "../src/data/story/ep25.js";
import { EPISODE_26, EP26_SCRIPT } from "../src/data/story/ep26.js";
import { AFTER_EP24, AFTER_EP25, AFTER_EP26 } from "../src/data/story/arc3.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST, speakerName } from "../src/data/story/cast.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore, compileExpr, truthy } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { ZONES, VAULT_LAYOUT } from "../src/data/zones.js";
import { MASKED_ABILITIES, MASKED_TUNING, MASKED_STATS, MASK_INTEGRITY, maskIntegrity, maskedLabel, MASKED_BOUNTY } from "../src/data/masked.js";
import { BAS_STATS } from "../src/data/companions.js";
import { ROOK_ABILITIES } from "../src/data/rook.js";
import { rumorBoard } from "../src/data/rumors.js";
import { found, investigationScore } from "../src/core/clues.js";
import { LOOKS } from "../src/runtime/rig.js";
import { constrain } from "../src/sim/bounds.js";

const nodes = { ...parseScript(WORLD_SCRIPT, "w"), ...parseScript(EP25_SCRIPT, "e25"), ...parseScript(EP26_SCRIPT, "e26") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, { name: "Rook" }).start(node), lines = [], cmds = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") lines.push(s); if (s.type === "options") r.choose(pick); if (s.type === "command") cmds.push(s.text ?? s.command ?? "");
  }
  return { f, lines, cmds, text: lines.map((l) => l.text).join(" ") };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const tough = (w) => { w.player.combatant.health.max = w.player.combatant.health.current = 1e6; };
const knight = (seed = 3, opts = {}) => { const w = new World({ seed, ...opts }); w.drainEvents(); tough(w); w.spawnWave(["masked"]); w.drainEvents(); return { w, b: w.boss }; };
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

test("Eps 25–26 are whole episodes chained from Ep 24, each starting from the menu with what came before", () => {
  for (const ep of [EPISODE_25, EPISODE_26]) {
    validateEpisode(ep);
    assert.equal(ep.unlockAt, 5);
    for (const b of ep.beats) for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node);
    for (const b of ep.beats) if (b.node) assert.ok(nodes[b.node], b.node);
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([next(EPISODE_24), next(EPISODE_25)], ["ep25", "ep26"]);
  assert.deepEqual(EPISODE_25.setup, { ...AFTER_EP24 }); assert.deepEqual(EPISODE_26.setup, { ...AFTER_EP25 });
  assert.equal(AFTER_EP26.SABLE_ENCOUNTER, 2); assert.equal(AFTER_EP26.BAS_ARM_BROKEN, 1);
  validateCutscene(CUTSCENES.ep26_arm);
  assert.ok(EPISODE_26.beats.some((b) => b.type === "fight" && b.wave.includes("masked") && b.stage === "vault"));
});

test("What Lio Knew: the Choir comes for him, he tells the squad everything, and Rook decides: stay, or go for now", () => {
  const c = play("Ep25_Confession");
  assert.equal(c.f.get("LIO_SECRET"), 1);
  assert.ok(/palimpsest/i.test(c.text) && /two letters/i.test(c.text) && /never sent the third/i.test(c.text));
  const stay = new FlagStore({ BOND_LIO: 20 }); play("Ep25_Decide", stay, 0);
  assert.equal(stay.get("LIO_STATUS"), 2); assert.equal(stay.get("BOND_LIO"), 30);
  const go = new FlagStore(); play("Ep25_Decide", go, 1);
  assert.equal(go.get("LIO_STATUS"), 1);
  // Free roam follows the choice: sent away, he's in the Hall's archive; forgiven, he's home.
  const here = (zone, flags) => ZONES[zone].cast.filter((x) => x.id === "lio" && (!x.when || truthy(compileExpr(x.when)(flags)))).length;
  assert.deepEqual([here("lighthouse", go), here("hall", go)], [0, 1]);
  assert.deepEqual([here("lighthouse", stay), here("hall", stay)], [1, 0]);
  assert.ok(nodes.W_LioHall && /under your page/.test(play("W_LioHall").text));
  const sides = EPISODE_25.beats.find((b) => b.id === "sides");
  assert.deepEqual(sides.required, ["juno", "bas", "tamsin", "dagrun"]);
  assert.ok(!/\bsable\b/i.test(readFileSync(new URL("../src/data/story/ep25.js", import.meta.url), "utf8")), "nobody has a name for him yet");
});

test("the vault: posts to walk, and the cast follows Lio's choice", () => {
  const watch = EPISODE_26.beats.find((b) => b.id === "watch");
  assert.deepEqual(watch.required, ["hale", "archivist", "bas"]);
  assert.equal(watch.cast.find((c) => c.id === "lio").when, "$LIO_STATUS == 2", "only if he stayed");
  const stayed = play("Ep26_Descent", new FlagStore({ LIO_STATUS: 2 })).text, left = play("Ep26_Descent", new FlagStore({ LIO_STATUS: 1 })).text;
  assert.ok(/keep something in/.test(stayed) && !/keep something in/.test(left) && /Lio would know/.test(left));
  for (const c of watch.cast) assert.ok(Math.hypot(c.x, c.z) < 16.5, `${c.id} stands inside the room's floor`);
  assert.deepEqual([...VAULT_LAYOUT.mouths].sort(), [0.25, 0.75, 1.25, 1.75].map((k) => k * Math.PI).sort(), "four corridors, on the diagonals");
});

test("Encounter II: he steps out of the wall, his head tilts when Rook speaks to him, and his first words come through the mask", () => {
  const f = new FlagStore({ SABLE_ENCOUNTER: 1 }), r = play("Ep26_Arrival", f);
  assert.equal(f.get("SABLE_ENCOUNTER"), 2); assert.equal(f.get("VAULT_BREACHED"), 1); assert.equal(f.get("CLUE_B3"), 1);
  const said = r.lines.filter((l) => l.speaker === "Masked").map((l) => l.text);
  assert.deepEqual(said, ["Stand aside.", "It will."], "few words, formal, clipped");
  assert.ok(!r.text.includes("CLUE"), "nothing on screen points at a clue");
  assert.equal(CAST.Masked.voice, "mask");
  assert.deepEqual([maskedLabel(new FlagStore()), maskedLabel(f), maskedLabel(new FlagStore({ SABLE_ENCOUNTER: 2, SABLE_NAMED: 1 }))], ["???", "Masked Knight", "The Sable Knight"]);
  assert.equal(speakerName("Masked", "Rook", f), "Masked Knight");
  for (let i = 1; i < MASK_INTEGRITY.length; i++) assert.ok(MASK_INTEGRITY[i] <= MASK_INTEGRITY[i - 1]);
  assert.ok(maskIntegrity(2) < maskIntegrity(1) && maskIntegrity(6) === 0.6, "a little lighter each time (B7)");
  assert.equal(LOOKS.masked.listenTilt, LOOKS.cal.listenTilt, "two people who listen the same way (never shown side by side)");
});

test("Sever: into a black tear, out of another at his target's left; untouchable between; the tear he leaves stays open and he's exposed", () => {
  const { w, b } = knight(4);
  w.player.pos.x = w.player.prev.x = 0; w.player.pos.z = w.player.prev.z = 0; w.player.yaw = w.player.prevYaw = 0;
  b.controller.startDirect(MASKED_ABILITIES.Sever, w.frame);
  const log = []; let hidden = 0;
  for (let i = 0; i < 30; i++) { w.step(); log.push(...w.drainEvents().map((e) => ({ ...e, i }))); if (b.submerged) { hidden++; assert.ok(b.boss.untouchable); } }
  const tear = (role) => log.find((e) => e.type === "severOpen" && e.role === role);
  assert.ok(tear("out") && tear("mark") && tear("in"));
  assert.ok(tear("in").i - tear("mark").i >= 10, "the second tear is the warning");
  assert.ok(hidden >= 10);
  assert.ok(b.pos.x < -0.8 && Math.abs(b.pos.z) < 1.2, "out at Rook's left");
  assert.ok(log.some((e) => e.type === "severExposed"));
  assert.ok(b.boss.damageFactor > 1 && b.boss.postureFactor > 1, "exposed while the seam's open");
  run(w, MASKED_TUNING.exposed + 2);
  assert.equal(b.boss.damageFactor, 1, "then it closes");
});

test("he steps aside from your swings: left, left, then back, always in that order (B2)", () => {
  const { w, b } = knight(6);
  b.brain.aggroRange = 0; // he only reacts; no attacks of his own
  const seq = [];
  for (let n = 0; n < 6; n++) {
    w.player.pos.x = w.player.prev.x = b.pos.x; w.player.pos.z = w.player.prev.z = b.pos.z - 2; w.player.yaw = w.player.prevYaw = 0;
    b.runner.interrupt(); b.boss.evade.cooldown = 0;
    w.player.controller.startDirect(ROOK_ABILITIES.L1, w.frame);
    for (let i = 0; i < 4; i++) { w.step(); w.drainEvents(); const id = b.runner.current?.id; if (id === "Slip" || id === "Withdraw") { seq.push(id); break; } }
    run(w, 30);
  }
  assert.deepEqual(seq, ["Slip", "Slip", "Withdraw", "Slip", "Slip", "Withdraw"]);
  assert.ok(MASKED_ABILITIES.Slip.events.some((e) => e.key === "left"), "to his left");
  assert.ok(!MASKED_ABILITIES.Lunge.events.slice(0, 2).every((e) => (e.value ?? 0) >= 0), "every thrust starts from a backstep");
});

test("the Undercut: a black tear under you drops you out of the sky; land hard, unless you jump or dash in the air first", () => {
  const { w, b } = knight(7);
  b.brain.aggroRange = 0; // only the floor this time
  const fall = (recover) => {
    const p = w.player; p.pos.x = p.prev.x = 0; p.pos.z = p.prev.z = -6;
    b.boss.onCustom("undercut");
    const warn = w.drainEvents().find((e) => e.type === "strikeWarn");
    assert.ok(warn && warn.strike.kind === "sever" && warn.strike.lift === MASKED_TUNING.dropHeight);
    const log = run(w, MASKED_TUNING.undercutDelay + 1);
    assert.ok(log.some((e) => e.type === "riftDrop" && e.fighter === p && e.kind === "sever"));
    if (recover) p.airJumps = 0; // an air jump on the way down
    const hp = p.combatant.health.current;
    const after = run(w, 120);
    return { hard: after.some((e) => e.type === "hardLanding" && e.fighter === p), ok: after.some((e) => e.type === "airRecover" && e.fighter === p), lost: hp - p.combatant.health.current };
  };
  const a = fall(false);
  assert.ok(a.hard && a.lost >= MASKED_TUNING.hardLanding - 0.01);
  const c = fall(true);
  assert.ok(c.ok && !c.hard && c.lost < 1);
  w.player.combatant.health.current = 5; w.player.dropLanding = MASKED_TUNING.hardLanding; w.player.pos.y = 3; w.player.grounded = false; w.player.airJumps = 1; w.player.airDashes = 1;
  run(w, 60);
  assert.ok(w.player.alive && w.player.combatant.health.current >= 1, "a hard landing never takes the last of your health");
});

test("P3: every way out loops back in; P4: the Sever Line cuts the room in two, then closes; at 25% he leaves with it", () => {
  const { w, b } = knight(8, { companions: ["bas", "juno"] });
  b.combatant.takeDamage(MASKED_STATS.maxHealth * 0.52);
  const mouths = run(w, 3).find((e) => e.type === "severMouths");
  assert.equal(mouths?.mouths.length, 4);
  const m = mouths.mouths[0], p = w.player;
  p.pos.x = p.prev.x = m.x; p.pos.z = p.prev.z = m.z;
  const loop = run(w, 2).find((e) => e.type === "severLoop" && e.fighter === p);
  assert.ok(loop && flat(p.pos, { x: -m.x, z: -m.z }) < 3, "out of the opposite mouth");
  // P4: the line.
  p.pos.x = p.prev.x = 0; p.pos.z = p.prev.z = -2;
  const bas = w.companions[0]; bas.pos.x = bas.prev.x = 0; bas.pos.z = bas.prev.z = -8;
  b.combatant.takeDamage(MASKED_STATS.maxHealth * 0.17);
  const line = run(w, 120).find((e) => e.type === "severLine");
  assert.ok(line, "the hidden move comes as soon as he's free");
  const n = { x: -line.dir.z, z: line.dir.x }, side = (q) => (q.x - line.mid.x) * n.x + (q.z - line.mid.z) * n.z;
  let probes = 0;
  for (const s0 of [-8, -5, -2, 0, 3, 6, 9]) { // walk into it anywhere along its length inside the room: you stay on your own side
    const q0 = { x: line.mid.x + line.dir.x * s0 + n.x * 0.15, z: line.mid.z + line.dir.z * s0 + n.z * 0.15 };
    if (Math.hypot(q0.x, q0.z) > 14) continue;
    assert.ok(side(constrain({ ...q0 }, 0.45, w.bounds)) > 0.7, "nobody crosses the line"); probes++;
  }
  assert.ok(probes >= 3);
  const later = run(w, MASKED_TUNING.line.frames + 10);
  assert.ok(!b.boss.line, "it closes (or went with him)");
  // 25%: he leaves. Nobody finishes him. (The squad may have got him there already.)
  if (!b.boss.left) { b.combatant.takeDamage(1e6); assert.ok(b.combatant.health.current > 0, "nobody finishes him"); later.push(...run(w, 4)); }
  assert.ok(later.some((e) => e.type === "severLeave") && b.vanished);
  assert.ok([...later, ...run(w, 200)].some((e) => e.type === "waveClear"), "and the fight is won");
});

test("he breaks Bas's arm: Bas fights one-armed after the vault, in a sling", () => {
  const cut = EPISODE_26.beats.find((b) => b.type === "cutscene");
  assert.equal(cut.set.BAS_ARM_BROKEN, 1); assert.equal(cut.set.VAULT_TAKEN, 1);
  const hurt = new World({ seed: 2, companions: ["bas", "juno"], injured: ["bas"] }), well = new World({ seed: 2, companions: ["bas", "juno"] });
  const bh = hurt.companions.find((c) => c.kind === "bas"), bw = well.companions.find((c) => c.kind === "bas");
  assert.ok(bh.injured && bh.look === "basSling" && !bw.injured);
  assert.ok(bh.stats.maxHealth < BAS_STATS.maxHealth && bh.stats.runSpeed < BAS_STATS.runSpeed);
  assert.ok(!bh.brain.options.some((o) => o.ability.id === "BoulderFist"), "no weight behind a punch");
  assert.ok(LOOKS.basSling.sling);
  const roam = (flags) => ZONES.lighthouse.cast.filter((x) => x.id === "bas" && (!x.when || truthy(compileExpr(x.when)(flags))));
  assert.deepEqual(roam(new FlagStore({ BAS_ARM_BROKEN: 1 })).map((x) => x.look), ["basSling"]);
  assert.deepEqual(roam(new FlagStore()).map((x) => x.look), ["bas"]);
  assert.ok(/six weeks/.test(play("W_Bas", new FlagStore({ BAS_ARM_BROKEN: 1 })).text));
});

test("the Crown names him: posters in Aurelin, a fifth theory, and the board's new title", () => {
  const f = new FlagStore({ ...AFTER_EP25 });
  play("Ep26_Arrival", f);
  for (const b of EPISODE_26.beats) for (const [k, v] of Object.entries(b.set ?? {})) f.set(k, v);
  play("Ep26_Posters", f);
  const board = rumorBoard(f);
  assert.equal(board.title, "WHO IS THE SABLE KNIGHT?");
  assert.equal(board.seen.length, 3);
  assert.ok(board.rumors.some((r) => r.theory === "One of the Crown's own"));
  assert.equal(MASKED_BOUNTY.name, "THE SABLE KNIGHT");
  assert.ok(found(f, "B2") && found(f, "B3") && investigationScore(f) >= 3);
});

test("leak test: the vault's files never name anyone else, and nothing shared names him", () => {
  const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
  for (const p of ["data/story/ep26.js", "data/masked.js", "sim/masked.js"]) assert.ok(!/\bcal\b|calder|CAL_[A-Z]|\bdemons?\b/i.test(src(p)), p);
  for (const p of ["sim/masked.js", "sim/world.js", "main.js", "runtime/sets.js", "runtime/story.js", "data/story/cast.js", "data/story/cutscenes.js", "data/story/arc3.js", "data/story/world.js"])
    assert.ok(!/\bsable\b/i.test(src(p)), `${p} calls him "masked"`);
});

test("every line in every script is spoken by someone in the cast (a colon in narration would make up a speaker)", async () => {
  const { readdirSync } = await import("node:fs");
  const dir = new URL("../src/data/story/", import.meta.url);
  const walk = (items, where, bad) => {
    for (const it of items ?? []) {
      if (it.type === "line" && it.speaker && it.speaker !== "Rook" && !CAST[it.speaker]) bad.push(`${where}: "${it.speaker}"`);
      walk(it.body, where, bad); walk(it.otherwise, where, bad);
      for (const x of [...(it.items ?? []), ...(it.branches ?? [])]) walk(x.body, where, bad);
    }
    return bad;
  };
  const bad = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".js"))) {
    const mod = await import(new URL(f, dir));
    for (const [k, v] of Object.entries(mod)) if (typeof v === "string" && v.includes("title:")) for (const [id, n] of Object.entries(parseScript(v, k))) walk(n.body, `${f} ${id}`, bad);
  }
  assert.deepEqual(bad, []);
});
