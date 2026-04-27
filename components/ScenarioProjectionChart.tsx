"use client";

import React from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ComposedChart,
} from "recharts";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { useRoughRunwayStore } from "@/lib/store";
import { useProjection } from "@/lib/hooks/useProjection";
import ScenarioSummaryCards from "@/components/ScenarioSummaryCards";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { Scenario } from "@/lib/types";

interface ScenarioProjectionChartProps {
  className?: string;
}

type ScenarioChartPoint = Record<string, string | number>;

const AXIS_TICK = {
  fill: "hsl(var(--muted-foreground))",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const chartConfig = {
  hard: {
    label: "Hard Runway",
    color: "var(--chart-hard-runway)",
    indicator: "line",
  },
  extended: {
    label: "Extended Runway",
    color: "var(--chart-extended-runway)",
    indicator: "dashed",
  },
} satisfies ChartConfig;

function yFormatter(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function tooltipFormatter(value: number): string {
  return value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${Math.round(value).toLocaleString()}`;
}

export default function ScenarioProjectionChart({
  className,
}: ScenarioProjectionChartProps) {
  const { model } = useRoughRunwayStore();
  const { projections: baselineProjections } = useProjection();

  const activeScenarios = model.scenarios.filter((s: Scenario) => s.isActive);

  const scenarioProjections = activeScenarios.map((scenario: Scenario) => {
    const projection = computeScenarioProjection(model, scenario);
    return {
      scenario,
      projections: projection.projections,
      summary: projection.summary,
    };
  });

  const chartData: ScenarioChartPoint[] = baselineProjections.map(
    (baseline, index) => {
      const point: ScenarioChartPoint = {
        month: baseline.label,
        hard: baseline.hardBalance,
        extended: baseline.extendedBalance,
      };

      scenarioProjections.forEach(({ scenario, projections }) => {
        const proj = projections[index];
        if (proj) {
          point[`scenario_${scenario.id}`] = proj.extendedBalance;
        }
      });

      return point;
    }
  );

  const isComparison = activeScenarios.length > 0;

  return (
    <div
      className={`bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6 ${className ?? ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-h3 text-foreground">
            {isComparison ? "Scenario Comparison" : "Runway Projection"}
          </h2>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-80">
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--chart-grid)"
            strokeOpacity={0.2}
          />
          <XAxis
            dataKey="month"
            stroke="var(--chart-grid)"
            strokeOpacity={0.4}
            tick={AXIS_TICK}
            tickLine={{ stroke: "var(--chart-grid)", strokeOpacity: 0.4 }}
          />
          <YAxis
            tickFormatter={yFormatter}
            stroke="var(--chart-grid)"
            strokeOpacity={0.4}
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10,
              fontFamily: "var(--font-jetbrains-mono)",
            }}
            tickLine={{ stroke: "var(--chart-grid)", strokeOpacity: 0.4 }}
            width={56}
          />
          <Tooltip
            content={
              <ChartTooltipContent formatter={tooltipFormatter} indicator="line" />
            }
            cursor={{
              stroke: "var(--chart-grid)",
              strokeOpacity: 0.5,
              strokeDasharray: "4 4",
            }}
          />

          {/* Extended runway area + line */}
          <Area
            type="monotone"
            dataKey="extended"
            name="Extended Runway"
            stroke="var(--chart-extended-runway)"
            strokeWidth={2}
            strokeDasharray="8 4"
            fill="var(--chart-extended-runway)"
            fillOpacity={0.15}
            isAnimationActive={false}
          />

          {/* Baseline hard runway */}
          <Line
            type="monotone"
            dataKey="hard"
            name="Hard Runway"
            stroke="var(--chart-hard-runway)"
            strokeWidth={2.5}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* Scenario lines */}
          {activeScenarios.map((scenario: Scenario) => (
            <Line
              key={scenario.id}
              type="monotone"
              dataKey={`scenario_${scenario.id}`}
              name={scenario.name}
              stroke={scenario.color}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 4, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ChartContainer>

      {/* Footer legend — matches ProjectionChart style */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-knob-silver/30 dark:border-knob-silver-dark/30 mt-3 pt-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-6 rounded-full"
            style={{ backgroundColor: "var(--chart-hard-runway)" }}
          />
          <span className="text-caption text-muted-foreground uppercase tracking-wide">
            Hard Runway
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="24"
              y2="2"
              stroke="var(--chart-extended-runway)"
              strokeWidth="2"
              strokeDasharray="8 4"
            />
          </svg>
          <span className="text-caption text-muted-foreground uppercase tracking-wide">
            Extended Runway
          </span>
        </div>
        {activeScenarios.map((s: Scenario) => (
          <div key={s.id} className="flex items-center gap-2">
            <svg width="24" height="4" aria-hidden="true">
              <line
                x1="0"
                y1="2"
                x2="24"
                y2="2"
                stroke={s.color}
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
            </svg>
            <span className="text-caption text-muted-foreground uppercase tracking-wide">
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Scenario summary cards (shown only when scenarios are active) */}
      {isComparison && (
        <div className="mt-6">
          <ScenarioSummaryCards />
        </div>
      )}
    </div>
  );
}
