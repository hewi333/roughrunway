# CryptoRunway — Agent-Friendly Architecture

**Status**: v1.0 (final)

---

## Why This Is a First-Class Requirement

CryptoRunway is built to be usable by humans AND by AI agents acting on their behalf. A CFO might open the site manually, or might ask an agent: "build me a runway model based on our Q1 numbers." Either should work without friction.

This document specifies the affordances that make the app agent-discoverable and agent-usable.

---

## Interaction Patterns Supported

1. **Human on site, manual input** → localStorage → export JSON
2. **Human describes org in voice/text** → Perplexity generates model → user reviews → saves
3. **Human asks external agent** → agent constructs JSON → human pastes into import dialog → app loads it
4. **Agent with browser access** → agent navigates UI via `data-*` attributes OR uses import dialog directly with prepared JSON
5. **Agent generates shareable URL** → sends to human → human clicks → model loads instantly

---

## Affordance 1: Public JSON Schemas

Every agent needs to know the shape of valid input. CryptoRunway publishes two JSON Schema (draft-07) documents:

### `GET /schema/model`

Returns the full `CryptoRunwayModel` schema.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://cryptorunway.app/schema/model",
  "title": "CryptoRunwayModel",
  "description": "A CryptoRunway treasury runway model",
  "type": "object",
  "required": ["id", "name", "projectionMonths", "startDate", "treasury", "burnCategories", "inflowCategories", "scenarios", "extendedRunwayEnabled", "baseCurrency"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "projectionMonths": { "type": "integer", "enum": [12, 15, 18] },
    "startDate": { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
    "baseCurrency": { "type": "string", "enum": ["USD", "EUR", "GBP"] },
    "extendedRunwayEnabled": { "type": "boolean" },
    "treasury": { "$ref": "#/definitions/TreasurySnapshot" },
    "burnCategories": { "type": "array", "items": { "$ref": "#/definitions/BurnCategory" } },
    "inflowCategories": { "type": "array", "items": { "$ref": "#/definitions/InflowCategory" } },
    "scenarios": { "type": "array", "items": { "$ref": "#/definitions/Scenario" } }
  },
  "definitions": { /* full nested definitions */ }
}
```

### `GET /schema/scenario`

Returns the `ScenarioOverrides` schema (for agents building scenarios).

### Content-Type

Both served with `Content-Type: application/schema+json; charset=utf-8`.

### Generation

The schemas are generated from the TypeScript interfaces in `lib/types.ts` via `ts-json-schema-generator` at build time, stored in `lib/json-schemas.ts`, and served via Next.js route handlers.

---

## Affordance 2: `.well-known` Discovery

### `/.well-known/agent-instructions.md`

A plain markdown file any crawler or agent can retrieve that explains the app's purpose and common interaction flows. Content template:

```markdown
# CryptoRunway — Agent Instructions

CryptoRunway is a web-based crypto treasury runway forecasting tool. You can use it to:

1. Build a model describing an org's treasury, burn, inflows, and volatile assets
2. Compute month-by-month projections showing when they'll run out of money
3. Compare scenarios (bear market, hiring changes, etc.) against a baseline

## Data Model
The canonical JSON Schema is at https://cryptorunway.app/schema/model
Scenario override schema: https://cryptorunway.app/schema/scenario

## Import a Model
A human can load your model JSON into the app three ways:
1. File upload on the Import dialog
2. Paste JSON into the Import dialog
3. Click a shareable URL: `https://cryptorunway.app/dashboard#model=<base64-json>`

## Export a Model
From within the app, users can export via three outputs:
1. Download as .json file
2. Copy JSON to clipboard
3. Generate a shareable URL

## Projection API
The projection engine is client-side pure functions — there's no server API to call. To compute projections, a model must be loaded in the app.

## Skills
Step-by-step guides for common agent tasks are published at:
https://github.com/<owner>/cryptorunway/tree/main/skills

## Source
Open-source (MIT): https://github.com/<owner>/cryptorunway
```

### `/.well-known/ai-plugin.json`

Minimal OpenAI-style plugin manifest (even though we're not a plugin per se, it's a recognized discovery pattern).

```json
{
  "schema_version": "v1",
  "name_for_human": "CryptoRunway",
  "name_for_model": "cryptorunway",
  "description_for_human": "Crypto treasury runway forecasting tool",
  "description_for_model": "Use this tool to forecast crypto treasury runway. The primary data model is at /schema/model. Import JSON via /dashboard#model=<base64>. See /.well-known/agent-instructions.md for full instructions.",
  "auth": { "type": "none" },
  "api": {
    "type": "openapi",
    "url": "https://cryptorunway.app/openapi.json"
  },
  "logo_url": "https://cryptorunway.app/logo.png",
  "contact_email": "hackathon@cryptorunway.example",
  "legal_info_url": "https://cryptorunway.app/terms"
}
```

---

## Affordance 3: Stable DOM Attributes

Any interactive element in the UI has a stable `data-action` attribute describing what it does, plus contextual `data-*` attributes identifying what it operates on. This lets browser-agents navigate without OCR or brittle selectors.

### Convention

```html
<!-- Every interactive element -->
<button data-action="<verb>" [data-<context>="<id-or-key>"] [other data-attrs]>

<!-- Examples -->
<button data-action="add-stablecoin">Add stablecoin</button>
<button data-action="remove-volatile-asset" data-asset-id="abc123">×</button>
<input data-field="stablecoin-amount" data-holding-id="xyz789" type="number" />
<button data-action="create-scenario">New Scenario</button>
<button data-action="apply-scenario-template" data-template-key="bear_market">Bear Market</button>
<button data-action="export-model">Export</button>
<button data-action="import-model">Import</button>
<button data-action="copy-model-clipboard">Copy JSON</button>
<button data-action="generate-shareable-url">Get Share URL</button>
<button data-action="ai-build-scenario">Build Scenario ✨</button>
<button data-action="ai-voice-input">Voice</button>
```

### Read-only data attributes

For agents reading values off the page:

```html
<div data-field="hard-runway-months">14</div>
<div data-field="hard-runway-date">2027-07</div>
<div data-field="extended-runway-months">19</div>
<div data-field="funding-gap-total">1700000</div>

<tr data-row="month" data-month="5">
  <td data-field="month-label">Sep 2026</td>
  <td data-field="month-total-burn">250000</td>
  <td data-field="month-hard-balance">450000</td>
  <td data-field="month-extended-balance">1340000</td>
  ...
</tr>
```

### Stability contract

- `data-action` values are never renamed (documented in the agent-instructions.md)
- `data-field` values are never renamed
- `data-*-id` values are the same IDs used in the JSON model, so an agent that has a model ID can find its DOM representation

---

## Affordance 4: Shareable URLs (Hash-Fragment Encoded)

This is the slickest agent pattern: an agent constructs a model, encodes it into a URL, and sends the URL. The human clicks and the model loads — no login, no API call, no copy-paste.

### Format

```
https://cryptorunway.app/dashboard#model=<base64-encoded-json>
```

Key properties:
- **Hash fragment, not query string** — fragments are NEVER sent to the server, preserving privacy
- **Base64url encoded** — URL-safe encoding of JSON
- **Compressed** — for models over ~8KB raw, use lz-string or similar before base64 to stay within URL length limits (effective limit: ~30KB encoded on most platforms)

### Implementation

```typescript
// lib/url-sharing.ts
import LZString from "lz-string";  // npm install lz-string

export function encodeModelToURL(model: CryptoRunwayModel): string {
  const json = JSON.stringify({ format: "cryptorunway", version: 1, model });
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

export function decodeModelFromURL(encoded: string): CryptoRunwayModel | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed.format !== "cryptorunway") return null;
    return parsed.model;
  } catch {
    return null;
  }
}

// Client:
// On app load, check window.location.hash for #model=... and offer to import
// On export, clipboard copies: `${window.location.origin}/dashboard#model=${encodeModelToURL(model)}`
```

### On load behavior

```typescript
// app/dashboard/page.tsx or similar entry point
useEffect(() => {
  const hash = window.location.hash;
  if (hash.startsWith("#model=")) {
    const encoded = hash.substring(7);
    const imported = decodeModelFromURL(encoded);
    if (imported) {
      setImportPreview(imported);  // Show preview modal, user confirms before overwriting
    }
  }
}, []);
```

The user ALWAYS sees a confirmation modal before an imported model overwrites their current model. Never auto-load without consent.

---

## Affordance 5: Published SKILL.md Files

In the open-source repo at `skills/`, we publish task-specific instruction files that any agent can read and follow. These are the "how-to" complement to the machine-readable JSON Schemas.

### `skills/create-runway-model/SKILL.md`
How to construct a valid `CryptoRunwayModel` from a natural-language org description. Includes:
- The schema URL
- Minimum required fields
- Sensible defaults for omitted fields
- Conversion tips (monthly burn → per-category distribution)
- Validation checklist
- Example: natural-language description → full JSON

### `skills/import-export-model/SKILL.md`
How to get a model into or out of the app. Three import methods explained, three export methods explained, shareable URL format documented.

### `skills/run-scenario/SKILL.md`
How to construct `ScenarioOverrides` from a hypothetical question. Schema location, common patterns (price changes, headcount, one-off events), headcount shortcut behavior, how `assetId: "all"` vs specific IDs work.

### `skills/analyze-projection/SKILL.md`
How to read a `MonthlyProjection[]` / `RunwaySummary` result and answer questions a CFO might ask. Key fields to look at: `hardRunwayMonths`, `extendedRunwayMonths`, `totalFundingGap`, `liquidityConstrained` flags, per-asset `valueAtHaircut`. Example analyses.

### Discoverability

Each SKILL.md begins with structured YAML frontmatter:

```yaml
---
name: create-runway-model
description: Construct a valid CryptoRunwayModel JSON from an organization's treasury description.
schema_url: https://cryptorunway.app/schema/model
import_url_pattern: https://cryptorunway.app/dashboard#model=<base64>
---
```

---

## Affordance 6: Clean HTML Semantics

Even without `data-*` attributes, agents should be able to understand the page via good HTML semantics:

- `<main>` wraps the primary content
- `<section>` with `aria-label` for each major area (Treasury, Burn, Inflows, Projection, Scenarios)
- `<form>` groups for input sections
- `<label>` on every input (not just `placeholder`)
- `<button>` for actions (not `<div onClick>`)
- Headings in order (h1 → h2 → h3), no skipping
- `aria-live="polite"` on the runway summary cards so screen readers AND agents get update notifications

---

## Testing Agent-Friendliness

### Manual test
Open the app in a browser with devtools → Accessibility tree. Confirm every interactive element is named correctly and has a clear role.

### Automated test
A simple Playwright test in the repo that:
1. Starts with the Nexus Labs model
2. Finds elements by `data-action` attributes
3. Reads `data-field` values and verifies they match the computed projection
4. Exports via `data-action="export-model"` and checks clipboard content matches the JSON Schema
5. Imports a new model via `data-action="import-model"` and verifies the chart updates

This test lives at `tests/agent-friendliness.spec.ts` and runs in CI (stretch — may skip if time-constrained).

### Real agent test
On demo day, open a Claude Code or similar agent with browser access, ask: "Go to cryptorunway.app, import this model JSON, tell me the hard runway date." Demo goal: it just works.

---

## What We're NOT Doing (and Why)

- **No server-side API for projections** — projections are pure client-side functions. Agents that want projections must load the app OR run the engine themselves (the engine is in `lib/projection-engine.ts`, MIT-licensed, can be imported as a module).
- **No OAuth / user accounts** — defeats the "no login" promise. Agents can share models via URL instead.
- **No "/run-scenario" REST endpoint** — same reason. The data + the engine + the schema are enough.
- **No MCP server (yet)** — potentially post-hackathon. For now, the schemas + SKILLs + `.well-known` files are sufficient for any agent to work with the tool.

---

## Summary Checklist

- [ ] `GET /schema/model` returns valid JSON Schema for `CryptoRunwayModel`
- [ ] `GET /schema/scenario` returns valid JSON Schema for `ScenarioOverrides`
- [ ] `/.well-known/agent-instructions.md` accessible
- [ ] `/.well-known/ai-plugin.json` accessible
- [ ] Every interactive element has `data-action` attribute
- [ ] Every displayed computed value has `data-field` attribute
- [ ] Shareable URL format works: export → paste URL → confirmation → load
- [ ] `skills/` folder in repo with 4 SKILL.md files
- [ ] README "Use with AI agents" section prominent
- [ ] Playwright agent-friendliness test passing (stretch)
