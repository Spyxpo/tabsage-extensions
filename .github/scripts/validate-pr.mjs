// Validates an extension pull request against the repository rules (see
// README.md "Submitting an extension"). Dependency-free Node ESM — runs on the
// stock GitHub-hosted runner with no `npm install`.
//
// Enforced:
//   1. Scope       — the PR touches exactly one `extensions/<id>/` folder and
//                    nothing outside it (one extension per PR, own folder only).
//   2. Manifest    — valid `manifest.json`: id == folder name, id charset,
//                    required non-empty fields, known permissions (incl.
//                    content_scripts), referenced js/css files present, and a
//                    `MAJOR.MINOR.PATCH` version.
//   3. Uniqueness  — a *new* extension folder can't collide with an existing one
//                    (git guarantees folder-name uniqueness; a reused name shows
//                    up as an update and must satisfy rule 4).
//   4. Increment   — an *update* to an existing extension must bump `version`
//                    strictly above the version on the base branch.
//
// Env: BASE_SHA (PR base commit), HEAD_SHA (PR head commit, optional; defaults
// to HEAD). Exits non-zero and prints ::error:: annotations on any failure.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const BASE_SHA = process.env.BASE_SHA;
const HEAD_SHA = process.env.HEAD_SHA || "HEAD";
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
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const ID_RE = /^[a-z0-9-]+$/;

const errors = [];
const notes = [];
const fail = (msg) => errors.push(msg);
const note = (msg) => notes.push(msg);

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

/** Content of a path at a given commit, or null if it doesn't exist there. */
function gitShow(ref, file) {
  try {
    return execFileSync("git", ["show", `${ref}:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/** -1 / 0 / 1 comparison of `MAJOR.MINOR.PATCH`-style version strings. */
function compareVersions(a, b) {
  const pa = a.split(".");
  const pb = b.split(".");
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = parseInt(pa[i] ?? "0", 10);
    const nb = parseInt(pb[i] ?? "0", 10);
    if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
    if (na !== nb) return na < nb ? -1 : 1;
  }
  return 0;
}

function main() {
  if (!BASE_SHA) {
    fail("BASE_SHA env var is not set (needed to diff against the base branch).");
    return;
  }

  // Files the PR introduces, relative to the merge base so unrelated base
  // history doesn't count.
  const mergeBase = git(["merge-base", BASE_SHA, HEAD_SHA]).trim();
  const changed = git(["diff", "--name-only", mergeBase, HEAD_SHA])
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (changed.length === 0) {
    note("No changed files detected; nothing to validate.");
    return;
  }

  // Rule 1 — scope.
  const touched = new Set();
  const outside = [];
  for (const f of changed) {
    const m = f.match(/^extensions\/([^/]+)\//);
    if (m) touched.add(m[1]);
    else outside.push(f);
  }

  if (outside.length > 0) {
    fail(
      `A pull request may only touch its own extension folder. Files outside ` +
        `extensions/<id>/ are not allowed here:\n  - ${outside.join("\n  - ")}`,
    );
  }
  if (touched.size === 0) {
    note("No extension folders changed; nothing to validate.");
    return;
  }
  if (touched.size > 1) {
    fail(
      `One extension per pull request. This PR changes ${touched.size} ` +
        `extensions: ${[...touched].join(", ")}. Split them into separate PRs.`,
    );
    // Still validate each so authors see every problem at once.
  }

  for (const id of touched) validateExtension(id, BASE_SHA);
}

function validateExtension(id, baseRef) {
  const dir = `extensions/${id}`;
  const manifestRel = `${dir}/manifest.json`;
  const baseRaw = gitShow(baseRef, manifestRel);
  const existedOnBase = baseRaw !== null;

  // Handle a clean removal: the folder existed on base and is gone on head.
  if (!existsSync(manifestRel)) {
    if (existedOnBase) {
      note(`Extension "${id}" is being removed — no manifest validation needed.`);
      return;
    }
    fail(`Missing ${manifestRel}. Every extension needs a manifest.json.`);
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestRel, "utf8"));
  } catch (e) {
    fail(`${manifestRel} is not valid JSON: ${e.message}`);
    return;
  }

  // Rule 2 — manifest validity.
  const need = (field) => {
    if (typeof manifest[field] !== "string" || manifest[field].trim() === "")
      fail(`${manifestRel}: "${field}" is required and must be a non-empty string.`);
  };
  ["id", "name", "version", "description", "author"].forEach(need);

  if (typeof manifest.id === "string" && manifest.id !== id)
    fail(
      `${manifestRel}: manifest id "${manifest.id}" must equal the folder name "${id}".`,
    );
  if (typeof manifest.id === "string" && !ID_RE.test(manifest.id))
    fail(`${manifestRel}: id "${manifest.id}" must match ${ID_RE} (lowercase letters, digits, hyphens).`);

  if (typeof manifest.version === "string" && !VERSION_RE.test(manifest.version))
    fail(`${manifestRel}: version "${manifest.version}" must be MAJOR.MINOR.PATCH (e.g. 1.0.0).`);

  const perms = manifest.permissions;
  if (!Array.isArray(perms)) {
    fail(`${manifestRel}: "permissions" must be an array.`);
  } else {
    for (const p of perms)
      if (!KNOWN_PERMISSIONS.includes(p))
        fail(`${manifestRel}: unknown permission "${p}". Allowed: ${KNOWN_PERMISSIONS.join(", ")}.`);
    if ((manifest.content_scripts?.length ?? 0) > 0 && !perms.includes("content_scripts"))
      fail(`${manifestRel}: content_scripts require the "content_scripts" permission.`);
  }

  const scripts = manifest.content_scripts;
  if (scripts !== undefined) {
    if (!Array.isArray(scripts)) {
      fail(`${manifestRel}: "content_scripts" must be an array.`);
    } else {
      scripts.forEach((cs, i) => {
        if (!Array.isArray(cs.matches) || cs.matches.length === 0)
          fail(`${manifestRel}: content_scripts[${i}] needs a non-empty "matches" array.`);
        if (cs.run_at && cs.run_at !== "document_start" && cs.run_at !== "document_end")
          fail(`${manifestRel}: content_scripts[${i}].run_at "${cs.run_at}" must be document_start or document_end.`);
        for (const rel of [...(cs.js ?? []), ...(cs.css ?? [])]) {
          if (typeof rel !== "string" || rel.startsWith("/") || rel.includes("..") || rel.includes(":"))
            fail(`${manifestRel}: content_scripts[${i}] references an invalid path "${rel}".`);
          else if (!existsSync(path.join(dir, rel)))
            fail(`${manifestRel}: content_scripts[${i}] references missing file "${rel}".`);
        }
      });
    }
  }

  // Rules 3 & 4 — uniqueness / version increment.
  if (existedOnBase) {
    let baseManifest = null;
    try {
      baseManifest = JSON.parse(baseRaw);
    } catch {
      /* base was somehow unparseable; treat head as authoritative */
    }
    const baseVersion = baseManifest?.version;
    const headVersion = manifest.version;
    if (baseVersion && headVersion && VERSION_RE.test(headVersion)) {
      if (compareVersions(headVersion, baseVersion) <= 0)
        fail(
          `Updating "${id}" must bump the version: base is v${baseVersion}, ` +
            `this PR is v${headVersion}. Increase the version in ${manifestRel}.`,
        );
      else note(`Update to "${id}": v${baseVersion} → v${headVersion}. ✅`);
    }
    if (baseManifest?.author && manifest.author && baseManifest.author !== manifest.author)
      note(
        `Heads up: "${id}" author changed "${baseManifest.author}" → ` +
          `"${manifest.author}". Updates should come from the original author — reviewer, please confirm.`,
      );
  } else {
    note(`New extension "${id}" (v${manifest.version}). Folder name is unique. ✅`);
  }
}

main();

for (const n of notes) console.log(n);
if (errors.length > 0) {
  console.log("");
  for (const e of errors) {
    console.log(`::error::${e.replace(/\n/g, "%0A")}`);
    console.log(`❌ ${e}`);
  }
  console.log(`\n${errors.length} problem(s) must be fixed before this PR can be merged.`);
  process.exit(1);
}
console.log("\n✅ Extension pull request checks passed.");
