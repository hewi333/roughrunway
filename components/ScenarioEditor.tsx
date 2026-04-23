"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRoughRunwayStore } from "@/lib/store";
import type {
  Scenario,
  ScenarioOverrides,
  PriceOverride,
  BurnOverride,
  InflowOverride,
  LiquidityOverride,
  OneOffEvent,
  VolatileAsset,
} from "@/lib/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${n.toLocaleString()}`;
  return `$${n}`;
}

function SectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between py-3 border-b border-knob-silver/40 dark:border-knob-silver-dark/40 text-left"
      onClick={onToggle}
    >
      <span className="text-body font-semibold text-foreground">{title}</span>
      {open ? (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

// ─── section: price overrides ─────────────────────────────────────────────────

function PriceSection({
  overrides,
  onChange,
}: {
  overrides: ScenarioOverrides;
  onChange: (o: ScenarioOverrides) => void;
}) {
  const { model } = useRoughRunwayStore();
  const [open, setOpen] = useState(true);

  const getPriceOverride = (assetId: string): PriceOverride | undefined =>
    overrides.priceOverrides?.find((p) => p.assetId === assetId);

  const setPriceOverride = (assetId: string, value: string) => {
    const num = parseFloat(value);
    const existing = overrides.priceOverrides ?? [];
    const filtered = existing.filter((p) => p.assetId !== assetId);
    if (!isNaN(num) && value !== "" && value !== "-") {
      onChange({
        ...overrides,
        priceOverrides: [
          ...filtered,
          { assetId, type: "percent_change", value: num / 100 },
        ],
      });
    } else {
      onChange({ ...overrides, priceOverrides: filtered });
    }
  };

  const displayPct = (assetId: string): string => {
    const ov = getPriceOverride(assetId);
    if (!ov) return "";
    return ov.type === "percent_change"
      ? String(Math.round(ov.value * 100))
      : String(ov.value);
  };

  return (
    <div>
      <SectionHeader title="Price Overrides" open={open} onToggle={() => setOpen(!open)} />
      {open && (
        <div className="py-4 space-y-3">
          {model.treasury.volatileAssets.length === 0 && (
            <p className="text-caption text-muted-foreground">No volatile assets in treasury.</p>
          )}
          {model.treasury.volatileAssets.map((asset: VolatileAsset) => (
            <div key={asset.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-foreground">
                  {asset.name}{" "}
                  <span className="text-muted-foreground font-mono text-caption">
                    ({asset.ticker})
                  </span>
                </p>
                <p className="text-caption text-muted-foreground">
                  Current: {fmt(asset.currentPrice)} / token
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Input
                  type="number"
                  className="w-24 h-8 text-body font-mono text-right"
                  placeholder="0"
                  value={displayPct(asset.id)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPriceOverride(asset.id, e.target.value)
                  }
                />
                <span className="text-caption text-muted-foreground w-4">%</span>
              </div>
            </div>
          ))}
          <p className="text-caption text-muted-foreground mt-2">
            Enter a percentage change, e.g. <span className="font-mono">−50</span> for half price,{" "}
            <span className="font-mono">+20</span> for 20% premium.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── section: liquidity overrides ─────────────────────────────────────────────

function LiquiditySection({
  overrides,
  onChange,
}: {
  overrides: ScenarioOverrides;
  onChange: (o: ScenarioOverrides) => void;
}) {
  const { model } = useRoughRunwayStore();
  const [open, setOpen] = useState(false);

  const getLiq = (assetId: string): LiquidityOverride | undefined =>
    overrides.liquidityOverrides?.find((l) => l.assetId === assetId);

  const setHaircut = (assetId: string, value: string) => {
    const num = parseFloat(value);
    const existing = overrides.liquidityOverrides ?? [];
    const prev = getLiq(assetId) ?? { assetId };
    const filtered = existing.filter((l) => l.assetId !== assetId);
    if (!isNaN(num) && value !== "") {
      onChange({
        ...overrides,
        liquidityOverrides: [...filtered, { ...prev, haircutPercent: Math.min(Math.max(num, 0), 99) }],
      });
    } else {
      const { haircutPercent: _, ...rest } = prev as LiquidityOverride & { haircutPercent?: number };
      if (Object.keys(rest).length > 1) {
        onChange({ ...overrides, liquidityOverrides: [...filtered, rest as LiquidityOverride] });
      } else {
        onChange({ ...overrides, liquidityOverrides: filtered });
      }
    }
  };

  return (
    <div>
      <SectionHeader
        title="Liquidity Overrides"
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div className="py-4 space-y-3">
          {model.treasury.volatileAssets.length === 0 && (
            <p className="text-caption text-muted-foreground">No volatile assets in treasury.</p>
          )}
          {model.treasury.volatileAssets.map((asset: VolatileAsset) => {
            const current = getLiq(asset.id);
            return (
              <div key={asset.id} className="space-y-1">
                <p className="text-body font-medium text-foreground">
                  {asset.name}{" "}
                  <span className="text-muted-foreground font-mono text-caption">
                    ({asset.ticker})
                  </span>
                </p>
                <div className="flex items-center gap-3 pl-2">
                  <Label className="text-caption text-muted-foreground w-28">
                    Haircut override %
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={99}
                      className="w-20 h-8 text-body font-mono text-right"
                      placeholder={String(asset.liquidity.haircutPercent)}
                      value={current?.haircutPercent ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setHaircut(asset.id, e.target.value)
                      }
                    />
                    <span className="text-caption text-muted-foreground">%</span>
                  </div>
                  <span className="text-caption text-muted-foreground">
                    (baseline: {asset.liquidity.haircutPercent}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── section: burn overrides ─────────────────────────────────────────────────

type OverrideType = "none" | "percent_change" | "absolute" | "disable";

function BurnInflowSection({
  title,
  categories,
  overrideList,
  onChangeList,
}: {
  title: string;
  categories: { id: string; name: string; monthlyBaseline: number; isActive: boolean }[];
  overrideList: Array<{ categoryId: string; type: string; value?: number }>;
  onChangeList: (list: Array<{ categoryId: string; type: string; value?: number }>) => void;
}) {
  const [open, setOpen] = useState(false);

  const getOv = (catId: string) => overrideList.find((o) => o.categoryId === catId);

  const setOv = (
    catId: string,
    type: OverrideType,
    value?: number
  ) => {
    const filtered = overrideList.filter((o) => o.categoryId !== catId);
    if (type === "none") {
      onChangeList(filtered);
    } else if (type === "disable") {
      onChangeList([...filtered, { categoryId: catId, type: "disable" }]);
    } else {
      onChangeList([...filtered, { categoryId: catId, type, value: value ?? 0 }]);
    }
  };

  return (
    <div>
      <SectionHeader title={title} open={open} onToggle={() => setOpen(!open)} />
      {open && (
        <div className="py-4 space-y-3">
          {categories.filter((c) => c.isActive).map((cat) => {
            const ov = getOv(cat.id);
            const ovType: OverrideType = ov
              ? (ov.type as OverrideType)
              : "none";
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-body font-medium text-foreground">{cat.name}</p>
                  <p className="text-caption text-muted-foreground font-mono">
                    {fmt(cat.monthlyBaseline)}/mo
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-2">
                  <select
                    value={ovType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOv(cat.id, e.target.value as OverrideType)}
                    className="rounded-precise border border-input bg-background py-1 px-2 text-caption focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="none">No change</option>
                    <option value="percent_change">% change</option>
                    <option value="absolute">Set absolute</option>
                    <option value="disable">Disable</option>
                  </select>
                  {(ovType === "percent_change" || ovType === "absolute") && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        className="w-24 h-8 text-body font-mono text-right"
                        placeholder={ovType === "percent_change" ? "0" : fmt(cat.monthlyBaseline)}
                        value={ov?.value !== undefined ? (ovType === "percent_change" ? Math.round((ov.value ?? 0) * 100) : ov.value) : ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const raw = parseFloat(e.target.value);
                          setOv(
                            cat.id,
                            ovType,
                            isNaN(raw) ? 0 : ovType === "percent_change" ? raw / 100 : raw
                          );
                        }}
                      />
                      <span className="text-caption text-muted-foreground">
                        {ovType === "percent_change" ? "%" : "USD"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── section: headcount ───────────────────────────────────────────────────────

function HeadcountSection({
  overrides,
  onChange,
}: {
  overrides: ScenarioOverrides;
  onChange: (o: ScenarioOverrides) => void;
}) {
  const [open, setOpen] = useState(false);
  const hc = overrides.headcountChange;

  const set = (field: "count" | "costPerHead" | "startMonth", raw: string) => {
    const num = parseInt(raw, 10);
    const current = hc ?? { count: 0, costPerHead: 10000, startMonth: 1 };
    onChange({
      ...overrides,
      headcountChange: { ...current, [field]: isNaN(num) ? 0 : num },
    });
  };

  const clear = () => {
    const { headcountChange: _, ...rest } = overrides;
    onChange(rest);
  };

  return (
    <div>
      <SectionHeader
        title="Headcount Change"
        open={open}
        onToggle={() => setOpen(!open)}
      />
      {open && (
        <div className="py-4 space-y-3">
          <p className="text-caption text-muted-foreground">
            Model a hiring surge or layoff. Positive count = hire, negative = cut.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-caption text-muted-foreground">Headcount Δ</Label>
              <Input
                type="number"
                className="mt-1 h-8 font-mono text-right"
                placeholder="0"
                value={hc?.count ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set("count", e.target.value)
                }
              />
            </div>
            <div>
              <Label className="text-caption text-muted-foreground">Cost/head/mo</Label>
              <Input
                type="number"
                min={0}
                className="mt-1 h-8 font-mono text-right"
                placeholder="10000"
                value={hc?.costPerHead ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set("costPerHead", e.target.value)
                }
              />
            </div>
            <div>
              <Label className="text-caption text-muted-foreground">Start month</Label>
              <Input
                type="number"
                min={1}
                className="mt-1 h-8 font-mono text-right"
                placeholder="1"
                value={hc?.startMonth ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set("startMonth", e.target.value)
                }
              />
            </div>
          </div>
          {hc && (
            <button
              type="button"
              className="text-caption text-muted-foreground underline hover:text-foreground"
              onClick={clear}
            >
              Clear headcount change
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── section: one-off events ─────────────────────────────────────────────────

function OneOffSection({
  title,
  events,
  onChangeEvents,
}: {
  title: string;
  events: OneOffEvent[];
  onChangeEvents: (events: OneOffEvent[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const add = () =>
    onChangeEvents([...events, { month: 1, amount: 0, description: "" }]);

  const update = (i: number, field: keyof OneOffEvent, raw: string) => {
    const updated = events.map((ev, idx) => {
      if (idx !== i) return ev;
      if (field === "description") return { ...ev, description: raw };
      const num = parseFloat(raw);
      return { ...ev, [field]: isNaN(num) ? 0 : num };
    });
    onChangeEvents(updated);
  };

  const remove = (i: number) =>
    onChangeEvents(events.filter((_, idx) => idx !== i));

  return (
    <div>
      <SectionHeader title={title} open={open} onToggle={() => setOpen(!open)} />
      {open && (
        <div className="py-4 space-y-3">
          {events.map((ev, i) => (
            <div
              key={i}
              className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-end"
            >
              <div>
                <Label className="text-caption text-muted-foreground">Month</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1 h-8 w-16 font-mono text-right"
                  value={ev.month || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update(i, "month", e.target.value)
                  }
                />
              </div>
              <div>
                <Label className="text-caption text-muted-foreground">Amount (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1 h-8 font-mono text-right"
                  value={ev.amount || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update(i, "amount", e.target.value)
                  }
                />
              </div>
              <div>
                <Label className="text-caption text-muted-foreground">Description</Label>
                <Input
                  className="mt-1 h-8"
                  placeholder="e.g. Legal settlement"
                  value={ev.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update(i, "description", e.target.value)
                  }
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 mt-5 text-destructive hover:text-destructive"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={add} className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            Add Event
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── main editor ─────────────────────────────────────────────────────────────

interface ScenarioEditorProps {
  scenario: Scenario;
  onClose: () => void;
}

export default function ScenarioEditor({ scenario, onClose }: ScenarioEditorProps) {
  const { model, updateModel } = useRoughRunwayStore();
  const [overrides, setOverrides] = useState<ScenarioOverrides>(
    structuredClone(scenario.overrides)
  );

  const save = () => {
    const updated = model.scenarios.map((s: Scenario) =>
      s.id === scenario.id ? { ...s, overrides } : s
    );
    updateModel({ scenarios: updated });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-knob-silver dark:border-knob-silver-dark shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit scenario: ${scenario.name}`}
        data-action="scenario-editor"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-knob-silver/40 dark:border-knob-silver-dark/40 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-knob inline-block"
              style={{ backgroundColor: scenario.color }}
            />
            <div>
              <p className="text-placard uppercase text-muted-foreground">Edit Scenario</p>
              <h2 className="text-h3 text-foreground">{scenario.name}</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
          <PriceSection overrides={overrides} onChange={setOverrides} />
          <LiquiditySection overrides={overrides} onChange={setOverrides} />
          <BurnInflowSection
            title="Burn Overrides"
            categories={model.burnCategories}
            overrideList={overrides.burnOverrides ?? []}
            onChangeList={(list) =>
              setOverrides({ ...overrides, burnOverrides: list as BurnOverride[] })
            }
          />
          <BurnInflowSection
            title="Inflow Overrides"
            categories={model.inflowCategories}
            overrideList={overrides.inflowOverrides ?? []}
            onChangeList={(list) =>
              setOverrides({ ...overrides, inflowOverrides: list as InflowOverride[] })
            }
          />
          <HeadcountSection overrides={overrides} onChange={setOverrides} />
          <OneOffSection
            title="One-off Burn Events"
            events={overrides.additionalBurnEvents ?? []}
            onChangeEvents={(evs) =>
              setOverrides({ ...overrides, additionalBurnEvents: evs })
            }
          />
          <OneOffSection
            title="One-off Inflow Events"
            events={overrides.additionalInflowEvents ?? []}
            onChangeEvents={(evs) =>
              setOverrides({ ...overrides, additionalInflowEvents: evs })
            }
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-knob-silver/40 dark:border-knob-silver-dark/40 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Apply Overrides</Button>
        </div>
      </div>
    </>
  );
}
