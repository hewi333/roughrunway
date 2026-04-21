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

export default function ProjectionChart() {
  // TODO: Replace with actual projection data from the store
  const data = [
    { month: "May 2026", hard: 2000000, extended: 3500000 },
    { month: "Jun 2026", hard: 1800000, extended: 3200000 },
    { month: "Jul 2026", hard: 1600000, extended: 2900000 },
    { month: "Aug 2026", hard: 1400000, extended: 2600000 },
    { month: "Sep 2026", hard: 1200000, extended: 2300000 },
    { month: "Oct 2026", hard: 1000000, extended: 2000000 },
    { month: "Nov 2026", hard: 800000, extended: 1700000 },
    { month: "Dec 2026", hard: 600000, extended: 1400000 },
    { month: "Jan 2027", hard: 400000, extended: 1100000 },
    { month: "Feb 2027", hard: 200000, extended: 800000 },
    { month: "Mar 2027", hard: 0, extended: 500000 },
    { month: "Apr 2027", hard: 0, extended: 200000 },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Runway Projection</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
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