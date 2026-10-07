// Talk nodes for free roam (the Lighthouse and Aurelin). Lines can change with story flags.

import { CAFE_SCRIPT } from "./cafe.js";
import { BOND_SCRIPT } from "../bonds.js";
import { CRAFT_SCRIPT } from "../crafting.js";

const BASE_SCRIPT = `
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
<<if $Q_BELOW == 3>>
    Cook: Well? What's down there?
    You tell the cook about the rats, the fish bones, and the brass thing that guarded them.
    Cook: Brass. Guarding rats. In my city. ...I'm going to start frying with the lid on.
    <<set $BELOW_TOLD to 1>>
    <<stop>>
<<endif>>
Cook: Fried fish! Fried bread! Fried things you don't want to ask about!
<<if $Q_BELOW == 1 or $Q_BELOW == 2>>
    Cook: Been down the grate yet? Listen at it. Tick, tick, tick. Rats don't tick.
<<endif>>
<<if $Q_FRIED != 1 and not $Q_BELOW>>
    Cook: Except my fish keeps vanishing. Down the grate by the Lowmarket. Every night, a little less fish.
    -> "I'll go down and look." #bold
        Cook: Would you? Take a lantern. Take two. I've heard things down there. Ticking things.
        <<quest start below>>
    -> "Have you tried a bigger lid?" #wry
        Cook: Ha. I have. Something chewed through the lid. If you change your mind, the grate's by the east wall.
<<endif>>
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

title: W_Wren
---
<<if $MET_WREN>>
    Wren: Eating properly? You look thin. Knights always look thin. It's all the running at things.
    <<stop>>
<<endif>>
<<set $MET_WREN to 1>>
Wren: {name}! Look at you. A knight. A real one, with a cloak and everything.
Wren: The little ones keep asking if you'll visit. I told them knights are very busy.
-> "I'm never too busy for Thornwick." #earnest
    Wren: Liar. A sweet liar. Come here.
    She hugs you like you're still nine.
-> "Is the roof still leaking?" #wry
    Wren: Over your old bed, yes. We put a bucket there. We call it {name}'s bucket.
-> "One page, Wren. They gave me one page." #bold
    Wren: Then it's a very important page. I've always said so.
Wren: The ledger's inside the door if you want to see your entry. You always did like reading it.
===

title: W_Ledger
---
The orphan ledger. Thin paper, careful handwriting, sixty years of names.
You find your line. You know it by heart.
"Found: one infant, in ash-grey cloth. Unnamed. Night of the ninth of Harrow."
"Brought in by:" The space after it is blank. It has always been blank.
<<if $LEDGER_SEEN_LARKSPUR>>
    Two lines down, in the same hand: "No carts from Larkspur this week. Roads closed? Ask."
    Nobody ever wrote the answer.
<<else>>
    Two lines down, in the same hand: "No carts from Larkspur this week. Roads closed? Ask."
    Larkspur. The village that burned at the edge of the map. The same night you were found.
    <<set $LEDGER_SEEN_LARKSPUR to 1>>
<<endif>>
===

title: W_Farmer
---
<<if $Q_BANDITS == 2>>
    Farmer: They ran? All of them? Ha! I'll tell the miller. He'll cry. He cries at everything.
    <<set $BANDITS_TOLD to 1>>
    <<stop>>
<<endif>>
<<if $Q_BANDITS == 1>>
    Farmer: Mill road, south-east. Three of them, maybe four. Mind the one with the knives. He throws them.
    <<stop>>
<<endif>>
<<if $Q_BANDITS == 999>>
    Farmer: Road's been quiet since you came through. The miller baked you a loaf. It's terrible. Take it anyway.
    <<stop>>
<<endif>>
Farmer: {name}? The orphanage kid? With the one page? Huh. Good for you.
Farmer: Listen. Bandits have been sitting on the mill road. Nobody's ground flour in a week.
-> "I'll clear them out." #bold
    Farmer: That's the spirit. South-east, past the field. Don't die. Wren would kill me.
    <<quest start bandits>>
-> "How many?" #earnest
    Farmer: Three. Desperate, not clever. Will you go? Wren would never forgive me if I asked anyone else.
    <<quest start bandits>>
-> "Not today, Odo."
    Farmer: Fair. The bandits aren't going anywhere. That's the problem.
===

title: W_Smith
---
Smith: Knight's sword, is it? Squire's blade. Plain. Honest. I could've made you better, if you'd asked.
<<if $RENOWN_THORNWICK >= 10>>
    Smith: Heard you cleared the mill road. Thornwick doesn't forget a thing like that.
<<else>>
    Smith: Aurelin's Lowmarket sells fancier. Fancier isn't better. Remember that.
<<endif>>
===

title: W_Ness
---
<<if $NESS_TALKED>>
    Ness: Still here? The fish don't bite when knights are standing on the bank.
    <<stop>>
<<endif>>
<<set $NESS_TALKED to 1>>
Ness: Forty years I've fished this water. There used to be a village up the path. I sold them eels.
Ness: I can't remember a single face. Not one. But I remember the eels.
<<if $MIRREN_SAVED>>
    Ness: You're the one who brought the girl out. She was the only voice I heard that night that wasn't singing.
<<endif>>
Ness: The hounds come out of the reeds at dusk. And sometimes the robed ones come back. Mind yourself.
===

title: W_Hymn
---
A sheet of paper, nailed to the well post. The ink is fresh. The paper is old.
"Sing the name, and sing it soft, and sing it once again."
"Sing until the name is gone. Then nothing has to end."
The bottom half is torn off. Someone wrote over the tear in charcoal: STOP SINGING.
<<set $ASKED_HYMN to 1>>
===

title: W_Bones
---
A pile of fish bones at the bottom of the stairs, picked clean. Dozens of them.
Tiny teeth marks on every one. And something else: a thin brass shaving, curled like a ribbon.
Rats don't shave brass.
===

title: W_Guard2
---
<<if $RENOWN_AURELIN >= 10>>
    Guard2: Lantern. The Hall's open to you, any hour. The Keeper says you're the talk of the plaza.
<<else>>
    Guard2: Hall of Lanterns. No running, no singing, no touching the wicks.
<<endif>>
Guard2: Watch your purse in the Lowmarket. And don't feed the pigeons. They unionized.
===
`;

/** Every free-roam talk node: the towns, the Gilded Spoon café (data/story/cafe.js), and bonds (data/bonds.js). */
export const WORLD_SCRIPT = BASE_SCRIPT + CAFE_SCRIPT + BOND_SCRIPT + CRAFT_SCRIPT;
