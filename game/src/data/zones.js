// Explorable zones (GDD §13: large interconnected zones, not a seamless open world).
// Each zone names its set, bounds and solids (also used to build the set's buildings),
// where you arrive, who's there, and its exits. Talk nodes live in data/story/world.js.

const box = (x0, z0, x1, z1) => ({ box: [x0, z0, x1, z1] });
const circle = (x, z, r) => ({ circle: [x, z, r] });

// ---- Aurelin, the capital -------------------------------------------------------------------
// The plaza is in the middle; the Hall of Lanterns to the north; the Lowmarket to the east;
// rows of houses along the streets; the road home leaves through the south gate.
export const AURELIN_LAYOUT = (() => {
  const houses = [];
  // West street, both sides; east street up to the market.
  for (let i = 0; i < 4; i++) {
    houses.push({ x: -30, z: -20 + i * 12, w: 9, d: 8, h: 6 + (i % 2) * 2, color: i % 2 ? "#e2d4b8" : "#d8c8a8", roof: "#9a4a3a" });
    houses.push({ x: -16, z: -20 + i * 12, w: 7, d: 8, h: 5 + (i % 3), color: "#ece2cc", roof: i % 2 ? "#4a5a7a" : "#9a4a3a" });
  }
  for (let i = 0; i < 3; i++) houses.push({ x: 30, z: 18 + i * 9, w: 8, d: 7, h: 6 + i, color: "#e2d4b8", roof: "#4a5a7a" });
  houses.push({ x: 16, z: 30, w: 8, d: 8, h: 7, color: "#d8c8a8", roof: "#9a4a3a" });
  houses.push({ x: -28, z: 32, w: 10, d: 7, h: 8, color: "#cfc6b4", roof: "#2b4f8f", rich: true });
  // The Crown Ward's townhouses on the north-west street are stone, tall and blue-roofed.
  for (const h of houses) if (h.x === -30 && h.z >= 16) Object.assign(h, { h: 9, color: "#cfc6b4", roof: "#2b4f8f", rich: true });
  const stalls = [];
  for (let i = 0; i < 6; i++) stalls.push({ x: 18 + (i % 3) * 6, z: -8 + Math.floor(i / 3) * 10, canopy: ["#c0504d", "#e6b54e", "#4f81bd", "#9bbb59", "#8064a2", "#f79646"][i] });
  return {
    houses, stalls,
    hall: { x0: -11, z0: 26, x1: 11, z1: 42, door: { x: 0, z: 26 } },
    fountain: { x: 0, z: 0, r: 3.2 },
    gate: { x: 0, z: -34 },
    grate: { x: 30, z: -24 }, // the way down to the Undercroft
    chapel: { x: 16, z: 12, w: 6, d: 9 },
    tavern: { x: -16, z: -8 },  // "The Lantern & Anchor", in the west-street house nearest the gate
    // The poor quarter by the grate: shacks of patched planks.
    shacks: [{ x: 37, z: -27, w: 4, d: 4 }, { x: 37, z: -20.5, w: 4, d: 3.6 }, { x: 24.5, z: -29.6, w: 4, d: 3 }],
  };
})();

// ---- Thornwick, the home village ------------------------------------------------------------
// The green and its old oak in the middle; the orphanage to the north; the mill to the south-east
// with the mill road (and its bandits); the road to the Lighthouse leaves east, the fen path north-west.
export const THORNWICK_LAYOUT = {
  oak: { x: 0, z: 0, r: 1.6 },
  orphanage: { x0: -8, z0: 16, x1: 8, z1: 25 },
  houses: [
    { x: -19, z: -3, w: 7, d: 6 }, { x: -19, z: 9, w: 6, d: 6 }, { x: 18, z: 9, w: 7, d: 6 },
    { x: -10, z: -19, w: 6, d: 6 }, { x: -22, z: -18, w: 6, d: 5 }, { x: 16, z: 21, w: 6, d: 6 },
  ],
  smithy: { x: -9, z: -8, w: 5, d: 4 },
  mill: { x: 21, z: -12, r: 2.8 },
  well: { x: -5, z: -4 },
  fields: { x0: 6, z0: -29, x1: 29, z1: -18 },
};

// ---- The Undercroft: the old city under Aurelin -----------------------------------------------
// A line of rooms joined by narrow passages, running north. Each band is [z0, z1, half-width].
export const UNDERCROFT_BANDS = [[-34, -22, 6], [-22, -14, 2], [-14, 2, 10], [2, 10, 2], [10, 26, 12], [26, 32, 2], [32, 46, 14]];
const UC_HALF = 14;

const A = AURELIN_LAYOUT;
const aurelinSolids = [
  ...A.houses.map((h) => box(h.x - h.w / 2, h.z - h.d / 2, h.x + h.w / 2, h.z + h.d / 2)),
  ...A.stalls.map((s) => box(s.x - 1.4, s.z - 1, s.x + 1.4, s.z + 1)),
  box(A.hall.x0, A.hall.z0, A.hall.x1, A.hall.z1),
  circle(A.fountain.x, A.fountain.z, A.fountain.r),
  box(A.chapel.x - A.chapel.w / 2, A.chapel.z - A.chapel.d / 2, A.chapel.x + A.chapel.w / 2, A.chapel.z + A.chapel.d / 2),
  ...A.shacks.map((h) => box(h.x - h.w / 2, h.z - h.d / 2, h.x + h.w / 2, h.z + h.d / 2)),
  circle(-8.5, -27.5, 1.3), circle(-8.5, -25.2, 0.9), // the cart by the gate, and its horse
  // City walls on either side of the south gate.
  box(-42, -36, -4, -33), box(4, -36, 42, -33),
];

const T = THORNWICK_LAYOUT;
const thornwickSolids = [
  circle(T.oak.x, T.oak.z, T.oak.r),
  box(T.orphanage.x0, T.orphanage.z0, T.orphanage.x1, T.orphanage.z1),
  ...T.houses.map((h) => box(h.x - h.w / 2, h.z - h.d / 2, h.x + h.w / 2, h.z + h.d / 2)),
  box(T.smithy.x - 1.8, T.smithy.z, T.smithy.x - 0.2, T.smithy.z + 1.4), // the forge (the smithy itself is open-sided)
  circle(T.smithy.x + 1, T.smithy.z - 0.4, 0.45),                          // the anvil
  circle(T.mill.x, T.mill.z, T.mill.r),
  circle(T.well.x, T.well.z, 0.9),
  circle(25.5, -9.5, 1.3), // the mill cart
];
// The Fens set's own houses, ponds and well (runtime/sets.js buildFens).
const fensSolids = [
  ...[[-12, 14], [-4, 19], [6, 18], [14, 11], [-15, 4]].map(([x, z]) => circle(x, z, 2.5)),
  ...[[-22, 8, 9], [20, -16, 11], [24, 14, 7], [-18, -22, 8]].map(([x, z, r]) => circle(x, z, r - 1.2)),
  circle(3, 12, 0.9),
  circle(-8.5, 9.5, 1.2), // the overturned cart
];
// Everything outside the rooms and passages is rock.
const undercroftSolids = [
  ...UNDERCROFT_BANDS.flatMap(([z0, z1, hw]) => (hw >= UC_HALF ? [] : [box(-UC_HALF - 1, z0, -hw, z1), box(hw, z0, UC_HALF + 1, z1)])),
  ...[[-9, 36], [9, 36], [-9, 42], [9, 42]].map(([x, z]) => circle(x, z, 0.5)), // the Gear Hall's brass columns
  circle(-9, 39, 0.6), circle(9, 44, 0.6), circle(-6, -31, 0.6),                  // statues
];
// A passage gate: bars across a passage at z (closed while a room's fight is on).
const gate = (z) => [-2, z - 0.3, 2, z + 0.3];

export const ZONES = {
  lighthouse: {
    id: "lighthouse", name: "The Lantern Lighthouse", region: "Dry Sea of Marrow", stage: "lighthouse",
    bounds: { rect: [-17, -17, 17, 17], solids: [circle(-9, 9, 2.6), box(-7.6, 10.6, -0.4, 15.6), box(4.1, 3.4, 5.9, 8.6)] },
    spawn: { x: 0, z: 2, yaw: 0 },
    cast: [
      { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "W_Dagrun" }, // asleep in his chair: no routine
      { id: "juno", look: "juno", x: 3.6, z: 5, yaw: -1.4, node: "W_Juno",
        routine: { steps: [{ do: "work", at: [3.6, 5], face: -1.4, anim: "sew", dur: [8, 12] }, { do: "wander", around: [4, 3], r: 2, dur: [6, 9] }] } },
      { id: "bas", look: "bas", x: -5.6, z: -2.6, yaw: 0.6, node: "W_Bas",
        routine: { steps: [{ do: "work", at: [-5.3, -3.4], face: -1.75, anim: "punch", dur: [10, 14] }, { do: "idle", at: [-4.2, -1.6], face: 0.8, dur: [4, 6] }] } },
      { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "W_Tamsin",
        routine: { steps: [{ do: "work", at: [6.4, 7.2], face: -1.6, anim: "strum", dur: [12, 18] }, { do: "idle", at: [2.5, 10.9], face: 0, dur: [5, 7] }] } },
      { id: "cal", look: "cal", x: 1.6, z: -3.4, yaw: -0.6, node: "W_Cal",
        routine: { steps: [{ do: "idle", at: [1.6, -3.4], face: -0.6, dur: [8, 12] }, { do: "work", at: [0.4, -6.2], face: Math.PI, anim: "practice", dur: [7, 10] },
          { do: "idle", at: [-1.2, 3.2], face: Math.PI * 0.8, dur: [5, 8] }] } },
      { id: "lio", look: "lio", x: -2.6, z: 9.6, yaw: Math.PI * 0.9, node: "W_Lio",
        routine: { role: "civilian", steps: [{ do: "work", at: [-2.6, 9.6], face: Math.PI * 0.9, anim: "read", dur: [14, 20] }, { do: "idle", at: [1.6, 10.9], face: 0, dur: [4, 6] }] } },
    ],
    shelters: [[-5, 9.6], [-3, 9.6], [-1.8, 9.8]], // under the keeper's house eaves
    exits: [
      { id: "road", rect: [-17, -17, 17, -15.5], to: "aurelin", spawn: "gate", label: "The road to Aurelin" },
      { id: "west", rect: [-17, -12, -15.5, 4], to: "thornwick", spawn: "lighthouse", label: "West across the Dry Sea to Thornwick" },
    ],
    arrivals: { aurelin: { x: 0, z: -13, yaw: 0 }, thornwick: { x: -13, z: -3, yaw: Math.PI / 2 } },
  },
  aurelin: {
    id: "aurelin", name: "Aurelin", region: "The Capital", stage: "aurelin",
    bounds: { rect: [-42, -36, 42, 46], solids: aurelinSolids },
    spawn: { x: 0, z: -30, yaw: 0 },
    cast: [
      { id: "keeper", look: "keeper", x: 3, z: 24.6, yaw: Math.PI, node: "W_HallKeeper",
        routine: { role: "elder", steps: [{ do: "idle", at: [3, 24.6], face: Math.PI, dur: [9, 14] }, { do: "work", at: [-4.5, 24.4], face: 0, anim: "light", dur: [5, 7] }] } },
      { id: "vendor", look: "vendor", x: 21, z: -4.4, yaw: Math.PI / 2, node: "W_Vendor", shop: "lowmarket",
        routine: { home: [25.6, 18], steps: [{ do: "work", at: [21, -4.4], face: Math.PI, anim: "hawk", dur: [10, 16] }, { do: "work", at: [23.6, -5.2], face: Math.PI, anim: "work", dur: [4, 6] }] } },
      { id: "guard", look: "guard", x: 5.4, z: -30, yaw: -0.4, node: "W_Guard",
        routine: { role: "guard", steps: [{ do: "idle", at: [5.4, -30], face: 0, dur: [8, 12] }, { do: "idle", at: [-5.4, -30], face: 0, dur: [8, 12] }] } },
      { id: "gossip", look: "gossip", x: -6, z: 4, yaw: 1.2, node: "W_Gossip",
        routine: { home: [-12.3, 4], steps: [{ do: "work", at: [-6, 4], face: 1.2, anim: "chat", dur: [10, 14] }, { do: "wander", around: [-7, 1], r: 2.5, dur: [6, 9] }] } },
      { id: "kid", look: "kid", x: 4.6, z: 3.4, yaw: -2.2, node: "W_Kid",
        routine: { role: "child", home: [-12.3, -8], steps: [{ do: "wander", around: [4, 4], r: 3.5, dur: [8, 12] }, { do: "work", at: [7.5, -2], face: 2.4, anim: "play", dur: [4, 6] }] } },
      { id: "crier", look: "herald", x: -4, z: -8, yaw: 0.4, node: "W_Crier",
        routine: { home: [-12.3, -20], steps: [{ do: "work", at: [-4, -8], face: 0.4, anim: "hawk", dur: [10, 14] }, { do: "work", at: [-3, 9.5], face: Math.PI * 0.9, anim: "hawk", dur: [10, 14] }] } },
      { id: "guard2", look: "guard", x: -7, z: 23, yaw: Math.PI, node: "W_Guard2",
        routine: { role: "guard", steps: [{ do: "walk", to: [-7, 23] }, { do: "idle", at: [-7, 23], face: Math.PI, dur: [6, 9] }, { do: "walk", to: [7, 23] }, { do: "idle", at: [7, 23], face: Math.PI, dur: [6, 9] }] } },
      { id: "cook", look: "cook", x: 5.6, z: -5.4, yaw: -0.6, node: "W_Cook",
        routine: { home: [25.6, 27], steps: [{ do: "work", at: [5.6, -5.4], face: -0.6, anim: "stir", dur: [14, 20] }, { do: "work", at: [6.8, -6.6], face: 2.6, anim: "work", dur: [4, 6] }] } },
    ],
    // Somewhere dry to stand when it rains: the Hall portico, the market canopies, house doorways.
    shelters: [[-2, 25], [2, 25], [18, -6.8], [24, -6.8], [30, -6.8], [-12.3, 4], [-12.3, -8]],
    pickups: [{ id: "toyLantern", x: -2.6, z: -28.6, show: "$Q_TOY == 1 and not $TOY_FOUND", flag: "TOY_FOUND", label: "Pick up the toy lantern" }],
    exits: [
      { id: "gate", rect: [-4, -36, 4, -34.4], to: "lighthouse", spawn: "aurelin", label: "The road home to the Lighthouse" },
      { id: "grate", rect: [A.grate.x - 1.3, A.grate.z - 1.3, A.grate.x + 1.3, A.grate.z + 1.3], to: "undercroft", spawn: "aurelin", label: "The grate down to the Undercroft" },
    ],
    arrivals: { gate: { x: 0, z: -31, yaw: 0 }, undercroft: { x: A.grate.x, z: A.grate.z + 4, yaw: 0 } },
    crowd: 22,
  },
  thornwick: {
    id: "thornwick", name: "Thornwick", region: "Home", stage: "thornwick",
    bounds: { rect: [-30, -30, 30, 30], solids: thornwickSolids },
    spawn: { x: 0, z: -5, yaw: 0 },
    cast: [
      { id: "wren", look: "wren", x: 2.6, z: 13.4, yaw: Math.PI, node: "W_Wren",
        routine: { role: "elder", steps: [{ do: "work", at: [1.6, 14.4], face: Math.PI, anim: "sweep", dur: [10, 14] }, { do: "idle", at: [3.5, 9.5], face: Math.PI, dur: [6, 9] }] } },
      { id: "farmer", look: "farmer", x: 9, z: -12, yaw: -1.2, node: "W_Farmer",
        // Before the road is safe he paces and frets; after, he's back in his field.
        routines: [
          { when: "$BANDITS_CLEARED", home: [14.3, 9], steps: [{ do: "work", at: [15, -19.5], face: Math.PI, anim: "hoe", dur: [12, 16] }, { do: "work", at: [21, -19.5], face: Math.PI, anim: "hoe", dur: [10, 14] }, { do: "idle", at: [9, -12], face: -1.2, dur: [5, 7] }] },
          { home: [14.3, 9], steps: [{ do: "idle", at: [9, -12], face: -2.4, dur: [4, 7] }, { do: "walk", to: [7, -9.5] }, { do: "idle", at: [7, -9.5], face: -2.6, dur: [3, 5] }] },
        ] },
      { id: "smith", look: "smith", x: -8, z: -6.6, yaw: Math.PI, node: "W_Smith",
        routine: { role: "worker", steps: [{ do: "work", at: [-8, -6.6], face: Math.PI, anim: "hammer", dur: [14, 20] }, { do: "work", at: [-10.2, -6.4], face: Math.PI, anim: "work", dur: [4, 6] }] } },
    ],
    shelters: [[0, 15.4], [-8, -6.6], [-14.5, -3], [14.3, 9]],
    pickups: [{ id: "ledger", x: -3, z: 14.6, show: "1", flag: "LEDGER_READ", node: "W_Ledger", label: "Read the orphan ledger" }],
    encounters: [
      { id: "bandits", rect: [8, -29, 29, -19], at: { x: 18, z: -24, r: 4 }, wave: ["bandit", "bandit", "bandit"], when: "$Q_BANDITS == 1", flag: "BANDITS_CLEARED", label: "BANDITS ON THE MILL ROAD" },
    ],
    exits: [
      { id: "road", rect: [28.6, -6, 30, 6], to: "lighthouse", spawn: "thornwick", label: "East to the Lighthouse" },
      { id: "fens", rect: [-26, 28.6, -16, 30], to: "fens", spawn: "thornwick", label: "The fen path, north-west" },
    ],
    arrivals: { lighthouse: { x: 25, z: 0, yaw: -Math.PI / 2 }, fens: { x: -21, z: 25, yaw: Math.PI } },
  },
  fens: {
    id: "fens", name: "The Greywater Fens", region: "Swamp Villages", stage: "fens",
    bounds: { rect: [-30, -30, 30, 30], solids: fensSolids },
    spawn: { x: 0, z: -25, yaw: 0 },
    cast: [{ id: "ness", look: "ness", x: 12.6, z: -8.6, yaw: 2.36, node: "W_Ness",
      routine: { role: "elder", steps: [{ do: "work", at: [12.6, -8.6], face: 2.36, anim: "fish", dur: [20, 30] }, { do: "idle", at: [10.5, -5.5], face: 2.6, dur: [5, 8] }] } }],
    pickups: [{ id: "hymn", x: -1.4, z: 15.2, show: "1", flag: "HYMN_READ", node: "W_Hymn", label: "Read the hymn nailed to the well" }],
    // Field fights: they come back each visit. Run far enough and they give up the chase.
    encounters: [
      { id: "hounds", rect: [-10, -20, 10, -11], at: { x: 0, z: -14, r: 5 }, wave: ["hound", "hound", "hound"], label: "FEN HOUNDS" },
      { id: "choir", rect: [-9, 4, 10, 20], at: { x: 0, z: 9, r: 5 }, wave: ["acolyte", "acolyte", "cantor"], label: "THE CHOIR CAME BACK" },
      { id: "beast", rect: [-28, -12, -12, -1], at: { x: -20, z: -7, r: 4 }, wave: ["beast", "hound"], label: "BOG BEAST" },
    ],
    exits: [{ id: "path", rect: [-6, -30, 6, -28.6], to: "thornwick", spawn: "fens", label: "The path south to Thornwick" }],
    arrivals: { thornwick: { x: 0, z: -26, yaw: 0 } },
  },
  undercroft: {
    id: "undercroft", name: "The Undercroft", region: "Beneath Aurelin", stage: "undercroft", dungeon: true,
    bounds: { rect: [-UC_HALF, -34, UC_HALF, 46], solids: undercroftSolids },
    spawn: { x: 0, z: -30, yaw: 0 },
    cast: [],
    pickups: [
      { id: "fishbones", x: 3.4, z: -25, show: "not $UC_BONES", flag: "UC_BONES", node: "W_Bones", label: "Look at the pile of fish bones" },
      { id: "chest", x: 0, z: 43, show: "$UNDERCROFT_CLEARED and not $UC_CHEST", flag: "UC_CHEST", marks: 60, label: "Open the old strongbox" },
    ],
    // Dungeon rooms: the passages bar shut until the room is clear, and a cleared room stays clear.
    encounters: [
      { id: "rats", rect: [-10, -11, 10, 2], at: { x: 0, z: -4, r: 5 }, wave: ["rat", "rat", "rat", "rat", "rat"], flag: "UC_ROOM1", lock: [gate(-14), gate(2)], label: "THE NEST" },
      { id: "sentinel", rect: [-12, 13, 12, 26], at: { x: 0, z: 19, r: 4 }, wave: ["clockwork", "rat", "rat", "rat"], flag: "UC_ROOM2", lock: [gate(10), gate(26)], label: "CLOCKWORK SENTINEL" },
      { id: "court", rect: [-14, 35, 14, 46], at: { x: 0, z: 40, r: 5 }, wave: ["clockwork", "clockwork", "rat", "rat"], flag: "UNDERCROFT_CLEARED", lock: [gate(32)], label: "THE GEAR HALL" },
    ],
    exits: [{ id: "stairs", rect: [-3, -34, 3, -33], to: "aurelin", spawn: "undercroft", label: "The stairs up to the Lowmarket" }],
    arrivals: { aurelin: { x: 0, z: -30, yaw: 0 } },
  },
};

/** Where you appear when entering `zone` through `arrival` (an arrivals key), or the zone's spawn. */
export const arrivalPoint = (zone, arrival) => zone.arrivals?.[arrival] ?? zone.spawn;
