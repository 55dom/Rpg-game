// Episode 55 · A Boy With No Grimoire (GDD §14 Arc 6 "Hesper captured"; Backlash Ch 8; Phase 7 Step 3, §23.6).
//
// Under the Lowmarket, somebody is knocking on the door to the Hollow, from the inside. The Bell's seals on it have been
// touched. Captain Graves wants Hesper Voss, and the Bell's paper is no use where nothing stays written: the Lanterns
// have walked the Hollow before. Into the white: her hymnal, torn out page by page and left behind her like breadcrumbs,
// the Hollow's empty armour, and at the foot of the pillar where Elodie was held, Hesper, weeks lost in it, forgetting.
// She comes out without a fight left in her.
//
// In the Bell Tower's seal ring: "A boy with no grimoire taught me about the Hollow." A boy at the silent school's back
// gate, who didn't speak the language yet, who opened a door in the air to show her the garden from the other side, and
// said grimoires were chains. He didn't have a name yet. She built a church on it. That night Lio reads his own margin:
// "Hello, Lio. Slower on the third line."

import { AFTER_EP54 } from "./arcs.js";
import { ZONES, BELLTOWER_LAYOUT as BTL } from "../data/zones.js";

export const EP55_SCRIPT = `
title: Ep55_Summons
---
<<shot on Ulric>>
Ulric: The seals on the door under the Lowmarket. Somebody's been touching them. From the other side.
<<shot on Ulric>>
Ulric: Your soldier heard it first, if you've kept him. He says it isn't the drum. It's softer. Like a hand.
<<shot on Ulric>>
Ulric: Hesper Voss went through that lock on the Founding, and the Gate shut, and she didn't come back out of it. I think she's found the Hollow's back stairs. I think she's knocking.
<<shot on Juno>>
Juno: Then open the door and grab her.
<<shot on Ulric>>
Ulric: My seals are paper, and paper is writing, and in the Hollow writing doesn't stay put. My wardens are written all over. So am I.
<<shot on Ulric>>
Ulric: You lot have walked in and out of it. And the Lantern's book came back from my seals with nothing on it at all.
<<shot on Ulric>>
Ulric: Bring her out. Alive, if you can. The Bell remembers who brings it what it asked for.
-> "Alive."
    <<set $HESPER_ORDER to "alive">>
    <<shot on Rook>>
    Rook: Alive. Whatever she did.
    <<shot on Ulric>>
    Ulric: Whatever she did. I'll hold you to the first word and not the second.
-> "What happens to her after?"
    <<set $HESPER_ORDER to "after">>
    <<shot on Rook>>
    Rook: And after? What does the Bell do with her?
    <<shot on Ulric>>
    Ulric: Asks her questions until there aren't any left. Then the Crown decides. Better us than the Crown first.
===

title: Ep55_Page
---
<<shot on Rook>>
A page torn out of a hymnal, lying in the white as if somebody had set it down to mark the way. The hymn's been crossed out. Underneath, in a hand that's getting worse:
<<shot on Rook>>
"Day eleven. There's no door out from in here, not for anyone with writing on them. I keep walking anyway."
===

title: Ep55_Page2
---
<<shot on Rook>>
Another page. The ink's paler, as if the Hollow has been reading it.
<<shot on Rook>>
"I've forgotten my mother's name. I had it this morning. I wrote it down so I'd keep it, and now I can't read what I wrote."
===

title: Ep55_Page3
---
<<shot on Rook>>
The last page has only one line on it, pressed so hard the nib went through.
<<shot on Rook>>
"He told me it was freedom in here. He told me nobody had written anything. He didn't say that meant me."
===

title: Ep55_Hesper
---
<<shot wide>>
At the foot of the pillar where Elodie was held, Hesper Voss sits with her back to the light. The black has gone up past her elbow. She doesn't get up.
<<shot on Hesper>>
Hesper: The Lanterns. Of course. Nobody else would come in here on purpose.
<<shot on Hesper>>
Hesper: I won't fight you. I couldn't, and I've lost the reason I'd have given. It was here a week ago.
<<shot on Juno>>
Juno: You took Elodie. Twice.
<<shot on Hesper>>
Hesper: Yes. I remember that part. Isn't it funny, what stays?
-> Offer her a hand up.
    <<set $HESPER_HAND to 1>>
    <<shot wide>>
    You hold out a hand. She looks at it a long time, as if trying to remember what it's for. Then she takes it.
    <<shot on Hesper>>
    Hesper: You really are his, aren't you. He'd have done that. And then he'd have laughed.
-> "Get up. We're leaving."
    <<set $HESPER_HAND to 0>>
    <<shot on Rook>>
    Rook: Get up. We're leaving.
    <<shot on Hesper>>
    She gets up on her own, slowly, one hand on the light.
    <<shot on Hesper>>
    Hesper: Yes. Good. Don't be kind to me. I'd only think about it.
<<set $HESPER_CAPTURED to 1>>
===

title: Ep55_Cell
---
<<cue seals>>
<<shot wide>>
The Bell Tower. Hesper sits in the seal ring, where the accused sit, the talismans on every wall stirring as if there's a draught. There isn't.
<<shot on Ulric>>
Ulric: Fifteen years of hymns. A church under the city. The Hollow Bloom. The lock on the Founding. You didn't think all that up in a corridor, Voss.
<<shot on Hesper>>
Hesper: No. I did think it up in a corridor. That's the part nobody will believe.
<<shot on Hesper>>
Hesper: A boy with no grimoire taught me about the Hollow.
<<shot on Rook>>
Nobody moves.
<<shot on Hesper>>
Hesper: I was a novice at the silent school, and bitter, because the Tower gave me a book that didn't say anything that mattered. There was a boy at the back gate. Younger than me. He didn't speak properly yet. He had no grimoire at all.
<<shot on Hesper>>
Hesper: He opened a door in the air, without a word, and showed me the garden from the other side of the wall. Just to watch my face, I think.
<<shot on Hesper>>
Hesper: He said grimoires were chains. He said there was a space between the pages where nobody had written anything. He said it like he'd been there.
<<shot on Ulric>>
Ulric: His name.
<<shot on Hesper>>
Hesper: He didn't have one. Not yet. He hadn't picked one.
<<shot on Hesper>>
Hesper: I built a church on a thing a boy said to me through a gate, Captain. Fifteen years. And the boy grew up and ate dinner with you every night, Lantern. Didn't he?
-> "Yes."
    <<set $HESPER_ASKED to "yes">>
    <<shot on Rook>>
    Rook: Yes.
    <<shot on Hesper>>
    Hesper: Then we were both his. You just got the kinder half.
-> Say nothing.
    <<set $HESPER_ASKED to "silent">>
    <<shot on Rook>>
    You don't answer. You don't have to.
    <<shot on Hesper>>
    Hesper: Don't look like that. At least you liked him. I only believed him.
<<set $HESPER_BOY to 1>>
<<shot on Ulric>>
Ulric: Wardens. She stays in the ring tonight. She stays in the Tower until the Crown says otherwise.
<<shot on Ulric>>
Ulric: Lantern. You went into the white and came out with what I asked for. The Bell remembers. It's not the rolls, but it's not nothing.
<<set $BELL_TRUST to $BELL_TRUST + 1>>
<<set $REP_SQUAD to $REP_SQUAD + 10>>
===

title: Ep55_Margin
---
<<shot wide>>
That night. Lio's at the table long after the others have gone up. When you come down for water, he's laughing, very quietly, at a page.
<<shot on Lio>>
Lio: It's mine. My margin. I've had it for a week and I couldn't make it come out, because I kept reading it as something important.
<<shot on Lio>>
Lio: "Hello, Lio. Slower on the third line."
<<set $MARGIN_LIO to 1>>
<<shot on Lio>>
Lio: The third line was Bas's. I rushed it. I had a word wrong, the first time. He knew I'd be the one reading. He knew I'd rush that one.
<<shot on Lio>>
Lio: He left me a note in a language only I'd bother to learn. That's either the kindest thing anyone's done for me, or the cruellest. I can't tell which.
-> "Both."
    <<set $LIO_MARGIN to "both">>
    <<shot on Rook>>
    Rook: Both. That's how he did everything.
    <<shot on Lio>>
    Lio: ...Yeah. It is.
-> "Kindest."
    <<set $LIO_MARGIN to "kind">>
    <<shot on Rook>>
    Rook: Kindest. He said hello.
    <<shot on Lio>>
    Lio: He did. Nobody says hello in a margin.
<<set $EP55_DONE to 1>>
===
`;

const BT = { stage: "belltower" }, LH = { stage: "lighthouse" }, HW = { stage: "hollow" }, NIGHT = { sky: { daylight: 0.06 } };
const R = BTL.ring, J = BTL.judge;
const bench = [
  { id: "ulric", look: "ulric", x: J.x, z: J.z, yaw: Math.PI },
  { id: "bellWarden", look: "bellWarden", x: -2.6, z: J.z + 0.3, yaw: Math.PI },
  { id: "warden2", look: "bellWarden", x: 2.6, z: J.z + 0.3, yaw: Math.PI },
];

export const EPISODE_55 = {
  id: "ep55",
  number: 55,
  unlockAt: 5,
  setup: { ...AFTER_EP54 },
  title: "A Boy With No Grimoire",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "knock", type: "cutscene", cutscene: "ep55_knock" },
    { id: "title", type: "title" },
    { id: "summons", type: "scene", node: "Ep55_Summons", ...BT,
      rook: { x: R.x, z: R.z + 1.0, yaw: 0 },
      cast: [
        ...bench,
        { id: "juno", look: "juno", x: -1.8, z: R.z, yaw: 0.3 },
        { id: "bas", look: "bas", x: 1.8, z: R.z, yaw: -0.3 },
      ] },
    // The white: three pages of her hymnal, left behind her like breadcrumbs.
    { id: "white", type: "explore", ...HW,
      rook: { x: 0, z: -21, yaw: 0 },
      objective: "Into the Hollow after Hesper Voss. Follow the torn pages ({n}/{total}).",
      required: ["page1", "page2", "page3"], counts: "required",
      cast: [],
      pickups: [
        { id: "page1", x: -3, z: -9, node: "Ep55_Page", label: "A torn page" },
        { id: "page2", x: 5, z: -2, node: "Ep55_Page2", label: "A torn page" },
        { id: "page3", x: -3.5, z: 6.5, node: "Ep55_Page3", label: "A torn page" },
      ] },
    { id: "shells", type: "fight", ...HW, wave: ["shell", "shell", "shell", "shell"], tokens: 2,
      world: { bounds: ZONES.hollow.bounds, origin: { x: 0, z: 8 } },
      tutorial: [{ at: 0.5, text: "The Hollow's empty armour, standing up out of the white. Nothing is inside them: keep moving." }],
      lines: [["Bas", "These again. I hate these."], ["Juno", "She's by the pillar. I can see the light."]],
      retry: "Up. She's right there." },
    { id: "found", type: "scene", node: "Ep55_Hesper", ...HW,
      rook: { x: 0.9, z: 10.6, yaw: -0.5 },
      cast: [
        { id: "hesper", look: "hesper", x: -1.4, z: 13.2, yaw: Math.PI - 0.5, pose: "sit" },
        { id: "juno", look: "juno", x: -3.6, z: 10.4, yaw: 0.6 },
        { id: "bas", look: "bas", x: 2.9, z: 9.8, yaw: -0.7 },
      ] },
    { id: "cell", type: "scene", node: "Ep55_Cell", ...BT,
      rook: { x: -1.4, z: R.z - 2.6, yaw: 0.4 },
      cast: [
        ...bench,
        { id: "hesper", look: "hesper", x: R.x, z: R.z, yaw: 0, pose: "sit" },
        { id: "juno", look: "juno", x: 1.6, z: R.z - 3.0, yaw: -0.4 },
      ] },
    { id: "margin", type: "scene", node: "Ep55_Margin", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [{ id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" }],
      set: { EP55_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep56",
      lines: [
        "Next time on UNWRITTEN:",
        "The Tower of Choosing, and the old man who's swept its steps for longer than anyone can remember.",
        "\"Some books are better read twice.\"",
      ] },
  ],
};
