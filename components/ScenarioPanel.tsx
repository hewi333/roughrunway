"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, SlidersHorizontal, Copy, Zap } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { SCENARIO_TEMPLATES, SCENARIO_COLORS } from "@/lib/constants";
import type { Scenario } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import ScenarioEditor from "@/components/ScenarioEditor";

// ─── helpers ──────────────────────────────────────────────────────────────────

function overrideSummary(scenario: Scenario): string {
  const parts: string[] = [];
  const ov = scenario.overrides;
  if (ov.priceOverrides?.length) parts.push(`${ov.priceOverrides.length} price`);
  if (ov.burnOverrides?.length) parts.push(`${ov.burnOverrides.length} burn`);
  if (ov.inflowOverrides?.length) parts.push(`${ov.inflowOverrides.length} inflow`);
  if (ov.liquidityOverrides?.length) parts.push(`${ov.liquidityOverrides.length} liq`);
  if (ov.headcountChange) parts.push("headcount");
  if (ov.additionalBurnEvents?.length) parts.push(`${ov.additionalBurnEvents.length} burn event${ov.additionalBurnEvents.length > 1 ? "s" : ""}`);
  if (ov.additionalInflowEvents?.length) parts.push(`${ov.additionalInflowEvents.length} inflow event${ov.additionalInflowEvents.length > 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" · ") : "No overrides";
}

// ─── template quick-pick ───────────────────────────────────────────────────────

function TemplateGrid({ onPick }: { onPick: (key: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {SCENARIO_TEMPLATES.map((t) => (
        <button
          key={t.key}
          type="button"
          className="text-left p-3 rounded-panel border border-knob-silver dark:border-knob-silver-dark hover:bg-muted transition-colors"
          onClick={() => onPick(t.key)}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2.5 w-2.5 rounded-knob inline-block shrink-0"
              style={{ backgroundColor: t.color }}
            />
            <span className="text-body font-medium text-foreground">{t.name}</span>
          </div>
          <p className="text-caption text-muted-foreground leading-snug">{t.description}</p>
        </button>
      ))}
    </div>
  );
}

// ─── main panel ───────────────────────────────────────────────────────────────

export default function ScenarioPanel() {
  const { model, updateModel } = useRoughRunwayStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editorScenario, setEditorScenario] = useState<Scenario | null>(null);

  // ── mutations ──────────────────────────────────────────────────────────────

  const createFromTemplate = (templateKey: string) => {
    const template = SCENARIO_TEMPLATES.find((t) => t.key === templateKey)!;
    const scenario: Scenario = {
      id: uuidv4(),
      name: template.name,
      color: template.color,
      createdAt: new Date().toISOString(),
      isActive: false,
      templateKey: template.key,
      overrides: template.buildOverrides(model),
    };
    updateModel({ scenarios: [...model.scenarios, scenario] });
    setIsCreating(false);
  };

  const createCustom = () => {
    if (!newName.trim()) return;
    const scenario: Scenario = {
      id: uuidv4(),
      name: newName.trim(),
      color: SCENARIO_COLORS[model.scenarios.length % SCENARIO_COLORS.length],
      createdAt: new Date().toISOString(),
      isActive: false,
      overrides: {},
    };
    updateModel({ scenarios: [...model.scenarios, scenario] });
    setNewName("");
    setIsCreating(false);
    // Open editor immediately so user can set overrides
    setEditorScenario(scenario);
  };

  const toggleActive = (id: string) => {
    const updated = model.scenarios.map((s: Scenario) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    updateModel({ scenarios: updated });
  };

  const duplicate = (scenario: Scenario) => {
    const copy: Scenario = {
      ...scenario,
      id: uuidv4(),
      name: `${scenario.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isActive: false,
      overrides: structuredClone(scenario.overrides),
    };
    updateModel({ scenarios: [...model.scenarios, copy] });
  };

  const remove = (id: string) => {
    updateModel({ scenarios: model.scenarios.filter((s: Scenario) => s.id !== id) });
  };

  const saveNameEdit = (id: string) => {
    if (!editingName.trim()) return;
    updateModel({
      scenarios: model.scenarios.map((s: Scenario) =>
        s.id === id ? { ...s, name: editingName.trim() } : s
      ),
    });
    setEditingId(null);
  };

  return (
    <>
      {/* Editor drawer — rendered outside the panel scroll area */}
      {editorScenario && (
        <ScenarioEditor
          scenario={editorScenario}
          onClose={() => setEditorScenario(null)}
        />
      )}

      <div
        className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6"
        data-action="scenario-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-placard uppercase text-muted-foreground">Section</div>
            <h2 className="text-h3 text-foreground">Scenarios</h2>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            data-action="new-scenario"
          >
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
        </div>

        {/* Create form */}
        {isCreating && (
          <div className="mb-6 p-4 bg-muted rounded-panel border border-knob-silver dark:border-knob-silver-dark space-y-4">
            {/* Quick-pick templates */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-knob-gold" />
                <span className="text-body font-medium text-foreground">Start from template</span>
              </div>
              <TemplateGrid onPick={createFromTemplate} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-knob-silver/40 dark:bg-knob-silver-dark/40" />
              <span className="text-caption text-muted-foreground uppercase tracking-wide">or custom</span>
              <div className="flex-1 h-px bg-knob-silver/40 dark:bg-knob-silver-dark/40" />
            </div>

            {/* Custom name */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="scenario-name" className="text-caption text-muted-foreground">
                  Custom scenario name
                </Label>
                <Input
                  id="scenario-name"
                  value={newName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewName(e.target.value)
                  }
                  placeholder="e.g. Slow Growth, Fundraise Win…"
                  className="mt-1"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") createCustom();
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                  autoFocus
                />
              </div>
              <Button onClick={createCustom} disabled={!newName.trim()}>
                Create &amp; Edit
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Scenario list */}
        {model.scenarios.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-body text-muted-foreground mb-4">No scenarios yet.</p>
            <Button onClick={() => setIsCreating(true)} variant="outline">
              Create Your First Scenario
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {model.scenarios.map((scenario: Scenario) => (
              <div
                key={scenario.id}
                className={`rounded-panel border p-4 transition-colors duration-150 ${
                  scenario.isActive
                    ? "border-primary/60 bg-primary/5"
                    : "border-knob-silver dark:border-knob-silver-dark"
                }`}
                data-scenario-id={scenario.id}
              >
                {/* Row 1: color + name + controls */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="h-4 w-4 rounded-knob shrink-0"
                      style={{ backgroundColor: scenario.color }}
                    />
                    {editingId === scenario.id ? (
                      <Input
                        value={editingName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditingName(e.target.value)
                        }
                        className="h-7 text-body"
                        autoFocus
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === "Enter") saveNameEdit(scenario.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => saveNameEdit(scenario.id)}
                      />
                    ) : (
                      <button
                        type="button"
                        className="text-body font-medium text-foreground hover:underline truncate text-left"
                        onDoubleClick={() => {
                          setEditingId(scenario.id);
                          setEditingName(scenario.name);
                        }}
                        title="Double-click to rename"
                      >
                        {scenario.name}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Edit overrides */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      title="Edit overrides"
                      onClick={() => setEditorScenario(scenario)}
                      data-action="edit-scenario"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>

                    {/* Duplicate */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      title="Duplicate"
                      onClick={() => duplicate(scenario)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => remove(scenario.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-knob-silver/40 dark:border-knob-silver-dark/40">
                      <Switch
                        checked={scenario.isActive}
                        onCheckedChange={() => toggleActive(scenario.id)}
                        aria-label={`Toggle ${scenario.name}`}
                        data-action="toggle-scenario"
                      />
                      <span className="text-caption text-muted-foreground w-12">
                        {scenario.isActive ? "Active" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: override summary */}
                <div className="mt-1.5 flex items-center gap-2 pl-7">
                  <span className="text-caption text-muted-foreground">
                    {overrideSummary(scenario)}
                  </span>
                  {scenario.templateKey && (
                    <span className="text-placard uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-precise">
                      {SCENARIO_TEMPLATES.find((t) => t.key === scenario.templateKey)?.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {model.scenarios.length > 0 && (
          <p className="text-caption text-muted-foreground mt-4">
            Toggle active scenarios to overlay them on the projection chart and compare in the table below.
          </p>
        )}
      </div>
    </>
  );
}
