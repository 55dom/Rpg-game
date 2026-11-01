import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { hitSpec } from "../src/core/combat.js";
import { REACTIONS, SECTION_7_2 } from "../src/data/reactions.js";
import { GULLMAW_TUNING } from "../src/data/bosses2.js";
import { TAMSIN_COMPANION } from "../src/data/companions.js";
import { EPISODE_4_STORY } from "../src/data/story/ep4.js";
import { EPISODE_12 } from "../src/data/story/ep12.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const S72 = GDD.slice(GDD.indexOf("### 7.2 Tags & Reactions"), GDD.indexOf("### 7.3"));
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const until = (w, pred, max, log = []) => { for (let i = 0; i < max; i++) { if (pred()) return log; w.step(); log.push(...w.drainEvents()); } assert.fail("condition never held"); };
const row = (id) => REACTIONS.find((r) => r.id === id);
/** A quiet yard: Rook, and hounds where asked (they don't swing: staggered for ever). */
const yard = (spots, o = {}) => {
  const w = new World({ seed: 9, ...o }); w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  const hs = spots.map(([x, z]) => { const e = w.spawnEnemy("hound", x, z); e.combatant.health.max = e.combatant.health.current = 500; e.combatant.stagger(99999); return e; });
  w.drainEvents();
  return { w, p: w.player, hs };
};
/** A blow from Rook carrying these ability tags (and these tags put on). */
const blow = (w, def, tags, applyTags = []) => {
  const hb = { spec: hitSpec({ damage: 1, posture: 0, hitstop: 0, hitstun: 4, applyTags }), ability: { id: "Test", tags }, origin: { ...w.player.pos }, hitSet: new Set() };
  def.combatant.invulnerableFrames = 0;
  w._resolve(w.player, def, hb);
  return w.drainEvents();
};
const fired = (l, id) => l.find((e) => e.type === "reaction" && e.reaction.id === id);

test("The table holds §7.2's twelve, each under its own name, plus the squad's own", () => {
  for (const name of ["Conduction", "Flash Freeze", "Firestorm", "Wildfire", "Flashpoint", "Meteor", "Crush", "Railgun", "Shatter Chorus", "Detonate", "Rude Awakening", "Corrode"]) {
    assert.ok(S72.includes(`**${name}**`), `§7.2 still names ${name}`);
    assert.ok(REACTIONS.some((r) => r.name === name), `and the table has it: ${name}`);
  }
  assert.equal(SECTION_7_2.length, 12);
  for (const id of SECTION_7_2) assert.ok(row(id), id);
  for (const id of ["TautLine", "Slingshot", "Shatterstone", "Dispel"]) assert.ok(row(id), `the squad's own: ${id}`);
});

test("Conduction: lightning jumps to every WET thing in reach, whichever side it's on, and leaves the dry alone", () => {
  const { w, p, hs: [a, b, far, dry] } = yard([[0, 3], [2, 4], [20, 4], [-2, 4]]);
  for (const e of [a, b, far]) e.tags.add("WET", 300);
  p.tags.add("WET", 300); p.combatant.invulnerableFrames = 0;
  const hp = p.combatant.health.current;
  const got = w.applyTag(a, "CHARGED", 120, p);
  assert.deepEqual(got.map((r) => r.id), ["Conduction"]);
  const ev = fired(w.drainEvents(), "Conduction");
  assert.ok(ev.targets.includes(b) && ev.targets.includes(p), "the wet one beside it, and you, standing wet in reach");
  assert.ok(!ev.targets.includes(far) && !ev.targets.includes(dry));
  assert.ok(p.combatant.health.current < hp, "it doesn't care whose side you're on");
});

test("Firestorm: a gust through something burning carries the fire on down the wind, not to the side", () => {
  const { w, hs: [a, behind, side] } = yard([[0, 3], [0, 7], [4, 3]]);
  a.tags.add("SCORCHED", 120);
  const hp = behind.combatant.health.current;
  const ev = fired(blow(w, a, ["gust"]), "Firestorm");
  assert.ok(ev && ev.targets.includes(behind) && !ev.targets.includes(side));
  assert.ok(behind.tags.has("SCORCHED") && !side.tags.has("SCORCHED") && behind.combatant.health.current < hp);
  assert.ok(a.tags.has("SCORCHED"), "it keeps burning");
});

test("Wildfire, Meteor, Crush: burnt out of its root; a WEIGHTED thing in the air comes down like a stone; WEIGHTED and BOUND, crushed", () => {
  const { w, p, hs: [r, m, near, c] } = yard([[0, 4], [4, 4], [5, 4.5], [-4, 4]]);
  r.tags.add("ROOTED", 999);
  w.applyTag(r, "SCORCHED", 60, p);
  assert.ok(!r.tags.has("ROOTED") && r.tags.remaining("SCORCHED") > 300, "Wildfire: a long burn, and no root left");
  m.tags.add("WEIGHTED", 200); m.grounded = false; m.pos.y = 2; m.vel.y = 3;
  const hp = near.combatant.health.current;
  const ev = fired(blow(w, m, ["light"]), "Meteor");
  assert.ok(ev && m.vel.y < -10, "driven down"); assert.ok(near.combatant.health.current < hp, "and the ground jumps under the rest");
  c.tags.add("WEIGHTED", 200);
  blow(w, c, ["thread"], [["BOUND", 60]]);
  assert.ok(c.combatant.postureBroken, "Crush: guard and all");
  // Not traps for you: Meteor and Crush only ever land on your enemies.
  p.tags.add("WEIGHTED", 200); p.tags.add("BOUND", 200);
  assert.equal(w.applyTag(p, "WEIGHTED", 60).length, 0);
  assert.ok(!p.combatant.postureBroken);
});

test("Shatter Chorus, Flash Freeze and Shatter, Flashpoint, Railgun, Rude Awakening, Corrode: each does what §7.2 says", () => {
  const { w, p, hs: [g, gn, f, ash, ashN, rail, dz, arm] } = yard([[0, 4], [2, 4.5], [8, 4], [-8, 4], [-9, 5], [0, 9], [6, 9], [-6, 9]]);
  g.magic = "glass"; g.tags.add("RESONANT", 200);
  const hp = gn.combatant.health.current;
  assert.ok(fired(blow(w, g, ["light"]), "ShatterChorus"), "a ringing glass thing, struck: it shatters"); assert.ok(gn.combatant.health.current < hp, "and the shards fly");
  f.tags.add("WET", 200); w.applyTag(f, "CHILLED", 60, p);
  assert.ok(f.tags.has("FROZEN") && f.combatant.isStaggered, "frozen solid");
  assert.ok(fired(blow(w, f, ["heavy"]), "Shatter"), "and the next heavy blow shatters it");
  ash.tags.add("ASH", 200); const ah = ashN.combatant.health.current;
  assert.ok(fired(blow(w, ash, ["light"], [["SCORCHED", 30]]), "Flashpoint") && ashN.combatant.health.current < ah, "an ash cloud, and a spark");
  rail.tags.add("CHARGED", 200); w.player.pos.x = 0; w.player.pos.z = 0;
  blow(w, rail, ["light"], [["POLARIZED", 30]]);
  assert.ok(rail.knock.z > 10, "fired down the magnet line (away from you)");
  dz.tags.add("DROWSY", 200); assert.ok(fired(blow(w, dz, ["light"]), "RudeAwakening") && !dz.tags.has("DROWSY"));
  arm.traits = { ...arm.traits, heavy: true }; arm.tags.add("ROTTING", 200);
  blow(w, arm, ["light"]); assert.ok(Math.abs(arm.corroded - 0.15) < 1e-9, "the armour goes soft");
  const a0 = arm.combatant.health.current;
  blow(w, arm, ["light"]);
  assert.ok(Math.abs(a0 - arm.combatant.health.current - 1.15) < 0.01, "and stays soft: every blow lands harder for the fight");
});

test("Ep 4 reaches them: Hask's mud weighs its own hounds (no harm done), it's ROOTED going under, and the fire flushes it out as Wildfire", () => {
  const w = new World({ seed: 7 }); w.spawnWave(["hask"]); w.drainEvents();
  const h = w.boss, c = h.boss; run(w, 1);
  const hound = w.spawnEnemy("hound", h.pos.x, h.pos.z - 3); hound.combatant.stagger(99999); const hp = hound.combatant.health.current;
  h.yaw = Math.PI; c._mudWaves({ pos: { x: h.pos.x, z: h.pos.z - 10 } });
  run(w, 30);
  assert.ok(hound.tags.has("WEIGHTED") && hound.combatant.health.current === hp, "WEIGHTED, unhurt: ready for Juno's thread (Crush) or the air (Meteor)");
  c.timer = 1;
  until(w, () => c.state === "diving", 300);
  assert.ok(h.tags.has("ROOTED"), "down in its reeds, roots and all");
  c.diveBed.lantern.combatant.health.set(0);
  const l = run(w, 2);
  assert.ok(fired(l, "Wildfire") && l.some((e) => e.type === "flushed"));
  assert.ok(!h.tags.has("ROOTED"));
  const b = EPISODE_4_STORY.beats.find((x) => x.id === "hask");
  assert.match(b.eventHints.reedsBurn, /FIRESTORM/); assert.match(b.eventHints.summon, /CRUSH/);
});

test("Ep 15: Tamsin's notes ring on in what they hit (RESONANT): a reflection struck then is a Shatter Chorus", () => {
  assert.deepEqual([...TAMSIN_COMPANION.hitboxes.Note.hit.applyTags.map(([t]) => t)], ["RESONANT"]);
  const w = new World({ seed: 9 }); w.drainEvents();
  assert.ok(w._states({ kind: "twinEchoMirror", grounded: true, tags: new Map(), traits: {} }).includes("glass"), "a reflection is glass");
  assert.ok(!w._states({ kind: "twinMirror", magic: "glass", glassBroken: 50, grounded: true, tags: new Map(), traits: {} }).includes("glass"), "cracked glass isn't");
});

test("Ep 12, §16 B5's weakness: the cistern's arc-lamps. Knock one down near it and the water conducts; Storm is what it's weak to", () => {
  const w = new World({ seed: 11, companions: false }); w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  const g = w.spawnBoss("gullmaw", 0, 6); w.drainEvents(); run(w, 2);
  const c = g.boss, lamps = w.fighters.filter((f) => f.kind === "arcLamp");
  assert.equal(lamps.length, 3); assert.ok(lamps.every((l) => l.traits.prop), "the squad leaves them to you, like Hask's lanterns");
  assert.ok(g.tags.has("WET"), "always wet");
  // Lure it next to a lamp, stand dry and clear, and bring the lamp down.
  const L = lamps[0]; g.runner.interrupt(); g.combatant.stagger(5);
  g.pos.x = g.prev.x = L.pos.x + 1.5; g.pos.z = g.prev.z = L.pos.z; g.pos.y = 0;
  w.player.pos.x = w.player.prev.x = L.pos.x - 8; w.player.pos.z = w.player.prev.z = L.pos.z;
  const hp = g.combatant.health.current;
  L.combatant.health.set(0);
  const l = run(w, 2);
  const fall = l.find((e) => e.type === "lampFall");
  assert.ok(fall && fall.conducted);
  assert.ok(fired(l, "Conduction") && l.some((e) => e.type === "weakness" && e.fighter === g), "it reels: Storm is its weakness");
  assert.ok(g.combatant.isStaggered && hp - g.combatant.health.current >= 40);
  // Wet, and too close: you conduct too. Its jet and splash soak you.
  assert.deepEqual(GULLMAW_TUNING.jet.applyTags.map(([t]) => t), ["WET"]);
  assert.ok(GULLMAW_TUNING.splash.applyTags.some(([t]) => t === "WET"));
  const L2 = lamps[1]; w.player.tags.add("WET", 300); w.player.combatant.invulnerableFrames = 0;
  w.player.pos.x = w.player.prev.x = L2.pos.x + 1; w.player.pos.z = w.player.prev.z = L2.pos.z;
  const ph = w.player.combatant.health.current;
  L2.combatant.health.set(0); const l2 = run(w, 12); // (it was still caught in the first shock's hitstop for a few frames)
  assert.ok(fired(l2, "Conduction") && w.player.combatant.health.current < ph, "be dry when a lamp goes");
  // When it falls, its lamps go with it.
  g.combatant.health.set(0); run(w, 3);
  assert.ok(w.fighters.filter((f) => f.kind === "arcLamp").every((f) => !f.alive));
  const beat = EPISODE_12.beats.find((x) => x.id === "gullmaw");
  assert.match(beat.eventHints.arcLamps, /knock it down/); assert.match(beat.eventHints.weakness, /Storm/);
});

test("Drawn: each reaction its own colour, the lightning jumping between the wet, the lamp and its fall", () => {
  const main = src("main.js");
  assert.match(main, /const REACTION_LOOK = Object\.freeze\(\{/);
  for (const ev of ["lampFall", "arcLamps", "weakness"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
  assert.match(main, /rx\.effect\.chain \|\| rx\.effect\.spread\)\) vfx\.thread/);
  assert.match(src("runtime/objects.js"), /case "arcLamp"/); assert.match(src("runtime/rig.js"), /arcLamp: \{ form: "object"/);
});
