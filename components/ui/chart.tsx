"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
    icon?: React.ComponentType;
    indicator?: "line" | "dot" | "dashed";
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within <ChartContainer>");
  return context;
}

// ── ChartContainer ────────────────────────────────────────────────────────────
//
// Replaces the div + ResponsiveContainer pattern. Injects `--color-<key>` CSS
// variables from the config so child components can reference colours without
// hardcoding hex values. Height is set via className (e.g. "h-80").

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children: React.ReactElement;
  }
>(({ className, children, config, style, ...props }, ref) => {
  const cssVars = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, val]) => {
      if (val.color) acc[`--color-${key}`] = val.color;
      return acc;
    },
    {}
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("w-full", className)}
        style={{ ...cssVars, ...style } as React.CSSProperties}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

// ── ChartTooltip ──────────────────────────────────────────────────────────────

const ChartTooltip = RechartsPrimitive.Tooltip;

interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  value: number;
  color?: string;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, name: string) => string;
  hideLabel?: boolean;
  indicator?: "line" | "dot" | "dashed";
  className?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      formatter,
      hideLabel = false,
      indicator = "dot",
      className,
    },
    ref
  ) => {
    const { config } = useChart();
    if (!active || !payload?.length) return null;

    const fmt = (value: number, name: string) =>
      formatter ? formatter(value, name) : value.toLocaleString();

    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border border-knob-silver dark:border-knob-silver-dark rounded-panel p-3 shadow-sm min-w-[180px]",
          className
        )}
      >
        {!hideLabel && label && (
          <p className="text-placard uppercase text-muted-foreground mb-2">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {payload.map((entry, i) => {
            const configEntry = config[entry.dataKey];
            const displayName = configEntry?.label ?? entry.name;
            const color = entry.color ?? configEntry?.color;
            const style = configEntry?.indicator ?? indicator;

            return (
              <div
                key={i}
                className="flex items-center justify-between gap-4 text-body"
              >
                <div className="flex items-center gap-2">
                  {style === "dot" && (
                    <span
                      className="inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {style === "line" && (
                    <span
                      className="inline-block h-0.5 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {style === "dashed" && (
                    <svg
                      width="16"
                      height="4"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <line
                        x1="0"
                        y1="2"
                        x2="16"
                        y2="2"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    </svg>
                  )}
                  <span className="text-foreground">{displayName}</span>
                </div>
                <span className="font-mono text-foreground tabular-nums">
                  {fmt(entry.value, entry.name)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// ── Exports ───────────────────────────────────────────────────────────────────

export { ChartContainer, ChartTooltip, ChartTooltipContent };
