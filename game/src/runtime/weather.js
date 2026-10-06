// Rain you can see (GDD §29.10): streaks falling around the camera, as heavy as the clock says.

import { B } from "./look.js";

export class RainFX {
  constructor(scene, { mobile = false } = {}) {
    const BB = B();
    this.scene = scene;
    const tex = new BB.DynamicTexture("rain-streak", { width: 8, height: 64 }, scene, false);
    const ctx = tex.getContext();
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(3, 0, 2, 64); tex.update(); tex.hasAlpha = true;
    const ps = new BB.ParticleSystem("rain", mobile ? 700 : 1500, scene);
    ps.particleTexture = tex;
    ps.emitter = new BB.Vector3(0, 12, 0);
    ps.minEmitBox = new BB.Vector3(-16, 0, -16); ps.maxEmitBox = new BB.Vector3(16, 2, 16);
    ps.color1 = new BB.Color4(0.75, 0.82, 0.95, 0.5); ps.color2 = new BB.Color4(0.65, 0.72, 0.85, 0.35); ps.colorDead = new BB.Color4(0.6, 0.7, 0.8, 0);
    ps.minSize = 0.04; ps.maxSize = 0.07; ps.minScaleY = 9; ps.maxScaleY = 14;
    ps.minLifeTime = 0.6; ps.maxLifeTime = 0.8;
    ps.direction1 = new BB.Vector3(-0.6, -18, -0.3); ps.direction2 = new BB.Vector3(0.6, -20, 0.3);
    ps.minEmitPower = 1; ps.maxEmitPower = 1.2;
    ps.billboardMode = BB.ParticleSystem.BILLBOARDMODE_STRETCHED;
    ps.blendMode = BB.ParticleSystem.BLENDMODE_STANDARD;
    ps.emitRate = 0;
    ps.start();
    this.ps = ps;
    this.rate = mobile ? 700 : 1500;
  }

  /** @param wet 0–1 rain amount; camPos where to rain around */
  update(wet, camPos) {
    this.ps.emitRate = wet > 0.05 ? wet * this.rate : 0;
    if (camPos) this.ps.emitter.set(camPos.x, camPos.y + 9, camPos.z);
  }

  stop() { this.ps.emitRate = 0; this.ps.reset(); }
}
