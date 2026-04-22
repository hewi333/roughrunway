"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  Upload,
  Share2,
  ChevronDown,
  Edit3,
  BookOpen,
} from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import DarkModeToggle from "@/components/DarkModeToggle";
import { exportModel, importModel, generateShareableUrl } from "@/lib/model-export";
import { cn } from "@/lib/utils";

export default function Header() {
  const { model, updateModel, setModel } = useRoughRunwayStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [modelName, setModelName] = useState(model.name);
  const [isHorizonOpen, setIsHorizonOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState("");

  const horizonOptions = [12, 15, 18];
  const currentDate = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handleNameSave = () => {
    updateModel({ name: modelName });
    setIsEditingName(false);
  };

  const handleHorizonChange = (months: 12 | 15 | 18) => {
    updateModel({ projectionMonths: months });
    setIsHorizonOpen(false);
  };

  const handleDateChange = (month: number) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    const dateString = newDate.toISOString().slice(0, 7);
    updateModel({ startDate: dateString });
    setIsDateOpen(false);
  };

  const handleExport = () => {
    const compressed = exportModel(model);
    const blob = new Blob([compressed], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${model.name.replace(/\s+/g, "-").toLowerCase()}-roughrunway-export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const url = generateShareableUrl(model);
    navigator.clipboard.writeText(url).then(() => {
      alert("Shareable URL copied to clipboard!");
    });
  };

  const handleImport = () => {
    const importedModel = importModel(importData);
    if (importedModel) {
      setModel(importedModel);
      setIsImporting(false);
      setImportData("");
    } else {
      alert("Failed to import model. Please check the data and try again.");
    }
  };

  return (
    <header className="bg-card border-b border-knob-silver dark:border-knob-silver-dark">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                  className="px-2 py-1 border border-input rounded-precise text-h3 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            ) : (
              <div
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => setIsEditingName(true)}
              >
                <div className="flex flex-col">
                  <span className="text-placard uppercase text-muted-foreground">Model</span>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-h2 font-bold text-foreground">{model.name}</h1>
                    <Edit3 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHorizonOpen(!isHorizonOpen)}
                className="flex items-center space-x-2"
              >
                <span className="font-mono">{model.projectionMonths}</span>
                <span>months</span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {isHorizonOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-popover text-popover-foreground border border-knob-silver dark:border-knob-silver-dark rounded-panel shadow-md z-10">
                  <div className="py-1">
                    {horizonOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleHorizonChange(option as any)}
                        className={cn(
                          "block w-full text-left px-4 py-2 text-body",
                          model.projectionMonths === option
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="font-mono">{option}</span> months
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="font-mono">{model.startDate}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {isDateOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground border border-knob-silver dark:border-knob-silver-dark rounded-panel shadow-md z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {months.map((month, index) => {
                      const date = new Date(currentDate.getFullYear(), index, 1);
                      const dateString = date.toISOString().slice(0, 7);
                      return (
                        <button
                          key={month}
                          onClick={() => handleDateChange(index)}
                          className={cn(
                            "block w-full text-left px-4 py-2 text-body",
                            model.startDate === dateString
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          {month} <span className="font-mono">{currentDate.getFullYear()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("/docs", "_blank")}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Docs</span>
              </Button>

              <DarkModeToggle />

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setIsImporting(true)}
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6 w-full max-w-md shadow-md">
            <h2 className="text-h3 text-foreground mb-4">Import Model</h2>
            <p className="text-body text-muted-foreground mb-4">
              Paste the exported model data below:
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 border border-input bg-background rounded-precise p-2 text-body font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Paste exported model data here..."
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImporting(false);
                  setImportData("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importData.trim()}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
