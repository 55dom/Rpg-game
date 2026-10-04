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

/** @enum {string} */
export const Stance = Object.freeze({ Press: "Press", Guard: "Guard", Support: "Support" });
export const STANCES = Object.freeze([Stance.Press, Stance.Guard, Stance.Support]);

/** @enum {string} */
export const AllyMove = Object.freeze({ Hold: "Hold", Follow: "Follow", Approach: "Approach", Retreat: "Retreat" });

/** How far from the leader each stance will engage, and how close it stays. */
const STANCE_RULES = Object.freeze({
  [Stance.Press]: { engage: 14, follow: 3.5, attackRate: 1, healBelow: 0.35, shieldWhenThreatened: false },
  [Stance.Guard]: { engage: 5.5, follow: 2.5, attackRate: 1, healBelow: 0.5, shieldWhenThreatened: true },
  [Stance.Support]: { engage: 9, follow: 5, attackRate: 0.5, healBelow: 0.75, shieldWhenThreatened: true },
});

/**
 * An AI party member (GDD §10). Stances change how far it roams from the leader, how often it
 * attacks, and when it spends its support moves. Signature Assists are called by the player, not here.
 */
export class CompanionBrain {
  /**
   * @param {string} id @param {AttackOption[]} options
   * @param {{ability:object, kind:"heal"|"shield", cooldownFrames:number}[]} supports
   * @param {() => number} rng
   */
  constructor(id, options, supports = [], rng = Math.random) {
    if (!options.length) throw new Error("companion needs at least one attack");
    this.id = id;
    this.options = options;
    this.supports = supports.map((s) => ({ ...s, readyFrame: 0 }));
    this.rng = rng;
    this.stance = Stance.Press;
    this.recoverFrames = 18;
    this.recoverLeft = 0;
    this.wasRunning = false;
  }

  get rules() { return STANCE_RULES[this.stance]; }

  /**
   * @param {{frame:number, isDead:boolean, isStaggered:boolean, abilityRunning:boolean,
   *   leaderDistance:number, leaderHealth:number, leaderThreatened:boolean,
   *   target: null | {distance:number, distanceToLeader:number}}} p
   * @returns {{move:string, attack:object|null, support:string|null}}
   */
  think(p) {
    const out = (move, attack = null, support = null) => ({ move, attack, support });
    if (p.isDead || p.isStaggered) { this.recoverLeft = 0; return out(AllyMove.Hold); }
    if (p.abilityRunning) { this.wasRunning = true; return out(AllyMove.Hold); }
    if (this.wasRunning) { this.wasRunning = false; this.recoverLeft = Math.round(this.recoverFrames / this.rules.attackRate); }
    if (this.recoverLeft > 0) { this.recoverLeft--; return out(p.leaderDistance > this.rules.follow * 2 ? AllyMove.Follow : AllyMove.Hold); }

    // Support first: the leader's safety beats damage.
    const r = this.rules;
    for (const s of this.supports) {
      if (p.frame < s.readyFrame || p.leaderDistance > 9) continue;
      const want = (s.kind === "heal" && p.leaderHealth < r.healBelow) || (s.kind === "shield" && r.shieldWhenThreatened && p.leaderThreatened);
      if (want) { s.readyFrame = p.frame + s.cooldownFrames; return out(AllyMove.Hold, s.ability, s.kind); }
    }

    const t = p.target;
    if (!t || t.distanceToLeader > r.engage) {
      return out(p.leaderDistance > r.follow ? AllyMove.Follow : AllyMove.Hold);
    }
    const ready = this.options.filter((o) => o.isReady(p.frame) && o.inRange(t.distance));
    if (ready.length) {
      const total = ready.reduce((s, o) => s + o.weight, 0);
      let x = this.rng() * total, pick = ready[ready.length - 1];
      for (const o of ready) { if ((x -= o.weight) < 0) { pick = o; break; } }
      pick.readyFrame = p.frame + Math.round(pick.cooldownFrames / r.attackRate);
      return out(AllyMove.Hold, pick.ability);
    }
    if (this.options.some((o) => o.inRange(t.distance))) return out(AllyMove.Hold);
    if (this.options.every((o) => t.distance < o.minRange)) return out(AllyMove.Retreat);
    return out(AllyMove.Approach);
  }
}
