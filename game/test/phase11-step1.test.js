import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { World } from "../src/sim/world.js";
import { Intent } from "../src/core/input.js";
import { hitSpec } from "../src/core/combat.js";
import { EnemyBrain, AttackTokenPool, AttackOption } from "../src/core/ai.js";
import { DIFFICULTIES, DIFFICULTY_KEYS, difficultyOf } from "../src/data/difficulty.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");
const run = (w, n) => { for (let i = 0; i < n; i++) { w.step(); w.drainEvents(); } };

test("Three difficulties (§9.7): Story, Knight, Paragon; anything unknown is Knight", () => {
  assert.deepEqual(DIFFICULTY_KEYS, ["story", "knight", "paragon"]);
  assert.equal(difficultyOf("nonsense"), DIFFICULTIES.knight);
  assert.equal(8 + DIFFICULTIES.story.parry, 14, "§9.3: parry 8f, Story 14f");
  assert.ok(DIFFICULTIES.paragon.parry < 0 && DIFFICULTIES.paragon.perfectDodge < DIFFICULTIES.knight.perfectDodge, "Paragon: tighter windows");
  assert.ok(DIFFICULTIES.story.autoCombo && !DIFFICULTIES.knight.autoCombo, "Story: the auto-combo assist");
  const w = new World({ seed: 3 });
  assert.equal(w.difficulty, "knight", "Knight is the default");
});

test("The windows: a parry is 14 frames on Story, 8 on Knight, 6 on Paragon (the touch assist adds its 3 on top); only the player's", () => {
  const w = new World({ seed: 3, companions: ["bas"] });
  for (const [k, want, dodge] of [["story", 14, 10], ["knight", 8, 6], ["paragon", 6, 4]]) {
    w.difficulty = k;
    assert.equal(w.parryWindow(w.player, 8), want, k);
    assert.equal(w.player.combatant.perfectDodgeFrames, dodge, `${k}: perfect dodge`);
  }
  w.assist = true; w.difficulty = "story";
  assert.equal(w.parryWindow(w.player, 8), 17); assert.equal(w.player.combatant.perfectDodgeFrames, 13);
  assert.equal(w.parryWindow(w.companions[0], 8), 8, "a squadmate's parry isn't the player's");
  // And a real parry: tap Guard on Story.
  const s = new World({ seed: 3, difficulty: "story" }); s.drainEvents();
  s.press(Intent.Block); run(s, 2);
  assert.ok(s.player.combatant.parryFrames >= 12, `the window's open wider (${s.player.combatant.parryFrames})`);
});

test("What reaches the squad: softer on Story, harder on Paragon (the enemy's own numbers never change)", () => {
  const taken = (k) => {
    const w = new World({ seed: 3, difficulty: k, companions: ["bas"] }); w.drainEvents();
    const e = w.spawnEnemy("hound", 0, 3); const p = w.player, b = w.companions[0];
    p.combatant.invulnerableFrames = 0; b.combatant.invulnerableFrames = 0;
    const hb = { spec: hitSpec({ damage: 20, posture: 0, hitstop: 0, hitstun: 10 }), ability: { id: "Test", tags: [] }, origin: { x: 0, y: 1, z: 1 } };
    const h0 = p.combatant.health.current, b0 = b.combatant.health.current, e0 = e.combatant.health.current;
    w._resolve(e, p, hb); w._resolve(e, b, hb); w._resolve(p, e, hb);
    return [h0 - p.combatant.health.current, b0 - b.combatant.health.current, e0 - e.combatant.health.current];
  };
  const [s, k, g] = ["story", "knight", "paragon"].map(taken);
  assert.ok(Math.abs(s[0] - k[0] * 0.6) < 0.01 && Math.abs(g[0] - k[0] * 1.3) < 0.01, `Rook: ${s[0]} / ${k[0]} / ${g[0]}`);
  assert.ok(s[1] < k[1] && g[1] > k[1], "and the squad");
  assert.equal(s[2], k[2]); assert.equal(g[2], k[2], "your blade hits as hard on every difficulty");
});

test("How often they swing: one AI, paced by data (recovery and cooldowns), and how many swing at once", () => {
  const brain = (pace) => {
    const b = new EnemyBrain("x", new AttackTokenPool(2), [new AttackOption({ id: "Bite" }, 0, 3, 1, 100)], () => 0);
    b.pace = pace;
    const p = { frame: 0, hasTarget: true, distance: 1, isStaggered: false, isDead: false, abilityRunning: false };
    const out = b.think(p);
    assert.ok(out.attack);
    b.think({ ...p, frame: 1, abilityRunning: true }); b.think({ ...p, frame: 2 });
    return { recover: b.recoverLeft, ready: b.options[0].readyFrame };
  };
  const k = brain(DIFFICULTIES.knight), s = brain(DIFFICULTIES.story), g = brain(DIFFICULTIES.paragon);
  assert.ok(s.recover > k.recover && g.recover < k.recover, `recovery ${s.recover} / ${k.recover} / ${g.recover}`);
  assert.ok(s.ready > k.ready && g.ready < k.ready, "the big moves come round more often on Paragon");
  assert.equal(brain(null).recover, k.recover, "no pace: as made");
  const w = new World({ seed: 3, tokens: 2 });
  for (const [d, cap] of [["story", 1], ["knight", 2], ["paragon", 3]]) { w.difficulty = d; assert.equal(w.tokens.capacity, cap, d); }
  const phone = new World({ seed: 3, tokens: 1, difficulty: "story" });
  assert.equal(phone.tokens.capacity, 1, "never fewer than one");
  // The World hands its pace to every enemy brain as it thinks.
  w.difficulty = "paragon"; const e = w.spawnEnemy("hound", 0, 4); run(w, 2);
  assert.equal(e.brain.pace, DIFFICULTIES.paragon);
});

test("Chosen in Settings (before the first frame, on the title too), remembered, changeable mid-fight; Story holds the combo on every device; stance moved to 4", () => {
  const main = src("main.js");
  assert.match(main, /difficulty: "knight" \};/, "a remembered setting, Knight by default");
  assert.match(main, /k !== "difficulty" \|\| DIFFICULTY_KEYS\.includes\(v\)/, "a saved value is checked");
  assert.match(main, /world\.difficulty = settings\.difficulty;/);
  assert.match(main, /difficulty: settings\.difficulty, companions: true/, "every new fight starts on it");
  assert.match(main, /controls\.smartCombo = settings\.assist \|\| difficultyOf\(settings\.difficulty\)\.autoCombo;/);
  assert.match(tpl, /<button data-a11y="difficulty"/);
  assert.ok(tpl.indexOf("<h3>DIFFICULTY</h3>") < tpl.indexOf("<h3>ACCESSIBILITY</h3>"), "top of the card");
  assert.match(tpl, /data-start-settings>SETTINGS &amp; ACCESSIBILITY · <span data-difficulty-name>/, "the title says which");
  const ctl = src("runtime/controls.js");
  assert.match(ctl, /this\.keys\.has\("KeyJ"\) \|\| this\.held\.mouse \|\| this\.held\.pad/, "keyboard, mouse and pad hold the string too");
  assert.match(ctl, /Digit4"\) this\.commands\.push\("stance"\)/);
  assert.doesNotMatch(ctl, /Digit3"\) this\.commands\.push\("stance"\)/, "3 calls the third squadmate and nothing else");
  assert.match(main, /if \(cmd === "assist:third"\) story\.choose\(2\);/);
  assert.doesNotMatch(main, /cmd === "stance"\) story\.choose/, "D-pad up only moves a menu's cursor");
});
