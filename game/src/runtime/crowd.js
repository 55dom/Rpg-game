// Background townsfolk (GDD §29.9), built from the character design sheets: five archetypes (villager
// in tunic and boots, woman in a long dress, elder in a robe with a yellow sash, laborer in leather,
// child in tunic and shorts), each person with their own colors, height, build, skin, hair style and
// pace, the sheets' anime head shape and the master-prompt eyes. Every body part is one instanced mesh
// colored per person, so the whole crowd costs ~17 draw calls however many people walk the streets.
// They stride with knees that bend, swing their arms, and a few stand in pairs, talking.
// Weather and night thin the crowd (density); rain hurries it along.

import { B } from "./look.js";
import { animeHead } from "./rig.js";

const SKIN = ["#f3dcc8", "#f0d0b4", "#e2b894", "#c88a64", "#8a5a3a", "#6b4632"];
const HAIR = ["#16141c", "#2a1e18", "#4a3020", "#6a4228", "#b04a26", "#e06a2a", "#f0c850", "#e4e4e8"];
// Clothing palettes taken from the sheets (tunics, dresses, robes, leather).
const TUNIC = ["#9a6232", "#c0402a", "#4a8ad0", "#2f7a4a", "#2b4a8a", "#141218", "#8a6a4a", "#e6dcc0"];
const DRESS = ["#7a4aa0", "#5a34a0", "#8a6a4a", "#3a5a8a", "#2f6a4a", "#c0402a"];
const ROBE = ["#5a3a8a", "#ece6d8", "#6b4a2e", "#2f6a4a"];
const LEATHER = ["#5a3a2a", "#4a3026", "#6a4228"];
const TROUSERS = ["#3a2622", "#2a3044", "#5a6a3a", "#4a3226", "#2f5a3a", "#232838"];
const BOOTS = ["#5a3a22", "#6a4228", "#8a5a32", "#3a2a1a"];
const BELTS = ["#5a3a22", "#6a4a2a", "#3a2a1a"];
const ARCHETYPES = ["villager", "villager", "dress", "dress", "robe", "laborer", "child"];

/** A mesh whose pivot sits at its top, so it can swing like a limb. */
function limb(scene, name, h, d0, d1) {
  const BB = B();
  const m = BB.MeshBuilder.CreateCylinder(name, { height: h, diameterTop: d0, diameterBottom: d1, tessellation: 7 }, scene);
  m.bakeTransformIntoVertices(BB.Matrix.Translation(0, -h / 2, 0));
  return m;
}

/**
 * @param K the set kit (root, add)
 * @param {{ count: number, paths: object[], rng: () => number, mobile?: boolean, chatters?: [number, number, number][] }} o
 *   paths: { cx, cz, r, dir } loops or { line: [[x0, z0], [x1, z1]] } back-and-forth;  chatters: [x, z, yaw] pairs standing still
 */
export function buildCrowd(scene, K, { count, paths, rng, mobile = false, chatters = [] }) {
  const BB = B(), MB = BB.MeshBuilder;
  const mat = new BB.StandardMaterial(`crowd-mat-${Math.floor(rng() * 1e6)}`, scene);
  mat.specularColor = BB.Color3.Black(); mat.emissiveColor = new BB.Color3(0.14, 0.14, 0.16);
  const src = (m) => { m.material = mat; m.parent = K.root; m.isPickable = false; m.metadata = { noGlow: true }; /* matte cloth: no bloom pass */ m.registerInstancedBuffer("color", 4); m.instancedBuffers.color = new BB.Color4(1, 1, 1, 1); m.setEnabled(false); return m; };
  const S = {
    torso: src(MB.CreateCylinder("crowd-torso", { height: 0.56, diameterTop: 0.34, diameterBottom: 0.3, tessellation: 9 }, scene)),
    hemShort: src(MB.CreateCylinder("crowd-hemShort", { height: 0.3, diameterTop: 0.31, diameterBottom: 0.44, tessellation: 9 }, scene)),
    hemLong: src(MB.CreateCylinder("crowd-hemLong", { height: 0.78, diameterTop: 0.31, diameterBottom: 0.66, tessellation: 10 }, scene)),
    belt: src(MB.CreateCylinder("crowd-belt", { height: 0.06, diameter: 0.33, tessellation: 9 }, scene)),
    sash: src(MB.CreateBox("crowd-sash", { width: 0.07, height: 0.62, depth: 0.36 }, scene)),
    upperArm: src(limb(scene, "crowd-upperArm", 0.3, 0.1, 0.085)),
    foreArm: src(limb(scene, "crowd-foreArm", 0.27, 0.08, 0.065)),
    hand: src(MB.CreateSphere("crowd-hand", { diameter: 0.09, segments: 4 }, scene)),
    thigh: src(limb(scene, "crowd-thigh", 0.44, 0.15, 0.1)),
    calf: src(limb(scene, "crowd-calf", 0.4, 0.1, 0.065)),
    boot: src(limb(scene, "crowd-boot", 0.2, 0.09, 0.1)),
    head: src(animeHead(MB.CreateSphere("crowd-head", { diameter: 0.4, segments: 8, updatable: true }, scene), 0.2)),
    eye: src(MB.CreateSphere("crowd-eye", { diameter: 0.07, segments: 4 }, scene)),
    cap: src(MB.CreateSphere("crowd-hair", { diameter: 0.44, segments: 7, slice: 0.55 }, scene)),
    fringe: src(MB.CreateBox("crowd-fringe", { width: 0.3, height: 0.07, depth: 0.09 }, scene)),
    longHair: src(MB.CreateCapsule("crowd-longHair", { height: 0.5, radius: 0.15, tessellation: 7 }, scene)),
    beard: src(MB.CreateSphere("crowd-beard", { diameter: 0.26, segments: 5 }, scene)),
  };
  const pick = (a) => a[Math.floor(rng() * a.length)];
  const col = (hex, k = 1) => { const c = BB.Color3.FromHexString(hex); return new BB.Color4(c.r * k, c.g * k, c.b * k, 1); };
  const inst = (s, c) => { const m = s.createInstance(`${s.name}-i`); m.parent = K.root; m.isPickable = false; m.metadata = { noGlow: true }; m.instancedBuffers.color = c; return m; };

  const n = mobile ? Math.round(count * 0.6) : count;
  const people = [];
  const total = n + chatters.length * 2;
  for (let i = 0; i < total; i++) {
    const chat = i >= n ? chatters[Math.floor((i - n) / 2)] : null;
    const kind = ARCHETYPES[Math.floor(rng() * ARCHETYPES.length)];
    const child = kind === "child", elder = kind === "robe" && rng() < 0.7;
    const H = child ? 0.62 + rng() * 0.08 : 0.9 + rng() * 0.18;               // overall height
    const W = child ? 0.9 : kind === "laborer" ? 1.05 + rng() * 0.2 : 0.85 + rng() * 0.25; // build
    const top = col(kind === "dress" ? pick(DRESS) : kind === "robe" ? pick(ROBE) : kind === "laborer" ? pick(LEATHER) : pick(TUNIC), 0.92 + rng() * 0.12);
    const skin = col(pick(SKIN)), hairC = col(elder ? "#e4e4e8" : pick(HAIR));
    const legs = col(child ? "#7a6a4a" : pick(TROUSERS)), boots = col(pick(BOOTS));
    const shortSleeves = kind === "laborer" || child || (kind === "villager" && rng() < 0.35);
    const longHem = kind === "dress" || kind === "robe";
    const femme = kind === "dress" || (kind !== "laborer" && rng() < 0.35);
    const hairStyle = femme ? (rng() < 0.6 ? "long" : "bob") : "short";
    const p = {
      path: chat ? null : paths[i % paths.length], chat, t: rng() * 100, speed: (child ? 1.3 : elder ? 0.5 : 0.7) + rng() * 0.5,
      side: (rng() - 0.5) * 2.2, H, W, stoop: elder ? 0.16 : 0, bounce: child ? 1.6 : 1, phase: rng(), gesture: rng() * 10,
      torso: inst(S.torso, top), hem: inst(longHem ? S.hemLong : S.hemShort, top), longHem, belt: inst(S.belt, col(kind === "robe" ? "#c9a24a" : pick(BELTS))),
      sash: kind === "robe" || (kind === "villager" && rng() < 0.2) ? inst(S.sash, col("#e6c040")) : null,
      upper: [inst(S.upperArm, top), inst(S.upperArm, top)], fore: [inst(S.foreArm, shortSleeves ? skin : top), inst(S.foreArm, shortSleeves ? skin : top)],
      hands: [inst(S.hand, skin), inst(S.hand, skin)],
      thighs: [inst(S.thigh, legs), inst(S.thigh, legs)], calves: [inst(S.calf, child ? skin : legs), inst(S.calf, child ? skin : legs)],
      boots: [inst(S.boot, boots), inst(S.boot, boots)],
      head: inst(S.head, skin), eyes: [inst(S.eye, col("#1a1c26")), inst(S.eye, col("#1a1c26"))],
      cap: inst(S.cap, hairC), fringe: hairStyle !== "long" || rng() < 0.6 ? inst(S.fringe, hairC) : null,
      long: hairStyle === "long" ? inst(S.longHair, hairC) : null, bob: hairStyle === "bob",
      beard: !femme && !child && rng() < 0.4 ? inst(S.beard, hairC) : null, x: 0, z: 0, yaw: 0,
    };
    if (chat) { const s = (i - n) % 2 ? 1 : -1; p.x = chat[0] + Math.sin(chat[2]) * 0.55 * s; p.z = chat[1] + Math.cos(chat[2]) * 0.55 * s; p.yaw = chat[2] + (s > 0 ? Math.PI : 0); }
    people.push(p);
  }

  const parts = (p) => [p.torso, p.hem, p.belt, p.sash, ...p.upper, ...p.fore, ...p.hands, ...p.thighs, ...p.calves, ...p.boots, p.head, ...p.eyes, p.cap, p.fringe, p.long, p.beard].filter(Boolean);
  return {
    people,
    /** @param {{ density?: number, hurry?: number }} mood 0–1 share of the crowd out and about; walking speed factor */
    update(dt, mood = {}) {
      const density = mood.density ?? 1, hurry = mood.hurry ?? 1;
      for (const [i, p] of people.entries()) {
        const on = i / people.length < density;
        if (on !== p.on) { p.on = on; for (const m of parts(p)) m.setEnabled(on); }
        if (!on) continue;
        let moving = 0;
        if (p.path) {
          p.t += dt * p.speed * hurry; moving = p.speed * hurry;
          if (p.path.r) {
            const a = (p.t / p.path.r) * p.path.dir;
            p.x = p.path.cx + Math.sin(a) * (p.path.r + p.side * 0.4); p.z = p.path.cz + Math.cos(a) * (p.path.r + p.side * 0.4);
            p.yaw = a + (p.path.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
          } else {
            const [[x0, z0], [x1, z1]] = p.path.line, len = Math.hypot(x1 - x0, z1 - z0);
            const u = (p.t % (len * 2)) / len, k = u < 1 ? u : 2 - u;
            const nx = -(z1 - z0) / len, nz = (x1 - x0) / len;
            p.x = x0 + (x1 - x0) * k + nx * p.side; p.z = z0 + (z1 - z0) * k + nz * p.side;
            p.yaw = Math.atan2(x1 - x0, z1 - z0) + (u < 1 ? 0 : Math.PI);
          }
        } else p.t += dt;
        // A stride in step with the ground covered: thighs swing, knees bend on the way through, arms counter-swing.
        p.phase += (moving * dt) / (1.1 * p.H);
        const ph = p.phase * Math.PI * 2, s = Math.sin(ph), swing = moving ? 0.45 : 0;
        const bob = moving ? Math.abs(Math.cos(ph)) * 0.035 * p.bounce : 0;
        const H = p.H, W = p.W, cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
        const at = (lx, y, lz) => [p.x + lx * cy + lz * sy, y, p.z - lx * sy + lz * cy];
        // A limb segment's end: from (lx, y, lz), length L, swung by rx (rotation about the shoulder/hip axis).
        const end = (lx, y, lz, L, rx) => [lx, y - L * Math.cos(rx), lz - L * Math.sin(rx)];
        const hipY = 0.92 * H + bob, shoulderY = 1.42 * H + bob;
        p.torso.position.set(...at(0, 1.18 * H + bob, 0)); p.torso.rotation.set(p.stoop, p.yaw, 0); p.torso.scaling.set(W * H, H, W * H * 0.8);
        p.belt.position.set(...at(0, 0.92 * H + bob, 0)); p.belt.rotation.y = p.yaw; p.belt.scaling.set(W * H * 1.04, H, W * H * 0.84);
        p.hem.position.set(...at(0, (p.longHem ? 0.52 : 0.77) * H + bob, 0)); p.hem.rotation.set(0, p.yaw, 0); p.hem.scaling.set(W * H, H, W * H * 0.85);
        if (p.sash) { p.sash.position.set(...at(0, 1.18 * H + bob, 0)); p.sash.rotation.set(0, p.yaw, 0.55); p.sash.scaling.set(H, H, W * H * 0.85); }
        const headY = 1.66 * H + bob, lean = p.stoop * 0.3 * H;
        p.head.position.set(...at(0, headY, lean)); p.head.rotation.set(0, p.yaw, 0); p.head.scaling.setAll(H);
        p.eyes.forEach((e, j) => { e.position.set(...at((j ? 0.075 : -0.075) * H, headY + 0.015 * H, lean + 0.18 * H)); e.scaling.set(H * 0.85, H * 1.45, H * 0.8); });
        p.cap.position.set(...at(0, headY + 0.04 * H, lean - 0.04 * H)); p.cap.rotation.set(0, p.yaw, 0); p.cap.scaling.set(H * (p.bob ? 1.12 : 1), H * (p.bob ? 1.15 : 1), H);
        if (p.fringe) { p.fringe.position.set(...at(0, headY + 0.15 * H, lean + 0.12 * H)); p.fringe.rotation.set(0.6, p.yaw, 0); p.fringe.scaling.setAll(H); }
        if (p.long) { p.long.position.set(...at(0, headY - 0.2 * H, lean - 0.14 * H)); p.long.rotation.set(0.1, p.yaw, 0); p.long.scaling.set(H * 1.15, H, H * 0.55); }
        if (p.beard) { p.beard.position.set(...at(0, headY - 0.12 * H, lean + 0.1 * H)); p.beard.rotation.y = p.yaw; p.beard.scaling.set(H, H * 0.7, H * 0.7); }
        for (let j = 0; j < 2; j++) {
          const sd = j ? 1 : -1, legRx = sd * s * swing, knee = moving ? Math.max(0, -sd * Math.cos(ph)) * 0.7 : 0;
          const hx = sd * 0.09 * W * H;
          p.thighs[j].position.set(...at(hx, hipY, 0)); p.thighs[j].rotation.set(legRx, p.yaw, 0); p.thighs[j].scaling.set(W * H, H, W * H);
          const [kx, ky, kz] = end(hx, hipY, 0, 0.44 * H, legRx);
          p.calves[j].position.set(...at(kx, ky, kz)); p.calves[j].rotation.set(legRx - knee, p.yaw, 0); p.calves[j].scaling.set(W * H, H, W * H);
          const [ax, ay, az] = end(kx, ky, kz, 0.4 * H, legRx - knee);
          p.boots[j].position.set(...at(ax, Math.max(ay, 0.2 * H) + 0.06 * H, az)); p.boots[j].rotation.set(0, p.yaw, 0); p.boots[j].scaling.set(W * H, H * 0.7, W * H * 1.3);
          // Talkers gesture now and then with one hand; walkers swing their arms against their legs.
          const talk = p.chat && j && Math.sin(p.gesture + p.t * 1.7) > 0.5 ? -0.9 : 0;
          const armRx = -sd * s * swing * 0.8 + talk, ex = sd * 0.21 * W * H;
          p.upper[j].position.set(...at(ex, shoulderY, 0)); p.upper[j].rotation.set(armRx, p.yaw, sd * 0.08); p.upper[j].scaling.setAll(H);
          const [elx, ely, elz] = end(ex, shoulderY, 0, 0.3 * H, armRx), bend = armRx - 0.25 - (talk ? 0.6 : 0);
          p.fore[j].position.set(...at(elx, ely, elz)); p.fore[j].rotation.set(bend, p.yaw, sd * 0.06); p.fore[j].scaling.setAll(H);
          const [hx2, hy2, hz2] = end(elx, ely, elz, 0.29 * H, bend);
          p.hands[j].position.set(...at(hx2, hy2, hz2)); p.hands[j].scaling.setAll(H);
        }
      }
    },
  };
}
