// Procedural characters built from primitives, posed from ability frame data.
// No skeletal art yet: silhouettes are designed to read at a glance (Phase 3 swaps in real models).

import { B, PALETTE, toon, glow, inkOutline, refreshWorld, lerp, clamp01, easeOut, easeInOut } from "./look.js";
import { ROOK_POSES } from "../data/rook.js";
import { ACOLYTE_POSES } from "../data/acolyte.js";
import { BAS_POSES, JUNO_POSES } from "../data/companions.js";
import { ENEMIES } from "../data/enemies.js";
import { EventType } from "../core/abilities.js";

/** Attacks animate over their active frames; a move counts as an attack if it hits (directly or via hitboxes). */
const isAttack = (a) => a.hasHit || a.events.some((e) => e.type === EventType.SpawnHitbox);

const SWORD_TIP = 1.95, SWORD_HILT = 0.72;

function part(mesh, parent, x, y, z, outline = 0.03) {
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  if (outline) inkOutline(mesh, outline);
  mesh.isPickable = false;
  return mesh;
}

/**
 * How each kind of fighter is built. Everything visual about a character lives here:
 * proportions, colors, head (face + hair style, or hood + mask), weapon, and extras.
 */
export const LOOKS = {
  player: { poses: ROOK_POSES, scale: 1, skirt: 0.95, coat: PALETTE.rookCoat, trim: PALETTE.rookTrim, hairColor: PALETTE.hair,
    skin: PALETTE.skin, head: "face", hair: "spiky", scarf: true, weapon: "sword", grimoire: true, trail: "#ffd98a" },
  acolyte: { poses: ACOLYTE_POSES, scale: 1, skirt: 1.15, coat: PALETTE.acolyteRobe, trim: PALETTE.acolyteSash, hairColor: PALETTE.acolyteHood,
    skin: PALETTE.mask, head: "hood", sash: true, weapon: "blade", trail: "#ff5a4a" },
  bas: { poses: BAS_POSES, scale: 1.18, skirt: 1.05, coat: "#2b3a5c", trim: PALETTE.rookTrim, hairColor: "#1b1716", skin: "#6b4632",
    head: "face", hair: "crop", scarf: true, weapon: "fist", accent: "#8c909b", shoulders: 1.25, trail: "#e8b46a" },
  hound: { poses: ENEMIES.hound.poses, scale: 1, form: "beast", fur: "#5b4b39", belly: "#8a7458", eyes: "#ffd25a", trail: "#ffb35a" },
  cantor: { poses: ENEMIES.cantor.poses, scale: 1.05, skirt: 1.2, coat: "#d6cde6", trim: "#8a5fc0", hairColor: "#3d3050", skin: PALETTE.mask,
    head: "hood", sash: true, weapon: "staff", halo: true, trail: "#b98cff" },
  bulwark: { poses: ENEMIES.bulwark.poses, scale: 1.12, skirt: 1.2, coat: "#a3a9b5", trim: "#6b4f8a", hairColor: "#2f2a3a", skin: PALETTE.mask,
    head: "hood", sash: true, weapon: "spear", shield: true, shoulders: 1.2, trail: "#c9b8ff" },
  beast: { poses: ENEMIES.beast.poses, scale: 1.5, skirt: 1.5, coat: "#4e5a37", trim: "#6f5a3a", hairColor: "#3a4129", skin: "#4e5a37",
    head: "lump", weapon: "claw", shoulders: 1.55, accent: "#2f3324", eyes: "#d8ff6a", trail: "#a6c96a" },
  juno: { poses: JUNO_POSES, scale: 0.93, skirt: 0.9, coat: "#2b3a5c", trim: "#c8414f", hairColor: "#8a3a22", skin: "#f3d5bf",
    head: "face", hair: "sidetail", scarf: true, weapon: "needle", accent: "#c8414f", trail: "#ff6f86" },
};

export class Rig {
  /** @param {*} scene @param {string} kind a LOOKS key @param {string} id */
  constructor(scene, kind, id) {
    const BB = B(), MB = BB.MeshBuilder;
    const L = LOOKS[kind] ?? LOOKS.acolyte;
    this.kind = kind;
    this.look = L;
    this.scene = scene;
    this.poses = L.poses;
    this.root = new BB.TransformNode(`${id}-root`, scene);
    this.root.scaling.setAll(L.scale);
    this.body = new BB.TransformNode(`${id}-body`, scene);
    this.body.parent = this.root;
    this.bodyY = L.form === "beast" ? 0.62 : 0.9;
    this.body.position.y = this.bodyY;
    this.meshes = [];
    const add = (m, parent, x, y, z, o) => { this.meshes.push(part(m, parent, x, y, z, o)); return m; };
    const M = (n, hex) => toon(scene, `${id}-${n}`, hex);
    if (L.form === "beast") { this._buildBeast(scene, id, L, add, M); this._buildCommon(scene, id); return; }

    const coat = M("coat", L.coat);
    const trim = M("trim", L.trim);
    const dark = M("dark", L.hairColor);
    const skin = M("skin", L.skin);
    const steel = M("steel", PALETTE.steel);
    const accent = L.accent ? M("accent", L.accent) : trim;

    // Robe skirt (doesn't lean, so the stance stays grounded).
    const skirt = add(MB.CreateCylinder("skirt", { height: 0.85, diameterTop: 0.62, diameterBottom: L.skirt, tessellation: 12 }, scene), this.root, 0, 0.48, 0);
    skirt.material = coat;
    this.skirt = skirt;
    const torso = add(MB.CreateCapsule("torso", { height: 0.95, radius: 0.31, tessellation: 12 }, scene), this.body, 0, 0.42, 0);
    torso.material = coat;
    if (L.shoulders) torso.scaling.x = L.shoulders;
    const belt = add(MB.CreateCylinder("belt", { height: 0.12, diameter: 0.66, tessellation: 12 }, scene), this.body, 0, 0.08, 0, 0.02);
    belt.material = trim;
    if (L.shoulders) belt.scaling.x = L.shoulders;

    this.head = new BB.TransformNode(`${id}-head`, scene);
    this.head.parent = this.body;
    this.head.position.y = 0.98;
    if (L.head === "face") {
      const face = add(MB.CreateSphere("head", { diameter: 0.46, segments: 12 }, scene), this.head, 0, 0, 0);
      face.material = skin;
      const eyeMat = toon(scene, `${id}-eye`, "#1a1c26");
      for (const x of [-0.085, 0.085]) {
        const eye = add(MB.CreateSphere("eye", { diameter: 0.09, segments: 6 }, scene), this.head, x, 0.03, 0.218, 0);
        eye.scaling.set(0.8, 1.4, 0.85); // must clear the face's ink-outline shell (+0.03) to show
        eye.material = eyeMat;
      }
      // Hair: a full sphere set back and up. The face sphere pokes out of its front, eyes included.
      const cap = add(MB.CreateSphere("hairCap", { diameter: 0.5, segments: 12 }, scene), this.head, 0, 0.06, -0.07, 0.02);
      cap.material = dark;
      if (L.hair === "spiky") {
        const spikes = [[0, 0.2, -0.05, -0.5, 0], [0.14, 0.16, -0.06, -0.6, -0.5], [-0.14, 0.16, -0.06, -0.6, 0.5],
          [0.08, 0.1, -0.2, -1.3, -0.2], [-0.08, 0.1, -0.2, -1.3, 0.2], [0, 0.17, 0.12, 0.35, 0]];
        for (const [x, y, z, rx, rz] of spikes) {
          const c = add(MB.CreateCylinder("spike", { height: 0.32, diameterTop: 0, diameterBottom: 0.2, tessellation: 6 }, scene), this.head, x, y, z, 0.02);
          c.rotation.set(rx, 0, rz);
          c.material = dark;
        }
      } else if (L.hair === "crop") {
        cap.scaling.set(1.02, 0.86, 1); // close-cropped and flat on top
        cap.position.y = 0.04;
      } else if (L.hair === "sidetail") {
        const tie = add(MB.CreateSphere("hairTie", { diameter: 0.09, segments: 6 }, scene), this.head, 0.2, 0.08, -0.12, 0.015);
        tie.material = accent;
        const tail = add(MB.CreateCapsule("sideTail", { height: 0.55, radius: 0.08, tessellation: 8 }, scene), this.head, 0.26, -0.16, -0.14, 0.02);
        tail.rotation.z = -0.25;
        tail.material = dark;
        this.hairTail = tail;
        const bang = add(MB.CreateBox("bangs", { width: 0.34, height: 0.1, depth: 0.12 }, scene), this.head, 0.02, 0.17, 0.15, 0.015);
        bang.rotation.set(0.5, 0, -0.12);
        bang.material = dark;
      }
    } else if (L.head === "lump") { // a mossy brute: no face, just a hunched lump and two glowing eyes
      const lump = add(MB.CreateSphere("head", { diameter: 0.6, segments: 10 }, scene), this.head, 0, -0.08, 0.06);
      lump.scaling.set(1.15, 0.85, 1); lump.material = dark;
      const eyeMat = glow(scene, `${id}-eyes`, L.eyes);
      for (const x of [-0.12, 0.12]) {
        const eye = add(MB.CreateSphere("eye", { diameter: 0.09, segments: 6 }, scene), this.head, x, -0.02, 0.33, 0);
        eye.material = eyeMat;
      }
      for (const [x, z] of [[-0.18, -0.1], [0.2, -0.05], [0, -0.22]]) { // moss tufts
        const t = add(MB.CreateCylinder("moss", { height: 0.3, diameterTop: 0, diameterBottom: 0.18, tessellation: 5 }, scene), this.head, x, 0.18, z, 0.015);
        t.rotation.x = -0.4; t.material = M("moss", "#6f8a3a");
      }
    } else {
      const hood = add(MB.CreateCylinder("hood", { height: 0.7, diameterTop: 0, diameterBottom: 0.62, tessellation: 10 }, scene), this.head, 0, 0.12, -0.04);
      hood.material = dark;
      const mask = add(MB.CreateCylinder("mask", { height: 0.06, diameter: 0.34, tessellation: 16 }, scene), this.head, 0, -0.02, 0.2, 0.015);
      mask.rotation.x = Math.PI / 2;
      mask.material = skin;
      const eyeMat = glow(scene, `${id}-eyes`, PALETTE.danger);
      for (const x of [-0.07, 0.07]) {
        const eye = add(MB.CreateBox("eye", { width: 0.08, height: 0.018, depth: 0.02 }, scene), this.head, x, 0.02, 0.24, 0);
        eye.material = eyeMat;
      }
      this.maskNode = mask;
    }
    if (L.sash) {
      const sash = add(MB.CreateBox("sash", { width: 0.12, height: 1.1, depth: 0.66 }, scene), this.body, 0, 0.35, 0, 0.02);
      sash.rotation.z = 0.5;
      sash.material = trim;
    }
    if (L.scarf) { // the Lantern Knights' gold scarf
      const scarf = add(MB.CreateTorus("scarf", { diameter: 0.5, thickness: 0.13, tessellation: 14 }, scene), this.body, 0, 0.82, 0, 0.02);
      scarf.material = M("scarf", PALETTE.rookTrim);
      const tail = add(MB.CreateBox("scarfTail", { width: 0.16, height: 0.5, depth: 0.05 }, scene), this.body, 0.1, 0.62, -0.3, 0.02);
      tail.rotation.x = 0.35;
      tail.material = scarf.material;
      this.scarfTail = tail;
    }

    // Weapon arm: shoulder pivot, arm along +Z, weapon beyond the hand.
    this.shoulder = new BB.TransformNode(`${id}-shoulder`, scene);
    this.shoulder.parent = this.body;
    this.shoulder.position.set(0.36 * (L.shoulders ?? 1), 0.72, 0.02);
    const arm = add(MB.CreateCapsule("arm", { height: 0.66, radius: 0.1, tessellation: 8 }, scene), this.shoulder, 0, 0, 0.3, 0.02);
    arm.rotation.x = Math.PI / 2;
    arm.material = coat;
    const hand = add(MB.CreateSphere("hand", { diameter: 0.17, segments: 6 }, scene), this.shoulder, 0, 0, 0.64, 0.02);
    hand.material = L.head === "face" ? skin : dark;
    let tipZ = SWORD_TIP, hiltZ = SWORD_HILT + 0.15;
    if (L.weapon === "claw") {
      const claw = add(MB.CreateBox("claw", { width: 0.42, height: 0.32, depth: 0.42 }, scene), this.shoulder, 0, 0, 0.7, 0.025);
      claw.material = accent;
      for (const x of [-0.13, 0, 0.13]) {
        const talon = add(MB.CreateCylinder("talon", { height: 0.42, diameterTop: 0, diameterBottom: 0.09, tessellation: 5 }, scene), this.shoulder, x, -0.04, 1.05, 0.015);
        talon.rotation.x = Math.PI / 2; talon.material = M("talon", "#e7e1cf");
      }
      tipZ = 1.25; hiltZ = 0.7;
    } else if (L.weapon === "staff" || L.weapon === "spear") {
      const len = L.weapon === "staff" ? 1.7 : 2.1;
      const shaft = add(MB.CreateCylinder("shaft", { height: len, diameter: 0.05, tessellation: 6 }, scene), this.shoulder, 0, 0, 0.64 + len * 0.3, 0.015);
      shaft.rotation.x = Math.PI / 2; shaft.material = M("shaft", "#3b2f2a");
      if (L.weapon === "staff") {
        const orb = add(MB.CreateSphere("orb", { diameter: 0.2, segments: 8 }, scene), this.shoulder, 0, 0, 0.64 + len * 0.8, 0);
        orb.material = glow(scene, `${id}-orb`, "#c9a4ff");
      } else {
        const head = add(MB.CreateCylinder("spearhead", { height: 0.36, diameterTop: 0, diameterBottom: 0.12, tessellation: 4 }, scene), this.shoulder, 0, 0, 0.64 + len * 0.8 + 0.18, 0.015);
        head.rotation.x = Math.PI / 2; head.material = steel;
      }
      tipZ = 0.64 + len * 0.8 + 0.3; hiltZ = 0.64 + len * 0.3;
    } else if (L.weapon === "fist") {
      const gaunt = add(MB.CreateBox("gauntlet", { width: 0.3, height: 0.28, depth: 0.34 }, scene), this.shoulder, 0, 0, 0.66, 0.025);
      gaunt.material = accent;
      tipZ = 0.95; hiltZ = 0.55;
    } else {
      const needle = L.weapon === "needle";
      const guard = add(MB.CreateBox("guard", { width: needle ? 0.16 : 0.3, height: 0.06, depth: 0.06 }, scene), this.shoulder, 0, 0, SWORD_HILT, 0.015);
      guard.material = needle ? accent : trim;
      const len = (needle ? 1.05 : 1) * (SWORD_TIP - SWORD_HILT);
      const blade = add(MB.CreateBox("blade", { width: needle ? 0.03 : 0.05, height: needle ? 0.03 : L.weapon === "blade" ? 0.14 : 0.13, depth: len }, scene),
        this.shoulder, 0, 0, SWORD_HILT + len / 2, 0.015);
      blade.material = steel;
      tipZ = SWORD_HILT + len;
    }
    this.tipNode = new BB.TransformNode(`${id}-tip`, scene); this.tipNode.parent = this.shoulder; this.tipNode.position.z = tipZ;
    this.hiltNode = new BB.TransformNode(`${id}-hilt`, scene); this.hiltNode.parent = this.shoulder; this.hiltNode.position.z = hiltZ;

    const offArm = add(MB.CreateCapsule("offArm", { height: 0.6, radius: 0.1, tessellation: 8 }, scene), this.body, -0.4 * (L.shoulders ?? 1), 0.5, 0.05, 0.02);
    offArm.rotation.set(0.35, 0, 0.25);
    offArm.material = coat;
    this.offArm = offArm;
    if (L.shield) { // a tower shield held on the off arm, always toward the front
      const sh = add(MB.CreateBox("shield", { width: 0.85, height: 1.35, depth: 0.1 }, scene), this.body, -0.18, 0.35, 0.45, 0.03);
      sh.material = accent;
      const boss = add(MB.CreateCylinder("boss", { height: 0.06, diameter: 0.3, tessellation: 10 }, scene), sh, 0, 0.1, 0.07, 0.015);
      boss.rotation.x = Math.PI / 2; boss.material = M("boss", PALETTE.rookTrim);
      this.shieldMesh = sh;
    }
    if (L.halo) { // the Choir's singing halo
      const halo = MB.CreateTorus(`${id}-halo`, { diameter: 0.6, thickness: 0.03, tessellation: 24 }, scene);
      halo.material = glow(scene, `${id}-haloMat`, "#c9a4ff"); halo.parent = this.head; halo.position.y = 0.55; halo.isPickable = false;
      this.halo = halo;
    }
    if (L.weapon === "fist" || L.weapon === "claw") { // a second gauntlet on the off hand
      const g2 = add(MB.CreateBox("gauntlet2", { width: 0.28, height: 0.26, depth: 0.3 }, scene), offArm, 0, -0.34, 0, 0.025);
      g2.material = accent;
    }

    // Rook's grimoire floats at his left shoulder: every knight here has one.
    if (L.grimoire) {
      this.grimoire = new BB.TransformNode(`${id}-grimoire`, scene);
      this.grimoire.parent = this.root;
      this.grimoire.position.set(-0.75, 1.7, -0.1);
      const cover = add(MB.CreateBox("grimoire", { width: 0.34, height: 0.42, depth: 0.1 }, scene), this.grimoire, 0, 0, 0, 0.02);
      cover.material = toon(scene, `${id}-book`, "#4a2f22");
      const pages = add(MB.CreateBox("pages", { width: 0.3, height: 0.38, depth: 0.08 }, scene), this.grimoire, 0.025, 0, 0, 0);
      this.pageMat = glow(scene, `${id}-pages`, "#f6e7c1");
      pages.material = this.pageMat;
      this.grimoireGlow = 0;
    }

    this._buildCommon(scene, id);
  }

  /** A four-legged body (Fen Hound). The "shoulder" is the neck, so poses swing the head; the jaw is the weapon tip. */
  _buildBeast(scene, id, L, add, M) {
    const BB = B(), MB = BB.MeshBuilder;
    const fur = M("fur", L.fur), belly = M("belly", L.belly);
    const torso = add(MB.CreateCapsule("torso", { height: 1.3, radius: 0.26, tessellation: 10 }, scene), this.body, 0, 0, 0);
    torso.rotation.x = Math.PI / 2; torso.material = fur;
    const chest = add(MB.CreateSphere("chest", { diameter: 0.55, segments: 8 }, scene), this.body, 0, 0.02, 0.35, 0.02);
    chest.material = belly;
    this.legs = [[0.17, 0.45], [-0.17, 0.45], [0.17, -0.45], [-0.17, -0.45]].map(([x, z], i) => {
      const hip = new BB.TransformNode(`${id}-hip${i}`, scene); hip.parent = this.root; hip.position.set(x, 0.55, z);
      const leg = add(MB.CreateCapsule("leg", { height: 0.6, radius: 0.07, tessellation: 6 }, scene), hip, 0, -0.27, 0, 0.02);
      leg.material = fur;
      hip.phase = i === 0 || i === 3 ? 0 : Math.PI;
      return hip;
    });
    const tail = add(MB.CreateCylinder("tail", { height: 0.6, diameterTop: 0.02, diameterBottom: 0.12, tessellation: 6 }, scene), this.body, 0, 0.12, -0.75, 0.02);
    tail.rotation.x = -2.1; tail.material = fur;
    this.beastTail = tail;
    // Neck pivot with head and jaw.
    this.shoulder = new BB.TransformNode(`${id}-neck`, scene);
    this.shoulder.parent = this.body; this.shoulder.position.set(0, 0.14, 0.55);
    this.head = this.shoulder;
    const head = add(MB.CreateSphere("head", { diameter: 0.38, segments: 8 }, scene), this.shoulder, 0, 0.08, 0.2);
    head.material = fur;
    const snout = add(MB.CreateBox("snout", { width: 0.18, height: 0.15, depth: 0.3 }, scene), this.shoulder, 0, 0.02, 0.45, 0.02);
    snout.material = belly;
    for (const x of [-0.11, 0.11]) {
      const ear = add(MB.CreateCylinder("ear", { height: 0.2, diameterTop: 0, diameterBottom: 0.1, tessellation: 4 }, scene), this.shoulder, x, 0.28, 0.12, 0.015);
      ear.material = fur;
      const eye = add(MB.CreateSphere("eye", { diameter: 0.06, segments: 5 }, scene), this.shoulder, x * 0.8, 0.13, 0.36, 0);
      eye.material = glow(scene, `${id}-eye`, L.eyes);
    }
    this.tipNode = new BB.TransformNode(`${id}-tip`, scene); this.tipNode.parent = this.shoulder; this.tipNode.position.z = 0.65;
    this.hiltNode = new BB.TransformNode(`${id}-hilt`, scene); this.hiltNode.parent = this.shoulder; this.hiltNode.position.z = 0.3;
  }

  /** Indicators and shadow shared by every form. */
  _buildCommon(scene, id) {
    const BB = B(), MB = BB.MeshBuilder;
    // Soft blob shadow: cheap, and makes jumps readable.
    const shadow = MB.CreateDisc(`${id}-shadow`, { radius: 0.55, tessellation: 20 }, scene);
    shadow.rotation.x = Math.PI / 2;
    const sm = new BB.StandardMaterial(`${id}-shadowMat`, scene);
    sm.diffuseColor = BB.Color3.Black(); sm.specularColor = BB.Color3.Black(); sm.disableLighting = true; sm.alpha = 0.38;
    shadow.material = sm;
    shadow.isPickable = false;
    this.shadow = shadow;

    // MARKED indicator: a small spinning gold ring over the head.
    const mark = MB.CreateTorus(`${id}-mark`, { diameter: 0.55, thickness: 0.05, tessellation: 24 }, scene);
    mark.material = glow(scene, `${id}-markMat`, PALETTE.lantern);
    mark.parent = this.root; mark.position.y = 2.45; mark.rotation.x = Math.PI / 2.4; mark.isPickable = false;
    mark.setEnabled(false);
    this.markRing = mark;
    // WARDED (Cantor hymn): a violet ring of light around the body.
    const ward = MB.CreateTorus(`${id}-ward`, { diameter: 1.5, thickness: 0.05, tessellation: 6 }, scene);
    ward.material = glow(scene, `${id}-wardMat`, "#b98cff"); ward.parent = this.root; ward.position.y = 1.1; ward.isPickable = false;
    ward.setEnabled(false);
    this.wardRing = ward;
    // BOUND: two red thread loops around the body. ANCHORED: a stone ring at the feet. SHIELDED: an amber dome.
    const threadMat = glow(scene, `${id}-threadMat`, "#ff4d6d");
    this.boundRings = [1.0, 1.45].map((y, i) => {
      const r = MB.CreateTorus(`${id}-bound${i}`, { diameter: 0.95, thickness: 0.035, tessellation: 24 }, scene);
      r.material = threadMat; r.parent = this.root; r.position.y = y; r.rotation.z = i ? 0.25 : -0.2; r.isPickable = false; r.setEnabled(false);
      return r;
    });
    const anchor = MB.CreateTorus(`${id}-anchor`, { diameter: 1.3, thickness: 0.12, tessellation: 8 }, scene);
    anchor.material = toon(scene, `${id}-anchorMat`, "#8c909b"); anchor.parent = this.root; anchor.position.y = 0.06; anchor.isPickable = false;
    anchor.setEnabled(false);
    this.anchorRing = anchor;
    const dome = MB.CreateSphere(`${id}-dome`, { diameter: 2.4, segments: 10 }, scene);
    dome.material = glow(scene, `${id}-domeMat`, "#e8b46a", 0.16, true); dome.parent = this.root; dome.position.y = 1; dome.isPickable = false;
    dome.setEnabled(false);
    this.dome = dome;

    this.flash = 0;
    this.time = Math.random() * 10;
    this.visibility = 1;
  }

  /** Pose for the current ability frame (fractional, for smooth motion between logic frames). */
  armPose(fighter, t) {
    const rest = this.poses.rest;
    const a = fighter.current;
    const p = a && this.poses[a.id];
    if (!p) return { rot: rest, lean: 0, active: false, spin: 0 };
    const f = fighter.runner.frame + (fighter.frozen ? 0 : t);
    const s = a.startup, act = a.active;
    // Optional full turns: over the active frames for attacks, over the whole move otherwise.
    let spin = 0;
    const attack = isAttack(a);
    if (p.spin) {
      const k = attack ? clamp01((f - s) / Math.max(1, act)) : clamp01(f / a.total);
      spin = easeOut(k) * p.spin * Math.PI * 2;
    }
    let rot, lean = 0, active = false;
    if (f < s) {
      const k = easeInOut(clamp01(f / Math.max(1, s)));
      rot = mix(rest, p.from, k); lean = (p.lean ?? 0) * -0.3 * k;
    } else if (f < s + act) {
      const k = easeOut(clamp01((f - s) / Math.max(1, act)));
      rot = mix(p.from, p.to, k); lean = (p.lean ?? 0) * k; active = true;
    } else {
      const k = clamp01((f - s - act) / Math.max(1, a.recovery));
      const back = easeInOut(clamp01((k - 0.35) / 0.65)); // hold the follow-through a beat
      rot = mix(p.to, rest, back); lean = (p.lean ?? 0) * (1 - back); active = k < 0.25 && attack;
    }
    return { rot, lean, active: active || (p.spin > 0 && attack && f >= s && f < s + act), spin };
  }

  /** Apply one render frame. */
  update(fighter, t, dt) {
    const BB = B();
    this.time += dt;
    const x = lerp(fighter.prev.x, fighter.pos.x, t);
    const y = lerp(fighter.prev.y, fighter.pos.y, t);
    const z = lerp(fighter.prev.z, fighter.pos.z, t);
    let jitter = 0;
    if (fighter.frozen && fighter.combatant.isStaggered) jitter = (Math.random() - 0.5) * 0.12; // hitstop shake
    this.root.position.set(x + jitter, y, z);
    this.root.rotation.y = lerpAngleSafe(fighter.prevYaw, fighter.yaw, t);

    const { rot, lean, active, spin } = this.armPose(fighter, t);
    this.shoulder.rotation.set(rot[0], rot[1], rot[2]);
    this.body.rotation.y = spin;
    if (this.skirt) this.skirt.rotation.y = spin;
    this.swinging = active;

    const speed = Math.hypot(fighter.vel.x, fighter.vel.z);
    const run = Math.min(speed / 6, 1) * (fighter.runner.isRunning ? 0.3 : 1);
    const bob = Math.sin(this.time * 13) * 0.05 * run;
    let bodyLean = lean + run * 0.18;
    const c = fighter.combatant;
    if (c.isStaggered) bodyLean = c.postureBroken ? -0.15 + Math.sin(this.time * 3) * 0.05 : -0.3;
    if (c.blocking) bodyLean = -0.08;
    if (!fighter.grounded) bodyLean += fighter.vel.y > 0 ? -0.15 : 0.15;
    if (!fighter.alive) {
      this.deathT = (this.deathT ?? 0) + dt;
      bodyLean = -Math.min(1.45, this.deathT * 3.5);
      this.visibility = 1 - clamp01((fighter.deadFrames - 50) / 50);
    }
    this.body.rotation.x = bodyLean;
    this.body.position.y = this.bodyY + bob - (c.postureBroken ? 0.18 : 0);
    if (this.beastTail) this.beastTail.rotation.x = -2.1 + Math.sin(this.time * 10) * 0.25;
    if (this.legs) for (const hip of this.legs) hip.rotation.x = Math.sin(this.time * 16 + hip.phase) * 0.7 * run;
    if (this.halo) { this.halo.rotation.y += dt * 2; }
    if (this.wardRing) { const w = fighter.alive && fighter.tags.has("WARDED"); this.wardRing.setEnabled(w); if (w) this.wardRing.rotation.y -= dt * 2.5; }
    if (this.skirt) this.skirt.rotation.x = bodyLean * 0.25;
    if (this.scarfTail) this.scarfTail.rotation.x = 0.35 + run * 0.7 + Math.sin(this.time * 9) * 0.08 * (0.3 + run);
    if (this.offArm) this.offArm.rotation.x = c.blocking || fighter.current?.id === "Guard" ? -0.9 : 0.35 + Math.sin(this.time * 13) * 0.25 * run;

    if (this.grimoire) {
      this.grimoire.position.y = 1.75 + Math.sin(this.time * 2.2) * 0.06;
      this.grimoireGlow = Math.max(0, this.grimoireGlow - dt * 1.6);
      const g = this.grimoireGlow;
      this.grimoire.rotation.y = 0.5 + g * this.time * 8;
      this.pageMat.emissiveColor.set(0.96 + g * 0.04, 0.9, 0.75 - g * 0.3);
      this.grimoire.scaling.setAll(1 + g * 0.35);
    }

    // Hit flash via overlay.
    this.flash = Math.max(0, this.flash - dt);
    const f = this.flash > 0;
    for (const m of this.meshes) {
      m.renderOverlay = f;
      if (f) { m.overlayColor = this.flashColor ?? BB.Color3.White(); m.overlayAlpha = 0.85; }
      m.visibility = this.visibility;
    }

    const tagsOn = fighter.alive;
    const bound = tagsOn && fighter.tags.has("BOUND");
    for (const [i, r] of this.boundRings.entries()) { r.setEnabled(bound); if (bound) r.rotation.y += dt * (i ? -3 : 3); }
    this.anchorRing.setEnabled(tagsOn && fighter.tags.has("ANCHORED"));
    const shielded = tagsOn && fighter.tags.has("SHIELDED");
    this.dome.setEnabled(shielded);
    if (shielded) this.dome.visibility = 0.7 + Math.sin(this.time * 6) * 0.2;
    if (this.hairTail) this.hairTail.rotation.x = -run * 0.6 + Math.sin(this.time * 9) * 0.1 * (0.3 + run);
    const marked = fighter.tags.has("MARKED") && fighter.alive;
    this.markRing.setEnabled(marked);
    if (marked) { this.markRing.rotation.y += dt * 4; this.markRing.scaling.setAll(1 + Math.sin(this.time * 8) * 0.08); }

    this.shadow.position.set(x, 0.03, z);
    const s = Math.max(0.35, 1 - y * 0.12) * (this.look.scale ?? 1) * (this.look.form === "beast" ? 1.2 : 1);
    this.shadow.scaling.set(s, s, s);
    this.shadow.visibility = this.visibility;
  }

  hitFlash(seconds = 0.07, hex) {
    this.flash = seconds;
    this.flashColor = hex ? B().Color3.FromHexString(hex) : null;
  }

  /** Blade hilt and tip in world space, for trails. */
  bladeWorld() {
    refreshWorld(this.tipNode);
    this.hiltNode.computeWorldMatrix(true);
    return { tip: this.tipNode.getAbsolutePosition(), hilt: this.hiltNode.getAbsolutePosition() }; // live vectors: copy, don't keep
  }

  /** A frozen translucent copy of the current pose (Afterimage ghosts). */
  snapshot(material) {
    refreshWorld(this.root);
    const out = [];
    for (const m of this.meshes) {
      if (!m.isEnabled()) continue;
      refreshWorld(m);
      const g = m.clone(`${m.name}-ghost`, null, true, false);
      g.parent = null;
      const wm = m.getWorldMatrix();
      const sc = new (B().Vector3)(), rq = new (B().Quaternion)(), tr = new (B().Vector3)();
      wm.decompose(sc, rq, tr);
      g.position.copyFrom(tr); g.rotationQuaternion = rq; g.scaling.copyFrom(sc);
      g.material = material;
      g.renderOutline = false;
      g.renderOverlay = false;
      g.visibility = 1;
      out.push(g);
    }
    return out;
  }

  dispose() {
    this.root.dispose(false, false);
    this.shadow.dispose(false, true);
  }
}

const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const lerpAngleSafe = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
