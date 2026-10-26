import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { actorsAt, shotProblems, cutsceneProblems } from "../src/core/framing.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { LOOKS } from "../src/runtime/rig.js";

const scaleOf = (look) => LOOKS[look]?.scale ?? 1;
const still = (pos, look, fov = 0.6) => [{ t: 0, cut: true, pos, look, fov }];

test("the framing checker sees someone in the lens, someone in the way, a cropped head and someone hidden behind someone", () => {
  const cs = (camera, actors) => ({ duration: 1, camera, actors, events: [] });
  const lens = shotProblems(cs(still([0, 1.6, 0], [0, 1.6, 10]), [{ id: "a", x: 0.3, z: 0.4 }]), 0);
  assert.ok(lens.some((p) => p.kind === "lens" && p.id === "a"));
  const blocks = shotProblems(cs(still([0, 1.6, 0], [0, 1.6, 10]), [{ id: "near", x: 0.1, z: 4 }, { id: "far", x: 0, z: 10 }]), 0);
  assert.ok(blocks.some((p) => p.kind === "blocks" && p.id === "near"));
  const crop = shotProblems(cs(still([0, 0.4, 1.4], [0, 0.6, 3]), [{ id: "a", x: 0, z: 3 }]), 0);
  assert.ok(crop.some((p) => p.kind === "cropped" && p.id === "a"));
  const hidden = shotProblems(cs(still([0, 1.6, 0], [3, 1.6, 10]), [{ id: "front", x: 0, z: 5 }, { id: "back", x: 0.05, z: 7 }]), 0);
  assert.ok(hidden.some((p) => p.kind === "hidden" && p.id === "back" && p.by === "front"));
  const fine = shotProblems(cs(still([0, 1.7, -4], [0, 1.2, 4]), [{ id: "a", x: -1, z: 4 }, { id: "b", x: 1, z: 4.4 }]), 0);
  assert.deepEqual(fine, []);
});

test("a column of people seen end-on hides the ones at the back; a huge head sliced by the frame's edge is flagged unless it's an over-the-shoulder", () => {
  const cs = (camera, actors) => ({ duration: 1, camera, actors, events: [] });
  const column = [{ id: "a", x: 0.18, z: 6 }, { id: "b", x: -0.18, z: 8 }, { id: "c", x: 0, z: 10 }];
  const end = shotProblems(cs(still([0, 4, -4], [6, 1.4, 14]), column), 0);
  assert.ok(end.some((p) => p.kind === "hidden" && p.id === "c"), JSON.stringify(end));
  const across = shotProblems(cs(still([-12, 4, 8], [0, 1.4, 8]), column), 0);
  assert.deepEqual(across, [], "from the side they're a row, all in view");
  const shoulder = [{ id: "near", x: 0.9, z: 1.4 }, { id: "far", x: 0, z: 8 }];
  const big = shotProblems(cs(still([0, 1.7, 0], [0, 1.5, 8]), shoulder), 0);
  assert.ok(big.some((p) => p.kind === "looms" && p.id === "near"));
  const ots = shotProblems(cs([{ t: 0, cut: true, pos: [0, 1.7, 0], look: [0, 1.5, 8], fov: 0.6, ots: "near" }], shoulder), 0);
  assert.ok(!ots.some((p) => p.kind === "looms"));
});

test("the checker follows people as they're shown, hidden and walked about", () => {
  const cs = { duration: 6, camera: still([0, 2, -6], [0, 1, 0]), actors: [{ id: "a", x: 0, z: 0, hidden: true }],
    events: [{ t: 1, show: "a" }, { t: 2, move: { id: "a", to: [4, 0], dur: 2 } }, { t: 5, hide: "a" }] };
  assert.equal(actorsAt(cs, 0.5)[0].shown, false);
  assert.equal(actorsAt(cs, 1.5)[0].shown, true);
  assert.equal(actorsAt(cs, 4.5)[0].x, 4);
  assert.equal(actorsAt(cs, 5.5)[0].shown, false);
});

test("every cutscene: nobody fills the lens, stands in front of the shot's subject, is hidden behind someone, or has their head cut off", () => {
  assert.ok(Object.keys(CUTSCENES).length >= 5);
  for (const [id, cs] of Object.entries(CUTSCENES)) {
    const ps = cutsceneProblems(cs, scaleOf);
    assert.deepEqual(ps.map((p) => `${id} shot ${p.shot} @${p.t.toFixed(2)}s: ${p.id} ${p.kind}${p.by ? ` behind ${p.by}` : ""}`), [], id);
  }
});

test("every scene and walk-around: nobody stands inside anybody else, Rook included", async () => {
  const R = (look) => 0.42 * scaleOf(look);
  const files = readdirSync(new URL("../src/data/story/", import.meta.url)).filter((f) => /^ep\d+\.js$/.test(f));
  let checked = 0;
  for (const f of files) {
    const mod = await import(`../src/data/story/${f}`);
    for (const ep of Object.values(mod).filter((v) => v?.beats)) {
      for (const b of ep.beats.filter((x) => x.type === "scene" || x.type === "explore")) {
        // Everyone a `when` might bring on, all at once: stricter than any one playthrough.
        const ppl = [...(b.cast ?? []).filter((c) => !c.down), ...(b.rook ? [{ id: "rook", look: "player", ...b.rook }] : [])];
        for (let i = 0; i < ppl.length; i++) for (let j = i + 1; j < ppl.length; j++) {
          const a = ppl[i], c = ppl[j], d = Math.hypot(a.x - c.x, a.z - c.z), need = R(a.look) + R(c.look) + 0.25;
          assert.ok(d >= need, `${ep.id}/${b.id}: ${a.id} and ${c.id} are ${d.toFixed(2)} m apart (need ${need.toFixed(2)})`);
        }
        checked++;
      }
    }
  }
  assert.ok(checked >= 60, `checked ${checked}`);
});

test("SKIP owns the top-right corner in a cutscene: the menu steps aside", () => {
  const html = readFileSync(new URL("../template.html", import.meta.url), "utf8");
  assert.match(html, /\.in-cut \.cut-skip \{ display: block; \}/);
  assert.match(html, /\.in-cut \.menu \{ visibility: hidden; \}/);
});
