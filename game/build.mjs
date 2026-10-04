// Bundle the game into one self-contained HTML file.
//   node build.mjs            → dist/index.html (open directly or host anywhere)
//   node build.mjs --serve    → also serves dist/ on http://localhost:8080
// The page loads Babylon.js from jsDelivr; everything else is inlined.

import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";

const out = await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  minify: true,
  write: false,
  legalComments: "none",
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const template = await readFile("template.html", "utf8");
// A function replacement: the bundle may contain "$'" or "$&", which a replacement string would expand.
const fragment = template.replace("<!--BUNDLE-->", () => `<script>${js}</script>`);
const page = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${fragment}\n</head>\n</html>\n`;

// Safety net: refuse to write a page whose script doesn't parse.
const inlined = fragment.match(/<script>([\s\S]*)<\/script>\s*$/);
try { new Function(inlined[1]); } catch (err) { console.error("Bundle failed to parse:", err.message); process.exit(1); }

await mkdir("dist", { recursive: true });
await writeFile("dist/index.html", page);
await writeFile("dist/fragment.html", fragment); // for hosts that supply their own document shell
console.log(`dist/index.html  ${(page.length / 1024).toFixed(1)} KB`);

if (process.argv.includes("--serve")) {
  createServer(async (req, res) => {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(await readFile("dist/index.html"));
  }).listen(8080, () => console.log("http://localhost:8080"));
}
