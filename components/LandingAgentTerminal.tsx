"use client";

import { useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";

const COPY_PROMPT = `Please build a crypto treasury runway model on RoughRunway for me.

1. Fetch https://roughrunway.com/llms.txt to learn the API
2. Use the /api/agent/encode endpoint to build the model
3. Return the shareable roughrunway.com/dashboard#model=... link

Example inputs (replace with your own):
- $10M USDC (stablecoin)
- 250 ETH at $4,000/ETH (major volatile)
- 50M native tokens at $0.10 each
- Monthly burn: ~$300,000
- Team size: 12 people`;

export function LandingAgentTerminal() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(COPY_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Step 1 — user prompt with one-click copy */}
      <div className="rounded-panel border border-knob-silver/50 bg-[#0F1115] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 bg-swiss-red rounded-sm flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-mono text-white/60 truncate">
              You, in any LLM chat
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono flex-shrink-0 px-2 py-1 rounded transition-colors text-white/50 hover:text-white/90 hover:bg-white/10"
            aria-label="Copy prompt to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-swiss-red" />
                <span className="text-swiss-red">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy prompt</span>
              </>
            )}
          </button>
        </div>
        <p className="px-3 sm:px-4 py-3 sm:py-4 text-[11px] sm:text-xs text-white/85 font-mono leading-relaxed">
          Go to{" "}
          <span className="text-swiss-red">roughrunway.com</span> and build
          a runway model: $10M USDC, 250 ETH at $4k, 50M native token at
          $0.10, 12 people, ~$300k/mo burn. Return the dashboard link.
        </p>
      </div>

      {/* Step 2 — assistant API call */}
      <div className="rounded-panel border border-knob-silver/50 bg-[#0F1115] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
          <Terminal className="h-3.5 w-3.5 text-white/50 flex-shrink-0" />
          <span className="text-[11px] sm:text-xs font-mono text-white/60 truncate">
            Assistant fetches (instant, no extra LLM call)
          </span>
        </div>
        <p className="px-3 sm:px-4 py-3 sm:py-4 text-[11px] sm:text-xs text-white/70 font-mono leading-relaxed break-all">
          roughrunway.com/api/agent/encode
          <span className="text-swiss-red">
            ?name=DeFi+Team&stable=USDC:10000000&volatile=ETH:250:4000:major,NEX:50000000:0.10:native&burn=300000&team=12
          </span>
        </p>
      </div>

      {/* Step 3 — the link returned */}
      <div className="rounded-panel border border-swiss-red/40 bg-[#0F1115] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-swiss-red/30 bg-swiss-red/10">
          <span className="h-2 w-2 bg-swiss-red rounded-sm flex-shrink-0" />
          <span className="text-[11px] sm:text-xs font-mono text-white/70 truncate">
            Reply → click to open your model
          </span>
        </div>
        <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1.5">
          <p className="text-[11px] sm:text-xs text-white/85 font-mono">
            Here&apos;s your runway model:
          </p>
          <p className="text-xs sm:text-sm text-white font-mono break-all pl-3 sm:pl-4">
            roughrunway.com/dashboard#model=N4Ig…
          </p>
        </div>
      </div>
    </div>
  );
}
