# Phase 1, Step 2: Combat Playground

Builds on `docs/SETUP.md` (do that first). At the end you have **Rook** running, jumping, and dashing around a grey-box arena, with the full prototype moveset (4-hit string, launcher, air string, air slam, dash strike, Gale Cutter), and **three Choir Acolytes** that circle, take turns attacking, can be blocked, parried, dodged, and posture-broken.

**New in code:** `ComboGraph` (movesets as data), `CombatResolver` (hit / block / parry / dodge / posture rules), `AttackTokenPool` + `EnemyBrain` (enemy AI), `CharacterMotor`, `PlayerController`, `CombatantComponent`, `HitboxSet` / `Hurtbox`, `EnemyController`, `CameraShake`. All the rules are unit-tested (`dotnet test tests/Unwritten.Core.Tests`, 60 tests).

**Not yet:** real character models and animations (capsules for now), the Cinemachine camera, VFX, sound. Those come in Phase 2.

---

## 1. Physics layer for hurtboxes

**Edit → Project Settings → Tags and Layers →** add a layer named **`Hurtbox`** (any free User Layer).

Hurtboxes live on this layer, and hitboxes only search it. That keeps hit checks cheap.

---

## 2. Rook's abilities

Create these in `Assets/_Project/Data/Abilities/Rook/` (**Create → Unwritten → Ability**). If you made `ABL_Light1`, `ABL_Dodge`, and `ABL_GaleCutter` in Step 1, you can delete them; these replace them.

Columns: **S/A/R** = Startup / Active / Recovery frames. **Hit** = Damage, Posture damage, Hitstop, Hitstun, then Launch or Knockback if any. **Events** are *frame: Type key value*. **Cancel** = *start–end → inputs* (✓hit = Requires Hit).

| Asset | S/A/R | Hit | Events | Cancel |
|---|---|---|---|---|
| `ABL_Rook_L1` | 7/3/14 | 12, 10, 3, 16, knockback 1 | 7: SpawnHitbox `Blade` 3 | 10–23 → Light, Heavy, Jump, Dodge, AnySpell |
| `ABL_Rook_L2` | 7/3/15 | 12, 10, 3, 16, knockback 1 | 7: SpawnHitbox `Blade` 3 | 10–24 → Light, Heavy, Jump, Dodge, AnySpell |
| `ABL_Rook_L3` | 8/3/16 | 14, 14, 4, 18, knockback 1.5 | 8: SpawnHitbox `Blade` 3 | 11–26 → Light, Heavy, Jump, Dodge, AnySpell |
| `ABL_Rook_L4` (finisher) | 10/4/22 | 24, 30, 10, 30, knockback 6 | 10: SpawnHitbox `Blade` 4 | 20–35 → Dodge, AnySpell |
| `ABL_Rook_Launcher` | 9/3/18 | 14, 15, 6, 24, **launch 11** | 9: SpawnHitbox `Blade` 3 | 12–29 → Jump ✓hit · 12–29 → Dodge |
| `ABL_Rook_Jump` | 0/4/2 | — | 0: Custom `jump` 10 | 2–5 → Light, Heavy, Dodge, AnySpell, Jump |
| `ABL_Rook_AirL1` | 5/3/12 | 10, 8, 3, 16, launch 3 | 5: SpawnHitbox `Blade` 3 | 8–19 → Light, Heavy, Dodge, AnySpell, Jump |
| `ABL_Rook_AirL2` | 5/3/12 | 10, 8, 3, 16, launch 3 | 5: SpawnHitbox `Blade` 3 | 8–19 → Light, Heavy, Dodge, AnySpell, Jump |
| `ABL_Rook_AirL3` | 6/3/14 | 12, 10, 4, 18, launch 3 | 6: SpawnHitbox `Blade` 3 | 9–22 → Heavy, Dodge, AnySpell |
| `ABL_Rook_AirSlam` | 8/8/18 | 20, 25, 8, 30, knockback 3 | 8: Custom `slam` 30 · 8: SpawnHitbox `Slam` 8 | 20–33 → Dodge, AnySpell |
| `ABL_Rook_DashStrike` | 6/4/16 | 14, 12, 4, 18, knockback 3 | 6: SpawnHitbox `Blade` 4 · 6: Move 2 | 12–25 → Light, Dodge, AnySpell |
| `ABL_Rook_Dodge` | 0/12/18 | — | 0: Invulnerable 12 · 0: Move 4.2 | 14–29 → Light, Heavy, Jump, AnySpell |
| `ABL_Rook_GaleCutter` | 10/6/18, **mana 15** | 16, 20, 6, 24, **launch 11** | 10: SpawnHitbox `Cutter` 6 | 16–33 → Jump ✓hit · 16–33 → Dodge |

Notes:
- **Move** events dash the character `value` metres over the ability's Active frames. In the air, gravity pauses (that's the air dash).
- Keep **Damage at 0** on Jump and Dodge (they aren't attacks).
- Inspector mistakes (an event past the last frame, a cancel window that allows nothing) show a red error naming the asset.

---

## 3. Rook's moveset (combo graph)

**Create → Unwritten → Combo Graph** → `CG_Rook_Duelist`.

**Nodes** (id → ability): `L1`, `L2`, `L3`, `L4`, `Launcher`, `Jump`, `AirL1`, `AirL2`, `AirL3`, `AirSlam`, `DashStrike`, `Dodge`, `GaleCutter` → the matching `ABL_Rook_*` asset.

**Entries** (what each input starts from idle). **Order matters**: the first match wins, so put Dash Strike above L1.

| Input | To | Requires |
|---|---|---|
| Light | DashStrike | Grounded, AfterDash |
| Light | L1 | Grounded |
| Light | AirL1 | Airborne |
| Heavy | AirSlam | Airborne |
| Jump | Jump | — |
| Dodge | Dodge | — |
| Spell1 | GaleCutter | — |

**Edges** (the strings):

| From | Input | To | Requires |
|---|---|---|---|
| L1 | Light | L2 | |
| L2 | Light | L3 | |
| L3 | Light | L4 | |
| L2 | Heavy | Launcher | |
| AirL1 | Light | AirL2 | |
| AirL2 | Light | AirL3 | |
| AirL1 | Heavy | AirSlam | |
| AirL2 | Heavy | AirSlam | |
| AirL3 | Heavy | AirSlam | |

**Globals** (from any move whose cancel window allows it):

| Input | To | Requires |
|---|---|---|
| Dodge | Dodge | |
| Spell1 | GaleCutter | |
| Jump | Jump | |
| Light | AirL1 | Airborne |
| Heavy | AirSlam | Airborne |

---

## 4. Choir Acolyte abilities

In `Assets/_Project/Data/Abilities/Acolyte/`:

| Asset | S/A/R | Hit | Events |
|---|---|---|---|
| `ABL_Acolyte_Slash` | 14/4/22 | 14, 20, 4, 20, knockback 2 | 14: SpawnHitbox `Blade` 4 |
| `ABL_Acolyte_Thrust` (**unblockable**) | 24/5/30 | 22, 30, 6, 24, knockback 4, **Unblockable ✓** | 0: SpawnVfx `glint` · 24: SpawnHitbox `Lunge` 5 · 22: Move 2.5 |

The Thrust is the red-glint attack: you can't block or parry it, only dodge.

---

## 5. Build the arena

1. Open (or make) `Assets/_Project/Scenes/Sandbox_Combat.unity`. Delete the old capsule from Step 1.
2. **Floor:** GameObject → 3D Object → **Plane**, scale (4, 1, 4). Add two **Cylinders** as pillars, scale (1.5, 3, 1.5).
3. **Camera:** select **Main Camera**, position (0, 9, -11), rotation (35, 0, 0). Add **Camera Shake**.

### 5a. Rook
1. Create Empty `Rook` at (0, 0, -3). Add **Character Controller** (Center Y 1, Height 2, Radius 0.4).
2. Child **Capsule** (3D Object) at local (0, 1, 0) for visuals. **Remove its Capsule Collider** (the Character Controller is the body).
3. Child Empty `Hurtbox` at local (0, 1, 0): add **Capsule Collider** (Is Trigger ✓, Height 1.8, Radius 0.45), add **Hurtbox**, set its layer to **Hurtbox**.
4. On `Rook`, **Add Component**:
   - **Player Input Reader**
   - **Ability Runner Component**: Input = Rook's reader, **Moveset = `CG_Rook_Duelist`** (Bindings stay empty)
   - **Character Motor** (defaults are fine)
   - **Combatant Component**: Team **Player**, Max Health 100, Max Posture 100
   - **Hitbox Set**, with three shapes:
     - `Blade`: Center (0, 1, 1.1), Size (2.2, 1.6, 2.0)
     - `Cutter`: Center (0, 1, 2.6), Size (1.2, 1.4, 5.0)
     - `Slam`: Center (0, 0.5, 0.8), Size (3, 1.4, 3)
     - Hurtbox Layers = **Hurtbox** only
   - **Player Controller**
   - **Combat Debug Hud**: Target = Rook's Ability Runner Component
5. Turn the capsule a different colour so you can tell Rook apart (a new Material).

### 5b. Choir Acolyte (make one, then a prefab)
1. Create Empty `Acolyte` at (0, 0, 4). Same body setup as Rook: **Character Controller**, a visual **Capsule** child (collider removed), and a `Hurtbox` child (trigger capsule + **Hurtbox**, layer Hurtbox).
2. Components:
   - **Ability Runner Component**: no input, no moveset, no bindings (the AI starts attacks directly)
   - **Character Motor**: Run Speed **4**
   - **Combatant Component**: Team **Enemy**, Max Health **120**, Max Posture **60**
   - **Hitbox Set**: `Blade` (0, 1, 1.0) size (2.0, 1.6, 1.8); `Lunge` (0, 1, 1.6) size (1.0, 1.4, 3.0); Hurtbox Layers = Hurtbox
   - **Enemy Controller**, Attacks:
     - `ABL_Acolyte_Slash`: range 0 – 2.4, weight 3, cooldown 40
     - `ABL_Acolyte_Thrust`: range 2.5 – 5, weight 1, cooldown 150
3. Drag `Acolyte` into `Assets/_Project/Prefabs/` to make a prefab. Place **three** in the arena, a few metres apart.

---

## 6. Play

| Try | What should happen |
|---|---|
| WASD / left stick | Rook runs relative to the camera |
| **J ×4** | L1 → L2 → L3 → L4. The HUD's *Combo node* walks the string; L4 knocks the Acolyte back with a long freeze and a camera shake |
| **J, J, K** | L1 → L2 → **Launcher**: the Acolyte flies up |
| Launcher, then **Space** the moment it hits | The on-hit cancel into Jump: Rook leaves the ground |
| In the air: **J, J, J, K** | Air string, then **Air Slam** straight down |
| **Shift** then **J** quickly | Dodge, then **Dash Strike** (the AfterDash entry) |
| **1** | Gale Cutter: long hitbox, launches, costs 15 mana. Hits refill 4 mana |
| Stand near three Acolytes | Only **two** attack at a time (one on mobile); the others circle |
| Hold **Q** when an Acolyte slashes | Blocked: small chip damage, no stagger |
| Tap **Q** just as the slash lands | **Parried**: the Acolyte's posture drops sharply. After a parry, the *AfterParry* context is active for 20 frames (counters come in a later step) |
| Watch for the Thrust (it lunges from range) | Blocking fails (unblockable). **Dodge** through it; dodge late and the HUD/console shows PerfectDodge |
| Keep hitting one Acolyte | Its posture empties: **BROKEN**, staggered for 90 frames. With it locked on (Tab / R3), the combo graph sees *TargetStaggered* (finishers come later) |
| **Tab** / R3 | Lock on to the nearest Acolyte; attacks snap toward it |

The **Combat Debug Hud** shows Rook's current move, frame, phase, combo node, HP, posture, invulnerability and parry frames, stagger, mana, buffered inputs, and the locked target's HP and posture.

Select an Acolyte or Rook in the **Scene** view to see hitbox outlines (yellow; red while active).

---

## Where the new code lives

```
Core/ (pure C#, unit-tested)
  Abilities/ComboGraph.cs      Movesets as graphs: entries, string edges, global edges, MoveContext
  Abilities/AbilityController  Now takes a resolver (ComboGraph or simple bindings)
  Combat/HitSpec.cs            What a hit does (damage, posture, hitstop, hitstun, launch, knockback, unblockable)
  Combat/Combatant.cs          Health, posture, invulnerability, parry window, block, stagger, posture break
  Combat/CombatResolver.cs     The rules of one hit: dodge → parry → block → hit
  AI/AttackTokenPool.cs        "Only N enemies attack at once"
  AI/EnemyBrain.cs             Approach / circle / attack / recover / stagger, weighted attack choice
Runtime/ (Unity)
  LogicClock.cs                Now runs systems in a fixed order: Brains → Abilities → Hitboxes → Combatants → Movement → Late
  Abilities/ComboGraphData.cs  The Combo Graph asset
  Characters/CharacterMotor.cs Run, gravity, jump + air jump, dash / air dash, slam, knockback, launch, hitstop freeze
  Characters/PlayerController  Camera-relative movement, block/parry, lock-on, soft aim, combo context
  Combat/CombatantComponent    Connects abilities to the body and to combat state
  Combat/HitboxSet.cs, Hurtbox.cs  Named attack volumes vs. hittable colliders
  Combat/CombatEvents.cs       Scene-wide "a hit happened" event for feedback systems
  AI/EnemyController.cs        Runs EnemyBrain on a character
  AI/AttackTokenService.cs     The scene's token pool (2 on PC, 1 on mobile)
  Feedback/CameraShake.cs      Placeholder shake until the Cinemachine rig
```
