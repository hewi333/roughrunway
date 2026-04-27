"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardPlacard } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Sparkline } from "@/components/ui/sparkline";
import { useProjection } from "@/lib/hooks/useProjection";
import { useRoughRunwayStore } from "@/lib/store";
import { computeScenarioProjection } from "@/lib/projection-engine";
import type {
  MonthlyProjection,
  RunwaySummary,
  Scenario,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// Treat null (runway exceeds horizon) as "infinite" so lowest-runway picking
// works correctly: a scenario where runway depletes mid-horizon is "worse"
// than a scenario where it never depletes.
function runwayKey(months: number | null): number {
  return months === null ? Number.POSITIVE_INFINITY : months;
}

function formatCompactDollars(value: number): string {
  if (!value) return "$0";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

type RunwayHealth = "healthy" | "warning" | "critical";

function runwayHealth(months: number | null): RunwayHealth {
  if (months === null || months > 12) return "healthy";
  if (months >= 6) return "warning";
  return "critical";
}

function runwayColorClass(months: number | null): string {
  const h = runwayHealth(months);
  if (h === "healthy") return "text-aviation-green dark:text-aviation-green-dark";
  if (h === "warning") return "text-knob-gold dark:text-knob-gold-dark";
  return "text-swiss-red dark:text-aviation-red-dark";
}

function gaugeColorClass(months: number | null): string {
  const h = runwayHealth(months);
  if (h === "healthy") return "bg-aviation-green dark:bg-aviation-green-dark";
  if (h === "warning") return "bg-knob-gold dark:bg-knob-gold-dark";
  return "bg-swiss-red dark:bg-aviation-red-dark";
}

function sparkColor(months: number | null): string {
  const h = runwayHealth(months);
  if (h === "healthy") return "var(--chart-stables)";
  if (h === "warning") return "var(--chart-volatile-major)";
  return "var(--chart-hard-runway)";
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
  const { summary: baselineSummary, projections: baselineProjections } =
    useProjection();
  const { model } = useRoughRunwayStore();

  // Pick the worst-case projection across baseline + active scenarios so the
  // top cards (and their status colors) respond when a user toggles a
  // scenario. With nothing active, this is just the baseline.
  const activeScenarios = model.scenarios.filter((s: Scenario) => s.isActive);
  const scenarioRuns = React.useMemo(
    () =>
      activeScenarios.map((scenario) => {
        const { summary, projections } = computeScenarioProjection(
          model,
          scenario,
        );
        return { scenario, summary, projections };
      }),
    [model, activeScenarios],
  );

  const baselineRun = {
    scenario: null as Scenario | null,
    summary: baselineSummary,
    projections: baselineProjections,
  };

  const candidates: {
    scenario: Scenario | null;
    summary: RunwaySummary;
    projections: MonthlyProjection[];
  }[] = [baselineRun, ...scenarioRuns];

  // Worst-case selectors: lowest hard / extended runway and largest funding
  // gap can come from different scenarios. Each card colors itself based on
  // its own worst case so the user sees which dimension is most stressed.
  const worstHard = candidates.reduce((acc, c) =>
    runwayKey(c.summary.hardRunwayMonths) <
    runwayKey(acc.summary.hardRunwayMonths)
      ? c
      : acc,
  );
  const worstExtended = candidates.reduce((acc, c) =>
    runwayKey(c.summary.extendedRunwayMonths) <
    runwayKey(acc.summary.extendedRunwayMonths)
      ? c
      : acc,
  );
  const worstGap = candidates.reduce((acc, c) =>
    c.summary.fundingGapUSD > acc.summary.fundingGapUSD ? c : acc,
  );

  const hardRunway = worstHard.summary.hardRunwayMonths;
  const extendedRunway = worstExtended.summary.extendedRunwayMonths;
  const fundingGap = worstGap.summary.fundingGapUSD;
  const constrainedMonths = worstGap.summary.liquidityConstrainedMonths;
  const avgBurn = worstHard.summary.averageMonthlyNetBurn;
  const totalUSD = baselineSummary.currentTotalUSD;
  const atHaircut = baselineSummary.currentTotalAtHaircut;
  const projectionMax = model.projectionMonths;
  const hasGap = fundingGap > 0;
  const hasActiveScenarios = activeScenarios.length > 0;

  const hardCaption =
    worstHard.scenario?.name ??
    (hasActiveScenarios ? "Baseline (least stressed)" : "Stablecoins + fiat only");
  const extendedCaption =
    worstExtended.scenario?.name ??
    (hasActiveScenarios ? "Baseline (least stressed)" : "Includes volatile assets");
  const gapCaption = worstGap.scenario
    ? `Under ${worstGap.scenario.name}`
    : hasGap && constrainedMonths > 0
      ? `Liquidity-constrained ${constrainedMonths} ${constrainedMonths === 1 ? "mo" : "mos"}`
      : hasGap
        ? "Raise or cut to cover"
        : "No funding gap in horizon";

  const hardProjections = worstHard.projections;
  const extendedProjections = worstExtended.projections;
  const gapProjections = worstGap.projections;

  const hardSeries = React.useMemo(
    () => [totalUSD, ...hardProjections.map((p) => Math.max(p.hardBalance, 0))],
    [hardProjections, totalUSD],
  );
  const extendedSeries = React.useMemo(
    () => [
      atHaircut || totalUSD,
      ...extendedProjections.map((p) => Math.max(p.extendedBalance, 0)),
    ],
    [extendedProjections, atHaircut, totalUSD],
  );
  const gapSeries = React.useMemo(() => {
    if (hasGap) {
      return [0, ...gapProjections.map((p) => p.cumulativeUnmetDeficit)];
    }
    return [totalUSD, ...gapProjections.map((p) => Math.max(p.hardBalance, 0))];
  }, [gapProjections, hasGap, totalUSD]);

  return (
    <Card
      className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-knob-silver dark:divide-knob-silver-dark"
      data-action="runway-summary"
    >
      {/* Hard Runway */}
      <div
        className="flex flex-col gap-2 px-5 py-4 motion-safe:animate-fade-in-up"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center justify-between gap-2">
          <CardPlacard>Hard Runway</CardPlacard>
          <StatusBadge months={hardRunway} />
        </div>
        <div className={cn("text-h2 font-mono font-bold", runwayColorClass(hardRunway))}>
          {hardRunway !== null ? (
            <><NumberTicker value={hardRunway} /> mo</>
          ) : "18+ mo"}
        </div>
        <Sparkline data={hardSeries} color={sparkColor(hardRunway)} />
        <RunwayGauge months={hardRunway} max={projectionMax} />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-muted-foreground truncate">{hardCaption}</span>
          {avgBurn > 0 && (
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              {formatCompactDollars(avgBurn)}/mo burn
            </span>
          )}
        </div>
      </div>

      {/* Extended Runway */}
      <div
        className="flex flex-col gap-2 px-5 py-4 motion-safe:animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center justify-between gap-2">
          <CardPlacard>Extended Runway</CardPlacard>
          <StatusBadge months={extendedRunway} />
        </div>
        <div className={cn("text-h2 font-mono font-bold", runwayColorClass(extendedRunway))}>
          {extendedRunway !== null ? (
            <><NumberTicker value={extendedRunway} /> mo</>
          ) : "18+ mo"}
        </div>
        <Sparkline data={extendedSeries} color={sparkColor(extendedRunway)} />
        <RunwayGauge months={extendedRunway} max={projectionMax} />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-muted-foreground truncate">{extendedCaption}</span>
          {atHaircut > 0 && (
            <span className="font-mono text-caption text-muted-foreground tabular-nums">
              {formatCompactDollars(atHaircut)} at haircut
            </span>
          )}
        </div>
      </div>

      {/* Funding Gap */}
      <div
        className="flex flex-col gap-2 px-5 py-4 motion-safe:animate-fade-in-up"
        style={{ animationDelay: "160ms" }}
      >
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
        <Sparkline
          data={gapSeries}
          color={hasGap ? "var(--chart-funding-gap)" : "var(--chart-stables)"}
        />
        {/* spacer keeps vertical rhythm consistent with gauge cells */}
        <div className="h-1" />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-caption text-muted-foreground truncate">{gapCaption}</span>
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
