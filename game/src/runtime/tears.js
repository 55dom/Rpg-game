// Tears in the air: jagged seams cut in the world, never round (GDD §15.3, §15.6).
//   "pale":  the Pale Choir's rifts (Wraithe). Milky white-violet, soft light.
//   "black": ink-black, with a thin edge of cold light.
// Nothing built here may be a smooth circle: a perfect black circle is reserved for something else
// (docs/BACKLASH.md §19), so every outline is a ragged star with deep notches.

import { B, glow } from "./look.js";

/** A ragged outline: `n` points alternating deep notches and sharp tips, seeded so a tear keeps its shape. */
export function tearOutline(r, n = 13, seed = 1, stretch = [1.3, 0.72]) {
  let s = (seed * 2654435761) >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
    const k = i % 2 ? 0.42 + rnd() * 0.22 : 0.82 + rnd() * 0.18;
    pts.push([Math.cos(a) * r * k * stretch[0], Math.sin(a) * r * k * stretch[1]]);
  }
  return pts;
}

/** A flat fan mesh in the XY plane. Rotate x by π/2 to lay it on the ground. */
export function tearMesh(scene, name, pts) {
  const BB = B();
  const positions = [0, 0, 0], indices = [];
  for (const [x, y] of pts) positions.push(x, y, 0);
  for (let i = 1; i <= pts.length; i++) indices.push(0, i, i === pts.length ? 1 : i + 1);
  const normals = [];
  BB.VertexData.ComputeNormals(positions, indices, normals);
  const vd = new BB.VertexData();
  vd.positions = positions; vd.indices = indices; vd.normals = normals;
  const m = new BB.Mesh(name, scene);
  vd.applyToMesh(m);
  m.isPickable = false;
  m.metadata = { noGlow: true };
  return m;
}

const MATS = new WeakMap();
/** Shared materials per scene (tears open often; they shouldn't each make their own). */
export function tearMaterials(scene) {
  let m = MATS.get(scene);
  if (m) return m;
  const BB = B();
  const hole = new BB.StandardMaterial("tear-blackHole", scene);
  hole.disableLighting = true; hole.emissiveColor = BB.Color3.Black(); hole.diffuseColor = BB.Color3.Black();
  hole.specularColor = BB.Color3.Black(); hole.backFaceCulling = false; hole.fogEnabled = false;
  m = {
    pale: { edge: glow(scene, "tear-paleEdge", "#f6f2ff", 0.95, true), hole: glow(scene, "tear-paleHole", "#c4bce6", 0.6) },
    black: { edge: glow(scene, "tear-coldEdge", "#9cb8ff", 0.9, true), hole },
    // The Gate (Eps 46–48): red at the edges, and through it a darker red, not black.
    gate: { edge: glow(scene, "tear-gateEdge", "#ff6a3a", 0.95, true), hole: glow(scene, "tear-gateHole", "#3a0a08") },
  };
  // The hole always draws over its own edge, from either side (a depth bias, not a nudge in space).
  m.pale.hole.zOffset = -4; hole.zOffset = -4; m.gate.hole.zOffset = -4; m.gate.hole.backFaceCulling = false; m.gate.hole.fogEnabled = false; m.gate.edge.fogEnabled = false;
  MATS.set(scene, m);
  return m;
}

/**
 * One tear: a hole and a slightly larger edge of light behind it, under one node.
 * ground: lie flat on the floor (else stand upright, facing +z before `yaw`).
 */
export function makeTear(scene, name, { r = 1.5, kind = "pale", seed = 1, ground = true, stretch } = {}) {
  const BB = B(), mats = tearMaterials(scene)[kind] ?? tearMaterials(scene).pale;
  const node = new BB.TransformNode(name, scene);
  const edge = tearMesh(scene, `${name}-edge`, tearOutline(r * 1.14, 13, seed, stretch));
  const hole = tearMesh(scene, `${name}-hole`, tearOutline(r, 13, seed, stretch));
  edge.material = mats.edge; hole.material = mats.hole;
  edge.parent = node; hole.parent = node;
  if (ground) { edge.rotation.x = hole.rotation.x = Math.PI / 2; hole.position.y = 0.012; }
  return node;
}

/**
 * A golden door frame (his doors, before they went black): four bars of gold light and a pane of light inside, centred
 * on the node. ground: lying flat on the floor (the Drop opens under you).
 */
const VOID_MATS = new WeakMap();
/**
 * The void (Ep 49): a perfect black circle. Not a portal, not a tear: no edge, no glow, a hole punched through the
 * world. Unlit and unfogged, so nothing in the scene can make it anything but black.
 */
export function makeVoid(scene, name, { r = 1.2 } = {}) {
  const BB = B();
  let m = VOID_MATS.get(scene);
  if (!m) {
    m = new BB.StandardMaterial("void-black", scene);
    m.diffuseColor = BB.Color3.Black(); m.specularColor = BB.Color3.Black(); m.emissiveColor = BB.Color3.Black();
    m.disableLighting = true; m.fogEnabled = false; m.backFaceCulling = false;
    VOID_MATS.set(scene, m);
  }
  const node = new BB.TransformNode(name, scene);
  const disc = BB.MeshBuilder.CreateDisc(`${name}-disc`, { radius: r, tessellation: 64 }, scene);
  disc.parent = node; disc.material = m; disc.isPickable = false;
  scene.effectLayers?.find((l) => l.name === "glow")?.addExcludedMesh(disc);
  return node;
}

export function makeDoor(scene, name, { w = 1.4, h = 2.5, ground = false } = {}) {
  const BB = B(), MB = BB.MeshBuilder;
  let m = DOOR_MATS.get(scene);
  if (!m) { m = { frame: glow(scene, "door-frame", "#ffd36a"), pane: glow(scene, "door-pane", "#fff3d0", 0.35, true) }; DOOR_MATS.set(scene, m); }
  const node = new BB.TransformNode(name, scene), t = 0.12;
  for (const [bw, bh, x, y] of [[t, h + t, -w / 2, 0], [t, h + t, w / 2, 0], [w + t, t, 0, h / 2], [w + t, t, 0, -h / 2]]) {
    const b = MB.CreateBox(`${name}-bar`, { width: bw, height: bh, depth: 0.08 }, scene); b.parent = node; b.position.set(x, y, 0); b.material = m.frame; b.isPickable = false;
  }
  const pane = MB.CreatePlane(`${name}-pane`, { width: w, height: h, sideOrientation: BB.Mesh.DOUBLESIDE }, scene); pane.parent = node; pane.material = m.pane; pane.isPickable = false;
  if (ground) { const inner = new BB.TransformNode(`${name}-flat`, scene); for (const c of node.getChildren()) c.parent = inner; inner.parent = node; inner.rotation.x = Math.PI / 2; }
  return node;
}
const DOOR_MATS = new Map();

/** Tears that open, hang for a moment and seal (fights). Call update(dt) every frame. */
export class TearFx {
  constructor(scene) { this.scene = scene; this.live = []; this.n = 0; }

  /** at {x, y, z}; life in seconds; grow: seconds to open. Returns the node (so it can be closed early). */
  open(at, { r = 1, kind = "pale", life = 0.7, grow = 0.12, ground = false, yaw = 0, seed } = {}) {
    const node = kind === "gold" ? makeDoor(this.scene, `door-${++this.n}`, { w: r * 1.6, h: r * 2.8, ground }) // a golden door, not a tear
      : kind === "void" ? makeVoid(this.scene, `void-${++this.n}`, { r })
      : makeTear(this.scene, `tear-${++this.n}`, { r, kind, seed: seed ?? this.n, ground });
    node.position.set(at.x, at.y ?? 0, at.z);
    if (!ground) node.rotation.y = yaw;
    node.scaling.setAll(0.01);
    this.live.push({ node, t: 0, life, grow });
    return node;
  }

  /** Seal a tear now (it still closes over a short beat rather than blinking out). */
  close(node) { const it = this.live.find((x) => x.node === node); if (it) it.life = Math.min(it.life, it.t + 0.18); }

  update(dt) {
    for (const it of this.live) {
      it.t += dt;
      const open = Math.min(1, it.t / Math.max(1e-3, it.grow)), shut = Math.min(1, Math.max(0, (it.life - it.t) / 0.18));
      const k = Math.min(open, shut);
      it.node.scaling.set(k, k, k);
      if (it.t >= it.life) it.node.dispose(false, false);
    }
    this.live = this.live.filter((it) => it.t < it.life);
  }

  clear() { for (const it of this.live) it.node.dispose(false, false); this.live = []; }
}
