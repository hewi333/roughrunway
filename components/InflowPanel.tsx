"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { InflowCategory } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import InflowCategoryRow from "@/components/inflow/InflowCategoryRow";
import InflowSummaryCard from "@/components/inflow/InflowSummaryCard";
import DescribeEdit from "@/components/ai/DescribeEdit";
import { validateInflowPatchClient, ValidatedInflowPatchShape } from "@/lib/patch-validators";

export default function InflowPanel() {
  const { model, updateModel } = useRoughRunwayStore();
  const { inflowCategories } = model;

  const applyInflowPatch = (raw: unknown) => {
    const patch = validateInflowPatchClient(raw);
    if (!patch) return;
    const next: InflowCategory[] = patch.inflowCategories.map((c) => {
      const existing = c.id ? inflowCategories.find((e) => e.id === c.id) : undefined;
      return {
        id: c.id ?? uuidv4(),
        name: c.name,
        type: existing?.type ?? (c.presetKey ? "preset" : "custom"),
        presetKey: c.presetKey ?? existing?.presetKey,
        monthlyBaseline: c.monthlyBaseline,
        growthRate: c.growthRate ?? existing?.growthRate ?? 0,
        adjustments: existing?.adjustments ?? [],
        isActive: c.isActive ?? existing?.isActive ?? true,
      };
    });
    updateModel({ inflowCategories: next });
  };

  const addCategory = () => {
    const newCategory: InflowCategory = {
      id: uuidv4(),
      name: "New Inflow Category",
      type: "custom",
      monthlyBaseline: 0,
      growthRate: 0,
      adjustments: [],
      isActive: true,
    };
    updateModel({ inflowCategories: [...inflowCategories, newCategory] });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-placard uppercase text-muted-foreground">Section</div>
        <h2 className="text-h1 text-foreground mt-1">Inflow Categories</h2>
        <p className="text-body text-muted-foreground mt-2">
          Configure your monthly inflows — revenue, staking income, grants, and other recurring sources.
        </p>
      </div>

      <DescribeEdit<ValidatedInflowPatchShape>
        scope="inflow"
        current={{
          inflowCategories: inflowCategories.map((c) => ({
            id: c.id,
            name: c.name,
            presetKey: c.presetKey,
            monthlyBaseline: c.monthlyBaseline,
            isActive: c.isActive,
          })),
        }}
        label="Edit inflows in words"
        placeholder={'e.g. "add $50k/mo revenue" or "double staking income" or "remove grants"'}
        onApply={applyInflowPatch}
      />

      <div className="space-y-6">
        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-placard uppercase text-muted-foreground">Inflows</div>
              <h3 className="text-h3 text-foreground">Categories</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addCategory}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {inflowCategories.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-panel border border-dashed border-knob-silver dark:border-knob-silver-dark">
              <p className="text-body text-muted-foreground mb-4">No inflow categories added yet</p>
              <Button onClick={addCategory} variant="outline">
                Add Your First Category
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {inflowCategories.map((category) => (
                <InflowCategoryRow key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <InflowSummaryCard />
        </div>
      </div>
    </div>
  );
}
