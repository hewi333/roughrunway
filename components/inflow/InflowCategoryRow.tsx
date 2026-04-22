"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { InflowCategory } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import AdjustmentRow from "@/components/inflow/AdjustmentRow";

interface InflowCategoryRowProps {
  category: InflowCategory;
}

export default function InflowCategoryRow({ category }: InflowCategoryRowProps) {
  const { model, updateModel } = useRoughRunwayStore();
  const { inflowCategories } = model;
  const [isExpanded, setIsExpanded] = useState(false);

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
      name: "New Adjustment",
      type: "one_off" as const,
      amount: 0,
      month: 1,
      description: "New adjustment",
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
            ${category.monthlyBaseline.toLocaleString()}
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