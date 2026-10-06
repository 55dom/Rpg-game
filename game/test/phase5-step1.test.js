import { test } from "node:test";
import assert from "node:assert/strict";
import { Intent } from "../src/core/input.js";
import { World } from "../src/sim/world.js";
import { PAGES } from "../src/data/pages.js";
import { Progress, pageLevel, addMods } from "../src/core/progress.js";
import { SKILLS, xpToNext, MAX_LEVEL, XP_BY_KIND } from "../src/data/skills.js";
import { ROOK_STATS } from "../src/data/rook.js";

const run = (w, n, log) => { for (let i = 0; i < n; i++) { w.step(); const ev = w.drainEvents(); if (log) log.push(...ev); } };
const place = (w, kind, x, z, hp = 5000) => { const e = w.spawnEnemy(kind, x, z); e.brain = null; e.combatant.health.max = e.combatant.health.current = hp; e.yaw = Math.PI; w.drainEvents(); return e; };
/** Cast Gale Cutter at a dummy once; returns the hit events. */
const cast = (w, e) => {
  const p = w.player, log = [];
  e.pos = { x: 0, y: 0, z: 0 }; e.grounded = true; e.vel.y = 0; e.combatant.reset();
  p.pos = { x: 0, y: 0, z: -4 }; p.yaw = 0; p.mana.fill();
  w.press(Intent.Spell1); run(w, 50, log);
  return log;
};

test("XP levels Rook up on a rising curve; each level gives a skill point and modest stats", () => {
  const pr = new Progress();
  assert.equal(pr.level, 1);
  assert.ok(xpToNext(10) > xpToNext(2) * 3, "later levels take longer");
  assert.equal(pr.gainXp(xpToNext(1) - 1), 0);
  assert.equal(pr.gainXp(1), 1);
  assert.equal(pr.level, 2); assert.equal(pr.points, 1); assert.equal(pr.xp, 0);
  pr.gainXp(xpToNext(2) + xpToNext(3) + 5); // two levels at once
  assert.equal(pr.level, 4); assert.equal(pr.points, 3); assert.equal(pr.xp, 5);
  const m = pr.mods;
  assert.ok(m.health > 0 && m.health < 30 && m.attack > 0 && m.attack < 0.05, "growth is modest");
  const capped = new Progress({ level: MAX_LEVEL });
  assert.equal(capped.gainXp(99999), 0); assert.equal(capped.level, MAX_LEVEL);
  // An episode's worth of fighting (about 25 foes and a boss) is a few levels, not ten.
  const ep = new Progress(); ep.gainXp(XP_BY_KIND.acolyte * 10 + XP_BY_KIND.hound * 10 + XP_BY_KIND.cantor * 5 + XP_BY_KIND.hask);
  assert.ok(ep.level >= 3 && ep.level <= 6, `level ${ep.level}`);
});

test("the Grimoire Tree: points, the node above, a minimum level, and page level III for a page's last node", () => {
  const pr = new Progress({ level: 1, points: 0 });
  assert.equal(pr.blocker("Spell1.1"), "1 point");
  pr.points = 5;
  assert.equal(pr.blocker("Spell1.2"), "needs Keen Edge");
  assert.ok(pr.learn("Spell1.1"));
  assert.equal(pr.learn("Spell1.1"), false, "learned once");
  assert.equal(pr.blocker("Spell1.2"), "level 4");
  pr.level = 8;
  assert.ok(pr.learn("Spell1.2"));
  assert.equal(pr.blocker("Spell1.3"), "page level III");
  pr.pages.Spell1.xp = PAGES.Spell1.hitsToEvolve;
  assert.ok(pr.learn("Spell1.3"));
  assert.equal(pr.points, 1);
  const b = pr.pageBonus("Spell1");
  assert.ok(Math.abs(b.dmg - (1 + 0.15 + 0.25 + 0.1)) < 1e-9, "skills plus two page levels"); // III = +10%
  assert.equal(b.mana, 0.75);
  assert.ok(pr.learn("margin.1"));
  assert.equal(pr.mods.health, Math.round(5 * 7) + SKILLS["margin.1"].effect.health);
});

test("pages level I–V with use; III is evolution; the record saves and loads", () => {
  const n = PAGES.Spell1.hitsToEvolve;
  assert.deepEqual([0, n / 2, n, n * 2.5, n * 4.5].map((x) => pageLevel("Spell1", x)), [1, 2, 3, 4, 5]);
  const pr = new Progress({ level: 5, xp: 12, points: 2, skills: ["Spell1.1", "nope"], pages: { Spell1: { xp: n, branch: null }, Spell2: { xp: 3, branch: "B" } } });
  assert.equal(pr.pages.Spell1.ready, true, "loaded at III without a branch: ready to evolve");
  const back = new Progress(JSON.parse(JSON.stringify(pr.toJSON())));
  assert.deepEqual(back.toJSON(), pr.toJSON());
  assert.deepEqual([...back.skills], ["Spell1.1"], "unknown skills are dropped");
  assert.deepEqual(addMods({ attack: 0.1, health: 10 }, { attack: 0.05, mana: 3 }), { attack: 0.15000000000000002, health: 10, mana: 3 });
});

test("in a fight: mastery keeps counting past evolution, an evolved page stays evolved in the next world, and bonuses apply", () => {
  const pr = new Progress({ level: 10, points: 10 });
  let w = new World({ seed: 3, progress: pr }); w.drainEvents();
  let e = place(w, "acolyte", 0, 0);
  const levels = [];
  for (let i = 0; i < PAGES.Spell1.hitsToEvolve; i++) levels.push(...cast(w, e).filter((x) => x.type === "pageLevel").map((x) => x.level));
  assert.deepEqual(levels, [2, 3]);
  assert.ok(pr.pages.Spell1.ready, "the shared record knows");
  assert.ok(w.evolvePage("Spell1", "B"));
  cast(w, e);
  assert.equal(pr.pages.Spell1.xp, PAGES.Spell1.hitsToEvolve + 1, "an evolved page still earns mastery");
  // A new fight (the next episode) starts with the evolved page on its button.
  w = new World({ seed: 3, progress: pr }); w.drainEvents();
  assert.equal(w.loadout.Spell1.id, "GaleLance");
  // Skills lower the mana cost and raise the damage of that page.
  const plain = new World({ seed: 3 }); plain.drainEvents();
  const base = plain.loadout.Spell1.manaCost;
  pr.learn("Spell1.1"); pr.learn("Spell1.2"); w.applyLoadout();
  assert.equal(w.loadout.Spell1.manaCost, Math.round(base * 0.75));
  e = place(w, "acolyte", 0, 0);
  const pe = place(plain, "acolyte", 0, 0);
  plain.pages.Spell1.branch = "B"; plain.loadout = { ...plain.loadout, Spell1: PAGES.Spell1.branches[1].ability }; plain.applyLoadout();
  const dmg = (log) => log.find((x) => x.type === "hit")?.result?.healthDamage ?? log.find((x) => x.type === "hit")?.damage;
  const hb = dmg(cast(w, e)), hp = dmg(cast(plain, pe));
  if (hb != null && hp != null) assert.ok(hb > hp * 1.2, `${hb} vs ${hp}`);
  else assert.ok(e.combatant.health.current < pe.combatant.health.current, "the trained page hits harder");
});

test("level growth reaches Rook's stats through the world's mods", () => {
  const pr = new Progress({ level: 11 });
  const w = new World({ mods: pr.mods, progress: pr });
  assert.equal(w.player.stats.maxHealth, ROOK_STATS.maxHealth + 50);
  assert.equal(w.player.mana.max, ROOK_STATS.maxMana + 10);
});
