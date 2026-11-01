import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { ILSE_TUNING, ILSE_PHASES, GALEN_TUNING } from "../src/data/bosses2.js";
import { EPISODE_6 } from "../src/data/story/ep6.js";
import { EPISODE_8 } from "../src/data/story/ep8.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const boss = (kind, companions = false) => {
  const w = new World({ seed: 7, companions }); w.drainEvents();
  const b = w.spawnBoss(kind, 0, 6); w.drainEvents();
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  return { w, b };
};
const setHp = (b, frac) => b.combatant.health.set(b.combatant.health.max * frac);

test("Ilse P2: two acolytes, and down she goes into the choir pit behind her: out of reach, singing psalms up out of it", () => {
  const { w, b } = boss("ilse", ["bas", "juno"]);
  const p = w.player, at0 = { x: b.pos.x, z: b.pos.z };
  setHp(b, 0.6);
  const l = run(w, 2);
  const hide = l.find((e) => e.type === "pitHide");
  assert.ok(hide, "into the pit");
  assert.ok(Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z) > Math.hypot(at0.x - p.pos.x, at0.z - p.pos.z), "behind her, away from you");
  assert.ok(b.submerged && b.boss.untouchable && b.boss.hidden);
  assert.ok(w.companions.every((c) => w._companionTarget(c) !== b), "the squad goes for the acolytes");
  // A blade on the pit does nothing.
  p.pos.x = p.prev.x = b.pos.x; p.pos.z = p.prev.z = b.pos.z - 1.6; p.yaw = 0;
  const hp = b.combatant.health.current;
  w.press(Intent.Light); run(w, 16);
  assert.equal(b.combatant.health.current, hp, "out of reach");
  const l2 = run(w, ILSE_TUNING.pit.psalmEvery + 2);
  assert.ok(l2.filter((e) => e.type === "projectile" && e.projectile.owner === b).length >= 3, "psalms up out of the pit");
});

test("…and when her acolytes fall she has to climb out, reeling (her ward with them)", () => {
  const { w, b } = boss("ilse");
  setHp(b, 0.6); run(w, 2);
  for (const a of w.liveEnemies.filter((e) => e.kind === "acolyte")) a.combatant.health.set(0);
  const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "pitRise") && l.some((e) => e.type === "wardBroken"));
  assert.ok(!b.submerged && !b.boss.untouchable && b.combatant.isStaggered, "out, and reeling");
  // The bells come up whatever: if P3 arrives first, she's out of the pit for them.
  const { w: w2, b: b2 } = boss("ilse");
  setHp(b2, 0.6); run(w2, 2); setHp(b2, 0.3); run(w2, 2);
  assert.ok(!b2.submerged && w2.silenceAll);
});

test("Ilse's Final: the Unsinging. The squad reels; Rook's grimoire won't let her, and the song breaks on its page", () => {
  assert.ok(ILSE_PHASES.at(-1).unsinging && ILSE_PHASES.at(-2).hushDodge);
  const { w, b } = boss("ilse", ["bas", "juno"]);
  setHp(b, 0.6); run(w, 2); for (const a of w.liveEnemies.filter((e) => e.kind === "acolyte")) a.combatant.health.set(0); run(w, 2);
  setHp(b, 0.3); run(w, 2); for (const x of w.liveEnemies.filter((e) => e.kind === "bell")) x.combatant.health.set(0); run(w, 2);
  setHp(b, 0.04);
  const l = run(w, 2);
  assert.ok(l.some((e) => e.type === "unsingingBegin"));
  b.combatant.takeDamage(1e6);
  assert.ok(b.alive, "she can't fall before it's sung");
  for (const c of w.companions) { c.pos.x = c.prev.x = b.pos.x + 2; c.pos.z = c.prev.z = b.pos.z; }
  const l2 = run(w, ILSE_TUNING.unsing.warn + 2);
  const u = l2.find((e) => e.type === "unsinging");
  assert.ok(u && u.dazed.length === 2, "the squad reels");
  assert.ok(l2.some((e) => e.type === "grimoireResists" && e.fighter === w.player), "the page won't forget");
  assert.ok(b.combatant.postureBroken && b.combatant.isStaggered, "and the song breaks on it");
  assert.equal(w.silenceAll, false); assert.equal(w.dodgeHush, 0);
  b.combatant.takeDamage(1e6);
  assert.ok(!b.alive, "now she can fall");
});

test("Galen's Final: one last vow on the charge, a fourth seal as far out as the hall goes; the page marks it", () => {
  const { w, b } = boss("galen");
  setHp(b, 0.6); run(w, 2); setHp(b, 0.45); run(w, GALEN_TUNING.collapse.frames + 4);
  setHp(b, 0.2); run(w, 2);
  for (const s of w.liveEnemies.filter((e) => e.kind === "seal")) s.combatant.health.set(0);
  run(w, 2);
  setHp(b, 0.05);
  const l = run(w, 3);
  assert.ok(l.some((e) => e.type === "desperate"));
  const vow = l.find((e) => e.type === "lastVow"), mark = l.find((e) => e.type === "inkMark");
  assert.ok(vow && mark && mark.target === vow.seal, "the page marks the seal you must hit");
  const chunks = w.islands.slice(1), far = Math.max(...chunks.map((c) => Math.hypot(c.x - b.pos.x, c.z - b.pos.z)));
  assert.ok(Math.abs(Math.hypot(vow.seal.pos.x - b.pos.x, vow.seal.pos.z - b.pos.z) - far) < 1, "the farthest chunk");
  assert.ok(b.boss.oath && b.boss.postureFactor === 0, "nothing staggers him again");
  vow.seal.combatant.health.set(0);
  const l2 = run(w, 2);
  assert.ok(l2.some((e) => e.type === "oathBroken") && b.combatant.postureBroken, "broken: finish him");
});

test("If the Final comes before the Oath's seals are down, the last vow waits for them", () => {
  const { w, b } = boss("galen");
  setHp(b, 0.6); run(w, 2); setHp(b, 0.45); run(w, GALEN_TUNING.collapse.frames + 4);
  setHp(b, 0.05);
  const l = run(w, 3);
  assert.equal(w.liveEnemies.filter((e) => e.kind === "seal").length, 3, "the Oath's three first");
  assert.ok(!l.some((e) => e.type === "lastVow"));
  for (const s of w.liveEnemies.filter((e) => e.kind === "seal")) s.combatant.health.set(0);
  const l2 = run(w, 3);
  assert.ok(l2.some((e) => e.type === "lastVow"));
});

test("Eps 6 and 8 say so; the pit, the Unsinging and the page's mark are drawn", () => {
  const ilse = EPISODE_6.beats.find((x) => x.id === "ilse"), galen = EPISODE_8.beats.find((x) => x.id === "galen");
  assert.match(ilse.eventHints.pitHide, /choir pit/); assert.match(ilse.eventHints.grimoireResists, /grimoire/);
  assert.match(galen.eventHints.inkMark, /bleeding ink/);
  const main = src("main.js");
  for (const ev of ["pitHide", "pitRise", "unsingingBegin", "unsinging", "grimoireResists", "lastVow", "inkMark"]) assert.match(main, new RegExp(`case "${ev}"`), ev);
});
