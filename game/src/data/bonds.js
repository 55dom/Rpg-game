// The bond system (GDD §11): ranks 1–10 with each Lantern, raised by talking every day, gifts,
// fighting side by side and helping with what they care about. Bond events at ranks 2, 4, 6, 8, 10
// are the gates: a bond can't grow past one until its scene has been seen. State lives in story flags
// (BOND_<ID> points, BOND_EV_<ID>_<rank> seen), so it saves with everything else.

/** Points needed for each rank (index 0 = rank 1). */
export const RANK_POINTS = Object.freeze([0, 20, 45, 75, 110, 150, 200, 260, 330, 410]);
export const RANK_TITLES = Object.freeze(["Stranger", "Stranger", "Acquaintance", "Acquaintance", "Comrade", "Comrade", "Trusted", "Trusted", "Sworn", "Sworn"]);
export const GATES = Object.freeze([2, 4, 6, 8, 10]);

/** How much each kind of moment is worth. */
export const BOND_GAIN = Object.freeze({ talk: 6, fight: 4, gift: { 3: 15, 2: 8, 1: 3, 0: 0 } });

/** Gifts: where to buy them and what they cost. Owned gifts are counted in flags (GIFT_<ID>). */
export const GIFTS = Object.freeze({
  honeybun: { name: "Honey Bun", price: 6, from: "cafe", desc: "Sticky, warm, from the Gilded Spoon." },
  lemontart: { name: "Lemon Tart", price: 9, from: "cafe", desc: "Barnaby's. Absolutely not leftover cake." },
  thread: { name: "Spool of Silver Thread", price: 10, from: "market", desc: "Fine, strong, catches the light." },
  whetstone: { name: "Whetstone", price: 10, from: "market", desc: "A good grey stone for a good edge." },
  songbook: { name: "Songbook", price: 12, from: "market", desc: "Ballads from the coast, half of them rude." },
  inkpot: { name: "Pot of Blue Ink", price: 12, from: "market", desc: "The expensive kind. It smells of iron." },
  driedfish: { name: "Dried Fish", price: 5, from: "cook", desc: "Salted, fried, then dried again. Somehow." },
});
export const GIFT_SHOPS = Object.freeze({ cafe: "Something to take away?", market: "Gifts for your squad?", cook: "Some fish for the road?" });

/**
 * The Lanterns. likes: item → 3 loved, 2 liked, 0 disliked (anything else is 1, fine).
 * lines: what they say for each reaction. lore: unlocked at rank 2. passive: from rank 3 (for Bas and
 * Juno only while they fight beside you). team: the rank-5 Team Attack (Bas and Juno fight with you).
 * events: the bond event node for each gate rank that's written so far.
 */
export const BONDS = Object.freeze({
  bas: {
    name: "Bas", cast: "Bas",
    likes: { honeybun: 3, whetstone: 2, driedfish: 2, lemontart: 0 },
    lines: { 3: "...Is this a honey bun. For me. I'm going to eat it very slowly and think about you.", 2: "Useful. Thanks.", 1: "Huh. Thanks.", 0: "That's... sour. I'll give it to Dagrun." },
    lore: "Bas grew up on a stone farm in the north: a farm that grows nothing but rocks, which you then carry somewhere else. He says it made him patient. He is not patient.",
    passive: { name: "Shoulder to Shoulder", desc: "With Bas beside you, you take 8% less damage.", mods: { defense: 0.08 }, party: true },
    team: { name: "Stone and Gale", desc: "With Surge at half or more, calling Bas becomes a Team Attack: his pillar launches, your gale finishes." },
    events: { 2: "B_Bas_2", 4: "B_Bas_4" },
  },
  juno: {
    name: "Juno", cast: "Juno",
    likes: { thread: 3, lemontart: 2, honeybun: 2, whetstone: 0 },
    lines: { 3: "Silver. You remembered. ...I'm going to make you something with it and you're going to wear it.", 2: "Oh, that's lovely. Thank you.", 1: "Thank you! That's sweet.", 0: "A rock. For sharpening. I sew, {name}." },
    lore: "Juno's mother had a loom in the Weavers' Row that took up the whole front room. They sold it the winter Juno was nine. Every Mark from the café goes into a tin marked 'LOOM'.",
    passive: { name: "Mended", desc: "With Juno beside you, you have 20 more health.", mods: { health: 20 }, party: true },
    team: { name: "Thread and Gale", desc: "With Surge at half or more, calling Juno becomes a Team Attack: her thread binds, your gale cuts through." },
    events: { 2: "B_Juno_2", 4: "B_Juno_4" },
  },
  tamsin: {
    name: "Tamsin", cast: "Tamsin",
    likes: { songbook: 3, honeybun: 2, inkpot: 0 },
    lines: { 3: "A SONGBOOK. Half of these are rude! I love it! I love you! In a squad way!", 2: "Ooh, thank you!", 1: "Aw, thanks!", 0: "Ink? I don't write songs down. They'd stop being songs." },
    lore: "Tamsin's been writing the same song for three years. It's about the lighthouse. It has two lines, and both of them are the word 'light'.",
    passive: { name: "Encore", desc: "Tamsin's tunes stay with you: Surge fills 10% faster.", mods: { surge: 0.1 } },
    events: { 2: "B_Tamsin_2" },
  },
  lio: {
    name: "Lio", cast: "Lio",
    likes: { inkpot: 3, lemontart: 2, driedfish: 0 },
    lines: { 3: "Iron-gall ink. Do you know what this COSTS? ...Thank you. Truly.", 2: "Oh, thank you. Really.", 1: "Thank you.", 0: "Fish. Dried fish. It's... looking at me." },
    lore: "Lio reads in the dark because he can't sleep. He keeps a list of every book in the capital with pages torn out. The list is getting longer.",
    passive: { name: "Marginalia", desc: "Lio's notes in your grimoire: mana comes back 1 a second faster.", mods: { manaRegen: 1 } },
    events: { 2: "B_Lio_2" },
  },
  cal: {
    name: "Cal", cast: "Cal",
    likes: { lemontart: 3, driedfish: 2, honeybun: 2 },
    lines: { 3: "Lemon. You noticed. ...Don't make it weird.", 2: "Ha. Thanks, kid.", 1: "For me? Huh.", 0: "Thanks." },
    lore: "Cal has been the Lanterns' vice-captain for six years. Nobody remembers him joining. When you ask, he says, 'I came with the furniture.'",
    passive: { name: "Light Feet", desc: "Cal's dodge lessons stick: you run 5% faster.", mods: { speed: 0.05 } },
    events: { 2: "B_Cal_2" },
  },
  dagrun: {
    name: "Dagrun", cast: "Dagrun",
    likes: { driedfish: 3, honeybun: 2, songbook: 0 },
    lines: { 3: "Dried fish. Fried AND dried. You're a good kid. The best kid.", 2: "Mm. Good.", 1: "Thanks, kid.", 0: "Don't let Tamsin see this. She'll sing it." },
    lore: "Dagrun has led the Lanterns for twenty years. The squad has never ranked higher than sixth. He's never once asked to be transferred.",
    passive: { name: "Captain's Eye", desc: "Dagrun's advice: you hit 4% harder.", mods: { attack: 0.04 } },
    events: { 2: "B_Dagrun_2" },
  },
});

/** What each rank opens up (shown in the Bonds screen). */
export const RANK_UNLOCKS = Object.freeze({
  2: "Their story (a lore entry) and what gift they'd love",
  3: "A passive bonus",
  4: "Their personal story continues",
  5: "Team Attack (Bas and Juno)",
  6: "Alternate ability (later chapter)",
  8: "Special Assist (later chapter)",
  10: "Awakening (later chapter)",
});

// ---- Generated dialogue: gift menus, gift shops, and the menu after talking to a squadmate ----
const up = (s) => s.toUpperCase();
function giftMenus() {
  let out = "";
  for (const [id, b] of Object.entries(BONDS)) {
    out += `title: B_Menu_${id}\n---\n-> Give ${b.name} a gift. <<if $GIFTS_OWNED > 0>>\n    <<jump B_Gift_${id}>>\n-> See you later.\n===\n\n`;
    out += `title: B_Gift_${id}\n---\n`;
    for (const [g, gi] of Object.entries(GIFTS)) out += `-> ${gi.name}. <<if $GIFT_${up(g)} > 0>>\n    <<gift ${id} ${g}>>\n`;
    out += `-> Never mind.\n    <<stop>>\n`;
    out += `<<if $GIFT_REACT == -1>>\n    ${b.cast}: You already gave me something today. Save it for tomorrow!\n<<stop>>\n<<endif>>\n`;
    for (const r of [3, 2, 1, 0]) out += `<<if $GIFT_REACT == ${r}>>\n    ${b.cast}: ${b.lines[r]}\n<<endif>>\n`;
    out += "===\n\n";
  }
  for (const [shop, prompt] of Object.entries(GIFT_SHOPS)) {
    out += `title: B_Shop_${shop}\n---\n-> ${prompt}\n`;
    for (const [g, gi] of Object.entries(GIFTS)) if (gi.from === shop) {
      out += `    -> ${gi.name} (${gi.price} Marks).\n        <<pay ${gi.price}>>\n        <<if $PAID>>\n            <<set $GIFT_${up(g)} to $GIFT_${up(g)} + 1>>\n            <<set $GIFTS_OWNED to $GIFTS_OWNED + 1>>\n            You put the ${gi.name.toLowerCase()} in your bag. ${gi.desc}\n        <<else>>\n            Not enough Marks.\n        <<endif>>\n`;
    }
    out += `    -> Not today.\n-> Not today.\n===\n\n`;
  }
  return out;
}

// ---- The bond events (scenes at the Lighthouse) ----
const EVENTS = `
title: B_Bas_2
---
<<shot two Bas Rook>>
Bas: You've got a minute? Good. Stand there. No. There. Feet wider.
<<pose Bas fist>>
Bas: This is the stance my dad taught me for carrying stone. You don't lift with your arms. You lift with the ground.
-> Copy him. #earnest
    <<pose Bas none>>
    Bas: ...Not bad. Your knees are lying, but your back is honest.
-> "You lift with the GROUND?" #wry
    Bas: You push down into it and it pushes back up. Physics. Or stubbornness. Same thing on a farm.
<<shot on Bas>>
Bas: Most people see a big guy and think he's strong. I'm not strong. I'm planted.
Bas: Hard to knock over someone who's decided not to fall.
<<set $BOND_EV_BAS_2 to 1>>
===

title: B_Bas_4
---
<<shot wide side>>
Bas is sitting on the edge of the training ring, turning a small grey stone over in his hands.
<<shot two Bas Rook>>
Bas: First stone I ever carried off the farm. Dad said, "Take one with you, so you know what you came from."
Bas: I failed the knight exam twice before this one. Did you know that?
-> "I didn't." #earnest
    Bas: Nobody does. Dagrun took me anyway. Third time, and he still picked me.
-> "Twice is nothing." #bold
    Bas: Says the one-pager who knocked Severin flat. ...Fair, though.
<<shot on Bas>>
Bas: Here. Take it. Not the farm one. I've got another.
Bas: Carry it. When things get heavy, you'll know you've carried worse.
<<set $BOND_EV_BAS_4 to 1>>
===

title: B_Juno_2
---
<<shot two Juno Rook>>
Juno: Hold out your wrist. No, the other one. Sword hand stays free.
<<pose Juno hand>>
Juno: Three strands. Red for the squad, blue for the sky over the Dry Sea, and one I'm not telling you about.
-> "What's the third one for?" #earnest
    Juno: I said I'm not telling you. That's the point of a third strand.
-> "Is this a knot spell?" #wry
    Juno: It's a knot. Spells are for people with more than one page. ...Kidding. Mostly.
<<pose Juno none>>
<<shot on Juno>>
Juno: In the Weavers' Row, you tie one for anyone you'd go back for. If it breaks, you tie a new one. That's all.
<<set $BOND_EV_JUNO_2 to 1>>
===

title: B_Juno_4
---
<<shot wide side>>
Juno is counting Marks into a dented tin by lantern light. The lid says LOOM in careful letters.
<<shot two Juno Rook>>
Juno: Don't look at me like that. I know you know about the café.
Juno: My mum's loom. We sold it when I was nine. A man in the Row has it now. He says he'll sell it back for four hundred Marks.
-> "How close are you?" #earnest
    Juno: Two hundred and twelve. And a button. Somebody tipped me a button.
-> "Let me help." #bold
    Juno: No. ...Thank you. No. I want to carry this one myself. You can come with me when I get it.
<<shot on Juno>>
Juno: Knights get paid in honor. Honor doesn't buy looms. So, maid apron, after hours. Don't tell Bas. He'd try to pay for it in rocks.
<<set $BOND_EV_JUNO_4 to 1>>
===

title: B_Tamsin_2
---
<<shot two Tamsin Rook>>
<<pose Tamsin hand>>
Tamsin: Okay. Okay okay okay. I need an audience of one and you're the one. Ready?
Tamsin: "Light, oh light, upon the... light."
<<pose Tamsin none>>
-> "That's beautiful." #earnest
    Tamsin: You're lying, and I love you for it. In a squad way.
-> "It's the same word twice." #wry
    Tamsin: It's the IMPORTANT word twice! It's called emphasis!
<<shot on Tamsin>>
Tamsin: My gran said every lighthouse has a song, and if nobody sings it, the light gets lonely.
Tamsin: So I'm writing it. Slowly. Three years. Two lines. But they're GOOD lines.
<<set $BOND_EV_TAMSIN_2 to 1>>
===

title: B_Lio_2
---
<<shot two Lio Rook>>
Lio: Can I show you something? It's not a big thing. It's a small thing that I've made very big in my head.
<<pose Lio hand>>
Lio: The library's book on lost villages. Three pages left. Someone cut the rest out with a very sharp knife.
Lio: Not torn. Cut. Clean. Someone sat down and did it carefully.
<<pose Lio none>>
-> "Who would do that?" #earnest
    Lio: Someone who wanted a village to stay lost. ...I keep a list now. Every book in Aurelin with pages missing.
-> "Maybe a very tidy mouse." #wry
    Lio: A mouse with a knife and an agenda. ...Thank you. I needed that.
<<shot on Lio>>
Lio: Forty-one books. That's the list. Forty-one holes in what we know. I don't sleep much.
<<set $BOND_EV_LIO_2 to 1>>
===

title: B_Cal_2
---
<<shot two Cal Rook>>
Cal: Mind the step.
Rook: ...There's no step here.
Cal: There's always a step somewhere. Old habit.
<<shot on Cal>>
Cal: You dodge well now. Better than when you came. You stopped watching the blade and started watching the shoulder.
-> "You taught me that." #earnest
    Cal: I told you that. You taught yourself. Don't give me credit I didn't earn.
-> "You dodge like you know what's coming." #bold
    Cal: Ha. Six years in this squad, kid. Everything's coming. It's just a matter of when.
Cal: Get some sleep. The lighthouse doesn't need two of us staring at the dark.
<<set $BOND_EV_CAL_2 to 1>>
===

title: B_Dagrun_2
---
<<shot two Dagrun Rook>>
Dagrun: Sit. Not on that, that's my other chair. That one.
Dagrun: You want to know why I took you at the draft. Everyone does. Nobody asks.
-> "Why did you?" #earnest
    Dagrun: Because the other six captains laughed. When a whole room laughs at someone, either they're a fool or the room is.
-> "Because nobody else would?" #wry
    Dagrun: That too. I like a bargain.
<<shot on Dagrun>>
Dagrun: The Lanterns have been last for twenty years. Last isn't a rank, kid. It's a place to stand where you can see everybody else.
Dagrun: Now go away. I'm napping.
<<set $BOND_EV_DAGRUN_2 to 1>>
===
`;

export const BOND_SCRIPT = giftMenus() + EVENTS;
