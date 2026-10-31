// Episode 61 · The Clergy at the Coffin (GDD §27.2b, §27.3; §28; Phase 7 Step 7, §23.6).
//
// Cold open, from his side: the throne chamber. The two of them, home from very far away, tending the coffin like
// priests at a shrine: one with a cloth, one humming. He talks to them like a partner. They're calm, courteous, and
// give nothing away; their masks never come off. (Their plan, the Rite of Waking, which needs three offerings, they
// have never told him.) unkA and unkB, still: no names, and no words anyone can read.
//
// The camp: a pillar of light, and the Hero Party out of it, as every month for fifteen years. Corin (5★ since the
// throne room), Maelis (1★, frail), King D. They hate demons; and here are humans standing among them. Corin tests the
// demon-friends himself, and yields. Maelis has noticed something: a door where there wasn't one.

import { AFTER_EP60 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { CAMP_LAYOUT as C, THRONE_LAYOUT as T } from "./places.js";

export const EP61_SCRIPT = `
title: Ep61_Coffin
---
<<sfx unkSpeechFaint>>
<<shot wide>>
The throne chamber. The two of them are home: one with a black cloth, wiping ash from the coffin's lid that nobody else would ever see; the other standing at its foot, humming, very softly, the march.
<<shot on Cal>>
Cal: You're back. Where was it this time? No, don't tell me. You never tell me.
<<sfx unkSpeechA>>
<<shot on unkA>>
The one with the cloth inclines his head, a fraction. The painted frown doesn't move.
<<shot on Cal>>
Cal: [Speaking an unknown language]
<<shot on Cal>>
Cal: The Lanterns came through. Rook brought the key. I said they would. I'm usually right, you'll have noticed.
<<shot on unkB>>
She keeps humming. Her painted smile turns, very slightly, toward him, and stays there a moment longer than it needs to.
<<shot on Cal>>
Cal: Partners don't keep secrets, you know. That's the rule where I've been living. You'd like it there. Nobody ranks anybody. Well. Nobody admits it.
<<shot wide>>
Neither of them answers. The cloth goes on, slow circles over black lacquer. The march goes on. He watches them a while, smiling, as if this is the best company he's ever kept.
===

title: Ep61_Pillar
---
<<shot wide>>
The pillar of light comes down in the middle of the camp, the way it's come down every month for fifteen years. Three figures step out of it.
<<shot on Corin>>
Corin: Same camp. Same soldiers, in the same places. Same month, again. And—
<<shot on Corin>>
He stops. He's looking at you. Humans, in Liraen's colours, standing among the Line, and the soldiers who've stepped aside standing among you.
<<shot on Corin>>
Corin: Demon-friends.
<<shot on KingD>>
KingD: Corin.
<<shot on Corin>>
Corin: I've killed every soldier in this camp a hundred times, King. They come back. These won't. Stand aside, Saint.
<<shot on Maelis>>
Maelis: Corin, wait. Look at them. They're not—
<<shot on Corin>>
Corin: I'll find out what they are.
===

title: Ep61_Yield
---
<<shot wide>>
Corin grounds his sword in the ash and leans on it. He's breathing hard. He doesn't look like a man who breathes hard often.
<<shot on Corin>>
Corin: You don't fight like demons. You fight like people who've had to.
<<shot on Maelis>>
Maelis: I tried to tell him. Nobody's let me finish a sentence in fifteen years.
<<shot on Maelis>>
Maelis: Something's different this month. There's a door at the edge of the camp where there wasn't one. Gold. And the soldiers are… asking things.
<<shot on KingD>>
KingD: You came through the door. What's on your side of it?
-> "Home. And someone we came to find."
    <<set $HEROES_TOLD to "find">>
    <<shot on Rook>>
    Rook: Home. We came to find someone. He used to be ours.
    <<shot on Corin>>
    Corin: Used to be.
-> "A soldier who stepped out of the line."
    <<set $HEROES_TOLD to "soldier">>
    <<shot on Rook>>
    Rook: We're looking for a soldier who stepped out of the line. A long time ago.
    <<shot on Corin>>
    Corin goes very still.
    <<shot on Corin>>
    Corin: There was one. In my second year. He had me, on the ground, and let it go. I've never known why.
<<shot on Corin>>
Corin: Fine. We'll stand beside you until I see who you're looking for. Then we'll see.
<<set $HERO_TRUCE to 1>>
<<set $EP61_DONE to 1>>
===
`;

const THRONE = { stage: "throne" }, CAMP = { stage: "camp" };
const P = C.pillar;

export const EPISODE_61 = {
  id: "ep61",
  number: 61,
  unlockAt: 5,
  setup: { ...AFTER_EP60 },
  title: "The Clergy at the Coffin",
  arc: "Arc 7 · Unwritten",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "coffin", type: "scene", node: "Ep61_Coffin", ...THRONE, rook: null,
      cast: [
        { id: "cal", look: "unmasked", x: 0, z: 12.2, yaw: 0 },
        { id: "unkA", look: "unkATrue", x: -2.3, z: T.coffin.z - 1.0, yaw: Math.PI / 2 },
        { id: "unkB", look: "unkBTrue", x: 2.3, z: T.coffin.z - 1.4, yaw: -Math.PI / 2 - 0.4 },
      ] },
    { id: "title", type: "title" },
    { id: "pillar", type: "scene", node: "Ep61_Pillar", ...CAMP,
      rook: { x: P.x - 0.4, z: P.z - 4.2, yaw: 0 },
      cast: [
        { id: "corin", look: "corinNow", x: P.x, z: P.z + 0.6, yaw: Math.PI },
        { id: "maelis", look: "maelisNow", x: P.x + 1.8, z: P.z + 1.4, yaw: Math.PI - 0.3 },
        { id: "kingD", look: "kingD", x: P.x - 1.8, z: P.z + 1.4, yaw: Math.PI + 0.3 },
        { id: "juno", look: "juno", x: P.x - 2.4, z: P.z - 4.6, yaw: 0.3 },
        { id: "bas", look: "bas", x: P.x + 1.8, z: P.z - 4.8, yaw: -0.2 },
        { id: "lineSergeant", look: "lineSoldier", x: P.x - 4.0, z: P.z - 2.8, yaw: 0.6 },
      ] },
    // Corin tests the demon-friends himself. He can't be put down; he yields when he's seen enough.
    { id: "corin", type: "fight", ...CAMP, wave: [], tokens: 2,
      world: { bounds: ZONES.camp.bounds, origin: { x: P.x, z: P.z - 2 } },
      siege: {
        foes: [{ kind: "heroKnightNow", x: P.x, z: P.z + 0.6, yaw: Math.PI, floor: 0.5 }],
        meter: { label: "The Knight Hero", start: 1, end: 0, seconds: 45, perKill: 0 },
        marks: [
          { frame: 700, say: ["Corin", "Fifteen years I've fought the same soldiers. You're new."] },
          { frame: 1600, say: ["Maelis", "Corin, enough!"] },
          { frame: 2200, say: ["Corin", "…Not yet."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "CORIN, THE KNIGHT HERO. The only five-star anyone knows of. You can't beat him: last until he's seen enough." }],
      lines: [["Corin", "Show me what you are."]],
      retryBy: "Corin", retry: "Again. I haven't seen it yet." },
    { id: "yield", type: "scene", node: "Ep61_Yield", ...CAMP,
      rook: { x: P.x - 0.4, z: P.z - 3.0, yaw: 0 },
      cast: [
        { id: "corin", look: "corinNow", x: P.x, z: P.z, yaw: Math.PI },
        { id: "maelis", look: "maelisNow", x: P.x + 2.0, z: P.z + 0.6, yaw: Math.PI - 0.4 },
        { id: "kingD", look: "kingD", x: P.x - 2.0, z: P.z + 0.6, yaw: Math.PI + 0.4 },
        { id: "juno", look: "juno", x: P.x - 2.4, z: P.z - 3.6, yaw: 0.3 },
        { id: "bas", look: "bas", x: P.x + 2.0, z: P.z - 3.8, yaw: -0.3 },
      ],
      set: { EP61_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep62",
      lines: [
        "Next time on UNWRITTEN:",
        "A night by the braziers with the Goddess Saint, who has one star left.",
        "The Trial continues.",
      ] },
  ],
};
