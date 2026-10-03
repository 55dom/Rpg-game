# BACKLASH — Playable Flashback Design Package
### UNWRITTEN — Knights of the Last Lantern · Companion to `GDD.md` §26 · v1.0

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
- **Ep 50** opens on the return to the present.

This is the anime "flashback episode in the middle of the fight," made playable.

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
- **Night.** Cal slips out of the barracks into the forbidden caverns beneath the castle. Ancient ruins. Glyphs on the walls (the same script as Liraen's Tower murals, the glyph Cal "guessed" in Ep 8). Old hero relics. A broken helm with tally marks scratched inside, left by another soldier who once asked questions and vanished.
- **Day.** Guard duty in the throne chamber. The Demon Lord King settles a dispute between his two Commanders **without a word**: a glance, and the air bends.
- **For one cut, the camera is the King's eye**, and the player sees what he sees: a faint **★** above every soldier, ★★★ above each Commander. The King's gaze passes over Cal. One star. Nothing. He looks away.
- **Cal (internal):** ***"What exactly are you?"***

### Chapter 4: Sacrifice
A Trial goes wrong for the heroes. The demons are winning. Maelis kneels and begins a prayer that is not her healing prayer: **SACRIFICE**. Ten seconds of a voice through the chaos. The Knight shields her. King A covers them. The player's order is *STOP THE PRAYER*, and they may try. The prayer completes.

Her body dissolves into light. A mote of gold leaves her and sinks into the Knight, who flares brighter than he ever has. Three heartbeats later, a pillar of light: Maelis is reborn, kneeling, weaker. A human who died has returned. Soldiers scatter. Cal doesn't move. He has **Observed every syllable**.

Later, alone on the wall: ***"If death isn't permanent…"*** *(long pause)* ***"…what exactly is death?"***

### Chapter 5: The Final Battle
The largest Trial anyone remembers. The heroes are far stronger now: King A's arrows punch through plate, the Knight carves through lines, and Maelis keeps them standing. The Commanders **Ghorran (Left Wing)** and **Vaelith (Right Wing)** take the field. For the first time, the heroes push past the castle gates. **King A falls, permanently**, killed by Ghorran.

In the throne chamber, the King perceives the Knight's new rating: *"…Four."* For the first time, he is mildly interested. He orders every Line to hold.

Cal walks out of the line. **The player walks him** through the gate, up the castle stair, and down the long throne chamber between ranks of soldiers who do not turn. The King's gaze settles on him.

> **KING:** "Why are you here?"

Cal kneels. Control ends. He whispers ten seconds of words under his breath (to anyone listening, a vow). Then: ***"For the Demon King."*** Light. His single star leaves him and passes through the King's open hand. There is nowhere above six for it to go, so it fades. A gap in the line is filled. *"Mind the step."* White.

The player believes the flashback is over.

### Chapter 6: The Other World
Black. Silence. A heartbeat. Another. Eyes open.
- A **human** hand, thin, young. Fire everywhere: **Larkspur** burning (the cold open of Episode 1, from the other side).
- **The player has control.** The body is light, fast, fragile. There is no armor.
- And there are stars: **★ above every panicked villager**, rendered in ink. The player is seeing what only the King could see. *(Cal can see the system now.)*
- An infant crying under a fallen beam. **Above the infant: nothing.** No star. Not zero: nothing.
- Cal lifts the beam. The house collapses around him. In the fall, without thinking, he wants to be *elsewhere*, and a **golden door frame** opens beneath him. His first door. He carries the baby out of the fire.

He doesn't understand a word anyone says. **Subtitles appear as unreadable script** and resolve into language over the next chapters as he learns. He walks to a village where no one can see him for what he is, leaves the infant on an orphanage step in **Thornwick**, and walks away. (The keeper's ledger: *"brought in by a boy who didn't speak."*)

He learns:
- **Watches** a hedge-mage shout a spell; tries to copy the words; nothing happens. Opens a door in silence; it works. *Magic never needed words. Only the King knew.*
- **Watches** grimoires, knights, nobles, markets, prices, prayers, exams.

### Chapter 7: The Human
Years, in short playable vignettes:
- **The village that bars its doors.** Cal saves them from fen beasts in seconds; they lock him out anyway. Not cruelty: fear.
- **The Crimson Bell hunt.** Six inquisitors corner the grimoire-less boy with impossible magic. The player now *dismantles* them with doors, a fallen knight's saber, and the drill, which with a saber becomes **Ascended Demon Slash**. The contrast with Chapter 1 is total. He lets them live. Experiment.
- **High Chancellor Aldric Valcourt's study.** An offer: *"A weapon like you needs an owner."* (A memory **splice** flickers here: something is cut out of this scene.)
- *"Different world. Different species. Same hierarchy."*
- **The Lighthouse.** Rain. A huge, lazy man shares a bowl of stew with a wet, dangerous stranger and doesn't ask what he is. **Dagrun:** *"Nobody's written your story. Good."* For the first time in two lives, someone doesn't rank him.
- **Becoming Cal.** He picks a name for the first time in his existence: Calder. He forges a grimoire (a prop; his doors never needed one). Knighthood. Vice captain. Aurek. Rain and laughter in the Lanterns' kitchen, where he learns to whistle the march drum as a cooking tune.
- **Thornwick fence, years apart.** A child practicing sword swings with a stick. No star above them, ever.
- **The Knight Exam (Ep 2), from his seat:** *"Take the one-pager."*

### Chapter 8: The Mask
- **A conversation with a young, bitter Choir novice named Hesper.** (Another **splice**: the memory jumps.)
- **Ep 18, the Hollowmarch, from his side.** **The player walks Cal toward the door** they once watched him walk through. *"I'll hold the door. Don't wait up."* The player now knows it is the same move as the kneel.
- **The Hollow:** a space between pages. Far off, through the white, the **four-beat drum**. Demon country, on the other side.
- He cuts his way out with the drill, and it has become something else: **Godfall Demon Slash**, a single cut that splits the Hollow open. (Playable once.)
- He shapes a **mask** whose slits match a Demon Soldier faceplate. He puts it on. **A ridge in the Ashfall war (Ep 24), from his eyes:** below, Rook and the Lanterns, and a siege engine about to crush them. He opens a tear.
- **Narration:** *"And that's where you came in. Again."*

### Return to the present
The door frame folds shut. Color floods back. The debris that hung in the air at the start of the chapter **finishes falling**. Silence. No music. Cal is standing exactly where he was. Same face. Same voice. Rook stares.

> **CAL:** "So. That's how I died." *(beat; his smile grows)* "…The first time."
>
> **CAL:** *(head tilt, S4)* "Don't mistake that for a confession." *(the smirk)* "It was an introduction."

Gameplay resumes. He opens a door frame, sits on it, swings his legs, and the reveal fight enters **Phase 4: Not Serious** (GDD §15.8).

### Cal is a curated narrator
**Everything Backlash shows is true. Not everything true is shown.** Cal edits his own memory: the deal with Aldric, what he said to Hesper, why Larkspur was burning. Each cut is a visible **splice** (a door-frame flicker and one beat of missing sound). Attentive players will notice the jumps. Arc 7 fills them in (GDD Layer 10).

---

## 2. Chapter Structure

| # | Chapter | Cal | Critical path | With exploration | Gameplay / cinematic split | Ends on |
|---|---|---|---|---|---|---|
| 0 | **The Door** (present → memory) | #4 | 1 min | 1 min | 0 / 100 | Control as a soldier |
| 1 | **The Soldier** | #1 | 5 min | 9 min | 85 / 15 | *"That is enough."* |
| 2 | **The Monthly Trial** | #1 → #2 | 7 min | 9 min | 85 / 15 | The order fades |
| 3 | **The Question** | #2 | 4 min | 7 min | 75 / 25 | *"What exactly are you?"* |
| 4 | **Sacrifice** | #2 | 4 min | 5 min | 55 / 45 | *"…what exactly is death?"* |
| 5 | **The Final Battle** | #2 | 6 min | 7 min | 70 / 30 | White |
| 6 | **The Other World** | #3 | 4 min | 6 min | 80 / 20 | The orphanage step |
| 7 | **The Human** | #3 | 6 min | 9 min | 70 / 30 | *"Take the one-pager."* |
| 8 | **The Mask** | #3 → #4 | 4 min | 5 min | 70 / 30 | The tear opens |
| R | **Return** | #4 | 1 min | 1 min | 0 / 100 | The smirk → fight resumes |
| | **Total** | | **≈ 42 min** | **≈ 59 min** | **≈ 72 / 28** | |

**Pacing rules:**
- No cinematic runs longer than **90 seconds** except CIN-05 (*For the Demon King*, ~60s) and CIN-09 (*Return*, ~45s).
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
| P6.1 | 6 | **Larkspur** | Wake, escape the fire, find the infant, **carry** (one-handed: no attacks, dodge only), first door | Rebirth; the baby with no star |
| P6.2 | 6 | **Tongues** | Observe humans; Language Resolve subtitles; try to cast by speaking (fails) / silent door (works) | Discovering a new system |
| P7.1 | 7 | **Barred Doors** | Short combat vs. fen beasts (trivially easy now), then the doors close | Rejection without villainy |
| P7.2 | 7 | **The Hunt** | Combat vs. 6 Crimson Bell inquisitors; unlocks Ascended Demon Slash, Door Drop, Door Swap | Power contrast with Ch 1 |
| P7.3 | 7 | **The Lighthouse** | Walk into rain, sit, eat (one interaction) | The first kindness |
| P7.4 | 7 | **Years** | Three 40-second vignettes: the Lanterns' kitchen (whistle the tune: a single input), the Thornwick fence, the Exam seat | Becoming Cal |
| P8.1 | 8 | **The Door, from Inside** | Walk toward Ep 18's door | Layer 7, playable |
| P8.2 | 8 | **The Hollow** | Traverse white nothing toward a drum; final input: the drill → **Godfall Demon Slash** | Taste of god-like power |
| P8.3 | 8 | **The Ridge** | Stand; look down at the Lanterns; one input: open the tear | Encounter I from the other side |

---

## 4. Cinematic Sequences

| ID | Title | Length | Purpose | Storyboard |
|---|---|---|---|---|
| CIN-00 | **"You Really Want to Know?"** | 30s | Present-day setup + door transition | §21 |
| CIN-01 | **Continue Formation** | 25s | The death in the column | §21 |
| CIN-02 | **The Order Fades** | 15s | Trial 5 disobedience (mostly in-engine) | §21 |
| CIN-03 | **What Exactly Are You?** | 35s | The King's glance; first star UI (King's POV) | §21 |
| CIN-04 | **Sacrifice** | 50s | Maelis dies and is reborn | §21 |
| CIN-05 | **For the Demon King** | 60s | Cal's sacrifice (mirrors Ep 18 cut for cut) | §21 |
| CIN-06 | **Heartbeat** | 30s | Waking human in Larkspur | §21 |
| CIN-07 | **Nobody's Written Your Story** | 45s | Dagrun at the lighthouse | §21 |
| CIN-08 | **The Mask** | 35s | Shaping and putting on the mask | §21 |
| CIN-09 | **The First Time** | 45s | Return to present; the smirk | §21 |

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
| E7 | **Culling Drill** (Ch 3 morning) | **Vaelith** (sparring) | Survive 60s; optional: land one hit | Commander-tier terror; she doesn't care either way |
| E8 | **The Losing Heroes** | Hero tier 5 (weakened) | ORDER: STOP THE PRAYER; prayer completes regardless after 10s | Witness, not prevent |
| E9 | **The Breach** | Hero tier 6 + Commanders (NPC) | Reach the castle gate checkpoint | Scale and chaos |
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
| Ch 5 | **Surge** (gained star) | Tier 5 (reborn, weaker) | Pierce through plate | BREACH → castle |

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
- **Fill-Gap rule:** when a soldier dies, the nearest soldier in the row behind steps into the slot using a **step-over** animation. This is systemic, so it happens dozens of times in every battle, and the player stops noticing it. **That is the point.** The authored "Mind the step." line plays only twice in the chapter (CIN-01, CIN-05), never as a systemic bark.
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

## 10. Demon Commander Boss Behavior

The same two Commanders appear in three places: **Backlash** (sparring/NPC), the **Siege of Aurelin** (Ghorran, killed by the Sable Knight), and **Arc 7** (Vaelith, full boss). They are built once and tuned per appearance.

### 10.1 Vaelith, the Right Wing (3★): precise, cold
| Ability | Telegraph | Notes |
|---|---|---|
| Twin Flurry | Spears cross | 6-hit string |
| Wing Dash | Wings snap open | Closes 15 m instantly |
| Aerial Plunge | Rises, shadow marks landing | AoE |
| **Cull** | Spears part, 0.5s freeze | Grab. In the Backlash sparring: instant KO, ending the drill early ("*Replaceable.*") |
| Wing Wall | Wings closed | Frontal block; must be flanked |

- **Backlash (E7, Culling Drill):** survive 60s. Landing a hit is optional. She says nothing either way, which is the point.
- **Arc 7 boss (full):** P1 kit above → P2 airborne, dives with spear rain → P3 **orders a Line** (formation enemies join; break the Sergeant to stop the orders) → P4 hidden ability *Right-Hand Decree*, mirroring the King's silent cast once → Final: a dive across the chamber. Cal (ally, three-way): *"You never looked at me once."*

### 10.2 Ghorran, the Left Wing (3★): brute
| Ability | Notes |
|---|---|
| Cleave | Huge arc |
| Wing Slam | Shockwave, knockdown |
| Sky Fall | Lifts off, lands where soldiers clustered (he doesn't care) |
| Rally Roar | Buffs Lines in range |

- **Backlash (Ch 5):** NPC set piece; he kills King A.
- **Siege of Aurelin:** the Sable Knight drops him out of his own sky (GDD §15.8). Not a player boss; a spectacle.

---

## 11. Demon Lord King Encounter Design

### 11.1 In Backlash (no fight)
- **The Gaze (Ch 3, Throne Guard):** the King's attention is a slow-sweeping cone (a subtle light shift, a heartbeat in the audio, controller rumble). While it passes over Cal, the player must keep their posture: no movement but **formation pace**. Breaking pace makes nearby soldiers turn their heads. There is no fail state, only dread.
- **Silent casting, demonstrated:** the Commanders argue; the King looks at a pillar; it folds in half. No incantation, no particles: just a **distortion** in the air and the sound of stone giving way. Restraint makes it terrifying.
- **The Walk (Ch 5):** the player walks the length of the throne chamber at a constrained pace while every soldier faces forward and the King watches. Control is removed at the kneel.

### 11.2 Arc 7 boss (preview; full design in GDD §27)
| Phase | Behavior | Counterplay |
|---|---|---|
| **1: Seated** | Never stands. Casts by **looking**: wherever his gaze settles, an effect lands 0.8s later | Break line of sight (pillars, door frames) |
| **2: Command** | Orders the throne-room soldiers to sacrifice themselves into him (a buff per soldier) | **Knock soldiers out instead of killing them**: mercy reduces his power |
| **3: Standing** | For the first time in centuries, he stands. Physical combat at 6★ scale | Team attacks (Rook + Cal) |
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
| **Arc 7** | **Maelis as a guest party member:** Low Heal (protect her for 10s) and Sacrifice (once per battle, an ally gains a temporary *Star Surge*; Maelis drops a star *for real*, a permanent and heartbreaking cost the player chooses whether to accept) |
| **Arc 7 King boss, Final** | The King's own Sacrifice; Cal intercepts the transfer |
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
| **Ch 5, CIN-05** | King's POV, one cut | The ★ above Ash Eleven **leaves him**, crosses into the King's palm, and fades. *"…Four,"* he says, looking at the Knight |
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

Built on the main game's Cinemachine rig (GDD §19.5), with profile overrides. **Rule: gameplay readability beats cinematic flair in every gameplay segment.**

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

### 18.1 Buses & snapshots (FMOD)
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
Total silence is used exactly **four times**: the death in Ch 1 (one second after the body hits the ground), the white after CIN-05, the heartbeat wake in CIN-06, and the return in CIN-09. Silence is the chapter's loudest instrument. Don't spend it elsewhere.

---

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
| **Impact frames** | Combat T3, CIN-05, CIN-08 | Global post-effect (GDD §19.6) | — |

---

## 20. Animation Requirements

### 20.1 Reuse map
| Character | Source | New clips needed |
|---|---|---|
| **Ash Line Eleven (player)** | Demon Soldier enemy set (built for the Siege) | **~25**: player-quality locomotion blends, drill steps, Brace, Observe idle, formation shuffle, step-over, carry-body-glance, kneel |
| **Demon Soldiers (crowd)** | Enemy set | ~8 life-station loops |
| **Commanders** | Siege / Arc 7 sets | 0 (Vaelith sparring uses her kit) |
| **Demon Lord King** | Arc 7 set (built here first) | **~10**: seated idles, gaze turn, hand-open, stand (reserved for Arc 7) |
| **Knight Hero** | New | **~30** |
| **Goddess Saint** | New | **~15** (prayer kneel loop, rise, dissolve-ready pose, rebirth) |
| **King A** | New | **~20** |
| **Cal (youth)** | Cal companion set (Arcs 1–2), scaled | **~12**: wake, stumble-run, carry locomotion (6), first-door fall |
| **Cal (Ch 7–8)** | Cal companion + Sable sets | **~4** |
| **Liraen NPCs** | Existing | 0 |
| **Total new** | | **≈ 124 clips**, most of them hero-party combat that Arc 7 reuses |

### 20.2 Anime timing rules
- **Standard attacks:** pose-to-pose, **stepped on twos** (12 fps sampling), 8–15 keys (GDD §19.7).
- **Major attacks:** `smear → impact → held frame → recovery` (frame counts in §7.1).
- **Soldier vs. hero contrast:** soldiers are animated **stiffer and more uniform** (shared timing, little overlap), and the heroes are **looser and more expressive**. Ash Eleven starts with soldier timing. From Trial 4 onward, his idle gains small asymmetries (head tilts, weight shifts) that other soldiers don't have. **Individuality appears in the animation before it appears in the story.**
- **Held frames in cinematics:** CIN-03 (the King's glance: 18 frames held), CIN-05 cut 011 (the smile), CIN-09 (the smirk: the final held frame before control returns).

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

### CIN-05 "For the Demon King" (≈ 60s; Ch 5; mirrors GDD §19.3 cut for cut)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES | Mirrors Ep 18 |
|---|---|---|---|---|---|
| 001 | Wide: the throne chamber; endless ranks; the King on his throne; distant battle through the gate | Slow crane down | War drums beyond the walls | 3.0s / 72 | Bloom wide |
| 002 | MS: Ash Eleven kneeling at the foot of the dais (control has just ended) | Static, slight handheld | His breath inside the faceplate | 1.5s / 36 | Rook on one knee |
| 003 | CU: the King's fingers, resting, perfectly still | Snap zoom | Heartbeat | 0.8s / 19 | Bloom core |
| 004 | OTS from Ash Eleven up toward the King | Slow dolly in | INTERNAL: *"Huh."* | 2.0s / 48 | *"Huh. That's a big one."* |
| 005 | CU: Ash Eleven tilts his head, listening | **Hold pose** | The march drum: **three of its four beats**, then stops | 1.2s / 29 | Head tilt + 3 notes |
| 006 | Two-shot: the King looking down at the soldier | Static | KING: "Why are you here?" | 2.5s / 60 | *"Kid. Keep the key."* |
| 007 | ECU: the King's eye. Nothing in it | Static | Ash Eleven whispers. Under the mix: **the Saint's ten syllables** | 3.0s / 72 | Rook's widening eyes |
| 008 | Low angle: light begins at the seams of his armor | Tilt up, Dutch angle | Rising whisper | 1.8s / 43 | The door tears open |
| 009 | Wide: the ranks; nobody turns | Whip pan along the line | Silence beneath the drums | 1.2s / 29 | Door swallows the Bloom |
| 010 | MS from behind: he bows forward, *into* the light, deliberately | Tracking, slow | Armor creak | 2.0s / 48 | Cal walks toward the door |
| 011 | CU: faceplate raised. The only time we see his demon face. He is smiling | **Held frame** | ASH: ***"For the Demon King."*** | 2.5s / 60 | *"I'll hold the door. Don't wait up."* |
| 012 | MS: Vaelith glances over, mildly, and looks away | Static | — | 0.6s / 14 | Rook lunges (inverted: nobody reacts) |
| 013 | **Impact frame**: white silhouette; in one frame he stands with a hand raised, as if pushing open a door | 2-frame flash | A single soft toll | 0.15s / 4 | The door slams |
| 014 | **POV: the King's eye.** Where the soldier knelt, a lone ★ hangs in the air, then drifts into his open palm | Slow push | High resonance | 2.5s / 60 | — |
| 015 | Insert: the King's palm. The star passes *through* it and fades. There is nowhere above six for it to go | Hold | Resonance cuts off | 2.0s / 48 | The brass key |
| 016 | MS: the King lifts his eyes toward the battle | Static | KING: "…Four." *(of the Knight)* | 1.5s / 36 | — |
| 017 | Wide: a gap in the line. A soldier steps sideways to fill it | Static, held | **Total silence** | 3.5s / 84 | Empty plateau |
| 018 | Wide: the ranks face forward. A Sergeant's voice | Slow pull back | SERGEANT: ***"Mind the step."*** | 3.0s / 72 | The dark lantern |
| 019 | **White** | Fade up to white over 2s, hold | Silence | 4.0s / 96 | — |

### CIN-06 "Heartbeat" (≈ 30s; Ch 6)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Black | Hold | Silence | 3.0s / 72 |
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

### CIN-09 "The First Time" (≈ 45s; return to present)
| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | White | The golden frame **folds shut** toward camera | Door creak, reversed | 1.0s / 24 |
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
| → | **Control returns. Reveal fight Phase 4: Not Serious** (GDD §15.8) | — | CAL: "Your move." | — |

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
| **Flags written** | `BACKLASH_COMPLETE`, `BACKLASH_CHAPTER` (0–8), `BACKLASH_T4_STRATEGY`, `BACKLASH_T5_ATTACKED` (did the player try to obey), `BACKLASH_INSIGHT_COUNT`, `BACKLASH_SPLICES_NOTICED` (counts players who paused on a splice, optional telemetry), `STAR_SIGHT_SEEN_ONCE` |
| **Replay** | Lore Archive → **Relive** (replay any chapter; playable segments are playable) and **Theatre** (cinematics with frame-step and side-by-side: CIN-05 ↔ Ep 18) |

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
```

**How systems communicate:**
- `FlashbackDirector` is the only system that changes the player's identity, and it does so by swapping `CharacterData` (the same mechanism as tag-swap).
- Gameplay systems talk through **events**: `OnAbilityPerformed(tag)` → `ObserveSystem`; `OnOrderIgnored` → story flags + narration; `OnSoldierDied` → `FormationController.FillGap`; `OnPrayerCompleted` → `SacrificeResolver`.
- **Everything authored is data:** `ChapterGraph`, `HeroTierData`, `MoveTierData`, `NarrationLine` (text, trigger, priority), `MemoryProfile`.

**New data assets:**
`MEM_BACKLASH` (MemoryProfile) · `CG_BACKLASH_CH0..CH8` (ChapterGraphs) · `HTD_TRIAL_1..5, CH4, CH5` (HeroTierData) · `ABL_DEMON_SLASH_T1/T2/T3` · `CHR_ASH_ELEVEN` · `CHR_CAL_YOUTH` · `NAR_BACKLASH` (narration table) · `LANG_HUMAN_CIPHER`.

---

## 25. Example Implementation Sketches

> **These are illustrative C# sketches for Unity, not drop-in files.** They show structure and data flow. Complete, working files come once the engine is confirmed and the Phase 1 combat core (AbilityData / AbilityRunner) exists, because these systems sit on top of it.

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

### 25.7 NarrationService (the audio trick)
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
