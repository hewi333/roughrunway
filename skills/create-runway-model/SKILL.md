# SKILL: Create a CryptoRunway Model

**Purpose**: Construct a valid `CryptoRunwayModel` JSON from a natural-language description of a crypto organization's treasury and burn, then import it into CryptoRunway.

**When to use**: A user describes their org's financial situation and wants to see their runway. You need to turn that description into structured data the app can load.

---

## Inputs

Ask for or infer:

1. **Treasury**
   - Stablecoin balances (USDC, USDT, DAI, etc.)
   - Fiat balances (USD, EUR, GBP)
   - Volatile assets: each asset needs quantity, current price, and a liquidity profile
2. **Monthly burn**
   - Categories: headcount, infrastructure, legal, marketing, grants out, token incentives, employee token grants, office & admin, or custom
   - One-off adjustments pinned to specific months
3. **Monthly inflows** (optional)
   - Staking rewards, grant income, revenue, planned token sales, other
4. **Projection horizon**: 12, 15, or 18 months (default 18)
5. **Start date**: YYYY-MM format (default: current month)

---

## Output

Emit a JSON object matching the schema at `/schema/model.json`. See `/docs/02-DATA-MODEL.md` for the canonical TypeScript definitions.

### Key rules

- **IDs**: use short stable slugs (`"usdc"`, `"eth"`, `"native"`, `"headcount"`). Do not invent UUIDs — the app will assign them on import.
- **Volatile asset tiers**: `"major"` (BTC/ETH/SOL), `"native"` (the org's own token), `"alt"` (everything else).
- **Default liquidity profiles by tier**:
  - `major`: haircut 2%, sell all in one month, priority 10
  - `alt`: haircut 10%, sell 10% of holdings per month, priority 30
  - `native`: haircut 15%, sell ~2% of daily volume per month, priority 50
- **Liquidation priority**: lower number = sold first. The user can override; use the defaults above unless the user specifies otherwise.
- **Burn `currency` field**: v1 engine ignores this. Set it to `"stablecoin"` if unsure.

---

## Minimal valid example

```json
{
  "id": "agent-created",
  "name": "Acme Labs",
  "createdAt": "2026-04-21T00:00:00Z",
  "updatedAt": "2026-04-21T00:00:00Z",
  "projectionMonths": 18,
  "startDate": "2026-05",
  "baseCurrency": "USD",
  "extendedRunwayEnabled": true,
  "treasury": {
    "stablecoins": [{ "id": "usdc", "name": "USDC", "amount": 1500000 }],
    "fiat": [],
    "volatileAssets": [
      {
        "id": "acme",
        "name": "ACME",
        "ticker": "acme-token",
        "tier": "native",
        "quantity": 10000000,
        "currentPrice": 0.15,
        "priceSource": "manual",
        "liquidationPriority": 50,
        "liquidity": {
          "maxSellUnit": "tokens",
          "maxSellPerMonth": 200000,
          "haircutPercent": 15,
          "priceAssumption": "constant"
        }
      }
    ]
  },
  "burnCategories": [
    {
      "id": "headcount",
      "name": "Headcount & Payroll",
      "type": "preset",
      "presetKey": "headcount",
      "monthlyBaseline": 180000,
      "currency": "stablecoin",
      "growthRate": 0,
      "adjustments": [],
      "isActive": true
    }
  ],
  "inflowCategories": [],
  "scenarios": []
}
```

---

## How to hand off to the user

Three options, in order of preference:

1. **Shareable URL**: encode the model as base64url into the hash fragment: `https://<host>/dashboard#model=<base64url>`. Send the URL. User clicks, model loads.
2. **Download**: emit the JSON as a `.json` file for the user to drop into CryptoRunway's import dialog.
3. **Copy/paste**: present the JSON in a code block. Instruct the user to open CryptoRunway, click Import, paste, confirm.

See `import-export-model/SKILL.md` for details on each path.
