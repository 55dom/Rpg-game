import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FlagStore, compileExpr } from "../src/core/flags.js";
import { Inventory } from "../src/core/inventory.js";
import { Law, canSee, witnesses, reaction, regionOf } from "../src/sim/law.js";
import { CRIMES, STEAL_SPOTS, watchStrength, missionsDone, renownTier, sentence, ZONE_REGION, LAW_REGIONS } from "../src/data/law.js";
import { Routine } from "../src/sim/routine.js";
import { World } from "../src/sim/world.js";
import { ENEMIES } from "../src/data/enemies.js";
import { BOUNTIES } from "../src/data/items.js";
import { ZONES } from "../src/data/zones.js";
import { QUESTS } from "../src/data/quests.js";
import { CAST } from "../src/data/story/cast.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript } from "../src/core/script.js";
import { COMPANIONS } from "../src/data/companions.js";
import { LOOKS } from "../src/runtime/rig.js";
import { Bonds } from "../src/core/bonds.js";
import { RANK_POINTS } from "../src/data/bonds.js";

const aurelin = regionOf("aurelin");

test("a witness sees within 3 m and inside their field of view; not behind them, not further off", () => {
  const w = { x: 0, z: 0, yaw: 0 }; // facing +z
  assert.ok(canSee(w, { x: 0, z: 2.5 }), "straight ahead");
  assert.ok(canSee(w, { x: 1.5, z: 1.5 }), "ahead and to the side");
  assert.ok(!canSee(w, { x: 0, z: -2 }), "behind");
  assert.ok(!canSee(w, { x: 0, z: 3.5 }), "too far");
  assert.ok(canSee(w, { x: 0, z: -0.4 }), "right up against them, they feel it");
  const people = [{ id: "a", ...w }, { id: "b", x: 0, z: 5, yaw: Math.PI }, { id: "c", x: 0, z: 1, yaw: 0, hidden: true }];
  assert.deepEqual(witnesses(people, { x: 0, z: 2.5 }).map((p) => p.id), ["a", "b"]);
  assert.equal(reaction({ role: "guard" }), "arrest");
  assert.equal(reaction({ role: "child" }), "flee");
  assert.equal(reaction({ role: "elder" }), "flee");
  assert.equal(reaction({ role: "civilian" }), "fight");
});

test("a seen crime: a bounty, less renown and squad reputation; a trusted face gets one warning a day for something petty", () => {
  const f = new FlagStore(), law = new Law(f);
  const r1 = law.commit("theft", aurelin, { day: 1 });
  assert.equal(r1.bounty, CRIMES.theft.bounty);
  assert.equal(f.get("RENOWN_AURELIN"), CRIMES.theft.renown);
  assert.equal(f.get("REP_SQUAD"), CRIMES.theft.squad);
  f.set("RENOWN_AURELIN", 20); f.set("BOUNTY_AURELIN", 0);
  assert.equal(law.commit("pickpocket", aurelin, { byGuard: true, day: 2 }).warned, true, "a trusted Lantern: a warning");
  assert.equal(law.bounty(aurelin), 0);
  assert.equal(law.commit("pickpocket", aurelin, { byGuard: true, day: 2 }).warned, false, "only once a day");
  assert.equal(law.commit("assault", aurelin, { byGuard: true, day: 3 }).warned, false, "assault is never petty");
  const lh = regionOf("lighthouse");
  law.commit("theft", lh, { day: 3 });
  assert.equal(f.get("BOUNTY_LIGHTHOUSE"), 0, "the squad doesn't put a bounty on you");
  assert.equal(regionOf("undercroft"), null, "no law under the city");
});

test("paying, and serving time: the bounty clears; carried in costs a fine, coming quietly doesn't", () => {
  const f = new FlagStore(), law = new Law(f), inv = new Inventory({ marks: 100 });
  f.set("BOUNTY_AURELIN", 80); law.setWanted(aurelin);
  assert.ok(law.wanted(aurelin));
  assert.ok(!law.pay(aurelin, new Inventory({ marks: 10 })), "can't afford it");
  assert.ok(law.pay(aurelin, inv));
  assert.equal(inv.marks, 20); assert.equal(law.bounty(aurelin), 0); assert.ok(!law.wanted(aurelin));
  f.set("BOUNTY_AURELIN", 60);
  const quiet = law.serve(aurelin, new Inventory({ marks: 100 }), { surrendered: true });
  assert.equal(quiet.fine, 0); assert.equal(quiet.hours, sentence(60, { surrendered: true }).hours);
  f.set("BOUNTY_AURELIN", 60);
  const inv2 = new Inventory({ marks: 100 }), carried = law.serve(aurelin, inv2, { surrendered: false });
  assert.equal(carried.fine, 30); assert.equal(inv2.marks, 70); assert.equal(law.bounty(aurelin), 0);
  assert.equal(f.get("TIMES_JAILED"), 2);
});

test("the Watch grows with missions and episodes, and with Luke; standing sets shop prices", () => {
  const f = new FlagStore();
  assert.equal(watchStrength(f), 0);
  for (const n of [19, 20, 21, 22]) f.set(`EP${n}_PAID`, 1);
  f.set("Q_FRIED", 999); f.set("BANDITS_CLEARED", 1);
  assert.equal(missionsDone(f), 6);
  assert.equal(watchStrength(f), 3);
  f.set("LUKE_GUARD", 1);
  assert.equal(watchStrength(f), 6, "half the town's young men signed up after Luke");
  for (let n = 1; n <= 28; n++) f.set(`EP${n}_PAID`, 1);
  assert.equal(watchStrength(f), 8, "capped");
  assert.equal(renownTier(45).price, 0.8); assert.equal(renownTier(0).price, 1); assert.equal(renownTier(-50).name, "Outlaw");
});

test("someone standing still behind a townsperson isn't noticed (pickpockets count on it); in front of them, they turn to look", () => {
  const spec = { steps: [{ do: "idle", at: [0, 0], face: 0, dur: [5, 5] }] };
  const behind = new Routine(spec, () => 0.5), front = new Routine(spec, () => 0.5);
  const b = behind.update({ pos: { x: 0, z: 0 }, yaw: 0, player: { x: 0, z: -1, moving: false }, dt: 0.1 });
  const f = front.update({ pos: { x: 0, z: 0 }, yaw: 0, player: { x: 0, z: 1.5, moving: false }, dt: 0.1 });
  assert.notEqual(b.activity, "attend");
  assert.equal(f.activity, "attend");
});

test("Rook's blade lands on townsfolk too (a softHit), and the Watch and street fighters fight, but aren't loot", () => {
  const w = new World({ seed: 5 }); w.drainEvents();
  const p = w.player;
  w.softTargets = [{ id: "kid", pos: { x: p.pos.x, y: 0, z: p.pos.z + 1.4 }, radius: 0.42, height: 1.9 }]; // right in front of Rook
  p.yaw = 0; w.press(1);
  let hit = null;
  for (let i = 0; i < 40 && !hit; i++) { w.step(); hit = w.drainEvents().find((e) => e.type === "softHit"); }
  assert.ok(hit, "the slash reached them");
  assert.equal(hit.target.id, "kid");
  for (const k of ["guard", "brawler"]) {
    assert.ok(ENEMIES[k], k); assert.equal(BOUNTIES[k], 0, `${k} pays nothing`);
    const f = w.spawnEnemy(k, 3, 3); assert.ok(f.alive);
  }
  assert.ok(COMPANIONS.luke && LOOKS.luke && LOOKS.lukeHome && LOOKS.elsie && LOOKS.sergeant, "Luke fights beside you once, and everyone has a look");
});

test("free roam passes each zone's exits, pickups and fights to the walk-around (a comment once swallowed them)", () => {
  const src = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  const code = src.split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n"); // comments out
  const call = code.slice(code.indexOf("const out = await this.explore({ id: `zone-${id}`"), code.indexOf("const out = await this.explore({ id: `zone-${id}`") + 600);
  for (const k of ["exits: zone.exits", "pickups: zone.pickups", "encounters: zone.encounters"]) assert.ok(call.includes(k), k);
});

test("the law's places, people and words: steal spots sit in real zones near their owners, every node and speaker exists", () => {
  const nodes = parseScript(WORLD_SCRIPT, "world");
  for (const [zone, spots] of Object.entries(STEAL_SPOTS)) {
    const z = ZONES[zone]; assert.ok(z, zone); assert.ok(ZONE_REGION[zone], `${zone} has a law`);
    const people = [...z.cast, ...(z.extras ?? [])];
    for (const s of spots) {
      const owner = people.find((c) => c.id === s.owner);
      assert.ok(owner, `${zone}/${s.id}: owner ${s.owner}`);
      assert.ok(Math.hypot(owner.x - s.x, owner.z - s.z) < 12, `${s.id} is near ${s.owner}'s spot`);
    }
  }
  for (const n of ["L_Arrest", "L_Jailed", "L_Sergeant", "L_Drunk", "L_Board", "W_Patrol", "W_Recruit", "W_Admirer", "W_Watchman", "W_Elsie", "W_Luke", "W_LukeHome", "W_ElsieHome", "W_LukeChest"]) assert.ok(nodes[n], n);
  for (const k of ["Watch", "Sergeant", "Drunk", "Luke", "Elsie"]) assert.ok(CAST[k], k);
  for (const z of Object.values(ZONES)) for (const e of z.exits) if (e.when) compileExpr(e.when);
  assert.ok(ZONES.watchhouse.arrivals.cell && ZONES.watchhouse.intro.node === "L_Jailed", "the cells");
  assert.ok(ZONES.fens.exits.some((e) => e.to === "fenhome" && e.when === "$LUKE_HOME_OPEN"), "Luke's door opens with the story");
  assert.ok(QUESTS.luke.stages.length === 5 && QUESTS.lukehome.stages.length === 2);
  for (const r of Object.values(LAW_REGIONS)) assert.ok(r.renown, r.id);
});

test("squadmates who catch you think less of you, but never drop a rank", () => {
  const f = new FlagStore(), b = new Bonds(f);
  b.add("juno", RANK_POINTS[1] + 6);
  const rank = b.rank("juno");
  assert.ok(b.lose("juno", 4) === 4);
  b.lose("juno", 100);
  assert.equal(b.rank("juno"), rank);
  assert.equal(b.points("juno"), RANK_POINTS[rank - 1]);
});
