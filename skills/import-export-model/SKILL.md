# SKILL: Import or Export a CryptoRunway Model

**Purpose**: Move a model in or out of CryptoRunway without a login or backend.

---

## Export paths (human has a model loaded in CryptoRunway)

The Export dialog (header → Export) offers three options. All produce the same JSON payload wrapped as:

```json
{
  "format": "cryptorunway",
  "version": 1,
  "exportedAt": "2026-04-21T12:34:56.000Z",
  "model": { ... }
}
```

1. **Download JSON**: saves `<model-name>-<date>.json` to disk.
2. **Copy to clipboard**: same payload, copied.
3. **Shareable URL**: the model is JSON-stringified, compressed with `lz-string.compressToEncodedURIComponent`, and placed in the URL fragment: `<host>/dashboard#model=<encoded>`. Fragments are not sent to the server — the model stays client-side.

---

## Import paths (agent wants to hand the user a model)

From the user's side, CryptoRunway's Import dialog accepts:

1. **File upload** (`.json`) — drag and drop or file picker.
2. **Paste JSON** — a textarea; paste and click Import.
3. **Paste URL** — a text field; paste a shareable URL (with or without the hash fragment); the app decodes the fragment.

### Which method should an agent use?

| Agent capability | Best method |
|---|---|
| Agent can generate text, user is pasting into a browser | Shareable URL (fewest clicks for the user) |
| Agent operates a browser directly (e.g., Claude in Chrome) | File upload, or paste into the import textarea |
| Agent outputs downloadable files | `.json` file the user opens |

---

## Validating a model before import

Before presenting a generated model to the user, verify it against the JSON Schema at `/schema/model.json`. Required top-level fields:

- `id`, `name`, `projectionMonths` (12/15/18), `startDate` (`YYYY-MM`)
- `treasury.stablecoins`, `treasury.fiat`, `treasury.volatileAssets` (can be empty arrays, but must exist)
- `burnCategories`, `inflowCategories`, `scenarios` (can be empty arrays)
- `extendedRunwayEnabled`: boolean

---

## Shareable URL encoding (spec)

```
# Pseudo-code
json = JSON.stringify(model)
compressed = lzString.compressToEncodedURIComponent(json)
url = `${host}/dashboard#model=${compressed}`
```

Decoding:
```
# Pseudo-code
fragment = location.hash.replace(/^#model=/, "")
json = lzString.decompressFromEncodedURIComponent(fragment)
model = JSON.parse(json)
```

See `/docs/07-AGENT-ARCHITECTURE.md` §"Shareable URLs" for rationale and size limits. Practical cap: models under ~20 KB stringified fit comfortably in a URL across all browsers.
