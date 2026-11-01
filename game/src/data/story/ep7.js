// Episode 7 · Brass and Small Things (GDD §14 Arc 1; §15.5 S7, D2, D11; §28.4 V1). Squad life.
//
// The Royal Festival is two weeks off and the Lantern Lighthouse is decorating as if it had a reputation to lose: Juno's
// lantern strings, Bas and a banner, Tamsin and a song nobody can stop her singing. Cal on the step under the lantern room
// with a bag of hard sweets: a cheap brass key on a loop of string, "opens the snack cupboard" (the cupboard has no lock;
// S7). "Where did you learn doors?" "Somebody showed me a door once." And the subject changes (V1). "If you could die and
// come back stronger, would you?" (D11). A spar in the ring, and "Good soldier" (D2). That night, from the stairs: Lio at
// the table with Rook's grimoire open under a candle, whispering to it.

import { AFTER_EP6 } from "./arc12.js";

export const EP7_SCRIPT = `
title: Ep7_Prep
---
<<shot wide>>
Two weeks to the Royal Festival, and the Lantern Lighthouse is decorating as though anyone in the capital will come out this far to look at it.
<<shot on Dagrun>>
Dagrun: Every year. Every year they do this. Nobody comes.
<<shot on Tamsin>>
Tamsin: Somebody came once!
<<shot on Dagrun>>
Dagrun: He was lost, Tamsin.
<<shot on Dagrun>>
Dagrun: Go and help. All of you. I'll supervise. From this chair.
===

title: Ep7_Juno
---
<<shot on Juno>>
Juno: Hold this end. Higher. No, higher. These are lantern strings, they go up, that's what makes them lantern strings.
<<shot on Juno>>
Juno: …That's good. Leave it there. Don't touch it again.
===

title: Ep7_Bas
---
<<shot on Bas>>
Bas: The banner's stuck. I could pull harder but I'll pull the post out too, and then Dagrun will make a noise.
<<shot on Rook>>
You unhook it from the nail it's caught on. Bas looks at the nail as if it's betrayed him personally.
<<shot on Bas>>
Bas: Thank you. Captain Brannoc always said: think first, pull second. I always do it the other way round.
===

title: Ep7_Tamsin
---
<<shot on Tamsin>>
Tamsin: I'm practising for the Festival. There's a singing contest. I'm going to win it.
<<shot on Tamsin>>
She sings two lines. They are very loud and very brave and almost entirely in the wrong key.
-> "That was… brave."
    <<shot on Rook>>
    Rook: That was very brave.
    <<shot on Tamsin>>
    Tamsin: Thank you! That's the main thing, isn't it? Brave!
-> "Keep practising."
    <<shot on Rook>>
    Rook: Keep practising.
    <<shot on Tamsin>>
    Tamsin: I will! Every day! Right under your window!
===

title: Ep7_Cal
---
<<shot on Cal>>
Cal is on the step under the lantern room with a paper bag of hard sweets, not decorating anything.
<<shot on Cal>>
Cal: I'm supervising the supervisor. Somebody has to. Here. Catch.
<<shot on Rook>>
A small brass key on a loop of string. Cheap. Warm from his pocket.
<<shot on Cal>>
Cal: Opens the snack cupboard. Top shelf, behind the flour. Don't tell Bas, or there won't be a snack cupboard.
<<set $HAS_BRASS_KEY to 1>>
<<set $CLUE_S7 to 1>>
<<shot on Cal>>
Cal: Every squire gets something. It's tradition. I made it up just now, but it's tradition.
-> "Where did you learn doors?"
    <<set $ASKED_DOORS to 1>>
    <<shot on Rook>>
    Rook: Where did you learn doors? Nobody else in the kingdom can do what you do.
    <<shot on Cal>>
    Cal: Somebody showed me a door once.
    <<shot on Cal>>
    Cal: Anyway. Lemon or aniseed? The aniseed are terrible. Have an aniseed.
-> "Thank you, Cal."
    <<shot on Rook>>
    Rook: Thank you, Cal.
    <<shot on Cal>>
    Cal: Don't thank me. It's a key to a cupboard. Thank me when I give you something that matters.
<<shot on Cal>>
He looks up at the lantern room for a moment, at the light going round.
<<shot on Cal>>
Cal: Can I ask you something stupid? If you could die, and come back stronger. Would you?
<<set $CLUE_D11 to 1>>
-> "No. I'd want to stay me."
    <<set $DIE_ANSWER to "stay">>
    <<shot on Rook>>
    Rook: No. I'd want to stay me.
    <<shot on Cal>>
    Cal: Hm. That's a good answer. Most people don't give the good answer.
-> "Depends who'd be waiting."
    <<set $DIE_ANSWER to "waiting">>
    <<shot on Rook>>
    Rook: Depends who'd be waiting when I came back.
    <<shot on Cal>>
    For once he doesn't have anything quick to say.
    <<shot on Cal>>
    Cal: …Yeah. That's the trick of it, isn't it.
-> "Yes. Obviously."
    <<set $DIE_ANSWER to "yes">>
    <<shot on Rook>>
    Rook: Yes. Obviously. Stronger's stronger.
    <<shot on Cal>>
    Cal: Ha. Careful. That's what everyone says until they've done it.
<<shot on Cal>>
Cal: Come on. Ring. Show me your feet before Dagrun notices nobody's decorating.
===

title: Ep7_Ring
---
<<shot on Cal>>
Cal: Good soldier.
<<set $CLUE_D2 to 1>>
<<shot on Cal>>
Cal: You went left twice before I'd finished going left. That's new. Somebody's been watching my feet.
===

title: Ep7_Night
---
<<shot wide>>
Late. The Lighthouse is asleep. You come down the stairs for water, and stop, because there's a candle lit at the long table.
<<shot on Lio>>
Lio has your grimoire open in front of him. He isn't reading the page. He's reading under it, tilting the book to the candle, running a fingertip along the paper as if it had a grain.
<<shot on Lio>>
Lio: …There's something here. Scraped. Somebody scraped it.
-> Go down and ask him.
    <<set $LIO_CAUGHT to 1>>
    <<shot on Rook>>
    Rook: Lio?
    <<shot on Lio>>
    He nearly drops the candle.
    <<shot on Lio>>
    Lio: I couldn't sleep. Your book is… interesting. I'm sorry. I should have asked. I'll ask next time.
-> Go back up the stairs.
    <<set $LIO_CAUGHT to 0>>
    <<shot wide>>
    You go back up the stairs without a sound. Behind you, very quietly, he keeps turning the page that has nothing on it.
<<set $LIO_READ_NIGHT to 1>>
<<set $EP7_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, DAY = { sky: { daylight: 0.55 } }, NIGHT = { sky: { daylight: 0.06 } };

export const EPISODE_7 = {
  id: "ep7",
  number: 7,
  setup: { ...AFTER_EP6 },
  title: "Brass and Small Things",
  arc: "Arc 1 · The One-Page Mage",
  world: { companions: true, ultimate: true, pages: true },
  beats: [
    { id: "title", type: "title" },
    { id: "prep", type: "scene", node: "Ep7_Prep", ...LH, ...DAY,
      rook: { x: 2.0, z: 1.4, yaw: -0.6 },
      cast: [
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, pose: "sit" },
        { id: "tamsin", look: "tamsin", x: -1.0, z: 3.4, yaw: -1.6 },
        { id: "juno", look: "juno", x: 0.4, z: 4.6, yaw: -2.2 },
      ] },
    { id: "chores", type: "explore", ...LH, ...DAY,
      rook: { x: 2.0, z: 1.4, yaw: 0 },
      objective: "Festival prep. Help Juno, Bas and Tamsin, and find Cal ({n}/{total}).",
      required: ["juno", "bas", "tamsin", "cal"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: 2.6, z: -1.0, yaw: 0.4, node: "Ep7_Juno" },
        { id: "bas", look: "bas", x: -5.0, z: -1.6, yaw: 0.6, node: "Ep7_Bas" },
        { id: "tamsin", look: "tamsin", x: 2.6, z: 9.9, yaw: 0, node: "Ep7_Tamsin" },
        { id: "cal", look: "cal", x: -4.0, z: 9.7, yaw: Math.PI, pose: "sit", node: "Ep7_Cal" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, pose: "sit" },
      ] },
    { id: "ring", type: "fight", ...LH, ...DAY, wave: ["cal"], tokens: 1,
      tutorial: [{ at: 0.5, text: "A spar with Cal. His red glint can't be blocked: perfect-dodge it, then counter." }],
      lines: [["Cal", "Feet first. Then the blade."]],
      retryBy: "Cal", retry: "Up, soldier. Again." },
    { id: "ringAfter", type: "scene", node: "Ep7_Ring", ...LH, ...DAY,
      rook: { x: 0, z: -5.2, yaw: 0 },
      cast: [{ id: "cal", look: "cal", x: 0.2, z: -2.8, yaw: Math.PI }] },
    { id: "night", type: "scene", node: "Ep7_Night", ...LH, ...NIGHT,
      rook: { x: 1.6, z: 2.2, yaw: 0.8 },
      cast: [{ id: "lio", look: "lio", x: 6.55, z: 6.4, yaw: -Math.PI / 2, pose: "sit" }],
      set: { EP7_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep8",
      lines: [
        "Next time on UNWRITTEN: the end of Arc 1.",
        "The Choir breaks into the Tower of Choosing, and something old stands up.",
        "Rust remembers.",
      ] },
  ],
};
