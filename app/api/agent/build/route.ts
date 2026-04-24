import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { PARSED_SETUP_SCHEMA } from "@/lib/json-schemas";
import { exportModel } from "@/lib/model-export";
import { RoughRunwayModel } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const MAX_DESC_LENGTH = 2000;
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

const SYSTEM_PROMPT = `You are a treasury model setup parser for a crypto org runway tool.

Parse the user's description into a structured financial model. Follow these rules exactly:

TREASURY:
- USDC, USDT, DAI, etc. → stablecoins array
- USD, EUR, GBP bank accounts → fiat array
- BTC, ETH → volatileAssets with tier "major", haircutPercent 2, liquidationPriority 10
- Other named crypto → tier "alt", haircutPercent 10, liquidationPriority 30
- "Our token", "protocol token", or native token → tier "native", haircutPercent 15, liquidationPriority 50
- If user doesn't mention price for a volatile asset, set currentPrice to 0

BURN:
- If user gives total burn, distribute it: headcount 70%, infrastructure 8%, legal 5%, marketing 10%, office_admin 5%, other 2%
- If user mentions specific categories (e.g. "payroll is $X"), use those exact amounts
- If user mentions team size (e.g. "12 people"), compute monthly headcount cost as teamSize × $15000

INFLOWS:
- Only include if user explicitly mentions them; otherwise omit
- Map to preset keys: revenue/staking/grants_in/token_sales/other

GENERAL:
- projectionMonths: 12 unless specified
- startDate: "${CURRENT_MONTH}"
- name: derive a short project name from context, or use "New Model"
- OMIT fields the user did not mention; client will fill with defaults

Write a 1-2 sentence summary of what you understood.`;

function buildModel(p: any): RoughRunwayModel {
  const now = new Date().toISOString();

  const stablecoins = (p.treasury?.stablecoins ?? []).map((s: any) => ({
    id: uuidv4(),
    name: s.name,
    amount: s.amount,
  }));

  const fiat = (p.treasury?.fiat ?? []).map((f: any) => ({
    id: uuidv4(),
    currency: f.currency ?? "USD",
    amount: f.amount,
  }));

  const volatileAssets = (p.treasury?.volatileAssets ?? []).map((a: any, i: number) => ({
    id: uuidv4(),
    name: a.name,
    ticker: a.ticker,
    tier: a.tier ?? "alt",
    quantity: a.quantity,
    currentPrice: a.currentPrice ?? 0,
    priceSource: "manual" as const,
    liquidationPriority: a.liquidationPriority ?? (i + 1) * 10,
    liquidity: {
      maxSellUnit: "tokens" as const,
      maxSellPerMonth: a.quantity * 0.05,
      haircutPercent: a.haircutPercent ?? (a.tier === "major" ? 2 : a.tier === "native" ? 15 : 10),
      priceAssumption: "constant" as const,
    },
  }));

  const burnCategories = (p.burnCategories ?? []).map((c: any) => ({
    id: uuidv4(),
    name: c.name ?? c.presetKey ?? "Custom",
    type: c.presetKey ? "preset" : "custom",
    presetKey: c.presetKey,
    monthlyBaseline: c.monthlyBaseline,
    currency: "fiat" as const,
    growthRate: c.growthRate ?? 0,
    adjustments: [],
    isActive: true,
  }));

  const inflowCategories = (p.inflowCategories ?? []).map((c: any) => ({
    id: uuidv4(),
    name: c.name ?? c.presetKey ?? "Custom",
    type: c.presetKey ? "preset" : "custom",
    presetKey: c.presetKey,
    monthlyBaseline: c.monthlyBaseline,
    growthRate: c.growthRate ?? 0,
    adjustments: [],
    isActive: true,
  }));

  return {
    id: uuidv4(),
    name: p.name ?? "New Model",
    createdAt: now,
    updatedAt: now,
    projectionMonths: p.projectionMonths ?? 12,
    startDate: p.startDate ?? CURRENT_MONTH,
    baseCurrency: "USD",
    extendedRunwayEnabled: true,
    treasury: {
      stablecoins: stablecoins.length > 0 ? stablecoins : [{ id: uuidv4(), name: "USDC", amount: 0 }],
      fiat: fiat.length > 0 ? fiat : [{ id: uuidv4(), currency: "USD", amount: 0 }],
      volatileAssets,
    },
    burnCategories,
    inflowCategories,
    scenarios: [],
  } as RoughRunwayModel;
}

export async function POST(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  let body: { description?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const description = String(body.description ?? "").trim().slice(0, MAX_DESC_LENGTH);
  if (!description) {
    return Response.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: description },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "setup_parse", schema: PARSED_SETUP_SCHEMA },
      } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    const model = buildModel(parsed);

    const origin = new URL(req.url).origin;
    const compressed = exportModel(model);
    const shareUrl = `${origin}/dashboard#model=${compressed}`;

    return Response.json({
      shareUrl,
      summary: parsed.summary ?? "Model built from your description.",
      modelName: model.name,
    });
  } catch (err) {
    console.error("[agent/build]", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Could not parse that description. Try including your treasury amounts, burn rate, and team size." },
      { status: 400 }
    );
  }
}
