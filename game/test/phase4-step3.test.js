import { test } from "node:test";
import assert from "node:assert/strict";
import { QuestLog, DONE, squadRank, validateQuests } from "../src/core/quests.js";
import { QUESTS } from "../src/data/quests.js";
import { FlagStore } from "../src/core/flags.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";

/** A tiny stand-in for the story player: flags, quests, marks, and the dialogue commands quests use. */
function harness(marks = 100) {
  const flags = new FlagStore();
  const wallet = { marks };
  const events = [];
  const log = new QuestLog(QUESTS, flags, { onReward: (q, r) => { wallet.marks += r.marks ?? 0; }, onEvent: (e) => events.push(e.type) });
  let busy = false;
  flags.onChange(() => { if (busy) return; busy = true; try { log.update(); } finally { busy = false; } });
  const nodes = parseScript(WORLD_SCRIPT, "world");
  const talk = (node, pick = 0) => {
    const r = new DialogueRunner(nodes, flags, { name: "Kit", pronouns: "she" }).start(node);
    for (let i = 0; i < 200; i++) {
      const s = r.next();
      if (s.type === "end") return;
      if (s.type === "line") assert.ok(!s.speaker || CAST[s.speaker], s.speaker);
      if (s.type === "options") r.choose(s.options.filter((o) => o.enabled)[Math.min(pick, s.options.filter((o) => o.enabled).length - 1)].index);
      if (s.type === "command") {
        if (s.name === "quest" && s.args[0] === "start") log.start(s.args[1]);
        if (s.name === "pay") { const n = Number(s.args[0]); const ok = wallet.marks >= n; if (ok) wallet.marks -= n; flags.set("PAID", ok ? 1 : 0); }
      }
    }
    throw new Error("runaway");
  };
  return { flags, wallet, log, talk, events };
}

test("quest data is valid; every quest-giver talk node exists", () => {
  validateQuests(QUESTS);
  const nodes = parseScript(WORLD_SCRIPT, "world");
  for (const n of ["W_Dagrun", "W_Cook", "W_Gossip", "W_Guard", "W_Crier", "W_Vendor", "W_Kid"]) assert.ok(nodes[n], n);
  assert.throws(() => validateQuests({ x: { title: "X", stages: [{ text: "a", done: "nonsense words" }] } }));
});

test("Something Fried: Dagrun asks, the cook sells (5 marks), Dagrun eats; rewards merit and marks", () => {
  const h = harness(100);
  h.talk("W_Dagrun", 0);
  assert.equal(h.log.state("fried"), 1);
  h.talk("W_Cook", 0);
  assert.equal(h.wallet.marks, 95);
  assert.equal(h.log.state("fried"), 2);
  h.talk("W_Dagrun");
  assert.ok(h.log.isDone("fried"));
  assert.equal(h.wallet.marks, 95 + QUESTS.fried.reward.marks);
  assert.equal(h.flags.get("MERIT"), 15);
  assert.deepEqual(h.events, ["questStart", "questStage", "questDone"]);
});

test("Something Fried: broke at the cart means no fish, and the quest waits", () => {
  const h = harness(2);
  h.talk("W_Dagrun", 0); h.talk("W_Cook", 0);
  assert.equal(h.log.state("fried"), 1);
  assert.equal(h.wallet.marks, 2);
});

test("The Village Nobody Remembers: three witnesses in any order, then report back; renown unlocks the guard's salute", () => {
  const h = harness();
  h.talk("W_Gossip", 0);
  assert.equal(h.log.state("rumors"), 1);
  h.talk("W_Crier"); h.talk("W_Crier"); // asking twice doesn't count twice
  assert.equal(h.flags.get("ASKED_FENS"), 1);
  h.talk("W_Vendor", 0); h.talk("W_Guard");
  assert.equal(h.log.state("rumors"), 2);
  h.talk("W_Gossip");
  assert.ok(h.log.isDone("rumors"));
  assert.equal(h.flags.get("RENOWN_AURELIN"), 10);
  const lines = [];
  const r = new DialogueRunner(parseScript(WORLD_SCRIPT, "w"), h.flags, {}).start("W_Guard");
  for (let s = r.next(); s.type !== "end"; s = r.next()) if (s.type === "line") lines.push(s.text);
  assert.ok(lines.some((t) => t.includes("salutes")));
});

test("A Lantern for the Kid: the pickup is only there while the quest wants it", () => {
  const h = harness();
  const pk = ZONES.aurelin.pickups.find((p) => p.flag === "TOY_FOUND");
  const showing = () => h.log.isActive("toy") && !h.flags.get("TOY_FOUND");
  h.talk("W_Kid", 2);
  assert.equal(h.log.state("toy"), 1);
  assert.ok(showing());
  h.flags.set(pk.flag, 1); // picked up
  assert.equal(h.log.state("toy"), 2);
  h.talk("W_Kid");
  assert.equal(h.log.state("toy"), DONE);
  assert.ok(h.log.entries().every((e) => e.done));
});

test("squad rank climbs with merit, from last of seven", () => {
  assert.deepEqual(squadRank(0), { place: 7, next: 30 });
  assert.equal(squadRank(30).place, 6);
  assert.equal(squadRank(129).place, 4);
  assert.deepEqual(squadRank(999), { place: 1, next: null });
});
