import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingAgentTerminal } from "@/components/LandingAgentTerminal";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-mountain-white text-ink">
      {/* Swiss flag stripe — thin red/white accent across the very top */}
      <div className="h-1 w-full bg-swiss-red" />

      {/* Hero — full-bleed alpine runway photo with the wordmark and copy
          overlaid, so the picture starts immediately under the red stripe. */}
      <section className="relative overflow-hidden min-h-[560px] sm:min-h-[620px] lg:min-h-[720px] flex items-center">
        <Image
          src="/hero-alpine.jpg"
          alt="Asphalt runway on a snow-covered alpine ridge at dawn, with snow-capped peaks glowing in warm light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-center"
        />
        {/* Mobile scrim: vertical fade from top so text stays readable over whatever the image crops to.
            Desktop scrim (md+): horizontal left-to-right fade so the runway stays clean on the right. */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(245,245,245,0.94) 0%, rgba(245,245,245,0.82) 38%, rgba(245,245,245,0.55) 68%, rgba(245,245,245,0.25) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(245,245,245,0.95) 0%, rgba(245,245,245,0.82) 28%, rgba(245,245,245,0.45) 52%, rgba(245,245,245,0.1) 72%, rgba(245,245,245,0) 88%)",
          }}
        />

        {/* Wordmark sits on the brightest scrim corner */}
        <nav className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-6 py-4 sm:py-5">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2.5 min-w-0">
              <Image src="/RR-logo.png" alt="RoughRunway logo" width={28} height={28} className="flex-shrink-0 rounded-sm" />
              <span className="font-mono font-bold text-base sm:text-lg tracking-tight text-ink truncate">
                RoughRunway
              </span>
            </Link>
          </div>
        </nav>

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-14 sm:pb-20">
          <div className="max-w-xl space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-swiss-red">
                <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red rounded-sm" />
                Built for The Accountant Quits Hackathon
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-ink">
                Know your runway.
                <br />
                <span className="text-swiss-red">Before you run out.</span>
              </h1>
              <p className="text-base sm:text-lg text-ink-secondary max-w-md leading-relaxed">
                Crypto treasury runway modeling for Web3 orgs — stress-test
                scenarios and see exactly how long your money lasts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Button asChild size="lg" className="gap-2 text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6">
                <Link href="/dashboard">
                  Build model
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 text-sm sm:text-base px-5 sm:px-6 py-5 sm:py-6 bg-white/80 backdrop-blur-sm">
                <Link href="/docs">
                  Read the docs
                </Link>
              </Button>
            </div>

            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-ink-secondary">
              4 clicks → sample model + sensitivity scenario
            </p>

            {/* Sponsor logos below the "4 clicks" hint */}
            <div className="flex items-center gap-5 pt-1">
              <Link
                href="https://www.theaccountantquits.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The Accountant Quits"
                className="flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity"
              >
                {/* TAQ wordmark only */}
                <span className="font-bold text-[10px] tracking-[0.18em] uppercase text-[#0F1623] leading-none">
                  The Accountant{" "}
                  <span className="text-[#7C5CFC]">Quits</span>
                </span>
              </Link>

              <span className="h-4 w-px bg-ink/20" aria-hidden />

              <Link
                href="https://www.perplexity.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Perplexity"
                className="opacity-75 hover:opacity-100 transition-opacity"
              >
                <Image src="/330px-Perplexity_AI_logo.svg.png" alt="Perplexity" width={110} height={22} className="flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features — clean numbered editorial rows */}
      <section className="relative bg-white border-b border-knob-silver/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-baseline gap-3 mb-10 sm:mb-14">
            <span className="h-3 w-3 bg-swiss-red rounded-sm" />
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-ink-secondary">
              The Platform
            </h2>
          </div>

          <div className="divide-y divide-knob-silver/30">
            {[
              {
                num: "01",
                label: "Treasury modeling",
                desc: "Stablecoins, fiat, BTC/ETH, native tokens — each with tier-based liquidity haircuts and sell limits.",
              },
              {
                num: "02",
                label: "Scenario analysis",
                desc: "Model bear markets, hiring surges, grant cliffs, and one-off events side-by-side against your baseline.",
              },
              {
                num: "03",
                label: "Shareable links",
                desc: "Your entire model encodes into a URL. Send it to your accountant, board, or co-founder — no account needed.",
              },
            ].map(({ num, label, desc }) => (
              <div
                key={label}
                className="py-7 sm:py-9 grid grid-cols-[36px_1fr] sm:grid-cols-[56px_220px_1fr] gap-x-5 sm:gap-x-10 gap-y-1.5 items-baseline"
              >
                <span className="font-mono text-[10px] tracking-widest text-swiss-red pt-0.5">{num}</span>
                <h3 className="font-semibold text-ink text-base sm:text-lg leading-snug">{label}</h3>
                <p className="col-start-2 sm:col-start-3 text-sm text-ink-secondary leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI agent section — same light palette as the rest of the page,
          with dark terminal cards staging the user → assistant → result flow. */}
      <section className="bg-mountain-white border-t border-knob-silver/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="h-3 w-3 bg-swiss-red rounded-sm" />
              <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-ink-secondary">
                Agentic
              </h2>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold leading-tight text-ink tracking-tight">
              Tell Claude or ChatGPT.
              <br />
              <span className="text-swiss-red">Get a shareable model.</span>
            </h3>
            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-md">
              RoughRunway publishes{" "}
              <span className="font-mono text-ink">/llms.txt</span> and an
              OpenAPI spec so any AI assistant with web access reads your
              description, calls the encode API, and hands back a working
              model link — no forms, no copy-pasted JSON.
            </p>

            <div className="pt-2 space-y-2">
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-ink-secondary">
                Works in
              </p>
              <ul className="text-sm text-ink-secondary space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-swiss-red rounded-full" />
                  <span>
                    <span className="text-ink font-medium">Claude Desktop</span> via
                    the{" "}
                    <span className="font-mono text-ink">roughrunway-mcp</span>{" "}
                    server — fully autonomous, model link comes back inline
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-swiss-red rounded-full" />
                  <span>
                    <span className="text-ink font-medium">Claude Code</span> — uses
                    its WebFetch tool natively, also fully autonomous
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-swiss-red rounded-full" />
                  <span>
                    <span className="text-ink font-medium">ChatGPT Custom GPT</span>{" "}
                    pointed at <span className="font-mono text-ink">/openapi.json</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-swiss-red rounded-full" />
                  <span>
                    <span className="text-ink font-medium">Claude.ai / ChatGPT chat</span>{" "}
                    — web tools refuse to fetch model-built URLs, so the assistant
                    parses your inputs and hands you a one-click link that
                    redirects into the loaded dashboard
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-[11px] sm:text-xs text-ink-secondary/70 font-mono pt-2 break-all sm:break-normal">
              Discovery:{" "}
              <span className="text-ink">/.well-known/ai-plugin.json</span>
              {" · "}
              <span className="text-ink">/llms.txt</span>
              {" · "}
              <span className="text-ink">/openapi.json</span>
            </p>
          </div>

          <LandingAgentTerminal />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mountain-white border-t border-knob-silver/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Image src="/RR-logo.png" alt="RoughRunway logo" width={20} height={20} className="flex-shrink-0 rounded-sm" />
            <span className="font-mono text-xs sm:text-sm text-ink-secondary">
              Built for{" "}
              <span className="text-ink">The Accountant Quits Hackathon</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-ink-secondary">
            <Link
              href="/dashboard"
              className="hover:text-swiss-red transition-colors"
            >
              Launch tool
            </Link>
            <Link
              href="https://github.com/hewi333/roughrunway"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-swiss-red transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
        <div className="h-1 w-full bg-swiss-red" />
      </footer>
    </main>
  );
}
