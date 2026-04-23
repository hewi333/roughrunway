"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useProjection } from "@/lib/hooks/useProjection";

function formatCompactDollars(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

export default function FundingGapCallout() {
  const { summary } = useProjection();

  if (summary.fundingGapUSD <= 0) return null;

  const { fundingGapUSD, liquidityConstrainedMonths } = summary;

  return (
    <div
      className="flex items-start gap-3 rounded-panel border border-knob-gold/50 bg-knob-gold/10 p-4"
      data-action="funding-gap-callout"
    >
      <AlertTriangle className="h-5 w-5 text-knob-gold shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-body font-semibold text-foreground">
          Funding gap: {formatCompactDollars(fundingGapUSD)}
        </p>
        <p className="text-caption text-muted-foreground mt-0.5">
          Treasury can&apos;t fully cover burn over the projection horizon — even with volatile asset
          liquidations. You&apos;d need to raise or cut this amount to bridge the shortfall.
          {liquidityConstrainedMonths > 0 && (
            <>
              {" "}
              Liquidity-constrained in{" "}
              <span className="font-medium text-foreground">
                {liquidityConstrainedMonths} month
                {liquidityConstrainedMonths !== 1 ? "s" : ""}
              </span>
              .
            </>
          )}
        </p>
      </div>
    </div>
  );
}
