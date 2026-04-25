import { v4 as uuidv4 } from "uuid";
import type { RoughRunwayModel } from "@/lib/types";

// Showcase model used by the landing-page demo flow.
//
// Profile: 15-person mid-stage Web3 protocol that just closed a $7M raise
// (Series A or treasury sale). Tuned so every scenario template has
// something material to act on:
//   - Stable+fiat treasury that produces a meaningful "hard runway" number
//   - ETH (major, low haircut) and a native token (high haircut, sell-rate
//     constrained) so liquidation logic is visible
//   - All eight preset burn categories represented, sized realistically
//   - Inflows on both sides of the volatility curve (staking + revenue)
//
// Hard treasury ≈ $6.0M, monthly net burn ≈ $416K → ~14mo hard runway,
// ~18mo extended once liquidation is folded in.
export function buildDemoModel(): RoughRunwayModel {
  const now = new Date().toISOString();
  const startDate = now.slice(0, 7);

  return {
    id: uuidv4(),
    name: "Demo: Mid-stage Web3 Protocol",
    createdAt: now,
    updatedAt: now,
    projectionMonths: 18,
    startDate,
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins: [
        { id: uuidv4(), name: "USDC", amount: 4_500_000 },
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
          name: "Nexus Token",
          ticker: "NEX",
          tier: "native",
          quantity: 75_000_000,
          currentPrice: 0.08,
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
