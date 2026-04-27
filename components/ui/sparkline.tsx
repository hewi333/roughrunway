"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
  className?: string;
  fillOpacity?: number;
}

// Tremor-style sparkline: tiny area chart, no axes, no tooltip.
// Series renders as a smooth area so the eye reads trajectory and depletion at a glance.
export function Sparkline({
  data,
  color,
  height = 32,
  className,
  fillOpacity = 0.18,
}: SparklineProps) {
  const series = React.useMemo(
    () => data.map((value, index) => ({ index, value })),
    [data]
  );

  if (series.length < 2) {
    return <div style={{ height }} className={className} aria-hidden="true" />;
  }

  const gradientId = React.useId();

  return (
    <div style={{ height }} className={className} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
