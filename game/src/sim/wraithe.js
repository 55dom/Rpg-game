// Wraithe's controller (data/wraithe.js): the tears he steps through, the Undertow under your feet, the
// acolytes he calls in, and his escape. While he's inside a tear he's `submerged`: nothing can touch him,
// and the view hides him (LOOKS.wraithe.riftwalk).

import { PhasedBoss } from "./boss.js";
import { constrain } from "./bounds.js";
import { WRAITHE_PHASES, WRAITHE_TUNING, UNDERTOW, wraitheOptions } from "../data/wraithe.js";

export class WraitheController extends PhasedBoss {
  constructor(world, f) {
    super(world, f, WRAITHE_PHASES, wraitheOptions);
    this.exit = null; this.called = []; this.escaped = false;
    f.combatant.floor = Math.ceil(f.stats.maxHealth * WRAITHE_TUNING.escapeAt); // the fight can't finish him
  }

  get brainActive() { return !this.f.submerged; }
  get untouchable() { return this.f.submerged; }

  _target() { const t = this.f.target; return t?.alive ? t : this.world.player; }
  _tear(at, role) { this.world.emit({ type: "riftOpen", fighter: this.f, at: { x: at.x, y: 0, z: at.z }, role }); }

  onCustom(key) {
    const w = this.world, f = this.f, T = WRAITHE_TUNING;
    if (key === "riftOut") { // into the air: gone
      this._tear(f.pos, "out");
      f.submerged = true; f.dash.frames = 0; f.knock.x = f.knock.z = 0;
      this.exit = null;
      return true;
    }
    if (key === "riftMark") { // the way out opens behind whoever he's after: that's the warning
      const t = this._target(), b = t.forward;
      this.exit = constrain({ x: t.pos.x - b.x * T.exitBehind, z: t.pos.z - b.z * T.exitBehind }, f.stats.radius + 0.3, w.bounds);
      this._tear(this.exit, "mark");
      return true;
    }
    if (key === "riftIn") { this._emerge(); return true; }
    if (key === "undertow") {
      const t = this._target();
      this._undertow(t);
      if (this.phase >= 2) { // later on, a squadmate's feet too
        const mate = w.fighters.find((c) => c.team !== f.team && c !== t && c.alive && !c.traits.object && !c.traits.dummy);
        if (mate) this._undertow(mate);
      }
      return true;
    }
    return false;
  }

  _undertow(t) {
    const T = WRAITHE_TUNING;
    this.world.addStrike(this.f, t.pos.x, t.pos.z, { delay: T.undertowDelay, r: T.undertowRadius, spec: T.undertow, ability: UNDERTOW, kind: "rift", lift: T.dropHeight });
  }

  /** Out of the exit tear (or, if he never got one, out where he went in), facing his target. */
  _emerge() {
    const f = this.f, t = this._target(), at = this.exit ?? f.pos;
    f.pos.x = f.prev.x = at.x; f.pos.z = f.prev.z = at.z;
    f.yaw = f.prevYaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
    f.submerged = false;
    this._tear(f.pos, "in");
    this.exit = null;
  }

  enterPhase(p) {
    const w = this.world, f = this.f, T = WRAITHE_TUNING;
    if (p === 2) { // two acolytes step out of tears on either side of Rook
      const c = w.player.pos;
      this.called = Array.from({ length: T.acolytes }, (_, i) => {
        const a = f.yaw + (i ? 1.6 : -1.6);
        const at = constrain({ x: c.x + Math.sin(a) * 4, z: c.z + Math.cos(a) * 4 }, 0.8, w.bounds);
        this._tear(at, "call");
        return w.spawnEnemy("acolyte", at.x, at.z, 80 + i);
      });
      w.emit({ type: "riftCall", fighter: f, called: this.called });
    }
    if (p === 3) this.escape();
  }

  /** He leaves through a tear, and every acolyte still standing goes with him. The fight is over. */
  escape() {
    if (this.escaped) return;
    const w = this.world, f = this.f;
    this.escaped = true;
    if (f.submerged) this._emerge();
    f.runner.interrupt();
    w.strikes = w.strikes.filter((s) => s.owner !== f);
    for (const e of [f, ...w.fighters.filter((e) => e !== f && e.team === f.team && e.alive && e.kind === "acolyte")]) {
      w.emit({ type: "riftEscape", fighter: e, at: { x: e.pos.x, y: 0, z: e.pos.z } });
      e.vanished = true;
      e.combatant.floor = 0;
      e.combatant.health.set(0);
    }
  }

  step() {
    const f = this.f;
    if (f.submerged && f.runner.current?.id !== "RiftStep") this._emerge(); // interrupted inside a tear: come back out
  }
}
