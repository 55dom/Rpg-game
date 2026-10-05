// Episode 2 · The Knight Exam (GDD §14, Arc 1; Boss 1 in §16).

export const EP2_SCRIPT = `
title: Ep2_Arrive
---
THE KNIGHT EXAM
<<shot wide>>
<<cue cheer>>
The stands are full. Every squad in Liraen has come to watch the new candidates bleed.
<<pose Proctor raise>>
Proctor: Candidates! Two trials. Survive the pack. Then face one another.
<<pose Proctor none>>
Proctor: The captains are watching. Impress one of them, or go home.
<<face Severin Rook>>
<<shot two Severin Rook>>
<<if $SEVERIN_RILED>>
    Severin: "They let anyone climb." I remembered your line, Thornwick. I've been looking forward to this.
<<else>>
    Severin: Still here, Thornwick? I thought the one page would have sent you home.
<<endif>>
-> "Nobody's sending me home." #bold
    Severin: Then I'll walk you to the gate myself.
-> "Good luck out there. I mean it." #earnest
    Severin: ...Keep your luck. You'll need all of it.
-> "I came for the free lunch." #wry
    Severin: There is no free lunch.
    Severin: ...Is there?
<<move Severin 3 3>>
===

title: Ep2_Box
---
<<shot wide>>
Up in the captains' box, the squad captains sit under seven banners.
<<shot on Corvina>>
Corvina: Valcourt's boy. Seven clasps. The Lances have already drawn up his papers.
<<shot on Brannoc>>
Brannoc: Papers don't hold a wall. We'll see what he does when he's bleeding.
<<shot on Dagrun>>
One captain is asleep, his boots on the railing.
<<shot on Cal>>
<<pose Cal point>>
Cal: That one. The one-pager from Thornwick.
<<pose Cal none>>
<<face Dagrun Cal>>
Dagrun: Mm. What about them.
<<shot two Cal Dagrun>>
Cal: Bet you a week of dishes they get knocked flat and get up three times.
Dagrun: ...Before the kid's even fought?
Cal: Especially before.
<<pose Dagrun cross>>
Dagrun: You're on. I hate dishes.
===

title: Ep2_Draw
---
<<shot wide>>
<<cue cheer>>
Proctor: The pack is down. Final trial: the duel.
<<pose Proctor raise>>
Proctor: Severin Valcourt. And {name} of Thornwick.
<<pose Proctor none>>
The stands erupt. Somebody is already taking bets.
<<move Severin 0 2.4 wait>>
<<face Severin Rook>>
<<face Rook Severin>>
<<shot two Severin Rook>>
Severin: I'll make it quick. Stay down when you fall.
-> "I don't stay down." #bold
    Severin: We'll see.
-> "Let's both fight our best." #earnest
    Severin: That's the problem. Mine is better.
-> "You first." #wry
<<shot on Severin>>
<<pose Severin point>>
Severin: Polaris. Watch closely, Thornwick. This is what seven clasps look like.
===

title: Ep2_After
---
<<if $EXAM_DUEL_WON>>
    <<shot wide>>
    <<cue cheer>>
    The stands go silent. Then they explode.
    <<shot on Severin>>
    Severin is on one knee in the sand, his tome open, its pages dark.
    Severin: ...That isn't possible. One page.
    <<shot two Severin Rook>>
    -> Offer him a hand. #earnest
        He stares at your hand for a long moment. Then he gets up on his own.
        <<set $SEVERIN_HAND_OFFERED to 1>>
    -> "Lucky page." #wry
        Severin: Don't.
    -> "Stay down when you fall." #bold
        Severin: ...You'll regret that.
    Severin: This doesn't change anything. Remember that.
<<else>>
    <<shot wide>>
    You hit the sand for the last time. The stands are laughing.
    <<shot on Severin>>
    Severin: Stay down, Thornwick. I asked you nicely.
    <<shot on Rook>>
    -> Try to stand anyway. #bold
        Your legs don't listen. Your hands do. You get one knee under you.
    -> "...Good fight." #earnest
        Severin: It wasn't a fight.
    -> "I was just resting my eyes." #wry
    Severin: You got up {$EXAM_GET_UPS} times. Why?
    He doesn't wait for an answer.
<<endif>>
===

title: Ep2_Draft
---
<<shot wide>>
Proctor: Captains! Make your choices.
<<shot on Corvina>>
Corvina: The Gilded Lances take Severin Valcourt.
<<shot on Severin>>
Severin doesn't even look surprised.
<<shot on Rook>>
Proctor: {name} of Thornwick?
<<shot on Brannoc>>
Brannoc: Good feet. Not enough pages. Not this year.
<<shot on Ysolde>>
Ysolde: The Riders need fliers. Pass.
Proctor: ...Any squad? Any squad at all?
Nobody answers. Somewhere in the stands, someone laughs.
<<shot on Dagrun>>
A long, loud yawn comes from the captains' box.
<<pose Dagrun raise>>
Dagrun: I'll take the one-pager.
<<pose Dagrun none>>
Corvina: The Lanterns? Dagrun, your squad is ranked last.
Dagrun: Exactly. Nobody's written our story. A one-page grimoire means nobody's written theirs either.
<<shot on Cal>>
<<if $EXAM_DUEL_WON>>
    Cal: Told you. Didn't even need the three.
    Cal: Good soldier.
<<elseif $EXAM_GET_UPS >= 3>>
    Cal: Three times. Pay up, Captain.
    Dagrun: ...I hate dishes.
<<else>>
    Cal: Not three. But I liked the way they got up.
<<endif>>
<<shot on Rook>>
-> "The Last Lanterns. I'll take it." #earnest
-> "Last place? Perfect. Nowhere to go but up." #wry
-> "Watch me climb." #bold
<<set $JOINED_LANTERNS to 1>>
===
`;

const ARENA = { stage: "examGrounds" };
const BOX_Y = 2.4, BOX_Z = 21; // matches the captains' box in runtime/sets.js

export const EPISODE_2 = {
  id: "ep2",
  number: 2,
  title: "The Knight Exam",
  arc: "Arc 1 · The One-Page Mage",
  world: { companions: false, ultimate: false, pages: false, loadout: { Spell2: null, Spell3: null, Spell4: null } },
  beats: [
    { id: "title", type: "title" },
    { id: "arrive", type: "scene", node: "Ep2_Arrive", ...ARENA,
      rook: { x: -1.2, z: -3, yaw: 0.3 },
      cast: [
        { id: "severin", look: "severin", x: 1.4, z: -1.4, yaw: -1.2 },
        { id: "proctor", look: "herald", x: 0, z: 4, yaw: Math.PI },
      ] },
    { id: "box", type: "scene", node: "Ep2_Box", ...ARENA, rook: null,
      cast: [
        { id: "corvina", look: "corvina", x: -3.6, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
        { id: "brannoc", look: "brannoc", x: -1.8, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
        { id: "dagrun", look: "dagrun", x: 0.4, y: BOX_Y, z: BOX_Z - 0.4, yaw: Math.PI + 0.3 },
        { id: "cal", look: "cal", x: 1.9, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
        { id: "ysolde", look: "ysolde", x: 3.7, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
      ] },
    { id: "trial", type: "fight", ...ARENA, wave: ["hound", "hound", "hound"], tokens: 2,
      tutorial: [
        { at: 0.5, text: "Trial of the Pack. Hounds lunge from range: press {Dodge} to dodge the lunge." },
        { at: 8, text: "Dodge right as a bite lands: a perfect dodge slows the world. {Light} to counter." },
        { at: 16, text: "Tap {Block} just before a hit to parry, then {Light} to counter." },
      ],
      retry: "Again. The pack doesn't wait." },
    { id: "draw", type: "scene", node: "Ep2_Draw", ...ARENA,
      rook: { x: 0, z: -2.4, yaw: 0 },
      cast: [
        { id: "severin", look: "severin", x: 2.6, z: 2, yaw: -1.4 },
        { id: "proctor", look: "herald", x: 0, z: 6, yaw: Math.PI },
      ] },
    { id: "duel", type: "fight", ...ARENA, wave: ["severin"],
      getUps: 3, countFlag: "EXAM_GET_UPS",
      getUpLines: [["Cal", "That's one."], ["Dagrun", "...That's two."], ["Severin", "Stay down!"]],
      setWin: { EXAM_DUEL_WON: 1 }, setLose: { EXAM_DUEL_WON: 0 },
      tutorial: [
        { at: 0.5, text: "Star Needles fly in threes. Press {Dodge} to dodge sideways, or slash them out of the air." },
        { at: 9, text: "He's quick at range. Close the distance and press him." },
      ],
      eventHints: {
        starsPlaced: "He's on his Polaris point. When the lines glow red, press {Jump} to leap over them.",
        starsDim: "Knocked off Polaris, his stars go dark. Hit hard while he reels!",
        playerRevive: "Get up. Everyone's watching.",
      } },
    { id: "after", type: "scene", node: "Ep2_After", ...ARENA,
      rook: { x: 0, z: -1.6, yaw: 0 },
      cast: [{ id: "severin", look: "severin", x: 0, z: 1.2, yaw: Math.PI }] },
    { id: "draft", type: "scene", node: "Ep2_Draft", ...ARENA,
      rook: { x: 0.6, z: 13, yaw: 0 },
      cast: [
        { id: "severin", look: "severin", x: -1.6, z: 13.4, yaw: 0.2 },
        { id: "proctor", look: "herald", x: 3.2, z: 14, yaw: -1.2 },
        { id: "corvina", look: "corvina", x: -3.6, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
        { id: "brannoc", look: "brannoc", x: -1.8, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
        { id: "dagrun", look: "dagrun", x: 0.4, y: BOX_Y, z: BOX_Z - 0.4, yaw: Math.PI },
        { id: "cal", look: "cal", x: 1.9, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
        { id: "ysolde", look: "ysolde", x: 3.7, y: BOX_Y, z: BOX_Z - 0.6, yaw: Math.PI },
      ] },
    { id: "preview", type: "preview", next: "Episode 3 · The Lighthouse with No Sea", nextEpisode: "ep3",
      lines: [
        "Next time on UNWRITTEN:",
        "A lighthouse beside a sea that dried up a hundred years ago.",
        "A squad that's ranked dead last. And a vice captain who opens doors.",
      ] },
  ],
};
