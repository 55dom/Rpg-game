// Every sound is synthesized with WebAudio: zero asset downloads, nothing to license.
// Phase 3 replaces these with recorded foley and the score.

export class Sfx {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7;
  }

  /** Browsers only allow audio after a user gesture. */
  unlock() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 6;
    this.master.connect(comp).connect(ctx.destination);
    const len = ctx.sampleRate;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setEnabled(on) { this.enabled = on; if (this.master) this.master.gain.value = on ? this.volume : 0; }

  _noise(t, dur, { type = "bandpass", f0 = 1000, f1 = f0, q = 1, gain = 0.3, attack = 0.005 } = {}) {
    const c = this.ctx;
    const src = c.createBufferSource(); src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  _tone(t, dur, { type = "sine", f0 = 440, f1 = f0, gain = 0.3, attack = 0.004 } = {}) {
    const c = this.ctx;
    const o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  play(name, power = 1) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + 0.001;
    const p = power;
    switch (name) {
      case "swing": this._noise(t, 0.13, { f0: 2600, f1: 700, q: 1.4, gain: 0.16 * p }); break;
      case "swingHeavy": this._noise(t, 0.22, { f0: 1800, f1: 300, q: 1.2, gain: 0.24 * p }); break;
      case "jump": this._noise(t, 0.12, { f0: 500, f1: 1400, q: 0.8, gain: 0.08 }); break;
      case "dodge": this._noise(t, 0.18, { f0: 900, f1: 2600, q: 0.9, gain: 0.12 }); break;
      case "land": this._tone(t, 0.08, { f0: 140, f1: 60, gain: 0.12 }); break;
      case "hit":
        this._noise(t, 0.09, { type: "lowpass", f0: 3200, f1: 500, gain: 0.32 * p });
        this._tone(t, 0.12, { f0: 170, f1: 55, gain: 0.35 * p });
        break;
      case "hitHeavy":
        this._noise(t, 0.2, { type: "lowpass", f0: 4000, f1: 300, gain: 0.45 });
        this._tone(t, 0.28, { f0: 130, f1: 38, gain: 0.55 });
        this._tone(t, 0.05, { type: "square", f0: 900, f1: 300, gain: 0.08 });
        break;
      case "block":
        this._tone(t, 0.16, { type: "triangle", f0: 1250, gain: 0.14 });
        this._tone(t, 0.12, { type: "triangle", f0: 1720, gain: 0.1 });
        this._noise(t, 0.05, { type: "highpass", f0: 3000, gain: 0.2 });
        break;
      case "parry":
        for (const [f, g] of [[1760, 0.18], [2640, 0.12], [3520, 0.07]]) this._tone(t, 0.7, { f0: f, gain: g });
        this._noise(t, 0.06, { type: "highpass", f0: 4000, gain: 0.3 });
        break;
      case "afterimage":
        this._noise(t, 0.5, { f0: 3000, f1: 300, q: 2, gain: 0.25, attack: 0.08 });
        this._tone(t + 0.02, 0.6, { f0: 880, f1: 1320, gain: 0.12 });
        this._tone(t + 0.1, 0.6, { f0: 1320, f1: 1760, gain: 0.08 });
        break;
      case "perfectDodge": this._tone(t, 0.25, { f0: 1500, f1: 2200, gain: 0.08 }); break;
      case "postureBreak":
        this._noise(t, 0.3, { type: "highpass", f0: 2500, f1: 800, gain: 0.35 });
        this._tone(t, 0.45, { f0: 90, f1: 35, gain: 0.5 });
        this._tone(t, 0.4, { type: "sawtooth", f0: 220, f1: 110, gain: 0.08 });
        break;
      case "charge": this._tone(t, 0.26, { type: "sawtooth", f0: 180, f1: 900, gain: 0.07, attack: 0.15 }); break;
      case "finisher":
        this._tone(t, 0.9, { f0: 80, f1: 28, gain: 0.7 });
        this._noise(t, 0.6, { type: "lowpass", f0: 5000, f1: 200, gain: 0.5 });
        for (const [f, g] of [[523, 0.12], [784, 0.1], [1046, 0.08]]) this._tone(t + 0.04, 1.2, { f0: f, gain: g });
        break;
      case "ultActivate":
        this._noise(t, 0.9, { f0: 200, f1: 4000, q: 2, gain: 0.25, attack: 0.5 });
        for (const [f, g] of [[220, 0.1], [330, 0.08], [440, 0.07], [660, 0.05]]) this._tone(t, 1.4, { type: "triangle", f0: f, f1: f * 1.5, gain: g, attack: 0.3 });
        break;
      case "detonate":
        this._tone(t, 0.5, { f0: 140, f1: 40, gain: 0.5 });
        this._noise(t, 0.35, { type: "lowpass", f0: 6000, f1: 300, gain: 0.45 });
        this._tone(t, 0.3, { type: "square", f0: 1400, f1: 700, gain: 0.06 });
        break;
      case "bossIntro":
        this._tone(t, 1.6, { f0: 55, f1: 41, gain: 0.5, attack: 0.3 });
        this._noise(t, 1.2, { type: "lowpass", f0: 400, f1: 120, gain: 0.3, attack: 0.4 });
        this._tone(t + 0.3, 1.2, { type: "sawtooth", f0: 110, f1: 82, gain: 0.06, attack: 0.3 });
        break;
      case "mud": this._noise(t, 0.45, { type: "lowpass", f0: 700, f1: 120, gain: 0.35, attack: 0.02 }); this._tone(t, 0.3, { f0: 80, f1: 50, gain: 0.25 }); break;
      case "assist": this._noise(t, 0.25, { f0: 400, f1: 2400, q: 1.5, gain: 0.18 }); this._tone(t, 0.3, { type: "triangle", f0: 660, f1: 990, gain: 0.08 }); break;
      case "heal": for (const [i, f] of [784, 988, 1175].entries()) this._tone(t + i * 0.07, 0.4, { f0: f, gain: 0.07 }); break;
      case "shield": this._tone(t, 0.5, { type: "triangle", f0: 180, f1: 140, gain: 0.2 }); this._noise(t, 0.3, { type: "lowpass", f0: 900, f1: 200, gain: 0.25 }); break;
      case "stone": this._tone(t, 0.35, { f0: 90, f1: 40, gain: 0.45 }); this._noise(t, 0.3, { type: "lowpass", f0: 1800, f1: 200, gain: 0.35 }); break;
      case "surgeFull": for (const [i, f] of [523, 659, 784, 1046].entries()) this._tone(t + i * 0.06, 0.5, { type: "triangle", f0: f, gain: 0.08 }); break;
      case "vacuum":
        this._noise(t, 0.45, { f0: 3500, f1: 400, q: 4, gain: 0.22, attack: 0.3 });
        this._tone(t, 0.45, { type: "sawtooth", f0: 900, f1: 120, gain: 0.05, attack: 0.25 });
        break;
      case "gale": this._noise(t, 0.35, { f0: 600, f1: 3500, q: 3, gain: 0.25, attack: 0.04 }); break;
      case "glint": this._tone(t, 0.12, { f0: 2400, gain: 0.12 }); this._tone(t + 0.1, 0.18, { f0: 3200, gain: 0.1 }); break;
      case "slam": this._tone(t, 0.4, { f0: 110, f1: 30, gain: 0.6 }); this._noise(t, 0.3, { type: "lowpass", f0: 1500, f1: 200, gain: 0.4 }); break;
      case "kill": this._tone(t, 0.6, { f0: 330, f1: 165, gain: 0.08 }); break;
      case "wave": for (const [i, f] of [392, 523, 659].entries()) this._tone(t + i * 0.09, 0.4, { type: "triangle", f0: f, gain: 0.1 }); break;
      case "ui": this._tone(t, 0.05, { f0: 1200, gain: 0.05 }); break;
      default: break;
    }
  }
}
