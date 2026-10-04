// Devices → intents. Keyboard, mouse, gamepad, and touch all produce the same presses,
// so gameplay never knows which device is in use.

import { Intent } from "../core/input.js";

const KEYS = {
  KeyJ: Intent.Light, KeyK: Intent.Heavy, Space: Intent.Jump, ShiftLeft: Intent.Dodge, ShiftRight: Intent.Dodge,
  KeyL: Intent.Dodge, KeyF: Intent.Block, KeyE: Intent.Spell1, KeyR: Intent.Spell2, KeyT: Intent.Spell3,
  KeyV: Intent.Ultimate,
};
// Standard gamepad mapping.
const PAD = { 0: Intent.Jump, 1: Intent.Dodge, 2: Intent.Light, 3: Intent.Heavy, 4: Intent.Block, 5: Intent.Spell1, 7: Intent.Spell2, 6: Intent.Spell3 };
const PAD_LOCK = 11, PAD_HELP = 9, PAD_RESET = 8;

export class Controls {
  constructor(canvas, touchRoot) {
    this.canvas = canvas;
    this.keys = new Set();
    this.presses = [];
    this.commands = [];
    this.move = { x: 0, y: 0 };
    this.look = { x: 0, y: 0 };
    this.blockHeld = false;
    this.device = "keyboard";
    this.padPrev = [];
    this.touch = { stickId: null, cx: 0, cy: 0, x: 0, y: 0, lookId: null, lx: 0, ly: 0, block: false, light: false, lightTimer: 0 };
    this.smartCombo = false; // touch assist: holding Slash keeps the string going
    this.flickArmed = true;
    this.onFirstInput = null;

    addEventListener("keydown", (e) => {
      this._first();
      if (["Space", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.device = "keyboard";
      this.keys.add(e.code);
      if (KEYS[e.code]) this.presses.push(KEYS[e.code]);
      if (e.code === "KeyQ") this.commands.push("lock");
      if (e.code === "Tab") this.commands.push(e.shiftKey ? "switchLeft" : "switchRight");
      if (e.code === "KeyH" || e.code === "Slash") this.commands.push("help");
      if (e.code === "Backspace") this.commands.push("reset");
      if (e.code === "Digit1") this.commands.push("assist:bas");
      if (e.code === "Digit2") this.commands.push("assist:juno");
      if (e.code === "Digit3") this.commands.push("stance");
      if (e.code === "KeyB") this.commands.push("boss");
      if (e.code === "KeyG") this.commands.push("frameData");
      if (e.code === "Escape") this.commands.push("pause");
    });
    addEventListener("keyup", (e) => this.keys.delete(e.code));
    addEventListener("blur", () => this.keys.clear());
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => {
      this._first();
      if (e.pointerType !== "mouse") return;
      this.device = "keyboard";
      if (e.button === 0) this.presses.push(Intent.Light);
      if (e.button === 2) this.presses.push(Intent.Heavy);
      if (e.button === 1) { this.commands.push("lock"); e.preventDefault(); }
    });

    if (touchRoot) this._bindTouch(touchRoot);
  }

  _first() { if (this.onFirstInput) { const f = this.onFirstInput; this.onFirstInput = null; f(); } }

  _bindTouch(root) {
    const t = this.touch;
    const stick = root.querySelector("[data-stick]");
    const knob = root.querySelector("[data-knob]");
    const zone = root.querySelector("[data-stick-zone]");
    const lookZone = root.querySelector("[data-look-zone]");
    this.stickEl = stick; this.knobEl = knob;

    zone.addEventListener("pointerdown", (e) => {
      this._first(); this.device = "touch";
      if (t.stickId !== null) return;
      t.stickId = e.pointerId; t.cx = e.clientX; t.cy = e.clientY; t.x = 0; t.y = 0;
      zone.setPointerCapture(e.pointerId);
      stick.style.left = `${e.clientX}px`; stick.style.top = `${e.clientY}px`;
      stick.classList.add("on");
    });
    zone.addEventListener("pointermove", (e) => {
      if (e.pointerId !== t.stickId) return;
      const R = 52;
      let dx = e.clientX - t.cx, dy = e.clientY - t.cy;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx *= R / d; dy *= R / d; }
      t.x = dx / R; t.y = -dy / R;
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    const endStick = (e) => {
      if (e.pointerId !== t.stickId) return;
      t.stickId = null; t.x = 0; t.y = 0;
      knob.style.transform = "";
      stick.classList.remove("on");
    };
    zone.addEventListener("pointerup", endStick);
    zone.addEventListener("pointercancel", endStick);

    lookZone.addEventListener("pointerdown", (e) => {
      this._first(); this.device = "touch";
      t.lookId = e.pointerId; t.lx = e.clientX; t.ly = e.clientY;
      lookZone.setPointerCapture(e.pointerId);
    });
    lookZone.addEventListener("pointermove", (e) => {
      if (e.pointerId !== t.lookId) return;
      this.look.x += (e.clientX - t.lx) * 0.006; this.look.y += (e.clientY - t.ly) * 0.004;
      t.lx = e.clientX; t.ly = e.clientY;
    });
    const endLook = (e) => { if (e.pointerId === t.lookId) t.lookId = null; };
    lookZone.addEventListener("pointerup", endLook);
    lookZone.addEventListener("pointercancel", endLook);

    for (const btn of root.querySelectorAll("[data-intent]")) {
      const name = btn.dataset.intent;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault(); this._first(); this.device = "touch";
        btn.classList.add("down");
        if (name.startsWith("cmd:")) { this.commands.push(name.slice(4)); return; }
        if (name === "Lock") {
          // Tap: lock, or switch to the next target. Hold: release the lock.
          btn._hold = setTimeout(() => { btn._hold = null; this.commands.push("unlock"); }, 450);
          return;
        }
        this.presses.push(Intent[name]);
        if (name === "Block") t.block = true;
        if (name === "Light") { t.light = true; t.lightTimer = 0.25; }
      });
      const up = () => {
        if (!btn.classList.contains("down")) return;
        btn.classList.remove("down");
        if (name === "Block") t.block = false;
        if (name === "Light") t.light = false;
        if (name === "Lock" && btn._hold) { clearTimeout(btn._hold); btn._hold = null; this.commands.push("lockTap"); }
      };
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
      btn.addEventListener("pointerleave", up);
    }
  }

  /** Sample all devices once per render frame. */
  poll(dt) {
    const k = this.keys;
    let mx = (k.has("KeyD") ? 1 : 0) - (k.has("KeyA") ? 1 : 0);
    let my = (k.has("KeyW") ? 1 : 0) - (k.has("KeyS") ? 1 : 0);
    let block = k.has("KeyF");
    this.look.x += ((k.has("ArrowRight") ? 1 : 0) - (k.has("ArrowLeft") ? 1 : 0)) * 2.2 * dt;
    this.look.y += ((k.has("ArrowDown") ? 1 : 0) - (k.has("ArrowUp") ? 1 : 0)) * 1.2 * dt;

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (!pad || !pad.connected) continue;
      const dz = (v) => (Math.abs(v) < 0.18 ? 0 : v);
      const ax = dz(pad.axes[0] ?? 0), ay = dz(pad.axes[1] ?? 0);
      const rx = dz(pad.axes[2] ?? 0), ry = dz(pad.axes[3] ?? 0);
      if (ax || ay) { mx = ax; my = -ay; this.device = "gamepad"; }
      this.look.x += rx * 2.6 * dt; this.look.y += ry * 1.4 * dt;
      // Flick the right stick hard left or right to switch lock-on targets.
      if (Math.abs(rx) > 0.85 && this.flickArmed) { this.commands.push(rx > 0 ? "flickRight" : "flickLeft"); this.flickArmed = false; }
      if (Math.abs(rx) < 0.3) this.flickArmed = true;
      pad.buttons.forEach((b, i) => {
        const down = b.pressed || b.value > 0.5;
        const was = this.padPrev[i];
        if (down && !was) {
          this._first(); this.device = "gamepad";
          // LB + RB together = Ultimate (GDD §9.1).
          const other = i === 4 ? 5 : i === 5 ? 4 : -1;
          if (other >= 0 && this.padPrev[other]) this.presses.push(Intent.Ultimate);
          else if (PAD[i] !== undefined) this.presses.push(PAD[i]);
          if (i === PAD_LOCK) this.commands.push("lock");
          if (i === PAD_HELP) this.commands.push("help");
          if (i === PAD_RESET) this.commands.push("reset");
          if (i === 14) this.commands.push("assist:bas");   // D-pad left
          if (i === 15) this.commands.push("assist:juno");  // D-pad right
          if (i === 12) this.commands.push("stance");       // D-pad up
        }
        this.padPrev[i] = down;
        if ((i === 4 || i === 6) && down) block = true;
      });
      break;
    }

    if (this.touch.stickId !== null) { mx = this.touch.x; my = this.touch.y; }
    if (this.touch.light && this.smartCombo) {
      this.touch.lightTimer -= dt;
      if (this.touch.lightTimer <= 0) { this.presses.push(Intent.Light); this.touch.lightTimer = 0.2; }
    }
    if (this.touch.block) block = true;
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    this.move.x = mx; this.move.y = my;
    this.blockHeld = block;
  }

  drainPresses() { const p = this.presses; this.presses = []; return p; }
  drainCommands() { const c = this.commands; this.commands = []; return c; }
  takeLook() { const l = { ...this.look }; this.look.x = 0; this.look.y = 0; return l; }
}
