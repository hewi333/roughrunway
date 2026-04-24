#!/usr/bin/env node
// Generate .claude/metadata/*.json from source.
// Run: npm run meta:generate

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const META = path.join(ROOT, ".claude", "metadata");

function walk(dir, filter, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, filter, acc);
    else if (filter(p)) acc.push(p);
  }
  return acc;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll(path.sep, "/");
}

// ─── routes.json ─────────────────────────────────────────────────────────────
function collectRoutes() {
  const apiDir = path.join(ROOT, "app", "api");
  const files = walk(apiDir, (f) => f.endsWith("route.ts"));
  const routes = files
    .map((f) => {
      const urlPath =
        "/api/" +
        path
          .relative(apiDir, path.dirname(f))
          .replaceAll(path.sep, "/");
      const src = fs.readFileSync(f, "utf8");
      const methods = [];
      if (/export\s+async\s+function\s+GET\b/.test(src)) methods.push("GET");
      if (/export\s+async\s+function\s+POST\b/.test(src)) methods.push("POST");
      if (/export\s+async\s+function\s+PUT\b/.test(src)) methods.push("PUT");
      if (/export\s+async\s+function\s+DELETE\b/.test(src)) methods.push("DELETE");
      const usesPerplexity = /perplexity\./.test(src) || /PERPLEXITY_API_KEY/.test(src);
      return {
        path: urlPath,
        file: rel(f),
        methods,
        usesPerplexity,
        lines: src.split("\n").length,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  return { generatedAt: new Date().toISOString(), routes };
}

// ─── components.json ─────────────────────────────────────────────────────────
function collectComponents() {
  const compDir = path.join(ROOT, "components");
  const files = walk(compDir, (f) => f.endsWith(".tsx"));
  const components = files
    .map((f) => {
      const src = fs.readFileSync(f, "utf8");
      const name = path.basename(f, ".tsx");
      const domain =
        path.relative(compDir, path.dirname(f)).split(path.sep)[0] || "top-level";
      const isClient = /^\s*"use client"/m.test(src);
      const exports = [
        ...src.matchAll(/export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/g),
      ].map((m) => m[1]);
      return {
        name,
        file: rel(f),
        domain,
        isClient,
        exports,
        lines: src.split("\n").length,
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
  return { generatedAt: new Date().toISOString(), components };
}

// ─── functions.json ──────────────────────────────────────────────────────────
function collectFunctions() {
  const libDir = path.join(ROOT, "lib");
  const files = walk(libDir, (f) => f.endsWith(".ts") && !f.endsWith(".d.ts"));
  const functions = [];
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const lines = src.split("\n");
    // Export function declarations
    lines.forEach((line, i) => {
      const m = line.match(
        /^\s*export\s+(?:async\s+)?function\s+(\w+)\s*(<[^>]*>)?\s*\(([^)]*)\)/,
      );
      if (m) {
        functions.push({
          name: m[1],
          file: rel(f),
          line: i + 1,
          signature: line.trim(),
          kind: "function",
        });
      }
      // Exported const arrow functions
      const cm = line.match(
        /^\s*export\s+const\s+(\w+)\s*(?::[^=]+)?=\s*(?:async\s+)?\(([^)]*)\)\s*=>/,
      );
      if (cm) {
        functions.push({
          name: cm[1],
          file: rel(f),
          line: i + 1,
          signature: line.trim(),
          kind: "const-arrow",
        });
      }
    });
  }
  functions.sort((a, b) => a.name.localeCompare(b.name));
  // Rough call graph: for each function, list callers (other function names referenced in its source region)
  return { generatedAt: new Date().toISOString(), functions };
}

// ─── summary.json ────────────────────────────────────────────────────────────
function buildSummary(routes, components, functions) {
  const tsFiles = [
    ...walk(path.join(ROOT, "app"), (f) => f.endsWith(".ts") || f.endsWith(".tsx")),
    ...walk(path.join(ROOT, "lib"), (f) => f.endsWith(".ts") || f.endsWith(".tsx")),
    ...walk(path.join(ROOT, "components"), (f) => f.endsWith(".ts") || f.endsWith(".tsx")),
  ];
  const totalLines = tsFiles.reduce(
    (s, f) => s + fs.readFileSync(f, "utf8").split("\n").length,
    0,
  );
  const pagesDir = path.join(ROOT, "app");
  const pages = walk(pagesDir, (f) => f.endsWith("page.tsx")).map(rel);
  return {
    generatedAt: new Date().toISOString(),
    repo: "roughrunway",
    framework: "next.js 14 (app router)",
    counts: {
      apiRoutes: routes.routes.length,
      pages: pages.length,
      components: components.components.length,
      libFunctions: functions.functions.length,
      tsFiles: tsFiles.length,
      tsLines: totalLines,
    },
    pages,
    apiRoutes: routes.routes.map((r) => r.path),
    componentDomains: [...new Set(components.components.map((c) => c.domain))].sort(),
  };
}

// ─── run ─────────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(META)) fs.mkdirSync(META, { recursive: true });

  const routes = collectRoutes();
  const components = collectComponents();
  const functions = collectFunctions();
  const summary = buildSummary(routes, components, functions);

  fs.writeFileSync(
    path.join(META, "routes.json"),
    JSON.stringify(routes, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(META, "components.json"),
    JSON.stringify(components, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(META, "functions.json"),
    JSON.stringify(functions, null, 2) + "\n",
  );
  fs.writeFileSync(
    path.join(META, "summary.json"),
    JSON.stringify(summary, null, 2) + "\n",
  );

  console.log(
    `[meta] routes=${routes.routes.length} components=${components.components.length} libFns=${functions.functions.length}`,
  );
}

main();
