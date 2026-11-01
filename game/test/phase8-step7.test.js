import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World, Tuning } from "../src/sim/world.js";
import { hitSpec } from "../src/core/combat.js";
import { MAELIS_ALLY, SACRIFICE } from "../src/reveal/arc7.js";
import { EPISODE_50 } from "../src/reveal/ep50.js";
import { EPISODE_CALPATH } from "../src/reveal/calpath.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const camp = () => {
  const w = new World({ seed: 3, companions: ["bas", "juno", "maelisAlly"] }); w.drainEvents();
  return { w, m: w.companions.find((c) => c.kind === "maelisAlly") };
};

test("Maelis's Sacrifice (GDD §27.3): once a battle, when one of hers drops low, the other prayer; nothing stops it", () => {
  assert.equal(MAELIS_ALLY.sacrifice.ability, SACRIFICE);
  const { w, m } = camp();
  run(w, 30);
  assert.ok(!run(w, 30).some((e) => e.type === "sacrificeBegin"), "nobody's hurt: no prayer");
  const p = w.player;
  p.combatant.health.set(p.combatant.health.max * 0.2);
  const l = run(w, 2);
  const begin = l.find((e) => e.type === "sacrificeBegin");
  assert.ok(begin && begin.fighter === m && begin.target === p);
  assert.ok(m.combatant.superArmor, "nothing stops it");
  // Hit her mid-prayer: it goes on.
  const foe = w.spawnEnemy("acolyte", m.pos.x + 1, m.pos.z, 99); w.drainEvents();
  w._resolve(foe, m, { spec: hitSpec({ damage: 4, posture: 30, hitstop: 2, hitstun: 20 }), ability: { id: "x", tags: [], manaCost: 0 }, hitSet: new Set(), origin: foe.pos });
  assert.equal(m.current?.id, "Sacrifice", "still praying");
  foe.combatant.health.set(0);
  const hp = p.combatant.health.current;
  const done = run(w, SACRIFICE.startup + 4);
  const s = done.find((e) => e.type === "sacrifice");
  assert.ok(s && s.target === p, "whoever's hurt worst");
  assert.ok(p.tags.has("STAR_SURGE"), "a star, for a while");
  assert.ok(p.combatant.health.current >= hp + p.combatant.health.max * Tuning.surgeMend - 1, "and mended a little");
  assert.ok(!m.alive && m.noRevive, "she goes down");
  run(w, MAELIS_ALLY.stats.reviveFrames + 60);
  assert.ok(!m.alive, "and stays down until the fight's over");
  // Once a battle.
  p.combatant.health.set(p.combatant.health.max * 0.1);
  assert.ok(!run(w, 30).some((e) => e.type === "sacrificeBegin"));
  // A retry: she can offer again.
  w.resetPlayer();
  assert.ok(m.alive && !m.sacrificed && !m.noRevive);
});

test("The surge: hits harder, takes less; and it wears off", () => {
  const { w } = camp();
  const foe = w.spawnEnemy("acolyte", 0, 3, 98); w.drainEvents();
  const hit = (a, d) => { const before = d.combatant.health.current; d.combatant.invulnerableFrames = 0; w._resolve(a, d, { spec: hitSpec({ damage: 10, posture: 0, hitstop: 0, hitstun: 1 }), ability: { id: "x", tags: [], manaCost: 0 }, hitSet: new Set(), origin: a.pos }); return before - d.combatant.health.current; };
  const p = w.player;
  const plain = [hit(p, foe), hit(foe, p)];
  p.tags.add("STAR_SURGE", 10);
  const surged = [hit(p, foe), hit(foe, p)];
  assert.ok(Math.abs(surged[0] - plain[0] * Tuning.surgeAttack) < 0.6, "harder");
  assert.ok(Math.abs(surged[1] - plain[1] * Tuning.surgeGuard) < 0.6, "less");
  run(w, 12);
  assert.ok(!p.tags.has("STAR_SURGE"), "for a while");
});

test("The Sacrifice in the fight: her line (and if you asked her not to, she says so); the toast, the banner, the chip", () => {
  const story = src("runtime/story.js"), main = src("main.js");
  assert.match(story, /ev\.type === "sacrificeBegin"[\s\S]{0,200}MAELIS_PROMISE[\s\S]{0,40}"dont"/);
  for (const ev of ["sacrificeBegin", "sacrifice"]) assert.match(main, new RegExp(`case "${ev}"`));
  assert.match(src("runtime/hud.js"), /STAR_SURGE[\s\S]{0,60}STAR SURGE/);
  for (const ep of ["ep62", "ep64", "ep65", "ep66", "ep68"]) assert.match(src(`reveal/${ep}.js`), /maelisAlly/, `${ep}: she's in the fight`);
});

test("Ep 50, 'His.': the end card offers his side a while longer (Cal's Path), and Cal's Path comes back to Ep 51", () => {
  const pv = EPISODE_50.beats.find((b) => b.type === "preview");
  assert.equal(pv.nextEpisode, "ep51", "the main road stays open");
  assert.deepEqual({ if: pv.side.if, episode: pv.side.episode }, { if: '$PERSPECTIVE == "cal"', episode: "calpath" });
  assert.match(src("reveal/ep50.js"), /<<set \$PERSPECTIVE to "cal">>/);
  assert.equal(EPISODE_CALPATH.beats.find((b) => b.type === "preview").nextEpisode, "ep51");
  const story = src("runtime/story.js");
  assert.match(story, /const side = beat\.side && truthy\(compileExpr\(beat\.side\.if/);
  assert.match(story, /choice === "side" \? \{ kind: "episode", id: side\.episode \}/);
});

test("The throne chamber's pillars go floor to ceiling: the camera never sits behind one (formation fights, Eps 64–68)", async () => {
  // A stand-in for the few Babylon pieces the follow camera touches.
  class V3 { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } copyFrom(v) { return this.set(v.x, v.y, v.z); } }
  const was = globalThis.BABYLON;
  globalThis.BABYLON = { Vector3: V3, FreeCamera: class { constructor(n, p) { this.position = p; this.fov = 0.8; } setTarget() {} } };
  try {
    const { FollowCamera } = await import("../src/runtime/camera.js");
    const { ZONES } = await import("../src/data/zones.js");
    const throne = ZONES.throne;
    const pillars = throne.bounds.solids.filter((s) => s.circle && s.tall);
    assert.equal(pillars.length, 10, "both rows, every pillar");
    const cam = new FollowCamera(null);
    cam.bounds = { ...throne.bounds, interior: true };
    // Rook beside a pillar, the camera's natural spot right through it: it stops short, on Rook's side.
    const P = pillars.find((s) => s.circle[0] === 5 && s.circle[1] === 3).circle;
    const player = { x: P[0] - 0.4, y: 0, z: P[1] + 2.2 };
    cam.yaw = Math.atan2(-(P[0] - player.x), -(P[1] - player.z)) + Math.PI; // looking from behind the pillar toward Rook
    for (let i = 0; i < 120; i++) cam.update(1 / 60, player, null, { x: 0, y: 0 }, cam.yaw);
    const c = cam.cam.position, f = cam.focus;
    // Along the line from Rook to the camera, nothing passes through the pillar.
    for (let k = 0; k <= 20; k++) {
      const x = f.x + (c.x - f.x) * (k / 20), z = f.z + (c.z - f.z) * (k / 20);
      assert.ok(Math.hypot(x - P[0], z - P[1]) > P[2], "the camera isn't behind the pillar");
    }
    assert.match(readFileSync(new URL("../src/runtime/camera.js", import.meta.url), "utf8"), /r >= 1\.4 \|\| sd\.tall/);
  } finally { globalThis.BABYLON = was; }
});
