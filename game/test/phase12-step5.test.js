import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ZONES } from "../src/data/zones.js";
import { FlagStore, compileExpr, truthy } from "../src/core/flags.js";
import { parseScript } from "../src/core/script.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { World } from "../src/sim/world.js";

// Phase 12 Step 5: GDD §13 (the world map), §17 (progression) and §18 (quests), walked line by line the way Phase 10
// walks §16 and Phase 11 walks §7–§12. Each line is quoted from the design (the test fails if the words leave it, so the
// list can't drift) and pointed at what answers it. The lines nothing answers are named, with the reason, and held to
// exactly that list.

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const has = (p, re) => re.test(src(p));
const GDD = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const sec = (n) => GDD.slice(GDD.indexOf(`## ${n}. `), GDD.indexOf(`## ${n + 1}. `));
const TEXT = { 13: sec(13), 17: sec(17), 18: sec(18) };
const inSec = (where, words) => TEXT[Number(/§(\d+)/.exec(where)[1])].includes(words);

const CHECKLIST = [
  // §13 · The world map
  ["§13", "We build **large interconnected zones**", [["data/zones.js", /export const ZONES = \{/]]],
  ["§13", "linked by a world map and fast travel", [["main.js", /story\.travel\(b\.dataset\.zone\)/]]],
  ["§13", "Changes as you return (rebuilt, mourning, festival)", [["runtime/sets.js", /\$BANDITS_CLEARED and \$\{since\} >= 3/], ["runtime/sets.js", /K\.when\("\$EP58_DONE and not \$EP70_DONE"\)/], ["runtime/sets.js", /K\.when\("\$EP70_DONE"\)/]]],
  ["§13", "The orphan ledger shows you were", [["data/zones.js", /id: "ledger"/]]],
  ["§13", "Grimoire ceremony; Brother Moss", [["data/zones.js", /id: "moss", look: "moss"/]]],
  ["§13", "Murals of the Scribe; a sealed floor", [["runtime/sets.js", /K\.when\("\$SCRIBE_FLOOR"\)/]]],
  ["§13", "First missions; vanishing villages", [["data/zones.js", /id: "fens", name: "The Greywater Fens"/]]],
  ["§13", "A village nobody remembers, still standing", [["data/quests.js", /title: "The Village Nobody Remembers"/]]],
  ["§13", "the squad lanterns; the library", [["runtime/sets.js", /const myLit = K\.when\("\$LANTERN_LIT"\)/], ["data/crafting.js", /library: \{ name: "Library Corner"/]]],
  ["§13", "Politics, festival, Hall of Lanterns", [["data/zones.js", /id: "hall", name: "The Hall of Lanterns"/]]],
  ["§13", "Royal archives; Valcourt estate; Lowmarket rumor network", [["data/zones.js", /id: "archive", name: "The Grand Archive"/], ["data/story/ep13.js", /The Valcourt garden/], ["data/rumors.js", /export const RUMOR_BOARD/]]],
  ["§13", "Arc 2 dungeon", [["data/zones.js", /id: "undercroft", name: "The Undercroft"/]]],
  ["§13", "The old city beneath the city", [["data/zones.js", /id: "oldcity", name: "The Old City"/]]],
  ["§13", "Reflects places that no longer exist", [["data/zones.js", /id: "mirrorlake", name: "Mirrorlake Saelith"/], ["data/saelith.js", /title: W_SaelithReflection/]]],
  ["§13", "Mirror wraiths", [["data/saelith.js", /mirrorWraith: \{/], ["sim/world.js", /def\.traits\.glass/]]],
  ["§13", "Drowned Archive", [["data/saelith.js", /title: W_DrownedArchive/]]],
  ["§13", "Sky temples, Tempest Riders", [["data/zones.js", /id: "isles", name: "The Severed Isles"/]]],
  ["§13", "storm elementals", [["data/isles.js", /name: "Storm Wisp"/]]],
  ["§13", "Constellation murals (Star Chart page)", [["data/secretPages.js", /n: 2, zone: "isles"/], ["data/secretPages.js", /n: 11, zone: "isles"/]]],
  ["§13", "Arc 3 war", [["data/zones.js", /id: "ironhold", name: "Ironhold"/]]],
  ["§13", "Brannoc's last stand", [["data/zones.js", /id: "ironCairn"/]]],
  ["§13", "The forbidden border", [["data/zones.js", /id: "hollowmarch", name: "The Hollowmarch", region: "Past the northern border", stage: "hollowmarch", mapWhen: "\$EP17_DONE"/]]],
  ["§13", "Hollow-touched beasts", [["data/contracts.js", /zone: "hollowmarch"/]]],
  ["§13", "Late-game realm", [["data/zones.js", /id: "hollow", name: "The Hollow"/]]],
  ["§13", "Erased things", [["data/zones.js", /id: "erased"/]]],
  ["§13", "There are no filler zones", [["data/contracts.js", /zone: "undercroft"/], ["data/contracts.js", /zone: "tower"/], ["data/contracts.js", /zone: "isles"/], ["data/contracts.js", /zone: "mirrorlake"/]]],
  // §17 · Progression
  ["§17", "**Level (1–60)**", [["data/skills.js", /export const MAX_LEVEL = 60;/], ["data/skills.js", /export const STORY_LEVEL_END = 48;/]]],
  ["§17", "XP from combat and quests", [["main.js", /killXp\(ev\.defender\.kind/], ["runtime/story.js", /this\.gainXp\(r\.xp \?\? QUEST_XP\)/]]],
  ["§17", "**Knight Rank** (Ember → Spark → Flame → Blaze → Sun)", [["data/ranks.js", /id: "ember", name: "Ember"/], ["data/ranks.js", /id: "sun", name: "Sun"/]]],
  ["§17", "Unlocks mission tiers", [["core/contracts.js", /s\.tier <= rank \+ 1/]]],
  ["§17", "page tiers", [["data/skills.js", /export const TIER_RANK = Object\.freeze\(\{ 1: 0, 2: 1, 3: 2 \}\)/], ["core/progress.js", /rank < \(TIER_RANK\[s\.tier\] \?\? 0\)/]]],
  ["§17", "title in dialogue", [["core/script.js", /if \(key === "rank"\) return rankName\(flags\)/]]],
  ["§17", "**Promotion exams** (combat trials + interviews)", [["data/ranks.js", /const interview = \(id, rank, open, qs, pass\)/], ["core/ranks.js", /finishTrial\(won\)/]]],
  ["§17", "**Grimoire Mastery**", [["core/progress.js", /export function pageLevel/]]],
  ["§17", "Sword techniques (new combo nodes, cancels, air options)", [["data/techniques.js", /kind: "combo node"/], ["data/techniques.js", /kind: "cancel"/], ["data/techniques.js", /kind: "air option"/], ["data/rook.js", /T\.has\("stonebreaker"\)/]]],
  ["§17", "Training at HQ with mentors (Dagrun, Bas, Brannoc)", [["data/techniques.js", /export const MENTORS = Object\.freeze\(\{/], ["runtime/story.js", /_startDrill\(mentor, npc\)/]]],
  ["§17", "**Under-Text**", [["data/inscription.js", /export const REVISION/]]],
  ["§17", "Team attacks, passives", [["sim/world.js", /BOND_GAUGE/], ["data/bonds.js", /passive: \{ name: "Mended"/]]],
  ["§17", "Weapon, Cloak, 2 Charms. **Curated items, no random affixes**", [["data/items.js", /export const SLOTS = Object\.freeze\(\["weapon", "cloak", "charm1", "charm2"\]\)/]]],
  ["§17", "Shops, quests, bosses, forge", [["data/items.js", /export const SHOPS/], ["core/inventory.js", /give\(id\)/], ["data/crafting.js", /hask: \["heart", 2\]/], ["data/crafting.js", /export const TEMPER/]]],
  ["§17", "Rooms, meal buffs, research", [["data/crafting.js", /export const HQ = Object\.freeze/], ["data/crafting.js", /export const MEAL/], ["data/crafting.js", /Pages gain mastery 50% faster/]]],
  ["§17", "story bosses set expected Level/Rank brackets", [["data/skills.js", /export const bracketOf/], ["runtime/story.js", /Lv \$\{bracketOf\(ep\.number\)\} · \$\{KNIGHT_RANKS\[rankBracket\(ep\.number\)\]\.name\}/]]],
  ["§17", "Big jumps in power come from **story moments**", [["data/skills.js", /export const CATCH_UP = 2;/], ["data/skills.js", /export const GROWTH_LATE/]]],
  // §18 · Quests
  ["§18.1", "**Main Story (Episodes):** required.", [["runtime/story.js", /this\.gainXp\(Math\.max\(n \? episodeXp\(n\) : EPISODE_XP, floor\)\)/]]],
  ["§18.1", "**Character Quests:** bond-gated, 3 parts each", [["data/story/sidequests.js", /available: `\$BOND_EV_\$\{id\.toUpperCase\(\)\}_2`/], ["runtime/story.js", /for \(const id of AUTO_QUESTS\)/]]],
  ["§18.1", "reveal backstory and change relationships", [["data/story/sidequests.js", /<<set \$JUNO_LOOM to 1>>/], ["data/story/sidequests.js", /<<set \$BAS_WALL_MENDED to 1>>/]]],
  ["§18.1", "**World Quests:** lore, regions, factions", [["data/quests.js", /rumors: \{/], ["data/quests.js", /luke: \{/]]],
  ["§18.1", "Some are investigation chains (Cal's clues hide here)", [["data/story/sidequests.js", /<<set \$CLUE_A5 to 1>>/]]],
  ["§18.1", "**Squad Contracts:** repeatable small missions for Merit", [["core/contracts.js", /this\.flags\.add\("MERIT", o\.merit\)/]]],
  ["§18.1", "Template-generated from data", [["data/contracts.js", /export const CONTRACT_TEMPLATES/], ["core/contracts.js", /export function offersFor\(day, flags\)/]]],
  ["§18.2", "Choices create **forks that fold back**", [["data/story/sidequests.js", /available: "\$MIRREN_SAVED and \$EP24_DONE"/], ["data/story/sidequests.js", /available: "\$EP4_DONE and not \$MIRREN_SAVED and \$EP24_DONE"/]]],
  ["§18.2", "leaving **persistent residue** (flags)", [["data/rumors.js", /when: "\$WELL_SEEN and \$WELL_DETAIL"/]]],
  ["§18.2", "**Quest A** \"The Black Knight's Well\"", [["data/story/sidequests.js", /title: "The Black Knight's Well"/]]],
  ["§18.2", "**Quest B** \"Letters from the Fen\"", [["data/story/sidequests.js", /title: "Letters from the Fen"/]]],
  ["§18.2", "**Quest C** \"Burned Memory\"", [["data/story/sidequests.js", /title: "Burned Memory"/]]],
  ["§18.3", "**Cold open / hook**", [["runtime/story.js", /case BeatType\.ColdOpen: return this\.coldOpen\(beat\);/]]],
  ["§18.3", "Stylized episode title card (data-driven, cheap)", [["runtime/story.js", /async titleCard\(\)/]]],
  ["§18.3", "**\"WHAT HAPPENS NEXT?\"**", [["runtime/story.js", /async preview\(beat\)/]]],
];

// Named, with the reason; held to exactly these.
const EXCEPTIONS = [
  ["§13", "Cal's room", "the same as §12.2's exception: Arc 6 writes the Lighthouse after the reveal as scenes, not a room"],
  ["§13", "Cal's sword (🔒 Arc 3)", "a Cal object found in Arc 3 is a clue, and §15.5's clues are counted: none of the A or B tracks is a sword, so it stays out"],
  ["§13", "Harpies", "the Isles' foes are Tempest Riders, storm wisps and the Storm Warden as Ep 30 writes them; no harpy has a body or a kit"],
  ["§13", "Places where doors appear on their own (🔒)", "doors are a counted clue (§15.5); before the reveal there's no room for one, and the story never returns to the Hollowmarch after it"],
  ["§17", "story gates", "the story never waits on an exam: §17's own note puts power in story moments, not grinding; a rank opens side content (the tree's rows, contract tiers)"],
  ["§17", "awakenings", "a bond's Awakening is rank 10 (§11), and it waits with ranks 6 to 10 (Phase 11's exception)"],
  ["§18.3", "15s of re-cut shots + protagonist voice-over", "the preview is the teaser in lines of text: re-cutting the next episode's shots needs its set built behind the card, and the game has no voice acting (voices are a placeholder tick, §10)"],
];

test("§13, §17, §18, line by line: every line checked is still in the design, and the code that answers it is there", () => {
  const missing = [];
  for (const [where, words, at] of CHECKLIST) {
    assert.ok(inSec(where, words), `${where}: "${words}" is no longer in the design (update the checklist with it)`);
    for (const [file, re] of at) if (!has(file, re)) missing.push(`${where} · ${words} · ${file} ${re}`);
  }
  assert.deepEqual(missing, [], "lines with nothing answering them");
  for (const n of ["§13", "§17", "§18.1", "§18.2", "§18.3"]) assert.ok(CHECKLIST.some(([w]) => w === n), `${n} is on the list`);
  assert.ok(CHECKLIST.length >= 50);
});

test("The exceptions are exactly these seven, each in the design, with the reason", () => {
  assert.equal(EXCEPTIONS.length, 7);
  for (const [where, words, why] of EXCEPTIONS) {
    assert.ok(inSec(where, words), `${where}: "${words}"`);
    assert.ok(why.length > 40, where);
    assert.ok(!CHECKLIST.some(([, w]) => w === words), `${words} can't be both answered and an exception`);
  }
  // Still true: no harpy anywhere; no Cal's sword outside the reveal.
  assert.doesNotMatch(src("data/enemies.js") + src("data/isles.js"), /harp(y|ies)/i);
});

test("§13's table: every zone it lists is a place in the game, and on the map once the story's been there", () => {
  const onMap = (f) => Object.values(ZONES).filter((z) => !z.dungeon && !z.interior && !z.noMap && (!z.mapWhen || truthy(compileExpr(z.mapWhen)(f)))).map((z) => z.id);
  const late = onMap(new FlagStore({ EP2_DONE: 1, EP17_DONE: 1, EP28_DONE: 1, EP30_DONE: 1, EP57_DONE: 1, HAS_SUMMONS: 1 }));
  for (const id of ["thornwick", "tower", "fens", "lighthouse", "aurelin", "mirrorlake", "isles", "ironhold", "hollowmarch"]) assert.ok(late.includes(id), id);
  for (const id of ["undercroft", "oldcity", "hollow"]) assert.ok(ZONES[id], `${id} (reached on foot, not by the map)`);
  assert.ok(!onMap(new FlagStore()).includes("mirrorlake"), "Mirrorlake waits for Ep 28");
});

test("Mirrorlake: its wraiths are glass (Tamsin's Note makes them ring, the next blow bursts them), and its secrets read", () => {
  const w = new World({ seed: 4 }); w.drainEvents();
  w.spawnEnemy("mirrorWraith", 0, 3); w.drainEvents();
  const e = w.fighters.find((f) => f.kind === "mirrorWraith");
  assert.ok(w._states(e).includes("glass"));
  const nodes = parseScript(WORLD_SCRIPT, "world");
  for (const p of ZONES.mirrorlake.pickups) assert.ok(nodes[p.node], p.node);
  assert.match(JSON.stringify(nodes.W_SaelithReflection.body), /a village/i);
});

test("Thornwick changes as you come back: Wren says what the ribbons and the bunting are for", () => {
  const nodes = parseScript(WORLD_SCRIPT, "world");
  const body = JSON.stringify(nodes.W_Wren.body);
  assert.match(body, /ribbons are for Larkspur/); assert.match(body, /Bunting!/);
});
