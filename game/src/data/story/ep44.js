// Episode 44 · The Archive (GDD §14 Arc 5). The Grand Archive at the top of the Crown Ward (a new set): the first
// Paragon built it over the lock so the door would always be watched by people who read. Archivist Ottoline shows the
// Lanterns the lock and its keyhole in two halves. In the sealed stacks the first Paragon's account of what was on the
// other side of the door has been cut out, cleanly, a long time ago, and the Choir's readers have been in there before
// them. Lio finds what they came for: the Choir's hymnal. Every hymn the Choir has sung for fifteen years is one line
// of a letter, and the letter is an invitation, and the last line is a name, left blank. It doesn't need the key.

import { AFTER_EP43 } from "./arc5.js";
import { ARCHIVE_LAYOUT as L, ZONES } from "../zones.js";

export const EP44_SCRIPT = `
title: Ep44_Cold
---
<<shot wide>>
The Grand Archive, after the lamps are out. High Chancellor Aldric stands alone at the edge of the dais with his hands behind his back, looking down at the round stone door in the floor.
<<fx rift Hesper>>
<<show Hesper>>
<<shot on Aldric>>
Aldric: He has both halves. Your masked friend.
<<shot on Hesper>>
Hesper: He isn't my friend, Aldric. I'm not sure he's anybody's. And let him keep his key. Keys are for people who mean to walk through doors. I only mean to knock.
<<shot on Aldric>>
Aldric: And my Lances?
<<shot on Hesper>>
Hesper: The Founding. When the whole city is in the streets, and the Paragon's on the Archive steps making his speech. Bring them then.
===

title: Ep44_Lock
---
<<shot wide>>
Daylight through the eye in the dome falls straight down onto the dais and the round door of dark stone in it. The keyhole is two crescents cut into the stone, side by side, like a broken ring.
<<shot on Ottoline>>
Ottoline: The first Paragon built the Archive on top of it, so that it would always be watched by people who read. We've been watching it for two hundred years. It's never done anything. I'd like it to keep not doing anything.
<<shot on Paragon>>
Paragon: Archivist Ottoline. She knows more about that door than anyone living, and she's never been allowed to open the book about it.
<<shot on Lio>>
Lio: There's a book about it?
<<shot on Ottoline>>
Ottoline: The first Paragon's own account. In the sealed stacks. You'll want to read it. ...You'll be disappointed.
<<shot two Ottoline Rook>>
-> "We'd like to read it anyway." #earnest
    Ottoline: Everyone always would. The gate's open. Try not to sneeze on anything.
-> "Disappointed how?" #wry
    Ottoline: Go and see. It's quicker than me explaining, and much more upsetting.
===

title: Ep44_Ottoline
---
Ottoline: The sealed stacks are behind the grille. Nobody's allowed in without the Paragon's word. ...Someone was in there last week. I found the gate open. Nothing missing that I could see.
===

title: Ep44_Juno
---
Juno: Do you think anyone's read all of these? Every single one?
Juno: I think I'd read the short ones first. Then I'd feel very clever and stop.
===

title: Ep44_Paragon
---
Paragon: He has both halves, and the lock's right here, and I've the whole Crown Ward's guard on the door. If he wanted to open it he'd have done it by now.
Paragon: So he doesn't. Which leaves the question of what he wants instead.
===

title: Ep44_Account
---
The first Paragon's account, bound in faded red. The hand is small and very steady.
"We closed it from this side, and I broke the key, and I gave one half to the Crown and kept the other. Because on the other side of the door we saw..."
And the next pages are gone. Not torn: cut out, cleanly, close to the spine, with a very sharp knife, a very long time ago.
<<set $ACCOUNT_CUT to 1>>
===

title: Ep44_Lio
---
<<shot on Lio>>
Lio: {name}. This was on the floor behind the last stack. It's a Choir hymnal. Mother Vey had one like it. Everyone in the silent school did.
<<shot on Lio>>
Lio: Except this one's annotated. Somebody's numbered every hymn. And there are notes in the margin, in a hand I know. Hesper's.
<<set $HYMNAL_FOUND to 1>>
===

title: Ep44_Invitation
---
<<shot wide>>
Ink-stained acolytes lie among the fallen books. Lio has brought the hymnal out into the light under the dome, and stands in the aisle turning its pages very slowly.
<<shot on Lio>>
Lio: Every hymn the Choir's sung for fifteen years. Every one. They aren't hymns. Each of them is one line of a letter.
<<shot on Lio>>
Lio: And the letter's an invitation. "Come through. We are ready for you. We have made a place for you." On and on, for pages.
<<shot on Paragon>>
Paragon: Addressed to whom?
<<shot on Lio>>
Lio: The last line's a name. And it's blank. It's waiting for somewhere to write it.
<<shot on Juno>>
Juno: Elodie.
<<shot on Lio>>
Lio: It doesn't need the key. You don't need a key to open a door if somebody on the other side opens it for you.
<<shot on Paragon>>
Paragon: The Founding's in two days. The whole city will be in the streets. ...Go home. Keep Elodie close, all of you. I'll speak to the Crown.
<<set $INVITATION_KNOWN to 1>>
===
`;

const AR = { stage: "archive" }, NIGHT = { sky: { daylight: 0.05 } };
const D = L.dais, S = L.sealed;

export const EPISODE_44 = {
  id: "ep44",
  number: 44,
  unlockAt: 5,
  setup: { ...AFTER_EP43 },
  title: "The Archive",
  arc: "Arc 5 · Writ of Return",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep44_Cold", ...AR, ...NIGHT, rook: null,
      cast: [
        { id: "aldric", look: "aldric", x: 1.4, z: D.z - D.r - 1.0, yaw: -0.2 },
        { id: "hesper", look: "hesper", x: -1.8, z: D.z - D.r - 0.8, yaw: 1.4, hidden: true },
      ] },
    { id: "title", type: "title" },
    { id: "lock", type: "scene", node: "Ep44_Lock", ...AR,
      rook: { x: 0, z: D.z - D.r - 3.6, yaw: 0 },
      cast: [
        { id: "ottoline", look: "archivist", x: -1.7, z: D.z - D.r - 0.9, yaw: 2.6 },
        { id: "paragon", look: "paragon", x: 1.8, z: D.z - D.r - 1.0, yaw: -2.6 },
        { id: "lio", look: "lio", x: -2.8, z: D.z - D.r - 3.2, yaw: 0.6 },
        { id: "juno", look: "juno", x: 2.8, z: D.z - D.r - 3.4, yaw: -0.6 },
      ] },
    { id: "stacks", type: "explore", ...AR,
      rook: { x: 0, z: D.z - D.r - 3.6, yaw: Math.PI },
      objective: "The sealed stacks: read the first Paragon's account, and find Lio ({n}/{total}).",
      required: ["account", "lio"], counts: "required",
      cast: [
        { id: "ottoline", look: "archivist", x: -8.4, z: S.z0 - 1.0, yaw: 0.4, node: "Ep44_Ottoline" },
        { id: "lio", look: "lio", x: -7.6, z: S.z1 - 1.4, yaw: Math.PI, node: "Ep44_Lio" },
        { id: "juno", look: "juno", x: 3.4, z: -5.6, yaw: -0.4, node: "Ep44_Juno" },
        { id: "paragon", look: "paragon", x: 1.8, z: D.z - D.r - 1.0, yaw: 0.2, node: "Ep44_Paragon" },
      ],
      pickups: [{ id: "account", x: L.lectern.x, z: L.lectern.z - 0.9, marker: false, node: "Ep44_Account", label: "The first Paragon's account" }] },
    { id: "readers", type: "fight", ...AR, wave: ["acolyte", "acolyte", "cantor", "acolyte"], tokens: 2,
      world: { bounds: ZONES.archive.bounds },
      tutorial: [{ at: 0.5, text: "The Choir's readers, out of the stacks. Mind the shelves: they block you, and they block them." }],
      lines: [["Juno", "In a library! Who fights in a library?"], ["Lio", "Don't let them have the hymnal!"]],
      retry: "Up. Lio's got the book." },
    { id: "invitation", type: "scene", node: "Ep44_Invitation", ...AR,
      rook: { x: -1.2, z: D.z - D.r - 2.9, yaw: -0.6 }, // out in the aisle under the dome: the stacks and the grille would fill every shot
      cast: [
        { id: "lio", look: "lio", x: -3.0, z: D.z - D.r - 0.6, yaw: Math.PI * 0.85 },
        { id: "paragon", look: "paragon", x: 1.0, z: D.z - D.r - 0.8, yaw: -2.4 },
        { id: "juno", look: "juno", x: -4.4, z: D.z - D.r - 2.6, yaw: 0.9 },
      ],
      set: { EP44_DONE: 1, INVITATION_KNOWN: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep45",
      lines: [
        "Next time on UNWRITTEN:",
        "The night before the Founding. A lantern in every window.",
        "And a knock from the other side.",
      ] },
  ],
};
