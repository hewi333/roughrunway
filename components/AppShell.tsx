"use client";

import React, { useState } from "react";
import { useMediaQuery } from "@/lib/hooks";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileInterstitial from "@/components/MobileInterstitial";
import TreasuryPanel from "@/components/TreasuryPanel";
import BurnPanel from "@/components/BurnPanel";
import InflowPanel from "@/components/InflowPanel";
import ScenarioPanel from "@/components/ScenarioPanel";
import ProjectionChart from "@/components/ProjectionChart";
import RunwaySummaryCards from "@/components/RunwaySummaryCards";
import MonthlyBreakdownTable from "@/components/MonthlyBreakdownTable";
import ScenarioComparison from "@/components/ScenarioComparison";
import MarketBanner from "@/components/ai/MarketBanner";
import DemoCoachmark from "@/components/DemoCoachmark";
import FooterBrand from "@/components/FooterBrand";

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [activePanel, setActivePanel] = useState<"treasury" | "burn" | "inflow" | "scenarios">("treasury");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChartCompact, setIsChartCompact] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  if (isMobile) {
    return <MobileInterstitial />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {/* Sidebar */}
      <div
        className={`bg-white dark:bg-panel-dark border-r border-gray-200 dark:border-border transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        <Sidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MarketBanner />
        <DemoCoachmark
          activePanel={activePanel}
          onGoToScenarios={() => setActivePanel("scenarios")}
        />
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Runway top deck — always visible across every panel */}
            <section aria-label="Runway overview" className="space-y-4">
              <RunwaySummaryCards />
              <div
                className="motion-safe:animate-fade-in-up"
                style={{ animationDelay: "240ms" }}
              >
                <ProjectionChart
                  compact={isChartCompact}
                  onToggleCompact={() => setIsChartCompact((v) => !v)}
                />
              </div>
            </section>

            {/* Active editor panel (AI-first, manual below) */}
            <section aria-label="Editor">
              {activePanel === "treasury" && <TreasuryPanel />}
              {activePanel === "burn" && <BurnPanel />}
              {activePanel === "inflow" && <InflowPanel />}
              {activePanel === "scenarios" && <ScenarioPanel />}
            </section>

            {/* Breakdowns */}
            <section aria-label="Breakdowns" className="space-y-8">
              <ScenarioComparison />
              <MonthlyBreakdownTable />
            </section>
          </div>
        </main>

        <footer className="border-t border-gray-200 dark:border-border bg-white dark:bg-panel-dark">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <FooterBrand />
          </div>
        </footer>
      </div>
    </div>
  );
}
