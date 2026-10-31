// Episode 51 · The Light Left On (GDD §14 Arc 6, §15.9 "Aftermath & permanent change"; Phase 7 Step 1, §23.6). This
// folder is the one allowed to name him (§15.11); Arcs 6–7 may.
//
// The morning after the Siege. Nobody went to bed. The Field Notes on the table, where somebody put them down and nobody
// picked them up again. Juno reads her page ("Ties a knot when she's scared. Don't tell her you know.") and cuts the
// knot off her wrist. Bas: "He broke my arm. I kept telling myself it wasn't him." Tamsin: "He said he liked us. He said
// it." Lio turns a notebook on its side and reads the margins: the script on the mask; the Choir kept three pages of it.
// Dagrun says nothing, all episode: he moves over on the step so there's room.
//
// In Aurelin, the Crimson Bell has papered over the Sable Knight's poster: the Last Lanterns are confined to quarters
// pending inquiry (Squad Rep falls). In the Valcourt crypt, Severin at Aurek's grave with the flower that was left on it:
// "You let me believe." Elodie: "He carried me out of the dark. He was gentle." That evening, Captain Ulric Graves of
// the Bell at the Lighthouse door: a courtesy seal, his effects, and a summons for the ninth bell.

import { AFTER_EP50 } from "./arcs.js";

export const EP51_SCRIPT = `
title: Ep51_Table
---
<<shot wide>>
The morning after the Siege. Nobody went to bed, and nobody's eaten. The Field Notes are on the table, where somebody put them down last night and nobody picked them up again.
<<shot on Juno>>
Juno opens the top one at her own page. She reads it twice.
<<shot on Juno>>
Juno: "Ties a knot when she's scared. Don't tell her you know."
<<shot on Juno>>
Juno: He knew. All this time he knew, and he never said. He wrote it down instead.
<<pose Juno fist>>
<<shot on Juno>>
She takes the bread knife off the board and cuts the knot off her wrist. It drops in the crumbs, and she leaves it there.
<<sfx swing>>
<<set $CAL_JUNO to "betrayed">>
<<set $JUNO_KNOT to 0>>
<<pose Juno none>>
<<shot on Bas>>
Bas: He broke my arm.
<<shot on Bas>>
Bas: In the vault. I heard it go. And for months I kept telling myself it wasn't him. The knight was taller. Moved wrong. Hit wrong.
<<shot on Bas>>
Bas: I kept telling myself.
<<shot on Tamsin>>
Tamsin: He said he liked us.
<<shot on Tamsin>>
Tamsin: On the bridge. He said it. You all heard him say it.
<<shot two Tamsin Juno>>
Tamsin: That has to count for something. Doesn't it? If he said it, and then he went anyway?
<<shot on Juno>>
Juno: It counts for exactly what he wanted it to.
<<shot on Lio>>
Lio hasn't said anything. He's turned one of the notebooks on its side, and he's reading the margins.
<<shot on Dagrun>>
Dagrun hasn't said a word since the bridge. He doesn't now.
<<shot on Rook>>
There's one thing nobody at this table has said out loud.
-> "If he was alive this whole time... why didn't he come back?"
    <<set $ROOK_ASKED to "why">>
    <<shot on Rook>>
    Rook: If he was alive this whole time... why didn't he come back?
    <<shot on Juno>>
    Juno: Because he didn't want to, {name}.
    <<shot on Tamsin>>
    Tamsin: You don't know that.
    <<shot on Juno>>
    Juno: Nobody at this table knows anything. That's the point. That was always the point.
-> Say nothing.
    <<set $ROOK_ASKED to "nothing">>
    <<shot on Rook>>
    You don't say it. Nobody at this table could answer it, and everybody's thinking it anyway.
<<shot wide>>
Up in the lantern room, the light is still burning. Nobody's put it out.
===

title: Ep51_Notes
---
The Field Notes. A page for each of you, in a hand everyone at this table knows, and little stars drawn by every name but yours.
And in every margin, a line in a script nobody here can read.
They're in your Journal now.
<<set $FIELD_NOTES_READ to 1>>
===

title: Ep51_Lio
---
<<shot on Lio>>
Lio: These aren't doodles.
<<shot on Lio>>
Lio: Every margin. Every page. It's a script, the same one that was on his mask.
<<shot two Lio Rook>>
Lio: The Choir kept three pages of it, under lock, at the silent school. Nobody could read them. Novices weren't supposed to look.
<<shot on Lio>>
Lio: I looked.
<<shot on Lio>>
Lio: I can read a little. A very little. Give me time, and give me the hard ones.
<<shot on Lio>>
He hears himself say it, and stops. It's what's written under his own sketch: "Reads everything. Give him the hard ones."
<<set $LIO_SCRIPT to 1>>
===

title: Ep51_Dagrun
---
<<shot on Dagrun>>
Dagrun's on the step outside the door, where he's been all night. He looks at you. He doesn't say anything.
<<shot two Dagrun Rook>>
He moves over on the step, so there's room.
<<set $DAGRUN_STEP to 1>>
===

title: Ep51_Juno
---
<<shot on Juno>>
Juno: Don't. I know what you're going to say, and don't.
<<shot on Juno>>
She rubs the bare place on her wrist with her thumb, where the knot was.
===

title: Ep51_Bas
---
<<shot on Bas>>
Bas: Arm healed straight. I keep rubbing it anyway.
<<shot on Bas>>
Bas: Somebody splinted it, in the vault, before the Wardens found us. Good splint. I never asked who.
===

title: Ep51_Tamsin
---
<<shot on Tamsin>>
Tamsin: I keep trying to be angry. I get about halfway.
<<shot on Tamsin>>
Tamsin: He used to sing the harmony on the Lighthouse tune. Badly. On purpose, I think, so I'd fix it.
===

title: Ep51_Ward
---
<<set $BELL_NOTICE to 1>>
<<shot wide>>
Aurelin, the Crown's notice board on the gate road. The Sable Knight's poster is gone. Over the place where it was, a new notice: crimson, with a white bell stamped on it.
<<shot on BellWarden>>
BellWarden: By order of the Crimson Bell. Read it, or move along.
<<shot on Juno>>
Juno: "The squad known as the Last Lanterns is confined to its quarters, pending the Bell's inquiry into the conduct of its vice captain."
<<shot on Bas>>
Bas: Confined. We held the bridge.
<<shot on BellWarden>>
BellWarden: And your vice captain opened the Gate. Move along.
<<shot on Townswoman>>
Townswoman: That's them. The Lanterns. It was their vice captain. Their own.
<<shot on Townsman>>
Townsman: I stood him a drink once, at the Spoon. He was funny.
<<shot on Townswoman>>
Townswoman: They're all funny, till they're not.
<<set $REP_SQUAD to $REP_SQUAD - 15>>
<<set $BELL_INQUIRY to 1>>
===

title: Ep51_Grave
---
<<shot on Severin>>
The Valcourt crypt. Aurek's grave at the end of the rows, and on it a flower gone brown, where it was left the night Severin read the page.
<<shot on Severin>>
Severin: Six years. I knew that. Somewhere along the way I'd stopped knowing it.
<<shot on Severin>>
Severin: He let me believe the knight was my brother. He stood at this grave and he let me believe it.
<<shot on Severin>>
Severin picks the flower up. It's dry enough that it doesn't bend.
<<shot on Severin>>
Severin: You let me believe.
<<shot on Elodie>>
Elodie: He carried me out of the dark.
<<shot on Severin>>
Severin: Elodie. Don't.
<<shot on Elodie>>
Elodie: I'm not saying it to forgive him. I'm saying it because it happened. He carried me out, and he was gentle, and I won't pretend he wasn't.
<<shot two Severin Elodie>>
Severin's still holding the flower.
-> "Leave it. It was left for Aurek."
    <<set $SEVERIN_FLOWER to "kept">>
    <<shot on Rook>>
    Rook: Leave it. It was left for Aurek.
    <<shot on Severin>>
    He puts it back where it was. He doesn't look at it again.
-> Say nothing.
    <<set $SEVERIN_FLOWER to "taken">>
    <<shot on Severin>>
    He puts it inside his coat. He doesn't say why, and nobody asks.
===

title: Ep51_Bell
---
<<shot wide>>
Evening. Three figures in crimson on the road from the city, walking, not hurrying.
<<shot on Ulric>>
Ulric: Captain Holt.
<<shot on Dagrun>>
Dagrun looks at him. Nothing else.
<<shot on Ulric>>
Ulric: Ulric Graves, the Crimson Bell. You'll have read the notice. I'll say it anyway, so nobody can tell me afterwards they didn't hear it.
<<shot on Ulric>>
Ulric: Under this roof, a demon wore a man's face, and a Lantern's coat, and was trusted with the Crown's business. For years.
<<shot on Ulric>>
Ulric: The Bell will hear the Last Lanterns at the Bell Tower. Tomorrow, at the ninth bell. All of you.
<<move BellWarden -4 9.8 wait>>
<<shot on BellWarden>>
The warden beside him has walked to the door. She takes a strip of red paper from her satchel and presses it flat against the wood. It stays, as if it grew there.
<<sfx glint>>
<<set $BELL_SEAL to 1>>
<<shot on Ulric>>
Ulric: A courtesy seal. It tells me if anyone leaves in the night. Nobody's stopping you. I'd simply know.
<<shot on Ulric>>
Ulric: And his effects. Anything he left. The Bell will want them.
<<shot on Juno>>
Juno's holding the notebooks against her chest. She doesn't move.
<<shot on Lio>>
Lio: I copied the margins last night. All of them. Whatever you decide.
<<shot on Rook>>
They're addressed to you.
-> Hand them over.
    <<set $NOTES_GIVEN to 1>>
    <<set $REP_SQUAD to $REP_SQUAD + 5>>
    <<shot on Ulric>>
    Juno lets you take them. Captain Graves weighs them in his hand, as if he's guessing what's inside.
    <<shot on Ulric>>
    Ulric: Thank you. That's the first sensible thing anyone's done since the bridge.
-> "They're addressed to me."
    <<set $NOTES_GIVEN to 0>>
    <<set $BELL_SUSPICION to $BELL_SUSPICION + 1>>
    <<shot on Rook>>
    Rook: They're addressed to me.
    <<shot on Ulric>>
    Ulric: Then you'll answer for what's in them. Ninth bell, Lantern.
<<shot wide>>
They go back the way they came. On the door, the seal glows faintly red, all night.
<<set $EP51_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, AU = { stage: "aurelin" };
const MORNING = { sky: { daylight: 0.5 } }, DUSK = { sky: { daylight: 0.22 } };
// The long table (data/zones.js: the low box at x 4.1–5.9, z 3.4–8.6); the step under the keeper's-house door.
const STEP = { x: -4.0, z: 9.7 };
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "dagrun", look: "dagrun", x: 5.0, z: 9.6, yaw: Math.PI },
];

export const EPISODE_51 = {
  id: "ep51",
  number: 51,
  unlockAt: 5,
  setup: { ...AFTER_EP50 },
  title: "The Light Left On",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "dawn", type: "cutscene", cutscene: "ep51_dawn" },
    { id: "title", type: "title" },
    { id: "table", type: "scene", node: "Ep51_Table", ...LH, ...MORNING,
      rook: { x: 5.0, z: 2.5, yaw: 0 }, cast: atTable },
    { id: "morning", type: "explore", ...LH, ...MORNING,
      rook: { x: 5.0, z: 2.0, yaw: Math.PI },
      objective: "The morning after. The Field Notes, Lio, and Dagrun on the step ({n}/{total}).",
      required: ["notes", "lio", "dagrun"], counts: "required",
      cast: [
        { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit", node: "Ep51_Lio" },
        { id: "dagrun", look: "dagrun", x: STEP.x, z: STEP.z, yaw: Math.PI, pose: "sit", node: "Ep51_Dagrun" },
        { id: "juno", look: "juno", x: 3.2, z: 4.4, yaw: -1.4, node: "Ep51_Juno" },
        { id: "bas", look: "bas", x: -5.6, z: -2.6, yaw: 0.6, node: "Ep51_Bas" },
        { id: "tamsin", look: "tamsin", x: 2.6, z: 9.9, yaw: 0, node: "Ep51_Tamsin" },
      ],
      pickups: [{ id: "notes", x: 4.0, z: 6.2, node: "Ep51_Notes", label: "The Field Notes" }] },
    { id: "ward", type: "scene", node: "Ep51_Ward", ...AU,
      rook: { x: -6.2, z: -18.6, yaw: 0 },
      cast: [
        { id: "juno", look: "juno", x: -7.7, z: -18.9, yaw: 0.3 },
        { id: "bas", look: "bas", x: -4.7, z: -19.0, yaw: -0.3 },
        { id: "bellWarden", look: "bellWarden", x: -4.4, z: -16.9, yaw: -2.4 },
        { id: "townswoman", look: "townswoman", x: -9.6, z: -17.4, yaw: 1.3 },
        { id: "townsman", look: "townsman", x: -10.2, z: -18.8, yaw: 1.1 },
      ] },
    { id: "grave", type: "scene", node: "Ep51_Grave", stage: "crypt",
      rook: { x: 1.4, z: 2.6, yaw: -0.3 },
      cast: [
        { id: "severin", look: "severin", x: -0.2, z: 3.6, yaw: 0.1 },
        { id: "elodie", look: "elodie", x: -1.6, z: 2.6, yaw: 0.5 },
      ] },
    { id: "bell", type: "scene", node: "Ep51_Bell", ...LH, ...DUSK,
      rook: { x: -0.9, z: 4.6, yaw: Math.PI },
      cast: [
        { id: "ulric", look: "ulric", x: 0, z: 2.4, yaw: 0 },
        { id: "bellWarden", look: "bellWarden", x: -1.6, z: 1.8, yaw: 0.2 },
        { id: "warden2", look: "bellWarden", x: 1.6, z: 1.8, yaw: -0.2 },
        { id: "dagrun", look: "dagrun", x: 0.4, z: 6.2, yaw: Math.PI },
        { id: "juno", look: "juno", x: -1.9, z: 6.4, yaw: 2.9 },
        { id: "lio", look: "lio", x: 2.1, z: 6.6, yaw: -2.9 },
        { id: "bas", look: "bas", x: -3.7, z: 4.8, yaw: 2.4 },
        { id: "tamsin", look: "tamsin", x: 3.4, z: 5.8, yaw: -2.6 },
      ],
      set: { EP51_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep52",
      lines: [
        "Next time on UNWRITTEN:",
        "The ninth bell. The Bell Tower, the seal ring, and the Silencing.",
        "And somebody finally says something.",
      ] },
  ],
};
