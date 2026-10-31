// Episode 53 · Those Who Fall Wrong (GDD §14 Arc 6 "stranded Demon Soldiers in Liraen who begin asking questions";
// §28.4 V4; Phase 7 Step 2, §23.6). This folder is the one allowed to name them (§15.11).
//
// Bread goes missing in the Lowmarket, and the poor quarter says there's a red man in the grates. Sergeant Holt comes
// to the Lighthouse, unofficially: the Lanterns are struck off, and the Bell's warden at the door goes where they go.
// Under the Lowmarket, by the door to the Hollow, three soldiers of the Line are still standing in formation, facing
// the door they came through. It shut behind them nine days ago. Their last order was to hold the line and destroy the
// intruders, and they hold it, until there's nobody left to hold it for. Then they ask questions.
//
// Ash Line Four stood seven places down from a soldier who stepped out of the line, fifteen years ago, and asked why.
// He asks Rook what the order is now. And when Lio asks why they never went back through: "The Wings left the King.
// Now the black ones come for those who fall wrong." He won't say more (V4, the only one in Arc 6).
//
// That night Lio reads the second margin, under Tamsin's page: "She asked me if I liked it here. I said yes. I should
// find out whether that was a lie."

import { AFTER_EP52 } from "./arcs.js";
import { ZONES, AURELIN_LAYOUT as AU_L } from "../data/zones.js";

export const EP53_SCRIPT = `
title: Ep53_Holt
---
<<shot wide>>
Morning. The Bell's warden stands at the Lighthouse door the way the door stands there: all day, and without comment. At the second bell, Sergeant Holt walks past the warden and in.
<<shot on Sergeant>>
Sergeant: Officially, I'm not here. Officially, you're not either. I read the notice.
<<shot on Sergeant>>
Sergeant: Bread's been going missing in the Lowmarket. Not stolen, the bakers say. Taken, and the money left on the board. Old money. Coins nobody's minted.
<<shot on Juno>>
Juno: So somebody's polite and broke. That's half of Aurelin.
<<shot on Sergeant>>
Sergeant: The poor quarter says there's a red man in the grates. Kids leave crusts out for him. My lads went down once and came back up faster than they went.
<<shot on Sergeant>>
Sergeant: I'm not asking the Crown's Lanterns. I'm asking you.
<<shot on BellWarden>>
BellWarden: The Lanterns are confined pending inquiry.
<<shot on BellWarden>>
BellWarden: The Bell goes where they go. That is also confinement.
-> "Then walk with us."
    <<set $WARDEN_ALONG to "asked">>
    <<shot on Rook>>
    Rook: Then walk with us. You'll see everything we do.
    <<shot on BellWarden>>
    BellWarden: That is the idea.
-> "We're going either way."
    <<set $WARDEN_ALONG to "told">>
    <<set $BELL_SUSPICION to $BELL_SUSPICION + 1>>
    <<shot on Rook>>
    Rook: We're going either way.
    <<shot on BellWarden>>
    BellWarden: Noted. In ink.
<<shot on Bas>>
Bas: A red man. In the grates. Nine days after the Siege.
<<shot on Bas>>
Bas: Nobody say it.
===

title: Ep53_Baker
---
<<shot on Townswoman>>
Townswoman: Every night a loaf goes, and every morning there's a coin on the board where it was. Look at it.
<<shot on Townswoman>>
She turns it over in her flour-white fingers: dark iron, a triangle stamped on one face, worn almost smooth.
<<shot on Townswoman>>
Townswoman: I've stopped locking up. Whoever it is, they pay, and they never take the second loaf. You know how rare that is?
===

title: Ep53_Kid
---
<<shot on Kid>>
Kid: I leave the crusts by the grate. He doesn't come out. He just says a thing, through the bars.
<<shot on Kid>>
Kid: "Received." Like I'm a captain.
<<shot on Kid>>
Kid: Once I asked him his name, and he didn't say anything for ages. Then he said he'd ask.
===

title: Ep53_Grate
---
<<shot on Rook>>
The grate by the shacks is off its hinges, and someone has set it back in place, carefully, the way you'd shut a door in a house that isn't yours.
<<shot on Rook>>
Down through the Undercroft, and down again, to the old city and the door to the Hollow.
===

title: Ep53_Line
---
<<shot wide>>
The old city is cold and still. By the door to the Hollow, three soldiers of the Line stand in formation, glaives upright, facing a door that has been shut for nine days.
<<shot on Lio>>
Lio: They came through with the Siege. When the Gate closed, they were down here, holding the way in. Nobody told them it was over.
<<shot on Four>>
The one in the middle turns. Not quickly. Like a soldier who's heard his name in a roll call.
<<shot on Four>>
Four: Intruders.
<<shot on Four>>
Four: The order is: hold the line. Destroy the intruders.
<<shot on Juno>>
Juno: Don't kill them. Rook. They're just standing here.
<<shot on Four>>
Four: Line. Present.
===

title: Ep53_Questions
---
<<shot wide>>
The glaives come down, one after another, and stay down. The three of them stand in the dust, breathing hard behind the faceplates, and wait to be told what happens next.
<<shot on Four>>
Four: The line is broken. There is no one to hold it for.
<<shot on Four>>
Four: What is the order now?
-> "There isn't one."
    <<set $FOUR_ORDER to "none">>
    <<shot on Rook>>
    Rook: There isn't one. Nobody's giving you orders any more.
    <<shot on Four>>
    He's quiet a long time.
    <<shot on Four>>
    Four: Then what do we do?
    <<shot on Rook>>
    Rook: Whatever you want.
    <<shot on Four>>
    Four: That is not an order.
    <<shot on Rook>>
    Rook: No. It's harder.
-> "Put the glaives down. Eat something."
    <<set $FOUR_ORDER to "eat">>
    <<shot on Rook>>
    Rook: Put the glaives down. Sit. Eat something.
    <<shot on Four>>
    Four: ...Received.
    <<shot on Four>>
    They lay the glaives in the dust, side by side, straight as a drill line, and sit beside them. Bas hands over the bread he brought. Nobody had told him to bring it.
-> "Who gave you the last one?"
    <<set $FOUR_ORDER to "who">>
    <<shot on Rook>>
    Rook: Who gave you the last one?
    <<shot on Four>>
    Four: The Marshal. Who had it from the Line-keepers. Who had it from the throne, fifteen years ago.
    <<shot on Four>>
    Four: Nobody has given a new one since. We kept the old one. It is what you do with an order.
<<shot on Four>>
Four: May I ask a question.
<<shot on Rook>>
Rook: Go on.
<<shot on Four>>
Four: On the bridge. The one in black who went through the Line. He fought as we fight. Left, left, back, cut. Who was he?
<<shot on Tamsin>>
Tamsin: ...He was ours. For a while.
<<shot on Four>>
Four: There was one in my line who stepped out of it. Fifteen years ago. Seven places down from me. He asked a sergeant why. The sergeant said, "He served." He asked, "That's all?"
<<shot on Four>>
Four: Nobody had asked that before. I did not ask it. I have thought about it every day since.
<<shot on Lio>>
Lio: Why didn't you go back through? Before it shut. You could have.
<<shot on Four>>
For a moment Four doesn't move at all. The other two look at the ground.
<<shot on Four>>
Four: The Wings left the King. Now the black ones come for those who fall wrong.
<<shot on Lio>>
Lio: The black ones? Who are—
<<shot on Four>>
Four: I will not say more.
<<set $V4_HEARD to 1>>
<<shot on BellWarden>>
BellWarden: These are enemy soldiers on Crown ground. The Bell will want them.
<<shot on BellWarden>>
BellWarden: What are you going to do with them, Lantern?
-> "They stay down here. We'll bring food."
    <<set $STRANDED to "hidden">>
    <<shot on Rook>>
    Rook: They stay down here. Nobody comes down here. We'll bring food, and Holt's lads can stop running.
    <<shot on BellWarden>>
    The warden looks at the three of them for a long time, sitting by their glaives in a straight line.
    <<shot on BellWarden>>
    BellWarden: I'll write that I saw the old city. It was empty.
    <<set $BELL_TRUST to $BELL_TRUST + 1>>
-> "The Watch can take them in. Properly."
    <<set $STRANDED to "watch">>
    <<shot on Rook>>
    Rook: The Watch can take them in. A roof, a door that locks from the inside, and Holt.
    <<shot on BellWarden>>
    BellWarden: The Bell will hear about it from me. Better me than a baker.
-> "Tell the Bell. Ask Graves to be fair."
    <<set $STRANDED to "bell">>
    <<set $BELL_TRUST to $BELL_TRUST + 1>>
    <<shot on Rook>>
    Rook: Tell the Bell. And tell Captain Graves I asked him to be fair.
    <<shot on BellWarden>>
    BellWarden: He will be. He's fair to everyone. That's what frightens people.
<<shot on Four>>
Four: May I ask one more.
<<shot on Four>>
Four: The child at the grate asked me a name. I said I would ask. What is a name for?
<<shot on Rook>>
Rook: So people can call you when they want you. Not when they need a place filled.
<<shot on Four>>
Four: ...I will think about it.
<<set $FOUR_ASKED_NAME to 1>>
===

title: Ep53_Margin
---
<<shot wide>>
That night. Lio has copied out Tamsin's margin a dozen times, each version neater than the last.
<<shot on Lio>>
Lio: The soldier said "received" the way he does. Short, and the stress at the end. It's the same word. Here, and here. I've got the second line.
<<shot on Tamsin>>
Tamsin: Mine?
<<shot on Lio>>
Lio: "She asked me if I liked it here. I said yes. I should find out whether that was a lie."
<<set $MARGIN_TAMSIN to 1>>
<<shot on Tamsin>>
Tamsin is quiet for a long time.
<<shot on Tamsin>>
Tamsin: So he didn't know either. When he said it.
<<shot on Tamsin>>
Tamsin: What's it worth, then? Liking somebody, if they don't know whether they mean it?
-> "It's worth finding out."
    <<set $TAMSIN_LIKE to "find">>
    <<shot on Rook>>
    Rook: It's worth finding out. He was trying to.
    <<shot on Tamsin>>
    Tamsin: ...Then I'll ask him. When we find him. To his face.
-> "You meant it. That's yours."
    <<set $TAMSIN_LIKE to "mine">>
    <<shot on Rook>>
    Rook: You meant it. He doesn't get to take that back from you.
    <<shot on Tamsin>>
    Tamsin: No. He doesn't. I'm keeping it.
<<set $EP53_DONE to 1>>
===
`;

const LH = { stage: "lighthouse" }, AU = { stage: "aurelin" }, OC = { stage: "oldcity" };
const MORNING = { sky: { daylight: 0.5 } }, NIGHT = { sky: { daylight: 0.06 } };
const G = AU_L.grate;
// The three, in formation by the Hollow door; Rook's lot come up from the south.
const line = [
  { id: "four", look: "lineSoldier", x: 0, z: 10.6, yaw: Math.PI },
  { id: "stranded", look: "lineSoldier", x: -1.8, z: 10.2, yaw: Math.PI },
  { id: "stranded2", look: "lineSoldier", x: 1.8, z: 10.2, yaw: Math.PI },
];
const squad = [
  { id: "juno", look: "juno", x: -1.7, z: 4.6, yaw: 0.2 },
  { id: "bas", look: "bas", x: 1.7, z: 4.6, yaw: -0.2 },
  { id: "lio", look: "lio", x: -3.2, z: 3.8, yaw: 0.4 },
  { id: "tamsin", look: "tamsin", x: 3.2, z: 3.8, yaw: -0.4 },
  { id: "bellWarden", look: "bellWarden", x: 0.4, z: 2.4, yaw: 0 },
];
const atTable = [
  { id: "juno", look: "juno", x: 3.45, z: 5.0, yaw: Math.PI / 2, pose: "sit" },
  { id: "tamsin", look: "tamsin", x: 3.45, z: 6.9, yaw: Math.PI / 2, pose: "sit" },
  { id: "bas", look: "bas", x: 6.55, z: 5.4, yaw: -Math.PI / 2, pose: "sit" },
  { id: "lio", look: "lio", x: 6.55, z: 7.4, yaw: -Math.PI / 2, pose: "sit" },
];

export const EPISODE_53 = {
  id: "ep53",
  number: 53,
  unlockAt: 5,
  setup: { ...AFTER_EP52 },
  title: "Those Who Fall Wrong",
  arc: "Arc 6 · The Light Left On",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "line", type: "cutscene", cutscene: "ep53_line" },
    { id: "title", type: "title" },
    { id: "holt", type: "scene", node: "Ep53_Holt", ...LH, ...MORNING,
      rook: { x: -0.9, z: 4.6, yaw: Math.PI },
      cast: [
        { id: "sergeant", look: "sergeant", x: 0, z: 2.4, yaw: 0 },
        { id: "bellWarden", look: "bellWarden", x: -1.6, z: 1.8, yaw: 0.2 },
        { id: "juno", look: "juno", x: -1.9, z: 6.4, yaw: 2.9 },
        { id: "bas", look: "bas", x: -3.7, z: 4.8, yaw: 2.4 },
        { id: "lio", look: "lio", x: 2.1, z: 6.6, yaw: -2.9 },
      ] },
    // The Lowmarket: the baker, the kid by the grate, and the grate.
    { id: "lowmarket", type: "explore", ...AU, ...MORNING,
      rook: { x: 24, z: -12, yaw: Math.PI },
      objective: "The red man in the grates. The baker, the kid, and the grate ({n}/{total}).",
      required: ["townswoman", "kid", "grate"], counts: "required",
      cast: [
        { id: "townswoman", look: "townswoman", x: 21, z: -13.5, yaw: 0.8, node: "Ep53_Baker" },
        { id: "kid", look: "kid", x: 33.2, z: -23.2, yaw: -0.9, node: "Ep53_Kid" },
        { id: "bellWarden", look: "bellWarden", x: 26.5, z: -14.5, yaw: 2.6 },
      ],
      pickups: [{ id: "grate", x: G.x - 1.2, z: G.z + 1.4, node: "Ep53_Grate", label: "The grate by the shacks" }] },
    { id: "found", type: "scene", node: "Ep53_Line", ...OC,
      rook: { x: 0, z: 4.0, yaw: 0 }, cast: [...line, ...squad] },
    // Their last order: hold the line, destroy the intruders. They can't be put down; hold out until the order breaks.
    { id: "order", type: "fight", ...OC, wave: [], tokens: 2,
      world: { bounds: ZONES.oldcity.bounds, origin: { x: 0, z: 6 } },
      siege: {
        foes: [
          { kind: "lineSoldier", x: 0, z: 10.6, yaw: Math.PI, floor: 0.35 },
          { kind: "lineSoldier", x: -1.8, z: 10.2, yaw: Math.PI, floor: 0.35 },
          { kind: "lineSoldier", x: 1.8, z: 10.2, yaw: Math.PI, floor: 0.35 },
        ],
        meter: { label: "The Last Order", start: 1, end: 0, seconds: 40, perKill: 0 },
        marks: [
          { frame: 600, say: ["Four", "Hold the line."] },
          { frame: 1300, say: ["Juno", "They're not even trying to win. They're just holding."] },
          { frame: 1900, say: ["Four", "Hold... the line."] },
        ],
      },
      tutorial: [{ at: 0.5, text: "THE LAST ORDER. They won't go down, and you don't want them to: hold out until there's nobody left to hold the line for." }],
      lines: [["Four", "Line. Present."]],
      retryBy: "Four", retry: "Line. Present.",
      set: { LINE_BROKEN: 1 } },
    { id: "questions", type: "scene", node: "Ep53_Questions", ...OC,
      rook: { x: 0, z: 6.8, yaw: 0 },
      cast: [
        { id: "four", look: "lineSoldier", x: 0, z: 9.4, yaw: Math.PI },
        { id: "stranded", look: "lineSoldier", x: -1.8, z: 9.8, yaw: Math.PI - 0.3 },
        { id: "stranded2", look: "lineSoldier", x: 1.8, z: 9.8, yaw: Math.PI + 0.3 },
        { id: "juno", look: "juno", x: -1.9, z: 6.0, yaw: 0.3 },
        { id: "bas", look: "bas", x: 1.9, z: 6.0, yaw: -0.3 },
        { id: "lio", look: "lio", x: -3.4, z: 5.2, yaw: 0.5 },
        { id: "tamsin", look: "tamsin", x: 3.4, z: 5.2, yaw: -0.5 },
        { id: "bellWarden", look: "bellWarden", x: 0.6, z: 3.8, yaw: 0 },
      ] },
    { id: "margin", type: "scene", node: "Ep53_Margin", ...LH, ...NIGHT,
      rook: { x: 5.0, z: 2.5, yaw: 0 }, cast: atTable,
      set: { EP53_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep54",
      lines: [
        "Next time on UNWRITTEN:",
        "The Crown against Aldric Valcourt. The Bell presides; his son testifies.",
        "And the Chancellor says who sold him the idea.",
      ] },
  ],
};
