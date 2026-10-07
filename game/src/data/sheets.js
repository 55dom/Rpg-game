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
    outfit: { top: "#2b4a8a", hem: "thigh", sleeves: "long", legs: "#232838", boots: "tall", bootColor: "#5a3a22",
      belt: "#5a3a22", pouches: 2, bracers: "#6a4a2a", grime: 0.2 } },
  bas: { build: "broad", gait: "heavy", idle: "relaxed",
    outfit: { top: "#2b4a8a", hem: "hip", sleeves: "long", legs: "#2f3442", boots: "ankle", bootColor: "#5a3a22",
      belt: "#5a3a22", pouches: 1, grime: 0.35 } },
  juno: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#2b4a8a", hem: "thigh", sleeves: "long", legs: "#3a2440", boots: "tall", bootColor: "#4a2a4a",
      belt: "#d0406a", pouches: 1, baldric: "#d0406a", grime: 0.1 } },
  lio: { build: "slim", gait: "nervous", idle: "fidget",
    outfit: { top: "#3a5a8a", hem: "knee", sleeves: "long", legs: "#2a3044", boots: "shoes", bootColor: "#4a2e1e",
      belt: "#6a4a2a", satchel: "#7a5232", collar: true, grime: 0.1 } },
  tamsin: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#c0402a", hem: "thigh", sleeves: "short", legs: "#4a3226", boots: "tall", bootColor: "#8a5a32",
      belt: "#8a5a32", pouches: 1, bracers: "#c9a24a", grime: 0.2 } },
  dagrun: { build: "broad", gait: "heavy", idle: "tired",
    outfit: { top: "#2a3346", hem: "knee", sleeves: "long", legs: "#2a2c33", boots: "tall", bootColor: "#5a3a22",
      belt: "#5a3a22", pouches: 2, buttons: "#1a1e28", grime: 0.3 } },
  cal: { build: "athletic", gait: "graceful", idle: "relaxed",
    outfit: { top: "#d9d3c4", hem: "knee", open: true, sleeves: "long", legs: "#2a2836", boots: "tall", bootColor: "#3a2a22",
      belt: "#e6b54e", bracers: "#e6b54e", grime: 0.1 } },
  // ---- Squad captains and nobles ----------------------------------------------------------------------
  severin: { build: "slim", gait: "confident", idle: "proud",
    outfit: { top: "#f4f2f8", hem: "thigh", sleeves: "long", legs: "#f4f2f8", boots: "tall", bootColor: "#2c4aa0",
      belt: "#d4ad4f", brooch: "#d4ad4f", bracers: "#d4ad4f", collar: true, grime: 0 } },
  corvina: { build: "lithe", gait: "graceful", idle: "proud",
    outfit: { top: "#f4f0e6", hem: "ankle", sleeves: "long", legs: "#e8e2d4", boots: "shoes", bootColor: "#d4ad4f",
      belt: "#d4ad4f", stitch: "#d4ad4f", embroidery: "#d4ad4f", collar: true, grime: 0 } },
  brannoc: { build: "broad", gait: "soldier", idle: "still",
    outfit: { top: "#6b7280", hem: "thigh", sleeves: "long", legs: "#3a3e48", boots: "tall", bootColor: "#8a929e",
      breastplate: "#9aa2ae", pauldrons: "#9aa2ae", belt: "#8a2a2a", gloves: "#5a2a2a", grime: 0.25 } },
  ysolde: { build: "lithe", gait: "prowl", idle: "alert",
    outfit: { top: "#2f7a4a", hem: "thigh", sleeves: "short", legs: "#2f5a3a", boots: "tall", bootColor: "#3a3022",
      belt: "#6a4a32", pouches: 2, bracers: "#8a6a3a", grime: 0.25 } },
  herald: { build: "slim", gait: "soldier", idle: "proud",
    outfit: { top: "#5a34a0", hem: "ankle", sleeves: "long", legs: "#2a2440", boots: "shoes", bootColor: "#3a2a22",
      belt: "#e6c040", grime: 0 } },
  // ---- The Tower ------------------------------------------------------------------------------------
  moss: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#6b4a2e", hem: "ankle", sleeves: "long", legs: "#4a3a2a", boots: "shoes", bootColor: "#3a2a1a",
      belt: "#8f7c58", satchel: "#5a4232", grime: 0.4, patches: 3 } },
  stranger: { build: "slim", gait: "soldier", idle: "still",
    outfit: { top: "#141218", hem: "thigh", sleeves: "long", legs: "#141218", boots: "tall", bootColor: "#5a3a22", belt: "#3a2a1a", grime: 0 } },
  // ---- The Pale Choir ---------------------------------------------------------------------------------
  acolyte: { build: "lithe", gait: "prowl", idle: "still",
    outfit: { top: "#c9c2cf", hem: "ankle", sleeves: "long", legs: "#3a1a4a", boots: "shoes", bootColor: "#3a1a4a", belt: "#4a1a5a", stitch: "#6a1a2a", gloves: "#1a1420", tattered: "#4a3a52", grime: 0.7 } },
  cantor: { build: "slim", gait: "graceful", idle: "still",
    outfit: { top: "#d2cad8", hem: "ankle", sleeves: "long", legs: "#3a1a4a", boots: "shoes", bootColor: "#3a1a4a", belt: "#5a2a7a", stitch: "#6a1a2a", gloves: "#1a1420", tattered: "#4a3a52", grime: 0.55 } },
  bulwark: { build: "broad", gait: "soldier", idle: "still",
    outfit: { top: "#5a4030", hem: "thigh", sleeves: "long", legs: "#3a2a2a", boots: "tall", bootColor: "#2a1e1a",
      belt: "#3a2a1a", baldric: "#a02a2a", bracers: "#8a6a3a", gloves: "#5a3a22", pouches: 2, grime: 0.3 } },
  // ---- Aurelin ------------------------------------------------------------------------------------------
  keeper: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#5a3a8a", hem: "ankle", sleeves: "long", legs: "#3a3040", boots: "shoes", bootColor: "#4a2e1e",
      belt: "#6a4a2a", pouches: 1, grime: 0.05 } },
  vendor: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#9a6232", hem: "thigh", sleeves: "long", legs: "#4a3426", boots: "tall", bootColor: "#5a3a22",
      belt: "#6a4a2a", pouches: 2, collar: true, grime: 0.15 } },
  guard: { build: "athletic", gait: "soldier", idle: "alert",
    outfit: { top: "#2b4fa0", hem: "knee", sleeves: "long", legs: "#2a2f3a", boots: "tall", bootColor: "#5a3a22",
      belt: "#5a3a22", pouches: 1, gloves: "#6a4a2a", bracers: "#6a4a2a", emblem: "#e6b54e", collar: true, grime: 0.15 } },
  gossip: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#7a4aa0", hem: "ankle", sleeves: "long", legs: null, boots: "shoes", bootColor: "#4a3020",
      belt: "#6a4a2a", stitch: "#9a70c0", grime: 0.1 } },
  kid: { build: "child", gait: "child", idle: "fidget",
    outfit: { top: "#4a8ad0", hem: "hip", sleeves: "short", legs: "#7a6a4a", shorts: true, boots: "shoes", bootColor: "#5a3a22",
      belt: "#6a4a2a", grime: 0.3 } },
  cook: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#ece6d8", hem: "ankle", sleeves: "long", legs: "#5a4a3a", boots: "ankle", bootColor: "#4a2e1e",
      belt: "#c0404a", pouches: 1, grime: 0.25 } },
  // ---- The Gilded Spoon (café) -----------------------------------------------------------------------------
  pip: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#2a2c48", hem: "knee", sleeves: "long", legs: "#1a1a20", boots: "shoes", bootColor: "#1a1418", apron: "#f6f1e8", collar: true, buttons: "#f6f1e8", grime: 0 } },
  mari: { build: "slim", gait: "confident", idle: "ready",
    outfit: { top: "#4a2038", hem: "knee", sleeves: "long", legs: "#1a1a20", boots: "shoes", bootColor: "#1a1418", apron: "#f6f1e8", collar: true, buttons: "#f6f1e8", grime: 0 } },
  bettany: { build: "lithe", gait: "nervous", idle: "fidget",
    outfit: { top: "#1f3a4c", hem: "knee", sleeves: "long", legs: "#1a1a20", boots: "shoes", bootColor: "#1a1418", apron: "#f6f1e8", collar: true, buttons: "#f6f1e8", grime: 0 } },
  hazel: { build: "athletic", gait: "soldier", idle: "still",
    outfit: { top: "#2a2a2e", hem: "knee", sleeves: "long", legs: "#1a1a20", boots: "shoes", bootColor: "#1a1418", apron: "#f6f1e8", collar: true, buttons: "#f6f1e8", grime: 0 } },
  odette: { build: "slim", gait: "graceful", idle: "proud",
    outfit: { top: "#16161e", hem: "knee", sleeves: "long", legs: "#1a1a20", boots: "shoes", bootColor: "#1a1418", apron: "#f6f1e8", collar: true, buttons: "#f6f1e8", grime: 0, embroidery: "#c9a24a" } },
  junoMaid: { build: "lithe", gait: "lively", idle: "fidget",
    outfit: { top: "#2b3a5c", hem: "knee", sleeves: "long", legs: "#3a2440", boots: "shoes", bootColor: "#1a1418", apron: "#f6f1e8", collar: true, belt: "#d0406a", buttons: "#f6f1e8", grime: 0 } },
  barnaby: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#f2ede2", hem: "knee", sleeves: "rolled", legs: "#4a3a2a", boots: "ankle", bootColor: "#3a2a1a", apron: "#e8e0d0", belt: "#c8414f", grime: 0.3 } },
  tobin: { build: "broad", gait: "heavy", idle: "tired",
    outfit: { top: "#8a5a2a", hem: "thigh", sleeves: "rolled", legs: "#4a3226", boots: "ankle", bootColor: "#3a2a1a", belt: "#3a2a1a", pouches: 1, grime: 0.35 } },
  fenwick: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#5a7a4a", hem: "thigh", sleeves: "long", legs: "#6a5a4a", boots: "shoes", bootColor: "#4a2e1e", buttons: "#c9a26a", grime: 0.05 } },
  nib: { build: "child", gait: "child", idle: "fidget",
    outfit: { top: "#e6b54e", hem: "hip", sleeves: "short", legs: "#5a4a3a", shorts: true, boots: "shoes", bootColor: "#5a3a22", belt: "#6a4a2a", grime: 0.4, patches: 1 } },
  traveler: { build: "athletic", gait: "prowl", idle: "alert",
    outfit: { top: "#3a3a4a", hem: "knee", sleeves: "long", legs: "#2a2a30", boots: "tall", bootColor: "#2a1e18", belt: "#2a1e18", pouches: 3, cloak: "#2a2a36", grime: 0.45 } },
  hetty: { build: "lithe", gait: "graceful", idle: "relaxed",
    outfit: { top: "#9a4a3a", hem: "ankle", sleeves: "rolled", legs: null, boots: "shoes", bootColor: "#4a2e1e", apron: "#e8d8b8", belt: "#6a4a2a", grime: 0.15 } },
  // ---- Thornwick ------------------------------------------------------------------------------------------
  wren: { build: "frail", gait: "old", idle: "relaxed",
    outfit: { top: "#7a4aa0", hem: "ankle", sleeves: "long", legs: null, boots: "shoes", bootColor: "#4a2e1e",
      belt: "#6a4a2a", stitch: "#9a70c0", satchel: "#8a6a4a", grime: 0.1 } },
  farmer: { build: "stocky", gait: "heavy", idle: "relaxed",
    outfit: { top: "#e6dcc0", hem: "hip", sleeves: "short", legs: "#5a6a3a", boots: "ankle", bootColor: "#6a4a2a",
      vest: "#4a8a3a", belt: "#6a4a2a", pouches: 1, grime: 0.45, patches: 2 } },
  smith: { build: "broad", gait: "heavy", idle: "still",
    outfit: { top: "#4a3026", hem: "thigh", sleeves: "long", legs: "#3a2a24", boots: "tall", bootColor: "#5a3a22",
      pauldrons: "#5a3a2a", leather: true, gloves: "#a02a2a", belt: "#6a4a2a", pouches: 2, grime: 0.45 } },
  ness: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#2f6a4a", hem: "knee", sleeves: "long", legs: "#2f5a3a", boots: "ankle", bootColor: "#4a3420",
      belt: "#6a4a2a", satchel: "#6a5232", pouches: 1, grime: 0.35 } },
  mirren: { build: "child", gait: "nervous", idle: "fidget",
    outfit: { top: "#8a6a4a", hem: "knee", sleeves: "long", legs: null, boots: "shoes", bootColor: "#5a3a22",
      belt: "#c0303a", grime: 0.35 } },
  bandit: { build: "athletic", gait: "prowl", idle: "alert",
    outfit: { top: "#4a3022", hem: "thigh", sleeves: "long", legs: "#2e221e", boots: "tall", bootColor: "#4a3020",
      leather: true, baldric: "#7a1e1e", belt: "#2a1e16", pouches: 3, bracers: "#4a3020", gloves: "#1e1612", pauldrons: "#3a2a20", tattered: "#2e221c", grime: 0.75, patches: 3 } },
  // ---- Townsfolk (regular NPCs built from the sheets' archetypes) ----------------------------------------
  townsman: { build: "athletic", gait: "confident", idle: "relaxed",
    outfit: { top: "#9a6232", hem: "thigh", sleeves: "long", legs: "#3a2622", boots: "tall", bootColor: "#5a3a22", belt: "#5a3a22", pouches: 1, grime: 0.3 } },
  townswoman: { build: "lithe", gait: "graceful", idle: "relaxed",
    outfit: { top: "#5a34a0", hem: "ankle", sleeves: "long", legs: null, boots: "shoes", bootColor: "#4a2e1e", belt: "#6a4a2a", stitch: "#8a64c0", grime: 0.15 } },
  laborer: { build: "broad", gait: "heavy", idle: "tired",
    outfit: { top: "#5a3a2a", hem: "hip", sleeves: "short", legs: "#4a3226", boots: "ankle", bootColor: "#3a2a1a", leather: true, belt: "#3a2a1a", gloves: "#6a4a2a", grime: 0.6, patches: 2 } },
  elder: { build: "frail", gait: "old", idle: "tired",
    outfit: { top: "#ece6d8", hem: "ankle", sleeves: "long", legs: "#5a4a3a", boots: "shoes", bootColor: "#4a2e1e", belt: "#c9a24a", grime: 0.1 } },
  // ---- Creatures and constructs (bodies, not clothes) --------------------------------------------------------
  beast: { build: "brute", gait: "heavy", idle: "still", outfit: { top: "#4e5a37", hem: null, sleeves: "long", legs: "#4e5a37", boots: "bare", bootColor: "#3a4129", moss: true } },
  hask: { build: "brute", gait: "heavy", idle: "still", outfit: { top: "#3d4934", hem: null, sleeves: "long", legs: "#3d4934", boots: "bare", bootColor: "#2c3524", moss: true } },
  clockwork: { build: "slim", gait: "machine", idle: "still", outfit: { top: "#a8822e", hem: null, sleeves: "long", legs: "#a8822e", boots: "bare", bootColor: "#6a5222", machine: true } },
});

/** The sheet for a look, with sensible defaults for anything new. */
export function sheetFor(kind, look = {}) {
  const s = SHEETS[kind] ?? SHEETS[{ severinAlly: "severin", junoMaid: "junoMaid" }[kind]];
  if (s) return s;
  return { build: "athletic", gait: "confident", idle: "relaxed",
    outfit: { top: look.coat ?? "#6a6a6a", hem: "thigh", sleeves: "long", legs: "#3a3a40", boots: "ankle", bootColor: "#3a2a22", belt: look.trim ?? "#5a3a22" } };
}
