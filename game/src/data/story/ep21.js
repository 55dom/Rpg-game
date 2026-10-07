// Episode 21 · The Oath of Steel (GDD §14 Arc 3). Brannoc trains Bas and Rook: the Oath (say what you won't
// do, and it gives you strength). A short, intense bond: the vow you choose and what you tell him are remembered.

export const EP21_SCRIPT = `
title: Ep21_Dawn
---
<<shot wide>>
Dawn over the training ring behind the wall. Frost on the fence rails. Brannoc is already there. He might not have slept.
<<shot two Brannoc Bas>>
Brannoc: Oath magic. You've heard the word. Here's the whole of it.
Brannoc: You say out loud what you will not do. "I will not step back." And the magic gives you strength for it. More than you've earned.
Brannoc: Break the vow, and it takes it all back with interest.
<<shot on Bas>>
Bas: That's why you never retreat. In any of the stories.
<<shot on Brannoc>>
Brannoc: That's why I never retreat. The stories leave out how much it hurts.
<<face Brannoc Rook>>
<<shot two Brannoc Rook>>
Brannoc: You don't have Oath magic, one-pager. Doesn't matter. Every knight makes a vow, whether they say it or not. Say yours. Out loud.
-> "I won't step back." #bold
    <<set $BRANNOC_VOW to 1>>
    Brannoc: My own vow. Careful. It's heavier than it looks.
-> "I won't leave anyone behind." #earnest
    <<set $BRANNOC_VOW to 2>>
    Brannoc: That one costs the most. Good. Make it cost.
-> "I won't lie to my squad." #wry
    <<set $BRANNOC_VOW to 3>>
    Brannoc: Hm. Harder than it sounds, in a war. Keep it.
<<shot on Brannoc>>
Brannoc: Now. Show me how you stand. Come at me. Properly. I won't break anything that matters.
===

title: Ep21_AfterSpar
---
<<shot two Brannoc Rook>>
Brannoc: Not bad. You don't stand yet. You flow. It's not wrong. It's just not mine.
Brannoc: The day you need to stand, you'll find you can. That's how it works.
<<shot two Brannoc Bas>>
Brannoc: Bastion. Here.
Brannoc: When I'm gone, the Wardens will need a wall. Not a captain: a wall. Somebody who doesn't move.
<<shot on Bas>>
Bas: You're not going anywhere, sir.
<<shot on Brannoc>>
Brannoc: Everybody goes somewhere. I just want to know who's standing where I stood.
===

title: Ep21_BrannocTalk
---
<<set $BRANNOC_BOND to 1>>
Brannoc: Walk with me. Captains don't get to sit down in front of their soldiers. It's very tiring.
-> "Why did you send Bas to the Lanterns?" #earnest
    Brannoc: Because he was the best wall I'd ever trained and I was making him smaller. The Wardens make you stone. Dagrun lets you be a person.
    Brannoc: Don't tell him I said that. Either of them.
-> "Are you afraid of Varka?" #bold
    Brannoc: Of course. Only fools aren't. She took Coldwater in a morning.
    Brannoc: Fear's fine. It's moving back that's the problem.
-> "What's your vow? The real one." #wry
    Brannoc: "The wall does not move." Everyone thinks it's about the wall. It's about me.
    Brannoc: I swore it when I was younger than you. I've never once broken it. I don't plan to start.
<<set $BRANNOC_BOND to 2>>
Brannoc: You remind me of your vice captain, you know. Not the jokes. The way you look at things like you're reading them.
===

title: Ep21_BrannocAgain
---
Brannoc: Go see your squad. I'll be here. I'm always here.
===

title: Ep21_Juno
---
Juno is sharpening a knife that's already sharp.
Juno: Don't. I'm fine. I'm sharpening.
Juno: ...He's nice. Brannoc. He talks to you like you're already the knight you're going to be.
Juno: I hate it. I hate that I like him. Everybody I like leaves.
===

title: Ep21_Tamsin
---
Tamsin: The Wardens have a marching song. It's terrible. It's the best thing I've ever heard. Fourteen verses, all about not moving.
Tamsin: I'm teaching them a fifteenth. It's about moving a little bit. They're furious.
===

title: Ep21_Lio
---
Lio is on the wall, looking out at the smoke.
Lio: The war-mages' storms aren't natural. They're pulling charge out of the ground, out of the iron in the soil. That's why it's so dry out there.
Lio: Their general does the same thing, a hundred times bigger. Ironsong. She doesn't call storms. She sings them out of the earth.
===

title: Ep21_Dagrun
---
Dagrun: He's good for you. Brannoc. He was good for Bas too.
Dagrun: I was never that kind of captain. I'm the kind that sits in a chair and lets you find out on your own.
Dagrun: Don't tell anyone I said he was better at it. Especially him.
===

title: Ep21_Horns
---
<<shot wide>>
Evening. All along the wall, the Wardens go quiet at once.
On the horizon something huge is moving: a tower on wheels, iron-plated, a ballista on its roof, crackling blue at the crown.
Across the whole plain, faint and clear, someone is singing.
<<shot two Brannoc Rook>>
Brannoc: The Ironsong. And her.
Brannoc: Tomorrow she comes herself. Get some sleep. That's a captain's advice, not an order.
<<set $EP21_DONE to 1>>
===
`;

const IH = { stage: "ironhold" };
const RING = { x: -20, z: -39 };

export const EPISODE_21 = {
  id: "ep21",
  number: 21,
  unlockAt: 5,
  setup: { CAL_STATE: 1, LANTERN_LIT: 1, HAS_BRASS_KEY: 1, ARC2_DONE: 1, HAS_SUMMONS: 1, EP19_DONE: 1, EP20_DONE: 1 },
  title: "The Oath of Steel",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: false },
  beats: [
    { id: "title", type: "title" },
    { id: "dawn", type: "scene", node: "Ep21_Dawn", ...IH,
      rook: { x: RING.x - 1.4, z: RING.z, yaw: Math.PI / 2 },
      cast: [
        { id: "brannoc", look: "brannoc", x: RING.x + 1.4, z: RING.z, yaw: -Math.PI / 2 },
        { id: "bas", look: "bas", x: RING.x, z: RING.z - 1.8, yaw: 0 },
      ] },
    { id: "spar", type: "fight", ...IH, wave: ["brannocSpar"], tokens: 1,
      tutorial: [
        { at: 0.5, text: "Brannoc doesn't dodge. He doesn't need to. Break his guard: posture damage, then a finisher." },
        { at: 12, text: "His Pledged Strike breaks guards. Don't block it: dodge it." },
      ],
      retry: "Up. Again. You stood longer that time." },
    { id: "after", type: "scene", node: "Ep21_AfterSpar", ...IH,
      rook: { x: RING.x - 1.4, z: RING.z, yaw: Math.PI / 2 },
      cast: [
        { id: "brannoc", look: "brannoc", x: RING.x + 1.4, z: RING.z, yaw: -Math.PI / 2 },
        { id: "bas", look: "bas", x: RING.x, z: RING.z - 1.8, yaw: 0 },
      ] },
    { id: "camp", type: "explore", ...IH,
      rook: { x: RING.x + 3, z: RING.z + 4, yaw: Math.PI / 2 },
      objective: "The camp, the day before the battle. Talk to the squad ({n}/{total}). Walk with **Brannoc**.",
      required: ["brannoc"],
      cast: [
        { id: "brannoc", look: "brannoc", x: 0, z: -31.6, yaw: Math.PI, node: "Ep21_BrannocTalk", again: "Ep21_BrannocAgain" },
        { id: "juno", look: "juno", x: -8, z: -30, yaw: 1.2, node: "Ep21_Juno" },
        { id: "tamsin", look: "tamsin", x: 4.5, z: -26.4, yaw: -0.6, node: "Ep21_Tamsin" },
        { id: "lio", look: "lio", x: 1.6, z: -23.4, yaw: 0, node: "Ep21_Lio" },
        { id: "dagrun", look: "dagrun", x: 8.4, z: -31, yaw: -1.4, node: "Ep21_Dagrun" },
        { id: "bas", look: "bas", x: RING.x, z: RING.z - 1.6, yaw: 0 },
      ] },
    { id: "horns", type: "scene", node: "Ep21_Horns", ...IH,
      rook: { x: -0.8, z: -24.4, yaw: 0 },
      cast: [{ id: "brannoc", look: "brannoc", x: 1.2, z: -23.6, yaw: -0.4 }] },
    { id: "preview", type: "preview", next: "Episode 22 · Ironsong", nextEpisode: "ep22",
      lines: [
        "Next time on UNWRITTEN:",
        "General Varka Ironsong rides her siege engine onto the field.",
        "The wall does not move.",
      ] },
  ],
};
