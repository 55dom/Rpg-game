// B12 · Lance-Commander Halvard (Ep 36). Thirty years in the Crown's service, Aldric's sword arm, and not happy about
// it. He fights the way he trained his Lances to: shield up, a long spear, nothing wasted.
//
//   P1 (100–60%): Slash, the charging Thrust (red glint: it can't be blocked), and the Shield Bash (heavy on posture;
//     parry it). His shield is up whenever he isn't attacking: get round it.
//   P2 (60%): "Form the line!" Two Lances fall in beside him, and every few seconds he calls a Line Charge: a red lane
//     through Rook, then the line runs down it. Step out of the lane.
//   P3 (30%): his shield splits. No guard any more, and his Thrust comes twice.
//   He isn't killed: at the end he grounds his lance and goes down on one knee.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });
const glint = (frame = 0) => ({ frame, type: E.SpawnVfx, key: "glint" });

export const HALVARD_STATS = Object.freeze({
  name: "Lance-Commander Halvard", maxHealth: 1900, maxPosture: 260, runSpeed: 4.4, circleSpeed: 2.4, turnRate: 0.13, radius: 0.48, height: 2.05,
  boss: true, yields: true, bossTitle: "BOSS 12 · LANCE-COMMANDER HALVARD", defeatText: "HALVARD GROUNDS HIS LANCE", phaseMarks: [0.6, 0.3],
});

export const HALVARD_HITBOXES = Object.freeze({
  Blade: { center: [0, 1, 1.2], size: [2.4, 1.6, 2.0] },
  Lance: { center: [0, 1.1, 1.9], size: [1.0, 1.3, 3.6] },
  Bash: { center: [0, 1.1, 1.0], size: [1.8, 1.6, 1.4] },
});

// Named Slash and Thrust so the Lance arm poses (data/isles.js) swing with them.
export const HALVARD_ABILITIES = Object.freeze({
  Slash: defineAbility({ id: "Slash", startup: 11, active: 4, recovery: 18,
    hit: hitSpec({ damage: 14, posture: 18, hitstop: 4, hitstun: 18, knockback: 2 }),
    events: [sound(8), box(11, "Blade", 4)] }),
  Thrust: defineAbility({ id: "Thrust", startup: 22, active: 6, recovery: 26,
    hit: hitSpec({ damage: 20, posture: 26, hitstop: 6, hitstun: 24, knockback: 4, unblockable: true }),
    events: [glint(0), sound(18, "swingHeavy"), { frame: 20, type: E.Move, value: 6 }, box(22, "Lance", 6)] }),
  Bash: defineAbility({ id: "Bash", startup: 14, active: 4, recovery: 22,
    hit: hitSpec({ damage: 10, posture: 34, hitstop: 6, hitstun: 22, knockback: 4 }),
    events: [sound(10, "swingHeavy"), { frame: 12, type: E.Move, value: 2 }, box(14, "Bash", 4), sound(14, "block")] }),
  // P3: the shield gone, the Thrust comes twice.
  Twice: defineAbility({ id: "Thrust", startup: 20, active: 24, recovery: 28,
    hit: hitSpec({ damage: 16, posture: 22, hitstop: 5, hitstun: 22, knockback: 3, unblockable: true }),
    events: [glint(0), sound(16, "swingHeavy"), { frame: 18, type: E.Move, value: 5 }, box(20, "Lance", 5), glint(28), sound(36, "swingHeavy"), { frame: 38, type: E.Move, value: 5 }, box(40, "Lance", 4)] }),
});

export const HALVARD_TUNING = Object.freeze({
  lances: 2,                           // P2: who falls in beside him
  lineEvery: 330, lineWarn: 54,        // a Line Charge every 5.5 s; the lane shows for 0.9 s first
  lineLength: 15, lineHalf: 1.3, lineStep: 1.6, lineGap: 2, // the line runs down the lane a stride at a time
  line: hitSpec({ damage: 16, posture: 24, hitstop: 5, hitstun: 24, knockback: 5, unblockable: true }),
});

export const halvardOptions = (phase) => {
  const A = HALVARD_ABILITIES;
  return [
    new AttackOption(A.Slash, 0, 2.3, 3, 40),
    new AttackOption(phase >= 3 ? A.Twice : A.Thrust, 2.4, 7, 2, phase >= 3 ? 130 : 170),
    new AttackOption(A.Bash, 0, 1.8, 2, 120),
  ];
};

export const HALVARD_PHASES = Object.freeze([{ phase: 1, above: 0.6 }, { phase: 2, above: 0.3 }, { phase: 3, above: 0 }]);
/** What the Line Charge is called when it lands (the controller fires it; it's not a move). */
export const LINE_CHARGE = defineAbility({ id: "Line Charge", startup: 1, active: 1, recovery: 1, hit: HALVARD_TUNING.line, events: [] });
