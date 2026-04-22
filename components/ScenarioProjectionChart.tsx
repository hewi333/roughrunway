"use client";

import React from "react";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from "recharts";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { useRoughRunwayStore } from "@/lib/store";
import { useProjection } from "@/lib/hooks/useProjection";
import ScenarioSummaryCards from "@/components/ScenarioSummaryCards";

interface ScenarioProjectionChartProps {
  className?: string;
}

const AXIS_TICK = {
  fill: "hsl(var(--muted-foreground))",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-knob-silver dark:border-knob-silver-dark rounded-panel p-3 shadow-sm min-w-[180px]">
      <p className="text-placard uppercase text-muted-foreground mb-1">Month</p>
      <p className="text-body font-medium text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-body">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground">{entry.name}</span>
            </div>
            <span className="font-mono text-foreground">
              ${Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScenarioProjectionChart({ className }: ScenarioProjectionChartProps) {
  const { model } = useRoughRunwayStore();
  const { projections: baselineProjections } = useProjection();

  const activeScenarios = model.scenarios.filter((s) => s.isActive);

  const scenarioProjections = activeScenarios.map((scenario) => {
    const projection = computeScenarioProjection(model, scenario);
    return {
      scenario,
      projections: projection.projections,
      summary: projection.summary,
    };
  });

  const chartData = baselineProjections.map((baseline, index) => {
    const dataPoint: any = {
      month: baseline.label,
      hard: baseline.hardBalance,
      extended: baseline.extendedBalance,
    };

    scenarioProjections.forEach(({ scenario, projections }) => {
      if (projections[index]) {
        dataPoint[`scenario_${scenario.id}`] = projections[index].extendedBalance;
      }
    });

    return dataPoint;
  });

  const isComparison = activeScenarios.length > 0;

  return (
    <div
      className={`bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-placard uppercase text-muted-foreground">Instrument</div>
          <h2 className="text-h3 text-foreground">
            {isComparison ? "Scenario Comparison" : "Runway Projection"}
          </h2>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
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
              tickFormatter={(value) => `$${value / 1_000_000}M`}
              stroke="var(--chart-grid)"
              strokeOpacity={0.4}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
                fontFamily: "var(--font-jetbrains-mono)",
              }}
              tickLine={{ stroke: "var(--chart-grid)", strokeOpacity: 0.4 }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: "var(--chart-grid)",
                strokeOpacity: 0.5,
                strokeDasharray: "4 4",
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "hsl(var(--muted-foreground))",
              }}
            />
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
            {scenarioProjections.map(({ scenario }) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={`scenario_${scenario.id}`}
                name={scenario.name}
                stroke={scenario.color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {isComparison && (
        <div className="mt-6">
          <ScenarioSummaryCards />
        </div>
      )}
    </div>
  );
}
