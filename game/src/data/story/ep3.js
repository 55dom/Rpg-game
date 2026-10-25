// Episode 3 · The Lighthouse with No Sea (GDD §14, Arc 1). The squad-life episode.

export const EP3_SCRIPT = `
title: Ep3_Arrive
---
THE LANTERN LIGHTHOUSE
<<shot wide>>
A lighthouse stands on a cliff above a sea that dried up a hundred years ago. Its lamp still turns.
<<shot two Dagrun Rook>>
Dagrun: Welcome to the Lighthouse. The sea left. We stayed.
Dagrun: Nobody else wanted it. That's sort of our whole thing.
<<move Cal -4 9.4 wait>>
<<pose Cal raise>>
<<shot on Cal>>
Cal: Mind the step. It's been loose since before the sea dried up.
<<pose Cal none>>
<<move Cal -1.2 7.4 wait>>
<<face Cal Rook>>
<<shot two Cal Rook>>
Cal: Calder Wynn. Vice captain. Cal, unless you're in trouble.
Cal: Go say hello to everyone. Then meet me at the training ring. I want to see how you move.
-> "Yes, sir." #earnest
    Cal: "Sir." Oh, I like that. Nobody here calls me sir.
-> "Is this a test?" #wry
    Cal: Everything's a test. Most of them you pass by showing up.
-> "I'll beat you." #bold
    Cal: Ha. Bring that energy to the ring.
<<move Dagrun -7 6>>
Dagrun: I'll be... supervising. From this chair.
===

title: Ep3_Juno
---
<<pose Juno cross>>
Juno: So you're the one-pager. Juno. Thread magic. I'll be the one patching your holes.
-> "Nice to meet you." #earnest
    Juno: Don't. I've seen your exam. You fight like you're angry at the floor.
-> "I'll try not to need patching." #wry
    Juno: Everybody needs patching. You'll just need more.
-> "You'll see what one page can do." #bold
    Juno: I saw. That's the problem.
<<pose Juno none>>
Juno: Cal says you're "promising." Cal says that about stray cats.
===

title: Ep3_Juno_Again
---
Juno: Still here? The ring's that way. Cal hates waiting. He pretends he doesn't.
===

title: Ep3_Bas
---
Bas: Oh! Hello. I'm Bastion. Bas. Stone magic.
Bas: I was a miner before. Captain Brannoc of the Iron Wardens taught me to fight. Then he told me to come here.
-> "Why here?" #earnest
    Bas: He said the Lanterns need a wall more than the Wardens do. I think he meant it kindly.
-> "You're huge." #wry
    Bas: Mm. My mother says I was a large baby. She says it a lot.
-> "Want to spar sometime?" #bold
    Bas: I'd like that. I'll go gently. You'll see.
Bas: Welcome to the squad, {name}. It's a good one. It's just last.
===

title: Ep3_Bas_Again
---
Bas: Cal's waiting at the ring. Watch his feet. That's what Captain Brannoc always said: watch the feet.
===

title: Ep3_Lio
---
Lio is sitting on the step by the door, a book open on his knees.
Lio: Lio Varnish. Archivist. I keep the squad's records. And the library, such as it is.
Lio: May I see your grimoire?
-> Hand it over. #earnest
    He turns the blank pages slowly. Very slowly.
    Lio: ...Hm. Thank you.
    <<set $LIO_SAW_GRIMOIRE to 1>>
-> "Why?" #wry
    Lio: I like books. That's all.
-> Keep it. #bold
    Lio: Of course. It's yours.
Lio: Mind the step. It's loose.
===

title: Ep3_Lio_Again
---
Lio: The library's on the second floor, if you ever want it. Nobody else reads.
===

title: Ep3_Tamsin
---
<<pose Tamsin raise>>
Tamsin: You're the one-pager! I watched the whole exam. You got up! Everyone was laughing and you got up!
<<pose Tamsin none>>
Tamsin: Tamsin Reed. Bard. Resonance magic. I mostly support. From very far away.
-> "Thanks, Tamsin." #earnest
    Tamsin: Don't thank me! I'm going to write a song about it.
-> "Far away?" #wry
    Tamsin: Far, far away. Behind something. Ideally a wall. Ideally Bas.
-> "Write me a song." #bold
    Tamsin: Already started! It doesn't rhyme yet. Nothing rhymes with "grimoire."
===

title: Ep3_Tamsin_Again
---
Tamsin: "Our hero got up, though the crowd said to stay..." No. Too long. I'll fix it.
===

title: Ep3_Dagrun
---
Dagrun is asleep in a chair, a newspaper over his face.
Dagrun: ...Not asleep. Supervising.
Dagrun: Go find Cal, kid.
===

title: Ep3_Cal
---
<<pose Cal point>>
Cal: There you are. First lesson: the one that keeps you alive.
<<pose Cal none>>
Cal: I'm going to swing at you. Don't block the red ones. Dodge them, right as they land.
Cal: Ready?
-> "Ready." #earnest
-> "Born ready." #bold
-> "Define 'ready.'" #wry
    Cal: Too late. We're starting.
===

title: Ep3_Doors
---
<<shot two Cal Rook>>
Cal: Not bad. You got the timing on the third try. Most people take a week.
<<shot on Cal>>
Cal: Want to see my magic? It's not very loud.
<<fx door Cal>>
A frame of golden light opens in the air in front of him, like a doorway into nowhere.
Cal: Threshold. I open doors. Between here and there.
Cal: One rule. A door I open, I can only close from the other side.
Cal: So don't make me close one, kid.
-> "What's on the other side?" #earnest
    Cal: Usually? Wherever I was going. Usually.
-> "That sounds like a terrible rule." #wry
    Cal: It's a great rule. It keeps me honest.
-> "Teach me." #bold
    Cal: Ha. Get your own magic. Yours is more interesting anyway.
<<shot two Cal Rook>>
Cal: Dinner. Come on. I'm cooking, which means it'll be edible.
===

title: Ep3_Dinner
---
<<cue night>>
<<shot wide>>
Night falls on the dry sea. The squad eats at the long table under strings of little lights.
<<sfx whistle>>
Cal whistles while he cooks. Four notes, over and over.
<<shot on Tamsin>>
Tamsin: What's that tune, Cal? You always whistle it.
<<shot on Cal>>
Cal: That? No idea. It was stuck in my head when I woke up one day. Never left.
<<shot on Juno>>
Juno: It's been stuck in all our heads for six years.
<<shot on Bas>>
Bas: I like it.
<<shot on Dagrun>>
<<pose Dagrun point>>
Dagrun: The lanterns. On the rack by the door. One for every Lantern Knight.
<<pose Dagrun none>>
Dagrun: A Lantern goes out when the knight dies. Or when their mana can't find its way home.
<<shot on Juno>>
Juno: Cheerful.
<<shot on Cal>>
Cal: Dying's overrated. Did it once, didn't care for it.
<<shot on Tamsin>>
Tamsin: Ha! Cal!
Everyone laughs. Even Juno, a little.
<<shot on Dagrun>>
Dagrun: Kid. Go light yours.
<<cue lantern>>
<<sfx surgeFull>>
<<shot on Rook>>
The newest lantern on the rack catches, and burns steady.
-> "...Thanks, Captain." #earnest
-> "It's the brightest one, right?" #wry
    Juno: It is not.
-> "I won't let it go out." #bold
    Dagrun: Good. They're a pain to relight.
<<set $LANTERN_LIT to 1>>
<<shot on Lio>>
Across the table, Lio is watching your grimoire. He looks away when you notice.
===
`;

const LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 };

export const EPISODE_3 = {
  id: "ep3",
  number: 3,
  title: "The Lighthouse with No Sea",
  arc: "Arc 1 · The One-Page Mage",
  world: { companions: false, ultimate: false, pages: false, loadout: { Spell2: null, Spell3: null, Spell4: null } },
  beats: [
    { id: "title", type: "title" },
    { id: "arrive", type: "scene", node: "Ep3_Arrive", ...LH,
      rook: { x: 0.4, z: 4.6, yaw: Math.PI * 0.85 },
      cast: [
        { id: "dagrun", look: "dagrun", x: -1.4, z: 3.4, yaw: 0.6 },
        { id: "cal", look: "cal", x: -3.4, z: 8.6, yaw: 2.6 },
      ] },
    { id: "meet", type: "explore", ...LH,
      rook: { x: -0.6, z: 6, yaw: Math.PI },
      objective: "Meet the squad ({n}/{total}). Then find **Cal** at the training ring.",
      required: ["cal"],
      cast: [
        { id: "juno", look: "juno", x: TABLE.x - 1.4, z: TABLE.z - 1, yaw: -1.4, node: "Ep3_Juno", again: "Ep3_Juno_Again" },
        { id: "tamsin", look: "tamsin", x: TABLE.x + 1.4, z: TABLE.z + 1.2, yaw: -1.6, node: "Ep3_Tamsin", again: "Ep3_Tamsin_Again" },
        { id: "bas", look: "bas", x: -5.6, z: -2.6, yaw: 0.6, node: "Ep3_Bas", again: "Ep3_Bas_Again" },
        { id: "lio", look: "lio", x: -2.6, z: 9.6, yaw: Math.PI * 0.9, node: "Ep3_Lio", again: "Ep3_Lio_Again" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "Ep3_Dagrun", again: "Ep3_Dagrun" },
        { id: "cal", look: "cal", x: 1.6, z: -3.4, yaw: -0.6, node: "Ep3_Cal" },
      ] },
    { id: "spar", type: "fight", ...LH, wave: ["cal"], tokens: 1,
      tutorial: [
        { at: 0.5, text: "Cal's red glint can't be blocked. Press {Dodge} just as it lands: a perfect dodge slows the world." },
        { at: 10, text: "After a perfect dodge, press {Light} to counter." },
        { at: 20, text: "Tap {Block} right before a normal cut lands to parry it." },
      ],
      retry: "Again. You're closer than you think." },
    { id: "doors", type: "scene", node: "Ep3_Doors", ...LH,
      rook: { x: 0, z: -5.6, yaw: 0 },
      cast: [{ id: "cal", look: "cal", x: 0, z: -3, yaw: Math.PI }] },
    { id: "dinner", type: "scene", node: "Ep3_Dinner", ...LH,
      rook: { x: TABLE.x - 1.35, z: TABLE.z + 1.6, yaw: Math.PI / 2 },
      cast: [
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "lio", look: "lio", x: TABLE.x - 1.35, z: TABLE.z - 1.9, yaw: Math.PI / 2 },
        { id: "tamsin", look: "tamsin", x: TABLE.x + 1.35, z: TABLE.z + 1.6, yaw: -Math.PI / 2 },
        { id: "bas", look: "bas", x: TABLE.x + 1.35, z: TABLE.z - 0.2, yaw: -Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x, z: TABLE.z - 3.4, yaw: 0 },
        { id: "cal", look: "cal", x: TABLE.x + 2.4, z: TABLE.z + 2.3, yaw: Math.PI },
      ] },
    { id: "preview", type: "preview", next: "Episode 4 · The Village That Wasn't There", nextEpisode: "ep4",
      lines: [
        "Next time on UNWRITTEN:",
        "The squad's first mission: a village that isn't on any map.",
        "Something big is waiting in the Greywater Fens.",
      ] },
  ],
};
