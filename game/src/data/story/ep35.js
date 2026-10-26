// Episode 35 · The Watch Holds (GDD §14 Arc 4: Aldric's coup takes shape). Overnight the Chancellor's Lances take the
// south gate and post his orders on every board: the city is under the Crown's protection, the City Watch is stood
// down, the Lanterns are confined to their lighthouse. The Watch won't stand down. Break the confinement, come in
// through the Lowmarket, cross a city full of Lance patrols to the Watch House (sim/sentry.js), and take the gate back
// beside the Watch: Luke, if he joined, fights next to you. Halvard comes to the gate afterward with a challenge.

import { AFTER_EP34 } from "./arc4.js";
import { ZONES, AURELIN_LAYOUT as A } from "../zones.js";

export const EP35_SCRIPT = `
title: Ep35_Cold
---
<<shot wide>>
Aurelin, two hours before dawn. Lances at the south gate, and a Lance at every notice board with a hammer and a stack of paper.
<<shot on Halvard>>
Halvard: By order of the High Chancellor. The city is under the Crown's protection. The City Watch is stood down until further notice. Go home.
<<shot on Sergeant>>
Sergeant: The Watch answers to the city, Commander. Not to the Chancellor.
<<shot on Halvard>>
Halvard: Tonight, Sergeant, the city is the Chancellor. ...Go home, Holt. Please.
<<shot on Sergeant>>
Sergeant: I am home. I've been home for twenty years. You're the one standing in it.
===

title: Ep35_News
---
<<shot wide>>
Morning at the Lighthouse. A Crown courier has been and gone, and Dagrun is reading what he left as if it might bite.
<<shot on Dagrun>>
Dagrun: "The Lanterns will remain at their headquarters for their own protection until order is restored." Signed by the Chancellor. Sealed by the Chancellor. Delivered by six Lances who are still standing on my road.
<<shot on Severin>>
Severin: He's taking the city. He's actually doing it.
<<shot on Juno>>
Juno: The Watch won't stand down. They've shut themselves in the Watch House by the gate.
<<if $LUKE_GUARD>>
    <<shot on Juno>>
    Juno: Luke's in there. Elsie came out to the Lighthouse at dawn to tell me. She walked the whole way.
<<endif>>
<<shot on Lio>>
Lio: The road's watched. The gate's held. But Juno's lot came in under the Lowmarket last month, and nobody's thought to watch the grate.
<<shot on Dagrun>>
Dagrun: Then we're going to break a confinement order. Bas stays with Elodie. The rest of you, the Lowmarket way. Quietly.
<<shot two Severin Rook>>
-> "Quietly. We've done quietly." #wry
    Severin: You knocked down a Lance last time.
-> "And when we get there?" #earnest
    Severin: We take the gate back. It's not his gate.
===

title: Ep35_Knock
---
You knock on the Watch House door: three short, one long. A bolt slides back.
<<set $WATCH_KNOCK to 1>>
===

title: Ep35_Juno
---
Juno: Lances on every corner, and nobody on the streets. I've never seen Aurelin this quiet. I hate it.
Juno: Stay out of their lanterns, like in the Crown Ward. I'll meet you at the Watch House. I'm the one who knows the knock.
===

title: Ep35_Watch
---
<<shot wide>>
The Watch House is full. The Watch, their families, a goat, and everyone who had nowhere else to go.
<<shot on Sergeant>>
Sergeant: Lanterns. Took your time. We've got twelve men, nine spears, and one goat, which isn't ours.
<<if $LUKE_GUARD>>
    <<shot on Luke>>
    Luke: You came. I told them you'd come. Well. I told them I didn't care whether you came. Which is the same thing.
    <<shot on Luke>>
    Luke: I joined to keep people safe, not to sit in a building while somebody else's soldiers stand in our gate. I'm going out there. Are you?
<<endif>>
<<shot on Severin>>
Severin: The gate. We take it back, and we hold it, and the city sees us hold it.
<<shot on Sergeant>>
Sergeant: The Lances won't kill Watchmen, not yet. Nobody wants to be first. That's our advantage.
<<shot on Sergeant>>
Sergeant: Watch! On me. Lanterns in front, because they're paid more.
===

title: Ep35_Held
---
<<shot wide>>
The gate is the Watch's again. The Lances who are still standing have backed off up the road, and up and down the street, shutters are opening.
<<if $LUKE_GUARD>>
    <<shot on Luke>>
    Luke: Did you see that? Did everybody see that? ...Somebody tell Elsie. Somebody tell Elsie I didn't run.
<<endif>>
<<show Halvard>>
<<shot on Halvard>>
Halvard comes down the road alone, without his helm, and stops a spear's length from the gate.
Halvard: The Chancellor's compliments. He'd like this settled, and he'd like it settled where the city can watch.
Halvard: Tomorrow, at dawn, in front of the Hall of Lanterns. Your best against his. That's me, I'm afraid.
<<shot on Severin>>
Severin: And if we win?
<<shot on Halvard>>
Halvard: Then the Lances go back to their barracks, the Watch keeps its gate, and the Chancellor finds another way. He always does.
<<shot two Rook Halvard>>
-> "We'll be there." #bold
    Halvard: I know. That's what worries me.
-> "You don't want this either." #earnest
    Halvard: What I want stopped mattering thirty years ago, Lantern. Dawn.
<<set $GATE_HELD to 1>>
===
`;

const AU = { stage: "aurelin" }, LH = { stage: "lighthouse" }, WH = { stage: "watchhouse" };
const TABLE = { x: 5, z: 6 };   // the Lighthouse's long table
// The fight for the gate: the gate road inside the walls, with the cart and the notice board in the way.
const GATE_ROAD = { rect: [-12, -33, 12, -12], solids: ZONES.aurelin.bounds.solids };
const gateFight = (extra) => ({ type: "fight", ...AU, sky: { daylight: 0.5 }, wave: ["lance", "lance", "lance", "lance"], tokens: 2,
  tutorial: [{ at: 0.5, text: "Lances hold their shields up between attacks. Get round the side, or break the guard; the red glint is a charge." }],
  retry: "Up. The Watch is watching.", ...extra });

export const EPISODE_35 = {
  id: "ep35",
  number: 35,
  unlockAt: 5,
  setup: { ...AFTER_EP34 },
  title: "The Watch Holds",
  arc: "Arc 4 · The Unanswered Door",
  world: { companions: ["juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep35_Cold", ...AU, rook: null, sky: { daylight: 0.05 },
      cast: [
        { id: "halvard", look: "halvardFace", x: A.notice.x + 0.2, z: A.notice.z - 1.6, yaw: 0.6 },
        { id: "sergeant", look: "sergeant", x: A.notice.x + 2.8, z: A.notice.z - 2.4, yaw: -1.6 },
        { id: "lance1", look: "lance", x: A.notice.x - 2.0, z: A.notice.z - 2.6, yaw: 0.4 },
      ] },
    { id: "title", type: "title" },
    { id: "news", type: "scene", node: "Ep35_News", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "severin", look: "severin", x: TABLE.x + 1.6, z: TABLE.z + 2.9, yaw: Math.PI },
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
      ] },
    { id: "streets", type: "explore", ...AU, sky: { daylight: 0.4 },
      rook: { x: 28.6, z: -20.6, yaw: -Math.PI / 2 },
      objective: "Cross the city to the Watch House by the south gate without the Lance patrols seeing you. Stay out of their lantern light.",
      required: ["door"], counts: "required",
      cast: [{ id: "juno", look: "juno", x: 26.4, z: -18.6, yaw: -1.8, node: "Ep35_Juno" }],
      pickups: [{ id: "door", x: A.watch.x + 0.9, z: A.watch.z, marker: false, node: "Ep35_Knock", label: "Knock on the Watch House door" }],
      sentries: [
        { id: "market", route: [[8, -5.5], [15, -14]] },
        { id: "fountain", route: [[6.5, -5.2], [-6.5, -5.2]] },
        { id: "road", route: [[-2.4, -13.5], [-2.4, -26]] },
        { id: "watch", route: [[-10.6, -23.6], [-10.6, -14.5]], wait: 2.2 },
      ],
      spotted: { wave: ["lance"], label: "SPOTTED" }, spottedFlag: "EP35_SPOTTED" },
    { id: "watch", type: "scene", node: "Ep35_Watch", ...WH,
      rook: { x: 0, z: -3.6, yaw: 0 },
      cast: [
        { id: "sergeant", look: "sergeant", x: -2.6, z: -1.1, yaw: Math.PI * 0.85 },
        { id: "luke", look: "luke", x: 1.8, z: -1.0, yaw: -2.6, when: "$LUKE_GUARD" },
        { id: "severin", look: "severin", x: -1.3, z: -3.9, yaw: 0.4 },
        { id: "juno", look: "juno", x: 1.4, z: -4.0, yaw: -0.4 },
      ] },
    { id: "gate", if: "$LUKE_GUARD", ...gateFight({ world: { companions: ["juno", "luke"], bounds: GATE_ROAD, origin: { x: 0, z: -22 } },
      lines: [["Luke", "Not my gate. Not his either. Ours."], ["Juno", "Show-off."]] }) },
    { id: "gateHolt", if: "not $LUKE_GUARD", ...gateFight({ world: { companions: ["juno"], bounds: GATE_ROAD, origin: { x: 0, z: -22 } },
      lines: [["Sergeant", "Watch! Hold the line behind them!"], ["Juno", "Valcourt blue again. I'm getting sick of it."]] }) },
    { id: "held", type: "scene", node: "Ep35_Held", ...AU, sky: { daylight: 0.35 },
      rook: { x: 0.6, z: -26.4, yaw: 0 },
      cast: [
        { id: "sergeant", look: "sergeant", x: -2.4, z: -27.2, yaw: 0.4 },
        { id: "luke", look: "luke", x: 2.8, z: -27.0, yaw: -0.4, when: "$LUKE_GUARD" },
        { id: "juno", look: "juno", x: -1.2, z: -24.8, yaw: 0.2 },
        { id: "severin", look: "severin", x: 2.0, z: -24.6, yaw: -0.2 },
        { id: "halvard", look: "halvardFace", x: 0.4, z: -19.8, yaw: Math.PI, hidden: true },
      ],
      set: { EP35_DONE: 1, WATCH_STANDS: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep36",
      lines: [
        "Next time on UNWRITTEN:",
        "Dawn, in front of the Hall of Lanterns, with the whole city at its windows.",
        "Lance-Commander Halvard, for the Chancellor.",
      ] },
  ],
};
