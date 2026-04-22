"use client";

import React from "react";
import { useRoughRunwayStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";

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
      <div className="text-placard uppercase text-muted-foreground">Summary</div>
      <h3 className="text-h3 text-foreground mt-1 mb-4">Treasury Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Total at Spot Value</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${totalAtSpot.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              Current market value of all assets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Total at Haircut Value</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${totalAtHaircut.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              Conservative liquidation value
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Stablecoins</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h3 font-mono font-bold text-foreground">
              ${stablecoinTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Fiat</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h3 font-mono font-bold text-foreground">
              ${fiatTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Volatile Assets</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h3 font-mono font-bold text-foreground">
              ${volatileAssetsSpotTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}