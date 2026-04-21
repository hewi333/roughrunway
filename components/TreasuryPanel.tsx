"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCryptoRunwayStore } from "@/lib/store";
import { VolatileAsset, VolatileAssetTier } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { defaultLiquidityProfile, defaultLiquidationPriority } from "@/lib/constants";
import StablecoinInput from "@/components/treasury/StablecoinInput";
import FiatInput from "@/components/treasury/FiatInput";
import VolatileAssetInput from "@/components/treasury/VolatileAssetInput";
import TreasurySummaryCard from "@/components/treasury/TreasurySummaryCard";

export default function TreasuryPanel() {
  const { model, updateModel } = useCryptoRunwayStore();
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Treasury</h2>
        <p className="text-gray-600">
          Configure your treasury holdings including stablecoins, fiat, and volatile assets.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Stablecoins */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <StablecoinInput stablecoins={treasury.stablecoins} />
        </div>
        
        {/* Fiat Currencies */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FiatInput fiatHoldings={treasury.fiat} />
        </div>
        
        {/* Volatile Assets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Volatile Assets</h3>
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
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">No volatile assets added yet</p>
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
                  onMoveDown={index < treasury.volatileAssets.length - 1 ? () => moveVolatileAsset(index, index + 1) : undefined}
                  canMoveUp={index > 0}
                  canMoveDown={index < treasury.volatileAssets.length - 1}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Treasury Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <TreasurySummaryCard />
        </div>
      </div>
    </div>
  );
}