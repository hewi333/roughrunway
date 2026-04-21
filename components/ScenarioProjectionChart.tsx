"use client";

import React from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area,
  ComposedChart
} from "recharts";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { useRoughRunwayStore } from "@/lib/store";
import { useProjection } from "@/lib/hooks/useProjection";
import ScenarioSummaryCards from "@/components/ScenarioSummaryCards";

interface ScenarioProjectionChartProps {
  className?: string;
}

export default function ScenarioProjectionChart({ className }: ScenarioProjectionChartProps) {
  const { model } = useRoughRunwayStore();
  const { projections: baselineProjections } = useProjection();
  
  // Get active scenarios
  const activeScenarios = model.scenarios.filter(s => s.isActive);
  
  // Compute scenario projections
  const scenarioProjections = activeScenarios.map(scenario => {
    const projection = computeScenarioProjection(model, scenario);
    return {
      scenario,
      projections: projection.projections,
      summary: projection.summary
    };
  });
  
  // Transform data for the chart
  const chartData = baselineProjections.map((baseline, index) => {
    const dataPoint: any = {
      month: baseline.label,
      baseline: baseline.extendedBalance,
    };
    
    // Add scenario data
    scenarioProjections.forEach(({ scenario, projections }) => {
      if (projections[index]) {
        dataPoint[`scenario_${scenario.id}`] = projections[index].extendedBalance;
      }
    });
    
    return dataPoint;
  });
  
  // Create lines for the chart
  const lines = [
    {
      key: "baseline",
      name: "Baseline",
      color: "#14B8A6",
      stroke: "#14B8A6",
      fill: "#14B8A6"
    },
    ...scenarioProjections.map(({ scenario }) => ({
      key: `scenario_${scenario.id}`,
      name: scenario.name,
      color: scenario.color,
      stroke: scenario.color,
      fill: scenario.color
    }))
  ];

  // Custom tooltip component for dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow">
          <p className="font-medium text-gray-900 dark:text-gray-100">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-900 dark:text-gray-100">
              <span style={{ color: entry.color }}>{entry.name}</span>: $
              {Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">
        {activeScenarios.length > 0 ? "Scenario Comparison" : "Runway Projection"}
      </h2>
      
      {activeScenarios.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                tick={{ fill: "#6b7280" }} 
              />
              <YAxis 
                tickFormatter={(value) => `$${value / 1000000}M`}
                stroke="#6b7280" 
                tick={{ fill: "#6b7280" }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="baseline" 
                name="Baseline" 
                stackId="1" 
                stroke="#14B8A6" 
                fill="#14B8A6" 
                fillOpacity={0.6}
              />
              {scenarioProjections.map(({ scenario }) => (
                <Line 
                  key={scenario.id}
                  type="monotone" 
                  dataKey={`scenario_${scenario.id}`} 
                  name={scenario.name} 
                  stroke={scenario.color} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                tick={{ fill: "#6b7280" }} 
              />
              <YAxis 
                tickFormatter={(value) => `$${value / 1000000}M`}
                stroke="#6b7280" 
                tick={{ fill: "#6b7280" }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="baseline" 
                name="Extended Runway" 
                stackId="1" 
                stroke="#14B8A6" 
                fill="#14B8A6" 
                fillOpacity={0.6}
              />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                name="Hard Runway" 
                stroke="#EC4899" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {activeScenarios.length > 0 && (
        <div className="mt-6">
          <ScenarioSummaryCards />
        </div>
      )}
    </div>
  );
}