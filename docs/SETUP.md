# Project Setup — Phase 1, Step 1

This gets the Unity 6 project running with the **combat core**: the 60 Hz logic clock, the input buffer, and the data-driven ability system, plus an on-screen debug HUD. At the end you can press buttons and watch abilities play frame by frame, chain, and cancel.

**What's not here yet** (next steps): movement, hitboxes and damage, animations, camera, and enemies.

---

## 1. Install the tools

| Tool | Notes |
|---|---|
| **Unity Hub** | https://unity.com/download |
| **Unity 6 LTS** (the newest `6000.0.x` in the Hub) | Add these **modules** when installing: **Windows Build Support (IL2CPP)**, **Android Build Support** (tick its **OpenJDK** and **Android SDK & NDK Tools** sub-items), and **iOS Build Support** (only useful on a Mac; building for iOS requires Xcode) |
| **Visual Studio 2022** (Community is free) | Workloads: **Game development with Unity** and **Desktop development with C++**. The C++ workload is what IL2CPP uses to compile the Windows build to native code |
| *Optional:* **.NET 8 SDK** | Only for running the combat-core unit tests outside Unity (step 7) |

---

## 2. Create the Unity project

Unity Hub won't create a project inside a folder that already has files, so create it somewhere else first, then move it in.

1. **Unity Hub → New project → Unity 6 → template "Universal 3D"**.
   - Project name: `UnityProject`
   - Location: any **temporary** folder (for example your Desktop), **not** this repository.
   - Click **Create project**. When the editor finishes opening, **close Unity**.
2. Copy the `Assets`, `Packages`, and `ProjectSettings` folders from the temporary `UnityProject` into this repository's `UnityProject/` folder. When your file manager asks about `Assets`, choose **merge** (our code is in `Assets/_Project/` and must be kept).
3. Delete the temporary project.
4. **Unity Hub → Add → Add project from disk →** select this repository's `UnityProject/` folder, and open it.

> The **Universal 3D** template already includes the Universal Render Pipeline with two quality levels, **PC** and **Mobile**, each with its own renderer settings. We use those as our PC and mobile tiers.

---

## 3. Install the Input System package

The project won't compile until this is installed (our code uses it).

1. **Window → Package Manager → Unity Registry →** search **Input System → Install**.
2. When asked to **enable the new input backends**, click **Yes**. The editor restarts.
3. Check **Edit → Project Settings → Player → Other Settings → Active Input Handling** is **Input System Package (New)** (or **Both**).
4. Open the **Console** (Window → General → Console). It should have **no red errors**.

---

## 4. Platform settings (native C++ builds)

**Edit → Project Settings → Player.** Each platform has its own tab.

| Tab | Setting | Value | Why |
|---|---|---|---|
| **Windows** (monitor icon) → Other Settings → Configuration | Scripting Backend | **IL2CPP** | Converts our C# to C++ and compiles it natively with Visual Studio's C++ compiler |
| | API Compatibility Level | **.NET Standard 2.1** | Smallest, most portable API surface |
| **Android** → Other Settings → Configuration | Scripting Backend | **IL2CPP** | Required for 64-bit Android |
| | Target Architectures | **ARM64** only | What Google Play requires; smaller builds |
| **iOS** | Scripting Backend | IL2CPP (the only option) | Apple requires it |

The editor itself keeps using the faster **Mono** backend while you work, so pressing Play stays quick. IL2CPP only runs when you make a build.

**Quality tiers:** in **Edit → Project Settings → Quality**, set the default level to **PC** for Windows and **Mobile** for Android and iOS (the green checkboxes in the matrix at the top).

---

## 5. Build the test scene

### 5a. Create three ability assets
In the **Project** window, create the folder `Assets/_Project/Data/Abilities`. Right-click inside it → **Create → Unwritten → Ability**, three times:

**`ABL_Light1`** (a light attack)
- Startup **7**, Active **3**, Recovery **14**
- Events:
  - Frame **0**, type **PlayAnimation**, key `Slash1`
  - Frame **7**, type **SpawnHitbox**, key `Blade`, value **3**
- Cancel Windows: Start **12**, End **23**, Into **Light, Dodge, AnySpell**

**`ABL_Dodge`**
- Startup **0**, Active **12**, Recovery **18**
- Events: Frame **0**, type **Invulnerable**, value **12**

**`ABL_GaleCutter`** (the prototype spell)
- Startup **10**, Active **6**, Recovery **18**, Mana Cost **15**
- Events: Frame **10**, type **SpawnHitbox**, key `Cutter`, value **6**
- Cancel Windows: Start **16**, End **33**, Into **Jump**, **Requires Hit** ticked

If you enter impossible numbers (an event after the last frame, a cancel window that allows nothing), the Console shows a red error naming the asset straight away.

### 5b. Set up the scene
1. **File → New Scene → Basic (URP)**. Save it as `Assets/_Project/Scenes/Sandbox_Combat.unity`.
2. **GameObject → 3D Object → Capsule**. Rename it `Player`.
3. On `Player`, **Add Component**:
   - **Player Input Reader**
   - **Ability Runner Component**:
     - drag the `Player`'s **Player Input Reader** into **Input**
     - **Bindings:** add three entries: **Light → ABL_Light1**, **Dodge → ABL_Dodge**, **Spell1 → ABL_GaleCutter**
   - **Combat Debug Hud**: drag the `Player`'s **Ability Runner Component** into **Target**

### 5c. Play
Press **Play** and try this (keyboard / gamepad):

| Do this | You should see |
|---|---|
| Press **J** (or X / Square) | The HUD shows `Light1`, counting frames 0→24 through Startup, Active, Recovery |
| Press **J** again while it's in Recovery | A second `Light1` starts once the cancel window opens (frame 12). Pressing a little early still works, because the input buffer remembers it for 10 frames |
| Press **Left Shift** (B / Circle) during the window | The Console logs `cancel Light1 into Dodge` |
| Press **1** (or hold RB/R1 + X) | `GaleCutter` starts and mana drops from 100 to 85 |
| Spam **1** | Once mana is too low, the HUD shows `Rejected GaleCutter: NotEnoughMana` |

The Console logs every ability event on its exact frame. Untick **Log Events** on the Ability Runner Component to silence it.

---

## 6. Mobile: touch controls (end of Phase 1)

Touch uses the Input System's **On-Screen Controls**. They act as a virtual gamepad, so **no gameplay code changes**.

1. Add a UI **Canvas** (Screen Space – Overlay, with a Canvas Scaler set to *Scale With Screen Size*, 1920×1080).
2. For each button, add a UI **Image** with an **On Screen Button** component, and set its **Control Path**:
   - Light → `<Gamepad>/buttonWest`, Heavy → `<Gamepad>/buttonNorth`, Jump → `<Gamepad>/buttonSouth`, Dodge → `<Gamepad>/buttonEast`
   - Block → `<Gamepad>/leftShoulder`; the **Magic** button (hold, then tap a face button for a spell) → `<Gamepad>/rightShoulder`
3. For movement, an Image with **On Screen Stick**, Control Path `<Gamepad>/leftStick`.
4. **File → Build Profiles → Android → Switch Platform.** Connect a phone with USB debugging enabled, then **Build And Run**.

---

## 7. Run the combat-core tests (optional)

Everything in `Assets/_Project/Scripts/Core/` is plain C# with **no Unity dependency**, so it's tested outside Unity:

```
dotnet test tests/Unwritten.Core.Tests
```

The tests compile the same source files Unity uses, and enforce C# 9 (the language version Unity 6 supports).

**Rule for Core:** never add `using UnityEngine;` there. Its assembly definition has *No Engine References* turned on, so Unity will refuse to compile it if you try.

---

## Where things live

```
UnityProject/Assets/_Project/Scripts/
  Core/                      Pure C#: no Unity. Unit-tested in tests/.
    Timing/FrameClock.cs       60 Hz fixed logic clock
    Input/InputIntent.cs       Device-independent button intents + masks
    Input/InputBuffer.cs       10-frame input buffer (no allocations)
    Abilities/                 AbilityDefinition, AbilityEvent, CancelWindow,
                               AbilityRunner (frame-by-frame player),
                               AbilityController (input buffer → abilities)
    Stats/ResourcePool.cs      HP / Mana / Posture / Surge
  Runtime/                   The Unity layer.
    LogicClock.cs              Drives every combat system at 60 Hz
    Controls/PlayerInputReader.cs   Gamepad, keyboard/mouse, touch → intents
    Abilities/AbilityData.cs        The ability asset (Create → Unwritten → Ability)
    Abilities/AbilityRunnerComponent.cs  Gives a character abilities
    Debugging/CombatDebugHud.cs     Frame-data overlay (editor and dev builds)
tests/Unwritten.Core.Tests/  Unit tests for Core (31 tests)
```

**How the pieces talk:** `PlayerInputReader` raises an intent → `AbilityRunnerComponent` buffers it with the current logic frame → on every `LogicClock` tick, `AbilityController` starts the bound ability if the current one allows it → `AbilityRunner` fires that ability's events on their frames → `AbilityRunnerComponent` plays animations and publishes every event (`AbilityEventFired`) for the hitbox, VFX, sound, and camera systems that come next.
