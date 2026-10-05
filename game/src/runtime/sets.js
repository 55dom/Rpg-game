// Story sets (Phase 3): each one is built on first use from primitives, carries its own sky, fog,
// and lighting, and can be swapped in and out. "yard" is the original training yard (arena.js).

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
    return set;
  }

  get(name) {
    if (name === "yard") return null;
    let s = this.built.get(name);
    if (!s) {
      const make = { towerSteps: buildTowerSteps, towerHall: buildTowerHall, larkspur: buildLarkspur, examGrounds: buildExamGrounds }[name];
      if (!make) throw new Error(`no set "${name}"`);
      s = make(this.scene, this.mobile);
      s.show(false);
      this.built.set(name, s);
    }
    return s;
  }

  _env(e, toonEnv) {
    const BB = B(), sc = this.scene, L = this.lights;
    sc.clearColor = BB.Color4.FromHexString(e.clear + "ff");
    sc.fogColor = color3(e.fog).clone(); sc.fogDensity = e.fogDensity;
    if (L.hemi) { L.hemi.intensity = e.hemi[0]; L.hemi.diffuse = color3(e.hemi[1]).clone(); L.hemi.groundColor = color3(e.hemi[2]).clone(); }
    if (L.sun) { L.sun.intensity = e.sun[0]; L.sun.diffuse = color3(e.sun[1]).clone(); L.sun.direction = new BB.Vector3(...e.sun[2]); }
    if (L.warm) L.warm.intensity = e.warm ?? 0;
    setToonEnvironment(toonEnv);
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
