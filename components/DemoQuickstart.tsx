"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoughRunwayStore } from "@/lib/store";
import { buildDemoModel } from "@/lib/demo-model";

const DEMO_FLAG_KEY = "rr_demo_flow";

interface DemoQuickstartProps {
  onLoaded?: () => void;
}

export default function DemoQuickstart({ onLoaded }: DemoQuickstartProps) {
  const { setModel } = useRoughRunwayStore();

  const loadDemo = () => {
    setModel(buildDemoModel());
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DEMO_FLAG_KEY, "scenarios");
    }
    onLoaded?.();
  };

  return (
    <div className="min-h-screen bg-mountain-white dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-swiss-red">
            <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red rounded-sm" />
            Step 2 of 4 — Load a baseline
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Start with a typical Web3 team
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            One click loads a realistic mid-stage protocol so you can feel
            how the model reacts before you enter your own numbers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemo}
          className="w-full text-left rounded-panel border-2 border-swiss-red/30 hover:border-swiss-red bg-white dark:bg-card p-6 transition-colors group"
          data-action="load-demo-model"
        >
          <div className="flex items-start gap-4">
            <span className="h-10 w-10 flex-shrink-0 rounded-sm bg-swiss-red flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Mid-stage Web3 Protocol — $7M raise
                </h2>
                <ArrowRight className="h-5 w-5 text-swiss-red flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <Row label="Team size" value="15 people" />
                <Row label="Stable + fiat" value="$5.0M" />
                <Row label="ETH treasury" value="300 ETH" />
                <Row label="Native token" value="100M TAQ @ $0.08" />
                <Row label="Monthly burn" value="$450K" />
                <Row label="Net inflow" value="$34K/mo" />
              </dl>
              <p className="text-xs text-muted-foreground pt-1">
                Covers all 8 burn categories (headcount, infra, legal,
                marketing, token incentives, grants, office, token grants)
                plus staking + protocol revenue inflows.
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-knob-silver/40" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <div className="flex-1 h-px bg-knob-silver/40" />
        </div>

        <div className="flex items-center justify-center">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/setup">
              <Wrench className="h-3.5 w-3.5" />
              Build my own from scratch
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground font-mono uppercase tracking-wide text-[10px]">
        {label}
      </dt>
      <dd className="text-foreground font-mono text-sm">{value}</dd>
    </>
  );
}
