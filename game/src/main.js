// UNWRITTEN — combat sandbox entry point. Wires the sim to Babylon, input, audio, and HUD.

import { FrameClock } from "./core/timing.js";
import { EventType } from "./core/abilities.js";
import { Team } from "./core/combat.js";
import { World } from "./sim/world.js";
import { ACOLYTE_ABILITIES } from "./data/acolyte.js";
import { ROOK_ABILITIES, ROOK_STATS } from "./data/rook.js";
import { PAGES } from "./data/pages.js";
import { EPISODE_4 } from "./data/run.js";
import { B, PALETTE, glow, clamp01, toonFallbackIfBroken } from "./runtime/look.js";
import { Rig, LOOKS } from "./runtime/rig.js";
import { ObjectView } from "./runtime/objects.js";
import { WorldClock } from "./sim/weather.js";
import { LOD } from "./runtime/body.js";
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
import { Inventory } from "./core/inventory.js";
import { Progress, addMods, pageLevel, pageLevelProgress } from "./core/progress.js";
import { SKILLS, TREE_COLUMNS, XP_BY_KIND, PAGE_ROMAN, MAX_LEVEL } from "./data/skills.js";
import { BONDS, RANK_POINTS, RANK_UNLOCKS, GIFTS } from "./data/bonds.js";
import { MATERIALS, HQ, TEMPER } from "./data/crafting.js";
import { FRAGMENTS, CLAUSE } from "./data/lore.js";
import { ITEMS, SHOPS, SLOTS, BOUNTIES, slotKind } from "./data/items.js";
import { squadRank } from "./core/quests.js";
import { fillText } from "./core/script.js";

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
  // Performance (Phase 4 Step 5): the glow pass draws only things that glow (unlit or emissive
  // materials), instead of every mesh in the scene a second time. New meshes are picked up as they appear.
  Rig.outlineRange = mobile ? 20 : 22; // characters past this lose their ink lines (level of detail)
  LOD.tess = mobile ? 0.75 : 1;         // phones get rounder-is-cheaper bodies
  const glowing = new Set();
  const syncGlow = () => {
    for (const m of scene.meshes) {
      if (glowing.has(m.uniqueId) || m.metadata?.noGlow) continue;
      const mat = m.material, e = mat?.emissiveColor;
      if (!mat || !(mat.disableLighting || mat.metadata?.glow || (e && e.r + e.g + e.b > 0.25))) continue;
      glowing.add(m.uniqueId); gl.addIncludedOnlyMesh(m);
      m.onDisposeObservable.addOnce(() => { glowing.delete(m.uniqueId); gl.removeIncludedOnlyMesh(m); });
    }
  };
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
    if (views.has(f) || f.traits?.dummy) return; // training dummies are part of the set (they rock on their posts)
    if (LOOKS[f.kind]?.form === "object") { views.set(f, new ObjectView(scene, f.kind, f.id, LOOKS[f.kind])); return; } // bells, seals, egg sacs, bubbles
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
          if (d.traits?.dummy) sets.get(sets.current)?.hitDummy?.(d.pos.x, d.pos.z, a.pos, heavy ? 2 : 1);
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
        case "tagSwap": { // the partner comes in: a new body on the field, a shockwave, a cut-in
          const f = world.player;
          removeView(f); addView(f);
          const name = ev.to === "player" ? (state.mode === "story" ? story.player.name : "Rook") : ev.name;
          showName(name);
          hud.cutIn(name, ev.forced ? "TAGS IN TO COVER YOU" : "TAG IN", ev.to === "player" ? "player" : "severin");
          vfx.ring({ x: f.pos.x, y: 0.05, z: f.pos.z }, 5, LOOKS[f.kind]?.trail ?? "#ffffff", 0.45); vfx.flash(chest(f), 3, "#fff1b8", 0.2);
          sfx.play("assist"); camera.shake(0.25);
          root.classList.toggle("tag-severin", ev.to !== "player");
          break;
        }
        // ---- Arc 1–2 bosses ----
        case "silenceZone": silenceFx.add(ev.zone); sfx.play("heal", 0.7); break;
        case "silenceEnd": silenceFx.remove(ev.zone); break;
        case "silenced": hud.toast(ev.what === "dodge" ? "DODGE SILENCED · PARRY!" : "SILENCED", "danger"); sfx.play("block", 0.5); break;
        case "wave": vfx.ring({ x: ev.wave.x, y: 0.08, z: ev.wave.z }, ev.wave.maxR, { toll: "#c9b4ff", rot: "#c86a2a", splash: "#6ac8d8" }[ev.wave.kind] ?? "#ffffff", ev.wave.maxR / ev.wave.speed); sfx.play(ev.wave.kind === "rot" ? "mud" : "slam", 0.7); camera.shake(0.2); break;
        case "bells": hud.toast("THE BELLS RING", "danger"); hud.banner("NO SPELLS ANYWHERE · BREAK THE THREE BELLS"); silenceFx.all(true); break;
        case "bellsBroken": hud.toast("SILENCE BROKEN", "break"); silenceFx.all(false); impact(3, true); sfx.play("postureBreak"); break;
        case "wardBroken": hud.toast("HER WARD FALLS", "break"); break;
        case "hushWarn": hud.toast("SHE DRAWS BREATH…", "danger"); vfx.warning({ x: world.player.pos.x, y: 0, z: world.player.pos.z }, ev.frames / 60); sfx.play("glint"); break;
        case "hushDodge": hud.toast("DODGE SILENCED · PARRY!", "danger"); hud.banner("FIVE SECONDS: GUARD AND PARRY"); root.classList.add("hushed"); break;
        case "hushEnd": root.classList.remove("hushed"); break;
        case "oath": hud.toast("THE OATH", "danger"); hud.banner("NOTHING STAGGERS HIM · BREAK THE THREE VOW-SEALS"); sfx.play("bossIntro"); break;
        case "oathBroken": hud.toast("THE VOW BREAKS", "break"); vfx.flash(ev.at, 4, "#ff7a2a", 0.3); impact(4, true); camera.kick(0.8); sfx.play("postureBreak"); break;
        case "desperate": hud.toast("DESPERATION", "danger"); hud.banner("HE CHARGES THE WHOLE HALL · DODGE"); break;
        case "flood": hud.toast("THE CISTERN FLOODS", "danger"); hud.banner("THE WATER JET SWEEPS · JUMP IT"); waterJet.start(ev.center, ev.length); sfx.play("ultActivate"); break;
        case "swallowed": hud.toast("SWALLOWED!", "danger"); hud.banner(ev.target ? `${ev.target.stats.name.toUpperCase()} IS STUCK IN A SLIME BUBBLE · BURST IT` : "MORE EGG SACS"); sfx.play("mud"); break;
        case "freed": hud.toast(`${ev.fighter.stats.name.toUpperCase()} IS FREE`, "clear"); break;
        case "teamAttack": {
          const b = BONDS[ev.kind];
          hud.toast("TEAM ATTACK", "finisher"); hud.banner((b?.team?.name ?? "TEAM ATTACK").toUpperCase());
          sfx.play("ultActivate"); camera.shake(0.3); vfx.flash(chest(world.player), 3, "#ffd27a", 0.2);
          break;
        }
        case "teamStrike": {
          vfx.ring({ x: ev.target.pos.x, y: 0.05, z: ev.target.pos.z }, 8, PALETTE.gale, 0.5); vfx.sparksAt(ev.at, 24, "mint", 14, 6);
          vfx.flash(ev.at, 4, "#ffffff", 0.25); impact(5, true); camera.kick(1); sfx.play("finisher");
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
          if (BOSS_PHASE_TEXT[ev.fighter.kind]) { const t = BOSS_PHASE_TEXT[ev.fighter.kind][ev.phase]; if (t) { hud.toast(t[0], t[2] ?? "danger"); hud.banner(t[1]); } sfx.play("bossIntro"); camera.shake(0.6); break; }
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
          if (state.mode === "story" && ev.defender.team === Team.Enemy && XP_BY_KIND[ev.defender.kind]) {
            const n = Math.round(XP_BY_KIND[ev.defender.kind] * (1 + story.crafting.xpBonus));
            vfx.number({ x: ev.defender.pos.x, y: ev.defender.pos.y + 2.9, z: ev.defender.pos.z }, `+${n} XP`, "text");
            story.gainXp(n);
            for (const d of story.crafting.drop(ev.defender.kind)) vfx.number({ x: ev.defender.pos.x + 0.4, y: ev.defender.pos.y + 3.3, z: ev.defender.pos.z }, `+${d.n} ${MATERIALS[d.id].name.toUpperCase()}`, "text marks");
          }
          if (state.mode === "story" && ev.defender.team === Team.Enemy && BOUNTIES[ev.defender.kind]) {
            const n = BOUNTIES[ev.defender.kind];
            story.inventory.earn(n);
            vfx.number({ x: ev.defender.pos.x, y: ev.defender.pos.y + 2.4, z: ev.defender.pos.z }, `+${n} MARKS`, "text marks");
          }
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
        case "pageLevel":
          if (ev.level !== 3) { hud.toast(`${ev.page.name.toUpperCase()} · ${PAGE_ROMAN[ev.level - 1]}`, "afterimage"); sfx.play("ui"); }
          if (ev.level === 5) hud.banner(`${ev.page.name.toUpperCase()} MASTERED · A QUARTER LESS MANA`);
          refreshGrimDot();
          break;
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
    if (state.mode === "story" && world.progress) { openGrimoire(); return; }
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
  // Performance meter (Phase 4 Step 5): frame rate, draw calls and render scale, against the budget (GDD §23.3).
  const perfEl = root.querySelector("[data-perf]"), perfBtn = root.querySelector("[data-perf-toggle]");
  const perf = { on: false, t: 0, frames: 0, draws: 0, si: null };
  perfBtn?.addEventListener("click", () => {
    perf.on = !perf.on; perfEl.hidden = !perf.on; sfx.play("ui");
    perfBtn.textContent = perf.on ? "HIDE PERFORMANCE METER" : "SHOW PERFORMANCE METER";
    if (perf.on && !perf.si) perf.si = new BB.SceneInstrumentation(scene);
  });
  const perfTick = (dt) => {
    if (!perf.on || !perf.si) return;
    perf.t += dt; perf.frames++; perf.draws += perf.si.drawCallsCounter.current;
    if (perf.t < 0.5) return;
    const fps = perf.frames / perf.t, draws = Math.round(perf.draws / perf.frames), budget = mobile ? 250 : 400;
    perfEl.textContent = `${Math.round(fps)} FPS · ${draws}/${budget} DRAWS · ${Math.round(scene.getActiveIndices() / 3000)}K TRIS · ${quality.ratio.toFixed(2)}x`;
    perfEl.classList.toggle("over", fps < 50 || draws > budget);
    perf.t = 0; perf.frames = 0; perf.draws = 0;
  };
  menu("frameData", () => { settings.frameData = !settings.frameData; applySettings(); });
  menu("flashes", () => { settings.flashes = !settings.flashes; applySettings(); });
  menu("sound", () => { settings.sound = !settings.sound; applySettings(); });
  menu("assist", () => { settings.assist = !settings.assist; applySettings(); hud.toast(settings.assist ? "ASSIST ON" : "ASSIST OFF"); });
  menu("reset", () => { if (state.mode === "story") backToTitle(); else if (state.mode === "run") replay("run"); else restart(); }); // story: back to the title (progress is autosaved)
  root.querySelector("[data-help-close]")?.addEventListener("click", () => toggleHelp(false));
  applySettings();

  /** A fresh world for a new run or sandbox session (views rebuilt, settings kept). */
  let resetBossFx = null; // set once the boss visuals exist (below)
  const newWorld = (opts = {}) => {
    for (const f of [...views.keys()]) removeView(f);
    walls.clear(); setBog(false, true); constellation.clear(true);
    world = new World({ tokens: mobile ? 1 : 2, seed: (Date.now() & 0xffff) || 1, assist: settings.assist, companions: true, ...opts });
    if (opts.tokens == null) world.tokens.capacity = mobile ? 1 : 2;
    world.pageDefs = PAGES;
    root.classList.toggle("has-tag", !!world.members.severin); root.classList.remove("tag-severin", "hushed");
    resetBossFx?.();
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
    if (mode === "story") refreshGrimDot();
    if (mode === "story") return; // the story player drives the world
    if (mode === "yard") newWorld({ party: ["severin"] }); // the practice yard: Severin can tag in (T)
    else if (world.ultimate === false || !world.companions.length || world.members.severin) newWorld();
    if (mode === "run") world.startRun(EPISODE_4); else world.spawnWave();
    onEvents(world.drainEvents());
  };
  const startScreen = root.querySelector("[data-start]");
  // Title buttons: once the game is running they must never fire again (a focused button would
  // otherwise "click" on Enter), so they drop focus and ignore clicks after the start.
  startScreen.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    b.blur();
    if (state.started) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
  startScreen.querySelector("[data-start-run]")?.addEventListener("click", (e) => { e.stopPropagation(); start("run"); });
  startScreen.querySelector("[data-start-yard]")?.addEventListener("click", (e) => { e.stopPropagation(); start("yard"); });

  // ---- Story mode (Phase 3) ----
  const saves = SaveStore.browser();
  const story = new StoryPlayer({
    root, scene, camera, hud, sfx, vfx, controls, saves, sets, mobile,
    setPlayerVisible: (on) => views.get(world.player)?.setVisible(on),
    setSquadVisible: (on) => { for (const c of world.companions) views.get(c)?.setVisible(on); },
    getWorld: () => world,
    makeWorld: (opts) => newWorld({ ...opts, mods: statMods(partyOf(opts.companions)), progress: story.progress, teamAttacks: story.bonds.teamAttacks(), pageXpBonus: story.crafting.pageXpBonus }),
    openUI: (kind) => openHQ(kind),
    onMeal: () => { hud.toast("WARM AND FULL", "clear"); hud.banner("+20 HEALTH · +5% DAMAGE UNTIL MIDNIGHT"); sfx.play("heal"); applyGear(); const p = world.player; p.combatant.health.fill(); },
    openShop: (id) => openShop(id),
    onQuest: (e) => {
      if (e.type === "questStart") { hud.toast("NEW QUEST", "afterimage"); hud.banner(e.quest.title.toUpperCase()); sfx.play("surgeFull"); }
      if (e.type === "questStage") { hud.toast("QUEST UPDATED", "afterimage"); sfx.play("ui"); }
      if (e.type === "questDone") {
        const r = e.quest.reward ?? {};
        hud.toast("QUEST COMPLETE", "finisher"); sfx.play("ultActivate");
        hud.banner(`${e.quest.title.toUpperCase()}${r.marks ? ` · +${r.marks} MARKS` : ""}`);
      }
    },
    onBond: (id, r) => {
      const b = BONDS[id]; if (!b) return;
      if (r.event) { hud.toast("BOND EVENT", "afterimage"); hud.banner(`${b.name.toUpperCase()} · YOU'RE CLOSER NOW`); sfx.play("surgeFull"); refreshGrimDot(); return; }
      if (r.rankUp) {
        const un = RANK_UNLOCKS[r.rank];
        hud.toast(`BOND · ${b.name.toUpperCase()} · RANK ${r.rank}`, "finisher"); sfx.play("ultActivate");
        hud.banner(un ? `UNLOCKED: ${un.toUpperCase()}` : `${b.name.toUpperCase()} TRUSTS YOU A LITTLE MORE`);
        applyGear();
      } else if (r.gained) hud.toast(`♥ ${b.name.toUpperCase()} +${r.gained}`, "clear");
      if (story.bonds.eventReady(id)) hud.banner(`${b.name.toUpperCase()} HAS SOMETHING TO TELL YOU`);
    },
    onXp: (n, levels) => {
      if (!levels) return;
      const pr = story.progress;
      hud.toast(`LEVEL UP · ${pr.level}`, "finisher"); sfx.play("surgeFull");
      hud.banner(`+${levels} SKILL POINT${levels > 1 ? "S" : ""}`);
      applyGear();
      const p = world.player; p.combatant.health.set(p.combatant.health.max); p.mana?.fill(); // a level-up restores you
      refreshGrimDot();
    },
    onEvents: (evs) => onEvents(evs),
  }, [{ episode: EPISODE_1, script: EP1_SCRIPT }, { episode: EPISODE_2, script: EP2_SCRIPT }, { episode: EPISODE_3, script: EP3_SCRIPT }, { episode: EPISODE_4_STORY, script: EP4_SCRIPT }], [WORLD_SCRIPT]);
  const playerName = root.querySelector(".player-card .name");
  const showName = (n) => { if (playerName?.firstChild) playerName.firstChild.textContent = `${n.toUpperCase()} `; };
  const backToTitle = () => {
    story.stop();
    state.started = false; state.mode = null; state.modal = false;
    root.classList.remove("story-mode", "in-scene", "roaming");
    mapModal.hidden = true; journal.hidden = true; shopModal.hidden = true; grim.hidden = true;
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
    story.inventory = new Inventory(); story.progress = new Progress();
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
    story.inventory = new Inventory(last?.inv); story.progress = new Progress(last?.prog);
    story.clock = new WorldClock(); story.clock.load(last?.clock); // the day carries on where you left it
    playWorld(last?.zone ?? "lighthouse", last?.zone ? last.arrival : null);
  });
  const mapModal = root.querySelector("[data-map]");
  const openMap = () => {
    if (!story.roaming) return;
    sfx.play("ui");
    const list = mapModal.querySelector("[data-map-list]");
    list.innerHTML = Object.values(ZONES).filter((z) => !z.dungeon && !z.interior).map((z) => `<button data-zone="${z.id}" ${story.zone?.id === z.id ? "disabled" : ""}><b>${z.name.toUpperCase()}</b><span>${z.region}${story.zone?.id === z.id ? " · You are here" : ""}</span></button>`).join("");
    for (const b of list.querySelectorAll("[data-zone]")) b.addEventListener("click", () => { mapModal.hidden = true; state.modal = false; story.travel(b.dataset.zone); });
    mapModal.hidden = false; state.modal = true;
  };
  mapModal.querySelector("[data-map-close]").addEventListener("click", () => { mapModal.hidden = true; state.modal = false; });
  menu("map", openMap);

  // Shop and bag (Phase 4): buy curated gear with Marks, equip a weapon, a cloak and two charms.
  const shopModal = root.querySelector("[data-shop]");
  const modsText = (m) => Object.entries(m).map(([k, v]) => ({
    attack: `+${Math.round(v * 100)}% damage`, defense: `−${Math.round(v * 100)}% damage taken`, health: `+${v} health`, manaRegen: `+${v} mana/s`,
    posture: `+${Math.round(v * 100)}% posture damage`, surge: `+${Math.round(v * 100)}% Surge`, speed: `+${Math.round(v * 100)}% speed` })[k]).join(" · ") || "No bonus";
  let shopDone = null;
  const renderShop = (shopId) => {
    const inv = story.inventory;
    shopModal.querySelector("[data-shop-title]").textContent = shopId ? SHOPS[shopId].name.toUpperCase() : "BAG & EQUIPMENT";
    shopModal.querySelector("[data-marks]").textContent = `${inv.marks} MARKS`;
    const stock = shopModal.querySelector("[data-stock]");
    stock.hidden = !shopId;
    shopModal.querySelector("[data-stock-h]").hidden = !shopId;
    if (shopId) {
      const off = (Number(story.flags.get("RENOWN_AURELIN")) || 0) >= 10 ? 0.9 : 1; // renown buys you a discount
      stock.innerHTML = SHOPS[shopId].stock.map((id) => { const it = ITEMS[id], own = inv.owned.has(id), price = Math.round(it.price * off);
        return `<button data-buy="${id}" ${own || inv.marks < price ? "disabled" : ""}><b>${own ? "OWNED" : `${price} M`}</b><span>${it.name} <em>${it.kind}</em><small>${modsText(it.mods)} — ${it.desc}</small></span></button>`; }).join("");
      for (const b of stock.querySelectorAll("[data-buy]")) b.addEventListener("click", () => {
        const r = inv.buy(b.dataset.buy, off);
        if (r.ok) { sfx.play("surgeFull"); hud.toast("BOUGHT", "clear"); const it = ITEMS[b.dataset.buy];
          const slot = it.kind === "charm" ? (inv.equipped.charm1 ? (inv.equipped.charm2 ? null : "charm2") : "charm1") : it.kind;
          if (slot) inv.equip(slot, b.dataset.buy); // put new gear on right away when there's room
          applyGear(); }
        renderShop(shopId);
      });
    }
    const slots = shopModal.querySelector("[data-slots-eq]");
    slots.innerHTML = SLOTS.map((slot) => { const id = inv.equipped[slot], it = id && ITEMS[id];
      return `<button data-eq="${slot}"><b>${slot.startsWith("charm") ? `CHARM ${slot.slice(-1)}` : slot.toUpperCase()}</b><span>${it ? it.name : "Empty"}<small>${it ? modsText(it.mods) : "Tap to choose"}</small></span></button>`; }).join("");
    for (const b of slots.querySelectorAll("[data-eq]")) b.addEventListener("click", () => { // cycle through owned gear of that kind
      const slot = b.dataset.eq, kind = slotKind(slot);
      const choices = [...inv.owned].filter((id) => ITEMS[id].kind === kind);
      if (kind === "charm") choices.push(null);
      if (!choices.length) return;
      const i = choices.indexOf(inv.equipped[slot]);
      inv.equip(slot, choices[(i + 1) % choices.length]);
      sfx.play("ui"); applyGear(); renderShop(shopId);
    });
    const total = inv.mods;
    shopModal.querySelector("[data-total]").textContent = modsText(Object.fromEntries(Object.entries(total).filter(([, v]) => v)));
  };
  /** Rook's stat mods: equipment plus level growth and Margin skills. */
  /** Who fights beside Rook in a world made with these companion options (the World's default is both). */
  const partyOf = (c) => (c === true || c === undefined ? ["bas", "juno"] : Array.isArray(c) ? c : []);
  const statMods = (party = world?.companions?.map((f) => f.kind) ?? []) =>
    addMods(addMods(addMods(addMods(story.inventory.mods, story.progress.mods), story.bonds.mods(party)), story.crafting.mods(story.day)), story.flags.get("CLAUSE_1") ? CLAUSE.mods : {});
  /** Gear changes apply to Rook immediately (outside fights the world can be rebuilt cheaply). */
  const applyGear = () => {
    const w = world, old = w.mods, m = statMods(), p = w.player;
    const base = { maxHealth: p.stats.maxHealth - old.health, maxMana: p.stats.maxMana - (old.mana ?? 0), manaRegenPerSecond: p.stats.manaRegenPerSecond - old.manaRegen, runSpeed: p.stats.runSpeed / (1 + old.speed) };
    Object.assign(w.mods, { mana: 0, ...m });
    p.stats = Object.freeze({ ...p.stats, maxHealth: base.maxHealth + m.health, maxMana: base.maxMana + (m.mana ?? 0), manaRegenPerSecond: base.manaRegenPerSecond + m.manaRegen, runSpeed: base.runSpeed * (1 + m.speed) });
    const hp = p.combatant.health;
    hp.max = p.stats.maxHealth; hp.set(Math.min(hp.current, hp.max));
    if (p.mana) { p.mana.max = p.stats.maxMana; p.mana.set(Math.min(p.mana.current, p.mana.max)); }
  };
  const openShop = (shopId = null) => new Promise((res) => {
    shopDone = res;
    renderShop(shopId);
    shopModal.hidden = false; state.modal = true;
  });
  shopModal.querySelector("[data-shop-close]").addEventListener("click", () => { shopModal.hidden = true; state.modal = false; sfx.play("ui"); story.saveNow(); const r = shopDone; shopDone = null; r?.(); });
  // Journal: quests, reputation, and the squad's place in the Merit ranking.
  const journal = root.querySelector("[data-journal]");
  const openJournal = () => {
    if (state.mode !== "story") return;
    sfx.play("ui");
    const f = story.flags, rank = squadRank(Number(f.get("MERIT")) || 0);
    journal.querySelector("[data-rep]").innerHTML = [
      ["SQUAD RANK", `The Lanterns are ${["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th (last)"][rank.place]} of seven`],
      ["MERIT", `${f.get("MERIT") || 0}${rank.next ? ` · next rank at ${rank.next}` : " · top of the Crown's ranking"}`],
      ["SQUAD REPUTATION", f.get("REP_SQUAD") || 0], ["RENOWN · AURELIN", f.get("RENOWN_AURELIN") || 0], ["RENOWN · GREYWATER FENS", f.get("RENOWN_FENS") || 0],
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    const bd = story.bonds;
    journal.querySelector("[data-bonds]").innerHTML = Object.entries(BONDS).map(([id, b]) => {
      const rank = bd.rank(id), pts = bd.points(id), lo = RANK_POINTS[rank - 1], hi = RANK_POINTS[rank] ?? lo;
      const pct = rank >= 10 ? 100 : Math.round(((pts - lo) / Math.max(1, hi - lo)) * 100);
      const status = bd.eventReady(id) ? "♥ Bond event ready: go and talk to them" : bd.waiting(id) ? "Their next chapter comes later in the story" : "";
      const loved = rank >= 2 ? bd.lovedGift(id) : null;
      const next = Object.entries(RANK_UNLOCKS).find(([r]) => Number(r) > rank);
      const unlocked = [rank >= 2 ? `<i>${b.lore}</i>` : "", rank >= 3 && b.passive ? `<b>${b.passive.name}:</b> ${b.passive.desc}` : "", rank >= 5 && b.team ? `<b>${b.team.name}:</b> ${b.team.desc}` : ""].filter(Boolean).join("<br>");
      return `<div class="bond"><div class="bond-head"><b>${b.name}</b><span>RANK ${rank} · ${bd.title(id).toUpperCase()}</span></div>
        <span class="xpbar"><u style="width:${pct}%"></u></span>
        <small>${status ? `<em>${status}</em><br>` : ""}${loved ? `Would love: ${GIFTS[loved].name}. ` : ""}${next ? `Rank ${next[0]}: ${next[1]}.` : ""}</small>
        ${unlocked ? `<p>${unlocked}</p>` : ""}</div>`;
    }).join("");
    const gifts = Object.entries(GIFTS).filter(([g]) => Number(story.flags.get(`GIFT_${g.toUpperCase()}`)) > 0).map(([g, gi]) => `${gi.name} ×${story.flags.get(`GIFT_${g.toUpperCase()}`)}`);
    journal.querySelector("[data-gifts]").textContent = gifts.length ? `Gifts in your bag: ${gifts.join(", ")}.` : "No gifts in your bag. The Gilded Spoon, the Lowmarket stall and the fish cook sell them.";
    const found = FRAGMENTS.filter((f) => story.flags.get(`FRAG_${f.n}`));
    journal.querySelector("[data-lore]").innerHTML = `<p class="mats"><b>Page fragments: ${found.length}/${FRAGMENTS.length}</b> · ${story.flags.get("CLAUSE_1") ? `<b>${CLAUSE.name}</b> restored: ${CLAUSE.desc}` : `Find ${CLAUSE.need} to restore a clause of the under-text.`}</p>` +
      found.map((f) => `<p class="mats"><i>"${f.text}"</i> · ${f.where}</p>`).join("");
    const list = story.quests.entries();
    journal.querySelector("[data-quests]").innerHTML = list.length ? list.map((q) =>
      `<button class="${q.done ? "done" : ""}"><b>${q.done ? "DONE" : "ACTIVE"}</b><span>${q.title}<small>${fillText(q.objective, { ...story.player, flags: story.flags })} · from ${q.giver}, ${q.region}</small></span></button>`).join("")
      : `<p class="hint">No quests yet. Talk to people: someone always needs something.</p>`;
    journal.hidden = false; state.modal = true;
  };
  journal.querySelector("[data-journal-close]").addEventListener("click", () => { journal.hidden = true; state.modal = false; sfx.play("ui"); });
  menu("journal", openJournal);

  // Arc 1–2 boss visuals: Ilse's silence zones (violet discs), Gullmaw's water jet.
  const BOSS_PHASE_TEXT = {
    ilse: { 2: ["THE CHOIR PIT", "PHASE 2 · SHE CALLS HER ACOLYTES · WARDED WHILE THEY STAND"], 3: ["THE BELLS", "PHASE 3 · BREAK THE BELLS"], 4: ["HUSH", "PHASE 4 · SHE CAN SILENCE YOUR DODGE"] },
    galen: { 2: ["ROT", "PHASE 2 · RINGS OF RUST · JUMP THEM"], 3: ["THE OATH", "PHASE 3 · BREAK THE VOW-SEALS"], 4: ["DESPERATION", "PHASE 4 · THE LAST CHARGE"] },
    gullmaw: { 2: ["THE FLOOD", "PHASE 2 · THE WATER JET · JUMP IT"], 3: ["SWALLOWED", "PHASE 3 · BURST THE SLIME BUBBLE"] },
  };
  const silenceFx = (() => {
    const zones = new Map(), mat = glow(scene, "silenceMat", "#9a7aff", 0.28, true), fieldMat = glow(scene, "silenceAllMat", "#5a3a9a", 0.12);
    let field = null;
    return {
      add(z) { const d = BB.MeshBuilder.CreateDisc("silence", { radius: z.r, tessellation: 32 }, scene); d.rotation.x = Math.PI / 2; d.position.set(z.x, 0.04, z.z); d.material = mat; d.isPickable = false; zones.set(z, d); },
      remove(z) { zones.get(z)?.dispose(); zones.delete(z); },
      all(on) { if (on && !field) { field = BB.MeshBuilder.CreateDisc("silenceAll", { radius: 18, tessellation: 40 }, scene); field.rotation.x = Math.PI / 2; field.position.set(world.player.pos.x, 0.03, world.player.pos.z); field.material = fieldMat; field.isPickable = false; } if (!on && field) { field.dispose(); field = null; } },
      clear() { for (const d of zones.values()) d.dispose(); zones.clear(); this.all(false); },
    };
  })();
  const waterJet = (() => { // a hose of cistern water from Gullmaw's spot, sweeping the floor; a faint ripple line while it warns
    let node = null, beam = null, foam = null;
    const warnMat = glow(scene, "jetWarn", "#6ac8d8", 0.25, true), jetMat = glow(scene, "jetMat", "#8ae0f0", 0.75), foamMat = glow(scene, "jetFoam", "#e8fbff", 0.55, true);
    return {
      start(center, length) {
        this.stop(); const MB = BB.MeshBuilder;
        node = new BB.TransformNode("waterJet", scene); node.position.set(center.x, 0, center.z);
        beam = MB.CreateCylinder("jetBeam", { height: length, diameterTop: 0.7, diameterBottom: 0.35, tessellation: 10 }, scene);
        beam.rotation.x = Math.PI / 2; beam.position.set(0, 0.35, length / 2); beam.parent = node; beam.material = warnMat; beam.isPickable = false;
        foam = MB.CreateDisc("jetFoam", { radius: 0.9, tessellation: 14 }, scene);
        foam.rotation.x = Math.PI / 2; foam.position.set(0, 0.05, length); foam.parent = node; foam.material = foamMat; foam.isPickable = false;
      },
      update() {
        const h = world.boss?.boss?.jet; if (!node) return; if (!h || !world.boss?.alive) { this.stop(); return; }
        beam.material = h.warn > 0 ? warnMat : jetMat; beam.scaling.x = beam.scaling.z = h.warn > 0 ? 0.4 : 1 + Math.sin(performance.now() / 60) * 0.08;
        foam.setEnabled(h.warn <= 0); node.rotation.y = h.angle;
      },
      stop() { node?.dispose(); node = beam = foam = null; },
    };
  })();

  resetBossFx = () => { silenceFx.clear(); waterJet.stop(); };

  // Squad HQ: the board (rooms to build) and the workbench (tempering gear). One screen, two modes.
  const hqModal = root.querySelector("[data-hq]");
  let hqDone = null, hqKind = "hq";
  const costText = (marks, mats) => [`${marks} Marks`, ...Object.entries(mats ?? {}).map(([id, n]) => `${n} ${MATERIALS[id].name}`)].join(" · ");
  const renderHQ = () => {
    const cr = story.crafting, inv = story.inventory;
    hqModal.querySelector("[data-hq-mats]").innerHTML = Object.entries(MATERIALS).map(([id, m]) => `<b>${m.name}</b> ×${cr.count(id)}`).join(" · ") + ` · <b>Marks</b> ${inv.marks}`;
    const list = hqModal.querySelector("[data-hq-list]");
    if (hqKind === "hq") {
      hqModal.querySelector("[data-hq-title]").textContent = "SQUAD BOARD · HQ ROOMS";
      hqModal.querySelector("[data-hq-sub]").textContent = `Squad Merit: ${story.flags.get("MERIT") || 0}. Rooms need the squad's standing (Merit is never spent), plus Marks and materials.`;
      list.innerHTML = Object.entries(HQ).map(([id, r]) => {
        const why = cr.buildBlocker(id), built = why === "built";
        return `<div class="row${built ? " built" : ""}"><b>${built ? "✓" : r.merit}</b><span>${r.name}<small>${r.desc}</small><small>${built ? "Built" : `Needs ${r.merit} Merit · ${costText(r.marks, r.mats)}`}</small></span>
          <span class="act">${built ? "" : `<button class="go" data-build="${id}" ${why ? "disabled" : ""} title="${why ?? ""}">${why ? why.toUpperCase() : "BUILD"}</button>`}</span></div>`;
      }).join("");
    } else {
      hqModal.querySelector("[data-hq-title]").textContent = "WORKBENCH · TEMPER YOUR GEAR";
      hqModal.querySelector("[data-hq-sub]").textContent = `Weapons cut deeper, cloaks grow tougher, charms get stronger. ${cr.built("forge") ? "The Forge allows +2." : "+1 for now: build the Forge for +2."}`;
      list.innerHTML = [...inv.owned].map((id) => {
        const it = ITEMS[id], lv = inv.temperOf(id), c = cr.temperCost(id), why = cr.temperBlocker(id);
        const what = TEMPER[it.kind].per ? Object.entries(TEMPER[it.kind].per).map(([k, v]) => `+${k === "health" ? v : `${Math.round(v * 100)}%`} ${k}`).join(", ") : "+30% of its effect";
        return `<div class="row"><b>+${lv}</b><span>${it.name} <em>${it.kind}</em><small>Each level: ${what}.</small><small>${c ? `Next: ${costText(c.marks, c.mats)}` : "Fully tempered"}</small></span>
          <span class="act">${c ? `<button class="go" data-temper="${id}" ${why ? "disabled" : ""}>${why ? why.toUpperCase() : `TEMPER +${lv + 1}`}</button>` : ""}</span></div>`;
      }).join("");
    }
    for (const b of list.querySelectorAll("[data-build]")) b.addEventListener("click", () => { if (story.crafting.build(b.dataset.build)) { sfx.play("ultActivate"); hud.toast(`${HQ[b.dataset.build].name.toUpperCase()} BUILT`, "finisher"); story._refreshSet?.(); applyGear(); story.saveNow(); } renderHQ(); });
    for (const b of list.querySelectorAll("[data-temper]")) b.addEventListener("click", () => { if (story.crafting.temper(b.dataset.temper)) { sfx.play("stone"); hud.toast(`${ITEMS[b.dataset.temper].name.toUpperCase()} +${story.inventory.temperOf(b.dataset.temper)}`, "finisher"); applyGear(); story.saveNow(); } renderHQ(); });
  };
  const openHQ = (kind = "hq") => new Promise((res) => { hqKind = kind; hqDone = res; sfx.play("ui"); renderHQ(); hqModal.hidden = false; state.modal = true; });
  hqModal.querySelector("[data-hq-close]").addEventListener("click", () => { hqModal.hidden = true; state.modal = false; sfx.play("ui"); const r = hqDone; hqDone = null; r?.(); });

  // Grimoire: level and stats, page mastery (and evolution), and the Grimoire Tree.
  const grim = root.querySelector("[data-grimoire]"), grimDot = root.querySelector("[data-grim-dot]");
  const grimShort = root.querySelector("[data-grim-short]");
  const refreshGrimDot = () => {
    if (grimDot) grimDot.hidden = !(story.progress.points > 0 || Object.values(world.pages).some((p) => p.ready));
    if (grimShort) grimShort.textContent = `LV${story.progress.level}`;
  };
  const renderGrimoire = () => {
    const pr = story.progress, m = statMods();
    grim.querySelector("[data-grim-lv]").textContent = `LEVEL ${pr.level}`;
    grim.querySelector("[data-grim-xp]").style.width = pr.next ? `${Math.round((pr.xp / pr.next) * 100)}%` : "100%";
    grim.querySelector("[data-grim-xptext]").textContent = pr.level >= MAX_LEVEL ? "MAX" : `${pr.xp} / ${pr.next} XP`;
    grim.querySelector("[data-grim-stats]").innerHTML = [
      ["HEALTH", `${ROOK_STATS.maxHealth + m.health}`], ["MANA", `${ROOK_STATS.maxMana + (m.mana ?? 0)} · +${(ROOK_STATS.manaRegenPerSecond + m.manaRegen).toFixed(0)}/s`],
      ["ATTACK", `+${Math.round(m.attack * 100)}%`], ["POSTURE DAMAGE", `+${Math.round(m.posture * 100)}%`],
      ["DEFENSE", `${Math.round((m.defense ?? 0) * 100)}%`], ["SURGE GAIN", `+${Math.round((m.surge ?? 0) * 100)}%`],
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    grim.querySelector("[data-grim-pages]").innerHTML = Object.entries(PAGES).map(([slot, def]) => {
      const pg = pr.pages[slot], lv = pageLevel(slot, pg.xp), br = pg.branch && def.branches.find((b) => b.key === pg.branch);
      const b = pr.pageBonus(slot), locked = !world.loadout[slot];
      const choose = pg.ready ? def.branches.map((x) => `<button class="go" data-evolve="${slot}:${x.key}" title="${x.desc}">${x.name.toUpperCase()}</button>`).join(" ") : "";
      return `<div class="row${pg.ready ? " ready" : ""}"><b>${PAGE_ROMAN[lv - 1]}</b><span>${br ? br.name : def.name}${locked ? " <em>not in this grimoire yet</em>" : ""}<small>${pg.ready ? "Ready to evolve: choose a branch" : br ? `Evolved from ${def.name}` : lv < 3 ? "Evolves at III" : ""}${b.dmg > 1 ? ` · +${Math.round((b.dmg - 1) * 100)}% damage` : ""}${b.mana < 1 ? ` · −${Math.round((1 - b.mana) * 100)}% mana` : ""}</small>${choose ? `<span class="evo">${choose}</span>` : ""}</span><span class="xpbar"><u style="width:${Math.round(pageLevelProgress(slot, pg.xp) * 100)}%"></u></span></div>`;
    }).join("");
    grim.querySelector("[data-grim-pts]").textContent = `THE GRIMOIRE TREE · ${pr.points} SKILL POINT${pr.points === 1 ? "" : "S"}`;
    grim.querySelector("[data-grim-tree]").innerHTML = TREE_COLUMNS.map(({ col, name }) => `<div class="col"><b>${name}</b>${
      Object.values(SKILLS).filter((n) => n.col === col).map((n) => {
        const have = pr.skills.has(n.id), why = pr.blocker(n.id);
        return `<button data-learn="${n.id}" class="${have ? "have" : why ? "" : "can"}" ${have || why ? "disabled" : ""}><b>${n.name}</b><small>${n.desc}</small><em>${have ? "LEARNED" : why ? why.toUpperCase() : `LEARN · ${n.cost} PT${n.cost > 1 ? "S" : ""}`}</em></button>`;
      }).join("")}</div>`).join("");
    for (const btn of grim.querySelectorAll("[data-learn]")) btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!story.progress.learn(btn.dataset.learn)) return;
      sfx.play("ultActivate"); hud.toast(SKILLS[btn.dataset.learn].name.toUpperCase(), "finisher");
      if (world.progress === story.progress) world.applyLoadout(); // page bonuses apply mid-fight too
      applyGear(); story.saveNow(); renderGrimoire(); refreshGrimDot();
    });
    for (const btn of grim.querySelectorAll("[data-evolve]")) btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const [slot, key] = btn.dataset.evolve.split(":");
      if (world.progress !== story.progress) { story.progress.pages[slot].branch = key; story.progress.pages[slot].ready = false; }
      else world.evolvePage(slot, key);
      onEvents(world.drainEvents()); story.saveNow(); renderGrimoire(); refreshGrimDot();
    });
  };
  const openGrimoire = () => {
    if (state.mode !== "story") return;
    sfx.play("ui"); renderGrimoire();
    grim.hidden = false; state.modal = true;
  };
  grim.querySelector("[data-grim-close]").addEventListener("click", () => { grim.hidden = true; state.modal = false; sfx.play("ui"); });
  menu("grimoire", openGrimoire);

  menu("bag", () => { if (state.mode === "story" && shopModal.hidden) openShop(null); });
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
    story.inventory = new Inventory(last.inv); story.progress = new Progress(last.prog);
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
    story.inventory = new Inventory(sv.inv); story.progress = new Progress(sv.prog);
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
      story.inventory = new Inventory(last?.inv); story.progress = new Progress(last?.prog);
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
      if (cmd === "tag" && running) { if (!world.tagSwap()) { if (world.bench) hud.pushLog("Tag-swap is recovering"); } onEvents(world.drainEvents()); }
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

    waterJet.update();
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
    if ((state.glowTick = (state.glowTick ?? 0) + 1) % 15 === 1) syncGlow();
    perfTick(dt);
    const cp = (scene.activeCamera ?? camera.cam).position; Rig.view = { x: cp.x, z: cp.z };
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
  const handle = { Rig, LOOKS, engine, scene, world, camera, start, restart, freezeLogic, openPages, choosePage, story, saves, sets, playStory, backToTitle, openSlots, playWorld, openMap, openShop, data: { acolyte: ACOLYTE_ABILITIES } };
  return handle;
}

if (typeof document !== "undefined" && !globalThis.__UNWRITTEN_NO_BOOT__) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { globalThis.unwritten = boot(); });
  else globalThis.unwritten = boot();
}
