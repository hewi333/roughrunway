"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import SetupWizard from "@/components/SetupWizard";
import { useRoughRunwayStore } from "@/lib/store";

export default function DashboardPage() {
  const { model } = useRoughRunwayStore();
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check if the user has completed the initial setup
    // For now, we'll just check if the model name is the default
    if (model.name === "Untitled Model") {
      setNeedsSetup(true);
    }
  }, [model.name]);

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SetupWizard />
      </div>
    );
  }

  return <AppShell />;
}