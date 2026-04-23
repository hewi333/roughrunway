"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, TrendingUp, TrendingDown, ExternalLink, Zap } from "lucide-react";
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
const HEADLINE_INTERVAL_MS = 12 * 1000; // rotate every 12 seconds
const DISMISS_KEY = "rr_banner_dismissed";

// ─── sub-components ───────────────────────────────────────────────────────────

function PriceTicker({ entry }: { entry: PriceEntry }) {
  const positive = entry.change24h >= 0;
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-caption font-mono font-semibold text-foreground">
        {entry.ticker}
      </span>
      <span className="text-caption font-mono text-foreground">
        {formatPrice(entry.price)}
      </span>
      <span
        className={cn(
          "text-placard font-mono flex items-center gap-0.5",
          positive
            ? "text-aviation-green dark:text-aviation-green-dark"
            : "text-aviation-red dark:text-aviation-red-dark"
        )}
      >
        {positive ? (
          <TrendingUp className="h-2.5 w-2.5" aria-hidden="true" />
        ) : (
          <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
        )}
        {positive ? "+" : ""}
        {entry.change24h.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function MarketBanner() {
  const { model } = useRoughRunwayStore();
  const [data, setData] = useState<BannerData | null>(null);
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive tickers from the model's volatile assets + defaults
  const tickers = [
    "BTC",
    "ETH",
    ...model.treasury.volatileAssets
      .filter((a: { ticker: string }) => !["BTC", "ETH"].includes(a.ticker.toUpperCase()))
      .map((a: { ticker: string }) => a.ticker.toUpperCase()),
  ].slice(0, 6);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/ai/market-banner?tokens=${tickers.join(",")}`);
      if (!res.ok) return; // degrade silently
      const json: BannerData = await res.json();
      setData(json);
    } catch {
      // network error — keep last data or stay hidden
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user has dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      setLoading(false);
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotate headlines
  useEffect(() => {
    if (!data?.headlines?.length) return;
    timerRef.current = setInterval(() => {
      setHeadlineIdx((i: number) => (i + 1) % data.headlines.length);
    }, HEADLINE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [data?.headlines]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  // Don't render if dismissed, still loading, or no data came back
  if (dismissed || loading || !data) return null;
  if (!data.prices?.length && !data.headlines?.length) return null;

  const headline = data.headlines?.[headlineIdx];

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 bg-ink dark:bg-panel-dark border-b border-knob-silver/20 text-mountain-white dark:text-foreground shrink-0"
      role="complementary"
      aria-label="Live market data"
      data-action="market-banner"
    >
      {/* Price tickers */}
      <div className="flex items-center gap-4 overflow-hidden shrink-0">
        {data.prices.map((p: PriceEntry) => (
          <PriceTicker key={p.ticker} entry={p} />
        ))}
      </div>

      {/* Divider */}
      {headline && (
        <div className="h-4 w-px bg-knob-silver/30 shrink-0" aria-hidden="true" />
      )}

      {/* Rotating headline */}
      {headline && (
        <a
          href={headline.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-caption text-mountain-white/80 dark:text-muted-foreground hover:text-mountain-white dark:hover:text-foreground transition-colors min-w-0 flex-1"
          data-action="market-headline"
        >
          <span className="truncate">{headline.title}</span>
          <span className="text-mountain-white/50 dark:text-muted-foreground shrink-0">
            — {headline.source}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
        </a>
      )}

      {/* Powered by Perplexity */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <Zap className="h-3 w-3 text-perplexity shrink-0" aria-hidden="true" />
        <span className="text-placard uppercase tracking-wide text-perplexity hidden lg:inline">
          Perplexity
        </span>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 text-mountain-white/50 hover:text-mountain-white dark:text-muted-foreground dark:hover:text-foreground transition-colors"
        aria-label="Dismiss market banner"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
