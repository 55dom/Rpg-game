// Episode 1 · The Tower of Choosing (GDD §14, Arc 1).

export const EP1_SCRIPT = `
title: Ep1_ColdOpen
---
<<fx fire>>
FIFTEEN YEARS AGO
A village burns at the edge of the map. Its name is Larkspur.
<<sfx cry>>
Somewhere in the smoke, an infant is crying.
<<fx silhouette>>
A thin figure walks out of the fire, carrying something small against its chest.
It doesn't look back.
<<fx clear>>
===

title: Ep1_Steps
---
FIFTEEN YEARS LATER
<<shot wide>>
Herald: Fifteen-year-olds of Liraen! Today the Tower reads you, and the book it gives you is your fate.
Herald: One at a time. Hands where the book can see them.
<<shot on Severin>>
A boy in a white coat walks to the front of the line. Nobody stops him.
Severin: Valcourt. I go first. I always go first.
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
<<shot on Moss>>
An old man sweeping the steps shuffles between you, broom first.
Moss: Feet up, both of you. These steps are older than your families.
Severin: Out of the way, sweeper.
Moss: Brother Moss. And no.
He sweeps around Severin's boots until Severin steps aside.
===

title: Ep1_Ceremony
---
<<shot wide>>
Inside, the grimoires drift in the Tower's light, waiting for their owners.
Herald: Severin Valcourt.
<<shot on Severin>>
<<fx book Severin>>
A tome descends into his hands. Seven clasps. The hall goes silent, then roars.
Herald: Seven clasps. The most pages given in a generation.
Severin: Of course.
<<shot on Herald>>
Herald: {name}, of Thornwick.
<<shot on Rook>>
<<fx book Rook>>
A book drops into your hands. It's thin. Too thin.
You open it. One page. The rest are scraped blank, right down to the paper.
<<sfx laugh>>
Someone laughs. Then everyone does.
Herald: ...One page. The Tower has spoken.
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
<<shot wide>>
<<sfx hymn>>
The great windows go dark. Somewhere above, people are singing.
<<shot on Acolyte>>
Acolyte: The Choir sings for the unwritten! Burn the books, and the chains burn with them!
Herald: Choir! Guard the candidates!
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
At the top of the steps, the broom has stopped moving.
<<set $EP1_ITS_YOU to 1>>
===
`;

const TOWER = { stage: "tower" };

export const EPISODE_1 = {
  id: "ep1",
  number: 1,
  title: "The Tower of Choosing",
  arc: "Arc 1 · The One-Page Mage",
  // What Rook can do this episode: one page, no ultimate, no squad yet.
  world: { companions: false, ultimate: false, pages: false, loadout: { Spell2: null, Spell3: null, Spell4: null } },
  beats: [
    { id: "coldopen", type: "coldopen", node: "Ep1_ColdOpen" },
    { id: "title", type: "title" },
    { id: "steps", type: "scene", node: "Ep1_Steps", ...TOWER,
      rook: { x: -1.2, z: -3, yaw: 0.4 },
      cast: [
        { id: "severin", look: "severin", x: 1.3, z: -1.2, yaw: Math.PI + 0.5 },
        { id: "herald", look: "herald", x: 0, z: 4.5, yaw: Math.PI },
        { id: "moss", look: "moss", x: 2.8, z: -3.6, yaw: -1.4 },
      ] },
    { id: "ceremony", type: "scene", node: "Ep1_Ceremony", ...TOWER,
      rook: { x: -1.4, z: 0.5, yaw: 0.2 },
      cast: [
        { id: "severin", look: "severin", x: 1.4, z: 1.6, yaw: Math.PI + 0.4 },
        { id: "herald", look: "herald", x: 0, z: 5, yaw: Math.PI },
        { id: "moss", look: "moss", x: -3.2, z: -1.8, yaw: 0.9 },
      ] },
    { id: "attack", type: "scene", node: "Ep1_Attack", ...TOWER,
      rook: { x: -1.4, z: 0.5, yaw: 0.2 },
      cast: [
        { id: "severin", look: "severin", x: 1.4, z: 1.6, yaw: Math.PI + 0.4 },
        { id: "herald", look: "herald", x: 0, z: 5, yaw: Math.PI },
        { id: "acolyte", look: "acolyte", x: 0.5, z: 8, yaw: Math.PI },
      ] },
    { id: "fight", type: "fight", ...TOWER, wave: ["acolyte", "acolyte", "acolyte"], tokens: 1,
      tutorial: [
        { at: 0.5, text: "{Light}: chain up to four slashes." },
        { at: 6, text: "Two slashes, then {Heavy}, launches them into the air." },
        { at: 12, text: "A red glint can't be blocked: {Dodge} through it. Tap {Block} as a hit lands to parry." },
        { at: 19, text: "{Spell1}: Gale Cutter, your one page. Sword hits refill your mana." },
        { at: 26, text: "Guard broken? {Heavy} finishes them: Lantern Break." },
      ],
      retry: "Get up. The steps are still yours." },
    { id: "hook", type: "scene", node: "Ep1_Hook", ...TOWER,
      rook: { x: 0, z: 0, yaw: 0 },
      cast: [
        { id: "acolyte", look: "acolyte", x: 0, z: 1.6, yaw: Math.PI, down: true },
        { id: "severin", look: "severin", x: 2.2, z: 0.8, yaw: -1.6 },
        { id: "moss", look: "moss", x: -1, z: 9, yaw: Math.PI },
      ] },
    { id: "preview", type: "preview", next: "Episode 2 · The Knight Exam",
      lines: [
        "Next time on UNWRITTEN:",
        "Seven squads. One exam. And every captain in Liraen says no.",
        "One page against seven clasps.",
      ] },
  ],
};
