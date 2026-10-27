// Story sets (Phase 3): each one is built on first use from primitives, carries its own sky, fog,
// and lighting, and can be swapped in and out. "yard" is the original training yard (arena.js).

import { AURELIN_LAYOUT, THORNWICK_LAYOUT, UNDERCROFT_BANDS, CAFE_LAYOUT, HOME_LAYOUT, HALL_LAYOUT, IRONHOLD_LAYOUT, VAULT_LAYOUT, WATCH_LAYOUT, FENHOME_LAYOUT, ISLES_LAYOUT, OLDCITY_LAYOUT, HOLLOW_LAYOUT, ARCHIVE_LAYOUT, AURELIN_GATE, BRIDGE_LAYOUT } from "../data/zones.js";
import { WARDEN_STARS } from "../data/isles.js";
import { B, toon, glow, inkOutline, color3, setToonEnvironment, TOON_SCENE } from "./look.js";
import { buildCrowd } from "./crowd.js";
import { buildCritters } from "./critters.js";
import { palette, props } from "./props.js";
import { makeTear, makeDoor } from "./tears.js";
import { MASKED_BOUNTY } from "../data/masked.js";
import { buildCamp, buildThrone, buildCaverns } from "../reveal/sets.js";

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
      const make = { towerSteps: buildTowerSteps, towerHall: buildTowerHall, larkspur: buildLarkspur, examGrounds: buildExamGrounds, lighthouse: buildLighthouse, fens: buildFens, aurelin: buildAurelin, thornwick: buildThornwick, undercroft: buildUndercroft, cafe: buildCafe, home: buildHome, hall: buildHall, archive: buildArchive, bridge: buildBridge, camp: buildCamp, throne: buildThrone, caverns: buildCaverns, watchhouse: buildWatchhouse, fenhome: buildFenhome, isles: buildIsles, oldcity: buildOldCity, hollow: buildHollow, ironhold: buildIronhold, vault: buildVault, mirrorlake: buildMirrorlake, crypt: buildCrypt }[name];
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

  /**
   * Time of day and weather on an outdoor set (GDD §29.10): darken toward night, grey toward overcast,
   * thicken the fog in rain; windows and lamps light up after dark. The set's own base look is untouched.
   * @param {{ daylight: number, cloud: number, wet: number }} a
   */
  atmosphere({ daylight, cloud, wet }) {
    const set = this.built.get(this.current);
    if (!set?.outdoor) return;
    const k = 1 - daylight, D = set.env, N = NIGHT, T = set.toon, NT = NIGHT_TOON;
    const mixc = (a, b, t) => { const A = color3(a), Bc = color3(b); return `#${[A.r + (Bc.r - A.r) * t, A.g + (Bc.g - A.g) * t, A.b + (Bc.b - A.b) * t].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`; };
    const grey = (c) => mixc(c, "#7d8590", cloud * 0.55 * (1 - k * 0.6));
    const e = {
      clear: grey(mixc(D.clear, N.clear, k)), fog: grey(mixc(D.fog, N.fog, k)), fogDensity: D.fogDensity * (1 + wet * 1.3 + cloud * 0.3) + k * 0.004,
      hemi: [D.hemi[0] * (0.45 + 0.55 * daylight) * (1 - cloud * 0.25), mixc(D.hemi[1], N.hemi[1], k), mixc(D.hemi[2], N.hemi[2], k)],
      sun: [D.sun[0] * (0.2 + 0.8 * daylight) * (1 - cloud * 0.55), mixc(D.sun[1], N.sun[1], k), D.sun[2]], warm: 0,
    };
    const lerp3 = (a, b, t) => a.map((v, i) => (v + (b[i] - v) * t) * (1 - cloud * 0.12));
    this._env(e, { lightDir: T.lightDir, fogColor: e.fog, fogDensity: T.fogDensity * (1 + wet * 1.2 + cloud * 0.3), sky: lerp3(T.sky, NT.sky, k), ground: lerp3(T.ground, NT.ground, k), rim: lerp3(T.rim ?? [0.8, 0.9, 1], NT.rim, k) });
    // Lit windows and lamps after dark.
    const glowK = Math.max(0, Math.min(1, (k - 0.25) / 0.6));
    for (const w of set.windows ?? []) w.emissiveColor.copyFrom(B().Color3.Lerp(w.dayColor, w.nightColor, glowK));
    for (const l of set.lamps ?? []) l.emissiveColor.copyFrom(B().Color3.Lerp(l.dayColor, l.nightColor, Math.max(0.15, glowK)));
  }

  /** Switch conditional set dressing on or off from story flags (aftermath, repairs…). */
  applyFlags(test) { const set = this.built.get(this.current); for (const [cond, node] of set?.conditions ?? []) node.setEnabled(test(cond)); }

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
  const glowless = new Set();
  const windows = [], lamps = [], conditions = [];
  /** A window pane that's dark glass by day and warm light at night. */
  const windowMat = (name, day = "#34405a", night = "#ffcf7a") => { const m = glow(scene, name, day); m.dayColor = color3(day).clone(); m.nightColor = color3(night).clone(); windows.push(m); return m; };
  const lampMat = (name, day = "#8a7a5a", night = "#ffd36a") => { const m = glow(scene, name, day); m.dayColor = color3(day).clone(); m.nightColor = color3(night).clone(); lamps.push(m); return m; };
  return {
    root, add, systems, lights, windows, lamps, conditions, windowMat, lampMat,
    /** A group of props shown only while a flag condition holds (it's never merged into the static scenery). */
    when: (cond) => { const n = new (B().TransformNode)(`cond-${conditions.length}`, scene); n.parent = root; conditions.push([cond, n]); return n; },
    noGlow: (m) => { glowless.add(m); m.metadata = { ...m.metadata, noGlow: true }; return noGlow(m); },
    /**
     * Performance (Phase 4 Step 5): merge the set's static scenery into one mesh per material,
     * outline width and 24 m cell. Hundreds of props become a few dozen draw calls, while each
     * cell is still culled on its own. Meshes in `keep` (animated or swapped), instance sources,
     * instances, disabled, see-through and glow-excluded meshes are left alone.
     */
    bake(keep = []) {
      const skip = new Set(keep), groups = new Map();
      for (const m of root.getChildMeshes(true)) {
        if (skip.has(m) || glowless.has(m) || m instanceof BB.InstancedMesh || m.instances?.length || !m.isEnabled(false) || !m.material || m.material.alpha < 1 || !m.getTotalVertices()) continue;
        m.computeWorldMatrix(true);
        const c = m.getBoundingInfo().boundingBox.centerWorld, cell = `${Math.floor(c.x / 24)},${Math.floor(c.z / 24)}`;
        const key = `${m.material.uniqueId}|${m.renderOutline ? m.outlineWidth : 0}|${cell}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(m);
      }
      let merged = 0;
      for (const list of groups.values()) {
        if (list.length < 2) continue;
        const outline = list[0].renderOutline ? list[0].outlineWidth : 0;
        const m = BB.Mesh.MergeMeshes(list, true, true);
        if (!m) continue;
        m.parent = root; m.isPickable = false;
        if (outline) inkOutline(m, outline);
        m.freezeWorldMatrix();
        merged += list.length - 1;
      }
      return merged;
    },
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
    const ban = add(MB.CreateBox("ts-banner", { width: 1.4, height: 4, depth: 0.16 }, scene), 0.016); // thick enough that its ink line can't show through
    ban.position.set(x, 6.4, 7.1); ban.material = toon(scene, `ts-ban${bi}`, bi % 2 ? "#d9ae4f" : "#2b4f8f");
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
  return { env, toon: toonEnv, show: K.show, outdoor: true, update() {} };
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
    const ban = add(MB.CreateBox("eg-ban", { width: 1.1, height: 2.6, depth: 0.16 }, scene), 0.016); // thick enough that its ink line can't show through
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
export const LIGHTHOUSE = { table: { x: 5, z: 6 }, ring: { x: 0, z: -4 }, lanterns: { x: 2.5, z: 12.4 }, door: { x: -4, z: 10.4 },
  dummies: [[-6, -5], [-6.5, -2.5], [5.8, -6.5], [2.6, -6.6]] }; // the training ring's straw dummies (world positions)
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
  // Later in the story the rack follows the flags: yours stays lit; Cal's (the second) goes dark, wick still standing.
  const myLit = K.when("$LANTERN_LIT"), calLitN = K.when("not $CAL_STATE"), calDarkN = K.when("$CAL_STATE");
  { const f = add(MB.CreateBox("lh-myflame", { width: 0.22, height: 0.32, depth: 0.22 }, scene)); f.parent = myLit; f.position.copyFrom(newLantern.position); f.material = flame; lanterns.push(f); }
  lanterns[1].parent = calLitN;
  { const wk = add(MB.CreateCylinder("lh-calWick", { height: 0.16, diameter: 0.03, tessellation: 5 }, scene)); wk.parent = calDarkN; wk.position.set(lanterns[1].position.x, 1.88, LIGHTHOUSE.lanterns.z); wk.material = toon(scene, "lh-wick", "#1a1a1a"); }
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
  // Each dummy wobbles on its post when hit (sim: World.spawnDummy; hitDummy below), so none of it is baked.
  const straw = toon(scene, "lh-straw", "#d9b866"), rope = toon(scene, "lh-rope", "#7a5a3a");
  const dummies = LIGHTHOUSE.dummies.map(([x, z], i) => {
    const node = new BB.TransformNode(`lh-dummy-${i}`, scene); node.parent = K.root; node.position.set(x, 0, z);
    node.rotation.y = Math.atan2(R.x - x, R.z - z);
    const keep = [];
    const part = (m, px, py, pz, o) => { add(m, o); m.parent = node; m.position.set(px, py, pz); keep.push(m); return m; };
    part(MB.CreateCylinder("lh-dpost", { height: 1.6, diameter: 0.14, tessellation: 6 }, scene), 0, 0.8, 0).material = wood;
    const body = part(MB.CreateCylinder("lh-dummy", { height: 0.9, diameter: 0.55, tessellation: 8 }, scene), 0, 1.4, 0, 0.025); body.material = straw;
    part(MB.CreateSphere("lh-dhead", { diameter: 0.4, segments: 6 }, scene), 0, 2.05, 0, 0.02).material = straw;
    const arms = part(MB.CreateCylinder("lh-darms", { height: 1.1, diameter: 0.1, tessellation: 6 }, scene), 0, 1.6, 0, 0.015); arms.rotation.z = Math.PI / 2; arms.material = wood;
    for (const y of [1.15, 1.65]) part(MB.CreateTorus("lh-drope", { diameter: 0.56, thickness: 0.04, tessellation: 12 }, scene), 0, y, 0).material = rope;
    return { node, keep, wob: 0, dir: 0, t: 0, x, z };
  });
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
  // Supplies by the house, and the squad's cat on the porch.
  const P = palette(scene, "lh"), PR = props(scene, K, P);
  PR.crate(-8.4, 13.6, { ry: 0.3 }); PR.crate(-8.5, 14.6, { ry: 1.1, s: 0.6 }); PR.barrel(-8.6, 12.3); PR.woodpile(-0.2, 16.6, { ry: 0 });
  const cat = buildCritters(scene, K, [{ kind: "cat", n: 1, area: { x: -3.2, z: 9.7, r: 0.01 }, still: true }], rng);
  // The Squad HQ (data/crafting.js): a notice board, the workbench, and each room once it's built.
  const board = add(MB.CreateBox("lh-squadBoard", { width: 1.4, height: 1.1, depth: 0.1 }, scene), 0.02); board.position.set(1.0, 1.4, 11.6); board.material = toon(scene, "lh-boardMat", "#7a5232");
  for (const [x, y, hex] of [[0.6, 1.6, "#f2efe6"], [1.25, 1.55, "#e6c890"], [0.9, 1.2, "#f2efe6"], [1.35, 1.2, "#c8607a"]]) { const n = add(MB.CreatePlane("lh-note", { width: 0.32, height: 0.36 }, scene)); n.position.set(x, y, 11.54); n.rotation.y = Math.PI; n.material = P(hex); }
  for (const x of [0.4, 1.6]) { const leg = add(MB.CreateBox("lh-boardLeg", { width: 0.08, height: 1.0, depth: 0.08 }, scene)); leg.position.set(x, 0.5, 11.6); leg.material = rack.material; }
  const bench = add(MB.CreateBox("lh-workbench", { width: 1.8, height: 0.9, depth: 0.8 }, scene), 0.03); bench.position.set(-9.5, 0.45, 2.5); bench.material = rack.material;
  for (const [dx, hex] of [[-0.5, "#8a8a90"], [0.2, "#5a5e66"], [0.6, "#c9a24a"]]) { const t = add(MB.CreateBox("lh-tool", { width: 0.25, height: 0.06, depth: 0.12 }, scene)); t.position.set(-9.5 + dx, 0.93, 2.5); t.rotation.y = dx; t.material = P(hex); }
  const forge = K.when("$HQ_FORGE");
  const anvil = add(MB.CreateBox("lh-anvil", { width: 0.7, height: 0.45, depth: 0.35 }, scene), 0.02); anvil.parent = forge; anvil.position.set(-10.6, 0.55, 0.8); anvil.material = P("#3a3a42");
  const anvilBase = add(MB.CreateCylinder("lh-anvilBase", { height: 0.35, diameter: 0.4, tessellation: 8 }, scene), 0.015); anvilBase.parent = forge; anvilBase.position.set(-10.6, 0.17, 0.8); anvilBase.material = P("#5a3a22");
  const hearth = add(MB.CreateBox("lh-forgeHearth", { width: 1.2, height: 1.0, depth: 1.0 }, scene), 0.03); hearth.parent = forge; hearth.position.set(-11.6, 0.5, 2.6); hearth.material = P("#6a625a");
  const coals = add(MB.CreateBox("lh-coals", { width: 0.8, height: 0.12, depth: 0.6 }, scene)); coals.parent = forge; coals.position.set(-11.6, 1.04, 2.6); coals.material = glow(scene, "lh-coalGlow", "#ff7a2a");
  const kitchen = K.when("$HQ_KITCHEN");
  const stove = add(MB.CreateBox("lh-stove", { width: 1.0, height: 0.9, depth: 0.8 }, scene), 0.03); stove.parent = kitchen; stove.position.set(8.2, 0.45, 8.2); stove.material = P("#2a2a30");
  const stew = add(MB.CreateCylinder("lh-stewPot", { height: 0.45, diameter: 0.6, tessellation: 12 }, scene), 0.02); stew.parent = kitchen; stew.position.set(8.2, 1.12, 8.2); stew.material = P("#5a5e66");
  const steam = add(MB.CreateSphere("lh-steam", { diameter: 0.35, segments: 6 }, scene)); steam.parent = kitchen; steam.position.set(8.2, 1.55, 8.2); steam.material = glow(scene, "lh-steamMat", "#f2efe6", 0.35, true);
  const ring2 = K.when("$HQ_RING");
  for (const [x, z] of [[-4.6, -8.2], [4.6, -8.2], [-4.6, 0.2], [4.6, 0.2]]) {
    const pole = add(MB.CreateCylinder("lh-ringPole", { height: 2.6, diameter: 0.1, tessellation: 6 }, scene), 0.015); pole.parent = ring2; pole.position.set(x, 1.3, z); pole.material = rack.material;
    const flag = add(MB.CreateBox("lh-ringFlag", { width: 0.5, height: 0.35, depth: 0.02 }, scene), 0.01); flag.parent = ring2; flag.position.set(x + 0.27, 2.35, z); flag.material = P("#e6b54e");
  }
  const weaponRack = add(MB.CreateBox("lh-weaponRack", { width: 1.6, height: 1.3, depth: 0.2 }, scene), 0.02); weaponRack.parent = ring2; weaponRack.position.set(0, 0.65, -9.2); weaponRack.material = rack.material;
  const library = K.when("$HQ_LIBRARY");
  const shelf = add(MB.CreateBox("lh-bookshelf", { width: 1.6, height: 2.0, depth: 0.45 }, scene), 0.03); shelf.parent = library; shelf.position.set(-1.6, 1.0, 10.15); shelf.material = rack.material;
  for (let k = 0; k < 12; k++) { const b = add(MB.CreateBox("lh-book", { width: 0.1, height: 0.32, depth: 0.3 }, scene)); b.parent = library; b.position.set(-2.2 + (k % 6) * 0.22, 0.75 + Math.floor(k / 6) * 0.6, 9.95); b.material = P(["#c8607a", "#6a8acb", "#7ac06a", "#e6b54e"][k % 4]); }
  const infirmary = K.when("$HQ_INFIRMARY");
  const tent = add(MB.CreateCylinder("lh-tent", { height: 2.4, diameterTop: 0, diameterBottom: 3.0, tessellation: 6 }, scene), 0.04); tent.parent = infirmary; tent.position.set(10.5, 1.2, 12); tent.material = P("#ece6d8");
  const cross = add(MB.CreateBox("lh-tentMark", { width: 0.5, height: 0.14, depth: 0.02 }, scene)); cross.parent = infirmary; cross.position.set(10.5, 1.3, 10.72); cross.material = P("#c8414f");
  const cot = add(MB.CreateBox("lh-cot", { width: 0.8, height: 0.4, depth: 1.8 }, scene), 0.02); cot.parent = infirmary; cot.position.set(8.4, 0.2, 12.4); cot.material = P("#f2efe6");
  K.bake([beam, ...lanterns, newLantern, ...dummies.flatMap((d) => d.keep)]);
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
    outdoor: true, conditions: K.conditions,
    dummies: LIGHTHOUSE.dummies,
    /** A training dummy takes a hit: it rocks on its post, away from the blow. */
    hitDummy(x, z, from, strength = 1) {
      let d = null, best = 1.5;
      for (const c of dummies) { const k = Math.hypot(c.x - x, c.z - z); if (k < best) { best = k; d = c; } }
      if (!d) return;
      d.wob = Math.min(0.55, d.wob + 0.18 * strength); d.t = 0;
      d.dir = Math.atan2(x - from.x, z - from.z) - d.node.rotation.y;
    },
    update(dt, t) {
      for (const d of dummies) { // a damped rock back and forth
        if (d.wob < 0.002) { d.node.rotation.x = d.node.rotation.z = 0; continue; }
        d.t += dt; d.wob *= Math.exp(-dt * 2.6);
        const a = Math.sin(d.t * 14) * d.wob;
        d.node.rotation.x = Math.cos(d.dir) * a; d.node.rotation.z = -Math.sin(d.dir) * a;
      }
      cat.update(dt, self.mood ?? {});
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
    if (x === -4 && z === 19) { // Luke and Elsie's house: a plank door beside the window (it opens once the village is safe)
      const dx = x - Math.sin(rot) * 1.73 + Math.cos(rot) * 0.95, dz = z - Math.cos(rot) * 1.73 - Math.sin(rot) * 0.95;
      const d = add(MB.CreatePlane("fn-door", { width: 0.95, height: 1.9, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); d.position.set(dx, 0.95, dz); d.rotation.y = rot; d.material = toon(scene, "fn-doorWood", "#4a3424");
    }
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
  // The village nobody remembers: everything left exactly where it was dropped.
  const P = palette(scene, "fn"), PR = props(scene, K, P);
  PR.cart(-8.5, 9.5, { broken: true, ry: 0.8 }); PR.sack(-7, 8); PR.sack(-6.2, 10.6); PR.sack(-7.6, 11.2);
  PR.campfire(8, 14.4, { lit: false }); const pot = add(MB.CreateCylinder("fn-pot", { height: 0.45, diameterTop: 0.5, diameterBottom: 0.36, tessellation: 10 }, scene), 0.02); pot.position.set(8, 0.3, 14.4); pot.material = P("#2a2a33");
  const fcloths = PR.laundry(-9.2, 15.2, -6.6, 16.4, { colors: ["#d8d4c8", "#c8c4b8", "#b8b4a8"] });
  const dollBody = add(MB.CreateCylinder("fn-doll", { height: 0.22, diameterTop: 0.08, diameterBottom: 0.16, tessellation: 8 }, scene), 0.01); dollBody.position.set(4.1, 0.11, 13.4); dollBody.rotation.z = 1.4; dollBody.material = P("#c0504d");
  const dollHead = add(MB.CreateSphere("fn-dollHead", { diameter: 0.1, segments: 6 }, scene), 0.008); dollHead.position.set(4.24, 0.06, 13.4); dollHead.material = P("#f0d0b2");
  PR.bench(1.5, 15.8, { ry: 0.3 }); PR.table(-1, 9.4, { ry: 0.6, mugs: 3 });
  const crows = buildCritters(scene, K, [{ kind: "crow", n: 4, area: { x: 2, z: 12, r: 6 } }], rng);
  K.bake([bog]);
  const env = { clear: "#7f8f86", fog: "#8a9a8c", fogDensity: 0.022, hemi: [0.6, "#e0ecd8", "#3a3a2a"], sun: [0.7, "#f0ecd0", [-0.3, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [0.3, 1, -0.4], fogColor: "#8a9a8c", fogDensity: 0.016, sky: [1.0, 1.02, 0.98], ground: [0.78, 0.82, 0.74], rim: [0.8, 0.9, 0.85] };
  return {
    env, toon: toonEnv, outdoor: true, windows: K.windows, lamps: K.lamps, conditions: K.conditions,
    show(on) { K.show(on); bogLevel = bogTarget = 0; bog.setEnabled(false); },
    setBog(on, instant) { bogTarget = on ? 1 : 0; if (instant) bogLevel = bogTarget; },
    update(dt, t) {
      crows.update(dt, this.mood ?? {});
      for (const [i, c] of fcloths.entries()) c.rotation.x = Math.sin(t * 1.4 + i) * 0.1;
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
  const winMat = K.windowMat("au-win"), doorMat = toon(scene, "au-door", "#6b4a32");
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
    if (h.rich) { // the Crown Ward: pilasters, a balcony, a family banner, a clipped hedge and an iron railing
      for (const dz of [-h.d / 2 + 0.3, h.d / 2 - 0.3]) { const pil = add(MB.CreateBox("au-pilaster", { width: 0.3, height: h.h, depth: 0.5 }, scene), 0.03); pil.position.set(fx + face * 0.1, h.h / 2, h.z + dz); pil.material = mat(wallMats, "#e8e0cf", "au-wall"); }
      const bal = add(MB.CreateBox("au-balcony", { width: 0.8, height: 0.12, depth: 2.4 }, scene), 0.03); bal.position.set(fx + face * 0.4, 4, h.z); bal.material = mat(wallMats, "#e8e0cf", "au-wall");
      const ban = add(MB.CreateBox("au-houseBanner", { width: 0.12, height: 2.2, depth: 1 }, scene), 0.02); ban.position.set(fx + face * 0.12, h.h - 2, h.z - h.d / 4); ban.material = mat(roofMats, "#8a2a3a", "au-roof");
      const hedge = add(MB.CreateBox("au-hedge", { width: 1, height: 0.9, depth: h.d - 1 }, scene), 0.03); hedge.position.set(fx + face * 1.6, 0.45, h.z); hedge.material = toon(scene, "au-hedgeMat", "#4a6a3a");
    }
  }
  const P = palette(scene, "au"), PR = props(scene, K, P);
  // The chapel of the Lantern: a narrow nave, a bell tower, a round window, candles at the door.
  const C = L.chapel, stoneC = toon(scene, "au-chapelStone", "#d8cfbe");
  const nave = add(MB.CreateBox("au-nave", { width: C.w, height: 7, depth: C.d }, scene), 0.05); nave.position.set(C.x, 3.5, C.z); nave.material = stoneC;
  const naveRoof = add(MB.CreateCylinder("au-naveRoof", { height: C.d + 0.6, diameter: C.w * 0.8, tessellation: 3 }, scene), 0.05); naveRoof.position.set(C.x, 7 + C.w * 0.2, C.z); naveRoof.rotation.set(Math.PI / 2, 0, Math.PI / 2); naveRoof.scaling.set(1.5, 1, 0.75); naveRoof.material = toon(scene, "au-chapelRoof", "#5a4a6a");
  const tower = add(MB.CreateBox("au-belltower", { width: 2.4, height: 12, depth: 2.4 }, scene), 0.05); tower.position.set(C.x, 6, C.z - C.d / 2 + 1.2); tower.material = stoneC;
  const spire = add(MB.CreateCylinder("au-spire", { height: 3.4, diameterTop: 0, diameterBottom: 3, tessellation: 4 }, scene), 0.05); spire.position.set(C.x, 13.7, C.z - C.d / 2 + 1.2); spire.rotation.y = Math.PI / 4; spire.material = naveRoof.material;
  const rose = add(MB.CreateCylinder("au-rose", { height: 0.1, diameter: 1.6, tessellation: 16 }, scene)); rose.position.set(C.x - C.w / 2 - 0.03, 5, C.z + 1); rose.rotation.z = Math.PI / 2; rose.material = K.windowMat("au-roseGlass", "#4a3a6a", "#ffcf7a");
  const cdoor = add(MB.CreatePlane("au-chapelDoor", { width: 1.6, height: 2.8, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); cdoor.position.set(C.x - C.w / 2 - 0.02, 1.4, C.z + 1); cdoor.rotation.y = Math.PI / 2; cdoor.material = doorMat;
  const candle = K.lampMat("au-candle", "#c9a24a", "#ffd36a");
  for (let i = 0; i < 5; i++) { const c = add(MB.CreateCylinder("au-candle", { height: 0.3 + (i % 3) * 0.08, diameter: 0.08, tessellation: 6 }, scene)); c.position.set(C.x - C.w / 2 - 0.5, 0.2, C.z - 0.4 + i * 0.35); c.material = candle; }
  // The Lantern & Anchor: the tavern in the west street, with benches, barrels and a sign.
  const TV = L.tavern;
  PR.sign(TV.x + 3.8, TV.z + 2.1, { ry: Math.PI / 2, hex: "#2b4f8f" });
  PR.bench(TV.x + 5.6, TV.z - 2.6, { ry: 0 }); PR.table(TV.x + 5.4, TV.z + 2.8, { ry: 0.1 }); PR.barrel(TV.x + 4.2, TV.z - 4.4); PR.barrel(TV.x + 4.9, TV.z - 4.6); PR.crate(TV.x + 4.4, TV.z + 4.4, { ry: 0.3, s: 0.7 });
  // The Watch House (data/law.js): the west-street house nearest the gate, the Watch's blue over its door.
  const WA = L.watch, watchBlue = toon(scene, "au-watchBlue", "#2b4fa0");
  for (const dz of [-1.6, 1.6]) { const b = add(MB.CreateBox("au-watchBanner", { width: 0.1, height: 1.8, depth: 0.9 }, scene), 0.02); b.position.set(WA.x - 0.18, 3.5, WA.z + dz); b.material = watchBlue; }
  const wLamp = add(MB.CreateBox("au-watchLamp", { width: 0.22, height: 0.3, depth: 0.22 }, scene)); wLamp.position.set(WA.x + 0.05, 2.7, WA.z - 0.9); wLamp.material = glow(scene, "au-watchLampGlow", "#ffd36a");
  PR.sign(WA.x + 0.7, WA.z + 1.4, { ry: Math.PI / 2, hex: "#2b4fa0" });
  // The cooper's yard by the east houses: barrels in every state of being made.
  PR.barrel(25.2, 14.6); PR.barrel(25.9, 15.3); PR.barrel(24.6, 15.8, { tipped: true, ry: 0.4 }); PR.woodpile(26.2, 12.4, { ry: Math.PI / 2 });
  // The poor quarter by the grate: shacks of patched planks, laundry, crates, a puddle.
  const plank = ["#7a5a3a", "#8a6a4a", "#6a4a32", "#9a7a5a"];
  for (const [i, h] of L.shacks.entries()) {
    const sb = add(MB.CreateBox("au-shack", { width: h.w, height: 2.6, depth: h.d }, scene), 0.04); sb.position.set(h.x, 1.3, h.z); sb.rotation.z = (i - 1) * 0.03; sb.material = P(plank[i % 4]);
    const roofS = add(MB.CreateBox("au-shackRoof", { width: h.w + 0.6, height: 0.12, depth: h.d + 0.6 }, scene), 0.03); roofS.position.set(h.x, 2.75, h.z); roofS.rotation.x = 0.12 * (i % 2 ? 1 : -1); roofS.material = P("#5a5048");
    for (let k = 0; k < 3; k++) { const pt = add(MB.CreateBox("au-roofPatch", { width: 0.9, height: 0.03, depth: 0.7 }, scene)); pt.position.set(h.x - h.w / 3 + k * h.w / 3, 2.83, h.z + (k - 1) * 0.5); pt.rotation.y = k * 0.5; pt.material = P(plank[(i + k + 1) % 4]); }
    const sd = add(MB.CreatePlane("au-shackDoor", { width: 0.9, height: 1.9, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); sd.position.set(h.x - h.w / 2 - 0.02, 0.95, h.z); sd.rotation.y = Math.PI / 2; sd.material = P("#3a2a22");
  }
  const poorCloths = PR.laundry(34.6, -25.6, 34.6, -22.4, { colors: ["#c9b48a", "#8a7a6a", "#a08a6a"] });
  PR.crate(33.5, -29.5, { ry: 0.2 }); PR.crate(34.3, -30.2, { ry: 0.9, s: 0.6 }); PR.barrel(39.4, -24); PR.sack(38.8, -23.4);
  const puddle = add(MB.CreateDisc("au-puddle", { radius: 1.2, tessellation: 14 }, scene)); puddle.rotation.x = Math.PI / 2; puddle.position.set(32.5, 0.012, -19); puddle.scaling.y = 0.6; puddle.material = P("#4a5866");
  // Market goods on every stall, and a horse waiting with a cart inside the gate.
  ["fish", "bread", "apples", "pots", "cloth", "fish"].forEach((kind, i) => { const st = L.stalls[i]; PR.goods(st.x, st.z, { kind }); });
  PR.cart(-8.5, -27.5, { ry: 0.3 });
  // Lamps along the plaza and the streets.
  const lampMat = K.lampMat("au-lamp");
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; PR.lampPost(Math.sin(a) * 13.5, Math.cos(a) * 13.5, { lampMat }); }
  for (const [x, z] of [[-20, -14], [-20, 10], [20, 12], [6, -24], [-6, -24], [28, -16]]) PR.lampPost(x, z, { lampMat });
  const critters = buildCritters(scene, K, [{ kind: "pigeon", n: 10, area: { x: 0, z: -6, r: 5 } }, { kind: "dog", n: 1, area: { x: -10.5, z: -8, r: 3 } },
    { kind: "cat", n: 1, area: { x: 35, z: -24, r: 2 } }, { kind: "horse", n: 1, area: { x: -8.5, z: -25.2, r: 0.01 }, still: true }], rng);
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
  // The grate down to the Undercroft, in the Lowmarket's back corner.
  const G = L.grate, iron = toon(scene, "au-iron", "#2a2c30");
  const pit = add(MB.CreateGround("au-grateHole", { width: 2.4, height: 2.4 }, scene)); pit.position.set(G.x, 0.02, G.z); pit.material = toon(scene, "au-pit", "#0b0c10");
  for (let i = -2; i <= 2; i++) { const bar = add(MB.CreateBox("au-grateBar", { width: 0.1, height: 0.08, depth: 2.4 }, scene)); bar.position.set(G.x + i * 0.5, 0.06, G.z); bar.material = iron; }
  const frame = add(MB.CreateTorus("au-grateRing", { diameter: 3.2, thickness: 0.18, tessellation: 4 }, scene), 0.02); frame.position.set(G.x, 0.06, G.z); frame.rotation.y = Math.PI / 4; frame.material = iron;
  const sign = add(MB.CreateBox("au-graterail", { width: 0.12, height: 1.1, depth: 0.12 }, scene), 0.02); sign.position.set(G.x - 1.6, 0.55, G.z + 1.6); sign.material = iron;
  const lamp = add(MB.CreateBox("au-grateLamp", { size: 0.3 }, scene)); lamp.position.set(G.x - 1.6, 1.2, G.z + 1.6); lamp.material = glow(scene, "au-grateLampGlow", "#7af0ff");
  // Distant skyline: the palace and towers beyond the hall.
  const far = toon(scene, "au-far", "#b8b0c8");
  for (const [x, z, w, h] of [[0, 70, 26, 30], [-26, 64, 8, 38], [26, 64, 8, 34], [-50, 50, 14, 16], [50, 52, 14, 18]]) { const b = add(MB.CreateBox("au-skyline", { width: w, height: h, depth: 8 }, scene)); b.position.set(x, h / 2, z); b.material = far; }
  // Bunting across the plaza.
  const flagCols = ["#c0504d", "#e6b54e", "#4f81bd", "#f2efe6"].map((c, i) => toon(scene, `au-flag${i}`, c));
  for (let i = 0; i < 18; i++) { const f = add(MB.CreateCylinder("au-flagT", { height: 0.5, diameter: 0.5, tessellation: 3 }, scene)); const a = (i / 18) * Math.PI * 2; f.position.set(Math.sin(a) * 9, 5.4 + Math.sin(i) * 0.2, Math.cos(a) * 9); f.rotation.set(Math.PI / 2, a, 0); f.material = flagCols[i % 4]; }
  // The Gilded Spoon: a café at the top of the Lowmarket, cream walls, a striped awning, a gold spoon sign.
  // Its door is the way in (zones.js: an exit to the "cafe" zone); its windows light up at night.
  {
    const CF = L.cafe, fz = CF.z - CF.d / 2;
    const cream = toon(scene, "au-cafeWall", "#f4e6d4"), rose = toon(scene, "au-cafeRose", "#c8607a"), white = P("#f6f1e8"), goldM = toon(scene, "au-cafeGold", "#e6b54e");
    const body = add(MB.CreateBox("au-cafe", { width: CF.w, height: 5, depth: CF.d }, scene), 0.05); body.position.set(CF.x, 2.5, CF.z); body.material = cream;
    const base = add(MB.CreateBox("au-cafeBase", { width: CF.w + 0.1, height: 0.7, depth: CF.d + 0.1 }, scene), 0.03); base.position.set(CF.x, 0.35, CF.z); base.material = rose;
    const roof = add(MB.CreateCylinder("au-cafeRoof", { height: CF.w + 0.6, diameter: CF.d * 0.72, tessellation: 3 }, scene), 0.05);
    roof.position.set(CF.x, 5 + CF.d * 0.17, CF.z); roof.rotation.set(0, 0, Math.PI / 2); roof.scaling.set(1, 1.45, 0.75); roof.material = rose;
    for (let i = 0; i < 10; i++) { // the striped awning over the front
      const st = add(MB.CreateBox("au-awning", { width: CF.w / 10, height: 0.08, depth: 1.6 }, scene), 0.02);
      st.position.set(CF.x - CF.w / 2 + (i + 0.5) * (CF.w / 10), 3.3, fz - 0.7); st.rotation.x = -0.32; st.material = i % 2 ? white : rose;
    }
    const door = add(MB.CreatePlane("au-cafeDoor", { width: 1.5, height: 2.4, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); door.position.set(CF.door.x, 1.2, fz - 0.03); door.material = toon(scene, "au-cafeDoorMat", "#6a3a2a");
    const doorGlass = add(MB.CreatePlane("au-cafeDoorGlass", { width: 0.8, height: 1, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); doorGlass.position.set(CF.door.x, 1.6, fz - 0.04); doorGlass.material = K.windowMat("au-cafeDoorWin", "#8a6a5a", "#ffd9a0");
    const cafeWin = K.windowMat("au-cafeWin", "#5a4a5a", "#ffd9a0");
    for (const dx of [-3, 3]) {
      const w = add(MB.CreatePlane("au-cafeWin", { width: 2.4, height: 1.6, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); w.position.set(CF.x + dx, 1.9, fz - 0.03); w.material = cafeWin;
      const fb = add(MB.CreateBox("au-flowerBox", { width: 2.5, height: 0.3, depth: 0.35 }, scene), 0.02); fb.position.set(CF.x + dx, 0.95, fz - 0.2); fb.material = P("#7a4a2a");
      for (let k = 0; k < 5; k++) { const f = add(MB.CreateSphere("au-flower", { diameter: 0.22, segments: 5 }, scene)); f.position.set(CF.x + dx - 1 + k * 0.5, 1.2, fz - 0.2); f.material = P(["#f08aa8", "#f6f1e8", "#e6b54e"][k % 3]); }
    }
    // The sign: a gold spoon on a rose board above the door.
    const board = add(MB.CreateBox("au-cafeSign", { width: 3.2, height: 0.7, depth: 0.12 }, scene), 0.03); board.position.set(CF.door.x, 4.2, fz - 0.08); board.material = rose;
    const handle = add(MB.CreateCylinder("au-spoonHandle", { height: 1.6, diameter: 0.1, tessellation: 6 }, scene), 0.015); handle.position.set(CF.door.x - 0.25, 4.2, fz - 0.18); handle.rotation.z = Math.PI / 2; handle.material = goldM;
    const bowl = add(MB.CreateSphere("au-spoonBowl", { diameter: 0.5, segments: 8 }, scene), 0.015); bowl.position.set(CF.door.x + 0.75, 4.2, fz - 0.18); bowl.scaling.set(1.3, 0.85, 0.35); bowl.material = goldM;
    // A chalk menu board by the door, and the terrace: two tables under parasols.
    const easel = add(MB.CreateBox("au-cafeMenu", { width: 0.8, height: 1.1, depth: 0.06 }, scene), 0.02); easel.position.set(CF.door.x - 1.6, 0.75, fz - 0.6); easel.rotation.x = -0.2; easel.material = P("#2a2e2a");
    for (const [x, z] of CF.terrace) {
      PR.table(x, z, { ry: 0.2, mugs: 2 });
      const pole = add(MB.CreateCylinder("au-parasolPole", { height: 2.4, diameter: 0.06, tessellation: 5 }, scene)); pole.position.set(x, 1.2, z); pole.material = P("#e8e2d4");
      const top = add(MB.CreateCylinder("au-parasol", { height: 0.5, diameterTop: 0.05, diameterBottom: 2.4, tessellation: 8 }, scene), 0.03); top.position.set(x, 2.5, z); top.material = rose;
      for (const dx of [-0.9, 0.9]) PR.chair?.(x + dx, z, { ry: dx < 0 ? Math.PI / 2 : -Math.PI / 2 });
    }
    const cafeLamp = add(MB.CreateBox("au-cafeLamp", { width: 0.3, height: 0.4, depth: 0.3 }, scene)); cafeLamp.position.set(CF.door.x + 1.1, 2.7, fz - 0.25); cafeLamp.material = lampMat;
  }
  // The crowd: townsfolk with legs and arms walking the streets, and a few pairs stopped to talk (runtime/crowd.js).
  const crowd = buildCrowd(scene, K, { count: 22, rng, mobile,
    paths: [{ cx: 0, cz: 0, r: 8, dir: 1 }, { cx: 0, cz: 0, r: 11, dir: -1 }, { line: [[-23, -26], [-23, 34]] }, { line: [[23, -26], [23, 34]] }, { line: [[-20, 20], [20, 20]] }, { line: [[8, -28], [8, 18]] }],
    chatters: [[-9, -14, 0.6], [14, 9, -1.2], [-20, 24, 2.1], [26, 10, 3.0]] });
  noticeBoard(scene, K, P, L.notice);
  const gate = buildGate(scene, K, "au", AURELIN_GATE); // the Gate (Eps 46–48), over the Crown Ward
  K.bake([]);
  const env = { clear: "#a8cdf0", fog: "#c4dbf2", fogDensity: 0.008, hemi: [0.6, "#fff6e6", "#7a86a8"], sun: [0.8, "#fff1d0", [-0.4, -1, 0.55]], warm: 0 };
  const toonEnv = { lightDir: [0.4, 1, -0.55], fogColor: "#c4dbf2", fogDensity: 0.005, sky: [1.1, 1.08, 1.04], ground: [0.9, 0.88, 0.9], rim: [0.75, 0.85, 1] };
  return {
    env, toon: toonEnv, show: K.show,
    crowd, outdoor: true, windows: K.windows, lamps: K.lamps, conditions: K.conditions,
    cue: gate.cue,
    update(dt, t) {
      crowd.update(dt, this.mood); critters.update(dt, this.mood ?? {});
      for (const [i, c] of poorCloths.entries()) c.rotation.x = Math.sin(t * 2 + i) * 0.12 * (1 + (this.mood?.wind ?? 0));
      gate.update(dt, t);
    },
  };
}

/**
 * The Gate (Eps 46–48): a tear across the sky, red at the edges, and the sky gone red round it. Through it, far off,
 * rows of something standing very still, like a field of spears; and later (cue "gateThrone", or $GATE_THRONE once it's
 * been seen) a vast empty throne with a sealed black coffin before it, whose lid shifts, very slightly (cue
 * "coffinShift", or $COFFIN_SHIFTED). Cue "gateOpen" tears it open on screen; once the story has opened it
 * ($GATE_OPEN) it's simply there. at: where it hangs ({ x, y, z }); it faces the middle of the set.
 */
function buildGate(scene, K, prefix, at) {
  const BB = B(), MB = BB.MeshBuilder, add = K.add;
  const root = new BB.TransformNode(`${prefix}-gateRoot`, scene); root.parent = K.root;
  const gate = new BB.TransformNode(`${prefix}-gate`, scene); gate.parent = root; gate.position.set(at.x, at.y, at.z); gate.rotation.y = Math.atan2(-at.x, -at.z);
  const tear = makeTear(scene, `${prefix}-gateTear`, { r: 24, kind: "gate", seed: 46, ground: false, stretch: [1.55, 0.66] }); tear.parent = gate;
  const dark = toon(scene, `${prefix}-gateRank`, "#120606");
  for (let row = 0; row < 3; row++) for (let i = -11; i <= 11; i++) { // ranks, far off, very still: a field of spears
    const x = i * 2.0 + (row % 2) * 1.0, y = -9.5 + row * 1.9, s = 1.6 - row * 0.2;
    const body = add(MB.CreateBox(`${prefix}-gateRank`, { width: 0.55 * s, height: 1.4 * s, depth: 0.1 }, scene)); body.parent = gate; body.position.set(x, y, 2); body.material = dark; // in front of the hole, not behind it
    const spear = add(MB.CreateBox(`${prefix}-gateSpear`, { width: 0.08 * s, height: 2.6 * s, depth: 0.06 }, scene)); spear.parent = gate; spear.position.set(x + 0.32 * s, y + 0.6 * s, 2); spear.material = dark;
  }
  // The throne and the coffin, framed above the ranks.
  const throne = new BB.TransformNode(`${prefix}-gateThrone`, scene); throne.parent = gate; throne.setEnabled(false);
  const tm = toon(scene, `${prefix}-gateThroneM`, "#0a0303");
  const part = (w, h, d, x, y, z, m = tm) => { const b = add(MB.CreateBox(`${prefix}-gateThronePart`, { width: w, height: h, depth: d }, scene)); b.parent = throne; b.position.set(x, y, z); b.material = m; return b; };
  part(5.2, 9.5, 0.3, 0, 3.2, 2.4); part(6.4, 1.2, 0.4, 0, -0.9, 2.3); part(0.7, 4.2, 0.4, -2.9, 0.6, 2.3); part(0.7, 4.2, 0.4, 2.9, 0.6, 2.3); // back, seat, arms
  part(0.9, 1.6, 0.3, -2.6, 8.6, 2.4); part(0.9, 1.6, 0.3, 2.6, 8.6, 2.4); // the back's two horns of stone
  part(6.2, 1.3, 0.4, 0, -3.6, 1.6); // the coffin, before it
  const lid = part(6.4, 0.32, 0.45, 0, -2.78, 1.5, toon(scene, `${prefix}-gateLidM`, "#140606"));
  const redSky = add(MB.CreateSphere(`${prefix}-redSky`, { diameter: 320, segments: 12, sideOrientation: BB.Mesh.BACKSIDE }, scene)); redSky.parent = root;
  const redM = glow(scene, `${prefix}-redSkyM`, "#ff3a1a", 0.0, true); redM.fogEnabled = false; redSky.material = redM; redSky.isPickable = false;
  const isOpen = K.when("$GATE_OPEN"), thronePinned = K.when("$GATE_THRONE"), shifted = K.when("$COFFIN_SHIFTED");
  let open = 0, want = 0, showThrone = false, shift = 0, shiftWant = 0, sealed = false;
  root.setEnabled(false);
  return {
    cue(name) {
      if (name === "gateOpen") { want = 1; sealed = false; }
      if (name === "gateShut") { want = 0; open = 0; }
      if (name === "gateSeal") { want = 0; sealed = true; } // closed from the other side (Ep 50): it draws shut, slowly
      if (name === "gateThrone") showThrone = true;
      if (name === "coffinShift") shiftWant = 1;
    },
    update(dt, t) {
      if (isOpen.isEnabled() && !want && !sealed) { want = 1; open = 1; } // already open in the story
      if (thronePinned.isEnabled()) showThrone = true;
      if (shifted.isEnabled() && !shiftWant) { shiftWant = 1; shift = 1; }
      open = sealed ? Math.max(0, open - dt * 0.35) : Math.min(want, open + dt * 0.55);
      root.setEnabled(open > 0.01);
      if (open <= 0.01) return;
      const e = 1 - (1 - open) ** 3;
      tear.scaling.set(e, 0.15 + 0.85 * e, 1); redM.alpha = 0.26 * e; tear.rotation.z = Math.sin(t * 0.3) * 0.01;
      throne.setEnabled(showThrone && open > 0.9);
      shift = Math.min(shiftWant, shift + dt * 0.25); // a hand's breadth, slowly
      lid.position.x = shift * 0.55; lid.rotation.z = -shift * 0.03;
    },
  };
}

// ---- Thornwick: the home village (green and oak, orphanage, smithy, mill, fields, fence) ------
function buildThornwick(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = THORNWICK_LAYOUT;
  const rng = mulberry(77);
  const grass = toon(scene, "tw-grass", "#6a8e4c"), dirt = toon(scene, "tw-dirt", "#a08060"), dirtDark = toon(scene, "tw-dirtDark", "#8a6c4c");
  const ground = add(MB.CreateGround("tw-ground", { width: 140, height: 140 }, scene)); ground.material = grass;
  const green = add(MB.CreateDisc("tw-green", { radius: 9, tessellation: 40 }, scene)); green.rotation.x = Math.PI / 2; green.position.y = 0.01; green.material = toon(scene, "tw-greenMat", "#76a052");
  // Dirt roads: east to the Lighthouse, north-west to the fens, south-east to the mill.
  for (const [x, z, w, d, rot] of [[19, 0, 22, 3.2, 0], [-12, 17, 3, 26, -0.55], [12, -12, 3, 22, 0.75], [0, 10, 3, 12, 0]]) {
    const r = add(MB.CreateGround("tw-road", { width: w, height: d }, scene)); r.position.set(x, 0.015, z); r.rotation.y = rot; r.material = dirt;
  }
  // The old oak in the middle of the green.
  const bark = toon(scene, "tw-bark", "#5a4230"), leaves = toon(scene, "tw-leaves", "#4f7a3a"), leaves2 = toon(scene, "tw-leaves2", "#5f8c44");
  const tree = (x, z, s) => {
    const t = add(MB.CreateCylinder("tw-trunk", { height: 3.2 * s, diameterTop: 0.5 * s, diameterBottom: 0.9 * s, tessellation: 8 }, scene), 0.04); t.position.set(x, 1.6 * s, z); t.material = bark;
    for (let k = 0; k < 3; k++) { const c = add(MB.CreateSphere("tw-crown", { diameter: (2.6 - k * 0.4) * s, segments: 8 }, scene), 0.04); c.position.set(x + (k - 1) * 0.7 * s, (3.4 + k * 0.6) * s, z + (k % 2) * 0.5 * s); c.material = k % 2 ? leaves2 : leaves; }
  };
  tree(L.oak.x, L.oak.z, 1.6);
  for (let i = 0; i < 14; i++) { const a = rng() * Math.PI * 2, r = 34 + rng() * 14; tree(Math.sin(a) * r, Math.cos(a) * r, 1 + rng() * 0.6); }
  // Houses: timber walls, steep thatched roofs, a door facing the green.
  const wall = toon(scene, "tw-wall", "#e6d6b4"), beam = toon(scene, "tw-beam", "#5a4230"), thatch = toon(scene, "tw-thatch", "#c9a24a"), door = toon(scene, "tw-door", "#6b4a32"), win = K.windowMat("tw-win", "#4a4a3a", "#ffcf7a");
  const house = (x, z, w, d, h, roofCol = thatch) => {
    const b = add(MB.CreateBox("tw-house", { width: w, height: h, depth: d }, scene), 0.05); b.position.set(x, h / 2, z); b.material = wall;
    for (const dx of [-w / 2, w / 2]) for (const dz of [-d / 2, d / 2]) { const post = add(MB.CreateBox("tw-post", { width: 0.25, height: h, depth: 0.25 }, scene)); post.position.set(x + dx, h / 2, z + dz); post.material = beam; }
    const roof = add(MB.CreateCylinder("tw-roof", { height: d + 0.8, diameter: w * 0.9, tessellation: 3 }, scene), 0.05);
    roof.position.set(x, h + w * 0.2, z); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.scaling.set(1.5, 1, 0.9); roof.material = roofCol;
    const tx = Math.abs(x) > Math.abs(z) ? -Math.sign(x) : 0, tz = tx ? 0 : -Math.sign(z || 1); // face the green
    const dp = add(MB.CreatePlane("tw-doorP", { width: 1.1, height: 2, sideOrientation: BB.Mesh.DOUBLESIDE }, scene));
    dp.position.set(x + tx * (w / 2 + 0.02), 1, z + tz * (d / 2 + 0.02)); dp.rotation.y = tx ? Math.PI / 2 : 0; dp.material = door;
    const wp = add(MB.CreatePlane("tw-winP", { width: 0.8, height: 0.7, sideOrientation: BB.Mesh.DOUBLESIDE }, scene));
    wp.position.set(x + tx * (w / 2 + 0.02) + (tx ? 0 : 1.6), 1.6, z + tz * (d / 2 + 0.02) + (tx ? 1.6 : 0)); wp.rotation.y = dp.rotation.y; wp.material = win;
  };
  // Props built inside `under(node, …)` go under a conditional node instead of the set root.
  const under = (node, fn) => { const before = new Set(K.root.getChildren()); fn(); for (const c of K.root.getChildren()) if (!before.has(c) && c !== node) c.parent = node; };
  const BARN = L.houses.find((h) => h.x === -22 && h.z === -18);
  for (const h of L.houses) if (h !== BARN) house(h.x, h.z, h.w, h.d, 3 + rng() * 0.6);
  // The barn the bandits burned (GDD §29.12): ruins → scaffolding a visit after the road is cleared → rebuilt two visits later.
  const P = palette(scene, "tw"), PR = props(scene, K, P);
  const since = "$VISITS_THORNWICK - $BANDITS_CLEARED_VISIT";
  under(K.when(`not $BANDITS_CLEARED or ${since} < 1`), () => PR.ruin(BARN.x, BARN.z, { w: BARN.w, d: BARN.d }));
  under(K.when(`$BANDITS_CLEARED and ${since} >= 1 and ${since} < 3`), () => { PR.ruin(BARN.x, BARN.z, { w: BARN.w * 0.5, d: BARN.d * 0.5 }); PR.scaffold(BARN.x, BARN.z, { w: BARN.w, d: BARN.d }); });
  under(K.when(`$BANDITS_CLEARED and ${since} >= 3`), () => house(BARN.x, BARN.z, BARN.w, BARN.d, 3.2, toon(scene, "tw-newThatch", "#e0c060")));
  // The orphanage: the biggest building in the village, two floors and a bell.
  const O = L.orphanage, ow = O.x1 - O.x0, od = O.z1 - O.z0;
  house((O.x0 + O.x1) / 2, (O.z0 + O.z1) / 2, ow, od, 5.4, toon(scene, "tw-orphRoof", "#8a4a3a"));
  for (let i = 0; i < 4; i++) { const w = add(MB.CreatePlane("tw-orphWin", { width: 1, height: 0.9, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); w.position.set(O.x0 + 2 + i * ((ow - 4) / 3), 3.9, O.z0 - 0.03); w.material = win; }
  const bellTower = add(MB.CreateBox("tw-bell", { width: 1.4, height: 1.6, depth: 1.4 }, scene), 0.04); bellTower.position.set(0, 9.2, (O.z0 + O.z1) / 2); bellTower.material = wall;
  const bell = add(MB.CreateCylinder("tw-bellB", { height: 0.6, diameterTop: 0.3, diameterBottom: 0.7, tessellation: 10 }, scene), 0.02); bell.position.set(0, 9.1, (O.z0 + O.z1) / 2 - 0.71); bell.material = toon(scene, "tw-bronze", "#c9a24a");
  const sign = add(MB.CreateBox("tw-sign", { width: 2.4, height: 0.6, depth: 0.1 }, scene), 0.02); sign.position.set(0, 3.1, O.z0 - 0.08); sign.material = toon(scene, "tw-signMat", "#e6b54e");
  // The smithy: open-sided, with a glowing forge and an anvil.
  const S = L.smithy;
  const roofS = add(MB.CreateBox("tw-smithRoof", { width: S.w + 0.6, height: 0.3, depth: S.d + 0.6 }, scene), 0.04); roofS.position.set(S.x, 2.9, S.z); roofS.material = toon(scene, "tw-slate", "#4a4a52");
  for (const dx of [-S.w / 2, S.w / 2]) for (const dz of [-S.d / 2, S.d / 2]) { const p = add(MB.CreateBox("tw-sPost", { width: 0.3, height: 2.9, depth: 0.3 }, scene), 0.02); p.position.set(S.x + dx, 1.45, S.z + dz); p.material = beam; }
  const forge = add(MB.CreateBox("tw-forge", { width: 1.6, height: 1, depth: 1.4 }, scene), 0.03); forge.position.set(S.x - 1, 0.5, S.z + 0.6); forge.material = toon(scene, "tw-stone", "#7a7466");
  const coals = add(MB.CreateBox("tw-coals", { width: 1.1, height: 0.1, depth: 0.9 }, scene)); coals.position.set(S.x - 1, 1.02, S.z + 0.6); coals.material = glow(scene, "tw-coalGlow", "#ff7a3a");
  const chimney = add(MB.CreateBox("tw-chimney", { width: 0.7, height: 4.4, depth: 0.7 }, scene), 0.03); chimney.position.set(S.x - 1.4, 2.2, S.z + 1.2); chimney.material = forge.material;
  const anvil = add(MB.CreateBox("tw-anvil", { width: 0.9, height: 0.5, depth: 0.4 }, scene), 0.02); anvil.position.set(S.x + 1, 0.6, S.z - 0.4); anvil.material = toon(scene, "tw-anvilMat", "#2f3136");
  // The mill: a round stone tower with four turning sails.
  const M = L.mill;
  const mill = add(MB.CreateCylinder("tw-mill", { height: 8, diameterTop: M.r * 1.6, diameterBottom: M.r * 2, tessellation: 14 }, scene), 0.05); mill.position.set(M.x, 4, M.z); mill.material = toon(scene, "tw-millStone", "#cfc2a8");
  const cap = add(MB.CreateCylinder("tw-millCap", { height: 2, diameterTop: 0.2, diameterBottom: M.r * 1.9, tessellation: 14 }, scene), 0.05); cap.position.set(M.x, 9, M.z); cap.material = toon(scene, "tw-millCapMat", "#8a4a3a");
  const hub = new BB.TransformNode("tw-millHub", scene); hub.parent = K.root; hub.position.set(M.x - M.r * 0.9, 7, M.z);
  const sailMat = toon(scene, "tw-sail", "#f2ead8");
  for (let i = 0; i < 4; i++) {
    const arm = new BB.TransformNode(`tw-arm${i}`, scene); arm.parent = hub; arm.rotation.x = (i / 4) * Math.PI * 2;
    const sl = add(MB.CreateBox("tw-sailB", { width: 0.1, height: 5.6, depth: 1.2 }, scene), 0.02); sl.parent = arm; sl.position.set(0, 3, 0.4); sl.material = sailMat;
  }
  // Fields: rows of wheat beyond the mill road.
  const F = L.fields, wheat = toon(scene, "tw-wheat", "#d8b85a");
  // Low wheat in short clumps (instanced), so fighters wade through it rather than stand on it.
  const clump = MB.CreateCylinder("tw-wheatClump", { height: 0.45, diameterTop: 0.5, diameterBottom: 0.25, tessellation: 5 }, scene); clump.material = wheat; clump.parent = K.root; clump.isPickable = false;
  let nClump = 0;
  for (let z = F.z0 + 1; z < F.z1; z += 1.6) for (let x = F.x0 + 1.5; x < F.x1 - 1; x += 0.9) {
    const c = nClump++ ? clump.createInstance(`tw-wc${nClump}`) : clump; c.parent = K.root; c.isPickable = false;
    c.position.set(x + (rng() - 0.5) * 0.3, 0.22, z + (rng() - 0.5) * 0.3); c.scaling.y = 0.8 + rng() * 0.5;
  }
  const furrow = add(MB.CreateGround("tw-furrow", { width: F.x1 - F.x0, height: F.z1 - F.z0 }, scene)); furrow.position.set((F.x0 + F.x1) / 2, 0.012, (F.z0 + F.z1) / 2); furrow.material = dirtDark;
  // The mill road: the bandits' camp → after the fight, the mess they left → later, carts on the road again.
  under(K.when("not $BANDITS_CLEARED"), () => {
    PR.crate(24, -21, { ry: 0.4 }); PR.crate(25.2, -21.6, { ry: 1.1, s: 0.6 }); PR.crate(15, -27, { ry: 2 });
    PR.campfire(20, -25, { lit: false }); PR.sack(21.3, -24.2); PR.sack(18.8, -25.6);
    for (const [x, z, r] of [[22, -26.5, 0.3], [18, -23.5, 1.9]]) { const roll = add(MB.CreateCylinder("tw-bedroll", { height: 1.6, diameter: 0.35, tessellation: 8 }, scene), 0.02); roll.position.set(x, 0.17, z); roll.rotation.set(Math.PI / 2, r, 0); roll.material = P("#6a5a4a"); }
  });
  under(K.when(`$BANDITS_CLEARED and ${since} < 1`), () => {
    PR.crate(24, -21, { broken: true, ry: 0.4 }); PR.crate(15.5, -26, { broken: true, ry: 1.5 }); PR.campfire(20, -25, { lit: false });
    PR.droppedBlade(19, -22.5, { ry: 0.8 }); PR.droppedBlade(22.4, -24, { ry: 2.3 }); PR.sack(21.3, -24.2);
  });
  under(K.when(`$BANDITS_CLEARED and ${since} >= 1`), () => { PR.cart(22, -23, { ry: -0.9 }); PR.hay(26, -26, { ry: 0.3 }); });
  // Everyday Thornwick: the tavern, the well, the woodpile, laundry, hay, the mill cart, lamps.
  PR.sign(-15.4, 10.4, { ry: Math.PI / 2, hex: "#8a3a2a" });
  PR.bench(-13.8, 7.6, { ry: 0 }); PR.table(-13.6, 10.8, { ry: 0.2 }); PR.barrel(-15.9, 12.6); PR.barrel(-15.2, 13.3); PR.barrel(-14.6, 12.5, { tipped: true, ry: 0.6 });
  PR.well(L.well.x, L.well.z);
  PR.woodpile(-12.6, -10.8, { ry: 0 }); PR.woodpile(-21, 5.5, { ry: Math.PI / 2 });
  const cloths = PR.laundry(-12.5, 13.5, -8.2, 14.6, { colors: ["#e8e2d4", "#c9b48a", "#8a6a9a", "#d8c8a8"] });
  PR.hay(17.4, -8.6, { ry: 0.4 }); PR.hay(18.6, -7.4, { ry: 1.2 }); PR.cart(25.5, -9.5, { ry: 1.3 }); PR.barrel(23.5, -14.6); PR.sack(24.2, -14.9);
  PR.fence(22, 2.6, 28.4, 2.6); PR.fence(22, 5.8, 28.4, 5.8); PR.fence(28.4, 2.6, 28.4, 5.8); PR.fence(22, 2.6, 22, 3.6);
  PR.fence(20, 16, 28.6, 16); PR.fence(20, 16, 20, 20); PR.fence(20, 22, 20, 28.6);
  const lampMat = K.lampMat("tw-lamp");
  for (const [x, z] of [[6.5, 6.5], [-6.5, 6.5], [6.5, -7], [-14.6, 6.4]]) PR.lampPost(x, z, { lampMat });
  const critters = buildCritters(scene, K, [{ kind: "chicken", n: 6, area: { rect: [22.6, 3, 28, 5.4] } }, { kind: "sheep", n: 4, area: { rect: [21, 17, 28, 28] } },
    { kind: "cow", n: 2, area: { rect: [21, 17, 28, 28] } }, { kind: "dog", n: 1, area: { x: 0, z: -2, r: 8 } }, { kind: "cat", n: 1, area: { x: 3.2, z: 15.3, r: 0.1 }, still: true }], rng);
  // A wooden palisade around the village, with gaps for the roads (instanced posts).
  const postSrc = MB.CreateCylinder("tw-fence", { height: 2.4, diameter: 0.4, tessellation: 6 }, scene); postSrc.material = beam; postSrc.parent = K.root; postSrc.isPickable = false;
  const posts = [];
  for (let i = -31; i <= 31; i += 1) for (const [x, z] of [[i, 31], [i, -31], [31, i], [-31, i]]) {
    if (x === 31 && Math.abs(z) < 7) continue; if (z === 31 && x > -27 && x < -15) continue;
    posts.push([x, z]);
  }
  postSrc.position.set(posts[0][0], 1.2, posts[0][1]);
  for (let i = 1; i < posts.length; i++) { const p = postSrc.createInstance(`tw-f${i}`); p.parent = K.root; p.isPickable = false; p.position.set(posts[i][0], 1.1 + (i % 3) * 0.12, posts[i][1]); }
  // Rolling hills on the horizon.
  const hill = toon(scene, "tw-hill", "#6a9050");
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, r = 60; const h = add(MB.CreateSphere("tw-hillS", { diameter: 30 + rng() * 20, segments: 8 }, scene)); h.position.set(Math.sin(a) * r, -6, Math.cos(a) * r); h.scaling.y = 0.5; h.material = hill; }
  const smoke = new BB.ParticleSystem("tw-smoke", mobile ? 20 : 40, scene);
  smoke.particleTexture = softTexture(scene); smoke.emitter = new BB.Vector3(S.x - 1.4, 4.5, S.z + 1.2);
  smoke.color1 = new BB.Color4(0.8, 0.8, 0.8, 0.35); smoke.color2 = new BB.Color4(0.7, 0.7, 0.7, 0.25); smoke.colorDead = new BB.Color4(0.7, 0.7, 0.7, 0);
  smoke.minSize = 0.6; smoke.maxSize = 1.4; smoke.minLifeTime = 2; smoke.maxLifeTime = 3.5; smoke.emitRate = 8; smoke.gravity = new BB.Vector3(0.2, 0.6, 0);
  smoke.direction1 = new BB.Vector3(-0.1, 1, -0.1); smoke.direction2 = new BB.Vector3(0.1, 1, 0.1); smoke.minEmitPower = 0.2; smoke.maxEmitPower = 0.4; smoke.blendMode = BB.ParticleSystem.BLENDMODE_STANDARD;
  K.systems.push(smoke);
  // Villagers about their day: across the green, down the mill road, and two neighbors gossiping.
  const crowd = buildCrowd(scene, K, { count: 6, rng, mobile,
    paths: [{ cx: 0, cz: 0, r: 6.5, dir: 1 }, { line: [[3, -5], [17, -15]] }, { line: [[-4, 6], [-13, 19]] }, { line: [[1, -9], [1, 12]] }],
    chatters: [[-4.5, -13.5, 0.4], [9.5, 3.5, 2.0]] });
  K.bake([]);
  const env = { clear: "#b4d4ee", fog: "#cfe0ea", fogDensity: 0.009, hemi: [0.62, "#fff4e0", "#6a7a5a"], sun: [0.85, "#fff0c8", [-0.5, -1, 0.35]], warm: 0 };
  const toonEnv = { lightDir: [0.5, 1, -0.35], fogColor: "#cfe0ea", fogDensity: 0.006, sky: [1.1, 1.08, 1.0], ground: [0.86, 0.9, 0.8], rim: [0.85, 0.85, 0.8] };
  return {
    env, toon: toonEnv, show: K.show,
    crowd, outdoor: true, windows: K.windows, lamps: K.lamps, conditions: K.conditions,
    update(dt, t) {
      hub.rotation.x += dt * 0.5; crowd.update(dt, this.mood); critters.update(dt, this.mood ?? {});
      for (const [i, c] of cloths.entries()) c.rotation.x = Math.sin(t * 2.2 + i) * 0.12 * (1 + (this.mood?.wind ?? 0));
    },
  };
}

// ---- The Undercroft: rooms of the old city under Aurelin, joined by narrow passages ---------
function buildUndercroft(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const rng = mulberry(91);
  const floor = toon(scene, "uc-floor", "#4a4640"), floorDark = toon(scene, "uc-floorDark", "#3a3732"), rock = toon(scene, "uc-rock", "#2e2b29"), rockTop = toon(scene, "uc-rockTop", "#1d1b1a");
  const brick = toon(scene, "uc-brick", "#5a4a3e"), brass = toon(scene, "uc-brass", "#a07a3a"), torchGlow = glow(scene, "uc-torch", "#ffb35a");
  const HALF = 14, WALL = 1.3; // low walls: the camera follows from above, so it has to see over them
  for (const [z0, z1, hw] of UNDERCROFT_BANDS) {
    const f = add(MB.CreateGround("uc-band", { width: hw * 2, height: z1 - z0 }, scene)); f.position.set(0, 0, (z0 + z1) / 2); f.material = hw > 2 ? floor : floorDark;
    if (hw >= HALF) continue;
    for (const side of [-1, 1]) { // rock walls either side, flat-topped so the camera sees over them
      const w = HALF + 1 - hw;
      const r = add(MB.CreateBox("uc-wall", { width: w, height: WALL, depth: z1 - z0 }, scene), 0.04); r.position.set(side * (hw + w / 2), WALL / 2, (z0 + z1) / 2); r.material = rock;
      const top = add(MB.CreateGround("uc-wallTop", { width: w, height: z1 - z0 }, scene)); top.position.set(side * (hw + w / 2), WALL + 0.01, (z0 + z1) / 2); top.material = rockTop;
      if (hw > 2) for (let z = z0 + 2; z < z1 - 1; z += 5) { // torches along room walls
        const t = add(MB.CreateBox("uc-torchStick", { width: 0.12, height: 0.7, depth: 0.12 }, scene)); t.position.set(side * (hw + 0.3), WALL + 0.35, z); t.material = brass;
        const fl = add(MB.CreateSphere("uc-flame", { diameter: 0.3, segments: 6 }, scene)); fl.position.set(side * (hw + 0.3), WALL + 0.8, z); fl.material = torchGlow;
      }
    }
  }
  // Brick posts either side of each passage; brass pipes along the room walls.
  for (const z of [-22, -14, 2, 10, 26, 32]) {
    for (const x of [-2.4, 2.4]) { const p = add(MB.CreateBox("uc-pillar", { width: 0.7, height: WALL + 0.6, depth: 0.7 }, scene), 0.04); p.position.set(x, (WALL + 0.6) / 2, z); p.material = brick; }
  }
  for (const [z0, z1, hw] of UNDERCROFT_BANDS) if (hw > 2 && hw < HALF) for (const side of [-1, 1]) {
    const pipe = add(MB.CreateCylinder("uc-pipe", { height: z1 - z0 - 1, diameter: 0.22, tessellation: 8 }, scene), 0.02); pipe.rotation.x = Math.PI / 2; pipe.position.set(side * (hw - 0.2), 0.3 + rng() * 0.7, (z0 + z1) / 2); pipe.material = brass;
  }
  // Rubble, crates and fish bones.
  for (let i = 0; i < 18; i++) { const [z0, z1, hw] = UNDERCROFT_BANDS[[0, 2, 4, 6][i % 4]]; const s = 0.3 + rng() * 0.5; const r = add(MB.CreateSphere("uc-rubble", { diameter: s, segments: 5 }, scene)); r.position.set((rng() - 0.5) * (hw * 2 - 2), s * 0.3, z0 + 1 + rng() * (z1 - z0 - 2)); r.material = rock; }
  for (let i = 0; i < 8; i++) { const b = add(MB.CreateBox("uc-bone", { width: 0.4, height: 0.04, depth: 0.08 }, scene)); b.position.set(3.4 + (rng() - 0.5), 0.03, -25 + (rng() - 0.5)); b.rotation.y = rng() * 3; b.material = toon(scene, "uc-boneMat", "#e8e0cc"); }
  // The stairs up to the Lowmarket.
  for (let i = 0; i < 5; i++) { const st = add(MB.CreateBox("uc-stair", { width: 5, height: 0.4, depth: 0.8 }, scene), 0.03); st.position.set(0, 0.2 + i * 0.4, -34.4 - i * 0.8); st.material = brick; }
  const shaft = add(MB.CreateCylinder("uc-shaft", { height: 0.1, diameter: 4, tessellation: 4 }, scene)); shaft.position.set(0, 4, -37); shaft.material = glow(scene, "uc-daylight", "#fff3d0", 0.5, true); K.noGlow(shaft);
  // The Gear Hall: a huge brass gear turning in the far wall, and pillars.
  const gearHub = new BB.TransformNode("uc-gearHub", scene); gearHub.parent = K.root; gearHub.position.set(0, 4, 46.4);
  const big = add(MB.CreateTorus("uc-bigGear", { diameter: 8, thickness: 0.8, tessellation: 24 }, scene), 0.05); big.parent = gearHub; big.position.set(0, 0, 0); big.rotation.x = Math.PI / 2; big.material = brass;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const t = add(MB.CreateBox("uc-tooth", { width: 0.7, height: 0.7, depth: 0.5 }, scene)); t.parent = gearHub; t.position.set(Math.sin(a) * 4.4, Math.cos(a) * 4.4, 0); t.rotation.z = -a; t.material = brass; }
  const core = add(MB.CreateCylinder("uc-gearCore", { height: 0.6, diameter: 1.4, tessellation: 12 }, scene)); core.parent = gearHub; core.rotation.x = Math.PI / 2; core.position.set(0, 0, 0); core.material = glow(scene, "uc-coreGlow", "#7af0ff");
  const backWall = add(MB.CreateBox("uc-backWall", { width: 30, height: 9, depth: 0.6 }, scene), 0.04); backWall.position.set(0, 4.5, 46.9); backWall.material = brick;
  for (const x of [-14.6, 14.6]) { const w = add(MB.CreateBox("uc-hallSide", { width: 1.2, height: WALL * 2, depth: 14 }, scene), 0.04); w.position.set(x, WALL, 39); w.material = rock; }
  for (const x of [-4.5, 4.5]) { const w = add(MB.CreateBox("uc-southWall", { width: 3, height: WALL, depth: 1 }, scene), 0.04); w.position.set(x, WALL / 2, -34.5); w.material = rock; }
  for (const x of [-9, 9]) for (const z of [36, 42]) { const p = add(MB.CreateCylinder("uc-col", { height: 4.4, diameter: 0.9, tessellation: 10 }, scene), 0.04); p.position.set(x, 2.2, z); p.material = brass; }
  // Dust drifting in the torchlight.
  const dust = new BB.ParticleSystem("uc-dust", mobile ? 25 : 50, scene);
  dust.particleTexture = softTexture(scene); dust.emitter = new BB.Vector3(0, 1, 6);
  dust.minEmitBox = new BB.Vector3(-10, 0, -38); dust.maxEmitBox = new BB.Vector3(10, 2.5, 38);
  dust.color1 = new BB.Color4(1, 0.85, 0.6, 0.3); dust.color2 = new BB.Color4(0.8, 0.9, 1, 0.2); dust.colorDead = new BB.Color4(1, 1, 1, 0);
  dust.minSize = 0.05; dust.maxSize = 0.14; dust.minLifeTime = 4; dust.maxLifeTime = 7; dust.emitRate = mobile ? 5 : 10; dust.gravity = new BB.Vector3(0, 0.02, 0);
  dust.minEmitPower = 0.02; dust.maxEmitPower = 0.08; dust.blendMode = BB.ParticleSystem.BLENDMODE_ADD;
  K.systems.push(dust);
  // The old city: broken statues, bone piles, rat nests, crates nobody has opened in a century.
  const P = palette(scene, "uc"), PR = props(scene, K, P);
  PR.statue(-9, 39, { broken: true }); PR.statue(9, 44); PR.statue(-6, -31, { broken: true });
  PR.bones(-7, -8); PR.bones(6, -1); PR.bones(-3, 0.5); PR.bones(8, 20);
  for (const [x, z] of [[-8.5, -11], [8.5, -2.5], [-10.5, 22]]) { const nest = add(MB.CreateSphere("uc-nest", { diameter: 1.2, segments: 6 }, scene), 0.02); nest.position.set(x, 0.1, z); nest.scaling.y = 0.3; nest.material = P("#8a7a4a"); }
  // After Ep 33: the crack in the last passage's wall, a thread of pale light, down to the old city.
  const crack = K.when("$EP33_DONE"), crackM = glow(scene, "uc-crack", "#d8c8ff", 0.85);
  for (const [dy, h, tilt] of [[0.2, 1.1, 0.12], [1.0, 0.9, -0.2]]) { const c = MB.CreatePlane("uc-crack", { width: 0.1, height: h, sideOrientation: BB.Mesh.DOUBLESIDE }, scene); c.parent = crack; c.position.set(-1.98, dy + h / 2, 29.3); c.rotation.set(0, Math.PI / 2, tilt); c.material = crackM; c.isPickable = false; }
  PR.crate(-10, 12.4, { ry: 0.2 }); PR.crate(-10.6, 13.4, { ry: 0.8, s: 0.6 }); PR.crate(9.5, 24, { broken: true }); PR.droppedBlade(-4, 40.5, { ry: 1.2 }); PR.barrel(10.6, 12, { tipped: true, ry: 0.9 });
  K.bake([]);
  const env = { clear: "#0a0b0f", fog: "#14151b", fogDensity: 0.028, hemi: [0.5, "#ffd9a8", "#2a2420"], sun: [0.35, "#ffcf9a", [0.2, -1, 0.3]], warm: 0 };
  const toonEnv = { lightDir: [-0.2, 1, -0.3], fogColor: "#14151b", fogDensity: 0.02, sky: [0.92, 0.84, 0.74], ground: [0.6, 0.56, 0.52], rim: [0.6, 0.85, 1.0] };
  return {
    env, toon: toonEnv, show: K.show,
    update(dt, t) {
      gearHub.rotation.z += dt * 0.15;
      torchGlow.alpha = 0.85 + Math.sin(t * 13) * 0.1;
    },
  };
}

// ---- Interiors: a room seen from above. The wall between the camera and the room hides itself. ----
function buildRoom(scene, K, { prefix, half: [hx, hz], height = 4, wall, wainscot, floorA, floorB, door, windows = [] }) {
  const BB = B(), MB = BB.MeshBuilder, add = K.add;
  const fa = toon(scene, `${prefix}-floorA`, floorA), fb = toon(scene, `${prefix}-floorB`, floorB);
  for (let x = -hx; x < hx; x++) for (let z = -hz; z < hz; z++) { const t = add(MB.CreateGround(`${prefix}-tile`, { width: 1, height: 1 }, scene)); t.position.set(x + 0.5, 0.005, z + 0.5); t.material = (x + z) & 1 ? fa : fb; }
  const outside = add(MB.CreateGround(`${prefix}-outside`, { width: 80, height: 80 }, scene)); outside.position.y = -0.02; outside.material = toon(scene, `${prefix}-void`, "#141218");
  const wallM = toon(scene, `${prefix}-wall`, wall), lowM = toon(scene, `${prefix}-wainscot`, wainscot), trimM = toon(scene, `${prefix}-trim`, "#5a3a2a");
  const walls = {}, keep = [];
  const side = (key, cx, cz, len, alongX, gap) => {
    const node = new BB.TransformNode(`${prefix}-wall-${key}`, scene); node.parent = K.root; walls[key] = node;
    const segs = gap ? [[-len / 2, gap[0] - 0.8], [gap[0] + 0.8, len / 2]] : [[-len / 2, len / 2]];
    for (const [a, b] of segs) {
      const w = b - a, mid = (a + b) / 2;
      for (const [y0, y1, m] of [[0, 1.1, lowM], [1.1, height, wallM]]) {
        const p = add(MB.CreateBox(`${prefix}-wallPart`, { width: alongX ? w : 0.25, height: y1 - y0, depth: alongX ? 0.25 : w }, scene), 0.03);
        p.parent = node; p.position.set(cx + (alongX ? mid : 0), (y0 + y1) / 2, cz + (alongX ? 0 : mid)); p.material = m; keep.push(p);
      }
      const rail = add(MB.CreateBox(`${prefix}-rail`, { width: alongX ? w : 0.32, height: 0.08, depth: alongX ? 0.32 : w }, scene)); rail.parent = node; rail.position.set(cx + (alongX ? mid : 0), 1.12, cz + (alongX ? 0 : mid)); rail.material = trimM; keep.push(rail);
    }
    if (gap) { // the door frame over the gap
      const lintel = add(MB.CreateBox(`${prefix}-lintel`, { width: alongX ? 1.6 : 0.25, height: height - 2.5, depth: alongX ? 0.25 : 1.6 }, scene), 0.03);
      lintel.parent = node; lintel.position.set(cx + (alongX ? gap[0] : 0), (height + 2.5) / 2, cz + (alongX ? 0 : gap[0])); lintel.material = wallM; keep.push(lintel);
    }
    // a skirting strip that stays when the wall hides, so the room's edge still reads
    const skirt = add(MB.CreateBox(`${prefix}-skirt`, { width: alongX ? len : 0.27, height: 0.18, depth: alongX ? 0.27 : len }, scene)); skirt.position.set(cx, 0.09, cz); skirt.material = trimM;
  };
  side("n", 0, hz, hx * 2, true); side("s", 0, -hz, hx * 2, true, [door.x]); side("w", -hx, 0, hz * 2, false); side("e", hx, 0, hz * 2, false);
  for (const [key, c, y, w, h] of windows) { // glowing panes on a wall: [wall key, centre along it, y, width, height]
    const node = walls[key], alongX = key === "n" || key === "s", out = { n: hz, s: -hz, e: hx, w: -hx }[key], inset = out > 0 ? -0.14 : 0.14;
    const pane = add(MB.CreatePlane(`${prefix}-win`, { width: w, height: h, sideOrientation: BB.Mesh.DOUBLESIDE }, scene));
    pane.parent = node; pane.position.set(alongX ? c : out + inset, y, alongX ? out + inset : c); pane.rotation.y = alongX ? 0 : Math.PI / 2; pane.material = K.windowMat(`${prefix}-winM`, "#9ab8d8", "#2a3050"); keep.push(pane);
  }
  return {
    keep,
    /** Hide whichever walls stand between the camera and the room. */
    cutaway(cam, focus) {
      if (!cam) return;
      const p = cam.position, f = focus ?? { x: 0, z: 0 };
      // A wall hides when the camera is beyond it, or when the camera sits well over on that wall's side of whoever it's watching.
      walls.n.setEnabled(p.z < hz - 0.5 && !(p.z > f.z + 1.5 && p.z > hz - 3));
      walls.s.setEnabled(p.z > -hz + 0.5 && !(p.z < f.z - 1.5 && p.z < -hz + 3));
      walls.w.setEnabled(p.x > -hx + 0.5 && !(p.x < f.x - 1.5 && p.x < -hx + 3));
      walls.e.setEnabled(p.x < hx - 0.5 && !(p.x > f.x + 1.5 && p.x > hx - 3));
    },
  };
}

function buildCafe(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, C = CAFE_LAYOUT;
  const P = palette(scene, "cf"), PR = props(scene, K, P);
  const room = buildRoom(scene, K, { prefix: "cf", half: C.half, wall: "#f2dfe2", wainscot: "#8a4a5a", floorA: "#e8dccb", floorB: "#3a2e34", door: C.door,
    windows: [["w", -3.2, 2.2, 1.8, 1.4], ["w", 0.6, 2.2, 1.8, 1.4], ["w", 3.8, 2.2, 1.8, 1.4], ["s", -4, 2.2, 2.2, 1.4], ["s", 4, 2.2, 2.2, 1.4]] });
  // Tables with cloths and chairs facing in, cups set out; table three's cloth is blue (the one by the window).
  for (const [id, x, z] of C.tables) {
    PR.roundTable(x, z, { cloth: id === "3" ? "#bcd4ec" : "#f2d4dc" });
    PR.chair(x - 0.95, z, { ry: Math.PI / 2 }); PR.chair(x + 0.95, z, { ry: -Math.PI / 2 });
    PR.teacup(x + 0.2, z + 0.15); const v = add(MB.CreateCylinder("cf-vase", { height: 0.2, diameter: 0.1, tessellation: 8 }, scene), 0.008); v.position.set(x - 0.15, 0.9, z - 0.1); v.material = P("#6a8acb");
    const fl = add(MB.CreateSphere("cf-bloom", { diameter: 0.14, segments: 5 }, scene)); fl.position.set(x - 0.15, 1.05, z - 0.1); fl.material = P("#f08aa8");
  }
  // The counter: dark wood, a marble top, the glass cake case (empty!) and the till.
  const CT = C.counter, wood = P("#6a3a2a");
  const ctr = add(MB.CreateBox("cf-counter", { width: CT.x1 - CT.x0, height: 1.05, depth: CT.z1 - CT.z0 }, scene), 0.03); ctr.position.set((CT.x0 + CT.x1) / 2, 0.525, (CT.z0 + CT.z1) / 2); ctr.material = wood;
  const top = add(MB.CreateBox("cf-counterTop", { width: CT.x1 - CT.x0 + 0.1, height: 0.06, depth: CT.z1 - CT.z0 + 0.12 }, scene), 0.02); top.position.set(ctr.position.x, 1.08, ctr.position.z); top.material = P("#ece8e2");
  for (let i = 0; i < 5; i++) { const pn = add(MB.CreateBox("cf-panel", { width: 0.9, height: 0.6, depth: 0.02 }, scene)); pn.position.set(CT.x0 + 0.6 + i * 1.15, 0.55, CT.z0 - 0.01); pn.material = P("#8a4a5a"); }
  const CC = C.cakeCase;
  const glass = add(MB.CreateBox("cf-caseGlass", { width: 1.2, height: 0.7, depth: 0.7 }, scene), 0.015); glass.position.set(CC.x, 1.46, CC.z); glass.material = glow(scene, "cf-glass", "#d8f0ff", 0.25, true); K.noGlow(glass);
  const stand = add(MB.CreateCylinder("cf-cakeStand", { height: 0.05, diameter: 0.6, tessellation: 16 }, scene), 0.01); stand.position.set(CC.x, 1.15, CC.z); stand.material = P("#f6f1e8");
  for (let i = 0; i < 6; i++) { const cr = add(MB.CreateSphere("cf-crumb", { diameter: 0.04, segments: 3 }, scene)); cr.position.set(CC.x + Math.sin(i * 2.3) * 0.2, 1.19, CC.z + Math.cos(i * 1.7) * 0.18); cr.material = P("#e6c890"); }
  const till = add(MB.CreateBox("cf-till", { width: 0.45, height: 0.35, depth: 0.35 }, scene), 0.015); till.position.set(6, 1.28, 3.1); till.material = P("#c9a24a");
  // When the cake is found it goes back in the case: what's left of it (one tier, with lemon curls).
  const cakeBack = K.when("$CAKE_FOUND");
  const tier = add(MB.CreateCylinder("cf-cakeTier", { height: 0.22, diameter: 0.42, tessellation: 18 }, scene), 0.015); tier.parent = cakeBack; tier.position.set(CC.x, 1.29, CC.z); tier.material = P("#f6e6a0");
  // ...and until then, it's on table three: a three-tier lemon cake, one tier already eaten.
  const cakeOut = K.when("not $CAKE_FOUND");
  const T3 = C.tables.find((t) => t[0] === "3");
  for (const [i, d] of [[0, 0.62], [1, 0.46]]) {
    const t = add(MB.CreateCylinder("cf-bigCake", { height: 0.2, diameter: d, tessellation: 18 }, scene), 0.015); t.parent = cakeOut; t.position.set(T3[1] + 0.12, 0.92 + i * 0.2, T3[2]); t.material = P(i ? "#f6e6a0" : "#f2d070");
  }
  const curl = add(MB.CreateSphere("cf-lemonCurl", { diameter: 0.1, segments: 5 }, scene), 0.01); curl.parent = cakeOut; curl.position.set(T3[1] + 0.12, 1.36, T3[2]); curl.material = P("#f0e050");
  // The kitchen behind the counter: a black stove with a fire, pots, shelves of jars.
  const S = C.stove;
  const stove = add(MB.CreateBox("cf-stove", { width: S.x1 - S.x0, height: 1, depth: S.z1 - S.z0 }, scene), 0.03); stove.position.set((S.x0 + S.x1) / 2, 0.5, (S.z0 + S.z1) / 2); stove.material = P("#2a2a30");
  const fire = add(MB.CreateBox("cf-stoveFire", { width: 0.7, height: 0.3, depth: 0.05 }, scene)); fire.position.set(stove.position.x, 0.35, S.z0 - 0.02); fire.material = glow(scene, "cf-fire", "#ff9a3a");
  for (const dx of [-0.5, 0.5]) { const pot = add(MB.CreateCylinder("cf-pot", { height: 0.35, diameter: 0.45, tessellation: 12 }, scene), 0.015); pot.position.set(stove.position.x + dx, 1.17, stove.position.z); pot.material = P("#8a8a90"); }
  for (const [x, y] of [[-3, 2.6], [-0.5, 2.6], [5.5, 2.4], [-3, 1.8]]) {
    const sh = add(MB.CreateBox("cf-shelf", { width: 1.8, height: 0.06, depth: 0.32 }, scene), 0.015); sh.position.set(x, y, C.half[1] - 0.3); sh.material = wood;
    for (let k = 0; k < 4; k++) { const j = add(MB.CreateCylinder("cf-jar", { height: 0.26, diameter: 0.16, tessellation: 8 }, scene), 0.008); j.position.set(x - 0.6 + k * 0.4, y + 0.16, C.half[1] - 0.3); j.material = P(["#e6b54e", "#c8607a", "#7ac06a", "#6a8acb"][k]); }
  }
  // Pictures on the north wall, plants in the corners, a menu board by the door, hanging lamps.
  for (const [x, hex] of [[-5.4, "#6a8acb"], [-1.8, "#c8607a"]]) { const fr = add(MB.CreateBox("cf-frame", { width: 1.1, height: 0.8, depth: 0.05 }, scene), 0.015); fr.position.set(x, 2.4, C.half[1] - 0.16); fr.material = P("#c9a24a"); const pic = add(MB.CreatePlane("cf-pic", { width: 0.9, height: 0.6 }, scene)); pic.position.set(x, 2.4, C.half[1] - 0.2); pic.rotation.y = Math.PI; pic.material = P(hex); }
  PR.plant(-6.4, -5.4); PR.plant(6.4, -5.4); PR.plant(-6.4, 5.4, { s: 1.2 });
  const easel = add(MB.CreateBox("cf-menuBoard", { width: 0.9, height: 1.2, depth: 0.06 }, scene), 0.02); easel.position.set(-1.6, 0.8, -5.2); easel.rotation.set(-0.15, 0.3, 0); easel.material = P("#2a2e2a");
  for (let i = 0; i < 4; i++) { const ln = add(MB.CreateBox("cf-chalk", { width: 0.6 - (i % 2) * 0.2, height: 0.04, depth: 0.01 }, scene)); ln.position.set(-1.6 - Math.sin(0.3) * 0.04, 1.1 - i * 0.18, -5.24); ln.rotation.set(-0.15, 0.3, 0); ln.material = P("#f6f1e8"); }
  const lampGlow = glow(scene, "cf-lampGlow", "#ffd9a0");
  for (const [x, z] of [[-4.6, -1.4], [-4.6, 2.4], [-1.2, -0.8], [2.6, -2.8], [3.6, 3.1]]) { const l = add(MB.CreateSphere("cf-lamp", { diameter: 0.4, segments: 8 }, scene)); l.position.set(x, 3.4, z); l.material = lampGlow; const c = add(MB.CreateCylinder("cf-cord", { height: 0.6, diameter: 0.02, tessellation: 4 }, scene)); c.position.set(x, 3.9, z); c.material = P("#2a2a30"); }
  const warm = new BB.PointLight("cf-warm", new BB.Vector3(0, 3.2, 0), scene); warm.diffuse = color3("#ffcf9a").clone(); warm.intensity = 0.5; warm.range = 16; K.lights.push(warm);
  // The café cat, asleep on a cushion by the window.
  const cushion = add(MB.CreateCylinder("cf-cushion", { height: 0.12, diameter: 0.7, tessellation: 12 }, scene), 0.015); cushion.position.set(-6.2, 0.06, 1.8); cushion.material = P("#c8607a");
  const cat = buildCritters(scene, K, [{ kind: "cat", n: 1, area: { x: -6.2, z: 1.8, r: 0.01 }, still: true }], mulberry(7));
  K.bake(room.keep);
  const env = { clear: "#141218", fog: "#141218", fogDensity: 0.004, hemi: [0.75, "#fff0e0", "#5a4048"], sun: [0.55, "#ffe0c0", [0.3, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [-0.3, 1, -0.4], fogColor: "#141218", fogDensity: 0.002, sky: [1.08, 1.0, 0.98], ground: [0.86, 0.78, 0.8], rim: [1.0, 0.85, 0.8] };
  const self = {
    env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update(dt, t) { room.cutaway(scene.activeCamera, self.mood?.player); cat.update(dt, self.mood ?? {}); fire.scaling.y = 0.85 + Math.sin(t * 11) * 0.15; },
  };
  return self;
}

/** A Lowmarket home: one room with a bed, a hearth, a table and shelves. */
function buildHome(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, H = HOME_LAYOUT;
  const P = palette(scene, "hm"), PR = props(scene, K, P);
  const room = buildRoom(scene, K, { prefix: "hm", half: H.half, wall: "#e8dcc4", wainscot: "#7a5a3a", floorA: "#a07a52", floorB: "#8a6a46", door: H.door,
    windows: [["e", -1, 2, 1.4, 1.1], ["n", -2, 2, 1.4, 1.1]] });
  const B2 = H.bed;
  const bed = add(MB.CreateBox("hm-bed", { width: B2.x1 - B2.x0, height: 0.5, depth: B2.z1 - B2.z0 }, scene), 0.03); bed.position.set((B2.x0 + B2.x1) / 2, 0.25, (B2.z0 + B2.z1) / 2); bed.material = P("#6a4a2a");
  const quilt = add(MB.CreateBox("hm-quilt", { width: B2.x1 - B2.x0 - 0.1, height: 0.12, depth: B2.z1 - B2.z0 - 0.7 }, scene), 0.015); quilt.position.set(bed.position.x, 0.56, bed.position.z - 0.3); quilt.material = P("#c0504d");
  const pillow = add(MB.CreateBox("hm-pillow", { width: 1, height: 0.15, depth: 0.45 }, scene), 0.012); pillow.position.set(bed.position.x, 0.6, B2.z1 - 0.35); pillow.material = P("#f2efe6");
  const HE = H.hearth;
  const hearth = add(MB.CreateBox("hm-hearth", { width: HE.x1 - HE.x0, height: 1.6, depth: HE.z1 - HE.z0 }, scene), 0.03); hearth.position.set((HE.x0 + HE.x1) / 2, 0.8, (HE.z0 + HE.z1) / 2); hearth.material = P("#8a8278");
  const flame = add(MB.CreateBox("hm-flame", { width: 0.8, height: 0.45, depth: 0.05 }, scene)); flame.position.set(hearth.position.x, 0.4, HE.z0 - 0.02); flame.material = glow(scene, "hm-fire", "#ff9a3a");
  const kettle = add(MB.CreateCylinder("hm-kettle", { height: 0.3, diameter: 0.35, tessellation: 10 }, scene), 0.015); kettle.position.set(hearth.position.x + 0.6, 1.75, hearth.position.z); kettle.material = P("#2a2a30");
  PR.table(H.table.x, H.table.z, { ry: 0, mugs: 2 }); PR.chair(H.table.x - 0.9, H.table.z, { ry: Math.PI / 2 }); PR.chair(H.table.x + 0.9, H.table.z, { ry: -Math.PI / 2 });
  PR.barrel(4.3, -3.3); PR.crate(4.2, -2.3, { ry: 0.3, s: 0.6 }); PR.sack(3.6, -3.4); PR.plant(-4.4, -3.4);
  for (const y of [1.4, 2.1]) { const sh = add(MB.CreateBox("hm-shelf", { width: 1.6, height: 0.06, depth: 0.3 }, scene), 0.015); sh.position.set(-0.5, y, H.half[1] - 0.3); sh.material = P("#6a4a2a"); for (let k = 0; k < 3; k++) { const j = add(MB.CreateCylinder("hm-jar", { height: 0.24, diameter: 0.15, tessellation: 8 }, scene), 0.008); j.position.set(-1 + k * 0.5, y + 0.15, H.half[1] - 0.3); j.material = P(["#c9a24a", "#7ac06a", "#c8607a"][k]); } }
  const rug = add(MB.CreateGround("hm-rug", { width: 2.6, height: 1.8 }, scene)); rug.position.set(0.4, 0.012, -1.4); rug.material = P("#4f81bd");
  const warm = new BB.PointLight("hm-warm", new BB.Vector3(2, 2.4, 2.6), scene); warm.diffuse = color3("#ffb070").clone(); warm.intensity = 0.55; warm.range = 12; K.lights.push(warm);
  K.bake(room.keep);
  const env = { clear: "#141218", fog: "#141218", fogDensity: 0.004, hemi: [0.7, "#ffe6c8", "#4a3a30"], sun: [0.5, "#ffd8a8", [0.3, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [-0.3, 1, -0.4], fogColor: "#141218", fogDensity: 0.002, sky: [1.06, 0.98, 0.92], ground: [0.84, 0.76, 0.7], rim: [1.0, 0.82, 0.7] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update(dt, t) { room.cutaway(scene.activeCamera, self.mood?.player); flame.scaling.y = 0.85 + Math.sin(t * 9) * 0.15; warm.intensity = 0.5 + Math.sin(t * 7) * 0.05; } };
  return self;
}

/**
 * The Severed Isles (Arc 4, Ep 30): a plateau of rock adrift in a bright sky over a sea of cloud, the old sky temple's
 * star floor inlaid in its middle, broken pillars round the rim, the star mural on its standing wall to the north, a
 * gondola dock to the south, and the rest of the isles drifting all around, some tied on by rope bridges.
 */
function buildIsles(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = ISLES_LAYOUT;
  const rng = mulberry(30), P = palette(scene, "si");
  const rockM = toon(scene, "si-rock", "#8a8070"), rockDark = toon(scene, "si-rockDark", "#6a6052"), grassM = toon(scene, "si-grass", "#71925f");
  const stoneM = toon(scene, "si-stone", "#d8d2c4"), runeM = glow(scene, "si-rune", "#9ad8ff", 0.9);
  // An isle: a grassy top on a rough cone of rock tapering away underneath.
  const isle = (x, y, z, r, grassy = true) => {
    const top = add(MB.CreateCylinder("si-isleTop", { diameter: r * 2, height: 1.2, tessellation: mobile ? 22 : 32 }, scene), 0.05); top.position.set(x, y - 0.6, z); top.material = grassy ? grassM : rockM;
    const under = add(MB.CreateCylinder("si-isleUnder", { diameterTop: r * 2, diameterBottom: r * 0.25, height: r * 1.3, tessellation: mobile ? 9 : 13 }, scene), 0.05);
    under.position.set(x, y - 1.2 - r * 0.65, z); under.rotation.y = rng() * 3; under.material = rockDark;
    for (let i = 0; i < 4; i++) { const a = rng() * Math.PI * 2, d = r * (0.6 + rng() * 0.3); const st = add(MB.CreateCylinder("si-stalactite", { diameterTop: 0.8 + rng(), diameterBottom: 0, height: 2 + rng() * 3, tessellation: 5 }, scene), 0.03); st.position.set(x + Math.sin(a) * d, y - 1.2 - r * 0.5 - rng() * 2, z + Math.cos(a) * d); st.material = rockDark; }
    return top;
  };
  isle(0, 0, 0, L.radius + 1.5);
  // Where the rim has fallen away: holes straight down to the clouds.
  for (const [x, z, r] of L.chasms) { const hole = add(MB.CreateDisc("si-chasm", { radius: r, tessellation: 18 }, scene)); hole.rotation.x = Math.PI / 2; hole.position.set(x, 0.015, z); hole.material = toon(scene, "si-sky", "#bcd8f0"); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const b = add(MB.CreateBox("si-rubble", { width: 0.6, height: 0.4, depth: 0.5 }, scene), 0.02); b.position.set(x + Math.sin(a) * (r + 0.3), 0.2, z + Math.cos(a) * (r + 0.3)); b.rotation.y = a; b.material = rockM; } }
  // The temple floor: pale paving inlaid with the star chart (the same lines the Warden's thunder follows).
  const floor = add(MB.CreateDisc("si-floor", { radius: 13, tessellation: 48 }, scene)); floor.rotation.x = Math.PI / 2; floor.position.y = 0.012; floor.material = stoneM;
  for (const r of [6, 13]) { const ring = add(MB.CreateTorus("si-ring", { diameter: r * 2, thickness: 0.1, tessellation: 48 }, scene)); ring.position.y = 0.02; ring.material = P("#b0a890"); }
  const lineM = P("#8a9ab8"), starM = runeM;
  for (const stars of WARDEN_STARS) {
    stars.forEach(([x, z], i) => {
      const s0 = add(MB.CreateDisc("si-star", { radius: 0.32, tessellation: 5 }, scene)); s0.rotation.x = Math.PI / 2; s0.position.set(x, 0.025, z + 7); s0.material = starM;
      if (i) { const [px, pz] = stars[i - 1], len = Math.hypot(x - px, z - pz); const ln = add(MB.CreateGround("si-starLine", { width: 0.08, height: len }, scene)); ln.position.set((x + px) / 2, 0.022, (z + pz) / 2 + 7); ln.rotation.y = Math.atan2(x - px, z - pz); ln.material = lineM; }
    });
  }
  // Pillars round the rim, some broken off short.
  for (const [i, [x, z]] of L.pillars.entries()) {
    const h = i % 3 === 1 ? 2.2 : 5.5;
    const c = add(MB.CreateCylinder("si-pillar", { diameter: 1.4, height: h, tessellation: 10 }, scene), 0.04); c.position.set(x, h / 2, z); c.material = stoneM;
    if (h > 3) { const cap = add(MB.CreateBox("si-pillarCap", { width: 1.8, height: 0.4, depth: 1.8 }, scene), 0.03); cap.position.set(x, h + 0.2, z); cap.material = stoneM; }
    const band = add(MB.CreateTorus("si-band", { diameter: 1.45, thickness: 0.08, tessellation: 14 }, scene)); band.position.set(x, 1.4, z); band.material = runeM;
  }
  // The star mural: a standing wall, the constellation drawn on it in light.
  const M = L.mural;
  const wall = add(MB.CreateBox("si-muralWall", { width: M.w, height: 5, depth: 1 }, scene), 0.05); wall.position.set(M.x, 2.5, M.z); wall.material = stoneM;
  const face = add(MB.CreatePlane("si-muralFace", { width: M.w - 1, height: 3.6, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); face.position.set(M.x, 2.6, M.z - 0.52); face.material = P("#2a3450");
  WARDEN_STARS.flat().forEach(([x, z], i) => { const d = add(MB.CreateDisc("si-muralStar", { radius: 0.09 + (i % 3) * 0.03, tessellation: 5 }, scene)); d.position.set(M.x + x * 0.42, 2.6 + z * 0.19, M.z - 0.54); d.rotation.y = Math.PI; d.material = starM; });
  // The gondola dock at the south rim: planks, posts, and the chain that runs down into the clouds.
  const D = L.dock;
  const deck = add(MB.CreateBox("si-dock", { width: 4, height: 0.25, depth: 3 }, scene), 0.03); deck.position.set(D.x, 0.12, D.z - 0.5); deck.material = P("#7a5a3a");
  for (const x of [-1.8, 1.8]) { const post = add(MB.CreateCylinder("si-dockPost", { diameter: 0.25, height: 2.4, tessellation: 6 }, scene), 0.02); post.position.set(D.x + x, 1.2, D.z - 1.8); post.material = P("#5a3a22"); }
  const chain = add(MB.CreateCylinder("si-chain", { diameter: 0.18, height: 60, tessellation: 5 }, scene)); chain.position.set(D.x, -22, D.z - 6); chain.rotation.x = 0.55; chain.material = P("#3a3f48");
  const gondola = add(MB.CreateBox("si-gondola", { width: 2.2, height: 1.4, depth: 1.6 }, scene), 0.03); gondola.position.set(D.x, -0.4, D.z - 3.2); gondola.material = P("#8a5a32");
  // Waystones (the bridge-stones you wake to raise the way across): short stones with a rune.
  for (const [x, z] of L.waystones) { const s0 = add(MB.CreateBox("si-waystone", { width: 0.8, height: 1.4, depth: 0.5 }, scene), 0.03); s0.position.set(x, 0.7, z); s0.material = stoneM; const r0 = add(MB.CreatePlane("si-wayRune", { width: 0.4, height: 0.5, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); r0.position.set(x, 0.9, z - 0.26); r0.material = runeM; }
  // The other isles, drifting all round, two of them roped to this one.
  const far = [[-44, -6, 18, 7], [40, 4, 22, 6], [-26, -3, -48, 5], [30, -8, 46, 8], [6, 10, 62, 9], [-58, 6, 30, 6]];
  for (const [x, y, z, r] of far) isle(x, y, z, r, rng() > 0.3);
  const rope = P("#c9a26a");
  for (const [x0, z0, x1, y1, z1] of [[-21, 4, -38, -6, 16], [20, 6, 34, 4, 20]]) {
    const len = Math.hypot(x1 - x0, y1, z1 - z0), mid = [(x0 + x1) / 2, y1 / 2 - 1.2, (z0 + z1) / 2];
    for (const dx of [-0.7, 0.7]) { const r0 = add(MB.CreateCylinder("si-rope", { diameter: 0.06, height: len, tessellation: 4 }, scene)); r0.position.set(mid[0] + dx * Math.cos(Math.atan2(x1 - x0, z1 - z0)), mid[1] + 0.9, mid[2] - dx * Math.sin(Math.atan2(x1 - x0, z1 - z0))); r0.rotation.set(Math.PI / 2 - Math.atan2(y1, Math.hypot(x1 - x0, z1 - z0)), Math.atan2(x1 - x0, z1 - z0), 0); r0.material = rope; }
    const planks = add(MB.CreateBox("si-bridge", { width: 1.2, height: 0.08, depth: len }, scene), 0.01); planks.position.set(...mid); planks.rotation.set(-Math.atan2(y1, Math.hypot(x1 - x0, z1 - z0)), Math.atan2(x1 - x0, z1 - z0), 0); planks.material = P("#8a6a46");
  }
  // A sea of cloud far below, and a few clouds drifting past at eye level.
  const cloudM = toon(scene, "si-cloud", "#f4f6fa");
  const clouds = [];
  for (let i = 0; i < (mobile ? 14 : 24); i++) {
    const a = rng() * Math.PI * 2, d = 30 + rng() * 70, low = i % 3 !== 0;
    const c = add(MB.CreateSphere("si-cloud", { diameter: 10 + rng() * 14, segments: 6 }, scene)); c.scaling.set(1.6, 0.35, 1); c.position.set(Math.sin(a) * d, low ? -26 - rng() * 10 : -4 + rng() * 10, Math.cos(a) * d); c.material = cloudM;
    clouds.push({ c, a, d, s: 0.004 + rng() * 0.006 });
  }
  K.bake([]);
  const env = { clear: "#9ec8f0", fog: "#cfe2f4", fogDensity: 0.004, hemi: [0.72, "#fff6ea", "#8aa0b8"], sun: [0.8, "#fff4e0", [0.4, -1, 0.3]], warm: 0 };
  const toonEnv = { lightDir: [-0.4, 1, -0.3], fogColor: "#cfe2f4", fogDensity: 0.002, sky: [1.08, 1.08, 1.12], ground: [0.84, 0.86, 0.92], rim: [1.0, 1.0, 1.05] };
  return { env, toon: toonEnv, show: K.show, conditions: K.conditions, outdoor: true,
    update(dt, t) {
      for (const k of clouds) { k.a += k.s * dt; k.c.position.x = Math.sin(k.a) * k.d; k.c.position.z = Math.cos(k.a) * k.d; }
      gondola.position.y = -0.4 + Math.sin(t * 0.8) * 0.08;
    } };
}

/**
 * The old city under the Lowmarket (Ep 33): a street of houses the city above was built on, half-buried, a dry canal
 * with one stone bridge, braziers, broken pillars, and at the north end a door in the rock: a slab carved with the
 * Paragon's sun, split down the middle by a crack of pale light. It hums. Cues: doorOpen (the crack widens and the
 * light comes through), doorShut.
 */
function buildOldCity(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = OLDCITY_LAYOUT, P = palette(scene, "oc"), PR = props(scene, K, P);
  const H = L.half, len = L.north - L.south, midZ = (L.north + L.south) / 2;
  const paving = toon(scene, "oc-paving", "#3e3a42"), plazaM = toon(scene, "oc-plaza", "#4a4652"), rock = toon(scene, "oc-rock", "#26232a");
  const houseM = toon(scene, "oc-house", "#5a5048"), roofM = toon(scene, "oc-roof", "#3a3230"), dark = P("#121016"), stone = toon(scene, "oc-stone", "#6a6470");
  const hollowLight = glow(scene, "oc-hollow", "#d8c8ff", 0.92), carve = glow(scene, "oc-carve", "#9a7ad8", 0.75);
  const floor = add(MB.CreateGround("oc-floor", { width: H * 2 + 2, height: len + 2 }, scene)); floor.position.set(0, 0, midZ); floor.material = paving;
  const plaza = add(MB.CreateDisc("oc-plazaDisc", { radius: 12, tessellation: 40 }, scene)); plaza.rotation.x = Math.PI / 2; plaza.position.set(0, 0.006, 0); plaza.material = plazaM;
  for (const r of [6, 12]) { const ring = add(MB.CreateTorus("oc-ring", { diameter: r * 2, thickness: 0.1, tessellation: 48 }, scene)); ring.position.y = 0.012; ring.material = P("#2e2a34"); }
  // Rock walls either side and behind the stairs; the cavern has no sky.
  for (const side of [-1, 1]) { const w = add(MB.CreateBox("oc-wall", { width: 2, height: 9, depth: len + 2 }, scene), 0.04); w.position.set(side * (H + 1), 4.5, midZ); w.material = rock; }
  const back = add(MB.CreateBox("oc-back", { width: H * 2 + 4, height: 9, depth: 2 }, scene), 0.04); back.position.set(0, 4.5, L.south - 1); back.material = rock;
  for (let i = 0; i < 4; i++) { const st = add(MB.CreateBox("oc-stair", { width: 4.4, height: 0.35, depth: 0.7 }, scene), 0.03); st.position.set(0, 0.17 + i * 0.35, L.south + 0.35 - i * 0.6 + 0.6); st.material = stone; }
  // The buried street: house fronts sunk to their upper windows, windows dark, doorways full of earth.
  for (const [x, z, w, d] of L.houses) {
    const hgt = 3 + (Math.abs(z) % 3) * 0.4, face = x < 0 ? 1 : -1;
    const body = add(MB.CreateBox("oc-house", { width: w, height: hgt, depth: d }, scene), 0.04); body.position.set(x, hgt / 2, z); body.material = houseM;
    const cap = add(MB.CreateBox("oc-cap", { width: w + 0.3, height: 0.3, depth: d + 0.3 }, scene), 0.03); cap.position.set(x, hgt + 0.15, z); cap.material = roofM;
    for (const dz of [-d / 4, d / 4]) { const win = add(MB.CreatePlane("oc-win", { width: 0.9, height: 1.1, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); win.position.set(x + face * (w / 2 + 0.02), hgt - 1.1, z + dz); win.rotation.y = Math.PI / 2; win.material = dark; }
    const earth = add(MB.CreateBox("oc-earth", { width: 0.6, height: 0.9, depth: 1.6 }, scene), 0.02); earth.position.set(x + face * (w / 2 + 0.2), 0.45, z); earth.material = P("#4a3e34");
  }
  // The dry canal and its bridge.
  for (const [x0, x1] of [[-H - 1, -L.canal.bridge], [L.canal.bridge, H + 1]]) {
    const trench = add(MB.CreateBox("oc-trench", { width: x1 - x0, height: 0.04, depth: L.canal.z1 - L.canal.z0 }, scene)); trench.position.set((x0 + x1) / 2, 0.02, (L.canal.z0 + L.canal.z1) / 2); trench.material = dark;
    for (const z of [L.canal.z0, L.canal.z1]) { const lip = add(MB.CreateBox("oc-lip", { width: x1 - x0, height: 0.3, depth: 0.3 }, scene), 0.02); lip.position.set((x0 + x1) / 2, 0.15, z); lip.material = stone; }
  }
  for (const sx of [-1, 1]) { const par = add(MB.CreateBox("oc-parapet", { width: 0.3, height: 0.7, depth: L.canal.z1 - L.canal.z0 + 0.6 }, scene), 0.03); par.position.set(sx * L.canal.bridge, 0.35, (L.canal.z0 + L.canal.z1) / 2); par.material = stone; }
  // Pillars round the plaza (some broken off short), the Paragon's statues by the door, braziers.
  for (const [i, [x, z]] of L.pillars.entries()) { const h = i % 3 === 1 ? 2.6 : 6.5; const c = add(MB.CreateCylinder("oc-pillar", { height: h, diameter: 1.2, tessellation: 10 }, scene), 0.04); c.position.set(x, h / 2, z); c.material = stone; }
  L.statues.forEach(([x, z], i) => PR.statue(x, z, { broken: i === 0 }));
  const fires = [], fireM = glow(scene, "oc-fire", "#ff9a3a");
  for (const [x, z] of L.braziers) {
    const bowl = add(MB.CreateCylinder("oc-bowl", { height: 0.5, diameterTop: 0.9, diameterBottom: 0.5, tessellation: 10 }, scene), 0.03); bowl.position.set(x, 0.95, z); bowl.material = toon(scene, "oc-iron", "#2e2c32");
    const leg = add(MB.CreateCylinder("oc-leg", { height: 0.8, diameter: 0.18, tessellation: 6 }, scene)); leg.position.set(x, 0.4, z); leg.material = bowl.material;
    const f = add(MB.CreateCylinder("oc-fire", { height: 0.7, diameterTop: 0, diameterBottom: 0.55, tessellation: 7 }, scene)); f.position.set(x, 1.5, z); f.material = fireM; fires.push(f);
  }
  // The door: a slab in the rock, the Paragon's sun carved on it, and a crack of pale light down the middle.
  const D = L.door;
  const face = add(MB.CreateBox("oc-doorWall", { width: H * 2 + 2, height: 10, depth: 1.6 }, scene), 0.05); face.position.set(0, 5, D.z + 1); face.material = rock;
  const slab = add(MB.CreateBox("oc-door", { width: D.w, height: D.h, depth: 0.4 }, scene), 0.05); slab.position.set(D.x, D.h / 2, D.z + 0.05); slab.material = toon(scene, "oc-doorStone", "#5a5660");
  const frame = add(MB.CreateBox("oc-lintel", { width: D.w + 1.6, height: 1, depth: 0.8 }, scene), 0.04); frame.position.set(D.x, D.h + 0.4, D.z); frame.material = stone;
  for (const sx of [-1, 1]) { const jamb = add(MB.CreateBox("oc-jamb", { width: 0.8, height: D.h, depth: 0.8 }, scene), 0.04); jamb.position.set(D.x + sx * (D.w / 2 + 0.4), D.h / 2, D.z); jamb.material = stone; }
  const sun = MB.CreateTorus("oc-sun", { diameter: 2.4, thickness: 0.1, tessellation: 32 }, scene); sun.parent = K.root; sun.rotation.x = Math.PI / 2; sun.position.set(D.x, D.h * 0.62, D.z - 0.17); sun.material = carve;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const ray = MB.CreateBox("oc-ray", { width: 0.08, height: 0.7, depth: 0.04 }, scene); ray.parent = K.root; ray.position.set(D.x + Math.sin(a) * 1.75, D.h * 0.62 + Math.cos(a) * 1.75, D.z - 0.17); ray.rotation.z = -a; ray.material = carve; }
  const crack = MB.CreatePlane("oc-crack", { width: 0.14, height: D.h - 0.4, sideOrientation: BB.Mesh.DOUBLESIDE }, scene); crack.parent = K.root; crack.position.set(D.x, D.h / 2, D.z - 0.17); crack.material = hollowLight; crack.isPickable = false;
  const hollow = new BB.PointLight("oc-hollowLight", new BB.Vector3(D.x, 3, D.z - 2), scene); hollow.diffuse = color3("#c9a4ff").clone(); hollow.intensity = 0.35; hollow.range = 18; K.lights.push(hollow);
  const warm = new BB.PointLight("oc-warm", new BB.Vector3(0, 5, -6), scene); warm.diffuse = color3("#ffb070").clone(); warm.intensity = 0.5; warm.range = 30; K.lights.push(warm);
  // Pale motes drifting out of the crack.
  const motes = new BB.ParticleSystem("oc-motes", mobile ? 20 : 40, scene);
  motes.particleTexture = softTexture(scene); motes.emitter = new BB.Vector3(D.x, D.h / 2, D.z - 0.4);
  motes.minEmitBox = new BB.Vector3(-0.2, -3.4, 0); motes.maxEmitBox = new BB.Vector3(0.2, 3.4, 0);
  motes.color1 = new BB.Color4(0.85, 0.78, 1, 0.5); motes.color2 = new BB.Color4(0.7, 0.6, 1, 0.3); motes.colorDead = new BB.Color4(1, 1, 1, 0);
  motes.minSize = 0.05; motes.maxSize = 0.14; motes.minLifeTime = 3; motes.maxLifeTime = 6; motes.emitRate = mobile ? 4 : 8;
  motes.direction1 = new BB.Vector3(-0.3, 0.1, -1); motes.direction2 = new BB.Vector3(0.3, 0.3, -0.6); motes.minEmitPower = 0.1; motes.maxEmitPower = 0.3; motes.blendMode = BB.ParticleSystem.BLENDMODE_ADD;
  K.systems.push(motes);
  PR.bones(-6, -24); PR.bones(7, -8); PR.crate(-8.6, -33, { ry: 0.3 }); PR.crate(8.8, -15.8, { broken: true }); PR.droppedBlade(3.2, 4.6, { ry: 0.7 });
  K.bake([]);
  let open = 0, want = 0;
  const cue = (name) => { if (name === "doorOpen") want = 1; if (name === "doorShut") want = 0; };
  const env = { clear: "#07060a", fog: "#110f18", fogDensity: 0.022, hemi: [0.48, "#d8ccff", "#2a2430"], sun: [0.3, "#ffcf9a", [0.2, -1, 0.3]], warm: 0 };
  const toonEnv = { lightDir: [-0.2, 1, -0.3], fogColor: "#110f18", fogDensity: 0.016, sky: [0.9, 0.86, 1], ground: [0.56, 0.52, 0.62], rim: [0.8, 0.72, 1.0] };
  return { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true, cue,
    update(dt, t) {
      open += (want - open) * Math.min(1, dt * (want ? 0.8 : 3)); // it opens slowly and shuts fast
      crack.scaling.x = 1 + open * 18; hollowLight.alpha = 0.92 - open * 0.25;
      hollow.intensity = 0.35 + open * 1.4 + Math.sin(t * 2.2) * 0.05;
      for (let i = 0; i < fires.length; i++) fires[i].scaling.y = 0.88 + Math.sin(t * 8 + i * 1.7) * 0.12;
      warm.intensity = 0.48 + Math.sin(t * 5) * 0.04;
    } };
}

/**
 * The Hollow (Eps 37–38): a white nowhere. Paper underfoot with faint script nobody can read, holes where the floor
 * isn't, doors standing up on their own (and a few drifting overhead), stairs to nothing, and a column of pale light
 * where Elodie is held. Cues: pillarOn, pillarOff.
 */
function buildHollow(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = HOLLOW_LAYOUT, P = palette(scene, "ho"), rng = mulberry(38);
  const paper = toon(scene, "ho-paper", "#dcd7e6"), stone = toon(scene, "ho-stone", "#c4bed2"), holeM = P("#9d93c0"), doorM = P("#4a4458");
  const floor = add(MB.CreateDisc("ho-floor", { radius: L.radius + 6, tessellation: 64 }, scene)); floor.rotation.x = Math.PI / 2; floor.position.y = 0.004; floor.material = paper;
  // Lines of under-text lying on the floor, pale, nearly gone.
  const scriptM = new BB.StandardMaterial("ho-script", scene); scriptM.diffuseTexture = underTextTexture(scene, "ho-scriptTex", 3); scriptM.diffuseTexture.hasAlpha = true;
  scriptM.useAlphaFromDiffuseTexture = true; scriptM.emissiveColor = color3("#8a84a8").clone(); scriptM.disableLighting = true; scriptM.alpha = 0.35; scriptM.backFaceCulling = false;
  for (let i = 0; i < (mobile ? 10 : 18); i++) {
    const a = rng() * Math.PI * 2, r = 3 + rng() * (L.radius - 4);
    const sh = MB.CreatePlane("ho-line", { width: 4 + rng() * 3, height: 2 }, scene); sh.parent = K.root; sh.rotation.set(Math.PI / 2, rng() * Math.PI, 0); sh.position.set(Math.sin(a) * r, 0.012, Math.cos(a) * r); sh.material = scriptM; sh.isPickable = false;
  }
  // Holes: no floor at all, a ragged edge, a long way down.
  for (const [x, z, r] of L.voids) {
    const h = add(MB.CreateDisc("ho-hole", { radius: r, tessellation: 9 }, scene)); h.rotation.x = Math.PI / 2; h.rotation.z = rng() * 3; h.position.set(x, 0.01, z); h.material = holeM;
    const deep = add(MB.CreateDisc("ho-deep", { radius: r * 0.7, tessellation: 9 }, scene)); deep.rotation.x = Math.PI / 2; deep.position.set(x, 0.013, z); deep.material = P("#7a6fa6");
  }
  // Doors, standing up on their own: a frame, and a door in it, some ajar.
  const door = (x, y, z, yaw, tilt = 0, ajar = 0) => {
    const n = new BB.TransformNode("ho-door", scene); n.parent = K.root; n.position.set(x, y, z); n.rotation.set(tilt, yaw, tilt * 0.5);
    for (const sx of [-0.75, 0.75]) { const post = add(MB.CreateBox("ho-post", { width: 0.22, height: 2.6, depth: 0.3 }, scene), 0.02); post.parent = n; post.position.set(sx, 1.3, 0); post.material = stone; }
    const lintel = add(MB.CreateBox("ho-lintel", { width: 1.9, height: 0.25, depth: 0.32 }, scene), 0.02); lintel.parent = n; lintel.position.set(0, 2.65, 0); lintel.material = stone;
    const leaf = add(MB.CreateBox("ho-leaf", { width: 1.28, height: 2.4, depth: 0.08 }, scene), 0.02); leaf.parent = n; leaf.setPivotPoint(new BB.Vector3(-0.64, 0, 0)); leaf.position.set(0, 1.2, 0); leaf.rotation.y = ajar; leaf.material = doorM;
    return n;
  };
  for (const [x, z, yaw] of L.doors) door(x, 0, z, yaw, 0, rng() < 0.4 ? 0.6 : 0);
  const drifting = [];
  for (let i = 0; i < (mobile ? 5 : 9); i++) { const a = rng() * Math.PI * 2, r = 8 + rng() * 20; drifting.push({ n: door(Math.sin(a) * r, 4 + rng() * 9, Math.cos(a) * r, rng() * 6, (rng() - 0.5) * 2.4, rng() * 0.8), b: rng() * 6 }); }
  // Stairs up into nothing.
  for (const [x, z, yaw] of L.stairs) {
    const n = new BB.TransformNode("ho-stairs", scene); n.parent = K.root; n.position.set(x, 0, z); n.rotation.y = yaw;
    for (let i = 0; i < 7; i++) { const st = add(MB.CreateBox("ho-step", { width: 1.8, height: 0.35, depth: 0.7 }, scene), 0.02); st.parent = n; st.position.set(0, 0.17 + i * 0.5, i * 0.7); st.material = stone; }
  }
  // Where Elodie is held: a column of pale light from the floor up out of sight.
  const pillarM = glow(scene, "ho-pillar", "#f4efff", 0.38, true);
  const pillar = MB.CreateCylinder("ho-pillar", { height: 40, diameter: 2.4, tessellation: 20 }, scene); pillar.parent = K.root; pillar.position.set(L.pillar.x, 20, L.pillar.z); pillar.material = pillarM; pillar.isPickable = false;
  const ring = MB.CreateTorus("ho-pillarRing", { diameter: 3.2, thickness: 0.06, tessellation: 32 }, scene); ring.parent = K.root; ring.position.set(L.pillar.x, 0.03, L.pillar.z); ring.material = glow(scene, "ho-pillarRingM", "#c9b8ff", 0.8); ring.isPickable = false;
  const motes = new BB.ParticleSystem("ho-motes", mobile ? 30 : 60, scene);
  motes.particleTexture = softTexture(scene); motes.emitter = new BB.Vector3(0, 2, 0);
  motes.minEmitBox = new BB.Vector3(-22, -1, -22); motes.maxEmitBox = new BB.Vector3(22, 6, 22);
  motes.color1 = new BB.Color4(1, 1, 1, 0.6); motes.color2 = new BB.Color4(0.85, 0.8, 1, 0.4); motes.colorDead = new BB.Color4(1, 1, 1, 0);
  motes.minSize = 0.06; motes.maxSize = 0.18; motes.minLifeTime = 4; motes.maxLifeTime = 8; motes.emitRate = mobile ? 6 : 12; motes.gravity = new BB.Vector3(0, 0.05, 0);
  motes.minEmitPower = 0.02; motes.maxEmitPower = 0.1; motes.blendMode = BB.ParticleSystem.BLENDMODE_ADD;
  K.systems.push(motes);
  K.bake([]);
  let lit = 1, want = 1;
  const cue = (name) => { if (name === "pillarOn") want = 1; if (name === "pillarOff") want = 0; };
  const env = { clear: "#e9e6f1", fog: "#e9e6f1", fogDensity: 0.03, hemi: [0.95, "#ffffff", "#c8c0dc"], sun: [0.45, "#ffffff", [0.1, -1, 0.2]], warm: 0 };
  const toonEnv = { lightDir: [-0.1, 1, -0.2], fogColor: "#e9e6f1", fogDensity: 0.022, sky: [1.1, 1.08, 1.14], ground: [0.9, 0.88, 0.96], rim: [1.0, 0.98, 1.08] };
  return { env, toon: toonEnv, show: K.show, conditions: K.conditions, outdoor: true, cue,
    update(dt, t) {
      lit += (want - lit) * Math.min(1, dt * 2.5);
      pillar.scaling.x = pillar.scaling.z = Math.max(0.01, lit); pillarM.alpha = 0.38 * lit; ring.setEnabled(lit > 0.05);
      ring.rotation.y += dt * 0.6;
      for (const d of drifting) { d.n.position.y += Math.sin(t * 0.5 + d.b) * dt * 0.25; d.n.rotation.y += dt * 0.05; }
    } };
}

/** The Watch House (data/law.js): the sergeant's desk, the wanted board, a weapon rack, and two barred cells. */
function buildWatchhouse(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, W = WATCH_LAYOUT;
  const P = palette(scene, "wh"), PR = props(scene, K, P);
  const room = buildRoom(scene, K, { prefix: "wh", half: W.half, wall: "#b8b2a6", wainscot: "#4a4f5a", floorA: "#8a857a", floorB: "#7a756b", door: W.door,
    windows: [["w", -3, 2.4, 1.0, 0.8], ["n", -3.2, 3.1, 0.7, 0.45]] });
  const iron = P("#2e3038"), wood = P("#6a4a2a");
  // The cells: bars along the front of each (one door standing open), a stone wall between them.
  for (const c of W.cells) {
    for (let x = c.x0 + 0.15; x < c.x1; x += 0.3) {
      if (c.gap && x > c.gap[0] && x < c.gap[1]) continue;
      const bar = add(MB.CreateCylinder("wh-bar", { height: 3.0, diameter: 0.07, tessellation: 6 }, scene), 0.01); bar.position.set(x, 1.5, W.cellZ); bar.material = iron;
    }
    for (const y of [0.1, 2.95]) { const rail = add(MB.CreateBox("wh-rail", { width: c.x1 - c.x0, height: 0.1, depth: 0.12 }, scene), 0.01); rail.position.set((c.x0 + c.x1) / 2, y, W.cellZ); rail.material = iron; }
    if (c.gap) { // the open cell door, swung back against the bars
      const door = new BB.TransformNode("wh-cellDoor", scene); door.parent = K.root; door.position.set(c.gap[0], 0, W.cellZ); door.rotation.y = -1.9;
      for (let k = 0; k < 4; k++) { const bar = add(MB.CreateCylinder("wh-doorBar", { height: 2.9, diameter: 0.07, tessellation: 6 }, scene), 0.01); bar.parent = door; bar.position.set(0.12 + k * 0.28, 1.45, 0); bar.material = iron; }
    }
  }
  const wall = add(MB.CreateBox("wh-cellWall", { width: 1.2, height: 4, depth: W.half[1] - W.cellZ }, scene), 0.03); wall.position.set(0, 2, (W.cellZ + W.half[1]) / 2); wall.material = P("#a8a296");
  const CT = W.cot, cot = add(MB.CreateBox("wh-cot", { width: CT.x1 - CT.x0, height: 0.45, depth: CT.z1 - CT.z0 }, scene), 0.02); cot.position.set((CT.x0 + CT.x1) / 2, 0.22, (CT.z0 + CT.z1) / 2); cot.material = wood;
  const blanket = add(MB.CreateBox("wh-blanket", { width: CT.x1 - CT.x0 - 0.2, height: 0.08, depth: CT.z1 - CT.z0 - 0.2 }, scene), 0.01); blanket.position.set(cot.position.x, 0.5, cot.position.z); blanket.material = P("#3a4a6a");
  const bench2 = add(MB.CreateBox("wh-cellBench", { width: 2.2, height: 0.45, depth: 0.6 }, scene), 0.02); bench2.position.set(3.6, 0.22, 4.3); bench2.material = wood;
  // The front room: the desk with its ledger and lamp, a bench for the waiting, the rack, the board.
  const D = W.desk, desk = add(MB.CreateBox("wh-desk", { width: D.x1 - D.x0, height: 0.9, depth: D.z1 - D.z0 }, scene), 0.03); desk.position.set((D.x0 + D.x1) / 2, 0.45, (D.z0 + D.z1) / 2); desk.material = wood;
  const ledger = add(MB.CreateBox("wh-ledger", { width: 0.6, height: 0.06, depth: 0.42 }, scene), 0.01); ledger.position.set(desk.position.x - 0.4, 0.93, desk.position.z); ledger.material = P("#e8e0cc");
  const lamp = add(MB.CreateBox("wh-deskLamp", { width: 0.2, height: 0.3, depth: 0.2 }, scene)); lamp.position.set(desk.position.x + 0.8, 1.05, desk.position.z); lamp.material = glow(scene, "wh-lampGlow", "#ffd36a");
  PR.chair(W.sergeant.x, W.sergeant.z + 0.3, { ry: Math.PI });
  const BE = W.bench; PR.bench((BE.x0 + BE.x1) / 2, (BE.z0 + BE.z1) / 2, { ry: 0 });
  const R = W.rack, rack = add(MB.CreateBox("wh-rack", { width: R.x1 - R.x0, height: 1.8, depth: R.z1 - R.z0 }, scene), 0.02); rack.position.set((R.x0 + R.x1) / 2, 0.9, (R.z0 + R.z1) / 2); rack.material = wood;
  for (let k = 0; k < 3; k++) { const sp = add(MB.CreateCylinder("wh-spear", { height: 2.4, diameter: 0.06, tessellation: 5 }, scene), 0.01); sp.position.set(R.x1 - 0.1, 1.2, R.z0 + 0.25 + k * 0.35); sp.material = P("#7a5a3a"); }
  const board = add(MB.CreateBox("wh-board", { width: 0.08, height: 1.3, depth: 1.8 }, scene), 0.02); board.position.set(W.board.x - 0.15, 1.7, W.board.z); board.material = P("#8a6a46");
  for (let k = 0; k < 5; k++) { const sheet = add(MB.CreatePlane("wh-poster", { width: 0.42, height: 0.5, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); sheet.position.set(W.board.x - 0.2, 1.45 + (k % 2) * 0.55, W.board.z - 0.6 + Math.floor(k / 2) * 0.55); sheet.rotation.y = Math.PI / 2; sheet.rotation.z = (k % 3 - 1) * 0.06; sheet.material = P(k === 2 ? "#f0e0b8" : "#e8e2d4"); }
  PR.barrel(5.2, 0.6); PR.crate(4.6, 1.0, { ry: 0.4, s: 0.6 });
  const warm = new BB.PointLight("wh-warm", new BB.Vector3(-2, 2.6, -1.4), scene); warm.diffuse = color3("#ffc890").clone(); warm.intensity = 0.5; warm.range = 13; K.lights.push(warm);
  K.bake(room.keep);
  const env = { clear: "#121418", fog: "#121418", fogDensity: 0.004, hemi: [0.62, "#e8e2d8", "#3a3a40"], sun: [0.45, "#e8d8c0", [0.3, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [-0.3, 1, -0.4], fogColor: "#121418", fogDensity: 0.002, sky: [0.98, 0.98, 1.0], ground: [0.74, 0.72, 0.72], rim: [0.85, 0.9, 1.0] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update(dt, t) { room.cutaway(scene.activeCamera, self.mood?.player); warm.intensity = 0.48 + Math.sin(t * 6) * 0.03; } };
  return self;
}

/** Luke and Elsie's house in the Fens: plank walls, two cots, a stove, nets, the eel chest, Elsie's drawings. */
function buildFenhome(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, H = FENHOME_LAYOUT;
  const P = palette(scene, "fh"), PR = props(scene, K, P);
  const room = buildRoom(scene, K, { prefix: "fh", half: H.half, height: 3.4, wall: "#8f8470", wainscot: "#5a4a3a", floorA: "#7a6446", floorB: "#6a563c", door: H.door,
    windows: [["n", 2.2, 1.9, 1.0, 0.7], ["e", 1.4, 1.9, 0.8, 0.6]] });
  const cotAt = (c, quilt) => {
    const b = add(MB.CreateBox("fh-cot", { width: c.x1 - c.x0, height: 0.42, depth: c.z1 - c.z0 }, scene), 0.02); b.position.set((c.x0 + c.x1) / 2, 0.21, (c.z0 + c.z1) / 2); b.material = P("#6a4a2a");
    const q = add(MB.CreateBox("fh-quilt", { width: c.x1 - c.x0 - 0.1, height: 0.1, depth: c.z1 - c.z0 - 0.5 }, scene), 0.01); q.position.set(b.position.x, 0.47, b.position.z - 0.2); q.material = P(quilt);
  };
  cotAt(H.lukeCot, "#3a5a8a"); cotAt(H.elsieCot, "#d8a040");
  const S = H.stove, stove = add(MB.CreateBox("fh-stove", { width: S.x1 - S.x0, height: 1.1, depth: S.z1 - S.z0 }, scene), 0.03); stove.position.set((S.x0 + S.x1) / 2, 0.55, (S.z0 + S.z1) / 2); stove.material = P("#3a3a40");
  const fire = add(MB.CreateBox("fh-fire", { width: 0.05, height: 0.3, depth: 0.5 }, scene)); fire.position.set(S.x1 + 0.01, 0.4, stove.position.z); fire.material = glow(scene, "fh-fireGlow", "#ff9a3a");
  const T = H.table; PR.table((T.x0 + T.x1) / 2, (T.z0 + T.z1) / 2, { ry: 0, mugs: 2 }); PR.chair(T.x0 - 0.6, (T.z0 + T.z1) / 2, { ry: Math.PI / 2 });
  const C = H.chest, chest = add(MB.CreateBox("fh-chest", { width: C.x1 - C.x0, height: 0.55, depth: C.z1 - C.z0 }, scene), 0.02); chest.position.set((C.x0 + C.x1) / 2, 0.28, (C.z0 + C.z1) / 2); chest.material = P("#5a3a22");
  // Nets and eel traps on the west wall, Elsie's drawings pinned along the east wall, Luke's helmet on its peg.
  for (let k = 0; k < 2; k++) { const net = add(MB.CreatePlane("fh-net", { width: 1.4, height: 1.1, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); net.position.set(-H.half[0] + 0.15, 2.0, 0.8 + k * 1.5); net.rotation.y = Math.PI / 2; net.material = P("#a89a78"); }
  for (let k = 0; k < 4; k++) { const d = add(MB.CreatePlane("fh-drawing", { width: 0.42, height: 0.32, sideOrientation: BB.Mesh.DOUBLESIDE }, scene)); d.position.set(H.half[0] - 0.15, 1.5 + (k % 2) * 0.4, -1.9 + k * 0.45); d.rotation.y = Math.PI / 2; d.rotation.z = (k % 2 ? -1 : 1) * 0.08; d.material = P(["#f2ead2", "#e8dcc4", "#f6f1e8", "#ece2cc"][k]); }
  const peg = add(MB.CreateCylinder("fh-peg", { height: 0.25, diameter: 0.05, tessellation: 5 }, scene)); peg.position.set(-H.half[0] + 0.2, 1.8, -2.4); peg.rotation.z = Math.PI / 2; peg.material = P("#5a3a22");
  const helm = add(MB.CreateSphere("fh-helmet", { diameter: 0.4, segments: 8, slice: 0.55 }, scene), 0.012); helm.position.set(-H.half[0] + 0.35, 1.72, -2.4); helm.material = P("#c9d2dc");
  PR.barrel(-3.8, -3.2); PR.sack(3.8, -3.2); PR.plant(3.9, 0.4, { s: 0.8 });
  const warm = new BB.PointLight("fh-warm", new BB.Vector3(-2.6, 2.2, -0.4), scene); warm.diffuse = color3("#ffb070").clone(); warm.intensity = 0.55; warm.range = 10; K.lights.push(warm);
  K.bake(room.keep);
  const env = { clear: "#141218", fog: "#141218", fogDensity: 0.004, hemi: [0.66, "#ffe6c8", "#4a3a30"], sun: [0.45, "#ffd8a8", [0.3, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [-0.3, 1, -0.4], fogColor: "#141218", fogDensity: 0.002, sky: [1.04, 0.98, 0.9], ground: [0.82, 0.74, 0.66], rim: [1.0, 0.84, 0.7] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update(dt, t) { room.cutaway(scene.activeCamera, self.mood?.player); fire.scaling.y = 0.85 + Math.sin(t * 9) * 0.15; warm.intensity = 0.5 + Math.sin(t * 7) * 0.05; } };
  return self;
}

/**
 * The Hall of Lanterns (inside): a long stone hall, a red runner down the aisle between two rows of columns,
 * and a shelf of lanterns for each of the seven squads under its banner. Most flames burn; the fallen's wicks
 * are a little heap of ash. The Lanterns' shelf on the far wall follows the story (conditional dressing).
 */
function buildHall(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, H = HALL_LAYOUT;
  const P = palette(scene, "hl");
  const room = buildRoom(scene, K, { prefix: "hl", half: H.half, height: 6, wall: "#d8d0c0", wainscot: "#6a5a4a", floorA: "#b8ad98", floorB: "#a39882", door: H.door,
    windows: [] });
  const [hx, hz] = H.half;
  const runner = add(MB.CreateGround("hl-runner", { width: 2.2, height: hz * 2 - 1 }, scene)); runner.position.set(0, 0.012, 0); runner.material = P("#8a2a2a");
  for (const z of [-6, -2, 2, 6]) for (const x of [-2.6, 2.6]) {
    const c = add(MB.CreateCylinder("hl-col", { height: 6, diameter: 0.7, tessellation: 10 }, scene), 0.03); c.position.set(x, 3, z); c.material = P("#e8e0cf");
    const base = add(MB.CreateBox("hl-colBase", { width: 0.95, height: 0.3, depth: 0.95 }, scene), 0.02); base.position.set(x, 0.15, z); base.material = P("#b8ad98");
  }
  const wood = P("#4a3222"), frameM = P("#2a2a33"), flameM = glow(scene, "hl-flame", "#ffcf6a"), ashM = P("#8a8a8a"), wickM = P("#1a1a1a");
  // An open lantern: a dark cap and base, two thin back posts, and between them either a glowing pane (lit)
  // or nothing but what's left of the wick (dark, or ash). Instanced everywhere: ~120 lanterns, a few draw calls.
  const src = (name, mesh, mat) => { mesh.material = mat; mesh.isPickable = false; add(mesh); mesh.setEnabled(false); return mesh; };
  const capSrc = src("hl-capSrc", MB.CreateBox("hl-capSrc", { width: 0.24, height: 0.05, depth: 0.24 }, scene), frameM);
  const postSrc = src("hl-postSrc", MB.CreateBox("hl-postSrc", { width: 0.025, height: 0.26, depth: 0.025 }, scene), frameM);
  const flameSrc = src("hl-flameSrc", MB.CreateBox("hl-flameSrc", { width: 0.17, height: 0.22, depth: 0.17 }, scene), flameM);
  const ashSrc = src("hl-ashSrc", MB.CreateCylinder("hl-ashSrc", { height: 0.035, diameterTop: 0.04, diameterBottom: 0.12, tessellation: 6 }, scene), ashM);
  const flames = [];
  const inst = (s0, parent, x, y, z) => { const m = s0.createInstance(s0.name); m.parent = parent; m.position.set(x, y, z); m.isPickable = false; return m; };
  const lantern = (parent, x, y, z, state) => { // state: "lit" | "ash" | "none" (its contents dressed by a condition)
    inst(capSrc, parent, x, y + 0.155, z); inst(capSrc, parent, x, y - 0.155, z);
    for (const dx of [-0.1, 0.1]) inst(postSrc, parent, x + dx, y, z + 0.1);
    if (state === "lit") flames.push(inst(flameSrc, parent, x, y, z));
    if (state === "ash") inst(ashSrc, parent, x, y - 0.115, z);
  };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const q of H.squads) {
    const n = new BB.TransformNode(`hl-shelf-${q.id}`, scene); n.parent = K.root;
    // Local +z points at the wall the shelf stands against; local +x runs left to right as you face it.
    if (q.wall === "n") { n.position.set(q.x, 0, hz - 0.55); n.rotation.y = 0; }
    else if (q.wall === "w") { n.position.set(-hx + 0.55, 0, q.z); n.rotation.y = -Math.PI / 2; }
    else { n.position.set(hx - 0.55, 0, q.z); n.rotation.y = Math.PI / 2; }
    const w = q.wall === "n" ? 5.2 : 3.2;
    const back = add(MB.CreateBox("hl-shelfBack", { width: w, height: 2.8, depth: 0.08 }, scene), 0.02); back.parent = n; back.position.set(0, 1.4, 0.22); back.material = wood;
    for (const sx of [-w / 2, w / 2]) { const side = add(MB.CreateBox("hl-shelfSide", { width: 0.1, height: 2.8, depth: H.shelfDepth }, scene), 0.02); side.parent = n; side.position.set(sx, 1.4, 0); side.material = wood; }
    const tiers = q.wall === "n" ? [0.62, 1.32, 2.2] : [0.55, 1.32, 2.1];
    for (const y of tiers) { const t = add(MB.CreateBox("hl-tier", { width: w, height: 0.06, depth: H.shelfDepth }, scene), 0.012); t.parent = n; t.position.set(0, y, 0); t.material = wood; }
    const banner = add(MB.CreateBox("hl-banner", { width: w * 0.6, height: 1.4, depth: 0.04 }, scene), 0.015); banner.parent = n; banner.position.set(0, 3.7, 0.16); banner.material = P(q.color);
    const crest = add(MB.CreateBox("hl-crest", { width: 0.42, height: 0.42, depth: 0.05 }, scene), 0.01); crest.parent = n; crest.position.set(0, 3.8, 0.12); crest.rotation.z = Math.PI / 4; crest.material = P("#f2efe6");
    // Rows of lanterns: most burn; a few of the fallen are ash. The Lanterns' eye-height row is placed below.
    for (const y of tiers) {
      if (q.id === "lanterns" && y === tiers[1]) continue;
      const count = q.wall === "n" ? 7 : 5;
      for (let i = 0; i < count; i++) {
        const x = -w / 2 + 0.45 + i * ((w - 0.9) / (count - 1));
        if (q.id === "wardens" && y === tiers[1] && i === 2) continue; // Brannoc's place, dressed below
        lantern(n, x, y + 0.18, 0, rnd() < (q.id === "lanterns" ? 0.3 : 0.16) ? "ash" : "lit");
      }
    }
  }
  // The Lanterns' row at eye height (on the far wall, facing the hall): Dagrun, Cal, Juno, Bas, Tamsin, Lio, you.
  const row = new BB.TransformNode("hl-lanternsRow", scene); row.parent = K.root;
  const rowZ = hz - 0.55, rowY = H.lanternY;
  H.lanterns.forEach((who, i) => lantern(row, H.lanternX(i), rowY, rowZ, who === "cal" || who === "rook" ? "none" : "lit"));
  const calLit = K.when("not $CAL_STATE"), calDark = K.when("$CAL_STATE");
  const calX = H.lanternX(H.lanterns.indexOf("cal"));
  { const fl = flameSrc.createInstance("hl-calFlame"); fl.parent = calLit; fl.position.set(calX, rowY, rowZ); flames.push(fl); }
  // Dark, but the wick still stands: not ash. (Look at the shelf above to see what ash looks like.)
  { const wk = add(MB.CreateCylinder("hl-calWick", { height: 0.14, diameter: 0.025, tessellation: 5 }, scene)); wk.parent = calDark; wk.position.set(calX, rowY - 0.06, rowZ); wk.material = wickM; } // stands up from the base: whole
  const meLit = K.when("$LANTERN_LIT"), myX = H.lanternX(H.lanterns.indexOf("rook"));
  { const fl = flameSrc.createInstance("hl-myFlame"); fl.parent = meLit; fl.position.set(myX, rowY, rowZ); flames.push(fl); }
  // Brannoc's lantern: a captain's, bigger, at the front of the Wardens' shelf. Lit (its ash comes later in the story).
  const BY = 1.32 + 0.2; // the Wardens' middle tier
  lantern(K.root, -hx + 0.55, BY, H.brannoc.z, "none"); // the captain's: its flame (or its ash) follows the story
  const bLit = K.when("not $BRANNOC_DEAD"), bAsh = K.when("$BRANNOC_DEAD");
  { const fl = flameSrc.createInstance("hl-brannocFlame"); fl.parent = bLit; fl.position.set(-hx + 0.55, BY, H.brannoc.z); fl.scaling.setAll(1.15); flames.push(fl); }
  { const a = ashSrc.createInstance("hl-brannocAsh"); a.parent = bAsh; a.position.set(-hx + 0.55, BY - 0.115, H.brannoc.z); }
  // Light: warm from the lanterns, cool from high windows (glow strips), a great lantern hung over the aisle.
  const high = glow(scene, "hl-window", "#b8c8e8");
  for (const z of [-6, 0, 6]) for (const x of [-hx + 0.14, hx - 0.14]) { const w = add(MB.CreateBox("hl-win", { width: 0.04, height: 1.6, depth: 1.1 }, scene)); w.position.set(x, 4.9, z + 2.5); w.material = high; }
  const great = add(MB.CreateBox("hl-greatLantern", { width: 0.8, height: 1.1, depth: 0.8 }, scene), 0.03); great.position.set(0, 4.6, 0); great.material = glow(scene, "hl-great", "#ffd36a");
  const chain = add(MB.CreateCylinder("hl-chain", { height: 1.4, diameter: 0.05, tessellation: 4 }, scene)); chain.position.set(0, 5.8, 0); chain.material = frameM;
  const warm = new BB.PointLight("hl-warm", new BB.Vector3(0, 4.2, 0), scene); warm.diffuse = color3("#ffc070").clone(); warm.intensity = 0.6; warm.range = 22; K.lights.push(warm);
  // Shelves, tiers and banners are static: lift them out of their shelf nodes so the bake can merge them.
  for (const q of H.squads) for (const m of scene.getTransformNodeByName(`hl-shelf-${q.id}`).getChildMeshes(true)) if (!(m instanceof BB.InstancedMesh)) m.setParent(K.root);
  K.bake([...room.keep, great]);
  const env = { clear: "#18151c", fog: "#18151c", fogDensity: 0.004, hemi: [0.62, "#ffe6c8", "#3a3040"], sun: [0.45, "#ffd8a8", [0.2, -1, 0.5]], warm: 0 };
  const toonEnv = { lightDir: [-0.2, 1, -0.5], fogColor: "#18151c", fogDensity: 0.002, sky: [1.04, 0.98, 0.94], ground: [0.8, 0.74, 0.72], rim: [1.0, 0.84, 0.7] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update(dt, t) {
      room.cutaway(scene.activeCamera, self.mood?.player);
      for (let i = 0; i < flames.length; i++) flames[i].scaling.y = (flames[i].name === "hl-brannocFlame" ? 1.15 : 1) * (0.88 + Math.sin(t * 8 + i * 1.7) * 0.12);
      warm.intensity = 0.56 + Math.sin(t * 5) * 0.04;
    } };
  return self;
}

/**
 * The Grand Archive (Eps 44–48, data/zones.js ARCHIVE_LAYOUT): a long reading hall of pale stone between tall stacks of
 * books, reading tables down the aisle under hanging lamps, the sealed stacks behind an iron grille, and at the far end
 * the lock: a round door of dark stone set in a low dais, its keyhole in two halves, under a shaft of light from the eye
 * in the dome.
 */
function buildArchive(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = ARCHIVE_LAYOUT, P = palette(scene, "ar");
  const rng = mulberry(44);
  const room = buildRoom(scene, K, { prefix: "ar", half: L.half, height: L.height, wall: "#e2d8c4", wainscot: "#5a4030", floorA: "#cfc4b0", floorB: "#b4a892", door: L.door,
    windows: [["w", -9, 5.2, 1.2, 2.8], ["w", -2, 5.2, 1.2, 2.8], ["e", -9, 5.2, 1.2, 2.8], ["e", -2, 5.2, 1.2, 2.8]] });
  const [hx, hz] = L.half;
  const runner = add(MB.CreateGround("ar-runner", { width: 2.6, height: hz * 2 - 6 }, scene)); runner.position.set(0, 0.012, -3); runner.material = P("#2b3f6a");
  // The stacks: a dark frame, five shelves a side, books in blocks of colour.
  const wood = P("#3a2a1e"), bookMs = ["#7a2a2a", "#2b4f6a", "#4a5a2a", "#6a4a2a", "#5a3a6a", "#8a6a3a"].map((c) => P(c));
  for (const [x, z0, z1] of L.stacks) {
    const len = z1 - z0, cz = (z0 + z1) / 2;
    const frame = add(MB.CreateBox("ar-stack", { width: 1.0, height: 4.2, depth: len }, scene), 0.03); frame.position.set(x, 2.1, cz); frame.material = wood;
    for (const side of [-1, 1]) for (let t = 0; t < 5; t++) {
      for (let a = z0 + 0.15; a < z1 - 0.3;) {
        const w = 0.5 + rng() * 0.7, run = Math.min(w, z1 - 0.15 - a);
        const b = add(MB.CreateBox("ar-books", { width: 0.06, height: 0.5 + rng() * 0.12, depth: run - 0.04 }, scene));
        b.position.set(x + side * 0.51, 0.45 + t * 0.78, a + run / 2); b.material = bookMs[Math.floor(rng() * bookMs.length)];
        a += run;
      }
    }
  }
  // Reading tables with a lamp each.
  const lampM = glow(scene, "ar-lamp", "#ffd890");
  for (const [x, z] of L.tables) {
    const top = add(MB.CreateBox("ar-table", { width: 1.0, height: 0.08, depth: 2.4 }, scene), 0.02); top.position.set(x, 0.78, z); top.material = P("#5a3a26");
    for (const [dx, dz] of [[-0.4, -1.05], [0.4, -1.05], [-0.4, 1.05], [0.4, 1.05]]) { const leg = add(MB.CreateBox("ar-leg", { width: 0.08, height: 0.76, depth: 0.08 }, scene)); leg.position.set(x + dx, 0.38, z + dz); leg.material = P("#3a2618"); }
    const lamp = add(MB.CreateBox("ar-tableLamp", { width: 0.18, height: 0.26, depth: 0.18 }, scene)); lamp.position.set(x, 0.95, z + 0.6); lamp.material = lampM;
    const book = add(MB.CreateBox("ar-openBook", { width: 0.5, height: 0.04, depth: 0.36 }, scene)); book.position.set(x, 0.84, z - 0.3); book.material = P("#efe6d2");
  }
  // Lamps hung over the aisle.
  for (const z of [-10, -4, 2]) {
    const l = add(MB.CreateBox("ar-hangLamp", { width: 0.5, height: 0.7, depth: 0.5 }, scene), 0.02); l.position.set(0, 5.6, z); l.material = lampM;
    const c = add(MB.CreateCylinder("ar-chain", { height: L.height - 6, diameter: 0.04, tessellation: 4 }, scene)); c.position.set(0, 5.95 + (L.height - 6) / 2, z); c.material = P("#2a2a30");
  }
  // The sealed stacks: an iron grille (bars), its gate standing open, a lectern with the old book on it.
  const S = L.sealed, barM = P("#2a2a30");
  const bars = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(len / 0.22));
    for (let i = 0; i <= n; i++) { const b = add(MB.CreateCylinder("ar-bar", { height: 3.2, diameter: 0.05, tessellation: 4 }, scene)); b.position.set(x0 + ((x1 - x0) * i) / n, 1.6, z0 + ((z1 - z0) * i) / n); b.material = barM; }
    const rail = add(MB.CreateBox("ar-grilleRail", { width: Math.abs(x1 - x0) || 0.08, height: 0.08, depth: Math.abs(z1 - z0) || 0.08 }, scene)); rail.position.set((x0 + x1) / 2, 3.2, (z0 + z1) / 2); rail.material = barM;
  };
  bars(S.x0, S.z0, S.gate[0], S.z0); bars(S.gate[1], S.z0, S.x1, S.z0); bars(S.x1, S.z0, S.x1, S.z1);
  bars(S.gate[0], S.z0, S.gate[0], S.z0 + (S.gate[1] - S.gate[0])); // the gate, swung open (inward): bars too
  const lec = add(MB.CreateCylinder("ar-lectern", { height: 1.1, diameterTop: 0.3, diameterBottom: 0.5, tessellation: 8 }, scene), 0.02); lec.position.set(L.lectern.x, 0.55, L.lectern.z); lec.material = P("#3a2618");
  const old = add(MB.CreateBox("ar-oldBook", { width: 0.56, height: 0.1, depth: 0.42 }, scene)); old.position.set(L.lectern.x, 1.16, L.lectern.z); old.rotation.x = -0.3; old.material = P("#4a2a20");
  // The lock: a low dais, a round door of dark stone in it with a ring of script, and a keyhole in two halves.
  const D = L.dais;
  const dais = add(MB.CreateCylinder("ar-dais", { height: 0.4, diameter: D.r * 2, tessellation: 40 }, scene), 0.03); dais.position.set(D.x, 0.2, D.z); dais.material = P("#9a9284");
  const door = add(MB.CreateCylinder("ar-lockDoor", { height: 0.06, diameter: D.r * 1.36, tessellation: 40 }, scene)); door.position.set(D.x, 0.42, D.z); door.material = P("#26232c");
  const ringM = glow(scene, "ar-lockRing", "#e8d49a");
  const ring = add(MB.CreateTorus("ar-lockRing", { diameter: D.r * 1.2, thickness: 0.05, tessellation: 48 }, scene)); ring.position.set(D.x, 0.46, D.z); ring.material = ringM;
  for (const s of [-1, 1]) { // the two halves of the keyhole, each a crescent cut into the stone
    const half = add(MB.CreateBox("ar-keyhole", { width: 0.16, height: 0.04, depth: 0.7 }, scene)); half.position.set(D.x + s * 0.14, 0.46, D.z); half.rotation.y = s * 0.35; half.material = P("#0e0d12");
  }
  // The eye in the dome: a shaft of daylight on the lock.
  const shaftM = glow(scene, "ar-shaft", "#fff4d8", 0.12, true);
  const shaft = add(MB.CreateCylinder("ar-shaft", { height: L.height, diameterTop: 2.6, diameterBottom: 3.4, tessellation: 24 }, scene)); shaft.position.set(D.x, L.height / 2, D.z); shaft.material = shaftM; shaft.isPickable = false;
  const warm = new BB.PointLight("ar-warm", new BB.Vector3(0, 5, -3), scene); warm.diffuse = color3("#ffcf88").clone(); warm.intensity = 0.55; warm.range = 26; K.lights.push(warm);
  const cool = new BB.PointLight("ar-eye", new BB.Vector3(D.x, L.height - 0.5, D.z), scene); cool.diffuse = color3("#fff0d0").clone(); cool.intensity = 0.5; cool.range = 12; K.lights.push(cool);
  K.bake([...room.keep, shaft, ring]);
  const env = { clear: "#16141a", fog: "#16141a", fogDensity: 0.004, hemi: [0.62, "#fff0dc", "#3a3440"], sun: [0.45, "#ffe0b0", [0.2, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [-0.2, 1, -0.4], fogColor: "#16141a", fogDensity: 0.002, sky: [1.04, 1.0, 0.94], ground: [0.8, 0.76, 0.72], rim: [1.0, 0.88, 0.72] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true,
    update(dt, t) {
      room.cutaway(scene.activeCamera, self.mood?.player);
      ringM.alpha = 0.75 + Math.sin(t * 1.3) * 0.2;
    } };
  return self;
}

/**
 * The Lowmarket Bridge in the Siege of Aurelin (Eps 47–48, data/zones.js BRIDGE_LAYOUT): an old stone bridge over the
 * dry riverbed between the Lowmarket and the Crown Ward, the houses on both banks burning, smoke going up, the Archive's
 * dome on its hill to the north, and over it all the Gate (buildGate). Its southern spans fall in during the fight
 * (cues collapse1 and collapse2, or $BRIDGE_FALLEN once they have), behind the people holding it.
 */
function buildBridge(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = BRIDGE_LAYOUT, P = palette(scene, "br"), rng = mulberry(47);
  const stone = P("#8a8070"), stoneDark = P("#5e564a"), soot = P("#2e2622");
  const H = L.deck.half, C = L.canal;
  // The riverbed, long dry, far below; the embankments; the streets on both banks.
  const bed = add(MB.CreateGround("br-bed", { width: 200, height: (L.deck.z1 - L.deck.z0) + 4 }, scene)); bed.position.set(0, -C.depth, 0); bed.material = P("#4a3e34");
  for (const z of [L.deck.z0 - 1, L.deck.z1 + 1]) {
    const wall = add(MB.CreateBox("br-embank", { width: 200, height: C.depth, depth: 2 }, scene), 0.03); wall.position.set(0, -C.depth / 2, z); wall.material = stoneDark;
    const bank = add(MB.CreateGround("br-bank", { width: 200, height: 60 }, scene)); bank.position.set(0, 0, z + Math.sign(z) * 31); bank.material = P("#6a6258");
  }
  // The deck, span by span. The two southern spans can fall in.
  const spans = [[L.deck.z0, L.collapse[0][0]], ...L.collapse, [L.collapse[1][1], L.deck.z1]];
  const fallen = [];
  spans.forEach(([z0, z1], i) => {
    const n = new BB.TransformNode(`br-span${i}`, scene); n.parent = K.root;
    const d = add(MB.CreateBox("br-deck", { width: H * 2, height: 0.8, depth: z1 - z0 }, scene), 0.03); d.parent = n; d.position.set(0, -0.4, (z0 + z1) / 2); d.material = stone;
    for (const sx of [-1, 1]) { const par = add(MB.CreateBox("br-parapet", { width: 0.45, height: 0.9, depth: z1 - z0 }, scene), 0.02); par.parent = n; par.position.set(sx * (H + 0.2), 0.45, (z0 + z1) / 2); par.material = stoneDark; }
    const ci = L.collapse.findIndex(([a, b]) => a === z0 && b === z1);
    if (ci >= 0) {
      const rub = new BB.TransformNode(`br-rubble${ci}`, scene); rub.parent = K.root; rub.setEnabled(false);
      for (let k = 0; k < 6; k++) { const r = add(MB.CreateBox("br-rubble", { width: 1 + rng() * 2, height: 0.6 + rng(), depth: 1 + rng() * 1.6 }, scene)); r.parent = rub; r.position.set((rng() - 0.5) * H * 1.6, -C.depth + 0.4, z0 + rng() * (z1 - z0)); r.rotation.set(rng(), rng() * 3, rng()); r.material = stoneDark; }
      for (const zz of [z0, z1]) { const e = add(MB.CreateBox("br-brokenEdge", { width: H * 2, height: 1.2, depth: 0.6 }, scene)); e.parent = rub; e.position.set(0, -0.9, zz); e.rotation.x = zz === z0 ? 0.3 : -0.3; e.material = soot; }
      fallen.push({ span: n, rubble: rub, flag: K.when(`$BRIDGE_FALLEN >= ${ci + 1}`), down: false });
    }
  });
  for (const z of L.piers) {
    const pier = add(MB.CreateBox("br-pier", { width: H * 2 - 1, height: C.depth, depth: 2.4 }, scene), 0.03); pier.position.set(0, -0.8 - C.depth / 2, z); pier.material = stoneDark;
    const arch = add(MB.CreateCylinder("br-arch", { height: H * 2 - 0.6, diameter: 9, tessellation: 18, arc: 0.5 }, scene)); arch.rotation.z = Math.PI / 2; arch.position.set(0, -C.depth + 0.4, z + 7); arch.material = soot;
  }
  // Lamps on the parapets, the wrecks on the deck.
  const lampM = K.lampMat ? K.lampMat("br-lamp", "#ffc070") : glow(scene, "br-lamp", "#ffc070");
  for (let z = L.deck.z0 + 4; z < L.deck.z1; z += 10) for (const sx of [-1, 1]) {
    const post = add(MB.CreateCylinder("br-lampPost", { height: 3, diameter: 0.14, tessellation: 6 }, scene)); post.position.set(sx * (H + 0.2), 2.4, z); post.material = soot;
    const head = add(MB.CreateBox("br-lampHead", { width: 0.4, height: 0.5, depth: 0.4 }, scene)); head.position.set(sx * (H + 0.2), 4.1, z); head.material = lampM;
  }
  for (const [x, z, r] of L.wrecks) {
    const w = add(MB.CreateBox("br-wreck", { width: r * 2.2, height: 1.0, depth: r * 1.4 }, scene), 0.03); w.position.set(x, 0.5, z); w.rotation.set(0.1, rng() * 3, 0.2); w.material = P("#5a3e2a");
    const wheel = add(MB.CreateCylinder("br-wheel", { height: 0.15, diameter: 1.1, tessellation: 12 }, scene)); wheel.position.set(x + r * 0.9, 0.55, z); wheel.rotation.z = Math.PI / 2; wheel.material = soot;
  }
  // The banks: rows of houses, many of them burning.
  const fires = [], fireM = glow(scene, "br-fire", "#ff7a2a", 0.95, true), wallMs = ["#c8b89a", "#b8a888", "#d0c0a0"].map((c) => P(c)), roofMs = ["#6a2a22", "#3a3a4a"].map((c) => P(c));
  for (const zb of [L.deck.z0 - 8, L.deck.z1 + 8]) for (let x = -44; x <= 44; x += 9) {
    if (Math.abs(x) < 8) continue; // the street off the bridge
    const h = 6 + rng() * 4, zz = zb + Math.sign(zb) * rng() * 3;
    const house = add(MB.CreateBox("br-house", { width: 7.5, height: h, depth: 7 }, scene), 0.05); house.position.set(x, h / 2, zz); house.material = wallMs[Math.floor(rng() * 3)];
    const roof = add(MB.CreateCylinder("br-roof", { height: 7.6, diameter: 7.8, tessellation: 3 }, scene), 0.05); roof.position.set(x, h + 1.4, zz); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.scaling.set(0.55, 1, 1); roof.material = roofMs[Math.floor(rng() * 2)];
    if (rng() < 0.55) { const f = add(MB.CreateBox("br-flame", { width: 3 + rng() * 2, height: 2.2, depth: 2.4 }, scene)); f.position.set(x + (rng() - 0.5) * 3, h + 2.4, zz); f.material = fireM; fires.push(f); }
  }
  const fireLights = [[-17, L.deck.z1 + 8], [17, L.deck.z0 - 8]].map(([x, z], i) => { const l = new BB.PointLight(`br-fireLight${i}`, new BB.Vector3(x, 8, z), scene); l.diffuse = color3("#ff7a3a").clone(); l.intensity = 0.7; l.range = 40; K.lights.push(l); return l; });
  // Smoke, going up and drifting off with the wind.
  const smokeM = glow(scene, "br-smoke", "#1a1210", 0.32); smokeM.fogEnabled = true;
  const smoke = Array.from({ length: 9 }, (_, i) => { const m = add(MB.CreateSphere("br-smoke", { diameter: 6 + rng() * 5, segments: 6 }, scene)); m.material = smokeM; m.isPickable = false; m.position.set(-40 + rng() * 80, 6 + rng() * 20, (i % 2 ? L.deck.z1 + 10 : L.deck.z0 - 10) + (rng() - 0.5) * 6); m.metadata = { v: 1 + rng() }; return m; });
  // The Archive on its hill, and the Gate.
  const D = L.dome;
  const hill = add(MB.CreateCylinder("br-hill", { height: 8, diameterTop: D.r * 3, diameterBottom: D.r * 4.5, tessellation: 24 }, scene)); hill.position.set(D.x, 4, D.z); hill.material = P("#5a5248");
  const drum = add(MB.CreateCylinder("br-drum", { height: 10, diameter: D.r * 2, tessellation: 28 }, scene), 0.05); drum.position.set(D.x, 13, D.z); drum.material = P("#d8cdb6");
  const dome = add(MB.CreateSphere("br-dome", { diameter: D.r * 2, segments: 18, slice: 0.5 }, scene), 0.05); dome.position.set(D.x, 18, D.z); dome.material = P("#4a6a8a");
  const gate = buildGate(scene, K, "br", L.gate);
  // Pieces of a mask, falling onto the stone one by one (cue maskShards, Ep 48).
  const shardM = toon(scene, "br-shard", "#1e1e26");
  const shards = Array.from({ length: 7 }, (_, i) => {
    const m = add(MB.CreateBox("br-shard", { width: 0.07 + rng() * 0.08, height: 0.1 + rng() * 0.08, depth: 0.02 }, scene)); m.material = shardM; m.isPickable = false;
    m.position.set(L.shards.x + (rng() - 0.5) * 0.7, 1.9, L.shards.z + (rng() - 0.5) * 0.5); m.setEnabled(false);
    m.metadata = { delay: i * 0.18, spin: (rng() - 0.5) * 6, land: 0.012 + rng() * 0.01 };
    return m;
  });
  let shardT = -1;
  // A golden door frame standing on the deck, its lower edge at sitting height (cue doorSeat, Ep 50: he sits on it).
  const seat = makeDoor(scene, "br-doorSeat", { w: 1.6, h: 2.6 }); seat.parent = K.root; seat.position.set(L.seat.x, 0.55 + 1.3, L.seat.z + 0.12); seat.setEnabled(false);
  K.bake([...smoke, ...fires, ...shards]);
  // Smoke-dimmed afternoon light, warm from the fires; the red is in the sky, not on everything.
  const env = { clear: "#2a1412", fog: "#3a2a28", fogDensity: 0.009, hemi: [0.6, "#f2dcd0", "#2e2626"], sun: [0.55, "#ffd2b0", [-0.3, -1, 0.5]], warm: 0 };
  const toonEnv = { lightDir: [0.3, 1, -0.5], fogColor: "#3a2a28", fogDensity: 0.005, sky: [1.02, 0.94, 0.9], ground: [0.74, 0.68, 0.66], rim: [1.0, 0.72, 0.58] };
  const fall = (i) => { const f = fallen[i]; if (!f || f.down) return; f.down = true; f.span.setEnabled(false); f.rubble.setEnabled(true); };
  return { env, toon: toonEnv, show: K.show, conditions: K.conditions, outdoor: true,
    cue(name) {
      if (name === "collapse1") fall(0); if (name === "collapse2") fall(1);
      if (name === "maskShards") { shardT = 0; for (const m of shards) { m.setEnabled(true); m.position.y = 1.9; } }
      if (name === "doorSeat" || name === "doorSeatOff") seat.setEnabled(name === "doorSeat");
      gate.cue(name);
    },
    update(dt, t) {
      fallen.forEach((f, i) => { if (f.flag.isEnabled()) fall(i); });
      fires.forEach((f, i) => { f.scaling.y = 0.8 + Math.sin(t * 9 + i * 1.3) * 0.2; f.scaling.x = 0.9 + Math.sin(t * 6 + i) * 0.1; });
      fireLights.forEach((l, i) => { l.intensity = 0.62 + Math.sin(t * 7 + i * 2) * 0.12; });
      for (const m of smoke) { m.position.y += dt * m.metadata.v; m.position.x += dt * 0.8; if (m.position.y > 40) { m.position.y = 6; m.position.x -= 30; } }
      if (shardT >= 0) {
        shardT += dt;
        for (const m of shards) {
          const k = Math.max(0, shardT - m.metadata.delay);
          m.position.y = Math.max(m.metadata.land, 1.9 - 4.9 * k * k);
          if (m.position.y > m.metadata.land) { m.rotation.x += dt * m.metadata.spin; m.rotation.z += dt * m.metadata.spin * 0.6; } else m.rotation.x = Math.PI / 2;
        }
      }
      gate.update(dt, t);
    } };
}

/**
 * Ironhold, the eastern border: the Iron Wardens' grey wall with its gatehouse, the camp of tents and braziers
 * behind it, and the scorched field in front where the Ashfall Dominion comes on. Smoke and red banners on the
 * horizon are the enemy camp (out of reach).
 */
function buildIronhold(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, L = IRONHOLD_LAYOUT;
  const rng = mulberry(77), P = palette(scene, "ih"), PR = props(scene, K, P);
  const ground = add(MB.CreateGround("ih-ground", { width: 160, height: 160 }, scene)); ground.position.set(0, 0, -10); ground.material = toon(scene, "ih-earth", "#8a7a5e");
  const campGround = add(MB.CreateGround("ih-camp", { width: 60, height: 24 }, scene)); campGround.position.set(0, 0.008, -33); campGround.material = toon(scene, "ih-campEarth", "#7a6e58");
  // The field: scorch marks, craters, spent arrows and broken spears.
  const scorch = toon(scene, "ih-scorch", "#3a3028"), crater = toon(scene, "ih-crater", "#4a3e30");
  for (let i = 0; i < 26; i++) { const x = (rng() - 0.5) * 56, z = -16 + rng() * 38; const d = add(MB.CreateDisc("ih-scorch", { radius: 0.8 + rng() * 2.2, tessellation: 14 }, scene)); d.rotation.x = Math.PI / 2; d.position.set(x, 0.012 + i * 0.0004, z); d.material = scorch; }
  for (let i = 0; i < 8; i++) { const x = (rng() - 0.5) * 44, z = -12 + rng() * 32; const c = add(MB.CreateCylinder("ih-crater", { height: 0.25, diameterTop: 2.8, diameterBottom: 1.6, tessellation: 12 }, scene), 0.02); c.position.set(x, 0.0, z); c.material = crater; }
  const shaft = P("#5a4a32");
  for (let i = 0; i < 30; i++) { const x = (rng() - 0.5) * 40, z = -14 + rng() * 34; const a = add(MB.CreateCylinder("ih-arrow", { height: 0.9, diameter: 0.03, tessellation: 4 }, scene)); a.position.set(x, 0.35, z); a.rotation.set(rng() * 0.6 - 0.3, 0, rng() * 0.6 - 0.3); a.material = shaft; }
  for (let i = 0; i < 6; i++) PR.droppedBlade((rng() - 0.5) * 30, -10 + rng() * 26, { ry: rng() * 6 });
  // Barricades of crossed stakes along the far edge.
  const stake = P("#6a5236");
  for (const [x, z, ry] of L.barricades) {
    const n = new BB.TransformNode("ih-barricade", scene); n.parent = K.root; n.position.set(x, 0, z); n.rotation.y = ry;
    for (let k = -2; k <= 2; k++) for (const sgn of [-1, 1]) { const st = add(MB.CreateCylinder("ih-stake", { height: 2.4, diameterTop: 0.02, diameterBottom: 0.16, tessellation: 5 }, scene), 0.015); st.parent = n; st.position.set(k * 0.6, 0.8, 0); st.rotation.set(sgn * 0.7, 0, 0); st.material = stake; }
    const beam = add(MB.CreateCylinder("ih-beam", { height: 3.2, diameter: 0.18, tessellation: 6 }, scene), 0.015); beam.parent = n; beam.position.set(0, 0.5, 0); beam.rotation.z = Math.PI / 2; beam.material = stake;
  }
  // The wall: grey stone, crenellated, with a gatehouse and the gate standing open.
  const stone = toon(scene, "ih-stone", "#9a9690"), dark = toon(scene, "ih-stoneDark", "#7a7670");
  const [x0, , x1] = L.rect, z = L.wallZ, H = 6;
  for (const [a, b] of [[x0 - 20, -L.gateHalf], [L.gateHalf, x1 + 20]]) {
    const w = add(MB.CreateBox("ih-wall", { width: b - a, height: H, depth: 1.8 }, scene), 0.05); w.position.set((a + b) / 2, H / 2, z); w.material = stone;
    for (let x = a + 0.8; x < b - 0.4; x += 1.6) { const m = add(MB.CreateBox("ih-merlon", { width: 0.8, height: 0.8, depth: 1.8 }, scene), 0.02); m.position.set(x, H + 0.4, z); m.material = dark; }
  }
  for (const sx of [-1, 1]) {
    const t = add(MB.CreateCylinder("ih-tower", { height: H + 3, diameter: 3.6, tessellation: 12 }, scene), 0.05); t.position.set(sx * (L.gateHalf + 1.6), (H + 3) / 2, z); t.material = stone;
    const cap = add(MB.CreateCylinder("ih-towerCap", { height: 2.2, diameterTop: 0, diameterBottom: 4.2, tessellation: 12 }, scene), 0.04); cap.position.set(sx * (L.gateHalf + 1.6), H + 4.1, z); cap.material = toon(scene, "ih-slate", "#4a5260");
    const door = add(MB.CreateBox("ih-gateDoor", { width: L.gateHalf, height: 4.6, depth: 0.25 }, scene), 0.03); door.position.set(sx * (L.gateHalf + 0.2), 2.3, z + 1.6); door.rotation.y = sx * -1.25; door.material = P("#4a3222");
  }
  const lintel = add(MB.CreateBox("ih-lintel", { width: L.gateHalf * 2 + 0.4, height: 1.6, depth: 1.8 }, scene), 0.04); lintel.position.set(0, H - 0.8, z); lintel.material = stone;
  // Iron Wardens banners on the wall: grey and white.
  for (const x of [-16, -8, 8, 16]) { const b = add(MB.CreateBox("ih-banner", { width: 1.4, height: 3, depth: 0.05 }, scene), 0.02); b.position.set(x, H - 1.9, z + 0.95); b.material = P("#6a7280");
    const s = add(MB.CreateBox("ih-bannerMark", { width: 0.5, height: 0.5, depth: 0.06 }, scene)); s.position.set(x, H - 1.6, z + 0.97); s.rotation.z = Math.PI / 4; s.material = P("#f2efe6"); }
  // The camp: canvas tents, the command tent, braziers, weapon racks, carts, a training ring.
  const canvas = toon(scene, "ih-canvas", "#c8bca0"), canvasDark = toon(scene, "ih-canvasDark", "#9a8e74");
  for (const [x, tz] of L.tents) { const t = add(MB.CreateCylinder("ih-tent", { height: 4, diameter: 3.4, tessellation: 3 }, scene), 0.03); t.position.set(x, 1.1, tz); t.rotation.set(0, 0, Math.PI / 2); t.rotation.x = Math.PI / 2; t.scaling.set(1, 1, 0.9); t.material = rng() < 0.5 ? canvas : canvasDark; }
  const C = L.command;
  const cmd = add(MB.CreateBox("ih-command", { width: 6, height: 2.6, depth: 4.4 }, scene), 0.04); cmd.position.set(C.x, 1.3, C.z); cmd.material = canvas;
  const cmdRoof = add(MB.CreateCylinder("ih-commandRoof", { height: 6.4, diameter: 4.6, tessellation: 3 }, scene), 0.04); cmdRoof.position.set(C.x, 3.1, C.z); cmdRoof.rotation.set(0, Math.PI / 2, Math.PI / 2); cmdRoof.scaling.set(1, 1, 0.55); cmdRoof.material = P("#6a7280");
  const pole = add(MB.CreateCylinder("ih-pole", { height: 6, diameter: 0.12, tessellation: 6 }, scene), 0.015); pole.position.set(C.x + 3.6, 3, C.z - 2.6); pole.material = P("#5a4a32");
  const flag = add(MB.CreateBox("ih-flag", { width: 1.6, height: 1, depth: 0.04 }, scene), 0.015); flag.position.set(C.x + 4.4, 5.4, C.z - 2.6); flag.material = P("#6a7280");
  const fires = [];
  for (const [x, bz] of L.braziers) {
    const bowl = add(MB.CreateCylinder("ih-brazier", { height: 0.5, diameterTop: 0.9, diameterBottom: 0.4, tessellation: 10 }, scene), 0.02); bowl.position.set(x, 1.05, bz); bowl.material = P("#3a3a40");
    const leg = add(MB.CreateCylinder("ih-brazierLeg", { height: 0.85, diameter: 0.12, tessellation: 5 }, scene), 0.01); leg.position.set(x, 0.42, bz); leg.material = bowl.material;
    const f = add(MB.CreateCylinder("ih-fire", { height: 0.8, diameterTop: 0, diameterBottom: 0.6, tessellation: 7 }, scene)); f.position.set(x, 1.6, bz); f.material = glow(scene, "ih-fireGlow", "#ff9a3a"); fires.push(f);
  }
  for (const [x, rz] of [[-6, -27], [6, -27]]) { const r = add(MB.CreateBox("ih-rack", { width: 2.2, height: 0.12, depth: 0.12 }, scene), 0.015); r.position.set(x, 1.3, rz); r.material = P("#5a4a32");
    for (let k = 0; k < 4; k++) { const sp = add(MB.CreateCylinder("ih-rackSpear", { height: 2.6, diameter: 0.05, tessellation: 4 }, scene)); sp.position.set(x - 0.9 + k * 0.6, 1.3, rz); sp.rotation.x = 0.15; sp.material = P("#7a6a52"); } }
  PR.cart(14, -24, { ry: 0.4 }); PR.cart(-15, -25, { ry: -0.6, load: true }); PR.barrel(-7, -38); PR.barrel(-6.2, -38.4, { tipped: true }); PR.crate(7, -39, { ry: 0.3 }); PR.crate(7.8, -38.2, { s: 0.6 }); PR.woodpile(16, -38);
  PR.fence(L.ring.x - 3, L.ring.z - 3, L.ring.x + 3, L.ring.z - 3); PR.fence(L.ring.x - 3, L.ring.z + 3, L.ring.x + 3, L.ring.z + 3);
  // The memorial (after Ep 22): Brannoc's sword planted point-down at the command tent, a grey cloak over the hilt.
  const mem = K.when("$BRANNOC_DEAD");
  { const blade = add(MB.CreateBox("ih-memBlade", { width: 0.1, height: 1.4, depth: 0.04 }, scene), 0.012); blade.parent = mem; blade.position.set(C.x, 0.7, C.z + 3.1); blade.material = P("#9aa2ae");
    const guard = add(MB.CreateBox("ih-memGuard", { width: 0.5, height: 0.08, depth: 0.08 }, scene), 0.01); guard.parent = mem; guard.position.set(C.x, 1.42, C.z + 3.1); guard.material = P("#5a2a2a");
    const cloak = add(MB.CreateBox("ih-memCloak", { width: 0.5, height: 0.6, depth: 0.12 }, scene), 0.012); cloak.parent = mem; cloak.position.set(C.x, 1.25, C.z + 3.15); cloak.material = P("#6a7280");
    for (const dx of [-0.6, 0.6]) { const c = add(MB.CreateCylinder("ih-memCandle", { height: 0.25, diameter: 0.1, tessellation: 6 }, scene)); c.parent = mem; c.position.set(C.x + dx, 0.12, C.z + 3.3); c.material = glow(scene, "ih-candle", "#ffd36a"); } }
  // Brannoc's cairn on the gate field (after Ep 22): field stones, his shield against them, his cloak over the top.
  const cairn = K.when("$BRANNOC_DEAD"), CA = L.cairn;
  { const fieldStone = P("#8a8478");
    for (const [dx, dy, dz, d] of [[0, 0.24, 0, 0.95], [0.38, 0.18, 0.22, 0.62], [-0.34, 0.18, -0.2, 0.66], [0.04, 0.6, 0.02, 0.58], [-0.04, 0.9, 0, 0.4]]) {
      const st = add(MB.CreateSphere("ih-cairnStone", { diameter: d, segments: 6 }, scene), 0.015); st.parent = cairn; st.position.set(CA.x + dx, dy, CA.z + dz); st.scaling.y = 0.72; st.material = fieldStone;
    }
    const shield = add(MB.CreateCylinder("ih-cairnShield", { height: 0.07, diameter: 0.95, tessellation: 14 }, scene), 0.015); shield.parent = cairn;
    shield.position.set(CA.x, 0.5, CA.z + 0.6); shield.rotation.x = 1.25; shield.material = P("#9aa2ae");
    const boss = add(MB.CreateSphere("ih-cairnBoss", { diameter: 0.18, segments: 5 }, scene)); boss.parent = cairn; boss.position.set(CA.x, 0.54, CA.z + 0.66); boss.material = P("#8a2a2a");
    const drape = add(MB.CreateBox("ih-cairnCloak", { width: 0.7, height: 0.46, depth: 0.12 }, scene), 0.012); drape.parent = cairn; drape.position.set(CA.x - 0.05, 0.92, CA.z - 0.02); drape.rotation.z = 0.12; drape.material = P("#6a7280");
    const cord = K.when("$EP23_DONE"); // Juno's knot, from the vigil
    const knot = add(MB.CreateTorus("ih-cairnCord", { diameter: 0.34, thickness: 0.03, tessellation: 10 }, scene)); knot.parent = cord; knot.position.set(CA.x - 0.04, 1.08, CA.z); knot.material = P("#c8414f"); }
  // The enemy on the horizon: red banners, siege towers and smoke over the Ashfall camp.
  const red = P("#a02a2a");
  for (let i = 0; i < 9; i++) { const x = -40 + i * 10 + (rng() - 0.5) * 4, hz = 52 + rng() * 6;
    const p2 = add(MB.CreateCylinder("ih-farPole", { height: 7, diameter: 0.2, tessellation: 4 }, scene)); p2.position.set(x, 3.5, hz); p2.material = P("#3a2a22");
    const b = add(MB.CreateBox("ih-farBanner", { width: 1.6, height: 2.6, depth: 0.05 }, scene)); b.position.set(x + 0.9, 5.4, hz); b.material = red; }
  for (const [x, hz] of [[-24, 60], [10, 64], [30, 58]]) { const t = add(MB.CreateBox("ih-farTower", { width: 3, height: 10, depth: 3 }, scene), 0.04); t.position.set(x, 5, hz); t.material = P("#4a3a2a"); }
  // The east ridge: a long flat-topped rise of red-brown rock just past the field's edge, scrub on its crest.
  const RG = L.ridge, rock = toon(scene, "ih-ridgeRock", "#7a6650");
  { const r = add(MB.CreateCylinder("ih-ridge", { height: RG.h, diameterTop: 7, diameterBottom: 18, tessellation: 9 }, scene), 0.05); r.position.set(RG.x, RG.h / 2, RG.z); r.scaling.z = 2.6; r.material = rock;
    for (const [dx, dz, d] of [[-6, -14, 3.2], [-7.5, 3, 2.4], [-5.5, 16, 2.8], [2, -10, 2.2], [1, 12, 2.6]]) { const b = add(MB.CreateSphere("ih-ridgeBoulder", { diameter: d, segments: 6 }, scene), 0.03); b.position.set(RG.x + dx, d * 0.3, RG.z + dz); b.scaling.y = 0.7; b.material = rock; }
    const scrub = P("#5a5a3a");
    for (const [dx, dz] of [[1.5, -6], [2.4, -2], [1.8, 5], [2.6, 8.5], [1, -8.5]]) { const s = add(MB.CreateSphere("ih-ridgeScrub", { diameter: 0.9, segments: 5 }, scene), 0.015); s.position.set(RG.x + dx, RG.h + 0.25, RG.z + dz); s.scaling.y = 0.6; s.material = scrub; } }
  // The Cindermaw (Ep 24): Ashfall's last war engine, a wheeled siege tower with a battering ram cast as a jaw,
  // embers in its mouth. It rolls up the field (cue "engineRoll"), drops through a black tear opened under it
  // (cue "tear") and falls out of the sky onto the Ashfall camp (cue "sky"). After that only its wreck stays,
  // out on the horizon ($CINDERMAW_DOWN).
  const EN = L.engine, iron = P("#34363e"), timber = P("#4a3226"), emberM = glow(scene, "ih-mawEmber", "#ff7a2a");
  const buildMaw = (parent, name) => {
    const n = new BB.TransformNode(name, scene); n.parent = parent;
    const put = (m, mat, x, y, z, o = 0.03) => { const mm = add(m, o); mm.parent = n; mm.position.set(x, y, z); mm.material = mat; return mm; };
    put(MB.CreateBox("ih-mawDeck", { width: 4.2, height: 0.7, depth: 5.4 }, scene), timber, 0, 1.0, 0);
    const wheels = [];
    for (const x of [-2.2, 2.2]) for (const z of [-1.9, 0, 1.9]) { const w = put(MB.CreateCylinder("ih-mawWheel", { height: 0.4, diameter: 1.5, tessellation: 12 }, scene), iron, x, 0.75, z, 0.02); w.rotation.z = Math.PI / 2; wheels.push(w); }
    put(MB.CreateBox("ih-mawTower", { width: 3.4, height: 4.2, depth: 3.6 }, scene), timber, 0, 3.4, -0.4);
    for (const y of [2.0, 3.3, 4.6]) put(MB.CreateBox("ih-mawPlate", { width: 3.5, height: 0.32, depth: 3.7 }, scene), iron, 0, y, -0.4, 0.015);
    const jaw = put(MB.CreateCylinder("ih-mawJaw", { height: 2.6, diameterTop: 0.3, diameterBottom: 1.6, tessellation: 4 }, scene), iron, 0, 1.7, 3.2, 0.03); jaw.rotation.x = Math.PI / 2;
    for (const x of [-0.45, 0, 0.45]) { const tooth = put(MB.CreateCylinder("ih-mawTooth", { height: 0.5, diameterTop: 0, diameterBottom: 0.2, tessellation: 4 }, scene), P("#d8d0c0"), x, 2.15, 3.4, 0.01); tooth.rotation.x = Math.PI; }
    put(MB.CreateSphere("ih-mawEmbers", { diameter: 0.7, segments: 6 }, scene), emberM, 0, 1.8, 2.4, 0);
    for (const x of [-1.2, 1.2]) put(MB.CreateBox("ih-mawBanner", { width: 0.8, height: 1.9, depth: 0.05 }, scene), red, x, 3.6, 1.45, 0.012);
    n.metadata = { wheels };
    return n;
  };
  const maw = buildMaw(K.root, "ih-maw"); maw.setEnabled(false);
  const wreck = K.when("$CINDERMAW_DOWN"); // the wreck, where it landed on the Ashfall camp
  { const w = buildMaw(wreck, "ih-mawWreck"); w.position.set(EN.crash.x, -0.9, EN.crash.z); w.rotation.set(0.35, 0.6, 0.45);
    for (const [dx, dz] of [[-1.6, 0.8], [1.2, -1], [0.3, 1.9]]) { const f = add(MB.CreateCylinder("ih-wreckFire", { height: 1.6, diameterTop: 0, diameterBottom: 1.1, tessellation: 7 }, scene)); f.parent = wreck; f.position.set(EN.crash.x + dx, 0.8, EN.crash.z + dz); f.material = glow(scene, "ih-wreckFireGlow", "#ff8a3a"); fires.push(f); } }
  const holeTear = makeTear(scene, "ih-blackTear", { r: 3.6, kind: "black", seed: 24, ground: true }); holeTear.parent = K.root; holeTear.setEnabled(false);
  const skyTear = makeTear(scene, "ih-skyTear", { r: 3.8, kind: "black", seed: 42, ground: true }); skyTear.parent = K.root; skyTear.setEnabled(false);
  const dust = add(MB.CreateDisc("ih-mawDust", { radius: 1, tessellation: 18 }, scene)); dust.rotation.x = Math.PI / 2; dust.material = glow(scene, "ih-mawDustM", "#c8b49a", 0.5); dust.setEnabled(false);
  const anim = { mode: "idle", t: 0 };
  const tearScale = (node, open, close, t) => { const k = Math.max(0, Math.min(1, t / open, (close - t) / 0.35)); node.scaling.setAll(Math.max(0.01, k)); node.setEnabled(k > 0.01); };
  const engineCue = (name) => {
    if (name === "enginePark" || name === "engineRoll") { // parked far up the field, or rolling from there toward the wall
      anim.mode = name === "engineRoll" ? "roll" : "idle"; anim.t = 0;
      maw.setEnabled(true); maw.position.set(0, 0, EN.from); maw.rotation.set(0, Math.PI, 0); wreck.setEnabled(false);
      for (const n of [holeTear, skyTear, dust]) n.setEnabled(false); // a replay starts clean
    }
    if (name === "tear") { anim.mode = "drop"; anim.t = 0; holeTear.position.set(maw.position.x, 0.06, maw.position.z); }
    if (name === "sky") { anim.mode = "fall"; anim.t = 0; skyTear.position.set(EN.crash.x, 26, EN.crash.z); maw.position.set(EN.crash.x, 26, EN.crash.z); maw.rotation.set(0.1, 0.6, 0.2); maw.setEnabled(true); }
    if (name === "engineReset") { anim.mode = "idle"; for (const n of [maw, holeTear, skyTear, dust]) n.setEnabled(false); }
  };
  const engineStep = (dt) => {
    if (anim.mode === "idle" || anim.mode === "down") { if (anim.mode === "down" && dust.isEnabled()) { anim.t += dt; const k = Math.min(1, anim.t / 1.4); dust.scaling.setAll(2 + k * 14); dust.material.alpha = 0.5 * (1 - k); if (k >= 1) dust.setEnabled(false); } return; }
    anim.t += dt; const t = anim.t;
    if (anim.mode === "roll") { // up the field at a walk, wheels turning, the whole thing rocking
      const k = Math.min(1, t / 8.2); maw.position.z = EN.from + (EN.to - EN.from) * k; maw.position.y = Math.abs(Math.sin(t * 5)) * 0.06;
      for (const w of maw.metadata.wheels) w.rotation.x -= dt * 1.6 * (k < 1 ? 1 : 0);
    } else if (anim.mode === "drop") { // the ground opens under it, it goes through, the tear seals
      tearScale(holeTear, 0.3, 1.5, t);
      if (t > 0.25) maw.position.y = -0.5 * 40 * (t - 0.25) * (t - 0.25);
      if (maw.position.y < -9) maw.setEnabled(false);
      if (t > 1.6) { anim.mode = "idle"; holeTear.setEnabled(false); }
    } else if (anim.mode === "fall") { // out of a tear in the sky over the Ashfall camp, and down
      tearScale(skyTear, 0.3, 1.9, t);
      if (t > 0.3) { maw.position.y = Math.max(0, 26 - 0.5 * 32 * (t - 0.3) * (t - 0.3)); maw.rotation.x = 0.1 + (t - 0.3) * 0.3; }
      if (maw.position.y <= 0) { // impact: the wreck takes its place
        maw.setEnabled(false); wreck.setEnabled(true); skyTear.setEnabled(false);
        dust.position.set(EN.crash.x, 0.3, EN.crash.z); dust.scaling.setAll(2); dust.material.alpha = 0.5; dust.setEnabled(true);
        anim.mode = "down"; anim.t = 0;
      }
    }
  };
  const smoke = new BB.ParticleSystem("ih-smoke", mobile ? 40 : 90, scene);
  smoke.particleTexture = softTexture(scene); smoke.emitter = new BB.Vector3(0, 2, 58);
  smoke.minEmitBox = new BB.Vector3(-40, 0, -4); smoke.maxEmitBox = new BB.Vector3(40, 2, 6);
  smoke.color1 = new BB.Color4(0.35, 0.3, 0.28, 0.35); smoke.color2 = new BB.Color4(0.25, 0.22, 0.22, 0.25); smoke.colorDead = new BB.Color4(0.2, 0.2, 0.2, 0);
  smoke.minSize = 6; smoke.maxSize = 12; smoke.minLifeTime = 8; smoke.maxLifeTime = 14; smoke.emitRate = mobile ? 4 : 8;
  smoke.blendMode = BB.ParticleSystem.BLENDMODE_STANDARD; smoke.gravity = new BB.Vector3(0.3, 0.6, 0); smoke.minEmitPower = 0.2; smoke.maxEmitPower = 0.6;
  K.systems.push(smoke);
  K.bake([...fires]);
  const env = { clear: "#b08a6a", fog: "#a8846a", fogDensity: 0.012, hemi: [0.66, "#ffe0c0", "#4a3a30"], sun: [0.8, "#ffc890", [0.5, -0.7, 0.5]], warm: 0 };
  const toonEnv = { lightDir: [-0.5, 0.8, -0.5], fogColor: "#a8846a", fogDensity: 0.009, sky: [1.08, 0.98, 0.92], ground: [0.88, 0.78, 0.7], rim: [1.0, 0.82, 0.62] };
  return {
    env, toon: toonEnv, outdoor: true, windows: K.windows, lamps: K.lamps, conditions: K.conditions, show: K.show,
    cue: engineCue,
    update(dt, t) { for (let i = 0; i < fires.length; i++) fires[i].scaling.set(1, 0.85 + Math.sin(t * 9 + i * 1.3) * 0.15, 1); engineStep(dt); },
  };
}

/**
 * The Crown's notice board on Aurelin's gate road: a few old notices, and (once the Crown has named him, Ep 26)
 * the bounty poster for the masked knight. The poster's words come from data/masked.js.
 */
function noticeBoard(scene, K, P, at) {
  const BB = B(), MB = BB.MeshBuilder, add = K.add;
  const node = new BB.TransformNode("au-notice", scene); node.parent = K.root; node.position.set(at.x, 0, at.z); node.rotation.y = at.yaw ?? 0;
  const wood = P("#5a3e28");
  for (const x of [-0.85, 0.85]) { const post = add(MB.CreateBox("au-noticePost", { width: 0.12, height: 2.6, depth: 0.12 }, scene), 0.015); post.parent = node; post.position.set(x, 1.3, 0); post.material = wood; }
  const panel = add(MB.CreateBox("au-noticePanel", { width: 1.9, height: 1.3, depth: 0.08 }, scene), 0.02); panel.parent = node; panel.position.set(0, 1.75, 0); panel.material = P("#8a6a48");
  const roof = add(MB.CreateBox("au-noticeRoof", { width: 2.2, height: 0.08, depth: 0.45 }, scene), 0.015); roof.parent = node; roof.position.set(0, 2.5, 0.02); roof.rotation.x = -0.2; roof.material = wood;
  const paper = P("#e6dcc4"), paper2 = P("#d8ccb0");
  for (const [x, y, w, h, r, m] of [[-0.62, 1.95, 0.42, 0.52, 0.06, paper], [-0.6, 1.4, 0.38, 0.3, -0.04, paper2], [0.66, 1.62, 0.36, 0.6, -0.05, paper2]]) {
    const n = add(MB.CreateBox("au-notePaper", { width: w, height: h, depth: 0.01 }, scene)); n.parent = node; n.position.set(x, y, -0.07); n.rotation.z = r; n.material = m; // on the board's front (-z)
  }
  // The bounty: drawn once onto a texture (a masked figure, the name, the reward).
  const wanted = K.when("$SABLE_NAMED");
  const tex = new BB.DynamicTexture("au-bountyTex", { width: 256, height: 352 }, scene, true);
  const c = tex.getContext(), W = 256, H = 352, T = MASKED_BOUNTY;
  c.fillStyle = "#ece2c8"; c.fillRect(0, 0, W, H);
  c.strokeStyle = "#7a5a3a"; c.lineWidth = 6; c.strokeRect(8, 8, W - 16, H - 16);
  c.fillStyle = "#8a2420"; c.font = "bold 22px serif"; c.textAlign = "center"; c.fillText(T.head, W / 2, 44);
  c.fillStyle = "#1c1c22"; // the figure: a tall cloak, one heavy shoulder, a smooth mask with slits, the glaive
  c.beginPath(); c.moveTo(78, 250); c.lineTo(96, 132); c.lineTo(160, 132); c.lineTo(178, 250); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(128, 104, 26, 32, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(158, 136, 26, 15, -0.25, 0, Math.PI * 2); c.fill();
  c.lineWidth = 5; c.strokeStyle = "#1c1c22"; c.beginPath(); c.moveTo(60, 260); c.lineTo(202, 74); c.stroke();
  c.fillStyle = "#3a4a6a"; c.beginPath(); c.moveTo(196, 82); c.lineTo(214, 54); c.lineTo(206, 92); c.closePath(); c.fill();
  c.fillStyle = "#ece2c8"; for (const x of [117, 124, 132, 139]) c.fillRect(x, 96, 3, 14);
  c.fillStyle = "#1c1c22"; c.font = "bold 26px serif"; c.fillText(T.name, W / 2, 272);
  c.fillStyle = "#8a2420"; c.font = "bold 18px serif"; c.fillText(T.reward, W / 2, 294);
  c.fillStyle = "#3a3026"; c.font = "12px serif"; T.lines.forEach((l, i) => c.fillText(l, W / 2, 310 + i * 13));
  tex.update();
  const mat = new BB.StandardMaterial("au-bountyMat", scene); mat.emissiveTexture = tex; mat.disableLighting = true; mat.specularColor = BB.Color3.Black();
  const poster = MB.CreatePlane("au-bounty", { width: 0.72, height: 0.99 }, scene); poster.parent = wanted; poster.isPickable = false; poster.material = mat;
  K.noGlow(poster); // paper, not a lamp
  poster.position.set(at.x - Math.sin(at.yaw ?? 0) * 0.09, 1.74, at.z - Math.cos(at.yaw ?? 0) * 0.09); poster.rotation.y = at.yaw ?? 0; // on the board's front, facing out
  return node;
}

/**
 * The vault beneath Ironhold (Ep 26): a round stone rotunda lit by braziers, the Crown's wards inlaid in the floor
 * in gold, the sealed door to the north (cut open by a black seam once he's come, $VAULT_BREACHED; its plinth
 * empty once he's gone, $VAULT_TAKEN) and four corridors on the diagonals. The wall between the camera and the
 * fight is cut away so it never blocks the view.
 */
function buildVault(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add, V = VAULT_LAYOUT;
  const P = palette(scene, "vt");
  const floor = add(MB.CreateDisc("vt-floor", { radius: V.radius + 3, tessellation: 48 }, scene)); floor.rotation.x = Math.PI / 2; floor.position.y = 0.004; floor.material = toon(scene, "vt-stone", "#4a4852");
  const inner = add(MB.CreateDisc("vt-inner", { radius: 16.5, tessellation: 48 }, scene)); inner.rotation.x = Math.PI / 2; inner.position.y = 0.008; inner.material = toon(scene, "vt-stoneIn", "#56545e");
  for (const r of [8, 16.5]) { const ring = add(MB.CreateTorus("vt-ring", { diameter: r * 2, thickness: 0.12, tessellation: 64 }, scene)); ring.position.y = 0.012; ring.material = P("#36343c"); }
  // The wards: a gold circle and eight spokes, bright while they hold.
  const wards = K.when("not $VAULT_BREACHED"), spent = K.when("$VAULT_BREACHED");
  const wardLit = glow(scene, "vt-ward", "#e6b54e", 0.85), wardDim = P("#6a5a3a");
  for (const [parent, mat] of [[wards, wardLit], [spent, wardDim]]) {
    const ring = MB.CreateTorus("vt-wardRing", { diameter: 7.4, thickness: 0.07, tessellation: 48 }, scene); ring.parent = parent; ring.position.y = 0.02; ring.material = mat; ring.isPickable = false;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const sp = MB.CreateBox("vt-wardSpoke", { width: 0.06, height: 0.02, depth: 4.6 }, scene); sp.parent = parent; sp.position.set(Math.sin(a) * 6, 0.02, Math.cos(a) * 6); sp.rotation.y = a; sp.material = mat; sp.isPickable = false; }
  }
  // The wall: segments round the room, gaps for the four corridors and the door alcove. Not baked: cut away per frame.
  const wallM = toon(scene, "vt-wall", "#5e5a66"), capM = toon(scene, "vt-cap", "#3e3c46"), segs = [];
  const gapAt = (a) => V.mouths.some((m) => Math.abs(Math.atan2(Math.sin(a - m), Math.cos(a - m))) < V.mouthHalf) || Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.14;
  for (let i = 0; i < V.segments; i++) {
    const a = (i / V.segments) * Math.PI * 2; // a segment centred on each corridor (and the door) is left out
    if (gapAt(a)) continue;
    const w = (2 * Math.PI * V.radius) / V.segments + 0.15;
    const seg = new BB.TransformNode(`vt-seg${i}`, scene); seg.parent = K.root; seg.position.set(Math.sin(a) * V.radius, 0, Math.cos(a) * V.radius); seg.rotation.y = a;
    const wall = add(MB.CreateBox("vt-wallSeg", { width: w, height: V.wallHeight, depth: 1.2 }, scene), 0.04); wall.parent = seg; wall.position.y = V.wallHeight / 2; wall.material = wallM;
    const cap = add(MB.CreateBox("vt-wallCap", { width: w, height: 0.5, depth: 1.5 }, scene), 0.02); cap.parent = seg; cap.position.y = V.wallHeight; cap.material = capM;
    segs.push({ node: seg, a });
  }
  // The corridors: dark passages leaving on the diagonals, their mouths framed in heavier stone.
  const dark = P("#1a1820");
  for (const a of V.mouths) {
    const n = new BB.TransformNode("vt-corridor", scene); n.parent = K.root; n.position.set(Math.sin(a) * (V.radius + 4), 0, Math.cos(a) * (V.radius + 4)); n.rotation.y = a;
    const fl = add(MB.CreateBox("vt-corrFloor", { width: 4.2, height: 0.05, depth: 9 }, scene)); fl.parent = n; fl.material = dark;
    for (const sx of [-2.4, 2.4]) { const w = add(MB.CreateBox("vt-corrWall", { width: 0.8, height: 5, depth: 9 }, scene), 0.03); w.parent = n; w.position.set(sx, 2.5, 0); w.material = wallM; }
    const lintel = add(MB.CreateBox("vt-lintel", { width: 5.8, height: 0.9, depth: 1.6 }, scene), 0.03); lintel.parent = n; lintel.position.set(0, 4.9, -4); lintel.material = capM;
    const back = add(MB.CreateBox("vt-corrBack", { width: 4.2, height: 5, depth: 0.2 }, scene)); back.parent = n; back.position.set(0, 2.5, 4.4); back.material = dark;
  }
  // Pillars and braziers round the edge of the floor.
  const pil = toon(scene, "vt-pillar", "#6a6672");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    if (gapAt(a) || Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.3) continue;
    const c = add(MB.CreateCylinder("vt-pillar", { height: V.wallHeight, diameter: 1.1, tessellation: 10 }, scene), 0.04); c.position.set(Math.sin(a) * V.pillars, V.wallHeight / 2, Math.cos(a) * V.pillars); c.material = pil;
    const base = add(MB.CreateBox("vt-pillarBase", { width: 1.5, height: 0.4, depth: 1.5 }, scene), 0.02); base.position.set(c.position.x, 0.2, c.position.z); base.rotation.y = a; base.material = capM;
  }
  const fires = [], fireM = glow(scene, "vt-fire", "#ff9a3a");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8 + Math.PI / 4;
    if (gapAt(a)) continue;
    const x = Math.sin(a) * V.braziers, z = Math.cos(a) * V.braziers;
    const bowl = add(MB.CreateCylinder("vt-brazier", { height: 0.5, diameterTop: 0.9, diameterBottom: 0.4, tessellation: 10 }, scene), 0.02); bowl.position.set(x, 1.05, z); bowl.material = P("#2e2c34");
    const leg = add(MB.CreateCylinder("vt-brazierLeg", { height: 0.85, diameter: 0.12, tessellation: 5 }, scene), 0.01); leg.position.set(x, 0.42, z); leg.material = bowl.material;
    const f = add(MB.CreateCylinder("vt-fire", { height: 0.8, diameterTop: 0, diameterBottom: 0.6, tessellation: 7 }, scene)); f.position.set(x, 1.6, z); f.material = fireM; fires.push(f);
  }
  // The Crown's door: a great slab with the Paragon's sun. Sealed, then cut open by a black seam.
  const D = V.door, doorStone = toon(scene, "vt-door", "#7a7480"), gold = glow(scene, "vt-sun", "#e6b54e", 0.9);
  for (const sx of [-1, 1]) { const jamb = add(MB.CreateBox("vt-doorJamb", { width: 0.9, height: D.h + 1, depth: 1.6 }, scene), 0.04); jamb.position.set(D.x + sx * (D.w / 2 + 0.45), (D.h + 1) / 2, D.z + 0.9); jamb.material = capM; }
  const lintel = add(MB.CreateBox("vt-doorLintel", { width: D.w + 1.8, height: 1, depth: 1.6 }, scene), 0.04); lintel.position.set(D.x, D.h + 0.5, D.z + 0.9); lintel.material = capM;
  // The alcove behind the door: three walls and a floor, the plinth in the middle of it.
  const alc = dark;
  const back = add(MB.CreateBox("vt-alcoveBack", { width: D.w + 1.8, height: D.h + 1, depth: 0.4 }, scene)); back.position.set(D.x, (D.h + 1) / 2, V.plinth.z + 2.2); back.material = alc;
  for (const sx of [-1, 1]) { const side = add(MB.CreateBox("vt-alcoveSide", { width: 0.4, height: D.h + 1, depth: 4 }, scene)); side.position.set(D.x + sx * (D.w / 2 + 0.7), (D.h + 1) / 2, V.plinth.z); side.material = alc; }
  const sealed = K.when("not $VAULT_BREACHED"), cut = K.when("$VAULT_BREACHED");
  const slab = MB.CreateBox("vt-doorSlab", { width: D.w, height: D.h, depth: 0.5 }, scene); slab.parent = sealed; slab.position.set(D.x, D.h / 2, D.z + 0.4); slab.material = doorStone; inkOutline(slab, 0.04); slab.isPickable = false;
  const sun = MB.CreateDisc("vt-doorSun", { radius: 0.8, tessellation: 24 }, scene); sun.parent = sealed; sun.position.set(D.x, D.h * 0.62, D.z + 0.13); sun.rotation.y = Math.PI; sun.material = gold; sun.isPickable = false;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const ray = MB.CreateBox("vt-doorRay", { width: 0.08, height: 0.55, depth: 0.02 }, scene); ray.parent = sealed; ray.position.set(D.x + Math.sin(a) * 1.2, D.h * 0.62 + Math.cos(a) * 1.2, D.z + 0.13); ray.rotation.z = -a; ray.material = gold; ray.isPickable = false; }
  // Breached: the slab split in two halves pushed apart, a black seam hanging where they met, the plinth behind.
  for (const sx of [-1, 1]) { const half = MB.CreateBox("vt-doorHalf", { width: D.w / 2 - 0.25, height: D.h, depth: 0.5 }, scene); half.parent = cut; half.position.set(D.x + sx * (D.w / 4 + 0.55), D.h / 2, D.z + 0.4); half.rotation.y = sx * 0.12; half.material = doorStone; inkOutline(half, 0.04); half.isPickable = false; }
  const seam = makeTear(scene, "vt-doorSeam", { r: 2.2, kind: "black", seed: 26, ground: false, stretch: [0.45, 1.25] }); seam.parent = cut; seam.position.set(D.x, D.h * 0.48, D.z + 0.05); seam.rotation.y = Math.PI;
  const plinth = add(MB.CreateCylinder("vt-plinth", { height: 1.1, diameter: 1.1, tessellation: 8 }, scene), 0.03); plinth.position.set(V.plinth.x, 0.55, V.plinth.z); plinth.material = capM;
  const relic = K.when("$VAULT_BREACHED and not $VAULT_TAKEN");
  const box = MB.CreateBox("vt-reliquary", { width: 0.5, height: 0.36, depth: 0.36 }, scene); box.parent = relic; box.position.set(V.plinth.x, 1.3, V.plinth.z); box.material = toon(scene, "vt-reliquaryMat", "#8a6a3a"); inkOutline(box, 0.02); box.isPickable = false;
  const seal = MB.CreateBox("vt-reliquarySeal", { width: 0.16, height: 0.16, depth: 0.04 }, scene); seal.parent = relic; seal.position.set(V.plinth.x, 1.3, V.plinth.z - 0.2); seal.material = gold; seal.isPickable = false;
  const warm = new BB.PointLight("vt-warm", new BB.Vector3(0, 6, 0), scene); warm.diffuse = color3("#ffb070").clone(); warm.intensity = 0.55; warm.range = 34; K.lights.push(warm);
  // Cutscene cues: the door cut open, the reliquary sent through a small seam, his way out opening and closing.
  const seams = [];
  const openSeam = (x, y, z, r, life) => { const t = makeTear(scene, "vt-seam", { r, kind: "black", seed: seams.length + 61, ground: false }); t.parent = K.root; t.position.set(x, y, z); t.scaling.setAll(0.01); seams.push({ t, age: 0, life }); return t; };
  const cue = (name) => {
    if (name === "doorCut") { sealed.setEnabled(false); cut.setEnabled(true); wards.setEnabled(false); spent.setEnabled(true); relic.setEnabled(true); openSeam(D.x, D.h * 0.48, D.z - 0.3, 2.2, 0.8); }
    if (name === "take") { relic.setEnabled(false); openSeam(V.plinth.x, 1.35, V.plinth.z - 0.4, 0.5, 0.9); }
    if (name === "seamOpen") openSeam(V.exit.x, 1.25, V.exit.z, 1.15, 99);
    if (name === "seamShut") for (const sm of seams) sm.life = Math.min(sm.life, sm.age + 0.3);
  };
  K.bake([]);
  const env = { clear: "#0e0d12", fog: "#0e0d12", fogDensity: 0.012, hemi: [0.5, "#c8c4e0", "#2a2630"], sun: [0.38, "#ffd0a0", [0.2, -1, 0.35]], warm: 0 };
  const toonEnv = { lightDir: [-0.2, 1, -0.4], fogColor: "#0e0d12", fogDensity: 0.006, sky: [0.92, 0.9, 1], ground: [0.66, 0.62, 0.7], rim: [0.75, 0.82, 1] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true, cue,
    update(dt, t) {
      for (const sm of seams) { sm.age += dt; const k = Math.max(0.01, Math.min(1, sm.age / 0.3, (sm.life - sm.age) / 0.3)); sm.t.scaling.setAll(k); if (sm.age >= sm.life) sm.t.dispose(false, false); }
      for (let i = seams.length - 1; i >= 0; i--) if (seams[i].age >= seams[i].life) seams.splice(i, 1);
      // Cut away any stretch of wall standing between the camera and the room.
      const cam = scene.activeCamera?.position;
      if (cam) {
        const cd = Math.hypot(cam.x, cam.z), ca = Math.atan2(cam.x, cam.z);
        for (const sg of segs) { const near = cd > V.radius - 3 && Math.abs(Math.atan2(Math.sin(sg.a - ca), Math.cos(sg.a - ca))) < 0.85; if (sg.node.isEnabled() === near) sg.node.setEnabled(!near); }
      }
      for (let i = 0; i < fires.length; i++) fires[i].scaling.y = 0.88 + Math.sin(t * 8 + i * 1.7) * 0.12;
      warm.intensity = 0.52 + Math.sin(t * 5) * 0.04;
    } };
  return self;
}

/** A page of under-text: strokes of a script nobody can read (drawn, never typed: it has no letters). */
function underTextTexture(scene, name, seed) {
  const BB = B(), tex = new BB.DynamicTexture(name, { width: 256, height: 128 }, scene, true), c = tex.getContext();
  let st = seed * 9301 + 49297; const r = () => ((st = (st * 9301 + 49297) % 233280) / 233280);
  c.clearRect(0, 0, 256, 128); c.strokeStyle = "#8ab4ff"; c.lineCap = "round";
  for (let line = 0; line < 3; line++) {
    let x = 12; const y = 30 + line * 36;
    while (x < 240) {
      c.lineWidth = 3 + r() * 2; c.beginPath(); c.moveTo(x, y + (r() - 0.5) * 10);
      for (let k = 0; k < 3; k++) c.quadraticCurveTo(x + r() * 10, y - 14 + r() * 28, x + 4 + r() * 12, y + (r() - 0.5) * 18);
      c.stroke(); x += 14 + r() * 16;
    }
  }
  tex.hasAlpha = true; tex.update();
  return tex;
}

/**
 * Mirrorlake Saelith (Ep 28): a still black lake under a sky full of stars, and a flat island of pale stone in
 * the middle of it where the fight happens. The water doubles the sky. Under it (the cutscene's cue "under"),
 * the under-text: pale lines of script rising out of the dark. Cues: under, annotate, surface.
 */
function buildMirrorlake(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const rng = mulberry(28), P = palette(scene, "ml");
  // The lake: a dark mirror out to the mountains, seen from above and from below.
  const lakeMat = toon(scene, "ml-water", "#0e1630"); lakeMat.backFaceCulling = false;
  const lake = add(MB.CreateDisc("ml-lake", { radius: 90, tessellation: 64 }, scene)); lake.rotation.x = Math.PI / 2; lake.position.y = -0.25; lake.material = lakeMat;
  const isle = add(MB.CreateCylinder("ml-isle", { diameter: 37, height: 1.2, tessellation: 40 }, scene), 0.05); isle.position.y = -0.6; isle.material = toon(scene, "ml-stone", "#9a98a8");
  for (const r of [7, 12.5]) { const ring = add(MB.CreateTorus("ml-ring", { diameter: r * 2, thickness: 0.1, tessellation: 56 }, scene)); ring.position.y = 0.012; ring.material = P("#7a7890"); }
  // Standing stones round the island's rim, and a shrine arch on the north side (where his mother's name is cut).
  const stoneM = toon(scene, "ml-standing", "#7e7c8c");
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const ang = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
    if (ang < 0.35 || ang > Math.PI - 0.75) continue; // the arch's side, and the shore side the cameras look in from
    const h = 2.6 + rng() * 1.6, st = add(MB.CreateBox("ml-stone", { width: 0.9, height: h, depth: 0.6 }, scene), 0.04);
    st.position.set(Math.sin(a) * 17.8, h / 2 - 0.1, Math.cos(a) * 17.8); st.rotation.set((rng() - 0.5) * 0.12, a, (rng() - 0.5) * 0.12); st.material = stoneM;
  }
  for (const sx of [-1.6, 1.6]) { const post = add(MB.CreateBox("ml-archPost", { width: 0.6, height: 4.2, depth: 0.6 }, scene), 0.04); post.position.set(sx, 2.0, 17.6); post.material = stoneM; }
  const lintel = add(MB.CreateBox("ml-archTop", { width: 4.4, height: 0.6, depth: 0.8 }, scene), 0.04); lintel.position.set(0, 4.3, 17.6); lintel.material = stoneM;
  // Far shore: dark hills and a few pines.
  const hill = toon(scene, "ml-hill", "#141a2c"), pine = toon(scene, "ml-pine", "#0e1a1e");
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + rng(); const r = 70 + rng() * 12, h = 10 + rng() * 14;
    const m = add(MB.CreateCylinder("ml-hill", { height: h, diameterTop: 0, diameterBottom: 30 + rng() * 20, tessellation: 6 }, scene)); m.position.set(Math.sin(a) * r, h / 2 - 1, Math.cos(a) * r); m.material = hill; }
  for (let i = 0; i < (mobile ? 18 : 36); i++) { const a = rng() * Math.PI * 2, r = 48 + rng() * 14, h = 4 + rng() * 4;
    const t = add(MB.CreateCylinder("ml-pine", { height: h, diameterTop: 0, diameterBottom: 1.8, tessellation: 5 }, scene)); t.position.set(Math.sin(a) * r, h / 2 - 0.3, Math.cos(a) * r); t.material = pine; }
  // Stars: in the sky, and doubled in the water below the island's edge.
  const starM = glow(scene, "ml-star", "#e8ecff"), starDim = glow(scene, "ml-starDim", "#7a88c8");
  const starSrc = MB.CreatePolyhedron("ml-starSrc", { type: 1, size: 0.35 }, scene); starSrc.material = starM; starSrc.isPickable = false; starSrc.setEnabled(false); starSrc.parent = K.root;
  const dimSrc = MB.CreatePolyhedron("ml-dimSrc", { type: 1, size: 0.25 }, scene); dimSrc.material = starDim; dimSrc.isPickable = false; dimSrc.setEnabled(false); dimSrc.parent = K.root;
  for (let i = 0; i < (mobile ? 90 : 180); i++) {
    const a = rng() * Math.PI * 2, el = 0.15 + rng() * 1.2, d = 120;
    const st = starSrc.createInstance("ml-star"); st.parent = K.root; st.position.set(Math.sin(a) * Math.cos(el) * d, Math.sin(el) * d * 0.6 + 6, Math.cos(a) * Math.cos(el) * d); st.isPickable = false;
    const rf = dimSrc.createInstance("ml-starR"); rf.parent = K.root; const rr = 22 + rng() * 60; rf.position.set(Math.sin(a) * rr, -0.22, Math.cos(a) * rr); rf.scaling.y = 0.2; rf.isPickable = false;
  }
  const moon = add(MB.CreateDisc("ml-moon", { radius: 6, tessellation: 32 }, scene)); moon.position.set(-30, 46, 95); moon.material = glow(scene, "ml-moonM", "#e8ecff");
  // Under the water: a dark volume and the under-text, out past the island's south edge.
  const UN = { x: 0, y: -4.2, z: -26 };
  const under = new BB.TransformNode("ml-under", scene); under.parent = K.root; under.setEnabled(false); // shown only by the cutscene's cues
  const deepM = glow(scene, "ml-deep", "#0a1640", 0.92); deepM.backFaceCulling = false;
  const deep = MB.CreateSphere("ml-deep", { diameter: 22, segments: 12 }, scene); deep.parent = under; deep.position.set(UN.x, UN.y, UN.z); deep.material = deepM; deep.isPickable = false;
  K.noGlow(deep);
  const glyphs = [];
  for (let i = 0; i < 14; i++) {
    const mat = new BB.StandardMaterial(`ml-glyphM${i}`, scene); mat.emissiveTexture = underTextTexture(scene, `ml-glyph${i}`, i + 3); mat.opacityTexture = mat.emissiveTexture;
    mat.disableLighting = true; mat.backFaceCulling = false; mat.alpha = 0;
    const g = MB.CreatePlane(`ml-glyph${i}`, { width: 2.6, height: 1.3 }, scene); g.parent = under; g.material = mat; g.isPickable = false;
    const a = (i / 14) * Math.PI * 2, r = 1.6 + (i % 3) * 0.9;
    g.position.set(UN.x + Math.sin(a) * r, UN.y - 3 + (i % 5) * 0.9, UN.z + Math.cos(a) * r); g.rotation.y = a + Math.PI;
    glyphs.push({ g, mat, a, r, y0: g.position.y, lit: 0 });
  }
  const light = { on: 0, target: 0, write: 0 };
  const cue = (name) => {
    if (name === "under") { under.setEnabled(true); light.target = 0.85; }
    if (name === "annotate") { light.target = 1; light.write = 1; }
    if (name === "surface") { under.setEnabled(false); light.target = 0; light.on = 0; light.write = 0; }
  };
  K.bake([]);
  const env = { clear: "#070a18", fog: "#0a1028", fogDensity: 0.006, hemi: [0.5, "#b8c4ff", "#141a30"], sun: [0.55, "#d8e0ff", [0.3, -1, 0.6]], warm: 0 };
  const toonEnv = { lightDir: [-0.3, 1, -0.6], fogColor: "#0a1028", fogDensity: 0.004, sky: [0.86, 0.9, 1.08], ground: [0.6, 0.62, 0.74], rim: [0.7, 0.8, 1.1] };
  return { env, toon: toonEnv, show: K.show, conditions: K.conditions, outdoor: true, cue,
    update(dt, t) {
      light.on += (light.target - light.on) * Math.min(1, dt * 1.5);
      for (const gl of glyphs) {
        gl.g.position.y = gl.y0 + ((t * 0.5 + gl.a) % 4); // rising out of the dark
        gl.g.rotation.y = gl.a + Math.PI + t * 0.15;
        gl.mat.alpha = light.on * (0.55 + 0.45 * Math.sin(t * 2 + gl.a * 3)) * (light.write ? 1 : 0.7);
        gl.mat.emissiveColor = light.write ? new BB.Color3(1, 0.95, 0.8) : new BB.Color3(1, 1, 1);
      }
      lake.rotation.y = Math.sin(t * 0.05) * 0.02;
    } };
}

/**
 * The Valcourt crypt (Ep 28's last scene): a low stone vault under the family chapel, the dead of House Valcourt
 * in rows of slabs, and at the end one grave newer than the rest: Aurek's. A flower is left on it ($CRYPT_FLOWER).
 */
function buildCrypt(scene, mobile) {
  const BB = B(), MB = BB.MeshBuilder, K = kit(scene), add = K.add;
  const P = palette(scene, "cr");
  const room = buildRoom(scene, K, { prefix: "cr", half: [5, 8], height: 4.2, wall: "#5a5664", wainscot: "#3e3a46", floorA: "#4a4652", floorB: "#423e4a", door: { x: 0, z: -8 }, windows: [] });
  const slabM = toon(scene, "cr-slab", "#6e6a78"), dark = P("#2e2a36");
  for (const z of [-4.6, -1.8, 1.0]) for (const x of [-3, 3]) {
    const sl = add(MB.CreateBox("cr-tomb", { width: 1.3, height: 0.7, depth: 2.2 }, scene), 0.03); sl.position.set(x, 0.35, z); sl.material = slabM;
    const lid = add(MB.CreateBox("cr-lid", { width: 1.4, height: 0.1, depth: 2.3 }, scene), 0.02); lid.position.set(x, 0.75, z); lid.material = dark;
  }
  // Aurek's grave: a standing stone with his name and the Valcourt star, newer and cleaner than the rest.
  const G = { x: 0, z: 5.6 };
  const stone = add(MB.CreateBox("cr-headstone", { width: 1.6, height: 2.2, depth: 0.4 }, scene), 0.04); stone.position.set(G.x, 1.1, G.z + 1); stone.material = toon(scene, "cr-newStone", "#a8a4b4");
  const tex = new BB.DynamicTexture("cr-nameTex", { width: 256, height: 352 }, scene, true), c = tex.getContext();
  c.fillStyle = "#a8a4b4"; c.fillRect(0, 0, 256, 352); c.fillStyle = "#4a4656"; c.textAlign = "center";
  c.font = "bold 30px serif"; c.fillText("AUREK", 128, 190); c.fillText("VALCOURT", 128, 228);
  c.font = "16px serif"; c.fillText("Lost in the Hollowmarch", 128, 262);
  c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 22 : 52; c.lineTo(128 + Math.cos(a) * r, 110 + Math.sin(a) * r); } c.closePath(); c.fill();
  tex.update();
  const nameM = new BB.StandardMaterial("cr-nameM", scene); nameM.emissiveTexture = tex; tex.level = 0.62; nameM.disableLighting = true; nameM.emissiveColor = BB.Color3.Black(); // carved stone, in candlelight
  const face = MB.CreatePlane("cr-name", { width: 1.3, height: 1.8 }, scene); face.parent = K.root; face.position.set(G.x, 1.15, G.z + 0.72); face.material = nameM; face.isPickable = false; K.noGlow(face);
  const slab = add(MB.CreateBox("cr-graveSlab", { width: 1.4, height: 0.12, depth: 2.2 }, scene), 0.02); slab.position.set(G.x, 0.06, G.z - 0.4); slab.material = slabM;
  // Candles, low and many.
  const candles = [], flameM = glow(scene, "cr-flame", "#ffcf6a"), wax = P("#e8e0cc");
  for (const [x, z] of [[-0.9, 6.2], [0.9, 6.2], [-1.2, 5.4], [1.2, 5.4], [-4.2, -5.6], [4.2, -5.6], [-4.2, 2], [4.2, 2]]) {
    const w = add(MB.CreateCylinder("cr-candle", { height: 0.3, diameter: 0.1, tessellation: 6 }, scene)); w.position.set(x, 0.15, z); w.material = wax;
    const f = add(MB.CreateSphere("cr-flame", { diameter: 0.09, segments: 4 }, scene)); f.position.set(x, 0.36, z); f.scaling.y = 1.8; f.material = flameM; candles.push(f);
  }
  const flower = K.when("$CRYPT_FLOWER");
  const seams = [];
  const cue = (name) => { // the cutscene: the flower laid down; his way out
    if (name === "flower") flower.setEnabled(true);
    if (name === "noFlower") flower.setEnabled(false); // the scene starts before it's laid down
    if (name === "seam") { const t = makeTear(scene, "cr-seam", { r: 1.1, kind: "black", seed: 31, ground: false }); t.parent = K.root; t.position.set(-1.2, 1.2, -5.6); t.scaling.setAll(0.01); seams.push({ t, age: 0 }); }
  };
  { const stem = MB.CreateCylinder("cr-stem", { height: 0.5, diameter: 0.02, tessellation: 4 }, scene); stem.parent = flower; stem.position.set(G.x + 0.1, 0.16, G.z - 0.2); stem.rotation.z = Math.PI / 2.2; stem.material = P("#3a6a3a"); stem.isPickable = false;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const pt = MB.CreateSphere("cr-petal", { diameter: 0.09, segments: 4 }, scene); pt.parent = flower; pt.position.set(G.x - 0.16 + Math.cos(a) * 0.05, 0.16, G.z - 0.2 + Math.sin(a) * 0.05); pt.scaling.y = 0.4; pt.material = P("#f2f0ff"); pt.isPickable = false; } }
  const warm = new BB.PointLight("cr-warm", new BB.Vector3(0, 2.6, 4.6), scene); warm.diffuse = color3("#ffc070").clone(); warm.intensity = 0.5; warm.range = 14; K.lights.push(warm);
  K.bake([...room.keep]);
  const env = { clear: "#0c0b10", fog: "#0c0b10", fogDensity: 0.02, hemi: [0.45, "#d8c8b8", "#1a1620"], sun: [0.3, "#ffd8a8", [0.2, -1, 0.4]], warm: 0 };
  const toonEnv = { lightDir: [-0.2, 1, -0.4], fogColor: "#0c0b10", fogDensity: 0.01, sky: [0.9, 0.86, 0.84], ground: [0.6, 0.56, 0.6], rim: [1, 0.86, 0.7] };
  const self = { env, toon: toonEnv, show: K.show, conditions: K.conditions, indoor: true, cue,
    update(dt, t) {
      room.cutaway(scene.activeCamera, self.mood?.player);
      for (const sm of seams) { sm.age += dt; const k = Math.max(0.01, Math.min(1, sm.age / 0.3, (3 - sm.age) / 0.3)); sm.t.scaling.setAll(k); if (sm.age > 3) sm.t.dispose(false, false); }
      for (let i = seams.length - 1; i >= 0; i--) if (seams[i].age > 3) seams.splice(i, 1);
      for (let i = 0; i < candles.length; i++) candles[i].scaling.y = 1.8 * (0.85 + Math.sin(t * 9 + i * 2.1) * 0.15);
      warm.intensity = 0.48 + Math.sin(t * 6) * 0.04;
    } };
  return self;
}

export { kit, buildRoom, mulberry }; // for the memory's sets (src/reveal/sets.js)
