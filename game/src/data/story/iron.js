// Ironhold in free roam (after Episode 19): Brannoc at his command tent until Episode 22, a Warden at the gate,
// and afterwards the sword planted where he used to stand.

export const IRON_SCRIPT = `
title: W_Brannoc
---
<<if $EP21_DONE>>
    Brannoc: Rook. You're standing better. Weight on the back foot. Good.
    Brannoc: Tomorrow she comes herself. Get some sleep. That's a captain's advice, not an order.
<<elseif $EP20_DONE>>
    Brannoc: You held the gate field. Two waves of Ashfall, and the wall never had to do a thing. I'll remember that.
<<else>>
    Brannoc: Lanterns. Good. The wall's holding. Go and find your captain; we'll talk when you're settled.
<<endif>>
===

title: W_Warden
---
<<if $BRANNOC_DEAD>>
    Warden: Bas is in the command tent most nights. He doesn't sleep much.
    Warden: The captain said the wall doesn't move. We're keeping it that way. For him.
<<else>>
    Warden: Iron Wardens, eastern border. The wall's eighty years old and it has never fallen. Mind the gate, it sticks.
<<endif>>
===

title: W_IronMemorial
---
CAPTAIN BRANNOC STEELHART · IRON WARDENS
His sword, point down in the earth in front of the command tent. His grey cloak over the hilt. Two candles that someone keeps lit.
Someone has carved four words into the crossguard: THE WALL DOES NOT MOVE.
===
`;
