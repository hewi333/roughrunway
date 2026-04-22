"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-col space-y-1 pb-2">
          <CardPlacard>Hard Runway</CardPlacard>
          <span className="text-caption text-muted-foreground">
            Stablecoins + fiat only
          </span>
        </CardHeader>
        <CardContent>
          <div className={cn("text-h1 font-mono font-bold", runwayColorClass(hardRunway))}>
            {hardRunway !== null ? `${hardRunway} mo` : "18+ mo"}
          </div>
          <p className="text-caption text-muted-foreground mt-2">
            The guaranteed floor
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col space-y-1 pb-2">
          <CardPlacard>Extended Runway</CardPlacard>
          <span className="text-caption text-muted-foreground">
            Includes volatile assets
          </span>
        </CardHeader>
        <CardContent>
          <div className={cn("text-h1 font-mono font-bold", runwayColorClass(extendedRunway))}>
            {extendedRunway !== null ? `${extendedRunway} mo` : "18+ mo"}
          </div>
          <p className="text-caption text-muted-foreground mt-2">
            Simulated month-by-month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col space-y-1 pb-2">
          <CardPlacard>Funding Gap</CardPlacard>
          <span className="text-caption text-muted-foreground">
            Unmet deficit over horizon
          </span>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-h1 font-mono font-bold",
              fundingGap > 0
                ? "text-aviation-red dark:text-aviation-red-dark"
                : "text-aviation-green dark:text-aviation-green-dark"
            )}
          >
            {fundingGap > 0 ? `−${formatCompactDollars(fundingGap)}` : "$0"}
          </div>
          <p className="text-caption text-muted-foreground mt-2">
            Raise or cut to cover
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
