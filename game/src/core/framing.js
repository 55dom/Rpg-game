// Cutscene framing checks (pure, for tests and authoring): where every actor stands at a moment of a timeline,
// and whether a camera key at that moment has someone in the lens, someone standing between the camera and
// what it's looking at, or the subject's head cut off by the top of the frame.
//
// Heights: a character is about 1.95 m tall at scale 1. The letterbox bars take ~7% off the top and bottom.

import { sampleMove, sampleCamera } from "./timeline.js";

const BODY = 1.95, LETTERBOX = 0.86;

/** Every actor's position and visibility at time t. */
export function actorsAt(cs, t, scaleOf = () => 1) {
  const out = new Map();
  for (const a of cs.actors ?? []) out.set(a.id, { id: a.id, x: a.x, z: a.z, y: a.y ?? 0, shown: !a.hidden, scale: scaleOf(a.look) });
  const evs = [...(cs.events ?? [])].sort((p, q) => p.t - q.t);
  for (const e of evs) {
    if (e.t > t) break;
    if (e.show && out.has(e.show)) out.get(e.show).shown = true;
    if (e.hide && out.has(e.hide)) out.get(e.hide).shown = false;
    if (e.move && out.has(e.move.id)) {
      const a = out.get(e.move.id), dur = e.move.dur ?? Math.hypot(e.move.to[0] - a.x, e.move.to[1] - a.z) / 2.4;
      [a.x, a.z] = sampleMove([a.x, a.z], e.move.to, e.t, dur, t);
    }
  }
  return [...out.values()];
}

/**
 * Problems with the shot at time t: [{ kind: "lens" | "blocks" | "cropped", id, t }].
 *  lens     someone so close to the camera that their body fills the frame
 *  blocks   someone standing on the line from the camera to the subject, well in front of it
 *  cropped  the subject (whoever stands at the look point) has the top of their head out of frame
 */
export function shotProblems(cs, t, scaleOf = () => 1) {
  const cam = sampleCamera(cs.camera, t), [px, py, pz] = cam.pos, [qx, qy, qz] = cam.look;
  const dx = qx - px, dz = qz - pz, L = Math.hypot(dx, dz) || 1e-6, ux = dx / L, uz = dz / L;
  const pitch = Math.atan2(qy - py, L), half = (cam.fov / 2) * LETTERBOX;
  const out = [];
  for (const a of actorsAt(cs, t, scaleOf)) {
    if (!a.shown) continue;
    const h = BODY * a.scale, ax = a.x - px, az = a.z - pz;
    const along = ax * ux + az * uz, side = Math.abs(ax * -uz + az * ux), dist = Math.hypot(ax, az);
    const camInBody = py > a.y - 0.2 && py < a.y + h + 0.2;
    if (dist < 0.9 * a.scale && camInBody && along > -0.3) { out.push({ kind: "lens", id: a.id, t }); continue; }
    const subject = Math.hypot(a.x - qx, a.z - qz) < 0.7;
    if (!subject && along > 0.2 && along < L - 1 && side < 0.42 * a.scale) {
      const yAt = py + (qy - py) * (along / L); // the sight line's height as it passes them
      if (yAt > a.y + 0.25 && yAt < a.y + h) out.push({ kind: "blocks", id: a.id, t });
    }
    if (subject && along > 0.5) {
      const top = Math.atan2(a.y + h + 0.08 - py, along) - pitch;
      if (top > half) out.push({ kind: "cropped", id: a.id, t });
    }
  }
  // Hidden: someone standing almost exactly behind someone else, as the camera sees them (in frame, both on their feet).
  const aspect = 16 / 9, halfW = Math.atan(Math.tan(cam.fov / 2) * aspect);
  const seen = actorsAt(cs, t, scaleOf).filter((a) => a.shown).map((a) => {
    const ax = a.x - px, az = a.z - pz, along = ax * ux + az * uz, side = ax * -uz + az * ux;
    const lo = Math.atan2(a.y - py, Math.max(0.1, along)), hi = Math.atan2(a.y + BODY * a.scale - py, Math.max(0.1, along));
    return { ...a, along, ang: Math.atan2(side, along), w: Math.atan2(0.26 * a.scale, Math.max(0.1, along)), lo, hi };
  }).filter((a) => a.along > 0.8 && Math.abs(a.ang) < halfW);
  const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  for (const far of seen) for (const near of seen) {
    if (near === far || near.along >= far.along - 0.3) continue;
    if (Math.hypot(near.x - qx, near.z - qz) < 0.7) continue; // the subject of a close shot may stand in front of anyone
    const across = overlap(near.ang - near.w, near.ang + near.w, far.ang - far.w, far.ang + far.w) / (2 * far.w);
    const up = overlap(near.lo, near.hi, far.lo, far.hi) / Math.max(1e-6, far.hi - far.lo); // a camera up high sees over people
    if (across > 0.7 && up > 0.6) { out.push({ kind: "hidden", id: far.id, by: near.id, t }); break; }
  }
  return out;
}

/** Every problem in a cutscene, sampled every `step` seconds (one entry per actor and kind per shot). */
export function cutsceneProblems(cs, scaleOf = () => 1, step = 0.25) {
  const seen = new Set(), out = [];
  const cuts = [0, ...cs.camera.filter((k) => k.cut).map((k) => k.t), cs.duration];
  for (let t = 0; t <= cs.duration + 1e-6; t += step) {
    const shot = cuts.filter((c) => c <= t + 1e-6).length; // which shot (between cuts) this moment is in
    for (const p of shotProblems(cs, t, scaleOf)) {
      const key = `${shot}|${p.kind}|${p.id}`;
      if (seen.has(key)) continue;
      seen.add(key); out.push({ ...p, shot });
    }
  }
  return out;
}
