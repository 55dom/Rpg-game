// Hit effects. Everything is pooled: no allocations during a fight except Afterimage ghosts
// (at most one burst per 3 s cooldown).

import { B, PALETTE, color3, glow, toon as toonMat, clamp01, lerp } from "./look.js";

/** A ribbon that follows a blade: newest edge bright, older edges fade (additive). */
export class Trail {
  constructor(scene, name, hex, segments = 14) {
    const BB = B();
    this.n = segments;
    // Preallocated ring of samples: no allocation per frame.
    this.tips = Array.from({ length: segments }, () => new BB.Vector3());
    this.hilts = Array.from({ length: segments }, () => new BB.Vector3());
    this.head = 0; this.count = 0;
    this.color = color3(hex);
    const mesh = new BB.Mesh(name, scene);
    const pos = new Float32Array(this.n * 2 * 3);
    const col = new Float32Array(this.n * 2 * 4);
    const idx = [];
    for (let i = 0; i < this.n - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    const vd = new BB.VertexData();
    vd.positions = pos; vd.colors = col; vd.indices = idx;
    vd.applyToMesh(mesh, true);
    const m = new BB.StandardMaterial(name + "-mat", scene);
    m.disableLighting = true; m.emissiveColor = BB.Color3.White(); m.diffuseColor = BB.Color3.Black();
    m.backFaceCulling = false; m.alphaMode = BB.Engine.ALPHA_ADD; m.alpha = 0.95; m.fogEnabled = false;
    mesh.material = m;
    mesh.hasVertexAlpha = true;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.isPickable = false;
    this.mesh = mesh; this.pos = pos; this.col = col;
    this.energy = 0;
  }

  setColor(hex) { this.color = color3(hex); }

  /** Feed the blade each render frame. `on` widens the ribbon; off lets it collapse. */
  push(hilt, tip, on, dt) {
    if (this.count && B().Vector3.DistanceSquared(this.tips[this.head], tip) > 9) this.count = 0; // teleported
    this.energy = on ? 1 : Math.max(0, this.energy - dt * 7);
    const base = this.energy > 0 ? hilt : tip;
    this.head = (this.head + this.n - 1) % this.n;
    this.tips[this.head].copyFrom(tip); this.hilts[this.head].copyFrom(base);
    this.count = Math.min(this.n, this.count + 1);
    const k = this.count;
    for (let i = 0; i < this.n; i++) {
      const slot = (this.head + Math.min(i, k - 1)) % this.n;
      const t = this.tips[slot], h = this.hilts[slot];
      const fade = Math.pow(1 - i / this.n, 1.6) * this.energy;
      // Taper: older samples pull the inner edge out toward the tip.
      const w = 1 - i / this.n;
      const hx = lerp(t.x, h.x, w), hy = lerp(t.y, h.y, w), hz = lerp(t.z, h.z, w);
      const c = this.color, o = i * 8, pp = i * 6, col = this.col, pos = this.pos;
      pos[pp] = t.x; pos[pp + 1] = t.y; pos[pp + 2] = t.z; pos[pp + 3] = hx; pos[pp + 4] = hy; pos[pp + 5] = hz;
      col[o] = c.r * fade; col[o + 1] = c.g * fade; col[o + 2] = c.b * fade; col[o + 3] = fade;
      col[o + 4] = c.r * fade * 0.3; col[o + 5] = c.g * fade * 0.3; col[o + 6] = c.b * fade * 0.3; col[o + 7] = fade * 0.3;
    }
    this.mesh.updateVerticesData(B().VertexBuffer.PositionKind, this.pos);
    this.mesh.updateVerticesData(B().VertexBuffer.ColorKind, this.col);
  }
}

class Pool {
  constructor(make, size) { this.items = Array.from({ length: size }, (_, i) => make(i)); this.next = 0; }
  take() { const it = this.items[this.next]; this.next = (this.next + 1) % this.items.length; return it; }
}

export class Vfx {
  constructor(scene, camera, overlay) {
    const BB = B(), MB = BB.MeshBuilder;
    this.scene = scene; this.camera = camera; this.overlay = overlay;
    this.reduceFlashes = false;

    // Sparks: streaks along their velocity.
    this.sparkMats = {
      gold: glow(scene, "spark-gold", "#ffd98a"), red: glow(scene, "spark-red", "#ff6a5a"),
      mint: glow(scene, "spark-mint", "#9ff0d0"), white: glow(scene, "spark-white", "#ffffff"),
    };
    this.sparks = {};
    for (const [key, mat] of Object.entries(this.sparkMats)) {
      const base = MB.CreateBox(`spark-${key}`, { width: 0.05, height: 0.05, depth: 1 }, scene);
      base.material = mat; base.isPickable = false; base.setEnabled(false);
      this.sparks[key] = new Pool((i) => {
        const inst = base.createInstance(`spark-${key}-${i}`);
        inst.setEnabled(false);
        return { mesh: inst, vel: new BB.Vector3(), life: 0, max: 1 };
      }, 40);
    }

    // Starburst flash (the anime "impact star").
    const starTex = new BB.DynamicTexture("star", { width: 256, height: 256 }, scene, false);
    const ctx = starTex.getContext();
    const g = ctx.createRadialGradient(128, 128, 4, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,240,200,0.9)"); g.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, r = i % 2 ? 40 : 124;
      ctx.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    starTex.hasAlpha = true; starTex.update();
    this.flashes = new Pool((i) => {
      const p = MB.CreatePlane(`flash-${i}`, { size: 1 }, scene);
      const m = new BB.StandardMaterial(`flash-mat-${i}`, scene);
      m.disableLighting = true; m.emissiveTexture = starTex; m.opacityTexture = starTex; m.diffuseColor = BB.Color3.Black();
      m.alphaMode = BB.Engine.ALPHA_ADD; m.backFaceCulling = false; m.fogEnabled = false;
      p.material = m; p.billboardMode = BB.Mesh.BILLBOARDMODE_ALL; p.isPickable = false; p.setEnabled(false);
      return { mesh: p, mat: m, life: 0, max: 1, size: 1, spin: 0 };
    }, 8);

    // Expanding rings: parry, slam, posture break.
    this.rings = new Pool((i) => {
      const r = MB.CreateTorus(`ring-${i}`, { diameter: 1, thickness: 0.06, tessellation: 40 }, scene);
      r.material = glow(scene, `ring-mat-${i}`, "#ffffff", 1, true);
      r.isPickable = false; r.setEnabled(false);
      return { mesh: r, life: 0, max: 1, size: 1, implode: false };
    }, 8);

    // Gale Cutter crescent.
    this.crescents = new Pool((i) => {
      const path = (r) => { const pts = []; for (let k = 0; k <= 16; k++) { const a = -1.1 + (k / 16) * 2.2; pts.push(new BB.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r - r)); } return pts; };
      const m = MB.CreateRibbon(`crescent-${i}`, { pathArray: [path(1.25), path(0.85)], sideOrientation: BB.Mesh.DOUBLESIDE }, scene);
      m.material = glow(scene, `crescent-mat-${i}`, PALETTE.gale, 0.9, true);
      m.isPickable = false; m.setEnabled(false);
      return { mesh: m, life: 0, max: 0.3, vel: new BB.Vector3() };
    }, 3);

    // Juno's threads: thin glowing lines stretched between two points.
    this.threads = new Pool((i) => {
      const m = MB.CreateBox(`thread-${i}`, { width: 0.03, height: 0.03, depth: 1 }, scene);
      m.material = glow(scene, `thread-mat-${i}`, "#ff4d6d");
      m.isPickable = false; m.setEnabled(false);
      return { mesh: m, life: 0, max: 1, from: new BB.Vector3(), to: new BB.Vector3(), follow: null };
    }, 4);
    // Bas's pillars: stone columns that erupt from the ground, hold, then sink.
    this.pillars = new Pool((i) => {
      const m = MB.CreateCylinder(`pillar-${i}`, { height: 1, diameterTop: 0.9, diameterBottom: 1.3, tessellation: 7 }, scene);
      m.material = toonMat(scene, `pillar-mat-${i}`, "#8c909b");
      m.renderOutline = true; m.outlineWidth = 0.04; m.outlineColor = color3("#0f1117");
      m.isPickable = false; m.setEnabled(false);
      return { mesh: m, life: 0, max: 1, height: 4 };
    }, 3);

    // Cantor sound bolts: a violet orb with a spinning ring, synced to the sim's projectiles each frame.
    this.boltPool = Array.from({ length: 10 }, (_, i) => {
      const orb = MB.CreateSphere(`bolt-${i}`, { diameter: 0.45, segments: 8 }, scene);
      orb.material = glow(scene, `bolt-mat-${i}`, "#c9a4ff");
      const ring = MB.CreateTorus(`bolt-ring-${i}`, { diameter: 0.8, thickness: 0.04, tessellation: 20 }, scene);
      ring.material = orb.material; ring.parent = orb;
      orb.isPickable = ring.isPickable = false; orb.setEnabled(false);
      return { orb, ring, id: 0 };
    });

    // Ghost material for Afterimage.
    this.ghostMat = glow(scene, "ghost", "#7fe6ff", 0.32, true);
    this.ghosts = [];

    // Damage numbers (DOM, projected).
    this.numbers = new Pool(() => {
      const el = document.createElement("div");
      el.className = "dmg";
      overlay.appendChild(el);
      return { el, pos: new BB.Vector3(), life: 0, max: 0.9, vy: 0 };
    }, 16);

    this.tmp = new BB.Vector3();
    this.sparkPools = Object.values(this.sparks);
    this.projected = new BB.Vector3();
    this.viewport = new BB.Viewport(0, 0, 1, 1);
  }

  sparksAt(at, count, key = "gold", speed = 9, up = 2) {
    for (let i = 0; i < count; i++) {
      const s = this.sparks[key].take();
      s.mesh.setEnabled(true);
      s.mesh.position.set(at.x, at.y, at.z);
      const a = Math.random() * Math.PI * 2, e = (Math.random() - 0.3) * 1.2;
      const sp = speed * (0.5 + Math.random() * 0.8);
      s.vel.set(Math.cos(a) * Math.cos(e) * sp, Math.sin(e) * sp + up, Math.sin(a) * Math.cos(e) * sp);
      s.life = s.max = 0.18 + Math.random() * 0.22;
    }
  }

  flash(at, size = 1.6, hex = "#ffffff", life = 0.12) {
    if (this.reduceFlashes) size *= 0.6;
    const f = this.flashes.take();
    f.mesh.setEnabled(true);
    f.mesh.position.set(at.x, at.y, at.z);
    f.mat.emissiveColor.copyFrom(color3(hex));
    f.size = size; f.life = f.max = life; f.spin = Math.random() * Math.PI;
  }

  /** A flat shockwave ring expanding from `at` (or collapsing into it, for a vortex). */
  ring(at, size = 3, hex = "#ffffff", life = 0.35, implode = false) {
    const r = this.rings.take();
    r.mesh.setEnabled(true);
    r.mesh.position.set(at.x, at.y, at.z);
    r.mesh.material.emissiveColor.copyFrom(color3(hex));
    r.size = size; r.life = r.max = life; r.implode = implode;
  }

  crescent(pos, yaw) {
    const c = this.crescents.take();
    c.mesh.setEnabled(true);
    c.mesh.position.set(pos.x, pos.y + 1.0, pos.z);
    c.mesh.rotation.set(0, yaw, -0.25);
    const sp = 30;
    c.vel.set(Math.sin(yaw) * sp, 0, Math.cos(yaw) * sp);
    c.life = c.max = 0.22;
    this.sparksAt(c.mesh.position, 6, "mint", 6, 0);
  }

  number(at, value, kind = "") {
    const n = this.numbers.take();
    n.pos.set(at.x + (Math.random() - 0.5) * 0.4, at.y + 0.4, at.z);
    n.life = n.max = 0.9; n.vy = 1.6;
    n.el.textContent = kind === "text" ? value : String(Math.round(value));
    n.el.className = `dmg show ${kind}`;
  }

  /** A thread from `from` to `to` (both {x,y,z}); `follow` = optional {from(), to()} to track moving ends. */
  thread(from, to, life = 0.35, follow = null) {
    const t = this.threads.take();
    t.mesh.setEnabled(true);
    t.from.set(from.x, from.y, from.z); t.to.set(to.x, to.y, to.z);
    t.life = t.max = life; t.follow = follow;
  }

  /** Show one orb per live projectile (no allocation; pool of 10). */
  syncProjectiles(projectiles, dt) {
    let i = 0;
    for (const p of projectiles) {
      if (i >= this.boltPool.length) break;
      const b = this.boltPool[i++];
      b.orb.setEnabled(true);
      b.orb.position.set(p.pos.x, p.pos.y, p.pos.z);
      b.ring.rotation.x += dt * 9; b.ring.rotation.y += dt * 5;
      const s = 1 + Math.sin(performance.now() / 60) * 0.12;
      b.orb.scaling.set(s, s, s);
    }
    for (; i < this.boltPool.length; i++) this.boltPool[i].orb.setEnabled(false);
  }

  pillar(at, height = 4.5, life = 1.4) {
    const p = this.pillars.take();
    p.mesh.setEnabled(true);
    p.mesh.position.set(at.x, 0, at.z);
    p.height = height; p.life = p.max = life;
    this.sparksAt({ x: at.x, y: 0.3, z: at.z }, 10, "gold", 7, 6);
    this.ring({ x: at.x, y: 0.06, z: at.z }, 3.5, "#c9b28a", 0.35);
  }

  afterimage(rig) {
    const parts = rig.snapshot(this.ghostMat);
    this.ghosts.push({ parts, life: 0.55, max: 0.55 });
  }

  update(dt, camera, engine) {
    for (const pool of this.sparkPools) {
      for (const s of pool.items) {
        if (s.life <= 0) continue;
        s.life -= dt;
        if (s.life <= 0) { s.mesh.setEnabled(false); continue; }
        s.vel.y -= 14 * dt;
        s.vel.scaleAndAddToRef(dt, s.mesh.position);
        this.tmp.copyFrom(s.mesh.position).addInPlace(s.vel);
        s.mesh.lookAt(this.tmp);
        const k = s.life / s.max;
        s.mesh.scaling.set(1, 1, 0.15 + s.vel.length() * 0.035 * k);
      }
    }
    for (const f of this.flashes.items) {
      if (f.life <= 0) continue;
      f.life -= dt;
      if (f.life <= 0) { f.mesh.setEnabled(false); continue; }
      const k = 1 - f.life / f.max;
      const s = f.size * (0.6 + k * 0.8);
      f.mesh.scaling.set(s, s, s);
      f.mesh.rotation.z = f.spin;
      f.mesh.visibility = 1 - k * k;
    }
    for (const r of this.rings.items) {
      if (r.life <= 0) continue;
      r.life -= dt;
      if (r.life <= 0) { r.mesh.setEnabled(false); continue; }
      const k = 1 - r.life / r.max;
      const s = r.implode ? r.size * (1 - 0.9 * k * k) : r.size * (0.2 + 0.8 * Math.sqrt(k));
      r.mesh.scaling.set(s, 1, s);
      r.mesh.visibility = 1 - k;
    }
    for (const c of this.crescents.items) {
      if (c.life <= 0) continue;
      c.life -= dt;
      if (c.life <= 0) { c.mesh.setEnabled(false); continue; }
      c.vel.scaleAndAddToRef(dt, c.mesh.position);
      c.mesh.visibility = clamp01(c.life / c.max * 2);
    }
    for (const t of this.threads.items) {
      if (t.life <= 0) continue;
      t.life -= dt;
      if (t.life <= 0) { t.mesh.setEnabled(false); continue; }
      if (t.follow) { const f = t.follow.from(), to = t.follow.to(); t.from.set(f.x, f.y, f.z); t.to.set(to.x, to.y, to.z); }
      const len = B().Vector3.Distance(t.from, t.to);
      t.mesh.position.set((t.from.x + t.to.x) / 2, (t.from.y + t.to.y) / 2, (t.from.z + t.to.z) / 2);
      t.mesh.lookAt(t.to);
      t.mesh.scaling.set(1, 1, Math.max(0.01, len));
      t.mesh.visibility = Math.min(1, t.life / t.max * 3);
    }
    for (const p of this.pillars.items) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.mesh.setEnabled(false); continue; }
      const k = 1 - p.life / p.max;
      const rise = k < 0.12 ? k / 0.12 : k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1; // erupt, hold, sink
      const h = Math.max(0.05, p.height * rise);
      p.mesh.scaling.set(1, h, 1);
      p.mesh.position.y = h / 2;
    }
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.life -= dt;
      const v = Math.max(0, g.life / g.max);
      for (const p of g.parts) p.visibility = v;
      if (g.life <= 0) { for (const p of g.parts) p.dispose(false, false); this.ghosts.splice(i, 1); }
    }

    // Project damage numbers into CSS pixels.
    const BB = B();
    const w = engine.getRenderWidth(), h = engine.getRenderHeight();
    const cw = this.overlay.clientWidth || w, ch = this.overlay.clientHeight || h;
    const vp = camera.viewport.toGlobalToRef(w, h, this.viewport);
    const tm = this.scene.getTransformMatrix();
    for (const n of this.numbers.items) {
      if (n.life <= 0) continue;
      n.life -= dt;
      if (n.life <= 0) { n.el.className = "dmg"; n.el.style.opacity = "0"; continue; }
      n.pos.y += n.vy * dt; n.vy *= 0.92;
      const p = BB.Vector3.ProjectToRef(n.pos, BB.Matrix.IdentityReadOnly, tm, vp, this.projected);
      if (p.z < 0 || p.z > 1) { n.el.style.opacity = "0"; continue; }
      n.el.style.transform = `translate(${(p.x / w) * cw}px, ${(p.y / h) * ch}px) translate(-50%, -50%)`;
      n.el.style.opacity = String(clamp01(n.life / n.max * 2.5));
    }
  }
}
