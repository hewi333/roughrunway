"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { useRoughRunwayStore } from "@/lib/store";
import { useProjection } from "@/lib/hooks/useProjection";

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
      <Card className="border-l-4 border-l-swiss-red">
        <CardHeader className="flex flex-col space-y-1 pb-2">
          <CardPlacard>Baseline</CardPlacard>
          <span className="text-caption text-muted-foreground">Extended runway</span>
        </CardHeader>
        <CardContent>
          <div className="text-h2 font-mono font-bold text-foreground">
            {baselineSummary.extendedRunwayMonths !== null
              ? `${baselineSummary.extendedRunwayMonths} mo`
              : "18+ mo"}
          </div>
        </CardContent>
      </Card>

      {scenarioProjections.map(({ scenario, summary }) => (
        <Card
          key={scenario.id}
          style={{ borderLeftColor: scenario.color }}
          className="border-l-4"
        >
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>{scenario.name}</CardPlacard>
            <span className="text-caption text-muted-foreground">Extended runway</span>
          </CardHeader>
          <CardContent>
            <div
              className="text-h2 font-mono font-bold"
              style={{ color: scenario.color }}
            >
              {summary.extendedRunwayMonths !== null
                ? `${summary.extendedRunwayMonths} mo`
                : "18+ mo"}
            </div>
          </CardContent>
        </Card>
      ))}

      {activeScenarios.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <p className="text-body">No active scenarios. Activate a scenario to see its impact.</p>
        </div>
      )}
    </div>
  );
}
