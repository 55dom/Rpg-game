// Cutscene framing checks (pure, for tests and authoring): where every actor stands at a moment of a timeline,
// and whether a camera key at that moment has someone in the lens, someone standing between the camera and
// what it's looking at, or the subject's head cut off by the top of the frame.
//
// Heights (measured off the rigs): a character is about 2.22 m to the top of the head at scale 1, and the head
// (big, anime-style) is the top 0.62 m of that. The letterbox bars take ~7% off the top and bottom.

import { sampleMove, sampleCamera } from "./timeline.js";

const BODY = 2.22, HEAD = 0.62, LETTERBOX = 0.86;

/** Every actor's position and visibility at time t. */
export function actorsAt(cs, t, scaleOf = () => 1) {
  const out = new Map();
  for (const a of cs.actors ?? []) out.set(a.id, { id: a.id, x: a.x, z: a.z, y: a.y ?? 0, shown: !a.hidden, scale: scaleOf(a.look) });
  const evs = [...(cs.events ?? [])].sort((p, q) => p.t - q.t);
  for (const e of evs) {
    if (e.t > t) break;
    if (e.show && out.has(e.show)) out.get(e.show).shown = true;
    if (e.hide && out.has(e.hide)) out.get(e.hide).shown = false;
    if (e.pose && out.has(e.pose.id) && (e.pose.name === "down" || e.pose.name === "up")) out.get(e.pose.id).down = e.pose.name === "down";
    if (e.move && out.has(e.move.id)) {
      const a = out.get(e.move.id), dur = e.move.dur ?? Math.hypot(e.move.to[0] - a.x, e.move.to[1] - a.z) / 2.4;
      [a.x, a.z] = sampleMove([a.x, a.z], e.move.to, e.t, dur, t);
    }
  }
  return [...out.values()];
}

/**
 * Problems with the shot at time t: [{ kind: "lens" | "blocks" | "cropped" | "hidden" | "looms", id, t }].
 *  lens     someone so close to the camera that their body fills the frame
 *  blocks   someone standing on the line from the camera to the subject, well in front of it
 *  cropped  the subject (whoever stands at the look point) has the top of their head out of frame
 *  hidden   someone mostly covered by the people in front of them (one, or a column of them)
 *  looms    someone else's head huge in the foreground; a key's `ots: id` marks a deliberate over-the-shoulder
 */
export function shotProblems(cs, t, scaleOf = () => 1) {
  const cam = sampleCamera(cs.camera, t), [px, py, pz] = cam.pos, [qx, qy, qz] = cam.look;
  const key = [...cs.camera].reverse().find((k) => k.t <= t + 1e-6 && (k.cut || k.t === 0)) ?? {}; // the key that opened this shot
  const dx = qx - px, dz = qz - pz, L = Math.hypot(dx, dz) || 1e-6, ux = dx / L, uz = dz / L;
  const pitch = Math.atan2(qy - py, L), half = (cam.fov / 2) * LETTERBOX;
  const out = [];
  for (const a of actorsAt(cs, t, scaleOf)) {
    if (!a.shown || a.down) continue; // someone lying on the ground is in nobody's way
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
  const aspect = 20 / 9, halfW = Math.atan(Math.tan(cam.fov / 2) * aspect); // a phone held sideways: the widest screen it plays on
  const seen = actorsAt(cs, t, scaleOf).filter((a) => a.shown && !a.down).map((a) => {
    const ax = a.x - px, az = a.z - pz, along = ax * ux + az * uz, side = ax * -uz + az * ux;
    const lo = Math.atan2(a.y - py, Math.max(0.1, along)), hi = Math.atan2(a.y + BODY * a.scale - py, Math.max(0.1, along));
    const headLo = Math.atan2(a.y + (BODY - HEAD) * a.scale - py, Math.max(0.1, along)); // where their head starts
    return { ...a, along, ang: Math.atan2(side, along), w: Math.atan2(0.26 * a.scale, Math.max(0.1, along)), lo, hi, headLo };
  }).filter((a) => a.along > 0.8 && Math.abs(a.ang) - a.w < halfW); // any part of them on screen
  const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  for (const far of seen) {
    let covered = 0, face = 0, by = null, most = 0;
    for (const near of seen) {
      if (near === far || near.along >= far.along - 0.3) continue;
      const closeUp = (near.hi - near.lo) > 1.2 * half * 2; // their body runs well off the frame: a close-up, so whoever's behind is just background
      if (closeUp && Math.hypot(near.x - qx, near.z - qz) < 0.7) continue; // the subject of a close-up may stand in front of anyone
      const across = overlap(near.ang - near.w, near.ang + near.w, far.ang - far.w, far.ang + far.w) / (2 * far.w);
      const up = overlap(near.lo, near.hi, far.lo, far.hi) / Math.max(1e-6, far.hi - far.lo); // a camera up high sees over people
      covered += across * up; // two or three people in a column hide the one at the back between them
      const headUp = overlap(near.lo, near.hi, far.headLo, far.hi) / Math.max(1e-6, far.hi - far.headLo);
      face = Math.max(face, across * headUp); // the head is what you need to see
      if (across * up > most) { most = across * up; by = near.id; }
      if (across > 0.7 && up > 0.6) covered = 1;
    }
    if (covered > 0.5 || face > 0.4) out.push({ kind: "hidden", id: far.id, by, t });
  }
  // Looming: someone near the lens (not the subject) whose head takes up a big piece of the frame, usually cut off by its edge.
  for (const a of seen) {
    if (Math.hypot(a.x - qx, a.z - qz) < 0.7 || (key.ots && key.ots === a.id)) continue;
    const hy = a.y + (BODY - HEAD / 2) * a.scale - py; // the middle of their head, above or below the camera
    const head = Math.atan2(HEAD * a.scale, Math.hypot(a.along, hy)), mid = Math.atan2(hy, a.along) - pitch;
    if (Math.abs(mid) > half + head / 2) continue; // their head is out of the shot altogether
    const size = head / (2 * half), cut = Math.abs(mid) + head / 2 > half || Math.abs(a.ang) + head * 0.4 > halfW; // sliced by the frame's edge
    if (size > 0.36 || (size > 0.22 && cut)) out.push({ kind: "looms", id: a.id, t, size: +size.toFixed(2) });
  }
  return out;
}

/** Every problem in a cutscene, sampled every `step` seconds (one entry per actor and kind per shot). */
export function cutsceneProblems(cs, scaleOf = () => 1, step = 0.125) {
  const seen = new Set(), out = [];
  const cuts = [0, ...cs.camera.filter((k) => k.cut).map((k) => k.t), cs.duration];
  for (let t = 0; t <= cs.duration + 1e-6; t += step) {
    const shot = cuts.filter((c) => c <= t + 1e-6).length; // which shot (between cuts) this moment is in
    for (const p of shotProblems(cs, t, scaleOf)) {
      const key = `${shot}|${p.kind}|${p.id}`;
      if (seen.has(key)) { const prev = out.find((q) => `${q.shot}|${q.kind}|${q.id}` === key); if (p.size > (prev.size ?? 0)) prev.size = p.size; continue; }
      seen.add(key); out.push({ ...p, shot });
    }
  }
  return out;
}

/**
 * A dialogue scene's wide shot (runtime/story.js Stage.shot "wide"), from where everyone stands: the camera backs
 * off from the middle of the group far enough to take them all in. mode: "front" looks back from the far side of
 * the set, "side" from the right; anything else from the near side. If someone would be hidden behind someone else
 * from there, the camera swings round the group a little (either way, up to ~45°) to the clearest angle.
 * points: [{ x, z, y?, scale? }]. Returns { pos, look, fov }.
 */
export function wideShot(points, mode) {
  let cx = 0, cz = 0;
  for (const p of points) { cx += p.x; cz += p.z; }
  cx /= points.length; cz /= points.length;
  const span = Math.max(...points.map((p) => Math.hypot(p.x - cx, p.z - cz)));
  const cy = points.reduce((m, p) => m + (p.y ?? 0), 0) / points.length;
  const d = 5 + span * 1.3, front = mode === "front" ? -1 : 1;
  const base = mode === "side"
    ? { pos: { x: cx + d, y: cy + 2.4 + span * 0.2, z: cz - d * 0.3 }, look: { x: cx, y: cy + 1.3, z: cz + 0.6 }, fov: 0.8 }
    : { pos: { x: cx + d * 0.35, y: cy + 2.6 + span * 0.25, z: cz - d * front }, look: { x: cx, y: cy + 1.3, z: cz + front }, fov: 0.8 };
  if (points.length < 2) return base;
  let best = base, bestN = Infinity;
  for (const a of [0, 0.25, -0.25, 0.5, -0.5, 0.75, -0.75]) {
    const c = Math.cos(a), s = Math.sin(a), ox = base.pos.x - cx, oz = base.pos.z - cz;
    const sh = { ...base, pos: { x: cx + ox * c + oz * s, y: base.pos.y, z: cz - ox * s + oz * c } };
    const n = wideFaults(sh, points).filter((p) => p.kind === "hidden" || p.kind === "looms").length;
    if (n < bestN) { best = sh; bestN = n; }
    if (!n) break;
  }
  return best;
}

const asCutscene = (sh, points) => ({ duration: 1, camera: [{ t: 0, cut: true, pos: [sh.pos.x, sh.pos.y, sh.pos.z], look: [sh.look.x, sh.look.y, sh.look.z], fov: sh.fov }],
  actors: points.map((p, i) => ({ id: p.id ?? `p${i}`, look: p.scale ?? 1, x: p.x, z: p.z, y: p.y ?? 0 })), events: [] });

// A crowd (a row of guards, a congregation) can stand behind one another; only the people the scene is about can't be lost.
const wideFaults = (sh, points) => {
  const crowd = new Set(points.filter((p) => p.crowd).map((p, i) => p.id ?? `p${i}`));
  return shotProblems(asCutscene(sh, points), 0, (k) => k).filter((p) => !(p.kind === "hidden" && crowd.has(p.id)));
};

/** Problems with a scene's wide shot (the same checks as a cutscene's, for a camera that holds still). people: [{ id, look, x, z, y?, crowd? }]. */
export function wideShotProblems(people, scaleOf = () => 1, mode) {
  const pts = people.map((p) => ({ ...p, scale: scaleOf(p.look) }));
  return wideFaults(wideShot(pts, mode), pts);
}
