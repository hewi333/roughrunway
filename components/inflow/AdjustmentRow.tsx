"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const { inflowCategories } = model;

  const updateAdjustment = (updates: Partial<Adjustment>) => {
    const updatedCategories = inflowCategories.map((category) => {
      if (category.id === categoryId) {
        const updatedAdjustments = category.adjustments.map((adj) =>
          adj.id === adjustment.id ? { ...adj, ...updates } : adj
        );
        return { ...category, adjustments: updatedAdjustments };
      }
      return category;
    });

    updateModel({ inflowCategories: updatedCategories });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark">
      <Input
        value={adjustment.description}
        onChange={(e) => updateAdjustment({ description: e.target.value })}
        placeholder="Adjustment description"
        className="flex-1 text-sm"
      />
      <Input
        type="number"
        value={adjustment.amount}
        onChange={(e) => updateAdjustment({ amount: Number(e.target.value) })}
        placeholder="Amount"
        className="w-24 text-sm"
      />
      <Input
        type="number"
        value={adjustment.month}
        onChange={(e) => updateAdjustment({ month: Number(e.target.value) })}
        placeholder="Month"
        min="1"
        max="36"
        className="w-20 text-sm"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(adjustment.id)}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}