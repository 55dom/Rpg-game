# UNWRITTEN — Knights of the Last Lantern
### Game Design Document · Foundation Draft v0.1 (awaiting approval)

> **Status:** Pre-production. No code until this foundation is approved.
> **Spoiler policy:** Sections marked 🔒 **DIRECTOR'S EYES ONLY** contain truths the player must never be told directly. They exist so the whole team writes toward the same hidden answers.

---

## OBJECTIVE

Build a stylized 3D action RPG that plays like a magical shonen anime: an underdog with a "worthless" grimoire joins the worst squad in the kingdom, grows alongside a rival, loses someone they love, and slowly discovers that the loss was never what it seemed.

Inspired by the *structure* of Black Clover (grimoires, magic knight squads, rival growth, squad-as-family, escalating arcs), with an **entirely original** world, cast, magic, and story.

**Director's pillars, ranked. When two pillars conflict, the higher one wins.**
1. **Combat feels great in the hands.** Everything else rests on this.
2. **Every character is distinct** in silhouette, magic, voice, and how they fight.
3. **Anime moments are authored.** We add spectacle on purpose, never by default.
4. **The world tells the truth.** Mysteries are fair. Clues come before answers.
5. **Small-team realistic.** We scope each feature to the smallest version that still delivers the fantasy.

---

## 1. TITLE

**UNWRITTEN — Knights of the Last Lantern**

- *Unwritten*: the protagonist's grimoire looks blank but was actually **erased**. The villains want to "unwrite" fate. And a character thought to be dead was only *written out of the story* for a while.
- *Last Lantern*: the player's squad, the Last Lanterns, sits dead last in the kingdom. Their lanterns also become the key clue in the fake-death mystery.

---

## 2. PREMISE

In the Kingdom of Liraen, every fifteen-year-old climbs the Tower of Choosing to receive a grimoire, and with it a fate. Noble children walk away with thick tomes full of spells. Everyone else gets what's left. You're an orphan from the border village of Thornwick, and your grimoire has **one page**. The rest have been scraped blank. Every magic knight squad mocks you and turns you down except the Last Lanterns, a disgraced band of misfits who work out of a lighthouse beside a sea that dried up a century ago. You set out to become the **Paragon**, the strongest knight in the realm, while your noble-born rival Severin Valcourt climbs the ranks ahead of you. But your blank pages aren't empty. *Something was written there once.* Someone is also erasing more than paper: villages are disappearing from maps and from memory, and a cult called the **Pale Choir** sings that fate itself should be unwritten.

---

## 3. CORE GAMEPLAY LOOP

The game runs in four nested loops. Each feeds the one above it.

```
┌──────────────────────────── EPISODE LOOP (30–60 min) ───────────────────────────┐
│ Cold open → Squad life → Mission briefing → Mission → Climax battle → Hook      │
│                                                                                  │
│   ┌──────────────── MISSION LOOP (10–25 min) ─────────────────┐                  │
│   │ Travel/explore → Encounters → Discovery/lore → Objective  │                  │
│   │                                                           │                  │
│   │   ┌──────── COMBAT LOOP (30 s – 3 min) ────────┐          │                  │
│   │   │ Melee builds MANA → Spells spend MANA      │          │                  │
│   │   │ → Reactions break POSTURE → Finisher       │          │                  │
│   │   │ → SURGE gauge → Ultimate / Team Attack     │          │                  │
│   │   └────────────────────────────────────────────┘          │                  │
│   └───────────────────────────────────────────────────────────┘                  │
│                                                                                  │
│   SQUAD-LIFE LOOP (between missions, at HQ): train → bond → upgrade grimoire     │
│   → spend merit on HQ → side quests → banter → read lore → next episode          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Why this loop:** melee generates mana and spells spend it, so the "magic knight" fantasy (sword plus magic) is built into the resource economy. Players are pushed to weave both together and can't turtle with spells from range.

---

## 4. PROTAGONIST

**Default name:** Rook (fully renameable). **Pronouns:** player-selected (he / she / they). All dialogue uses pronoun tokens.

| Player chooses | Implementation (cost-aware) |
|---|---|
| Name | Free text. The voice set calls the protagonist "kid", "rookie", or "Lantern", never the custom name aloud. |
| Gender / pronouns | Pronoun tokens in dialogue. Two body bases (A/B), not tied to pronoun choice. |
| Appearance | Presets: 8 faces, 12 hairstyles, color pickers for hair, eyes, and skin. **No sliders** (sliders break cel-shaded faces and the face rig). |
| Voice style | 3 voice sets per body base: *Fiery*, *Steady*, *Wry*. Barks and battle cries only. The protagonist is **not fully voiced** in dialogue (saves cost, keeps the player's tone their own). |
| Personality tendencies | Dialogue tone choices (*Bold / Earnest / Wry*) tracked as **Temper**. Temper changes reaction lines and some bond outcomes. It is **not** a morality meter. |
| Starting background | **Thornwick Orphan** (default, strongest story ties) · **Mine-town Laborer** (Bas knows you, stamina passive) · **Bastard of House Ferrow** (noble NPCs react, gives political dialogue options) |
| Magic affinity | 4 at launch: **Gale, Ember, Tide, Stone**. (More can come in DLC or updates. See Director's Note.) |
| Combat preference | Starting stance tree: **Vanguard** (heavy, armor), **Duelist** (fast, cancels), **Arcanist** (spell-weighted). All three share one sword animation set, with different combo trees and passives. |

**Why underestimated:** the grimoire shows one page, just the first spell of your affinity, while everyone else receives ten or more. You're "the One-Page Mage."

**Hidden truth (🔒):** the grimoire is a **Palimpsest**, the First Grimoire of the Scribe, erased fifteen years ago. Under the scraped surface lies **Inscription Magic**: the power to write *clauses* onto reality. It awakens in stages through the story, regardless of which affinity the player chose. **This gives us player customization *and* a fixed story identity.**

**Arc:** underdog → earns respect → loses Cal → seeks power recklessly (forbidden-page temptation) → learns that strength means protecting what's written *and* the right to rewrite it.

> **Director's Note: why only 4 affinities at launch.** Each player affinity needs a full spell kit, VFX, animations, combo-tree hooks, and balancing. 4 is the realistic ceiling for a small team. The prototype ships with **1 (Gale)**. All 30 magic types still exist in the world, used by party members, NPCs, and enemies.

---

## 5. RIVAL — Severin Valcourt

- **Magic:** Starlight (places stars and connects them into constellations). Precise, beautiful, arrogant.
- **Grimoire:** a seven-clasp tome, the most pages given in a generation.
- **Who he is:** heir of House Valcourt. Brilliant, cold in public, gentle only with his younger sister **Elodie**, who was born **grimoire-less** (a social death sentence in Liraen). His father, High Chancellor **Aldric Valcourt**, treats Severin as a political weapon.
- **Squad:** Gilded Lances, the elite noble squad.
- **Rival arc:**
  - **Arc 1:** beats you at the Knight Exam and calls you a waste of a grimoire.
  - **Arc 2:** forced to fight beside you in the Undercroft. Grudging respect. Shares a moment of grief with you after Cal's death. He was there.
  - **Arc 3:** takes a **forbidden page** to cure Elodie and becomes "Severin Eclipsed." The Arc 3 finale is a rival battle about what a fate is worth.
  - **Later:** becomes your strongest ally. Your team attack with him is the game's flagship duo technique, *Ink & Starlight*.

---

## 6. MAIN CAST

There are 12 important characters. 🔒 marks hidden truths.

| # | Character | Role | Magic | Identity & hook |
|---|---|---|---|---|
| 1 | **Rook** (player) | Protagonist | Affinity + 🔒 Inscription | The One-Page Mage. |
| 2 | **Severin Valcourt** | Rival | Starlight | See above. |
| 3 | **Captain Dagrun Holt** | Lanterns captain | Gravity | Huge, lazy, protective. Was once Paragon candidate before a scandal. Recruits you because "a one-page grimoire means nobody's written your story for you." |
| 4 | **Vice Captain Calder "Cal" Wynn** | Mentor / big sibling | Threshold | Charming, reckless, always taps his blade twice before fighting. Gives you a cheap brass key "to the snack cupboard." **The fake-death character.** |
| 5 | **Juno Quill** | Squadmate | Thread | A tailor's daughter with a sharp tongue. Thinks you're dead weight at first. Cal is like an older brother to her. Her grief arc drives Arc 3. |
| 6 | **Bastion "Bas" Okafor** | Squadmate (tank) | Stone | Former miner and a gentle giant. Mentored by Iron Warden Captain Brannoc. Trains you in defense. |
| 7 | **Lio Varnish** | Squadmate (support) | Memory | Quiet squad archivist. 🔒 A former Pale Choir novice who knows what a Palimpsest grimoire is. He joined the Lanterns to watch you. He becomes loyal, but his secret detonates in Arc 3. |
| 8 | **Tamsin Reed** | Squadmate (comic relief → hero) | Resonance | A bard who admires you openly and is a coward until they aren't. The squad's heart. |
| 9 | **Brother Moss** | Tower of Choosing caretaker | 🔒 Inscription | An old sweeper who hands you your grimoire in Ep 1 and says "Some books are better read twice." 🔒 He is 300 years old, the **Last Scribe-Keeper**, and the one who erased your grimoire. Critical in Arc 6+. |
| 10 | **Hesper Voss** | Main antagonist (Arcs 1–5) | Hollow (forbidden) | Leader of the Pale Choir. Born with a "worthless" grimoire like you. Her thesis: *grimoires are chains; erase them and humanity is free.* She is your dark mirror. |
| 11 | **High Chancellor Aldric Valcourt** | Political antagonist | Iron/Magnet | Severin's father. Secretly funds the Choir to destabilize the Crown and seize the regency. His motive is interlocked with Hesper's: she wants fate erased, he wants it *owned*. |
| 12 | **Paragon Elias Thorne** | Kingdom's strongest knight | Sunlance | Warm, unknowable, rarely present. Your goal. 🔒 He knows about the Hollow and has been losing a secret war against it for 20 years. |
| + | **Elodie Valcourt** | Severin's sister | none | Grimoire-less. Seemingly a side character. 🔒 Hollow-touched from birth. She can *hear* the Hollow, and Cal, in Arc 4. |
| + | **Captain Brannoc Steelhart** | Iron Wardens captain | Oath | A mentor figure who **truly dies** in Arc 3 (see §14 for why this matters). |

**Relationship seeds (party members interact with each other):**
- Juno ↔ Rook: dislike → grudging respect → fierce loyalty.
- Juno ↔ Severin: class tension. She sewed his family's robes as a child. They never noticed her.
- Tamsin → Rook: open admiration (*"Character C admires the protagonist"*).
- Lio: secretly knows about the Choir and the Palimpsest (*"Character D"*).
- Bas ↔ Dagrun: Bas idolizes the captain, who keeps pretending not to notice.
- Cal ↔ Dagrun: old partners. Dagrun's silence after Cal's "death" is one of the heaviest beats in the game.

---

## 7. MAGIC SYSTEM

### 7.1 Global rules

- **Mana** is a single pool for all characters. It regenerates slowly on its own and **quickly when melee hits land**.
- Every magic type has **one signature mechanic**, a verb that makes it play differently (Gravity *weighs*, Thread *connects*, Memory *replays*). This is what keeps us away from "fireball, waterball."
- Spells apply **Tags** to targets. **Reactions** happen when tags combine. This is the combo engine: we author ~12 reactions **once**, and every magic type that applies a tag can use all of them. No bespoke pairwise combos needed.
- **Weaknesses** come from *conditions*, not a rock-paper-scissors chart (e.g., Thread needs anchors, Shadow fails in noon light).

### 7.2 Tags & Reactions (data-driven reaction table)

| Tag A | + Tag B / condition | Reaction | Effect |
|---|---|---|---|
| WET | CHARGED | **Conduction** | Lightning chains to every WET target in radius |
| WET | CHILLED | **Flash Freeze** | Hard CC; next heavy hit = Shatter (bonus damage) |
| BURNING | gust (Gale) | **Firestorm** | Fire spreads along the wind vector |
| BURNING | ROOTED | **Wildfire** | Large damage over time; burns out the root |
| ASH cloud | any spark | **Flashpoint** | Cloud detonates |
| WEIGHTED | airborne | **Meteor** | Enemy slams down, AoE on landing |
| WEIGHTED | BOUND | **Crush** | Instant posture break |
| CHARGED | POLARIZED | **Railgun** | Target is fired along the magnet line |
| RESONANT | glass/crystal/frozen | **Shatter Chorus** | AoE shards |
| MARKED | any burst | **Detonate** | Consumes mark for bonus damage |
| DROWSY | any hit | **Rude Awakening** | Guaranteed crit, removes DROWSY |
| ROTTING | armor | **Corrode** | Armor permanently reduced for this fight |

**Implementation:** `ReactionTable` is a single data asset. Rows are (`TagA`, `TagB/Condition`) → `ReactionData`. Adding a magic type means picking which tags it applies. Zero new combo code.

### 7.3 The 30 magic types

Format: **Signature mechanic (resource)** · Off = Offensive · Def = Defensive · Mob = Mobility · Util = Utility/exploration · Ult = Ultimate · Awk = Awakening · Weak = Weaknesses · Combo = interactions · *Wielder*

**FORCES**

**1. Gravity**: *Weight*, stacks 1–5 on targets. At 5, pinned.
- Off: *Grav Press* (adds Weight), *Mass Driver* (flings debris), *Collapse Point* (crushing well) · Def: *Heavy Stance* (super-armor, drains mana) · Mob: *Lightstep* (reduces own gravity for long jumps and short wall-runs) · Util: lift boulders, sink floating platforms, collapse ruined floors
- Ult: *Event Horizon*, pulls everything into one point and releases a shockwave · Awk: *Starless Mass*, every hit adds Weight automatically
- Weak: slow startup; useless against incorporeal targets (smoke, spirits) · Combo: Meteor, Crush, + Tide = Undertow · *Captain Dagrun*

**2. Thread**: *Tension*, threads strung between anchor points. More anchors means more tension.
- Off: *Snare Line*, *Garrote Pull* (yanks an enemy to you or into another enemy), *Needle Rain* · Def: *Loom Wall* (web catches projectiles; at full tension, flings them back) · Mob: grapple-swing between anchors · Util: tripwires, drag levers and bridges, stitch wounds (small heal)
- Ult: *Cat's Cradle*, every enemy is linked and damage to one is shared · Awk: *Fate-Weaver*, sees attack "threads" as telegraph lines and auto-parries anchored enemies
- Weak: fire severs threads; weak in open fields with no anchors · Combo: BOUND links share reactions; Stone pillars become anchors · *Juno*

**3. Wind (Gale)**: *Updraft*. Juggling builds Updraft, which extends air time. **Prototype magic.**
- Off: *Gale Cutter* (launcher), *Vacuum Pull*, *Tempest Edge* (wind-infused sword) · Def: *Wind Wall* (deflects projectiles) · Mob: air dash, double jump, hover · Util: glide, spread gas and smoke, push objects
- Ult: *Skyrender*, launches all enemies into an aerial cinematic combo · Awk: *Eye of the Storm*, unlimited air dashes, every aerial hit spawns a cutter
- Weak: low damage on grounded heavies; WEIGHTED targets cannot be launched · Combo: Firestorm, spreads Ash/Smoke clouds · *Player affinity*

**4. Tide**: *Flow*. Water carries momentum in a direction.
- Off: *Riptide* (drags enemies along a current), *Breaker* (wave) · Def: *Undertow Ward* (redirects ground melee) · Mob: surf · Util: fill and drain, extinguish, apply WET
- Ult: *Leviathan Current*, an arena whirlpool · Awk: *Abyssal Pressure*, WET targets take crushing damage over time
- Weak: costs extra mana away from water sources; heat disperses it · Combo: enables WET for Conduction and Flash Freeze · *Player affinity*

**5. Iron / Magnet**: *Polarity*. Targets are tagged + or −. Like charges repel, opposite charges attract.
- Off: *Polar Slam* (smashes opposite-tagged enemies together), *Iron Rain* · Def: *Repulse* (repels metal attackers and projectiles) · Mob: ride magnetic rails · Util: open metal gates, strip armor (Disarm)
- Ult: *Sovereign Field*, commands all metal in the arena · Awk: *Lodestar*, the user becomes a permanent pole
- Weak: useless against non-metal beasts and spirits · Combo: Railgun · *Aldric Valcourt*

**6. Resonance (Sound)**: *Rhythm*. A subtle beat (heard in the music) rewards on-beat inputs with RESONANT stacks.
- Off: *Shatter Note*, *Chorus* (stacking damage) · Def: *Dissonance* (interrupts enemy casting) · Mob: *Echo Hop* · Util: shatter glass and crystal, echolocate hidden rooms, songs (party buffs)
- Ult: *Grand Finale* · Awk: *Perfect Pitch*, every input counts as on-beat
- Weak: silence zones; off-beat inputs lose the bonus · Combo: Shatter Chorus; + Stone = Quake · *Tamsin*

**ELEMENTS, TWISTED**

**7. Ember (Ash)**: *Heat*. Burning targets leave ASH clouds that re-ignite.
- Off: *Cinder Bolt*, *Ashfall* (cloud that explodes when struck) · Def: *Ember Veil* (melee attackers burn) · Mob: *Flare Jet* · Util: burn brambles, light braziers, cauterize
- Ult: *Pyre Bloom*, ash across the arena ignites in sequence · Awk: *Phoenix Cinder*, revive once per fight
- Weak: overheating damages the user; WET extinguishes · Combo: Firestorm, Wildfire, Flashpoint · *Player affinity*

**8. Storm**: *Charge*. CHARGED targets arc lightning to one another.
- Off: *Arc Lance*, *Thunderhead* (delayed strike) · Def: *Static Field* (stuns melee attackers) · Mob: *Bolt Step* (instant line dash) · Util: power ancient machines
- Ult: *Heaven's Verdict* · Awk: *Living Current*
- Weak: self-shocks in water; grounded by Stone walls · Combo: Conduction, Railgun · *General Varka (boss)*

**9. Frost**: *Chill*. Stacks build to FROZEN, then Shatter.
- Off: *Rime Spear*, *Frostbite* · Def: *Glacier Shell* · Mob: lays ice-slide paths · Util: freezes water into platforms
- Ult: *Absolute Winter* · Awk: *Winter's Heart*
- Weak: fire; slow to set up · Combo: Flash Freeze, Shatter Chorus · *Elite enemies / recruitable NPC*

**10. Sunlance (Light)**: *Charge-and-release*. Hold to charge; a perfect-release window gives bonus damage.
- Off: *Lance*, *Prism Volley* · Def: *Radiance* (BLINDS attackers) · Mob: *Lightspeed* (long range, long cooldown) · Util: dispels illusions and smoke, reveals invisible things
- Ult: *Noon Eternal* · Awk: *Sun Crown*
- Weak: can be interrupted while charging · Combo: + Glass = split beams · *Paragon Elias*

**11. Stone (Bastion)**: *Terrain*. Creates persistent pillars and walls (max 4 at once).
- Off: *Pillar Uppercut* (ground launcher), *Boulder Fist* · Def: *Bastion Wall* (cover for the team) · Mob: pillar vault · Util: bridges, blocks paths, climb points
- Ult: *Mountain's Oath*, a fortress closes and crushes · Awk: *Living Keep* (stone armor)
- Weak: slow; flyers; Tide erodes walls · Combo: pillars become Thread anchors and cast shadows for Shadow · *Bas / Player affinity*

**LIVING**

**12. Thorn / Bloom**: *Growth*. Seeds grow through three stages over time.
- Off: *Seedshot* (blooms into an explosion), *Bramble Lash* · Def: *Briar Hedge* · Mob: vine swing · Util: healing pollen, climbable vines
- Ult: *Verdant Cathedral* · Awk: *Evergreen*
- Weak: fire; time-dependent · Combo: ROOTED → Wildfire · *Captain Sylvie Marrow*

**13. Beast Totem**: *Aspects*. Stance-swaps limbs into Wolf, Bear, or Hawk.
- Off: Wolf (fast combos), Bear (heavy), Hawk (aerial) · Def: *Bear Hide* · Mob: Hawk glide, Wolf sprint · Util: track scents (finds clues), speak with animals
- Ult: *Great Totem*, summons a spirit beast · Awk: *Chimera*, all aspects at once
- Weak: no range; lock-in time between aspects · *Tempest Riders squad*

**14. Oath**: *Vows*. Declare a restriction ("no dodging for 15s") for big power. Breaking it costs heavily.
- Off: *Pledged Strike* · Def: *Oath of Endurance* (survive a lethal hit if the vow holds) · Mob: *Oath of Swiftness* · Util: binding contracts with NPCs (they must speak truth)
- Ult: *Final Vow*, massive damage, empties all mana · Awk: *Unbroken*
- Weak: high skill; punishing failure · *Captain Brannoc*

**15. Rot**: *Decay*. ROTTING lowers defense over time and spreads to nearby targets.
- Off: *Blight Touch*, *Rust Wave* · Def: *Decay Aura* (melts projectiles) · Mob: *Rot-walk* · Util: dissolve barriers, age objects
- Ult: *Entropy* · Awk: *Grave Bloom*
- Weak: damages the user over time; hurts allies; Bloom cleanses it · Combo: Corrode · *Common enemy magic*

**CONSTRUCTS**

**16. Paper Seal**: *Seals* that trigger on a condition (timer, contact, command).
- Off: *Blast Talisman*, *Binding Seal* · Def: *Folding Wall* · Mob: paper-crane glide · Util: seal doors and magic, store items, messages
- Ult: *Thousand Folds* · Awk: *Living Scripture*
- Weak: fire, water · Combo: MARKED triggers from any source · *Crimson Bell squad*

**17. Glass / Prism**: *Refraction*. Fragile constructs that split and redirect spells.
- Off: *Shard Storm*, *Prism* (splits an ally's beam into five) · Def: *Crystal Shell* (cracks after 3 hits) · Mob: glass slide-bridges · Util: lenses for light puzzles
- Ult: *Cathedral of Glass* · Awk: *Diamond Saint*
- Weak: shatters; Resonance · *Captain Corvina Ashgrave*

**18. Clockwork**: *Torque*. Deploys gear turrets and drones (count-limited).
- Off: *Gear Turret*, *Spring Trap* · Def: *Cog Drone* shield · Mob: spring launch pad · Util: repair machines, puzzles
- Ult: *Grand Orrery* · Awk: *Perpetual Engine*
- Weak: Storm overload; Rot · *Clockwork Magistrate (boss)*

**19. Alchemy**: *Transmute*. Hits GILD targets: heavier and slower, but brittle.
- Off: *Transmute Strike* · Def: *Gilded Skin* · Mob: *Quicksilver Step* · Util: transmute materials (ties into crafting)
- Ult: *Midas Verdict* · Awk: *Philosopher's Heart*
- Weak: consumes Reagents · *Merchant guild NPC / recruitable*

**20. Candle (Wax)**: *Wicks*. Lit candles grow stronger as they burn down, then burst.
- Off: *Wick Mark* (timed detonation), *Wax Seal* (immobilize) · Def: *Wax Shell* · Mob: *Flicker* (blink to own candle) · Util: light, timers, **life-lanterns**
- Ult: *Vigil* · Awk: *Eternal Flame*
- Weak: wind, water · *Keeper of the Hall of Lanterns.* (**This magic is what powers the knights' lanterns. See §14.**)

**MIND & PERCEPTION**

**21. Memory**: *Echoes*. Records the last 3 attacks made nearby (by anyone) and replays them.
- Off: *Recall* (replays an ally's last spell at 60%), *Haunting* (target relives its last hit taken) · Def: *Déjà Vu* (after an attack hits once, its next identical use is auto-dodged) · Mob: *Afterstep* (teleport to where you stood 3s ago) · Util: read object memories (**investigation**), reveal hidden paths
- Ult: *Total Recall*, replays every attack from the last 10 seconds at once · Awk: *Archive*, keeps up to 6 echoes between fights
- Weak: low raw damage; needs recent combat; overuse causes self-stagger · Combo: replays reactions · *Lio*

**22. Mirror**: *Reflections*. Places panes; swaps position with your reflection.
- Off: *Mirror Shard*, *Reflected Self* (copy repeats your last attack) · Def: *Perfect Reflection* (spell parry) · Mob: swap with reflection · Util: see around corners, reveal true forms
- Ult: *Hall of Mirrors* · Awk: *Other Side*
- Weak: blunt force, Resonance · *Cantor Twins (boss)*

**23. Dream**: *Drowsy*. Stacks build to sleep. Sleepwalkers attack whoever is nearest.
- Off: *Lullaby Bolt*, *Nightmare* (fear) · Def: *Mirage* (attacker hits a dream copy) · Mob: *Dreamwalk* · Util: enter NPC dreams (side quests), calm beasts
- Ult: *Endless Night* · Awk: *Lucid*
- Weak: damage wakes targets; constructs and Hollow are immune · Combo: Rude Awakening

**24. Smoke**: *Obscure*. Clouds hide actions and spawn decoys.
- Off: *Smoke Serpent* · Def: *Disperse* (become smoke) · Mob: smoke dash · Util: stealth, decoys
- Ult: *Pall* · Awk: *Wraith*
- Weak: Gale scatters it; Sunlance reveals · *Cantor Twins (boss)*

**25. Shadow**: *Anchors*. Moves between shadows and attacks from them.
- Off: *Shade Bite*, *Umbral Grasp* (holds a target by its shadow) · Def: *Fade* (brief intangibility) · Mob: shadow-step between shadow casters · Util: stealth, carry objects inside shadow
- Ult: *Midnight Choir* · Awk: *Eclipse Skin*
- Weak: bright light, open noon fields · *Silent Quill squad*

**SPACE, TIME & CONCEPT**

**26. Threshold**: *Doors*. Opens paired doorways. **Rule: a door can only be closed from the other side.**
- Off: *Slam* (door shuts through an enemy), *Drop* (opens a door under an enemy that exits in the sky) · Def: *Doorframe* (absorbs a projectile, fires it out of the paired door) · Mob: blink through doors, or leave one and return later · Util: shortcuts, cross barriers, evacuate civilians
- Ult: *Thousand Doors*, the enemy falls through door after door and is hit from every angle · Awk: *Keeper of the Threshold*, doors to adjacent *realms*
- Weak: setup time; **closing a door means stepping through it** (a tactical commitment, and the story's central clue) · *Cal*

**27. Hourglass (Sand)**: *Time Debt*. Slowing time borrows it, and the user pays later.
- Off: *Sandblade*, *Sinkhole* · Def: *Rewind* (restore HP to 3s ago, limited) · Mob: *Haste* · Util: restore ruined objects (bridges, murals)
- Ult: *Stopped Hour* (3s freeze) · Awk: *Eternity*
- Weak: after effects end, the user is slowed ("debt") · *Hidden recruitable*

**28. Starlight**: *Constellations*. Place stars, then connect 3+ into shapes (triangle = cage, line = beam).
- Off: *Star Needle*, *Constellation* · Def: *Polaris* (fixed star shield) · Mob: *Shooting Star* (dash between stars) · Util: night navigation, reveal star-locked doors
- Ult: *Firmament*, the stars form a zodiac beast · Awk: *Supernova Regalia* (corrupted variant: *Eclipse*)
- Weak: setup; stars dim in darkness and Shadow zones · Combo: stars count as MARKED · *Severin*

**RARE & FORBIDDEN**

**29. Inscription (🔒 Palimpsest)**: *Ink*. Writes clauses onto targets.
- Off: *Underline* (next hit amplified), *Strike-through* (cancels a target's buff or ability briefly) · Def: *Annotation* ("this attack misses": one guaranteed negate, long cooldown) · Mob: *Margin Step* (draw a line, dash along it) · Util: rewrite small world facts at authored spots (lock→open, ruined bridge→whole)
- Ult: *Revision*, rewinds 3 seconds, undoing damage taken but keeping damage dealt · Awk: *Under-Text* stages (§9.6)
- Weak: limited Ink; forbidden clauses raise Corruption · Combo: *Cite*, copy a tag from one enemy onto another · *Protagonist, Brother Moss*

**30. Hollow (Forbidden)**: *Erasure*. Devours mana, tags, and spells. Corrupts the user.
- Off: *Unmaking* (temporarily erases part of max HP), *Null Bite* (deletes buffs) · Def: *Null Shell* (erases incoming spells) · Mob: *Absence* · Util: erase seals and barriers… **and memories** (why villages vanish from memory)
- Ult: *Blank Page* · Awk: *Hollow Saint*
- Weak: Corruption; light (Sunlance, Candle) burns it; drains the user's lifespan · *Hesper Voss, the Warden (apparently)*

> **Director's Note: 30 types, not 30 player kits.** Only **4 player affinities + Inscription + ~8 party kits** need full moveset-grade implementation. The other ~17 are enemy and NPC kits built from the **same ability building blocks** (projectile, zone, dash, summon, tag-apply). That's how 30 magic types stays affordable.

---

## 8. GRIMOIRE SYSTEM

### 8.1 Structure
- **Loadout:** 4 active spell pages (Magic button + face buttons) · 1 Ultimate page · 2 **Margin Notes** (passives).
- **Page level I–V:** pages level up through **use** (Mastery XP), not grind menus.
- **Evolution at Level III:** each page **branches** into one of two versions (A/B). You can re-branch at HQ for a cost, so experimenting is safe.

Example: **Gale Cutter** (launcher)
- III-A **Gale Guillotine**: bigger launch, follow-up slam input.
- III-B **Twin Cutters**: two projectiles, ranged juggle tool.
- V (either branch) unlocks the "Perfect Cast" bonus window.

### 8.2 Rarity tiers

| Tier | Source | Example |
|---|---|---|
| **Common** | Level-ups, story, shops (scrolls) | *Gale Cutter, Wind Wall* |
| **Rare** | Boss first-clears, rank promotions, character quests | *Vacuum Pull* (from Hask) |
| **Legendary** | Major bosses, ancient temples, max bond quests | *Skyrender* |
| **Forbidden** | Hidden Hollow-touched sites, Pale Choir caches, villain offers | *Hollow Bite*: huge damage, costs Corruption |
| **Secret** | Hidden conditions only | see below |

### 8.3 Forbidden pages & Corruption
- Equipping or casting forbidden pages raises **Corruption (0–100)**. It is persistent and saved.
- **25:** NPC barks change, and children in Thornwick hide from you. **50:** the Crimson Bell squad starts investigating you (special encounters, Squad reputation penalties). **75:** the Hollow whispers in combat (UI distortion; forbidden damage +20%). **100:** a game-over-style "Erased" event, a scripted nightmare fight to climb back to 60.
- Cleansing exists (Verdant Oath shrines, Moss's tea) but is **slow**, so the choice to use forbidden pages matters.

### 8.4 Secret pages (examples)
| Page | Hidden condition |
|---|---|
| *Lantern's Answer* | Visit the Hall of Lanterns at night after Cal's death on 3 separate in-game days |
| *Juror's Thread* | Perfect-parry 100 attacks while Juno is in the party |
| *Second Reading* | Bring Brother Moss tea 7 times; he "remembers" a page |
| *Weight of Nothing* | Defeat Hask without ever being hit by a mud attack |
| *Star Chart* | Find all 12 constellation murals |
| *Blank Verse* | Reach Corruption 50, then cleanse to 0 |

### 8.5 Page fragments (making collectibles matter)
Scraped **under-text fragments** are hidden in the world (murals, ruins, Choir shrines). Each one restores a line of the Palimpsest, which is **lore and power together**. Collect 5 to restore an Inscription clause. This is our only "collectible" type that scales power, so it never feels like busywork.

### 8.6 Palimpsest Under-Text (story transformations)
| Stage | Unlocked | Effect |
|---|---|---|
| **Annotation** | Arc 3 finale | Inscription spells added; ink-stroke visual layer |
| **Revision** | Arc 5 | *Revision* ultimate; Ink regen in combat |
| **Unwritten** | Final arc | Full transformation; rewrite arena rules mid-boss |

---

## 9. COMBAT SYSTEM

### 9.1 Controls (gamepad-first; KB/M mirrored)

| Input | Action |
|---|---|
| □ / X | Light attack |
| △ / Y | Heavy attack (hold = charged) |
| ✕ / A | Jump |
| ○ / B | Dodge (perfect dodge if timed) |
| L1 / LB | Block (tap at impact = Parry) |
| R1 + face | Cast spell slot 1–4 |
| L1 + R1 | Ultimate (Surge gauge full) |
| L2 / LT | Team Attack (Bond gauge full, with partner) |
| D-pad | Call ally Assist / tactics |
| R3 | Lock-on |

### 9.2 Resources
- **HP**.
- **Mana:** spells. Melee hits regenerate it.
- **Posture** (enemies; visible only on elites and bosses): breaks into a **Stagger** window where finishers are allowed.
- **Surge:** fills from dealing and taking damage and from perfect actions. Spent on Ultimates.
- **Bond gauge** (party): fills from synergy (reactions, assists). Spent on Team Attacks.
- **No stamina bar.** Dodging is limited by recovery frames, not a meter. Stamina bars kill anime-pace combat.

### 9.3 Feel targets (60 Hz logic)
| Element | Target |
|---|---|
| Light attack startup | 6–8 frames |
| Dodge i-frames | 12f; **perfect dodge** = being hit inside the first 6f → 0.5s *Afterimage* slow-mo (once per 3s) |
| Parry window | 8f (Story difficulty: 14f) → *Counter* input window 20f |
| Hitstop | Light 3f · Heavy 6f · Finisher 10f · Ultimate impact 18f |
| Input buffer | 10f |
| Cancel rules | Any attack's recovery → Dodge; Light recovery → Spell; Launcher → Jump |
| Juggle decay | Each air hit increases gravity scaling (prevents infinites; Gale's Updraft offsets it) |

### 9.4 The target chain
`move → light → light → SPELL (Gale Cutter launch) → jump-cancel → air light ×2 → air DASH → air light → SPELL (Vacuum Pull) → heavy SLAM finisher`

Every arrow is a defined cancel window. If any one feels clunky, we fix the window data, not the code.

### 9.5 Combo trees (modular, not hardcoded)
A **ComboGraph** data asset per stance or character:
- **Nodes** = Moves (an `AbilityData`: animation, frames, hitboxes, effects).
- **Edges** = `input + context → next node` with context flags: `Grounded`, `Airborne`, `AfterDash`, `AfterParry`, `AfterPerfectDodge`, `TargetStaggered`.
- Spell inputs are **global edges**: any node can branch into a spell during its cancel window. Spells don't need to appear in every tree.

```
ROOT ─L→ L1 ─L→ L2 ─L→ L3 ─L→ L4 (finisher)
          │      └H→ H-Launcher ─Jump→ AIR_ROOT
          └H→ Heavy Thrust
AIR_ROOT ─L→ AL1 ─L→ AL2 ─L→ AL3 ─H→ Slam
DASH ─L→ Dash Strike ─M→ (any spell)
PARRY ─L→ Counter ─H→ Counter Finisher
ULT → Cinematic Finisher (sequence)
```
Adding a new character means building a new graph from existing node types, with **no new combat code**.

### 9.6 Defense
- **Block** reduces damage and costs no meter. Heavy enemy attacks (red glint) are **unblockable**: dodge or parry them.
- **Parry** staggers human-scale enemies and deals big posture damage to bosses.
- **Perfect dodge** grants Afterimage and opens a *Counter* link.

### 9.7 Difficulty
*Story* (wider windows, auto-combo assist), *Knight* (default), *Paragon* (enemies use more of their kits, tighter windows). Changes are made through **data multipliers**, not separate AI.

---

## 10. PARTY SYSTEM

- **Active party:** protagonist + 2 companions. The rest stay at HQ (they still gain 75% XP so they never fall behind).
- **Companions are AI-controlled**, with:
  - **Stances:** *Press* (aggressive), *Guard* (protect the player), *Support* (spells and heals).
  - **Assist Call (D-pad):** the ally immediately performs their signature move, which works as a combo extender (e.g., Bas pops a Pillar Uppercut under your juggled enemy).
  - **Team Attacks:** spend the Bond gauge for a 3–5s duo cinematic.
- **Character switching** (playing as Juno, Bas, Severin) comes **in Phase 5, for 3 core characters only**.

| Per character | Stored in `CharacterData` |
|---|---|
| Unique magic, weapon, stats | magicType, weapon, base stats + growth curve |
| Unique combat style | ComboGraph (when playable) + AI behavior profile |
| Unique ultimate & passive | AbilityData refs |
| Personality & dialogue | Yarn node set, bark set, voice set |
| Relationship level | Bond rank + per-pair affinity flags |

> **Director's Note.** Fully playable, unique movesets for 8+ party members would be the single most expensive thing in this project. AI companions with expressive Assists and Team Attacks give 80% of the fantasy at 20% of the cost.

**Party banter:** short "camp skits" (2–3 portraits, text plus voice placeholder) trigger from party composition, location, and flags. They're cheap to produce and carry huge character value.

---

## 11. BOND SYSTEM

- **Ranks 1–10:** *Stranger → Acquaintance → Comrade → Trusted → Sworn*, each spanning two ranks.
- **Raised by:** training together (HQ minigames), shared missions, conversations, gifts (each character has likes and dislikes; *no gift spam*: one gift per character per in-game day), helping in their quests, resolving conflicts, and certain dialogue choices.
- **Bond Events** (authored scenes) at ranks 2, 4, 6, 8, 10. These are the **gates**: bond cannot pass 2/4/6/8 until that event is seen.

| Rank | Unlock |
|---|---|
| 2 | Character memory (lore) + a gift preference hint |
| 3 | Passive buff when in party |
| 4 | Character quest part 1 |
| 5 | **Team Attack** with protagonist |
| 6 | Alternate ability (e.g., Juno's *Loom Wall* gains reflection) |
| 7 | Character quest part 2 / hidden lore |
| 8 | Combat line set upgrade, special Assist |
| 9 | Character quest finale |
| 10 | Awakening for that character + final Bond Event |

**Pair relationships between party members** are **authored state flags, not simulation**. For example, `JUNO_SEVERIN = HOSTILE | TRUCE | ALLIES` is set by specific quests and changes banter and team-attack availability. We track ~10 pairs total, not every possible combination.

**No romance** in the base design. The focus is friendship, rivalry, loyalty, trust, mentorship. (Revisit later if desired. It would apply to a small number of adult characters only.)

---

## 12. SQUAD SYSTEM

### 12.1 The Seven Squads of the Crown's Sigil Knights

| Squad | Captain (magic) | Philosophy | HQ | Specialty | Rivalries & politics |
|---|---|---|---|---|---|
| **Last Lanterns** (player) | Dagrun Holt (Gravity) | "Nobody's written our story. Good." | Lighthouse on the dry Sea of Marrow | Anything nobody else will take | Ranked last; disdained by the Lances; protected (quietly) by the Paragon |
| **Gilded Lances** | Corvina Ashgrave (Glass) | Nobility is duty | Sunspire, Crown Ward | Royal escort, prestige ops | Valcourt-aligned; rival squad to the Lanterns |
| **Iron Wardens** | Brannoc Steelhart (Oath) | The wall does not move | Ironhold, eastern border | Border defense | Respect the Lanterns; anti-Valcourt |
| **Verdant Oath** | Sylvie Marrow (Bloom) | Heal first, judge never | Greenhollow Abbey | Healing, cleansing | Neutral; cleanses Corruption |
| **Silent Quill** | "Nobody" (Shadow) | Know everything, say nothing | Unknown | Intelligence | 🔒 Investigating Aldric; one member is a Choir mole |
| **Tempest Riders** | Ysolde Kestrel (Beast) | Arrive first | Aerie of the Spindle | Rapid response, aerial | Friendly rivals; race contests |
| **Crimson Bell** | Ulric Graves (Seal) | Forbidden magic must be silenced | The Bell Tower | Inquisition | Will hunt a corrupted protagonist |

Each squad has a **captain, vice captain, 2–3 named members**, an HQ location, and **squad reputation**.

### 12.2 Squad Merit (the star race)
At the end of each arc, the Crown ranks squads by **Merit**. The Lanterns start last. Climbing is a visible, shonen-style goal:
- Merit unlocks **HQ upgrades**: training yard → library (lore & page research) → kitchen (meal buffs) → forge → observatory (Severin's bond events) → "Cal's door" (🔒 late-game).
- Merit rank changes how NPCs and the other squads talk to you.

### 12.3 Reputation (two axes)

**Squad Reputation** (how the Crown and the other squads see the Lanterns) and **Regional Renown** (how civilians in each region see you).

| Event | Squad Rep | Renown |
|---|---|---|
| Mission success | **+** | **+** |
| Optional objective (e.g., save the caravan) | + | **++** |
| Civilian casualties | **−** | **−−** |
| Saving an important character | **++** | + |
| Breaking laws (trespass, forbidden pages seen) | **−−** | − (varies by region; Lowmarket *likes* it) |
| Defeating a powerful enemy | **++** | **+** |
| Refusing an order to protect civilians | **−** | **++** |

The last row is intentional: **rep and renown can diverge**, which produces interesting story tension without branching.

> **Director's Note: "Create your own squad."** Recommend **cutting** founding a separate squad. It splits the emotional core (the Lanterns *are* the family). Instead, in the final arc the protagonist can **become captain** of the Lanterns, which gives the same fantasy with no duplicate systems.

---

## 13. WORLD MAP

> **Director's Note: no seamless open world.** A full seamless open world is beyond a small team and fights the episodic pacing. We build **large interconnected zones** (Tales of Arise / Kingdom Hearts / Xenoblade-style regions), each streamed in, linked by a world map and fast travel. They should feel open, with dense content in each zone.

```
                         ☁ THE SEVERED ISLES (floating) ☁
                                    │
      MERETH         SPINDLE PEAKS ─┼─ Aerie of the Spindle
  COMMONWEALTH  ─── (mountains, sky-temple)
     (west sea)            │                              ASHFALL
        │          MIRRORLAKE SAELITH ─── AURELIN ─────── DOMINION
        │          (magical lake,          (capital)        (east,
        │           drowned archive)    │ Crown Ward        enemy)
        │                               │ Guild Ward          │
    GREYWATER FENS ──── TOWER OF        │ Lowmarket       IRONHOLD
    (swamp villages)    CHOOSING        │ ▼ Undercroft   (border fort)
           │               │           (underground)
        THORNWICK ── DRY SEA OF MARROW ── Lantern Lighthouse (HQ)
     (home village)         │
                     ═══ HOLLOWMARCH ═══  (forbidden wasteland;
                            │             reality is thin)
                       ░░ THE HOLLOW ░░   (other realm; late game)
```

Every zone below has a **story, NPCs, enemies, secrets, and quests**. There are no filler zones.

| Zone | Story role | Enemies | Secrets / lore |
|---|---|---|---|
| **Thornwick** | Home. Changes as you return (rebuilt, mourning, festival) | Bandits, fen hounds | The orphan ledger shows you were "found" the same night a village called **Larkspur** vanished |
| **Tower of Choosing** | Grimoire ceremony; Brother Moss | Choir infiltrators (Arc 1) | Murals of the Scribe; a sealed floor |
| **Greywater Fens** | First missions; vanishing villages | Bog beasts, Choir acolytes | A village nobody remembers, still standing |
| **Lantern Lighthouse (HQ)** | Hub | n/a | Cal's room; the squad lanterns; the library |
| **Aurelin (capital)** | Politics, festival, Hall of Lanterns | Choir cells, Undercroft constructs | Royal archives; Valcourt estate; Lowmarket rumor network |
| **Undercroft** | Arc 2 dungeon | Clockwork, rats, Rot | The old city beneath the city |
| **Mirrorlake Saelith** | Reflects places that no longer exist | Mirror wraiths | Drowned Archive; Cal's sword (🔒 Arc 3) |
| **Spindle Peaks** / **Severed Isles** | Sky temples, Tempest Riders | Harpies, storm elementals | Constellation murals (Star Chart page) |
| **Ironhold / Ashfall front** | Arc 3 war | Ashfall soldiers, war-mages | Brannoc's last stand |
| **Hollowmarch** | The forbidden border | Hollow-touched beasts | Places where doors appear on their own (🔒) |
| **The Hollow** | Late-game realm | Erased things | Where everything unwritten goes |

---

## 14. STORY: THE FIRST THREE ARCS

Every episode follows the anime pacing template (§18). Episodes listed in brief. 🔒 = seeds whose meaning is hidden.

### ARC 1: "The One-Page Mage" (Episodes 1–8)
*Theme: being underestimated. Tone: bright, funny, a few sharp shadows.*

1. **The Tower of Choosing.** Cold open: a burning village (**Larkspur**, 🔒) and an infant's cry. Hard cut to 15 years later. Rook and Severin climb the Tower. Severin receives a seven-clasp tome; Rook receives one page. Brother Moss: *"Some books are better read twice."* 🔒 A Choir acolyte attacks the ceremony. First combat tutorial. **Hook:** the acolyte, dying, stares at Rook's grimoire: *"…It's you."*
2. **The Knight Exam.** Trials across the training grounds. **Boss 1: Severin (duel).** Every squad rejects Rook, until Dagrun yawns: *"I'll take the one-pager."*
3. **The Lighthouse with No Sea.** Squad-life episode. Meet the Lanterns. Cal teaches doors: 🔒 *"A door I open, I can only close from the other side. So don't make me close one, kid."* Dagrun explains the **squad lanterns**: 🔒 *"A Lantern goes out when the knight dies… or when their mana can't find its way home."* Cal taps his blade twice before sparring (🔒 animation tell).
4. **The Village That Wasn't There.** First mission in Greywater Fens: a village is missing from the map. **Boss 2: Hask the Bogwarden.** Choice: chase the fleeing acolyte *or* save the child **Mirren** from the bog (🔒 Mirren matters in Arc 3).
5. **Thread and Needle.** Juno-centric. She thinks you're a liability. A mission where Thread traps solve the dungeon. Ending: grudging respect.
6. **The Silence Sermon.** The Pale Choir surfaces in a fen town. **Boss 3: Deacon Ilse Marrowind** (Silence magic). Hesper Voss appears in a vision: *"They gave you one page so you'd stay small. I can give you none, and you'll be free."*
7. **Brass and Small Things.** Squad-life episode. Bond Event: Cal gives Rook the **brass key** (🔒 the anchor of his doors) as a joke. Festival prep. Lio secretly reads Rook's grimoire at night (🔒).
8. **Rust Remembers.** The Choir raises **Sir Galen the Rusted**, a long-dead Iron Warden captain, at the Tower. **Boss 4.** Mid-fight, Rook's grimoire bleeds *ink* for the first time: a single line of unreadable under-text. **Hook — WHAT HAPPENS NEXT?** Lio, alone: *"It's started. I have to tell them… no. Not yet."*

### ARC 2: "The Lantern That Went Out" (Episodes 9–18)
*Theme: family, and the cost of being a knight. Tone: escalating, warmer and darker together.*

9. **The Royal Festival.** Aurelin hub opens. Rank promotion. Severin snubs you publicly but saves a civilian you missed. First glimpse of **Elodie**.
10. **The Hall of Lanterns.** You light your lantern in the capital's great hall (every knight has one here, mirrored by their squad's lanterns). 🔒 Close-up insert: when a knight dies, their wick turns to ash.
11. **Beneath the Festival.** Children are disappearing into the **Undercroft**. Forced alliance with Severin.
12. **The Clockwork Court.** **Boss 5: The Clockwork Magistrate.** Severin shields you. Rivalry turns to respect.
13. **The Chancellor's Garden.** Political episode. Aldric Valcourt offers Rook a place in the Lances if they "give the grimoire to the Crown for study." Refusing has consequences (rep −, Valcourt hostility flag).
14. **Tamsin Sings Off-Key.** Comedy and heart. Tamsin's character beat. The Lanterns climb the Merit ranking.
15. **Two Faces of the Choir.** **Boss 6: the Cantor Twins** (Mirror & Smoke). They reveal the Choir's target: the **Hollowmarch Gate**.
16. **Night Before the March.** Squad-life episode (the "calm before" anime episode). Cal and Dagrun drinking on the lighthouse. Cal to Rook: 🔒 *"If I ever don't come back, keep the key. Doors remember who holds them."* (Played as a joke.)
17. **The Hollowmarch.** Expedition into the forbidden land. Hesper begins the **Hollow Bloom** ritual. The squad is split up.
18. **I'll Hold the Door.** **Boss 7: The Hollow Bloom.** In the final phase, the Bloom's detonation will erase Aurelin's border. Cal opens a Threshold, pushes the Bloom through, **steps through after it**, and the door slams shut in white light. Nothing remains: no body, no grimoire. His last line, spoken to Rook: 🔒 ***"I'll hold the door. Don't wait up."*** **Ending:** at the lighthouse, his lantern is dark. Credits roll silently, with no music.

### ARC 3: "Ashes and Echoes" (Episodes 19–28)
*Theme: grief, and power at any price. Tone: heavy, with light breaking through.*

19. **An Empty Chair.** The aftermath episode (§15, Phase 2). Gameplay is quiet: walk the HQ and talk to everyone. Dagrun doesn't leave his room. Juno is furious at everyone.
20. **The Iron Front.** The Ashfall Dominion invades, sensing weakness. Deployment to Ironhold beside Captain Brannoc.
21. **The Oath of Steel.** Brannoc trains Bas and Rook. Bond with Brannoc (short, intense).
22. **Ironsong.** **Boss 8: General Varka Ironsong.** Brannoc invokes *Final Vow* to end the siege and **truly dies** on-screen, body present. At the Hall of Lanterns, his **wick crumbles to ash**. (🔒 This is the contrast clue. Cal's wick did *not* crumble.)
23. **Juno's Thread.** Juno's grief quest. She knows where Cal hid his journal (🔒 Clue).
24. **The Masked Door.** In Hollowmarch villages, a masked figure, **the Warden**, appears through rifts, destroying buildings. The Crown declares him a Hollow servant.
25. **The Warden.** **Boss 9: The Warden.** He fights brilliantly, **never uses his ultimate on Rook**, and leaves through a rift that closes *behind him from inside* (🔒). He taps his blade twice before the fight. (🔒 animation tell, unannounced.)
26. **What Lio Knew.** Lio's secret explodes: he was a Choir novice sent to watch the Palimpsest. The party fractures (choice: forgive / exile temporarily. Both paths reconnect by Ep 28).
27. **Elodie's Price.** Aldric offers Severin a forbidden page to cure Elodie. Severin accepts.
28. **Eclipse.** At Mirrorlake Saelith: **Boss 10: Severin Eclipsed.** Rook's grimoire awakens its **first Under-Text stage (Annotation)**. Rook writes one clause: *"Severin comes home."* Hesper appears and takes the forbidden page's corruption away *with a smile*. She *wanted* the Palimpsest to wake. **Hook — WHAT HAPPENS NEXT?** At the lighthouse, deep night: Cal's lantern **flickers once**. No one is there to see it. (The player sees it. No dialogue.)

### Beyond Arc 3 (outline only)
- **Arc 4: "The Unanswered Door":** Elodie hears a voice in the Hollow; the Severed Isles; Aldric's coup.
- **Arc 5: "Writ of Return":** the Warden revelation (§15); the Paragon's secret war; *Revision* stage.
- **Arc 6: "The Last Scribe":** Brother Moss's truth; Larkspur and the protagonist's origin.
- **Arc 7: "Unwritten":** the Hollow Sovereign; final battle; endings.

### Long-range seeds (Ch. 1 → Ch. 8+)

| Seed | First appears | Pays off |
|---|---|---|
| Brother Moss, the sweeper | Ep 1 (one line) | Arc 6: the Last Scribe who erased your grimoire to hide it |
| "Larkspur" burning (cold open) | Ep 1 | Arc 6: your true birthplace, erased by the Hollow |
| Mirren, the fen child | Ep 4 (optional save) | Arc 3: witness to the "door-man" (Clue 5) |
| Brass key | Ep 7 | Arc 5: opens Cal's door from *this* side |
| Elodie's silence | Ep 9 | Arc 4: she can hear the Hollow |
| The dying acolyte's "It's you" | Ep 1 | Arc 5: the Choir has hunted the Palimpsest for 15 years |
| The dry Sea of Marrow | Ep 3 (scenery) | Arc 7: the Hollow drank it a century ago |

---

## 15. THE FAKE-DEATH CHARACTER: CALDER "CAL" WYNN

### 15.1 Why Cal
He's introduced early, carries the most charm, mentors the protagonist, is loved by Juno and Dagrun, and his magic (Threshold) gives a **mechanically honest** explanation for survival that the game teaches in Episode 3.

### 15.2 🔒 The truth (DIRECTOR'S EYES ONLY)
The Hollow Bloom could not be destroyed, only *moved*. Cal opened a door to the Hollow, pushed the Bloom through, and, because **a door can only be closed from the other side**, he stepped through to close it. He's been **holding it shut from inside** ever since. The **Hollow Sovereign** grafted Hollow armor and a mask onto him, making him **the Warden**, a jailer for both sides of the gate. Cal's will survives under the mask:
- The Warden's "attacks" on Hollowmarch villages were Cal **sealing tears** moments before Hollow beasts emerged. The destruction was collateral from closing doors.
- He pulls every lethal blow against Rook and his old squad.
- His lantern went dark because his mana **can't find its way home** from another realm, exactly as Dagrun said. His wick never turned to ash.

### 15.3 Five-phase structure

**Phase 1: Death (Ep 18).** A full boss battle with emotional stakes, then a scripted sacrifice (storyboarded, §19). No body. No grimoire. White light. Silence.

**Phase 2: Aftermath (Eps 19–23, with persistent effects all game).** The world must *feel* the absence:
- Cal is **removed from the party**. His Assist and Team Attacks are gone. His bond rank is frozen and shown greyed in the menu.
- **His room** at HQ stays exactly as it was. Interactable objects get new, sad descriptions.
- His **sword is missing** (lost in the blast). His **cloak** remains on its hook.
- NPC barks change for ~10 hours ("Heard about your vice captain… I'm sorry").
- **Quests change:** *Cal's Gambling Debts* (a comedy side quest) becomes *Settling Cal's Debts* (melancholy, the same NPCs). Two of his character quests become unavailable.
- Dagrun misses training scenes for two episodes. Juno uses "you" angrily in dialogue for a while.
- Lantern Lighthouse music changes key (minor), permanently, until the reveal.

**Phase 3: Strange clues (Arc 3 onward).** None of them confirm anything on its own.

**Phase 4: Investigation (optional).** A hidden **Investigation journal** page appears only after the player finds 2 clues (titled "Questions," with no mention of Cal).

**Phase 5: Revelation (Arc 5).** See §15.5.

### 15.4 Clue table

| # | Clue | Where / when | Missable? | What it *seems* to mean | What it *actually* means |
|---|---|---|---|---|---|
| 0a | *"A door I open, I can only close from the other side."* | Ep 3, tutorial line | No (but easily forgotten) | Flavor text | He *had* to step through |
| 0b | *"…or when their mana can't find its way home."* | Ep 3, Dagrun | No | Flavor text | Cal's lantern is dark because he's elsewhere |
| 0c | Cal taps his blade twice | Ep 3 onward, idle animation | Unmentioned | Character quirk | The Warden does it too |
| 0d | *"I'll hold the door. Don't wait up."* | Ep 18 | No | A heroic metaphor | Literal |
| 1 | Lio's analysis: *"There's no residue. None."* | Ep 19 | No | He was vaporized | No body, because there was no death |
| 2 | Cal's lantern wick intact vs. Brannoc's ash | Ep 22, Hall of Lanterns | **Yes** (examine both) | Nothing, if not compared | The death "rule" was never met |
| 3 | Brass key grows warm near Hollowmarch | Arc 3 onward, item text changes | **Yes** (must read the item) | Odd flavor | His door anchor is reacting |
| 4 | Cal's hidden journal: notes on "closing doors from the inside" | Ep 23, Juno's quest | Requires Juno bond 4 | He was researching his own magic | He planned for this possibility |
| 5 | Mirren: *"The door-man fixed our well. He tapped his sword twice."* | Arc 3, Hollowmarch | **Only if Mirren was saved in Ep 4** (else: a letter in Ep 24 with less detail) | A child's story about the Warden | The Warden is Cal |
| 6 | Warden never uses his ultimate on Rook; rifts close from inside | Ep 25 boss | Visible to attentive players | He's toying with you | He's protecting you |
| 7 | Memory Replay side quest: scrub Lio's reconstructed memory of Ep 18 frame by frame | Arc 3 side quest | **Yes** | Confirms the blast | At frame 42, Cal *steps* forward before the light; he isn't consumed |
| 8 | Hesper: *"You think he died? How small your idea of death is."* | Ep 28 | No | A villain taunt | Literally true |
| 9 | Unknown voice when Rook nearly dies in Ep 28: *"Not yet, kid."* | Ep 28 cutscene | No (heavily processed audio) | Rook's inner voice | Cal, through a door |
| 10 | Cal's sword embedded at a Mirrorlake shrine, a place it can't be | Arc 3 post-game exploration | **Yes** | Someone moved it as a memorial | He sent it through a door as a message |
| 11 | Cal's lantern flickers once | Ep 28 ending | No (but unexplained) | Ghost story / grief | The Hollow barrier thinned |

### 15.5 Revelation (Arc 5): "The Game Told You the Truth"
The Warden returns during the Arc 5 siege. Mid-fight, the mask cracks. Then a **Memory-montage cutscene** replays clues 0a → 0d → 2 → 6 → 7, re-cut with the truth. Every line plays *exactly as originally recorded*, but recontextualized. **No new information is added in the montage.** That's the fairness test.

**Controlled branch (Fork & Fold):**
| Investigation score | Outcome | Folds back at |
|---|---|---|
| **≥ 6 clues + Cal bond ≥ 6 before Ep 18** | "Say His Name": Rook calls him by name with the brass key in hand; Cal breaks free mid-fight; returns with Threshold intact | Arc 5 end |
| **3–5 clues** | Warden defeated and freed; Cal returns, loses an eye and the use of one arm (permanent; reduced kit) | Arc 5 end |
| **0–2 clues** | Freed, but his memories are scorched; he doesn't recognize the squad. A short quest chain rebuilds the bond | Arc 5 end |

All three paths reconnect for Arc 6, with persistent differences (Cal's kit, dialogue, an Arc 7 team attack only available on Path 1).

> **Director's Note: why Brannoc must truly die.** If no one ever really dies, players assume every death is fake. Brannoc's real, permanent death in Ep 22, with a body, a funeral, and a crumbled wick, is what makes Cal's absence *believable*. It also creates the contrast clue for observant players.

### 15.6 Story flags (persistent, saved)
```
CAL_STATE            : 0 alive | 1 "dead" | 2 warden_known | 3 warden_revealed | 4 returned
CAL_RETURN_PATH      : 0 none | 1 name | 2 injured | 3 amnesia
CAL_BOND_AT_DEATH    : int (snapshot)
CLUE_00..CLUE_11     : bool
INVESTIGATION_SCORE  : derived (count of CLUE_01..11)
MIRREN_SAVED         : bool
BRANNOC_DEAD         : bool (always true after Ep 22, kept for safety)
LIO_STATUS           : 0 trusted | 1 exiled | 2 forgiven
SEVERIN_ECLIPSED     : bool
CORRUPTION           : int 0–100
```

---

## 16. THE FIRST 10 BOSSES

Template: **P1** learn → **P2** strategy shift → **P3** arena changes → **P4** hidden ability → **Final** cinematic desperation. Not every early boss uses all phases. Phase count grows with the story.

**B1 · Severin Valcourt, the Exam Duel** (Ep 2)
- P1: Star Needles at range; teaches dodge and closing distance · P2: places stars around the arena, so lines between them become hazards
- Weak: stars dim if you knock him off his "Polaris" point · Lines: *"One page. They should've given you none."*
- Outcome: **win or lose both continue** (flag `EXAM_DUEL_WON`). Win: he's rattled, and some lines change. Lose: Dagrun recruits you *because* you got up 3 times.

**B2 · Hask the Bogwarden** (Ep 4)
- P1: submerges; mud waves apply WEIGHTED to *you* (teaches debuffs) · P2: enrages, pulls swamp logs into a barricade · P3: the bog drains (arena floor changes), revealing its soft underside
- Weak: Gale launches it out of the mud; burning the reeds blocks its submerge points
- Consequence: Fen villagers' Renown + · drops Rare page *Vacuum Pull*

**B3 · Deacon Ilse Marrowind** (Ep 6)
- P1: **Silence zones**, inside which spells can't be cast; forces melee · P2: summons Choir acolytes and hides in the choir pit · P3: bells ring across the arena; you must destroy them to break the silence · P4: she *silences your dodges* (hidden ability) for 5s windows, so parrying becomes mandatory
- Final: tries to erase the town's memory of her; Rook's grimoire resists (first hint)
- Consequence: first Pale Choir intel; a town remembers you

**B4 · Sir Galen the Rusted** (Ep 8, Arc 1 finale)
- P1: classical knight, shield and lance · P2: Rot magic corrodes your guard · P3: he collapses the Tower's floor; the fight continues on falling debris (scripted fall → catch → resume) · P4: Oath magic: *"I vowed never to fall"*, and he becomes immune to staggers until you break 3 rusted vow-seals
- Final: desperation charge across the whole Tower. The grimoire bleeds ink; Rook writes nothing yet, but the *page highlights* the seal you must hit.
- Consequence: Iron Wardens respect +; Galen's lantern (in the Hall) finally goes out (sets up the lantern rule)

**B5 · The Clockwork Magistrate** (Ep 12, Undercroft)
- P1: gavel slams, turret deployment · P2: "court in session": the arena **rotates** room by room (it's built inside a clockwork tower) · P3: you fight inside its gears · P4: it **sentences** party members, locking one AI ally in a cage you must free mid-fight
- Weak: Storm overloads; WET + CHARGED stops the gears · Consequence: Severin owes you a debt (flag); Lowmarket Renown ++

**B6 · The Cantor Twins (Vesk & Vale)** (Ep 15)
- Duo boss: Mirror (Vesk) and Smoke (Vale). Their mechanics combine: smoke hides real mirrors.
- P2: they swap magic · P3: the hall fills with smoke and mirrors and you must find the real twin · P4: kill one and the other **absorbs their magic** (enrage)
- Weak: Gale disperses smoke; Resonance shatters mirrors · Consequence: they die revealing the Hollowmarch Gate. (Or Lio can try to *read* one dying twin's memory for a lore branch.)

**B7 · The Hollow Bloom** (Ep 18, Arc 2 finale; Cal's "death")
- P1: tendrils and petal storms; Cal fighting alongside you (his strongest Assists) · P2: the Bloom **erases parts of the arena** (holes in reality) · P3: you're inside its petals in a memory-like space (Rook sees Larkspur, 🔒) · P4: it starts erasing *party members' grimoire pages*, temporarily locking your spells
- Final (scripted, interactive): you and Cal hold off the detonation (button mash → QTE-free hold input), then Cal's sacrifice cinematic (§19.3)
- Consequence: `CAL_STATE=1`; the world changes

**B8 · General Varka Ironsong** (Ep 22)
- Storm + Iron war mage on a **moving siege engine**
- P1: on the ground beneath the engine · P2: board the engine; fight on the moving deck · P3: the engine breaks apart and the arena becomes falling sections · P4: Railgun combo (Storm + Magnet) on herself, a hidden dash ability
- Final: Brannoc's *Final Vow* team attack (scripted) ends her; Brannoc dies
- Consequence: Ashfall pushed back; Iron Wardens leaderless (Bas's arc)

**B9 · The Warden** (Ep 25)
- P1: rift blinks (Threshold disguised as Hollow) · P2: drops enemies *and you* through rifts into the air (Cal's old *Drop* move) · P3: arena fills with doors and every exit leads back · P4: holds his ultimate, charging, aimed at Rook… then **turns it on a Hollow beast emerging behind you** and leaves
- He cannot be killed in this fight: at 25% HP he retreats (a fair "win" for the player, not a cheat loss)
- Consequence: Crown bounty on the Warden; `CAL_STATE=2` (for the system; the player is never told)

**B10 · Severin Eclipsed** (Ep 28, Arc 3 finale)
- P1: corrupted Starlight, where stars become black holes · P2: summons a corrupted zodiac beast · P3: Mirrorlake shows two arenas, one per reflection, and you swap sides · P4: Severin uses a forbidden *Eclipse* clause to erase your Ultimate gauge
- Final: desperation sequence. Rook falls into the lake, sinks, sees the under-text glow, and **Annotation** activates (first transformation). Combat resumes with Inscription spells for the final phase. Finish with the *Ink & Starlight* proto-team attack.
- Consequence: Severin saved; `SEVERIN_ECLIPSED=true` (permanent scar mechanic: his kit gains a dark variant); Hesper takes the corruption.

---

## 17. PROGRESSION

| Track | What it gives | How earned |
|---|---|---|
| **Level (1–60)** | HP, Mana, base stats (modest growth) | XP from combat and quests |
| **Knight Rank** (Ember → Spark → Flame → Blaze → Sun) | Unlocks mission tiers, story gates, page tiers, title in dialogue | **Promotion exams** (combat trials + interviews), a shonen staple |
| **Grimoire Mastery** | Page levels, branches | Using spells |
| **Technique Points** | Sword techniques (new combo nodes, cancels, air options) | Training at HQ with mentors (Dagrun, Bas, Brannoc) |
| **Under-Text** | Story transformations | Story milestones + fragments |
| **Bond** | Team attacks, passives, awakenings | §11 |
| **Equipment** | Weapon, Cloak, 2 Charms. **Curated items, no random affixes** | Shops, quests, bosses, forge |
| **Squad HQ** | Rooms, meal buffs, research | Squad Merit |

> **Director's Note: no Diablo-style loot.** Random affix gear would bury the meaningful choices (pages, bonds) and adds a huge balancing burden. Curated equipment with clear identities is cheaper and better for this game.

**Power gating:** story bosses set expected Level/Rank brackets. Big jumps in power come from **story moments** (transformations, awakenings), not from grinding. That keeps the shonen "earned power" feel.

---

## 18. QUEST STRUCTURE

### 18.1 Categories
- **Main Story (Episodes):** required.
- **Character Quests:** bond-gated, 3 parts each, reveal backstory and change relationships.
- **World Quests:** lore, regions, factions. Some are investigation chains (Cal's clues hide here).
- (+ **Squad Contracts:** repeatable small missions for Merit. Template-generated from data to fill gaps without hand-authoring each one.)

### 18.2 Branching model: "Fork & Fold"
Choices create **forks that fold back** into the main line within 1–2 episodes, leaving **persistent residue** (flags) that changes dialogue, available quests, items, and later outcomes. No exponential branch trees.

Example, matching your Quest A/B/C:
- If **Mirren was saved** (Ep 4) → **Quest A** "The Door-Man" (she leads you to clue 5 in person).
- If **Mirren was lost** → **Quest B** "Letters from the Fen" (her grandmother's letter delivers a weaker version of the clue).
- If the player found **Cal's journal** → **Quest C** "From the Other Side" unlocks (Memory Replay quest, clue 7).

### 18.3 Episode pacing template (24-minute anime framework)

| Beat | Anime timing | Game translation |
|---|---|---|
| **Cold open / hook** | 0:00–2:00 | Short cutscene or playable mini-scene |
| **Opening title card** | | Stylized episode title card (data-driven, cheap) |
| **Character/story development** | 2:00–8:00 | HQ / hub / dialogue / bond / squad life |
| **Mission / conflict** | 8:00–15:00 | Travel, exploration, encounters |
| **Major escalation** | 15:00–20:00 | Twist, dungeon, set piece |
| **Battle / climax** | 20:00–23:00 | Boss or major fight |
| **Ending hook** | 23:00–24:00 | Cliffhanger stinger |
| **"WHAT HAPPENS NEXT?"** | | **Next-episode preview**: 15s of re-cut shots + protagonist voice-over. Cheap: reuses existing cinematic assets |

Players can play at their own pace. The template structures *authored* content, not a timer.

---

## 19. ANIME-STYLE CINEMATIC SYSTEM

### 19.1 Three cinematic tiers

| Tier | Example | Control | Tech |
|---|---|---|---|
| **T1: Combat cues** (< 1s) | Hitstop, shake, FOV punch, impact frame, speed lines | Player keeps control | `CameraCue` + `FeedbackData` assets, triggered by ability events |
| **T2: Ultimates / Team Attacks** (3–6s) | Ultimate sequences | Temporarily taken | Timeline sequence, **skippable**, with a "short version" option after first view |
| **T3: Story cutscenes** | Episode cinematics | Full cinematic | Timeline + Cinemachine + dialogue system, built from storyboards |

### 19.2 Production pipeline (anime-adapted)
**Storyboard (5-column doc) → Animatic (Timeline with grey-box poses and temp audio) → Layout (final cameras) → Key animation → In-betweens/cleanup → FX → Lighting → Audio & voice → Compositing (post FX)**

The animatic is the most important gate. If it isn't exciting in grey-box, polishing won't save it.

### 19.3 Storyboard: Ep 18, "I'll Hold the Door" (Cal's sacrifice)

| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES (24fps) |
|---|---|---|---|---|
| 001 | Wide: the Hollow Bloom over the shattered plateau, sky bleeding white | Slow crane down | Low choir drone, wind | 3.0s / 72 |
| 002 | MS: Rook on one knee, grimoire flickering | Static, slight handheld | Ragged breathing | 1.5s / 36 |
| 003 | CU: the Bloom's core contracting | Snap zoom | Deep heartbeat, accelerating | 0.8s / 19 |
| 004 | OTS from Cal toward the Bloom | Slow dolly in | CAL: "Huh. That's a big one." | 2.0s / 48 |
| 005 | CU: Cal taps his blade twice | **Hold pose**, limited animation | Two metallic taps; music cuts | 1.2s / 29 |
| 006 | Two-shot: Cal and Rook | Cal places a hand on Rook's head | CAL: "Kid. Keep the key." | 2.5s / 60 |
| 007 | ECU: Rook's eyes widening | Static | ROOK (VO_PLACEHOLDER): "Cal, what are you…" | 1.0s / 24 |
| 008 | Low angle: Cal raises his hand; a vast door frame tears open in the air | Tilt up, Dutch angle | Reality tearing (SFX) | 1.8s / 43 |
| 009 | Wide: the door swallows the Bloom | Whip pan following the Bloom | Roar collapsing into silence | 1.2s / 29 |
| 010 | MS from behind Cal: he walks *toward* the door | Tracking shot, slow | Footsteps only | 2.0s / 48 |
| 011 | CU: Cal, turning his head back, smiling | Held frame | CAL: "I'll hold the door. Don't wait up." | 2.5s / 60 |
| 012 | MS: Rook lunging forward | Speed lines, smear frames | ROOK: "CAL!" | 0.6s / 14 |
| 013 | **Impact frame**: inverted white silhouette of the door slamming | 2-frame flash | Single massive slam | 0.15s / 4 |
| 014 | Wide: empty plateau, white mist, nothing remains | Static, held 3 seconds | **Total silence** | 3.5s / 84 |
| 015 | Insert: Rook's open palm, the brass key | Slow push in | A faint, distant ringing (🔒 the key resonating) | 2.0s / 48 |
| 016 | Wide: the lighthouse at dusk; one lantern dark | Slow pull back | Ambient wind; no music | 4.0s / 96 |

🔒 **Fairness check:** cuts 005, 006, 010, 011, 015, and 016 each contain truth. Cut 010 is the one the Memory Replay quest (clue 7) lets the player scrub.

### 19.4 Ultimate template (reusable sequence structure)
| Beat | Shot | Default length |
|---|---|---|
| Activation | Camera snaps behind the character, background desaturates | 0.4s |
| Charge | Low-angle orbit, environment reacts (debris floats, wind) | 0.8s |
| Close-up | ECU on eyes or grimoire, technique name shout | 0.6s |
| Release | Whip pan or rapid dolly through the battlefield | 0.8s |
| Impact | Impact frame (2–4f) + hitstop | 0.2s |
| Aftermath | Wide; debris, smoke, **silence beat** | 0.8s |
| Return | Blend back to the gameplay camera; damage numbers resolve | 0.4s |

Each Ultimate is a **Timeline asset with standard track slots** (Camera, Character anim, VFX, SFX, Voice, Post-FX), so building a new one is filling a template, not starting over.

### 19.5 Camera language library
Cinemachine presets, each a reusable asset: **Pan, Tilt, Dolly, Tracking, Crane, Zoom, Orbit, Handheld shake, Whip pan, Snap zoom, Dutch angle, Low angle, High angle, ECU, Wide establishing**. Storyboards reference them by name (`CAM_WHIP_PAN_FAST`), so layout is quick.

### 19.6 2D-in-3D visual language
- **Cel shading:** 2–3 tone ramp shader + rim light; **inverted-hull outlines** (cheap, controllable per material); later, SDF face shadows (anime-clean faces).
- **Impact frames:** full-screen post effect (invert / posterize / high-contrast lines), 2–4 frames.
- **Speed lines:** screen-space overlay shader driven by camera velocity or cue.
- **Smear frames:** authored smear meshes or vertex-stretch shader on major attacks only.
- **Hand-authored VFX:** flipbook textures (2D-drawn) on particles, not physically simulated effects.
- **Limited animation:** an **animation stepping** option per move. Pose playback can be sampled at 12 fps ("animating on twos") for a held, punchy anime look, while gameplay logic stays at 60 Hz. Major attacks switch to full-rate for smoothness at the key moment. **This costs almost nothing and is the single biggest "it looks like anime" lever.**

### 19.7 Animation quality tiers
| Tier | Use | Keys | Playback |
|---|---|---|---|
| **A: Standard** | Lights, locomotion, enemy basics | 8–15 key poses | Stepped (on twos) |
| **B: Major** | Heavies, spells, finishers | 20–40 | Hybrid: stepped anticipation, full-rate release |
| **C: Cinematic** | Ultimates, story | Custom | Authored per shot |

### 19.8 Accessibility
Toggles for camera shake, motion blur, impact-frame flashes (photosensitivity: impact frames are softened to a dim flash when off), speed lines, and skip/shorten Ultimates.

---

## 20. RECOMMENDED ENGINE

### Recommendation: **Unity 6 (LTS), Universal Render Pipeline (URP), C#**

| Criterion | Unity 6 + URP | Unreal 5 | Godot 4 |
|---|---|---|---|
| 3D anime visuals | ★★★★★ Large toon-shader ecosystem; many shipped anime-styled games | ★★★★ Excellent, but its default look fights stylization | ★★★ Possible, less tooling |
| Action combat | ★★★★ Custom ability system needed (we're designing one) | ★★★★★ Gameplay Ability System is built for this | ★★★ |
| Animation / cinematics | ★★★★ Animator, Timeline, Cinemachine | ★★★★★ Sequencer, Control Rig | ★★★ |
| VFX | ★★★★ Shuriken + VFX Graph | ★★★★★ Niagara | ★★★ |
| Zone streaming | ★★★★ Addressables + additive scenes | ★★★★★ World Partition | ★★★ |
| Beginner accessibility | ★★★★★ C#, huge learning corpus | ★★ C++/Blueprint complexity | ★★★★ |
| Performance on mid hardware | ★★★★★ URP is lean | ★★★ Heavy baseline | ★★★★ |
| Small-team iteration speed | ★★★★★ | ★★★ | ★★★★ |

**Why Unity:** the target is **stylized, not photoreal**, so Unreal's biggest advantage (high-end rendering) matters less. Our ability system is data-driven by design, so we don't need GAS's complexity. C# iteration speed, a lean renderer, Cinemachine/Timeline for anime camera language, and a beginner-friendly stack make Unity the most realistic tool for a solo dev or small team.

**When I'd switch to Unreal:** if you already know C++/Unreal, or if the team grows with dedicated technical artists. Tell me if either applies.

**Supporting stack:**
| Need | Choice | Why |
|---|---|---|
| Input | Unity Input System | Rebinding, gamepad + KB/M |
| Camera | Cinemachine 3 | Camera states, presets, impulse shake |
| Cinematics | Timeline | Ultimates + cutscenes |
| Dialogue | **Yarn Spinner** (free, open source) | Writer-friendly scripts, flag-driven branching, Unity integration |
| Audio | **FMOD** (free indie license under its revenue threshold) | Adaptive music layers, boss-phase transitions |
| Streaming | Addressables + additive scenes | Zones, async loading |
| Data | ScriptableObjects | Designer-editable data, no code |
| Save | JSON via versioned DTOs | Debuggable, migratable |
| Version control | Git + Git LFS | Large binary assets |

---

## 21. TECHNICAL ARCHITECTURE

### 21.1 Layered module map

```
                ┌──────────────── GAME SERVICES (singletons via ServiceLocator) ───────────────┐
                │ FlagStore · SaveService · QuestService · DialogueService · PartyService      │
                │ BondService · ReputationService · ZoneStreamer · PoolService · AudioService  │
                └──────────────────────────────────────────────────────────────────────────────┘
                                                   ▲ events (typed event bus)
INPUT ─▶ PlayerController ─▶ CombatController ─▶ AbilityRunner ─▶ Hit Detection ─▶ DamageSystem
        (move, intent)       (state machine +      (executes an      (pooled hitboxes,   (DamageRequest →
                              ComboGraph,           AbilityData       NonAlloc overlap    modifiers → tags
                              cancel windows)       timeline)         queries)            → reactions → HP/
                                    │                    │                                 Posture)
                                    ▼                    ▼                                     │
                              Animation             Feedback ◀─────────────────────────────────┘
                          (Animator + override    (FeedbackData: VFX from pool, FMOD SFX,
                           controllers, stepped    CameraCue, hitstop, rumble)
                           playback)                    │
                                                        ▼
                                                CameraDirector (Cinemachine states:
                                                Explore / Combat / LockOn / Ability / Ultimate / Cutscene)
```

### 21.2 The key idea: **everything is an Ability**
Light attacks, spells, dodges, enemy attacks, assists, and ultimates are all `AbilityData`, a list of **timed events**:

```
AbilityData "GaleCutter"
  frames: startup 10, active 6, recovery 18
  cancelWindows: [dodge @ 12+, jump @ 16+ (if hit)]
  events:
    @0   PlayAnim       "Cast_Upswing"   stepped: false
    @6   SpawnVFX       "VFX_GaleCutter_Charge"
    @10  SpawnHitbox    shape: box(1.2,2,3) offset(0,1,1.5)  damage: 40  posture: 25
                        launch: (0, 9, 0)   tags: [AIRBORNE]
    @10  CameraCue      "CUE_SmallPunch"
    @10  PlaySFX        "spell/gale/cutter"
  cost: mana 15   cooldown: 0
```
A new spell is a new data asset. New *behavior* only means writing a new **event type** (e.g., `SpawnThreshold`), which every future ability can then reuse.

### 21.3 Core data schemas (ScriptableObjects)
- **CharacterData:** id, displayName, magicType, baseStats + growth curve, weapon, comboGraph, abilities[], ultimate, passives[], aiProfile, animOverrideController, voiceSet, barkSet, dialogueNodePrefix, bondTable.
- **SpellData (extends AbilityData):** spellName, magicType, rarity, manaCost, cooldown, range, tagsApplied[], evolution {levelReq, branchA, branchB}, animation, vfx, hitEffect, cameraCue, unlockCondition.
- **EnemyData:** stats, resistTags[], posture, aiProfile, abilities[], attackTokenCost, lootTable, lod settings.
- **QuestData:** questID, category, title, requirements (flag expressions), stages[] {objectives[], onComplete setFlags[]}, dialogue refs, rewards, consequences (flag writes).
- **ReactionData:** tagA, tagB/condition, effect ability, feedback.
- **EpisodeData:** id, title card, beats[] (scenes/quests), preview sequence.

### 21.4 How systems communicate
- **Down the combat chain:** direct references (Controller → Runner → Hitbox). This is fast and explicit.
- **Across systems:** a **typed event bus** (`OnDamageDealt`, `OnReactionTriggered`, `OnFlagChanged`, `OnQuestStageChanged`). Quests don't know about combat; they listen.
- **Story state:** the **FlagStore** (`Dictionary<string,int>`) is the single source of truth. Quests, dialogue (Yarn variables bind to it), world objects (`FlagConditionalObject` toggles Cal's room props), and NPC barks all *read* it. Only quests, dialogue, and scripted events *write* it.

### 21.5 AI
- **Finite State Machine** per enemy (Idle → Approach → Engage → Attack → Recover → Stagger) + **utility scoring** for choosing *which* attack.
- **Attack Token system:** only N enemies (default 2) may attack the player at once; others circle and posture. This is essential for readable anime 1-vs-many fights *and* for performance.
- **AI LOD:** full logic within 25m; reduced tick rate (5 Hz) within 60m; dormant beyond. Companion AI uses the same framework with an "ally" profile.

### 21.6 Save system
- Versioned JSON: `{ version, player, grimoire, inventory, party, bonds, flags, quests, world, discoveries, lore, settings }`.
- **Story flags drive the fake-death storyline** (§15.6). Saves never store derived data (e.g., INVESTIGATION_SCORE is recomputed), which avoids corruption.
- Autosave at episode beats + manual slots. A **migration step** per version, so old saves survive updates.

### 21.7 Performance plan
| Area | Strategy / budget (target 60 fps @ 1080p on GTX 1660 / PS5-class) |
|---|---|
| Characters | Hero 30–50k tris + 2 LODs; enemies 8–20k; texture atlases; shared materials |
| Enemies | Max 8 active in combat; attack tokens; pooled |
| VFX | Pooled; per-spell particle budget (≤ 300 normal, ≤ 1500 ultimate); flipbooks over simulation |
| Hitboxes / projectiles | Pooled; `Physics.OverlapBoxNonAlloc` (no GC) |
| World | Zone streaming (Addressables), occlusion culling, LOD groups, baked lighting where possible |
| NPCs | Distant NPCs are animated impostors / no AI; crowds are cosmetic |
| Animation | Compression, override controllers (shared state machines), stepped playback reduces evaluation cost |
| Physics | Minimal rigidbodies; scripted debris for destruction (pooled, timed despawn) |
| Memory | Async loading; unload previous zone; audio streamed |
| GC | No allocations in combat hot paths; profile every phase |

### 21.8 Project layout (when we code)
```
Assets/_Project/
  Scripts/  Core/  Input/  Player/  Combat/  Abilities/  AI/  Camera/
            Feedback/  Story/ (Flags, Quests, Dialogue)  Party/  Save/  UI/  World/
  Data/     Characters/  Abilities/  Spells/  Enemies/  Reactions/  Quests/  Episodes/
  Art/  Animation/  VFX/  Audio/  Scenes/  Settings/
```

---

## 22. PROTOTYPE SCOPE (PHASE 1)

**Goal: prove the combat is fun with grey boxes.** If it's not fun with a capsule, art won't fix it.

**In scope**
- 1 character: protagonist (placeholder humanoid, Mixamo-style animations), **Duelist** stance.
- 1 weapon: sword. ComboGraph: L×4, L-L-H launcher, air L×3, air slam, dash strike, parry counter.
- 1 spell: **Gale Cutter** (launcher, applies AIRBORNE). Spell cancels from light attacks.
- Movement: run, jump, double jump, air dash, lock-on.
- Defense: dodge with i-frames + perfect dodge (Afterimage), block + parry.
- Health, Mana (melee regen), enemy Posture + Stagger.
- 1 enemy: **Choir Acolyte** (sword; 3 attacks incl. one unblockable), FSM AI, attack token system (spawn 3 to test it).
- 1 small arena (grey box, a couple of pillars).
- Feedback: hitstop, camera shake, basic hit VFX (pooled), placeholder SFX.
- Debug HUD: frame data, input buffer display, FPS.

**Out of scope (deliberately):** story, dialogue, party, grimoire UI, saves, cel shading, ultimates.

**Definition of done:**
1. The chain *L → L → Gale Cutter → jump-cancel → air L ×2 → air dash → air L → slam* executes reliably at 60 fps with no dropped inputs.
2. Perfect dodge and parry feel learnable within 5 minutes.
3. 3 acolytes at once stay readable (token system works).
4. Adding a second spell takes **only a new data asset + VFX**, with no code changes. (This proves the architecture.)
5. Zero GC allocations per frame in combat (Profiler verified).

---

## 23. DEVELOPMENT ROADMAP

Estimates assume **1–2 people, part-time-ish**. Every phase ends with a **go/no-go gate**.

| Phase | Content | Estimate | Gate |
|---|---|---|---|
| **0: Pre-production** | This GDD → approval; style tests (one cel-shaded character still); input + feel references | 2–3 wks | Foundation approved |
| **1: Prototype** | §22 | 6–10 wks | "Is the combat fun with grey boxes?" |
| **2: Combat Vertical Slice** | 3 characters (Rook + 2 AI companions w/ assists), 5 enemy types, 1 mini-boss (Hask), tag/reaction system, 4 spells + page evolution, Cinemachine camera states, cel-shading v1, impact frames, 1 ultimate (Skyrender), combat HUD | 3–5 months | A playable 10–15 min combat run that *feels anime* |
| **3: Story Vertical Slice** | Episodes 1–3 playable: Tower, Exam duel (B1), Lighthouse hub, Yarn dialogue, flags, saves, first storyboarded cutscenes, title cards + next-episode preview; **fake-death setup lines planted** | 4–6 months | "Does it feel like an anime episode?" Playtest with outsiders |
| **4: World** | Aurelin hub, Greywater Fens, Thornwick, Undercroft; NPCs, shops, zone streaming, squads, reputation | 6–9 months | Performance budget met in the largest zone |
| **5: Full RPG** | Progression, equipment, bonds + bond events, party switching (3 chars), crafting-lite, HQ upgrades, quests, Arc 1–2 bosses, hidden lore | 9–12 months | Arc 1 + 2 complete, content pipeline proven |
| **6: Narrative Expansion** | Arc 3+, Cal's death & clue network, Brannoc, Warden, transformations, the reveal | ongoing | — |

**Honest scope note:** a three-arc release (Episodes 1–28) is already a substantial game. Consider shipping **Arcs 1–3 as "Season 1"**. It ends on the lantern flicker, which is a perfect anime season cliffhanger. Arcs 4–7 become Season 2.

---

## 24. OVERBUILD CHECK (§33 of the brief)

| System | Necessary? | Improves gameplay? | Reusable? | Efficient? | Small-team realistic? | Expandable? | Verdict |
|---|---|---|---|---|---|---|---|
| Ability-as-data timeline | Yes | Yes | **Everything** uses it | Yes | Yes | Yes | **Core. Build first** |
| ComboGraph | Yes | Yes | All characters | Yes | Yes | Yes | **Core** |
| Tag/Reaction table | Yes | Big (emergent combos) | All magic | Yes | Yes | Yes | Phase 2 |
| 30 full player kits | No | Marginal | — | — | **No** | — | **Cut to 4 + Inscription** |
| Seamless open world | No | Marginal for this genre | — | Costly | **No** | — | **Zones instead** |
| Fully playable party | Partly | Yes | Partly | Yes | Only for 3 | Yes | **AI + Assists first; 3 playable later** |
| Bond pair simulation | No | Little vs. authored | — | — | — | — | **Authored pair flags** |
| Found-your-own-squad | No | Splits focus | — | — | No | — | **Cut → become captain** |
| Random-affix loot | No | Works against pages/bonds | — | — | No | — | **Curated gear** |
| Fake-death flag network | **Yes** (core story) | Yes | Flag system reused everywhere | Trivial | Yes | Yes | **Keep** |
| Stepped animation | Yes (style) | Yes | All moves | **Cheaper** | Yes | Yes | **Keep; huge value per cost** |
| Full voice acting | Not yet | Yes later | — | — | Not for prototype | Yes | **Placeholders (`VOICE_PLACEHOLDER`)** |

---

## NEXT STEP

**Your approval of this foundation.** Specifically, please confirm or redirect:

1. **Engine:** Unity 6 + URP + C#? (Or do you have Unreal/C++ experience that changes this?)
2. **Target platform for the prototype:** PC (Windows) first?
3. **Cast & story:** Cal as the fake-death character, Brannoc's real death, and the Palimpsest protagonist. Anything to change?
4. **Scope calls:** 4 player affinities at launch, AI companions first, zones rather than seamless open world, "Season 1" = Arcs 1–3.

Once approved, the first implementation task is **Phase 1, Step 1: project setup + input + the AbilityData / AbilityRunner core**, with complete files, exact folder locations, and setup steps in the Unity editor.
