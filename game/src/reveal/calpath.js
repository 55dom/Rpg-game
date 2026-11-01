// Cal's Path (docs/BACKLASH.md Ch 6–8, CIN-05B-2, CIN-05C, CIN-10; GDD §15.9, §25.3, §28; Phase 7 Step 5, §23.6).
// Played from the Lore Archive's list once the Field Notes are found (after Ep 50). This folder is the one allowed to
// name him (§15.11); the two who carry him away are unkA and unkB, and nothing else, here as everywhere.
//
// Part 1, the Astral Path: through the void and down a tunnel of dark aura, carried, grinning, toward a continent with
// no fires on it. She hums the march; he whistles it back, badly. For one cut, through his eyes, five stars over each.
// Part 2 (the player is Cal, in the body he woke in: light, fast, fragile, no armour):
//   Ch 6  Larkspur burning, from the other side of Episode 1's cold open. A star over every villager, in ink, and
//         nothing at all over the infant under the beam. His first door. The orphanage step at Thornwick.
//   Ch 7  Years, in pieces: the village that bars its doors; six of the Crimson Bell, dismantled and let live; the
//         Chancellor's study ("A weapon like you needs an owner", and a splice); the Lighthouse in the rain ("Nobody's
//         written your story. Good."); a name, picked for the first time in two lives; a child at the Thornwick fence,
//         years apart, with nothing over their head, ever; and from the captains' box, "Take the one-pager."
//   Ch 8  A bitter novice at the silent school's gate (a splice); the Hollowmarch from his side ("I'll hold the door.
//         Don't wait up."); the Hollow; the mask. "And that's where you came in. Again."
// Part 3, after the door (present day; CIN-10): the throne chamber, the coffin, the two of them waiting where the Wings
// once stood. "You two still haven't told me what I'm for." Neither answers.
//
// What anyone says before Ch 7 is in a script he can't read yet; it resolves as he learns.

import { AFTER_EP50 } from "./arcs.js";
import { YOUNG_CAL_WEAR, CAL_WEAR } from "./finale.js";
import { ZONES, AURELIN_LAYOUT as AU } from "../data/zones.js";
import { THRONE_LAYOUT as T } from "./places.js";

export const CALPATH_SCRIPT = `
title: Cp_Heartbeat
---
<<shot wide>>
Cal: Black, for a long time. Then a heartbeat. Then another one.
<<shot on Young>>
A hand in front of his face. A human hand: thin, young, his. Everywhere past it, fire.
<<shot on Villager>>
Villager: ⟒⏃⍀ ⏁⊑⟒ ⍙⟒⌰⌰! ⏚⍀⟟⋏☌ ⍙⏃⏁⟒⍀!
<<shot on Villager>>
He doesn't understand a word. He's never heard this language in his life.
<<stars on>>
<<shot wide>>
And there are stars. One, in ink, over every head that runs past him through the smoke. One over this woman. Over that old man, a hollow one, almost nothing.
<<shot wide>>
Cal: The King could see them. I'd seen them once, through his eye. Now I couldn't stop seeing them.
<<shot wide>>
Cal: Somewhere in all that, a baby was crying.
===

title: Cp_Infant
---
<<shot on Rook>>
Under a fallen beam in the last house, an infant, howling, swaddled in something that's started to scorch.
<<shot on Rook>>
Above every other head in this village there's a star, or the hollow of one. Above the child, there is nothing. Not zero. Nothing at all.
<<shot on Rook>>
Cal: I'd never seen nothing before. I didn't know nothing was allowed.
<<shot on Rook>>
He gets his hands under the beam.
===

title: Cp_Step
---
<<shot wide>>
Thornwick, before dawn. A village where nobody can see what he is, because nobody here can see anything at all.
<<shot on Young>>
He sets the bundle down on the orphanage step, carefully, the way you'd set down something you were told to carry and never told why.
<<shot on Young>>
Cal: The keeper wrote it down, I found out later. "Brought in by a boy who didn't speak." Accurate.
<<shot wide>>
He walks away before anyone opens the door. He doesn't look back. That's the part he'd tell you, if you asked. The part he wouldn't: he stopped at the end of the lane, for a while.
===

title: Cp_Learn
---
<<shot on Villager>>
Villager: Fire… ⏚⍜⌰⏁! Fire-bolt!
<<shot on Villager>>
A hedge-mage on the fen road, shouting a spell at a dead tree, and a little fire comes out of his book and goes nowhere much.
<<shot on Young>>
He tries the words. Nothing. He tries them again, louder. Nothing.
<<shot on Young>>
Then he doesn't say anything at all, and wants a door, and a door opens.
<<shot wide>>
Cal: Magic never needed words. Only the King knew. Then me.
===

title: Cp_Barred
---
<<shot wide>>
The fen beasts are dead in the reeds, all of them, in less time than it took the village to scream. The village bars its doors anyway.
<<shot on Villager>>
Villager: Get away! Go ⏃⍙⏃⊬! Whatever you are, go!
<<shot on Young>>
Cal: Not cruelty. Fear. I knew the difference. I'd been on the other side of it, with a glaive.
===

title: Cp_Bell
---
<<shot wide>>
Six of the Crimson Bell lie in the poor quarter's mud, groaning, bound in their own seals. None of them is dead. He made sure.
<<shot on Young>>
Cal: An experiment. I wanted to know what this world did to a boy with no book and impossible magic. Now I knew.
===

title: Cp_Study
---
<<shot on Aldric>>
Aldric: They tell me you took six of the Bell apart with a fallen knight's saber and something they can't put in a report. And you have no grimoire.
<<shot on Aldric>>
Aldric: A weapon like you needs an owner.
<<splice>>
<<shot on Young>>
Cal: Different world. Different species. Same hierarchy.
===

title: Cp_Rain
---
<<shot wide>>
The Lighthouse, in the rain. A huge, lazy man with a bowl of stew, and a wet, dangerous stranger at the door, who hasn't eaten in two days.
<<shot on Dagrun>>
Dagrun: You going to stand in the rain all night, or eat?
<<shot on Young>>
He eats. The big man doesn't ask what he is. He doesn't ask anything.
<<shot on Dagrun>>
Dagrun: No grimoire, huh. Nobody's written your story.
<<shot on Dagrun>>
Dagrun: Good.
<<shot wide>>
Over the big man's head, three stars, quiet as anything. He's the first person in two lives who didn't look at Cal and see a place to put him.
===

title: Cp_Name
---
<<shot on Dagrun>>
Dagrun: You'll need a name, if you're staying. The squad board wants one. I want one. Pick.
<<shot on Young>>
He's never picked anything. A soldier is a place in a line. A line has a number.
<<shot on Young>>
Young: Calder.
<<shot on Dagrun>>
Dagrun: Calder. Fine. Cal, then.
<<sfx whistle>>
<<shot wide>>
Cal: A forged grimoire. Very good work. Knighthood. Vice captain. A kitchen full of rain and laughter, and a tune I'd whistled once, badly, over somebody's shoulder, that turned into a cooking song.
===

title: Cp_Fence
---
<<stars on>>
<<shot wide>>
Thornwick, years apart. The same fence. A child swinging a stick at the post, again and again, getting it wrong in a different way every time.
<<shot on Kid>>
A star over Mother Wren, at the door. A star over the farmer on the lane. Over the child: nothing. Never anything. Every visit, nothing.
<<shot on Young>>
Young: Look at that. Nobody's told them how.
<<shot on Young>>
Cal: Six years after that, from a seat in the captains' box at the Knight Exam, I said three words to Dagrun.
<<shot on Young>>
Young: Take the one-pager.
===

title: Cp_Gate
---
<<shot on Hesper>>
Hesper: You're not a novice. You don't even have a book. What are you doing at our gate?
<<shot on Young>>
He doesn't answer. He opens a door in the air instead, without a word, and through it is the garden on the other side of the wall.
<<splice>>
<<shot on Hesper>>
Hesper: …How?
<<shot on Young>>
Young: Grimoires are chains. There's a space between the pages. Nobody's written anything there.
<<splice>>
<<shot on Young>>
Cal: I may even have believed it. I don't remember. Isn't that convenient.
===

title: Cp_Hollowmarch
---
<<shot wide>>
The Hollowmarch, from his side. The Bloom swelling behind him, and Rook, and Juno, and Dagrun shouting, and the door he's about to walk through.
<<shot on Young>>
Young: I'll hold the door. Don't wait up.
<<shot on Young>>
Cal: The same move as the kneel. A sacrifice, for an audience, with a reason nobody saw. I'd had practice.
<<shot wide>>
And then the white. A space between pages. And far off, through it, a drum: four beats, the march. Home, on the other side.
===

title: Cp_Mask
---
<<shot wide>>
He cut his way out of the Hollow in one stroke, and the drill had become something else on the way: one cut, from the backstep, that split the white open like a page.
<<shot on Young>>
Afterwards he shapes a mask. Its eye slits are a soldier's faceplate. He puts it on.
<<shot wide>>
A ridge above the Ashfall war. Below: the Lanterns, a siege engine rolling up the field to crush them, and Rook.
<<shot on Young>>
Cal: And that's where you came in. Again.
===

title: Cp_After
---
<<sfx unkSpeechFaint>>
<<shot wide>>
The throne chamber, now. The coffin, sealed. The throne, empty. And the two of them, waiting where the Wings once stood, in black suits and white masks, one smiling and one turned to a frown.
<<shot two unkA unkB>>
They incline their heads to him, a fraction. Not as servants. Not as equals. Something stranger.
<<sfx unkSpeechA>>
<<shot on Young>>
Young: [Speaking an unknown language]
<<sfx hum>>
<<shot on unkB>>
She begins to hum the march. He looks at the coffin, and tilts his head.
<<shot on Young>>
Young: You two still haven't told me what I'm for.
<<shot on unkA>>
Neither of them answers. She keeps humming. Her painted smile and his painted frown don't move.
<<set $CALPATH_DONE to 1>>
===
`;

const LK = { stage: "larkspur" }, TW = { stage: "thornwick" }, AUR = { stage: "aurelin" }, LH = { stage: "lighthouse" };
const NIGHT = { sky: { daylight: 0.06 } }, DAY = { sky: { daylight: 0.55 } };
const LANTERN_WEAR = Object.freeze({ ...YOUNG_CAL_WEAR, kind: "cal", title: "CAL'S PATH" }); // in the Lantern's coat (Ch 7 on)

export const EPISODE_CALPATH = {
  id: "calpath",
  number: 50,
  label: "CAL'S PATH",
  unlockAt: 51, // once the Field Notes are found (the end of Ep 50)
  setup: { ...AFTER_EP50 },
  title: "Cal's Path",
  arc: "Backlash · Chapters 6–8",
  memory: true,
  world: { kit: YOUNG_CAL_WEAR, companions: false },
  beats: [
    // ---- Part 1: the Astral Path ----
    { id: "astral", type: "cutscene", cutscene: "cp_astral" },
    { id: "title", type: "title" },
    // ---- Ch 6: the Other World ----
    { id: "heartbeat", type: "scene", node: "Cp_Heartbeat", ...LK,
      rook: { x: 0, z: -2, yaw: 0 },
      cast: [
        { id: "villager", look: "townswoman", x: -2.4, z: 1.0, yaw: 2.6, stars: 1 },
        { id: "v2", look: "townsman", x: 2.2, z: 0.6, yaw: -2.4, stars: 0 },
        { id: "v3", look: "gossip", x: -0.8, z: 3.4, yaw: 3.0, stars: 1 },
      ] },
    { id: "fire", type: "explore", ...LK,
      rook: { x: 0, z: -1, yaw: 0 },
      objective: "A baby, crying, somewhere in the fire.",
      required: ["infant"], counts: "required",
      cast: [],
      pickups: [{ id: "infant", x: 4.4, z: 10.8, node: "Cp_Infant", label: "The crying" }] },
    { id: "door", type: "cutscene", cutscene: "cp_door" },
    { id: "step", type: "scene", node: "Cp_Step", ...TW, ...NIGHT,
      rook: { x: 1.3, z: 13.4, yaw: -0.5 },
      cast: [{ id: "infant", look: "infant", x: 0.2, z: 15.2, yaw: 0, down: true }] },
    // ---- Ch 7: the Human ----
    { id: "learn", type: "scene", node: "Cp_Learn", stage: "fens",
      rook: { x: 1.6, z: -22.4, yaw: -0.6 },
      cast: [{ id: "villager", look: "acolyte", x: -0.4, z: -20.6, yaw: 2.4 }] },
    { id: "beasts", type: "fight", stage: "fens", wave: ["beast", "hound", "hound"], tokens: 2,
      world: { bounds: ZONES.fens.bounds, origin: { x: 0, z: -18 } },
      tutorial: [{ at: 0.5, text: "CAL'S PATH. A human body: light, fast, fragile. Doors for a dodge; the saber; and the drill, which with a saber becomes the Ascended Demon Slash." }],
      lines: [["Cal", "Fen beasts. A village behind me. Easy."]],
      retryBy: "Cal", retry: "Again. I didn't die here. I'd remember." },
    { id: "barred", type: "scene", node: "Cp_Barred", stage: "fens",
      rook: { x: 0, z: -19, yaw: 0 },
      cast: [{ id: "villager", look: "farmer", x: 1.6, z: -15.8, yaw: Math.PI - 0.4 }] },
    // Six of the Bell, dismantled, and let live: they can't be put all the way down.
    { id: "bell", type: "fight", ...AUR, ...NIGHT, wave: [], tokens: 3,
      world: { bounds: ZONES.aurelin.bounds, origin: { x: AU.grate.x - 6, z: AU.grate.z + 8 } },
      siege: {
        foes: [
          { kind: "bellWarden", x: AU.grate.x - 10, z: AU.grate.z + 8, yaw: Math.PI / 2, floor: 0.1 },
          { kind: "bellWarden", x: AU.grate.x - 2, z: AU.grate.z + 8, yaw: -Math.PI / 2, floor: 0.1 },
          { kind: "bellWarden", x: AU.grate.x - 6, z: AU.grate.z + 4, yaw: 0, floor: 0.1 },
          { kind: "bellWarden", x: AU.grate.x - 6, z: AU.grate.z + 12, yaw: Math.PI, floor: 0.1 },
        ],
        meter: { label: "The Bell Hunt", start: 1, end: 0, seconds: 40, perKill: 0 },
        marks: [{ frame: 900, say: ["Cal", "Six of them, for one boy. I was flattered."] }],
      },
      tutorial: [{ at: 0.5, text: "THE BELL HUNT. Dismantle them. Don't kill them: he didn't." }],
      lines: [["BellWarden", "Seal him!"]],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "bellAfter", type: "scene", node: "Cp_Bell", ...AUR, ...NIGHT,
      rook: { x: AU.grate.x - 6, z: AU.grate.z + 8, yaw: 0 },
      cast: [
        { id: "bellWarden", look: "bellWarden", x: AU.grate.x - 8, z: AU.grate.z + 10, yaw: 0.5, down: true },
        { id: "warden2", look: "bellWarden", x: AU.grate.x - 3.6, z: AU.grate.z + 9.6, yaw: -0.6, down: true },
      ] },
    { id: "study", type: "scene", node: "Cp_Study", stage: "archive",
      rook: { x: 0.3, z: -7.6, yaw: 0 },
      cast: [{ id: "aldric", look: "aldric", x: 0, z: -5.0, yaw: Math.PI }] },
    { id: "rain", type: "scene", node: "Cp_Rain", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [{ id: "dagrun", look: "dagrun", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit", stars: 3 }] },
    { id: "name", type: "scene", node: "Cp_Name", ...LH, ...DAY,
      rook: { x: 5.0, z: 2.5, yaw: 0 },
      cast: [{ id: "dagrun", look: "dagrun", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" }] },
    { id: "fence", type: "scene", node: "Cp_Fence", ...TW, ...DAY,
      world: { kit: LANTERN_WEAR, companions: false },
      rook: { x: 5.4, z: -1.6, yaw: -0.9 },
      cast: [
        { id: "kid", look: "kid", x: 2.8, z: 1.2, yaw: -1.4 },
        { id: "wren", look: "wren", x: 2.6, z: 13.4, yaw: Math.PI, stars: 1 },
        { id: "farmer", look: "farmer", x: -4.2, z: 3.0, yaw: 1.2, stars: 1 },
      ] },
    // ---- Ch 8: the Mask ----
    { id: "gate", type: "scene", node: "Cp_Gate", ...AUR, ...NIGHT,
      world: { kit: YOUNG_CAL_WEAR, companions: false },
      rook: { x: 15.2, z: 3.6, yaw: 0 },
      cast: [{ id: "hesper", look: "hesper", x: 15.2, z: 6.0, yaw: Math.PI }] },
    { id: "hollowmarch", type: "scene", node: "Cp_Hollowmarch", stage: "hollow",
      world: { kit: LANTERN_WEAR, companions: false },
      rook: { x: 0, z: -20, yaw: 0 }, cast: [] },
    { id: "white", type: "fight", stage: "hollow", wave: ["shell", "shell", "shell"], tokens: 2,
      world: { kit: LANTERN_WEAR, companions: false, bounds: ZONES.hollow.bounds, origin: { x: 0, z: -10 } },
      tutorial: [{ at: 0.5, text: "The Hollow. The drill's last form: from the backstep, one cut that splits the white open." }],
      lines: [["Cal", "Nobody had written anything here. Including a way out."]],
      retryBy: "Cal", retry: "Again." },
    { id: "mask", type: "scene", node: "Cp_Mask", stage: "hollow",
      world: { kit: LANTERN_WEAR, companions: false },
      rook: { x: 0, z: -8, yaw: 0 }, cast: [] },
    // ---- Part 3: after the door (present day) ----
    { id: "after", type: "scene", node: "Cp_After", stage: "throne", memory: false,
      world: { kit: CAL_WEAR, companions: false },
      rook: { x: 0, z: 11.4, yaw: 0 },
      cast: [
        { id: "unkA", look: "unkATrue", x: -2.4, z: T.places[0][1] + 0.8, yaw: Math.PI },
        { id: "unkB", look: "unkBTrue", x: 2.4, z: T.places[1][1] + 0.8, yaw: Math.PI },
      ],
      set: { CALPATH_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep51",
      lines: [
        "Cal's Path ends here.",
        "He is the offering, and he doesn't know it.",
        "Back to Rook.",
      ] },
  ],
};
