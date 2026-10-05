// Episode 1 · The Tower of Choosing (GDD §14, Arc 1).

export const EP1_SCRIPT = `
title: Ep1_Steps
---
FIFTEEN YEARS LATER
<<shot wide>>
<<pose Herald raise>>
Herald: Fifteen-year-olds of Liraen! Today the Tower reads you, and the book it gives you is your fate.
<<pose Herald none>>
Herald: One at a time. Hands where the book can see them.
A boy in a white coat walks to the front of the line. Nobody stops him.
<<move Severin 0.6 -0.4 wait>>
<<shot on Severin>>
Severin: Valcourt. I go first. I always go first.
<<face Severin Rook>>
<<pose Severin cross>>
<<shot two Severin Rook>>
Severin: Thornwick mud on your boots. They let the border villages climb now?
-> "They let anyone climb. Even you." #bold
    Severin: Cute. Remember that line when you're holding an empty book.
    <<set $SEVERIN_RILED to 1>>
-> "I walked three days to get here. I'm not moving." #earnest
    Severin: Then stand there. The view from the back suits you.
-> "It's not mud. It's a fashion statement." #wry
    Severin: ...Thornwick has fashion?
    He almost smiles. Then he remembers who he is.
<<pose Severin none>>
<<move Moss 0.9 -2.3 wait>>
<<shot on Moss>>
An old man sweeping the steps shuffles between you, broom first.
Moss: Feet up, both of you. These steps are older than your families.
Severin: Out of the way, sweeper.
Moss: Brother Moss. And no.
<<move Severin 2.2 0.4>>
He sweeps around Severin's boots until Severin steps aside.
===

title: Ep1_Ceremony
---
<<shot wide side>>
Inside, the grimoires drift in the Tower's light, waiting for their owners.
Herald: Severin Valcourt.
<<move Severin 0.9 3.4 wait>>
<<face Severin Herald>>
<<shot on Severin>>
<<fx book Severin>>
A tome descends into his hands. Seven clasps. The hall goes silent, then roars.
Herald: Seven clasps. The most pages given in a generation.
Severin: Of course.
<<move Severin 1.8 1.4>>
<<shot on Herald>>
Herald: {name}, of Thornwick.
<<move Rook -0.5 3.4 wait>>
<<face Rook Herald>>
<<shot on Rook>>
<<fx book Rook>>
A book drops into your hands. It's thin. Too thin.
You open it. One page. The rest are scraped blank, right down to the paper.
<<sfx laugh>>
Someone laughs. Then everyone does.
Herald: ...One page. The Tower has spoken.
<<face Severin Rook>>
<<face Rook Severin>>
<<shot two Severin Rook>>
Severin: One page. Don't worry, Thornwick. Nobody will ask you to read aloud.
-> Snap the book shut and stare him down. #bold
    Severin: Careful. You'll strain the binding.
-> Run your thumb over the blank pages. They don't feel empty. #earnest
-> "Less to carry." #wry
    Crowd: (laughter, a little kinder this time)
<<shot on Moss>>
Behind you, the broom stops.
Moss: Some books are better read twice.
Rook: What's that supposed to mean?
But Brother Moss is already sweeping somewhere else.
<<set $MET_MOSS to 1>>
===

title: Ep1_Attack
---
<<shot wide side>>
<<cue dark>>
<<sfx hymn>>
The great windows go dark. Somewhere above, people are singing.
<<show Acolyte>>
<<move Acolyte -2.6 6.4>>
<<pose Acolyte raise>>
<<shot on Acolyte>>
Acolyte: The Choir sings for the unwritten! Burn the books, and the chains burn with them!
<<pose Herald raise>>
Herald: Choir! Guard the candidates!
<<face Severin Rook>>
<<face Rook Severin>>
<<shot two Severin Rook>>
Severin: Stay behind me, Thornwick. One page won't stop a blade.
-> "Then I'll use the blade." #bold
-> "We'll both stay alive. Deal?" #earnest
    Severin: I don't make deals with the back of the line.
-> "Behind you? Bold of you to assume you're in front." #wry
Severin: Fine. The door is mine. Don't die where I can see it.
===

title: Ep1_Hook
---
<<shot on Acolyte>>
The last acolyte goes down at your feet. His mask has cracked.
His eyes find your grimoire, still open to its one page.
Acolyte: ...It's you.
He doesn't say anything else.
<<shot two Severin Rook>>
Severin: What did he mean, "it's you"?
-> "I have no idea." #earnest
-> "He's confused. I'm very forgettable." #wry
-> "Ask him yourself." #bold
    Severin: ...That isn't funny.
Severin: Whatever this is, stay out of my way at the Exam.
<<shot on Moss>>
Across the hall, the broom has stopped moving.
<<set $EP1_ITS_YOU to 1>>
===
`;

const STEPS = { stage: "towerSteps" }, HALL = { stage: "towerHall" };

export const EPISODE_1 = {
  id: "ep1",
  number: 1,
  title: "The Tower of Choosing",
  arc: "Arc 1 · The One-Page Mage",
  // What Rook can do this episode: one page, no ultimate, no squad yet.
  world: { companions: false, ultimate: false, pages: false, loadout: { Spell2: null, Spell3: null, Spell4: null } },
  beats: [
    { id: "coldopen", type: "cutscene", cutscene: "ep1_larkspur" },
    { id: "title", type: "title" },
    { id: "steps", type: "scene", node: "Ep1_Steps", ...STEPS,
      rook: { x: -1.2, z: -2.6, yaw: 0.4 },
      cast: [
        { id: "severin", look: "severin", x: 2.6, z: -2.4, yaw: -0.6 },
        { id: "herald", look: "herald", x: 0, z: 5.4, yaw: Math.PI },
        { id: "moss", look: "moss", x: 4.6, z: -4.4, yaw: -1.4 },
      ] },
    { id: "ceremony", type: "scene", node: "Ep1_Ceremony", ...HALL,
      rook: { x: -1.4, z: 0.5, yaw: 0.2 },
      cast: [
        { id: "severin", look: "severin", x: 1.6, z: 1.2, yaw: -0.2 },
        { id: "herald", look: "herald", x: 0, z: 5.4, yaw: Math.PI },
        { id: "moss", look: "moss", x: -3.4, z: -1.6, yaw: 0.9 },
      ] },
    { id: "attack", type: "scene", node: "Ep1_Attack", ...HALL,
      rook: { x: -0.5, z: 3, yaw: 0.2 },
      cast: [
        { id: "severin", look: "severin", x: 1.8, z: 1.4, yaw: -0.4 },
        { id: "herald", look: "herald", x: 0, z: 5.4, yaw: Math.PI },
        { id: "acolyte", look: "acolyte", x: -6.5, z: 11, yaw: 2.6, hidden: true },
      ] },
    { id: "fight", type: "fight", ...HALL, wave: ["acolyte", "acolyte", "acolyte"], tokens: 1,
      tutorial: [
        { at: 0.5, text: "{Light}: chain up to four slashes." },
        { at: 6, text: "Two slashes, then {Heavy}, launches them into the air." },
        { at: 12, text: "A red glint can't be blocked: {Dodge} through it. Tap {Block} as a hit lands to parry." },
        { at: 19, text: "{Spell1}: Gale Cutter, your one page. Sword hits refill your mana." },
        { at: 26, text: "Guard broken? {Heavy} finishes them: Lantern Break." },
      ],
      retry: "Get up. The steps are still yours." },
    { id: "hook", type: "scene", node: "Ep1_Hook", ...HALL,
      rook: { x: 0, z: 0, yaw: 0 },
      cast: [
        { id: "acolyte", look: "acolyte", x: 0, z: 1.6, yaw: Math.PI, down: true },
        { id: "severin", look: "severin", x: 2.2, z: 0.8, yaw: -1.6 },
        { id: "moss", look: "moss", x: -5, z: 8, yaw: 2.6 },
      ] },
    { id: "preview", type: "preview", next: "Episode 2 · The Knight Exam",
      lines: [
        "Next time on UNWRITTEN:",
        "Seven squads. One exam. And every captain in Liraen says no.",
        "One page against seven clasps.",
      ] },
  ],
};
