"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PerplexityLogoProps {
  className?: string;
  monochrome?: boolean;
}

export default function PerplexityLogo({ className, monochrome = false }: PerplexityLogoProps) {
  if (monochrome) {
    return (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Perplexity"
        className={cn("shrink-0", className)}
        fill="currentColor"
      >
        <rect x="11" y="1" width="2" height="22" rx="1" />
        <rect x="1" y="11" width="22" height="2" rx="1" />
        <rect x="11" y="1" width="2" height="22" rx="1" transform="rotate(45 12 12)" />
        <rect x="11" y="1" width="2" height="22" rx="1" transform="rotate(-45 12 12)" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }

  return (
    <Image
      src="/330px-Perplexity_AI_logo.svg.png"
      alt="Perplexity"
      width={24}
      height={24}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
