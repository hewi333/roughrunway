import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-knob bg-knob-gold/15 border border-knob-gold/30 mb-6">
          <span className="text-body font-mono font-bold text-knob-gold dark:text-knob-gold-dark">
            404
          </span>
        </div>

        <div className="text-placard uppercase text-muted-foreground">Navigation</div>
        <h1 className="text-h1 text-foreground mt-1 mb-2">Page Not Found</h1>

        <p className="text-body text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild variant="knob">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
