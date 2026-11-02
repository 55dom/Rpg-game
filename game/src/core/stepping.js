// Limited animation (GDD §19.6, §19.7). Pose playback is sampled at 12 fps, "animating on twos", for the held,
// punchy anime look, while gameplay keeps its 60 Hz clock: only what's drawn steps, never what's simulated.
//
// The tiers (§19.7), each a playback mode:
//   A  Standard   lights, enemy basics       "twos"    every phase stepped
//   B  Major      heavies, spells, finishers "hybrid"  stepped anticipation, the release at full rate
//   C  Cinematic  ultimates, Team Attacks    "full"    authored per shot: never stepped
// A move can say its own (`step: "twos" | "hybrid" | "full"` in its data, §19.6: "an animation stepping option per
// move"); otherwise its tags decide.
//
// Stepping works on drawings, not on the clock: each phase of a move (windup, release, follow-through) gets one
// drawing per five sim frames (60 / 12), at least one, and the key poses are never skipped. The windup and the release
// arrive on their key pose and hold it; the follow-through holds its pose first, then eases home in steps.

import { isHitSet } from "./combat.js";

export const SIM_HZ = 60, STEP_FPS = 12, STEP_FRAMES = SIM_HZ / STEP_FPS;
export const STEP_MODES = Object.freeze(["twos", "hybrid", "full"]);
export const TIERS = Object.freeze({
  A: Object.freeze({ name: "Standard", mode: "twos", use: "lights, locomotion, enemy basics" }),
  B: Object.freeze({ name: "Major", mode: "hybrid", use: "heavies, spells, finishers" }),
  C: Object.freeze({ name: "Cinematic", mode: "full", use: "ultimates, Team Attacks, story" }),
});

const CINEMATIC = new Set(["ultimate", "team"]);
const MAJOR = new Set(["heavy", "finisher", "burst", "assist", "counter", "forbidden", "ink"]);

/** A move's tier: "A", "B" or "C". */
export function animTier(ability) {
  if (!ability) return "A";
  if (ability.step) return Object.keys(TIERS).find((k) => TIERS[k].mode === ability.step) ?? "A";
  const tags = ability.tags ?? [];
  if (tags.some((t) => CINEMATIC.has(t))) return "C";
  if (tags.some((t) => MAJOR.has(t))) return "B";
  if (ability.hit && !isHitSet(ability.hit) && (ability.hit.hitstop ?? 0) >= 8) return "B"; // a blow that stops the world is a major one
  return "A";
}

/** How a move is drawn: "twos", "hybrid" or "full". */
export const stepMode = (ability) => TIERS[animTier(ability)].mode;

/** Drawings in a phase of `len` frames. */
export const drawings = (len) => Math.max(1, Math.round(len / STEP_FRAMES));

/** Hold k (0..1 through a phase) on one of n drawings: `arrive` lands on each pose and holds it, otherwise it holds the last. */
export function holdK(k, n, arrive) {
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  return arrive ? Math.ceil(k * n - 1e-9) / n : Math.floor(k * n + 1e-9) / n;
}

/**
 * The frame a move's pose is drawn at, for a move at (fractional) frame f: the same frame for "full", and the release
 * of a "hybrid". Elsewhere f is moved to the drawing its phase is holding. `on: false` (the setting) draws every frame.
 */
export function steppedFrame(ability, f, { mode = stepMode(ability), on = true } = {}) {
  if (!on || mode === "full" || !ability) return f;
  const s = ability.startup, act = ability.active, rec = ability.recovery;
  const arrive = (from, len) => { const h = holdK((f - from) / Math.max(1, len), drawings(len), true); return from + len * h - (h >= 1 ? 1e-6 : 0); }; // (on the key pose, still inside the phase)
  if (f < s) return arrive(0, s);
  if (f < s + act) return mode === "hybrid" ? f : arrive(s, act);
  return s + act + rec * holdK((f - s - act) / Math.max(1, rec), drawings(rec), false);
}
