"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function MonthlyBreakdownTable() {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  // TODO: Replace with actual projection data from the store
  const data = [
    {
      month: "May 2026",
      hardBalance: 2000000,
      extendedBalance: 3500000,
      burn: 150000,
      inflows: 50000,
      netBurn: 100000,
      assets: [
        { name: "USDC", value: 1500000, type: "stablecoin" },
        { name: "Nexus Token", value: 2000000, type: "volatile" },
      ]
    },
    {
      month: "Jun 2026",
      hardBalance: 1800000,
      extendedBalance: 3200000,
      burn: 150000,
      inflows: 50000,
      netBurn: 100000,
      assets: [
        { name: "USDC", value: 1300000, type: "stablecoin" },
        { name: "Nexus Token", value: 1900000, type: "volatile" },
      ]
    }
  ];

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Breakdown</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hard Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extended Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflows</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Burn</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <React.Fragment key={index}>
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRow(index)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expandedRows[index] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.hardBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.extendedBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.burn.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.inflows.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.netBurn.toLocaleString()}
                  </td>
                </tr>
                {expandedRows[index] && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="ml-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Asset Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {row.assets.map((asset, assetIndex) => (
                            <div key={assetIndex} className="bg-gray-50 p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                                <span className="text-sm text-gray-500">
                                  ${asset.value.toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  asset.type === "stablecoin" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-blue-100 text-blue-800"
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