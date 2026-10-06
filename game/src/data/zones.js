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
  };
})();

const A = AURELIN_LAYOUT;
const aurelinSolids = [
  ...A.houses.map((h) => box(h.x - h.w / 2, h.z - h.d / 2, h.x + h.w / 2, h.z + h.d / 2)),
  ...A.stalls.map((s) => box(s.x - 1.4, s.z - 1, s.x + 1.4, s.z + 1)),
  box(A.hall.x0, A.hall.z0, A.hall.x1, A.hall.z1),
  circle(A.fountain.x, A.fountain.z, A.fountain.r),
  // City walls on either side of the south gate.
  box(-42, -36, -4, -33), box(4, -36, 42, -33),
];

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
    exits: [{ id: "road", rect: [-17, -17, 17, -15.5], to: "aurelin", spawn: "gate", label: "The road to Aurelin" }],
    arrivals: { aurelin: { x: 0, z: -13, yaw: 0 } },
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
    exits: [{ id: "gate", rect: [-4, -36, 4, -34.4], to: "lighthouse", spawn: "aurelin", label: "The road home to the Lighthouse" }],
    arrivals: { gate: { x: 0, z: -31, yaw: 0 } },
    crowd: 22,
  },
};

/** Where you appear when entering `zone` through `arrival` (an arrivals key), or the zone's spawn. */
export const arrivalPoint = (zone, arrival) => zone.arrivals?.[arrival] ?? zone.spawn;
