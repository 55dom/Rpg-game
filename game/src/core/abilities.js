// Abilities as data: frame phases, timed events, cancel windows, and the combo graph
// that turns a button press into the right move for the moment.

import { Intent, Mask, maskHas } from "./input.js";
import { isHitSet } from "./combat.js";

/** @enum {number} */
export const EventType = Object.freeze({
  PlayAnimation: 0, SpawnHitbox: 1, ApplyTag: 2, CameraCue: 3, PlaySound: 4,
  SpawnVfx: 5, Move: 6, Invulnerable: 7, Custom: 8,
});

/** @enum {string} */
export const Phase = Object.freeze({ Startup: "Startup", Active: "Active", Recovery: "Recovery", Done: "Done" });

/** @enum {string} */
export const StartResult = Object.freeze({
  Started: "Started", Busy: "Busy", NotEnoughMana: "NotEnoughMana", OnCooldown: "OnCooldown",
});

/** Context flags the combo graph reads. */
export const MoveContext = Object.freeze({
  None: 0, Grounded: 1, Airborne: 2, AfterDash: 4, AfterParry: 8, TargetStaggered: 16,
  AirJumpReady: 32, AirDashReady: 64,
});

/**
 * Build and validate an ability. Events are stable-sorted by frame.
 * @param {object} o
 * @param {string} o.id
 * @param {number} o.startup @param {number} o.active @param {number} o.recovery
 * @param {{frame:number,type:number,key?:string,value?:number}[]} [o.events]
 * @param {{from:number,to:number,into:number,requiresHit?:boolean}[]} [o.cancels]
 * @param {number} [o.manaCost] @param {number} [o.cooldownFrames] @param {object} [o.hit]
 * @param {string} [o.animation]
 */
export function defineAbility(o) {
  if (!o.id) throw new Error("ability needs an id");
  const startup = o.startup ?? 0, active = o.active ?? 0, recovery = o.recovery ?? 0;
  if (startup < 0 || active < 0 || recovery < 0) throw new RangeError(`${o.id}: negative frames`);
  const total = startup + active + recovery;
  if (total <= 0) throw new RangeError(`${o.id}: must last at least one frame`);

  const events = (o.events ?? []).map((e, i) => ({ ...e, key: e.key ?? "", value: e.value ?? 0, _i: i }));
  for (const e of events) {
    if (e.frame < 0 || e.frame > total - 1) throw new RangeError(`${o.id}: event at frame ${e.frame} is outside 0..${total - 1}`);
  }
  events.sort((a, b) => a.frame - b.frame || a._i - b._i);

  const cancels = (o.cancels ?? []).map((c) => ({ ...c, requiresHit: !!c.requiresHit }));
  for (const c of cancels) {
    if (c.from < 0 || c.to > total - 1 || c.from > c.to) throw new RangeError(`${o.id}: cancel window ${c.from}-${c.to} out of range`);
    if (!c.into) throw new RangeError(`${o.id}: cancel window needs a non-empty mask`);
  }

  if ((o.manaCost ?? 0) < 0 || (o.cooldownFrames ?? 0) < 0) throw new RangeError(`${o.id}: negative cost`);

  return Object.freeze({
    id: o.id,
    animation: o.animation ?? o.id,
    startup, active, recovery, total,
    events: Object.freeze(events.map(({ _i, ...e }) => Object.freeze(e))),
    cancels: Object.freeze(cancels.map((c) => Object.freeze(c))),
    manaCost: o.manaCost ?? 0,
    cooldownFrames: o.cooldownFrames ?? 0,
    hit: o.hit ?? null,
    hasHit: isHitSet(o.hit),
    tags: Object.freeze(o.tags ?? []),
  });
}

export function phaseAt(ability, frame) {
  if (frame < ability.startup) return Phase.Startup;
  if (frame < ability.startup + ability.active) return Phase.Active;
  if (frame < ability.total) return Phase.Recovery;
  return Phase.Done;
}

/** Inputs allowed to cancel this ability at this frame. */
export function cancellableInto(ability, frame, hasHit) {
  let m = 0;
  for (const c of ability.cancels) {
    if (frame >= c.from && frame <= c.to && (!c.requiresHit || hasHit)) m |= c.into;
  }
  return m;
}

export const canCancel = (ability, frame, hasHit, intent) => maskHas(cancellableInto(ability, frame, hasHit), intent);

const noop = () => {};

/** Runs one ability at a time, frame by frame. */
export class AbilityRunner {
  /** @param {{started?:Function,event?:Function,finished?:Function,cancelled?:Function,interrupted?:Function}} [sink] */
  constructor(sink = {}) {
    this.sink = { started: noop, event: noop, finished: noop, cancelled: noop, interrupted: noop, ...sink };
    this.current = null;
    this.frame = 0;
    this.hasHit = false;
    this.hitstop = 0;
    this.cooldowns = new Map(); // ability id → frame it's ready
  }

  get isRunning() { return this.current !== null; }
  get inHitstop() { return this.hitstop > 0; }
  get phase() { return this.current ? phaseAt(this.current, this.frame) : Phase.Done; }

  /** Mask of intents that may start something right now. */
  get acceptedIntents() {
    if (this.hitstop > 0) return 0;
    if (!this.current) return Mask.All;
    return cancellableInto(this.current, this.frame, this.hasHit);
  }

  canAccept(intent) { return maskHas(this.acceptedIntents, intent); }

  readyAt(ability) { return this.cooldowns.get(ability.id) ?? 0; }

  /**
   * @param {object} ability @param {number} intent @param {number} clockFrame
   * @param {import("./stats.js").ResourcePool} [mana]
   * @param {boolean} [force] start even outside a cancel window (counters, scripted moves)
   */
  tryStart(ability, intent, clockFrame, mana, force = false) {
    if (!force && intent && !this.canAccept(intent)) return StartResult.Busy;
    if (!force && !intent && this.current) return StartResult.Busy;
    if (clockFrame < this.readyAt(ability)) return StartResult.OnCooldown;
    if (ability.manaCost > 0 && (!mana || !mana.canAfford(ability.manaCost))) return StartResult.NotEnoughMana;
    if (ability.manaCost > 0) mana.trySpend(ability.manaCost);
    if (ability.cooldownFrames > 0) this.cooldowns.set(ability.id, clockFrame + ability.cooldownFrames);

    if (this.current) {
      const old = this.current;
      this.current = null;
      this.sink.cancelled(old, ability);
    }
    this.current = ability;
    this.frame = 0;
    this.hasHit = false;
    this.hitstop = 0;
    this.sink.started(ability);
    return StartResult.Started;
  }

  /** Advance one logic frame. */
  tick() {
    if (this.hitstop > 0) { this.hitstop--; return; }
    const playing = this.current;
    if (!playing) return;
    for (const e of playing.events) {
      if (e.frame !== this.frame) continue;
      this.sink.event(playing, e, this.frame);
      if (this.current !== playing) return; // a handler replaced or ended it
    }
    this.frame++;
    if (this.frame >= playing.total) {
      this.current = null;
      this.sink.finished(playing);
    }
  }

  /** Our attack connected: freeze for hitstop and open requiresHit cancels. */
  notifyHit(hitstop) {
    if (!this.current) return;
    this.hasHit = true;
    if (hitstop > this.hitstop) this.hitstop = hitstop;
  }

  /** Something stopped us (stagger, death). */
  interrupt() {
    this.hitstop = 0;
    if (!this.current) return;
    const old = this.current;
    this.current = null;
    this.sink.interrupted(old);
  }
}

/** Simple intent → ability table. */
export class BindingResolver {
  constructor() { this.map = new Map(); }
  bind(intent, ability) { this.map.set(intent, ability); return this; }
  resolvableIntents() { let m = 0; for (const k of this.map.keys()) m |= 1 << k; return m; }
  tryResolve(intent) { return this.map.get(intent) ?? null; }
  commit() {}
}

/**
 * Which ability a press means, given what's playing and the situation.
 * Priority routes first (finishers), then node edges, then globals, then entries (entries only when idle).
 */
export class ComboGraph {
  /** @param {() => number} contextProvider MoveContext flags */
  constructor(contextProvider = () => 0) {
    this.context = contextProvider;
    this.nodes = new Map(); // id → { ability, edges: [] }
    this.entries = [];
    this.globals = [];
    this.priority = [];
    this.runner = null;
    this._current = null;
  }

  addNode(ability) {
    if (!this.nodes.has(ability.id)) this.nodes.set(ability.id, { ability, edges: [] });
    return this;
  }

  addEdge(from, intent, to, requires = 0) {
    this.addNode(from); this.addNode(to);
    this.nodes.get(from.id).edges.push({ intent, ability: to, requires });
    return this;
  }

  addEntry(intent, ability, requires = 0) {
    this.addNode(ability);
    this.entries.push({ intent, ability, requires });
    return this;
  }

  addGlobal(intent, ability, requires = 0) {
    this.addNode(ability);
    this.globals.push({ intent, ability, requires });
    return this;
  }

  /** Like a global, but checked before node edges: for moves that must win when their context holds. */
  addPriority(intent, ability, requires = 0) {
    this.addNode(ability);
    this.priority.push({ intent, ability, requires });
    return this;
  }

  /** The node we're in, or null if what's playing isn't ours. */
  get currentNodeId() {
    const playing = this.runner?.current ?? null;
    if (!playing || !this._current || this._current !== playing.id) return null;
    return this._current;
  }

  resolvableIntents() {
    let m = 0;
    const add = (list) => { for (const l of list) m |= 1 << l.intent; };
    const node = this.currentNodeId;
    if (node) add(this.nodes.get(node).edges);
    add(this.priority);
    add(this.globals);
    if (!this.runner?.isRunning) add(this.entries);
    return m;
  }

  tryResolve(intent) {
    const ctx = this.context();
    const pick = (list) => list.find((l) => l.intent === intent && (ctx & l.requires) === l.requires)?.ability ?? null;
    const p = pick(this.priority); if (p) return p;
    const node = this.currentNodeId;
    if (node) { const a = pick(this.nodes.get(node).edges); if (a) return a; }
    const g = pick(this.globals); if (g) return g;
    if (!this.runner?.isRunning) return pick(this.entries);
    return null;
  }

  commit(ability) { this._current = ability.id; }
}

/** Glue: buffered presses → resolver → runner, honoring hitstop and cancel windows. */
export class AbilityController {
  /**
   * @param {AbilityRunner} runner @param {import("./input.js").InputBuffer} buffer
   * @param {import("./stats.js").ResourcePool} [mana] @param {ComboGraph|BindingResolver} [resolver]
   */
  constructor(runner, buffer, mana, resolver) {
    this.runner = runner;
    this.buffer = buffer;
    this.mana = mana;
    this.customResolver = !!resolver;
    this.resolver = resolver ?? new BindingResolver();
    if (this.resolver instanceof ComboGraph) this.resolver.runner = runner;
    this.locked = false;
    /** Intents that may cut through anything (not hitstop). Set by gameplay, e.g. a counter window. */
    this.overrideMask = 0;
    this.lastResult = null;
    this.lastRejected = null;
  }

  bind(intent, ability) {
    if (this.customResolver) throw new Error("bind() is only for the default resolver");
    this.resolver.bind(intent, ability);
    return this;
  }

  press(intent, frame) { this.buffer.push(intent, frame); }

  /** Run one logic frame. */
  tick(frame) {
    if (this.runner.inHitstop) {
      this.buffer.delay(1);
      this.runner.tick();
      return;
    }
    if (!this.locked) this._tryStartFromBuffer(frame);
    this.runner.tick();
  }

  _tryStartFromBuffer(frame) {
    const normal = this.runner.acceptedIntents;
    const allowed = (normal | this.overrideMask) & this.resolver.resolvableIntents();
    if (!allowed) return;
    const intent = this.buffer.consume(allowed, frame);
    if (!intent) return;
    const ability = this.resolver.tryResolve(intent);
    if (!ability) return;
    const force = !maskHas(normal, intent);
    const r = this.runner.tryStart(ability, intent, frame, this.mana, force);
    this.lastResult = r;
    if (r === StartResult.Started) this.resolver.commit(ability);
    else this.lastRejected = ability;
  }

  /** Start without input (AI, scripted). */
  startDirect(ability, frame) {
    const r = this.runner.tryStart(ability, Intent.None, frame, this.mana);
    this.lastResult = r;
    if (r === StartResult.Started) this.resolver.commit(ability);
    return r;
  }
}
