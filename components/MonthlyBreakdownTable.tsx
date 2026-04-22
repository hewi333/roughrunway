"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useProjection } from "@/lib/hooks/useProjection";
import { cn } from "@/lib/utils";

const COLUMN_HEADERS = [
  { label: "", className: "w-8" },
  { label: "Month" },
  { label: "Hard Balance" },
  { label: "Extended Balance" },
  { label: "Burn" },
  { label: "Inflows" },
  { label: "Net Burn" },
];

export default function MonthlyBreakdownTable() {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const { projections } = useProjection();

  const data = projections.map((projection) => ({
    month: projection.label,
    date: projection.date,
    hardBalance: projection.hardBalance,
    extendedBalance: projection.extendedBalance,
    burn: projection.totalBurn,
    inflows: projection.totalInflows,
    netBurn: projection.netBurn,
    assets: [
      {
        name: "Stablecoins",
        value: projection.stablecoinBalance,
        type: "stablecoin" as const,
        quantity: projection.stablecoinBalance,
        price: 1,
      },
      ...projection.volatileAssets.map((asset) => ({
        name: asset.assetId,
        value: asset.valueAtHaircut,
        type: "volatile" as const,
        quantity: asset.quantity,
        price: asset.pricePerToken,
      })),
    ],
    liquidityConstrained: projection.liquidityConstrained,
  }));

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
      <div className="mb-4">
        <div className="text-placard uppercase text-muted-foreground">Log</div>
        <h2 className="text-h3 text-foreground">Monthly Breakdown</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-knob-silver dark:border-knob-silver-dark">
              {COLUMN_HEADERS.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-4 py-3 text-left text-placard uppercase text-muted-foreground",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={index}>
                <tr
                  className={cn(
                    "border-b border-knob-silver/50 dark:border-knob-silver-dark/50 cursor-pointer hover:bg-muted transition-colors duration-150",
                    row.liquidityConstrained &&
                      "bg-aviation-red/5 hover:bg-aviation-red/10"
                  )}
                  onClick={() => toggleRow(index)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {expandedRows[index] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-body font-medium text-foreground">
                    {row.month}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-body font-mono text-foreground">
                    {fmt(row.hardBalance)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-body font-mono text-foreground">
                    {fmt(row.extendedBalance)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-body font-mono text-muted-foreground">
                    {fmt(row.burn)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-body font-mono text-muted-foreground">
                    {fmt(row.inflows)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-body font-mono text-muted-foreground">
                    {fmt(row.netBurn)}
                  </td>
                </tr>
                {expandedRows[index] && (
                  <tr>
                    <td
                      colSpan={COLUMN_HEADERS.length}
                      className="px-4 py-4 bg-muted border-b border-knob-silver/50 dark:border-knob-silver-dark/50"
                    >
                      <div className="ml-8">
                        <div className="text-placard uppercase text-muted-foreground mb-2">
                          Asset Breakdown
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {row.assets.map((asset, assetIndex) => (
                            <div
                              key={assetIndex}
                              className="bg-card border border-knob-silver dark:border-knob-silver-dark p-3 rounded-precise"
                            >
                              <div className="flex justify-between items-baseline">
                                <span className="text-body font-medium text-foreground">
                                  {asset.name}
                                </span>
                                <span className="text-body font-mono text-foreground">
                                  {fmt(asset.value)}
                                </span>
                              </div>
                              <div className="mt-1 flex justify-between text-caption text-muted-foreground">
                                <span className="font-mono">
                                  {asset.type === "stablecoin"
                                    ? `$${asset.quantity.toLocaleString()}`
                                    : `${asset.quantity.toLocaleString()} tokens`}
                                </span>
                                <span className="font-mono">
                                  {asset.type === "stablecoin"
                                    ? "$1.00 each"
                                    : `$${asset.price.toFixed(2)} each`}
                                </span>
                              </div>
                              <div className="mt-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-knob text-placard uppercase",
                                    asset.type === "volatile"
                                      ? "bg-sky-blue/15 text-sky-blue dark:bg-sky-blue-dark/20 dark:text-sky-blue-dark"
                                      : "bg-aviation-green/15 text-aviation-green dark:bg-aviation-green-dark/20 dark:text-aviation-green-dark"
                                  )}
                                >
                                  {asset.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
