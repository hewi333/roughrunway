"use client";

import React, { useRef, useState } from "react";
import { Upload, Link, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { importModel, importModelFromJson, parseShareableUrl } from "@/lib/model-export";
import { useRoughRunwayStore } from "@/lib/store";
import { RoughRunwayModel } from "@/lib/types";

interface ImportDialogProps {
  onClose: () => void;
}

type Tab = "file" | "json" | "url";

export default function ImportDialog({ onClose }: ImportDialogProps) {
  const { setModel } = useRoughRunwayStore();
  const [tab, setTab] = useState<Tab>("file");
  const [jsonText, setJsonText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyModel = (model: RoughRunwayModel) => {
    setModel(model);
    setSuccess(true);
    setTimeout(onClose, 800);
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      setError("Please select a .json file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const model = importModelFromJson(text);
      if (!model) {
        setError("Could not parse this file. Make sure it's a RoughRunway export.");
        return;
      }
      applyModel(model);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleJsonImport = () => {
    setError(null);
    const model = importModelFromJson(jsonText.trim());
    if (!model) {
      setError("Could not parse JSON. Make sure it's a valid RoughRunway export.");
      return;
    }
    applyModel(model);
  };

  const handleUrlImport = () => {
    setError(null);
    const model = parseShareableUrl(urlText.trim());
    if (!model) {
      setError("Could not decode this URL. Make sure it's a valid RoughRunway share link.");
      return;
    }
    applyModel(model);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Import model"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-background border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Import Model</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5">
          {([
            { id: "file" as Tab, icon: Upload, label: "File" },
            { id: "json" as Tab, icon: FileText, label: "Paste JSON" },
            { id: "url" as Tab, icon: Link, label: "Share URL" },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setError(null); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors",
                tab === id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {tab === "file" && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground font-medium">Drop a .json file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          )}

          {tab === "json" && (
            <div className="space-y-3">
              <textarea
                className="w-full h-48 px-3 py-2 text-xs font-mono bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder='{ "format": "roughrunway", "version": 1, ... }'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck={false}
              />
              <Button
                className="w-full"
                onClick={handleJsonImport}
                disabled={!jsonText.trim() || success}
              >
                Import
              </Button>
            </div>
          )}

          {tab === "url" && (
            <div className="space-y-3">
              <input
                type="url"
                className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                placeholder="https://…/dashboard#model=…"
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleUrlImport}
                disabled={!urlText.trim() || success}
              >
                Load from URL
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-aviation-green dark:text-aviation-green-dark">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Model loaded successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
