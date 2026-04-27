"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Check, RefreshCw, X, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceInput from "@/components/ai/VoiceInput";
import PoweredByBadge from "@/components/ai/PoweredByBadge";

type State = "idle" | "loading" | "done" | "error";

interface DiffLine {
  label: string;
  type: "added" | "removed" | "changed";
  before?: string;
  after?: string;
}

// ============================================================================
// Money formatting
// ============================================================================

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.?0+$/, "")}K`;
  return `$${n.toLocaleString()}`;
}

// ============================================================================
// Diff computation
// ============================================================================

interface RawStable   { id?: string; name: string; amount: number }
interface RawFiat     { id?: string; currency: string; amount: number }
interface RawVolatile { id?: string; name: string; ticker?: string; quantity: number; currentPrice: number }
interface RawCategory { id?: string; name: string; presetKey?: string; monthlyBaseline: number; isActive?: boolean }

function toArray<T>(x: unknown): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

function computeDiff(
  scope: "treasury" | "burn" | "inflow",
  current: Record<string, unknown>,
  patch: Record<string, unknown>,
): DiffLine[] {
  if (scope === "treasury") return computeTreasuryDiff(current, patch);
  if (scope === "burn")     return computeCategoryDiff(toArray<RawCategory>(current.burnCategories),    toArray<RawCategory>(patch.burnCategories));
  return                           computeCategoryDiff(toArray<RawCategory>(current.inflowCategories),  toArray<RawCategory>(patch.inflowCategories));
}

function computeTreasuryDiff(
  current: Record<string, unknown>,
  patch: Record<string, unknown>,
): DiffLine[] {
  const lines: DiffLine[] = [];

  // ── Stablecoins ──────────────────────────────────────────────────────────
  const cStables = toArray<RawStable>(current.stablecoins);
  const pStables = toArray<RawStable>(patch.stablecoins);
  const matchedStableIds = new Set<string>();

  for (const p of pStables) {
    const c = cStables.find(
      (s) => (p.id && s.id === p.id) || s.name.toLowerCase() === p.name.toLowerCase()
    );
    if (c) {
      matchedStableIds.add(c.id ?? c.name);
      if (Math.abs(c.amount - p.amount) > 0.01) {
        lines.push({ label: p.name, type: "changed", before: fmt(c.amount), after: fmt(p.amount) });
      }
    } else {
      lines.push({ label: p.name, type: "added", after: fmt(p.amount) });
    }
  }
  for (const c of cStables) {
    if (!matchedStableIds.has(c.id ?? c.name)) {
      lines.push({ label: c.name, type: "removed", before: fmt(c.amount) });
    }
  }

  // ── Fiat ─────────────────────────────────────────────────────────────────
  const cFiat = toArray<RawFiat>(current.fiat);
  const pFiat = toArray<RawFiat>(patch.fiat);
  const matchedFiatIds = new Set<string>();

  for (const p of pFiat) {
    const c = cFiat.find((f) => (p.id && f.id === p.id) || f.currency === p.currency);
    if (c) {
      matchedFiatIds.add(c.id ?? c.currency);
      if (Math.abs(c.amount - p.amount) > 0.01) {
        lines.push({ label: `${p.currency} (fiat)`, type: "changed", before: fmt(c.amount), after: fmt(p.amount) });
      }
    } else {
      lines.push({ label: `${p.currency} (fiat)`, type: "added", after: fmt(p.amount) });
    }
  }
  for (const c of cFiat) {
    if (!matchedFiatIds.has(c.id ?? c.currency)) {
      lines.push({ label: `${c.currency} (fiat)`, type: "removed", before: fmt(c.amount) });
    }
  }

  // ── Volatile assets ───────────────────────────────────────────────────────
  const cVols = toArray<RawVolatile>(current.volatileAssets);
  const pVols = toArray<RawVolatile>(patch.volatileAssets);
  const matchedVolIds = new Set<string>();

  for (const p of pVols) {
    const c = cVols.find(
      (v) =>
        (p.id && v.id === p.id) ||
        v.name.toLowerCase() === p.name.toLowerCase() ||
        (p.ticker && v.ticker?.toLowerCase() === p.ticker.toLowerCase())
    );
    const label = p.ticker || p.name;
    if (c) {
      matchedVolIds.add(c.id ?? c.name);
      const parts: string[] = [];
      if (Math.abs(c.quantity - p.quantity) > 0.0001) {
        parts.push(`qty ${c.quantity.toLocaleString()} → ${p.quantity.toLocaleString()}`);
      }
      if (p.currentPrice > 0 && Math.abs(c.currentPrice - p.currentPrice) > 0.01) {
        parts.push(`price ${fmt(c.currentPrice)} → ${fmt(p.currentPrice)}`);
      }
      if (parts.length > 0) {
        lines.push({ label, type: "changed", after: parts.join(", ") });
      }
    } else {
      lines.push({
        label,
        type: "added",
        after: `${p.quantity.toLocaleString()} @ ${p.currentPrice > 0 ? fmt(p.currentPrice) : "price TBD"}`,
      });
    }
  }
  for (const c of cVols) {
    const matched =
      pVols.some((p) => p.id && p.id === c.id) ||
      pVols.some((p) => p.name.toLowerCase() === c.name.toLowerCase()) ||
      (c.ticker ? pVols.some((p) => p.ticker?.toLowerCase() === c.ticker?.toLowerCase()) : false);
    if (!matched) {
      lines.push({ label: c.ticker || c.name, type: "removed", before: `${c.quantity.toLocaleString()} @ ${fmt(c.currentPrice)}` });
    }
  }

  return lines;
}

function computeCategoryDiff(
  cCats: RawCategory[],
  pCats: RawCategory[],
): DiffLine[] {
  const lines: DiffLine[] = [];
  const matchedIds = new Set<string>();

  for (const p of pCats) {
    const c = cCats.find(
      (cat) =>
        (p.id && cat.id === p.id) ||
        (p.presetKey && cat.presetKey === p.presetKey) ||
        cat.name.toLowerCase() === p.name.toLowerCase()
    );
    if (c) {
      matchedIds.add(c.id ?? c.name);
      const wasActive = c.isActive !== false;
      const isActive  = p.isActive !== false;
      if (!isActive && wasActive) {
        lines.push({ label: c.name, type: "removed", before: fmt(c.monthlyBaseline) + "/mo" });
      } else if (isActive && Math.abs(c.monthlyBaseline - p.monthlyBaseline) > 0.01) {
        lines.push({ label: c.name, type: "changed", before: fmt(c.monthlyBaseline) + "/mo", after: fmt(p.monthlyBaseline) + "/mo" });
      }
    } else {
      if (p.isActive !== false) {
        lines.push({ label: p.name, type: "added", after: fmt(p.monthlyBaseline) + "/mo" });
      }
    }
  }
  for (const c of cCats) {
    const key = c.id ?? c.name;
    if (!matchedIds.has(key) && c.isActive !== false) {
      lines.push({ label: c.name, type: "removed", before: fmt(c.monthlyBaseline) + "/mo" });
    }
  }

  return lines;
}

// ============================================================================
// Diff line renderer
// ============================================================================

function DiffLineRow({ line }: { line: DiffLine }) {
  if (line.type === "added") {
    return (
      <div className="flex items-start gap-2 rounded px-2 py-1 bg-aviation-green/10 text-aviation-green dark:text-aviation-green-dark">
        <Plus className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span className="text-caption font-medium">{line.label}</span>
        {line.after && <span className="text-caption ml-auto">{line.after}</span>}
      </div>
    );
  }
  if (line.type === "removed") {
    return (
      <div className="flex items-start gap-2 rounded px-2 py-1 bg-aviation-red/10 text-aviation-red dark:text-aviation-red-dark">
        <Minus className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span className="text-caption font-medium">{line.label}</span>
        {line.before && <span className="text-caption ml-auto line-through opacity-70">{line.before}</span>}
      </div>
    );
  }
  // changed
  return (
    <div className="flex items-start gap-2 rounded px-2 py-1 bg-perplexity/10">
      <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-perplexity" />
      <span className="text-caption font-medium text-foreground">{line.label}</span>
      <span className="text-caption ml-auto flex items-center gap-1 text-muted-foreground">
        {line.before && <span className="line-through">{line.before}</span>}
        {line.before && line.after && <ArrowRight className="h-3 w-3" />}
        {line.after && <span className="text-foreground font-medium">{line.after}</span>}
      </span>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

// The `TPatch` generic is a hint for the caller; the component itself passes
// the raw server payload through to `onApply`, where the caller MUST validate
// it (see lib/patch-validators.ts) before mutating the store.
interface DescribeEditProps<TPatch> {
  scope: "treasury" | "burn" | "inflow";
  current: Record<string, unknown>;
  label: string;
  placeholder: string;
  onApply: (patch: unknown) => void;
  // Phantom param so inference works at call sites.
  _typeHint?: TPatch;
}

export default function DescribeEdit<TPatch = unknown>({
  scope,
  current,
  label,
  placeholder,
  onApply,
}: DescribeEditProps<TPatch>) {
  const [prompt, setPrompt]     = useState("");
  const [state, setState]       = useState<State>("idle");
  const [summary, setSummary]   = useState("");
  const [patch, setPatch]       = useState<unknown>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setState("idle");
    setSummary("");
    setPatch(null);
    setErrorMsg("");
    // prompt is intentionally preserved so the user can refine and retry
  };

  const run = async () => {
    if (!prompt.trim()) return;
    setState("loading");
    setSummary("");
    setPatch(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/ai/parse-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, scope, current }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong.");
        setState("error");
        return;
      }
      setSummary(json.summary ?? "");
      setPatch(json.patch);
      setState("done");
    } catch {
      setErrorMsg("Network error. Check your connection.");
      setState("error");
    }
  };

  const apply = () => {
    if (!patch) return;
    onApply(patch);
    setPrompt("");
    reset();
  };

  const diffLines: DiffLine[] =
    state === "done" && patch !== null
      ? computeDiff(scope, current, patch as Record<string, unknown>)
      : [];

  return (
    <div
      className="rounded-panel border border-perplexity/40 bg-perplexity/5 p-4 space-y-3"
      data-action={`describe-edit-${scope}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-perplexity" />
          <span className="text-body font-medium text-foreground">{label}</span>
        </div>
        <PoweredByBadge size="sm" />
      </div>

      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setPrompt(e.target.value);
            if (state !== "idle") reset();
          }}
          placeholder={placeholder}
          className="min-h-[70px] pr-10 resize-none text-body bg-background"
          disabled={state === "loading"}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
          }}
          data-field={`${scope}-edit-prompt`}
        />
        <div className="absolute bottom-2 right-2">
          <VoiceInput
            onTranscript={(t) => setPrompt((p) => (p ? `${p} ${t}` : t))}
            disabled={state === "loading"}
          />
        </div>
      </div>

      {state !== "done" && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-placard text-muted-foreground">Or speak it. ⌘↵ to run.</span>
          <Button
            onClick={run}
            disabled={!prompt.trim() || state === "loading"}
            size="sm"
            className="flex items-center gap-1.5"
            data-action={`run-edit-${scope}`}
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Parsing…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Powered by Perplexity
              </>
            )}
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-panel border border-aviation-red/30 bg-aviation-red/5 px-3 py-2 flex items-start justify-between gap-3">
          <p className="text-caption text-aviation-red dark:text-aviation-red-dark">{errorMsg}</p>
          <Button variant="ghost" size="sm" onClick={reset} className="shrink-0 h-7">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {state === "done" && patch !== null && (
        <div className="rounded-panel border border-aviation-green/30 bg-aviation-green/5 p-3 space-y-2">
          {/* AI summary */}
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-aviation-green dark:text-aviation-green-dark shrink-0 mt-0.5" />
            <p className="text-caption text-muted-foreground flex-1">{summary}</p>
          </div>

          {/* Diff preview */}
          {diffLines.length > 0 ? (
            <div className="space-y-1 mt-1">
              {diffLines.map((line, i) => (
                <DiffLineRow key={i} line={line} />
              ))}
            </div>
          ) : (
            <p className="text-caption text-muted-foreground pl-6 italic">
              No changes detected — try rephrasing if this looks wrong.
            </p>
          )}

          <div className="flex items-center gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="h-3.5 w-3.5 mr-1" />
              Try again
            </Button>
            <Button size="sm" onClick={apply}>
              <Check className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
