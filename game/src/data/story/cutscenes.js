// Cutscene timelines (see core/timeline.js for the format). Times are in seconds.

const PI = Math.PI;

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
};
