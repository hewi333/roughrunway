"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardPlacard } from "@/components/ui/card";
import { useRoughRunwayStore } from "@/lib/store";

export default function InflowSummaryCard() {
  const { model } = useRoughRunwayStore();
  const { inflowCategories } = model;

  const totalMonthlyInflow = inflowCategories
    .filter((c) => c.isActive)
    .reduce((sum, c) => sum + c.monthlyBaseline, 0);

  const totalAdjustments = inflowCategories
    .filter((c) => c.isActive)
    .flatMap((c) => c.adjustments)
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div>
      <div className="text-placard uppercase text-muted-foreground">Summary</div>
      <h3 className="text-h3 text-foreground mt-1 mb-4">Inflow Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-col space-y-1 pb-2">
            <CardPlacard>Monthly Baseline</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${totalMonthlyInflow.toLocaleString()}
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
            <CardPlacard>Total Monthly Inflow</CardPlacard>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-mono font-bold text-foreground">
              ${(totalMonthlyInflow + totalAdjustments).toLocaleString()}
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
