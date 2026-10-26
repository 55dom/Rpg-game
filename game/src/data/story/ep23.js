// Episode 23 · Juno's Thread (GDD §14 Arc 3). Juno grieves with her hands: a knot for every Iron Warden
// at Brannoc's vigil. She knows Cal hid a notebook, and the squad helps her find it (Track A, clue A4:
// she only shares it with someone she trusts, bond rank 4; otherwise she keeps it until she does).
// At the vigil, the Choir's rift-walker Wraithe steps out of the air (GDD §15.6, red herring 2: from now
// on, cutting seams in the air is something the Pale Choir does).

import { AFTER_EP22 } from "./arc3.js";
import { IRONHOLD_LAYOUT } from "../zones.js";

/**
 * The notebook, read together (the episode, or later at the Lighthouse once Juno is ready to share it).
 * One text for both, so the two readings can never drift apart.
 */
export const NOTEBOOK_READ = `
<<shot two Juno Rook>>
The first page is a list. THINGS THAT COME BACK THROUGH A DOOR: draughts. Cats. Bad news. Bas.
A drawing of Dagrun asleep in his chair, very good, with a moustache added in different ink.
"{name} got up three times today. Called it. Dagrun owes me a fish."
A door frame, drawn carefully, its hinges on the far side. Under it: "A door I open, I can only close from the other side."
A recipe for fish stew with most of the steps crossed out. A cat that might be a dog. And, squeezed in under the cat:
"Question: what happens to a door-maker who stays on the wrong side of his own door?"
"Answer: depends which side is wrong."
<<shot on Juno>>
The last page with writing on it is a knot, drawn in ink. Three strands. Under it, four words: "Tell Juno it held."
Juno: Oh, you idiot. You absolute idiot.
Juno: He knew. Don't you see? He always knew he'd be the one left holding a door. He wrote it down so it wouldn't scare him.
-> "He wrote that page for you." #earnest
    Juno: He wrote the rest for himself. The last page was for me.
-> "He was always ten steps ahead of us." #wry
    Juno: And he never once waited for us to catch up.
<<shot two Juno Rook>>
She ties the cord back around it, the same knot, and puts it in your hands.
Juno: You keep it. If I keep it, I'll read it every night until the pages fall out.
<<set $CLUE_A4 to 1>>
<<set $HAS_CAL_NOTEBOOK to 1>>
<<set $JUNO_HAS_NOTEBOOK to 0>>
`;

export const EP23_SCRIPT = `
title: Ep23_Knots
---
<<shot wide>>
Morning at the Lighthouse. Juno is at the long table, and the long table is covered in red cord.
She hasn't been to bed. There are dozens of knots in front of her, and she's still tying.
<<shot two Juno Rook>>
Juno: Fifty-three. Brannoc had fifty-three Wardens. They hold his vigil tonight, and every one of them is getting a knot.
Juno: Anyone you'd go back for. That's the rule. I know I didn't know him long. I don't care.
-> "Can I help?" #earnest
    Juno: You'd tie them wrong. ...Sit there. That helps.
-> "Juno. You need to sleep." #wry
    Juno: I'll sleep when there are fifty-three. Then I'll sleep for a week.
<<shot on Juno>>
Juno: Dagrun boxed up Cal's room. Did you know? It's all in a crate under his bed. A coat, a saber, a cookbook with the pages stuck together.
Juno: That's not him. That's just his stuff.
Juno: He hid things. Snacks, mostly. Bas's left boot, once, for a week. And a notebook. He wrote in it at night, and when anyone came, it went... somewhere.
Juno: I never looked. I thought there'd be time to make fun of him for it.
<<shot two Juno Rook>>
Juno: I'm looking now. Ask around, would you? Somebody saw where he went at night. I'll finish these.
===

title: Ep23_JunoTying
---
Juno: Forty-nine. Keep asking. Somebody saw.
===

title: Ep23_Dagrun
---
Dagrun: At night? He'd stand at that window with the lamp out, looking at the sky. Like he was waiting for weather.
Dagrun: I asked him once what he was waiting for. He said, "Habit." I never found out whose.
-> "He wasn't sleeping either." #earnest
    Dagrun: None of us were, by the end. I should've noticed sooner.
-> "That sounds like him." #wry
    Dagrun: Mm. Everything sounds like him. That's the trouble.
===

title: Ep23_Dagrun_Again
---
Dagrun: Juno asked me for his crate. I said no. ...I'll say yes tomorrow. Give me a day.
===

title: Ep23_Bas
---
Bas: He used to bring me tea on night watch. Terrible tea. Bits in it. I never asked what the bits were.
Bas: He'd sit with me till I'd drunk it, then wander off round the back. Toward the tower.
Bas: I miss the bits.
===

title: Ep23_Bas_Again
---
Bas: The Wardens want me in front at the vigil tonight. I'm practicing standing in front.
===

title: Ep23_Tamsin
---
Tamsin: The tower! He'd sit at the foot of it, on the side that faces the Dry Sea, writing in the dark.
Tamsin: I asked him what he was doing out there. He said, "Counting." I said, "Counting what?" He said, "Everyone."
Tamsin: I thought it was a joke. It sounds less funny now. ...Tell Juno. The foot of the tower.
===

title: Ep23_Tamsin_Again
---
Tamsin: I'm writing a song for Brannoc. It has one verse and it's all about his eyebrows. He'd hate it. He'd love it.
===

title: Ep23_Lio
---
Lio: At night? No. I didn't... I wasn't watching anyone at night. I was asleep. Every night.
Lio: Sorry. I'm not much help today.
===

title: Ep23_JunoAtTower
---
Juno: Here. He sat here. You can see where his heels wore the ground down.
Juno: It's all stones, {name}. Help me look.
===

title: Ep23_Stone
---
At the foot of the tower, on the side that faces the Dry Sea, one stone sits a little proud of the others.
It comes out in your hand. Behind it, wrapped in oilcloth and tied with a red cord in a Quill knot: a notebook.
<<set $NOTEBOOK_FOUND to 1>>
===

title: Ep23_Notebook
---
<<shot two Juno Rook>>
Juno takes it in both hands. She looks at the knot for a long time before she unties it.
Juno: That's my knot. I tied that. He kept my knot on his secret notebook.
<<if $BOND_JUNO >= 75>>
    Juno: Read it with me. I can't do it on my own. I've been trying, in my head, all morning.
    <<jump Ep23_Read>>
<<endif>>
She opens it, reads the first page, and laughs: one short, broken laugh. Then she reads on in silence, and closes it.
Juno: No. I'm sorry. Not yet. I can't share him yet. Not even with you.
Juno: Someday. I'll know when.
<<set $JUNO_HAS_NOTEBOOK to 1>>
===

title: Ep23_Read
---
${NOTEBOOK_READ}
===

title: Ep23_Vigil
---
<<shot wide side>>
Dusk at Ironhold. The Iron Wardens stand in rows on the gate field, by the wall their captain held. Fifty-three of them, helmets under their arms.
His shield leans against a cairn of field stones. Someone has hung his grey cloak over it.
<<shot two Juno Bas>>
Juno goes down the rows with a basket, tying a red cord on every Warden's wrist. Nobody tells her to stop.
<<shot on Bas>>
Bas: He used to say a wall isn't stones. It's the people who decide not to move.
Bas: Fifty-three people decided. I'm going to try to be the fifty-fourth.
<<shot on Dagrun>>
Dagrun: Captain Brannoc Steelhart. Iron Wardens. Eighty years of wall, and thirty of them were his.
Dagrun: We don't say goodbye in the Sigil Knights. We say: the lantern's lit, and someone's watching it.
<<shot two Juno Rook>>
Juno: That's the last Warden. ...And one more, for the cairn.
-> Hold the cord while she ties it. #earnest
    You hold it. Her hands only shake a little.
-> "You made one for everyone." #wry
    Juno: Anyone you'd go back for. That's the rule. I didn't make the rule. ...I did, actually.
<<shot wide side>>
The wind drops. For a moment the whole field is quiet.
<<fx rift Wraithe>>
Then, above the cairn, the air splits. It makes no sound: a pale seam, ragged at the edges, like a cut in silk.
<<show Wraithe>>
<<shot on Wraithe>>
A figure steps out of it, wrapped in ash-pale cloth, hooded, a band of cloth bound over his mouth. Two blades, thin as needles.
He doesn't look at the Wardens. He looks at you.
<<shot on Dagrun>>
Dagrun: Wraithe. The Choir's rift-walker. Lanterns, on me!
===

title: Ep23_After
---
<<shot wide side>>
The last seam closes behind him like a mouth. His acolytes are gone with him. Where the tears were, the air smells faintly of snow.
The cairn is still standing. So are the Wardens.
<<shot on Dagrun>>
Dagrun: He came for you, {name}. Not the Wardens. Not the wall. He walked past fifty-three knights to get to you.
<<shot on Lio>>
Lio: Rift-walking. It's the Pale Choir's oldest school. They train for years to cut a seam in the air and step through it. No words: words would give them away.
<<shot on Dagrun>>
Dagrun: You know a lot about it.
<<shot on Lio>>
Lio: ...I read a lot, captain.
<<shot two Juno Rook>>
Juno is on her knees in the grass, picking up the red cords the fight scattered. One by one.
Juno: He had no right. Not here. Not tonight.
-> Kneel and help her. #earnest
    You pick them up together. She counts under her breath until the number is right again.
-> "We'll find him." #bold
    Juno: Good. And when we do, I'm tying him to something.
<<shot on Lio>>
Just before the last seam closed, Wraithe looked straight at Lio and touched two fingers to the cloth over his mouth.
Lio hasn't said a word since. Nobody else seems to have noticed.
<<set $WRAITHE_SEEN to 1>>
===
`;

const LH = { stage: "lighthouse" };
const IH = { stage: "ironhold" };
const TABLE = { x: 5, z: 6 };
const STONE = { x: -6.1, z: 7.2 }; // the loose stone at the foot of the tower (data/zones.js keeps it clear of the tower)
const CAIRN = IRONHOLD_LAYOUT.cairn; // Brannoc's cairn on the gate field, outside the fighting ring
// The Iron Wardens in two rows behind the squad, facing the cairn (the vigil, and still there after it).
const WARDENS = [
  ...[-4, -2, 0, 2, 4].map((dx, i) => ({ id: `warden${i}`, look: "guard", x: CAIRN.x + dx, z: CAIRN.z + 4.4, yaw: Math.PI })),
  ...[-3, -1, 1, 3].map((dx, i) => ({ id: `wardenB${i}`, look: "guard", x: CAIRN.x + dx, z: CAIRN.z + 5.8, yaw: Math.PI })),
];

export const EPISODE_23 = {
  id: "ep23",
  number: 23,
  unlockAt: 5,
  setup: { ...AFTER_EP22 },
  title: "Juno's Thread",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "title", type: "title" },
    { id: "knots", type: "scene", node: "Ep23_Knots", ...LH,
      rook: { x: TABLE.x + 1.35, z: TABLE.z - 0.2, yaw: -Math.PI / 2 },
      cast: [{ id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 }] },
    { id: "ask", type: "explore", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 1.0, yaw: Math.PI / 2 }, // up from the table, clear of Tamsin at her post
      objective: "Ask the squad where Cal went at night ({n}/{total}).",
      required: ["dagrun", "bas", "tamsin"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2, node: "Ep23_JunoTying" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "Ep23_Dagrun", again: "Ep23_Dagrun_Again" },
        { id: "bas", look: "bas", x: -5.3, z: -3.4, yaw: -1.75, node: "Ep23_Bas", again: "Ep23_Bas_Again" },
        { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep23_Tamsin", again: "Ep23_Tamsin_Again" },
        { id: "lio", look: "lio", x: -2.6, z: 9.6, yaw: Math.PI * 0.9, node: "Ep23_Lio" },
      ] },
    { id: "tower", type: "explore", ...LH,
      rook: { x: 2.4, z: 7.4, yaw: -Math.PI / 2 },
      objective: "**The foot of the tower**, on the side that faces the Dry Sea. Juno is already there.",
      required: ["towerStone"],
      cast: [
        { id: "juno", look: "juno", x: STONE.x + 1.4, z: STONE.z - 1.1, yaw: -0.9, node: "Ep23_JunoAtTower" },
        { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep23_Tamsin_Again" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "Ep23_Dagrun_Again" },
      ],
      pickups: [{ id: "towerStone", x: STONE.x, z: STONE.z, marker: false, node: "Ep23_Stone", label: "A loose stone at the foot of the tower" }] },
    { id: "notebook", type: "scene", node: "Ep23_Notebook", ...LH,
      rook: { x: STONE.x + 1.3, z: STONE.z + 0.7, yaw: -2.1 },
      cast: [{ id: "juno", look: "juno", x: STONE.x + 0.6, z: STONE.z - 0.9, yaw: 0.36 }] },
    { id: "vigil", type: "scene", node: "Ep23_Vigil", ...IH,
      rook: { x: CAIRN.x + 1.4, z: CAIRN.z + 2.6, yaw: Math.PI },
      cast: [
        { id: "bas", look: "bas", x: CAIRN.x + 0.8, z: CAIRN.z + 1.3, yaw: Math.PI },
        { id: "dagrun", look: "dagrun", x: CAIRN.x - 1.4, z: CAIRN.z + 1.5, yaw: Math.PI * 0.9 },
        { id: "juno", look: "juno", x: CAIRN.x + 2.4, z: CAIRN.z + 2.1, yaw: -2.6 },
        { id: "tamsin", look: "tamsin", x: CAIRN.x - 2.8, z: CAIRN.z + 2.6, yaw: 2.8 },
        { id: "lio", look: "lio", x: CAIRN.x + 3.4, z: CAIRN.z + 0.9, yaw: -2.2 },
        ...WARDENS,
        { id: "wraithe", look: "wraithe", x: CAIRN.x, z: CAIRN.z - 1.6, yaw: 0, hidden: true },
      ] },
    { id: "fight", type: "fight", ...IH, wave: ["wraithe"],
      tutorial: [
        { at: 0.5, text: "Wraithe never calls out a move. When a pale tear opens behind you, he's about to step out of it: turn and parry, or dodge." },
        { at: 11, text: "A pale tear on the ground under you is the Undertow. Move off it before it closes, or you'll fall through." },
      ],
      eventHints: {
        riftCall: "Two acolytes came through the air. Wraithe is still the one to watch.",
        riftDrop: "Through the floor and out of the sky. Next time, step off the pale seam.",
      },
      lines: [["Dagrun", "Don't let him get behind you!"], ["Juno", "Not here. Not tonight."]],
      retry: "Again. He doesn't get what he came for." },
    { id: "after", type: "scene", node: "Ep23_After", ...IH,
      rook: { x: CAIRN.x + 1.4, z: CAIRN.z + 2.6, yaw: Math.PI },
      cast: [
        { id: "bas", look: "bas", x: CAIRN.x + 0.8, z: CAIRN.z + 1.3, yaw: Math.PI },
        { id: "dagrun", look: "dagrun", x: CAIRN.x - 1.4, z: CAIRN.z + 1.5, yaw: 0.4 },
        { id: "juno", look: "juno", x: CAIRN.x + 2.4, z: CAIRN.z + 2.1, yaw: -2.6 },
        { id: "tamsin", look: "tamsin", x: CAIRN.x - 2.8, z: CAIRN.z + 2.6, yaw: 2.8 },
        { id: "lio", look: "lio", x: CAIRN.x + 3.4, z: CAIRN.z + 0.9, yaw: -2.2 },
        ...WARDENS,
      ],
      set: { EP23_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep24",
      lines: [
        "Next time on UNWRITTEN:",
        "The Ashfall Dominion has one war engine left, and it's rolling for the wall.",
        "On the ridge above the field, someone is watching.",
      ] },
  ],
};
