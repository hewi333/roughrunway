"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { FiatHolding } from "@/lib/types";
import { useRoughRunwayStore } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

interface FiatInputProps {
  fiatHoldings: FiatHolding[];
}

export default function FiatInput({ fiatHoldings }: FiatInputProps) {
  const { updateModel } = useRoughRunwayStore();
  
  const addFiat = () => {
    const newFiat: FiatHolding = {
      id: uuidv4(),
      currency: "USD",
      amount: 0,
    };
    
    updateModel({
      treasury: {
        ...useRoughRunwayStore.getState().model.treasury,
        fiat: [...fiatHoldings, newFiat],
      },
    });
  };
  
  const updateFiat = (id: string, updates: Partial<FiatHolding>) => {
    const updatedFiat = fiatHoldings.map((f) => 
      f.id === id ? { ...f, ...updates } : f
    );
    
    updateModel({
      treasury: {
        ...useRoughRunwayStore.getState().model.treasury,
        fiat: updatedFiat,
      },
    });
  };
  
  const removeFiat = (id: string) => {
    const updatedFiat = fiatHoldings.filter((f) => f.id !== id);
    
    updateModel({
      treasury: {
        ...useRoughRunwayStore.getState().model.treasury,
        fiat: updatedFiat,
      },
    });
  };
  
  const currencyOptions = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Fiat Currencies</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addFiat}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      
      {fiatHoldings.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg border border-dashed border-knob-silver dark:border-knob-silver-dark">
          <p className="text-muted-foreground">No fiat currencies added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fiatHoldings.map((fiat) => (
            <div key={fiat.id} className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor={`fiat-currency-${fiat.id}`} className="text-sm">
                  Currency
                </Label>
                <select
                  id={`fiat-currency-${fiat.id}`}
                  value={fiat.currency}
                  onChange={(e) => updateFiat(fiat.id, { currency: e.target.value as any })}
                  className="w-full rounded-md border border-gray-300 dark:border-border bg-background text-foreground py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor={`fiat-amount-${fiat.id}`} className="text-sm">
                  Amount
                </Label>
                <Input
                  id={`fiat-amount-${fiat.id}`}
                  type="number"
                  min="0"
                  step="1000"
                  value={fiat.amount}
                  onChange={(e) => updateFiat(fiat.id, { amount: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFiat(fiat.id)}
                className="h-9 w-9"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}