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
          url: { type: "string", description: "Full https URL to the article" },
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

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const cutoffIso = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const prompt = `Today's date is ${todayIso}. Return CURRENT live cryptocurrency spot prices and recent crypto news headlines.

PRICES NEEDED (uppercase tickers): ${safe.join(", ")}
For each listed ticker symbol:
  - Use the most recent USD spot price from a reputable exchange or aggregator (CoinGecko, CoinMarketCap, Binance, Coinbase). The price MUST reflect current market value as of today, not a stale cached value.
  - Provide the 24-hour percentage change as a signed number (e.g. 2.1 means +2.1%, -0.8 means -0.8%).
  - Do NOT return 0 or a placeholder. If you cannot find a reliable up-to-date price for a ticker, OMIT it entirely from the prices array — do not guess and do not fabricate.
  - Never return prices below $0.000001. For majors like BTC and ETH, sanity-check that the price is in the expected order of magnitude.

HEADLINES:
  - Return 3 crypto-related news headlines published in the last 7 days (since ${cutoffIso}). Pick the most recent and most relevant.
  - Prefer major outlets: CoinDesk, The Block, Decrypt, CoinTelegraph, Bloomberg, Reuters.
  - Each headline MUST include a full article URL (https://...). Prefer the canonical article URL; if you only have the source's homepage, return that — never return a search query or placeholder.
  - "title" must be the actual article headline — do NOT invent or paraphrase.
  - "source" must be the publication name (e.g. "CoinDesk").
  - "publishedAt" should be an ISO 8601 date or datetime (e.g. "${todayIso}" or "${todayIso}T14:30:00Z"). An approximate date is acceptable; only omit the headline if you have no plausible publish date at all.
  - Always return at least one headline if any qualifying article exists. Empty arrays are a last resort.

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

    // Perplexity attaches a `citations: string[]` array of real source URLs
    // alongside the message. We use it as a fallback for headline links so
    // they actually resolve even if the model fabricated the URL field.
    const citations: string[] = Array.isArray(
      (completion as unknown as { citations?: unknown }).citations
    )
      ? ((completion as unknown as { citations: string[] }).citations.filter(
          (u) => typeof u === "string" && /^https?:\/\//.test(u)
        ))
      : [];

    // Server-side sanitisation:
    //  - drop prices that are zero / negative / non-finite (avoids "$0.00")
    //  - dedupe by uppercase ticker (avoids visible doubles in the marquee)
    const seenT = new Set<string>();
    const prices: { ticker: string; price: number; change24h: number }[] = [];
    if (Array.isArray(parsed.prices)) {
      for (const p of parsed.prices as Array<{
        ticker?: string;
        price?: number;
        change24h?: number;
      }>) {
        if (typeof p?.price !== "number" || !Number.isFinite(p.price) || p.price <= 0) continue;
        const t = String(p.ticker ?? "").toUpperCase();
        if (!t || seenT.has(t)) continue;
        seenT.add(t);
        prices.push({
          ticker: t,
          price: p.price,
          change24h: typeof p.change24h === "number" && Number.isFinite(p.change24h) ? p.change24h : 0,
        });
      }
    }

    // Headlines: keep entries with a valid http(s) URL; if URL is bad/missing,
    // try to substitute a citation URL so at least the link works. Drop any
    // entry that we still can't make resolvable.
    const isHttp = (u: unknown): u is string =>
      typeof u === "string" && /^https?:\/\//.test(u);
    const headlines = Array.isArray(parsed.headlines)
      ? (parsed.headlines as Array<{
          title?: string;
          url?: string;
          source?: string;
          publishedAt?: string;
        }>)
          .map((h, i) => {
            const url = isHttp(h.url) ? h.url : citations[i];
            if (!isHttp(url)) return null;
            return {
              title: String(h.title ?? "").slice(0, 200),
              url,
              source: String(h.source ?? new URL(url).hostname),
              publishedAt: String(h.publishedAt ?? ""),
            };
          })
          .filter((h): h is NonNullable<typeof h> => h !== null && h.title.length > 0)
      : [];

    if (headlines.length === 0) {
      console.warn("[market-banner] no usable headlines returned by Perplexity");
    }

    return Response.json({ prices, headlines, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[market-banner]", err instanceof Error ? err.message : err);
    return Response.json({ error: "Perplexity unavailable" }, { status: 503 });
  }
}
