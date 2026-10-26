// Episode 30 · The Severed Isles (GDD §14 Arc 4, §13 Spindle Peaks / Severed Isles). Up the old gondola chain to the
// isles that slipped their moorings: a plateau adrift in a bright sky, an old sky temple, a mural of stars. Wake the
// three waystones, deal with the Tempest Riders who nest up there, and reach the temple floor, where the Lances are
// already waiting. They broke the temple's seal; the Storm Warden wakes. Boss 11. Afterward Halvard takes the
// Paragon's writ at spear-point "in the Chancellor's name", and Lio reads three words on its seal.

import { AFTER_EP29 } from "./arc4.js";
import { ISLES_LAYOUT } from "../zones.js";

export const EP30_SCRIPT = `
title: Ep30_Gondola
---
<<shot wide>>
The gondola climbs its chain into the clouds and doesn't come out of them for an hour.
<<shot on Tamsin>>
Tamsin: I'm fine. I'm absolutely fine. I just want everyone to know that if this chain snaps, I've written you all a song, and it's in my other coat.
<<shot on Juno>>
Juno: The chain's held for two hundred years, Tamsin.
<<shot on Tamsin>>
Tamsin: That's exactly what a chain would want you to think.
<<shot wide>>
Then the cloud falls away underneath them, and there they are. The Severed Isles. A whole country of rock, drifting in a sky so bright it hurts.
<<shot on Severin>>
Severin: Aurek always wanted to come up here. He said the stars would be closer.
<<shot on Lio>>
Lio: They're not. It's about two miles. Stars are... further than that. Sorry.
===

title: Ep30_Juno
---
Juno: Halvard's lot came up yesterday, the gondola man says. Twenty of them. They paid in Crown silver and didn't tip.
Juno: Whatever's in that temple, the Chancellor wants it in his own hands before we've even seen it.
===

title: Ep30_Severin
---
Severin stands at the edge where the rock just stops, and looks down at the clouds.
Severin: If you fell from here, you'd have time to think about it.
-> "Step back from the edge." #earnest
    Severin: I'm not going to fall, {name}. Valcourts don't fall. We're pushed, and then we sue.
-> "You'd have time to write a very long letter." #wry
    Severin: To my father. Eleven pages. All of them the word "no."
===

title: Ep30_Tamsin
---
Tamsin is sitting very still in the middle of the plateau, as far from every edge as it's possible to be.
Tamsin: This is my spot now. I live here. Bring me things.
===

title: Ep30_Waystone1
---
A standing stone with a rune cut into its face. When you put your hand on it, the rune lights up the blue of a summer storm.
Somewhere toward the temple, something heavy shifts in its sleep.
<<set $WAYSTONE_1 to 1>>
===

title: Ep30_Waystone2
---
The second rune catches, and a line of light runs off across the paving toward the temple floor.
<<set $WAYSTONE_2 to 1>>
===

title: Ep30_Waystone3
---
The third stone wakes. Three lines of light meet in the middle of the temple floor, and a star chart lights up in the stone, every star at once.
<<set $WAYSTONE_3 to 1>>
===

title: Ep30_Mural
---
A wall of old stone with a sky painted on it. Not the sky over Aurelin. Stars in shapes nobody uses any more, joined by lines.
At the bottom, in letters worn almost smooth, one line. WHAT WAS SENT AWAY MAY BE WRITTEN BACK.
<<set $MURAL_READ to 1>>
===

title: Ep30_Temple
---
<<shot wide>>
The temple floor. Twenty Lances in a half-circle round the star chart, and in the middle of it, a shape like a man made of the mountain, kneeling with its head bowed.
<<shot on Halvard>>
Halvard: Lanterns. Right on time. My men broke the seal on the way in. I'm told that was a mistake.
<<shot on Dagrun>>
Dagrun: You're told.
<<shot on Halvard>>
Halvard: The Chancellor's orders were to let you go first. I went first anyway. I'm going to let you go second now, and stand over here.
<<shot wide>>
The kneeling shape lifts its head. Lightning crawls along the lines of the star chart, star to star, and up into its eyes.
<<shot on Juno>>
Juno: Oh, you absolute...
<<shot on Halvard>>
Halvard: Hold it off, Lanterns. The Crown thanks you for your service.
===

title: Ep30_Writ
---
<<shot wide>>
The Warden kneels again, and the light goes out of it. Behind where it knelt, a stone box stands open: inside, a case of old leather and a seal of gold.
<<shot on Halvard>>
Halvard: I'll take that.
<<shot on Severin>>
Severin: Will you.
<<shot on Halvard>>
Halvard: In the Chancellor's name, my lord. Twenty spears say I will.
<<shot two Severin Rook>>
-> "Let him have it." #earnest
    Severin: ...Yes. For now.
-> "Twenty spears and a very tired Lantern? I like our chances." #bold
    Severin: So do I. But not up here. Let him carry it down the chain. We'll know where it went.
<<shot on Lio>>
Lio leans close to the seal as Halvard lifts the case. The Paragon's sun, and three words in the old script around it.
Lio: Writ. Of. Return.
<<shot on Lio>>
Lio: Return of what? Return to where? Why does nobody ever finish their sentences, two hundred years ago?
<<shot wide>>
The gondola carries them back down into the clouds. Halvard's Lances take the first car, with the case.
<<set $WRIT_TAKEN to 1>>
===
`;

const SI = { stage: "isles" }, L = ISLES_LAYOUT;
const [W1, W2, W3] = L.waystones;

export const EPISODE_30 = {
  id: "ep30",
  number: 30,
  unlockAt: 5,
  setup: { ...AFTER_EP29 },
  title: "The Severed Isles",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "title", type: "title" },
    { id: "gondola", type: "scene", node: "Ep30_Gondola", ...SI,
      rook: { x: L.dock.x + 0.6, z: L.dock.z + 2.6, yaw: 0 },
      cast: [
        { id: "tamsin", look: "tamsin", x: L.dock.x - 1.8, z: L.dock.z + 2.2, yaw: 0.4 },
        { id: "juno", look: "juno", x: L.dock.x + 2.4, z: L.dock.z + 1.8, yaw: -0.4 },
        { id: "severin", look: "severin", x: L.dock.x - 0.4, z: L.dock.z + 5.2, yaw: 0 },
        { id: "lio", look: "lio", x: L.dock.x + 2.2, z: L.dock.z + 4.6, yaw: -0.6 },
        { id: "dagrun", look: "dagrun", x: L.dock.x - 2.6, z: L.dock.z + 4.4, yaw: 0.6 },
      ] },
    { id: "plateau", type: "explore", ...SI,
      rook: { x: L.dock.x, z: L.dock.z + 3.2, yaw: 0 },
      objective: "Wake the three waystones on the way to the temple ({n}/{total}).",
      required: ["way1", "way2", "way3"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 4.2, z: -16.6, yaw: -0.6, node: "Ep30_Juno" },
        { id: "severin", look: "severin", x: -18.4, z: 2.2, yaw: -1.6, node: "Ep30_Severin" },
        { id: "tamsin", look: "tamsin", x: -2.4, z: -6.4, yaw: 0.4, node: "Ep30_Tamsin" },
      ],
      pickups: [
        { id: "way1", x: W3[0], z: W3[1] - 1.1, marker: false, node: "Ep30_Waystone1", label: "Wake the waystone" },
        { id: "way2", x: W1[0], z: W1[1] - 1.1, marker: false, node: "Ep30_Waystone2", label: "Wake the waystone" },
        { id: "way3", x: W2[0], z: W2[1] - 1.1, marker: false, node: "Ep30_Waystone3", label: "Wake the waystone" },
        { id: "mural", x: L.mural.x, z: L.mural.z - 1.6, marker: false, node: "Ep30_Mural", label: "Look at the star mural" },
      ],
      encounters: [{ id: "riders", rect: [-14, -12, 14, 2], at: { x: 0, z: -5, r: 5 }, wave: ["rider", "rider", "wisp"], flag: "EP30_RIDERS", label: "TEMPEST RIDERS" }] },
    { id: "temple", type: "scene", node: "Ep30_Temple", ...SI,
      rook: { x: 0, z: -2.2, yaw: 0 },
      cast: [
        { id: "warden", look: "warden", x: 0, z: 7, yaw: Math.PI },
        { id: "halvard", look: "halvardFace", x: 6.4, z: 2.6, yaw: -1.8 },
        { id: "lance1", look: "lance", x: 8.2, z: 4.4, yaw: -1.9 },
        { id: "lance2", look: "lance", x: 7.8, z: 0.6, yaw: -1.6 },
        { id: "dagrun", look: "dagrun", x: -2.6, z: -3.2, yaw: 0.4 },
        { id: "juno", look: "juno", x: 2.4, z: -3.6, yaw: -0.3 },
      ] },
    { id: "warden", type: "fight", ...SI, wave: ["warden"], tokens: 2,
      tutorial: [
        { at: 0.5, text: "Its arm sweeps all the way round it (jump or dodge), and a wall of wind rolls out of it: jump the wave." },
        { at: 12, text: "Up close, its slam hits hard in front. Stay to its side." },
      ],
      eventHints: {
        rodsRise: "Lightning rods: while any stands, it's charged, and thunder falls near them. Break the rods.",
        constellation: "The star chart is lighting up: thunder falls along its lines, star by star. Stand between the lines.",
      },
      lines: [["Juno", "Of course it's a giant. Of course it is."], ["Bas", "One arm's still plenty."]],
      retry: "Up. It's only stone." },
    { id: "writ", type: "scene", node: "Ep30_Writ", ...SI,
      rook: { x: 0, z: 1.6, yaw: 0 },
      cast: [
        { id: "warden", look: "warden", x: 0, z: 7.4, yaw: Math.PI, down: false },
        { id: "halvard", look: "halvardFace", x: 2.6, z: 5.2, yaw: -2.6 },
        { id: "severin", look: "severin", x: -1.8, z: 3.4, yaw: 2.2 },
        { id: "lio", look: "lio", x: -3.4, z: 1.2, yaw: 1.6 },
        { id: "lance1", look: "lance", x: 5.6, z: 3.4, yaw: -1.8 },
      ],
      set: { EP30_DONE: 1, WARDEN_DEFEATED: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep31",
      lines: [
        "Next time on UNWRITTEN:",
        "Children are going missing in the Lowmarket again, and the Choir's rift-walker is back.",
        "But this time somebody else is hunting him too.",
      ] },
  ],
};

/** Free roam on the Isles (after Ep 30): the mural, read again. */
export const ISLES_SCRIPT = `
title: W_Mural
---
A wall of old stone with a sky painted on it. Stars in shapes nobody uses any more, joined by lines.
WHAT WAS SENT AWAY MAY BE WRITTEN BACK.
<<if $WARDEN_DEFEATED>>
    The kneeling Warden hasn't moved since. There's a bird's nest on its shoulder now.
<<endif>>
===
`;
