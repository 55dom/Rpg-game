// Cutscene timelines (see core/timeline.js for the format). Times are in seconds.

import { IRONHOLD_LAYOUT, VAULT_LAYOUT } from "../zones.js";

const PI = Math.PI;
const RG = IRONHOLD_LAYOUT.ridge, EN = IRONHOLD_LAYOUT.engine;
const KNIGHT = { x: RG.x - 1.5, z: RG.z - 4 }; // on the ridge's flat top
/** Where the squad stands to meet the Cindermaw (Ep 24's engine scene uses the same places). */
export const SQUAD = Object.freeze({
  bas: { x: 0.3, z: 3.2 }, rook: { x: -1.1, z: 1.3 }, dagrun: { x: -2.8, z: 0.7 }, juno: { x: 1.9, z: 1.5 },
  tamsin: { x: -4.3, z: -0.8 }, lio: { x: 3.7, z: 0.1 },
});
const VT = VAULT_LAYOUT;
const OUT = { x: VT.exit.x + 0.2, z: VT.exit.z - 0.6 }; // where he waits for his way out (Ep 26): clear of Bas, knocked down by the door

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
      { t: 15, pos: [0.7, 1.5, -5.5], look: [0, 1.6, 3.6], fov: 0.46, ease: "inOut" },     // the figure comes toward us
      { t: 18, pos: [0.7, 1.5, -5.5], look: [0, 1.6, 1.2], fov: 0.5, ease: "linear" },
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
    // The squad in a loose arc (Bas out in front), so no camera angle stacks them one behind another.
    actors: [
      { id: "rook", look: "player", x: SQUAD.rook.x, z: SQUAD.rook.z, yaw: 0.1 },
      { id: "bas", look: "bas", x: SQUAD.bas.x, z: SQUAD.bas.z, yaw: 0 },
      { id: "dagrun", look: "dagrun", x: SQUAD.dagrun.x, z: SQUAD.dagrun.z, yaw: 0.2 },
      { id: "juno", look: "juno", x: SQUAD.juno.x, z: SQUAD.juno.z, yaw: -0.15 },
      { id: "tamsin", look: "tamsin", x: SQUAD.tamsin.x, z: SQUAD.tamsin.z, yaw: 0.3 },
      { id: "lio", look: "lio", x: SQUAD.lio.x, z: SQUAD.lio.z, yaw: -0.3 },
      { id: "knight", look: "masked", x: KNIGHT.x, z: KNIGHT.z, y: RG.h, yaw: -PI / 2 },
    ],
    camera: [
      { t: 0, pos: [1.3, 3.6, -6.2], look: [0, 2.6, 24], fov: 0.62 },                         // high behind the squad: it's coming
      { t: 3.2, pos: [1.2, 3.5, -5.4], look: [0, 2.8, 22], fov: 0.6, ease: "linear" },
      { t: 3.2, cut: true, pos: [0.9, 0.35, 5.4], look: [0, 4.5, 16], fov: 0.7 },              // low in front of Bas, looking up at the jaw
      { t: 6, pos: [0.8, 0.4, 5.8], look: [0, 4.8, 15], fov: 0.72, ease: "linear" },
      { t: 6, cut: true, pos: [-2.2, 2.0, 6.85], look: [0.3, 1.8, 3.2], fov: 0.6 },              // Bas, planting his feet
      { t: 7.4, pos: [-2.1, 2.0, 6.55], look: [0.3, 1.8, 3.2], fov: 0.58, ease: "linear" },
      { t: 7.4, cut: true, pos: [-20.5, 6.6, 10.8], look: [1, 1.4, 5], fov: 0.62 },            // high, from out on the field (the ridge far behind)
      { t: 9, pos: [-20.1, 6.6, 10.5], look: [1, 1.4, 5.2], fov: 0.62, ease: "linear" },
      { t: 9, cut: true, pos: [-4, 9, -1], look: [0, 0, 8], fov: 0.66 },                        // high, down onto the tear sealing
      { t: 10.4, pos: [-3.8, 9.4, -0.6], look: [0, 0, 8], fov: 0.64, ease: "linear" },
      { t: 10.4, cut: true, pos: [-1.6, 3.4, 10.4], look: [-0.6, 1.3, 1.2], fov: 0.66 },        // the squad: where did it go?
      { t: 11.6, pos: [-1.6, 3.4, 10.1], look: [-0.6, 1.3, 1.2], fov: 0.64, ease: "linear" },
      { t: 11.6, cut: true, pos: [-2, 4.3, -2], look: [EN.crash.x, 14, EN.crash.z], fov: 0.5 },   // the sky over the Ashfall camp
      { t: 14.6, pos: [-2, 3.9, -2], look: [EN.crash.x, 4, EN.crash.z], fov: 0.5, ease: "inOut" },
      { t: 14.6, cut: true, pos: [2.85, 1.8, 3.8], look: [SQUAD.juno.x, 1.65, SQUAD.juno.z], fov: 0.52 }, // Juno points
      { t: 15.8, pos: [2.85, 1.8, 3.8], look: [SQUAD.juno.x, 1.65, SQUAD.juno.z], fov: 0.52 },
      { t: 15.8, cut: true, pos: [27, 4.6, 2], look: [KNIGHT.x, RG.h + 1.3, KNIGHT.z], fov: 0.42 }, // the ridge: a masked figure
      { t: 18.4, pos: [29, 4.8, 2.6], look: [KNIGHT.x, RG.h + 1.4, KNIGHT.z], fov: 0.36, ease: "linear" },
      { t: 18.4, cut: true, pos: [30, 6, -6], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 4], fov: 0.5 }, // he turns, and walks
      { t: 21.6, pos: [30, 6, -6], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 8], fov: 0.5, ease: "linear" },
      { t: 21.6, cut: true, pos: [SQUAD.rook.x - 0.4, 2.7, SQUAD.rook.z - 1.6], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 7.5], fov: 0.38 }, // from where we stand, over their heads
      { t: 24.5, pos: [SQUAD.rook.x - 0.4, 2.7, SQUAD.rook.z - 1.6], look: [KNIGHT.x, RG.h + 1, KNIGHT.z + 8], fov: 0.38 },
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
      { t: 0, pos: [0.9, 4.5, 16.4], look: [0, 1.4, 22.8], fov: 0.58 },                            // over Bas's head, through the gap in the door
      { t: 2.6, pos: [0.85, 4.4, 16.7], look: [0, 1.4, 22.8], fov: 0.56, ease: "linear" },
      { t: 2.6, cut: true, pos: [4.7, 1.5, 20.4], look: [0, 1.7, 20.8], fov: 0.6 },                // the doorway, side on
      { t: 5.2, pos: [4.5, 1.5, 20.4], look: [0, 1.6, 20.6], fov: 0.58, ease: "linear" },
      { t: 5.2, cut: true, pos: [-2.9, 2.1, 15.9], look: [0.3, 1.6, 19.5], fov: 0.6 },              // Bas, folded over his arm
      { t: 7, pos: [-2.7, 2.1, 16.2], look: [0.3, 1.6, 19.5], fov: 0.58, ease: "linear" },
      { t: 7, cut: true, pos: [5.3, 4.6, 16.85], look: [0.9, 1.4, 19.4], fov: 0.68 },                // high by the wall: he steps round Bas and walks out
      { t: 9.4, pos: [5.2, 4.5, 17.1], look: [OUT.x - 0.3, 1.4, OUT.z + 0.2], fov: 0.66, ease: "linear" },
      { t: 9.4, cut: true, pos: [0.6, 2.0, 12.8], look: [OUT.x, 1.6, OUT.z], fov: 0.5, ots: "rook" }, // over Rook's shoulder
      { t: 11, pos: [0.65, 2.0, 13.0], look: [OUT.x, 1.7, OUT.z], fov: 0.48, ease: "linear" },
      { t: 11, cut: true, pos: [-2.2, 1.9, 15.6], look: [OUT.x, 1.75, OUT.z], fov: 0.58 },             // the mask: head and shoulders
      { t: 13.6, pos: [-2.1, 1.9, 15.7], look: [OUT.x, 1.75, OUT.z], fov: 0.56, ease: "linear" },
      { t: 13.6, cut: true, pos: [6.0, 2.2, 15.45], look: [OUT.x, 1.4, OUT.z + 0.5], fov: 0.58 },            // side on: the way out
      { t: 16.2, pos: [5.8, 2.2, 15.65], look: [OUT.x, 1.4, OUT.z + 0.7], fov: 0.58, ease: "linear" },
      { t: 16.2, cut: true, pos: [0.4, 1.6, 10.4], look: [0.6, 1.3, 17.5], fov: 0.63 },              // the squad, and Bas in the doorway
      { t: 18.5, pos: [0.4, 1.6, 10.8], look: [0.4, 1.3, 18], fov: 0.63, ease: "linear" },
    ],
    events: [
      { t: 0, pose: { id: "rook", name: "bow" } },                        // Rook, down on one knee
      { t: 0.6, cue: "take" }, { t: 0.6, sfx: "tear" },                     // the reliquary, through a seam the size of a hand
      { t: 2.6, move: { id: "knight", to: [0, 21.3], dur: 1.2 } },
      { t: 3.6, pose: { id: "bas", name: "fist" } },
      { t: 4.2, pose: { id: "knight", name: "raise" } }, { t: 4.2, sfx: "swingHeavy" },
      { t: 4.6, pose: { id: "knight", name: "none" } }, { t: 4.6, sfx: "slam" }, { t: 4.65, sfx: "postureBreak" },
      { t: 4.7, pose: { id: "bas", name: "bow" } }, { t: 4.7, move: { id: "bas", to: [0.35, 19.5], dur: 0.5 } },
      { t: 7.2, move: { id: "knight", to: [1.5, 20.4], dur: 0.8 } },          // a step aside, round Bas…
      { t: 8, move: { id: "knight", to: [OUT.x, OUT.z], dur: 1.5 } },         // …and on to where his way out will open
      { t: 9.6, pose: { id: "rook", name: "none" } },
      { t: 10.2, pose: { id: "rook", name: "point" } },
      { t: 11.6, pose: { id: "knight", name: "tilt" } },
      { t: 13.4, pose: { id: "knight", name: "none" } },
      { t: 13.8, cue: "seamOpen" }, { t: 13.8, sfx: "tear" },
      { t: 14.6, move: { id: "knight", to: [VT.exit.x + 0.1, VT.exit.z + 0.1], dur: 1 } },
      { t: 15.6, hide: "knight" }, { t: 15.6, cue: "seamShut" }, { t: 15.6, sfx: "tear" },
      { t: 16.4, move: { id: "juno", to: [-0.6, 18.8], dur: 1.8 } },
    ],
  },

  // Episode 28: the lake takes Rook. Under the water the under-text wakes, rising out of the dark in pale lines;
  // the margin opens (Annotation); Rook comes back up at the island's edge.
  ep28_lake: {
    id: "ep28_lake",
    stage: "mirrorlake",
    duration: 15,
    actors: [
      { id: "rook", look: "player", x: 0, z: -17.2, yaw: PI },
      { id: "severin", look: "eclipsed", x: 0, z: -12.6, yaw: PI },
      { id: "under", look: "player", x: 0, z: -26, y: -4.2, yaw: PI },
    ],
    camera: [
      { t: 0, pos: [2.9, 1.9, -9.4], look: [0, 1.1, -17.2], fov: 0.55, ots: "severin" },    // past Severin: Rook at the edge
      { t: 2, pos: [2.7, 1.8, -9.9], look: [0, 0.9, -17.4], fov: 0.52, ease: "linear" },
      { t: 2, cut: true, pos: [3.4, 0.5, -20.4], look: [0, 1.1, -17.6], fov: 0.72 },              // low on the water: the fall
      { t: 3, pos: [3.4, 0.45, -20.4], look: [0, 0.8, -18.0], fov: 0.72, ease: "linear" },
      { t: 3, cut: true, pos: [3.2, -4.6, -22.6], look: [0, -3.3, -26], fov: 0.7 },             // under: sinking
      { t: 7.4, pos: [2.8, -5.0, -23.0], look: [0, -3.4, -26], fov: 0.66, ease: "linear" },
      { t: 7.4, cut: true, pos: [0.4, -7, -24.6], look: [0, -2, -26.6], fov: 0.7 },             // looking up past Rook: the script rising
      { t: 11.2, pos: [0.2, -7.4, -24.4], look: [0, -1, -26.4], fov: 0.74, ease: "linear" },
      { t: 11.2, cut: true, pos: [-3.2, 1.9, -13.2], look: [0, 1.2, -17], fov: 0.62 },          // back up: the edge of the island
      { t: 15, pos: [-3, 1.9, -13.5], look: [0, 1.3, -16.6], fov: 0.58, ease: "linear" },
    ],
    events: [
      { t: 0.2, pose: { id: "rook", name: "bow" } },                     // staggered back to the edge…
      { t: 1.6, move: { id: "rook", to: [0, -17.9], dur: 0.4 } },
      { t: 2.6, sfx: "mud" }, { t: 2.7, hide: "rook" },                    // …and over it
      { t: 3, cue: "under" }, { t: 3, pose: { id: "under", name: "bow" } }, { t: 3, hide: "severin" },
      { t: 7.6, cue: "annotate" }, { t: 7.6, sfx: "bookDescend" }, { t: 7.8, pose: { id: "under", name: "raise" } },
      { t: 10.6, sfx: "surgeFull" },
      { t: 11.2, cue: "surface" }, { t: 11.2, hide: "under" }, { t: 11.2, show: "rook" }, { t: 11.2, pose: { id: "rook", name: "bow" } },
      { t: 11.3, move: { id: "rook", to: [0, -16.4], dur: 1.6 } },
      { t: 13, pose: { id: "rook", name: "none" } },
    ],
  },

  // Episode 28, the arc's last scene: the Valcourt crypt at night. A masked figure kneels at Aurek Valcourt's grave,
  // lays a white flower on it, stands, and leaves through a tear in the dark by the door.
  ep28_crypt: {
    id: "ep28_crypt",
    stage: "crypt",
    duration: 13.5,
    actors: [{ id: "knight", look: "masked", x: -0.3, z: 3.7, yaw: 0 }], // at the foot of the grave
    camera: [
      { t: 0, pos: [0, 1.7, -7.2], look: [0, 1, 4.6], fov: 0.6 },                              // from the door, down the aisle
      { t: 4, pos: [0, 1.6, -4.6], look: [0, 0.9, 4.6], fov: 0.58, ease: "linear" },
      { t: 4, cut: true, pos: [3.6, 1.9, 1.4], look: [0, 1.35, 5.4], fov: 0.62 },                 // from the side: kneeling at the grave
      { t: 7.2, pos: [3.4, 1.8, 1.8], look: [0, 1.35, 5.4], fov: 0.58, ease: "linear" },
      { t: 7.2, cut: true, pos: [1.6, 1.3, 3.2], look: [0, 0.75, 6.2], fov: 0.55 },               // past his shoulder: the name, and the flower
      { t: 10.4, pos: [1.5, 1.25, 3.5], look: [0, 0.7, 6.2], fov: 0.52, ease: "linear" },
      { t: 10.4, cut: true, pos: [2.85, 1.6, -2.2], look: [-1.2, 1.4, -5.6], fov: 0.7 },         // he goes
      { t: 13.5, pos: [2.85, 1.6, -2.0], look: [-1.2, 1.4, -5.6], fov: 0.7 },
    ],
    events: [
      { t: 0, pose: { id: "knight", name: "bow" } }, { t: 0, cue: "noFlower" },
      { t: 5.4, pose: { id: "knight", name: "hand" } }, { t: 6.2, cue: "flower" }, { t: 6.4, pose: { id: "knight", name: "bow" } },
      { t: 7.2, pose: { id: "knight", name: "none" } },
      { t: 10, move: { id: "knight", to: [-1.2, -5], dur: 2.4 } },
      { t: 11.6, cue: "seam" }, { t: 11.6, sfx: "tear" },
      { t: 12.4, hide: "knight" },
    ],
  },
};
