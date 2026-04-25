"use client";

import React from "react";
import Link from "next/link";
import { Monitor, ArrowLeft } from "lucide-react";

export default function MobileInterstitial() {
  return (
    <main className="min-h-screen bg-mountain-white dark:bg-background flex flex-col">
      {/* Swiss flag stripe — same accent as the landing page */}
      <div className="h-1 w-full bg-swiss-red" />

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md space-y-8">
          {/* Brand lockup */}
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="relative inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm bg-swiss-red">
              <span className="absolute h-0.5 w-3.5 bg-white" />
              <span className="absolute h-3.5 w-0.5 bg-white" />
            </span>
            <span className="font-mono font-bold text-base tracking-tight text-foreground">
              RoughRunway
            </span>
          </Link>

          {/* Headline */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-swiss-red">
              <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red rounded-sm" />
              Cockpit closed on mobile
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-[1.05] tracking-tight text-foreground">
              Land on a desktop
              <br />
              <span className="text-swiss-red">to fly the model.</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              The dashboard is built for treasury work — wide charts, precise
              sliders, side-by-side scenario overlays. Open this page on a
              laptop or desktop to use it.
            </p>
          </div>

          {/* Spec card — matches the landing page's bordered panel style */}
          <div className="rounded-panel border border-knob-silver/50 dark:border-knob-silver-dark bg-white dark:bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 bg-swiss-red" />
              <span className="h-0.5 w-2 bg-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Why desktop
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <SpecRow>Treasury panels need a wider canvas than a phone gives</SpecRow>
              <SpecRow>Scenario sliders and overlays are precision controls</SpecRow>
              <SpecRow>Projection charts are read on a 13"+ screen</SpecRow>
            </ul>
          </div>

          {/* Footer link */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-swiss-red transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to home
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              Desktop only
            </span>
          </div>
        </div>
      </div>

      {/* Swiss flag stripe — bookends the page like the landing footer */}
      <div className="h-1 w-full bg-swiss-red" />
    </main>
  );
}

function SpecRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-swiss-red rounded-full" />
      <span>{children}</span>
    </li>
  );
}
