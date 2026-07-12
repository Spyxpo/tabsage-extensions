#!/usr/bin/env node
// Tab Sage extension CLI. User-facing product is "Tab Sage"; this binary is
// `tabsage`. Dependency-free Node ESM (Node 18+ for global fetch).
//
// Not yet published to npm: run it locally from a clone of this repo with
// `node cli/tabsage.mjs <command>`. Once `@tabsage/cli` is published, the same
// commands work via `npx @tabsage/cli <command>`.
//
//   tabsage new <id> [--ui] [--name … --description … --author … …]
//   tabsage ui add [dir] [--version ui-vX.Y.Z] [--full]
//   tabsage ui update [dir] [--version ui-vX.Y.Z]
//   tabsage validate [id]
//   tabsage list
//   tabsage --help | --version

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve, basename } from "node:path";

const REPO = "Spyxpo/tabsage-extensions";
const KNOWN_PERMISSIONS = [
  "content_scripts",
  "storage",
  "ai",
  "tabs",
  "notifications",
  "dialogs",
  "adblock",
  "cutout",
  "clipboard",
  "downloads",
  "badge",
  "messaging",
];
const ID_RE = /^[a-z0-9-]+$/;
const VERSION_RE = /^\d+\.\d+\.\d+$/;

/* ── arg parsing ──────────────────────────────────────────────────────────── */
function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) flags[key] = true;
      else {
        flags[key] = next;
        i++;
      }
    } else positional.push(a);
  }
  return { positional, flags };
}

/* ── repo layout ──────────────────────────────────────────────────────────── */
function findRepoRoot(start) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, "extensions"))) return dir;
    const up = dirname(dir);
    if (up === dir) return resolve(start); // fall back to cwd
    dir = up;
  }
}
const cwd = process.cwd();
const repoRoot = findRepoRoot(cwd);
const extRoot = join(repoRoot, "extensions");

function camelGuard(id) {
  return (
    "__ts" +
    id
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("")
  );
}

function die(msg) {
  console.error("error: " + msg);
  process.exit(1);
}
function info(msg) {
  console.log(msg);
}

/* ── prompts (only when a value is missing and stdin is a TTY) ─────────────── */
async function prompt(question, def) {
  if (!process.stdin.isTTY) return def || "";
  process.stdout.write(def ? `${question} [${def}]: ` : `${question}: `);
  const answer = await new Promise((res) => {
    process.stdin.resume();
    process.stdin.once("data", (d) => {
      process.stdin.pause();
      res(String(d).trim());
    });
  });
  return answer || def || "";
}

/* ── UI-kit download ──────────────────────────────────────────────────────── */
async function latestUiTag() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
    headers: { "User-Agent": "tabsage-cli", Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const releases = await res.json();
  const ui = releases.filter((r) => (r.tag_name || "").startsWith("ui-v"));
  if (!ui.length) throw new Error("no ui-v* release found");
  return ui[0].tag_name;
}

async function fetchKitFile(tag, fileName) {
  const url = `https://github.com/${REPO}/releases/download/${tag}/${fileName}`;
  const res = await fetch(url, { headers: { "User-Agent": "tabsage-cli" } });
  if (!res.ok) throw new Error(`download ${fileName} @ ${tag}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Vendor tabsage-ui(.min).js into destDir. Prefer a local build if present so
// the CLI works offline; otherwise download the pinned/latest release.
async function vendorKit(destDir, { version, full } = {}) {
  const fileName = full ? "tabsage-ui.js" : "tabsage-ui.min.js";
  const localDist = join(repoRoot, "ui-kit", "dist", fileName);
  const target = join(destDir, "tabsage-ui.js"); // always land as tabsage-ui.js
  if (!version && existsSync(localDist)) {
    copyFileSync(localDist, target);
    info(`  vendored ${fileName} → ${rel(target)} (from local ui-kit/dist)`);
    return "tabsage-ui.js";
  }
  const tag = version || (await latestUiTag());
  const buf = await fetchKitFile(tag, fileName);
  writeFileSync(target, buf);
  info(`  vendored ${fileName} → ${rel(target)} (${tag})`);
  return "tabsage-ui.js";
}

function rel(p) {
  return p.startsWith(repoRoot) ? p.slice(repoRoot.length + 1) : p;
}

function readManifest(dir) {
  const p = join(dir, "manifest.json");
  if (!existsSync(p)) return null;
  return { path: p, data: JSON.parse(readFileSync(p, "utf8")) };
}
function writeManifest(m) {
  writeFileSync(m.path, JSON.stringify(m.data, null, 2) + "\n");
}
// Make sure `file` is the first entry of every content_scripts[].js array.
function ensureKitInManifest(m, file) {
  const scripts = m.data.content_scripts || [];
  for (const cs of scripts) {
    cs.js = cs.js || [];
    cs.js = cs.js.filter((f) => f !== file);
    cs.js.unshift(file);
  }
  writeManifest(m);
}

/* ── command: new ─────────────────────────────────────────────────────────── */
async function cmdNew(positional, flags) {
  const id = positional[0] || (await prompt("Extension id (a-z, 0-9, -)"));
  if (!ID_RE.test(id)) die("id must be lowercase letters, digits, and hyphens.");
  const dest = join(extRoot, id);
  if (existsSync(dest)) die(`${rel(dest)} already exists.`);

  const name = flags.name || (await prompt("Display name", id));
  const description =
    flags.description || flags.desc || (await prompt("One-line description", "A Tab Sage extension."));
  const author = flags.author || (await prompt("Author", ""));
  if (!author) die("author is required.");
  const homepage = flags.homepage || "";
  const matches = flags.matches || "<all_urls>";
  const runAt = flags["run-at"] || "document_end";
  if (runAt !== "document_start" && runAt !== "document_end")
    die("run-at must be document_start or document_end.");

  const useUi = !!flags.ui;
  let permList = (flags.permissions || flags.perms || "content_scripts")
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!permList.includes("content_scripts")) permList.unshift("content_scripts");
  for (const p of permList)
    if (!KNOWN_PERMISSIONS.includes(p))
      die(`unknown permission "${p}". Valid: ${KNOWN_PERMISSIONS.join(", ")}.`);

  mkdirSync(dest, { recursive: true });

  const js = useUi ? ["tabsage-ui.js", "content.js"] : ["content.js"];
  const manifest = {
    id,
    name,
    version: "1.0.0",
    description,
    author,
    homepage: homepage || null,
    permissions: permList,
    content_scripts: [
      { matches: [matches], js, css: ["style.css"], run_at: runAt },
    ],
  };
  writeFileSync(join(dest, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const guard = camelGuard(id);
  const content = useUi
    ? uiStarter(name, description, guard)
    : plainStarter(name, description, guard);
  writeFileSync(join(dest, "content.js"), content);
  writeFileSync(
    join(dest, "style.css"),
    `/* Styles for ${name}. The Tab Sage UI Kit styles itself, so you rarely need this. */\n`,
  );
  writeFileSync(join(dest, "README.md"), extReadme(name, description, matches, permList));

  info(`Created ${rel(dest)}`);

  if (useUi) {
    try {
      await vendorKit(dest, { version: flags.version });
    } catch (e) {
      info(`  (could not vendor the UI kit automatically: ${e.message})`);
      info(`  run: tabsage ui add ${rel(dest)}`);
    }
  }

  info("");
  info("Next steps:");
  info("  1. Edit content.js.");
  info(`  2. Tab Sage → Settings → Extensions → Load unpacked → ${rel(dest)}`);
  info("  3. Reload a matching page to test it.");
}

function plainStarter(name, description, guard) {
  return `// ${name} — ${description}
(function () {
  if (window.${guard}) return;
  window.${guard} = true;

  console.log("${name} ready on", location.href);

  // The \`tabsage\` host API is an in-scope local (NOT window.tabsage):
  //   if (typeof tabsage !== "undefined" && tabsage.ai) { ... }
  // See README.md / DEVELOP.md for the full reference.
})();
`;
}

function uiStarter(name, description, guard) {
  return `// ${name} — ${description}
(function () {
  if (window.${guard}) return;
  window.${guard} = true;
  if (typeof TabSageUI === "undefined") return; // tabsage-ui.js loads first

  // A Tab Sage-styled corner button that opens a menu. See DEVELOP.md → UI Kit.
  TabSageUI.launcher({
    label: "${name}",
    icon: "sparkle",
    corner: "bottom-right",
    menu: [
      {
        label: "Do something",
        icon: "sparkle",
        onClick: function () {
          TabSageUI.toast("Hello from ${name}", { variant: "ok" });
        },
      },
      { label: "Settings", icon: "settings", onClick: function () {} },
    ],
  });
})();
`;
}

function extReadme(name, description, matches, perms) {
  return `# ${name}

${description}

## What it touches

- Runs on: \`${matches}\` (never in incognito).
- Describe here exactly what the extension reads or changes.

## Permissions

${perms.join(", ")}

## Changes

- 1.0.0 — Initial release.
`;
}

/* ── command: ui add / update ─────────────────────────────────────────────── */
async function cmdUi(positional, flags) {
  const sub = positional[0];
  if (sub !== "add" && sub !== "update")
    die("usage: tabsage ui add|update [dir] [--version ui-vX.Y.Z] [--full]");
  const dir = resolve(positional[1] || cwd);
  const m = readManifest(dir);
  if (!m) die(`no manifest.json in ${rel(dir)} — point at an extension folder.`);
  const file = await vendorKit(dir, { version: flags.version, full: !!flags.full });
  ensureKitInManifest(m, file);
  info(`  ${sub === "add" ? "added" : "updated"} "${file}" in ${rel(m.path)}`);
}

/* ── command: validate ────────────────────────────────────────────────────── */
function validateOne(id) {
  const dir = join(extRoot, id);
  const problems = [];
  const m = readManifest(dir);
  if (!m) return [`${id}: missing manifest.json`];
  const d = m.data;
  for (const f of ["id", "name", "version", "description", "author"])
    if (typeof d[f] !== "string" || !d[f].trim())
      problems.push(`${id}: "${f}" is required and must be a non-empty string.`);
  if (d.id && d.id !== id) problems.push(`${id}: manifest id "${d.id}" must equal folder name.`);
  if (d.id && !ID_RE.test(d.id)) problems.push(`${id}: id must match ${ID_RE}.`);
  if (d.version && !VERSION_RE.test(d.version))
    problems.push(`${id}: version "${d.version}" must be MAJOR.MINOR.PATCH.`);
  if (!Array.isArray(d.permissions)) problems.push(`${id}: "permissions" must be an array.`);
  else
    for (const p of d.permissions)
      if (!KNOWN_PERMISSIONS.includes(p))
        problems.push(`${id}: unknown permission "${p}".`);
  const scripts = d.content_scripts || [];
  if ((scripts.length ?? 0) > 0 && !(d.permissions || []).includes("content_scripts"))
    problems.push(`${id}: content_scripts require the "content_scripts" permission.`);
  scripts.forEach((cs, i) => {
    if (!Array.isArray(cs.matches) || !cs.matches.length)
      problems.push(`${id}: content_scripts[${i}] needs a non-empty "matches".`);
    for (const relf of [...(cs.js || []), ...(cs.css || [])]) {
      if (typeof relf !== "string" || relf.startsWith("/") || relf.includes("..") || relf.includes(":"))
        problems.push(`${id}: content_scripts[${i}] invalid path "${relf}".`);
      else if (!existsSync(join(dir, relf)))
        problems.push(`${id}: content_scripts[${i}] missing file "${relf}".`);
    }
  });
  return problems;
}

function cmdValidate(positional) {
  const ids = positional.length ? positional : listExtensionIds();
  let bad = 0;
  for (const id of ids) {
    const problems = validateOne(id);
    if (problems.length) {
      bad += problems.length;
      for (const p of problems) console.log("❌ " + p);
    } else console.log(`✅ ${id}`);
  }
  if (bad) {
    console.log(`\n${bad} problem(s).`);
    process.exit(1);
  }
  console.log("\nAll good.");
}

/* ── command: list ────────────────────────────────────────────────────────── */
function listExtensionIds() {
  if (!existsSync(extRoot)) return [];
  return readdirSync(extRoot).filter((n) => {
    const p = join(extRoot, n);
    return statSync(p).isDirectory() && existsSync(join(p, "manifest.json"));
  });
}
function cmdList() {
  const ids = listExtensionIds();
  if (!ids.length) return info("No extensions found.");
  for (const id of ids) {
    const m = readManifest(join(extRoot, id));
    info(`${id.padEnd(20)} v${m?.data?.version || "?"}  ${m?.data?.name || ""}`);
  }
}

/* ── help / version ───────────────────────────────────────────────────────── */
const HELP = `Tab Sage — extension CLI (binary: tabsage)

Not on npm yet — run locally from a clone: node cli/tabsage.mjs <command>
(Once published, npx @tabsage/cli <command> works the same.)

Usage:
  tabsage new <id> [--ui] [--name N --description D --author A]
                   [--permissions p1,p2] [--matches <all_urls>] [--run-at document_end]
  tabsage ui add [dir] [--version ui-vX.Y.Z] [--full]
  tabsage ui update [dir] [--version ui-vX.Y.Z]
  tabsage validate [id]
  tabsage list

Options:
  --ui        Scaffold a new extension pre-wired with the Tab Sage UI Kit.
  --version   Pin a UI-kit release tag (default: latest ui-v* release, or the
              local ui-kit build when run inside this repo).
  --full      Vendor the readable tabsage-ui.js instead of the minified build.

Docs: README.md and DEVELOP.md.`;

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { positional, flags } = parseArgs(rest);
  switch (cmd) {
    case "new":
    case "create":
      return cmdNew(positional, flags);
    case "ui":
      return cmdUi(positional, flags);
    case "validate":
    case "check":
      return cmdValidate(positional);
    case "list":
    case "ls":
      return cmdList();
    case "-V":
    case "--version":
      return info(readPkgVersion());
    case undefined:
    case "-h":
    case "--help":
    case "help":
      return info(HELP);
    default:
      die(`unknown command "${cmd}". Run \`tabsage --help\`.`);
  }
}

function readPkgVersion() {
  try {
    const p = new URL("./package.json", import.meta.url);
    return "tabsage " + JSON.parse(readFileSync(p, "utf8")).version;
  } catch {
    return "tabsage";
  }
}

main().catch((e) => die(e && e.message ? e.message : String(e)));
