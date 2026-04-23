import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { SCENARIO_OVERRIDES_JSON_SCHEMA } from "@/lib/json-schemas";

const MAX_PROMPT_LENGTH = 1000;

export async function POST(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  let body: { prompt?: string; model?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_LENGTH);
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const model = body.model ?? {};

  // Build model context for the system prompt
  const assets = Array.isArray((model.treasury as any)?.volatileAssets)
    ? (model.treasury as any).volatileAssets
    : [];
  const burnCats = Array.isArray(model.burnCategories) ? model.burnCategories as any[] : [];
  const inflowCats = Array.isArray(model.inflowCategories) ? model.inflowCategories as any[] : [];

  const assetCtx = assets
    .map((a: any) => `  - ${a.name} (id: ${a.id}, ticker: ${a.ticker}, tier: ${a.tier}, price: $${a.currentPrice})`)
    .join("\n") || "  (none)";

  const burnCtx = burnCats
    .filter((c: any) => c.isActive)
    .map((c: any) => `  - ${c.name} (id: ${c.id}, presetKey: ${c.presetKey ?? "custom"}, monthly: $${c.monthlyBaseline})`)
    .join("\n") || "  (none)";

  const inflowCtx = inflowCats
    .filter((c: any) => c.isActive)
    .map((c: any) => `  - ${c.name} (id: ${c.id}, presetKey: ${c.presetKey ?? "custom"}, monthly: $${c.monthlyBaseline})`)
    .join("\n") || "  (none)";

  const headcountCat = burnCats.find((c: any) => c.presetKey === "headcount");
  const headcountBaseline = headcountCat?.monthlyBaseline ?? 0;

  const systemPrompt = `You are a financial scenario parser for a crypto treasury runway tool.

Given a natural-language scenario description and the user's current treasury model, produce a ScenarioOverrides JSON object plus a brief human-readable summary.

CURRENT MODEL:
Volatile assets:
${assetCtx}

Burn categories:
${burnCtx}

Inflow categories:
${inflowCtx}

Headcount baseline: $${headcountBaseline}/mo (assume ~$15,000/person/month if count mentioned).

RULES:
- Use percent_change for relative changes (e.g. "cut by 30%" → value: -0.3).
- Use absolute for specific values (e.g. "ETH at $1500" → type: "absolute", value: 1500).
- For price changes referencing all volatile assets, set assetId to "all_volatile".
- For tier-wide changes ("major crypto down"), set assetId to "major", "alt", or "native".
- For specific assets by name or ticker, use the id from the model above.
- For headcount changes, use headcountChange shortcut; count positive = hire, negative = cut.
- For one-off cash events, use additionalBurnEvents or additionalInflowEvents with the specified month.
- startMonth defaults to 1 unless the user specifies otherwise.
- Only set fields you are confident about; omit the rest.
- The summary field should be 1-2 plain sentences explaining what this scenario models.`;

  const responseSchema = {
    type: "object",
    properties: {
      overrides: SCENARIO_OVERRIDES_JSON_SCHEMA,
      summary: { type: "string" },
    },
    required: ["overrides", "summary"],
  };

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: { name: "scenario_parse", schema: responseSchema } } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    if (!parsed.overrides || !parsed.summary) throw new Error("Missing required fields");

    return Response.json(parsed);
  } catch (err) {
    console.error("[parse-scenario]", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Could not parse that scenario. Try rephrasing." },
      { status: 400 }
    );
  }
}
