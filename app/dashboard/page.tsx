"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import SetupWizard from "@/components/SetupWizard";
import { useRoughRunwayStore } from "@/lib/store";

export default function DashboardPage() {
  const { model } = useRoughRunwayStore();
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (model.name === "Untitled Model") {
      setNeedsSetup(true);
    }
  }, [model.name]);

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SetupWizard />
      </div>
    );
  }

  return <AppShell />;
}
