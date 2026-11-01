import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World, Tuning } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { GALEN_PHASES, GALEN_STATS, GALEN_TUNING } from "../src/data/bosses2.js";
import { ZONES } from "../src/data/zones.js";
import { constrain } from "../src/sim/bounds.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const galen = () => {
  const w = new World({ seed: 7, companions: ["bas"] }); w.drainEvents();
  const b = w.spawnBoss("galen", 0, 6); b.brain.aggroRange = 0; w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1000;
  return { w, b };
};
const setHp = (b, frac) => b.combatant.health.set(b.combatant.health.max * frac);
const C = GALEN_TUNING.collapse;
const onSlab = (w, f) => w.islands.some((s) => Math.hypot(f.pos.x - s.x, f.pos.z - s.z) <= s.r + 0.01);

test("Galen has the GDD's five beats: the knight, rot, the floor gives way, the Oath, the last charge", () => {
  assert.deepEqual(GALEN_PHASES.map((p) => p.phase), [1, 2, 3, 4, 5]);
  assert.ok(GALEN_PHASES[2].collapse && GALEN_PHASES[3].seals === 3 && GALEN_PHASES[4].desperate);
  assert.deepEqual(GALEN_STATS.phaseMarks, GALEN_PHASES.slice(0, -1).map((p) => p.above), "the bar's marks are the phase lines");
  assert.match(src("main.js"), /galen: \{ 2: \["ROT"[^}]*3: \["THE FLOOR GIVES WAY"[^}]*4: \["THE OATH"[^}]*5: \["DESPERATION"/);
});

test("P3: he brings the Tower's floor down. Everyone falls with it; a jump or a dash in the air is the catch, or you land hard", () => {
  for (const recover of [false, true]) {
    const { w, b } = galen();
    setHp(b, 0.6); run(w, 2);
    setHp(b, 0.45); const l = run(w, 1);
    const c = l.find((e) => e.type === "collapse");
    assert.ok(c, "the floor gives way");
    assert.equal(c.islands.length, 4, "one broad slab and three chunks");
    assert.deepEqual(w.islands, c.islands);
    for (const f of w.fighters.filter((x) => x.alive && !x.traits.object)) {
      assert.ok(f.pos.y > C.height - 0.1, `${f.kind} falls with it`);
      assert.ok(onSlab(w, f), `${f.kind} comes down on the debris`);
    }
    assert.equal(w.player.dropLanding, C.landing);
    if (recover) { run(w, 10); w.press(Intent.Jump); }
    const hp = w.player.combatant.health.current;
    const after = run(w, C.frames + 40); // (an air jump stays up a little longer)
    assert.ok(after.some((e) => e.type === (recover ? "airRecover" : "hardLanding") && e.fighter === w.player));
    assert.ok(after.some((e) => e.type === "caught"), "the debris catches them, and the fight goes on");
    assert.ok(!after.some((e) => e.type === (recover ? "hardLanding" : "airRecover") && e.fighter === w.player), recover ? "caught: no hard landing" : "no catch");
    if (!recover) assert.ok(hp - w.player.combatant.health.current >= C.landing, "a hard landing hurts");
    assert.equal(w.player.pos.y, 0);
  }
});

test("On the debris: off the edge, the dark takes a bite and the nearest slab catches you; a jump or a dodge carries you over", () => {
  const { w, b } = galen();
  setHp(b, 0.45); run(w, C.frames + 30);
  const p = w.player, gapX = Math.sin(C.chunkAngles[0]) * (C.slab + 0.75), gapZ = Math.cos(C.chunkAngles[0]) * (C.slab + 0.75);
  // Airborne over the gap: nothing happens.
  p.pos.x = gapX; p.pos.z = gapZ; p.pos.y = 1.5; p.grounded = false; p.vel.y = 0; p.combatant.invulnerableFrames = 0;
  const air = run(w, 3);
  assert.ok(!air.some((e) => e.type === "pitFall"), "in the air, you're over it");
  // A brief step over a crack is forgiven; standing in the gap is not.
  p.pos.x = gapX; p.pos.z = gapZ; p.pos.y = 0; p.vel.y = 0; p.grounded = true; p.combatant.invulnerableFrames = 0; p.offIsland = 0;
  assert.ok(!run(w, Tuning.islandGrace - 2).some((e) => e.type === "pitFall"), "a few frames' grace: a run carries you over a crack");
  const hp = p.combatant.health.current;
  p.pos.x = gapX; p.pos.z = gapZ;
  const l = run(w, 4);
  const fall = l.find((e) => e.type === "pitFall");
  assert.ok(fall && fall.fighter === p, "over the edge");
  assert.equal(hp - p.combatant.health.current, Math.round(p.combatant.health.max * Tuning.islandFall), "the dark takes a bite");
  run(w, 40);
  assert.ok(onSlab(w, p) && p.pos.y === 0, "and the nearest slab catches you");
  // Never the last of your health.
  p.combatant.health.set(3); p.combatant.invulnerableFrames = 0; p.pos.x = gapX; p.pos.z = gapZ; p.grounded = true; p.pos.y = 0;
  run(w, Tuning.islandGrace + 2);
  assert.ok(p.alive && p.combatant.health.current >= 1);
  // Everyone else keeps to the slabs (stepping across the narrow gaps).
  for (const [x, z] of [[0, -16], [16, 0], [-3, 15]]) {
    b.pos.x = x; b.pos.z = z; run(w, 1);
    assert.ok(Math.min(...w.islands.map((s) => Math.hypot(b.pos.x - s.x, b.pos.z - s.z) - s.r)) <= Tuning.islandStep + 0.01, "the knight keeps to the debris");
  }
});

test("P4: the Oath's three vow-seals stand out on the chunks, past the gap; when he falls the debris settles, and a retry starts on a whole floor", () => {
  const { w, b } = galen();
  setHp(b, 0.6); run(w, 2);
  setHp(b, 0.45); run(w, C.frames + 4);
  setHp(b, 0.2); const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "oath"));
  const seals = w.liveEnemies.filter((e) => e.kind === "seal");
  assert.equal(seals.length, 3);
  for (const [i, s] of seals.entries()) {
    const c = w.islands[i + 1];
    assert.ok(Math.hypot(s.pos.x - c.x, s.pos.z - c.z) < 0.01, "a seal on each chunk");
    assert.ok(Math.hypot(s.pos.x, s.pos.z) - C.slab > 1, "past the gap");
  }
  for (const s of seals) s.combatant.health.set(0);
  assert.ok(run(w, 2).some((e) => e.type === "oathBroken"));
  setHp(b, 0.05); assert.ok(run(w, 2).some((e) => e.type === "desperate"));
  b.combatant.health.set(0);
  assert.ok(run(w, 2).some((e) => e.type === "floorSettle"));
  assert.equal(w.islands, null, "nobody falls once he's down");
  // A lost fight: the retry starts on a whole floor.
  const { w: w2, b: b2 } = galen();
  setHp(b2, 0.45); run(w2, 2);
  assert.ok(w2.islands);
  w2.resetPlayer();
  assert.ok(w2.drainEvents().some((e) => e.type === "floorRestore"));
  assert.equal(w2.islands, null);
});

test("The debris fits both halls Galen is fought in (Ep 8's round arena and the Tower zone's), and the set draws it", () => {
  const { w, b } = galen();
  setHp(b, 0.45); run(w, 1);
  for (const bounds of [w.bounds, ZONES.tower.bounds]) for (const s of w.islands) {
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2, p = { x: s.x + Math.sin(a) * s.r * 0.98, z: s.z + Math.cos(a) * s.r * 0.98 }, q = constrain({ ...p }, 0, { ...bounds, solids: [] });
      assert.ok(Math.hypot(p.x - q.x, p.z - q.z) < 1e-6, "every slab inside the walls");
    }
  }
  const sets = src("runtime/sets.js"), main = src("main.js");
  assert.match(sets, /collapse: breakFloor, restoreFloor/);
  assert.match(sets, /K\.root\.position\.y = H/, "the hall is lifted with everyone, then the slabs fall away from it");
  for (const ev of ["collapse", "caught", "pitFall", "floorRestore", "floorSettle"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
});

test("Staged fights: the foe a fight is about holds the target card (the Hollow Bloom), and its tutorial sits under the action", async () => {
  const { EPISODE_18 } = await import("../src/data/story/ep18.js");
  const { Siege } = await import("../src/sim/siege.js");
  const b = EPISODE_18.beats.find((x) => x.id === "bloom");
  assert.ok(b.siege.foes[0].bar && b.tutorial[0].low);
  const w = new World({ seed: 9, ...b.world }), s = new Siege(w, b.siege).start();
  assert.equal(w.headline?.kind, "hollowBloom");
  assert.ok(w.gauge, "the meter keeps the boss bar");
  s.end();
  assert.equal(w.headline, null);
  assert.match(src("runtime/hud.js"), /world\.headline\?\.alive \? world\.headline/);
  assert.match(src("runtime/story.js"), /this\._showHint\(h\.text, h\.low\)/);
  assert.match(readFileSync(new URL("../template.html", import.meta.url), "utf8"), /\.hint-pill\.low \{/);
});
