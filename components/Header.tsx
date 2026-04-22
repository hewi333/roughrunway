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
import { cn } from "@/lib/utils";

export default function Header() {
  const { model, updateModel } = useRoughRunwayStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [modelName, setModelName] = useState(model.name);
  const [isHorizonOpen, setIsHorizonOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

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
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}