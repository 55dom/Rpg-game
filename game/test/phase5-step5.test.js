import { test } from "node:test";
import assert from "node:assert/strict";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { ILSE_TUNING, GALEN_TUNING, OBJECTS, GULLMAW_ABILITIES, GULLMAW_HITBOXES } from "../src/data/bosses2.js";
import { hitSpec } from "../src/core/combat.js";
import { ZONES } from "../src/data/zones.js";
import { FRAGMENTS, CLAUSE } from "../src/data/lore.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { LOOKS } from "../src/runtime/rig.js";
import { SHEETS } from "../src/data/sheets.js";

const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const boss = (kind, companions = false) => {
  const w = new World({ seed: 7, companions }); w.drainEvents();
  const b = w.spawnBoss(kind, 0, 6); b.brain.aggroRange = 0; w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6; // the test is about the boss
  return { w, b };
};
const setHp = (b, frac) => b.combatant.health.set(b.combatant.health.max * frac);

test("Ilse: silence zones stop spells; her acolytes ward her; the bells silence everything until broken; then she hushes your dodges", () => {
  const { w, b } = boss("ilse");
  w.addSilence(w.player.pos.x, w.player.pos.z, 3, 100);
  w.player.mana.fill();
  w.press(Intent.Spell1);
  assert.ok(w.drainEvents().some((e) => e.type === "silenced"), "no spells in a silence zone");
  w.silences = [];
  setHp(b, 0.6); const l1 = run(w, 2);
  assert.ok(l1.some((e) => e.type === "bossPhase" && e.phase === 2));
  assert.ok(b.tags.has("WARDED")); const acolytes = w.liveEnemies.filter((e) => e.kind === "acolyte");
  assert.equal(acolytes.length, 2);
  for (const a of acolytes) a.combatant.health.set(0);
  assert.ok(run(w, 2).some((e) => e.type === "wardBroken")); assert.ok(!b.tags.has("WARDED"));
  setHp(b, 0.3); run(w, 2);
  const bells = w.liveEnemies.filter((e) => e.kind === "bell");
  assert.equal(bells.length, 3); assert.ok(w.silenceAll); assert.equal(b.boss.damageFactor, ILSE_TUNING.bellShield);
  for (const x of bells) x.combatant.health.set(0);
  assert.ok(run(w, 2).some((e) => e.type === "bellsBroken")); assert.equal(w.silenceAll, false);
  setHp(b, 0.1); run(w, 2);
  const l4 = run(w, ILSE_TUNING.hushEvery + ILSE_TUNING.hushWarn + 2);
  assert.ok(l4.some((e) => e.type === "hushWarn") && l4.some((e) => e.type === "hushDodge"));
  w.press(Intent.Dodge);
  assert.ok(w.drainEvents().some((e) => e.type === "silenced" && e.what === "dodge"), "dodges silenced: parry instead");
});

test("Galen: rings of rot hit you on the ground (not in the air) and rust your guard; the Oath holds until the vow-seals break", () => {
  const { w, b } = boss("galen");
  setHp(b, 0.6); run(w, 2);
  const p = w.player; p.pos.x = 0; p.pos.z = 0; p.combatant.invulnerableFrames = 0;
  w.addWave(b, 0, 3, { speed: 6, maxR: 5, width: 0.9, spec: GALEN_TUNING.rot, ability: { id: "Rot", tags: [], manaCost: 0 }, kind: "rot" });
  run(w, 40);
  assert.ok(p.tags.has("RUSTED"), "the ring reached Rook on the ground");
  setHp(b, 0.3); const l3 = run(w, 2);
  assert.ok(l3.some((e) => e.type === "oath"));
  const seals = w.liveEnemies.filter((e) => e.kind === "seal"); assert.equal(seals.length, 3);
  const before = b.combatant.posture.current;
  w._resolve(p, b, { spec: hitSpec({ damage: 20, posture: 50, hitstop: 1, hitstun: 10 }), ability: { id: "x", tags: [], manaCost: 0 }, hitSet: new Set(), origin: p.pos });
  assert.equal(b.combatant.posture.current, before, "no posture damage under the Oath");
  for (const s of seals) s.combatant.health.set(0);
  assert.ok(run(w, 2).some((e) => e.type === "oathBroken"));
  assert.ok(b.combatant.postureBroken, "the vow breaks: his guard with it");
});

test("Gullmaw: egg sacs from the start, the water jet sweeps the floor, it swallows an ally into a slime bubble until you burst it", () => {
  const { w, b } = boss("gullmaw", ["bas"]);
  run(w, 2);
  assert.equal(w.liveEnemies.filter((e) => e.kind === "eggsac").length, 2);
  setHp(b, 0.6); const l2 = run(w, 2);
  assert.ok(l2.some((e) => e.type === "flood")); assert.ok(b.boss.jet);
  setHp(b, 0.3); const l3 = run(w, 2);
  const bas = w.companions[0];
  assert.ok(l3.some((e) => e.type === "swallowed" && e.target === bas)); assert.ok(bas.caged?.kind === "bubble");
  bas.caged.combatant.health.set(0);
  assert.ok(run(w, 2).some((e) => e.type === "freed")); assert.equal(bas.caged, null);
  // The boss falls: everything it put on the field goes with it.
  b.combatant.health.set(0); run(w, 2);
  assert.equal(w.liveEnemies.filter((e) => e.traits.object).length, 0);
});

test("objects never move; every boss and object has a look; each boss waits in a zone, in order", () => {
  const { w } = boss("galen");
  const o = w.spawnObject("bell", 3, 3); o.knock.x = 5; run(w, 5);
  assert.equal(o.pos.x, 3); assert.equal(o.pos.z, 3);
  for (const k of ["ilse", "galen", "gullmaw", ...Object.keys(OBJECTS)]) assert.ok(LOOKS[k], k);
  const enc = (zone, id) => ZONES[zone].encounters.find((e) => e.id === id);
  assert.equal(enc("fens", "ilse").when, "$HYMN_READ");
  assert.equal(enc("tower", "galen").when, "$ILSE_DEFEATED");
  assert.ok(enc("undercroft", "gullmaw").when.includes("$GALEN_DEFEATED"));
  for (const [z, id] of [["fens", "ilse"], ["tower", "galen"], ["undercroft", "gullmaw"]]) assert.ok(enc(z, id).boss && enc(z, id).squad.length);
});

test("hidden lore: six fragments across the world; five restore a clause of the under-text", () => {
  const all = Object.values(ZONES).flatMap((z) => (z.pickups ?? []).filter((p) => p.id.startsWith("frag")));
  assert.equal(all.length, FRAGMENTS.length);
  const nodes = parseScript(WORLD_SCRIPT, "w"), f = new FlagStore();
  for (let i = 1; i <= 5; i++) { const r = new DialogueRunner(nodes, f, {}).start(`W_Frag${i}`); for (let s = r.next(); s.type !== "end"; s = r.next()); }
  assert.equal(f.get("FRAGMENTS"), 5); assert.ok(f.get("CLAUSE_1"));
  assert.ok(CLAUSE.mods.attack > 0);
});

test("Boss arenas stay sane: Gullmaw's egg sacs never walk, never spawn in a wall, never NaN the field", () => {
  const z = ZONES.undercroft, enc = z.encounters.find((e) => e.id === "gullmaw");
  const w = new World({ seed: 7, companions: ["bas", "juno"], bounds: z.bounds }); w.drainEvents();
  for (const f of w.fighters) { f.pos.x = 0; f.pos.z = 37; }
  w.spawnWave(enc.wave, enc.at);
  const sacs = w.fighters.filter((f) => f.kind === "eggsac").map((t) => ({ t, x: t.pos.x, z: t.pos.z }));
  for (const { t } of sacs) assert.ok(t.pos.z <= z.bounds.rect[3] - t.stats.radius, "egg sac inside the walls");
  run(w, 600);
  for (const f of w.fighters) assert.ok(Number.isFinite(f.pos.x + f.pos.z + f.yaw), `${f.kind} position is a number`);
  for (const { t, x, z: tz } of sacs) assert.ok(t.pos.x === x && t.pos.z === tz, "egg sacs stay put");
});

test("Gullmaw's moves: the tongue reels you in, the belly-flop sends out a splash ring, the bile weighs you down", () => {
  const { w, b } = boss("gullmaw");
  const A = GULLMAW_ABILITIES;
  assert.ok(A.Tongue.hit.pull > 0, "the tongue pulls");
  assert.ok(A.Flop.hit.unblockable && A.Flop.events.some((e) => e.key === "splash"), "the flop is unblockable and splashes");
  assert.ok(GULLMAW_HITBOXES.Bile.hit.applyTags.some(([t]) => t === "WEIGHTED"), "bile is heavy");
  b.boss.onCustom("splash", 6, A.Flop);
  assert.ok(w.drainEvents().some((e) => e.type === "wave" && e.wave.kind === "splash"));
  assert.equal(LOOKS.gullmaw.weapon, "claw", "webbed claw hands"); assert.equal(LOOKS.gullmaw.head, "toad");
  const sheet = SHEETS.gullmaw.outfit;
  assert.ok(sheet.amphibian && sheet.wings && sheet.web && sheet.boots === "bare", "bat wings on an amphibian, webbed clawed feet");
});
