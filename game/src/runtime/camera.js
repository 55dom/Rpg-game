// Third-person camera with lock-on framing, shake (trauma), and punch-in for big hits.

import { B, lerp, lerpAngle } from "./look.js";
import { SHOTS } from "./shots.js";

export class FollowCamera {
  constructor(scene, { mobile = false } = {}) {
    const BB = B();
    this.cam = new BB.FreeCamera("cam", new BB.Vector3(0, 4, -12), scene);
    this.cam.minZ = 0.1;
    this.cam.maxZ = 200;
    this.baseFov = mobile ? 0.95 : 0.85;
    this.cam.fov = this.baseFov;
    this.yaw = 0;
    this.pitch = 0.44;
    this.distance = mobile ? 9.2 : 8.2;
    this.shoulder = 1.1; // over-the-shoulder: Rook sits left of center so targets stay visible
    this.focus = new BB.Vector3(0, 1.3, -4);
    this.tmp = new BB.Vector3();
    this.shot = null;          // active cinematic shot, or null for gameplay
    this.shotPos = new BB.Vector3();
    this.shotLook = new BB.Vector3();
    this.returnBlend = 0;      // 1 → 0 while easing from the last shot back to gameplay
    this.trauma = 0;
    this.punch = 0;
    this.reduceMotion = false;
    this.t = 0;
  }

  /** Play a named shot from SHOTS. Returns the shot (for desaturation etc.) or null. */
  cue(name) {
    const s = SHOTS[name];
    if (!s) return null;
    if (s.clear) { if (this.shot) this.returnBlend = 1; this.shot = null; return s; }
    this.shot = { ...s, t: 0, fresh: true };
    return s;
  }

  get inShot() { return !!this.shot; }

  /**
   * Scripted framing for story scenes: hold the camera at `pos` looking at `look`.
   * cut=true jumps there; otherwise it eases. release() hands back to gameplay with a blend.
   */
  frame(pos, look, { fov = this.baseFov * 0.8, cut = false, ease = 3 } = {}) {
    const first = !this.scripted;
    this.scripted = { pos: { ...pos }, look: { ...look }, fov, ease, cut: cut || first };
  }
  release() { if (this.scripted) { this.scripted = null; this.returnBlend = 1; } }
  get isScripted() { return !!this.scripted; }

  _shotTarget(s, p, yaw) {
    const f = { x: Math.sin(yaw), z: Math.cos(yaw) };
    let ang;
    switch (s.mode) {
      case "behind": ang = yaw + Math.PI; break;
      case "front": ang = yaw - (s.angle ?? 0); break;
      case "orbit": ang = yaw + Math.PI + s.t * (s.orbitSpeed ?? 1); break;
      default: ang = yaw + Math.PI + (s.angle ?? 0);
    }
    this.tmp.set(p.x + Math.sin(ang) * s.dist, p.y + s.height, p.z + Math.cos(ang) * s.dist);
    const ahead = s.mode === "behind" ? 2 : 0;
    const side = s.lookSide ?? 0; // subject's right is (cos yaw, -sin yaw)
    return { pos: this.tmp, lx: p.x + f.x * ahead + Math.cos(yaw) * side, ly: p.y + (s.lookHeight ?? 1.5), lz: p.z + f.z * ahead - Math.sin(yaw) * side };
  }

  shake(amount) { this.trauma = Math.min(1, this.trauma + amount * (this.reduceMotion ? 0.4 : 1)); }
  kick(amount) { this.punch = Math.max(this.punch, amount); }

  /** Forward and right on the ground plane, for camera-relative movement. */
  get basis() {
    const s = Math.sin(this.yaw), c = Math.cos(this.yaw);
    return { fx: s, fz: c, rx: c, rz: -s };
  }

  update(dt, playerPos, lockPos, look, playerYaw = 0) {
    if (this.scripted && !this.shot) {
      const s = this.scripted;
      const k = s.cut ? 1 : 1 - Math.exp(-s.ease * dt);
      s.cut = false;
      for (const a of ["x", "y", "z"]) { this.shotPos[a] = lerp(this.shotPos[a], s.pos[a], k); this.shotLook[a] = lerp(this.shotLook[a], s.look[a], k); }
      const sh = this.trauma * this.trauma * 0.3;
      this.t += dt;
      this.cam.position.set(this.shotPos.x + Math.sin(this.t * 71) * sh, this.shotPos.y + Math.sin(this.t * 83) * sh, this.shotPos.z);
      this.cam.setTarget(this.shotLook);
      this.cam.fov = lerp(this.cam.fov, s.fov, k);
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
      this.yaw = playerYaw;
      this.focus.set(playerPos.x, playerPos.y * 0.6 + 1.3, playerPos.z);
      return;
    }
    if (this.shot) {
      const s = this.shot;
      s.t += dt;
      const { pos, lx, ly, lz } = this._shotTarget(s, playerPos, playerYaw);
      const k = s.fresh && s.cut ? 1 : 1 - Math.exp(-(s.ease ?? 8) * dt);
      s.fresh = false;
      this.shotPos.x = lerp(this.shotPos.x, pos.x, k); this.shotPos.y = lerp(this.shotPos.y, pos.y, k); this.shotPos.z = lerp(this.shotPos.z, pos.z, k);
      this.shotLook.x = lerp(this.shotLook.x, lx, k); this.shotLook.y = lerp(this.shotLook.y, ly, k); this.shotLook.z = lerp(this.shotLook.z, lz, k);
      const sh = this.trauma * this.trauma * 0.3;
      this.cam.position.set(this.shotPos.x + Math.sin(this.t * 71) * sh, this.shotPos.y + Math.sin(this.t * 83) * sh, this.shotPos.z);
      this.cam.setTarget(this.shotLook);
      this.cam.fov = lerp(this.cam.fov, s.fov ?? this.baseFov, k);
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
      this.t += dt;
      // Keep the gameplay camera behind the action so the hand-back is short.
      this.yaw = playerYaw;
      this.focus.set(playerPos.x, playerPos.y * 0.6 + 1.3, playerPos.z);
      return;
    }
    this.t += dt;
    this.yaw += look.x;
    this.pitch = Math.max(0.08, Math.min(0.95, this.pitch + look.y));

    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    let fx = playerPos.x + rx * this.shoulder, fy = playerPos.y * 0.6 + 1.3, fz = playerPos.z + rz * this.shoulder;
    let dist = this.distance;
    if (lockPos) {
      const dx = lockPos.x - playerPos.x, dz = lockPos.z - playerPos.z;
      const sep = Math.hypot(dx, dz);
      this.yaw = lerpAngle(this.yaw, Math.atan2(dx, dz), 1 - Math.exp(-5 * dt));
      fx += dx * 0.35; fz += dz * 0.35;
      dist += Math.min(5, sep * 0.3);
    }
    const k = 1 - Math.exp(-9 * dt);
    this.focus.x = lerp(this.focus.x, fx, k);
    this.focus.y = lerp(this.focus.y, fy, 1 - Math.exp(-5 * dt));
    this.focus.z = lerp(this.focus.z, fz, k);

    const cp = Math.cos(this.pitch);
    const pos = this.tmp.set(
      this.focus.x - Math.sin(this.yaw) * dist * cp,
      this.focus.y + Math.sin(this.pitch) * dist,
      this.focus.z - Math.cos(this.yaw) * dist * cp,
    );
    // Keep the camera inside the play area so walls and pillars never block the view.
    const b = this.bounds;
    if (b?.rect) {
      const [x0, z0, x1, z1] = b.rect;
      pos.x = Math.min(x1 + 3, Math.max(x0 - 3, pos.x)); pos.z = Math.min(z1 + 3, Math.max(z0 - 3, pos.z));
    } else {
      const R = (b?.radius ?? 17) + 2, r = Math.hypot(pos.x, pos.z);
      if (r > R) { pos.x *= R / r; pos.z *= R / r; }
    }

    const s = this.trauma * this.trauma * 0.35;
    if (s > 0) {
      pos.x += (Math.sin(this.t * 71) + Math.sin(this.t * 37)) * s * 0.5;
      pos.y += Math.sin(this.t * 83) * s * 0.5;
    }
    this.trauma = Math.max(0, this.trauma - dt * 2.2);
    if (this.returnBlend > 0) { // ease out of a cinematic instead of cutting
      const b = this.returnBlend * this.returnBlend;
      pos.x = lerp(pos.x, this.shotPos.x, b); pos.y = lerp(pos.y, this.shotPos.y, b); pos.z = lerp(pos.z, this.shotPos.z, b);
      this.returnBlend = Math.max(0, this.returnBlend - dt * 2.2);
    }
    this.cam.position.copyFrom(pos);
    this.cam.setTarget(this.focus);
    this.punch = Math.max(0, this.punch - dt * 2.5);
    this.cam.fov = this.baseFov - this.punch * (this.reduceMotion ? 0.05 : 0.18);
  }
}
