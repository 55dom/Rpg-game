// Episode 52 · Ninth Bell (GDD §14 Arc 6, §12.1 the Crimson Bell, §15.9; Phase 7 Step 1, §23.6). This folder is the
// one allowed to name him (§15.11).
//
// The Bell Tower at the ninth bell. The squad stands in the seal ring where the accused stand, and Captain Ulric Graves
// hears each of them: Juno, Bas, Tamsin, Lio (the Bell keeps records too: a former novice of the Choir's silent school),
// Dagrun (who says nothing), and Rook, whose sketch had no note, only a key. "The Bell doesn't take anyone's word. It
// takes the paper's." The Silencing: seals close where you stand, the wardens test you, the bell tolls, and the paper
// finds nothing. Not clean: nothing, as if the book had no pages. The finding: struck off the Crown's rolls, Merit
// frozen, a warden at the Lighthouse. And, alone in the ring, a bell no bigger than a thimble: "If he comes back, ring it."
//
// That night Lio reads the first margin, under Juno's page: "She'll cut it off when she finds out. Let her. She ties a
// better one after." Juno: "Not yet." And on the step under the lantern room, Dagrun, at last: "I still leave the light
// on. Don't know if that makes me a fool."

import { AFTER_EP51 } from "./arcs.js";
import { ZONES, BELLTOWER_LAYOUT as BTL } from "../data/zones.js";

export const EP52_SCRIPT = `
title: Ep52_Hearing
---
<<shot wide>>
The squad stands in the seal ring under the great bell, where the accused stand. Captain Graves has the ledger open in front of him.
<<shot on Ulric>>
Ulric: The Bell hears the Last Lanterns. This isn't a trial. Nobody here is accused of anything.
<<shot on Ulric>>
Ulric: Yet.
<<shot on Ulric>>
Ulric: Juno. You shared a roof with him. You did his washing, I'm told, when he forgot.
<<shot on Juno>>
Juno: He never forgot anything. I know that now.
<<shot on Ulric>>
Ulric: Bas. He broke your arm under Ironhold, and for a week afterwards you told the Wardens' surgeon it couldn't have been anyone you knew.
<<shot on Bas>>
Bas: I didn't know it was him.
<<shot on Ulric>>
Ulric: No. That's what worries me. None of you knew. Tamsin.
<<shot on Tamsin>>
Tamsin: He said he liked us. That's all I've got, and I'm not taking it back because you've got a ledger.
<<shot on Ulric>>
Ulric: Lio. Former novice of the Choir's silent school. The Bell keeps records too, boy.
<<shot on Lio>>
Lio: Former.
<<shot on Ulric>>
Ulric: The script in the margins of his notebooks. The Choir kept pages of it. You'd have seen them.
<<shot on Lio>>
Lio: I saw them. Nobody could read them.
<<shot on Ulric>>
Ulric: Nobody. Mm.
<<shot on Ulric>>
Ulric: Captain Holt.
<<shot on Dagrun>>
Dagrun says nothing.
<<shot on Ulric>>
Ulric: Your captain hasn't said a word since the bridge. I'm told he's the one who took the demon in. Off the street, with nowhere to go. It's always a kindness, at the start.
<<shot on Ulric>>
Ulric: And you. He wrote every one of them a note. Under yours, he drew a key. What did he want with you?
-> "He was our vice captain. He saved my life."
    <<set $BELL_ANSWER to "defend">>
    <<shot on Rook>>
    Rook: He was our vice captain. He saved my life. More than once.
    <<shot on Ulric>>
    Ulric: So did the knight who broke your friend's arm. They're the same man, Lantern. Or the same something.
-> "I don't know. None of us did."
    <<set $BELL_ANSWER to "honest">>
    <<set $BELL_TRUST to $BELL_TRUST + 1>>
    <<shot on Rook>>
    Rook: I don't know. None of us knew.
    <<shot on Ulric>>
    Ulric: Good. That's the first true thing anyone's said this morning.
-> "Then find him. We'll help."
    <<set $BELL_ANSWER to "help">>
    <<set $REP_SQUAD to $REP_SQUAD + 5>>
    <<shot on Rook>>
    Rook: Then find him. We'll help you.
    <<shot on Ulric>>
    Ulric: You'll help me. We'll see what you're worth to me after the Silencing.
<<shot on Ulric>>
Ulric: The Bell doesn't take anyone's word. It takes the paper's. If that book of yours carries his script, the seals will find it.
<<shot on Ulric>>
Ulric: The rest of you, by the door. You, stay in the ring. Wardens.
===

title: Ep52_Verdict
---
<<cue sealsOff>>
<<shot on Ulric>>
Ulric: Nothing.
<<shot on Ulric>>
Ulric: Not clean. Clean, I'd understand. Nothing. The seals went over every page of that book, and they came back as if there weren't any pages.
<<shot on Rook>>
He looks at you for a long moment, the way you'd look at a door you can't find the hinges on.
<<shot on Ulric>>
Ulric: I've never seen that. I don't like things I've never seen.
<<shot on Ulric>>
Ulric: The Bell's finding. The Last Lanterns are struck off the Crown's rolls until the Bell is satisfied. No missions. No Merit. A warden at your Lighthouse, day and night.
<<set $MERIT_FROZEN to 1>>
<<set $BELL_WARDEN_POSTED to 1>>
<<set $REP_SQUAD to $REP_SQUAD - 10>>
<<shot on Juno>>
Juno: We held the bridge.
<<shot on Ulric>>
Ulric: You did. That's why you're struck off, and not in a cell.
<<shot wide>>
The wardens open the doors, and the squad goes out. Captain Graves waits until there's only you left in the ring.
<<shot two Ulric Rook>>
Ulric: Lantern.
<<shot on Ulric>>
He holds out a bell no bigger than a thimble, on a red cord.
<<shot on Ulric>>
Ulric: If he comes back, ring it. Wherever you are, I'll hear it. Whatever you are, you're not stupid enough to face him alone twice.
<<set $BELL_TOKEN to 1>>
===

title: Ep52_Margins
---
<<shot wide>>
That night. Lio has the margins spread across the table, his copies and the notebooks both, and he's been at them since they got home.
<<shot on Lio>>
Lio: It's not a cipher. It's a language. Somebody taught him to write it. Or he taught himself, a long time ago.
<<shot on Lio>>
Lio: I've got one line. Juno's.
<<shot on Juno>>
Juno: Read it.
<<shot on Lio>>
Lio: You're sure?
<<shot on Juno>>
Juno: Read it, Lio.
<<shot on Lio>>
Lio: "She'll cut it off when she finds out. Let her. She ties a better one after."
<<set $MARGIN_JUNO to 1>>
<<shot on Juno>>
Nobody says anything. Juno looks at her bare wrist for a long moment.
<<shot on Juno>>
Juno: Not yet.
<<shot on Juno>>
Juno: He doesn't get to know that one.
===

title: Ep52_Light
---
<<shot wide>>
Later. Everyone else has gone in. The lantern room's still lit, and Dagrun's on the step under it, where he's been every night since the bridge.
<<pose Rook sit>>
<<shot wide>>
You sit down beside him. For a while, neither of you says anything.
<<shot on Dagrun>>
Dagrun: I still leave the light on.
<<shot on Dagrun>>
Dagrun: Don't know if that makes me a fool.
-> "Then I'm one too."
    <<set $DAGRUN_LIGHT to "fool">>
    <<shot on Rook>>
    Rook: Then I'm one too.
    <<shot on Dagrun>>
    Dagrun almost smiles. It's the closest he's come in days.
    <<shot on Dagrun>>
    Dagrun: Two fools on a step. That's a squad, near enough.
-> "It makes you Dagrun."
    <<set $DAGRUN_LIGHT to "dagrun">>
    <<shot on Rook>>
    Rook: It makes you Dagrun.
    <<shot on Dagrun>>
    Dagrun: ...Yeah. I suppose it does.
-> Stay with him.
    <<set $DAGRUN_LIGHT to "quiet">>
    <<shot wide>>
    You don't answer. You stay. After a while his hand comes down on your shoulder, heavy, just the once.
<<shot wide>>
Up in the lantern room, the light burns all night. Nobody puts it out.
<<set $DAGRUN_SPOKE to 1>>
<<set $EP52_DONE to 1>>
===
`;

const BT = { stage: "belltower" }, LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.06 } };
const R = BTL.ring, J = BTL.judge;
const bench = [
  { id: "ulric", look: "ulric", x: J.x, z: J.z, yaw: Math.PI },
  { id: "bellWarden", look: "bellWarden", x: -2.6, z: J.z + 0.3, yaw: Math.PI },
  { id: "warden2", look: "bellWarden", x: 2.6, z: J.z + 0.3, yaw: Math.PI },
];
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
];

export const EPISODE_52 = {
  id: "ep52",
  number: 52,
  unlockAt: 5,
  setup: { ...AFTER_EP51 },
  title: "Ninth Bell",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "toll", type: "cutscene", cutscene: "ep52_toll" },
    { id: "title", type: "title" },
    { id: "hearing", type: "scene", node: "Ep52_Hearing", ...BT,
      rook: { x: R.x, z: R.z + 0.2, yaw: 0 },
      cast: [
        ...bench,
        { id: "juno", look: "juno", x: -1.7, z: R.z - 0.5, yaw: 0.15 },
        { id: "lio", look: "lio", x: 1.7, z: R.z - 0.5, yaw: -0.15 },
        { id: "bas", look: "bas", x: -3.2, z: R.z - 1.3, yaw: 0.3 },
        { id: "tamsin", look: "tamsin", x: 3.2, z: R.z - 1.3, yaw: -0.3 },
        { id: "dagrun", look: "dagrun", x: -0.6, z: R.z - 2.4, yaw: 0.1 },
      ] },
    // The Silencing: seals close where you stand, the wardens test you (they can't be put down), and the bell tolls.
    { id: "silencing", type: "fight", ...BT, wave: [], tokens: 2,
      world: { bounds: ZONES.belltower.bounds, origin: { x: R.x, z: R.z }, companions: false },
      siege: {
        foes: [
          { kind: "bellWarden", x: -3.6, z: 4.4, yaw: Math.PI, floor: 0.3 },
          { kind: "bellWarden", x: 3.6, z: 4.4, yaw: Math.PI, floor: 0.3 },
          { kind: "bellWarden", x: 0, z: -3.6, yaw: 0, floor: 0.3 },
        ],
        meter: { label: "The Silencing", start: 1, end: 0, seconds: 45, perKill: 0 },
        marks: [
          { frame: 1, cue: "seals" }, { frame: 1, cue: "toll" }, { frame: 1, sfx: "bell" },
          { frame: 600, say: ["Ulric", "Keep moving. A seal only takes what stands still."] },
          { frame: 1300, cue: "toll" }, { frame: 1300, sfx: "bell" },
          { frame: 1500, say: ["Ulric", "Nothing yet."] },
          { frame: 2300, say: ["Ulric", "Still nothing. That isn't possible."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "THE SILENCING. A seal closes wherever you stand: keep moving. The wardens can't be put down; outlast the bell." }],
      lines: [["Ulric", "Begin."]],
      retryBy: "Ulric", retry: "Again. The paper isn't finished with you.",
      set: { SILENCED: 1 } },
    { id: "verdict", type: "scene", node: "Ep52_Verdict", ...BT,
      rook: { x: R.x, z: R.z + 0.2, yaw: 0 },
      cast: [
        ...bench,
        { id: "juno", look: "juno", x: -2.2, z: -6.4, yaw: 0.4 },
        { id: "bas", look: "bas", x: -3.6, z: -6.8, yaw: 0.5 },
        { id: "lio", look: "lio", x: 2.2, z: -6.4, yaw: -0.4 },
        { id: "tamsin", look: "tamsin", x: 3.6, z: -6.8, yaw: -0.5 },
      ] },
    { id: "margins", type: "scene", node: "Ep52_Margins", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 }, cast: atTable },
    { id: "light", type: "scene", node: "Ep52_Light", ...LH, ...NIGHT,
      rook: { x: -2.9, z: 9.7, yaw: Math.PI },
      cast: [{ id: "dagrun", look: "dagrun", x: -4.2, z: 9.7, yaw: Math.PI, pose: "sit" }],
      set: { EP52_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep53",
      lines: [
        "Next time on UNWRITTEN: Arc 6, The Light Left On.",
        "In the Lowmarket, a soldier from the other side of the Gate, who never went home. He has questions.",
        "And the Chancellor stands trial.",
      ] },
  ],
};
