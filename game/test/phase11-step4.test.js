import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { hitSpec } from "../src/core/combat.js";
import { FlagStore } from "../src/core/flags.js";
import { Secrets } from "../src/core/secrets.js";
import { Corruption } from "../src/core/corruption.js";
import { CORRUPTION, CORRUPTION_STAGES, HOLLOW_BITE, NULL_BITE } from "../src/data/forbidden.js";
import { SECRET_PAGES } from "../src/data/secretPages.js";
import { PAGES } from "../src/data/pages.js";
import { ZONES } from "../src/data/zones.js";
import { constrain } from "../src/sim/bounds.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");
const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const S83 = GDD.slice(GDD.indexOf("### 8.3 Forbidden pages"), GDD.indexOf("### 8.4"));
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };

test("§8.3's Corruption: 0–100, kept in the flags, rising past 25, 50, 75 and 100; down only slowly; Erased climbs back to 60", () => {
  assert.match(S83, /raises \*\*Corruption \(0–100\)\*\*/); assert.match(S83, /a scripted nightmare fight to climb back to 60/);
  assert.deepEqual([...CORRUPTION.stages], [25, 50, 75, 100]); assert.equal(CORRUPTION.back, 60);
  const f = new FlagStore(), c = new Corruption(f, new Secrets(f));
  assert.deepEqual(c.add(20), []); assert.deepEqual(c.add(40), [25, 50]); assert.equal(c.stage, 50);
  assert.deepEqual(c.add(500), [75, 100]); assert.equal(c.value, 100, "never past 100");
  c.restore(); assert.equal(c.value, 60); assert.equal(c.peak, 100);
  c.cleanse(1000); assert.equal(c.value, 0, "never below 0");
  for (const st of [25, 50, 75, 100]) assert.ok(CORRUPTION_STAGES[st], `stage ${st} says something`);
  assert.ok(CORRUPTION.shrine <= 10 && CORRUPTION.tea <= 5, "cleansing is slow");
});

test("Blank Verse (§8.4: reach Corruption 50, then cleanse to 0): found by the cleanse that empties it; a clean page fights better", () => {
  assert.match(GDD.slice(GDD.indexOf("### 8.4"), GDD.indexOf("### 8.5")), /\*Blank Verse\* \| Reach Corruption 50, then cleanse to 0/);
  const f = new FlagStore(), s = new Secrets(f), c = new Corruption(f, s);
  c.add(40); assert.equal(c.cleanse(40), null, "it never reached 50");
  c.add(55); assert.equal(c.cleanse(30), null); assert.equal(c.cleanse(30), "blankVerse");
  assert.ok(s.found("blankVerse") && SECRET_PAGES.blankVerse.flag === "SECRET_BLANK");
  const clean = new World({ seed: 2, margin: ["blankVerse"], corruption: 0 }), dark = new World({ seed: 2, margin: ["blankVerse"], corruption: 5 });
  assert.ok(clean.mods.attack > dark.mods.attack && clean.playerStats.manaRegenPerSecond > dark.playerStats.manaRegenPerSecond, "only while it's 0");
});

test("Hollow Bite, the forbidden page (§8.2): it takes Wind Wall's button, bites hard, deletes what's guarding a foe, and every cast is counted", () => {
  assert.match(GDD, /\*Hollow Bite\*: huge damage, costs Corruption/);
  const w = new World({ seed: 2, forbidden: true }); w.drainEvents();
  assert.equal(w.loadout.Spell4.id, HOLLOW_BITE.id);
  assert.ok(HOLLOW_BITE.hit.damage >= 2 * PAGES.Spell1.base.hit.damage, "huge damage");
  w.setForbidden(false); assert.equal(w.loadout.Spell4.id, PAGES.Spell4.base.id, "put away: Wind Wall back");
  w.setForbidden(true); assert.equal(w.loadout.Spell4.id, HOLLOW_BITE.id);
  const locked = new World({ seed: 2, forbidden: true, loadout: { Spell4: null } });
  assert.equal(locked.loadout.Spell4, null, "a fight that locks the button keeps it locked");
  // A cast: the World says so (the story raises Corruption), and what guarded the foe is gone.
  const e = w.spawnEnemy("hound", 0, -2.2); e.combatant.health.max = e.combatant.health.current = 500; e.combatant.stagger(99999);
  e.tags.add("WARDED", 300); w.player.yaw = Math.PI; w.drainEvents();
  w.player.mana.current = w.player.mana.max;
  w.press(Intent.Spell4); const l = run(w, 30);
  assert.ok(l.some((x) => x.type === "forbiddenCast"));
  assert.ok(!e.tags.has("WARDED") && NULL_BITE.includes("WARDED"), "Null Bite");
  // It isn't Wind Wall's page: no mastery from it, and no page bonuses on it.
  assert.equal(w.pages.Spell4.xp, 0);
});

test("At 75 the Hollow whispers: the forbidden page bites a fifth harder (and the screen frays, in the story)", () => {
  const bite = (corruption) => { const w = new World({ seed: 2, forbidden: true, corruption }); w.drainEvents();
    const e = w.spawnEnemy("hound", 0, 3); e.combatant.health.max = e.combatant.health.current = 999; w.drainEvents();
    w._resolve(w.player, e, { spec: HOLLOW_BITE.hit, ability: HOLLOW_BITE, origin: { ...w.player.pos }, hitSet: new Set() });
    return 999 - e.combatant.health.current; };
  assert.ok(Math.abs(bite(80) - bite(10) * CORRUPTION.whisperFactor) < 0.01);
  const main = src("main.js");
  assert.match(main, /const on = state\.mode === "story" && \(world\.corruption \?\? 0\) >= 75 && world\.liveEnemies\.length > 0;/);
  assert.match(tpl, /\.whispers::after/); assert.match(tpl, /data-whisper/);
});

test("The world answers it: the Choir's cache in the Fens, a Verdant Oath shrine, uneasy townsfolk at 25, Thornwick's children kept in, the Bell at 50, the Hollow at 100", () => {
  const fens = ZONES.fens.pickups.find((p) => p.id === "choirCache"), shrine = ZONES.thornwick.pickups.find((p) => p.id === "shrine");
  assert.match(fens.show, /\$ILSE_DEFEATED and not \$FORBIDDEN_FOUND/, "after the Choir's first deacon falls");
  for (const [z, p] of [[ZONES.fens, fens], [ZONES.thornwick, shrine]]) { const c = constrain({ x: p.x, z: p.z }, 0.4, z.bounds); assert.ok(Math.hypot(c.x - p.x, c.z - p.z) < 1e-6, p.id); }
  assert.match(WORLD_SCRIPT, /title: W_ChoirCache[\s\S]*?<<forbidden take>>/);
  assert.match(WORLD_SCRIPT, /title: W_Shrine[\s\S]*?<<cleanse shrine>>/);
  for (const n of ["W_Vendor", "W_Gossip", "W_Kid", "W_Farmer"]) assert.match(WORLD_SCRIPT, new RegExp(`title: ${n}\\n---\\n<<if \\$CORRUPTION >= 25>>`), n);
  assert.match(src("data/story/cafe.js"), /title: W_Pip\n---\n<<if \$CORRUPTION >= 25>>/);
  assert.match(src("runtime/crowd.js"), /!\(mood\.noChildren && p\.child\)/);
  assert.match(src("runtime/story.js"), /noChildren: this\.zone\?\.id === "thornwick" && this\.corruption\.value >= 25/);
  const bell = ZONES.aurelin.encounters.find((e) => e.id === "bellInquiry");
  assert.equal(bell.when, "$CORRUPTION >= 50"); assert.ok(bell.once && bell.add.REP_SQUAD < 0 && bell.wave.every((k) => k === "bellWarden"), "once, and the squad's standing drops");
  const er = ZONES.hollow.encounters.find((e) => e.id === "erased");
  assert.equal(er.when, "$CORRUPTION >= 100"); assert.equal(er.win, "restore");
  const st = src("runtime/story.js");
  assert.match(st, /if \(this\.corruption\.value >= CORRUPTION\.max && this\._erase\(\)\) return;/);
  assert.match(st, /if \(e\.win === "restore"\) \{/);
  assert.match(st, /if \(ev\.type === "forbiddenCast"\) this\.corrupt\(CORRUPTION\.cast\);/);
  assert.match(st, /if \(r > 0 && this\.corruption\.value > 0\) this\.cleanse\(CORRUPTION\.tea\);/, "Moss's tea helps too");
});

test("The Grimoire shows Corruption and the page, pinned or put away; pinning costs; it's all kept with the save", () => {
  assert.match(tpl, /data-grim-forbidden/);
  const main = src("main.js");
  assert.match(main, /if \(now\) story\.corrupt\(CORRUPTION\.equip\);/);
  assert.match(main, /forbidden: forbiddenNow\(\), corruption: corruptionNow\(\)/);
  assert.match(main, /forbiddenNow = \(\) => !!story\.flags\.get\("FORBIDDEN_FOUND"\) && !!story\.flags\.get\("FORBIDDEN_ON"\);/);
  assert.match(src("data/inscription.js"), /HollowBite: "Hollow Bite"/);
});
