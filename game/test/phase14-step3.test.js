// Phase 14 Step 3: AI as GDD §21.5 writes it: a finite state machine per enemy "+ utility scoring for choosing *which*
// attack", the attack tokens, "AI LOD: full logic within 25m; reduced tick rate (5 Hz) within 60m; dormant beyond",
// companions on the same framework; and §21.7's "Max 8 active in combat (mobile: 5)". §21.4: quests don't know about
// combat; they read the flags.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { defineAbility } from "../src/core/abilities.js";
import { hitSpec } from "../src/core/combat.js";
import { seededRandom } from "../src/core/timing.js";
import { AttackOption, AttackTokenPool, EnemyBrain, UTILITY, utilityOf } from "../src/core/ai.js";
import { World, AI_LOD } from "../src/sim/world.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const quick = defineAbility({ id: "Quick", startup: 8, active: 2, recovery: 10, hit: hitSpec({ damage: 5 }) });
const breaker = defineAbility({ id: "Breaker", startup: 24, active: 4, recovery: 24, hit: hitSpec({ damage: 20, unblockable: true }) });
const p = (o) => ({ frame: 0, hasTarget: true, distance: 2, isStaggered: false, isDead: false, abilityRunning: false, target: null, ...o });

test("utility: the moment decides which attack, the weights still matter", () => {
  const q = new AttackOption(quick, 0, 4, 2), b = new AttackOption(breaker, 0, 4, 2);
  assert.equal(utilityOf(q, p({})), utilityOf(b, p({})), "nothing to tell them apart: the weights alone");
  const guard = p({ target: { guarding: true } });
  assert.ok(utilityOf(b, guard) > utilityOf(q, guard) * 3, "an unblockable one into a raised guard");
  const open = p({ target: { opening: true } });
  assert.equal(utilityOf(q, open) / utilityOf(b, open), UTILITY.punish, "a quick one into an opening");
  const air = p({ target: { airborne: true } });
  assert.ok(utilityOf(b, air) < utilityOf(q, air), "not a slow one at someone in the air");
  assert.equal(utilityOf(q, p({}), q), utilityOf(q, p({})) * UTILITY.repeat, "not the same one twice running");
  const near = new AttackOption(quick, 0, 2, 1), far = new AttackOption(quick, 2, 6, 1);
  assert.ok(utilityOf(near, p({ distance: 1 })) > utilityOf(far, p({ distance: 2.1 })), "best where its reach fits");
});

test("an enemy facing a raised guard reaches for its unblockable; facing an opening, its quickest", () => {
  const share = (target) => {
    let n = 0;
    for (let i = 0; i < 400; i++) {
      const br = new EnemyBrain("e" + i, new AttackTokenPool(1), [new AttackOption(quick, 0, 4, 3), new AttackOption(breaker, 0, 4, 1)], seededRandom(i + 7));
      if (br.think(p({ target })).attack === breaker) n++;
    }
    return n / 400;
  };
  const plain = share(null), guarded = share({ guarding: true }), opening = share({ opening: true });
  assert.ok(plain > 0.18 && plain < 0.32, `about a quarter by weight (${plain})`);
  assert.ok(guarded > 0.45, `more than half into a guard (${guarded})`);
  assert.ok(opening < plain, `less into an opening (${opening})`);
  assert.match(src("sim/world.js"), /t\.guarding = !!p\.combatant\.blocking; t\.opening = p\.combatant\.isStaggered \|\| \(p\.runner\.isRunning && p\.runner\.phase === "Recovery"\); t\.airborne = !p\.grounded;/);
  assert.match(src("core/ai.js"), /const pick = this\.last = pickByUtility\(ready, t, this\.last \?\? null, this\.rng, this\._scores \?\?= \[\]\);/, "the squad picks the same way (the 'ally' profile)");
});

/** n acolytes in a ring round Rook, `r` metres out; brains counted as they think. */
function ring(n, r, o = {}) {
  const w = new World({ seed: 5, companions: false, bounds: { radius: 200 }, ...o }); w.drainEvents();
  const es = [], c = w.player.pos;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; es.push(w.spawnEnemy("acolyte", c.x + Math.sin(a) * r, c.z + Math.cos(a) * r, i)); }
  w.drainEvents();
  for (const e of es) { e.thinks = 0; const t = e.brain.think.bind(e.brain); e.brain.think = (q) => { e.thinks++; return t(q); }; }
  return { w, es };
}

test("AI LOD: every frame within 25 m, five times a second out to 60 m, dormant beyond", () => {
  for (const [r, lo, hi] of [[10, 60, 60], [40, 4, 6], [70, 0, 0]]) {
    const { w, es } = ring(1, r);
    for (let i = 0; i < 60; i++) w.step();
    assert.ok(es[0].thinks >= lo && es[0].thinks <= hi, `${r} m: ${es[0].thinks} thoughts a second`);
  }
  assert.deepEqual([AI_LOD.full, AI_LOD.reduced, 60 / AI_LOD.every], [25, 60, 5]);
});

test("at most eight fight at once (five on a phone); the rest hold their ground, and step in as places open", () => {
  for (const [cap, opts] of [[8, {}], [5, { activeCap: AI_LOD.activeMobile }]]) {
    const { w, es } = ring(12, 9, opts);
    w.player.combatant.invulnerableFrames = 1e6;
    for (let i = 0; i < 30; i++) w.step();
    const active = es.filter((e) => !e.aiHeld), held = es.filter((e) => e.aiHeld);
    assert.equal(active.length, cap, `${cap} active`); assert.equal(held.length, 12 - cap);
    for (const e of held) { assert.equal(e.thinks, 0, "a held one doesn't think"); assert.ok(!w.tokens.holds(e.brain.id), "and holds no token"); }
    // One of the active falls: the nearest of the held steps in.
    const down = active[0]; down.combatant.health.current = 0; assert.ok(!down.alive);
    for (let i = 0; i < 3; i++) w.step();
    assert.equal(es.filter((e) => e.alive && !e.aiHeld).length, cap, "a place opened, a place filled");
  }
  const main = src("main.js");
  assert.equal((main.match(/activeCap: mobile \? AI_LOD\.activeMobile : AI_LOD\.active/g) ?? []).length, 2, "both worlds the game makes");
});

test("§21.4: the systems talk through flags and events, not to each other; quests don't know about combat", () => {
  const quests = src("core/quests.js");
  assert.doesNotMatch(quests, /from "\.\.\/(sim|runtime)\//, "no fight in the quest code");
  assert.match(src("core/flags.js"), /onChange\(fn\)/, "OnFlagChanged");
  for (const f of ["core", "sim"]) for (const file of ["ai.js", "abilities.js", "combat.js"].map((x) => `${f === "core" ? "core" : "core"}/${x}`)) assert.doesNotMatch(src(file), /from "\.\.\/runtime\//, `${file}: logic never touches rendering (§21.8)`);
  assert.match(src("sim/world.js"), /emit\(e\) \{ this\.events\.push\(e\);/, "the fight's events, typed by name, drained once a frame");
});
