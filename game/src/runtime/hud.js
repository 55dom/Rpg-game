// DOM HUD: health/posture/mana, target card, combo counter, toasts, context prompts,
// and the frame-data panel (the designer's x-ray of the combat system).

import { pageLevelProgress } from "../core/progress.js";
import { Phase } from "../core/abilities.js";
import { MoveContext } from "../core/abilities.js";
import { IntentName, maskNames } from "../core/input.js";

const $ = (root, sel) => root.querySelector(sel);

const LABELS = {
  keyboard: { Light: "J", Heavy: "K", Dodge: "Shift", Block: "F", Jump: "Space", Spell1: "E", Lock: "Q" },
  gamepad: { Light: "X", Heavy: "Y", Dodge: "B", Block: "LB", Jump: "A", Spell1: "RB", Lock: "R3" },
  touch: { Light: "Slash", Heavy: "Heavy", Dodge: "Dodge", Block: "Guard", Jump: "Jump", Spell1: "Gale", Spell2: "Pull", Spell3: "Edge", Lock: "Lock" },
};
LABELS.keyboard.Spell2 = "R"; LABELS.keyboard.Spell3 = "T"; LABELS.keyboard.Spell4 = "Y"; LABELS.keyboard.Ultimate = "V";
LABELS.gamepad.Spell2 = "RT"; LABELS.gamepad.Spell3 = "LT"; LABELS.gamepad.Spell4 = "▼"; LABELS.gamepad.Ultimate = "LB+RB";
LABELS.touch.Ultimate = "ULT"; LABELS.touch.Spell4 = "Wall";
Object.assign(LABELS.keyboard, { Assist: "1", Assist2: "2" });
Object.assign(LABELS.gamepad, { Assist: "D-pad ◀", Assist2: "D-pad ▶" });
Object.assign(LABELS.touch, { Assist: "BAS", Assist2: "JUNO" });

export class Hud {
  /** @param {{slot:string, short:string}[]} spells the spell buttons, in order */
  constructor(root, spells = []) {
    this.root = root;
    this.spells = spells;
    const row = $(root, "[data-spells]");
    this.spellEls = spells.map(() => {
      const el = document.createElement("span");
      el.className = "spell";
      el.innerHTML = `<kbd></kbd><b></b><small></small><i class="xp"><u></u></i>`;
      row?.appendChild(el);
      return el;
    });
    this.lines = [];
    this.lineTimer = 0;
    this.el = {
      surge: $(root, "[data-surge]"),
      hp: $(root, "[data-hp]"), hpLag: $(root, "[data-hp-lag]"), posture: $(root, "[data-posture]"), mana: $(root, "[data-mana]"),
      target: $(root, "[data-target]"), tname: $(root, "[data-tname]"), thp: $(root, "[data-thp]"), tposture: $(root, "[data-tposture]"), tbroken: $(root, "[data-tbroken]"),
      combo: $(root, "[data-combo]"), comboN: $(root, "[data-combo-n]"),
      toast: $(root, "[data-toast]"), prompt: $(root, "[data-prompt]"), wave: $(root, "[data-wave]"),
      fd: $(root, "[data-fd]"), fdName: $(root, "[data-fd-name]"), fdPhase: $(root, "[data-fd-phase]"), fdFrame: $(root, "[data-fd-frame]"),
      fdTrack: $(root, "[data-fd-track]"), fdCursor: $(root, "[data-fd-cursor]"), fdCancels: $(root, "[data-fd-cancels]"),
      fdCtx: $(root, "[data-fd-ctx]"), fdBuf: $(root, "[data-fd-buf]"), fdLog: $(root, "[data-fd-log]"),
      hurt: $(root, "[data-hurt]"),
      party: $(root, "[data-party]"), cutin: $(root, "[data-cutin]"),
      grade: $(root, "[data-grade]"), line: $(root, "[data-line]"),
      boss: $(root, "[data-boss]"), bossName: $(root, "[data-boss-name]"), bossHp: $(root, "[data-boss-hp]"), bossPosture: $(root, "[data-boss-posture]"),
      status: $(root, "[data-status]"),
    };
    this.partyEls = new Map();
    this.cache = new Map();
    this.hpLag = 1;
    this.toastTimer = 0;
    this.focus = null;
    this.focusTimer = 0;
    this.fdAbility = undefined;
    this.log = [];
  }

  set(key, el, prop, value) {
    if (this.cache.get(key) === value) return;
    this.cache.set(key, value);
    if (prop === "width") el.style.width = value;
    else if (prop === "text") el.textContent = value;
    else if (prop === "class") el.className = value;
    else if (prop === "hidden") el.hidden = value;
    else if (prop === "html") el.innerHTML = value;
  }

  label(device, intent) { return (LABELS[device] ?? LABELS.keyboard)[intent]; }

  toast(text, kind = "") {
    const t = this.el.toast;
    t.textContent = text;
    t.className = `toast ${kind}`;
    void t.offsetWidth; // restart the animation
    t.classList.add("show");
    this.toastTimer = 1.1;
  }

  banner(text) {
    const w = this.el.wave;
    w.textContent = text;
    w.classList.remove("show"); void w.offsetWidth; w.classList.add("show");
  }

  say(speaker, text) { this.lines.push([speaker, text]); }

  /** Anime-style cut-in banner when a companion's Assist fires. */
  cutIn(name, move, kind) {
    const c = this.el.cutin;
    if (!c) return;
    c.className = `cutin ${kind}`;
    c.innerHTML = `<b>${name.toUpperCase()}</b><span>${move.toUpperCase()}</span>`;
    void c.offsetWidth;
    c.classList.add("show");
  }

  updateParty(world, device) {
    const host = this.el.party;
    if (!host) return;
    const keys = { keyboard: ["1", "2"], gamepad: ["◀", "▶"], touch: ["", ""] }[device] ?? ["1", "2"];
    for (const [c, el] of this.partyEls) if (!world.companions.includes(c)) { // a new world brings new companions
      el.remove(); this.partyEls.delete(c);
      for (const k of [...this.cache.keys()]) if (/^a(hp|cd|cls|key|st)\d/.test(k)) this.cache.delete(k);
    }
    world.companions.forEach((c, i) => {
      let el = this.partyEls.get(c);
      if (!el) {
        el = document.createElement("div");
        el.className = `ally ${c.kind}`;
        el.innerHTML = `<div class="ally-name"><kbd></kbd>${c.stats.name.toUpperCase()}<small></small></div><div class="bar hp ally-hp"><i></i></div><div class="bar ally-cd"><i></i></div>`;
        host.appendChild(el);
        this.partyEls.set(c, el);
      }
      const hp = el.querySelector(".ally-hp i"), cd = el.querySelector(".ally-cd i");
      this.set(`ahp${i}`, hp, "width", pct(c.combatant.health.normalized));
      const left = Math.max(0, c.assistReadyFrame - world.frame);
      const ready = left === 0 && c.alive;
      this.set(`acd${i}`, cd, "width", pct(1 - left / c.stats.assistCooldownFrames));
      this.set(`acls${i}`, el, "class", `ally ${c.kind}${ready ? " ready" : ""}${c.alive ? "" : " down"}`);
      this.set(`akey${i}`, el.querySelector("kbd"), "text", keys[i] ?? "");
      this.set(`ast${i}`, el.querySelector("small"), "text", c.alive ? c.brain.stance.toUpperCase() : "DOWN");
    });
  }

  hurt() {
    const h = this.el.hurt;
    h.classList.remove("show"); void h.offsetWidth; h.classList.add("show");
  }

  /** Show this enemy in the target card for a few seconds. */
  setFocus(f) { this.focus = f; this.focusTimer = 4; }

  pushLog(text) {
    this.log.unshift(text);
    if (this.log.length > 5) this.log.pop();
    this.el.fdLog.innerHTML = this.log.map((l) => `<li>${l}</li>`).join("");
  }

  update(dt, world, device) {
    const p = world.player, c = p.combatant, e = this.el;
    const hp = c.health.normalized;
    this.hpLag = hp < this.hpLag ? Math.max(hp, this.hpLag - dt * 0.6) : hp;
    this.set("hp", e.hp, "width", pct(hp));
    this.set("hpLag", e.hpLag, "width", pct(this.hpLag));
    this.set("posture", e.posture, "width", pct(c.posture.normalized));
    this.set("mana", e.mana, "width", pct(p.mana.normalized));
    this.set("surge", e.surge, "width", pct(p.surge.normalized));
    this.spells.forEach((sp, i) => {
      const el = this.spellEls[i];
      const alt = world.altSpells; // someone else tagged in: their own spells on the buttons
      if (alt) {
        const ab2 = world.activeLoadout[sp.slot];
        this.set(`sph${i}`, el, "hidden", !ab2);
        if (!ab2) return;
        this.set(`sp${i}`, el, "class", `spell${p.mana.current >= ab2.manaCost ? "" : " low"} evolved`);
        this.set(`spk${i}`, el.firstChild, "text", this.label(device, sp.slot));
        this.set(`spn${i}`, el.children[1], "text", alt[sp.slot] ?? ab2.id);
        this.set(`spc${i}`, el.children[2], "text", String(ab2.manaCost));
        this.set(`spx${i}`, el.querySelector("u"), "width", "100%");
        return;
      }
      const ab = world.loadout[sp.slot], page = world.pages[sp.slot], def = world.pageDefs[sp.slot];
      this.set(`sph${i}`, el, "hidden", !ab); // a locked page has no chip
      if (!ab) return;
      const name = page.branch ? def.branches.find((b) => b.key === page.branch).name : sp.short;
      const cls = `spell${p.mana.current >= ab.manaCost ? "" : " low"}${page.ready ? " ready" : ""}${page.branch ? " evolved" : ""}`;
      this.set(`sp${i}`, el, "class", cls);
      this.set(`spk${i}`, el.firstChild, "text", this.label(device, sp.slot));
      this.set(`spn${i}`, el.children[1], "text", name);
      this.set(`spc${i}`, el.children[2], "text", String(ab.manaCost));
      this.set(`spx${i}`, el.querySelector("u"), "width", pct(pageLevelProgress(sp.slot, page.xp)));
    });
    this.root.classList.toggle("page-ready", Object.values(world.pages).some((pg) => pg.ready));

    const focus = world.lockTarget?.alive ? world.lockTarget : this.focusTimer > 0 && this.focus?.alive ? this.focus : null;
    this.focusTimer -= dt;
    this.set("tHidden", e.target, "hidden", !focus);
    if (focus) {
      const fc = focus.combatant;
      this.set("tname", e.tname, "text", (focus.stats.name ?? "Enemy").toUpperCase() + (focus.stats.elite ? " ★" : "") + (focus.traits?.dummy ? " · HP ∞" : ""));
      this.set("thp", e.thp, "width", pct(fc.health.normalized));
      this.set("tpost", e.tposture, "width", pct(fc.posture.normalized));
      this.set("tbroken", e.tbroken, "hidden", !fc.postureBroken);
    }

    const n = world.comboCount;
    this.set("comboShow", e.combo, "class", n >= 2 ? "combo show" : "combo");
    this.set("comboN", e.comboN, "text", String(n));
    const grade = n >= 50 ? "S" : n >= 35 ? "A" : n >= 20 ? "B" : n >= 10 ? "C" : "";
    this.set("grade", e.grade, "text", grade);

    // Squad subtitle lines, one at a time.
    if (this.lineTimer > 0) this.lineTimer -= dt;
    if (this.lineTimer <= 0 && this.lines.length) {
      const [speaker, text] = this.lines.shift();
      e.line.innerHTML = `<b class="${speaker.toLowerCase()}">${speaker.toUpperCase()}</b>${text}`;
      e.line.classList.remove("show"); void e.line.offsetWidth; e.line.classList.add("show");
      this.lineTimer = 1.2 + text.length * 0.045;
    }

    // Context prompts: tell the player the reward is available, in their device's words.
    let prompt = "", kind = "";
    if (p.alive && p.surge.isFull && p.grounded && !p.current?.surgeCost) { prompt = `${this.label(device, "Ultimate")} · SKYRENDER`; kind = "ultimate"; }
    else if (p.alive && world.brokenTarget(p) && p.grounded) { prompt = `${this.label(device, "Heavy")} · LANTERN BREAK`; kind = "finisher"; }
    else if (p.counterFrames > 0) { prompt = `${this.label(device, "Light")} · COUNTER`; kind = "counter"; }
    this.set("prompt", e.prompt, "text", prompt);
    this.set("promptCls", e.prompt, "class", prompt ? `prompt show ${kind}` : "prompt");

    if (this.toastTimer > 0) { this.toastTimer -= dt; if (this.toastTimer <= 0) e.toast.classList.remove("show"); }

    this.updateParty(world, device);

    // Boss bar.
    const b = world.boss?.alive ? world.boss : null;
    this.set("bossOn", e.boss, "hidden", !b);
    if (b) {
      if (this.marksFor !== b) { // phase marks on the boss bar
        this.marksFor = b;
        e.bossHp.parentElement.querySelectorAll("s").forEach((x) => x.remove());
        for (const m of b.stats.phaseMarks ?? []) { const el = document.createElement("s"); el.style.left = `${m * 100}%`; e.bossHp.parentElement.appendChild(el); }
      }
      this.set("bossName", e.bossName, "text", b.stats.name.toUpperCase() + (b.boss && b.stats.phaseMarks?.length ? `  ·  PHASE ${b.boss.phase}` : ""));
      this.set("bossHp", e.bossHp, "width", pct(b.combatant.health.normalized));
      this.set("bossPost", e.bossPosture, "width", pct(b.combatant.posture.normalized));
    }
    // Status chips on Rook.
    const chips = [];
    if (p.tags.has("WEIGHTED")) chips.push(`<span class="chip mud">WEIGHTED</span>`);
    if (p.tags.has("SHIELDED")) chips.push(`<span class="chip shield">SHIELDED</span>`);
    this.set("status", e.status, "html", chips.join(""));
    if (!e.fd.hidden) this.updateFrameData(world);
  }

  updateFrameData(world) {
    const p = world.player, r = p.runner, a = r.current, e = this.el;
    if (a !== this.fdAbility) {
      this.fdAbility = a;
      if (a) {
        e.fdTrack.innerHTML =
          `<span class="s" style="flex:${a.startup}"></span><span class="a" style="flex:${a.active}"></span><span class="r" style="flex:${a.recovery}"></span>`;
        e.fdCancels.innerHTML = a.cancels.map((cw) =>
          `<span style="left:${(cw.from / a.total) * 100}%;width:${((cw.to - cw.from + 1) / a.total) * 100}%" class="${cw.requiresHit ? "onhit" : ""}" title="${maskNames(cw.into).join(" ")}">${cw.requiresHit ? "on hit: " : ""}${shortMask(cw.into)}</span>`).join("");
        this.set("fdName", e.fdName, "text", `${a.id}  ${a.startup}/${a.active}/${a.recovery}`);
        this.pushLog(a.id);
      } else {
        e.fdTrack.innerHTML = ""; e.fdCancels.innerHTML = "";
        this.set("fdName", e.fdName, "text", "idle");
      }
    }
    if (a) {
      e.fdCursor.style.left = pct(r.frame / a.total);
      e.fdCursor.hidden = false;
      const ph = p.hitstop > 0 ? "HITSTOP" : r.frame < a.startup ? Phase.Startup : r.frame < a.startup + a.active ? Phase.Active : Phase.Recovery;
      this.set("fdPhase", e.fdPhase, "text", ph);
      this.set("fdFrame", e.fdFrame, "text", `f${r.frame}${r.hasHit ? " · hit" : ""}`);
    } else {
      e.fdCursor.hidden = true;
      this.set("fdPhase", e.fdPhase, "text", p.combatant.blocking ? "BLOCKING" : "");
      this.set("fdFrame", e.fdFrame, "text", "");
    }
    const ctx = p.context();
    const chips = [];
    if (ctx & MoveContext.Grounded) chips.push("GROUND");
    if (ctx & MoveContext.Airborne) {
      const left = [ctx & MoveContext.AirJumpReady ? "jump" : "", ctx & MoveContext.AirDashReady ? "dash" : ""].filter(Boolean);
      chips.push(left.length ? `AIR (${left.join("+")})` : "AIR");
    }
    if (ctx & MoveContext.AfterDash) chips.push("AFTER DASH");
    if (ctx & MoveContext.AfterParry) chips.push(`COUNTER ${p.counterFrames}`);
    if (ctx & MoveContext.TargetStaggered) chips.push("TARGET BROKEN");
    if (p.combatant.invulnerableFrames > 0) chips.push(`I-FRAMES ${p.combatant.invulnerableFrames}`);
    if (world.afterimageActive) chips.push(`AFTERIMAGE ${world.slowFrames}`);
    this.set("fdCtx", e.fdCtx, "text", chips.join(" · "));
    const buf = p.buffer.live(world.frame).map((i) => IntentName[i]).join(" ");
    const fps = this.quality ? ` · ${Math.round(this.quality.fps)} fps · res ${this.quality.ratio.toFixed(2)}x` : "";
    this.set("fdBuf", e.fdBuf, "text", (buf ? `buffer: ${buf}` : "buffer: —") + fps);
  }
}

const pct = (v) => `${Math.max(0, Math.min(1, v)) * 100}%`;
function shortMask(m) {
  const n = maskNames(m);
  if (n.includes("Spell1") && n.includes("Spell4")) return n.filter((x) => !x.startsWith("Spell")).concat("Spell").join(" ");
  return n.join(" ");
}
