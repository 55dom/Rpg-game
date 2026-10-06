// Procedural characters built from primitives, posed from ability frame data.
// No skeletal art yet: silhouettes are designed to read at a glance (Phase 3 swaps in real models).

import { B, PALETTE, toon2 as toon, glow, inkOutline, lineOf, refreshWorld, lerp, clamp01, easeOut, easeInOut } from "./look.js";
import { ROOK_POSES } from "../data/rook.js";
import { ACOLYTE_POSES } from "../data/acolyte.js";
import { BAS_POSES, JUNO_POSES } from "../data/companions.js";
import { ENEMIES } from "../data/enemies.js";
import { HASK_POSES } from "../data/hask.js";
import { SEVERIN_POSES } from "../data/severin.js";
import { CAL_POSES } from "../data/cal.js";
import { EventType } from "../core/abilities.js";
import { buildBody, skinBake } from "./body.js";
import { animateHumanoid } from "./motion.js";

/** Attacks animate over their active frames; a move counts as an attack if it hits (directly or via hitboxes). */
const isAttack = (a) => a.hasHit || a.events.some((e) => e.type === EventType.SpawnHitbox);

const SWORD_TIP = 1.95, SWORD_HILT = 0.72;

/**
 * Reshape a sphere into an anime head (GDD §29.1, the design sheets): the cranium stays round, the lower
 * half narrows toward a soft chin that sits a little lower and forward. `r` is the sphere's radius.
 */
/**
 * A rounded "box": an elliptic cylinder with the box's width and depth (no hard corners). Hair locks,
 * fringes, helm parts and monster skulls use these instead of blocks.
 */
function softBox(name, { width = 1, height = 1, depth = 1 }, scene) {
  const BB = B();
  const m = BB.MeshBuilder.CreateCylinder(name, { height, diameter: 1, tessellation: 12 }, scene);
  m.bakeTransformIntoVertices(BB.Matrix.Scaling(width, 1, depth));
  return m;
}

export function animeHead(mesh, r, jaw = 0.32) {
  const BB = B(), P = mesh.getVerticesData(BB.VertexBuffer.PositionKind);
  for (let i = 0; i < P.length; i += 3) {
    const y = P[i + 1] / r;
    if (y >= 0) continue;
    const t = Math.min(1, -y), front = Math.max(0, P[i + 2] / r);
    P[i] *= 1 - jaw * t * t;                     // narrower jaw
    P[i + 1] *= 1 + 0.1 * t;                     // a slightly longer chin
    P[i + 2] = P[i + 2] * (1 - 0.18 * t * t) + 0.04 * r * t * front; // cheeks in, chin forward
  }
  mesh.updateVerticesData(BB.VertexBuffer.PositionKind, P);
  const N = [];
  BB.VertexData.ComputeNormals(P, mesh.getIndices(), N);
  mesh.updateVerticesData(BB.VertexBuffer.NormalKind, N);
  return mesh;
}

function part(mesh, parent, x, y, z, outline = 0.03) {
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  if (outline) inkOutline(mesh, outline);
  mesh.isPickable = false;
  return mesh;
}

/**
 * How each kind of fighter is built. Everything visual about a character lives here:
 * proportions, colors, head (face + hair style, or hood + mask), weapon, and extras.
 */
export const LOOKS = {
  player: { poses: ROOK_POSES, scale: 1, skirt: 0.95, coat: PALETTE.rookCoat, trim: PALETTE.rookTrim, hairColor: PALETTE.hair,
    skin: PALETTE.skin, head: "face", hair: "spiky", collar: true, weapon: "sword", grimoire: true, eyeColor: "#2a1e1a", trail: "#ffd98a" },
  acolyte: { poses: ACOLYTE_POSES, scale: 1.04, skirt: 1.15, coat: PALETTE.acolyteRobe, trim: "#5a2a7a", hairColor: "#3a1a4a",
    skin: PALETTE.mask, head: "helm", helm: "#7a7488", menace: true, sash: true, weapon: "blade", stoop: 0.1, trail: "#ff5a4a" },
  bas: { poses: BAS_POSES, scale: 1.18, skirt: 1.05, coat: "#2b3a5c", trim: PALETTE.rookTrim, hairColor: "#1b1716", skin: "#6b4632",
    head: "face", hair: "crop", collar: true, weapon: "fist", accent: "#7c8490", shoulders: 1.25, eyeColor: "#2a1a12", trail: "#e8b46a" },
  hound: { poses: ENEMIES.hound.poses, scale: 1, form: "beast", fur: "#5b4b39", belly: "#8a7458", eyes: "#ffd25a", trail: "#ffb35a" },
  cantor: { poses: ENEMIES.cantor.poses, scale: 1.08, skirt: 1.2, coat: "#ece6f4", trim: "#5a2a7a", hairColor: "#3a1a4a", skin: PALETTE.mask,
    head: "helm", helm: "#827c90", menace: true, sash: true, weapon: "staff", halo: true, stoop: 0.08, trail: "#b98cff" },
  bulwark: { poses: ENEMIES.bulwark.poses, scale: 1.12, skirt: 1.2, coat: "#5a4030", trim: "#6b4f8a", hairColor: "#5a3a8a", skin: PALETTE.mask,
    head: "helm", helm: "#a8a2b8", weapon: "spear", shield: true, shoulders: 1.2, trail: "#c9b8ff" },
  beast: { poses: ENEMIES.beast.poses, scale: 1.6, skirt: 1.5, coat: "#3a4a2a", trim: "#4a3a22", hairColor: "#2f3a22", skin: "#3a4a2a",
    head: "lump", weapon: "claw", shoulders: 1.55, accent: "#24301a", eyes: "#ffd23a", talon: "#d8cfb4", stoop: 0.28, trail: "#a6c96a" },
  rat: { poses: ENEMIES.rat.poses, scale: 0.55, form: "beast", fur: "#5a5560", belly: "#8a8290", eyes: "#ff5a4a", trail: "#c9a4a4" },
  clockwork: { poses: ENEMIES.clockwork.poses, scale: 1.25, skirt: 0.9, coat: "#8a6a26", trim: "#d9b45a", hairColor: "#8a6a26", skin: "#8a6a26",
    head: "skull", weapon: "claw", accent: "#2a2622", talon: "#5a5e66", shoulders: 1.3, eyes: "#ff2a1a", gear: true, stoop: 0.12, trail: "#ff5a3a" },
  bandit: { poses: ENEMIES.bandit.poses, scale: 1.02, skirt: 1.0, coat: "#4a3022", trim: "#8a2a2a", hairColor: "#3a2618", skin: "#d8a888",
    head: "face", hair: "spiky", hood: "#2e221c", mask: "#6a1e1e", angry: true, weapon: "blade", eyeColor: "#2a1a10", stoop: 0.06, trail: "#ff8a6a" },
  hask: { poses: HASK_POSES, scale: 2.0, skirt: 1.7, coat: "#2f3a26", trim: "#5c4a2e", hairColor: "#222a1a", skin: "#2f3a26",
    head: "lump", weapon: "claw", shoulders: 1.7, accent: "#1a2214", eyes: "#ff8a1a", talon: "#d8cfb4", stoop: 0.3, trail: "#c9a24a", mound: true },
  // Story cast (Phase 3). Poses borrow Rook's rest stance until they get their own moves.
  dagrun: { poses: ACOLYTE_POSES, scale: 1.3, skirt: 1.35, coat: "#2a3346", trim: "#e6b54e", hairColor: "#5a3d2b", skin: "#e2b894",
    head: "face", hair: "crop", beard: "#5a3d2b", collar: true, weapon: "none", shoulders: 1.5, eyeColor: "#3a2618", trail: "#e6b54e" },
  cal: { poses: CAL_POSES, scale: 1.04, skirt: 0.8, coat: "#ece8de", trim: "#e6b54e", hairColor: "#1e1c26", skin: "#efd2b8",
    head: "face", hair: "long", collar: true, weapon: "sword", eyeColor: "#2a2a3a", trail: "#ffd98a" },
  corvina: { poses: ACOLYTE_POSES, scale: 1.04, skirt: 1.05, coat: "#f2efe6", trim: "#d4ad4f", hairColor: "#b8d0ec", skin: "#f3dcc8",
    head: "face", hair: "long", weapon: "none", eyeColor: "#4a6aa0", trail: "#e9f2ff" },
  brannoc: { poses: ACOLYTE_POSES, scale: 1.16, skirt: 1.1, coat: "#6b7280", trim: "#8a3a2a", hairColor: "#9a9a9a", skin: "#d8a888",
    head: "face", hair: "crop", beard: "#a8a8a8", weapon: "sword", shoulders: 1.35, eyeColor: "#3a3a40", trail: "#c9d2dc" },
  ysolde: { poses: ACOLYTE_POSES, scale: 1.0, skirt: 0.95, coat: "#2f7a4a", trim: "#9fe6c8", hairColor: "#e0702a", skin: "#f0cfb2",
    head: "face", hair: "long", weapon: "spear", eyeColor: "#8a4a1a", trail: "#9fe6c8" },
  lio: { poses: ACOLYTE_POSES, scale: 0.97, skirt: 1.15, coat: "#3a5a8a", trim: "#a9b8d8", hairColor: "#e2e2e8", skin: "#f0d8c6",
    head: "face", hair: "bob", weapon: "none", grimoire: true, holds: "lantern", eyeColor: "#7a808c", trail: "#a9b8d8" },
  tamsin: { poses: ACOLYTE_POSES, scale: 0.95, skirt: 0.95, coat: "#c0402a", trim: "#f0c26a", hairColor: "#f0c850", skin: "#f1d0b4",
    head: "face", hair: "tousled", collar: true, weapon: "none", eyeColor: "#2a5ab0", trail: "#f0c26a" },
  mirren: { poses: ACOLYTE_POSES, scale: 0.66, skirt: 0.95, coat: "#8a6a4a", trim: "#c9a26a", hairColor: "#6a4228", skin: "#f0cfb2",
    head: "face", hair: "ponytail", accent: "#d9634a", weapon: "none", eyeColor: "#5a3a22", trail: "#c9a26a" },
  keeper: { poses: ACOLYTE_POSES, scale: 0.95, skirt: 1.2, coat: "#5a3a8a", trim: "#e6c040", hairColor: "#ecebe6", skin: "#f0d0b4",
    head: "face", hair: "crop", beard: "#ecebe6", weapon: "none", sash: true, stoop: 0.12, eyeColor: "#4a4a5a", trail: "#e6b54e" },
  vendor: { poses: ACOLYTE_POSES, scale: 1.0, skirt: 1.15, coat: "#9a6232", trim: "#e6c040", hairColor: "#1a1412", skin: "#7a4a2e",
    head: "face", hair: "crop", weapon: "none", sash: true, shoulders: 1.15, eyeColor: "#2a1a12", trail: "#e6b54e" },
  guard: { poses: ACOLYTE_POSES, scale: 1.06, skirt: 1.0, coat: "#2b4fa0", trim: "#e6b54e", hairColor: "#4a3020", skin: "#f0d0b4",
    head: "face", hair: "spiky", weapon: "spear", shoulders: 1.15, eyeColor: "#3a2618", trail: "#c9d2dc" },
  gossip: { poses: ACOLYTE_POSES, scale: 0.97, skirt: 1.2, coat: "#7a4aa0", trim: "#d8c8e8", hairColor: "#e06a2a", skin: "#f3dcc8",
    head: "face", hair: "long", weapon: "none", holds: "scroll", eyeColor: "#8a4a2a", trail: "#d8c8e8" },
  kid: { poses: ACOLYTE_POSES, scale: 0.62, skirt: 0.9, coat: "#4a8ad0", trim: "#e6b54e", hairColor: "#16161c", skin: "#f0d0b4",
    head: "face", hair: "spiky", weapon: "none", eyeColor: "#2a2a30", trail: "#e6b54e" },
  wren: { poses: ACOLYTE_POSES, scale: 0.94, skirt: 1.3, coat: "#7a4aa0", trim: "#c9a26a", hairColor: "#e4e4e8", skin: "#f3dcc8",
    head: "face", hair: "long", weapon: "none", holds: "scroll", stoop: 0.06, eyeColor: "#6a6a7a", trail: "#f0c8a0" },
  farmer: { poses: ACOLYTE_POSES, scale: 1.05, skirt: 1.05, coat: "#e6dcc0", trim: "#c9a26a", hairColor: "#8a6a3a", skin: "#e2b894",
    head: "face", hair: "crop", beard: "#8a6a3a", weapon: "none", shield: "kite", shieldColor: "#ecebe6", shoulders: 1.2, eyeColor: "#3a2a1a", trail: "#c9d27a" },
  smith: { poses: ACOLYTE_POSES, scale: 1.14, skirt: 1.1, coat: "#4a3026", trim: "#c0504d", hairColor: "#2a1e18", skin: "#e2b08a",
    head: "face", hair: "spiky", beard: "#2a1e18", weapon: "none", shield: "heater", shieldColor: "#6a2a26", shoulders: 1.4, eyeColor: "#2a1a12", trail: "#e09a6a" },
  ness: { poses: ACOLYTE_POSES, scale: 0.98, skirt: 1.2, coat: "#2f6a4a", trim: "#9fc0b0", hairColor: "#ecebe6", skin: "#f0d0b4",
    head: "face", hair: "crop", beard: "#ecebe6", weapon: "staff", orb: "#b06aff", stoop: 0.18, eyeColor: "#4a4a5a", trail: "#9fc0b0" },
  cook: { poses: ACOLYTE_POSES, scale: 1.04, skirt: 1.3, coat: "#ece6d8", trim: "#e6c040", hairColor: "#6a4228", skin: "#e2b894",
    head: "face", hair: "crop", beard: "#6a4228", weapon: "none", sash: true, shoulders: 1.25, eyeColor: "#3a2618", trail: "#ffcf7a" },
  // Townsfolk (the sheets' archetypes, for regular NPCs who go about their day).
  townsman: { poses: ACOLYTE_POSES, scale: 1.0, skirt: 1.0, coat: "#9a6232", trim: "#6a4a2a", hairColor: "#4a3020", skin: "#e2b894",
    head: "face", hair: "spiky", weapon: "none", eyeColor: "#3a2618", trail: "#c9a26a" },
  townswoman: { poses: ACOLYTE_POSES, scale: 0.95, skirt: 1.2, coat: "#5a34a0", trim: "#6a4a2a", hairColor: "#b04a26", skin: "#f3dcc8",
    head: "face", hair: "long", weapon: "none", eyeColor: "#6a2a1a", trail: "#c9a26a" },
  laborer: { poses: ACOLYTE_POSES, scale: 1.08, skirt: 1.0, coat: "#5a3a2a", trim: "#6a4a2a", hairColor: "#2a1e18", skin: "#c88a64",
    head: "face", hair: "crop", beard: "#2a1e18", weapon: "none", shoulders: 1.3, eyeColor: "#2a1a12", trail: "#c9a26a" },
  elder: { poses: ACOLYTE_POSES, scale: 0.92, skirt: 1.2, coat: "#ece6d8", trim: "#e6c040", hairColor: "#e4e4e8", skin: "#f0d0b4",
    head: "face", hair: "crop", beard: "#e4e4e8", weapon: "none", sash: true, stoop: 0.15, eyeColor: "#4a4a5a", trail: "#c9a26a" },
  stranger: { poses: ACOLYTE_POSES, scale: 1.08, skirt: 0.78, coat: "#141218", trim: "#141218", hairColor: "#0d0c12", skin: "#0d0c12",
    head: "blank", hair: "crop", weapon: "none", carry: true, trail: "#000000" },
  severin: { poses: SEVERIN_POSES, scale: 1.02, skirt: 0.9, coat: "#f4f2f8", trim: "#d4ad4f", hairColor: "#ecd890", skin: "#f3dcc8",
    head: "face", hair: "swept", weapon: "needle", accent: "#d4ad4f", cape: "#2c4aa0", eyeColor: "#3a6ab0", trail: "#fff1b8" },
  moss: { poses: ACOLYTE_POSES, scale: 1.04, skirt: 1.1, coat: "#6b4a2e", trim: "#8f7c58", hairColor: "#e4e4e8", skin: "#e8c4a6",
    head: "face", hair: "crop", beard: "#ecebe6", beardLong: true, wrinkles: true, weapon: "branch", accent: "#b89a5a", stoop: 0.24, eyeColor: "#5a5a6a", trail: "#e8d6a0" },
  herald: { poses: ACOLYTE_POSES, scale: 1.05, skirt: 1.15, coat: "#5a34a0", trim: "#e6c040", hairColor: "#16141c", skin: "#f0d0b4",
    head: "face", hair: "bob", weapon: "none", sash: true, eyeColor: "#3a2618", trail: "#d4ad4f" },
  juno: { poses: JUNO_POSES, scale: 0.93, skirt: 0.9, coat: "#2b3a5c", trim: "#c8414f", hairColor: "#b04a26", skin: "#f3d5bf",
    head: "face", hair: "sidetail", collar: true, weapon: "needle", accent: "#c8414f", eyeColor: "#6a2a1a", trail: "#ff6f86" },
};

export class Rig {
  /** @param {*} scene @param {string} kind a LOOKS key @param {string} id */
  constructor(scene, kind, id) {
    const BB = B(), MB = BB.MeshBuilder;
    const L = LOOKS[kind] ?? LOOKS.acolyte;
    this.kind = kind;
    this.look = L;
    this.scene = scene;
    this.poses = L.poses;
    this.root = new BB.TransformNode(`${id}-root`, scene);
    this.root.scaling.setAll(L.scale);
    this.body = new BB.TransformNode(`${id}-body`, scene);
    this.body.parent = this.root;
    this.bodyY = L.form === "beast" ? 0.62 : 0.9;
    this.body.position.y = this.bodyY;
    this.meshes = [];
    const add = (m, parent, x, y, z, o) => { this.meshes.push(part(m, parent, x, y, z, o)); return m; };
    const M = (n, hex) => toon(scene, `${id}-${n}`, hex);
    if (L.form === "beast") { this._buildBeast(scene, id, L, add, M); this._buildCommon(scene, id); return; }

    const coat = M("coat", L.coat);
    const trim = M("trim", L.trim);
    const dark = toon(scene, `${id}-dark`, L.hairColor, { gloss: L.head === "face" }); // hair gets the anime gloss
    const skin = toon(scene, `${id}-skin`, L.skin, { softShadow: 0.62 });
    const steel = M("steel", PALETTE.steel);
    const accent = L.accent ? M("accent", L.accent) : trim;

    // The body: anatomy and outfit from the character sheet, fitted under the storyboard head (runtime/body.js).
    this.body.dispose();
    buildBody(this, scene, id, L, kind, add, skin);
    const ty = (y) => y * this.T / 0.9; // the old torso spanned 0–0.9; fixtures keep their place on the new one
    if (L.head === "face" || L.head === "blank") { // "blank": a featureless silhouette head
      // Faces and hair overlap, so their own ink outlines would draw lines across the face (and hide the
      // eyes from the side). Instead one silhouette shell wraps the whole head: an inverted hull that only
      // shows around the outside edge.
      // The face shape from the design sheets: a round cranium tapering to a soft, narrower jaw and chin (anime style).
      const face = add(animeHead(MB.CreateSphere("head", { diameter: 0.46, segments: 14, updatable: true }, scene), 0.23), this.head, 0, 0, 0, 0);
      const shell = add(animeHead(MB.CreateSphere("headLine", { diameter: 0.6, segments: 14, sideOrientation: BB.Mesh.BACKSIDE, updatable: true }, scene), 0.3, 0.45), this.head, 0, 0.04, -0.04, 0);
      const lineMat = new BB.StandardMaterial(`${id}-headLine`, scene);
      lineMat.disableLighting = true; lineMat.emissiveColor = lineOf(L.hairColor); lineMat.diffuseColor = BB.Color3.Black(); lineMat.specularColor = BB.Color3.Black();
      shell.material = lineMat; shell.metadata = { noGlow: true }; // ink, not light: keep it out of the glow pass
      if (L.hair === "crop") shell.scaling.set(1.02, 0.92, 1);
      face.material = skin;
      const eyeMat = toon(scene, `${id}-eye`, L.eyeColor ?? "#1a1c26");
      for (const x of L.head === "blank" ? [] : [-0.085, 0.085]) {
        const eye = add(MB.CreateSphere("eye", { diameter: 0.09, segments: 6 }, scene), this.head, x, 0.03, 0.218, 0);
        eye.scaling.set(0.8, 1.4, 0.85); // must clear the face's ink-outline shell (+0.03) to show
        eye.material = eyeMat;
        // Layered eye highlights (one big, one small), the anime glint.
        const hl = add(MB.CreateSphere("eyeHi", { diameter: 0.032, segments: 4 }, scene), this.head, x + 0.018, 0.06, 0.255, 0);
        hl.material = this.eyeHi ??= glow(scene, `${id}-eyeHi`, "#ffffff");
        hl.metadata = { noGlow: true }; // a catchlight, not a light: no bloom (and no extra glow-pass draw)
        const hl2 = add(MB.CreateSphere("eyeHi2", { diameter: 0.016, segments: 4 }, scene), this.head, x - 0.014, 0.01, 0.255, 0);
        hl2.material = this.eyeHi; hl2.metadata = { noGlow: true };
      }
      if (L.head === "face") { // the rest of the face from the sheets: brows, a small nose, a mouth, ears
        const brow = M("brow", L.hairColor === "#ecebe6" || L.hairColor === "#e4e4e8" || L.hairColor === "#e2e2e8" ? "#9a9aa4" : L.hairColor);
        for (const sx of [-1, 1]) {
          const b = add(MB.CreateBox("brow", { width: 0.085, height: 0.016, depth: 0.02 }, scene), this.head, sx * 0.088, 0.112, 0.2, 0);
          b.rotation.set(-0.45, 0, sx * (L.angry ? 0.42 : -0.12)); b.material = brow; // angry: brows slant down to the nose
          if (L.angry) b.position.y -= 0.012;
          const ear = add(MB.CreateSphere("ear", { diameter: 0.075, segments: 5 }, scene), this.head, sx * 0.222, 0.0, -0.01, 0);
          ear.scaling.set(0.45, 1, 0.7); ear.material = skin;
        }
        const nose = add(MB.CreateSphere("nose", { diameter: 0.034, segments: 4 }, scene), this.head, 0, -0.03, 0.226, 0);
        nose.scaling.set(0.8, 1.1, 0.8); nose.material = M("nose", L.skin);
        if (!L.beard) { const mouth = add(MB.CreateBox("mouth", { width: 0.05, height: 0.011, depth: 0.012 }, scene), this.head, 0, -0.1, 0.218, 0); mouth.rotation.x = -0.4; mouth.material = M("mouth", "#8a4a42"); }
      }
      if (L.mask) { // a cloth mask over the nose and mouth (bandits)
        const m = add(animeHead(MB.CreateSphere("faceMask", { diameter: 0.475, segments: 12, slice: 0.42, updatable: true }, scene), 0.2375), this.head, 0, 0, 0.006, 0);
        m.rotation.x = Math.PI; m.material = M("faceMask", L.mask);
      }
      // Hair: a full sphere set back and up. The face sphere pokes out of its front, eyes included.
      const cap = add(MB.CreateSphere("hairCap", { diameter: 0.5, segments: 12 }, scene), this.head, 0, 0.06, -0.07, 0);
      cap.material = dark;
      if (L.hair === "spiky") {
        const spikes = [[0, 0.2, -0.05, -0.5, 0], [0.14, 0.16, -0.06, -0.6, -0.5], [-0.14, 0.16, -0.06, -0.6, 0.5],
          [0.08, 0.1, -0.2, -1.3, -0.2], [-0.08, 0.1, -0.2, -1.3, 0.2], [0, 0.17, 0.12, 0.35, 0]];
        for (const [x, y, z, rx, rz] of spikes) {
          const c = add(MB.CreateCylinder("spike", { height: 0.32, diameterTop: 0, diameterBottom: 0.2, tessellation: 6 }, scene), this.head, x, y, z, 0.02);
          c.rotation.set(rx, 0, rz);
          c.material = dark;
        }
      } else if (L.hair === "tousled") { // short, messy tufts swept back, a ragged fringe (Tamsin's sheet)
        cap.scaling.set(1.03, 0.95, 1);
        for (const [x, y, z, rx, rz] of [[0, 0.21, 0, -0.9, 0], [0.11, 0.19, -0.04, -1.0, -0.4], [-0.11, 0.19, -0.04, -1.0, 0.4], [0.06, 0.12, -0.2, -1.6, -0.2], [-0.06, 0.12, -0.2, -1.6, 0.2]]) {
          const t = add(MB.CreateCylinder("tuft", { height: 0.2, diameterTop: 0, diameterBottom: 0.16, tessellation: 6 }, scene), this.head, x, y, z, 0.015);
          t.rotation.set(rx, 0, rz); t.material = dark;
        }
        for (const [x, r] of [[-0.09, 0.2], [0.0, 0], [0.09, -0.2]]) {
          const f = add(MB.CreateCylinder("fringeTuft", { height: 0.13, diameterTop: 0, diameterBottom: 0.1, tessellation: 5 }, scene), this.head, x, 0.15, 0.16, 0);
          f.rotation.set(Math.PI - 0.5, 0, r); f.material = dark;
        }
      } else if (L.hair === "swept") { // a noble's swept fringe falling over one eye
        const sweep = add(MB.CreateSphere("sweep", { diameter: 0.3, segments: 8 }, scene), this.head, -0.07, 0.13, 0.12, 0);
        sweep.scaling.set(1.15, 0.45, 0.75); sweep.rotation.set(0.35, 0.2, 0.4); sweep.material = dark;
      } else if (L.hair === "long") { // loose hair down past the shoulders
        const back = add(MB.CreateCapsule("hairBack", { height: 0.7, radius: 0.2, tessellation: 10 }, scene), this.head, 0, -0.18, -0.16, 0.02);
        back.scaling.set(1.15, 1, 0.55); back.material = dark;
        const fringe = add(MB.CreateSphere("fringe", { diameter: 0.34, segments: 8 }, scene), this.head, 0.03, 0.14, 0.12, 0);
        fringe.scaling.set(1.25, 0.42, 0.7); fringe.rotation.set(0.3, 0, -0.18); fringe.material = dark;
      } else if (L.hair === "crop") {
        cap.scaling.set(1.02, 0.86, 1); // close-cropped and flat on top
        cap.position.y = 0.04;
        const fr = add(softBox("cropFringe", { width: 0.28, height: 0.05, depth: 0.07 }, scene), this.head, 0, 0.2, 0.12, 0); // a short fringe, as on the sheets
        fr.rotation.x = 0.85; fr.material = dark;
      } else if (L.hair === "bob") { // chin-length, straight fringe
        // The back of the bob sits behind the face; two side locks frame the cheeks down to the jaw; the fringe stays above the brows.
        const back = add(MB.CreateSphere("bob", { diameter: 0.52, segments: 10 }, scene), this.head, 0, -0.02, -0.1, 0);
        back.scaling.set(1.06, 0.92, 0.85); back.material = dark;
        for (const sx of [-1, 1]) { const lock = add(softBox("bobLock", { width: 0.07, height: 0.3, depth: 0.2 }, scene), this.head, sx * 0.215, -0.07, 0.03, 0); lock.rotation.z = sx * 0.08; lock.material = dark; }
        const fringe = add(softBox("bobFringe", { width: 0.34, height: 0.06, depth: 0.09 }, scene), this.head, 0, 0.19, 0.15, 0);
        fringe.rotation.x = 0.7; fringe.material = dark;
      } else if (L.hair === "bun") { // pulled back into a bun
        cap.scaling.set(1.0, 0.9, 1.0);
        const bun = add(MB.CreateSphere("bun", { diameter: 0.2, segments: 8 }, scene), this.head, 0, 0.12, -0.26, 0); bun.material = dark;
      } else if (L.hair === "ponytail") { // tied at the back
        const tie = add(MB.CreateSphere("hairTie", { diameter: 0.08, segments: 6 }, scene), this.head, 0, 0.1, -0.24, 0.015); tie.material = accent;
        const tail = add(MB.CreateCapsule("ponyTail", { height: 0.4, radius: 0.07, tessellation: 8 }, scene), this.head, 0, -0.06, -0.3, 0.02);
        tail.rotation.x = 0.35; tail.material = dark; this.hairTail = tail;
        const bang = add(softBox("bangs", { width: 0.34, height: 0.09, depth: 0.1 }, scene), this.head, 0, 0.16, 0.15, 0); bang.rotation.x = 0.5; bang.material = dark;
      } else if (L.hair === "sidetail") {
        const tie = add(MB.CreateSphere("hairTie", { diameter: 0.09, segments: 6 }, scene), this.head, 0.2, 0.08, -0.12, 0.015);
        tie.material = accent;
        const tail = add(MB.CreateCapsule("sideTail", { height: 0.55, radius: 0.08, tessellation: 8 }, scene), this.head, 0.26, -0.16, -0.14, 0.02);
        tail.rotation.z = -0.25;
        tail.material = dark;
        this.hairTail = tail;
        const bang = add(softBox("bangs", { width: 0.34, height: 0.1, depth: 0.12 }, scene), this.head, 0.02, 0.17, 0.15, 0);
        bang.rotation.set(0.5, 0, -0.12);
        bang.material = dark;
      }
      if (L.hood) { // a cowl pulled over the head, shading the eyes
        const hd = add(MB.CreateSphere("cowl", { diameter: 0.58, segments: 10, slice: 0.62 }, scene), this.head, 0, 0.0, -0.05, 0.02);
        hd.rotation.x = -0.55; hd.scaling.set(1.05, 1.05, 1.05); hd.material = M("cowl", L.hood);
        const drape = add(MB.CreateCylinder("cowlDrape", { height: 0.22, diameterTop: 0.38, diameterBottom: 0.5, tessellation: 10 }, scene), this.head, 0, -0.28, -0.04, 0.02); drape.material = hd.material;
      }
    } else if (L.head === "helm") { // the Choir's knight helm: closed visor, a plume, cloth hanging behind
      const steelH = M("helm", L.helm ?? "#b4aec4"), slot = M("visor", "#16141c"), plume = dark;
      const shellH = add(MB.CreateSphere("helmShell", { diameter: 0.5, segments: 10 }, scene), this.head, 0, 0.02, 0);
      shellH.scaling.set(1, 1.08, 1.06); shellH.material = steelH;
      const guard = add(softBox("helmJaw", { width: 0.32, height: 0.16, depth: 0.16 }, scene), this.head, 0, -0.14, 0.12); guard.material = steelH;
      const visor = add(softBox("helmVisor", { width: 0.34, height: 0.045, depth: 0.05 }, scene), this.head, 0, 0.0, 0.25, 0); visor.material = slot;
      if (L.menace) { // the Choir's fanatics: red light burning through the visor, horns swept back from the helm
        const burn = glow(scene, `${id}-visorGlow`, "#ff2a3a");
        for (const sx of [-1, 1]) {
          const e = add(MB.CreateBox("visorEye", { width: 0.1, height: 0.022, depth: 0.03 }, scene), this.head, sx * 0.075, 0.0, 0.272, 0); e.rotation.z = sx * 0.28; e.material = burn;
          const horn = add(MB.CreateCylinder("helmHorn", { height: 0.36, diameterTop: 0, diameterBottom: 0.08, tessellation: 6 }, scene), this.head, sx * 0.2, 0.18, -0.06, 0.015);
          horn.rotation.set(-1.0, 0, -sx * 0.55); horn.material = M("helmHorn", "#2a2030");
        }
      }
      const vslot = add(softBox("helmSlot", { width: 0.035, height: 0.14, depth: 0.05 }, scene), this.head, 0, -0.08, 0.2, 0); vslot.material = slot;
      // A crest of blades along the top, and a plume falling behind in ragged strands (not a solid block).
      for (let i = 0; i < 4; i++) { const b = add(MB.CreateCylinder("crestBlade", { height: 0.16 - i * 0.02, diameterTop: 0, diameterBottom: 0.06, tessellation: 4 }, scene), this.head, 0, 0.29 - i * 0.02, 0.1 - i * 0.1, 0.012); b.rotation.x = -0.5; b.material = steelH; }
      for (let i = 0; i < 5; i++) {
        const strand = add(softBox("plumeStrand", { width: 0.035, height: 0.3 + (i % 3) * 0.08, depth: 0.035 }, scene), this.head, -0.08 + i * 0.04, 0.12 - (i % 2) * 0.04, -0.27, 0.012);
        strand.rotation.set(0.25, 0, (i - 2) * 0.08); strand.material = plume;
      }
      for (const sx of [-1, 1]) { // side drapes and rivets
        const drape = add(softBox("helmDrape", { width: 0.04, height: 0.3, depth: 0.2 }, scene), this.head, sx * 0.25, -0.12, -0.08, 0.015); drape.material = plume;
        const rivet = add(MB.CreateSphere("rivet", { diameter: 0.06, segments: 5 }, scene), this.head, sx * 0.25, 0.05, 0.04, 0); rivet.material = M("rivet", "#c9a24a");
      }
      const scarfN = add(MB.CreateTorus("neckScarf", { diameter: 0.24, thickness: 0.08, tessellation: 8 }, scene), this.head, 0, -0.27, -0.01, 0.02); scarfN.material = plume;
    } else if (L.head === "lump") { // a bog brute: a heavy skull, a brow ridge over slanted eyes, a jaw full of fangs, horns
      const hide = dark, bone = M("fang", "#e8dfc4"), maw = M("maw", "#2a0a0a"), horn = M("horn", "#2a2620");
      const skull = add(MB.CreateSphere("head", { diameter: 0.56, segments: 10 }, scene), this.head, 0, -0.04, 0.06);
      skull.scaling.set(1.15, 0.78, 1.05); skull.material = hide;
      const brow = add(softBox("browRidge", { width: 0.5, height: 0.08, depth: 0.14 }, scene), this.head, 0, 0.06, 0.27); brow.rotation.x = 0.35; brow.material = hide;
      const jaw = add(softBox("jaw", { width: 0.44, height: 0.14, depth: 0.32 }, scene), this.head, 0, -0.22, 0.2); jaw.rotation.x = 0.18; jaw.material = hide;
      const mouth = add(MB.CreateBox("mawGap", { width: 0.4, height: 0.06, depth: 0.04 }, scene), this.head, 0, -0.15, 0.36, 0); mouth.material = maw;
      for (let i = 0; i < 6; i++) { // upper and lower fangs, the outer ones longest
        const x = -0.16 + i * 0.064, long = i === 0 || i === 5 ? 1.6 : i === 1 || i === 4 ? 1 : 0.7;
        const up = add(MB.CreateCylinder("fang", { height: 0.09 * long, diameterTop: 0, diameterBottom: 0.035, tessellation: 4 }, scene), this.head, x, -0.13 - 0.04 * long, 0.37, 0);
        up.rotation.x = Math.PI; up.material = bone;
        if (i % 2) { const lo = add(MB.CreateCylinder("fang", { height: 0.07, diameterTop: 0, diameterBottom: 0.03, tessellation: 4 }, scene), this.head, x - 0.03, -0.17, 0.36, 0); lo.material = bone; }
      }
      const eyeMat = glow(scene, `${id}-eyes`, L.eyes);
      for (const sx of [-1, 1]) {
        const eye = add(MB.CreateSphere("eye", { diameter: 0.13, segments: 6 }, scene), this.head, sx * 0.13, -0.04, 0.33, 0);
        eye.scaling.set(1.3, 0.55, 0.6); eye.rotation.z = sx * 0.4; eye.material = eyeMat; // slanted, narrowed, burning under the brow
        const h = add(MB.CreateCylinder("horn", { height: 0.34, diameterTop: 0, diameterBottom: 0.1, tessellation: 6 }, scene), this.head, sx * 0.22, 0.2, -0.02, 0.015);
        h.rotation.set(-0.5, 0, -sx * 0.7); h.material = horn;
      }
      for (const [x, z] of [[-0.12, -0.18], [0.14, -0.2], [0, -0.26]]) { // moss on the back of the skull
        const t = add(MB.CreateCylinder("moss", { height: 0.22, diameterTop: 0, diameterBottom: 0.16, tessellation: 5 }, scene), this.head, x, 0.12, z, 0.015);
        t.rotation.x = -0.7; t.material = M("moss", "#4f6a2a");
      }
    } else if (L.head === "skull") { // the Clockwork Sentinel: a brass skull with a hinged jaw, deep red eyes and iron horns
      const brass = dark, iron = M("iron", "#2a2622"), eyeMat = glow(scene, `${id}-eyes`, L.eyes);
      const cran = add(softBox("cranium", { width: 0.4, height: 0.34, depth: 0.42 }, scene), this.head, 0, 0.04, 0); cran.material = brass;
      const brow = add(softBox("browPlate", { width: 0.44, height: 0.07, depth: 0.12 }, scene), this.head, 0, 0.11, 0.18); brow.rotation.x = 0.35; brow.material = iron;
      for (const sx of [-1, 1]) {
        const sock = add(softBox("socket", { width: 0.12, height: 0.07, depth: 0.04 }, scene), this.head, sx * 0.1, 0.02, 0.205, 0); sock.material = iron;
        const eye = add(MB.CreateBox("eye", { width: 0.09, height: 0.03, depth: 0.03 }, scene), this.head, sx * 0.1, 0.02, 0.22, 0); eye.rotation.z = sx * 0.3; eye.material = eyeMat;
        const h = add(MB.CreateCylinder("horn", { height: 0.3, diameterTop: 0, diameterBottom: 0.08, tessellation: 5 }, scene), this.head, sx * 0.15, 0.27, -0.04, 0.012);
        h.rotation.z = -sx * 0.35; h.material = iron;
      }
      const spike = add(MB.CreateCylinder("crest", { height: 0.26, diameterTop: 0, diameterBottom: 0.08, tessellation: 5 }, scene), this.head, 0, 0.3, 0.02, 0.012); spike.material = iron;
      const jaw = add(softBox("jaw", { width: 0.32, height: 0.11, depth: 0.3 }, scene), this.head, 0, -0.18, 0.04); jaw.material = brass;
      const grille = add(MB.CreateBox("grille", { width: 0.26, height: 0.06, depth: 0.03 }, scene), this.head, 0, -0.12, 0.215, 0); grille.material = iron;
      for (let i = 0; i < 5; i++) { const t = add(MB.CreateBox("tooth", { width: 0.03, height: 0.06, depth: 0.03 }, scene), this.head, -0.1 + i * 0.05, -0.12, 0.235, 0); t.material = M("toothMetal", "#d9c48a"); }
    } else {
      const hood = add(MB.CreateCylinder("hood", { height: 0.7, diameterTop: 0, diameterBottom: 0.62, tessellation: 10 }, scene), this.head, 0, 0.12, -0.04);
      hood.material = dark;
      const mask = add(MB.CreateCylinder("mask", { height: 0.06, diameter: 0.34, tessellation: 16 }, scene), this.head, 0, -0.02, 0.2, 0.015);
      mask.rotation.x = Math.PI / 2;
      mask.material = skin;
      const eyeMat = glow(scene, `${id}-eyes`, PALETTE.danger);
      for (const x of [-0.07, 0.07]) {
        const eye = add(MB.CreateBox("eye", { width: 0.08, height: 0.018, depth: 0.02 }, scene), this.head, x, 0.02, 0.24, 0);
        eye.material = eyeMat;
      }
      this.maskNode = mask;
    }
    if (L.beard && L.head === "face") { // part of the face: no ink line of its own (it drew a ring under the chin)
      const beard = add(MB.CreateSphere("beard", { diameter: 0.3, segments: 7 }, scene), this.head, 0, -0.12, 0.1, 0);
      beard.scaling.set(1.05, 0.72, 0.75); beard.material = M("beard", L.beard);
      if (L.beardLong) { // an old man's beard, down to the chest, and a moustache
        const long = add(MB.CreateCylinder("beardLong", { height: 0.34, diameterTop: 0.24, diameterBottom: 0.06, tessellation: 10 }, scene), this.head, 0, -0.3, 0.13, 0.015);
        long.rotation.x = 0.25; long.material = beard.material;
        for (const sx of [-1, 1]) { const mo = add(MB.CreateCylinder("moustache", { height: 0.12, diameterTop: 0.05, diameterBottom: 0.02, tessellation: 6 }, scene), this.head, sx * 0.05, -0.07, 0.215, 0); mo.rotation.z = sx * 1.9; mo.material = beard.material; }
        for (const sx of [-1, 1]) { const b = add(MB.CreateCylinder("bushyBrow", { height: 0.1, diameter: 0.035, tessellation: 6 }, scene), this.head, sx * 0.088, 0.125, 0.2, 0); b.rotation.z = Math.PI / 2 + sx * 0.25; b.material = beard.material; }
      }
    }
    if (L.wrinkles && L.head === "face") { // age lines under the eyes and across the brow
      const line = M("wrinkle", "#a07a62");
      for (const sx of [-1, 1]) { const w = add(MB.CreateCylinder("wrinkle", { height: 0.06, diameter: 0.008, tessellation: 4 }, scene), this.head, sx * 0.09, -0.03, 0.21, 0); w.rotation.z = Math.PI / 2 + sx * 0.3; w.material = line; }
      const fw = add(MB.CreateCylinder("browLine", { height: 0.12, diameter: 0.007, tessellation: 4 }, scene), this.head, 0, 0.165, 0.19, 0); fw.rotation.set(-0.6, 0, Math.PI / 2); fw.material = line;
    }
    const T = this.T, D = this.build.depth, front = (r) => r * D + 0.02;
    if (L.sash) { // a cloth sash across the chest, lying on the body instead of cutting through it
      const sash = add(MB.CreateBox("sash", { width: 0.1, height: T * 1.2, depth: 0.025 }, scene), this.body, 0, T * 0.5, front(this.build.cw), 0.02);
      sash.rotation.z = 0.55;
      const back = add(MB.CreateBox("sashBack", { width: 0.1, height: T * 1.2, depth: 0.025 }, scene), this.body, 0, T * 0.5, -front(this.build.cw), 0.02);
      back.rotation.z = -0.55;
      sash.material = back.material = trim;
    }
    if (L.collar) { // the Lantern Knights' gold stand collar (per the sheets: a band, no hanging tail)
      const col = add(MB.CreateCylinder("goldCollar", { height: 0.085, diameterTop: 0.2, diameterBottom: 0.24, tessellation: 12 }, scene), this.body, 0, T + 0.035, -0.005, 0.02);
      col.scaling.z = 0.9; col.material = M("collar", L.collarColor ?? "#e6b54e");
    }

    if (L.cape) { // a noble's short cape: a thick half-shell from the shoulders (closed, so the ink line stays on the outside)
      const capeNode = new BB.TransformNode(`${id}-capeNode`, scene); capeNode.parent = this.body; capeNode.position.set(0, T + 0.02, 0);
      const cape = add(BB.MeshBuilder.CreateLathe("cape", { shape: [[this.build.sw * 0.5, 0], [this.build.sw * 1.05, -0.12], [this.build.sw * 1.15, -0.95], [this.build.sw * 1.12, -0.95],
        [this.build.sw * 1.02, -0.13], [this.build.sw * 0.48, 0.0]].map(([r, y]) => new BB.Vector3(r, y, 0)), tessellation: 14, arc: 0.5, sideOrientation: BB.Mesh.DOUBLESIDE }, scene), capeNode, 0, 0, 0, 0.02);
      cape.rotation.y = Math.PI; cape.scaling.z = D * 1.2; cape.material = M("cape", L.cape);
      this.cape = capeNode;
    }

    if (L.lute) { // a lute slung across the back (no one carries one in the current sheets)
      const body = add(MB.CreateSphere("lute", { diameter: 0.42, segments: 8 }, scene), this.body, 0.05, ty(0.25), -front(this.build.cw) - 0.05, 0.02);
      body.scaling.set(1, 1.2, 0.4); body.material = M("lute", "#8a5a32");
      const neck = add(MB.CreateBox("luteNeck", { width: 0.07, height: 0.62, depth: 0.05 }, scene), this.body, 0.2, ty(0.68), -front(this.build.cw) - 0.06, 0.015);
      neck.rotation.z = -0.45; neck.material = M("luteNeck", "#5a3a22");
    }
    if (L.carry) { // something small, wrapped, held against the chest
      const bundle = add(MB.CreateSphere("bundle", { diameter: 0.34, segments: 10 }, scene), this.body, 0.02, ty(0.5), front(this.build.cw) + 0.1, 0.02);
      bundle.scaling.set(1.3, 0.8, 0.85); bundle.rotation.z = 0.4; bundle.material = M("bundle", "#e9dfca");
    }

    // Things held in the off hand (from the sheets): a scroll held up to read, a lantern carried low.
    const hand = this.offElbow, handY = -0.33;
    if (L.holds === "scroll") {
      const sc = add(MB.CreateCylinder("scroll", { height: 0.3, diameter: 0.06, tessellation: 8 }, scene), hand, 0.04, handY - 0.02, 0.05, 0.015);
      sc.rotation.z = Math.PI / 2; sc.material = M("scroll", "#efe6cc");
      const sheet = add(MB.CreateBox("scrollSheet", { width: 0.26, height: 0.2, depth: 0.012 }, scene), hand, 0.04, handY - 0.12, 0.07, 0.012);
      sheet.material = sc.material;
    } else if (L.holds === "lantern") {
      const frame = add(MB.CreateBox("lanternFrame", { width: 0.13, height: 0.17, depth: 0.13 }, scene), hand, 0, handY - 0.2, 0.02, 0.015);
      frame.material = M("lanternFrame", "#3a2a22");
      const handle = add(MB.CreateTorus("lanternHandle", { diameter: 0.08, thickness: 0.012, tessellation: 8 }, scene), hand, 0, handY - 0.08, 0.02, 0); handle.rotation.z = Math.PI / 2; handle.material = frame.material;
      const light = add(MB.CreateBox("lanternLight", { width: 0.1, height: 0.12, depth: 0.135 }, scene), hand, 0, handY - 0.2, 0.02, 0);
      light.material = glow(scene, `${id}-lanternGlow`, "#ffcf7a");
    }
    if (L.shield === "kite" || L.shield === "heater") { // a shield carried on the off forearm, face forward
      const sMat = M("shieldFace", L.shieldColor ?? "#ecebe6"), rim = M("shieldRim", "#8a6a3a");
      const top = add(MB.CreateBox("shieldTop", { width: 0.42, height: L.shield === "kite" ? 0.42 : 0.34, depth: 0.05 }, scene), hand, -0.05, handY + 0.12, 0.13, 0.025);
      const point = add(MB.CreateBox("shieldPoint", { width: 0.3, height: 0.3, depth: 0.05 }, scene), hand, -0.05, handY - (L.shield === "kite" ? 0.12 : 0.04), 0.13, 0.025);
      point.rotation.z = Math.PI / 4; point.scaling.y = L.shield === "kite" ? 1.4 : 1; top.material = point.material = sMat;
      const edge = add(MB.CreateBox("shieldEdge", { width: 0.44, height: 0.04, depth: 0.06 }, scene), hand, -0.05, handY + (L.shield === "kite" ? 0.33 : 0.29), 0.13, 0.015); edge.material = rim;
      const badge = add(MB.CreateBox("shieldBadge", { width: 0.12, height: 0.16, depth: 0.02 }, scene), hand, -0.05, handY + 0.06, 0.165, 0.01); badge.material = M("shieldBadge", "#d9b04a");
    }
    // Weapon arm: the shoulder pivot (built with the body) points the arm along +Z; the weapon sits in the hand.
    /** A plate gauntlet fitted over the hand and wrist: a flared cuff, a back-of-hand plate and knuckle ridges. */
    const gauntlet = (node, along) => {
      const mat = M("gauntlet", L.accent ?? "#8c909b"), ar = this.build.arm * (L.scale ?? 1) ** 0;
      const cuff = add(MB.CreateCylinder("gauntletCuff", { height: 0.17, diameterTop: ar * 2.7, diameterBottom: ar * 2.1, tessellation: 10 }, scene), node, 0, 0, 0, 0.02);
      const plate = add(MB.CreateBox("gauntletPlate", { width: 0.13, height: 0.06, depth: 0.12 }, scene), node, 0, 0, 0, 0.015);
      const knuckles = add(MB.CreateBox("gauntletKnuckles", { width: 0.13, height: 0.045, depth: 0.04 }, scene), node, 0, 0, 0, 0.012);
      if (along > 0) { cuff.rotation.x = -Math.PI / 2; cuff.position.z = 0.47; plate.position.set(0, 0.04, 0.6); knuckles.position.set(0, 0.035, 0.68); }
      else { cuff.position.y = -0.18; plate.position.set(0, -0.31, 0.04); plate.rotation.x = Math.PI / 2; knuckles.position.set(0, -0.39, 0.035); }
      cuff.material = plate.material = knuckles.material = mat;
    };
    const weaponStart = this.meshes.length; // everything added from here to the tip is the weapon
    let tipZ = SWORD_TIP, hiltZ = SWORD_HILT + 0.15;
    if (L.weapon === "claw") { // a clawed hand: a knuckled fist and long hooked talons
      const claw = add(MB.CreateSphere("claw", { diameter: 0.2, segments: 7 }, scene), this.shoulder, 0, 0, 0.64, 0.02);
      claw.scaling.set(1.1, 0.75, 1.1); claw.material = accent;
      for (const x of [-0.1, 0, 0.1]) {
        const talon = add(MB.CreateCylinder("talon", { height: 0.46, diameterTop: 0, diameterBottom: 0.08, tessellation: 5 }, scene), this.shoulder, x, -0.06, 0.98, 0.015);
        talon.rotation.x = Math.PI / 2 + 0.35; talon.material = M("talon", L.talon ?? "#e7e1cf");
      }
      tipZ = 1.25; hiltZ = 0.7;
    } else if (L.weapon === "staff" || L.weapon === "spear" || L.weapon === "rod") {
      const len = L.weapon === "staff" ? 1.7 : L.weapon === "rod" ? 2.3 : 2.1;
      const shaft = add(MB.CreateCylinder("shaft", { height: len, diameter: 0.05, tessellation: 6 }, scene), this.shoulder, 0, 0, 0.64 + len * 0.3, 0.015);
      shaft.rotation.x = Math.PI / 2; shaft.material = M("shaft", "#3b2f2a");
      if (L.weapon === "rod") { // a fishing rod: a line hanging from the tip
        const line = add(MB.CreateCylinder("line", { height: 0.9, diameter: 0.01, tessellation: 4 }, scene), this.shoulder, 0, -0.45, 0.64 + len * 0.8, 0);
        line.material = M("line", "#e8e2d4");
      } else if (L.weapon === "staff") {
        const orb = add(MB.CreateSphere("orb", { diameter: 0.2, segments: 8 }, scene), this.shoulder, 0, 0, 0.64 + len * 0.8, 0);
        orb.material = glow(scene, `${id}-orb`, L.orb ?? "#c9a4ff");
      } else {
        const head = add(MB.CreateCylinder("spearhead", { height: 0.36, diameterTop: 0, diameterBottom: 0.12, tessellation: 4 }, scene), this.shoulder, 0, 0, 0.64 + len * 0.8 + 0.18, 0.015);
        head.rotation.x = Math.PI / 2; head.material = steel;
      }
      tipZ = 0.64 + len * 0.8 + 0.3; hiltZ = 0.64 + len * 0.3;
    } else if (L.weapon === "none") {
      tipZ = 0.75; hiltZ = 0.6;
    } else if (L.weapon === "branch") { // a great gnarled tree-branch staff, taller than its owner, knotted at the top
      const wood = M("branch", "#5a3e26"), knot = M("branchKnot", "#3e2a1a"), leaf = M("leaf", "#6a8a3a");
      const segs = [[0.0, 0.5, 0.11, 0.08, 0.06], [0.5, 0.95, 0.09, -0.07, 0.05], [0.95, 1.4, 0.085, 0.06, -0.06], [1.4, 1.8, 0.1, -0.05, 0.04]];
      let x = 0, y = 0;
      for (const [z0, z1, d, dx, dy] of segs) { // each length of the branch bends a little
        const seg = add(MB.CreateCylinder("branchSeg", { height: z1 - z0 + 0.04, diameterTop: d * 0.9, diameterBottom: d, tessellation: 7 }, scene), this.shoulder, x + dx / 2, y + dy / 2, 0.3 + (z0 + z1) / 2, 0.015);
        seg.rotation.set(Math.PI / 2, 0, 0); seg.rotation.y = dx * 1.5; seg.rotation.z = dy * 1.5; seg.material = wood;
        x += dx; y += dy;
        const k = add(MB.CreateSphere("branchKnot", { diameter: d * 1.35, segments: 5 }, scene), this.shoulder, x, y, 0.3 + z1, 0.012); k.material = knot;
      }
      // The crown: a gnarled knob with forked twigs and a few leaves still clinging on.
      const crown = add(MB.CreateSphere("branchCrown", { diameter: 0.2, segments: 6 }, scene), this.shoulder, x, y, 2.18, 0.015); crown.scaling.set(1, 0.8, 1.3); crown.material = knot;
      for (const [tx, ty, rx, rz] of [[0.08, 0.05, 0.6, -0.5], [-0.08, 0.02, 0.5, 0.6], [0.0, -0.08, 0.9, 0.1]]) {
        const tw = add(MB.CreateCylinder("twig", { height: 0.3, diameterTop: 0.012, diameterBottom: 0.04, tessellation: 5 }, scene), this.shoulder, x + tx, y + ty, 2.32, 0.01);
        tw.rotation.set(Math.PI / 2 - rx, 0, rz); tw.material = wood;
        const lf = add(MB.CreateSphere("leaf", { diameter: 0.08, segments: 4 }, scene), this.shoulder, x + tx * 2.2, y + ty * 2.2, 2.44, 0); lf.scaling.set(1, 0.4, 1.4); lf.material = leaf;
      }
      tipZ = 2.4; hiltZ = 0.6;
    } else if (L.weapon === "broom") { // Brother Moss's broom: a plain handle and a straw head
      const shaft = add(MB.CreateCylinder("broom", { height: 1.25, diameter: 0.045, tessellation: 6 }, scene), this.shoulder, 0, 0, 0.72, 0.015);
      shaft.rotation.x = Math.PI / 2; shaft.material = M("broomShaft", "#7a5a38");
      const straw = add(MB.CreateCylinder("straw", { height: 0.36, diameterTop: 0.08, diameterBottom: 0.28, tessellation: 8 }, scene), this.shoulder, 0, 0, 1.48, 0.015);
      straw.rotation.x = Math.PI / 2; straw.material = M("straw", "#d9b866");
      tipZ = 1.62; hiltZ = 0.6;
    } else if (L.weapon === "fist") {
      gauntlet(this.shoulder, 1);
      tipZ = 0.95; hiltZ = 0.55;
    } else {
      const needle = L.weapon === "needle";
      const guard = add(MB.CreateBox("guard", { width: needle ? 0.16 : 0.3, height: 0.06, depth: 0.06 }, scene), this.shoulder, 0, 0, SWORD_HILT, 0.015);
      guard.material = needle ? accent : trim;
      const len = (needle ? 1.05 : 1) * (SWORD_TIP - SWORD_HILT);
      const blade = add(MB.CreateBox("blade", { width: needle ? 0.03 : 0.05, height: needle ? 0.03 : L.weapon === "blade" ? 0.14 : 0.13, depth: len }, scene),
        this.shoulder, 0, 0, SWORD_HILT + len / 2, 0.015);
      blade.material = steel;
      tipZ = SWORD_HILT + len;
    }
    // The weapon sits in the hand on its own node: hidden in its scabbard out of combat, or stood upright (staffs, spears).
    const GRIP = 0.6;
    this.weaponNode = new BB.TransformNode(`${id}-weapon`, scene); this.weaponNode.parent = this.shoulder; this.weaponNode.position.z = GRIP;
    for (const m of this.meshes.slice(weaponStart)) if (m.parent === this.shoulder) { m.parent = this.weaponNode; m.position.z -= GRIP; }
    this.tipNode = new BB.TransformNode(`${id}-tip`, scene); this.tipNode.parent = this.weaponNode; this.tipNode.position.z = tipZ - GRIP;
    this.hiltNode = new BB.TransformNode(`${id}-hilt`, scene); this.hiltNode.parent = this.weaponNode; this.hiltNode.position.z = hiltZ - GRIP;
    this.weaponKind = ["sword", "blade", "needle"].includes(L.weapon) || !L.weapon ? "blade" : ["staff", "spear", "broom", "rod", "branch"].includes(L.weapon) ? "pole" : "none";
    if (this.weaponKind === "blade" && this.legs) { // the scabbard: long swords across the back, rapiers at the hip
      const needle = L.weapon === "needle", len = (needle ? 1.05 : 1) * (SWORD_TIP - SWORD_HILT);
      const sheath = new BB.TransformNode(`${id}-sheath`, scene);
      // At the left hip, angled back (as on every sheet), long enough swords tilted further so the tip clears the ground.
      sheath.parent = this.pelvis; sheath.position.set(-(this.build.hw + 0.06), 0.05, 0.04); sheath.rotation.set(needle ? 0.95 : 1.1, 0, -0.18);
      // Built along −Y from the hilt: the hip one is then swung back by its node.
      const holder = new BB.TransformNode(`${id}-sheathTilt`, scene); holder.parent = sheath;
      const scab = add(MB.CreateBox("scabbard", { width: needle ? 0.05 : 0.08, height: len + 0.04, depth: needle ? 0.04 : 0.05 }, scene), holder, 0, -len / 2 - 0.1, 0, 0.015);
      scab.material = M("scabbard", "#3a2a22");
      const chape = add(MB.CreateBox("chape", { width: needle ? 0.06 : 0.095, height: 0.08, depth: needle ? 0.05 : 0.06 }, scene), holder, 0, -len - 0.1, 0, 0.012);
      chape.material = trim;
      this.sheathHilt = new BB.TransformNode(`${id}-sheathHilt`, scene); this.sheathHilt.parent = holder;
      const guard = add(MB.CreateBox("sheathGuard", { width: needle ? 0.16 : 0.26, height: 0.05, depth: 0.05 }, scene), this.sheathHilt, 0, -0.08, 0, 0.015);
      guard.material = needle ? accent : trim;
      const grip = add(MB.CreateCylinder("sheathGrip", { height: 0.2, diameter: 0.045, tessellation: 6 }, scene), this.sheathHilt, 0, 0.04, 0, 0.012);
      grip.material = M("grip", "#3a2a22");
      const pommel = add(MB.CreateSphere("pommel", { diameter: 0.06, segments: 6 }, scene), this.sheathHilt, 0, 0.15, 0, 0.012);
      pommel.material = trim;
    }

    const offArm = this.offArm;
    if (L.shield === true) { // a tower shield held on the off arm, always toward the front
      const sh = add(MB.CreateBox("shield", { width: 0.85, height: 1.35, depth: 0.1 }, scene), this.body, -0.18, ty(0.35), front(this.build.cw) + 0.2, 0.03);
      sh.material = accent;
      const boss = add(MB.CreateCylinder("boss", { height: 0.06, diameter: 0.3, tessellation: 10 }, scene), sh, 0, 0.1, 0.07, 0.015);
      boss.rotation.x = Math.PI / 2; boss.material = M("boss", PALETTE.rookTrim);
      this.shieldMesh = sh;
    }
    if (L.halo) { // the Choir's singing halo
      const halo = MB.CreateTorus(`${id}-halo`, { diameter: 0.6, thickness: 0.03, tessellation: 24 }, scene);
      halo.material = glow(scene, `${id}-haloMat`, "#c9a4ff"); halo.parent = this.head; halo.position.y = 0.55; halo.isPickable = false;
      this.halo = halo;
    }
    if (L.gear) { // clockwork: a slowly turning brass gear on its back
      const gear = add(MB.CreateTorus("gear", { diameter: 0.42, thickness: 0.08, tessellation: 14 }, scene), this.body, 0, ty(0.62), -front(this.build.cw) - 0.06, 0.02);
      gear.rotation.x = Math.PI / 2; gear.material = M("gearMat", "#5a4a2a");
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const t = add(MB.CreateBox("tooth", { width: 0.07, height: 0.07, depth: 0.07 }, scene), gear, Math.sin(a) * 0.24, 0, Math.cos(a) * 0.24); t.material = gear.material; }
      this.gear = gear;
    }
    if (L.weapon === "fist") gauntlet(this.offElbow, -1); // a matching gauntlet on the off hand
    if (L.weapon === "claw") { // the off hand is clawed too
      for (const x of [-0.07, 0, 0.07]) { const t = add(MB.CreateCylinder("talon2", { height: 0.32, diameterTop: 0, diameterBottom: 0.07, tessellation: 5 }, scene), this.offElbow, x, -0.52, 0.04, 0.012); t.rotation.x = Math.PI + 0.3; t.material = M("talon", L.talon ?? "#e7e1cf"); }
    }

    // Rook's grimoire floats at his left shoulder: every knight here has one.
    if (L.grimoire) {
      this.grimoire = new BB.TransformNode(`${id}-grimoire`, scene);
      this.grimoire.parent = this.root;
      this.grimoire.position.set(-0.75, 1.7, -0.1);
      const cover = add(MB.CreateBox("grimoire", { width: 0.34, height: 0.42, depth: 0.1 }, scene), this.grimoire, 0, 0, 0, 0.02);
      cover.material = toon(scene, `${id}-book`, "#4a2f22");
      const pages = add(MB.CreateBox("pages", { width: 0.3, height: 0.38, depth: 0.08 }, scene), this.grimoire, 0.025, 0, 0, 0);
      this.pageMat = glow(scene, `${id}-pages`, "#f6e7c1");
      pages.material = this.pageMat;
      this.grimoireGlow = 0;
    }

    this._buildCommon(scene, id);
  }

  /** A four-legged body (Fen Hound). The "shoulder" is the neck, so poses swing the head; the jaw is the weapon tip. */
  _buildBeast(scene, id, L, add, M) {
    const BB = B(), MB = BB.MeshBuilder;
    const fur = M("fur", L.fur), belly = M("belly", L.belly);
    const torso = add(MB.CreateCapsule("torso", { height: 1.3, radius: 0.26, tessellation: 10 }, scene), this.body, 0, 0, 0);
    torso.rotation.x = Math.PI / 2; torso.material = fur;
    const chest = add(MB.CreateSphere("chest", { diameter: 0.55, segments: 8 }, scene), this.body, 0, 0.02, 0.35, 0.02);
    chest.material = belly;
    this.beastLegs = [[0.17, 0.45], [-0.17, 0.45], [0.17, -0.45], [-0.17, -0.45]].map(([x, z], i) => {
      const hip = new BB.TransformNode(`${id}-hip${i}`, scene); hip.parent = this.root; hip.position.set(x, 0.55, z);
      const leg = add(MB.CreateCapsule("leg", { height: 0.6, radius: 0.07, tessellation: 6 }, scene), hip, 0, -0.27, 0, 0.02);
      leg.material = fur;
      hip.phase = i === 0 || i === 3 ? 0 : Math.PI;
      return hip;
    });
    const tail = add(MB.CreateCylinder("tail", { height: 0.6, diameterTop: 0.02, diameterBottom: 0.12, tessellation: 6 }, scene), this.body, 0, 0.12, -0.75, 0.02);
    tail.rotation.x = -2.1; tail.material = fur;
    this.beastTail = tail;
    // Neck pivot with head and jaw.
    this.shoulder = new BB.TransformNode(`${id}-neck`, scene);
    this.shoulder.parent = this.body; this.shoulder.position.set(0, 0.14, 0.55);
    this.head = this.shoulder;
    const head = add(MB.CreateSphere("head", { diameter: 0.38, segments: 8 }, scene), this.shoulder, 0, 0.08, 0.2);
    head.material = fur;
    const snout = add(MB.CreateBox("snout", { width: 0.18, height: 0.15, depth: 0.3 }, scene), this.shoulder, 0, 0.02, 0.45, 0.02);
    snout.material = belly;
    for (const x of [-0.11, 0.11]) {
      const ear = add(MB.CreateCylinder("ear", { height: 0.2, diameterTop: 0, diameterBottom: 0.1, tessellation: 4 }, scene), this.shoulder, x, 0.28, 0.12, 0.015);
      ear.material = fur;
      const eye = add(MB.CreateSphere("eye", { diameter: 0.06, segments: 5 }, scene), this.shoulder, x * 0.8, 0.13, 0.36, 0);
      eye.material = glow(scene, `${id}-eye`, L.eyes);
    }
    this.tipNode = new BB.TransformNode(`${id}-tip`, scene); this.tipNode.parent = this.shoulder; this.tipNode.position.z = 0.65;
    this.hiltNode = new BB.TransformNode(`${id}-hilt`, scene); this.hiltNode.parent = this.shoulder; this.hiltNode.position.z = 0.3;
  }

  /** Indicators and shadow shared by every form. */
  _buildCommon(scene, id) {
    const BB = B(), MB = BB.MeshBuilder;
    // Soft blob shadow: cheap, and makes jumps readable.
    const shadow = MB.CreateDisc(`${id}-shadow`, { radius: 0.55, tessellation: 20 }, scene);
    shadow.rotation.x = Math.PI / 2;
    const sm = new BB.StandardMaterial(`${id}-shadowMat`, scene);
    sm.diffuseColor = BB.Color3.Black(); sm.specularColor = BB.Color3.Black(); sm.disableLighting = true; sm.alpha = 0.38;
    shadow.material = sm;
    shadow.isPickable = false;
    this.shadow = shadow;

    // MARKED indicator: a small spinning gold ring over the head.
    const mark = MB.CreateTorus(`${id}-mark`, { diameter: 0.55, thickness: 0.05, tessellation: 24 }, scene);
    mark.material = glow(scene, `${id}-markMat`, PALETTE.lantern);
    mark.parent = this.root; mark.position.y = 2.45; mark.rotation.x = Math.PI / 2.4; mark.isPickable = false;
    mark.setEnabled(false);
    this.markRing = mark;
    // WARDED (Cantor hymn): a violet ring of light around the body.
    const ward = MB.CreateTorus(`${id}-ward`, { diameter: 1.5, thickness: 0.05, tessellation: 6 }, scene);
    ward.material = glow(scene, `${id}-wardMat`, "#b98cff"); ward.parent = this.root; ward.position.y = 1.1; ward.isPickable = false;
    ward.setEnabled(false);
    this.wardRing = ward;
    // BOUND: two red thread loops around the body. ANCHORED: a stone ring at the feet. SHIELDED: an amber dome.
    const threadMat = glow(scene, `${id}-threadMat`, "#ff4d6d");
    this.boundRings = [1.0, 1.45].map((y, i) => {
      const r = MB.CreateTorus(`${id}-bound${i}`, { diameter: 0.95, thickness: 0.035, tessellation: 24 }, scene);
      r.material = threadMat; r.parent = this.root; r.position.y = y; r.rotation.z = i ? 0.25 : -0.2; r.isPickable = false; r.setEnabled(false);
      return r;
    });
    const anchor = MB.CreateTorus(`${id}-anchor`, { diameter: 1.3, thickness: 0.12, tessellation: 8 }, scene);
    anchor.material = toon(scene, `${id}-anchorMat`, "#8c909b"); anchor.parent = this.root; anchor.position.y = 0.06; anchor.isPickable = false;
    anchor.setEnabled(false);
    this.anchorRing = anchor;
    const dome = MB.CreateSphere(`${id}-dome`, { diameter: 2.4, segments: 10 }, scene);
    dome.material = glow(scene, `${id}-domeMat`, "#e8b46a", 0.16, true); dome.parent = this.root; dome.position.y = 1; dome.isPickable = false;
    dome.setEnabled(false);
    this.dome = dome;

    // MUD (WEIGHTED): a brown ring of sludge around the knees.
    const mud = MB.CreateTorus(`${id}-mud`, { diameter: 1.0, thickness: 0.16, tessellation: 10 }, scene);
    mud.material = toon(scene, `${id}-mudMat`, "#5a4630"); mud.parent = this.root; mud.position.y = 0.35; mud.isPickable = false;
    mud.setEnabled(false);
    this.mudRing = mud;
    // Bosses that burrow get a bubbling mud mound that shows where they are.
    if (this.look.mound) {
      const m = MB.CreateSphere(`${id}-mound`, { diameter: 3, segments: 12 }, scene);
      m.material = toon(scene, `${id}-moundMat`, "#4a3d28"); m.renderOutline = true; m.outlineWidth = 0.04; m.outlineColor = BB.Color3.FromHexString("#0f1117");
      m.isPickable = false; m.setEnabled(false);
      this.mound = m;
    }
    this.sink = 0;

    // Tinted outlines: each part's line is its own color, darkened toward blue (not flat black).
    for (const m of this.meshes) if (m.renderOutline && m.material?.toonHex) m.outlineColor = lineOf(m.material.toonHex);
    skinBake(this, scene, id); // every cel-shaded part becomes one skinned mesh (two with the face)
    this._bakeParts();          // what's left (glowing bits) merges per node and material

    this.flash = 0;
    this.time = Math.random() * 10;
    this.visibility = 1;
  }

  /** Pose for the current ability frame (fractional, for smooth motion between logic frames). */
  armPose(fighter, t) {
    const rest = this.poses.rest;
    const a = fighter.current;
    const p = a && this.poses[a.id];
    if (!p) return { rot: rest, lean: 0, active: false, spin: 0 };
    const f = fighter.runner.frame + (fighter.frozen ? 0 : t);
    const s = a.startup, act = a.active;
    // Optional full turns: over the active frames for attacks, over the whole move otherwise.
    let spin = 0;
    const attack = isAttack(a);
    if (p.spin) {
      const k = attack ? clamp01((f - s) / Math.max(1, act)) : clamp01(f / a.total);
      spin = easeOut(k) * p.spin * Math.PI * 2;
    }
    let rot, lean = 0, active = false;
    if (f < s) {
      const k = easeInOut(clamp01(f / Math.max(1, s)));
      rot = mix(rest, p.from, k); lean = (p.lean ?? 0) * -0.3 * k;
    } else if (f < s + act) {
      const k = easeOut(clamp01((f - s) / Math.max(1, act)));
      rot = mix(p.from, p.to, k); lean = (p.lean ?? 0) * k; active = true;
    } else {
      const k = clamp01((f - s - act) / Math.max(1, a.recovery));
      const back = easeInOut(clamp01((k - 0.35) / 0.65)); // hold the follow-through a beat
      rot = mix(p.to, rest, back); lean = (p.lean ?? 0) * (1 - back); active = k < 0.25 && attack;
    }
    return { rot, lean, active: active || (p.spin > 0 && attack && f >= s && f < s + act), spin };
  }

  /** Apply one render frame. */
  update(fighter, t, dt) {
    const BB = B();
    this.time += dt;
    // Level of detail: far from the camera, drop the ink outlines (one extra draw per part, and too thin to see there).
    const far = Rig.view ? Math.hypot(fighter.pos.x - Rig.view.x, fighter.pos.z - Rig.view.z) > Rig.outlineRange : false;
    if (far !== this.far) {
      this.far = far;
      this.outlined ??= this.meshes.filter((m) => m.renderOutline);
      for (const m of this.outlined) m.renderOutline = !far;
    }
    const x = lerp(fighter.prev.x, fighter.pos.x, t);
    const y = lerp(fighter.prev.y, fighter.pos.y, t);
    const z = lerp(fighter.prev.z, fighter.pos.z, t);
    let jitter = 0;
    if (fighter.frozen && fighter.combatant.isStaggered) jitter = (Math.random() - 0.5) * 0.12; // hitstop shake
    // Burrowing: sink out of sight, leaving a bubbling mound.
    this.sink += ((fighter.submerged ? 1 : 0) - this.sink) * Math.min(1, dt * (fighter.submerged ? 3 : 8));
    this.root.position.set(x + jitter, y - this.sink * 4.5, z);
    if (this.mound) {
      const on = this.sink > 0.15 && fighter.alive;
      this.mound.setEnabled(on);
      if (on) {
        const b = 1 + Math.sin(this.time * 7) * 0.08;
        this.mound.position.set(x, 0, z);
        this.mound.scaling.set(b * this.sink, 0.35 * this.sink * (1 + Math.sin(this.time * 11) * 0.1), b * this.sink);
      }
    }
    this.mudRing.setEnabled(fighter.alive && fighter.tags.has("WEIGHTED"));
    this.root.rotation.y = lerpAngleSafe(fighter.prevYaw, fighter.yaw, t);

    let { rot, lean, active, spin } = this.armPose(fighter, t);
    const relaxedArm = fighter.relaxed && !fighter.current;
    if (relaxedArm) rot = fighter.armPose ?? (this.look.carry ? CRADLE : RELAXED); // story scenes: weapon lowered, or a gesture
    // Humanoids: legs, hips, chest and the off arm come from the motion module (runtime/motion.js).
    const motion = this.legs ? animateHumanoid(this, fighter, dt, { lean, active, attacking: !!fighter.current && isAttack(fighter.current), relaxed: fighter.relaxed }) : null;
    const swingArm = motion && !fighter.current && !fighter.armPose && !this.look.carry ? motion.armSwing * (relaxedArm ? 1 : 0.35) : 0;
    this.shoulder.rotation.set(rot[0] + swingArm, rot[1], rot[2]);
    if (this.weaponNode) { // out of a fight the sword is sheathed; staffs and spears are held upright like a walking staff
      const sheathed = relaxedArm && this.weaponKind === "blade" && !!this.sheathHilt && !fighter.armPose;
      this.weaponNode.scaling.setAll(sheathed ? 0 : 1);
      if (this.sheathHilt) this.sheathHilt.scaling.setAll(sheathed ? 1 : 0);
      // Poles stand upright like a walking staff; a broom is held the other way, straw on the ground.
      const upright = relaxedArm && this.weaponKind === "pole" && !fighter.armPose;
      this.weaponNode.rotation.x = upright ? (this.look.weapon === "broom" ? Math.PI / 2 : -Math.PI / 2) - rot[0] - swingArm : 0;
    }
    this.body.rotation.y = spin + (this.bodyTwist ?? 0);
    if (this.skirt && !this.legs) this.skirt.rotation.y = spin;
    this.swinging = active;

    const speed = Math.hypot(fighter.vel.x, fighter.vel.z);
    const run = Math.min(speed / 6, 1) * (fighter.runner.isRunning ? 0.3 : 1);
    const bob = Math.sin(this.time * 13) * 0.05 * run;
    let bodyLean = lean + run * 0.18;
    const c = fighter.combatant;
    if (c.isStaggered) bodyLean = c.postureBroken ? -0.15 + Math.sin(this.time * 3) * 0.05 : -0.3;
    if (c.blocking) bodyLean = -0.08;
    if (!fighter.grounded) bodyLean += fighter.vel.y > 0 ? -0.15 : 0.15;
    if (fighter.alive && this.deathT) { this.deathT = 0; this.visibility = 1; } // got back up
    if (!fighter.alive && fighter.stats?.yields) bodyLean = this.legs ? 0.3 : 0.55; // a duel ends on one knee, not dead
    else if (!fighter.alive) {
      this.deathT = (this.deathT ?? 0) + dt;
      bodyLean = this.legs ? 0 : -Math.min(1.45, this.deathT * 3.5); // humanoids fall from the hips (motion.js)
      this.visibility = 1 - clamp01((fighter.deadFrames - 50) / 50);
    }
    // Secondary motion (hair, scarf, cape, coat tails) is held for two frames at a time: drawn on twos, like animation.
    const held = Math.floor(this.time * 12) / 12;
    if (this.legs) {
      this.body.rotation.x = bodyLean - run * 0.18 + (this.chestLean ?? 0) + (this.look.stoop ?? 0) + (fighter.bow ?? 0);
      if (this.skirt) { const [l, r] = this.legs; this.skirt.rotation.x = (l.hip.rotation.x + r.hip.rotation.x) * 0.42; this.skirt.rotation.z = (l.hip.rotation.z + r.hip.rotation.z) * 0.3; }
    } else {
      this.body.rotation.x = bodyLean + (this.look.stoop ?? 0) + (fighter.bow ?? 0);
      this.body.position.y = this.bodyY + bob - (c.postureBroken ? 0.18 : 0) - (!fighter.alive && fighter.stats?.yields ? 0.35 : 0);
    }
    if (this.cape) this.cape.rotation.x = 0.1 + run * 0.6 + Math.sin(held * 7) * 0.05;
    if (this.beastTail) this.beastTail.rotation.x = -2.1 + Math.sin(this.time * 10) * 0.25;
    if (this.beastLegs) for (const hip of this.beastLegs) hip.rotation.x = Math.sin(this.time * 16 + hip.phase) * 0.7 * run;
    if (this.halo) { this.halo.rotation.y += dt * 2; }
    if (this.gear) this.gear.rotation.y += dt * (fighter.current?.id === "Gearspin" ? 9 : 0.8);
    if (this.wardRing) { const w = fighter.alive && fighter.tags.has("WARDED"); this.wardRing.setEnabled(w); if (w) this.wardRing.rotation.y -= dt * 2.5; }
    if (this.skirt && !this.legs) this.skirt.rotation.x = bodyLean * 0.25;
    if (this.scarfTail) this.scarfTail.rotation.x = 0.12 + run * 0.45 + Math.sin(held * 9) * 0.08 * (0.3 + run);
    if (this.offArm && !this.legs) this.offArm.rotation.x = c.blocking || fighter.current?.id === "Guard" ? -0.9 : 0.35 + Math.sin(this.time * 13) * 0.25 * run;
    if (this.offArm && this.look.holds === "scroll" && !fighter.offPose && !fighter.current) { this.offArm.rotation.set(-0.3, 0, -0.2); this.offElbow.rotation.x = -1.35; } // reading
    if (this.offArm && this.look.shield && this.look.shield !== true && !fighter.offPose) { this.offArm.rotation.z = -0.28; this.offElbow.rotation.x = Math.min(this.offElbow.rotation.x, -0.5); } // shield held clear of the body
    if (this.offArm && (this.look.carry || fighter.offPose)) {
      const o = fighter.offPose ?? [-1.15, 0, -0.35]; this.offArm.rotation.set(o[0], o[1], o[2]);
      if (this.offElbow) this.offElbow.rotation.x = this.look.carry ? -1.3 : -0.9;
    }
    if (this.head !== this.shoulder) this.head.rotation.z = fighter.headTilt ?? 0;

    if (this.grimoire) {
      this.grimoire.position.y = 1.75 + Math.sin(this.time * 2.2) * 0.06;
      this.grimoireGlow = Math.max(0, this.grimoireGlow - dt * 1.6);
      const g = this.grimoireGlow;
      this.grimoire.rotation.y = 0.5 + g * this.time * 8;
      this.pageMat.emissiveColor.set(0.96 + g * 0.04, 0.9, 0.75 - g * 0.3);
      this.grimoire.scaling.setAll(1 + g * 0.35);
    }

    // Hit flash via overlay.
    this.flash = Math.max(0, this.flash - dt);
    const f = this.flash > 0;
    for (const m of this.meshes) {
      m.renderOverlay = f;
      if (f) { m.overlayColor = this.flashColor ?? BB.Color3.White(); m.overlayAlpha = 0.85; }
      m.visibility = this.visibility;
    }

    const tagsOn = fighter.alive;
    const bound = tagsOn && fighter.tags.has("BOUND");
    for (const [i, r] of this.boundRings.entries()) { r.setEnabled(bound); if (bound) r.rotation.y += dt * (i ? -3 : 3); }
    this.anchorRing.setEnabled(tagsOn && fighter.tags.has("ANCHORED"));
    const shielded = tagsOn && fighter.tags.has("SHIELDED");
    this.dome.setEnabled(shielded);
    if (shielded) this.dome.visibility = 0.7 + Math.sin(this.time * 6) * 0.2;
    if (this.hairTail) this.hairTail.rotation.x = -run * 0.6 + Math.sin(held * 9) * 0.1 * (0.3 + run);
    const marked = fighter.tags.has("MARKED") && fighter.alive;
    this.markRing.setEnabled(marked);
    if (marked) { this.markRing.rotation.y += dt * 4; this.markRing.scaling.setAll(1 + Math.sin(this.time * 8) * 0.08); }

    this.shadow.position.set(x, 0.03, z);
    const s = Math.max(0.35, 1 - y * 0.12) * (this.look.scale ?? 1) * (this.look.form === "beast" ? 1.2 : 1);
    this.shadow.scaling.set(s, s, s);
    this.shadow.visibility = this.visibility;
  }

  /**
   * Performance (Phase 4 Step 5): parts that move together (same parent node, material and ink line)
   * become one mesh, so a character costs about a third of the draw calls. Parts the rig animates on
   * their own (anything kept as a field: skirt, cape, halo, gear…) are left as they are.
   */
  _bakeParts() {
    const BB = B(), keep = new Set(Object.values(this).filter((v) => v instanceof BB.AbstractMesh)), groups = new Map();
    for (const m of this.meshes) {
      if (keep.has(m) || !m.parent || !m.isEnabled(false) || !m.material || !m.getTotalVertices()) continue;
      const key = `${m.parent.uniqueId}|${m.material.uniqueId}|${m.renderOutline ? `${m.outlineWidth}|${m.outlineColor.toHexString()}` : "-"}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    }
    const merged = new Set();
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const parent = list[0].parent, { renderOutline, outlineWidth, outlineColor } = list[0];
      for (const m of list) m.parent = null; // their local transforms become the merge space
      const noGlow = list.some((m) => m.metadata?.noGlow);
      const one = BB.Mesh.MergeMeshes(list, true, true);
      if (!one) { for (const m of list) m.parent = parent; continue; }
      one.parent = parent; one.isPickable = false;
      if (noGlow) one.metadata = { noGlow: true };
      one.renderOutline = renderOutline; one.outlineWidth = outlineWidth; one.outlineColor = outlineColor.clone();
      for (const m of list) merged.add(m);
      this.meshes.push(one);
    }
    this.meshes = this.meshes.filter((m) => !merged.has(m));
  }

  /** Hide or show the whole character (cutscenes hide the player). */
  setVisible(on) { this.root.setEnabled(on); this.shadow.setEnabled(on); }

  hitFlash(seconds = 0.07, hex) {
    this.flash = seconds;
    this.flashColor = hex ? B().Color3.FromHexString(hex) : null;
  }

  /** Blade hilt and tip in world space, for trails. */
  bladeWorld() {
    refreshWorld(this.tipNode);
    this.hiltNode.computeWorldMatrix(true);
    return { tip: this.tipNode.getAbsolutePosition(), hilt: this.hiltNode.getAbsolutePosition() }; // live vectors: copy, don't keep
  }

  /** A frozen translucent copy of the current pose (Afterimage ghosts). */
  snapshot(material) {
    refreshWorld(this.root);
    const out = [];
    for (const m of this.meshes) {
      if (!m.isEnabled()) continue;
      refreshWorld(m);
      const g = m.clone(`${m.name}-ghost`, null, true, false);
      if (m.skeleton) { g.makeGeometryUnique(); g.applySkeleton(m.skeleton); g.skeleton = null; } // freeze the pose
      g.parent = null;
      const wm = m.getWorldMatrix();
      const sc = new (B().Vector3)(), rq = new (B().Quaternion)(), tr = new (B().Vector3)();
      wm.decompose(sc, rq, tr);
      g.position.copyFrom(tr); g.rotationQuaternion = rq; g.scaling.copyFrom(sc);
      g.material = material;
      g.renderOutline = false;
      g.renderOverlay = false;
      g.visibility = 1;
      out.push(g);
    }
    return out;
  }

  dispose() {
    this.skeleton?.dispose();
    this.root.dispose(false, true); // this rig's materials go with it (they're per-rig)
    this.shadow.dispose(false, true);
  }
}

Rig.view = null;        // the camera's ground position, set by the game each frame
Rig.outlineRange = 30;  // metres

const RELAXED = [1.5, -0.12, 0.05]; // hanging at the side, a little away from the body (never across the coat)
const CRADLE = [0.95, -0.55, 0];
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const lerpAngleSafe = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
