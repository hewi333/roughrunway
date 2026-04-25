"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import DemoQuickstart from "@/components/DemoQuickstart";
import { useRoughRunwayStore } from "@/lib/store";
import { parseShareableUrl } from "@/lib/model-export";

export default function DashboardPage() {
  const { model, setModel } = useRoughRunwayStore();
  const [needsQuickstart, setNeedsQuickstart] = useState(false);

  useEffect(() => {
    // Load model from URL hash if present (shareable links)
    const hash = window.location.hash;
    if (hash.includes("model=")) {
      const imported = parseShareableUrl(hash.slice(1)); // strip leading #
      if (imported) {
        setModel(imported);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    }

    // Fresh visitor (or persisted state was cleared by version bump):
    // show the demo Quickstart card. Manual builders can still use /setup.
    if (model.name === "Untitled Model") {
      setNeedsQuickstart(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (needsQuickstart) {
    return <DemoQuickstart onLoaded={() => setNeedsQuickstart(false)} />;
  }

  return <AppShell />;
}
