// Set dressing (GDD §29.11): the things that make a place look lived in. Each builder places one prop
// built from primitives in the cel-shaded style; static props are merged into the set's scenery by
// kit.bake, so a street full of crates and barrels costs a handful of draw calls.

import { B, toon, glow } from "./look.js";

/** Material cache per set: same color, same material, so props merge. */
export function palette(scene, prefix) {
  const cache = new Map();
  return (hex) => { if (!cache.has(hex)) cache.set(hex, toon(scene, `${prefix}-p${cache.size}`, hex)); return cache.get(hex); };
}

/**
 * Prop builders. Every one takes (K, P, x, z, opts) where K is the set kit (add, root…) and P the
 * material cache; `parent` in opts puts the prop under a conditional node instead of the set root.
 */
export function props(scene, K, P) {
  const BB = B(), MB = BB.MeshBuilder;
  const put = (mesh, parent, x, y, z, outline = 0.03) => { K.add(mesh, outline); if (parent) mesh.parent = parent; mesh.position.set(x, y, z); return mesh; };
  const box = (name, w, h, d, hex, parent, x, y, z, o) => { const m = put(MB.CreateBox(name, { width: w, height: h, depth: d }, scene), parent, x, y, z, o); m.material = P(hex); return m; };
  const cyl = (name, h, d, hex, parent, x, y, z, o, tess = 10, d2) => { const m = put(MB.CreateCylinder(name, { height: h, diameterTop: d, diameterBottom: d2 ?? d, tessellation: tess }, scene), parent, x, y, z, o); m.material = P(hex); return m; };
  const rot = (m, ry) => { m.rotation.y = ry; return m; };
  /** Rotate (dx, dz) by ry around (x, z). */
  const off = (x, z, ry, dx, dz) => [x + dx * Math.cos(ry) + dz * Math.sin(ry), z - dx * Math.sin(ry) + dz * Math.cos(ry)];

  return {
    barrel(x, z, { ry = 0, parent, tipped = false } = {}) {
      // (No parent–child props: the set merges static meshes, and a merged parent would take its children with it.)
      const b = cyl("barrel", 0.9, 0.62, "#8a5a32", parent, x, tipped ? 0.31 : 0.45, z, 0.025, 12, 0.56);
      if (tipped) { b.rotation.set(Math.PI / 2, ry, 0); return b; }
      for (const y of [0.15, 0.75]) { const h = put(MB.CreateTorus("hoop", { diameter: 0.6, thickness: 0.035, tessellation: 14 }, scene), parent, x, y, z, 0); h.material = P("#3a3430"); }
      return b;
    },
    crate(x, z, { ry = 0, s = 0.8, parent, broken = false } = {}) {
      if (broken) { for (let i = 0; i < 4; i++) rot(box("plank", 0.8, 0.05, 0.14, "#9a6a3a", parent, x + (i - 1.5) * 0.25, 0.03, z + (i % 2) * 0.2, 0.012), ry + i * 0.7); return; }
      const c = rot(box("crate", s, s, s, "#9a6a3a", parent, x, s / 2, z, 0.025), ry);
      for (const dy of [s * 0.2, s * 0.8]) rot(box("slat", s * 1.02, 0.05, s * 1.02, "#6b4a32", parent, x, dy, z, 0), ry);
      return c;
    },
    sack(x, z, { parent } = {}) { const s = put(MB.CreateSphere("sack", { diameter: 0.55, segments: 8 }, scene), parent, x, 0.24, z, 0.02); s.scaling.set(1, 0.9, 0.85); s.material = P("#c9b48a"); return s; },
    woodpile(x, z, { ry = 0, parent } = {}) {
      for (let row = 0; row < 3; row++) for (let i = 0; i < 5 - row; i++) {
        const [px, pz] = off(x, z, ry, (i - (4 - row) / 2) * 0.24, 0);
        const l = cyl("log", 1.3, 0.22, "#7a5232", parent, px, 0.12 + row * 0.2, pz, 0.015, 7); l.rotation.set(Math.PI / 2, ry, 0);
      }
      const axe = box("axeHandle", 0.05, 0.75, 0.05, "#6b4a32", parent, ...off(x, z, ry, 0.9, 0.2).flatMap((v, i) => (i ? [0.4, v] : [v])), 0.012); axe.rotation.z = 0.4;
    },
    hay(x, z, { ry = 0, parent } = {}) { const h = rot(box("hay", 1.1, 0.6, 0.7, "#d9b866", parent, x, 0.3, z, 0.025), ry); return h; },
    /** Laundry on a line between two posts: shirts and sheets, swaying a little. */
    laundry(x0, z0, x1, z1, { parent, colors = ["#e8e2d4", "#8a3a2a", "#3a5a8a", "#d8c8a8"] } = {}) {
      for (const [x, z] of [[x0, z0], [x1, z1]]) cyl("linePost", 2.2, 0.1, "#6b4a32", parent, x, 1.1, z, 0.015, 6);
      const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0);
      const rope = cyl("rope", len, 0.02, "#d9c9a8", parent, (x0 + x1) / 2, 2.1, (z0 + z1) / 2, 0, 4); rope.rotation.set(Math.PI / 2, ry, 0);
      const n = Math.floor(len / 0.8), cloths = [];
      const line = new BB.TransformNode("laundry", scene); line.parent = parent ?? K.root; // not merged: the cloths move
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, w = 0.4 + ((i * 7) % 3) * 0.12;
        const c = put(MB.CreatePlane("cloth", { width: w, height: 0.55 + ((i * 5) % 3) * 0.15, sideOrientation: BB.Mesh.DOUBLESIDE }, scene), null, x0 + (x1 - x0) * t, 1.8, z0 + (z1 - z0) * t, 0);
        c.parent = line; c.rotation.y = ry + Math.PI / 2; c.material = P(colors[i % colors.length]); c.setPivotPoint(new BB.Vector3(0, 0.28, 0));
        cloths.push(c);
      }
      return cloths; // animated: they sway in the wind
    },
    cart(x, z, { ry = 0, parent, broken = false, load = true } = {}) {
      const bed = rot(box("cartBed", 1.4, 0.12, 2.4, "#8a5a32", parent, x, broken ? 0.35 : 0.75, z, 0.025), ry);
      if (broken) bed.rotation.set(0.0, ry, 0.35);
      for (const s of [-1, 1]) { const [sx, sz] = off(x, z, ry, s * 0.66, 0); const side = rot(box("cartSide", 0.08, 0.4, 2.4, "#7a4a2a", parent, sx, (broken ? 0.35 : 0.75) + 0.25 - (broken ? s * 0.22 : 0), sz, 0.015), ry); if (broken) side.rotation.z = 0.35; }
      const wheels = broken ? [[-0.75, -0.6]] : [[-0.75, -0.6], [0.75, -0.6]];
      for (const [dx, dz] of wheels) { const [wx, wz] = off(x, z, ry, dx, dz); const w = cyl("wheel", 0.12, 1.0, "#5a3a22", parent, wx, 0.5, wz, 0.02, 12); w.rotation.set(0, ry, Math.PI / 2); }
      if (broken) { const [wx, wz] = off(x, z, ry, 1.3, 0.4); const w = cyl("wheelOff", 0.12, 1.0, "#5a3a22", parent, wx, 0.07, wz, 0.02, 12); w.rotation.y = ry; }
      const [hx, hz] = off(x, z, ry, 0, 1.7); const shaft = box("cartShaft", 0.08, 0.08, 1.4, "#6b4a32", parent, hx, broken ? 0.1 : 0.6, hz, 0.012); shaft.rotation.y = ry;
      if (load && !broken) for (let i = 0; i < 3; i++) { const [sx, sz] = off(x, z, ry, (i - 1) * 0.4, 0.2 - (i % 2) * 0.5); this.sack(sx, sz, { parent }).position.y = 1.05; }
      return bed;
    },
    /** A hanging shop or tavern sign on a bracket. */
    sign(x, z, { ry = 0, hex = "#c9a24a", parent, h = 2.6 } = {}) {
      const arm = rot(box("signArm", 0.06, 0.06, 0.9, "#3a3430", parent, x, h, z, 0.012), ry);
      const [sx, sz] = off(x, z, ry, 0, 0.35);
      const board = rot(box("signBoard", 0.08, 0.5, 0.65, hex, parent, sx, h - 0.35, sz, 0.02), ry);
      return board;
    },
    bench(x, z, { ry = 0, parent } = {}) {
      rot(box("benchTop", 1.6, 0.08, 0.38, "#7a5232", parent, x, 0.45, z, 0.015), ry);
      for (const d of [-0.6, 0.6]) { const [lx, lz] = off(x, z, ry, d, 0); rot(box("benchLeg", 0.08, 0.45, 0.32, "#5a3a22", parent, lx, 0.22, lz, 0.012), ry); }
    },
    table(x, z, { ry = 0, parent, mugs = 2 } = {}) {
      rot(box("tableTop", 1.2, 0.08, 0.8, "#8a5a32", parent, x, 0.8, z, 0.015), ry);
      cyl("tableLeg", 0.8, 0.12, "#5a3a22", parent, x, 0.4, z, 0.012, 6);
      for (let i = 0; i < mugs; i++) { const [mx, mz] = off(x, z, ry, (i - 0.5) * 0.4, 0.1); cyl("mug", 0.16, 0.11, "#c9b07a", parent, mx, 0.92, mz, 0.008, 8); }
    },
    /** A wooden chair; ry turns its seat to face that way (its back is behind). */
    chair(x, z, { ry = 0, parent, hex = "#8a5a32" } = {}) {
      rot(box("chairSeat", 0.46, 0.06, 0.46, hex, parent, x, 0.46, z, 0.012), ry);
      const [bx, bz] = off(x, z, ry, 0, -0.21);
      rot(box("chairBack", 0.46, 0.5, 0.05, hex, parent, bx, 0.74, bz, 0.012), ry);
      for (const [dx, dz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) { const [lx, lz] = off(x, z, ry, dx, dz); cyl("chairLeg", 0.46, 0.05, "#5a3a22", parent, lx, 0.23, lz, 0, 5); }
    },
    /** A round café table with a cloth. */
    roundTable(x, z, { parent, cloth = "#f2d4dc" } = {}) {
      cyl("rtTop", 0.06, 1.1, "#8a5a32", parent, x, 0.78, z, 0.015, 16);
      cyl("rtCloth", 0.2, 1.16, cloth, parent, x, 0.7, z, 0.012, 16, 1.22);
      cyl("rtLeg", 0.76, 0.12, "#5a3a22", parent, x, 0.38, z, 0, 6);
      cyl("rtFoot", 0.05, 0.6, "#5a3a22", parent, x, 0.03, z, 0.01, 10);
    },
    /** A cup and saucer on a table at height y. */
    teacup(x, z, { parent, y = 0.81 } = {}) { cyl("saucer", 0.015, 0.2, "#f6f1e8", parent, x, y + 0.01, z, 0.006, 12); cyl("cup", 0.08, 0.1, "#f6f1e8", parent, x, y + 0.06, z, 0.006, 10, 0.08); },
    /** A potted plant. */
    plant(x, z, { parent, s = 1 } = {}) {
      cyl("pot", 0.45 * s, 0.5 * s, "#b0603a", parent, x, 0.22 * s, z, 0.015, 10, 0.38 * s);
      for (let i = 0; i < 4; i++) { const m = put(MB.CreateSphere("leaf", { diameter: 0.5 * s, segments: 5 }, scene), parent, x + Math.sin(i * 1.7) * 0.15 * s, (0.6 + i * 0.12) * s, z + Math.cos(i * 1.7) * 0.15 * s, 0.015); m.material = P(i % 2 ? "#4a7a3a" : "#5a8a44"); }
    },
    /** A cold or burning fire ring. Returns the flame mesh (null when cold). */
    campfire(x, z, { parent, lit = true } = {}) {
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; const s = put(MB.CreateSphere("fireStone", { diameter: 0.22, segments: 5 }, scene), parent, x + Math.sin(a) * 0.45, 0.06, z + Math.cos(a) * 0.45, 0.012); s.material = P("#6a6458"); }
      for (let i = 0; i < 3; i++) { const l = cyl("fireLog", 0.7, 0.1, lit ? "#5a3a22" : "#2a2420", parent, x, 0.08, z, 0.01, 6); l.rotation.set(Math.PI / 2, i * 1.05, 0); }
      if (!lit) return null;
      const f = put(MB.CreateCylinder("flame", { height: 0.6, diameterTop: 0, diameterBottom: 0.45, tessellation: 7 }, scene), parent, x, 0.35, z, 0);
      f.material = glow(scene, "fireGlow", "#ff8a3a");
      return f;
    },
    lampPost(x, z, { parent, lampMat } = {}) {
      cyl("lampPost", 2.8, 0.12, "#2a2c30", parent, x, 1.4, z, 0.015, 8);
      box("lampArm", 0.06, 0.06, 0.5, "#2a2c30", parent, x, 2.75, z + 0.22, 0.01);
      const l = box("lamp", 0.26, 0.34, 0.26, "#2a2c30", parent, x, 2.55, z + 0.45, 0.012);
      if (lampMat) { const g = put(MB.CreateBox("lampGlass", { width: 0.2, height: 0.26, depth: 0.2 }, scene), parent, x, 2.55, z + 0.45, 0); g.material = lampMat; }
      return l;
    },
    fence(x0, z0, x1, z1, { parent, hex = "#7a5a3a" } = {}) {
      const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.4));
      for (let i = 0; i <= n; i++) cyl("fencePost", 1.1, 0.12, hex, parent, x0 + ((x1 - x0) * i) / n, 0.55, z0 + ((z1 - z0) * i) / n, 0.012, 6);
      for (const y of [0.45, 0.85]) { const r = box("fenceRail", 0.06, 0.08, len, hex, parent, (x0 + x1) / 2, y, (z0 + z1) / 2, 0.01); r.rotation.y = ry; }
    },
    /** A market tray of goods: fish, bread, apples, pots. */
    goods(x, z, { kind = "fish", parent, y = 1.04 } = {}) {
      const hex = { fish: "#a8b8c0", bread: "#c8904a", apples: "#c0504d", pots: "#9a6a4a", cloth: "#7a5a8a" }[kind];
      for (let i = 0; i < 5; i++) {
        const m = kind === "fish" ? put(MB.CreateCapsule("fish", { height: 0.32, radius: 0.05, tessellation: 6 }, scene), parent, x - 0.5 + i * 0.25, y, z, 0.008)
          : kind === "cloth" ? put(MB.CreateBox("bolt", { width: 0.2, height: 0.12, depth: 0.5 }, scene), parent, x - 0.5 + i * 0.25, y, z, 0.008)
          : put(MB.CreateSphere("good", { diameter: kind === "pots" ? 0.22 : 0.14, segments: 6 }, scene), parent, x - 0.5 + i * 0.25, y, z, 0.008);
        if (kind === "fish") m.rotation.z = Math.PI / 2;
        m.material = P(hex);
      }
    },
    well(x, z, { parent } = {}) {
      cyl("wellRing", 0.8, 1.6, "#7a7466", parent, x, 0.4, z, 0.04, 14);
      const water = put(MB.CreateDisc("wellWater", { radius: 0.62, tessellation: 14 }, scene), parent, x, 0.62, z, 0); water.rotation.x = Math.PI / 2; water.material = P("#2f4a56");
      for (const s of [-1, 1]) cyl("wellPost", 1.6, 0.1, "#6b4a32", parent, x + s * 0.7, 1.4, z, 0.012, 6);
      const beam = box("wellBeam", 1.6, 0.1, 0.1, "#6b4a32", parent, x, 2.15, z, 0.012);
      const roof = cyl("wellRoof", 1.9, 1.1, "#8a4a3a", parent, x, 2.45, z, 0.03, 3); roof.rotation.set(0, 0, Math.PI / 2); roof.scaling.set(1, 1, 0.6);
      cyl("bucket", 0.28, 0.26, "#8a5a32", parent, x + 0.2, 1.3, z, 0.01, 8, 0.22);
      return beam;
    },
    /** Charred beams and a fallen roof: a building somebody burned. */
    ruin(x, z, { w = 5, d = 4, ry = 0, parent } = {}) {
      for (const [dx, dz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) { const [px, pz] = off(x, z, ry, dx, dz); const b = cyl("charredPost", 1.6 + ((dx + dz) > 0 ? 0.8 : 0), 0.22, "#2a2420", parent, px, 1, pz, 0.02, 6); b.rotation.z = (dx > 0 ? -0.08 : 0.1); }
      const fallen = rot(box("charredBeam", 0.2, 0.2, w * 1.1, "#2a2420", parent, x, 0.4, z, 0.02), ry + 0.6); fallen.rotation.z = 0.25;
      const ash = put(MB.CreateDisc("ash", { radius: Math.max(w, d) * 0.55, tessellation: 16 }, scene), parent, x, 0.015, z, 0); ash.rotation.x = Math.PI / 2; ash.material = P("#3a3430");
      for (let i = 0; i < 6; i++) { const [px, pz] = off(x, z, ry, (i - 2.5) * 0.6, (i % 2 ? 0.8 : -0.6)); rot(box("debris", 0.7, 0.08, 0.16, "#2a2420", parent, px, 0.05, pz, 0.01), i * 0.9); }
    },
    /** Scaffolding and fresh planks: a building being put back up. */
    scaffold(x, z, { w = 5, d = 4, ry = 0, parent } = {}) {
      for (const [dx, dz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) { const [px, pz] = off(x, z, ry, dx, dz); cyl("scaffoldPole", 3.2, 0.12, "#b08a5a", parent, px, 1.6, pz, 0.012, 6); }
      for (const y of [1.2, 2.4]) for (const s of [-1, 1]) { const [px, pz] = off(x, z, ry, 0, s * d / 2); rot(box("scaffoldBoard", w, 0.06, 0.4, "#c9a26a", parent, px, y, pz, 0.012), ry); }
      const wall = rot(box("newWall", w * 0.9, 1.6, 0.2, "#d9b886", parent, ...off(x, z, ry, 0, -d / 2 + 0.15).flatMap((v, i) => (i ? [0.8, v] : [v])), 0.02), ry);
      for (let i = 0; i < 4; i++) { const [px, pz] = off(x, z, ry, w / 2 + 0.8, (i - 1.5) * 0.3); rot(box("plankStack", 2.2, 0.06, 0.25, "#d9b886", parent, px, 0.05 + i * 0.07, pz, 0.008), ry + Math.PI / 2); }
      return wall;
    },
    /** Old bones (the Undercroft), a dropped weapon (after a fight). */
    bones(x, z, { parent } = {}) { for (let i = 0; i < 5; i++) rot(box("bone", 0.35, 0.05, 0.06, "#e8e0cc", parent, x + (i - 2) * 0.12, 0.03, z + (i % 2) * 0.15, 0.008), i * 1.3); },
    droppedBlade(x, z, { ry = 0, parent } = {}) { rot(box("droppedBlade", 0.05, 0.03, 0.9, "#9aa2ae", parent, x, 0.02, z, 0.01), ry); rot(box("droppedHilt", 0.2, 0.04, 0.05, "#3a2a22", parent, ...off(x, z, ry, 0, -0.45).flatMap((v, i) => (i ? [0.03, v] : [v])), 0.008), ry); },
    statue(x, z, { parent, broken = false } = {}) {
      cyl("plinth", 0.8, 1.1, "#7a7466", parent, x, 0.4, z, 0.03, 8);
      const body = cyl("statueBody", broken ? 0.9 : 1.8, 0.5, "#8a8478", parent, x, broken ? 1.25 : 1.7, z, 0.03, 8, 0.7);
      if (!broken) { const h = put(MB.CreateSphere("statueHead", { diameter: 0.45, segments: 8 }, scene), parent, x, 2.8, z, 0.025); h.material = P("#8a8478"); }
      else { const h = put(MB.CreateSphere("statueHead", { diameter: 0.45, segments: 8 }, scene), parent, x + 0.9, 0.22, z + 0.4, 0.025); h.material = P("#8a8478"); }
      return body;
    },
  };
}
