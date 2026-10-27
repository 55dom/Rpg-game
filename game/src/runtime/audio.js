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
      // Story sounds (Phase 3).
      case "cry": // a thin, wavering infant's cry in the distance
        for (const [i, d] of [[0, 0.55], [0.75, 0.7], [1.6, 0.9]]) {
          this._tone(t + i, d, { type: "sawtooth", f0: 560, f1: 760, gain: 0.025, attack: 0.08 });
          this._tone(t + i + 0.02, d, { type: "sine", f0: 1100, f1: 1450, gain: 0.02, attack: 0.08 });
        }
        break;
      case "hymn": // the Choir: a slow minor chord, voices swelling in
        for (const [i, f] of [220, 261.6, 329.6, 440, 523.2].entries()) {
          this._tone(t + i * 0.12, 3.2, { type: "triangle", f0: f, f1: f * 0.995, gain: 0.05, attack: 1.1 });
          this._tone(t + i * 0.12, 3.2, { type: "sine", f0: f * 1.006, gain: 0.03, attack: 1.2 });
        }
        break;
      case "laugh": for (let i = 0; i < 9; i++) this._noise(t + i * 0.09 + Math.random() * 0.05, 0.12, { f0: 700 + Math.random() * 900, q: 4, gain: 0.05 }); break;
      case "fire": this._noise(t, 2.5, { type: "lowpass", f0: 900, f1: 300, q: 0.7, gain: 0.12, attack: 0.6 }); break;
      case "bookDescend":
        for (const [i, f] of [784, 988, 1175, 1568].entries()) this._tone(t + i * 0.15, 1.2, { type: "sine", f0: f, gain: 0.05, attack: 0.05 });
        this._noise(t, 1.2, { f0: 3000, f1: 6000, q: 2, gain: 0.04, attack: 0.3 });
        break;
      case "whistle": // a simple four-note tune, whistled
        for (const [i, f] of [659, 784, 880, 587].entries()) {
          const t0 = t + i * 0.42;
          this._tone(t0, 0.36, { type: "sine", f0: f * 0.97, f1: f, gain: 0.06, attack: 0.04 });
          this._noise(t0, 0.3, { f0: f * 2, q: 12, gain: 0.012, attack: 0.04 });
        }
        break;
      case "guardWhistle": // the Watch: a shrill trilled blast, twice (not a tune: that's someone else's)
        for (const t0 of [t, t + 0.55]) {
          this._tone(t0, 0.42, { type: "square", f0: 2650, f1: 2550, gain: 0.035, attack: 0.01 });
          for (let k = 0; k < 8; k++) this._tone(t0 + k * 0.05, 0.03, { type: "sine", f0: 2900, gain: 0.03, attack: 0.005 });
        }
        break;
      case "door": // a door frame of light opening
        this._tone(t, 1.4, { type: "triangle", f0: 220, f1: 440, gain: 0.06, attack: 0.3 });
        for (const [i, f] of [440, 554, 659].entries()) this._tone(t + 0.3 + i * 0.12, 1.2, { type: "sine", f0: f, gain: 0.04, attack: 0.1 });
        break;
      case "surgeFull": for (const [i, f] of [523, 659, 784, 1046].entries()) this._tone(t + i * 0.06, 0.5, { type: "triangle", f0: f, gain: 0.08 }); break;
      case "vacuum":
        this._noise(t, 0.45, { f0: 3500, f1: 400, q: 4, gain: 0.22, attack: 0.3 });
        this._tone(t, 0.45, { type: "sawtooth", f0: 900, f1: 120, gain: 0.05, attack: 0.25 });
        break;
      case "gale": this._noise(t, 0.35, { f0: 600, f1: 3500, q: 3, gain: 0.25, attack: 0.04 }); break;
      case "rift": // a pale seam opening in the air: thin, glassy, a tearing sweep
        this._noise(t, 0.34, { f0: 700, f1: 5200, q: 6, gain: 0.16 * p, attack: 0.03 });
        this._tone(t + 0.02, 0.5, { type: "sine", f0: 1900, f1: 950, gain: 0.035 * p, attack: 0.04 });
        break;
      case "tear": // a black tear: something heavy giving way, then a cold ring
        this._noise(t, 0.9, { type: "lowpass", f0: 3200, f1: 90, q: 2, gain: 0.34 * p, attack: 0.02 });
        this._tone(t, 1.1, { type: "triangle", f0: 96, f1: 38, gain: 0.22 * p, attack: 0.02 });
        this._tone(t + 0.15, 1.4, { type: "sine", f0: 2600, f1: 2400, gain: 0.025 * p, attack: 0.3 });
        break;
      case "glint": this._tone(t, 0.12, { f0: 2400, gain: 0.12 }); this._tone(t + 0.1, 0.18, { f0: 3200, gain: 0.1 }); break;
      case "drums": // far off and under the floor: a slow march, four beats, the last one heaviest
        for (let k = 0; k < 4; k++) {
          this._tone(t + k * 0.62, 0.38, { f0: 74, f1: 44, gain: (k === 3 ? 0.3 : 0.2) * p, attack: 0.01 });
          this._noise(t + k * 0.62, 0.16, { type: "lowpass", f0: 420, f1: 120, gain: 0.08 * p });
        }
        break;
      case "warHorn": // from the other side of the Gate: one long low call, and a second under it
        this._tone(t, 2.4, { type: "sawtooth", f0: 98, f1: 92, gain: 0.07 * p, attack: 0.3 });
        this._tone(t + 0.1, 2.3, { type: "sawtooth", f0: 65, f1: 61, gain: 0.06 * p, attack: 0.4 });
        this._noise(t, 2.2, { type: "lowpass", f0: 300, f1: 180, gain: 0.05 * p, attack: 0.5 });
        break;
      case "wind": this._noise(t, 3.2, { type: "bandpass", f0: 500, f1: 900, q: 0.6, gain: 0.06 * p, attack: 1.0 }); break;
      case "clash": // ink against black light: a bright crack with a ring under it
        this._noise(t, 0.25, { f0: 2400, f1: 900, q: 1.2, gain: 0.16 * p });
        this._tone(t, 0.6, { type: "triangle", f0: 1320, f1: 1280, gain: 0.06 * p, attack: 0.005 });
        break;
      case "tuneMarch": // the Lighthouse Tune, all four notes, at last: low and steady, like a march
        for (const [i, f] of [330, 392, 440, 294].entries()) {
          const t0 = t + i * 0.7;
          this._tone(t0, 0.62, { type: "triangle", f0: f, gain: 0.08 * p, attack: 0.03 });
          this._tone(t0, 0.62, { type: "sine", f0: f / 2, gain: 0.06 * p, attack: 0.03 });
          this._tone(t0, 0.2, { f0: 70, f1: 46, gain: 0.12 * p, attack: 0.01 }); // the drum under each note
        }
        break;
      case "hum": // the door under the Lowmarket: two low notes that won't quite agree
        this._tone(t, 2.6, { type: "sine", f0: 55, gain: 0.16 * p, attack: 0.6 });
        this._tone(t, 2.6, { type: "sine", f0: 57.5, gain: 0.12 * p, attack: 0.6 });
        this._tone(t + 0.4, 2.0, { type: "triangle", f0: 220, gain: 0.025 * p, attack: 0.5 });
        break;
      case "reform": // empty armor dragging itself back together
        for (let k = 0; k < 5; k++) this._noise(t + k * 0.09, 0.08, { type: "bandpass", f0: 2200 - k * 200, f1: 900, q: 3, gain: 0.12 });
        this._tone(t + 0.45, 0.5, { type: "triangle", f0: 180, f1: 240, gain: 0.08 });
        break;
      case "slam": this._tone(t, 0.4, { f0: 110, f1: 30, gain: 0.6 }); this._noise(t, 0.3, { type: "lowpass", f0: 1500, f1: 200, gain: 0.4 }); break;
      case "kill": this._tone(t, 0.6, { f0: 330, f1: 165, gain: 0.08 }); break;
      case "wave": for (const [i, f] of [392, 523, 659].entries()) this._tone(t + i * 0.09, 0.4, { type: "triangle", f0: f, gain: 0.1 }); break;
      case "ui": this._tone(t, 0.05, { f0: 1200, gain: 0.05 }); break;
      default: break;
    }
  }

  /**
   * A voice heard through a mask (GDD §15.10 MaskIntegrity): a few murmured syllables, pitched down and ringing
   * in a small hard space. `integrity` 1 is fully processed; lower, and less of the mask is left in it.
   */
  maskVoice(integrity = 1, syllables = 3) {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, k = Math.max(0, Math.min(1, integrity)), t0 = c.currentTime + 0.02;
    const pitch = 1 - 0.3 * k;                 // how far down it's pushed
    const out = c.createGain(); out.gain.value = 0.5;
    // The mask itself: a resonant band, and a short comb (a few centimetres of hard shell) that rings.
    const ring = c.createBiquadFilter(); ring.type = "peaking"; ring.frequency.value = 850; ring.Q.value = 1 + 9 * k; ring.gain.value = 4 + 10 * k;
    const delay = c.createDelay(0.05); delay.delayTime.value = 0.0045 + 0.004 * k;
    const fb = c.createGain(); fb.gain.value = 0.15 + 0.6 * k;
    const dry = c.createGain(); dry.gain.value = 1 - 0.4 * k;
    ring.connect(dry).connect(out);
    ring.connect(delay); delay.connect(fb).connect(delay); delay.connect(out);
    out.connect(this.master);
    let t = t0;
    for (let i = 0; i < syllables; i++) {
      const dur = 0.11 + Math.random() * 0.1, f = (118 + Math.random() * 18) * pitch;
      const o = c.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(f * 1.04, t); o.frequency.linearRampToValueAtTime(f * (i === syllables - 1 ? 0.86 : 0.97), t + dur);
      const formant = c.createBiquadFilter(); formant.type = "bandpass"; formant.frequency.value = (520 + Math.random() * 380) * (0.85 + 0.15 * pitch); formant.Q.value = 3;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.025); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(formant).connect(g).connect(ring);
      o.start(t); o.stop(t + dur + 0.05);
      t += dur + 0.04 + Math.random() * 0.05;
    }
    setTimeout(() => { try { out.disconnect(); } catch { /* already gone */ } }, (t - t0 + 0.8) * 1000);
  }
}
