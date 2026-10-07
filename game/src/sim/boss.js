// Boss controllers: scripted phase logic layered on top of the normal enemy brain.
// The brain still picks Hask's surfaced attacks; this decides when it dives, burrows, erupts,
// calls the pack, and when the bog drains.

import { EnemyBrain } from "../core/ai.js";
import { EventType } from "../core/abilities.js";
import { HASK_ABILITIES, HASK_PHASES, HASK_TUNING, haskOptions } from "../data/hask.js";
import { CAL_ABILITIES, CAL_TUNING } from "../data/cal.js";
import { SEVERIN_ABILITIES, SEVERIN_PHASES, SEVERIN_TUNING, severinOptions } from "../data/severin.js";

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class HaskController {
  constructor(world, f) {
    this.world = world;
    this.f = f;
    this.phase = 1;
    this.state = "surface";       // surface → diving → submerged → warning → erupting → surface
    this.timer = HASK_PHASES[0].diveEvery;
    this.waveTimer = 0;
    this.summoned = false;
    this.mound = { x: f.pos.x, z: f.pos.z };
    this.eruptAt = null;
  }

  get rules() { return HASK_PHASES[this.phase - 1]; }
  get brainActive() { return this.state === "surface"; }
  get untouchable() { return this.state !== "surface" && this.state !== "erupting"; }

  /** Called once per logic frame Hask ticks, after brains and before abilities. */
  tick() {
    const w = this.world, f = this.f;
    if (!f.alive) return;
    // Phase changes by health.
    const hp = f.combatant.health.normalized;
    const next = HASK_PHASES.find((p) => hp > p.above)?.phase ?? 3;
    if (next > this.phase) this._enterPhase(next);

    switch (this.state) {
      case "surface":
        if (this.rules.summon && !this.summoned && !f.runner.isRunning && f.combatant.canAct && f.grounded) {
          this.summoned = true; // P2 opener: a roar that calls the pack out of the bog
          f.controller.startDirect(HASK_ABILITIES.Roar, w.frame);
          break;
        }
        if (this.rules.diveEvery && !f.runner.isRunning && f.combatant.canAct && f.grounded && --this.timer <= 0) {
          f.controller.startDirect(HASK_ABILITIES.Dive, w.frame);
          this.state = "diving";
        }
        break;
      case "diving":
        if (!f.runner.isRunning && !f.submerged) this._surface(); // interrupted (uprooted) before going under
        break;
      case "submerged": {
        const t = f.target?.alive ? f.target : w.player;
        const d = flat(this.mound, t.pos);
        const step = (HASK_TUNING.burrowSpeed / 60) * f.timeScale;
        if (d > 0.5) { this.mound.x += ((t.pos.x - this.mound.x) / d) * step; this.mound.z += ((t.pos.z - this.mound.z) / d) * step; }
        f.pos.x = this.mound.x; f.pos.z = this.mound.z;
        if (--this.waveTimer <= 0) { this._mudWaves(t); this.waveTimer = HASK_TUNING.waveEvery; }
        this.under++;
        if (--this.timer <= 0 || (d < 1.2 && this.under > HASK_TUNING.minUnderFrames)) { // always surfaces under its target, never instantly
          this.state = "warning"; this.timer = HASK_TUNING.warnFrames;
          this.eruptAt = { x: t.pos.x, z: t.pos.z };
          w.emit({ type: "eruptWarning", fighter: f, at: { ...this.eruptAt, y: 0 }, frames: HASK_TUNING.warnFrames });
        }
        break;
      }
      case "warning":
        if (--this.timer <= 0) {
          f.submerged = false;
          f.pos.x = this.eruptAt.x; f.pos.z = this.eruptAt.z; f.prev.x = f.pos.x; f.prev.z = f.pos.z;
          f.yaw = Math.atan2(w.player.pos.x - f.pos.x, w.player.pos.z - f.pos.z);
          f.controller.startDirect(HASK_ABILITIES.Erupt, w.frame);
          w.emit({ type: "surface", fighter: f });
          this.state = "erupting";
        }
        break;
      case "erupting":
        if (!f.runner.isRunning) this._surface();
        break;
      default: break;
    }
  }

  /** The Dive ability's last frame: Hask goes under. */
  submerge() {
    const f = this.f;
    f.submerged = true;
    f.combatant.staggerFrames = 0;
    this.mound = { x: f.pos.x, z: f.pos.z };
    this.state = "submerged";
    this.timer = HASK_TUNING.submergedFrames;
    this.waveTimer = 20;
    this.under = 0;
    this.world.emit({ type: "submerge", fighter: f });
  }

  /** Wind on the mound (or mid-dive): torn out of the bog and stunned. */
  uproot(by) {
    const f = this.f, w = this.world;
    if (this.state !== "submerged" && this.state !== "diving" && this.state !== "warning") return false;
    f.submerged = false;
    f.runner.interrupt();
    f.pos.x = this.mound.x; f.pos.z = this.mound.z; f.prev.x = f.pos.x; f.prev.z = f.pos.z;
    f.vel.y = HASK_TUNING.uprootLaunch; f.grounded = false;
    const broke = f.combatant.takePostureDamage(HASK_TUNING.uprootPosture);
    f.combatant.stagger(HASK_TUNING.uprootStagger);
    this._surface();
    w.emit({ type: "uprooted", fighter: f, by, at: { x: f.pos.x, y: 1.5, z: f.pos.z } });
    if (broke) w.emit({ type: "postureBreak", attacker: by, defender: f, ability: null, at: { x: f.pos.x, y: 1.5, z: f.pos.z } });
    return true;
  }

  _surface() {
    this.state = "surface";
    this.timer = this.rules.diveEvery || Infinity;
    this.eruptAt = null;
  }

  _mudWaves(t) {
    const w = this.world, f = this.f;
    const n = this.rules.waves || 1;
    const base = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
    for (let i = 0; i < n; i++) {
      const a = base + (i - (n - 1) / 2) * 0.45;
      f.yaw = a;
      w.fireProjectile(f, HASK_ABILITIES.Dive, "Wave", 9, { x: Math.sin(a), y: 0, z: Math.cos(a) });
    }
  }

  _enterPhase(p) {
    const w = this.world, f = this.f;
    this.phase = p;
    f.brain = new EnemyBrain(f.id, f.brain.pool, haskOptions(p), w.rng);
    f.brain.aggroRange = 40;
    if (this.rules.drained) {
      if (f.submerged) { f.submerged = false; f.pos.x = this.mound.x; f.pos.z = this.mound.z; }
      f.tags.add("EXPOSED", 1e9);
    }
    if (this.state === "surface") this.timer = this.rules.diveEvery || Infinity;
    w.emit({ type: "bossPhase", fighter: f, phase: p, drained: !!this.rules.drained });
  }
}

// ---- Severin Valcourt (Episode 2) -----------------------------------------------------------

/** Distance on the ground from p to the segment a→b. */
const segDist = (a, b, p) => {
  const dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / L));
  return { d: Math.hypot(a.x + dx * t - p.x, a.z + dz * t - p.z), x: a.x + dx * t, z: a.z + dz * t };
};

export class SeverinController {
  constructor(world, f) {
    this.world = world;
    this.f = f;
    this.phase = 1;
    this.state = "duel";          // duel → toPolaris → casting → anchored → (knocked off) → duel …
    this.polaris = { x: f.pos.x, z: f.pos.z };
    this.stars = []; this.lines = [];
    this.timer = 0; this.pulse = 0; this.warn = 0; this.active = 0;
    this.hitSet = new Set();
  }

  get brainActive() { return this.state === "duel" || this.state === "anchored"; }
  get untouchable() { return false; }

  tick() {
    const w = this.world, f = this.f, T = SEVERIN_TUNING;
    if (!f.alive) { if (this.stars.length) this._clearStars(false); return; }
    const hp = f.combatant.health.normalized;
    const next = SEVERIN_PHASES.find((p) => hp > p.above)?.phase ?? 2;
    if (next > this.phase) this._enterPhase(next);

    switch (this.state) {
      case "duel":
        if (this.phase >= 2 && --this.timer <= 0) this.state = "toPolaris";
        break;
      case "toPolaris": {
        const d = flat(f.pos, this.polaris);
        if (d > 0.6) {
          f.moveInput.x = (this.polaris.x - f.pos.x) / d; f.moveInput.z = (this.polaris.z - f.pos.z) / d;
        } else {
          f.moveInput.x = f.moveInput.z = 0;
          if (!f.runner.isRunning && f.combatant.canAct && f.grounded) {
            f.yaw = Math.atan2(w.player.pos.x - f.pos.x, w.player.pos.z - f.pos.z);
            f.controller.startDirect(SEVERIN_ABILITIES.PlaceStars, w.frame);
            this.state = "casting";
          }
        }
        break;
      }
      case "casting":
        f.moveInput.x = f.moveInput.z = 0;
        if (!f.runner.isRunning && !this.stars.length) this.state = "toPolaris"; // interrupted: try again
        break;
      case "anchored": {
        f.moveInput.x = f.moveInput.z = 0; // he holds his point and fights from it
        if (flat(f.pos, this.polaris) > T.offPolaris || !f.grounded || f.combatant.postureBroken) { this._dim(); break; }
        if (this.warn > 0) {
          if (--this.warn === 0) { this.active = T.activeFrames; this.hitSet = new Set(); w.emit({ type: "starStrike", fighter: f, lines: this.lines }); }
        } else if (this.active > 0) {
          this.active--;
          this._strike();
        } else if (--this.pulse <= 0) {
          this.pulse = T.pulseEvery; this.warn = T.warnFrames;
          w.emit({ type: "starWarn", fighter: f, lines: this.lines, frames: T.warnFrames });
        }
        break;
      }
      default: break;
    }
  }

  /** The PlaceStars move lands: a ring of stars around Polaris, joined as a five-pointed constellation. */
  placeStars() {
    const T = SEVERIN_TUNING, P = this.polaris, w = this.world;
    const spin = w.rng() * Math.PI * 2;
    this.stars = Array.from({ length: T.starCount }, (_, i) => {
      const a = spin + (i / T.starCount) * Math.PI * 2;
      return { x: P.x + Math.sin(a) * T.starRadius, z: P.z + Math.cos(a) * T.starRadius };
    });
    const n = this.stars.length;
    this.lines = this.stars.map((s, i) => ({ a: s, b: this.stars[(i + 2) % n] }));
    this.state = "anchored";
    this.pulse = 70; this.warn = 0; this.active = 0;
    w.emit({ type: "starsPlaced", fighter: this.f, stars: this.stars, lines: this.lines, polaris: P });
  }

  _strike() {
    const w = this.world, T = SEVERIN_TUNING;
    for (const t of w.fighters) {
      if (t.team === this.f.team || !t.alive || this.hitSet.has(t) || t.pos.y > T.lineHeight) continue;
      for (const L of this.lines) {
        const s = segDist(L.a, L.b, t.pos);
        if (s.d > T.lineWidth + t.stats.radius) continue;
        this.hitSet.add(t);
        w._resolve(this.f, t, { def: null, spec: T.line, ability: SEVERIN_ABILITIES.PlaceStars, hitSet: this.hitSet, origin: { x: s.x, y: 0.5, z: s.z }, projectile: true });
        break;
      }
    }
  }

  _dim() {
    const f = this.f, w = this.world, T = SEVERIN_TUNING;
    this._clearStars(true);
    f.runner.interrupt();
    const broke = f.combatant.takePostureDamage(T.dimPosture);
    f.combatant.stagger(T.dimStagger);
    this.state = "duel"; this.timer = T.relightAfter;
    if (broke) w.emit({ type: "postureBreak", attacker: w.player, defender: f, ability: null, at: { x: f.pos.x, y: 1.4, z: f.pos.z } });
  }

  _clearStars(dimmed) {
    this.stars = []; this.lines = []; this.warn = this.active = 0;
    this.world.emit({ type: "starsDim", fighter: this.f, dimmed });
  }

  _enterPhase(p) {
    const w = this.world, f = this.f;
    this.phase = p;
    f.brain = new EnemyBrain(f.id, f.brain.pool, severinOptions(p), w.rng);
    f.brain.aggroRange = 40;
    if (SEVERIN_PHASES[p - 1].stars) { this.state = "toPolaris"; f.runner.interrupt(); }
    w.emit({ type: "bossPhase", fighter: f, phase: p });
  }
}

// ---- Sparring partner (Episode 3) ------------------------------------------------------------
export class SparController {
  constructor(world, f) {
    this.world = world; this.f = f;
    this.phase = 1; this.state = "spar"; this.cooldown = 60; this.step = 0;
  }
  get brainActive() { return true; }
  get untouchable() { return false; }
  tick() {
    const w = this.world, f = this.f, p = w.player, T = CAL_TUNING;
    if (!f.alive) return;
    if (this.cooldown > 0) { this.cooldown--; return; }
    const attacking = p.runner.isRunning && p.current && (p.current.hasHit || p.current.events.some((e) => e.type === EventType.SpawnHitbox));
    if (!attacking || flat(p.pos, f.pos) > T.evadeRange || f.runner.isRunning || !f.combatant.canAct || !f.grounded) return;
    f.yaw = Math.atan2(p.pos.x - f.pos.x, p.pos.z - f.pos.z);
    f.controller.startDirect(CAL_ABILITIES[T.pattern[this.step % T.pattern.length]], w.frame);
    this.step++;
    this.cooldown = T.evadeCooldown;
  }
}

// ---- Arc 1–2 bosses (data/bosses2.js) --------------------------------------------------------------
import { ILSE_ABILITIES, ILSE_PHASES, ILSE_TUNING, ilseOptions, GALEN_ABILITIES, GALEN_PHASES, GALEN_TUNING, galenOptions,
  MAGISTRATE_ABILITIES, MAGISTRATE_PHASES, MAGISTRATE_TUNING, magistrateOptions } from "../data/bosses2.js";

/** Shared phase plumbing: a new brain per phase, objects to clear when the boss falls. */
class PhasedBoss {
  constructor(world, f, phases, options) {
    this.world = world; this.f = f; this.phases = phases; this.options = options;
    this.phase = 1; this.objects = []; this.damageFactor = 1; this.postureFactor = 1;
    this.home = { x: f.pos.x, z: f.pos.z };
  }
  get brainActive() { return true; }
  get untouchable() { return false; }
  get rules() { return this.phases[this.phase - 1]; }
  _checkPhase() {
    const hp = this.f.combatant.health.normalized;
    const next = this.phases.find((p) => hp > p.above)?.phase ?? this.phases.length;
    if (next > this.phase) {
      this.phase = next;
      this.f.brain = new EnemyBrain(this.f.id, this.f.brain.pool, this.options(next), this.world.rng);
      this.f.brain.aggroRange = 40;
      this.world.emit({ type: "bossPhase", fighter: this.f, phase: next });
      this.enterPhase?.(next);
    }
  }
  _ring(n, r, kind) { // objects in a ring around where the fight started
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.5;
      out.push(this.world.spawnObject(kind, this.home.x + Math.sin(a) * r, this.home.z + Math.cos(a) * r, this.f));
    }
    this.objects.push(...out);
    return out;
  }
  _clearObjects() { for (const o of this.objects) if (o.alive) o.combatant.health.set(0); this.objects = []; }
  _cogFan(key, count, spread, a) { this.world.fireFan(this.f, a, key, 13, count, spread); }
  tick() {
    if (!this.f.alive) { if (this.objects.length) this._clearObjects(); this.world.silenceAll = false; this.world.dodgeHush = 0; return; }
    this._checkPhase();
    this.step?.();
  }
}

export class IlseController extends PhasedBoss {
  constructor(world, f) { super(world, f, ILSE_PHASES, ilseOptions); this.hushTimer = ILSE_TUNING.hushEvery; this.warn = 0; this.acolytes = []; }
  onCustom(key, value, a) {
    const w = this.world, f = this.f, T = ILSE_TUNING;
    if (key === "psalm") { this._cogFan("Bolt", value, 0.3, a); return true; }
    if (key === "hush") { const t = f.target?.alive ? f.target : w.player; w.addSilence(t.pos.x, t.pos.z, T.hushRadius, value); return true; }
    if (key === "toll") { w.addWave(f, f.pos.x, f.pos.z, { speed: 7, maxR: value + 2, width: T.tollWidth, spec: T.toll, ability: a, kind: "toll" }); return true; }
    return false;
  }
  enterPhase(p) {
    const w = this.world, f = this.f;
    if (p === 2) { // two acolytes from the choir pit; she's warded while they stand
      this.acolytes = [0, 1].map((i) => w.spawnEnemy("acolyte", f.pos.x + (i ? 3 : -3), f.pos.z + 1.5, 70 + i));
      f.tags.add("WARDED", 99999);
      w.emit({ type: "summon", fighter: f, summoned: this.acolytes });
    }
    if (p === 3) { // the bells: silence everywhere, and she's shielded, until they break
      f.tags.remove("WARDED");
      this._ring(3, ILSE_TUNING.bellRadius, "bell");
      w.silenceAll = true; this.damageFactor = ILSE_TUNING.bellShield; this.postureFactor = ILSE_TUNING.bellShield;
      w.emit({ type: "bells", fighter: f });
    }
  }
  step() {
    const w = this.world, f = this.f, T = ILSE_TUNING;
    if (this.phase === 2 && f.tags.has("WARDED") && this.acolytes.every((e) => !e.alive)) { f.tags.remove("WARDED"); w.emit({ type: "wardBroken", fighter: f }); }
    if (this.phase >= 3 && w.silenceAll && this.objects.every((o) => !o.alive)) { // the last bell falls silent
      w.silenceAll = false; this.damageFactor = this.postureFactor = 1; this.objects = [];
      f.runner.interrupt(); f.combatant.stagger(150);
      w.emit({ type: "bellsBroken", fighter: f });
    }
    if (this.rules.hushDodge) {
      if (this.warn > 0) { if (--this.warn === 0) { w.dodgeHush = T.hushFrames; w.emit({ type: "hushDodge", fighter: f, frames: T.hushFrames }); } }
      else if (w.dodgeHush <= 0 && --this.hushTimer <= 0) { this.hushTimer = T.hushEvery; this.warn = T.hushWarn; w.emit({ type: "hushWarn", fighter: f, frames: T.hushWarn }); }
    }
  }
}

export class GalenController extends PhasedBoss {
  constructor(world, f) { super(world, f, GALEN_PHASES, galenOptions); this.oath = false; this.chargeTimer = 0; }
  onCustom(key, value, a) {
    const w = this.world, f = this.f, T = GALEN_TUNING;
    if (key === "rot") { w.addWave(f, f.pos.x, f.pos.z, { speed: T.rotSpeed, maxR: value, width: T.rotWidth, spec: T.rot, ability: a, kind: "rot" }); return true; }
    return false;
  }
  enterPhase(p) {
    const w = this.world, f = this.f;
    if (p === 2) f.traits = { ...f.traits, frontalGuard: false }; // the shield rots through: no more wall in front
    if (p === 3) { // the Oath: immune to stagger and posture until the vow-seals break
      this._ring(3, GALEN_TUNING.sealRadius, "seal");
      this.oath = true; this.postureFactor = 0;
      w.emit({ type: "oath", fighter: f });
    }
    if (p === 4) { this.chargeTimer = 30; w.emit({ type: "desperate", fighter: f }); }
  }
  step() {
    const w = this.world, f = this.f, T = GALEN_TUNING;
    if (this.oath) {
      if (this.objects.every((o) => !o.alive)) { // the vow breaks: he reels
        this.oath = false; this.postureFactor = 1; this.objects = []; f.combatant.superArmor = false;
        f.runner.interrupt(); f.combatant.stagger(T.sealStagger); f.combatant.takePostureDamage(f.combatant.posture.max);
        w.emit({ type: "oathBroken", fighter: f, at: { x: f.pos.x, y: 1.4, z: f.pos.z } });
      }
    }
    if (this.rules.desperate && !f.runner.isRunning && f.combatant.canAct && f.grounded && --this.chargeTimer <= 0) {
      this.chargeTimer = T.chargeEvery;
      f.yaw = Math.atan2(w.player.pos.x - f.pos.x, w.player.pos.z - f.pos.z);
      f.controller.startDirect(GALEN_ABILITIES.Charge, w.frame);
    }
  }
}

export class MagistrateController extends PhasedBoss {
  constructor(world, f) { super(world, f, MAGISTRATE_PHASES, magistrateOptions); this.hand = null; this.started = false; this.sentenced = false; }
  onCustom(key, value, a) {
    const w = this.world, f = this.f, T = MAGISTRATE_TUNING;
    if (key === "cogs") { this._cogFan("Cog", value, 0.22, a); return true; }
    if (key === "gavel") { const fw = f.forward; w.addWave(f, f.pos.x + fw.x * 1.8, f.pos.z + fw.z * 1.8, { speed: 8, maxR: value + 1, width: 0.7, spec: T.gavelRing, ability: a, kind: "gavel" }); return true; }
    return false;
  }
  enterPhase(p) {
    const w = this.world, T = MAGISTRATE_TUNING;
    if (p === 2) { this.hand = { angle: 0, warn: T.handWarn, hitSet: new Map() }; w.emit({ type: "courtInSession", fighter: this.f, hand: this.hand, center: this.home, length: T.handLength }); }
    if (p === 3 && !this.sentenced) { // the sentence: an ally in a cage, or new turrets if you came alone
      this.sentenced = true;
      const ally = w.companions.find((c) => c.alive) ?? null;
      if (ally) { const cage = w.spawnObject("cage", ally.pos.x, ally.pos.z, this.f); this.objects.push(cage); ally.caged = cage; w.emit({ type: "sentence", fighter: this.f, target: ally, cage }); }
      else { this._ring(2, T.turretRadius, "turret"); w.emit({ type: "sentence", fighter: this.f, target: null }); }
    }
  }
  step() {
    const w = this.world, f = this.f, T = MAGISTRATE_TUNING;
    if (!this.started) { this.started = true; this._ring(this.rules.turrets ?? 2, T.turretRadius, "turret"); }
    const h = this.hand;
    if (!h) return;
    if (h.warn > 0) { h.warn--; return; }
    h.angle += T.handSpeed * f.timeScale; // the great hand of the clock sweeps the floor
    const c = this.home, dx = Math.sin(h.angle), dz = Math.cos(h.angle);
    for (const t of w.fighters) {
      if (t.team === f.team || !t.alive || t.pos.y > T.handHeight) continue;
      const rx = t.pos.x - c.x, rz = t.pos.z - c.z, along = rx * dx + rz * dz;
      if (along < 0 || along > T.handLength) continue;
      if (Math.abs(rx * dz - rz * dx) > T.handWidth + t.stats.radius) continue;
      if ((h.hitSet.get(t) ?? -1e9) > w.frame - 60) continue; // once a second at most
      h.hitSet.set(t, w.frame);
      w._resolve(f, t, { spec: T.hand, ability: MAGISTRATE_ABILITIES.Sweep, hitSet: new Set(), origin: { x: c.x + dx * along, y: 0.5, z: c.z + dz * along }, projectile: true });
    }
  }
}
