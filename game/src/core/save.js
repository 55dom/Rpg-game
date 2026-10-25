// Saves (GDD §21.6): versioned JSON with a migration step per version, so old saves survive updates.
// Only source data is stored (never derived values). Storage is injected: localStorage in the
// browser, a Map in tests; every access is guarded because private windows can refuse storage.

export const SAVE_VERSION = 1;
const PREFIX = "unwritten.save.";
export const SLOTS = Object.freeze(["auto", "1", "2", "3"]);

/** Migrations: MIGRATIONS[n] upgrades a version-n save to n+1. */
const MIGRATIONS = {
  // 0: saves from before versioning had no player block.
  0: (s) => ({ ...s, version: 1, player: s.player ?? { name: "Rook", pronouns: "they" } }),
};

export function blankSave() {
  return { version: SAVE_VERSION, savedAt: 0, player: { name: "Rook", pronouns: "they" }, flags: {}, episode: null, beat: 0, settings: {} };
}

export function migrate(raw) {
  let s = { ...raw, version: Number(raw?.version ?? 0) };
  if (s.version > SAVE_VERSION) throw new Error(`save is from a newer version (${s.version})`);
  while (s.version < SAVE_VERSION) {
    const step = MIGRATIONS[s.version];
    if (!step) throw new Error(`no migration from save version ${s.version}`);
    s = step(s);
  }
  return { ...blankSave(), ...s, player: { ...blankSave().player, ...s.player } };
}

/** Name rules: trimmed, 1–16 characters, letters/numbers/spaces/'-. only. */
export function cleanName(name) {
  const n = String(name ?? "").replace(/[^\p{L}\p{N} '\-.]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);
  return n || "Rook";
}

export function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

export class SaveStore {
  constructor(storage) {
    this.storage = storage ?? memoryStorage();
    this.lastError = null;
  }

  static browser() {
    try {
      const s = globalThis.localStorage;
      const probe = PREFIX + "probe";
      s.setItem(probe, "1"); s.removeItem(probe);
      return new SaveStore(s);
    } catch { return new SaveStore(memoryStorage()); } // storage blocked: saves last for this visit only
  }

  write(slot, data) {
    if (!SLOTS.includes(slot)) throw new RangeError(`slot ${slot}`);
    const s = { ...data, version: SAVE_VERSION, savedAt: Date.now() };
    try { this.storage.setItem(PREFIX + slot, JSON.stringify(s)); this.lastError = null; return true; } catch (e) { this.lastError = e; return false; }
  }

  read(slot) {
    let raw;
    try { raw = this.storage.getItem(PREFIX + slot); } catch (e) { this.lastError = e; return null; }
    if (!raw) return null;
    try { return migrate(JSON.parse(raw)); } catch (e) { this.lastError = e; return null; } // corrupt or too new: treat as empty
  }

  remove(slot) { try { this.storage.removeItem(PREFIX + slot); } catch { /* ignore */ } }

  /** Story progress (which episodes are unlocked), kept apart from the slots so deleting a save doesn't relock anything. */
  get reached() {
    try { return Math.max(1, Number(JSON.parse(this.storage.getItem(PREFIX + "progress") ?? "{}").reached) || 1); } catch { return 1; }
  }
  reach(n) {
    if (n <= this.reached) return;
    try { this.storage.setItem(PREFIX + "progress", JSON.stringify({ reached: n })); } catch { /* ignore */ }
  }

  /** The most recent save across all slots (for "Continue"). */
  latest() {
    let best = null, bestSlot = null;
    for (const slot of SLOTS) {
      const s = this.read(slot);
      if (s && (!best || s.savedAt > best.savedAt)) { best = s; bestSlot = slot; }
    }
    return best ? { slot: bestSlot, save: best } : null;
  }
}
