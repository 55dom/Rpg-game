// The fight, with no rendering: fighters, movement, hitboxes, and the Step 3 rules
// (parry → counter, perfect dodge → Afterimage, posture break → Lantern Break).
// The Babylon layer only reads this state and the events it emits.

import { Intent, InputBuffer, mask } from "../core/input.js";
import { ResourcePool } from "../core/stats.js";
import { Combatant, Team, HitOutcome, Rules, resolveHit } from "../core/combat.js";
import { AbilityRunner, AbilityController, EventType, MoveContext, StartResult } from "../core/abilities.js";
import { AttackTokenPool, EnemyBrain, MoveIntent, CompanionBrain, AllyMove, STANCES } from "../core/ai.js";
import { COMPANIONS } from "../data/companions.js";
import { ENEMIES, WAVES } from "../data/enemies.js";
import { HASK_STATS, HASK_HITBOXES, HASK_TUNING, haskOptions } from "../data/hask.js";
import { HaskController, SeverinController, SparController } from "./boss.js";
import { CAL_STATS, CAL_HITBOXES, calOptions } from "../data/cal.js";
import { SEVERIN_STATS, SEVERIN_HITBOXES, severinOptions } from "../data/severin.js";
import { RunDirector } from "./run.js";
import { seededRandom, SECONDS_PER_TICK } from "../core/timing.js";
import { boxHitsCapsule, hitboxCenter } from "./overlap.js";
import { TagSet, matchReactions } from "../core/tags.js";
import { REACTIONS } from "../data/reactions.js";
import { ROOK_STATS, ROOK_ABILITIES, ROOK_HITBOXES, buildRookGraph, defaultLoadout } from "../data/rook.js";
import { PAGES, PAGE_HITBOXES } from "../data/pages.js";
import { pageLevel } from "../core/progress.js";
import { hitSpec } from "../core/combat.js";
import { YARD, constrain, outOfBounds } from "./bounds.js";

export const Tuning = Object.freeze({
  gravity: 32, juggleGravity: 18, airAttackGravity: 9,
  arenaRadius: 17,
  knockbackSpeed: 4, knockbackDecay: 0.82,
  afterimageScale: 0.35, afterimageFrames: 36,
  meleeManaGain: 3, assistFrames: 3,
  softLockRange: 6.5, finisherRange: 3.8,
  corpseFrames: 100,
  nearMissGrace: 1.2, // while i-frames are up, a near miss counts as dodged (it can never deal damage)
  playerTargetBias: 2, // enemies prefer Rook over a companion this much closer
  shieldFactor: 0.5, companionSurgeShare: 0.5, assistRange: 12,
  wardFactor: 0.7, wardRadius: 8, guardArc: 0.35, heavyKnockback: 0.25,
  juggleDecay: 0.12, juggleDecayMax: 2.5, // each air hit adds 12% gravity (GDD §9.3), up to 2.5x
  weightedSpeed: 0.55, weightedJump: 0.7, // WEIGHTED (mud): slower, lower jumps
});

const BOSSES = {
  hask: { stats: HASK_STATS, hitboxes: HASK_HITBOXES, options: haskOptions, traits: { heavy: true, armoredAttacks: true }, Controller: HaskController, z: 7 },
  cal: { stats: CAL_STATS, hitboxes: CAL_HITBOXES, options: calOptions, traits: {}, Controller: SparController, z: 4 },
  severin: { stats: SEVERIN_STATS, hitboxes: SEVERIN_HITBOXES, options: severinOptions, traits: {}, Controller: SeverinController, z: 6 },
};

const AIR = new Set(["AirL1", "AirL2", "AirL3"]);
const HANG = new Set(["AirL1", "AirL2", "AirL3"]); // started in the air, these hold Rook up (plus anything tagged "hang")
const hangs = (a) => HANG.has(a.id) || a.tags.includes("hang");
const WALL = Object.freeze({ center: [0, 1.4, 0], size: [5.2, 3.4, 1.4] });
const WALL_HIT = hitSpec({ damage: 4, posture: 10, hitstop: 3, hitstun: 16, knockback: 3 });
const WALL_LAUNCH = hitSpec({ damage: 6, posture: 12, hitstop: 4, hitstun: 30, launch: 9 });
const MOBILITY = new Set(["Dodge", "Jump", "Guard", "AirJump", "AirDash"]);
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
    this.surge = o.stats.maxSurge ? new ResourcePool(o.stats.maxSurge, 0) : null;
    this.tags = new TagSet();
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
    this.airJumps = 1; this.airDashes = 1; this.hoverFrames = 0;
    this.holdBlock = false;
    this.afterDashFrames = 0;
    this.counterFrames = 0;
    this.deadFrames = 0;
    this.circleSign = o.circleSign ?? 1;
    this.target = null;
    this.companion = !!o.companion;
    this.slot = o.slot ?? null;
    this.assistReadyFrame = 0;
    this.faceMove = false;
    this.traits = o.traits ?? {};
    this.juggleHits = 0;
    this.submerged = false;
    this.boss = null;
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
      if (MOBILITY.has(a.id)) {
        const i = this.moveInput;
        if ((a.id === "Dodge" || a.id === "AirDash") && Math.hypot(i.x, i.z) > 0.2) this.yaw = Math.atan2(i.x, i.z);
      } else {
        const t = a.tags.includes("finisher") ? this.world.brokenTarget(this) : this.pickTarget();
        if (t) this.yaw = angleTo(this.pos, t.pos);
        else if (Math.hypot(this.moveInput.x, this.moveInput.z) > 0.2) this.yaw = Math.atan2(this.moveInput.x, this.moveInput.z);
      }
      if (a.tags.includes("counter")) this.counterFrames = 0;
      if (hangs(a) && !this.grounded) this.vel.y = Math.max(1.5, Math.min(this.vel.y, 4)); // hang, keeping a little rise
      this.combatant.blocking = false;
    }
    if (a.surgeCost > 0 && this.surge) this.surge.trySpend(Math.min(a.surgeCost, this.surge.current));
    this.world.emit({ type: "started", fighter: this, ability: a });
  }

  _event(a, e) {
    switch (e.type) {
      case EventType.SpawnHitbox:
        // A hitbox may carry its own hit (multi-part moves like ultimates); otherwise the move's hit.
        this.hitboxes.push({ def: this.hitboxDefs[e.key], key: e.key, frames: e.value, spec: this.hitboxDefs[e.key].hit ?? a.hit, ability: a, hitSet: new Set() });
        break;
      case EventType.Move: {
        const frames = Math.max(1, a.active);
        let distance = e.value;
        if (e.key === "toTarget") { // lunge: home in on a target ahead, stop at striking distance
          const t = a.tags.includes("finisher") ? this.world.brokenTarget(this) : this.pickTarget(e.value + 2);
          if (t) {
            const toT = angleTo(this.pos, t.pos);
            if (Math.cos(wrap(toT - this.yaw)) > 0.7) {
              this.yaw = toT;
              distance = Math.max(0, Math.min(e.value, flatDistance(this.pos, t.pos) - 1.3));
            }
          }
        }
        const speed = distance / (frames * SECONDS_PER_TICK);
        let { x, z } = this.forward;
        if (a.id === "Dodge" && Math.hypot(this.moveInput.x, this.moveInput.z) <= 0.2) { x = -x; z = -z; } // backstep
        if (e.key === "left") { const fx = x; x = -z; z = fx; } // sidestep to the fighter's left
        this.dash.x = x * speed; this.dash.z = z * speed; this.dash.frames = frames;
        break;
      }
      case EventType.Invulnerable: this.combatant.startInvulnerability(e.value); break;
      case EventType.Projectile: this.world.fireProjectile(this, a, e.key, e.value); break;
      case EventType.Custom:
        if (e.key === "jump") { this.vel.y = e.value * (this.tags.has("WEIGHTED") ? Tuning.weightedJump : 1); this.grounded = false; }
        else if (e.key === "airJump") { this.vel.y = e.value * (this.tags.has("WEIGHTED") ? Tuning.weightedJump : 1); this.airJumps = 0; }
        else if (e.key === "submerge") this.boss?.submerge();
        else if (e.key === "summon") this.world.summon(this, "hound", e.value);
        else if (e.key === "fan") this.world.fireFan(this, a, "Needle", 15, e.value, 0.26);
        else if (e.key === "stars") this.boss?.placeStars?.();
        else if (e.key === "airDash") { this.vel.y = 0; this.hoverFrames = e.value; this.airDashes = 0; }
        else if (e.key === "hover") { this.vel.y = 0; this.hoverFrames = e.value; }
        else if (e.key === "timeStop") this.world.stopFrames = Math.max(this.world.stopFrames, e.value);
        else if (e.key === "slam") { this.vel.y = -e.value; this.slamming = true; }
        else if (e.key === "parry") this.combatant.startParry(e.value + (this === this.world.player && this.world.assist ? Tuning.assistFrames : 0));
        else if (e.key === "shield") { const p = this.world.player; if (p.alive) { p.tags.add("SHIELDED", e.value); this.world.emit({ type: "shield", fighter: this, target: p }); } }
        else if (e.key === "heal") this.world.heal(this, e.value);
        else if (e.key === "ward") this.world.ward(this, e.value);
        else if (e.key.startsWith("windwall")) this.world.windWall(this, a, e.value, e.key === "windwallMirror" ? "mirror" : e.key === "windwallDown" ? "down" : "block");
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
    if (!this.grounded && this.airJumps > 0) c |= MoveContext.AirJumpReady;
    if (!this.grounded && this.airDashes > 0) c |= MoveContext.AirDashReady;
    if (this.surge?.isFull) c |= MoveContext.SurgeFull;
    return c;
  }
}

export class World {
  /**
   * @param {{tokens?:number, seed?:number, assist?:boolean, companions?:boolean|string[],
   *   loadout?:object, ultimate?:boolean}} [o] loadout: slot → ability (null locks a slot);
   *   ultimate:false locks Skyrender (no Surge gain). Story episodes use both.
   */
  constructor(o = {}) {
    this.frame = 0;
    this.bounds = o.bounds ?? YARD; // where fighters may stand (zones swap this)
    // Equipment (core/inventory.js mods): folded into Rook's stats here and into damage in _resolve.
    this.mods = { attack: 0, defense: 0, health: 0, mana: 0, manaRegen: 0, posture: 0, surge: 0, speed: 0, ...(o.mods ?? {}) };
    const m = this.mods;
    this.playerStats = Object.freeze({ ...ROOK_STATS, maxHealth: ROOK_STATS.maxHealth + m.health, maxMana: ROOK_STATS.maxMana + m.mana,
      manaRegenPerSecond: ROOK_STATS.manaRegenPerSecond + m.manaRegen, runSpeed: ROOK_STATS.runSpeed * (1 + m.speed) });
    this.fighters = [];
    this.events = [];
    this.tokens = new AttackTokenPool(o.tokens ?? 2);
    this.rng = seededRandom(o.seed ?? 1234);
    this.slowFrames = 0;
    this.stopFrames = 0; // ultimate time stop: everyone but the caster freezes
    this.afterimageReadyFrame = 0;
    this.lockTarget = null;
    this.wave = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.ultimate = o.ultimate ?? true;
    this.pageGrowth = o.pages ?? true; // pages earn XP and evolve
    // Page mastery: shared with the story's Progress (core/progress.js) when there is one, so it carries over.
    this.progress = o.progress ?? null;
    this.pages = this.progress?.pages ?? Object.fromEntries(Object.keys(PAGES).map((slot) => [slot, { xp: 0, ready: false, branch: null }]));
    this.loadout = {};
    for (const [slot, ab] of Object.entries({ ...defaultLoadout(), ...(o.loadout ?? {}) })) {
      const br = ab && PAGES[slot] && this.pages[slot]?.branch && ab.id === PAGES[slot].base.id ? PAGES[slot].branches.find((b) => b.key === this.pages[slot].branch) : null;
      this.loadout[slot] = br ? br.ability : ab; // an evolved page stays evolved
    }
    this._fitLoadout();
    this.zones = [];
    this.player = this.add(new Fighter(this, {
      id: "rook", kind: "player", team: Team.Player, stats: this.playerStats, hitboxes: { ...ROOK_HITBOXES, ...PAGE_HITBOXES },
      graph: buildRookGraph(() => this.player.context(), ROOK_ABILITIES, this.loadout, { ultimate: this.ultimate }), x: 0, z: -4,
    }));
    this.assist = !!o.assist;
    this.companions = [];
    this.projectiles = [];
    if (o.companions) for (const kind of Array.isArray(o.companions) ? o.companions : Object.keys(COMPANIONS)) this.addCompanion(kind);
  }

  addCompanion(kind) {
    const c = COMPANIONS[kind];
    const p = this.player;
    const f = new Fighter(this, {
      id: kind, kind, team: Team.Player, stats: c.stats, hitboxes: c.hitboxes, companion: true, slot: c.slot,
      brain: new CompanionBrain(kind, c.options(), c.supports(), this.rng), x: p.pos.x + c.slot[0], z: p.pos.z + c.slot[1],
    });
    f.assistAbility = c.assist;
    this.companions.push(f);
    this.emit({ type: "spawn", fighter: f });
    return this.add(f);
  }

  get stance() { return this.companions[0]?.brain.stance ?? STANCES[0]; }
  setStance(stance) { for (const c of this.companions) c.brain.stance = stance; this.emit({ type: "stance", stance }); }
  cycleStance() { this.setStance(STANCES[(STANCES.indexOf(this.stance) + 1) % STANCES.length]); return this.stance; }

  /** Heal the most hurt ally near the healer (Rook first on ties). */
  heal(healer, amount) {
    let best = null, bestRatio = 1;
    for (const f of this.fighters) {
      if (f.team !== healer.team || !f.alive || flatDistance(f.pos, healer.pos) > 10) continue;
      const r = f.combatant.health.normalized - (f === this.player ? 0.001 : 0);
      if (r < bestRatio) { bestRatio = r; best = f; }
    }
    if (!best) return;
    best.combatant.health.add(amount);
    best.tags.remove("WEIGHTED"); // stitching also cuts away the mud
    this.emit({ type: "heal", fighter: healer, target: best, amount });
  }

  /** The player calls a companion's signature move (GDD §10 Assist Call). */
  callAssist(kind) {
    const c = this.companions.find((f) => f.kind === kind);
    if (!c || !c.alive || !this.player.alive) return { ok: false, reason: "down" };
    if (this.frame < c.assistReadyFrame) return { ok: false, reason: "cooldown" };
    const t = (this.lockTarget?.alive && this.lockTarget) || this.player.pickTarget(Tuning.assistRange) || this.nearestEnemy(Tuning.assistRange);
    if (!t) return { ok: false, reason: "noTarget" };
    // Blink beside the target on the side away from Rook, facing it.
    const p = this.player.pos;
    const d = flatDistance(p, t.pos) || 1;
    const ox = (t.pos.x - p.x) / d, oz = (t.pos.z - p.z) / d;
    const side = c.kind === "bas" ? 1 : -1;
    c.pos.x = t.pos.x + (ox * 0.6 - oz * side) * 1.3; c.pos.z = t.pos.z + (oz * 0.6 + ox * side) * 1.3; c.pos.y = 0;
    c.prev.x = c.pos.x; c.prev.y = 0; c.prev.z = c.pos.z;
    c.vel.x = c.vel.y = c.vel.z = 0; c.grounded = true; c.hitstop = 0;
    c.yaw = angleTo(c.pos, t.pos); c.prevYaw = c.yaw;
    c.target = t;
    c.runner.interrupt();
    c.combatant.staggerFrames = 0;
    c.controller.startDirect(c.assistAbility, this.frame);
    c.assistReadyFrame = this.frame + c.stats.assistCooldownFrames;
    this.emit({ type: "assist", fighter: c, ability: c.assistAbility, target: t });
    return { ok: true, target: t };
  }

  /** Touch assist: wider parry and perfect-dodge windows. Never changes damage. */
  get assist() { return this._assist; }
  set assist(on) {
    this._assist = on;
    this.player.combatant.perfectDodgeFrames = Rules.PerfectDodgeFrames + (on ? Tuning.assistFrames : 0);
  }

  add(f) { this.fighters.push(f); return f; }
  emit(e) { this.events.push(e); this.run?.onEvent(e); }

  /** Start a scripted combat run (an episode's encounters) instead of the sandbox waves. */
  startRun(episode) {
    this.run = new RunDirector(this, episode);
    this.run.start();
    return this.run;
  }
  drainEvents() { const e = this.events; this.events = []; return e; }
  get enemies() { return this.fighters.filter((f) => f.team === Team.Enemy); }
  get liveEnemies() { return this.fighters.filter((f) => f.team === Team.Enemy && f.alive); }
  get afterimageActive() { return this.slowFrames > 0; }

  spawnEnemy(kind, x, z, n = 0) {
    const def = ENEMIES[kind];
    if (!def) throw new Error(`unknown enemy ${kind}`);
    const id = `${kind}-${this.wave}-${n}`;
    const brain = new EnemyBrain(id, this.tokens, def.options(), this.rng);
    const f = new Fighter(this, {
      id, kind, team: Team.Enemy, stats: def.stats, hitboxes: def.hitboxes, traits: def.traits,
      brain, x, z, circleSign: n % 2 ? 1 : -1,
    });
    f.yaw = angleTo(f.pos, this.player.pos);
    this.emit({ type: "spawn", fighter: f });
    return this.add(f);
  }

  spawnAcolyte(x, z, n = 0) { return this.spawnEnemy("acolyte", x, z, n); }

  /** Boss: an enemy with a scripted controller and its own attack token (it never waits in line). */
  spawnBoss(kind, x = 0, z = 6) {
    const B = BOSSES[kind];
    if (!B) throw new Error(`unknown boss ${kind}`);
    const brain = new EnemyBrain(kind, new AttackTokenPool(1), B.options(1), this.rng);
    brain.aggroRange = 40;
    const f = new Fighter(this, {
      id: kind, kind, team: Team.Enemy, stats: B.stats, hitboxes: B.hitboxes,
      traits: B.traits, brain, x, z,
    });
    f.yaw = angleTo(f.pos, this.player.pos);
    f.boss = new B.Controller(this, f);
    this.boss = f;
    this.emit({ type: "spawn", fighter: f });
    this.emit({ type: "bossIntro", fighter: f });
    return this.add(f);
  }

  /** Call `count` creatures of `kind` up beside `caller` (Hask's roar). */
  summon(caller, kind, count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = caller.yaw + (i % 2 ? 1 : -1) * (1.2 + i * 0.3);
      const e = this.spawnEnemy(kind, caller.pos.x + Math.sin(a) * 3, caller.pos.z + Math.cos(a) * 3, 90 + i);
      out.push(e);
    }
    this.emit({ type: "summon", fighter: caller, summoned: out });
  }

  /** spawnWave(3) = three acolytes; spawnWave(["hound", ...]) = those kinds; spawnWave() = the next wave in WAVES.
   *  `at` ({x, z, r?}) rings the wave around a point instead of the yard's middle (field encounters). */
  spawnWave(spec, at = null) {
    this.wave++;
    for (const f of this.enemies) this.emit({ type: "despawn", fighter: f });
    this.fighters = this.fighters.filter((f) => f.team !== Team.Enemy);
    this.projectiles.length = 0;
    this.zones.length = 0;
    const kinds = Array.isArray(spec) ? spec : typeof spec === "number" ? Array(spec).fill("acolyte") : WAVES[(this.wave - 1) % WAVES.length];
    this.boss = null;
    kinds.forEach((kind, i) => {
      if (BOSSES[kind]) { this.spawnBoss(kind, 0, BOSSES[kind].z); return; }
      const a = (i / kinds.length) * Math.PI * 2 + 0.6;
      if (at) { // around the encounter point, kept out of walls
        const r = (at.r ?? 5) * (ENEMIES[kind].traits.ranged ? 1.4 : 1);
        const pos = constrain({ x: at.x + Math.sin(a) * r, z: at.z + Math.cos(a) * r }, ENEMIES[kind].stats.radius, this.bounds);
        this.spawnEnemy(kind, pos.x, pos.z, i);
        return;
      }
      const r = ENEMIES[kind].traits.ranged ? 11 : 8;
      this.spawnEnemy(kind, Math.sin(a) * r, Math.cos(a) * r + 2, i);
    });
    this.emit({ type: "wave", wave: this.wave, kinds });
  }

  /** A fan of `count` projectiles aimed at the owner's target, `spread` radians apart. */
  fireFan(owner, ability, key, speed, count, spread) {
    const t = owner.target?.alive ? owner.target : this.player;
    const base = angleTo(owner.pos, t.pos);
    owner.yaw = base;
    for (let i = 0; i < count; i++) {
      const a = base + (i - (count - 1) / 2) * spread;
      this.fireProjectile(owner, ability, key, speed, { x: Math.sin(a), y: 0, z: Math.cos(a) });
    }
  }

  /** Remove every enemy and projectile (leaving a field fight, or falling in one). */
  clearEnemies() {
    for (const f of this.enemies) this.emit({ type: "despawn", fighter: f });
    this.fighters = this.fighters.filter((f) => f.team !== Team.Enemy);
    this.projectiles.length = 0; this.zones.length = 0; this.boss = null; this.lockTarget = null;
  }

  /** Back on your feet mid-fight (story duels let you get up). */
  revivePlayer(fraction = 0.5) {
    const p = this.player;
    p.combatant.reset(); p.combatant.health.set(p.combatant.health.max * fraction);
    p.combatant.startInvulnerability(90); p.tags.clear(); p.deadFrames = 0; p.runner.interrupt();
    this.emit({ type: "playerRevive", fighter: p });
  }

  /** Launch a projectile from `owner` toward its target (or along `dir`). Flat ones skim the ground. */
  fireProjectile(owner, ability, key, speed, dirOverride = null) {
    const def = owner.hitboxDefs[key];
    const f = owner.forward;
    const pos = { x: owner.pos.x + f.x * 0.9, y: def.flat ? def.height ?? 0.4 : owner.pos.y + 1.3, z: owner.pos.z + f.z * 0.9 };
    let dir = dirOverride ?? { x: f.x, y: 0, z: f.z };
    const t = owner.target;
    if (def.flat && !dirOverride && t?.alive) {
      const dx = t.pos.x - pos.x, dz = t.pos.z - pos.z, d = Math.hypot(dx, dz) || 1;
      dir = { x: dx / d, y: 0, z: dz / d };
    } else if (!def.flat && !dirOverride && t?.alive) {
      const dx = t.pos.x - pos.x, dy = t.pos.y + 1.1 - pos.y, dz = t.pos.z - pos.z, d = Math.hypot(dx, dy, dz) || 1;
      dir = { x: dx / d, y: dy / d, z: dz / d };
    }
    const p = { owner, team: owner.team, def, spec: def.hit ?? ability.hit, ability, pos, dir, speed,
      life: Math.round(((def.range ?? 14) / speed) * 60), hitSet: new Set(), id: ++this._projectileIds || (this._projectileIds = 1) };
    this.projectiles.push(p);
    this.emit({ type: "projectile", projectile: p });
  }

  /** Page bonuses (mastery and Grimoire Tree): each spell's mana cost, and a damage factor by ability id. */
  _fitLoadout() {
    this.pageDmg = {};
    if (!this.progress) return;
    for (const slot of Object.keys(PAGES)) {
      const ab = this.loadout[slot];
      if (!ab) continue;
      const b = this.progress.pageBonus(slot), base = ab.baseManaCost ?? ab.manaCost;
      this.loadout[slot] = { ...ab, baseManaCost: base, manaCost: Math.round(base * b.mana) };
      this.pageDmg[ab.id] = b.dmg;
    }
  }

  /** Swap the spell on a button and rebuild Rook's combo graph. */
  applyLoadout() {
    this._fitLoadout();
    const p = this.player;
    const g = buildRookGraph(() => p.context(), ROOK_ABILITIES, this.loadout, { ultimate: this.ultimate });
    g.runner = p.runner;
    p.controller.resolver = g;
  }

  /** Choose a branch for a page that's ready to evolve. */
  evolvePage(slot, key) {
    const page = this.pages[slot], def = PAGES[slot];
    const branch = def?.branches.find((b) => b.key === key);
    if (!page || !branch || !page.ready || page.branch) return false;
    page.branch = key; page.ready = false;
    this.loadout = { ...this.loadout, [slot]: branch.ability };
    this.applyLoadout();
    this.emit({ type: "pageEvolved", slot, branch });
    return true;
  }

  /** A spell hit grants its page experience: levels I–V, and at III it's ready to evolve. */
  _pageXp(ability) {
    if (!this.pageGrowth) return;
    for (const [slot, ab] of Object.entries(this.loadout)) {
      if (ab?.id !== ability.id || !PAGES[slot]) continue;
      const page = this.pages[slot], before = pageLevel(slot, page.xp);
      if (before >= 5) return;
      page.xp++;
      const lv = pageLevel(slot, page.xp);
      if (lv > before) {
        this.emit({ type: "pageLevel", slot, level: lv, page: PAGES[slot] });
        if (this.progress) this.applyLoadout(); // stronger (and at V, cheaper) right away
      }
      if (lv >= 3 && !page.branch && !page.ready) { page.ready = true; this.emit({ type: "pageReady", slot, page: PAGES[slot] }); }
      return;
    }
  }

  /** Wind Wall: a standing wall of wind in front of the caster. */
  windWall(owner, ability, frames, mode) {
    const f = owner.forward;
    const z = { owner, team: owner.team, ability, mode, frames, max: frames, yaw: owner.yaw,
      pos: { x: owner.pos.x + f.x * 2.2, y: owner.pos.y, z: owner.pos.z + f.z * 2.2 }, hitSet: new Set() };
    this.zones.push(z);
    this.emit({ type: "windWall", zone: z });
  }

  _zones() {
    if (!this.zones.length) return;
    for (const z of this.zones) {
      z.frames--;
      const nx = Math.sin(z.yaw), nz = Math.cos(z.yaw);
      for (const p of this.projectiles) {
        if (p.dead || p.team === z.team) continue;
        if (!boxHitsCapsule(WALL, z.pos, z.yaw, { x: p.pos.x, y: p.pos.y - 0.3, z: p.pos.z }, 0.3, 0.6)) continue;
        if (z.mode === "mirror") { // throw it back at whoever sent it
          p.team = z.team; p.owner = z.owner; p.hitSet = new Set();
          const back = p.dir;
          p.dir = { x: -back.x, y: -back.y * 0.3, z: -back.z }; p.speed *= 1.25; p.life = 90;
          this.emit({ type: "reflect", projectile: p, at: { ...p.pos } });
        } else {
          p.dead = true;
          this.emit({ type: "deflect", projectile: p, by: z.owner, at: { ...p.pos } });
        }
      }
      for (const e of this.fighters) {
        if (e.team === z.team || !e.alive || e.submerged) continue;
        if (!boxHitsCapsule(WALL, z.pos, z.yaw, e.pos, e.stats.radius, e.stats.height)) continue;
        // Shove out along the wall's facing.
        const heavy = e.traits.heavy && !e.combatant.postureBroken;
        e.knock.x += nx * (heavy ? 0.6 : 2.2); e.knock.z += nz * (heavy ? 0.6 : 2.2);
        if (!z.hitSet.has(e)) {
          z.hitSet.add(e);
          this._resolve(z.owner, e, { def: WALL, spec: z.mode === "down" ? WALL_LAUNCH : WALL_HIT, ability: z.ability, hitSet: z.hitSet, origin: z.pos, projectile: true });
        }
      }
    }
    if (this.zones.some((z) => z.frames <= 0)) {
      for (const z of this.zones) if (z.frames <= 0) this.emit({ type: "zoneEnd", zone: z });
      this.zones = this.zones.filter((z) => z.frames > 0);
    }
  }

  /** Cantor's Hymn: ward every ally of the singer nearby. */
  ward(singer, frames) {
    const warded = [];
    for (const f of this.fighters) {
      if (f.team !== singer.team || !f.alive || flatDistance(f.pos, singer.pos) > Tuning.wardRadius) continue;
      f.tags.add("WARDED", frames);
      warded.push(f);
    }
    this.emit({ type: "ward", fighter: singer, targets: warded });
  }

  resetPlayer() {
    const p = this.player;
    p.combatant.reset(); p.mana?.fill(); p.runner.interrupt(); p.buffer.clear();
    p.pos = v3(0, 0, -4); p.prev = v3(0, 0, -4); p.vel = v3(); p.knock = v3(); p.grounded = true; p.yaw = 0;
    p.counterFrames = 0; p.hitstop = 0; this.lockTarget = null; this.slowFrames = 0; this.stopFrames = 0;
    p.surge?.set(0); p.tags.clear();
    for (const c of this.companions) {
      c.combatant.reset(); c.runner.interrupt(); c.tags.clear(); c.deadFrames = 0; c.hitstop = 0;
      c.pos = v3(p.pos.x + c.slot[0], 0, p.pos.z + c.slot[1]); c.prev = { ...c.pos }; c.vel = v3(); c.knock = v3(); c.grounded = true;
      c.assistReadyFrame = 0; c.yaw = 0;
    }
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

  nearestEnemy(range = 20, except = null) {
    const p = this.player;
    let best = null, bestD = range;
    for (const e of this.liveEnemies) {
      if (e === except) continue;
      const d = flatDistance(p.pos, e.pos);
      if (d < bestD) { best = e; bestD = d; }
    }
    return best;
  }

  toggleLock() {
    this.lockTarget = this.lockTarget ? null : this.nearestEnemy();
    return this.lockTarget;
  }

  /** Move the lock to the next enemy to the right (+1) or left (-1), wrapping around. */
  switchLock(dir = 1) {
    const cur = this.lockTarget;
    if (!cur?.alive) return this.toggleLock();
    const p = this.player.pos, base = angleTo(p, cur.pos);
    let best = null, bestA = Infinity;
    for (const e of this.liveEnemies) {
      if (e === cur || flatDistance(p, e.pos) > 20) continue;
      const a = (((angleTo(p, e.pos) - base) * dir) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      if (a < bestA) { bestA = a; best = e; }
    }
    if (best) this.lockTarget = best;
    return this.lockTarget;
  }

  /** One 60 Hz logic frame, in fixed phases. */
  step() {
    this.frame++;
    const frame = this.frame;
    if (this.slowFrames > 0) this.slowFrames--;
    if (this.stopFrames > 0) this.stopFrames--;
    const enemyScale = this.stopFrames > 0 ? 0 : this.slowFrames > 0 ? Tuning.afterimageScale : 1;

    for (const f of this.fighters) {
      f.timeScale = f.team === Team.Enemy ? enemyScale : 1;
      f.timeAcc += f.timeScale;
      f.ticking = f.timeAcc >= 1 - 1e-9;
      if (f.ticking) { f.timeAcc -= 1; f.prev.x = f.pos.x; f.prev.y = f.pos.y; f.prev.z = f.pos.z; f.prevYaw = f.yaw; }
      f.frozen = false;
    }

    // Hitstop freezes a fighter in place; held presses wait.
    for (const f of this.fighters) {
      if (!f.ticking || f.hitstop <= 0) continue;
      f.hitstop--; f.buffer.delay(1); f.frozen = true;
    }
    const live = (f) => f.ticking && !f.frozen;

    this.run?.tick();
    this._brains(frame, live);
    for (const f of this.fighters) if (f.boss && live(f)) f.boss.tick();
    this._abilities(frame, live);
    this._hitboxes(live);
    this._projectiles();
    this._zones();
    for (const f of this.fighters) if (live(f)) { f.combatant.tick(); f.tags.tick(); }
    for (const f of this.fighters) if (live(f)) this._move(f);
    this._late(live);
  }

  /** Enemies go for the nearest member of Rook's team, preferring Rook, and stick with a choice. */
  _enemyTarget(e) {
    let best = null, bestScore = Infinity;
    for (const f of this.fighters) {
      if (f.team === e.team || !f.alive || f.team === Team.Neutral) continue;
      let score = flatDistance(e.pos, f.pos);
      if (f === this.player) score -= Tuning.playerTargetBias;
      if (f === e.target) score -= 1; // stickiness
      if (score < bestScore) { bestScore = score; best = f; }
    }
    return best;
  }

  /** Who a companion should be fighting, by stance. */
  _companionTarget(c) {
    const p = this.player, stance = c.brain.stance;
    if (stance === "Press" && this.lockTarget?.alive) return this.lockTarget;
    let best = null, bestScore = Infinity;
    for (const e of this.fighters) {
      if (e.team !== Team.Enemy || !e.alive) continue;
      const fromLeader = flatDistance(p.pos, e.pos);
      let score = stance === "Press" ? flatDistance(c.pos, e.pos) : fromLeader;
      if (stance === "Guard" && e.target === p && e.runner.isRunning) score -= 6; // intercept attacks on Rook
      if (score < bestScore) { bestScore = score; best = e; }
    }
    return best;
  }

  _brains(frame, live) {
    for (const e of this.fighters) {
      if (!e.brain || !live(e)) continue;
      if (e.companion) { this._companionBrain(e, frame); continue; }
      if (e.boss && !e.boss.brainActive) { if (e.boss.state !== "toPolaris") { e.moveInput.x = 0; e.moveInput.z = 0; } continue; } // the controller has it
      const p = this._enemyTarget(e);
      e.target = p;
      const d = p ? flatDistance(e.pos, p.pos) : Infinity;
      const out = e.brain.think({
        frame, hasTarget: !!p, distance: d, isStaggered: e.combatant.isStaggered,
        isDead: !e.alive, abilityRunning: e.runner.isRunning,
      });
      if (!p) { e.moveInput.x = 0; e.moveInput.z = 0; continue; }
      const tx = (p.pos.x - e.pos.x) / (d || 1), tz = (p.pos.z - e.pos.z) / (d || 1);
      const mi = e.moveInput;
      switch (out.move) {
        case MoveIntent.Approach: mi.x = tx; mi.z = tz; break;
        case MoveIntent.Retreat: mi.x = -tx * 0.6; mi.z = -tz * 0.6; break;
        case MoveIntent.Circle: {
          const keep = d > 4 ? 0.4 : d < 2.6 ? -0.4 : 0;
          const s = (e.stats.circleSpeed / e.stats.runSpeed) * e.circleSign;
          mi.x = -tz * s + tx * keep; mi.z = tx * s + tz * keep;
          break;
        }
        default: mi.x = 0; mi.z = 0;
      }
      if (out.attack) {
        e.yaw = angleTo(e.pos, p.pos);
        if (e.controller.startDirect(out.attack, frame) !== StartResult.Started) e.brain.attackFailed();
      }
    }
  }

  _companionBrain(c, frame) {
    const p = this.player;
    const t = this._companionTarget(c);
    c.target = t;
    const leaderDistance = flatDistance(c.pos, p.pos);
    const threatened = this.fighters.some((e) => e.team === Team.Enemy && e.alive && e.target === p && e.runner.isRunning && flatDistance(e.pos, p.pos) < 4.5);
    const out = c.brain.think({
      frame, isDead: !c.alive, isStaggered: c.combatant.isStaggered, abilityRunning: c.runner.isRunning,
      leaderDistance, leaderHealth: p.alive ? p.combatant.health.normalized : 1, leaderThreatened: threatened,
      target: t ? { distance: flatDistance(c.pos, t.pos), distanceToLeader: flatDistance(p.pos, t.pos) } : null,
    });
    const mi = c.moveInput;
    mi.x = 0; mi.z = 0; c.faceMove = false;
    if (out.move === AllyMove.Follow && c.slot) {
      const s = Math.sin(p.yaw), co = Math.cos(p.yaw); // slot is (right, forward) in Rook's frame
      const gx = p.pos.x + co * c.slot[0] + s * c.slot[1], gz = p.pos.z - s * c.slot[0] + co * c.slot[1];
      const dx = gx - c.pos.x, dz = gz - c.pos.z, d = Math.hypot(dx, dz);
      if (d > 0.6) { const k = Math.min(1, d / 2); mi.x = (dx / d) * k; mi.z = (dz / d) * k; c.faceMove = true; }
    } else if (t && (out.move === AllyMove.Approach || out.move === AllyMove.Retreat)) {
      const d = flatDistance(c.pos, t.pos) || 1, sgn = out.move === AllyMove.Approach ? 1 : -0.6;
      mi.x = ((t.pos.x - c.pos.x) / d) * sgn; mi.z = ((t.pos.z - c.pos.z) / d) * sgn;
    }
    if (out.attack) {
      if (t && !out.support) c.yaw = angleTo(c.pos, t.pos);
      c.controller.startDirect(out.attack, frame);
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
        if (f.grounded && f.surge?.isFull && this.ultimate) o |= mask(Intent.Ultimate); // the ultimate cuts through anything
        f.controller.overrideMask = o;
        if (f.mana) f.mana.add(f.stats.manaRegenPerSecond * SECONDS_PER_TICK);
      }
      f.controller.tick(frame);
      c.superArmor = (f.traits.armoredAttacks && f.runner.isRunning) || f.tags.has("WARDED");
      if (f.kind === "player") {
        c.blocking = f.holdBlock && !f.runner.isRunning && f.grounded && c.canAct;
      }
      // AI fighters track their target through the wind-up, then commit.
      if (f.brain && f.target?.alive && f.runner.isRunning && f.runner.frame < f.current.startup - 4) {
        f.yaw = turn(f.yaw, angleTo(f.pos, f.target.pos), f.stats.turnRate);
      }
    }
  }

  _hitboxes(live) {
    for (const att of this.fighters) {
      if (!live(att) || !att.hitboxes.length) continue;
      for (const hb of att.hitboxes) {
        for (const def of this.fighters) {
          if (def === att || def.team === att.team || !def.alive || hb.hitSet.has(def)) continue;
          // Wind tears Hask out of the bog (mid-dive or from its mound); otherwise a submerged boss can't be touched.
          if (def.boss?.untouchable) {
            if (hb.ability.tags.includes("gust") && boxHitsCapsule(hb.def, att.pos, att.yaw, def.pos, def.stats.radius + 0.6, 2.5) && def.boss.uproot(att)) hb.hitSet.add(def);
            if (def.submerged) continue;
          }
          const grace = def.combatant.invulnerableFrames > 0 ? Tuning.nearMissGrace : 0;
          if (!boxHitsCapsule(hb.def, att.pos, att.yaw, def.pos, def.stats.radius + grace, def.stats.height)) continue;
          hb.hitSet.add(def);
          this._resolve(att, def, hb);
        }
      }
      // Sword vs bolt: Rook's team can cut enemy projectiles out of the air.
      if (att.team === Team.Player && this.projectiles.length) {
        for (const hb of att.hitboxes) {
          for (const p of this.projectiles) {
            if (p.team === att.team || p.dead) continue;
            if (boxHitsCapsule(hb.def, att.pos, att.yaw, { x: p.pos.x, y: p.pos.y - 0.35, z: p.pos.z }, 0.35, 0.7)) {
              p.dead = true;
              this.emit({ type: "deflect", projectile: p, by: att, at: { ...p.pos } });
            }
          }
        }
      }
      let keep = 0; // compact in place: no new array per frame
      for (const hb of att.hitboxes) if (--hb.frames > 0) att.hitboxes[keep++] = hb;
      att.hitboxes.length = keep;
    }
  }

  _projectiles() {
    const ps = this.projectiles;
    if (!ps.length) return;
    const dt = SECONDS_PER_TICK;
    for (const p of ps) {
      if (p.dead) continue;
      const scale = p.team === Team.Enemy ? (this.stopFrames > 0 ? 0 : this.slowFrames > 0 ? Tuning.afterimageScale : 1) : 1;
      if (scale === 0) continue; // frozen by a time stop
      p.pos.x += p.dir.x * p.speed * dt * scale; p.pos.y += p.dir.y * p.speed * dt * scale; p.pos.z += p.dir.z * p.speed * dt * scale;
      p.life -= scale;
      if (p.life <= 0 || p.pos.y < 0 || outOfBounds(p.pos, this.bounds)) { p.dead = true; continue; }
      for (const def of this.fighters) {
        if (def.team === p.team || !def.alive || p.hitSet.has(def) || def.submerged) continue;
        const grace = def.combatant.invulnerableFrames > 0 ? Tuning.nearMissGrace * 0.5 : 0;
        const r = p.def.size[0] / 2 + def.stats.radius + grace;
        const dx = def.pos.x - p.pos.x, dz = def.pos.z - p.pos.z;
        const below = def.pos.y - p.pos.y, above = p.pos.y - (def.pos.y + def.stats.height);
        const dy = below > 0 ? below : above > 0 ? above : 0;
        if (dx * dx + dz * dz + dy * dy > r * r) continue;
        p.hitSet.add(def);
        const outcome = this._resolve(p.owner, def, { def: p.def, spec: p.spec, ability: p.ability, hitSet: p.hitSet, origin: p.pos, projectile: true });
        if (outcome !== HitOutcome.Dodged && outcome !== HitOutcome.PerfectDodge) { p.dead = true; break; }
      }
    }
    if (ps.some((p) => p.dead)) {
      for (const p of ps) if (p.dead) this.emit({ type: "projectileEnd", projectile: p });
      this.projectiles = ps.filter((p) => !p.dead);
    }
  }

  _resolve(att, def, hb) {
    // Bastion Wall halves damage; a Cantor's ward takes 30% off.
    let spec = hb.spec;
    if (spec.damage > 0 && (def.tags.has("SHIELDED") || def.tags.has("WARDED"))) {
      spec = { ...spec, damage: spec.damage * (def.tags.has("SHIELDED") ? Tuning.shieldFactor : Tuning.wardFactor) };
    }
    const pd = att === this.player && hb.ability ? this.pageDmg[hb.ability.id] : 0;
    if (pd && pd !== 1) spec = { ...spec, damage: spec.damage * pd };
    if (att === this.player && (this.mods.attack || this.mods.posture)) spec = { ...spec, damage: spec.damage * (1 + this.mods.attack), posture: spec.posture * (1 + this.mods.posture) };
    if (def === this.player && this.mods.defense) spec = { ...spec, damage: spec.damage * (1 - this.mods.defense) };
    if (def.tags.has("EXPOSED")) { // Hask's soft underside, once the bog drains
      spec = { ...spec, damage: spec.damage * HASK_TUNING.exposedFactor, posture: spec.posture * HASK_TUNING.exposedFactor };
    }
    const from = hb.origin ?? att.pos;
    // Tower shields: blocks everything blockable from the front, unless bound by thread or mid-attack.
    if (def.traits.frontalGuard) {
      const d0 = flatDistance(from, def.pos) || 1, fw = def.forward;
      const facing = ((from.x - def.pos.x) * fw.x + (from.z - def.pos.z) * fw.z) / d0;
      def.combatant.blocking = facing > Tuning.guardArc && !def.runner.isRunning && def.combatant.canAct && !def.tags.has("BOUND");
    }
    const r = resolveHit(hb.projectile ? null : att.combatant, def.combatant, spec);
    if (def.traits.frontalGuard) def.combatant.blocking = false;
    const c = hb.origin ?? hitboxCenter(hb.def, att.pos, att.yaw);
    const at = { x: (c.x + def.pos.x) / 2, y: def.pos.y + 1.2, z: (c.z + def.pos.z) / 2 };
    const d = flatDistance(from, def.pos) || 1;
    const away = { x: (def.pos.x - from.x) / d, z: (def.pos.z - from.z) / d };
    const heavyBody = def.traits.heavy && !def.combatant.postureBroken; // can't be launched or dragged until broken
    const base = { attacker: att, defender: def, ability: hb.ability, spec, result: r, at };

    switch (r.outcome) {
      case HitOutcome.Hit: {
        if (!hb.projectile) { att.hitstop = Math.max(att.hitstop, r.attackerHitstop); att.runner.notifyHit(0); }
        def.hitstop = Math.max(def.hitstop, r.defenderHitstop);
        if (def.combatant.isStaggered && !def.combatant.superArmor) { def.runner.interrupt(); def.dash.frames = 0; }
        const kb = spec.knockback * Tuning.knockbackSpeed * (heavyBody ? Tuning.heavyKnockback : 1);
        def.knock.x += away.x * kb;
        def.knock.z += away.z * kb;
        const wasAirborne = !def.grounded;
        if (heavyBody) { /* rooted to the ground */ }
        else if (spec.launch > 0 && (att.grounded || hb.projectile)) { def.vel.y = spec.launch; def.grounded = false; }
        else if (att.slamming) { def.vel.y = -22; def.grounded = false; } // the slam spikes them down with Rook
        else if (!att.grounded && !hb.projectile) { // air hits keep the target at the attacker's height
          def.grounded = false;
          def.vel.y = Math.max(-6, Math.min(10, (att.pos.y + 0.15 - def.pos.y) * 6 + 1.8));
        } else if (!def.grounded) def.vel.y = Math.max(def.vel.y, 3);
        if (wasAirborne && !def.grounded) def.juggleHits++; // juggle decay: each air hit makes them fall faster
        if (!att.grounded && !att.slamming && !hb.projectile) att.vel.y = 1.5;
        if (att.team === Team.Player) {
          this.comboCount++; this.comboTimer = 120; // the combo counter belongs to the whole team
          if (att === this.player && att.mana && hb.ability.manaCost === 0) att.mana.add(Tuning.meleeManaGain); // melee feeds magic
          const share = att === this.player ? 1 : Tuning.companionSurgeShare;
          if (!hb.ability.surgeCost) this._surge(this.player.stats.surgeGain.dealt * r.healthDamage * share);
          if (att === this.player && hb.ability.manaCost > 0) this._pageXp(hb.ability);
        }
        if (spec !== hb.spec) this.emit({ type: "shieldBlock", defender: def, at });
        if (def === this.player) this._surge(def.stats.surgeGain.taken * r.healthDamage);
        if (def.alive) this._react(att, def, hb, at);
        if (spec.pull > 0 && !heavyBody) this._pull(att, def, spec.pull);
        if (def === this.player) { this.comboCount = 0; def.buffer.clear(); }
        this.emit({ type: "hit", ...base });
        if (r.defenderPostureBroken) this.emit({ type: "postureBreak", ...base });
        if (r.killed) {
          this.emit({ type: "kill", ...base });
          if (this.lockTarget === def) this.lockTarget = this.nearestEnemy(20, def); // the lock moves on
        }
        if (r.killed && def === this.player) this.emit({ type: "playerDown" });
        if (r.killed && def.companion) this.emit({ type: "allyDown", fighter: def });
        break;
      }
      case HitOutcome.Blocked:
        if (!hb.projectile) { att.hitstop = Math.max(att.hitstop, r.attackerHitstop); att.runner.notifyHit(0); }
        def.hitstop = Math.max(def.hitstop, r.defenderHitstop);
        def.knock.x += away.x * 0.8 * Tuning.knockbackSpeed; def.knock.z += away.z * 0.8 * Tuning.knockbackSpeed;
        if (r.defenderPostureBroken) def.runner.interrupt();
        this.emit({ type: "block", ...base });
        if (r.defenderPostureBroken) this.emit({ type: "guardBreak", ...base });
        break;
      case HitOutcome.Parried:
        def.hitstop = Math.max(def.hitstop, r.defenderHitstop);
        if (!hb.projectile) { // parrying a bolt just swats it away
          att.hitstop = Math.max(att.hitstop, r.attackerHitstop);
          att.runner.interrupt(); att.combatant.stagger(26);
          att.knock.x -= away.x * 1.2 * Tuning.knockbackSpeed; att.knock.z -= away.z * 1.2 * Tuning.knockbackSpeed;
        }
        if (def === this.player) { def.counterFrames = def.stats.counterWindowFrames; this._surge(def.stats.surgeGain.parry); }
        this.emit({ type: "parry", ...base });
        if (r.attackerPostureBroken) this.emit({ type: "postureBreak", ...base, defender: att });
        break;
      case HitOutcome.PerfectDodge:
        if (def === this.player) {
          def.counterFrames = def.stats.counterWindowFrames;
          this._surge(def.stats.surgeGain.perfectDodge);
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
    return r.outcome;
  }

  _surge(amount) {
    const s = this.player.surge;
    if (!s || amount <= 0 || !this.ultimate) return;
    amount *= 1 + this.mods.surge;
    const was = s.isFull;
    s.add(amount);
    if (!was && s.isFull) this.emit({ type: "surgeFull" });
  }

  /** Fire any reactions this hit triggers on `def`, then apply the hit's own tags. */
  _react(att, def, hb, at) {
    const spec = hb.spec;
    const incoming = new Set(hb.ability.tags);
    for (const [tag] of spec.applyTags) incoming.add(tag);
    if (!def.grounded) incoming.add("airborne");
    for (const row of matchReactions(REACTIONS, def.tags, incoming)) {
      if (row.consume) def.tags.remove(row.when);
      const fx = row.effect;
      const targets = [def];
      if (fx.radius > 0) {
        for (const o of this.fighters) {
          if (o !== def && o.team === def.team && o.alive && flatDistance(o.pos, def.pos) <= fx.radius) targets.push(o);
        }
      }
      for (const t of targets) {
        const c = t.combatant;
        if (fx.damage) c.takeDamage(fx.damage);
        const broke = fx.posture ? c.takePostureDamage(fx.posture) : false;
        if (fx.stagger) { c.stagger(fx.stagger); t.runner.interrupt(); }
        if (fx.launch && !(t.traits.heavy && !c.postureBroken)) { t.vel.y = fx.launch; t.grounded = false; }
        if (fx.hitstop) t.hitstop = Math.max(t.hitstop, fx.hitstop);
        if (broke) this.emit({ type: "postureBreak", attacker: att, defender: t, ability: hb.ability, spec, at: { x: t.pos.x, y: t.pos.y + 1.2, z: t.pos.z } });
        if (c.isDead) {
          this.emit({ type: "kill", attacker: att, defender: t, ability: hb.ability, spec, at });
          if (t.companion) this.emit({ type: "allyDown", fighter: t });
          if (this.lockTarget === t) this.lockTarget = this.nearestEnemy(20, t);
        }
      }
      if (fx.hitstop) att.hitstop = Math.max(att.hitstop, fx.hitstop);
      if (att.team === Team.Player) this._surge(this.player.stats.surgeGain.reaction);
      this.emit({ type: "reaction", reaction: row, attacker: att, defender: def, targets, at });
    }
    if (def.alive) for (const [tag, frames] of spec.applyTags) def.tags.add(tag, frames);
  }

  /** Drag a target to just in front of the attacker, at the attacker's height. */
  _pull(att, def, maxDistance) {
    const fwd = att.forward;
    const tx = att.pos.x + fwd.x * 1.4, tz = att.pos.z + fwd.z * 1.4;
    const dx = tx - def.pos.x, dz = tz - def.pos.z, d = Math.hypot(dx, dz);
    if (d > 0.01) {
      const move = Math.min(d, maxDistance);
      const speed = (move * (1 - Tuning.knockbackDecay)) / SECONDS_PER_TICK; // knock decays geometrically
      def.knock.x = (dx / d) * speed; def.knock.z = (dz / d) * speed;
    }
    if (!att.grounded || !def.grounded) {
      def.grounded = false;
      def.vel.y = Math.max(-6, Math.min(12, (att.pos.y - def.pos.y) * 5 + 2));
    }
  }

  _move(f) {
    const dt = SECONDS_PER_TICK;
    const busy = f.runner.isRunning;
    const canSteer = f.combatant.canAct && f.alive && (!busy || !f.grounded) && !f.tags.has("BOUND"); // threads hold you in place
    if (f.dash.frames > 0) {
      f.vel.x = f.dash.x; f.vel.z = f.dash.z; f.dash.frames--;
    } else if (canSteer) {
      const speed = f.stats.runSpeed * (f.combatant.blocking ? 0.4 : 1) * (f.grounded ? 1 : 0.6) * (f.tags.has("WEIGHTED") ? Tuning.weightedSpeed : 1);
      const k = f.grounded ? 0.35 : 0.12;
      f.vel.x += (f.moveInput.x * speed - f.vel.x) * k;
      f.vel.z += (f.moveInput.z * speed - f.vel.z) * k;
      const mag = Math.hypot(f.moveInput.x, f.moveInput.z);
      if (f.kind === "player" && mag > 0.15 && !busy) f.yaw = turn(f.yaw, Math.atan2(f.moveInput.x, f.moveInput.z), f.stats.turnRate);
      if (f.brain && f.alive) {
        if (f.faceMove && mag > 0.15) f.yaw = turn(f.yaw, Math.atan2(f.moveInput.x, f.moveInput.z), f.stats.turnRate);
        else if (f.target?.alive) f.yaw = turn(f.yaw, angleTo(f.pos, f.target.pos), f.stats.turnRate);
      }
    } else if (f.grounded) {
      f.vel.x *= 0.6; f.vel.z *= 0.6;
    }

    f.pos.x += (f.vel.x + f.knock.x) * dt;
    f.pos.z += (f.vel.z + f.knock.z) * dt;
    f.knock.x *= Tuning.knockbackDecay; f.knock.z *= Tuning.knockbackDecay;

    if (!f.grounded) {
      const juggled = f.combatant.isStaggered && f.team === Team.Enemy;
      const airAttack = f.runner.isRunning && hangs(f.current);
      const decay = Math.min(Tuning.juggleDecayMax, 1 + Tuning.juggleDecay * f.juggleHits);
      let g = f.slamming ? 0 : airAttack ? Tuning.airAttackGravity : juggled ? Tuning.juggleGravity * decay : Tuning.gravity;
      if (f.hoverFrames > 0) { f.hoverFrames--; f.vel.y = 0; g = 0; } // air dash flies flat
      f.vel.y -= g * dt;
      f.pos.y += f.vel.y * dt;
      if (f.pos.y <= 0) {
        f.pos.y = 0; f.vel.y = 0; f.grounded = true;
        f.airJumps = 1; f.airDashes = 1; f.hoverFrames = 0; f.juggleHits = 0;
        const slam = f.slamming; f.slamming = false;
        if (f.runner.isRunning && AIR.has(f.current.id)) f.runner.interrupt();
        this.emit({ type: slam ? "slamLand" : "land", fighter: f });
      }
    }
  }

  _late(live) {
    // Keep bodies apart and inside the arena.
    const fs = this.fighters;
    for (let i = 0; i < fs.length; i++) {
      if (!fs[i].alive || fs[i].submerged) continue;
      for (let j = i + 1; j < fs.length; j++) {
        const a = fs[i], b = fs[j];
        if (!b.alive || b.submerged) continue;
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
      constrain(f.pos, f.stats.radius, this.bounds);
      if (!live(f)) continue;
      if (f.afterDashFrames > 0) f.afterDashFrames--;
      if (f.counterFrames > 0) f.counterFrames--;
      if (!f.alive) f.deadFrames++;
      // Downed companions get back up (no permanent losses mid-fight).
      if (f.companion && !f.alive && f.deadFrames >= f.stats.reviveFrames) {
        f.combatant.reset(); f.combatant.health.set(f.combatant.health.max * 0.5); f.deadFrames = 0; f.tags.clear();
        this.emit({ type: "allyRevive", fighter: f });
      }
    }
    if (this.comboTimer > 0 && --this.comboTimer === 0) this.comboCount = 0;

    // Bodies fade, then the wave can end.
    if (!this.fighters.some((f) => f.team === Team.Enemy && f.deadFrames > Tuning.corpseFrames)) return;
    const gone = this.fighters.filter((f) => f.team === Team.Enemy && f.deadFrames > Tuning.corpseFrames);
    {
      for (const f of gone) this.emit({ type: "despawn", fighter: f });
      this.fighters = this.fighters.filter((f) => !gone.includes(f));
      if (!this.enemies.length) this.emit({ type: "waveClear", wave: this.wave });
    }
  }
}
