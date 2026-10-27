// The reveal (GDD §15.8, §15.11): this folder is the one place in the build allowed to name what's on the other side of
// the door, and who the masked knight is. Nothing outside it does.
//
// The Line: the Demon Army's soldiers, through the Gate in the Siege of Aurelin (Ep 47). Dark red and black plate, a
// slit faceplate, no wings, an ash-glaive (a pole-cleaver). They fight as one body: a spear-wall three lines deep with
// the Marshal at the rear, the formation nobody in Liraen has used in living memory (D7). Every soldier drills the same
// four beats from its first day: Left. Left. Back. Cut. Two side-steps, a backstep, and the cut that comes out of it,
// the Demon Slash. (Anyone who sparred the Vice Captain in Episode 3, or the masked knight in the vault, has seen the
// first three beats before.)
//   Demon Soldier (1★): a thrust in the wall, a heavy chop, and the drill.
//   Line Marshal (2★): a wingless brute in heavy plate who stays at the rear and keeps the Line coming.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

export const LINE_POSES = Object.freeze({
  rest: [0.3, 0.9, 0], // the ash-glaive held upright, point high: the wall
  Thrust: { from: [0.3, 0.9, 0], to: [-0.1, 0.1, 0], lean: 0.45 },
  Chop: { from: [-2.3, 0.2, 0], to: [0.8, -0.2, 0], lean: 0.4 },
  Drill: { from: [-1.2, 1.2, 0], to: [1.1, -1.3, 0], lean: 0.35 },
});

export const LINE_HITBOXES = Object.freeze({
  Point: { center: [0, 1.2, 2.0], size: [0.8, 0.9, 3.0] },
  Chop: { center: [0, 1.1, 1.6], size: [1.6, 1.8, 2.4] },
  Cut: { center: [0, 1.1, 1.5], size: [2.6, 1.2, 2.2] },
  Maul: { center: [0, 1.2, 1.9], size: [3.4, 2.0, 2.8] },
});

export const LINE_ABILITIES = Object.freeze({
  // The wall's thrust: all along the front rank at once.
  Thrust: defineAbility({ id: "Thrust", startup: 16, active: 4, recovery: 26,
    hit: hitSpec({ damage: 10, posture: 12, hitstop: 4, hitstun: 16, knockback: 2 }),
    events: [sound(12), { frame: 14, type: E.Move, value: 0.9 }, box(16, "Point", 4)] }),
  Chop: defineAbility({ id: "Chop", startup: 28, active: 5, recovery: 30, tags: ["heavy"],
    hit: hitSpec({ damage: 16, posture: 24, hitstop: 7, hitstun: 24, knockback: 4 }),
    events: [sound(24, "swingHeavy"), box(28, "Chop", 5)] }),
  // The drill, the Demon Slash: left, left, back, cut. The backstep is the tell; the cut can't be blocked.
  Drill: defineAbility({ id: "Drill", startup: 40, active: 5, recovery: 28,
    hit: hitSpec({ damage: 14, posture: 18, hitstop: 5, hitstun: 22, knockback: 4, unblockable: true }),
    events: [sound(0, "dodge"), { frame: 1, type: E.Move, key: "left", value: 1.1 }, sound(10, "dodge"), { frame: 11, type: E.Move, key: "left", value: 1.1 },
      sound(21, "dodge"), { frame: 22, type: E.Move, value: -1.4 }, { frame: 26, type: E.SpawnVfx, key: "glint" }, sound(36, "swingHeavy"),
      { frame: 38, type: E.Move, value: 3.0 }, box(40, "Cut", 5)] }),
  // The Marshal's maul of a glaive: slow and enormous.
  Maul: defineAbility({ id: "Maul", startup: 36, active: 6, recovery: 40, tags: ["heavy"],
    hit: hitSpec({ damage: 26, posture: 36, hitstop: 9, hitstun: 30, knockback: 6 }),
    events: [sound(30, "swingHeavy"), box(36, "Maul", 6), { frame: 36, type: E.CameraCue, key: "punch" }] }),
});

export const LEGION_ENEMIES = Object.freeze({
  lineSoldier: {
    stats: { name: "Demon Soldier", maxHealth: 120, maxPosture: 70, runSpeed: 2.4, circleSpeed: 1.4, turnRate: 0.12, radius: 0.46, height: 2.1 },
    hitboxes: LINE_HITBOXES, abilities: LINE_ABILITIES, poses: LINE_POSES,
    options: () => [new AttackOption(LINE_ABILITIES.Thrust, 1.2, 3.0, 4, 70), new AttackOption(LINE_ABILITIES.Chop, 0, 2.2, 2, 140),
      new AttackOption(LINE_ABILITIES.Drill, 1.5, 3.6, 2, 260)],
    traits: { frontalGuard: true }, // the wall: shields toward you whenever they aren't attacking
  },
  lineMarshal: {
    stats: { name: "Line Marshal", maxHealth: 3200, maxPosture: 400, runSpeed: 2.0, circleSpeed: 1.0, turnRate: 0.08, radius: 0.7, height: 2.8 },
    hitboxes: LINE_HITBOXES, abilities: LINE_ABILITIES, poses: LINE_POSES,
    options: () => [new AttackOption(LINE_ABILITIES.Maul, 0, 2.8, 3, 120), new AttackOption(LINE_ABILITIES.Thrust, 1.2, 3.2, 1, 90)],
    traits: { heavy: true, armoredAttacks: true },
  },
});

/** How they look (runtime/rig.js LOOKS): plate the colour of old blood, black trim, the slit faceplate. */
export const LEGION_LOOKS = Object.freeze({
  lineSoldier: { poses: LINE_POSES, scale: 1.05, skirt: 0.85, coat: "#3a0e0e", trim: "#120707", hairColor: "#0e0606", skin: "#140808",
    head: "fullmask", maskColor: "#1c0a0a", slitColor: "#000000", weapon: "glaive", haftColor: "#1a1010", bladeColor: "#3a3434", edgeColor: "#c8502a",
    shoulders: 1.25, trail: "#c8502a" },
  lineMarshal: { poses: LINE_POSES, scale: 1.45, skirt: 0.9, coat: "#3a0c0c", trim: "#0a0404", hairColor: "#0e0606", skin: "#0e0606",
    head: "fullmask", maskColor: "#1e0808", slitColor: "#000000", weapon: "glaive", haftColor: "#120a0a", bladeColor: "#2a2626", edgeColor: "#e0602a",
    shoulders: 1.7, trail: "#e0602a" },
});
