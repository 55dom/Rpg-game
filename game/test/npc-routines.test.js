import { test } from "node:test";
import assert from "node:assert/strict";
import { Routine } from "../src/sim/routine.js";
import { ZONES } from "../src/data/zones.js";
import { constrain } from "../src/sim/bounds.js";

/** Walk a routine for `seconds`, moving the person the way the runtime does. */
function live(routine, pos, seconds, ctx = {}) {
  const dt = 1 / 30, seen = [];
  for (let t = 0; t < seconds; t += dt) {
    const out = routine.update({ pos, dt, ...ctx });
    if (out.target) {
      const dx = out.target.x - pos.x, dz = out.target.z - pos.z, d = Math.hypot(dx, dz), s = Math.min(d, out.speed * dt);
      pos.x += (dx / d) * s; pos.z += (dz / d) * s;
    }
    seen.push(out);
  }
  return seen;
}
const seq = (n) => { let s = n; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

test("a routine loops through its steps: walk to the spot, work there, move on", () => {
  const r = new Routine({ steps: [{ do: "work", at: [0, 0], anim: "hammer", dur: [2, 2] }, { do: "idle", at: [5, 0], dur: [2, 2] }] }, seq(3));
  const pos = { x: 0, z: 0 };
  const seen = live(r, pos, 12);
  assert.ok(seen.some((o) => o.activity === "hammer"));
  assert.ok(seen.some((o) => o.activity === "walk"));
  assert.ok(seen.some((o) => o.activity === "idle" && Math.abs(pos.x - 5) < 0.5) || seen.filter((o) => o.activity === "idle").length > 0);
});

test("stop and look: someone standing close gets their attention; walking past only gets a glance", () => {
  const r = new Routine({ steps: [{ do: "wander", around: [0, 0], r: 3, dur: [20, 20] }] }, seq(5));
  const pos = { x: 0, z: 0 };
  const passing = live(r, pos, 0.5, { player: { x: 1, z: 1, moving: true } });
  assert.ok(passing.every((o) => o.activity !== "attend"));
  const stopped = live(r, pos, 0.5, { player: { x: pos.x + 1, z: pos.z, moving: false } });
  assert.equal(stopped.at(-1).activity, "attend");
  assert.ok(stopped.at(-1).look);
});

test("a fight nearby: civilians run and cower, guards turn to face it, children run fastest", () => {
  const fight = { x: 0, z: 0 };
  const civ = new Routine({ steps: [{ do: "idle", at: [3, 0] }], shelter: [[20, 0], [-2, 1]] });
  const pos = { x: 3, z: 0 };
  const out = live(civ, pos, 15, { combat: fight });
  assert.ok(out.some((o) => o.activity === "flee"));
  assert.equal(out.at(-1).activity, "cower");
  assert.ok(Math.hypot(pos.x - 20, pos.z) < 1, "ran to the shelter farthest from the fight");
  const guard = new Routine({ role: "guard", steps: [{ do: "idle", at: [3, 0] }] });
  const g = guard.update({ pos: { x: 3, z: 0 }, combat: fight, dt: 0.1 });
  assert.equal(g.activity, "alert"); assert.ok(Math.abs(g.face - -Math.PI / 2) < 1e-9);
  const kid = new Routine({ role: "child", steps: [{ do: "idle", at: [3, 0] }] }), adult = new Routine({ steps: [{ do: "idle", at: [3, 0] }] });
  assert.ok(kid.update({ pos: { x: 3, z: 0 }, combat: fight, dt: 0.1 }).speed > adult.update({ pos: { x: 3, z: 0 }, combat: fight, dt: 0.1 }).speed);
});

test("rain sends people under cover (not guards); at night people with a home go in", () => {
  const r = new Routine({ steps: [{ do: "idle", at: [0, 0] }], shelter: [[4, 0]], home: [-4, 0] });
  const pos = { x: 0, z: 0 };
  assert.equal(live(r, pos, 6, { raining: true }).at(-1).activity, "shelter");
  assert.ok(Math.abs(pos.x - 4) < 0.6);
  const home = live(r, pos, 10, { night: true });
  assert.ok(home.at(-1).hidden);
  const guard = new Routine({ role: "guard", steps: [{ do: "idle", at: [0, 0] }], shelter: [[4, 0]] });
  assert.notEqual(guard.update({ pos: { x: 0, z: 0 }, raining: true, dt: 0.1 }).activity, "hurry");
});

test("every townsperson's routine spots, homes and shelters are open ground in their zone", () => {
  for (const z of Object.values(ZONES)) {
    const pts = [...(z.shelters ?? [])];
    for (const c of [...z.cast, ...(z.extras ?? [])]) for (const r of c.routines ?? (c.routine ? [c.routine] : [])) {
      if (r.home) pts.push(r.home);
      for (const s of r.steps) { const p = s.at ?? s.to ?? s.around; if (p) pts.push(p); }
    }
    for (const [x, zz] of pts) {
      const p = constrain({ x, z: zz }, 0.3, z.bounds);
      assert.ok(Math.hypot(p.x - x, p.z - zz) < 0.35, `${z.id}: (${x}, ${zz}) is inside something`);
    }
  }
});
