"use client";

import React from "react";
import { Smartphone } from "lucide-react";

export default function MobileInterstitial() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-knob bg-knob-gold/15 border border-knob-gold/30">
          <Smartphone className="h-8 w-8 text-knob-gold dark:text-knob-gold-dark" />
        </div>

        <div className="mt-6 text-placard uppercase text-muted-foreground">Notice</div>
        <h1 className="mt-1 text-h1 text-foreground">Desktop Experience Required</h1>

        <p className="mt-4 text-body text-muted-foreground">
          Rough Runway is designed for desktop use with complex financial
          modeling. Please visit this page on a desktop computer to access the
          full dashboard.
        </p>

        <div className="mt-8 bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-6 text-left">
          <div className="text-placard uppercase text-muted-foreground">Reasons</div>
          <h2 className="text-h3 text-foreground mt-1">Why Desktop?</h2>
          <ul className="mt-4 space-y-2 text-body text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-knob bg-swiss-red shrink-0" />
              <span>Complex treasury modeling requires a larger workspace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-knob bg-swiss-red shrink-0" />
              <span>Detailed scenario analysis needs precise controls</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-knob bg-swiss-red shrink-0" />
              <span>Interactive charts are optimized for mouse interaction</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
