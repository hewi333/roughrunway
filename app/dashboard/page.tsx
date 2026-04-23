"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import SetupWizard from "@/components/SetupWizard";
import { useRoughRunwayStore } from "@/lib/store";
import { parseShareableUrl } from "@/lib/model-export";

export default function DashboardPage() {
  const { model, setModel } = useRoughRunwayStore();
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Load model from URL hash if present (shareable links)
    const hash = window.location.hash;
    if (hash.includes("model=")) {
      const imported = parseShareableUrl(hash.slice(1)); // strip leading #
      if (imported) {
        setModel(imported);
        // Remove hash from URL so refreshing doesn't reload the shared model
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    }

    // Fall back to setup wizard for brand-new models
    if (model.name === "Untitled Model") {
      setNeedsSetup(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SetupWizard />
      </div>
    );
  }

  return <AppShell />;
}
