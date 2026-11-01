// Boss 7, the Hollow Bloom (GDD §16 B7, Ep 18): its phases, on the clock it's held back against.
// The holes it leaves (world.holes) and the pages it blanks (world.pageLocks) are the world's to enforce (sim/world.js).

import { BLOOM_TUNING as T } from "../data/bloom.js";

const SLOTS = ["Spell1", "Spell2", "Spell3", "Spell4"];

export class BloomController {
  constructor(world, f) {
    this.world = world; this.f = f;
    this.t = 0; this.phase = 1; this.holeTimer = 60; this.pending = []; this.memory = 0; this.pageTimer = 60; this.done = false;
  }
  get brainActive() { return this.memory <= 0; } // inside the memory, it's everywhere and nowhere
  get untouchable() { return this.memory > 0; }
  get intangible() { return this.memory > 0; } // (nothing lands: there's nothing there to hit)
  tick() {
    const w = this.world, f = this.f;
    if (!f.alive) { this._end(); return; }
    this.t++;
    const next = this.t >= T.phases.pages ? 4 : this.t >= T.phases.memory ? 3 : this.t >= T.phases.holes ? 2 : 1;
    if (next > this.phase) {
      this.phase = next;
      w.emit({ type: "bloomPhase", fighter: f, phase: next });
      if (next === 3) { this.memory = T.memory.frames; f.runner.interrupt(); w.emit({ type: "memoryBegin", fighter: f, frames: T.memory.frames, at: { x: w.player.pos.x, y: 0, z: w.player.pos.z } }); }
    }
    if (this.phase >= 2) this._holes();
    if (this.memory > 0 && --this.memory === 0) w.emit({ type: "memoryEnd", fighter: f });
    if (this.phase >= 4 && --this.pageTimer <= 0) { this.pageTimer = T.pages.every; this._erasePage(); }
  }

  /** P2: a white ring where one of you stands; a second later, a hole in the world. */
  _holes() {
    const w = this.world, H = T.holes;
    if (--this.holeTimer <= 0) {
      this.holeTimer = H.every;
      const squad = w.fighters.filter((x) => x.alive && x.team === w.player.team && !x.traits.object);
      const t = w.rng() < 0.6 || squad.length < 2 ? w.player : squad[Math.floor(w.rng() * squad.length) % squad.length];
      const at = { x: t.pos.x, z: t.pos.z, warn: H.warn };
      this.pending.push(at);
      w.emit({ type: "eraseWarn", fighter: this.f, at: { x: at.x, y: 0, z: at.z }, r: H.r, frames: H.warn });
    }
    for (const p of this.pending) if (--p.warn === 0) {
      if (w.holes.length >= H.max) { const old = w.holes.shift(); w.emit({ type: "holeClose", hole: old }); } // the oldest closes over
      const hole = { x: p.x, z: p.z, r: H.r, frames: H.frames };
      w.holes.push(hole);
      w.emit({ type: "holeOpen", fighter: this.f, hole });
    }
    this.pending = this.pending.filter((p) => p.warn > 0);
  }

  /** P4: one of your pages goes blank for a few seconds. */
  _erasePage() {
    const w = this.world;
    const open = SLOTS.filter((s) => w.loadout?.[s] && !(w.pageLocks[s] > 0));
    if (!open.length) return;
    const slot = open[Math.floor(w.rng() * open.length) % open.length];
    w.pageLocks[slot] = T.pages.frames;
    w.emit({ type: "pageErased", fighter: this.f, slot, frames: T.pages.frames, ability: w.loadout[slot]?.id });
  }

  _end() {
    if (this.done) return;
    this.done = true;
    this.world.clearErasures();
  }
}
