import { test } from "node:test";
import assert from "node:assert/strict";
import { TagSet, defineReactions, matchReactions } from "../src/core/tags.js";
import { hitSpec } from "../src/core/combat.js";
import { defineAbility } from "../src/core/abilities.js";

test("tags expire, refresh to the longer duration, and validate", () => {
  const t = new TagSet();
  t.add("MARKED", 3); t.add("MARKED", 2);
  assert.equal(t.remaining("MARKED"), 3);
  t.tick(); t.tick();
  assert.ok(t.has("MARKED"));
  t.tick();
  assert.ok(!t.has("MARKED"));
  assert.throws(() => t.add("X", 0));
});

test("reactions match target tag + incoming tag or condition, once per tag", () => {
  const table = defineReactions([
    { id: "Detonate", when: "MARKED", with: "burst", effect: { damage: 20 } },
    { id: "Other", when: "MARKED", with: "gust", effect: { damage: 5 } },
    { id: "Crush", when: "WEIGHTED", with: "BOUND", effect: { posture: 999 } },
  ]);
  const target = new TagSet(); target.add("MARKED", 10); target.add("WEIGHTED", 10);
  const hits = matchReactions(table, target, new Set(["burst", "gust", "BOUND"])).map((r) => r.id);
  assert.deepEqual(hits, ["Detonate", "Crush"], "first row per tag wins");
  assert.deepEqual(matchReactions(table, target, new Set(["slash"])), []);
  assert.throws(() => defineReactions([{ id: "A", when: "X", with: "Y" }, { id: "A", when: "X", with: "Z" }]));
  assert.throws(() => defineReactions([{ id: "B", when: "X", with: "Y", effect: { damage: -1 } }]));
});

test("hits carry tags; abilities carry surge cost", () => {
  assert.deepEqual(hitSpec({ applyTags: [["MARKED", 240]] }).applyTags, [["MARKED", 240]]);
  assert.throws(() => hitSpec({ applyTags: [["MARKED", 0]] }));
  assert.equal(defineAbility({ id: "U", startup: 1, surgeCost: 100 }).surgeCost, 100);
});
