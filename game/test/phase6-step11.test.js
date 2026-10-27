import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { World } from "../src/sim/world.js";
import { EPISODE_47 } from "../src/data/story/ep47.js";
import { EPISODE_48, EP48_SCRIPT } from "../src/reveal/ep48.js";
import { AFTER_EP47 } from "../src/data/story/arc5.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { validateCutscene } from "../src/core/timeline.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";
import { MASK_FINAL_TUNING, UNMASKED_TUNING } from "../src/reveal/duel.js";
import { ARC3_BASE } from "../src/data/story/arc3.js";

const nodes = parseScript(EP48_SCRIPT, "e48");
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const run = (w, n, log = []) => { for (let i = 0; i < n; i++) { w.step(); log.push(...w.drainEvents()); } return log; };
const fight = (kind, opts = {}) => {
  const w = new World({ seed: 9, bounds: ZONES.bridge.bounds, origin: { x: 0, z: -2 }, ...opts }); w.drainEvents();
  w.spawnWave([kind]); w.drainEvents();
  const b = w.boss; b.brain.aggroRange = 0;
  w.player.combatant.health.max = w.player.combatant.health.current = 1e6;
  return { w, b, p: w.player };
};
/** The options a player with these flags is shown (a #secret line only if it's been earned), and what each leads to. */
const memory = (flags) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start("Ep48_Memory");
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "options") return s.options.filter((o) => o.enabled || !o.tags?.includes("secret"));
  }
  return [];
};
const answer = (flags, pick) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start("Ep48_Memory"), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") lines.push(s);
    if (s.type === "options") { const shown = s.options.filter((o) => o.enabled || !o.tags?.includes("secret")); r.choose(shown[pick].index); }
  }
  return { f, text: lines.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};

test("The reveal lives in src/reveal/ and only there; every file outside it still names nobody", () => {
  const files = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : p.endsWith(".js") ? [p] : []; });
  const all = files(new URL("../src", import.meta.url).pathname);
  const naming = all.filter((p) => /\bcalder\b|CAL_IDENTITY_REVEALED|"Told you not to wait up/.test(readFileSync(p, "utf8"))).map((p) => p.split("/src/")[1]);
  for (const p of naming) assert.ok(p.startsWith("reveal/") || p === "data/theatre.js" || p === "data/story/hall.js", p); // the Theatre only waits on the flag; the Hall's lantern plate has carried his name since Ep 18
  assert.match(src("main.js"), /from "\.\/reveal\/ep48\.js"/);
  assert.doesNotMatch(src("main.js"), /\bcal\b|calder|\bsable\b|\bdemons?\b/i, "main.js names nobody either");
});

test("Ep 48 follows Ep 47; its title is the one the GDD set; its preview never shows the mask breaking", () => {
  validateEpisode(EPISODE_48);
  for (const b of EPISODE_48.beats) { if (b.node) assert.ok(nodes[b.node], b.node); for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node); if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene); }
  assert.equal(EPISODE_47.beats.find((b) => b.type === "preview").nextEpisode, "ep48");
  assert.deepEqual(EPISODE_48.setup, { ...AFTER_EP47 });
  assert.equal(EPISODE_48.title, "The Other Side of the Door");
  const pv = EPISODE_48.beats.find((b) => b.type === "preview");
  assert.equal(pv.nextEpisode, "ep49");
  assert.doesNotMatch(pv.lines.join(" "), /mask|face|crack|cal\b/i);
  assert.ok(LOOKS.maskCracked && LOOKS.unmasked && LOOKS.unmasked.scar && LOOKS.unmasked.eyeRing && LOOKS.unmasked.wristCord);
});

test("The third duel: he can't be worn down; only Rook's finisher on his broken guard (the Underline) ends it; Rain and the Chain are new", () => {
  const { w, b, p } = fight("maskFinal");
  b.combatant.takeDamage(1e7);
  assert.ok(b.alive && b.combatant.health.normalized >= MASK_FINAL_TUNING.floor - 1e-6, "not by wearing him down");
  b.boss.onHit(p, { tags: ["heavy"] });
  b.boss.onHit(w.companions[0] ?? b, { tags: ["finisher"] });
  assert.ok(!w.drainEvents().some((e) => e.type === "underline"), "only Rook's finisher");
  b.boss.onHit(p, { id: "LanternBreak", tags: ["finisher", "heavy"] });
  assert.ok(w.drainEvents().some((e) => e.type === "underline"));
  const duel = EPISODE_48.beats.find((x) => x.id === "duel");
  assert.equal(duel.endOn, "underline");
  assert.equal(duel.world.companions, false, "one on one");
  assert.match(src("runtime/story.js"), /if \(f\.beat\.endOn && ev\.type === f\.beat\.endOn\)/);
  assert.match(src("runtime/hud.js"), /stats\.finisherName \?\? "LANTERN BREAK"/, "the prompt says UNDERLINE");
  // Rain: the glaive out of tears round Rook, one after another.
  const r = fight("maskFinal");
  r.b.boss.onCustom("rain");
  const warns = r.w.drainEvents().filter((e) => e.type === "strikeWarn").map((e) => e.strike);
  assert.equal(warns.length, MASK_FINAL_TUNING.rain.n);
  assert.ok(warns.every((s) => s.kind === "sever" && Math.hypot(s.x - r.p.pos.x, s.z - r.p.pos.z) <= 0.6 + MASK_FINAL_TUNING.rain.spread + 0.01));
  // The Chain: out at the left, the right, then behind.
  const c = fight("maskFinal");
  c.p.pos.x = c.p.prev.x = 0; c.p.pos.z = c.p.prev.z = 0; c.p.yaw = c.p.prevYaw = 0;
  const exits = [0, 1, 2].map((side) => { c.b.boss.onCustom("severMark", side); return { ...c.b.boss.exit }; });
  assert.ok(exits[0].x < -1 && exits[1].x > 1 && exits[2].z < -1, JSON.stringify(exits));
});

test("The memory, under the glaive: what Rook can say depends on what Rook has seen; with nothing, there's always the last one, and the timer takes it", () => {
  const texts = (o) => o.map((x) => x.text);
  assert.deepEqual(texts(memory({})), ["\"WHO ARE YOU?!\""], "nothing earned, nothing shown");
  const all = memory({ HAS_BRASS_KEY: 1, CLUE_B4: 1, HEARD_S2: 1, SEEN_CAL_LANTERN: 1, CAL_STATE: 1 });
  assert.equal(all.length, 4);
  assert.match(all[0].text, /snack cupboard/);
  assert.match(all[1].text, /Mind the step/);
  assert.match(all[2].text, /lantern lit/);
  assert.equal(memory({ CLUE_B4: 1 }).length, 1, "B4 alone isn't enough: he has to have heard Cal say it too (S2)");
  assert.match(answer({ HAS_BRASS_KEY: 1 }, 0).text, /It never had a lock/);
  assert.match(answer({ CLUE_B4: 1, HEARD_S2: 1 }, 0).text, /Tell Juno the knot held/);
  assert.match(answer({ SEEN_CAL_LANTERN: 1, CAL_STATE: 1 }, 0).text, /always did leave the light on/);
  const who = answer({}, 0);
  assert.match(who.text, /pulls the brass key out anyway/);
  assert.match(who.text, /It never had a lock/);
  assert.equal(who.f.get("MEMORY_LINE"), "who");
  assert.match(who.text, /laughs\. Once, quietly/);
  assert.match(EP48_SCRIPT, /<<timer 10>>\n-> Hold up the brass key/);
  assert.match(src("runtime/story.js"), /if \(this\.timeLeft <= 0\) \{ const last = /, "time runs out: the last line is taken");
  assert.equal(ARC3_BASE.HEARD_S2, 1, "Arcs 1–2 leave S2 behind (Cal says it in Ep 3)");
  assert.match(src("data/story/ep3.js"), /Cal: Mind the step\. It's been loose since before the sea dried up\.\n<<set \$HEARD_S2 to 1>>/);
});

test("The Clash is held by timing, not by mashing; and the face in the smoke is the storyboard, cut for cut", () => {
  const story = src("runtime/story.js");
  assert.match(story, /press: \(\) => \{ if \(Math\.abs\(c\.t - PERIOD\) <= WINDOW\) c\.land\(\); else \{ c\.t = 0;/, "a press outside the window starts the ring again");
  assert.match(EP48_SCRIPT, /<<sfx warHorn>>[\s\S]*<<clash 6>>/);
  const cs = CUTSCENES.ep48_face;
  validateCutscene(cs);
  assert.ok(cs.camera.filter((k) => k.cut).length >= 13, "the storyboard's cuts");
  assert.ok(cs.events.some((e) => e.flash), "002: the impact frame");
  assert.ok(cs.events.some((e) => e.fade === "out" && e.dur === 0), "004: black");
  assert.ok(cs.events.some((e) => e.cue === "maskShards"), "008: the shards");
  assert.ok(cs.events.some((e) => e.pose?.name === "tilt"), "014: the head tilt (S4)");
  assert.ok(cs.events.some((e) => e.caption === "\"Told you not to wait up.\""), "016");
  assert.ok(cs.events.some((e) => e.sfx === "tuneMarch"), "017: the Lighthouse Tune, all four notes");
  assert.ok(!cs.events.some((e) => e.sfx === "laugh"), "no villain laughter");
  assert.equal(EPISODE_48.beats.find((b) => b.id === "face").set.CAL_IDENTITY_REVEALED, 1);
  assert.ok(CUTSCENES.ep48_crack.actors.find((a) => a.id === "knight").look === "maskCracked");
});

test("The fight against him: the companion's kit used against you, then the evolution, then what he is; at a fifth, he stops", () => {
  const { w, b, p } = fight("unmasked", { companions: ["bas", "juno"] });
  // P1: golden doors, the Drop, the swap.
  b.boss.onCustom("severOut"); b.boss.onCustom("severMark");
  assert.ok(w.drainEvents().some((e) => e.type === "doorOpen"), "gold, not black");
  b.boss.onCustom("drop");
  const drop = w.drainEvents().filter((e) => e.type === "strikeWarn").map((e) => e.strike);
  assert.deepEqual(drop.map((s) => s.kind), ["gold"], "under Rook alone, the way he used to juggle enemies for you");
  assert.ok(drop[0].lift > 0);
  b.boss._emerge(false); w.drainEvents();
  const before = { b: { ...b.pos }, p: { ...p.pos } };
  b.boss.onCustom("swap");
  assert.ok(Math.hypot(b.pos.x - before.p.x, b.pos.z - before.p.z) < 0.01 && Math.hypot(p.pos.x - before.b.x, p.pos.z - before.b.z) < 0.01, "the door-swap, the other way round");
  assert.equal(b.runner.current?.id, "Cut", "and the cut's already coming");
  // P2: the doors go black; the Drop takes everyone; the scramble.
  b.combatant.health.set(b.stats.maxHealth * 0.6); run(w, 2);
  assert.equal(b.boss.phase, 2);
  b.runner.interrupt(); w.drainEvents();
  b.boss.onCustom("severOut"); b.boss.onCustom("severMark");
  assert.ok(w.drainEvents().some((e) => e.type === "severOpen"));
  b.boss._emerge(false); w.drainEvents();
  b.boss.onCustom("drop");
  assert.equal(w.drainEvents().filter((e) => e.type === "strikeWarn").length, 3, "a fall for the whole party");
  b.boss.onCustom("scramble");
  assert.equal(w.drainEvents().filter((e) => e.type === "scramble").length, 3);
  // P3: blades, Godfall down the whole bridge, and he heals when untouched.
  b.combatant.health.set(b.stats.maxHealth * 0.35); run(w, 2);
  assert.equal(b.boss.phase, 3);
  b.boss.onCustom("godfall");
  const g = w.drainEvents(), gs = g.filter((e) => e.type === "strikeWarn");
  assert.ok(g.some((e) => e.type === "godfall") && gs.length * UNMASKED_TUNING.godfall.step >= UNMASKED_TUNING.godfall.length - 2, "end to end");
  assert.ok(gs.every((e) => e.strike.spec.unblockable));
  const hp = b.combatant.health.current;
  b.runner.interrupt(); b.brain.aggroRange = 0;
  run(w, UNMASKED_TUNING.regen.after + 60);
  assert.ok(b.combatant.health.current > hp, "the regeneration nobody human has");
  // At a fifth, he stops, and says something no one could know.
  b.combatant.takeDamage(1e7);
  const end = run(w, 3);
  assert.ok(b.alive && end.some((e) => e.type === "larkspur"));
  assert.equal(EPISODE_48.beats.find((x) => x.id === "fight").endOn, "larkspur");
  const f = new FlagStore(), r = new DialogueRunner(nodes, f, { name: "Rook" }).start("Ep48_Larkspur"), lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) if (s.type === "line") lines.push(s.text);
  assert.ok(lines.includes("You were lighter than my glaive, you know. That night in Larkspur."));
  assert.equal(lines.at(-1), "You really want to know?", "Ep 48 ends here");
});
