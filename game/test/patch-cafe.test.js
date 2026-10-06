import { test } from "node:test";
import assert from "node:assert/strict";
import { QuestLog, DONE } from "../src/core/quests.js";
import { QUESTS } from "../src/data/quests.js";
import { FlagStore } from "../src/core/flags.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES, arrivalPoint } from "../src/data/zones.js";
import { constrain, inRect } from "../src/sim/bounds.js";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { LOOKS } from "../src/runtime/rig.js";
import { SHEETS } from "../src/data/sheets.js";

function harness(marks = 100) {
  const flags = new FlagStore(), wallet = { marks }, cmds = [];
  const log = new QuestLog(QUESTS, flags, { onReward: (q, r) => { wallet.marks += r.marks ?? 0; } });
  let busy = false;
  flags.onChange(() => { if (busy) return; busy = true; try { log.update(); } finally { busy = false; } });
  const nodes = parseScript(WORLD_SCRIPT, "world");
  const talk = (node, pick = 0) => {
    const r = new DialogueRunner(nodes, flags, { name: "Kit", pronouns: "she" }).start(node);
    const lines = [];
    for (let i = 0; i < 400; i++) {
      const s = r.next();
      if (s.type === "end") return lines;
      if (s.type === "line") { assert.ok(!s.speaker || CAST[s.speaker], `unknown speaker ${s.speaker}`); lines.push(`${s.speaker ?? ""}: ${s.text}`); }
      if (s.type === "options") { const en = s.options.filter((o) => o.enabled); r.choose(en[Math.min(pick, en.length - 1)].index); }
      if (s.type === "command") {
        cmds.push(s.name);
        if (s.name === "quest" && s.args[0] === "start") log.start(s.args[1]);
        if (s.name === "pay") { const n = Number(s.args[0]); const ok = wallet.marks >= n; if (ok) wallet.marks -= n; flags.set("PAID", ok ? 1 : 0); }
      }
    }
    throw new Error("runaway");
  };
  return { flags, wallet, log, talk, cmds };
}

test("the Gilded Spoon is a real place: a door in from the Lowmarket, a door back out, and nothing stands in a wall", () => {
  const au = ZONES.aurelin, cafe = ZONES.cafe;
  const door = au.exits.find((e) => e.to === "cafe");
  assert.ok(door && cafe.exits.some((e) => e.to === "aurelin"));
  // Walking at the café's front wall from the street lands you in the door's exit, not stuck on the wall.
  const p = constrain({ x: 34, z: 4.4 }, 0.45, au.bounds);
  assert.ok(inRect(p, door.rect), "the door is reachable from the street");
  // Elsewhere along the front, the wall is solid.
  const q = constrain({ x: 37.5, z: 4.7 }, 0.45, au.bounds);
  assert.ok(q.z < 4.1, "the café's walls are solid");
  assert.ok(ZONES.home && au.exits.some((e) => e.to === "home"), "the vendor's house can be entered too");
  for (const c of cafe.cast) assert.ok(LOOKS[c.look] && SHEETS[c.look], `${c.id} has a look and a sheet`);
  assert.ok(cafe.cast.some((c) => c.id === "juno" && c.look === "junoMaid"), "Juno works shifts here");
  // The maids are each their own person: distinct looks, hair and jobs.
  const maids = ["pip", "mari", "bettany", "hazel", "odette"].map((k) => LOOKS[k]);
  assert.equal(new Set(maids.map((m) => `${m.hair}|${m.hairColor}`)).size, 5);
  const jobs = cafe.cast.filter((c) => ["pip", "mari", "bettany", "hazel", "odette"].includes(c.id)).map((c) => c.routine.steps[0].anim);
  assert.ok(new Set(jobs).size >= 4, `jobs: ${jobs}`);
  assert.ok(arrivalPoint(cafe, "aurelin"));
});

test("The Day the Café Lost Its Cake: the opening scene, clues, the reveal, and the café afterwards", () => {
  const h = harness();
  const intro = h.talk("W_CafeIntro");
  assert.ok(intro.some((l) => l.includes("The cake is missing")) && intro.some((l) => l.includes("definitely gone")));
  assert.ok(intro.some((l) => l.startsWith("Juno:")), "Juno is caught moonlighting in the opening scene");
  assert.equal(h.log.state("cake"), 1);
  assert.ok(h.cmds.includes("shot") && h.cmds.includes("move"), "it's staged: camera shots and people moving");
  // Fenwick won't give it away before you've done some asking.
  assert.ok(!h.talk("W_Fenwick").some((l) => l.includes("Is it my birthday")));
  for (const n of ["W_Pip", "W_Bettany", "W_Nib"]) h.talk(n);
  assert.equal(h.flags.get("CAKE_CLUES"), 3);
  h.talk("W_Pip"); // asking twice doesn't count twice
  assert.equal(h.flags.get("CAKE_CLUES"), 3);
  h.talk("W_JunoCafe");
  assert.equal(h.log.state("cake"), 2);
  const marks = h.wallet.marks;
  const reveal = h.talk("W_Fenwick");
  assert.ok(reveal.some((l) => l.includes("One tier is a cake")));
  assert.equal(h.log.state("cake"), DONE);
  assert.equal(h.wallet.marks, marks + QUESTS.cake.reward.marks);
  assert.ok(h.talk("W_Pip").some((l) => l.includes("don't ask where the cake went")), "lines change after the quest");
});

test("ordering at a table costs Marks and feeds you; with no Marks it's water and kindness", () => {
  const h = harness(20);
  h.flags.set("CAKE_FOUND", 1);
  h.talk("W_CafeSit", 0); // tea
  assert.equal(h.wallet.marks, 16); assert.ok(h.cmds.includes("heal"));
  const broke = harness(0); broke.flags.set("CAKE_FOUND", 1);
  assert.ok(broke.talk("W_CafeSit", 2).some((l) => l.includes("next payday")));
  const seats = ZONES.cafe.pickups.filter((p) => p.sit);
  assert.ok(seats.length >= 3 && seats.every((p) => p.marker === false));
});

test("training dummies: endless health, never die, stay on their posts, and every hit lands", () => {
  const w = new World({ seed: 5 }); w.drainEvents();
  const d = w.spawnDummy(0, 0, Math.PI); w.drainEvents();
  const p = w.player; p.pos.x = 0; p.pos.z = -1.6; p.yaw = 0;
  let hits = 0, kills = 0;
  for (let i = 0; i < 300; i++) {
    if (i % 12 === 0) w.press(i % 48 === 36 ? Intent.Heavy : Intent.Light);
    w.step();
    for (const e of w.drainEvents()) { if (e.type === "hit" && e.defender === d) hits++; if (e.type === "kill") kills++; }
  }
  assert.ok(hits >= 8, `hits ${hits}`);
  assert.equal(kills, 0);
  assert.ok(d.alive);
  assert.equal(d.combatant.health.current, d.combatant.health.max);
  assert.ok(Math.hypot(d.pos.x, d.pos.z) < 1e-6, "still on its post");
});
