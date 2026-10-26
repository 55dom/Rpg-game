// The Palimpsest's first Under-Text stage, Annotation (GDD §8.6, Ep 28). Under Rook's one page there is
// writing nobody has read, and room in the margin. Once Annotation wakes:
//   · Inscribe: a stroke of ink written onto whatever is in front of you (it takes the fourth spell's place in
//     the last phase at Mirrorlake). Each one leaves a clause on the target (INSCRIBED).
//   · Every spell Rook casts writes a little: a spell's hit leaves the target INSCRIBED, and Rook's hits land
//     harder on anything inscribed. The ink shows on them while it lasts.

import { hitSpec } from "../core/combat.js";
import { defineAbility, EventType as E } from "../core/abilities.js";

export const INSCRIPTION = Object.freeze({ frames: 420, bonus: 1.15 });

export const INSCRIPTION_HITBOXES = Object.freeze({
  Quill: { center: [0, 1.1, 2.4], size: [1.6, 1.8, 4.6] },
});

export const INSCRIBE = defineAbility({ id: "Inscribe", startup: 10, active: 6, recovery: 18, manaCost: 20, tags: ["ink"],
  hit: hitSpec({ damage: 14, posture: 24, hitstop: 7, hitstun: 26, knockback: 1, applyTags: [["INSCRIBED", INSCRIPTION.frames]] }),
  events: [{ frame: 0, type: E.SpawnVfx, key: "grimoire" }, { frame: 6, type: E.PlaySound, key: "bookDescend" }, { frame: 10, type: E.SpawnVfx, key: "ink" },
    { frame: 10, type: E.SpawnHitbox, key: "Quill", value: 6 }] });

/** What the HUD calls an ability that isn't one of Rook's four pages. */
export const SPELL_LABELS = Object.freeze({ Inscribe: "Inscribe" });
