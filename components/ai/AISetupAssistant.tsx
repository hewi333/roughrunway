"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRoughRunwayStore } from "@/lib/store";
import VoiceInput from "@/components/ai/VoiceInput";
import PoweredByBadge from "@/components/ai/PoweredByBadge";
import { v4 as uuidv4 } from "uuid";

interface AISetupAssistantProps {
  onApplied?: () => void;
}

type SetupState = "idle" | "loading" | "done" | "error";

export default function AISetupAssistant({ onApplied }: AISetupAssistantProps) {
  const { model, setModel } = useRoughRunwayStore();
  const [prompt, setPrompt] = useState("");
  const [setupState, setSetupState] = useState<SetupState>("idle");
  const [summary, setSummary] = useState("");
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const build = async () => {
    if (!prompt.trim()) return;
    setSetupState("loading");
    setSummary("");
    setParsed(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/parse-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong.");
        setSetupState("error");
        return;
      }
      setSummary(json.summary ?? "");
      setParsed(json);
      setSetupState("done");
    } catch {
      setErrorMsg("Network error. Check your connection.");
      setSetupState("error");
    }
  };

  const apply = () => {
    if (!parsed) return;

    // Merge parsed fields with the current model defaults, generating IDs for arrays
    const p = parsed as any;
    const now = new Date().toISOString();

    const stablecoins = (p.treasury?.stablecoins ?? []).map((s: any) => ({
      id: uuidv4(),
      name: s.name,
      amount: s.amount,
    }));
    const fiat = (p.treasury?.fiat ?? []).map((f: any) => ({
      id: uuidv4(),
      currency: f.currency ?? "USD",
      amount: f.amount,
    }));
    const volatileAssets = (p.treasury?.volatileAssets ?? []).map((a: any, i: number) => ({
      id: uuidv4(),
      name: a.name,
      ticker: a.ticker,
      tier: a.tier ?? "alt",
      quantity: a.quantity,
      currentPrice: a.currentPrice ?? 0,
      priceSource: "manual" as const,
      liquidationPriority: a.liquidationPriority ?? (i + 1) * 10,
      liquidity: {
        maxSellUnit: "tokens" as const,
        maxSellPerMonth: a.quantity * 0.05,
        haircutPercent: a.haircutPercent ?? (a.tier === "major" ? 2 : a.tier === "native" ? 15 : 10),
        priceAssumption: "constant" as const,
      },
    }));

    const burnCategories = (p.burnCategories ?? []).map((c: any) => ({
      id: uuidv4(),
      name: c.name ?? c.presetKey ?? "Custom",
      type: c.presetKey ? "preset" : "custom",
      presetKey: c.presetKey,
      monthlyBaseline: c.monthlyBaseline,
      currency: "fiat" as const,
      growthRate: c.growthRate ?? 0,
      adjustments: [],
      isActive: true,
    }));

    const inflowCategories = (p.inflowCategories ?? []).map((c: any) => ({
      id: uuidv4(),
      name: c.name ?? c.presetKey ?? "Custom",
      type: c.presetKey ? "preset" : "custom",
      presetKey: c.presetKey,
      monthlyBaseline: c.monthlyBaseline,
      growthRate: c.growthRate ?? 0,
      adjustments: [],
      isActive: true,
    }));

    setModel({
      ...model,
      id: uuidv4(),
      name: p.name ?? "New Model",
      createdAt: now,
      updatedAt: now,
      projectionMonths: p.projectionMonths ?? 12,
      startDate: p.startDate ?? new Date().toISOString().slice(0, 7),
      baseCurrency: "USD",
      extendedRunwayEnabled: true,
      treasury: { stablecoins, fiat, volatileAssets },
      burnCategories:
        burnCategories.length > 0 ? burnCategories : model.burnCategories,
      inflowCategories:
        inflowCategories.length > 0 ? inflowCategories : model.inflowCategories,
      scenarios: [],
    });

    onApplied?.();
  };

  const reset = () => {
    setSetupState("idle");
    setSummary("");
    setParsed(null);
    setErrorMsg("");
  };

  return (
    <div className="space-y-4" data-action="ai-setup-assistant">
      <div className="flex items-center justify-between">
        <p className="text-body font-medium text-foreground">
          Describe your treasury in plain English
        </p>
        <PoweredByBadge size="md" />
      </div>

      {/* Input */}
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setPrompt(e.target.value);
            if (setupState !== "idle") reset();
          }}
          placeholder={
            "e.g. \"We're a 12-person DeFi lab with $2M in USDC, 10M native tokens at $0.15, and 50 ETH. Burning ~$180K/month mostly on headcount.\""
          }
          className="min-h-[100px] pr-10 resize-none text-body"
          disabled={setupState === "loading"}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) build();
          }}
          data-field="setup-prompt"
        />
        <div className="absolute bottom-2 right-2">
          <VoiceInput
            onTranscript={(t) => setPrompt((p) => (p ? `${p} ${t}` : t))}
            disabled={setupState === "loading"}
          />
        </div>
      </div>

      {/* Build button */}
      {setupState !== "done" && (
        <Button
          onClick={build}
          disabled={!prompt.trim() || setupState === "loading"}
          className="w-full flex items-center justify-center gap-2"
          data-action="build-setup-ai"
        >
          {setupState === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing your treasury… (may take ~20s on first call)
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Set up with Perplexity
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {setupState === "error" && (
        <div className="rounded-panel border border-aviation-red/30 bg-aviation-red/5 px-4 py-3 flex items-start justify-between gap-3">
          <p className="text-caption text-aviation-red dark:text-aviation-red-dark">{errorMsg}</p>
          <Button variant="ghost" size="sm" onClick={reset} className="shrink-0 h-7">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Preview */}
      {setupState === "done" && summary && (
        <div className="rounded-panel border border-aviation-green/30 bg-aviation-green/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-aviation-green dark:text-aviation-green-dark shrink-0 mt-0.5" />
            <p className="text-body text-foreground">{summary}</p>
          </div>
          <p className="text-caption text-muted-foreground">
            Review looks right? Click Apply to load this model. Your existing data will be replaced.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={reset}>
              Try again
            </Button>
            <Button size="sm" onClick={apply}>
              <Check className="h-4 w-4 mr-1" />
              Apply Model
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
