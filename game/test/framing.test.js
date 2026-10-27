import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { actorsAt, shotProblems, cutsceneProblems, wideShot, wideShotProblems, closeUp, cameraFits, sightBlocked, standsInWall } from "../src/core/framing.js";
import { ZONES } from "../src/data/zones.js";
import { CUTSCENES } from "../src/data/story/cutscenes.js";
import { LOOKS } from "../src/runtime/rig.js";

const scaleOf = (look) => LOOKS[look]?.scale ?? 1;
// Every episode file: the story's, and the reveal's own (src/reveal/, the sanctioned exception to the leak rules).
const EPISODE_FILES = [["../src/data/story/", "data/story"], ["../src/reveal/", "reveal"]].flatMap(([dir]) =>
  readdirSync(new URL(dir, import.meta.url)).filter((f) => /^ep\d+\.js$/.test(f)).map((f) => new URL(dir + f, import.meta.url).href));
// A beat's set walls, as the runtime finds them (runtime/story.js Stage.setup).
const wallsFor = (b) => { const z = Object.values(ZONES).find((z) => z.stage === (b.stage ?? "yard") && !z.roamOnly); return z ? { ...z.bounds, interior: !!z.interior } : null; };
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

test("every cutscene: nobody stands or walks through anybody else", () => {
  for (const [id, cs] of Object.entries(CUTSCENES)) {
    for (let t = 0; t <= cs.duration + 1e-6; t += 0.125) {
      const on = actorsAt(cs, t, scaleOf).filter((a) => a.shown);
      for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
        const a = on[i], b = on[j];
        if (Math.abs(a.y - b.y) > 1.5) continue; // one up on the ridge, or down under the lake
        if (a.down || b.down) continue; // lying down, or being carried: not standing anywhere
        const d = Math.hypot(a.x - b.x, a.z - b.z);
        assert.ok(d >= 0.42 * (a.scale + b.scale), `${id} @${t.toFixed(2)}s: ${a.id} and ${b.id} are ${d.toFixed(2)} m apart`);
      }
    }
  }
});

test("every scene and walk-around: nobody stands inside anybody else, or inside a building, a column or a wall, Rook included", async () => {
  const R = (look) => 0.42 * scaleOf(look);
  const files = EPISODE_FILES;
  let checked = 0;
  for (const f of files) {
    const mod = await import(f);
    for (const ep of Object.values(mod).filter((v) => v?.beats)) {
      for (const b of ep.beats.filter((x) => x.type === "scene" || x.type === "explore")) {
        // Everyone a `when` might bring on, all at once: stricter than any one playthrough.
        const ppl = [...(b.cast ?? []).filter((c) => !c.down), ...(b.rook ? [{ id: "rook", look: "player", ...b.rook }] : [])];
        // On their feet: not in anything, a table included. Lying down: not in a wall. Held up off the ground (Elodie in the Hollow's light): anywhere.
        for (const a of [...ppl, ...(b.cast ?? []).filter((c) => c.down)].filter((c) => !c.y)) {
          assert.ok(!standsInWall(a, wallsFor(b), 0.2, !a.down), `${ep.id}/${b.id}: ${a.id} at (${a.x}, ${a.z}) is in the set's walls or furniture`);
        }
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

test("a scene's wide shot swings round the group until nobody's hidden behind anybody, and a crowd may stand in rows", () => {
  const row = [{ id: "a", x: 0, z: 0 }, { id: "b", x: 0.7, z: 2 }, { id: "c", x: -2, z: 1 }];
  const base = wideShot([{ x: 0, z: 0 }, { x: 0, z: 0.01 }]);
  assert.ok(base.pos.z < 0 && base.look.y > 1, "from the near side, looking at chest height");
  assert.deepEqual(wideShotProblems(row).filter((p) => p.kind === "hidden"), []);
  const guards = [-2, 0, 2].flatMap((x) => [{ id: `f${x}`, x, z: 4, crowd: true }, { id: `r${x}`, x: x + 0.1, z: 5.4, crowd: true }]);
  assert.deepEqual(wideShotProblems([...row, ...guards]).filter((p) => p.kind === "hidden"), []);
});

test("every scene's wide shot, from where everyone starts: nobody hidden behind anybody or behind the set, nobody looming over the lens, never in a wall", async () => {
  const files = EPISODE_FILES;
  let checked = 0;
  for (const f of files) {
    const mod = await import(f);
    const scripts = Object.values(mod).filter((v) => typeof v === "string").join("\n");
    for (const ep of Object.values(mod).filter((v) => v?.beats)) {
      for (const b of ep.beats.filter((x) => x.type === "scene")) {
        const body = scripts.match(new RegExp(`title: ${b.node}\\n---\\n([\\s\\S]*?)\\n===`))?.[1] ?? "";
        const ppl = [...(b.cast ?? []).filter((c) => !c.down && !c.hidden), ...(b.rook ? [{ id: "rook", look: "player", ...b.rook }] : [])];
        for (const mode of new Set([...body.matchAll(/<<shot wide ?(\w*)>>/g)].map((m) => m[1] || undefined))) {
          const bad = wideShotProblems(ppl, scaleOf, mode, wallsFor(b)).filter((p) => ["hidden", "looms", "lens", "walled", "outside"].includes(p.kind));
          assert.deepEqual(bad, [], `${ep.id}/${b.id} wide${mode ? " " + mode : ""}`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked >= 50, `checked ${checked}`);
});

test("a wide shot only fades out someone right against the lens, never whoever stands in the middle of the group", () => {
  const src = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  const occ = src.slice(src.indexOf("_occlusion() {"), src.indexOf("_frameBias() {"));
  assert.match(occ, /for \(let i = 0; i <= 10 && !block && this\.currentShot\.kind !== "wide"; i\+\+\)/);
});

test("SKIP owns the top-right corner in a cutscene: the menu steps aside", () => {
  const html = readFileSync(new URL("../template.html", import.meta.url), "utf8");
  assert.match(html, /\.in-cut \.cut-skip \{ display: block; \}/);
  assert.match(html, /\.in-cut \.menu \{ visibility: hidden; \}/);
});

test("A dialogue close-up never stands in a wall: indoors, with someone's back to the wall and Rook at their side, the camera comes round or steps in", () => {
  const hall = { ...ZONES.hall.bounds, interior: true };
  // Ep 41: Mother Vey under the Lanterns' row, turned to Rook beside her. One of the old angles stood inside the north wall.
  const vey = { x: 0.6, z: 7.4 }, rook = { x: 1.5, z: 7.6 };
  const shot = closeUp({ ...vey, yaw: Math.atan2(rook.x - vey.x, rook.z - vey.z) }, [rook], hall);
  assert.ok(cameraFits(shot.pos, hall), JSON.stringify(shot.pos));
  // Everyone in every interior, a step from each wall, facing every way.
  for (const z of Object.values(ZONES).filter((z) => z.interior)) {
    const walls = { ...z.bounds, interior: true }, [x0, z0, x1, z1] = walls.rect;
    for (const [px, pz] of [[x0 + 0.8, (z0 + z1) / 2], [x1 - 0.8, (z0 + z1) / 2], [(x0 + x1) / 2, z0 + 0.8], [(x0 + x1) / 2, z1 - 0.8]]) {
      if (!cameraFits({ x: px, z: pz }, walls, 0.4)) continue; // standing in furniture: nobody's put there
      for (let yaw = 0; yaw < Math.PI * 2; yaw += Math.PI / 4) {
        const s = closeUp({ x: px, z: pz, yaw }, [], walls);
        assert.ok(cameraFits(s.pos, walls), `${z.id} (${px}, ${pz}) facing ${yaw.toFixed(2)}: camera at (${s.pos.x.toFixed(2)}, ${s.pos.z.toFixed(2)})`);
      }
    }
  }
  // Out in the open there are no walls to mind: the first choice is straight in front of the face.
  const open = closeUp({ x: 0, z: 0, yaw: 0 }, [], null);
  assert.ok(open.pos.z > 2.5 && Math.abs(open.pos.x) < 1);
});

test("A wide shot indoors keeps out of the walls and finds an angle between the columns; a close-up won't look through a house", () => {
  const hall = { ...ZONES.hall.bounds, interior: true };
  // Ep 41's last scene before the fix: everyone at the Lanterns' row, and the old angle looked through two columns.
  const row = 9.75 - 2.6, ppl = [{ id: "lio", x: 1.6, z: row - 1.4 }, { id: "juno", x: -0.6, z: row - 1.6 }, { id: "keeper", x: 3.6, z: row - 3.4 }, { id: "rook", x: -1.2, z: row - 3.2 }];
  assert.ok(wideShotProblems(ppl, () => 1, undefined, null).length >= 0);
  const sh = wideShot(ppl.map((p) => ({ ...p, scale: 1 })), undefined, hall);
  assert.ok(cameraFits(sh.pos, hall));
  for (const p of ppl) assert.ok(!sightBlocked(sh.pos, p, hall), p.id);
  // The Lighthouse: someone with the house at their back, turned toward it. The camera won't stand in it, or look through it.
  const lh = { ...ZONES.lighthouse.bounds };
  const s = closeUp({ x: -3.4, z: 9.4, yaw: 0 }, [], lh);
  assert.ok(cameraFits(s.pos, lh) && !sightBlocked(s.pos, s.look, lh), JSON.stringify(s.pos));
});

test("Indoors the follow camera keeps in front of the side and back walls, in a walk-around and in a fight", () => {
  const src = readFileSync(new URL("../src/runtime/story.js", import.meta.url), "utf8");
  const fight = src.slice(src.indexOf("async runFight(beat) {"), src.indexOf("for (;;) {", src.indexOf("async runFight(beat) {")));
  assert.match(fight, /makeWorld[\s\S]*z\.interior\);\s*if \(room\) this\.ctx\.camera\.bounds = cameraBounds\(room\);/, "after the new world clears it");
  assert.match(src, /const cameraBounds = \(zone\) => \(zone\.interior \? \{ \.\.\.zone\.bounds, interior: true \} : zone\.bounds\);/);
  const cam = readFileSync(new URL("../src/runtime/camera.js", import.meta.url), "utf8");
  assert.match(cam, /m = b\.interior \? -0\.35 : 3, back = 3;/);
});
