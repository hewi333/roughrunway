"use client";

import React, { useState } from "react";
import { Download, Copy, Link, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportModelJson, generateShareableUrl } from "@/lib/model-export";
import { useRoughRunwayStore } from "@/lib/store";

interface ExportDialogProps {
  onClose: () => void;
}

export default function ExportDialog({ onClose }: ExportDialogProps) {
  const { model } = useRoughRunwayStore();
  const [copied, setCopied] = useState<"json" | "url" | null>(null);

  const copy = async (text: string, key: "json" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked — fall through
    }
  };

  const downloadJson = () => {
    const json = exportModelJson(model);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = model.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "model";
    a.href = url;
    a.download = `roughrunway-${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareUrl = generateShareableUrl(model);
  const jsonText = exportModelJson(model);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Export model"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Export Model</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* Download JSON */}
          <ExportOption
            icon={Download}
            title="Download JSON"
            description="Save a .json file you can re-import later"
            action={downloadJson}
            actionLabel="Download"
          />

          {/* Copy JSON */}
          <ExportOption
            icon={Copy}
            title="Copy JSON"
            description="Copy the raw JSON to your clipboard"
            action={() => copy(jsonText, "json")}
            actionLabel={copied === "json" ? "Copied!" : "Copy"}
            done={copied === "json"}
          />

          {/* Shareable URL */}
          <ExportOption
            icon={Link}
            title="Copy Share Link"
            description="URL with your model encoded in the hash"
            action={() => copy(shareUrl, "url")}
            actionLabel={copied === "url" ? "Copied!" : "Copy URL"}
            done={copied === "url"}
          />
        </div>
      </div>
    </div>
  );
}

// ─── sub-component ────────────────────────────────────────────────────────────

interface ExportOptionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  done?: boolean;
}

function ExportOption({ icon: Icon, title, description, action, actionLabel, done }: ExportOptionProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant={done ? "default" : "outline"}
        className={cn("shrink-0", done && "bg-aviation-green border-aviation-green text-white hover:bg-aviation-green")}
        onClick={action}
      >
        {done && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
        {actionLabel}
      </Button>
    </div>
  );
}
