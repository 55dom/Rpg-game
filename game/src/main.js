// UNWRITTEN — combat sandbox entry point. Wires the sim to Babylon, input, audio, and HUD.

import { FrameClock } from "./core/timing.js";
import { EventType } from "./core/abilities.js";
import { Team } from "./core/combat.js";
import { World } from "./sim/world.js";
import { ACOLYTE_ABILITIES } from "./data/acolyte.js";
import { ROOK_ABILITIES } from "./data/rook.js";
import { PAGES } from "./data/pages.js";
import { EPISODE_4 } from "./data/run.js";
import { B, PALETTE, glow, clamp01, toonFallbackIfBroken } from "./runtime/look.js";
import { Rig, LOOKS } from "./runtime/rig.js";
import { Vfx, Trail } from "./runtime/vfx.js";
import { Sfx } from "./runtime/audio.js";
import { Controls } from "./runtime/controls.js";
import { FollowCamera } from "./runtime/camera.js";
import { Hud } from "./runtime/hud.js";
import { buildArena } from "./runtime/arena.js";
import { StoryPlayer } from "./runtime/story.js";
import { Sets } from "./runtime/sets.js";
import { Constellation } from "./runtime/constellation.js";
import { SaveStore, cleanName } from "./core/save.js";
import { EPISODE_1, EP1_SCRIPT } from "./data/story/ep1.js";
import { EPISODE_2, EP2_SCRIPT } from "./data/story/ep2.js";
import { EPISODE_3, EP3_SCRIPT } from "./data/story/ep3.js";
import { EPISODE_4_STORY, EP4_SCRIPT } from "./data/story/ep4.js";
import { WORLD_SCRIPT } from "./data/story/world.js";
import { ZONES } from "./data/zones.js";

const TRAIL_COLORS = { default: "#ffd98a", GaleCutter: PALETTE.gale, VacuumPull: PALETTE.gale, TempestEdge: "#a8f5dc", Counter: "#dff6ff", LanternBreak: "#ffcc55", enemy: "#ff5a4a" };
const SPELLS = [
  { slot: "Spell1", short: "Gale" }, { slot: "Spell2", short: "Pull" },
  { slot: "Spell3", short: "Tempest" }, { slot: "Spell4", short: "Wall" },
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
  const sets = new Sets(scene, arena, { mobile });
  const setBog = (on, instant = false) => sets.setBog(on, instant);
  const constellation = new Constellation(scene);
  const camera = new FollowCamera(scene, { mobile });
  camera.reduceMotion = reduced;
  const gl = new BB.GlowLayer("glow", scene, { mainTextureRatio: mobile ? 0.35 : 0.5, blurKernelSize: mobile ? 24 : 40 });
  gl.intensity = 0.75;
  // Color grade (GDD §19.6.1) lives in the toon shader (saturation, cool shadows) plus a CSS vignette:
  // a full-screen post-process fought the glow layer and washed the picture out.

  const hud = new Hud(root, SPELLS);
  const overlay = root.querySelector("[data-overlay]");
  const vfx = new Vfx(scene, camera.cam, overlay);
  vfx.reduceFlashes = reduced;
  const sfx = new Sfx();
  const controls = new Controls(canvas, root.querySelector("[data-touch]"));
  if (coarse) controls.device = "touch";

  let world = new World({ tokens: mobile ? 1 : 2, seed: (Date.now() & 0xffff) || 1, assist: coarse, companions: true });
  world.pageDefs = PAGES;
  const clock = new FrameClock();
  const views = new Map();
  const trails = new Map();
  const viewFor = (f) => views.get(f);

  const addView = (f) => {
    if (views.has(f)) return;
    const rig = new Rig(scene, f.kind, f.id);
    views.set(f, rig);
    trails.set(f, new Trail(scene, `${f.id}-trail`, LOOKS[f.kind]?.trail ?? (f.team === Team.Player ? TRAIL_COLORS.default : TRAIL_COLORS.enemy)));
  };
  const removeView = (f) => {
    views.get(f)?.dispose(); views.delete(f);
    trails.get(f)?.mesh.dispose(); trails.delete(f);
  };
  addView(world.player);
  for (const c of world.companions) addView(c);
  world.drainEvents(); // companion spawn events are already handled

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
      if (state.mode === "story") story.onWorldEvent(ev);
      const isPlayer = (f) => f === world.player;
      switch (ev.type) {
        case "spawn": addView(ev.fighter); break;
        case "despawn": removeView(ev.fighter); if (hud.focus === ev.fighter) hud.focus = null; break;
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
            if (e.key === "starcharge") { vfx.flash({ x: f.pos.x, y: f.pos.y + 2.1, z: f.pos.z }, 1.6, "#fff1b8", 0.3); vfx.sparksAt({ x: f.pos.x, y: f.pos.y + 2, z: f.pos.z }, 8, "gold", 4, 2); }
            if (e.key === "sing") vfx.ring({ x: f.pos.x, y: f.pos.y + 2.2, z: f.pos.z }, 1.6, "#c9a4ff", 0.4);
            if (e.key === "mudwave") { vfx.ring({ x: f.pos.x, y: 0.08, z: f.pos.z }, 8, "#8a7a4a", 0.5); vfx.sparksAt({ x: f.pos.x, y: 0.3, z: f.pos.z }, 18, "gold", 10, 5); camera.shake(0.5); }
            if (e.key === "glint") { vfx.flash(head(f), 1.4, PALETTE.danger, 0.35); sfx.play("glint"); }
            if (e.key === "charge" && rig) { vfx.flash(rig.bladeWorld().tip, 2.2, PALETTE.lantern, 0.3); vfx.ring({ x: f.pos.x, y: 0.05, z: f.pos.z }, 4, PALETTE.lantern, 0.3); }
            if (e.key === "ultCharge") {
              if (rig) rig.grimoireGlow = 1;
              for (const [h, s, life] of [[0.1, 9, 0.7], [1, 6, 0.6], [2, 4, 0.5]]) vfx.ring({ x: f.pos.x, y: f.pos.y + h, z: f.pos.z }, s, PALETTE.gale, life, true);
              vfx.sparksAt({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z }, 14, "mint", 5, 3);
            }
            if (e.key === "ultName") showUltCard();
            if (e.key === "ultBurst") {
              vfx.ring({ x: f.pos.x, y: 0.06, z: f.pos.z }, 20, PALETTE.gale, 0.6);
              vfx.ring({ x: f.pos.x, y: 1.2, z: f.pos.z }, 14, "#ffffff", 0.45);
              vfx.flash({ x: f.pos.x, y: f.pos.y + 1.2, z: f.pos.z }, 5, "#d9fff2", 0.25);
              vfx.sparksAt({ x: f.pos.x, y: 0.5, z: f.pos.z }, 30, "mint", 16, 8);
              camera.shake(0.5);
            }
          } else if (e.type === EventType.CameraCue) {
            if (e.key === "punch") { camera.kick(0.35); camera.shake(0.2); }
            if (e.key === "finisher") { camera.kick(1); camera.shake(0.45); }
            if (e.key.startsWith("ult-") && isPlayer(f)) {
              const shot = camera.cue(e.key);
              root.classList.toggle("ult-desat", !!shot?.desaturate);
              if (e.key === "ult-impact") { impact(4, true); camera.shake(0.8); }
            }
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
          if (isPlayer(d)) hud.hurt(); else if (d.team === Team.Enemy) hud.setFocus(d);
          if (finisher) {
            sfx.play("finisher"); impact(5, true); camera.kick(1);
            vfx.ring({ x: d.pos.x, y: 0.05, z: d.pos.z }, 9, PALETTE.lantern, 0.6);
            vfx.flash(at, 4, "#ffd27a", 0.3);
            hud.toast("LANTERN BREAK", "finisher");
            state.cinematic = 0.55; state.cinematicScale = result.killed ? 0.2 : 0.35;
          }
          if (ability.tags.includes("counter")) { impact(2); hud.toast("COUNTER", "counter"); }
          if (ability.tags.includes("thread")) {
            const rig = viewFor(a);
            if (rig) vfx.thread(rig.bladeWorld().tip, chest(d), ability.id === "SnareLine" ? 0.6 : 0.3);
          }
          if (ability.id === "Skyrender" && spec.hitstop >= 18 && !state.ultToast) { state.ultToast = true; hud.toast("SKYRENDER", "finisher"); later(1.5, () => { state.ultToast = false; }); }
          if (settings.frameData) hud.pushLog(`${a.kind === "player" ? "Rook" : a.stats.name ?? "Acolyte"} ${ability.id} → ${result.healthDamage | 0}`);
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
        case "reaction": {
          const { reaction: rx, defender: d, targets } = ev;
          for (const t of targets) {
            const c = chest(t);
            vfx.flash(c, 3.2, "#ffd27a", 0.22);
            vfx.sparksAt(c, 16, "gold", 14, 3);
            vfx.number(c, rx.effect.damage ?? 0, "big");
            viewFor(t)?.hitFlash(0.12, "#ffd27a");
          }
          vfx.ring({ x: d.pos.x, y: d.pos.y + 0.1, z: d.pos.z }, (rx.effect.radius || 1.5) * 2.4, PALETTE.lantern, 0.45);
          sfx.play("detonate"); camera.shake(0.45); camera.kick(0.4); impact(2);
          hud.toast(rx.name.toUpperCase(), "finisher");
          if (settings.frameData) hud.pushLog(`Reaction ${rx.name} on ${targets.length}`);
          if (rx.id.startsWith("Shatter")) { vfx.sparksAt(chest(d), 20, "gold", 12, 6); sfx.play("stone"); }
          break;
        }
        case "surgeFull": sfx.play("surgeFull"); hud.toast("SURGE FULL", "afterimage"); break;
        case "assist": {
          const { fighter: f, ability: a, target: t } = ev;
          const c = chest(f);
          vfx.flash(c, 2.2, LOOKS[f.kind].trail, 0.18); vfx.sparksAt(c, 8, "white", 6, 1);
          sfx.play("assist");
          hud.cutIn(f.stats.name, a.id.replace(/([a-z])([A-Z])/g, "$1 $2"), f.kind);
          if (a.id === "PillarUppercut") { vfx.pillar(t.pos); sfx.play("stone"); camera.shake(0.35); }
          break;
        }
        case "shield": sfx.play("shield"); vfx.ring({ x: ev.target.pos.x, y: 0.06, z: ev.target.pos.z }, 4, "#e8b46a", 0.4); hud.pushLog("Bas: Bastion Wall"); break;
        case "shieldBlock": vfx.flash(ev.at, 1.4, "#e8b46a", 0.1); break;
        case "heal": {
          const c = chest(ev.target);
          vfx.number(c, `+${ev.amount}`, "heal text"); vfx.sparksAt(c, 8, "mint", 4, 3); sfx.play("heal");
          vfx.thread(chest(ev.fighter), c, 0.5);
          break;
        }
        case "allyDown": hud.toast(`${ev.fighter.stats.name.toUpperCase()} IS DOWN`, "danger"); break;
        case "allyRevive": hud.toast(`${ev.fighter.stats.name.toUpperCase()} IS BACK`, "clear"); break;
        case "projectile": sfx.play(ev.projectile.def.flat ? "mud" : "glint", 0.6); break;
        case "bossIntro":
          if (ev.fighter.stats.bog) setBog(true);
          showBossCard(ev.fighter.stats.name, ev.fighter.stats.bossTitle ?? "BOSS");
          sfx.play("bossIntro"); camera.shake(0.4);
          break;
        case "starsPlaced":
          constellation.place(ev.stars, ev.lines, ev.polaris);
          vfx.ring({ x: ev.polaris.x, y: 0.06, z: ev.polaris.z }, 15, "#ffd36a", 0.6); sfx.play("surgeFull"); camera.shake(0.3);
          hud.pushLog("Severin pins his stars");
          break;
        case "starWarn": constellation.warn(ev.frames); sfx.play("glint"); break;
        case "starStrike": constellation.strike(); sfx.play("ultActivate", 0.6); camera.shake(0.35); break;
        case "starsDim":
          constellation.clear(!ev.dimmed);
          if (ev.dimmed) { hud.toast("THE STARS GO DARK", "break"); sfx.play("postureBreak"); impact(2); }
          break;
        case "playerRevive": {
          const p = ev.fighter;
          vfx.ring({ x: p.pos.x, y: 0.06, z: p.pos.z }, 5, PALETTE.lantern, 0.6); vfx.flash(chest(p), 2.4, "#fff2cf", 0.3);
          hud.toast("GET UP", "afterimage"); sfx.play("surgeFull");
          break;
        }
        case "submerge": {
          const f = ev.fighter;
          vfx.ring({ x: f.pos.x, y: 0.06, z: f.pos.z }, 7, "#8a7a4a", 0.5); vfx.sparksAt({ x: f.pos.x, y: 0.4, z: f.pos.z }, 16, "gold", 9, 6);
          sfx.play("mud"); hud.pushLog("Hask submerges");
          break;
        }
        case "eruptWarning": vfx.warning(ev.at, ev.frames / 60); sfx.play("glint"); break;
        case "surface": sfx.play("slam"); camera.shake(0.5); break;
        case "uprooted":
          vfx.flash(ev.at, 4, "#bff4ff", 0.25); vfx.sparksAt(ev.at, 24, "mint", 14, 6); vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 8, PALETTE.gale, 0.5);
          sfx.play("postureBreak"); impact(3, true); camera.kick(0.6);
          hud.toast("UPROOTED", "afterimage");
          break;
        case "bossPhase":
          if (ev.drained) { setBog(false); hud.toast("THE BOG DRAINS", "clear"); hud.banner("PHASE 3 · EXPOSED"); }
          else if (ev.fighter.kind === "severin") { hud.toast("CONSTELLATION", "afterimage"); hud.banner("PHASE 2 · POLARIS"); }
          else { hud.toast("HASK ENRAGES", "danger"); hud.banner(`PHASE ${ev.phase}`); }
          sfx.play("bossIntro"); camera.shake(0.6);
          break;
        case "summon": for (const e of ev.summoned) vfx.ring({ x: e.pos.x, y: 0.06, z: e.pos.z }, 3, "#8a7a4a", 0.4); hud.pushLog(`Hask calls ${ev.summoned.length} hounds`); break;
        case "deflect": vfx.flash(ev.at, 1.8, "#e9d8ff", 0.12); vfx.sparksAt(ev.at, 10, "white", 9, 2); vfx.number(ev.at, "DEFLECT", "text"); sfx.play("block"); break;
        case "ward": {
          sfx.play("heal");
          for (const t of ev.targets) vfx.ring({ x: t.pos.x, y: 1.1, z: t.pos.z }, 2.2, "#b98cff", 0.5);
          hud.pushLog(`Cantor: Hymn wards ${ev.targets.length}`);
          break;
        }
        case "stance": hud.toast(`STANCE: ${ev.stance.toUpperCase()}`, "afterimage"); break;
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
        case "kill":
          if (!ev.ability?.tags.includes("finisher")) sfx.play("kill");
          if (ev.defender.stats.boss) {
            state.cinematic = 0.9; state.cinematicScale = 0.2; impact(5, true); camera.kick(1);
            setBog(false);
            const st = ev.defender.stats;
            hud.toast(st.defeatText ?? "BOSS DEFEATED", "finisher");
            if (st.drop) later(1.6, () => hud.banner(st.drop));
          }
          break;
        case "land": if (isPlayer(ev.fighter)) sfx.play("land"); break;
        case "slamLand": {
          const f = ev.fighter;
          vfx.ring({ x: f.pos.x, y: 0.05, z: f.pos.z }, 6, PALETTE.lantern, 0.4);
          vfx.sparksAt({ x: f.pos.x, y: 0.2, z: f.pos.z }, 12, "gold", 10, 4);
          sfx.play("slam"); camera.shake(0.45);
          break;
        }
        case "wave": constellation.clear(true); if (!world.run && state.mode !== "story") hud.banner(`WAVE ${ev.wave}`); sfx.play("wave"); break;
        case "waveClear":
          if (state.mode === "story") { hud.toast("CLEAR", "clear"); break; }
          if (world.run) break; // the run director handles clears
          hud.toast("YARD CLEAR", "clear");
          later(2.4, () => world.spawnWave());
          break;
        case "playerDown":
          hud.toast(`${(state.mode === "story" ? story.player.name : "Rook").toUpperCase()} FALLS`, "danger");
          if (state.mode === "story") break;
          if (!world.run) later(2.6, restart);
          break;
        case "runStart": hud.banner(ev.episode.subtitle); break;
        case "runStage": {
          const enc = ev.encounter;
          showBossCard(enc.title, ev.index === 0 ? `${EPISODE_4.title.toUpperCase()} · 1/${ev.total}` : `ENCOUNTER ${ev.index + 1} / ${ev.total}`);
          setBog(false);
          break;
        }
        case "runLine": hud.say(ev.speaker, ev.text); break;
        case "runCleared": hud.toast("CLEAR", "clear"); hud.banner("THE SQUAD CATCHES ITS BREATH · +35% HP"); sfx.play("wave"); break;
        case "runRetry": hud.toast("ONE MORE TIME", "afterimage"); setBog(false, true); walls.clear(); break;
        case "runComplete": showResults(ev); break;
        case "pageReady": {
          const name = PAGES[ev.slot].name;
          hud.toast("PAGE READY", "afterimage");
          hud.banner(`${name.toUpperCase()} CAN EVOLVE · PRESS ${controls.device === "gamepad" ? "VIEW" : controls.device === "touch" ? "PAGE" : "P"}`);
          sfx.play("surgeFull");
          break;
        }
        case "pageEvolved": hud.toast(ev.branch.name.toUpperCase(), "finisher"); sfx.play("ultActivate"); break;
        case "windWall": {
          const z = ev.zone;
          vfx.ring({ x: z.pos.x, y: 0.06, z: z.pos.z }, 4, PALETTE.gale, 0.4);
          vfx.sparksAt({ x: z.pos.x, y: 1.2, z: z.pos.z }, 12, "mint", 7, 2);
          walls.show(z);
          break;
        }
        case "zoneEnd": walls.hide(ev.zone); break;
        case "reflect": vfx.flash(ev.at, 2, "#bff4ff", 0.14); vfx.number(ev.at, "REFLECT", "text"); sfx.play("parry"); break;
        default: break;
      }
    }
  }

  function restart() {
    world.resetPlayer();
    setBog(false, true);
    world.wave = 0;
    world.spawnWave();
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
  // Wind Wall visuals: a translucent sheet of wind per live zone.
  const walls = (() => {
    const pool = [0, 1].map((i) => {
      const m = BB.MeshBuilder.CreatePlane(`wall-${i}`, { width: 5.2, height: 3.4, sideOrientation: BB.Mesh.DOUBLESIDE }, scene);
      m.material = glow(scene, `wall-mat-${i}`, PALETTE.gale, 0.25, true); m.isPickable = false; m.setEnabled(false);
      return { mesh: m, zone: null };
    });
    return {
      show(z) { const s = pool.find((p) => !p.zone) ?? pool[0]; s.zone = z; s.mesh.setEnabled(true); s.mesh.position.set(z.pos.x, 1.7, z.pos.z); s.mesh.rotation.y = z.yaw; },
      hide(z) { const s = pool.find((p) => p.zone === z); if (s) { s.zone = null; s.mesh.setEnabled(false); } },
      update(t) { for (const s of pool) if (s.zone) { s.mesh.visibility = 0.55 + Math.sin(t * 14) * 0.2 * (s.zone.frames / s.zone.max); s.mesh.scaling.y = 0.9 + Math.sin(t * 9) * 0.06; } },
      clear() { for (const s of pool) { s.zone = null; s.mesh.setEnabled(false); } },
    };
  })();

  // Page evolution choice (pauses the fight).
  const pageModal = root.querySelector("[data-pages]");
  const openPages = () => {
    const slot = Object.keys(world.pages).find((k) => world.pages[k].ready);
    if (!slot) { hud.pushLog("No page is ready to evolve yet"); return; }
    const def = PAGES[slot];
    state.modal = true;
    pageModal.hidden = false;
    pageModal.querySelector("[data-pages-title]").textContent = `${def.name.toUpperCase()} · CHOOSE ITS EVOLUTION`;
    const cards = pageModal.querySelector("[data-pages-cards]");
    cards.innerHTML = def.branches.map((b) => `<button class="pcard" data-branch="${b.key}"><kbd>${b.key === "A" ? "J" : "K"}</kbd><b>${b.name}</b><span>${b.desc}</span></button>`).join("");
    pageModal.dataset.slot = slot;
    for (const btn of cards.querySelectorAll("[data-branch]")) btn.addEventListener("click", () => choosePage(btn.dataset.branch));
  };
  const choosePage = (key) => {
    const slot = pageModal.dataset.slot;
    if (!slot) return;
    world.evolvePage(slot, key);
    onEvents(world.drainEvents());
    pageModal.hidden = true; pageModal.dataset.slot = ""; state.modal = false;
  };

  // Results screen at the end of the run.
  const results = root.querySelector("[data-results]");
  const showResults = (ev) => {
    const s = ev.stats, m = Math.floor(s.frames / 3600), sec = Math.floor((s.frames / 60) % 60);
    results.querySelector("[data-rank]").textContent = ev.rank;
    results.querySelector("[data-rank]").className = `rank r${ev.rank}`;
    results.querySelector("[data-stats]").innerHTML = [
      ["Time", `${m}:${String(sec).padStart(2, "0")}`], ["Max combo", s.maxCombo], ["Damage dealt", Math.round(s.damageDealt)],
      ["Damage taken", Math.round(s.damageTaken)], ["Reactions", s.reactions], ["Assists", s.assists],
      ["Parries + perfect dodges", s.perfect], ["Defeated", s.kills], ["Retries", s.retries],
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    results.hidden = false; state.modal = true;
  };

  // Ultimate name card (the "technique shout" beat).
  const ultCard = root.querySelector("[data-ultcard]");
  const showUltCard = () => { ultCard.classList.remove("show"); void ultCard.offsetWidth; ultCard.classList.add("show"); };

  // Boss title card (reuses the ultimate's card styling).
  const showBossCard = (name, sub) => {
    ultCard.innerHTML = `<b>${name.toUpperCase()}</b><span>${sub}</span>`;
    ultCard.classList.remove("show"); void ultCard.offsetWidth; ultCard.classList.add("show");
    later(1.4, () => { ultCard.innerHTML = "<b>SKYRENDER</b><span>WIND GRIMOIRE · LEGENDARY PAGE</span>"; });
  };

  const toggleHelp = (on = !state.help) => { state.help = on; root.querySelector("[data-help]").hidden = !on; };
  menu("help", () => toggleHelp());
  menu("frameData", () => { settings.frameData = !settings.frameData; applySettings(); });
  menu("flashes", () => { settings.flashes = !settings.flashes; applySettings(); });
  menu("sound", () => { settings.sound = !settings.sound; applySettings(); });
  menu("assist", () => { settings.assist = !settings.assist; applySettings(); hud.toast(settings.assist ? "ASSIST ON" : "ASSIST OFF"); });
  menu("reset", () => { if (state.mode === "story") backToTitle(); else if (state.mode === "run") replay("run"); else restart(); }); // story: back to the title (progress is autosaved)
  root.querySelector("[data-help-close]")?.addEventListener("click", () => toggleHelp(false));
  applySettings();

  /** A fresh world for a new run or sandbox session (views rebuilt, settings kept). */
  const newWorld = (opts = {}) => {
    for (const f of [...views.keys()]) removeView(f);
    walls.clear(); setBog(false, true); constellation.clear(true);
    world = new World({ tokens: mobile ? 1 : 2, seed: (Date.now() & 0xffff) || 1, assist: settings.assist, companions: true, ...opts });
    if (opts.tokens == null) world.tokens.capacity = mobile ? 1 : 2;
    world.pageDefs = PAGES;
    camera.bounds = null;
    root.classList.toggle("no-ult", !world.ultimate);
    root.classList.toggle("solo", !world.companions.length);
    root.dataset.locked = [...Object.entries(world.loadout).filter(([, a]) => !a).map(([k]) => k), ...(world.pageGrowth ? [] : ["pages"])].join(" ");
    handle.world = world;
    addView(world.player);
    for (const c of world.companions) addView(c);
    world.drainEvents();
    return world;
  };
  const start = (mode = "run") => {
    if (state.started) return;
    state.started = true;
    sfx.unlock();
    root.querySelector("[data-start]").classList.add("gone");
    state.mode = mode;
    root.classList.toggle("story-mode", mode === "story");
    if (mode === "story") return; // the story player drives the world
    if (world.ultimate === false || !world.companions.length) newWorld();
    if (mode === "run") world.startRun(EPISODE_4); else world.spawnWave();
    onEvents(world.drainEvents());
  };
  const startScreen = root.querySelector("[data-start]");
  startScreen.querySelector("[data-start-run]")?.addEventListener("click", (e) => { e.stopPropagation(); start("run"); });
  startScreen.querySelector("[data-start-yard]")?.addEventListener("click", (e) => { e.stopPropagation(); start("yard"); });

  // ---- Story mode (Phase 3) ----
  const saves = SaveStore.browser();
  const story = new StoryPlayer({
    root, scene, camera, hud, sfx, vfx, controls, saves, sets,
    setPlayerVisible: (on) => views.get(world.player)?.setVisible(on),
    setSquadVisible: (on) => { for (const c of world.companions) views.get(c)?.setVisible(on); },
    getWorld: () => world,
    makeWorld: (opts) => newWorld(opts),
    onEvents: (evs) => onEvents(evs),
  }, [{ episode: EPISODE_1, script: EP1_SCRIPT }, { episode: EPISODE_2, script: EP2_SCRIPT }, { episode: EPISODE_3, script: EP3_SCRIPT }, { episode: EPISODE_4_STORY, script: EP4_SCRIPT }], [WORLD_SCRIPT]);
  const playerName = root.querySelector(".player-card .name");
  const showName = (n) => { if (playerName?.firstChild) playerName.firstChild.textContent = `${n.toUpperCase()} `; };
  const backToTitle = () => {
    story.stop();
    state.started = false; state.mode = null; state.modal = false;
    root.classList.remove("story-mode", "in-scene", "roaming");
    mapModal.hidden = true;
    newWorld();
    showName("Rook");
    refreshContinue();
    startScreen.classList.remove("gone");
  };
  const playStory = async (episodeId, beat) => {
    start("story");
    showName(story.player.name);
    root.classList.remove("roaming");
    await story.play(episodeId, beat);
    const exit = story.pendingExit; story.pendingExit = null;
    if (!state.started || state.mode !== "story") return; // left another way
    if (exit?.kind === "episode" && story.episodeById(exit.id)) { story.stop(); state.started = false; playStory(exit.id, 0); return; }
    backToTitle();
    if (exit?.kind === "run") start("run");
  };
  const createModal = root.querySelector("[data-create]");
  const nameInput = createModal.querySelector("[data-pc-name]");
  let pronouns = "they";
  for (const b of createModal.querySelectorAll("[data-p]")) b.addEventListener("click", () => {
    pronouns = b.dataset.p; sfx.play("ui");
    for (const o of createModal.querySelectorAll("[data-p]")) o.setAttribute("aria-pressed", String(o === b));
  });
  const openCreate = () => { sfx.unlock(); createModal.hidden = false; state.modal = true; setTimeout(() => nameInput.focus(), 50); };
  const begin = () => {
    createModal.hidden = true; state.modal = false;
    story.flags.load({});
    story.player = { name: cleanName(nameInput.value), pronouns };
    playStory("ep1", 0);
  };
  createModal.querySelector("[data-pc-begin]").addEventListener("click", begin);
  createModal.querySelector("[data-pc-back]").addEventListener("click", () => { createModal.hidden = true; state.modal = false; });
  nameInput.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") begin(); });
  // Free roam: the Lighthouse and Aurelin (Phase 4).
  const playWorld = (zoneId = "lighthouse", arrival = null) => {
    start("story");
    root.classList.add("roaming");
    showName(story.player.name);
    story.roam(zoneId, arrival);
  };
  startScreen.querySelector("[data-start-world]")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const last = saves.latest()?.save;
    story.player = last ? { name: last.player.name, pronouns: last.player.pronouns } : { name: "Rook", pronouns: "they" };
    story.flags.load(last?.flags ?? {});
    playWorld(last?.zone ?? "lighthouse", last?.zone ? last.arrival : null);
  });
  const mapModal = root.querySelector("[data-map]");
  const openMap = () => {
    if (!story.roaming) return;
    sfx.play("ui");
    const list = mapModal.querySelector("[data-map-list]");
    list.innerHTML = Object.values(ZONES).map((z) => `<button data-zone="${z.id}" ${story.zone?.id === z.id ? "disabled" : ""}><b>${z.name.toUpperCase()}</b><span>${z.region}${story.zone?.id === z.id ? " · You are here" : ""}</span></button>`).join("");
    for (const b of list.querySelectorAll("[data-zone]")) b.addEventListener("click", () => { mapModal.hidden = true; state.modal = false; story.travel(b.dataset.zone); });
    mapModal.hidden = false; state.modal = true;
  };
  mapModal.querySelector("[data-map-close]").addEventListener("click", () => { mapModal.hidden = true; state.modal = false; });
  menu("map", openMap);
  const continueBtn = startScreen.querySelector("[data-continue]");
  const refreshContinue = () => {
    const last = saves.read("auto");
    if (last?.zone && ZONES[last.zone]) { continueBtn.hidden = false; continueBtn.textContent = `CONTINUE · ${ZONES[last.zone].name.toUpperCase()}`; return; }
    const ep = last && story.episodeById(last.episode);
    continueBtn.hidden = !ep || last.beat >= ep.beats.length;
    if (!continueBtn.hidden) continueBtn.textContent = `CONTINUE · EP ${ep.number}`;
  };
  const doContinue = () => {
    const last = saves.read("auto");
    if (!last) return;
    story.player = { name: last.player.name, pronouns: last.player.pronouns };
    story.flags.load(last.flags);
    if (last.zone && ZONES[last.zone]) { playWorld(last.zone, last.arrival); return; }
    playStory(last.episode, last.beat);
  };
  continueBtn.addEventListener("click", (e) => { e.stopPropagation(); doContinue(); });
  startScreen.querySelector("[data-start-story]")?.addEventListener("click", (e) => { e.stopPropagation(); openCreate(); });

  // Episodes & saves: pick any unlocked episode, load a slot, or (in the story) save to one.
  const slotsModal = root.querySelector("[data-slots]");
  const slotLabel = (sv) => {
    if (!sv) return "<span>Empty</span>";
    const ep = story.episodeById(sv.episode);
    const where = ep ? (sv.beat >= ep.beats.length ? `Episode ${ep.number} complete` : `Episode ${ep.number} · ${ep.title}`) : "—";
    const when = sv.savedAt ? new Date(sv.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "";
    return `<span>${sv.player.name} · ${where}<small>${when}</small></span>`;
  };
  const closeSlots = () => { slotsModal.hidden = true; state.modal = false; };
  const loadSave = (sv) => {
    closeSlots();
    story.player = { name: sv.player.name, pronouns: sv.player.pronouns };
    story.flags.load(sv.flags);
    const ep = story.episodeById(sv.episode);
    if (state.started) { story.stop(); state.started = false; }
    playStory(sv.episode, sv.beat >= (ep?.beats.length ?? 0) ? 0 : sv.beat);
  };
  const openSlots = (mode) => {
    sfx.unlock(); sfx.play("ui");
    const saving = mode === "save";
    slotsModal.querySelector("[data-slots-title]").textContent = saving ? "SAVE YOUR STORY" : "EPISODES & SAVES";
    const epList = slotsModal.querySelector("[data-ep-list]");
    epList.hidden = saving;
    slotsModal.querySelector("[data-slots-sub]").textContent = saving ? "CHOOSE A SLOT" : "LOAD A SAVE";
    const reached = saves.reached;
    epList.innerHTML = story.episodes.map(({ episode: e }) =>
      `<button data-ep="${e.id}" ${e.number > reached ? "disabled" : ""}><b>EP ${e.number}</b><span>${e.number > reached ? "Locked" : e.title}<small>${e.arc ?? ""}</small></span></button>`).join("");
    for (const b of epList.querySelectorAll("[data-ep]")) b.addEventListener("click", () => {
      const last = saves.latest()?.save;
      closeSlots();
      story.player = last ? { name: last.player.name, pronouns: last.player.pronouns } : { name: "Rook", pronouns: "they" };
      story.flags.load(last?.flags ?? {});
      playStory(b.dataset.ep, 0);
    });
    const list = slotsModal.querySelector("[data-slot-list]");
    const slots = saving ? ["1", "2", "3"] : ["auto", "1", "2", "3"];
    list.innerHTML = slots.map((k) => `<button data-slot="${k}"><b>${k === "auto" ? "AUTO" : `SLOT ${k}`}</b>${slotLabel(saves.read(k))}</button>`).join("");
    for (const b of list.querySelectorAll("[data-slot]")) b.addEventListener("click", () => {
      const k = b.dataset.slot;
      if (saving) {
        const snap = story.snapshot();
        if (snap && saves.write(k, snap)) { b.innerHTML = `<b>SLOT ${k}</b>${slotLabel(saves.read(k))}`; hud.toast("SAVED", "clear"); sfx.play("ui"); }
      } else {
        const sv = saves.read(k);
        if (sv) loadSave(sv);
      }
    });
    slotsModal.hidden = false; state.modal = true;
  };
  slotsModal.querySelector("[data-slots-close]").addEventListener("click", () => { sfx.play("ui"); closeSlots(); });
  startScreen.querySelector("[data-episodes]")?.addEventListener("click", (e) => { e.stopPropagation(); openSlots("load"); });
  menu("save", () => { if (state.mode === "story") openSlots("save"); });
  refreshContinue();
  const replay = (mode) => { results.hidden = true; state.modal = false; newWorld(); state.started = false; start(mode); };
  results.querySelector("[data-again]")?.addEventListener("click", () => replay("run"));
  results.querySelector("[data-yard]")?.addEventListener("click", () => replay("yard"));

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
    let running = state.started && !state.paused && !state.help && !state.frozen && !state.modal && !story.blocking;
    for (const cmd of controls.drainCommands()) {
      if (!state.started) {
        if (cmd === "confirm" && slotsModal.hidden) { if (!createModal.hidden) begin(); else (continueBtn.hidden ? openCreate() : doContinue()); }
        continue;
      }
      if (story.blocking) { // scenes and cards: menu-style input
        if (cmd === "confirm") story.confirm();
        if (cmd === "navUp") story.nav(-1);
        if (cmd === "navDown") story.nav(1);
        if (cmd === "assist:bas") story.choose(0);
        if (cmd === "assist:juno") story.choose(1);
        if (cmd === "stance") story.choose(2);
        if (cmd === "help") toggleHelp();
        if (cmd === "pause") { if (state.help) toggleHelp(false); else state.paused = !state.paused; root.classList.toggle("paused", state.paused); }
        continue;
      }
      if (state.mode === "story" && (cmd === "boss" || cmd === "reset")) continue; // sandbox shortcuts are off in the story
      if (cmd === "confirm" && story.exploring?.near) { story.interact(); continue; }
      if (cmd === "pages" && story.roaming) { openMap(); continue; }
    if (cmd === "pages") { if (pageModal.hidden) openPages(); else { pageModal.hidden = true; state.modal = false; } }
      if (cmd === "lock") { const t = world.toggleLock(); if (!t) camera.yaw = world.player.yaw; sfx.play("ui"); }
      if (cmd === "unlock" && world.lockTarget) { world.lockTarget = null; sfx.play("ui"); }
      if (cmd.startsWith("assist:") && running) {
        const r = world.callAssist(cmd.slice(7));
        if (!r.ok) { sfx.play("ui"); hud.pushLog(`Assist ${cmd.slice(7)}: ${r.reason}`); }
        onEvents(world.drainEvents());
      }
      if (cmd === "stance" && running) { world.cycleStance(); onEvents(world.drainEvents()); }
      if (cmd === "boss" && running) { // sandbox shortcut: straight to the boss
        world.resetPlayer(); setBog(false, true); world.wave = 6; world.spawnWave(); onEvents(world.drainEvents());
      }
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
    if (!state.started && presses.length && createModal.hidden && slotsModal.hidden) (continueBtn.hidden ? openCreate() : doContinue()); // any attack button on the title screen
    if (story.blocking) { if (presses.includes(1) || presses.includes(3)) story.confirm(); presses.length = 0; } // Slash or Jump advances dialogue
    else if (story.exploring?.near && presses.includes(1)) { story.interact(); presses.length = 0; } // Slash talks to whoever is close
    if (!pageModal.hidden) for (const p of presses) { if (p === 1) choosePage("A"); if (p === 2) choosePage("B"); } // Light / Heavy pick a branch
    running = state.started && !state.paused && !state.help && !state.frozen && !state.modal && !story.blocking; // after commands: pause/help/modals may have changed
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
    const pyaw = views.get(p)?.root.rotation.y ?? p.yaw;
    if (camera.inShot && !(p.current?.surgeCost > 0)) { camera.cue("ult-return"); root.classList.remove("ult-desat"); } // safety: never strand the camera
    camera.update(dt, pr, lock?.pos ?? null, look, pyaw);
    root.classList.toggle("surge-full", !!p.surge?.isFull);
    vfx.syncProjectiles(world.projectiles, dt);
    vfx.update(dt, camera.cam, engine);
    arena.update(dt, state.time);
    sets.update(dt, state.time);
    constellation.update(dt, state.time);
    walls.update(state.time);
    hud.update(dt, world, controls.device);
    story.update(dt, state.paused || state.help || state.frozen);

    if (impactLeft > 0) { impactLeft -= dt; if (impactLeft <= 0) canvas.style.filter = ""; }
    quality.update(dt);
    if (!state.toonChecked && state.time > 1.5) { state.toonChecked = true; if (toonFallbackIfBroken(scene)) console.warn("toon shader failed; using classic cel shading"); }
    scene.render();
  });
  addEventListener("resize", () => engine.resize());
  // Leaving the tab pauses the fight (and stops the clock from catching up afterwards).
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.started && !state.paused) { state.paused = true; root.classList.add("paused"); }
  });

  // Test hook: freeze the live clock so automated checks can step the sim frame-exactly.
  const freezeLogic = (on) => { state.frozen = on; };
  const handle = { engine, scene, world, camera, start, restart, freezeLogic, openPages, choosePage, story, saves, sets, playStory, backToTitle, openSlots, playWorld, openMap, data: { acolyte: ACOLYTE_ABILITIES } };
  return handle;
}

if (typeof document !== "undefined" && !globalThis.__UNWRITTEN_NO_BOOT__) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { globalThis.unwritten = boot(); });
  else globalThis.unwritten = boot();
}
