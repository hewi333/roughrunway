"use client";

import React from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area,
  ComposedChart
} from "recharts";
import { useProjection } from "@/lib/hooks/useProjection";

export default function ProjectionChart() {
  const { projections } = useProjection();
  
  // Transform projection data for the chart
  const chartData = projections.map(projection => ({
    month: projection.label,
    hard: projection.hardBalance,
    extended: projection.extendedBalance,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Runway Projection</h2>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `$${value / 1000000}M`}
            />
            <Tooltip 
              formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="extended" 
              name="Extended Runway" 
              stackId="1" 
              stroke="#14B8A6" 
              fill="#14B8A6" 
              fillOpacity={0.6}
            />
            <Line 
              type="monotone" 
              dataKey="hard" 
              name="Hard Runway" 
              stroke="#EC4899" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}