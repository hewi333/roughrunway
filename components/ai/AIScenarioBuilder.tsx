"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRoughRunwayStore } from "@/lib/store";
import VoiceInput from "@/components/ai/VoiceInput";
import PoweredByBadge from "@/components/ai/PoweredByBadge";
import type { Scenario, ScenarioOverrides } from "@/lib/types";
import { SCENARIO_COLORS } from "@/lib/constants";
import { v4 as uuidv4 } from "uuid";

// ─── types ────────────────────────────────────────────────────────────────────

interface ParseResult {
  overrides: ScenarioOverrides;
  summary: string;
}

type BuildState = "idle" | "loading" | "done" | "error";

interface AIScenarioBuilderProps {
  onCreated?: (scenario: Scenario) => void;
  onCancel?: () => void;
}

// ─── override preview ─────────────────────────────────────────────────────────

function OverridePreview({ overrides }: { overrides: ScenarioOverrides }) {
  const lines: string[] = [];
  if (overrides.priceOverrides?.length) {
    overrides.priceOverrides.forEach((p) => {
      const val =
        p.type === "percent_change"
          ? `${p.value > 0 ? "+" : ""}${Math.round(p.value * 100)}%`
          : `$${p.value}`;
      lines.push(`Price: ${p.assetId} → ${val}`);
    });
  }
  if (overrides.headcountChange) {
    const hc = overrides.headcountChange;
    lines.push(
      `Headcount: ${hc.count > 0 ? "+" : ""}${hc.count} @ $${hc.costPerHead.toLocaleString()}/mo from month ${hc.startMonth}`
    );
  }
  if (overrides.burnOverrides?.length) {
    overrides.burnOverrides.forEach((b) => {
      if (b.type === "disable") lines.push(`Burn: disable ${b.categoryId}`);
      else if (b.type === "percent_change")
        lines.push(`Burn: ${b.categoryId} ${b.value && b.value > 0 ? "+" : ""}${b.value !== undefined ? Math.round(b.value * 100) : 0}%`);
      else lines.push(`Burn: ${b.categoryId} → $${b.value?.toLocaleString()}`);
    });
  }
  if (overrides.inflowOverrides?.length) {
    overrides.inflowOverrides.forEach((inf) => {
      if (inf.type === "percent_change")
        lines.push(`Inflow: ${inf.categoryId} ${inf.value && inf.value > 0 ? "+" : ""}${inf.value !== undefined ? Math.round(inf.value * 100) : 0}%`);
    });
  }
  if (overrides.additionalBurnEvents?.length) {
    overrides.additionalBurnEvents.forEach((e) =>
      lines.push(`One-off burn: $${e.amount.toLocaleString()} in month ${e.month} (${e.description})`)
    );
  }
  if (overrides.additionalInflowEvents?.length) {
    overrides.additionalInflowEvents.forEach((e) =>
      lines.push(`One-off inflow: $${e.amount.toLocaleString()} in month ${e.month} (${e.description})`)
    );
  }
  if (lines.length === 0) lines.push("No specific overrides detected.");

  return (
    <ul className="text-caption text-muted-foreground space-y-0.5 mt-2">
      {lines.map((l, i) => (
        <li key={i} className="font-mono">
          · {l}
        </li>
      ))}
    </ul>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AIScenarioBuilder({ onCreated, onCancel }: AIScenarioBuilderProps) {
  const { model, updateModel } = useRoughRunwayStore();
  const [prompt, setPrompt] = useState("");
  const [scenarioName, setScenarioName] = useState("");
  const [buildState, setBuildState] = useState<BuildState>("idle");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const build = async () => {
    if (!prompt.trim()) return;
    setBuildState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/parse-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong.");
        setBuildState("error");
        return;
      }

      setResult(json as ParseResult);
      // Pre-fill scenario name from summary
      if (!scenarioName) {
        const firstSentence = json.summary?.split(".")[0] ?? "";
        setScenarioName(firstSentence.slice(0, 60) || "AI Scenario");
      }
      setBuildState("done");
    } catch {
      setErrorMsg("Network error. Check your connection.");
      setBuildState("error");
    }
  };

  const save = () => {
    if (!result) return;
    const scenario: Scenario = {
      id: uuidv4(),
      name: scenarioName.trim() || "AI Scenario",
      color: SCENARIO_COLORS[model.scenarios.length % SCENARIO_COLORS.length],
      createdAt: new Date().toISOString(),
      isActive: false,
      overrides: result.overrides,
    };
    updateModel({ scenarios: [...model.scenarios, scenario] });
    onCreated?.(scenario);
  };

  const reset = () => {
    setBuildState("idle");
    setResult(null);
    setErrorMsg("");
    setScenarioName("");
  };

  return (
    <div className="space-y-3" data-action="ai-scenario-builder">
      {/* Input row */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-caption text-muted-foreground uppercase tracking-wide">
            Describe your scenario
          </label>
          <PoweredByBadge size="sm" />
        </div>
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setPrompt(e.target.value);
              if (buildState !== "idle") reset();
            }}
            placeholder='e.g. "What if we cut 2 engineers and ETH drops to $1500?"'
            className="min-h-[80px] pr-10 resize-none text-body"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) build();
            }}
            disabled={buildState === "loading"}
            data-field="scenario-prompt"
          />
          <div className="absolute bottom-2 right-2">
            <VoiceInput
              onTranscript={(t) => setPrompt((p) => (p ? `${p} ${t}` : t))}
              disabled={buildState === "loading"}
            />
          </div>
        </div>
        <p className="text-placard text-muted-foreground mt-1">
          Tip: reference asset names, amounts, or team size. ⌘↵ to build.
        </p>
      </div>

      {/* Build button */}
      {buildState !== "done" && (
        <Button
          onClick={build}
          disabled={!prompt.trim() || buildState === "loading"}
          className="w-full flex items-center justify-center gap-2"
          data-action="build-scenario-ai"
        >
          {buildState === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Building scenario…
              <span className="text-caption opacity-70">(first call may take ~15s)</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Powered by Perplexity
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {buildState === "error" && (
        <div className="rounded-panel border border-aviation-red/30 bg-aviation-red/5 px-4 py-3 flex items-start justify-between gap-3">
          <p className="text-caption text-aviation-red dark:text-aviation-red-dark">{errorMsg}</p>
          <Button variant="ghost" size="sm" onClick={reset} className="shrink-0 h-7">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Result preview */}
      {buildState === "done" && result && (
        <div className="rounded-panel border border-aviation-green/30 bg-aviation-green/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-aviation-green dark:text-aviation-green-dark shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-foreground">{result.summary}</p>
              <OverridePreview overrides={result.overrides} />
            </div>
          </div>

          {/* Scenario name */}
          <div>
            <label className="text-caption text-muted-foreground">Scenario name</label>
            <input
              className="mt-1 w-full rounded-precise border border-input bg-background px-3 py-1.5 text-body focus:outline-none focus:ring-2 focus:ring-ring"
              value={scenarioName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setScenarioName(e.target.value)
              }
              placeholder="AI Scenario"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={reset}>
              Try again
            </Button>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button size="sm" onClick={save} disabled={!scenarioName.trim()}>
              <Check className="h-4 w-4 mr-1" />
              Save Scenario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
