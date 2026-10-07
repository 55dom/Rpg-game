import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { EPISODE_19, EP19_SCRIPT } from "../src/data/story/ep19.js";
import { WORLD_SCRIPT } from "../src/data/story/world.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { ZONES, HALL_LAYOUT } from "../src/data/zones.js";
import { CLUE_TRACKS, markClue, investigationScore, found } from "../src/core/clues.js";
import { keyItemsHeld } from "../src/data/keyItems.js";
import { CAST } from "../src/data/story/cast.js";

const nodes = { ...parseScript(WORLD_SCRIPT, "w"), ...parseScript(EP19_SCRIPT, "ep19") };
const play = (node, f = new FlagStore(), pick = 0) => {
  const r = new DialogueRunner(nodes, f, {}).start(node);
  const lines = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) { if (s.type === "line") lines.push(s.text); if (s.type === "options") r.choose(pick); }
  return { f, lines };
};

test("Episode 19 is a whole episode: recap, title, dinner, the walk-around, Dagrun's door, the Hall, the summons, a preview", () => {
  validateEpisode(EPISODE_19, nodes);
  assert.deepEqual(EPISODE_19.beats.map((b) => b.type), ["coldopen", "title", "scene", "explore", "scene", "explore", "scene", "preview"]);
  const home = EPISODE_19.beats.find((b) => b.id === "home");
  assert.ok(home.required.includes("dagrunDoor"), "knocking on the door is part of the walk-around");
  for (const c of home.cast) assert.ok(home.required.includes(c.id), `${c.id} must be checked on`);
  assert.ok(!EPISODE_19.beats.some((b) => (b.cast ?? []).some((c) => c.id === "cal")), "he's gone: never on stage");
  for (const b of EPISODE_19.beats) for (const c of b.cast ?? []) if (c.node) assert.ok(nodes[c.node], c.node);
  assert.ok(CAST.Warden, "the Iron Warden can speak");
  assert.equal(EPISODE_19.unlockAt, 5, "Arc 3 opens after Episode 4 (Arc 2 isn't written yet)");
});

test("starting Arc 3 directly fills in what Arcs 1–2 leave behind, but never overwrites a real save's flags", () => {
  const f = new FlagStore();
  f.set("LANTERN_LIT", 0); // a save where it was set to something
  for (const [k, v] of Object.entries(EPISODE_19.setup)) if (!f.has(k)) f.set(k, v);
  assert.equal(f.get("CAL_STATE"), 1); assert.equal(f.get("HAS_BRASS_KEY"), 1);
  assert.equal(f.get("LANTERN_LIT"), 0, "kept");
});

test("Track A in Ep 19: Lio's 'no residue' always plays; Cal's whole wick is there only for those who look", () => {
  assert.ok(play("Ep19_Lio").lines.some((l) => l.includes("no residue")));
  assert.ok(found(play("Ep19_Lio").f, "A1"));
  const dead = new FlagStore(); dead.set("CAL_STATE", 1);
  const look = play("W_Hall_CalLantern", dead);
  assert.ok(found(look.f, "A2") && look.lines.some((l) => l.includes("wick still stands")));
  const alive = play("W_Hall_CalLantern");
  assert.ok(!found(alive.f, "A2"), "before Ep 18 his lantern is just lit");
  // Every clue ships with an alibi: the Keeper explains whole wicks, once you've looked.
  const k = play("W_HallKeeperIn", look.f, 0);
  assert.ok(k.lines.some((l) => l.includes("The Hollow takes the ash too")));
  // And the Hall shows what ash looks like elsewhere, so the comparison is fair.
  assert.ok(play("W_Hall_Fallen").lines.some((l) => l.includes("ash")));
});

test("the investigation score is derived from the flags and never stored; unknown clues are refused", () => {
  const f = new FlagStore();
  markClue(f, "A1"); markClue(f, "A2"); markClue(f, "B2"); markClue(f, "S2"); markClue(f, "D3");
  assert.equal(investigationScore(f), 3, "Track A + link clues only");
  assert.ok(![...Object.keys(f.snapshot())].some((k) => /SCORE|INVESTIGATION/i.test(k)));
  assert.throws(() => markClue(f, "Z9"));
  assert.equal(CLUE_TRACKS.A.length, 5); assert.equal(CLUE_TRACKS.B.length, 9);
});

test("the Hall of Lanterns: a door from the plaza, seven shelves, every pickup and the way out reachable", () => {
  const hall = ZONES.hall, au = ZONES.aurelin;
  assert.ok(au.exits.some((e) => e.to === "hall") && au.arrivals.hall, "a door on the plaza, and somewhere to come back out");
  assert.ok(hall.exits.some((e) => e.to === "aurelin") && hall.arrivals.aurelin);
  assert.equal(HALL_LAYOUT.squads.length, 7);
  assert.equal(HALL_LAYOUT.squads[3].id, "lanterns", "the fourth shelf");
  const [x0, z0, x1, z1] = hall.bounds.rect;
  const inSolid = (x, z) => hall.bounds.solids.some((s) => s.circle ? Math.hypot(x - s.circle[0], z - s.circle[1]) < s.circle[2] + 0.35 : x > s.box[0] - 0.35 && x < s.box[2] + 0.35 && z > s.box[1] - 0.35 && z < s.box[3] + 0.35);
  for (const p of [...hall.pickups, ...EPISODE_19.beats.find((b) => b.id === "hall").pickups]) {
    assert.ok(p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1, `${p.id} inside the hall`);
    assert.ok(!inSolid(p.x, p.z), `${p.id} not inside a shelf or a column`);
  }
  const door = hall.exits[0].rect; assert.ok(door[1] <= z0 + 0.3 && door[3] > z0, "the door is at the wall you can walk to");
});

test("after Ep 18 Cal is gone from the Lighthouse; the key's text changes near the Hollowmarch", () => {
  const cal = ZONES.lighthouse.cast.find((c) => c.id === "cal");
  assert.equal(cal.when, "not $CAL_STATE");
  const f = new FlagStore(); f.set("HAS_BRASS_KEY", 1);
  const home = keyItemsHeld(f, "lighthouse")[0], march = keyItemsHeld(f, "hollowmarch")[0];
  assert.equal(home.name, "Brass key"); assert.notEqual(home.text, march.text);
  assert.ok(/warm/i.test(march.text) && /everything metal/i.test(march.text), "with its alibi: all metal is warm there");
  assert.equal(keyItemsHeld(new FlagStore()).length, 0);
});

// ---- Leak prevention (GDD §15.11): file names and strings are what dataminers read ----
const files = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : p.endsWith(".js") ? [p] : []; });
const SRC = files(new URL("../src", import.meta.url).pathname);

test("leak test: no source file that mentions the masked knight also mentions Cal; no demons in the build yet", () => {
  for (const p of SRC) {
    const s = readFileSync(p, "utf8");
    if (/\bsable\b/i.test(s)) assert.ok(!/\bcal\b|calder|CAL_[A-Z]/i.test(s), `${p} links the two`);
    assert.ok(!/\bdemons?\b|ash line|ash eleven/i.test(s), `${p} mentions what doesn't exist yet`);
  }
});
