// Episode 54 · The Crown Against Aldric Valcourt (GDD §14 Arc 6 "Aldric's trial"; §15.9; Phase 7 Step 2, §23.6).
//
// The Crown's court sits in the Grand Archive's reading hall, where the coup failed, and the Bell presides: any case
// that touches forbidden magic is the Bell's, and this one touches it everywhere. Halvard testifies (fire is quickest).
// Severin testifies against his father. Elodie speaks. Rook is asked what the Chancellor did, and answers. And Ulric
// asks what nobody has: the Writ lay hidden for two hundred years, so who told him where to look? "Someone always tells
// you where to look, Captain. Hesper told me. And someone told Hesper. I never cared who." (It lands in Arc 7.)
//
// The finding: stripped of title and office; Ironhold, for as long as the Crown keeps it. On the way out, the Lances
// who never went back to barracks come for him, and he won't go with them: a Valcourt walks to his own cell. Severin
// gives him the flower from Aurek's grave. That night Lio reads the third margin, under Bas's page: "Never let him
// carry it alone. He'll try."

import { AFTER_EP53 } from "./arcs.js";
import { ZONES } from "../data/zones.js";

export const EP54_SCRIPT = `
title: Ep54_Before
---
<<shot wide>>
The Archive's doors are open for the first time since the Founding. Severin waits just inside them, in his house's colours, as if he'd been told to wear them and is wearing them anyway.
<<shot on Severin>>
Severin: I'm testifying. Against him.
<<shot on Elodie>>
Elodie: He's still our father, Sev.
<<shot on Severin>>
Severin: That's what makes it a trial. If he were anybody else, it'd just be a sentence.
-> "I'll be right behind you."
    <<set $SEVERIN_TRIAL to "behind">>
    <<shot on Rook>>
    Rook: I'll be right behind you. The whole time.
    <<shot on Severin>>
    Severin: Don't be behind me. Be where I can see you. ...Please.
-> "You don't have to."
    <<set $SEVERIN_TRIAL to "out">>
    <<shot on Rook>>
    Rook: You don't have to do this. Graves has enough without you.
    <<shot on Severin>>
    Severin: I know. That's why it has to be me. Otherwise it's just the Crown being right about him.
===

title: Ep54_Trial
---
<<shot on Ulric>>
Ulric: The Crown against Aldric Valcourt, High Chancellor. The Bell sits for the Crown in any case touching forbidden magic. This one touches it everywhere.
<<shot on Ulric>>
Ulric: Fifteen years of gold to the Pale Choir. The Regency Act, written before there was a regent to need. Lances on the Archive steps on the Founding. A door opened that he had no way to close.
<<shot on Aldric>>
Aldric: You read well, Captain. You'll forgive me if I don't stand any straighter for it.
<<shot on Ulric>>
Ulric: Lance-Commander Halvard.
<<shot on Halvard>>
Halvard: On the Founding, in the Archive, my lord gave an order to burn the stacks with the Lanterns in them. "Fire is quickest," he said. I said no. I'd say it again.
<<shot on Aldric>>
Aldric: And I'd give the order again. That's the difference between us, Halvard. I always know what I'd do.
<<shot on Ulric>>
Ulric: Severin Valcourt.
<<shot on Severin>>
Severin: He told me the Crown had kept a page unread for a hundred years, and that it was mine if I wanted it. I wanted it. It ate me alive on Mirrorlake.
<<shot on Severin>>
Severin: He knew what it would do. He gave it to me anyway, because a son who could read it was worth more to him than a son.
<<shot on Aldric>>
Aldric looks at his son for the first time since the court sat. Whatever's in his face, he puts it away again.
<<shot on Ulric>>
Ulric: Elodie Valcourt.
<<shot on Elodie>>
Elodie: I don't have anything to say against him.
<<shot on Elodie>>
Elodie: I was born without a book, and he never knew what to write on me, so he wrote nothing. He just kept me in the house. Like a page you mean to fill in later.
<<shot on Elodie>>
Elodie: That's not a crime. I wanted somebody to say it out loud, that's all.
<<shot on Ulric>>
Ulric: And the Lantern. You were there on the steps, and in the garden, and at the lock. What did the Chancellor do?
-> "He let us go home, once."
    <<set $ALDRIC_TESTIMONY to "mercy">>
    <<shot on Rook>>
    Rook: In the garden, the night we broke into his house, he let us go home. He didn't have to.
    <<shot on Aldric>>
    Aldric: I let you go home to the winner, Lantern. I thought it would be me.
-> "He opened the door. People died on the bridge."
    <<set $ALDRIC_TESTIMONY to "truth">>
    <<shot on Rook>>
    Rook: He opened the door. People died on the bridge. I held some of them.
    <<shot on Aldric>>
    Aldric: So did I, in my way. I signed for every one of them.
-> "Ask him who told him where to look."
    <<set $ALDRIC_TESTIMONY to "question">>
    <<set $BELL_TRUST to $BELL_TRUST + 1>>
    <<shot on Rook>>
    Rook: Ask him who told him where to look.
    <<shot on Ulric>>
    Ulric: I was coming to that. But I'm glad somebody else thought of it.
<<shot on Ulric>>
Ulric: The Writ lay hidden for two hundred years, Chancellor. In fifteen, you found it. Who told you where to look?
<<shot on Aldric>>
Aldric: Someone always tells you where to look, Captain. That's how it works, up where I lived.
<<shot on Aldric>>
Aldric: Hesper told me. And someone told Hesper.
<<shot on Aldric>>
Aldric: I never cared who. I thought I was the one holding the pen. That was my mistake. My only one, I'd have said, a month ago.
<<set $ALDRIC_HINT to 1>>
<<shot on Ulric>>
Ulric: Mm.
<<shot on Ulric>>
Ulric: The Bell's finding, for the Crown. Aldric Valcourt is stripped of title and office. He goes to Ironhold, and stays there for as long as the Crown keeps it.
<<set $ALDRIC_SENTENCE to "ironhold">>
<<shot on Aldric>>
Aldric: For as long as the Crown keeps it. You've a sense of humour, Captain. Nobody told me.
<<shot on Ulric>>
Ulric: Wardens. Take him out.
===

title: Ep54_Father
---
<<shot wide>>
The last of the Lances is on the floor. In the middle of the aisle, Aldric hasn't moved. His chains are still on. He could have walked out with them; nobody would have stopped him in time.
<<shot on Aldric>>
Aldric: They came for me. Fools. Loyal fools. I never understood loyalty. I paid for it, and it's never the same thing.
<<shot on Aldric>>
Aldric: A Valcourt walks to his own cell. Tell them that, Captain, when they write it down.
<<shot on Severin>>
Severin steps into the aisle in front of his father. He takes something out of his coat: a white flower, dried now, pressed flat.
<<shot on Severin>>
Severin: This was on Aurek's grave. The man who left it lied to all of us. I kept it anyway.
<<shot on Severin>>
Severin: It's still a flower. Even if he left it.
<<shot on Aldric>>
For a long moment Aldric only looks at it. Then he takes it, carefully, in hands that have signed a war.
<<set $SEVERIN_FLOWER to "given">>
<<shot on Aldric>>
Aldric: Your brother would have liked you, Severin. I don't think I ever told you that.
<<shot on Severin>>
Severin: No. You didn't.
<<shot on Elodie>>
Elodie: I write my own now. On my wrist. You can read it, if you want. On visiting days.
<<shot on Aldric>>
Aldric: ...I'd like that.
<<shot wide>>
The wardens take him out through the Archive doors, into the light. He doesn't look back. Severin watches until the doors close.
===

title: Ep54_Margin
---
<<shot wide>>
That night, at the Lighthouse. Bas has been pretending not to wait up for an hour.
<<shot on Lio>>
Lio: Bas. Yours.
<<shot on Bas>>
Bas: Go on, then.
<<shot on Lio>>
Lio: "Never let him carry it alone. He'll try."
<<set $MARGIN_BAS to 1>>
<<shot on Bas>>
Bas: ...Before or after he broke my arm?
<<shot on Lio>>
Lio: Before. The ink's older. Months older.
<<shot on Bas>>
Bas flexes the arm, slowly. It's healed. It still aches when it rains.
<<shot on Bas>>
Bas: He doesn't get to decide what I carry. Not any more.
-> "Then we carry it with you."
    <<set $BAS_RESOLVE to "together">>
    <<shot on Rook>>
    Rook: Then we carry it with you. Whatever it is.
    <<shot on Bas>>
    Bas: ...Fine. But I'm counting the steps.
-> "He was right, though."
    <<set $BAS_RESOLVE to "right">>
    <<shot on Rook>>
    Rook: He was right, though. You would try.
    <<shot on Bas>>
    Bas: Yeah. He was right about all of us. That's the worst part.
<<set $EP54_DONE to 1>>
===
`;

const AR = { stage: "archive" }, LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.06 } };
const court = [
  { id: "ulric", look: "ulric", x: 0, z: 5.6, yaw: Math.PI },
  { id: "bellWarden", look: "bellWarden", x: -2.2, z: 5.4, yaw: Math.PI },
  { id: "warden2", look: "bellWarden", x: 2.2, z: 5.4, yaw: Math.PI },
  { id: "aldric", look: "aldric", x: 0, z: 0.6, yaw: 0 },
];
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
];

export const EPISODE_54 = {
  id: "ep54",
  number: 54,
  unlockAt: 5,
  setup: { ...AFTER_EP53 },
  title: "The Crown Against Aldric Valcourt",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "court", type: "cutscene", cutscene: "ep54_court" },
    { id: "title", type: "title" },
    { id: "before", type: "scene", node: "Ep54_Before", ...AR,
      rook: { x: 1.0, z: -11.4, yaw: -0.4 },
      cast: [
        { id: "severin", look: "severin", x: 0, z: -9.8, yaw: Math.PI - 0.3 },
        { id: "elodie", look: "elodie", x: -1.2, z: -10.6, yaw: 1.4 },
      ] },
    { id: "trial", type: "scene", node: "Ep54_Trial", ...AR,
      rook: { x: 3.2, z: -0.4, yaw: -0.9 },
      cast: [
        ...court,
        { id: "halvard", look: "halvard", x: 3.6, z: 2.0, yaw: -1.3 },
        { id: "severin", look: "severin", x: -3.4, z: -0.4, yaw: 0.9 },
        { id: "elodie", look: "elodie", x: -3.9, z: 1.4, yaw: 1.3 },
        { id: "juno", look: "juno", x: 3.6, z: -4.6, yaw: -0.4 },
        { id: "bas", look: "bas", x: -3.6, z: -4.6, yaw: 0.4 },
      ] },
    // The Lances who never went back to barracks, come to take their Chancellor out of the Bell's hands.
    { id: "breakout", type: "fight", ...AR, wave: ["lance", "lance", "lance", "lance"], tokens: 2,
      world: { bounds: ZONES.archive.bounds },
      tutorial: [{ at: 0.5, text: "The Chancellor's last Lances, come to break him out. Shields up whenever they aren't attacking: wait for the thrust, or get round them." }],
      lines: [["Halvard", "Lances! Stand down! ...They won't. Then put them down."], ["Severin", "Not like this, Father. Not like this."]],
      retry: "Up. He's not leaving with them." },
    { id: "father", type: "scene", node: "Ep54_Father", ...AR,
      rook: { x: 1.3, z: -8.8, yaw: -0.2 },
      cast: [
        { id: "aldric", look: "aldric", x: 0, z: -5.4, yaw: Math.PI },
        { id: "bellWarden", look: "bellWarden", x: -1.3, z: -4.4, yaw: Math.PI },
        { id: "warden2", look: "bellWarden", x: 1.3, z: -4.4, yaw: Math.PI },
        { id: "severin", look: "severin", x: 0, z: -7.6, yaw: 0 },
        { id: "elodie", look: "elodie", x: -1.2, z: -8.4, yaw: 0.3 },
      ] },
    { id: "margin", type: "scene", node: "Ep54_Margin", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 }, cast: atTable,
      set: { EP54_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep55",
      lines: [
        "Next time on UNWRITTEN:",
        "The Bell finds Hesper Voss at the edge of the Hollow, and needs someone who can walk in after her.",
        "\"A boy with no grimoire taught me about the Hollow.\"",
      ] },
  ],
};
