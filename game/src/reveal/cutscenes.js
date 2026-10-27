// The reveal's cutscenes (GDD §15.8; this folder is the sanctioned exception to §15.11). Merged into
// data/story/cutscenes.js CUTSCENES. Both play on the Lowmarket Bridge, Rook at (0, 2.4) facing north, him facing south.
//
//   ep48_crack  T3: the impact frame cracks the mask down the centre. It doesn't break. The camera holds on the cracked
//               mask. Blood runs from beneath it. He lifts his hand. Silence, wind only.
//   ep48_face   "The Face in the Smoke", the storyboard of §15.8 Phase 5, cut for cut (001–017): the clash, the
//               impact frame, the shockwave, black, smoke, Rook on their knees, a silhouette, the shards, the cord, the
//               eye, the hair, the scar, the smile, the face (held, in silence), Rook's eyes, one line, and the
//               Lighthouse Tune, all four notes at last. No villain laugh, no narrator, no flashback, no explanation.

const PI = Math.PI;
const ROOK = { x: 0, z: 2.4 }, HIM = { x: 0, z: 5.4 }, FACE = { x: 0, z: 6.2 };

export const REVEAL_CUTSCENES = {
  ep48_crack: {
    id: "ep48_crack",
    stage: "bridge",
    duration: 9.4,
    actors: [
      { id: "rook", look: "player", x: ROOK.x, z: ROOK.z, yaw: 0 },
      { id: "knight", look: "maskCracked", x: HIM.x, z: HIM.z, yaw: PI },
    ],
    camera: [
      { t: 0, pos: [5.4, 2.0, 3.9], look: [0, 1.6, 3.9], fov: 0.52 },                                // side on: the hit lands
      { t: 1.4, pos: [5.1, 2.0, 3.9], look: [0, 1.65, 3.9], fov: 0.5, ease: "linear" },
      { t: 1.4, cut: true, pos: [0.3, 2.0, 3.55], look: [0, 1.98, HIM.z], fov: 0.42, ecu: true },        // the mask, cracked
      { t: 4.6, pos: [0.25, 2.0, 3.85], look: [0, 1.98, HIM.z], fov: 0.4, ecu: true, ease: "linear" },
      { t: 4.6, cut: true, pos: [-1.3, 2.0, 0.5], look: [0, 1.9, HIM.z], fov: 0.5, ots: "rook" },          // over Rook's shoulder
      { t: 6.4, pos: [-1.25, 2.0, 0.6], look: [0, 1.9, HIM.z], fov: 0.48, ease: "linear" },
      { t: 6.4, cut: true, pos: [0.35, 1.97, 3.7], look: [0, 1.95, HIM.z], fov: 0.38, ecu: true },        // his hand comes up to the blood
      { t: 9.4, pos: [0.32, 1.97, 3.8], look: [0, 1.95, HIM.z], fov: 0.36, ecu: true, ease: "linear" },
    ],
    events: [
      { t: 0, flash: 0.12 }, { t: 0, sfx: "finisher" }, { t: 0.3, sfx: "clash" },
      { t: 1.6, sfx: "wind" }, { t: 5.0, sfx: "wind" },
      { t: 6.8, pose: { id: "knight", name: "hand" } },
    ],
  },

  ep48_face: {
    id: "ep48_face",
    stage: "bridge",
    duration: 27.6,
    actors: [
      { id: "rook", look: "player", x: ROOK.x, z: ROOK.z, yaw: 0 },
      { id: "knight", look: "maskCracked", x: HIM.x, z: HIM.z, yaw: PI },
      { id: "cal", look: "unmasked", x: FACE.x, z: FACE.z, yaw: PI, hidden: true },
    ],
    camera: [
      // 001 two-shot, profile: ink and black light meet. Push in.
      { t: 0, pos: [5.6, 2.0, 3.9], look: [0, 1.6, 3.9], fov: 0.54 },
      { t: 1.12, pos: [4.9, 2.0, 3.9], look: [0, 1.6, 3.9], fov: 0.5, ease: "in" },
      // 003 wide, high: the shockwave levels the bridge district. Crane up.
      { t: 1.12, cut: true, pos: [7, 8, -5], look: [0, 0.5, 4], fov: 0.8 },
      { t: 2.62, pos: [7.5, 14, -7], look: [0, 0.5, 4.5], fov: 0.82, ease: "out" },
      // 005 low and wide through smoke, the red sky beginning to clear. Slow dolly forward.
      { t: 3.62, cut: true, pos: [3.0, 0.7, -4.0], look: [0, 1.2, 4.5], fov: 0.72 },
      { t: 7.62, pos: [2.6, 0.75, -2.4], look: [0, 1.2, 4.5], fov: 0.7, ease: "linear" },
      // 006 Rook, on their knees, the grimoire smoking.
      { t: 7.62, cut: true, pos: [1.6, 1.9, 5.4], look: [0, 1.55, ROOK.z], fov: 0.66 },
      { t: 9.12, pos: [1.55, 1.9, 5.3], look: [0, 1.55, ROOK.z], fov: 0.66, ease: "linear" },
      // 007 through the smoke, past Rook: a standing silhouette.
      { t: 9.12, cut: true, pos: [-1.3, 1.8, 0.4], look: [0, 1.7, FACE.z], fov: 0.5, ots: "rook" },
      { t: 11.12, pos: [-1.25, 1.8, 0.5], look: [0, 1.7, FACE.z], fov: 0.46, ease: "linear" },
      // 008 insert: the mask, in pieces, falling onto stone.
      { t: 11.12, cut: true, pos: [1.2, 0.45, 4.4], look: [0.3, 0.05, 5.7], fov: 0.5, ecu: true },
      { t: 12.62, pos: [1.18, 0.45, 4.45], look: [0.3, 0.05, 5.7], fov: 0.5, ecu: true, ease: "linear" },
      // 009 ECU: a hand; a frayed red cord with a knot at the wrist. Slow tilt.
      { t: 12.62, cut: true, pos: [1.2, 1.1, 5.25], look: [0.75, 0.98, 6.1], fov: 0.34, ecu: true },
      { t: 14.12, pos: [1.2, 1.2, 5.25], look: [0.72, 1.06, 6.1], fov: 0.34, ecu: true, ease: "linear" },
      // 010 ECU: one eye opens; a faint ring of starlight in it that Cal never had.
      { t: 14.12, cut: true, pos: [0.16, 1.99, 5.3], look: [0.09, 1.97, FACE.z], fov: 0.2, ecu: true },  // his left eye (the ring is there)
      { t: 15.32, pos: [0.15, 1.99, 5.36], look: [0.09, 1.97, FACE.z], fov: 0.2, ecu: true, ease: "linear" },
      // 011 ECU: wind lifts the hair away from the face.
      { t: 15.32, cut: true, pos: [0.55, 2.25, 5.45], look: [0, 2.12, FACE.z], fov: 0.3, ecu: true },
      { t: 16.32, pos: [0.4, 2.25, 5.45], look: [0, 2.1, FACE.z], fov: 0.3, ecu: true, ease: "linear" },
      // 012 ECU: a new scar across the left brow. The pan continues.
      { t: 16.32, cut: true, pos: [0.42, 2.07, 5.4], look: [0.1, 2.03, FACE.z], fov: 0.26, ecu: true },  // the scar, across the left brow
      { t: 17.32, pos: [0.3, 2.07, 5.4], look: [0.1, 2.03, FACE.z], fov: 0.26, ecu: true, ease: "linear" },
      // 013 CU: the mouth. The same crooked half-smile, turning into a smirk.
      { t: 17.32, cut: true, pos: [0.12, 1.86, 5.4], look: [0, 1.86, FACE.z], fov: 0.3, ecu: true },
      { t: 18.32, pos: [0.12, 1.86, 5.42], look: [0, 1.86, FACE.z], fov: 0.3, ecu: true, ease: "linear" },
      // 014 MS: the full face. He tilts his head to the right. Slow push in, held three seconds. Silence.
      { t: 18.32, cut: true, pos: [0.36, 2.05, 3.4], look: [0, 1.98, FACE.z], fov: 0.5 },
      { t: 21.32, pos: [0.32, 2.05, 3.6], look: [0, 1.98, FACE.z], fov: 0.5, ease: "linear" },
      // 015 ECU: Rook's eyes. Snap zoom.
      { t: 21.32, cut: true, pos: [0.1, 1.62, 3.4], look: [0, 1.58, ROOK.z], fov: 0.34, ecu: true },
      { t: 21.92, pos: [0.08, 1.62, 3.3], look: [0, 1.58, ROOK.z], fov: 0.18, ecu: true, ease: "out" },
      // 016 CU: him, quiet, unprocessed.
      { t: 21.92, cut: true, pos: [0.22, 1.95, 4.9], look: [0, 1.92, FACE.z], fov: 0.4, ecu: true },
      { t: 24.42, pos: [0.2, 1.95, 4.95], look: [0, 1.92, FACE.z], fov: 0.4, ecu: true, ease: "linear" },
      // 017 CU: Rook's face. No words, one breath. The Lighthouse Tune, all four notes, like a march.
      { t: 24.42, cut: true, pos: [0.16, 1.6, 3.55], look: [0, 1.52, ROOK.z], fov: 0.42, ecu: true },
      { t: 27.6, pos: [0.14, 1.6, 3.5], look: [0, 1.52, ROOK.z], fov: 0.4, ecu: true, ease: "linear" },
    ],
    events: [
      { t: 0, sfx: "clash" }, { t: 0.5, sfx: "clash" },
      { t: 1.0, flash: 0.12 }, { t: 1.0, sfx: "slam" },                         // 002 the impact frame: one enormous crack
      { t: 1.2, cue: "collapse2" },
      { t: 2.62, fade: "out", dur: 0 },                                       // 004 black. Silence.
      { t: 3.0, hide: "knight" }, { t: 3.0, show: "cal" }, { t: 3.0, pose: { id: "rook", name: "bow" } },
      { t: 3.62, fade: "in", dur: 0.8 }, { t: 3.7, sfx: "wind" },
      { t: 11.2, cue: "maskShards" },
      { t: 15.4, sfx: "wind" },
      { t: 19.0, pose: { id: "cal", name: "tilt" } },
      { t: 22.2, caption: "\"Told you not to wait up.\"" },
      { t: 24.3, caption: null },
      { t: 24.6, sfx: "tuneMarch" },
    ],
  },
};
