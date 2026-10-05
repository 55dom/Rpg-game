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
