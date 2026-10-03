// A bounded resource: HP, Mana, Posture, the Surge gauge.

export class ResourcePool {
  constructor(max, start = max) {
    if (max < 0) throw new RangeError("max");
    this.max = max;
    this.current = clamp(start, 0, max);
    /** @type {((oldValue:number, newValue:number) => void) | null} */
    this.onChange = null;
  }

  get isEmpty() { return this.current <= 0; }
  get isFull() { return this.current >= this.max; }
  get normalized() { return this.max <= 0 ? 0 : this.current / this.max; }

  canAfford(amount) { return amount <= this.current; }

  /** Spend only if there's enough; returns false and changes nothing otherwise. */
  trySpend(amount) {
    if (amount < 0) throw new RangeError("amount");
    if (amount > this.current) return false;
    this.set(this.current - amount);
    return true;
  }

  add(amount) { this.set(this.current + amount); }
  fill() { this.set(this.max); }

  set(value) {
    const old = this.current;
    this.current = clamp(value, 0, this.max);
    if (old !== this.current && this.onChange) this.onChange(old, this.current);
  }
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
