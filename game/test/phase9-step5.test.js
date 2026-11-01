import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { creditsFor, CREDITS_SECONDS } from "../src/reveal/credits.js";
import { EPISODE_70 } from "../src/reveal/ep70.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const flags = (o) => ({ get: (k) => o[k] });
const text = (secs) => secs.flatMap((s) => [s.head ?? "", ...s.lines.flat()]).join("\n");

test("The last card (Ep 70) rolls the credits, and says so: not 'to be continued'", () => {
  const pv = EPISODE_70.beats.find((b) => b.type === "preview");
  assert.equal(pv.end, true);
  assert.ok(!pv.nextEpisode);
  const story = src("runtime/story.js");
  assert.match(story, /else if \(beat\.end\) add\("ROLL CREDITS", "credits"\)/);
  assert.match(story, /if \(beat\.end\) add\("BACK TO THE TITLE", "title", true\); else add\("EPISODE 4 RUN", "run", true\)/);
  assert.match(src("main.js"), /if \(exit\?\.kind === "credits"\) showCredits\(\);/);
});

test("What you wrote: each ending rolls its own credits", () => {
  const roll = (fate) => text(creditsFor(flags({ CAL_FATE: fate }), "Rook"));
  assert.match(roll("fall"), /“Fall\.”/);
  assert.match(roll("stay"), /“Stay\.”/);
  assert.match(roll("lantern"), /“You're a Lantern\.”/);
  assert.match(roll("lantern"), /who held the door, and came home/);
  assert.doesNotMatch(roll("fall"), /came home/);
  assert.doesNotMatch(roll(undefined), /WHAT YOU WROTE/, "no ending, no line about one");
});

test("What was yours: only the choices you made, as you made them; and your name, as you chose it", () => {
  const a = text(creditsFor(flags({ EXAM_DUEL_WON: 1, MIRREN_SAVED: 1, ALDRIC_OFFER: "refused", PERSPECTIVE: "cal", MAELIS_PROMISE: "dont", LUKE_HOME_VISITED: 1 }), "Wren"));
  for (const l of ["You beat Severin at the Knight Exam.", "Her name is Mirren.", "the grimoire was yours", "you said his.", "You asked Maelis not to.", "Luke's door"]) assert.ok(a.includes(l), l);
  assert.match(a, /\nWren\n/, "the one-page mage, by the name you chose");
  const b = text(creditsFor(flags({ MIRREN_SAVED: 0, PERSPECTIVE: "rook", MAELIS_PROMISE: "why" }), "Rook"));
  for (const l of ["got up three times", "chased the acolyte", "you said yours.", "why she keeps offering"]) assert.ok(b.includes(l), l);
  assert.doesNotMatch(b, /Mirren/, "no Mirren if you didn't pull her out");
  assert.doesNotMatch(b, /Luke's door|the Chancellor/, "nothing you didn't do");
});

test("The roll: the Lanterns, everyone else, what it's made with, and the light left on; a player's name is never markup", () => {
  const secs = creditsFor(flags({}), "Rook");
  assert.deepEqual(secs.map((s) => s.head).filter(Boolean), ["WHAT WAS YOURS", "THE LANTERNS", "AND", "MADE WITH"]);
  assert.equal(secs.at(-1).lines[0], "Somebody's left the light on.");
  assert.ok(text(secs).includes("EPISODES & SAVES"), "every episode stays open to play again");
  assert.ok(CREDITS_SECONDS >= 30);
  const all = text(creditsFor(flags({ CAL_FATE: "lantern", MIRREN_SAVED: 1 }), "x"));
  assert.doesNotMatch(all, /butler|maid|archdemons?|musician|Ghorran|Vaelith|unkA|unkB/i, "the two in black aren't in the credits");
  assert.doesNotMatch(all, /je suis/i);
  const main = src("main.js");
  assert.match(main, /const esc = \(t\) => String\(t\)\.replace\(\/\[&<>"\]\/g/);
  assert.match(main, /creditsFor\(story\.flags, story\.player\.name\)/);
  assert.match(main, /if \(!reduced\) roll\.classList\.add\("rolling"\)/, "reduced motion: a still list");
  const tpl = readFileSync(new URL("../template.html", import.meta.url), "utf8");
  assert.match(tpl, /<div class="credits" data-credits hidden/);
  assert.match(tpl, /data-credits-done>BACK TO THE TITLE<\/button>/);
  assert.match(tpl, /@keyframes creditsRoll/);
});
