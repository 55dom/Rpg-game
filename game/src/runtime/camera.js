// Third-person camera with lock-on framing, shake (trauma), and punch-in for big hits.

import { B, lerp, lerpAngle } from "./look.js";

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
    this.trauma = 0;
    this.punch = 0;
    this.reduceMotion = false;
    this.t = 0;
  }

  shake(amount) { this.trauma = Math.min(1, this.trauma + amount * (this.reduceMotion ? 0.4 : 1)); }
  kick(amount) { this.punch = Math.max(this.punch, amount); }

  /** Forward and right on the ground plane, for camera-relative movement. */
  get basis() {
    const s = Math.sin(this.yaw), c = Math.cos(this.yaw);
    return { fx: s, fz: c, rx: c, rz: -s };
  }

  update(dt, playerPos, lockPos, look) {
    const BB = B();
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
    const pos = new BB.Vector3(
      this.focus.x - Math.sin(this.yaw) * dist * cp,
      this.focus.y + Math.sin(this.pitch) * dist,
      this.focus.z - Math.cos(this.yaw) * dist * cp,
    );
    // Keep the camera inside the yard so pillars never block the view.
    const r = Math.hypot(pos.x, pos.z);
    if (r > 19) { pos.x *= 19 / r; pos.z *= 19 / r; }

    const s = this.trauma * this.trauma * 0.35;
    if (s > 0) {
      pos.x += (Math.sin(this.t * 71) + Math.sin(this.t * 37)) * s * 0.5;
      pos.y += Math.sin(this.t * 83) * s * 0.5;
    }
    this.trauma = Math.max(0, this.trauma - dt * 2.2);
    this.cam.position.copyFrom(pos);
    this.cam.setTarget(this.focus);
    this.punch = Math.max(0, this.punch - dt * 2.5);
    this.cam.fov = this.baseFov - this.punch * (this.reduceMotion ? 0.05 : 0.18);
  }
}
