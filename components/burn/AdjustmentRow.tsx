"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { Adjustment } from "@/lib/types";

interface AdjustmentRowProps {
  adjustment: Adjustment;
  categoryId: string;
  onDelete: (adjustmentId: string) => void;
}

export default function AdjustmentRow({
  adjustment,
  categoryId,
  onDelete,
}: AdjustmentRowProps) {
  const { model, updateModel } = useRoughRunwayStore();
  const { burnCategories } = model;

  const updateAdjustment = (updates: Partial<Adjustment>) => {
    const updatedCategories = burnCategories.map((category) => {
      if (category.id === categoryId) {
        const updatedAdjustments = category.adjustments.map((adj) =>
          adj.id === adjustment.id ? { ...adj, ...updates } : adj
        );
        return { ...category, adjustments: updatedAdjustments };
      }
      return category;
    });

    updateModel({ burnCategories: updatedCategories });
  };

  const labelId = `adj-${adjustment.id}`;

  return (
    <div className="flex items-end gap-2 p-2 bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark">
      <div className="flex-1">
        <Label htmlFor={`${labelId}-label`} className="text-caption text-muted-foreground">
          Label
        </Label>
        <Input
          id={`${labelId}-label`}
          value={adjustment.description}
          onChange={(e) => updateAdjustment({ description: e.target.value })}
          placeholder="e.g. Annual legal bill"
          className="mt-1 text-sm"
        />
      </div>
      <div className="w-28">
        <Label htmlFor={`${labelId}-amount`} className="text-caption text-muted-foreground">
          Amount ($)
        </Label>
        <Input
          id={`${labelId}-amount`}
          type="number"
          value={adjustment.amount}
          onChange={(e) => updateAdjustment({ amount: Number(e.target.value) })}
          placeholder="0"
          className="mt-1 text-sm"
        />
      </div>
      <div className="w-20">
        <Label htmlFor={`${labelId}-month`} className="text-caption text-muted-foreground">
          Month
        </Label>
        <Input
          id={`${labelId}-month`}
          type="number"
          value={adjustment.month}
          onChange={(e) => updateAdjustment({ month: Number(e.target.value) })}
          placeholder="1"
          min="1"
          max="36"
          className="mt-1 text-sm"
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(adjustment.id)}
        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
