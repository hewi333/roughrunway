"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { StablecoinHolding } from "@/lib/types";
import { COMMON_STABLECOINS } from "@/lib/constants";
import { useRoughRunwayStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

interface StablecoinInputProps {
  stablecoins: StablecoinHolding[];
}

export default function StablecoinInput({ stablecoins }: StablecoinInputProps) {
  const { updateModel } = useRoughRunwayStore();

  const addStablecoin = () => {
    const newStablecoin: StablecoinHolding = {
      id: uuidv4(),
      name: COMMON_STABLECOINS[0],
      amount: 0,
    };

    updateModel({
      treasury: {
        ...useRoughRunwayStore.getState().model.treasury,
        stablecoins: [...stablecoins, newStablecoin],
      },
    });
  };

  const updateStablecoin = (id: string, updates: Partial<StablecoinHolding>) => {
    const updatedStablecoins = stablecoins.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );

    updateModel({
      treasury: {
        ...useRoughRunwayStore.getState().model.treasury,
        stablecoins: updatedStablecoins,
      },
    });
  };

  const removeStablecoin = (id: string) => {
    const updatedStablecoins = stablecoins.filter((s) => s.id !== id);

    updateModel({
      treasury: {
        ...useRoughRunwayStore.getState().model.treasury,
        stablecoins: updatedStablecoins,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-placard uppercase text-muted-foreground">Treasury</div>
          <Label className="text-h3 text-foreground">Stablecoins</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStablecoin}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {stablecoins.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-panel border border-dashed border-knob-silver dark:border-knob-silver-dark">
          <p className="text-body text-muted-foreground">No stablecoins added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stablecoins.map((stablecoin) => (
            <div key={stablecoin.id} className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor={`stablecoin-name-${stablecoin.id}`} className="text-caption">
                  Stablecoin
                </Label>
                <select
                  id={`stablecoin-name-${stablecoin.id}`}
                  value={stablecoin.name}
                  onChange={(e) => updateStablecoin(stablecoin.id, { name: e.target.value })}
                  className="w-full rounded-precise border border-input bg-background py-2 px-3 text-body focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                >
                  {COMMON_STABLECOINS.map((coin) => (
                    <option key={coin} value={coin}>
                      {coin}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex-1">
                <Label htmlFor={`stablecoin-amount-${stablecoin.id}`} className="text-caption">
                  Amount (USD)
                </Label>
                <Input
                  id={`stablecoin-amount-${stablecoin.id}`}
                  type="number"
                  min="0"
                  step="1000"
                  value={stablecoin.amount}
                  onChange={(e) =>
                    updateStablecoin(stablecoin.id, { amount: Number(e.target.value) })
                  }
                  className="w-full mt-1"
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStablecoin(stablecoin.id)}
                className="h-9 w-9"
                aria-label={`Remove ${stablecoin.name}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
