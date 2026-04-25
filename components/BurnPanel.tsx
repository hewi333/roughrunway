"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { BurnCategory } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import BurnCategoryRow from "@/components/burn/BurnCategoryRow";
import BurnSummaryCard from "@/components/burn/BurnSummaryCard";
import DescribeEdit from "@/components/ai/DescribeEdit";
import { validateBurnPatchClient, ValidatedBurnPatchShape } from "@/lib/patch-validators";

export default function BurnPanel() {
  const { model, updateModel } = useRoughRunwayStore();
  const { burnCategories } = model;

  const applyBurnPatch = (raw: unknown) => {
    const patch = validateBurnPatchClient(raw);
    if (!patch) return;
    const next: BurnCategory[] = patch.burnCategories.map((c) => {
      const existing = c.id ? burnCategories.find((e) => e.id === c.id) : undefined;
      return {
        id: c.id ?? uuidv4(),
        name: c.name,
        type: existing?.type ?? (c.presetKey ? "preset" : "custom"),
        presetKey: c.presetKey ?? existing?.presetKey,
        monthlyBaseline: c.monthlyBaseline,
        currency: existing?.currency ?? "fiat",
        growthRate: c.growthRate ?? existing?.growthRate ?? 0,
        adjustments: existing?.adjustments ?? [],
        isActive: c.isActive ?? existing?.isActive ?? true,
      };
    });
    updateModel({ burnCategories: next });
  };

  const addCategory = () => {
    const newCategory: BurnCategory = {
      id: uuidv4(),
      name: "New Burn Category",
      type: "custom",
      currency: "fiat",
      monthlyBaseline: 0,
      growthRate: 0,
      adjustments: [],
      isActive: true,
    };

    updateModel({
      burnCategories: [...burnCategories, newCategory],
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-placard uppercase text-muted-foreground">Section</div>
        <h2 className="text-h1 text-foreground mt-1">Burn Categories</h2>
        <p className="text-body text-muted-foreground mt-2">
          Configure your monthly burn categories including salaries, expenses, and other costs.
        </p>
      </div>

      <DescribeEdit<ValidatedBurnPatchShape>
        scope="burn"
        current={{
          burnCategories: burnCategories.map((c) => ({
            id: c.id,
            name: c.name,
            presetKey: c.presetKey,
            monthlyBaseline: c.monthlyBaseline,
            isActive: c.isActive,
          })),
        }}
        label="Edit burn in words"
        placeholder={'e.g. "cut marketing 30%" or "add $20k/month for legal" or "hire 2 engineers at 15k each"'}
        onApply={applyBurnPatch}
      />

      <div className="space-y-6">
        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-placard uppercase text-muted-foreground">Burn</div>
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

          {burnCategories.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-panel border border-dashed border-knob-silver dark:border-knob-silver-dark">
              <p className="text-body text-muted-foreground mb-4">No burn categories added yet</p>
              <Button onClick={addCategory} variant="outline">
                Add Your First Category
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {burnCategories.map((category) => (
                <BurnCategoryRow key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <BurnSummaryCard />
        </div>
      </div>
    </div>
  );
}