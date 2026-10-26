// The law in free roam (data/law.js, sim/law.js): crimes, witnesses, people fighting back, the Watch.
//
// Theft (a stall, a coin jar), pickpocketing (from behind, and nobody watching) and assault (your blade or a
// spell landing on someone) all check who saw it: anyone within 3 m with you in their field of view.
//   guards       come for you: pay up, come quietly, or resist (and every guard you fight whistles for another)
//   grown-ups    fight back with their fists (they give up when they're hurt)
//   the young and the old   run, and shout for the Watch, which sends the nearest guard
//   squadmates   fight you too, and think less of you for it
// Running from a guard who's come for you, or getting clear of a fight with the Watch, is a crime of its own,
// and then guards attack on sight. A fight with the Watch ends when you surrender (the cells), fall (the cells,
// and a fine), get away, or there are no guards left to whistle for.

import { Law, witnesses, reaction, canSee, regionOf } from "../sim/law.js";
import { CRIMES, STEAL_SPOTS, SHOUTS, COMRADE_LINES, watchStrength } from "../data/law.js";
import { GIFTS, BONDS } from "../data/bonds.js";
import { CAST } from "../data/story/cast.js";

const pick = (list, rng = Math.random) => list[Math.floor(rng() * list.length) % list.length];
const ROLE_NAMES = { guard: "City Watch", child: "Kid", elder: "Townsperson", worker: "Townsperson", civilian: "Townsperson" };

export class LawWatch {
  /** @param story runtime/story.js StoryPlayer */
  constructor(story) {
    this.story = story;
    this.law = new Law(story.flags);
    this.fight = null;    // { kind: "watch" | "brawl", region, fighters: Map(fighter → person), reserve, whistleT, far }
    this.pursuit = null;  // { id, t, far }: a guard on his way to arrest you
    this.off = new Set(); // people out of their day: fighting, carried off, gone for the Watch
    this.cool = 0;        // a breather after a run-in before anyone else notices you
    this.n = 0;
  }

  get ctx() { return this.story.ctx; }
  get world() { return this.ctx.getWorld(); }
  get active() { return !!(this.story.roaming && this.story.exploring && this.region); }
  get region() { return this.story.zone ? regionOf(this.story.zone.id) : null; }
  get day() { return this.story.day; }

  // ---- Entering and leaving a zone ----

  /** Before a zone's cast is chosen (zone casts can check $CLOCK_NIGHT, $WATCH_STRENGTH and Luke's progress). */
  beforeZone() {
    const f = this.story.flags;
    f.set("CLOCK_NIGHT", this.story.clock?.night ? 1 : 0);
    f.set("DAY", this.day);
    // Luke takes a day to think it over. The next day he's in the Watch's blue.
    if (f.get("LUKE_MET") && !f.get("LUKE_GUARD") && this.day > Number(f.get("LUKE_MET_DAY"))) f.set("LUKE_GUARD", 1);
    // Luke takes Elsie home once the village is safe: the Deacon gone, and the bog beast put down at least once.
    f.set("LUKE_HOME_OPEN", Number(f.get("Q_LUKE")) === 999 && f.get("ILSE_DEFEATED") && f.get("BOG_BEAST_DOWN") ? 1 : 0);
    f.set("WATCH_STRENGTH", watchStrength(f));
  }

  /** A new zone: its steal spots join the pickups; how big the Watch is follows the story. */
  enter() {
    this.fight = null; this.pursuit = null; this.off.clear(); this.cool = 1.5;
    const s = this.story, x = s.exploring;
    s.flags.set("WATCH_STRENGTH", watchStrength(s.flags));
    if (!x || !s.zone) return;
    const spots = STEAL_SPOTS[s.zone.id] ?? [];
    const made = s._makePickups(spots.map((sp) => ({ id: `steal-${sp.id}`, x: sp.x, z: sp.z, marker: false, label: `<b class="steal">Steal</b> ${sp.label}` })));
    made.forEach((pk, i) => { pk.steal = spots[i]; pk.cond = () => Number(s.flags.get(`STOLE_${spots[i].id.toUpperCase()}`)) !== this.day; });
    x.pickups.push(...made);
  }

  /** Walking out of the zone mid-fight, or with a guard on your heels: you got away (and that's a crime). */
  leave() {
    const r = this.region, was = this.fight?.kind === "watch" || !!this.pursuit;
    this._endFight({ quiet: true });
    this.pursuit = null;
    if (was && r) this._eluded(r);
    this.world.softTargets = [];
  }

  // ---- Every frame while roaming ----

  tick(dt) {
    const s = this.story, x = s.exploring, w = this.world;
    if (!this.active) { if (w) w.softTargets = []; return; }
    if (this.cool > 0) this.cool -= dt;
    const people = this.people();
    // Rook's blade lands on townsfolk too (sim/world.js softTargets), but not while a field fight is on.
    w.softTargets = x.busy || (x.combat && !x.combat.law) ? [] : people.map((p) => ({ id: p.id, pos: { x: p.x, y: 0, z: p.z }, radius: 0.42, height: 1.9 }));
    this._stealChip(people);
    if (this.fight) { this._fightTick(dt); return; }
    if (x.busy || x.combat) return;
    if (this.pursuit) { this._pursuitTick(dt, people); return; }
    // A guard who catches sight of someone with a bounty: a word, or (if they ran last time) a spear.
    const r = this.region, pp = w.player.pos;
    if (this.cool <= 0 && this.law.bounty(r) > 0) {
      const g = people.find((p) => p.role === "guard" && canSee(p, pp));
      if (g) { if (this.law.wanted(r)) this._watchFight(g, "There! That's the one!"); else this._arrest(g); }
    }
  }

  /** Everyone in the zone who could see something: on their feet, in their day, with where they're facing. */
  people() {
    const s = this.story, x = s.exploring, out = [];
    if (!x) return out;
    for (const c of x.beat.cast) {
      const e = s.stage.actors.get(c.id);
      if (!e || e.actor.hiddenActor || this.off.has(c.id) || c.law === false) continue;
      const spec = c.routines?.[0] ?? c.routine;
      const role = BONDS[c.id] ? "comrade" : c.role ?? spec?.role ?? "civilian";
      out.push({ id: c.id, cast: c, actor: e.actor, rig: e.rig, x: e.actor.pos.x, z: e.actor.pos.z, yaw: e.actor.yaw, role, look: e.look ?? c.look, asleep: !!c.asleep });
    }
    return out;
  }

  // ---- Crimes ----

  /**
   * Something only a witness makes a crime. victim: whoever it was done to (they always know if they were hit).
   * Returns true if anyone saw.
   */
  crime(kind, at, { victim = null, felt = false } = {}) {
    const r = this.region;
    if (!r) return false;
    const people = this.people();
    const seen = witnesses(people, at);
    if (victim && (felt || kind === "assault" || kind === "assaultGuard") && !seen.some((p) => p.id === victim.id)) seen.unshift(victim);
    if (!seen.length) return false;
    const guards = seen.filter((p) => p.role === "guard"), comrades = seen.filter((p) => p.role === "comrade");
    const res = this.law.commit(kind, r, { byGuard: guards.length > 0, day: this.day });
    const hud = this.ctx.hud;
    if (res.warned) { // a trusted face: the guard looks the other way, once a day
      this._say(guards[0], pick(["I didn't see that. Once.", "Put it back and I never saw you, Lantern.", "Today you get a warning. Tomorrow you get a cell."]));
      hud.toast("A WARNING FROM THE WATCH", "clear");
      return true;
    }
    hud.toast(r.comrades ? `${res.crime.label} · THE SQUAD SAW` : `${res.crime.label} · BOUNTY ${res.bounty}`, "parry");
    this.ctx.sfx.play("block");
    if (comrades.length) { // family: they'll say so, then put you on the floor
      for (const c of comrades) this.story.bonds.lose?.(c.id, 8);
      const c = victim?.role === "comrade" ? victim : comrades[0];
      this._say(c, pick(COMRADE_LINES[c.id] ?? ["Really?"]));
      this._brawl([c], r);
      return true;
    }
    this._say(victim && reaction(victim) !== "arrest" ? victim : seen[0], pick(SHOUTS[kind] ?? SHOUTS.assault));
    if (guards.length) {
      if (kind === "assaultGuard" || this.law.wanted(r)) this._watchFight(guards[0], "That's it. You're coming in.");
      else this._arrest(guards[0]);
      return true;
    }
    const fighters = seen.filter((p) => reaction(p) === "fight").slice(0, 2);
    for (const p of seen.filter((q) => reaction(q) === "flee")) this._flee(p, at);
    if (fighters.length) this._brawl(fighters, r);
    this._alarm();
    return true;
  }

  /** Rook's hit (or spell) landed on somebody. */
  onSoftHit(ev) {
    if (!this.active) return;
    const p = this.people().find((q) => q.id === ev.target.id);
    if (!p) return;
    this.ctx.sfx.play("hit");
    this.ctx.hud.toast("THAT WAS A PERSON", "parry");
    if (this.fight?.kind === "brawl") return; // already scrapping
    if (p.role === "guard") { this.crime("assaultGuard", p, { victim: p }); return; }
    if (p.role === "comrade") { this.story.bonds.lose?.(p.id, 5); this._say(p, pick(COMRADE_LINES[p.id] ?? ["Hey!"])); this._brawl([p], this.region); return; }
    this.crime("assault", p, { victim: p });
  }

  /** Take something off a stall (a steal pickup). */
  steal(pk) {
    const s = this.story, sp = pk.steal, pp = this.world.player.pos;
    s.flags.set(`STOLE_${sp.id.toUpperCase()}`, this.day);
    if (sp.gift) s.flags.add(`GIFT_${sp.gift.toUpperCase()}`, 1); else s.inventory.earn(sp.marks);
    this.ctx.hud.toast(sp.gift ? `TOOK: ${GIFTS[sp.gift].name.toUpperCase()}` : `+${sp.marks} MARKS`, "clear");
    s.flags.add("THEFTS", 1);
    if (!this.crime("theft", pp)) this.ctx.hud.banner("NOBODY SAW");
  }

  /** Who's close enough to pickpocket: within 1.4 m, back to you, not had their pocket picked today. */
  pickTarget(people = this.people()) {
    const w = this.world, pp = w.player.pos;
    if (!this.active || this.fight || this.story.exploring.busy || this.story.exploring.combat) return null;
    let best = null, bd = 1.4;
    for (const p of people) {
      if (p.role === "child") continue; // not from children
      const d = Math.hypot(p.x - pp.x, p.z - pp.z);
      if (d > bd || canSee(p, pp) || Number(this.story.flags.get(`PICKED_${p.id.toUpperCase()}`)) === this.day) continue;
      bd = d; best = p;
    }
    return best;
  }

  /** The pickpocket chip (and X): from behind, quietly. Sometimes they feel it anyway. */
  pickpocket(p = this.pickTarget()) {
    if (!p) return false;
    const s = this.story;
    s.flags.set(`PICKED_${p.id.toUpperCase()}`, this.day);
    if (Math.random() < 0.15) { this.crime("pickpocket", p, { victim: p, felt: true }); return true; } // they felt it
    const marks = 4 + Math.floor(Math.random() * 15);
    s.inventory.earn(marks);
    s.flags.add("POCKETS_PICKED", 1);
    this.ctx.hud.toast(`+${marks} MARKS`, "clear");
    const others = this.people().filter((q) => q.id !== p.id);
    if (witnesses(others, this.world.player.pos).length) this.crime("pickpocket", this.world.player.pos);
    else this.ctx.hud.banner("NOBODY SAW");
    return true;
  }

  /** Script commands: <<law check>> sets $LAW_BOUNTY and $LAW_CAN_PAY for here; <<law pay>> pays it. */
  command([what]) {
    const r = this.region ?? regionOf("aurelin"), f = this.story.flags;
    if (what === "check") { f.set("LAW_BOUNTY", this.law.bounty(r)); f.set("LAW_CAN_PAY", this.story.inventory.marks >= this.law.bounty(r) ? 1 : 0); }
    if (what === "pay" && this.law.pay(r, this.story.inventory)) { f.set("LAW_BOUNTY", 0); this.ctx.hud.toast("BOUNTY PAID", "clear"); }
  }

  /** The X key: pickpocket, or (in a fight with the Watch) surrender. */
  action() {
    if (this.fight?.kind === "watch") { this.surrender(); return true; }
    return this.pickpocket();
  }

  _stealChip(people) {
    const el = this.ctx.root.querySelector("[data-steal]");
    if (!el) return;
    const t = !this.fight && !this.story.exploring.busy ? this.pickTarget(people) : null;
    if (el.hidden !== !t) el.hidden = !t;
    const sur = this.ctx.root.querySelector("[data-surrender]");
    const on = this.fight?.kind === "watch";
    if (sur && sur.hidden !== !on) sur.hidden = !on;
  }

  // ---- The Watch ----

  /** The nearest guard in the zone is sent for (a witness ran to fetch him). */
  _alarm() {
    if (this.pursuit || this.fight?.kind === "watch") return;
    const pp = this.world.player.pos;
    const g = this.people().filter((p) => p.role === "guard").sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z))[0];
    if (!g) return;
    this.pursuit = { id: g.id, t: 0, far: 0 };
    const amb = this._amb(g.id);
    if (amb) amb.hold = () => { // run to Rook
      const p = this.world.player.pos;
      return { target: { x: p.x, z: p.z }, speed: 4.4, face: null, activity: "walk", look: p };
    };
    this.ctx.hud.banner("SOMEONE'S GONE FOR THE WATCH");
  }

  _pursuitTick(dt, people) {
    const pu = this.pursuit, g = people.find((p) => p.id === pu.id);
    pu.t += dt;
    if (!g) { this.pursuit = null; return; }
    const pp = this.world.player.pos, d = Math.hypot(g.x - pp.x, g.z - pp.z);
    if (d < 1.7) { const amb = this._amb(g.id); if (amb) amb.hold = null; this.pursuit = null; if (this.law.wanted(this.region)) this._watchFight(g, "Stop right there!"); else this._arrest(g); return; }
    pu.far = d > 22 && pu.t > 3 ? pu.far + dt : 0;
    if (pu.far > 6) { // you outran him
      const amb = this._amb(g.id); if (amb) amb.hold = null;
      this.pursuit = null;
      this._eluded(this.region);
    }
  }

  /** "Halt." A guard with a bounty to settle: pay, come quietly, or resist. Luke lets you go, once. */
  async _arrest(g) {
    const s = this.story, x = s.exploring, r = this.region;
    if (!x || x.busy) return;
    const amb = this._amb(g.id); if (amb) amb.hold = null;
    const f = s.flags;
    f.set("LAW_BOUNTY", this.law.bounty(r)); f.set("LAW_CAN_PAY", s.inventory.marks >= this.law.bounty(r) ? 1 : 0);
    f.set("LAW_LUKE", g.id === "luke" && !f.get("LUKE_SPARED") ? 1 : 0); f.set("LAW_CHOICE", 0);
    f.set("LAW_RENOWN", this.law.renown(r));
    await this._talk(g, "L_Arrest");
    if (!s.exploring) return;
    const choice = Number(f.get("LAW_CHOICE"));
    this.cool = 3;
    if (choice === 1 && this.law.pay(r, s.inventory)) { this.ctx.hud.toast("BOUNTY PAID", "clear"); s.saveNow(); return; }
    if (choice === 2) { this.jail({ surrendered: true }); return; }
    if (choice === 4) { f.set("LUKE_SPARED", 1); this.law.clear(r); this.ctx.hud.toast("LUKE LOST THE PAPERWORK", "clear"); s.saveNow(); return; }
    this._watchFight(g, "Have it your way.");
  }

  /** A fight with the Watch: this guard first, then whoever answers his whistle. */
  _watchFight(g, line) {
    const r = this.region, s = this.story, x = s.exploring;
    this.law.setWanted(r, true);
    this.pursuit = null;
    if (this.fight?.kind === "brawl") this._endFight({ quiet: true }); // the Watch breaks up a street fight
    this.fight = { kind: "watch", region: r, fighters: new Map(), reserve: watchStrength(s.flags) + 1, whistleT: 4, far: 0, downed: 0 };
    x.combat = { id: "law", law: true, at: { x: g.x, z: g.z }, label: "THE WATCH" };
    this.world.player.relaxed = false;
    this._say(g, line);
    this._toFighter(g, "guard");
    this.ctx.hud.banner("THE WATCH · X TO SURRENDER");
  }

  /** People who fight back with their fists. They give up when they're hurt. */
  _brawl(people, r) {
    const s = this.story, x = s.exploring;
    if (this.fight) return;
    this.fight = { kind: "brawl", region: r, fighters: new Map(), far: 0 };
    x.combat = { id: "law", law: true, at: { x: people[0].x, z: people[0].z }, label: "A FIGHT" };
    this.world.player.relaxed = false;
    for (const p of people) this._toFighter(p, "brawler");
    this.ctx.hud.banner(people[0].role === "comrade" ? "FAMILY BUSINESS" : "THEY'RE FIGHTING BACK");
  }

  /** Out of the street and into the fight: the townsperson's body becomes a fighter where they stand. */
  _toFighter(p, kind) {
    const w = this.world;
    const f = w.spawnEnemy(kind, p.x, p.z, 50 + this.n++);
    f.look = p.look ?? kind;
    if (kind === "brawler" && p.role === "comrade") { const hp = f.combatant.health; hp.max *= 2; hp.set(hp.max); } // squadmates take some putting down
    p.rig.setVisible(false); p.actor.hiddenActor = true;
    this.off.add(p.id);
    const amb = this._amb(p.id); if (amb) { amb.off = true; amb.hold = null; }
    this.fight.fighters.set(f, p);
    this.ctx.onEvents(w.drainEvents());
    return f;
  }

  _fightTick(dt) {
    const F = this.fight, w = this.world, pp = w.player.pos, hud = this.ctx.hud;
    for (const [f, p] of F.fighters) {
      if (F.kind === "brawl" && f.alive && f.combatant.health.current < f.combatant.health.max * 0.25) { // they've had enough
        this._say(p, pick(p.role === "comrade" ? ["Okay! Okay. Good hit.", "Fine. FINE. You're doing the dishes for a month.", "...We're not telling Dagrun about this."] : ["Alright! Alright, take it!", "I yield! I yield!", "You're mad. You're all mad."]));
        this._restore(f, p);
        continue;
      }
      if (!f.alive && !f.counted) { // knocked out (nobody dies in a street fight)
        f.counted = true;
        if (F.kind === "watch") { F.downed++; this.law.commit("guardDown", F.region, { day: this.day }); hud.toast("GUARD KNOCKED OUT", "parry"); }
      }
    }
    const up = [...F.fighters.keys()].filter((f) => f.alive);
    if (F.kind === "brawl" && !up.length && ![...F.fighters.keys()].some((f) => !f.counted && !f.alive)) { this._endFight({ won: true }); hud.banner("THEY BACK OFF"); this._alarm(); return; }
    if (F.kind === "watch") {
      // The whistle: another guard answers, from his post (or from the gate, if the Watch has more to send).
      F.whistleT -= dt;
      const waiting = this.people().filter((p) => p.role === "guard");
      if (F.whistleT <= 0 && up.length < 3) {
        if (waiting.length || F.reserve > 0) {
          F.whistleT = 9;
          this.ctx.sfx.play("guardWhistle");
          hud.toast("A GUARD WHISTLES FOR BACKUP", "parry");
          const next = waiting.sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z))[0];
          this.story.sleep(1.4).then(() => {
            if (this.fight !== F) return;
            if (next && !this.off.has(next.id)) { this._say(next, "Coming!"); this._toFighter(next, "guard"); return; }
            if (F.reserve <= 0) return;
            F.reserve--;
            const z = this.story.zone, at = z.arrivals?.gate ?? z.spawn;
            const f = w.spawnEnemy("guard", at.x, at.z, 50 + this.n++); f.look = "guard";
            F.fighters.set(f, null);
            this.ctx.onEvents(w.drainEvents());
          });
        } else if (!up.length) { this._endFight({ won: true }); hud.banner("THE WATCH FALLS BACK · YOUR BOUNTY STANDS"); return; }
      }
      // Clear of every guard for long enough: you got away.
      const near = up.length ? Math.min(...up.map((f) => Math.hypot(f.pos.x - pp.x, f.pos.z - pp.z))) : 0;
      F.far = up.length && near > 30 ? F.far + dt : 0;
      if (F.far > 5) { const r = F.region; this._endFight({ quiet: true }); this._eluded(r); }
    }
  }

  /** A fight is over: fighters leave the field, and the townsfolk they were step back into their day. */
  _endFight({ won = false, quiet = false } = {}) {
    const F = this.fight, s = this.story, w = this.world;
    if (!F) return;
    this.fight = null;
    for (const [f, p] of F.fighters) this._restore(f, p, { knocked: !f.alive && F.kind === "watch" });
    w.clearEnemies?.();
    this.ctx.onEvents(w.drainEvents());
    if (s.exploring?.combat?.law) s.exploring.combat = null;
    w.player.relaxed = true;
    this.cool = 4;
    if (!quiet && won) s.saveNow();
  }

  /** Put the townsperson back where their fighter stood (a knocked-out guard is carried off for the day). */
  _restore(f, p, { knocked = false } = {}) {
    const F = this.fight, w = this.world;
    if (F) F.fighters.delete(f);
    if (w.fighters.includes(f)) { w.emit({ type: "despawn", fighter: f }); w.fighters = w.fighters.filter((q) => q !== f); this.ctx.onEvents(w.drainEvents()); }
    if (!p) return;
    if (knocked) return; // stays off (out of sight) until you come back
    p.actor.pos.x = p.actor.prev.x = f.pos.x; p.actor.pos.z = p.actor.prev.z = f.pos.z;
    p.actor.hiddenActor = false; p.rig.setVisible(true);
    this.off.delete(p.id);
    const amb = this._amb(p.id); if (amb) { amb.off = false; amb.hold = null; }
  }

  /** You got away: the Watch will remember (a bounty, and spears on sight). */
  _eluded(r) {
    if (!r || r.comrades) return;
    this.law.commit("eluding", r, { day: this.day });
    this.law.setWanted(r, true);
    this.ctx.hud.banner(`ELUDED THE WATCH · BOUNTY ${this.law.bounty(r)}`);
    this.story.saveNow();
  }

  /** The X key (or the SURRENDER button) in a fight with the Watch. */
  surrender() {
    if (this.fight?.kind !== "watch") return;
    this.ctx.hud.banner("YOU SURRENDER");
    this.jail({ surrendered: true });
  }

  /** You fell. To the Watch: the cells. In a street fight: you get up, sore, and they've gone. */
  async fell() {
    const F = this.fight, s = this.story;
    if (!F) return;
    if (F.kind === "watch") { await s.sleep(1.6); this.jail({ surrendered: false }); return; }
    await s.sleep(1.8);
    if (this.fight !== F) return;
    this._endFight({ quiet: true });
    this.world.revivePlayer(0.4);
    this.ctx.onEvents(this.world.drainEvents());
    this.ctx.hud.banner("KNOCKED FLAT");
    this._alarm();
  }

  /** The cells, in the Watch House by Aurelin's south gate: the bounty served as time. */
  jail({ surrendered }) {
    const s = this.story, x = s.exploring, r = this.fight?.region ?? this.region;
    this._endFight({ quiet: true });
    this.pursuit = null;
    const res = this.law.serve(r, s.inventory, { surrendered });
    const f = s.flags;
    f.set("JAILED", 1); f.set("JAIL_HOURS", res.hours); f.set("JAIL_FINE", res.fine); f.set("JAIL_SURRENDERED", surrendered ? 1 : 0);
    if (s.clock) { const h = s.clock.hour + res.hours; if (h >= 24) s.clock.day++; s.clock.hour = h % 24; }
    this.world.revivePlayer(1);
    this.ctx.onEvents(this.world.drainEvents());
    this.ctx.hud.banner(surrendered ? "TAKEN IN" : "YOU FALL TO THE WATCH");
    if (x && !x.busy) { x.busy = true; x.resolve({ exit: { to: "watchhouse", spawn: "cell" } }); }
  }

  // ---- Little helpers ----

  _amb(id) { return this.story.ambient?.people.find((q) => q.id === id) ?? null; }

  _flee(p, from) {
    const amb = this._amb(p.id);
    if (!amb) return;
    let t = 0;
    amb.hold = (q, dt) => {
      t += dt;
      if (t > 5) { amb.hold = null; return null; }
      const a = q.actor, dx = a.pos.x - from.x, dz = a.pos.z - from.z, d = Math.hypot(dx, dz) || 1;
      return { target: { x: a.pos.x + (dx / d) * 4, z: a.pos.z + (dz / d) * 4 }, speed: 3.6, face: null, activity: "flee", look: null };
    };
  }

  _say(p, text) {
    if (!p || !text) return;
    const c = Object.values(CAST).find((k) => k.actor === p.id);
    const name = c?.name ?? p.cast?.name ?? ROLE_NAMES[p.role] ?? "Townsperson";
    this.story.say(null, text, name);
  }

  /** A conversation with someone in the street, the way talking to anyone works (story.interact). */
  async _talk(p, node) {
    const s = this.story, x = s.exploring, w = this.world;
    x.busy = true; s.ui.talk.hidden = true;
    s._enterScene(true);
    const pl = w.player; pl.vel.x = pl.vel.z = 0; pl.moveInput.x = pl.moveInput.z = 0; pl.runner.interrupt();
    s.stage.face("player", p.id); s.stage.face(p.id, "player");
    s._shot("two", [p.id, "player"]);
    await s.runNode(node);
    if (!s.exploring) return;
    s.skipping = false;
    s._enterScene(false);
    s.view.hide();
    x.busy = false; x.near = null; x.cooldown = 0.6;
    s._objective();
  }
}
