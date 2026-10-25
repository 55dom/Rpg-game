// Camera shots as data (GDD §19.4–19.5). Abilities cue them by name from their frame events,
// so a new cinematic is a new list of cues, not new camera code.
//   mode: behind | orbit | front | wide   (relative to the subject's position and facing)
//   dist/height: camera offset · lookHeight: aim point above the feet · angle: extra yaw (radians)
//   lookSide: shift the aim point to the subject's right (+) or left (-)
//   cut: snap instantly (a hard cut or whip pan) instead of easing · ease: easing speed · fov: radians
//   desaturate: drain color from the frame (activation beat) · clear: hand control back to gameplay

export const SHOTS = Object.freeze({
  "ult-activate": { mode: "behind", dist: 3.4, height: 1.6, lookHeight: 1.6, fov: 0.7, cut: true, desaturate: true },
  "ult-charge": { mode: "orbit", dist: 4.4, height: 0.35, lookHeight: 1.9, orbitSpeed: 1.8, fov: 0.85, ease: 7, desaturate: true },
  "ult-closeup": { mode: "front", dist: 2.5, height: 1.8, lookHeight: 1.75, angle: -0.65, lookSide: -0.4, fov: 0.62, cut: true },
  "ult-release": { mode: "wide", dist: 9, height: 3.2, lookHeight: 2.2, angle: 0.9, fov: 0.95, cut: true, ease: 4 },
  "ult-impact": { mode: "wide", dist: 10, height: 0.9, lookHeight: 0.9, angle: 2.1, fov: 0.95, cut: true },
  "ult-aftermath": { mode: "wide", dist: 15, height: 7, lookHeight: 1, angle: 2.4, fov: 0.9, ease: 1.5 },
  "ult-return": { clear: true },
});
