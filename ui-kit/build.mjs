#!/usr/bin/env node
// Build the Tab Sage UI Kit: concatenate src/ into single-file dist/ artifacts,
// embedding the (minified) CSS into the JS so an extension can vendor just one
// file. Dependency-free — runs on stock Node 18+ with no `npm install`.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });

const read = (p) => readFileSync(join(src, p), "utf8");

// ── CSS ────────────────────────────────────────────────────────────────────
const cssFull = [read("tokens.css"), read("base.css"), read("components.css")]
  .join("\n")
  .trim();

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // strip comments
    .replace(/\s+/g, " ") // collapse whitespace
    .replace(/\s*([{}:;,>])\s*/g, "$1") // tighten around punctuation
    .replace(/;}/g, "}")
    .trim();
}
const cssMin = minifyCss(cssFull);

// ── JS ─────────────────────────────────────────────────────────────────────
const iconsSrc = read("icons.js");
const uiSrc = read("tabsage-ui.js");
if (!uiSrc.includes('"__TS_UI_CSS__"')) {
  console.error("build: CSS marker __TS_UI_CSS__ not found in tabsage-ui.js");
  process.exit(1);
}
const jsFull =
  iconsSrc.trimEnd() +
  "\n\n" +
  uiSrc.replace('"__TS_UI_CSS__"', JSON.stringify(cssMin));

// Conservative line-based minify: drop blank lines and banner/`//` comments.
// Never touches code (won't match `http://` mid-line or `/*` inside strings —
// the source has no such cases). Keeps the result readable-ish but smaller.
function minifyJs(js) {
  const out = [];
  let inBlock = false;
  for (const raw of js.split("\n")) {
    const t = raw.trim();
    if (inBlock) {
      if (t.includes("*/")) inBlock = false;
      continue;
    }
    if (t.startsWith("/*")) {
      if (!t.includes("*/")) inBlock = true;
      continue;
    }
    if (t === "" || t.startsWith("//")) continue;
    out.push(raw.replace(/\s+$/, ""));
  }
  return out.join("\n");
}
const jsMin = minifyJs(jsFull);

// ── write ───────────────────────────────────────────────────────────────────
writeFileSync(join(dist, "tabsage-ui.css"), cssFull + "\n");
writeFileSync(join(dist, "tabsage-ui.min.css"), cssMin + "\n");
writeFileSync(join(dist, "tabsage-ui.js"), jsFull + "\n");
writeFileSync(join(dist, "tabsage-ui.min.js"), jsMin + "\n");

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + " KB";
console.log("Tab Sage UI Kit built → ui-kit/dist/");
console.log("  tabsage-ui.css      " + kb(cssFull));
console.log("  tabsage-ui.min.css  " + kb(cssMin));
console.log("  tabsage-ui.js       " + kb(jsFull));
console.log("  tabsage-ui.min.js   " + kb(jsMin));
