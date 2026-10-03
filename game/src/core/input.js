// Device-independent button intents and the input buffer.
// Gamepad, keyboard, and touch all produce the same intents, so gameplay never knows the device.

/** @enum {number} */
export const Intent = Object.freeze({
  None: 0, Light: 1, Heavy: 2, Jump: 3, Dodge: 4, Block: 5,
  Spell1: 6, Spell2: 7, Spell3: 8, Spell4: 9, Ultimate: 10,
});

export const IntentName = Object.freeze(Object.keys(Intent));

/** Bit for one intent. */
export const bit = (intent) => (intent ? 1 << intent : 0);

/** Combine intents into a mask: mask(Intent.Light, Intent.Dodge). */
export const mask = (...intents) => intents.reduce((m, i) => m | bit(i), 0);

export const Mask = Object.freeze({
  None: 0,
  AnySpell: mask(Intent.Spell1, Intent.Spell2, Intent.Spell3, Intent.Spell4),
  All: mask(Intent.Light, Intent.Heavy, Intent.Jump, Intent.Dodge, Intent.Block,
    Intent.Spell1, Intent.Spell2, Intent.Spell3, Intent.Spell4, Intent.Ultimate),
});

export const maskHas = (m, intent) => intent !== Intent.None && (m & bit(intent)) !== 0;

export function maskNames(m) {
  const out = [];
  for (let i = 1; i < IntentName.length; i++) if (m & (1 << i)) out.push(IntentName[i]);
  return out;
}

/** Parse "Light|Dodge|AnySpell" style strings used in data files. */
export function parseMask(text) {
  if (!text) return 0;
  return text.split("|").map((s) => s.trim()).filter(Boolean).reduce((m, name) => {
    if (name === "AnySpell") return m | Mask.AnySpell;
    if (name === "All") return m | Mask.All;
    if (!(name in Intent)) throw new Error(`Unknown input "${name}"`);
    return m | bit(Intent[name]);
  }, 0);
}

/**
 * Remembers recent presses for a short window so a slightly early press still counts.
 * Fixed-size ring: no allocations after construction.
 */
export class InputBuffer {
  static DefaultWindowFrames = 10;

  constructor(capacity = 8, windowFrames = InputBuffer.DefaultWindowFrames) {
    if (capacity <= 0) throw new RangeError("capacity");
    this.entries = Array.from({ length: capacity }, () => ({ intent: 0, frame: 0, live: false }));
    this.next = 0;
    this.windowFrames = windowFrames;
  }

  push(intent, frame) {
    if (!intent) return;
    const e = this.entries[this.next];
    e.intent = intent; e.frame = frame; e.live = true;
    this.next = (this.next + 1) % this.entries.length;
  }

  /** Remove and return the oldest valid press allowed by the mask, or 0. */
  consume(allowed, currentFrame) {
    let best = -1;
    let bestFrame = Infinity;
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i];
      if (!e.live) continue;
      if (currentFrame - e.frame > this.windowFrames) { e.live = false; continue; }
      if (maskHas(allowed, e.intent) && e.frame < bestFrame) { best = i; bestFrame = e.frame; }
    }
    if (best < 0) return 0;
    this.entries[best].live = false;
    return this.entries[best].intent;
  }

  /** Still-valid presses, oldest first (debug display). */
  live(currentFrame) {
    return this.entries
      .filter((e) => e.live && currentFrame - e.frame <= this.windowFrames)
      .sort((a, b) => a.frame - b.frame)
      .map((e) => e.intent);
  }

  /** Push stored presses forward in time (called once per hitstop frame). */
  delay(frames) {
    for (const e of this.entries) if (e.live) e.frame += frames;
  }

  clear() {
    for (const e of this.entries) e.live = false;
  }
}
