// The floor trail (sim/guide.js works out the way): glowing chevrons on the ground from Rook toward the
// next person to talk to or thing to pick up, with a soft pulse running along them in the walking
// direction, and a ring at the end so you can see where it stops. Shown on episode walk-around beats.

import { B, glow } from "./look.js";

const GOLD = "#ffd36a";

/** A flat chevron (a "V" pointing +z), laid on the ground. */
function chevron(scene, name) {
  const BB = B();
  // Two arms, each a quad: outer edge, then the inner edge set back by the arm's thickness.
  const P = [[-0.44, -0.18], [0, 0.27], [0, 0.03], [-0.44, -0.42], [0.44, -0.18], [0.44, -0.42]];
  const positions = P.flatMap(([x, z]) => [x, 0, z]);
  const indices = [0, 1, 2, 0, 2, 3, 1, 4, 5, 1, 5, 2];
  const normals = [];
  BB.VertexData.ComputeNormals(positions, indices, normals);
  const vd = new BB.VertexData();
  vd.positions = positions; vd.indices = indices; vd.normals = normals;
  const m = new BB.Mesh(name, scene);
  vd.applyToMesh(m);
  m.isPickable = false;
  return m;
}

export class GuideTrail {
  constructor(scene, { max = 14 } = {}) {
    const BB = B();
    this.max = max;
    this.root = new BB.TransformNode("guideTrail", scene);
    this.mat = glow(scene, "guideTrailMat", GOLD, 0.85);
    const proto = chevron(scene, "guideArrow");
    proto.material = this.mat; proto.parent = this.root; proto.setEnabled(false);
    this.arrows = [proto, ...Array.from({ length: max - 1 }, (_, i) => { const c = proto.clone(`guideArrow${i + 1}`); c.parent = this.root; return c; })];
    this.ring = BB.MeshBuilder.CreateTorus("guideRing", { diameter: 1.1, thickness: 0.05, tessellation: 28 }, scene);
    this.ring.material = this.mat; this.ring.parent = this.root; this.ring.isPickable = false; this.ring.setEnabled(false);
    this.marks = [];
    this.goal = null;
    this.alpha = 0; // the whole trail fades in and out rather than popping
    this.t = 0;
  }

  /** Lay the arrows (marks from sim/guide.js trailMarks) and the ring at the goal (null: no ring). */
  set(marks, goal) { this.marks = marks; this.goal = goal; }

  /** Show or hide (it fades). */
  show(on) { this.on = on; }

  update(dt) {
    this.t += dt;
    this.alpha = Math.max(0, Math.min(1, this.alpha + (this.on ? dt * 3 : -dt * 5)));
    const live = this.alpha > 0.01;
    this.root.setEnabled(live);
    if (!live) return;
    for (let i = 0; i < this.arrows.length; i++) {
      const a = this.arrows[i], m = this.marks[i];
      if (!m) { a.setEnabled(false); continue; }
      a.setEnabled(true);
      a.position.set(m.x, 0.07, m.z);
      a.rotation.y = m.yaw;
      // A pulse runs along the trail in the walking direction; the far end and the bit by your feet fade.
      const wave = 0.5 + 0.5 * Math.sin((m.s - this.t * 3.2) * 1.6);
      const ends = Math.min(1, m.s / 1.6) * Math.min(1, (this.max - i) / 3) * Math.min(1, m.left / 1.4);
      a.visibility = this.alpha * ends * (0.35 + 0.65 * wave * wave);
      const k = 0.9 + 0.15 * wave; a.scaling.set(k, 1, k);
    }
    const g = this.goal;
    this.ring.setEnabled(!!g);
    if (g) {
      const k = 1 + 0.12 * Math.sin(this.t * 4);
      this.ring.position.set(g.x, 0.05, g.z);
      this.ring.scaling.set(k, 1, k);
      this.ring.visibility = this.alpha * 0.8;
    }
  }

  dispose() { this.root.dispose(false, true); }
}
