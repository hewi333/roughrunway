"use client";

import React from "react";
import { useRoughRunwayStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";

export default function TreasurySummaryCard() {
  const { model } = useRoughRunwayStore();
  const { treasury } = model;

  const stablecoinTotal = treasury.stablecoins.reduce((sum, s) => sum + s.amount, 0);
  const fiatTotal = treasury.fiat.reduce((sum, f) => sum + f.amount, 0);
  const volatileAssetsSpotTotal = treasury.volatileAssets.reduce(
    (sum, asset) => sum + asset.quantity * asset.currentPrice,
    0
  );

  const totalAtSpot = stablecoinTotal + fiatTotal + volatileAssetsSpotTotal;

  const volatileAssetsHaircutTotal = treasury.volatileAssets.reduce((sum, asset) => {
    const spotValue = asset.quantity * asset.currentPrice;
    const haircutValue = spotValue * (1 - asset.liquidity.haircutPercent / 100);
    return sum + haircutValue;
  }, 0);

  const totalAtHaircut = stablecoinTotal + fiatTotal + volatileAssetsHaircutTotal;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div>
      <div className="mb-4">
        <div className="text-placard uppercase text-muted-foreground">Section</div>
        <h3 className="text-h3 text-foreground">Treasury Summary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Total at Spot Value</CardPlacard>
            <span className="text-caption text-muted-foreground">
              Current market value of all assets
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${fmt(totalAtSpot)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Total at Haircut Value</CardPlacard>
            <span className="text-caption text-muted-foreground">
              Conservative liquidation value
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${fmt(totalAtHaircut)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted p-4 rounded-panel">
          <div className="text-placard uppercase text-muted-foreground">Stablecoins</div>
          <div className="text-h3 font-mono font-semibold text-foreground mt-1">
            ${fmt(stablecoinTotal)}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-panel">
          <div className="text-placard uppercase text-muted-foreground">Fiat</div>
          <div className="text-h3 font-mono font-semibold text-foreground mt-1">
            ${fmt(fiatTotal)}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-panel">
          <div className="text-placard uppercase text-muted-foreground">Volatile Assets</div>
          <div className="text-h3 font-mono font-semibold text-foreground mt-1">
            ${fmt(volatileAssetsSpotTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
