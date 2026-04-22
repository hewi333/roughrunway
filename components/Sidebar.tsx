"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activePanel: "treasury" | "burn" | "inflow" | "scenarios";
  setActivePanel: (panel: "treasury" | "burn" | "inflow" | "scenarios") => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activePanel,
  setActivePanel,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const navItems = [
    { id: "treasury", label: "Treasury", icon: Wallet },
    { id: "burn", label: "Burn", icon: TrendingDown },
    { id: "inflow", label: "Inflows", icon: TrendingUp },
    { id: "scenarios", label: "Scenarios", icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full">
      {!isCollapsed && (
        <div className="px-6 pt-6 pb-4">
          <div className="text-placard uppercase text-muted-foreground">Rough Runway</div>
          <div className="text-caption text-muted-foreground mt-1">Flight instruments</div>
        </div>
      )}

      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-4" aria-label="Main navigation">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePanel(item.id as any)}
                  className={cn(
                    "w-full flex items-center rounded-precise px-3 py-2 text-left text-body font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
