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
  houses.push({ x: -28, z: 32, w: 10, d: 7, h: 6, color: "#ece2cc", roof: "#4a5a7a" });
  const stalls = [];
  for (let i = 0; i < 6; i++) stalls.push({ x: 18 + (i % 3) * 6, z: -8 + Math.floor(i / 3) * 10, canopy: ["#c0504d", "#e6b54e", "#4f81bd", "#9bbb59", "#8064a2", "#f79646"][i] });
  return {
    houses, stalls,
    hall: { x0: -11, z0: 26, x1: 11, z1: 42, door: { x: 0, z: 26 } },
    fountain: { x: 0, z: 0, r: 3.2 },
    gate: { x: 0, z: -34 },
    grate: { x: 30, z: -24 }, // the way down to the Undercroft
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
  // City walls on either side of the south gate.
  box(-42, -36, -4, -33), box(4, -36, 42, -33),
];

const T = THORNWICK_LAYOUT;
const thornwickSolids = [
  circle(T.oak.x, T.oak.z, T.oak.r),
  box(T.orphanage.x0, T.orphanage.z0, T.orphanage.x1, T.orphanage.z1),
  ...T.houses.map((h) => box(h.x - h.w / 2, h.z - h.d / 2, h.x + h.w / 2, h.z + h.d / 2)),
  box(T.smithy.x - T.smithy.w / 2, T.smithy.z - T.smithy.d / 2, T.smithy.x + T.smithy.w / 2, T.smithy.z + T.smithy.d / 2),
  circle(T.mill.x, T.mill.z, T.mill.r),
];
// The Fens set's own houses, ponds and well (runtime/sets.js buildFens).
const fensSolids = [
  ...[[-12, 14], [-4, 19], [6, 18], [14, 11], [-15, 4]].map(([x, z]) => circle(x, z, 2.5)),
  ...[[-22, 8, 9], [20, -16, 11], [24, 14, 7], [-18, -22, 8]].map(([x, z, r]) => circle(x, z, r - 1.2)),
  circle(3, 12, 0.9),
];
// Everything outside the rooms and passages is rock.
const undercroftSolids = UNDERCROFT_BANDS.flatMap(([z0, z1, hw]) => (hw >= UC_HALF ? [] : [box(-UC_HALF - 1, z0, -hw, z1), box(hw, z0, UC_HALF + 1, z1)]));
// A passage gate: bars across a passage at z (closed while a room's fight is on).
const gate = (z) => [-2, z - 0.3, 2, z + 0.3];

export const ZONES = {
  lighthouse: {
    id: "lighthouse", name: "The Lantern Lighthouse", region: "Dry Sea of Marrow", stage: "lighthouse",
    bounds: { rect: [-17, -17, 17, 17], solids: [circle(-9, 9, 2.6), box(-7.6, 10.6, -0.4, 15.6), box(4.1, 3.4, 5.9, 8.6)] },
    spawn: { x: 0, z: 2, yaw: 0 },
    cast: [
      { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "W_Dagrun" },
      { id: "juno", look: "juno", x: 3.6, z: 5, yaw: -1.4, node: "W_Juno" },
      { id: "bas", look: "bas", x: -5.6, z: -2.6, yaw: 0.6, node: "W_Bas" },
      { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "W_Tamsin" },
      { id: "cal", look: "cal", x: 1.6, z: -3.4, yaw: -0.6, node: "W_Cal" },
      { id: "lio", look: "lio", x: -2.6, z: 9.6, yaw: Math.PI * 0.9, node: "W_Lio" },
    ],
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
      { id: "keeper", look: "keeper", x: 3, z: 24.6, yaw: Math.PI, node: "W_HallKeeper" },
      { id: "vendor", look: "vendor", x: 21, z: -4.4, yaw: Math.PI / 2, node: "W_Vendor", shop: "lowmarket" },
      { id: "guard", look: "guard", x: 5.4, z: -30, yaw: -0.4, node: "W_Guard" },
      { id: "gossip", look: "gossip", x: -6, z: 4, yaw: 1.2, node: "W_Gossip" },
      { id: "kid", look: "kid", x: 4.6, z: 3.4, yaw: -2.2, node: "W_Kid" },
      { id: "crier", look: "herald", x: -4, z: -8, yaw: 0.4, node: "W_Crier" },
      { id: "cook", look: "cook", x: 5.6, z: -5.4, yaw: -0.6, node: "W_Cook" },
    ],
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
      { id: "wren", look: "wren", x: 2.6, z: 13.4, yaw: Math.PI, node: "W_Wren" },
      { id: "farmer", look: "farmer", x: 9, z: -12, yaw: -1.2, node: "W_Farmer" },
      { id: "smith", look: "smith", x: -9, z: -4.6, yaw: 0.3, node: "W_Smith" },
    ],
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
    cast: [{ id: "ness", look: "ness", x: 7, z: -1.4, yaw: -0.8, node: "W_Ness" }],
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
