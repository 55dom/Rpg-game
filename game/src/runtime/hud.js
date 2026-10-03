// DOM HUD: health/posture/mana, target card, combo counter, toasts, context prompts,
// and the frame-data panel (the designer's x-ray of the combat system).

import { Phase } from "../core/abilities.js";
import { MoveContext } from "../core/abilities.js";
import { IntentName, maskNames } from "../core/input.js";

const $ = (root, sel) => root.querySelector(sel);

const LABELS = {
  keyboard: { Light: "J", Heavy: "K", Dodge: "Shift", Block: "F", Jump: "Space", Spell1: "E", Lock: "Q" },
  gamepad: { Light: "X", Heavy: "Y", Dodge: "B", Block: "LB", Jump: "A", Spell1: "RB", Lock: "R3" },
  touch: { Light: "Slash", Heavy: "Heavy", Dodge: "Dodge", Block: "Guard", Jump: "Jump", Spell1: "Gale", Lock: "Lock" },
};

export class Hud {
  constructor(root) {
    this.root = root;
    this.el = {
      hp: $(root, "[data-hp]"), hpLag: $(root, "[data-hp-lag]"), posture: $(root, "[data-posture]"), mana: $(root, "[data-mana]"),
      target: $(root, "[data-target]"), thp: $(root, "[data-thp]"), tposture: $(root, "[data-tposture]"), tbroken: $(root, "[data-tbroken]"),
      combo: $(root, "[data-combo]"), comboN: $(root, "[data-combo-n]"),
      toast: $(root, "[data-toast]"), prompt: $(root, "[data-prompt]"), wave: $(root, "[data-wave]"),
      fd: $(root, "[data-fd]"), fdName: $(root, "[data-fd-name]"), fdPhase: $(root, "[data-fd-phase]"), fdFrame: $(root, "[data-fd-frame]"),
      fdTrack: $(root, "[data-fd-track]"), fdCursor: $(root, "[data-fd-cursor]"), fdCancels: $(root, "[data-fd-cancels]"),
      fdCtx: $(root, "[data-fd-ctx]"), fdBuf: $(root, "[data-fd-buf]"), fdLog: $(root, "[data-fd-log]"),
      hurt: $(root, "[data-hurt]"),
    };
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

    const focus = world.lockTarget?.alive ? world.lockTarget : this.focusTimer > 0 && this.focus?.alive ? this.focus : null;
    this.focusTimer -= dt;
    this.set("tHidden", e.target, "hidden", !focus);
    if (focus) {
      const fc = focus.combatant;
      this.set("thp", e.thp, "width", pct(fc.health.normalized));
      this.set("tpost", e.tposture, "width", pct(fc.posture.normalized));
      this.set("tbroken", e.tbroken, "hidden", !fc.postureBroken);
    }

    const n = world.comboCount;
    this.set("comboShow", e.combo, "class", n >= 2 ? "combo show" : "combo");
    this.set("comboN", e.comboN, "text", String(n));

    // Context prompts: tell the player the reward is available, in their device's words.
    let prompt = "", kind = "";
    if (p.alive && world.brokenTarget(p) && p.grounded) { prompt = `${this.label(device, "Heavy")} · LANTERN BREAK`; kind = "finisher"; }
    else if (p.counterFrames > 0) { prompt = `${this.label(device, "Light")} · COUNTER`; kind = "counter"; }
    this.set("prompt", e.prompt, "text", prompt);
    this.set("promptCls", e.prompt, "class", prompt ? `prompt show ${kind}` : "prompt");

    if (this.toastTimer > 0) { this.toastTimer -= dt; if (this.toastTimer <= 0) e.toast.classList.remove("show"); }

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
    if (ctx & MoveContext.Airborne) chips.push("AIR");
    if (ctx & MoveContext.AfterDash) chips.push("AFTER DASH");
    if (ctx & MoveContext.AfterParry) chips.push(`COUNTER ${p.counterFrames}`);
    if (ctx & MoveContext.TargetStaggered) chips.push("TARGET BROKEN");
    if (p.combatant.invulnerableFrames > 0) chips.push(`I-FRAMES ${p.combatant.invulnerableFrames}`);
    if (world.afterimageActive) chips.push(`AFTERIMAGE ${world.slowFrames}`);
    this.set("fdCtx", e.fdCtx, "text", chips.join(" · "));
    const buf = p.buffer.live(world.frame).map((i) => IntentName[i]).join(" ");
    this.set("fdBuf", e.fdBuf, "text", buf ? `buffer: ${buf}` : "buffer: —");
  }
}

const pct = (v) => `${Math.max(0, Math.min(1, v)) * 100}%`;
function shortMask(m) {
  const n = maskNames(m);
  if (n.includes("Spell1") && n.includes("Spell4")) return n.filter((x) => !x.startsWith("Spell")).concat("Spell").join(" ");
  return n.join(" ");
}
