// Hidden lore (GDD §8.5 page fragments): scraps of the Palimpsest's under-text hidden in the world.
// Each restores a line; five restore an Inscription clause, which is lore and power together.

import { MURALS } from "./secretPages.js";

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
<<if $GIFT_TEA > 0>>
    -> Give him the smoked tea.
        <<mosstea>>
        <<if $MOSS_TEA_OK == 2>>
            Moss: Seven cups. Seven. Nobody's brought me tea seven times in three hundred... in a long while.
            Moss: Some books are better read twice. Hold still a moment. Your grimoire. There.
            Moss: A page I'd forgotten I was keeping. It was always yours. Don't ask me how I know that.
            <<stop>>
        <<elseif $MOSS_TEA_OK == 1>>
            Moss: Smoked, and strong enough to stand a spoon in. You remembered. Sit, if you like. The tea's the visit.
            <<stop>>
        <<else>>
            Moss: One cup a day, child. Any more and I'd be up sweeping at midnight.
            <<stop>>
        <<endif>>
    -> Not today.
<<endif>>
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

// The constellation murals (GDD §8.4 Star Chart, §13): twelve pieces of somebody's night sky.
export const MURAL_SCRIPT = MURALS.map((m) => `
title: W_Mural${m.n}
---
Chalked small on a flat stone, the gilt worn thin, half hidden: ${m.name}. ${m.line}
Somebody has been drawing the sky on stones like this, a piece at a time.
<<mural>>
===
`).join("");

// Forbidden pages and Corruption (GDD §8.2, §8.3): the Choir's cache in the Fens, and the Verdant Oath's shrine in Thornwick.
export const FORBIDDEN_SCRIPT = `
title: W_ChoirCache
---
Under a loose flagstone by the drowned path: a Pale Choir cache. Hymn sheets gone to pulp, a snapped tuning fork, and one page, dry as bone, that is warm to the touch.
It is a forbidden page. You can feel it wanting to be read.
-> Take the page.
    <<forbidden take>>
    You fold it into your grimoire. For a moment the one page you have goes very quiet.
    HOLLOW BITE. Pin it in the Grimoire if you mean to use it. It will cost you, and it will keep the count.
-> Leave it under the stone.
    You put the flagstone back. The warmth stays in your fingers a long while.
===

title: W_Shrine
---
A wayside shrine of the Verdant Oath: a little green-roofed box on a post, a bowl of clean water, a sprig of something that smells of spring.
<<cleanse shrine>>
<<if $CLEANSE_OK == 1>>
    You wash your hands in the bowl. The water clouds grey, then runs clear again. Something in the page loosens, a little.
<<elseif $CLEANSE_OK == -1>>
    The water's still grey from earlier. The Oath's card says once a day is enough. It isn't a quick thing, and it isn't meant to be.
<<else>>
    You wash your hands anyway. Cold, clean water. Nothing in the page needs loosening.
<<endif>>
===
`;
