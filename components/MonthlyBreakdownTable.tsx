"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useProjection } from "@/lib/hooks/useProjection";
import { cn } from "@/lib/utils";

export default function MonthlyBreakdownTable() {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const { projections } = useProjection();
  
  // Transform projection data for the table
  const data = projections.map(projection => ({
    month: projection.label,
    date: projection.date,
    hardBalance: projection.hardBalance,
    extendedBalance: projection.extendedBalance,
    burn: projection.totalBurn,
    inflows: projection.totalInflows,
    netBurn: projection.netBurn,
    assets: [
      // Add stablecoin assets
      {
        name: "Stablecoins",
        value: projection.stablecoinBalance,
        type: "stablecoin" as const,
        quantity: projection.stablecoinBalance, // Using balance as quantity for display
        price: 1, // Stablecoins are $1 each
      },
      // Add volatile assets
      ...projection.volatileAssets.map(asset => ({
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
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-gray-100">Monthly Breakdown</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Hard Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Extended Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Burn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Inflows</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Net Burn</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {data.map((row, index) => (
              <React.Fragment key={index}>
                <tr 
                  className={cn(
                    "hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700",
                    row.liquidityConstrained && "bg-red-50 dark:bg-red-900/20"
                  )}
                  onClick={() => toggleRow(index)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {expandedRows[index] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${row.hardBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${row.extendedBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${row.burn.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${row.inflows.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${row.netBurn.toLocaleString()}
                  </td>
                </tr>
                {expandedRows[index] && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 dark:bg-gray-800">
                      <div className="ml-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 dark:text-gray-100">Asset Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {row.assets.map((asset, assetIndex) => (
                            <div key={assetIndex} className="bg-gray-50 p-3 rounded-md dark:bg-gray-700">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{asset.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ${asset.value.toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{asset.type === "stablecoin" ? `$${asset.quantity.toLocaleString()}` : `${asset.quantity.toLocaleString()} tokens`}</span>
                                <span>{asset.type === "stablecoin" ? "$1.00 each" : `$${asset.price.toFixed(2)} each`}</span>
                              </div>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  asset.type === "volatile" 
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                }`}>
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