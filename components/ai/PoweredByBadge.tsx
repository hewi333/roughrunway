"use client";

import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PoweredByBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export default function PoweredByBadge({ className, size = "sm" }: PoweredByBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium text-perplexity",
        size === "sm" && "text-placard",
        size === "md" && "text-caption",
        className
      )}
      aria-label="Powered by Perplexity"
    >
      <Zap
        className={cn(
          "shrink-0",
          size === "sm" && "h-2.5 w-2.5",
          size === "md" && "h-3 w-3"
        )}
        aria-hidden="true"
      />
      Perplexity
    </span>
  );
}
