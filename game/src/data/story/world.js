// Talk nodes for free roam (the Lighthouse and Aurelin). Lines can change with story flags.

export const WORLD_SCRIPT = `
title: W_Dagrun
---
<<if $MIRREN_SAVED>>
    Dagrun: Heard you pulled a kid out of the bog. Good. That's the job, most days.
<<else>>
    Dagrun: Bas told me about the bog. Don't carry that alone, kid. That's what the squad's for.
<<endif>>
Dagrun: Aurelin's down the road if you want to stretch your legs. Bring me back something fried.
===

title: W_Juno
---
Juno: If you're going to the capital, don't buy anything in the Lowmarket that's "blessed." Nothing there is blessed.
===

title: W_Bas
---
Bas: I've been practicing a new stance. It's mostly standing still, but harder.
===

title: W_Tamsin
---
Tamsin: I finished the song! Well. Two lines of it. It still doesn't rhyme.
===

title: W_Cal
---
Cal: Mind the step on your way out. Honestly, one of these days I'll fix it.
Cal: ...Probably not.
===

title: W_Lio
---
Lio: The library has a book on lost villages. It's three pages long. Someone tore the rest out.
===

title: W_HallKeeper
---
Keeper: The Hall of Lanterns. Every knight of Liraen has a lantern burning inside.
<<if $LANTERN_LIT>>
    Keeper: Yours was lit the night you joined the Lanterns. It's on the fourth shelf, near the end. It burns steady.
<<else>>
    Keeper: When you join a squad, your lantern will be lit here too.
<<endif>>
Keeper: When a knight dies, the wick turns to ash. That's how we know.
===

title: W_Vendor
---
Vendor: Lowmarket's finest! Blades, cloaks, charms for every knight!
<<if $MET_VENDOR>>
    Vendor: Back again? Have a look.
<<else>>
    Vendor: A Lantern, eh? Squad discount: none. Have a look anyway.
    <<set $MET_VENDOR to 1>>
<<endif>>
===

title: W_Guard
---
Guard: South gate. The road out runs to the old Lighthouse. Nothing past that but dry seabed.
<<if $EXAM_DUEL_WON>>
    Guard: Wait. You're the one-pager who beat Valcourt's boy. My sister won a week's wages on you.
<<else>>
    Guard: Wait. You're the one-pager. You kept getting up. My sister lost a week's wages betting you'd stay down.
<<endif>>
===

title: W_Gossip
---
Gossip: Did you hear? A whole village in the Greywater Fens. Gone. Not burned, not flooded. Gone.
Gossip: My cousin says the Choir sings and places forget they were ever there.
<<if $MIRREN_SAVED>>
    Gossip: They say a girl came out of it. Only one. A Lantern Knight pulled her from the bog.
<<endif>>
===

title: W_Kid
---
Kid: Are you a knight? A real one? Where's your big book?
-> Show the one page. #earnest
    Kid: ...That's it? That's so small. I like it.
-> "It's a secret." #wry
    Kid: Cool. I'm good at secrets.
-> "Right here." #bold
    Kid: That's the smallest grimoire I've ever seen. Can it still kick?
===

title: W_Crier
---
Crier: Hear ye! The Royal Festival comes to Aurelin within the month!
Crier: All squads to parade! Even, by royal decree, the Lanterns.
===
`;
