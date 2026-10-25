import { test } from "node:test";
import assert from "node:assert/strict";
import { FlagStore } from "../src/core/flags.js";
import { Bonds } from "../src/core/bonds.js";
import { BONDS, RANK_POINTS, GIFTS, BOND_GAIN } from "../src/data/bonds.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { World, TEAM_SURGE } from "../src/sim/world.js";
import { WorldClock } from "../src/sim/weather.js";

const nodes = parseScript(WORLD_SCRIPT, "world");
/** Run a node, picking option `pick`; commands go to `onCmd`. Returns the lines. */
function run(flags, node, pick = 0, onCmd = () => {}) {
  const r = new DialogueRunner(nodes, flags, { name: "Kit", pronouns: "she" }).start(node), lines = [];
  for (let i = 0; i < 300; i++) {
    const s = r.next();
    if (s.type === "end") return lines;
    if (s.type === "line") { assert.ok(!s.speaker || CAST[s.speaker], s.speaker); lines.push(s.text); }
    if (s.type === "options") { const en = s.options.filter((o) => o.enabled); r.choose(en[Math.min(pick, en.length - 1)].index); }
    if (s.type === "command") onCmd(s);
  }
  throw new Error("runaway");
}

test("ranks climb with points; a bond can't pass a gate until its event is seen", () => {
  const f = new FlagStore(), b = new Bonds(f);
  assert.equal(b.rank("bas"), 1); assert.equal(b.title("bas"), "Stranger");
  b.add("bas", RANK_POINTS[1]); assert.equal(b.rank("bas"), 2);
  assert.equal(b.eventReady("bas"), "B_Bas_2");
  b.add("bas", 500); // stuck at the gate
  assert.equal(b.rank("bas"), 2); assert.equal(b.points("bas"), RANK_POINTS[2] - 1);
  f.set("BOND_EV_BAS_2", 1); // the scene played
  assert.equal(b.eventReady("bas"), null);
  b.add("bas", 500);
  assert.equal(b.rank("bas"), 4); assert.equal(b.eventReady("bas"), "B_Bas_4");
  // Tamsin's rank-4 scene isn't written yet: her bond waits there for a later chapter.
  f.set("BOND_EV_TAMSIN_2", 1); b.add("tamsin", 999);
  assert.equal(b.rank("tamsin"), 4); assert.ok(b.waiting("tamsin")); assert.equal(b.eventReady("tamsin"), null);
});

test("one chat and one gift a day; gifts follow likes and dislikes", () => {
  const f = new FlagStore(), b = new Bonds(f);
  assert.equal(b.talk("juno", 1).gained, BOND_GAIN.talk);
  assert.equal(b.talk("juno", 1), null, "only the first chat of the day counts");
  assert.ok(b.talk("juno", 2));
  f.set("GIFT_THREAD", 2); f.set("GIFT_WHETSTONE", 1); f.set("GIFTS_OWNED", 3);
  const loved = b.give("juno", "thread", 2);
  assert.equal(loved.react, 3); assert.equal(loved.gained, BOND_GAIN.gift[3]);
  assert.equal(b.give("juno", "thread", 2).react, -1, "one gift a day");
  assert.equal(f.get("GIFT_THREAD"), 1); assert.equal(f.get("GIFTS_OWNED"), 2);
  const hated = b.give("juno", "whetstone", 3);
  assert.equal(hated.react, 0); assert.equal(hated.gained, 0);
  assert.equal(b.give("juno", "songbook", 4).react, -2, "you can't give what you don't have");
  assert.equal(b.lovedGift("juno"), "thread");
});

test("every squadmate's data is complete; every bond event and gift menu is real dialogue", () => {
  for (const [id, bd] of Object.entries(BONDS)) {
    assert.ok(CAST[bd.cast], id);
    assert.ok(bd.lore && bd.passive && bd.lines[3] && bd.lines[0], id);
    for (const g of Object.keys(bd.likes)) assert.ok(GIFTS[g], `${id} likes unknown gift ${g}`);
    assert.ok(Object.values(bd.likes).includes(3), `${id} loves something`);
    for (const [rank, node] of Object.entries(bd.events)) {
      assert.ok(nodes[node], node);
      const f = new FlagStore(); run(f, node);
      assert.ok(f.get(`BOND_EV_${id.toUpperCase()}_${rank}`), `${node} marks itself seen`);
    }
    assert.ok(nodes[`B_Menu_${id}`] && nodes[`B_Gift_${id}`]);
    // Every squadmate at the Lighthouse can be talked to.
    assert.ok(ZONES.lighthouse.cast.some((c) => c.id === id), `${id} lives at the Lighthouse`);
  }
});

test("buying a gift at a stall and giving it: the dialogue path", () => {
  const f = new FlagStore(), b = new Bonds(f), wallet = { marks: 30 };
  const cmd = (s) => {
    if (s.name === "pay") { const n = Number(s.args[0]); const ok = wallet.marks >= n; if (ok) wallet.marks -= n; f.set("PAID", ok ? 1 : 0); }
    if (s.name === "gift") f.set("GIFT_REACT", b.give(s.args[0], s.args[1], 1).react);
  };
  run(f, "B_Shop_market", 0, cmd); // the first gift on the market stall: silver thread
  assert.equal(f.get("GIFT_THREAD"), 1); assert.equal(wallet.marks, 30 - GIFTS.thread.price);
  const lines = run(f, "B_Menu_juno", 0, cmd);
  assert.ok(lines.some((l) => l.includes("Silver")), "Juno loves it");
  assert.equal(b.points("juno"), BOND_GAIN.gift[3]);
  // With nothing in the bag, the gift option isn't offered.
  const empty = new FlagStore();
  const r = new DialogueRunner(nodes, empty, {}).start("B_Menu_bas"); const s = r.next();
  assert.equal(s.type, "options"); assert.equal(s.options.find((o) => o.text.startsWith("Give")).enabled, false);
});

test("rank 3 passives: party passives only with that companion fighting; rank 5 Team Attack spends Surge and strikes", () => {
  const f = new FlagStore(), b = new Bonds(f);
  for (const id of ["bas", "tamsin"]) { f.set(`BOND_EV_${id.toUpperCase()}_2`, 1); b.add(id, RANK_POINTS[2]); }
  assert.deepEqual(b.mods([]), { surge: 0.1 }, "Bas's passive needs Bas beside you");
  assert.deepEqual(b.mods(["bas"]), { surge: 0.1, defense: 0.08 });
  f.set("BOND_EV_BAS_4", 1); b.add("bas", 999);
  assert.ok(b.rank("bas") >= 5); assert.deepEqual(b.teamAttacks(), ["bas"]);

  const w = new World({ seed: 9, companions: ["bas"], teamAttacks: b.teamAttacks() }); w.drainEvents();
  const e = w.spawnEnemy("acolyte", 0, 3); e.brain = null; e.combatant.health.max = e.combatant.health.current = 5000; w.drainEvents();
  w.player.surge.set(80);
  assert.ok(w.callAssist("bas").ok);
  assert.equal(w.player.surge.current, 80 - TEAM_SURGE);
  const log = [];
  for (let i = 0; i < 60; i++) { w.step(); log.push(...w.drainEvents()); }
  assert.ok(log.some((x) => x.type === "teamStrike"));
  assert.ok(log.some((x) => x.type === "hit" && x.ability.id === "TeamAttack"));
  // Without enough Surge it's an ordinary assist.
  const w2 = new World({ seed: 9, companions: ["bas"], teamAttacks: ["bas"] }); w2.drainEvents();
  const e2 = w2.spawnEnemy("acolyte", 0, 3); e2.brain = null; w2.drainEvents(); w2.player.surge.set(10);
  w2.callAssist("bas"); const l2 = w2.drainEvents();
  assert.ok(!l2.some((x) => x.type === "teamAttack"));
});

test("the world clock counts days (one chat and one gift per squadmate per day)", () => {
  const c = new WorldClock({ hour: 23.9 });
  assert.equal(c.day, 1);
  c.update(20); // 20 s is 0.5 in-game hours
  assert.equal(c.day, 2);
  const d = new WorldClock(); d.load(c.toJSON()); assert.equal(d.day, 2);
});
