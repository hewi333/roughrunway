"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

export default function FooterBrand() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-placard uppercase text-muted-foreground">Built for</span>
          <a
            href="https://www.theaccountantquits.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-body font-medium text-foreground hover:text-primary hover:underline"
          >
            The Accountant Quits Hackathon
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>

      <a
        href="https://github.com/hewi333/roughrunway"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-body text-muted-foreground hover:text-foreground hover:underline"
      >
        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
        </svg>
        <span className="font-mono">hewi333/roughrunway</span>
        <ExternalLink className="ml-1 h-3 w-3" />
      </a>
    </div>
  );
}
