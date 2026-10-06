// Talk nodes for free roam (the Lighthouse and Aurelin). Lines can change with story flags.

export const WORLD_SCRIPT = `
title: W_Dagrun
---
<<if $Q_FRIED == 2>>
    Dagrun: Is that... fried? From the fountain cart? Give it here.
    <<set $FRIED_DELIVERED to 1>>
    Dagrun: Mm. You're all right, kid. Don't tell Cal I said that.
    <<stop>>
<<endif>>
<<if $Q_FRIED == 1>>
    Dagrun: The cart by the fountain. Fried fish. Go on, I'm wasting away here.
    <<stop>>
<<endif>>
<<if $MIRREN_SAVED>>
    Dagrun: Heard you pulled a kid out of the bog. Good. That's the job, most days.
<<else>>
    Dagrun: Bas told me about the bog. Don't carry that alone, kid. That's what the squad's for.
<<endif>>
Dagrun: Aurelin's down the road if you want to stretch your legs.
<<if not $Q_FRIED>>
    -> "Want me to bring you something?" #earnest
        Dagrun: Something fried. From the cart by the fountain. You're a good kid.
        <<quest start fried>>
    -> "You could walk there yourself." #wry
        Dagrun: I could. I won't. Fried fish, by the fountain. Please.
        <<quest start fried>>
    -> Leave him to his nap.
<<endif>>
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
<<if $Q_RUMORS == 1 and not $ASKED_VENDOR>>
    -> Ask about the vanished village.
        Vendor: The Fens village? I sold a woman from there a lantern last month. Now I can't remember her face. That's never happened to me.
        <<set $ASKED_VENDOR to 1>>
        <<set $ASKED_FENS to $ASKED_FENS + 1>>
    -> Just browse.
<<endif>>
<<if $RENOWN_AURELIN >= 10>>
    Vendor: For a Lantern the whole city's talking about? Ten percent off.
<<endif>>
<<if $MET_VENDOR>>
    Vendor: Back again? Have a look.
<<else>>
    Vendor: A Lantern, eh? Squad discount: none. Have a look anyway.
    <<set $MET_VENDOR to 1>>
<<endif>>
===

title: W_Guard
---
<<if $Q_RUMORS == 1 and not $ASKED_GUARD>>
    Guard: The Fens village? Choir carts came through this gate the night before. Covered. Singing. I let them pass. Their papers were... fine. I think.
    <<set $ASKED_GUARD to 1>>
    <<set $ASKED_FENS to $ASKED_FENS + 1>>
    <<stop>>
<<endif>>
<<if $RENOWN_AURELIN >= 10>>
    The guard straightens up and salutes as you pass.
<<endif>>
Guard: South gate. The road out runs to the old Lighthouse. Nothing past that but dry seabed.
<<if $EXAM_DUEL_WON>>
    Guard: Wait. You're the one-pager who beat Valcourt's boy. My sister won a week's wages on you.
<<else>>
    Guard: Wait. You're the one-pager. You kept getting up. My sister lost a week's wages betting you'd stay down.
<<endif>>
===

title: W_Gossip
---
<<if $Q_RUMORS == 2>>
    Gossip: Well? What did they say?
    You tell her about the carts, the singing, and the faces nobody can remember.
    Gossip: ...I'll keep my door locked. Thank you, Lantern. Everybody should hear this.
    <<set $RUMORS_TOLD to 1>>
    <<stop>>
<<endif>>
<<if $Q_RUMORS == 1>>
    Gossip: Ask the guard at the gate, the crier, the Lowmarket vendor. Somebody saw something.
    <<stop>>
<<endif>>
Gossip: Did you hear? A whole village in the Greywater Fens. Gone. Not burned, not flooded. Gone.
Gossip: My cousin says the Choir sings and places forget they were ever there.
<<if $MIRREN_SAVED>>
    Gossip: They say a girl came out of it. Only one. A Lantern Knight pulled her from the bog.
<<endif>>
<<if not $Q_RUMORS>>
    -> "I'll find out what happened." #bold
        <<quest start rumors>>
        Gossip: Would you? Ask around. The guard, the crier, the vendors. Someone saw something.
    -> "I was there." #earnest
        Gossip: You were? Then ask around for me. Somebody in this city saw something.
        <<quest start rumors>>
    -> "Sounds like gossip." #wry
<<endif>>
===

title: W_Kid
---
<<if $Q_TOY == 2>>
    Kid: My lantern! You found it! You're the best knight. Second best. After me.
    <<set $TOY_RETURNED to 1>>
    <<stop>>
<<endif>>
<<if $Q_TOY == 1>>
    Kid: It's by the big gate somewhere. It's small and it glows. Please?
    <<stop>>
<<endif>>
Kid: Are you a knight? A real one? Where's your big book?
-> Show the one page. #earnest
    Kid: ...That's it? That's so small. I like it.
-> "It's a secret." #wry
    Kid: Cool. I'm good at secrets.
-> "Right here." #bold
    Kid: That's the smallest grimoire I've ever seen. Can it still kick?
<<if not $Q_TOY>>
    Kid: Hey. I lost my toy lantern by the big gate. Knights find things, right?
    -> "I'll find it." #earnest
        <<quest start toy>>
    -> "Knights are very busy." #wry
        Kid: ...Please?
        <<quest start toy>>
<<endif>>
===

title: W_Crier
---
<<if $Q_RUMORS == 1 and not $ASKED_CRIER>>
    Crier: The Fens village? I was paid to read a notice about it last week. When I got to the square, the paper was blank. I'd swear there were words.
    <<set $ASKED_CRIER to 1>>
    <<set $ASKED_FENS to $ASKED_FENS + 1>>
    <<stop>>
<<endif>>
Crier: Hear ye! The Royal Festival comes to Aurelin within the month!
Crier: All squads to parade! Even, by royal decree, the Lanterns.
===
title: W_Cook
---
Cook: Fried fish! Fried bread! Fried things you don't want to ask about!
<<if $Q_FRIED == 1>>
    -> Buy fried fish for Dagrun (5 marks).
        <<pay 5>>
        <<if $PAID>>
            Cook: Extra crispy. For a Lantern? Extra extra crispy.
            <<set $FRIED_FISH to 1>>
        <<else>>
            Cook: Five marks, friend. Come back when your pockets jingle.
        <<endif>>
    -> Not yet.
<<else>>
    Cook: Nothing today? Your loss.
<<endif>>
===
`;
