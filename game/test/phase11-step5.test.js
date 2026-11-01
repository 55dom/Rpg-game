import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SKITS } from "../src/data/skits.js";
import { ZONES } from "../src/data/zones.js";
import { compileExpr } from "../src/core/flags.js";

// Phase 11 Step 5: GDD §7–§12 (the systems chapters), walked line by line, the way Phase 10 walks §16. Each line is
// quoted from the design (the test fails if the words leave it, so the list can't drift) and pointed at what answers it.
// The few lines nothing answers yet are named, with the reason, and held to exactly that list.

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const has = (p, re) => re.test(src(p));
const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const S = GDD.slice(GDD.indexOf("## 7. MAGIC SYSTEM"), GDD.indexOf("## 13. WORLD MAP"));
const sec = (n) => S.slice(S.indexOf(`## ${n}.`), S.indexOf(`## ${n + 1}.`) > 0 ? S.indexOf(`## ${n + 1}.`) : undefined);

const CHECKLIST = [
  // §7 · Magic
  ["§7.1", "is a single pool for all characters", [["sim/world.js", /meleeManaGain/]]],
  ["§7.1", "quickly when melee hits land", [["sim/world.js", /melee feeds magic/]]],
  ["§7.1", "Spells apply **Tags** to targets", [["core/tags.js", /export class TagSet/]]],
  ["§7.1", "we author ~12 reactions **once**", [["data/reactions.js", /export const SECTION_7_2 = Object\.freeze\(\[/]]],
  ["§7.1", "**Weaknesses** come from *conditions*", [["sim/world.js", /t\.boss\?\.weakTo\?\.\[row\.id\]/], ["data/bosses2.js", /weak: Object\.freeze\(\{ Conduction:/]]],
  ["§7.2", "**Conduction**", [["data/reactions.js", /id: "Conduction", when: "WET", with: "CHARGED"/], ["sim/boss.js", /w\.applyTag\(t, "CHARGED"/]]],
  ["§7.2", "**Firestorm**", [["data/reactions.js", /id: "Firestorm", when: "SCORCHED", with: "gust"/], ["sim/boss.js", /w\.applyTag\(t, "SCORCHED", R\.scorch, w\.player\)/]]],
  ["§7.2", "**Wildfire**", [["data/reactions.js", /id: "Wildfire", when: "ROOTED", with: "SCORCHED"/], ["sim/boss.js", /f\.tags\.add\("ROOTED", 99999\)/]]],
  ["§7.2", "**Meteor**", [["data/reactions.js", /id: "Meteor", when: "WEIGHTED", with: "airborne"/], ["sim/boss.js", /\.allies = true/]]],
  ["§7.2", "**Crush**", [["data/reactions.js", /id: "Crush", when: "WEIGHTED", with: "BOUND"/]]],
  ["§7.2", "**Shatter Chorus**", [["data/reactions.js", /id: "ShatterChorus", name: "Shatter Chorus", when: "RESONANT", with: "glass"/], ["data/companions.js", /applyTags: \[\["RESONANT", 300\]\]/]]],
  ["§7.2", "**Detonate**", [["data/reactions.js", /id: "Detonate", when: "MARKED", with: "burst"/]]],
  ["§7.3", "*Skyrender*, launches all enemies into an aerial cinematic combo", [["data/rook.js", /id: "Skyrender"/]]],
  ["§7.3", "*Snare Line*", [["data/companions.js", /SnareLine/]]],
  ["§7.3", "*Pillar Uppercut* (ground launcher)", [["data/companions.js", /PillarUppercut/]]],
  ["§7.3", "*Shatter Note*", [["data/companions.js", /ShatterNote: defineAbility/]]],
  ["§7.3", "*Revision*, rewinds 3 seconds", [["data/inscription.js", /export const REVISION/]]],
  ["§7.3", "*Null Bite* (deletes buffs)", [["data/forbidden.js", /export const NULL_BITE/]]],
  // §8 · The grimoire
  ["§8.1", "4 active spell pages", [["data/pages.js", /Spell4: \{ name: "Wind Wall"/]]],
  ["§8.1", "2 **Margin Notes** (passives)", [["data/secretPages.js", /export const MARGIN_SLOTS = 2;/]]],
  ["§8.1", "pages level up through **use**", [["sim/world.js", /_pageXp\(ability\) \{/]]],
  ["§8.1", "each page **branches** into one of two versions (A/B)", [["data/pages.js", /branches: \[/]]],
  ["§8.1", "You can re-branch at HQ for a cost", [["core/progress.js", /rebranch\(slot, key\) \{/], ["main.js", /story\.inventory\.marks -= REBRANCH_MARKS;/]]],
  ["§8.1", "V (either branch) unlocks the \"Perfect Cast\" bonus window", [["sim/world.js", /_perfectCast\(f, old, next\) \{/]]],
  ["§8.2", "*Hollow Bite*: huge damage, costs Corruption", [["data/forbidden.js", /export const HOLLOW_BITE = defineAbility/]]],
  ["§8.3", "Equipping or casting forbidden pages raises **Corruption (0–100)**", [["main.js", /if \(now\) story\.corrupt\(CORRUPTION\.equip\);/], ["runtime/story.js", /this\.corrupt\(CORRUPTION\.cast\)/]]],
  ["§8.3", "It is persistent and saved", [["core/corruption.js", /this\.flags\.set\("CORRUPTION", after\)/]]],
  ["§8.3", "**25:** NPC barks change, and children in Thornwick hide from you", [["data/story/world.js", /title: W_Kid\n---\n<<if \$CORRUPTION >= 25>>/], ["runtime/crowd.js", /mood\.noChildren && p\.child/]]],
  ["§8.3", "**50:** the Crimson Bell squad starts investigating you", [["data/zones.js", /id: "bellInquiry"/]]],
  ["§8.3", "**75:** the Hollow whispers in combat", [["main.js", /root\.classList\.toggle\("whispers", on\)/], ["sim/world.js", /CORRUPTION\.whisperFactor/]]],
  ["§8.3", "**100:** a game-over-style \"Erased\" event", [["data/zones.js", /id: "erased"/], ["runtime/story.js", /_erase\(\) \{/]]],
  ["§8.3", "Cleansing exists (Verdant Oath shrines, Moss's tea)", [["data/lore.js", /<<cleanse shrine>>/], ["runtime/story.js", /this\.cleanse\(CORRUPTION\.tea\)/]]],
  ["§8.4", "*Lantern's Answer*", [["core/secrets.js", /hallVisit\(day, night\) \{/]]],
  ["§8.4", "*Juror's Thread*", [["core/secrets.js", /parry\(withJuno\) \{/]]],
  ["§8.4", "*Second Reading*", [["core/secrets.js", /mossTea\(day\) \{/]]],
  ["§8.4", "*Weight of Nothing*", [["sim/world.js", /type: "haskDown", clean: !this\.mudHit/]]],
  ["§8.4", "*Star Chart*", [["data/zones.js", /const mural = \(n, x, z\)/]]],
  ["§8.4", "*Blank Verse*", [["core/corruption.js", /this\.secrets\?\.find\("blankVerse"\)/]]],
  ["§8.5", "Collect 5 to restore an Inscription clause", [["data/lore.js", /need: 5/]]],
  ["§8.6", "**Annotation**", [["data/story/ep28.js", /annotation: true/]]],
  ["§8.6", "**Revision**", [["data/inscription.js", /export const REVISION/]]],
  ["§8.6", "**Unwritten**", [["reveal/ep69.js", /§8\.6 "Unwritten"/]]],
  // §9 · Combat
  ["§9.1", "Block (tap at impact = Parry)", [["data/rook.js", /key: "parry", value: 8/]]],
  ["§9.1", "Ultimate (Surge gauge full)", [["data/rook.js", /surgeCost: 100/]]],
  ["§9.1", "Team Attack (Bond gauge full, with partner)", [["sim/world.js", /this\.bondGauge >= BOND_GAUGE\.max/]]],
  ["§9.1", "Call ally Assist / tactics", [["runtime/controls.js", /assist:bas/], ["runtime/controls.js", /"stance"/]]],
  ["§9.2", "**Surge:** fills from dealing and taking damage and from perfect actions", [["data/rook.js", /surgeGain: \{ dealt:/]]],
  ["§9.2", "**Bond gauge** (party): fills from synergy (reactions, assists). Spent on Team Attacks.", [["sim/world.js", /export const BOND_GAUGE = Object\.freeze\(\{ max: 100, reaction: 15, assist: 20 \}\)/], ["runtime/hud.js", /bond-gauge/]]],
  ["§9.3", "Parry window | 8f (Story difficulty: 14f)", [["data/difficulty.js", /key: "story", name: "Story", parry: 6/]]],
  ["§9.3", "Input buffer | 10f", [["core/input.js", /DefaultWindowFrames = 10/]]],
  ["§9.5", "A **ComboGraph** data asset per stance or character", [["core/abilities.js", /export class ComboGraph/]]],
  ["§9.6", "Heavy enemy attacks (red glint) are **unblockable**", [["core/combat.js", /unblockable/]]],
  ["§9.6", "**Perfect dodge** grants Afterimage", [["sim/world.js", /type: "afterimage"/]]],
  ["§9.7", "*Story* (wider windows, auto-combo assist), *Knight* (default), *Paragon* (enemies use more of their kits, tighter windows)", [["data/difficulty.js", /export const DIFFICULTY_KEYS = Object\.freeze\(\["story", "knight", "paragon"\]\)/]]],
  ["§9.7", "Changes are made through **data multipliers**, not separate AI", [["core/ai.js", /this\.pace\?\.recover/]]],
  // §10 · Party
  ["§10", "**Active party:** protagonist + 2 companions", [["sim/world.js", /\["bas", "juno"\]\) this\.addCompanion\(kind\)/]]],
  ["§10", "*Press* (aggressive), *Guard* (protect the player), *Support* (spells and heals)", [["core/ai.js", /export const STANCES = Object\.freeze\(\[Stance\.Press, Stance\.Guard, Stance\.Support\]\)/]]],
  ["§10", "**Team Attacks:** spend the Bond gauge", [["sim/world.js", /this\.bondGauge = 0;\n\s+this\.teamHit/]]],
  ["§10", "**Character switching** (tag-swap)", [["sim/world.js", /tagSwap\(forced = false\) \{/]]],
  ["§10", "**Party banter:** short \"camp skits\"", [["data/skits.js", /export const SKITS/], ["runtime/story.js", /_skit\(zoneId\) \{/], ["main.js", /const playSkit = \(k, name\) =>/]]],
  // §11 · Bonds
  ["§11", "*Stranger → Acquaintance → Comrade → Trusted → Sworn*", [["data/bonds.js", /RANK_TITLES = Object\.freeze\(\["Stranger"/]]],
  ["§11", "one gift per character per in-game day", [["core/bonds.js", /BOND_GIFTDAY_/]]],
  ["§11", "**Bond Events** (authored scenes) at ranks 2, 4, 6, 8, 10", [["data/bonds.js", /GATES = Object\.freeze\(\[2, 4, 6, 8, 10\]\)/]]],
  ["§11", "Passive buff when in party", [["data/bonds.js", /passive: \{ name: "Shoulder to Shoulder"/]]],
  ["§11", "**Team Attack** with protagonist", [["core/bonds.js", /this\.rank\(id\) >= 5/]]],
  // §12 · Squads
  ["§12.2", "Merit unlocks **HQ upgrades**", [["data/crafting.js", /merit: 20, marks: 60/]]],
  ["§12.3", "**Squad Reputation** (how the Crown and the other squads see the Lanterns) and **Regional Renown**", [["core/quests.js", /squad: "REP_SQUAD", aurelin: "RENOWN_AURELIN", fens: "RENOWN_FENS"/]]],
  ["§12.3", "Breaking laws (trespass, forbidden pages seen)", [["runtime/law.js", /class LawWatch/], ["data/zones.js", /add: \{ REP_SQUAD: -4 \}/]]],
];

/** What nothing answers yet, and why. If one of these gets its magic, kit or scene, it moves into the checklist. */
const EXCEPTIONS = [
  ["§7.2", "**Flash Freeze**", "nobody in any party or fight brings CHILLED (Frost is an elite and recruit kit no fight has yet); the row waits in the table"],
  ["§7.2", "**Flashpoint**", "nothing leaves an ASH cloud yet (Ember isn't anyone's magic in the story); the row waits in the table"],
  ["§7.2", "**Railgun**", "nothing puts POLARIZED on a target (Iron/Magnet is the Chancellor's, and he never fights); the row waits in the table"],
  ["§7.2", "**Rude Awakening**", "nothing makes a target DROWSY (Dream magic has no wielder in the story); the row waits in the table"],
  ["§7.2", "**Corrode**", "nothing puts ROTTING on an armoured foe (Galen's rot is his own RUSTED, on you); the row waits in the table"],
  ["§7.3", "Only **4 player affinities + Inscription + ~8 party kits**", "Rook's one page is Gale, plus Inscription: the other three player affinities wait on the open scope call (NEXT STEP, item 4)"],
  ["§7.3", "light (Sunlance, Candle) burns it", "the same line as §16's last exception: nobody beside you carries Sunlance or Candle light"],
  ["§8.2", "| **Rare** | Boss first-clears, rank promotions, character quests |", "Rook's pages come with the story rather than as drops; the tiers aren't shown on them"],
  ["§10", "(they still gain 75% XP so they never fall behind)", "companions don't level: only Rook does (§17), so there's no XP to share"],
  ["§11", "| 6 | Alternate ability (e.g., Juno's *Loom Wall* gains reflection) |", "ranks 6–10 (alternate ability, special Assist, Awakening) and their bond events are \"a later chapter\" in the Bonds screen: unwritten"],
  ["§11", "`JUNO_SEVERIN = HOSTILE | TRUCE | ALLIES`", "pairs between squadmates aren't tracked as flags yet; each episode writes them as scenes"],
  ["§12.2", "observatory (Severin's bond events)", "Severin has no bond track, so the observatory has nothing to hold yet; the Lighthouse's other rooms are built"],
  ["§12.2", "\"Cal's room\" (🔒 reopened after the reveal)", "not a room on the squad board yet: Arc 6 writes the Lighthouse after the reveal as scenes"],
  ["§12.3", "the protagonist can **become captain**", "the story never makes Rook captain: Dagrun stays captain to the end"],
];

test("§7–§12, line by line: every line checked is still in the design, and the code that answers it is there", () => {
  const missing = [];
  for (const [where, words, at] of CHECKLIST) {
    assert.ok(S.includes(words), `${where}: "${words}" is no longer in §7–§12 (update the checklist with the design)`);
    for (const [file, re] of at) if (!has(file, re)) missing.push(`${where} · ${words} · ${file} ${re}`);
  }
  assert.deepEqual(missing, [], "lines of §7–§12 with nothing answering them");
  for (const n of [7, 8, 9, 10, 11, 12]) assert.ok(CHECKLIST.some(([w]) => w.startsWith(`§${n}`)), `§${n} is on the list`);
  assert.ok(CHECKLIST.length >= 60);
});

test("The exceptions are exactly these fourteen, each named in the design, with the reason", () => {
  assert.equal(EXCEPTIONS.length, 14);
  for (const [where, words, why] of EXCEPTIONS) {
    assert.ok(S.includes(words), `${where}: "${words}"`);
    assert.ok(why.length > 40, where);
    assert.ok(!CHECKLIST.some(([, w]) => w === words), `${words} can't be both answered and an exception`);
  }
  // Still true: no kit brings those five tags.
  const kits = ["data/rook.js", "data/companions.js", "data/cal.js", "data/severinKit.js", "data/enemies.js", "data/bosses2.js", "data/hask.js", "data/ashfall.js"].map(src).join("\n");
  for (const tag of ["CHILLED", "\"ASH\"", "POLARIZED", "DROWSY", "ROTTING"]) assert.ok(!kits.includes(tag), `${tag} is still nobody's`);
});

test("Camp skits (§10): two of the squad, once each, by place and the story's flags; never about the mystery", () => {
  assert.ok(sec(10).includes("trigger from party composition, location, and flags"));
  assert.ok(SKITS.length >= 8);
  const ids = new Set();
  for (const k of SKITS) {
    assert.ok(!ids.has(k.id)); ids.add(k.id);
    assert.ok(ZONES[k.zone], `${k.id}: a real place`);
    assert.doesNotThrow(() => compileExpr(k.when)); assert.equal(k.cast.length, 2, "two portraits");
    for (const [who] of k.lines) assert.ok(k.cast.includes(who.toLowerCase()), `${k.id}: ${who} is in the scene`);
    assert.ok(k.lines.length >= 4 && k.lines.length <= 7, "short");
  }
  const all = JSON.stringify(SKITS);
  assert.doesNotMatch(all, /\bcal\b|calder|lantern.*(out|lit)|mind the step|door/i, "banter doesn't get to add clues (§15.5)");
  const main = src("main.js");
  assert.match(main, /line\.replaceChildren\(b, document\.createTextNode\(text\.replaceAll\("\{name\}", name\)\)\)/, "a player's name is never markup");
  assert.match(main, /sfx\.play\("click", 0\.5\); \/\/ the voice placeholder/);
});
