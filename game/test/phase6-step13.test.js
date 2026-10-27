import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { EPISODE_49 } from "../src/reveal/ep49.js";
import { EPISODE_50, EP50_SCRIPT } from "../src/reveal/ep50.js";
import { AFTER_EP49, AFTER_EP50 } from "../src/reveal/arcs.js";
import { CAL_WEAR, CAL_SEATED_WEAR, FINALE_TUNING } from "../src/reveal/finale.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode, EpisodeDirector } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";

const nodes = parseScript(EP50_SCRIPT, "e50");
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const beat = (id) => EPISODE_50.beats.find((b) => b.id === id);
const bridge = (opts = {}) => { const w = new World({ seed: 5, bounds: ZONES.bridge.bounds, origin: { x: 0, z: -2 }, ...opts }); w.drainEvents(); return w; };
const lines = (title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | "), out };
};
/** The beats an episode actually plays with these flags (a beat's `if` decides). */
const played = (flags) => {
  const d = new EpisodeDirector(EPISODE_50, new FlagStore(flags)), ids = [];
  for (let b = d.start(0); b; b = d.complete({ won: true })) ids.push(b.id);
  return ids;
};

test("Ep 50 follows Ep 49 and is The First Time: the same grin, on the face he has now; the frame folds shut behind him", () => {
  validateEpisode(EPISODE_50);
  assert.equal(EPISODE_49.beats.find((b) => b.type === "preview").nextEpisode, "ep50");
  assert.deepEqual(EPISODE_50.setup, { ...AFTER_EP49 });
  assert.equal(EPISODE_50.title, "The First Time");
  assert.match(src("main.js"), /from "\.\/reveal\/ep50\.js"/);
  for (const b of EPISODE_50.beats) {
    if (b.node) assert.ok(nodes[b.node], b.node);
    if (b.intro) assert.ok(nodes[b.intro], b.intro);
    for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) { if (c.node) assert.ok(nodes[c.node], c.node); if (c.look) assert.ok(LOOKS[c.look], c.look); }
    if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
  }
  const cs = CUTSCENES.ep50_return;
  assert.equal(cs.actors.find((a) => a.id === "calGrin").look, "unmaskedGrin");
  assert.ok(LOOKS.unmaskedGrin.grin);
  assert.ok(cs.events.some((e) => e.tear?.kind === "gold" && e.tear.life <= 1.2), "the golden frame folds shut");
  assert.ok(!cs.events.some((e) => e.memory), "full colour: we're out of the memory");
  const first = lines("Ep50_First").text;
  assert.match(first, /Cal: So\. That's how I died\.[\s\S]*Cal: \.\.\.The first time\.[\s\S]*Cal: Don't mistake that for a confession\.[\s\S]*Cal: It was an introduction\.[\s\S]*Cal: Your move\./);
  assert.match(EP50_SCRIPT, /<<cue doorSeat>>[\s\S]*<<pose Cal sit>>/, "he sits on the golden frame and swings one leg");
});

test("Whose story? No timer; two answers; each plays Phases 4–6 its own way, and both meet at the Chain", () => {
  assert.match(EP50_SCRIPT, /Whose story\?\n-> Rook's\.\n    <<set \$PERSPECTIVE to "rook">>\n-> His\.\n    <<set \$PERSPECTIVE to "cal">>/);
  assert.doesNotMatch(EP50_SCRIPT.split("Whose story?")[0].split("\n").slice(-3).join("\n"), /<<timer/);
  assert.equal(lines("Ep50_First", {}, 1).f.get("PERSPECTIVE"), "cal");
  const rook = played({ PERSPECTIVE: "rook" }), cal = played({ PERSPECTIVE: "cal" });
  assert.deepEqual(rook.filter((id) => /notSerious|board|alone|bonds/.test(id)), ["notSerious", "board", "alone", "bonds"]);
  assert.deepEqual(cal.filter((id) => /notSerious|board|alone|bonds/.test(id)), ["notSeriousCal", "boardCal", "bondsCal"]);
  for (const ids of [rook, cal]) assert.deepEqual(ids.slice(-4), ["chain", "ending", "notes", "preview"]);
  assert.equal(beat("notSeriousCal").world.kit, CAL_SEATED_WEAR);
  assert.equal(beat("bondsCal").world.kit, CAL_WEAR);
  assert.ok(CAL_SEATED_WEAR.attackScale < 0.05, "on his door he isn't trying");
  assert.equal(beat("notes").fresh, true, "back in Rook's own body for the Lighthouse");
  assert.equal(beat("ending").rook, null, "whoever the player was a moment ago, a stand-in is Rook");
});

test("Phase 4, Not serious: his Interest, not his health; only what's interesting raises it, and gets an answer", () => {
  const w = bridge({ companions: ["bas", "juno"] });
  const s = new Siege(w, beat("notSerious").siege).start();
  const cal = w.liveEnemies.find((f) => f.kind === "calSeated");
  cal.combatant.takeDamage(1e7);
  assert.equal(cal.combatant.health.current, cal.stats.maxHealth, "not a scratch");
  assert.equal(cal.boss.brainActive, false, "he never moves first");
  assert.ok(cal.seated > 0);
  assert.deepEqual(w.gauge, { label: "Interest", value: 0 });
  s.onEvent({ type: "hit", attacker: w.player });
  assert.equal(s.rise, 0, "a plain hit is boring");
  w.drainEvents();
  s.onEvent({ type: "perfectDodge", fighter: w.player });
  assert.ok(s.rise > 0);
  const warn = w.drainEvents().find((e) => e.type === "strikeWarn");
  assert.ok(warn && warn.strike.kind === "gold" && warn.strike.r === FINALE_TUNING.answer.r, "the answer: a golden door under you");
  // Boring play gets commentary.
  for (let i = 0; i < beat("notSerious").siege.idle.every + 1; i++) s.step();
  assert.ok(s.drainLines().some(([who, t]) => who === "Cal" && /Boring/.test(t)));
  for (let i = 0; i < 4; i++) s.onEvent({ type: "teamAttack", attacker: w.player });
  s.step();
  assert.ok(s.done, "interested now");
});

test("Phase 6, Bonds: they come back one at a time (Links), he can't be worn down, and the Links end it in the Lantern Chain", () => {
  const w = bridge({ companions: false });
  const spec = beat("bonds").siege, s = new Siege(w, spec).start();
  const cal = w.liveEnemies.find((f) => f.kind === "calBonds");
  cal.combatant.takeDamage(1e7);
  assert.ok(cal.alive && cal.combatant.health.normalized >= FINALE_TUNING.bondsFloor - 1e-6);
  assert.deepEqual(spec.marks.filter((m) => m.join).map((m) => m.join), ["juno", "bas"]);
  assert.match(src("runtime/story.js"), /if \(k\.join && !w\.companions\.some\(\(c\) => c\.kind === k\.join\)\) w\.addCompanion\(k\.join\)/);
  assert.equal(w.gauge.label, "Links");
  for (let i = 0; i < 10; i++) s.onEvent({ type: "assist", attacker: w.player });
  s.step();
  assert.ok(s.done);
  const chain = CUTSCENES.ep50_chain;
  assert.deepEqual(chain.events.filter((e) => e.move && e.move.id !== "cal").map((e) => e.move.id).filter((id, i, a) => a.indexOf(id) === i), ["juno", "bas", "dagrun", "rook"], "every Lantern's strike, in turn, Rook last");
  assert.ok(chain.events.some((e) => e.pose?.id === "cal" && e.pose.name === "hand"), "a hand on his ribs");
  assert.ok(chain.events.some((e) => e.sfx === "laugh"), "laughing, softly");
});

test("The ending, word for word; a door; the Gate closed from the other side; that night, the Field Notes", () => {
  const end = lines("Ep50_End");
  assert.match(end.text, /Rook: Was any of it real\?[\s\S]*Cal: That's the funny part\.[\s\S]*At Juno\. At Bas, and Tamsin, and Dagrun\.[\s\S]*Cal: I actually liked you\.[\s\S]*Cal: I just never said I had to be on your side\./);
  assert.equal(end.f.get("GATE_OPEN"), 0);
  assert.equal(end.f.get("GATE_SEALED"), 1);
  assert.equal(end.f.get("SIEGE_OVER"), 1);
  assert.match(EP50_SCRIPT, /<<cue gateSeal>>/);
  assert.match(src("runtime/sets.js"), /if \(name === "gateSeal"\) \{ want = 0; sealed = true; \}/);
  const notes = lines("Ep50_Notes");
  assert.match(notes.text, /FIELD NOTES\. For Rook\./);
  assert.match(notes.text, /Under Rook's sketch, there's no note\. Just a drawing of the brass key\./);
  assert.equal(notes.f.get("FIELD_NOTES"), 1);
  assert.equal(AFTER_EP50.FIELD_NOTES, 1);
  for (const n of Object.values(nodes)) for (const s of n.body ?? []) if (s.speaker) assert.ok(CAST[s.speaker], s.speaker);
  for (const t of Object.keys(nodes)) for (const k of [0, 1]) for (const l of lines(t, {}, k).out) if (l.speaker) assert.ok(CAST[l.speaker], `${t}: ${l.speaker}`);
});
