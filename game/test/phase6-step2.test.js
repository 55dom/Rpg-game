import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../src/sim/world.js";
import { EPISODE_19 } from "../src/data/story/ep19.js";
import { EPISODE_20, EP20_SCRIPT } from "../src/data/story/ep20.js";
import { EPISODE_21, EP21_SCRIPT } from "../src/data/story/ep21.js";
import { EPISODE_22, EP22_SCRIPT } from "../src/data/story/ep22.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { ZONES, IRONHOLD_LAYOUT } from "../src/data/zones.js";
import { ENEMIES } from "../src/data/enemies.js";
import { COMPANIONS } from "../src/data/companions.js";
import { VARKA_TUNING } from "../src/data/ashfall.js";
import { LOOKS } from "../src/runtime/rig.js";
import { sheetFor } from "../src/data/sheets.js";

const nodes = { ...parseScript(WORLD_SCRIPT, "w"), ...parseScript(EP20_SCRIPT, "e20"), ...parseScript(EP21_SCRIPT, "e21"), ...parseScript(EP22_SCRIPT, "e22") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, {}).start(node), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s.text); if (s.type === "options") r.choose(pick); }
  return { f, lines };
};
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const tough = (w) => { w.player.combatant.health.max = w.player.combatant.health.current = 1e6; };

test("Eps 20–22 are whole episodes, chained from Ep 19, each opening Arc 3 from the menu with the right story behind it", () => {
  for (const ep of [EPISODE_20, EPISODE_21, EPISODE_22]) {
    validateEpisode(ep, nodes);
    assert.equal(ep.unlockAt, 5); assert.equal(ep.setup.CAL_STATE, 1);
    for (const b of ep.beats) for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node);
  }
  const next = (ep) => ep.beats.find((b) => b.type === "preview").nextEpisode;
  assert.deepEqual([next(EPISODE_19), next(EPISODE_20), next(EPISODE_21)], ["ep20", "ep21", "ep22"]);
  assert.deepEqual(EPISODE_20.world.companions, ["bas", "brannoc"], "Brannoc fights beside you");
  assert.ok(EPISODE_22.beats.some((b) => b.type === "fight" && b.wave.includes("varka")));
});

test("the Ashfall Dominion: a Legionary's Brand can't be blocked and burns; SCORCHED ticks but never finishes anyone", () => {
  const L = ENEMIES.ashLegion, M = ENEMIES.ashMage;
  assert.ok(L.abilities.Brand.hit.unblockable && L.abilities.Brand.hit.applyTags.some(([t]) => t === "SCORCHED"));
  assert.ok(M.traits.ranged && M.abilities.Thunderhead);
  const w = new World({ seed: 2 }); w.drainEvents();
  w.player.combatant.health.set(5); w.player.tags.add("SCORCHED", 600);
  const log = run(w, 240);
  assert.ok(log.some((e) => e.type === "burn"), "it burns");
  assert.equal(w.player.combatant.health.current, 1, "down to 1, never 0");
});

test("Thunderheads: a ring first, then the bolt; step out of the ring and it misses", () => {
  const w = new World({ seed: 2 }); w.drainEvents(); tough(w);
  const mage = w.spawnEnemy("ashMage", 0, 6, 0); w.drainEvents();
  const hp = () => w.player.combatant.health.current;
  w.addStrike(mage, w.player.pos.x, w.player.pos.z, { delay: 30, r: 1.6, spec: VARKA_TUNING.thunder, ability: mage.abilities?.Thunderhead ?? ENEMIES.ashMage.abilities.Thunderhead, kind: "thunder" });
  assert.ok(w.drainEvents().some((e) => e.type === "strikeWarn"));
  const h0 = hp(); run(w, 32); assert.ok(hp() < h0, "standing in it hurts");
  w.addStrike(mage, w.player.pos.x, w.player.pos.z, { delay: 30, r: 1.6, spec: VARKA_TUNING.thunder, ability: ENEMIES.ashMage.abilities.Thunderhead });
  w.player.pos.x = w.player.prev.x = w.player.pos.x + 4; const h1 = hp(); run(w, 32);
  assert.equal(hp(), h1, "out of the ring: nothing");
});

test("Brannoc joins by name with Pledged Strike; the default squad is still Bas and Juno", () => {
  assert.equal(COMPANIONS.brannoc.assist.id, "PledgedStrike");
  assert.deepEqual(new World({ seed: 1, companions: true }).companions.map((c) => c.kind), ["bas", "juno"]);
  assert.deepEqual(new World({ seed: 1, companions: ["bas", "brannoc"] }).companions.map((c) => c.kind), ["bas", "brannoc"]);
  for (const k of ["ashLegion", "ashMage", "varka", "engine", "brannocSpar"]) assert.ok(LOOKS[k], k);
  assert.equal(sheetFor("brannocSpar"), sheetFor("brannoc"));
});

test("Varka Ironsong: the engine fires, rolls down a warned lane, breaks into falling wreckage; she can't die before the Final Vow, which is Brannoc's", () => {
  const w = new World({ seed: 3, companions: ["bas", "brannoc"] }); w.drainEvents(); tough(w);
  const b = w.spawnBoss("varka", 0, 6); w.drainEvents();
  run(w, 3);
  assert.ok(b.boss.engine?.alive && b.boss.engine.kind === "engine", "the Ironsong stands behind her");
  const e = b.boss.engine; e.combatant.health.max = e.combatant.health.current = 1e6; // the squad can break it; here it must live to roll
  b.combatant.health.set(b.combatant.health.max * 0.6);
  const l2 = run(w, (VARKA_TUNING.rollEvery + VARKA_TUNING.rollWarn + VARKA_TUNING.rollFrames) * 2); // her clock pauses in hitstop
  const roll = l2.find((e) => e.type === "engineRoll");
  assert.ok(roll && roll.warn === VARKA_TUNING.rollWarn, "a lane is marked first");
  assert.ok(l2.some((e) => e.type === "engineStop"));
  b.combatant.health.set(b.combatant.health.max * 0.3);
  const l3 = run(w, 200);
  assert.ok(l3.some((e) => e.type === "engineBreaks") && !b.boss.engine.alive, "it breaks apart");
  assert.ok(l3.some((e) => e.type === "strikeWarn" && e.strike.kind === "debris"), "wreckage falls");
  b.combatant.takeDamage(1e6); // a hit that would kill her: it doesn't
  assert.ok(b.alive && b.combatant.health.current > 0, "the last blow isn't yours");
  const l5 = run(w, 4);
  const vow = l5.find((e) => e.type === "finalVow");
  assert.ok(vow && vow.by.kind === "brannoc", "Brannoc's Final Vow");
  assert.ok(!b.alive && l5.some((e) => e.type === "kill" && e.defender === b && e.attacker.kind === "brannoc"));
  assert.ok(w.fighters.every((f) => Number.isFinite(f.pos.x + f.pos.z)));
});

test("Ironhold: the battle arena at the origin is clear; the wall has a gate; it's on the map once the summons comes", () => {
  const z = ZONES.ironhold, L = IRONHOLD_LAYOUT;
  assert.equal(z.mapWhen, "$HAS_SUMMONS");
  for (const s of z.bounds.solids) {
    const near = s.circle ? Math.hypot(s.circle[0], s.circle[1]) - s.circle[2] : Math.hypot(Math.max(s.box[0], Math.min(0, s.box[2])), Math.max(s.box[1], Math.min(0, s.box[3])));
    assert.ok(near > 17.5, "nothing inside the story arena");
  }
  const gate = z.bounds.solids.filter((s) => s.box && s.box[1] < L.wallZ && s.box[3] > L.wallZ);
  assert.equal(gate.length, 2, "two wall halves");
  assert.ok(gate[0].box[2] <= -L.gateHalf + 0.01 && gate[1].box[0] >= L.gateHalf - 0.01, "with a gate between");
  assert.equal(z.cast.find((c) => c.id === "brannoc").when, "not $BRANNOC_DEAD");
  assert.equal(z.pickups.find((p) => p.id === "ironMemorial").show, "$BRANNOC_DEAD");
});

test("the Oath of Steel and the Final Vow: your vow is remembered; he dies; his wick is ash; Cal's is not", () => {
  for (const [pick, vow] of [[0, 1], [1, 2], [2, 3]]) assert.equal(play("Ep21_Dawn", new FlagStore(), pick).f.get("BRANNOC_VOW"), vow);
  const lines = (v) => { const f = new FlagStore(); f.set("BRANNOC_VOW", v); return play("Ep22_Vow", f).lines.join(" "); };
  assert.ok(lines(1).includes("step back") && lines(2).includes("behind") && lines(3).includes("truth"));
  const after = new FlagStore(); after.set("BRANNOC_VOW", 1); play("Ep22_Vow", after);
  assert.equal(after.get("BRANNOC_DEAD"), 1);
  after.set("CAL_STATE", 1);
  assert.ok(play("W_Hall_Brannoc", after).lines.some((l) => l.includes("ash")), "Brannoc's wick: ash");
  assert.ok(play("W_Hall_CalLantern", after).lines.some((l) => l.includes("wick still stands")), "Cal's: whole");
});
