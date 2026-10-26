// Sentries (Ep 32): Lances walking their beats through the Crown Ward at night, each with a lantern's cone of
// sight. They walk a route back and forth, and at each end they stop and look both ways before turning back.
// Walls, houses and hedges block the light. Stay inside a cone for a moment and they shout.
// Pure: the story runtime moves their actors to where this says and draws the cones.

import { canSee } from "./law.js";

export const SENTRY = Object.freeze({
  speed: 1.5,                      // m/s on their beat
  wait: 1.8,                       // seconds at each end of it, looking both ways
  glance: 0.75,                    // how far they look either way while they wait (radians)
  pov: Object.freeze({ radius: 5.5, half: 0.55 }), // a lantern's reach: further than a townsperson notices (data/law.js POV), but narrower
  notice: 0.45,                    // seconds in the light before they're sure
  forget: 0.5,                     // how fast that wears off once you're out of it (per second, relative)
});

const heading = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);

/** Sentries from beat data: [{ id, route: [[x, z], ...], yaw?, wait?, pov? }]. A one-point route stands and looks about. */
export function makeSentries(defs) {
  return defs.map((d) => {
    const [x, z] = d.route[0], next = d.route[1] ?? null;
    const yaw = d.yaw ?? (next ? heading(d.route[0], next) : 0);
    return { id: d.id, route: d.route, pov: d.pov ?? SENTRY.pov, wait: d.wait ?? SENTRY.wait, x, z, yaw, base: yaw,
      leg: next ? 1 : 0, dir: 1, pause: next ? 0 : Infinity, paused: 0, moving: false, seen: 0, out: false };
  });
}

/** Does the line from a to b pass through a solid (data/zones.js bounds: boxes and circles)? */
export function blocked(a, b, solids = []) {
  const dx = b.x - a.x, dz = b.z - a.z;
  for (const s of solids) {
    if (s.box) { // slab test on the segment
      const [x0, z0, x1, z1] = s.box;
      let t0 = 0, t1 = 1, ok = true;
      for (const [p, d, lo, hi] of [[a.x, dx, x0, x1], [a.z, dz, z0, z1]]) {
        if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) { ok = false; break; } continue; }
        let u = (lo - p) / d, v = (hi - p) / d;
        if (u > v) [u, v] = [v, u];
        t0 = Math.max(t0, u); t1 = Math.min(t1, v);
        if (t0 > t1) { ok = false; break; }
      }
      if (ok) return true;
    } else if (s.circle) {
      const [cx, cz, r] = s.circle, L = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cz - a.z) * dz) / L));
      if (Math.hypot(a.x + dx * t - cx, a.z + dz * t - cz) < r) return true;
    }
  }
  return false;
}

/** Can this sentry see `at` right now (in their cone, nothing in the way)? */
export const sees = (s, at, solids) => !s.out && canSee(s, at, s.pov) && !blocked(s, at, solids);

/**
 * Walk every sentry along their beat for dt seconds and look for `at` (Rook). Returns the first sentry who's been
 * sure of it for long enough (`spotted`), or null. Each sentry's `seen / SENTRY.notice` (0–1) is how close they are.
 */
export function stepSentries(list, dt, at, solids = []) {
  let spotted = null;
  for (const s of list) {
    if (s.out) continue;
    s.moving = false;
    if (s.pause > 0) { // at the end of their beat: look one way, then the other, then turn back
      s.pause -= dt; s.paused += dt;
      const k = Number.isFinite(s.pause) ? s.paused / s.wait : s.paused / 4;
      s.yaw = s.base + Math.sin(k * Math.PI * 2) * SENTRY.glance;
      if (s.pause <= 0) s.yaw = s.base;
    } else {
      const [tx, tz] = s.route[s.leg], dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz), step = SENTRY.speed * dt;
      s.yaw = Math.atan2(dx, dz);
      if (d <= step) { // there: wait, then head for the next point (back and forth along the route)
        s.x = tx; s.z = tz;
        if (s.leg + s.dir < 0 || s.leg + s.dir >= s.route.length) s.dir = -s.dir;
        s.leg += s.dir;
        s.base = s.yaw; // looking on the way they came, before they turn back
        s.pause = s.wait; s.paused = 0;
      } else { s.x += (dx / d) * step; s.z += (dz / d) * step; s.moving = true; }
    }
    if (at && sees(s, at, solids)) s.seen += dt;
    else s.seen = Math.max(0, s.seen - dt * SENTRY.forget);
    if (!spotted && s.seen >= SENTRY.notice) spotted = s;
  }
  return spotted;
}
