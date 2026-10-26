// The masked knight (GDD §15.3 Disguise Bible, §15.7 Encounter I onward). The Crown names him the Sable
// Knight on its bounty posters in Episode 26; until then nobody has a name for him, and subtitles call
// him "???". His look and body live here, on their own, sharing nothing with anyone (§15.10–15.11).
//
// Silhouette: a smooth black full mask with narrow vertical slits and no face behind it, ever; a heavy
// cloak to the ankles with a collar that rises past the jaw; one heavy pauldron, on the left shoulder only;
// a long black glaive with a cold edge. Padding makes him broader than he is.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { compileExpr, truthy } from "../core/flags.js";

export const MASKED_POSES = Object.freeze({
  rest: [0.45, 0.15, 0], // the glaive held low and still
  Reap: { from: [-1.3, 1.1, 0], to: [1.2, -1.2, 0], lean: 0.25 },
  Cleave: { from: [-2.4, 0.2, 0], to: [0.7, -0.1, 0], lean: 0.4 },
  Lunge: { from: [0.5, 0.2, 0], to: [-0.1, 0, 0], lean: 0.55 },
  Sever: { from: [-1.1, 1.3, 0], to: [0.9, -1.4, 0], lean: 0.35 },
  Undercut: { from: [0.9, -0.2, 0], to: [1.4, -0.4, 0], lean: -0.1 },
  SeverLine: { from: [-2.2, 1.6, 0], to: [1.1, -1.6, 0], lean: 0.5 },
  Slip: { from: [0.45, 0.15, 0], to: [0.45, 0.15, 0], lean: -0.2 },
  Withdraw: { from: [0.45, 0.15, 0], to: [0.45, 0.15, 0], lean: -0.4 },
});

export const MASKED_LOOK = Object.freeze({
  poses: MASKED_POSES, scale: 1.06, skirt: 0.9, coat: "#17171d", trim: "#2c2c36", hairColor: "#0e0e12", skin: "#0e0e12",
  head: "fullmask", maskColor: "#1e1e26", slitColor: "#000000",
  weapon: "glaive", haftColor: "#121216", bladeColor: "#1a1a22", edgeColor: "#9cb8ff",
  shoulders: 1.35, trail: "#9cb8ff",
  riftwalk: true, // inside a tear he's simply gone
  listenTilt: -0.2, // when someone speaks to him, his head tilts a little to the right
});

export const MASKED_SHEET = Object.freeze({
  build: "athletic", gait: "soldier", idle: "still",
  outfit: { top: "#17171d", hem: "knee", sleeves: "long", legs: "#121218", boots: "tall", bootColor: "#0e0e12", belt: "#2c2c36",
    gloves: "#0e0e12", bracers: "#2c2c36", breastplate: "#20202a", pauldron: "#2a2a34", cloak: "#111116", cloakLength: "ankle", cloakCollar: true, grime: 0 },
});

// ---- What he's called (GDD §15.11: "???" → "Masked Knight" → "The Sable Knight") ----------------
// Subtitles and the boss bar follow what Rook knows: a name only once the Crown prints one (Ep 26).
export const MASKED_NAMES = Object.freeze({ unseen: "???", seen: "Masked Knight", named: "The Sable Knight" });
const NAMED = compileExpr("$SABLE_NAMED"), SEEN = compileExpr("$SABLE_ENCOUNTER >= 1");
export const maskedLabel = (flags) => (!flags ? MASKED_NAMES.seen : truthy(NAMED(flags)) ? MASKED_NAMES.named : truthy(SEEN(flags)) ? MASKED_NAMES.seen : MASKED_NAMES.unseen);

/** The Crown's bounty poster (Ep 26 onward, on the Aurelin notice board). */
export const MASKED_BOUNTY = Object.freeze({
  head: "WANTED BY THE CROWN", name: "THE SABLE KNIGHT", reward: "5,000 MARKS",
  lines: ["For theft of Crown property", "from the vault beneath Ironhold.", "Masked. A black glaive. Do not engage."],
});

/**
 * His voice through the mask (GDD §15.10 MaskIntegrity): resonance and pitch-down, by encounter. Each time he's
 * met, the processing is a little lighter (B7). Nothing on screen ever says so.
 */
export const MASK_INTEGRITY = Object.freeze([1, 1, 0.92, 0.84, 0.76, 0.68, 0.6]);
export const maskIntegrity = (encounter) => MASK_INTEGRITY[Math.max(0, Math.min(MASK_INTEGRITY.length - 1, encounter | 0))];

// ---- Boss 9 · Encounter II: "The Vault Beneath Ironhold" (GDD §16 B9, Ep 26) --------------------------
// Heavy, economical, two-handed, the left side guarded. He never says a spell's name.
//   Reap       a two-handed sweep and its return.
//   Cleave     an overhead chop, slow and heavy; parry it.
//   Lunge      every thrust starts from a backstep: he gives a step, then the point comes (red glint: dodge).
//   Sever      into a black tear and out of another at your left side, cutting. The tear he steps out of
//              takes a moment to close; while it's open he's exposed (hit him then).
//   Undercut   a black tear under your feet. Stay on it and you drop out of the sky: jump or dodge in the
//              air before you land, or you land hard.
//   SeverLine  (hidden, P4) one cut that splits the room in two for a few seconds, shutting a squadmate out.
//   Slip, Withdraw: when you swing at him close in, he steps aside: left, left, then back.
// P1 (100–75%) the glaive and the blink. P2 (75%) the floor opens under you. P3 (50%) the way out loops back:
// tears in the room's mouths send whoever walks into one out of the other side. P4 (35%) the Sever Line.
// At 25% he takes what he came for and leaves through a tear that closes behind him. The fight is won.

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

export const MASKED_STATS = Object.freeze({
  name: "Masked Knight", maxHealth: 2200, maxPosture: 260, runSpeed: 4.6, circleSpeed: 2.4, turnRate: 0.14, radius: 0.46, height: 2.05,
  boss: true, bossTitle: "THE MASKED KNIGHT", defeatText: "HE TAKES WHAT HE CAME FOR", phaseMarks: [0.75, 0.5, 0.35, 0.25],
});

export const MASKED_HITBOXES = Object.freeze({
  Reap: { center: [0, 1.1, 1.6], size: [3.6, 1.2, 2.4] },
  Cleave: { center: [0, 1.2, 1.9], size: [1.4, 2.0, 2.6] },
  Point: { center: [0, 1.2, 2.2], size: [0.9, 1.0, 3.4] },
  Cut: { center: [0, 1.2, 1.5], size: [2.4, 1.2, 2.2] },
});

export const MASKED_TUNING = Object.freeze({
  leaveAt: 0.25,            // he leaves at 25%; this fight can't finish him
  flank: 1.6,               // the blink comes out this far off his target's left side
  exposed: 70,              // frames the tear he stepped out of stays open (he takes more while it does)
  exposedDamage: 1.35, exposedPosture: 1.7,
  undercutRadius: 1.6, undercutDelay: 46, dropHeight: 9, hardLanding: 16,
  undercut: hitSpec({ damage: 10, posture: 8, hitstop: 4, hitstun: 18, knockback: 0, unblockable: true }),
  mouths: 15.4, mouthRadius: 1.3, loopCooldown: 50, // P3: tears in the room's four mouths, each sending you out of the opposite one
  line: { frames: 360, halfLength: 18, spacing: 0.6, radius: 0.45 }, // P4: the Sever Line
  evadeRange: 3, evadeCooldown: 90, pattern: ["Slip", "Slip", "Withdraw"],
});

export const MASKED_ABILITIES = Object.freeze({
  Reap: defineAbility({ id: "Reap", startup: 14, active: 20, recovery: 22,
    hit: hitSpec({ damage: 12, posture: 14, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(11), box(14, "Reap", 4), sound(26), box(30, "Reap", 4)] }),
  Cleave: defineAbility({ id: "Cleave", startup: 30, active: 5, recovery: 34, tags: ["heavy"],
    hit: hitSpec({ damage: 22, posture: 30, hitstop: 8, hitstun: 28, knockback: 4 }),
    events: [sound(26, "swingHeavy"), { frame: 28, type: E.Move, value: 0.8 }, box(30, "Cleave", 5), { frame: 30, type: E.CameraCue, key: "punch" }] }),
  // A step back first, then the point: the backstep is the tell.
  Lunge: defineAbility({ id: "Lunge", startup: 28, active: 5, recovery: 30,
    hit: hitSpec({ damage: 16, posture: 20, hitstop: 5, hitstun: 22, knockback: 4, unblockable: true }),
    events: [sound(0, "dodge"), { frame: 1, type: E.Move, value: -2.2 }, { frame: 8, type: E.SpawnVfx, key: "glint" }, sound(24, "swingHeavy"),
      { frame: 26, type: E.Move, value: 4.2 }, box(28, "Point", 5)] }),
  // Out through one black tear (0), the way back in opens at his target's left (8), out (20), the cut (26).
  Sever: defineAbility({ id: "Sever", startup: 26, active: 4, recovery: 24,
    hit: hitSpec({ damage: 15, posture: 18, hitstop: 5, hitstun: 20, knockback: 3 }),
    events: [custom(0, "severOut"), custom(8, "severMark"), custom(20, "severIn"), sound(22, "swingHeavy"), box(26, "Cut", 4)] }),
  Undercut: defineAbility({ id: "Undercut", startup: 16, active: 2, recovery: 28, events: [custom(16, "undercut")] }),
  SeverLine: defineAbility({ id: "SeverLine", startup: 40, active: 2, recovery: 40,
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(36, "swingHeavy"), custom(40, "severLine")] }),
  Slip: defineAbility({ id: "Slip", startup: 1, active: 9, recovery: 8,
    events: [sound(0, "dodge"), { frame: 0, type: E.Invulnerable, value: 11 }, { frame: 1, type: E.Move, key: "left", value: 2.4 }] }),
  Withdraw: defineAbility({ id: "Withdraw", startup: 1, active: 9, recovery: 8,
    events: [sound(0, "dodge"), { frame: 0, type: E.Invulnerable, value: 11 }, { frame: 1, type: E.Move, value: -2.8 }] }),
});

/** What the Undercut is called when it drops someone (the controller fires it). */
export const UNDERCUT = defineAbility({ id: "Undercut", startup: 1, active: 1, recovery: 1, hit: MASKED_TUNING.undercut, events: [] });

export const maskedOptions = (phase) => {
  const A = MASKED_ABILITIES, late = phase >= 3;
  return [
    new AttackOption(A.Reap, 0, 2.8, 3, late ? 40 : 55),
    new AttackOption(A.Cleave, 0, 2.6, 2, 110),
    new AttackOption(A.Lunge, 2.6, 6.5, 2, late ? 120 : 160),
    new AttackOption(A.Sever, 3, 18, 2, late ? 170 : 230),
    ...(phase >= 2 ? [new AttackOption(A.Undercut, 2, 18, 2, late ? 200 : 260)] : []),
    ...(phase >= 4 ? [new AttackOption(A.SeverLine, 0, 18, 1, 720)] : []),
  ];
};

export const MASKED_PHASES = Object.freeze([
  { phase: 1, above: 0.75 }, { phase: 2, above: 0.5, undercut: true }, { phase: 3, above: 0.35, loops: true },
  { phase: 4, above: 0.25, line: true }, { phase: 5, above: 0, leave: true },
]);
