// Episode 56 · Second Reading (GDD §2 Brother Moss, §8.6, §14 Arc 6 "Brother Moss's truth"; Phase 7 Step 3, §23.6).
//
// The Tower of Choosing, out of season. Brother Moss, sweeping. Tea first: always tea first. Then the truth he's swept
// round for fifteen years. He is three hundred years old, the last Keeper of the Scribe's books. The First Grimoire lay
// sealed under the Tower's floor all that time, and on the night Larkspur burned it turned its own pages. Days later a
// boy who didn't speak left an infant on a step in Thornwick, and the ledgers took the child's name that day, and not a
// line before: nothing had ever been written for them, not even a blank. The book wanted the child. Books don't want.
// This one did. So he scraped it bare, all but one page, and at the ceremony handed it to the one it wanted, and said
// some books are better read twice. (Rook is never shown a star; that waits for the Rite.)
//
// The sealed floor opens for him and the Scribe's keepers test the book in Rook's hands. Under it, the strip of vellum
// he cut from the first page and kept: "Let what is written be read. Let what is unwritten write." And what he knows
// of the third stage: twice a clause has cost Rook something. The last one won't, because it won't be a trade.
// That night Lio reads Dagrun's margin, on the step: "He took me in when nobody would. Of all of them, he's the one I
// can't look at."

import { AFTER_EP55 } from "./arcs.js";

export const EP56_SCRIPT = `
title: Ep56_Kettle
---
<<shot on Rook>>
Brother Moss's kettle, on a little iron stove behind a pillar, where no ceremony guest would ever see it. There's a cup beside it, and a second cup, as if he's been expecting somebody for a very long time.
===

title: Ep56_Mural
---
<<shot on Rook>>
The murals of the Scribe, up the north wall: a figure with no face, writing, and under the pen the world coming into being a line at a time. Rivers. Towns. People, each with their book.
<<shot on Rook>>
At the very bottom, where the plaster's newest, somebody has painted over a space the size of a child. Carefully, so it matches. You'd never see it unless you were looking.
===

title: Ep56_Tea
---
<<shot on Moss>>
Moss: Tea first. Always tea first. Then you can ask me whatever it is you've walked all the way up here to ask.
<<shot on Moss>>
Moss: And if you didn't bring the kettle, there's no use asking. I don't remember things without tea. I'm very old.
===

title: Ep56_Truth
---
<<shot wide>>
Brother Moss sits on the dais steps with his cup in both hands, and you sit beside him. Severin stands, because he was raised to.
<<shot on Moss>>
Moss: You want to know what you are. Everybody who comes up these steps wants that. You're the first who's ever had a right to ask me.
<<shot on Moss>>
Moss: I'm the last Keeper of the Scribe's books. There were nine of us, once. I've swept these steps for three hundred years, give or take a winter.
<<shot on Severin>>
Severin: Three hundred—
<<shot on Moss>>
Moss: Keepers keep. Including themselves, it turns out.
<<shot on Moss>>
Moss: Under this floor lay the First Grimoire. The Scribe's own. Every book the Tower has ever handed out is a copy of a copy of a page of it. It was sealed when I was young, because it doesn't describe things. It writes them.
<<shot on Moss>>
Moss: Fifteen years ago, on the night Larkspur burned, it turned its own pages. I was sweeping. I heard it through the stone.
<<shot on Moss>>
Moss: A few days later a boy who didn't speak left an infant on the orphanage step in Thornwick. The keeper wrote it in her ledger. And the Tower's ledgers, which take every name in the kingdom, took yours that same day.
<<shot on Moss>>
Moss: Not a line before. I looked. I've read those ledgers for three hundred years. The world writes everyone a little: a place, a weight, a line in the margin. Nothing was ever written for you. Not even a blank.
<<shot on Rook>>
For a while the only sound is the broom, leaning on the step, sliding an inch on the marble.
<<shot on Moss>>
Moss: The book wanted you. Books don't want. This one did. And if it wanted you, then the Choir would want it, and the Crown would want you, and you'd never be anybody's but theirs.
<<shot on Moss>>
Moss: So I scraped it bare. All of it but one page, so you'd pass for ordinary. The one-page mage. And at your ceremony I handed you the book it had been all along, and said what I said.
<<shot on Rook>>
-> "Some books are better read twice."
    <<set $MOSS_ANSWER to "twice">>
    <<shot on Rook>>
    Rook: "Some books are better read twice."
    <<shot on Moss>>
    Moss: You remembered. Good. I wasn't sure it was a good line. I'd been practising it for fifteen years.
-> "You erased me."
    <<set $MOSS_ANSWER to "erased">>
    <<shot on Rook>>
    Rook: You erased me. Everything I could have been. One page.
    <<shot on Moss>>
    Moss: I erased the book, child. You were never in it. That's rather the point.
-> "Why tell me now?"
    <<set $MOSS_ANSWER to "now">>
    <<shot on Rook>>
    Rook: Why now? Fifteen years, and you tell me now.
    <<shot on Moss>>
    Moss: Because you're going somewhere I can't sweep.
<<shot on Moss>>
Moss: The boy who carried you. I saw him once more, years after, at the Tower door. He had a grimoire by then. A forged one. Very good work.
<<shot on Moss>>
Moss: He stood in front of the Scribe's murals for an hour. Then he asked me whether the Scribe wrote the rules or only read them.
<<shot on Severin>>
Severin: What did you tell him?
<<shot on Moss>>
Moss: That I'd swept too long to know. He laughed. It was not a nice laugh, and it was not an unkind one. I've thought about it since.
<<set $MOSS_TRUTH to 1>>
<<shot on Moss>>
Moss: Come. There's a floor under this floor, and it hasn't opened for anyone but me in three centuries. Let's see if it knows whose book that is.
<<cue scribeFloor>>
<<set $SCRIBE_FLOOR to 1>>
===

title: Ep56_Floor
---
<<shot wide>>
The keepers fold back into the walls, one gear at a time. The ring of script round the dais burns steady now, and in the middle of it the stone has opened like a book.
<<shot on Moss>>
Moss: There. They'd only stop for the book's own hand. I did wonder.
<<shot on Moss>>
He takes a strip of vellum from inside his sleeve, thin as a moth's wing, written in a hand older than the Tower.
<<shot on Moss>>
Moss: The first line of the first page. I cut it off before I scraped the rest. I couldn't bring myself to scrape that one. Keepers keep.
<<shot on Rook>>
You read it. The letters are the under-text's, the pale script that came up out of Mirrorlake, and you can read them, the way you read your own name.
<<shot on Rook>>
"Let what is written be read. Let what is unwritten write."
<<set $PALIMPSEST_LINE to 1>>
<<shot on Moss>>
Moss: Twice now you've written on the world. Each time it cost you. Ink, and the fall, and three seconds of your life read backwards.
<<shot on Moss>>
Moss: There's a third reading. It won't cost you anything, because it won't be a trade. When you get there, somebody will try to tell you the price. Don't listen. There isn't one.
<<shot on Severin>>
Severin: How do you know that?
<<shot on Moss>>
Moss: Because the Scribe never charged anybody for anything. People started doing that on their own.
===

title: Ep56_Margin
---
<<shot wide>>
That night, on the step under the lantern room. Dagrun on the step, as always. Lio sits down on his other side with a notebook open on his knees.
<<pose Rook sit>>
<<shot on Lio>>
Lio: Captain. I've got yours. You don't have to hear it.
<<shot on Dagrun>>
Dagrun: Read it.
<<shot on Lio>>
Lio: "He took me in when nobody would. Of all of them, he's the one I can't look at."
<<set $MARGIN_DAGRUN to 1>>
<<shot wide>>
Dagrun doesn't move for a long time. Up in the lantern room, the light hums.
<<shot on Dagrun>>
Dagrun: Couldn't look at me. Huh.
<<shot on Dagrun>>
Dagrun: That's why he never came home. Not the Crown, not the Bell. Me.
-> "Then make him look."
    <<set $DAGRUN_QUEST to "look">>
    <<shot on Rook>>
    Rook: Then when we find him, make him look at you.
    <<shot on Dagrun>>
    Dagrun: ...Yeah. I'll do that. I'll stand right in front of him till he does.
-> "Then leave the light on."
    <<set $DAGRUN_QUEST to "light">>
    <<shot on Rook>>
    Rook: Then keep leaving the light on. So he knows he can.
    <<shot on Dagrun>>
    Dagrun: I wasn't going to stop.
<<set $EP56_DONE to 1>>
===
`;

const HALL = { stage: "towerHall" }, LH = { stage: "lighthouse" }, NIGHT = { sky: { daylight: 0.06 } };

export const EPISODE_56 = {
  id: "ep56",
  number: 56,
  unlockAt: 5,
  setup: { ...AFTER_EP55 },
  title: "Second Reading",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "sweep", type: "cutscene", cutscene: "ep56_sweep" },
    { id: "title", type: "title" },
    { id: "tower", type: "explore", ...HALL,
      rook: { x: 0, z: -10, yaw: 0 },
      objective: "The Tower of Choosing. Tea first: the kettle, the murals, and Brother Moss ({n}/{total}).",
      required: ["kettle", "mural", "moss"], counts: "required",
      cast: [
        { id: "moss", look: "moss", x: -4.5, z: -6, yaw: 0.6, node: "Ep56_Tea" },
        { id: "severin", look: "severin", x: 3.6, z: -6.4, yaw: -0.5 },
      ],
      pickups: [
        { id: "kettle", x: -8.8, z: -9.6, node: "Ep56_Kettle", label: "Brother Moss's kettle" },
        { id: "mural", x: 5.4, z: 13.2, node: "Ep56_Mural", label: "The murals of the Scribe" },
      ] },
    { id: "truth", type: "scene", node: "Ep56_Truth", ...HALL,
      rook: { x: 1.1, z: 4.6, yaw: Math.PI },
      cast: [
        { id: "moss", look: "moss", x: -0.6, z: 4.7, yaw: Math.PI, pose: "sit" },
        { id: "severin", look: "severin", x: 2.4, z: 1.6, yaw: -0.4 },
      ] },
    // The Scribe's keepers come out of the walls to test whose hand the book is in.
    { id: "keepers", type: "fight", ...HALL, wave: ["clockwork", "clockwork", "clockwork"], tokens: 2,
      world: { origin: { x: 0, z: 1 } },
      tutorial: [{ at: 0.5, text: "The Scribe's keepers, testing whose hand the book is in. Ink them: your hits land harder on anything inked." }],
      lines: [["Moss", "Don't break them. They're older than the kingdom. ...Well. Break them a little."], ["Severin", "You knew this would happen!"]],
      retryBy: "Moss", retry: "Again. They're patient. So am I." },
    { id: "floor", type: "scene", node: "Ep56_Floor", ...HALL,
      rook: { x: 0.9, z: 3.6, yaw: 0 },
      cast: [
        { id: "moss", look: "moss", x: -1.0, z: 4.0, yaw: 0.3 },
        { id: "severin", look: "severin", x: 2.8, z: 2.4, yaw: -0.3 },
      ] },
    { id: "margin", type: "scene", node: "Ep56_Margin", ...LH, ...NIGHT,
      rook: { x: -2.9, z: 9.7, yaw: Math.PI },
      cast: [
        { id: "dagrun", look: "dagrun", x: -4.2, z: 9.7, yaw: Math.PI, pose: "sit" },
        { id: "lio", look: "lio", x: -5.5, z: 9.7, yaw: Math.PI, pose: "sit" },
      ],
      set: { EP56_DONE: 1 } },
    { id: "preview", type: "preview",
      lines: [
        "Next time on UNWRITTEN:",
        "Larkspur, fifteen years after the fire. Grass over the ash, and a door standing where a house used to be.",
        "And the last margin.",
      ] },
  ],
};
