// UNWRITTEN — combat sandbox entry point. Wires the sim to Babylon, input, audio, and HUD.

import { FrameClock } from "./core/timing.js";
import { EventType } from "./core/abilities.js";
import { Team } from "./core/combat.js";
import { World } from "./sim/world.js";
import { ACOLYTE_ABILITIES } from "./data/acolyte.js";
import { ROOK_ABILITIES } from "./data/rook.js";
import { B, PALETTE, glow, clamp01 } from "./runtime/look.js";
import { Rig } from "./runtime/rig.js";
import { Vfx, Trail } from "./runtime/vfx.js";
import { Sfx } from "./runtime/audio.js";
import { Controls } from "./runtime/controls.js";
import { FollowCamera } from "./runtime/camera.js";
import { Hud } from "./runtime/hud.js";
import { buildArena } from "./runtime/arena.js";

const TRAIL_COLORS = { default: "#ffd98a", GaleCutter: PALETTE.gale, VacuumPull: PALETTE.gale, TempestEdge: "#a8f5dc", Counter: "#dff6ff", LanternBreak: "#ffcc55", enemy: "#ff5a4a" };
const SPELLS = [
  { intent: "Spell1", name: "Gale", ability: ROOK_ABILITIES.GaleCutter },
  { intent: "Spell2", name: "Pull", ability: ROOK_ABILITIES.VacuumPull },
  { intent: "Spell3", name: "Tempest", ability: ROOK_ABILITIES.TempestEdge },
];

export function boot(doc = document) {
  const root = doc.querySelector("[data-app]");
  const canvas = doc.querySelector("[data-stage]");
  const fail = (msg) => { root.querySelector("[data-start]").innerHTML = `<div class="start-card"><h1>UNWRITTEN</h1><p>${msg}</p></div>`; };
  if (!globalThis.BABYLON) { fail("The 3D engine didn't load. Check your connection and reload."); return null; }
  const BB = B();

  const coarse = matchMedia("(pointer: coarse)").matches;
  const mobile = coarse || Math.min(innerWidth, innerHeight) < 600;
  root.classList.toggle("is-touch", coarse);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let engine;
  try {
    engine = new BB.Engine(canvas, !mobile, { stencil: true, preserveDrawingBuffer: false, powerPreference: "high-performance" }, false);
  } catch (err) {
    fail("WebGL isn't available in this browser, so the fight can't render.");
    return null;
  }
  engine.setHardwareScalingLevel(1 / Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  const scene = new BB.Scene(engine);
  scene.skipPointerMovePicking = true;
  const arena = buildArena(scene, { mobile });
  const camera = new FollowCamera(scene, { mobile });
  camera.reduceMotion = reduced;
  const gl = new BB.GlowLayer("glow", scene, { mainTextureRatio: mobile ? 0.35 : 0.5, blurKernelSize: mobile ? 24 : 40 });
  gl.intensity = 0.75;

  const hud = new Hud(root, SPELLS);
  const overlay = root.querySelector("[data-overlay]");
  const vfx = new Vfx(scene, camera.cam, overlay);
  vfx.reduceFlashes = reduced;
  const sfx = new Sfx();
  const controls = new Controls(canvas, root.querySelector("[data-touch]"));
  if (coarse) controls.device = "touch";

  const world = new World({ tokens: mobile ? 1 : 2, seed: (Date.now() & 0xffff) || 1, assist: coarse });
  const clock = new FrameClock();
  const views = new Map();
  const trails = new Map();
  const viewFor = (f) => views.get(f);

  const addView = (f) => {
    if (views.has(f)) return;
    const rig = new Rig(scene, f.kind, f.id);
    views.set(f, rig);
    trails.set(f, new Trail(scene, `${f.id}-trail`, f.team === Team.Player ? TRAIL_COLORS.default : TRAIL_COLORS.enemy));
  };
  const removeView = (f) => {
    views.get(f)?.dispose(); views.delete(f);
    trails.get(f)?.mesh.dispose(); trails.delete(f);
  };
  addView(world.player);

  // Lock-on marker.
  const reticle = BB.MeshBuilder.CreateTorus("reticle", { diameter: 1.5, thickness: 0.05, tessellation: 40 }, scene);
  reticle.material = glow(scene, "reticleMat", PALETTE.lantern, 0.9);
  reticle.isPickable = false;
  const pin = BB.MeshBuilder.CreatePolyhedron("pin", { type: 1, size: 0.12 }, scene);
  pin.material = reticle.material; pin.isPickable = false;

  const settings = { frameData: !mobile, flashes: !reduced, sound: true, assist: coarse };
  const state = { frozen: false, started: false, paused: false, help: false, cinematic: 0, cinematicScale: 1, ghostTimer: 0, pending: [], time: 0 };
  const later = (seconds, fn) => state.pending.push({ t: seconds, fn });

  // Impact frames: a 2–5 frame inverted ink flash, the anime "the world stopped" beat.
  let impactLeft = 0;
  const impact = (frames, strong = false) => {
    if (!settings.flashes) { canvas.style.filter = "brightness(1.35)"; impactLeft = 1 / 60; return; }
    canvas.style.filter = strong ? "invert(1) contrast(1.7) saturate(0)" : "contrast(1.4) brightness(1.5) saturate(0.4)";
    impactLeft = frames / 60;
  };

  const head = (f) => ({ x: f.pos.x, y: f.pos.y + 1.9, z: f.pos.z });
  const chest = (f) => ({ x: f.pos.x, y: f.pos.y + 1.2, z: f.pos.z });

  function onEvents(events) {
    for (const ev of events) {
      const isPlayer = (f) => f === world.player;
      switch (ev.type) {
        case "spawn": addView(ev.fighter); break;
        case "despawn": removeView(ev.fighter); break;
        case "started": {
          const f = ev.fighter, rig = viewFor(f), tr = trails.get(f);
          if (tr && isPlayer(f)) tr.setColor(TRAIL_COLORS[ev.ability.id] ?? TRAIL_COLORS.default);
          if (rig?.grimoire && (ev.ability.id === "LanternBreak" || ev.ability.id === "Counter")) rig.grimoireGlow = 1;
          if (ev.ability.id === "AirJump") vfx.ring({ x: f.pos.x, y: f.pos.y + 0.05, z: f.pos.z }, 2.2, PALETTE.gale, 0.3);
          if (ev.ability.id === "AirDash") {
            vfx.flash({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z }, 1.6, "#bff4ff", 0.12);
            vfx.sparksAt({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z }, 6, "white", 6, 0);
          }
          break;
        }
        case "abilityEvent": {
          const { fighter: f, event: e } = ev;
          const rig = viewFor(f);
          if (e.type === EventType.PlaySound) sfx.play(e.key, f.team === Team.Enemy ? 0.8 : 1);
          else if (e.type === EventType.SpawnVfx) {
            if (e.key === "gale") vfx.crescent(f.pos, f.yaw);
            if ((e.key === "gale" || e.key === "grimoire") && rig?.grimoire) rig.grimoireGlow = 1;
            if (e.key === "vortex") {
              const c = { x: f.pos.x + Math.sin(f.yaw) * 3.2, y: f.pos.y + 1, z: f.pos.z + Math.cos(f.yaw) * 3.2 };
              vfx.ring(c, 6, PALETTE.gale, 0.3, true); vfx.ring({ ...c, y: c.y - 0.6 }, 4.5, "#bff4ff", 0.25, true);
              vfx.sparksAt(c, 10, "mint", 7, 0);
            }
            if (e.key === "tempest") {
              for (const [h, s] of [[0.6, 4.6], [1.1, 5.2], [1.6, 4.2]]) vfx.ring({ x: f.pos.x, y: f.pos.y + h, z: f.pos.z }, s, PALETTE.gale, 0.45);
            }
            if (e.key === "glint") { vfx.flash(head(f), 1.4, PALETTE.danger, 0.35); sfx.play("glint"); }
            if (e.key === "charge" && rig) { vfx.flash(rig.bladeWorld().tip, 2.2, PALETTE.lantern, 0.3); vfx.ring({ x: f.pos.x, y: 0.05, z: f.pos.z }, 4, PALETTE.lantern, 0.3); }
          } else if (e.type === EventType.CameraCue) {
            if (e.key === "punch") { camera.kick(0.35); camera.shake(0.2); }
            if (e.key === "finisher") { camera.kick(1); camera.shake(0.45); }
          }
          break;
        }
        case "hit": {
          const { attacker: a, defender: d, spec, result, at, ability } = ev;
          const heavy = spec.hitstop >= 8;
          const finisher = ability.tags.includes("finisher");
          const windy = ability.id === "GaleCutter" || ability.id === "VacuumPull" || ability.id === "TempestEdge";
          vfx.sparksAt(at, heavy ? 14 : 7, a.team === Team.Player ? (windy ? "mint" : "gold") : "red", heavy ? 12 : 9);
          vfx.flash(at, heavy ? 2.4 : 1.4, a.team === Team.Player ? "#fff2cf" : "#ffb0a0", heavy ? 0.16 : 0.1);
          vfx.number(at, result.healthDamage, `${isPlayer(d) ? "hurt" : ""} ${heavy ? "big" : ""}`);
          viewFor(d)?.hitFlash(heavy ? 0.1 : 0.06);
          camera.shake(isPlayer(d) ? 0.35 : heavy ? 0.3 : 0.12);
          sfx.play(heavy ? "hitHeavy" : "hit", isPlayer(d) ? 1.1 : 1);
          if (isPlayer(d)) hud.hurt(); else hud.setFocus(d);
          if (finisher) {
            sfx.play("finisher"); impact(5, true); camera.kick(1);
            vfx.ring({ x: d.pos.x, y: 0.05, z: d.pos.z }, 9, PALETTE.lantern, 0.6);
            vfx.flash(at, 4, "#ffd27a", 0.3);
            hud.toast("LANTERN BREAK", "finisher");
            state.cinematic = 0.55; state.cinematicScale = result.killed ? 0.2 : 0.35;
          }
          if (ability.tags.includes("counter")) { impact(2); hud.toast("COUNTER", "counter"); }
          if (settings.frameData) hud.pushLog(`${a.kind === "player" ? "Rook" : "Acolyte"} ${ability.id} → ${result.healthDamage | 0}`);
          break;
        }
        case "block":
          vfx.sparksAt(ev.at, 6, "white", 7); vfx.flash(ev.at, 1, "#d8e6ff", 0.08); sfx.play("block"); camera.shake(0.1);
          break;
        case "guardBreak":
          hud.toast(isPlayer(ev.defender) ? "GUARD BROKEN" : "GUARD BREAK", isPlayer(ev.defender) ? "danger" : ""); impact(2); sfx.play("postureBreak");
          break;
        case "parry":
          vfx.flash(ev.at, 3, "#ffffff", 0.2); vfx.sparksAt(ev.at, 16, "white", 13); vfx.ring({ x: ev.at.x, y: 0.05, z: ev.at.z }, 5, "#dfe9ff", 0.4);
          sfx.play("parry"); impact(2); camera.kick(0.4); hud.toast("PARRY", "parry");
          break;
        case "perfectDodge": sfx.play("perfectDodge"); vfx.number(chest(world.player), "PERFECT", "text"); break;
        case "afterimage":
          sfx.play("afterimage"); hud.toast("AFTERIMAGE", "afterimage");
          state.ghostTimer = 0;
          root.classList.add("slowmo");
          break;
        case "postureBreak": {
          const d = ev.defender;
          vfx.ring({ x: d.pos.x, y: 0.05, z: d.pos.z }, 6, isPlayer(d) ? PALETTE.danger : "#ffffff", 0.5);
          vfx.flash(chest(d), 3, "#ffffff", 0.2);
          sfx.play("postureBreak"); impact(3, !isPlayer(d)); camera.shake(0.4);
          hud.toast(isPlayer(d) ? "POSTURE BROKEN" : "POSTURE BREAK", isPlayer(d) ? "danger" : "break");
          break;
        }
        case "kill": if (!ev.ability.tags.includes("finisher")) sfx.play("kill"); break;
        case "land": if (isPlayer(ev.fighter)) sfx.play("land"); break;
        case "slamLand": {
          const f = ev.fighter;
          vfx.ring({ x: f.pos.x, y: 0.05, z: f.pos.z }, 6, PALETTE.lantern, 0.4);
          vfx.sparksAt({ x: f.pos.x, y: 0.2, z: f.pos.z }, 12, "gold", 10, 4);
          sfx.play("slam"); camera.shake(0.45);
          break;
        }
        case "wave": hud.banner(`WAVE ${ev.wave}`); sfx.play("wave"); break;
        case "waveClear":
          hud.toast("YARD CLEAR", "clear");
          later(2.4, () => world.spawnWave(world.wave >= 3 ? 4 : 3));
          break;
        case "playerDown":
          hud.toast("ROOK FALLS", "danger");
          later(2.6, restart);
          break;
        default: break;
      }
    }
  }

  function restart() {
    world.resetPlayer();
    world.spawnWave(3);
    onEvents(world.drainEvents());
  }

  // Menu buttons.
  const menu = (name, fn) => root.querySelector(`[data-menu="${name}"]`)?.addEventListener("click", (e) => { e.currentTarget.blur(); sfx.play("ui"); fn(); });
  const fdPanel = root.querySelector("[data-fd]");
  const applySettings = () => {
    fdPanel.hidden = !settings.frameData;
    root.querySelector('[data-menu="frameData"]')?.setAttribute("aria-pressed", String(settings.frameData));
    root.querySelector('[data-menu="flashes"]')?.setAttribute("aria-pressed", String(settings.flashes));
    root.querySelector('[data-menu="sound"]')?.setAttribute("aria-pressed", String(settings.sound));
    root.querySelector('[data-menu="assist"]')?.setAttribute("aria-pressed", String(settings.assist));
    vfx.reduceFlashes = !settings.flashes;
    sfx.setEnabled(settings.sound);
    world.assist = settings.assist;
    controls.smartCombo = settings.assist;
  };
  const toggleHelp = (on = !state.help) => { state.help = on; root.querySelector("[data-help]").hidden = !on; };
  menu("help", () => toggleHelp());
  menu("frameData", () => { settings.frameData = !settings.frameData; applySettings(); });
  menu("flashes", () => { settings.flashes = !settings.flashes; applySettings(); });
  menu("sound", () => { settings.sound = !settings.sound; applySettings(); });
  menu("assist", () => { settings.assist = !settings.assist; applySettings(); hud.toast(settings.assist ? "ASSIST ON" : "ASSIST OFF"); });
  menu("reset", restart);
  root.querySelector("[data-help-close]")?.addEventListener("click", () => toggleHelp(false));
  applySettings();

  const start = () => {
    if (state.started) return;
    state.started = true;
    sfx.unlock();
    root.querySelector("[data-start]").classList.add("gone");
    world.spawnWave(3);
    onEvents(world.drainEvents());
  };
  controls.onFirstInput = start;
  root.querySelector("[data-start]").addEventListener("pointerdown", () => { controls.onFirstInput = null; start(); });

  // Adaptive resolution: drop render resolution when frames run long, restore it when there's headroom.
  const maxRatio = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
  const quality = {
    ratio: maxRatio, avg: 1 / 60, timer: 0, fps: 60,
    update(dt) {
      this.avg += (dt - this.avg) * 0.05;
      this.fps = 1 / this.avg;
      this.timer += dt;
      if (this.timer < 2) return;
      this.timer = 0;
      let next = this.ratio;
      if (this.fps < 48) next = Math.max(0.6, this.ratio - 0.15);
      else if (this.fps > 58 && this.ratio < maxRatio) next = Math.min(maxRatio, this.ratio + 0.1);
      if (next !== this.ratio) { this.ratio = next; engine.setHardwareScalingLevel(1 / next); }
    },
  };
  hud.quality = quality;

  let last = performance.now();
  engine.runRenderLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    state.time += dt;

    controls.poll(dt);
    for (const cmd of controls.drainCommands()) {
      if (cmd === "lock") { const t = world.toggleLock(); if (!t) camera.yaw = world.player.yaw; sfx.play("ui"); }
      if (cmd === "unlock" && world.lockTarget) { world.lockTarget = null; sfx.play("ui"); }
      if (cmd === "lockTap") { if (world.lockTarget && world.liveEnemies.length > 1) world.switchLock(1); else world.toggleLock(); sfx.play("ui"); }
      if (cmd === "switchRight" || cmd === "switchLeft" || ((cmd === "flickRight" || cmd === "flickLeft") && world.lockTarget)) {
        world.switchLock(cmd.endsWith("Left") ? -1 : 1); sfx.play("ui");
      }
      if (cmd === "help") toggleHelp();
      if (cmd === "reset") restart();
      if (cmd === "frameData") { settings.frameData = !settings.frameData; applySettings(); }
      if (cmd === "pause") { if (state.help) toggleHelp(false); else state.paused = !state.paused; root.classList.toggle("paused", state.paused); }
    }
    const presses = controls.drainPresses();
    const running = state.started && !state.paused && !state.help && !state.frozen;
    if (running) for (const p of presses) world.press(p);

    const look = controls.takeLook();
    const { fx, fz, rx, rz } = camera.basis;
    const m = controls.move;
    world.player.moveInput.x = rx * m.x + fx * m.y; world.player.moveInput.z = rz * m.x + fz * m.y;
    world.player.holdBlock = controls.blockHeld;

    for (let i = state.pending.length - 1; i >= 0; i--) {
      const job = state.pending[i];
      if (running) job.t -= dt;
      if (job.t <= 0) { state.pending.splice(i, 1); job.fn(); }
    }

    if (state.cinematic > 0) state.cinematic -= dt;
    const scale = state.cinematic > 0 ? state.cinematicScale : 1;
    const ticks = running ? clock.advance(dt * scale) : 0;
    for (let i = 0; i < ticks; i++) { world.step(); onEvents(world.drainEvents()); }
    const alpha = clock.alpha;

    if (!world.afterimageActive) root.classList.remove("slowmo");
    else {
      state.ghostTimer -= dt;
      if (state.ghostTimer <= 0) { const rig = viewFor(world.player); if (rig) vfx.afterimage(rig); state.ghostTimer = 0.09; }
    }

    for (const [f, rig] of views) {
      const t = f.timeScale < 1 ? clamp01(f.timeAcc + alpha * f.timeScale) : alpha;
      rig.update(f, running ? t : 1, dt);
      const tr = trails.get(f);
      if (tr) { const { hilt, tip } = rig.bladeWorld(); tr.push(hilt, tip, rig.swinging, dt); }
    }

    const lock = world.lockTarget?.alive ? world.lockTarget : null;
    reticle.setEnabled(!!lock); pin.setEnabled(!!lock);
    if (lock) {
      reticle.position.set(lock.pos.x, 0.06, lock.pos.z);
      reticle.rotation.y += dt * 1.5;
      pin.position.set(lock.pos.x, lock.pos.y + 2.55 + Math.sin(state.time * 4) * 0.08, lock.pos.z);
      pin.rotation.y += dt * 3;
    }

    const p = world.player;
    const pr = views.get(p)?.root.position ?? p.pos;
    camera.update(dt, pr, lock?.pos ?? null, look);
    vfx.update(dt, camera.cam, engine);
    arena.update(dt, state.time);
    hud.update(dt, world, controls.device);

    if (impactLeft > 0) { impactLeft -= dt; if (impactLeft <= 0) canvas.style.filter = ""; }
    quality.update(dt);
    scene.render();
  });
  addEventListener("resize", () => engine.resize());
  // Leaving the tab pauses the fight (and stops the clock from catching up afterwards).
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.started && !state.paused) { state.paused = true; root.classList.add("paused"); }
  });

  // Test hook: freeze the live clock so automated checks can step the sim frame-exactly.
  const freezeLogic = (on) => { state.frozen = on; };
  return { engine, scene, world, start, restart, freezeLogic, data: { acolyte: ACOLYTE_ABILITIES } };
}

if (typeof document !== "undefined" && !globalThis.__UNWRITTEN_NO_BOOT__) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { globalThis.unwritten = boot(); });
  else globalThis.unwritten = boot();
}
