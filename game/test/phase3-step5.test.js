import { test } from "node:test";
import assert from "node:assert/strict";
import { EP4_SCRIPT, EPISODE_4_STORY } from "../src/data/story/ep4.js";
import { EPISODE_3 } from "../src/data/story/ep3.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode, EpisodeDirector } from "../src/sim/episode.js";
import { CAST } from "../src/data/story/cast.js";
import { World } from "../src/sim/world.js";

const play = (r, pick) => { const out = []; for (let i = 0; i < 800; i++) { const s = r.next(); out.push(s); if (s.type === "end") return out; if (s.type === "options") { const en = s.options.filter((o) => o.enabled); r.choose(en[Math.min(pick, en.length - 1)].index); } } throw new Error("runaway"); };

test("Episode 4 story: valid, cast known, Mirren choice branches the ending", () => {
  const nodes = parseScript(EP4_SCRIPT, "ep4");
  validateEpisode(EPISODE_4_STORY, nodes);
  assert.equal(EPISODE_3.beats.at(-1).nextEpisode, "ep4");
  for (const b of EPISODE_4_STORY.beats) for (const c of b.cast ?? []) assert.ok(Object.values(CAST).some((k) => k.actor === c.id), c.id);
  for (const pick of [0, 1]) {
    const f = new FlagStore();
    for (const n of ["Ep4_Briefing", "Ep4_Fens", "Ep4_Choice", "Ep4_After"]) {
      const out = play(new DialogueRunner(nodes, f, { name: "Kit", pronouns: "they" }).start(n), pick);
      for (const s of out) if (s.type === "line") { assert.ok(!s.speaker || CAST[s.speaker], s.speaker); assert.ok(!/\{[\w$]+\}/.test(s.text)); }
    }
    assert.equal(f.get("MIRREN_SAVED"), pick === 0 ? 1 : 0);
    assert.equal(f.get("PAGE_VACUUM_PULL"), 1);
    // The director picks the matching ending beat.
    const d = new EpisodeDirector(EPISODE_4_STORY, f);
    const ids = [];
    let b = d.start(EPISODE_4_STORY.beats.findIndex((x) => x.id === "hask"));
    while (b) { ids.push(b.id); b = d.complete({ won: true }); }
    assert.deepEqual(ids, ["hask", pick === 0 ? "after" : "afterAlone", "preview"]);
  }
});

test("Episode 4 world: squad present, Vacuum Pull locked until the boss drops it, Hask spawns with its bog", () => {
  const w = new World({ seed: 4, ...EPISODE_4_STORY.world });
  assert.equal(w.companions.length, 2);
  assert.equal(w.loadout.Spell2, null);
  assert.ok(w.loadout.Spell1 && w.loadout.Spell3 && w.loadout.Spell4);
  w.spawnWave(["hask"]);
  const ev = w.drainEvents();
  assert.ok(ev.some((e) => e.type === "bossIntro" && e.fighter.stats.bog));
});
