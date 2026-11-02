// Cutscene timelines (see core/timeline.js for the format). Times are in seconds.

import { IRONHOLD_LAYOUT, VAULT_LAYOUT, HOLLOWMARCH_BOARD } from "../zones.js";
import { storyboard } from "../../core/storyboard.js";
import { REVEAL_CUTSCENES } from "../../reveal/cutscenes.js";

const LIGHTHOUSE_RACK = { x: 2.5, z: 12.4 }; // the squad's lantern rack (runtime/sets.js LIGHTHOUSE.lanterns)

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
// Ep 31, Aurelin's poor quarter by the grate: where Wraithe comes out of his last tear, where the knight waits for him,
// and the Choir's seam by the shack door where the children were kept.
export const QUARTER = Object.freeze({ out: { x: 29.4, z: -20.8 }, step: { x: 30.4, z: -22.0 }, lunge: { x: 31.5, z: -23.4 },
  knight: { x: 32.4, z: -24.6 }, seam: { x: 34.0, z: -26.6 }, reach: { x: 33.2, z: -25.9 }, boy: { x: 32.0, z: -26.8 } });
const Q = QUARTER;
// Ep 34, the Lowmarket south of the stalls, by the grate: where the Chancellor stands with the Writ, where the knight
// comes out of the dark, and where Severin ends up, between them.
export const CONVOY = Object.freeze({ aldric: { x: 23.4, z: -15.0 }, back: { x: 23.6, z: -12.8 }, tear: { x: 23.4, z: -20.4 }, knight: { x: 23.4, z: -16.4 },
  halvard: { x: 21.0, z: -15.8 }, block: { x: 22.0, z: -17.4 }, severin: { x: 19.6, z: -13.0 }, between: { x: 23.25, z: -15.25 } });
const CV = CONVOY;

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
      { t: 6, cut: true, pos: [-0.95, 2.0, 7.7], look: [0.3, 1.8, 3.2], fov: 0.64 },              // Bas, planting his feet
      { t: 7.4, pos: [-0.85, 2.0, 7.4], look: [0.3, 1.8, 3.2], fov: 0.62, ease: "linear" },
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
      { t: 13.6, cut: true, pos: [-1.8, 2.2, 13.9], look: [OUT.x - 0.7, 1.4, OUT.z + 0.6], fov: 0.58 }, // side by side: him, his way out, and Bas
      { t: 16.2, pos: [-1.7, 2.2, 14.1], look: [OUT.x - 0.6, 1.4, OUT.z + 0.7], fov: 0.58, ease: "linear" },
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

  // Episode 31: Wraithe steps out of his last tear into the poor quarter, and the masked knight is waiting for him. One
  // cut. What's left of a rift-walker goes back through the seam he made. Then the knight reaches into the Choir's seam
  // by the shack door, where the missing children were kept, and lifts the first of them out.
  ep31_step: {
    id: "ep31_step",
    stage: "aurelin",
    sky: { daylight: 0.05 },
    duration: 16.5,
    actors: [
      { id: "wraithe", look: "wraithe", x: Q.out.x, z: Q.out.z, yaw: 2.5, hidden: true },
      { id: "knight", look: "masked", x: Q.knight.x, z: Q.knight.z, yaw: -0.65, hidden: true },
      { id: "kit", look: "kit", x: Q.seam.x + 0.4, z: Q.seam.z - 0.8, yaw: -1.4, hidden: true },
    ],
    camera: [
      { t: 0, pos: [24.6, 3.0, -15.2], look: [Q.out.x, 1.3, Q.out.z], fov: 0.62 },                  // down the lane from the street: a pale tear opens
      { t: 2.0, pos: [24.7, 3.0, -15.3], look: [Q.out.x, 1.3, Q.out.z], fov: 0.61, ease: "linear" },
      { t: 3.2, pos: [24.9, 3.0, -15.6], look: [Q.step.x, 1.3, Q.step.z], fov: 0.6, ease: "linear" },
      { t: 3.2, cut: true, pos: [28.6, 2.05, -21.6], look: [Q.knight.x, 1.65, Q.knight.z], fov: 0.5, ots: "wraithe" }, // past his shoulder: somebody's there
      { t: 5.2, pos: [28.7, 2.0, -21.75], look: [Q.knight.x, 1.7, Q.knight.z], fov: 0.46, ease: "linear" },
      { t: 5.2, cut: true, pos: [27.0, 1.8, -26.6], look: [31.6, 1.4, -23.4], fov: 0.64 },            // side on: the lunge, and one cut
      { t: 6.8, pos: [27.1, 1.8, -26.4], look: [31.7, 1.3, -23.5], fov: 0.64, ease: "linear" },
      { t: 6.8, cut: true, pos: [27.9, 6.6, -18.4], look: [31.8, 0.6, -23.8], fov: 0.62 },            // high: what's left of him
      { t: 9.6, pos: [28.2, 6.2, -18.9], look: [31.9, 0.6, -23.9], fov: 0.6, ease: "linear" },
      { t: 9.6, cut: true, pos: [29.0, 2.2, -27.8], look: [Q.reach.x + 0.2, 1.45, Q.reach.z + 0.1], fov: 0.64 }, // the Choir's seam by the door
      { t: 13.4, pos: [29.2, 2.15, -27.7], look: [Q.reach.x + 0.1, 1.45, Q.reach.z + 0.2], fov: 0.62, ease: "linear" },
      { t: 13.4, cut: true, pos: [27.4, 1.65, -23.9], look: [32.6, 1.2, -26.4], fov: 0.62 },           // the boy, and the knight over him
      { t: 16.5, pos: [27.6, 1.65, -24.0], look: [32.6, 1.2, -26.4], fov: 0.6, ease: "linear" },
    ],
    events: [
      { t: 0.3, tear: { at: [Q.out.x, 1.1, Q.out.z], kind: "pale", r: 0.9, yaw: -0.95, life: 1.4 } },
      { t: 0.6, show: "wraithe" }, { t: 0.6, pose: { id: "wraithe", name: "bow" } },
      { t: 0.8, caption: "Somewhere across the city, a pale seam opens in a lane nobody uses after dark." },
      { t: 2.0, pose: { id: "wraithe", name: "none" } },
      { t: 2.0, move: { id: "wraithe", to: [Q.step.x, Q.step.z], dur: 1.2 } },
      { t: 3.2, show: "knight" },
      { t: 3.6, caption: "" },
      { t: 5.6, pose: { id: "wraithe", name: "raise" } },
      { t: 5.9, move: { id: "wraithe", to: [Q.lunge.x, Q.lunge.z], dur: 0.35 } }, { t: 5.9, sfx: "swing" },
      { t: 6.05, pose: { id: "knight", name: "raise" } }, { t: 6.2, sfx: "swingHeavy" },
      { t: 6.45, pose: { id: "knight", name: "none" } }, { t: 6.5, sfx: "slam" },
      { t: 6.8, pose: { id: "wraithe", name: "down" } },
      { t: 7.0, caption: "One cut. He doesn't look at what he's done." },
      { t: 8.4, tear: { at: [Q.lunge.x, 0.05, Q.lunge.z], kind: "pale", r: 1.1, life: 1.6, ground: true } },
      { t: 8.6, caption: "What's left of a rift-walker goes back through the last seam he made." },
      { t: 9.0, hide: "wraithe" },
      { t: 9.4, tear: { at: [Q.seam.x, 1.15, Q.seam.z], kind: "pale", r: 0.8, yaw: -1.08, life: 6.6 } },
      { t: 9.6, move: { id: "knight", to: [Q.reach.x, Q.reach.z], dur: 1.4 } },
      { t: 9.8, caption: "" },
      { t: 11.2, pose: { id: "knight", name: "hand" } }, { t: 11.2, caption: "He reaches into the Choir's seam, up to the shoulder." },
      { t: 12.4, show: "kit" }, { t: 12.4, sfx: "rift" },
      { t: 12.5, move: { id: "kit", to: [Q.boy.x, Q.boy.z], dur: 1.1 } },
      { t: 13.2, pose: { id: "knight", name: "none" } },
      { t: 13.6, caption: "A boy in a man's coat. He sets him down on the cobbles as if he weighed nothing." },
      { t: 16.2, caption: "" },
    ],
  },

  // Episode 34: a black tear opens in the street. Halvard steps into the knight's way and goes down; the knight takes
  // the Writ out of the Chancellor's hands and raises the glaive over him; Severin gets there first, rapier up.
  ep34_brother: {
    id: "ep34_brother",
    stage: "aurelin",
    sky: { daylight: 0.05 },
    duration: 13.5,
    actors: [
      { id: "aldric", look: "aldric", x: CV.aldric.x, z: CV.aldric.z, yaw: PI },
      { id: "halvard", look: "halvardFace", x: CV.halvard.x, z: CV.halvard.z, yaw: 2.6 },
      { id: "severin", look: "severin", x: CV.severin.x, z: CV.severin.z, yaw: 2.2 },
      { id: "knight", look: "masked", x: CV.tear.x, z: CV.tear.z, yaw: 0, hidden: true },
    ],
    camera: [
      { t: 0, pos: [29.6, 4.6, -9.6], look: [CV.tear.x, 1.2, CV.tear.z + 2.0], fov: 0.66 },                // high up the street: a tear opens
      { t: 2.6, pos: [29.5, 4.55, -9.8], look: [CV.tear.x, 1.2, CV.tear.z + 2.4], fov: 0.65, ease: "linear" },
      { t: 2.6, cut: true, pos: [21.3, 2.2, -11.85], look: [22.8, 1.3, -17.4], fov: 0.62 },                // from behind the convoy: Halvard steps in
      { t: 4.8, pos: [21.35, 2.2, -12.0], look: [22.9, 1.3, -17.3], fov: 0.62, ease: "linear" },
      { t: 4.8, cut: true, pos: [25.2, 2.1, -12.6], look: [CV.knight.x, 1.6, CV.knight.z], fov: 0.52, ots: "aldric" }, // past the Chancellor
      { t: 7.3, pos: [25.1, 2.1, -12.7], look: [CV.knight.x, 1.7, CV.knight.z], fov: 0.5, ease: "linear" },
      { t: 7.3, cut: true, pos: [27.6, 2.2, -16.4], look: [23.2, 1.5, -14.6], fov: 0.62 },                 // from the side: Severin runs in between them
      { t: 9.6, pos: [27.5, 2.1, -16.3], look: [23.2, 1.55, -14.6], fov: 0.6, ease: "linear" },
      { t: 9.6, cut: true, pos: [21.9, 2.0, -14.3], look: [CV.knight.x, 1.9, CV.knight.z], fov: 0.5, ots: "severin" }, // over Severin's shoulder: the mask
      { t: 11.6, pos: [21.95, 2.0, -14.4], look: [CV.knight.x, 1.95, CV.knight.z], fov: 0.48, ease: "linear" },
      { t: 11.6, cut: true, pos: [24.8, 1.9, -17.8], look: [CV.between.x, 1.85, CV.between.z], fov: 0.5, ots: "knight" }, // over his: Severin's face
      { t: 13.5, pos: [24.75, 1.9, -17.7], look: [CV.between.x, 1.85, CV.between.z], fov: 0.48, ease: "linear" },
    ],
    events: [
      { t: 0.4, tear: { at: [CV.tear.x, 1.2, CV.tear.z], kind: "black", r: 1.0, yaw: 0, life: 2.4 } },
      { t: 0.5, caption: "A black tear opens in the middle of the street." },
      { t: 0.9, show: "knight" },
      { t: 1.8, move: { id: "knight", to: [CV.tear.x, -18.2], dur: 1.6 } },
      { t: 2.6, move: { id: "halvard", to: [CV.block.x, CV.block.z], dur: 0.9 } }, { t: 2.6, pose: { id: "halvard", name: "raise" } },
      { t: 3.2, caption: "" },
      { t: 3.7, pose: { id: "knight", name: "raise" } }, { t: 3.9, sfx: "swingHeavy" },
      { t: 4.1, pose: { id: "knight", name: "none" } }, { t: 4.15, sfx: "slam" }, { t: 4.2, pose: { id: "halvard", name: "down" } },
      { t: 4.4, move: { id: "knight", to: [CV.knight.x, CV.knight.z], dur: 0.9 } },
      { t: 5.4, pose: { id: "knight", name: "hand" } }, { t: 5.5, caption: "He takes the Writ out of the Chancellor's hands as if it had been offered to him." },
      { t: 6.6, pose: { id: "knight", name: "none" } }, { t: 6.6, pose: { id: "aldric", name: "bow" } }, { t: 6.6, move: { id: "aldric", to: [CV.back.x, CV.back.z], dur: 1.0 } },
      { t: 7.0, caption: "" },
      { t: 7.4, pose: { id: "knight", name: "raise" } },
      { t: 7.5, move: { id: "severin", to: [CV.between.x, CV.between.z], dur: 1.1 } },
      { t: 8.6, pose: { id: "severin", name: "raise" } }, { t: 8.6, sfx: "block" },
    ],
  },

  // Episode 38 (Encounter V): in the white of the Hollow a black tear opens, and the masked knight walks out of it
  // carrying Elodie, asleep. He puts her into Rook's arms without a word, and goes back the way he came. One close shot
  // of his hands as he lets her go (about a second): what's round his wrist, under the gauntlet's edge.
  ep38_carried: {
    id: "ep38_carried",
    stage: "hollow",
    duration: 15.7,
    actors: [
      { id: "rook", look: "player", x: 0, z: -2, yaw: 0 },
      { id: "severin", look: "severin", x: -2.6, z: -0.8, yaw: 0.5 },
      { id: "knight", look: "masked", x: 0.4, z: 6.0, yaw: PI, hidden: true },
      { id: "knightClose", look: "maskedClose", x: 0.2, z: -0.2, yaw: PI, hidden: true },
      { id: "elodie", look: "elodie", x: 0.4, z: 5.65, y: 0.72, yaw: PI / 2, down: true, hidden: true },
    ],
    camera: [
      { t: 0, pos: [-2.6, 2.2, -6.4], look: [0.3, 1.4, 4.0], fov: 0.62 },                     // into the white, past Rook and Severin
      { t: 3.0, pos: [-2.5, 2.2, -6.2], look: [0.3, 1.35, 3.4], fov: 0.6, ease: "linear" },
      { t: 3.0, cut: true, pos: [-6.84, 2.4, 7.08], look: [0.3, 1.3, 1.6], fov: 0.62 },         // from behind him: he walks out of the white with her
      { t: 7.4, pos: [-6.6, 2.4, 6.8], look: [0.2, 1.25, 0.6], fov: 0.6, ease: "linear" },
      { t: 7.4, cut: true, pos: [5.8, 2.0, -1.3], look: [0.1, 1.2, -1.0], fov: 0.6 },          // side on: he gives her to Rook
      { t: 8.7, pos: [5.7, 2.0, -1.3], look: [0.1, 1.15, -1.1], fov: 0.6, ease: "linear" },
      { t: 8.7, cut: true, pos: [1.4, 1.05, -1.15], look: [0.95, 1.02, -0.3], fov: 0.5 },       // low, close: his hands, empty now
      { t: 9.8, pos: [1.38, 1.05, -1.17], look: [0.93, 1.02, -0.32], fov: 0.5, ease: "linear" },
      { t: 9.8, cut: true, pos: [-1.4, 2.0, -3.9], look: [0.2, 1.8, -0.2], fov: 0.5, ots: "rook" }, // over Rook's shoulder: the mask
      { t: 11.8, pos: [-1.35, 2.0, -3.8], look: [0.2, 1.8, -0.1], fov: 0.48, ease: "linear" },
      { t: 11.8, cut: true, pos: [3.4, 2.6, -6.0], look: [0.2, 1.3, -0.2], fov: 0.62 },          // he goes
      { t: 14.0, pos: [3.35, 2.6, -5.9], look: [0.4, 1.3, 4.8], fov: 0.62, ease: "inOut" },
      { t: 15.7, pos: [3.3, 2.6, -5.8], look: [0.4, 1.3, 5.0], fov: 0.62, ease: "linear" },
    ],
    events: [
      { t: 0.6, tear: { at: [0.4, 1.3, 6.4], kind: "black", r: 1.1, yaw: PI, life: 3.0 } },
      { t: 1.0, show: "knight" }, { t: 1.0, show: "elodie" }, { t: 1.0, pose: { id: "knight", name: "cross" } }, // both arms under her
      { t: 1.4, move: { id: "knight", to: [0.2, -0.2], dur: 5.2 } }, { t: 1.4, move: { id: "elodie", to: [0.2, -0.62], dur: 5.2 } },
      { t: 6.6, pose: { id: "rook", name: "cross" } }, { t: 6.8, pose: { id: "severin", name: "point" } },
      { t: 7.6, move: { id: "elodie", to: [0, -1.58], dur: 1.0 } },
      { t: 8.6, pose: { id: "knight", name: "none" } },
      { t: 8.7, hide: "knight" }, { t: 8.7, show: "knightClose" },
      { t: 9.8, hide: "knightClose" }, { t: 9.8, show: "knight" },
      { t: 10.0, pose: { id: "severin", name: "none" } },
      { t: 11.8, move: { id: "knight", to: [0.4, 4.8], dur: 2.4 } },
      { t: 13.6, tear: { at: [0.4, 1.3, 5.6], kind: "black", r: 1.0, yaw: PI, life: 1.6 } },
      { t: 14.2, hide: "knight" },
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
      { t: 0, pos: [3.1, 1.9, -8.85], look: [0, 1.1, -17.2], fov: 0.55 },                    // past Severin: Rook at the edge
      { t: 2, pos: [2.9, 1.8, -9.35], look: [0, 0.9, -17.4], fov: 0.52, ease: "linear" },
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
  // Ep 51 (Arc 6): the morning after the Siege. The lantern room is still lit; Dagrun on the step under it, awake.
  ep51_dawn: {
    id: "ep51_dawn",
    stage: "lighthouse",
    sky: { daylight: 0.42 },
    duration: 9.5,
    actors: [{ id: "dagrun", look: "dagrun", x: -4.0, z: 9.7, yaw: Math.PI }],
    camera: [
      { t: 0, pos: [10, 2.2, -8], look: [-8, 9, 9], fov: 0.75 },                    // the tower, its light still burning
      { t: 4.6, pos: [8.6, 2.5, -6.6], look: [-8, 9.6, 9], fov: 0.72, ease: "linear" },
      { t: 4.6, cut: true, pos: [-1.39, 2.0, 5.44], look: [-4, 1.9, 9.7], fov: 0.62 },  // Dagrun on the step, where he's been all night
      { t: 9.5, pos: [-1.64, 1.95, 5.79], look: [-4, 1.9, 9.7], fov: 0.59, ease: "linear" },
    ],
    events: [
      { t: 0, pose: { id: "dagrun", name: "sit" } },
      { t: 0.4, caption: "The Lighthouse. The morning after the Siege." },
      { t: 6.2, caption: "Nobody put the light out." },
    ],
  },
  // Ep 52: the ninth bell. Under the great bell in the Bell Tower; it swings, and tolls; Captain Graves waits at the desk.
  ep52_toll: {
    id: "ep52_toll",
    stage: "belltower",
    duration: 9,
    actors: [
      { id: "ulric", look: "ulric", x: 0, z: 5.6, yaw: Math.PI },
      { id: "warden", look: "bellWarden", x: -2.6, z: 5.9, yaw: Math.PI },
      { id: "warden2", look: "bellWarden", x: 2.6, z: 5.9, yaw: Math.PI },
    ],
    camera: [
      { t: 0, pos: [0.6, 1.3, -2.4], look: [0, 6.4, 1.2], fov: 0.8 },               // up into the bell as it swings
      { t: 4.2, pos: [0.3, 1.5, -2.8], look: [0, 6.1, 1.0], fov: 0.78, ease: "linear" },
      { t: 4.2, cut: true, pos: [0, 2.6, -7.8], look: [0, 1.9, 4.6], fov: 0.62 },   // from the door: the ring, the desk, the captain
      { t: 9, pos: [0, 2.4, -6.6], look: [0, 1.8, 4.6], fov: 0.6, ease: "linear" },
    ],
    events: [
      { t: 0.3, cue: "toll" }, { t: 0.3, sfx: "bell" }, { t: 2.9, sfx: "bell" }, { t: 5.5, sfx: "bell" },
      { t: 0.8, caption: "The Bell Tower. The ninth bell." },
    ],
  },
  // Ep 54: the Crown's court, sitting in the Grand Archive's reading hall where the coup failed. The Bell presides; the
  // High Chancellor stands in the aisle between the reading tables.
  ep54_court: {
    id: "ep54_court",
    stage: "archive",
    duration: 9,
    actors: [
      { id: "ulric", look: "ulric", x: 0, z: 5.6, yaw: Math.PI },
      { id: "warden", look: "bellWarden", x: -2.2, z: 5.4, yaw: Math.PI },
      { id: "warden2", look: "bellWarden", x: 2.2, z: 5.4, yaw: Math.PI },
      { id: "aldric", look: "aldric", x: 0, z: 0.6, yaw: 0 },
    ],
    camera: [
      { t: 0, pos: [4, 1.9, -4.4], look: [0, 1.6, 2.5], fov: 0.64 },            // down the aisle, past the reading tables
      { t: 4.4, pos: [3.8, 1.9, -4.0], look: [0, 1.6, 2.5], fov: 0.62, ease: "linear" },
      { t: 4.4, cut: true, pos: [0, 1.9, 4.4], look: [0, 1.6, 0.6], fov: 0.64 },  // the Chancellor, in chains
      { t: 9, pos: [0, 1.9, 4.2], look: [0, 1.6, 0.6], fov: 0.61, ease: "linear" },
    ],
    events: [
      { t: 0.6, caption: "The Grand Archive. The Crown's court sits where the coup failed." },
      { t: 5.0, caption: "The Crown against Aldric Valcourt." },
    ],
  },
  // Ep 57: Larkspur, fifteen years after the fire. Down the road, grass over the ash, to a door standing on its own.
  ep57_ruins: {
    id: "ep57_ruins",
    stage: "ruins",
    duration: 10,
    actors: [],
    camera: [
      { t: 0, pos: [0.4, 1.1, -9], look: [0, 1.6, 10], fov: 0.7 },                 // the road in
      { t: 5, pos: [0.4, 1.2, -4], look: [0, 1.6, 12], fov: 0.68, ease: "linear" },
      { t: 5, cut: true, pos: [2.4, 1.5, 10.8], look: [6, 1.5, 14], fov: 0.62 },     // the door, standing on its own
      { t: 10, pos: [2.8, 1.5, 11.3], look: [6, 1.5, 14], fov: 0.58, ease: "linear" },
    ],
    events: [
      { t: 0.6, caption: "Larkspur. Fifteen years after the fire." },
      { t: 5.4, caption: "One door is still standing." },
    ],
  },
  // Ep 8: the Tower of Choosing, the night before. The Choir singing at the old tomb under the dais, and an Iron Warden
  // captain, two hundred years in the floor, standing up.
  ep8_rise: {
    id: "ep8_rise",
    stage: "towerHall",
    sky: { daylight: 0.08 },
    duration: 9,
    actors: [
      { id: "a1", look: "acolyte", x: -3.0, z: 2.6, yaw: 0.6 }, { id: "a2", look: "acolyte", x: 3.0, z: 2.6, yaw: -0.6 },
      { id: "galen", look: "galen", x: 0, z: 5.0, yaw: Math.PI, hidden: true },
    ],
    camera: [
      { t: 0, pos: [0, 1.5, -2], look: [0, 1.3, 4], fov: 0.72 },
      { t: 4.4, pos: [0, 1.5, -1.8], look: [0, 1.3, 4], fov: 0.69, ease: "linear" },
      { t: 4.4, cut: true, pos: [1.9, 1.5, 1.71], look: [0, 1.6, 5], fov: 0.72 },
      { t: 9, pos: [1.84, 1.5, 1.81], look: [0, 1.6, 5], fov: 0.69, ease: "linear" },
    ],
    events: [
      { t: 0.4, caption: "The Tower of Choosing. Last night." }, { t: 0.6, sfx: "hymn" },
      { t: 3.6, sfx: "slam" }, { t: 3.7, flash: 0.06 }, { t: 3.8, show: "galen" },
      { t: 5.2, caption: "Rust remembers." },
    ],
  },
  // Ep 18: he opens a Threshold in front of the Bloom, pushes it through, and steps through after it; the door slams
  // shut in white light, and there's nothing left.
};

// Ep 18, "I'll Hold the Door": §19.3's storyboard, cut for cut (core/storyboard.js lays it out). Cuts 001–015 on the
// plateau; then the squad's moment there (the "nothing" scene: no residue, A1); then cut 016, the Lighthouse at dusk.
// The Lore Archive's Theatre plays the board straight through, frame by frame at 24 (§15.10, §19.3's fairness check).
const B18 = HOLLOWMARCH_BOARD, KNEEL = 1.45; // (Rook's eyes, down on one knee) · they stand south of the stones, clear of them
export const EP18_BOARD = Object.freeze({
  id: "ep18_door", stage: "hollowmarch",
  actors: [
    { id: "rook", look: "player", x: 0, z: 2.0, yaw: 0, pose: "kneel" },
    { id: "cal", look: "cal", x: 1.4, z: 4.2, yaw: 0 },
    { id: "figure", look: "cal", x: 0.2, z: B18.door.z + 0.25, yaw: Math.PI, hidden: true, pose: "reach" }, // cut 013: one frame, in the doorway
  ],
  cuts: [
    { cut: "001", picture: "Wide: the Hollow Bloom over the shattered plateau, sky bleeding white", action: "Slow crane down", audio: "Low choir drone, wind", sec: 3.0,
      size: "WIDE", dist: 14, on: [B18.bloom.x, 2.6, B18.bloom.z], yaw: Math.PI, from: 0.3, cam: "CAM_CRANE_DOWN_SLOW",
      events: [{ at: 0, cue: "bloom" }, { at: 0, sfx: "choirDrone" }, { at: 0, sfx: "wind" }] },
    { cut: "002", picture: "MS: Rook on one knee, grimoire flickering", action: "Static, slight handheld", audio: "Ragged breathing", sec: 1.5,
      size: "MS", on: "rook", from: -0.4, lookY: 1.2, cam: "CAM_HANDHELD", events: [{ at: 0, sfx: "breath" }] },
    { cut: "003", picture: "CU: the Bloom's core contracting", action: "Snap zoom", audio: "Deep heartbeat, accelerating", sec: 0.8,
      size: "CU", dist: 3.4, on: [B18.bloom.x, 3.4, B18.bloom.z], yaw: Math.PI, from: 0.15, cam: "CAM_SNAP_ZOOM",
      events: [{ at: 0, cue: "bloomBeat" }, { at: 0, sfx: "heartbeat" }] },
    { cut: "004", picture: "OTS from Cal toward the Bloom", action: "Slow dolly in", audio: "CAL: \"Huh. That's a big one.\"", sec: 2.0,
      size: "MS", fov: 0.72, on: [B18.bloom.x, 3.0, B18.bloom.z], ots: "cal", otsSide: -1, cam: "CAM_DOLLY_IN_SLOW", say: "Cal: Huh. That's a big one." },
    { cut: "005", picture: "CU: Cal tilts his head, listening to the Bloom, half-smile", action: "Hold pose, limited animation", audio: "The Lighthouse Tune on a solo instrument: three of its four notes, unresolved; then music cuts", sec: 1.2,
      size: "CU", on: "cal", from: 0.45, cam: "CAM_HOLD", say: null, events: [{ at: 0, pose: { id: "cal", name: "tilt" } }, { at: 0.05, sfx: "tuneThree" }] },
    { cut: "006", picture: "Two-shot: Cal and Rook", action: "Cal places a hand on Rook's head", audio: "CAL: \"Kid. Keep the key.\"", sec: 2.5,
      size: "TWO", on: ["cal", "rook"], yaw: 0, from: -0.3, lookY: 1.45, cam: "CAM_HOLD", say: "Cal: Kid. Keep the key.",
      events: [{ at: 0, move: { id: "cal", to: [0.92, 2.15], dur: 0.01 } }, { at: 0, face: ["cal", "rook"] }, { at: 0, pose: { id: "cal", name: "pat" } }, { at: 0, pose: { id: "rook", name: "kneelUp" } }] },
    { cut: "007", picture: "ECU: Rook's eyes widening", action: "Static", audio: "ROOK (VO_PLACEHOLDER): \"Cal, what are you…\"", sec: 1.0,
      on: "rook", from: 0.12, lookY: KNEEL, cam: "CAM_ECU", say: "{name}: Cal, what are you…" },
    { cut: "008", picture: "Low angle: Cal raises his hand; a vast door frame tears open in the air", action: "Tilt up, Dutch angle", audio: "Reality tearing (SFX)", sec: 1.8,
      size: "MS", fov: 0.78, on: "cal", from: Math.PI - 0.5, lookY: 3.0, cam: "CAM_LOW_ANGLE CAM_TILT_UP CAM_DUTCH", say: null,
      events: [{ at: 0, move: { id: "cal", to: [0.5, 6.0], dur: 0.01 } }, { at: 0, face: ["cal", "cal"] } /* (no one to look at: back to facing the stones) */, { at: 0, pose: { id: "cal", name: "lift" } }, { at: 0, cue: "door" }, { at: 0, sfx: "tear" }, { at: 0.2, sfx: "door" }] },
    { cut: "009", picture: "Wide: the door swallows the Bloom", action: "Whip pan following the Bloom", audio: "Roar collapsing into silence", sec: 1.2,
      size: "WIDE", dist: 11, on: [0, 2.5, 11.8], yaw: Math.PI, from: -0.7, cam: "CAM_WHIP_PAN_FAST", events: [{ at: 0, cue: "swallow" }, { at: 0, sfx: "roar" }] },
    { cut: "010", picture: "MS from behind Cal: he walks toward the door", action: "Tracking shot, slow", audio: "Footsteps only", sec: 2.0,
      size: "MS", on: "cal", from: Math.PI - 0.45, cam: "CAM_TRACKING",
      events: [{ at: 0, pose: { id: "cal", name: "none" } }, { at: 0, move: { id: "cal", to: [0.2, B18.door.z - 0.8], dur: 2.0, ease: "linear" } }, { at: 0, sfx: "steps" }] },
    { cut: "011", picture: "CU: Cal, turning his head back, smiling", action: "Held frame", audio: "CAL: \"I'll hold the door. Don't wait up.\"", sec: 2.5,
      size: "CU", on: "cal", from: Math.PI + 0.3, cam: "CAM_HOLD", say: "Cal: I'll hold the door. Don't wait up.", events: [{ at: 0.1, face: ["cal", "rook"] }] },
    { cut: "012", picture: "MS: Rook lunging forward", action: "Speed lines, smear frames", audio: "ROOK: \"CAL!\"", sec: 0.6,
      size: "MS", dist: 4.2, lookY: 1.5, on: "rook", from: 0.9, cam: "CAM_TRACKING", say: "{name}: CAL!",
      events: [{ at: 0, pose: { id: "rook", name: "reach" } }, { at: 0, move: { id: "rook", to: [0, 3.6], dur: 0.45 } }, { at: 0, speed: 0.6 }] },
    { cut: "013", picture: "Impact frame: inverted white silhouette of the door slamming toward the camera; in one frame, a figure stands in the doorway with a hand on the door", action: "2-frame flash", audio: "Single massive slam", frames: 4,
      size: "WIDE", dist: 8, rise: 1.6, on: [B18.door.x, 3.2, B18.door.z], yaw: Math.PI, from: 0.4, cam: "CAM_HOLD", say: null,
      events: [{ at: 0, hide: "cal" }, { at: 0, cue: "slam" }, { at: 0, invert: 9 }, { at: 0, sfx: "slam" }, { at: 1 / 24, show: "figure" }, { at: 2 / 24, hide: "figure" }] },
    { cut: "014", picture: "Wide: empty plateau, white mist, nothing remains", action: "Static, held 3 seconds", audio: "Total silence", sec: 3.5,
      size: "WIDE", dist: 12, on: [0, 1.0, 10], yaw: Math.PI, from: 1.0, cam: "CAM_HOLD", events: [{ at: 0, cue: "gone" }, { at: 0, hide: "figure" }, { at: 0, pose: { id: "rook", name: "kneel" } }] },
    { cut: "015", picture: "Insert: Rook's open palm, the brass key", action: "Slow push in", audio: "A faint, distant ringing (the key resonating)", sec: 2.0,
      size: "INSERT", rise: 0.75, on: [B18.palm.x, B18.palm.y, B18.palm.z], yaw: 0, from: Math.PI - 0.3, cam: "CAM_PUSH_IN_SLOW",
      events: [{ at: 0, cue: "palm" }, { at: 0.3, sfx: "keyRing" }, { at: 2.0, cue: "gone" }] },
  ],
});
export const EP18_DUSK_BOARD = Object.freeze({
  id: "ep18_dusk", stage: "lighthouse", sky: { daylight: 0.3 }, actors: [],
  cuts: [
    { cut: "016", picture: "Wide: the lighthouse at dusk; one lantern dark", action: "Slow pull back", audio: "Ambient wind; no music", sec: 4.0,
      size: "WIDE", dist: 8, fov: 0.66, on: [LIGHTHOUSE_RACK.x, 2.0, LIGHTHOUSE_RACK.z], yaw: Math.PI, from: 0.15, cam: "CAM_PULL_BACK_SLOW", events: [{ at: 0, sfx: "wind" }, { at: 3.2, fade: "out", dur: 0.8 }] },
  ],
});
/** The cast's sizes, so the layout frames them (runtime/rig.js LOOKS; a test keeps these the same). */
export const BOARD_SCALES = Object.freeze({ player: 1, cal: 1.06 });
const boardScale = (look) => BOARD_SCALES[look] ?? 1;
CUTSCENES.ep18_door = storyboard(EP18_BOARD, boardScale);
CUTSCENES.ep18_dusk = storyboard(EP18_DUSK_BOARD, boardScale);

Object.assign(CUTSCENES, REVEAL_CUTSCENES); // the reveal's own (src/reveal/cutscenes.js)
