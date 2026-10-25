// The Hall of Lanterns (inside): the Keeper and the shelves. Every knight's lantern burns here; when a
// knight dies, the wick turns to ash. What you can read on the shelves follows the story's flags.
// Lines describe; they never point (GDD §15.4 rule 4).

export const HALL_SCRIPT = `
title: W_HallKeeperIn
---
<<if $CAL_STATE>>
    Keeper: You're the Lanterns' newest. I'm sorry about your vice captain.
    Keeper: I keep his lantern dusted. I keep all of them dusted. It's the only thing I'm good for.
    <<if $SEEN_CAL_LANTERN>>
        -> "His wick isn't ash."
            Keeper: No. It happens, with the ones lost beyond the border. The Hollowmarch. The deep water.
            Keeper: The Hollow takes the ash too. There's nothing left to fall.
            Keeper: I've seen it four times in forty years. I'm sorry.
        -> "Thank you for looking after it."
            Keeper: Someone has to. They burned for us.
    <<endif>>
<<else>>
    Keeper: Every knight in Liraen has a lantern on these shelves. Seven squads, seven shelves.
    Keeper: The Lanterns are on the far wall. The fourth shelf, near the end. Small squad. Loud, I'm told.
<<endif>>
Keeper: When a knight dies, the wick turns to ash. That's how we know. That's how we've always known.
===

title: W_Hall_CalLantern
---
<<set $SEEN_CAL_LANTERN to 1>>
<<if $CAL_STATE>>
    CALDER WYNN · VICE CAPTAIN · LAST LANTERNS
    The lantern is dark. The glass is clean. The wick still stands, black and straight.
    <<set $CLUE_A2 to 1>>
<<else>>
    CALDER WYNN · VICE CAPTAIN · LAST LANTERNS
    The flame leans a little to one side, like it's listening.
<<endif>>
===

title: W_Hall_MyLantern
---
<<if $LANTERN_LIT>>
    {name} · LAST LANTERNS
    Your lantern. The flame is small and very bright. It doesn't flicker when the door opens.
<<else>>
    An empty hook at the end of the Lanterns' shelf, with a blank brass plate.
<<endif>>
===

title: W_Hall_Brannoc
---
IRON WARDENS · "THE WALL DOES NOT MOVE"
<<if $BRANNOC_DEAD>>
    CAPTAIN BRANNOC STEELHART. The big lantern at the front is dark. A small grey heap of ash lies where the wick was.
<<else>>
    CAPTAIN BRANNOC STEELHART. The big lantern at the front burns tall and steady, like the man.
<<endif>>
Rows of plain iron lanterns behind it. Two of them hold only a little ash.
===

title: W_Hall_Fallen
---
CRIMSON BELL · "FORBIDDEN MAGIC MUST BE SILENCED"
Most of the lanterns burn. On the top tier, three hold nothing but a small grey heap of ash.
===
`;
