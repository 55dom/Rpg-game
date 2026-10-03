// Enemy decision making. Only a few enemies may attack at once (attack tokens),
// so crowds feel fair and readable, like an anime fight, not a mob pile.

/** Shared permission slips to attack the player. */
export class AttackTokenPool {
  constructor(capacity = 2) {
    if (capacity < 1) throw new RangeError("capacity");
    this.capacity = capacity;
    this.maxHoldFrames = 180;
    this.holders = new Map(); // id → frame acquired
  }

  get inUse() { return this.holders.size; }
  holds(id) { return this.holders.has(id); }

  tryAcquire(id, frame) {
    this.expire(frame);
    if (this.holders.has(id)) return true;
    if (this.holders.size >= this.capacity) return false;
    this.holders.set(id, frame);
    return true;
  }

  release(id) { this.holders.delete(id); }

  /** Take back tokens someone held too long (a stuck enemy can't hog them). */
  expire(frame) {
    for (const [id, at] of this.holders) if (frame - at > this.maxHoldFrames) this.holders.delete(id);
  }
}

/** One attack an enemy may choose. */
export class AttackOption {
  constructor(ability, minRange, maxRange, weight = 1, cooldownFrames = 0) {
    if (minRange < 0 || maxRange < minRange) throw new RangeError("range");
    if (weight <= 0) throw new RangeError("weight");
    this.ability = ability;
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.weight = weight;
    this.cooldownFrames = cooldownFrames;
    this.readyFrame = 0;
  }
  inRange(d) { return d >= this.minRange && d <= this.maxRange; }
  isReady(frame) { return frame >= this.readyFrame; }
}

/** @enum {string} */
export const BrainState = Object.freeze({
  Idle: "Idle", Approach: "Approach", Circle: "Circle", Attacking: "Attacking",
  Recover: "Recover", Staggered: "Staggered", Dead: "Dead",
});

/** @enum {string} */
export const MoveIntent = Object.freeze({ Hold: "Hold", Approach: "Approach", Circle: "Circle", Retreat: "Retreat" });

/** A small state machine: approach, wait for a token, attack, recover. */
export class EnemyBrain {
  /**
   * @param {string} id @param {AttackTokenPool} pool @param {AttackOption[]} options
   * @param {() => number} rng
   */
  constructor(id, pool, options, rng = Math.random) {
    if (!options.length) throw new Error("enemy needs at least one attack");
    this.id = id;
    this.pool = pool;
    this.options = options;
    this.rng = rng;
    this.aggroRange = 14;
    this.recoverFrames = 24;
    this.state = BrainState.Idle;
    this.recoverLeft = 0;
    this._wasRunning = false;
  }

  /**
   * @param {{frame:number, hasTarget:boolean, distance:number, isStaggered:boolean, isDead:boolean, abilityRunning:boolean}} p
   * @returns {{move:string, attack:object|null}}
   */
  think(p) {
    const out = (move, attack = null) => ({ move, attack });

    if (p.isDead) { this.pool.release(this.id); this.state = BrainState.Dead; return out(MoveIntent.Hold); }
    if (p.isStaggered) {
      this.pool.release(this.id);
      this.state = BrainState.Staggered;
      return out(MoveIntent.Hold);
    }
    if (this.state === BrainState.Staggered) this.state = BrainState.Idle;

    if (this.state === BrainState.Attacking) {
      if (p.abilityRunning) { this._wasRunning = true; return out(MoveIntent.Hold); }
      this.state = BrainState.Recover;
      this.recoverLeft = this.recoverFrames;
    }
    if (this.state === BrainState.Recover) {
      if (this.recoverLeft-- > 0) return out(MoveIntent.Hold);
      this.pool.release(this.id);
      this.state = BrainState.Idle;
    }

    if (!p.hasTarget || p.distance > this.aggroRange) { this.state = BrainState.Idle; return out(MoveIntent.Hold); }

    const ready = this.options.filter((o) => o.isReady(p.frame) && o.inRange(p.distance));
    if (ready.length) {
      if (!this.pool.tryAcquire(this.id, p.frame)) { this.state = BrainState.Circle; return out(MoveIntent.Circle); }
      const pick = this._weighted(ready);
      pick.readyFrame = p.frame + pick.cooldownFrames;
      this.state = BrainState.Attacking;
      return out(MoveIntent.Hold, pick.ability);
    }

    if (this.options.some((o) => o.inRange(p.distance))) { this.state = BrainState.Circle; return out(MoveIntent.Circle); }
    if (this.options.every((o) => p.distance < o.minRange)) { this.state = BrainState.Approach; return out(MoveIntent.Retreat); }
    this.state = BrainState.Approach;
    return out(MoveIntent.Approach);
  }

  /** The chosen attack couldn't start (e.g. got hit first). */
  attackFailed() {
    if (this.state !== BrainState.Attacking) return;
    this.pool.release(this.id);
    this.state = BrainState.Idle;
  }

  _weighted(list) {
    const total = list.reduce((s, o) => s + o.weight, 0);
    let r = this.rng() * total;
    for (const o of list) { if ((r -= o.weight) < 0) return o; }
    return list[list.length - 1];
  }
}
