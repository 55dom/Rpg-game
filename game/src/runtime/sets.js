// Story sets (Phase 3): each one is built on first use from primitives, carries its own sky, fog,
// and lighting, and can be swapped in and out. "yard" is the original training yard (arena.js).

import { AURELIN_LAYOUT } from "../data/zones.js";
import { B, toon, glow, inkOutline, color3, setToonEnvironment, TOON_SCENE } from "./look.js";

const mulberry = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/** A soft round sprite for fire, smoke, and motes. */
function softTexture(scene) {
  const BB = B();
  const tex = new BB.DynamicTexture("soft", { width: 64, height: 64 }, scene, false);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,0.6)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  tex.update(); tex.hasAlpha = true;
  return tex;
}

const NIGHT = { clear: "#141a2e", fog: "#1e2640", fogDensity: 0.016, hemi: [0.45, "#a9b8ff", "#2a2040"], sun: [0.5, "#c8d4ff", [0.3, -1, 0.3]] };
const NIGHT_TOON = { sky: [0.86, 0.88, 1.02], ground: [0.66, 0.66, 0.82], rim: [0.8, 0.9, 1.1] };

export class Sets {
  constructor(scene, arena, { mobile = false } = {}) {
    this.scene = scene;
    this.arena = arena;
    this.mobile = mobile;
    this.built = new Map();
    this.current = "yard";
    this.lights = { hemi: scene.getLightByName("hemi"), sun: scene.getLightByName("moon"), warm: scene.getLightByName("yardLight") };
  }

  /** Switch to a set by name ("yard", "towerSteps", "towerHall", "larkspur"). */
  use(name = "yard") {
    if (name === this.current) return this.get(name);
    if (this.current === "yard") this.arena.setVisible(false); else this.built.get(this.current)?.show(false);
    this.current = name;
    if (name === "yard") { this.arena.setVisible(true); this._env(this.arena.env, TOON_SCENE); return null; }
    const set = this.get(name);
    set.show(true);
    this._env(set.env, set.toon);
    if (set.night != null || name === "lighthouse") set.onNight = (k) => this._blendNight(set, k);
    return set;
  }

  get(name) {
    if (name === "yard") return null;
    let s = this.built.get(name);
    if (!s) {
      const make = { towerSteps: buildTowerSteps, towerHall: buildTowerHall, larkspur: buildLarkspur, examGrounds: buildExamGrounds, lighthouse: buildLighthouse, fens: buildFens, aurelin: buildAurelin }[name];
      if (!make) throw new Error(`no set "${name}"`);
      s = make(this.scene, this.mobile);
      s.show(false);
      this.built.set(name, s);
    }
    return s;
  }

  _env(e, toonEnv) {
    this.envNow = { e, toonEnv };
    const BB = B(), sc = this.scene, L = this.lights;
    sc.clearColor = BB.Color4.FromHexString(e.clear + "ff");
    sc.fogColor = color3(e.fog).clone(); sc.fogDensity = e.fogDensity;
    if (L.hemi) { L.hemi.intensity = e.hemi[0]; L.hemi.diffuse = color3(e.hemi[1]).clone(); L.hemi.groundColor = color3(e.hemi[2]).clone(); }
    if (L.sun) { L.sun.intensity = e.sun[0]; L.sun.diffuse = color3(e.sun[1]).clone(); L.sun.direction = new BB.Vector3(...e.sun[2]); }
    if (L.warm) L.warm.intensity = e.warm ?? 0;
    setToonEnvironment(toonEnv);
  }

  /** Lighthouse dusk → night: blend sky, fog, lights, and the character lighting. */
  _blendNight(set, k) {
    const mix = (a, b) => { const A = color3(a), Bc = color3(b); return `#${[A.r + (Bc.r - A.r) * k, A.g + (Bc.g - A.g) * k, A.b + (Bc.b - A.b) * k].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`; };
    const D = set.env, N = NIGHT;
    const e = { clear: mix(D.clear, N.clear), fog: mix(D.fog, N.fog), fogDensity: D.fogDensity + (N.fogDensity - D.fogDensity) * k,
      hemi: [D.hemi[0] + (N.hemi[0] - D.hemi[0]) * k, mix(D.hemi[1], N.hemi[1]), mix(D.hemi[2], N.hemi[2])],
      sun: [D.sun[0] + (N.sun[0] - D.sun[0]) * k, mix(D.sun[1], N.sun[1]), D.sun[2]], warm: 0 };
    const t = set.toon, nt = NIGHT_TOON, lerp3 = (a, b) => a.map((v, i) => v + (b[i] - v) * k);
    this._env(e, { lightDir: t.lightDir, fogColor: e.fog, fogDensity: t.fogDensity, sky: lerp3(t.sky, nt.sky), ground: lerp3(t.ground, nt.ground), rim: lerp3(t.rim, nt.rim) });
  }

  /** Hask's bog: the yard has one built in; other sets may provide their own. */
  setBog(on, instant = false) {
    if (this.current === "yard") this.arena.setBog(on, instant); else this.built.get(this.current)?.setBog?.(on, instant);
  }

  /** Per-frame animation for the active set. */
  update(dt, t) { if (this.current !== "yard") this.built.get(this.current)?.update(dt, t); }

  /** Set-specific moments a script can call ("dark", "light"…). */
  cue(name) { if (this.current !== "yard") this.built.get(this.current)?.cue?.(name); }
}

/** Helper: collect meshes for a set so show() can toggle them all. */
function kit(scene) {
  const BB = B();
  const root = new BB.TransformNode(`set-${Math.random().toString(36).slice(2, 7)}`, scene);
  const systems = [], lights = [];
  const add = (m, outline = 0) => { m.parent = root; m.isPickable = false; if (outline) inkOutline(m, outline); return m; };
  const glowLayer = scene.effectLayers?.find((l) => l.name === "glow");
  /** Big translucent shapes (light shafts) must stay out of the glow layer or they bloom over everything. */
  const noGlow = (m) => { glowLayer?.addExcludedMesh(m); return m; };
  return {
    root, add, noGlow, systems, lights,
    show(on) {
      root.setEnabled(on);
      for (const p of systems) { if (on) p.start(); else p.stop(); }
      for (const l of lights) l.setEnabled(on);
    },
  };
}

// ---- The Tower of Choosing: outside, early morning ----------------------------------------
function buildTowerSteps(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const stone = toon(scene, "ts-stone", "#a99f8c"), stoneDark = toon(scene, "ts-stoneDark", "#857b68");
  const tower = toon(scene, "ts-tower", "#e2d8c4"), gold = toon(scene, "ts-gold", "#d9ae4f");
  const plaza = add(MB.CreateCylinder("ts-plaza", { diameter: 46, height: 0.6, tessellation: 48 }, scene)); plaza.position.y = -0.3; plaza.material = stone;
  for (const d of [12, 22, 32]) {
    const r = add(MB.CreateTorus("ts-ring", { diameter: d, thickness: 0.08, tessellation: 64 }, scene)); r.position.y = 0.01; r.material = stoneDark;
  }
  // Grand stairs rising toward the tower door.
  for (let i = 0; i < 9; i++) {
    const st = add(MB.CreateBox("ts-step", { width: 14 - i * 0.4, height: 0.32, depth: 1 }, scene), 0.03);
    st.position.set(0, 0.16 + i * 0.32, 8 + i * 0.95); st.material = i % 2 ? stone : stoneDark;
    st.scaling.y = 1 + i; st.position.y = (0.32 * (1 + i)) / 2;
  }
  // The tower: a huge banded drum with a gold-framed door.
  const drum = add(MB.CreateCylinder("ts-tower", { diameter: 22, height: 70, tessellation: 40, cap: BB.Mesh.NO_CAP }, scene), 0.08);
  drum.position.set(0, 33, 28); drum.material = tower;
  for (const h of [4, 14, 26, 40]) {
    const band = add(MB.CreateTorus("ts-band", { diameter: 22.4, thickness: 0.6, tessellation: 40 }, scene)); band.position.set(0, h, 28); band.material = gold;
  }
  const door = add(MB.CreateBox("ts-door", { width: 5, height: 8, depth: 0.6 }, scene), 0.05); door.position.set(0, 7, 17.2); door.material = toon(scene, "ts-doorMat", "#3a2a22");
  const frame = add(MB.CreateTorus("ts-arch", { diameter: 5.4, thickness: 0.35, tessellation: 24, arc: 0.5 }, scene));
  frame.position.set(0, 11, 17); frame.rotation.x = -Math.PI / 2; frame.material = glow(scene, "ts-archGlow", "#ffd27a", 0.95);
  // Banners on poles flanking the stairs (Crown blue and gold).
  for (const [bi, x] of [-8.5, -5, 5, 8.5].entries()) {
    const pole = add(MB.CreateCylinder("ts-pole", { height: 9, diameter: 0.18, tessellation: 6 }, scene)); pole.position.set(x, 4.5, 7); pole.material = stoneDark;
    const ban = add(MB.CreateBox("ts-banner", { width: 1.4, height: 4, depth: 0.05 }, scene), 0.03); ban.position.set(x, 6.4, 7.1); ban.material = toon(scene, `ts-ban${bi}`, bi % 2 ? "#d9ae4f" : "#2b4f8f");
  }
  // Clouds and hills.
  const cloud = toon(scene, "ts-cloud", "#f7f6ff");
  const rng = mulberry(7);
  for (let i = 0; i < (mobile ? 8 : 14); i++) {
    const c = add(MB.CreateSphere("ts-cloud", { diameter: 8, segments: 8 }, scene));
    const a = rng() * Math.PI * 2;
    c.position.set(Math.sin(a) * 70, 22 + rng() * 14, Math.cos(a) * 70); c.scaling.set(2 + rng() * 2, 0.5, 1.2); c.material = cloud;
  }
  const hill = toon(scene, "ts-hill", "#7ea37a");
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const h = add(MB.CreateSphere("ts-hill", { diameter: 30, segments: 10 }, scene)); h.position.set(Math.sin(a) * 75, -6, Math.cos(a) * 75); h.scaling.y = 0.45; h.material = hill;
  }
  // Waiting candidates in the background: simple figures in plain clothes.
  const cols = ["#7c5a46", "#4f6a8c", "#8c4f5a", "#5f7d4e", "#9a8256", "#6b5a8a"];
  for (let i = 0; i < (mobile ? 10 : 18); i++) {
    const a = -0.5 + rng() * 4.2, r = 9 + rng() * 6;
    const x = Math.cos(a) * r * 1.2, z = -Math.sin(a) * r * 0.6 + 2;
    if (Math.abs(x) < 4 && z > -6) continue; // keep the middle clear for the cast
    const b = add(MB.CreateCylinder("ts-kid", { height: 1.3, diameterTop: 0.45, diameterBottom: 0.75, tessellation: 8 }, scene), 0.025);
    b.position.set(x, 0.65, z); b.material = toon(scene, `ts-kid${i}`, cols[i % cols.length]);
    const hd = add(MB.CreateSphere("ts-kidHead", { diameter: 0.42, segments: 8 }, scene), 0.02);
    hd.position.set(x, 1.5, z); hd.material = toon(scene, `ts-kh${i}`, i % 3 ? "#3a2a22" : "#c9a26a");
  }
  const env = { clear: "#9ec4ee", fog: "#b8d2f0", fogDensity: 0.009, hemi: [0.7, "#fff6e6", "#7a86a8"], sun: [0.95, "#fff1d0", [-0.5, -1, 0.6]], warm: 0 };
  const toonEnv = { lightDir: [0.5, 1, -0.6], fogColor: "#b8d2f0", fogDensity: 0.006, sky: [1.1, 1.08, 1.04], ground: [0.9, 0.88, 0.92] };
  return { env, toon: toonEnv, show: K.show, update() {} };
}

// ---- The Tower of Choosing: the hall of grimoires ---------------------------------------------
function buildTowerHall(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const marble = toon(scene, "th-marble", "#5a5068"), marbleDark = toon(scene, "th-marbleDark", "#3a3448");
  const gold = toon(scene, "th-gold", "#d9ae4f");
  const floor = add(MB.CreateCylinder("th-floor", { diameter: 40, height: 0.6, tessellation: 56 }, scene)); floor.position.y = -0.3; floor.material = marble;
  const inlay = glow(scene, "th-inlay", "#8a6424", 0.75);
  for (const [d, t] of [[8, 0.07], [16, 0.09], [26, 0.07], [34, 0.06]]) {
    const r = add(MB.CreateTorus("th-ring", { diameter: d, thickness: t, tessellation: 64 }, scene)); r.position.y = 0.012; r.material = inlay;
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const sp = add(MB.CreateBox("th-spoke", { width: 0.05, height: 0.01, depth: 9 }, scene)); sp.position.set(Math.sin(a) * 8.5, 0.012, Math.cos(a) * 8.5); sp.rotation.y = a; sp.material = inlay;
  }
  // Walls (seen from inside), a ring of pillars, and a domed ceiling.
  const wall = add(MB.CreateCylinder("th-wall", { diameter: 42, height: 24, tessellation: 48, cap: BB.Mesh.NO_CAP, sideOrientation: BB.Mesh.BACKSIDE }, scene)); // no caps: a floor-level cap would z-fight the floor
  wall.position.y = 12; wall.material = toon(scene, "th-wallMat", "#2c2640");
  const dome = add(MB.CreateSphere("th-dome", { diameter: 42, segments: 24, slice: 0.5, sideOrientation: BB.Mesh.BACKSIDE }, scene));
  dome.position.y = 24; dome.material = toon(scene, "th-domeMat", "#221d33");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const x = Math.sin(a) * 18.6, z = Math.cos(a) * 18.6;
    const p = add(MB.CreateCylinder("th-pillar", { height: 22, diameter: 1.3, tessellation: 10 }, scene), 0.05); p.position.set(x, 11, z); p.material = marbleDark;
    const cap = add(MB.CreateBox("th-cap", { width: 1.8, height: 0.5, depth: 1.8 }, scene), 0.04); cap.position.set(x, 21.5, z); cap.rotation.y = a; cap.material = gold;
  }
  // Stained-glass windows high on the walls, and soft light shafts falling from them.
  const glassCols = ["#ffcf6a", "#6fd6c0", "#ff8aa8", "#a98cff"];
  const windows = [];
  const shaftMat = glow(scene, "th-shaft", "#ffe6b0", 0.05, true);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 20.6, z = Math.cos(a) * 20.6;
    const w = add(MB.CreatePlane("th-window", { width: 3.2, height: 8, sideOrientation: BB.Mesh.DOUBLESIDE }, scene));
    w.position.set(x, 13, z); w.rotation.y = a; const m = glow(scene, `th-glass${i}`, glassCols[i % 4], 0.95); w.material = m;
    m.baseColor = color3(glassCols[i % 4]).clone(); windows.push(m);
    const arch = add(MB.CreateTorus("th-warch", { diameter: 3.2, thickness: 0.25, tessellation: 20, arc: 0.5 }, scene)); arch.position.set(x * 0.995, 17, z * 0.995); arch.rotation.set(-Math.PI / 2, a, 0); arch.material = gold;
    if (i % 2 === 0) {
      const sh = add(MB.CreateCylinder("th-shaftBeam", { height: 24, diameterTop: 3, diameterBottom: 6, tessellation: 12 }, scene));
      sh.position.set(x * 0.55, 8, z * 0.55); sh.rotation.set(0, 0, 0);
      const dir = new BB.Vector3(-x, -14, -z).normalize();
      sh.rotationQuaternion = BB.Quaternion.FromUnitVectorsToRef(new BB.Vector3(0, -1, 0), dir, new BB.Quaternion());
      sh.material = shaftMat; K.noGlow(sh);
    }
  }
  // The dais where grimoires descend, with a column of light.
  for (const [d, h] of [[7, 0.5], [5, 0.9]]) {
    const s = add(MB.CreateCylinder("th-dais", { diameter: d, height: h, tessellation: 32 }, scene), 0.04); s.position.set(0, h / 2, 9); s.material = d > 6 ? marbleDark : gold;
  }
  const column = K.noGlow(add(MB.CreateCylinder("th-column", { height: 30, diameter: 2.2, tessellation: 20 }, scene))); column.position.set(0, 15, 9);
  const columnMat = glow(scene, "th-columnMat", "#fff0c4", 0.16, true); column.material = columnMat;
  // Grimoires drifting in the light, waiting for their owners.
  const books = [];
  const cover = ["#6a2f2f", "#2f4a6a", "#3f6a3a", "#5a3f6a", "#6a5a2f"];
  const pageMat = glow(scene, "th-pages", "#fff2cf");
  const rng = mulberry(11);
  for (let i = 0; i < (mobile ? 14 : 26); i++) {
    const b = new BB.TransformNode("th-book", scene); b.parent = K.root;
    const c = add(MB.CreateBox("th-cover", { width: 0.5, height: 0.66, depth: 0.12 }, scene), 0.02); c.parent = b; c.material = toon(scene, `th-cov${i % 5}`, cover[i % 5]);
    const pg = add(MB.CreateBox("th-page", { width: 0.44, height: 0.6, depth: 0.1 }, scene)); pg.parent = b; pg.position.x = 0.04; pg.material = pageMat;
    books.push({ node: b, r: 3 + rng() * 12, a: rng() * Math.PI * 2, h: 4 + rng() * 9, speed: 0.04 + rng() * 0.08, bob: rng() * 6 });
  }
  const motes = new BB.ParticleSystem("th-motes", mobile ? 60 : 140, scene);
  motes.particleTexture = softTexture(scene);
  motes.emitter = new BB.Vector3(0, 6, 4); motes.minEmitBox = new BB.Vector3(-14, -5, -12); motes.maxEmitBox = new BB.Vector3(14, 8, 12);
  motes.color1 = new BB.Color4(1, 0.9, 0.6, 0.6); motes.color2 = new BB.Color4(0.8, 0.9, 1, 0.4); motes.colorDead = new BB.Color4(1, 1, 1, 0);
  motes.minSize = 0.05; motes.maxSize = 0.14; motes.minLifeTime = 4; motes.maxLifeTime = 8; motes.emitRate = mobile ? 10 : 22;
  motes.gravity = new BB.Vector3(0, 0.05, 0); motes.direction1 = new BB.Vector3(-0.1, 0.1, -0.1); motes.direction2 = new BB.Vector3(0.1, 0.25, 0.1);
  motes.minEmitPower = 0.1; motes.maxEmitPower = 0.3; motes.blendMode = BB.ParticleSystem.BLENDMODE_ADD;
  K.systems.push(motes);
  let dark = 0, darkTarget = 0;
  const env = { clear: "#14111f", fog: "#1d1830", fogDensity: 0.014, hemi: [0.55, "#c8bcff", "#2a1f3a"], sun: [0.6, "#ffe2b0", [-0.2, -1, 0.3]], warm: 0.3 };
  const toonEnv = { lightDir: [0.25, 1, -0.4], fogColor: "#1d1830", fogDensity: 0.012, sky: [1.04, 1.0, 1.1], ground: [0.82, 0.78, 0.96] };
  return {
    env, toon: toonEnv,
    show(on) { K.show(on); if (on) dark = darkTarget = 0; }, // every visit starts in daylight
    cue(name) { if (name === "dark") darkTarget = 1; if (name === "light") darkTarget = 0; },
    update(dt, t) {
      for (const b of books) {
        b.a += b.speed * dt;
        b.node.position.set(Math.sin(b.a) * b.r, b.h + Math.sin(t * 0.8 + b.bob) * 0.35, Math.cos(b.a) * b.r);
        b.node.rotation.set(Math.sin(t + b.bob) * 0.2, b.a + Math.PI / 2, 0.15);
      }
      dark += (darkTarget - dark) * Math.min(1, dt * 1.5);
      for (const m of windows) m.emissiveColor.copyFrom(m.baseColor).scaleInPlace(1 - dark * 0.8).addInPlaceFromFloats(dark * 0.35, 0, 0);
      columnMat.alpha = 0.16 * (1 - dark * 0.7) + Math.sin(t * 2) * 0.02;
    },
  };
}

// ---- Larkspur, fifteen years ago: a village on fire at night ------------------------------------
function buildLarkspur(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const ground = add(MB.CreateCylinder("lk-ground", { diameter: 70, height: 0.6, tessellation: 40 }, scene)); ground.position.y = -0.3; ground.material = toon(scene, "lk-ground", "#2a201c");
  const path = add(MB.CreateBox("lk-path", { width: 3, height: 0.02, depth: 40 }, scene)); path.position.set(0, 0.01, 6); path.material = toon(scene, "lk-path", "#3d2e26");
  const wallMat = toon(scene, "lk-wall", "#2e231d"), roofMat = toon(scene, "lk-roof", "#1a1210");
  const windowMat = glow(scene, "lk-window", "#ff9a3a");
  const tex = softTexture(scene);
  const fires = [];
  const houses = [[-5.5, 4, 0.3], [5.2, 6, -0.4], [-6.5, 12, 0.1], [6, 14, 0.5], [-3.5, 20, -0.2], [4, 22, 0.2], [0, 28, 0]];
  houses.forEach(([x, z, rot], i) => {
    const h = add(MB.CreateBox("lk-house", { width: 4, height: 3, depth: 3.2 }, scene), 0.04); h.position.set(x, 1.5, z); h.rotation.y = rot; h.material = wallMat;
    const r = add(MB.CreateCylinder("lk-roofP", { height: 4.4, diameter: 3.6, tessellation: 3 }, scene), 0.04);
    r.position.set(x, 3.6, z); r.rotation.set(0, rot, Math.PI / 2); r.scaling.set(1, 1, 0.8); r.material = roofMat;
    const w = add(MB.CreatePlane("lk-win", { width: 0.9, height: 0.8 }, scene)); w.position.set(x + Math.sin(rot) * -1.62, 1.6, z - Math.cos(rot) * 1.62); w.rotation.y = rot; w.material = windowMat;
    if (i === 6 || (mobile && i % 2)) return;
    const fire = new BB.ParticleSystem(`lk-fire${i}`, mobile ? 70 : 140, scene);
    fire.particleTexture = tex; fire.emitter = new BB.Vector3(x, 3.4, z);
    fire.minEmitBox = new BB.Vector3(-1.6, -0.3, -1.2); fire.maxEmitBox = new BB.Vector3(1.6, 0.4, 1.2);
    fire.color1 = new BB.Color4(1, 0.62, 0.2, 1); fire.color2 = new BB.Color4(1, 0.32, 0.1, 1); fire.colorDead = new BB.Color4(0.2, 0.05, 0.05, 0);
    fire.minSize = 0.6; fire.maxSize = 1.8; fire.minLifeTime = 0.4; fire.maxLifeTime = 1.1; fire.emitRate = mobile ? 60 : 120;
    fire.blendMode = BB.ParticleSystem.BLENDMODE_ADD; fire.gravity = new BB.Vector3(0, 4, 0);
    fire.direction1 = new BB.Vector3(-0.3, 1, -0.3); fire.direction2 = new BB.Vector3(0.3, 2, 0.3); fire.minEmitPower = 0.5; fire.maxEmitPower = 1.5;
    K.systems.push(fire);
    const smoke = new BB.ParticleSystem(`lk-smoke${i}`, mobile ? 25 : 50, scene);
    smoke.particleTexture = tex; smoke.emitter = new BB.Vector3(x, 5, z);
    smoke.color1 = new BB.Color4(0.12, 0.08, 0.08, 0.55); smoke.color2 = new BB.Color4(0.2, 0.12, 0.1, 0.4); smoke.colorDead = new BB.Color4(0, 0, 0, 0);
    smoke.minSize = 2; smoke.maxSize = 4.5; smoke.minLifeTime = 2.5; smoke.maxLifeTime = 4.5; smoke.emitRate = mobile ? 6 : 12;
    smoke.blendMode = BB.ParticleSystem.BLENDMODE_STANDARD; smoke.gravity = new BB.Vector3(0.3, 1.2, 0);
    smoke.direction1 = new BB.Vector3(-0.2, 1, -0.2); smoke.direction2 = new BB.Vector3(0.4, 1.5, 0.2); smoke.minEmitPower = 0.3; smoke.maxEmitPower = 0.8;
    K.systems.push(smoke);
    const light = new BB.PointLight(`lk-light${i}`, new BB.Vector3(x, 3, z), scene);
    light.diffuse = color3("#ff7a2a").clone(); light.intensity = 0.9; light.range = 14;
    K.lights.push(light); fires.push({ light, phase: i * 1.7 });
  });
  const embers = new BB.ParticleSystem("lk-embers", mobile ? 80 : 180, scene);
  embers.particleTexture = tex; embers.emitter = new BB.Vector3(0, 1, 12);
  embers.minEmitBox = new BB.Vector3(-9, 0, -10); embers.maxEmitBox = new BB.Vector3(9, 3, 12);
  embers.color1 = new BB.Color4(1, 0.7, 0.3, 1); embers.color2 = new BB.Color4(1, 0.4, 0.1, 1); embers.colorDead = new BB.Color4(1, 0.2, 0, 0);
  embers.minSize = 0.05; embers.maxSize = 0.14; embers.minLifeTime = 2; embers.maxLifeTime = 4; embers.emitRate = mobile ? 30 : 60;
  embers.blendMode = BB.ParticleSystem.BLENDMODE_ADD; embers.gravity = new BB.Vector3(0.2, 1.4, 0);
  embers.direction1 = new BB.Vector3(-0.5, 1, -0.5); embers.direction2 = new BB.Vector3(0.5, 2, 0.5); embers.minEmitPower = 0.3; embers.maxEmitPower = 1;
  K.systems.push(embers);
  const env = { clear: "#0b0507", fog: "#2a120c", fogDensity: 0.028, hemi: [0.35, "#ff9a6a", "#1a0a0a"], sun: [0.25, "#ff8a4a", [0, -0.6, -1]], warm: 0 };
  const toonEnv = { lightDir: [0.1, 0.5, 1], fogColor: "#2a120c", fogDensity: 0.02, sky: [0.62, 0.42, 0.4], ground: [0.7, 0.38, 0.3], rim: [2.2, 1.15, 0.45] };
  return {
    env, toon: toonEnv, show: K.show,
    update(dt, t) { for (const f of fires) f.light.intensity = 0.8 + Math.sin(t * 13 + f.phase) * 0.15 + Math.sin(t * 7.3 + f.phase) * 0.1; },
  };
}

// ---- The Knight Exam grounds: an arena under open sky, full stands, the captains' box ---------
export const EXAM_BOX = { y: 2.4, z: 21 }; // the captains watch from here
function buildExamGrounds(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const sand = toon(scene, "eg-sand", "#b38f62"), sandDark = toon(scene, "eg-sandDark", "#a8875a");
  const stone = toon(scene, "eg-stone", "#8f8a80"), wood = toon(scene, "eg-wood", "#6b4a32"), gold = toon(scene, "eg-gold", "#d9ae4f");
  const floor = add(MB.CreateCylinder("eg-floor", { diameter: 38, height: 0.6, tessellation: 56 }, scene)); floor.position.y = -0.3; floor.material = sand;
  for (const d of [10, 24]) { const r = add(MB.CreateTorus("eg-line", { diameter: d, thickness: 0.1, tessellation: 64 }, scene)); r.position.y = 0.01; r.material = sandDark; }
  const center = add(MB.CreateBox("eg-mid", { width: 0.12, height: 0.01, depth: 24 }, scene)); center.position.y = 0.012; center.rotation.y = Math.PI / 2; center.material = sandDark;
  // A low wall, then three tiers of stands rising behind it.
  const wall = add(MB.CreateCylinder("eg-wall", { diameter: 39.4, height: 1.4, tessellation: 56, cap: BB.Mesh.NO_CAP, sideOrientation: BB.Mesh.DOUBLESIDE }, scene), 0.04);
  wall.position.y = 0.7; wall.material = stone;
  const cols = ["#c0504d", "#4f81bd", "#9bbb59", "#e6b54e", "#8064a2", "#4bacc6", "#f79646", "#d8d2c4"];
  const rng = mulberry(23);
  const crowdMats = cols.map((c, i) => toon(scene, `eg-crowd${i}`, c));
  const headMat = toon(scene, "eg-head", "#3a2a22"), headMat2 = toon(scene, "eg-head2", "#c9a26a");
  const fans = [];
  for (let tier = 0; tier < 3; tier++) {
    const r = 21 + tier * 2.4, h = 1 + tier * 1.3;
    const step = add(MB.CreateCylinder("eg-tier", { diameter: r * 2 + 2.4, height: h, tessellation: 56, cap: BB.Mesh.NO_CAP, sideOrientation: BB.Mesh.DOUBLESIDE }, scene));
    step.position.y = h / 2; step.material = tier % 2 ? stone : toon(scene, `eg-tierMat${tier}`, "#a39d92");
    const seat = add(MB.CreateTorus("eg-seat", { diameter: r * 2 + 1.2, thickness: 2.4, tessellation: 56 }, scene)); seat.position.y = h - 1; seat.scaling.y = 0.2; seat.material = stone;
    const n = mobile ? 34 : 60;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rng() * 0.05;
      if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.35) continue; // the captains' box
      const x = Math.sin(a) * (r + 0.6), z = Math.cos(a) * (r + 0.6);
      const b = add(MB.CreateCylinder("eg-fan", { height: 0.8, diameterTop: 0.35, diameterBottom: 0.55, tessellation: 6 }, scene));
      b.position.set(x, h - 0.2, z); b.material = crowdMats[(i + tier * 3) % crowdMats.length];
      const hd = add(MB.CreateSphere("eg-fanHead", { diameter: 0.34, segments: 6 }, scene));
      hd.position.set(x, h + 0.35, z); hd.material = i % 3 ? headMat : headMat2;
      fans.push({ b, hd, base: h, phase: rng() * 6 });
    }
  }
  // The captains' box: a raised platform with a canopy, seven squad banners above it.
  const box = add(MB.CreateBox("eg-box", { width: 12, height: EXAM_BOX.y, depth: 4 }, scene), 0.05); box.position.set(0, EXAM_BOX.y / 2, EXAM_BOX.z); box.material = stone;
  const rail = add(MB.CreateBox("eg-rail", { width: 12, height: 0.5, depth: 0.2 }, scene), 0.03); rail.position.set(0, EXAM_BOX.y + 0.25, EXAM_BOX.z - 1.9); rail.material = wood;
  const canopy = add(MB.CreateBox("eg-canopy", { width: 13, height: 0.3, depth: 5 }, scene), 0.05); canopy.position.set(0, EXAM_BOX.y + 4, EXAM_BOX.z + 0.3); canopy.material = toon(scene, "eg-canopyMat", "#2b4f8f");
  for (const x of [-6, 6]) { const p = add(MB.CreateCylinder("eg-post", { height: 4, diameter: 0.3, tessellation: 8 }, scene), 0.03); p.position.set(x, EXAM_BOX.y + 2, EXAM_BOX.z - 1.9); p.material = gold; }
  const squads = ["#f2b84a", "#f2efe6", "#6b7280", "#5f9e5a", "#2a2a34", "#2f6b5a", "#a3262a"]; // Lanterns, Lances, Wardens, Verdant, Quill, Riders, Bell
  squads.forEach((c, i) => {
    const x = (i - 3) * 1.8;
    const ban = add(MB.CreateBox("eg-ban", { width: 1.1, height: 2.6, depth: 0.05 }, scene), 0.03);
    ban.position.set(x, EXAM_BOX.y + 2.2, EXAM_BOX.z + 2.6); ban.material = toon(scene, `eg-ban${i}`, c);
  });
  // Distant hills and puffy clouds.
  const hill = toon(scene, "eg-hill", "#7ea37a");
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const h = add(MB.CreateSphere("eg-hill", { diameter: 34, segments: 10 }, scene)); h.position.set(Math.sin(a) * 80, -8, Math.cos(a) * 80); h.scaling.y = 0.45; h.material = hill; }
  const cloud = toon(scene, "eg-cloud", "#f7f6ff");
  for (let i = 0; i < (mobile ? 6 : 10); i++) { const a = rng() * Math.PI * 2; const c = add(MB.CreateSphere("eg-cloud", { diameter: 9, segments: 8 }, scene)); c.position.set(Math.sin(a) * 75, 26 + rng() * 10, Math.cos(a) * 75); c.scaling.set(2.2, 0.5, 1.2); c.material = cloud; }
  let cheer = 0;
  const env = { clear: "#9ec4ee", fog: "#b8d2f0", fogDensity: 0.008, hemi: [0.7, "#fff6e6", "#7a86a8"], sun: [0.95, "#fff1d0", [-0.4, -1, 0.5]], warm: 0 };
  const toonEnv = { lightDir: [0.4, 1, -0.5], fogColor: "#b8d2f0", fogDensity: 0.005, sky: [1.1, 1.08, 1.04], ground: [0.9, 0.86, 0.84] };
  return {
    env, toon: toonEnv, show: K.show,
    cue(name) { if (name === "cheer") cheer = 2.5; },
    update(dt, t) {
      cheer = Math.max(0, cheer - dt);
      const amp = 0.05 + cheer * 0.12;
      for (const f of fans) { const y = Math.max(0, Math.sin(t * (cheer ? 9 : 2) + f.phase)) * amp; f.b.position.y = f.base - 0.2 + y; f.hd.position.y = f.base + 0.35 + y; }
    },
  };
}

// ---- The Lantern Lighthouse: HQ on the dry Sea of Marrow, at dusk (and later, night) ---------
export const LIGHTHOUSE = { table: { x: 5, z: 6 }, ring: { x: 0, z: -4 }, lanterns: { x: 2.5, z: 12.4 }, door: { x: -4, z: 10.4 } };
function buildLighthouse(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const rng = mulberry(31);
  const seabed = add(MB.CreateCylinder("lh-seabed", { diameter: 160, height: 0.6, tessellation: 48 }, scene)); seabed.position.y = -0.5; seabed.material = toon(scene, "lh-seabed", "#b8875a");
  const crackMat = toon(scene, "lh-crack", "#7a5434");
  for (let i = 0; i < (mobile ? 30 : 60); i++) {
    const a = rng() * Math.PI * 2, r = 20 + rng() * 45;
    const c = add(MB.CreateBox("lh-crack", { width: 0.12, height: 0.02, depth: 2 + rng() * 5 }, scene));
    c.position.set(Math.sin(a) * r, -0.19, Math.cos(a) * r); c.rotation.y = rng() * Math.PI; c.material = crackMat;
  }
  // The plateau the squad lives on, paved and a little raised above the old seabed.
  const plateau = add(MB.CreateCylinder("lh-plateau", { diameter: 38, height: 1.2, tessellation: 48 }, scene), 0.05); plateau.position.y = -0.6; plateau.material = toon(scene, "lh-plateau", "#8e8579");
  const paving = toon(scene, "lh-paving", "#a29a8c");
  for (let i = 0; i < 26; i++) { const a = rng() * Math.PI * 2, r = rng() * 15; const t = add(MB.CreateBox("lh-tile", { width: 1.4, height: 0.02, depth: 1.4 }, scene)); t.position.set(Math.sin(a) * r, 0.01, Math.cos(a) * r); t.rotation.y = rng(); t.material = paving; }
  // The lighthouse: white with red bands, a glowing lantern room, a slow sweeping beam.
  const L = { x: -9, z: 9 };
  const tower = add(MB.CreateCylinder("lh-tower", { height: 16, diameterTop: 3.2, diameterBottom: 4.6, tessellation: 20 }, scene), 0.06); tower.position.set(L.x, 8, L.z); tower.material = toon(scene, "lh-white", "#efe8dc");
  const red = toon(scene, "lh-red", "#b8473a");
  for (const h of [3, 7.5, 12]) { const b = add(MB.CreateCylinder("lh-band", { height: 1.2, diameterTop: 4.6 - h * 0.09, diameterBottom: 4.6 - (h - 1.2) * 0.09, tessellation: 20 }, scene)); b.position.set(L.x, h, L.z); b.scaling.setAll(1.02); b.material = red; }
  const gallery = add(MB.CreateCylinder("lh-gallery", { height: 0.4, diameter: 4.4, tessellation: 20 }, scene), 0.04); gallery.position.set(L.x, 16.2, L.z); gallery.material = toon(scene, "lh-dark", "#2a2a33");
  const lampMat = glow(scene, "lh-lamp", "#ffd98a");
  const lamp = add(MB.CreateCylinder("lh-lamp", { height: 2, diameter: 2.4, tessellation: 12 }, scene)); lamp.position.set(L.x, 17.4, L.z); lamp.material = lampMat;
  const cap = add(MB.CreateCylinder("lh-cap", { height: 1.4, diameterTop: 0, diameterBottom: 3.2, tessellation: 12 }, scene), 0.04); cap.position.set(L.x, 19.1, L.z); cap.material = red;
  const beam = K.noGlow(add(MB.CreateCylinder("lh-beam", { height: 40, diameterTop: 7, diameterBottom: 0.8, tessellation: 12 }, scene)));
  beam.setPivotPoint(new BB.Vector3(0, -20, 0)); beam.position.set(L.x, 37.4, L.z); beam.rotation.z = Math.PI / 2 - 0.08;
  const beamMat = glow(scene, "lh-beamMat", "#fff1c4", 0.12, true); beam.material = beamMat;
  // The keeper's house the squad lives in, with its door.
  const house = add(MB.CreateBox("lh-house", { width: 7, height: 4, depth: 5 }, scene), 0.05); house.position.set(-4, 2, 13); house.material = toon(scene, "lh-houseMat", "#d9c7a6");
  const roof = add(MB.CreateCylinder("lh-roof", { height: 7.6, diameter: 5.6, tessellation: 3 }, scene), 0.05); roof.position.set(-4, 4.7, 13); roof.rotation.set(0, 0, Math.PI / 2); roof.scaling.set(1, 1, 0.75); roof.material = toon(scene, "lh-roofMat", "#5a6e8a");
  const door = add(MB.CreateBox("lh-door", { width: 1.3, height: 2.3, depth: 0.15 }, scene), 0.03); door.position.set(-4, 1.15, 10.45); door.material = toon(scene, "lh-doorMat", "#6b4a32");
  const winMat = glow(scene, "lh-window", "#ffcf7a");
  for (const x of [-6.3, -1.7]) { const w = add(MB.CreatePlane("lh-win", { width: 1, height: 1 }, scene)); w.position.set(x, 2.4, 10.47); w.rotation.y = Math.PI; w.material = winMat; }
  const step = add(MB.CreateBox("lh-step", { width: 2, height: 0.22, depth: 0.8 }, scene), 0.03); step.position.set(-4, 0.11, 9.9); step.material = paving;
  // The squad lanterns: one for every Lantern Knight, on a rack by the door.
  const rack = add(MB.CreateBox("lh-rack", { width: 5, height: 0.15, depth: 0.15 }, scene), 0.03); rack.position.set(LIGHTHOUSE.lanterns.x, 2.4, LIGHTHOUSE.lanterns.z); rack.material = toon(scene, "lh-wood", "#6b4a32");
  for (const x of [-2.2, 2.2]) { const p = add(MB.CreateCylinder("lh-rackPost", { height: 2.4, diameter: 0.15, tessellation: 6 }, scene), 0.02); p.position.set(LIGHTHOUSE.lanterns.x + x, 1.2, LIGHTHOUSE.lanterns.z); p.material = rack.material; }
  const flame = glow(scene, "lh-lanternFlame", "#ffcf6a"), frame = toon(scene, "lh-lanternFrame", "#2a2a33");
  const lanterns = [];
  for (let i = 0; i < 8; i++) {
    const x = LIGHTHOUSE.lanterns.x - 1.9 + i * 0.55;
    const l = add(MB.CreateBox("lh-lantern", { width: 0.32, height: 0.44, depth: 0.32 }, scene), 0.02); l.position.set(x, 1.95, LIGHTHOUSE.lanterns.z); l.material = frame;
    const f = add(MB.CreateBox("lh-lflame", { width: 0.22, height: 0.32, depth: 0.22 }, scene)); f.position.copyFrom(l.position); f.material = flame;
    lanterns.push(f);
  }
  const newLantern = lanterns[7]; newLantern.setEnabled(false); // the newest Lantern's, lit at dinner
  // The long table for dinner, with benches and bowls.
  const T = LIGHTHOUSE.table, wood = toon(scene, "lh-table", "#8a5a3a");
  const top = add(MB.CreateBox("lh-tableTop", { width: 1.6, height: 0.12, depth: 5 }, scene), 0.03); top.position.set(T.x, 0.85, T.z); top.material = wood;
  for (const [dx, dz] of [[-0.6, -2.2], [0.6, -2.2], [-0.6, 2.2], [0.6, 2.2]]) { const l = add(MB.CreateBox("lh-leg", { width: 0.12, height: 0.85, depth: 0.12 }, scene)); l.position.set(T.x + dx, 0.42, T.z + dz); l.material = wood; }
  for (const dx of [-1.35, 1.35]) { const b = add(MB.CreateBox("lh-bench", { width: 0.5, height: 0.1, depth: 4.6 }, scene), 0.02); b.position.set(T.x + dx, 0.48, T.z); b.material = wood; }
  const bowl = toon(scene, "lh-bowl", "#e8e0cf");
  for (let i = 0; i < 6; i++) { const b = add(MB.CreateCylinder("lh-bowlM", { height: 0.12, diameterTop: 0.36, diameterBottom: 0.22, tessellation: 10 }, scene), 0.015); b.position.set(T.x + (i % 2 ? 0.45 : -0.45), 0.97, T.z - 1.8 + Math.floor(i / 2) * 1.8); b.material = bowl; }
  const pot = add(MB.CreateCylinder("lh-pot", { height: 0.5, diameter: 0.7, tessellation: 12 }, scene), 0.03); pot.position.set(T.x + 2.4, 0.55, T.z + 3); pot.material = toon(scene, "lh-potMat", "#2a2a33");
  const fire = add(MB.CreateCylinder("lh-cookfire", { height: 0.3, diameterTop: 0, diameterBottom: 0.6, tessellation: 6 }, scene)); fire.position.set(T.x + 2.4, 0.15, T.z + 3); fire.material = glow(scene, "lh-fireMat", "#ff9a3a");
  // The training ring with straw dummies.
  const R = LIGHTHOUSE.ring;
  const ring = add(MB.CreateTorus("lh-ring", { diameter: 9, thickness: 0.12, tessellation: 48 }, scene)); ring.position.set(R.x, 0.02, R.z); ring.material = toon(scene, "lh-ringMat", "#e6b54e");
  const straw = toon(scene, "lh-straw", "#d9b866");
  for (const [dx, dz] of [[-6, -1], [-6.5, 1.5], [5.8, -2.5]]) {
    const post = add(MB.CreateCylinder("lh-dpost", { height: 1.6, diameter: 0.14, tessellation: 6 }, scene)); post.position.set(R.x + dx, 0.8, R.z + dz); post.material = wood;
    const body = add(MB.CreateCylinder("lh-dummy", { height: 0.9, diameter: 0.55, tessellation: 8 }, scene), 0.025); body.position.set(R.x + dx, 1.4, R.z + dz); body.material = straw;
    const head = add(MB.CreateSphere("lh-dhead", { diameter: 0.4, segments: 6 }, scene), 0.02); head.position.set(R.x + dx, 2.05, R.z + dz); head.material = straw;
  }
  // Old boats stranded on the dry sea.
  const hull = toon(scene, "lh-hull", "#5a4030");
  for (const [x, z, r] of [[22, -14, 0.4], [-26, -6, 2.1], [30, 18, 1.2], [-14, -30, 0.9]]) {
    const h = add(MB.CreateCylinder("lh-boat", { height: 7, diameter: 2.6, tessellation: 12, arc: 0.5 }, scene), 0.04);
    h.position.set(x, 0.1, z); h.rotation.set(Math.PI / 2, r, 0.35); h.material = hull;
  }
  // Warm lights for the evening, string lanterns over the table.
  const warm = new BB.PointLight("lh-warm", new BB.Vector3(T.x, 3, T.z), scene); warm.diffuse = color3("#ffb86a").clone(); warm.intensity = 0.4; warm.range = 14; K.lights.push(warm);
  const bulbs = [];
  for (let i = 0; i < 9; i++) { const b = add(MB.CreateSphere("lh-bulb", { diameter: 0.18, segments: 6 }, scene)); b.position.set(T.x - 2 + Math.sin(i * 0.7) * 0.3, 2.8 - Math.sin((i / 8) * Math.PI) * 0.5, T.z - 3 + i * 0.75); b.material = flame; bulbs.push(b); }
  let night = 0, nightTarget = 0;
  const DUSK = { clear: "#8a5f7c", fog: "#c08070", fogDensity: 0.012, hemi: [0.65, "#ffd2b0", "#4a3a5a"], sun: [0.85, "#ffb070", [0.6, -0.55, 0.6]], warm: 0 };
  const DUSK_TOON = { lightDir: [-0.6, 0.6, -0.6], fogColor: "#c08070", fogDensity: 0.008, sky: [1.08, 0.98, 0.95], ground: [0.9, 0.78, 0.82], rim: [1.0, 0.8, 0.6] };
  const env = { ...DUSK };
  const self = {
    env, toon: DUSK_TOON,
    show(on) { K.show(on); if (on) { night = nightTarget = 0; newLantern.setEnabled(false); } },
    cue(name) {
      if (name === "night") nightTarget = 1;
      if (name === "dusk") nightTarget = 0;
      if (name === "lantern") newLantern.setEnabled(true);
    },
    update(dt, t) {
      beam.rotation.y = t * 0.5;
      const prev = night;
      night += (nightTarget - night) * Math.min(1, dt * 0.8);
      if (Math.abs(night - prev) > 1e-4) self.onNight?.(night);
      beamMat.alpha = 0.06 + night * 0.12;
      warm.intensity = 0.3 + night * 0.8 + Math.sin(t * 7) * 0.04;
      for (const [i, f] of lanterns.entries()) f.scaling.y = 0.9 + Math.sin(t * 9 + i) * 0.08;
    },
  };
  return self;
}

// ---- The Greywater Fens: reeds, dead trees, still water, and a village nobody remembers -------
function buildFens(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const rng = mulberry(41);
  const ground = add(MB.CreateCylinder("fn-ground", { diameter: 120, height: 0.6, tessellation: 48 }, scene)); ground.position.y = -0.3; ground.material = toon(scene, "fn-ground", "#5f6a44");
  const mud = toon(scene, "fn-mud", "#4a4630");
  for (let i = 0; i < 14; i++) { const a = rng() * Math.PI * 2, r = 4 + rng() * 14; const m = add(MB.CreateDisc("fn-mudPatch", { radius: 1.5 + rng() * 2.5, tessellation: 18 }, scene)); m.rotation.x = Math.PI / 2; m.position.set(Math.sin(a) * r, 0.012, Math.cos(a) * r); m.material = mud; }
  const water = new BB.StandardMaterial("fn-water", scene); water.diffuseColor = color3("#2f4a46"); water.specularColor = color3("#9fc0b0"); water.specularPower = 32; water.alpha = 0.85;
  for (const [x, z, r] of [[-22, 8, 9], [20, -16, 11], [24, 14, 7], [-18, -22, 8]]) { const w = add(MB.CreateDisc("fn-pond", { radius: r, tessellation: 28 }, scene)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.03, z); w.material = water; }
  // Reed clumps around the edges (and a few inside).
  const reed = toon(scene, "fn-reed", "#8a9a52"), reedTop = toon(scene, "fn-reedTop", "#6b4a32");
  for (let i = 0; i < (mobile ? 40 : 80); i++) {
    const a = rng() * Math.PI * 2, r = i % 6 === 0 ? 8 + rng() * 6 : 17 + rng() * 14;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    for (let k = 0; k < 3; k++) {
      const h = 1.2 + rng() * 1.2;
      const st = add(MB.CreateCylinder("fn-reed", { height: h, diameter: 0.06, tessellation: 4 }, scene)); st.position.set(x + (rng() - 0.5) * 0.6, h / 2, z + (rng() - 0.5) * 0.6); st.rotation.z = (rng() - 0.5) * 0.3; st.material = reed;
      if (k === 0) { const tip = add(MB.CreateCylinder("fn-cattail", { height: 0.3, diameter: 0.12, tessellation: 6 }, scene)); tip.position.set(st.position.x, h, st.position.z); tip.material = reedTop; }
    }
  }
  // Dead trees.
  const bark = toon(scene, "fn-bark", "#3e3428");
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + rng() * 0.3, r = 20 + rng() * 10;
    const x = Math.sin(a) * r, z = Math.cos(a) * r, h = 5 + rng() * 4;
    const t = add(MB.CreateCylinder("fn-tree", { height: h, diameterTop: 0.3, diameterBottom: 0.9, tessellation: 7 }, scene), 0.04); t.position.set(x, h / 2, z); t.rotation.z = (rng() - 0.5) * 0.25; t.material = bark;
    for (let k = 0; k < 3; k++) { const b = add(MB.CreateCylinder("fn-branch", { height: 2 + rng() * 1.5, diameterTop: 0.05, diameterBottom: 0.25, tessellation: 5 }, scene), 0.03); b.position.set(x, h * (0.55 + k * 0.12), z); b.rotation.set(rng() * 0.6 - 0.3, rng() * 6, 0.9 + rng() * 0.5); b.material = bark; }
  }
  // The village that wasn't on the map: whole houses, standing empty, with no one inside.
  const wall = toon(scene, "fn-houseWall", "#8f8470"), roof = toon(scene, "fn-houseRoof", "#5a4a3a"), dark = toon(scene, "fn-window", "#1c1f22");
  for (const [x, z, rot] of [[-12, 14, 0.5], [-4, 19, 0.1], [6, 18, -0.3], [14, 11, -0.8], [-15, 4, 1.2]]) {
    const h = add(MB.CreateBox("fn-house", { width: 4, height: 2.8, depth: 3.4 }, scene), 0.04); h.position.set(x, 1.4, z); h.rotation.y = rot; h.material = wall;
    const r = add(MB.CreateCylinder("fn-roof", { height: 4.4, diameter: 3.8, tessellation: 3 }, scene), 0.04); r.position.set(x, 3.4, z); r.rotation.set(0, rot, Math.PI / 2); r.scaling.set(1, 1, 0.8); r.material = roof;
    const w = add(MB.CreatePlane("fn-win", { width: 0.8, height: 0.7 }, scene)); w.position.set(x - Math.sin(rot) * 1.72, 1.5, z - Math.cos(rot) * 1.72); w.rotation.y = rot; w.material = dark;
  }
  const well = add(MB.CreateCylinder("fn-well", { height: 0.8, diameter: 1.6, tessellation: 14 }, scene), 0.04); well.position.set(3, 0.4, 12); well.material = toon(scene, "fn-wellStone", "#7a7466");
  const mist = new BB.ParticleSystem("fn-mist", mobile ? 30 : 60, scene);
  mist.particleTexture = softTexture(scene); mist.emitter = new BB.Vector3(0, 0.4, 0);
  mist.minEmitBox = new BB.Vector3(-18, 0, -18); mist.maxEmitBox = new BB.Vector3(18, 0.3, 18);
  mist.color1 = new BB.Color4(0.75, 0.82, 0.72, 0.18); mist.color2 = new BB.Color4(0.65, 0.72, 0.66, 0.12); mist.colorDead = new BB.Color4(0.6, 0.7, 0.6, 0);
  mist.minSize = 3; mist.maxSize = 6; mist.minLifeTime = 6; mist.maxLifeTime = 10; mist.emitRate = mobile ? 4 : 8;
  mist.blendMode = BB.ParticleSystem.BLENDMODE_STANDARD; mist.gravity = new BB.Vector3(0.05, 0, 0); mist.minEmitPower = 0.05; mist.maxEmitPower = 0.15;
  K.systems.push(mist);
  // Hask's bog: murky water that floods the clearing and drains in phase 3.
  const bog = MB.CreateDisc("fn-bog", { radius: 16.5, tessellation: mobile ? 40 : 64 }, scene); bog.parent = K.root;
  bog.rotation.x = Math.PI / 2; bog.position.y = 0.04; bog.isPickable = false;
  const bogMat = new BB.StandardMaterial("fn-bogMat", scene);
  bogMat.diffuseColor = color3("#2f3a26"); bogMat.specularColor = color3("#9fb07a"); bogMat.specularPower = 24; bogMat.emissiveColor = color3("#141a10"); bogMat.alpha = 0;
  bog.material = bogMat; bog.setEnabled(false);
  let bogLevel = 0, bogTarget = 0;
  const env = { clear: "#7f8f86", fog: "#8a9a8c", fogDensity: 0.022, hemi: [0.6, "#e0ecd8", "#3a3a2a"], sun: [0.7, "#f0ecd0", [-0.3, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [0.3, 1, -0.4], fogColor: "#8a9a8c", fogDensity: 0.016, sky: [1.0, 1.02, 0.98], ground: [0.78, 0.82, 0.74], rim: [0.8, 0.9, 0.85] };
  return {
    env, toon: toonEnv,
    show(on) { K.show(on); bogLevel = bogTarget = 0; bog.setEnabled(false); },
    setBog(on, instant) { bogTarget = on ? 1 : 0; if (instant) bogLevel = bogTarget; },
    update(dt, t) {
      bogLevel += (bogTarget - bogLevel) * Math.min(1, dt * (bogTarget ? 2 : 0.6));
      bog.setEnabled(bogLevel > 0.01);
      if (bogLevel > 0.01) { const sc = 0.15 + 0.85 * bogLevel; bog.scaling.set(sc, sc, 1); bogMat.alpha = 0.82 * bogLevel; bog.rotation.z = t * 0.02; }
    },
  };
}

// ---- Aurelin: the capital (plaza, Hall of Lanterns, Lowmarket, streets, a walking crowd) ------
function buildAurelin(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = AURELIN_LAYOUT;
  const rng = mulberry(53);
  const cobble = toon(scene, "au-cobble", "#857c6c"), cobbleDark = toon(scene, "au-cobbleDark", "#6f6759");
  const ground = add(MB.CreateGround("au-ground", { width: 120, height: 120 }, scene)); ground.position.set(0, 0, 5); ground.material = cobble;
  const plaza = add(MB.CreateDisc("au-plaza", { radius: 13, tessellation: 48 }, scene)); plaza.rotation.x = Math.PI / 2; plaza.position.y = 0.01; plaza.material = cobbleDark;
  for (const r of [6, 10]) { const ring = add(MB.CreateTorus("au-ring", { diameter: r * 2, thickness: 0.12, tessellation: 48 }, scene)); ring.position.y = 0.02; ring.material = toon(scene, "au-ringMat", "#c9a24a"); }
  // Fountain with a lantern-bearer statue.
  const F = L.fountain, stone = toon(scene, "au-stone", "#cfc6b4"), water = glow(scene, "au-water", "#3f86b0", 0.9);
  const basin = add(MB.CreateCylinder("au-basin", { height: 0.9, diameter: F.r * 2, tessellation: 28 }, scene), 0.05); basin.position.set(F.x, 0.45, F.z); basin.material = stone;
  const pool = add(MB.CreateDisc("au-pool", { radius: F.r - 0.25, tessellation: 28 }, scene)); pool.rotation.x = Math.PI / 2; pool.position.set(F.x, 0.86, F.z); pool.material = water; K.noGlow(pool);
  const plinth = add(MB.CreateCylinder("au-plinth", { height: 2.2, diameter: 1.1, tessellation: 12 }, scene), 0.04); plinth.position.set(F.x, 1.6, F.z); plinth.material = stone;
  const statue = add(MB.CreateCylinder("au-statue", { height: 2.2, diameterTop: 0.5, diameterBottom: 0.9, tessellation: 10 }, scene), 0.04); statue.position.set(F.x, 3.8, F.z); statue.material = toon(scene, "au-bronze", "#6a8a7a");
  const sHead = add(MB.CreateSphere("au-sHead", { diameter: 0.6, segments: 8 }, scene), 0.03); sHead.position.set(F.x, 5.2, F.z); sHead.material = statue.material;
  const sLamp = add(MB.CreateBox("au-sLamp", { size: 0.4 }, scene)); sLamp.position.set(F.x + 0.6, 5.6, F.z); sLamp.material = glow(scene, "au-lampGlow", "#ffd36a");
  const spray = new BB.ParticleSystem("au-spray", mobile ? 40 : 90, scene);
  spray.particleTexture = softTexture(scene); spray.emitter = new BB.Vector3(F.x, 2.6, F.z);
  spray.color1 = new BB.Color4(0.8, 0.95, 1, 0.7); spray.color2 = new BB.Color4(0.7, 0.9, 1, 0.5); spray.colorDead = new BB.Color4(1, 1, 1, 0);
  spray.minSize = 0.12; spray.maxSize = 0.3; spray.minLifeTime = 0.6; spray.maxLifeTime = 1; spray.emitRate = mobile ? 40 : 80; spray.gravity = new BB.Vector3(0, -9, 0);
  spray.direction1 = new BB.Vector3(-1, 4, -1); spray.direction2 = new BB.Vector3(1, 5, 1); spray.minEmitPower = 0.6; spray.maxEmitPower = 1; spray.blendMode = BB.ParticleSystem.BLENDMODE_ADD;
  K.systems.push(spray);
  // Houses: walls, a pitched roof, a door and windows facing the street.
  const winMat = toon(scene, "au-win", "#3a4a6a"), doorMat = toon(scene, "au-door", "#6b4a32");
  const wallMats = new Map(), roofMats = new Map();
  const mat = (map, hex, pre) => { if (!map.has(hex)) map.set(hex, toon(scene, `${pre}${map.size}`, hex)); return map.get(hex); };
  for (const h of L.houses) {
    const body = add(MB.CreateBox("au-house", { width: h.w, height: h.h, depth: h.d }, scene), 0.05); body.position.set(h.x, h.h / 2, h.z); body.material = mat(wallMats, h.color, "au-wall");
    const roof = add(MB.CreateCylinder("au-roof", { height: h.d + 0.6, diameter: h.w * 0.72, tessellation: 3 }, scene), 0.05);
    roof.position.set(h.x, h.h + h.w * 0.17, h.z); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.scaling.set(1.45, 1, 0.75); roof.material = mat(roofMats, h.roof, "au-roof");
    const face = h.x < 0 ? 1 : -1; // windows and door face the middle of town
    const fx = h.x + face * (h.w / 2 + 0.02);
    const door = add(MB.CreatePlane("au-doorP", { width: 1.2, height: 2.2, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); door.position.set(fx, 1.1, h.z); door.rotation.y = Math.PI / 2; door.material = doorMat;
    for (const dz of [-h.d / 3, h.d / 3]) for (const y of h.h > 6 ? [2.6, 4.8] : [2.6]) {
      const w = add(MB.CreatePlane("au-winP", { width: 0.9, height: 1, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); w.position.set(fx, y, h.z + dz); w.rotation.y = Math.PI / 2; w.material = winMat;
    }
  }
  // The Hall of Lanterns: a long stone hall with columns and a golden lantern over the door.
  const H = L.hall, hw = H.x1 - H.x0, hd = H.z1 - H.z0;
  const hall = add(MB.CreateBox("au-hall", { width: hw, height: 11, depth: hd }, scene), 0.06); hall.position.set((H.x0 + H.x1) / 2, 5.5, (H.z0 + H.z1) / 2); hall.material = toon(scene, "au-hallMat", "#e8e0cf");
  const hallRoof = add(MB.CreateCylinder("au-hallRoof", { height: hd + 1, diameter: hw * 0.8, tessellation: 3 }, scene), 0.06);
  hallRoof.position.set(hall.position.x, 11 + hw * 0.19, hall.position.z); hallRoof.rotation.set(Math.PI / 2, 0, Math.PI / 2); hallRoof.scaling.set(1.45, 1, 0.75); hallRoof.material = toon(scene, "au-hallRoofMat", "#2b4f8f");
  for (let i = 0; i < 6; i++) { const c = add(MB.CreateCylinder("au-col", { height: 9, diameter: 1, tessellation: 10 }, scene), 0.04); c.position.set(H.x0 + 1.5 + i * ((hw - 3) / 5), 4.5, H.z0 - 1.2); c.material = stone; }
  const portico = add(MB.CreateBox("au-portico", { width: hw + 1, height: 1, depth: 3 }, scene), 0.05); portico.position.set(hall.position.x, 9.5, H.z0 - 1.2); portico.material = stone;
  const hallDoor = add(MB.CreatePlane("au-hallDoor", { width: 3.2, height: 5, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); hallDoor.position.set(H.door.x, 2.5, H.z0 - 0.02); hallDoor.material = toon(scene, "au-hallDoorMat", "#5a3a22");
  const bigLantern = add(MB.CreateBox("au-bigLantern", { width: 1.4, height: 1.8, depth: 1.4 }, scene), 0.04); bigLantern.position.set(H.door.x, 7.5, H.z0 - 0.6); bigLantern.material = glow(scene, "au-bigLanternMat", "#ffd36a");
  // The Lowmarket: stalls with striped canopies and crates.
  const wood = toon(scene, "au-wood", "#8a5a3a");
  for (const st of L.stalls) {
    const table = add(MB.CreateBox("au-table", { width: 2.8, height: 1, depth: 2 }, scene), 0.03); table.position.set(st.x, 0.5, st.z); table.material = wood;
    const canopy = add(MB.CreateBox("au-canopy", { width: 3.2, height: 0.15, depth: 2.6 }, scene), 0.03); canopy.position.set(st.x, 2.6, st.z); canopy.rotation.x = 0.12; canopy.material = toon(scene, `au-can${st.canopy}`, st.canopy);
    for (const dx of [-1.4, 1.4]) { const p = add(MB.CreateCylinder("au-pole", { height: 2.6, diameter: 0.1, tessellation: 5 }, scene)); p.position.set(st.x + dx, 1.3, st.z - 1); p.material = wood; }
    for (let k = 0; k < 3; k++) { const g = add(MB.CreateSphere("au-goods", { diameter: 0.35, segments: 6 }, scene), 0.015); g.position.set(st.x - 0.8 + k * 0.8, 1.15, st.z); g.material = toon(scene, `au-good${k}`, ["#e65a4a", "#e6b54e", "#7ac06a"][k]); }
  }
  // City walls and the south gate.
  const wallMat = toon(scene, "au-cityWall", "#9a9080");
  for (const [x0, x1] of [[-42, -4], [4, 42]]) { const w = add(MB.CreateBox("au-cityWallM", { width: x1 - x0, height: 7, depth: 3 }, scene), 0.05); w.position.set((x0 + x1) / 2, 3.5, -34.5); w.material = wallMat; }
  for (const x of [-5, 5]) { const t = add(MB.CreateCylinder("au-gateTower", { height: 11, diameter: 4, tessellation: 12 }, scene), 0.05); t.position.set(x, 5.5, -34.5); t.material = wallMat; }
  const arch = add(MB.CreateBox("au-gateArch", { width: 8, height: 2, depth: 3 }, scene), 0.05); arch.position.set(0, 8, -34.5); arch.material = wallMat;
  // Distant skyline: the palace and towers beyond the hall.
  const far = toon(scene, "au-far", "#b8b0c8");
  for (const [x, z, w, h] of [[0, 70, 26, 30], [-26, 64, 8, 38], [26, 64, 8, 34], [-50, 50, 14, 16], [50, 52, 14, 18]]) { const b = add(MB.CreateBox("au-skyline", { width: w, height: h, depth: 8 }, scene)); b.position.set(x, h / 2, z); b.material = far; }
  // Bunting across the plaza.
  const flagCols = ["#c0504d", "#e6b54e", "#4f81bd", "#f2efe6"].map((c, i) => toon(scene, `au-flag${i}`, c));
  for (let i = 0; i < 18; i++) { const f = add(MB.CreateCylinder("au-flagT", { height: 0.5, diameter: 0.5, tessellation: 3 }, scene)); const a = (i / 18) * Math.PI * 2; f.position.set(Math.sin(a) * 9, 5.4 + Math.sin(i) * 0.2, Math.cos(a) * 9); f.rotation.set(Math.PI / 2, a, 0); f.material = flagCols[i % 4]; }
  // A crowd walking loops around town (simple figures, instanced for speed).
  const bodyCols = ["#c0504d", "#4f81bd", "#9bbb59", "#8064a2", "#f79646", "#4bacc6", "#d8d2c4", "#7a5a3a"];
  const sources = bodyCols.map((c, i) => {
    const b = MB.CreateCylinder(`au-pb${i}`, { height: 1.2, diameterTop: 0.42, diameterBottom: 0.7, tessellation: 8 }, scene); b.material = toon(scene, `au-pm${i}`, c); b.parent = K.root; b.isPickable = false; b.setEnabled(false);
    return b;
  });
  const headSrc = MB.CreateSphere("au-ph", { diameter: 0.42, segments: 6 }, scene); headSrc.material = toon(scene, "au-phm", "#e2b894"); headSrc.parent = K.root; headSrc.isPickable = false; headSrc.setEnabled(false);
  const hairSrc = MB.CreateSphere("au-phair", { diameter: 0.45, segments: 6, slice: 0.55 }, scene); hairSrc.material = toon(scene, "au-phairm", "#3a2a22"); hairSrc.parent = K.root; hairSrc.isPickable = false; hairSrc.setEnabled(false);
  const loops = [
    { cx: 0, cz: 0, r: 8, dir: 1 }, { cx: 0, cz: 0, r: 11, dir: -1 },
    { line: [[-23, -26], [-23, 34]] }, { line: [[23, -26], [23, 34]] }, { line: [[-20, 20], [20, 20]] }, { line: [[8, -28], [8, 18]] },
  ];
  const n = mobile ? Math.round(22 * 0.6) : 22;
  const walkers = [];
  for (let i = 0; i < n; i++) {
    const b = sources[i % sources.length].createInstance(`au-walker${i}`), h = headSrc.createInstance(`au-wh${i}`), hr = hairSrc.createInstance(`au-whr${i}`);
    for (const m of [b, h, hr]) { m.parent = K.root; m.isPickable = false; }
    walkers.push({ b, h, hr, path: loops[i % loops.length], t: rng() * 100, speed: 0.6 + rng() * 0.6, side: (rng() - 0.5) * 2.2 });
  }
  const env = { clear: "#a8cdf0", fog: "#c4dbf2", fogDensity: 0.008, hemi: [0.6, "#fff6e6", "#7a86a8"], sun: [0.8, "#fff1d0", [-0.4, -1, 0.55]], warm: 0 };
  const toonEnv = { lightDir: [0.4, 1, -0.55], fogColor: "#c4dbf2", fogDensity: 0.005, sky: [1.1, 1.08, 1.04], ground: [0.9, 0.88, 0.9], rim: [0.75, 0.85, 1] };
  return {
    env, toon: toonEnv, show: K.show,
    update(dt) {
      for (const w of walkers) {
        w.t += dt * w.speed;
        let x, z, yaw;
        if (w.path.r) {
          const a = (w.t / w.path.r) * w.path.dir;
          x = w.path.cx + Math.sin(a) * (w.path.r + w.side * 0.4); z = w.path.cz + Math.cos(a) * (w.path.r + w.side * 0.4);
          yaw = a + (w.path.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        } else {
          const [[x0, z0], [x1, z1]] = w.path.line, len = Math.hypot(x1 - x0, z1 - z0);
          const u = (w.t % (len * 2)) / len, k = u < 1 ? u : 2 - u;
          const nx = -(z1 - z0) / len, nz = (x1 - x0) / len;
          x = x0 + (x1 - x0) * k + nx * w.side; z = z0 + (z1 - z0) * k + nz * w.side;
          yaw = Math.atan2(x1 - x0, z1 - z0) + (u < 1 ? 0 : Math.PI);
        }
        const bob = Math.abs(Math.sin(w.t * 6)) * 0.06;
        w.b.position.set(x, 0.6 + bob, z); w.h.position.set(x, 1.42 + bob, z); w.hr.position.set(x, 1.47 + bob, z);
        w.hr.rotation.set(0, yaw, 0); w.b.rotation.y = yaw;
      }
    },
  };
}
