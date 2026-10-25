// Cutscene timelines (GDD §19.1 tier 3: "JSON timeline + camera director + dialogue").
// A cutscene is data: a set, actors, camera keyframes, and timed events. This module is pure
// (no rendering), so the timing math is testable; runtime/story.js plays it.
//
// cutscene = {
//   id, stage, duration,
//   actors: [{ id, look, x, z, yaw, hidden?, carry? }],
//   camera: [{ t, pos: [x,y,z], look: [x,y,z], fov?, ease?: "linear"|"in"|"out"|"inOut", cut? }],
//   events: [{ t, caption? | sfx? | fx? | move?: { id, to: [x,z], dur } | show? | hide? | fade?: "in"|"out" }],
// }
// Camera keys interpolate toward the next key unless that key is a `cut` (a hard cut to a new shot).

export const EASE = Object.freeze({
  linear: (k) => k,
  in: (k) => k * k,
  out: (k) => 1 - (1 - k) * (1 - k),
  inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
});

const EVENT_KEYS = ["caption", "sfx", "fx", "move", "show", "hide", "fade", "pose", "cue"];

export function validateCutscene(cs) {
  if (!cs?.id) throw new Error("cutscene needs an id");
  const where = `cutscene ${cs.id}`;
  if (!(cs.duration > 0)) throw new Error(`${where}: duration must be > 0`);
  if (!Array.isArray(cs.camera) || !cs.camera.length) throw new Error(`${where}: needs camera keys`);
  let last = -Infinity;
  for (const k of cs.camera) {
    if (!(k.t >= last)) throw new Error(`${where}: camera keys must be in time order`);
    last = k.t;
    if (k.pos?.length !== 3 || k.look?.length !== 3) throw new Error(`${where}: camera key at ${k.t} needs pos and look`);
    if (k.ease && !EASE[k.ease]) throw new Error(`${where}: unknown ease "${k.ease}"`);
  }
  const ids = new Set((cs.actors ?? []).map((a) => a.id));
  for (const e of cs.events ?? []) {
    if (!(e.t >= 0 && e.t <= cs.duration)) throw new Error(`${where}: event at ${e.t} is outside 0–${cs.duration}`);
    if (!EVENT_KEYS.some((key) => key in e)) throw new Error(`${where}: event at ${e.t} does nothing`);
    for (const key of ["show", "hide"]) if (e[key] && !ids.has(e[key])) throw new Error(`${where}: unknown actor ${e[key]}`);
    if (e.move && !ids.has(e.move.id)) throw new Error(`${where}: unknown actor ${e.move.id}`);
  }
  return cs;
}

/** Camera pose at time t: { pos, look, fov }. */
export function sampleCamera(keys, t, defaultFov = 0.8) {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].t <= t) i++;
  const a = keys[i], b = keys[i + 1];
  if (!b || b.cut || t <= a.t) return { pos: [...a.pos], look: [...a.look], fov: a.fov ?? defaultFov };
  const k = EASE[b.ease ?? "inOut"](Math.min(1, (t - a.t) / Math.max(1e-6, b.t - a.t)));
  const mix = (p, q) => p.map((v, j) => v + (q[j] - v) * k);
  return { pos: mix(a.pos, b.pos), look: mix(a.look, b.look), fov: (a.fov ?? defaultFov) + ((b.fov ?? defaultFov) - (a.fov ?? defaultFov)) * k };
}

/** Events with from < t <= to: each fires once as time passes it. Start playback at from = -Infinity so t = 0 events fire. */
export function eventsBetween(events, from, to) {
  return (events ?? []).filter((e) => e.t > from && e.t <= to);
}

/** Where a moving actor is at time t (straight line, eased start and stop). */
export function sampleMove(from, to, start, dur, t) {
  const k = EASE.inOut(Math.max(0, Math.min(1, (t - start) / Math.max(1e-6, dur))));
  return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
}
