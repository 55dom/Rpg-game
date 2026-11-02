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

/** Utility scoring (GDD §21.5: "utility scoring for choosing *which* attack"): each attack ready and in reach scores its
 *  weight, scaled by how well it suits the moment: an unblockable one into a raised guard (and less for one the guard
 *  will stop), a quick one into an opening (the target recovering or reeling), not a slow one at someone in the air, not
 *  the same one twice running, and best where its reach fits the distance. The pick is weighted by the scores, so a fight
 *  still varies; with nothing to tell them apart, the weights alone decide, as before. */
export const UTILITY = Object.freeze({ guardBreak: 2.5, intoGuard: 0.7, punish: 2, quick: 14, slowVsAir: 0.6, slow: 20, repeat: 0.6, fit: 0.4 });

/** @param {AttackOption} o @param {{distance:number, target?:{guarding?:boolean, opening?:boolean, airborne?:boolean}|null}} p @param {AttackOption|null} last */
export function utilityOf(o, p, last = null) {
  let u = o.weight;
  const t = p.target, a = o.ability;
  if (t?.guarding) u *= a.hit?.unblockable ? UTILITY.guardBreak : UTILITY.intoGuard;
  if (t?.opening && a.startup <= UTILITY.quick) u *= UTILITY.punish;
  if (t?.airborne && a.startup > UTILITY.slow) u *= UTILITY.slowVsAir;
  if (o === last) u *= UTILITY.repeat;
  const half = (o.maxRange - o.minRange) / 2;
  if (half > 0 && Number.isFinite(half)) u *= 1 - UTILITY.fit / 2 + UTILITY.fit * Math.max(0, 1 - Math.abs(p.distance - (o.minRange + half)) / half);
  return u;
}

/** A weighted pick by utility, without allocating (the fight's hot path, §21.7). */
function pickByUtility(list, p, last, rng, scores) {
  let total = 0;
  for (let i = 0; i < list.length; i++) total += (scores[i] = utilityOf(list[i], p, last));
  let r = rng() * total;
  for (let i = 0; i < list.length; i++) if ((r -= scores[i]) < 0) return list[i];
  return list[list.length - 1];
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
    this.pace = null; // the difficulty's pacing (data/difficulty.js), set by the World: { recover, cooldown } multipliers
    this.state = BrainState.Idle;
    this.recoverLeft = 0;
    this._wasRunning = false;
    this.last = null; // the attack it chose last (utility: not the same one twice running)
    this._scores = [];
  }

  /**
   * @param {{frame:number, hasTarget:boolean, distance:number, isStaggered:boolean, isDead:boolean, abilityRunning:boolean,
   *          target?:{guarding:boolean, opening:boolean, airborne:boolean}|null}} p
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
      this.recoverLeft = Math.round(this.recoverFrames * (this.pace?.recover ?? 1));
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
      const pick = this.last = pickByUtility(ready, p, this.last, this.rng, this._scores);
      pick.readyFrame = p.frame + Math.round(pick.cooldownFrames * (this.pace?.cooldown ?? 1));
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
    if (ready.length) { // the same scoring as the enemies' (§21.5: "Companion AI uses the same framework with an 'ally' profile")
      const pick = this.last = pickByUtility(ready, t, this.last ?? null, this.rng, this._scores ??= []);
      pick.readyFrame = p.frame + Math.round(pick.cooldownFrames / r.attackRate);
      return out(AllyMove.Hold, pick.ability);
    }
    if (this.options.some((o) => o.inRange(t.distance))) return out(AllyMove.Hold);
    if (this.options.every((o) => t.distance < o.minRange)) return out(AllyMove.Retreat);
    return out(AllyMove.Approach);
  }
}
