"use client";

import React from "react";
import PerplexityLogo from "@/components/ai/PerplexityLogo";
import { cn } from "@/lib/utils";

interface PoweredByBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export default function PoweredByBadge({ className, size = "sm" }: PoweredByBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-perplexity-teal",
        size === "sm" && "text-placard",
        size === "md" && "text-caption",
        className
      )}
      aria-label="Powered by Perplexity"
    >
      <PerplexityLogo
        className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
      />
      Perplexity
    </span>
  );
}
