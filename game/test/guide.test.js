import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { isFree, lineClear, findPath, trailMarks, guideTarget, pathLength } from "../src/sim/guide.js";
import { ZONES } from "../src/data/zones.js";

const WALL = { rect: [-10, -10, 10, 10], solids: [{ box: [-1, -8, 1, 6] }, { circle: [5, 5, 1.5] }] };
const clearAll = (path, b, r = 0.36) => path.every((p, i) => !i || lineClear(path[i - 1], p, r, b));

test("the trail's ground rules: inside the bounds, out of the walls, straight lines only where they're clear", () => {
  assert.ok(isFree(-5, 0, 0.4, WALL) && !isFree(0, 0, 0.4, WALL) && !isFree(5, 5.5, 0.4, WALL) && !isFree(9.8, 0, 0.4, WALL));
  assert.ok(!lineClear({ x: -5, z: 0 }, { x: 5, z: 0 }, 0.4, WALL), "the wall is in the way");
  assert.ok(lineClear({ x: -5, z: 8 }, { x: 5, z: 8 }, 0.4, WALL), "round the end of it is open");
  assert.ok(!lineClear({ x: 2, z: 2 }, { x: 8, z: 8 }, 0.4, WALL), "the post is in the way");
  assert.ok(isFree(0, 16, 0.4, { radius: 17 }) && !isFree(0, 16.8, 0.4, { radius: 17 }), "the yard is a disc");
});

test("the path goes round a wall, never through it, and ends at the person you're after", () => {
  const from = { x: -5, z: 0 }, to = { x: 5, z: 0 };
  const path = findPath(from, to, WALL);
  assert.ok(path && path.length >= 3, "it has to turn");
  assert.deepEqual(path[0], from); assert.deepEqual(path.at(-1), to);
  assert.ok(clearAll(path, WALL), "every leg is walkable");
  assert.ok(path.some((p) => p.z > 6), "round the open end");
  assert.ok(pathLength(path) < 26, "and not the long way");
  assert.equal(findPath(from, { x: -2, z: 3 }, WALL).length, 2, "in plain sight: one straight line");
  const boxedIn = { rect: [-10, -10, 10, 10], solids: [{ box: [-3, -3, 3, -2] }, { box: [-3, 2, 3, 3] }, { box: [-3, -3, -2, 3] }, { box: [2, -3, 3, 3] }] };
  assert.equal(findPath({ x: -6, z: 0 }, { x: 0, z: 0 }, boxedIn), null, "a closed room can't be reached");
  const byTheWall = findPath(from, { x: 1.2, z: -2 }, WALL); // standing right against it, on the far side
  assert.ok(byTheWall && clearAll(byTheWall.slice(0, -1), WALL), "someone leaning on the wall can still be reached");
});

test("arrows sit along the path, spaced out, pointing the way you walk, stopping short of the goal", () => {
  const path = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 6 }];
  const marks = trailMarks(path, { spacing: 1.25, start: 1.1, stop: 1.1, max: 14 });
  assert.equal(marks.length, 12);
  assert.ok(Math.abs(marks[0].x - 1.1) < 1e-9 && marks[0].z === 0);
  for (let i = 1; i < marks.length; i++) assert.ok(Math.abs(marks[i].s - marks[i - 1].s - 1.25) < 1e-9);
  assert.ok(Math.abs(marks[0].yaw - Math.PI / 2) < 1e-6, "along +x");
  assert.ok(Math.abs(marks.at(-1).yaw) < 1e-6, "then along +z, round the corner");
  assert.ok(marks.at(-1).left >= 1.1, "never on top of the goal");
  assert.equal(trailMarks(path, { max: 5 }).length, 5, "only so many at once");
  assert.deepEqual(trailMarks(null), []);
});

test("the trail leads to the nearest thing the beat still needs, skipping what's done or not there", () => {
  const where = (id) => ({ a: { x: 5, z: 0 }, b: { x: 2, z: 0 }, c: { x: 1, z: 0 }, d: null }[id]);
  assert.equal(guideTarget({ x: 0, z: 0 }, ["a", "b", "c", "d"], new Set(["c"]), where).id, "b");
  assert.equal(guideTarget({ x: 0, z: 0 }, ["d"], new Set(), where), null);
  assert.equal(guideTarget({ x: 0, z: 0 }, ["a", "b"], new Set(["a", "b"]), where), null, "all done: no trail");
});

test("every episode walk-around: each person or thing it needs can be reached on foot from where Rook starts", async () => {
  const files = readdirSync(new URL("../src/data/story/", import.meta.url)).filter((f) => /^ep\d+\.js$/.test(f));
  let checked = 0;
  for (const f of files) {
    const mod = await import(`../src/data/story/${f}`);
    for (const ep of Object.values(mod).filter((v) => v?.beats)) {
      for (const b of ep.beats.filter((x) => x.type === "explore" && x.required?.length)) {
        const zone = b.zone ?? Object.values(ZONES).find((z) => z.stage === b.stage && !z.roamOnly);
        const bounds = zone?.bounds ?? { radius: 17 };
        const from = b.rook ?? zone?.spawn ?? { x: 0, z: 0 };
        for (const id of b.required) {
          const at = b.cast?.find((c) => c.id === id) ?? b.pickups?.find((p) => p.id === id);
          assert.ok(at, `${ep.id}/${b.id}: ${id} is somewhere`);
          const path = findPath(from, at, bounds);
          assert.ok(path, `${ep.id}/${b.id}: ${id} can be reached`);
          assert.ok(clearAll(path.slice(0, -1), bounds), `${ep.id}/${b.id}: the way to ${id} doesn't cross a wall`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked >= 15, `checked ${checked}`);
});
