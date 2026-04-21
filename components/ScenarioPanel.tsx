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
import { applyScenarioOverrides } from "@/lib/scenario-engine";

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
      ? SCENARIO_TEMPLATES.find(t => t.key === selectedTemplate)
      : null;

    const newScenario: Scenario = {
      id: uuidv4(),
      name: newScenarioName,
      color: template?.color || SCENARIO_COLORS[Math.floor(Math.random() * SCENARIO_COLORS.length)],
      createdAt: new Date().toISOString(),
      isActive: false,
      templateKey: template?.key,
      overrides: template 
        ? template.buildOverrides(model) 
        : {}
    };

    updateModel({
      scenarios: [...model.scenarios, newScenario]
    });

    // Reset form
    setNewScenarioName("");
    setSelectedTemplate("");
    setIsCreating(false);
  };

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    const updatedScenarios = model.scenarios.map(scenario => 
      scenario.id === id ? { ...scenario, ...updates } : scenario
    );
    updateModel({ scenarios: updatedScenarios });
  };

  const deleteScenario = (id: string) => {
    const updatedScenarios = model.scenarios.filter(scenario => scenario.id !== id);
    updateModel({ scenarios: updatedScenarios });
  };

  const toggleScenarioActive = (id: string) => {
    const updatedScenarios = model.scenarios.map(scenario => ({
      ...scenario,
      isActive: scenario.id === id ? !scenario.isActive : false
    }));
    updateModel({ scenarios: updatedScenarios });
  };

  const duplicateScenario = (scenario: Scenario) => {
    const duplicatedScenario: Scenario = {
      ...scenario,
      id: uuidv4(),
      name: `${scenario.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isActive: false
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Scenarios</h2>
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
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenario-name" className="text-sm font-medium">
                Scenario Name
              </Label>
              <Input
                id="scenario-name"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g., Bear Market, Hiring Surge"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="scenario-template" className="text-sm font-medium">
                Template (Optional)
              </Label>
              <select
                id="scenario-template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              >
                <option value="">Custom Scenario</option>
                {SCENARIO_TEMPLATES.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.name} - {template.description}
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
              <Button
                onClick={addScenario}
                disabled={!newScenarioName.trim()}
              >
                Create Scenario
              </Button>
            </div>
          </div>
        </div>
      )}

      {model.scenarios.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No scenarios created yet</p>
          <Button 
            onClick={() => setIsCreating(true)}
            variant="outline"
          >
            Create Your First Scenario
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {model.scenarios.map((scenario) => (
            <div 
              key={scenario.id} 
              className={`border rounded-lg p-4 ${
                scenario.isActive 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: scenario.color }}
                  />
                  {editingScenarioId === scenario.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing(scenario.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
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
                    <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {scenario.templateKey && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {SCENARIO_TEMPLATES.find(t => t.key === scenario.templateKey)?.name}
                    </span>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(scenario)}
                  >
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
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              {scenario.isActive && (
                <div className="mt-3 text-sm text-gray-600">
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