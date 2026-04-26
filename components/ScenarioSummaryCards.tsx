"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { useRoughRunwayStore } from "@/lib/store";
import { useProjection } from "@/lib/hooks/useProjection";
import { cn } from "@/lib/utils";

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const sign = delta > 0 ? "+" : "";
  const colorClass =
    delta > 0
      ? "bg-aviation-green/10 text-aviation-green dark:bg-aviation-green-dark/10 dark:text-aviation-green-dark"
      : delta < 0
        ? "bg-swiss-red/10 text-swiss-red dark:bg-aviation-red-dark/10 dark:text-aviation-red-dark"
        : "bg-knob-silver/10 text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-knob px-2 py-0.5 font-mono text-placard tabular-nums",
        colorClass
      )}
    >
      {sign}{delta} mo
    </span>
  );
}

export default function ScenarioSummaryCards() {
  const { model } = useRoughRunwayStore();
  const { summary: baselineSummary } = useProjection();

  const activeScenarios = model.scenarios.filter((s) => s.isActive);

  const scenarioProjections = activeScenarios.map((scenario) => {
    const projection = computeScenarioProjection(model, scenario);
    return {
      scenario,
      summary: projection.summary,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Baseline card */}
      <Card className="border-l-4 border-l-swiss-red">
        <CardHeader className="flex flex-col space-y-1 pb-2">
          <CardPlacard>Baseline</CardPlacard>
          <span className="text-caption text-muted-foreground">Extended runway</span>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-2">
          <div className="text-h2 font-mono font-bold text-foreground">
            {baselineSummary.extendedRunwayMonths !== null
              ? `${baselineSummary.extendedRunwayMonths} mo`
              : "18+ mo"}
          </div>
        </CardContent>
      </Card>

      {scenarioProjections.map(({ scenario, summary }) => {
        const baseMonths = baselineSummary.extendedRunwayMonths;
        const scenarioMonths = summary.extendedRunwayMonths;
        const delta =
          baseMonths !== null && scenarioMonths !== null
            ? scenarioMonths - baseMonths
            : null;

        return (
          <Card
            key={scenario.id}
            style={{ borderLeftColor: scenario.color }}
            className="border-l-4"
          >
            <CardHeader className="flex flex-col space-y-1 pb-2">
              <CardPlacard>{scenario.name}</CardPlacard>
              <span className="text-caption text-muted-foreground">Extended runway</span>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-2">
              <div
                className="text-h2 font-mono font-bold"
                style={{ color: scenario.color }}
              >
                {scenarioMonths !== null ? `${scenarioMonths} mo` : "18+ mo"}
              </div>
              <DeltaBadge delta={delta} />
            </CardContent>
          </Card>
        );
      })}

      {activeScenarios.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <p className="text-body">No active scenarios. Activate a scenario to see its impact.</p>
        </div>
      )}
    </div>
  );
}
