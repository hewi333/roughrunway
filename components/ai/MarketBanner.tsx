"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// ─── types ────────────────────────────────────────────────────────────────────

interface PriceEntry {
  ticker: string;
  price: number;
  change24h: number;
}

interface Headline {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface BannerData {
  prices: PriceEntry[];
  headlines: Headline[];
  fetchedAt: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 100_000) return `$${(price / 1_000).toFixed(0)}K`;
  if (price >= 1_000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

const REFRESH_MS = 10 * 60 * 1000; // 10 minutes

// ─── sub-components ───────────────────────────────────────────────────────────

function PriceTicker({ entry }: { entry: PriceEntry }) {
  const positive = entry.change24h >= 0;
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-mono font-semibold">{entry.ticker}</span>
      <span className="text-sm font-mono">{formatPrice(entry.price)}</span>
      <span
        className={cn(
          "text-sm font-mono flex items-center gap-0.5",
          positive
            ? "text-aviation-green dark:text-aviation-green-dark"
            : "text-aviation-red dark:text-aviation-red-dark"
        )}
      >
        {positive ? (
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <TrendingDown className="h-3 w-3" aria-hidden="true" />
        )}
        {positive ? "+" : ""}
        {entry.change24h.toFixed(1)}%
      </span>
    </div>
  );
}

function HeadlineItem({ headline }: { headline: Headline }) {
  return (
    <a
      href={headline.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 shrink-0 cursor-pointer text-foreground/90 hover:text-foreground hover:underline underline-offset-4 decoration-perplexity/60 transition-colors"
      data-action="market-headline"
    >
      <span className="text-sm">{headline.title}</span>
      <span className="text-sm opacity-60">— {headline.source}</span>
      <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
    </a>
  );
}

function Separator() {
  return (
    <span
      className="h-4 w-px bg-knob-silver/40 dark:bg-knob-silver-dark/30 shrink-0"
      aria-hidden="true"
    />
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function MarketBanner() {
  const { model } = useRoughRunwayStore();
  const [data, setData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Always show BTC, ETH, SOL; append user-held tickers, deduped (uppercase),
  // capped at 6. The defaults guarantee enough scrolling content that the
  // marquee seam isn't visible when the user hasn't added many assets.
  const seen = new Set(["BTC", "ETH", "SOL"]);
  const userTickers: string[] = [];
  for (const a of model.treasury.volatileAssets) {
    if (!a.ticker) continue;
    const t = a.ticker.toUpperCase();
    if (seen.has(t)) continue;
    seen.add(t);
    userTickers.push(t);
  }
  const tickers = ["BTC", "ETH", "SOL", ...userTickers].slice(0, 6);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/ai/market-banner?tokens=${tickers.join(",")}`);
      if (!res.ok) return;
      const json: BannerData = await res.json();
      // Filter out clearly-broken price entries (zero, negative, non-finite)
      // and dedupe by ticker so a model that returns the same ticker twice
      // can't produce a doubled-up tile in the marquee.
      const seenTickers = new Set<string>();
      const cleanPrices: PriceEntry[] = [];
      for (const p of json.prices ?? []) {
        if (!p || typeof p.price !== "number" || !Number.isFinite(p.price) || p.price <= 0) continue;
        const t = (p.ticker ?? "").toUpperCase();
        if (!t || seenTickers.has(t)) continue;
        seenTickers.add(t);
        cleanPrices.push({ ...p, ticker: t });
      }
      setData({ ...json, prices: cleanPrices });
    } catch {
      // network error — keep last data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !data) return null;
  if (!data.prices?.length && !data.headlines?.length) return null;

  // Build a single flat array of ticker items, alternating prices and headlines
  // with separators so the scroll reads like a real news crawl.
  const items: React.ReactNode[] = [];
  data.prices.forEach((p, i) => {
    items.push(<PriceTicker key={`p-${p.ticker}-${i}`} entry={p} />);
    items.push(<Separator key={`ps-${i}`} />);
  });
  data.headlines.forEach((h, i) => {
    items.push(<HeadlineItem key={`h-${i}`} headline={h} />);
    items.push(<Separator key={`hs-${i}`} />);
  });

  return (
    <div
      className="relative flex items-stretch bg-card text-foreground border-b border-knob-silver/40 dark:border-knob-silver-dark/30 shrink-0 overflow-hidden"
      role="complementary"
      aria-label="Live market data"
      data-action="market-banner"
    >
      {/* Scrolling track — content duplicated for seamless loop */}
      <div className="flex-1 overflow-hidden py-3 group">
        <div
          className="flex items-center whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] w-max"
          style={{ willChange: "transform" }}
        >
          <div className="flex items-center gap-6 pr-6">{items}</div>
          <div className="flex items-center gap-6 pr-6" aria-hidden="true">
            {items.map((node, i) =>
              React.isValidElement(node)
                ? React.cloneElement(node, { key: `dup-${i}` })
                : node
            )}
          </div>
        </div>
      </div>

      {/* Pinned badge — gradient fades into bg-card so it reads cleanly in light or dark mode */}
      <div className="shrink-0 flex items-center gap-1.5 pl-6 pr-4 bg-gradient-to-l from-card via-card to-transparent">
        <a
          href="https://www.theaccountantquits.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0"
            aria-hidden="true"
          />
          Built for The Accountant Quits Hackathon
        </a>
      </div>
    </div>
  );
}
