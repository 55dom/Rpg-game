// Saves in IndexedDB (GDD §20's stack: "Versioned JSON in IndexedDB, with export/import"): one object store, key → the
// save's JSON text, behind the small async interface core/save.js's CachedStorage reads and writes through.

/** @returns {null | { all(): Promise<[string, string][]>, put(k: string, v: string): Promise<void>, del(k: string): Promise<void> }} */
export function idbBackend(idb = globalThis.indexedDB, name = "unwritten", store = "saves") {
  if (!idb) return null;
  let opening = null;
  const db = () => (opening ??= new Promise((res, rej) => {
    let r;
    try { r = idb.open(name, 1); } catch (e) { rej(e); return; }
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(store)) r.result.createObjectStore(store); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error("IndexedDB blocked"));
  }));
  const tx = (mode, fn) => db().then((d) => new Promise((res, rej) => {
    const t = d.transaction(store, mode), out = fn(t.objectStore(store));
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error ?? new Error("aborted"));
  }));
  return {
    all: () => tx("readonly", (os) => { const out = []; const c = os.openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out.push([String(cur.key), String(cur.value)]); cur.continue(); } }; return out; }),
    put: (k, v) => tx("readwrite", (os) => { os.put(v, k); }),
    del: (k) => tx("readwrite", (os) => { os.delete(k); }),
  };
}
