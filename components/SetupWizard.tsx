"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoughRunwayStore } from "@/lib/store";

export default function SetupWizard() {
  const { model, updateModel } = useRoughRunwayStore();
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState(model.name);
  const [stablecoinAmount, setStablecoinAmount] = useState(model.treasury.stablecoins[0]?.amount || 1000000);
  const [fiatAmount, setFiatAmount] = useState(model.treasury.fiat[0]?.amount || 500000);
  const [monthlyBurn, setMonthlyBurn] = useState(model.burnCategories[0]?.monthlyBaseline || 100000);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save the setup data
      updateModel({
        name: projectName,
        treasury: {
          ...model.treasury,
          stablecoins: [{ ...model.treasury.stablecoins[0], amount: stablecoinAmount }],
          fiat: [{ ...model.treasury.fiat[0], amount: fiatAmount }],
        },
        burnCategories: [{ ...model.burnCategories[0], monthlyBaseline: monthlyBurn }],
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">
      <Card className="w-full max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center dark:text-gray-100">Welcome to Rough Runway</CardTitle>
          <CardDescription className="text-center dark:text-gray-400">
            Let's set up your financial runway model in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">Project Information</h3>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                  Give your project a name to help you identify it later.
                </p>
                <div>
                  <Label htmlFor="project-name" className="text-sm font-medium dark:text-gray-300">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Protocol Treasury Model"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">Treasury Setup</h3>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                  Enter your current treasury holdings to get started.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stablecoin-amount" className="text-sm font-medium dark:text-gray-300">
                      Stablecoin Holdings (USD)
                    </Label>
                    <Input
                      id="stablecoin-amount"
                      type="number"
                      min="0"
                      step="1000"
                      value={stablecoinAmount}
                      onChange={(e) => setStablecoinAmount(Number(e.target.value))}
                      placeholder="e.g., 1000000"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiat-amount" className="text-sm font-medium dark:text-gray-300">
                      Fiat Holdings (USD)
                    </Label>
                    <Input
                      id="fiat-amount"
                      type="number"
                      min="0"
                      step="1000"
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(Number(e.target.value))}
                      placeholder="e.g., 500000"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-gray-100">Burn Rate</h3>
                <p className="text-gray-600 mb-6 dark:text-gray-400">
                  Estimate your monthly burn rate to calculate your runway.
                </p>
                <div>
                  <Label htmlFor="monthly-burn" className="text-sm font-medium dark:text-gray-300">
                    Monthly Burn Rate (USD)
                  </Label>
                  <Input
                    id="monthly-burn"
                    type="number"
                    min="0"
                    step="1000"
                    value={monthlyBurn}
                    onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                    placeholder="e.g., 100000"
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back
            </Button>
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
              {step === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}