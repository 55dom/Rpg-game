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

// ---- Cel-shading v2 (GDD §19.6.1) -------------------------------------------------------------
// One crisp shadow step with hue-shifted shadows, hemispheric tint, rim light, anime "angel ring"
// hair gloss with white streaks, exp² fog, and a dithered dissolve for fades (no blending needed).

const TOON_VS = `precision highp float;
attribute vec3 position; attribute vec3 normal;
uniform mat4 world; uniform mat4 worldViewProjection;
varying vec3 vN; varying vec3 vP;
void main() {
  vec4 wp = world * vec4(position, 1.0);
  vP = wp.xyz;
  vN = normalize(mat3(world) * normal);
  gl_Position = worldViewProjection * vec4(position, 1.0);
}`;
const TOON_FS = `precision highp float;
varying vec3 vN; varying vec3 vP;
uniform vec3 baseColor; uniform vec3 shadowColor; uniform vec3 lightDir; uniform vec3 rimColor; uniform vec3 glossColor;
uniform vec3 cameraPosition; uniform vec3 fogColor; uniform vec3 ambientSky; uniform vec3 ambientGround;
uniform float rimStrength; uniform float glossStrength; uniform float fogDensity; uniform float visibility;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  if (visibility < 0.999 && hash(floor(gl_FragCoord.xy)) > visibility) discard;
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vP);
  vec3 l = normalize(lightDir);
  float lit = smoothstep(0.0, 0.05, dot(n, l) + 0.18);
  vec3 col = mix(shadowColor, baseColor, lit);
  col *= mix(ambientGround, ambientSky, n.y * 0.5 + 0.5);
  float facing = max(dot(n, v), 0.0);
  col += rimColor * pow(1.0 - facing, 3.0) * rimStrength * (0.35 + 0.65 * lit);
  if (glossStrength > 0.0) {
    float ring = smoothstep(0.30, 0.38, n.y) * (1.0 - smoothstep(0.50, 0.58, n.y)) * smoothstep(0.15, 0.5, facing);
    float streak = step(0.55, sin(atan(n.x, n.z) * 14.0));
    col = mix(col, glossColor, ring * glossStrength * 0.45);
    col = mix(col, vec3(1.0), ring * streak * glossStrength * 0.45);
  }
  // Grade (GDD §19.6.1): a little extra saturation and contrast, like a bright TV anime.
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(luma), col, 1.18), 0.0, 1.0);
  col = (col - 0.5) * 1.05 + 0.5;
  float d = length(cameraPosition - vP);
  col = mix(fogColor, col, exp(-pow(fogDensity * d, 2.0)));
  gl_FragColor = vec4(col, 1.0);
}`;

const hexToHsl = (hex) => {
  const c = color3(hex), r = c.r, g = c.g, b = c.b;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const hslToColor = (h, s, l) => {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return new (B().Color3)(f(0), f(8), f(4));
};
/** Shadow tone: darker, slightly more saturated, hue pulled toward blue-violet (never grey). */
export function shadowOf(hex) {
  const [h, s, l] = hexToHsl(hex);
  const toward = 245, dh = ((toward - h + 540) % 360) - 180;
  return hslToColor((h + dh * 0.12 + 360) % 360, Math.min(1, s * 0.9 + 0.05), l * (0.6 + 0.2 * l));
}
/** A lighter tint of the same hue, for hair gloss. */
export function glossOf(hex) {
  const [h, s, l] = hexToHsl(hex);
  return hslToColor(h, Math.min(1, s + 0.1), Math.min(0.88, l + 0.16 + 0.22 * l));
}
/** Darkened local color for tinted outlines. */
export function lineOf(hex) {
  const [h, s, l] = hexToHsl(hex);
  return hslToColor((h + ((245 - h + 540) % 360 - 180) * 0.1 + 360) % 360, Math.min(0.5, s * 0.4 + 0.1), Math.min(0.09, l * 0.16));
}

export const TOON_SCENE = { lightDir: [0.45, 1, -0.35], fogColor: "#141826", fogDensity: 0.018, sky: [1.0, 1.0, 1.05], ground: [0.82, 0.8, 0.92], rim: [0.72, 0.84, 1.0] };
let toonMaterials = [];
const toonEnv = { ...TOON_SCENE }; // the current set's lighting (sets change it)

/** Apply a set's lighting to every character material, now and for ones made later. */
export function setToonEnvironment(env) {
  Object.assign(toonEnv, TOON_SCENE, env);
  const BB = B();
  toonMaterials = toonMaterials.filter((m) => !m.gone);
  for (const m of toonMaterials) applyToonEnv(m, BB);
}
function applyToonEnv(m, BB) {
  const T = toonEnv;
  m.setVector3("lightDir", new BB.Vector3(...T.lightDir));
  m.setColor3("fogColor", color3(T.fogColor));
  m.setColor3("ambientSky", new BB.Color3(...T.sky));
  m.setColor3("ambientGround", new BB.Color3(...T.ground));
  m.setFloat("fogDensity", T.fogDensity);
  m.setColor3("rimColor", new BB.Color3(...T.rim));
}

/** Cel-shading v2 material for characters. `gloss`: anime hair highlights. */
export function toon2(scene, name, hex, { gloss = false, rim = 0.45, softShadow = 0 } = {}) {
  const BB = B();
  if (!BB.Effect.ShadersStore.toon2VertexShader) {
    BB.Effect.ShadersStore.toon2VertexShader = TOON_VS;
    BB.Effect.ShadersStore.toon2FragmentShader = TOON_FS;
  }
  const m = new BB.ShaderMaterial(name, scene, { vertex: "toon2", fragment: "toon2" }, {
    attributes: ["position", "normal"],
    uniforms: ["world", "worldViewProjection", "baseColor", "shadowColor", "lightDir", "rimColor", "glossColor", "cameraPosition",
      "fogColor", "ambientSky", "ambientGround", "rimStrength", "glossStrength", "fogDensity", "visibility"],
  });
  m.setColor3("baseColor", color3(hex));
  m.setColor3("shadowColor", softShadow ? BB.Color3.Lerp(shadowOf(hex), color3(hex), softShadow) : shadowOf(hex)); // faces: a lighter shadow
  m.setColor3("glossColor", glossOf(hex));
  applyToonEnv(m, BB);
  m.setFloat("rimStrength", rim);
  m.setFloat("glossStrength", gloss ? 1 : 0);
  m.setFloat("visibility", 1);
  m.onBindObservable.add((mesh) => {
    const e = m.getEffect();
    if (!e) return;
    const cam = scene.activeCamera;
    if (cam) e.setVector3("cameraPosition", cam.globalPosition);
    e.setFloat("visibility", mesh.visibility ?? 1);
  });
  m.toonHex = hex;
  m.onDisposeObservable.add(() => { m.gone = true; });
  toonMaterials.push(m);
  return m;
}

/** If this device can't compile the toon shader, swap every character part back to the classic material. */
export function toonFallbackIfBroken(scene) {
  const broken = toonMaterials.some((m) => m.getEffect()?.getCompilationError?.());
  if (!broken) return false;
  const swap = new Map();
  for (const mesh of scene.meshes) {
    const m = mesh.material;
    if (!m?.toonHex) continue;
    if (!swap.has(m)) swap.set(m, toon(scene, `${m.name}-fallback`, m.toonHex));
    mesh.material = swap.get(m);
  }
  return true;
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
