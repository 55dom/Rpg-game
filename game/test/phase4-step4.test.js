import { BOSS_KINDS } from "../src/sim/world.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { ZONES, arrivalPoint } from "../src/data/zones.js";
import { ENEMIES } from "../src/data/enemies.js";
import { BOUNTIES } from "../src/data/items.js";
import { constrain, inRect } from "../src/sim/bounds.js";
import { World } from "../src/sim/world.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { CAST } from "../src/data/story/cast.js";
import { FlagStore, compileExpr } from "../src/core/flags.js";
import { QuestLog, DONE } from "../src/core/quests.js";
import { QUESTS } from "../src/data/quests.js";

const R = 0.45; // Rook's body radius
const blocked = (b, x, z) => { const p = constrain({ x, z }, R, b); return Math.hypot(p.x - x, p.z - z) > 1e-6; };

/** Flood-fill the walkable grid from a point; returns a lookup for reachability. */
function reach(b, from, step = 0.5) {
  const [x0, z0, x1, z1] = b.rect, W = Math.ceil((x1 - x0) / step), H = Math.ceil((z1 - z0) / step);
  const seen = new Uint8Array(W * H), q = [];
  const idx = (x, z) => Math.floor((z - z0) / step) * W + Math.floor((x - x0) / step);
  const s = constrain({ ...from }, R, b);
  q.push([s.x, s.z]); seen[idx(s.x, s.z)] = 1;
  while (q.length) {
    const [x, z] = q.pop();
    for (const [dx, dz] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const nx = x + dx, nz = z + dz;
      if (nx <= x0 + R || nx >= x1 - R || nz <= z0 + R || nz >= z1 - R) continue;
      const i = idx(nx, nz);
      if (seen[i] || blocked(b, nx, nz)) continue;
      seen[i] = 1; q.push([nx, nz]);
    }
  }
  return (x, z, r = 1.5) => { // anything within r of a reached cell counts
    for (let dz = -r; dz <= r; dz += step) for (let dx = -r; dx <= r; dx += step) {
      const px = x + dx, pz = z + dz;
      if (px > x0 && px < x1 && pz > z0 && pz < z1 && seen[idx(px, pz)]) return true;
    }
    return false;
  };
}

test("every zone links up: exits go to real arrivals, talk nodes and pickup nodes exist, enemies are known", () => {
  const nodes = parseScript(WORLD_SCRIPT, "world");
  for (const z of Object.values(ZONES)) {
    for (const e of z.exits) { assert.ok(ZONES[e.to], `${z.id} → ${e.to}`); assert.ok(ZONES[e.to].arrivals[e.spawn], `${e.to} arrival ${e.spawn}`); }
    for (const c of z.cast) { assert.ok(nodes[c.node], c.node); assert.ok(Object.values(CAST).some((k) => k.actor === c.id), `cast ${c.id}`); }
    for (const p of z.pickups ?? []) { if (p.node) assert.ok(nodes[p.node], p.node); compileExpr(p.show ?? "1"); }
    for (const e of z.encounters ?? []) {
      for (const k of e.wave) { assert.ok(ENEMIES[k] || BOSS_KINDS.includes(k), k); assert.ok(BOUNTIES[k] != null, `bounty ${k}`); }
      compileExpr(e.when ?? "1");
    }
  }
});

test("arrival points are open ground, outside exits and encounter areas (no instant bounce or ambush)", () => {
  for (const z of Object.values(ZONES)) {
    for (const [k, a] of [["spawn", z.spawn], ...Object.entries(z.arrivals)]) {
      assert.ok(!blocked(z.bounds, a.x, a.z), `${z.id} ${k} is inside something`);
      for (const e of z.exits) assert.ok(!inRect(a, e.rect), `${z.id} ${k} sits in exit ${e.id}`);
      for (const e of z.encounters ?? []) assert.ok(!inRect(a, e.rect), `${z.id} ${k} sits in encounter ${e.id}`);
    }
  }
});

test("everything in a zone can be walked to from where you arrive", () => {
  for (const z of Object.values(ZONES)) {
    const can = reach(z.bounds, arrivalPoint(z, null));
    for (const c of [...z.cast, ...(z.extras ?? [])]) assert.ok(can(c.x, c.z), `${z.id}: ${c.id}`);
    for (const p of z.pickups ?? []) assert.ok(can(p.x, p.z), `${z.id}: pickup ${p.id}`);
    for (const e of z.exits) { const [x0, z0, x1, z1] = e.rect; assert.ok(can((x0 + x1) / 2, (z0 + z1) / 2, 2.5), `${z.id}: exit ${e.id}`); }
    for (const e of z.encounters ?? []) { const [x0, z0, x1, z1] = e.rect; assert.ok(can((x0 + x1) / 2, (z0 + z1) / 2, 3), `${z.id}: encounter ${e.id}`); }
  }
});

test("Undercroft: a room's bars really shut the passages until it's clear", () => {
  const z = ZONES.undercroft, room = z.encounters.find((e) => e.id === "rats");
  const shut = { ...z.bounds, solids: [...z.bounds.solids, ...room.lock.map((b) => ({ box: b }))] };
  const open = reach(z.bounds, z.spawn), closed = reach(shut, { x: 0, z: -4 });
  assert.ok(open(0, 40), "the Gear Hall is reachable when no fight is on");
  assert.ok(!closed(0, -28) && !closed(0, 18), "can't leave the nest mid-fight");
});

test("spawnWave(kinds, at) rings a wave around the encounter point, inside the zone", () => {
  const z = ZONES.fens, enc = z.encounters.find((e) => e.id === "choir");
  const w = new World({ bounds: z.bounds, seed: 3 }); w.drainEvents();
  w.spawnWave(enc.wave, enc.at);
  assert.equal(w.enemies.length, enc.wave.length);
  for (const e of w.enemies) {
    assert.ok(Math.hypot(e.pos.x - enc.at.x, e.pos.z - enc.at.z) < 9, `${e.kind} near the encounter`);
    assert.ok(!blocked(z.bounds, e.pos.x, e.pos.z) || e.stats.radius !== R, `${e.kind} not in a wall`);
  }
  w.clearEnemies();
  assert.equal(w.enemies.length, 0);
  assert.ok(w.drainEvents().some((e) => e.type === "despawn"));
});

test("the Undercroft's rats, clockwork and Thornwick's bandits fight and can be beaten", () => {
  for (const kind of ["rat", "clockwork", "bandit"]) {
    const w = new World({ seed: 5 }); w.drainEvents();
    const e = w.spawnEnemy(kind, 0, -1.5);
    const hp = w.player.combatant.health.current;
    for (let i = 0; i < 600 && w.player.combatant.health.current === hp; i++) { w.step(); w.drainEvents(); }
    assert.ok(w.player.combatant.health.current < hp, `${kind} lands a hit`);
    e.combatant.health.set(0);
    let cleared = false;
    for (let i = 0; i < 400 && !cleared; i++) { w.step(); cleared = w.drainEvents().some((x) => x.type === "waveClear"); }
    assert.ok(cleared, `${kind} goes down`);
  }
});

/** A stand-in story player for quests driven by dialogue and flags. */
function harness() {
  const flags = new FlagStore();
  const log = new QuestLog(QUESTS, flags, {});
  let busy = false;
  flags.onChange(() => { if (busy) return; busy = true; try { log.update(); } finally { busy = false; } });
  const nodes = parseScript(WORLD_SCRIPT, "world");
  const talk = (node, pick = 0) => {
    const lines = [];
    const r = new DialogueRunner(nodes, flags, { name: "Kit", pronouns: "she" }).start(node);
    for (let i = 0; i < 200; i++) {
      const s = r.next();
      if (s.type === "end") return lines;
      if (s.type === "line") { assert.ok(!s.speaker || CAST[s.speaker], s.speaker); lines.push(s.text); }
      if (s.type === "options") { const en = s.options.filter((o) => o.enabled); r.choose(en[Math.min(pick, en.length - 1)].index); }
      if (s.type === "command" && s.name === "quest" && s.args[0] === "start") log.start(s.args[1]);
    }
    throw new Error("runaway");
  };
  return { flags, log, talk };
}

test("Bandits on the Mill Road: Odo asks, the encounter's flag clears it, Odo thanks you; the smith notices", () => {
  const h = harness();
  h.talk("W_Farmer", 0);
  assert.equal(h.log.state("bandits"), 1);
  assert.equal(compileExpr(ZONES.thornwick.encounters[0].when)(h.flags), 1, "the bandits only show up once asked");
  h.flags.set("BANDITS_CLEARED", 1);
  assert.equal(h.log.state("bandits"), 2);
  h.talk("W_Farmer");
  assert.equal(h.log.state("bandits"), DONE);
  assert.ok(h.talk("W_Smith").some((t) => t.includes("mill road")));
});

test("Something Below: the cook asks, visiting the Undercroft and clearing the Gear Hall advance it", () => {
  const h = harness();
  h.talk("W_Cook", 0);
  assert.equal(h.log.state("below"), 1);
  h.flags.set("VISITED_UNDERCROFT", 1);
  assert.equal(h.log.state("below"), 2);
  h.flags.set("UNDERCROFT_CLEARED", 1);
  assert.equal(h.log.state("below"), 3);
  h.talk("W_Cook");
  assert.ok(h.log.isDone("below"));
});

test("the orphan ledger and the fens hymn read cleanly; the ledger remembers Larkspur", () => {
  const h = harness();
  assert.ok(h.talk("W_Ledger").some((t) => t.includes("Larkspur")));
  assert.equal(h.flags.get("LEDGER_SEEN_LARKSPUR"), 1);
  for (const n of ["W_Hymn", "W_Bones", "W_Ness", "W_Wren"]) assert.ok(h.talk(n).length > 0, n);
});
