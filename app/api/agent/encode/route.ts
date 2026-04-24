import { NextRequest } from "next/server";
import { exportModel } from "@/lib/model-export";
import { RoughRunwayModel } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const MAJOR = ["BTC", "ETH", "WBTC", "WETH"];

// Parse "USDC:1500000,USDT:0" → stablecoin array
function parseStables(raw: string) {
  return raw.split(",").filter(Boolean).map((s) => {
    const [name, amount] = s.split(":");
    return { id: uuidv4(), name: name.trim(), amount: Number(amount) || 0 };
  });
}

// Parse "USD:50000" → fiat array
function parseFiat(raw: string) {
  return raw.split(",").filter(Boolean).map((f) => {
    const [currency, amount] = f.split(":");
    return { id: uuidv4(), currency: currency.trim().toUpperCase(), amount: Number(amount) || 0 };
  });
}

// Parse "ETH:50:3500:major,NEX:100000000:0.08:native" → volatileAssets array
function parseVolatile(raw: string) {
  return raw.split(",").filter(Boolean).map((v, i) => {
    const parts = v.trim().split(":");
    const ticker = parts[0].trim().toUpperCase();
    const quantity = Number(parts[1]) || 0;
    const price = Number(parts[2]) || 0;
    const tier = (parts[3]?.trim() as "major" | "native" | "alt") ||
      (MAJOR.includes(ticker) ? "major" : "alt");
    return {
      id: uuidv4(),
      name: ticker,
      ticker,
      tier,
      quantity,
      currentPrice: price,
      priceSource: "manual" as const,
      liquidationPriority: tier === "major" ? 10 + i : tier === "native" ? 50 + i : 30 + i,
      liquidity: {
        maxSellUnit: "tokens" as const,
        maxSellPerMonth: quantity * 0.05,
        haircutPercent: tier === "major" ? 2 : tier === "native" ? 15 : 10,
        priceAssumption: "constant" as const,
      },
    };
  });
}

// Parse burn: "150000" (total, auto-distributed) or "headcount:105000,infra:12000" (explicit)
function parseBurn(burnParam: string, teamSize: number) {
  if (!burnParam && teamSize <= 0) return [];

  if (burnParam.includes(":")) {
    return burnParam.split(",").filter(Boolean).map((b) => {
      const [key, amount] = b.split(":");
      const k = key.trim();
      return {
        id: uuidv4(),
        name: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " "),
        type: "preset" as const,
        presetKey: k,
        monthlyBaseline: Number(amount) || 0,
        currency: "fiat" as const,
        growthRate: 0,
        adjustments: [],
        isActive: true,
      };
    });
  }

  const total = Number(burnParam) || 0;
  const headcount = teamSize > 0 ? teamSize * 15_000 : Math.round(total * 0.7);
  const remainder = total - headcount;

  const categories = [
    { key: "headcount", monthly: headcount },
    { key: "infrastructure", monthly: Math.round(remainder * (8 / 30)) },
    { key: "legal", monthly: Math.round(remainder * (5 / 30)) },
    { key: "marketing", monthly: Math.round(remainder * (10 / 30)) },
    { key: "office_admin", monthly: Math.round(remainder * (5 / 30)) },
    { key: "other", monthly: Math.round(remainder * (2 / 30)) },
  ].filter((c) => c.monthly > 0);

  return categories.map((c) => ({
    id: uuidv4(),
    name: c.key.charAt(0).toUpperCase() + c.key.slice(1).replace(/_/g, " "),
    type: "preset" as const,
    presetKey: c.key,
    monthlyBaseline: c.monthly,
    currency: "fiat" as const,
    growthRate: 0,
    adjustments: [],
    isActive: true,
  }));
}

// GET /api/agent/encode
// No LLM call — Claude parses the description itself and passes structured params.
// Returns { shareUrl, modelName } instantly.
//
// Params:
//   name     = "DeFi Team"
//   stable   = "USDC:1500000,USDT:0"
//   fiat     = "USD:50000"                               (optional)
//   volatile = "ETH:50:3500:major,NEX:100000000:0.08:native"
//   burn     = "150000"  OR  "headcount:105000,infra:12000"
//   team     = "10"                                      (overrides headcount from burn total)
//   months   = "12"                                      (default 12)
//   start    = "2026-04"                                 (default current month)
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const stablecoins = parseStables(p.get("stable") ?? "");
  const fiat = parseFiat(p.get("fiat") ?? "");
  const volatileAssets = parseVolatile(p.get("volatile") ?? "");
  const burnCategories = parseBurn(p.get("burn") ?? "", Number(p.get("team")) || 0);

  const now = new Date().toISOString();
  const model = {
    id: uuidv4(),
    name: p.get("name") ?? "New Model",
    createdAt: now,
    updatedAt: now,
    projectionMonths: Number(p.get("months")) || 12,
    startDate: p.get("start") ?? now.slice(0, 7),
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins: stablecoins.length > 0 ? stablecoins : [{ id: uuidv4(), name: "USDC", amount: 0 }],
      fiat: fiat.length > 0 ? fiat : [{ id: uuidv4(), currency: "USD", amount: 0 }],
      volatileAssets,
    },
    burnCategories,
    inflowCategories: [],
    scenarios: [],
  } as RoughRunwayModel;

  const origin = new URL(req.url).origin;
  const compressed = exportModel(model);

  return Response.json({
    shareUrl: `${origin}/dashboard#model=${compressed}`,
    modelName: model.name,
  });
}
