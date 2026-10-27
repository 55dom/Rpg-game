// Backlash's places (Ep 49; this folder is the sanctioned exception, GDD §15.11): a memory, fifteen years ago and a
// world away. Merged into data/zones.js ZONES (story only: no way in from the map).
//
//   camp     the Line's camp under the black castle: ash underfoot, a drill yard, rows of black tents, the mess, supply
//            carts, braziers, and to the north the castle wall with its great gate. Ash-grey sky.
//   throne   the throne chamber: a long black hall, two rows of pillars, a red runner up the middle to the dais, the
//            throne, and the two places beside it; behind the throne, a black coffin. The great doors at the south end.
//   caverns  under the castle, where nobody goes: old ruins, glyphs on the walls, a broken helm, and a mural.

const box = (x0, z0, x1, z1) => ({ box: [x0, z0, x1, z1] });
const circle = (x, z, r) => ({ circle: [x, z, r] });
const low = (s) => ({ ...s, low: true });

export const CAMP_LAYOUT = Object.freeze({
  half: 30,
  yard: { x: 0, z: -4, r: 9 },                                   // the drill yard
  posts: [[-4, -7], [-1.4, -8.4], [1.4, -8.4], [4, -7]],        // training posts round the yard's south edge
  tents: [[-18, -14], [-18, -4], [-18, 6], [18, -14], [18, -4], [18, 6]], // 7 × 5 m, the barracks
  mess: { x: -8, z: 12 },                                         // the long iron table
  carts: [[9, 12], [12, 15]],
  braziers: [[-10, -4], [10, -4], [-6, 16], [6, 16]],
  wall: { z: 26, gate: 4 },                                       // the castle wall, its gate ±4 m wide
  pillar: { x: 6, z: 8 },                                         // where the light comes down for the Hero Party
});

export const THRONE_LAYOUT = Object.freeze({
  half: [8, 22],
  pillars: [-15, -9, -3, 3, 9],                                   // z of each pair, at x ±5
  dais: { z: 15.5, r: 4.2 },
  throne: { x: 0, z: 17.6 },
  places: [[-3.2, 15.6], [3.2, 15.6]],                            // the two places beside the throne
  coffin: { x: 0, z: 20.6 },
  door: { x: 0, z: -22 },
  fold: { x: 5, z: 3 },                                           // the pillar that folds when the King looks at it
  pillar: { x: -2.4, z: 7.4 },                                    // the light that takes the heroes away, at the very end
});

export const CAVERN_LAYOUT = Object.freeze({
  half: [10, 16],
  rocks: [[-6, -6, 1.8], [7, -2, 2.2], [-7, 6, 2.0], [6, 9, 1.6]], // [x, z, r]
  glyphs: [[-9.8, -8], [9.8, -4], [-9.8, 2], [9.8, 6]],          // panels of script on the walls: [x, z]
  helm: { x: 3.4, z: 3.2 },
  mural: { z: 15.8, w: 12, h: 6 },
});

const C = CAMP_LAYOUT, T = THRONE_LAYOUT, V = CAVERN_LAYOUT;
export const REVEAL_ZONES = {
  camp: {
    id: "camp", name: "The Camp", region: "Fifteen years ago", stage: "camp", dungeon: true,
    bounds: { rect: [-C.half, -C.half, C.half, C.wall.z - 1], solids: [
      ...C.tents.map(([x, z]) => box(x - 3.5, z - 2.5, x + 3.5, z + 2.5)),
      low(box(C.mess.x - 4, C.mess.z - 0.7, C.mess.x + 4, C.mess.z + 0.7)),
      ...C.carts.map(([x, z]) => low(circle(x, z, 1.4))),
      ...C.braziers.map(([x, z]) => low(circle(x, z, 0.5))),
      ...C.posts.map(([x, z]) => circle(x, z, 0.3)),
    ] },
    spawn: { x: 0, z: -14, yaw: 0 },
    cast: [], pickups: [], encounters: [], exits: [], arrivals: {},
  },
  throne: {
    id: "throne", name: "The Throne Chamber", region: "Fifteen years ago", stage: "throne", interior: true,
    bounds: { rect: [-T.half[0] + 0.3, -T.half[1] + 0.3, T.half[0] - 0.3, T.half[1] - 0.3], solids: [
      ...T.pillars.flatMap((z) => [circle(-5, z, 0.75), circle(5, z, 0.75)]),
      low(box(-1.6, T.throne.z - 0.8, 1.6, T.half[1])),           // the throne and the coffin behind it
    ] },
    spawn: { x: 0, z: -19, yaw: 0 },
    cast: [], pickups: [], encounters: [], exits: [], arrivals: {},
  },
  caverns: {
    id: "caverns", name: "Under the Castle", region: "Fifteen years ago", stage: "caverns", interior: true,
    bounds: { rect: [-V.half[0] + 0.3, -V.half[1] + 0.3, V.half[0] - 0.3, V.half[1] - 0.3], solids: V.rocks.map(([x, z, r]) => circle(x, z, r)) },
    spawn: { x: 0, z: -13.6, yaw: 0 },
    cast: [], pickups: [], encounters: [], exits: [], arrivals: {},
  },
};
