"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  Upload,
  Share2,
  ChevronDown,
  Edit3
} from "lucide-react";
import { useRoughRunwayStore } from "@/lib/store";
import DarkModeToggle from "@/components/DarkModeToggle";
import ImportDialog from "@/components/ImportDialog";
import ExportDialog from "@/components/ExportDialog";
import { generateShareableUrl } from "@/lib/model-export";
import { cn } from "@/lib/utils";

export default function Header() {
  const { model, updateModel } = useRoughRunwayStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [modelName, setModelName] = useState(model.name);
  const [isHorizonOpen, setIsHorizonOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const horizonOptions = [12, 15, 18];
  const currentDate = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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

  const handleShare = async () => {
    const url = generateShareableUrl(model);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard unavailable — open export dialog as fallback
      setShowExport(true);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-panel-dark border-b border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Model Name */}
            <div className="flex items-center space-x-4">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                    className="px-2 py-1 bg-background text-foreground border border-gray-300 dark:border-border rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => setIsEditingName(true)}
                >
                  <h1 className="text-xl font-bold text-gray-900 dark:text-foreground">{model.name}</h1>
                  <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Horizon Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHorizonOpen(!isHorizonOpen)}
                  className="flex items-center space-x-2"
                >
                  <span>{model.projectionMonths} months</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isHorizonOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-panel-dark border border-gray-200 dark:border-border rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {horizonOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleHorizonChange(option as 12 | 15 | 18)}
                          className={cn(
                            "block w-full text-left px-4 py-2 text-sm",
                            model.projectionMonths === option
                              ? "bg-primary text-primary-foreground"
                              : "text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted"
                          )}
                        >
                          {option} months
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Start Date Picker */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDateOpen(!isDateOpen)}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{model.startDate}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isDateOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-panel-dark border border-gray-200 dark:border-border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {months.map((month, index) => {
                        const date = new Date(currentDate.getFullYear(), index, 1);
                        const dateString = date.toISOString().slice(0, 7);
                        return (
                          <button
                            key={month}
                            onClick={() => handleDateChange(index)}
                            className={cn(
                              "block w-full text-left px-4 py-2 text-sm",
                              model.startDate === dateString
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted"
                            )}
                          >
                            {month} {currentDate.getFullYear()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Import */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setShowImport(true)}
                data-action="import-model"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setShowExport(true)}
                data-action="export-model"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>

              {/* Share — direct copy, no dialog */}
              <Button
                variant={shareCopied ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex items-center space-x-2 transition-colors",
                  shareCopied && "bg-aviation-green border-aviation-green text-white hover:bg-aviation-green"
                )}
                onClick={handleShare}
                data-action="share-model"
              >
                <Share2 className="h-4 w-4" />
                <span>{shareCopied ? "Copied!" : "Share"}</span>
              </Button>

              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {showImport && <ImportDialog onClose={() => setShowImport(false)} />}
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
    </>
  );
}
