"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RunwaySummaryCards() {
  // TODO: Connect to actual projection data from the store
  const hardRunway = 8;
  const extendedRunway = 16;
  const fundingGap = 1200000;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hard Runway</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hardRunway} months</div>
          <p className="text-xs text-muted-foreground">
            Based on liquid assets only
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Extended Runway</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{extendedRunway} months</div>
          <p className="text-xs text-muted-foreground">
            Includes volatile assets
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funding Gap</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {fundingGap > 0 ? `-$${(fundingGap / 1000000).toFixed(1)}M` : '$0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Unmet deficit over projection
          </p>
        </CardContent>
      </Card>
    </div>
  );
}