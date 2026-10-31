// Episode 66 · Alliance (GDD §27.7; §28.4 V7; Phase 7 Step 9, §23.6).
//
// The two of them begin the Rite at the coffin, and order the army's last Lines to protect it. Rook and Cal fight side
// by side through them: first with Cal beside Rook, then on the tag-swap bench, where the player can be him. The team
// attack unlocks: the Thousand-Door Verse (Rook writes a line across the sky; Cal opens a door along every letter).
// The Throne Guard and the Line Marshals in formation; the two in black do not fight. Afterwards, V7: "The two in
// black. Who were they?" His smile falters, the only time in Arc 7. "…Family. Sort of. Not yet." And Juno, at last.

import { AFTER_EP65 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { CAL_MEMBER } from "./arc7.js";

export const EP66_SCRIPT = `
title: Ep66_Order
---
<<sfx drums>>
<<shot wide>>
The throne chamber fills with the Line: every soldier the castle has left, rank on rank, between the doors and the dais. At the coffin, the two of them stand where the Wings once stood, and the drums stop all at once.
<<shot on Cal>>
Cal: They've started something. Without me. That's… new.
<<shot on Cal>>
He looks at Rook. At the Lanterns behind Rook. At Bas, who's already standing next to him, on purpose.
<<shot on Cal>>
Cal: Fine. One time only. Don't get used to it.
<<set $ALLIANCE to 1>>
===

title: Ep66_Swap
---
<<shot on Cal>>
Cal: You're slow on the left. I'll take the left. You take everything else.
<<shot on Rook>>
Rook: That's not how it works.
<<shot on Cal>>
Cal: It's how it works when I'm here. Tag me in when you're tired, squire. I promise to break only the things that deserve it.
===

title: Ep66_After
---
<<shot wide>>
The last Line lies in rows on the runner, the way it stood. The Marshals are down on one knee. At the coffin, the two in black haven't moved at all.
<<shot on Rook>>
-> "The two in black. Who were they?"
    <<set $V7_ASKED to 1>>
    <<shot on Rook>>
    Rook: The two in black. At the coffin. Who were they?
<<shot on Cal>>
His smile falters. Only for a moment. It's the only time it does, the whole way to the throne.
<<shot on Cal>>
Cal: …Family. Sort of.
<<shot on Cal>>
Cal: Not yet.
<<shot on Juno>>
Juno: You're an idiot.
<<shot on Juno>>
Juno: You're a liar and a thief and you broke Bas's arm and you left us a notebook instead of a goodbye. You're an idiot.
<<shot on Juno>>
Juno: You're our idiot.
-> "She's right."
    <<set $CAL_JUNO to "family">>
    <<set $BOND_CAL to $BOND_CAL + 20>>
    <<shot on Rook>>
    Rook: She's right. About all of it. The last part especially.
    <<shot on Cal>>
    For once he doesn't have anything to say. He looks at the knot on her wrist, and nods, once.
-> Let Juno have it.
    <<set $CAL_JUNO to "family">>
    <<shot wide>>
    You don't say anything. You don't need to. He looks at the knot on her wrist, and nods, once.
-> "Not yet, Juno."
    <<set $CAL_JUNO to "unresolved">>
    <<shot on Rook>>
    Rook: Not yet, Juno. He hasn't earned it yet.
    <<shot on Juno>>
    Juno: …No. You're right. Not yet.
<<set $EP66_DONE to 1>>
===
`;

const THRONE = { stage: "throne" };

export const EPISODE_66 = {
  id: "ep66",
  number: 66,
  unlockAt: 5,
  setup: { ...AFTER_EP65 },
  title: "Alliance",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "order", type: "scene", node: "Ep66_Order", ...THRONE,
      rook: { x: -0.6, z: -12, yaw: 0 },
      cast: [
        { id: "cal", look: "unmasked", x: 1.2, z: -11.2, yaw: -0.4 },
        { id: "bas", look: "bas", x: 2.6, z: -12.4, yaw: -0.6 },
        { id: "juno", look: "juno", x: -2.4, z: -12.8, yaw: 0.3 },
        { id: "l0", look: "throneGuard", x: -2.2, z: -6.4, yaw: Math.PI }, { id: "l1", look: "throneGuard", x: 0, z: -6.4, yaw: Math.PI },
        { id: "l2", look: "throneGuard", x: 2.2, z: -6.4, yaw: Math.PI },
      ] },
    { id: "title", type: "title" },
    // Side by side: Cal beside Rook.
    { id: "side", type: "fight", ...THRONE, wave: ["lineSoldier", "throneGuard", "lineSoldier", "throneGuard", "lineSoldier"], tokens: 3,
      world: { bounds: ZONES.throne.bounds, origin: { x: 0, z: -10 }, companions: ["bas", "juno", "calAlly"] },
      tutorial: [{ at: 0.5, text: "SIDE BY SIDE. Cal fights beside you: doors, and a saber that doesn't miss." }],
      lines: [["Cal", "Left, left, back. Oh, you know this one."], ["Bas", "Don't. Talk. To me."]],
      retry: "Up. He's laughing at you." },
    { id: "swap", type: "scene", node: "Ep66_Swap", ...THRONE,
      rook: { x: -0.4, z: -2.4, yaw: 0.2 },
      cast: [{ id: "cal", look: "unmasked", x: 1.4, z: -1.4, yaw: -1.6 }] },
    // The Throne Guard and the Line Marshals, in formation. Cal on the bench: the player can be him.
    { id: "formation", type: "fight", ...THRONE, wave: ["lineMarshal", "throneGuard", "lineMarshal", "throneGuard", "throneGuard"], tokens: 3,
      world: { bounds: ZONES.throne.bounds, origin: { x: 0, z: 2 }, companions: ["bas", "juno", "maelisAlly"], party: [CAL_MEMBER] },
      tutorial: [{ at: 0.5, text: "TAG-SWAP: Cal is on the bench. Swap him in to fight as him: a door for a dodge, the saber, and the drill grown into the Ascended Demon Slash." }],
      lines: [["Cal", "My turn. Mind the step."], ["Corin", "The Marshals! Together!"]],
      retry: "Up. Both of you." },
    { id: "verse", type: "cutscene", cutscene: "ep66_verse" },
    { id: "after", type: "scene", node: "Ep66_After", ...THRONE,
      rook: { x: -0.4, z: 8.4, yaw: 0.2 },
      cast: [
        { id: "cal", look: "unmasked", x: 1.4, z: 9.4, yaw: -1.9 },
        { id: "juno", look: "juno", x: -1.8, z: 7.0, yaw: 0.9 },
        { id: "bas", look: "bas", x: 2.2, z: 7.4, yaw: -0.9 },
      ],
      set: { EP66_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep67",
      lines: [
        "Next time on UNWRITTEN:",
        "The Rite of Waking. Everyone inside the circle is forced to see.",
        "\"Now, Rook. Write me.\"",
      ] },
  ],
};
