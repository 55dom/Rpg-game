// The rules of a single hit: health, posture, block, parry, dodge, stagger.
// Pure logic: no rendering, no physics, so every rule is unit-tested.

import { ResourcePool } from "./stats.js";

/** @enum {number} */
export const Team = Object.freeze({ Player: 0, Enemy: 1, Neutral: 2 });

/** @enum {string} */
export const HitOutcome = Object.freeze({
  Ignored: "Ignored", Hit: "Hit", Blocked: "Blocked", Parried: "Parried",
  Dodged: "Dodged", PerfectDodge: "PerfectDodge",
});

/**
 * What one hit does.
 * @param {object} o
 * @param {number} [o.damage] @param {number} [o.posture] @param {number} [o.hitstop]
 * @param {number} [o.hitstun] @param {boolean} [o.unblockable] @param {number} [o.launch]
 * @param {number} [o.knockback] @param {number} [o.pull] drag the target up to this far toward the attacker
 */
export function hitSpec(o = {}) {
  const spec = Object.freeze({
    damage: o.damage ?? 0,
    posture: o.posture ?? 0,
    hitstop: o.hitstop ?? 4,
    hitstun: o.hitstun ?? 18,
    unblockable: !!o.unblockable,
    launch: o.launch ?? 0,
    knockback: o.knockback ?? 0,
    pull: o.pull ?? 0,
  });
  for (const k of ["damage", "posture", "hitstop", "hitstun", "launch", "knockback", "pull"]) {
    if (spec[k] < 0) throw new RangeError(`hit ${k} can't be negative`);
  }
  return spec;
}

export const isHitSet = (spec) => !!spec && (spec.damage > 0 || spec.posture > 0 || spec.launch > 0);

export const Rules = Object.freeze({
  DefaultParryFrames: 8,
  PerfectDodgeFrames: 6,
  PostureBreakStaggerFrames: 90,
  ParryHitstopFrames: 8,
  BlockChipFraction: 0.2,
  BlockPostureFraction: 0.75,
  ParryPostureMultiplier: 1.5,
  ParryPostureFlat: 20,
});

/** One fighter's combat state. Advance with tick() once per logic frame. */
export class Combatant {
  constructor(team, maxHealth, maxPosture) {
    if (maxHealth <= 0 || maxPosture <= 0) throw new RangeError("max values must be positive");
    this.team = team;
    this.health = new ResourcePool(maxHealth);
    this.posture = new ResourcePool(maxPosture);
    this.invulnerableFrames = 0;
    this.invulnerableElapsed = 0;
    this.parryFrames = 0;
    /** How early in a dodge's i-frames a dodged hit counts as perfect (touch assist widens it). */
    this.perfectDodgeFrames = Rules.PerfectDodgeFrames;
    this.blocking = false;
    this.superArmor = false;
    this.staggerFrames = 0;
    this.postureBroken = false;
    this.postureRegenDelayFrames = 90;
    this.postureRegenPerFrame = 0.5;
    this.framesSincePostureDamage = 0;
  }

  get isDead() { return this.health.isEmpty; }
  get isStaggered() { return this.staggerFrames > 0; }
  get canAct() { return !this.isDead && !this.isStaggered; }

  startInvulnerability(frames) {
    if (frames <= 0) return;
    this.invulnerableFrames = frames;
    this.invulnerableElapsed = 0;
  }

  startParry(frames = Rules.DefaultParryFrames) {
    if (frames > this.parryFrames) this.parryFrames = frames;
  }

  stagger(frames) {
    if (frames > this.staggerFrames) this.staggerFrames = frames;
  }

  tick() {
    if (this.invulnerableFrames > 0) { this.invulnerableFrames--; this.invulnerableElapsed++; }
    if (this.parryFrames > 0) this.parryFrames--;
    if (this.staggerFrames > 0) {
      this.staggerFrames--;
      if (this.staggerFrames === 0 && this.postureBroken) {
        this.postureBroken = false;
        this.posture.fill();
      }
    }
    this.framesSincePostureDamage++;
    if (this.framesSincePostureDamage > this.postureRegenDelayFrames && !this.postureBroken && !this.isDead) {
      this.posture.add(this.postureRegenPerFrame);
    }
  }

  takeDamage(amount) { this.health.add(-amount); }

  /** Returns true if this broke posture. */
  takePostureDamage(amount) {
    if (amount <= 0) return false;
    this.framesSincePostureDamage = 0;
    if (this.postureBroken) return false;
    this.posture.add(-amount);
    if (!this.posture.isEmpty) return false;
    this.postureBroken = true;
    this.stagger(Rules.PostureBreakStaggerFrames);
    return true;
  }

  reset() {
    this.health.fill(); this.posture.fill();
    this.invulnerableFrames = 0; this.invulnerableElapsed = 0; this.parryFrames = 0;
    this.staggerFrames = 0; this.postureBroken = false; this.blocking = false;
    this.framesSincePostureDamage = 0;
  }
}

/**
 * Resolve one hit. Order: dead/same team → dodge → parry → block → hit.
 * @returns {{outcome:string, healthDamage:number, defenderPostureBroken:boolean,
 *   attackerPostureBroken:boolean, killed:boolean, attackerHitstop:number, defenderHitstop:number, connected:boolean}}
 */
export function resolveHit(attacker, defender, spec) {
  const result = (outcome, extra = {}) => {
    const r = {
      outcome, healthDamage: 0, defenderPostureBroken: false, attackerPostureBroken: false,
      killed: false, attackerHitstop: 0, defenderHitstop: 0, ...extra,
    };
    r.connected = r.outcome === HitOutcome.Hit || r.outcome === HitOutcome.Blocked;
    return r;
  };

  if (!defender || defender.isDead) return result(HitOutcome.Ignored);
  if (attacker && attacker.team === defender.team && attacker.team !== Team.Neutral) return result(HitOutcome.Ignored);

  if (defender.invulnerableFrames > 0) {
    const perfect = defender.invulnerableElapsed < defender.perfectDodgeFrames;
    return result(perfect ? HitOutcome.PerfectDodge : HitOutcome.Dodged);
  }

  if (!spec.unblockable && defender.parryFrames > 0) {
    const broke = !!attacker && attacker.takePostureDamage(spec.posture * Rules.ParryPostureMultiplier + Rules.ParryPostureFlat);
    return result(HitOutcome.Parried, {
      attackerPostureBroken: broke, attackerHitstop: Rules.ParryHitstopFrames, defenderHitstop: Rules.ParryHitstopFrames,
    });
  }

  if (!spec.unblockable && defender.blocking) {
    const chip = spec.damage * Rules.BlockChipFraction;
    defender.takeDamage(chip);
    const guardBroken = defender.takePostureDamage(spec.posture * Rules.BlockPostureFraction);
    if (guardBroken) defender.blocking = false;
    const stop = Math.floor(spec.hitstop / 2);
    return result(HitOutcome.Blocked, {
      healthDamage: chip, defenderPostureBroken: guardBroken, killed: defender.isDead,
      attackerHitstop: stop, defenderHitstop: stop,
    });
  }

  defender.takeDamage(spec.damage);
  const broken = defender.takePostureDamage(spec.posture);
  if (!defender.superArmor || broken) defender.stagger(spec.hitstun);
  return result(HitOutcome.Hit, {
    healthDamage: spec.damage, defenderPostureBroken: broken, killed: defender.isDead,
    attackerHitstop: spec.hitstop, defenderHitstop: spec.hitstop,
  });
}
