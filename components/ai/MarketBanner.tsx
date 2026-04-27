"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
const CACHE_KEY = "roughrunway:market-banner:v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — short enough that headlines stay current

// Format an ISO 8601 publishedAt as a friendly relative label like "2h ago" or
// "Apr 27" so users can see at a glance whether headlines are actually fresh.
function formatRelative(iso: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diffMs = Date.now() - t;
  if (diffMs < 0) return "now";
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function loadCache(): BannerData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw) as { data: BannerData; savedAt: number };
    if (!data || typeof savedAt !== "number") return null;
    if (Date.now() - savedAt > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(data: BannerData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // quota / private mode — ignore
  }
}

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
  const when = formatRelative(headline.publishedAt);
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
      {when && (
        <span className="text-xs opacity-60 font-mono" aria-label={`published ${when}`}>
          · {when}
        </span>
      )}
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
  // Initial state must match the server render (null) to avoid a hydration
  // mismatch — we read the localStorage cache in the mount effect below.
  const [data, setData] = useState<BannerData | null>(null);

  // Always show a wide default set of majors; append user-held tickers,
  // deduped (uppercase). A longer marquee track means the duplicate copy
  // (rendered for seamless scroll) sits offscreen most of the time, so the
  // banner reads as a continuous crawl rather than "BTC ETH SOL BTC ETH SOL".
  const DEFAULT_TICKERS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ARB"];
  const seen = new Set(DEFAULT_TICKERS);
  const userTickers: string[] = [];
  for (const a of model.treasury.volatileAssets) {
    if (!a.ticker) continue;
    const t = a.ticker.toUpperCase();
    if (seen.has(t)) continue;
    seen.add(t);
    userTickers.push(t);
  }
  const tickers = [...DEFAULT_TICKERS, ...userTickers].slice(0, 8);

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
      const next: BannerData = { ...json, prices: cleanPrices };
      // Only overwrite cache if we actually got something useful — protects
      // a good cached payload from being clobbered by an empty response.
      if (next.prices.length > 0 || (next.headlines?.length ?? 0) > 0) {
        setData(next);
        saveCache(next);
      }
    } catch {
      // network error — keep last data (state stays as cached/previous)
    }
  };

  useEffect(() => {
    const cached = loadCache();
    if (cached) setData(cached);
    fetchData();
    const interval = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No fake fallbacks — if headlines aren't real, show nothing in their slot.
  // Prices alone are still useful and keep the banner alive.
  const prices = data?.prices ?? [];
  const headlines = data?.headlines ?? [];

  // Build a single flat array of ticker items, alternating prices and headlines
  // with separators so the scroll reads like a real news crawl.
  const items: React.ReactNode[] = [];
  prices.forEach((p, i) => {
    items.push(<PriceTicker key={`p-${p.ticker}-${i}`} entry={p} />);
    items.push(<Separator key={`ps-${i}`} />);
  });
  headlines.forEach((h, i) => {
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

      {/* Pinned "Market updates by [Perplexity]" badge. The Perplexity asset
          already includes the wordmark, so the text reads "Market updates by"
          plus the logo+wordmark image. */}
      <div className="shrink-0 flex items-center gap-2 pl-6 pr-4 bg-gradient-to-l from-card via-card to-transparent">
        <span
          className="h-1.5 w-1.5 rounded-full bg-swiss-red animate-pulse shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-swiss-red">
          Market updates by
        </span>
        <Image
          src="/330px-Perplexity_AI_logo.svg.png"
          alt="Perplexity"
          width={88}
          height={18}
          className="shrink-0 object-contain h-4 w-auto"
        />
      </div>
    </div>
  );
}
