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
      <div
        className={cn(
          "flex items-center border-b border-gray-200 dark:border-border",
          isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-3"
        )}
      >
        {!isCollapsed && (
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
              Rough Runway
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 p-0 shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <nav
        className={cn("flex-1 py-2", isCollapsed ? "px-2" : "px-2")}
        aria-label="Main navigation"
      >
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePanel(item.id as any)}
                  className={cn(
                    "w-full flex items-center rounded-precise text-left text-sm font-medium transition-colors duration-150",
                    isCollapsed ? "justify-center px-2 py-2" : "justify-start px-2.5 py-1.5",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn("h-4 w-4 shrink-0", isCollapsed ? "" : "mr-2.5")}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
