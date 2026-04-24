"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ComposedChart,
} from "recharts";
import { useProjection } from "@/lib/hooks/useProjection";
import { useRoughRunwayStore } from "@/lib/store";
import { computeScenarioProjection } from "@/lib/projection-engine";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scenario, VolatileAsset, VolatileAssetTier } from "@/lib/types";

// ─── Color palette ────────────────────────────────────────────────────────────

const TIER_COLOR: Record<VolatileAssetTier, string> = {
  major: "#D4A574",  // knob-gold
  native: "#9B6B9B", // muted purple — distinct from red/gold
  alt: "#B8B8B8",    // knob-silver
};

const STABLECOINS_COLOR = "#2E7D32"; // aviation-green
const FIAT_COLOR = "#6FA3D4";        // sky-blue
const HARD_COLOR = "#DC2626";        // swiss-red
const EXTENDED_COLOR = "#5B9BD5";    // sky-blue-dark

const AXIS_STYLE = {
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  showAreas?: boolean;
}

function ChartTooltip({ active, payload, label, showAreas }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const isAreaKey = (key: string) =>
    key === "stablecoins" || key === "fiat" || key.startsWith("asset_");
  const isScenarioKey = (key: string) => key.startsWith("scenario_");

  const lineEntries = payload.filter(
    (e) => !isAreaKey(e.dataKey) && !isScenarioKey(e.dataKey)
  );
  const scenarioEntries = payload.filter((e) => isScenarioKey(e.dataKey));
  const areaEntries = payload.filter((e) => isAreaKey(e.dataKey) && e.value > 0);

  const fmt = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(2)}M`
      : `$${Math.round(v).toLocaleString()}`;

  return (
    <div className="bg-card border border-knob-silver dark:border-knob-silver-dark rounded-panel p-3 shadow-sm min-w-[200px]">
      <p className="text-placard uppercase text-muted-foreground mb-2">{label}</p>

      {lineEntries.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-body mb-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.name}</span>
          </div>
          <span className="font-mono text-foreground">{fmt(entry.value)}</span>
        </div>
      ))}

      {scenarioEntries.length > 0 && (
        <>
          <div className="border-t border-knob-silver/30 dark:border-knob-silver-dark/30 my-2" />
          <p className="text-placard uppercase text-muted-foreground mb-1">Scenarios</p>
          {scenarioEntries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-body mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-5 rounded-sm"
                  style={{
                    backgroundColor: entry.color,
                    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, ${entry.color} 3px, ${entry.color} 4px)`,
                  }}
                />
                <span className="text-foreground">{entry.name}</span>
              </div>
              <span className="font-mono text-foreground">{fmt(entry.value)}</span>
            </div>
          ))}
        </>
      )}

      {showAreas && areaEntries.length > 0 && (
        <>
          <div className="border-t border-knob-silver/30 dark:border-knob-silver-dark/30 my-2" />
          <p className="text-placard uppercase text-muted-foreground mb-1">Composition</p>
          {areaEntries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-body mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono text-muted-foreground">{fmt(entry.value)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Composition legend chips ─────────────────────────────────────────────────

interface CompositionLegendProps {
  stablecoinsColor: string;
  fiatColor: string;
  assets: { id: string; name: string; color: string }[];
}

function CompositionLegend({ stablecoinsColor, fiatColor, assets }: CompositionLegendProps) {
  const chips = [
    { color: stablecoinsColor, label: "Stablecoins" },
    { color: fiatColor, label: "Fiat" },
    ...assets.map((a) => ({ color: a.color, label: a.name })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
      {chips.map((chip, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: chip.color, opacity: 0.6 }}
          />
          <span className="text-placard uppercase text-muted-foreground">{chip.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main chart ───────────────────────────────────────────────────────────────

interface ProjectionChartProps {
  compact?: boolean;
  onToggleCompact?: () => void;
}

export default function ProjectionChart({ compact = false, onToggleCompact }: ProjectionChartProps = {}) {
  const [showAreas, setShowAreas] = useState(true);
  const { projections } = useProjection();
  const { model } = useRoughRunwayStore();

  // Asset metadata indexed by ID
  const assetMeta = useMemo(() => {
    const map = new Map<string, { name: string; ticker: string; color: string }>();
    for (const asset of model.treasury.volatileAssets) {
      map.set(asset.id, {
        name: asset.name,
        ticker: asset.ticker,
        color: TIER_COLOR[asset.tier as VolatileAssetTier] ?? TIER_COLOR.alt,
      });
    }
    return map;
  }, [model.treasury.volatileAssets]);

  // Volatile assets ordered by liquidation priority (lowest priority number = liquidated first)
  const orderedAssets = useMemo(
    () =>
      [...model.treasury.volatileAssets].sort(
        (a, b) => a.liquidationPriority - b.liquidationPriority
      ),
    [model.treasury.volatileAssets]
  );

  // Active scenarios + their projections
  const activeScenarios = useMemo(
    () => model.scenarios.filter((s: Scenario) => s.isActive),
    [model.scenarios]
  );

  const scenarioData = useMemo(
    () =>
      activeScenarios.map((scenario: Scenario) => ({
        scenario,
        projections: computeScenarioProjection(model, scenario).projections,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model]
  );

  // Build flat chart data
  const chartData = useMemo(() => {
    return projections.map((proj, i) => {
      const point: Record<string, number | string> = {
        month: proj.label,
        stablecoins: proj.stablecoinBalance,
        fiat: proj.fiatBalance,
        hard: proj.hardBalance,
        extended: proj.extendedBalance,
      };

      for (const va of proj.volatileAssets) {
        point[`asset_${va.assetId}`] = va.valueAtHaircut;
      }

      for (const { scenario, projections: scenProjs } of scenarioData) {
        point[`scenario_${scenario.id}`] = scenProjs[i]?.extendedBalance ?? 0;
      }

      return point;
    });
  }, [projections, scenarioData]);

  const yFormatter = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div
      className={cn(
        "bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark",
        compact ? "p-4" : "p-6"
      )}
      data-action="projection-chart"
    >
      {/* Header */}
      <div className={cn("flex items-start justify-between gap-4", compact ? "mb-2" : "mb-4")}>
        <div className="flex-1 min-w-0">
          <div className="text-placard uppercase text-muted-foreground">Instrument</div>
          <h2 className="text-h3 text-foreground">Runway Projection</h2>
          {showAreas && !compact && (
            <CompositionLegend
              stablecoinsColor={STABLECOINS_COLOR}
              fiatColor={FIAT_COLOR}
              assets={orderedAssets.map((a: VolatileAsset) => ({
                id: a.id,
                name: assetMeta.get(a.id)?.ticker ?? a.ticker,
                color: assetMeta.get(a.id)?.color ?? TIER_COLOR.alt,
              }))}
            />
          )}
        </div>

        {/* Controls */}
        <div
          className="flex items-center gap-3 shrink-0"
          data-action="projection-controls"
        >
          <div className="flex items-center gap-2">
            <Label
              htmlFor="areas-toggle"
              className="text-caption text-muted-foreground uppercase tracking-wide cursor-pointer"
            >
              Composition
            </Label>
            <Switch
              id="areas-toggle"
              checked={showAreas}
              onCheckedChange={setShowAreas}
              aria-label="Toggle treasury composition areas"
            />
          </div>
          {onToggleCompact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCompact}
              className="h-8 w-8 p-0"
              aria-label={compact ? "Expand runway chart" : "Compact runway chart"}
              title={compact ? "Expand chart" : "Compact chart"}
            >
              {compact ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className={compact ? "h-40" : "h-80"}>
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
              tick={{ fill: "hsl(var(--muted-foreground))", ...AXIS_STYLE }}
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
              content={<ChartTooltip showAreas={showAreas} />}
              cursor={{
                stroke: "var(--chart-grid)",
                strokeOpacity: 0.5,
                strokeDasharray: "4 4",
              }}
            />

            {/* ── Stacked composition areas (rendered first, behind lines) ── */}
            {showAreas && (
              <>
                <Area
                  type="monotone"
                  dataKey="stablecoins"
                  name="Stablecoins"
                  stackId="treasury"
                  fill={STABLECOINS_COLOR}
                  fillOpacity={0.25}
                  stroke={STABLECOINS_COLOR}
                  strokeWidth={0.5}
                  strokeOpacity={0.4}
                  legendType="none"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="fiat"
                  name="Fiat"
                  stackId="treasury"
                  fill={FIAT_COLOR}
                  fillOpacity={0.25}
                  stroke={FIAT_COLOR}
                  strokeWidth={0.5}
                  strokeOpacity={0.4}
                  legendType="none"
                  isAnimationActive={false}
                />
                {orderedAssets.map((asset: VolatileAsset) => {
                  const meta = assetMeta.get(asset.id);
                  if (!meta) return null;
                  return (
                    <Area
                      key={asset.id}
                      type="monotone"
                      dataKey={`asset_${asset.id}`}
                      name={meta.ticker}
                      stackId="treasury"
                      fill={meta.color}
                      fillOpacity={0.25}
                      stroke={meta.color}
                      strokeWidth={0.5}
                      strokeOpacity={0.4}
                      legendType="none"
                      isAnimationActive={false}
                    />
                  );
                })}
              </>
            )}

            {/* ── Scenario lines ── */}
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

            {/* ── Extended runway (dashed) ── */}
            <Line
              type="monotone"
              dataKey="extended"
              name="Extended Runway"
              stroke={EXTENDED_COLOR}
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              isAnimationActive={false}
            />

            {/* ── Hard runway (solid, topmost) ── */}
            <Line
              type="monotone"
              dataKey="hard"
              name="Hard Runway"
              stroke={HARD_COLOR}
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={false}
              activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Runway line legend */}
      <div className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-knob-silver/30 dark:border-knob-silver-dark/30",
        compact ? "mt-2 pt-2" : "mt-3 pt-3"
      )}>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-0.5 w-6 rounded-full"
            style={{ backgroundColor: HARD_COLOR }}
          />
          <span className="text-caption text-muted-foreground uppercase tracking-wide">
            Hard Runway
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="4" aria-hidden="true">
            <line
              x1="0" y1="2" x2="24" y2="2"
              stroke={EXTENDED_COLOR}
              strokeWidth="2"
              strokeDasharray="6 3"
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
                x1="0" y1="2" x2="24" y2="2"
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
    </div>
  );
}
