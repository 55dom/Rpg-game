# UNWRITTEN — Knights of the Last Lantern
### Game Design Document · Foundation Draft v1.2

> **v1.5 changes:** Ghorran's hairstyle follows `ref-03` (messy, swept, long bangs; still long with the knee-length ponytail). Ties now match hair: dark blue for Ghorran, pink for Vaelith (§28).

> **v1.4 changes:** Clergy Duo revised (§28): **the same smooth white mask for both, hers smiling and his turned upside down into a frown**; Ghorran's silky dark-blue hair (white and light-blue gloss); Vaelith's short silky pink twin ponytails (light-pink gloss) and **maid detailing** on her suit and slit skirt. New **§19.6.1 Color grading** for the whole game, modeled on the anime *That Time I Got Reincarnated as a Slime*.

> **v1.3 changes:** The Clergy Duo's true look is set from owner reference art (§28, `docs/art/clergy-duo/`): black suits, white shirts, black ties, and white masks with painted, unchanging faces. The butler has long blue hair in a low ponytail and a cracked-grin mask with a red dot nose. The musician wears a long black skirt slit high at the side and a closed-eye smiling mask.

> **v1.2 changes:** **Engine changed to Babylon.js (web).** The game runs in any modern browser on PC and phones, free to build and free to host, and is playable straight from a link (§20). The tested combat core was ported from C# to JavaScript with the same rules and tests. Phase 1 Step 3 is done: hit effects, impact frames, parry → counter, perfect dodge → Afterimage, posture break → Lantern Break, synthesized sound, touch controls (`docs/DEV.md`).

> **v1.1 changes:** **Engine decided: Unity 6 LTS.** Platforms: **Windows PC** (lead) + **mobile (Android & iOS)**. Release builds compile to native C++ through **IL2CPP** (§20.2). New §20.3 (mobile design) and mobile performance budgets in §21.7. Phase 1 has started: see `docs/SETUP.md`.

> **v1.0 changes:** **The King does not wake in this game** (no King boss; sequel hook). The archdemons' secret plan is the **Rite of Waking**: sacrificing **themselves and Cal** to wake him. They never tell Cal; their excitement shows only in calm body language behind their masks. Arc 7 rebuilt around the Rite.

> **v0.9 changes:** The Backlash flashback **ends on Cal's grin**, match-cutting to the present. The player then **chooses who to play** in the rest of the reveal fight: Rook, or Cal (which opens the optional **Cal's Path**). The archdemons **don't know Cal**: they take him because he alone can move in their frozen time and speaks their language.

> **v0.8 changes:** After the Aura Sacrifice, the Demon Lord King sleeps in his coffin for **1000 years**. The archdemons treat him as a god and travel through **time and other worlds**, destroying them, to find the power to restore him. They find Cal **by accident**, and they are excited. The Siege, Arc 7, and §28 updated. Assumed (please confirm): the archdemons **wake the King early in Arc 7**.

> **v0.7 changes:** Corrected canon. The archdemons are **Ghorran and Vaelith**, the King's own Commanders, reborn when the King **sacrificed his aura** to them after defeating the Hero Party. **Cal never fights the Commanders**: the Siege of Aurelin is now led by a Line Marshal, and Arc 7's Vaelith boss is replaced by the empty places beside the throne. §28 rewritten.

> **v0.6 changes:** The Void Figures are now defined (§28): the Demon Lord King's **former** Left and Right Wing commanders, now **5★ archdemons** called **the Clergy Duo**: a butler (male) and a musician (female). Only Cal knows who they are. Backlash adds **CIN-05C "The Astral Path"**, in which they carry Cal down a dark astral tunnel with horns and wings fully revealed.

> **v0.5 changes:** **The Void Figures** added to Backlash Chapter 5 (`docs/BACKLASH.md`, CIN-05B) and to a new **§28**. Cal's sacrifice in the throne room no longer ends his demon life: he is sent back to the line at 0★, apparently dies, and is taken alive, smiling, by two calm figures in black through a hole in reality. Their nature is a deliberately unresolved mystery.

> **v0.4 changes:** Backlash is now a **30–60 minute playable flashback told by Cal himself, inside the reveal fight** (Ep 49), with a full production package in **`docs/BACKLASH.md`**. Arc 7 moved to **§27**. Arc 6 is now *"The Light Left On."* Cal's signature move is the **Demon Slash** lineage (Demon Slash → Ascended → Godfall).

> **v0.3 changes:** Cal is now a **reincarnated Demon Soldier** and the story's mastermind. §15 was rewritten (the v0.2 "tether" version is retired), and two sections were added: **§25 The Hidden Star Rating** and **§26 The Backlash Arc** (a playable flashback, plus Arc 7's three-way finale). The cast, Arcs 4–7 outline, seeds, and the Ep 1 cold open were updated.

> **v0.2 changes:** §15 rebuilt around the **Masked Survivor reveal** (Cal → the Sable Knight). Stale identity tells were removed from Arcs 1–3, Boss 9, and the Ep 18 storyboard. Added red-herring characters (Aurek Valcourt, Wraithe). Arcs 4–7 outline rewritten. The playable roster now includes Cal after the reveal.

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

- *Unwritten*: the protagonist's grimoire looks blank but was actually **erased**. The villains want to "unwrite" fate. A character thought to be dead was only *written out of the story* for a while. And 🔒 the protagonist is the one being the world's hidden rating system never wrote (§25).
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
| 4 | **Vice Captain Calder "Cal" Wynn** | Mentor / big sibling | Threshold | Calm, playful, sarcastic, endlessly curious; jokes about dying. Says "Mind the step" whenever he opens a door for someone, and whistles the same four-note tune while cooking. Gives you a cheap brass key "to the snack cupboard." **The fake-death character.** 🔒 Returns as the Sable Knight (§15). 🔒 Was once **Ash Line Eleven**, a Demon Soldier, reincarnated in Liraen (§26). The story's true mastermind. |
| 5 | **Juno Quill** | Squadmate | Thread | A tailor's daughter with a sharp tongue. Thinks you're dead weight at first. Cal is like an older brother to her. Her grief arc drives Arc 3. |
| 6 | **Bastion "Bas" Okafor** | Squadmate (tank) | Stone | Former miner and a gentle giant. Mentored by Iron Warden Captain Brannoc. Trains you in defense. |
| 7 | **Lio Varnish** | Squadmate (support) | Memory | Quiet squad archivist. 🔒 A former Pale Choir novice who knows what a Palimpsest grimoire is. He joined the Lanterns to watch you. He becomes loyal, but his secret detonates in Arc 3. |
| 8 | **Tamsin Reed** | Squadmate (comic relief → hero) | Resonance | A bard who admires you openly and is a coward until they aren't. The squad's heart. |
| 9 | **Brother Moss** | Tower of Choosing caretaker | 🔒 Inscription | An old sweeper who hands you your grimoire in Ep 1 and says "Some books are better read twice." 🔒 He is 300 years old, the **Last Scribe-Keeper**, and the one who erased your grimoire. Critical in Arc 6+. |
| 10 | **Hesper Voss** | Main antagonist (Arcs 1–5); 🔒 Cal's piece | Hollow (forbidden) | Leader of the Pale Choir. Born with a "worthless" grimoire like you. Her thesis: *grimoires are chains; erase them and humanity is free.* She is your dark mirror. |
| 11 | **High Chancellor Aldric Valcourt** | Political antagonist | Iron/Magnet | Severin's father. Secretly funds the Choir to destabilize the Crown and seize the regency. His motive is interlocked with Hesper's: she wants fate erased, he wants it *owned*. |
| 12 | **Paragon Elias Thorne** | Kingdom's strongest knight | Sunlance | Warm, unknowable, rarely present. Your goal. 🔒 He knows about the Hollow and has spent 20 years guarding the Gate Key without knowing what lies beyond it. |
| + | **Elodie Valcourt** | Severin's sister | none | Grimoire-less. Seemingly a side character. 🔒 Hollow-touched from birth. She can *hear* the Hollow (and, in Arc 4, the march drums on the other side of it). |
| + | **Captain Brannoc Steelhart** | Iron Wardens captain | Oath | A mentor figure who **truly dies** in Arc 3 (see §14 for why this matters). |
| + | **The Sable Knight** | Masked antagonist / antihero (Arcs 3–5) | "Severance" (space-cutting) | A nameless masked knight who raids Crown vaults, executes Choir agents, and fights the Lanterns three times. Players should believe he is a new character. 🔒 He is Cal (§15). |
| + | **Aurek Valcourt** | Severin's older brother, presumed dead | Starlight | Lost in the Hollowmarch six years ago; body never found. **Red herring**: players and Severin come to believe he is the Sable Knight. 🔒 He truly died, on Cal's watch. |
| + | **The Demon Lord King** | 🔒 Ruler of the Demon Continent; **asleep in his coffin for the whole game** (sequel) | Silent, wordless magic | The world's first anomaly (6★). Calm, never angry, believes nothing can challenge him (§26.5). |
| + | **Ghorran & Vaelith** | 🔒 The King's Left and Right Wing commanders | — (3★ might → 5★) | Seen only in Backlash. At its end the King pours his aura into them and they are reborn as **intelligent archdemons, a butler and a maid**: the Clergy Duo (§28). Cal never fights them. |
| + | **The Hero Party: Corin, Maelis, "King A"** | 🔒 Goddess Trial heroes (Backlash Arc, Arc 7) | Sword & shield / Saint's prayers / bow | Demon-hating heroes; the Saint's *Sacrifice* is the key to Cal's reincarnation (§26.6). |
| + | **Wraithe** | Pale Choir rift-assassin | Hollow rifts | **Red herring**: establishes "space-tearing" as a Choir technique before the Sable Knight appears. Executed by the Sable Knight in Arc 4. |

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
- Weak: Corruption; light (Sunlance, Candle) burns it; drains the user's lifespan · *Hesper Voss, Wraithe (and, apparently, the Sable Knight)*

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
- **Character switching** (tag-swap) comes **in Phase 5, for 3 core characters only: Rook, Severin, and Cal** (Cal only after his reveal in Arc 5; his kit reuses the Sable Knight boss abilities, §15.10).

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
- Merit unlocks **HQ upgrades**: training yard → library (lore & page research) → kitchen (meal buffs) → forge → observatory (Severin's bond events) → "Cal's room" (🔒 reopened after the reveal).
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

1. **The Tower of Choosing.** Cold open: a burning village (**Larkspur**, 🔒) and an infant's cry. Far off, a thin silhouette walks out of the flames carrying something (🔒 Cal, minutes after reincarnation; the reverse angle plays in Backlash Ch 6). Hard cut to 15 years later. Rook and Severin climb the Tower. Severin receives a seven-clasp tome; Rook receives one page. Brother Moss: *"Some books are better read twice."* 🔒 A Choir acolyte attacks the ceremony. First combat tutorial. **Hook:** the acolyte, dying, stares at Rook's grimoire: *"…It's you."*
2. **The Knight Exam.** Trials across the training grounds. **Boss 1: Severin (duel).** Every squad rejects Rook, until Dagrun yawns: *"I'll take the one-pager."*
3. **The Lighthouse with No Sea.** Squad-life episode. Meet the Lanterns. Cal teaches doors: 🔒 *"A door I open, I can only close from the other side. So don't make me close one, kid."* (S1) Dagrun explains the **squad lanterns**: 🔒 *"A Lantern goes out when the knight dies… or when their mana can't find its way home."* Cal jokes at dinner: *"Dying's overrated. Did it once, didn't care for it."* (🔒 D1) Cal is the sparring partner in the dodge tutorial; his AI always evades left, left, backstep (🔒 S3, never mentioned). He whistles the Lighthouse Tune while cooking (🔒 S5). First "Mind the step" (🔒 S2).
4. **The Village That Wasn't There.** First mission in Greywater Fens: a village is missing from the map. **Boss 2: Hask the Bogwarden.** Choice: chase the fleeing acolyte *or* save the child **Mirren** from the bog (🔒 in Arc 3 Mirren tells of "a black knight who fixed our well", a Sable Knight sighting that gains a second meaning after the reveal).
5. **Thread and Needle.** Juno-centric. She thinks you're a liability. A mission where Thread traps solve the dungeon. Ending: grudging respect, and she ties a red cord with her signature **Quill knot** on every Lantern's wrist, Cal's included (🔒 S6).
6. **The Silence Sermon.** The Pale Choir surfaces in a fen town. **Boss 3: Deacon Ilse Marrowind** (Silence magic). Hesper Voss appears in a vision: *"They gave you one page so you'd stay small. I can give you none, and you'll be free."*
7. **Brass and Small Things.** Squad-life episode. Bond Event: Cal gives Rook the **brass key** (🔒 the anchor of his doors) as a joke. Festival prep. Lio secretly reads Rook's grimoire at night (🔒).
8. **Rust Remembers.** The Choir raises **Sir Galen the Rusted**, a long-dead Iron Warden captain, at the Tower. **Boss 4.** Mid-fight, Rook's grimoire bleeds *ink* for the first time: a single line of unreadable under-text. **Hook — WHAT HAPPENS NEXT?** Lio, alone: *"It's started. I have to tell them… no. Not yet."*

### ARC 2: "The Lantern That Went Out" (Episodes 9–18)
*Theme: family, and the cost of being a knight. Tone: escalating, warmer and darker together.*

9. **The Royal Festival.** Aurelin hub opens. Rank promotion. Severin snubs you publicly but saves a civilian you missed. First glimpse of **Elodie**. Severin's pendant belonged to his brother **Aurek**, lost in the Hollowmarch six years ago (🔒 red herring). Juno's Lowmarket stall sells her Quill-knot cords to the public (🔒 S6 alibi).
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
23. **Juno's Thread.** Juno's grief quest. She knows where Cal hid his journal (🔒 Clue A4). At Brannoc's funeral, the Choir assassin **Wraithe** attacks through a rift in space (🔒 red herring: space-tearing is now a "Choir technique").
24. **Sable.** Ashfall's last war engine is about to crush the Lanterns when a black tear opens beneath it and it falls out of the sky (🔒 B1). A masked knight watches from the ridge, then leaves. **Sable Encounter I.** *Who the hell is that?*
25. **What Lio Knew.** Lio's secret explodes: he was a Choir novice sent to watch the Palimpsest. The party fractures (choice: forgive / exile temporarily. Both paths reconnect by Ep 28).
26. **The Vault Beneath Ironhold.** The Lanterns guard a sealed Crown vault. **Boss 9: the Sable Knight.** He breaks Bas's arm, takes a sealed artifact, and spares Rook at 25% HP. The Crown names him on bounty posters: *the Sable Knight*. **Sable Encounter II.**
27. **Elodie's Price.** Aldric offers Severin a forbidden page to cure Elodie. Severin accepts.
28. **Eclipse.** At Mirrorlake Saelith: **Boss 10: Severin Eclipsed.** Rook's grimoire awakens its **first Under-Text stage (Annotation)**. Rook writes one clause: *"Severin comes home."* Hesper appears and takes the forbidden page's corruption away *with a smile*. She *wanted* the Palimpsest to wake. **Hook — WHAT HAPPENS NEXT?** The Valcourt crypt, deep night: the Sable Knight kneels at **Aurek Valcourt's grave** and leaves a flower. (🔒 Misdirection. Players will think: *"He's Severin's brother."*)

### Beyond Arc 3 (outline only)
- **Arc 4: "The Unanswered Door" (Eps 29–38):** Aldric's coup takes shape; the Severed Isles; Severin hunts the Sable Knight, believing he is Aurek. **Sable Encounters III** (Wraithe's execution, "Mind the step"), **IV** (Aldric's convoy: *"Brother…?"*), and **V** (Sable carries Elodie out of the Hollow and places her in Rook's arms).
- **Arc 5: "Writ of Return" (Eps 39–50):** the Paragon's Gate Key; **Sable Encounter VI** (boss: *"Go home, Lantern."*); *Revision* stage; finale **The Siege of Aurelin** (Eps 47–50): the Gate opens onto the **Demon Continent**, the first demons enter Liraen, the **mask breaks**, and the player fights Cal (§15.8). Mid-fight, **Ep 49 "BACKLASH"**: Cal opens a door into his own memory, and the player *plays* his past life as a Demon Soldier and his reincarnation (30–60 min; `docs/BACKLASH.md`). **Ep 50** returns to the frozen battlefield, the smirk, and the end of the fight.
- **Arc 6: "The Light Left On" (Eps 51–58):** the aftermath. The squad under Crimson Bell suspicion; stranded Demon Soldiers in Liraen who begin asking questions; Aldric's trial; Hesper captured (*"A boy with no grimoire taught me about the Hollow."*); Cal's **Field Notes** found in the lighthouse (Layers 8–9); Brother Moss's truth; Larkspur's ruins; preparing to cross the Gate.
- **Arc 7: "Unwritten" (Eps 59–70):** the Demon Continent today; the Hero Party alliance; the Demon Lord King; Cal's last move; the Shared Star; the ending clause (§27).

### Long-range seeds (Ch. 1 → Ch. 8+)

| Seed | First appears | Pays off |
|---|---|---|
| Brother Moss, the sweeper | Ep 1 (one line) | Arc 6 ("The Light Left On"): the Last Scribe who erased your grimoire to hide it |
| "Larkspur" burning (cold open) | Ep 1 | Backlash Ch 6: the same fire from Cal's eyes; Arc 7: his arrival is what erased it |
| The silhouette carrying the infant | Ep 1 | Backlash Ch 6: it's Cal, carrying Rook |
| The Saint mural in the Tower | Ep 8 | Backlash Ch 4: it depicts the Goddess Saint's *Sacrifice* |
| Mirren, the fen child | Ep 4 (optional save) | Arc 3: witness to "the black knight who fixed our well"; reinterpreted after the reveal |
| Aurek Valcourt's pendant | Ep 9 | Arc 3–4 red herring; Backlash Ch 7 / Arc 7: Aurek was Cal's partner |
| The armored husks in the Hollowmarch | Ep 17 | Arc 5: they were Demon Soldiers |
| Brass key | Ep 7 | Arc 5 reveal, Phase 4: *"…It never had a lock."*; Arc 7: it opens his door from this side |
| Elodie's silence | Ep 9 | Arc 4: she can hear the Hollow |
| The dying acolyte's "It's you" | Ep 1 | Arc 5: the Choir has hunted the Palimpsest for 15 years |
| The dry Sea of Marrow | Ep 3 (scenery) | Arc 7: the Hollow drank it a century ago |

---

## 15. THE MASKED SURVIVOR: CAL WYNN → "THE SABLE KNIGHT" → ASH LINE ELEVEN

> 🔒 **This entire section is DIRECTOR'S EYES ONLY.** Nothing here may appear in the game, its data files, codex, loading screens, achievements, trailers, or store page before the reveal episode. See §15.11 (Leak Prevention).
>
> **Companion sections:** §25 (The Hidden Star Rating) and §26 (The Backlash Arc: Cal's past life as a Demon Soldier).

### 15.0 OBJECTIVE
The squad's beloved vice captain "dies" at the end of Arc 2. A brand-new masked figure appears in Arc 3 and becomes one of the most important characters in the late story. The player fights him multiple times without realizing who he is. His identity is revealed **at the height of the largest battle in the game**, and the reveal turns straight into **a boss fight against him**. Then the **Backlash Arc** lets the player *live* his previous life as a nameless Demon Soldier, and the final arc becomes a collision of three philosophies: the Demon Lord King's absolute power, Cal's manipulation, and Rook's bonds.

**Design goal, verbatim:** *"The game didn't trick me. The game showed me the truth, but I didn't understand what I was seeing."*

---

### 15.1 Why Cal
He is introduced early, mentors the protagonist, carries the most charm in the squad, and is loved by Juno and Dagrun. His personality (calm, playful, sarcastic, curious, jokes about dying) and his magic (Threshold: space and doors) are already exactly what the reincarnated antagonist needs. Making the beloved mentor the mastermind is also the strongest possible version of *"I've been fighting beside this guy the entire game."*

### 15.2 🔒 The complete truth (revealed in 10 layers)

**Who he really is.** Cal was once **Ash Line Eleven**, a 1★ Demon Soldier on the **Demon Continent**, serving the **Demon Lord King** (6★). He was a nobody: identical armor, no wings, no name, only a line designation. He began asking a question no demon asks: *"Why am I only supposed to obey?"* He studied the Hero Party that invaded every month in the **Goddess Trial**, watched the **Goddess Saint** use *Sacrifice* to die and be reborn, and memorized her prayer. Then he knelt before the Demon Lord King, whispered the stolen prayer disguised as a vow, said *"For the Demon King,"* and gave away the only star he had. Nothing visible happened. The King sent him back to the line at **0★**, and he was cut down at the gate by the very Knight he had once spared. He lay still. Then **time stopped**, a perfect black circle opened in the air, and **two calm figures in black suits and masks** stepped out, spoke in a language no one has ever heard, and carried him away. **He was smiling.** On a dark astral path, their disguises fell away: **archdemons**, a butler and a maid, horns and wings. 🔒 They are **Ghorran and Vaelith**, the King's own Commanders, reborn minutes earlier when the King, having defeated the Hero Party and confused for the first time by the star that passed through his palm, **sacrificed his aura** to them. Now 5★. Emptied, the King lay down in his coffin for a **thousand-year sleep**, and his archdemons, who worship him as a god, went searching through time and other worlds for a way to restore him. They found Cal by accident. Only Cal knows who they are (§28). He woke up in a human body in the ashes of a burning village in Liraen: **Larkspur**, fifteen years before the game. (Full detail: §26 and `docs/BACKLASH.md`.)

**What he did in Liraen.** In the ashes he found an infant the system could not rate at all: **Rook**. He carried the baby to Thornwick without speaking a word (he didn't know the language yet). He learned the language, customs, and magic, was feared, hunted by the Crimson Bell, and courted by Aldric Valcourt as a weapon. Dagrun Holt took him in when no one else would. He forged a grimoire (his doors need none; it's a prop), rose to vice captain, and waited for Rook to climb the Tower. At the Knight Exam, it was Cal who told Dagrun: *"Take the one-pager."*

**What he wants.** He wants to stop being a piece on the board and become the one who moves the pieces, in *both* worlds. That means understanding the Demon Lord King ("What exactly are you?"), the hidden Star Rating, and whatever writes it. The **Palimpsest** in Rook's hands is the only thing he has found that can *write* the system. He needs Rook to grow until it wakes.

**His "death" (Ep 18) was a plan.** He steered Hesper Voss toward the Hollow Bloom ritual years ago. In Ep 18 he used the Bloom as his excuse to step through a door into the Hollow, the space between worlds, exactly as he once used the Saint's prayer as an excuse to kneel. *"I'll hold the door. Don't wait up"* and *"For the Demon King"* are the same move: a sacrifice performed for an audience, with a private purpose.

**The friendship is real.** He genuinely likes Rook, Juno, Tamsin, Bas, and Dagrun. He keeps Juno's knot. He never lands a killing blow on a Lantern. To Rook, life is an adventure. To Cal, life is an experiment. Both are true at once. *"I actually liked you. I just never said I had to be on your side."*

**The 10 layers, in the order the player learns them:**

| Layer | The player learns | Where |
|---|---|---|
| 1 | He was the protagonist's friend | Arcs 1–2 |
| 2 | He apparently died | Ep 18 |
| 3 | He returns as the masked enemy | Siege of Aurelin reveal (Arc 5) |
| 4 | He knows things he shouldn't | Pre-reveal seeds (D-clues); confirmed in the reveal fight |
| 5 | He knows things no one could (Larkspur), and he was reincarnated | Reveal fight, Phase 3 → **Backlash** (Ep 49) |
| 6 | His life as a Demon Soldier | **Backlash** (playable, Ep 49; `docs/BACKLASH.md`) |
| 7 | Both of his "deaths" were exits he arranged | Backlash Ch 5 (CIN-05 + CIN-05B mirror Ep 18 shot for shot; the Void Figures take him, smiling) and Ch 8 (he walks into the Ep 18 door) |
| 8 | He was studying the world the whole time | Backlash Ch 6–7 (Observe, Language Resolve) + his **Field Notes** (Arc 6) |
| 9 | The friendship was partially genuine | Backlash Ch 7 (the Lighthouse, the one scene he won't narrate); reveal fight ending line; Field Notes; Arc 7 alliance |
| 10 | He has been manipulating events (Hesper, Aldric, the Gate, Rook's recruitment) | Arc 7 |

> **Director's Note: what changed from v0.2.** v0.2 made Cal a protector hiding from a "tether." That version is **retired**: no tether, no "Lock me up," and no Hollow Sovereign. Everything the previous brief required still holds: the disguise, the subtle clues, the reveal inside a massive battle, the piece-by-piece face reveal, the one-line confirmation, gameplay that continues immediately, and a bigger WHY after the WHO. Cal is now **playable in two ways**: as Ash Line Eleven in the Backlash Arc, and as a temporary ally against the Demon Lord King in Arc 7.

---

### 15.3 DESIGN: The Disguise Bible
Every department has rules to keep Cal and the Sable Knight from reading as the same person. All of them have a hidden truth that becomes visible in hindsight.

| Element | Cal (before) | Sable Knight (after) | Hidden truth (hindsight only) |
|---|---|---|---|
| **Name** | Calder "Cal" Wynn (the first thing he ever chose for himself) | Never speaks a name. The Crown names him **"the Sable Knight"** on bounty posters (we need *some* label for subtitles, codex, and dialogue) | He had a designation before he had a name |
| **Face** | Shown constantly | Smooth black full mask. **The face is never shown, not even in shadow** | The mask's slit pattern matches a **Demon Soldier faceplate** (players first see one on the armored husks in the Hollowmarch, Ep 17, and later in the Backlash Arc) |
| **Silhouette** | Lanky, light coat, loose hair, saber on the hip | Heavy high-collared cloak, **asymmetric left pauldron**, polearm across the back. Padding makes him look broader | Same height, exactly (never shown side by side). The pauldron is modeled on Demon Soldier armor |
| **Weapon** | Slim saber, one-handed | **A long black glaive** | It's the god-like evolution of his old Demon Soldier **ash-glaive** (§26). The saber was a disguise |
| **Magic** | **Threshold**: golden rectangular door frames, clean geometry, warm light | **Severance**: jagged black tears cut with the blade, ink-like edges, cold light | Severance tears still **close from the far side**. **Both never speak a spell name** (B9) |
| **Fighting style** | Fast, playful, one-handed, right-side lead | Heavy, economical, two-handed, **left side guarded** | **Dodge pattern unchanged: left, left, backstep**. It's a Demon Soldier formation drill (§26) |
| **Voice** | Casual, teasing, quick | Formal, clipped, few words. **Same voice actor**, processed through the mask (resonance, pitch-down) | Processing **thins slightly with each encounter** |
| **Personality on-screen** | Warm, jokes constantly | Cold toward the Choir, quiet and *amused* toward the Lanterns | Never harms a civilian; never lands a killing blow on a Lantern. He's still enjoying himself |

> **Director's Note: same voice actor, not a different one.** A different actor would make the disguise easier, but the reveal would lose its strongest moment: the instant the mask breaks, the player hears *the voice they remember*, unprocessed, for the first time in 20+ hours. Recognition has to come from the player's own memory.

---

### 15.4 DESIGN: The clue tracks (and why they must stay apart)

The danger is that the player connects "Cal might be alive" with "who is the masked knight?" too early. So the clues run on separate tracks that only meet in the reveal.

| Track | Question it raises | When | Purpose |
|---|---|---|---|
| **Track A: "Did Cal really die?"** | Very faint doubt | Arc 3, early (Eps 19–23), **before** the Sable Knight appears | Lets players grieve while leaving a fair trail |
| **Track B: "Who is the Sable Knight?"** | Loud, obvious mystery | Arc 3 Ep 24 → Arc 5 | Pointed *at red herrings* (§15.6) |
| **Bridge clues** | Link Cal ↔ Sable | Rare; each points back to something **≥ 10 hours earlier** | The only clues that connect the two |
| **Track D: "What *is* Cal?"** | Almost nothing, until the Backlash Arc | Arcs 1–2, as character texture | Pays off in reverse: the player *performs* the source in the Backlash Arc and recognizes it |

**Clue rules (every writer, animator, and composer follows these):**
1. **Every clue ships with an alibi**: an in-world reason the player can dismiss it.
2. **No clue confirms on its own.** Only the combination does, and only in hindsight.
3. **Bridge clues are never placed within 10 hours of their source**, so the player must genuinely remember.
4. **Nothing is ever pointed at.** No camera push-ins, sound stingers, or UI highlights on a clue before the reveal.
5. **After the reveal, the game never explains the clues either.** The Lore Archive lets players rediscover them (§15.10).

---

### 15.5 CONTENT: The Clue Ledger

**Seeds (Arcs 1–2, while Cal is alive). Planted as character texture, never as plot.**

| Seed | Where | How it appears | 🔒 Backlash payoff (§26) |
|---|---|---|---|
| **S1. "A door I open, I can only close from the other side."** | Ep 3, Cal's Threshold tutorial | A gameplay rule, stated once | — |
| **S2. "Mind the step."** | Eps 3–17: Cal's incidental bark whenever he opens a door for someone (~8 times) | A throwaway catchphrase, a pun on his doors | **It's the order demon commanders give when a column marches over its own dead** |
| **S3. The dodge pattern: left, left, backstep** | Ep 3: Cal is the **sparring partner** in the dodge tutorial; his AI always evades in this pattern | Pure animation; never mentioned | **The Demon Soldier formation drill: "Left. Left. Back. Cut."** The player performs it in Backlash Ch 1; its finisher is the **Demon Slash** |
| **S4. Head tilt** | All Cal dialogue: he tilts his head right when listening | Pure animation | Soldiers on the Demon Continent tilt their heads toward the rank speaking to them |
| **S5. The Lighthouse Tune**: four notes Cal whistles while cooking | Eps 3, 7, 16 (HQ ambient scenes) | Diegetic whistling; never named | **The Demon Army's four-beat march cadence** |
| **S6. Juno's knots**: red cords with the unique **"Quill knot"** | Ep 5: Juno ties one on every Lantern's wrist, Cal's included. Ep 9: Juno **sells** the same cords at a Lowmarket stall | Squad bonding + a side hustle | — (Layer 9: he kept it) |
| **S7. The brass key** that "opens the snack cupboard" | Ep 7 bond event. (The cupboard has no lock. Cal makes the joke; Rook never tries it) | A gag gift | Arc 7: it opens *his* door from this side |
| **S8. "I'll hold the door. Don't wait up."** | Ep 18, final words | A heroic metaphor | Mirrors *"For the Demon King"* |

**Track D: "What *is* Cal?" (Arcs 1–2, from your foreshadowing list). Each one has an alibi.**

| # | Clue | Where | Alibi | 🔒 Truth |
|---|---|---|---|---|
| D1 | **Jokes about dying:** *"Dying's overrated. Did it once, didn't care for it."* | Ep 3, first dinner | It's a joke; everyone laughs | Literal |
| D2 | **Calls people "soldier":** *"Up, soldier."* to Bas; *"Good soldier"* to Rook after a win | Arcs 1–2 barks | He's a vice captain; military slang | Old habit from the line |
| D3 | **Never speaks a spell name.** Every Liraen mage shouts their spell; Cal just opens doors. *"Shouting's for show-offs. I'm shy."* | All Cal combat | It's a personality quirk | Silent casting is the Demon Lord King's hallmark (§25). Cal learned that magic doesn't need words by watching him |
| D4 | **His grimoire never glows** when he casts (everyone else's does), seen only in close-up animations | Arcs 1–2 | *"It's a cheap old book. The light broke."* | It's a prop. His magic needs no grimoire |
| D5 | **Reads an ancient glyph aloud** in the Tower ruins, then covers: *"Guessed. Sounds like a word, right?"* | Ep 8 | Lucky guess / joke | Demon script; the same glyphs exist on the Demon Continent |
| D6 | **Stares at the Saint mural** in the Tower (a kneeling woman beneath stars) for too long | Ep 8 | Tamsin: *"Never took you for an art lover."* | It depicts the Goddess Saint's Sacrifice |
| D7 | **Names a battle formation** nobody uses: *"Spear-wall, three lines deep, marshal at the rear. Nobody fights like that anymore."* | Ep 15 (squad strategy scene) | He's well read | It's the Demon Army formation the player faces in the Siege of Aurelin |
| D8 | **Reacts to the armored husks** (dark red and black armor) in the Hollowmarch: closes one's visor, murmurs *"Rest, soldier."* | Ep 17 | Knights say that to the fallen | They were Demon Soldiers who fell through the Hollow |
| D9 | **Watches the sky after battles** | Arcs 1–2, post-fight idle | He's a daydreamer | On the Demon Continent, commanders came from the sky |
| D10 | **Talks like he remembers another life:** *"Where I grew up, nobody had names. Just numbers."* | Ep 16 (night before the march) | Everyone assumes a slum orphanage | Literal |
| D11 | **Unusual interest in coming back from death:** asks Rook *"If you could die and come back stronger, would you?"* | Ep 7 bond event | A late-night hypothetical | He already did |
| D12 | **Knows things he shouldn't:** at the Knight Exam he bets Dagrun that the one-pager will get up three times, before Rook has fought | Ep 2 | He's a gambler | He has been watching Rook for fifteen years |

**Track A: "Did Cal really die?" (Arc 3, early). Faint doubt, always with an alibi.**

| # | Clue | Missable? | Alibi (why players dismiss it) |
|---|---|---|---|
| A1 | Lio: *"There's no residue. None."* | No | "The Bloom erased him completely." The scene plays it as horror |
| A2 | In the Hall of Lanterns, Cal's wick is dark but **whole**. Brannoc's (Ep 22) **crumbles to ash** | **Yes** (examine both) | The Hall Keeper: *"Those lost beyond the border sometimes keep their wicks. The Hollow takes the ash too."* |
| A3 | The brass key is warm when you're near the Hollowmarch (item text changes) | **Yes** (read the item) | The Hollowmarch makes all metal warm (the item text for several other items changes there too) |
| A4 | Cal's hidden journal: notes on "what happens to a door-maker who stays on the wrong side" | Juno's quest (bond 4) | Read as *why he knew he'd die* |
| A5 | Lio's memory reconstruction of Ep 18 **burns out** right at the light | Side quest | "The light destroyed the memory itself." (Players can't scrub the truth pre-reveal. Fairness is preserved by the *original* scene) |

**Bridge clues (Cal ↔ Sable). The only clues that connect them.**

| # | Type | Clue | First seen | Source (≥10h earlier) | Alibi |
|---|---|---|---|---|---|
| B1 | **Combat** | Sable cuts a tear *beneath* an enemy; the enemy drops out of the sky. Cal's old *Drop* did the same with a door frame | Encounter I (Ep 24) | Cal's Assist, Arcs 1–2 | Visually different (black jagged tear vs. golden frame); the Choir's Wraithe does space-drops too (§15.6) |
| B2 | **Animation** | Sable dodges **left, left, backstep** | Encounter II boss fight (Ep 26) | S3 (Ep 3 tutorial, ~25h earlier) | It's just an animation; nobody comments |
| B3 | **Animation** | Sable tilts his head right when Rook speaks to him | Encounters II–V | S4 | Same |
| B4 | **Dialogue** | Sable pulls a civilian through a tear and murmurs **"Mind the step."** Tamsin: *"…That's a weird thing to say."* Nobody follows up | Encounter III (Arc 4) | S2 (~30h earlier) | It's a common phrase; the scene immediately escalates |
| B5 | **Music** | Sable's theme contains the **Lighthouse Tune inverted and slowed**, buried in the low strings for at most 2 bars | Every encounter | S5 | Not consciously audible. Composer brief: *felt, not heard* |
| B6 | **Item** | A frayed red cord with a Quill knot on Sable's wrist, visible for ~1 second under his gauntlet in one shot, in shadow | Encounter V (Arc 4 finale) | S6 | Juno **sells** those cords in the Lowmarket. Anyone could own one. Juno isn't in that scene |
| B7 | **Voice** | The mask's voice processing is slightly lighter each encounter | Encounters I → VI | — | Unnoticeable unless compared back-to-back |
| B8 | **Behavior** | Sable never lands a killing blow on a Lantern and never harms a civilian. He **does** brutally kill Choir agents and badly injures Bas | All | — | He's ruthless and unpredictable. The injury to Bas makes "he's secretly a friend" feel *wrong* |
| B9 | **Casting** | Sable never speaks a spell name | All | D3 | Hollow casters (Wraithe) are silent too |

> **Director's Note: tuning the mystery.** We test this with outsiders. Targets: **10–20%** of playtesters suspect Cal before the reveal; **80%+** recall at least one clue when they rewatch. If more than 25% guess, remove a bridge clue (B4 first). If fewer than 50% recall a clue on rewatch, strengthen the seeds, never the bridge clues. **Track D is tested separately:** after Backlash, players should recognize at least 3 of S2, S3, S5, and D1–D12 *without being prompted*.

---

### 15.6 CONTENT: Misdirection (so the player is confidently wrong)

**Red herring 1: Aurek Valcourt (the primary wrong answer).**
- Severin's older brother, presumed dead **six years ago** in the Hollowmarch. Body never found. First mentioned in Ep 9; Severin keeps his broken pendant.
- The Sable Knight shows unusual interest in the Valcourts: he attacks Aldric's convoy (Encounter IV) and is seen **at Aurek's grave in the Valcourt crypt** (Arc 3 ending hook).
- Severin becomes convinced Sable is Aurek: *"Brother…?"* Sable says nothing.
- 🔒 Truth: Aurek was Cal's expedition partner six years ago and died beside him in the Hollowmarch. Cal visits the grave because, against all his own theories, he misses him. (Field Notes, Layer 9.)

**Red herring 2: Wraithe, the Choir's rift-walker.**
- A Pale Choir assassin who also tears space and casts silently. Introduced Arc 3 (Ep 23) *before* the Sable Knight, so "space-tearing" reads as a **Hollow/Choir technique**, not Cal's.
- Sable kills Wraithe in Encounter III. Players theorize Sable is a Choir defector from the same school.

**Red herring 3: the Rumor Board.**
- The protagonist's journal has a **"Who is the Sable Knight?"** page that collects NPC rumors: *Aurek Valcourt*, *a Choir defector*, *a Hollow demon wearing a man's armor*, *an Ashfall war hero*, *the Paragon's secret executioner*.
- **Cal's name never appears.** No NPC ever suggests it; in-world, he is dead and mourned.
- (*"A Hollow demon wearing a man's armor"* is the closest anyone gets. It's a rumor among many, and in-world nobody yet knows demons exist.)

---

### 15.7 PLAYER EXPERIENCE: Encounter timeline

Each encounter raises a new question: *"Who the hell is this person?"*

| # | When | What happens | Question it raises |
|---|---|---|---|
| — | **Ep 18** | Cal "dies" (§19.3) | — |
| — | **Eps 19–23** | Grief arc; Track A clues; Wraithe introduced | "Is there any chance…?" (most players: no) |
| **I** | **Ep 24 "Sable"** | During the Ashfall war, an Ashfall siege engine is about to crush the Lanterns. A black tear opens and the engine falls out of the sky (B1). A masked figure stands on the ridge, then leaves | "Who is that? Whose side is he on?" |
| **II** | **Ep 26 "The Vault Beneath Ironhold"** | **Boss fight (B9).** Sable raids a Crown vault the Lanterns are guarding. He takes a sealed artifact. He **breaks Bas's arm** in a cutscene. He spares Rook at 25% HP and leaves | "Why does he want Crown secrets? Why didn't he finish me?" |
| — | **Ep 28 hook** | Sable stands at **Aurek Valcourt's grave** and leaves a flower | "Is he Severin's brother?!" |
| **III** | **Arc 4, Ep ~31** | A three-way fight: Lanterns vs. Wraithe vs. Sable. Sable executes Wraithe. He pulls a child through a tear: "Mind the step." (B4) | "He saves children *and* executes people?" |
| **IV** | **Arc 4, Ep ~34** | Sable attacks Chancellor Aldric's convoy. Severin defends his father: *"Brother…?"* Sable vanishes | "Severin thinks it's Aurek. Is he right?" |
| **V** | **Arc 4 finale, Ep ~38** | The Hollow takes Elodie. Sable walks out of a tear carrying her and places her in Rook's arms without a word. Cord visible (B6) | "Ally? Enemy? Why give her to *me*?" |
| **VI** | **Arc 5, Ep ~43** | **Boss fight.** Sable stops the Lanterns from escorting the Paragon's **Gate Key** and takes half of it. *"Go home, Lantern."* | "What is he trying to do?" |
| **REVEAL** | **Arc 5 finale, Eps 47–48 "The Siege of Aurelin"** | §15.8 | — |

That's **six encounters across ~25 hours**, including **three full boss fights against him**. By the reveal, the player knows the Sable Knight's moveset intimately and remembers Cal's from Arcs 1–2. The reveal fight uses **both**.

---

### 15.8 THE REVEAL: The Siege of Aurelin (Arc 5 finale, Eps 47–48)

**Setup:** Hesper Voss opens the Hollow Gate above the capital using the Gate Key. She believes it leads into the Hollow. **It leads through the Hollow, to the Demon Continent.** On the other side, the Demon Lord King has slept in his coffin for fifteen years, and his army still obeys its last standing order: *hold the line; destroy the intruders*. When the Gate opens onto it, the Lines march through: ranks of **Demon Soldiers** (1★, dark red and black, no wings) led by a wingless **Line Marshal** (2★, a brute in heavy plate). There are no Commanders: the two places beside the King's throne have stood empty for fifteen years (§28). At the same moment, Aldric Valcourt launches his coup. Demon lines, Choir cantors, rebel Lances, and Crown knights fight in the streets. The sky turns red-black. This is the largest battle in the game so far, and the first time Liraen sees a demon.

> **Director's Note: "chaos is authored, not simulated."** The battle *looks* like thousands of combatants but runs within normal budgets: max 8 active enemies near the player; armies in the distance are animated impostors and baked vignettes; destruction is pre-authored (pooled debris, swapped building states); the sky and lighting change via timeline. The player is always in a **readable pocket of chaos**, moving between pockets. Demon Soldiers share one armor model with color and weapon variants. (Full budgets in §21.7.)
>
> **Pacing:** the sequence is split across two episodes. **Ep 47** covers Phases 1–2. **Ep 48** covers Phases 3–5 and the full fight against Cal. Each half is about 25–35 minutes, so the player gets a natural break.

#### PHASE 1: CHAOS (gameplay, ~6–8 min)
- **Objective:** hold the Lowmarket Bridge while civilians evacuate. A **Defense meter** shows the bridge falling.
- The demons advance in a **spear-wall, three lines deep, with the Marshal at the rear**. (D7. Players who remember Ep 15 may get chills.)
- Bridge sections collapse behind you. **Bas goes down** (arm still in a brace from Encounter II); **Juno is pinned** under rubble. Small chaos choice: reach Juno or cover Bas first (affects a line in the aftermath, nothing else).
- **Fairness rule:** the Defense meter falls no matter what, but the player's actions visibly *slow* it. The arrival triggers at a threshold or a time limit, so it never feels like the game stole a win.

**The arrival:** the sky tears open, a black jagged cut across the clouds. **Everything stops.** Enemies and allies freeze in held poses (anime "held frame" beat, in-engine). The Sable Knight drops onto the bridge.
- Allies' barks: Tamsin: *"Is he with them?!"* Juno: *"Kill him if he moves!"*
- The music cuts to Sable's theme (B5 buried in it, as always).

#### PHASE 2: THE SABLE KNIGHT FIGHTS (gameplay, ~4 min)
- The player **keeps control**. Sable rampages through the demon lines along an authored path, an AI "storm" that wipes out enemy waves. The player fights in his wake.
- He kills Demon Soldiers in single cuts. Each time, unprocessed for a fraction of a syllable, he murmurs ***"Rest, soldier."*** (D8 again. A player who remembers Ep 17 will notice. Most will hear only the mask.)
- **T2 cinematic (6s):** Sable cuts a tear beneath the **Line Marshal**, who falls *out of the sky* onto his own lines. Sable kills him with one glaive cut from a backstep.
- Rook (in-engine bark, not a cutscene): ***"That technique…"*** The battle continues; no one follows up.
- **Through the Gate**, framed in the red sky: a vast empty throne, and before it a **sealed black coffin**. When the Marshal falls, the coffin's lid **shifts, very slightly**. No one in Liraen understands what they're looking at. (After Backlash, players will.)
- **Turn:** Sable heads for the **Gate Key's anchor**, built into the Grand Archive where civilians are sheltering. Rook steps into his path.

#### PHASE 3: MASK DAMAGE (boss fight)
- **Rook vs. the Sable Knight, the third full duel.** The player knows his patterns now; he escalates with moves never seen before.
- **Win condition:** break his Posture, then land an **Inscription finisher** (*Underline → heavy*). The player earns this hit; it isn't scripted.
- **Cutscene (T3):** the impact frame cracks the mask down the center. It does **not** break. The camera holds on the cracked mask. Blood runs from beneath it. Sable lifts his hand and touches the blood. **Silence**, wind only.

#### PHASE 4: MEMORY TRIGGER (interactive dialogue)
A timed anime-style dialogue choice (Rook breathing hard, the battle muffled around them). **Available lines depend on what the player experienced:**

| Option | Requires | Sable's response |
|---|---|---|
| Hold up the brass key: *"You still owe me a snack cupboard."* | Saw the Ep 7 bond event (S7) | ***"…It never had a lock."*** |
| *"Mind the step."* | Heard B4 (Encounter III) **and** Cal's bark (S2) | ***"…Tell Juno the knot held."*** |
| *"Whoever you are, Dagrun still leaves a lantern lit."* | Visited the Hall of Lanterns after Ep 18 | ***"…He always did leave the light on."*** |
| *"WHO ARE YOU?!"* (default) | — | Rook, shaking, pulls out the brass key anyway. Sable: ***"…It never had a lock."*** |

Each response is something **only Cal could know**.
- **His composure breaks for the first time:** a half-step back, the voice processing slips for a single syllable. And he **laughs, once, quietly**, like someone who has just been surprised in a game he thought he'd mastered. (Not a villain laugh. Delight.)
- **Rook freezes.** No confirmation. Before either can speak, a demon war-horn sounds and the battle swallows the moment.

#### PHASE 5: THE GRAND REVEAL
**Gameplay:** a second wave of demons pours through the Gate. Sable and Rook turn on each other one last time. They unleash their strongest attacks simultaneously: a **Clash** sequence (alternating timed presses, no button mashing) between Rook's ultimate and Sable's.

**Storyboard: "The Face in the Smoke" (24 fps)**

| CUT | PICTURE | ACTION / STAGE | DIALOGUE / AUDIO | TIME / FRAMES |
|---|---|---|---|---|
| 001 | Two-shot, profile: ink and black light meet between Rook and Sable | Push in, speed lines | Both ultimates' roars rising | 1.0s / 24 |
| 002 | **Impact frame**: white-on-black silhouettes, both weapons | 3-frame flash | One enormous crack | 0.12s / 3 |
| 003 | Wide, high angle: shockwave levels the bridge district | Crane up rapidly | Roar → sudden total silence | 1.5s / 36 |
| 004 | Black screen | — | **Silence** | 1.0s / 24 |
| 005 | Low wide: smoke and drifting ash; the red sky beginning to clear | Slow dolly forward through smoke | Wind, falling debris, distant collapse | 4.0s / 96 |
| 006 | MS: Rook on their knees, grimoire smoking | Static | Ragged breathing | 1.5s / 36 |
| 007 | Through smoke: a standing silhouette | Rack focus | Wind | 2.0s / 48 |
| 008 | Insert: mask shards falling onto stone | Static; shards land one by one | Glass tinkling | 1.5s / 36 |
| 009 | ECU: a **hand**, a frayed red cord with a Quill knot at the wrist | Slow tilt | Wind | 1.5s / 36 |
| 010 | ECU: **one eye** opens; the iris carries a faint ring of starlight that Cal never had | Hold | Heartbeat, very faint | 1.2s / 29 |
| 011 | ECU: wind lifts **hair** away from the face | Slow pan | Wind | 1.0s / 24 |
| 012 | ECU: a new **scar** across the left brow | Slow pan continues | — | 1.0s / 24 |
| 013 | CU: his mouth: **the same crooked half-smile** from Arc 1, turning into a smirk | Hold | — | 1.0s / 24 |
| 014 | MS: **full face**. Calder Wynn. Older, scarred, unmistakable. He tilts his head right (S4) | Slow push in, held 3 seconds | **Silence. No music.** Wind and debris only | 3.0s / 72 |
| 015 | ECU: Rook's eyes, pupils shrinking | Snap zoom | — | 0.6s / 14 |
| 016 | CU: Cal, unprocessed voice, quiet, smirking | Static | CAL: ***"Told you not to wait up."*** | 2.5s / 60 |
| 017 | CU: Rook's face crumpling (VOICE_PLACEHOLDER: no words, one breath) | Hold | **The Lighthouse Tune, all four notes, finally complete**, played low and steady, like a march | 3.0s / 72 |

**Rules for this sequence:**
- No villain laughter. No narrator. No flashback montage. No explanation of any kind.
- The line ties directly to his last words in Ep 18 (*"Don't wait up"*).
- The Ep 18 death scene played the Lighthouse Tune **three of four notes** (unresolved). Cut 017 resolves it. Players feel the resolution even if they never noticed the motif. (After the Backlash Arc they will know it as a march.)

#### THE FIGHT AGAINST CAL (gameplay; there is no fade to black)
Cut 017 hands control straight back. Cal rolls his shoulders, opens a **golden door frame**, the first one anyone has seen since Ep 18, and steps out of it behind Rook. *"Come on. Show me what you learned."*

| Phase | What happens | What the player feels |
|---|---|---|
| **1: The companion** | Cal fights with **his Arcs 1–2 kit**: golden doors, saber-like strikes (formed from door light), and his **old Assist moves, now used against you** (the *Drop* that used to juggle enemies for you, the door-swap he used to save you) | *"I've been fighting beside this guy the entire game."* |
| **2: Evolution** | Each companion move evolves mid-fight into the Sable Knight's version: doors become black tears; the Drop becomes a sky-wide fall; the swap becomes a party-wide scramble | *"He was holding back. The whole time."* |
| **3: The reincarnated power** | Silent casting at speed, regeneration, floating spatial blades, and the **glaive's true form**: **Godfall Demon Slash**, a backstep-cut that splits the arena (the god-like version of a Demon Soldier's basic drill). At the end of the phase he says something no one could know: *"You were lighter than my glaive, you know. That night in Larkspur."* Rook: *"…What are you?"* Cal: ***"You really want to know?"*** **(Ep 48 ends.)** | *"I never knew what he actually was."* |
| **BACKLASH** (Ep 49) | *"Then don't just listen."* Cal opens a golden door into his own memory; the battlefield freezes mid-collapse. The player **plays Cal's past**: a 1★ Demon Soldier, the monthly Goddess Trial, the Saint's *Sacrifice*, *"For the Demon King,"* the apparent death, and the void, where two archdemons stop time and carry him off. **The flashback ends on his grin** and match-cuts to present-day Cal's same grin (`docs/BACKLASH.md`). *"So. That's how I died."* *(smile grows)* *"…The first time."* *(the smirk)* *"Don't mistake that for a confession. It was an introduction."* | *"I WAS Cal."* Then: *"I was playing the villain before I even knew he was the villain."* |
| **PERSPECTIVE CHOICE** (Ep 50) | ***Whose story?*** The player chooses who to play for Phases 4–6. **Rook:** as below. **Cal:** play him against Rook and the Lanterns (AI): evade and judge in Phase 4, **move the party like pieces** in Phase 5, lose to the Lantern Chain in Phase 6. Then **Cal's Path**: the rest of his story (through the void, the Astral Path, Larkspur, Liraen, the mask) and a present-day scene after he steps through his door. Rook players unlock Cal's Path in the Lore Archive in Arc 6, so nothing is missed | Same story, different eyes |
| **4: Not serious** | He sits on the golden door frame he opened at the end of the flashback, swinging one leg, and **grades** the player (*"Your move."*). He only attacks when the player does something *interesting* (reactions, perfect dodges, team attacks). Boring play gets nothing but commentary. An **"Interest" gauge** replaces his HP bar for this phase | Unsettling. Playful. The most dangerous moments are quiet |
| **5: The board** | He manipulates the battlefield itself: the camera rises to a **high-angle "board" view** (his point of view), districts rotate through doors, and party members are **split across the city**, each fighting alone against demon squads while he moves them like pieces | Helplessness: *"pieces on a board"* made literal |
| **6: Bonds** | The party fights its way back together. Each reunited ally restores a **Link**; each Link enables a team attack. With all Links restored, the party performs the **Lantern Chain** (every Lantern's team attack in sequence) | The protagonist's strength is people, not power |

**Ending of the fight:** the fight ends on the Lantern Chain, not on an HP bar. Cal is hit, genuinely, for the first time. He lands, laughing softly, a hand on his ribs.
- Rook: ***"Was any of it real?"***
- Cal: ***"That's the funny part."*** He looks past Rook, at Juno, Bas, Tamsin, Dagrun. ***"I actually liked you."*** Pause. ***"I just never said I had to be on your side."***
- He opens a door to the Gate, steps through, and closes it **from the other side** (S1). The Gate seals. The demon army left in Liraen loses its order and breaks. The siege is over.

**Ending hook, WHAT HAPPENS NEXT?:** That night, the lighthouse. Cal's room has been untouched since Ep 18, but on the bed lies a stack of notebooks that wasn't there yesterday. The cover: ***FIELD NOTES — for Rook.*** The first page is a careful sketch of every Lantern, each with a small note. Under Rook's sketch, there is no note. Just a drawing of the brass key.

---

### 15.9 PHASE 6: AFTERMATH & PERMANENT CHANGE

#### Character reactions (no one reacts the same way)
| Character | Reaction | Gameplay effect |
|---|---|---|
| **Juno** | Shattered, then furious. Cuts her own knot off her wrist. Later, quietly ties a new one | `CAL_JUNO = BETRAYED` → (Arc 7) `UNRESOLVED` or `FAMILY` depending on choices |
| **Dagrun** | Guilt: he took Cal in. Says nothing for an episode. Then, to Rook: *"I still leave the light on. Don't know if that makes me a fool."* | Dagrun's Arc 7 quest *"The Light Left On"* |
| **Bas** | Vindicated distrust. *"He broke my arm. I kept telling myself it wasn't him."* | Bas gains a resolve passive; refuses any truce with Cal until Arc 7 |
| **Tamsin** | Denial, then grief: *"He said he liked us. He said it."* | Tamsin's bond event on what "liking someone" is worth |
| **Lio** | Recognizes the mask script from Choir archives; becomes the translator of the demon script in the Field Notes' margins | Drives Arc 6's Field Notes quests |
| **Severin** | Hollow anger. His hope that Sable was Aurek dies in the same moment. And Cal used his father. *"You let me believe."* | Arc 7 rival-turned-ally scene |
| **Elodie** | Complicates everything: *"He carried me out of the dark. He was gentle."* | Keeps "pure villain" readings honest |
| **The Crown / Crimson Bell** | The Lanterns' vice captain was a demon in human skin. The squad is under suspicion | Squad Rep −−; Crimson Bell investigation quests |
| **Rook** | *"If you were alive this whole time… why didn't you come back?"* | The question the Backlash Arc answers |

#### Why the reveal doesn't explain everything
The fight reveals **WHO** (Layer 3). **Backlash**, told by Cal himself mid-fight, shows **WHAT he was** (Layers 5–7), but as a **curated narrator**: everything shown is true, and not everything true is shown (three visible memory splices). Arc 6's Field Notes cover **WHY he stayed away** (Layers 8–9). **Arc 7** answers **WHAT he's been doing**: the manipulation (Layer 10) and what he wants from the Palimpsest.

#### Permanent gameplay changes after the reveal
| Requirement | Implementation |
|---|---|
| **Playable** | **Ash Line Eleven** and young Cal are playable for the whole of Backlash (Ep 49). In Arc 7, **Cal joins the tag-swap roster temporarily** (Rook, Severin, Cal) during the alliance against the Demon Lord King |
| **New combat abilities** | Backlash: the Demon Soldier kit (drill → Demon Slash, formation, Observe/Insight) and young Cal's unlock ladder (doors, Ascended Demon Slash). Arc 7: Cal's full kit (Threshold doors + Severance + Godfall Demon Slash) |
| **New combo trees** | Ash-pike ComboGraph (Backlash); glaive ComboGraph with "tear-cancel" edges (Arc 7) |
| **New party interactions** | ~30 Arc 7 banter skits; pair flags with every party member; the Hero Party guests (§26) |
| **New bond quests** | Cal's bond resumes in Arc 7 from his pre-death rank **minus 3** (*"You don't know me anymore." "Did I ever?"*); quest chain *"Field Notes"* |
| **New story quests** | Arc 7 *"Field Notes"*: revisit each Sable attack site and discover what he was really moving (Layer 10: the Ironhold vault held the Gate Key's first half; Wraithe was Hesper's leash, not his ally; the convoy carried Aldric's Gate schematics) |
| **Unexplained events gain context** | Each Sable encounter gets a short "other side" scene, unlocked in the Archive as you complete *"Field Notes"* |
| **Earlier dialogue reinterpreted** | ~40 lines flagged **"Echo"**: revisiting key NPCs and places plays an alternate reading (e.g., the Hall Keeper's wick line, the Thornwick orphanage's *"brought in by a boy who didn't speak"*). Old journal entries gain handwritten **annotations** in Rook's hand |
| **New optional scenes** | "Where It Happened" (the Hollowmarch plateau); "The Grave" (Aurek's grave, with Severin); "The Boy Who Didn't Speak" (the Thornwick orphanage keeper's memory) |
| **Death scene replayable** | Lore Archive → **Theatre** (§15.10), including the Backlash sacrifice for side-by-side comparison |
| **Revisit locations** | Hollowmarch plateau, Ironhold vault, Aurek's grave, the Thornwick orphanage, Larkspur's ruins: each gains new interactions |

#### What the player finds when they rewatch the Ep 18 death scene
The original scene (§19.3) was always honest:
- Cut 005: he's **smiling** at the Bloom. *"Huh. That's a big one."* He isn't afraid; he's interested.
- Cut 006: *"Keep the key."* He wants Rook to follow him one day.
- Cut 010: he **walks toward** the door, deliberately; he is not consumed.
- Cut 013: the door slams **toward the camera**, which means it was pushed from beyond. Frame-stepping the 2-frame impact flash shows a silhouette **standing in the doorway, a hand on the door, pushing it shut from the far side**.
- Cut 015: the key *rings* in Rook's palm. It's resonating with an open door.
- The Lighthouse Tune plays only three notes. It never resolved, because the story wasn't over.
- After the Backlash Arc, Theatre mode offers **side-by-side playback** of Ep 18 and Backlash CIN-05 + CIN-05B (*"For the Demon King"* and *"The Void"*). They are the same shot list.

---

### 15.10 TECHNICAL IMPLEMENTATION

**Separate identities in data (critical for leak prevention):**
- `CHR_SABLE`, `CHR_CAL`, `CHR_ASH_ELEVEN`, and `CHR_CAL_ALLY` are **separate CharacterData assets**. Nothing in `CHR_SABLE` references Cal or demons. They share no IDs, animation file names, voice bank names, or localization keys.
- After the reveal, `IdentityService` maps `CHR_SABLE → CHR_CAL` for the codex, party UI, subtitles, and the bestiary re-ink animation (the "Sable Knight" entry visibly re-inks into "Calder Wynn").
- `CHR_CAL_BOSS` (the reveal fight) and `CHR_CAL_ALLY` (Arc 7 playable) are built from the same AbilityData as `CHR_CAL` (Arcs 1–2 Assists) and `CHR_SABLE` (boss fights). **Most of his kit is built before the reveal.**
- `CHR_ASH_ELEVEN` reuses the **Demon Soldier enemy** abilities from the Siege of Aurelin, plus the formation drill and Observe mechanic. **The Backlash protagonist costs very little new combat work.**

**Lore Archive: Theatre mode:**
- Replays any watched cutscene from its Timeline asset (no video files).
- **Frame-step**, slow-motion, free pause, and **side-by-side** playback of paired scenes.
- **"Annotated Edition"** unlocks after the player has rewatched a scene once on their own: optional margin notes in Rook's handwriting appear at clue moments. The player always gets the chance to spot clues first.

**Voice processing:** a Web Audio effect chain (`SNAP_MASK_VOICE`) with a parameter `MaskIntegrity` (1.0 → 0.6 across encounters) that controls pitch-shift and resonance depth. In Phase 4, one syllable plays at 0.0.

**Music:** the Lighthouse Tune exists as a motif stem. Sable's theme uses an inverted, augmented version on a low string layer. The death scene uses a 3-note truncation. The reveal uses the full statement. The Backlash Arc uses the **same four notes as the Demon Army's march drum**.

**Story flags (persistent, saved):**
```
CAL_STATE              : 0 alive | 1 "dead" | 2 sable_active | 3 revealed | 4 beyond_gate | 5 allied | 6 final
SABLE_ENCOUNTER        : 0–6  (highest encounter completed)
CAL_IDENTITY_REVEALED  : bool  (drives IdentityService, codex, subtitles)
SEED_S2_HEARD_COUNT    : int   (how many "Mind the step" barks the player heard)
SEED_S7_KEY_EVENT      : bool
CLUE_A1..A5            : bool
CLUE_D1..D12_SEEN      : bool  (for Echo lines and the Annotated Edition)
CLUE_B4_HEARD          : bool
HALL_VISITED_POST_DEATH: bool
PHASE4_CHOICE          : 0 default | 1 key | 2 step | 3 lantern
CAL_BOND_AT_DEATH      : int (snapshot at Ep 18)
CAL_JUNO / CAL_BAS / CAL_SEVERIN / CAL_DAGRUN : relationship states
BAS_ARM_BROKEN         : bool (Encounter II → aftermath)
SEVERIN_BELIEVES_AUREK : bool
BACKLASH_EPISODE       : 0–10
BACKLASH_KNIGHT_SPARED : bool (always true; logged for Arc 7 recognition scene)
THEATRE_REWATCHED_EP18 : bool (unlocks Annotated Edition)
INVESTIGATION_SCORE    : derived (Track A + bridge clues found), never stored

# Other story flags referenced elsewhere in this document
MIRREN_SAVED           : bool (Ep 4 choice)
BRANNOC_DEAD           : bool (always true after Ep 22; kept for safety)
LIO_STATUS             : 0 trusted | 1 exiled | 2 forgiven
SEVERIN_ECLIPSED       : bool
EXAM_DUEL_WON          : bool
CORRUPTION             : int 0–100
STAR_SIGHT_UNLOCKED    : bool (§25)
CAL_FATE               : 0 unresolved | 1 erased | 2 grounded | 3 lantern (§27, final choice)
```

**What the investigation score changes** (deliberately small, so the reveal is the same for everyone):
- Which Phase 4 options appear.
- One line after the fight: **"I think I knew"** (score ≥ 6: Cal, delighted: *"Then you were watching. Good."*) vs. **"I never guessed"** (score ≤ 2: *"Good. That was the point."*).
- Secret grimoire page **"Second Reading"** (score ≥ 8).

### 15.11 Leak prevention (the reveal must survive the real world)
| Channel | Rule |
|---|---|
| Subtitles | Speaker label "???" → "Masked Knight" → "The Sable Knight". Never "Cal" before the reveal |
| Codex / bestiary | Sable entries describe only what Rook has seen. No hidden fields containing truth. **No demon entries exist before Ep 47** (the husks in Ep 17 are catalogued as "Hollow Husk") |
| Loading screens & tips | Pre-reveal pool never mentions Cal after Ep 18 except as mourned. No demon or star-rating tips before their arcs |
| Episode titles & previews | Ep 47–48 titles: *"Lanterns in the Smoke"* / *"The Other Side of the Door"*. The next-episode preview for Ep 48 **never shows the mask breaking**. Backlash episode titles are hidden in the menu until reached |
| Achievements | Reveal and Backlash achievements are **hidden** until earned |
| Credits | "The Sable Knight ……… ???" and "Ash Line Eleven ……… ???" until the reveal; updated afterward |
| Data files | No shared names between `CHR_SABLE`, Cal, and demon assets (dataminers read file names) |
| Marketing | No trailer shows the Sable Knight's voice unprocessed, his face, a Demon Soldier, the Demon Continent, or the Demon Lord King. **The Backlash Arc is never marketed. The Void Figures, the black circle, and the unknown language never appear in any marketing, ever** |
| Void Figures data | IDs `CHR_UNK_A` / `CHR_UNK_B`; no names, factions, or descriptive file names anywhere in the build. The unknown language's script ships only as audio, never as text |

### 15.12 PERFORMANCE
- The Siege of Aurelin uses the staged-chaos approach (§15.8 note): impostor armies, pre-authored destruction states, timeline-driven sky. Budget: ≤ 8 active enemies near the player, ≤ 2 bosses with full AI at once, VFX capped per zone.
- The reveal fight's "board" phase uses **additive streaming of pre-built district pockets** rather than a live open city.
- Theatre mode reuses existing Timeline assets; it costs no extra disk beyond a scrubbing UI.
- Voice processing is a single real-time DSP chain (negligible cost).

### 15.13 NEXT STEP (for this storyline)
Lock the Disguise Bible (§15.3) before any character art begins. The Sable Knight's silhouette must pass a **squint test** against Cal's (side by side, blurred, they must not read as the same person), and the concept artist should design Sable *without being told who he is*. The Demon Soldier armor (§26.4, visual design) must be designed **before** the Sable mask, because the mask's slit pattern is derived from it.

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

**B9 · The Sable Knight, Encounter II: "The Vault Beneath Ironhold"** (Ep 26)
- P1: Severance blink-cuts; heavy two-handed glaive strings with a guarded left side, every thrust launched from a backstep · P2: cuts tears beneath you and drops *you* from the sky (aerial recovery test) · P3: the vault corridors fill with tears, and every exit loops back into the arena · P4: hidden ability *Sever Line*, a cut that splits the arena in two and isolates one party member
- He cannot be killed in this fight: at 25% HP he takes the artifact and leaves through a tear that closes behind him. This is a fair "win" for the player, not a cheat loss. He spares Rook; in the cutscene he **breaks Bas's arm**.
- Weak: tears take a moment to close (punish him while one is open); Sunlance and Candle light disrupt Severance
- 🔒 Bridge clues present but unannounced: B2 dodge pattern, B3 head tilt, B5 buried motif, B7 voice processing
- Consequence: Crown bounty on the Sable Knight; `SABLE_ENCOUNTER=2`; `BAS_ARM_BROKEN=true` (Bas fights at reduced strength for 3 episodes and remembers it at the reveal)

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
- If **Mirren was saved** (Ep 4) → **Quest A** "The Black Knight's Well" (she leads you to a Sable Knight sighting site in person).
- If **Mirren was lost** → **Quest B** "Letters from the Fen" (her grandmother's letter describes the sighting, with less detail).
- If the player found **Cal's journal** → **Quest C** "Burned Memory" unlocks (Lio's reconstruction of Ep 18, Clue A5).

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
| **T3: Story cutscenes** | Episode cinematics | Full cinematic | JSON timeline + camera director + dialogue system, built from storyboards |

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
| 005 | CU: Cal tilts his head, listening to the Bloom, half-smile | **Hold pose**, limited animation | The Lighthouse Tune on a solo instrument: **three of its four notes**, unresolved; then music cuts | 1.2s / 29 |
| 006 | Two-shot: Cal and Rook | Cal places a hand on Rook's head | CAL: "Kid. Keep the key." | 2.5s / 60 |
| 007 | ECU: Rook's eyes widening | Static | ROOK (VO_PLACEHOLDER): "Cal, what are you…" | 1.0s / 24 |
| 008 | Low angle: Cal raises his hand; a vast door frame tears open in the air | Tilt up, Dutch angle | Reality tearing (SFX) | 1.8s / 43 |
| 009 | Wide: the door swallows the Bloom | Whip pan following the Bloom | Roar collapsing into silence | 1.2s / 29 |
| 010 | MS from behind Cal: he walks *toward* the door | Tracking shot, slow | Footsteps only | 2.0s / 48 |
| 011 | CU: Cal, turning his head back, smiling | Held frame | CAL: "I'll hold the door. Don't wait up." | 2.5s / 60 |
| 012 | MS: Rook lunging forward | Speed lines, smear frames | ROOK: "CAL!" | 0.6s / 14 |
| 013 | **Impact frame**: inverted white silhouette of the door slamming **toward the camera**; in one frame, a figure stands in the doorway with a hand on the door | 2-frame flash | Single massive slam | 0.15s / 4 |
| 014 | Wide: empty plateau, white mist, nothing remains | Static, held 3 seconds | **Total silence** | 3.5s / 84 |
| 015 | Insert: Rook's open palm, the brass key | Slow push in | A faint, distant ringing (🔒 the key resonating) | 2.0s / 48 |
| 016 | Wide: the lighthouse at dusk; one lantern dark | Slow pull back | Ambient wind; no music | 4.0s / 96 |

🔒 **Fairness check:** cuts 005 (unresolved tune), 006 ("keep the key"), 010 (he walks *toward* the door), 011 ("don't wait up"), 013 (the door is pushed shut from beyond; visible only frame by frame), 015 (the key resonates), and 016 (the dark lantern) each contain truth. After the reveal, the Lore Archive's Theatre mode allows frame-stepping (§15.10).

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
Camera presets, each a reusable data asset: **Pan, Tilt, Dolly, Tracking, Crane, Zoom, Orbit, Handheld shake, Whip pan, Snap zoom, Dutch angle, Low angle, High angle, ECU, Wide establishing**. Storyboards reference them by name (`CAM_WHIP_PAN_FAST`), so layout is quick.

### 19.6 2D-in-3D visual language
- **Cel shading:** 2–3 tone ramp shader + rim light; **inverted-hull outlines** (cheap, controllable per material); later, SDF face shadows (anime-clean faces).
- **Impact frames:** full-screen post effect (invert / posterize / high-contrast lines), 2–4 frames.
- **Speed lines:** screen-space overlay shader driven by camera velocity or cue.
- **Smear frames:** authored smear meshes or vertex-stretch shader on major attacks only.
- **Hand-authored VFX:** flipbook textures (2D-drawn) on particles, not physically simulated effects.
- **Limited animation:** an **animation stepping** option per move. Pose playback can be sampled at 12 fps ("animating on twos") for a held, punchy anime look, while gameplay logic stays at 60 Hz. Major attacks switch to full-rate for smoothness at the key moment. **This costs almost nothing and is the single biggest "it looks like anime" lever.**

### 19.6.1 Color grading and character shading
**Reference:** the TV anime *That Time I Got Reincarnated as a Slime*. We match its *qualities*, not its assets: bright, clean, saturated color with glossy, readable characters.

| Element | Target |
|---|---|
| **Palette** | High saturation, clean hues, little grey. **Shadows shift hue** (toward cool blue or violet) instead of going grey or brown, so colors stay vivid in shade |
| **Cel shading** | One crisp shadow step on characters (two tones), plus a soft gradient only on large forms. Minimal texture noise; flat, clean color areas |
| **Hair** | Silky, with a bright **"angel ring" band** that follows the head and sharp **white streak highlights**, plus a second **tinted gloss** in the hair's own light color (light blue on dark blue, light pink on pink) |
| **Eyes** | Large and glossy, with layered highlights (one big, one small) |
| **Line art** | Thin and clean; **tinted dark lines** (local color, darkened) rather than pure black, except on deliberately black designs |
| **Lighting** | A clear key light, cool ambient fill, and a **rim light** on every character, so dark clothing (black suits, coats) always reads against the background |
| **Glow** | Soft bloom on light sources, magic, and highlights; gentle diffusion on bright areas |
| **Backgrounds** | Painterly and slightly softer, lower in contrast than characters, so characters pop |
| **Dark scenes** | Night, the Astral Path, and the Demon Continent stay **colorful-dark**: deep violets, blues, and reds, never muddy black |

**Implementation:** Phase 2 Step 5 ("cel-shading v2") builds this as a custom toon shader:
- a two-tone ramp with hue-shifted shadows
- rim light
- a hair gloss band and streak highlights
- tinted outlines
- a final color-grade pass (saturation, lift, soft bloom)

**Built in Phase 2 Step 5** (`runtime/look.js`, `toon2`). The grade runs inside the shader rather than as a post-process, because a full-screen pass fought the glow layer and washed out the picture.

### 19.7 Animation quality tiers
| Tier | Use | Keys | Playback |
|---|---|---|---|
| **A: Standard** | Lights, locomotion, enemy basics | 8–15 key poses | Stepped (on twos) |
| **B: Major** | Heavies, spells, finishers | 20–40 | Hybrid: stepped anticipation, full-rate release |
| **C: Cinematic** | Ultimates, story | Custom | Authored per shot |

### 19.8 Accessibility
Toggles for camera shake, motion blur, impact-frame flashes (photosensitivity: impact frames are softened to a dim flash when off), speed lines, and skip/shorten Ultimates.

---

## 20. ENGINE & PLATFORMS

### Decision: **Babylon.js 9 (WebGL 2 / WebGPU), JavaScript, runs in the browser** ✅ *(v1.2, replaces Unity 6)*

**Why the change:** the project runs on a **zero budget**, and the game has to be **playable from a link** (a Claude artifact or any static host) on PC and phones without installing anything. Unity Personal is free, but a Unity WebGL build is heavy, slow to load, and weak on mobile browsers. Babylon.js is free (Apache 2.0), loads from a CDN, has cel shading and outlines built in, and runs on every device with a browser.

| Criterion | **Babylon.js** | three.js | PlayCanvas | Unity 6 WebGL |
|---|---|---|---|---|
| Cost | Free, Apache 2.0 | Free, MIT | Engine free; editor is a paid service for teams | Free (Personal) |
| Playable from a link, no install | ★★★★★ | ★★★★★ | ★★★★★ | ★★ multi-MB download, slow start |
| Mobile browsers | ★★★★ | ★★★★ | ★★★★★ | ★★ |
| Built-in game features (cameras, glow, outlines, toon, particles, animation, glTF) | ★★★★★ batteries included | ★★★ assemble it yourself | ★★★★ | ★★★★★ |
| Anime look | Toon material, outline renderer, glow layer | Toon material, community outlines | Custom shaders | Large toon ecosystem |
| Iteration | Edit, rebuild in under a second, reload | Same | Same | Minutes per WebGL build |

**What we keep:** every design rule from the Unity plan survives because it was never engine-specific: the fixed 60 Hz logic clock, abilities as data, the combo graph, attack tokens, pooling, quality tiers. **What we give up:** Unity's editor tools (Timeline, Cinemachine, Shader Graph). Cutscenes and camera states will be authored as data (JSON timelines) instead, which suits the "everything is an Ability" architecture anyway.

### 20.1 Platforms
| Platform | How it runs | Target |
|---|---|---|
| **PC browser** (Chrome, Edge, Firefox, Safari) | **Lead platform**. Keyboard and mouse or any standard gamepad | 60 fps at 1080p on integrated graphics from 2020+ |
| **Mobile browser** (Android Chrome, iOS Safari) | Same build. Touch controls appear automatically on touch screens | 60 fps target, 30 fps floor on 2021+ mid-range phones |
| **Installable app** (later, optional) | Wrap the same build as a PWA, or with Capacitor (stores) / Electron or Tauri (Steam) | Same as above |

There is **one codebase and one build**. "Mobile version" means the same page detects touch and switches its controls and quality tier.

### 20.2 Native performance (what replaced "C++ for Windows")
With Unity, native speed came from IL2CPP turning C# into C++. On the web:
- The browser's JavaScript JIT runs our combat logic far faster than it needs: one 60 Hz frame of the whole fight simulation costs well under a millisecond.
- Rendering runs on the GPU through **WebGL 2**, with **WebGPU** available in Babylon by switching engines. That is the same hardware path a native game uses.
- If profiling ever shows a hot spot JavaScript can't handle (unlikely for this genre), that one module can be written in **C++ or Rust and compiled to WebAssembly**. None is planned.
- A desktop download, if wanted for Steam, wraps the same build (Electron or Tauri). No rewrite.

### 20.3 Mobile version
**Approach: one build, touch-aware from day one.**

| Area | Mobile design |
|---|---|
| **Logic** | Combat runs on a **fixed 60 Hz logic clock** independent of render frame rate, so a 30 fps phone plays *exactly* the same frame data as a 144 Hz PC ✅ *built* |
| **Controls** | Floating virtual stick (left half), on-screen buttons (right): Slash, Heavy, Dodge, Jump, Guard, Gale, Lock; drag the upper right to orbit the camera. Touch, keyboard, and gamepad all produce the same intents, so **gameplay code is identical** ✅ *built*. Later: a **Magic button** that opens the 4-spell ring; Ultimate and Team Attack appear when charged |
| **Touch assists** (on by default on touch; **AST** button) | +3f parry and perfect-dodge windows; **Smart Combo** (hold Slash to continue the string) ✅ *built*. Assists never change damage |
| **Fairness** | Only **1** enemy attacks at a time on mobile (2 on PC) through the attack-token pool ✅ *built* |
| **UI** | Touch HUD layout, safe-area aware for notches ✅ *built*; the frame-data panel starts hidden |
| **Rendering** | Mobile tier: render resolution capped at 1.5× pixel ratio, smaller glow buffer, fewer arena props and particles ✅ *built*; later dynamic resolution |
| **Suspend & resume** | Autosave when the tab is hidden (`visibilitychange`) |
| **Download size** | Engine from CDN (cached across sites), game code ~90 KB today; later, art streams per zone as compressed glTF (Draco/KTX2) |
| **Thermals & battery** | "Battery Saver" caps at 30 fps with lower resolution |

> **Director's Note: the cost of mobile.** Browser mobile is far cheaper than native mobile (no stores, no second build, no device-specific SDKs), but touch controls, a second HUD layout, and testing on real phones still add roughly **15–20%** to production. Fixed-step logic and the input abstraction, both already built, are what keep it there.

**Supporting stack:**
| Need | Choice | Why |
|---|---|---|
| Engine | **Babylon.js 9** from jsDelivr | Free; cel shading (`CellMaterial`), outline renderer, glow layer, glTF, animation groups, WebGPU path |
| Language | Modern JavaScript (ES modules) with JSDoc types | No compile step for logic; type-checkable later with `tsc --checkJs` |
| Build | **esbuild** → one self-contained HTML file | Sub-second builds; publishes anywhere, including as a Claude artifact |
| Tests | `node --test` | The combat core and fight simulation run headless, without a browser ✅ *39 tests* |
| Input | Own `Controls` layer: keyboard, mouse, Gamepad API, Pointer Events | One intent stream for every device ✅ *built* |
| Camera | Own camera director (follow, lock-on, shake, punch-in) | Replaces Cinemachine; states as data later |
| Cinematics | JSON timelines played by the same event system as abilities | Replaces Unity Timeline |
| Dialogue | **Decided (Phase 3):** a **Yarn-style plain-text script** with our own small parser (`core/script.js`) | Writers get Yarn's familiar syntax (nodes, options, `<<if>>`, `<<set>>`, `<<jump>>`); the game gets zero dependencies, a tiny download, and parse errors with line numbers |
| Audio | Web Audio API: synthesized placeholders now ✅ *built*; recorded SFX and adaptive music layers later | Free; no middleware |
| Art pipeline | Blender → glTF 2.0 (Draco meshes, KTX2 textures) | The web's native 3D format |
| Data | Plain JS/JSON modules (abilities, enemies, combo graphs) | Designer-editable; validated on load ✅ *built* |
| Save | Versioned JSON in IndexedDB, with export/import | Debuggable, migratable |
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
                          (animation groups +     (FeedbackData: VFX from pool, Web Audio SFX,
                           controllers, stepped    CameraCue, hitstop, rumble)
                           playback)                    │
                                                        ▼
                                                CameraDirector (camera states:
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

### 21.3 Core data schemas (JS data modules, validated on load)
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
| Area | Strategy / budget: **PC browser** 60 fps @ 1080p on 2020+ integrated graphics · **Mobile browser** 30 fps floor (60 target) on 2021+ mid-range phones (e.g., Snapdragon 7-series, iPhone 12+) |
|---|---|
| Characters | Hero 30–50k tris + 2 LODs (mobile uses LOD1, ~15k); enemies 8–20k; texture atlases; shared materials. *(Today: procedural placeholder rigs from primitives.)* |
| Enemies | Max 8 active in combat (mobile: 5); attack tokens; pooled |
| VFX | Pooled; per-spell particle budget (≤ 300 normal, ≤ 1500 ultimate; **mobile: half**); flipbooks over simulation |
| Hitboxes / projectiles | Exact box-vs-capsule tests in the pure-JS simulation; no physics engine in combat ✅ *built* |
| World | Zone streaming (lazy-loaded glTF per zone), occlusion queries, LODs, baked lighting where possible |
| NPCs | Distant NPCs are animated impostors / no AI; crowds are cosmetic |
| Animation | Shared animation groups retargeted across characters; stepped (on-twos) playback halves evaluation cost |
| Physics | Minimal rigidbodies; scripted debris for destruction (pooled, timed despawn) |
| Memory | Async loading; unload previous zone; audio streamed |
| GC | Pooled VFX, sparks, and damage numbers; no per-frame allocations in combat hot paths; profile with Chrome DevTools every phase |
| Draw calls | PC ≤ 1,000; **mobile ≤ 250** (thin instances, merged static meshes, atlases, frozen materials) |
| Memory (mobile) | ≤ 600 MB for the tab on a 4 GB phone; dispose each zone's assets on exit |

### 21.8 Project layout
The game lives in **`game/`**. The rule from the Unity plan still holds: **logic never touches rendering**. `src/core/` and `src/sim/` are pure JavaScript, unit-tested in Node; `src/runtime/` is the thin Babylon layer that only *reads* the simulation and its events.
```
game/
  src/core/     input · timing · stats · combat rules · abilities + combo graph · enemy AI   (pure, tested)
  src/data/     rook.js (moveset, poses, hitboxes) · acolyte.js                              (designer data)
  src/sim/      world.js (the fight: movement, hitboxes, juggles, parry, Afterimage) · overlap.js   (pure, tested)
  src/runtime/  rig · vfx · audio · controls · camera · hud · arena · look                  (Babylon + DOM)
  src/main.js   wires sim → presentation
  test/         node --test suites (core, abilities, ai, sim)
  template.html · build.mjs → dist/index.html (one self-contained page)
  … later: src/story/ (flags, quests, dialogue) · src/party/ · src/save/ · assets/ (glTF, audio)
```
How to run, test, build, and publish: `docs/DEV.md`.

---

## 22. PROTOTYPE SCOPE (PHASE 1)

**Goal: prove the combat is fun with grey boxes.** If it's not fun with a capsule, art won't fix it.

**In scope**
- 1 character: protagonist (placeholder humanoid built from primitives, posed procedurally from frame data), **Duelist** stance.
- 1 weapon: sword. ComboGraph: L×4, L-L-H launcher, air L×3, air slam, dash strike, parry counter.
- 1 spell: **Gale Cutter** (launcher, applies AIRBORNE). Spell cancels from light attacks.
- Movement: run, jump, double jump, air dash, lock-on.
- Defense: dodge with i-frames + perfect dodge (Afterimage), block + parry.
- Health, Mana (melee regen), enemy Posture + Stagger.
- 1 enemy: **Choir Acolyte** (sword; 3 attacks incl. one unblockable), FSM AI, attack token system (spawn 3 to test it).
- 1 small arena (grey box, a couple of pillars).
- Feedback: hitstop, camera shake, basic hit VFX (pooled), placeholder SFX.
- Debug HUD: frame data, input buffer display, FPS.
- **Mobile smoke test:** the same page on a mid-range Android phone and an iPhone with on-screen controls (end of phase).

**Out of scope (deliberately):** story, dialogue, party, grimoire UI, saves, ultimates. *(Basic cel shading and outlines came in early because Babylon provides them for free.)*

**Progress** (all playable at the artifact link; details in `docs/DEV.md`):
| Step | Content | Status |
|---|---|---|
| 1 | Input intents + buffer, fixed 60 Hz clock, resources, ability runner | ✅ Done (Unity), ported to JS |
| 2 | Combo graph, hit/block/parry/dodge/posture rules, movement, hitboxes, Acolyte AI with attack tokens | ✅ Done (Unity), ported to JS |
| **3** | **Feedback and rewards:** hit sparks, starburst flashes, blade trails, damage numbers, hitstop shake, camera shake and punch-in, impact frames; **parry → Counter**; **perfect dodge → Afterimage** (enemies at 0.35× for 0.6 s, 3 s cooldown, ghost trail); **posture break → Lantern Break** (priority route that cuts any recovery, cinematic slow-mo on the kill); synthesized SFX; touch controls; frame-data panel | ✅ **Done** (Babylon.js) |
| 4 | **Movement and spells:** double jump and air dash (once per airtime), lock-on switching (and the lock moves on when a target dies), juggle height rules (air hits hold the target at Rook's height; the slam spikes it down), **Vacuum Pull** (pulls targets to Rook, even into the air), **Tempest Edge** (data only), melee hits refill mana | ✅ **Done** |
| 5 | **Performance and mobile:** no allocations in the fight simulation, pooled render effects, adaptive resolution, FPS readout, auto-pause on tab switch, **touch assist** (+3 frame parry and perfect-dodge windows, hold Slash to keep comboing), spell slots in the HUD | ✅ **Done** (real-phone check is yours, below) |

**Definition of Done review (end of Phase 1):**
| # | Criterion | Result |
|---|---|---|
| 1 | The signature chain executes reliably with no dropped inputs | ✅ Automated test runs the exact chain (L, L, Gale Cutter, jump cancel, air L ×2, air dash, air L, slam): all 7 hits land, in Node and in a real browser |
| 2 | Perfect dodge and parry learnable within 5 minutes | ⏳ Needs people playing it. Prompts, help screen, and the touch assist are in place to help |
| 3 | 3 acolytes stay readable | ✅ Attack tokens: never more than 2 attackers (1 on mobile), tested |
| 4 | A new spell needs only data + VFX | ✅ Tempest Edge was added with zero changes to the simulation or core (verified by diff). Vacuum Pull needed one new reusable hit property (`pull`) |
| 5 | No per-frame allocations in combat hot paths | ✅ The fight simulation allocates nothing per frame (heap-profiled in Chrome). Rendering allocates a few KB per frame inside Babylon itself |
| 6 | Runs on a mid-range phone at 30 fps or better with touch | ⏳ Built and tested at phone size in a browser; needs a check on a real phone |

**Phase 1 gate:** "Is the combat fun with grey boxes?" That answer comes from playing it. Phase 2 starts once the owner says yes.

**Definition of done:**
1. The chain *L → L → Gale Cutter → jump-cancel → air L ×2 → air dash → air L → slam* executes reliably at 60 fps with no dropped inputs.
2. Perfect dodge and parry feel learnable within 5 minutes.
3. 3 acolytes at once stay readable (token system works).
4. Adding a second spell takes **only a new data asset + VFX**, with no code changes. (This proves the architecture.)
5. No per-frame allocations in combat hot paths (Chrome DevTools memory profile).
6. The same page runs on a mid-range Android phone at 30 fps or better with on-screen controls, with identical frame data.

---

## 23. DEVELOPMENT ROADMAP

Estimates assume **1–2 people, part-time-ish**. Every phase ends with a **go/no-go gate**.

| Phase | Content | Estimate | Gate |
|---|---|---|---|
| **0: Pre-production** | This GDD → approval; style tests (one cel-shaded character still); input + feel references | 2–3 wks | Foundation approved |
| **1: Prototype** | §22 | 6–10 wks | "Is the combat fun with grey boxes?" |
| **2: Combat Vertical Slice** | 3 characters (Rook + 2 AI companions w/ assists), 5 enemy types, 1 mini-boss (Hask), tag/reaction system, 4 spells + page evolution, data-driven camera states, cel-shading v2 (custom toon shader), impact frames, 1 ultimate (Skyrender), combat HUD | 3–5 months | A playable 10–15 min combat run that *feels anime* |
| **3: Story Vertical Slice** | Episodes 1–3 playable: Tower, Exam duel (B1), Lighthouse hub, ink/Yarn dialogue, flags, saves, first storyboarded cutscenes, title cards + next-episode preview; **fake-death setup lines planted** | 4–6 months | "Does it feel like an anime episode?" Playtest with outsiders |
| **4: World** | Aurelin hub, Greywater Fens, Thornwick, Undercroft; NPCs, shops, zone streaming, squads, reputation | 6–9 months | Performance budget met in the largest zone **in a PC browser and on the mobile reference phone** |
| **5: Full RPG** | Progression, equipment, bonds + bond events, party switching (3 chars), crafting-lite, HQ upgrades, quests, Arc 1–2 bosses, hidden lore | 9–12 months | Arc 1 + 2 complete, content pipeline proven |
| **6: Narrative Expansion** | Arc 3+, Cal's death & clue network, Brannoc, the Sable Knight encounters, transformations, the Siege of Aurelin reveal | ongoing | Mystery playtest targets met (§15.5 note) |

### 23.1 Phase 2 plan (Combat Vertical Slice)
| Step | Content | Status |
|---|---|---|
| 1 | **Surge** gauge (fills from damage dealt and taken, parries, perfect dodges, reactions) · **Skyrender** ultimate on the §19.4 template (time stop, activation, charge orbit, close-up with name card, release, aerial combo, impact frame, aftermath, return) · **data-driven camera shots** (`runtime/shots.js`) · **Tags & Reactions engine** (§7.2) with its first row: heavy finishers MARK, any spell **Detonates** the mark with splash | ✅ Done |
| 2 | **Companions Bas (Stone) and Juno (Thread).**<br>• **AI:** they follow in formation and fight by stance. **Press** hunts the player's target. **Guard** stays close and intercepts attacks on Rook, and Bas casts **Bastion Wall** (half damage). **Support** hangs back, and Juno **Stitches** wounds.<br>• **Assist calls:** Bas blinks in with **Pillar Uppercut** (launch, re-launches juggled foes, ANCHORS). Juno with **Snare Line** (BINDS: can't move).<br>• **Squad reactions:** **Taut Line** (anchor + bind: long stagger), **Slingshot** (bind + wind: fling), **Shatterstone** (anchor + heavy: splash).<br>• **Team rules:** enemies target the whole team. Downed companions get back up after 10 s. The combo counter and Surge are shared | ✅ Done |
| 3 | **The Greywater Fens roster (five types):**<br>• **Choir Acolyte:** swordsman.<br>• **Fen Hound:** pack rusher with a lunge.<br>• **Choir Cantor:** ranged sound bolts, plus a **Hymn** that WARDS allies (super armor, -30% damage).<br>• **Choir Bulwark:** tower shield that blocks everything from the front, unless it's attacking or BOUND.<br>• **Bog Beast ★:** elite brute. Heavy: no launch or pull until its posture breaks. Armored attacks; unblockable mud slam.<br>**Projectiles:** your sword cuts them out of the air; they can be parried and dodged, and they freeze during time stop. **Dispel** reaction: wind on a warded foe. **Juggle decay:** each air hit adds 12% gravity, up to 2.5x | ✅ Done |
| 3a | *(engine)* Data-driven enemy roster (`data/enemies.js`) and wave list; four-legged character form | ✅ Done |
| 4 | **Hask the Bogwarden** (§16 B2), boss with a scripted controller (`sim/boss.js`):<br>• **P1:** dives; a mud mound hunts you; ground-skimming mud waves make you **WEIGHTED** (slow, low jumps; Juno's Stitch cleanses). It erupts under you after a **red warning circle**. **Wind on the mound UPROOTS it** (launched, stunned, posture damage).<br>• **P2 (65%):** roars and **calls two Fen Hounds out of the bog**; triple mud waves.<br>• **P3 (35%):** **the bog drains** (the arena visibly changes); no more dives; **EXPOSED** (+50% damage and posture); Belly Flop and Charge.<br>Plus a title card, a boss bar with phase marks, and the *Vacuum Pull* page drop. *Deviation:* the P2 log barricade is postponed to the Fens level-art pass (it needs level geometry); the hound call fills that strategy-shift slot | ✅ Done |
| 5 | **Page evolution, cel-shading v2, HUD, and the combat run:**<br>• **Four spells:** Gale Cutter, Vacuum Pull, Tempest Edge, and the new **Wind Wall** (Y): a standing wall that stops enemy bolts and pushes foes back. Each spell earns page XP on hits. A full page **evolves** into one of two branches you choose (**P** opens the pages): Twin Cutter / Gale Lance, Maelstrom / Undertow, Cyclone / Tempest Step, Mirror Gale / Downdraft.<br>• **The combat run:** *Episode 4 · The Village That Wasn't There*, seven encounters in the Greywater Fens ending with Hask. It has title cards and squad lines between fights, a rest that heals between encounters, a retry on a wipe, and a results screen with a rank (S/A/B/C) from time, damage taken, best combo, reactions, and retries. Run time is about 10–15 minutes.<br>• **Cel-shading v2** (§19.6.1): a custom toon shader with hue-shifted shadows, a rim light, a hair angel ring with white streaks, tinted outlines, and anime eye highlights. The color grade (saturation and contrast) runs in the shader, with a soft cool vignette. Any device that can't compile it falls back to the classic material on its own.<br>• **HUD:** dynamic spell chips with page XP, party cards with stances, status chips, combo grades, subtitles, and a results screen | ✅ Done |

**Phase 2 gate review.** The gate is *"a playable 10–15 minute combat run that feels anime."*
- **Built and checked:**
  - Every item in the Phase 2 row of §23 exists: 3 characters with assists, 5 enemy types, a mini-boss, reactions, 4 spells with evolution, data-driven camera shots, the toon shader, impact frames, one ultimate, and the combat HUD.
  - 95 automated tests pass.
  - The full run plays start to finish in a desktop and a phone browser.
- **Your call:** whether it *feels anime* is a human judgment. Play the run from the start screen ("Play Episode 4"). Tell me what feels flat (hit weight, camera, readability, pacing) and I'll tune it before Phase 3.
- **Known gaps carried forward:** Hask's P2 log barricade (it needs level art); real character models and animation (the current blocky rigs are placeholders, §20); voice.

**Honest scope note:** a three-arc release (Episodes 1–28) is already a substantial game. Consider shipping **Arcs 1–3 as "Season 1"**. It ends with the Sable Knight at Aurek's grave, a perfect anime season cliffhanger that points players toward the wrong answer. Arcs 4–7 become Season 2, with the reveal as its centerpiece.


### 23.2 Phase 3 plan (Story Vertical Slice)
| Step | Content | Status |
|---|---|---|
| 1 | **Story engine and Episode 1 (graybox).**<br>• **Engine:** the **FlagStore** with a safe condition language, **Yarn-style dialogue scripts** (options, Temper tags `#bold` / `#earnest` / `#wry`, `<<if>>`, `<<set>>`, `<<jump>>`, host commands), and **name and pronoun tokens** (`{name}`, `{they}`, `{is}`, `walk{s}`…).<br>• **Saves:** versioned saves with migrations, an autosave at every beat, and Continue from the title screen.<br>• **Episode flow:** the **EpisodeDirector** (cold open, title card, scene, fight, "WHAT HAPPENS NEXT?" preview).<br>• **Episode 1, The Tower of Choosing**, playable start to finish: name and pronouns, the Larkspur cold open, Severin, Brother Moss, the one-page grimoire, the Choir attack as the first combat tutorial (one page, no ultimate, no squad yet), and the "…It's you" hook.<br>• **Scenes:** auto-framed close-ups and over-the-shoulder reverse shots. *Staged in the yard for now; Step 2 builds the Tower* | ✅ Done |
| 2 | **Cutscene director and the Tower of Choosing:**<br>• **Timeline cutscenes** as data (`data/story/cutscenes.js`): camera keyframes with easing and hard cuts, captions, sounds, actor walks, and fades. Skippable.<br>• **The 3D Larkspur cold open:** the village burning at night with fire, smoke and embers, a crane down into the street, and the silhouette walking out of the flames carrying the infant.<br>• **Story sets** with their own sky, fog and character lighting: the **Tower steps** (morning: the tower, stairs, banners and waiting candidates) and the **Tower hall** (stained glass, light shafts, drifting grimoires, a dais of light; the windows go dark when the Choir sings). The Episode 1 fight takes place in the hall.<br>• **Staging commands** for scripts: `<<move>>`, `<<face>>`, `<<pose>>` (point, raise, cross arms, bow, tilt…), `<<show>>`/`<<hide>>`, `<<cue>>`. Speakers bob while they talk, and close-ups re-aim when someone turns.<br>• **Grimoires descend:** Severin's seven-clasp tome and Rook's thin one float down out of the light | ✅ Done |
| 3 | **Episode 2, The Knight Exam:**<br>• **The exam grounds:** an arena under open sky with full stands that cheer, the captains' box, and the seven squad banners.<br>• **Trial of the Pack:** a hound fight that teaches dodging, perfect dodges and parries.<br>• **Boss 1, Severin** (`data/severin.js`, `SeverinController`). P1: Star Needles in fans of three, a rapier lunge and flurry, a backstep. P2 (60%): he takes his **Polaris** point and pins five stars joined as a constellation. The lines glow red, then strike: jump or dodge through. **Knock him off Polaris** and the stars go dark while he reels.<br>• **Getting up:** you can get back up three times (`EXAM_GET_UPS`). Winning and losing both continue (`EXAM_DUEL_WON`), with different scenes.<br>• **New cast:** Dagrun, Cal, Corvina, Brannoc, Ysolde, and the Proctor. The draft ends with Dagrun's *"I'll take the one-pager."* | ✅ Done |
| 4 | **Episode 3, The Lighthouse with No Sea:**<br>• **The Lighthouse hub** (`lighthouse` set): the lighthouse with its sweeping beam, the keeper's house, the lantern rack, the dinner table, a training ring, and stranded boats on the dry Sea of Marrow. Dusk fades to night.<br>• **Exploration beats:** walk freely, talk to whoever is close (a talk prompt plus the Slash button), with an objective tracker. Each character has a first talk and a repeat line.<br>• **The squad:** Juno, Bas, Lio and Tamsin join the cast, along with Dagrun asleep in his chair.<br>• **Sparring with Cal:** the dodge lesson (red-glint thrusts, perfect dodge into counter, parries). His own evasions follow a fixed rhythm that the game never points out.<br>• **Threshold:** Cal's golden door of light, and the rule *"A door I open, I can only close from the other side."*<br>• **Dinner:** the lantern speech, Cal's four-note tune, his joke about dying, and your own lantern lit on the rack | ✅ Done |
| 5 | **Episode 4 story wrap** (the Mirren choice around the existing combat run), episode select, manual save slots, polish, and the **gate review**: *"Does it feel like an anime episode?"* | — |

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
| Hidden Star Rating (§25) | Yes (story spine) | Yes, once visible (Star Sight) | A single hidden data field | Trivial | Yes | Yes | **Keep; no hidden combat math** |
| Backlash (playable flashback, Ep 49) | Yes | Yes (a new perspective, new verbs) | **Reuses Demon Soldier kit + Demon Continent map (Arc 7)** | Yes | Yes: 8 chapters, 30–60 min | Yes | **Keep; prototype after the combat core (`docs/BACKLASH.md` §26)** |
| A third "isekai" world | No | No | — | — | No | — | **Cut; the second world is Liraen** |
| Masked-survivor clue network | **Yes** (the defining story beat) | Yes | Flags, Echo lines, and Theatre mode serve other mysteries too | Trivial | Yes, if scoped to ~20 authored clues | Yes | **Keep; cap at the ledger in §15.5** |
| Playable Cal after reveal | Yes | Yes | **Reuses the Sable boss AbilityData** | Yes | Yes | Yes | **Keep** |
| Siege of Aurelin "massive battle" | Yes | Yes | Staged-chaos tools reused for later wars | Only if staged | Yes, if staged | Yes | **Keep; authored chaos, never simulated armies** |
| Theatre mode (frame-step replay) | Yes | Yes (rewatch payoff) | All cutscenes | Reuses Timelines | Yes | Yes | **Keep** |
| Full voice acting | Not yet | Yes later | — | — | Not for prototype | Yes | **Placeholders (`VOICE_PLACEHOLDER`)** |

---

## 25. THE HIDDEN STAR RATING 🔒

### 25.0 OBJECTIVE
A secret layer of the cosmos that no ordinary being can see, which grows more important across the story until it becomes the battlefield of the finale. It ties together both worlds, the Goddess Saint's *Sacrifice*, reincarnation, the Demon Lord King, Cal, and the meaning of the title *Unwritten*.

### 25.1 DESIGN: The rules
| Rule | Detail |
|---|---|
| **The scale** | 0★ → 1★ → 2★ → 3★ → 4★ → 5★. Every living being in both worlds has a rating |
| **Nobody can see it** | Not their own, not anyone else's. Nobody knows the system exists. People just assume strong warriors are naturally stronger |
| **No confirmed 5★** | No 5★ being has ever existed, as far as anyone knows. 🔒 In Backlash, the King sees the Knight reach 5★ and makes two 5★ archdemons of his own (§28). Nobody but the King and Cal knows |
| **The first anomaly** | The **Demon Lord King is 6★**, beyond the scale. He can **perceive** ratings and senses something beyond the world's limits |
| **Sacrifice** | The Goddess Saint's prayer. She gives up her life and is reborn **one star lower**; one chosen ally gains that star |
| **0★: the unknown** | 🔒 What happens at 0★ is **not known, even to the design canon yet**. Cal reached 0★, apparently died, and was taken alive by the **Void Figures** (§28) before waking in Liraen. Whether every 0★ being is collected, and whether the figures *cause* reincarnation, is deliberately undecided (§28.5) |
| **The second anomaly** | 🔒 **Cal** after reincarnation: he perceives ratings, and his own reads as **"★?"**, unreadable even to the King |
| **The third anomaly** | 🔒 **Rook** reads as **"∅"**: not 0★, but *no rating at all*. The only survivor of an erasure (Larkspur). The system never wrote them. This is why Cal saved the baby, why the Palimpsest chose them, and what *Unwritten* means |

### 25.2 CONTENT: Ratings (designer-only data; never shown in game before Star Sight)
| Being | Rating | Notes |
|---|---|---|
| Liraen civilians | 0–1★ | 0★ beings are rare and fragile (see Larkspur) |
| Most magic knights | 1–2★ | Rook's squadmates start here |
| Squad captains, Hesper, Severin (late) | 3★ | Dagrun is a quiet 3★ |
| Paragon Elias Thorne | 4★ | The strongest human in Liraen |
| Demon Soldiers (incl. Ash Line Eleven) | 1★ | Disposable by design |
| Demon Commanders Ghorran & Vaelith | 3★ (Backlash) → **5★** archdemons | The King believed nothing was stronger. Then he made them stronger |
| Knight Hero (Corin) | 3★ → 4★ → **5★** (both in Backlash) | Reaches 5★ in the throne room and loses anyway. By Arc 7 he is the first 5★ anyone *outside* the throne room knows of |
| Goddess Saint (Maelis) | 4★ (Backlash) → **1★** (Arc 7) | She has sacrificed again and again. One more, and she falls off the page |
| King A (Teo) | 3★ | Dies permanently in the Backlash Arc; replaced by "King B"… by Arc 7 the archer is "King D" |
| 🔒 **The Clergy Duo** (Ghorran & Vaelith, reborn) | **5★** | Exclusive, rare NPCs; archdemons created by the King's Aura Sacrifice (§28) |
| Demon Lord King | **6★** | First anomaly. Asleep in his coffin since Backlash (a 1000-year slumber) |
| Cal | **★?** | Second anomaly |
| Rook | **∅** | Third anomaly |

### 25.3 PLAYER EXPERIENCE: How ratings are revealed (never through UI before their time)
| Stage | How the player learns | When |
|---|---|---|
| Nothing | Ratings are completely invisible. Strong things are just strong | Arcs 1–5 |
| A hint | Cal's offhand remarks: *"That one's tougher than he looks"*, always right (Arcs 1–2). Alibi: he's experienced | Arcs 1–2 |
| The concept | **Backlash** (Ep 49): as Ash Line Eleven, the player sees heroes return stronger and the Saint's light pass between them, but **can't see stars**. Then, for **one cut through the King's eye** (CIN-03), ★ glyphs appear over the ranks. After reincarnation (Ch 6–8), the player sees ratings **as Cal does**, over everyone, and nothing over the infant. On returning to the present, the stars vanish: Cal has seen them all game | Ep 49 |
| A word for it | Cal's Field Notes list a ★ count for every Lantern, in his hand | Arc 6 |
| **Star Sight** | During the **Rite of Waking**, the rite is written onto the hidden system itself, and everyone inside its circle is *forced to see*. From here on, the UI shows ratings above enemies and allies, rendered as ink stars. Above Rook's own head: **nothing** | Arc 7 |

> **Director's Note: hidden stats must never feel like cheating.** Ratings **do not drive any hidden math** in normal combat. A secret multiplier the player can't see or affect feels arbitrary and unfair. Instead, ratings are used for (1) narrative, (2) **enemy tier design** (a 3★ enemy is designed as a miniboss-class threat), and (3) **visible set-piece rules** after Star Sight (e.g., the King's aura shrugs off attacks from beings two stars below him, shown on screen, explained by the fiction, and solved by the Shared Star). Normal Levels (1–60) stay the player's visible progression.

### 25.4 The finale rule-break: the Shared Star 🔒
Every star transfer the world has ever seen was a **trade**: the Saint pays with her rating, soldiers pay with their lives, Cal paid with his world. In the final battle (§27), Rook's companions **give** stars to Rook freely, expecting nothing. The system has no rule for a gift. **The givers lose nothing.** Rook, who has no rating to add to, becomes something the scale cannot describe. Bonds are the one power the hierarchy cannot count.

### 25.5 Director's proposal (needs your call): the deepest layer
The Goddess Trial runs on monthly cycles, resurrection, ratings, and designations, and the King is described as an *"abnormally powerful NPC."* A possible final truth: **the Demon Continent was built by the Goddess as a training ground.** The demons were made to be defeated, and the heroes are sent in to grow stronger. The King knows this and accepted it. Ash Line Eleven is a training enemy that asked *why*. That would make his story, literally, an NPC walking out of the game.
- **For:** it answers *"where do the heroes come from"* and *"who wrote the ratings"*, and it's thematically perfect.
- **Against:** meta reveals can feel cold if overplayed, and it raises questions about the Goddess (and the Scribe) that would need a sequel.
- **Recommendation:** hint only (the Field Notes' last page; the King's final words), and never confirm in this game. Tell me if you want it confirmed, hinted, or cut.

---

## 26. BACKLASH: "THE SOLDIER WHO REFUSED TO REMAIN A SOLDIER" 🔒

> **Full production package: [`docs/BACKLASH.md`](BACKLASH.md)**, covering the story, 8 chapters, playable and cinematic sequences, combat encounters, both of Cal's movesets, Hero Party / Demon Army / Commander / King AI, the Sacrifice mechanic, Star Rating integration, reincarnation gameplay, transition/camera/dialogue/audio/VFX/animation systems, 10 five-column storyboards, saves, performance, architecture, code sketches, and the prototype plan. This section keeps only the world and character canon that the rest of the GDD depends on.

### 26.0 OBJECTIVE
A **30–60 minute playable flashback** (Ep 49) placed *inside* the reveal fight. Present-day Cal opens a door into his own memory, and the player **becomes him**:
- a disposable 1★ Demon Soldier (Ash Line Eleven),
- the questioning demon who watches the monthly Goddess Trial, learns the Saint's *Sacrifice*, and kneels: *"For the Demon King,"*
- a reincarnated human in Liraen, powerful, rejected, studying.

Then the player returns to the frozen battlefield and Cal's smirk. It should make the player understand that he **wasn't born evil**: he was born into a hierarchy, questioned it, died, was reborn, became powerful, and built his own philosophy:

> ***"If the world treats everyone like pieces, I'll become the person moving the pieces."***

**The test:** the player finishes it thinking *"I WAS Cal,"* and, at the smirk, *"I was playing the villain before I even knew he was the villain."*

### 26.1 Structure at a glance
| Ch | Title | Cal | Key beat |
|---|---|---|---|
| 0 | The Door | Present | *"You really want to know?" … "Then don't just listen."* |
| 1 | The Soldier | #1 | *"Left. Left. Back. Cut."* · *"Continue formation." "Mind the step."* · *"That is enough."* |
| 2 | The Monthly Trial | #1 → #2 | Five condensed Trials; Observe; the order he ignores |
| 3 | The Question | #2 | Forbidden ruins; the King's glance (first ★, through the King's eye) |
| 4 | Sacrifice | #2 | The Saint dies and is reborn; *"…what exactly is death?"* |
| 5 | The Final Battle | #2 | *"For the Demon King"*, but nothing happens; sent back at 0★; cut down; **The Void**: time stops, two strangers in black find the only thing that can move, and it answers them in their language. **Ends on his grin** |
| C1 | *Cal's Path:* Through the Void | #2 → #3 | The laugh; the woman looks back; time resumes; the Astral Path (optional) |
| 6 | *Cal's Path:* The Other World | #3 | Heartbeat; human; burning Larkspur; an infant with no star |
| 7 | *Cal's Path:* The Human | #3 | Rejection; Ascended Demon Slash; Dagrun: *"Nobody's written your story. Good."* |
| 8 | *Cal's Path:* The Mask | #3 → #4 | Ep 18 from his side; Godfall Demon Slash; the mask |
| R | Return (all players, after Ch 5) | #4 | Match cut on the grin. *"So. That's how I died. …The first time."* *"It was an introduction."* → **Perspective Choice** |
| C3 | *Cal's Path:* After the Door (present) | #4 | The coffin; the archdemons waiting; *"You two still haven't told me what I'm for."* |

### 26.2 DESIGN: The Demon Continent (a functioning society)
The Demon Continent is the only known civilization of its world. It's isolated, ancient, and built on one chain of value:

**Hierarchy → Orders → Strength → Service**

| Location | Function | Gameplay use |
|---|---|---|
| **Demon Castle** | The seat of the King; endless corridors of guards | Guard-duty episodes; stealth-like movement where breaking formation is noticed |
| **Throne Chamber** | Enormous; soldiers line every wall; the two Commanders flank the throne | The sacrifice (B8); Arc 7 final battle |
| **The Lines (barracks)** | Soldiers are raised, fed, and housed by Line, not by name | The daily loop: drill → ration → patrol → sleep |
| **Training grounds** | Formation drill: *"Left. Left. Back. Cut."* | Tutorial; the dodge pattern (S3) |
| **Demon villages** | Non-soldier demons: smiths, ash-grain farmers, Line-keepers who raise the young. They never question anything either | Show that the hierarchy is a society, not just an army |
| **Ruined battlefields** | Centuries of Goddess Trials | Exploration; hero relics; an old helm with a scratched tally |
| **Ancient demon ruins** | Glyphs identical to Liraen's Tower murals | Where he finds his questions (and Layer 4 of Arc 7) |
| **Underground caverns** | Forbidden to soldiers | Night exploration; the first rule he breaks for himself |
| **Demon forests** | Black-barked, silent | Patrol routes; where he first tests his limits alone |

**Social rules (shown, never lectured):** soldiers don't have names, only Line designations. You speak only when a higher rank addresses you. You tilt your head toward the rank speaking (S4). When a soldier falls, the column steps over him, and the commander calls ***"Mind the step."*** (S2). Nobody mourns: *"He served."* *"That is enough."*

### 26.3 CONTENT: The power structure
| Rank | Rating | Look | Behavior |
|---|---|---|---|
| **Demon Soldiers** | 1★ | Dark red and black heavy armor, faceplate with vertical slits, **no wings**, near-identical | Obey almost automatically. Don't know magic exists. Don't understand reincarnation. Loyalty = hierarchy |
| **Demon Commanders** | 3★ | Larger, more elaborate armor; **large demonic wings**; bigger weapons | **Ghorran, the Left Wing** (axe, brute force; kills King A in Backlash) and **Vaelith, the Right Wing** (twin spears, precise, cold). The King's only two. Cal never fights either |
| 🔒 **Archdemons (Ghorran & Vaelith, reborn)** | 5★ | Created at the end of Backlash by the King's **Aura Sacrifice**. A butler and a maid; intelligent; able to change form and conceal horns and wings | They took Cal instead of returning to the King. Their places beside the throne have been empty ever since (§28) |
| **Demon Lord King** | 6★ | Unique silhouette, massive dark wings, royal armor, crown-helm. Instantly *not a normal demon* | Calm. Never angry. Casts **without words, by looking**. Believes nothing can challenge him |

### 26.4 DESIGN: Visual design
| Character | Design brief |
|---|---|
| **Demon Soldier / Ash Line Eleven** | Dark red and black, heavy, simple, **no wings**, slit faceplate, plain **ash-glaive** (a long-hafted pole-cleaver). Ash Eleven is **visually identical to the others**. The camera alone tells the player which one they are. He was nobody special |
| **Demon Commanders** | Same palette, larger and more ornate armor, **large wings**, oversized weapons. Clearly superior silhouette |
| **Demon Lord King** | Unique silhouette, massive dark wings, royal armor, crown-helm. Reads as *not normal* at a glance, even in shadow |
| **Hero Party** | Bright, warm palette (gold, white, sky blue) against the continent's ash. They look like heroes, which makes their hatred feel righteous from their side |
| **Cal (Liraen)** | Approachable human: light coat, loose hair, saber, easy smile. Nothing demonic |
| **The Sable Knight** | Mask (slit pattern from the Demon Soldier faceplate), long coat over armor, pauldron modeled on demon plate, black glaive (the ash-glaive reborn) |
| **Cal, final (Arc 7)** | Demon Soldier + human + god-like: his face uncovered, the faceplate motif as a crown-like crest, faint ink-star markings along his arms, floating door frames orbiting him, and a soft aura that makes the air ripple |

**The weapon's evolution:** ash-glaive (Backlash, 1★ soldier) → saber (Liraen disguise; the drill hidden inside a sword style) → black glaive (the Sable Knight) → the god-like glaive (Arc 7). One motion runs through all of them: **Demon Slash → Ascended Demon Slash → Godfall Demon Slash** (`docs/BACKLASH.md` §7.1).

### 26.5 CONTENT: The Demon Lord King
- **Abilities:** magic (which no one else on his continent understands; to his subjects it is simply what the King *does*), instant casting, silent enchantments, extreme physical ability, **perception of the Star Rating**, and abilities nobody has ever seen.
- **Worldview:** nothing in this world can challenge him. His commanders are the strongest beings he has ever needed. He has never met anything above them.
- **Arc of his assumption:** Backlash Ch 3: he looks once at Ash Line Eleven and sees a 1★ nothing. End of Backlash: emptied by the Aura Sacrifice, he lies down in his coffin for a thousand years. Siege of Aurelin: his coffin stirs when a masked stranger kills his Marshal. Arc 7: he sleeps on while his archdemons try to sacrifice themselves and Cal to wake him. **He does not wake in this game.**
- He is not a cartoon tyrant. He is the system's apex, and he believes the system is the world.

### 26.6 CONTENT: The Hero Party & the Goddess Trial
Once every month, a Hero Party enters the Demon Continent for the **Goddess Trial**. They despise demons and believe them inherently evil. Their goal: kill demons, grow stronger, reach the King. They lose, retreat, and return stronger. The cycle repeats.

The Goddess designates the heroes by role, not name. **The heroes are numbered too.** (They whisper their real names to each other when they think no one is listening. Ash Eleven hears them.)

| Hero | Rating | Kit | Personality |
|---|---|---|---|
| **The Knight Hero (Corin)** | 3★ | Sword + medium shield: charges, shield parries, counters, defensive positioning | Aggressive toward demons; genuinely wants the King dead. The man Ash Eleven spares (Ch 2, Trial 5) |
| **The Goddess Saint (Maelis)** | 4★ | **Low Heal:** kneels and prays for 10 spoken seconds (vulnerable), then restores a small amount of HP. **Sacrifice:** gives up her life and is reborn one star lower; a chosen ally gains that star | The only being in her world known to use magic; treated as a living miracle. Exhausted, devout, kinder than her party |
| **King A, the Archer (Teo)** | 3★ | Bow: long range, piercing arrows, critical shots, target tracking | Lethal against Demon Soldiers. Killed by Ghorran in Ch 5; the next archer arrives as "King B" |

**"King A"** is the Goddess's designation. The party never questions why it has a letter. By Arc 7 the archer is **King D**. The heroes' side has a hierarchy that treats people as replaceable too, which is exactly the pattern Cal later sees in Liraen: *different world, different species, same hierarchy.*

### 26.7 Themes, made playable
| Theme | Where the player *does* it |
|---|---|
| Hierarchy vs. freedom | The **Orders** UI and the first ignored order (Ch 2, Trial 5) |
| Power vs. connection | The Shared Star beats the Godfall glaive |
| Identity vs. origin | Playing a soldier indistinguishable from his line, then a human who isn't trusted |
| Friendship vs. manipulation | The reveal fight's "board" phase; Field Notes; the three endings |
| Reincarnation vs. destiny | Two sacrifices, one shot list |
| Being used vs. using others | Ash Eleven obeying (Ch 1) → Cal moving Hesper, Aldric, and Rook (Arc 7) |
| What makes someone human? | Demons who ask questions; humans who number their heroes; a demon who kept Juno's knot |

### 26.8 Director's notes (scope)
1. **Second world = Liraen.** Skills are grimoire pages; levels are Levels + Knight Rank; guilds and adventurers are Lowmarket guilds and freeblades. No third world.
2. **Told by Cal, not read from a document.** His narration makes the flashback personal. It also makes him a *curated* narrator whose omissions (three visible splices) pay off in Arc 7.
3. **Cheap to build:** the Demon Soldier kit, Commanders, and King are built once and reused in the Siege and in Arc 7. The Demon Continent map is reused in Arc 7. About 124 new animation clips (`docs/BACKLASH.md` §20), mostly the Hero Party, who return in Arc 7.
4. **Hidden ratings never change combat math** (§25.3).
5. **Naming:** "King A" is lore (the Goddess numbers her heroes). Ghorran, Vaelith, Corin, Maelis, and Teo are original names.
6. **Originality:** Demon Soldier armor must not resemble any famous sci-fi trooper or existing anime demon army: heavy red-black plate, slit faceplates, pole-cleavers, no glossy white. All music is original; the march motif is our own four notes.

---

## 27. ARC 7: "UNWRITTEN" — THE COLLISION OF THREE PHILOSOPHIES 🔒

> Boss details for the Demon Lord King: `docs/BACKLASH.md` §11. Maelis as a guest and *Sacrifice* rules: §12 of the same document.

| Philosophy | Who | Belief |
|---|---|---|
| **Rule through absolute power** | The sleeping Demon Lord King, and the archdemons who worship him | The hierarchy is the world. Strength decides place. The god must return, at any price |
| **Rule through knowledge and manipulation** | Cal | Everyone is a piece. Better to move them than be moved |
| **Strength through bonds and choices** | Rook | People are partners, not pieces |

**Outline (Eps ~59–70):**
1. **The Key.** Rook opens Cal's sealed door with the brass key: *"Doors don't have locks. They have keys."* (S7 pays off.) The Lanterns, Severin, and a reluctant Bas cross to the Demon Continent.
2. **The Continent Today.** The same map as Backlash, fifteen years later. The King sleeps in his coffin; the army still obeys orders fifteen years old, with no one to give new ones. Some Demon Soldiers have started **asking questions** (Cal has been teaching them, as pieces; some remember a soldier who once stepped out of line). Rook's party meets demons who are people.
2b. **The Clergy at the Coffin.** The archdemons return from their travels through time and other worlds. They tend the coffin like priests at a shrine and treat their King as a god. Their plan, which they have **never told Cal**, is the **Rite of Waking**: they will **sacrifice themselves and Cal**, the source of power they found by luck fifteen years ago, to wake their King. Cal believes he is their partner. They are calm, courteous, and give nothing away; their masks never come off.
3. **The Trial Continues.** The present Hero Party: **Corin** (5★ since the throne room fifteen years ago, the only known 5★), **Maelis** (1★, frail; one more Sacrifice and she falls off the page), **King D**. They hate demons, and Rook's friend *was* one. A tense alliance. **Maelis joins as a guest:** Low Heal (10s prayer: protect her), Sacrifice (once per battle: an ally gains a temporary star surge, at a terrible personal cost she keeps offering to pay).
4. **The Soldier Who Stepped Aside.** Corin meets Cal: ***"You. The one who didn't kill me."*** Cal: *"You were more interesting alive."* Then, cheerfully: *"You did kill me, actually. Didn't take."*
5. **The Empty Wings.** The throne room's approach is held by the **Throne Guard Lines** (formation boss fight for Rook's party; Cal is elsewhere). Inside, beside the throne, two places have stood empty for fifteen years. Cal, arriving, looks at them a moment too long.
6. **The Warning.** Rook's party learns the truth Cal doesn't know: the Rite needs three offerings, and Cal is the third. (Sources: the stranded soldier from Arc 6, a Hero Party record of a past Rite, and Elodie, who can hear the march drums on the far side.) Rook tries to tell him. Cal laughs it off: *"They'd have told me."*
7. **Alliance.** The archdemons begin the Rite at the coffin and order the Demon Army's last Lines to protect it. Rook and Cal fight side by side through them. **Cal is playable** (tag-swap); the team attack **Thousand-Door Verse** unlocks (Rook writes a line across the sky; Cal opens a door along every letter). Boss: the **Throne Guard** and the Line Marshals, in formation (the archdemons do not fight).
8. **The Rite of Waking.** The circle closes around the coffin. The rite is written onto the hidden system itself, so everyone inside it is forced to see the stars: **Star Sight**. Rook sees ratings over everyone, ★★★★★ over the butler and the maid, **★?** over Cal… and **nothing** over themself. The archdemons calmly offer themselves, and the circle reaches for Cal. For a moment, his smile falters: he finally understands what he was for. Then he laughs, with something like respect, and **opens a door inside the rite**, taking the power meant for the King for himself. The archdemons' stars pour into him instead. They do not resist; they only turn their masks toward him. **The coffin shudders, and stays shut.** Layer 10 lands all at once: Hesper, Aldric, the Gate, Rook's recruitment, Larkspur (his arrival is what erased it; he didn't choose where he landed, but he never told Rook). He becomes the first being above the scale, and the sky of the Demon Continent **cracks like a page**. *"Now, Rook. Write me."*
9. **Final Battle: Rook vs. Cal.** The arena is the world's page tearing. Cal uses everything: every companion move, every Sable move, and the archdemons' stolen power. Final phase: **the Shared Star** (§25.4). Maelis offers her last star (it would erase her). Juno, Bas, Tamsin, Lio, Severin, and Dagrun offer theirs. Given freely, **nobody loses anything**, and Rook becomes Unwritten. Final clash: the Godfall glaive against the last line of the Palimpsest.
10. **The Clause (ending choice, `CAL_FATE`).** Rook writes one clause about Cal:
    - **"Fall."** He drops to 0★. Time stops. A perfect black circle opens behind him, and a butler and a musician in black step out of it (§28). He laughs: *"Another one? Lucky me."* (Bittersweet; sequel-shaped.)
    - **"Stay."** He is written back to 1★: an ordinary human in Liraen, powerless, alive. *"A soldier again. Huh."* (Grounded.)
    - **"Lantern."** (Requires Juno's, Dagrun's, and Bas's Arc 7 quests resolved and Cal bond ≥ 6.) Rook writes **no rating at all**: *"You're a Lantern. That's all you have to be."* He becomes unwritten too, outside every hierarchy. The last shot is the lighthouse, with his lantern **relit**. (The earned ending.)

All three endings share the same final battle and epilogue structure; only the closing scenes and the Demon Continent epilogue differ (soldiers choosing names in every ending; how far that freedom spreads depends on the choice).

---

## 28. THE VOID FIGURES: THE CLERGY DUO 🔒

### 28.0 OBJECTIVE
A mystery built in two halves. In Backlash (CIN-05B), two impossibly calm figures in black stop time and carry the "dead" Cal away, smiling. Then (CIN-05C) a dark astral path shows them as **archdemons**, horns and wings revealed. Through Cal's dying eyes the player has half-seen where they came from; nobody says it. **Only Cal knows who they are** (and the King, who made them). Nobody, player included, learns *why* they took him in this game unless a later arc is designed to tell it.

### 28.1 Identity canon (DIRECTOR'S EYES ONLY)
**The order of events at the end of Backlash:**
1. Cal kneels, whispers the stolen prayer, and his single star passes **through the King's palm** and fades. He is sent back to the line at 0★ and cut down by the Knight at the throne-room doors. It's a sacrifice **for nothing**, as far as anyone can see.
2. The heroes reach the throne room. Maelis **sacrifices herself again** and the Knight reaches **5★**. The King defeats them anyway, **without standing**; the Goddess's light recalls the survivors.
3. The King **notices**: a soldier's star passed through him, a human reached 5★, and something is wrong with the rules he alone can see. For the first time, he is **confused**.
4. **Within minutes**, he performs the **Aura Sacrifice**: he tears his aura out of himself and pours it into his two trusted Commanders. **Ghorran and Vaelith are reborn as intelligent archdemons**, a butler and a maid, **5★**.
5. Emptied, the King lies down in a black **coffin** behind his throne and enters a **1000-year slumber**.
6. The archdemons, who now treat their King as a **god** and would do anything to have him back, use their new abilities to travel **through time and other worlds**, searching for the power to restore him and **destroying worlds and planets** as they go. (Their black suits come from one of those worlds.)
7. On that road, they arrive **by accident** at the moment of Cal's "death": the black circle, the stopped time. **They don't know who he is.** They walk past him. But he is **the only thing in their frozen time that can move** (a 0★ being is no longer held by it), and he **answers them in their own language**, which he taught himself from the cavern glyphs in Ch 3. They are **excited**: luck, for them, too. They take him down the Astral Path, past the wreckage of other worlds. Cal is grinning.

| | **The butler** | **The maid** (musician) |
|---|---|---|
| **Was** | **Ghorran, the Left Wing** (3★): axe, brute force, killed King A | **Vaelith, the Right Wing** (3★): twin spears, precise, cold |
| **Now** | Archdemon, **5★**, intelligent for the first time | Archdemon, **5★**, intelligent for the first time |
| **Collectively** | **The Clergy Duo** | |
| **Concealed form** (CIN-05B) | Plain black suit, black shirt, tie, gloves, featureless black mask | The same |
| **True outfit** (CIN-05C) | Black suit, **white shirt**, **dark-blue tie** (matches his hair), black shoes. Walks with a hand in his pocket | The same black suit jacket and **white shirt**, a **pink tie** (matches her hair), with a **long black skirt slit high at the side** and **maid detailing** (short frilled apron, frilled cuffs, lace collar, small lace headdress); a slim black **instrument case** on her back |
| **Hair** | Silky **dark blue** with **white and light-blue glossy highlights**. Style from `ref-03`: messy, swept, flyaway strands, long bangs across the mask; kept long, in a low ponytail to the knees | Short, silky **pink**, in **two ponytails**, with **light-pink glossy highlights** |
| **Mask** (true form; never removed) | The **same smooth white mask** as hers, **turned upside down**: closed crescent eyes, a **frown** | **Smooth white, closed crescent eyes, a smile** |
| **Reference art** | Outfit, ponytail, pose: `ref-01` (its mask is retired). Hairstyle: `ref-03-ghorran-hairstyle.jpg` (style only). Mask: `ref-02`, inverted | Mask: `docs/art/clergy-duo/ref-02-smiling-mask.jpg`. Jacket, shirt, tie: ref-01 |
| **Archdemon form** (CIN-05C) | Horns from the brow; the Commander's vast wings, from slits in the coat; mask stays on | The same |
| **As shown** | Unhurried, precise; does the lifting; opens the path | Watchful; **turns back to look at Cal**; hums the army's march as a lullaby |
| **Abilities shown** | **Time travel** and stopping time locally; travelling between worlds; the black circle; the Astral Path; changing form; concealing horns and wings. All of it is **the King's aura** | |
| **Goal** | **Restore their sleeping King**, whom they treat as a god, by any means: across time, across worlds, destroying whatever stands in the way | |
| **Secret plan** | **The Rite of Waking**: sacrifice **themselves and Cal**, the source of power they found, to wake the King. **Never told to Cal.** Their excitement at finding him shows only as calm body language behind unchanging masks | |
| **Status** | **Exclusive, rare NPCs.** Never fought in this game, by Cal or anyone. A future superboss or reveal arc can use them | |

**The King's lost certainty:** he believed nothing was stronger than his Commanders. Then he made them stronger than anything but himself and fell asleep, emptied. For fifteen years the throne has been empty, the coffin sealed, and his archdemons away across time and worlds, searching for a way to bring their god back (Arc 7, §27).

**Did Cal "know"?** The player is meant to read his smile as *"he knew."* The truth: from the Ch 3 mural he knew how a wounded King answers, so he arranged the "wound" (the star through the palm) and gambled that falling to 0★ would *do something*. He did **not** know the archdemons would come; they found him by accident. What he recognized in the frozen moment, faster than anyone, was what they were and what he could be to them. His laugh is a gambler's who just hit a jackpot he never knew was on the table.

**Who knows:** **Cal**, and **the King** (who made them, asleep). The player half-sees the rebirth through smoke and dying eyes (CIN-05B, cut 011) and sees the Commanders' wings on the archdemons (CIN-05C). No character ever says it.

### 28.2 What the player has seen (canon of appearances)
| Fact | Where |
|---|---|
| An ancient mural: a wounded King pouring aura into two Wings, who become human-shaped servants | Backlash Ch 3 |
| Through Cal's dying eyes: the King defeats the heroes without standing, looks at his palm, then pours his aura into the two kneeling Commanders, whose silhouettes fold into human shape | CIN-05B (cuts 004–011) |
| A glitch, a **perfect black circle**, **time stops**; two calm figures in black suits and masks walk past the dead soldier; he **moves and answers them in their language**; they take him; he grins (the flashback ends) | CIN-05B |
| *(Cal's Path)* The laugh; the woman looks back; the void closes; time resumes | CIN-05B-2 |
| *(Cal's Path, present day)* The archdemons waiting by the coffin for Cal: *"You two still haven't told me what I'm for."* They don't answer | CIN-10 |
| The King lies down in a black coffin; the lid closes | CIN-05B (cut 011a) |
| After time resumes: the sealed coffin, the empty throne, the empty places beside it | CIN-05B (cut 050) |
| A **language no one has heard**, never subtitled | CIN-05B, CIN-05C |
| *(Cal's Path)* On a **dark astral path** past the **wreckage of other worlds**: their true **suits and white painted masks**, **horns**, **the Commanders' wings**; their excitement; the maid hums the march; Cal whistles it back; **★★★★★** through Cal's eyes; a doorway at the edge of the Continent | CIN-05C |

### 28.3 Design rules
1. **Calm is the horror.** They never run, pose, shout, threaten, or fight on screen. They walk like people arriving at a meeting, even while transforming.
2. **Smooth is wrong.** As archdemons they are the only characters animated on ones with no anticipation or held frames (`docs/BACKLASH.md` §20.2). As Commanders, before the rebirth, they move like everyone else. The change in animation style *is* the rebirth.
3. **The circle is reserved.** No other effect in the game may use a perfect, smooth, light-absorbing black circle.
4. **Their pressure is the King's.** The Void's dark aura uses the same audio, rumble, and vignette signature as the King's Gaze in Ch 3.
5. **The language is theirs.** It's the archdemons' tongue, built as a small consistent grammar. Cal speaks it; the King understands it. Its meaning sits in a sealed director's envelope.
6. **Masks never come off** in this game. Their faces are reserved for a reveal arc.
7. **No UI ever names them.** No codex or bestiary entry, no name in subtitles (CC: *[Speaking an unknown language]*). The Lore Archive's Theatre lists the scenes as *"Chapter 5 — ???"*.
8. **Cal never explains them.** If asked, his smile falters. It's the only thing that does that.

### 28.4 Foreshadowing & later references (rare by design)
**Budget:** at most **8** references across the whole game, **never two in the same episode**, and never more than one per arc before Arc 7.

| # | Clue type | Where | What happens | Alibi |
|---|---|---|---|---|
| V1 | **Refuses to explain an ability** | Arc 1, Ep 7 bond event | Rook asks where he learned doors. Cal: *"Somebody showed me a door once."* Changes the subject | A deflection; Cal jokes about everything |
| V2 | **The mural + a symbol** | Backlash Ch 3, the caverns | The filled black circle scratched beside a dead soldier's tallies; the mural of a King giving his aura to two Wings; a **memory splice** right after Cal studies it | Ancient history; a scratch |
| V3 | **Records of disappearances** | Arc 6, Silent Quill archive (side quest) | Centuries of vanishings: witnesses report *"the world held its breath"* and *"two people dressed for a funeral, one of them humming."* One entry: a shepherd near Larkspur, fifteen years ago, *"lost a moment of time."* | Folk superstition, filed under *Unexplained* |
| V4 | **Someone mentions "black figures"** | Arc 6, a stranded Demon Soldier in Liraen | *"The Wings left the King. Now the black ones come for those who fall wrong."* He won't say more | Battlefield superstition |
| V5 | **Cal recognizes the clothing** | Arc 7, Juno's sketchbook | A stranger once commissioned two odd outfits from Juno: two black suits, one with a **dark-blue tie**, one with a **pink tie** and a **long skirt slit to the thigh**, and in the margin, the same white mask drawn twice: once **smiling**, once **upside down, frowning**. Cal goes quiet for a full beat. *"Don't make those for anyone."* | Juno: *"…Fashion critic now?"* |
| V6 | **Quiet about portals** | Arc 7 banter skit | Tamsin: *"Why don't you just portal us to the throne room?"* Cal: *"Doors, Tamsin. I make doors."* Not a joke, for once | He's touchy about his magic |
| V7 | **Direct question** | Arc 7, after the alliance | Rook: *"The two in black. Who were they?"* Cal's smile falters, the only time in Arc 7. *"…Family. Sort of. Not yet."* | — |
| V8 | **The sleeping King recognizes the language** | Arc 7, at the coffin | Cal mutters the three syllables he whispered as he "died." From inside the sealed coffin, **one word answers** in the same tongue. The archdemons go perfectly still. Cal, for once, says nothing | — |

### 28.5 Still open (deliberately)
The **who** and the **how** are decided. These stay undecided until a later arc needs them:
- What becomes of the archdemons after Cal takes their stars in the Rite (they gave themselves willingly; they fall to 0★).
- What Cal believed he was getting from them all those years, since they never told him his part.
- Which worlds they have destroyed, and whether Liraen is on their list.
- How their time travel works, and whether they have already visited Liraen's past (the Sea of Marrow, drunk dry a century ago? Larkspur?).
- **What lies beyond the doorway** at the edge of the Continent, and how Cal went from there to waking human in Larkspur.
- Their relationship to the **Goddess**, the **Scribe**, and the possibility that the Demon Continent is a training ground (§25.5).
- Whether "the dead who fall wrong" means every 0★ being.

Whatever is decided must stay consistent with §28.1–28.4.

---

## NEXT STEP

**Your approval of this foundation.** Settled: **Cal is Ash Line Eleven** (confirmed). Still open from v0.3:

5. **The deepest layer (§25.5):** should the Demon Continent being a Goddess-built training ground be **hinted** (my recommendation), **confirmed**, or **cut**?
6. **Endings (§27):** are three endings (Fall / Stay / Lantern) the right number? They share one final battle.
7. **Backlash placement:** inside the reveal fight (Ep 48 → 49 → 50), as designed in `docs/BACKLASH.md`?
8. **The Rite of Waking (§27):** the King stays asleep; the archdemons try to sacrifice themselves and Cal; Cal hijacks the Rite and takes the power. What happens to the archdemons afterward (they gave their stars away) is left open. Is the 8-clue budget (§28.4) the right density?

The foundation questions from v0.1 are still open:

1. ~~Engine~~ **Decided (v1.2):** Babylon.js in the browser, replacing Unity 6 for zero cost and link-playability.
2. ~~Platforms~~ **Decided:** PC browsers first; phones through the same page with touch controls (§20).
3. **Cast & story:** Brannoc's real death, Aurek Valcourt as the red herring, the Palimpsest protagonist. Anything to change?
4. **Scope calls:** 4 player affinities at launch, AI companions first (tag-swap for Rook, Severin, and Cal later), zones rather than a seamless open world, "Season 1" = Arcs 1–3.

**Phase 1:** complete (§22). **Phase 2:** complete (§23.1): Skyrender, reactions, the squad, the Fens roster, Hask the Bogwarden, page evolution, cel-shading v2, and the Episode 4 combat run. It waits on your gate review ("does it feel anime?"). **Phase 3 progress** (§23.2): Steps 1–4 are done (the story engine, cutscenes, Episodes 1–3, Boss 1, and the Lighthouse hub). **Next: Step 5**, Episode 4's story choice, save slots, and the gate review. **The Backlash prototype** (Ash Line Eleven vs. the Knight Hero, Observe/Insight, the fading order, the door transition) is the first test after the combat core, because it de-risks the most unusual systems in the game (`docs/BACKLASH.md` §26). Full Backlash content is Phase 6.
