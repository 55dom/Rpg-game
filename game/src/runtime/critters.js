// Animals (GDD §29.11): chickens, sheep, cows, dogs, cats, pigeons, crows, a horse. Each species is one
// vertex-colored model drawn as instances (one draw call for the whole flock), wandering a pen or patch,
// stopping to peck or graze. Birds take off when the player comes close and settle again later.

import { B } from "./look.js";

const SPECIES = {
  chicken: { speed: 0.7, peck: true, parts: [["sphere", [0.32, 0.28, 0.4], [0, 0.32, 0], "#f2ede0"], ["sphere", [0.18, 0.2, 0.18], [0, 0.52, 0.18], "#f2ede0"],
    ["box", [0.05, 0.05, 0.08], [0, 0.5, 0.29], "#e6a83a"], ["box", [0.04, 0.08, 0.05], [0, 0.62, 0.17], "#c0403a"], ["box", [0.03, 0.18, 0.03], [0.07, 0.09, 0], "#e6a83a"], ["box", [0.03, 0.18, 0.03], [-0.07, 0.09, 0], "#e6a83a"]] },
  sheep: { speed: 0.4, peck: true, parts: [["sphere", [0.8, 0.6, 1.0], [0, 0.75, 0], "#ece6d8"], ["sphere", [0.3, 0.32, 0.36], [0, 0.85, 0.55], "#3a3430"],
    ...[[0.2, 0.3], [-0.2, 0.3], [0.2, -0.3], [-0.2, -0.3]].map(([x, z]) => ["box", [0.08, 0.5, 0.08], [x, 0.25, z], "#3a3430"])] },
  cow: { speed: 0.35, peck: true, parts: [["box", [0.8, 0.75, 1.6], [0, 1.05, 0], "#8a5a3a"], ["box", [0.82, 0.3, 0.6], [0, 1.15, 0.2], "#ece6d8"], ["box", [0.42, 0.42, 0.5], [0, 1.2, 1.0], "#8a5a3a"],
    ["box", [0.3, 0.2, 0.12], [0, 1.08, 1.27], "#d8a0a0"], ...[[0.28, 0.6], [-0.28, 0.6], [0.28, -0.6], [-0.28, -0.6]].map(([x, z]) => ["box", [0.14, 0.7, 0.14], [x, 0.35, z], "#5a3a2a"])] },
  dog: { speed: 1.4, peck: false, parts: [["box", [0.3, 0.3, 0.7], [0, 0.45, 0], "#8a6a4a"], ["box", [0.26, 0.26, 0.3], [0, 0.66, 0.42], "#8a6a4a"], ["box", [0.14, 0.12, 0.16], [0, 0.6, 0.6], "#5a4232"],
    ["box", [0.06, 0.12, 0.06], [0.09, 0.84, 0.38], "#5a4232"], ["box", [0.06, 0.12, 0.06], [-0.09, 0.84, 0.38], "#5a4232"], ["box", [0.05, 0.05, 0.3], [0, 0.6, -0.45], "#8a6a4a"],
    ...[[0.1, 0.25], [-0.1, 0.25], [0.1, -0.25], [-0.1, -0.25]].map(([x, z]) => ["box", [0.07, 0.32, 0.07], [x, 0.16, z], "#8a6a4a"])] },
  cat: { speed: 0.8, peck: false, parts: [["sphere", [0.22, 0.24, 0.45], [0, 0.22, 0], "#3a3430"], ["sphere", [0.2, 0.2, 0.2], [0, 0.36, 0.22], "#3a3430"], ["box", [0.04, 0.08, 0.04], [0.06, 0.48, 0.22], "#3a3430"],
    ["box", [0.04, 0.08, 0.04], [-0.06, 0.48, 0.22], "#3a3430"], ["box", [0.03, 0.03, 0.35], [0, 0.32, -0.32], "#3a3430"]] },
  pigeon: { speed: 0.5, peck: true, bird: true, parts: [["sphere", [0.18, 0.18, 0.28], [0, 0.14, 0], "#8a8e9a"], ["sphere", [0.11, 0.11, 0.11], [0, 0.26, 0.11], "#6a7080"], ["box", [0.03, 0.03, 0.05], [0, 0.25, 0.18], "#3a3430"]] },
  crow: { speed: 0.5, peck: true, bird: true, parts: [["sphere", [0.2, 0.2, 0.32], [0, 0.15, 0], "#1d1f2a"], ["sphere", [0.12, 0.12, 0.12], [0, 0.28, 0.12], "#1d1f2a"], ["box", [0.03, 0.03, 0.09], [0, 0.27, 0.21], "#3a3430"]] },
  horse: { speed: 0, peck: true, parts: [["box", [0.6, 0.7, 1.7], [0, 1.35, 0], "#5a3a2a"], ["box", [0.3, 0.8, 0.35], [0, 1.85, 0.85], "#5a3a2a"], ["box", [0.28, 0.3, 0.6], [0, 2.15, 1.15], "#5a3a2a"],
    ["box", [0.08, 0.6, 0.4], [0, 2.05, 0.75], "#1d1a18"], ["box", [0.1, 0.7, 0.1], [0, 1.15, -0.95], "#1d1a18"], ...[[0.2, 0.65], [-0.2, 0.65], [0.2, -0.65], [-0.2, -0.65]].map(([x, z]) => ["box", [0.14, 1.0, 0.14], [x, 0.5, z], "#4a3022"])] },
};

function model(scene, name, parts) {
  const BB = B(), MB = BB.MeshBuilder, meshes = [];
  for (const [shape, [w, h, d], [x, y, z], hex] of parts) {
    const m = shape === "sphere" ? MB.CreateSphere(name, { diameter: 1, segments: 6 }, scene) : MB.CreateBox(name, { size: 1 }, scene);
    m.scaling.set(w, h, d); m.position.set(x, y, z);
    const c = BB.Color3.FromHexString(hex), n = m.getTotalVertices(), cols = [];
    for (let i = 0; i < n; i++) cols.push(c.r, c.g, c.b, 1);
    m.setVerticesData(BB.VertexBuffer.ColorKind, cols);
    meshes.push(m);
  }
  const out = BB.Mesh.MergeMeshes(meshes, true, true);
  out.name = name;
  return out;
}

/**
 * @param K set kit · @param list [{ kind, n, area: { x, z, r } | { rect: [x0, z0, x1, z1] } }]
 * @returns {{ update(dt, ctx: { player?: {x,z} }) }}
 */
export function buildCritters(scene, K, list, rng) {
  const BB = B();
  const mat = new BB.StandardMaterial(`critter-mat-${Math.floor(rng() * 1e6)}`, scene);
  mat.specularColor = BB.Color3.Black(); mat.emissiveColor = new BB.Color3(0.1, 0.1, 0.1);
  const herd = [];
  for (const { kind, n, area, still } of list) {
    const S = SPECIES[kind];
    const src = model(scene, `critter-${kind}`, S.parts);
    src.material = mat; src.parent = K.root; src.isPickable = false;
    src.renderOutline = true; src.outlineWidth = 0.02; src.outlineColor = BB.Color3.FromHexString("#1a1c26");
    src.setEnabled(false);
    const pickPoint = () => {
      if (area.rect) { const [x0, z0, x1, z1] = area.rect; return { x: x0 + rng() * (x1 - x0), z: z0 + rng() * (z1 - z0) }; }
      const a = rng() * Math.PI * 2, r = area.r * Math.sqrt(rng()); return { x: area.x + Math.sin(a) * r, z: area.z + Math.cos(a) * r };
    };
    for (let i = 0; i < n; i++) {
      const m = src.createInstance(`${kind}-${i}`); m.parent = K.root; m.isPickable = false;
      const p = pickPoint(), s = 0.85 + rng() * 0.3;
      m.scaling.setAll(s);
      herd.push({ kind, S, m, x: p.x, z: p.z, y: 0, yaw: rng() * 6.28, to: null, wait: rng() * 4, t: rng() * 10, pick: pickPoint, still, fly: 0 });
    }
  }
  return {
    update(dt, { player } = {}) {
      for (const a of herd) {
        a.t += dt;
        // Birds take off when someone walks up, circle off, and come back down a while later.
        if (a.S.bird) {
          const near = player && Math.hypot(player.x - a.x, player.z - a.z) < 3.2;
          if (near && a.fly <= 0) { a.fly = 6 + rng() * 4; a.flyDir = rng() * 6.28; }
          if (a.fly > 0) {
            a.fly -= dt;
            const up = a.fly > 3 ? 1 : -1;
            a.y = Math.max(0, a.y + up * dt * 3);
            a.x += Math.sin(a.flyDir) * dt * 3; a.z += Math.cos(a.flyDir) * dt * 3; a.yaw = a.flyDir;
            if (a.fly <= 0) { const p = a.pick(); a.x = p.x; a.z = p.z; a.y = 0; }
            a.m.position.set(a.x, a.y + Math.sin(a.t * 30) * 0.05 * (a.y > 0 ? 1 : 0), a.z); a.m.rotation.set(0, a.yaw, 0);
            a.m.setEnabled(a.y < 9);
            continue;
          }
        }
        if (!a.still && a.S.speed) {
          if (!a.to) { a.wait -= dt; if (a.wait <= 0) a.to = a.pick(); }
          else {
            const dx = a.to.x - a.x, dz = a.to.z - a.z, d = Math.hypot(dx, dz);
            if (d < 0.15) { a.to = null; a.wait = 2 + rng() * 5; }
            else { const st = Math.min(d, a.S.speed * dt); a.x += (dx / d) * st; a.z += (dz / d) * st; a.yaw += (Math.atan2(dx, dz) - a.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI; a.yaw = Math.atan2(dx, dz); }
          }
        }
        // Pecking and grazing: a dip of the whole body while standing; a little bob while walking.
        const moving = !!a.to;
        const dip = !moving && a.S.peck ? Math.max(0, Math.sin(a.t * (a.kind === "chicken" || a.S.bird ? 5 : 0.8))) * (a.kind === "chicken" || a.S.bird ? 0.5 : 0.15) : 0;
        const bob = moving ? Math.abs(Math.sin(a.t * 10)) * 0.04 : 0;
        a.m.position.set(a.x, bob, a.z);
        a.m.rotation.set(dip, a.yaw, 0);
        if (a.kind === "dog" && !moving && a.wait > 4) a.m.rotation.x = -0.1; // lying about
      }
    },
  };
}
