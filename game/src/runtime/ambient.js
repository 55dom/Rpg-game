// Townsfolk going about their day (GDD §29.8): moves zone actors along their routines (sim/routine.js),
// poses them at work, turns heads toward the player, and hides people who've gone home for the night.

import { Routine } from "../sim/routine.js";
import { constrain } from "../sim/bounds.js";
import { compileExpr, truthy } from "../core/flags.js";

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** Arm poses for work, as functions of time (weapon arm, off arm, bow). Each loops on its own rhythm. */
const WORK = {
  hammer: (t) => { const k = (t * 1.1) % 1; return { arm: k < 0.55 ? [-1.25 + k * 0.6, 0.25, 0] : [0.75, 0.2, 0], bow: k < 0.55 ? 0.05 : 0.22 }; },
  sweep: (t) => ({ arm: [1.05, -0.55 + Math.sin(t * 2.6) * 0.55, 0.1], off: [-0.6, 0, 0.6 + Math.sin(t * 2.6) * 0.3], bow: 0.22 }),
  stir: (t) => ({ arm: [0.55, -0.45 + Math.sin(t * 4) * 0.3, Math.cos(t * 4) * 0.25], bow: 0.15 }),
  hawk: (t) => ((t % 5) < 1.2 ? { arm: [-1.3, 0.25, 0] } : { arm: [0.6, -0.4, 0] }),
  fish: (t) => ({ arm: [0.35 + Math.sin(t * 0.7) * 0.05, 0.1, 0], bow: 0.05 }),
  read: () => ({ arm: [0.55, -0.65, 0], off: [-0.9, 0, 0.5], bow: 0.18 }),
  sew: (t) => ({ arm: [0.55, -0.6 + Math.sin(t * 6) * 0.15, 0], off: [-0.9, 0, 0.45], bow: 0.2 }),
  strum: (t) => ({ arm: [0.75, -0.75 + Math.sin(t * 9) * 0.18, 0], off: [-1.0, 0, 0.7], bow: 0.05 }),
  punch: (t) => { const k = (t * 1.4) % 1; return { arm: k < 0.3 ? [0.05, -0.05, 0] : [0.7, 0.35, 0], fight: true }; },
  practice: (t) => ({ arm: [Math.sin(t * 2.2) * 1.1, 0.2 + Math.cos(t * 2.2) * 0.4, 0], fight: true }),
  light: (t) => ({ arm: [-1.1 + Math.sin(t * 1.5) * 0.1, 0.15, 0] }),
  hoe: (t) => { const k = (t * 0.9) % 1; return { arm: k < 0.5 ? [-0.9, 0.1, 0] : [0.9, 0.1, 0], bow: k < 0.5 ? 0.05 : 0.35 }; },
  play: (t) => ({ arm: [-1.2 + Math.abs(Math.sin(t * 5)) * 0.6, 0.3, 0], off: [-1.6 + Math.abs(Math.cos(t * 5)) * 0.6, 0, -0.3] }),
  chat: (t) => (Math.sin(t * 1.3) > 0.4 ? { arm: [0.4, -0.3, 0.3] } : {}),
  work: (t) => ({ arm: [0.6, -0.3, 0.2 + Math.sin(t * 3) * 0.2], bow: 0.15 }),
  cower: () => ({ arm: [0.85, -1.15, 0], off: [-0.5, 0, 1.25], bow: 0.5, crouch: true }),
  shelter: () => ({ arm: [0.85, -1.15, 0], off: [-0.5, 0, 1.25], bow: 0.08 }),
};

export class Ambient {
  /**
   * @param stage the story Stage holding the zone's actors
   * @param zone  data/zones.js entry (cast entries may carry a routine, or routines with `when` conditions)
   */
  constructor(stage, zone, flags, rng = Math.random) {
    this.stage = stage;
    this.zone = zone;
    this.people = [];
    for (const c of zone.cast) {
      const specs = c.routines ?? (c.routine ? [c.routine] : []);
      const spec = specs.find((r) => !r.when || truthy(compileExpr(r.when)(flags)));
      if (!spec) continue;
      const entry = this.stage.actors.get(c.id);
      if (!entry) continue;
      this.people.push({ id: c.id, cast: c, actor: entry.actor, rig: entry.rig,
        routine: new Routine({ ...spec, home: spec.home ?? zone.homes?.[c.id], shelter: spec.shelter ?? zone.shelters }, rng), t: rng() * 10, headYaw: 0 });
    }
  }

  /**
   * @param ctx {{ dt, player: {x,z,moving}, combat: {x,z}|null, raining, night, busy, talkingTo }}
   */
  update(ctx) {
    const { dt } = ctx;
    for (const p of this.people) {
      const a = p.actor, r = p.rig;
      p.t += dt;
      if (ctx.busy) { a.vel.x = a.vel.z = 0; continue; } // a conversation is on: everyone holds still
      const out = p.routine.update({ pos: a.pos, player: ctx.player, combat: ctx.combat, raining: ctx.raining, night: ctx.night, dt });
      // Home for the night: out of sight (and out of reach of the talk prompt).
      if (!!out.hidden !== !!a.hiddenActor) { a.hiddenActor = !!out.hidden; r.setVisible(!out.hidden); }
      if (out.hidden) { a.vel.x = a.vel.z = 0; continue; }
      if (out.target) {
        const dx = out.target.x - a.pos.x, dz = out.target.z - a.pos.z, d = Math.hypot(dx, dz);
        const step = Math.min(d, out.speed * dt);
        a.pos.x += (dx / d) * step; a.pos.z += (dz / d) * step;
        constrain(a.pos, 0.35, this.zone.bounds);
        a.prev.x = a.pos.x; a.prev.z = a.pos.z;
        a.vel.x = (dx / d) * out.speed; a.vel.z = (dz / d) * out.speed;
        a.targetYaw = Math.atan2(dx, dz);
      } else {
        a.vel.x = a.vel.z = 0;
        if (out.face != null) a.targetYaw = out.face;
      }
      // Hands busy with the job at hand.
      const job = !out.target ? WORK[out.activity] : null;
      const pose = job ? job(p.t) : {};
      a.armPose = pose.arm ?? null; a.offPose = pose.off ?? null; a.bow = pose.bow ?? 0;
      a.relaxed = !(pose.fight || out.activity === "alert");
      // Eyes on the player: the head turns (within reason) toward whoever they're watching.
      let want = 0;
      if (out.look) want = clamp(wrap(Math.atan2(out.look.x - a.pos.x, out.look.z - a.pos.z) - a.yaw), -1.1, 1.1);
      p.headYaw += (want - p.headYaw) * Math.min(1, dt * 4);
      if (r.head && r.head !== r.shoulder) r.head.rotation.y = p.headYaw;
    }
  }
}
