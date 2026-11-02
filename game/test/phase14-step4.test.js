// Phase 14 Step 4: performance as GDD §21.7 writes it: "Memory: async loading; unload previous zone", "dispose each
// zone's assets on exit"; "NPCs: distant NPCs are animated impostors / no AI; crowds are cosmetic"; "VFX: pooled;
// per-spell particle budget (≤ 300 normal, ≤ 1500 ultimate; mobile: half)"; "Animation: stepped (on-twos) playback
// halves evaluation cost".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
// Enough of Babylon for the set switcher's lighting calls.
globalThis.BABYLON ??= { Color4: { FromHexString: () => ({}) }, Color3: { FromHexString: () => ({ clone() { return this; } }) }, Vector3: class { constructor(...a) { this.a = a; } } };
const { Sets, SET_STREAMING } = await import("../src/runtime/sets.js");
const { VFX_BUDGET, VFX_POOLS, vfxCapacity } = await import("../src/runtime/vfx.js");
const { CROWD_LOD } = await import("../src/runtime/crowd.js");

/** A scene with the lists a set builder adds to, and stand-in builders that add a few disposable things each. */
function stage() {
  const scene = { meshes: [], materials: [], multiMaterials: [], textures: [], particleSystems: [], lights: [], transformNodes: [], getLightByName: () => null };
  const thing = (list, name, extra = {}) => { const o = { name, gone: false, isDisposed() { return this.gone; }, dispose() { this.gone = true; const i = list.indexOf(this); if (i >= 0) list.splice(i, 1); }, ...extra }; list.push(o); return o; };
  const builds = {};
  const make = (name) => () => {
    builds[name] = (builds[name] ?? 0) + 1;
    const root = thing(scene.transformNodes, `set-${name}`, { parent: null });
    thing(scene.meshes, `${name}-ground`); thing(scene.meshes, `${name}-wall`); thing(scene.materials, `${name}-stone`);
    thing(scene.particleSystems, `${name}-mist`); thing(scene.textures, `${name}-sign`); thing(scene.lights, `${name}-lamp`);
    return { root, env: { clear: "#000000", fog: "#000000", fogDensity: 0, hemi: [1, "#fff", "#000"], sun: [1, "#fff", [0, -1, 0]] }, toon: {}, show() {}, update() {} };
  };
  const arena = { setVisible() {}, env: { clear: "#000000", fog: "#000000", fogDensity: 0, hemi: [1, "#fff", "#000"], sun: [1, "#fff", [0, -1, 0]] } };
  return { scene, arena, builds, makers: Object.fromEntries(["lighthouse", "aurelin", "fens", "hall", "bridge", "camp"].map((n) => [n, make(n)])) };
}

test("zone streaming: a set is built when it's needed and disposed once it's not among the last few used", () => {
  for (const [mobile, keep] of [[false, SET_STREAMING.keep], [true, SET_STREAMING.keepMobile]]) {
    const { scene, arena, builds, makers } = stage();
    const sets = new Sets(scene, arena, { mobile }); sets.makers = makers;
    assert.equal(sets.keep, keep);
    const route = ["lighthouse", "aurelin", "fens", "hall", "bridge", "camp"];
    for (const n of route) sets.use(n);
    assert.equal(sets.built.size, keep, `${mobile ? "phone" : "PC"}: only the last ${keep}`);
    assert.deepEqual([...sets.recent], route.slice(-keep).reverse());
    assert.ok(sets.built.has("camp"), "never the one you're in");
    // Everything the disposed sets made is gone from the scene; what the kept ones made is still there.
    for (const k of ["meshes", "materials", "particleSystems", "textures", "lights", "transformNodes"]) {
      for (const n of route.slice(0, -keep)) assert.ok(!scene[k].some((x) => x.name.includes(n)), `${n}'s ${k} disposed`);
      for (const n of route.slice(-keep)) assert.ok(scene[k].some((x) => x.name.includes(n)), `${n}'s ${k} kept`);
    }
    assert.equal(sets.disposed, route.length - keep);
    sets.use("lighthouse");
    assert.equal(builds.lighthouse, 2, "coming back builds it again, fresh");
    sets.use("yard"); assert.equal(sets.built.size, keep, "the yard is the arena, always there");
  }
  const s = src("runtime/sets.js");
  assert.match(s, /s\.owned = Object\.fromEntries\(OWNED\.map\(\(k\) => \[k, \(sc\[k\] \?\? \[\]\)\.filter\(\(x\) => !before\[k\]\.has\(x\)\)\]\)\);/, "what the builder made: the scene's lists before and after");
  assert.match(s, /for \(const r of o\.roots \?\? \[\]\) if \(!r\.isDisposed\?\.\(\)\) r\.dispose\(false, true\);/, "and anything added under its root since");
  assert.match(src("main.js"), /\$\{sets\.built\.size\}\/\$\{sets\.keep\} SETS/, "the performance meter shows it");
});

test("distant townsfolk: posed every frame near, on threes further out, not drawn far away; still walking out of sight", () => {
  assert.deepEqual([CROWD_LOD.near, CROWD_LOD.hide, CROWD_LOD.every], [30, 70, 3]);
  const c = src("runtime/crowd.js");
  assert.match(c, /const far = v \? Math\.hypot\(p\.x - v\.x, p\.z - v\.z\) : 0, shown = far < CROWD_LOD\.hide;/);
  assert.match(c, /if \(!shown\) \{ p\.phase \+= \(moving \* p\.owed\) \/ \(1\.1 \* p\.H\); p\.owed = 0; continue; \}/, "their stride keeps time");
  assert.match(c, /if \(far > CROWD_LOD\.near && \(\(p\.tick = \(p\.tick \?\? i\) \+ 1\) % CROWD_LOD\.every\)\) continue;/);
  assert.ok(c.indexOf("p.owed = (p.owed ?? 0) + dt;") > c.indexOf("p.t += dt * p.speed * hurry"), "where they are is worked out before the level of detail is chosen");
  assert.doesNotMatch(c, /brain|think\(/, "no AI: the crowd is cosmetic");
});

test("the particle budget: the pools are it, under 300 on a PC and half that on a phone", () => {
  assert.deepEqual([VFX_BUDGET.normal, VFX_BUDGET.ultimate, VFX_BUDGET.mobileShare], [300, 1500, 0.5]);
  assert.ok(vfxCapacity(false) <= VFX_BUDGET.normal, `PC: ${vfxCapacity(false)}`);
  assert.ok(vfxCapacity(true) <= VFX_BUDGET.normal * VFX_BUDGET.mobileShare, `phone: ${vfxCapacity(true)}`);
  const v = src("runtime/vfx.js");
  assert.match(v, /\}, mobile \? VFX_POOLS\.sparksMobile : VFX_POOLS\.sparks\);/);
  for (const k of ["flashes", "sparkFlips", "rings", "crescents", "threads", "pillars"]) assert.match(v, new RegExp(`\\}, VFX_POOLS\\.${k}\\);`), k);
  assert.match(src("main.js"), /new Vfx\(scene, camera\.cam, overlay, \{ mobile \}\)/);
  assert.equal(VFX_POOLS.sparkKinds, (v.match(/glow\(scene, "spark-[a-z]+"/g) ?? []).length, "a pool per spark colour");
  // The sets' ambient particle systems: none over the budget, and a phone's at most half a PC's.
  const ps = [...src("runtime/sets.js").matchAll(/new BB\.ParticleSystem\([^,]+, mobile \? (\d+) : (\d+), scene\)/g)].map((m) => [+m[1], +m[2]]);
  assert.ok(ps.length >= 7);
  for (const [phone, pc] of ps) { assert.ok(pc <= VFX_BUDGET.normal, `${pc}`); assert.ok(phone <= pc * VFX_BUDGET.mobileShare, `${phone} of ${pc}`); }
});

test("on twos, a held drawing isn't worked out again", () => {
  const r = src("runtime/rig.js");
  assert.match(r, /if \(held\.a === a && held\.f === f\) \{ Rig\.poseHeld\+\+; return held\.out; \}/);
  assert.ok(r.indexOf("const f = steppedFrame(a, raw, { on: Rig.twos });") < r.indexOf("if (held.a === a && held.f === f)"), "keyed on the drawing (the stepped frame), so with twos off every frame is new");
  assert.ok(r.indexOf("this.smear = isAttack(a)") < r.indexOf("if (held.a === a && held.f === f)"), "the smear still follows the fight's own frame");
});

test("found on the way (a set disposed and built again on every change): Aurelin's lantern-bearer keeps a camera off it", async () => {
  const { ZONES, AURELIN_LAYOUT: A } = await import("../src/data/zones.js");
  const solids = ZONES.aurelin.bounds.solids.filter((s) => s.circle?.[0] === A.fountain.x && s.circle?.[1] === A.fountain.z);
  assert.ok(solids.some((s) => s.low && s.circle[2] === A.fountain.r), "the basin stops feet");
  assert.ok(solids.some((s) => !s.low && s.circle[2] >= 1.5), "the statue on its plinth (5.5 m) stops a camera, with room round it (Ep 46's wide shot stood 0.7 m from it)");
});
