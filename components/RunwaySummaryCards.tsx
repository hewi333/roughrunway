"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardPlacard } from "@/components/ui/card";
import { useProjection } from "@/lib/hooks/useProjection";
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

export default function RunwaySummaryCards() {
  const { summary } = useProjection();

  const hardRunway = summary.hardRunwayMonths;
  const extendedRunway = summary.extendedRunwayMonths;
  const fundingGap = summary.fundingGapUSD;
  const constrainedMonths = summary.liquidityConstrainedMonths;
  const hasGap = fundingGap > 0;

  const gapHelper =
    hasGap && constrainedMonths > 0
      ? `Liquidity-constrained ${constrainedMonths} ${constrainedMonths === 1 ? "mo" : "mos"}`
      : "Raise or cut to cover";

  return (
    <Card
      className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-knob-silver dark:divide-knob-silver-dark"
      data-action="runway-summary"
    >
      <Cell label="Hard Runway" helper="Stablecoins + fiat only">
        <div className={cn("text-h2 font-mono font-bold", runwayColorClass(hardRunway))}>
          {hardRunway !== null ? `${hardRunway} mo` : "18+ mo"}
        </div>
      </Cell>

      <Cell label="Extended Runway" helper="Includes volatile assets">
        <div className={cn("text-h2 font-mono font-bold", runwayColorClass(extendedRunway))}>
          {extendedRunway !== null ? `${extendedRunway} mo` : "18+ mo"}
        </div>
      </Cell>

      <Cell
        label="Funding Gap"
        helper={gapHelper}
        trailing={
          hasGap ? (
            <AlertTriangle
              className="h-4 w-4 text-aviation-red dark:text-aviation-red-dark"
              aria-hidden="true"
            />
          ) : null
        }
      >
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
      </Cell>
    </Card>
  );
}

interface CellProps {
  label: string;
  helper: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

function Cell({ label, helper, trailing, children }: CellProps) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <CardPlacard>{label}</CardPlacard>
        {trailing}
      </div>
      {children}
      <span className="text-caption text-muted-foreground">{helper}</span>
    </div>
  );
}
