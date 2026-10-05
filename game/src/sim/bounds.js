// Where fighters may stand. The yard is a circle; zones are rectangles with solid obstacles
// (buildings as boxes, fountains and trees as circles). Pure math, so it's testable.
//
// bounds = { radius } | { rect: [minX, minZ, maxX, maxZ], solids?: [{ box: [minX, minZ, maxX, maxZ] } | { circle: [x, z, r] }] }

export const YARD = Object.freeze({ radius: 17 });

/** Push a point (with body radius r) back inside the bounds and out of every solid. Mutates pos. */
export function constrain(pos, r, b) {
  if (b.radius != null) {
    const d = Math.hypot(pos.x, pos.z), max = b.radius;
    if (d > max) { pos.x *= max / d; pos.z *= max / d; }
    return pos;
  }
  const [x0, z0, x1, z1] = b.rect;
  pos.x = Math.min(x1 - r, Math.max(x0 + r, pos.x));
  pos.z = Math.min(z1 - r, Math.max(z0 + r, pos.z));
  for (const s of b.solids ?? []) {
    if (s.circle) {
      const [cx, cz, cr] = s.circle, dx = pos.x - cx, dz = pos.z - cz, d = Math.hypot(dx, dz), min = cr + r;
      if (d < min) { const k = d > 1e-6 ? min / d : 0; pos.x = d > 1e-6 ? cx + dx * k : cx + min; pos.z = d > 1e-6 ? cz + dz * k : pos.z; }
    } else if (s.box) {
      const [bx0, bz0, bx1, bz1] = s.box;
      if (pos.x <= bx0 - r || pos.x >= bx1 + r || pos.z <= bz0 - r || pos.z >= bz1 + r) continue;
      // Leave by the shortest way out.
      const outs = [[pos.x - (bx0 - r), "x", bx0 - r], [(bx1 + r) - pos.x, "x", bx1 + r], [pos.z - (bz0 - r), "z", bz0 - r], [(bz1 + r) - pos.z, "z", bz1 + r]];
      outs.sort((a, c) => a[0] - c[0]);
      pos[outs[0][1]] = outs[0][2];
    }
  }
  return pos;
}

/** Is a point outside the playable area (for projectiles)? */
export function outOfBounds(pos, b, margin = 2) {
  if (b.radius != null) return Math.hypot(pos.x, pos.z) > b.radius + margin;
  const [x0, z0, x1, z1] = b.rect;
  return pos.x < x0 - margin || pos.x > x1 + margin || pos.z < z0 - margin || pos.z > z1 + margin;
}

/** Is a point inside a trigger rectangle [minX, minZ, maxX, maxZ]? */
export const inRect = (pos, [x0, z0, x1, z1]) => pos.x >= x0 && pos.x <= x1 && pos.z >= z0 && pos.z <= z1;
