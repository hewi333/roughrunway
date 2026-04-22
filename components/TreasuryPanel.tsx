"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { VolatileAsset, VolatileAssetTier } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { defaultLiquidityProfile, defaultLiquidationPriority } from "@/lib/constants";
import StablecoinInput from "@/components/treasury/StablecoinInput";
import FiatInput from "@/components/treasury/FiatInput";
import VolatileAssetInput from "@/components/treasury/VolatileAssetInput";
import TreasurySummaryCard from "@/components/treasury/TreasurySummaryCard";

export default function TreasuryPanel() {
  const { model, updateModel } = useRoughRunwayStore();
  const { treasury } = model;

  const addVolatileAsset = () => {
    const newAsset: VolatileAsset = {
      id: uuidv4(),
      name: "",
      ticker: "",
      tier: "native",
      quantity: 0,
      currentPrice: 0,
      priceSource: "manual",
      liquidationPriority: defaultLiquidationPriority("native"),
      liquidity: defaultLiquidityProfile("native", 0),
    };

    updateModel({
      treasury: {
        ...treasury,
        volatileAssets: [...treasury.volatileAssets, newAsset],
      },
    });
  };

  const updateVolatileAsset = (updatedAsset: VolatileAsset) => {
    const updatedAssets = treasury.volatileAssets.map((asset) =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    );

    updateModel({
      treasury: {
        ...treasury,
        volatileAssets: updatedAssets,
      },
    });
  };

  const removeVolatileAsset = (id: string) => {
    const updatedAssets = treasury.volatileAssets.filter((asset) => asset.id !== id);

    updateModel({
      treasury: {
        ...treasury,
        volatileAssets: updatedAssets,
      },
    });
  };

  const moveVolatileAsset = (fromIndex: number, toIndex: number) => {
    const assets = [...treasury.volatileAssets];
    const [movedAsset] = assets.splice(fromIndex, 1);
    assets.splice(toIndex, 0, movedAsset);

    updateModel({
      treasury: {
        ...treasury,
        volatileAssets: assets,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-placard uppercase text-muted-foreground">Section</div>
        <h2 className="text-h1 text-foreground mt-1">Treasury</h2>
        <p className="text-body text-muted-foreground mt-2">
          Configure your treasury holdings including stablecoins, fiat, and volatile assets.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <StablecoinInput stablecoins={treasury.stablecoins} />
        </div>

        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <FiatInput fiatHoldings={treasury.fiat} />
        </div>

        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-placard uppercase text-muted-foreground">Treasury</div>
              <h3 className="text-h3 text-foreground">Volatile Assets</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addVolatileAsset}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>

          {treasury.volatileAssets.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-panel border border-dashed border-knob-silver dark:border-knob-silver-dark">
              <p className="text-body text-muted-foreground mb-4">No volatile assets added yet</p>
              <Button onClick={addVolatileAsset} variant="outline">
                Add Your First Asset
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {treasury.volatileAssets.map((asset, index) => (
                <VolatileAssetInput
                  key={asset.id}
                  asset={asset}
                  onUpdate={updateVolatileAsset}
                  onRemove={() => removeVolatileAsset(asset.id)}
                  onMoveUp={index > 0 ? () => moveVolatileAsset(index, index - 1) : undefined}
                  onMoveDown={
                    index < treasury.volatileAssets.length - 1
                      ? () => moveVolatileAsset(index, index + 1)
                      : undefined
                  }
                  canMoveUp={index > 0}
                  canMoveDown={index < treasury.volatileAssets.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
          <TreasurySummaryCard />
        </div>
      </div>
    </div>
  );
}
