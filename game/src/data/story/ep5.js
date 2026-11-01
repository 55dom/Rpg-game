// Episode 5 · Thread and Needle (GDD §14 Arc 1; §15.5 S6). Juno-centric.
//
// Juno thinks the one-pager is a liability, and says so. A job in Thornwick, of all places (Rook's village): someone's
// holed up in the old mill and the grain's going missing. Juno's way: threads strung between three posts round the mill,
// tied in her Quill knot (over, under, through, back), so that whoever runs, runs into them. Mother Wren, at the
// orphanage door, who knew Rook before anyone. Bandits in the mill. Afterwards, grudging respect, and at the Lighthouse
// that night Juno ties a red cord with her Quill knot on every Lantern's wrist, Cal's included (S6).

import { AFTER_EP4 } from "./arc12.js";
import { ZONES, THORNWICK_LAYOUT as T } from "../zones.js";

export const EP5_SCRIPT = `
title: Ep5_Board
---
<<shot wide>>
Morning at the Lighthouse. Dagrun has a job pinned to the squad board, and is pretending to have read it.
<<shot on Dagrun>>
Dagrun: Thornwick. Somebody's camped in the old mill and the grain's walking off in the night. The farmers want them gone. Politely, if possible.
<<shot on Juno>>
Juno: I'll take it. Me and Bas. The one-pager stays here.
<<shot on Rook>>
-> "Thornwick's my village."
    <<set $EP5_HOME to 1>>
    <<shot on Rook>>
    Rook: Thornwick's my village. I grew up at the orphanage. I'm going.
    <<shot on Juno>>
    Juno: …Fine. But you stay behind me, and you don't touch my thread.
-> "I'm not a liability."
    <<shot on Rook>>
    Rook: I'm not a liability.
    <<shot on Juno>>
    Juno: Everyone's a liability until they've proved they aren't. You've had one fight and a lot of luck.
<<shot on Cal>>
Cal: Take Juno's lead on this one, kid. Thread's patient. You're not. Yet.
<<shot on Cal>>
Cal: And Juno. Bring them back with all their fingers. I've grown fond of their fingers.
===

title: Ep5_Wren
---
<<shot on Wren>>
Wren: Well. Look who's a knight. Or near enough. Stand up straight, I can't see your badge.
<<shot on Wren>>
Wren: You used to hit that post by the oak with a stick until the stick broke. Every day. I never knew what you were practising for.
<<shot on Juno>>
Juno: …They grew up here?
<<shot on Wren>>
Wren: Grew up, fell down, got up again. Mostly that last one. You're the thread girl. Mind them for me.
<<shot on Juno>>
Juno: I— yes. Ma'am.
===

title: Ep5_Post
---
<<shot on Juno>>
Juno: Here. Hold the end. No, the other way. Over, under, through, back. That's a Quill knot. It doesn't slip, and it doesn't forgive.
<<shot on Rook>>
You pull it tight. The thread hums faintly between the post and the next one, nearly invisible in the morning light.
===

title: Ep5_Post2
---
<<shot on Juno>>
Juno: Better. You're tying it like it matters. Most people tie it like they're late.
===

title: Ep5_Post3
---
<<shot on Juno>>
Juno: That's the last one. Now the mill's in a net and they don't know it. Whoever runs, runs into us.
<<shot on Bas>>
Bas: And whoever doesn't run, runs into me. I'll knock.
===

title: Ep5_Knot
---
<<shot wide>>
That night at the Lighthouse. Juno comes down from her room with a length of red cord and her sewing scissors, and doesn't say anything until she's sat down.
<<shot on Juno>>
Juno: You did fine. Today. Don't get excited about it.
<<shot on Juno>>
Juno: Give me your wrist.
<<shot on Rook>>
She ties a red cord round it with a Quill knot. Over, under, through, back. Then she does Bas's, and Lio's, and Tamsin's, and Dagrun's, who pretends to be asleep and holds his arm out anyway.
<<shot on Cal>>
Cal holds out his wrist last. She ties it tighter than the others, the way you'd tie something you didn't trust to stay.
<<set $QUILL_CORD to 1>>
<<set $CLUE_S6 to 1>>
<<shot on Cal>>
Cal: Is this a promise or a leash?
<<shot on Juno>>
Juno: It's a knot. It holds. That's the whole point of a knot.
-> "Thank you, Juno."
    <<set $JUNO_RESPECT to 1>>
    <<shot on Rook>>
    Rook: Thank you, Juno.
    <<shot on Juno>>
    Juno: Don't. …You're less of a liability than I said. Slightly.
-> "Does it come off?"
    <<set $JUNO_RESPECT to 1>>
    <<shot on Rook>>
    Rook: Does it come off?
    <<shot on Juno>>
    Juno: Not unless you cut it. And if you cut it, I'll know.
<<set $EP5_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, TW = { stage: "thornwick" };
const MORNING = { sky: { daylight: 0.5 } }, NIGHT = { sky: { daylight: 0.08 } };
const M = T.mill;
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
];

export const EPISODE_5 = {
  id: "ep5",
  number: 5,
  setup: { ...AFTER_EP4 },
  title: "Thread and Needle",
  arc: "Arc 1 · The One-Page Mage",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "board", type: "scene", node: "Ep5_Board", ...LH, ...MORNING,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [...atTable, { id: "dagrun", look: "dagrun", x: 5.0, z: 9.6, yaw: Math.PI }, { id: "cal", look: "cal", x: 1.8, z: 3.4, yaw: 1.2 }] },
    { id: "wren", type: "scene", node: "Ep5_Wren", ...TW, ...MORNING,
      rook: { x: 1.4, z: 11.4, yaw: 0.54 },
      cast: [
        { id: "wren", look: "wren", x: 2.6, z: 13.4, yaw: Math.PI + 0.54 },
        { id: "juno", look: "juno", x: -0.4, z: 10.8, yaw: 0.7 },
        { id: "bas", look: "bas", x: 3.6, z: 10.4, yaw: -0.6 },
      ] },
    // Juno's net: three posts round the mill, each tied in a Quill knot.
    { id: "net", type: "explore", ...TW, ...MORNING,
      rook: { x: 14, z: -8, yaw: Math.PI / 2 },
      objective: "Juno's net. Tie the thread to the three posts round the mill ({n}/{total}).",
      required: ["post1", "post2", "post3"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 15.6, z: -10.4, yaw: 1.4 },
        { id: "bas", look: "bas", x: 14.2, z: -13.2, yaw: 1.0 },
      ],
      pickups: [
        { id: "post1", x: M.x - 4.2, z: M.z + 2.0, node: "Ep5_Post", label: "A fence post" },
        { id: "post2", x: M.x + 0.4, z: M.z + 4.4, node: "Ep5_Post2", label: "A fence post" },
        { id: "post3", x: M.x + 3.2, z: M.z - 3.6, node: "Ep5_Post3", label: "A fence post" },
      ] },
    { id: "mill", type: "fight", ...TW, ...MORNING, wave: ["bandit", "bandit", "bandit", "hound", "bandit"], tokens: 2,
      world: { bounds: ZONES.thornwick.bounds, origin: { x: M.x - 6, z: M.z } },
      tutorial: [{ at: 0.5, text: "They've run into Juno's net. Call Juno ({Assist2}): her Snare Line binds one in place." }],
      lines: [["Juno", "There. Caught. Now hit them while they're tangled."], ["Bas", "Knock knock!"]],
      retry: "Again. The net's still up." },
    { id: "knot", type: "scene", node: "Ep5_Knot", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [...atTable, { id: "dagrun", look: "dagrun", x: 5.0, z: 9.6, yaw: Math.PI }, { id: "cal", look: "cal", x: 1.8, z: 3.4, yaw: 1.2 }],
      set: { EP5_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep6",
      lines: [
        "Next time on UNWRITTEN:",
        "A fen town where nobody can speak. The Pale Choir surfaces.",
        "And a voice that says one page was never meant to be enough.",
      ] },
  ],
};
