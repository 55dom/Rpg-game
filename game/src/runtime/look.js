// Shared look: toon materials with ink outlines, palette, small Babylon helpers.

export const B = () => globalThis.BABYLON;

export const PALETTE = Object.freeze({
  ink: "#0f1117", inkSoft: "#1c2030", lantern: "#e6b54e", gale: "#78d4b2", danger: "#e25a52",
  stone: "#3a3e4d", stoneDark: "#272a36", sky: "#141826",
  rookCoat: "#2b3a5c", rookTrim: "#e6b54e", skin: "#f0d0b2", hair: "#1d1f2a", steel: "#c9d2dc",
  acolyteRobe: "#d9d2c3", acolyteHood: "#3d3050", acolyteSash: "#7a4f9a", mask: "#f4f1ea",
});

const colorCache = new Map();
/** Shared, read-only Color3 per hex string (clone before mutating). */
export const color3 = (hex) => {
  let c = colorCache.get(hex);
  if (!c) { c = B().Color3.FromHexString(hex); colorCache.set(hex, c); }
  return c;
};

/** Cel-shaded material (falls back to standard if the toon add-on failed to load). */
export function toon(scene, name, hex) {
  const BB = B();
  if (BB.CellMaterial) {
    const m = new BB.CellMaterial(name, scene);
    m.diffuseColor = color3(hex).clone();
    m.computeHighLevel = true;
    return m;
  }
  const m = new BB.StandardMaterial(name, scene);
  m.diffuseColor = color3(hex).clone();
  m.specularColor = BB.Color3.Black();
  return m;
}

/** Unlit glowing material for effects. */
export function glow(scene, name, hex, alpha = 1, additive = false) {
  const BB = B();
  const m = new BB.StandardMaterial(name, scene);
  m.disableLighting = true;
  m.emissiveColor = color3(hex).clone();
  m.diffuseColor = BB.Color3.Black();
  m.specularColor = BB.Color3.Black();
  m.backFaceCulling = false;
  m.alpha = alpha;
  if (additive) m.alphaMode = BB.Engine.ALPHA_ADD;
  m.fogEnabled = false;
  return m;
}

export function inkOutline(mesh, width = 0.03) {
  mesh.renderOutline = true;
  mesh.outlineWidth = width;
  mesh.outlineColor = color3(PALETTE.ink);
  return mesh;
}

/** Make sure a node's world matrix (and its parents') is current. */
export function refreshWorld(node) {
  const chain = [];
  for (let n = node; n; n = n.parent) chain.push(n);
  for (let i = chain.length - 1; i >= 0; i--) chain[i].computeWorldMatrix(true);
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const easeOut = (t) => 1 - (1 - t) * (1 - t) * (1 - t);
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
