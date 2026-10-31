import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EPISODE_CALPATH, CALPATH_SCRIPT } from "../src/reveal/calpath.js";
import { AFTER_EP50 } from "../src/reveal/arcs.js";
import { ENEMIES } from "../src/data/enemies.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { standsInWall } from "../src/core/framing.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";
import { SHEETS } from "../src/data/sheets.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const nodes = parseScript(CALPATH_SCRIPT, "cp");
const run = (title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};
const beat = (id) => EPISODE_CALPATH.beats.find((b) => b.id === id);

test("Cal's Path is in the Lore Archive's list once the Field Notes are found: labelled, valid, and everything it points at exists", () => {
  validateEpisode(EPISODE_CALPATH, nodes);
  assert.equal(EPISODE_CALPATH.label, "CAL'S PATH");
  assert.equal(EPISODE_CALPATH.unlockAt, 51, "after Ep 50, where the Field Notes are found");
  assert.deepEqual(EPISODE_CALPATH.setup, { ...AFTER_EP50 });
  assert.match(src("main.js"), /from "\.\/reveal\/calpath\.js"/);
  assert.match(src("main.js"), /e\.label \?\? `EP \$\{e\.number\}`/);
  assert.equal(EPISODE_CALPATH.memory, true);
  assert.equal(beat("after").memory, false, "Part 3 is the present day");
  for (const b of EPISODE_CALPATH.beats) {
    if (b.cutscene) { assert.ok(CUTSCENES[b.cutscene], b.cutscene); validateCutscene(CUTSCENES[b.cutscene]); }
    for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) if (c.look) assert.ok(LOOKS[c.look], c.look);
    for (const k of [...(b.wave ?? []), ...(b.siege?.foes ?? []).map((f) => f.kind)]) assert.ok(ENEMIES[k], k);
  }
  for (const t of Object.keys(nodes)) for (const l of run(t).out) if (l.speaker) assert.ok(CAST[l.speaker], `${t}: ${l.speaker}`);
  assert.equal(CAST.Young.actor, "player", "the boy on screen is the player");
});

test("Every scene stands clear of the sets' walls and of each other (the framing suite only reads ep*.js)", () => {
  const scaleOf = (l) => LOOKS[l]?.scale ?? 1, R = (l) => 0.42 * scaleOf(l);
  const wallsFor = (b) => { const z = Object.values(ZONES).find((z) => z.stage === b.stage && !z.roamOnly); return z ? { ...z.bounds, interior: !!z.interior } : null; };
  let n = 0;
  for (const b of EPISODE_CALPATH.beats.filter((x) => x.type === "scene" || x.type === "explore")) {
    const ppl = [...(b.cast ?? []).filter((c) => !c.down), ...(b.rook ? [{ id: "rook", look: "player", ...b.rook }] : [])];
    for (const a of [...ppl, ...(b.cast ?? []).filter((c) => c.down)]) assert.ok(!standsInWall(a, wallsFor(b), 0.2, !a.down), `${b.id}: ${a.id}`);
    for (let i = 0; i < ppl.length; i++) for (let j = i + 1; j < ppl.length; j++) {
      const a = ppl[i], c = ppl[j];
      assert.ok(Math.hypot(a.x - c.x, a.z - c.z) >= R(a.look) + R(c.look) + 0.25, `${b.id}: ${a.id} and ${c.id}`);
    }
    n++;
  }
  assert.ok(n >= 12);
  assert.ok(ZONES.larkspurFire.stage === "larkspur");
});

test("Part 1, the Astral Path (CIN-05C): carried, grinning; the hum and the whistle; five stars over each for one cut; no names, and no words", () => {
  const cs = CUTSCENES.cp_astral;
  assert.equal(cs.stage, "astral");
  assert.match(src("runtime/sets.js"), /astral: buildAstral/);
  const unk = cs.actors.filter((a) => /^unk/.test(a.id));
  assert.deepEqual(unk.map((a) => a.id).sort(), ["unkA", "unkB"]);
  for (const a of unk) { assert.equal(a.stars, 5); assert.ok(a.look.startsWith(a.id), "known only by their ids"); assert.ok(LOOKS[a.look].horns && LOOKS[a.look].voidMask); }
  assert.equal(LOOKS.unkAWinged.voidMask, "frown");
  assert.equal(LOOKS.unkBWinged.voidMask, "smile");
  assert.ok(SHEETS.unkAWinged.outfit.wings && SHEETS.unkBWinged.outfit.wings && !SHEETS.unkATrue.outfit.wings, "the wings come out with the disguise let go");
  assert.ok(cs.actors.find((a) => a.id === "carried").look === "ashSoldierGrin");
  const on = cs.events.find((e) => e.stars === true), off = cs.events.find((e) => e.stars === false);
  assert.ok(on && off && off.t > on.t && off.t - on.t < 2, "a single cut");
  for (const k of ["hum", "whistle"]) assert.ok(cs.events.some((e) => e.sfx === k));
  assert.ok(cs.events.some((e) => /^unkSpeech/.test(e.sfx ?? "")));
  assert.match(src("runtime/story.js"), /if \("stars" in e\) this\.stage\.showStars/);
  assert.doesNotMatch(CALPATH_SCRIPT + src("reveal/sets.js") + src("reveal/looks.js"), /\b(butler|maid|archdemons?|musician|Ghorran|Vaelith)\b/i);
  assert.ok(!CAST.unkA && !CAST.unkB);
});

test("Part 2 (Ch 6–8): stars over every villager and nothing over the infant; the first door; the step; the years; the mask", () => {
  const hb = beat("heartbeat");
  assert.ok(hb.cast.every((c) => c.stars != null), "a star (or the hollow of one) over every head");
  assert.match(run("Cp_Heartbeat").text, /⟒|⏃|⍙/, "he can't read a word of it yet");
  assert.equal(beat("step").cast.find((c) => c.id === "infant").stars, undefined, "above the child: nothing");
  assert.match(run("Cp_Infant").text, /Not zero\. Nothing at all\./);
  assert.ok(CUTSCENES.cp_door.events.some((e) => e.tear?.kind === "gold"), "his first door");
  assert.match(run("Cp_Step").text, /"Brought in by a boy who didn't speak\."/);
  assert.match(run("Cp_Learn").text, /Magic never needed words\. Only the King knew\./);
  assert.ok(beat("bell").siege.foes.every((f) => f.kind === "bellWarden" && f.floor > 0), "he lets them live");
  const study = run("Cp_Study");
  assert.match(study.text, /Aldric: A weapon like you needs an owner\./);
  assert.match(CALPATH_SCRIPT, /title: Cp_Study[\s\S]*?<<splice>>/, "a splice: something cut out of this scene");
  assert.match(run("Cp_Rain").text, /Dagrun: No grimoire, huh\. Nobody's written your story\. \| Dagrun: Good\./);
  assert.equal(beat("rain").cast.find((c) => c.id === "dagrun").stars, 3, "a quiet three");
  assert.match(run("Cp_Name").text, /Young: Calder\./);
  const fence = run("Cp_Fence");
  assert.match(fence.text, /Young: Look at that\. Nobody's told them how\./, "the same words Mother Wren heard (Ep 58)");
  assert.match(fence.text, /Young: Take the one-pager\./);
  assert.equal(beat("fence").cast.find((c) => c.id === "kid").stars, undefined, "no star above them, ever");
  assert.match(run("Cp_Gate").text, /Grimoires are chains\. There's a space between the pages\./, "what Hesper told the Bell (Ep 55)");
  assert.match(run("Cp_Hollowmarch").text, /I'll hold the door\. Don't wait up\./);
  assert.match(run("Cp_Mask").text, /Cal: And that's where you came in\. Again\./);
});

test("Part 3, after the door (CIN-10): the two of them where the Wings stood; 'You two still haven't told me what I'm for.' No answer", () => {
  const a = beat("after");
  assert.equal(a.stage, "throne");
  assert.deepEqual(a.cast.map((c) => c.look), ["unkATrue", "unkBTrue"]);
  const t = run("Cp_After");
  assert.match(t.text, /Young: \[Speaking an unknown language\]/, "never subtitled");
  assert.match(t.text, /Young: You two still haven't told me what I'm for\./);
  assert.match(t.text, /Neither of them answers\./);
  assert.equal(t.f.get("CALPATH_DONE"), 1);
  assert.ok(!t.out.some((l) => /^unk/.test(l.speaker ?? "")), "they never say a word anyone can read");
});
