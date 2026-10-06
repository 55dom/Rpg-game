// Townsfolk behavior (GDD §29.8): a daily routine plus reactions. Pure logic, no rendering, so it's
// testable. The runtime (runtime/ambient.js) moves the actors and poses their arms from the result.
//
// Priority, highest first:  a fight nearby → bad weather → night → someone to look at → the routine.
//   civilians run from a fight and cower; guards turn to face it; children run faster.
//   in rain, everyone but guards heads for shelter; at night, people with a home go home.

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const yawTo = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);

/** Steps: { do: "idle"|"work"|"walk"|"wander", at|to: [x, z], face?: yaw, anim?: string, dur?: [min, max], r?: number } */
export class Routine {
  /**
   * @param {{ steps: object[], role?: string, home?: [number, number], shelter?: [number, number][], speed?: number }} spec
   * @param {() => number} rng 0–1
   */
  constructor(spec, rng = Math.random) {
    this.spec = spec;
    this.rng = rng;
    this.role = spec.role ?? "civilian";
    this.speed = spec.speed ?? (this.role === "child" ? 1.9 : this.role === "elder" ? 0.9 : 1.3);
    this.i = 0;
    this.t = 0;
    this.wanderTo = null;
    this.state = "routine";
    this.attending = false;
    this.home = false;
    this._enter(0);
  }

  get step() { return this.spec.steps[this.i % this.spec.steps.length]; }

  _enter(i) {
    this.i = i % this.spec.steps.length;
    const s = this.step, [a, b] = s.dur ?? [4, 8];
    this.t = a + this.rng() * (b - a);
    this.arrived = false;
    this.wanderTo = null;
  }

  /**
   * One tick.
   * @param ctx {{ pos: {x,z}, player?: {x,z}, combat?: {x,z}|null, raining?: boolean, night?: boolean, dt: number }}
   * @returns {{ target: {x,z}|null, speed: number, face: number|null, activity: string, look: {x,z}|null, hidden?: boolean }}
   */
  update(ctx) {
    const { pos, player, combat, raining, night, dt } = ctx;
    const out = { target: null, speed: this.speed, face: null, activity: "idle", look: null };
    // A fight nearby.
    if (combat && dist(pos, combat) < 24) {
      if (this.role === "guard") { this.state = "alert"; out.face = yawTo(pos, combat); out.activity = "alert"; return out; }
      this.state = "flee";
      const away = this._shelterAwayFrom(pos, combat);
      out.speed = this.speed * (this.role === "child" ? 2.6 : 2.2);
      if (dist(pos, away) > 0.6) { out.target = away; out.activity = "flee"; } else { out.activity = "cower"; out.face = yawTo(pos, combat); }
      return out;
    }
    // Rain: shelter (guards stay at their post).
    if (raining && this.role !== "guard" && this.spec.shelter?.length) {
      this.state = "shelter";
      const s = this._nearest(pos, this.spec.shelter);
      out.speed = this.speed * 1.5;
      if (dist(pos, s) > 0.5) { out.target = s; out.activity = "hurry"; } else { out.activity = "shelter"; out.look = player && dist(pos, player) < 5 ? player : null; }
      return out;
    }
    // Night: home, if they have one.
    if (night && this.spec.home) {
      this.state = "home";
      const h = { x: this.spec.home[0], z: this.spec.home[1] };
      if (dist(pos, h) > 0.5) { out.target = h; out.activity = "walk"; } else { out.hidden = true; out.activity = "home"; }
      return out;
    }
    // Someone stopped next to them: stop and look.
    if (player && !player.moving && dist(pos, player) < 2.6) this.attending = true;
    else if (!player || dist(pos, player) > 3.6) this.attending = false;
    if (this.attending) { this.state = "attend"; out.face = yawTo(pos, player); out.look = player; out.activity = "attend"; return out; }
    this.state = "routine";
    if (player && dist(pos, player) < 5) out.look = player; // a glance as you pass
    // The routine itself.
    const s = this.step;
    const at = s.at ?? s.to ?? s.around;
    const spot = at ? { x: at[0], z: at[1] } : pos;
    if (s.do === "walk") {
      if (dist(pos, spot) > 0.4) { out.target = spot; out.activity = "walk"; return out; }
      this._enter(this.i + 1); return out;
    }
    if (s.do === "wander") {
      if (!this.wanderTo || dist(pos, this.wanderTo) < 0.4) {
        const a = this.rng() * Math.PI * 2, r = (s.r ?? 3) * Math.sqrt(this.rng());
        this.wanderTo = { x: spot.x + Math.sin(a) * r, z: spot.z + Math.cos(a) * r };
      }
      out.target = this.wanderTo; out.speed = this.speed * 0.7; out.activity = "walk";
      if ((this.t -= dt) <= 0) this._enter(this.i + 1);
      return out;
    }
    // idle / work: go to the spot, then do the thing for a while.
    if (!this.arrived && dist(pos, spot) > 0.4) { out.target = spot; out.activity = "walk"; return out; }
    this.arrived = true;
    out.face = s.face ?? null;
    out.activity = s.do === "work" ? s.anim ?? "work" : "idle";
    if ((this.t -= dt) <= 0) this._enter(this.i + 1);
    return out;
  }

  _nearest(pos, list) {
    let best = null, bd = Infinity;
    for (const [x, z] of list) { const d = Math.hypot(x - pos.x, z - pos.z); if (d < bd) { bd = d; best = { x, z }; } }
    return best;
  }

  /** The shelter farthest from the fight (or a spot 10 m straight away from it). */
  _shelterAwayFrom(pos, threat) {
    const list = this.spec.shelter ?? [];
    let best = null, bd = -1;
    for (const [x, z] of list) { const d = Math.hypot(x - threat.x, z - threat.z); if (d > bd) { bd = d; best = { x, z }; } }
    if (best && bd > 12) return best;
    const d = dist(pos, threat) || 1;
    return { x: pos.x + ((pos.x - threat.x) / d) * 10, z: pos.z + ((pos.z - threat.z) / d) * 10 };
  }
}
