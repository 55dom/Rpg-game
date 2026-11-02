// Phase 12 Step 3: Squad Contracts (§18.1: "repeatable small missions for Merit. Template-generated from data to fill
// gaps without hand-authoring each one"), their tiers opened by Knight Rank (§17: "mission tiers"), and the world map
// showing only places the story has reached.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTRACT_SITES, CONTRACT_TEMPLATES, FOE_NAMES, OFFERS_PER_DAY } from "../src/data/contracts.js";
import { Contracts, offersFor, openSites } from "../src/core/contracts.js";
import { FlagStore, compileExpr, truthy } from "../src/core/flags.js";
import { ZONES } from "../src/data/zones.js";
import { ENEMIES } from "../src/data/enemies.js";
import { constrain } from "../src/sim/bounds.js";

const late = () => new FlagStore({ EP4_DONE: 1, EP11_DONE: 1, EP17_DONE: 1, EP30_DONE: 1, EP33_DONE: 1, GALEN_DEFEATED: 1, HAS_SUMMONS: 1, KNIGHT_RANK: 4 });

test("sites in real zones, on open ground, away from where you walk in; foes that exist; every tier has a site", () => {
  for (const s of CONTRACT_SITES) {
    const z = ZONES[s.zone];
    assert.ok(z, s.id);
    for (let a = 0; a < 8; a++) for (const r of [0, s.at.r]) {
      const x = s.at.x + Math.sin(a * Math.PI / 4) * r, y = s.at.z + Math.cos(a * Math.PI / 4) * r, p = constrain({ x, z: y }, 0.5, z.bounds);
      assert.ok(Math.hypot(p.x - x, p.z - y) < 0.01, `${s.id}: (${x.toFixed(1)}, ${y.toFixed(1)}) is clear`);
    }
    const [x0, z0, x1, z1] = s.rect, sp = z.spawn;
    assert.ok(!(sp.x >= x0 && sp.x <= x1 && sp.z >= z0 && sp.z <= z1), `${s.id}: you don't arrive inside the fight`);
    assert.ok(s.foes.every((k) => ENEMIES[k] && FOE_NAMES[k]), s.id);
    for (const k of s.kinds ?? []) assert.ok(CONTRACT_TEMPLATES[k], `${s.id}: ${k}`);
  }
  for (let t = 1; t <= 5; t++) assert.ok(CONTRACT_SITES.some((s) => s.tier === t), `tier ${t}`);
  // The zones §13 lists that had no quest of their own get contracts: the Undercroft, the Tower, Ironhold, the Isles, the Hollowmarch.
  for (const z of ["undercroft", "tower", "ironhold", "isles", "hollowmarch"]) assert.ok(CONTRACT_SITES.some((s) => s.zone === z), z);
});

test("template-generated: three a day, the same all day, different from day to day, the words filled in", () => {
  const f = late();
  const a = offersFor(5, f), b = offersFor(5, f), c = offersFor(6, f);
  assert.equal(a.length, OFFERS_PER_DAY);
  assert.deepEqual(a.map((o) => o.title), b.map((o) => o.title));
  assert.notDeepEqual([...a, ...offersFor(7, f), ...offersFor(8, f)].map((o) => o.title), [...c, ...c, ...c].map((o) => o.title));
  for (let d = 1; d < 40; d++) for (const o of offersFor(d, f)) {
    assert.doesNotMatch(o.title + o.text, /\{|\}/, "no blanks");
    assert.ok(o.wave.length >= 2 && o.wave.every((k) => o.site.foes.includes(k)));
    assert.ok(o.merit > 0 && o.marks > 0);
    assert.doesNotMatch(o.text, /\bdoors?\b|\bkeys?\b|lantern/i, "errands, not clues");
  }
  assert.equal(new Set(a.map((o) => o.site.id)).size, 3, "different places, when there are enough");
});

test("mission tiers (§17): Ember sees tier 1, each rank one more; and nowhere the story hasn't reached", () => {
  assert.deepEqual(openSites(new FlagStore()).map((s) => s.id), ["hedgerows"]);
  assert.deepEqual(openSites(new FlagStore({ EP4_DONE: 1 })).map((s) => s.tier), [1, 1]);
  const spark = new FlagStore({ EP4_DONE: 1, EP11_DONE: 1, GALEN_DEFEATED: 1, HAS_SUMMONS: 1, KNIGHT_RANK: 1 });
  assert.ok(openSites(spark).every((s) => s.tier <= 2) && openSites(spark).some((s) => s.tier === 2));
  assert.equal(Math.max(...openSites(late()).map((s) => s.tier)), 5);
  for (let d = 1; d < 30; d++) assert.ok(offersFor(d, spark).every((o) => o.tier <= 2));
});

test("one at a time; the fight is in its zone; won, it pays Merit and Marks and the offer's done for the day", () => {
  const f = late(), c = new Contracts(f);
  const o = c.accept(9, 1);
  assert.ok(o);
  assert.equal(c.accept(9, 2), false, "one at a time");
  const enc = c.encounterFor(o.site.zone);
  assert.equal(enc.contract, true); assert.deepEqual(enc.wave, o.wave); assert.match(enc.label, /SQUAD CONTRACT/);
  assert.equal(c.encounterFor(o.site.zone === "thornwick" ? "fens" : "thornwick"), null);
  const merit = Number(f.get("MERIT")) || 0;
  const paid = c.complete(9);
  assert.equal(paid.title, o.title);
  assert.equal(f.get("MERIT"), merit + o.merit); assert.equal(f.get("CONTRACTS_DONE"), 1);
  assert.equal(c.active, null);
  const board = c.board(9);
  assert.ok(board[1].done && !board[0].done);
  assert.equal(c.accept(9, 1), false, "done today");
  assert.ok(!c.board(10).some((x) => x.done), "a new day, a new board");
  // Taken one day, finished the next: still yours, still pays.
  c.accept(10, 0); assert.ok(c.active); assert.equal(c.complete(11).day, 10);
});

test("the story hooks: the zone's fights include a contract taken there; the board is on the squad board", () => {
  assert.equal(ZONES.lighthouse.encounters, undefined, "(some zones have no fights of their own: the list must still build)");
  const story = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8"), main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(story, /encounters: \[\.\.\.\(zone\.encounters \?\? \[\]\), \.\.\.\[this\.contracts\.encounterFor\(zone\.id\)\]/);
  assert.match(story, /e\.contract && won/);
  assert.match(main, /SQUAD CONTRACTS · DAY/);
  assert.match(ZONES.lighthouse.pickups.find((p) => p.id === "squadBoard").label, /contracts/);
});

test("the world map shows only where the story has been: the Hollowmarch after Ep 17, Larkspur's ruins after Ep 57, the memory never", () => {
  const onMap = (f) => Object.values(ZONES).filter((z) => !z.dungeon && !z.interior && !z.noMap && (!z.mapWhen || truthy(compileExpr(z.mapWhen)(f)))).map((z) => z.id);
  const start = onMap(new FlagStore());
  for (const id of ["hollowmarch", "ruins", "larkspurFire", "isles", "ironhold", "grounds"]) assert.ok(!start.includes(id), id);
  const end = onMap(new FlagStore({ EP2_DONE: 1, EP17_DONE: 1, EP30_DONE: 1, EP57_DONE: 1, HAS_SUMMONS: 1 }));
  for (const id of ["hollowmarch", "ruins", "isles", "ironhold", "grounds"]) assert.ok(end.includes(id), id);
  assert.ok(!end.includes("larkspurFire"), "Larkspur the night it burned is a memory, not a place to travel to");
  assert.match(readFileSync(new URL("../src/main.js", import.meta.url), "utf8"), /!z\.noMap/);
});
