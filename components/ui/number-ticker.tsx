"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
}

// Animates an integer from its previous value to `value` using an ease-out
// cubic RAF loop. On first mount it counts up from 0, giving a premium
// "instrument coming online" reveal. On subsequent value changes it animates
// from wherever it currently sits.
export function NumberTicker({
  value,
  duration = 700,
  className,
}: NumberTickerProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const displayedRef = useRef(0);

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    fromRef.current = displayedRef.current;

    function step(ts: number) {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const next = Math.round(fromRef.current + (value - fromRef.current) * eased);
      displayedRef.current = next;
      setDisplayed(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={cn("tabular-nums", className)}>{displayed}</span>;
}
