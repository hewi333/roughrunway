import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import {
  rateLimit,
  rateLimitResponse,
  validatePriceSet,
} from "@/lib/ai-guards";

const PRICE_SET_SCHEMA = {
  type: "object",
  properties: {
    prices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ticker: { type: "string" },
          price: { type: "number" },
        },
        required: ["ticker", "price"],
      },
    },
  },
  required: ["prices"],
};

export const revalidate = 60;

export async function POST(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  const rl = rateLimit(req);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  let body: { tickers?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = Array.isArray(body.tickers) ? body.tickers : [];
  const tickers = raw
    .slice(0, 25)
    .map((t) => String(t).replace(/[^A-Za-z0-9]/g, "").toUpperCase())
    .filter(Boolean);

  if (tickers.length === 0) {
    return Response.json({ error: "tickers array is required" }, { status: 400 });
  }

  const prompt = `Return the current USD spot price for each of these cryptocurrency tickers: ${tickers.join(", ")}.

RULES:
- Use the mainstream market price (aggregated spot) as of now.
- Ticker field must echo the input symbol in uppercase.
- If a ticker is too obscure or ambiguous to price reliably, omit it from the array — do not guess.
- No commentary, no news, just a price per ticker.`;

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: { name: "price_set", schema: PRICE_SET_SCHEMA },
      } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    const validated = validatePriceSet(parsed);
    if (!validated) {
      return Response.json(
        { error: "AI returned a malformed price set." },
        { status: 422 }
      );
    }

    // Only return prices for tickers we asked about, in case the model
    // hallucinated extras.
    const requested = new Set(tickers);
    const prices = validated.prices.filter((p) => requested.has(p.ticker));

    return Response.json({ prices, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[refresh-prices]", err instanceof Error ? err.message : err);
    return Response.json({ error: "Perplexity unavailable" }, { status: 503 });
  }
}
