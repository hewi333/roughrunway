# SKILL: Analyze a Projection

**Purpose**: Read a `MonthlyProjection[]` + `RunwaySummary` output and answer user questions about it.

**When to use**: The user asks "when do we run out", "how bad is it if X happens", "what's our cushion", or similar. You have projection output in hand (from export or API) and need to explain it.

---

## The two runway numbers

- **Hard Runway** = months until stablecoins + fiat hit zero. This is the guaranteed floor. If Hard Runway is `null`, the org is profitable and never depletes in the horizon.
- **Extended Runway** = months until stables + fiat + realistic-to-liquidate volatile assets hit zero. This is always >= Hard Runway (or equal when there are no volatile assets).

The UI always shows both. An agent summary should too. Don't quote just one number — the two together are the product.

---

## Reading a `MonthlyProjection` row

Each row is one month. Key fields:

| Field | Meaning |
|---|---|
| `hardBalance` | stables + fiat at end of month |
| `extendedBalance` | hard + remaining volatile value (at haircut) − cumulative unmet deficit |
| `totalBurn`, `totalInflows`, `netBurn` | flows during the month |
| `totalLiquidationProceeds` | USD raised by selling volatile assets this month |
| `liquidationDetails` | per-asset breakdown of what got sold |
| `unmetDeficitThisMonth` | burn we couldn't cover even after liquidating |
| `cumulativeUnmetDeficit` | running total of unmet deficit — this is the "funding gap" |
| `liquidityConstrained` | true if we hit a sell cap this month (can't liquidate fast enough) |

---

## Reading the `RunwaySummary`

| Field | Meaning |
|---|---|
| `hardRunwayMonths` | integer or `null` (never depletes in horizon) |
| `hardRunwayDate` | `"YYYY-MM"` or `"18+ months"` |
| `extendedRunwayMonths` | integer or `null` |
| `extendedRunwayDate` | `"YYYY-MM"` or `"18+ months"` |
| `averageMonthlyNetBurn` | useful for "we're burning ~$X/mo" |
| `currentTotalUSD` | treasury at spot prices (headline number) |
| `currentTotalAtHaircut` | treasury if liquidated today — the realistic number |
| `fundingGapUSD` | how much you'd need to raise to make the projection actually work |
| `liquidityConstrainedMonths` | count of months flagged `liquidityConstrained` |

---

## Framing answers to users

**When both runways are short (<6 months)**: Lead with the danger. "Hard runway is 4 months (Aug 2026). Even including realistic token liquidation, extended runway is 5 months. This is urgent."

**When Hard is short but Extended is long**: Explain the gap depends on liquidation. "Hard runway (cash + stables only) is 3 months. Extended runway stretches to 14 months if you can sell tokens on the market without impact — but the projection shows 6 months flagged as liquidity-constrained, meaning you'd need to sell slower than the burn demands. There's a funding gap of $1.2M."

**When both are long (>12 months)**: Reassure, flag any constraints. "Hard runway is 15 months, extended is 18+ months. You're in good shape, though the model assumes token prices stay flat — if that's your scenario, you're fine."

**When there's a funding gap flag**: Always call it out. The `fundingGapUSD` field tells the user "the projection says you survive, but only because we assume you can also cover $X of burn that liquidation alone can't meet in time." That's a meaningful number, not a bug.

**When `liquidityConstrainedMonths > 0`**: Mention it. "The model shows 8 months where you couldn't liquidate fast enough to meet burn — the extended line survives only because we project the remaining token value forward. In reality, you'd need to raise cash or cut burn in those months."

---

## Things *not* to do

- Don't quote `currentTotalUSD` as the "real" treasury. It's spot-price fantasy — `currentTotalAtHaircut` is closer to reality, and even that doesn't account for liquidity pacing.
- Don't interpret a `null` extended runway as "you're totally fine forever." Check `fundingGapUSD` and `liquidityConstrainedMonths` first.
- Don't round runway dates to nothing. If `hardRunwayDate` is `"2026-08"`, say "August 2026" — it's the most actionable number in the whole output.
