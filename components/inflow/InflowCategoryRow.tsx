"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { InflowCategory, InflowDenomination } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import AdjustmentRow from "@/components/inflow/AdjustmentRow";

interface InflowCategoryRowProps {
  category: InflowCategory;
}

export default function InflowCategoryRow({ category }: InflowCategoryRowProps) {
  const { model, updateModel } = useRoughRunwayStore();
  const { inflowCategories, treasury } = model;
  const [isExpanded, setIsExpanded] = useState(false);

  const denomination: InflowDenomination = category.denomination ?? "fiat";
  const linkedAsset = treasury.volatileAssets.find(
    (a) => a.id === category.tokenAssetId
  );

  const updateCategory = (updates: Partial<InflowCategory>) => {
    const updatedCategories = inflowCategories.map((c) =>
      c.id === category.id ? { ...c, ...updates } : c
    );
    updateModel({ inflowCategories: updatedCategories });
  };

  const deleteCategory = () => {
    const updatedCategories = inflowCategories.filter((c) => c.id !== category.id);
    updateModel({ inflowCategories: updatedCategories });
  };

  const addAdjustment = () => {
    const newAdjustment = {
      id: uuidv4(),
      type: "one_off" as const,
      amount: 0,
      month: 1,
      description: "",
    };

    updateCategory({
      adjustments: [...category.adjustments, newAdjustment],
    });
  };

  const deleteAdjustment = (adjustmentId: string) => {
    const updatedAdjustments = category.adjustments.filter(
      (adj) => adj.id !== adjustmentId
    );
    updateCategory({ adjustments: updatedAdjustments });
  };

  // Live monthly USD estimate for token-yield categories — driven by current
  // asset price + quantity so the user can sanity-check the implied dollar
  // figure without running a full projection.
  const tokenYieldEstimate = (() => {
    if (denomination !== "token_yield" || !linkedAsset) return 0;
    const valueUSD = linkedAsset.quantity * linkedAsset.currentPrice;
    return (valueUSD * (category.annualYieldPercent ?? 0)) / 100 / 12;
  })();

  const summaryAmount =
    denomination === "token_yield"
      ? tokenYieldEstimate
      : category.monthlyBaseline;

  return (
    <div className="bg-muted rounded-panel border border-knob-silver dark:border-knob-silver-dark p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Input
            value={category.name}
            onChange={(e) => updateCategory({ name: e.target.value })}
            className="w-64 font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-foreground">
            ${Math.round(summaryAmount).toLocaleString()}
            {denomination === "token_yield" && (
              <span className="text-caption text-muted-foreground ml-1">/mo est.</span>
            )}
          </div>
          <Switch
            checked={category.isActive}
            onCheckedChange={(checked) => updateCategory({ isActive: checked })}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteCategory}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-11 space-y-4">
          <div>
            <label className="text-caption text-muted-foreground block mb-1">
              Denomination
            </label>
            <Select
              value={denomination}
              onValueChange={(value) => {
                const next = value as InflowDenomination;
                if (next === "token_yield") {
                  updateCategory({
                    denomination: "token_yield",
                    tokenAssetId:
                      category.tokenAssetId ?? treasury.volatileAssets[0]?.id,
                    annualYieldPercent: category.annualYieldPercent ?? 5,
                  });
                } else {
                  updateCategory({ denomination: "fiat" });
                }
              }}
            >
              <SelectTrigger className="w-full md:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiat">Fiat ($) — fixed monthly amount</SelectItem>
                <SelectItem value="token_yield">
                  Token Yield (%) — % of native token value
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-caption text-muted-foreground mt-1">
              {denomination === "token_yield"
                ? "Income scales with the linked asset's price and remaining quantity each month."
                : "Income is a flat dollar amount each month, optionally with a growth rate."}
            </p>
          </div>

          {denomination === "fiat" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-caption text-muted-foreground block mb-1">
                  Monthly Baseline ($)
                </label>
                <Input
                  type="number"
                  value={category.monthlyBaseline}
                  onChange={(e) =>
                    updateCategory({ monthlyBaseline: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-1">
                  Growth Rate (%)
                </label>
                <Input
                  type="number"
                  value={category.growthRate}
                  onChange={(e) =>
                    updateCategory({ growthRate: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          {denomination === "token_yield" && (
            <div className="space-y-4">
              {treasury.volatileAssets.length === 0 ? (
                <div className="text-center py-3 bg-card rounded-panel border border-dashed border-knob-silver dark:border-knob-silver-dark">
                  <p className="text-caption text-muted-foreground">
                    Add a volatile asset to your treasury before configuring a token yield.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption text-muted-foreground block mb-1">
                      Yield Source (Token)
                    </label>
                    <Select
                      value={category.tokenAssetId ?? ""}
                      onValueChange={(value) =>
                        updateCategory({ tokenAssetId: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>
                      <SelectContent>
                        {treasury.volatileAssets.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} ({a.ticker.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-caption text-muted-foreground block mb-1">
                      Annual Yield (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.1"
                      value={category.annualYieldPercent ?? 0}
                      onChange={(e) =>
                        updateCategory({
                          annualYieldPercent: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {linkedAsset && (
                <div className="p-3 bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark">
                  <p className="text-caption text-muted-foreground">
                    Implied at month 1: {linkedAsset.quantity.toLocaleString()}{" "}
                    {linkedAsset.ticker.toUpperCase()} × $
                    {linkedAsset.currentPrice.toLocaleString()} ×{" "}
                    {(category.annualYieldPercent ?? 0).toFixed(2)}% / 12 =
                    <span className="font-mono font-semibold text-foreground ml-1">
                      ${Math.round(tokenYieldEstimate).toLocaleString()}/mo
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-placard uppercase text-muted-foreground">
                Adjustments
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addAdjustment}
                className="text-xs"
              >
                Add Adjustment
              </Button>
            </div>

            {category.adjustments.length === 0 ? (
              <div className="text-center py-4 bg-card rounded-panel border border-dashed border-knob-silver dark:border-knob-silver-dark">
                <p className="text-caption text-muted-foreground">
                  No adjustments added
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {category.adjustments.map((adjustment) => (
                  <AdjustmentRow
                    key={adjustment.id}
                    adjustment={adjustment}
                    categoryId={category.id}
                    onDelete={deleteAdjustment}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
