"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiquidityProfile, MaxSellUnit } from "@/lib/types";

interface LiquidityProfileEditorProps {
  profile: LiquidityProfile;
  onChange: (profile: LiquidityProfile) => void;
}

export default function LiquidityProfileEditor({ profile, onChange }: LiquidityProfileEditorProps) {
  const updateProfile = (updates: Partial<LiquidityProfile>) => {
    onChange({ ...profile, ...updates });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-900">Liquidity Profile</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxSellUnit" className="text-sm">
            Max Sell Unit
          </Label>
          <Select
            value={profile.maxSellUnit}
            onValueChange={(value) => updateProfile({ maxSellUnit: value as MaxSellUnit })}
          >
            <SelectTrigger id="maxSellUnit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tokens">Tokens</SelectItem>
              <SelectItem value="percent_of_volume">Percent of Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="maxSellPerMonth" className="text-sm">
            Max Sell Per Month
          </Label>
          <Input
            id="maxSellPerMonth"
            type="number"
            min="0"
            step="any"
            value={profile.maxSellPerMonth}
            onChange={(e) => updateProfile({ maxSellPerMonth: Number(e.target.value) })}
          />
        </div>
        
        {profile.maxSellUnit === "percent_of_volume" && (
          <>
            <div>
              <Label htmlFor="percentOfVolume" className="text-sm">
                Percent of Volume (%)
              </Label>
              <Input
                id="percentOfVolume"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={profile.percentOfVolume || 0}
                onChange={(e) => updateProfile({ percentOfVolume: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <Label htmlFor="dailyVolume" className="text-sm">
                Daily Volume (USD)
              </Label>
              <Input
                id="dailyVolume"
                type="number"
                min="0"
                step="1000"
                value={profile.dailyVolume || 0}
                onChange={(e) => updateProfile({ dailyVolume: Number(e.target.value) })}
              />
            </div>
          </>
        )}
        
        <div>
          <Label htmlFor="haircutPercent" className="text-sm">
            Haircut (%)
          </Label>
          <Input
            id="haircutPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={profile.haircutPercent}
            onChange={(e) => updateProfile({ haircutPercent: Number(e.target.value) })}
          />
        </div>
        
        <div>
          <Label htmlFor="priceAssumption" className="text-sm">
            Price Assumption
          </Label>
          <Select
            value={profile.priceAssumption}
            onValueChange={(value) => updateProfile({ priceAssumption: value as any })}
          >
            <SelectTrigger id="priceAssumption">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="constant">Constant</SelectItem>
              <SelectItem value="monthly_decline">Monthly Decline</SelectItem>
              <SelectItem value="custom_schedule">Custom Schedule</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {profile.priceAssumption === "monthly_decline" && (
          <div>
            <Label htmlFor="monthlyDeclineRate" className="text-sm">
              Monthly Decline Rate (%)
            </Label>
            <Input
              id="monthlyDeclineRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={profile.monthlyDeclineRate || 0}
              onChange={(e) => updateProfile({ monthlyDeclineRate: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}