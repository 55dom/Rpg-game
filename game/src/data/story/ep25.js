// Episode 25 · What Lio Knew (GDD §14 Arc 3). The Pale Choir comes to the Lighthouse to take back one of its
// own, and Lio's secret comes out: he was a novice of the Choir's silent school, sent to watch for the
// Palimpsest, a book written over another book, and it was Rook's. The squad splits over him. Rook decides:
// forgive him (LIO_STATUS 2) or send him away for now (LIO_STATUS 1). Either way he's back by Ep 28.
// The episode ends with the Crown's orders: guard the vault beneath Ironhold.

import { AFTER_EP24 } from "./arc3.js";

export const EP25_SCRIPT = `
title: Ep25_Cold
---
<<shot wide>>
Night at the Lighthouse. Everyone is asleep but Lio. He sits at the long table with a lamp, a pen, and a letter he has started four times.
<<shot on Lio>>
Lio: "The Palimpsest is..." No.
Lio: "The Palimpsest has..." No.
He holds the page over the lamp until it catches, and drops it in the stove.
<<fx rift Lio>>
The air beside him splits. A thin pale seam, no wider than a hand. A folded paper slides out of it onto the table, and the seam closes.
<<shot on Lio>>
Four lines, in a hand he knows: "Brother Lio. The Palimpsest wakes. You were to report. Report, or be silenced."
Lio: Not yet. ...Not ever.
He burns that one too. He doesn't see that the stove door doesn't shut all the way.
===

title: Ep25_Ashes
---
<<shot wide>>
Morning. The squad comes down to breakfast and finds Juno at the table, holding something black and curled between two fingers.
<<shot on Juno>>
Juno: Half a letter. It didn't burn all the way. There's a mark at the bottom.
Under the soot is a pale circle crossed by one line. A mouth, sewn shut.
<<shot on Dagrun>>
Dagrun: That's the Pale Choir's seal.
<<shot on Juno>>
Juno: In our stove. In our house. Who's been writing to the Choir?
Nobody says anything. Then everyone is looking at Lio, because Lio is looking at the floor.
<<shot on Juno>>
Juno: At the vigil, Wraithe put two fingers to his mouth. At you. I saw it. I told myself I'd made it up.
<<shot on Lio>>
Lio: You didn't make it up.
<<shot two Lio Rook>>
-> "Lio. Talk to us." #earnest
    Lio: I will. I've been trying to for two years. Let me say all of it, before I lose my nerve. I was...
-> "Is it true?" #bold
    Lio: Yes. ...Yes. Let me say all of it, before I lose my nerve. I was...
<<shot wide>>
Every lamp in the Lighthouse goes out at once. Out on the dry sea, pale seams are opening in the dark.
<<shot on Tamsin>>
Tamsin: Oh no. Oh, no, no. They've come to collect.
<<shot on Dagrun>>
Dagrun: Then they can take it up with me. Lanterns, out. Nobody takes anyone from this house.
===

title: Ep25_Confession
---
<<shot wide>>
The last of the Choir go back through their seams. One doesn't make it: an acolyte on his knees in the sand, Bas's hand on his shoulder.
<<shot on Acolyte>>
Acolyte: Brother Lio. You swore three letters. We had two.
Acolyte: The silent school remembers its own. It will remember you.
<<shot on Bas>>
Bas lets go. The acolyte runs out onto the dry sea, and a seam takes him.
<<shot on Lio>>
Lio: I was nine. The Choir took in orphans. Food, a bed, a school where they teach you not to speak a spell. Then not to speak at all.
Lio: When I was fifteen they sent me to the archive at the Tower of Choosing, to wait. They said a book would come one day that was written over another book. A palimpsest. Scraped clean, with something still underneath.
Lio: They believe whoever reads what's underneath can unwrite anything. A fate. A name. A war.
<<shot two Lio Rook>>
Lio: Then the Tower handed you one page, {name}. And it was the book.
-> "My grimoire." #earnest
    Lio: Your grimoire. One page on top, and something under it nobody has read. Not me either. I swear that.
-> "So you came to the Lanterns to watch me." #bold
    Lio: I asked Dagrun for the archivist's post the week after your exam. He said yes because nobody else wanted it.
    <<shot on Dagrun>>
    Dagrun: I did. Nobody else did.
<<shot on Lio>>
Lio: I wrote them two letters. The first said: the Palimpsest is with the Lanterns. The second, the night your book bled ink at the Tower: it's started.
Lio: I never sent the third. I stopped. I stayed. I don't know when I stopped being theirs. I know that I'm not.
<<shot on Juno>>
Juno: Two years. You sat at our table for two years.
Lio: I know.
Juno: You were there at the end, with Cal. You knew what they wanted, and you said nothing.
Lio: I know. I'm sorry. That's all I have, and I know it isn't enough.
<<shot on Dagrun>>
Dagrun: Everyone breathe. Nobody decides anything angry. Talk to each other first. Then we decide.
<<set $LIO_SECRET to 1>>
===

title: Ep25_Juno
---
Juno: Send him away. ...I don't mean forever. I mean I can't look at him over breakfast. Not this week. Not after Cal. Not after Brannoc.
-> "And if he stays?" #earnest
    Juno: Then I'll manage. I always manage. I'd just like, once, not to have to.
-> "You're allowed to be angry." #wry
    Juno: I know I'm allowed. I'm just tired of being right about people.
===

title: Ep25_Bas
---
Bas: He carried me out of the Fens when my leg went. Two miles, through the mud, talking the whole way so I wouldn't sleep.
Bas: The Choir didn't ask him to do that. Keep him, {name}. A wall's made of stones from all over. Nobody asks where they came from.
===

title: Ep25_Tamsin
---
Tamsin: I can't decide. I keep writing two endings to this song. In one he stays, and it's sad. In the other he goes, and it's sadder.
Tamsin: Whichever you pick, I'll sing it. I'll just sing it quietly.
===

title: Ep25_Dagrun
---
Dagrun: It's your book he was watching. That makes it your call, {name}. I'll back you either way.
Dagrun: For what it's worth: two years of watching, and every time it mattered, he looked away.
===

title: Ep25_Lio
---
Lio: Whatever you decide, I'll do. If you tell me to go, I'll go tonight. If you tell me to stay, I'll spend however long it takes to earn the chair back.
===

title: Ep25_Decide
---
<<shot wide>>
Dusk. The squad on the Lighthouse steps. Lio stands below them on the sand with his satchel already packed.
<<shot two Lio Rook>>
Lio: It's yours to say, {name}. It was always your book.
-> "Stay. We'll work it out together." #earnest
    <<set $LIO_STATUS to 2>>
    <<set $BOND_LIO to $BOND_LIO + 10>>
    Lio: ...Thank you.
    <<shot on Juno>>
    Juno: Fine. But I'm watching you, Varnish. Every letter you write, I'm reading over your shoulder.
    <<shot on Lio>>
    Lio: That's fair. My handwriting's terrible. You'll hate it.
    <<shot on Dagrun>>
    Dagrun: Then it's done. Nobody brings it up at dinner. Bas, put the kettle on.
-> "Go. For now. Until we can trust you again." #bold
    <<set $LIO_STATUS to 1>>
    Lio: ...All right. That's fair. That's more than fair.
    Lio: I'll be at the archive in the Hall of Lanterns. When you want to know what the Choir wants with your book, come and ask. I'll tell you everything I know, and keep reading until I know more.
    <<shot on Bas>>
    Bas looks away. Juno doesn't say anything at all.
    <<shot on Dagrun>>
    Dagrun: The Lanterns don't throw people away, Lio. We just set them down for a while. Don't get comfortable over there.
    <<shot wide>>
    Lio walks up the road toward Aurelin. He doesn't look back until the top of the hill, and then he does.
===

title: Ep25_Orders
---
<<shot wide>>
Night. A Crown rider at the Lighthouse door, and a grey-robed archivist behind her who looks like she hasn't slept in a week.
<<shot on Archivist>>
Archivist: Captain Holt. By the Paragon's order, the Lanterns will go to Ironhold and guard the vault beneath it.
<<shot on Dagrun>>
Dagrun: There's a vault beneath Ironhold?
<<shot on Archivist>>
Archivist: There are vaults beneath a great many things, Captain. Two were opened this month. No lock broken. No guard hurt. Just a cut in the wall, like a wound, and an empty shelf behind it.
Archivist: The Wardens say a man in a mask brought a war engine down out of the sky. The Paragon would like to know who else can cut a door in the world.
<<shot two Dagrun Rook>>
Dagrun: Pack for the cold, {name}. It's under a mountain.
<<set $HAS_VAULT_ORDERS to 1>>
===
`;

const LH = { stage: "lighthouse" };
const TABLE = { x: 5, z: 6 }; // the long table (as in Ep 23)
const SAND = { x: 2, z: -9 }; // the dry sea's edge, south of the house

export const EPISODE_25 = {
  id: "ep25",
  number: 25,
  unlockAt: 5,
  setup: { ...AFTER_EP24 },
  title: "What Lio Knew",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep25_Cold", ...LH, rook: null,
      cast: [{ id: "lio", look: "lio", x: TABLE.x - 1.35, z: TABLE.z + 0.6, yaw: Math.PI / 2 }] },
    { id: "title", type: "title" },
    { id: "ashes", type: "scene", node: "Ep25_Ashes", ...LH,
      rook: { x: TABLE.x + 1.6, z: TABLE.z - 2.2, yaw: -0.6 },
      cast: [
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2 },
        { id: "lio", look: "lio", x: TABLE.x + 2.6, z: TABLE.z + 1.2, yaw: -2.2 },
        { id: "dagrun", look: "dagrun", x: TABLE.x - 1.4, z: TABLE.z - 2.6, yaw: 0.6 },
        { id: "tamsin", look: "tamsin", x: TABLE.x + 0.4, z: TABLE.z - 3.2, yaw: -0.2 },
        { id: "bas", look: "bas", x: TABLE.x - 2.8, z: TABLE.z - 1.4, yaw: 1.1 },
      ] },
    { id: "raid", type: "fight", ...LH, wave: ["acolyte", "cantor", "acolyte", "bulwark", "acolyte"], tokens: 2,
      tutorial: [{ at: 0.5, text: "The Pale Choir has come for Lio. Drive them back into their seams." }],
      lines: [["Dagrun", "Nobody takes anyone from this house!"], ["Juno", "We're not finished talking, Lio!"]],
      retry: "Up. They don't get him." },
    { id: "confession", type: "scene", node: "Ep25_Confession", ...LH,
      rook: { x: SAND.x + 1.2, z: SAND.z + 2, yaw: Math.PI * 0.85 },
      cast: [
        { id: "acolyte", look: "acolyte", x: SAND.x - 0.4, z: SAND.z - 0.6, yaw: 0.3 },
        { id: "bas", look: "bas", x: SAND.x - 1.4, z: SAND.z - 1.6, yaw: 0.6 },
        { id: "lio", look: "lio", x: SAND.x - 1.8, z: SAND.z + 1.4, yaw: 1.8 },
        { id: "juno", look: "juno", x: SAND.x + 2.6, z: SAND.z + 0.6, yaw: -1.8 },
        { id: "dagrun", look: "dagrun", x: SAND.x + 0.2, z: SAND.z + 3.4, yaw: Math.PI },
        { id: "tamsin", look: "tamsin", x: SAND.x + 2.4, z: SAND.z + 2.8, yaw: -2.4 },
      ] },
    { id: "sides", type: "explore", ...LH,
      rook: { x: SAND.x + 1.2, z: SAND.z + 2.4, yaw: 0 },
      objective: "Lio's secret is out. Hear what the squad thinks before you decide ({n}/{total}).",
      required: ["juno", "bas", "tamsin", "dagrun"], counts: "required",
      cast: [
        { id: "juno", look: "juno", x: TABLE.x - 1.35, z: TABLE.z - 0.2, yaw: Math.PI / 2, node: "Ep25_Juno" }, // back at her table
        { id: "bas", look: "bas", x: -5.3, z: -3.4, yaw: -1.75, node: "Ep25_Bas" },
        { id: "tamsin", look: "tamsin", x: 6.4, z: 7.2, yaw: -1.6, node: "Ep25_Tamsin" },
        { id: "dagrun", look: "dagrun", x: -7, z: 5.6, yaw: 0.8, node: "Ep25_Dagrun" },
        { id: "lio", look: "lio", x: SAND.x + 3, z: SAND.z - 2.4, yaw: Math.PI, node: "Ep25_Lio" },
      ] },
    { id: "decide", type: "scene", node: "Ep25_Decide", ...LH,
      rook: { x: -3.2, z: 3.2, yaw: Math.PI * 0.85 },
      cast: [
        { id: "lio", look: "lio", x: -1.6, z: 0.4, yaw: -0.5 },
        { id: "juno", look: "juno", x: -5, z: 3.6, yaw: 2.6 },
        { id: "bas", look: "bas", x: -4.6, z: 5.2, yaw: 2.8 },
        { id: "dagrun", look: "dagrun", x: -2, z: 5, yaw: Math.PI },
        { id: "tamsin", look: "tamsin", x: -6.4, z: 2.4, yaw: 2.2 },
      ] },
    { id: "orders", type: "scene", node: "Ep25_Orders", ...LH,
      rook: { x: -1.4, z: 5.8, yaw: -0.4 },
      cast: [
        { id: "archivist", look: "archivist", x: -2.6, z: 7.9, yaw: 2.4 },
        { id: "dagrun", look: "dagrun", x: -0.2, z: 7.6, yaw: -2.4 },
        { id: "rider", look: "guard", x: -3.8, z: 8.6, yaw: 2.6 },
      ],
      set: { EP25_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep26",
      lines: [
        "Next time on UNWRITTEN:",
        "Under Ironhold, behind the Crown's own door, something has been sealed away for a very long time.",
        "Tonight, the masked knight comes for it.",
      ] },
  ],
};
