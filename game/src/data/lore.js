// Hidden lore (GDD §8.5 page fragments): scraps of the Palimpsest's under-text hidden in the world.
// Each restores a line; five restore an Inscription clause, which is lore and power together.

export const FRAGMENTS = Object.freeze([
  { n: 1, where: "Behind the lighthouse", text: "...and the light was left on, so the one outside would know the way back..." },
  { n: 2, where: "By the chapel candles, Aurelin", text: "...every name the Choir sings away is written once more, underneath..." },
  { n: 3, where: "Under the old oak, Thornwick", text: "...the first page is not the smallest. It is the one the rest were copied from..." },
  { n: 4, where: "By the overturned cart, the Fens", text: "...a village can be unwritten, but not unremembered, if one person keeps the ink..." },
  { n: 5, where: "At the broken statue, the Undercroft", text: "...the gears were wound by a hand that knew how the song ends..." },
  { n: 6, where: "Before the dais, the Tower of Choosing", text: "...the Tower does not choose. It recognises..." },
]);
export const CLAUSE = Object.freeze({ need: 5, name: "Clause I · The Wind Remembers", desc: "Your spells and blade carry a little of the under-text: +5% damage and +1 mana a second.", mods: { attack: 0.05, manaRegen: 1 } });

export const LORE_SCRIPT = FRAGMENTS.map((f) => `
title: W_Frag${f.n}
---
A scrap of very old paper, folded small. The ink moves when you aren't looking straight at it.
"${f.text}"
<<set $FRAGMENTS to $FRAGMENTS + 1>>
<<if $FRAGMENTS == ${CLAUSE.need}>>
    Your grimoire goes warm against your side. Five scraps, one sentence: a line of the under-text comes back.
    ${CLAUSE.name}. The page hums.
    <<set $CLAUSE_1 to 1>>
<<endif>>
===
`).join("") + `
title: W_MossTower
---
<<if $GALEN_DEFEATED>>
    Moss: Sir Galen's lantern went out a long time ago. Tonight, it went out properly. Thank you for that.
    Moss: Some books are better read twice. Some knights are better left to sleep.
    <<stop>>
<<endif>>
<<if $ILSE_DEFEATED>>
    Moss: You hear it too? Under the floor. Knocking. Old armor, very rusty, very angry.
    Moss: The Choir woke something they shouldn't have. Stand in the middle of the hall if you want to meet it. Bring your friends.
    <<stop>>
<<endif>>
Moss: The hall is quiet now. Too quiet, since the Choir came to the ceremony.
Moss: If you're looking for trouble, the hymn on the Fens well would be my guess. It was nailed up by someone who meant it.
===
`;
