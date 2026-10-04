// Procedural characters built from primitives, posed from ability frame data.
// No skeletal art yet: silhouettes are designed to read at a glance (Phase 3 swaps in real models).

import { B, PALETTE, toon, glow, inkOutline, refreshWorld, lerp, clamp01, easeOut, easeInOut } from "./look.js";
import { ROOK_POSES } from "../data/rook.js";
import { ACOLYTE_POSES } from "../data/acolyte.js";

const SWORD_TIP = 1.95, SWORD_HILT = 0.72;

function part(mesh, parent, x, y, z, outline = 0.03) {
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  if (outline) inkOutline(mesh, outline);
  mesh.isPickable = false;
  return mesh;
}

export class Rig {
  /** @param {*} scene @param {"player"|"acolyte"} kind */
  constructor(scene, kind, id) {
    const BB = B(), MB = BB.MeshBuilder;
    this.kind = kind;
    this.scene = scene;
    this.poses = kind === "player" ? ROOK_POSES : ACOLYTE_POSES;
    this.root = new BB.TransformNode(`${id}-root`, scene);
    this.body = new BB.TransformNode(`${id}-body`, scene);
    this.body.parent = this.root;
    this.body.position.y = 0.9;
    this.meshes = [];
    const add = (m, parent, x, y, z, o) => { this.meshes.push(part(m, parent, x, y, z, o)); return m; };
    const p = kind === "player";
    const M = (n, hex) => toon(scene, `${id}-${n}`, hex);

    const coat = M("coat", p ? PALETTE.rookCoat : PALETTE.acolyteRobe);
    const trim = M("trim", p ? PALETTE.rookTrim : PALETTE.acolyteSash);
    const dark = M("dark", p ? PALETTE.hair : PALETTE.acolyteHood);
    const skin = M("skin", p ? PALETTE.skin : PALETTE.mask);
    const steel = M("steel", PALETTE.steel);

    // Robe skirt (doesn't lean, so the stance stays grounded).
    const skirt = add(MB.CreateCylinder("skirt", { height: 0.85, diameterTop: 0.62, diameterBottom: p ? 0.95 : 1.15, tessellation: 12 }, scene), this.root, 0, 0.48, 0);
    skirt.material = coat;
    this.skirt = skirt;
    const torso = add(MB.CreateCapsule("torso", { height: 0.95, radius: 0.31, tessellation: 12 }, scene), this.body, 0, 0.42, 0);
    torso.material = coat;
    const belt = add(MB.CreateCylinder("belt", { height: 0.12, diameter: 0.66, tessellation: 12 }, scene), this.body, 0, 0.08, 0, 0.02);
    belt.material = trim;

    this.head = new BB.TransformNode(`${id}-head`, scene);
    this.head.parent = this.body;
    this.head.position.y = 0.98;
    if (p) {
      const face = add(MB.CreateSphere("head", { diameter: 0.46, segments: 12 }, scene), this.head, 0, 0, 0);
      face.material = skin;
      const cap = add(MB.CreateSphere("hairCap", { diameter: 0.5, segments: 12, slice: 0.62 }, scene), this.head, 0, 0.03, -0.05, 0.02);
      cap.rotation.x = -1.15; // covers the crown and the back of the head, leaves the face open
      cap.material = dark;
      // Spiky hair: a crown of cones swept back.
      const spikes = [[0, 0.2, -0.05, -0.5, 0], [0.14, 0.16, -0.06, -0.6, -0.5], [-0.14, 0.16, -0.06, -0.6, 0.5],
        [0.08, 0.1, -0.2, -1.3, -0.2], [-0.08, 0.1, -0.2, -1.3, 0.2], [0, 0.17, 0.12, 0.35, 0]];
      for (const [x, y, z, rx, rz] of spikes) {
        const c = add(MB.CreateCylinder("spike", { height: 0.32, diameterTop: 0, diameterBottom: 0.2, tessellation: 6 }, scene), this.head, x, y, z, 0.02);
        c.rotation.set(rx, 0, rz);
        c.material = dark;
      }
      const scarf = add(MB.CreateTorus("scarf", { diameter: 0.5, thickness: 0.13, tessellation: 14 }, scene), this.body, 0, 0.82, 0, 0.02);
      scarf.material = trim;
      const tail = add(MB.CreateBox("scarfTail", { width: 0.16, height: 0.5, depth: 0.05 }, scene), this.body, 0.1, 0.62, -0.3, 0.02);
      tail.rotation.x = 0.35;
      tail.material = trim;
      this.scarfTail = tail;
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
      const sash = add(MB.CreateBox("sash", { width: 0.12, height: 1.1, depth: 0.66 }, scene), this.body, 0, 0.35, 0, 0.02);
      sash.rotation.z = 0.5;
      sash.material = trim;
    }

    // Sword arm: shoulder pivot, arm along +Z, blade beyond the hand.
    this.shoulder = new BB.TransformNode(`${id}-shoulder`, scene);
    this.shoulder.parent = this.body;
    this.shoulder.position.set(0.36, 0.72, 0.02);
    const arm = add(MB.CreateCapsule("arm", { height: 0.66, radius: 0.1, tessellation: 8 }, scene), this.shoulder, 0, 0, 0.3, 0.02);
    arm.rotation.x = Math.PI / 2;
    arm.material = coat;
    const hand = add(MB.CreateSphere("hand", { diameter: 0.17, segments: 6 }, scene), this.shoulder, 0, 0, 0.64, 0.02);
    hand.material = p ? skin : dark;
    const guard = add(MB.CreateBox("guard", { width: 0.3, height: 0.06, depth: 0.06 }, scene), this.shoulder, 0, 0, SWORD_HILT, 0.015);
    guard.material = trim;
    const len = SWORD_TIP - SWORD_HILT;
    const blade = add(MB.CreateBox("blade", { width: 0.05, height: p ? 0.13 : 0.1, depth: len }, scene), this.shoulder, 0, 0, SWORD_HILT + len / 2, 0.015);
    blade.material = steel;
    if (!p) blade.scaling.y = 1.4;
    this.tipNode = new BB.TransformNode(`${id}-tip`, scene); this.tipNode.parent = this.shoulder; this.tipNode.position.z = SWORD_TIP;
    this.hiltNode = new BB.TransformNode(`${id}-hilt`, scene); this.hiltNode.parent = this.shoulder; this.hiltNode.position.z = SWORD_HILT + 0.15;

    const offArm = add(MB.CreateCapsule("offArm", { height: 0.6, radius: 0.1, tessellation: 8 }, scene), this.body, -0.4, 0.5, 0.05, 0.02);
    offArm.rotation.set(0.35, 0, 0.25);
    offArm.material = coat;
    this.offArm = offArm;

    // Rook's grimoire floats at his left shoulder: every knight here has one.
    if (p) {
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

    // Soft blob shadow: cheap, and makes jumps readable.
    const shadow = MB.CreateDisc(`${id}-shadow`, { radius: 0.55, tessellation: 20 }, scene);
    shadow.rotation.x = Math.PI / 2;
    const sm = new BB.StandardMaterial(`${id}-shadowMat`, scene);
    sm.diffuseColor = BB.Color3.Black(); sm.specularColor = BB.Color3.Black(); sm.disableLighting = true; sm.alpha = 0.38;
    shadow.material = sm;
    shadow.isPickable = false;
    this.shadow = shadow;

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
    if (p.spin) {
      const k = a.hasHit ? clamp01((f - s) / Math.max(1, act)) : clamp01(f / a.total);
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
      rot = mix(p.to, rest, back); lean = (p.lean ?? 0) * (1 - back); active = k < 0.25 && a.hasHit;
    }
    return { rot, lean, active: active || (p.spin > 0 && a.hasHit && f >= s && f < s + act), spin };
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
    this.body.position.y = 0.9 + bob - (c.postureBroken ? 0.18 : 0);
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

    this.shadow.position.set(x, 0.03, z);
    const s = Math.max(0.35, 1 - y * 0.12);
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
