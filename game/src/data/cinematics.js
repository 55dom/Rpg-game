// The cinematic tiers as data (GDD §19.1, §19.4).
//
// T1, combat cues (< 1 s, the player keeps control): FEEDBACK. An ability's CameraCue event (or a sim event) names a
// cue; the cue says what the camera and the screen do: shake, an FOV punch, impact frames, speed lines. A new cue is a
// new row here, not new code.
//
// T2, Ultimates and Team Attacks (3–6 s, control taken, skippable, a short version after the first view): a sequence
// is the §19.4 template filled in. Seven beats (activation, charge, close-up, release, impact, aftermath, return), each
// with a default length, and six standard track slots (camera, character anim, VFX, SFX, voice, post-FX). sequence()
// turns a filled template into an ability: each track entry becomes an event at its beat's frame plus its offset.

import { defineAbility, EventType as E } from "../core/abilities.js";

/** T1: what each cue does. kick: FOV punch · shake: trauma · impact: impact frames (strong: inverted) · speedLines: seconds. */
export const FEEDBACK = Object.freeze({
  punch: { kick: 0.35, shake: 0.2 },                 // a heavy lands
  finisher: { kick: 1, shake: 0.45 },                // a finisher lands
  speed: { speedLines: 0.32 },                       // a lunge or an air dash: the screen streaks
  "ult-release": { speedLines: 0.6 },                // the ultimate's release beat: a whip through the field
  "ult-flash": { impact: 4, strong: true, shake: 0.8 }, // its impact beat (post-FX)
  "team-release": { speedLines: 0.6 },
  "team-flash": { impact: 5, strong: true, shake: 0.8, kick: 1 },
});

/** §19.4's beats, in order, with their default lengths (seconds). */
export const T2_BEATS = Object.freeze([
  Object.freeze({ beat: "activation", sec: 0.4, shot: "Camera snaps behind the character, background desaturates" }),
  Object.freeze({ beat: "charge", sec: 0.8, shot: "Low-angle orbit, environment reacts" }),
  Object.freeze({ beat: "closeup", sec: 0.6, shot: "ECU on eyes or grimoire, technique name shout" }),
  Object.freeze({ beat: "release", sec: 0.8, shot: "Whip pan or rapid dolly through the battlefield" }),
  Object.freeze({ beat: "impact", sec: 0.2, shot: "Impact frame + hitstop" }),
  Object.freeze({ beat: "aftermath", sec: 0.8, shot: "Wide; debris, smoke, silence beat" }),
  Object.freeze({ beat: "return", sec: 0.4, shot: "Blend back to the gameplay camera" }),
]);
/** The standard track slots, and the event each one's entries become. */
export const TRACKS = Object.freeze({ camera: E.CameraCue, anim: null, vfx: E.SpawnVfx, sfx: E.PlaySound, voice: E.SpawnVfx, post: E.CameraCue });
/** The short version: straight to the release, no silence beat. */
export const SHORT_BEATS = Object.freeze(["release", "impact", "return"]);

const HZ = 60;

/**
 * Fill the template. spec = { id, tags, surgeCost?, frames?: { beat: frames } (defaults from T2_BEATS),
 *   phases?: { startup, active, recovery } (default: up to the release / release and impact / the rest),
 *   tracks: { camera|vfx|sfx|voice|post: { beat: key | [[offset, key], …] },
 *             anim: { beat: [{ at, type, key?, value? | value(F) }] } } }
 * `short`: only SHORT_BEATS play; the skipped beats' anim entries still happen, at frame 0 (an ability's invulnerability
 * and time stop don't get skipped with its shots). Returns { options (for defineAbility), at: { beat: frame }, total }.
 */
export function sequence(spec, { short = false } = {}) {
  const at = {}, len = {};
  let t = 0;
  for (const { beat, sec } of T2_BEATS) {
    const n = short && !SHORT_BEATS.includes(beat) ? 0 : spec.frames?.[beat] ?? Math.round(sec * HZ);
    at[beat] = t; len[beat] = n; t += n;
  }
  const total = t, F = { ...at, len, total };
  const events = [];
  for (const [track, type] of Object.entries(TRACKS)) {
    for (const [beat, entries] of Object.entries(spec.tracks?.[track] ?? {})) {
      if (!(beat in at)) throw new Error(`${spec.id}: no beat "${beat}"`);
      const skipped = short && !SHORT_BEATS.includes(beat);
      if (track === "anim") {
        for (const e of entries) events.push({ frame: skipped ? 0 : at[beat] + e.at, type: e.type, key: e.key, value: typeof e.value === "function" ? e.value(F) : e.value });
        continue;
      }
      if (skipped) continue; // the short version drops the skipped beats' shots, effects and sounds
      for (const [off, key] of typeof entries === "string" ? [[0, entries]] : entries) events.push({ frame: Math.min(total - 1, at[beat] + off), type, key });
    }
  }
  const ph = spec.phases ?? { startup: at.release, active: len.release + len.impact, recovery: len.aftermath + len.return };
  return { options: { id: spec.id, tags: spec.tags ?? [], surgeCost: spec.surgeCost ?? 0, ...ph, events }, at, total };
}

/**
 * Team Attacks (GDD §9.2, §10, §19.1 T2). Rook and the squadmate, on the template's default lengths: activation (the
 * two of you, the world going grey), the charge (an orbit low round you both), the close-up (the squadmate, the
 * technique's name), the release (they move, then you), the impact (the strike together), the silence beat, the return.
 * The squadmate's own move starts on the release; the joint strike lands on the impact (sim/world.js).
 */
export const TEAM_SPEC = Object.freeze({
  id: "TeamSequence", tags: ["team"],
  tracks: {
    camera: { activation: "team-activate", charge: "team-charge", closeup: "team-closeup", release: "team-release", impact: "team-impact", aftermath: "team-aftermath", return: "team-return" },
    anim: {
      activation: [
        { at: 0, type: E.Invulnerable, value: (F) => F.total },
        { at: 0, type: E.Custom, key: "timeStop", value: (F) => F.impact + F.len.impact }, // the field holds its breath until the strike
      ],
      release: [{ at: 0, type: E.Move, key: "toTarget", value: 4.5 }, { at: 0, type: E.PlaySound, key: "swingHeavy" }],
    },
    vfx: { activation: "teamCharge", release: "teamBurst" },
    sfx: { activation: "ultActivate", charge: "charge", release: "gale" },
    voice: { closeup: "teamName" },
    post: { impact: "team-flash" },
  },
});
export const TEAM_SEQUENCES = Object.freeze({
  full: Object.freeze((() => { const s = sequence(TEAM_SPEC); return { ability: defineAbility(s.options), at: s.at, total: s.total }; })()),
  short: Object.freeze((() => { const s = sequence(TEAM_SPEC, { short: true }); return { ability: defineAbility(s.options), at: s.at, total: s.total }; })()),
});

// ---- Which T2s have been seen (the short version is offered only after the first full view). Kept per browser. ----
const KEY = "unwritten.cinematics";
let memory = {};
const load = () => { try { return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "null") ?? memory; } catch { return memory; } };
export const t2Seen = (id) => !!load()[id];
export function t2MarkSeen(id) { const all = { ...load(), [id]: 1 }; memory = all; try { globalThis.localStorage?.setItem(KEY, JSON.stringify(all)); } catch { /* this visit only */ } }
export const t2Reset = () => { memory = {}; try { globalThis.localStorage?.removeItem(KEY); } catch { /* */ } };
/** How a T2 plays: the setting ("full" | "short" | "off"), except that "short" waits for one full view. */
export const t2Mode = (setting, id) => (setting === "off" ? "off" : setting === "short" && t2Seen(id) ? "short" : "full");
