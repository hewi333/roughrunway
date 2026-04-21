"use client";

import React from "react";
import { useRoughRunwayStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TreasurySummaryCard() {
  const { model } = useRoughRunwayStore();
  const { treasury } = model;
  
  // Calculate total at spot value
  const stablecoinTotal = treasury.stablecoins.reduce((sum, s) => sum + s.amount, 0);
  const fiatTotal = treasury.fiat.reduce((sum, f) => sum + f.amount, 0);
  const volatileAssetsSpotTotal = treasury.volatileAssets.reduce(
    (sum, asset) => sum + (asset.quantity * asset.currentPrice),
    0
  );
  
  const totalAtSpot = stablecoinTotal + fiatTotal + volatileAssetsSpotTotal;
  
  // Calculate total at haircut value
  const volatileAssetsHaircutTotal = treasury.volatileAssets.reduce(
    (sum, asset) => {
      const spotValue = asset.quantity * asset.currentPrice;
      const haircutValue = spotValue * (1 - asset.liquidity.haircutPercent / 100);
      return sum + haircutValue;
    },
    0
  );
  
  const totalAtHaircut = stablecoinTotal + fiatTotal + volatileAssetsHaircutTotal;
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Treasury Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-100">Total at Spot Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              ${totalAtSpot.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Current market value of all assets
            </p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-100">Total at Haircut Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              ${totalAtHaircut.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Conservative liquidation value
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Stablecoins</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${stablecoinTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Fiat</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${fiatTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Volatile Assets</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${volatileAssetsSpotTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  );
}