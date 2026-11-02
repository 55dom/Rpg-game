// Saves (GDD §21.6): versioned JSON with a migration step per version, so old saves survive updates.
// Only source data is stored (never derived values). Storage is injected: IndexedDB in the browser (§20's stack:
// "Versioned JSON in IndexedDB, with export/import"), localStorage where that can't be opened, a Map in tests; every
// access is guarded because private windows can refuse storage.

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
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null };
}

/** A synchronous storage over an asynchronous one (IndexedDB): reads come from memory, filled once by `load()`; a write
 *  lands in memory at once and goes on to the backend in order. backend: { all(): Promise<[key, text][]>,
 *  put(key, text): Promise, del(key): Promise }. `failed` holds the last error the backend gave. */
export class CachedStorage {
  constructor(backend) { this.backend = backend; this.map = new Map(); this.queue = Promise.resolve(); this.failed = null; }
  async load() { for (const [k, v] of await this.backend.all()) this.map.set(String(k), String(v)); return this; }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { v = String(v); this.map.set(k, v); this._push(() => this.backend.put(k, v)); }
  removeItem(k) { this.map.delete(k); this._push(() => this.backend.del(k)); }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  /** Resolves once every write so far has reached the backend. */
  flush() { return this.queue; }
  _push(fn) { this.queue = this.queue.then(fn).catch((e) => { this.failed = e; }); }
}

const keysOf = (st) => { const out = []; try { for (let i = 0; i < st.length; i++) { const k = st.key(i); if (k?.startsWith(PREFIX)) out.push(k); } } catch { /* unreadable */ } return out; };
// Which of two copies is newer: a save by when it was saved, the progress record by how far it reaches.
const stamp = (text) => { try { const o = JSON.parse(text); return Number(o?.savedAt ?? o?.reached) || 0; } catch { return 0; } };

export const EXPORT_FORMAT = "unwritten-saves";

export class SaveStore {
  constructor(storage, kind = "memory") {
    this.storage = storage ?? memoryStorage();
    this.kind = kind; // where the saves live: "indexeddb", "localstorage", or "memory" (this visit only)
    this.lastError = null;
  }

  /** The saves in IndexedDB (GDD §20): what an older version kept in localStorage (or this visit wrote there before
   *  IndexedDB answered) comes across, the newer copy of each, and leaves localStorage once it's safely written. If
   *  IndexedDB refuses (or doesn't answer within `timeout`, when one is given), localStorage as before; if that can't be
   *  used either, memory. */
  static async open({ backend = null, legacy = null, timeout = Infinity } = {}) {
    if (backend) {
      try {
        const loading = new CachedStorage(backend).load();
        const cache = await (Number.isFinite(timeout) ? Promise.race([loading, new Promise((_, no) => setTimeout(() => no(new Error("timed out")), timeout))]) : loading);
        const moved = [];
        if (legacy) for (const k of keysOf(legacy)) {
          const v = legacy.getItem(k);
          if (v == null) continue;
          if (cache.getItem(k) == null || stamp(v) > stamp(cache.getItem(k))) cache.setItem(k, v);
          moved.push(k);
        }
        await cache.flush();
        if (cache.failed) throw cache.failed;
        for (const k of moved) { try { legacy.removeItem(k); } catch { /* left behind: harmless */ } }
        return new SaveStore(cache, "indexeddb");
      } catch { /* IndexedDB refused or never answered: localStorage, as before */ }
    }
    if (legacy) {
      try { const probe = PREFIX + "probe"; legacy.setItem(probe, "1"); legacy.removeItem(probe); return new SaveStore(legacy, "localstorage"); } catch { /* blocked */ }
    }
    return new SaveStore(memoryStorage(), "memory");
  }

  /** Every save and how far the story has been reached, as one JSON document to keep or move to another device (§20). */
  exportSaves() {
    const slots = {};
    for (const k of SLOTS) { const s = this.read(k); if (s) slots[k] = s; }
    return { format: EXPORT_FORMAT, version: SAVE_VERSION, exportedAt: Date.now(), reached: this.reached, slots };
  }

  /** Read an exported document back. Every save in it is migrated first (one from an older version comes up to date);
   *  if any can't be read (a newer version's, or not a save), nothing is written. Returns the slots written. */
  importSaves(doc) {
    let d;
    try { d = typeof doc === "string" ? JSON.parse(doc) : doc; } catch { throw new Error("That isn't a save file."); }
    if (d?.format !== EXPORT_FORMAT || !d.slots || typeof d.slots !== "object") throw new Error("That isn't a save file.");
    const ready = [];
    for (const [k, s] of Object.entries(d.slots)) {
      if (!SLOTS.includes(k)) continue;
      try { ready.push([k, migrate(s)]); } catch (e) { throw new Error(/newer/.test(e.message) ? "That file is from a newer version of the game." : "A save in that file can't be read."); }
    }
    if (!ready.length) throw new Error("There are no saves in that file.");
    for (const [k, s] of ready) { try { this.storage.setItem(PREFIX + k, JSON.stringify(s)); } catch (e) { this.lastError = e; throw new Error("The saves couldn't be written here."); } }
    if (Number(d.reached) > 0) this.reach(Number(d.reached));
    return ready.map(([k]) => k);
  }

  static browser() {
    try {
      const s = globalThis.localStorage;
      const probe = PREFIX + "probe";
      s.setItem(probe, "1"); s.removeItem(probe);
      return new SaveStore(s, "localstorage");
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
