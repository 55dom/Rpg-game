// The memory grade (Ep 49, BACKLASH.md §15.4 PP_MEMORY): the 3D view drained to ash grey with the reds kept, never the
// HUD (which is HTML over the canvas). A post-process on the one camera, made when first needed; `set(on)` fades it in
// or out over about a second and a half (the door drains the colour), or at once.

import { B } from "./look.js";

const SHADER = `
precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float amount;
void main(void) {
  vec4 c = texture2D(textureSampler, vUV);
  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  float red = clamp((c.r - max(c.g, c.b)) * 2.2, 0.0, 1.0);
  vec3 ash = vec3(l) * vec3(1.03, 0.99, 0.96);
  vec3 g = mix(ash, mix(ash, c.rgb, 0.8), red);
  g = (g - 0.5) * 1.06 + 0.5;
  gl_FragColor = vec4(mix(c.rgb, g * 0.97, amount), c.a);
}`;

export class MemoryGrade {
  constructor(scene, camera) { this.scene = scene; this.camera = camera; this.pp = null; this.amount = 0; this.target = 0; }

  set(on, instant = false) {
    this.target = on ? 1 : 0;
    if (instant) this.amount = this.target;
    if (on && !this.pp) {
      const BB = B();
      BB.Effect.ShadersStore.memoryGradeFragmentShader ??= SHADER;
      this.pp = new BB.PostProcess("memoryGrade", "memoryGrade", ["amount"], null, 1.0, this.camera);
      this.pp.onApply = (e) => e.setFloat("amount", this.amount);
    }
    if (!on && instant) this._drop();
  }

  update(dt) {
    if (!this.pp) return;
    this.amount += Math.sign(this.target - this.amount) * Math.min(Math.abs(this.target - this.amount), dt / 1.4);
    if (this.target === 0 && this.amount <= 0) this._drop();
  }

  _drop() { this.pp?.dispose(this.camera); this.pp = null; this.amount = 0; }
}
