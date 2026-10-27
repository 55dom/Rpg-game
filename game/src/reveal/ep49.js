// Episode 49 · Backlash (GDD §15.8 and docs/BACKLASH.md, Chapters 0–5; §15.11: this folder is the one allowed to name
// him). "Then don't just listen." He opens a golden door into his own memory, and the player plays it: fifteen years
// ago and a world away, one soldier among thousands in a Line under a black castle. Ash Line Eleven, 1★.
//
//   Ch 0  The Door: present day, the bridge. The door opens around the lens; the colour drains; white.
//   Ch 1  The Soldier: the morning drill (Left. Left. Back. Cut.); the camp; the march ("Continue formation." "Mind the
//         step."); the barracks ("That is enough."). "I was wrong."
//   Ch 2  The Monthly Trial: the Hero Party arrives. Trial 1, in the Line; Trials 2–4, a month at a time; Trial 5, the
//         order to kill the Knight, and the opening he doesn't take.
//   Ch 3  The Question: the caverns under the castle (the helm, the circle, the mural; a cut in the memory); guard duty
//         in the throne chamber, and for one shot, the King's eye. "What exactly are you?"
//   Ch 4  Sacrifice: the Saint's other prayer, and what comes back. "...what exactly is death?"
//   Ch 5  The Final Battle: the Breach; the walk; the kneel ("For the Demon King."), the star going out of him; the Last
//         Line at 0★; the charge he can't step aside from; the failing body; the dying view; the void; the grin.
//
// Present-day narration is "Cal" (it's him telling it); the soldier he was is "Eleven" (the player). The two who come
// through the void at the end are unkA and unkB, here and everywhere, and what they say is never written down.

import { AFTER_EP48 } from "./arcs.js";
import { ZONES } from "../data/zones.js";
import { ASH_WEAR, ASH_EMPTY } from "./backlash.js";
import { CAMP_LAYOUT as C, THRONE_LAYOUT as T, CAVERN_LAYOUT as V } from "./places.js";

export const EP49_SCRIPT = `
title: Ep49_Door
---
<<shot on Cal>>
He holds the silence a moment longer. The battle goes on around them and doesn't come near.
<<shot on Cal>>
Cal: Then don't just listen.
===

title: Ep49_Sergeant
---
LineSergeant: Eleven. Patrol. The ridge road, out and back. Fall in.
===

title: Ep49_Smith
---
A smith knocks the dent out of a breastplate with a hammer the size of a forearm. He doesn't look up.
Smith: Next.
-> Hold out the glaive.
    He takes it, sights down the edge, and hands it back.
    Smith: It'll do. They always do.
-> Say nothing.
    Smith: Next.
===

title: Ep49_Mess
---
Soldiers at the long iron table, eating grey stew out of iron bowls. Nobody talks. Somebody passes the salt without being asked.
Soldier: Sit, if you're sitting. Move, if you're not.
===

title: Ep49_Recruits
---
New soldiers coming in through the gate in a column, a Line-keeper at their head. The same height, the same plate, the same faceplate, every one.
Linekeeper: Line Eleven's two short since yesterday. Take these.
Two of them step out of the column and walk to the end of a line, and the line closes up round them, and that's that.
===

title: Ep49_Wounded
---
Two soldiers carry a third toward the wall. His plate is split down one side. Behind them, a fresh one is already walking to the place he left.
Soldier: Make room.
===

title: Ep49_Sparring
---
Two soldiers at the posts, running the drill. Left. Left. Back. Cut. The glaives come up together every time, to the same height.
===

title: Ep49_Gate
---
The gate in the black wall. The road beyond it, the ridge, and somewhere past the ridge, the place the humans come from once a month.
Soldier: Line. Back to your line.
===

title: Ep49_Body
---
He's on his back where he fell, the arrow still in the seam at his neck. His faceplate is the same as everyone's.
Nothing happens. Nobody turns. Up the road, the drum keeps the count.
<<set $SAW_THE_BODY to 1>>
===

title: Ep49_Line
---
LineSergeant: Line.
A hand on the back of his plate, not rough and not gentle, and he's in his slot again, and the column moves on.
===

title: Ep49_Barracks
---
<<pose Eleven sit>>
<<shot wide>>
That night. The brazier between the tents, burned low. The others asleep, or as near it as soldiers get.
<<shot two Eleven Bunkmate>>
Eleven: Was he important?
<<shot on Bunkmate>>
Bunkmate: He served.
<<shot on Eleven>>
Eleven: That's all?
<<shot on Bunkmate>>
Bunkmate: That is enough.
<<shot on Eleven>>
<<wait 1.2>>
Cal: I was wrong.
===

title: Ep49_Trial
---
<<cue pillar>>
<<sfx warHorn>>
<<shot sky 6 5 8>>
A pillar of light comes down out of the ash at the edge of the field. Three figures walk out of it.
<<shot on LineSergeant>>
LineSergeant: The Hero Party has arrived! Lines, form!
<<shot on Corin>>
Corin, the Knight Hero. Sword and shield, and he hates every one of them.
<<shot on Maelis>>
Maelis, the Goddess Saint. The only one anybody's ever seen do magic. She prays.
<<shot on Teo>>
And Teo, the archer. King A, they call him. Nobody remembers why.
<<shot on Eleven>>
Cal: Once a month, regular as the drum. The Goddess Trial.
===

title: Ep49_Trials
---
<<cue pillarOff>>
<<shot wide>>
The light comes down, and they go back up into it. The dead are carried to the wall, and the Lines close up.
<<shot on Eleven>>
Cal: Same three. Every month. You'd think someone would wonder why.
<<splice>>
<<shot on Eleven>>
The second month, he watches the Knight's shoulder before the shield comes up. The third month, he's moving before the charge has started.
<<shot on Eleven>>
Cal: Nobody else was watching. That was the strange part.
<<splice>>
<<shot on Eleven>>
The fourth month, he tries things.
-> Hold the line, and watch.
    <<set $TRIAL4 to "watch">>
    Cal: I watched. I'd decided watching was a kind of fighting. It wasn't, yet.
-> Step out of the line.
    <<set $TRIAL4 to "step">>
    Cal: I stepped out of the line, once, for a breath, and stepped back in. Nobody noticed. I noticed.
-> Go for the archer.
    <<set $TRIAL4 to "archer">>
    Cal: I went for the archer. He put an arrow in my shoulder without looking round. Fair.
<<splice>>
===

title: Ep49_Order
---
<<shot two Eleven Corin>>
The order flickers, and greys, and is gone. The Knight stares at the soldier who didn't kill him. Then he's running for the light.
<<shot on Eleven>>
Behind the faceplate, where nobody can see it, the faint shape of a smile.
<<if $TRIED_TO_OBEY>>
    Cal: Even then, part of me still tried to obey.
<<endif>>
Cal: Nothing happened. I broke an order, and the sky stayed exactly where it was.
===

title: Ep49_Caverns
---
Night. The barracks asleep. A gap in the rock under the castle wall, that nobody is supposed to know about.
===

title: Ep49_Glyphs
---
Script on the walls, cut deep and very old. It means nothing to him.
Cal: I'd see this writing again, a long way from here. On a tower. I'd pretend to guess at it.
===

title: Ep49_Helm
---
A soldier's helm on its side, older than any plate in the camp. Inside, scratched with a blade point, tally marks. A lot of them.
And beside them, small and perfectly round, a circle, filled in.
Cal: Someone had asked questions here before me. I never found out what happened to him. I have a guess.
<<set $SAW_THE_HELM to 1>>
===

title: Ep49_Mural
---
On the far wall, a mural as wide as the barracks. A King of some forgotten age, wounded, pouring black out of his chest into two winged shapes that kneel in front of him.
And beside them, the same two again, risen. No wings. Robed. Standing behind an empty throne like servants.
He stands in front of it for a long time.
<<splice>>
===

title: Ep49_Patrol
---
Soldier: Old stories. Kings don't bleed.
===

title: Ep49_Dawn
---
<<shot on Eleven>>
And then he's walking back between the tents before dawn. Whatever happened in front of the mural, it isn't here.
===

title: Ep49_Gaze
---
<<shot wide>>
Day. Guard duty in the throne chamber. Soldiers down both sides of the runner, not one of them moving. At the foot of the dais, the two Commanders, arguing.
<<shot two Vaelith Ghorran>>
Vaelith: The Right Wing took the ridge. The Right Wing holds it.
<<shot on Ghorran>>
Ghorran: Then the Left Wing will...
<<shot on King>>
The King's eyes move. Only a little. To a pillar.
<<cue fold>>
<<sfx slam>>
<<shake 0.5>>
<<shot wide>>
The pillar folds in half like wet paper. The air ripples round it once, and that's all.
<<pose Ghorran kneel>>
<<pose Vaelith kneel>>
<<shot two Ghorran Vaelith>>
Both Commanders are on their knees before the stone has stopped falling.
<<stars on>>
<<sfx starRing>>
<<shot eye King>>
And for a moment, what he sees. Over every soldier in the ranks, a star. Over each Commander, three.
<<shot eye King Eleven>>
His gaze reaches one soldier among the rest. One star. It stops there, for half a breath.
<<shot eye King>>
And moves on.
<<stars off>>
<<pose Eleven tilt>>
<<shot on Eleven>>
Faceplate forward, like everyone's. But his head is tilted, a few degrees, toward the throne.
<<shot on Eleven>>
Eleven: What exactly are you?
===

title: Ep49_Wall
---
<<shot wide>>
Night. The gate in the black wall, and nobody at it but him. The Trial field dark beyond it.
<<shot on Eleven>>
Eleven: If death isn't permanent...
<<wait 2>>
<<shot on Eleven>>
Eleven: ...what exactly is death?
===

title: Ep49_Breach
---
<<shot wide>>
And then the last Trial. The largest anyone remembers. The arrows go through plate now; the Knight goes through Lines; and the Saint keeps them all standing.
<<shot two Ghorran Vaelith>>
The Commanders come down onto the field. He fights beside them, in the Line. Never against.
===

title: Ep49_Walk
---
The heroes are inside the gate. The Commanders have fallen back to the throne. Every Line in the chamber holds.
Cal: Ten words. That's all it took. I'd been practising them for a month.
===

title: Ep49_KneelHere
---
He kneels.
===

title: Ep49_Kneel
---
<<pose Eleven kneel>>
<<shot wide>>
The throne chamber. Ranks without end down both sides, the King on his throne, and one soldier at the foot of the dais, on his knee.
<<shot on Eleven>>
Eleven: Huh.
<<shot two King Eleven>>
King: Why are you here?
<<sfx hymn>>
<<shot on Eleven>>
He bows his head and whispers. Ten words, under his breath, too quiet for the ranks. To anyone listening, a vow.
<<shot on Eleven>>
Eleven: For the Demon King.
<<fx floor Eleven>>
Light gathers at the seams of his plate, brighter, and brighter... and simply goes out. Nothing happens.
<<stars on>>
<<sfx starRing>>
<<shot eye King Eleven>>
A single star rises off the kneeling soldier and drifts up toward the throne.
<<star Eleven 0>>
<<shot eye King Eleven>>
It passes through the King's open palm, and fades. There is nowhere for it to go. Over the soldier, only the outline of one is left.
<<stars off>>
<<shot on King>>
The King lifts his eyes toward the doors, and the noise of the battle beyond them.
<<shot on King>>
King: ...Four.
<<shot two King Eleven>>
King: Your service is accepted. Return to the line.
<<pose Eleven none>>
<<shot on Eleven>>
He stands, unchanged, his plate faintly smoking. Nobody looks at him.
===

title: Ep49_Charge
---
<<shot two Corin Eleven>>
The Knight comes through the Last Line as if it isn't there. He lowers his shield and leans. The charge. The same one. He's stepped aside from it a hundred times.
<<timer 4>>
-> Dodge.
    He steps aside, the way he always has... and the step is a stumble.
-> Brace.
    He sets the haft against the stone and braces. The haft breaks.
-> Hold the line.
    He holds.
<<sfx slam>>
<<shake 0.8>>
<<shot wide>>
The shield takes him full in the chest and throws him back up the runner like a sack.
===

title: Ep49_Failing
---
<<shot on fallen>>
On his back on the stone. The plate split down one side, the faceplate half gone. Breathing, ragged.
<<timer 6>>
-> Get up.
    He gets an elbow under him. It holds, for a moment. It buckles.
-> Lift the glaive.
    His hand finds the haft. It comes up a few inches off the stone, and drops.
-> Breathe.
    He breathes. It doesn't help.
<<timer 5>>
-> Get up.
    Weaker. The arm won't even take the weight this time.
-> Lift the glaive.
    His fingers close on nothing. The glaive is a pace away. It may as well be a mile.
-> Breathe.
    In. Out. Shorter.
<<timer 4>>
-> Get up.
    Nothing.
-> Lift the glaive.
    Nothing.
-> Breathe.
    Nothing.
<<shot on fallen>>
He stops trying.
===
`;

const CAMP = { stage: "camp" }, THRONE = { stage: "throne" }, CAVES = { stage: "caverns" };
const NIGHT = { sky: { daylight: 0.16 } };
const soldier = (id, x, z, yaw, extra = {}) => ({ id, look: "lineAlly", x, z, yaw, ...extra });
const YARD = { bounds: ZONES.camp.bounds, origin: { x: 0, z: -2 } };
const HALL = { bounds: ZONES.throne.bounds, origin: { x: 0, z: -15 } };
const THE_LINE = { kind: "lineAlly", rows: 2, cols: 4, at: { x: 0, z: -1.2 }, gap: [1.7, 1.6] };
const heroes = (floor = 0.3) => [
  { kind: "heroKnight", x: 4.6, z: 6.2, floor }, { kind: "heroSaint", x: 7.2, z: 8.6, floor }, { kind: "heroArcher", x: 8.0, z: 5.0, floor },
];
/** The ranks down both sides of the runner, facing it; each with the star the King sees over him. */
const ranks = (zs, skip = null) => zs.flatMap((z) => [-1, 1].map((sx) => ({ x: sx * 3.1, z })))
  .filter((p) => !skip || Math.hypot(p.x - skip.x, p.z - skip.z) > 0.5)
  .map((p, i) => soldier(`rank${i}`, p.x, p.z, p.x < 0 ? Math.PI / 2 : -Math.PI / 2, { crowd: true, stars: 1 }));
const KING = { id: "king", look: "demonKing", x: T.throne.x, z: T.throne.z - 0.2, y: 1.0, yaw: Math.PI, pose: "sit" };
const COMMANDERS = [
  { id: "ghorran", look: "commanderL", x: T.places[0][0], z: T.places[0][1], yaw: Math.PI, stars: 3 },
  { id: "vaelith", look: "commanderR", x: T.places[1][0], z: T.places[1][1], yaw: Math.PI, stars: 3 },
];
const GUARD_POST = { x: -3.1, z: 0 }, KNEEL = { x: 0, z: T.dais.z - T.dais.r - 0.8 };

export const EPISODE_49 = {
  id: "ep49",
  number: 49,
  unlockAt: 5,
  setup: { ...AFTER_EP48 },
  title: "Backlash",
  arc: "Arc 5 · Writ of Return",
  memory: true, // the whole episode is the memory but its first two beats (runtime/story.js: the colour drained)
  world: { kit: ASH_WEAR, companions: false },
  beats: [
    // ---- Ch 0: The Door ----
    { id: "door", type: "scene", node: "Ep49_Door", stage: "bridge", memory: false, rook: null,
      cast: [
        { id: "rookStand", look: "player", x: 0, z: 2.4, yaw: 0 },
        { id: "cal", look: "unmasked", x: 0, z: 6.2, yaw: Math.PI },
        { id: "juno", look: "juno", x: -2.0, z: -4.4, yaw: 0.3 }, { id: "bas", look: "bas", x: 1.4, z: -4.6, yaw: -0.1 },
      ] },
    { id: "in", type: "cutscene", cutscene: "ep49_in", memory: false },
    { id: "title", type: "title" },

    // ---- Ch 1: The Soldier ----
    { id: "drill", type: "fight", ...CAMP, wave: ["drillPartner"], tokens: 1,
      world: { ...YARD }, endOn: "drill",
      lines: [["LineSergeant", "Left. Left. Back. Cut."], ["Cal", "Back then, I thought serving was all I was born to do."]],
      tutorial: [
        { at: 0.5, text: "A soldier's body. Slow to swing, slower to recover. A short hop. No magic. The glaive is all there is." },
        { at: 8, text: "The drill. LEFT, LEFT, BACK, CUT. Dodge, dodge, dodge back, and ATTACK straight out of the backstep." },
        { at: 24, text: "Out of the backstep, ATTACK. The Demon Slash. Land it on him." },
      ],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "camp", type: "explore", ...CAMP,
      rook: { x: 0, z: -10, yaw: 0 },
      objective: "Morning. The camp: walk it, if you like. Then report to the Line Sergeant.",
      required: ["lineSergeant"],
      cast: [
        { id: "lineSergeant", look: "lineSergeant", x: 0, z: 4.2, yaw: Math.PI, node: "Ep49_Sergeant" },
        soldier("smith", C.carts[0][0] - 1.6, C.carts[0][1] - 1.8, 0.6, { node: "Ep49_Smith", name: "Line Smith" }),
        soldier("eater", C.mess.x - 1.6, C.mess.z - 1.1, 0, { pose: "sit", node: "Ep49_Mess", name: "Soldiers at the mess" }),
        soldier("eater2", C.mess.x + 1.4, C.mess.z - 1.1, 0, { pose: "sit" }),
        soldier("eater3", C.mess.x, C.mess.z + 1.1, Math.PI, { pose: "sit" }),
        { id: "linekeeper", look: "lineSergeant", x: 2.4, z: 19.6, yaw: Math.PI, node: "Ep49_Recruits" },
        soldier("recruit1", 1.6, 21.6, Math.PI, { crowd: true }), soldier("recruit2", 3.2, 21.6, Math.PI, { crowd: true }), soldier("recruit3", 2.4, 23.2, Math.PI, { crowd: true }),
        soldier("wounded", -4.6, 6.4, 0.3, { down: true }), soldier("bearer", -5.6, 7.6, 2.6, { node: "Ep49_Wounded", name: "Soldiers carrying the wounded" }),
        soldier("sparA", 2.6, -11.2, 0, { node: "Ep49_Sparring", name: "Soldiers at the drill" }), soldier("sparB", 2.6, -9.6, Math.PI),
        soldier("gate", 5.8, 23.6, Math.PI, { node: "Ep49_Gate", name: "Gate guard" }),
      ] },
    { id: "march", type: "cutscene", cutscene: "ep49_march" },
    { id: "column", type: "explore", ...CAMP,
      rook: { x: 7.6, z: -3.2, yaw: Math.PI },
      objective: "The column has halted for the count. Back in line.",
      required: ["lineSergeant"],
      cast: [
        { id: "fallen", look: "lineAlly", x: 6.0, z: -13.3, yaw: 0, down: true },
        { id: "lineSergeant", look: "lineSergeant", x: 9.6, z: -1.0, yaw: -2.0, node: "Ep49_Line" },
        ...[[6.0, -1.6], [6.0, 0.0], [7.6, 0.0], [6.0, 1.6], [7.6, 1.6], [6.0, -4.8], [7.6, -4.8], [6.0, -6.4], [7.6, -6.4]].map(([x, z], i) => soldier(`col${i}`, x, z, 0, { crowd: true })),
      ],
      pickups: [{ id: "body", x: 6.9, z: -13.6, marker: false, node: "Ep49_Body", label: "The soldier who fell" }] },
    { id: "barracks", type: "scene", node: "Ep49_Barracks", ...CAMP, ...NIGHT,
      rook: { x: C.braziers[0][0] + 1.4, z: C.braziers[0][1] - 0.9, yaw: -1.9 },
      cast: [
        soldier("bunkmate", C.braziers[0][0] - 1.4, C.braziers[0][1] - 0.6, 1.9, { pose: "sit" }),
        soldier("sleeper", C.braziers[0][0] - 0.4, C.braziers[0][1] + 1.6, 3.0, { down: true, crowd: true }),
      ] },

    // ---- Ch 2: The Monthly Trial ----
    { id: "trial", type: "scene", node: "Ep49_Trial", ...CAMP,
      rook: { x: 0, z: -3, yaw: 0.5 },
      cast: [
        { id: "lineSergeant", look: "lineSergeant", x: -2.6, z: -0.6, yaw: 0.6 },
        { id: "corin", look: "heroKnight", x: 4.6, z: 6.2, yaw: -2.6 },
        { id: "maelis", look: "heroSaint", x: 6.6, z: 7.2, yaw: -2.6 },
        { id: "teo", look: "heroArcher", x: 7.8, z: 5.4, yaw: -2.4 },
        ...[-3.4, -1.7, 1.7, 3.4].map((x, i) => soldier(`line${i}`, x, -3, 0.4, { crowd: true })),
      ] },
    { id: "trial1", type: "fight", ...CAMP, wave: [], tokens: 2,
      world: { ...YARD },
      siege: { meter: { label: "The Trial", start: 1, end: 0, seconds: 75, perKill: 0 }, foes: heroes(), allies: THE_LINE },
      tutorial: [
        { at: 0.5, text: "Trial One. Fight in the Line, with the Line. You can't win this: the Knight is far too strong. Survive until the Trial's clock runs out." },
        { at: 18, text: "The Saint heals whoever's hurt worst while she prays. The archer picks soldiers off from the back." },
      ],
      lines: [["LineSergeant", "Hold the Line! HOLD!"]],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "trials", type: "scene", node: "Ep49_Trials", ...CAMP,
      rook: { x: 0, z: -3, yaw: 0.2 },
      cast: [...[-1.7, 1.7, -3.4, 3.4].map((x, i) => soldier(`line${i}`, x, -3, 0.2, { crowd: true }))] },
    { id: "trial5", type: "fight", ...CAMP, wave: ["trialKnight"], tokens: 2,
      world: { ...YARD }, endOn: "spared",
      awaken: { on: "memoryCorrect", flag: "TRIED_TO_OBEY", say: ["Cal", "No. That's not how it went."] },
      tutorial: [
        { at: 0.5, text: "Trial Five. ORDER. ATTACK THE KNIGHT." },
        { at: 10, text: "He charges. Step aside. When the charge ends he's overextended, and the kill is right there." },
      ],
      eventHints: { opening: "His back is open. The kill is right there." },
      lines: [["LineSergeant", "Eleven! The Knight! Kill the Knight!"]],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "order", type: "scene", node: "Ep49_Order", ...CAMP,
      rook: { x: 0, z: -2, yaw: 0.6 },
      cast: [{ id: "corin", look: "heroKnight", x: 3.2, z: 2.6, yaw: -2.4 }] },

    // ---- Ch 3: The Question ----
    { id: "caverns", type: "explore", ...CAVES, ...NIGHT,
      rook: { x: 0, z: -13.6, yaw: 0 },
      intro: "Ep49_Caverns",
      objective: "Under the castle. Look ({n}/{total}).",
      required: ["helm", "mural"], counts: "required",
      cast: [soldier("patrol", -5.0, 9.6, 1.2, { node: "Ep49_Patrol", name: "Soldier on patrol" })],
      pickups: [
        { id: "glyphs", x: V.glyphs[0][0] + 0.9, z: V.glyphs[0][1], marker: false, node: "Ep49_Glyphs", label: "Glyphs on the wall" },
        { id: "helm", x: V.helm.x - 0.9, z: V.helm.z - 0.4, marker: false, node: "Ep49_Helm", label: "A broken helm" },
        { id: "mural", x: 0, z: V.mural.z - 1.8, marker: false, node: "Ep49_Mural", label: "The mural" },
      ] },
    { id: "dawn", type: "scene", node: "Ep49_Dawn", ...CAMP, sky: { daylight: 0.45 },
      rook: { x: 12.4, z: -4, yaw: Math.PI * 0.9 },
      cast: [] },
    { id: "gaze", type: "scene", node: "Ep49_Gaze", ...THRONE,
      rook: { x: GUARD_POST.x, z: GUARD_POST.z, yaw: Math.PI / 2 }, rookStars: 1,
      cast: [
        KING,
        { id: "ghorran", look: "commanderL", x: -1.8, z: 10.2, yaw: Math.PI / 2, stars: 3 },
        { id: "vaelith", look: "commanderR", x: 1.8, z: 10.2, yaw: -Math.PI / 2, stars: 3 },
        ...ranks([-12, -8, -4, 0, 4], GUARD_POST),
      ] },

    // ---- Ch 4: Sacrifice ----
    { id: "losing", type: "fight", ...CAMP, wave: [], tokens: 2,
      world: { ...YARD }, endOn: "sacrifice",
      siege: { foes: [{ kind: "heroKnight", x: 0.6, z: 3.2, floor: 0.3 }, { kind: "heroSacrifice", x: 1.6, z: 6.4 }, { kind: "heroArcher", x: 3.4, z: 4.6, floor: 0.3 }], allies: THE_LINE },
      tutorial: [{ at: 0.5, text: "The Trial's going wrong for them. Then the Saint kneels, and it isn't her healing prayer. ORDER. STOP THE PRAYER." }],
      eventHints: { prayer: "Ten syllables. The Knight's in the way. Get through him." },
      lines: [["LineSergeant", "Stop the prayer! Stop her!"], ["Corin", "Keep going! Maelis, keep going!"]],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "sacrifice", type: "cutscene", cutscene: "ep49_sacrifice", set: { SAW_SACRIFICE: 1 } },
    { id: "wall", type: "scene", node: "Ep49_Wall", ...CAMP, ...NIGHT,
      rook: { x: 0, z: C.wall.z - 2.2, yaw: 0 },
      cast: [] },

    // ---- Ch 5: The Final Battle ----
    { id: "breach", type: "scene", node: "Ep49_Breach", ...CAMP,
      rook: { x: 0, z: -2, yaw: 0.3 },
      cast: [
        { id: "ghorran", look: "commanderL", x: -3.4, z: 1.2, yaw: 0.2 },
        { id: "vaelith", look: "commanderR", x: 3.6, z: 1.0, yaw: -0.2 },
        ...[-1.7, 1.7].map((x, i) => soldier(`line${i}`, x, -2, 0.2, { crowd: true })),
      ] },
    { id: "breachFight", type: "fight", ...CAMP, wave: [], tokens: 3,
      world: { ...YARD },
      siege: {
        meter: { label: "The castle gate", start: 1, end: 0, seconds: 70, perKill: 0 }, foes: heroes(0.25), allies: THE_LINE,
        marks: [
          { meter: 0.72, sfx: "warHorn", say: ["Ghorran", "Left Wing! With me!"] },
          { meter: 0.48, say: ["Vaelith", "Right Wing. Close the gap."] },
          { meter: 0.22, remove: "heroArcher", sfx: "slam", say: ["LineSergeant", "The archer's down! The Left Wing's axe!"], set: { TEO_FALLEN: 1 } },
        ],
      },
      tutorial: [{ at: 0.5, text: "The largest Trial anyone remembers. The arrows go through plate now. Hold the Line while the Commanders fight." }],
      lines: [["LineSergeant", "Every Line! Hold!"]],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "walk", type: "explore", ...THRONE,
      rook: { x: 0, z: T.door.z + 3, yaw: 0 },
      intro: "Ep49_Walk",
      objective: "The throne chamber. Walk.",
      required: ["kneel"],
      cast: [KING, ...COMMANDERS.map((c) => ({ ...c, stars: undefined })), ...ranks([-16, -12, -8, -4, 0, 4]).map((r) => ({ ...r, stars: undefined }))],
      pickups: [{ id: "kneel", x: KNEEL.x, z: KNEEL.z, node: "Ep49_KneelHere", label: "Kneel" }] },
    { id: "kneel", type: "scene", node: "Ep49_Kneel", ...THRONE,
      rook: { x: KNEEL.x, z: KNEEL.z, yaw: 0 }, rookStars: 1,
      cast: [KING, ...COMMANDERS, ...ranks([-8, -4, 0, 4])],
      set: { STAR_GIVEN: 1 } },
    { id: "lastLine", type: "fight", ...THRONE, wave: [], tokens: 2,
      world: { ...HALL, kit: ASH_EMPTY },
      siege: {
        foes: [{ kind: "heroKnightSurge", x: 0.4, z: -20.4, yaw: 0, floor: 0.3 }, { kind: "heroSaint", x: -1.6, z: -21.0, yaw: 0, floor: 0.3 }],
        allies: { kind: "lineAlly", rows: 2, cols: 4, at: { x: 0, z: -16.6 }, gap: [1.7, 1.6], yaw: Math.PI },
        until: { frames: 60 * 60 },
        marks: [
          { frame: 60 * 20, sfx: "slam", shake: 0.5, say: ["Soldier", "The gallery's coming down!"] },
          { frame: 60 * 42, say: ["LineSergeant", "Hold the doors! HOLD!"] },
        ],
      },
      tutorial: [{ at: 0.5, text: "The Last Line holds the great doors of the throne chamber. Hold with it." }],
      lines: [["LineSergeant", "Last Line! The doors!"]],
      retryBy: "Cal", retry: "No. That's not how it went." },
    { id: "charge", type: "scene", node: "Ep49_Charge", ...THRONE,
      rook: { x: 0.4, z: -14.6, yaw: Math.PI },
      cast: [{ id: "corin", look: "heroKnightSurge", x: 0.4, z: -18.2, yaw: 0 }, ...ranks([-16, -12]).map((r) => ({ ...r, stars: undefined }))] },
    { id: "failing", type: "scene", node: "Ep49_Failing", ...THRONE, rook: null,
      cast: [{ id: "fallen", look: "ashSoldierBare", x: 0.8, z: -4.2, yaw: 0, down: true }] },
    { id: "void", type: "cutscene", cutscene: "ep49_void", set: { EP49_DONE: 1, BACKLASH_SEEN: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep50",
      lines: [
        "Next time on UNWRITTEN: The First Time.",
        "Out here, a breath. The debris that hung in the air finishes falling.",
      ] },
  ],
};
