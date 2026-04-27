import { v4 as uuidv4 } from "uuid";
import type { RoughRunwayModel } from "@/lib/types";

// Showcase model used by the landing-page demo flow.
//
// Profile: TAQ Labs — 15-person mid-stage Web3 protocol that just closed a
// $7M raise. Tuned so every scenario template has something material to act on:
//   - Stable+fiat treasury that produces a meaningful "hard runway" number
//   - ETH (major, low haircut) and a lean native-token bag (high haircut,
//     sell-rate constrained) so the extended-runway story is visible
//   - All eight preset burn categories represented, sized realistically
//   - Inflows on both sides of the volatility curve (staking + revenue)
//
// Hard treasury = $4.5M, monthly net burn ≈ $416K → 11mo hard runway —
// just inside the "warning" band so any stress scenario flips the top
// summary cards from gold to red. ETH (~$1.18M at haircut) + TAQ (~$0.85M
// at haircut) keeps the baseline extended runway inside the 18-month
// projection horizon (~16mo), giving every scenario template — bear
// market, hiring, cuts, token crash — room to visibly shift the runway
// line up or down on the chart.
//
// The native token is "The Accountant Quits" (TAQ) — a wink at the kind of
// crisis that sends a CFO running for this tool in the first place.
export function buildDemoModel(): RoughRunwayModel {
  const now = new Date().toISOString();
  const startDate = now.slice(0, 7);

  return {
    id: uuidv4(),
    name: "TAQ Labs",
    createdAt: now,
    updatedAt: now,
    projectionMonths: 18,
    startDate,
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins: [
        { id: uuidv4(), name: "USDC", amount: 3_000_000 },
        { id: uuidv4(), name: "USDT", amount: 500_000 },
      ],
      fiat: [{ id: uuidv4(), currency: "USD", amount: 1_000_000 }],
      volatileAssets: [
        {
          id: uuidv4(),
          name: "Ethereum",
          ticker: "ETH",
          tier: "major",
          quantity: 300,
          currentPrice: 4_000,
          priceSource: "manual",
          liquidationPriority: 10,
          liquidity: {
            maxSellUnit: "tokens",
            maxSellPerMonth: 50,
            haircutPercent: 2,
            priceAssumption: "constant",
          },
        },
        {
          id: uuidv4(),
          name: "The Accountant Quits",
          ticker: "TAQ",
          tier: "native",
          quantity: 10_000_000,
          currentPrice: 0.10,
          priceSource: "manual",
          liquidationPriority: 50,
          liquidity: {
            maxSellUnit: "tokens",
            maxSellPerMonth: 2_000_000,
            haircutPercent: 15,
            priceAssumption: "constant",
          },
        },
      ],
    },
    burnCategories: [
      burn("Headcount & Payroll", "headcount", 300_000),
      burn("Employee Token Grants", "token_grants", 22_000),
      burn("Infrastructure & Tooling", "infrastructure", 30_000),
      burn("Legal & Compliance", "legal", 15_000),
      burn("Marketing & Growth", "marketing", 35_000),
      burn("Token Incentives / Emissions", "token_incentives", 25_000),
      burn("Grants & Ecosystem", "grants_out", 15_000),
      burn("Office & Admin", "office_admin", 8_000),
    ],
    inflowCategories: [
      inflow("Staking Rewards (ETH)", "staking", 4_000, 0),
      inflow("Protocol Revenue", "revenue", 30_000, 0.02),
    ],
    scenarios: [],
  };
}

function burn(name: string, presetKey: string, monthlyBaseline: number) {
  return {
    id: uuidv4(),
    name,
    type: "preset" as const,
    presetKey,
    monthlyBaseline,
    currency: "fiat" as const,
    growthRate: 0,
    adjustments: [],
    isActive: true,
  };
}

function inflow(
  name: string,
  presetKey: string,
  monthlyBaseline: number,
  growthRate: number,
) {
  return {
    id: uuidv4(),
    name,
    type: "preset" as const,
    presetKey,
    monthlyBaseline,
    growthRate,
    adjustments: [],
    isActive: true,
  };
}
