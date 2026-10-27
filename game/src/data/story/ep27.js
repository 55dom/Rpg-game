// Episode 27 · Elodie's Price (GDD §14 Arc 3, §5). The High Chancellor offers his son a page the Crown has kept
// unread for a hundred years: it writes a grimoire into whoever holds it, and Elodie was born with none. Severin
// takes it. Elodie writes to Rook. In Aurelin the squad finds her, and Lio comes home (if he was sent away, this
// is where he's brought back). Severin meets Rook on the Tower steps where they first fought, and loses, and reads
// the page anyway. Then he walks to Mirrorlake.

import { AFTER_EP26 } from "./arc3.js";

export const EP27_SCRIPT = `
title: Ep27_Cold
---
<<shot wide>>
Aurelin, the Crown Ward, past midnight. Lamps in one window of the Valcourt house.
<<shot on Aldric>>
Aldric: The Crown keeps a page nobody has read in a hundred years. It writes a grimoire into whoever holds it.
Aldric: Your sister would never be nothing again, Severin. Not at court. Not anywhere.
<<shot on Severin>>
Severin: And the price?
<<shot on Aldric>>
Aldric: Everything worth having has one. You, of all people, know that.
<<shot on Elodie>>
In the doorway, out of the lamplight, Elodie listens. Under the street, under everything, something is humming. It always is. Nobody else ever hears it.
<<shot on Severin>>
Severin takes the page. It's warm, like a hand.
===

title: Ep27_Letter
---
<<shot wide>>
Morning at the Lighthouse. Bas is trying to eat porridge left-handed and losing.
<<shot on Juno>>
Juno: Letter for {name}. Gold wax. A star on the seal. Somebody rich wants you.
<<shot two Juno Rook>>
The handwriting is careful and small. "My brother read something last night. Now the stars outside his window go out when he looks at them. Please come. Don't tell him I wrote. Elodie Valcourt."
<<shot on Dagrun>>
Dagrun: Severin's sister. The one without a book.
<<if $LIO_STATUS == 1>>
    Dagrun: Go. And on your way, stop at the Hall of Lanterns and bring Lio home. If that page does what I think it does, we'll want someone who reads things nobody should.
<<else>>
    <<shot on Lio>>
    Lio: A page that makes the stars go out. ...I'm coming with you. I've read about pages like that, and none of the endings were happy.
<<endif>>
===

title: Ep27_Elodie
---
Elodie: You came. He said you would. He says you never know when to stay down.
Elodie: I don't have a grimoire. I never did. Everyone is very polite about it, all the time, every day.
Elodie: My father found a page that would give me one. Severin read it for me. He says it doesn't hurt.
Elodie: He's lying. I can hear it. ...I can hear a lot of things. There's something under this city. It sounds like a crowd behind a door.
<<shot two Elodie Rook>>
-> "Where is he now?" #earnest
    Elodie: The Tower of Choosing. He said he'd wait for you where you fought the first time. He wanted you to come.
-> "A crowd behind a door?" #wry
    Elodie: Don't laugh. ...You're not laughing. Thank you. The Tower: he's waiting for you on the steps, where you fought the first time.
<<set $ELODIE_MET to 1>>
===

title: Ep27_Lio
---
<<if $LIO_STATUS == 1>>
    Lio: {name}. Dagrun sent you. ...You came anyway.
    Lio: I've been reading every night. About pages that write grimoires into people. They don't, not really. A forbidden page borrows the person who reads it, and it doesn't give them back.
    -> "Come home, Lio." #earnest
        Lio: ...Yes. Yes. I'd like that more than anything.
    -> "We need you. Juno included, though she'll never say it." #wry
        Lio: She sent me a scarf last week. No note. That's practically a speech, from Juno.
    <<set $LIO_STATUS to 2>>
    <<set $LIO_RETURNED to 1>>
    <<set $BOND_LIO to $BOND_LIO + 5>>
<<else>>
    Lio: A forbidden page doesn't write a grimoire into someone. It borrows them. And it doesn't give them back.
    Lio: If Severin's read it, he's already lent himself out. We have to find him before the page decides to keep him.
<<endif>>
===

title: Ep27_Juno
---
Juno: The Valcourt girl. I sewed her christening robe when I was eight. My mother's shop did the whole family. They never once looked up.
Juno: ...She looked up. Just now. She said thank you.
===

title: Ep27_Tamsin
---
Tamsin: A rich boy reads a cursed page to save his sister. That's not a song, that's three songs, and they all end with somebody crying in the rain.
===

title: Ep27_Steps
---
<<shot wide>>
The Tower of Choosing, at night. The steps where a one-page mage once lost a duel three times and kept getting up.
<<shot on Severin>>
Severin: You came to stop me.
<<shot two Severin Rook>>
-> "I came because Elodie asked me to." #earnest
    Severin: Of course she did. She's the only one in that house who ever asks anybody for anything.
-> "Give me the page, Severin." #bold
    Severin: No.
<<shot on Severin>>
Severin: You think it's winning. It isn't. It's quiet. I read one line last night and for the first time in my life, nobody in my head was disappointed in me.
Severin: Then let's do this the way we did the first time, one-page. If you win, I'll listen.
===

title: Ep27_After
---
<<shot wide>>
Severin is on one knee on the steps. His rapier is a yard away from his hand.
<<shot on Severin>>
Severin: ...You win. You always get up. It's infuriating.
<<shot two Severin Rook>>
-> "Then listen." #earnest
    Severin: I am listening. That's the problem. I'm listening to you and to it at the same time.
-> "Give it to me. Please." #bold
    Severin: I can't. It isn't in my pocket anymore.
<<shot on Severin>>
He opens his hand. There's nothing in it. The stars over the Tower go out, one after another, in a ring, until there's only the one above his head.
Severin: Tell Elodie I'm sorry. Tell her I'll come home with a grimoire for her, or I won't come home.
Severin: Mirrorlake. Where our mother taught us the stars. If you follow me, one-page, don't follow me as a friend.
<<shot wide>>
He walks down the steps and into the dark, and where he walks, the dark gets darker.
<<set $SEVERIN_PAGE to 1>>
===
`;

const AU = { stage: "aurelin" }, LH = { stage: "lighthouse" }, TS = { stage: "towerSteps" };
const HOUSE = { x: -24.2, z: 26 }; // the Valcourt townhouse door, in the Crown Ward

export const EPISODE_27 = {
  id: "ep27",
  number: 27,
  unlockAt: 5,
  setup: { ...AFTER_EP26 },
  title: "Elodie's Price",
  arc: "Arc 3 · Ashes and Echoes",
  world: { companions: ["bas", "juno"] },
  beats: [
    { id: "cold", type: "scene", node: "Ep27_Cold", ...AU, rook: null, sky: { daylight: 0.05 },
      cast: [
        { id: "aldric", look: "aldric", x: HOUSE.x + 1.4, z: HOUSE.z - 1.2, yaw: -1.7 },
        { id: "severin", look: "severin", x: HOUSE.x - 0.6, z: HOUSE.z - 1.6, yaw: 1.4 },
        { id: "elodie", look: "elodie", x: HOUSE.x + 0.2, z: HOUSE.z + 0.6, yaw: Math.PI },
      ] },
    { id: "title", type: "title" },
    { id: "letter", type: "scene", node: "Ep27_Letter", ...LH,
      rook: { x: 6.6, z: 4.4, yaw: -0.6 },
      cast: [
        { id: "juno", look: "juno", x: 3.5, z: 4.6, yaw: 1.6 }, // by the table, not in it
        { id: "bas", look: "basSling", x: 3.6, z: 6.2, yaw: Math.PI / 2 },
        { id: "dagrun", look: "dagrun", x: 7.4, z: 6.8, yaw: -2.6 },
        { id: "lio", look: "lio", x: 4.6, z: 3, yaw: 0.6, when: "$LIO_STATUS == 2" },
      ] },
    { id: "city", type: "explore", ...AU,
      rook: { x: 0, z: -26, yaw: 0 },
      objective: "Find Elodie in Aurelin, and Lio ({n}/{total}).",
      required: ["elodie", "lio"], counts: "required",
      cast: [
        { id: "elodie", look: "elodie", x: 2.6, z: -4.8, yaw: -2.6, node: "Ep27_Elodie" },
        { id: "lio", look: "lio", x: 2.6, z: 22.4, yaw: Math.PI, node: "Ep27_Lio" },
        { id: "juno", look: "juno", x: -3.4, z: -6.2, yaw: 0.6, node: "Ep27_Juno" },
        { id: "tamsin", look: "tamsin", x: 6.4, z: -9, yaw: -0.8, node: "Ep27_Tamsin" },
      ] },
    { id: "steps", type: "scene", node: "Ep27_Steps", ...TS, sky: { daylight: 0.08 },
      rook: { x: 0, z: 0.6, yaw: 0 },
      cast: [
        { id: "severin", look: "severin", x: 0, z: 5.6, yaw: Math.PI },
        { id: "juno", look: "juno", x: -2.2, z: -1.4, yaw: 0.3 },
        { id: "lio", look: "lio", x: 2.1, z: -1.6, yaw: -0.3 },
      ] },
    { id: "duel", type: "fight", ...TS, wave: ["severinDuel"], tokens: 1, sky: { daylight: 0.08 },
      tutorial: [{ at: 0.5, text: "Severin, the way he fought at the exam, only harder. Knock him off his Polaris point and his stars go dark." }],
      lines: [["Severin", "Up, one-page. You always get up."]],
      retry: "Up. He said he'd listen if I won." },
    { id: "after", type: "scene", node: "Ep27_After", ...TS, sky: { daylight: 0.06 },
      rook: { x: 0, z: 2.6, yaw: 0 },
      cast: [
        { id: "severin", look: "severin", x: 0, z: 4.8, yaw: Math.PI },
        { id: "juno", look: "juno", x: -2.2, z: 0.4, yaw: 0.4 },
        { id: "lio", look: "lio", x: 2.1, z: 0.2, yaw: -0.4 },
      ],
      set: { EP27_DONE: 1 } },
    { id: "preview", type: "preview", nextEpisode: "ep28",
      lines: [
        "Next time on UNWRITTEN:",
        "At Mirrorlake the stars are going out, and the boy who used to light them is standing in the middle of the water.",
        "And under a one-page grimoire, something has started to write.",
      ] },
  ],
};
