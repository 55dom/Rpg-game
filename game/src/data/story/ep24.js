// Episode 24 · Sable (GDD §14 Arc 3, §15.7 Encounter I). Ashfall's last war engine, the Cindermaw, rolls for
// the wall. The Lanterns break its escort but nothing on the field can stop the engine itself. As it's about
// to roll over them, a black tear opens under it, it drops through, and it falls out of the sky onto the
// Ashfall camp (bridge clue B1). On the east ridge, a masked figure with a long glaive turns and walks away.
// Who the hell is that? The camp has theories, and the Journal starts collecting them (data/rumors.js).

import { AFTER_EP23 } from "./arc3.js";

export const EP24_SCRIPT = `
title: Ep24_Dawn
---
<<shot wide front>>
Dawn at Ironhold, a week after the vigil. Bas stands at the gate where Brannoc used to stand. The Wardens have started calling him "sir." He hasn't stopped flinching.
<<shot on Scout>>
Scout: Sir. Bas. Sir. They're coming: what's left of Varka's legion, and something behind them.
Scout: A war engine. Bigger than the Ironsong, with a ram on the front cast like a jaw. The men are calling it the Cindermaw.
<<shot on Dagrun>>
Dagrun: Ashfall's last throw. If that reaches the wall, the wall moves.
<<shot on Bas>>
Bas: The wall doesn't move.
<<shot two Dagrun Rook>>
Dagrun: Then we meet the escort in the field and break it before the engine gets here. Nothing we've got will stop the engine itself. We'll think of something.
-> "We always think of something." #bold
    Dagrun: We do. It's usually something stupid. It usually works.
-> "And if we don't?" #earnest
    Dagrun: Then we stand in front of it anyway, and find out how brave we are.
<<shot on Juno>>
Juno: Every Warden's still wearing their knot. Just so you know. Nobody's taken one off.
===

title: Ep24_Engine
---
<<cue enginePark>>
<<shot wide>>
The escort breaks and runs. The Cindermaw doesn't. It comes on up the field at a walking pace, embers burning in its iron jaw.
<<shot on Lio>>
Lio: Wind won't move it. Nothing will move it. It's built to be too heavy to move.
<<shot on Bas>>
Bas plants his feet in front of the squad, between the jaw and everyone else.
Bas: The wall doesn't move.
<<shot two Bas Rook>>
-> Stand beside him. #bold
    You step up next to him. Neither of you looks at the other.
-> "Bas, get out of its way!" #earnest
    Bas: No. He wouldn't have. I won't.
<<shot wide>>
The ground starts to shake.
===

title: Ep24_Ridge
---
<<shot wide>>
Silence. Where the Cindermaw was, there's a long strip of flattened grass and nothing else. Out over the Ashfall camp, a column of smoke is going up.
<<shot on Tamsin>>
Tamsin: It went down. Through the ground. And then it came down. Out of the sky. On them. ...Did everyone see that, or have I finally gone mad?
<<shot on Juno>>
Juno: We saw it. ...And we saw him.
<<shot on Dagrun>>
Dagrun: A mask. A long glaive. A cut in the ground like a wound. Whoever he is, he's not Ashfall's.
<<shot on Lio>>
Lio: That wasn't the Choir. Their tears are pale. That one was black.
<<shot two Bas Rook>>
Bas: He saved the wall. He didn't stay to be thanked.
-> "Whose side is he on?" #earnest
    Dagrun: Not Ashfall's. Past that, I don't know. And I don't like not knowing.
-> "He was watching us." #wry
    Juno: Then he's seen us now. Let's see what he does about it.
-> "Who the hell was that?" #bold
    Nobody answers. Out on the ridge, there's nobody left to ask.
===

title: Ep24_WardenRumor
---
Warden: Tore the ground open, didn't he? Like that Choir creature at the vigil. Same trick, different color.
Warden: I'd bet a month's pay he learned it in the same place. A deserter from the Choir's school, settling his score with them some other way.
<<set $RUMOR_DEFECTOR to 1>>
===

title: Ep24_ScoutRumor
---
Scout: My cousin fought at Coldwater. She says Varka had a champion in black there, a man who wouldn't take her orders. One night he walked out of the camp and nobody saw him again.
Scout: What if he's back? An Ashfall hero, finishing his own side's war his own way.
<<set $RUMOR_ASHFALL to 1>>
===

title: Ep24_TamsinRumor
---
Tamsin: You saw how he moved. Nothing alive cuts a hole in the world. And the Hollowmarch is full of old armor with nobody inside it.
Tamsin: What if something out there climbed into a suit? A Hollow thing, wearing a man's armor. ...I'm writing that down. It's a good line. It's also terrifying.
<<set $RUMOR_HOLLOW to 1>>
===

title: Ep24_DagrunRumor
---
Dagrun: There's an old story in the Sigil Knights. The Paragon keeps one knight off the rolls: no squad, no lantern, no name. For the work nobody else is allowed to do.
Dagrun: I never believed it. I'm less sure this morning.
<<set $RUMOR_PARAGON to 1>>
===

title: Ep24_BasCamp
---
Bas: The wall didn't move. I didn't move. And it still wasn't us that stopped it.
Bas: I don't know how to feel about that. I'll stand here till I do.
===

title: Ep24_JunoCamp
---
Juno: Everyone's got a theory. I've got a basket of cord and a very bad feeling.
Juno: Whoever he is, he's not getting a knot. Not till he comes down off that ridge and says something.
===

title: Ep24_LioCamp
---
Lio: Black, not pale. I keep saying it because nobody's listening. The Choir's tears are pale. That one wasn't theirs.
Lio: ...Or it's a kind of theirs I've never seen. Which would be worse.
===

title: Ep24_Night
---
<<shot wide front>>
That night the camp talks about nothing else. Around every brazier there's a different answer.
<<shot two Dagrun Rook>>
Dagrun: Write it down, {name}. Every story they tell. Most of them will be wrong.
Dagrun: But one of them won't be, and I want to know which one before he decides what he wants with us.
===
`;

const IH = { stage: "ironhold" };
// Where the squad stands to meet the engine (the cutscene stages them the same way).
const LINE = [
  { id: "bas", look: "bas", x: 0.4, z: 3, yaw: 0 },
  { id: "dagrun", look: "dagrun", x: -1.8, z: 0.6, yaw: 0.1 },
  { id: "juno", look: "juno", x: 1.8, z: 0.4, yaw: -0.1 },
  { id: "tamsin", look: "tamsin", x: -3, z: -0.6, yaw: 0.15 },
  { id: "lio", look: "lio", x: 3, z: -0.8, yaw: -0.15 },
];

export const EPISODE_24 = {
  id: "ep24",
  number: 24,
  unlockAt: 5,
  setup: { ...AFTER_EP23 },
  title: "Sable",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "title", type: "title" },
    { id: "dawn", type: "scene", node: "Ep24_Dawn", ...IH,
      rook: { x: 1, z: -16.6, yaw: -2.6 },
      cast: [
        { id: "bas", look: "bas", x: 0, z: -19, yaw: 0 },
        { id: "scout", look: "guard", x: -1.6, z: -15.4, yaw: Math.PI },
        { id: "dagrun", look: "dagrun", x: 1.8, z: -17.8, yaw: -0.6 },
        { id: "juno", look: "juno", x: -2.4, z: -17.8, yaw: 0.5 },
        { id: "tamsin", look: "tamsin", x: -3.4, z: -18.8, yaw: 0.6 },
        { id: "lio", look: "lio", x: 2.8, z: -18.8, yaw: -0.6 },
      ] },
    { id: "escort", type: "fight", ...IH, wave: ["ashLegion", "ashMage", "ashLegion", "ashMage", "ashLegion"], tokens: 2,
      tutorial: [{ at: 0.5, text: "Break the Cindermaw's escort before the engine reaches the field." }],
      lines: [["Bas", "Wardens, with me!"], ["Juno", "Break them before that thing gets here!"]],
      retry: "Up. The engine's still coming." },
    { id: "engine", type: "scene", node: "Ep24_Engine", ...IH,
      rook: { x: 0, z: 1, yaw: 0 }, cast: LINE },
    { id: "tear", type: "cutscene", cutscene: "ep24_tear",
      set: { CLUE_B1: 1, SABLE_ENCOUNTER: 1, CINDERMAW_DOWN: 1 } },
    { id: "ridge", type: "scene", node: "Ep24_Ridge", ...IH,
      rook: { x: 0, z: 1, yaw: 0.6 },
      cast: [
        { id: "bas", look: "bas", x: 0.4, z: 3, yaw: 1.2 },
        { id: "dagrun", look: "dagrun", x: -1.8, z: 0.6, yaw: 1.0 },
        { id: "juno", look: "juno", x: 1.8, z: 0.4, yaw: 1.1 },
        { id: "tamsin", look: "tamsin", x: -3, z: -0.6, yaw: 0.4 },
        { id: "lio", look: "lio", x: 3, z: -0.8, yaw: 1.3 },
      ] },
    { id: "camp", type: "explore", ...IH,
      rook: { x: 0, z: -6, yaw: Math.PI },
      objective: "The whole camp is talking about the masked knight. Hear what they think ({n}/{total}). Your Journal keeps every rumor.",
      required: ["warden", "scout", "tamsin", "dagrun"], counts: "required",
      cast: [
        { id: "warden", look: "guard", x: 4.2, z: -14, yaw: -0.8, node: "Ep24_WardenRumor" },
        { id: "scout", look: "guard", x: -3.2, z: -12, yaw: 0.9, node: "Ep24_ScoutRumor" },
        { id: "tamsin", look: "tamsin", x: -6, z: -8.6, yaw: 0.6, node: "Ep24_TamsinRumor" },
        { id: "dagrun", look: "dagrun", x: 2.2, z: -9.2, yaw: -0.4, node: "Ep24_DagrunRumor" },
        { id: "bas", look: "bas", x: 0.5, z: -17.4, yaw: 0, node: "Ep24_BasCamp" },
        { id: "juno", look: "juno", x: 6.2, z: -10, yaw: -1.2, node: "Ep24_JunoCamp" },
        { id: "lio", look: "lio", x: -1.2, z: -3.4, yaw: 1.5, node: "Ep24_LioCamp" },
      ] },
    { id: "night", type: "scene", node: "Ep24_Night", ...IH,
      rook: { x: -3.8, z: -31.6, yaw: -Math.PI / 2 }, // either side of a brazier in the camp, so the wide shot looks between them
      cast: [{ id: "dagrun", look: "dagrun", x: -5.8, z: -31.6, yaw: Math.PI / 2 }],
      set: { EP24_DONE: 1 } },
    { id: "preview", type: "preview", next: "Episode 25 · What Lio Knew",
      lines: [
        "Next time on UNWRITTEN:",
        "Lio has kept a secret since the day he joined the Lanterns.",
        "Tonight, the squad finds out what it is.",
      ] },
  ],
};
