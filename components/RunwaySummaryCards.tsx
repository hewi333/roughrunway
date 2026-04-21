"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjection } from "@/lib/hooks/useProjection";

export default function RunwaySummaryCards() {
  const { summary } = useProjection();
  
  const hardRunway = summary.hardRunwayMonths ?? 0;
  const extendedRunway = summary.extendedRunwayMonths ?? 0;
  const fundingGap = summary.fundingGapUSD;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Hard Runway</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {hardRunway !== null ? `${hardRunway} months` : "18+ months"}
          </div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Based on liquid assets only
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Extended Runway</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {extendedRunway !== null ? `${extendedRunway} months` : "18+ months"}
          </div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Includes volatile assets
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Funding Gap</CardTitle>
          <div className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {fundingGap > 0 ? `-$${(fundingGap / 1000000).toFixed(1)}M` : '$0'}
          </div>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Unmet deficit over projection
          </p>
        </CardContent>
      </Card>
    </div>
  );
}