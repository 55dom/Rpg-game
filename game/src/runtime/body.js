// Character bodies (GDD §29): a full anatomy fitted under each storyboard head, dressed from the
// character sheet, then baked into one skinned mesh that follows the rig's nodes.
//
//   root ─ pelvis (hip height; tilts the whole figure for kneels and falls)
//            ├─ body (the torso: leans for attacks) ─ head · shoulder (weapon arm) · offArm ─ offElbow
//            ├─ hipL/R ─ kneeL/R ─ ankleL/R       (legs, posed by core/ik.js)
//            └─ skirt (coat tails, robes: swing with the thighs)

import { B, toon2, toonSkin, lineOf } from "./look.js";
import { HEAD_Y, BUILDS, sheetFor } from "../data/sheets.js";

const ANKLE_H = 0.075;           // ankle joint height above the ground
const V = (x, y, z = 0) => new (B().Vector3)(x, y, z);

/** A lathed shape from [radius, y] pairs (top to bottom). */
function lathe(scene, name, prof, { tess = 9, arc = 1, side } = {}) {
  const BB = B();
  return BB.MeshBuilder.CreateLathe(name, { shape: prof.map(([r, y]) => V(r, y)), tessellation: Math.max(4, Math.round(tess * LOD.tess)), arc,
    sideOrientation: side ?? (arc < 1 ? BB.Mesh.DOUBLESIDE : LATHE_SIDE()) }, scene);
}
/** Lathes are closed solids, so only their outside is drawn (half the triangles of double-sided). */
const LATHE_SIDE = () => B().Mesh.BACKSIDE;
/** Detail scale for every body (phones use less). */
export const LOD = { tess: 1 };
/** A lathed shell with thickness (garments), so ink outlines never show through an open edge. */
function shell(scene, name, prof, thick, opts) {
  const outer = prof, inner = [...prof].reverse().map(([r, y]) => [Math.max(0.005, r - thick), y]);
  return lathe(scene, name, [...outer, ...inner, outer[0]], opts);
}
/** Radius of a [radius, y] profile at height y (linear between points). */
function radiusAt(prof, y) {
  for (let i = 0; i < prof.length - 1; i++) {
    const [r0, y0] = prof[i], [r1, y1] = prof[i + 1];
    if ((y <= y0 && y >= y1) || (y >= y0 && y <= y1)) return y0 === y1 ? r0 : r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
  }
  return prof[0][0];
}
const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const hash = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 2147483647; return h || 1; };

/**
 * Build the body for a rig. Creates rig.pelvis, rig.body, rig.head (node only), rig.shoulder, rig.offArm,
 * rig.offElbow, rig.legs[], rig.skirt, and records the proportions the animator needs.
 * `add(mesh, parent, x, y, z, outline)` registers parts; `skin` is the face material.
 */
export function buildBody(rig, scene, id, L, kind, add, skin) {
  const BB = B(), MB = BB.MeshBuilder;
  const S = sheetFor(kind, L), Bd = BUILDS[S.build] ?? BUILDS.athletic, O = S.outfit;
  const shoulderWide = L.shoulders ?? 1;
  const sw = Bd.sw * (1 + Math.max(0, shoulderWide - 1) * 0.3), cw = Bd.cw, ww = Bd.ww, hw = Bd.hw, depth = Bd.depth;
  const hip = Bd.hip, T = HEAD_Y - 0.32 - hip; // torso: hip joint to the top of the shoulders
  const legLen = hip - 0.03 - ANKLE_H, a = legLen * 0.51, b = legLen * 0.49;
  const r = rng(hash(id));
  const mats = new Map();
  const M = (hex, opt) => { const k = hex + (opt ? "g" : ""); if (!mats.has(k)) mats.set(k, toon2(scene, `${id}-b${mats.size}`, hex, opt)); return mats.get(k); };
  const top = M(O.top), legsMat = O.legs ? M(O.legs) : skin, boot = M(O.bootColor ?? "#3a2a22");
  const dirty = (m, g) => { m.metadata = { ...m.metadata, grime: g ?? O.grime ?? 0 }; return m; };
  const wear = (m) => dirty(m);

  rig.sheet = S; rig.build = Bd; rig.hipY = hip; rig.T = T; rig.legA = a; rig.legB = b;

  // ---- skeleton nodes ----
  const node = (name, parent, x, y, z) => { const n = new BB.TransformNode(`${id}-${name}`, scene); n.parent = parent; n.position.set(x, y, z); return n; };
  rig.pelvis = node("pelvis", rig.root, 0, hip, 0);
  rig.body = node("body", rig.pelvis, 0, 0, 0);
  rig.head = node("head", rig.body, 0, HEAD_Y - hip, 0);

  // ---- torso ----
  const torsoProf = [[0, T + 0.004], [0.085, T], [sw * 0.6, 0.93 * T], [cw * 1.02, 0.8 * T], [cw, 0.64 * T], [ww, 0.36 * T],
    [hw, 0.05], [hw * 0.95, -0.04], [hw * 0.62, -0.11], [0, -0.125]];
  const torso = add(lathe(scene, "torso", torsoProf, { tess: 11 }), rig.body, 0, 0, 0);
  torso.scaling.z = depth; torso.material = top;
  const torsoR = (y) => radiusAt(torsoProf, y);
  // Neck, from the collarbones to under the jaw.
  const chinY = HEAD_Y - hip - 0.2;
  const neck = add(MB.CreateCylinder("neck", { height: chinY - T + 0.06, diameterTop: 0.1, diameterBottom: 0.12, tessellation: 10 }, scene), rig.body, 0, (chinY + T) / 2 - 0.01, -0.01, 0);
  neck.material = skin;
  // Shoulder caps (deltoids), so the arms join the torso instead of poking out of it.
  for (const s of [-1, 1]) {
    const d = add(MB.CreateSphere("deltoid", { diameter: Bd.arm * 2.25, segments: 6 }, scene), rig.body, s * (sw - Bd.arm * 0.65), T - 0.07, 0);
    d.scaling.set(0.95, 0.7, depth * 1.2); d.material = top; // a shoulder that blends into the arm, not a ball joint
  }
  if (O.machine) { // clockwork: riveted bands and a chest boiler window
    for (const y of [0.25, 0.55, 0.8]) { const band = add(MB.CreateTorus("band", { diameter: torsoR(y * T) * 2 + 0.02, thickness: 0.035, tessellation: 8 }, scene), rig.body, 0, y * T, 0); band.scaling.z = depth; band.material = M(O.bootColor); }
    const win = add(MB.CreateCylinder("boiler", { height: 0.03, diameter: 0.16, tessellation: 12 }, scene), rig.body, 0, 0.62 * T, cw * depth + 0.01); win.rotation.x = Math.PI / 2; win.material = M("#ff3a1a");
    // Exposed ribs over the chest: dark iron bars.
    for (const y of [0.4, 0.5, 0.7, 0.8]) for (const sx of [-1, 1]) { const rib = add(MB.CreateBox("rib", { width: cw * 0.7, height: 0.025, depth: 0.03 }, scene), rig.body, sx * cw * 0.45, y * T, torsoR(y * T) * depth + 0.01); rib.rotation.z = sx * 0.25; rib.material = M("#2a2622"); }
  }
  if (O.moss) for (let i = 0; i < 4; i++) { // the bog brutes: bone spines down the hunched back
    const sp = add(MB.CreateCylinder("spine", { height: 0.22 - i * 0.03, diameterTop: 0, diameterBottom: 0.09, tessellation: 5 }, scene), rig.body, 0, T * (0.95 - i * 0.2), -cw * depth - 0.02);
    sp.rotation.x = -1.1; sp.material = M("#d8cfb4");
  }
  if (O.moss) for (const s of [-1, 1, 0]) { // the bog brutes: moss on the shoulders and back
    const t = add(MB.CreateCylinder("moss", { height: 0.28, diameterTop: 0, diameterBottom: 0.2, tessellation: 5 }, scene), rig.body, s * sw * 0.7, T, s ? 0 : -cw * depth);
    t.rotation.set(-0.3, 0, -s * 0.5); t.material = M("#6f8a3a");
  }

  // ---- legs ----
  rig.legs = [];
  const hx = hw * 0.55 * (S.gait === "heavy" ? 1.1 : 1);
  for (const s of [-1, 1]) {
    const hipN = node(`hip${s}`, rig.pelvis, s * hx, -0.03, 0);
    const kneeN = node(`knee${s}`, hipN, 0, -a, 0);
    const ankleN = node(`ankle${s}`, kneeN, 0, -b, 0);
    const t = Bd.thigh, k = Bd.knee, c = Bd.calf, an = Bd.ankle;
    const shorts = O.shorts;
    if (O.machine) { // pistons: a brass cylinder, a dark rod, ball joints
      const th = add(MB.CreateCylinder("pistonTop", { height: a, diameter: t * 1.6, tessellation: 10 }, scene), hipN, 0, -a / 2, 0); th.material = top;
      const rod = add(MB.CreateCylinder("pistonRod", { height: b, diameter: c * 0.9, tessellation: 8 }, scene), kneeN, 0, -b / 2, 0); rod.material = M(O.bootColor);
      const j = add(MB.CreateSphere("joint", { diameter: k * 2.4, segments: 6 }, scene), kneeN, 0, 0, 0); j.material = M(O.bootColor);
    } else {
      const thigh = add(lathe(scene, "thigh", [[0, 0.045], [t * 0.85, 0.04], [t, -0.05], [t * 0.97, -0.28 * a], [t * 0.8, -0.62 * a], [k * 1.12, -0.93 * a], [k, -a], [0, -a - 0.01]]), hipN, 0, 0, 0);
      thigh.material = legsMat; wear(thigh);
      const cap = add(MB.CreateSphere("knee", { diameter: k * 1.95, segments: 5 }, scene), kneeN, 0, 0, 0.006); cap.material = shorts ? skin : legsMat;
      const calf = add(lathe(scene, "calf", [[0, 0.012], [k, 0], [c, -0.17 * b], [c * 1.03, -0.29 * b], [c * 0.8, -0.58 * b], [an * 1.22, -0.88 * b], [an, -b], [0, -b - 0.006]]), kneeN, 0, 0, 0);
      calf.material = shorts ? skin : legsMat; wear(calf);
      if (shorts) { const hemS = add(MB.CreateTorus("shortsHem", { diameter: t * 1.9, thickness: 0.035, tessellation: 8 }, scene), hipN, 0, -a * 0.55, 0); hemS.material = legsMat; }
    }
    // Feet: a foot shape and a darker sole, toes forward. Boots cover the calf to their height.
    const footMat = O.boots === "bare" ? M(O.bootColor) : boot;
    const foot = add(MB.CreateSphere("foot", { diameter: 1, segments: 6 }, scene), ankleN, 0, -0.03, 0.06);
    foot.scaling.set(an * 2.7, 0.075, 0.25); foot.material = footMat; dirty(foot, (O.grime ?? 0) + 0.2);
    if (O.boots === "bare" && (O.moss || O.machine)) { // monsters: a broad webbed foot, three splayed toes, hooked claws
      foot.scaling.set(an * 3.6, 0.08, 0.22);
      const web = add(MB.CreateCylinder("footWeb", { height: 0.012, diameter: 0.42, tessellation: 12, arc: 0.36 }, scene), ankleN, 0, -0.06, 0.08);
      web.rotation.y = -Math.PI / 2 - Math.PI * 0.36; web.material = M(O.machine ? "#3a3022" : "#55602e"); // the webbing between the toes
      for (const [ang, len] of [[-0.55, 0.16], [0, 0.2], [0.55, 0.16]]) {
        const toe = add(MB.CreateCylinder("toe", { height: len, diameterTop: 0.035, diameterBottom: 0.055, tessellation: 6 }, scene), ankleN, Math.sin(ang) * len * 0.6, -0.05, 0.08 + Math.cos(ang) * len * 0.6);
        toe.rotation.set(Math.PI / 2, ang, 0); toe.material = footMat;
        const claw = add(MB.CreateCylinder("toeClaw", { height: 0.09, diameterTop: 0, diameterBottom: 0.035, tessellation: 5 }, scene), ankleN, Math.sin(ang) * (len + 0.05), -0.065, 0.08 + Math.cos(ang) * (len + 0.05));
        claw.rotation.set(Math.PI / 2 + 0.5, ang, 0); claw.material = M(O.machine ? "#2a2622" : "#d8cfb4");
      }
    }
    if (O.boots !== "bare") {
      const sole = add(MB.CreateBox("sole", { width: an * 2.5, height: 0.022, depth: 0.24 }, scene), ankleN, 0, -0.064, 0.065); sole.material = M("#1f1814");
      const top0 = { tall: 0.06, ankle: 0.62, shoes: 0.9, waders: -0.1 }[O.boots] ?? 0.9;
      if (top0 < 0.9) {
        const y0 = -top0 * b, c1 = Bd.calf * 1.18 + 0.01, ankR = Bd.ankle * 1.35 + 0.012;
        const shaft = add(shell(scene, "bootShaft", [[radiusAtCalf(Bd, top0) + 0.014, y0], [c1, Math.min(y0, -0.3 * b)], [ankR, -b], [ankR * 0.98, -b - 0.05]], 0.012), kneeN, 0, 0, 0);
        shaft.material = boot; dirty(shaft, (O.grime ?? 0) + 0.15);
        const cuff = add(MB.CreateTorus("bootCuff", { diameter: (radiusAtCalf(Bd, top0) + 0.02) * 2, thickness: 0.03, tessellation: 8 }, scene), kneeN, 0, y0, 0);
        cuff.material = boot;
        if (O.boots === "waders") { const up = add(shell(scene, "waderTop", [[t * 1.12, -0.25 * a], [k * 1.3 + 0.01, -a]], 0.01), hipN, 0, 0, 0); up.material = boot; dirty(up, 0.5); }
      }
    }
    rig.legs.push({ side: s, hip: hipN, knee: kneeN, ankle: ankleN, x: s * hx });
  }

  // ---- garment below the waist: coat tails, robes, dresses ----
  if (O.hem) {
    const len = { hip: 0.2, thigh: a * 0.6, knee: a + 0.06, ankle: hip - 0.13 }[O.hem];
    const flare = O.hem === "ankle" ? 0.34 : O.hem === "knee" ? 0.26 : 0.2;
    const r0 = hw * 1.05, r1 = r0 + len * flare;
    rig.skirt = node("skirt", rig.pelvis, 0, 0.07, 0);
    const prof = [[torsoR(0.12) + 0.012, 0.03], [r0 + 0.015, -0.06], [r0 + len * flare * 0.55, -len * 0.55], [r1, -len]];
    const hem = add(shell(scene, "hem", prof, 0.016, { tess: 12, arc: O.open && O.hem !== "hip" ? 0.86 : 1 }), rig.skirt, 0, 0, 0);
    hem.scaling.z = depth * 1.08; hem.rotation.y = O.open ? Math.PI / 2 + Math.PI * 0.14 : 0; hem.material = top; dirty(hem);
    const stitch = add(MB.CreateTorus("hemStitch", { diameter: r1 * 2 - 0.004, thickness: 0.012, tessellation: 12 }, scene), rig.skirt, 0, -len + 0.03, 0);
    stitch.scaling.z = depth * 1.08; stitch.material = M(O.stitch ?? darken(O.top, 0.55));
    if (O.tattered) { // ragged strips hanging below the hem, each a different length
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + r() * 0.2, L2 = 0.06 + r() * 0.12;
        const strip = add(MB.CreateBox("tatter", { width: 0.07, height: L2, depth: 0.012 }, scene), rig.skirt, Math.sin(ang) * r1 * 0.97, -len - L2 / 2 + 0.01, Math.cos(ang) * r1 * 0.97 * depth * 1.08);
        strip.rotation.set(0, ang, (r() - 0.5) * 0.3); strip.material = M(O.tattered);
      }
    }
    if (O.embroidery) { // a second gold band just above the hem
      const band = add(MB.CreateTorus("hemBand", { diameter: (r1 - len * flare * 0.12) * 2, thickness: 0.016, tessellation: 12 }, scene), rig.skirt, 0, -len * 0.88, 0);
      band.scaling.z = depth * 1.08; band.material = M(O.embroidery);
    }
    if (O.open && O.hem !== "hip") stitch.setEnabled(false);
    rig.hemLen = len;
  }

  // ---- arms ----
  const ar = Bd.arm, handS = 0.1 * Bd.hand;
  const sleeve = O.sleeves ?? "long";
  // Sleeves are a shade darker than the body of the garment, so an arm in front of the coat never disappears into it.
  const sleeveMat = M(darken(O.top, 0.8)), upperMat = sleeveMat, foreMat = sleeve === "long" ? sleeveMat : skin;
  const gloveMat = O.gloves ? M(O.gloves) : null;
  // Weapon arm: the shoulder pivot points the arm along +Z (pose data rotates it).
  rig.shoulder = node("shoulder", rig.body, sw - ar * 0.45, T - 0.08, 0.02);
  const armPart = (parent, along, s) => { // along: +1 forward (weapon arm, straight) or −1 down (off arm, bends at the elbow)
    const low = along > 0 ? parent : node("offElbow", parent, 0, -0.29, 0);
    const shift = along > 0 ? 0 : 0.29; // lower-arm parts are measured from the elbow on the off arm
    const lathePart = (name, prof, mat, on) => { const m = add(lathe(scene, name, prof), on, 0, 0, 0); m.material = mat; orient(m, along); if (on === low && shift) m.position.y = shift; return m; };
    const at = (m, d, ring) => { place(m, along, d - (m.parent === low ? shift : 0), ring); return m; };
    lathePart("upperArm", [[0, -0.015], [ar * 0.95, 0], [ar, 0.06], [ar * 0.86, 0.26], [ar * 0.74, 0.295], [0, 0.3]], sleeve === "short" ? skin : upperMat, parent);
    if (sleeve === "short") lathePart("sleeve", [[ar * 1.25, -0.01], [ar * 1.18, 0.14], [0, 0.145]], top, parent);
    lathePart("forearm", [[0, 0.285], [ar * 0.76, 0.29], [ar * 0.82, 0.35], [ar * 0.58, 0.54], [0, 0.55]], foreMat, low);
    const elbow = add(MB.CreateSphere("elbow", { diameter: ar * 1.2, segments: 5 }, scene), low, 0, 0, 0); elbow.material = sleeve === "long" ? top : skin; at(elbow, 0.29);
    if (sleeve === "rolled") { const cuff = add(MB.CreateTorus("rolledCuff", { diameter: ar * 1.9, thickness: 0.035, tessellation: 8 }, scene), parent, 0, 0, 0); cuff.material = top; at(cuff, 0.27, true); }
    if (O.bracers) lathePart("bracer", [[ar * 0.9, 0.38], [ar * 0.75, 0.52], [0, 0.521]], M(O.bracers), low);
    // Hand: palm and fingers as one mitten, plus a thumb.
    const hand = add(MB.CreateSphere("hand", { diameter: 1, segments: 5 }, scene), low, 0, 0, 0);
    if (along > 0) hand.scaling.set(handS * 0.9, handS * 0.75, handS * 1.15); else hand.scaling.set(handS * 0.75, handS * 1.15, handS * 0.9);
    hand.material = gloveMat ?? skin; at(hand, 0.6);
    const thumb = add(MB.CreateCapsule("thumb", { height: handS * 0.6, radius: handS * 0.16, tessellation: 6 }, scene), low, 0, 0, 0);
    thumb.material = gloveMat ?? skin; at(thumb, 0.58);
    if (along > 0) { thumb.position.x += s * handS * 0.35; thumb.rotation.set(Math.PI / 2, 0, s * 0.6); } else { thumb.position.z += handS * 0.35; thumb.rotation.x = 0.5; }
    return low;
  };
  armPart(rig.shoulder, 1, -1);
  rig.offArm = node("offArm", rig.body, -(sw - ar * 0.45), T - 0.08, 0);
  rig.offArm.rotation.set(0.12, 0, -0.1);
  rig.offElbow = armPart(rig.offArm, -1, 1);

  // ---- layers above the waist ----
  const front = (y) => torsoR(y) * depth;
  if (O.collar) { const c = add(MB.CreateTorus("collar", { diameter: 0.25, thickness: 0.06, tessellation: 8 }, scene), rig.body, 0, T - 0.02, 0); c.scaling.z = 0.85; c.material = top; }
  if (O.vest) { const v = add(shell(scene, "vest", [[torsoR(0.86 * T) + 0.012, 0.86 * T], [cw + 0.016, 0.62 * T], [torsoR(0.08) + 0.016, 0.05]], 0.012, { arc: 0.85 }), rig.body, 0, 0, 0); v.scaling.z = depth; v.rotation.y = Math.PI / 2 + Math.PI * 0.15; v.material = M(O.vest); dirty(v); }
  if (O.breastplate) {
    const bp = add(shell(scene, "breastplate", [[sw * 0.66, 0.93 * T], [cw * 1.1, 0.8 * T], [cw * 1.08, 0.6 * T], [ww * 1.12 + 0.01, 0.3 * T]], 0.02, { tess: 14 }), rig.body, 0, 0, 0);
    bp.scaling.z = depth * 1.05; bp.material = M(O.breastplate);
    const ridge = add(MB.CreateBox("ridge", { width: 0.025, height: 0.5 * T, depth: 0.03 }, scene), rig.body, 0, 0.6 * T, front(0.6 * T) * 1.08 + 0.012); ridge.material = M(O.breastplate);
  }
  if (O.pauldrons) for (const s of [-1, 1]) {
    const p = add(MB.CreateSphere("pauldron", { diameter: ar * 3.2, segments: 6, slice: 0.55 }, scene), rig.body, s * (sw - ar * 0.5), T - 0.04, 0);
    p.scaling.set(0.95, 0.7, depth * 1.25); p.rotation.z = -s * 0.2; p.position.y = T - 0.02; p.material = M(O.pauldrons);
  }
  if (O.tabard) for (const z of [1, -1]) {
    const t = add(MB.CreateBox("tabard", { width: cw * 1.15, height: T * 0.85 + 0.35, depth: 0.014 }, scene), rig.body, 0, T * 0.5 - 0.17, z * (front(0.5 * T) + 0.03));
    t.material = M(O.tabard); dirty(t, (O.grime ?? 0) * 0.6);
    if (z > 0) { const em = add(MB.CreateCylinder("emblem", { height: 0.012, diameter: 0.12, tessellation: 12 }, scene), rig.body, 0, T * 0.62, front(0.62 * T) + 0.042); em.rotation.x = Math.PI / 2; em.material = M("#e6b54e"); }
  }
  if (O.apron) {
    const ap = add(MB.CreateBox("apron", { width: cw * 1.45, height: T * 0.62 + a * 0.85, depth: 0.014 }, scene), rig.body, 0, T * 0.62 - (T * 0.62 + a * 0.85) / 2, Math.max(front(0.2 * T), hw * depth) + 0.04);
    ap.rotation.x = 0.06; ap.material = M(O.apron); dirty(ap, (O.grime ?? 0) + 0.15);
    const tie = add(MB.CreateTorus("apronTie", { diameter: torsoR(0.3 * T) * 2 + 0.04, thickness: 0.018, tessellation: 8 }, scene), rig.body, 0, 0.3 * T, 0); tie.scaling.z = depth; tie.material = M(O.apron);
  }
  if (O.leather) { // a leather jerkin: a darker, stitched chest panel over the tunic
    const lp = add(shell(scene, "leatherPanel", [[sw * 0.62, 0.93 * T], [cw * 1.07, 0.78 * T], [cw * 1.04, 0.55 * T], [ww * 1.1 + 0.01, 0.25 * T]], 0.016, { tess: 11 }), rig.body, 0, 0, 0);
    lp.scaling.z = depth * 1.04; lp.material = M(darken(O.top, 0.78)); dirty(lp);
    for (const y of [0.42, 0.66]) { const seam = add(MB.CreateTorus("leatherSeam", { diameter: torsoR(y * T) * 2 + 0.05, thickness: 0.012, tessellation: 8 }, scene), rig.body, 0, y * T, 0); seam.scaling.z = depth * 1.05; seam.material = M(darken(O.top, 0.55)); }
  }
  if (O.baldric) for (const z of [1, -1]) { // a strap from one shoulder to the opposite hip
    const st = add(MB.CreateBox("baldric", { width: 0.06, height: T * 1.15, depth: 0.02 }, scene), rig.body, 0, T * 0.5, z * (front(0.5 * T) + 0.035));
    st.rotation.z = z * -0.6; st.material = M(O.baldric);
  }
  if (O.emblem) { // the city's gold star on the chest
    for (const r of [0, Math.PI / 4]) { const e = add(MB.CreateBox("emblem", { width: 0.09, height: 0.09, depth: 0.015 }, scene), rig.body, 0, T * 0.72, front(0.72 * T) + 0.02); e.rotation.z = r; e.material = M(O.emblem); }
  }
  if (O.buttons) for (let i = 0; i < 5; i++) { const y = T * (0.85 - i * 0.16); const b = add(MB.CreateSphere("button", { diameter: 0.035, segments: 4 }, scene), rig.body, 0.02, y, front(y) + 0.012); b.material = M(O.buttons); }
  if (O.belt) {
    const y = 0.1, br = Math.max(torsoR(y), O.hem ? hw * 1.06 : 0) + 0.014;
    const belt = add(shell(scene, "belt", [[br + 0.004, y + 0.035], [br + 0.004, y - 0.035]], 0.016, { tess: 16 }), rig.body, 0, 0, 0);
    belt.scaling.z = depth * (O.hem ? 1.08 : 1); belt.material = M(O.belt);
    const buckle = add(MB.CreateBox("buckle", { width: 0.07, height: 0.06, depth: 0.018 }, scene), rig.body, 0, y, br * depth * (O.hem ? 1.08 : 1) + 0.008);
    buckle.material = M("#c9b07a");
    for (let i = 0; i < (O.pouches ?? 0); i++) {
      const ang = (i % 2 ? -1 : 1) * (0.9 + Math.floor(i / 2) * 0.5);
      const pz = Math.cos(ang) * br * depth, px = Math.sin(ang) * br;
      const pouch = add(MB.CreateBox("pouch", { width: 0.09, height: 0.1, depth: 0.05 }, scene), rig.body, px * 1.05, y - 0.05, pz * 1.05);
      pouch.rotation.y = ang; pouch.material = M(darken(O.belt, 0.85)); dirty(pouch, (O.grime ?? 0) + 0.1);
    }
  }
  if (O.toolbelt) for (const [ang, h] of [[1.1, 0.22], [-1.2, 0.18], [2.4, 0.26]]) { // hammer, tongs, file
    const br = torsoR(0.1) + 0.02;
    const tool = add(MB.CreateBox("tool", { width: 0.03, height: h, depth: 0.03 }, scene), rig.body, Math.sin(ang) * br * 1.1, -0.04, Math.cos(ang) * br * depth * 1.1);
    tool.material = M(O.toolbelt);
    const head = add(MB.CreateBox("toolHead", { width: 0.08, height: 0.04, depth: 0.04 }, scene), rig.body, Math.sin(ang) * br * 1.1, -0.04 - h / 2, Math.cos(ang) * br * depth * 1.1);
    head.material = M("#5a5e66");
  }
  if (O.satchel) {
    const strap = add(MB.CreateBox("strap", { width: 0.035, height: T * 1.25, depth: 0.012 }, scene), rig.body, 0, T * 0.5, front(0.5 * T) + 0.02);
    strap.rotation.z = 0.62; strap.material = M(darken(O.satchel, 0.8));
    const bag = add(MB.CreateBox("satchel", { width: 0.2, height: 0.16, depth: 0.08 }, scene), rig.body, -(hw + 0.06), 0.02, 0.02);
    bag.material = M(O.satchel); dirty(bag, (O.grime ?? 0) + 0.1);
    const flap = add(MB.CreateBox("satchelFlap", { width: 0.205, height: 0.07, depth: 0.085 }, scene), rig.body, -(hw + 0.06), 0.075, 0.025); flap.material = M(darken(O.satchel, 0.85));
  }
  if (O.cloak) { // a short travelling cloak: thick panels from the shoulders, closed so its ink line stays clean
    const c = add(shell(scene, "cloak", [[sw * 0.55, T + 0.01], [sw * 1.02, T - 0.12], [sw * 1.05, T - 0.55], [sw * 1.1, -0.15]], 0.02, { tess: 14, arc: 0.5 }), rig.body, 0, 0, 0);
    c.rotation.y = Math.PI; c.scaling.z = depth * 1.15; c.material = M(O.cloak); dirty(c);
    const clasp = add(MB.CreateSphere("clasp", { diameter: 0.05, segments: 4 }, scene), rig.body, sw * 0.4, T - 0.02, front(T - 0.06) + 0.02); clasp.material = M("#c9b07a");
  }
  if (O.brooch) { const br = add(MB.CreateSphere("brooch", { diameter: 0.055, segments: 4 }, scene), rig.body, -sw * 0.35, 0.82 * T, front(0.82 * T) + 0.012); br.material = M(O.brooch); }
  if (O.chain) { const ch = add(MB.CreateTorus("chain", { diameter: 0.3, thickness: 0.014, tessellation: 8 }, scene), rig.body, 0, T - 0.07, 0.03); ch.rotation.x = 1.15; ch.material = M(O.chain); }
  // Repairs: patches sewn onto the coat and trousers (seeded per character, so they never move).
  for (let i = 0; i < (O.patches ?? 0); i++) {
    const onLeg = i % 2 === 1 && rig.legs.length;
    const leg = rig.legs[i % 2];
    const p = add(MB.CreateBox("patch", { width: 0.07 + r() * 0.04, height: 0.07 + r() * 0.03, depth: 0.012 }, scene), onLeg ? leg.knee : rig.body, 0, 0, 0);
    if (onLeg) p.position.set(0, 0.06 + r() * 0.08, Bd.thigh * 0.9 + 0.008);
    else { const y = (0.2 + r() * 0.5) * T, ang = (r() - 0.5) * 1.6; p.position.set(Math.sin(ang) * torsoR(y), y, Math.cos(ang) * torsoR(y) * depth + 0.008); p.rotation.y = ang; }
    p.rotation.z = (r() - 0.5) * 0.5;
    p.material = M(darken(onLeg ? O.legs ?? O.top : O.top, 0.75 + r() * 0.1));
  }
  return { S, T };
}

const radiusAtCalf = (Bd, k) => (k < 0.2 ? Bd.knee + (Bd.calf - Bd.knee) * (k / 0.2) : Bd.calf * (1 - (k - 0.2) * 0.35));
/** Point a limb part built along +Y forward (+Z) or down (−Y). */
function orient(m, along) { if (along > 0) m.rotation.x = Math.PI / 2; else m.rotation.x = Math.PI; }
/** Put a part `d` along the limb. */
function place(m, along, d, ring = false) {
  if (along > 0) { m.position.set(0, 0, d); if (ring) m.rotation.x = Math.PI / 2; } else m.position.set(0, -d, 0);
}
/** A darker shade of a hex color. */
export function darken(hex, k) {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Bake every cel-shaded part into skinned meshes (one with ink outlines, one without for the face):
 * a bone per node, each vertex rigidly bound to its part's node, base and shadow color per vertex.
 * Parts the rig animates on their own (kept as fields) stay separate.
 */
export function skinBake(rig, scene, id, { outline = 0.03 } = {}) {
  const BB = B();
  const keep = new Set(Object.values(rig).filter((v) => v instanceof BB.AbstractMesh));
  const parts = rig.meshes.filter((m) => m.material?.toonBake && !keep.has(m) && m.isEnabled(false) && m.getTotalVertices() > 0);
  if (!parts.length) return;
  const root = rig.root;
  root.computeWorldMatrix(true);
  const rootInv = root.getWorldMatrix().clone().invert();
  // Bones: every node between the root and a part, parents first.
  const nodes = [];
  const seen = new Set();
  const addChain = (n) => {
    if (!n || n === root || seen.has(n)) return;
    addChain(n.parent);
    seen.add(n); nodes.push(n);
  };
  for (const p of parts) addChain(p.parent);
  const skeleton = new BB.Skeleton(`${id}-skel`, `${id}-skel`, scene);
  const boneOf = new Map();
  for (const n of nodes) {
    n.computeWorldMatrix(true);
    const parentWorld = n.parent && n.parent !== root ? n.parent.getWorldMatrix() : root.getWorldMatrix();
    const local = n.getWorldMatrix().multiply(parentWorld.clone().invert());
    const bone = new BB.Bone(n.name, skeleton, boneOf.get(n.parent) ?? null, local);
    bone.linkTransformNode(n);
    boneOf.set(n, bone);
  }
  // Groups: arms and legs get their own mesh (and so their own ink line where they cross the body);
  // the face has no line of its own (the head's silhouette shell draws it).
  // The weapon arm swings across the body, so it keeps its own ink line; the off arm and the legs join the body.
  const anchors = new Map([[rig.shoulder, "armR"]]);
  const groupOf = (p) => { if (!p.renderOutline) return "face"; for (let n = p.parent; n && n !== root; n = n.parent) if (anchors.has(n)) return anchors.get(n); return "core"; };
  const groups = new Map();
  for (const p of parts) { const g = groupOf(p); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(p); }
  const out = [];
  for (const [name, list] of groups) {
    const withLine = name !== "face";
    const pos = [], nrm = [], col = [], shade = [], idx = [], mi = [], mw = [];
    for (const p of list) {
      p.computeWorldMatrix(true);
      const m = p.getWorldMatrix().multiply(rootInv);
      const P = p.getVerticesData(BB.VertexBuffer.PositionKind), N = p.getVerticesData(BB.VertexBuffer.NormalKind), I = p.getIndices();
      const base = p.material.toonBake, grime = p.metadata?.grime ?? 0;
      const bi = skeleton.bones.indexOf(boneOf.get(p.parent));
      const v0 = pos.length / 3;
      let ymin = Infinity, ymax = -Infinity;
      for (let i = 1; i < P.length; i += 3) { ymin = Math.min(ymin, P[i]); ymax = Math.max(ymax, P[i]); }
      for (let i = 0; i < P.length; i += 3) {
        const v = BB.Vector3.TransformCoordinates(V(P[i], P[i + 1], P[i + 2]), m);
        const n = BB.Vector3.TransformNormal(V(N[i], N[i + 1], N[i + 2]), m).normalize();
        pos.push(v.x, v.y, v.z); nrm.push(n.x, n.y, n.z);
        // Wear: dirt gathers toward the bottom of each garment and boot.
        const low = ymax > ymin ? 1 - (P[i + 1] - ymin) / (ymax - ymin) : 0;
        const g = 1 - grime * 0.32 * low * low;
        col.push(base.base.r * g, base.base.g * g, base.base.b * g, base.gloss);
        shade.push(base.shade.r * g, base.shade.g * g, base.shade.b * g);
        mi.push(bi, 0, 0, 0); mw.push(1, 0, 0, 0);
      }
      for (const k of I) idx.push(k + v0);
    }
    const mesh = new BB.Mesh(`${id}-${name === "core" ? "body" : name}`, scene);
    const vd = new BB.VertexData();
    vd.positions = pos; vd.normals = nrm; vd.indices = idx; vd.colors = col;
    vd.matricesIndices = mi; vd.matricesWeights = mw;
    vd.applyToMesh(mesh);
    mesh.setVerticesData("shade", shade, false, 3);
    mesh.parent = root;
    mesh.skeleton = skeleton;
    mesh.numBoneInfluencers = 1;
    mesh.material = toonSkin(scene, `${id}-skin-${name}`);
    mesh.isPickable = false;
    // Ink line width follows the part's size: thin limbs get thin lines, or they'd turn black up close.
    if (withLine) { mesh.renderOutline = true; mesh.outlineWidth = outline * ({ core: 1, armR: 0.5 }[name] ?? 1); mesh.outlineColor = lineOf(rig.sheet?.outfit?.top ?? "#2a2a2a"); }
    mesh.setBoundingInfo(new BB.BoundingInfo(V(-1.6, -0.5, -1.6), V(1.6, 2.8, 1.6)));
    out.push(mesh);
  }
  const usedMats = new Set(parts.map((p) => p.material));
  for (const p of parts) p.dispose(true, false);
  const gone = new Set(parts);
  const stillUsed = new Set(rig.meshes.filter((m) => !gone.has(m)).map((m) => m.material));
  for (const m of usedMats) if (!stillUsed.has(m)) m.dispose(); // the per-part toon materials live on only as vertex colors
  rig.meshes = [...rig.meshes.filter((m) => !gone.has(m)), ...out];
  rig.skeleton = skeleton;
  rig.skinned = out;
}
