// Fixed-rate logic clock: combat runs at exactly 60 frames per second regardless of
// render rate, so a 30 fps phone and a 144 Hz monitor play identical frame data.

export const TICKS_PER_SECOND = 60;
export const SECONDS_PER_TICK = 1 / TICKS_PER_SECOND;

export class FrameClock {
  constructor() {
    this.frame = 0;
    this.accumulator = 0;
    /** Cap after a long hitch (tab switch, load) so we don't spiral. */
    this.maxTicksPerAdvance = 5;
  }

  /** Feed real elapsed seconds; returns how many logic ticks to run now. */
  advance(deltaSeconds) {
    if (deltaSeconds < 0) throw new RangeError("deltaSeconds");
    this.accumulator += deltaSeconds;
    let ticks = 0;
    while (this.accumulator + 1e-9 >= SECONDS_PER_TICK && ticks < this.maxTicksPerAdvance) {
      this.accumulator -= SECONDS_PER_TICK;
      this.frame++;
      ticks++;
    }
    if (ticks === this.maxTicksPerAdvance && this.accumulator > SECONDS_PER_TICK) this.accumulator = 0;
    if (this.accumulator < 0) this.accumulator = 0;
    return ticks;
  }

  /** 0..1 progress toward the next logic frame, for smooth rendering. */
  get alpha() {
    return this.accumulator / SECONDS_PER_TICK;
  }
}

/** Small seeded random generator (deterministic AI in tests and replays). */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
