#!/usr/bin/env node
// Broader health signals beyond validate-docs.js:
// - CLAUDE.md not oversized
// - Every routes.json entry has a row in CLAUDE.md Task Routing
// - Rules / entry files exist for every pointer in CLAUDE.md
// Usage: node .claude/scripts/doc-health-check.js

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

const issues = [];

// 1. CLAUDE.md size
const claudeMd = readIfExists(path.join(ROOT, "CLAUDE.md"));
if (!claudeMd) {
  issues.push("CLAUDE.md missing");
} else {
  const lineCount = claudeMd.split("\n").length;
  if (lineCount > 260) {
    issues.push(`CLAUDE.md is ${lineCount} lines; keep under ~250 (split details into .claude/rules/*)`);
  }
}

// 2. Routes present in CLAUDE.md
const routesPath = path.join(ROOT, ".claude", "metadata", "routes.json");
if (fs.existsSync(routesPath) && claudeMd) {
  const { routes } = JSON.parse(fs.readFileSync(routesPath, "utf8"));
  const routesMentioned = routes.filter((r) => !claudeMd.includes(r.path));
  if (routesMentioned.length) {
    issues.push(
      `Routes not referenced anywhere in CLAUDE.md: ${routesMentioned.map((r) => r.path).join(", ")}`,
    );
  }
}

// 3. Entry / rules files exist
const entryDir = path.join(ROOT, ".claude", "entry");
const rulesDir = path.join(ROOT, ".claude", "rules");
for (const dir of [entryDir, rulesDir]) {
  if (!fs.existsSync(dir) || !fs.readdirSync(dir).length) {
    issues.push(`Expected files under ${path.relative(ROOT, dir)} but folder is empty`);
  }
}

// 4. Size checks on rules/entry — flag oversized
for (const dir of [entryDir, rulesDir]) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const full = path.join(dir, f);
    const lines = fs.readFileSync(full, "utf8").split("\n").length;
    if (lines > 250) {
      issues.push(`${path.relative(ROOT, full)} is ${lines} lines; consider splitting`);
    }
  }
}

if (issues.length) {
  console.warn("[doc-health] issues:");
  for (const i of issues) console.warn("  - " + i);
  process.exit(1);
}

console.log("[doc-health] ok");
