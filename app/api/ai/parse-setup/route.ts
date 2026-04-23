import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { PARSED_SETUP_SCHEMA } from "@/lib/json-schemas";

const MAX_PROMPT_LENGTH = 2000;
const CURRENT_MONTH = new Date().toISOString().slice(0, 7); // YYYY-MM

export async function POST(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_LENGTH);
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const systemPrompt = `You are a treasury model setup parser for a crypto org runway tool.

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

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: { name: "setup_parse", schema: PARSED_SETUP_SCHEMA } } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (err) {
    console.error("[parse-setup]", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Could not parse that. Try describing your treasury more specifically." },
      { status: 400 }
    );
  }
}
