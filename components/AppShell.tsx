"use client";

import React, { useState, useEffect } from "react";
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
import FundingGapCallout from "@/components/FundingGapCallout";
import MonthlyBreakdownTable from "@/components/MonthlyBreakdownTable";
import ScenarioComparison from "@/components/ScenarioComparison";
import MarketBanner from "@/components/ai/MarketBanner";
import FooterBrand from "@/components/FooterBrand";
import { useRoughRunwayStore } from "@/lib/store";

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [activePanel, setActivePanel] = useState<"treasury" | "burn" | "inflow" | "scenarios">("treasury");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { model } = useRoughRunwayStore();

  // Handle mobile view
  if (isMobile) {
    return <MobileInterstitial />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MarketBanner />
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activePanel === "treasury" && <TreasuryPanel />}
            {activePanel === "burn" && <BurnPanel />}
            {activePanel === "inflow" && <InflowPanel />}
            {activePanel === "scenarios" && <ScenarioPanel />}
            
            {/* Projection visualization - always visible */}
            <div className="mt-8">
              <RunwaySummaryCards />
            </div>

            <div className="mt-4">
              <FundingGapCallout />
            </div>

            <div className="mt-8">
              <ProjectionChart />
            </div>
            
            <div className="mt-8">
              <ScenarioComparison />
            </div>

            <div className="mt-8">
              <MonthlyBreakdownTable />
            </div>
          </div>
        </main>
        
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <FooterBrand />
          </div>
        </footer>
      </div>
    </div>
  );
}