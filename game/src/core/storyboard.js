// Storyboards as data, and the camera language library (GDD §19.2, §19.5).
//
// §19.2's pipeline starts from a storyboard, the 5-column doc: CUT, PICTURE, ACTION / STAGE, DIALOGUE / AUDIO,
// TIME / FRAMES (24 fps). storyboard() takes a board written in those columns, plus the shot size, who's in it and which
// camera moves, and lays out the cutscene timeline (core/timeline.js) that runtime/story.js plays: a layout step,
// not hand-placed keyframes.
//
// §19.5: "Camera presets, each a reusable data asset … Storyboards reference them by name (CAM_WHIP_PAN_FAST)." Each
// preset changes a shot's opening or closing framing (or both); a cut can stack them ("CAM_LOW_ANGLE CAM_TILT_UP
// CAM_DUTCH"). The fifteen §19.5 names: Pan, Tilt, Dolly, Tracking, Crane, Zoom, Orbit, Handheld shake, Whip pan, Snap
// zoom, Dutch angle, Low angle, High angle, ECU, Wide establishing. (Plus CAM_HOLD, a locked-off shot, and CAM_OTS, over
// a shoulder, which the boards also call for.)
//
// Pure: no rendering. Positions come from core/framing.js's actorsAt, so a shot frames people where they'll be.

import { actorsAt } from "./framing.js";
import { validateCutscene } from "./timeline.js";

export const BOARD_FPS = 24;

/** Shot sizes (the PICTURE column's MS, CU, ECU…): distance from the subject, lens, and what the lens is on. */
export const SIZES = Object.freeze({
  ECU: { dist: 1.0, fov: 0.3, at: "eyes" },
  CU: { dist: 1.8, fov: 0.42, at: "head" },
  INSERT: { dist: 1.2, fov: 0.42, at: "hand" },
  MS: { dist: 3.4, fov: 0.55, at: "chest" },
  TWO: { dist: 4.6, fov: 0.58, at: "chest" },
  WIDE: { dist: 10, fov: 0.75, at: "waist" },
  ESTABLISHING: { dist: 19, fov: 0.8, at: "ground", rise: 7 },
});
const AT = { eyes: 1.98, head: 1.85, chest: 1.35, hand: 1.0, waist: 1.0, ground: 0.6 };

const v = (p) => ({ x: p[0], y: p[1], z: p[2] });
const arr = (p) => [p.x, p.y, p.z];
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const scale = (a, k) => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const flat = (a) => { const l = Math.hypot(a.x, a.z) || 1; return { x: a.x / l, y: 0, z: a.z / l }; };
const rotY = (d, r) => ({ x: d.x * Math.cos(r) + d.z * Math.sin(r), y: d.y, z: -d.x * Math.sin(r) + d.z * Math.cos(r) });
/** Swing a camera position round its look point by r radians (an orbit). */
const orbitAround = (pos, look, r) => add(look, rotY(sub(pos, look), r));
/** Swing a look point round the camera by r radians (a pan). */
const panAround = (pos, look, r) => add(pos, rotY(sub(look, pos), r));

/**
 * The library. Each preset gets { a, b, cut, ctx } (a: the opening framing, b: the closing one; each { pos, look, fov,
 * roll, shake }) and changes them; `keys` (optional) adds an extra key inside the cut, for the fast moves.
 */
export const CAMERA_PRESETS = Object.freeze({
  CAM_HOLD: { name: "Hold", does: "locked off" },
  CAM_PAN_LEFT: { name: "Pan", does: "the lens swings onto the subject from its right", fx: ({ a }) => { a.look = panAround(a.pos, a.look, -0.32); } },
  CAM_PAN_RIGHT: { name: "Pan", does: "the lens swings onto the subject from its left", fx: ({ a }) => { a.look = panAround(a.pos, a.look, 0.32); } },
  CAM_TILT_UP: { name: "Tilt", does: "the lens tilts up from the ground to the subject", fx: ({ a }) => { a.look = { ...a.look, y: Math.max(0.1, a.look.y - 1.6) }; } },
  CAM_TILT_DOWN: { name: "Tilt", does: "the lens tilts down from above onto the subject", fx: ({ a }) => { a.look = { ...a.look, y: a.look.y + 2.2 }; } },
  CAM_DOLLY_IN: { name: "Dolly", does: "the camera moves in", fx: ({ a }) => { a.pos = add(a.look, scale(sub(a.pos, a.look), 1.3)); } },
  CAM_DOLLY_IN_SLOW: { name: "Dolly", does: "the camera creeps in", fx: ({ a }) => { a.pos = add(a.look, scale(sub(a.pos, a.look), 1.12)); }, ease: "linear" },
  CAM_DOLLY_OUT: { name: "Dolly", does: "the camera moves back", fx: ({ b }) => { b.pos = add(b.look, scale(sub(b.pos, b.look), 1.3)); } },
  CAM_PULL_BACK_SLOW: { name: "Dolly", does: "the camera eases back, slowly", fx: ({ b }) => { b.pos = add(b.look, scale(sub(b.pos, b.look), 1.18)); }, ease: "linear" },
  CAM_PUSH_IN_SLOW: { name: "Dolly", does: "a slow push in", fx: ({ a }) => { a.pos = add(a.look, scale(sub(a.pos, a.look), 1.15)); }, ease: "linear" },
  CAM_TRACKING: { name: "Tracking", does: "the camera moves with the subject", track: true, ease: "linear" },
  CAM_CRANE_DOWN: { name: "Crane", does: "the camera comes down from above", fx: ({ a, ctx }) => { a.pos = { ...a.pos, y: a.pos.y + ctx.dist * 0.6 }; } },
  CAM_CRANE_DOWN_SLOW: { name: "Crane", does: "the camera sinks slowly from above", fx: ({ a, ctx }) => { a.pos = { ...a.pos, y: a.pos.y + ctx.dist * 0.45 }; }, ease: "out" },
  CAM_CRANE_UP: { name: "Crane", does: "the camera rises", fx: ({ b, ctx }) => { b.pos = { ...b.pos, y: b.pos.y + ctx.dist * 0.6 }; } },
  CAM_ZOOM_IN: { name: "Zoom", does: "the lens narrows", fx: ({ a }) => { a.fov *= 1.5; } },
  CAM_ZOOM_OUT: { name: "Zoom", does: "the lens widens", fx: ({ b }) => { b.fov *= 1.5; } },
  CAM_ORBIT: { name: "Orbit", does: "the camera circles the subject", fx: ({ a, b }) => { a.pos = orbitAround(a.pos, a.look, -0.5); b.pos = orbitAround(b.pos, b.look, 0.5); }, arc: true, ease: "linear" },
  CAM_HANDHELD: { name: "Handheld shake", does: "a slight hand-held drift", fx: ({ a, b }) => { a.shake = b.shake = 0.035; } },
  CAM_WHIP_PAN_FAST: { name: "Whip pan", does: "the lens whips across onto the subject in a sixth of a second", fx: ({ a }) => { a.look = panAround(a.pos, a.look, 1.3); }, snap: 0.16, snapEase: "in" },
  CAM_SNAP_ZOOM: { name: "Snap zoom", does: "the lens snaps in, a tenth of a second", fx: ({ a }) => { a.fov *= 2.2; }, snap: 0.1, snapEase: "out" },
  CAM_DUTCH: { name: "Dutch angle", does: "the frame tilts", fx: ({ a, b }) => { a.roll = b.roll = 0.22; } },
  CAM_DUTCH_LEFT: { name: "Dutch angle", does: "the frame tilts the other way", fx: ({ a, b }) => { a.roll = b.roll = -0.22; } },
  CAM_LOW_ANGLE: { name: "Low angle", does: "from near the ground, looking up", frame: (f, ctx) => { f.pos = { ...f.pos, y: 0.35 }; f.look = { ...f.look, y: f.look.y + 0.25 * ctx.k }; f.fov += 0.05; } },
  CAM_HIGH_ANGLE: { name: "High angle", does: "from above, looking down", frame: (f, ctx) => { f.pos = { ...f.pos, y: f.look.y + ctx.dist * 0.9 }; } },
  CAM_ECU: { name: "ECU", does: "an extreme close-up", size: "ECU", ecu: true },
  CAM_WIDE_ESTABLISHING: { name: "Wide establishing", does: "the whole place, from high and far", size: "ESTABLISHING" },
  CAM_OTS: { name: "Over the shoulder", does: "from behind someone's shoulder, toward the subject", ots: true },
});
/** The §19.5 list, by the names it uses, and a preset for each. */
export const SECTION_19_5 = Object.freeze({
  Pan: "CAM_PAN_LEFT", Tilt: "CAM_TILT_UP", Dolly: "CAM_DOLLY_IN", Tracking: "CAM_TRACKING", Crane: "CAM_CRANE_DOWN", Zoom: "CAM_ZOOM_IN",
  Orbit: "CAM_ORBIT", "Handheld shake": "CAM_HANDHELD", "Whip pan": "CAM_WHIP_PAN_FAST", "Snap zoom": "CAM_SNAP_ZOOM", "Dutch angle": "CAM_DUTCH",
  "Low angle": "CAM_LOW_ANGLE", "High angle": "CAM_HIGH_ANGLE", ECU: "CAM_ECU", "Wide establishing": "CAM_WIDE_ESTABLISHING",
});

const camsOf = (cut) => (Array.isArray(cut.cam) ? cut.cam : String(cut.cam ?? "CAM_HOLD").split(/\s+/)).filter(Boolean);

/** Where a cut's subject is at time t: an actor, the midpoint of two (a two-shot), or a point. */
function subjectAt(cs, cut, t, scaleOf) {
  const people = actorsAt(cs, t, scaleOf);
  const find = (id) => { const a = people.find((p) => p.id === id); if (!a) throw new Error(`${cs.id} cut ${cut.cut}: no actor "${id}"`); return a; };
  const yawOf = (id) => (cs.actors.find((a) => a.id === id)?.yaw ?? 0);
  if (Array.isArray(cut.on) && typeof cut.on[0] === "number") return { x: cut.on[0], y: cut.on[1] ?? 0, z: cut.on[2] ?? 0, k: 1, yaw: cut.yaw ?? 0, point: true };
  const ids = Array.isArray(cut.on) ? cut.on : [cut.on];
  const as = ids.map(find), k = Math.max(...as.map((a) => a.scale));
  const mid = { x: as.reduce((s, a) => s + a.x, 0) / as.length, y: as.reduce((s, a) => s + a.y, 0) / as.length, z: as.reduce((s, a) => s + a.z, 0) / as.length };
  let yaw = cut.yaw ?? yawOf(ids[0]);
  if (as.length === 2 && cut.yaw == null) { const d = { x: as[1].x - as[0].x, z: as[1].z - as[0].z }; yaw = Math.atan2(d.x, d.z) - Math.PI / 2; } // a two-shot: from in front of the pair
  return { ...mid, k, yaw, pair: as.length > 1 };
}

/** The framing of a cut at time t, before any moves: size, side, height. */
function baseFraming(cs, cut, t, scaleOf) {
  const s = subjectAt(cs, cut, t, scaleOf);
  const presets = camsOf(cut).map((n) => CAMERA_PRESETS[n]);
  const size = SIZES[cut.size ?? presets.find((p) => p?.size)?.size ?? "MS"];
  const k = s.point ? 1 : s.k;
  const dist = (cut.dist ?? size.dist) * (s.point ? 1 : k);
  const lookY = cut.lookY ?? (s.y + (s.point ? 0 : AT[size.at] * k));
  const look = { x: s.x, y: lookY, z: s.z };
  const ang = s.yaw + (cut.from ?? 0.35); // 0 = straight on, π = from behind, ± π/2 = profile
  let pos = { x: s.x + Math.sin(ang) * dist, y: lookY + (size.rise ?? 0.12) + (cut.rise ?? 0), z: s.z + Math.cos(ang) * dist };
  if (cut.ots) { // over this actor's shoulder, toward the subject
    const o = actorsAt(cs, t, scaleOf).find((a) => a.id === cut.ots);
    if (!o) throw new Error(`${cs.id} cut ${cut.cut}: no actor "${cut.ots}" to look over`);
    const back = flat(sub({ x: o.x, y: 0, z: o.z }, { x: s.x, y: 0, z: s.z })), side = rotY(back, Math.PI / 2);
    pos = { x: o.x + back.x * 1.1 + side.x * 0.5, y: o.y + 1.95 * o.scale, z: o.z + back.z * 1.1 + side.z * 0.5 };
  }
  const f = { pos, look, fov: cut.fov ?? size.fov, roll: 0, shake: 0 };
  for (const p of presets) p?.frame?.(f, { dist, k });
  return { f, dist, k };
}

/** The camera keys for one cut, starting at t0. */
export function cutKeys(cs, cut, t0, dur, scaleOf = () => 1) {
  const names = camsOf(cut);
  for (const n of names) if (!CAMERA_PRESETS[n]) throw new Error(`${cs.id} cut ${cut.cut}: no camera preset ${n}`);
  const presets = names.map((n) => CAMERA_PRESETS[n]);
  const start = baseFraming(cs, cut, t0, scaleOf), track = presets.some((p) => p.track);
  const a = { ...start.f }, b = track ? { ...baseFraming(cs, cut, t0 + dur, scaleOf).f } : { ...start.f };
  for (const p of presets) p.fx?.({ a, b, cut, ctx: start });
  const flags = { ...(presets.some((p) => p.ecu) ? { ecu: true } : {}), ...(cut.ots ? { ots: cut.ots } : {}) };
  const key = (t, f, extra = {}) => ({ t: +t.toFixed(3), pos: arr(f.pos).map((x) => +x.toFixed(3)), look: arr(f.look).map((x) => +x.toFixed(3)), fov: +f.fov.toFixed(3), ...(f.roll ? { roll: f.roll } : {}), ...(f.shake ? { shake: f.shake } : {}), ...extra });
  const keys = [key(t0, a, { cut: true, ...flags })];
  const snap = presets.find((p) => p.snap);
  const ease = presets.find((p) => p.ease)?.ease ?? "inOut";
  if (snap) { // the fast moves: there in a fraction of a second, then held
    const hit = { ...a, look: b.look, fov: b.fov };
    keys.push(key(t0 + Math.min(snap.snap, dur * 0.5), hit, { ease: snap.snapEase, ...flags }));
    keys.push(key(t0 + dur, b, { ease: "linear", ...flags }));
  } else if (presets.some((p) => p.arc)) { // an orbit: an arc, not a chord
    for (let i = 1; i <= 4; i++) { const u = i / 4; keys.push(key(t0 + dur * u, { ...b, pos: orbitAround(a.pos, a.look, u), look: a.look }, { ease: "linear", ...flags })); } // a radian of arc
  } else keys.push(key(t0 + dur, b, { ease, ...flags }));
  return keys;
}

/** A cut's length in seconds: its TIME, or its FRAMES at 24 fps. */
export const cutSeconds = (cut) => cut.sec ?? cut.frames / BOARD_FPS;

/**
 * A storyboard → a cutscene. board = { id, stage, actors, cuts: [{ cut, picture, action, audio, sec | frames, size, cam,
 * on, from?, yaw?, dist?, rise?, lookY?, fov?, ots?, say?: "Who: words" | null, events?: [{ at, …event }] }], tail?: events }.
 * The result carries `cuts` ([{ cut, t, dur, picture }]) so the Theatre can say which cut a frame is in.
 */
export function storyboard(board, scaleOf = () => 1) {
  let t = 0;
  const cuts = board.cuts.map((c) => { const dur = cutSeconds(c); const out = { cut: c.cut, t: +t.toFixed(3), dur, picture: c.picture, src: c }; t += dur; return out; });
  const duration = +t.toFixed(3);
  const events = [];
  for (const c of cuts) {
    for (const e of c.src.events ?? []) { const { at = 0, ...rest } = e; events.push({ t: +Math.min(duration, c.t + at).toFixed(3), ...rest }); }
    if (c.src.say !== undefined) {
      events.push({ t: c.t, caption: c.src.say });
      if (c.src.say) events.push({ t: +(c.t + c.dur - 0.05).toFixed(3), caption: null }); // a line lasts its cut
    }
  }
  for (const e of board.tail ?? []) events.push({ ...e, t: Math.min(duration, e.t) });
  events.sort((p, q) => p.t - q.t);
  const cs = { id: board.id, stage: board.stage, duration, actors: board.actors, events, camera: [], fps: BOARD_FPS, sky: board.sky };
  for (const c of cuts) cs.camera.push(...cutKeys(cs, c.src, c.t, c.dur, scaleOf));
  cs.cuts = cuts.map(({ src, ...rest }) => rest);
  return validateCutscene(cs);
}

/** Which cut a moment of a storyboarded scene is in (the Theatre shows it): { cut, frame (24 fps, within the cut), of }. */
export function cutAt(cs, t) {
  const c = [...(cs.cuts ?? [])].reverse().find((x) => t >= x.t - 1e-6);
  if (!c) return null;
  return { cut: c.cut, frame: Math.min(Math.round(c.dur * BOARD_FPS) - 1, Math.floor((t - c.t) * BOARD_FPS + 1e-6)) + 1, of: Math.round(c.dur * BOARD_FPS) };
}
