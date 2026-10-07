// Things bosses put on the field (data/bosses2.js OBJECTS): a silence bell, a rusted vow-seal, a court
// turret, a sentence cage. Not characters, so not Rigs: a few cel-shaded parts that shake when hit,
// glow while they work, and crumble when broken. Same interface the render loop uses for Rigs.

import { B, toon, glow, inkOutline } from "./look.js";

export class ObjectView {
  constructor(scene, kind, id, look) {
    const BB = B(), MB = BB.MeshBuilder;
    this.kind = kind; this.look = look; this.time = 0; this.flash = 0; this.dead = 0; this.swinging = false;
    this.root = new BB.TransformNode(`${id}-obj`, scene);
    this.meshes = [];
    const part = (m, hex, x, y, z, o = 0.025, glowing = false) => {
      m.parent = this.root; m.position.set(x, y, z); m.isPickable = false;
      m.material = glowing ? glow(scene, `${id}-${m.name}-g`, hex) : toon(scene, `${id}-${m.name}-m`, hex);
      if (o) inkOutline(m, o);
      this.meshes.push(m); return m;
    };
    switch (look.shape) {
      case "bell": { // a bronze bell hung in a wooden frame, ringing silence
        for (const x of [-0.7, 0.7]) part(MB.CreateBox("post", { width: 0.16, height: 2.4, depth: 0.16 }), "#5a3a22", x, 1.2, 0);
        part(MB.CreateBox("beam", { width: 1.7, height: 0.16, depth: 0.2 }), "#5a3a22", 0, 2.4, 0);
        this.swing = new BB.TransformNode(`${id}-swing`, scene); this.swing.parent = this.root; this.swing.position.y = 2.3;
        const bell = part(MB.CreateCylinder("bell", { height: 0.9, diameterTop: 0.35, diameterBottom: 0.9, tessellation: 14 }), "#a07a3a", 0, -0.5, 0);
        bell.parent = this.swing;
        this.glowPart = part(MB.CreateTorus("rim", { diameter: 0.9, thickness: 0.06, tessellation: 18 }), "#c9b4ff", 0, -0.95, 0, 0, true); this.glowPart.parent = this.swing;
        break;
      }
      case "seal": { // a rust-red standing stone with a burning vow rune
        part(MB.CreateBox("stone", { width: 0.9, height: 1.7, depth: 0.5 }), "#6a3a2a", 0, 0.85, 0);
        part(MB.CreateBox("chain", { width: 1.0, height: 0.1, depth: 0.56 }), "#3a3a42", 0, 1.2, 0, 0.01);
        this.glowPart = part(MB.CreateBox("rune", { width: 0.4, height: 0.5, depth: 0.04 }), "#ff7a2a", 0, 1.05, 0.27, 0, true);
        break;
      }
      case "turret": { // a brass cannon on a tripod that turns to aim
        for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = part(MB.CreateCylinder("leg", { height: 1.0, diameter: 0.08, tessellation: 5 }), "#3a3a42", Math.sin(a) * 0.3, 0.45, Math.cos(a) * 0.3, 0.01); leg.rotation.set(Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4); }
        this.head = new BB.TransformNode(`${id}-head`, scene); this.head.parent = this.root; this.head.position.y = 1.05;
        const body = part(MB.CreateSphere("drum", { diameter: 0.6, segments: 8 }), "#a07a3a", 0, 0, 0); body.parent = this.head;
        const barrel = part(MB.CreateCylinder("barrel", { height: 0.7, diameter: 0.18, tessellation: 8 }), "#6a5222", 0, 0, 0.4); barrel.rotation.x = Math.PI / 2; barrel.parent = this.head;
        this.glowPart = part(MB.CreateSphere("eye", { diameter: 0.16, segments: 6 }), "#ffd36a", 0, 0.12, 0.28, 0, true); this.glowPart.parent = this.head;
        break;
      }
      case "cage": { // iron bars around a sentenced ally
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; part(MB.CreateCylinder("bar", { height: 2.4, diameter: 0.07, tessellation: 5 }), "#3a3f48", Math.sin(a) * 0.75, 1.2, Math.cos(a) * 0.75, 0.01); }
        for (const y of [0.05, 2.4]) part(MB.CreateTorus("hoop", { diameter: 1.5, thickness: 0.08, tessellation: 18 }), "#3a3f48", 0, y, 0, 0.01);
        this.glowPart = part(MB.CreateTorus("lock", { diameter: 0.3, thickness: 0.05, tessellation: 10 }), "#ffd36a", 0, 1.3, 0.78, 0, true);
        break;
      }
      default: part(MB.CreateBox("thing", { size: 1 }), "#888888", 0, 0.5, 0);
    }
  }

  update(f, t, dt) {
    this.time += dt;
    this.root.position.set(f.pos.x, 0, f.pos.z);
    if (this.head) this.head.rotation.y = f.yaw; else this.root.rotation.y = f.yaw;
    const shake = this.flash > 0 ? Math.sin(this.time * 60) * 0.06 : 0;
    this.flash = Math.max(0, this.flash - dt);
    if (this.swing) this.swing.rotation.z = Math.sin(this.time * 3) * 0.12 + shake * 2;
    else this.root.position.x += shake;
    if (this.glowPart) this.glowPart.scaling.setAll(1 + Math.sin(this.time * 6) * 0.1);
    if (!f.alive) { // crumble and sink
      this.dead = Math.min(1, this.dead + dt * 1.2);
      this.root.position.y = -this.dead * 2.6;
      this.root.rotation.z = this.dead * 0.4;
      if (this.glowPart) this.glowPart.setEnabled(false);
    }
  }
  hitFlash(seconds = 0.07) { this.flash = Math.max(this.flash, seconds * 3); }
  bladeWorld() { const p = this.root.position; return { hilt: p, tip: p }; }
  setVisible(on) { this.root.setEnabled(on); }
  dispose() { for (const m of this.meshes) { m.material?.dispose(); m.dispose(); } this.root.dispose(); }
}
