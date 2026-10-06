// Leg math for the character bodies (GDD §29.7). Pure functions, no Babylon, so they're testable.
//
// A leg is two bones (thigh a, calf b) hanging from the hip along −Y, with the foot on the ankle.
// Rotations follow the rig's convention: rotation.x > 0 swings the lower end backward (−Z).

/**
 * Two-bone IK: the hip, knee and ankle rotations that put the ankle at (dy, dz) from the hip
 * (dy < 0 is below). The knee always bends forward, like a person's. Out-of-reach targets are
 * reached as far as the leg allows (straight leg pointing at the target).
 * @returns {{ hip: number, knee: number, ankle: number, reach: number }} ankle keeps the foot flat.
 */
export function solveLeg(a, b, dy, dz) {
  const want = Math.hypot(dy, dz);
  const D = Math.min(Math.max(want, Math.abs(a - b) + 1e-4), a + b - 1e-4);
  const toward = Math.atan2(dz, -dy);                       // 0 = straight down, + = forward
  const cosKnee = (a * a + b * b - D * D) / (2 * a * b);
  const bend = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosKnee)));
  const cosHip = (a * a + D * D - b * b) / (2 * a * D);
  const lift = Math.acos(Math.max(-1, Math.min(1, cosHip)));
  const hip = -(toward + lift);                             // thigh swings forward (negative x rotation)
  const knee = bend;                                        // calf folds back
  return { hip, knee, ankle: -(hip + knee), reach: want <= a + b };
}

/** Where an ankle ends up for given joint angles (forward kinematics, for tests and foot checks). */
export function ankleAt(a, b, hip, knee) {
  const y = -a * Math.cos(hip) - b * Math.cos(hip + knee);
  const z = -a * Math.sin(hip) - b * Math.sin(hip + knee);
  return { dy: y, dz: z };
}

/**
 * One foot's place in the walk cycle. `q` is that foot's phase (0–1): stance first (the foot is
 * planted and slides back under the body at exactly the body's speed), then swing (it lifts and
 * reaches forward for the next contact). `stride` is the distance the body covers in one full cycle.
 * Because the cycle advances by distance travelled, a planted foot never skates.
 * Returns the foot's offset along the direction of travel (`along`) and its height (`lift`).
 */
export function footInCycle(q, stride, { stance = 0.6, lift = 0.12 } = {}) {
  q = ((q % 1) + 1) % 1;
  const reach = stance * stride;                            // how far the planted foot travels back
  if (q < stance) return { along: reach / 2 - (q / stance) * reach, lift: 0, planted: true };
  const k = (q - stance) / (1 - stance);
  const e = k * k * (3 - 2 * k);                            // ease: slow lift-off, fast pass, soft contact
  return { along: -reach / 2 + e * reach, lift: Math.sin(Math.PI * k) * lift, planted: false };
}

/** Body bob for a cycle phase: lowest at contact (both feet down), highest at passing. */
export const cycleBob = (p, amount) => -amount * Math.cos(p * Math.PI * 4);
