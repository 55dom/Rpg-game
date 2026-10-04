# Developer guide: running, testing, and shipping UNWRITTEN

The game is a browser game built on **Babylon.js 9**. Everything is free: no engine license, no paid tools, no server.

**Play it now:** https://claude.ai/artifact/WwsFmRHatfqK2CLkdXyonz (keyboard and mouse, gamepad, or touch).

## What you need
- **Node.js 20 or newer** (for tests and the build). Nothing else.
- Any modern browser: Chrome, Edge, Firefox, or Safari, on desktop or phone.

## Commands
Run these inside `game/`:

| Command | What it does |
|---|---|
| `npm install` | Installs esbuild (the only dependency, a dev tool) |
| `npm test` | Runs every unit test and the scripted fight simulations in Node (no browser needed) |
| `npm run build` | Writes `dist/index.html`, one self-contained page (about 95 KB) |
| `npm run dev` | Builds, then serves the page at http://localhost:8080 |

After changing code, run `npm run build` again and reload the page. A build takes well under a second.

## Playing on your phone
- **Easiest:** open the artifact link on the phone.
- **Your own copy:** upload `game/dist/index.html` to any free static host (GitHub Pages, Netlify, Cloudflare Pages, itch.io as an HTML5 game). It is a single file; Babylon.js loads from the jsDelivr CDN.
- **Same Wi-Fi:** run `npm run dev` on your computer and open `http://<your-computer's-IP>:8080` on the phone.

Touch controls appear automatically on touch screens.

## How the code is organized
```
game/src/core/     Pure rules, no rendering: input buffer, 60 Hz clock, combat resolution,
                   abilities + combo graph, enemy AI. Unit-tested.
game/src/data/     Designer data: Rook's moveset, poses, and hitboxes; the Choir Acolyte.
game/src/sim/      The whole fight as a simulation: movement, hitboxes, juggles, parry and
                   counter, Afterimage, Lantern Break. Emits events. Tested with scripted fights.
game/src/runtime/  Babylon.js and the page: characters, effects, sound, controls, camera, HUD.
                   Only reads the simulation; never changes the rules.
game/src/main.js   Connects the simulation to the presentation.
```
The split is deliberate: **every gameplay rule can be tested without a browser**, so a change to frame data or AI is checked in about a second. The browser layer can be replaced (new models, new effects) without touching the rules.

## Changing the game
- **Tune a move:** edit its entry in `src/data/rook.js`. Frames are 60 Hz logic frames: `startup / active / recovery`, then `events` (hitboxes, steps, sounds, effects) and `cancels` (which buttons may interrupt it, and when).
- **Add a move:** add an ability with `add({ ... })` in `rook.js`, then route a button to it in `buildRookGraph`. No engine code needed. The frame-data panel (press **G**) shows it live.
- **Tune the fight:** `Tuning` at the top of `src/sim/world.js` (gravity, knockback, Afterimage strength, finisher range).
- **Tune an enemy:** `src/data/acolyte.js` (attacks, ranges, weights, cooldowns).

After any change, run `npm test`. The scripted fights in `test/sim.test.js` check that the four-hit string connects, the launcher juggle works, perfect dodges trigger Afterimage, parries open counters, and Lantern Break finishes.

## Step 3 features (Phase 1 prototype)
| Feature | Where |
|---|---|
| Hit sparks, starburst flashes, shock rings, damage numbers, Afterimage ghosts, Gale crescent | `runtime/vfx.js` |
| Blade trails | `Trail` in `runtime/vfx.js` |
| Hitstop with shake, camera shake and punch-in, impact frames | `sim/world.js` (hitstop), `runtime/camera.js`, `impact()` in `main.js` |
| Parry → Counter window; perfect dodge → Afterimage (enemies at 0.35× for 0.6 s, 3 s cooldown) | `_resolve` in `sim/world.js` |
| Posture break → Lantern Break (priority route that cuts any recovery) | `buildRookGraph` in `data/rook.js`, `brokenTarget` in `sim/world.js` |
| Synthesized sound effects | `runtime/audio.js` |
| Touch, gamepad, keyboard, mouse | `runtime/controls.js` |
| Accessibility: impact flashes toggle (FX), reduced-motion support, sound toggle | menu in `template.html`, `applySettings` in `main.js` |

## Step 4 and 5 features (Phase 1 complete)
| Feature | Where |
|---|---|
| Double jump, air dash (once per airtime) | `AirJump`, `AirDash` in `data/rook.js`; `airJumps`, `airDashes`, `hoverFrames` in `sim/world.js` |
| Juggle height rules | `_resolve` in `sim/world.js` |
| Lock-on switching | `switchLock` in `sim/world.js`; Tab / right-stick flick / tap LOCK |
| Vacuum Pull (`pull` hit property), Tempest Edge (data only) | `data/rook.js`; `_pull` in `sim/world.js` |
| Touch assist, melee mana gain | `assist` and `Tuning` in `sim/world.js`; `smartCombo` in `runtime/controls.js` |
| Adaptive resolution, FPS readout, auto-pause | `quality` in `main.js`; frame-data panel |

Keys added: **R** Vacuum Pull, **T** Tempest Edge, **Tab** switch target. Restart moved to **Backspace**.

## Phase 2, Step 1: Surge, Skyrender, reactions
| Feature | Where |
|---|---|
| Tags and the reaction engine | `core/tags.js`; reaction rows in `data/reactions.js`; `_react` in `sim/world.js` |
| Hits that apply tags | `applyTags` in `hitSpec` (e.g. Launcher, L4, Counter MARK for 4–5 s) |
| Surge gauge | `surge` in `sim/world.js`, gains in `ROOK_STATS.surgeGain` |
| Skyrender | `data/rook.js`: one ability whose hitboxes carry their own hits (`SkyRing`, `SkyCut`, `SkyFinal`) |
| Time stop | `timeStop` custom event → `world.stopFrames` |
| Camera shots as data | `runtime/shots.js`, played by `camera.cue(name)` from `CameraCue` events |

To add a reaction, add a row to `data/reactions.js`: `when` (tag on the target), `with` (a tag the hit applies, an ability tag like `burst`/`gust`, or `airborne`), and an `effect` (`damage`, `posture`, `hitstop`, `radius`, `launch`, `stagger`). No code changes.

Keys added: **V** (gamepad LB+RB, touch ULT) for Skyrender when the Surge bar is full.

## Publishing the artifact
`npm run build` also writes `dist/fragment.html` (the page without its outer `<html>` shell). That file is what gets published to the Claude artifact link.
