import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { VARKA_TUNING, ENGINE_ABILITIES } from "../src/data/ashfall.js";
import { EPISODE_22 } from "../src/data/story/ep22.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const D = VARKA_TUNING.deck;
/** Varka at 60% with her engine made unbreakable (so it's still rolling when we look), the squad off the field unless asked. */
const atDeck = (companions = false) => {
  const w = new World({ seed: 5, companions }); w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  const b = w.spawnBoss("varka", 0, 6); w.drainEvents();
  run(w, 3);
  const e = b.boss.engine; e.combatant.health.max = e.combatant.health.current = 1e6;
  b.combatant.health.set(b.combatant.health.max * 0.6);
  const l = run(w, 2);
  return { w, b, e, c: b.boss, l };
};
/** Where a point on the deck (local x, z) is in the world right now. */
const deckAt = (w, lx, lz) => { const d = w.deck, c = Math.cos(d.yaw), s = Math.sin(d.yaw); return { x: d.x + lx * c + lz * s, z: d.z - lx * s + lz * c }; };
const still = (b) => { b.runner.interrupt(); b.combatant.stagger(99999); }; // (so her hammer doesn't throw the test off the deck)
const put = (f, p, y = 0) => { f.pos.x = f.prev.x = p.x; f.pos.z = f.prev.z = p.z; f.pos.y = f.prev.y = y; f.vel.x = f.vel.y = f.vel.z = 0; f.knock.x = f.knock.z = 0; };

test("P2: she vaults up onto the Ironsong's deck, a floor 1.5 up that's out of reach from the ground", () => {
  const { w, b, e, l } = atDeck();
  assert.ok(l.some((x) => x.type === "deckUp"));
  assert.ok(w.deck && w.deck.engine === e && w.deck.h === D.h);
  assert.equal(b.floor, D.h); assert.ok(Math.abs(b.pos.y - D.h) < 1e-6, "standing on it");
  // A slash from the ground, right under her: nothing.
  const p = w.player, hp = b.combatant.health.current;
  put(p, { x: b.pos.x, z: b.pos.z - 2.6 }); p.yaw = 0; p.combatant.invulnerableFrames = 0;
  w.press(Intent.Light);
  const l2 = run(w, 16);
  assert.ok(!l2.some((x) => x.type === "hit" && x.defender === b), "a blade from below doesn't reach the deck");
  assert.equal(b.combatant.health.current, hp);
});

test("Climb aboard two ways: the steps at the back, or a jump; and the hull keeps the ground out", () => {
  const { w, b } = atDeck(); still(b);
  const p = w.player;
  put(p, deckAt(w, 0, -D.hl - 0.6)); p.grounded = true;
  const l = run(w, 60);
  assert.ok(l.some((x) => x.type === "deckBoard" && x.ramp), "up the steps");
  assert.equal(p.floor, D.h); assert.ok(p.grounded && Math.abs(p.pos.y - D.h) < 1e-6, "and on the planks");
  // Off again, and a jump onto its side.
  p.floor = 0; put(p, deckAt(w, D.hw + 0.8, -1)); p.grounded = true;
  run(w, 2);
  const side = deckAt(w, D.hw - 0.6, -1);
  put(p, side, D.h + 0.2); p.grounded = false; p.vel.y = 1;
  const l2 = run(w, 40);
  assert.ok(l2.some((x) => x.type === "deckBoard" && !x.ramp), "jumped on");
  assert.equal(p.floor, D.h);
  // On the ground, inside its hull: pushed out to a side.
  p.floor = 0; put(p, deckAt(w, 0.3, 0.5)); p.grounded = true;
  run(w, 1);
  const d = w.deck, c = Math.cos(d.yaw), s = Math.sin(d.yaw), rx = p.pos.x - d.x, rz = p.pos.z - d.z, lx = rx * c - rz * s, lz = rx * s + rz * c;
  assert.ok(Math.abs(lx) >= D.hw || Math.abs(lz) >= D.hl, "nobody stands inside the engine");
});

test("Aboard, the deck carries you as it rolls (and turns, slowly, before it does)", () => {
  const { w, b, c } = atDeck(); still(b);
  const p = w.player;
  put(p, deckAt(w, 0.8, -2), D.h); p.floor = D.h; p.grounded = true;
  const lx0 = 0.8, lz0 = -2;
  c.rollTimer = 1;
  const l = run(w, VARKA_TUNING.rollWarn + D.rollFrames + 4);
  assert.ok(l.some((x) => x.type === "engineRoll") && l.some((x) => x.type === "engineStop"), "it rolled");
  assert.equal(p.floor, D.h, "still aboard");
  const d = w.deck, co = Math.cos(d.yaw), si = Math.sin(d.yaw), rx = p.pos.x - d.x, rz = p.pos.z - d.z;
  assert.ok(Math.hypot(rx * co - rz * si - lx0, rx * si + rz * co - lz0) < 0.3, "where you stood on the deck, wherever the deck went");
  // The ram is for those on the ground.
  assert.ok(!l.some((x) => x.type === "hit" && x.defender === p && x.ability?.id === "EngineRam"));
});

test("On the deck it's a fight: her blows land on you there, and her hammer's shock ring can throw you off (a hard landing unless you right yourself)", () => {
  const { w, b, c } = atDeck(); still(b);
  c.rollTimer = 99999;
  const p = w.player;
  put(p, deckAt(w, 0, -2.4), D.h); p.floor = D.h; p.grounded = true;
  // Your blade reaches her now.
  const hp = b.combatant.health.current;
  p.yaw = Math.atan2(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
  put(p, { x: b.pos.x - Math.sin(p.yaw) * 1.6, z: b.pos.z - Math.cos(p.yaw) * 1.6 }, D.h); p.floor = D.h; p.grounded = true;
  b.combatant.invulnerableFrames = 0;
  w.press(Intent.Light);
  run(w, 16);
  assert.ok(b.combatant.health.current < hp, "aboard, she's in reach");
  // Over the side, knocked: you fall to the ground, and land hard unless you jump or dash in the air.
  put(p, deckAt(w, D.hw - 0.1, -1), D.h); p.floor = D.h; p.grounded = true; p.knock.x = Math.cos(w.deck.yaw) * 6; p.knock.z = -Math.sin(w.deck.yaw) * 6;
  const l = run(w, 50);
  const off = l.find((x) => x.type === "deckOff");
  assert.ok(off && off.knocked, "thrown off");
  assert.equal(p.floor, 0);
  assert.ok(l.some((x) => x.type === "hardLanding" && x.fighter === p), "and it's a long way down");
  // Her shock ring rolls along the deck, not the ground.
  const wave = w.addWave(b, b.pos.x, b.pos.z, { spec: VARKA_TUNING.shock, ability: null, kind: "shock" });
  assert.equal(wave.y, D.h);
});

test("Shots from below glance off the deck's rail; hers from the deck reach down", () => {
  const { w, b, e, c } = atDeck(); still(b);
  c.rollTimer = 99999;
  const p = w.player;
  put(p, deckAt(w, 0.4, -2.6), D.h); p.floor = D.h; p.grounded = true;
  // A bolt from the ground (the engine's own turret, aimed up at you): the rail turns it.
  e.target = p; p.combatant.invulnerableFrames = 0; // (turning the engine would turn the deck you're on: it aims without)
  const hp = p.combatant.health.current;
  w.fireProjectile(e, ENGINE_ABILITIES.Volley, "Bolt", 14);
  const l = run(w, 40);
  assert.ok(l.some((x) => x.type === "railTurn" && x.defender === p), "the rail turns it");
  assert.equal(p.combatant.health.current, hp);
  // Her fan tilts down at you on the ground.
  p.floor = 0; put(p, { x: b.pos.x + 7, z: b.pos.z }); p.grounded = true;
  b.target = p; w.fireFan(b, { id: "ArcLance", hit: null }, "Arc", 16, 3, 0.2);
  const shots = w.projectiles.filter((q) => q.owner === b);
  assert.ok(shots.length === 3 && shots.every((q) => q.dir.y < 0), "aimed down off the deck");
});

test("Break the engine from below (the squad goes for it) and she comes down with it, reeling", () => {
  const { w, b, e } = atDeck(["bas", "brannoc"]);
  for (const m of w.companions) assert.notEqual(w._companionTarget(m), b, "the squad can't reach her up there: it goes for the engine");
  e.combatant.health.set(0);
  const l = run(w, 3);
  assert.ok(l.some((x) => x.type === "deckBroken"));
  assert.equal(w.deck, null); assert.equal(b.floor, 0);
  assert.ok(b.combatant.isStaggered, "reeling");
  run(w, 40);
  assert.ok(b.pos.y < 0.01, "on the ground");
});

test("P3: the deck goes up in three burning sections that come down across the field; whoever was aboard comes down with them", () => {
  const { w, b } = atDeck();
  const p = w.player;
  put(p, deckAt(w, 0, -2.4), D.h); p.floor = D.h; p.grounded = true;
  b.combatant.health.set(b.combatant.health.max * 0.3);
  const l = run(w, 3);
  const sec = l.find((x) => x.type === "deckSections");
  assert.ok(sec && sec.sections.length === 3 && sec.thrown.includes(p), "three sections, and you with them");
  assert.ok(l.some((x) => x.type === "engineBreaks"));
  assert.equal(w.deck, null); assert.equal(p.floor, 0);
  assert.ok(p.dropLanding > 0 && !p.grounded, "jump or dash before you land");
  assert.ok(sec.sections.every((s) => s.kind === "debris" && s.r === D.sectionRadius));
  const l2 = run(w, D.sectionDelay + 40);
  assert.ok(l2.filter((x) => x.type === "strike" && x.strike.r === D.sectionRadius).length === 3, "each one lands");
});

test("A retry starts on the ground; Ep 22 tells you; the deck and its steps are drawn", () => {
  const { w } = atDeck();
  w.player.floor = D.h;
  w.resetPlayer();
  assert.equal(w.deck, null); assert.equal(w.player.floor, 0);
  const beat = EPISODE_22.beats.find((x) => x.id === "boss");
  assert.match(beat.eventHints.deckUp, /Jump on|steps/);
  assert.match(beat.eventHints.engineBreaks, /Jump or dash/);
  const main = src("main.js");
  for (const ev of ["deckUp", "deckBoard", "deckOff", "deckBroken", "deckSections", "railTurn"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
  assert.match(src("runtime/objects.js"), /the steps at the back/);
  assert.match(src("runtime/rig.js"), /this\.shadow\.position\.set\(x, floor \+ 0\.03, z\)/);
});
