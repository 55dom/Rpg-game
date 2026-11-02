// UNWRITTEN — combat sandbox entry point. Wires the sim to Babylon, input, audio, and HUD.

import { FrameClock } from "./core/timing.js";
import { EventType } from "./core/abilities.js";
import { Team } from "./core/combat.js";
import { World } from "./sim/world.js";
import { ACOLYTE_ABILITIES } from "./data/acolyte.js";
import { ROOK_ABILITIES, ROOK_STATS } from "./data/rook.js";
import { PAGES } from "./data/pages.js";
import { DIFFICULTY_KEYS, difficultyOf } from "./data/difficulty.js";
import { EPISODE_4 } from "./data/run.js";
import { B, PALETTE, glow, toon, clamp01, toonFallbackIfBroken } from "./runtime/look.js";
import { Rig, LOOKS } from "./runtime/rig.js";
import { ObjectView } from "./runtime/objects.js";
import { WorldClock } from "./sim/weather.js";
import { LOD } from "./runtime/body.js";
import { Vfx, Trail } from "./runtime/vfx.js";
import { Sfx } from "./runtime/audio.js";
import { Controls } from "./runtime/controls.js";
import { FollowCamera } from "./runtime/camera.js";
import { MemoryGrade } from "./runtime/grade.js";
import { Hud } from "./runtime/hud.js";
import { buildArena } from "./runtime/arena.js";
import { StoryPlayer } from "./runtime/story.js";
import { Sets } from "./runtime/sets.js";
import { Constellation, StarFigure } from "./runtime/constellation.js";
import { LION_FIGURE } from "./data/eclipse.js";
import { TearFx, makeTear, makeDoor, tearMaterials } from "./runtime/tears.js";
import { SaveStore, cleanName } from "./core/save.js";
import { EPISODE_1, EP1_SCRIPT } from "./data/story/ep1.js";
import { EPISODE_2, EP2_SCRIPT } from "./data/story/ep2.js";
import { EPISODE_3, EP3_SCRIPT } from "./data/story/ep3.js";
import { EPISODE_4_STORY, EP4_SCRIPT } from "./data/story/ep4.js";
import { EPISODE_5, EP5_SCRIPT } from "./data/story/ep5.js";
import { EPISODE_6, EP6_SCRIPT } from "./data/story/ep6.js";
import { EPISODE_7, EP7_SCRIPT } from "./data/story/ep7.js";
import { EPISODE_8, EP8_SCRIPT } from "./data/story/ep8.js";
import { EPISODE_9, EP9_SCRIPT } from "./data/story/ep9.js";
import { EPISODE_10, EP10_SCRIPT } from "./data/story/ep10.js";
import { EPISODE_11, EP11_SCRIPT } from "./data/story/ep11.js";
import { EPISODE_12, EP12_SCRIPT } from "./data/story/ep12.js";
import { EPISODE_13, EP13_SCRIPT } from "./data/story/ep13.js";
import { EPISODE_14, EP14_SCRIPT } from "./data/story/ep14.js";
import { EPISODE_15, EP15_SCRIPT } from "./data/story/ep15.js";
import { EPISODE_16, EP16_SCRIPT } from "./data/story/ep16.js";
import { EPISODE_17, EP17_SCRIPT } from "./data/story/ep17.js";
import { EPISODE_18, EP18_SCRIPT } from "./data/story/ep18.js";
import { EPISODE_19, EP19_SCRIPT } from "./data/story/ep19.js";
import { EPISODE_20, EP20_SCRIPT } from "./data/story/ep20.js";
import { EPISODE_21, EP21_SCRIPT } from "./data/story/ep21.js";
import { EPISODE_22, EP22_SCRIPT } from "./data/story/ep22.js";
import { EPISODE_23, EP23_SCRIPT } from "./data/story/ep23.js";
import { EPISODE_24, EP24_SCRIPT } from "./data/story/ep24.js";
import { EPISODE_25, EP25_SCRIPT } from "./data/story/ep25.js";
import { EPISODE_26, EP26_SCRIPT } from "./data/story/ep26.js";
import { EPISODE_27, EP27_SCRIPT } from "./data/story/ep27.js";
import { EPISODE_28, EP28_SCRIPT } from "./data/story/ep28.js";
import { EPISODE_29, EP29_SCRIPT } from "./data/story/ep29.js";
import { EPISODE_30, EP30_SCRIPT } from "./data/story/ep30.js";
import { EPISODE_31, EP31_SCRIPT } from "./data/story/ep31.js";
import { EPISODE_32, EP32_SCRIPT } from "./data/story/ep32.js";
import { EPISODE_33, EP33_SCRIPT } from "./data/story/ep33.js";
import { EPISODE_34, EP34_SCRIPT } from "./data/story/ep34.js";
import { EPISODE_35, EP35_SCRIPT } from "./data/story/ep35.js";
import { EPISODE_36, EP36_SCRIPT } from "./data/story/ep36.js";
import { EPISODE_37, EP37_SCRIPT } from "./data/story/ep37.js";
import { EPISODE_38, EP38_SCRIPT } from "./data/story/ep38.js";
import { EPISODE_39, EP39_SCRIPT } from "./data/story/ep39.js";
import { EPISODE_40, EP40_SCRIPT } from "./data/story/ep40.js";
import { EPISODE_41, EP41_SCRIPT } from "./data/story/ep41.js";
import { EPISODE_42, EP42_SCRIPT } from "./data/story/ep42.js";
import { EPISODE_43, EP43_SCRIPT } from "./data/story/ep43.js";
import { EPISODE_44, EP44_SCRIPT } from "./data/story/ep44.js";
import { EPISODE_45, EP45_SCRIPT } from "./data/story/ep45.js";
import { EPISODE_46, EP46_SCRIPT } from "./data/story/ep46.js";
import { EPISODE_47, EP47_SCRIPT } from "./data/story/ep47.js";
import { EPISODE_48, EP48_SCRIPT } from "./reveal/ep48.js";
import { creditsFor, CREDITS_SECONDS } from "./reveal/credits.js";
import { EPISODE_49, EP49_SCRIPT } from "./reveal/ep49.js";
import { EPISODE_50, EP50_SCRIPT } from "./reveal/ep50.js";
import { EPISODE_CALPATH, CALPATH_SCRIPT } from "./reveal/calpath.js";
import { EPISODE_51, EP51_SCRIPT } from "./reveal/ep51.js";
import { EPISODE_52, EP52_SCRIPT } from "./reveal/ep52.js";
import { EPISODE_53, EP53_SCRIPT } from "./reveal/ep53.js";
import { EPISODE_54, EP54_SCRIPT } from "./reveal/ep54.js";
import { EPISODE_55, EP55_SCRIPT } from "./reveal/ep55.js";
import { EPISODE_56, EP56_SCRIPT } from "./reveal/ep56.js";
import { EPISODE_57, EP57_SCRIPT } from "./reveal/ep57.js";
import { EPISODE_58, EP58_SCRIPT } from "./reveal/ep58.js";
import { EPISODE_59, EP59_SCRIPT } from "./reveal/ep59.js";
import { EPISODE_60, EP60_SCRIPT } from "./reveal/ep60.js";
import { EPISODE_61, EP61_SCRIPT } from "./reveal/ep61.js";
import { EPISODE_62, EP62_SCRIPT } from "./reveal/ep62.js";
import { EPISODE_63, EP63_SCRIPT } from "./reveal/ep63.js";
import { EPISODE_64, EP64_SCRIPT } from "./reveal/ep64.js";
import { EPISODE_65, EP65_SCRIPT } from "./reveal/ep65.js";
import { EPISODE_66, EP66_SCRIPT } from "./reveal/ep66.js";
import { EPISODE_67, EP67_SCRIPT } from "./reveal/ep67.js";
import { EPISODE_68, EP68_SCRIPT } from "./reveal/ep68.js";
import { EPISODE_69, EP69_SCRIPT } from "./reveal/ep69.js";
import { EPISODE_70, EP70_SCRIPT } from "./reveal/ep70.js";
import { theatreList } from "./data/theatre.js";
import { PlaytestLog, SURVEYS } from "./core/playtest.js";
import { keyItemsHeld } from "./data/keyItems.js";
import { WORLD_SCRIPT } from "./data/story/world.js";
import { compileExpr, truthy } from "./core/flags.js";
import { ZONES } from "./data/zones.js";
import { Inventory } from "./core/inventory.js";
import { Progress, addMods, pageLevel, pageLevelProgress, REBRANCH_MARKS } from "./core/progress.js";
import { SECRET_PAGES, SECRET_NEEDS } from "./data/secretPages.js";
import { CORRUPTION } from "./data/forbidden.js";
import { SKILLS, TREE_COLUMNS, XP_BY_KIND, PAGE_ROMAN, MAX_LEVEL, killXp, bracketOf } from "./data/skills.js";
import { storyBracket, storyEpisode } from "./core/ranks.js";
import { KNIGHT_RANKS, rankOf } from "./data/ranks.js";
import { TECHNIQUES, TP_FLAG, techFlag, learnedTechniques } from "./data/techniques.js";
import { BONDS, RANK_POINTS, RANK_UNLOCKS, GIFTS } from "./data/bonds.js";
import { FEEDBACK, t2Mode, t2MarkSeen } from "./data/cinematics.js";
import { SHOTS } from "./runtime/shots.js";
import { MATERIALS, HQ, TEMPER } from "./data/crafting.js";
import { FRAGMENTS, CLAUSE } from "./data/lore.js";
import { rumorBoard } from "./data/rumors.js";
import { fieldNotes } from "./reveal/notes.js";
import { ratingOf } from "./reveal/arc7.js";
import { starPlane } from "./runtime/stars.js";
import { ITEMS, SHOPS, SLOTS, BOUNTIES, slotKind } from "./data/items.js";
import { squadRank } from "./core/quests.js";
import { renownTier, LAW_REGIONS } from "./data/law.js";
import { fillText } from "./core/script.js";

const TRAIL_COLORS = { default: "#ffd98a", GaleCutter: PALETTE.gale, VacuumPull: PALETTE.gale, TempestEdge: "#a8f5dc", Counter: "#dff6ff", LanternBreak: "#ffcc55", enemy: "#ff5a4a" };
/** Each reaction's look (GDD §7.2): the flash colour and the sparks. */
const REACTION_LOOK = Object.freeze({
  Conduction: ["#9ad8ff", "white"], Railgun: ["#9ad8ff", "white"], FlashFreeze: ["#cfeaff", "white"], Shatter: ["#cfeaff", "white"],
  Firestorm: ["#ff8a3a", "red"], Wildfire: ["#ff6a2a", "red"], Flashpoint: ["#ffb04a", "red"], ShatterChorus: ["#e6f0ff", "violet"],
  Meteor: ["#c8a060", "gold"], Crush: ["#c8a060", "gold"], CrushB: ["#c8a060", "gold"], Corrode: ["#8aa04a", "mint"], RudeAwakening: ["#ffd27a", "gold"],
});
const ULT_MODES = ["full", "short", "off"]; // how much of an Ultimate's cinematic plays (GDD §19.8)
const ULT_SHORT_SKIPS = new Set(["ult-activate", "ult-charge", "ult-closeup"]); // short: straight to the release
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
  const grade = new MemoryGrade(scene, camera.cam); // inside a memory (Ep 49)
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
  const addMods = (m, extra) => { const out = { ...m }; for (const [k, v] of Object.entries(extra ?? {})) out[k] = (out[k] ?? 0) + v; return out; }; // a beat's own (Arc 7: Unwritten) on top of gear and bonds
  let starSight = () => false; // Star Sight (GDD §25.3): from the Rite on, ratings over everyone in a fight; set once the story exists

  const addView = (f) => {
    if (views.has(f) || f.traits?.dummy) return; // training dummies are part of the set (they rock on their posts)
    if (LOOKS[f.kind]?.form === "object") { views.set(f, new ObjectView(scene, f.kind, f.id, LOOKS[f.kind])); return; } // bells, seals, egg sacs, bubbles
    if (LOOKS[f.kind]?.form === "stars") { views.set(f, new StarFigure(scene, f.id, LION_FIGURE)); return; } // the Eclipsed Lion: drawn in dark stars
    const rig = new Rig(scene, f.look ?? f.kind, f.id); // a look of its own if it has one (Bas in a sling)
    views.set(f, rig);
    const rating = starSight() ? ratingOf(f.team === Team.Player && f === world.player ? "player" : f.kind) : null;
    if (rating != null) starPlane(scene, `${f.id}-sight`, rating).parent = rig.root; // over the player: nothing, ever
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

  // Settings, remembered between visits (GDD §19.8's accessibility toggles among them). A blocked or empty store is fine.
  const SETTINGS_KEY = "unwritten-settings";
  const settings = { frameData: !mobile, flashes: !reduced, sound: true, assist: coarse, shake: !reduced, blur: !reduced, speedLines: !reduced, ult: reduced ? "short" : "full", twos: true, battery: false, difficulty: "knight" };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") ?? {};
    for (const [k, v] of Object.entries(saved)) if (k in settings && typeof v === typeof settings[k] && (k !== "ult" || ULT_MODES.includes(v)) && (k !== "difficulty" || DIFFICULTY_KEYS.includes(v))) settings[k] = v;
  } catch { /* nothing saved, or no storage: the defaults stand */ }
  const saveSettings = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* not remembered this time */ } };
  const state = { frozen: false, started: false, paused: false, help: false, cinematic: 0, cinematicScale: 1, ghostTimer: 0, pending: [], time: 0 };
  const later = (seconds, fn) => state.pending.push({ t: seconds, fn });

  // Impact frames: a 2–5 frame inverted ink flash, the anime "the world stopped" beat.
  let impactLeft = 0;
  const impact = (frames, strong = false) => {
    if (!settings.flashes) { canvas.style.filter = "brightness(1.35)"; impactLeft = 1 / 60; return; }
    canvas.style.filter = strong ? "invert(1) contrast(1.7) saturate(0)" : "contrast(1.4) brightness(1.5) saturate(0.4)";
    impactLeft = frames / 60;
  };

  // Speed lines (GDD §19.6: a screen-space overlay driven by a cue): the screen streaks for a moment.
  let speedTimer = 0;
  const speedLines = (sec) => { if (!settings.speedLines) return; root.classList.add("speeding"); clearTimeout(speedTimer); speedTimer = setTimeout(() => root.classList.remove("speeding"), sec * 1000); };
  /** A T1 combat cue (GDD §19.1; data/cinematics.js FEEDBACK): shake, FOV punch, impact frames, speed lines. */
  const feedback = (key) => {
    const fb = FEEDBACK[key];
    if (!fb) return false;
    if (fb.kick) camera.kick(fb.kick);
    if (fb.shake) camera.shake(fb.shake);
    if (fb.impact) impact(fb.impact, !!fb.strong);
    if (fb.speedLines) speedLines(fb.speedLines);
    return true;
  };
  // The T2 playing now (GDD §19.1: Skyrender, a Team Attack): which, how ("full" | "short" | "off"), and if it was skipped.
  const t2End = (finished) => {
    const t = state.t2; if (!t) return;
    state.t2 = null;
    if (camera.inShot) camera.cue("ult-return");
    root.classList.remove("ult-desat");
    if (finished && t.mode === "full" && !t.skipped) t2MarkSeen(t.id); // the short version is offered after one full view
  };
  const t2Skip = () => { const t = state.t2; if (!t || t.skipped || t.mode === "off") return false; t.skipped = true; if (camera.inShot) camera.cue("ult-return"); root.classList.remove("ult-desat"); ultCard.classList.remove("show"); return true; };
  addEventListener("keydown", (e) => { if (state.t2 && !e.repeat && !["Shift", "Control", "Alt", "Meta"].includes(e.key)) t2Skip(); }, true);
  canvas.addEventListener("pointerdown", () => { if (state.t2) t2Skip(); });

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
            if (e.key === "ink") { // the quill stroke: a line of ink written in front of Rook
              for (let i = 1; i <= 5; i++) vfx.ring({ x: f.pos.x + Math.sin(f.yaw) * i * 0.8, y: f.pos.y + 1.1, z: f.pos.z + Math.cos(f.yaw) * i * 0.8 }, 0.9 - i * 0.08, "#5a7ad8", 0.3);
              vfx.sparksAt({ x: f.pos.x + Math.sin(f.yaw) * 2, y: f.pos.y + 1.1, z: f.pos.z + Math.cos(f.yaw) * 2 }, 8, "ink", 5, 1);
              if (rig) rig.grimoireGlow = 1;
            }
            if (e.key === "glint") { vfx.flash(head(f), 1.4, PALETTE.danger, 0.35); sfx.play("glint"); }
            if (e.key === "charge" && rig) { vfx.flash(rig.bladeWorld().tip, 2.2, PALETTE.lantern, 0.3); vfx.ring({ x: f.pos.x, y: 0.05, z: f.pos.z }, 4, PALETTE.lantern, 0.3); }
            if (e.key === "ultCharge") {
              if (rig) rig.grimoireGlow = 1;
              for (const [h, s, life] of [[0.1, 9, 0.7], [1, 6, 0.6], [2, 4, 0.5]]) vfx.ring({ x: f.pos.x, y: f.pos.y + h, z: f.pos.z }, s, PALETTE.gale, life, true);
              vfx.sparksAt({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z }, 14, "mint", 5, 3);
            }
            if (e.key === "ultName" && state.t2?.mode === "full" && !state.t2.skipped) showUltCard();
            if (e.key === "teamName" && state.t2?.mode === "full" && !state.t2.skipped) showTeamCard(state.t2.kind);
            if (e.key === "teamCharge") { const a = state.t2?.ally ?? f; for (const g of [f, a]) for (const [h, sz] of [[0.1, 5], [1.1, 3.2]]) vfx.ring({ x: g.pos.x, y: g.pos.y + h, z: g.pos.z }, sz, LOOKS[g.kind]?.trail ?? PALETTE.gale, 0.6, true); vfx.sparksAt(chest(a), 12, "gold", 5, 3); }
            if (e.key === "teamBurst") { vfx.ring({ x: f.pos.x, y: 0.06, z: f.pos.z }, 12, PALETTE.gale, 0.5); vfx.sparksAt({ x: f.pos.x, y: 0.5, z: f.pos.z }, 20, "mint", 12, 6); }
            if (e.key === "ultBurst") {
              vfx.ring({ x: f.pos.x, y: 0.06, z: f.pos.z }, 20, PALETTE.gale, 0.6);
              vfx.ring({ x: f.pos.x, y: 1.2, z: f.pos.z }, 14, "#ffffff", 0.45);
              vfx.flash({ x: f.pos.x, y: f.pos.y + 1.2, z: f.pos.z }, 5, "#d9fff2", 0.25);
              vfx.sparksAt({ x: f.pos.x, y: 0.5, z: f.pos.z }, 30, "mint", 16, 8);
              camera.shake(0.5);
            }
          } else if (e.type === EventType.CameraCue) {
            const t2key = /^(ult|team)-/.test(e.key);
            if (!t2key) { if (e.key !== "speed" || isPlayer(f)) feedback(e.key); } // T1 (GDD §19.1): data/cinematics.js FEEDBACK
            else if (isPlayer(f)) { // T2: the sequence's camera and post-FX tracks (§19.4)
              if (e.key === "ult-activate") state.t2 = { id: ev.ability.id, mode: t2Mode(settings.ult, ev.ability.id) };
              const t = state.t2, plays = t && t.mode !== "off" && !t.skipped && !(t.mode === "short" && ULT_SHORT_SKIPS.has(e.key));
              if (plays) {
                if (SHOTS[e.key]) {
                  const sub = SHOTS[e.key].subject === "ally" ? t.ally : SHOTS[e.key].subject === "target" ? t.target : null;
                  const shot = camera.cue(e.key, sub ? () => ({ pos: sub.pos, yaw: sub.yaw, scale: LOOKS[sub.kind]?.scale ?? 1 }) : null);
                  root.classList.toggle("ult-desat", !!shot?.desaturate);
                }
                feedback(e.key);
              }
              if (/-return$/.test(e.key)) t2End(true);
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
          if (heavy || finisher) vfx.hitSpark(at, heavy ? 2.2 : 1.8, a.team === Team.Player ? "#fff2cf" : "#ffb0a0"); // the hand-drawn spark (§19.6), on the big blows
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
          const [hex, spark] = REACTION_LOOK[rx.id] ?? ["#ffd27a", "gold"]; // (each §7.2 reaction its own colour: Conduction blue, fire orange…)
          for (const t of targets) {
            const c = chest(t);
            vfx.flash(c, 3.2, hex, 0.22);
            vfx.sparksAt(c, 16, spark, 14, 3);
            if (rx.effect.damage) vfx.number(c, rx.effect.damage, "big");
            viewFor(t)?.hitFlash(0.12, hex);
            if (t !== d && (rx.effect.chain || rx.effect.spread)) vfx.thread(chest(d), c, 0.4); // the lightning (or the fire) jumping across
          }
          vfx.ring({ x: d.pos.x, y: d.pos.y + 0.1, z: d.pos.z }, (rx.effect.radius || 1.5) * 2.4, hex, 0.45);
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
        case "groundWave": vfx.ring({ x: ev.wave.x, y: (ev.wave.y || 0) + 0.08, z: ev.wave.z }, ev.wave.maxR, { toll: "#c9b4ff", rot: "#c86a2a", splash: "#6ac8d8", shock: "#9ad8ff", gale: "#e8f4ff", erasure: "#f4f2ff" }[ev.wave.kind] ?? "#ffffff", ev.wave.maxR / ev.wave.speed); sfx.play(ev.wave.kind === "rot" ? "mud" : "slam", 0.7); camera.shake(0.2); break;
        case "rodsRise": hud.toast("THE RODS RISE", "danger"); sfx.play("glint"); break;
        case "rodsBroken": hud.toast("THE CHARGE GOES OUT OF IT", "break"); impact(3, true); sfx.play("postureBreak"); break;
        case "constellation": hud.toast("THE STARS LIGHT UP", "danger"); break;
        case "bells": hud.toast("THE BELLS RING", "danger"); hud.banner("NO SPELLS ANYWHERE · BREAK THE THREE BELLS"); silenceFx.all(true); break;
        case "bellsBroken": hud.toast("SILENCE BROKEN", "break"); silenceFx.all(false); impact(3, true); sfx.play("postureBreak"); break;
        case "wardBroken": hud.toast("HER WARD FALLS", "break"); break;
        // B3: the choir pit, and the Unsinging
        case "pitHide": pitFx.open(ev.at, ev.r); vfx.sparksAt({ x: ev.from.x, y: 1, z: ev.from.z }, 10, "violet", 6, 3); sfx.play("mud", 0.6); hud.toast("INTO THE CHOIR PIT", "danger"); break;
        case "pitRise": pitFx.close(); vfx.ring({ x: ev.at.x, y: 0.08, z: ev.at.z }, 3.4, "#c9b4ff", 0.35); sfx.play("slam", 0.6); break;
        case "unsingingBegin": vfx.ring({ x: ev.at.x, y: 0.08, z: ev.at.z }, 3, "#f4f2ff", 0.6); vfx.flash({ x: ev.at.x, y: 2, z: ev.at.z }, 4, "#f4f2ff", 0.3); sfx.play("cry", 0.5); camera.kick(0.5); hud.toast("THE UNSINGING", "danger"); break;
        case "unsinging": for (const [k, sz] of [[0, 8], [0.15, 18], [0.3, 30]]) setTimeout(() => vfx.ring({ x: ev.at.x, y: 0.1, z: ev.at.z }, sz, "#f4f2ff", 0.6), k * 1000); vfx.flash({ x: ev.at.x, y: 2, z: ev.at.z }, 9, "#ffffff", 0.35); camera.shake(0.6); break;
        case "grimoireResists": vfx.flash({ x: ev.at.x, y: 1.4, z: ev.at.z }, 3.4, "#fff1b8", 0.4); vfx.sparksAt({ x: ev.at.x, y: 1.4, z: ev.at.z }, 18, "gold", 6, 3); vfx.ring({ x: ev.at.x, y: 1.2, z: ev.at.z }, 3, "#ffd36a", 0.5, true); sfx.play("ultActivate", 0.7); impact(3, false);
          hud.toast("THE PAGE WON'T FORGET", "clear"); break;
        // B4's Final: the last vow, and the page marking its seal
        case "lastVow": hud.toast("ONE LAST VOW", "danger"); sfx.play("bossIntro", 0.7); break;
        case "inkMark": inkMarkFx.on(ev.target); vfx.sparksAt({ x: world.player.pos.x, y: 1.2, z: world.player.pos.z }, 14, "ink", 5, 3); hud.toast("THE PAGE MARKS IT", "clear"); break;
        case "hushWarn": hud.toast("SHE DRAWS BREATH…", "danger"); vfx.warning({ x: world.player.pos.x, y: 0, z: world.player.pos.z }, ev.frames / 60); sfx.play("glint"); break;
        case "hushDodge": hud.toast("DODGE SILENCED · PARRY!", "danger"); hud.banner("FIVE SECONDS: GUARD AND PARRY"); root.classList.add("hushed"); break;
        case "hushEnd": root.classList.remove("hushed"); break;
        case "oath": hud.toast("THE OATH", "danger"); hud.banner("NOTHING STAGGERS HIM · BREAK THE THREE VOW-SEALS OUT ON THE DEBRIS"); sfx.play("bossIntro"); break;
        // ---- Galen's P3: the floor gives way, and the fight goes on on the falling debris ----
        case "collapse":
          sets.collapse(ev.islands, ev.height); impact(4, true); camera.shake(1); sfx.play("slam"); sfx.play("postureBreak", 0.7);
          for (const s of ev.islands) vfx.ring({ x: s.x, y: 0.06, z: s.z }, s.r * 2, "#c8b49a", 0.6);
          hud.banner("THE FLOOR GIVES WAY · JUMP OR DASH IN THE AIR BEFORE YOU LAND");
          break;
        case "caught": camera.shake(0.5); sfx.play("slam", 0.8); hud.banner("ON THE DEBRIS · JUMP THE GAPS · THE DARK BELOW HURTS"); break;
        case "pitFall":
          vfx.ring({ x: ev.to.x, y: 0.06, z: ev.to.z }, 2.2, "#c8b49a", 0.35); camera.shake(0.4); sfx.play("slam", 0.6);
          if (ev.fighter === world.player) hud.toast("INTO THE DARK", "danger");
          break;
        case "floorRestore": sets.restoreFloor(); break;
        case "floorSettle": setTimeout(() => { if (sets.restoreFloor()) impact(6, false); }, 1600); break; // the dust settles (in the field; a story beat moves on first)
        case "oathBroken": hud.toast("THE VOW BREAKS", "break"); vfx.flash(ev.at, 4, "#ff7a2a", 0.3); impact(4, true); camera.kick(0.8); sfx.play("postureBreak"); break;
        case "desperate": hud.toast("DESPERATION", "danger"); hud.banner("HE CHARGES THE WHOLE HALL · DODGE"); break;
        case "flood": hud.toast("THE CISTERN FLOODS", "danger"); hud.banner("THE WATER JET SWEEPS · JUMP IT"); waterJet.start(ev.center, ev.length); sfx.play("ultActivate"); break;
        case "strikeWarn": groundFx.warn(ev.strike); break;
        // ---- Wraithe: tears in the air (pale, jagged), and the floor opening under you ----
        case "riftOpen": {
          const p = world.player.pos, yaw = Math.atan2(p.x - ev.at.x, p.z - ev.at.z);
          tearFx.open({ x: ev.at.x, y: 1.1, z: ev.at.z }, { r: ev.role === "call" ? 0.9 : 0.7, kind: "pale", life: ev.role === "mark" ? 0.6 : 0.42, yaw });
          if (ev.role !== "out") vfx.flash({ x: ev.at.x, y: 1.1, z: ev.at.z }, 1.2, "#f0ecff", 0.08);
          sfx.play("rift", ev.role === "mark" ? 0.6 : 1);
          break;
        }
        case "riftDrop": tearFx.open({ x: ev.at.x, y: ev.at.y + 0.8, z: ev.at.z }, { r: 1.2, kind: ev.kind === "sever" ? "black" : "pale", life: 0.6, ground: true }); if (ev.fighter === world.player) camera.shake(0.25); break;
        case "hardLanding": vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 2.2, "#c8b49a", 0.3); camera.shake(0.35); sfx.play("slam", 0.7); if (ev.fighter === world.player) hud.toast("HARD LANDING", "danger"); break;
        case "airRecover": if (ev.fighter === world.player) { hud.toast("RECOVERED", "clear"); sfx.play("dodge"); } break;
        // ---- The masked knight: black tears, the room's mouths, the Sever Line ----
        case "severOpen": {
          const p = world.player.pos, yaw = Math.atan2(p.x - ev.at.x, p.z - ev.at.z);
          tearFx.open({ x: ev.at.x, y: 1.15, z: ev.at.z }, { r: 0.8, kind: "black", life: ev.role === "mark" ? 0.5 : ev.role === "in" ? 1.2 : 0.42, yaw });
          if (ev.role !== "out") vfx.flash({ x: ev.at.x, y: 1.15, z: ev.at.z }, 1.2, "#9cb8ff", 0.08);
          sfx.play("tear", ev.role === "mark" ? 0.6 : 1);
          break;
        }
        case "severExposed": vfx.flash({ x: ev.fighter.pos.x, y: 1.2, z: ev.fighter.pos.z }, 1.6, "#9cb8ff", 0.1); break;
        // The reveal's fights (Ep 48): rain from tears, the Underline, golden doors and the swap, the scramble, spatial blades, Godfall.
        case "severRain": vfx.flash({ x: ev.at.x, y: 2.6, z: ev.at.z }, 3, "#9cb8ff", 0.1); sfx.play("tear"); break;
        case "underline":
          vfx.flash(ev.at, 4, "#f2efe6", 0.25); vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 4, "#5a7ad8", 0.6);
          hud.toast("UNDERLINE", "finisher"); sfx.play("finisher"); camera.shake(0.9); impact(8, true);
          break;
        case "doorOpen": {
          const p = world.player.pos, yaw = Math.atan2(p.x - ev.at.x, p.z - ev.at.z);
          tearFx.open({ x: ev.at.x, y: 1.3, z: ev.at.z }, { r: 0.9, kind: "gold", life: ev.role === "mark" ? 0.5 : ev.role === "in" ? 1.0 : 0.42, yaw });
          if (ev.role !== "out") vfx.flash({ x: ev.at.x, y: 1.3, z: ev.at.z }, 1.2, "#ffd36a", 0.08);
          sfx.play("door", ev.role === "mark" ? 0.5 : 0.9);
          break;
        }
        case "doorSwap":
          for (const at of [ev.a, ev.b]) tearFx.open({ x: at.x, y: 1.3, z: at.z }, { r: 0.9, kind: "gold", life: 0.6 });
          sfx.play("door"); camera.shake(0.3); if (ev.target === world.player) hud.toast("SWAPPED", "danger");
          break;
        case "scramble": tearFx.open({ x: ev.from.x, y: 1.2, z: ev.from.z }, { r: 0.8, kind: "black", life: 0.4 }); tearFx.open({ x: ev.to.x, y: 1.2, z: ev.to.z }, { r: 0.8, kind: "black", life: 0.6 }); if (ev.fighter === world.player) { hud.toast("SCRAMBLED", "danger"); camera.shake(0.3); } break;
        case "blades": sfx.play("glint"); break;
        case "godfall": groundFx.lane(ev.from, { x: ev.from.x + ev.dir.x * ev.length, z: ev.from.z + ev.dir.z * ev.length }, 1.6); hud.toast("GODFALL", "danger"); sfx.play("bossIntro", 0.7); camera.shake(0.4); break;
        case "regen": vfx.flash({ x: ev.fighter.pos.x, y: 1.4, z: ev.fighter.pos.z }, 1.4, "#ffd36a", 0.06); break;
        case "evolve": if (ev.phase === 2) for (const r of [0.6, 1.2]) vfx.ring({ x: ev.fighter.pos.x, y: 0.06, z: ev.fighter.pos.z }, 3 * r, "#9cb8ff", 0.4); break;
        // Encounter VI (Ep 43): the Draw (a tear under you, and out of one in front of him) and the Ring of Edges.
        case "drawMark": tearFx.open({ x: ev.at.x, y: 0.05, z: ev.at.z }, { r: ev.r, kind: "black", life: ev.frames / 60, ground: true }); sfx.play("tear", 0.6); break;
        case "drawn": {
          const yaw = Math.atan2(ev.to.x - ev.from.x, ev.to.z - ev.from.z);
          tearFx.open({ x: ev.to.x, y: 1.15, z: ev.to.z }, { r: 0.9, kind: "black", life: 0.5, yaw });
          vfx.flash({ x: ev.to.x, y: 1.15, z: ev.to.z }, 1.4, "#9cb8ff", 0.1); sfx.play("tear"); camera.shake(0.3);
          if (ev.fighter === world.player) hud.toast("DRAWN IN · PARRY!", "danger");
          break;
        }
        case "edgeRing": vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, ev.radius, "#9cb8ff", 0.35); sfx.play("tear", 0.8); break;
        case "severMouths":
          mouthTears = ev.mouths.map((m) => tearFx.open({ x: m.x, y: 1.4, z: m.z }, { r: 1.25, kind: "black", life: 9999, grow: 0.5, yaw: Math.atan2(-m.x, -m.z) }));
          sfx.play("tear");
          break;
        case "severLoop": vfx.flash({ x: ev.from.x, y: 1.2, z: ev.from.z }, 1.4, "#9cb8ff", 0.1); vfx.flash({ x: ev.to.x, y: 1.2, z: ev.to.z }, 1.4, "#9cb8ff", 0.1); sfx.play("tear", 0.6); if (ev.fighter === world.player) camera.shake(0.2); break;
        case "severLine": {
          lineWall?.dispose();
          const L = ev.halfLength * 2, yaw = Math.atan2(-ev.dir.z, ev.dir.x);
          lineWall = new BB.TransformNode("severLine", scene);
          lineWall.position.set(ev.mid.x, 0, ev.mid.z); lineWall.rotation.y = yaw;
          const { hole, edge } = tearMaterials(scene).black;
          const slab = BB.MeshBuilder.CreateBox("severLineSlab", { width: L, height: 3.2, depth: 0.14 }, scene); slab.position.y = 1.6; slab.material = hole;
          for (const y of [0.05, 3.2]) { const e = BB.MeshBuilder.CreateBox("severLineEdge", { width: L, height: 0.07, depth: 0.2 }, scene); e.position.y = y; e.material = edge; e.parent = lineWall; e.isPickable = false; }
          slab.parent = lineWall; slab.isPickable = false;
          vfx.flash({ x: ev.mid.x, y: 1.6, z: ev.mid.z }, 5, "#9cb8ff", 0.2); camera.shake(0.5); sfx.play("tear"); sfx.play("slam", 0.6);
          hud.toast("SEVER LINE", "danger"); hud.banner(ev.isolated ? `THE ROOM IS CUT IN TWO · ${(ev.isolated.stats?.name ?? "A SQUADMATE").toUpperCase()} IS SHUT OUT` : "THE ROOM IS CUT IN TWO");
          break;
        }
        // ---- Severin Eclipsed: dark stars, the Lion, the reflection, the clause, the lake ----
        case "darkStar": darkFx.open(ev.well, ev.radius); sfx.play("tear", 0.6); break;
        case "darkStarEnd": darkFx.close(ev.well); break;
        case "lionCalled": vfx.flash({ x: ev.at.x, y: 2, z: ev.at.z }, 4, "#c9a4ff", 0.25); vfx.sparksAt({ x: ev.at.x, y: 1.4, z: ev.at.z }, 20, "violet", 8, 4); hud.toast("THE LION", "danger"); sfx.play("surgeFull"); camera.shake(0.4); break;
        case "lionFalls": hud.toast("HIS WARD BREAKS", "break"); sfx.play("postureBreak"); break;
        case "mirrorRise": vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 5, "#a8c8ff", 0.6); vfx.flash({ x: ev.at.x, y: 1.2, z: ev.at.z }, 3, "#a8c8ff", 0.2); hud.toast("A REFLECTION STANDS UP", "afterimage"); sfx.play("rift"); break;
        case "mirrorSwap": for (const at of [ev.at, ev.from]) vfx.ring({ x: at.x, y: 0.06, z: at.z }, 3.2, "#a8c8ff", 0.35); sfx.play("rift", 0.7); break;
        case "mirrorHit": vfx.sparksAt(ev.at, 4, "white", 4, 1); break;
        case "mirrorFade": vfx.flash({ x: ev.at.x, y: 1.2, z: ev.at.z }, 2.4, "#a8c8ff", 0.25); removeView(ev.fighter); break;
        case "eclipseClause": vfx.flash(head(ev.fighter), 3, "#7a4ab0", 0.4); camera.shake(0.5); hud.toast("ECLIPSE · SURGE ERASED", "danger"); sfx.play("tear"); impact(3, true); break;
        case "eclipseSink": vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 7, "#3a2a6a", 0.8); camera.shake(0.6); darkFx.clear(); sfx.play("tear"); break;
        case "inscribed": vfx.ring({ x: ev.at.x, y: ev.at.y, z: ev.at.z }, 1.4, "#5a7ad8", 0.3); vfx.sparksAt(ev.at, 5, "ink", 4, 1); break;
        case "inscription": vfx.ring(ev.at, 3, "#5a7ad8", 0.45); vfx.sparksAt(ev.at, 12, "ink", 6, 3); hud.toast(`CLAUSE ${ev.n} / ${ev.of}`, "afterimage"); sfx.play("bookDescend"); camera.kick(0.4); break;
        case "inkStarlight":
          vfx.flash(ev.at, 7, "#fff1b8", 0.5); vfx.ring(ev.at, 10, "#5a7ad8", 0.8); vfx.ring(ev.at, 8, "#fff1b8", 0.7, true); vfx.sparksAt(ev.at, 30, "gold", 10, 6); vfx.sparksAt(ev.at, 24, "ink", 9, 5);
          hud.toast("INK & STARLIGHT", "finisher"); hud.banner("THE CORRUPTION BREAKS"); sfx.play("ultActivate"); camera.shake(0.8); impact(6, true);
          break;
        case "severLineClose": lineWall?.dispose(); lineWall = null; sfx.play("tear", 0.5); break;
        case "severLeave":
          tearFx.open({ x: ev.at.x, y: 1.2, z: ev.at.z }, { r: 1.3, kind: "black", life: 1.4, yaw: Math.atan2(world.player.pos.x - ev.at.x, world.player.pos.z - ev.at.z) });
          vfx.flash({ x: ev.at.x, y: 1.2, z: ev.at.z }, 2.4, "#9cb8ff", 0.18);
          for (const t of mouthTears) tearFx.close(t); mouthTears = [];
          lineWall?.dispose(); lineWall = null;
          removeView(ev.fighter); if (hud.focus === ev.fighter) hud.focus = null;
          sfx.play("tear"); camera.shake(0.4);
          break;
        case "riftCall": hud.pushLog(`Wraithe calls ${ev.called.length} acolytes through the air`); break;
        case "blankRing": vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, ev.r, "#f4f2ff", ev.delay / 60); break;
        case "blanked": if (ev.fighter === world.player) { hud.toast("BLANKED", "danger"); hud.pushLog("Your mana and your Surge are rubbed out"); } vfx.flash(ev.at, 1.6, "#ffffff", 0.14); sfx.play("vacuum"); break;
        case "revision": // the page rewinds three seconds, for Rook only
          hud.toast("REVISION", "clear"); hud.pushLog("The page rewinds. Three seconds, undone (for you).");
          vfx.ring({ x: ev.fighter.pos.x, y: 0.08, z: ev.fighter.pos.z }, 3.2, "#8ab4ff", 0.6); vfx.flash({ x: ev.fighter.pos.x, y: 1.2, z: ev.fighter.pos.z }, 2.4, "#c8d8ff", 0.2);
          sfx.play("bookDescend"); camera.shake(0.3);
          break;
        case "dawnbreak": hud.toast("DAWNBREAK", "danger"); hud.banner("THE WHOLE YARD GOES WHITE"); sfx.play("ultActivate"); camera.shake(0.5); break;
        case "zenith": break;
        case "lineCharge": groundFx.lane(ev.from, ev.to, ev.half * 1.6); hud.toast("LINE CHARGE", "danger"); sfx.play("guardWhistle", 0.6); break;
        case "formLine": hud.pushLog(`Halvard calls ${ev.called.length} Lances into line`); sfx.play("guardWhistle"); break;
        case "shieldBreak": vfx.flash(ev.at, 2, "#e6c060", 0.2); camera.kick(0.6); sfx.play("postureBreak"); break;
        case "reform": // Hollow armor (Ep 33) pulls itself back together, once
          vfx.flash({ x: ev.at.x, y: 1, z: ev.at.z }, 1.8, "#c9a4ff", 0.14); sfx.play("reform");
          hud.pushLog("The empty armor drags itself back together.");
          break;
        case "taken": // hunted (Ep 31): a black tear opens under one of his acolytes, and they're gone
          tearFx.open({ x: ev.at.x, y: 0.05, z: ev.at.z }, { r: 1.1, kind: "black", life: 0.7, ground: true });
          vfx.flash({ x: ev.at.x, y: 1, z: ev.at.z }, 1.6, "#9cb8ff", 0.12);
          removeView(ev.fighter); if (hud.focus === ev.fighter) hud.focus = null;
          sfx.play("tear"); camera.shake(0.3);
          hud.pushLog("A black tear opens under an acolyte. Gone.");
          break;
        case "riftEscape":
          tearFx.open({ x: ev.at.x, y: 1.1, z: ev.at.z }, { r: 1, kind: "pale", life: 0.8, yaw: Math.atan2(world.player.pos.x - ev.at.x, world.player.pos.z - ev.at.z) });
          vfx.flash({ x: ev.at.x, y: 1.1, z: ev.at.z }, 2, "#f0ecff", 0.15);
          removeView(ev.fighter); if (hud.focus === ev.fighter) hud.focus = null;
          sfx.play("rift");
          break;
        case "strike": groundFx.hit(ev.strike); break;
        case "burn": if (ev.fighter === world.player) vfx.sparksAt({ x: ev.fighter.pos.x, y: 1, z: ev.fighter.pos.z }, 3, "red", 3, 3); break;
        case "engineRoll": groundFx.lane(ev.from, ev.to, ev.half * 1.6); hud.toast("THE IRONSONG CHARGES", "danger"); sfx.play("bossIntro", 0.6); break;
        case "engineStop": groundFx.clearLanes(); camera.shake(0.3); sfx.play("slam"); break;
        case "engineBreaks": groundFx.clearLanes(); vfx.ring({ x: ev.at.x, y: 0.1, z: ev.at.z }, 9, "#ff7a3a", 0.6); vfx.flash({ x: ev.at.x, y: 2.5, z: ev.at.z }, 6, "#ffb070", 0.2); vfx.sparksAt({ x: ev.at.x, y: 2, z: ev.at.z }, 30, "gold", 12, 9); impact(3, true); sfx.play("postureBreak"); camera.shake(0.9); break;
        // B8 P2: the deck (sim/world.js _deck, sim/varka.js)
        case "deckUp": vfx.ring({ x: ev.at.x, y: ev.at.y + 0.08, z: ev.at.z }, 4, "#9ad8ff", 0.4); vfx.sparksAt({ x: ev.at.x, y: ev.at.y + 0.4, z: ev.at.z }, 12, "gold", 6, 4); sfx.play("jump"); sfx.play("slam", 0.6); camera.shake(0.3);
          hud.toast("SHE'S ON THE DECK", "danger"); break;
        case "deckBoard": if (ev.fighter === world.player) { vfx.ring({ x: ev.at.x, y: ev.at.y + 0.06, z: ev.at.z }, 1.8, "#e8d8b0", 0.3); sfx.play("land"); hud.toast("ABOARD", "clear"); } break;
        case "deckOff": if (ev.fighter === world.player) { sfx.play("dodge", 0.7); hud.toast(ev.knocked ? "THROWN OFF THE DECK" : "OFF THE DECK", ev.knocked ? "danger" : "clear"); } break;
        case "deckBroken": vfx.ring({ x: ev.at.x, y: 0.1, z: ev.at.z }, 7, "#ff7a3a", 0.5); vfx.sparksAt({ x: ev.at.x, y: 1.6, z: ev.at.z }, 24, "gold", 10, 7); impact(3, true); sfx.play("postureBreak"); camera.shake(0.8);
          hud.toast("THE ENGINE'S DOWN", "clear"); hud.banner("SHE'S FALLEN WITH IT · GET IN WHILE SHE'S REELING"); break;
        case "deckSections": camera.kick(0.6); sfx.play("slam", 0.8); break; // (Ep 22's hint says what to do)
        case "railTurn": vfx.sparksAt(ev.at, 6, "white", 5, 2); sfx.play("block", 0.5); break;
        case "magnet": hud.toast("MAGNET", "danger"); vfx.ring({ x: ev.fighter.pos.x, y: 1, z: ev.fighter.pos.z }, 8, "#9ad8ff", 0.4, true); break;
        case "railgun": vfx.flash({ x: ev.fighter.pos.x, y: 1.4, z: ev.fighter.pos.z }, 3, "#9ad8ff", 0.2); break;
        case "finalVow": {
          const by = ev.by, name = by === world.player ? "" : "BRANNOC";
          if (name) hud.cutIn("Captain Brannoc", "FINAL VOW", "brannoc");
          hud.toast("FINAL VOW", "break"); hud.banner("\"THE WALL DOES NOT MOVE.\"");
          vfx.pillar({ x: ev.at.x, y: 0, z: ev.at.z }, 14, 1.6); vfx.ring({ x: ev.at.x, y: 0.1, z: ev.at.z }, 12, "#ffffff", 0.7); vfx.flash(ev.at, 7, "#fff4d0", 0.35);
          vfx.sparksAt(ev.at, 40, "gold", 14, 10); impact(6, true); sfx.play("ultActivate"); camera.shake(1.2);
          groundFx.clear(); break;
        }
        case "arcLamps": hud.pushLog("Arc-lamps hum round the cistern"); break;
        case "lampFall": // an arc-lamp down in the water (Ep 12): the spark, and whatever's wet conducts it
          vfx.ring({ x: ev.at.x, y: 0.12, z: ev.at.z }, ev.r * 2, "#9ad8ff", 0.6); vfx.flash({ x: ev.at.x, y: 0.6, z: ev.at.z }, 4.5, "#bfe8ff", 0.3);
          vfx.sparksAt({ x: ev.at.x, y: 0.5, z: ev.at.z }, 30, "white", 12, 4); sfx.play("detonate"); sfx.play("glint"); camera.shake(0.4); impact(2);
          if (!ev.conducted) hud.toast("THE LAMP FALLS", "afterimage"); break; // (when it conducts, the reaction's own name says so)
        case "weakness": hud.banner(ev.reaction.id === "Conduction" ? "WEAK TO STORM · IT REELS" : "A WEAKNESS"); vfx.sparksAt(ev.at, 24, "white", 10, 4); break;
        case "lilyPads": hud.toast("LILY PAD LEAP", "danger"); hud.banner("IT'S GOING TO HOP · STAY OFF THE LIT PADS"); lilyFx.mark(ev.center, ev.pads); sfx.play("heal", 0.6); break;
        case "padHop": lilyFx.target(ev.to); root.classList.add("leaping"); sfx.play("dodge", 0.9); state.hopGhost = 0; break;
        case "padSmash": lilyFx.smash(ev.at, ev.last); sfx.play("slam", ev.last ? 1 : 0.75); camera.shake(ev.last ? 0.45 : 0.25); impact(ev.last ? 3 : 2, ev.last);
          if (settings.blur) { root.classList.add("hopblur"); setTimeout(() => root.classList.remove("hopblur"), 70); } break;
        case "leapEnd": root.classList.remove("leaping"); setTimeout(() => { if (!world.boss?.boss?.leap) lilyFx.clear(); }, 450); break;
        case "swallowed": hud.toast("SWALLOWED!", "danger"); hud.banner(ev.target ? `${ev.target.stats.name.toUpperCase()} IS STUCK IN A SLIME BUBBLE · BURST IT` : "MORE EGG SACS"); sfx.play("mud"); break;
        case "freed": hud.toast(`${ev.fighter.stats.name.toUpperCase()} IS FREE`, "clear"); break;
        case "bondFull": if (ev.ready) hud.toast("BOND FULL · TEAM ATTACK READY", "afterimage"); sfx.play("assist"); break; // (GDD §9.2)
        case "teamAttack": { // a T2 sequence (GDD §19.1, §19.4): Rook's TeamSequence move carries its tracks
          const b = BONDS[ev.kind];
          state.t2 = { id: `team-${ev.kind}`, kind: ev.kind, mode: ev.mode, ally: ev.fighter, target: ev.target };
          hud.toast("TEAM ATTACK", "finisher"); if (ev.mode !== "full") hud.banner((b?.team?.name ?? "TEAM ATTACK").toUpperCase());
          vfx.flash(chest(world.player), 3, "#ffd27a", 0.2);
          break;
        }
        case "teamStrike": {
          vfx.ring({ x: ev.target.pos.x, y: 0.05, z: ev.target.pos.z }, 8, PALETTE.gale, 0.5); vfx.sparksAt(ev.at, 24, "mint", 14, 6);
          vfx.flash(ev.at, 4, "#ffffff", 0.25); sfx.play("finisher");
          if (!state.t2 || state.t2.mode === "off") feedback("team-flash"); // (otherwise the sequence's post-FX track flashes it)
          break;
        }
        case "ended": if (isPlayer(ev.fighter) && state.t2 && (ev.ability.tags.includes("ultimate") || ev.ability.tags.includes("team"))) t2End(ev.how === "finished"); break;
        case "shield": sfx.play("shield"); vfx.ring({ x: ev.target.pos.x, y: 0.06, z: ev.target.pos.z }, 4, "#e8b46a", 0.4); hud.pushLog("Bas: Bastion Wall"); break;
        case "shieldBlock": vfx.flash(ev.at, 1.4, "#e8b46a", 0.1); break;
        case "heal": {
          const c = chest(ev.target);
          vfx.number(c, `+${ev.amount}`, "heal text"); vfx.sparksAt(c, 8, "mint", 4, 3); sfx.play("heal");
          vfx.thread(chest(ev.fighter), c, 0.5);
          break;
        }
        case "allyDown": if (!ev.fighter.noRevive || !ev.fighter.sacrifice) hud.toast(`${ev.fighter.stats.name.toUpperCase()} IS DOWN`, "danger"); break;
        // ---- Maelis's Sacrifice (Arc 7): once a battle, nothing stops it ----
        case "sacrificeBegin":
          hud.toast("SACRIFICE", "danger"); hud.banner("MAELIS PRAYS THE OTHER PRAYER · NOTHING STOPS IT");
          vfx.ring({ x: ev.fighter.pos.x, y: 0.06, z: ev.fighter.pos.z }, 3.2, "#fff2c0", 3); sfx.play("glint");
          break;
        case "sacrifice": {
          const t = ev.target;
          vfx.flash(ev.at, 5, "#fff2c0", 0.4); vfx.sparksAt(ev.at, 30, "gold", 12, 8);
          if (t) { vfx.flash(chest(t), 3.5, "#ffd76a", 0.35); vfx.ring({ x: t.pos.x, y: 0.06, z: t.pos.z }, 4, "#ffd76a", 0.6); }
          impact(4, false); camera.kick(0.5); sfx.play("ultActivate");
          hud.toast(t ? `${(t === world.player ? (state.mode === "story" ? story.player.name : "Rook") : t.stats.name).toUpperCase()} · STAR SURGE` : "SACRIFICE", "afterimage");
          hud.banner("A STAR, FOR A WHILE · SHE WON'T GET UP THIS FIGHT");
          break;
        }
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
          { const pt = BOSS_PHASE_TEXT[ev.fighter.kind] ?? ev.fighter.stats.phaseText; // (a boss can carry its own)
            if (pt) { const t = pt[ev.phase]; if (t) { hud.toast(t[0], t[2] ?? "danger"); hud.banner(t[1]); } sfx.play("bossIntro"); camera.shake(0.6); break; } }
          if (ev.drained) { setBog(false); hud.toast("THE BOG DRAINS", "clear"); hud.banner("PHASE 3 · EXPOSED"); }
          else if (ev.fighter.kind === "severin") { hud.toast("CONSTELLATION", "afterimage"); hud.banner("PHASE 2 · POLARIS"); }
          else { hud.toast("HASK ENRAGES", "danger"); hud.banner(`PHASE ${ev.phase}`); }
          sfx.play("bossIntro"); camera.shake(0.6);
          break;
        case "bloomPhase":
          if (ev.phase === 2) hud.toast("IT ERASES THE GROUND", "danger");
          else if (ev.phase === 4) hud.toast("IT'S ERASING YOUR PAGES", "danger");
          sfx.play("bossIntro", 0.7); camera.shake(0.4); break;
        case "eraseWarn": vfx.warning(ev.at, ev.frames / 60); vfx.ring({ x: ev.at.x, y: 0.08, z: ev.at.z }, ev.r * 2, "#f4f2ff", ev.frames / 60, true); sfx.play("glint", 0.6); break;
        case "holeOpen": holeFx.open(ev.hole); vfx.flash({ x: ev.hole.x, y: 0.6, z: ev.hole.z }, ev.hole.r * 2, "#ffffff", 0.14); sfx.play("vacuum", 0.8); break;
        case "holeClose": holeFx.close(ev.hole); break;
        case "erased":
          vfx.flash(ev.at, 2.4, "#ffffff", 0.2); vfx.sparksAt(ev.at, 14, "white", 8, 4); camera.shake(0.35); sfx.play("tear", 0.7);
          if (ev.fighter === world.player) hud.toast("ERASED", "danger"); break;
        case "memoryBegin": memoryFx.begin(ev.at); vfx.flash({ x: ev.at.x, y: 1.2, z: ev.at.z }, 9, "#fff2cf", 0.5); hud.toast("INSIDE THE PETALS", "afterimage"); break;
        case "memoryEnd": memoryFx.fade(); vfx.flash(chest(world.player), 6, "#ffffff", 0.3); break;
        case "pageErased": hud.toast(`PAGE ERASED · ${(SPELLS.find((x) => x.slot === ev.slot)?.short ?? ev.slot).toUpperCase()}`, "danger"); vfx.sparksAt(chest(world.player), 10, "white", 6, 3); sfx.play("tear", 0.6); break;
        case "pageRestored": hud.pushLog(`${SPELLS.find((x) => x.slot === ev.slot)?.short ?? ev.slot}: written back`); break;
        case "pageBlank": hud.toast("THAT PAGE IS BLANK", "danger"); sfx.play("ui", 0.5); break;
        case "erasuresClear": holeFx.clear(); memoryFx.end(); break;
        case "twinPhase":
          hud.toast(ev.phase === 2 ? "ONE SONG, TWO THROATS" : "SMOKE AND MIRRORS", "danger"); // (Ep 15's hints say the rest)
          sfx.play("bossIntro"); camera.shake(0.5); break;
        case "twinSwapWarn": for (const f of ev.fighters) vfx.flash(head(f), 1.2, "#e8eeff", 0.12); sfx.play("glint"); break;
        case "twinSwap":
          for (const at of ev.at) { vfx.flash(at, 2.2, "#d8e4ff", 0.16); vfx.ring({ x: at.x, y: 0.06, z: at.z }, 3, "#b98cff", 0.4); }
          vfx.thread(ev.at[0], ev.at[1], 0.35); hud.toast("THEY SWAP", "afterimage"); sfx.play("heal", 0.7); break;
        case "smokeUp": smokeFx.up(ev.center, ev.r); for (const e of ev.echoes) vfx.flash({ x: e.pos.x, y: 1.2, z: e.pos.z }, 1.6, "#e8eeff", 0.18); sfx.play("vacuum"); break;
        case "mirrorShift": vfx.flash(ev.from, 1.3, "#e8eeff", 0.1); vfx.flash(ev.to, 1.3, "#e8eeff", 0.1); sfx.play("glint", 0.5); break;
        case "shatterNote": for (const [k, sz] of [[0, 2.4], [0.12, 5], [0.24, 9]]) setTimeout(() => vfx.ring({ x: ev.at.x, y: 1.3, z: ev.at.z }, sz, "#ffe9a8", 0.35, true), k * 1000); // a held note, ringing out
          vfx.flash(ev.at, 2.2, "#fff6d8", 0.14); sfx.play("glint"); sfx.play("parry", 0.6); break;
        case "glassShatter": vfx.sparksAt(ev.at, 20, "white", 9, 5); vfx.sparksAt(ev.at, 10, "violet", 7, 4); vfx.flash(ev.at, 2.4, "#e8eeff", 0.16); sfx.play("postureBreak", 0.8); camera.shake(0.3); hud.toast("THE GLASS BREAKS", "clear"); break;
        case "glassMend": vfx.flash({ x: ev.fighter.pos.x, y: 1.4, z: ev.fighter.pos.z }, 1.6, "#cfe0ff", 0.12); sfx.play("glint", 0.5); break;
        case "echoShatter": shatter(ev.fighter, ev.at); break;
        case "smokeDispersed": vfx.ring({ x: ev.at.x, y: 0.1, z: ev.at.z }, 12, PALETTE.gale, 0.5); hud.toast("SMOKE BLOWN AWAY", "afterimage"); camera.shake(0.3); break;
        case "smokeClear": smokeFx.clear(); if (ev.shattered) hud.toast("EVERY MIRROR BROKEN", "break"); break;
        case "twinAbsorb":
          vfx.flash(ev.at, 4, "#c9a4ff", 0.3); vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 7, "#b98cff", 0.5); vfx.sparksAt(ev.at, 24, "violet", 10, 6);
          hud.toast("SHE TAKES HER SISTER'S SONG", "danger"); sfx.play("surgeFull"); impact(3, true); camera.shake(0.6); break;
        case "reedBeds": reedFx.lay(ev.beds); break;
        case "wading": vfx.ring({ x: ev.bed.x, y: 0.08, z: ev.bed.z }, ev.bed.r * 2.2, "#8a7a4a", 0.6, true); hud.pushLog("Hask makes for the reeds"); break;
        case "reedsBurn": reedFx.burn(ev.bed); sfx.play("detonate", 0.8); camera.shake(0.25); hud.toast("THE REEDS BURN", "finisher"); break;
        case "reedsOut": reedFx.out(ev.bed); break;
        case "flushed": hud.toast("FLUSHED OUT", "afterimage"); hud.banner("THE FIRE DROVE IT OUT OF THE BOG"); break;
        case "noReeds": hud.toast("NOWHERE TO DIVE", "clear"); hud.banner("EVERY REED BED BURNT · IT CAN'T GO UNDER"); break;
        case "fortRise":
          for (const l of ev.logs) { vfx.ring({ x: l.x, y: 0.06, z: l.z }, 2.6, "#8a7a4a", 0.45); vfx.sparksAt({ x: l.x, y: 0.4, z: l.z }, 10, "gold", 7, 5); }
          sfx.play("mud"); sfx.play("slam", 0.7); camera.shake(0.5);
          hud.toast("THE BARRICADE", "danger"); // (Ep 4's hint says the rest)
          break;
        case "fortVolley": sfx.play("mud", 0.6); break;
        case "fortBroken": vfx.ring({ x: ev.at.x, y: 0.06, z: ev.at.z }, 7, "#c8b49a", 0.4); hud.toast("BARRICADE BROKEN", "break"); sfx.play("postureBreak", 0.7); break;
        case "fortSink": hud.pushLog("The logs settle in the drained bed"); break;
        case "summon": for (const e of ev.summoned) vfx.ring({ x: e.pos.x, y: 0.06, z: e.pos.z }, 3, "#8a7a4a", 0.4); { const kinds = [...new Set(ev.summoned.map((e) => e.stats.name))]; hud.pushLog(`${ev.fighter?.stats?.name ?? "It"} calls ${ev.summoned.length} · ${kinds.join(", ")}`); } break; // (whoever's calling, and what comes)
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
          if (ev.defender.traits?.echo) { shatter(ev.defender, { x: ev.defender.pos.x, y: 1.2, z: ev.defender.pos.z }); break; } // a reflection: glass
          // XP for every foe Rook fells (not a memory worn as someone else, not a prop): its worth scaled to the story's bracket (§17).
          const kx = state.mode === "story" && ev.defender.team === Team.Enemy && !world.wearing && (XP_BY_KIND[ev.defender.kind] != null || !(ev.defender.traits?.object || ev.defender.traits?.prop || ev.defender.traits?.dummy))
            ? killXp(ev.defender.kind, ev.defender.stats?.maxHealth ?? ev.defender.combatant?.health?.max, xpBracket(), story.progress.level) : 0;
          if (kx > 0) {
            const n = Math.round(kx * (1 + story.crafting.xpBonus));
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
        case "pageEvolved": hud.toast(ev.rebranch ? `RE-BRANCHED · ${ev.branch.name.toUpperCase()}` : ev.branch.name.toUpperCase(), "finisher"); sfx.play("ultActivate"); break;
        case "perfectCast": { // a page at V, cast out of a landed blow as the window opens (GDD §8.1)
          const c = chest(ev.fighter); vfx.flash(c, 2.6, "#ffe9a8", 0.2); vfx.ring({ x: c.x, y: c.y, z: c.z }, 2.4, PALETTE.lantern, 0.3, true);
          hud.toast("PERFECT CAST", "afterimage"); sfx.play("glint"); break;
        }
        case "forbiddenCast": { const c = chest(ev.fighter); vfx.flash(c, 2.8, "#2a1e3a", 0.25); vfx.sparksAt(c, 14, "violet", 9, 2); camera.kick(0.3); break; } // a forbidden page bites (the story counts it, §8.3)
        case "freeCast": vfx.sparksAt(chest(ev.fighter), 8, "ink", 5, 2); if (settings.frameData) hud.pushLog(`Second Reading: ${ev.ability.id} free`); break;
        case "lanternAnswer": vfx.flash(ev.at, 3.4, "#ffd27a", 0.4); vfx.ring({ x: ev.at.x, y: 0.1, z: ev.at.z }, 3.6, PALETTE.lantern, 0.6); hud.toast("LANTERN'S ANSWER", "clear"); sfx.play("heal"); break;
        case "windWall": {
          const z = ev.zone;
          vfx.ring({ x: z.pos.x, y: 0.06, z: z.pos.z }, 4, PALETTE.gale, 0.4);
          vfx.sparksAt({ x: z.pos.x, y: 1.2, z: z.pos.z }, 12, "mint", 7, 2);
          walls.show(z);
          break;
        }
        case "zoneEnd": if (ev.zone.mode === "door") doorFx.close(ev.zone); else walls.hide(ev.zone); break;
        case "threshold": doorFx.open(ev.zone); break;
        case "doorHeld": vfx.sparksAt({ x: ev.zone.pos.x, y: ev.zone.pos.y + 1.4, z: ev.zone.pos.z }, 10, "gold", 6, 2); vfx.flash({ x: ev.zone.pos.x, y: ev.zone.pos.y + 1.6, z: ev.zone.pos.z }, 2.4, "#ffe9a8", 0.12); sfx.play("block", 0.8); break;
        case "holdBegin": holdFx.begin(); camera.kick(0.8); camera.shake(0.6); sfx.play("bossIntro"); hud.toast("IT'S OPENING", "danger"); break;
        case "holdDone": holdFx.end(); impact(4, true); camera.shake(1); sfx.play("ultActivate"); break;
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
  const applySettings = (save = true) => {
    fdPanel.hidden = !settings.frameData;
    camera.shakeScale = settings.shake ? 1 : 0;
    Rig.twos = settings.twos !== false; // limited animation (GDD §19.6): poses drawn at 12 fps, or every frame
    root.classList.toggle("no-blur", !settings.blur);
    root.classList.toggle("no-speedlines", !settings.speedLines);
    for (const b of root.querySelectorAll("[data-a11y]")) {
      const k = b.dataset.a11y;
      if (k === "ult") { b.textContent = { full: "ULTIMATES: FULL", short: "ULTIMATES: SHORT", off: "ULTIMATES: SKIP" }[settings.ult]; b.setAttribute("aria-pressed", String(settings.ult !== "full")); }
      else if (k === "difficulty") { const d = difficultyOf(settings.difficulty); b.textContent = `DIFFICULTY: ${d.name.toUpperCase()}`; b.setAttribute("aria-pressed", "true"); b.title = d.desc; }
      else b.setAttribute("aria-pressed", String(!!settings[k]));
    }
    if (save) saveSettings();
    root.querySelector('[data-menu="frameData"]')?.setAttribute("aria-pressed", String(settings.frameData));
    root.querySelector('[data-menu="flashes"]')?.setAttribute("aria-pressed", String(settings.flashes));
    root.querySelector('[data-menu="sound"]')?.setAttribute("aria-pressed", String(settings.sound));
    root.querySelector('[data-menu="assist"]')?.setAttribute("aria-pressed", String(settings.assist));
    vfx.reduceFlashes = !settings.flashes;
    sfx.setEnabled(settings.sound);
    world.assist = settings.assist;
    world.difficulty = settings.difficulty; // GDD §9.7
    world.t2Mode = (id) => t2Mode(settings.ult, id);
    controls.smartCombo = settings.assist || difficultyOf(settings.difficulty).autoCombo;
    for (const el of root.querySelectorAll("[data-difficulty-note]")) el.textContent = difficultyOf(settings.difficulty).desc;
    for (const el of root.querySelectorAll("[data-difficulty-name]")) el.textContent = difficultyOf(settings.difficulty).name;
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
  const showTeamCard = (kind) => { // the Team Attack's close-up: the technique's name (GDD §19.4 voice track)
    ultCard.innerHTML = `<b>${(BONDS[kind]?.team?.name ?? "Team Attack").toUpperCase()}</b><span>TEAM ATTACK · ${kind.toUpperCase()} &amp; ROOK</span>`;
    showUltCard();
    later(1.4, () => { ultCard.innerHTML = "<b>SKYRENDER</b><span>WIND GRIMOIRE · LEGENDARY PAGE</span>"; });
  };

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
  // The accessibility block in the controls card (GDD §19.8): every toggle in one place, phones included.
  for (const b of root.querySelectorAll("[data-a11y]")) b.addEventListener("click", (e) => {
    e.currentTarget.blur(); sfx.play("ui");
    const k = b.dataset.a11y;
    if (k === "ult") settings.ult = ULT_MODES[(ULT_MODES.indexOf(settings.ult) + 1) % ULT_MODES.length];
    else if (k === "difficulty") { settings.difficulty = DIFFICULTY_KEYS[(DIFFICULTY_KEYS.indexOf(settings.difficulty) + 1) % DIFFICULTY_KEYS.length]; hud.toast(`DIFFICULTY: ${difficultyOf(settings.difficulty).name.toUpperCase()}`); }
    else settings[k] = !settings[k];
    applySettings();
  });
  applySettings(false);

  /** A fresh world for a new run or sandbox session (views rebuilt, settings kept). */
  let resetBossFx = null; // set once the boss visuals exist (below)
  let injuredNow = () => []; // squadmates fighting hurt, from the story's flags (set once the story exists)
  let annotationNow = () => false; // the Palimpsest's Annotation stage (after Ep 28)
  let marginNow = () => []; // the secret pages pinned in the margin (GDD §8.1, §8.4), from the story's flags
  let forbiddenNow = () => false, corruptionNow = () => 0; // the forbidden page pinned, and Corruption (GDD §8.3)
  let techniquesNow = () => []; // sword techniques the mentors have taught (GDD §17)
  let revisionNow = () => false;   // and its Revision stage (after Ep 40)
  const newWorld = (opts = {}) => {
    for (const f of [...views.keys()]) removeView(f);
    walls.clear(); setBog(false, true); constellation.clear(true);
    world = new World({ tokens: mobile ? 1 : 2, seed: (Date.now() & 0xffff) || 1, assist: settings.assist, difficulty: settings.difficulty, companions: true, injured: injuredNow(), annotation: annotationNow(), revision: revisionNow(), margin: marginNow(), forbidden: forbiddenNow(), corruption: corruptionNow(), techniques: techniquesNow(), ...opts });
    const ink = world.loadout.Spell1?.id === "Inscribe"; // the margin: Inscribe takes Gale's button
    for (const b of root.querySelectorAll('[data-intent="Spell1"]')) b.textContent = ink ? "INK" : "GALE"; // (the Gale button and its place in the Magic ring)
    for (const b of root.querySelectorAll('[data-intent="Spell4"]')) b.textContent = world.loadout.Spell4?.id === "HollowBite" ? "BITE" : "WALL"; // the forbidden page takes Wind Wall's button (§8.3)
    world.pageDefs = PAGES;
    world.t2Mode = (id) => t2Mode(settings.ult, id); // Team Attacks: full, short (after one full view) or skipped (GDD §19.1)
    root.classList.toggle("has-tag", !!world.members.severin); root.classList.remove("tag-severin", "hushed");
    resetBossFx?.();
    camera.bounds = null;
    root.classList.toggle("no-ult", !world.ultimate);
    root.classList.toggle("solo", !world.companions.length);
    root.dataset.locked = [...Object.entries(world.loadout).filter(([, a]) => !a).map(([k]) => k), ...(world.pageGrowth ? [] : ["pages"])].join(" ");
    handle.world = world;
    { // someone else's body (Ep 49): their name on the card, not Rook's
      const card = root.querySelector(".player-card .name"), small = card?.querySelector("small");
      if (world.wearing && card?.firstChild) { card.firstChild.textContent = `${world.wearing.stats.name.toUpperCase()} `; if (small) small.textContent = world.wearing.title ?? ""; root.classList.add("wearing"); }
      else if (root.classList.contains("wearing") && card?.firstChild) { root.classList.remove("wearing"); card.firstChild.textContent = `${(story?.player?.name ?? "Rook").toUpperCase()} `; if (small) small.textContent = "LANTERN SQUIRE"; }
    }
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
  startScreen.querySelector("[data-start-settings]")?.addEventListener("click", (e) => { e.stopPropagation(); sfx.play("ui"); toggleHelp(true); }); // before the first frame of play (flashes, shake…)

  // ---- Story mode (Phase 3) ----
  const saves = SaveStore.browser();
  /** The level the fight in front of you was made for (§17 power gating): this episode's, or, roaming, the story's so far. */
  const xpBracket = () => { const m = /^ep(\d+)$/.exec(story.ep?.id ?? ""); return !story.roaming && m ? bracketOf(Number(m[1])) : storyBracket(story.flags); };
  const story = new StoryPlayer({
    root, scene, camera, hud, sfx, vfx, controls, saves, sets, mobile,
    setPlayerVisible: (on) => views.get(world.player)?.setVisible(on),
    playerRoot: () => views.get(world.player)?.root,
    setMemory: (on, instant) => grade.set(on, instant),
    setSquadVisible: (on) => { for (const c of world.companions) views.get(c)?.setVisible(on); },
    getWorld: () => world,
    makeWorld: (opts) => newWorld({ ...opts, mods: addMods(statMods(partyOf(opts.companions)), opts.mods), progress: story.progress, teamAttacks: story.bonds.teamAttacks(), pageXpBonus: story.crafting.pageXpBonus }),
    openUI: (kind) => openHQ(kind),
    playSkit: (k, name) => playSkit(k, name), // a camp skit (GDD §10)
    onSecret: () => { world.margin = new Set(story.secrets.margin); refreshGrimDot(); }, // a secret page found (and pinned, if there was room)
    onCorruption: () => { if (!grim.hidden) renderGrimoire(); },
    onContract: () => { sfx.play("surgeFull"); }, // (the banner says what it paid)
    onKeepsake: (id) => { sfx.play("surgeFull"); hud.toast(`KEEPSAKE · ${ITEMS[id].name.toUpperCase()} · in your bag`, "finisher"); },
    onTechnique: (t) => { world.setTechniques(techniquesNow()); sfx.play("surgeFull"); hud.toast(`TECHNIQUE · ${t.name.toUpperCase()}`, "finisher"); }, // learned: in Rook's hands at once
    onRank: (rk) => { sfx.play("surgeFull"); hud.toast(`KNIGHT RANK · ${rk.name.toUpperCase()}`, "finisher"); vfx.flash({ x: world.player.pos.x, y: 1.4, z: world.player.pos.z }, 4, "#ffd36a", 0.5); },
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
    openSurvey: (id) => openSurvey(id),
    onTheatre: (th) => showTheatre(th),
    impact: (frames, strong) => impact(frames, strong), speedLines: (sec) => speedLines(sec), // cutscene impact frames and speed lines (GDD §19.6)
  }, [{ episode: EPISODE_1, script: EP1_SCRIPT }, { episode: EPISODE_2, script: EP2_SCRIPT }, { episode: EPISODE_3, script: EP3_SCRIPT }, { episode: EPISODE_4_STORY, script: EP4_SCRIPT },
    { episode: EPISODE_5, script: EP5_SCRIPT }, { episode: EPISODE_6, script: EP6_SCRIPT }, { episode: EPISODE_7, script: EP7_SCRIPT }, { episode: EPISODE_8, script: EP8_SCRIPT },
    { episode: EPISODE_9, script: EP9_SCRIPT }, { episode: EPISODE_10, script: EP10_SCRIPT }, { episode: EPISODE_11, script: EP11_SCRIPT }, { episode: EPISODE_12, script: EP12_SCRIPT },
    { episode: EPISODE_13, script: EP13_SCRIPT }, { episode: EPISODE_14, script: EP14_SCRIPT }, { episode: EPISODE_15, script: EP15_SCRIPT }, { episode: EPISODE_16, script: EP16_SCRIPT },
    { episode: EPISODE_17, script: EP17_SCRIPT }, { episode: EPISODE_18, script: EP18_SCRIPT },
    { episode: EPISODE_19, script: EP19_SCRIPT }, { episode: EPISODE_20, script: EP20_SCRIPT },
    { episode: EPISODE_21, script: EP21_SCRIPT }, { episode: EPISODE_22, script: EP22_SCRIPT },
    { episode: EPISODE_23, script: EP23_SCRIPT }, { episode: EPISODE_24, script: EP24_SCRIPT },
    { episode: EPISODE_25, script: EP25_SCRIPT }, { episode: EPISODE_26, script: EP26_SCRIPT },
    { episode: EPISODE_27, script: EP27_SCRIPT }, { episode: EPISODE_28, script: EP28_SCRIPT },
    { episode: EPISODE_29, script: EP29_SCRIPT }, { episode: EPISODE_30, script: EP30_SCRIPT }, { episode: EPISODE_31, script: EP31_SCRIPT },
    { episode: EPISODE_32, script: EP32_SCRIPT }, { episode: EPISODE_33, script: EP33_SCRIPT },
    { episode: EPISODE_34, script: EP34_SCRIPT }, { episode: EPISODE_35, script: EP35_SCRIPT }, { episode: EPISODE_36, script: EP36_SCRIPT },
    { episode: EPISODE_37, script: EP37_SCRIPT }, { episode: EPISODE_38, script: EP38_SCRIPT },
    { episode: EPISODE_39, script: EP39_SCRIPT }, { episode: EPISODE_40, script: EP40_SCRIPT },
    { episode: EPISODE_41, script: EP41_SCRIPT }, { episode: EPISODE_42, script: EP42_SCRIPT },
    { episode: EPISODE_43, script: EP43_SCRIPT }, { episode: EPISODE_44, script: EP44_SCRIPT },
    { episode: EPISODE_45, script: EP45_SCRIPT }, { episode: EPISODE_46, script: EP46_SCRIPT },
    { episode: EPISODE_47, script: EP47_SCRIPT }, { episode: EPISODE_48, script: EP48_SCRIPT },
    { episode: EPISODE_49, script: EP49_SCRIPT }, { episode: EPISODE_50, script: EP50_SCRIPT },
    { episode: EPISODE_CALPATH, script: CALPATH_SCRIPT },
    { episode: EPISODE_51, script: EP51_SCRIPT }, { episode: EPISODE_52, script: EP52_SCRIPT },
    { episode: EPISODE_53, script: EP53_SCRIPT }, { episode: EPISODE_54, script: EP54_SCRIPT },
    { episode: EPISODE_55, script: EP55_SCRIPT }, { episode: EPISODE_56, script: EP56_SCRIPT },
    { episode: EPISODE_57, script: EP57_SCRIPT }, { episode: EPISODE_58, script: EP58_SCRIPT },
    { episode: EPISODE_59, script: EP59_SCRIPT }, { episode: EPISODE_60, script: EP60_SCRIPT },
    { episode: EPISODE_61, script: EP61_SCRIPT }, { episode: EPISODE_62, script: EP62_SCRIPT },
    { episode: EPISODE_63, script: EP63_SCRIPT }, { episode: EPISODE_64, script: EP64_SCRIPT }, { episode: EPISODE_65, script: EP65_SCRIPT },
    { episode: EPISODE_66, script: EP66_SCRIPT }, { episode: EPISODE_67, script: EP67_SCRIPT },
    { episode: EPISODE_68, script: EP68_SCRIPT }, { episode: EPISODE_69, script: EP69_SCRIPT }, { episode: EPISODE_70, script: EP70_SCRIPT }], [WORLD_SCRIPT]);
  annotationNow = () => !!story.flags.get("ANNOTATION"); // after Mirrorlake, Rook's spells write ink
  revisionNow = () => !!story.flags.get("REVISION");     // after the Paragon's spar, the page rewinds
  const playtest = new PlaytestLog(story.flags, { where: () => ({ episode: story.ep?.id ?? null, beat: story.director?.beat?.id ?? null }) });
  injuredNow = () => (story.flags.get("BAS_ARM_BROKEN") ? ["bas"] : []); // Bas fights one-armed after the vault
  marginNow = () => story.secrets.margin;
  forbiddenNow = () => !!story.flags.get("FORBIDDEN_FOUND") && !!story.flags.get("FORBIDDEN_ON");
  corruptionNow = () => story.corruption.value;
  techniquesNow = () => learnedTechniques(story.flags);
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
    if (exit?.kind === "credits") showCredits();
  };
  // The credits after Ep 70 (built from your flags), rolling over the title. Skip any time; reduced motion gets a still list.
  const creditsEl = root.querySelector("[data-credits]");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const showCredits = () => {
    const roll = creditsEl.querySelector("[data-credits-roll]");
    roll.innerHTML = creditsFor(story.flags, story.player.name).map((sec) => `<section${sec.big ? ' class="big"' : ""}>${sec.head ? `<h3>${esc(sec.head)}</h3>` : ""}${
      sec.lines.map((l) => (Array.isArray(l) ? `<p class="pair"><b>${esc(l[0])}</b><span>${esc(l[1])}</span></p>` : `<p>${esc(l)}</p>`)).join("")}</section>`).join("");
    roll.style.animationDuration = `${CREDITS_SECONDS}s`;
    creditsEl.hidden = false; creditsEl.scrollTop = 0;
    roll.classList.remove("rolling"); void roll.offsetWidth; if (!reduced) roll.classList.add("rolling");
    sfx.play("tuneMarch"); // the Lighthouse Tune, all four notes
  };
  const hideCredits = () => { creditsEl.hidden = true; creditsEl.querySelector("[data-credits-roll]").classList.remove("rolling"); };
  creditsEl.querySelector("[data-credits-roll]").addEventListener("animationend", () => creditsEl.querySelector("[data-credits-done]").focus());
  creditsEl.querySelector("[data-credits-done]").addEventListener("click", (e) => { e.stopPropagation(); sfx.play("ui"); hideCredits(); });
  const createModal = root.querySelector("[data-create]");
  const nameInput = createModal.querySelector("[data-pc-name]");
  let pronouns = "they";
  for (const b of createModal.querySelectorAll("[data-p]")) b.addEventListener("click", () => {
    pronouns = b.dataset.p; sfx.play("ui");
    for (const o of createModal.querySelectorAll("[data-p]")) o.setAttribute("aria-pressed", String(o === b));
  });
  starSight = () => !!story.flags.get("STAR_SIGHT") && story.flags.get("STAR_SIGHT") !== "0";
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
    list.innerHTML = Object.values(ZONES).filter((z) => !z.dungeon && !z.interior && !z.noMap && (!z.mapWhen || truthy(compileExpr(z.mapWhen)(story.flags)))).map((z) => `<button data-zone="${z.id}" ${story.zone?.id === z.id ? "disabled" : ""}><b>${z.name.toUpperCase()}</b><span>${z.region}${story.zone?.id === z.id ? " · You are here" : ""}</span></button>`).join("");
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
      const off = renownTier(story.flags.get("RENOWN_AURELIN")).price; // standing in town: a hero's discount, an outlaw's mark-up (data/law.js)
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
    // Key items: story objects you carry (only in the Bag, not at a shop counter).
    const keys = shopId ? [] : keyItemsHeld(story.flags, story.zone?.id ?? null), keyList = shopModal.querySelector("[data-keyitems]");
    keyList.hidden = shopModal.querySelector("[data-keyitems-h]").hidden = !keys.length;
    keyList.innerHTML = keys.map((k) => `<p><b>${k.name}</b>${k.text}</p>`).join("");
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
    const kr = rankOf(f), nx = KNIGHT_RANKS[kr + 1], ep = storyEpisode(f), br = storyBracket(f);
    journal.querySelector("[data-rep]").innerHTML = [
      // Rook's own standing (§17): Knight Rank, and the level the story expects by now (its bosses' brackets).
      ["KNIGHT RANK", `${KNIGHT_RANKS[kr].name}${nx ? ` · next: ${nx.name}, by exam at the Exam Grounds (after ${nx.afterText}, near level ${nx.level})` : " · the top of the ladder"}`],
      ["SWORD TECHNIQUES", (() => { const known = Object.entries(TECHNIQUES).filter(([id]) => f.get(techFlag(id))); const tp = Number(f.get(TP_FLAG)) || 0;
        return `${known.length ? known.map(([, t]) => `<b>${t.name}</b> (${t.desc})`).join(" ") : "None yet."} · ${tp} point${tp === 1 ? "" : "s"} to spend · a drill a day with Bas or Dagrun at the Lighthouse${f.get("HAS_SUMMONS") && !f.get("BRANNOC_DEAD") ? ", or a bout with Brannoc at Ironhold" : ""}`; })()],
      ["LEVEL", `${story.progress.level}${ep ? ` · the story expects about ${br} by now, ${bracketOf(Math.min(70, ep + 1))} by the next episode` : ""}`],
      ["SQUAD RANK", `The Lanterns are ${["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th (last)"][rank.place]} of seven`],
      ["MERIT", `${f.get("MERIT") || 0}${rank.next ? ` · next rank at ${rank.next}` : " · top of the Crown's ranking"}`],
      ["SQUAD REPUTATION", f.get("REP_SQUAD") || 0],
      // Standing in each town, and any bounty on your head there (data/law.js).
      ...["aurelin", "thornwick", "fens"].map((k) => { const r = LAW_REGIONS[k], v = Number(f.get(r.renown)) || 0, b = Number(f.get(`BOUNTY_${r.id}`)) || 0;
        return [`RENOWN · ${r.name.replace(/^the /, "").toUpperCase()}`, `${v} · ${renownTier(v).name}${b ? ` · <b class="bounty">BOUNTY ${b}${f.get(`WANTED_${r.id}`) ? " · WANTED" : ""}</b>` : ""}`]; }),
      ["THE CITY WATCH", `${4 + (Number(f.get("WATCH_STRENGTH")) || 0)} guards${f.get("LUKE_GUARD") ? " (Luke among them)" : ""}`],
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
      found.map((f) => `<p class="mats"><i>"${f.text}"</i> · ${f.where}</p>`).join("") +
      (story.flags.get("REVISION") ? `<p class="mats"><b>Revision</b> (the second stage): the page turns back. With half a Surge gauge, a fall comes undone: the last three seconds rewind for you alone, and what you did to them stands. Ink comes back faster in a fight.${story.flags.get("CLAUSE_II") ? ` <i>Written on Elodie's wrist: "${story.flags.get("CLAUSE_II") === "stays" ? "Elodie stays" : "Elodie is nobody's page"}."</i>` : ""}</p>` : "") +
      (story.flags.get("ANNOTATION") ? `<p class="mats"><b>Annotation</b> (the first stage): the margin is open. Your spells leave ink on what they hit, and your hits land harder on anything inked.${story.flags.get("CLAUSE_I") ? ` <i>Written in the margin: "Severin comes home${story.flags.get("CLAUSE_I") === "home-anyway" ? ". Whether he likes it or not" : ""}."</i>` : ""}</p>` : "");
    const pt = journal.querySelector("[data-playtest]");
    pt.innerHTML = playtest.optIn
      ? `<p class="hint">You're helping test the mystery. What's logged: when each clue was first seen, scenes rewatched in the Theatre, and your survey answers. It stays in this browser.</p>
        <textarea readonly data-pt-log>${playtest.export().replace(/</g, "&lt;")}</textarea>
        <div class="start-buttons"><button class="go" data-pt-copy>COPY LOG</button><button class="go alt" data-pt-off>STOP LOGGING</button></div>`
      : `<p class="hint">Help test the mystery: log when clues are first seen and answer one question at the end of the arc. Optional; nothing leaves this browser unless you copy it.</p><div class="start-buttons"><button class="go alt" data-pt-on>OPT IN</button></div>`;
    pt.querySelector("[data-pt-on]")?.addEventListener("click", () => { playtest.setOptIn(true); sfx.play("ui"); openJournal(); });
    pt.querySelector("[data-pt-off]")?.addEventListener("click", () => { playtest.setOptIn(false); sfx.play("ui"); openJournal(); });
    pt.querySelector("[data-pt-copy]")?.addEventListener("click", async () => { const t = pt.querySelector("[data-pt-log]"); try { await navigator.clipboard.writeText(t.value); } catch { t.select(); document.execCommand?.("copy"); } hud.toast("COPIED", "clear"); });
    // The rumor board: what people say about the stranger, once there's been one to talk about.
    const rb = rumorBoard(story.flags), rumorHead = journal.querySelector("[data-rumor-head]"), rumorList = journal.querySelector("[data-rumors]");
    rumorHead.hidden = rumorList.hidden = !rb.show;
    if (rb.show) {
      rumorHead.textContent = rb.title;
      rumorList.innerHTML = rb.seen.map((t) => `<p class="seen">${t}</p>`).join("") +
        (rb.rumors.length ? rb.rumors.map((r) => `<p><b>${r.theory}</b>${r.text} <i>· ${r.who}</i></p>`).join("") : `<p class="hint">Nobody has a theory yet. Ask around.</p>`);
    }
    const list = story.quests.entries();
    // The notebooks left for Rook: a page a Lantern, with a margin line Lio may have read.
    const fn = fieldNotes(story.flags), notesHead = journal.querySelector("[data-notes-head]"), notesList = journal.querySelector("[data-notes]");
    notesHead.hidden = notesList.hidden = !fn.show;
    if (fn.show) {
      notesHead.textContent = fn.title;
      notesList.innerHTML = `<p class="hint">${fn.stars} ${fn.hint}</p>` + fn.pages.map((p) =>
        `<div class="page"><b>${p.who}</b>${p.stars ? `<span class="ink">${p.stars}</span>` : ""}<br>${p.note || p.sketch}${p.script}${p.read ? `<span class="margin">"${p.margin}"</span>` : ""}</div>`).join("");
    }
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
    galen: { 2: ["ROT", "PHASE 2 · RINGS OF RUST · JUMP THEM"], 3: ["THE FLOOR GIVES WAY", "PHASE 3 · HE BRINGS THE TOWER DOWN"], 4: ["THE OATH", "PHASE 4 · BREAK THE VOW-SEALS"], 5: ["DESPERATION", "PHASE 5 · THE LAST CHARGE"] },
    gullmaw: { 2: ["THE FLOOD", "PHASE 2 · THE WATER JET · JUMP IT"], 3: ["SWALLOWED", "PHASE 3 · BURST THE SLIME BUBBLE"] },
    eclipsed: { 2: ["THE LION", "PHASE 2 · A ZODIAC BEAST · HE'S WARDED WHILE IT STANDS"], 3: ["MIRRORLAKE", "PHASE 3 · HIS REFLECTION · THE ONE IN THE WATER IS REAL"],
      4: ["THE ECLIPSE", "PHASE 4 · HE READS A CLAUSE · YOUR SURGE IS GONE"] },
    maskedVI: { 2: ["DRAW", "PHASE 2 · A TEAR UNDER YOU PULLS YOU TO HIS GLAIVE · STEP OFF IT, OR PARRY"], 3: ["RING OF EDGES", "PHASE 3 · CUTS FROM A RING OF TEARS · THE MIDDLE IS SAFE"] },
    masked: { 2: ["THE FLOOR OPENS", "PHASE 2 · A BLACK TEAR UNDER YOU · STEP OFF, OR JUMP OR DASH BEFORE YOU LAND"],
      3: ["NO WAY OUT", "PHASE 3 · EVERY WAY OUT LEADS BACK IN"], 4: ["…", "PHASE 4"] },
    warden: { 2: ["THE RODS RISE", "PHASE 2 · IT'S CHARGED WHILE ANY ROD STANDS · BREAK THEM"], 3: ["THE STAR CHART", "PHASE 3 · THUNDER ALONG THE CONSTELLATION'S LINES"] },
    paragon: { 2: ["ZENITH", "PHASE 2 · LINES OF LIGHT RUN OUT FROM HIM IN A CROSS · STAND BETWEEN THEM"] },
    eraser: { 2: ["UNWRITE", "PHASE 2 · THE FLOOR GOES BLANK UNDER YOU · STEP OFF THE PALE PATCHES"], 3: ["ERASURE", "PHASE 3 · A WALL OF BLANK ROLLS OUT OF IT · JUMP IT"] },
    halvard: { 2: ["FORM THE LINE", "PHASE 2 · TWO LANCES · THE LINE CHARGES DOWN A RED LANE · STEP OUT OF IT"], 3: ["THE SHIELD SPLITS", "PHASE 3 · NO GUARD · HIS THRUST COMES TWICE"] },
    varka: { 2: ["THE IRONSONG ROLLS", "PHASE 2 · SHE'S ON THE DECK · JUMP ON, OR THE STEPS AT THE BACK · OR BREAK THE ENGINE"], 3: ["THE ENGINE BREAKS", "PHASE 3 · THE DECK COMES DOWN IN PIECES · WATCH THE RINGS"],
      4: ["RAILGUN", "PHASE 4 · SHE FIRES HERSELF DOWN THE FIELD · DODGE"] },
  };
  // Strikes from above (Thunderheads, falling wreckage) and the siege engine's lane: warnings on the ground first.
  const groundFx = (() => {
    const strikes = new Map(), lanes = [];
    const thunderMat = glow(scene, "strikeThunder", "#9ad8ff", 0.28, true), debrisMat = glow(scene, "strikeDebris", "#ff7a3a", 0.3, true), laneMat = glow(scene, "laneMat", "#ff3a2a", 0.22, true);
    const sunMat = glow(scene, "strikeSun", "#ffd36a", 0.3, true); // the Paragon's light
    const sealMat = glow(scene, "strikeSeal", "#d8263a", 0.32, true); // the Crimson Bell's Binding Seal
    return {
      warn(s) {
        if (s.kind === "gold") { // a golden door opening in the floor under you (the Drop)
          const t = makeDoor(scene, "dropWarn", { w: s.r * 1.6, h: s.r * 2.2, ground: true });
          t.position.set(s.x, 0.06, s.z); t.scaling.setAll(0.2); strikes.set(s, t); sfx.play("door", 0.5); return;
        }
        if (s.kind === "rift" || s.kind === "sever") { // the floor opening: a tear in the ground (pale: Wraithe; black: the masked knight), not a ring
          const black = s.kind === "sever";
          const t = makeTear(scene, "riftWarn", { r: s.r, kind: black ? "black" : "pale", seed: Math.round(s.x * 31 + s.z * 17), ground: true });
          t.position.set(s.x, 0.05, s.z); t.scaling.setAll(0.2); strikes.set(s, t); sfx.play(black ? "tear" : "rift", 0.5); return;
        }
        if (s.kind === "seal") { // a square of red paper laid on the floor under you, turned a little, closing
          const p = BB.MeshBuilder.CreatePlane("sealWarn", { size: s.r * 1.7, sideOrientation: BB.Mesh.DOUBLESIDE }, scene); p.rotation.set(Math.PI / 2, (s.x * 7 + s.z * 3) % Math.PI, 0);
          p.position.set(s.x, 0.05, s.z); p.material = sealMat; p.isPickable = false; p.scaling.setAll(0.2); strikes.set(s, p); sfx.play("glint", 0.5); return;
        }
        const d = BB.MeshBuilder.CreateDisc("strikeWarn", { radius: s.r, tessellation: 28 }, scene); d.rotation.x = Math.PI / 2; d.position.set(s.x, (s.y || 0) + 0.05, s.z); // (on the deck, if that's where it's falling)
        d.material = s.kind === "debris" ? debrisMat : s.kind === "sun" ? sunMat : thunderMat; d.isPickable = false; d.scaling.setAll(0.2); strikes.set(s, d);
      },
      hit(s) {
        strikes.get(s)?.dispose(); strikes.delete(s);
        const at = { x: s.x, y: (s.y || 0) + 0.1, z: s.z };
        if (s.kind === "rift") { vfx.flash({ x: s.x, y: 0.3, z: s.z }, 1.8, "#f0ecff", 0.12); sfx.play("rift", 0.8); return; } // it seals
        if (s.kind === "sever") { vfx.flash({ x: s.x, y: 0.3, z: s.z }, 1.8, "#9cb8ff", 0.12); sfx.play("tear", 0.8); return; }
        if (s.kind === "gold") { vfx.flash({ x: s.x, y: 0.3, z: s.z }, 1.8, "#ffd36a", 0.12); sfx.play("door", 0.8); return; }
        if (s.kind === "seal") { vfx.ring(at, s.r * 2, "#ff4a5a", 0.25); vfx.flash({ x: s.x, y: 0.6, z: s.z }, 1.6, "#ff6a6a", 0.1); sfx.play("block", 0.6); return; }
        if (s.kind === "debris") { vfx.ring(at, s.r * 2.2, "#ff9a5a", 0.3); vfx.sparksAt({ x: s.x, y: 0.4, z: s.z }, 10, "gold", 8, 6); vfx.flash({ x: s.x, y: 0.8, z: s.z }, 2.2, "#ffb070", 0.12); sfx.play("slam", 0.55); }
        else { vfx.pillar(at, 6, 0.35); vfx.flash({ x: s.x, y: 1.4, z: s.z }, 2.6, "#cfeaff", 0.1); vfx.sparksAt({ x: s.x, y: 0.5, z: s.z }, 10, "white", 9, 5); sfx.play("ultActivate", 0.5); }
        camera.shake(0.18);
      },
      lane(from, to, half) {
        const len = Math.hypot(to.x - from.x, to.z - from.z), m = BB.MeshBuilder.CreateBox("engineLane", { width: half * 2, height: 0.04, depth: len + 3 }, scene);
        m.position.set((from.x + to.x) / 2, 0.05, (from.z + to.z) / 2); m.rotation.y = Math.atan2(to.x - from.x, to.z - from.z); m.material = laneMat; m.isPickable = false; lanes.push(m);
      },
      clearLanes() { for (const m of lanes) m.dispose(); lanes.length = 0; },
      update(dt) { for (const [s, d] of strikes) { const k = 1 - s.t / s.delay; d.scaling.setAll(0.2 + 0.8 * Math.min(1, k * 1.3)); if (d.material) d.material.alpha = 0.18 + 0.25 * k; } },
      clear() { for (const d of strikes.values()) d.dispose(); strikes.clear(); this.clearLanes(); },
    };
  })();
  const tearFx = new TearFx(scene); // Wraithe's pale tears in the air, the masked knight's black ones
  let mouthTears = [], lineWall = null; // the knight's P3 tears in the room's mouths, and his Sever Line
  // Severin Eclipsed's dark stars: a slow violet whirl on the ground and a black star at its heart, for as long as the well lasts.
  const darkFx = (() => {
    const live = new Map(), whirl = glow(scene, "darkWhirl", "#5a2a8a", 0.32, true), core = glow(scene, "darkCore", "#140a24"), rim = glow(scene, "darkRim", "#c9a4ff", 0.9, true);
    return {
      open(w, r) {
        const n = new BB.TransformNode("darkStar", scene); n.position.set(w.x, 0, w.z);
        const d = BB.MeshBuilder.CreateDisc("darkWhirl", { radius: r, tessellation: 7 }, scene); d.rotation.x = Math.PI / 2; d.position.y = 0.05; d.material = whirl; d.parent = n; d.isPickable = false;
        const c = BB.MeshBuilder.CreatePolyhedron("darkCore", { type: 1, size: 0.45 }, scene); c.position.y = 1.2; c.material = core; c.parent = n; c.isPickable = false;
        const ring = BB.MeshBuilder.CreateTorus("darkRing", { diameter: 2, thickness: 0.06, tessellation: 24 }, scene); ring.position.y = 0.08; ring.material = rim; ring.parent = n; ring.isPickable = false;
        live.set(w, { n, d, c, ring });
      },
      close(w) { live.get(w)?.n.dispose(false, false); live.delete(w); },
      update(dt, t) { for (const { d, c, ring } of live.values()) { d.rotation.y += dt * 1.6; c.rotation.y += dt * 2.4; c.position.y = 1.2 + Math.sin(t * 3) * 0.08; ring.scaling.setAll(0.8 + 0.2 * Math.sin(t * 5)); } },
      clear() { for (const { n } of live.values()) n.dispose(false, false); live.clear(); },
    };
  })();
  // Annotation: anything Rook's ink has written on carries a small ring of ink over its head while it lasts.
  const inkMarks = new Map(), inkMat = glow(scene, "inkMark", "#5a7ad8", 0.85, true);
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

  // Gullmaw's Lily Pad Leap: lily pads afloat on magic circles, lines from the centre pad to each of the six around it.
  const lilyFx = (() => {
    let pads = [], lines = [], t = 0;
    const MB = () => BB.MeshBuilder;
    const leafMat = toon(scene, "lilyLeaf", "#3f8a3a"), circleMat = glow(scene, "lilyCircle", "#7dffb0", 0.85), runeMat = glow(scene, "lilyRune", "#c8ffd8", 0.6, true),
      warnMat = glow(scene, "lilyWarn", "#ff3a3a", 0.0, true), lineMat = glow(scene, "lilyLine", "#7dffb0", 0.55, true), flowerMat = glow(scene, "lilyFlower", "#ff9ad0", 0.9);
    warnMat.alpha = 0.35;
    const pad = (at, big) => {
      const node = new BB.TransformNode("lilyPad", scene); node.position.set(at.x, 0.04, at.z);
      const r = big ? 1.9 : 1.5;
      const leaf = MB().CreateDisc("lilyLeaf", { radius: r * 0.82, tessellation: 24, arc: 0.92 }, scene); leaf.rotation.x = Math.PI / 2; leaf.parent = node; leaf.material = leafMat; leaf.position.y = 0.02;
      const ring = MB().CreateTorus("lilyRing", { diameter: r * 2, thickness: 0.07, tessellation: 32 }, scene); ring.parent = node; ring.material = circleMat;
      const rune = MB().CreateTorus("lilyRune", { diameter: r * 1.55, thickness: 0.035, tessellation: 6 }, scene); rune.parent = node; rune.material = runeMat; rune.position.y = 0.03; // a hexagram-ish inner ring
      const rune2 = MB().CreateTorus("lilyRune2", { diameter: r * 1.55, thickness: 0.035, tessellation: 6 }, scene); rune2.parent = node; rune2.material = runeMat; rune2.position.y = 0.03; rune2.rotation.y = Math.PI / 6;
      const flower = MB().CreateSphere("lilyFlower", { diameter: 0.32, segments: 6 }, scene); flower.parent = node; flower.material = flowerMat; flower.position.set(r * 0.35, 0.12, -r * 0.3); flower.scaling.y = 0.6;
      const warn = MB().CreateDisc("lilyWarn", { radius: r, tessellation: 28 }, scene); warn.rotation.x = Math.PI / 2; warn.parent = node; warn.material = warnMat; warn.position.y = 0.05; warn.setEnabled(false);
      for (const m of [leaf, ring, rune, rune2, flower, warn]) m.isPickable = false;
      return { node, ring, rune, rune2, warn, at, big, hot: 0, done: false };
    };
    return {
      mark(center, outer) {
        this.clear();
        pads = [pad(center, true), ...outer.map((o) => pad(o, false))];
        for (const o of outer) { // the web: a glowing line from the centre to each pad
          const dx = o.x - center.x, dz = o.z - center.z, len = Math.hypot(dx, dz);
          const l = MB().CreateBox("lilyLine", { width: 0.09, height: 0.02, depth: Math.max(0.1, len - 3.2) }, scene);
          l.position.set((o.x + center.x) / 2, 0.05, (o.z + center.z) / 2); l.rotation.y = Math.atan2(dx, dz); l.material = lineMat; l.isPickable = false; lines.push(l);
        }
        for (const p of pads) { vfx.ring({ x: p.at.x, y: 0.08, z: p.at.z }, p.big ? 4 : 3.2, "#7dffb0", 0.5, true); vfx.sparksAt({ x: p.at.x, y: 0.3, z: p.at.z }, 6, "mint", 5, 4); }
      },
      target(to) { const p = pads.find((q) => !q.done && Math.hypot(q.at.x - to.x, q.at.z - to.z) < 0.3); if (p) { p.hot = 1; p.warn.setEnabled(true); } },
      smash(at, last) {
        const p = pads.find((q) => !q.done && Math.hypot(q.at.x - at.x, q.at.z - at.z) < 0.3);
        if (p) { p.done = true; p.warn.setEnabled(false); p.node.scaling.setAll(1.25); }
        const g = { x: at.x, y: 0.1, z: at.z };
        vfx.ring(g, last ? 7 : 5, "#7dffb0", 0.4); vfx.ring(g, last ? 4.5 : 3, "#ffffff", 0.22);
        vfx.flash({ x: at.x, y: 0.6, z: at.z }, last ? 3.4 : 2.4, "#c8ffe0", 0.14);
        vfx.sparksAt({ x: at.x, y: 0.3, z: at.z }, last ? 22 : 12, "mint", last ? 11 : 8, 5); vfx.sparksAt({ x: at.x, y: 0.3, z: at.z }, 8, "white", 7, 6);
      },
      update(dt) {
        if (!pads.length) return;
        t += dt;
        for (const p of pads) {
          p.rune.rotation.y += dt * 1.2; p.rune2.rotation.y -= dt * 0.9; p.ring.scaling.setAll(1 + Math.sin(t * 5 + p.at.x) * 0.03);
          if (p.done) { p.node.scaling.scaleInPlace(Math.max(0, 1 - dt * 3)); }
          if (p.hot > 0) { warnMat.alpha = 0.25 + Math.abs(Math.sin(t * 30)) * 0.4; }
        }
      },
      clear() { for (const p of pads) p.node.dispose(); for (const l of lines) l.dispose(); pads = []; lines = []; },
    };
  })();
  // Hask's reed beds (its submerge points): reeds and cattails round a patch of black water. Burnt, they're charred stalks.
  const reedFx = (() => {
    let beds = [], t = 0;
    const MB = () => BB.MeshBuilder;
    const reedMat = toon(scene, "reedStalk", "#6a7a3a"), tailMat = toon(scene, "reedTail", "#5a3a22"), waterMat = toon(scene, "reedWater", "#1e2a22"),
      charMat = toon(scene, "reedChar", "#1a1612"), fireMat = glow(scene, "reedFire", "#ff8a2a", 0.9, true);
    const bed = (b) => {
      const node = new BB.TransformNode("reedBed", scene); node.position.set(b.x, 0, b.z);
      const water = MB().CreateDisc("reedWater", { radius: b.r * 0.95, tessellation: 20 }, scene); water.rotation.x = Math.PI / 2; water.position.y = 0.03; water.parent = node; water.material = waterMat;
      const stalks = [];
      for (let i = 0; i < 26; i++) { // golden-angle scatter: even, never in a grid
        const a = i * 2.399, d = b.r * Math.sqrt((i + 0.5) / 26) * 0.92, h = 1.1 + ((i * 37) % 7) * 0.12;
        const st = MB().CreateCylinder("reed", { height: h, diameterTop: 0.02, diameterBottom: 0.05, tessellation: 4 }, scene);
        st.position.set(Math.sin(a) * d, h / 2, Math.cos(a) * d); st.rotation.set(Math.sin(i) * 0.12, 0, Math.cos(i * 1.7) * 0.12); st.parent = node; st.material = reedMat;
        if (i % 3 === 0) { const tail = MB().CreateCylinder("cattail", { height: 0.22, diameter: 0.07, tessellation: 5 }, scene); tail.parent = st; tail.position.y = h / 2 - 0.12; tail.material = tailMat; }
        stalks.push(st);
      }
      const fire = MB().CreateDisc("reedFire", { radius: b.r, tessellation: 22 }, scene); fire.rotation.x = Math.PI / 2; fire.position.y = 0.06; fire.parent = node; fire.material = fireMat; fire.setEnabled(false);
      for (const m of [water, fire, ...stalks]) m.isPickable = false;
      return { node, stalks, fire, at: b, burning: false, burnt: false };
    };
    return {
      lay(list) { this.clear(); beds = list.map(bed); },
      burn(b) {
        const r = beds.find((q) => q.at.i === b.i); if (!r) return;
        r.burning = true; r.fire.setEnabled(true);
        for (const st of r.stalks) { st.material = charMat; for (const c of st.getChildren()) c.material = charMat; }
        vfx.flash({ x: b.x, y: 0.8, z: b.z }, b.r * 2.2, "#ffb04a", 0.25); vfx.ring({ x: b.x, y: 0.08, z: b.z }, b.r * 2.4, "#ff8a2a", 0.4);
      },
      out(b) { const r = beds.find((q) => q.at.i === b.i); if (r) { r.burning = false; r.burnt = true; r.fire.setEnabled(false); } },
      update(dt) {
        if (!beds.length) return;
        t += dt;
        for (const r of beds) {
          if (!r.burning) continue;
          for (const st of r.stalks) if (st.scaling.y > 0.45) st.scaling.y -= dt * 0.08; // burning down
          r.fire.scaling.setAll(0.85 + Math.abs(Math.sin(t * 9 + r.at.x)) * 0.15);
          fireMat.alpha = 0.35 + Math.abs(Math.sin(t * 13)) * 0.25;
          if (Math.random() < dt * 14) { const a = Math.random() * 6.28, d = Math.random() * r.at.r; vfx.sparksAt({ x: r.at.x + Math.sin(a) * d, y: 0.4, z: r.at.z + Math.cos(a) * d }, 2, Math.random() < 0.5 ? "gold" : "red", 3, 7); }
        }
      },
      clear() { for (const r of beds) r.node.dispose(); beds = []; },
    };
  })();
  // The Cantor Twins' smoke (Ep 15, P3): slow grey banks drifting over the floor round where they stand.
  const smokeFx = (() => {
    let puffs = [], t = 0;
    const mat = new BB.StandardMaterial("twinSmoke", scene); // dull and grey: smoke, not light
    mat.diffuseColor = BB.Color3.FromHexString("#5a5a68"); mat.emissiveColor = BB.Color3.FromHexString("#2a2a34"); mat.specularColor = BB.Color3.Black(); mat.alpha = 0.3;
    return {
      up(c, r) {
        this.clear();
        for (let i = 0; i < 22; i++) {
          const a = i * 2.399, d = r * Math.sqrt((i + 0.5) / 22), m = BB.MeshBuilder.CreateSphere("smokePuff", { diameter: 2.6 + (i % 4) * 0.5, segments: 6 }, scene);
          m.material = mat; m.isPickable = false; m.metadata = { noGlow: true }; m.scaling.y = 0.45;
          const p = { m, x: c.x + Math.sin(a) * d, z: c.z + Math.cos(a) * d, ph: i * 0.7, life: 0 };
          m.position.set(p.x, 0.7 + (i % 3) * 0.35, p.z); puffs.push(p);
        }
      },
      update(dt) {
        if (!puffs.length) return;
        t += dt;
        for (const p of puffs) { p.life = Math.min(1, p.life + dt * 1.5); p.m.position.x = p.x + Math.sin(t * 0.4 + p.ph) * 0.8; p.m.position.z = p.z + Math.cos(t * 0.33 + p.ph) * 0.8; p.m.scaling.x = p.m.scaling.z = p.life * (1 + Math.sin(t + p.ph) * 0.08); }
        mat.alpha = 0.3 + Math.sin(t * 0.8) * 0.04;
      },
      clear() { for (const p of puffs) p.m.dispose(); puffs = []; },
    };
  })();
  // The Hollow Bloom's holes (Ep 18, P2): blank white ground with a torn grey edge, like a page with a hole in it.
  const holeFx = (() => {
    const live = new Map(), blank = toon(scene, "holeBlank", "#fbfaff"), edge = toon(scene, "holeEdge", "#2e2a38"); // flat white, a dark torn edge (the Hollowmarch is near-white already)
    return {
      open(h) {
        const n = new BB.TransformNode("bloomHole", scene); n.position.set(h.x, 0, h.z);
        const d = BB.MeshBuilder.CreateDisc("holeBlank", { radius: h.r, tessellation: 9 }, scene); d.rotation.x = Math.PI / 2; d.position.y = 0.05; d.material = blank; d.parent = n;
        const r = BB.MeshBuilder.CreateTorus("holeEdge", { diameter: h.r * 2, thickness: 0.24, tessellation: 9 }, scene); r.position.y = 0.06; r.material = edge; r.parent = n;
        const r2 = BB.MeshBuilder.CreateTorus("holeEdge2", { diameter: h.r * 1.55, thickness: 0.05, tessellation: 9 }, scene); r2.position.y = 0.07; r2.rotation.y = 0.35; r2.material = edge; r2.parent = n;
        for (const m of [d, r, r2]) { m.isPickable = false; m.metadata = { noGlow: true }; }
        n.scaling.setAll(0.2); live.set(h, { n, grow: 0 });
      },
      close(h) { const e = live.get(h); if (e) { e.closing = 1; } },
      update(dt) {
        for (const [h, e] of live) {
          if (e.closing) { e.closing -= dt * 3; e.n.scaling.setAll(Math.max(0.01, e.closing)); if (e.closing <= 0) { e.n.dispose(); live.delete(h); } continue; }
          e.grow = Math.min(1, e.grow + dt * 5); e.n.scaling.setAll(0.2 + 0.8 * e.grow); e.n.rotation.y += dt * 0.15;
        }
      },
      clear() { for (const e of live.values()) e.n.dispose(); live.clear(); },
    };
  })();
  // Inside the Bloom's petals (P3): a village burning, long ago, standing round you for a few seconds.
  const memoryFx = (() => {
    let nodes = [], t = 0, on = false;
    const wall = toon(scene, "memWall", "#3a2a22"), roof = toon(scene, "memRoof", "#1e1612"), fire = glow(scene, "memFire", "#ff9a3a", 0.9);
    return {
      begin(at) {
        this.end(); on = true; root.classList.add("memory");
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 + 0.3, d = 13 + (i % 3) * 2.5, n = new BB.TransformNode("memHouse", scene);
          n.position.set(at.x + Math.sin(a) * d, 0, at.z + Math.cos(a) * d); n.rotation.y = a + Math.PI;
          const h = BB.MeshBuilder.CreateBox("memHouseW", { width: 4, height: 3, depth: 3.2 }, scene); h.position.y = 1.5; h.material = wall; h.parent = n;
          const r = BB.MeshBuilder.CreateCylinder("memHouseR", { height: 4.4, diameter: 3.6, tessellation: 3 }, scene); r.position.y = 3.6; r.rotation.z = Math.PI / 2; r.scaling.set(1, 1, 0.8); r.material = roof; r.parent = n;
          const f = BB.MeshBuilder.CreateSphere("memFlame", { diameter: 1.6, segments: 6 }, scene); f.position.set(0, 4.6, 0); f.scaling.y = 1.6; f.material = fire; f.parent = n;
          for (const m of [h, r, f]) m.isPickable = false;
          n.scaling.setAll(0.01); nodes.push({ n, f, ph: i });
        }
        sfx.play("cry", 0.8);
      },
      update(dt) {
        if (!nodes.length) return;
        t += dt;
        for (const e of nodes) {
          const k = on ? Math.min(1, e.n.scaling.x + dt * 1.6) : Math.max(0, e.n.scaling.x - dt * 2.5);
          e.n.scaling.setAll(Math.max(0.01, k)); e.f.scaling.set(1 + Math.sin(t * 9 + e.ph) * 0.15, 1.6 + Math.sin(t * 7 + e.ph) * 0.3, 1);
          if (on && Math.random() < dt * 3) vfx.sparksAt({ x: e.n.position.x, y: 4.5, z: e.n.position.z }, 3, Math.random() < 0.5 ? "gold" : "red", 3, 6);
        }
        if (!on && nodes.every((e) => e.n.scaling.x <= 0.011)) this.end();
      },
      fade() { on = false; root.classList.remove("memory"); },
      end() { for (const e of nodes) e.n.dispose(); nodes = []; on = false; root.classList.remove("memory"); },
    };
  })();
  const shatter = (f, at) => { vfx.sparksAt(at, 18, "white", 9, 5); vfx.sparksAt(at, 8, "violet", 7, 4); vfx.flash(at, 1.8, "#e8eeff", 0.1); sfx.play("block", 0.8); removeView(f); if (hud.focus === f) hud.focus = null; };
  const hopGhostMat = glow(scene, "hopGhost", "#8affc8", 0.3, true);
  // Threshold (Ep 18): a golden door standing up between Rook and the Bloom, for as long as it holds.
  const doorFx = (() => {
    const live = new Map();
    return {
      open(z) {
        const d = makeDoor(scene, "threshold", { w: 2.6, h: 3.2 }); d.position.set(z.pos.x, z.pos.y + 1.7, z.pos.z); d.rotation.y = z.yaw; d.scaling.set(0.2, 1, 1);
        live.set(z, d); vfx.flash({ x: z.pos.x, y: z.pos.y + 1.6, z: z.pos.z }, 3.2, "#ffd36a", 0.2); sfx.play("door");
      },
      close(z) { const d = live.get(z); if (!d) return; live.delete(z); vfx.sparksAt({ x: z.pos.x, y: z.pos.y + 1.6, z: z.pos.z }, 10, "gold", 5, 2); d.dispose(); },
      update(dt) { for (const [z, d] of live) { d.scaling.x = Math.min(1, d.scaling.x + dt * 6); const k = z.frames / z.max; d.getChildMeshes().forEach((m) => { m.visibility = 0.35 + 0.65 * Math.min(1, k * 4); }); } },
      clear() { for (const d of live.values()) d.dispose(); live.clear(); },
    };
  })();
  // The Bloom's last moment (Ep 18's hold): white light swelling at its heart, and two lines of gold holding it shut.
  const holdFx = (() => {
    let core = null, beams = [], on = false;
    const white = glow(scene, "holdWhite", "#ffffff", 0.75, true), gold = glow(scene, "holdGold", "#ffd36a", 0.8, true);
    const beam = (name) => { const m = BB.MeshBuilder.CreateCylinder(name, { height: 1, diameter: 0.22, tessellation: 8 }, scene); m.material = gold; m.isPickable = false; return m; };
    const stretch = (m, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, L = Math.hypot(dx, dy, dz) || 1; m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.scaling.set(1, L, 1);
      m.rotation.set(Math.acos(Math.max(-1, Math.min(1, dy / L))), Math.atan2(dx, dz), 0); };
    return {
      begin() { on = true; core = BB.MeshBuilder.CreateSphere("holdCore", { diameter: 1, segments: 16 }, scene); core.material = white; core.isPickable = false; beams = [beam("holdBeamA"), beam("holdBeamB")]; },
      end() { on = false; core?.dispose(); core = null; for (const b of beams) b.dispose(); beams = []; },
      update(t) {
        if (!on) return;
        const bloom = world.headline, g = world.gauge;
        if (!bloom || !g?.hold) return;
        const c = { x: bloom.pos.x, y: 2.4, z: bloom.pos.z }, k = g.value;
        core.position.set(c.x, c.y, c.z); core.scaling.setAll(3.6 - k * 2.4 + Math.sin(t * (g.held ? 9 : 22)) * (g.held ? 0.12 : 0.35)); // it swells when you let go
        const holders = [world.player, world.companions.find((m) => m.assistInPlace && m.alive)].filter(Boolean);
        beams.forEach((m, i) => { const h = holders[i]; m.setEnabled(!!h && (i > 0 || g.held)); if (h) stretch(m, { x: h.pos.x, y: h.pos.y + 1.3, z: h.pos.z }, c); });
      },
    };
  })();
  // B3 P2: the choir pit, a dark hollow ringed with pale light, where she sings from out of reach.
  const pitFx = (() => {
    let disc = null, rim = null;
    const dark = glow(scene, "pitDark", "#14101e"), pale = glow(scene, "pitRim", "#c9b4ff", 0.8, true);
    return {
      open(at, r) {
        this.close();
        disc = BB.MeshBuilder.CreateDisc("choirPit", { radius: r, tessellation: 28 }, scene); disc.rotation.x = Math.PI / 2; disc.position.set(at.x, 0.04, at.z); disc.material = dark; disc.isPickable = false;
        rim = BB.MeshBuilder.CreateTorus("choirPitRim", { diameter: r * 2, thickness: 0.08, tessellation: 32 }, scene); rim.position.set(at.x, 0.06, at.z); rim.material = pale; rim.isPickable = false;
      },
      close() { disc?.dispose(); rim?.dispose(); disc = rim = null; },
      update(t) { if (rim) rim.scaling.setAll(1 + Math.sin(t * 4) * 0.03); },
    };
  })();
  // B4's Final: the page's mark on the seal you must hit (an ink ring round it, turning, until it breaks).
  const inkMarkFx = (() => {
    let mark = null, target = null;
    const ink = glow(scene, "inkMarkMat", "#1a1430", 0.85, true);
    return {
      on(t) { this.off(); target = t; mark = BB.MeshBuilder.CreateTorus("inkMark", { diameter: 2.4, thickness: 0.12, tessellation: 28 }, scene); mark.material = ink; mark.isPickable = false; },
      off() { mark?.dispose(); mark = null; target = null; },
      update(t) { if (!mark) return; if (!target?.alive) { this.off(); return; } mark.position.set(target.pos.x, 0.12 + Math.sin(t * 3) * 0.05, target.pos.z); mark.rotation.y = t * 1.5; mark.scaling.setAll(1 + Math.sin(t * 5) * 0.06); },
    };
  })();
  resetBossFx = () => { pitFx.close(); inkMarkFx.off(); doorFx.clear(); holdFx.end(); silenceFx.clear(); waterJet.stop(); lilyFx.clear(); reedFx.clear(); smokeFx.clear(); holeFx.clear(); memoryFx.end(); groundFx.clear(); tearFx.clear(); mouthTears = []; lineWall?.dispose(); lineWall = null; darkFx.clear();
    for (const m of inkMarks.values()) m.dispose(); inkMarks.clear(); root.classList.remove("leaping", "hopblur", "surge-locked"); };

  // Squad HQ: the board (rooms to build) and the workbench (tempering gear). One screen, two modes.
  const hqModal = root.querySelector("[data-hq]");
  let hqDone = null, hqKind = "hq";
  const costText = (marks, mats) => [`${marks} Marks`, ...Object.entries(mats ?? {}).map(([id, n]) => `${n} ${MATERIALS[id].name}`)].join(" · ");
  const renderHQ = () => {
    const cr = story.crafting, inv = story.inventory;
    hqModal.querySelector("[data-hq-mats]").innerHTML = Object.entries(MATERIALS).map(([id, m]) => `<b>${m.name}</b> ×${cr.count(id)}`).join(" · ") + ` · <b>Marks</b> ${inv.marks}`;
    const list = hqModal.querySelector("[data-hq-list]");
    if (hqKind === "hq") {
      hqModal.querySelector("[data-hq-title]").textContent = "SQUAD BOARD · CONTRACTS & HQ ROOMS";
      hqModal.querySelector("[data-hq-sub]").textContent = `Squad Merit: ${story.flags.get("MERIT") || 0}. Contracts pay in Merit and Marks; rooms need the squad's standing (Merit is never spent), plus Marks and materials.`;
      // Squad Contracts (§18.1): today's three, one taken at a time; a higher Knight Rank opens harder tiers (§17).
      const board = story.contracts.board(story.day), taken = story.contracts.active, kr = rankOf(story.flags);
      const contractRows = `<h3>SQUAD CONTRACTS · DAY ${story.day}${Number(story.flags.get("CONTRACTS_DONE")) ? ` · ${story.flags.get("CONTRACTS_DONE")} done` : ""}</h3>` +
        (taken && !board.some((o) => o.active) ? `<div class="row built"><b>T${taken.tier}</b><span>${taken.title} <em>taken on day ${taken.day}</em><small>${taken.text}</small><small>${ZONES[taken.site.zone].name}: ${taken.site.spot}.</small></span><span class="act"><button class="go alt" data-ct-drop>DROP</button></span></div>` : "") +
        (board.length ? board.map((o) => `<div class="row${o.done ? " built" : ""}"><b>T${o.tier}</b><span>${o.title}<small>${o.text}</small><small>${ZONES[o.site.zone].name}: ${o.site.spot} · ${o.wave.length} foes · pays ${o.merit} Merit, ${o.marks} Marks</small></span>
          <span class="act">${o.done ? "✓" : o.active ? `<button class="go alt" data-ct-drop>DROP</button>` : `<button class="go" data-ct-take="${o.i}" ${taken ? "disabled" : ""}>${taken ? "ONE AT A TIME" : "TAKE IT"}</button>`}</span></div>`).join("")
          : `<p class="hint">Nothing on the board yet. The first contracts go up once the squad's been somewhere (after your first mission).</p>`) +
        (kr < 4 ? `<p class="hint">Tier ${kr + 2} contracts go up for a ${KNIGHT_RANKS[kr + 1].name}: promotion exams at the Exam Grounds.</p>` : "") + "<h3>HQ ROOMS</h3>";
      list.innerHTML = contractRows + Object.entries(HQ).map(([id, r]) => {
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
    for (const b of list.querySelectorAll("[data-ct-take]")) b.addEventListener("click", () => { const o = story.contracts.accept(story.day, Number(b.dataset.ctTake)); if (o) { sfx.play("ui"); hud.toast(`CONTRACT TAKEN · ${ZONES[o.site.zone].name.toUpperCase()}`, "clear"); story.saveNow(); } renderHQ(); });
    for (const b of list.querySelectorAll("[data-ct-drop]")) b.addEventListener("click", () => { story.contracts.abandon(); sfx.play("ui"); story.saveNow(); renderHQ(); });
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
      const atHQ = story.roaming && story.zone?.id === "lighthouse"; // re-branching is done at the Lighthouse (GDD §8.1)
      const choose = pg.ready ? def.branches.map((x) => `<button class="go" data-evolve="${slot}:${x.key}" title="${x.desc}">${x.name.toUpperCase()}</button>`).join(" ")
        : br && atHQ ? def.branches.filter((x) => x.key !== br.key).map((x) => `<button class="go alt" data-rebranch="${slot}:${x.key}" title="${x.desc}" ${story.inventory.marks < REBRANCH_MARKS ? "disabled" : ""}>RE-BRANCH: ${x.name.toUpperCase()} · ${REBRANCH_MARKS} MARKS</button>`).join(" ") : "";
      const notes = [br && !atHQ ? `re-branch at the Lighthouse (${REBRANCH_MARKS} Marks)` : "", lv >= 5 ? "PERFECT CAST: out of a blow that lands, right as it opens" : ""].filter(Boolean).join(" · ");
      return `<div class="row${pg.ready ? " ready" : ""}"><b>${PAGE_ROMAN[lv - 1]}</b><span>${br ? br.name : def.name}${locked ? " <em>not in this grimoire yet</em>" : ""}<small>${pg.ready ? "Ready to evolve: choose a branch" : br ? `Evolved from ${def.name}` : lv < 3 ? "Evolves at III" : ""}${b.dmg > 1 ? ` · +${Math.round((b.dmg - 1) * 100)}% damage` : ""}${b.mana < 1 ? ` · −${Math.round((1 - b.mana) * 100)}% mana` : ""}${notes ? `<br>${notes}` : ""}</small>${choose ? `<span class="evo">${choose}</span>` : ""}</span><span class="xpbar"><u style="width:${Math.round(pageLevelProgress(slot, pg.xp) * 100)}%"></u></span></div>`;
    }).join("");
    // The secret pages (GDD §8.4): found ones pinned two at a time in the margin; the rest a hint and a question mark.
    const sec = story.secrets, murals = Number(story.flags.get("MURALS")) || 0;
    grim.querySelector("[data-grim-secret-head]").textContent = `SECRET PAGES · ${sec.all.length} OF ${Object.keys(SECRET_PAGES).length} FOUND · TWO IN THE MARGIN`;
    grim.querySelector("[data-grim-secrets]").innerHTML = Object.entries(SECRET_PAGES).map(([id, pg]) => {
      if (!sec.found(id)) return `<div class="row"><b>?</b><span>A page you haven't found<small>${pg.hint}${id === "starChart" && murals ? ` (${murals} of ${SECRET_NEEDS.murals} found)` : ""}</small></span></div>`;
      const on = sec.pinned(id);
      return `<div class="row${on ? " ready" : ""}"><b>${on ? "✦" : "·"}</b><span>${pg.name}<small>${pg.desc}</small><small><em>${pg.how}</em></small></span><span class="act"><button class="go${on ? " alt" : ""}" data-pin="${id}">${on ? "UNPIN" : "PIN"}</button></span></div>`;
    }).join("");
    // The forbidden page and Corruption (GDD §8.3): shown once there's either.
    const cor = story.corruption.value, found = !!story.flags.get("FORBIDDEN_FOUND"), on = found && !!story.flags.get("FORBIDDEN_ON");
    const fHead = grim.querySelector("[data-grim-forbid-head]"), fList = grim.querySelector("[data-grim-forbidden]");
    fHead.hidden = fList.hidden = !found && cor <= 0;
    fHead.textContent = `FORBIDDEN · CORRUPTION ${cor} / ${CORRUPTION.max}`;
    fList.innerHTML = `<div class="row${on ? " ready" : ""}"><b>${cor}</b><span>Corruption<small>${cor >= 75 ? "The Hollow whispers when you fight." : cor >= 50 ? "The Crimson Bell knows your name." : cor >= 25 ? "People notice. Thornwick's children stay in when you're about." : "A clean page, or nearly."} It comes down slowly: a Verdant Oath shrine (Thornwick, once a day), Brother Moss's tea. At 100, the page goes blank.</small></span><span class="xpbar"><u style="width:${cor}%"></u></span></div>` +
      (found ? `<div class="row${on ? " ready" : ""}"><b>${on ? "✦" : "·"}</b><span>Hollow Bite <em>forbidden</em><small>Huge damage; deletes what's guarding a foe. Takes Wind Wall's button. Pinning it costs ${CORRUPTION.equip} Corruption, and every cast ${CORRUPTION.cast} more.</small></span><span class="act"><button class="go${on ? " alt" : ""}" data-forbid>${on ? "PUT IT AWAY" : "PIN IT"}</button></span></div>` : "");
    grim.querySelector("[data-forbid]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const now = !story.flags.get("FORBIDDEN_ON");
      story.flags.set("FORBIDDEN_ON", now ? 1 : 0);
      if (now) story.corrupt(CORRUPTION.equip);
      world.setForbidden(now); onEvents(world.drainEvents());
      for (const wb of root.querySelectorAll('[data-intent="Spell4"]')) wb.textContent = world.loadout.Spell4?.id === "HollowBite" ? "BITE" : "WALL";
      sfx.play(now ? "rift" : "ui"); story.saveNow(); renderGrimoire();
    });
    for (const btn of grim.querySelectorAll("[data-pin]")) btn.addEventListener("click", (e) => {
      e.stopPropagation();
      story.secrets.toggle(btn.dataset.pin); world.margin = new Set(story.secrets.margin);
      sfx.play("ui"); story.saveNow(); renderGrimoire();
    });
    for (const btn of grim.querySelectorAll("[data-rebranch]")) btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const [slot, key] = btn.dataset.rebranch.split(":");
      if (story.inventory.marks < REBRANCH_MARKS || !story.progress.rebranch(slot, key)) return;
      story.inventory.marks -= REBRANCH_MARKS;
      if (world.progress === story.progress) world.rebranchPage(slot, key); // (already set on the shared page: this swaps the button)
      onEvents(world.drainEvents()); sfx.play("ultActivate"); story.saveNow(); renderGrimoire();
    });
    grim.querySelector("[data-grim-pts]").textContent = `THE GRIMOIRE TREE · ${pr.points} SKILL POINT${pr.points === 1 ? "" : "S"}`;
    grim.querySelector("[data-grim-tree]").innerHTML = TREE_COLUMNS.map(({ col, name }) => `<div class="col"><b>${name}</b>${
      Object.values(SKILLS).filter((n) => n.col === col).map((n) => {
        const have = pr.skills.has(n.id), why = pr.blocker(n.id, rankOf(story.flags));
        return `<button data-learn="${n.id}" class="${have ? "have" : why ? "" : "can"}" ${have || why ? "disabled" : ""}><b>${n.name}</b><small>${n.desc}</small><em>${have ? "LEARNED" : why ? why.toUpperCase() : `LEARN · ${n.cost} PT${n.cost > 1 ? "S" : ""}`}</em></button>`;
      }).join("")}</div>`).join("");
    for (const btn of grim.querySelectorAll("[data-learn]")) btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!story.progress.learn(btn.dataset.learn, rankOf(story.flags))) return;
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
      `<button data-ep="${e.id}" ${(e.unlockAt ?? e.number) > reached ? "disabled" : ""}><b>${e.label ?? `EP ${e.number}`}</b><span>${(e.unlockAt ?? e.number) > reached ? "Locked" : e.title}<small>${e.arc ?? ""}</small></span></button>`).join("");
    for (const b of epList.querySelectorAll("[data-ep]")) b.addEventListener("click", () => {
      const last = saves.latest()?.save;
      closeSlots();
      story.player = last ? { name: last.player.name, pronouns: last.player.pronouns } : { name: "Rook", pronouns: "they" };
      story.flags.load(last?.flags ?? {});
      story.inventory = new Inventory(last?.inv); story.progress = new Progress(last?.prog);
      playStory(b.dataset.ep, 0);
    });
    // Lore Archive · Theatre: every timeline scene you've watched, to replay.
    const thList = slotsModal.querySelector("[data-theatre-list]"), thHead = slotsModal.querySelector("[data-theatre-head]");
    const scenes = theatreList();
    thList.hidden = thHead.hidden = saving || !scenes.some((x) => x.seen);
    thList.innerHTML = scenes.filter((x) => x.seen).map((x) => `<button data-scene="${x.id}"><b>EP ${x.episode}</b><span>${x.title}<small>${x.rewatched ? `Watched again ${x.rewatched}×` : "Replay · pause · slow motion · frame-step"}</small></span></button>`).join("");
    for (const b of thList.querySelectorAll("[data-scene]")) b.addEventListener("click", () => playTheatre(b.dataset.scene));
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
  // ---- The Theatre: replay a scene with the latest save's world (its cairns and wrecks), then back to this screen ----
  const theatreBar = root.querySelector("[data-theatre]");
  const playTheatre = async (id) => {
    closeSlots();
    const last = saves.latest()?.save;
    story.player = last ? { name: last.player.name, pronouns: last.player.pronouns } : { name: "Rook", pronouns: "they" };
    story.flags.load(last?.flags ?? {});
    playtest.rewatch(id);
    start("story");
    await story.replay(id);
    backToTitle();
    openSlots("load");
  };
  const showTheatre = (th) => {
    theatreBar.hidden = !th;
    if (!th) return;
    theatreBar.querySelector("[data-th-title]").textContent = `LORE ARCHIVE · ${(theatreList().find((x) => x.id === th.id)?.title ?? th.id).toUpperCase()}${th.notes.length ? " · ANNOTATED EDITION" : ""}`;
    theatreBar.querySelector('[data-th="pause"]').textContent = th.paused ? "▶" : "❚❚";
    for (const b of theatreBar.querySelectorAll('[data-th="speed"]')) b.setAttribute("aria-pressed", String(!th.paused && Number(b.dataset.v) === th.speed));
    theatreBar.querySelector("[data-th-cut]").textContent = th.cutLabel ?? ""; // a storyboarded scene: CUT 013 · FRAME 2/4
    const note = theatreBar.querySelector("[data-th-note]");
    note.hidden = !th.note; if (th.note) note.textContent = th.note.text;
  };
  for (const b of theatreBar.querySelectorAll("[data-th]")) b.addEventListener("click", (e) => { e.stopPropagation(); sfx.play("ui"); story.theatreControl(b.dataset.th, Number(b.dataset.v)); });
  // ---- The playtest kit: the end-of-arc survey (opt-in; core/playtest.js) ----
  const surveyModal = root.querySelector("[data-survey]");
  const openSurvey = (id) => new Promise((done) => {
    const S = SURVEYS[id];
    if (!S) { done(); return; }
    const body = surveyModal.querySelector("[data-sv-body]"), buttons = surveyModal.querySelector("[data-sv-buttons]");
    surveyModal.querySelector("[data-sv-title]").textContent = S.title;
    surveyModal.querySelector("[data-sv-intro]").textContent = S.intro;
    const close = () => { surveyModal.hidden = true; state.modal = false; done(); };
    const ask = () => {
      const pick = { guess: null, sure: null };
      body.innerHTML = `<p class="hint">${S.ask}</p><div class="survey-opts" data-g>${S.guesses.map((g, i) => `<button data-i="${i}">${g}</button>`).join("")}</div>
        <p class="hint">${S.howSure}</p><div class="survey-opts" data-s>${S.sure.map((g, i) => `<button data-i="${i}">${g}</button>`).join("")}</div>
        <textarea data-sv-own placeholder="In your own words (optional)"></textarea>`;
      for (const [sel, key, list] of [["[data-g]", "guess", S.guesses], ["[data-s]", "sure", S.sure]]) for (const b of body.querySelectorAll(`${sel} button`)) b.addEventListener("click", () => {
        pick[key] = list[Number(b.dataset.i)]; sfx.play("ui");
        for (const o of body.querySelectorAll(`${sel} button`)) o.setAttribute("aria-pressed", String(o === b));
      });
      buttons.innerHTML = `<button class="go" data-sv-send>SAVE ANSWERS</button><button class="go alt" data-sv-skip>SKIP</button>`;
      buttons.querySelector("[data-sv-send]").addEventListener("click", () => { playtest.survey(id, { ...pick, own: body.querySelector("[data-sv-own]").value.trim().slice(0, 600) }); hud.toast("THANK YOU", "clear"); close(); });
      buttons.querySelector("[data-sv-skip]").addEventListener("click", close);
    };
    if (playtest.optIn) ask();
    else {
      body.innerHTML = `<p class="hint">You've finished Arc 3. Would you like to help test the mystery? It's one question, it's optional, and nothing leaves this browser unless you copy it out of the Journal.</p>`;
      buttons.innerHTML = `<button class="go" data-sv-yes>YES, I'LL HELP</button><button class="go alt" data-sv-no>NO THANKS</button>`;
      buttons.querySelector("[data-sv-yes]").addEventListener("click", () => { playtest.setOptIn(true); sfx.play("ui"); ask(); });
      buttons.querySelector("[data-sv-no]").addEventListener("click", close);
    }
    surveyModal.hidden = false; state.modal = true;
  });
  startScreen.querySelector("[data-episodes]")?.addEventListener("click", (e) => { e.stopPropagation(); openSlots("load"); });
  menu("save", () => { if (state.mode === "story") openSlots("save"); });
  refreshContinue();
  const replay = (mode) => { results.hidden = true; state.modal = false; newWorld(); state.started = false; start(mode); };
  results.querySelector("[data-again]")?.addEventListener("click", () => replay("run"));
  results.querySelector("[data-yard]")?.addEventListener("click", () => replay("yard"));

  // Adaptive resolution: drop render resolution when frames run long, restore it when there's headroom. Battery Saver
  // (GDD §20.3) caps the frame rate at 30 and the resolution at one pixel per CSS pixel, and the targets move with it.
  const maxRatio = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
  const quality = {
    ratio: maxRatio, avg: 1 / 60, timer: 0, fps: 60, saver: false,
    get cap() { return this.saver ? Math.min(1, maxRatio) : maxRatio; },
    get target() { return this.saver ? 30 : 60; },
    set(r) { if (r !== this.ratio) { this.ratio = r; engine.setHardwareScalingLevel(1 / r); } },
    update(dt) {
      if (this.saver !== !!settings.battery) { this.saver = !!settings.battery; this.avg = 1 / this.target; this.timer = 0; this.set(this.cap); }
      this.avg += (dt - this.avg) * 0.05;
      this.fps = 1 / this.avg;
      this.timer += dt;
      if (this.timer < 2) return;
      this.timer = 0;
      let next = this.ratio;
      if (this.fps < this.target * 0.8) next = Math.max(0.6, this.ratio - 0.15);
      else if (this.fps > this.target * 0.965 && this.ratio < this.cap) next = Math.min(this.cap, this.ratio + 0.1);
      this.set(next);
    },
  };
  hud.quality = quality;

  let last = performance.now();
  // Camp skits (GDD §10): two portraits (an initial in each one's colour), the lines one at a time, a soft tick for the voice.
  const skitEl = root.querySelector("[data-skit]");
  let skitRun = null;
  const playSkit = (k, name) => {
    if (!skitEl) return;
    const id = (skitRun = {});
    const cast = skitEl.querySelector("[data-skit-cast]"), line = skitEl.querySelector("[data-skit-line]");
    skitEl.querySelector("[data-skit-title]").textContent = `SKIT · ${k.title}`;
    cast.replaceChildren(...k.cast.map((c) => { const i = document.createElement("i"); i.textContent = c[0].toUpperCase(); i.style.background = LOOKS[c]?.trail ?? "#ccc"; i.dataset.who = c; return i; }));
    let n = 0, wait = null;
    const show = () => {
      if (skitRun !== id) return;
      if (n >= k.lines.length) { skitEl.hidden = true; skitRun = null; return; }
      const [who, text] = k.lines[n++];
      const b = document.createElement("b"); b.textContent = who; // (a player's name is never markup)
      line.replaceChildren(b, document.createTextNode(text.replaceAll("{name}", name)));
      for (const i of cast.children) i.classList.toggle("on", i.dataset.who === who.toLowerCase());
      sfx.play("click", 0.5); // the voice placeholder
      clearTimeout(wait); wait = setTimeout(show, Math.max(2600, text.length * 55));
    };
    skitEl.onclick = () => { clearTimeout(wait); show(); };
    skitEl.hidden = false; show();
  };

  // Corruption 75 (GDD §8.3): the Hollow whispers in your fights. The picture frays at the edges; now and then, a word.
  const whisperEl = root.querySelector("[data-whisper]");
  const WHISPERS = ["write nothing", "let it go blank", "you were never written", "rest", "unmake it", "nobody would remember"];
  let whisperT = 6, whisperI = 0;
  const whispers = (dt) => {
    const on = state.mode === "story" && (world.corruption ?? 0) >= 75 && world.liveEnemies.length > 0;
    root.classList.toggle("whispers", on);
    if (!on) { whisperEl?.classList.remove("on"); return; }
    if ((whisperT -= dt) <= 0) {
      whisperT = 9 + Math.random() * 5;
      if (whisperEl) { whisperEl.textContent = WHISPERS[whisperI++ % WHISPERS.length]; whisperEl.classList.add("on"); later(2.2, () => whisperEl.classList.remove("on")); }
    }
  };

  engine.runRenderLoop(() => {
    const now = performance.now();
    if (settings.battery && now - last < 1000 / 30 - 4) return; // Battery Saver (GDD §20.3): 30 frames a second; the 60 Hz fight clock catches up in whole steps, so the fight is the same
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    state.time += dt;
    grade.update(dt);
    whispers(dt);

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
        if (cmd === "assist:third") story.choose(2); // (3 on a keyboard; D-pad up only moves the cursor)
        if (cmd === "help") toggleHelp();
        if (cmd === "pause") { if (state.help) toggleHelp(false); else state.paused = !state.paused; root.classList.toggle("paused", state.paused); }
        continue;
      }
      if (state.mode === "story" && (cmd === "boss" || cmd === "reset")) continue; // sandbox shortcuts are off in the story
      if (cmd === "confirm" && story.exploring?.near) { story.interact(); continue; }
      if (cmd === "steal" && story.roaming) { story.law.action(); continue; } // X: pickpocket, or surrender to the Watch
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

    pitFx.update(state.time); inkMarkFx.update(state.time); doorFx.update(dt); holdFx.update(state.time); waterJet.update(); lilyFx.update(dt); reedFx.update(dt); smokeFx.update(dt); holeFx.update(dt); memoryFx.update(dt); groundFx.update(dt); tearFx.update(dt);
    if (world.boss?.boss?.leap) { // motion blur on the hops: a trail of fading ghosts of Gullmaw
      state.hopGhost = (state.hopGhost ?? 0) - dt;
      if (state.hopGhost <= 0) { const rig = viewFor(world.boss); if (rig?.snapshot && settings.blur) vfx.afterimage(rig, hopGhostMat, 0.22); state.hopGhost = 0.035; } // (a motion-blur trail: the setting turns it off)
    }
    for (const [f, rig] of views) {
      const t = f.timeScale < 1 ? clamp01(f.timeAcc + alpha * f.timeScale) : alpha;
      rig.update(f, running ? t : 1, dt);
      const tr = trails.get(f);
      if (tr) { const { hilt, tip } = rig.bladeWorld(); tr.push(hilt, tip, rig.swinging, dt, rig.smear); }
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
    if (camera.inShot && !(p.current?.surgeCost > 0 || p.current?.tags.includes("team"))) { camera.cue("ult-return"); root.classList.remove("ult-desat"); } // safety: never strand the camera (a T2 holds it: GDD §19.1)
    camera.update(dt, pr, lock?.pos ?? null, look, pyaw);
    root.classList.toggle("surge-full", !!p.surge?.isFull);
    vfx.syncProjectiles(world.projectiles, dt);
    vfx.update(dt, camera.cam, engine);
    arena.update(dt, state.time);
    darkFx.update(dt, state.time);
    for (const f of world.fighters) { // ink marks follow what they're written on
      const on = f.alive && f.tags.has("INSCRIBED");
      let m = inkMarks.get(f);
      if (on && !m) { m = BB.MeshBuilder.CreateTorus("inkMark", { diameter: 0.7, thickness: 0.04, tessellation: 18 }, scene); m.material = inkMat; m.isPickable = false; inkMarks.set(f, m); }
      if (m) { m.setEnabled(on); if (on) { m.position.set(f.pos.x, f.pos.y + (f.stats.height ?? 2) + 0.45, f.pos.z); m.rotation.y += dt * 2; } }
    }
    for (const [f, m] of inkMarks) if (!world.fighters.includes(f)) { m.dispose(); inkMarks.delete(f); }
    root.classList.toggle("surge-locked", world.surgeLock > 0);
    const sdt = story.sceneDt(dt); // the Theatre can slow, pause or frame-step the scene
    sets.update(sdt, state.time);
    constellation.update(dt, state.time);
    walls.update(state.time);
    hud.update(dt, world, controls.device);
    story.update(sdt, state.paused || state.help || state.frozen);

    if (impactLeft > 0) { impactLeft -= dt; if (impactLeft <= 0) canvas.style.filter = ""; }
    quality.update(dt);
    if ((state.glowTick = (state.glowTick ?? 0) + 1) % 15 === 1) syncGlow();
    perfTick(dt);
    const cp = (scene.activeCamera ?? camera.cam).position; Rig.view = { x: cp.x, z: cp.z };
    if (!state.toonChecked && state.time > 1.5) { state.toonChecked = true; if (toonFallbackIfBroken(scene)) console.warn("toon shader failed; using classic cel shading"); }
    scene.render();
  });
  addEventListener("resize", () => engine.resize());
  // Leaving the tab pauses the fight (and stops the clock from catching up afterwards), and out in the world it saves
  // (GDD §20.3, suspend & resume: a phone may close a hidden tab and never bring it back). An episode already saves at every beat.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    if (state.started && !state.paused) { state.paused = true; root.classList.add("paused"); }
    if (state.mode === "story" && story.roaming && story.zone) story.saveNow();
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
