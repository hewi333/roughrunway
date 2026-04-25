"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceInput from "@/components/ai/VoiceInput";
import PoweredByBadge from "@/components/ai/PoweredByBadge";

type State = "idle" | "loading" | "done" | "error";

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
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<State>("idle");
  const [summary, setSummary] = useState("");
  const [patch, setPatch] = useState<unknown>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setState("idle");
    setSummary("");
    setPatch(null);
    setErrorMsg("");
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
          <span className="text-placard text-muted-foreground">
            Or speak it. ⌘↵ to run.
          </span>
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
                Apply with Perplexity
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
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-aviation-green dark:text-aviation-green-dark shrink-0 mt-0.5" />
            <p className="text-body text-foreground flex-1">{summary}</p>
          </div>
          <p className="text-caption text-muted-foreground pl-6">
            This will replace the current {scope === "treasury" ? "treasury" : "burn categories"} with the AI&apos;s interpretation. Review the summary, then apply.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="h-3.5 w-3.5 mr-1" />
              Discard
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
