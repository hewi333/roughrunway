import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { rateLimit, rateLimitResponse } from "@/lib/ai-guards";

export const revalidate = 300; // 5-minute edge cache

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
          change24h: { type: "number" },
        },
        required: ["ticker", "price", "change24h"],
      },
    },
    headlines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          source: { type: "string" },
          publishedAt: { type: "string" },
        },
        required: ["title", "url", "source", "publishedAt"],
      },
    },
  },
  required: ["prices", "headlines"],
};

export async function GET(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  const rl = rateLimit(req);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);

  const tokens = req.nextUrl.searchParams.get("tokens")?.split(",") ?? ["BTC", "ETH", "SOL"];
  // Sanitize: only allow alphanumeric tickers, max 10 tokens, dedupe (uppercase)
  const seen = new Set<string>();
  const safe: string[] = [];
  for (const t of tokens.slice(0, 10)) {
    const clean = t.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    safe.push(clean);
  }

  const prompt = `Return CURRENT live cryptocurrency spot prices and the latest crypto news headlines.

PRICES NEEDED (uppercase tickers): ${safe.join(", ")}
For each listed ticker symbol:
  - Use the most recent USD spot price from a reputable exchange or aggregator (CoinGecko, CoinMarketCap, Binance, Coinbase). The price MUST reflect current market value as of today, not a stale cached value.
  - Provide the 24-hour percentage change as a signed number (e.g. 2.1 means +2.1%, -0.8 means -0.8%).
  - Do NOT return 0 or a placeholder. If you cannot find a reliable up-to-date price for a ticker, OMIT it entirely from the prices array — do not guess and do not fabricate.
  - Never return prices below $0.000001. For majors like BTC and ETH, sanity-check that the price is in the expected order of magnitude.

HEADLINES: Return exactly 3 crypto news headlines published within the last 24 hours.
  - Prefer major outlets: CoinDesk, The Block, Decrypt, CoinTelegraph, Bloomberg, Reuters.
  - Each headline must be a REAL, verifiable article with a working URL — no fabrication.
  - Always populate the headlines array; if reputable news is sparse, include the most recent ones available.

Return the data as JSON matching the provided schema.`;

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_schema", json_schema: { name: "market_banner", schema } } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from Perplexity");

    const parsed = JSON.parse(content);

    // Server-side sanitisation: drop any price that's zero/negative/non-finite.
    // The model occasionally returns 0 for tickers it couldn't price — we'd
    // rather show fewer entries than display "$0.00" next to a real ticker.
    const prices = Array.isArray(parsed.prices)
      ? parsed.prices.filter(
          (p: { price?: number }) =>
            typeof p?.price === "number" &&
            Number.isFinite(p.price) &&
            p.price > 0
        )
      : [];
    const headlines = Array.isArray(parsed.headlines) ? parsed.headlines : [];

    return Response.json({ prices, headlines, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[market-banner]", err instanceof Error ? err.message : err);
    return Response.json({ error: "Perplexity unavailable" }, { status: 503 });
  }
}
