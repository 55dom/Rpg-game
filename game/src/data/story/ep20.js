// Episode 20 · The Iron Front (GDD §14 Arc 3). The Ashfall Dominion crosses the eastern border, sensing the Crown
// is weak after the Hollowmarch. The Lanterns march to Ironhold and hold the gate field beside Captain Brannoc.

export const EP20_SCRIPT = `
title: Ep20_Arrive
---
<<shot wide>>
Ironhold. A grey wall eighty years old across the throat of the eastern pass. Smoke on the far side of it.
<<shot two Brannoc Bas>>
Brannoc: Bastion Okafor. You got tall.
Bas: I was always tall, sir.
Brannoc: You were always tall and you always slouched. Stand up. There. Better.
<<shot on Brannoc>>
Brannoc: Dagrun. Lanterns. Thank you for coming.
<<face Brannoc Rook>>
<<shot two Brannoc Rook>>
Brannoc: And you're the one-pager. I heard about your vice captain. I'm sorry.
Brannoc: He was a strange one. Laughed at the wrong things. Good, though. The good ones always cost the most.
-> "Thank you, Captain." #earnest
    Brannoc: Don't thank me. Grieve when the line holds. Not before.
-> "We're not here to talk about him." #bold
    Brannoc: No. You're here to hold a wall. Fair.
-> "Everyone keeps saying he was strange." #wry
    Brannoc: He was. I liked him for it. Nobody else in Liraen ever beat me at cards.
<<shot on Brannoc>>
<<pose Brannoc point>>
Brannoc: The Ashfall Dominion came over the river at dawn. They heard the Crown lost knights in the Hollowmarch. They think we're soft.
Brannoc: Their general is Varka Ironsong. Storm and iron. She sings when she fights. You'll hear her before you see her.
<<pose Brannoc none>>
Brannoc: Today it's her soldiers: legionaries with burning halberds, war-mages who call thunder. The wall holds. You hold the field in front of it.
<<shot on Dagrun>>
Dagrun: You heard the man. Lanterns, out front. Bas, Juno, with me and the kid. Lio, Tamsin, on the wall with the Wardens' archers.
<<shot on Brannoc>>
Brannoc: I'll stand with you. I always stand at the gate. The wall does not move. Neither do I.
===

title: Ep20_Lull
---
<<shot wide>>
The first wave breaks against the Lanterns and falls back into the smoke. Ash drifts down like snow.
<<shot two Brannoc Rook>>
Brannoc: One page. One page, and you cut through a legionary's guard like it was paper.
-> "I've had practice." #wry
    Brannoc: Ha. Good answer.
-> "It's all I've got. So I use all of it." #earnest
    Brannoc: That's the whole of the Oath, kid. You'd be good at it.
<<shot on Juno>>
Juno: Horns. They're coming again.
<<shot on Bas>>
Bas: More this time. War-mages at the back.
<<shot on Brannoc>>
Brannoc: Then we do it again. Watch the ground: when the sky marks it, move.
===

title: Ep20_Night
---
<<shot wide>>
Night on the wall. Braziers along the battlements. Out on the plain, the Ashfall camp burns like a second city.
<<shot two Brannoc Dagrun>>
Dagrun: They'll come with the engine tomorrow or the day after.
Brannoc: The Ironsong. I've seen it once. It took a gate off its hinges at Coldwater with one shot.
Dagrun: And you're sure you want my kids out front.
Brannoc: Your kids held two waves today without the wall lifting a stone. Yes. I'm sure.
<<face Brannoc Rook>>
<<shot two Brannoc Rook>>
Brannoc: Can't sleep either? Come here.
Brannoc: Tomorrow at dawn, the training ring. You and Bastion. I'll teach you to stand.
Brannoc: Not to fight. You can fight. To stand. There's a difference, and it's the only one that matters out here.
<<set $EP20_DONE to 1>>
===
`;

const IH = { stage: "ironhold" };

export const EPISODE_20 = {
  id: "ep20",
  number: 20,
  unlockAt: 5,
  setup: { CAL_STATE: 1, LANTERN_LIT: 1, HAS_BRASS_KEY: 1, ARC2_DONE: 1, HAS_SUMMONS: 1, EP19_DONE: 1 },
  title: "The Iron Front",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "brannoc"] },
  beats: [
    { id: "title", type: "title" },
    { id: "arrive", type: "scene", node: "Ep20_Arrive", ...IH,
      rook: { x: 0, z: -28.6, yaw: 0 },
      cast: [
        { id: "brannoc", look: "brannoc", x: 0, z: -25.4, yaw: Math.PI },
        { id: "bas", look: "bas", x: 1.8, z: -27.6, yaw: -2.4 },
        { id: "dagrun", look: "dagrun", x: -2.2, z: -27.2, yaw: 2.4 },
        { id: "juno", look: "juno", x: -1.6, z: -30, yaw: 2.8 },
        { id: "tamsin", look: "tamsin", x: 2.6, z: -30.2, yaw: -2.8 },
        { id: "lio", look: "lio", x: -3.4, z: -29.4, yaw: 2.2 },
      ] },
    { id: "wave1", type: "fight", ...IH, wave: ["ashLegion", "ashLegion", "ashMage"],
      tutorial: [
        { at: 0.5, text: "A ring on the ground means a Thunderhead: step out of it before the bolt lands." },
        { at: 9, text: "A Legionary's red glint is the Brand. It can't be blocked, and it leaves you SCORCHED (a slow burn)." },
        { at: 18, text: "Brannoc fights beside you. Press {Assist2} for his Pledged Strike: it breaks guards." },
      ],
      lines: [["Brannoc", "Ironhold! The wall does not move!"]],
      retry: "Up. The wall's behind us. We don't get to fall back." },
    { id: "lull", type: "scene", node: "Ep20_Lull", ...IH,
      rook: { x: 0, z: -2, yaw: 0 },
      cast: [
        { id: "brannoc", look: "brannoc", x: 1.6, z: -0.6, yaw: -2.2 },
        { id: "juno", look: "juno", x: -2.2, z: -1.4, yaw: 0.4 },
        { id: "bas", look: "bas", x: 2.4, z: -3.2, yaw: -0.8 },
      ] },
    { id: "wave2", type: "fight", ...IH, wave: ["ashLegion", "ashMage", "ashLegion", "ashMage", "ashLegion"], tokens: 2,
      lines: [["Bas", "With you, sir."], ["Brannoc", "Lanterns! Hold!"]],
      retry: "Again. They broke once. They'll break twice." },
    { id: "night", type: "scene", node: "Ep20_Night", ...IH,
      rook: { x: 0.8, z: -24.6, yaw: 0 },
      cast: [
        { id: "brannoc", look: "brannoc", x: -1.2, z: -23.4, yaw: 0.6 },
        { id: "dagrun", look: "dagrun", x: 1.8, z: -23.2, yaw: -0.4 },
      ] },
    { id: "preview", type: "preview", next: "Episode 21 · The Oath of Steel", nextEpisode: "ep21",
      lines: [
        "Next time on UNWRITTEN:",
        "At dawn, Brannoc teaches Bas and Rook what it means to stand.",
        "On the horizon, something huge begins to move.",
      ] },
  ],
};
