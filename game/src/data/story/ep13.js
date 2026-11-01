// Episode 13 · The Chancellor's Garden (GDD §14 Arc 2). Political.
//
// A letter with the High Chancellor's seal: Rook, alone, to his garden in the Crown Ward. Aldric Valcourt is courteous,
// and interested in the one-page grimoire: give it to the Crown for study, and there's a place in the Gilded Lances,
// Severin's squad. Refusing costs (Squad Rep, and a Valcourt who remembers). That evening in the Lowmarket somebody tries
// to take the book anyway. Cal: somebody wants it badly enough to pay for it.

import { AFTER_EP12 } from "./arc12.js";
import { ZONES } from "../zones.js";

export const EP13_SCRIPT = `
title: Ep13_Letter
---
<<shot wide>>
A letter on the squad board, heavy paper, a blue wax seal with a lion on it. Addressed to you.
<<shot on Dagrun>>
Dagrun: The High Chancellor wants you for tea. In his garden. Alone.
<<shot on Dagrun>>
Dagrun: Go. Be polite. Don't sign anything. Don't eat anything you can't name.
<<shot on Cal>>
Cal: And if he offers you a squad, a horse, or a better book, say you'll think about it and run.
===

title: Ep13_Garden
---
<<shot wide>>
The Valcourt garden, all clipped hedges, a fountain shaped like a lion, and the High Chancellor at a white iron table with two cups poured.
<<shot on Aldric>>
Aldric: The one-page mage. Sit. You'll forgive the Lance at the gate, he takes his work seriously.
<<shot on Aldric>>
Aldric: My son tells me you're stubborn and lucky. He doesn't say that about anyone. He doesn't say anything about anyone.
<<shot on Aldric>>
Aldric: I'll be plain. Your grimoire interests the Crown. One page, and it bleeds ink, and the Tower's own sweeper won't look at it. Lend it to us. For study.
<<shot on Aldric>>
Aldric: In return: a place in the Gilded Lances. Severin's squad. A real squad, with a real hall and real horses, instead of a lighthouse at the end of a dry sea.
-> "No. It's mine."
    <<set $ALDRIC_OFFER to "refused">>
    <<set $VALCOURT_HOSTILE to 1>>
    <<set $REP_SQUAD to $REP_SQUAD - 5>>
    <<shot on Rook>>
    Rook: No. It's mine. And so is the lighthouse.
    <<shot on Aldric>>
    Aldric: Of course. Loyalty. I admire it in other people's servants.
-> "I'll think about it."
    <<set $ALDRIC_OFFER to "deferred">>
    <<set $VALCOURT_HOSTILE to 1>>
    <<shot on Rook>>
    Rook: I'll think about it.
    <<shot on Aldric>>
    Aldric: Don't think too long. Offers in the Crown Ward have very short lives.
-> "It's not the Crown's to study."
    <<set $ALDRIC_OFFER to "refused">>
    <<set $VALCOURT_HOSTILE to 1>>
    <<set $REP_SQUAD to $REP_SQUAD - 5>>
    <<shot on Rook>>
    Rook: It's not the Crown's to study.
    <<shot on Aldric>>
    For just a moment, the courtesy goes out of his face like a lamp being turned down. Then it's back.
    <<shot on Aldric>>
    Aldric: Everything in this kingdom is the Crown's, eventually. I'll see you out myself.
===

title: Ep13_After
---
<<shot wide>>
The thieves are down in the Lowmarket mud, and the grimoire's still in your hand. None of them will say who paid them. All of them had new boots.
<<shot on Cal>>
Cal: Somebody wants your book badly enough to pay for it. That's flattering, and very annoying.
<<shot on Cal>>
Cal: Keep it close. Sleep with it under your pillow. Lio does. With his, I mean. Not yours. Hopefully.
<<set $EP13_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, AU = { stage: "aurelin" }, DAY = { sky: { daylight: 0.55 } }, DUSK = { sky: { daylight: 0.2 } };
const KITCHEN = { x: -30.5, z: 27.3 }; // the Valcourt townhouse's garden side (as in Ep 32)

export const EPISODE_13 = {
  id: "ep13",
  number: 13,
  setup: { ...AFTER_EP12 },
  title: "The Chancellor's Garden",
  arc: "Arc 2 · The Lantern That Went Out",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "letter", type: "scene", node: "Ep13_Letter", ...LH, ...DAY,
      rook: { x: 0.6, z: 9.6, yaw: 0 },
      cast: [
        { id: "dagrun", look: "dagrun", x: -1.4, z: 9.4, yaw: 1.2 },
        { id: "cal", look: "cal", x: 2.6, z: 9.2, yaw: -1.2 },
      ] },
    { id: "garden", type: "scene", node: "Ep13_Garden", ...AU, ...DAY,
      rook: { x: KITCHEN.x - 1.4, z: KITCHEN.z - 0.6, yaw: Math.PI },
      cast: [
        { id: "aldric", look: "aldric", x: KITCHEN.x - 0.4, z: KITCHEN.z - 3.6, yaw: 0 },
        { id: "halvard", look: "halvardFace", x: KITCHEN.x + 3.0, z: KITCHEN.z - 4.4, yaw: -0.6 },
      ] },
    { id: "thieves", type: "fight", ...AU, ...DUSK, wave: ["bandit", "bandit", "bandit", "bandit"], tokens: 2,
      world: { bounds: ZONES.aurelin.bounds, origin: { x: 24, z: -14 } },
      tutorial: [{ at: 0.5, text: "Thieves, after the grimoire. Keep hold of it." }],
      lines: [["Cal", "They want the book. How rude."], ["Juno", "New boots on all of them. Somebody paid."]],
      retry: "Again. It's still yours." },
    { id: "after", type: "scene", node: "Ep13_After", ...AU, ...DUSK,
      rook: { x: 23.0, z: -14.0, yaw: 0.6 },
      cast: [
        { id: "cal", look: "cal", x: 24.6, z: -12.2, yaw: Math.PI + 0.6 },
        { id: "juno", look: "juno", x: 21.4, z: -12.6, yaw: 2.4 },
      ],
      set: { EP13_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep14",
      lines: [
        "Next time on UNWRITTEN:",
        "A singing contest, a café cellar, and the Merit roll.",
        "Tamsin sings off-key.",
      ] },
  ],
};
