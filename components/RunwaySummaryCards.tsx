"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardPlacard } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useProjection } from "@/lib/hooks/useProjection";
import { useRoughRunwayStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function formatCompactDollars(value: number): string {
  if (!value) return "$0";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function runwayColorClass(months: number | null): string {
  if (months === null) return "text-aviation-green dark:text-aviation-green-dark";
  if (months > 12) return "text-aviation-green dark:text-aviation-green-dark";
  if (months >= 6) return "text-knob-gold dark:text-knob-gold-dark";
  return "text-swiss-red dark:text-aviation-red-dark";
}

function gaugeColorClass(months: number | null): string {
  if (months === null) return "bg-aviation-green dark:bg-aviation-green-dark";
  if (months > 12) return "bg-aviation-green dark:bg-aviation-green-dark";
  if (months >= 6) return "bg-knob-gold dark:bg-knob-gold-dark";
  return "bg-swiss-red dark:bg-aviation-red-dark";
}

function StatusBadge({ months }: { months: number | null }) {
  const isHealthy = months === null || months > 12;
  const isWarning = months !== null && months >= 6 && months <= 12;
  const label = isHealthy ? "Healthy" : isWarning ? "Warning" : "Critical";
  const colorClass = isHealthy
    ? "bg-aviation-green/10 text-aviation-green dark:bg-aviation-green-dark/10 dark:text-aviation-green-dark"
    : isWarning
      ? "bg-knob-gold/10 text-knob-gold dark:bg-knob-gold-dark/10 dark:text-knob-gold-dark"
      : "bg-swiss-red/10 text-swiss-red dark:bg-aviation-red-dark/10 dark:text-aviation-red-dark";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-knob px-2 py-0.5 text-placard uppercase tracking-widest",
        colorClass
      )}
    >
      {label}
    </span>
  );
}

function RunwayGauge({ months, max }: { months: number | null; max: number }) {
  const pct = months === null ? 100 : Math.min((months / max) * 100, 100);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-knob-silver/30 dark:bg-knob-silver-dark/20">
      <div
        className={cn("h-full rounded-full transition-all duration-500", gaugeColorClass(months))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function RunwaySummaryCards() {
  const { summary } = useProjection();
  const { model } = useRoughRunwayStore();

  const hardRunway = summary.hardRunwayMonths;
  const extendedRunway = summary.extendedRunwayMonths;
  const fundingGap = summary.fundingGapUSD;
  const constrainedMonths = summary.liquidityConstrainedMonths;
  const avgBurn = summary.averageMonthlyNetBurn;
  const totalUSD = summary.currentTotalUSD;
  const atHaircut = summary.currentTotalAtHaircut;
  const projectionMax = model.projectionMonths;
  const hasGap = fundingGap > 0;

  const gapHelper =
    hasGap && constrainedMonths > 0
      ? `Liquidity-constrained ${constrainedMonths} ${constrainedMonths === 1 ? "mo" : "mos"}`
      : hasGap
        ? "Raise or cut to cover"
        : "No funding gap in horizon";

  return (
    <Card
      className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-knob-silver dark:divide-knob-silver-dark"
      data-action="runway-summary"
    >
      {/* Hard Runway */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <CardPlacard>Hard Runway</CardPlacard>
          <StatusBadge months={hardRunway} />
        </div>
        <div className={cn("text-h2 font-mono font-bold", runwayColorClass(hardRunway))}>
          {hardRunway !== null ? (
            <><NumberTicker value={hardRunway} /> mo</>
          ) : "18+ mo"}
        </div>
        <RunwayGauge months={hardRunway} max={projectionMax} />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-muted-foreground">Stablecoins + fiat only</span>
          {avgBurn > 0 && (
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              {formatCompactDollars(avgBurn)}/mo burn
            </span>
          )}
        </div>
      </div>

      {/* Extended Runway */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <CardPlacard>Extended Runway</CardPlacard>
          <StatusBadge months={extendedRunway} />
        </div>
        <div className={cn("text-h2 font-mono font-bold", runwayColorClass(extendedRunway))}>
          {extendedRunway !== null ? (
            <><NumberTicker value={extendedRunway} /> mo</>
          ) : "18+ mo"}
        </div>
        <RunwayGauge months={extendedRunway} max={projectionMax} />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-muted-foreground">Includes volatile assets</span>
          {atHaircut > 0 && (
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              {formatCompactDollars(atHaircut)} at haircut
            </span>
          )}
        </div>
      </div>

      {/* Funding Gap */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <CardPlacard>Funding Gap</CardPlacard>
          <div className="flex items-center gap-1.5">
            {hasGap && (
              <AlertTriangle
                className="h-3.5 w-3.5 text-aviation-red dark:text-aviation-red-dark"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "inline-flex items-center rounded-knob px-2 py-0.5 text-placard uppercase tracking-widest",
                hasGap
                  ? "bg-swiss-red/10 text-swiss-red dark:bg-aviation-red-dark/10 dark:text-aviation-red-dark"
                  : "bg-aviation-green/10 text-aviation-green dark:bg-aviation-green-dark/10 dark:text-aviation-green-dark"
              )}
            >
              {hasGap ? "Deficit" : "Funded"}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "text-h2 font-mono font-bold",
            hasGap
              ? "text-aviation-red dark:text-aviation-red-dark"
              : "text-aviation-green dark:text-aviation-green-dark"
          )}
        >
          {hasGap ? `−${formatCompactDollars(fundingGap)}` : "$0"}
        </div>
        {/* spacer keeps vertical rhythm consistent with gauge cells */}
        <div className="h-1" />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-muted-foreground">{gapHelper}</span>
          {totalUSD > 0 && (
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              {formatCompactDollars(totalUSD)} treasury
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
