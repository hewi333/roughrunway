"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_FLAG_KEY = "rr_demo_flow";

type Stage = "scenarios" | "pick-template" | null;

interface DemoCoachmarkProps {
  activePanel: "treasury" | "burn" | "inflow" | "scenarios";
  onGoToScenarios: () => void;
}

export default function DemoCoachmark({
  activePanel,
  onGoToScenarios,
}: DemoCoachmarkProps) {
  const [stage, setStage] = useState<Stage>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = sessionStorage.getItem(DEMO_FLAG_KEY);
    if (flag === "scenarios" || flag === "pick-template") {
      setStage(flag);
    }
  }, []);

  // When the user lands on the Scenarios panel, advance stage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (stage === "scenarios" && activePanel === "scenarios") {
      sessionStorage.setItem(DEMO_FLAG_KEY, "pick-template");
      setStage("pick-template");
    }
  }, [activePanel, stage]);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DEMO_FLAG_KEY);
    }
    setStage(null);
  };

  if (!stage) return null;

  if (stage === "scenarios") {
    return (
      <Banner onDismiss={dismiss}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-swiss-red flex-shrink-0">
          Step 3 of 4
        </span>
        <span className="text-sm text-foreground">
          Sample data loaded. Now stress-test it — open{" "}
          <span className="font-semibold">Scenarios</span> to overlay a
          bear market or hiring surge on the projection.
        </span>
        <Button
          size="sm"
          className="ml-auto gap-2 flex-shrink-0"
          onClick={() => {
            onGoToScenarios();
          }}
          data-action="demo-go-to-scenarios"
        >
          Go to scenarios
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Banner>
    );
  }

  // pick-template
  return (
    <Banner onDismiss={dismiss}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-swiss-red flex-shrink-0">
        Step 4 of 4
      </span>
      <span className="text-sm text-foreground">
        Pick any template below — Bear Market, Aggressive Hiring, Token
        Crash, or Emergency Cuts — to overlay it on the runway chart.
      </span>
    </Banner>
  );
}

function Banner({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div className="border-b border-swiss-red/30 bg-swiss-red/5">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-3">
        {children}
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label="Dismiss demo guide"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
