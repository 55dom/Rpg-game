// The masked knight's controller (data/masked.js, Boss 9). The black tears he steps through, the floor he
// opens under you, the room's mouths that loop back into it, the line that cuts the room in two, and the
// moment he leaves with what he came for. While he's inside a tear he's `submerged`: nothing touches him,
// and the view hides him (riftwalk).

import { PhasedBoss } from "./boss.js";
import { constrain } from "./bounds.js";
import { EventType } from "../core/abilities.js";
import { MASKED_ABILITIES, MASKED_PHASES, MASKED_TUNING, UNDERCUT, maskedOptions, MASKED_VI_PHASES, MASKED_VI_TUNING, RING_CUT, maskedVIOptions } from "../data/masked.js";

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class MaskedController extends PhasedBoss {
  constructor(world, f, phases = MASKED_PHASES, options = maskedOptions) {
    super(world, f, phases, options);
    const T = MASKED_TUNING;
    this.exit = null; this.exposed = 0; this.left = false;
    this.evade = { cooldown: 60, step: 0 };
    this.mouths = null; this.line = null; this.lineUsed = false;
    this.tearMoves = new Set(["Sever", "Chain"]); // moves that go through a tear and come out again
    f.combatant.floor = Math.ceil(f.stats.maxHealth * T.leaveAt); // this fight can't finish him
  }

  get brainActive() { return !this.f.submerged && !this.left && !this.pendingLine; } // the Sever Line waits for nothing else
  get untouchable() { return this.f.submerged; }
  get armored() { return this.f.runner.current?.id === "SeverLine"; } // once he starts the cut, nothing stops it

  /** The middle of the room: the arena's centre when it's round, else where the fight started. */
  center() { return this.world.bounds.radius != null ? { x: 0, z: 0 } : this.home; }

  _target() { const t = this.f.target; return t?.alive ? t : this.world.player; }
  _tear(at, role) { this.world.emit({ type: "severOpen", fighter: this.f, at: { x: at.x, y: 0, z: at.z }, role }); }

  onCustom(key, value = 0) {
    const w = this.world, f = this.f, T = MASKED_TUNING;
    if (key === "severOut") { // into a black tear: gone
      this._tear(f.pos, "out");
      f.submerged = true; f.dash.frames = 0; f.knock.x = f.knock.z = 0;
      this.exit = null;
      return true;
    }
    if (key === "severMark") { // the way back opens at his target's left (or, chained: the right, then behind)
      const t = this._target(), fw = t.forward, side = value === 1 ? -1 : 1;
      this.exit = value === 2 ? constrain({ x: t.pos.x - fw.x * T.flank, z: t.pos.z - fw.z * T.flank }, f.stats.radius + 0.3, w.bounds)
        : constrain({ x: t.pos.x - fw.z * T.flank * side, z: t.pos.z + fw.x * T.flank * side }, f.stats.radius + 0.3, w.bounds);
      this._tear(this.exit, "mark");
      return true;
    }
    if (key === "severIn") { this._emerge(true); return true; }
    if (key === "undercut") {
      const t = this._target();
      this._undercut(t);
      if (this.phase >= 3) { // later, a squadmate's feet too
        const mate = w.fighters.find((c) => c.team !== f.team && c !== t && c.alive && !c.traits.object && !c.traits.dummy);
        if (mate) this._undercut(mate);
      }
      return true;
    }
    if (key === "severLine") { this._severLine(); return true; }
    return false;
  }

  _undercut(t) {
    const T = MASKED_TUNING;
    this.world.addStrike(this.f, t.pos.x, t.pos.z, { delay: T.undercutDelay, r: T.undercutRadius, spec: T.undercut, ability: UNDERCUT,
      kind: "sever", lift: T.dropHeight, landing: T.hardLanding });
  }

  /** Out of the exit tear, facing his target. The tear stays open a moment: that's the opening. */
  _emerge(cut) {
    const f = this.f, t = this._target(), at = this.exit ?? f.pos, T = MASKED_TUNING;
    f.pos.x = f.prev.x = at.x; f.pos.z = f.prev.z = at.z;
    f.yaw = f.prevYaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
    f.submerged = false;
    this._tear(f.pos, "in");
    this.exit = null;
    if (cut) {
      this.exposed = T.exposed; this.damageFactor = T.exposedDamage; this.postureFactor = T.exposedPosture;
      this.world.emit({ type: "severExposed", fighter: f, frames: T.exposed });
    }
  }

  /** P4: one cut across the room. It stands between Rook and the nearest squadmate for a few seconds. */
  _severLine() {
    const w = this.world, p = w.player, T = MASKED_TUNING.line;
    const mate = w.companions.filter((c) => c.alive).sort((a, b) => flat(a.pos, p.pos) - flat(b.pos, p.pos))[0];
    const a = p.pos, b = mate ? mate.pos : this.f.pos;
    let dx = b.x - a.x, dz = b.z - a.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.5) { dx = Math.sin(this.f.yaw); dz = Math.cos(this.f.yaw); } else { dx /= d; dz /= d; }
    const mid = d < 0.5 ? { x: a.x + dx * 1.5, z: a.z + dz * 1.5 } : { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    const dir = { x: -dz, z: dx }; // the line runs across the gap between them
    const solids = [];
    for (let s = -T.halfLength; s <= T.halfLength; s += T.spacing) solids.push({ circle: [mid.x + dir.x * s, mid.z + dir.z * s, T.radius] });
    this.line = { frames: T.frames, mid, dir, solids, before: w.bounds, isolated: mate ?? null };
    w.bounds = { ...w.bounds, solids: [...(w.bounds.solids ?? []), ...solids] };
    this.lineUsed = true;
    w.emit({ type: "severLine", fighter: this.f, mid, dir, halfLength: T.halfLength, frames: T.frames, isolated: mate ?? null });
  }

  _closeLine() {
    if (!this.line) return;
    this.world.bounds = this.line.before;
    this.world.emit({ type: "severLineClose", fighter: this.f });
    this.line = null;
  }

  enterPhase(p) {
    const w = this.world, f = this.f, T = MASKED_TUNING;
    if (p === 3) { // the room's four mouths (the diagonals) open into tears that loop back
      const c = this.center();
      this.mouths = [0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return { x: c.x + Math.sin(a) * T.mouths, z: c.z + Math.cos(a) * T.mouths };
      });
      this.loopCool = new Map();
      w.emit({ type: "severMouths", fighter: f, mouths: this.mouths });
    }
    if (p === 4 && !this.lineUsed) this.pendingLine = true; // the hidden move: as soon as he's free
    if (p === 5) this.leave();
  }

  /** At 25% he takes what he came for and steps out through a tear that closes behind him. The fight is won. */
  leave() {
    if (this.left) return;
    const w = this.world, f = this.f;
    this.left = true;
    if (f.submerged) this._emerge(false);
    this._closeLine();
    f.runner.interrupt();
    w.strikes = w.strikes.filter((s) => s.owner !== f);
    w.emit({ type: "severLeave", fighter: f, at: { x: f.pos.x, y: 0, z: f.pos.z }, mouths: this.mouths });
    this.mouths = null;
    f.vanished = true;
    f.combatant.floor = 0;
    f.combatant.health.set(0);
  }

  /** Swing at him up close and he steps aside: left, left, then back. Always in that order. */
  _evade() {
    const w = this.world, f = this.f, p = w.player, T = MASKED_TUNING, e = this.evade;
    if (e.cooldown > 0) { e.cooldown--; return; }
    const swinging = p.runner.isRunning && p.current && p.current.events.some((x) => x.type === EventType.SpawnHitbox);
    if (!swinging || flat(p.pos, f.pos) > T.evadeRange || f.runner.isRunning || !f.combatant.canAct || !f.grounded || f.submerged) return;
    f.yaw = Math.atan2(p.pos.x - f.pos.x, p.pos.z - f.pos.z);
    f.controller.startDirect(MASKED_ABILITIES[T.pattern[e.step % T.pattern.length]], w.frame);
    e.step++;
    e.cooldown = T.evadeCooldown;
  }

  /** P3: walk into one of the room's mouths and you come out of the opposite one. */
  _loops() {
    const w = this.world, T = MASKED_TUNING, m = this.mouths;
    for (const [k, v] of this.loopCool) if (v > 0) this.loopCool.set(k, v - 1);
    for (const t of w.fighters) {
      if (!t.alive || t.traits.object || t.traits.dummy || t.submerged || (this.loopCool.get(t) ?? 0) > 0) continue;
      const i = m.findIndex((q) => flat(q, t.pos) < T.mouthRadius);
      if (i < 0) continue;
      const out = m[(i + 2) % 4], c = this.center(), d = Math.hypot(c.x - out.x, c.z - out.z) || 1;
      const at = constrain({ x: out.x + ((c.x - out.x) / d) * 2.2, z: out.z + ((c.z - out.z) / d) * 2.2 }, t.stats.radius, w.bounds); // a step inside
      w.emit({ type: "severLoop", fighter: t, from: { x: t.pos.x, y: 0, z: t.pos.z }, to: { x: at.x, y: 0, z: at.z } });
      t.pos.x = t.prev.x = at.x; t.pos.z = t.prev.z = at.z;
      this.loopCool.set(t, T.loopCooldown);
    }
  }

  step() {
    const f = this.f;
    if (this.left) return;
    if (f.submerged && !this.tearMoves.has(f.runner.current?.id)) this._emerge(false); // interrupted inside a tear: back out
    if (this.exposed > 0 && --this.exposed === 0) { this.damageFactor = 1; this.postureFactor = 1; this.world.emit({ type: "severClosed", fighter: f }); }
    if (this.line && --this.line.frames <= 0) this._closeLine();
    if (this.mouths) this._loops();
    if (this.pendingLine && !f.runner.isRunning && f.combatant.canAct && f.grounded && !f.submerged) {
      this.pendingLine = false;
      f.controller.startDirect(MASKED_ABILITIES.SeverLine, this.world.frame);
    }
    this._evade();
  }
}

/**
 * Encounter VI (Ep 43, the Archive road): the vault's kit, plus the Draw (a tear under you, and you come out of one a
 * step in front of him as the Cleave comes down) and the Ring of Edges (cuts out of a ring of tears round you, one
 * after another; the middle is safe). No mouths and no Sever Line out on the road. At 25% he takes the key and goes.
 */
export class MaskedVIController extends MaskedController {
  constructor(world, f, phases = MASKED_VI_PHASES, options = maskedVIOptions) {
    super(world, f, phases, options);
    this.draw = null;
  }

  get brainActive() { return super.brainActive && !this.draw; } // he waits for whoever he's drawing

  onCustom(key, value = 0) {
    const w = this.world, f = this.f, V = MASKED_VI_TUNING;
    if (key === "draw") {
      const t = this._target();
      this.draw = { who: t, at: { x: t.pos.x, z: t.pos.z }, frames: V.draw.delay };
      w.emit({ type: "drawMark", fighter: f, target: t, at: { x: t.pos.x, y: 0, z: t.pos.z }, r: V.draw.r, frames: V.draw.delay });
      return true;
    }
    if (key === "ring") {
      const t = this._target(), R = V.ring, a0 = w.rng() * Math.PI * 2, c = { x: t.pos.x, z: t.pos.z };
      for (let i = 0; i < R.n; i++) {
        const a = a0 + (i / R.n) * Math.PI * 2;
        w.addStrike(f, c.x + Math.sin(a) * R.radius, c.z + Math.cos(a) * R.radius, { delay: R.delay + i * R.gap, r: R.r, spec: V.ringCut, ability: RING_CUT, kind: "sever" });
      }
      w.emit({ type: "edgeRing", fighter: f, at: { x: c.x, y: 0, z: c.z }, radius: R.radius });
      return true;
    }
    return super.onCustom(key, value);
  }

  enterPhase(p) { if (p === 4) this.leave(); }

  /** Whoever's still on the mark when it closes comes out a step in front of him, facing him, as the Cleave starts. */
  _drawIn() {
    const d = this.draw, w = this.world, f = this.f, t = d.who, V = MASKED_VI_TUNING;
    this.draw = null;
    if (this.left || !t.alive || t.pos.y > 0.3 || flat(t.pos, d.at) > V.draw.r) return; // stepped off, or jumped it
    let dx = d.at.x - f.pos.x, dz = d.at.z - f.pos.z;
    const n = Math.hypot(dx, dz) || 1; dx /= n; dz /= n;
    const to = constrain({ x: f.pos.x + dx * V.draw.front, z: f.pos.z + dz * V.draw.front }, t.stats.radius, w.bounds);
    w.emit({ type: "drawn", fighter: t, from: { x: t.pos.x, y: 0, z: t.pos.z }, to: { x: to.x, y: 0, z: to.z } });
    t.pos.x = t.prev.x = to.x; t.pos.z = t.prev.z = to.z; t.knock.x = t.knock.z = 0;
    t.yaw = t.prevYaw = Math.atan2(f.pos.x - to.x, f.pos.z - to.z);
    f.yaw = f.prevYaw = Math.atan2(to.x - f.pos.x, to.z - f.pos.z);
    f.runner.interrupt();
    f.controller.startDirect(MASKED_ABILITIES.Cleave, w.frame);
  }

  step() {
    super.step();
    if (this.draw && --this.draw.frames <= 0) this._drawIn();
  }
}
