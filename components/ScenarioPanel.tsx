"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit3, Play, Copy } from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import { SCENARIO_TEMPLATES, SCENARIO_COLORS } from "@/lib/constants";
import { Scenario } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export default function ScenarioPanel() {
  const { model, updateModel } = useRoughRunwayStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const addScenario = () => {
    if (!newScenarioName.trim()) return;

    const template = selectedTemplate
      ? SCENARIO_TEMPLATES.find((t) => t.key === selectedTemplate)
      : null;

    const newScenario: Scenario = {
      id: uuidv4(),
      name: newScenarioName,
      color:
        template?.color ||
        SCENARIO_COLORS[Math.floor(Math.random() * SCENARIO_COLORS.length)],
      createdAt: new Date().toISOString(),
      isActive: false,
      templateKey: template?.key,
      overrides: template ? template.buildOverrides(model) : {},
    };

    updateModel({
      scenarios: [...model.scenarios, newScenario],
    });

    setNewScenarioName("");
    setSelectedTemplate("");
    setIsCreating(false);
  };

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    const updatedScenarios = model.scenarios.map((scenario) =>
      scenario.id === id ? { ...scenario, ...updates } : scenario
    );
    updateModel({ scenarios: updatedScenarios });
  };

  const deleteScenario = (id: string) => {
    const updatedScenarios = model.scenarios.filter((scenario) => scenario.id !== id);
    updateModel({ scenarios: updatedScenarios });
  };

  const toggleScenarioActive = (id: string) => {
    const updatedScenarios = model.scenarios.map((scenario) => ({
      ...scenario,
      isActive: scenario.id === id ? !scenario.isActive : false,
    }));
    updateModel({ scenarios: updatedScenarios });
  };

  const duplicateScenario = (scenario: Scenario) => {
    const duplicatedScenario: Scenario = {
      ...scenario,
      id: uuidv4(),
      name: `${scenario.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isActive: false,
    };
    updateModel({ scenarios: [...model.scenarios, duplicatedScenario] });
  };

  const startEditing = (scenario: Scenario) => {
    setEditingScenarioId(scenario.id);
    setEditingName(scenario.name);
  };

  const saveEditing = (id: string) => {
    updateScenario(id, { name: editingName });
    setEditingScenarioId(null);
    setEditingName("");
  };

  const cancelEditing = () => {
    setEditingScenarioId(null);
    setEditingName("");
  };

  return (
    <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6">
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
        >
          <Plus className="h-4 w-4" />
          Add Scenario
        </Button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-muted rounded-panel border border-knob-silver dark:border-knob-silver-dark">
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g., Bear Market, Hiring Surge"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="scenario-template">Template (Optional)</Label>
              <select
                id="scenario-template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full rounded-precise border border-input bg-background py-2 px-3 text-body focus:outline-none focus:ring-2 focus:ring-ring mt-1"
              >
                <option value="">Custom Scenario</option>
                {SCENARIO_TEMPLATES.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.name} — {template.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewScenarioName("");
                  setSelectedTemplate("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={addScenario} disabled={!newScenarioName.trim()}>
                Create Scenario
              </Button>
            </div>
          </div>
        </div>
      )}

      {model.scenarios.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-body text-muted-foreground mb-4">No scenarios created yet</p>
          <Button onClick={() => setIsCreating(true)} variant="outline">
            Create Your First Scenario
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {model.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`border rounded-panel p-4 transition-colors duration-150 ${
                scenario.isActive
                  ? "border-primary bg-primary/5"
                  : "border-knob-silver dark:border-knob-silver-dark hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-knob"
                    style={{ backgroundColor: scenario.color }}
                  />
                  {editingScenarioId === scenario.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing(scenario.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveEditing(scenario.id)}
                        disabled={!editingName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-body font-medium text-foreground">{scenario.name}</h3>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {scenario.templateKey && (
                    <span className="text-placard uppercase bg-muted text-muted-foreground px-2 py-1 rounded-precise">
                      {SCENARIO_TEMPLATES.find((t) => t.key === scenario.templateKey)?.name}
                    </span>
                  )}

                  <Button size="sm" variant="ghost" onClick={() => startEditing(scenario)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateScenario(scenario)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant={scenario.isActive ? "default" : "outline"}
                    onClick={() => toggleScenarioActive(scenario.id)}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-4 w-4" />
                    {scenario.isActive ? "Active" : "Run"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteScenario(scenario.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {scenario.isActive && (
                <div className="mt-3 text-body text-muted-foreground">
                  <p>This scenario is currently active and will be included in projections.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
