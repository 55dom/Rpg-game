// The reveal fights (GDD §15.8; this folder is the sanctioned exception to §15.11).
//
// ---- Phase 3: the masked knight, the third full duel (Ep 48, on the Lowmarket Bridge) ----------------------------
// The player knows his patterns now: the vault (the blink to the left, the floor, left-left-back), the road (the Draw,
// the Ring of Edges). He escalates with two more nobody has seen:
//   Rain   black tears open in the air round Rook and the glaive comes down out of each, one after another.
//   Chain  three blinks in a row: out at Rook's left, then the right, then behind.
// He can't be worn down: the win is his Posture. Break it, then the Inscription finisher, Underline (Heavy), and the
// mask cracks (a cutscene). The player earns the hit; it isn't scripted.
//
// ---- The fight against Cal (Ep 48, Phases 1–3 of §15.8's table) ----------------------------------------------------
//   P1 the companion (100–70%): his Arcs 1–2 kit, used against you: golden doors (a blink through door light), saber
//      cuts formed from door light, a red-glint thrust, the Drop (a golden door under you: you fall out of the sky, the
//      way he used to juggle enemies for you) and the swap (the door-swap he used to save you, now putting you where he
//      was and him where you were, and the cut already coming).
//   P2 evolution (70–40%): each move becomes the Sable Knight's version: the doors go black, the Drop becomes a fall for
//      the whole party, the swap scrambles everyone across the bridge.
//   P3 the reincarnated power (40–20%): he heals when he isn't being hit; spatial blades fly along a line at you; and the
//      glaive's true form, Godfall Demon Slash: a backstep, and a cut that splits the bridge from end to end. (The god
//      version of the Line's basic drill: left, left, back, cut.)
//   At 20% he stops. "You were lighter than my glaive, you know. That night in Larkspur." (Ep 48 ends.)

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { MASKED_STATS, MASKED_ABILITIES, MASKED_HITBOXES, MASKED_VI_ABILITIES, MASKED_TUNING, UNDERCUT } from "../data/masked.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const custom = (frame, key, value = 0) => ({ frame, type: E.Custom, key, value });

// ---- Phase 3 ----
export const MASK_FINAL_STATS = Object.freeze({
  ...MASKED_STATS, name: "The Sable Knight", maxHealth: 3000, maxPosture: 260, runSpeed: 5.0,
  bossTitle: "THE SABLE KNIGHT · THE LOWMARKET BRIDGE", defeatText: "UNDERLINE", phaseMarks: [0.7, 0.45], finisherName: "UNDERLINE",
});

export const MASK_FINAL_TUNING = Object.freeze({
  floor: 0.2, // he can't be worn down: the way through is his guard
  rain: { n: 6, spread: 2.6, r: 1.0, delay: 44, gap: 9 },
  cut: hitSpec({ damage: 13, posture: 14, hitstop: 4, hitstun: 18, knockback: 3 }),
});

export const MASK_FINAL_ABILITIES = Object.freeze({
  Rain: defineAbility({ id: "Rain", startup: 20, active: 2, recovery: 40, events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, custom(20, "rain")] }),
  // Out at the left, the right, then behind: three cuts, three openings (each tear he comes out of stays open a moment).
  Chain: defineAbility({ id: "Chain", startup: 22, active: 60, recovery: 30,
    hit: hitSpec({ damage: 12, posture: 14, hitstop: 4, hitstun: 18, knockback: 3 }),
    events: [custom(0, "severOut"), custom(8, "severMark", 0), custom(18, "severIn"), sound(19, "swingHeavy"), box(22, "Cut", 4),
      custom(30, "severOut"), custom(36, "severMark", 1), custom(46, "severIn"), sound(47, "swingHeavy"), box(50, "Cut", 4),
      custom(58, "severOut"), custom(64, "severMark", 2), custom(74, "severIn"), sound(75, "swingHeavy"), box(78, "Cut", 4)] }),
});
export const RAIN_CUT = defineAbility({ id: "RainCut", startup: 1, active: 1, recovery: 1, hit: MASK_FINAL_TUNING.cut, events: [] });

export const maskFinalOptions = (phase) => {
  const A = MASKED_ABILITIES, V = MASKED_VI_ABILITIES, F = MASK_FINAL_ABILITIES;
  return [
    new AttackOption(A.Reap, 0, 2.8, 3, 40),
    new AttackOption(A.Cleave, 0, 2.6, 2, 90),
    new AttackOption(A.Lunge, 2.6, 6.5, 2, 130),
    new AttackOption(A.Sever, 3, 18, 2, 180),
    new AttackOption(V.Draw, 2.5, 14, 1, 300),
    ...(phase >= 2 ? [new AttackOption(A.Undercut, 2, 18, 1, 300), new AttackOption(V.Ring, 0, 9, 1, 340)] : []),
    ...(phase >= 3 ? [new AttackOption(F.Rain, 0, 12, 2, 260), new AttackOption(F.Chain, 2, 14, 2, 320)] : []),
  ];
};
export const MASK_FINAL_PHASES = Object.freeze([{ phase: 1, above: 0.7 }, { phase: 2, above: 0.45 }, { phase: 3, above: 0 }]);

// ---- The fight against Cal ----
export const UNMASKED_STATS = Object.freeze({
  name: "Cal", maxHealth: 3400, maxPosture: 320, runSpeed: 5.4, circleSpeed: 2.8, turnRate: 0.18, radius: 0.46, height: 2.0,
  boss: true, bossTitle: "CALDER WYNN", defeatText: "...", phaseMarks: [0.7, 0.4],
});

export const UNMASKED_HITBOXES = Object.freeze({
  ...MASKED_HITBOXES,
  Saber: { center: [0, 1.2, 1.3], size: [1.9, 1.0, 2.0] },
  Point: { center: [0, 1.2, 1.7], size: [0.8, 0.9, 2.8] },
});

export const UNMASKED_TUNING = Object.freeze({
  floor: 0.2,
  drop: { r: 1.6, delay: 40, lift: 9, landing: 16, spec: hitSpec({ damage: 10, posture: 8, hitstop: 4, hitstun: 18, knockback: 0, unblockable: true }) },
  scramble: { rMin: 4.5, rMax: 8 },
  blades: { n: 6, step: 1.6, delay: 30, gap: 5, r: 0.9, spec: hitSpec({ damage: 11, posture: 12, hitstop: 3, hitstun: 14, knockback: 2 }) },
  godfall: { length: 30, step: 1.3, r: 1.0, delay: 34, spec: hitSpec({ damage: 34, posture: 40, hitstop: 8, hitstun: 30, knockback: 6, unblockable: true }) },
  regen: { after: 100, perFrame: 0.0006 }, // a little health back every frame he isn't hit, once he's gone untouched a while
});

export const UNMASKED_ABILITIES = Object.freeze({
  DoorCut: defineAbility({ id: "Cut", startup: 11, active: 4, recovery: 20,
    hit: hitSpec({ damage: 11, posture: 14, hitstop: 4, hitstun: 16, knockback: 2 }), events: [sound(8), box(11, "Saber", 4)] }),
  DoorThrust: defineAbility({ id: "Thrust", startup: 26, active: 5, recovery: 28,
    hit: hitSpec({ damage: 15, posture: 20, hitstop: 5, hitstun: 22, knockback: 4, unblockable: true }),
    events: [{ frame: 0, type: E.SpawnVfx, key: "glint" }, sound(22, "swingHeavy"), { frame: 24, type: E.Move, value: 2.8 }, box(26, "Point", 5)] }),
  Blink: defineAbility({ id: "Sever", startup: 26, active: 4, recovery: 22, hit: hitSpec({ damage: 13, posture: 16, hitstop: 5, hitstun: 20, knockback: 3 }),
    events: [custom(0, "severOut"), custom(8, "severMark"), custom(20, "severIn"), sound(22, "swingHeavy"), box(26, "Cut", 4)] }),
  Drop: defineAbility({ id: "Drop", startup: 14, active: 2, recovery: 26, events: [custom(14, "drop")] }),
  Swap: defineAbility({ id: "Swap", startup: 12, active: 2, recovery: 8, events: [sound(0, "door"), custom(12, "swap")] }),
  Scramble: defineAbility({ id: "Scramble", startup: 18, active: 2, recovery: 30, events: [sound(0, "door"), custom(18, "scramble")] }),
  Blades: defineAbility({ id: "Blades", startup: 14, active: 2, recovery: 26, events: [custom(14, "blades")] }),
  // Left, left, back (the glint), and the cut that splits the bridge.
  Godfall: defineAbility({ id: "Godfall", startup: 44, active: 2, recovery: 50,
    events: [sound(0, "dodge"), { frame: 1, type: E.Move, key: "left", value: 1.0 }, sound(10, "dodge"), { frame: 11, type: E.Move, key: "left", value: 1.0 },
      sound(21, "dodge"), { frame: 22, type: E.Move, value: -1.6 }, { frame: 26, type: E.SpawnVfx, key: "glint" }, sound(40, "swingHeavy"), custom(44, "godfall")] }),
});
export const DROP = defineAbility({ id: "Drop", startup: 1, active: 1, recovery: 1, hit: UNMASKED_TUNING.drop.spec, events: [] });
export const BLADE = defineAbility({ id: "Blade", startup: 1, active: 1, recovery: 1, hit: UNMASKED_TUNING.blades.spec, events: [] });
export const GODFALL = defineAbility({ id: "Godfall", startup: 1, active: 1, recovery: 1, hit: UNMASKED_TUNING.godfall.spec, events: [] });

export const unmaskedOptions = (phase) => {
  const U = UNMASKED_ABILITIES;
  if (phase === 1) return [new AttackOption(U.DoorCut, 0, 2.4, 4, 30), new AttackOption(U.DoorThrust, 1.5, 3.8, 2, 120),
    new AttackOption(U.Blink, 3, 16, 2, 200), new AttackOption(U.Drop, 2, 14, 1, 300), new AttackOption(U.Swap, 2, 9, 1, 320)];
  if (phase === 2) return [new AttackOption(MASKED_ABILITIES.Reap, 0, 2.8, 3, 40), new AttackOption(U.DoorThrust, 1.5, 3.8, 1, 140),
    new AttackOption(U.Blink, 3, 16, 3, 170), new AttackOption(U.Drop, 2, 14, 1, 320), new AttackOption(U.Scramble, 0, 14, 1, 420)];
  return [new AttackOption(MASKED_ABILITIES.Reap, 0, 2.8, 3, 36), new AttackOption(U.Blink, 3, 16, 2, 160),
    new AttackOption(U.Blades, 2, 16, 2, 200), new AttackOption(U.Godfall, 0, 12, 2, 360)];
};
export const UNMASKED_PHASES = Object.freeze([{ phase: 1, above: 0.7 }, { phase: 2, above: 0.4 }, { phase: 3, above: 0 }]);
export { UNDERCUT, MASKED_TUNING };
