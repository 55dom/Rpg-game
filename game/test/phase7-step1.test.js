import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Siege } from "../src/sim/siege.js";
import { EPISODE_50 } from "../src/reveal/ep50.js";
import { EPISODE_51, EP51_SCRIPT } from "../src/reveal/ep51.js";
import { EPISODE_52, EP52_SCRIPT } from "../src/reveal/ep52.js";
import { AFTER_EP50, AFTER_EP51, AFTER_EP52 } from "../src/reveal/arcs.js";
import { fieldNotes, FIELD_NOTES, scriptStrokes } from "../src/reveal/notes.js";
import { SEAL, BELL_TUNING } from "../src/data/bell.js";
import { ENEMIES } from "../src/data/enemies.js";
import { parseScript, DialogueRunner } from "../src/core/script.js";
import { FlagStore } from "../src/core/flags.js";
import { validateEpisode } from "../src/sim/episode.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { CAST } from "../src/data/story/cast.js";
import { ZONES } from "../src/data/zones.js";
import { LOOKS } from "../src/runtime/rig.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const n51 = parseScript(EP51_SCRIPT, "e51"), n52 = parseScript(EP52_SCRIPT, "e52");
const run = (nodes, title, flags = {}, pick = 0) => {
  const f = new FlagStore(flags), r = new DialogueRunner(nodes, f, { name: "Rook" }).start(title), out = [];
  for (let s = r.next(); s.type !== "end"; s = r.next()) {
    if (s.type === "line") out.push(s);
    if (s.type === "options") r.choose(s.options[Math.min(pick, s.options.length - 1)].index);
  }
  return { f, out, text: out.map((l) => `${l.speaker ?? ""}: ${l.text}`).join(" | ") };
};
const beat = (ep, id) => ep.beats.find((b) => b.id === id);

test("Arc 6 opens: Ep 50 leads into Ep 51 and Ep 51 into Ep 52; both are registered, valid, and start from what came before", () => {
  assert.equal(EPISODE_50.beats.find((b) => b.type === "preview").nextEpisode, "ep51");
  assert.equal(EPISODE_51.beats.find((b) => b.type === "preview").nextEpisode, "ep52");
  assert.deepEqual(EPISODE_51.setup, { ...AFTER_EP50 });
  assert.deepEqual(EPISODE_52.setup, { ...AFTER_EP51 });
  for (const [ep, nodes] of [[EPISODE_51, n51], [EPISODE_52, n52]]) {
    validateEpisode(ep);
    assert.equal(ep.arc, "Arc 6 · The Light Left On");
    assert.match(src("main.js"), new RegExp(`from "\\./reveal/${ep.id}\\.js"`));
    for (const b of ep.beats) {
      if (b.node) assert.ok(nodes[b.node], b.node);
      if (b.cutscene) assert.ok(CUTSCENES[b.cutscene], b.cutscene);
      for (const c of [...(b.cast ?? []), ...(b.pickups ?? [])]) { if (c.node) assert.ok(nodes[c.node], c.node); if (c.look) assert.ok(LOOKS[c.look], c.look); }
    }
    for (const t of Object.keys(nodes)) for (const k of [0, 1, 2]) for (const l of run(nodes, t, {}, k).out) if (l.speaker) assert.ok(CAST[l.speaker], `${t}: ${l.speaker}`);
  }
  assert.equal(EPISODE_51.title, "The Light Left On");
  assert.equal(EPISODE_52.title, "Ninth Bell");
});

test("The morning after, everyone their own way (§15.9): Juno cuts her knot; Bas; Tamsin; Lio and the margins; and Dagrun says nothing, all episode", () => {
  const table = run(n51, "Ep51_Table");
  assert.match(table.text, /Juno: "Ties a knot when she's scared\. Don't tell her you know\."/);
  assert.match(table.text, /cuts the knot off her wrist/);
  assert.equal(table.f.get("CAL_JUNO"), "betrayed");
  assert.equal(table.f.get("JUNO_KNOT"), 0);
  assert.match(table.text, /Bas: He broke my arm\.[\s\S]*Bas: I kept telling myself\./);
  assert.match(table.text, /Tamsin: He said he liked us\.[\s\S]*Tamsin: On the bridge\. He said it\./);
  assert.match(table.text, /Rook: If he was alive this whole time\.\.\. why didn't he come back\?/, "the question the Backlash Arc answers");
  assert.equal(run(n51, "Ep51_Table", {}, 1).f.get("ROOK_ASKED"), "nothing");
  assert.doesNotMatch(EP51_SCRIPT, /^Dagrun:/m, "he says nothing for an episode");
  assert.match(run(n51, "Ep51_Dagrun").text, /moves over on the step, so there's room/);
  const lio = run(n51, "Ep51_Lio");
  assert.match(lio.text, /the same one that was on his mask/);
  assert.equal(lio.f.get("LIO_SCRIPT"), 1);
  assert.deepEqual(beat(EPISODE_51, "morning").required, ["notes", "lio", "dagrun"]);
});

test("The Crimson Bell's inquiry: its notice papers over the poster, Squad Rep falls, Severin at the grave, Elodie, and the summons for the ninth bell", () => {
  const ward = run(n51, "Ep51_Ward", { REP_SQUAD: 20 });
  assert.equal(ward.f.get("REP_SQUAD"), 5, "Squad Rep falls");
  assert.equal(ward.f.get("BELL_NOTICE"), 1);
  assert.match(ward.text, /confined to its quarters, pending the Bell's inquiry into the conduct of its vice captain/);
  assert.match(src("runtime/sets.js"), /K\.when\("\$SABLE_NAMED and not \$BELL_NOTICE"\)/, "the poster comes down when the Bell's notice goes up");
  assert.match(src("runtime/story.js"), /if \(s\.type === "end"\) break;\n\s+this\._refreshSet\(\);/, "and it goes up in the middle of the scene, not at the next one");
  const grave = run(n51, "Ep51_Grave");
  assert.match(grave.text, /Severin: You let me believe\./);
  assert.match(grave.text, /Elodie: He carried me out of the dark\.[\s\S]*he was gentle/);
  assert.equal(run(n51, "Ep51_Grave", {}, 1).f.get("SEVERIN_FLOWER"), "taken");
  const bell = run(n51, "Ep51_Bell");
  assert.match(bell.text, /Ulric: The Bell will hear the Last Lanterns at the Bell Tower\. Tomorrow, at the ninth bell\. All of you\./);
  assert.equal(bell.f.get("BELL_SEAL"), 1);
  assert.equal(bell.f.get("NOTES_GIVEN"), 1);
  assert.equal(run(n51, "Ep51_Bell", {}, 1).f.get("BELL_SUSPICION"), 1);
  assert.match(src("runtime/sets.js"), /doorSeal\.parent = K\.when\("\$BELL_SEAL"\)/);
  assert.equal(CAST.Ulric.actor, "ulric");
});

test("The Field Notes in the Journal: a page a Lantern, his stars by every name but Rook's, and a margin Lio reads once its flag is set", () => {
  assert.equal(fieldNotes(new FlagStore({})).show, false, "not until they're found");
  const fn = fieldNotes(new FlagStore({ ...AFTER_EP50 }));
  assert.ok(fn.show);
  assert.deepEqual(fn.pages.map((p) => p.who), ["Juno", "Bas", "Tamsin", "Lio", "Dagrun", "Rook"]);
  assert.equal(fn.pages.find((p) => p.who === "Dagrun").stars, "★★★", "Dagrun is a quiet three");
  assert.equal(fn.pages.find((p) => p.who === "Rook").stars, "", "nothing by Rook's name");
  assert.ok(fn.pages.every((p) => !p.read && p.margin === "" && p.script.startsWith("<svg")));
  assert.equal(scriptStrokes(4), scriptStrokes(4), "the same strokes every time");
  const after = fieldNotes(new FlagStore({ ...AFTER_EP52 })), juno = after.pages[0];
  assert.ok(juno.read && /She ties a better one after\./.test(juno.margin));
  assert.ok(after.pages.slice(1).every((p) => !p.read));
  assert.equal(FIELD_NOTES.pages[0].note, "Ties a knot when she's scared. Don't tell her you know.", "the same note as Ep 50's first page");
  assert.match(src("main.js"), /fieldNotes\(story\.flags\)/);
  assert.match(readFileSync(new URL("../template.html", import.meta.url), "utf8"), /data-notes-head/);
});

test("The Bell Tower and its wardens: a set and a zone; Paper Seal (talismans, a Binding Seal that holds you where you stand, a Fold)", () => {
  assert.ok(ZONES.belltower && ZONES.belltower.interior);
  assert.match(src("runtime/sets.js"), /belltower: buildBelltower/);
  assert.match(src("runtime/sets.js"), /if \(name === "toll"\)/);
  assert.match(src("runtime/audio.js"), /case "bell":/);
  const def = ENEMIES.bellWarden;
  assert.ok(def && def.abilities.Talisman && def.abilities.Binding && def.abilities.Fold);
  assert.match(src("sim/world.js"), /e\.key === "seal"[^\n]*kind: "seal"/);
  const w = new World({ seed: 7, bounds: ZONES.belltower.bounds, origin: { x: 0, z: 1 }, companions: false });
  const warden = w.spawnEnemy("bellWarden", { x: 0, z: 5 });
  w.drainEvents();
  w.addStrike(warden, w.player.pos.x, w.player.pos.z, { delay: BELL_TUNING.seal.delay, r: BELL_TUNING.seal.r, spec: SEAL, ability: def.abilities.Binding, kind: "seal" });
  assert.ok(w.drainEvents().some((e) => e.type === "strikeWarn" && e.strike.kind === "seal"));
  for (let i = 0; i <= BELL_TUNING.seal.delay + 1; i++) w.step({});
  assert.ok(w.player.tags.has("BOUND"), "caught standing on it: bound in place");
  assert.match(src("main.js"), /s\.kind === "seal"/, "drawn as a square of red paper on the floor");
});

test("The Silencing: the wardens can't be put down, seals close where you stand, the bell tolls, and it ends when the meter does", () => {
  const b = beat(EPISODE_52, "silencing"), w = new World({ seed: 9, ...b.world }), s = new Siege(w, b.siege).start();
  const wardens = w.liveEnemies.filter((f) => f.kind === "bellWarden");
  assert.equal(wardens.length, 3);
  for (const f of wardens) f.combatant.takeDamage(1e7);
  assert.ok(wardens.every((f) => f.alive), "a test, not a fight to the death");
  assert.ok(b.siege.marks.some((m) => m.cue === "toll") && b.siege.marks.some((m) => m.sfx === "bell"));
  let seals = 0;
  for (let i = 0; i < 60 * 46 && !s.done; i++) { w.step({}); s.step(); seals += w.drainEvents().filter((e) => e.type === "strikeWarn" && e.strike.kind === "seal").length; }
  assert.ok(seals > 0, "seals laid under you");
  assert.ok(s.done, "outlast the bell");
});

test("The finding, the first margin, and Dagrun at last: 'I still leave the light on. Don't know if that makes me a fool.'", () => {
  const hearing = run(n52, "Ep52_Hearing");
  assert.match(hearing.text, /Ulric: The Bell doesn't take anyone's word\. It takes the paper's\./);
  assert.match(hearing.text, /Dagrun says nothing\./);
  assert.equal(run(n52, "Ep52_Hearing", {}, 1).f.get("BELL_TRUST"), 1);
  const verdict = run(n52, "Ep52_Verdict", { REP_SQUAD: 0 });
  assert.match(verdict.text, /as if there weren't any pages/);
  assert.equal(verdict.f.get("MERIT_FROZEN"), 1);
  assert.equal(verdict.f.get("BELL_TOKEN"), 1);
  assert.equal(verdict.f.get("REP_SQUAD"), -10);
  const margins = run(n52, "Ep52_Margins");
  assert.match(margins.text, /Lio: "She'll cut it off when she finds out\. Let her\. She ties a better one after\."/);
  assert.match(margins.text, /Juno: Not yet\./);
  assert.equal(margins.f.get("MARGIN_JUNO"), 1);
  const light = run(n52, "Ep52_Light");
  assert.match(light.text, /Dagrun: I still leave the light on\. \| Dagrun: Don't know if that makes me a fool\./);
  assert.equal(light.f.get("DAGRUN_SPOKE"), 1);
  assert.equal(run(n52, "Ep52_Light", {}, 2).f.get("DAGRUN_LIGHT"), "quiet");
  assert.equal(AFTER_EP52.DAGRUN_SPOKE, 1);
  assert.equal(EPISODE_52.beats.find((b) => b.type === "preview").nextEpisode, undefined, "Arc 6 goes on in Step 2");
});
