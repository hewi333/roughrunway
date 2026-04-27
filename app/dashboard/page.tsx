"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import DemoQuickstart from "@/components/DemoQuickstart";
import { useRoughRunwayStore } from "@/lib/store";
import { parseShareableUrl } from "@/lib/model-export";

type View = "loading" | "quickstart" | "app";

export default function DashboardPage() {
  const { setModel } = useRoughRunwayStore();
  const [view, setView] = useState<View>("loading");

  useEffect(() => {
    const decideView = () => {
      // Load model from URL hash if present (shareable links)
      const hash = window.location.hash;
      if (hash.includes("model=")) {
        const imported = parseShareableUrl(hash.slice(1)); // strip leading #
        if (imported) {
          setModel(imported);
          window.history.replaceState(null, "", window.location.pathname);
          setView("app");
          return;
        }
      }

      // Read the model AFTER persist rehydration has completed, otherwise we
      // see the default "Untitled Model" and clobber the user's saved data
      // when they pick a Quickstart option.
      const currentModel = useRoughRunwayStore.getState().model;
      setView(currentModel.name === "Untitled Model" ? "quickstart" : "app");
    };

    if (useRoughRunwayStore.persist.hasHydrated()) {
      decideView();
      return;
    }
    const unsub = useRoughRunwayStore.persist.onFinishHydration(decideView);
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While the hydration check runs, render nothing — prevents a flash of
  // AppShell-with-empty-data before DemoQuickstart mounts (which previously
  // caused the dark-mode e2e test to grab a toggle that then detached).
  if (view === "loading") {
    return <div className="min-h-screen bg-mountain-white dark:bg-background" />;
  }

  if (view === "quickstart") {
    return <DemoQuickstart onLoaded={() => setView("app")} />;
  }

  return <AppShell />;
}
