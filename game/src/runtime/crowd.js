// Background townsfolk (GDD §29.9): cheap instanced figures with legs and arms that walk with a real
// stride, varied in height, build, clothes, skin, hair and pace, so no two look like copies. A few
// stand in pairs, talking. All of them together cost about seven draw calls: one per body part,
// colored per figure. Weather and night thin the crowd out (density), and rain hurries them along.

import { B } from "./look.js";

const SKIN = ["#f0d0b2", "#e2b894", "#c88a64", "#8a5a3a", "#f3dcc8"];
const HAIR = ["#2a1e18", "#5a3a22", "#a0602a", "#e0c070", "#d8d4c8", "#1d1f2a"];
const CLOTH = ["#8a3a2a", "#3a5a8a", "#5a7a3a", "#7a5a8a", "#c08a3a", "#4a6a7a", "#d8d2c4", "#6a4a32", "#9a4a5a", "#3a4a3a"];
const LEGS = ["#3a3430", "#4a4a5a", "#5a4a3a", "#2a2f3a", "#6a6a4a"];

/** A mesh whose pivot sits at its top, so it can swing like a limb. */
function limb(scene, name, h, d0, d1) {
  const BB = B();
  const m = BB.MeshBuilder.CreateCylinder(name, { height: h, diameterTop: d0, diameterBottom: d1, tessellation: 6 }, scene);
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
  mat.specularColor = BB.Color3.Black(); mat.emissiveColor = new BB.Color3(0.12, 0.12, 0.14);
  const src = (m) => { m.material = mat; m.parent = K.root; m.isPickable = false; m.registerInstancedBuffer("color", 4); m.instancedBuffers.color = new BB.Color4(1, 1, 1, 1); m.setEnabled(false); return m; };
  const torso = src(MB.CreateCylinder("crowd-torso", { height: 0.62, diameterTop: 0.34, diameterBottom: 0.4, tessellation: 8 }, scene));
  const dress = src(MB.CreateCylinder("crowd-dress", { height: 0.66, diameterTop: 0.38, diameterBottom: 0.64, tessellation: 8 }, scene));
  const eye = src(MB.CreateSphere("crowd-eye", { diameter: 0.06, segments: 4 }, scene));
  const head = src(MB.CreateSphere("crowd-head", { diameter: 0.4, segments: 6 }, scene));
  const capHair = src(MB.CreateSphere("crowd-hair", { diameter: 0.43, segments: 6, slice: 0.55 }, scene));
  const longHair = src(MB.CreateCapsule("crowd-longHair", { height: 0.5, radius: 0.15, tessellation: 6 }, scene));
  const leg = src(limb(scene, "crowd-leg", 0.86, 0.11, 0.07));
  const arm = src(limb(scene, "crowd-arm", 0.56, 0.08, 0.06));
  const pick = (a) => a[Math.floor(rng() * a.length)];
  const col = (hex, k = 1) => { const c = BB.Color3.FromHexString(hex); return new BB.Color4(c.r * k, c.g * k, c.b * k, 1); };
  const inst = (s, c) => { const m = s.createInstance(`${s.name}-i`); m.parent = K.root; m.isPickable = false; m.instancedBuffers.color = c; return m; };

  const n = mobile ? Math.round(count * 0.6) : count;
  const people = [];
  const total = n + chatters.length * 2;
  for (let i = 0; i < total; i++) {
    const chat = i >= n ? chatters[Math.floor((i - n) / 2)] : null;
    const kind = rng() < 0.12 ? "child" : rng() < 0.18 ? "elder" : "adult";
    const h = kind === "child" ? 0.62 + rng() * 0.1 : 0.88 + rng() * 0.2;         // overall height
    const w = kind === "child" ? 0.9 : 0.82 + rng() * 0.4;                            // build
    const cloth = col(pick(CLOTH), 0.85 + rng() * 0.3), trousers = col(pick(LEGS)), skin = col(pick(SKIN)), hair = col(kind === "elder" ? "#d8d4c8" : pick(HAIR));
    const dressed = kind !== "child" && rng() < 0.4;
    const p = {
      path: chat ? null : paths[i % paths.length], chat, t: rng() * 100, speed: (kind === "child" ? 1.3 : kind === "elder" ? 0.5 : 0.7) + rng() * 0.5,
      side: (rng() - 0.5) * 2.2, h, w, stoop: kind === "elder" ? 0.18 : 0, bounce: kind === "child" ? 1.6 : 1, phase: rng(), gesture: rng() * 10,
      body: inst(torso, cloth), skirt: dressed ? inst(dress, cloth) : null, head: inst(head, skin), hair: inst(rng() < 0.4 ? longHair : capHair, hair),
      eyes: [inst(eye, col("#1a1c26")), inst(eye, col("#1a1c26"))],
      legs: [inst(leg, trousers), inst(leg, trousers)], arms: [inst(arm, cloth), inst(arm, cloth)], dressed, x: 0, z: 0, yaw: 0,
    };
    if (chat) { const s = (i - n) % 2 ? 1 : -1; p.x = chat[0] + Math.sin(chat[2]) * 0.55 * s; p.z = chat[1] + Math.cos(chat[2]) * 0.55 * s; p.yaw = chat[2] + (s > 0 ? Math.PI : 0); }
    people.push(p);
  }

  const parts = (p) => [p.body, p.head, p.hair, ...p.legs, ...p.arms, ...p.eyes, ...(p.skirt ? [p.skirt] : [])];
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
        }
        // A stride in step with the ground covered: legs swing, arms counter-swing, the body bobs.
        p.phase += (moving * dt) / (1.1 * p.h);
        const s = Math.sin(p.phase * Math.PI * 2), swing = moving ? 0.5 : 0;
        const bob = moving ? Math.abs(Math.cos(p.phase * Math.PI * 2)) * 0.04 * p.bounce : 0;
        const H = p.h, cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
        const at = (lx, y, lz) => [p.x + lx * cy + lz * sy, y, p.z - lx * sy + lz * cy];
        const hipY = 0.88 * H + bob;
        p.body.position.set(...at(0, 1.18 * H + bob, 0)); p.body.rotation.set(p.stoop, p.yaw, 0); p.body.scaling.set(p.w * H, H, p.w * H * 0.8);
        if (p.skirt) { p.skirt.position.set(...at(0, 0.6 * H + bob, 0)); p.skirt.rotation.y = p.yaw; p.skirt.scaling.set(p.w * H, H, p.w * H * 0.85); }
        p.eyes.forEach((e, j) => { e.position.set(...at((j ? 0.07 : -0.07) * H, 1.67 * H + bob, (0.18 + p.stoop * 0.3) * H)); e.scaling.set(H, H * 1.4, H); });
        p.head.position.set(...at(0, 1.66 * H + bob, p.stoop * 0.3)); p.head.rotation.y = p.yaw; p.head.scaling.setAll(H);
        p.hair.position.set(...at(0, 1.71 * H + bob, -0.03 + p.stoop * 0.3)); p.hair.rotation.y = p.yaw; p.hair.scaling.setAll(H);
        p.legs.forEach((l, j) => { const sd = j ? 1 : -1; l.position.set(...at(sd * 0.1 * p.w * H, hipY, 0)); l.rotation.set(sd * s * swing, p.yaw, 0); l.scaling.set(p.w * H, H, p.w * H); });
        // Talkers gesture now and then; walkers swing their arms.
        const talk = p.chat ? (Math.sin(p.gesture + (p.t += dt) * 1.7) > 0.5 ? -0.9 : 0) : 0;
        p.arms.forEach((a, j) => { const sd = j ? 1 : -1; a.position.set(...at(sd * 0.21 * p.w * H, 1.43 * H + bob, 0)); a.rotation.set(-sd * s * swing * 0.8 + (j ? talk : 0), p.yaw, sd * 0.08); a.scaling.setAll(H); });
      }
    },
  };
}
