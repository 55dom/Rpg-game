// The floor trail: which way to walk to reach the next thing a beat needs (someone to talk to, something
// to pick up). Pure math, so it's testable: a coarse grid over the zone, A* around its solids, then the
// path pulled tight so the arrows run in straight lines and only turn at corners.
//
// bounds are the same as sim/bounds.js: { radius } | { rect, solids: [{ box } | { circle }] }.

/** Is a point (with body radius r) inside the bounds and clear of every solid? */
export function isFree(x, z, r, b) {
  if (b.radius != null) return Math.hypot(x, z) <= b.radius - r;
  const [x0, z0, x1, z1] = b.rect;
  if (x < x0 + r || x > x1 - r || z < z0 + r || z > z1 - r) return false;
  for (const s of b.solids ?? []) {
    if (s.circle) { const [cx, cz, cr] = s.circle; if (Math.hypot(x - cx, z - cz) < cr + r) return false; }
    else if (s.box) { const [bx0, bz0, bx1, bz1] = s.box; if (x > bx0 - r && x < bx1 + r && z > bz0 - r && z < bz1 + r) return false; }
  }
  return true;
}

// Does the segment a→b pass within r of a circle, or through a box grown by r? (Exact, not sampled.)
function hitsCircle(ax, az, bx, bz, cx, cz, rr) {
  const dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((cx - ax) * dx + (cz - az) * dz) / len2)) : 0;
  return Math.hypot(ax + dx * t - cx, az + dz * t - cz) < rr;
}
function hitsBox(ax, az, bx, bz, x0, z0, x1, z1) {
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dz = bz - az;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dz, az - z0], [dz, z1 - az]]) {
    if (p === 0) { if (q <= 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t0 < t1;
}

/** Can a body of radius r walk straight from a to b? */
export function lineClear(a, b, r, bounds) {
  if (bounds.radius != null) return isFree(a.x, a.z, r, bounds) && isFree(b.x, b.z, r, bounds); // a disc is convex
  const [x0, z0, x1, z1] = bounds.rect;
  for (const p of [a, b]) if (p.x < x0 + r || p.x > x1 - r || p.z < z0 + r || p.z > z1 - r) return false;
  for (const s of bounds.solids ?? []) {
    if (s.circle) { if (hitsCircle(a.x, a.z, b.x, b.z, s.circle[0], s.circle[1], s.circle[2] + r)) return false; }
    else if (s.box && hitsBox(a.x, a.z, b.x, b.z, s.box[0] - r, s.box[1] - r, s.box[2] + r, s.box[3] + r)) return false;
  }
  return true;
}

/**
 * A walkable path from `from` to `to`, as points [{x, z}, …] starting at `from` and ending at `to`.
 * The goal may stand against a wall (a person by a door): the path then ends at the nearest free spot
 * and takes one last step to them. Returns null if there's no way through.
 */
export function findPath(from, to, bounds, { r = 0.4, cell = 0.7, maxNodes = 60000 } = {}) {
  if (lineClear(from, to, r, bounds)) return [{ x: from.x, z: from.z }, { x: to.x, z: to.z }];
  const [x0, z0, x1, z1] = bounds.radius != null ? [-bounds.radius, -bounds.radius, bounds.radius, bounds.radius] : bounds.rect;
  const cols = Math.max(1, Math.ceil((x1 - x0) / cell)), rows = Math.max(1, Math.ceil((z1 - z0) / cell));
  if (cols * rows > maxNodes) return null;
  const cx = (i) => x0 + (i + 0.5) * cell, cz = (j) => z0 + (j + 0.5) * cell;
  const col = (x) => Math.max(0, Math.min(cols - 1, Math.floor((x - x0) / cell)));
  const row = (z) => Math.max(0, Math.min(rows - 1, Math.floor((z - z0) / cell)));
  const free = new Int8Array(cols * rows).fill(-1); // -1 unknown, 0 blocked, 1 free (worked out as needed)
  const ok = (k) => { if (free[k] < 0) free[k] = isFree(cx(k % cols), cz((k / cols) | 0), r, bounds) ? 1 : 0; return free[k] === 1; };
  const nearestFree = (x, z) => { // the closest open cell to a point, searching outward ring by ring
    const i0 = col(x), j0 = row(z);
    for (let ring = 0; ring <= 6; ring++) {
      let best = -1, bd = Infinity;
      for (let j = j0 - ring; j <= j0 + ring; j++) for (let i = i0 - ring; i <= i0 + ring; i++) {
        if (i < 0 || j < 0 || i >= cols || j >= rows || Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== ring) continue;
        const k = j * cols + i;
        if (!ok(k)) continue;
        const d = Math.hypot(cx(i) - x, cz(j) - z);
        if (d < bd) { bd = d; best = k; }
      }
      if (best >= 0) return best;
    }
    return -1;
  };
  const start = nearestFree(from.x, from.z), goal = nearestFree(to.x, to.z);
  if (start < 0 || goal < 0) return null;
  // A* on 8 neighbours (no cutting a corner past a blocked cell), octile distance.
  const g = new Float32Array(cols * rows).fill(Infinity), came = new Int32Array(cols * rows).fill(-1);
  const gi = goal % cols, gj = (goal / cols) | 0;
  const h = (k) => { const di = Math.abs((k % cols) - gi), dj = Math.abs(((k / cols) | 0) - gj); return (Math.max(di, dj) + 0.4142 * Math.min(di, dj)) * cell; };
  const heap = [], fOf = new Float32Array(cols * rows);
  const push = (k) => { heap.push(k); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (fOf[heap[p]] <= fOf[k]) break; heap[i] = heap[p]; i = p; } heap[i] = k; };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) { let i = 0; for (;;) { const l = 2 * i + 1, rr = l + 1; let m = i, mv = fOf[last]; if (l < heap.length && fOf[heap[l]] < mv) { m = l; mv = fOf[heap[l]]; } if (rr < heap.length && fOf[heap[rr]] < mv) m = rr; if (m === i) break; heap[i] = heap[m]; i = m; } heap[i] = last; }
    return top;
  };
  g[start] = 0; fOf[start] = h(start); push(start);
  const closed = new Uint8Array(cols * rows);
  let found = false;
  while (heap.length) {
    const k = pop();
    if (closed[k]) continue;
    if (k === goal) { found = true; break; }
    closed[k] = 1;
    const i = k % cols, j = (k / cols) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
      const n = nj * cols + ni;
      if (closed[n] || !ok(n)) continue;
      if (di && dj && (!ok(j * cols + ni) || !ok(nj * cols + i))) continue;
      const ng = g[k] + (di && dj ? 1.4142 : 1) * cell;
      if (ng < g[n]) { g[n] = ng; came[n] = k; fOf[n] = ng + h(n); push(n); }
    }
  }
  if (!found) return null;
  const cells = [];
  for (let k = goal; k >= 0; k = came[k]) { cells.push({ x: cx(k % cols), z: cz((k / cols) | 0) }); if (k === start) break; }
  cells.reverse();
  const raw = [{ x: from.x, z: from.z }, ...cells.slice(1), { x: to.x, z: to.z }];
  // Pull it tight: from each kept point, jump to the furthest point still in a straight, clear line.
  const out = [raw[0]];
  let i = 0;
  while (i < raw.length - 1) {
    let j = i + 1;
    while (j + 1 < raw.length && lineClear(raw[i], raw[j + 1], r * 0.9, bounds)) j++;
    out.push(raw[j]);
    i = j;
  }
  return out;
}

/** Total length of a path. */
export const pathLength = (path) => path.reduce((s, p, i) => (i ? s + Math.hypot(p.x - path[i - 1].x, p.z - path[i - 1].z) : 0), 0);

/** The point `s` metres along a path. */
export function pointAt(path, s) {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], L = Math.hypot(b.x - a.x, b.z - a.z);
    if (s <= L || i === path.length - 1) { const t = L > 0 ? Math.max(0, Math.min(1, s / L)) : 0; return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }; }
    s -= L;
  }
  return { ...path[path.length - 1] };
}

/**
 * Where the arrows go: every `spacing` metres along the path, from `start` past the walker to `stop` short of
 * the goal, at most `max` of them. Each points along the path (yaw as the game uses it: atan2(dx, dz)),
 * smoothed over a short stretch so arrows on a corner turn with it.
 */
export function trailMarks(path, { spacing = 1.25, start = 1.1, stop = 1.1, max = 14 } = {}) {
  if (!path || path.length < 2) return [];
  const total = pathLength(path), marks = [];
  for (let s = start; s <= total - stop && marks.length < max; s += spacing) {
    const p = pointAt(path, s), a = pointAt(path, Math.max(0, s - 0.35)), b = pointAt(path, Math.min(total, s + 0.35));
    marks.push({ x: p.x, z: p.z, yaw: Math.atan2(b.x - a.x, b.z - a.z), s, left: total - s });
  }
  return marks;
}

/**
 * Who to walk to next: the nearest of the beat's required ids not done yet that can be reached now.
 * `where(id)` gives a position, or null if that one isn't there (hidden, not shown yet).
 */
export function guideTarget(from, required, done, where) {
  let best = null, bd = Infinity;
  for (const id of required ?? []) {
    if (done.has(id)) continue;
    const p = where(id);
    if (!p) continue;
    const d = Math.hypot(p.x - from.x, p.z - from.z);
    if (d < bd) { bd = d; best = { id, x: p.x, z: p.z, d }; }
  }
  return best;
}
