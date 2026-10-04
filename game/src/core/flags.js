// Story state (GDD §21.4): one flat store of named values, the single source of truth for
// quests, dialogue, and world objects. Plus a tiny, safe expression language for conditions
// (no eval): numbers, strings, true/false, $FLAGS, + - * /, comparisons, and/or/not.

export class FlagStore {
  constructor(initial = {}) {
    this.values = new Map();
    this.listeners = new Set();
    this.load(initial);
  }

  /** Unset flags read as 0, so conditions never crash on a flag nobody has written yet. */
  get(name) { return this.values.has(name) ? this.values.get(name) : 0; }
  has(name) { return this.values.has(name); }

  set(name, value) {
    if (typeof name !== "string" || !name) throw new TypeError("flag name");
    if (typeof value === "boolean") value = value ? 1 : 0;
    if (typeof value !== "number" && typeof value !== "string") throw new TypeError(`flag ${name}: number or string`);
    const old = this.get(name);
    this.values.set(name, value);
    if (old !== value) for (const fn of this.listeners) fn(name, value, old);
    return value;
  }

  add(name, n = 1) { return this.set(name, Number(this.get(name)) + n); }
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  snapshot() { return Object.fromEntries(this.values); }
  load(obj) {
    this.values.clear();
    for (const [k, v] of Object.entries(obj ?? {})) if (typeof v === "number" || typeof v === "string") this.values.set(k, v);
  }
}

// ---- Expressions -------------------------------------------------------------------------

const TOKEN = /\s*(?:(\d+(?:\.\d+)?)|("(?:[^"\\]|\\.)*")|(\$[A-Za-z_][\w]*)|(==|!=|>=|<=|&&|\|\||[-+*/<>!()])|([A-Za-z_]\w*))/y;
const WORD_OPS = { and: "&&", or: "||", not: "!", is: "==", eq: "==", neq: "!=", gt: ">", lt: "<", gte: ">=", lte: "<=" };

function tokenize(src) {
  const out = [];
  TOKEN.lastIndex = 0;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    TOKEN.lastIndex = i;
    const m = TOKEN.exec(src);
    if (!m) throw new SyntaxError(`bad expression near "${src.slice(i, i + 12)}"`);
    i = TOKEN.lastIndex;
    if (m[1]) out.push({ t: "num", v: Number(m[1]) });
    else if (m[2]) out.push({ t: "str", v: JSON.parse(m[2]) });
    else if (m[3]) out.push({ t: "var", v: m[3].slice(1) });
    else if (m[4]) out.push({ t: "op", v: m[4] });
    else if (m[5] === "true" || m[5] === "false") out.push({ t: "num", v: m[5] === "true" ? 1 : 0 });
    else if (WORD_OPS[m[5]]) out.push({ t: "op", v: WORD_OPS[m[5]] });
    else throw new SyntaxError(`unknown word "${m[5]}" (flags start with $)`);
  }
  return out;
}

const BINARY = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6 };

/** Compile an expression to a function of a FlagStore (or anything with get(name)). */
export function compileExpr(src) {
  const toks = tokenize(String(src));
  let i = 0;
  const peek = () => toks[i];
  const take = () => toks[i++];
  const primary = () => {
    const tk = take();
    if (!tk) throw new SyntaxError(`expression ended early: "${src}"`);
    if (tk.t === "num" || tk.t === "str") return () => tk.v;
    if (tk.t === "var") return (f) => f.get(tk.v);
    if (tk.v === "(") { const e = binary(0); if (take()?.v !== ")") throw new SyntaxError(`missing ) in "${src}"`); return e; }
    if (tk.v === "!") { const e = primary(); return (f) => (truthy(e(f)) ? 0 : 1); }
    if (tk.v === "-") { const e = primary(); return (f) => -Number(e(f)); }
    throw new SyntaxError(`unexpected "${tk.v}" in "${src}"`);
  };
  const binary = (minPrec) => {
    let left = primary();
    for (;;) {
      const tk = peek();
      const prec = tk?.t === "op" ? BINARY[tk.v] : undefined;
      if (prec === undefined || prec <= minPrec) return left;
      take();
      const l = left, r = binary(prec), op = tk.v;
      left = (f) => apply(op, l, r, f);
    }
  };
  const e = binary(0);
  if (i < toks.length) throw new SyntaxError(`extra "${toks[i].v}" in "${src}"`);
  return e;
}

function apply(op, l, r, f) {
  if (op === "&&") return truthy(l(f)) ? (truthy(r(f)) ? 1 : 0) : 0;
  if (op === "||") return truthy(l(f)) || truthy(r(f)) ? 1 : 0;
  const a = l(f), b = r(f);
  switch (op) {
    case "==": return a == b ? 1 : 0; // eslint-disable-line eqeqeq -- "1" == 1 is what writers mean
    case "!=": return a != b ? 1 : 0; // eslint-disable-line eqeqeq
    case "<": return a < b ? 1 : 0;
    case ">": return a > b ? 1 : 0;
    case "<=": return a <= b ? 1 : 0;
    case ">=": return a >= b ? 1 : 0;
    case "+": return typeof a === "string" || typeof b === "string" ? `${a}${b}` : a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? 0 : a / b;
    default: throw new SyntaxError(op);
  }
}

export const truthy = (v) => v !== 0 && v !== "" && v !== "0" && v != null && v !== false;
export const evalExpr = (src, flags) => compileExpr(src)(flags);
