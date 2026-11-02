// Devices → intents. Keyboard, mouse, gamepad, and touch all produce the same presses,
// so gameplay never knows which device is in use.

import { Intent } from "../core/input.js";

const KEYS = {
  KeyJ: Intent.Light, KeyK: Intent.Heavy, Space: Intent.Jump, ShiftLeft: Intent.Dodge, ShiftRight: Intent.Dodge,
  KeyL: Intent.Dodge, KeyF: Intent.Block, KeyE: Intent.Spell1, KeyR: Intent.Spell2, KeyT: Intent.Spell3,
  KeyV: Intent.Ultimate, KeyY: Intent.Spell4,
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
    this.smartCombo = false; // touch assist, or Story difficulty (GDD §9.7): holding Slash keeps the string going
    this.held = { mouse: false, pad: false, timer: 0 }; // Slash held on a mouse, a pad or the keyboard (for smartCombo)
    this.flickArmed = true;
    this.onFirstInput = null;

    addEventListener("keydown", (e) => {
      this._first();
      if (["Space", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.device = "keyboard";
      this.keyboardUsed = true;
      this.keys.add(e.code);
      if (KEYS[e.code]) this.presses.push(KEYS[e.code]);
      if (KEYS[e.code] === Intent.Light) this.held.timer = 0.25;
      if (e.code === "KeyQ") this.commands.push("lock");
      if (e.code === "Tab") this.commands.push(e.shiftKey ? "switchLeft" : "switchRight");
      if (e.code === "KeyH" || e.code === "Slash") this.commands.push("help");
      if (e.code === "Backspace") this.commands.push("reset");
      if (e.code === "Digit1") this.commands.push("assist:bas");
      if (e.code === "Digit2") this.commands.push("assist:juno");
      if (e.code === "Digit3") this.commands.push("assist:third"); // a third squadmate, when there is one (Cal, Ep 18; Tamsin, Ep 15)
      if (e.code === "Digit4") this.commands.push("stance");
      if (e.code === "KeyB") this.commands.push("boss");
      if (e.code === "KeyP") this.commands.push("pages");
      if (e.code === "KeyT") this.commands.push("tag");
      if (e.code === "Enter") this.commands.push("confirm");
      if (e.code === "ArrowUp" || e.code === "KeyW") this.commands.push("navUp");     // menus and dialogue choices
      if (e.code === "ArrowDown" || e.code === "KeyS") this.commands.push("navDown");
      if (e.code === "KeyG") this.commands.push("frameData");
      if (e.code === "KeyX") this.commands.push("steal"); // pickpocket (from behind), or surrender to the Watch
      if (e.code === "Escape") this.commands.push("pause");
    });
    addEventListener("keyup", (e) => this.keys.delete(e.code));
    addEventListener("blur", () => this.keys.clear());
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    addEventListener("pointerup", (e) => { if (e.button === 0) this.held.mouse = false; });
    canvas.addEventListener("pointerdown", (e) => {
      this._first();
      if (e.pointerType !== "mouse") return;
      this.device = "keyboard";
      if (e.button === 0) { this.presses.push(Intent.Light); this.held.mouse = true; this.held.timer = 0.25; }
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
    const magic = root.querySelector("[data-magic]"), ring = root.querySelector("[data-ring]");
    if (magic && ring) this._bindRing(root, magic, ring);
  }

  /** The Magic button (GDD §20.3): it opens the four-spell ring. Hold it and slide toward a spell, and letting go casts
   *  it; or tap it, and the ring stays open a moment for a tap on the spell. The fight doesn't stop meanwhile. */
  _bindRing(root, magic, ring) {
    const items = [...ring.querySelectorAll("[data-ring-item]")];
    const r = this.ring = { open: false, sticky: false, id: null, x: 0, y: 0, hot: null, timer: null };
    const setHot = (el) => { if (r.hot === el) return; r.hot?.classList.remove("hot"); r.hot = el; el?.classList.add("hot"); };
    const setOpen = (on) => {
      r.open = on; root.classList.toggle("ring-open", on);
      if (!on) { setHot(null); r.sticky = false; clearTimeout(r.timer); for (const el of items) el.classList.remove("down"); }
    };
    // The spell whose direction from the button is nearest the slide's (a spell that isn't on the page yet isn't shown).
    const pick = (dx, dy) => {
      const c = magic.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2, a = Math.atan2(dy, dx);
      let best = null, bd = Infinity;
      for (const el of items) {
        if (!el.offsetParent) continue;
        const b = el.getBoundingClientRect();
        let d = Math.abs(a - Math.atan2(b.top + b.height / 2 - cy, b.left + b.width / 2 - cx));
        if (d > Math.PI) d = 2 * Math.PI - d;
        if (d < bd) { bd = d; best = el; }
      }
      return best;
    };
    magic.addEventListener("pointerdown", (e) => {
      e.preventDefault(); this._first(); this.device = "touch";
      if (r.open && r.sticky) { setOpen(false); return; } // a second tap closes it
      r.id = e.pointerId; r.x = e.clientX; r.y = e.clientY;
      try { magic.setPointerCapture(e.pointerId); } catch { /* the slide is read either way */ } magic.classList.add("down"); setOpen(true);
    });
    magic.addEventListener("pointermove", (e) => {
      if (e.pointerId !== r.id) return;
      const dx = e.clientX - r.x, dy = e.clientY - r.y;
      setHot(Math.hypot(dx, dy) > 18 ? pick(dx, dy) : null);
    });
    const release = (e) => {
      if (e.pointerId !== r.id) return;
      r.id = null; magic.classList.remove("down");
      if (r.hot) { this.presses.push(Intent[r.hot.dataset.intent]); setOpen(false); return; }
      if (e.type === "pointercancel") { setOpen(false); return; }
      r.sticky = true; clearTimeout(r.timer); r.timer = setTimeout(() => setOpen(false), 2500);
    };
    magic.addEventListener("pointerup", release);
    magic.addEventListener("pointercancel", release);
    for (const el of items) el.addEventListener("pointerdown", () => { if (r.open) setTimeout(() => setOpen(false), 0); }); // (its press went in above)
  }

  /** Sample all devices once per render frame. */
  poll(dt) {
    const k = this.keys;
    let mx = (k.has("KeyD") ? 1 : 0) - (k.has("KeyA") ? 1 : 0);
    let my = (k.has("KeyW") ? 1 : 0) - (k.has("KeyS") ? 1 : 0);
    let block = k.has("KeyF");
    let padLight = false;
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
          if (PAD[i] === Intent.Light) this.held.timer = 0.25;
          if (i === PAD_LOCK) this.commands.push("lock");
          if (i === PAD_HELP) this.commands.push("help");
          if (i === PAD_RESET) this.commands.push("pages"); // View / Back: page evolution
          if (i === 13) this.presses.push(Intent.Spell4); // D-pad down
          if (i === 14) this.commands.push("assist:bas");   // D-pad left
          if (i === 15) this.commands.push("assist:juno");  // D-pad right
          if (i === 12) this.commands.push("stance", "navUp"); // D-pad up (navUp in menus)
          if (i === 13) this.commands.push("navDown");
        }
        this.padPrev[i] = down;
        if ((i === 4 || i === 6) && down) block = true;
        if (PAD[i] === Intent.Light && down) padLight = true;
      });
      break;
    }

    if (this.touch.stickId !== null) { mx = this.touch.x; my = this.touch.y; }
    if (this.touch.light && this.smartCombo) {
      this.touch.lightTimer -= dt;
      if (this.touch.lightTimer <= 0) { this.presses.push(Intent.Light); this.touch.lightTimer = 0.2; }
    }
    // Story difficulty's auto-combo (GDD §9.7): Slash held on a keyboard, a mouse or a pad keeps the string going too.
    this.held.pad = padLight;
    if (this.smartCombo && (this.keys.has("KeyJ") || this.held.mouse || this.held.pad)) {
      this.held.timer -= dt;
      if (this.held.timer <= 0) { this.presses.push(Intent.Light); this.held.timer = 0.2; }
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
