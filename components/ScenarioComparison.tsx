"use client";

import React from "react";
import { useProjection } from "@/lib/hooks/useProjection";
import { useRoughRunwayStore } from "@/lib/store";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { cn } from "@/lib/utils";
import type { Scenario, RunwaySummary } from "@/lib/types";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function DeltaBadge({ delta, invert = false }: { delta: number; invert?: boolean }) {
  if (delta === 0) {
    return (
      <span className="text-caption text-muted-foreground font-mono">—</span>
    );
  }
  // For months: more = better. For gaps: more = worse (invert).
  const positive = invert ? delta < 0 : delta > 0;
  return (
    <span
      className={cn(
        "text-caption font-mono",
        positive
          ? "text-aviation-green dark:text-aviation-green-dark"
          : "text-aviation-red dark:text-aviation-red-dark"
      )}
    >
      {delta > 0 ? "+" : ""}
      {delta}
    </span>
  );
}

function MonthDisplay({ months }: { months: number | null; maxMonths: number }) {
  return (
    <span className="text-body font-mono font-semibold text-foreground">
      {months === null ? "18+ mo" : `${months} mo`}
    </span>
  );
}

export default function ScenarioComparison() {
  const { model } = useRoughRunwayStore();
  const { summary: baseline } = useProjection();

  const activeScenarios = model.scenarios.filter((s: Scenario) => s.isActive);

  if (activeScenarios.length === 0) return null;

  const scenarioResults = activeScenarios.map((scenario: Scenario) => {
    const { summary } = computeScenarioProjection(model, scenario);
    return { scenario, summary };
  }) as Array<{ scenario: Scenario; summary: RunwaySummary }>;

  const maxMonths = model.projectionMonths;

  const baseHard = baseline.hardRunwayMonths ?? (maxMonths + 1);
  const baseExtended = baseline.extendedRunwayMonths ?? (maxMonths + 1);
  const baseGap = baseline.fundingGapUSD;
  const baseBurn = baseline.averageMonthlyNetBurn;

  return (
    <div
      className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6"
      data-action="scenario-comparison"
    >
      <div className="mb-4">
        <div className="text-placard uppercase text-muted-foreground">Analysis</div>
        <h2 className="text-h3 text-foreground">Scenario Comparison</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-knob-silver dark:border-knob-silver-dark">
              <th className="text-left py-2 pr-6 text-placard uppercase text-muted-foreground w-40">
                Metric
              </th>
              {/* Baseline column */}
              <th className="text-right py-2 px-4 text-placard uppercase text-muted-foreground min-w-[120px]">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className="h-3 w-3 rounded-knob inline-block bg-swiss-red"
                  />
                  <span>Baseline</span>
                </div>
              </th>
              {scenarioResults.map(({ scenario }) => (
                <th
                  key={scenario.id}
                  className="text-right py-2 px-4 text-placard uppercase text-muted-foreground min-w-[140px]"
                >
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className="h-3 w-3 rounded-knob inline-block"
                      style={{ backgroundColor: scenario.color }}
                    />
                    <span className="truncate max-w-[100px]">{scenario.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-knob-silver/30 dark:divide-knob-silver-dark/30">
            {/* Hard Runway */}
            <tr>
              <td className="py-3 pr-6 text-body text-muted-foreground">Hard Runway</td>
              <td className="py-3 px-4 text-right">
                <MonthDisplay months={baseline.hardRunwayMonths} maxMonths={maxMonths} />
              </td>
              {scenarioResults.map(({ scenario, summary }) => {
                const scenHard = summary.hardRunwayMonths ?? (maxMonths + 1);
                const delta = scenHard - baseHard;
                return (
                  <td key={scenario.id} className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <MonthDisplay months={summary.hardRunwayMonths} maxMonths={maxMonths} />
                      <DeltaBadge delta={delta} />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Extended Runway */}
            <tr>
              <td className="py-3 pr-6 text-body text-muted-foreground">Extended Runway</td>
              <td className="py-3 px-4 text-right">
                <MonthDisplay months={baseline.extendedRunwayMonths} maxMonths={maxMonths} />
              </td>
              {scenarioResults.map(({ scenario, summary }) => {
                const scenExt = summary.extendedRunwayMonths ?? (maxMonths + 1);
                const delta = scenExt - baseExtended;
                return (
                  <td key={scenario.id} className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <MonthDisplay months={summary.extendedRunwayMonths} maxMonths={maxMonths} />
                      <DeltaBadge delta={delta} />
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Funding Gap */}
            <tr>
              <td className="py-3 pr-6 text-body text-muted-foreground">Funding Gap</td>
              <td className="py-3 px-4 text-right">
                <span
                  className={cn(
                    "text-body font-mono font-semibold",
                    baseGap > 0
                      ? "text-aviation-red dark:text-aviation-red-dark"
                      : "text-aviation-green dark:text-aviation-green-dark"
                  )}
                >
                  {baseGap > 0 ? fmt(baseGap) : "$0"}
                </span>
              </td>
              {scenarioResults.map(({ scenario, summary }) => {
                const gap = summary.fundingGapUSD;
                const deltaRaw = gap - baseGap;
                const deltaK = Math.round(deltaRaw / 1000);
                return (
                  <td key={scenario.id} className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={cn(
                          "text-body font-mono font-semibold",
                          gap > 0
                            ? "text-aviation-red dark:text-aviation-red-dark"
                            : "text-aviation-green dark:text-aviation-green-dark"
                        )}
                      >
                        {gap > 0 ? fmt(gap) : "$0"}
                      </span>
                      {deltaK !== 0 && (
                        <span
                          className={cn(
                            "text-caption font-mono",
                            deltaRaw < 0
                              ? "text-aviation-green dark:text-aviation-green-dark"
                              : "text-aviation-red dark:text-aviation-red-dark"
                          )}
                        >
                          {deltaRaw > 0 ? "+" : ""}
                          {deltaK}K
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Avg Monthly Net Burn */}
            <tr>
              <td className="py-3 pr-6 text-body text-muted-foreground">Avg Net Burn/mo</td>
              <td className="py-3 px-4 text-right">
                <span className="text-body font-mono font-semibold text-foreground">
                  {fmt(baseBurn)}
                </span>
              </td>
              {scenarioResults.map(({ scenario, summary }) => {
                const scenBurn = summary.averageMonthlyNetBurn;
                const deltaRaw = scenBurn - baseBurn;
                const deltaK = Math.round(deltaRaw / 1000);
                return (
                  <td key={scenario.id} className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-body font-mono font-semibold text-foreground">
                        {fmt(scenBurn)}
                      </span>
                      {deltaK !== 0 && (
                        <span
                          className={cn(
                            "text-caption font-mono",
                            deltaRaw < 0
                              ? "text-aviation-green dark:text-aviation-green-dark"
                              : "text-aviation-red dark:text-aviation-red-dark"
                          )}
                        >
                          {deltaRaw > 0 ? "+" : ""}
                          {deltaK}K
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Liquidity-constrained months */}
            <tr>
              <td className="py-3 pr-6 text-body text-muted-foreground">Constrained Months</td>
              <td className="py-3 px-4 text-right">
                <span className="text-body font-mono font-semibold text-foreground">
                  {baseline.liquidityConstrainedMonths}
                </span>
              </td>
              {scenarioResults.map(({ scenario, summary }) => {
                const delta =
                  summary.liquidityConstrainedMonths -
                  baseline.liquidityConstrainedMonths;
                return (
                  <td key={scenario.id} className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-body font-mono font-semibold text-foreground">
                        {summary.liquidityConstrainedMonths}
                      </span>
                      <DeltaBadge delta={delta} invert={true} />
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
