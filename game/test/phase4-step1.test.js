import { test } from "node:test";
import assert from "node:assert/strict";
import { constrain, outOfBounds, inRect, YARD } from "../src/sim/bounds.js";
import { ZONES, arrivalPoint } from "../src/data/zones.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { CAST } from "../src/data/story/cast.js";
import { World } from "../src/sim/world.js";

test("bounds: circle clamp, rect clamp, and pushing out of boxes and circles", () => {
  const p = constrain({ x: 30, z: 0 }, 0.5, YARD); assert.ok(Math.abs(p.x - 17) < 1e-9);
  const b = { rect: [-10, -10, 10, 10], solids: [{ box: [0, 0, 4, 4] }, { circle: [-5, -5, 1] }] };
  assert.deepEqual(constrain({ x: 20, z: -20 }, 0.5, b), { x: 9.5, z: -9.5 });
  const inBox = constrain({ x: 0.6, z: 2 }, 0.5, b); assert.ok(inBox.x <= -0.5 + 1e-9, "pushed out the near side");
  const inCircle = constrain({ x: -5.2, z: -5 }, 0.5, b); assert.ok(Math.hypot(inCircle.x + 5, inCircle.z + 5) >= 1.5 - 1e-9);
  assert.ok(outOfBounds({ x: 13, z: 0 }, b)); assert.ok(!outOfBounds({ x: 11, z: 0 }, b));
  assert.ok(inRect({ x: 1, z: 1 }, [0, 0, 2, 2])); assert.ok(!inRect({ x: 3, z: 1 }, [0, 0, 2, 2]));
});

const blocked = (zone, pt, r = 0.45) => { const q = constrain({ x: pt.x, z: pt.z }, r, zone.bounds); return Math.hypot(q.x - pt.x, q.z - pt.z) > 0.05; };

test("zones: spawns, arrivals and townsfolk stand in open ground; exits lead to valid arrivals outside the exit", () => {
  for (const z of Object.values(ZONES)) {
    assert.ok(!blocked(z, z.spawn), `${z.id} spawn is inside a wall`);
    for (const [k, a] of Object.entries(z.arrivals ?? {})) {
      assert.ok(!blocked(z, a), `${z.id} arrival ${k} is inside a wall`);
      for (const e of z.exits) assert.ok(!inRect(a, e.rect), `${z.id} arrival ${k} would trigger an exit`);
    }
    for (const c of z.cast) assert.ok(!blocked(z, c), `${z.id}: ${c.id} stands inside a wall`);
    for (const e of z.exits) {
      const to = ZONES[e.to];
      assert.ok(to, `${z.id} exit ${e.id} leads nowhere`);
      assert.ok(to.arrivals?.[e.spawn], `${z.id} exit ${e.id}: ${e.to} has no arrival "${e.spawn}"`);
      assert.deepEqual(arrivalPoint(to, e.spawn), to.arrivals[e.spawn]);
    }
  }
});

test("world dialogue: every townsperson's node exists, speakers are cast, lines react to story flags", () => {
  const nodes = parseScript(WORLD_SCRIPT, "world");
  for (const z of Object.values(ZONES)) for (const c of z.cast) {
    assert.ok(nodes[c.node], `${z.id}: missing node ${c.node}`);
    assert.ok(Object.values(CAST).some((k) => k.actor === c.id), `${c.id} not in the cast`);
  }
  const lines = (flags, node) => { const r = new DialogueRunner(nodes, new FlagStore(flags), { name: "Kit" }).start(node); const out = []; for (;;) { const s = r.next(); if (s.type === "end") return out; if (s.type === "options") r.choose(0); if (s.type === "line") { assert.ok(!s.speaker || CAST[s.speaker], s.speaker); out.push(s.text); } } };
  assert.ok(lines({ EXAM_DUEL_WON: 1 }, "W_Guard").some((t) => t.includes("beat Valcourt")));
  assert.ok(lines({}, "W_Guard").some((t) => t.includes("kept getting up")));
  assert.ok(lines({ MIRREN_SAVED: 1 }, "W_Gossip").some((t) => t.includes("girl came out")));
});

test("a world with zone bounds keeps the player out of buildings", () => {
  const w = new World({ seed: 1, companions: false, bounds: ZONES.aurelin.bounds });
  const hall = ZONES.aurelin.bounds.solids.find((s) => s.box && s.box[2] - s.box[0] > 20).box;
  w.player.pos = { x: (hall[0] + hall[2]) / 2, y: 0, z: hall[1] + 0.3 };
  w.step();
  assert.ok(w.player.pos.z <= hall[1] - w.player.stats.radius + 1e-6, "pushed back out of the Hall");
});
