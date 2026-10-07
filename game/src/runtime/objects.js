// Things bosses put on the field (data/bosses2.js OBJECTS): a silence bell, a rusted vow-seal, a bile
// egg sac, a slime bubble. Not characters, so not Rigs: a few cel-shaded parts that shake when hit,
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
      case "eggsac": { // a clutch of Gullmaw's eggs on a slime mound: glowing green spheres with dark yolks, one big spitting sac
        part(MB.CreateSphere("mound", { diameter: 1.4, segments: 10 }, scene), "#3a5a3a", 0, 0.05, 0).scaling.set(1, 0.35, 1);
        const egg = (x, y, z, d) => { part(MB.CreateSphere("egg", { diameter: d, segments: 8 }, scene), "#a8d86a", x, y, z, 0.012); part(MB.CreateSphere("yolk", { diameter: d * 0.4, segments: 6 }, scene), "#1a2a14", x, y + d * 0.05, z + d * 0.32, 0); };
        for (const [x, z, d] of [[-0.4, 0.2, 0.32], [0.38, 0.25, 0.3], [-0.25, -0.35, 0.28], [0.3, -0.3, 0.34]]) egg(x, 0.28, z, d);
        this.head = new BB.TransformNode(`${id}-head`, scene); this.head.parent = this.root; this.head.position.y = 0.7;
        const sac = part(MB.CreateSphere("sac", { diameter: 0.75, segments: 10 }, scene), "#7ab84a", 0, 0, 0); sac.parent = this.head; sac.scaling.set(1, 1.15, 1);
        this.glowPart = part(MB.CreateSphere("vent", { diameter: 0.2, segments: 6 }, scene), "#d8ff6a", 0, 0.05, 0.33, 0, true); this.glowPart.parent = this.head;
        break;
      }
      case "bubble": { // a slime bubble around a swallowed ally: a wobbling translucent shell
        const shell = MB.CreateSphere("bubble", { diameter: 2.0, segments: 16 }, scene);
        shell.parent = this.root; shell.position.set(0, 1.0, 0); shell.isPickable = false;
        const m = new BB.StandardMaterial(`${id}-bubbleMat`, scene);
        m.diffuseColor = BB.Color3.FromHexString("#6ac8a8"); m.emissiveColor = BB.Color3.FromHexString("#1a4a3a");
        m.specularColor = BB.Color3.FromHexString("#ffffff"); m.specularPower = 64; m.alpha = 0.42; m.backFaceCulling = false;
        shell.material = m; this.meshes.push(shell); this.bubble = shell;
        part(MB.CreateSphere("slime", { diameter: 1.6, segments: 8 }, scene), "#4a8a6a", 0, 0.02, 0, 0).scaling.set(1, 0.12, 1);
        this.glowPart = part(MB.CreateTorus("ring", { diameter: 1.9, thickness: 0.05, tessellation: 20 }, scene), "#8ae0d0", 0, 1.0, 0, 0, true);
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
    if (this.bubble) { const w = Math.sin(this.time * 4) * 0.05; this.bubble.scaling.set(1 + w, 1 - w, 1 + w); }
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
