import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";

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

  const tokens = req.nextUrl.searchParams.get("tokens")?.split(",") ?? ["BTC", "ETH", "SOL"];
  // Sanitize: only allow alphanumeric tickers, max 10 tokens
  const safe = tokens.slice(0, 10).map((t: string) => t.replace(/[^A-Za-z0-9]/g, "")).filter(Boolean);

  const prompt = `Return current cryptocurrency prices and recent crypto news headlines.

PRICES NEEDED: ${safe.join(", ")}
For each ticker symbol, return the current USD spot price and 24-hour percentage change as a number (e.g. 2.1 means +2.1%, -0.8 means -0.8%).
If a ticker is too obscure to find a reliable price, omit it from the prices array — do not guess.

HEADLINES: Return exactly 3 crypto news headlines published in the last 12 hours.
Prefer major outlets: CoinDesk, The Block, Decrypt, CoinTelegraph, Bloomberg, Reuters.
Headlines must be real, verifiable articles — no fabrication.

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
    return Response.json({ ...parsed, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[market-banner]", err instanceof Error ? err.message : err);
    return Response.json({ error: "Perplexity unavailable" }, { status: 503 });
  }
}
