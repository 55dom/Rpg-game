// Backlash's sets (Ep 49; the sanctioned exception, GDD §15.11). Built with runtime/sets.js's kit, registered in its
// table of set builders. Layouts in ./places.js.

import { B, toon, glow, color3 } from "../runtime/look.js";
import { kit, buildRoom, mulberry } from "../runtime/sets.js";
import { CAMP_LAYOUT, THRONE_LAYOUT, CAVERN_LAYOUT } from "./places.js";

const ASH_ENV = { clear: "#5a5658", fog: "#6a6466", fogDensity: 0.014, hemi: [0.55, "#d8d2cc", "#3a3436"], sun: [0.45, "#e8dcd0", [-0.3, -1, 0.4]], warm: 0 };
const ASH_TOON = { lightDir: [0.3, 1, -0.4], fogColor: "#6a6466", fogDensity: 0.008, sky: [0.92, 0.9, 0.9], ground: [0.66, 0.62, 0.62], rim: [0.9, 0.82, 0.78] };

/** The camp under the black castle: ash, the drill yard, tents, the mess, carts, braziers, the wall and its gate. */
export function buildCamp(scene) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = CAMP_LAYOUT, rng = mulberry(49);
  const ash = toon(scene, "cp-ash", "#4a4648"), yardM = toon(scene, "cp-yard", "#6e6660"), black = toon(scene, "cp-black", "#1a1416");
  const red = toon(scene, "cp-red", "#4a1212"), iron = toon(scene, "cp-iron", "#2a2628"), wood = toon(scene, "cp-wood", "#3a2a22");
  const ground = add(MB.CreateGround("cp-ground", { width: 160, height: 160 }, scene)); ground.material = ash;
  const yard = add(MB.CreateDisc("cp-yardDisc", { radius: L.yard.r, tessellation: 40 }, scene)); yard.rotation.x = Math.PI / 2; yard.position.set(L.yard.x, 0.01, L.yard.z); yard.material = yardM;
  for (const [x, z] of L.posts) { // training posts: a stake and a crossbar
    const p = add(MB.CreateCylinder("cp-post", { height: 2.0, diameter: 0.26, tessellation: 8 }, scene), 0.02); p.position.set(x, 1.0, z); p.material = wood;
    const bar = add(MB.CreateBox("cp-postBar", { width: 1.2, height: 0.14, depth: 0.14 }, scene)); bar.position.set(x, 1.5, z); bar.material = wood;
  }
  for (const [x, z] of L.tents) { // black tents, a red stripe at the ridge
    const t = add(MB.CreateCylinder("cp-tent", { height: 7, diameter: 5.4, tessellation: 3 }, scene), 0.04);
    t.rotation.set(Math.PI / 2, 0, Math.PI / 2); t.position.set(x, 1.55, z); t.scaling.set(0.62, 1, 1); t.material = black;
    const ridge = add(MB.CreateBox("cp-ridge", { width: 0.2, height: 0.12, depth: 7.1 }, scene)); ridge.position.set(x, 3.15, z); ridge.material = red;
  }
  { // the mess: a long iron table and its benches, bowls set out
    const top = add(MB.CreateBox("cp-mess", { width: 8, height: 0.12, depth: 1.4 }, scene), 0.02); top.position.set(L.mess.x, 0.82, L.mess.z); top.material = iron;
    for (const dz of [-1.1, 1.1]) { const b = add(MB.CreateBox("cp-bench", { width: 8, height: 0.1, depth: 0.4 }, scene)); b.position.set(L.mess.x, 0.46, L.mess.z + dz); b.material = iron; }
    for (let i = 0; i < 8; i++) { const bw = add(MB.CreateCylinder("cp-bowl", { height: 0.08, diameterTop: 0.26, diameterBottom: 0.16, tessellation: 8 }, scene)); bw.position.set(L.mess.x - 3.5 + i, 0.92, L.mess.z + (i % 2 ? 0.35 : -0.35)); bw.material = iron; }
  }
  for (const [x, z] of L.carts) {
    const c = add(MB.CreateBox("cp-cart", { width: 2.4, height: 0.9, depth: 1.5 }, scene), 0.02); c.position.set(x, 0.8, z); c.rotation.y = rng() * 0.6; c.material = wood;
    for (let k = 0; k < 3; k++) { const crate = add(MB.CreateBox("cp-crate", { width: 0.6, height: 0.5, depth: 0.6 }, scene)); crate.position.set(x - 0.6 + k * 0.6, 1.5, z); crate.material = iron; }
  }
  const fireM = glow(scene, "cp-fire", "#ff6a2a", 0.95, true), fires = [];
  for (const [x, z] of L.braziers) {
    const b = add(MB.CreateCylinder("cp-brazier", { height: 1.0, diameterTop: 0.9, diameterBottom: 0.5, tessellation: 10 }, scene), 0.02); b.position.set(x, 0.5, z); b.material = iron;
    const f = add(MB.CreateBox("cp-flame", { width: 0.5, height: 0.6, depth: 0.5 }, scene)); f.position.set(x, 1.3, z); f.material = fireM; fires.push(f);
  }
  { // the castle wall and its gate, towers, and the castle's black mass behind
    const W = L.wall, stone = toon(scene, "cp-stone", "#2a2426");
    for (const [x0, x1] of [[-60, -W.gate], [W.gate, 60]]) { const w = add(MB.CreateBox("cp-wall", { width: x1 - x0, height: 12, depth: 3 }, scene), 0.05); w.position.set((x0 + x1) / 2, 6, W.z + 1.5); w.material = stone; }
    for (const sx of [-1, 1]) { const tw = add(MB.CreateCylinder("cp-tower", { height: 18, diameter: 5, tessellation: 8 }, scene), 0.05); tw.position.set(sx * (W.gate + 2.5), 9, W.z + 1.5); tw.material = stone; }
    const lintel = add(MB.CreateBox("cp-lintel", { width: W.gate * 2, height: 3, depth: 3 }, scene), 0.04); lintel.position.set(0, 10.5, W.z + 1.5); lintel.material = stone;
    const keep = add(MB.CreateBox("cp-keep", { width: 40, height: 46, depth: 30 }, scene), 0.06); keep.position.set(0, 23, W.z + 30); keep.material = toon(scene, "cp-keepM", "#141012");
    for (const sx of [-14, 0, 14]) { const sp = add(MB.CreateCylinder("cp-spire", { height: 30, diameterTop: 0, diameterBottom: 7, tessellation: 6 }, scene), 0.05); sp.position.set(sx, 61, W.z + 30); sp.material = black; }
  }
  // Banners: red, black, ragged, on poles along the yard.
  for (const x of [-12, 12]) for (const z of [-16, 0, 14]) {
    const pole = add(MB.CreateCylinder("cp-pole", { height: 6, diameter: 0.14, tessellation: 6 }, scene)); pole.position.set(x, 3, z); pole.material = iron;
    const ban = add(MB.CreateBox("cp-banner", { width: 1.1, height: 2.2, depth: 0.04 }, scene)); ban.position.set(x + 0.6, 4.6, z); ban.material = red;
  }
  const light = new BB.PointLight("cp-fires", new BB.Vector3(0, 6, 4), scene); light.diffuse = color3("#ff8a4a").clone(); light.intensity = 0.4; light.range = 40; K.lights.push(light);
  K.bake(fires);
  return { env: ASH_ENV, toon: ASH_TOON, show: K.show, conditions: K.conditions, outdoor: true,
    update(dt, t) { fires.forEach((f, i) => { f.scaling.y = 0.8 + Math.sin(t * 9 + i * 1.7) * 0.2; }); } };
}

/** The throne chamber: black pillars, a red runner, the dais and the throne, the two places beside it, the coffin behind. */
export function buildThrone(scene) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = THRONE_LAYOUT;
  const room = buildRoom(scene, K, { prefix: "tr", half: L.half, height: 12, wall: "#1e181a", wainscot: "#120e10", floorA: "#2a2426", floorB: "#221c1e", door: L.door, windows: [] });
  const black = toon(scene, "tr-black", "#141012"), gold = toon(scene, "tr-gold", "#8a6a2a"), red = toon(scene, "tr-red", "#5a1414");
  const runner = add(MB.CreateGround("tr-runner", { width: 3, height: L.half[1] * 2 - 8 }, scene)); runner.position.set(0, 0.012, -4); runner.material = red;
  for (const z of L.pillars) for (const x of [-5, 5]) {
    const p = add(MB.CreateCylinder("tr-pillar", { height: 12, diameter: 1.4, tessellation: 8 }, scene), 0.04); p.position.set(x, 6, z); p.material = black;
    const fire = add(MB.CreateBox("tr-sconce", { width: 0.3, height: 0.5, depth: 0.3 }, scene)); fire.position.set(x + (x < 0 ? 0.8 : -0.8), 3.4, z); fire.material = glow(scene, "tr-sconceM", "#ff6a2a");
  }
  const dais = add(MB.CreateCylinder("tr-dais", { height: 0.6, diameter: L.dais.r * 2, tessellation: 32 }, scene), 0.03); dais.position.set(0, 0.3, L.dais.z); dais.material = black;
  { // the throne: a high black back with two horns of stone, gold edging
    const T = L.throne;
    const back = add(MB.CreateBox("tr-throneBack", { width: 2.6, height: 6.4, depth: 0.5 }, scene), 0.03); back.position.set(T.x, 3.8, T.z + 0.6); back.material = black;
    const seat = add(MB.CreateBox("tr-throneSeat", { width: 2.8, height: 1.0, depth: 1.6 }, scene), 0.03); seat.position.set(T.x, 1.1, T.z); seat.material = black;
    for (const sx of [-1, 1]) {
      const arm = add(MB.CreateBox("tr-throneArm", { width: 0.4, height: 1.8, depth: 1.6 }, scene), 0.02); arm.position.set(T.x + sx * 1.5, 1.5, T.z); arm.material = black;
      const horn = add(MB.CreateCylinder("tr-horn", { height: 2.2, diameterTop: 0, diameterBottom: 0.5, tessellation: 6 }, scene), 0.02); horn.position.set(T.x + sx * 1.1, 7.6, T.z + 0.6); horn.rotation.z = -sx * 0.35; horn.material = gold;
    }
  }
  { // the coffin, behind the throne
    const C = L.coffin;
    const body = add(MB.CreateBox("tr-coffin", { width: 1.5, height: 1.0, depth: 3.0 }, scene), 0.03); body.position.set(C.x, 0.5, C.z); body.rotation.y = Math.PI / 2; body.material = toon(scene, "tr-coffinM", "#0a0808");
    const lid = add(MB.CreateBox("tr-lid", { width: 1.6, height: 0.2, depth: 3.1 }, scene), 0.02); lid.position.set(C.x, 1.1, C.z); lid.rotation.y = Math.PI / 2; lid.material = gold;
  }
  const warm = new BB.PointLight("tr-warm", new BB.Vector3(0, 7, 6), scene); warm.diffuse = color3("#ff7a3a").clone(); warm.intensity = 0.5; warm.range = 34; K.lights.push(warm);
  K.bake(room.keep);
  const env = { clear: "#0a0708", fog: "#120c0c", fogDensity: 0.012, hemi: [0.5, "#e0c8c0", "#1a1214"], sun: [0.35, "#ffb090", [0.1, -1, 0.3]], warm: 0 };
  const toonEnv = { lightDir: [0.1, 1, -0.3], fogColor: "#120c0c", fogDensity: 0.006, sky: [0.9, 0.8, 0.78], ground: [0.6, 0.52, 0.52], rim: [1.0, 0.62, 0.48] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update() { room.cutaway(scene.activeCamera, self.mood?.player); } };
  return self;
}

/** Under the castle: rough walls, rocks, glyphs that faintly glow, a broken helm, and the mural on the far wall. */
export function buildCaverns(scene) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = CAVERN_LAYOUT, rng = mulberry(3);
  const room = buildRoom(scene, K, { prefix: "cv", half: L.half, height: 9, wall: "#2a2624", wainscot: "#1e1a18", floorA: "#3a3430", floorB: "#332e2a", door: { x: 0, z: -L.half[1] }, windows: [] });
  const rock = toon(scene, "cv-rock", "#3e3834");
  for (const [x, z, r] of L.rocks) { const m = add(MB.CreateSphere("cv-rock", { diameter: r * 2, segments: 6 }, scene), 0.04); m.position.set(x, r * 0.5, z); m.scaling.y = 0.7; m.rotation.y = rng() * 3; m.material = rock; }
  const glyphM = glow(scene, "cv-glyph", "#9a7ad8", 0.85);
  for (const [x, z] of L.glyphs) for (let i = 0; i < 9; i++) {
    const g = add(MB.CreateBox("cv-glyph", { width: 0.04, height: 0.16 + rng() * 0.2, depth: 0.12 + rng() * 0.3 }, scene)); g.position.set(x, 1.4 + Math.floor(i / 3) * 0.5, z - 0.8 + (i % 3) * 0.6); g.material = glyphM;
  }
  { // a broken helm on its side, tally marks scratched inside, and beside them one small filled circle
    const H = L.helm, ironM = toon(scene, "cv-helmM", "#4a1414");
    const helm = add(MB.CreateSphere("cv-helm", { diameter: 0.6, segments: 10, slice: 0.6 }, scene), 0.02); helm.position.set(H.x, 0.3, H.z); helm.rotation.z = Math.PI / 2.4; helm.material = ironM;
    for (let i = 0; i < 6; i++) { const t = add(MB.CreateBox("cv-tally", { width: 0.012, height: 0.1, depth: 0.012 }, scene)); t.position.set(H.x - 0.12 + i * 0.03, 0.42, H.z - 0.05); t.material = toon(scene, "cv-scratch", "#c8c0b8"); }
    const dot = add(MB.CreateCylinder("cv-dot", { height: 0.01, diameter: 0.05, tessellation: 12 }, scene)); dot.position.set(H.x + 0.12, 0.42, H.z - 0.05); dot.rotation.x = Math.PI / 2; dot.material = toon(scene, "cv-dotM", "#0a0a0a");
  }
  { // the mural: a king of some forgotten age, wounded, pouring black from his chest into two winged figures who kneel
    const M = L.mural, tex = new BB.DynamicTexture("cv-muralTex", { width: 512, height: 256 }, scene, true), c = tex.getContext();
    c.fillStyle = "#5a4e44"; c.fillRect(0, 0, 512, 256);
    c.fillStyle = "#3a2e28"; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 12, 1 + Math.random() * 3); // age
    const fig = (x, y, s, kneel) => { c.beginPath(); c.arc(x, y - 52 * s, 9 * s, 0, Math.PI * 2); c.fill(); c.fillRect(x - 8 * s, y - 44 * s, 16 * s, kneel ? 26 * s : 44 * s); };
    c.fillStyle = "#1a1210"; fig(256, 210, 1.5, false); // the king, standing, crowned
    c.beginPath(); c.moveTo(238, 128); c.lineTo(244, 112); c.lineTo(250, 126); c.lineTo(256, 108); c.lineTo(262, 126); c.lineTo(268, 112); c.lineTo(274, 128); c.fill();
    c.fillStyle = "#8a1a14"; c.fillRect(250, 150, 12, 8); // the wound
    c.strokeStyle = "#0a0606"; c.lineWidth = 7; // black, pouring out of him to either side
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(256, 154); c.quadraticCurveTo(256 + sx * 60, 120, 256 + sx * 118, 168); c.stroke(); }
    c.fillStyle = "#1a1210";
    for (const sx of [-1, 1]) {
      fig(256 + sx * 128, 214, 1.0, true);
      c.beginPath(); c.moveTo(256 + sx * 128, 160); c.lineTo(256 + sx * 172, 128); c.lineTo(256 + sx * 160, 176); c.fill(); // a wing
      c.globalAlpha = 0.5; fig(256 + sx * 200, 214, 0.9, false); c.globalAlpha = 1; // and after: wingless, robed, standing
    }
    tex.update();
    const mat = new BB.StandardMaterial("cv-muralM", scene); mat.diffuseTexture = tex; mat.emissiveColor = color3("#6a5a50"); mat.specularColor = BB.Color3.Black();
    const mural = add(MB.CreatePlane("cv-mural", { width: M.w, height: M.h }, scene)); mural.position.set(0, 4, M.z - 0.05); mural.material = mat;
  }
  const lamp = new BB.PointLight("cv-light", new BB.Vector3(0, 6, 6), scene); lamp.diffuse = color3("#b8a0e8").clone(); lamp.intensity = 0.45; lamp.range = 30; K.lights.push(lamp);
  K.bake(room.keep);
  const env = { clear: "#08070a", fog: "#0c0a0e", fogDensity: 0.02, hemi: [0.5, "#c8b8e0", "#141018"], sun: [0.3, "#b8a8d8", [0.1, -1, 0.3]], warm: 0 };
  const toonEnv = { lightDir: [0.1, 1, -0.3], fogColor: "#0c0a0e", fogDensity: 0.01, sky: [0.8, 0.76, 0.88], ground: [0.5, 0.48, 0.56], rim: [0.8, 0.7, 1.0] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update() { room.cutaway(scene.activeCamera, self.mood?.player); } };
  return self;
}
