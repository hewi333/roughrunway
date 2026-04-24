import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-mountain-white text-ink">
      {/* Swiss flag stripe — thin red/white accent across the very top */}
      <div className="h-1 w-full bg-swiss-red" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-sm bg-swiss-red">
            <span className="absolute h-0.5 w-3.5 bg-white" />
            <span className="absolute h-3.5 w-0.5 bg-white" />
          </span>
          <span className="font-mono font-bold text-lg tracking-tight text-ink">
            RoughRunway
          </span>
        </Link>
        <Button asChild size="sm" className="gap-2">
          <Link href="/dashboard">
            Build your model
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </nav>

      {/* Hero — full-bleed alpine runway photo with left-side text overlay */}
      <section className="relative overflow-hidden min-h-[600px] lg:min-h-[720px] flex items-center">
        <Image
          src="/hero-alpine.jpg"
          alt="Asphalt runway on a snow-covered alpine ridge at dawn, with snow-capped peaks glowing in warm light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Left-side scrim: solid white at left edge fading to transparent across the middle,
            keeping the runway/mountains on the right visually clean. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(245,245,245,0.95) 0%, rgba(245,245,245,0.82) 28%, rgba(245,245,245,0.45) 52%, rgba(245,245,245,0.1) 72%, rgba(245,245,245,0) 88%)",
          }}
        />

        <div className="relative w-full max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-swiss-red">
                <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red rounded-sm" />
                Accountant Quits Web3 · April 2026
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-ink">
                Know your runway.
                <br />
                <span className="text-swiss-red">Before you run out.</span>
              </h1>
              <p className="text-lg text-ink-secondary max-w-md leading-relaxed">
                Crypto treasury runway modeling for Web3 orgs. Input your assets,
                set your burn rate, stress-test scenarios — know exactly how long
                your money lasts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Button asChild size="lg" className="gap-2 text-base px-8 py-6">
                <Link href="/dashboard">
                  Build your model
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 text-base px-6 py-6 bg-white/80 backdrop-blur-sm">
                <Link href="/docs">
                  Read the docs
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["No login", "Free to use", "Shareable link"].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-precise border border-knob-silver bg-white/85 backdrop-blur-sm text-ink-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features — snow-white strip with mountain silhouette accents */}
      <section className="relative bg-white border-y border-knob-silver/40">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="h-3 w-3 bg-swiss-red rounded-sm" />
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-ink-secondary">
              The Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: "Treasury modeling",
                desc: "Stablecoins, fiat, BTC/ETH, native tokens — each with tier-based liquidity haircuts and sell limits.",
              },
              {
                label: "Scenario analysis",
                desc: "Model bear markets, hiring surges, grant cliffs, and one-off events side-by-side against your baseline.",
              },
              {
                label: "Shareable links",
                desc: "Your entire model encodes into a URL. Send it to your accountant, board, or co-founder — no account needed.",
              },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-panel border border-knob-silver/50 bg-mountain-white p-6 space-y-3 hover:border-swiss-red/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-swiss-red" />
                  <span className="h-0.5 w-2 bg-ink" />
                </div>
                <h3 className="font-semibold text-ink text-lg">{label}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI agent section — darker contrast band like a night-flight over snow */}
      <section className="bg-[#0F1115] text-white/90">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-swiss-red">
              <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red rounded-sm" />
              Agentic
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-white">
              Ask your AI agent
              <br />
              <span className="text-sky-blue">to build the model.</span>
            </h2>
            <p className="text-white/60 leading-relaxed max-w-sm">
              RoughRunway exposes a machine-readable API. Give Claude or ChatGPT a
              plain-English description of your org — it builds the model and hands
              you back a link.
            </p>
            <p className="text-xs text-white/40 font-mono pt-2">
              Discovery:{" "}
              <span className="text-white/70">/.well-known/ai-plugin.json</span>
              {" · "}
              <span className="text-white/70">/llms.txt</span>
              {" · "}
              <span className="text-white/70">/openapi.json</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-panel border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <Terminal className="h-3.5 w-3.5 text-white/40" />
                <span className="text-xs font-mono text-white/50">
                  Agent fetches (instant, no extra LLM)
                </span>
              </div>
              <p className="px-4 py-4 text-xs text-white/70 font-mono leading-relaxed break-all">
                roughrunway.com/api/agent/encode
                <span className="text-sky-blue">
                  ?name=DeFi+Team&stable=USDC:1500000&volatile=ETH:50:3500:major,NEX:100000000:0.08:native&burn=150000&team=10
                </span>
              </p>
            </div>

            <div className="rounded-panel border border-swiss-red/40 bg-swiss-red/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-swiss-red/20">
                <span className="h-2 w-2 bg-swiss-red rounded-sm" />
                <span className="text-xs font-mono text-white/70">
                  Response → agent returns to user
                </span>
              </div>
              <div className="px-4 py-4 space-y-1">
                <p className="text-xs text-white/50 font-mono">{`{ "shareUrl":`}</p>
                <p className="text-sm text-white font-mono break-all pl-4">
                  "roughrunway.com/dashboard#model=N4Ig…"
                </p>
                <p className="text-xs text-white/50 font-mono">{`}`}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mountain-white border-t border-knob-silver/40">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-sm bg-swiss-red">
              <span className="absolute h-0.5 w-2.5 bg-white" />
              <span className="absolute h-2.5 w-0.5 bg-white" />
            </span>
            <span className="font-mono text-sm text-ink-secondary">
              Built for the{" "}
              <span className="text-ink">Accountant Quits Web3 Hackathon</span>
              {" "}· April 2026
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
