// Character sheets (GDD §29): the body, outfit and movement of every character, built around
// their storyboard head (runtime/rig.js LOOKS keeps the head: face, hair, eyes, colors).
//
// Storyboard = identity (the head, never changed here).  Sheet = proportions, clothing, posture.
// The runtime builds one model from the sheet and every scene, fight and cutscene uses that same
// model, so a character never changes between shots.
//
// Units are metres before the character's overall scale (LOOKS.scale). The head always sits at
// the same height (HEAD_Y), so the body is fitted under it: longer legs mean a shorter torso.

export const HEAD_Y = 1.88;

/**
 * Body types. hip: hip-joint height (leg length) · sw: shoulder half-width · cw/ww/hw: chest, waist,
 * hip radii · depth: front-to-back squash · thigh/calf/ankle/knee: leg radii · arm: upper-arm radius ·
 * hand: hand size. Legs are long and slender (anime proportions): slim thighs, long calves, narrow ankles.
 */
export const BUILDS = Object.freeze({
  slim:     { hip: 1.0,  sw: 0.25, cw: 0.19, ww: 0.145, hw: 0.185, depth: 0.66, thigh: 0.082, knee: 0.05, calf: 0.058, ankle: 0.032, arm: 0.05, hand: 1 },
  lithe:    { hip: 1.02, sw: 0.235, cw: 0.185, ww: 0.135, hw: 0.2, depth: 0.66, thigh: 0.084, knee: 0.048, calf: 0.056, ankle: 0.03, arm: 0.046, hand: 0.92 },
  athletic: { hip: 0.99, sw: 0.29, cw: 0.22, ww: 0.165, hw: 0.195, depth: 0.68, thigh: 0.092, knee: 0.054, calf: 0.064, ankle: 0.034, arm: 0.058, hand: 1.05 },
  broad:    { hip: 0.96, sw: 0.34, cw: 0.27, ww: 0.22, hw: 0.23, depth: 0.72, thigh: 0.108, knee: 0.064, calf: 0.074, ankle: 0.04, arm: 0.07, hand: 1.15 },
  stocky:   { hip: 0.9,  sw: 0.33, cw: 0.29, ww: 0.27, hw: 0.26, depth: 0.78, thigh: 0.112, knee: 0.066, calf: 0.076, ankle: 0.042, arm: 0.068, hand: 1.12 },
  frail:    { hip: 0.95, sw: 0.24, cw: 0.19, ww: 0.17, hw: 0.185, depth: 0.68, thigh: 0.074, knee: 0.05, calf: 0.052, ankle: 0.032, arm: 0.045, hand: 0.95 },
  child:    { hip: 0.9,  sw: 0.23, cw: 0.2, ww: 0.18, hw: 0.19, depth: 0.74, thigh: 0.088, knee: 0.056, calf: 0.064, ankle: 0.04, arm: 0.054, hand: 1.05 },
  brute:    { hip: 0.86, sw: 0.42, cw: 0.36, ww: 0.3, hw: 0.3, depth: 0.82, thigh: 0.14, knee: 0.085, calf: 0.1, ankle: 0.06, arm: 0.09, hand: 1.35 },
});

/** How someone walks and stands. stride/bounce/sway/armSwing are multipliers; lean tips the chest; steps: cadence. */
export const GAITS = Object.freeze({
  confident: { stride: 1.08, bounce: 0.9, sway: 0.8, armSwing: 1.0, lean: -0.04, steps: 1.0 },
  soldier:   { stride: 1.0, bounce: 0.6, sway: 0.5, armSwing: 0.7, lean: -0.02, steps: 1.0 },
  graceful:  { stride: 1.0, bounce: 0.7, sway: 1.2, armSwing: 0.6, lean: -0.03, steps: 0.95, narrow: true },
  lively:    { stride: 0.95, bounce: 1.4, sway: 0.9, armSwing: 1.3, lean: 0.02, steps: 1.12 },
  nervous:   { stride: 0.8, bounce: 0.8, sway: 0.6, armSwing: 0.5, lean: 0.08, steps: 1.2 },
  heavy:     { stride: 0.9, bounce: 0.7, sway: 1.6, armSwing: 0.8, lean: 0.04, steps: 0.85, wide: true },
  old:       { stride: 0.7, bounce: 0.5, sway: 0.9, armSwing: 0.4, lean: 0.12, steps: 0.8 },
  child:     { stride: 0.9, bounce: 1.6, sway: 1.0, armSwing: 1.4, lean: 0.0, steps: 1.25 },
  prowl:     { stride: 1.0, bounce: 0.5, sway: 0.7, armSwing: 0.5, lean: 0.12, steps: 1.0 },
  machine:   { stride: 0.85, bounce: 0.3, sway: 0.4, armSwing: 0.4, lean: 0.0, steps: 0.8, stiff: true },
});

/** Idle styles: breathing rate, how often weight shifts, chest/head carriage. */
export const IDLES = Object.freeze({
  ready:   { breath: 1.0, shift: 0.35, chest: -0.03, fidget: 0.2 },
  proud:   { breath: 0.8, shift: 0.2, chest: -0.07, fidget: 0.1 },
  relaxed: { breath: 0.9, shift: 0.5, chest: 0.0, fidget: 0.3 },
  fidget:  { breath: 1.3, shift: 0.9, chest: 0.03, fidget: 0.9 },
  tired:   { breath: 0.7, shift: 0.4, chest: 0.08, fidget: 0.15 },
  alert:   { breath: 1.1, shift: 0.25, chest: -0.02, fidget: 0.5 },
  still:   { breath: 0.6, shift: 0.05, chest: 0.0, fidget: 0.0 },
});

/**
 * Outfits are built from layers, chosen by occupation, class, region and wealth (GDD §29.3).
 * top: garment over the torso · hem: how far it hangs ("hip" | "thigh" | "knee" | "ankle") · open: split front ·
 * sleeves: "long" | "rolled" | "short" · legs: trouser color (null = bare) · boots: "tall" | "ankle" | "shoes" | "waders" |
 * extras: belt, pouches, apron, breastplate, pauldrons, bracers, gloves, satchel, toolbelt, tabard, cloak, collar,
 * patches (repairs), grime (dirt toward the hem and boots: 0–1), brooch, chain.
 */
const knightBoots = "#3a2a22";
export const SHEETS = Object.freeze({
  // ---- The Last Lanterns -------------------------------------------------------------------------
  player: { build: "athletic", gait: "confident", idle: "ready",
    outfit: { top: "#2b3a5c", hem: "thigh", open: true, sleeves: "long", legs: "#1f2433", boots: "tall", bootColor: knightBoots,
      belt: "#5a3a22", pouches: 2, bracers: "#5a3a22", collar: true, grime: 0.25 } },
  bas: { build: "broad", gait: "heavy", idle: "relaxed",
    outfit: { top: "#2b3a5c", hem: "hip", sleeves: "rolled", legs: "#3a3f4a", boots: "ankle", bootColor: "#2a221c",
      belt: "#5a3a22", pouches: 1, gloves: "#6a4a32", bracers: "#8c909b", grime: 0.5, patches: 2 } },
  juno: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#2b3a5c", hem: "thigh", open: true, sleeves: "long", legs: "#2a2230", boots: "tall", bootColor: "#3a2430",
      belt: "#c8414f", pouches: 3, satchel: "#6a3a2a", grime: 0.15 } },
  lio: { build: "slim", gait: "nervous", idle: "fidget",
    outfit: { top: "#3f4f6e", hem: "knee", open: true, sleeves: "long", legs: "#2a3040", boots: "shoes", bootColor: "#3a2a22",
      belt: "#5a4a3a", satchel: "#7a5a3a", collar: true, grime: 0.1 } },
  tamsin: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#b8503a", hem: "thigh", sleeves: "short", legs: "#4a3a2a", boots: "tall", bootColor: "#5a3a22",
      belt: "#f0c26a", pouches: 1, bracers: "#f0c26a", grime: 0.3, patches: 1 } },
  dagrun: { build: "broad", gait: "heavy", idle: "tired",
    outfit: { top: "#3b404c", hem: "knee", open: true, sleeves: "long", legs: "#2a2c33", boots: "tall", bootColor: "#2a221c",
      belt: "#5a3a22", pouches: 2, pauldrons: "#6b6f7a", collar: true, grime: 0.45, patches: 3 } },
  cal: { build: "slim", gait: "graceful", idle: "relaxed",
    outfit: { top: "#d9d3c4", hem: "knee", open: true, sleeves: "long", legs: "#3a3540", boots: "tall", bootColor: "#2f2a36",
      belt: "#e6b54e", bracers: "#e6b54e", collar: true, grime: 0.05 } },
  // ---- Squad captains and nobles ----------------------------------------------------------------------
  severin: { build: "slim", gait: "confident", idle: "proud",
    outfit: { top: "#ece8f4", hem: "thigh", sleeves: "long", legs: "#f4f2f8", boots: "tall", bootColor: "#2c3a6e",
      belt: "#d4ad4f", brooch: "#d4ad4f", bracers: "#d4ad4f", collar: true, grime: 0 } },
  corvina: { build: "lithe", gait: "graceful", idle: "proud",
    outfit: { top: "#f2efe6", hem: "ankle", open: true, sleeves: "long", legs: "#e8e2d4", boots: "tall", bootColor: "#d4ad4f",
      belt: "#d4ad4f", brooch: "#d4ad4f", chain: "#d4ad4f", collar: true, grime: 0 } },
  brannoc: { build: "broad", gait: "soldier", idle: "still",
    outfit: { top: "#6b7280", hem: "thigh", sleeves: "long", legs: "#3a3e48", boots: "tall", bootColor: "#2a2c33",
      breastplate: "#9aa2ae", pauldrons: "#9aa2ae", belt: "#8a3a2a", gloves: "#5a4a3a", grime: 0.3, patches: 1 } },
  ysolde: { build: "lithe", gait: "prowl", idle: "alert",
    outfit: { top: "#2f6b5a", hem: "thigh", sleeves: "short", legs: "#3a4a3a", boots: "tall", bootColor: "#3a3022",
      belt: "#6a4a32", pouches: 2, bracers: "#6a4a32", gloves: "#6a4a32", grime: 0.35 } },
  herald: { build: "slim", gait: "soldier", idle: "proud",
    outfit: { top: "#3b2f62", hem: "ankle", sleeves: "long", legs: "#2a2440", boots: "shoes", bootColor: "#2a2222",
      tabard: "#d4ad4f", belt: "#d4ad4f", collar: true, grime: 0 } },
  // ---- The Tower ------------------------------------------------------------------------------------
  moss: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#6b5236", hem: "ankle", sleeves: "long", legs: "#4a3a2a", boots: "shoes", bootColor: "#3a2a1a",
      belt: "#8f7c58", grime: 0.4, patches: 3 } },
  stranger: { build: "slim", gait: "soldier", idle: "still",
    outfit: { top: "#0d0c12", hem: "knee", open: true, sleeves: "long", legs: "#0d0c12", boots: "tall", bootColor: "#0d0c12", grime: 0 } },
  // ---- The Pale Choir ---------------------------------------------------------------------------------
  acolyte: { build: "slim", gait: "prowl", idle: "still",
    outfit: { top: "#d9d2c3", hem: "ankle", sleeves: "long", legs: "#3d3050", boots: "shoes", bootColor: "#3d3050", belt: "#7a4f9a", grime: 0.2 } },
  cantor: { build: "slim", gait: "graceful", idle: "still",
    outfit: { top: "#d6cde6", hem: "ankle", sleeves: "long", legs: "#3d3050", boots: "shoes", bootColor: "#3d3050", belt: "#8a5fc0", chain: "#c9a4ff", grime: 0.1 } },
  bulwark: { build: "broad", gait: "soldier", idle: "still",
    outfit: { top: "#a3a9b5", hem: "knee", sleeves: "long", legs: "#3a3448", boots: "tall", bootColor: "#2f2a3a",
      breastplate: "#c3c9d5", pauldrons: "#c3c9d5", belt: "#6b4f8a", grime: 0.2 } },
  // ---- Aurelin ------------------------------------------------------------------------------------------
  keeper: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#4a3b5c", hem: "ankle", sleeves: "long", legs: "#3a3040", boots: "shoes", bootColor: "#2a2222",
      belt: "#e6b54e", chain: "#e6b54e", grime: 0.05 } },
  vendor: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#8a5a32", hem: "knee", open: true, sleeves: "long", legs: "#4a3a2a", boots: "ankle", bootColor: "#3a2a1a",
      belt: "#e6b54e", pouches: 3, satchel: "#5a3a22", chain: "#e6b54e", grime: 0.15 } },
  guard: { build: "athletic", gait: "soldier", idle: "alert",
    outfit: { top: "#3a4a6a", hem: "thigh", sleeves: "long", legs: "#2a2f3a", boots: "tall", bootColor: "#2a221c",
      breastplate: "#8a929e", tabard: "#2b4f8f", belt: "#3a2a1a", gloves: "#3a2a1a", cloak: "#2b4f8f", grime: 0.25 } },
  gossip: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#7a5a8a", hem: "ankle", sleeves: "long", legs: null, boots: "shoes", bootColor: "#4a3020",
      apron: "#e8e0cc", belt: "#5a3a22", grime: 0.15 } },
  kid: { build: "child", gait: "child", idle: "fidget",
    outfit: { top: "#4f81bd", hem: "hip", sleeves: "short", legs: "#6a5a4a", shorts: true, boots: "shoes", bootColor: "#4a3020",
      belt: "#8a6a3a", grime: 0.45, patches: 2 } },
  cook: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#e8e2d4", hem: "hip", sleeves: "rolled", legs: "#5a4a3a", boots: "ankle", bootColor: "#3a2a1a",
      apron: "#f2ece0", belt: "#c0504d", grime: 0.5 } },
  // ---- Thornwick ------------------------------------------------------------------------------------------
  wren: { build: "frail", gait: "old", idle: "relaxed",
    outfit: { top: "#6a5a7a", hem: "ankle", sleeves: "long", legs: null, boots: "shoes", bootColor: "#3a2a1a",
      apron: "#e8dcc4", belt: "#8a6a4a", grime: 0.2, patches: 2 } },
  farmer: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#c9c0a4", hem: "hip", sleeves: "rolled", legs: "#6a6a4a", boots: "ankle", bootColor: "#4a3420",
      vest: "#7a8a4a", belt: "#6a4a2a", pouches: 1, grime: 0.7, patches: 3 } },
  smith: { build: "broad", gait: "heavy", idle: "still",
    outfit: { top: "#5a4a40", hem: "hip", sleeves: "rolled", legs: "#3a3430", boots: "ankle", bootColor: "#2a2420",
      apron: "#4a3428", gloves: "#3a2a20", toolbelt: "#3a2a1a", grime: 0.85 } },
  ness: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#4a6a5a", hem: "knee", sleeves: "long", legs: "#3a4a42", boots: "waders", bootColor: "#2a3a32",
      belt: "#6a5a3a", satchel: "#5a4a32", grime: 0.6, patches: 4 } },
  mirren: { build: "child", gait: "nervous", idle: "fidget",
    outfit: { top: "#9a7a5a", hem: "knee", sleeves: "long", legs: null, boots: "shoes", bootColor: "#5a3a22",
      belt: "#d9634a", grime: 0.7, patches: 2 } },
  bandit: { build: "athletic", gait: "prowl", idle: "alert",
    outfit: { top: "#5a4a3a", hem: "thigh", sleeves: "rolled", legs: "#4a3a30", boots: "ankle", bootColor: "#3a2a20",
      belt: "#2a2018", pouches: 2, cloak: "#4a3a2a", bracers: "#3a2a20", grime: 0.75, patches: 4 } },
  // ---- Creatures and constructs (bodies, not clothes) --------------------------------------------------------
  beast: { build: "brute", gait: "heavy", idle: "still", outfit: { top: "#4e5a37", hem: null, sleeves: "long", legs: "#4e5a37", boots: "bare", bootColor: "#3a4129", moss: true } },
  hask: { build: "brute", gait: "heavy", idle: "still", outfit: { top: "#3d4934", hem: null, sleeves: "long", legs: "#3d4934", boots: "bare", bootColor: "#2c3524", moss: true } },
  clockwork: { build: "broad", gait: "machine", idle: "still", outfit: { top: "#9a7a3a", hem: null, sleeves: "long", legs: "#9a7a3a", boots: "bare", bootColor: "#5a4a2a", machine: true } },
});

/** The sheet for a look, with sensible defaults for anything new. */
export function sheetFor(kind, look = {}) {
  const s = SHEETS[kind];
  if (s) return s;
  return { build: "athletic", gait: "confident", idle: "relaxed",
    outfit: { top: look.coat ?? "#6a6a6a", hem: "thigh", sleeves: "long", legs: "#3a3a40", boots: "ankle", bootColor: "#3a2a22", belt: look.trim ?? "#5a3a22" } };
}
