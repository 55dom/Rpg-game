// The combat run director: walks an episode's encounters, handles clears, rests, retries,
// the boss, and the results. Lives inside the simulation, so whole runs are testable in Node.

import { RUN_TUNING, runRank } from "../data/run.js";

export class RunDirector {
  constructor(world, episode) {
    this.world = world;
    this.episode = episode;
    this.index = -1;
    this.state = "idle"; // idle → intro → fighting → rest → … → victory → done | retrying
    this.timer = 0;
    this.stats = { frames: 0, maxCombo: 0, damageDealt: 0, damageTaken: 0, reactions: 0, assists: 0, perfect: 0, kills: 0, retries: 0 };
  }

  get encounter() { return this.episode.encounters[this.index]; }
  get finished() { return this.state === "done"; }

  start() {
    this.world.emit({ type: "runStart", episode: this.episode });
    this._next();
  }

  _next() {
    this.index++;
    if (this.index >= this.episode.encounters.length) return;
    this.state = "intro";
    this.timer = RUN_TUNING.introFrames;
    const enc = this.encounter;
    this.world.emit({ type: "runStage", index: this.index, total: this.episode.encounters.length, encounter: enc });
    for (const [speaker, text] of enc.lines ?? []) this.world.emit({ type: "runLine", speaker, text });
  }

  tick() {
    const w = this.world;
    if (this.state !== "idle" && this.state !== "done") this.stats.frames++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, w.comboCount);
    switch (this.state) {
      case "fighting":
        // Robust victory check: the boss is down, however it happened.
        if (this.encounter.boss && w.boss && !w.boss.alive) this._victory();
        break;
      case "intro":
        if (--this.timer <= 0) { w.spawnWave(this.encounter.wave); this.state = "fighting"; }
        break;
      case "rest":
        if (--this.timer <= 0) this._next();
        break;
      case "retrying":
        if (--this.timer <= 0) {
          w.resetPlayer();
          this.stats.retries++;
          w.emit({ type: "runRetry", index: this.index, encounter: this.encounter });
          w.spawnWave(this.encounter.wave);
          this.state = "fighting";
        }
        break;
      case "victory":
        if (--this.timer <= 0) {
          this.state = "done";
          w.emit({ type: "runComplete", stats: { ...this.stats }, rank: runRank(this.stats), episode: this.episode });
        }
        break;
      default: break;
    }
  }

  _victory() {
    this.state = "victory"; this.timer = RUN_TUNING.victoryFrames;
    for (const [speaker, text] of this.episode.victoryLines ?? []) this.world.emit({ type: "runLine", speaker, text });
  }

  /** Called by the world for every event it emits. */
  onEvent(e) {
    const w = this.world, s = this.stats;
    switch (e.type) {
      case "hit":
        if (e.attacker.team === w.player.team) s.damageDealt += e.result.healthDamage;
        if (e.defender === w.player) s.damageTaken += e.result.healthDamage;
        break;
      case "reaction": s.reactions++; break;
      case "assist": s.assists++; break;
      case "perfectDodge": case "parry": if (e.defender === w.player) s.perfect++; break;
      case "kill":
        if (e.defender.team !== w.player.team) s.kills++;
        if (e.defender.stats.boss && this.state === "fighting") this._victory();
        break;
      case "waveClear":
        if (this.state === "fighting" && !this.encounter.boss) {
          this.state = "rest"; this.timer = RUN_TUNING.restFrames;
          for (const f of w.fighters) {
            if (f.team !== w.player.team || !f.alive) continue;
            const h = f.combatant.health;
            h.add((h.max - h.current) * RUN_TUNING.restHeal);
          }
          w.emit({ type: "runCleared", index: this.index, encounter: this.encounter });
        }
        break;
      case "playerDown":
        if (this.state === "fighting") { this.state = "retrying"; this.timer = RUN_TUNING.retryFrames; }
        break;
      default: break;
    }
  }
}
