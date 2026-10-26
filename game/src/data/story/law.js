// Free-roam talk for the law (data/law.js, runtime/law.js) and for Luke, who joined the Watch.
//
// Luke: nonchalant, hardworking, kind underneath and a total pain on top, until somebody needs protecting.
// He was selling eels in the Lowmarket the day the Choir came back for his sister Elsie. Rook got there
// first. He's been trying to work out what you owe someone for that ever since, and he decided on boots.
// Half of Aurelin finds a reason to walk past the south gate now. He has no idea why.

export const LAW_SCRIPT = `
title: L_Arrest
---
<<if $LAW_LUKE>>
    Luke: Oh. It's you. Course it's you.
    Luke: There's a {$LAW_BOUNTY}-Mark bounty on you. That's a lot of eels.
    Luke: ...You pulled my sister out of the Fens. So I didn't see you. Once. Don't make it weird.
    -> "Thank you, Luke." #earnest
        Luke: Whatever. Go, before I remember I have a job.
        <<set $LAW_CHOICE to 4>>
    -> "I'll pay it. You don't owe me." <<if $LAW_CAN_PAY>> #earnest
        Luke: ...Huh. Fine. Paperwork's in triplicate, though. I'm not doing it, you are.
        <<set $LAW_CHOICE to 1>>
    <<stop>>
<<endif>>
Watch: Hold it right there. There's a bounty on you. {$LAW_BOUNTY} Marks.
<<if $LAW_RENOWN >= 10>>
    Watch: Never thought I'd be saying that to a Lantern.
<<endif>>
-> "I'll pay it." <<if $LAW_CAN_PAY>> #earnest
    Watch: Sensible. The Watch thanks you for your contribution.
    <<set $LAW_CHOICE to 1>>
-> "I'll come quietly." #earnest
    Watch: Hands where I can see them. Walk.
    <<set $LAW_CHOICE to 2>>
-> "Make me." #bold
    Watch: Your funeral.
    <<set $LAW_CHOICE to 3>>
===

title: L_Jailed
---
The cells under the Watch House. Damp stone, one window the size of a book, and a bench that was never meant for sleeping.
<<if $JAIL_SURRENDERED>>
    You came quietly. The sergeant writes that down as if it surprised him.
<<else>>
    You wake up on the bench with a lump on your head and a Watch blanket over you. Somebody put it there.
<<endif>>
{$JAIL_HOURS} hours later, keys rattle in the lock.
Sergeant: Bounty's served. You're square with the Watch.
<<if $JAIL_FINE > 0>>
    Sergeant: Less {$JAIL_FINE} Marks for the trouble of carrying you in. Two of my lads have bad backs now.
<<endif>>
Sergeant: Go on, Lantern. And don't make me fill in another form.
<<set $JAILED to 0>>
===

title: L_Sergeant
---
<<law check>>
<<if $LAW_BOUNTY > 0>>
    Sergeant: You've a bounty in Aurelin. {$LAW_BOUNTY} Marks.
    -> "I'll pay it now." <<if $LAW_CAN_PAY>> #earnest
        <<law pay>>
        Sergeant: Paid in full. You're a free citizen again. Try to stay one.
    -> "Not today." #wry
        Sergeant: Then the lads will keep an eye out for you. They've got two each.
    <<stop>>
<<endif>>
<<if $LUKE_GUARD>>
    Sergeant: Since that Luke boy signed up, I've had nineteen applications. Eighteen of them asked which shift he's on.
    Sergeant: The nineteenth was his mother. She wanted to know if he's eating.
<<else>>
    Sergeant: The City Watch. We keep the peace, the gate, and a very long list.
<<endif>>
Sergeant: The more of this city's trouble you sort out, Lantern, the more people want to stand on a corner in a blue coat. Funny how it works.
===

title: L_Drunk
---
Drunk: Is it Tuesday?
-> "It's not Tuesday." #wry
    Drunk: Then I've got time. Wake me on Tuesday.
-> "What are you in for?" #earnest
    Drunk: Singing. Very well, I thought. The Watch disagreed.
===

title: L_Board
---
The Watch's board. Bounties, chalked up and rubbed out again.
<<if $BOUNTY_AURELIN > 0>>
    AURELIN. One Lantern, a one-page grimoire, {$BOUNTY_AURELIN} Marks. The drawing doesn't look like you at all. It's very unfair.
<<else>>
    Nothing on Aurelin with your name on it. Somebody has drawn a moustache on the last poster instead.
<<endif>>
<<if $BOUNTY_THORNWICK > 0>>
    THORNWICK. {$BOUNTY_THORNWICK} Marks, by order of the village watch.
<<endif>>
===

title: W_Patrol
---
<<if $LUKE_GUARD>>
    Patrol: Lantern. Have you seen Luke? There's three girls at the gate asking, and I'm not paid enough.
<<elseif $RENOWN_AURELIN >= 10>>
    Patrol: Lantern. Quiet day. Let's keep it that way, eh?
<<elseif $RENOWN_AURELIN <= -10>>
    Patrol: I'm watching you. Both of you. All three. ...However many of you there are.
<<else>>
    Patrol: Move along. Nothing to see. That's the job, mostly.
<<endif>>
===

title: W_Recruit
---
Recruit: Signed up last week. My mum says it's because of Luke. It's not because of Luke.
Recruit: ...Which shift is he on?
===

title: W_Admirer
---
Admirer: We're not here for him. We're here for the gate. It's a very nice gate.
Admirer: ...He waved. Did you see? He waved at me.
===

title: W_Watchman
---
<<if $LUKE_GUARD>>
    Watchman: Thornwick's got a watch now. Two of us. The Watch sent us after that Luke made it look easy.
<<else>>
    Watchman: Thornwick's watch. It's me. I'm the watch. Don't steal anything, it'd ruin my week.
<<endif>>
===
`;

export const LUKE_SCRIPT = `
title: W_Elsie
---
<<if not $ELSIE_SAVED>>
    Elsie: Are they gone? Are the singing people gone?
    <<stop>>
<<endif>>
<<if $Q_LUKE == 0>>
    Elsie: You came. Nobody came. I hid in the reeds for three days and nobody came, and then you did.
    Elsie: Everyone went with the singing. I put my fingers in my ears, like Luke taught me for the bell.
    Elsie: I don't remember the village's name either. Nobody does. I remember Luke's.
    Elsie: He's my brother. He sells eels in the big city market. He was at the market when they came.
    -> "I'll find him. I'll tell him you're safe." #earnest
        Elsie: Tell him I was brave. Tell him I didn't cry. ...Don't tell him about the crying.
    -> "Stay with Ness, by the water. She'll look after you." #earnest
        Elsie: She says I can sleep in her boat. It smells of fish. I like it.
        Elsie: Find Luke? Please? He's tall, and he thinks he's handsome.
    <<quest start luke>>
    <<stop>>
<<endif>>
<<if not $LUKE_GUARD>>
    Elsie: Did you find him? Was he eating? He never eats when he's sad.
<<elseif not $LUKE_HOME_OPEN>>
    Elsie: Luke's in the WATCH. He's got a coat and boots and a spear. I'm going to be in the Watch too.
    Elsie: He says we can go home when the village is safe. When the singing lady's gone, and the big thing in the reeds.
<<else>>
    Elsie: We're home! Come and see. Luke fixed the door. Mostly.
<<endif>>
===

title: W_Luke
---
<<if not $LUKE_MET>>
    Luke: You're in my light.
    Luke: No, I'm not buying anything, I'm selling. Eels. Fresh. Ish. ...You're not here for eels.
    -> "Your sister's alive. Elsie. She's safe in the Fens." #earnest
        Luke: ...
        Luke: Say that again.
        You tell him about the village, the reeds, the three days. He doesn't say anything for a while.
        Luke: I was here. Selling eels. I was selling EELS while they were singing my sister out of her bed.
        Luke: ...Whatever. So I owe you. I hate owing people.
    -> "Elsie sent me. She says you think you're handsome." #wry
        Luke: I AM handsome. That's not thinking, that's... Elsie? Elsie's alive?
        You tell him about the village, the reeds, the three days. He sits down on an eel crate and doesn't get up.
        Luke: ...Whatever. So I owe you. I hate owing people.
    Luke: The Watch is hiring. Free boots. Somebody's got to stand between the singing and the people who can't hear it coming.
    Luke: Don't look at me like that. I'll sleep on it.
    <<set $LUKE_MET to 1>>
    <<set $LUKE_MET_DAY to $DAY>>
    <<stop>>
<<endif>>
<<if not $LUKE_GUARD>>
    Luke: I said I'd sleep on it. I haven't slept yet. Go away and come back tomorrow.
    <<stop>>
<<endif>>
<<if not $LUKE_TALKED_GUARD>>
    Luke: Oh look. It's my debt.
    Luke: Yes, it's a uniform. Yes, it suits me. Everything suits me. It's a curse.
    Luke: Three girls have brought me pastries since breakfast. I don't even like pastries. ...I ate them, obviously. It'd be rude.
    Luke: And the sergeant says six lads signed up this week because I did. No idea why. I'm very annoying.
    <<set $LUKE_TALKED_GUARD to 1>>
    <<stop>>
<<endif>>
<<if $LUKE_SOFT and not $LUKE_SOFT_TALK>>
    Luke: Don't.
    Luke: Don't look at me like that. The kid's eight. Somebody had to.
    Luke: Elsie waited three days in the reeds because nobody came. Nobody waits three days on my watch. That's all.
    Luke: ...Don't tell anyone. I've got a reputation.
    -> "Your secret's safe." #earnest
        Luke: Good. ...Thanks. For the Fens. I never actually said it. So. Thanks.
    -> "Too late. I'm telling everyone." #wry
        Luke: Then I'm telling everyone you snore on watch. We'll see who's believed.
    Luke: When the Fens are safe, the singing lady and that thing in the reeds, I'm taking Elsie home. Come by. She'll want to show you the door I fixed.
    <<set $LUKE_SOFT_TALK to 1>>
    <<quest start lukehome>>
    <<stop>>
<<endif>>
<<if $Q_LUKE == 4>>
    Luke: The Lowmarket. Somebody's shaking down the kids by the stalls. Go. I'm right behind you. I'm faster than you, I'm just letting you go first.
    <<stop>>
<<endif>>
<<if $RENOWN_AURELIN <= -10>>
    Luke: You know half the Watch has your drawing in their pocket? Not a good drawing. I've seen better on a fence.
<<else>>
    Luke: Gate's quiet. I'm not bored. I'm being vigilant. It looks the same.
<<endif>>
===

title: W_LukeHome
---
Luke: Don't touch the door. It's load-bearing now. I don't know how.
Luke: Elsie draws you every day. You've got a cape in all of them. You don't have a cape. I've told her.
-> "Thank you for having me." #earnest
    Luke: You don't have to do the polite thing. You're... you're family-ish. Sit down. Not on that chair, it bites.
-> "I'd look good in a cape." #wry
    Luke: Nobody looks good in a cape. Except me. Probably.
===

title: W_ElsieHome
---
Elsie: This is our house! That's my bed, that's Luke's bed, that's the door Luke fixed. It sticks.
Elsie: I'm drawing you. You've got a cape. Luke says you don't. Luke's wrong.
<<set $LUKE_HOME_VISITED to 1>>
===

title: W_ElsieDrawing
---
Charcoal drawings, pinned all along the wall. A tall boy with a spear. A girl in the reeds with her fingers in her ears. Someone with a book and a cape, standing between them and a crowd of singing faces.
<<set $LUKE_HOME_VISITED to 1>>
===

title: W_LukeHelmet
---
A spare Watch helmet on a peg, polished until you can see your face in it. A note tucked inside, in a child's letters. FOR WHEN YOU ARE BRAVE.
===

title: W_LukeChest
---
Under the window, an old eel-seller's chest. Inside, folded on top, a note in Luke's untidy hand.
"For the Lantern. Don't make it weird." Under it, Marks. All of the eel money, by the look of it.
<<earn 80>>
<<set $LUKE_HOME_VISITED to 1>>
===
`;
