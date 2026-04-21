# CryptoRunway — Perplexity Integration

**Status**: v1.0 (final)
**Sponsor requirement**: Perplexity AI is the hackathon sponsor. All AI inference routes through Perplexity. Branding is prominent and intentional.

---

## Overview

CryptoRunway uses Perplexity's Sonar API for three features:

1. **Live Market Banner** — real-time crypto prices + news headlines, refreshed every 5-10 min
2. **AI Scenario Builder** — natural language → `ScenarioOverrides` JSON
3. **AI Setup Assistant** — natural language or voice → full `CryptoRunwayModel` JSON

All calls go through Next.js API routes. The API key lives in `PERPLEXITY_API_KEY` env var, server-side only — never exposed to the client.

---

## API Basics

- **Base URL**: `https://api.perplexity.ai`
- **Endpoint**: `POST /chat/completions`
- **Auth**: `Authorization: Bearer $PERPLEXITY_API_KEY`
- **Format**: OpenAI-compatible. Can use `openai` npm SDK with custom `baseURL`.
- **Structured output**: `response_format: { type: "json_schema", json_schema: { name, schema } }`

### Installing the client

```bash
npm install openai
```

```typescript
// lib/perplexity-client.ts (server-only)
import OpenAI from "openai";

export const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai",
});
```

### Model selection

| Task                        | Model          | Why |
|-----------------------------|----------------|-----|
| Market banner (search + cite) | `sonar`       | Fast, cheap, search-augmented, returns citations |
| Scenario parser             | `sonar`        | Structured output, no deep reasoning needed |
| Setup parser                | `sonar-pro`    | More parameters to extract, pays off |
| (Future) research-heavy Q&A | `sonar-reasoning-pro` | If we add analysis features |

Cost is not a concern for the hackathon — $3K Perplexity credit prize + existing account.

### ⚠️ Cold-start caveat
**First request with a new JSON schema can take 10-30 seconds** as Perplexity prepares the schema. Our strategy:
- Warm the schema on Vercel deploy via a one-shot call at server startup (or first user request) with a timeout
- Show clear loading UI: "First scenario build can take a moment while Perplexity warms up..."
- All subsequent calls with the same schema are fast (<2s typical)

---

## Feature 1: Live Market Banner

### UX
- Fixed banner at the top of the dashboard (~48px tall, dismissible)
- Left side: ticker scroll showing BTC, ETH, SOL, and user's native token (if one exists)
  - Each ticker shows: symbol, current USD price, 24h % change (green ▲ / red ▼)
- Right side: rotating headline (cycles every 10 seconds) with source name and clickable link
- Bottom-right corner: "Live data powered by Perplexity" with Perplexity logo
- Refresh every 5-10 minutes (client-side interval), cached in memory

### API Route

```
GET /api/ai/market-banner?tokens=BTC,ETH,SOL,NEXUS

Response 200:
{
  "prices": [
    { "ticker": "BTC", "price": 92500.00, "change24h": 2.1 },
    { "ticker": "ETH", "price": 3400.00, "change24h": -0.8 },
    { "ticker": "SOL", "price": 180.00, "change24h": 5.3 },
    { "ticker": "NEXUS", "price": 0.12, "change24h": -2.0 }
  ],
  "headlines": [
    {
      "title": "Short headline under 100 chars",
      "url": "https://source.example.com/article",
      "source": "CoinDesk",
      "publishedAt": "2026-04-21T14:22:00Z"
    }
  ],
  "fetchedAt": "2026-04-21T15:00:00Z"
}

Response 503 if Perplexity fails — client shows degraded banner with last-cached data or hides entirely.
```

### Implementation

```typescript
// app/api/ai/market-banner/route.ts
import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";

export const revalidate = 300; // 5-minute edge cache

export async function GET(req: NextRequest) {
  const tokens = req.nextUrl.searchParams.get("tokens")?.split(",") ?? ["BTC", "ETH", "SOL"];

  const schema = {
    type: "object",
    properties: {
      prices: {
        type: "array",
        items: {
          type: "object",
          properties: {
            ticker: { type: "string" },
            price: { type: "number" },
            change24h: { type: "number" }
          },
          required: ["ticker", "price", "change24h"]
        }
      },
      headlines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            source: { type: "string" },
            publishedAt: { type: "string" }
          },
          required: ["title", "url", "source", "publishedAt"]
        }
      }
    },
    required: ["prices", "headlines"]
  };

  const prompt = `Return current crypto prices and recent news.

PRICES NEEDED: ${tokens.join(", ")}
For each ticker, return the current USD price and 24-hour percentage change.
If a ticker is obscure and no reliable price is found, omit it from the prices array.

HEADLINES: Return 3 crypto news headlines from the last 6-12 hours.
Each headline should include the source name, URL, and publication time (ISO 8601).
Prefer major outlets: CoinDesk, The Block, Decrypt, CoinTelegraph, Bloomberg, Reuters.

Please return the data as a JSON object matching the provided schema.`;

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: { name: "market_banner", schema }
      },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    return Response.json({ ...parsed, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[market-banner]", err);
    return Response.json({ error: "Perplexity unavailable" }, { status: 503 });
  }
}
```

### Client

```typescript
// components/perplexity/MarketBanner.tsx
// - useEffect with setInterval(refetch, 10 * 60 * 1000)
// - Keep last successful response in state; don't blank the banner on transient failure
// - Dismiss button (X) that sets a localStorage flag to hide until next session
```

---

## Feature 2: AI Scenario Builder

### UX
- "New Scenario" panel has two tabs: "Manual" and "Describe in words ✨ (Powered by Perplexity)"
- Text input (and voice mic button): "What if we cut 2 engineers and ETH drops to $1500?"
- "Build scenario" button → loading spinner → preview panel shows parsed overrides
- User reviews, optionally edits, then clicks "Save Scenario"
- The scenario is only added to the model after explicit user confirmation

### API Route

```
POST /api/ai/parse-scenario
Body:
{
  "prompt": "What if we cut 2 engineers and ETH drops to $1500?",
  "model": { /* current CryptoRunwayModel */ }
}

Response 200:
{
  "overrides": { /* ScenarioOverrides */ },
  "summary": "Headcount reduction of 2 people; ETH price set to $1500."
}

Response 400 if prompt unclear — body: { "error": "Couldn't parse: ...", "suggestion": "..." }
```

### Implementation

```typescript
// app/api/ai/parse-scenario/route.ts
import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { SCENARIO_OVERRIDES_JSON_SCHEMA } from "@/lib/json-schemas";

export async function POST(req: NextRequest) {
  const { prompt, model } = await req.json();

  const assetContext = model.treasury.volatileAssets
    .map((a: any) => `- ${a.name} (id: ${a.id}, tier: ${a.tier}, price: $${a.currentPrice})`)
    .join("\n");
  const burnContext = model.burnCategories
    .map((c: any) => `- ${c.name} (id: ${c.id}, presetKey: ${c.presetKey ?? "custom"}, monthly: $${c.monthlyBaseline})`)
    .join("\n");
  const inflowContext = model.inflowCategories
    .map((c: any) => `- ${c.name} (id: ${c.id}, presetKey: ${c.presetKey ?? "custom"}, monthly: $${c.monthlyBaseline})`)
    .join("\n");

  const headcountCat = model.burnCategories.find((c: any) => c.presetKey === "headcount");
  const headcountBaseline = headcountCat?.monthlyBaseline ?? 0;
  const avgCostPerHead = 15000; // Reasonable default for cost-per-head inference

  const systemPrompt = `You are a financial scenario parser for a crypto treasury runway tool.

Given a natural language scenario description and the user's current financial model, output a JSON object matching the ScenarioOverrides schema. No markdown, no explanation — just the JSON object and a brief "summary" field.

CURRENT MODEL CONTEXT:

Volatile assets:
${assetContext}

Burn categories:
${burnContext}

Inflow categories:
${inflowContext}

Headcount baseline: $${headcountBaseline}/mo (assume ~$${avgCostPerHead}/person/mo if user mentions people).

RULES:
- Use percent_change for relative adjustments (e.g., "cut by 30%" → -0.3)
- Use absolute for specific values (e.g., "token at $0.50" → absolute 0.50)
- For price changes referencing tier (like "all volatile down 50%"), set assetId to "all"; for tier (like "major crypto down 20%"), set assetId to "major"/"native"/"alt"
- For specific assets by name, use the asset id from the context above
- For headcount changes, use headcountChange shortcut with count and costPerHead
- For one-off events, use additionalBurnEvents or additionalInflowEvents
- If the user mentions a month (e.g., "in month 5"), set the month field accordingly
- startMonth defaults to 1 unless specified otherwise
- If the request is ambiguous or impossible to parse, return an overrides object with what you can confidently extract and note the uncertainty in the summary field

Please return the data as a JSON object matching the provided schema, plus a short "summary" field explaining what the scenario does in plain English.`;

  const schema = {
    type: "object",
    properties: {
      overrides: SCENARIO_OVERRIDES_JSON_SCHEMA,
      summary: { type: "string" }
    },
    required: ["overrides", "summary"]
  };

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "scenario_parse", schema }
      },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (err) {
    console.error("[parse-scenario]", err);
    return Response.json(
      { error: "Could not parse that. Try rephrasing." },
      { status: 400 }
    );
  }
}
```

### Example Inputs and Outputs

**Input**: "What if we cut 2 engineers and ETH drops to $1500?"

**Output**:
```json
{
  "overrides": {
    "headcountChange": { "count": -2, "costPerHead": 15000, "startMonth": 1 },
    "priceOverrides": [
      { "assetId": "<id of ETH asset>", "type": "absolute", "value": 1500 }
    ]
  },
  "summary": "Reduce headcount by 2 (saves $30K/mo) and drop ETH to $1500."
}
```

**Input**: "Bear market: token down 60%, we get a $300K grant in month 3, but need to pay $150K legal bill in month 5"

**Output**:
```json
{
  "overrides": {
    "priceOverrides": [
      { "assetId": "native", "type": "percent_change", "value": -0.6 }
    ],
    "additionalInflowEvents": [
      { "month": 3, "amount": 300000, "description": "Emergency grant" }
    ],
    "additionalBurnEvents": [
      { "month": 5, "amount": 150000, "description": "Legal bill" }
    ]
  },
  "summary": "Native token drops 60%, $300K grant arrives in month 3, $150K legal expense in month 5."
}
```

---

## Feature 3: AI Setup Assistant

### UX
- On empty state (after "Start Fresh" or first visit): a prominent card "Describe your treasury in words — powered by Perplexity ✨"
- Text input and voice mic button
- Example placeholder: "We're a 12-person DeFi lab with $2M in USDC, 10M tokens at $0.15, burning ~$180K/month mostly on headcount..."
- After parse: preview card shows the interpreted model; user reviews and clicks "Apply" to load it
- NEVER overwrites existing data silently — always confirmation step

### API Route

```
POST /api/ai/parse-setup
Body: { "prompt": "..." }

Response 200:
{
  "model": { /* Partial<CryptoRunwayModel> — anything user didn't specify uses defaults */ },
  "summary": "12-person DeFi lab, $2M USDC + 10M native token, $180K/mo burn."
}
```

### System Prompt (abbreviated)

```
You are an initial-setup parser for a crypto treasury runway tool.

Given a natural language description of an org's treasury and burn, output a partial CryptoRunwayModel JSON.

RULES:
- For any numbers the user provides, use them exactly
- For any fields not mentioned, OMIT them (client will fill with defaults)
- Distribute burn across preset categories using typical ratios if user only gives a total:
  - Headcount: 70% of burn (if they mention team size, compute)
  - Infrastructure: 8%
  - Legal: 5%
  - Marketing: 10%
  - Office/Admin: 5%
  - Other categories: 0% unless mentioned
- For volatile assets:
  - ETH, BTC → tier: "major", haircut: 2%, priority: 10
  - Other named crypto → tier: "alt", haircut: 10%, priority: 30
  - If user says "our token" or "the protocol token" → tier: "native", haircut: 15%, priority: 50
- Always include projectionMonths: 12 unless specified
- startDate: use the current month in YYYY-MM format

Please return the data as a JSON object matching the provided schema.
```

### Example

**Input**: "We're a 12-person DeFi lab, $2M in USDC, 10M ACME tokens trading at $0.15, 50 ETH, burning about $180K/month mostly on headcount"

**Output** (abbreviated):
```json
{
  "model": {
    "name": "New Model",
    "projectionMonths": 12,
    "startDate": "2026-05",
    "baseCurrency": "USD",
    "extendedRunwayEnabled": true,
    "treasury": {
      "stablecoins": [{ "name": "USDC", "amount": 2000000 }],
      "fiat": [],
      "volatileAssets": [
        {
          "name": "ACME",
          "ticker": "acme",
          "tier": "native",
          "quantity": 10000000,
          "currentPrice": 0.15,
          "liquidity": { "haircutPercent": 15, "maxSellUnit": "tokens", "maxSellPerMonth": 200000, "priceAssumption": "constant" },
          "liquidationPriority": 50
        },
        {
          "name": "ETH",
          "ticker": "ethereum",
          "tier": "major",
          "quantity": 50,
          "liquidity": { "haircutPercent": 2, "maxSellUnit": "tokens", "priceAssumption": "constant" },
          "liquidationPriority": 10
        }
      ]
    },
    "burnCategories": [
      { "presetKey": "headcount", "monthlyBaseline": 126000, "isActive": true, ... },
      { "presetKey": "infrastructure", "monthlyBaseline": 14400, "isActive": true, ... }
      // etc.
    ]
  },
  "summary": "12-person DeFi lab, $2M USDC, 10M ACME, 50 ETH, $180K/mo burn."
}
```

**Client responsibility**: merge with default model (empty arrays, default scenarios, IDs generated client-side, missing fields filled with sensible defaults).

---

## Voice Input

Web Speech API wrapper in `components/ai/VoiceInput.tsx`:

```typescript
// Pseudocode
const recognition = new (window as any).webkitSpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;
recognition.onresult = (e) => onTranscript(e.results[0][0].transcript);
recognition.onerror = () => setError("Speech recognition failed");
recognition.start();
```

- Chrome-first (webkit prefix), falls back to text input gracefully
- Only transcribes; does not go through Perplexity
- Transcript populates the text field, then user clicks "Build" which triggers the normal parse flow

---

## Error Handling

| Error                                     | User-facing behavior |
|-------------------------------------------|----------------------|
| Perplexity 5xx                            | Banner: hide. AI button: "Perplexity is down right now — use manual input." |
| Perplexity 400 (bad request)              | "Couldn't parse that. Try rephrasing." Retry button. |
| Malformed JSON in response                | Same as above. Log to console. |
| Rate limit hit                            | "Too many requests — wait a minute." |
| Cold-start timeout (first schema, 30s+)   | Spinner with message: "Warming up Perplexity... this can take up to 30 seconds on first use." |
| Voice recognition unsupported             | Hide mic button, show text input only. |

**Critical**: AI features must DEGRADE, never break. Manual input flows always work. Market banner hides if down — doesn't crash the page.

---

## Branding Placement

### Top nav / header
```
[Accountant Quits logo] CryptoRunway     [⚡ Powered by Perplexity]     [Import] [Export] [Share]
```

### Live market banner
```
[BTC $92.5K ▲ 2.1%] [ETH $3.4K ▼ 0.8%] [SOL $180 ▲ 5.3%]    |    📰 "Article title" — CoinDesk    Live data powered by [Perplexity logo]
```

### AI buttons
Every button that triggers a Perplexity call displays "Powered by Perplexity" via the `PoweredByBadge` component. Places:
- "Build scenario ✨ Powered by Perplexity"
- "Describe your treasury ✨ Powered by Perplexity"
- Mic buttons: "🎤 Voice input (Perplexity)"

### Footer
```
CryptoRunway · Built at the Accountant Quits Web3 Hackathon · Powered by Perplexity · [GitHub] [Schema] [Agent Docs]
```

**Principle**: be a little over-the-top. Judges notice, sponsor appreciates, users understand. Every AI interaction is a Perplexity touchpoint.

---

## Security Checklist

- [ ] `PERPLEXITY_API_KEY` in `.env.local` (local) and Vercel env vars (prod)
- [ ] `.env.local` in `.gitignore`
- [ ] `.env.local.example` committed with placeholder
- [ ] API routes validate user input before passing to Perplexity (prevent prompt injection from malicious model state)
- [ ] API routes don't log prompts or model data in production (only errors)
- [ ] Rate limit on API routes (e.g., 20 req/min per IP) to prevent key exhaustion from abuse

---

## Cost Budget (reference)

For the hackathon, cost is not a concern ($3K credit prize + existing account). Approximate usage:

- Market banner: 6 requests/hour/session × ~1K tokens = ~6K tokens/hour = negligible
- Scenario parser: ~5K tokens per call (system prompt is large); expect 10-20 calls per demo = 100K tokens
- Setup parser: similar to scenario parser; expect 1-2 calls per session

Perplexity pricing: `sonar` ~$1/M input, $1/M output tokens (approximate; verify on pricing page at demo time). $3K credit is effectively unlimited for our usage.
