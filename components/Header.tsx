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
  BookOpen
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
    const dateString = newDate.toISOString().slice(0, 7); // YYYY-MM
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
    <header className="bg-white border-b border-gray-200">
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
                  className="px-2 py-1 border border-gray-300 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => setIsEditingName(true)}
              >
                <h1 className="text-xl font-bold text-gray-900">{model.name}</h1>
                <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
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
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {horizonOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleHorizonChange(option as any)}
                        className={cn(
                          "block w-full text-left px-4 py-2 text-sm",
                          model.projectionMonths === option
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100"
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
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
                              : "text-gray-700 hover:bg-gray-100"
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('/docs', '_blank')}
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

      {/* Import Modal */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Import Model</h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste the exported model data below:
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-md p-2 text-sm"
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