// Hit volumes. Hitboxes are boxes that turn with their owner (yaw only);
// hurt volumes are upright capsules. Because both stay upright, the test is exact.

/** World-space center of a hitbox given the owner's feet position and yaw. */
export function hitboxCenter(def, pos, yaw) {
  const [ox, oy, oz] = def.center;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return { x: pos.x + ox * c + oz * s, y: pos.y + oy, z: pos.z - ox * s + oz * c };
}

/**
 * Does a yawed box touch an upright capsule?
 * @param {{center:number[], size:number[]}} def @param {{x,y,z}} ownerPos @param {number} yaw
 * @param {{x,y,z}} feet capsule bottom @param {number} radius @param {number} height
 */
export function boxHitsCapsule(def, ownerPos, yaw, feet, radius, height) {
  const c = hitboxCenter(def, ownerPos, yaw);
  const dx = feet.x - c.x, dz = feet.z - c.z;
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  const hx = def.size[0] / 2, hy = def.size[1] / 2, hz = def.size[2] / 2;
  const ex = Math.max(Math.abs(lx) - hx, 0);
  const ez = Math.max(Math.abs(lz) - hz, 0);
  // Capsule core segment vs box vertical extent.
  const segLo = feet.y + radius - c.y, segHi = feet.y + height - radius - c.y;
  const ey = segLo > hy ? segLo - hy : segHi < -hy ? -hy - segHi : 0;
  return ex * ex + ey * ey + ez * ez <= radius * radius;
}
