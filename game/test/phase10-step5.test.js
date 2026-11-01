// Phase 10's gate (GDD §23.9): every line §16 writes is in its fight. This walks §16 boss by boss: each line it checks
// must still be in the GDD (so the list can't drift from the design), and the code that answers it must be there.
// Behaviour is tested where each piece was built; this is the map from the design to the code, kept honest.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const gdd = readFileSync(new URL("../../docs/GDD.md", import.meta.url), "utf8");
const S16 = gdd.slice(gdd.indexOf("## 16. THE FIRST 10 BOSSES"), gdd.indexOf("## 17. PROGRESSION"));
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const has = (file, re) => re.test(src(file));

/** [boss, the words in §16, where it's answered: [file, pattern][] ] */
const CHECKLIST = [
  // B1 · Severin, the Exam Duel (Ep 2)
  ["B1", "Star Needles at range", [["data/severin.js", /id: "StarNeedles"/]]],
  ["B1", "places stars around the arena, so lines between them become hazards", [["sim/boss.js", /placeStars\(\)/], ["sim/boss.js", /type: "starStrike"/]]],
  ["B1", "stars dim if you knock him off his \"Polaris\" point", [["sim/boss.js", /_dim\(\)/], ["sim/boss.js", /type: "starsDim"/]]],
  ["B1", "One page. They should've given you none.", [["data/story/ep2.js", /\["Severin", "One page\. They should've given you none\."\]/]]],
  ["B1", "win or lose both continue", [["data/story/ep2.js", /setWin: \{ EXAM_DUEL_WON: 1 \}, setLose: \{ EXAM_DUEL_WON: 0 \}/]]],
  // B2 · Hask the Bogwarden (Ep 4)
  ["B2", "submerges; mud waves apply WEIGHTED", [["data/hask.js", /applyTags: \[\["WEIGHTED"/]]],
  ["B2", "pulls swamp logs into a barricade", [["sim/boss.js", /type: "fortRise"/]]],
  ["B2", "the bog drains (arena floor changes), revealing its soft underside", [["sim/boss.js", /"EXPOSED"/]]],
  ["B2", "Gale launches it out of the mud", [["sim/boss.js", /uproot\(by\)/]]],
  ["B2", "burning the reeds blocks its submerge points", [["sim/boss.js", /type: "reedsBurn"/]]],
  ["B2", "Fen villagers' Renown +", [["data/story/ep4.js", /add: \{ RENOWN_FENS: \d+ \}/]]],
  ["B2", "drops Rare page *Vacuum Pull*", [["data/story/ep4.js", /PAGE_VACUUM_PULL to 1/]]],
  // B3 · Deacon Ilse Marrowind (Ep 6)
  ["B3", "**Silence zones**, inside which spells can't be cast", [["sim/boss.js", /w\.addSilence\(/]]],
  ["B3", "summons Choir acolytes and hides in the choir pit", [["sim/boss.js", /type: "pitHide"/], ["sim/boss.js", /type: "pitRise"/]]],
  ["B3", "bells ring across the arena; you must destroy them to break the silence", [["sim/boss.js", /type: "bellsBroken"/]]],
  ["B3", "she *silences your dodges*", [["sim/boss.js", /type: "hushDodge"/]]],
  ["B3", "tries to erase the town's memory of her; Rook's grimoire resists", [["sim/boss.js", /type: "unsinging"/], ["sim/boss.js", /type: "grimoireResists"/]]],
  ["B3", "a town remembers you", [["data/story/ep6.js", /add: \{ RENOWN_FENS: \d+ \}/]]],
  // B4 · Sir Galen the Rusted (Ep 8)
  ["B4", "classical knight, shield and lance", [["sim/world.js", /galen: \{[^\n]*frontalGuard: true/]]],
  ["B4", "Rot magic corrodes your guard", [["data/bosses2.js", /\["RUSTED", 360\]/]]],
  ["B4", "he collapses the Tower's floor", [["sim/boss.js", /type: "collapse"/], ["sim/boss.js", /type: "caught"/]]],
  ["B4", "immune to staggers until you break 3 rusted vow-seals", [["sim/boss.js", /type: "oath"/], ["sim/boss.js", /type: "oathBroken"/]]],
  ["B4", "desperation charge across the whole Tower", [["sim/boss.js", /type: "desperate"/]]],
  ["B4", "the *page highlights* the seal you must hit", [["sim/boss.js", /type: "lastVow"/], ["sim/boss.js", /type: "inkMark"/]]],
  ["B4", "Iron Wardens respect +", [["data/story/ep8.js", /add: \{ REP_SQUAD: \d+ \}/]]],
  ["B4", "Galen's lantern (in the Hall) finally goes out", [["data/lore.js", /Tonight, it went out properly/]]],
  // B5 · Gullmaw (Ep 12)
  ["B5", "Tongue lash (reels you in)", [["data/bosses2.js", /id: "Tongue"/]]],
  ["B5", "Belly-Flop leap (unblockable, splash ring: jump it)", [["data/bosses2.js", /id: "Flop"/]]],
  ["B5", "Bile Spit fan (WEIGHTED)", [["sim/boss.js", /_cogFan\("Bile"/]]],
  ["B5", "**Lily Pad Leap**", [["sim/boss.js", /_startLeap\(\)/], ["sim/boss.js", /type: "padSmash"/]]],
  ["B5", "two bile egg sacs on the cistern floor spit at you", [["sim/boss.js", /"eggsac"/]]],
  ["B5", "a high-pressure water jet sweeps the floor in a circle", [["sim/boss.js", /type: "flood"/]]],
  ["B5", "it gulps an AI ally and spits them out in a slime bubble", [["sim/boss.js", /type: "swallowed"/]]],
  ["B5", "Weak: Storm (WET + CHARGED)", [["sim/boss.js", /get weakTo\(\) \{ return GULLMAW_TUNING\.weak; \}/], ["data/bosses2.js", /weak: Object\.freeze\(\{ Conduction:/], ["sim/boss.js", /w\.applyTag\(t, "CHARGED", L\.charge, w\.player, seen\)/]]], // (Phase 11 Step 2: the cistern's arc-lamps)
  ["B5", "Severin owes you a debt (flag); Lowmarket Renown ++", [["data/story/ep12.js", /SEVERIN_DEBT: 1/], ["data/story/ep12.js", /add: \{ RENOWN_AURELIN: \d+ \}/]]],
  // B6 · The Cantor Twins (Ep 15)
  ["B6", "they swap magic", [["sim/twins.js", /type: "twinSwap"/]]],
  ["B6", "the hall fills with smoke and mirrors and you must find the real twin", [["sim/twins.js", /type: "smokeUp"/], ["sim/twins.js", /type: "mirrorShift"/]]],
  ["B6", "kill one and the other **absorbs their magic**", [["sim/twins.js", /type: "twinAbsorb"/]]],
  ["B6", "Gale disperses smoke", [["sim/twins.js", /disperse\(by\)/]]],
  ["B6", "Resonance shatters mirrors", [["sim/twins.js", /export function shatterNote/], ["data/story/ep15.js", /companions: \["bas", "juno", "tamsin"\]/]]],
  ["B6", "Lio can try to *read* one dying twin's memory", [["data/story/ep15.js", /<<set \$LIO_READ_TWIN to 1>>/]]],
  // B7 · The Hollow Bloom (Ep 18)
  ["B7", "Cal fighting alongside you (his strongest Assists)", [["data/story/ep18.js", /companions: \["bas", "juno", "cal"\]/], ["data/cal.js", /export const THRESHOLD/]]],
  ["B7", "the Bloom **erases parts of the arena**", [["sim/bloom.js", /type: "holeOpen"/]]],
  ["B7", "you're inside its petals in a memory-like space", [["sim/bloom.js", /type: "memoryBegin"/]]],
  ["B7", "erasing *party members' grimoire pages*", [["sim/bloom.js", /type: "pageErased"/]]],
  ["B7", "you and Cal hold off the detonation", [["sim/siege.js", /_beginHold\(\)/], ["data/story/ep18.js", /hold: \{ frames: \d+/]]],
  ["B7", "`CAL_STATE=1`", [["data/story/ep18.js", /CAL_STATE: 1/]]],
  // B8 · General Varka Ironsong (Ep 22)
  ["B8", "on the ground beneath the engine", [["sim/varka.js", /spawnObject\("engine"/]]],
  ["B8", "board the engine; fight on the moving deck", [["sim/varka.js", /type: "deckUp"/], ["sim/world.js", /_deck\(\) \{/]]],
  ["B8", "the engine breaks apart and the arena becomes falling sections", [["sim/varka.js", /type: "deckSections"/]]],
  ["B8", "Railgun combo (Storm + Magnet)", [["data/ashfall.js", /Railgun: defineAbility/]]],
  ["B8", "Brannoc's *Final Vow* team attack (scripted) ends her; Brannoc dies", [["sim/varka.js", /type: "finalVow"/], ["data/story/ep22.js", /<<set \$BRANNOC_DEAD to 1>>/]]],
  // B9 · The masked knight, Encounter II (Ep 26)
  ["B9", "Severance blink-cuts", [["sim/masked.js", /key === "severOut"/]]],
  ["B9", "cuts tears beneath you and drops *you* from the sky", [["sim/masked.js", /_undercut\(t\)/]]],
  ["B9", "every exit loops back into the arena", [["sim/masked.js", /type: "severMouths"/]]],
  ["B9", "*Sever Line*, a cut that splits the arena in two and isolates one party member", [["sim/masked.js", /_severLine\(\)/]]],
  ["B9", "at 25% HP he takes the artifact and leaves", [["sim/masked.js", /type: "severLeave"/]]],
  ["B9", "tears take a moment to close (punish him while one is open)", [["sim/masked.js", /type: "severExposed"/]]],
  ["B9", "`BAS_ARM_BROKEN=true`", [["data/story/ep26.js", /BAS_ARM_BROKEN: 1/], ["data/story/ep26.js", /<<set \$SABLE_ENCOUNTER to 2>>/]]],
  // B10 · Severin Eclipsed (Ep 28)
  ["B10", "corrupted Starlight, where stars become black holes", [["sim/eclipse.js", /type: "darkStar"/]]],
  ["B10", "summons a corrupted zodiac beast", [["sim/eclipse.js", /type: "lionCalled"/]]],
  ["B10", "Mirrorlake shows two arenas, one per reflection, and you swap sides", [["sim/eclipse.js", /type: "mirrorSwap"/]]],
  ["B10", "erase your Ultimate gauge", [["sim/eclipse.js", /type: "eclipseClause"/]]],
  ["B10", "Rook falls into the lake", [["sim/eclipse.js", /type: "eclipseSink"/], ["data/story/ep28.js", /<<set \$ANNOTATION to 1>>/]]],
  ["B10", "*Ink & Starlight* proto-team attack", [["sim/eclipse.js", /type: "inkStarlight"/]]],
  ["B10", "`SEVERIN_ECLIPSED=true`", [["data/story/ep28.js", /SEVERIN_ECLIPSED: 1/]]],
];

/**
 * The two lines of §16 no fight can answer in its own episode, and why. If either becomes answerable (someone in that
 * party gets the magic), it moves into the checklist.
 */
const EXCEPTIONS = [ // (Gullmaw's Storm weakness left this list in Phase 11 Step 2: the cistern's arc-lamps carry the charge)
  ["B9", "Sunlance and Candle light disrupt Severance", "Sunlance is the Paragon's (Arc 5) and nobody carries Candle light by Ep 26 (Bas and Juno beside you)"],
];

test("§16, boss by boss: every line checked is still in the design, and the code that answers it is there", () => {
  const missing = [];
  for (const [boss, words, where] of CHECKLIST) {
    assert.ok(S16.includes(words), `${boss}: "${words}" is no longer in §16 (update the checklist with the design)`);
    for (const [file, re] of where) if (!has(file, re)) missing.push(`${boss} · ${words} · ${file} ${re}`);
  }
  assert.deepEqual(missing, [], "lines of §16 with nothing answering them");
});

test("All ten bosses are on the list, each with its phases", () => {
  const bosses = new Set(CHECKLIST.map(([b]) => b));
  for (let i = 1; i <= 10; i++) assert.ok(bosses.has(`B${i}`), `B${i}`);
  for (let i = 1; i <= 10; i++) assert.ok(S16.includes(`**B${i} ·`), `§16 still has B${i}`);
  assert.ok(CHECKLIST.length >= 60);
});

test("The exceptions are exactly the lines no party can reach yet (one, since Phase 11), named, with the reason", () => {
  assert.equal(EXCEPTIONS.length, 1);
  for (const [boss, words, why] of EXCEPTIONS) {
    assert.ok(S16.includes(words), `${boss}: "${words}"`);
    assert.ok(why.length > 30);
    assert.ok(!CHECKLIST.some(([b, w]) => b === boss && w === words));
  }
  // Still true: no Sunlance in the Ep 26 party.
  assert.doesNotMatch(src("data/companions.js"), /Sunlance|Candle/);
});

test("Renown from a boss is paid once: playing an episode again doesn't pay twice", async () => {
  const { EpisodeDirector } = await import("../src/sim/episode.js");
  const { FlagStore } = await import("../src/core/flags.js");
  const f = new FlagStore();
  const ep = { id: "t", beats: [{ id: "b", type: "fight", wave: ["hask"], set: { HASK_DEFEATED: 1 }, add: { RENOWN_FENS: 6 } }, { id: "p", type: "preview" }] };
  for (let i = 0; i < 2; i++) { const d = new EpisodeDirector(ep, f); d.start(0); d.complete({ won: true }); }
  assert.equal(f.get("RENOWN_FENS"), 6);
});
