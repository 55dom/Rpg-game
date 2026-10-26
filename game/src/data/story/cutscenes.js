// Cutscene timelines (see core/timeline.js for the format). Times are in seconds.

import { IRONHOLD_LAYOUT, VAULT_LAYOUT } from "../zones.js";

const PI = Math.PI;
const RG = IRONHOLD_LAYOUT.ridge, EN = IRONHOLD_LAYOUT.engine;
const KNIGHT = { x: RG.x - 1.5, z: RG.z - 4 }; // on the ridge's flat top
const VT = VAULT_LAYOUT;

export const CUTSCENES = {
  // Episode 1 cold open.
  ep1_larkspur: {
    id: "ep1_larkspur",
    stage: "larkspur",
    duration: 18,
    actors: [{ id: "figure", look: "stranger", x: 0, z: 17, yaw: PI, hidden: true }],
    camera: [
      { t: 0, pos: [3, 17, -24], look: [0, 3, 12], fov: 0.72 },                          // wide, high above the village
      { t: 5.6, pos: [1.2, 6, -12], look: [0, 2.6, 12], fov: 0.72, ease: "inOut" },        // crane down into the smoke
      { t: 5.6, cut: true, pos: [-1.4, 0.45, -5], look: [0.4, 2.4, 12], fov: 0.6 },        // low angle: the street on fire
      { t: 9, pos: [-1.1, 0.5, -3.8], look: [0.4, 2.4, 12], fov: 0.56, ease: "linear" },   // slow push
      { t: 9, cut: true, pos: [0.9, 1.6, -7], look: [0, 1.7, 14], fov: 0.36 },             // long lens down the street
      { t: 15, pos: [0.7, 1.5, -5.5], look: [0, 1.6, 4], fov: 0.46, ease: "inOut" },       // the figure comes toward us
      { t: 18, pos: [0.7, 1.5, -5.5], look: [0, 1.6, 2], fov: 0.46 },
    ],
    events: [
      { t: 0, sfx: "fire" },
      { t: 0.4, caption: "FIFTEEN YEARS AGO" },
      { t: 2.8, caption: "A village burns at the edge of the map. Its name is Larkspur." },
      { t: 5.6, sfx: "fire" },
      { t: 6, sfx: "cry" },
      { t: 6, caption: "Somewhere in the smoke, an infant is crying." },
      { t: 9, show: "figure" },
      { t: 9, move: { id: "figure", to: [0, 1], dur: 8.5 } },
      { t: 9.6, caption: "A thin figure walks out of the fire, carrying something small against its chest." },
      { t: 14.4, caption: "It doesn't look back." },
      { t: 16.6, fade: "out" },
    ],
  },

  // Episode 24: the Cindermaw rolls up the gate field toward the squad. A black tear opens under it, it drops
  // through, and it falls out of the sky onto the Ashfall camp. On the east ridge, a masked figure with a long
  // glaive is standing where he has been the whole time; he turns and walks away along the crest.
  ep24_tear: {
    id: "ep24_tear",
    stage: "ironhold",
    duration: 24.5,
    actors: [
      { id: "rook", look: "player", x: 0, z: 1, yaw: 0 },
      { id: "bas", look: "bas", x: 0.4, z: 3, yaw: 0 },
      { id: "dagrun", look: "dagrun", x: -1.8, z: 0.6, yaw: 0.1 },
      { id: "juno", look: "juno", x: 1.8, z: 0.4, yaw: -0.1 },
      { id: "tamsin", look: "tamsin", x: -3, z: -0.6, yaw: 0.15 },
      { id: "lio", look: "lio", x: 3, z: -0.8, yaw: -0.15 },
      { id: "knight", look: "masked", x: KNIGHT.x, z: KNIGHT.z, y: RG.h, yaw: -PI / 2 },
    ],
    camera: [
      { t: 0, pos: [-3.5, 1.4, -4.5], look: [0, 3.2, 24], fov: 0.62 },                       // behind the squad: it's coming
      { t: 3.2, pos: [-3.3, 1.5, -3.6], look: [0, 3.4, 22], fov: 0.6, ease: "linear" },
      { t: 3.2, cut: true, pos: [2.2, 0.35, 0.5], look: [0, 4.5, 14], fov: 0.7 },               // low, looking up at the jaw
      { t: 6, pos: [2.0, 0.4, 0.9], look: [0, 4.8, 13], fov: 0.72, ease: "linear" },
      { t: 6, cut: true, pos: [-1.2, 1.7, 5.6], look: [0.2, 1.6, 2.6], fov: 0.5 },              // Bas, planting his feet
      { t: 7.4, pos: [-1.1, 1.7, 5.3], look: [0.2, 1.6, 2.6], fov: 0.48, ease: "linear" },
      { t: 7.4, cut: true, pos: [-17, 3.5, 2], look: [0, 2.5, 6], fov: 0.62 },                  // wide from the side (the ridge far behind)
      { t: 9, pos: [-16.5, 3.6, 2.2], look: [0, 2.2, 6], fov: 0.62, ease: "linear" },
      { t: 9, cut: true, pos: [-4, 9, -1], look: [0, 0, 8], fov: 0.66 },                        // high, down onto the tear sealing
      { t: 10.4, pos: [-3.8, 9.4, -0.6], look: [0, 0, 8], fov: 0.64, ease: "linear" },
      { t: 10.4, cut: true, pos: [0.6, 1.6, 6.5], look: [0, 1.5, 1.5], fov: 0.55 },             // the squad: where did it go?
      { t: 11.6, pos: [0.6, 1.6, 6.3], look: [0, 1.5, 1.5], fov: 0.55, ease: "linear" },
      { t: 11.6, cut: true, pos: [-2, 4, -2], look: [EN.crash.x, 14, EN.crash.z], fov: 0.5 },   // the sky over the Ashfall camp
      { t: 14.6, pos: [-2, 3.6, -2], look: [EN.crash.x, 4, EN.crash.z], fov: 0.5, ease: "inOut" },
      { t: 14.6, cut: true, pos: [3.2, 1.6, 3], look: [1.8, 1.5, 0.4], fov: 0.5 },              // Juno points
      { t: 15.8, pos: [3.2, 1.6, 3], look: [1.8, 1.5, 0.4], fov: 0.5 },
      { t: 15.8, cut: true, pos: [27, 4.6, 2], look: [KNIGHT.x, RG.h + 1.3, KNIGHT.z], fov: 0.42 }, // the ridge: a masked figure
      { t: 18.4, pos: [29, 4.8, 2.6], look: [KNIGHT.x, RG.h + 1.4, KNIGHT.z], fov: 0.36, ease: "linear" },
      { t: 18.4, cut: true, pos: [31, 5.5, -4], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 5], fov: 0.5 }, // he turns, and walks
      { t: 21.6, pos: [31, 5.5, -3.4], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 7], fov: 0.5, ease: "linear" },
      { t: 21.6, cut: true, pos: [0.2, 1.7, 0.8], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 7.5], fov: 0.38 }, // from where we stand
      { t: 24.5, pos: [0.2, 1.7, 0.8], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 8], fov: 0.38 },
    ],
    events: [
      { t: 0, cue: "engineRoll" },
      { t: 0.4, sfx: "stone" }, { t: 3.3, sfx: "stone" }, { t: 6.1, sfx: "slam" },
      { t: 7.9, pose: { id: "knight", name: "raise" } },                // far off, a glaive comes up…
      { t: 8.2, pose: { id: "knight", name: "none" } },                 // …and down
      { t: 8.2, cue: "tear" }, { t: 8.2, sfx: "tear" },
      { t: 11.8, cue: "sky" }, { t: 11.8, sfx: "tear" },
      { t: 13.4, sfx: "slam" }, { t: 13.6, sfx: "fire" },
      { t: 14.6, pose: { id: "juno", name: "point" } },
      { t: 18.6, move: { id: "knight", to: [KNIGHT.x, KNIGHT.z + 8], dur: 4.6 } },
      { t: 22.9, hide: "knight" },
    ],
  },

  // Episode 26: the reliquary goes through a seam; Bas won't leave the doorway, and the knight breaks his arm;
  // Rook gets up; the knight looks at Rook, tilts his head, and steps back through a tear that closes behind him.
  ep26_arm: {
    id: "ep26_arm",
    stage: "vault",
    duration: 18.5,
    actors: [
      { id: "knight", look: "masked", x: VT.plinth.x, z: VT.plinth.z - 0.6, yaw: PI },
      { id: "bas", look: "bas", x: 0, z: 20.2, yaw: 0 },
      { id: "rook", look: "player", x: 1.8, z: 15.2, yaw: -0.15 },
      { id: "juno", look: "juno", x: -2.4, z: 15, yaw: 0.4 },
      { id: "tamsin", look: "tamsin", x: -3.8, z: 13.6, yaw: 0.6 },
      { id: "dagrun", look: "dagrun", x: 3.6, z: 13.4, yaw: -0.5 },
    ],
    camera: [
      { t: 0, pos: [0.9, 1.6, 17.2], look: [0, 1.5, 22.6], fov: 0.55 },                            // past Bas, into the alcove
      { t: 2.6, pos: [0.8, 1.6, 17.6], look: [0, 1.5, 22.4], fov: 0.52, ease: "linear" },
      { t: 2.6, cut: true, pos: [4.4, 1.5, 20.4], look: [0, 1.4, 20.8], fov: 0.6 },                // the doorway, side on
      { t: 5.2, pos: [4.2, 1.5, 20.4], look: [0, 1.3, 20.6], fov: 0.58, ease: "linear" },
      { t: 5.2, cut: true, pos: [-2.8, 1.6, 16.2], look: [0.3, 1.2, 19.5], fov: 0.55 },             // Bas, folded over his arm
      { t: 7, pos: [-2.6, 1.6, 16.5], look: [0.3, 1.2, 19.5], fov: 0.52, ease: "linear" },
      { t: 7, cut: true, pos: [0, 3.2, 9], look: [0.4, 1.4, 19], fov: 0.6 },                        // from the room: he walks out
      { t: 9.4, pos: [0.2, 3, 9.6], look: [0.8, 1.4, 18.4], fov: 0.58, ease: "linear" },
      { t: 9.4, cut: true, pos: [2.7, 1.7, 13.4], look: [1.2, 1.6, 18.2], fov: 0.5 },              // over Rook's shoulder
      { t: 11, pos: [2.6, 1.7, 13.6], look: [1.2, 1.7, 18.2], fov: 0.48, ease: "linear" },
      { t: 11, cut: true, pos: [2.1, 2.0, 15.4], look: [1.2, 1.85, 18.2], fov: 0.42 },             // the mask: head and shoulders
      { t: 13.6, pos: [2.0, 2.0, 15.7], look: [1.2, 1.85, 18.2], fov: 0.4, ease: "linear" },
      { t: 13.6, cut: true, pos: [6.6, 2, 17.2], look: [1.2, 1.4, 18.6], fov: 0.55 },              // side on: the way out
      { t: 16.2, pos: [6.4, 2, 17.4], look: [1.2, 1.4, 18.8], fov: 0.55, ease: "linear" },
      { t: 16.2, cut: true, pos: [0.4, 1.6, 11], look: [0.6, 1.3, 17.5], fov: 0.55 },              // the squad, and Bas in the doorway
      { t: 18.5, pos: [0.4, 1.6, 11.4], look: [0.4, 1.3, 18], fov: 0.55, ease: "linear" },
    ],
    events: [
      { t: 0, pose: { id: "rook", name: "bow" } },                        // Rook, down on one knee
      { t: 0.6, cue: "take" }, { t: 0.6, sfx: "tear" },                     // the reliquary, through a seam the size of a hand
      { t: 2.6, move: { id: "knight", to: [0, 21.3], dur: 1.2 } },
      { t: 3.6, pose: { id: "bas", name: "fist" } },
      { t: 4.2, pose: { id: "knight", name: "raise" } }, { t: 4.2, sfx: "swingHeavy" },
      { t: 4.6, pose: { id: "knight", name: "none" } }, { t: 4.6, sfx: "slam" }, { t: 4.65, sfx: "postureBreak" },
      { t: 4.7, pose: { id: "bas", name: "bow" } }, { t: 4.7, move: { id: "bas", to: [0.35, 19.5], dur: 0.5 } },
      { t: 7.2, move: { id: "knight", to: [VT.exit.x - 0.2, VT.exit.z - 0.7], dur: 2.2 } },
      { t: 9.6, pose: { id: "rook", name: "none" } },
      { t: 10.2, pose: { id: "rook", name: "point" } },
      { t: 11.6, pose: { id: "knight", name: "tilt" } },
      { t: 13.4, pose: { id: "knight", name: "none" } },
      { t: 13.8, cue: "seamOpen" }, { t: 13.8, sfx: "tear" },
      { t: 14.6, move: { id: "knight", to: [VT.exit.x, VT.exit.z + 0.3], dur: 1 } },
      { t: 15.6, hide: "knight" }, { t: 15.6, cue: "seamShut" }, { t: 15.6, sfx: "tear" },
      { t: 16.4, move: { id: "juno", to: [-0.6, 18.8], dur: 1.8 } },
    ],
  },
};
