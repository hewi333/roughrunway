"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";
import { useRoughRunwayStore } from "@/lib/store";

export default function BurnSummaryCard() {
  const { model } = useRoughRunwayStore();
  const { burnCategories } = model;

  // Calculate total monthly burn (simplified calculation)
  const totalMonthlyBurn = burnCategories
    .filter(category => category.isActive)
    .reduce((sum, category) => sum + category.monthlyBaseline, 0);

  // Calculate total adjustments
  const totalAdjustments = burnCategories
    .filter(category => category.isActive)
    .flatMap(category => category.adjustments)
    .reduce((sum, adjustment) => sum + adjustment.amount, 0);

  return (
    <div>
      <div className="text-placard uppercase text-muted-foreground">Summary</div>
      <h3 className="text-h3 text-foreground mt-1 mb-4">Burn Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Monthly Baseline</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${totalMonthlyBurn.toLocaleString()}
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              Active categories only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Adjustments</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${totalAdjustments.toLocaleString()}
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              One-offs and changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Total Monthly Burn</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${(totalMonthlyBurn + totalAdjustments).toLocaleString()}
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              Baseline + adjustments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}