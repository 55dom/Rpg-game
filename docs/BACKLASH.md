# BACKLASH — Playable Flashback Design Package
### UNWRITTEN — Knights of the Last Lantern · Companion to `GDD.md` §26 · v1.1

> **v1.8:** **Matching masks, hair, maid details, and color grading.**
> - **Masks:** both now wear the same smooth white mask with closed crescent eyes. **Vaelith's smiles. Ghorran's is the same face turned upside down: a frown.** Comedy and tragedy, and neither ever moves.
> - **Hair:** Ghorran keeps the long hair from reference 01, silky **dark blue with white and light-blue glossy highlights**. Vaelith has **short, silky pink hair in two ponytails with light-pink glossy highlights**.
> - **Outfit:** Vaelith's suit and slit skirt gain **maid detailing**.
> - **Color grading:** both are drawn in the game's bright, clean anime grading (GDD §19.6.1, reference: *That Time I Got Reincarnated as a Slime*).
>
> Supersedes the v1.7 masks and hair.

> **v1.7:** **The Clergy Duo's true look is set** (owner reference art in `docs/art/clergy-duo/`). On the Astral Path, both wear **black suits with white shirts and black ties**. The butler has long blue hair in a low ponytail and a **white mask with cracked black lines and a jagged painted grin, with a red dot at the nose**. The musician wears the same jacket, shirt and tie with a **long black skirt slit high at the side**, and a **smooth white mask with closed, smiling crescent eyes**. The maid's dress and butler's waistcoat are retired. In the castle (concealed form), their masks are still featureless black; the concealment lifting reveals the white masks. The painted smiles never move, so their excitement still shows only in their bodies.

> **v1.6:** **The King does not wake in this game.** The archdemons' secret plan is the **Rite of Waking**: sacrificing **themselves and Cal** to wake their King. They never tell Cal. Their excitement at finding him shows only in calm body language (masks stay on): they have found a power like their own, a source of power for the Rite. CIN-10 and the King sections updated.
>
> **v1.5:** **The flashback now ends on Cal's grin**, which match-cuts to present-day Cal, and the player then **chooses who to play** in the rest of the fight: Rook or Cal. Choosing Cal opens **Cal's Path**, the rest of his story (through the void, the Astral Path, Liraen, the mask) plus a scene after he steps through his door at the Siege. The archdemons **don't know who Cal is**: they take him because he is the **only one who can move** in their frozen time and he **answers in their language**.
>
> **v1.4:** The King's **1000-year slumber**: emptied by the Aura Sacrifice, he lies down in his coffin. The archdemons, who now treat him as a god, travel through time and destroy other worlds searching for the power to restore him, and they **find Cal by accident**: the void is their time-travel arrival. CIN-05B and CIN-05C updated.
>
> **v1.3:** Corrected canon. The archdemons are **Ghorran and Vaelith themselves**: after Cal's pointless sacrifice, the King defeats the Hero Party (despite another Goddess Sacrifice), notices the anomaly, and in minutes of confusion **sacrifices his aura** to his two commanders, who are reborn as intelligent archdemons, a butler and a maid. Cal never fights the commanders. Chapter 5 and CIN-05B are rebuilt around this.
>
> **v1.2 (superseded in part):** The Void Figures are now defined: the King's **former** Left and Right Wing, now 5★ archdemons, called **the Clergy Duo** (a butler and a musician). Added **CIN-05C "The Astral Path"**, where they carry Cal down a dark astral tunnel with horns and wings fully revealed, and a defaced commanders' mural in Ch 3. Identity canon: GDD §28.
>
> **v1.1:** Added **The Void Figures** (Chapter 5, CIN-05B), the scene where the player watches Cal "die" and two calm figures in black step out of a hole in reality, stop time, and carry him away smiling. Mystery canon and the rules for future clues: GDD §28.

> 🔒 **DIRECTOR'S EYES ONLY.** Everything in this document is a late-game spoiler. Leak rules from GDD §15.11 apply: nothing here appears in data names, codex, loading screens, achievements, or marketing before Episode 49.

---

## CONTENTS

**OBJECTIVE**
- 0. Objective & the one-sentence test

**DESIGN**
- 1. Full Backlash story
- 2. Chapter structure
- 3. Playable sequences
- 4. Cinematic sequences
- 5. Combat encounters

**CONTENT: characters & encounters**
- 6. Cal's Demon Soldier moveset (Ash Line Eleven)
- 7. Cal's reincarnated moveset (and the Demon Slash lineage)
- 8. Hero Party AI
- 9. Demon Army AI
- 10. Demon Commander boss behavior
- 11. Demon Lord King encounter design
- 12. The Goddess Saint's Sacrifice mechanic
- 13. Hidden Star Rating integration
- 14. Reincarnation gameplay

**PLAYER EXPERIENCE: presentation systems**
- 15. Flashback transition system
- 16. Camera system
- 17. Dialogue system
- 18. Audio system
- 19. VFX requirements
- 20. Animation requirements
- 21. Storyboards (every major cinematic)

**TECHNICAL IMPLEMENTATION**
- 22. Save / checkpoint system
- 23. Performance strategy
- 24. Modular architecture
- 25. Example implementation sketches

**NEXT STEP**
- 26. What to prototype first & the minimum viable implementation

---

# OBJECTIVE

## 0. Objective

Turn Cal's past life into a **30–60 minute playable chapter** that the player lives through rather than watches. The player controls Cal as a disposable 1★ Demon Soldier, then as a newly reincarnated human, while present-day Cal narrates over his own memories. The chapter ends by returning to the exact frozen instant of the reveal battle, where Cal smiles.

**The one-sentence test** (every design decision must serve it):

> The player finishes Backlash thinking ***"I WAS Cal,"*** and, on seeing his smile, ***"I was playing the villain before I even knew he was the villain."***

**Where it sits in the game:**
- **Episode 49 "BACKLASH"**, placed *inside* the reveal fight (GDD §15.8), between Phase 3 (his reincarnated power appears) and Phase 4 (he stops taking the fight seriously).
- **Ep 48** ends on Cal's offer: *"You really want to know?"*
- **Ep 49 ends on Cal's grin** as the archdemons carry him, and **match-cuts** to present-day Cal's same grin.
- **Ep 50** opens in the present with the smirk, then the **Perspective Choice**: play the rest of the reveal fight as **Rook** or as **Cal**. Choosing Cal opens **Cal's Path**, the rest of his story.

This is the anime "flashback episode in the middle of the fight," made playable, with a choice of whose eyes to finish it through.

**Four Cals, one chapter:**

| | Cal | Chapters | The player feels |
|---|---|---|---|
| **#1** | The ordinary Demon Soldier: weak, obedient, quietly bored | 1–2 | *"I'm just another soldier."* |
| **#2** | The questioning demon: observant, experimenting, disobedient | 2–5 | *"I'm learning faster than everyone around me."* |
| **#3** | The reincarnated human: powerful, rejected, studying | 6–8 | *"I'm an impossible anomaly, and they hate me for it."* |
| **#4** | The masked mastermind, present day: calm, playful, god-like | Return | *"…And I was him."* |

---

# DESIGN

## 1. Full Backlash Story

### Present day, the frame
The Siege of Aurelin. The bridge district is collapsing. Cal's mask has shattered, and he is unmasked, smiling, glaive resting on his shoulder. In Phase 3 he has already shown things no human can do. Then he says something he cannot possibly know:

> **CAL:** "You were lighter than my glaive, you know. That night in Larkspur."

Rook has never told anyone the name *Larkspur*. Rook: *"…What are you?"*

Cal tilts his head. The music thins. He holds the silence just long enough.

> **CAL:** "You really want to know?" *(beat)* "Then don't just listen."

He raises a hand. A golden door frame opens around the camera. Color drains away. The battle goes silent mid-motion: debris hangs in the air. **"In there, an hour. Out here, a breath."**

### Chapter 1: The Soldier
Ash-grey sky. A Demon Army camp beneath the Demon Castle. **The player has control within two seconds of the door closing.** The player is a Demon Soldier: dark red and black plate, slit faceplate, no wings, a plain **ash-glaive** (a pole-cleaver). They are identical to every soldier around them. Only the camera says which one is "you."

**Narration (present-day Cal, dry, close):** *"Back then, I thought serving was all I was born to do."*

A Line Sergeant barks the morning drill. Soldiers strike in unison: ***"Left. Left. Back. Cut."*** (This is Cal's dodge pattern, which the player sparred against in Episode 3, about 40 hours ago.) The army's four-beat march drum rolls under the camp: Cal's whistled tune.

The player walks the camp: soldiers sparring, repairing plate, eating from iron bowls, hauling supplies, guarding gates; Line-keepers marching new recruits in; wounded soldiers carried out and replaced in the same minute; Commanders overhead on vast wings.

On a patrol march, the soldier beside Cal takes a stray hero arrow and falls. The column doesn't slow. ***"Continue formation."*** Boots step over the body. ***"Mind the step."*** The player may break line and walk to the body. Nothing happens. Nobody turns. Then the order repeats, and the player is pushed back into line.

That night in the barracks, Cal asks the soldier in the next bunk:
- *"Was he important?"*
- *"He served."*
- *"That's all?"*
- *"That is enough."*

**Narration:** *"I was wrong."*

### Chapter 2: The Monthly Trial
***THE HERO PARTY HAS ARRIVED.*** It is almost routine. Once a month, the **Goddess Trial** sends three humans onto the continent:
- **Corin, the Knight Hero** (sword and shield, charges and counters, hates demons)
- **Maelis, the Goddess Saint** (the only magic user anyone has ever seen; she prays for 10 seconds to heal)
- **Teo, "King A," the archer** (precise, tracking, deadly to soldiers)

Five condensed Trials, each shorter than the last:
1. **Trial 1:** fight in formation. The heroes break the line; the Knight is far too strong; the heroes retreat when the Trial clock ends.
2. **Trial 2:** Cal *recognizes* their attacks. The **Observe** mechanic appears.
3. **Trial 3:** Cal predicts the Knight's charge. The first **Insight** pays off.
4. **Trial 4:** Cal experiments. The player chooses a strategy, and Cal's narration reacts.
5. **Trial 5:** ORDER: *ATTACK THE KNIGHT.* The Knight charges. A perfect sidestep. The opening to kill him is right there. **The player doesn't take it, and the order text flickers and fades.** The Knight retreats, alive. Cal smiles under the faceplate. *"Nothing happened. I broke an order, and the sky stayed exactly where it was."*

### Chapter 3: The Question
- **Night.** Cal slips out of the barracks into the forbidden caverns beneath the castle. Ancient ruins. Glyphs on the walls (the same script as Liraen's Tower murals, the glyph Cal "guessed" in Ep 8). Old hero relics. A broken helm with tally marks scratched inside, left by another soldier who once asked questions and vanished; beside the tallies, a small, perfectly round, filled-in circle. Deeper in, a vast, ancient **mural**: a Demon King of some forgotten age, wounded, pouring a black aura from his chest into the **two winged commanders** kneeling before him, who rise from it changed: wingless, robed, human-shaped, standing behind his throne like servants. A patrolling soldier, if Observed nearby, mutters: *"Old stories. Kings don't bleed."* Cal stands in front of the mural for a long time. Then a **memory splice**: the scene jumps, and Cal is walking back to the barracks before dawn. (What happened in the missing minutes is never shown in Backlash.)
- **Day.** Guard duty in the throne chamber. The Demon Lord King settles a dispute between his two Commanders **without a word**: a glance, and the air bends.
- **For one cut, the camera is the King's eye**, and the player sees what he sees: a faint **★** above every soldier, ★★★ above each Commander. The King's gaze passes over Cal. One star. Nothing. He looks away.
- **Cal (internal):** ***"What exactly are you?"***

### Chapter 4: Sacrifice
A Trial goes wrong for the heroes. The demons are winning. Maelis kneels and begins a prayer that is not her healing prayer: **SACRIFICE**. Ten seconds of a voice through the chaos. The Knight shields her. King A covers them. The player's order is *STOP THE PRAYER*, and they may try. The prayer completes.

Her body dissolves into light. A mote of gold leaves her and sinks into the Knight, who flares brighter than he ever has. Three heartbeats later, a pillar of light: Maelis is reborn, kneeling, weaker. A human who died has returned. Soldiers scatter. Cal doesn't move. He has **Observed every syllable**.

Later, alone on the wall: ***"If death isn't permanent…"*** *(long pause)* ***"…what exactly is death?"***

### Chapter 5: The Final Battle
The largest Trial anyone remembers. The heroes are far stronger now: King A's arrows punch through plate, the Knight carves through lines, and Maelis keeps them standing. The Commanders **Ghorran (Left Wing)** and **Vaelith (Right Wing)** take the field (Cal fights *beside* them in the lines, never against them). For the first time, the heroes push past the castle gates. **King A falls, permanently**, killed by Ghorran. The Commanders fall back to guard the throne.

In the throne chamber, the King perceives the Knight's new rating: *"…Four."* For the first time, he is mildly interested. He orders every Line to hold.

**The kneel.** Cal walks out of the line. **The player walks him** through the gate, up the castle stair, and down the long throne chamber between ranks of soldiers who do not turn. The King's gaze settles on him.

> **KING:** "Why are you here?"

Cal kneels. Control ends. He whispers ten seconds of words under his breath (to anyone listening, a vow). Then: ***"For the Demon King."*** Light gathers at the seams of his armor… and simply goes out. Through the King's eye, the player sees his single ★ leave him, pass through the King's open palm, and fade; there is nowhere above six for it to go. Above the kneeling soldier, only a **hollow ☆ outline** remains. Nothing else happens. He is still alive, and weaker than he has ever been.

> **KING:** "Your service is accepted." *(beat)* "Return to the line."

The player's read: *the stolen prayer doesn't work for a demon. He gave away the only thing he had, for nothing.*

**The Last Line (playable).** The last Line holds the great doors of the throne chamber. The battle reaches its peak: smoke, fire everywhere, weapons scattered, the hall's outer gallery collapsing, the Line barely holding. Cal fights at **0★**: his damage and posture damage are visibly lower than at any point in the chapter, and the player feels the loss in their hands without being told why. Then **the Knight Hero** cuts through the Line. It is the man Cal spared in Trial 5. His Surge charge is the one attack the memory will not let Cal avoid: a dodge input produces only a stumble.

**Failing Body (playable, ~20s).** Cal is thrown down on the threshold of the throne chamber, armor split, breathing ragged. **The player still has control** and will try to stand. Pushing the stick lifts him onto one arm, which buckles. Pressing attack raises the glaive a few inches before it drops. Each attempt is weaker. The HUD fades away piece by piece. After a few attempts he falls, and control is gone.

**The Dying View (CIN-05B, first half).** Present-day narration has stopped. Cal lies on his side at the open doors, and the camera holds on his face. Behind him, **through the doorway, out of focus**, the end of the battle plays out while his eye drifts in and out of focus:
- The Knight steps over him without a glance and walks into the throne chamber with Maelis behind him.
- The King **does not stand**. The Knight's charge stops in mid-air, held by nothing.
- Maelis kneels and **sacrifices herself again**. Her light flows into the Knight, who blazes brighter than anything Cal has ever seen. Faint, far away: *KING: "…Five."*
- One glance from the throne. The Knight is hurled across the chamber; Maelis collapses; a pillar of light tears the broken heroes out of the world. **The King has defeated the Hero Party**, even with the Goddess's Sacrifice.
- Then the King sits very still, looking at **his own open palm**, where a soldier's star passed through him. For the first time in his existence, he is **confused**.
- Barely visible through smoke, **minutes later**: the two Commanders kneel before the throne. The King tears his **aura** (the black pressure that made him unbearable to stand near) out of himself in two streams and pours it into them. Their silhouettes twist; their wings fold away; they shrink into something human-shaped. Smoke swallows the image.
- The last thing his eye catches: the King, emptied, rising for the first and only time, walking behind his throne, and **lying down in a black coffin**. The lid closes. (He will sleep for **a thousand years**.) The two new shapes kneel before the coffin; then the throne room is empty, and they are gone.

Cal's eye nearly closes. He tries to say something: three faint syllables, unintelligible, unsubtitled. His breathing stops. His body goes still. **The camera stays** for far longer than is comfortable. *That's it?*

**The Void (CIN-05B, second half).** A small distortion behind him, like a visual glitch. The air bends. Light drains toward a point. A **perfect black circle** opens: not a portal, a **hole punched through reality and time**. Smoke drifts toward it, ash floats upward, and loose debris shifts. The moment it is fully open, **time stops**: fire, smoke, dust, falling stones, routing soldiers. Through the doorway, the sealed coffin and the empty throne. Only the void moves. And, if the player is watching closely, **Cal's eyes open slightly.**

Two figures step out: a man and a woman in **identical black suits**, black shirts, black ties, black gloves, featureless black masks. No skin, no insignia, no horns, no wings. They look absurdly formal in a burning castle, like people arriving at a meeting, because their clothes **come from another world**. 🔒 For them, this is not minutes after their rebirth: they have spent a long time travelling through time and other worlds, searching for a way to restore their sleeping King, and this moment is a stop on that road they arrived at **by accident**. **They don't know who Cal is.** Their presence is unbearable: the screen presses in, the air feels thick, the avatar's breathing sound is gone. It is **the same pressure as the King's gaze** in Ch 3, because it *is* the King's aura. Yet they simply **walk**, looking out over the frozen battlefield, stepping around a frozen ember without looking at it, talking quietly to each other in a language nobody has ever heard (**no subtitles, no translation**). They pass within a step of the dead soldier without a glance.

Then **a voice answers them, from the ground**: two faint words in their own language. Both stop. In a world where nothing moves, the dead soldier **lifts his head an inch off the stone**, eyes open, and speaks again. **He is the only thing in their frozen world that can move, and he understands them.** The man crouches and asks a question; Cal answers. The woman looks at the man, and there is a small, unmistakable lift in her shoulders: **excitement**. Their masks never show it, and they stay perfectly nonchalant; only their posture gives it away. 🔒 What they have found is something as powerful as themselves: **a source of power**, the missing third offering for the rite that will wake their King (GDD §28). They will never tell him. The man lifts Cal onto his shoulder in one effortless motion and walks toward the void. The woman follows.

The camera circles Cal's face. His eyes are open. He isn't afraid, unconscious, or dying. **He's smiling.** The smile becomes a **grin**.

**The flashback ends here, on the grin.** Match cut: the same grin, the same angle, on present-day Cal's human face (CIN-09). Everything after this point belongs to **Cal's Path**.

### Cal's Path, Part 1: Through the Void (optional; chosen after the return)
*Played only if the player chooses Cal at the Perspective Choice (or later, from the Lore Archive).*

The grin breaks into a breath through the nose, a chuckle, a deeper laugh, and then, for a moment, a manic laugh, echoing unnaturally through frozen time. Not a cartoon villain's laugh: the laugh of someone who just hit a jackpot.

The man steps into the void. The woman is about to follow, then stops, and slowly turns around. Her mask faces Cal, still visible in the dark just past the edge over the man's shoulder. Hold. She takes one small step back toward the void. Cal's face one last time: still smiling, then laughing, wildly. **Hard cut** to the woman. She is gone.

The void **folds inward**, like reality sealing a wound, and vanishes. The pressure lifts. **Time resumes**: fire, smoke, and falling stone continue mid-motion. A Demon Soldier glances at the spot where Cal lay. Nothing. Through the doorway: the sealed black coffin, the empty throne, the empty places where the Commanders knelt. Nobody is left to notice anything. A soldier from the rear steps into the gap in the Line. ***"Mind the step."***

**Cut to black.**

**The Astral Path (CIN-05C).** Out of the black, a different place: a **dark astral realm**, the road the archdemons travel through time and between worlds, a starfield of black and violet with cold aurora rippling through it, no ground, no sky. A path of black glass forms under the figures' feet one tile ahead of each step and dissolves behind them. **Dark magic**, the King's aura, without a word. They are still walking at exactly the same unhurried pace, the man still carrying Cal.

Here, the concealment falls away, and the featureless black masks and plain suits **resolve into what they really are**:
- **The man (the butler):** a sharp black suit, crisp **white shirt**, slim **black tie**, black shoes. Long, silky **dark-blue hair** with **white and light-blue glossy highlights** falls loose around the mask and is gathered in a **low ponytail that sways to his knees**. His mask is **smooth white, with closed crescent eyes and a frown: her smiling face, turned upside down**. One hand rests in his trouser pocket the whole way; the other steadies Cal on his shoulder.
- **The woman (the musician):** the **same black suit jacket, white shirt and black tie**, finished with **maid detailing**: a short white frilled apron over the front of a **long black skirt slit high up the side**, frilled white cuffs, a lace-edged collar, and a small white lace headdress. The slit opens with every unhurried step. Short, silky **pink hair in two ponytails** with **light-pink glossy highlights** bobs as she walks. A slim black instrument case rides on her back. Her mask is the **same smooth white mask: closed crescent eyes and a wide, serene smile**.

**One mask, two faces:** her smile, his frown. Both are painted on and never move. Whatever they feel, the masks show the same thing. Midway down the path, without breaking stride, they let the disguise go completely: **horns** rise from their brows, and **vast dark wings** unfurl from slits in the backs of their jackets. Their masks stay on. **Fully revealed as archdemons.** The wings are the same shape as the Commanders' wings the player has seen all chapter.

The tunnel is enormous. They pass the remains of **other worlds**: a cracked planet hanging in the dark, a burned city drifting in pieces, a sea frozen mid-wave. They don't look at any of it. Then, far below the translucent path, the whole Demon Continent drifts past like a map: the castle a speck, the battlefield a smear of fire. The woman begins to **hum**: four slow notes, the Demon Army's march cadence turned into a lullaby. Over the man's shoulder, Cal, eyes half-closed and still smiling, **whistles it back**, badly. (This is where his whistled tune comes from.) The two archdemons glance at each other. Something in their posture is **excited**.

For a single cut through Cal's eyes, faint ink **★★★★★** flicker above each of them, then vanish: the first time Cal ever sees a rating. Far ahead, at the end of the path, a tall dark doorway waits.

**Cut to black** before they reach it.

> **The intended order of thoughts:** 1. *Cal is almost dead.* → 2. *Cal died.* → 3. *Wait… what is that?* → 4. *Why did time stop?* → 5. *Who the hell are those people?* → 6. *Why can't anyone else move?* → 7. *Why are they so calm?* → 8. ***Wait. Who said that? Cal is talking to them?*** → 9. *Why are they taking him?* → 10. ***Cal is smiling.*** → 11. ***He knew.*** → *(match cut)* → 12. *What the hell just happened?* And, for Cal's Path players on the Astral Path: 13. *…Those wings. Were those the Commanders?*
>
> **What the deception targets.** The player already knows a human Cal exists in the present. The trick is not "Cal no longer exists." It is ***"this is how his demon life ended: a real, sad, pointless death."*** The void turns that into: *it wasn't a death at all; it was an exit he arranged.*
>
> **Did Cal "know"?** The player is meant to read his grin as *"he knew."* 🔒 The truth is subtler. Cal knew from the Ch 3 mural how a wounded King answers, and he gambled that falling to 0★ would *do something*. He did **not** know the archdemons would come, and **they did not know him**. Nor does he know what they want him *for*: to them he is an offering, kept for the day they sacrifice themselves and him to wake their King. They were passing through by accident. What caught them was that he was **the only thing that could move in their frozen time** (a 0★ being is no longer held by it) and that he **spoke their language**, which he had taught himself from the cavern glyphs in Ch 3. He recognized them, and the opportunity, faster than they recognized him. His grin is a gambler's who just hit a jackpot he never knew was on the table. For them, it was luck too, and they are excited.
>
> **What Backlash shows, and what it never says.** The player half-sees the Commanders' rebirth through smoke and dying eyes, sees the King lie down in his coffin, then sees two archdemons with the Commanders' wings carry Cal past the wreckage of other worlds. **No one says it.** In-world, **only Cal** knows who they are. Backlash never translates their language, never explains why they were excited by him, never shows where the path ends, and never explains how he woke up human in Liraen. Canon and rules: GDD §28.

### Chapter 6: The Other World (Cal's Path, Part 2)
Black, for several seconds. Then a low, glassy tone that bends upward and stops: the **Void Note**, half-familiar from the drone of the Astral Path, and never heard again except as a rare clue. Breathing. A heartbeat. Another. Eyes open.
- A **human** hand, thin, young. Fire everywhere: **Larkspur** burning (the cold open of Episode 1, from the other side).
- **The player has control.** The body is light, fast, fragile. There is no armor.
- And there are stars: **★ above every panicked villager**, rendered in ink. The player is seeing what only the King could see. *(Cal can see the system now.)*
- An infant crying under a fallen beam. **Above the infant: nothing.** No star. Not zero: nothing.
- Cal lifts the beam. The house collapses around him. In the fall, without thinking, he wants to be *elsewhere*, and a **golden door frame** opens beneath him. His first door. He carries the baby out of the fire.

He doesn't understand a word anyone says. **Subtitles appear as unreadable script** and resolve into language over the next chapters as he learns. He walks to a village where no one can see him for what he is, leaves the infant on an orphanage step in **Thornwick**, and walks away. (The keeper's ledger: *"brought in by a boy who didn't speak."*)

He learns:
- **Watches** a hedge-mage shout a spell; tries to copy the words; nothing happens. Opens a door in silence; it works. *Magic never needed words. Only the King knew.*
- **Watches** grimoires, knights, nobles, markets, prices, prayers, exams.

### Chapter 7: The Human (Cal's Path, Part 2)
Years, in short playable vignettes:
- **The village that bars its doors.** Cal saves them from fen beasts in seconds; they lock him out anyway. Not cruelty: fear.
- **The Crimson Bell hunt.** Six inquisitors corner the grimoire-less boy with impossible magic. The player now *dismantles* them with doors, a fallen knight's saber, and the drill, which with a saber becomes **Ascended Demon Slash**. The contrast with Chapter 1 is total. He lets them live. Experiment.
- **High Chancellor Aldric Valcourt's study.** An offer: *"A weapon like you needs an owner."* (A memory **splice** flickers here: something is cut out of this scene.)
- *"Different world. Different species. Same hierarchy."*
- **The Lighthouse.** Rain. A huge, lazy man shares a bowl of stew with a wet, dangerous stranger and doesn't ask what he is. **Dagrun:** *"Nobody's written your story. Good."* For the first time in two lives, someone doesn't rank him.
- **Becoming Cal.** He picks a name for the first time in his existence: Calder. He forges a grimoire (a prop; his doors never needed one). Knighthood. Vice captain. Aurek. Rain and laughter in the Lanterns' kitchen, where the lullaby he whistled on the Astral Path becomes his cooking tune.
- **Thornwick fence, years apart.** A child practicing sword swings with a stick. No star above them, ever.
- **The Knight Exam (Ep 2), from his seat:** *"Take the one-pager."*

### Chapter 8: The Mask (Cal's Path, Part 2)
- **A conversation with a young, bitter Choir novice named Hesper.** (Another **splice**: the memory jumps.)
- **Ep 18, the Hollowmarch, from his side.** **The player walks Cal toward the door** they once watched him walk through. *"I'll hold the door. Don't wait up."* The player now knows it is the same move as the kneel.
- **The Hollow:** a space between pages. Far off, through the white, the **four-beat drum**. Demon country, on the other side.
- He cuts his way out with the drill, and it has become something else: **Godfall Demon Slash**, a single cut that splits the Hollow open. (Playable once.)
- He shapes a **mask** whose slits match a Demon Soldier faceplate. He puts it on. **A ridge in the Ashfall war (Ep 24), from his eyes:** below, Rook and the Lanterns, and a siege engine about to crush them. He opens a tear.
- **Narration:** *"And that's where you came in. Again."*

### Return to the present (all players, straight after the grin)
Match cut from the demon soldier's grin to present-day Cal's grin. The door frame folds shut behind him. Color floods back. The debris that hung in the air at the start of the chapter **finishes falling**. Silence. No music. Cal is standing exactly where he was. Same face. Same voice. Rook stares.

> **CAL:** "So. That's how I died." *(beat; his smile grows)* "…The first time."
>
> **CAL:** *(head tilt, S4)* "Don't mistake that for a confession." *(the smirk)* "It was an introduction."

He opens a door frame, sits on it, and swings his legs. Then the **Perspective Choice**.

### The Perspective Choice
A split screen, half Rook's face, half Cal's grin, and one line: ***Whose story?*** No timer.

| Choice | The rest of the reveal fight (Phases 4–6) | Afterwards |
|---|---|---|
| **Rook** | As designed (GDD §15.8): Cal grades you, splits the party across the city, and the Lanterns' bonds bring them back together | Ep 50's ending. **Cal's Path unlocks in the Lore Archive** when the Field Notes are found (Arc 6), so nothing is missed |
| **Cal** | **Play Cal against Rook and the Lanterns** (AI-controlled). **Phase 4:** you sit on your door frame and can only evade, taunt, and comment; Rook's attacks come at you and you rate them. **Phase 5:** the camera rises to the board view and you **move the party like pieces**, dragging Lanterns through doors into demon squads. **Phase 6:** the party fights its way back together; every restored Link adds an enemy team attack, and you finally lose to the **Lantern Chain**. Power against connection, felt from the losing side | *"Was any of it real?"* from Cal's side; he steps through his door → **Cal's Path** (Parts 1–3) → back to Rook for Ep 50's ending |

> **Director's note.** Both choices tell the same story; the choice is about *whose eyes*, not *what happens*. Cal's Path is ~25 minutes of extra content, never locked away: Rook players can play it from the Lore Archive. Playing as Cal costs: a player-controlled version of Cal's kit (built anyway for Arc 7, now needed earlier), an AI opponent using Rook's kit (on top of the companion AI framework), and a board-view mode for Phase 5 (a top-down camera plus a drag-to-door command layer).

### Cal's Path, Part 3: After the Door (present day; CIN-10)
At the end of the reveal fight, Cal steps through his door and closes it from the other side. The Astral Path again, the same road between worlds, walked on his own feet this time. At its end, before the sealed black coffin and the empty throne, the butler and the maid are waiting. They incline their heads to him, a fraction: not as servants, not as equals. Something stranger. He answers them in their language. The maid begins to hum the march. Cal looks at the coffin, tilts his head, and says, in Liraen's tongue: ***"You two still haven't told me what I'm for."*** The butler says nothing. The maid keeps humming. Her painted smile and his painted frown don't move. Cut to black. (Dramatic irony for Cal's Path players: he is the offering, and he doesn't know it.)

> After the Void scene, *"That's how I died"* is a **lie told with a smile**, and the player knows it. That irony is intended: he is telling Rook the story the world believes while standing in front of someone who has just seen the truth.

### Cal is a curated narrator
**Everything Backlash shows is true. Not everything true is shown.** Cal edits his own memory: the deal with Aldric, what he said to Hesper, why Larkspur was burning. The **Void** scene is the opposite case: he shows it in full and says **nothing at all** (narration is silent from his fall until Chapter 6). Whether he *chose* to show it is deliberately left open. Each cut is a visible **splice** (a door-frame flicker and one beat of missing sound). Attentive players will notice the jumps. Arc 7 fills them in (GDD Layer 10).

---

## 2. Chapter Structure

| # | Chapter | Cal | Critical path | With exploration | Gameplay / cinematic split | Ends on |
|---|---|---|---|---|---|---|
| 0 | **The Door** (present → memory) | #4 | 1 min | 1 min | 0 / 100 | Control as a soldier |
| 1 | **The Soldier** | #1 | 5 min | 9 min | 85 / 15 | *"That is enough."* |
| 2 | **The Monthly Trial** | #1 → #2 | 7 min | 9 min | 85 / 15 | The order fades |
| 3 | **The Question** | #2 | 4 min | 7 min | 75 / 25 | *"What exactly are you?"* |
| 4 | **Sacrifice** | #2 | 4 min | 5 min | 55 / 45 | *"…what exactly is death?"* |
| 5 | **The Final Battle** | #2 | 10 min | 11 min | 55 / 45 | **The grin (flashback ends)** |
| C1 | **Cal's Path 1: Through the Void** | #2 → #3 | 3 min | 3 min | 0 / 100 | The Astral Path; black |
| 6 | **The Other World** (Cal's Path 2) | #3 | 4 min | 6 min | 80 / 20 | The orphanage step |
| 7 | **The Human** (Cal's Path 2) | #3 | 6 min | 9 min | 70 / 30 | *"Take the one-pager."* |
| 8 | **The Mask** (Cal's Path 2) | #3 → #4 | 4 min | 5 min | 70 / 30 | The tear opens |
| C3 | **Cal's Path 3: After the Door** (present) | #4 | 1 min | 1 min | 0 / 100 | *"…what I'm for."* |
| R | **Return** (all players, after Ch 5) | #4 | 1 min | 1 min | 0 / 100 | The smirk → **Perspective Choice** |
| | **Flashback, all players (Ch 0–5 + R)** | | **≈ 32 min** | **≈ 44 min** | **≈ 75 / 25** | |
| | **Cal's Path (C1, Ch 6–8, C3), optional** | | **≈ 18 min** | **≈ 24 min** | **≈ 65 / 35** | |

**Pacing rules:**
- No cinematic runs longer than **90 seconds** except CIN-05B (*The Void*, ~150s) and its continuation CIN-05C (*The Astral Path*, ~60s). They are the scenes allowed to break the chapter's rules, and their length is part of the effect.
- Control returns within **2 seconds** after every cinematic. No black loading screens: chapters stream in during the preceding cinematic.
- Each chapter follows the anime pacing template in miniature (hook → development → conflict → beat → hook), and each ends on a line, never a fade.

---

## 3. Playable Sequences

| ID | Chapter | Sequence | Verbs | Purpose |
|---|---|---|---|---|
| P1.1 | 1 | **Morning Drill** | Follow the drill calls (tutorial for the soldier moveset); Demon Slash taught as *Left. Left. Back. Cut.* | Teach the clunky body; plant the reverse-recognition of S3 |
| P1.2 | 1 | **The Camp** (optional hub, ~150 m across) | Walk, look, interact with ~12 "life stations" (smiths, mess, supply carts, recruits arriving, wounded being replaced) | Civilization, not monsters |
| P1.3 | 1 | **Patrol March** | March in formation (hold the slot; leaving it removes the **Formation Bonus**); the death beat | First crack |
| P1.4 | 1 | **Barracks** | Walk to bunk; one dialogue | *"That is enough."* |
| P2.1–2.5 | 2 | **Trials 1–5** | Formation combat, Observe, Insight counters, free experiment (T4), disobedience (T5) | Learning faster than everyone |
| P3.1 | 3 | **The Caverns** | Stealth-light exploration (patrol sightlines; being seen just sends you back to barracks), glyph reading, relic inspection | Curiosity |
| P3.2 | 3 | **Throne Guard** | Stand post; the **Gaze** mechanic (hold formation pace while the King's gaze sweeps) | Awe and fear of the anomaly |
| P4.1 | 4 | **The Losing Heroes** | Formation combat → ORDER: STOP THE PRAYER (attempt to reach Maelis through the Knight) | Witness Sacrifice up close |
| P5.1 | 5 | **The Breach** | Large staged battle; Commanders fighting heroes nearby (NPC set piece) | Scale; the King's interest |
| P5.2 | 5 | **The Walk** | Walk through the gate, up the stair, down the throne chamber. Only movement is allowed | Player's own feet carry him to the kneel |
| P5.3 | 5 | **The Last Line** | Formation combat at **0★** (lower damage and posture damage, never explained); ends with the Knight's unavoidable Surge charge (dodge = stumble) | Feel the loss of the star; the memory is fixed |
| P5.4 | 5 | **Failing Body** | ~20s: try to stand (stick lifts him onto one arm, then buckles), attack (glaive lifts inches, drops), dodge (flinch). The HUD fades away piece by piece. Control is removed after ~3 attempts or 20s | *"He's dying,"* felt through the player's own hands |
| P6.1 | 6 | **Larkspur** | Wake, escape the fire, find the infant, **carry** (one-handed: no attacks, dodge only), first door | Rebirth; the baby with no star |
| P6.2 | 6 | **Tongues** | Observe humans; Language Resolve subtitles; try to cast by speaking (fails) / silent door (works) | Discovering a new system |
| P7.1 | 7 | **Barred Doors** | Short combat vs. fen beasts (trivially easy now), then the doors close | Rejection without villainy |
| P7.2 | 7 | **The Hunt** | Combat vs. 6 Crimson Bell inquisitors; unlocks Ascended Demon Slash, Door Drop, Door Swap | Power contrast with Ch 1 |
| P7.3 | 7 | **The Lighthouse** | Walk into rain, sit, eat (one interaction) | The first kindness |
| P7.4 | 7 | **Years** | Three 40-second vignettes: the Lanterns' kitchen (whistle the tune: a single input), the Thornwick fence, the Exam seat | Becoming Cal |
| P8.1 | 8 | **The Door, from Inside** | Walk toward Ep 18's door | Layer 7, playable |
| P8.2 | 8 | **The Hollow** | Traverse white nothing toward a drum; final input: the drill → **Godfall Demon Slash** | Taste of god-like power |
| P8.3 | 8 | **The Ridge** | Stand; look down at the Lanterns; one input: open the tear | Encounter I from the other side |
| PC.0 | R | **Perspective Choice** | *Whose story?* Rook or Cal | Choose whose eyes finish the fight |
| PC.4 | Cal | **Not Serious, as Cal** | Evade, taunt, comment; rate Rook's attacks | Feel his contempt and his curiosity |
| PC.5 | Cal | **The Board, as Cal** | Top-down board view; drag Lanterns through doors into demon squads | *Moving the pieces*, literally |
| PC.6 | Cal | **Bonds, as Cal** | Full power against a party whose every restored Link adds a team attack; scripted loss to the Lantern Chain | Power vs. connection, from the losing side |

---

## 4. Cinematic Sequences

| ID | Title | Length | Purpose | Storyboard |
|---|---|---|---|---|
| CIN-00 | **"You Really Want to Know?"** | 30s | Present-day setup + door transition | §21 |
| CIN-01 | **Continue Formation** | 25s | The death in the column | §21 |
| CIN-02 | **The Order Fades** | 15s | Trial 5 disobedience (mostly in-engine) | §21 |
| CIN-03 | **What Exactly Are You?** | 35s | The King's glance; first star UI (King's POV) | §21 |
| CIN-04 | **Sacrifice** | 50s | Maelis dies and is reborn | §21 |
| CIN-05 | **For the Demon King** | 50s | The kneel; his star leaves him; *"Return to the line."* | §21 |
| CIN-05B | **The Void** | ~150s | The dying view (the King defeats the heroes and pours his aura into the Commanders), the apparent death, frozen time, the two figures, the smile, the laugh. (With CIN-05, mirrors Ep 18 cut for cut) | §21 |
| CIN-05C | **The Astral Path** (Cal's Path) | ~60s | The tunnel: butler and maid revealed, horns and wings, the hummed march, the first ★★★★★ | §21 |
| CIN-06 | **Heartbeat** | 35s | The Void Note; waking human in Larkspur | §21 |
| CIN-07 | **Nobody's Written Your Story** | 45s | Dagrun at the lighthouse | §21 |
| CIN-08 | **The Mask** | 35s | Shaping and putting on the mask | §21 |
| CIN-05B-2 | **Through the Void** (Cal's Path) | ~45s | The laugh, the woman's look back, the void closing, time resuming, *"Mind the step"* | §21 |
| CIN-09 | **The First Time** | 45s | Match cut from the grin; return to present; the smirk; the Perspective Choice | §21 |
| CIN-10 | **After the Door** (Cal's Path) | ~40s | Present day: the Astral Path, the coffin, the archdemons waiting | §21 |

---

## 5. Combat Encounters

| ID | Encounter | Enemies / allies | Win / end condition | Difficulty intent |
|---|---|---|---|---|
| E1 | **Drill Yard** | Training posts, then 1 sparring soldier | Complete drill calls; land Demon Slash | Teach |
| E2 | **Trial 1** | Allies: ~10 soldiers (3-row line) + impostor ranks. Enemies: Knight T1, Saint T1, King A T1 | Survive until the Trial clock (3 min) → heroes retreat | Overwhelming but survivable. **Cal cannot win** |
| E3 | **Trial 2** | Hero tier 2 | Observe each hero 3× (Insight) **or** survive 2 min | Learn |
| E4 | **Trial 3** | Hero tier 3 | Counter the Knight's charge with *Read: Charge* once | First success |
| E5 | **Trial 4** | Hero tier 4 | Free experiment: any of 4 strategies (§8.4); ends after one "result" | Agency |
| E6 | **Trial 5** | Knight tier 5 (focused duel inside the battle) | ORDER: ATTACK. Perfect dodge → **spare** (no attack input in the kill window) | Disobedience as mechanic |
| E7 | **Culling Drill** (Ch 3 morning) | A **Line Sergeant**, while **Vaelith** watches from above | Survive 60s; optional: land one hit. Vaelith culls the weakest soldier beside Cal without a word | Hierarchy made visible; Cal never fights a Commander |
| E8 | **The Losing Heroes** | Hero tier 5 (weakened) | ORDER: STOP THE PRAYER; prayer completes regardless after 10s | Witness, not prevent |
| E9 | **The Breach** | Hero tier 6 + Commanders (NPC) | Reach the castle gate checkpoint | Scale and chaos |
| E9b | **The Last Line** | Shattered Line (allies), Hero tier 6 (Knight in Surge) | Survive ~90s, then the Knight's scripted Surge charge (dodge produces a stumble) | Peak chaos; weaker than ever |
| E9c | **Failing Body** | — | Not a fight: the player tries to stand | The last moments of control |
| E10 | **Larkspur Escape** | Hazards (falling beams, fire) | Reach the village edge while carrying the infant | Fragility |
| E11 | **Fen Beasts** | 4 fen hounds (reuse) | Defeat (trivial) | Contrast |
| E12 | **The Hunt** | 6 Crimson Bell inquisitors (reuse Crimson Bell knight kit) | Defeat without killing (KO only) | Power fantasy, restraint |
| E13 | **Out of the Hollow** | None: a wall of white | Perform the drill → Godfall Demon Slash | Spectacle, one input |

**Failure inside a memory:** see §22. Cal's voice corrects the memory (*"No. That's not how it went."*), and the player retries from the encounter checkpoint.

---

# CONTENT: Characters & Encounters

## 6. Cal's Demon Soldier Moveset: Ash Line Eleven (1★)

**Design intent:** heavier, slower, and simpler than anything the player has controlled for 40+ hours. The player should feel the downgrade in their hands within ten seconds.

| Stat | Rook (for contrast) | Ash Line Eleven |
|---|---|---|
| Light attack startup | 6–8f | **12f** |
| Dodge | 12f i-frames, perfect dodge | **6f i-frames, 30f recovery, no perfect dodge (until Insight)** |
| Jump | Double jump, air dash | **Short hop only** |
| Magic | Yes | **None** |
| Parry | Yes | **None (until Insight)** |
| HP | Level-scaled | **Low.** A Knight combo takes half |

**Moveset (ash-glaive, a pole-cleaver):**

| Input | Move | Frames (startup / active / recovery) | Notes |
|---|---|---|---|
| L | Thrust | 12 / 4 / 20 | |
| L, L | Second Thrust | 12 / 4 / 22 | |
| L, L, L | Sweep | 16 / 6 / 26 | Wide arc; staggers soldiers, not heroes |
| H | Overhead Chop | 22 / 5 / 30 | High posture damage |
| Hold Block | **Brace** | — | Haft block; heavy chip damage |
| **Dodge-L, Dodge-L, Dodge-Back, H** | **DEMON SLASH (Tier 1)** | 10 / 5 / 18 (after backstep) | The drill. Rising diagonal cleave from a backstep. Bonus posture damage. **The root of his entire combat identity** |
| R1 (in formation) | **Hold the Line** | — | Lock into your slot: **Formation Bonus** (+50% defense, shared stagger resistance). Moving out breaks it |
| Hold L2 | **OBSERVE** | — | See §6.1 |

### 6.1 Observe & Insight
- **Hold L2:** the camera softly locks to a target. Depth-of-field isolates them. **Tells are highlighted** (a faint ink outline at each attack's wind-up). Time does **not** slow. Watching is a risk.
- Each time an observed enemy performs an ability while being watched, the `InsightTracker` counts it. **3 observations of an ability = Insight learned.**
- Insight unlocks **abilities learned from watching heroes**:

| Insight | Learned from | Effect |
|---|---|---|
| **Read: Charge** | Knight's charge | A counter window at the end of the charge (perfect sidestep → free Demon Slash) |
| **Read: Shield** | Knight's parry | **Parry** unlocked (8f window). *He learns to parry by watching a human do it* |
| **Read: Arrow** | King A's tracking shots | Dodges gain perfect-dodge timing vs. projectiles |
| **Read: Formation** | The party's role swaps | Prediction marker: shows which hero will engage next |
| **Read: Prayer** | Maelis's prayers | No combat effect. Fills a ring of 10 syllables in the HUD corner. **Required for the story**: by Ch 5, he knows every word |
| **Read: The King** | Throne Guard (Ch 3) | No effect. The HUD ring stays empty. Some things can't be learned by watching |

> **Why this matters later:** in the present-day boss fight, Cal counters the player's moves *after seeing them three times*. Players who did Backlash will recognize exactly what he's doing.

---

## 7. Cal's Reincarnated Moveset (Ch 6–8) & the Demon Slash Lineage

**Unlock ladder (never all at once):**

| Chapter | Unlock | Notes |
|---|---|---|
| 6 | **Human body** | Light: dodge 12f i-frames / 18f recovery; jump + double jump; HP *lower* (no armor). Faster but fragile |
| 6 | **Star Sight (perception)** | Ink ★ above everyone. Passive. (See §13) |
| 6 | **Door Step** | His first door: a short blink through a golden frame. Born from a fall |
| 6 | **Silent Casting** | Spells have **no wind-up and no shout**; any recovery can cancel into a door |
| 7 | **Saber** | Picked up from a fallen knight. Fast one-handed strings |
| 7 | **Ascended Demon Slash (Tier 2)** | The drill, with a saber, edged in golden door light |
| 7 | **Door Drop** | Open a door under an enemy; it exits from the sky (his Arcs 1–2 Assist) |
| 7 | **Door Swap** | Swap positions with a target (his Arcs 1–2 rescue move) |
| 7 | **Regeneration** | Passive, slow. Humans notice. They are frightened by it |
| 8 | **Severance** | Black jagged tears instead of golden frames |
| 8 | **Glaive** | The ash-glaive reborn in black and gold, formed from the Hollow |
| 8 | **Godfall Demon Slash (Tier 3)** | One playable use: the drill, cutting the Hollow itself |

### 7.1 The Demon Slash lineage (same movement, different power)
**One base animation clip (`DS_Base`)** drives all tiers. Tiers change timing, VFX, camera, and scale, never the core motion. The player recognizes it because it *is* the same motion.

| Tier | Name | Where the player sees it | Weapon | Smear → Impact → Held → Recovery (frames @60) | VFX | Camera | Hitstop |
|---|---|---|---|---|---|---|---|
| 1 | **Demon Slash** | Backlash Ch 1–5 (player-performed) | Ash-glaive | 2 → 1 → 4 → 14 | Dull iron arc, sparks | Small shake | 3f |
| 2 | **Ascended Demon Slash** | Cal's companion Assist in Arcs 1–2 (disguised as a saber move); Backlash Ch 7 | Saber | 2 → 2 → 6 → 16 | Golden door-edge trail | FOV punch | 6f |
| 3 | **Godfall Demon Slash** | Sable Knight finishers; reveal fight Phase 3; Backlash Ch 8; Arc 7 | Black glaive | 3 → 2 (**impact frame**) → 12 → 20 | Black-gold tear that splits the arena | Snap zoom, speed lines, impact frame | 18f |

> **Reverse recognition:** players first see Tier 2 (as Cal's friendly Assist, Arcs 1–2), then Tier 3 (from the Sable Knight and in the reveal), and only then **perform** Tier 1 with their own hands in Backlash. The realization *"that was his"* happens while the player is holding the controller.

---

## 8. Hero Party AI

### 8.1 Architecture: a "Party Brain" over three role agents
A squad-level **PartyBrain** (blackboard + state machine) coordinates three role agents, each a simple FSM with utility-scored attack selection (the same framework as all enemies, GDD §21.5).

**PartyBrain states:**

| State | Enter when | Behavior |
|---|---|---|
| **ENTER** | Trial start | Light-pillar arrival; short taunt bark |
| **ADVANCE** | Default | Knight leads; Saint 8m behind; Archer 15–25m flank |
| **BREACH** | Line weakened (≥3 slots empty in a row) | Knight charges the gap; Archer focuses the gap's neighbors |
| **PROTECT_PRAYER** | Saint begins any prayer | Knight switches to **Guard** (stands between Saint and nearest threat, parries everything); Archer covers the Saint's flanks |
| **RETREAT** | Trial clock ends, or retreat condition met | Fall back to light pillar; vanish |

### 8.2 Role agents

**Knight Hero (Corin)**: vanguard.

| Ability | Tier | Notes |
|---|---|---|
| Charge | 1+ | Telegraph: shield raised + 0.6s lean. **Observable** |
| Three-Cut | 1+ | Basic string |
| Shield Bash | 1+ | Breaks Brace |
| Shield Parry | 2+ | Parries the first hit of any string |
| Counter | 3+ | After a successful parry |
| Charge Feint | 4+ | Fakes the charge; punishes early dodges |
| Guard Ally | 5+ | PROTECT_PRAYER behavior |
| Surge (star gained) | After Sacrifice | Aura; +30% speed; new 5-hit string. **Visibly stronger, never numerically labeled** |

**Goddess Saint (Maelis)**: support.

| Ability | Rule |
|---|---|
| **Low Heal** | If any ally < 50% HP and no enemy within 5m: kneel, **10s spoken prayer** (vulnerable, interruptible by posture damage ≥ 40), heals 15% |
| **Sacrifice** | See §12. Once per Trial. Triggered by "wipe risk" (Knight < 20% **or** two members < 30%) |
| Retreat behavior | Stays behind the Knight; never engages |

**King A (Teo)**: ranged.

| Ability | Notes |
|---|---|
| Tracking Shot | Leads the target's movement |
| Pierce | Passes through 2 soldiers (Tier 3+: through plate) |
| Critical Shot | 1.2s glint telegraph; very high damage |
| Target priority | 1. Closest threat to the Saint · 2. Lowest-HP soldier · 3. **Anyone who's been Observing him for > 3s** (*"Stop staring, demon."*) |

### 8.3 Escalation by Trial (data-driven tiers)

| Trial | Knight | Saint | King A | Party Brain |
|---|---|---|---|---|
| 1 | Charge, Three-Cut, Bash | Low Heal | Tracking | Retreats at clock |
| 2 | + Parry | — | + Pierce | — |
| 3 | + Counter | — | + Critical | BREACH unlocked |
| 4 | + Charge Feint | — | — | Adapts to the player's T4 strategy |
| 5 | + Guard Ally | — | — | Knight focuses Cal (duel) |
| Ch 4 | Tier 5, weakened | **Sacrifice** | Tier 5 | PROTECT_PRAYER |
| Ch 5 | **Surge** (4★), then **5★** after the second Sacrifice | Tier 5 (reborn, weaker); **Sacrifices again** in the throne room | Pierce through plate; **killed by Ghorran** | BREACH → castle → throne room → **defeated by the King and recalled by the Goddess's light** |

All tiers are **one `HeroTierData` asset per Trial**: the same arena and agents, with different data.

### 8.4 Trial 4 strategies (player's choice; the AI adapts)
| Strategy | What the player does | AI response | Cal's narration |
|---|---|---|---|
| **Bait the Archer** | Break formation to draw shots | King A fixates; others exposed | *"Everyone thinks the archer is safe at the back."* |
| **Stay Hidden** | Back row, Observe only | Heroes ignore him | *"Nobody looks at the third row."* |
| **Split the Healer** | Rush the Saint | Knight guards; the line collapses | *"Everything they do is about her."* |
| **Do Nothing** | Stand still in formation | The Sergeant shoves him forward | *"Turns out, doing nothing is also a choice. They hate that one."* |

---

## 9. Demon Army AI

### 9.1 FormationController (the line is the unit)
- A **Line** is a 3-row grid of slots (e.g., 6 × 3). Each slot holds one soldier.
- Orders come from a **Commander node** (or a Line Sergeant) and are broadcast to the whole Line: `HOLD`, `ADVANCE`, `ENGAGE`, `CONTINUE_FORMATION`, `RETREAT`.
- **Fill-Gap rule:** when a soldier dies, the nearest soldier in the row behind steps into the slot using a **step-over** animation. This is systemic, so it happens dozens of times in every battle, and the player stops noticing it. **That is the point.** The authored "Mind the step." line plays only twice in the chapter (CIN-01, CIN-05B), never as a systemic bark.
- **Formation Bonus:** soldiers in their slot get +50% defense and shared stagger resistance. That applies to the player too.

### 9.2 Soldier FSM
`HOLD → ADVANCE (order) → ENGAGE (needs an attack token) → RECOVER → HOLD`, plus `FILL_GAP` and `DEAD`. Barks are clipped and sparse: *"Line."* *"Hold."* *"Continue."*

### 9.3 Ambient camp life (cheap)
- **Smart-object "life stations"**: anvil (repair loop), mess bench (eat loop), drill post (spar loop), supply cart (carry route), gate (guard idle), infirmary (carried in → replacement walks out). Each station plays looping animations on simple splines. No real needs simulation.
- **Recruit arrival** and **wounded replacement** run on a 90-second timer cycle, so the player sees both within a few minutes of exploring.
- **AI LOD:** full FSM within 25 m; animation-only within 60 m; impostor beyond.

### 9.4 Attack tokens
As in the main game: at most 2 hostile attackers on Cal at once. The *heroes* also obey tokens against soldiers, so battles stay readable.

---

## 10. The Demon Commanders → the Archdemons

**Cal never fights Ghorran or Vaelith.** He serves under them, watches them, and is carried by them. They are the King's only two Commanders, and at the end of Backlash they stop being Commanders at all.

| | **Ghorran, the Left Wing** | **Vaelith, the Right Wing** |
|---|---|---|
| **As Commander (3★)** | Axe, brute force. Cleave, Wing Slam, Sky Fall (lands on his own soldiers if they're in the way), Rally Roar | Twin spears, precise and cold. Twin Flurry, Wing Dash, Aerial Plunge, Wing Wall |
| **In Backlash** | NPC set pieces: drives the Lines, **kills King A** in Ch 5, guards the throne | NPC: watches the Culling Drill and culls the weakest without a word (E7); guards the throne |
| **Rebirth** | The King pours half his **aura** into him | The other half |
| **As archdemon (5★)** | **The butler.** Intelligent for the first time. Black suit, white shirt, black tie; long silky dark-blue hair (white and light-blue glossy highlights) in a low ponytail; **smooth white mask, closed eyes, a frown** (her mask upside down). Carries Cal | **The maid** (and musician). Intelligent for the first time. Black suit jacket, white shirt, black tie, **long black skirt slit high at the side**, **maid detailing** (frilled apron, cuffs, lace collar, headdress), instrument case; short silky pink hair in two ponytails (light-pink glossy highlights); **smooth white mask, closed eyes, a smile**. Hums the march; the one who looks back at Cal |
| **Concealed form** | Plain black suit, tie, gloves, **featureless black mask**; horns and wings hidden | The same |
| **Combat** | **None in this game.** Exclusive, rare NPCs (GDD §28) | **None in this game** |

**The contrast is the point:** the brute becomes an immaculate butler; the cold commander becomes a maid who hums lullabies. Mindless obedience becomes intelligence, and the first thing they do with it is take the soldier who taught himself to ask questions.

**Reuse:** their Commander kits are still built (they fight heroes as NPCs in Backlash), and their winged silhouettes are reused for the archdemon forms in CIN-05C.

## 11. Demon Lord King Encounter Design

### 11.1 In Backlash (no fight)
- **The Gaze (Ch 3, Throne Guard):** the King's attention is a slow-sweeping cone (a subtle light shift, a heartbeat in the audio, controller rumble). While it passes over Cal, the player must keep their posture: no movement but **formation pace**. Breaking pace makes nearby soldiers turn their heads. There is no fail state, only dread.
- **Silent casting, demonstrated:** the Commanders argue; the King looks at a pillar; it folds in half. No incantation, no particles: just a **distortion** in the air and the sound of stone giving way. Restraint makes it terrifying.
- **The Walk (Ch 5):** the player walks the length of the throne chamber at a constrained pace while every soldier faces forward and the King watches. Control is removed at the kneel.
- **The King's Answer (Ch 5, seen through Cal's dying eyes):** the King defeats the Hero Party **without standing**: he stops the Knight's charge in mid-air with a look, lets Maelis's Sacrifice raise the Knight to 5★ (*"…Five."*), then breaks them with one glance. The Goddess's light recalls the survivors. (He stands only once in Backlash, afterwards, to walk to his coffin.)
- **The Aura Sacrifice:** the King looks at his own palm, confused for the first time, and within minutes tears his aura out of himself in two streams and pours it into Ghorran and Vaelith. Emptied, he then lies down in a black coffin behind his throne and enters a **1000-year slumber**. **Consequence for Arc 7:** for fifteen years the throne has been empty, the coffin sealed, and the places beside it vacant; the army still obeys its last orders, with no one left to give new ones. The Gaze in Ch 3 is the full aura; it now lives in his archdemons. **He does not wake in this game.**

### 11.2 Arc 7: the King sleeps
**The Demon Lord King does not wake in this game. There is no King boss fight.** He is present as:
- **The coffin:** a sealed black coffin before an empty throne, tended by the archdemons like a shrine. It shudders when great power is spent nearby (the Siege; the Rite).
- **His army:** Lines still obeying fifteen-year-old orders, with no one to give new ones.
- **His archdemons:** who carry his aura, worship him as a god, and plan the **Rite of Waking**: sacrificing themselves **and Cal** to wake him (GDD §27–28).
- **His voice, once:** a single word from inside the coffin, in the archdemons' tongue, when Cal speaks it nearby (GDD §28.4, V8).

His waking, and the fight against a 6★ King, are reserved for a sequel.

---|---|---|
| **1: Seated** | Never stands. Casts by **looking**: wherever his gaze settles, an effect lands 0.8s later | Break line of sight (pillars, door frames) |
| **2: Command** | Orders the throne-room soldiers to sacrifice themselves into him (a buff per soldier) | **Knock soldiers out instead of killing them**: mercy reduces his power |
| **3: Standing** | Woken centuries early and weakened, he stands from the throne and fights. Physical combat at 6★ scale | Team attacks (Rook + Cal) |
| **4: Perception** | Forces Star Sight on Rook (GDD §25); targets the party by rating | Shift aggro to unrated Rook |
| **Final** | His own *Sacrifice*, to be reborn. **Cal intercepts it** | — (story) |

---

## 12. The Goddess Saint's Sacrifice Mechanic

### 12.1 Rules (lore = mechanics)
| Rule | Specification |
|---|---|
| **Cast** | 10-second spoken prayer. The Saint is stationary and vulnerable |
| **Interrupt** | Posture damage ≥ 40 during the channel. (In Backlash the AI's Guard behavior makes this nearly impossible for a 1★ soldier, by design) |
| **On completion** | The Saint dies (dissolve VFX). A **star mote** travels to the chosen ally |
| **Rebirth** | 3s later, at the Trial's light pillar, with full HP and **one star lower** |
| **Recipient** | Gains the star: visible as a permanent aura step and new moves (**never as a number**, unless the viewer has Star Sight) |
| **Limit** | Once per Trial. At 1★, Sacrifice would reduce her to 0★ and **erase her from her world** (GDD §25) |
| **Target choice (AI)** | The ally with the highest current threat contribution (almost always the Knight) |

### 12.2 Where Sacrifice appears
| Where | Role |
|---|---|
| **Backlash Ch 4** | Witnessed: the player can't stop it, and learns it with Observe |
| **Backlash Ch 5** | **Performed** (by Cal, as a whispered "vow") in CIN-05. The audio is the same ten syllables |
| **Backlash Ch 5, the throne room** | Maelis **sacrifices again** (4★ → 3★ in Ch 4, → 2★ here); the Knight reaches **5★**. They lose anyway. The first time the player sees Sacrifice fail to save anyone |
| **The Aura Sacrifice** | Not the Saint's prayer: the King's own version. He gives **aura** (presence and power), not stars, and the recipients are **reborn as something new** rather than strengthened |
| **Arc 7** | **Maelis as a guest party member:** Low Heal (protect her for 10s) and Sacrifice (once per battle, an ally gains a temporary *Star Surge*; Maelis drops a star *for real*, a permanent and heartbreaking cost the player chooses whether to accept) |
| **Arc 7, the Rite of Waking** | The archdemons sacrifice themselves and Cal to wake their King. Cal opens a door inside the rite and takes the power for himself (GDD §27) |
| **Final battle** | Inverted by the **Shared Star** (GDD §25.4): stars given freely, nobody loses anything |

### 12.3 Audio identity
The prayer is **ten distinct syllables in an original constructed language**, sung-spoken. Players hear it 3–4 times in Backlash (Low Heals + Sacrifice), then *whispered* in CIN-05. Theatre mode's subtitles reveal, after the fact, that Cal's "vow" was the same ten syllables.

---

## 13. Hidden Star Rating Integration

**Rule:** a star is displayed **only when the narrative establishes that the current viewpoint can see it.**

| Moment | Viewpoint | What the player sees |
|---|---|---|
| Ch 1–2 | Ash Eleven (can't see) | Nothing. Heroes just "get stronger" (aura steps, new moves) |
| **Ch 3, CIN-03** | **The King's eye** (one cut) | ★ above soldiers, ★★★ above Commanders. The first stars the player has ever seen. Gone the moment the camera leaves his eye |
| Ch 4 | Ash Eleven | The **star mote** of Sacrifice is visible as light (everyone can see light), never as a ★ glyph |
| **Ch 5, CIN-05** | King's POV, one cut | The ★ above Ash Eleven **leaves him**, crosses into the King's palm, and fades. A **hollow ☆ outline** (0★) remains over him. *"…Four,"* the King says, looking at the Knight |
| Ch 5, CIN-05B | Cal's dying eyes, then frozen time | **No stars are shown.** The King's *"…Five."* is only a faint word through the doorway |
| **Ch 5, CIN-05C** | **Cal's eyes** (one cut) | **★★★★★** flicker above each archdemon, then vanish. Cal's perception wakes here, at 0★, on the Astral Path. Full perception arrives in Ch 6 |
| **Ch 6 onward** | **Reincarnated Cal (can see)** | Ink ★ above every human. **Above the infant: nothing.** The player sees ratings for the whole of Ch 6–8 |
| **Return to present** | Rook (can't see) | The stars **vanish**. The player realizes **Cal has been seeing ratings over all of them for the entire game** |
| Arc 7 | Rook gains Star Sight | Permanent UI (GDD §25.3) |

**Visual language:** stars are drawn as **ink glyphs** (hand-drawn, slightly wet, brush-stroke), not game-UI icons. They float 30 cm above the head, scale with distance, and fade with occlusion. They *look* like something written on the world. This matters for the title and the finale.

---

## 14. Reincarnation Gameplay (Ch 6–8)

| System | Implementation | Player feeling |
|---|---|---|
| **Body swap** | The player swaps from `CHR_ASH_ELEVEN` to `CHR_CAL_YOUTH` mid-chapter. The first input after waking is deliberately **too fast** (movement accel 2× the soldier's) | *"This body is wrong. It's light."* |
| **Carry** | One-handed carry state: no attacks, dodge only, slower sprint | Fragility, protectiveness (whether he admits it or not) |
| **Language Resolve** | Human dialogue renders in an unreadable **cipher font**; each Observe-on-a-speaker resolves a few words. By Ch 7 most text is readable; by the Lighthouse, all of it | Learning a world, literally |
| **Magic by imitation (fails)** | Trying to cast by shouting a spell name (a prompt appears; the player presses it; nothing happens) | Liraen's rules are different |
| **Magic by intent (works)** | Door Step triggers from a **dodge input while falling**; afterward it's on its own button | The first door is an accident |
| **Observe → Star Sight** | The Observe button now also reads ratings (displayed only during Ch 6–8) | He sees what only the King could |
| **Unlock pacing** | §7 ladder; the HUD shows each new ability with a **brush-ink title card**, the same style as Rook's grimoire pages | Power arriving |
| **Rejection beats** | Barred doors, Crimson Bell hunt, Aldric's offer (§1) | *"Same hierarchy."* |

---

# PLAYER EXPERIENCE: Presentation Systems

## 15. Flashback Transition System: "The Door"

### 15.1 Into memory (CIN-00)
| t | Visual | Audio |
|---|---|---|
| 0.0s | Camera holds on Cal (CU), battle behind him | Music thins to a single held note |
| 1.5s | Cal: *"You really want to know?"* | Dry voice, close |
| 3.5s | (beat; head tilt) | Silence except wind |
| 4.5s | *"Then don't just listen."* He raises a hand | — |
| 5.5s | A golden door frame opens **around the camera** (screen-space frame wipe) | Door creak, deep and slow |
| 6.0s | Debris freezes mid-air; **saturation 1.0 → 0.0** over 1.2s | Low-pass sweep (20 kHz → 800 Hz), tinnitus ring |
| 7.2s | Camera pushes *through* the frame into white | Heartbeat ×2 |
| 8.0s | White resolves into ash-grey camp; **color returns as the memory palette** (ash grey, black, dark red) | March drum enters, four beats |
| 9.5s | **Player control** as Ash Line Eleven | Narration: *"Back then, I thought serving was all I was born to do."* |

**No loading screen:** Chapter 1's camp streams in asynchronously while the reveal fight's Phase 3 is played (§23).

### 15.2 Between chapters: memory splices
- **Standard chapter cut:** a thin door-frame outline flickers across the screen for 4 frames, one beat of silence, then the next memory. Cal's narration bridges.
- **Curated-narrator splice** (a deliberately missing piece; see §1): the same flicker, but with **a stutter** (2 frames of the previous scene repeat) and a single **missing beat of sound**. Only three exist (Aldric's study, the Hesper conversation, the Larkspur wake). Players who notice them are rewarded in Arc 7.

### 15.3 Out of memory (CIN-09)
The memory palette fades to white → the golden frame **folds shut** from the outside → full color snaps back → the frozen debris **finishes falling** → silence → the smirk (storyboard §21).

### 15.4 Memory look (post-processing profile `PP_MEMORY`)
- Ash LUT (desaturated, red retained), slightly heavier film grain, soft vignette, mild edge chromatic aberration.
- **Never applied to HUD or subtitles** (readability).
- Ch 6–8 shift the LUT warmer as Liraen's color enters his life; the Lighthouse scene is the warmest shot in the chapter.

---

## 16. Camera System

Built on the main game's camera director (GDD §19.5, §20), with profile overrides. **Rule: gameplay readability beats cinematic flair in every gameplay segment.**

| Profile | Use | Settings |
|---|---|---|
| `CAM_MEMORY_EXPLORE` | Camp, caverns, Liraen vignettes | Standard third-person, **camera 15% lower** than Rook's (a foot soldier among taller ranks), slightly longer lens |
| `CAM_FORMATION` | In line | Tighter shoulder framing; neighbors visible on both sides; a sense of being one of many |
| `CAM_OBSERVE` | Hold L2 | Soft lock on target, shallow depth-of-field, **no time slow** |
| `CAM_THRONE_WALK` | Ch 5 walk | Fixed slow dolly 2.5 m behind; the player controls walking only; the King grows in frame |
| `CAM_GAZE` | Ch 3 Throne Guard | Static wide; the gaze sweep is lighting, not camera |
| `CAM_COMBAT` | Trials | Standard combat camera; **slow motion reserved** for perfect dodges and the Trial 5 kill window |
| Timeline | Cinematics | Storyboarded (§21). Low angles, OTS, ECUs, wide battlefield shots, weapon tracking, silhouettes |

**Restraint rules:**
- No camera shake during walking or exploration.
- Cinematic camera moves are used **only** in the 10 cinematics.
- **Stillness before reveals:** every major reveal (the King's glance, the infant with no star, the smirk) is preceded by ≥ 1 second of complete camera stillness.

---

## 17. Dialogue System

Yarn Spinner (GDD §20), with three **voice channels**:

| Channel | Who | Treatment | Subtitle style |
|---|---|---|---|
| **NARRATION** | Present-day Cal | Dry, close, 2D (center), no reverb | Italic, warm white, lower-left |
| **MEMORY** | Everyone inside the flashback | Fully 3D spatial | Standard |
| **INTERNAL** | Young Cal's thoughts (only 3 lines in the whole chapter) | Close, slightly filtered | Small caps |

**Rules:**
- **Narration never overlaps an important diegetic line.** `NarrationService` queues narration until the MEMORY channel is free.
- **Narration lock:** from the end of P5.3 until Chapter 6, `NarrationService` is locked and present-day Cal says nothing. The narrator's silence is part of the apparent death.
- **The unknown language (CIN-05B only):** see §18.5. **No subtitles, no translation, no speaker labels.** With closed captions on, the only caption is *[Speaking an unknown language]*: an accessibility description, not a translation.
- **Young Cal almost never speaks aloud** (≈ 6 spoken lines in Ch 1–5). The present-day narrator does the talking. That contrast is the "old man remembering his younger self" effect.
- **Demon speech:** clipped orders in an original constructed language with subtitles (*"Line." "Hold." "Continue formation."*).
- **Language Resolve (Ch 6–7):** human dialogue runs through a cipher-font substitution that unlocks word by word (§14).
- **Narration script (complete):**

| Trigger | Line |
|---|---|
| Ch 1 control start | *"Back then, I thought serving was all I was born to do."* |
| Ch 1, after "That is enough." | *"I was wrong."* |
| Ch 2, Trial 2 start | *"Same three. Every month. You'd think someone would wonder why."* |
| Ch 2, first Insight | *"Nobody else was watching. That was the strange part."* |
| Ch 2, Trial 5, the order fades | *"Nothing happened. I broke an order, and the sky stayed exactly where it was."* |
| Ch 3, caverns | *"Someone had asked questions here before me. I never found out what happened to him. I have a guess."* |
| Ch 4, after the rebirth | *(silence; the INTERNAL line plays instead)* |
| Ch 5, the walk | *"Ten words. That's all it took. I'd been practicing them for a month."* |
| Ch 6, first stars | *"And suddenly I could see what he saw."* |
| Ch 6, the infant | *"Everything had a number. Everything except you."* |
| Ch 7, barred doors | *"Different world. Different species."* *(beat)* *"Same hierarchy."* |
| Ch 7, Lighthouse | *(silence. Cal does not narrate this scene)* |
| Ch 7, Exam seat | *"I told Dagrun to take you. He thinks it was his idea. Let him."* |
| Ch 8, the door | *"You've seen this part. From the wrong side."* |
| Ch 8, the ridge | *"And that's where you came in. Again."* |

> **Director's note:** the one scene Cal **won't narrate** (the Lighthouse) tells the player more about Layer 9 (the friendship was real) than any line could.

---

## 18. Audio System

### 18.1 Buses & snapshots (Web Audio)
| Bus | Content | Behavior |
|---|---|---|
| `NARRATION` | Present-day Cal | Dry; **sidechain-ducks** MUSIC −6 dB and SFX −3 dB while active |
| `MEMORY_VO` | Flashback dialogue | 3D spatial, memory reverb send |
| `SFX` | Sub-buses: Armor, Footsteps, Weapons, Arrows, Shields, Magic, Demon, Explosions, Ambience (wind, fire), Impacts | Separate so the mix can thin specific layers (e.g., remove Ambience before reveals) |
| `MUSIC` | Adaptive score | State-driven (below) |

**Snapshots:** `SNAP_MEMORY_ENTER` (low-pass sweep, tinnitus), `SNAP_MEMORY` (subtle low-mid warmth, slight high roll-off), `SNAP_THRONE` (ambience removed; only footsteps, armor, and breath), `SNAP_SILENCE` (everything to −∞ except a single chosen layer), `SNAP_RETURN` (instant full-bandwidth dry).

### 18.2 Music states & cue sheet
| State | Chapters | Identity |
|---|---|---|
| Present tension | CIN-00 | Sustained strings, one held note |
| **Demon military** | 1, 2 | The **four-beat march drum** (Cal's tune, as percussion), low brass, no melody. A world without melody |
| **Battlefield chaos** | 2, 4, 5 | Drum doubles; dissonant choir for the heroes' side |
| **Mystery** | 3 | Drum stops. Solo bowed metal, wind |
| **Sacrifice** | 4 | The Saint's ten syllables become the melody |
| **Reincarnation** | 6 | Silence → heartbeat → a single woodwind stating the **march as a melody** for the first time |
| **Discovery** | 6, 7 | Warm, curious, sparse. Liraen's instrumentation (strings, harp) arriving |
| **The Lighthouse** | 7 | The march tune, **whistled** (diegetic, by Dagrun's fire) |
| **Final villain reveal** | 8 → Return | Full statement of the march in low brass under the ridge; cut to **silence** for the return |

### 18.3 The audio trick (narration over memory)
Narration lines are placed in **gaps of the diegetic soundscape**. Example from Ch 1:
1. The march (MEMORY, spatial): boots, armor, drum.
2. NARRATION: *"Back then, I thought serving was all I was born to do."* (music ducks; drum continues underneath)
3. MEMORY resumes full: a soldier falls; *"Continue formation."*; boots step over the body.
4. NARRATION: *"I was wrong."*
5. Young Cal says nothing. Only his armor creaks as he turns his head to look back.

### 18.4 Silence rules
Total silence is used exactly **four times**: the death in Ch 1 (one second after the body hits the ground), the black after CIN-05B, the heartbeat wake in CIN-06, and the return in CIN-09. Silence is the chapter's loudest instrument. Don't spend it elsewhere.

**The Void is not silent; it is *pressure*.** It has its own sound world (§18.5), which is what makes it feel like reality has been interrupted rather than paused.

### 18.5 The Void sound world (CIN-05B)
| Layer | Treatment |
|---|---|
| **Approach** | The battle is low-passed and pulled back to a distant hum; Cal's breathing rises to the front, close-miked, wet, slow. His last three syllables sit **below intelligibility** (mixed under the breath, no subtitle) |
| **Apparent death** | Breathing stops. The muffled battle continues, uncaring, for the full hold |
| **The glitch** | A single faint digital-feeling click (the only "non-world" sound in the game) |
| **Opening** | A sub-bass bed (~28 Hz, felt more than heard) swells as light drains. Every world sound is subtly pulled in pitch toward the void |
| **Time stop** | **Every world sound cuts instantly** (fire, wind, battle, all SFX buses paused). What remains: the sub-bass and a thin high tone (~10 kHz). The film grain freezes too |
| **The figures** | Their footsteps are **dry, close, and perfectly clear**, the only clean sounds in a frozen world. Cloth rustle on the suits. No breathing from them, ever |
| **Dark aura** | The sub-bass rises; the controller pulses a heartbeat, then **stops**. The player's avatar breath and all UI sounds are removed |
| **The language** | Quiet, conversational, unhurried. Recorded dry, then placed with a slight **"wrong room"** reverb (a small, carpeted room that does not exist on a battlefield) |
| **Cal's laugh** | Recorded in four stages (breath → chuckle → laugh → manic). It gets an **unnaturally long reverb tail that never decays into ambience**, because there is no ambience. The final manic laugh is cut off **mid-breath by the hard cut** to the woman |
| **Fold-closed** | The sub-bass is drawn into a single soft, muffled close, like a heavy book shut in a vast empty room |
| **Time resumes** | **Every world sound returns at full level in the same frame**: fire, arrows, screams, steel. It should feel like surfacing |
| **Cut to black** | Silence (one of the four) → the **Void Note** (§1, Ch 6) → breathing → heartbeat |

**The Astral Path (CIN-05C):**
| Layer | Treatment |
|---|---|
| Realm bed | A slow, enormous, airy drone with the **Void Note** (§1, Ch 6) woven into it, so the sound that wakes Cal in Ch 6 will feel half-familiar |
| Footsteps | Glass-like, ringing softly, each tile forming with a tiny chime and dissolving with a hiss |
| Transformation | No roar, no effort sound. Horns: a low creak like old wood. Wings: one long fabric-and-leather unfurl, then slow, heavy beats that are never actually used to fly |
| The hum | The musician hums the **four-note march as a lullaby** (solo female voice, close, warm, no reverb tail). Cal whistles it back, off-key, once |
| Speech | One exchange in the unknown language, softer than on the battlefield. Cal **answers in it** (two words). No subtitles |

**Unknown-language production rules:**
- A dedicated phoneme set that shares **nothing** with the game's other constructed languages (demon orders, the Saint's prayer, Liraen's spell names) and doesn't resemble any real language. A linguist builds a small, consistent grammar so the language can return later and *sound the same*.
- **Script (3 lines + Cal's 3 syllables):** Male → Female → Male. The written meaning is kept in a **sealed director's envelope** that only the narrative lead holds. Until the mystery's truth is decided (GDD §28), the performance direction is fixed and the meaning is not: ***"colleagues confirming a routine pickup. Calm. Slightly bored. One small note of interest at the end."***
- **The language is the archdemons' tongue.** The Demon Lord King understands it (they were once his commanders, GDD §28). Cal speaks it.
- **Cal's dying syllables are in the same language.** This is never pointed out. A player who frame-steps CIN-05B in Theatre mode with the volume up may notice the cadence matches.

## 19. VFX Requirements

| VFX | Chapters | Spec | Budget |
|---|---|---|---|
| **Door transition** (in/out) | 0, R | Screen-space frame wipe + desaturation ramp; shader only | 0 particles |
| **Memory LUT / grain** | 1–8 | Post-process profile | — |
| **Memory splice** | Between chapters | 4-frame door-outline flicker; stutter variant | Shader |
| **Demon Slash T1/T2/T3** | All | Shared mesh-trail + tiered flipbook layers (§7.1) | T1 ≤ 40, T2 ≤ 120, T3 ≤ 600 particles |
| **Hero light-pillar arrival/retreat** | 2, 4, 5 | Vertical beam + motes; reused every Trial | ≤ 150 |
| **Saint prayer** | 2, 4 | Ground glyph circle filling over 10s (doubles as a readable channel timer) | ≤ 80 |
| **Sacrifice dissolve + star mote + rebirth** | 4 | Body dissolve shader; a single bright mote with a curved trail to the recipient; pillar rebirth | ≤ 400 |
| **Hero Surge aura** | 4, 5 | Rim-light boost + low-count embers | ≤ 60 per hero |
| **King's silent cast** | 3, 5 | **Distortion only** (screen-space refraction warp at target), no particles | 0–20 |
| **Ink stars** | 3, 5, 6–8 | Billboarded brush-stroke glyphs, instanced | 1 draw call per type |
| **Larkspur fire** | 6 | **Reuse Ep 1 cold-open assets** | Existing |
| **Golden door frames** | 6–8 | Reuse Cal's Arcs 1–2 Threshold VFX | Existing |
| **Severance tears** | 8 | Reuse Sable Knight VFX | Existing |
| **Hollow white** | 8 | Reuse Ep 18 Bloom white | Existing |

> **Reserved visual: the perfect black circle.** Nothing else in the entire game may use a perfect, smooth, light-absorbing black circle. Severance tears are **jagged**; the Hollow Gate is a **jagged red-black tear**; Hollow magic is **smoke-edged**. The circle belongs only to the Void Figures, so that when it appears again (GDD §28), players recognize it instantly.
| **Impact frames** | Combat T3, CIN-05B, CIN-08 | Global post-effect (GDD §19.6) | — |
| **Void glitch** | CIN-05B | A 0.5s screen-space ripple, the size of a hand, behind Cal's head | Shader |
| **The Void** | CIN-05B | A **perfect black circle**: an unlit, light-absorbing disc with a thin refraction ring at the edge (the world bends around it). Inward flow: smoke, ash, embers drawn toward it before the freeze. **Opening:** grows from a point over 3s. **Closing:** the edge *folds inward* like paper sealing, shrinking to a point. No glow, no sparks, no lightning | ≤ 200 (inward flow only) |
| **Time freeze** | CIN-05B | Global freeze of all scaled-time systems (particles, animation, physics, projectiles) + **frozen film grain** | 0 extra |
| **Dark aura** | CIN-05B | Vignette closes ~15% and breathes once; colors pulled toward black; a slight chromatic "squeeze" at the edges; no particles around the figures | Post-process |
| **Body impression** | CIN-05B | A faint body-shaped hollow left in the ash where Cal lay | Decal |
| **Astral realm** | CIN-05C | A black and violet starfield skybox with slow dark-aurora ribbons (shader); the Demon Continent far below as a low-detail map mesh with fire decals | Skybox + 1 mesh |
| **Black-glass path** | CIN-05C | Tiles spawn one step ahead (scale-in + chime) and dissolve behind (pooled) | ≤ 30 tiles live |
| **Concealment lifting** | CIN-05C | A thin ripple passes down each figure; the plain suits swap to the true outfits (white shirts, the musician's slit skirt) and the **black masks wash to white**, revealing the painted faces | Material swap + ripple shader |
| **Horns & wings** | CIN-05C | Horns grow from the brow (blend-shape + mesh); wings unfurl from coat slits (skinned, cloth-sim **off**, hand-keyed) | 0 particles |
| **Ink stars ★★★★★** | CIN-05C | Same ink-star renderer as §13, one cut | Instanced |

---

## 20. Animation Requirements

### 20.1 Reuse map
| Character | Source | New clips needed |
|---|---|---|
| **Ash Line Eleven (player)** | Demon Soldier enemy set (built for the Siege) | **~25**: player-quality locomotion blends, drill steps, Brace, Observe idle, formation shuffle, step-over, carry-body-glance, kneel |
| **Demon Soldiers (crowd)** | Enemy set | ~8 life-station loops |
| **Commanders** | Built for Backlash (NPC use) | **~4** for the rebirth: kneel, aura-receive, wings fold away, rise human-shaped (seen only through smoke) |
| **Demon Lord King** | Arc 7 set (built here first) | **~10**: seated idles, gaze turn, hand-open, stand (reserved for Arc 7) |
| **Knight Hero** | New | **~30** |
| **Goddess Saint** | New | **~15** (prayer kneel loop, rise, dissolve-ready pose, rebirth) |
| **King A** | New | **~20** |
| **Cal (youth)** | Cal companion set (Arcs 1–2), scaled | **~12**: wake, stumble-run, carry locomotion (6), first-door fall |
| **Cal (Ch 7–8)** | Cal companion + Sable sets | **~4** |
| **Ash Eleven, injured (Ch 5)** | Soldier set | **~8**: injured locomotion, stumble-dodge, thrown-into-debris, push-up-and-buckle, glaive-lift-and-drop, flinch, final collapse, being-carried (limp → relaxed) |
| **The Void Figures** | New | **~16**: concealment lift, horn emergence, wing unfurl, walking-with-wings, the musician's humming idle, the butler's free-hand gesture as the path forms, plus the original ~10: a shared unhurried walk (identical cadence for both), step-out-of-void, step-around (an obstacle they don't look at), the effortless lift-to-shoulder (**no anticipation, no strain**), shoulder-carry walk, conversational idles, the woman's stop / slow turn / small step back, step-into-void |
| **Faces** | — | High-detail facial pass for Ash Eleven's demon face (CIN-05 smile, CIN-05B: eyes opening, smile → grin → four-stage laugh). The most expressive face work in the chapter |
| **Liraen NPCs** | Existing | 0 |
| **Total new** | | **≈ 152 clips**, most of them hero-party combat that Arc 7 reuses |

### 20.2 Anime timing rules
- **Standard attacks:** pose-to-pose, **stepped on twos** (12 fps sampling), 8–15 keys (GDD §19.7).
- **Major attacks:** `smear → impact → held frame → recovery` (frame counts in §7.1).
- **Soldier vs. hero contrast:** soldiers are animated **stiffer and more uniform** (shared timing, little overlap), and the heroes are **looser and more expressive**. Ash Eleven starts with soldier timing. From Trial 4 onward, his idle gains small asymmetries (head tilts, weight shifts) that other soldiers don't have. **Individuality appears in the animation before it appears in the story.**
- **Held frames in cinematics:** CIN-03 (the King's glance: 18 frames held), CIN-05 cut 011 (the smile), CIN-09 (the smirk: the final held frame before control returns).
- **The Void Figures are the opposite of anime timing.** They are animated **on ones, perfectly smooth, with no anticipation, no smears, no held poses, no overlap**: the only characters in the game animated that way. In a world of snappy, stylized motion, their smoothness reads as *wrong*. That is the effect.
- **Cal's laugh** escalates through the animation style: subtle on ones (smile) → stepped on twos (chuckle) → full anime exaggeration with held frames (the manic laugh).

---

## 21. Storyboards (every major cinematic)

Format: **CUT · PICTURE · ACTION / STAGE · DIALOGUE / AUDIO · TIME / FRAMES (24 fps)**. Lighting and transitions are noted in the ACTION column.

### CIN-00 "You Really Want to Know?" (≈ 9.5s + held beats; present day → memory)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | MCU: Cal, unmasked, glaive on his shoulder; burning city behind, smoke backlit orange | Static. A loose strand of hair moves in the wind | CAL: "You were lighter than my glaive, you know. That night in Larkspur." | 3.0s / 72 |
| 002 | CU: Rook, frozen | Slow push in | Breath. Distant collapse | 1.5s / 36 |
| 003 | OTS (Rook → Cal) | Static | ROOK: "…What are you?" | 1.5s / 36 |
| 004 | CU: Cal tilts his head (S4); a slow smile | **Hold**, 1s complete stillness | Music thins to one held note | 2.0s / 48 |
| 005 | ECU: Cal's eyes; a faint starlight ring in the iris | Static | CAL: "You really want to know?" | 2.0s / 48 |
| 006 | MS: Cal raises his hand toward camera | Slow dolly back | CAL: "Then don't just listen." | 1.5s / 36 |
| 007 | POV (Rook): a golden door frame opens **around the lens** | Frame wipe; debris freezes mid-air; saturation drains to zero | Deep door creak; low-pass sweep; tinnitus | 1.5s / 36 |
| 008 | White | Push *through* | Heartbeat ×2 | 0.8s / 19 |
| 009 | Wide: ash-grey camp under a black castle; ranks of identical soldiers | Resolve from white; memory LUT | The march drum, four beats | 1.5s / 36 |
| → | **Control: Ash Line Eleven** | — | NARR: "Back then, I thought serving was all I was born to do." | — |

### CIN-01 "Continue Formation" (≈ 25s; Ch 1)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Wide, low: the column marching across a ridge; grey dawn | Tracking alongside | March drum; armor; boots | 2.5s / 60 |
| 002 | MS: the soldier beside Ash Eleven jerks; an arrow in his neck seam | Sudden; **smear 2f → held 4f** | Arrow thunk | 0.8s / 19 |
| 003 | Low angle: the soldier falls out of frame | Static | Armor crash | 0.7s / 17 |
| 004 | MS: Ash Eleven's faceplate turns toward the body | Slow; the only movement in frame | **Silence** (all layers except wind) | 1.5s / 36 |
| 005 | Wide from behind: the column does not slow; a soldier from the back row steps into the gap | Static | SERGEANT: "Continue formation." | 2.0s / 48 |
| 006 | Low, ground level: boots stepping over the body, one after another | Static, the body in the foreground | SERGEANT: "Mind the step." | 3.0s / 72 |
| 007 | MS: Ash Eleven, still looking back | Hold | Drum resumes | 1.5s / 36 |
| → | **Control returns** (the player may walk to the body; nothing happens) | — | — | — |
| 008 | (after the player resumes or 10s pass) OTS: the Sergeant shoves him back into line | Quick | SERGEANT: "Line." | 1.0s / 24 |

### CIN-02 "The Order Fades" (≈ 15s, in-engine; Ch 2 Trial 5)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Gameplay cam: ORDER text: **ATTACK THE KNIGHT** | The Knight charges, shield up | War cry | (gameplay) |
| 002 | Slow motion (perfect sidestep): the Knight passes, back exposed | **0.4× time for 1.5s**; the kill window | Heartbeat | 1.5s (real) |
| 003 | (player does not attack) ORDER text flickers, desaturates, fades | Time resumes | The UI makes no sound. That's the eeriest part | 1.0s / 24 |
| 004 | MS: the Knight, startled, retreats toward the light pillar | Tracking | — | 1.5s / 36 |
| 005 | CU: Ash Eleven's faceplate. Behind the slits, the faint shape of a smile | **Held 12 frames** | NARR: "Nothing happened. I broke an order, and the sky stayed exactly where it was." | 3.0s / 72 |

*(If the player does attack in the kill window, the Knight's Tier 5 Shield Parry turns it aside, the Knight escapes, and the order still fades. The memory is fixed; the player's intent only changes one narration line: "Even then, part of me still tried to obey.")*

### CIN-03 "What Exactly Are You?" (≈ 35s; Ch 3)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Wide: the throne chamber; rows of soldiers; the King seated, vast wings folded; Ghorran and Vaelith arguing below the dais | Slow crane down | Only armor, breath, and the Commanders' voices | 4.0s / 96 |
| 002 | MS: Ghorran raises his axe toward Vaelith | Static | GHORRAN: "Then the Left Wing will—" | 1.5s / 36 |
| 003 | CU: the King's eyes shift, slightly, to a pillar | **No other movement** | Silence | 1.0s / 24 |
| 004 | Wide: the pillar **folds** in half; air ripples (distortion only) | Static | Stone groaning, then a deep crack | 2.0s / 48 |
| 005 | MS: both Commanders kneel instantly | — | — | 1.5s / 36 |
| 006 | **POV: the King's eye.** Ink ★ above every soldier, ★★★ above each Commander | Slow pan across the ranks | A faint, high resonance (the "sound" of stars) | 3.5s / 84 |
| 007 | POV continues: the pan reaches **Ash Eleven** (★). Pauses. Moves on | 0.5s pause, then continues | — | 2.0s / 48 |
| 008 | MS: Ash Eleven in rank, faceplate forward, but his head **tilted a few degrees** toward the throne | **Held 18 frames** | — | 1.5s / 36 |
| 009 | ECU: the slits of his faceplate; inside, an eye looking up | Hold | INTERNAL: ***"What exactly are you?"*** | 3.0s / 72 |
| → | Splice to the next scene | Standard splice | — | — |

### CIN-04 "Sacrifice" (≈ 50s; Ch 4)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Wide: the heroes encircled; the Knight bleeding; King A out of arrows | Handheld drift | Chaos at full mix | 2.5s / 60 |
| 002 | MS: Maelis drops to her knees in the mud | Static | MAELIS begins: syllable 1 | 1.5s / 36 |
| 003 | Low angle: a glyph circle ignites under her and begins to fill (10s timer) | Tilt up | Syllables 2–3; battle noise continues | 2.0s / 48 |
| 004 | MS: the Knight plants himself in front of her, shield up | Tracking | KNIGHT: "Keep going!" | 1.5s / 36 |
| 005 | Wide: demons pile toward them; King A swings his bow like a club | Whip pan | Impacts; syllables 4–6 | 2.0s / 48 |
| 006 | **OTS from Ash Eleven, unmoving in the chaos, watching her** | Static amid motion | **The mix narrows**: battle sound drops, her voice stays | 2.5s / 60 |
| 007 | ECU: Maelis's lips | Static | Syllables 7–9 | 2.0s / 48 |
| 008 | ECU: Ash Eleven's faceplate slits | Static | Syllable 10 | 1.0s / 24 |
| 009 | Wide: she **dissolves** into light; a single bright mote arcs to the Knight | Slow motion 0.5× | A tone, rising | 3.0s / 72 |
| 010 | MS: the Knight **flares**; his posture changes; he stands taller | Snap zoom | Bass impact; heroic choir swell | 1.5s / 36 |
| 011 | Wide: silence on the battlefield; soldiers frozen | Static | **Total silence**, 1.5s | 2.0s / 48 |
| 012 | Wide: a pillar of light at the edge of the field; Maelis kneeling inside it, breathing | Slow push in | Her ragged breath | 3.0s / 72 |
| 013 | MS: soldiers stumbling backward. Ash Eleven does not move | Static | Armor clatter | 1.5s / 36 |
| 014 | CU: Ash Eleven. His head tilts | Hold 12f | — | 1.5s / 36 |
| → | Splice: night, the castle wall | — | — | — |
| 015 | Wide: Ash Eleven alone on the wall, the Trial field dark below | Static | Wind | 2.5s / 60 |
| 016 | MS (profile) | Hold | INTERNAL: ***"If death isn't permanent…"*** | 2.5s / 60 |
| 017 | Same | **Held 2 seconds of silence** | — | 2.0s / 48 |
| 018 | ECU: faceplate | Hold | INTERNAL: ***"…what exactly is death?"*** | 2.5s / 60 |

### CIN-05 "For the Demon King" (≈ 50s; Ch 5; cuts marked ↔ mirror GDD §19.3)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES | Mirrors Ep 18 |
|---|---|---|---|---|---|
| 001 | Wide: the throne chamber; endless ranks; the King on his throne; distant battle through the gate | Slow crane down | War drums beyond the walls | 3.0s / 72 | ↔ Bloom wide |
| 002 | MS: Ash Eleven kneeling at the foot of the dais (control has just ended) | Static, slight handheld | His breath inside the faceplate | 1.5s / 36 | ↔ Rook on one knee |
| 003 | CU: the King's fingers, resting, perfectly still | Snap zoom | Heartbeat | 0.8s / 19 | ↔ Bloom core |
| 004 | OTS from Ash Eleven up toward the King | Slow dolly in | INTERNAL: *"Huh."* | 2.0s / 48 | ↔ *"Huh. That's a big one."* |
| 005 | CU: Ash Eleven tilts his head, listening | **Hold pose** | The march drum: **three of its four beats**, then stops | 1.2s / 29 | ↔ Head tilt + 3 notes |
| 006 | Two-shot: the King looking down at the soldier | Static | KING: "Why are you here?" | 2.5s / 60 | ↔ *"Kid. Keep the key."* |
| 007 | ECU: the King's eye. Nothing in it | Static | Ash Eleven whispers. Under the mix: **the Saint's ten syllables** | 3.0s / 72 | ↔ Rook's widening eyes |
| 008 | Low angle: light begins at the seams of his armor | Tilt up, Dutch angle | Rising whisper | 1.8s / 43 | ↔ The door tears open |
| 009 | Wide: the ranks; nobody turns | Whip pan along the line | Silence beneath the drums | 1.2s / 29 | ↔ Door swallows the Bloom |
| 010 | MS from behind: he bows forward *into* the light, deliberately | Tracking, slow | Armor creak | 2.0s / 48 | ↔ Cal walks toward the door |
| 011 | CU: faceplate raised. The only time we see his demon face clearly before CIN-05B. He is smiling | **Held frame** | ASH: ***"For the Demon King."*** | 2.5s / 60 | ↔ *"I'll hold the door. Don't wait up."* |
| 012 | MS: the light at his seams **simply goes out**. Nothing happens | Static | The rising whisper stops dead | 1.5s / 36 | — |
| 013 | **POV: the King's eye.** A lone ★ rises from the kneeling soldier and drifts toward the throne | Slow push | High resonance | 2.5s / 60 | — |
| 014 | Insert: the King's palm. The star passes *through* it and fades | Hold | Resonance cuts off | 2.0s / 48 | — |
| 015 | POV: the King's eye. Above the soldier, a **hollow ☆ outline** | Hold 1s | — | 1.5s / 36 | — |
| 016 | MS: the King lifts his eyes toward the battle | Static | KING: "…Four." *(of the Knight)* | 1.5s / 36 | — |
| 017 | Two-shot: the King, not looking down again | Static | KING: "Your service is accepted." *(beat)* "Return to the line." | 3.5s / 84 | — |
| 018 | MS: Ash Eleven rises, unchanged, armor faintly smoking. A Commander's wing brushes past him; nobody looks at him | Static | Armor creak | 2.0s / 48 | — |
| 019 | OTS: he walks back down the chamber toward the white glare of the gate | Slow dolly behind | War drums swelling | 3.0s / 72 | — |
| → | **Control: The Last Line (P5.3)** | — | — | — | — |

### CIN-05B "The Void" (≈ 115s to the grin; Ch 5; the player must believe Cal died)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES | Mirrors Ep 18 |
|---|---|---|---|---|---|
| — | *(Gameplay P5.4 Failing Body ends: the player's last attempt to stand fails; control removed on the collapse)* | — | — | — | — |
| 001 | **Cal falling.** Low wide: Ash Eleven's body hits the stone threshold of the throne chamber; glaive skids away; fire and smoke behind | Static; **held frame** on impact (6f) | Heavy armor crash; battle at full mix | 1.5s / 36 | — |
| 002 | MS, ground level: the **Knight's boots step over him** without pausing; Maelis's hem follows; they walk into the throne chamber | Static | Battle begins to **muffle** (low-pass sweep) | 2.5s / 60 | — |
| 003 | **Final breathing.** CU: Cal's face sideways on the stone, faceplate cracked half away, one demon eye half-open. **Behind him, through the great doors, the throne chamber**, out of focus | Shallow focus on the eye | **Breathing** comes to the front: slow, heavy, weak | 3.0s / 72 | — |
| 004 | **Focus pull** past his eye to the chamber: the King, seated; the Knight's charge **stops in mid-air**, held by nothing | Rack focus; the image stays soft | Muffled, distant | 2.5s / 60 | — |
| 005 | Focus back to Cal's eye. A slow blink | Rack focus | Breathing | 1.5s / 36 | — |
| 006 | Focus pull: Maelis kneels; her glyph circle; her light pours into the Knight, who blazes | Rack focus, soft | Faint, far away: KING: "…Five." | 3.0s / 72 | — |
| 007 | Focus back to Cal. A slower blink | Rack focus | Breathing, weaker | 1.5s / 36 | — |
| 008 | Focus pull: one glance from the throne; the Knight is hurled across the chamber; Maelis collapses; a **pillar of light** tears the heroes out of the world | Rack focus, soft | A distant impact; a faint choir, cut off | 3.0s / 72 | — |
| 009 | Focus back to Cal. Eye nearly closed | Rack focus | Breathing | 1.5s / 36 | — |
| 010 | Focus pull, very soft: the King, motionless, **looking at his own open palm** | Hold | Silence from the chamber | 2.5s / 60 | — |
| 011 | Soft jump (time passes; his consciousness fades in): through smoke, **the two Commanders kneel** before the throne. Black aura tears from the King in **two streams** into them; their silhouettes twist, **wings fold away**, they shrink to **human shape**. Smoke swallows the image | Very soft focus; smoke drifts across | A deep, distant tearing sound, felt more than heard | 4.0s / 96 | — |
| 011a | Very soft, a last focus pull: the King rises, walks behind his throne, and **lies down in a black coffin**; the lid closes. Two human-shaped figures kneel before it; then nothing | Rack focus, smoke | One heavy, distant stone sound: the lid | 3.5s / 84 | — |
| 012 | ECU: Cal's lips behind the broken plate | Static | **Final words:** three faint syllables, unintelligible, **no subtitle** | 2.5s / 60 | — |
| 013 | CU (as 003): one last breath out. Then **nothing** | Static | — | 2.0s / 48 | — |
| 014 | **Apparent death.** CU: completely still. Behind him, through the doors, the smoke-filled chamber (out of focus) | **Hold. Do not cut.** No camera movement | Muffled fire and collapse. No music. No narration | 5.0s / 120 | — |
| 015 | Same frame | The hold continues past comfort. *(That's it?)* | — | 3.0s / 72 | — |
| 016 | **Portal begins.** Same frame: a tiny ripple appears in the air **behind his head**, like a rendering glitch | Static | A single faint **click** | 1.0s / 24 | — |
| 017 | Wide over his body: the air **bends** around a point 2 m behind him; light drains toward it; smoke drifts *backward*; ash lifts | Slow crane up | **Sub-bass** swells; world sounds pull in pitch toward the point | 3.0s / 72 | — |
| 018 | MS: a **perfect black circle** opens: no glow, a hole through the world; loose debris slides toward it | Static | Sub-bass deepens | 3.0s / 72 | — |
| 019 | **Time freezing.** Wide, high: the instant it is fully open, **everything stops**: smoke, fire, falling stone, a routing soldier mid-stride, embers | **Hard freeze** (single-frame transition) | **Every world sound cuts at once.** Only sub-bass and a thin high tone remain | 2.0s / 48 | — |
| 020 | Slow lateral dolly through the frozen gallery, ending on the doorway: inside, **the sealed coffin before an empty throne** | The **only** moving camera; even the film grain is frozen | Tone and sub-bass only | 4.0s / 96 | — |
| 021 | ECU, framed **off-center**: Cal's eye. The lid lifts a few millimetres | Static, no push-in | — | 1.0s / 24 | — |
| 022 | **Male figure enters.** MS, the void: a black-gloved hand, then a black suit sleeve; the MAN steps out onto the ash in one unhurried step. Black suit, shirt, tie, mask. No skin, no horns, no wings | Static | A single **footstep**: dry, close, perfectly clear | 2.5s / 60 | — |
| 023 | **Female figure enters.** MS: the WOMAN steps out beside him, in the same suit and mask, with the same cadence | Static | Second footstep. Cloth rustle | 2.0s / 48 | — |
| 024 | **Dark aura.** Low wide: both standing still, looking out over the frozen battlefield | Vignette closes ~15% and breathes once; color drains toward black; edges squeeze | Sub-bass rises; controller pulses a heartbeat (**the same pattern as the King's Gaze in Ch 3**)… then **stops** | 3.0s / 72 | — |
| 025 | Tracking from behind: they walk; the man steps **around** a frozen ember without looking at it | Slow tracking | Only their footsteps | 3.0s / 72 | — |
| 026 | **Indecipherable conversation.** Two-shot profile, walking | Static | MAN: *[unknown language, quiet, casual]* | 2.0s / 48 | — |
| 027 | Same | — | WOMAN: *[unknown language]* | 1.5s / 36 | — |
| 028 | Same | Still walking; they pass within a step of Cal **without a glance**. **They don't know him** | MAN: *[unknown language, short]*. **No subtitles. CC only: [Speaking an unknown language]** | 1.5s / 36 | — |
| 028a | Ground level: Cal's face soft in the foreground; their legs walking away beyond him | Static | **From the ground**, barely audible: CAL: *[unknown language, two words]* | 1.5s / 36 | — |
| 028b | MS: both **stop mid-step**. For the first time they move out of sync: the woman's head turns first | Static | Silence | 1.5s / 36 | — |
| 028c | CU: Cal, **the only thing moving in the frozen world**, lifts his head an inch off the stone, eyes open | Static | CAL: *[unknown language, a short phrase]* | 2.0s / 48 | — |
| 028d | Two-shot: the man crouches beside him, studying him | Static | MAN: *[unknown language, a question]* · CAL: *[short answer]* | 2.5s / 60 | — |
| 029 | MS: the woman's mask turns toward the man; a small, unmistakable lift in her shoulders: **excitement** | Slight turn; held | — | 1.5s / 36 | — |
| 030 | **Cal being picked up.** Low angle: the man lifts Cal onto his shoulder in **one smooth motion**, no anticipation, no strain | Static | Armor shifting; nothing else | 2.0s / 48 | — |
| 031 | Wide: the man walks toward the void carrying Cal; the woman follows a step behind | Static | Two sets of footsteps | 3.0s / 72 | — |
| 032 | **Cal's face.** Orbit CU around his face over the man's shoulder. **His eyes are open.** Calm. Not afraid | Slow orbit, 90° | — | 3.0s / 72 | — |
| 033 | ECU: a **slight smile** | Hold | — | 1.5s / 36 | — |
| 034 | ECU: the smile becomes a **grin** | Hold | — | 1.5s / 36 | — |
| ⟶ | **THE FLASHBACK ENDS. MATCH CUT** to present-day Cal's grin (CIN-09) | Match cut on the grin | — | — | — |

### CIN-05B-2 "Through the Void" (≈ 45s; **Cal's Path only**; continues from cut 034)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES | Mirrors Ep 18 |
|---|---|---|---|---|---|
| 035 | **Cal's laugh.** CU: a breath out through the nose; a small chuckle | Static | Chuckle with an **unnaturally long reverb tail** | 1.5s / 36 | — |
| 036 | MS: a deeper laugh, shoulders shaking. **The man does not react at all** | Static | Laugh, echoing | 2.0s / 48 | — |
| 037 | CU: a brief, unsettling **manic** laugh, then it stops | Stepped animation, held final frame | Manic laugh, cut off | 1.5s / 36 | — |
| 038 | **Male figure enters the portal.** Wide: the man steps into the black; Cal's face stays faintly visible in the dark just past the edge, rim-lit by frozen fire | Static | A footstep that sounds far away | 2.0s / 48 | — |
| 039 | **Female figure turning.** MS: the woman takes one step toward the void… stops | Static | Footstep. Silence | 1.5s / 36 | — |
| 040 | MS from behind her: she **slowly turns around** | Slow | Cloth rustle | 2.0s / 48 | — |
| 041 | **Final look.** CU: her mask, featureless, facing Cal | **Hold** | Nothing | 2.5s / 60 | — |
| 042 | MS: she takes **one small step backward** toward the void | Static | One footstep | 1.0s / 24 | — |
| 043 | ECU: Cal's face in the dark: **still smiling** | Hold | — | 1.0s / 24 | — |
| 044 | CU: Cal **laughs maniacally**, full and wild, echoing through frozen time | Full anime exaggeration; smear on the head throw | The manic laugh | 2.0s / 48 | — |
| 045 | **HARD CUT** to MS: the woman steps back into the void and **is gone** | Hard cut mid-laugh | The laugh is **cut off by the edit** | 0.6s / 14 | — |
| 046 | **Portal closing.** MS: the void's edge **folds inward**, like paper sealing a wound, shrinking to a point, gone | Static | Sub-bass drawn into one soft, muffled **close** | 2.0s / 48 | ↔ The door slams |
| 047 | Wide (as 019): the empty threshold where Cal lay; a faint body-shaped hollow in the ash | **0.5s of stillness** | Only the high tone, fading | 0.8s / 19 | ↔ Empty plateau |
| 048 | **Time resuming.** Same wide: **everything resumes in the same frame**: fire roars, smoke rolls, stone falls, the routing soldier finishes his stride | Hard resume | **All world sound returns at full level at once** | 2.0s / 48 | — |
| 049 | **Battlefield continuing.** MS: a Demon Soldier glances toward the spot where Cal was. Nothing. He turns back | Static | Fire, collapse, shouted orders | 2.0s / 48 | — |
| 050 | Wide through the doorway: the **sealed coffin**, the **empty throne**, and the **empty places** where the Commanders knelt. No one is left to notice anything | Slow push in | Silence from the chamber | 3.5s / 84 | — |
| 051 | Wide: a soldier from the rear steps into the gap in the Line | Static | SERGEANT: ***"Mind the step."*** | 2.5s / 60 | ↔ The dark lantern |
| 052 | **CUT TO BLACK** | Hard cut | **Total silence** | 3.0s / 72 | — |
| → | **CIN-05C "The Astral Path"** (Cal's Path) | — | — | — | — |

### CIN-05C "The Astral Path" (≈ 60s; Cal's Path; follows CIN-05B-2's cut to black)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Black | Hold | Silence | 2.0s / 48 |
| 002 | Extreme wide: a vast dark starfield, black and violet; cold aurora rippling. Tiny in the center: two walking figures, one carrying a third | Slow fade up from black | Realm drone rises; the Void Note woven in | 4.0s / 96 |
| 003 | Low, at path level: a black-glass tile forms one step ahead of a polished black shoe; the tile behind dissolves | Tracking backward with their feet | Glass chime; dissolve hiss; their unchanged cadence | 3.0s / 72 |
| 004 | MS: the man, carrying Cal over his shoulder. His free gloved hand moves slightly, and the path ahead extends (**dark magic, no word**) | Tracking | — | 2.5s / 60 |
| 005 | MS: a thin ripple passes down the man: his black mask washes **white**: closed crescent eyes, a **painted frown**. His shirt turns **white** under the black suit and tie; silky **dark-blue hair** spills loose, white and light-blue highlights catching the aurora, a low ponytail swaying to his knees. One hand stays in his pocket | Tracking; ripple 12f | A faint shimmer | 3.0s / 72 |
| 006 | MS: the same ripple down the woman: **black suit jacket, white shirt, black tie**, a frilled white apron and cuffs, a lace collar, and a **long black skirt slit high at the side** that opens as she walks; a slim black instrument case on her back. Short **pink twin ponytails** with light-pink gloss spill out under a small lace headdress. Her mask washes white: **the same mask, smiling** | Tracking | Shimmer | 3.0s / 72 |
| 007 | CU, profile: the man's masked head. **Horns** rise from his brow, curving back, slow and unhurried | Static; he doesn't break stride | Low creak, like old wood | 2.5s / 60 |
| 008 | MS from behind: **vast dark wings** unfurl from slits in his coat, then the woman's. They keep walking | Slow crane up | One long unfurl; two heavy wingbeats, never used to fly | 4.0s / 96 |
| 008a | Extreme wide: they pass the **wreckage of other worlds**: a cracked planet hanging in the dark, a burned city drifting in pieces, a sea frozen mid-wave. Neither looks | Slow pan | Drone; a faint, far-off groan of breaking stone | 4.0s / 96 |
| 009 | Extreme wide from below the path: through the translucent glass, the entire **Demon Continent** drifts past far beneath, the castle a speck, the battlefield a small smear of fire | Slow tilt up to the figures | Drone | 4.0s / 96 |
| 010 | Two-shot, walking: the archdemons, fully revealed (horns, wings, suits; **her smile and his frown side by side**; her skirt slit and twin ponytails swinging in step, his long ponytail swaying) | Tracking | MAN: *[unknown language, soft]* · WOMAN: *[unknown language]* | 4.0s / 96 |
| 011 | CU: Cal over the man's shoulder, eyes half-closed, still smiling | Static | CAL: *[two words in the unknown language]*. No subtitles | 2.5s / 60 |
| 012 | MS: the woman, walking, begins to **hum** | Tracking | Four slow notes: **the march as a lullaby** | 4.0s / 96 |
| 013 | CU: Cal whistles it back, off-key | Hold | Whistle, once | 2.5s / 60 |
| 013a | Two-shot: the archdemons glance at each other. A small, unmistakable lift in their posture: **excitement** | Hold | A short exchange in the unknown language, quicker than before | 2.0s / 48 |
| 014 | **POV (Cal's eyes):** looking up at the two of them; faint ink **★★★★★** flicker above each (the Commanders' 3★ are gone; the King's aura made them 5★) | One cut; the stars fade within 1s | A high resonance, then gone | 2.0s / 48 |
| 015 | Extreme wide, behind them: the path runs on and on into the dark between worlds; far ahead, a tall dark doorway | Very slow push | The hum continues, fading | 5.0s / 120 |
| 016 | **CUT TO BLACK** before they reach the doorway | Hard cut | **Silence** | 2.0s / 48 |
| → | **CIN-06 "Heartbeat"** | — | — | — |

### CIN-06 "Heartbeat" (≈ 35s; Ch 6; continues from CIN-05C's black)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Black | Hold (several seconds; the player should wonder if the game froze) | Silence | 4.0s / 96 |
| 001a | Black | — | **The Void Note**: a low glassy tone, bending upward, then gone. Half-familiar from the Astral Path's drone | 2.0s / 48 |
| 001b | Black | — | Breathing: young, human, not muffled by a faceplate | 2.0s / 48 |
| 002 | Black | — | Heartbeat | 1.5s / 36 |
| 003 | Black | — | Heartbeat | 1.5s / 36 |
| 004 | ECU: an eye opens; firelight in it, **in color** | Static | Distant screaming, muffled | 1.5s / 36 |
| 005 | POV: a thin human hand raised in front of the face | Slow, uncertain | Breath (a young human voice, not armor-muffled) | 2.0s / 48 |
| 006 | Wide: **Larkspur burning**, the same composition as Ep 1's cold open, reversed | Slow pan | Fire roar fades up | 3.0s / 72 |
| 007 | MS: a villager runs past; an ink **★** floats above her head | Static | — | 1.5s / 36 |
| 008 | POV pan: ★, ★, ★★ over the fleeing | Pan | The star resonance | 2.0s / 48 |
| 009 | Low angle: a fallen beam; beneath it, a crying infant | Static | Infant crying (cuts through everything) | 2.0s / 48 |
| 010 | POV: above the infant, **nothing** | **Held 1.5s stillness** | Crying only | 2.0s / 48 |
| → | **Control: Cal (youth).** Lift the beam | — | NARR: "Everything had a number. Everything except you." | — |

### CIN-07 "Nobody's Written Your Story" (≈ 45s; Ch 7; no narration)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Wide: the lighthouse on the dry seabed in rain; one warm window | Static | Rain; the warmest LUT in the chapter | 3.0s / 72 |
| 002 | MS: Cal (youth, soaked) in the doorway; DAGRUN (younger, already huge) at a pot | Static | Fire crackle | 2.0s / 48 |
| 003 | CU: Dagrun glances up. **★★★** above his head (Cal's sight). He doesn't stand | Hold | DAGRUN: "Door's open. Shut it, you're letting the rain in." | 3.0s / 72 |
| 004 | MS: Cal shuts the door. He hesitates | Static | — | 1.5s / 36 |
| 005 | Two-shot: Dagrun ladles a second bowl, holds it out without looking | Static | — | 2.5s / 60 |
| 006 | Insert: the bowl in Cal's hands | Hold | — | 1.5s / 36 |
| 007 | MS: Cal | Static | CAL: "You don't know what I am." | 2.0s / 48 |
| 008 | CU: Dagrun, eating | Static | DAGRUN: "Nope." | 1.5s / 36 |
| 009 | CU: Dagrun | Hold | DAGRUN: "Nobody's written your story." *(beat)* "Good." | 3.5s / 84 |
| 010 | ECU: Cal's eyes. For the first time in two lives, unguarded | **Held 18 frames** | Rain. Then, softly, Dagrun begins whistling **the march**; he's picked it up from Cal humming earlier | 3.0s / 72 |
| 011 | Wide: the window from outside; two figures; rain | Slow pull back | Whistle continues | 4.0s / 96 |

### CIN-08 "The Mask" (≈ 35s; Ch 8)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Wide: the edge of the Hollow; white nothing behind; a ruined hillside in front | Static | Far-off **four-beat drum**, through the white | 3.0s / 72 |
| 002 | MS: Cal, scarred now, kneeling; black shards of Hollow-stuff in his hands | Static | — | 2.0s / 48 |
| 003 | Insert: his fingers pressing the shards into a curve; **slits** appear | Slow push | Glass grinding | 3.0s / 72 |
| 004 | CU: the mask, finished. The slit pattern of a **Demon Soldier faceplate** | Hold | The drum stops | 2.0s / 48 |
| 005 | CU: Cal looks at it. A small smile | Hold | NARR: "Old habits." | 2.5s / 60 |
| 006 | MS: he raises it to his face | Slow | — | 1.5s / 36 |
| 007 | **ECU: the mask settles. His eyes vanish behind the slits** | **Impact frame** (2f) | Low brass: the march, full, for the first time | 1.0s / 24 |
| 008 | Wide: the ridge in the Ashfall war; the Lanterns below; a siege engine rolling toward them | Crane | Battle far below; music swells | 3.0s / 72 |
| → | **Control: one input: open the tear** | — | — | — |
| 009 | (after input) Wide: the engine falls out of the sky (Ep 24 from above) | Static | Impact | 2.0s / 48 |
| 010 | MS: the masked figure turns away from the edge | Hold | NARR: "And that's where you came in. Again." | 3.0s / 72 |

### CIN-09 "The First Time" (≈ 50s; return to present; all players)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 000 | **MATCH CUT** from the demon soldier's grin (CIN-05B cut 034): the **same grin, same angle**, on present-day Cal's human face | Hold 12f | **Total silence** | 0.5s / 12 |
| 001 | Wider: behind Cal, the golden frame **folds shut** | Static | Door creak, reversed | 1.0s / 24 |
| 002 | Wide: the burning bridge district, **full color**; debris frozen mid-air | Hold 1s | **Total silence** | 1.0s / 24 |
| 003 | Wide | The debris **finishes falling** all at once | Crashes, dry, unprocessed | 1.5s / 36 |
| 004 | MS: Rook, exactly where they stood, staring | Static | Silence. Wind returns, faint | 2.0s / 48 |
| 005 | MS: Cal, exactly where he stood. Same face. Same voice | Static, held 1.5s | — | 2.0s / 48 |
| 006 | CU: Cal | Hold | CAL: "So. That's how I died." | 2.5s / 60 |
| 007 | CU: Cal; the smile **grows** | Slow push in | *(beat)* CAL: "…The first time." | 3.0s / 72 |
| 008 | CU: Rook, no words | Hold | Breath | 1.5s / 36 |
| 009 | MCU: Cal tilts his head (S4) | Static | CAL: "Don't mistake that for a confession." | 2.5s / 60 |
| 010 | **ECU: the smirk.** Subtle, confident, playful. Not cruel | **Held 18 frames** | CAL: "It was an introduction." | 3.0s / 72 |
| 011 | Wide: he opens a golden door frame beside him, sits on its lower edge, swings one leg | Static | The march, once, low, quiet | 3.0s / 72 |
| 012 | **PERSPECTIVE CHOICE.** Split screen: Rook's face, left; Cal's grin, right | Hold until chosen; no timer | CAL: "Your move." Then silence | — |
| → | **Rook:** reveal fight Phase 4 (GDD §15.8). **Cal:** Phases 4–6 as Cal (PC.4–PC.6), then Cal's Path | — | — | — |

### CIN-10 "After the Door" (≈ 40s; present day; Cal's Path only)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | MS: Cal steps through his golden door; it closes behind him from his side | Static | Door shutting | 2.0s / 48 |
| 002 | Extreme wide: the Astral Path, the dark between worlds, walked on his own feet this time | Slow tracking | Realm drone; glass footsteps | 4.0s / 96 |
| 003 | Wide: the end of the path: an empty throne, a **sealed black coffin**, and before it, the **butler and the maid**, waiting | Slow push | The drone thins | 4.0s / 96 |
| 004 | MS: they incline their heads, a fraction. Not as servants. Not as equals | Hold | — | 2.0s / 48 |
| 005 | CU: Cal | Static | CAL: *[unknown language, short]* | 2.0s / 48 |
| 006 | MS: the maid begins to hum the march | Static | The four notes | 3.0s / 72 |
| 007 | CU: Cal looks at the coffin and tilts his head (S4) | Hold | CAL: ***"You two still haven't told me what I'm for."*** | 3.5s / 84 |
| 007a | Two-shot: the butler and the maid, her smile and his frown unmoving, perfectly still. She keeps humming. Neither answers | **Held 2s** | The hum | 2.5s / 60 |
| 008 | **CUT TO BLACK** | Hard cut | Silence | 2.0s / 48 |
| → | **Back to Rook: Ep 50's ending** (GDD §15.8) | — | — | — |

---

# TECHNICAL IMPLEMENTATION

## 22. Save / Checkpoint System

| Rule | Implementation |
|---|---|
| **Present snapshot** | On entering CIN-00, the game saves `PresentSnapshot` (reveal fight state at the end of Phase 3, party state, inventory). The flashback never touches it |
| **Separate memory state** | Backlash runs on a separate `MemoryState` profile (HP, Insight, unlocks) that is discarded on exit except for flags |
| **Chapter checkpoints** | Autosave at each chapter start + each encounter start (E1–E13). Quitting mid-flashback resumes at the latest checkpoint *inside* the memory |
| **Failure in memory** | Death as Ash Eleven or young Cal is a **narrated correction**: the screen flickers like a splice, Cal's NARRATION says one of several lines (*"No. That's not how it went."* / *"I didn't die there. Try again."* / *"You're making me look bad."*), and the encounter restarts. No game-over screen |
| **Exit** | On CIN-09, `PresentSnapshot` is restored and the reveal fight continues at Phase 4. The game autosaves |
| **Flags written** | `BACKLASH_COMPLETE`, `BACKLASH_CHAPTER` (0–8), `BACKLASH_T4_STRATEGY`, `BACKLASH_T5_ATTACKED` (did the player try to obey), `BACKLASH_INSIGHT_COUNT`, `BACKLASH_PERSPECTIVE` (0 Rook / 1 Cal), `CALS_PATH_COMPLETE`, `CALS_PATH_ARCHIVE_UNLOCKED` (set by the Field Notes in Arc 6 for Rook players), `BACKLASH_VOID_SEEN`, `THEATRE_FRAMESTEPPED_VOID` (telemetry: did the player find Cal's eye opening at cut 013), `BACKLASH_SPLICES_NOTICED` (counts players who paused on a splice, optional telemetry), `STAR_SIGHT_SEEN_ONCE` |
| **Replay** | Lore Archive → **Relive** (replay any chapter; playable segments are playable) and **Theatre** (cinematics with frame-step and side-by-side: CIN-05 + CIN-05B ↔ Ep 18) |

---

## 23. Performance Strategy

| Area | Strategy |
|---|---|
| **Streaming** | Each chapter is an additive scene set (≈ 30–60 MB). Chapter N+1 preloads during chapter N's last cinematic. **Ch 1 preloads during reveal-fight Phase 3** (the fight is arena-locked, so memory headroom exists) |
| **Map reuse** | The Demon Camp, Trial field, caverns, and throne chamber are the **same assets as Arc 7's Demon Continent** (era-state swap). Larkspur reuses Ep 1. Thornwick, the lighthouse, and the Valcourt study reuse existing zones with lighting/era swaps |
| **Crowds** | Demon ranks: GPU-instanced impostors beyond 60 m; animation-only (no AI) 25–60 m; full AI ≤ 25 m. Target: **≤ 30 animated soldiers and ≤ 12 AI agents** on screen |
| **AI** | Formation logic runs per Line (one controller, not per soldier). Hero agents are only 3. Camp life stations are looping animations on splines |
| **Animation** | Stepped sampling on soldiers saves evaluation cost; shared soldier clips across all rank-and-file |
| **VFX** | All pooled; budgets per §19; the King's magic is distortion-only |
| **Cinematics** | Timeline assets reuse existing camera rigs and character rigs; no pre-rendered video |
| **Audio** | Narration streamed; the memory reverb is a single send; snapshot transitions are cheap |
| **Memory** | `MemoryState` is lightweight; the present-day battle scene stays resident but **paused** (its AI/physics frozen) to make the return instant |

---

## 24. Modular Architecture

New modules plug into the existing architecture (GDD §21) through the service locator and event bus. No changes to the combat core.

```
                  ┌──────────────── FlashbackDirector ─────────────────┐
                  │ Enter(memoryId) / Exit()                            │
                  │ • saves PresentSnapshot, pauses present scene       │
                  │ • swaps controlled CharacterData                    │
                  │ • applies MemoryProfile (LUT, audio snapshot, HUD)  │
                  │ • runs ChapterGraph                                 │
                  └────────────┬────────────────────────────────────────┘
                               │ drives
                     ChapterGraph (data) ──▶ Segments: Gameplay | Cinematic | Narration
                               │
   ┌──────────────┬────────────┼────────────────┬────────────────┬──────────────┐
   ▼              ▼            ▼                ▼                ▼              ▼
OrdersSystem  ObserveSystem  FormationCtrl   PartyBrain     NarrationService  StarPerception
(objective    (InsightTracker (Lines, slots,  (hero squad    (VO queue,        (shows ★ only for
 wrapper +     counts tagged  fill-gap,        states, role   ducking, channel  viewpoints that
 "disobeyed")  ability events) orders, bonus) agents, tiers)  rules)            can perceive)
                               │
                     PrayerChannel (shared by Saint Low Heal / Sacrifice / Cal's vow)
                     LanguageResolve (subtitle cipher)
                     MoveTierData (Demon Slash T1/T2/T3 = one clip, three AbilityData)
                     TimeFreezeController (CIN-05B: freezes the world; exempts the void,
                                           the two figures, Cal's face, and the camera)
```

**How systems communicate:**
- `FlashbackDirector` is the only system that changes the player's identity, and it does so by swapping `CharacterData` (the same mechanism as tag-swap).
- Gameplay systems talk through **events**: `OnAbilityPerformed(tag)` → `ObserveSystem`; `OnOrderIgnored` → story flags + narration; `OnSoldierDied` → `FormationController.FillGap`; `OnPrayerCompleted` → `SacrificeResolver`.
- **Everything authored is data:** `ChapterGraph`, `HeroTierData`, `MoveTierData`, `NarrationLine` (text, trigger, priority), `MemoryProfile`.

**New data assets:**
`MEM_BACKLASH` (MemoryProfile) · `CG_BACKLASH_CH0..CH8` (ChapterGraphs) · `HTD_TRIAL_1..5, CH4, CH5` (HeroTierData) · `ABL_DEMON_SLASH_T1/T2/T3` · `CHR_ASH_ELEVEN` · `CHR_CAL_YOUTH` · `NAR_BACKLASH` (narration table) · `LANG_HUMAN_CIPHER` · `CHR_UNK_A` / `CHR_UNK_B` (the two archdemons; deliberately meaningless IDs, see GDD §15.11) · `ENV_ASTRAL_PATH` · `VFX_CIRCLE_RESERVED`.

---

## 25. Example Implementation Sketches

> **These are illustrative sketches, written when the engine was Unity (C#).** The project now runs on Babylon.js (GDD §20), but the structure carries over directly: each class becomes a plain JavaScript module beside the fight simulation in `game/src/sim/`, and `MonoBehaviour` update loops become steps of the fixed 60 Hz clock. The working versions will be written in JavaScript when the Backlash prototype starts.

### 25.1 ChapterGraph (data)
```csharp
// A chapter is an ordered list of segments. Designers author it; code just runs it.
[CreateAssetMenu(menuName = "Unwritten/Flashback/Chapter Graph")]
public class ChapterGraph : ScriptableObject
{
    public string chapterId;                 // "BACKLASH_CH1"
    public List<Segment> segments;
}

[Serializable]
public class Segment
{
    public SegmentType type;                 // Gameplay, Cinematic, NarrationOnly
    public string checkpointId;              // autosave key at segment start (optional)
    public AssetReference scene;             // additive scene for Gameplay segments
    public PlayableAsset timeline;           // for Cinematic segments
    public string exitEventId;               // e.g. "ORDER_FADED", "REACHED_GATE"
    public NarrationLine[] narration;        // lines this segment may play
}
public enum SegmentType { Gameplay, Cinematic, NarrationOnly }
```

### 25.2 FlashbackDirector (core flow)
```csharp
public class FlashbackDirector : MonoBehaviour
{
    [SerializeField] MemoryProfile profile;          // LUT, audio snapshot, HUD profile
    PresentSnapshot snapshot;

    public async Task Enter(ChapterGraph[] chapters, CharacterData memoryBody)
    {
        snapshot = SaveService.CapturePresent();      // never modified inside the memory
        PresentScene.Pause();                         // freeze AI/physics; keep resident
        PostFX.Apply(profile.lut);
        Audio.SetSnapshot(profile.enterSnapshot);
        Player.SwapCharacter(memoryBody);             // same path as tag-swap

        foreach (var chapter in chapters)
            await ChapterRunner.Run(chapter);         // awaits each segment's exit event

        await Exit();
    }

    async Task Exit()
    {
        await Cinematics.Play(profile.returnTimeline); // CIN-09
        SaveService.RestorePresent(snapshot);
        PresentScene.Resume();                         // the debris finishes falling
        Flags.Set("BACKLASH_COMPLETE", 1);
    }
}
```

### 25.3 Observe → Insight
```csharp
public class InsightTracker : MonoBehaviour
{
    [SerializeField] InsightDefinition[] insights;    // tag → required count → unlock
    readonly Dictionary<string, int> counts = new();
    public Transform ObservedTarget { get; set; }      // set by the Observe camera mode

    void OnEnable()  => EventBus.Subscribe<AbilityPerformed>(OnAbility);
    void OnDisable() => EventBus.Unsubscribe<AbilityPerformed>(OnAbility);

    void OnAbility(AbilityPerformed e)
    {
        if (e.Caster != ObservedTarget) return;        // only what you actually watch
        foreach (var def in insights)
        {
            if (def.abilityTag != e.Tag || IsLearned(def)) continue;
            counts[def.abilityTag] = counts.GetValueOrDefault(def.abilityTag) + 1;
            if (counts[def.abilityTag] >= def.requiredObservations)
                Learn(def);                            // unlock counter/parry + ink title card
        }
    }
    bool IsLearned(InsightDefinition d) => MemoryState.Has(d.id);
    void Learn(InsightDefinition d) { MemoryState.Add(d.id); EventBus.Raise(new InsightLearned(d)); }
}
```

### 25.4 PrayerChannel & Sacrifice
```csharp
public class PrayerChannel : MonoBehaviour
{
    public float duration = 10f;
    public float interruptPostureThreshold = 40f;
    float elapsed, postureTakenThisCast;
    public bool IsChanneling { get; private set; }
    public event Action Completed, Interrupted;

    public void Begin() { elapsed = 0; postureTakenThisCast = 0; IsChanneling = true; }

    public void OnPostureDamage(float amount)          // called by the DamageSystem
    {
        if (!IsChanneling) return;
        postureTakenThisCast += amount;
        if (postureTakenThisCast >= interruptPostureThreshold) { IsChanneling = false; Interrupted?.Invoke(); }
    }

    void Update()
    {
        if (!IsChanneling) return;
        elapsed += Time.deltaTime;                     // also drives the glyph-circle fill VFX
        if (elapsed >= duration) { IsChanneling = false; Completed?.Invoke(); }
    }
}

public static class SacrificeResolver
{
    // Lore = mechanics: caster loses a star, recipient gains one, caster is reborn.
    public static void Resolve(Actor caster, Actor recipient, Vector3 rebirthPoint)
    {
        if (caster.Stars <= 1) { StoryEvents.Raise("SACRIFICE_WOULD_ERASE", caster); return; }
        caster.Stars -= 1;
        recipient.Stars += 1;                           // drives the aura tier + unlocked moves
        Vfx.PlayStarMote(caster.Position, recipient);   // visible light, never a ★ glyph
        caster.DissolveAndRespawn(rebirthPoint, delay: 3f);
    }
}
```

### 25.5 FormationController: fill the gap
```csharp
public class FormationController : MonoBehaviour
{
    [SerializeField] int columns = 6, rows = 3;
    Soldier[,] slots;

    public void OnSoldierDied(Soldier dead)
    {
        var (c, r) = Find(dead);
        slots[c, r] = null;
        // The nearest soldier in the row behind steps over the body into the gap.
        for (int back = r + 1; back < rows; back++)
        {
            var replacement = slots[c, back];
            if (replacement == null) continue;
            slots[c, back] = null;
            slots[c, r] = replacement;
            replacement.StepInto(SlotPosition(c, r), stepOver: dead.transform.position);
            break;
        }
    }
    // Formation Bonus: soldiers standing in their assigned slot get +50% defense.
    public bool InSlot(Soldier s) => Vector3.Distance(s.transform.position, SlotPosition(Find(s))) < 0.8f;
    // Find(), SlotPosition() omitted for brevity.
}
```

### 25.6 StarPerception (show stars only for viewpoints that can see)
```csharp
public class StarPerception : MonoBehaviour
{
    // Set by cinematics (King's POV cut) or by the controlled character's traits.
    public static bool ViewpointCanPerceive { get; set; }

    [SerializeField] InkStarRenderer renderer;          // instanced brush-stroke glyphs

    void LateUpdate()
    {
        renderer.enabled = ViewpointCanPerceive;
        if (!ViewpointCanPerceive) return;
        foreach (var actor in ActorRegistry.Visible)
            renderer.Draw(actor.HeadAnchor, actor.Data.starRating); // ∅ draws nothing
    }
}
// Viewpoints: King POV cuts (Timeline signal), CHR_CAL_YOUTH (trait: PerceivesRatings),
// Rook after STAR_SIGHT_UNLOCKED. Everyone else: false.
```

### 25.7 TimeFreezeController (CIN-05B)
```csharp
// Stops the world but not the things that must keep moving.
// Unity's scaled time drives particles, Animators (Normal update mode), physics and projectiles,
// so setting timeScale to 0 freezes all of them for free. Exempt objects run on unscaled time.
public class TimeFreezeController : MonoBehaviour
{
    [SerializeField] Animator[] exemptAnimators;      // the two figures, Cal's face rig
    [SerializeField] PlayableDirector cinematic;      // CIN-05B timeline
    float previousScale;

    public void Freeze()                              // called by a Timeline signal at cut 011
    {
        previousScale = Time.timeScale;
        foreach (var a in exemptAnimators) a.updateMode = AnimatorUpdateMode.UnscaledTime;
        cinematic.timeUpdateMode = DirectorUpdateMode.UnscaledGameTime; // the timeline keeps playing
        Time.timeScale = 0f;
        Audio.PauseBuses(Bus.Sfx, Bus.Ambience, Bus.MemoryVo);          // world sound cuts instantly
        Audio.SetSnapshot("SNAP_VOID");                                  // sub-bass + high tone
        PostFX.SetGrainAnimated(false);                                  // even the grain stops
    }

    public void Resume()                              // Timeline signal at cut 040
    {
        Time.timeScale = previousScale;
        Audio.ResumeBuses(Bus.Sfx, Bus.Ambience, Bus.MemoryVo);         // everything returns in one frame
        Audio.SetSnapshot("SNAP_MEMORY");
        PostFX.SetGrainAnimated(true);
    }
}
// The void VFX uses unscaled time. Physics is not simulated in a frozen state (no rigidbody wake-ups).
```

### 25.8 NarrationService (the audio trick)
```csharp
public class NarrationService : MonoBehaviour
{
    readonly Queue<NarrationLine> queue = new();
    public void Request(NarrationLine line) => queue.Enqueue(line);

    void Update()
    {
        if (queue.Count == 0 || Voice.IsPlaying(Channel.Narration)) return;
        if (Voice.IsPlaying(Channel.Memory, minPriority: Priority.Important)) return; // never talk over the memory
        var line = queue.Dequeue();
        Audio.Duck(Bus.Music, -6f); Audio.Duck(Bus.Sfx, -3f);
        Voice.Play(Channel.Narration, line.clip, onDone: () => Audio.ReleaseDucks());
        Subtitles.Show(line.text, SubtitleStyle.Narration);
    }
}
```

---

# NEXT STEP

## 26. What to Prototype First & the Minimum Viable Implementation

### 26.1 Order of operations
1. **The Phase 1 combat core comes first** (GDD §22). Backlash runs on AbilityData/AbilityRunner, ComboGraph, and the event bus. Without them, nothing here can be built properly.
2. **Then the Backlash prototype.** It's a small, contained proof of the chapter's riskiest ideas.

### 26.2 The riskiest questions (what the prototype must answer)
| Risk | Question | Prototype answers it by |
|---|---|---|
| **Feel** | Is playing a weak, slow soldier *interesting*, or just frustrating? | Ash Eleven's moveset + Formation Bonus vs. the Knight |
| **Observe** | Is watching fun, and does Insight feel earned? | Observe + `InsightTracker` + one Insight (*Read: Charge*) |
| **Disobedience** | Does the fading order land emotionally with zero dialogue? | Trial 5's kill window + Orders UI fade |
| **Transition** | Does the door transition feel like entering a memory, with no loading screen? | CIN-00 grey-box + scene streaming + return |

### 26.3 Minimum viable implementation (grey-box, ~3–4 weeks after the combat core)
| In | Out (later) |
|---|---|
| Door transition in/out (shader + snapshot/restore of a dummy "present" scene) | Final art, LUT tuning |
| `CHR_ASH_ELEVEN`: thrust string, Brace, Demon Slash T1 drill, Observe | Full moveset, Ch 6–8 unlocks |
| 1 Line (6 × 3) with `FormationController`, fill-gap, Formation Bonus | Camp life stations |
| **Knight Hero only**, Tier 1 → Tier 3 → Tier 5 via `HeroTierData` | Saint, King A, `PartyBrain` |
| `InsightTracker` + *Read: Charge* | Other Insights |
| `OrdersSystem` with "ATTACK THE KNIGHT" + fade-on-ignore | Narration ducking polish |
| `NarrationService` with 3 placeholder lines (`VOICE_PLACEHOLDER`) | Full VO |
| Narrated-correction failure + one checkpoint | Full save integration |

**Prototype definition of done:**
1. A playtester who has never seen the design can say, unprompted, that the soldier "feels weak" and that watching the Knight "helped."
2. Countering the charge with *Read: Charge* feels like a personal achievement.
3. At least half of playtesters describe the fading order as *meaningful*, not as a bug.
4. Entering and exiting the memory takes **< 10 seconds with no loading screen**.
5. Adding a new Trial tier requires **only a new `HeroTierData` asset** (architecture check).

**Gate:** if (1) or (3) fails, we revise the soldier's feel and the Orders UI **before** building the Saint, King A, or any cinematic.


---

## Art reference: the Clergy Duo (true form)

Owner reference art plus written canon (v1.8). It applies to the Astral Path (CIN-05C), CIN-10, and every later archdemon appearance.

| | **Ghorran, the butler** | **Vaelith, the musician (maid)** |
|---|---|---|
| **Mask** | `ref-02-smiling-mask.jpg` **turned upside down**: smooth white, closed crescent eyes, a **frown** | `ref-02-smiling-mask.jpg` as drawn: smooth white, closed crescent eyes, a **smile** |
| **Hair** | `ref-01` silhouette (long, loose bangs, low ponytail to the knees). Silky **dark blue**, with **white and light-blue glossy highlights** | **Short, silky pink**, in **two ponytails**, with **light-pink glossy highlights** |
| **Outfit** | `ref-01`: black suit, white shirt, black tie, black shoes | `ref-01` jacket, shirt and tie, plus a **long black skirt slit high at the side** and **maid detailing**: short white frilled apron, frilled cuffs, lace-edged collar, small lace headdress |
| **Pose** | `ref-01`: tall, loose, hand in pocket | Upright, precise; the instrument case on her back |

Files: `docs/art/clergy-duo/ref-01-suit-and-cracked-grin-mask.jpg` (outfit, hair silhouette, pose; **its cracked-grin mask is retired**) · `docs/art/clergy-duo/ref-02-smiling-mask.jpg` (the mask both wear).

**Rules:**
- The masks never come off, and the painted faces never change.
- Silhouettes stay slim and tall. Flat black suit shapes sit against white shirts and masks, with a **rim light** on the suits so they never sink into dark backgrounds.
- Horns and wings appear only in archdemon form (the Astral Path and after). In concealed form (CIN-05B, in the castle) the masks are featureless black, and the hair is hidden under the concealment.
- Color grading follows GDD §19.6.1: bright, saturated, clean cel shading, glossy hair. On the dark Astral Path, keep the palette rich in violets and blues, never muddy black.
