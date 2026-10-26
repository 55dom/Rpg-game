// Episode 31 · The Ferryman (GDD §14 Arc 4, §15.7 Encounter III). Children are going missing from Aurelin's poor
// quarter, and the washing freezes on the line in August: the Choir's rift-walker is cutting seams again. The squad
// walks the quarter at night (Mag, whose boy is gone; the Watch; frost where the seams opened), and Rook stands by
// the fountain as bait. Wraithe comes, but tonight black tears take his acolytes out from under him. When he slips
// away, the masked knight is waiting on the other side: one cut, and then he reaches into the Choir's seam and lifts
// the children out. To the first of them he says "Mind the step." (B4). Tamsin thinks it's a weird thing to say.

import { AFTER_EP30 } from "./arc4.js";
import { ZONES } from "../zones.js";
import { QUARTER as Q } from "./cutscenes.js";

export const EP31_SCRIPT = `
title: Ep31_Cold
---
<<shot wide>>
Aurelin, after midnight. The poor quarter by the grate, where the lamps don't reach.
<<show kit>>
<<shot on Kit>>
A boy in a man's coat is chasing the Lowmarket cat between the washing lines.
Kit: Here, puss. Here. I've got a bit of fish. It's mostly fish.
<<fx rift Kit>>
The air beside him opens like a slit in paper. Pale at the edges, and nothing inside it at all.
<<hide kit>>
<<shot wide>>
And he's gone. The washing on the line is still swinging.
<<shot on Mag>>
Mag: Kit? Kit, it's late, come in. ...Kit?
===

title: Ep31_Word
---
<<shot wide>>
Juno comes in from Aurelin with her stall money in one hand and a letter in the other, and doesn't sit down.
<<shot on Juno>>
Juno: Three children gone from the poor quarter in nine nights. The last one was Mag's boy, Kit. He's eight. Mag sells my knots on her corner when I'm away.
Juno: The Watch says they ran off to the Fens. Children from the poor quarter don't run to the Fens. There's nothing to eat in the Fens.
<<shot on Dagrun>>
Dagrun: We're Lanterns, Juno. We're not the Watch.
<<shot on Juno>>
Juno: Then I'll go on my own, and you can tell the Crown I'm sick.
<<shot on Lio>>
Lio: ...Did anyone see a light? Before they went. Pale. Like frost catching the moon.
<<shot on Juno>>
Juno: Mag said the washing froze stiff on the line. In August.
<<shot on Lio>>
Lio: That's a seam. When the silent school cuts the air, the cold gets in, and it leaves frost where it opened. That's Wraithe.
<<shot on Severin>>
Severin: The man from Brannoc's vigil. The one who steps through the air.
<<shot on Dagrun>>
Dagrun: ...Fine. Tonight. Quietly. Severin, you stay here with Elodie.
<<shot on Severin>>
Severin: I'm going.
<<shot on Dagrun>>
Dagrun: You're staying, because if your father's Lances come while we're out, I want a Valcourt on the porch they have to step over.
<<shot two Severin Rook>>
-> "He's right. Someone has to be here." #earnest
    Severin: ...Fine. Bring them home.
-> "Elodie would never forgive us if we left her alone with Bas's cooking." #wry
    Bas: I heard that.
    Severin: Fine. I'll make the tea. Bring them home.
===

title: Ep31_Mag
---
Mag: You're Juno's lot. The Lanterns. She said you'd come, and I said you wouldn't. I'm glad I was wrong.
Mag: He was out after the cat. He's always out after that cat. I heard him laughing, and then I didn't.
Mag: The washing was frozen stiff when I came out. In August. And there was a smell like after lightning.
-> "We'll find him." #earnest
    Mag: Everybody says that. Say it like you mean it and I'll believe you.
-> "Did anyone else see anything?" #bold
    Mag: Old Ferris swears he saw the Ferryman on the roofs. Ferris also swears his dog can count.
<<set $MAG_ASKED to 1>>
===

title: Ep31_Luke
---
Luke: Oh. It's you. The Lantern. Elsie won't stop talking about you, you know. It's exhausting.
Luke: The Captain says they ran off to the Fens. I'm from the Fens. Nobody runs to the Fens.
Luke: I've been walking this quarter every night on my own time. Don't tell anyone. It's bad for my reputation.
-> "Your reputation as what?" #wry
    Luke: As someone who doesn't care. I've worked very hard on it.
-> "Walk with us tonight." #earnest
    Luke: Can't. Somebody has to stand at the top of the lane so nobody else's kid walks into whatever this is. ...Go on. I've got the lane.
<<set $WATCH_ASKED to 1>>
===

title: Ep31_Sergeant
---
Sergeant: Lanterns in the poor quarter after midnight. Is there a war on that nobody told me about?
Sergeant: Three runaways. The Captain's written it up. Kids from down here run off all the time.
Sergeant: ...Between you and me, I've walked this lane twenty years, and none of them ever ran off in their nightdress. Go on. I didn't see you.
<<set $WATCH_ASKED to 1>>
===

title: Ep31_Frost1
---
Frost on the cobbles under the washing line, in a ragged shape about as big as a door. It hasn't melted, and it's a warm night.
<<set $FROST_1 to 1>>
===

title: Ep31_Frost2
---
Frost on the corner of the shack, in a jagged line at head height, as if something was cut there and sewn up badly.
<<set $FROST_2 to 1>>
===

title: Ep31_Frost3
---
A ring of frost on the step of a house nobody's lived in for a year. A child's shoe is frozen to the stone.
<<set $FROST_3 to 1>>
===

title: Ep31_Lio
---
Lio: Every mark is a seam. He opens one, steps through, and closes it. The frost is what leaks out while it's open.
Lio: Three marks round the quarter, and all of them face the same way. Toward the fountain. He comes and goes through the plaza.
Lio: The silent school always uses the same doors. It's a vanity thing. ...I'm aware of the irony.
===

title: Ep31_Juno
---
Juno: I've sold knots on this corner since I was twelve. I know every kid in this quarter by name.
Juno: Kit. Nell. Tobin. Say them with me if you like. It helps.
===

title: Ep31_Tamsin
---
Tamsin: I keep thinking I can hear someone laughing. Then it's just the cat.
Tamsin: I hate this place at night. I grew up somewhere just like it. ...Don't tell Juno. She'd be kind about it.
===

title: Ep31_Bait
---
<<shot wide>>
The plaza, two hours before dawn. The fountain is the only thing moving.
<<shot on Lio>>
Lio: He comes back through the same doors. If he's taking another one tonight, he comes through here.
<<shot on Juno>>
Juno: Then somebody stands by the fountain looking small and lost.
<<shot on Tamsin>>
Tamsin: I volunteer {name}.
<<shot two Rook Tamsin>>
-> "Fine. Everyone out of sight." #bold
    Tamsin: That's the spirit. We'll be right behind the pillars. Mostly.
-> "I'm not small." #wry
    Juno: You're a bit small.
<<shot wide>>
The squad melts back into the dark under the colonnade. You stand by the fountain, and wait. After a while, the water stops moving.
===

title: Ep31_Step
---
<<shot wide>>
You come round the corner at a run, the others behind you. Wraithe is gone. In the lane by the grate, the masked knight stands over a small boy in a man's coat.
<<shot on Kit>>
Kit: ...Are you the Ferryman?
<<shot on Masked>>
He doesn't answer. He's looking at the pale seam by the shack door. It's still open, and it's starting to close.
<<pose Masked hand>>
He reaches into it again.
<<fx rift nell>>
<<show nell>>
<<shot on nell>>
A girl in a nightdress, shaking with cold.
<<fx rift tobin>>
<<show tobin>>
<<shot on tobin>>
A boy with one shoe.
<<pose Masked none>>
<<shot two Masked Kit>>
He puts a hand on the first boy's shoulder and turns him toward you, toward the street and home. The doorstep in front of the shack is cracked and high.
Masked: Mind the step.
<<set $CLUE_B4 to 1>>
<<shot on Tamsin>>
Tamsin: ...That's a weird thing to say.
<<shot on Juno>>
Juno: Kit. Nell. Tobin. Come here. Come here, all of you. You're all right.
<<shot two Rook Masked>>
-> "You killed him in front of them." #bold
    <<shot on Masked>>
    He looks at you for a long moment. Then at the children, and the seam, and back.
-> "Why save them?" #earnest
    <<shot on Masked>>
    He looks at you for a long moment, as if the question has an answer he's decided not to give.
<<fx tear Masked>>
<<hide Masked>>
<<shot wide>>
A black tear, and he's gone. The pale seam by the door closes behind him like a mouth.
<<shot on Bas>>
Bas: He saves children. And he executes people. Same night. Same hands.
<<shot on Lio>>
Lio: Wraithe was the best rift-walker the silent school ever had. Nobody has ever been waiting for him on the other side. Nobody was ever that fast.
<<set $SABLE_ENCOUNTER to 3>>
<<set $WRAITHE_DEAD to 1>>
===

title: Ep31_Dawn
---
<<shot wide>>
Dawn comes up grey over the poor quarter. Every door in the lane is open, and every lamp is lit.
<<shot two Mag Kit>>
Mag has Kit by both ears and is crying into his hair and telling him off, all at the same time.
Mag: Your father's coat. You went out in your father's coat, after the cat, at midnight.
Kit: The cat's fine.
<<shot on Mag>>
Mag: He says the Ferryman brought him back. My gran used to say the Ferryman takes bad men across the river and sends the children home. I never believed a word of it.
Mag: I'll light a candle for him now. Whoever he is.
<<set $RUMOR_FERRYMAN to 1>>
<<if $LUKE_GUARD>>
    <<shot on Luke>>
    Luke: Three kids, all home, nobody dead who didn't have it coming. And the Captain's going to write it up as runaways that ran back.
    Luke: Don't look at me like that. I've got something in my eye. It's the frost.
<<else>>
    <<shot on Sergeant>>
    Sergeant: Three runaways, all home. That's how the Captain will write it. I'll write it different, in my own book.
<<endif>>
<<shot on Juno>>
Juno: Wraithe took them because the Choir wanted something. Nobody does nine nights' work for nothing.
<<shot on Lio>>
Lio: They wanted children the Tower has never read. Children with no grimoire yet. ...Like Elodie.
<<shot on Juno>>
Juno: Then we go home. Now.
<<set $KIDS_HOME to 1>>
===
`;

const AU = { stage: "aurelin" }, NIGHT = { sky: { daylight: 0.05 } }, LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 };   // the Lighthouse's long table
// The fight by the fountain: the plaza with its solids (the fountain, the lamps, the houses), not the yard's open ring.
const PLAZA = { radius: 15, solids: ZONES.aurelin.bounds.solids };

export const EPISODE_31 = {
  id: "ep31",
  number: 31,
  unlockAt: 5,
  setup: { ...AFTER_EP30 },
  title: "The Ferryman",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep31_Cold", ...AU, ...NIGHT, rook: null,
      cast: [
        { id: "mag", look: "mag", x: 30.6, z: -20.0, yaw: 2.5 },
        { id: "kit", look: "kit", x: 33.2, z: -23.0, yaw: 0.6, hidden: true },
      ] },
    { id: "title", type: "title" },
    { id: "word", type: "scene", node: "Ep31_Word", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "juno", look: "juno", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "severin", look: "severin", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "tamsin", look: "tamsin", x: TABLE.x + 0.4, z: TABLE.z - 3.4, yaw: -0.2 },
        { id: "bas", look: "basSling", x: TABLE.x - 2.8, z: TABLE.z - 1.4, yaw: 1.1 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ] },
    { id: "quarter", type: "explore", ...AU, ...NIGHT,
      rook: { x: 21, z: -21, yaw: Math.PI / 2 },
      objective: "Walk the poor quarter: ask Mag and the Watch, and find the frost Lio talked about ({n}/{total}).",
      required: ["mag", "watch", "frost1", "frost2", "frost3"], counts: "required",
      cast: [
        { id: "mag", look: "mag", x: 30.6, z: -19.4, yaw: 2.4, node: "Ep31_Mag" },
        { id: "watch", look: "luke", x: 24.4, z: -16.6, yaw: -2.2, node: "Ep31_Luke", when: "$LUKE_GUARD" },
        { id: "watch", look: "sergeant", x: 21.6, z: -25.6, yaw: 0.6, node: "Ep31_Sergeant", when: "not $LUKE_GUARD" },
        { id: "lio", look: "lio", x: 28.8, z: -28.2, yaw: 0.4, node: "Ep31_Lio" },
        { id: "juno", look: "juno", x: 36.0, z: -15.6, yaw: -2.6, node: "Ep31_Juno" },
        { id: "tamsin", look: "tamsin", x: 19.4, z: -15.4, yaw: 2.6, node: "Ep31_Tamsin" },
      ],
      pickups: [
        { id: "frost1", x: 33.0, z: -21.8, node: "Ep31_Frost1", label: "Look at the frost" },
        { id: "frost2", x: 26.6, z: -26.6, node: "Ep31_Frost2", label: "Look at the frost" },
        { id: "frost3", x: 37.0, z: -16.8, node: "Ep31_Frost3", label: "Look at the frost" },
      ] },
    { id: "bait", type: "scene", node: "Ep31_Bait", ...AU, ...NIGHT,
      rook: { x: 0, z: -4.4, yaw: 0 },
      cast: [
        { id: "lio", look: "lio", x: 2.4, z: -5.8, yaw: -0.6 },
        { id: "juno", look: "juno", x: -2.2, z: -5.6, yaw: 0.5 },
        { id: "tamsin", look: "tamsin", x: -3.8, z: -3.4, yaw: 1.2 },
        { id: "bas", look: "basSling", x: 3.8, z: -3.6, yaw: -1.2 },
      ] },
    { id: "wraithe", type: "fight", ...AU, ...NIGHT, wave: ["wraithe"], tokens: 2, world: { hunted: true, bounds: PLAZA },
      tutorial: [
        { at: 0.5, text: "Wraithe again. A pale tear behind you means he's about to step out of it: turn and parry, or dodge. A tear under your feet: move." },
      ],
      eventHints: { taken: "A black tear, not a pale one. That isn't his. Somebody else is here tonight." },
      lines: [["Juno", "Where are they? Where are the children?"], ["Bas", "One arm's plenty for this one."]],
      retry: "Up. Kit's waiting." },
    { id: "cut", type: "cutscene", cutscene: "ep31_step" },
    { id: "step", type: "scene", node: "Ep31_Step", ...AU, ...NIGHT,
      rook: { x: 28.0, z: -22.6, yaw: 2.1 },
      cast: [
        { id: "masked", look: "masked", x: Q.reach.x, z: Q.reach.z, yaw: -1.0 },
        { id: "kit", look: "kit", x: Q.boy.x, z: Q.boy.z, yaw: -1.2 },
        { id: "nell", look: "nell", x: 34.4, z: -27.8, yaw: -1.4, hidden: true },
        { id: "tobin", look: "tobin", x: 34.5, z: -25.4, yaw: -1.8, hidden: true },
        { id: "tamsin", look: "tamsin", x: 26.8, z: -23.8, yaw: 1.9 },
        { id: "juno", look: "juno", x: 28.6, z: -21.2, yaw: 2.3 },
        { id: "bas", look: "basSling", x: 27.0, z: -21.6, yaw: 2.2 },
        { id: "lio", look: "lio", x: 26.0, z: -22.6, yaw: 2.0 },
      ] },
    { id: "dawn", type: "scene", node: "Ep31_Dawn", ...AU, sky: { daylight: 0.3 },
      rook: { x: 27.8, z: -20.8, yaw: 1.6 },
      cast: [
        { id: "mag", look: "mag", x: 30.4, z: -20.2, yaw: -2.4 },
        { id: "kit", look: "kit", x: 31.2, z: -21.0, yaw: -0.8 },
        { id: "juno", look: "juno", x: 28.8, z: -22.4, yaw: 1.0 },
        { id: "lio", look: "lio", x: 29.6, z: -23.8, yaw: 0.2 },
        { id: "luke", look: "luke", x: 26.4, z: -18.6, yaw: 2.0, when: "$LUKE_GUARD" },
        { id: "sergeant", look: "sergeant", x: 26.2, z: -22.6, yaw: 1.2, when: "not $LUKE_GUARD" },
      ],
      set: { EP31_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep32",
      lines: [
        "Next time on UNWRITTEN:",
        "Halvard's Lances are on every corner of the Crown Ward, and the Writ is in the Chancellor's house.",
        "Severin means to take it back. Quietly, if he can.",
      ] },
  ],
};
