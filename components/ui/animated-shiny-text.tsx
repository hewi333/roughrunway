"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
  baseColor?: string;    // base text color (CSS value)
  shimmerColor?: string; // highlight color swept across the text
}

// Applies a sweeping shimmer highlight over text using background-clip.
// Uses the `animate-shiny-text` keyframe defined in tailwind.config.ts.
// No framer-motion dependency — pure CSS animation.
export function AnimatedShinyText({
  children,
  className,
  baseColor = "#20B8CD",
  shimmerColor = "rgba(255,255,255,0.9)",
}: AnimatedShinyTextProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-shiny-text bg-clip-text text-transparent",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          ${baseColor} 0%,
          ${baseColor} 38%,
          ${shimmerColor} 50%,
          ${baseColor} 62%,
          ${baseColor} 100%
        )`,
        backgroundSize: "200% auto",
      }}
    >
      {children}
    </span>
  );
}
