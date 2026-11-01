// A battle the story stages rather than a wave to clear (GDD §15.8, the Siege of Aurelin; "chaos is authored, not
// simulated"). Pure, like the rest of sim/: the story makes one with a fight beat's `siege` spec and steps it once a
// frame, and hands it the world's events.
//
//   meter   a bar that falls whatever you do ({ label, start, end, seconds, perKill }): it runs from `start` down to
//           `end` in about `seconds`, and every enemy put down gives a little back (perKill), so playing well visibly
//           slows it; but never stops it: however well you play, it still falls at least at a third of its pace, so it
//           always gets there (the fairness rule: the arrival comes at a threshold, never a loss).
//   line    ranks that come on together ({ kind, rows, cols, at, gap: [across, between rows], every, max }): the first
//           `rows` at the start, three deep, then a new rank at the rear every `every` frames while fewer than `max` stand.
//   rear    one more fighter behind them all ({ kind, at, floor? }: the Line Marshal), who stays back and keeps them
//           coming; with `floor`, he can't be brought below that share of his health (the story finishes him).
//   foes    particular fighters on the other side ([{ kind, x, z, floor?, bar? }]: the Hero Party, Ep 49), there from the start;
//           with `bar`, the one the fight is about (the Hollow Bloom, Ep 18): the target card shows it whenever nothing else is in focus.
//   allies  the Line beside you ({ kind, rows, cols, at, gap, yaw? }): guests, rank behind rank, facing the way you face.
//   until   when the beat ends besides the meter: { kills } (enemies down), { frames }.
//   killLines  [{ by, of, say: [speaker, text], every }]: a line when `by` puts down an `of` (not more often than `every` frames).
//   marks   [{ meter | frame | rise, cue?, say?, set?, sfx?, join?, remove? }]: moments the story plays when the meter
//           falls to `meter`, the rising gauge reaches `rise` (or at `frame`): a set cue (the bridge's spans falling in),
//           a shout, a flag, a squadmate back at your side (`join`), one of them gone for good (`remove`).
//   rise    a gauge that only rises, and only for what you do ({ label, gains: { eventType: amount }, to = 1, answer? }):
//           Ep 50's Interest (he sits and watches, and only a reaction, a perfect dodge or a team attack catches his eye;
//           `answer`: the kind of foe that answers each one) and its Links. The beat is over when it reaches `to`.
//   idle    [speaker, text][] said in turn whenever `every` frames go by with nothing to raise the gauge ({ every, say }).
//   hold    when the meter runs out, one last thing before the beat ends ({ frames, label, say? }): the other side holds still
//           and a gauge fills while you hold Guard (and slips back while you don't). It can't be lost: it waits for you
//           (Ep 18: you and Cal hold the Bloom back; GDD §16 B7's Final, a hold, not a button test).

export class Siege {
  constructor(world, spec) {
    this.w = world;
    this.spec = spec;
    const m = spec.meter;
    this.meter = m ? (m.start ?? 1) : null;
    this.cap = this.meter; // the most the meter can stand at: it falls at a third of the pace, kills or no kills
    this.frames = 0;
    this.kills = 0;
    this.spawned = 0;
    this.nextRank = spec.line?.every ?? Infinity;
    this.lastSaid = new Map();
    this.said = [];
    this.done = false;
    this.rear = null;
    this.marks = [...(spec.marks ?? [])];
    this.fired = [];
    this.rise = spec.rise ? 0 : null; this.lastGain = 0; this.idleN = 0;
    this.holding = null; // { t }: the hold, once the meter's out
  }

  start() {
    const L = this.spec.line, A = this.spec.allies;
    if (L) for (let r = 0; r < (L.rows ?? 3); r++) this._rank(r);
    for (const f of this.spec.foes ?? []) { // floor: they can't be put down here (the heroes retreat when the Trial's clock runs out)
      const e = this.w.spawnEnemy(f.kind, f.x, f.z, this.spawned++);
      e.yaw = e.prevYaw = f.yaw ?? Math.PI;
      if (f.floor) e.combatant.floor = Math.ceil(e.stats.maxHealth * f.floor);
      if (f.bar) this.w.headline = e; // the one the fight's about: the HUD's target card rests on it when nothing else is in focus
    }
    if (A) { // the Line you stand in: shoulder to shoulder, rank behind rank, facing `yaw` (north unless it says)
      const [across, between] = A.gap ?? [1.6, 1.5], yaw = A.yaw ?? 0, fx = Math.sin(yaw), fz = Math.cos(yaw);
      for (let r = 0; r < (A.rows ?? 1); r++) for (let i = 0; i < A.cols; i++) {
        const c = this.w.addCompanion(A.kind), off = (i - (A.cols - 1) / 2) * across + (r % 2 ? across / 2 : 0);
        c.pos.x = c.prev.x = A.at.x + fz * off - fx * r * between;
        c.pos.z = c.prev.z = A.at.z - fx * off - fz * r * between;
        c.yaw = c.prevYaw = yaw;
      }
    }
    if (this.spec.rear) this.rear = this.w.spawnEnemy(this.spec.rear.kind, this.spec.rear.at.x, this.spec.rear.at.z, this.spawned++);
    if (this.rear) {
      this.rear.brain.aggroRange = 0; // the Marshal keeps to the rear
      if (this.spec.rear.floor) this.rear.combatant.floor = Math.ceil(this.rear.stats.maxHealth * this.spec.rear.floor); // and isn't yours to finish
    }
    this._gauge();
    return this;
  }

  /** One rank, `r` rows back from the front (alternate rows stagger, a spear-wall). */
  _rank(r) {
    const L = this.spec.line, [across, between] = L.gap ?? [1.7, 1.6];
    for (let i = 0; i < L.cols; i++) {
      const x = L.at.x + (i - (L.cols - 1) / 2) * across + (r % 2 ? across / 2 : 0);
      const f = this.w.spawnEnemy(L.kind, x, L.at.z + r * between, this.spawned++);
      f.yaw = f.prevYaw = Math.PI; // facing down the bridge, the way they're marching
    }
  }

  get standing() { const k = this.spec.line?.kind; return this.w.liveEnemies.filter((f) => f.kind === k).length; }

  onEvent(ev) {
    const R = this.spec.rise, gain = R?.gains?.[ev.type];
    if (gain && this.rise != null && (ev.type !== "hit" || ev.attacker?.team === this.w.player.team)) { // what you do, not what's done to you
      this.rise = Math.min(R.to ?? 1, this.rise + gain); this.lastGain = this.frames;
      if (R.answer) for (const f of this.w.liveEnemies) if (f.kind === R.answer) f.boss?.answer?.(ev);
    }
    if (ev.type !== "kill" || ev.defender?.team === this.w.player.team) return;
    this.kills++;
    const m = this.spec.meter;
    if (m && this.meter != null) this.meter = Math.min(this.cap, this.meter + (m.perKill ?? 0));
    for (const kl of this.spec.killLines ?? []) {
      if (ev.attacker?.kind !== kl.by || (kl.of && ev.defender?.kind !== kl.of)) continue;
      if (this.frames - (this.lastSaid.get(kl) ?? -Infinity) < (kl.every ?? 0)) continue;
      this.lastSaid.set(kl, this.frames);
      this.said.push(kl.say);
    }
  }

  /** Lines due to be spoken (the story drains them). */
  drainLines() { const out = this.said; this.said = []; return out; }

  /** Marks whose moment has come (the story plays them). */
  drainMarks() { const out = this.fired; this.fired = []; return out; }

  step() {
    if (this.done) return;
    if (this.holding) { this._hold(); return; }
    this.frames++;
    const m = this.spec.meter, L = this.spec.line, u = this.spec.until ?? {};
    if (m && this.meter != null) {
      const pace = ((m.start ?? 1) - (m.end ?? 0)) / ((m.seconds ?? 120) * 60);
      this.meter -= pace;
      this.cap -= pace / 3;
      this.meter = Math.min(this.meter, this.cap);
    }
    if (L && this.frames >= this.nextRank) {
      if (this.standing < (L.max ?? 8)) this._rank(0);
      this.nextRank = this.frames + L.every;
    }
    if (L && this.standing === 0) { this._rank(0); this._rank(1); } // never an empty bridge: the Line keeps coming
    this._gauge();
    for (const k of [...this.marks]) {
      if ((k.meter != null && this.meter != null && this.meter <= k.meter) || (k.frame != null && this.frames >= k.frame) || (k.rise != null && this.rise != null && this.rise >= k.rise)) { this.fired.push(k); this.marks.splice(this.marks.indexOf(k), 1); }
    }
    const I = this.spec.idle;
    if (I && this.frames - Math.max(this.lastGain, this.lastIdle ?? 0) >= I.every) { this.lastIdle = this.frames; this.said.push(I.say[this.idleN++ % I.say.length]); } // boring play gets commentary
    const R = this.spec.rise;
    if ((m && this.meter <= (m.end ?? 0)) || (R && this.rise >= (R.to ?? 1)) || (u.kills != null && this.kills >= u.kills) || (u.frames != null && this.frames >= u.frames)) {
      if (this.spec.hold && m && this.meter <= (m.end ?? 0)) this._beginHold(); else this.done = true;
    }
  }

  _beginHold() {
    const H = this.spec.hold;
    this.holding = { t: 0 };
    this.w.foesHeld = true;
    this.w.clearErasures?.(); // (the ground and the pages come back: it's all the Bloom has, pushing)
    this.w.emit({ type: "holdBegin", frames: H.frames, label: H.label });
    for (const line of H.say ?? []) this.said.push(line);
    this.w.gauge = { label: H.label ?? "", value: 0, hold: true };
  }
  /** Guard held: it fills; let go and it slips back (never below empty). Full, and the beat's over. */
  _hold() {
    const H = this.spec.hold, h = this.holding, p = this.w.player;
    const held = !!p.holdBlock && p.alive;
    h.t = held ? h.t + 1 : Math.max(0, h.t - 0.5);
    h.held = held;
    this.w.gauge = { label: H.label ?? "", value: h.t / H.frames, hold: true, held };
    if (h.t >= H.frames) { this.w.foesHeld = false; this.w.emit({ type: "holdDone" }); this.done = true; }
  }

  _gauge() {
    if (this.spec.meter) this.w.gauge = { label: this.spec.meter.label ?? "", value: Math.max(0, this.meter) };
    else if (this.spec.rise) this.w.gauge = { label: this.spec.rise.label ?? "", value: this.rise / (this.spec.rise.to ?? 1) };
  }

  /** The beat's over: the field empties for whatever the story shows next. */
  end() {
    this.done = true;
    this.w.gauge = null; this.w.headline = null; this.w.foesHeld = false;
    this.w.clearErasures?.(); // (the Hollow Bloom's holes and blank pages go with it)
    for (const f of this.w.enemies) this.w.emit({ type: "despawn", fighter: f });
    this.w.fighters = this.w.fighters.filter((f) => f.team === this.w.player.team);
  }
}
