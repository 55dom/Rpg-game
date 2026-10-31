// The reveal's cutscenes (GDD §15.8; this folder is the sanctioned exception to §15.11). Merged into
// data/story/cutscenes.js CUTSCENES. Both play on the Lowmarket Bridge, Rook at (0, 2.4) facing north, him facing south.
//
//   ep48_crack  T3: the impact frame cracks the mask down the centre. It doesn't break. The camera holds on the cracked
//               mask. Blood runs from beneath it. He lifts his hand. Silence, wind only.
//   ep48_face   "The Face in the Smoke", the storyboard of §15.8 Phase 5, cut for cut (001–017): the clash, the
//               impact frame, the shockwave, black, smoke, Rook on their knees, a silhouette, the shards, the cord, the
//               eye, the hair, the scar, the smile, the face (held, in silence), Rook's eyes, one line, and the
//               Lighthouse Tune, all four notes at last. No villain laugh, no narrator, no flashback, no explanation.

//
//   Backlash (Ep 49; docs/BACKLASH.md §21):
//   ep49_in         CIN-00: "Then don't just listen." A golden door opens around the lens; the colour drains; white.
//   ep49_march      CIN-01: the column on the march; the soldier beside him falls. "Continue formation." "Mind the step."
//   ep49_sacrifice  CIN-04: the Saint's other prayer. She dissolves into light; the Knight flares; she comes back.
//   ep49_void       CIN-05B: the dying view, the apparent death, the void, the two who come through it, and the grin.
//                   No subtitles, no captions for what they say: it's sound and nothing else (BACKLASH.md §18.5).
//
//   Ep 50:
//   ep50_return     CIN-09: the match cut (the same grin, on the face he has now); the golden frame folds shut behind
//                   him; full colour; the debris finishes falling; Rook, and Cal, exactly where they stood.
//   ep50_chain      the Lantern Chain: every Lantern's team attack in sequence, and he's hit, genuinely, for the first time.

const PI = Math.PI;
const ROOK = { x: 0, z: 2.4 }, HIM = { x: 0, z: 5.4 }, FACE = { x: 0, z: 6.2 };

// ---- Backlash (Ep 49) ----

// CIN-01: a two-file column marching north up the east side of the camp; he's the right file, second rank.
const COL = { left: 6.0, right: 7.6, z0: -12, gap: 2.2, speed: 1.0, rows: 4 };
const colZ = (r, t) => COL.z0 - r * COL.gap + COL.speed * t;
const FALL_T = 3.0, FALLEN_Z = colZ(1, FALL_T);
const column = () => {
  const actors = [], moves = [];
  for (let r = 0; r < COL.rows; r++) for (const side of ["left", "right"]) {
    const id = r === 1 ? (side === "right" ? "eleven" : "fallen") : `s${r}${side[0]}`;
    actors.push({ id, look: id === "eleven" ? "ashSoldier" : "lineAlly", x: COL[side], z: colZ(r, 0), yaw: 0 });
    moves.push({ t: 0, move: { id, to: [COL[side], id === "fallen" ? FALLEN_Z : colZ(r, 12)], dur: id === "fallen" ? FALL_T : 12, ease: "linear" } });
  }
  return { actors, moves };
};
const COLUMN = column();

// CIN-04: the heroes surrounded in the yard; he is on the south side of the ring, not moving.
const SAINT = { x: 0, z: -3.6 }, SHIELD = { x: 0, z: -5.0 }, WATCHER = { x: -3.2, z: -8.6 };
const ring = Array.from({ length: 5 }, (_, i) => {
  const a = (-2 + i) * PI / 3; // round the north, east and west of them, leaving him the south
  return { id: `r${i}`, look: "lineAlly", x: SAINT.x + Math.sin(a) * 4.8, z: SAINT.z + Math.cos(a) * 4.8, yaw: a + PI };
});

// CIN-05B: he lies on his back on the runner, feet toward the throne; his head is about two metres south of where he
// lies (the rig lies back from its feet). The void opens two metres behind his head.
const BODY = { x: 0.8, z: -4.2 }, HEAD = { x: 0.8, y: 0.55, z: -6.09 }, VOID = { x: 0.8, y: 1.5, z: -8.4 };
const LIFT = { x: -0.1, z: -5.4 }, LIFT_TO = { x: 0.4, z: -7.7 };
const CARRY_DIR = (() => { const dx = LIFT_TO.x - LIFT.x, dz = LIFT_TO.z - LIFT.z, d = Math.hypot(dx, dz); return { x: dx / d, z: dz / d, yaw: Math.atan2(dx, dz) }; })();
const carried = (at) => [at.x + CARRY_DIR.x * 0.95, at.z + CARRY_DIR.z * 0.95]; // his feet ahead, his head down the back
const CARRIED_HEAD = (() => { const [x, z] = carried(LIFT_TO); return { x: x - CARRY_DIR.x * 1.9, y: 1.8, z: z - CARRY_DIR.z * 1.9 }; })();
const walkZ = (t) => -7.2 + 1.2 * (t - 64); // the two of them, walking north past him (cuts 025–028)

// ---- Ep 50 ----
const CAL50 = { x: 0, z: 7.2 }, ROOK50 = { x: 0, z: 2.4 };
const squad50 = [
  { id: "juno", look: "juno", x: -1.8, z: -4.0, yaw: 0.3 }, { id: "bas", look: "bas", x: 2.4, z: -2.8, yaw: -0.4 },
  { id: "dagrun", look: "dagrun", x: 3.6, z: -0.4, yaw: -0.6 },
];

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
  ep49_in: {
    id: "ep49_in",
    stage: "bridge",
    duration: 7.4,
    actors: [
      { id: "rook", look: "player", x: ROOK.x, z: ROOK.z, yaw: 0 },
      { id: "cal", look: "unmasked", x: FACE.x, z: FACE.z, yaw: PI },
    ],
    camera: [
      // 006 over Rook's shoulder: he raises his hand toward the camera. Slow dolly back.
      { t: 0, pos: [-1.2, 2.0, 0.7], look: [0, 1.85, FACE.z], fov: 0.46, ots: "rook" },
      { t: 2.6, pos: [-1.25, 2.0, 0.5], look: [0, 1.85, FACE.z], fov: 0.48, ease: "linear" },
      // 007 POV (Rook): a golden door frame opens around the lens; the colour drains to nothing.
      { t: 2.6, cut: true, pos: [0, 1.7, 0.9], look: [0, 1.7, FACE.z], fov: 0.62 },
      { t: 4.6, pos: [0, 1.7, 1.3], look: [0, 1.7, FACE.z], fov: 0.62, ease: "linear" },
      // 008 white: push through it.
      { t: 6.2, pos: [0, 1.7, 4.8], look: [0, 1.7, FACE.z + 4], fov: 0.7, ease: "in" },
      { t: 7.4, pos: [0, 1.7, 5.0], look: [0, 1.7, FACE.z + 4], fov: 0.72, ease: "linear" },
    ],
    events: [
      { t: 0.6, pose: { id: "cal", name: "raise" } }, { t: 2.6, hide: "rook" }, // his eyes now: the door opens round the lens
      { t: 2.7, tear: { kind: "gold", at: [0, 1.6, 4.3], r: 0.7, life: 4.4, grow: 0.7, pane: false } }, // the frame round the lens, and him through it
      { t: 3.4, memory: true }, { t: 3.4, sfx: "hum" },
      { t: 5.2, flash: 2.4 }, { t: 5.4, sfx: "heartbeat" }, { t: 5.4, hide: "cal" }, // white
    ],
  },

  ep49_march: {
    id: "ep49_march",
    stage: "camp",
    duration: 10.2,
    actors: COLUMN.actors,
    camera: [
      // 001 wide: the column on the march, from above the road. Tracking alongside.
      { t: 0, pos: [0.4, 4.4, -15.2], look: [6.8, 1.0, -14.3], fov: 0.62 },
      { t: 2.4, pos: [0.4, 4.4, -12.8], look: [6.8, 1.0, -11.9], fov: 0.62, ease: "linear" },
      // 002 MS: the soldier beside him jerks. An arrow in the neck seam.
      { t: 2.4, cut: true, pos: [4.27, 1.4, -12.6], look: [COL.left, 1.85, -11.6], fov: 0.7 },
      { t: 3.2, pos: [4.27, 1.15, -12.3], look: [COL.left, 1.6, -11.3], fov: 0.7, ease: "linear" },
      // 003 low angle: he falls out of frame.
      { t: 3.2, cut: true, pos: [4.94, 0.7, -12.46], look: [COL.left, 0.3, FALLEN_Z - 0.2], fov: 0.62 },
      // 004 MS: his faceplate turns toward the body. The only thing that moves. Silence.
      { t: 4.0, cut: true, pos: [9.43, 2.0, -7.62], look: [COL.right, 1.85, colZ(1, 4.2)], fov: 0.46 },
      { t: 5.0, pos: [9.43, 2.0, -6.62], look: [COL.right, 1.85, colZ(1, 5.2)], fov: 0.46, ease: "linear" },
      // 005 wide from behind: the column doesn't slow. The rank behind steps into the gap.
      { t: 5.0, cut: true, pos: [5.76, 5.6, -17.93], look: [6.8, 1.0, -10], fov: 0.55 },
      // 006 low, ground level: boots stepping over the body. The body in the foreground.
      { t: 6.4, cut: true, pos: [5.06, 0.3, -11.0], look: [6.1, 0.4, -11.6], fov: 0.78, ecu: true },
      // 007 MS, from the gap where the other one was: him, still looking back. Hold.
      { t: 8.6, cut: true, pos: [5.1, 3.2, -5.6], look: [COL.right, 1.85, -5.6], fov: 0.46 },
      { t: 10.2, pos: [5.1, 3.2, -4.0], look: [COL.right, 1.85, -4.0], fov: 0.46, ease: "linear" },
    ],
    events: [
      ...COLUMN.moves,
      { t: 0, sfx: "drums" },
      { t: 2.85, sfx: "arrow" }, { t: FALL_T, pose: { id: "fallen", name: "down" } }, { t: 3.3, sfx: "slam" },
      { t: 4.1, sfx: "wind" }, { t: 4.3, pose: { id: "eleven", name: "tilt" } },
      { t: 5.2, caption: "\"Continue formation.\"" }, { t: 6.3, caption: null },
      { t: 6.7, caption: "\"Mind the step.\"" }, { t: 8.4, caption: null },
      { t: 8.8, sfx: "drums" },
    ],
  },

  ep49_sacrifice: {
    id: "ep49_sacrifice",
    stage: "camp",
    duration: 23.0,
    actors: [
      { id: "maelis", look: "heroSaint", x: SAINT.x, z: SAINT.z, yaw: PI },
      { id: "knight", look: "heroKnight", x: SHIELD.x, z: SHIELD.z, yaw: PI },
      { id: "knightBright", look: "heroKnightSurge", x: SHIELD.x, z: SHIELD.z, yaw: PI, hidden: true },
      { id: "teo", look: "heroArcher", x: 1.7, z: -2.8, yaw: 2.3 },
      { id: "reborn", look: "heroSaint", x: 6, z: 8, yaw: PI, hidden: true, pose: "kneel" },
      { id: "eleven", look: "ashSoldier", x: WATCHER.x, z: WATCHER.z, yaw: 0.57 },
      ...ring,
    ],
    camera: [
      // 001 wide: the heroes encircled; the Knight bleeding; the archer out of arrows. Handheld drift.
      { t: 0, pos: [7, 4.5, -12], look: [0, 1, -4], fov: 0.7 },
      { t: 2.4, pos: [6.4, 4.3, -11.4], look: [0, 1, -4], fov: 0.7, ease: "linear" },
      // 002 MS: she drops to her knees.
      { t: 2.4, cut: true, pos: [-3.18, 1.6, -0.42], look: [SAINT.x, 1.5, SAINT.z], fov: 0.55 },
      { t: 3.9, pos: [-3.18, 1.3, -0.42], look: [SAINT.x, 1.2, SAINT.z], fov: 0.55, ease: "linear" },
      // 004 MS: the Knight plants himself in front of her, shield up.
      { t: 3.9, cut: true, pos: [1.52, 3.4, -6.98], look: [SHIELD.x, 1.85, SHIELD.z], fov: 0.55 },
      // 005 wide: soldiers pile toward them; the archer swings his bow like a club.
      { t: 5.6, cut: true, pos: [0.91, 6, 2.94], look: [0, 1, -4], fov: 0.7 },
      // 006 over his shoulder, unmoving in the chaos, watching her. The mix narrows to her voice.
      { t: 7.2, cut: true, pos: [-2.49, 3, -9.61], look: [SAINT.x, 1.3, SAINT.z], fov: 0.45, ots: "eleven" },
      // 008 ECU: his faceplate slits.
      { t: 9.6, cut: true, pos: [-3.12, 2.1, -8.01], look: [WATCHER.x, 1.95, WATCHER.z], fov: 0.3, ecu: true },
      // 009 wide: she dissolves into light. Slow.
      { t: 10.6, cut: true, pos: [0.78, 4.8, 1.95], look: [0, 1.2, -4], fov: 0.6 },
      { t: 13.4, pos: [0.7, 4.6, 1.6], look: [0, 1.2, -4], fov: 0.6, ease: "linear" },
      // 010 MS: the Knight flares; he stands taller. Snap zoom.
      { t: 13.4, cut: true, pos: [1.98, 3.8, -6.52], look: [SHIELD.x, 1.85, SHIELD.z], fov: 0.6 },
      { t: 13.9, pos: [1.98, 3.8, -6.52], look: [SHIELD.x, 1.85, SHIELD.z], fov: 0.5, ease: "out" },
      { t: 14.9, pos: [1.98, 3.8, -6.52], look: [SHIELD.x, 1.85, SHIELD.z], fov: 0.5 },
      // 011 wide: silence on the field. Nobody moves.
      { t: 14.9, cut: true, pos: [4.87, 4.6, -10.35], look: [0, 1, -4], fov: 0.6 },
      // 012 a pillar of light at the edge of the field; she is inside it, kneeling, breathing. Slow push in.
      { t: 16.9, cut: true, pos: [8.0, 2.6, 11.46], look: [6, 1.4, 8], fov: 0.58 },
      { t: 19.9, pos: [7.9, 2.58, 11.3], look: [6, 1.4, 8], fov: 0.58, ease: "linear" },
      // 013 soldiers stumbling backward. He does not move.
      { t: 19.9, cut: true, pos: [-2.68, 4.4, -3.03], look: [WATCHER.x, 1.4, WATCHER.z + 1.6], fov: 0.6 },
      // 014 CU: him. His head tilts.
      { t: 21.4, cut: true, pos: [-3.1, 1.8, -7.81], look: [WATCHER.x, 1.9, WATCHER.z], fov: 0.42, ecu: true },
      { t: 23.0, pos: [-3.1, 1.82, -7.85], look: [WATCHER.x, 1.9, WATCHER.z], fov: 0.42, ecu: true, ease: "linear" },
    ],
    events: [
      { t: 0, sfx: "drums" },
      { t: 2.5, pose: { id: "maelis", name: "kneel" } }, { t: 2.6, sfx: "hymn" },
      { t: 4.0, pose: { id: "knight", name: "raise" } }, { t: 4.1, caption: "\"Keep going!\"" }, { t: 5.4, caption: null },
      ...ring.map((r, i) => ({ t: 5.7 + i * 0.1, move: { id: r.id, to: [r.x + (SAINT.x - r.x) * 0.15, r.z + (SAINT.z - r.z) * 0.15], dur: 0.8 } })),
      { t: 6.2, pose: { id: "teo", name: "fist" } }, { t: 6.3, sfx: "hit" },
      { t: 7.3, sfx: "hymn" },
      { t: 10.7, sfx: "charge" }, { t: 10.9, flash: 0.25 }, { t: 11.0, hide: "maelis" },
      { t: 13.5, hide: "knight" }, { t: 13.5, show: "knightBright" }, { t: 13.5, sfx: "slam" }, { t: 13.6, sfx: "hymn" },
      { t: 16.9, cue: "pillar" }, { t: 17.0, show: "reborn" }, { t: 17.4, sfx: "breath" },
      ...ring.map((r, i) => ({ t: 20.0 + (i % 3) * 0.08, move: { id: r.id, to: [r.x + (r.x - SAINT.x) * 0.25, r.z + (r.z - SAINT.z) * 0.25], dur: 1.0 } })),
      { t: 21.6, pose: { id: "eleven", name: "tilt" } },
      { t: 22.9, cue: "pillarOff" },
    ],
  },

  ep49_void: {
    id: "ep49_void",
    stage: "throne",
    duration: 92.5,
    actors: [
      { id: "eleven", look: "ashSoldierBare", x: BODY.x, z: BODY.z, yaw: 0, down: true },
      { id: "knight", look: "heroKnightSurge", x: -0.6, z: -9.8, yaw: 0 },
      { id: "knightBlaze", look: "heroKnightBlaze", x: -0.9, z: 11.6, y: 1.2, yaw: 0, hidden: true },
      { id: "maelis", look: "heroSaint", x: -1.8, z: -10.6, yaw: 0 },
      { id: "king", look: "demonKing", x: 0, z: 17.4, y: 1.0, yaw: PI, pose: "sit" },
      { id: "ghorran", look: "commanderL", x: -3.2, z: 15.6, yaw: PI, hidden: true }, // they come back to guard the throne
      { id: "vaelith", look: "commanderR", x: 3.2, z: 15.6, yaw: PI, hidden: true },
      { id: "robedL", look: "commanderLRobed", x: -2.4, z: 15.2, yaw: 0, hidden: true, pose: "kneel" },
      { id: "robedR", look: "commanderRRobed", x: 2.4, z: 15.2, yaw: 0, hidden: true, pose: "kneel" },
      { id: "unkA", look: "unkA", x: VOID.x, z: VOID.z, yaw: 0, hidden: true },
      { id: "unkB", look: "unkB", x: VOID.x, z: VOID.z, yaw: 0, hidden: true },
      { id: "carried", look: "ashSoldierBare", x: carried(LIFT)[0], z: carried(LIFT)[1], y: 1.25, yaw: CARRY_DIR.yaw, down: true, hidden: true },
      { id: "grin", look: "ashSoldierGrin", x: carried(LIFT_TO)[0], z: carried(LIFT_TO)[1], y: 1.25, yaw: CARRY_DIR.yaw, down: true, hidden: true },
    ],
    camera: [
      // 001 low wide: his body on the stone, the glaive skidding away, fire and smoke behind. Held on the impact.
      { t: 0, pos: [3.4, 0.6, -9.4], look: [BODY.x, 0.35, BODY.z - 0.8], fov: 0.66 },
      // 002 ground level: the Knight's boots step over him without pausing; the Saint's hem follows.
      { t: 1.5, cut: true, pos: [2.1, 0.7, -5.0], look: [0.6, 0.45, -5.0], fov: 0.72, ecu: true },
      // 003 CU: his face on the stone, the faceplate split half away. Behind him, the chamber, far off.
      { t: 4.0, cut: true, pos: [HEAD.x + 1.2, 1.35, HEAD.z + 0.45], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.44, ecu: true },
      // 004 past his head, up the chamber: the King, seated; the Knight's charge stops in mid-air.
      { t: 7.0, cut: true, pos: [HEAD.x + 0.2, 0.75, HEAD.z - 1.0], look: [0, 2.4, 14], fov: 0.3 },
      // 005 back to him. A slow blink.
      { t: 9.5, cut: true, pos: [HEAD.x + 1.2, 1.35, HEAD.z + 0.45], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.42, ecu: true },
      // 006 up the chamber: she kneels; her light pours into the Knight, who blazes. "...Five."
      { t: 11.0, cut: true, pos: [HEAD.x + 0.2, 0.75, HEAD.z - 1.0], look: [-0.3, 2.0, 11], fov: 0.3 },
      // 007 back to him. Slower.
      { t: 14.0, cut: true, pos: [HEAD.x + 1.15, 1.3, HEAD.z + 0.42], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.4, ecu: true },
      // 008 one glance from the throne: the Knight thrown across the chamber; she falls; the light takes them.
      { t: 15.5, cut: true, pos: [HEAD.x + 0.2, 0.75, HEAD.z - 1.0], look: [-1.2, 2.0, 9], fov: 0.34 },
      // 009 back to him. Nearly closed.
      { t: 18.5, cut: true, pos: [HEAD.x + 1.1, 1.25, HEAD.z + 0.4], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.38, ecu: true },
      // 010 the King, motionless, looking at his own open palm.
      { t: 20.0, cut: true, pos: [HEAD.x + 0.2, 0.75, HEAD.z - 1.0], look: [0, 2.8, 16], fov: 0.24 },
      // 011 time passes: the two Commanders kneel; the aura goes out of him into them, and they change.
      { t: 22.5, cut: true, pos: [2.4, 1.0, -5.8], look: [-0.6, 2.0, 17], fov: 0.34 },
      // 011a the King rises, walks behind his throne, and lies down in a black coffin. The lid closes.
      { t: 29.99, pos: [2.4, 1.0, -3.8], look: [-0.6, 2.0, 19], fov: 0.34, ease: "linear" },
      // 012 ECU: his mouth, behind the broken plate. Three syllables nobody can make out.
      { t: 30.0, cut: true, pos: [HEAD.x + 0.7, 1.15, HEAD.z + 0.3], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.5, ecu: true },
      // 013 CU, as 003: one last breath out. Then nothing.
      { t: 32.5, cut: true, pos: [HEAD.x + 1.2, 1.35, HEAD.z + 0.45], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.44, ecu: true },
      // 014–016 the hold. Do not cut. A ripple in the air behind his head.
      { t: 43.5, pos: [HEAD.x + 1.2, 1.35, HEAD.z + 0.45], look: [HEAD.x, 0.5, HEAD.z + 0.1], fov: 0.44, ecu: true },
      // 017 wide over the body: the air bends round a point behind him; light drains toward it. Slow crane up.
      { t: 43.5, cut: true, pos: [3.6, 1.6, -2.0], look: [VOID.x, 1.0, VOID.z + 0.8], fov: 0.62 },
      { t: 46.5, pos: [3.9, 3.2, -1.6], look: [VOID.x, 1.0, VOID.z + 0.8], fov: 0.62, ease: "linear" },
      // 018 MS: a perfect black circle.
      { t: 46.5, cut: true, pos: [1.5, 1.6, -4.6], look: [VOID.x, VOID.y, VOID.z], fov: 0.55 },
      // 019 wide, high: the instant it's open, everything stops.
      { t: 49.5, cut: true, pos: [-4.5, 7.5, -13], look: [0.5, 1, -2], fov: 0.8 },
      // 020 the only moving camera: a slow dolly through the frozen hall, ending on the coffin before an empty throne.
      { t: 51.5, cut: true, pos: [-3.6, 2.2, 1.5], look: [0, 1.6, 19], fov: 0.5 },
      { t: 55.5, pos: [0.4, 2.4, 6.5], look: [0, 1.4, 19], fov: 0.46, ease: "linear" },
      // 021 ECU, off-centre: his eye. The lid lifts.
      { t: 55.5, cut: true, pos: [HEAD.x + 0.65, 1.2, HEAD.z + 0.2], look: [HEAD.x + 0.05, 0.55, HEAD.z], fov: 0.45, ecu: true },
      // 022–023 MS, the void: one figure steps out onto the ash, then the other.
      { t: 56.5, cut: true, pos: [1.51, 2.4, -4.22], look: [0.6, 1.5, -7.6], fov: 0.6 },
      { t: 60.99, pos: [2.11, 2.4, -4.02], look: [1.2, 1.5, -7.4], fov: 0.6, ease: "linear" },
      // 024 low wide: both standing still, looking out over the frozen hall.
      { t: 61.0, cut: true, pos: [1.0, 0.8, -4.3], look: [1.0, 1.6, -7.3], fov: 0.7 },
      // 025 from behind: they walk; one steps around a frozen ember without looking at it.
      { t: 64.0, cut: true, pos: [-3.8, 1.8, -11.1], look: [0.8, 1.4, -6.5], fov: 0.6 },
      { t: 66.99, pos: [-3.8, 1.8, -7.6], look: [0.8, 1.4, -3.0], fov: 0.6, ease: "linear" },
      // 026–028 two-shot, profile, walking. What they say is never written down.
      { t: 67.0, cut: true, pos: [3.1, 1.6, walkZ(67) + 5.54], look: [0.8, 1.45, walkZ(67)], fov: 0.55 },
      { t: 71.99, pos: [3.1, 1.6, walkZ(72) + 5.54], look: [0.8, 1.45, walkZ(72)], fov: 0.55, ease: "linear" },
      // 028a ground level: his face soft in the foreground; their legs walking away beyond him. From the ground, two words.
      { t: 72.0, cut: true, pos: [0.8, 0.3, -6.5], look: [0.8, 0.7, 2], fov: 0.5 },
      // 028b MS: both stop mid-step. For the first time they move out of step: one head turns first.
      { t: 73.5, cut: true, pos: [0.8, 1.6, 8.1], look: [0.8, 1.5, 3.6], fov: 0.5 },
      // 028c CU: the only thing moving in the frozen world. He lifts his head an inch off the stone.
      { t: 75.0, cut: true, pos: [HEAD.x + 1.0, 1.25, HEAD.z + 0.45], look: [HEAD.x, 0.6, HEAD.z], fov: 0.4, ecu: true },
      // 028d two-shot: one crouches beside him, studying him. A question; an answer.
      { t: 77.0, cut: true, pos: [5.06, 1.2, -1.95], look: [0.3, 0.8, -5.6], fov: 0.6 },
      // 029 MS: the other's mask turns to the first; a small, unmistakable lift in the shoulders.
      { t: 79.5, cut: true, pos: [2.7, 1.8, -4.4], look: [2.7, 1.7, -7.4], fov: 0.45 },
      // 030 low angle: lifted onto a shoulder in one smooth motion. No strain.
      { t: 81.0, cut: true, pos: [1.73, 0.3, -3.02], look: [LIFT.x, 1.4, LIFT.z], fov: 0.6 },
      // 031 wide: carried toward the void; the other a step behind.
      { t: 83.0, cut: true, pos: [-2.43, 3.2, -9.63], look: [0.4, 1.3, -6.8], fov: 0.6 },
      { t: 85.99, pos: [-2.43, 3.2, -10.23], look: [0.4, 1.3, -7.4], fov: 0.6, ease: "linear" },
      // 032 orbit, close, round his face over the shoulder. His eyes are open. Calm.
      { t: 86.0, cut: true, pos: [CARRIED_HEAD.x + 1.0, CARRIED_HEAD.y + 1.0, CARRIED_HEAD.z - 0.3], look: [CARRIED_HEAD.x, CARRIED_HEAD.y, CARRIED_HEAD.z], fov: 0.45, ecu: true, ots: "unkA" },
      { t: 87.5, pos: [CARRIED_HEAD.x + 0.75, CARRIED_HEAD.y + 1.1, CARRIED_HEAD.z - 0.65], look: [CARRIED_HEAD.x, CARRIED_HEAD.y, CARRIED_HEAD.z], fov: 0.45, ecu: true },
      { t: 89.0, pos: [CARRIED_HEAD.x + 0.25, CARRIED_HEAD.y + 1.15, CARRIED_HEAD.z - 0.8], look: [CARRIED_HEAD.x, CARRIED_HEAD.y, CARRIED_HEAD.z], fov: 0.45, ecu: true },
      // 033 ECU: a slight smile. 034: the smile becomes a grin. (From the body's side, so his face is the right way up.)
      { t: 89.0, cut: true, pos: [CARRIED_HEAD.x + 0.1, CARRIED_HEAD.y + 1.25, CARRIED_HEAD.z - 0.42], look: [CARRIED_HEAD.x, CARRIED_HEAD.y + 0.1, CARRIED_HEAD.z], fov: 0.42, ecu: true },
      { t: 92.5, pos: [CARRIED_HEAD.x + 0.1, CARRIED_HEAD.y + 1.1, CARRIED_HEAD.z - 0.38], look: [CARRIED_HEAD.x, CARRIED_HEAD.y + 0.1, CARRIED_HEAD.z], fov: 0.38, ecu: true, ease: "linear" },
    ],
    events: [
      { t: 0, cue: "lidOpen" }, { t: 0, cue: "unfold" },
      { t: 0.1, sfx: "slam" }, { t: 0.4, sfx: "drums" },
      // The Knight walks over him into the chamber, the Saint behind; the charge, held in the air by nothing.
      { t: 1.5, move: { id: "knight", to: [-0.9, 9.6], dur: 5.6 } }, { t: 1.7, move: { id: "maelis", to: [-3.2, 8.0], dur: 6.2 } },
      { t: 2.6, sfx: "step" }, { t: 3.2, sfx: "step" },
      { t: 4.2, sfx: "breath" }, { t: 6.8, sfx: "breath" },
      { t: 7.2, move: { id: "knight", to: [-0.9, 11.6, 1.2], dur: 0.6 } }, { t: 7.3, sfx: "swingHeavy" },
      { t: 9.6, sfx: "breath" },
      // Her light into him. "...Five."
      { t: 11.1, pose: { id: "maelis", name: "kneel" } }, { t: 11.2, sfx: "hymn" },
      { t: 12.0, flash: 0.12 }, { t: 12.0, hide: "knight" }, { t: 12.0, show: "knightBlaze" },
      { t: 12.6, caption: "\"...Five.\"" }, { t: 13.8, caption: null },
      { t: 14.2, sfx: "breath" },
      // One glance.
      { t: 15.8, move: { id: "knightBlaze", to: [-4.0, 6.0, 0], dur: 0.35, back: true } }, { t: 15.8, sfx: "slam" },
      { t: 16.0, pose: { id: "maelis", name: "down" } }, { t: 16.2, pose: { id: "knightBlaze", name: "down" } },
      { t: 16.6, cue: "pillar" }, { t: 16.7, sfx: "hymn" },
      { t: 17.4, hide: "knightBlaze" }, { t: 17.4, hide: "maelis" }, { t: 18.2, cue: "pillarOff" },
      { t: 18.6, sfx: "breath" },
      { t: 20.1, pose: { id: "king", name: "hand" } },
      // Minutes later, through smoke: the Commanders kneel, and the aura goes out of him into them.
      { t: 22.5, show: "ghorran" }, { t: 22.5, show: "vaelith" }, { t: 22.5, face: ["ghorran", "king"] }, { t: 22.5, face: ["vaelith", "king"] },
      { t: 22.6, pose: { id: "ghorran", name: "kneel" } }, { t: 22.6, pose: { id: "vaelith", name: "kneel" } },
      { t: 23.0, sfx: "hum" },
      { t: 23.4, tear: { kind: "black", at: [-3.2, 1.6, 15.6], r: 0.9, life: 2.2 } }, { t: 23.6, tear: { kind: "black", at: [3.2, 1.6, 15.6], r: 0.9, life: 2.2 } },
      { t: 24.6, hide: "ghorran" }, { t: 24.6, hide: "vaelith" }, { t: 24.6, show: "robedL" }, { t: 24.6, show: "robedR" },
      // He rises, for the first and only time, and lies down behind his throne. The lid closes.
      { t: 26.6, pose: { id: "king", name: "none" } },
      { t: 26.8, move: { id: "king", to: [-2.2, 19.6, 0.6], dur: 1.4 } }, { t: 28.3, move: { id: "king", to: [0, 20.6, 0.6], dur: 0.9 } },
      { t: 29.0, face: ["robedL", "king"] }, { t: 29.0, face: ["robedR", "king"] },
      { t: 29.3, hide: "king" }, { t: 29.3, cue: "lidClose" }, { t: 29.8, sfx: "slam" },
      { t: 29.95, hide: "robedL" }, { t: 29.95, hide: "robedR" },
      // Three syllables, under the breath. One last breath out. Then nothing, for far too long.
      { t: 30.7, sfx: "unkSpeechFaint" }, { t: 32.6, sfx: "breath" },
      // A click. The void.
      { t: 42.6, sfx: "click" },
      { t: 43.5, tear: { kind: "void", at: [VOID.x, VOID.y, VOID.z], r: 1.4, life: 49, grow: 3.2 } }, { t: 43.5, sfx: "voidOpen" },
      { t: 48.5, sfx: "voidOpen" },
      // Two of them, out of it. Their footsteps are the only clean sound in the world.
      { t: 56.6, show: "unkA" }, { t: 56.8, move: { id: "unkA", to: [0.4, -7.2], dur: 1.0 } }, { t: 57.0, sfx: "step" },
      { t: 59.1, show: "unkB" }, { t: 59.2, move: { id: "unkB", to: [1.6, -7.4], dur: 1.0 } }, { t: 59.5, sfx: "step" },
      { t: 61.4, sfx: "heartbeat" },
      { t: 64.0, move: { id: "unkA", to: [-0.2, walkZ(72)], dur: 8 } }, { t: 64.0, move: { id: "unkB", to: [1.9, walkZ(72) + 0.2], dur: 8 } },
      ...[64.3, 64.9, 65.5, 66.1, 66.7].map((t) => ({ t, sfx: "step" })),
      { t: 67.3, sfx: "unkSpeechA" }, { t: 69.2, sfx: "unkSpeechB" }, { t: 70.8, sfx: "unkSpeechA" },
      { t: 72.0, move: { id: "unkA", to: [-0.3, walkZ(72) + 1.2], dur: 1.4 } }, { t: 72.0, move: { id: "unkB", to: [1.9, walkZ(72) + 1.4], dur: 1.4 } },
      { t: 72.6, sfx: "unkSpeechFaint" },
      { t: 73.7, face: ["unkB", "eleven"] }, { t: 74.3, face: ["unkA", "eleven"] },
      { t: 75.0, move: { id: "unkA", to: [LIFT.x, LIFT.z], dur: 1.8 } }, { t: 75.2, move: { id: "unkB", to: [2.7, -7.4], dur: 1.8 } },
      { t: 75.1, pose: { id: "eleven", name: "tilt" } }, { t: 75.5, sfx: "unkSpeechFaint" },
      { t: 76.9, face: ["unkA", "eleven"] }, { t: 76.9, pose: { id: "unkA", name: "kneel" } }, { t: 77.0, face: ["unkB", "eleven"] },
      { t: 77.4, sfx: "unkSpeechA" }, { t: 78.6, sfx: "unkSpeechFaint" },
      { t: 79.6, face: ["unkB", "unkA"] }, { t: 80.1, pose: { id: "unkB", name: "hand" } },
      // Up, onto a shoulder, in one motion; and back to the void.
      { t: 81.3, pose: { id: "unkA", name: "none" } }, { t: 81.3, hide: "eleven" }, { t: 81.3, show: "carried" },
      { t: 81.3, move: { id: "unkA", to: [LIFT.x + CARRY_DIR.x * 0.08, LIFT.z + CARRY_DIR.z * 0.08], dur: 0.1 } }, // a step toward the void: turned to it
      { t: 83.0, move: { id: "unkA", to: [LIFT_TO.x, LIFT_TO.z], dur: 2.8 } }, { t: 83.0, move: { id: "carried", to: [...carried(LIFT_TO), 1.25], dur: 2.8 } },
      { t: 83.4, move: { id: "unkB", to: [1.9, -7.9], dur: 2.4 } },
      ...[83.3, 83.9, 84.5, 85.1, 85.7].map((t) => ({ t, sfx: "step" })),
      // The smile; then the grin.
      { t: 90.5, hide: "carried" }, { t: 90.5, show: "grin" },
    ],
  },
  ep50_return: {
    id: "ep50_return",
    stage: "bridge",
    duration: 8.1,
    actors: [
      { id: "rook", look: "player", x: ROOK50.x, z: ROOK50.z, yaw: 0 },
      { id: "calGrin", look: "unmaskedGrin", x: CAL50.x, z: CAL50.z, yaw: PI },
      { id: "cal", look: "unmasked", x: CAL50.x, z: CAL50.z, yaw: PI, hidden: true },
      ...squad50,
    ],
    camera: [
      // 000 the match cut: the same grin, the same angle, on the face he has now. Total silence.
      { t: 0, pos: [0.05, 2.32, CAL50.z - 0.5], look: [0, 1.82, CAL50.z], fov: 0.26, ecu: true },
      // 001 wider: behind him, the golden frame folds shut.
      { t: 0.6, cut: true, pos: [0.7, 2.0, CAL50.z - 3.2], look: [0, 1.75, CAL50.z + 0.4], fov: 0.5 },
      // 002–003 wide: the burning bridge district, in full colour; then the debris finishes falling, all at once.
      { t: 1.6, cut: true, pos: [6.5, 4.4, -5.5], look: [0, 1.2, 3.0], fov: 0.8 },
      // 004 MS: Rook, exactly where they stood, staring.
      { t: 4.1, cut: true, pos: [0.39, 1.8, 5.37], look: [0, 1.7, ROOK50.z], fov: 0.5 },
      // 005 MS: him, exactly where he stood. Same face. Same voice.
      { t: 6.1, cut: true, pos: [2.48, 1.4, 6.87], look: [0, 1.85, CAL50.z], fov: 0.5 },
      { t: 8.1, pos: [2.48, 1.4, 6.87], look: [0, 1.85, CAL50.z], fov: 0.5 },
    ],
    events: [
      { t: 0.6, hide: "calGrin" }, { t: 0.6, show: "cal" },
      { t: 0.6, tear: { kind: "gold", at: [CAL50.x, 1.6, CAL50.z + 0.9], r: 1.0, life: 1.0, grow: 0.05 } },
      { t: 2.7, sfx: "slam" }, { t: 2.9, sfx: "stone" }, { t: 3.1, sfx: "slam" },
      { t: 4.3, sfx: "wind" },
    ],
  },

  ep50_chain: {
    id: "ep50_chain",
    stage: "bridge",
    duration: 12.6,
    actors: [
      { id: "cal", look: "unmasked", x: CAL50.x, z: CAL50.z, yaw: PI },
      { id: "rook", look: "player", x: -0.4, z: 3.0, yaw: 0 },
      { id: "juno", look: "juno", x: -3.0, z: 4.6, yaw: 1.0 },
      { id: "bas", look: "bas", x: 3.0, z: 4.4, yaw: -1.0 },
      { id: "dagrun", look: "dagrun", x: 2.8, z: 1.4, yaw: -0.6 },
    ],
    camera: [
      // The party round him, all of them, for the first time since the board.
      { t: 0, pos: [-6.0, 4.0, 0.4], look: [0, 1.3, 5.4], fov: 0.72 },
      // Juno: the snare line.
      { t: 1.6, cut: true, pos: [2.7, 2.8, 4.67], look: [-1.0, 1.5, 6.2], fov: 0.6 },
      // Bas: the pillar, up from under him.
      { t: 3.2, cut: true, pos: [1.31, 1.2, -0.14], look: [0.4, 2.0, 6.8], fov: 0.62 },
      // Dagrun: the shield, from the side.
      { t: 4.8, cut: true, pos: [1.32, 1.6, 10.17], look: [0.8, 1.8, 6.2], fov: 0.62 },
      // Rook: the last link. Everything in it.
      { t: 6.6, cut: true, pos: [-2.87, 1.2, -0.33], look: [0, 1.8, 6.6], fov: 0.56 },
      // He comes down. Hit, genuinely, for the first time. He lands on one knee, a hand on his ribs, laughing softly.
      { t: 9.0, cut: true, pos: [0.7, 1.4, CAL50.z - 1.0], look: [0, 1.25, CAL50.z + 1.4], fov: 0.5, ecu: true },
      { t: 12.6, pos: [0.66, 1.4, CAL50.z - 0.8], look: [0, 1.25, CAL50.z + 1.4], fov: 0.48, ecu: true, ease: "linear" },
    ],
    events: [
      { t: 0.2, sfx: "surgeFull" },
      { t: 1.7, move: { id: "juno", to: [-1.1, 6.4], dur: 0.35 } }, { t: 2.0, sfx: "swing" }, { t: 2.1, sfx: "hit" }, { t: 2.1, flash: 0.05 },
      { t: 2.6, move: { id: "juno", to: [-3.0, 5.0], dur: 0.5 } },
      { t: 3.3, move: { id: "bas", to: [1.1, 6.6], dur: 0.35 } }, { t: 3.6, sfx: "hitHeavy" }, { t: 3.6, flash: 0.06 },
      { t: 3.7, move: { id: "cal", to: [CAL50.x, CAL50.z, 1.4], dur: 0.4 } }, { t: 4.2, move: { id: "bas", to: [3.0, 5.0], dur: 0.5 } },
      { t: 4.9, move: { id: "dagrun", to: [1.3, 5.0], dur: 0.4 } }, { t: 5.3, sfx: "block" }, { t: 5.35, sfx: "hitHeavy" }, { t: 5.35, flash: 0.06 },
      { t: 5.9, move: { id: "dagrun", to: [3.4, 1.6], dur: 0.5 } },
      { t: 6.7, move: { id: "rook", to: [0, 5.4], dur: 0.3 } }, { t: 7.1, sfx: "finisher" }, { t: 7.15, flash: 0.16 }, { t: 7.2, sfx: "slam" },
      { t: 7.3, move: { id: "cal", to: [CAL50.x, CAL50.z + 1.4, 0], dur: 0.6, back: true } }, // thrown back, still facing them
      { t: 8.4, pose: { id: "cal", name: "kneel" } },
      { t: 9.2, pose: { id: "cal", name: "hand" } }, { t: 10.2, sfx: "laugh" },
    ],
  },

  // ---- Arc 6 ----
  // Ep 53: under the Lowmarket, nine days after the Siege. Three soldiers of the Line, in formation, still facing the
  // door they came through, which closed behind them. Nobody has told them anything since.
  ep53_line: {
    id: "ep53_line",
    stage: "oldcity",
    duration: 9,
    actors: [
      { id: "four", look: "lineSoldier", x: 0, z: 10.6, yaw: 0 },
      { id: "s1", look: "lineSoldier", x: -1.7, z: 10.2, yaw: 0 },
      { id: "s2", look: "lineSoldier", x: 1.7, z: 10.2, yaw: 0 },
    ],
    camera: [
      { t: 0, pos: [0, 1.9, 6.2], look: [0, 1.6, 10.4], fov: 0.72 },            // their backs, and the door past them
      { t: 4.6, pos: [0, 1.9, 6.6], look: [0, 1.6, 10.4], fov: 0.7, ease: "linear" },
      { t: 4.6, cut: true, pos: [0, 1.9, 14.2], look: [0, 1.6, 10.4], fov: 0.64 }, // from the door: the faceplates
      { t: 9, pos: [0, 1.9, 14.0], look: [0, 1.6, 10.4], fov: 0.61, ease: "linear" },
    ],
    events: [
      { t: 0.6, caption: "Under the Lowmarket. Nine days after the Siege." },
      { t: 5.0, caption: "They are still facing the door." },
    ],
  },

  // Ep 55: under the Lowmarket, somebody is knocking on the door to the Hollow. From the inside.
  ep55_knock: {
    id: "ep55_knock",
    stage: "oldcity",
    duration: 8,
    actors: [],
    camera: [
      { t: 0, pos: [0, 1.6, 8.4], look: [0, 2.4, 15.2], fov: 0.66 },
      { t: 8, pos: [0, 1.7, 10.6], look: [0, 2.6, 15.2], fov: 0.6, ease: "linear" },
    ],
    events: [
      { t: 0.6, caption: "Under the Lowmarket. The door to the Hollow." },
      { t: 2.6, sfx: "block" }, { t: 3.3, sfx: "block" }, { t: 4.0, sfx: "block" },
      { t: 4.8, caption: "Somebody is knocking. From the inside." },
    ],
  },
  // Ep 56: the Tower of Choosing out of season. One old man with a broom, under the murals.
  ep56_sweep: {
    id: "ep56_sweep",
    stage: "towerHall",
    duration: 9,
    actors: [{ id: "moss", look: "moss", x: -3.0, z: -1.0, yaw: 1.2 }],
    camera: [
      { t: 0, pos: [6.5, 4.5, -11], look: [-1, 1.4, 1], fov: 0.66 },
      { t: 4.6, pos: [5.8, 4.0, -10], look: [-1, 1.4, 1], fov: 0.64, ease: "linear" },
      { t: 4.6, cut: true, pos: [1.6, 1.9, 0.9], look: [-1.0, 1.6, -0.6], fov: 0.72 },
      { t: 9, pos: [1.52, 1.9, 0.85], look: [-1.0, 1.6, -0.6], fov: 0.69, ease: "linear" },
    ],
    events: [
      { t: 0.2, move: { id: "moss", to: [-1.0, -0.6], dur: 4.2, ease: "linear" } },
      { t: 0.6, caption: "The Tower of Choosing. Out of season." },
      { t: 5.0, caption: "Brother Moss has swept these steps for longer than anyone can remember." },
    ],
  },
};
