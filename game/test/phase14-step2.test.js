// Phase 14 Step 2: saves as GDD §20 and §21.6 write them: "Versioned JSON in IndexedDB, with export/import", a
// migration step per version, autosave at episode beats and manual slots. IndexedDB is asynchronous and the game reads
// saves synchronously, so the store reads from memory and writes through, in order (CachedStorage); what an older
// version kept in localStorage comes across once.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SaveStore, CachedStorage, memoryStorage, EXPORT_FORMAT, SAVE_VERSION, SLOTS } from "../src/core/save.js";

const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");
const tick = () => new Promise((r) => setTimeout(r, 0));
/** An IndexedDB stand-in: async, records the order writes arrive in. */
function fakeBackend(initial = {}, { fail = false, never = false } = {}) {
  const m = new Map(Object.entries(initial)), log = [];
  return {
    m, log,
    all: () => (never ? new Promise(() => {}) : fail ? Promise.reject(new Error("refused")) : tick().then(() => [...m])),
    put: (k, v) => tick().then(() => { log.push(["put", k]); m.set(k, v); }),
    del: (k) => tick().then(() => { log.push(["del", k]); m.delete(k); }),
  };
}
const save = (o) => JSON.stringify({ version: 1, player: { name: "Wren", pronouns: "they" }, flags: {}, episode: null, beat: 0, ...o });

test("CachedStorage: reads at once from memory, writes reach the backend in order", async () => {
  const be = fakeBackend({ a: "1" });
  const c = await new CachedStorage(be).load();
  assert.equal(c.getItem("a"), "1"); assert.equal(c.getItem("b"), null);
  c.setItem("b", 2); c.removeItem("a"); c.setItem("a", "3");
  assert.equal(c.getItem("b"), "2"); assert.equal(c.getItem("a"), "3", "in memory straight away");
  await c.flush();
  assert.deepEqual(be.log, [["put", "b"], ["del", "a"], ["put", "a"]]);
  assert.deepEqual([...be.m], [["b", "2"], ["a", "3"]]);
});

test("SaveStore.open: IndexedDB, with localStorage's saves carried over once (the newer copy of each) and then cleared", async () => {
  const legacy = memoryStorage();
  legacy.setItem("unwritten.save.auto", save({ savedAt: 2000, zone: "thornwick" }));
  legacy.setItem("unwritten.save.1", save({ savedAt: 500, episode: "ep3" }));
  legacy.setItem("unwritten.save.progress", JSON.stringify({ reached: 9 }));
  legacy.setItem("unwritten-settings", "{}"); // not a save: left alone
  const be = fakeBackend({ "unwritten.save.1": save({ savedAt: 900, episode: "ep4" }), "unwritten.save.progress": JSON.stringify({ reached: 6 }) });
  const s = await SaveStore.open({ backend: be, legacy });
  assert.equal(s.kind, "indexeddb");
  assert.equal(s.read("auto").zone, "thornwick", "only in localStorage: carried over");
  assert.equal(s.read("1").episode, "ep4", "IndexedDB's was newer: kept");
  assert.equal(s.reached, 9, "the progress that reaches further");
  assert.equal(JSON.parse(be.m.get("unwritten.save.auto")).zone, "thornwick", "written through");
  assert.equal(legacy.getItem("unwritten.save.auto"), null); assert.equal(legacy.getItem("unwritten.save.1"), null);
  assert.equal(legacy.getItem("unwritten-settings"), "{}");
  s.write("2", { player: { name: "Wren", pronouns: "they" }, episode: "ep10", beat: 1 }); await s.storage.flush();
  const again = await SaveStore.open({ backend: be, legacy });
  assert.equal(again.read("2").episode, "ep10", "a later visit reads it back from IndexedDB");
});

test("where IndexedDB can't be used: localStorage as before; where neither can, memory (this visit only)", async () => {
  const legacy = memoryStorage(); legacy.setItem("unwritten.save.auto", save({ savedAt: 1 }));
  const a = await SaveStore.open({ backend: fakeBackend({}, { fail: true }), legacy });
  assert.equal(a.kind, "localstorage"); assert.ok(a.read("auto"), "and nothing lost");
  const b = await SaveStore.open({ backend: fakeBackend({}, { never: true }), legacy, timeout: 20 });
  assert.equal(b.kind, "localstorage", "given a timeout, one that never answers");
  const blocked = { setItem() { throw new Error("blocked"); }, getItem() { throw new Error("blocked"); }, removeItem() {}, length: 0, key: () => null };
  assert.equal((await SaveStore.open({ backend: null, legacy: blocked })).kind, "memory");
  const main = src("main.js");
  assert.match(main, /SaveStore\.open\(\{ backend: idbBackend\(\), legacy:/);
  assert.match(main, /\.then\(\(s\) => \{ saves\.storage = s\.storage; saves\.kind = s\.kind;/, "the game switches over when it answers, however long that takes (no timeout at boot)");
  const idb = src("runtime/idb.js");
  for (const k of ["idb.open(name, 1)", "createObjectStore(store)", "openCursor()", "os.put(v, k)", "os.delete(k)"]) assert.ok(idb.includes(k), k);
});

test("export and import: every save as one document, migrated on the way back in, all or nothing", () => {
  const a = new SaveStore(memoryStorage(), "memory");
  a.write("auto", { player: { name: "Wren", pronouns: "they" }, flags: { EP4_DONE: 1 }, zone: "thornwick", episode: null, beat: 0 });
  a.write("3", { player: { name: "Wren", pronouns: "they" }, flags: {}, episode: "ep12", beat: 4 });
  a.reach(13);
  const doc = a.exportSaves();
  assert.equal(doc.format, EXPORT_FORMAT); assert.equal(doc.version, SAVE_VERSION); assert.equal(doc.reached, 13);
  assert.deepEqual(Object.keys(doc.slots).sort(), ["3", "auto"]);
  const b = new SaveStore(memoryStorage(), "memory");
  assert.deepEqual(b.importSaves(JSON.stringify(doc)).sort(), ["3", "auto"]);
  assert.equal(b.read("3").episode, "ep12"); assert.equal(b.read("auto").zone, "thornwick"); assert.equal(b.reached, 13);
  assert.equal(b.read("3").savedAt, doc.slots["3"].savedAt, "when it was saved, not when it was imported");
  // An older version's save comes up to date (the migration step); a newer one's can't be read, and nothing is written.
  const old = { format: EXPORT_FORMAT, version: 0, slots: { 1: { flags: { X: 1 }, episode: "ep2", beat: 1 } } };
  const c = new SaveStore(memoryStorage(), "memory");
  c.importSaves(old); assert.equal(c.read("1").version, SAVE_VERSION); assert.equal(c.read("1").player.name, "Rook");
  const mixed = { format: EXPORT_FORMAT, slots: { 1: { version: 1, player: { name: "A" } }, 2: { version: SAVE_VERSION + 1 } } };
  const d = new SaveStore(memoryStorage(), "memory");
  assert.throws(() => d.importSaves(mixed), /newer version/); assert.equal(d.read("1"), null, "all or nothing");
  assert.throws(() => d.importSaves("not a save"), /isn't a save file/);
  assert.throws(() => d.importSaves({ format: EXPORT_FORMAT, slots: {} }), /no saves/);
  assert.deepEqual(SLOTS, ["auto", "1", "2", "3"], "autosave and three manual slots (§21.6)");
});

test("in the game: EXPORT SAVES downloads the file and shows its text; IMPORT SAVES takes a paste or a file", () => {
  const html = readFileSync(new URL("../template.html", import.meta.url), "utf8"), main = src("main.js");
  assert.match(html, /data-transfer="export"[^>]*>EXPORT SAVES</); assert.match(html, /data-transfer="import"[^>]*>IMPORT SAVES</);
  assert.match(html, /<input type="file" accept="\.json,application\/json,text\/plain" data-transfer-input hidden>/);
  assert.match(main, /a\.download = `unwritten-saves-\$\{new Date\(\)\.toISOString\(\)\.slice\(0, 10\)\}\.json`;/);
  assert.match(main, /const got = saves\.importSaves\(tText\.value\);/);
  assert.match(main, /tText\.addEventListener\("keydown", \(e\) => e\.stopPropagation\(\)\);/, "typing a paste doesn't swing the sword");
  assert.match(main, /for \(const b of slotsModal\.querySelectorAll\("\[data-transfer\]"\)\) b\.hidden = saving;/);
  assert.match(main, /sv\.zone && ZONES\[sv\.zone\] \? `Out in \$\{ZONES\[sv\.zone\]\.name\}`/, "a save out in the world says where");
});
