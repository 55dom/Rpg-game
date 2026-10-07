// Episode 19 · An Empty Chair (GDD §14 Arc 3, §15.7). The aftermath episode: quiet, no fighting. Walk the
// Lighthouse and talk to everyone; Dagrun takes the squad to the Hall of Lanterns; Brannoc's summons ends it.
// Arc 2's episodes aren't written yet, so Arc 3 opens as its own chapter with a "Previously" cold open.
// Track A (§15.5): A1 is Lio's line here (not missable); A2's first half is Cal's lantern in the Hall (missable).

export const EP19_SCRIPT = `
title: Ep19_Previously
---
PREVIOUSLY ON UNWRITTEN
A one-page mage climbed the Tower of Choosing, and the Last Lanterns took them in.
The Pale Choir sang in the Fens. A deacon, a rusted knight and a thing in the cistern fell.
Severin Valcourt stopped being only a rival.
Then the Lanterns marched into the Hollowmarch, where the Choir woke the Hollow Bloom.
Its light would have erased Aurelin's border.
Cal opened a door, pushed the Bloom through, and walked in after it.
"I'll hold the door. Don't wait up."
The door closed. Nothing came back.
===

title: Ep19_Dinner
---
<<cue night>>
<<shot wide>>
Dinner at the long table. Seven places set, out of habit. Five people.
<<shot on Tamsin>>
Tamsin: Who set seven? ...I set seven.
Tamsin: Sorry. Sorry, I'll fix it.
<<shot on Juno>>
Juno: Leave it.
<<shot on Bas>>
Bas: Nobody cooked. Dagrun used to say Cal cooked so nobody else would have to.
<<shot on Lio>>
Lio: The kitchen's cold. I keep listening for the whistling.
<<shot on Juno>>
Juno: Then stop listening.
<<pose Juno cross>>
Juno: "Don't wait up." Like he'd be late for dinner. Like it was a joke.
-> "He was saving everyone." #earnest
    Juno: I know what he was doing. I was there. I don't need it explained to me.
-> "He'd want us to eat." #wry
    Juno: He'd want a lot of things. He doesn't get a vote anymore.
-> "Say what you're actually angry about." #bold
    Juno: Fine. He didn't ask. Not one of us. He just went.
<<pose Juno none>>
<<shot on Juno>>
Juno: I'm going for a walk.
<<move Juno 7.5 -8>>
<<shot on Bas>>
Bas: Dagrun hasn't come out of his room since we got back.
<<shot wide>>
Nobody says anything else. At the top of the lighthouse, the lamp turns, and turns.
===

title: Ep19_Juno
---
<<pose Juno cross>>
Juno: If you came out here to make me feel better, don't.
-> "I came to stand here." #earnest
    Juno: ...Fine. Stand.
-> "I came to be angry with you." #bold
    Juno: Get in line.
Juno: He left his coat on the hook. Who leaves their coat? It's cold in the Hollowmarch. He knew it was cold.
Juno: He always said the Lighthouse was the only place he ever felt like he'd been put down on purpose.
<<pose Juno none>>
Juno: Go check on the others. Lio's taking it worse than he lets on.
===

title: Ep19_Juno_Again
---
Juno: I said stand, not hover.
===

title: Ep19_Bas
---
Bas is hitting a training dummy. Not hard. Over and over.
Bas: Cal taught me to fall. Right here. "Up, soldier." Every single time.
Bas: I'm a wall. That's my whole job. I didn't even see the door open.
-> "None of us did." #earnest
    Bas: Mm. That's supposed to help, isn't it.
-> "You held the line. That's why we got out." #bold
    Bas: ...Maybe. I'd trade it.
Bas: I don't know what to do with my hands.
===

title: Ep19_Bas_Again
---
Bas: I'll be here. Hitting this. It doesn't hit back. It's nice.
===

title: Ep19_Tamsin
---
Tamsin: I wrote him a song. It's terrible. He would've loved how terrible it is.
-> "Sing it." #earnest
    Tamsin: Okay. Okay. Don't laugh. Actually, laugh. He would.
    Tamsin sings two lines, wildly off-key, about a man who opened every door except the one to the snack cupboard.
    Tamsin: ...That's all I have. The rest is just me crying in different keys.
-> "Maybe later." #wry
    Tamsin: Yeah. Later's good. Later I'll be braver.
Tamsin: He said he liked us. Out loud, I mean, once. At the festival, when he was a bit drunk. "I actually like you lot."
===

title: Ep19_Tamsin_Again
---
Tamsin: Go on. I'm going to sit here and write a second verse. It'll be worse.
===

title: Ep19_Lio
---
Lio is standing at the lantern rack, very still.
Lio: I went back. To the plateau, before they closed the road. I wanted to read what was left.
Lio: When something dies, it leaves a mark on the air. Residue. Even the Bloom left one: it's all over that place, like a burn.
Lio: There's no residue. None. Where he stood, there's nothing at all.
<<set $CLUE_A1 to 1>>
-> "What does that mean?" #earnest
    Lio: It means the light took everything. Even that. Even the part of him that should have stayed.
-> "Stop. You don't have to tell me this." #wry
    Lio: Sorry. I'm sorry. I read things. It's what I do when I don't know what to do.
Lio: His lantern's dark. Dagrun said that's how you know.
===

title: Ep19_Lio_Again
---
Lio: I'll be fine. I'm making a list of things I'll be fine about.
===

title: Ep19_Door
---
You knock on Dagrun's door.
Nothing. Then, through the wood:
Dagrun: Go to bed, kid.
===

title: Ep19_Chair
---
Cal's chair. Someone pushed it in neatly against the table.
Nobody here pushes their chair in.
===

title: Ep19_Rack
---
Eight lanterns on the rack. Seven burn. Yours is the one at the end.
The second one is dark.
===

title: Ep19_DagrunOut
---
<<shot two Dagrun Rook>>
The door opens. Dagrun hasn't slept. He's wearing his coat.
Dagrun: Get the others. Get your coats.
Dagrun: The Hall keeps a lantern for every knight in Liraen. His is there too. Somebody ought to go and stand with it.
<<shot on Juno>>
Juno: Why? It's a lantern. It's out.
<<shot on Dagrun>>
Dagrun: Because I took him in when nobody else would. Because I'm his captain.
Dagrun: And because I haven't said goodbye, and I'm not doing it on my own.
===

title: Ep19_HallDagrun
---
<<shot two Dagrun Rook>>
Dagrun is standing at the Lanterns' shelf with his hat in his hands.
Dagrun: He turned up at my door one winter with no papers and no name he'd tell me. Looked like he'd been through the worst day of his life and found it a bit boring.
Dagrun: I gave him soup. He gave me a lecture on how to make it better. That was that.
<<shot on Dagrun>>
Dagrun: Go on, kid. Say something to him. He'd hate us standing here quiet.
-> "Thank you, Cal." #earnest
    <<set $EP19_GOODBYE to 1>>
    Dagrun: ...Yeah. That's the one.
-> "You still owe me a rematch." #wry
    <<set $EP19_GOODBYE to 2>>
    Dagrun: Ha. He'd say you'd lose it.
-> "I'll keep the key." #bold
    <<set $EP19_GOODBYE to 3>>
    Dagrun: Good. Don't lose it. He'd never let you hear the end of it.
<<shot wide>>
One by one, the Lanterns step up to the shelf. Nobody makes a speech. Tamsin hums. It's still terrible.
===

title: Ep19_HallSquad
---
<<shot on Juno>>
Juno: Don't talk to me. I'm fine.
===

title: Ep19_Summons
---
<<shot wide>>
Boots on the stone. A knight in Iron Wardens grey hurries up the aisle, wet from the rain.
<<move Warden 0.2 5.6 wait>>
<<face Warden Dagrun>>
<<shot two Warden Dagrun>>
Warden: Captain Dagrun? From Captain Brannoc, Iron Wardens.
Warden: The Ashfall Dominion crossed the border at dawn. Ironhold is holding. He asks for the Lanterns.
<<shot on Bas>>
Bas: Brannoc. He's the one who taught me to fight.
<<shot on Dagrun>>
Dagrun: They heard we lost one. They think we're soft.
<<shot on Juno>>
Juno: Good. I want to hit something.
<<shot on Dagrun>>
Dagrun: We march at first light. Lanterns, go home and sleep. That's an order. The only one I've got tonight.
<<set $HAS_SUMMONS to 1>>
===
`;

const LH = { stage: "lighthouse" };
const HL = { stage: "hall" };
const TABLE = { x: 5, z: 6 };
const SHELF_Z = 8.0; // where you stand at the Lanterns' shelf

export const EPISODE_19 = {
  id: "ep19",
  number: 19,
  unlockAt: 5, // Arc 2 (Eps 5–18) isn't written yet: Arc 3 opens as its own chapter once Episode 4 is done
  setup: { CAL_STATE: 1, LANTERN_LIT: 1, HAS_BRASS_KEY: 1, ARC2_DONE: 1 }, // what Arcs 1–2 leave behind, if you start here
  title: "An Empty Chair",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: false, ultimate: false },
  beats: [
    { id: "previously", type: "coldopen", node: "Ep19_Previously" },
    { id: "title", type: "title" },
    { id: "dinner", type: "scene", node: "Ep19_Dinner", ...LH,
      rook: { x: TABLE.x - 1.35, z: TABLE.z + 1.6, yaw: Math.PI / 2 },
      cast: [
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "lio", look: "lio", x: TABLE.x - 1.35, z: TABLE.z - 1.9, yaw: Math.PI / 2 },
        { id: "tamsin", look: "tamsin", x: TABLE.x + 1.35, z: TABLE.z + 1.6, yaw: -Math.PI / 2 },
        { id: "bas", look: "bas", x: TABLE.x + 1.35, z: TABLE.z - 0.2, yaw: -Math.PI / 2 },
      ] },
    { id: "home", type: "explore", ...LH,
      rook: { x: TABLE.x - 2.4, z: TABLE.z + 1.6, yaw: Math.PI },
      objective: "Check on the squad ({n}/{total}). Then knock on **Dagrun's door**.",
      required: ["juno", "bas", "tamsin", "lio", "dagrunDoor"],
      cast: [
        { id: "juno", look: "juno", x: 7.5, z: -8, yaw: Math.PI, node: "Ep19_Juno", again: "Ep19_Juno_Again" },
        { id: "bas", look: "bas", x: -5.3, z: -3.4, yaw: -1.75, node: "Ep19_Bas", again: "Ep19_Bas_Again" },
        { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep19_Tamsin", again: "Ep19_Tamsin_Again" },
        { id: "lio", look: "lio", x: 3.6, z: 11.2, yaw: 0, node: "Ep19_Lio", again: "Ep19_Lio_Again" },
      ],
      pickups: [
        { id: "dagrunDoor", x: -4, z: 9.7, marker: false, node: "Ep19_Door", label: "Knock on Dagrun's door" },
        { id: "calChair", x: TABLE.x + 2.2, z: TABLE.z + 2.4, marker: false, node: "Ep19_Chair", label: "Cal's chair" },
        { id: "rack", x: 1.4, z: 11.6, marker: false, node: "Ep19_Rack", label: "The lantern rack" },
      ] },
    { id: "door", type: "scene", node: "Ep19_DagrunOut", ...LH,
      rook: { x: -4, z: 8.4, yaw: 0 },
      cast: [
        { id: "dagrun", look: "dagrun", x: -4, z: 9.9, yaw: Math.PI },
        { id: "juno", look: "juno", x: -2.2, z: 7.6, yaw: -2.4 },
        { id: "bas", look: "bas", x: -6, z: 7.4, yaw: 2.4 },
        { id: "tamsin", look: "tamsin", x: -1.4, z: 8.8, yaw: -2 },
        { id: "lio", look: "lio", x: -5.6, z: 8.8, yaw: 2 },
      ] },
    { id: "hall", type: "explore", ...HL,
      rook: { x: 0, z: -8.6, yaw: 0 },
      objective: "The **Lanterns' shelf** is on the far wall. Stand with **Dagrun**.",
      required: ["dagrun"],
      cast: [
        { id: "dagrun", look: "dagrun", x: -2.5, z: SHELF_Z, yaw: 0, node: "Ep19_HallDagrun" },
        { id: "juno", look: "juno", x: 3.4, z: 5.4, yaw: -0.6, node: "Ep19_HallSquad" },
        { id: "bas", look: "bas", x: -3.8, z: 6.6, yaw: 0.6 },
        { id: "tamsin", look: "tamsin", x: 1.6, z: 6.6, yaw: -0.2 },
        { id: "lio", look: "lio", x: -0.2, z: 5.2, yaw: 0.2 },
        { id: "keeper", look: "keeper", x: 1.6, z: -7.4, yaw: -2.6, node: "W_HallKeeperIn" },
      ],
      pickups: [
        { id: "calLantern", x: -1.4, z: 8.3, marker: false, node: "W_Hall_CalLantern", label: "Cal's lantern" },
        { id: "myLantern", x: 2.1, z: 8.3, marker: false, node: "W_Hall_MyLantern", label: "Your lantern" },
        { id: "brannocLantern", x: -4.1, z: 0, marker: false, node: "W_Hall_Brannoc", label: "The Iron Wardens' shelf" },
        { id: "fallenShelf", x: 4.1, z: -5, marker: false, node: "W_Hall_Fallen", label: "The Crimson Bell's shelf" },
      ] },
    { id: "summons", type: "scene", node: "Ep19_Summons", ...HL,
      rook: { x: 0.6, z: SHELF_Z - 0.4, yaw: Math.PI },
      cast: [
        { id: "dagrun", look: "dagrun", x: -2.5, z: SHELF_Z, yaw: Math.PI },
        { id: "juno", look: "juno", x: 2.2, z: 7.2, yaw: -2.6 },
        { id: "bas", look: "bas", x: -2.6, z: 7, yaw: 2.6 },
        { id: "tamsin", look: "tamsin", x: 1.4, z: 6.4, yaw: Math.PI },
        { id: "lio", look: "lio", x: -0.4, z: 6.2, yaw: Math.PI },
        { id: "warden", look: "guard", x: 0.2, z: -8.6, yaw: 0 },
      ],
      set: { EP19_DONE: 1 } },
    { id: "preview", type: "preview", next: "Episode 20 · The Iron Front",
      lines: [
        "Next time on UNWRITTEN:",
        "The Ashfall Dominion is over the border, and Ironhold's wall is the only thing in the way.",
        "Captain Brannoc of the Iron Wardens has a lesson for Bas, and one for you.",
      ] },
  ],
};
