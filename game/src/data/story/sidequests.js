// Character quests and the Fork & Fold quests (GDD §18.1, §18.2).
//
// Character quests (§18.1: "bond-gated, 3 parts each, reveal backstory and change relationships"): one for each of the
// squad who's with you through the story (Juno, Bas, Tamsin, Lio, Dagrun). Part one is their rank-2 chapter, part two
// their rank-4 chapter (data/bonds.js), part three something to do out in the world and a scene when it's done. Each
// starts by itself once their first chapter's been seen, and each ends with a keepsake (a charm, data/items.js).
//
// Fork & Fold (§18.2): what happened to Mirren in Ep 4 forks one quest two ways, and both fold back at the same well:
// Quest A "The Black Knight's Well" (she was saved: she takes you there herself) or Quest B "Letters from the Fen" (she
// wasn't: her grandmother's letter tells it, with less). Quest C "Burned Memory": if you've read the notebook (A4),
// Lio tries to rebuild the last minute of Ep 18 from memory, and it burns out right at the light (A5, §15.5).
//
// (No doors, keys or lanterns going out in the character quests: the clues are counted, and these don't add any. The
// well quests stay with what was seen at the well; Quest C is A5 as §15.5 writes it, and nothing more.)

const cq = (id, name, title, region, item, part3, finish, summary) => ({
  title: `${name}: ${title}`, giver: name, region, character: id, available: `$BOND_EV_${id.toUpperCase()}_2`,
  stages: [
    { text: `${name}'s first chapter: talk with them each day, and bring something they'd like (bond rank 2).`, done: `$BOND_EV_${id.toUpperCase()}_2` },
    { text: `${name}'s story goes on at bond rank 4.`, done: `$BOND_EV_${id.toUpperCase()}_4` },
    ...part3,
    ...(finish ? [{ text: finish, done: `$CQ_${id.toUpperCase()}_DONE` }] : []),
  ],
  summary, reward: { item, bond: { [id]: 20 }, flags: { MERIT: 5, REP_SQUAD: 2 }, xp: 300 },
});

export const SIDE_QUESTS = {
  cq_juno: cq("juno", "Juno", "The Loom", "The Lighthouse", "junoKnot",
    [{ text: "A week of café shifts later, the tin says four hundred. Meet Juno at the vendor's house in the Lowmarket (Aurelin, the east street): the loom's there.", done: "$CQ_JUNO_DONE" }],
    null, "Juno carried it home herself. She let you carry the bench."),
  cq_bas: cq("bas", "Bas", "What You Came From", "The Lighthouse", "basStone",
    [{ text: "Bas wants a stone for the crack in the Lighthouse wall: a flat one, from beside the mill race in Thornwick.", done: "$CQ_BAS_STONE" }],
    "Bring the stone to Bas at the Lighthouse.", "The wall doesn't move. It can be mended, though."),
  cq_tamsin: cq("tamsin", "Tamsin", "The Third Line", "The Lighthouse", "tamsinLine",
    [{ text: "Tamsin's never heard the sea. Find her a shell on the old shore, where Thornwick's fields run out into the Dry Sea.", done: "$CQ_TAMSIN_SHELL" }],
    "Bring the shell to Tamsin.", "Three lines now. Only two of them are the word 'light'."),
  cq_lio: cq("lio", "Lio", "Forty-One", "The Lighthouse", "lioBookmark",
    [{ text: "One of the books on Lio's list has turned up, sort of: ask the fish cook by Aurelin's fountain what he wraps the fish in.", done: "$CQ_LIO_PAGES" }],
    "Bring the pages to Lio.", "Forty. The list is getting shorter."),
  cq_dagrun: cq("dagrun", "Dagrun", "Sixth", "The Lighthouse", "dagrunRibbon",
    [{ text: "Dagrun left something on the Proctor's sand twenty years ago. Ask the Proctor at the Exam Grounds.", done: "$CQ_DAGRUN_RIBBON" }],
    "Give Dagrun his ribbon.", "Last isn't a rank. It's a place to stand."),

  // Fork & Fold (§18.2), after the knight in black has been seen (Ep 24).
  well_a: { title: "The Black Knight's Well", giver: "Mirren", region: "The Greywater Fens", available: "$MIRREN_SAVED and $EP24_DONE",
    stages: [
      { text: "Mirren saw a knight in black at the old well on the north path. Go with her: she'll show you (the Fens, north of the water).", done: "$WELL_SEEN" },
    ],
    summary: "She was right about all of it, down to the frost.", reward: { marks: 60, flags: { RENOWN_FENS: 6, MERIT: 6 }, xp: 200 } },
  well_b: { title: "Letters from the Fen", giver: "A letter", region: "The Lighthouse", available: "$EP4_DONE and not $MIRREN_SAVED and $EP24_DONE",
    stages: [
      { text: "A letter came for you from the Fens, from Mirren's grandmother. Find the well it describes (the Fens, the north path).", done: "$WELL_SEEN" },
    ],
    summary: "The well was where she said. The rest you'll have to take on her word.", reward: { marks: 60, flags: { RENOWN_FENS: 4, MERIT: 6 }, xp: 200 } },
  burned: { title: "Burned Memory", giver: "Lio", region: "The Lighthouse", available: "$CLUE_A4 and $EP28_DONE and not $EP48_DONE",
    stages: [
      { text: "Lio thinks he can rebuild the last minute at the Hollowmarch from memory, if he has something that was there. Bring him something from the ring of stones.", done: "$BURNED_PETAL" },
      { text: "Bring it to Lio.", done: "$CLUE_A5" },
    ],
    summary: "It burned out at the light. Lio says the light took the memory with it.", reward: { flags: { MERIT: 4 }, bond: { lio: 15 }, xp: 200 } },
};

/** Where the errands are (zone pickups and cast, added to data/zones.js). */
export const SIDE_PLACES = Object.freeze({
  loom: { zone: "home", x: 3.6, z: 0.5 }, junoHome: { zone: "home", x: 0.6, z: 1.6 },
  millStone: { zone: "thornwick", x: 18.5, z: -15.5 }, shell: { zone: "thornwick", x: 27, z: 8 },
  mirren: { zone: "fens", x: 9.5, z: -6.5 }, well: { zone: "fens", x: 14, z: 20 }, mirrenWell: { zone: "fens", x: 12.6, z: 19.2 },
  letter: { zone: "lighthouse", x: 3.5, z: 0.5 }, petal: { zone: "hollowmarch", x: 0.8, z: 13 },
});

export const SIDEQUEST_SCRIPT = `
title: CQ_Juno_Loom
---
<<shot two Juno Rook>>
Juno: There it is. Under the sheet. I've walked past this house every week for nine years and I never once knocked.
Hetty: She's been staring at my corner since she came in. Go on, love. Lift it.
Juno pulls the sheet back. A narrow loom, dark wood, the warp still strung with a few threads of red gone brown.
Juno: That's her thread. That's my mum's thread. She left it half done when we... it's still on there.
-> "Finish it." #earnest
    Juno: Not here. At home. At the Lighthouse. I'll finish it where people can see.
-> "Four hundred Marks of café tips." #wry
    Juno: Four hundred and one. I kept the button.
Juno counts it onto Hetty's table, coin by coin. It takes a long time. Nobody hurries her.
Hetty: My Arn bought it at an auction, years back. Never could work it. I always thought someone would come for it.
<<shot on Juno>>
Juno: Here. Hold out your wrist. The other one.
She ties a new cord over the old one. Red, blue, and the third strand, pulled off the loom's last row.
Juno: Now you know what the third one's for.
<<set $CQ_JUNO_DONE to 1>>
<<set $JUNO_LOOM to 1>>
===

title: CQ_MillStone
---
By the mill race, half in the water: a flat grey stone, smooth as a plate, about the size of the crack in the Lighthouse wall.
You lift with the ground, not your arms, the way Bas showed you. It comes up easier than it should.
<<set $CQ_BAS_STONE to 1>>
===

title: CQ_Bas_Wall
---
<<shot two Bas Rook>>
Bas: That's a good stone. Flat both sides. You picked it like a farmer.
Bas fits it into the crack in the wall below the lighthouse stair, turns it twice, and taps it home with the heel of his hand.
Bas: My dad mended walls all winter. Said a wall's not a thing you build once. It's a thing you keep.
-> "Like a squad." #earnest
    Bas: ...Don't make me cry in front of the wall.
-> "The wall doesn't move." #wry
    Bas: No. But it lets you help it stand.
<<shot on Bas>>
Bas: Here. The chip that came off when I set it. Keep it with the other one. Now you've got two things you've carried.
<<set $CQ_BAS_DONE to 1>>
<<set $BAS_WALL_MENDED to 1>>
===

title: CQ_Shell
---
Where Thornwick's last field runs out into the dry bed of the old sea, the soil turns to pale sand. Half buried in it: a spiral shell, bleached white.
You hold it to your ear. Something in it sounds like a long way off.
<<set $CQ_TAMSIN_SHELL to 1>>
===

title: CQ_Tamsin_Shell
---
<<shot two Tamsin Rook>>
Tamsin: For me? Is that... from the sea? From the actual sea that isn't there?
She holds it to her ear and shuts her eyes, and for a long moment Tamsin is completely quiet, which has never happened.
Tamsin: Oh. It's still in there. The whole sea. It went, and it left this behind to remember it by.
<<shot on Tamsin>>
Tamsin: That's it. That's the third line. Listen.
Tamsin: "Light, oh light, upon the light. The sea went home; you kept watch all night."
-> "That's the one." #earnest
    Tamsin: It IS the one. Three years! Write it down before I change it! No, don't, it'll stop being a song.
-> "Only two of those were 'light'." #wry
    Tamsin: Growth! Artistic growth!
Tamsin: Here. Take the paper I had the two lines on. I don't need it now. I've got it by heart.
<<set $CQ_TAMSIN_DONE to 1>>
<<set $TAMSIN_THIRD_LINE to 1>>
===

title: CQ_Lio_Pages
---
<<shot two Lio Rook>>
Lio: Is that... You found them. Cut clean. Same knife, look at the edge. Book thirty-four on the list.
He unfolds them very carefully. They smell strongly of fish.
Lio: "Pies of the Southern Coast." ...It's a cookbook. Somebody cut the best recipes out of a cookbook.
Lio starts to laugh, quietly at first, and then not quietly at all, holding the pages to his chest.
-> "Forty to go." #earnest
    Lio: Forty. It's getting shorter. I didn't think it ever would.
-> "The mouse with the knife strikes again." #wry
    Lio: A mouse with an agenda and a very good eye for pastry.
<<shot on Lio>>
Lio: Here. Fish pie, page two hundred and six. Keep it in your grimoire. It's the most useful page in Aurelin.
<<set $CQ_LIO_DONE to 1>>
<<set $LIO_LAUGHED to 1>>
===

title: CQ_Dagrun_Ribbon
---
<<shot two Dagrun Rook>>
Dagrun: Where'd you get that. ...The Proctor kept it? Twenty years, on that desk.
A ribbon, grey with age, the gold thread gone dull. Stitched on it, one word: LAST.
Dagrun: My exam. I came last of forty. The Proctor handed me that and said, "Last isn't a rank, Holt. It's a place to stand." I threw it on the sand.
Dagrun: Then I stood there. Twenty years. Everyone the other captains laughed at, I took. Bas, failed twice. Juno, from the Row. Tamsin, thrown out of the Bardic College for being too loud. You.
-> "Why stay sixth?" #earnest
    Dagrun: Because from sixth you can see everyone above you, and everyone they stepped on. Somebody has to be standing there.
-> "You'd rather nap." #wry
    Dagrun: I would ALWAYS rather nap. And yet.
<<shot on Dagrun>>
Dagrun: Keep it. Wear it under your cloak. When somebody laughs at you, you'll know who's standing behind you.
<<set $CQ_DAGRUN_DONE to 1>>
<<set $DAGRUN_RIBBON_GIVEN to 1>>
===

title: W_Mirren
---
<<if $WELL_SEEN>>
    Mirren: My nan says knights in black are bad luck. I said this one just looked tired.
    <<stop>>
<<endif>>
<<if $Q_WELL_A == 0>>
    Mirren: You came back! I knew you'd come back. Everybody said knights don't come back to the Fens.
    Mirren: I saw something. Nobody believes me. A knight, all in black, at the old well on the north path. The night after the war engine burned.
    -> "Show me."
        <<quest start well_a>>
        Mirren: Follow me! Not too close. Not too far. I'll wait at the well.
    -> "Not today."
        Mirren: That's what grown-ups say when they mean never.
    <<stop>>
<<endif>>
Mirren: The well's on the north path. I'll be there!
===

title: W_MirrenWell
---
<<shot two Mirren Rook>>
Mirren: Here. He stood right there, where the stones are wet. I was in the reeds. He didn't see me. I think he didn't see me.
Mirren: He looked down the well for a long time. Like he was waiting for it to say something.
Mirren: And he was hurt. There was blood coming from under the black, at his side, and he didn't do anything about it. Like it wasn't his.
The well's rim is cold under your hand. On a summer evening, there's a white skin of frost on the stones, just where she pointed.
Mirren: Then the air next to him tore, like when you rip a sheet. And he went in it, and it closed.
-> "You were brave to watch." #earnest
    Mirren: I wasn't brave. I was stuck. My boot was in the mud.
-> "Did he say anything?" #wry
    Mirren: Nothing. Grown-ups always say something. He didn't.
<<set $WELL_SEEN to 1>>
<<set $WELL_DETAIL to 1>>
===

title: W_WellLetter
---
A letter on the bench by the training ring, in shaky ink. It's addressed to "the knight who went into the fog after the robed man, at the Lighthouse".
"Sir or madam. My granddaughter Mirren was taken from the Fens by the singing men, and you went after them. You could not bring her back. I don't blame you. I want you to know that.
I write because of something I saw, the night the war engine burned in the east. A knight all in black, at the old well on the north path where Mirren used to fetch the water. He looked down it a long while. Then he was not there.
I am old and my eyes are bad. But I know what I saw. Ness says I should tell a knight. You are the only knight I know."
<<if $Q_WELL_B == 0>>
    <<quest start well_b>>
<<endif>>
===

title: W_WellAlone
---
<<if $WELL_SEEN>>
    The old well. The frost is gone from the stones now.
    <<stop>>
<<endif>>
The old well on the north path, half sunk in reeds. The rim is cold under your hand: on a summer evening, a white skin of frost on the stones.
The reeds around it are flattened in a circle, as if someone stood here a long time. Whoever it was is long gone.
<<set $WELL_SEEN to 1>>
===

title: W_Petal
---
In the ring of stones, where the Bloom stood, the ground is grey and smooth as paper. Pressed into it, a single petal, the colour of nothing.
It's cold, and it weighs less than it should. You fold it into a page of your grimoire for Lio.
<<set $BURNED_PETAL to 1>>
===

title: CQ_Lio_Burned
---
<<shot two Lio Rook>>
Lio: You brought it. ...Sit. Don't touch me while I do this. If I fall over, let me.
He lays the petal flat on his palm and puts his other hand over it, the way he reads a page.
<<shot on Lio>>
Lio: The ring. The stones. Juno shouting. The Bloom opening, all that white. It's coming. It's all still in here.
Lio: He's in front of it. He's looking back at us. He's smiling, the way he did, like he's about to say something stupid. And then...
Lio: And then the light.
Lio flinches back as if he's been burned. The petal on his palm curls, blackens and falls apart into nothing.
<<set $CLUE_A5 to 1>>
<<shot on Lio>>
Lio: It burned out. Right at the light. Everything after it is just... white. Gone.
Lio: The light destroyed the memory itself. Whatever happened in it, I can't get it back. Nobody can.
-> "You tried." #earnest
    Lio: I tried. ...Thank you for letting me.
-> "Then we keep the one we have." #wry
    Lio: The smile, and the stupid joke. Yes. We keep that one.
===
`;
