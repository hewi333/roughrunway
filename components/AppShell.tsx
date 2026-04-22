"use client";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@/lib/hooks";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileInterstitial from "@/components/MobileInterstitial";
import TreasuryPanel from "@/components/TreasuryPanel";
import BurnPanel from "@/components/BurnPanel";
import InflowPanel from "@/components/InflowPanel";
import ScenarioProjectionChart from "@/components/ScenarioProjectionChart";
import RunwaySummaryCards from "@/components/RunwaySummaryCards";
import MonthlyBreakdownTable from "@/components/MonthlyBreakdownTable";
import FooterBrand from "@/components/FooterBrand";
import { useRoughRunwayStore } from "@/lib/store";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [activePanel, setActivePanel] = useState<"treasury" | "burn" | "inflow" | "scenarios">("treasury");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { model } = useRoughRunwayStore();

  if (isMobile) {
    return <MobileInterstitial />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div
        className={`bg-card border-r border-knob-silver dark:border-knob-silver-dark transition-all duration-150 ease-out ${
          isSidebarCollapsed ? "w-20" : "w-80"
        }`}
      >
        <Sidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activePanel === "treasury" && <TreasuryPanel />}
            {activePanel === "burn" && <BurnPanel />}
            {activePanel === "inflow" && <InflowPanel />}
            {activePanel === "scenarios" && <ScenarioProjectionChart />}

            <div className="mt-8">
              <RunwaySummaryCards />
            </div>

            <div className="mt-8">
              <ScenarioProjectionChart />
            </div>

            <div className="mt-8">
              <MonthlyBreakdownTable />
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => window.open("/docs", "_blank")}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </div>
        </main>

        <footer className="border-t border-knob-silver dark:border-knob-silver-dark bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <FooterBrand />
          </div>
        </footer>
      </div>
    </div>
  );
}
