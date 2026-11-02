import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { hitSpec } from "../src/core/combat.js";
import { FlagStore } from "../src/core/flags.js";
import { Secrets } from "../src/core/secrets.js";
import { Progress, REBRANCH_MARKS } from "../src/core/progress.js";
import { PAGES } from "../src/data/pages.js";
import { SECRET_PAGES, SECRET_NEEDS, MURALS, MARGIN_TUNING } from "../src/data/secretPages.js";
import { ZONES } from "../src/data/zones.js";
import { constrain } from "../src/sim/bounds.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { GIFTS } from "../src/data/bonds.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");
const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const S84 = GDD.slice(GDD.indexOf("### 8.4 Secret pages"), GDD.indexOf("### 8.5"));
const S81 = GDD.slice(GDD.indexOf("### 8.1 Structure"), GDD.indexOf("### 8.2"));
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const until = (w, pred, max, log = []) => { for (let i = 0; i < max; i++) { if (pred()) return log; w.step(); log.push(...w.drainEvents()); } assert.fail("condition never held"); };
const hound = (w, x, z) => { const e = w.spawnEnemy("hound", x, z); e.combatant.health.max = e.combatant.health.current = 2000; e.combatant.stagger(99999); w.drainEvents(); return e; };

test("§8.4's secret pages: five here (Blank Verse waits for Corruption), each with a nudge, its condition and its passive", () => {
  for (const [id, words] of [["lanternsAnswer", "Lantern's Answer"], ["jurorsThread", "Juror's Thread"], ["secondReading", "Second Reading"], ["weightOfNothing", "Weight of Nothing"], ["starChart", "Star Chart"]]) {
    assert.ok(S84.includes(`*${words}*`), `§8.4 still has ${words}`);
    const p = SECRET_PAGES[id];
    assert.equal(p.name, words); assert.ok(p.flag.startsWith("SECRET_") && p.hint && p.how && p.desc, id);
  }
  assert.ok(S81.includes("2 **Margin Notes** (passives)"), "§8.1: two in the margin");
  assert.match(S84, /Perfect-parry 100 attacks while Juno is in the party/); assert.equal(SECRET_NEEDS.jurorParries, 100);
  assert.match(S84, /Bring Brother Moss tea 7 times/); assert.equal(SECRET_NEEDS.mossTea, 7);
  assert.match(S84, /Find all 12 constellation murals/); assert.equal(MURALS.length, 12);
  assert.match(S84, /on 3 separate in-game days/); assert.equal(SECRET_NEEDS.hallNights, 3);
});

test("Found pages pin into the margin, two at a time (the first two go straight in); pinning a third takes the last slot", () => {
  const f = new FlagStore(), s = new Secrets(f);
  assert.deepEqual(s.margin, []);
  assert.ok(s.find("starChart")); assert.ok(!s.find("starChart"), "once");
  s.find("jurorsThread"); s.find("weightOfNothing");
  assert.deepEqual(s.margin, ["starChart", "jurorsThread"], "a free slot: straight in; then they're full");
  s.toggle("weightOfNothing");
  assert.deepEqual(s.margin, ["starChart", "weightOfNothing"]);
  s.toggle("starChart");
  assert.deepEqual(s.margin, ["weightOfNothing"]);
  assert.ok(!s.pin("lanternsAnswer"), "a page you haven't found can't be pinned");
});

test("The hidden conditions, each kept in the flags: three nights in the Hall after the Bloom, a hundred parries with Juno, seven teas, Hask untouched, twelve murals", () => {
  const f = new FlagStore(), s = new Secrets(f);
  assert.equal(s.hallVisit(1, true), null); assert.ok(!f.get("HALL_NIGHTS"), "not before the Bloom");
  f.set("EP18_DONE", 1);
  s.hallVisit(1, false); s.hallVisit(1, true); s.hallVisit(1, true); s.hallVisit(2, true);
  assert.equal(f.get("HALL_NIGHTS"), 2, "by day it doesn't count; one count a night");
  assert.equal(s.hallVisit(3, true), "lanternsAnswer");
  for (let i = 0; i < 99; i++) { s.parry(true); s.parry(false); }
  assert.ok(!s.found("jurorsThread")); assert.equal(s.parry(true), "jurorsThread");
  assert.equal(s.mossTea(1), 0, "no tea, no visit");
  f.set("GIFT_TEA", 9);
  assert.equal(s.mossTea(1), 1); assert.equal(s.mossTea(1), -1, "one cup a day");
  for (let d = 2; d < 7; d++) assert.equal(s.mossTea(d), 1);
  assert.equal(s.mossTea(7), 2); assert.ok(s.found("secondReading")); assert.equal(f.get("GIFT_TEA"), 2);
  assert.equal(s.haskDown(false), null); assert.equal(s.haskDown(true), "weightOfNothing");
  for (let i = 0; i < 11; i++) assert.equal(s.mural(), null);
  assert.equal(s.mural(), "starChart");
  assert.ok(GIFTS.tea && GIFTS.tea.from === "cafe", "smoked tea, at the Gilded Spoon");
});

test("In a fight, the margin's pages: Juror's Thread widens the parry and binds who you parry; Weight of Nothing sheds the mud; Lantern's Answer, once", () => {
  const w = new World({ seed: 4, margin: ["jurorsThread", "weightOfNothing"] }); w.drainEvents();
  assert.equal(w.parryWindow(w.player, 8), 8 + MARGIN_TUNING.jurorParry);
  const h = hound(w, 0, -2.6); h.combatant.staggerFrames = 0; h.yaw = 0;
  const p = w.player; p.combatant.startParry(20); p.yaw = Math.PI;
  w._resolve(h, p, { spec: hitSpec({ damage: 10, posture: 5, hitstop: 2, hitstun: 10 }), ability: { id: "Bite", tags: [] }, origin: { ...h.pos }, hitSet: new Set() });
  assert.ok(w.drainEvents().some((e) => e.type === "parry")); assert.ok(h.tags.has("BOUND"), "the thread catches it");
  w.applyTag(p, "WEIGHTED", 200); assert.ok(!p.tags.has("WEIGHTED"), "mud slides off");
  const l = new World({ seed: 4, margin: ["lanternsAnswer"] }); l.drainEvents();
  const hp = l.player.combatant.health; hp.set(hp.max * 0.2);
  const ev = run(l, 2);
  assert.ok(ev.some((e) => e.type === "lanternAnswer") && Math.abs(hp.current - hp.max * 0.4) < 1e-6, "a fifth back");
  hp.set(hp.max * 0.1); assert.ok(!run(l, 5).some((e) => e.type === "lanternAnswer"), "once a fight");
  l.resetPlayer(); assert.equal(l.lanternUsed, false, "a retry is a fresh fight");
});

test("Second Reading gives each page's first cast back; Star Chart doubles your marks and hardens your Detonates", () => {
  const w = new World({ seed: 4, margin: ["secondReading", "starChart"] }); w.drainEvents();
  const p = w.player, m0 = p.mana.current;
  w.press(Intent.Spell1); const l = run(w, 3);
  assert.ok(l.some((e) => e.type === "freeCast")); assert.equal(p.mana.current >= m0 - 0.01, true, "its mana came straight back");
  run(w, 60); const m1 = p.mana.current;
  w.press(Intent.Spell1); const l2 = run(w, 3);
  assert.ok(!l2.some((e) => e.type === "freeCast") && p.mana.current < m1, "only the first");
  const e = hound(w, 0, 3);
  w._resolve(p, e, { spec: hitSpec({ damage: 1, posture: 0, hitstop: 0, hitstun: 4, applyTags: [["MARKED", 240]] }), ability: { id: "L4", tags: [] }, origin: { ...p.pos }, hitSet: new Set() });
  assert.equal(e.tags.remaining("MARKED"), 480);
  const plain = new World({ seed: 4 }); plain.drainEvents();
  const dmg = (wd) => { const t = hound(wd, 0, 3); t.tags.add("MARKED", 100); const h0 = t.combatant.health.current;
    wd._resolve(wd.player, t, { spec: hitSpec({ damage: 0.0001, posture: 0, hitstop: 0, hitstun: 4 }), ability: { id: "Gale", tags: ["burst"] }, origin: { ...wd.player.pos }, hitSet: new Set() }); return h0 - t.combatant.health.current; };
  assert.ok(Math.abs(dmg(w) - dmg(plain) * 1.25) < 0.01, "a Detonate a quarter harder");
});

test("Weight of Nothing's condition: beating Hask with its mud never touching you (the World says whether it did)", () => {
  const clean = new World({ seed: 7 }); clean.spawnWave(["hask"]); clean.drainEvents();
  clean.boss.combatant.health.set(0);
  assert.ok(run(clean, 3).some((e) => e.type === "haskDown" && e.clean));
  const dirty = new World({ seed: 7 }); dirty.spawnWave(["hask"]); dirty.drainEvents();
  const h = dirty.boss; dirty.player.combatant.invulnerableFrames = 0;
  dirty._resolve(h, dirty.player, { spec: hitSpec({ damage: 5, posture: 0, hitstop: 0, hitstun: 4, applyTags: [["WEIGHTED", 60]] }), ability: { id: "Mud", tags: [] }, origin: { ...h.pos }, hitSet: new Set() });
  h.combatant.health.set(0);
  assert.ok(run(dirty, 3).some((e) => e.type === "haskDown" && !e.clean));
});

test("Perfect Cast (§8.1: Level V): a spell out of a blow that landed, right as its window opens, lands a third harder; late, or below V, it's just a cast", () => {
  assert.match(S81, /V \(either branch\) unlocks the "Perfect Cast" bonus window/);
  const fight = (xp, late) => {
    const pr = new Progress({ pages: { Spell1: { xp } } });
    const w = new World({ seed: 4, progress: pr }); w.drainEvents();
    w.player.mana.max = w.player.mana.current = 999;
    hound(w, 0, -2.4); w.player.yaw = Math.PI;
    const log = [];
    w.press(Intent.Light);
    until(w, () => w.player.runner.current?.id === "L1" && w.player.runner.hasHit, 40, log);
    if (late) until(w, () => w.player.runner.frame >= 18, 40, log);
    w.press(Intent.Spell1); run(w, 30, log);
    return log;
  };
  assert.ok(fight(9999, false).some((e) => e.type === "perfectCast"), "V, and quick: perfect");
  assert.ok(!fight(9999, true).some((e) => e.type === "perfectCast"), "V, but late in the window");
  assert.ok(!fight(0, false).some((e) => e.type === "perfectCast"), "a page below V has no window");
  assert.match(src("sim/world.js"), /att\.perfectCast === hb\.ability\?\.id\) spec = \{ \.\.\.spec, damage: spec\.damage \* Tuning\.perfectCastFactor/);
});

test("Re-branching (§8.1): an evolved page can take its other branch at the Lighthouse, for Marks", () => {
  assert.match(S81, /You can re-branch at HQ for a cost/);
  const pr = new Progress({ pages: { Spell1: { xp: 99, branch: "A" } } });
  assert.ok(!pr.rebranch("Spell1", "A"), "the branch it already has"); assert.ok(!pr.rebranch("Spell2", "B"), "a page not yet evolved");
  assert.ok(pr.rebranch("Spell1", "B")); assert.equal(pr.pages.Spell1.branch, "B");
  const w = new World({ seed: 4, progress: pr }); w.drainEvents();
  assert.equal(w.loadout.Spell1.id, PAGES.Spell1.branches[1].ability.id, "the next fight has it");
  pr.rebranch("Spell1", "A"); w.rebranchPage("Spell1", "A");
  assert.equal(w.loadout.Spell1.id, PAGES.Spell1.branches[0].ability.id, "and this one, at once");
  assert.ok(REBRANCH_MARKS > 0);
  const main = src("main.js");
  assert.match(main, /const atHQ = story\.roaming && story\.zone\?\.id === "lighthouse";/);
  assert.match(main, /story\.inventory\.marks -= REBRANCH_MARKS;/);
});

test("The world holds them: twelve murals in eight places (somewhere you can stand), Moss takes his tea, and the Grimoire shows it all", () => {
  const all = Object.values(ZONES).flatMap((z) => (z.pickups ?? []).filter((p) => /^mural\d+$/.test(p.id)).map((p) => ({ z, p })));
  assert.equal(all.length, 12);
  assert.equal(new Set(all.map(({ z }) => z.id)).size, 8); // (two in the Severed Isles since Phase 12: §13 puts the constellation murals there)
  for (const { z, p } of all) {
    const c = constrain({ x: p.x, z: p.z }, 0.4, z.bounds);
    assert.ok(Math.hypot(c.x - p.x, c.z - p.z) < 1e-6, `${p.id} in ${z.id} is somewhere you can stand`);
    assert.match(WORLD_SCRIPT, new RegExp(`title: W_Mural${p.id.slice(5)}\\n---[\\s\\S]*?<<mural>>`));
  }
  for (const m of MURALS) assert.ok(all.some(({ z, p }) => p.id === `mural${m.n}` && z.id === m.zone), `mural ${m.n} where the data says`);
  assert.match(WORLD_SCRIPT, /title: W_MossTower\n---\n<<if \$GIFT_TEA > 0>>\n    -> Give him the smoked tea\.\n        <<mosstea>>/);
  assert.match(tpl, /data-grim-secrets/);
  const main = src("main.js"), story = src("runtime/story.js");
  for (const ev of ["perfectCast", "freeCast", "lanternAnswer"]) assert.match(main, new RegExp(`case "${ev}"`));
  assert.match(main, /margin: marginNow\(\), /);
  assert.match(story, /if \(id === "hall"\) this\._found\(this\.secrets\.hallVisit\(this\.day, !!this\.clock\?\.night\)\)/);
  assert.match(story, /case "mural": this\._found\(this\.secrets\.mural\(\)\)/);
});
