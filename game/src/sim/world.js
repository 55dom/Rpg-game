// The fight, with no rendering: fighters, movement, hitboxes, and the Step 3 rules
// (parry → counter, perfect dodge → Afterimage, posture break → Lantern Break).
// The Babylon layer only reads this state and the events it emits.

import { Intent, InputBuffer, mask } from "../core/input.js";
import { ResourcePool } from "../core/stats.js";
import { Combatant, Team, HitOutcome, resolveHit } from "../core/combat.js";
import { AbilityRunner, AbilityController, EventType, MoveContext, StartResult } from "../core/abilities.js";
import { AttackTokenPool, EnemyBrain, MoveIntent } from "../core/ai.js";
import { seededRandom, SECONDS_PER_TICK } from "../core/timing.js";
import { boxHitsCapsule, hitboxCenter } from "./overlap.js";
import { ROOK_STATS, ROOK_ABILITIES, ROOK_HITBOXES, buildRookGraph } from "../data/rook.js";
import { ACOLYTE_STATS, ACOLYTE_HITBOXES, acolyteOptions } from "../data/acolyte.js";

export const Tuning = Object.freeze({
  gravity: 32, juggleGravity: 18, airAttackGravity: 9,
  arenaRadius: 17,
  knockbackSpeed: 4, knockbackDecay: 0.82,
  afterimageScale: 0.35, afterimageFrames: 36,
  softLockRange: 6.5, finisherRange: 3.8,
  corpseFrames: 100,
  nearMissGrace: 1.2, // while i-frames are up, a near miss counts as dodged (it can never deal damage)
});

const AIR = new Set(["AirL1", "AirL2", "AirL3"]);
const v3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
const angleTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const turn = (yaw, target, rate) => { const d = wrap(target - yaw); return yaw + Math.max(-rate, Math.min(rate, d)); };
export const flatDistance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class Fighter {
  constructor(world, o) {
    this.world = world;
    this.id = o.id;
    this.kind = o.kind;
    this.team = o.team;
    this.stats = o.stats;
    this.hitboxDefs = o.hitboxes;
    this.combatant = new Combatant(o.team, o.stats.maxHealth, o.stats.maxPosture);
    this.mana = o.stats.maxMana ? new ResourcePool(o.stats.maxMana) : null;
    this.buffer = new InputBuffer();
    this.runner = new AbilityRunner({
      started: (a) => this._started(a),
      event: (a, e) => this._event(a, e),
      finished: (a) => this._ended(a, "finished"),
      cancelled: (a) => this._ended(a, "cancelled"),
      interrupted: (a) => this._ended(a, "interrupted"),
    });
    this.controller = new AbilityController(this.runner, this.buffer, this.mana, o.graph);
    this.brain = o.brain ?? null;

    this.pos = v3(o.x, 0, o.z); this.prev = v3(o.x, 0, o.z);
    this.vel = v3(); this.knock = v3();
    this.yaw = o.yaw ?? 0; this.prevYaw = this.yaw;
    this.grounded = true;
    this.dash = { x: 0, z: 0, frames: 0 };
    this.moveInput = { x: 0, z: 0 };
    this.hitboxes = [];
    this.hitstop = 0;
    this.frozen = false;
    this.timeScale = 1; this.timeAcc = 0; this.ticking = true;
    this.slamming = false;
    this.holdBlock = false;
    this.afterDashFrames = 0;
    this.counterFrames = 0;
    this.deadFrames = 0;
    this.circleSign = o.circleSign ?? 1;
    this.target = null;
  }

  get alive() { return !this.combatant.isDead; }
  get forward() { return { x: Math.sin(this.yaw), z: Math.cos(this.yaw) }; }
  get current() { return this.runner.current; }

  /** Pick who an attack is aimed at: closest to the stick direction, else closest overall. */
  pickTarget(range = Tuning.softLockRange) {
    const w = this.world;
    if (this === w.player && w.lockTarget?.alive) return w.lockTarget;
    let best = null, bestScore = Infinity;
    const input = this.moveInput, hasInput = Math.hypot(input.x, input.z) > 0.2;
    for (const f of w.fighters) {
      if (f.team === this.team || !f.alive) continue;
      const d = flatDistance(this.pos, f.pos);
      if (d > range) continue;
      let score = d;
      if (hasInput) {
        const dx = (f.pos.x - this.pos.x) / (d || 1), dz = (f.pos.z - this.pos.z) / (d || 1);
        score -= (dx * input.x + dz * input.z) * 3;
      }
      if (score < bestScore) { bestScore = score; best = f; }
    }
    return best;
  }

  _started(a) {
    this.hitboxes.length = 0;
    this.dash.frames = 0;
    this.slamming = false;
    if (this.kind === "player") {
      if (a.id === "Dodge" || a.id === "Jump" || a.id === "Guard") {
        const i = this.moveInput;
        if (a.id === "Dodge" && Math.hypot(i.x, i.z) > 0.2) this.yaw = Math.atan2(i.x, i.z);
      } else {
        const t = a.tags.includes("finisher") ? this.world.brokenTarget(this) : this.pickTarget();
        if (t) this.yaw = angleTo(this.pos, t.pos);
        else if (Math.hypot(this.moveInput.x, this.moveInput.z) > 0.2) this.yaw = Math.atan2(this.moveInput.x, this.moveInput.z);
      }
      if (a.tags.includes("counter")) this.counterFrames = 0;
      if (AIR.has(a.id)) this.vel.y = 1.5; // air strings hang Rook in place
      this.combatant.blocking = false;
    }
    this.world.emit({ type: "started", fighter: this, ability: a });
  }

  _event(a, e) {
    switch (e.type) {
      case EventType.SpawnHitbox:
        this.hitboxes.push({ def: this.hitboxDefs[e.key], key: e.key, frames: e.value, spec: a.hit, ability: a, hitSet: new Set() });
        break;
      case EventType.Move: {
        const frames = Math.max(1, a.active);
        let distance = e.value;
        if (e.key === "toTarget") { // lunge: close the gap up to `value`, stop at striking distance
          const t = a.tags.includes("finisher") ? this.world.brokenTarget(this) : this.pickTarget(e.value + 2);
          distance = t ? Math.max(0, Math.min(e.value, flatDistance(this.pos, t.pos) - 1.3)) : e.value * 0.4;
        }
        const speed = distance / (frames * SECONDS_PER_TICK);
        let { x, z } = this.forward;
        if (a.id === "Dodge" && Math.hypot(this.moveInput.x, this.moveInput.z) <= 0.2) { x = -x; z = -z; } // backstep
        this.dash.x = x * speed; this.dash.z = z * speed; this.dash.frames = frames;
        break;
      }
      case EventType.Invulnerable: this.combatant.startInvulnerability(e.value); break;
      case EventType.Custom:
        if (e.key === "jump") { this.vel.y = e.value; this.grounded = false; }
        else if (e.key === "slam") { this.vel.y = -e.value; this.slamming = true; }
        else if (e.key === "parry") this.combatant.startParry(e.value);
        break;
      default:
        this.world.emit({ type: "abilityEvent", fighter: this, ability: a, event: e });
    }
  }

  _ended(a, how) {
    this.hitboxes.length = 0;
    if (how !== "finished") this.dash.frames = 0;
    if (a.id === "Dodge") this.afterDashFrames = 12;
    this.world.emit({ type: "ended", fighter: this, ability: a, how });
  }

  context() {
    let c = this.grounded ? MoveContext.Grounded : MoveContext.Airborne;
    const cur = this.runner.current;
    if (this.afterDashFrames > 0 || (cur?.id === "Dodge" && this.runner.frame >= 12)) c |= MoveContext.AfterDash;
    if (this.counterFrames > 0) c |= MoveContext.AfterParry;
    if (this.world.brokenTarget(this)) c |= MoveContext.TargetStaggered;
    return c;
  }
}

export class World {
  /** @param {{tokens?:number, seed?:number}} [o] */
  constructor(o = {}) {
    this.frame = 0;
    this.fighters = [];
    this.events = [];
    this.tokens = new AttackTokenPool(o.tokens ?? 2);
    this.rng = seededRandom(o.seed ?? 1234);
    this.slowFrames = 0;
    this.afterimageReadyFrame = 0;
    this.lockTarget = null;
    this.wave = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.player = this.add(new Fighter(this, {
      id: "rook", kind: "player", team: Team.Player, stats: ROOK_STATS, hitboxes: ROOK_HITBOXES,
      graph: buildRookGraph(() => this.player.context()), x: 0, z: -4,
    }));
  }

  add(f) { this.fighters.push(f); return f; }
  emit(e) { this.events.push(e); }
  drainEvents() { const e = this.events; this.events = []; return e; }
  get enemies() { return this.fighters.filter((f) => f.team === Team.Enemy); }
  get liveEnemies() { return this.fighters.filter((f) => f.team === Team.Enemy && f.alive); }
  get afterimageActive() { return this.slowFrames > 0; }

  spawnAcolyte(x, z, n = 0) {
    const id = `acolyte-${this.wave}-${n}`;
    const brain = new EnemyBrain(id, this.tokens, acolyteOptions(), this.rng);
    const f = new Fighter(this, {
      id, kind: "acolyte", team: Team.Enemy, stats: ACOLYTE_STATS, hitboxes: ACOLYTE_HITBOXES,
      brain, x, z, circleSign: n % 2 ? 1 : -1,
    });
    f.yaw = angleTo(f.pos, this.player.pos);
    this.emit({ type: "spawn", fighter: f });
    return this.add(f);
  }

  spawnWave(count = 3) {
    this.wave++;
    for (const f of this.enemies) this.emit({ type: "despawn", fighter: f });
    this.fighters = this.fighters.filter((f) => f.team !== Team.Enemy);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.6;
      this.spawnAcolyte(Math.sin(a) * 8, Math.cos(a) * 8 + 2, i);
    }
    this.emit({ type: "wave", wave: this.wave });
  }

  resetPlayer() {
    const p = this.player;
    p.combatant.reset(); p.mana?.fill(); p.runner.interrupt(); p.buffer.clear();
    p.pos = v3(0, 0, -4); p.prev = v3(0, 0, -4); p.vel = v3(); p.knock = v3(); p.grounded = true; p.yaw = 0;
    p.counterFrames = 0; p.hitstop = 0; this.lockTarget = null; this.slowFrames = 0;
  }

  /** The posture-broken enemy a finisher would hit, if any. */
  brokenTarget(f) {
    if (f !== this.player) return null;
    let best = null, bestD = Tuning.finisherRange;
    for (const e of this.fighters) {
      if (e.team === f.team || !e.alive || !e.combatant.postureBroken) continue;
      const d = flatDistance(f.pos, e.pos);
      if (d <= bestD) { best = e; bestD = d; }
    }
    return best;
  }

  press(intent) { if (this.player.alive) this.player.buffer.push(intent, this.frame + 1); }

  toggleLock() {
    if (this.lockTarget) { this.lockTarget = null; return null; }
    const p = this.player;
    let best = null, bestD = 20;
    for (const e of this.liveEnemies) { const d = flatDistance(p.pos, e.pos); if (d < bestD) { best = e; bestD = d; } }
    this.lockTarget = best;
    return best;
  }

  /** One 60 Hz logic frame, in fixed phases. */
  step() {
    this.frame++;
    const frame = this.frame;
    if (this.slowFrames > 0) this.slowFrames--;
    const enemyScale = this.slowFrames > 0 ? Tuning.afterimageScale : 1;

    for (const f of this.fighters) {
      f.timeScale = f.team === Team.Enemy ? enemyScale : 1;
      f.timeAcc += f.timeScale;
      f.ticking = f.timeAcc >= 1 - 1e-9;
      if (f.ticking) { f.timeAcc -= 1; f.prev = { ...f.pos }; f.prevYaw = f.yaw; }
      f.frozen = false;
    }

    // Hitstop freezes a fighter in place; held presses wait.
    for (const f of this.fighters) {
      if (!f.ticking || f.hitstop <= 0) continue;
      f.hitstop--; f.buffer.delay(1); f.frozen = true;
    }
    const live = (f) => f.ticking && !f.frozen;

    this._brains(frame, live);
    this._abilities(frame, live);
    this._hitboxes(live);
    for (const f of this.fighters) if (live(f)) f.combatant.tick();
    for (const f of this.fighters) if (live(f)) this._move(f);
    this._late(live);
  }

  _brains(frame, live) {
    const p = this.player;
    for (const e of this.fighters) {
      if (!e.brain || !live(e)) continue;
      const d = flatDistance(e.pos, p.pos);
      const out = e.brain.think({
        frame, hasTarget: p.alive, distance: d, isStaggered: e.combatant.isStaggered,
        isDead: !e.alive, abilityRunning: e.runner.isRunning,
      });
      const toP = { x: (p.pos.x - e.pos.x) / (d || 1), z: (p.pos.z - e.pos.z) / (d || 1) };
      switch (out.move) {
        case MoveIntent.Approach: e.moveInput = toP; break;
        case MoveIntent.Retreat: e.moveInput = { x: -toP.x * 0.6, z: -toP.z * 0.6 }; break;
        case MoveIntent.Circle: {
          const keep = d > 4 ? 0.4 : d < 2.6 ? -0.4 : 0;
          const s = (e.stats.circleSpeed / e.stats.runSpeed) * e.circleSign;
          e.moveInput = { x: -toP.z * s + toP.x * keep, z: toP.x * s + toP.z * keep };
          break;
        }
        default: e.moveInput = { x: 0, z: 0 };
      }
      if (out.attack) {
        e.yaw = angleTo(e.pos, p.pos);
        if (e.controller.startDirect(out.attack, frame) !== StartResult.Started) e.brain.attackFailed();
      }
    }
  }

  _abilities(frame, live) {
    for (const f of this.fighters) {
      if (!live(f)) continue;
      const c = f.combatant;
      f.controller.locked = !c.canAct;
      if (f.kind === "player") {
        let o = 0;
        if (f.counterFrames > 0) o |= mask(Intent.Light);
        if (f.grounded && this.brokenTarget(f)) o |= mask(Intent.Heavy);
        f.controller.overrideMask = o;
        if (f.mana) f.mana.add(f.stats.manaRegenPerSecond * SECONDS_PER_TICK);
      }
      f.controller.tick(frame);
      if (f.kind === "player") {
        c.blocking = f.holdBlock && !f.runner.isRunning && f.grounded && c.canAct;
      }
      // Enemies track the player through their wind-up, then commit.
      if (f.brain && f.runner.isRunning && f.runner.frame < f.current.startup - 4) {
        f.yaw = turn(f.yaw, angleTo(f.pos, this.player.pos), f.stats.turnRate);
      }
    }
  }

  _hitboxes(live) {
    for (const att of this.fighters) {
      if (!live(att) || !att.hitboxes.length) continue;
      for (const hb of att.hitboxes) {
        for (const def of this.fighters) {
          if (def === att || def.team === att.team || !def.alive || hb.hitSet.has(def)) continue;
          const grace = def.combatant.invulnerableFrames > 0 ? Tuning.nearMissGrace : 0;
          if (!boxHitsCapsule(hb.def, att.pos, att.yaw, def.pos, def.stats.radius + grace, def.stats.height)) continue;
          hb.hitSet.add(def);
          this._resolve(att, def, hb);
        }
      }
      for (const hb of att.hitboxes) hb.frames--;
      att.hitboxes = att.hitboxes.filter((h) => h.frames > 0);
    }
  }

  _resolve(att, def, hb) {
    const spec = hb.spec;
    const r = resolveHit(att.combatant, def.combatant, spec);
    const c = hitboxCenter(hb.def, att.pos, att.yaw);
    const at = { x: (c.x + def.pos.x) / 2, y: def.pos.y + 1.2, z: (c.z + def.pos.z) / 2 };
    const d = flatDistance(att.pos, def.pos) || 1;
    const away = { x: (def.pos.x - att.pos.x) / d, z: (def.pos.z - att.pos.z) / d };
    const base = { attacker: att, defender: def, ability: hb.ability, spec, result: r, at };

    switch (r.outcome) {
      case HitOutcome.Hit: {
        att.hitstop = Math.max(att.hitstop, r.attackerHitstop);
        def.hitstop = Math.max(def.hitstop, r.defenderHitstop);
        att.runner.notifyHit(0);
        if (def.combatant.isStaggered) { def.runner.interrupt(); def.dash.frames = 0; }
        def.knock.x += away.x * spec.knockback * Tuning.knockbackSpeed;
        def.knock.z += away.z * spec.knockback * Tuning.knockbackSpeed;
        if (spec.launch > 0) { def.vel.y = spec.launch; def.grounded = false; }
        else if (!def.grounded) def.vel.y = Math.max(def.vel.y, 3);
        if (!att.grounded) att.vel.y = 1.5;
        if (att === this.player) { this.comboCount++; this.comboTimer = 120; }
        if (def === this.player) { this.comboCount = 0; def.buffer.clear(); }
        this.emit({ type: "hit", ...base });
        if (r.defenderPostureBroken) this.emit({ type: "postureBreak", ...base });
        if (r.killed) { this.emit({ type: "kill", ...base }); if (this.lockTarget === def) this.lockTarget = null; }
        if (r.killed && def === this.player) this.emit({ type: "playerDown" });
        break;
      }
      case HitOutcome.Blocked:
        att.hitstop = Math.max(att.hitstop, r.attackerHitstop);
        def.hitstop = Math.max(def.hitstop, r.defenderHitstop);
        att.runner.notifyHit(0);
        def.knock.x += away.x * 0.8 * Tuning.knockbackSpeed; def.knock.z += away.z * 0.8 * Tuning.knockbackSpeed;
        if (r.defenderPostureBroken) def.runner.interrupt();
        this.emit({ type: "block", ...base });
        if (r.defenderPostureBroken) this.emit({ type: "guardBreak", ...base });
        break;
      case HitOutcome.Parried:
        att.hitstop = Math.max(att.hitstop, r.attackerHitstop);
        def.hitstop = Math.max(def.hitstop, r.defenderHitstop);
        att.runner.interrupt(); att.combatant.stagger(26);
        att.knock.x -= away.x * 1.2 * Tuning.knockbackSpeed; att.knock.z -= away.z * 1.2 * Tuning.knockbackSpeed;
        if (def === this.player) def.counterFrames = def.stats.counterWindowFrames;
        this.emit({ type: "parry", ...base });
        if (r.attackerPostureBroken) this.emit({ type: "postureBreak", ...base, defender: att });
        break;
      case HitOutcome.PerfectDodge:
        if (def === this.player) {
          def.counterFrames = def.stats.counterWindowFrames;
          if (this.frame >= this.afterimageReadyFrame) {
            this.slowFrames = Tuning.afterimageFrames;
            this.afterimageReadyFrame = this.frame + def.stats.afterimageCooldownFrames;
            this.emit({ type: "afterimage", ...base });
          }
        }
        this.emit({ type: "perfectDodge", ...base });
        break;
      default: break;
    }
  }

  _move(f) {
    const dt = SECONDS_PER_TICK;
    const busy = f.runner.isRunning;
    const canSteer = f.combatant.canAct && f.alive && (!busy || !f.grounded);
    if (f.dash.frames > 0) {
      f.vel.x = f.dash.x; f.vel.z = f.dash.z; f.dash.frames--;
    } else if (canSteer) {
      const speed = f.stats.runSpeed * (f.combatant.blocking ? 0.4 : 1) * (f.grounded ? 1 : 0.6);
      const k = f.grounded ? 0.35 : 0.12;
      f.vel.x += (f.moveInput.x * speed - f.vel.x) * k;
      f.vel.z += (f.moveInput.z * speed - f.vel.z) * k;
      const mag = Math.hypot(f.moveInput.x, f.moveInput.z);
      if (f.kind === "player" && mag > 0.15 && !busy) f.yaw = turn(f.yaw, Math.atan2(f.moveInput.x, f.moveInput.z), f.stats.turnRate);
      if (f.brain && f.alive) f.yaw = turn(f.yaw, angleTo(f.pos, this.player.pos), f.stats.turnRate);
    } else if (f.grounded) {
      f.vel.x *= 0.6; f.vel.z *= 0.6;
    }

    f.pos.x += (f.vel.x + f.knock.x) * dt;
    f.pos.z += (f.vel.z + f.knock.z) * dt;
    f.knock.x *= Tuning.knockbackDecay; f.knock.z *= Tuning.knockbackDecay;

    if (!f.grounded) {
      const juggled = f.combatant.isStaggered && f.team === Team.Enemy;
      const airAttack = f.runner.isRunning && AIR.has(f.current.id);
      const g = f.slamming ? 0 : airAttack ? Tuning.airAttackGravity : juggled ? Tuning.juggleGravity : Tuning.gravity;
      f.vel.y -= g * dt;
      f.pos.y += f.vel.y * dt;
      if (f.pos.y <= 0) {
        f.pos.y = 0; f.vel.y = 0; f.grounded = true;
        const slam = f.slamming; f.slamming = false;
        if (f.runner.isRunning && AIR.has(f.current.id)) f.runner.interrupt();
        this.emit({ type: slam ? "slamLand" : "land", fighter: f });
      }
    }
  }

  _late(live) {
    // Keep bodies apart and inside the arena.
    const fs = this.fighters.filter((f) => f.alive);
    for (let i = 0; i < fs.length; i++) {
      for (let j = i + 1; j < fs.length; j++) {
        const a = fs[i], b = fs[j];
        if (Math.abs(a.pos.y - b.pos.y) > 1.2) continue;
        const min = a.stats.radius + b.stats.radius;
        const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
        const d = Math.hypot(dx, dz);
        if (d >= min || d === 0) continue;
        const push = (min - d) / 2, nx = dx / d, nz = dz / d;
        a.pos.x -= nx * push; a.pos.z -= nz * push; b.pos.x += nx * push; b.pos.z += nz * push;
      }
    }
    for (const f of this.fighters) {
      const r = Math.hypot(f.pos.x, f.pos.z);
      if (r > Tuning.arenaRadius) { f.pos.x *= Tuning.arenaRadius / r; f.pos.z *= Tuning.arenaRadius / r; }
      if (!live(f)) continue;
      if (f.afterDashFrames > 0) f.afterDashFrames--;
      if (f.counterFrames > 0) f.counterFrames--;
      if (!f.alive) f.deadFrames++;
    }
    if (this.comboTimer > 0 && --this.comboTimer === 0) this.comboCount = 0;

    // Bodies fade, then the wave can end.
    const gone = this.fighters.filter((f) => f.team === Team.Enemy && f.deadFrames > Tuning.corpseFrames);
    if (gone.length) {
      for (const f of gone) this.emit({ type: "despawn", fighter: f });
      this.fighters = this.fighters.filter((f) => !gone.includes(f));
      if (!this.enemies.length) this.emit({ type: "waveClear", wave: this.wave });
    }
  }
}
