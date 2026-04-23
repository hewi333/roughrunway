"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardPlacard,
} from "@/components/ui/card";
import { useRoughRunwayStore } from "@/lib/store";
import AISetupAssistant from "@/components/ai/AISetupAssistant";

export default function SetupWizard() {
  const { model, updateModel } = useRoughRunwayStore();
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState(model.name);
  const [stablecoinAmount, setStablecoinAmount] = useState(
    model.treasury.stablecoins[0]?.amount || 1000000
  );
  const [fiatAmount, setFiatAmount] = useState(model.treasury.fiat[0]?.amount || 500000);
  const [monthlyBurn, setMonthlyBurn] = useState(
    model.burnCategories[0]?.monthlyBaseline || 100000
  );

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateModel({
        name: projectName,
        treasury: {
          ...model.treasury,
          stablecoins: [{ ...model.treasury.stablecoins[0], amount: stablecoinAmount }],
          fiat: [{ ...model.treasury.fiat[0], amount: fiatAmount }],
        },
        burnCategories: [
          { ...model.burnCategories[0], monthlyBaseline: monthlyBurn },
        ],
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardPlacard className="mx-auto">
            Step {step} of 3
          </CardPlacard>
          <CardTitle>Welcome to Rough Runway</CardTitle>
          <CardDescription>
            Let's set up your financial runway model in just a few steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              {/* AI shortcut — full page */}
              <div className="rounded-panel border border-knob-silver dark:border-knob-silver-dark p-4 bg-muted">
                <AISetupAssistant onApplied={() => {
                  // Model was set — wizard will re-evaluate and close
                  updateModel({ name: model.name }); // trigger re-render
                }} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-knob-silver/40 dark:bg-knob-silver-dark/40" />
                <span className="text-caption text-muted-foreground uppercase tracking-wide">or set up manually</span>
                <div className="flex-1 h-px bg-knob-silver/40 dark:bg-knob-silver-dark/40" />
              </div>

              <div>
                <div className="text-placard uppercase text-muted-foreground mb-1">
                  Identification
                </div>
                <h3 className="text-h3 text-foreground mb-2">Project Information</h3>
                <p className="text-body text-muted-foreground mb-6">
                  Give your project a name to help you identify it later.
                </p>
                <div>
                  <Label htmlFor="project-name" className="text-caption">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Protocol Treasury Model"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="text-placard uppercase text-muted-foreground mb-1">
                  Treasury
                </div>
                <h3 className="text-h3 text-foreground mb-2">Treasury Setup</h3>
                <p className="text-body text-muted-foreground mb-6">
                  Enter your current treasury holdings to get started.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stablecoin-amount" className="text-caption">
                      Stablecoin Holdings (USD)
                    </Label>
                    <Input
                      id="stablecoin-amount"
                      type="number"
                      min="0"
                      step="1000"
                      value={stablecoinAmount}
                      onChange={(e) => setStablecoinAmount(Number(e.target.value))}
                      placeholder="1000000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiat-amount" className="text-caption">
                      Fiat Holdings (USD)
                    </Label>
                    <Input
                      id="fiat-amount"
                      type="number"
                      min="0"
                      step="1000"
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(Number(e.target.value))}
                      placeholder="500000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="text-placard uppercase text-muted-foreground mb-1">
                  Outflows
                </div>
                <h3 className="text-h3 text-foreground mb-2">Burn Rate</h3>
                <p className="text-body text-muted-foreground mb-6">
                  Estimate your monthly burn rate to calculate your runway.
                </p>
                <div>
                  <Label htmlFor="monthly-burn" className="text-caption">
                    Monthly Burn Rate (USD)
                  </Label>
                  <Input
                    id="monthly-burn"
                    type="number"
                    min="0"
                    step="1000"
                    value={monthlyBurn}
                    onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                    placeholder="100000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Back
            </Button>
            <Button variant="knob" onClick={handleNext}>
              {step === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
