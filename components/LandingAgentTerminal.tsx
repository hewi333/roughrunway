"use client";

import { useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";

const COPY_PROMPT = `Please build a crypto treasury runway model on RoughRunway for me.

1. Fetch https://roughrunway.com/llms.txt to learn the API
2. Use the /api/agent/encode endpoint to build the model
3. Return the shareable roughrunway.com/dashboard#model=... link

Treasury (mid-stage Web3 protocol, 15-person team, just closed a $7M raise):
- $3.5M USDC and $500K USDT in stablecoins
- $1M USD in fiat operating accounts
- 300 ETH (major volatile — leave price blank, Perplexity fills it in)
- 50M TAQ native tokens at $0.20 each (sell-rate constrained, 15% haircut)

Monthly burn (~$450K total, all eight standard categories):
- Headcount & payroll $300K, employee token grants $22K
- Infrastructure & tooling $30K, legal & compliance $15K
- Marketing & growth $35K, token incentives / emissions $25K
- Ecosystem grants out $15K, office & admin $8K

Inflows (~$34K/mo): ETH staking rewards $4K, protocol revenue $30K growing 2%/mo.

Project 18 months out. Name it "TAQ Labs".`;

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
        <p className="px-3 sm:px-4 py-3 sm:py-4 text-[11px] sm:text-xs text-white/85 font-mono leading-relaxed line-clamp-4">
          Build a runway model on{" "}
          <span className="text-swiss-red">roughrunway.com</span> for our
          15-person Web3 protocol post-$7M raise: $3.5M USDC + $500K USDT,
          $1M USD fiat, 300 ETH (Perplexity fills the price), 50M TAQ
          native tokens at $0.20 (15% haircut), $450K/mo burn across all eight categories
          (headcount $300K, infra $30K, legal $15K, marketing $35K, token
          incentives $25K, grants out $15K, office $8K, employee token
          grants $22K), $4K staking + $30K protocol revenue inflow. Project
          18 months and return the dashboard link…
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
            ?name=TAQ+Labs&stable=USDC:3500000,USDT:500000&fiat=USD:1000000&volatile=ETH:300:0:major,TAQ:50000000:0.20:native&burn=450000&team=15&months=18
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
