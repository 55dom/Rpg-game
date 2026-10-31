import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { EPISODE_58 } from "../src/reveal/ep58.js";
import * as A from "../src/reveal/arcs.js";
import { CAL_MEMBER, MAELIS_ALLY, PRAYER, RATINGS, ratingOf, UNWRITTEN_MODS, ARC7_ENEMIES } from "../src/reveal/arc7.js";
import { ENEMIES } from "../src/data/enemies.js";
import { COMPANIONS } from "../src/data/companions.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const N = [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
const mods = Object.fromEntries(await Promise.all(N.map(async (n) => [n, await import(`../src/reveal/ep${n}.js`)])));
const ep = (n) => mods[n][`EPISODE_${n}`], script = (n) => mods[n][`EP${n}_SCRIPT`];
const nodes = Object.fromEntries(N.map((n) => [n, parseScript(script(n), `e${n}`)]));
const run = (n, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes[n], f, { name: "Rook" }).start(title), out = [];
  let opts = null;
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") { opts = s.options; const ok = s.options.filter((o) => o.enabled); r.choose((ok[Math.min(pick, ok.length - 1)] ?? s.options[0]).index); }
  }
  return { f, out, opts, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};
const beat = (n, id) => ep(n).beats.find((b) => b.id === id);

test("Arc 7 runs Ep 58 → 70: every episode registered, valid, chained, and started from what came before; everything it points at exists", () => {
  assert.equal(EPISODE_58.beats.find((b) => b.type === "preview").nextEpisode, "ep59");
  for (const n of N) {
    const e = ep(n);
    validateEpisode(e, nodes[n]);
    assert.equal(e.arc, "Arc 7 · Unwritten");
    assert.deepEqual(e.setup, { ...A[`AFTER_EP${n - 1}`] });
    assert.match(src("main.js"), new RegExp(`from "\\./reveal/ep${n}\\.js"`));
    const next = e.beats.find((b) => b.type === "preview").nextEpisode;
    assert.equal(next, n < 70 ? `ep${n + 1}` : undefined);
    for (const b of e.beats) {
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of b.cast ?? []) if (c.look) assert.ok(LOOKS[c.look], c.look);
      for (const k of [...(b.wave ?? []), ...(b.siege?.foes ?? []).map((f) => f.kind)]) assert.ok(ENEMIES[k], k);
      for (const k of Array.isArray(b.world?.companions) ? b.world.companions : []) assert.ok(COMPANIONS[k], k);
      if (b.type === "explore") for (const id of b.required) assert.ok([...b.cast, ...(b.pickups ?? [])].some((c) => c.id === id), id);
    }
    for (const t of Object.keys(nodes[n])) for (const k of [0, 1, 2]) for (const l of run(n, t, A.AFTER_EP69, k).out) if (l.speaker) assert.ok(CAST[l.speaker], `ep${n} ${t}: ${l.speaker}`);
  }
  assert.equal(A.AFTER_EP70.STORY_COMPLETE, 1);
});

test("The Key (§27.1): 'Doors don't have locks. They have keys.' It opens from this side; the Line, still holding fifteen years on", () => {
  const d = run(59, "Ep59_Door");
  assert.match(d.text, /Doors don't have locks\. They have keys\./);
  assert.equal(d.f.get("LARKSPUR_OPEN"), 1);
  assert.ok(run(59, "Ep59_Door", {}, 1).text.includes("doors don't have locks. They have keys."), "either way, the words get said");
  assert.match(run(59, "Ep59_Arrive").text, /"Hold the line\."/);
  assert.match(run(60, "Ep60_Bunk").text, /"He served\. That is not all\."/);
  assert.ok(beat(60, "marshal").wave.includes("lineMarshal"));
});

test("The two in black stay nameless and wordless everywhere (§28.3): ids only, no cast entry, sound for speech; the budget of references holds", () => {
  const all = N.map(script).join("\n") + src("reveal/arc7.js") + src("reveal/allies.js");
  assert.doesNotMatch(all, /\b(butler|maid|archdemons?|musician|Ghorran|Vaelith)\b/i);
  assert.doesNotMatch(src("reveal/cutscenes.js"), /\b(butler|maid|archdemons?|musician)\b/i, "the Commanders keep their names from Backlash; what they became has none");
  assert.ok(!CAST.unkA && !CAST.unkB);
  for (const n of N) for (const t of Object.keys(nodes[n])) assert.ok(!run(n, t, A.AFTER_EP69).out.some((l) => /^unk/i.test(l.speaker ?? "")), `ep${n} ${t}`);
  // V5–V8: once each, never two in one episode (§28.4).
  const where = { V5: /Don't make those for anyone\./, V6: /Doors, Tamsin\. I make doors\./, V7: /Family\. Sort of\./, V8: /one word answers/ };
  const hits = Object.fromEntries(Object.entries(where).map(([v, re]) => [v, N.filter((n) => re.test(script(n)))]));
  assert.deepEqual(hits, { V5: [63], V6: [64], V7: [66], V8: [67] });
  assert.match(script(61), /<<shot on unkA>>[\s\S]*painted frown doesn't move/);
  assert.equal(beat(70, "fall") && CUTSCENES.ep70_fall.actors.filter((a) => /^unk/.test(a.id)).every((a) => a.look === a.id), true, "the Fall's two in black: the concealed forms, known by their ids");
});

test("The Hero Party (§27.3–4): Corin tests and yields; Maelis as a guest whose prayer mends; 'You. The one who didn't kill me.'", () => {
  const c = beat(61, "corin");
  assert.equal(c.siege.foes[0].kind, "heroKnightNow");
  assert.ok(c.siege.foes[0].floor > 0, "he yields; he never dies");
  assert.equal(COMPANIONS.maelisAlly, MAELIS_ALLY);
  assert.equal(MAELIS_ALLY.guest, true);
  const sup = MAELIS_ALLY.supports()[0];
  assert.equal(sup.kind, "heal");
  assert.equal(PRAYER.startup, 600, "a ten-second prayer");
  assert.ok(beat(62, "night").world.companions.includes("maelisAlly"));
  assert.match(run(62, "Ep62_Fire").text, /I have one left\. One more, and I fall off the page\./);
  const m = run(63, "Ep63_Corin");
  assert.match(m.text, /Corin: You\. The one who didn't kill me\. \| Cal: You were more interesting alive\. \| Cal: You did kill me, actually\. At the throne-room doors\. Didn't take\./);
  const d = run(63, "Ep63_Door");
  assert.equal(d.f.get("DAGRUN_LOOKED"), 1, "Dagrun's Arc 7 quest: he made him look");
});

test("The warning (§27.6) and the alliance (§27.7): three offerings; 'They'd have told me.'; Cal on the tag-swap bench; the Thousand-Door Verse", () => {
  const w = run(65, "Ep65_Mural");
  assert.match(w.text, /They're counting\. One\. Two\. Three\./);
  assert.match(w.text, /The two who serve\. And the one they brought back with them\./);
  assert.match(w.text, /"three given, and the lid lifted\."/);
  const t = run(65, "Ep65_Tell");
  assert.match(t.text, /Cal: They'd have told me\./);
  assert.equal(t.f.get("BAS_TRUCE"), 1, "Bas's Arc 7 quest");
  const f = beat(66, "formation");
  assert.deepEqual(f.world.party, [CAL_MEMBER]);
  assert.equal(CAL_MEMBER.kind, "calPlayer");
  const world = new World({ seed: 3, party: [CAL_MEMBER] });
  assert.equal(world.members.cal.kind, "calPlayer", "sim/world.js takes a member spec");
  assert.ok(world.bench, "Cal waits on the bench");
  assert.ok(beat(66, "side").world.companions.includes("calAlly"));
  const v = CUTSCENES.ep66_verse.events;
  const pale = v.filter((e) => e.tear?.kind === "pale"), gold = v.filter((e) => e.tear?.kind === "gold");
  assert.equal(pale.length, gold.length);
  assert.ok(pale.length >= 6 && Math.max(...pale.map((e) => e.t)) < Math.min(...gold.map((e) => e.t)), "Rook writes the line; then a door along every letter");
  assert.equal(run(66, "Ep66_After", A.AFTER_EP65).f.get("CAL_JUNO"), "family", "Juno's Arc 7 quest");
});

test("The Rite of Waking (§27.8): Star Sight, and nothing over Rook; the coffin answers; he takes it; Layer 10; 'Now, Rook. Write me.'", () => {
  const c = run(67, "Ep67_Circle");
  assert.equal(c.f.get("STAR_SIGHT"), 1);
  assert.match(script(67), /title: Ep67_Circle[\s\S]*?<<stars on>>/);
  assert.match(c.text, /Over him, one star, and a question mark\./);
  assert.match(c.text, /Lio: Rook\. There's nothing over you\./);
  const circle = beat(67, "circle");
  assert.equal(circle.rookStars, undefined, "nothing over Rook");
  assert.equal(circle.cast.find((x) => x.id === "cal").stars, "?");
  assert.deepEqual(circle.cast.filter((x) => /^unk/.test(x.id)).map((x) => x.stars), [5, 5]);
  assert.equal(RATINGS.corin, 5);
  assert.equal(ratingOf("player"), null);
  assert.equal(ratingOf("calRite"), "?");
  assert.match(src("main.js"), /ratingOf\(/, "and from then on, over everyone in a fight");
  assert.match(src("runtime/story.js"), /case "star": this\.stage\.setStars\(actorOf\(args\[0\]\), args\[1\] === "\?" \? "\?"/);
  const a = run(67, "Ep67_Answer");
  assert.equal(a.f.get("V8_HEARD"), 1);
  assert.equal(a.f.get("CAL_ASCENDED"), 1);
  assert.match(script(67), /<<star unkA 0>>\n<<star unkB 0>>/, "their stars pour into him");
  const tr = run(67, "Ep67_Truth");
  for (const re of [/Hesper: a boy at a gate/, /Aldric: I told Hesper where the Writ was/, /The Gate: I needed a door from your side/, /"Take the one-pager\."/, /I didn't choose where I landed\. I landed\./]) assert.match(tr.text, re);
  assert.match(tr.text, /Cal: Now, Rook\. Write me\./);
  assert.equal(tr.f.get("PAGE_TORN"), 1);
  for (const k of ["RITE_BEGUN", "PAGE_TORN"]) assert.match(src("reveal/sets.js"), new RegExp(`K\\.when\\("\\$${k}"\\)`));
});

test("The Shared Star (§25.4): given freely, nobody loses anything, and seven over Rook on a scale that stops at five; Unwritten", () => {
  const g = run(69, "Ep69_Gift");
  assert.match(g.text, /Maelis: Take mine\. It's the last one\./);
  for (const who of ["Juno", "Bas", "Tamsin", "Lio", "Severin", "Dagrun"]) assert.match(g.text, new RegExp(`${who}: [^|]*(mine|Mine)`), who);
  assert.match(script(69), /<<star Rook 7>>/);
  assert.doesNotMatch(script(69), /<<star (juno|bas|tamsin|lio|severin|dagrun|maelis) /i, "the givers keep theirs");
  assert.equal(g.f.get("SHARED_STAR"), 1);
  assert.equal(g.f.get("UNWRITTEN"), 1);
  const u = beat(69, "unwritten");
  assert.deepEqual(u.world.mods, UNWRITTEN_MODS);
  assert.match(src("main.js"), /mods: addMods\(statMods\(partyOf\(opts\.companions\)\), opts\.mods\)/, "a beat's own mods are kept, not replaced by gear");
  assert.ok(beat(68, "together").siege.foes[0].floor >= 0.7, "above the scale, nothing below it marks him much");
});

test("The Clause (§27.10): Fall, Stay, or (earned) Lantern; each its own last scene; names on the continent; the light on", () => {
  const LANTERN = { ...A.AFTER_EP69 };
  const fall = run(70, "Ep70_Clause", LANTERN, 0), stay = run(70, "Ep70_Clause", LANTERN, 1), lan = run(70, "Ep70_Clause", LANTERN, 2);
  assert.deepEqual([fall, stay, lan].map((r) => r.f.get("CAL_FATE")), ["fall", "stay", "lantern"]);
  assert.match(stay.text, /A soldier again\. Huh\./);
  assert.match(lan.text, /Rook: You're a Lantern\. That's all you have to be\./);
  assert.equal(lan.f.get("CAL_STATE"), 0, "his lantern at the Lighthouse relights (runtime/sets.js: not $CAL_STATE)");
  assert.match(src("runtime/sets.js"), /calLitN = K\.when\("not \$CAL_STATE"\)/);
  assert.match(CUTSCENES.ep70_fall.events.find((e) => typeof e.caption === "string" && e.caption.includes("Lucky")).caption, /Another one\? Lucky me\./);
  assert.ok(CUTSCENES.ep70_fall.events.some((e) => e.tear?.kind === "void"), "a perfect black circle");
  // The Lantern ending has to be earned: Juno's, Dagrun's and Bas's quests, and his bond.
  for (const miss of [{ CAL_JUNO: "unresolved" }, { DAGRUN_LOOKED: 0 }, { BAS_TRUCE: 0 }, { BOND_CAL: 100 }]) {
    const r = run(70, "Ep70_Clause", { ...LANTERN, ...miss });
    assert.equal(r.opts.find((o) => /Lantern/.test(o.text)).enabled, false, JSON.stringify(miss));
  }
  for (const id of ["fall", "stay", "lantern"]) assert.equal(beat(70, id).if, `$CAL_FATE == "${id}"`);
  const names = run(70, "Ep70_Names", { CAL_FATE: "lantern" });
  assert.match(names.text, /Four: .*I would like to be called Tally\./);
  assert.match(names.text, /along every Line on the continent/);
  assert.match(run(70, "Ep70_Names", { CAL_FATE: "fall" }).text, /A few of them, at the table\./);
  const home = run(70, "Ep70_Home", { CAL_FATE: "lantern" });
  assert.match(home.text, /Dagrun: Then I'll leave the light on\./);
  assert.equal(home.f.get("STORY_COMPLETE"), 1);
  assert.equal(beat(70, "home").cast.find((c) => c.id === "cal").when, "$CAL_FATE == \"lantern\"");
});

test("Arc 7's fighters hold together in the sim: no NaN, Cal's final kit is a boss, and the Throne Guard is the Line's", () => {
  for (const [kind, def] of Object.entries(ARC7_ENEMIES)) for (const k of ["runSpeed", "circleSpeed", "turnRate", "radius", "height"]) assert.ok(Number.isFinite(def.stats[k]), `${kind}.${k}`);
  assert.equal(ARC7_ENEMIES.calRite.stats.boss, true);
  for (const [n, id] of [[61, "corin"], [68, "together"], [69, "unwritten"]]) {
    const b = beat(n, id), w = new World({ seed: 7, bounds: ZONES.throne.bounds, ...b.world, party: [] }), s = new Siege(w, b.siege).start();
    for (let i = 0; i < 600; i++) { w.step({}); s.step(); }
    for (const f of w.fighters) assert.ok(Number.isFinite(f.pos.x) && Number.isFinite(f.pos.z), `ep${n}/${id}: ${f.kind}`);
  }
});
