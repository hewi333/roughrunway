"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { VolatileAsset, VolatileAssetTier } from "@/lib/types";
import LiquidityProfileEditor from "@/components/treasury/LiquidityProfileEditor";
import { defaultLiquidityProfile, defaultLiquidationPriority } from "@/lib/constants";

interface VolatileAssetInputProps {
  asset: VolatileAsset;
  onUpdate: (asset: VolatileAsset) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export default function VolatileAssetInput({
  asset,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: VolatileAssetInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updateAsset = (updates: Partial<VolatileAsset>) => {
    onUpdate({ ...asset, ...updates });
  };
  
  const updateLiquidityProfile = (profile: any) => {
    updateAsset({ liquidity: profile });
  };
  
  const tierOptions: { value: VolatileAssetTier; label: string }[] = [
    { value: "major", label: "Major (ETH, BTC, etc.)" },
    { value: "alt", label: "Altcoin" },
    { value: "native", label: "Native Protocol Token" },
  ];
  
  return (
    <div className="border border-gray-200 rounded-lg bg-white dark:border-gray-700 dark:bg-gray-800">
      <div 
        className="flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{asset.name || "Unnamed Asset"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {asset.ticker} • {asset.quantity.toLocaleString()} tokens
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canMoveUp && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp && onMoveUp();
              }}
              className="h-8 w-8 p-0"
            >
              ↑
            </Button>
          )}
          {canMoveDown && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown && onMoveDown();
              }}
              className="h-8 w-8 p-0"
            >
              ↓
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`asset-name-${asset.id}`} className="text-sm dark:text-gray-300">
                Asset Name
              </Label>
              <Input
                id={`asset-name-${asset.id}`}
                value={asset.name}
                onChange={(e) => updateAsset({ name: e.target.value })}
                placeholder="e.g., Ethereum"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor={`asset-ticker-${asset.id}`} className="text-sm dark:text-gray-300">
                Ticker
              </Label>
              <Input
                id={`asset-ticker-${asset.id}`}
                value={asset.ticker}
                onChange={(e) => updateAsset({ ticker: e.target.value })}
                placeholder="e.g., ETH"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor={`asset-tier-${asset.id}`} className="text-sm dark:text-gray-300">
                Asset Tier
              </Label>
              <Select
                value={asset.tier}
                onValueChange={(value) => {
                  const tier = value as VolatileAssetTier;
                  updateAsset({ 
                    tier,
                    liquidationPriority: defaultLiquidationPriority(tier),
                    liquidity: defaultLiquidityProfile(tier, asset.quantity)
                  });
                }}
              >
                <SelectTrigger id={`asset-tier-${asset.id}`} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`asset-quantity-${asset.id}`} className="text-sm dark:text-gray-300">
                Quantity
              </Label>
              <Input
                id={`asset-quantity-${asset.id}`}
                type="number"
                min="0"
                step="any"
                value={asset.quantity}
                onChange={(e) => updateAsset({ quantity: Number(e.target.value) })}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor={`asset-price-${asset.id}`} className="text-sm dark:text-gray-300">
                Current Price (USD)
              </Label>
              <Input
                id={`asset-price-${asset.id}`}
                type="number"
                min="0"
                step="0.01"
                value={asset.currentPrice}
                onChange={(e) => updateAsset({ currentPrice: Number(e.target.value) })}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor={`asset-priority-${asset.id}`} className="text-sm dark:text-gray-300">
                Liquidation Priority
              </Label>
              <Input
                id={`asset-priority-${asset.id}`}
                type="number"
                min="0"
                max="100"
                value={asset.liquidationPriority}
                onChange={(e) => updateAsset({ liquidationPriority: Number(e.target.value) })}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Lower numbers are liquidated first (0-100 scale)
              </p>
            </div>
          </div>
          
          <LiquidityProfileEditor
            profile={asset.liquidity}
            onChange={updateLiquidityProfile}
          />
        </div>
      )}
    </div>
  );
}