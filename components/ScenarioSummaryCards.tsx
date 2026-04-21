"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { useRoughRunwayStore } from "@/lib/store";
import { useProjection } from "@/lib/hooks/useProjection";

export default function ScenarioSummaryCards() {
  const { model } = useRoughRunwayStore();
  const { summary: baselineSummary } = useProjection();
  
  // Get active scenarios
  const activeScenarios = model.scenarios.filter(s => s.isActive);
  
  // Compute scenario projections
  const scenarioProjections = activeScenarios.map(scenario => {
    const projection = computeScenarioProjection(model, scenario);
    return {
      scenario,
      summary: projection.summary
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-2 border-teal-500 bg-white dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Baseline</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {baselineSummary.extendedRunwayMonths !== null 
              ? `${baselineSummary.extendedRunwayMonths} months` 
              : "18+ months"}
          </div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Extended runway
          </p>
        </CardContent>
      </Card>
      
      {scenarioProjections.map(({ scenario, summary }) => (
        <Card 
          key={scenario.id} 
          style={{ borderLeftColor: scenario.color }}
          className="border-l-4 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle 
              className="text-sm font-medium" 
              style={{ color: scenario.color }}
            >
              {scenario.name}
            </CardTitle>
            <div 
              className="h-4 w-4 rounded-full" 
              style={{ backgroundColor: scenario.color }}
            />
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold" 
              style={{ color: scenario.color }}
            >
              {summary.extendedRunwayMonths !== null 
                ? `${summary.extendedRunwayMonths} months` 
                : "18+ months"}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Extended runway
            </p>
          </CardContent>
        </Card>
      ))}
      
      {activeScenarios.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No active scenarios. Activate a scenario to see its impact.</p>
        </div>
      )}
    </div>
  );
}