#!/usr/bin/env node
// Validate that files referenced in CLAUDE.md / .claude/**/*.md actually exist.
// Usage: npm run meta:validate

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");

function walk(dir, filter, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, filter, acc);
    else if (filter(p)) acc.push(p);
  }
  return acc;
}

// Agent-navigation docs to scan.
const DOC_FILES = [
  path.join(ROOT, "CLAUDE.md"),
  ...walk(path.join(ROOT, ".claude"), (f) => f.endsWith(".md")),
];

// Match backticked paths that look like *repo-relative* file refs.
// Requirements: must contain a `/` (so `foo.ts` alone won't match — that's a
// bare filename, not a path), must start with a letter or `.`, must end with a
// recognized source extension.
const PATH_RE = /`([a-zA-Z][a-zA-Z0-9_.-]*\/[a-zA-Z0-9_./-]+\.(?:ts|tsx|js|json|md|css|yml|yaml|html|sh))`/g;

const errors = [];
const warnings = [];

for (const docFile of DOC_FILES) {
  if (!fs.existsSync(docFile)) continue;
  const src = fs.readFileSync(docFile, "utf8");
  const relDoc = path.relative(ROOT, docFile);
  let m;
  const seen = new Set();
  while ((m = PATH_RE.exec(src)) !== null) {
    const p = m[1];
    if (seen.has(p)) continue;
    seen.add(p);

    // Skip obvious non-paths: URLs, wildcard globs, env-style keys.
    if (p.includes("://")) continue;
    if (p.includes("*")) continue; // glob — skip
    if (p.startsWith("http")) continue;
    if (/^[A-Z_]+$/.test(p.replace(/\./g, ""))) continue;
    // Skip pseudo examples like `"YYYY-MM"` that slipped through.
    if (p.startsWith('"') || p.startsWith("'")) continue;

    const abs = path.join(ROOT, p);
    if (!fs.existsSync(abs)) {
      errors.push(`${relDoc}: missing file \`${p}\``);
    }
  }
}

// Validate metadata files are fresh (exist; sanity-check shape).
const metaDir = path.join(ROOT, ".claude", "metadata");
const expectedMeta = ["summary.json", "routes.json", "components.json", "functions.json"];
for (const f of expectedMeta) {
  const abs = path.join(metaDir, f);
  if (!fs.existsSync(abs)) {
    warnings.push(`.claude/metadata/${f} missing — run: npm run meta:generate`);
    continue;
  }
  try {
    const json = JSON.parse(fs.readFileSync(abs, "utf8"));
    if (!json.generatedAt) warnings.push(`${f}: no generatedAt field`);
  } catch (e) {
    errors.push(`${f}: invalid JSON — ${e.message}`);
  }
}

if (warnings.length) {
  console.warn("WARNINGS:");
  for (const w of warnings) console.warn("  " + w);
}
if (errors.length) {
  console.error("ERRORS:");
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(`[meta:validate] ok — scanned ${DOC_FILES.length} doc files`);
