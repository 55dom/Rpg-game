// The Gilded Spoon café (Lowmarket, Aurelin): its staff, regulars and the side story
// "The Day the Café Lost Its Cake" (data/quests.js `cake`). Juno works here after hours for extra Marks.
// Clues raise $CAKE_CLUES once each; with enough of them, table three gives the game away.

export const CAFE_SCRIPT = `
title: W_CafeIntro
---
<<shot wide front>>
The Gilded Spoon. Warm bread, cinnamon, and a bell over the door that rings in a major key.
<<shot on Pip>>
<<pose Pip raise>>
Pip: Welcome to the Gilded Spoon! Table for one?
<<pose Pip none>>
-> "I'll sit down." #earnest
    Pip: Wonderful! Any table with a cup on it. Mari will be right with y—
-> "What do you recommend?" #earnest
    Pip: The honey buns! And the lemon cake. Well. Usually the lemon cake—
-> "What's going on around town?" #wry
    Pip: Oh, the Countess's birthday is today, so everyone's ordered c—
-> "Just looking." #wry
    Pip: Look all you like! We have the prettiest teacups in Aurelin and the—
<<sfx surgeFull>>
<<move Mari 0.4 -3.2 wait>>
<<shot on Mari>>
<<pose Mari point>>
Mari: YOU!
<<pose Mari none>>
<<shot on Rook>>
Rook: ...Me?
<<shot on Mari>>
Mari: The cake is missing.
<<shot two Mari Rook>>
Rook: What cake?
<<shot on Mari>>
<<pose Mari raise>>
Mari: The BIG cake.
<<pose Mari none>>
<<move Odette 1.6 -2.6 wait>>
<<shot on Odette>>
Odette: Don't panic.
<<wait 1.2>>
<<pose Odette cross>>
Odette: The cake is definitely gone.
<<shot wide side>>
<<move Hazel -0.6 -2.4>>
<<move Bettany 0.6 -1.8 wait>>
Hazel: I was sweeping all morning. Brooms don't eat cake.
<<shot on Bettany>>
<<pose Bettany cross>>
Bettany: D-don't look at me! Why is everyone looking at me?
<<pose Bettany none>>
<<shot on Pip>>
Pip: Barnaby's been "tasting things" since dawn!
Barnaby: TASTING IS MY JOB!
<<shot on Juno>>
Juno: ...
<<face Juno Rook>>
Juno: Oh no. Don't. Don't say anything.
Juno: Yes, I work here. After hours. Knight pay is knight pay, and a girl needs thread.
-> "Your secret's safe." #earnest
    Juno: Thank you. If Bas finds out, he'll want the employee discount.
-> "Nice headband." #wry
    Juno: I will stitch your boots to the floor.
-> "Are you on the case too?" #bold
    Juno: I'm on every case. Mostly the one with the tips in it.
<<shot on Odette>>
<<pose Odette none>>
Odette: Knight. You look like someone who finds things.
Odette: It was a three-tier lemon cake for the Countess's birthday. Collection at noon. It is now half past eleven.
-> "I'll find your cake." #earnest
    Odette: Good. Ask anyone. Everyone in this room is a suspect. Including the cat.
-> "Is this really a job for a knight?" #wry
    Odette: The Countess is a patron of the Crown's knights. So yes. Ask anyone. Including the cat.
<<set $CAKE_INTRO to 1>>
<<quest start cake>>
===

title: W_Pip
---
<<if $CAKE_FOUND>>
    Pip: Welcome back! Please don't ask where the cake went.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_PIP>>
    Pip: Clues! I love clues. Okay. When I opened up, the cake was in the case. Then the rush came. Then it wasn't.
    Pip: Bettany took a big order out to the tables around then. A REALLY big order.
    <<set $CLUE_PIP to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Pip: Welcome to the Gilded Spoon! Sit anywhere with a cup on it!
===

title: W_Mari
---
<<if $CAKE_FOUND>>
    Mari: One tier is still a cake. That's what we're telling the Countess. With confidence.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_MARI>>
    Mari: I write every order down. Every one. Look. Table eight: one large, lemon.
    Mari: ...We don't have a table eight.
    Rook: Then who got it?
    Mari: I'm going to need to sit down. Not at a table. Tables are suspects now.
    <<set $CLUE_MARI to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Mari: Ready to order? Find a seat and I'll come find you.
===

title: W_Bettany
---
<<if $CAKE_FOUND>>
    Bettany: I've started writing my threes with a little flag on top. Like this. So nobody thinks they're eights.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_BETTANY>>
    Bettany: I didn't EAT it! I don't even like lemon! I'm a chocolate person!
    -> "Did you carry it anywhere?" #earnest
        Bettany: ...Maybe? The slip said a large lemon for table... the ink was smudged. It was a three. Or an eight. They're very similar numbers!
    -> "Chocolate person. Noted." #wry
        Bettany: Thank you. ...Oh! Wait. I DID carry something big this morning. The slip said table three. Or eight. The ink ran.
    <<set $CLUE_BETTANY to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Bettany: Coming through! Hot tea! Hot tea!
===

title: W_Hazel
---
<<if $CAKE_FOUND>>
    Hazel: There are crumbs at table three that I will be finding until the end of time.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_HAZEL>>
    Hazel: I sweep. I see things. Today I swept up lemon crumbs. Not by the counter.
    Hazel: By the window. A trail of them. Like breadcrumbs, but cake.
    <<set $CLUE_HAZEL to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Hazel: Mind the floor. It's clean. I'd like it to stay that way.
===

title: W_Odette
---
<<if $CAKE_FOUND>>
    Odette: The Countess said it was "a brave, minimalist cake." We have decided that was a compliment.
    Odette: You eat free here. Within reason. Mari decides what reason is.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999>>
    Odette: Twenty minutes to noon. Report, knight.
    <<if $CAKE_CLUES >= 4>>
        Odette: Crumbs by the window, a smudged slip, a very big order... Go look at table three. Now.
    <<else>>
        Odette: Talk to my staff. Talk to the customers. Talk to the cat if you must.
    <<endif>>
    <<stop>>
<<endif>>
Odette: The Gilded Spoon. Since before your grandmother's grandmother. Please wipe your feet.
===

title: W_Barnaby
---
<<if $CAKE_FOUND>>
    Barnaby: Lemon curls on the last tier. Nobody will know. Nobody will EVER know.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_BARNABY>>
    Barnaby: I baked that cake at four in the morning! Three tiers! Lemon curd between every one!
    Barnaby: I tasted the batter. ONCE. That's quality control, not crime.
    Barnaby: It left my kitchen whole. On a big blue plate. Find the blue plate, find the cake.
    <<set $CLUE_BARNABY to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Barnaby: Out of my kitchen unless you're bringing butter.
===

title: W_JunoCafe
---
<<if $CAKE_FOUND>>
    Juno: Tips were good tonight. Don't tell Dagrun, he'll want rent.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_JUNO>>
    Juno: Thread doesn't lie, and neither do tablecloths. Table three's has crumbs and a blue plate ring.
    Juno: I'd look myself, but I'm on shift and that man has asked me for "more tea" eleven times.
    <<set $CLUE_JUNO to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Juno: Welcome to the Gilded Spoon. I'll be your server. I'm also armed.
===

title: W_Tobin
---
<<if $CAKE_FOUND>>
    Tobin: I've been coming here twelve years and today was the best show yet.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_TOBIN>>
    Tobin: Me? I'm a big man, and I love cake. But I'd never take a lady's birthday cake.
    Tobin: I just took two honey buns. From the counter. When nobody was looking. Different crime.
    -> "That's still a crime." #bold
        Tobin: Then arrest me AFTER I finish them.
    -> "Seen anyone else with a big cake?" #earnest
        Tobin: Old Fenwick by the window's been chewing since I sat down. Hasn't looked up once.
    <<set $CLUE_TOBIN to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Tobin: The honey buns here could make a grown man cry. I've cried twice this week.
===

title: W_Nib
---
<<if $CAKE_FOUND>>
    Nib: I KNEW it was the grandpa. I knew it in my bones.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_NIB>>
    Nib: I didn't take it. I'm too small to carry a whole cake. I tried once. It was a different cake.
    Nib: But the grandpa by the window has been eating for an HOUR. Nobody eats for an hour. Not even me.
    <<set $CLUE_NIB to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Nib: My mum says I can have ONE cake. She didn't say how big.
===

title: W_Traveler
---
<<if $CAKE_FOUND>>
    Traveler: A good cake mystery. I've seen wars with less tension.
    <<stop>>
<<endif>>
<<if $Q_CAKE >= 1 and $Q_CAKE < 999 and not $CLUE_TRAVELER>>
    Traveler: I've walked from the Ashen Coast to the Dry Sea. I've seen dragons' bones and drowned towers.
    Traveler: I have never seen a man take on a three-tier cake alone. Until today. By the window.
    Traveler: I respect him deeply.
    <<set $CLUE_TRAVELER to 1>>
    <<set $CAKE_CLUES to $CAKE_CLUES + 1>>
    <<stop>>
<<endif>>
Traveler: Mm. Good tea. Better than the road.
===

title: W_Fenwick
---
<<if $CAKE_FOUND>>
    Fenwick: Lovely place. I come for the tea. Only the tea now. Doctor's orders.
    <<stop>>
<<endif>>
<<if $Q_CAKE == 2>>
    <<jump W_CakeReveal>>
<<endif>>
Fenwick: Hello, young knight. I ordered a cup of tea and a little something. It's a very generous little something.
===

title: W_CakeReveal
---
<<shot wide side>>
Everyone in the Gilded Spoon slowly turns toward table three.
<<move Odette -3.4 3.2>>
<<move Mari -3.6 4.6>>
<<move Bettany -3.4 2.4>>
<<move Pip -2.8 3.8>>
<<move Juno -3.0 5.0 wait>>
<<shot on Fenwick>>
Fenwick: Oh! Hello, everyone. Is it my birthday?
<<shot on Odette>>
<<pose Odette cross>>
Odette: Sir. What are you eating.
<<shot on Fenwick>>
Fenwick: The tea and a little something I ordered. On a lovely blue plate.
<<shot on Bettany>>
<<pose Bettany raise>>
Bettany: TABLE THREE! The slip said three! I was RIGHT, it was a three!
<<pose Bettany none>>
<<shot on Mari>>
Mari: It said EIGHT. ...It said a smudge.
<<shot on Fenwick>>
Fenwick: I did think it was rather a lot of cake for one cup of tea. But it seemed rude to send it back.
<<shot on Pip>>
Pip: How... how much is left?
<<shot on Fenwick>>
Fenwick: One tier. I've been pacing myself.
<<wait 1.2>>
<<shot on Odette>>
Odette: ...One tier is a cake.
Odette: One tier is a small. Elegant. Cake.
Barnaby: I'LL ADD LEMON CURLS. NOBODY WILL KNOW.
<<shot on Juno>>
Juno: I'm putting this in my report to the squad. All of it.
<<shot two Odette Rook>>
<<pose Odette none>>
Odette: Knight. You found it. Mostly. You'll eat free here for life. Within reason.
-> "What counts as reason?" #wry
    Mari: I decide. And today, reason is very generous.
-> "Happy birthday to the Countess." #earnest
    Fenwick: And to me! Apparently!
<<set $CAKE_FOUND to 1>>
===

title: W_CakeCase
---
The cake case is empty, except for a ring of crumbs and a perfect circle where a big plate sat.
A trail of yellow crumbs leads off the counter... toward the windows.
<<set $CAKE_CASE to 1>>
<<set $CAKE_CLUES to $CAKE_CLUES + 1>>
===

title: W_CafeMenu
---
THE GILDED SPOON · TODAY: Tea, 4 Marks. Honey Bun, 6. Lantern Latte, 8. Lemon Cake: ask at the counter.
<<if $CAKE_FOUND>>
    Someone has added in chalk: "Lemon cake: please don't ask."
<<endif>>
===

title: W_CafeSit
---
<<shot on Rook>>
You take a seat. The chair is warm, the cup is clean, and somewhere a kettle is singing.
<<if $Q_CAKE >= 1 and $Q_CAKE < 999>>
    Mari: I'd take your order, but we're in a CRISIS. Ask around about the cake first?
    <<stop>>
<<endif>>
Mari: What can I get you?
-> Tea. (4 Marks)
    <<pay 4>>
    <<if $PAID>>
        Mari: One tea. Milk's on the table, honey's in the bear.
        <<heal Warm tea>>
        <<set $CAFE_ORDERS to $CAFE_ORDERS + 1>>
    <<else>>
        Mari: Short a few Marks? It's fine. Water's free. Sit as long as you like.
    <<endif>>
-> A honey bun. (6 Marks)
    <<if $CAKE_FOUND>>
        Mari: On the house. Within reason. This is reason.
        <<heal Honey bun>>
    <<else>>
        <<pay 6>>
        <<if $PAID>>
            Mari: Honey bun! Careful, it's sticky. Tobin cried at one once.
            <<heal Honey bun>>
        <<else>>
            Mari: Next time, then. I'll save you the stickiest one.
        <<endif>>
    <<endif>>
    <<set $CAFE_ORDERS to $CAFE_ORDERS + 1>>
-> A Lantern Latte. (8 Marks)
    <<pay 8>>
    <<if $PAID>>
        Mari: A Lantern Latte, with a little lantern drawn in the foam. Don't drink it too fast, it's emotional.
        <<heal Lantern latte>>
        <<set $CAFE_ORDERS to $CAFE_ORDERS + 1>>
    <<else>>
        Mari: That's an eight-Mark feeling. Maybe next payday.
    <<endif>>
-> "Just resting."
    Mari: Rest away. Nobody rushes anyone at the Gilded Spoon.
===

title: W_Hetty
---
Hetty: Oh! A knight in my kitchen. Wipe your boots, love. My husband's still at his stall, selling "blessed" charms.
-> "Are they really blessed?" #wry
    Hetty: I blessed them. I said "bless these" over the whole crate. It counts.
-> "Sorry to barge in." #earnest
    Hetty: Nonsense. The door's open for anyone who says hello. Have you tried the café up the street? Lovely girls. Terrible with cake.
===
`;
