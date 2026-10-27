// The masked knight on the Lowmarket Bridge (Ep 47, the Siege's Phase 2): he drops out of a tear in the sky onto the
// bridge and goes through the Line in single cuts, and the Lanterns fight in his wake. On Rook's side, for once,
// though nobody would say so. Each time a soldier falls to him, he murmurs to it (the story's kill lines, sim/siege.js).
// A guest (world.js): he fights beside the squad but isn't one of them, so he isn't on the party panel and can't be
// called on for an Assist.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";
import { AttackOption } from "../core/ai.js";
import { MASKED_STATS, MASKED_HITBOXES } from "../data/masked.js";

const sound = (frame, key = "swing") => ({ frame, type: E.PlaySound, key });
const box = (frame, key, frames) => ({ frame, type: E.SpawnHitbox, key, value: frames });

const KILL = hitSpec({ damage: 999, posture: 999, hitstop: 6, hitstun: 30, knockback: 3, unblockable: true });

export const KNIGHT_ALLY_ABILITIES = Object.freeze({
  // One cut, and the soldier in front of him is down.
  OneCut: defineAbility({ id: "Reap", startup: 10, active: 4, recovery: 18, hit: KILL, events: [sound(8, "swingHeavy"), box(10, "Reap", 4)] }),
  // From a backstep, the point (the same tell as in the vault, and nobody on the bridge is watching him closely enough).
  Lunge: defineAbility({ id: "Lunge", startup: 22, active: 5, recovery: 20, hit: KILL,
    events: [sound(0, "dodge"), { frame: 1, type: E.Move, value: -1.8 }, sound(18, "swingHeavy"), { frame: 20, type: E.Move, value: 4.4 }, box(22, "Point", 5)] }),
});

export const KNIGHT_ALLY = Object.freeze({
  stats: { ...MASKED_STATS, name: "The Sable Knight", boss: false, maxHealth: 99999, maxPosture: 9999, runSpeed: 6.4, assistCooldownFrames: 99999, reviveFrames: 30 },
  hitboxes: MASKED_HITBOXES, guest: true, slot: [0, 3.2], assist: KNIGHT_ALLY_ABILITIES.OneCut,
  options: () => [new AttackOption(KNIGHT_ALLY_ABILITIES.OneCut, 0, 2.6, 3, 24), new AttackOption(KNIGHT_ALLY_ABILITIES.Lunge, 2.2, 6.5, 2, 70)],
  supports: () => [],
});
