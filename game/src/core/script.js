// Dialogue scripts (GDD §20 "ink or Yarn: decided in Phase 3"). Decision: a Yarn-style plain-text
// format with our own small parser, so writers get Yarn's syntax with zero runtime dependencies.
//
//   title: Ep1_Steps
//   ---
//   // a comment
//   Severin: One page. They should've given you none.
//   A crowd murmurs.                                (narration: no speaker)
//   -> Bold: "Say that again." #bold                (an option; its body is indented below it)
//       Severin: Gladly.
//   -> Walk past him. <<if $MET_MOSS>> #wry
//   <<set $SEVERIN_SNUB to 1>>
//   <<if $EXAM_DUEL_WON>> … <<elseif …>> … <<else>> … <<endif>>
//   <<jump Ep1_Ceremony>>   <<stop>>   <<anything else args>> → a command for the host (camera, wait, sfx…)
//   ===
//
// Text tokens: {name}, {they} {them} {their} {theirs} {themself} (capitalize the first letter for
// sentence starts: {They}), verb helpers {is} {was} {has} {s} {es} ("{they} walk{s}"), and {$FLAG}.

import { compileExpr, truthy } from "./flags.js";

const TEMPERS = new Set(["bold", "earnest", "wry"]);

/** Parse a script file into { nodeName: { title, tags, body } }. Throws with a line number on errors. */
export function parseScript(src, file = "script") {
  const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
  const nodes = {};
  let i = 0;
  const fail = (n, msg) => { throw new SyntaxError(`${file}:${n + 1}: ${msg}`); };
  while (i < lines.length) {
    // Header: key: value lines up to ---
    const header = {};
    while (i < lines.length && lines[i].trim() !== "---") {
      const t = lines[i].trim();
      if (t && !t.startsWith("//")) {
        const m = /^(\w+)\s*:\s*(.*)$/.exec(t);
        if (!m) fail(i, `expected "key: value" or ---, got "${t}"`);
        header[m[1]] = m[2].trim();
      }
      i++;
    }
    if (i >= lines.length) { if (Object.keys(header).length) fail(i - 1, "node header without a --- body"); break; }
    if (!header.title) fail(i, "node without a title");
    if (nodes[header.title]) fail(i, `duplicate node "${header.title}"`);
    i++; // ---
    const body = [];
    const start = i;
    while (i < lines.length && lines[i].trim() !== "===") { body.push({ n: i, raw: lines[i] }); i++; }
    if (i >= lines.length) fail(start, `node "${header.title}" is missing its closing ===`);
    i++; // ===
    nodes[header.title] = { title: header.title, tags: (header.tags ?? "").split(/\s+/).filter(Boolean), body: compileBody(body, fail) };
  }
  // Validate jumps.
  for (const node of Object.values(nodes)) walk(node.body, (s) => {
    if (s.type === "jump" && !nodes[s.target]) throw new SyntaxError(`${file}: node "${node.title}" jumps to unknown node "${s.target}"`);
  });
  return nodes;
}

function walk(block, fn) {
  for (const s of block) {
    fn(s);
    if (s.type === "options") for (const o of s.items) walk(o.body, fn);
    if (s.type === "if") { for (const b of s.branches) walk(b.body, fn); walk(s.otherwise, fn); }
  }
}

const indentOf = (raw) => raw.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;
const splitTags = (text) => {
  const tags = [];
  const clean = text.replace(/\s#([\w:-]+)/g, (_, t) => { tags.push(t); return ""; }).replace(/^#([\w:-]+)\s*/, (_, t) => { tags.push(t); return ""; });
  return { text: clean.trim(), tags };
};

function compileBody(lines, fail) {
  const items = lines.filter((l) => l.raw.trim() && !l.raw.trim().startsWith("//"));
  let k = 0;
  const block = (minIndent) => {
    const out = [];
    while (k < items.length) {
      const { n, raw } = items[k];
      const ind = indentOf(raw);
      if (ind < minIndent) break;
      const t = raw.trim();
      const cmd = /^<<\s*(\w+)\s*(.*?)\s*>>$/.exec(t);
      if (cmd && ["elseif", "else", "endif"].includes(cmd[1])) break; // handled by the enclosing if
      k++;
      if (t.startsWith("->")) {
        // A group of options at this indent.
        const group = { type: "options", items: [], n };
        k--;
        while (k < items.length && indentOf(items[k].raw) === ind && items[k].raw.trim().startsWith("->")) {
          const on = items[k].n;
          let text = items[k].raw.trim().slice(2).trim();
          let cond = null;
          text = text.replace(/<<\s*if\s+(.*?)\s*>>/, (_, e) => { cond = e; return ""; });
          const { text: clean, tags } = splitTags(text);
          if (!clean) fail(on, "empty option");
          k++;
          const body = k < items.length && indentOf(items[k].raw) > ind ? block(indentOf(items[k].raw)) : [];
          group.items.push({ text: clean, tags, cond: cond ? safeCompile(cond, on, fail) : null, condSrc: cond, body });
        }
        out.push(group);
        continue;
      }
      if (cmd) {
        const [, name, rest] = cmd;
        if (name === "if") {
          const branches = [{ cond: safeCompile(rest, n, fail), body: block(ind) }];
          let otherwise = [];
          for (;;) {
            if (k >= items.length) fail(n, "<<if>> without <<endif>>");
            const m = /^<<\s*(\w+)\s*(.*?)\s*>>$/.exec(items[k].raw.trim());
            k++;
            if (m[1] === "elseif") branches.push({ cond: safeCompile(m[2], items[k - 1].n, fail), body: block(ind) });
            else if (m[1] === "else") otherwise = block(ind);
            else if (m[1] === "endif") break;
          }
          out.push({ type: "if", branches, otherwise, n });
        } else if (name === "set") {
          const m = /^\$(\w+)\s*(?:to|=)\s*(.+)$/.exec(rest);
          if (!m) fail(n, `bad <<set>>: use <<set $FLAG to value>>`);
          out.push({ type: "set", name: m[1], expr: safeCompile(m[2], n, fail), n });
        } else if (name === "jump") {
          if (!/^\w+$/.test(rest)) fail(n, "bad <<jump>>");
          out.push({ type: "jump", target: rest, n });
        } else if (name === "stop") {
          out.push({ type: "stop", n });
        } else {
          out.push({ type: "cmd", name, args: rest ? rest.split(/\s+/) : [], n });
        }
        continue;
      }
      if (t.startsWith("<<")) fail(n, `unclosed or malformed command "${t}"`);
      const sp = /^([A-Z?][\w?'. -]{0,30}?):\s+(.*)$/.exec(t);
      const { text, tags } = splitTags(sp ? sp[2] : t);
      out.push({ type: "line", speaker: sp ? sp[1] : null, text, tags, n });
    }
    return out;
  };
  const body = block(0);
  if (k < items.length) fail(items[k].n, `unexpected "${items[k].raw.trim()}"`);
  return body;
}

function safeCompile(src, n, fail) {
  try { return compileExpr(src); } catch (e) { return fail(n, e.message); }
}

// ---- Pronouns and text tokens --------------------------------------------------------------

export const PRONOUNS = Object.freeze({
  he: { they: "he", them: "him", their: "his", theirs: "his", themself: "himself", is: "is", was: "was", has: "has", s: "s", es: "es" },
  she: { they: "she", them: "her", their: "her", theirs: "hers", themself: "herself", is: "is", was: "was", has: "has", s: "s", es: "es" },
  they: { they: "they", them: "them", their: "their", theirs: "theirs", themself: "themself", is: "are", was: "were", has: "have", s: "", es: "" },
});

/** Replace {tokens} in a line. Unknown tokens are left visible so writers notice them. */
export function fillText(text, { name = "Rook", pronouns = "they", flags = null } = {}) {
  const P = PRONOUNS[pronouns] ?? PRONOUNS.they;
  return text.replace(/\{(\$?[\w']+)\}/g, (whole, key) => {
    if (key.startsWith("$")) return flags ? String(flags.get(key.slice(1))) : whole;
    if (key === "name") return name;
    const lower = key[0].toLowerCase() + key.slice(1);
    const v = P[lower];
    if (v === undefined) return whole;
    return key[0] !== lower[0] ? v[0].toUpperCase() + v.slice(1) : v;
  });
}

// ---- Runner -----------------------------------------------------------------------------------

/**
 * Steps through nodes. next() returns one of:
 *   { type: "line", speaker, text, tags } · { type: "options", options: [{ index, text, tags, enabled }] }
 *   { type: "command", name, args } · { type: "end" }
 * After "options", call choose(index) before next(). Choosing an option tagged #bold, #earnest,
 * or #wry raises that Temper flag (GDD §4: tone, not morality).
 */
export class DialogueRunner {
  constructor(nodes, flags, context = {}) {
    this.nodes = nodes;
    this.flags = flags;
    this.context = context; // { name, pronouns }
    this.stack = [];
    this.pending = null;
    this.node = null;
    this.visited = new Set();
  }

  start(name) {
    const node = this.nodes[name];
    if (!node) throw new Error(`no dialogue node "${name}"`);
    this.node = name;
    this.visited.add(name);
    this.stack = [{ block: node.body, i: 0 }];
    this.pending = null;
    return this;
  }

  get running() { return this.stack.length > 0 || !!this.pending; }

  text(s) { return fillText(s, { ...this.context, flags: this.flags }); }

  next() {
    if (this.pending) throw new Error("choose an option first");
    for (let guard = 0; guard < 10000; guard++) {
      const top = this.stack[this.stack.length - 1];
      if (!top) return { type: "end" };
      if (top.i >= top.block.length) { this.stack.pop(); continue; }
      const s = top.block[top.i++];
      switch (s.type) {
        case "line": return { type: "line", speaker: s.speaker, text: this.text(s.text), tags: s.tags };
        case "set": this.flags.set(s.name, s.expr(this.flags)); break;
        case "if": {
          const hit = s.branches.find((b) => truthy(b.cond(this.flags)));
          const body = hit ? hit.body : s.otherwise;
          if (body.length) this.stack.push({ block: body, i: 0 });
          break;
        }
        case "jump": this.start(s.target); break;
        case "stop": this.stack = []; return { type: "end" };
        case "cmd": return { type: "command", name: s.name, args: s.args.map((a) => this.text(a)) };
        case "options": {
          const options = s.items.map((o, index) => ({ index, text: this.text(o.text), tags: o.tags, enabled: !o.cond || truthy(o.cond(this.flags)) }));
          if (!options.some((o) => o.enabled)) break; // nothing to choose: skip the group
          this.pending = s;
          return { type: "options", options };
        }
        default: throw new Error(`unknown statement ${s.type}`);
      }
    }
    throw new Error("dialogue loop: too many steps without output");
  }

  choose(index) {
    const s = this.pending;
    if (!s) throw new Error("no options to choose from");
    const o = s.items[index];
    if (!o || (o.cond && !truthy(o.cond(this.flags)))) throw new RangeError(`option ${index} isn't available`);
    this.pending = null;
    for (const t of o.tags) if (TEMPERS.has(t)) this.flags.add(`TEMPER_${t.toUpperCase()}`);
    if (o.body.length) this.stack.push({ block: o.body, i: 0 });
    return o;
  }
}
