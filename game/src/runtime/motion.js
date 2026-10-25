// How the bodies move (GDD §29.7). Each frame the legs are solved with two-bone IK toward foot
// targets: a walk/run cycle driven by distance travelled (so planted feet never skate), an idle
// stance with breathing and weight shifts, a fighting stance, lunges for attacks, and jump and
// landing poses. Personality (data/sheets.js GAITS/IDLES) changes stride, bounce, sway and carriage.

import { solveLeg, footInCycle, cycleBob } from "../core/ik.js";
import { GAITS, IDLES } from "../data/sheets.js";

const ANKLE_H = 0.075;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, k) => a + (b - a) * k;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Pose the legs, pelvis, chest and arms of a humanoid rig.
 * @param pose {{ lean, active, attacking, relaxed, run }} from the rig's arm-pose step
 * @returns {{ armSwing: number }} how far the weapon arm should swing with the stride
 */
export function animateHumanoid(rig, f, dt, pose) {
  const S = rig.sheet, G = GAITS[S.gait] ?? GAITS.confident, I = IDLES[S.idle] ?? IDLES.relaxed;
  const mo = (rig.mo ??= { phase: Math.random(), speed: 0, land: 0, air: false, lastYaw: f.yaw, idle: Math.random() * 10, shift: 0, shiftTo: 1, shiftT: 2, dead: 0 });
  const scale = rig.look.scale ?? 1;
  const a = rig.legA, b = rig.legB, hipY = rig.hipY;
  const c = f.combatant;

  // ---- velocity in the body's own frame ----
  const yaw = f.yaw, vx = f.vel.x, vz = f.vel.z;
  const fwd = vx * Math.sin(yaw) + vz * Math.cos(yaw), side = vx * Math.cos(yaw) - vz * Math.sin(yaw);
  const raw = Math.hypot(fwd, side) / scale;
  const turn = Math.abs(wrap(yaw - mo.lastYaw)) / Math.max(dt, 1e-3);
  mo.lastYaw = yaw;
  const grounded = f.grounded !== false && !f.hopAir; // hopAir: a boss mid-hop that the controller carries (Gullmaw's lily pads)
  mo.speed = lerp(mo.speed, raw, clamp(dt * 10, 0, 1));
  const spd = grounded ? mo.speed : 0;
  const runK = clamp((spd - 2.6) / 1.8, 0, 1);
  const dirLen = Math.hypot(fwd, side) || 1;
  const dir = raw > 0.05 ? { x: side / dirLen, z: fwd / dirLen } : { x: 0, z: 1 };

  // ---- the cycle: advances by distance, so a planted foot moves back exactly as fast as the body moves on ----
  // Cadence (quick little steps vs long strides) changes the stride length, never the sync with distance.
  const cycle = lerp(1.15, 2.3, runK) * G.stride / G.steps * (a + b) / 0.9;
  const stepping = spd + Math.min(turn * 0.25, 1.2) * (spd < 0.3 ? 1 : 0); // turning on the spot takes little steps
  mo.phase = (mo.phase + (stepping * dt) / cycle) % 1;
  const moveK = clamp(stepping / 0.7, 0, 1);
  const stance = lerp(0.62, 0.38, runK), liftH = lerp(0.085, 0.2, runK) * (0.8 + 0.2 * G.bounce);

  // ---- landings, falls, kneels ----
  if (!grounded) mo.air = true;
  else if (mo.air) { mo.air = false; mo.land = 1; }
  mo.land = Math.max(0, mo.land - dt / 0.24);
  const dead = !f.alive;
  const yields = dead && f.stats?.yields;
  mo.dead = dead && !yields ? Math.min(1, mo.dead + dt * 3.5) : 0;

  // ---- idle: breathing and the odd weight shift ----
  mo.idle += dt;
  mo.shiftT -= dt;
  if (mo.shiftT <= 0) { mo.shiftTo = -mo.shiftTo; mo.shiftT = 2.5 + Math.random() * 3 / Math.max(0.1, I.shift); }
  mo.shift = lerp(mo.shift, mo.shiftTo * I.shift, clamp(dt * 1.6, 0, 1));
  const breath = Math.sin(mo.idle * 1.7 * I.breath);
  const fighting = !pose.relaxed && f.alive;

  // ---- pelvis height ----
  const bob = cycleBob(mo.phase, lerp(0.022, 0.05, runK) * G.bounce) * moveK;
  let crouch = 0;
  if (fighting && spd < 0.4) crouch += 0.045;
  if (pose.attacking) crouch += 0.03 + 0.07 * Math.min(1, Math.abs(pose.lean));
  if (c.isStaggered) crouch += c.postureBroken ? 0.2 : 0.07;
  crouch += mo.land * 0.13;
  if (yields) crouch += 0.42;
  let pelvisY = hipY + bob - crouch + (grounded ? 0 : 0.0);
  const seated = f.seated && grounded && f.alive && spd < 0.3; // on a chair: hips at seat height, knees forward
  if (seated) pelvisY = f.seated / scale + 0.06;
  const sway = Math.sin(mo.phase * TAU) * 0.022 * G.sway * moveK + (1 - moveK) * mo.shift * 0.025;
  rig.pelvis.position.set(sway, pelvisY, 0);
  rig.pelvis.rotation.set(-mo.dead * 1.45, Math.sin(mo.phase * TAU) * 0.11 * moveK * (1 - runK * 0.4) + (pose.attacking ? -0.22 * pose.lean : 0),
    Math.sin(mo.phase * TAU) * 0.04 * G.sway * moveK - (1 - moveK) * mo.shift * 0.04);
  if (mo.dead) rig.pelvis.position.y = lerp(pelvisY, 0.2, mo.dead);

  // ---- feet ----
  const hipH = rig.pelvis.position.y - 0.03; // hip joint height above the ground
  for (const leg of rig.legs) {
    const s = leg.side, lead = s < 0; // the off side leads in a fighting stance
    let tx, tz, ty;
    if (!grounded) { // jump: tuck going up, reach for the ground coming down
      const up = f.hopAir ? f.hopUp : f.vel.y > 0;
      tz = lead ? (up ? 0.16 : 0.12) : (up ? -0.18 : -0.06);
      ty = hipH - (up ? (lead ? 0.55 : 0.68) : 0.86) * (a + b);
      tx = leg.x;
    } else {
      // Standing targets: relaxed, fighting, lunging, kneeling.
      let sx = leg.x * (G.wide ? 1.25 : 1.05), sz = s * -0.035, sy = 0;
      if (fighting) { sx = leg.x * 1.5; sz = lead ? 0.16 : -0.16; }
      if (pose.attacking) { sz = lead ? 0.22 + 0.2 * Math.min(1, Math.abs(pose.lean)) : -0.24; sx = leg.x * 1.4; }
      if (yields) { sz = lead ? 0.32 : -0.18; } // one knee down: the back knee meets the ground
      if (!fighting && !yields) sz += (s === Math.sign(mo.shift || 1) ? 0 : 0.03); // the resting leg eases forward
      if (seated) { sx = leg.x * 1.15; sz = a * 0.92 + (s > 0 ? 0.02 : -0.02); }
      // Walking/running targets from the cycle.
      const foot = footInCycle(mo.phase + (s > 0 ? 0.5 : 0), cycle, { stance, lift: liftH });
      const gx = leg.x * (G.narrow ? 0.55 : G.wide ? 1.2 : 0.9) + dir.x * foot.along, gz = dir.z * foot.along;
      const k = pose.attacking ? 0 : moveK;
      tx = lerp(sx, gx, k); tz = lerp(sz, gz, k); sy = foot.lift * k;
      ty = ANKLE_H + sy + (yields && !lead ? -0.01 : 0);
      // A planted foot rolls onto its toes as it pushes off.
      leg.toe = foot.planted && k > 0.3 ? clamp((0.5 - foot.along / (stance * cycle)) * 2 - 0.6, 0, 1) * 0.5 * k : 0;
    }
    const dx = tx - leg.x, h = hipH - ty;
    leg.hip.rotation.z = Math.atan2(dx, Math.max(0.05, h)) * (mo.dead ? 0.3 : 1);
    const sol = solveLeg(a, b, -Math.hypot(h, dx), tz);
    leg.hip.rotation.x = sol.hip; leg.knee.rotation.x = sol.knee;
    leg.ankle.rotation.x = sol.ankle + (leg.toe ?? 0) * 0.6;
    if (yields && !lead) leg.ankle.rotation.x += 0.9; // kneeling: the back foot on its toes
  }

  // ---- chest and arms ----
  const chest = G.lean + I.chest * (1 - moveK) + runK * 0.22 + breath * 0.008;
  rig.chestLean = chest;
  rig.body.position.y = breath * 0.006;
  const counter = -rig.pelvis.rotation.y * 0.85; // shoulders turn against the hips
  rig.bodyTwist = counter;
  const swing = (0.32 + runK * 0.45) * G.armSwing * moveK;
  const arm = Math.cos(mo.phase * TAU);
  if (rig.offArm && !f.offPose && !rig.look.carry) {
    let rx = 0.12 + arm * swing, rz = -0.2 - 0.05 * moveK; // angled out from the shoulder, clear of the coat
    if (c.blocking || f.current?.id === "Guard") rx = -0.9;
    if (!grounded) { rx = -0.5; rz = -0.5; }
    if (mo.dead) { rx = -0.6 * mo.dead; rz = -0.9 * mo.dead; }
    rig.offArm.rotation.set(rx, 0, rz);
    if (rig.offElbow) rig.offElbow.rotation.x = -(0.2 + runK * 1.1 + (fighting ? 0.4 : 0) + Math.max(0, -arm) * 0.25 * moveK);
  }
  return { armSwing: -arm * swing };
}
