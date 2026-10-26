// Severin's constellation: pinned stars and the lines between them (warning glow, strike, dimming).

import { B, glow, color3 } from "./look.js";

export class Constellation {
  constructor(scene) {
    this.scene = scene;
    this.stars = []; this.lines = [];
    this.state = "off"; this.t = 0; this.warnFrames = 50;
    const BB = B();
    this.starMat = glow(scene, "cst-star", "#fff1b8");
    this.lineMat = glow(scene, "cst-line", "#ffd36a", 0.85, true);
    this.base = color3("#ffd36a").clone(); this.hot = color3("#ff5a4a").clone(); this.white = BB.Color3.White();
  }

  place(stars, lines, polaris) {
    this.clear(true);
    const BB = B(), MB = BB.MeshBuilder, sc = this.scene;
    const mk = (m) => { m.isPickable = false; return m; };
    for (const s of [...stars, polaris]) {
      const star = mk(MB.CreatePolyhedron("cst-s", { type: 1, size: s === polaris ? 0.32 : 0.22 }, sc));
      star.position.set(s.x, s === polaris ? 0.15 : 1.5, s.z); star.material = this.starMat;
      const beam = mk(MB.CreateCylinder("cst-b", { height: 1.5, diameter: 0.05, tessellation: 6 }, sc));
      beam.position.set(s.x, 0.75, s.z); beam.material = this.lineMat;
      if (s === polaris) beam.setEnabled(false);
      this.stars.push(star, beam);
    }
    for (const L of lines) {
      const dx = L.b.x - L.a.x, dz = L.b.z - L.a.z, len = Math.hypot(dx, dz);
      const m = mk(MB.CreateBox("cst-l", { width: 0.12, height: 0.05, depth: len }, sc));
      m.position.set((L.a.x + L.b.x) / 2, 0.07, (L.a.z + L.b.z) / 2);
      m.rotation.y = Math.atan2(dx, dz);
      m.material = this.lineMat;
      this.lines.push(m);
    }
    this.state = "idle"; this.t = 0; this.fade = 1;
  }

  warn(frames) { this.state = "warn"; this.t = 0; this.warnFrames = frames; }
  strike() { this.state = "strike"; this.t = 0; }

  /** dimmed: knocked off Polaris (a quick fade); otherwise just removed. */
  clear(instant = false) {
    if (instant || !this.lines.length) { for (const m of [...this.stars, ...this.lines]) m.dispose(); this.stars = []; this.lines = []; this.state = "off"; return; }
    this.state = "dim"; this.t = 0;
  }

  update(dt, time) {
    if (this.state === "off") return;
    this.t += dt;
    for (const [i, s] of this.stars.entries()) if (i % 2 === 0) s.rotation.y += dt * 2;
    let w = 1, col = this.base, alpha = 0.85;
    if (this.state === "idle") { alpha = 0.35 + Math.sin(time * 3) * 0.1; }
    else if (this.state === "warn") {
      const k = Math.min(1, this.t / (this.warnFrames / 60));
      const blink = Math.sin(time * (10 + k * 30)) > 0 ? 1 : 0.4;
      col = this.base.clone().scaleInPlace(1 - k).addInPlace(this.hot.scale(k)); alpha = 0.5 + 0.5 * blink; w = 1 + k * 1.5;
    } else if (this.state === "strike") {
      col = this.white; alpha = 1; w = 4 - Math.min(3, this.t * 10);
      if (this.t > 0.35) this.state = "idle";
    } else if (this.state === "dim") {
      alpha = Math.max(0, 0.8 - this.t * 2); w = 1 + this.t * 3;
      if (this.t > 0.45) { this.clear(true); return; }
    }
    this.lineMat.emissiveColor.copyFrom(col); this.lineMat.alpha = alpha;
    for (const m of this.lines) { m.scaling.x = w; m.scaling.y = w; }
  }
}

/**
 * A creature drawn in dark stars (Severin Eclipsed's Lion, data/eclipse.js LION_FIGURE): points of cold light and
 * the lines between them, a faint violet haze where its body would be. Same interface as a Rig for main.js.
 */
export class StarFigure {
  constructor(scene, id, figure, { color = "#c9a4ff", core = "#f4ecff", scale = 1.35 } = {}) {
    const BB = B(), MB = BB.MeshBuilder;
    this.figure = figure; this.scale = scale; this.time = 0; this.flash = 0; this.dead = 0; this.swinging = false;
    this.root = new BB.TransformNode(`${id}-stars`, scene);
    this.body = new BB.TransformNode(`${id}-starBody`, scene); this.body.parent = this.root; this.body.scaling.setAll(scale);
    this.starMat = glow(scene, `${id}-starCore`, core);
    this.lineMat = glow(scene, `${id}-starLine`, color, 0.75, true);
    this.hazeMat = glow(scene, `${id}-starHaze`, "#3a1a5a", 0.35, true);
    this.base = this.figure.stars.map(([x, y, z]) => new BB.Vector3(x, y, z));
    this.stars = figure.stars.map(([x, y, z, r], i) => {
      const m = MB.CreatePolyhedron(`${id}-star${i}`, { type: 1, size: r }, scene);
      m.parent = this.body; m.position.set(x, y, z); m.material = this.starMat; m.isPickable = false; return m;
    });
    this.lines = figure.lines.map(([a, b], i) => {
      const m = MB.CreateCylinder(`${id}-line${i}`, { height: 1, diameter: 0.035, tessellation: 5 }, scene);
      m.parent = this.body; m.material = this.lineMat; m.isPickable = false; return { m, a, b };
    });
    const haze = MB.CreateSphere(`${id}-haze`, { diameter: 1, segments: 8 }, scene);
    haze.parent = this.body; haze.position.set(0, 1.15, 0.1); haze.scaling.set(0.9, 0.7, 2.2); haze.material = this.hazeMat; haze.isPickable = false;
    this.haze = haze;
    this.meshes = [...this.stars, ...this.lines.map((l) => l.m), haze];
    this._layLines();
  }

  _layLines() {
    const BB = B();
    for (const { m, a, b } of this.lines) {
      const p = this.stars[a].position, q = this.stars[b].position, d = q.subtract(p), len = d.length() || 0.001;
      m.position.copyFrom(p.add(q).scale(0.5)); m.scaling.set(1, len, 1);
      const up = new BB.Vector3(0, 1, 0), axis = BB.Vector3.Cross(up, d.normalize()), ang = Math.acos(Math.max(-1, Math.min(1, BB.Vector3.Dot(up, d.normalize()))));
      m.rotationQuaternion = axis.lengthSquared() < 1e-8 ? BB.Quaternion.Identity() : BB.Quaternion.RotationAxis(axis.normalize(), ang);
    }
  }

  update(f, t, dt) {
    this.time += dt;
    const x = f.prev.x + (f.pos.x - f.prev.x) * t, z = f.prev.z + (f.pos.z - f.prev.z) * t, y = f.prev.y + (f.pos.y - f.prev.y) * t;
    this.root.position.set(x, y, z);
    this.root.rotation.y = f.yaw;
    // Its paws step as it moves; the whole figure breathes and glitters.
    const speed = Math.hypot(f.vel?.x ?? 0, f.vel?.z ?? 0), stride = Math.min(1, speed / 4), ph = this.time * 9;
    const { front, back } = this.figure.legs;
    this.stars.forEach((s, i) => {
      const b = this.base[i];
      let lift = 0, reach = 0;
      if (front.includes(i) || back.includes(i)) { const k = (front.indexOf(i) + back.indexOf(i) + 2) % 2 ? 1 : -1; lift = Math.max(0, Math.sin(ph) * k) * 0.25 * stride; reach = Math.cos(ph) * k * 0.25 * stride; }
      s.position.set(b.x, b.y + lift + Math.sin(this.time * 2 + i) * 0.02, b.z + reach);
      s.scaling.setAll(0.85 + 0.3 * Math.abs(Math.sin(this.time * 3 + i * 1.7)));
    });
    const lunging = f.current?.id === "Pounce" && f.runner?.frame >= 18;
    this.body.rotation.x = lunging ? -0.25 : 0;
    this._layLines();
    this.flash = Math.max(0, this.flash - dt);
    const fading = !f.alive ? Math.min(1, (this.dead += dt) / 0.8) : 0;
    const vis = (1 - fading) * (this.flash > 0 ? 1 : 0.9);
    for (const m of this.meshes) m.visibility = vis;
    this.haze.visibility = 0.35 * (1 - fading);
    this.root.setEnabled(fading < 1);
  }

  hitFlash(seconds = 0.07) { this.flash = Math.max(this.flash, seconds * 3); }
  bladeWorld() { const p = this.root.position; return { hilt: p, tip: p }; }
  setVisible(on) { this.root.setEnabled(on); }
  dispose() { this.root.dispose(false, true); }
}
