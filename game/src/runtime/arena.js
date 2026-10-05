// The Lantern Knights' training yard at night: a stone ring, a lantern sigil, pillars with lanterns.

import { B, PALETTE, toon, glow, inkOutline, color3 } from "./look.js";

export function buildArena(scene, { mobile = false } = {}) {
  const BB = B(), MB = BB.MeshBuilder;
  const before = new Set(scene.meshes);
  scene.clearColor = BB.Color4.FromHexString(PALETTE.sky + "ff");
  scene.ambientColor = color3("#20243a");
  scene.fogMode = BB.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.018;
  scene.fogColor = color3(PALETTE.sky);

  const hemi = new BB.HemisphericLight("hemi", new BB.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.55;
  hemi.diffuse = color3("#b9c4ff");
  hemi.groundColor = color3("#3a2a4a");
  const sun = new BB.DirectionalLight("moon", new BB.Vector3(-0.45, -1, 0.35), scene);
  sun.intensity = 0.95;
  sun.diffuse = color3("#ffe2b0");

  const floor = MB.CreateCylinder("floor", { diameter: 38, height: 0.6, tessellation: mobile ? 40 : 64 }, scene);
  floor.position.y = -0.3;
  floor.material = toon(scene, "floor", PALETTE.stone);
  floor.isPickable = false;
  const lip = MB.CreateTorus("lip", { diameter: 38, thickness: 0.7, tessellation: mobile ? 40 : 64 }, scene);
  lip.position.y = -0.05;
  lip.material = toon(scene, "lip", PALETTE.stoneDark);
  inkOutline(lip, 0.04);

  // The lantern sigil painted into the stone.
  const sigil = glow(scene, "sigil", "#8a6a2c", 0.55);
  for (const [d, t] of [[11, 0.06], [22, 0.08], [30, 0.05]]) {
    const r = MB.CreateTorus("sigilRing", { diameter: d, thickness: t, tessellation: 64 }, scene);
    r.position.y = 0.012; r.material = sigil; r.isPickable = false;
  }
  for (let i = 0; i < 8; i++) {
    const spoke = MB.CreateBox("spoke", { width: 0.05, height: 0.01, depth: 9.5 }, scene);
    const a = (i / 8) * Math.PI * 2;
    spoke.position.set(Math.sin(a) * 8.25, 0.012, Math.cos(a) * 8.25);
    spoke.rotation.y = a;
    spoke.material = sigil; spoke.isPickable = false;
  }

  // Pillars with lanterns.
  const pillarMat = toon(scene, "pillar", "#2e3242");
  const capMat = toon(scene, "cap", "#454a5e");
  const flame = glow(scene, "lanternFlame", PALETTE.lantern);
  const lanternFrame = toon(scene, "lanternFrame", "#1a1b22");
  const count = mobile ? 8 : 12;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.13;
    const x = Math.sin(a) * 20.5, z = Math.cos(a) * 20.5;
    const h = 5.5 + (i % 3) * 0.8;
    const p = MB.CreateCylinder("pillar", { height: h, diameterTop: 0.9, diameterBottom: 1.2, tessellation: 8 }, scene);
    p.position.set(x, h / 2, z); p.material = pillarMat; inkOutline(p, 0.05);
    const cap = MB.CreateBox("cap", { width: 1.5, height: 0.35, depth: 1.5 }, scene);
    cap.position.set(x, h + 0.17, z); cap.rotation.y = a; cap.material = capMat; inkOutline(cap, 0.04);
    const arm = MB.CreateBox("arm", { width: 0.12, height: 0.12, depth: 1.2 }, scene);
    arm.position.set(x - Math.sin(a) * 0.9, h - 0.6, z - Math.cos(a) * 0.9); arm.rotation.y = a; arm.material = lanternFrame;
    const lan = MB.CreateBox("lantern", { width: 0.4, height: 0.55, depth: 0.4 }, scene);
    lan.position.set(x - Math.sin(a) * 1.45, h - 1.05, z - Math.cos(a) * 1.45); lan.material = lanternFrame; inkOutline(lan, 0.03);
    const f = MB.CreateBox("flame", { width: 0.3, height: 0.42, depth: 0.3 }, scene);
    f.position.copyFrom(lan.position); f.material = flame;
  }
  const warm = new BB.PointLight("yardLight", new BB.Vector3(0, 7, 0), scene);
  warm.diffuse = color3("#ffbf6a"); warm.intensity = 0.35; warm.range = 30;

  // Distant mountains and the moon, softened by fog.
  const far = toon(scene, "far", "#1f2236");
  for (let i = 0; i < (mobile ? 9 : 16); i++) {
    const a = (i / (mobile ? 9 : 16)) * Math.PI * 2;
    const h = 10 + ((i * 37) % 11);
    const m = MB.CreateCylinder("peak", { height: h, diameterTop: 0, diameterBottom: 14 + ((i * 13) % 8), tessellation: 5 }, scene);
    m.position.set(Math.sin(a) * 62, h / 2 - 2, Math.cos(a) * 62);
    m.rotation.y = i; m.material = far; m.isPickable = false;
  }
  const moon = MB.CreateDisc("moon", { radius: 6, tessellation: 40 }, scene);
  moon.position.set(-38, 34, 70);
  moon.billboardMode = BB.Mesh.BILLBOARDMODE_ALL;
  const mm = glow(scene, "moonMat", "#f4ecd6"); moon.material = mm;

  // Drifting embers for atmosphere.
  const emberBase = MB.CreateBox("ember", { size: 0.06 }, scene);
  emberBase.material = glow(scene, "emberMat", "#ffcf7a");
  emberBase.setEnabled(false);
  const embers = [];
  for (let i = 0; i < (mobile ? 18 : 40); i++) {
    const e = emberBase.createInstance("ember" + i);
    e.position.set((Math.random() - 0.5) * 34, Math.random() * 7, (Math.random() - 0.5) * 34);
    embers.push({ mesh: e, speed: 0.2 + Math.random() * 0.4, phase: Math.random() * 10 });
  }
  // The bog: murky water over the yard during Hask's fight. It drains when the boss reaches phase 3.
  const bog = MB.CreateDisc("bog", { radius: 16.5, tessellation: mobile ? 40 : 64 }, scene);
  bog.rotation.x = Math.PI / 2; bog.position.y = 0.025;
  const bogMat = new BB.StandardMaterial("bogMat", scene);
  bogMat.diffuseColor = color3("#2f3a26"); bogMat.specularColor = color3("#9fb07a"); bogMat.specularPower = 24;
  bogMat.emissiveColor = color3("#141a10"); bogMat.alpha = 0.82;
  bog.material = bogMat; bog.isPickable = false; bog.setEnabled(false);
  let bogLevel = 0, bogTarget = 0;
  const own = scene.meshes.filter((m) => !before.has(m) && m !== bog && m !== emberBase);
  let visible = true;
  const env = { clear: PALETTE.sky, fog: PALETTE.sky, fogDensity: 0.018, hemi: [0.55, "#b9c4ff", "#3a2a4a"], sun: [0.95, "#ffe2b0", [-0.45, -1, 0.35]], warm: 0.35 };

  return {
    env,
    /** Show or hide the yard (story sets replace it). */
    setVisible(on) {
      visible = on;
      for (const m of own) m.setEnabled(on);
      if (!on) bog.setEnabled(false);
    },
    setBog(on, instant = false) { bogTarget = on ? 1 : 0; if (instant) bogLevel = bogTarget; },
    update(dt, time) {
      if (!visible) return;
      bogLevel += (bogTarget - bogLevel) * Math.min(1, dt * (bogTarget ? 2 : 0.6));
      bog.setEnabled(bogLevel > 0.01);
      if (bogLevel > 0.01) { const s = 0.15 + 0.85 * bogLevel; bog.scaling.set(s, s, 1); bogMat.alpha = 0.82 * bogLevel; bog.rotation.z = time * 0.02; }
      for (const e of embers) {
        e.mesh.position.y += e.speed * dt;
        e.mesh.position.x += Math.sin(time * 0.7 + e.phase) * 0.15 * dt;
        if (e.mesh.position.y > 8) e.mesh.position.y = 0.2;
      }
    },
  };
}
