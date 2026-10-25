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
