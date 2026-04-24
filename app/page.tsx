import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── SVG hero ─────────────────────────────────────────────────────────────────
// Replace this entire component with <img src="/hero.png" alt="..." className="w-full" />
// once you have a custom graphic.

function RunwayIllustration() {
  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020810" />
          <stop offset="60%" stopColor="#061526" />
          <stop offset="100%" stopColor="#0d2440" />
        </linearGradient>
        <radialGradient id="vpGlow" cx="50%" cy="54%" r="18%">
          <stop offset="0%" stopColor="#1a4a8a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#061526" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="centerline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="600" height="400" fill="url(#sky)" />

      {/* Stars */}
      {[
        [42, 30], [110, 55], [190, 18], [260, 42], [330, 25], [400, 50],
        [470, 32], [540, 60], [75, 90], [510, 80], [155, 72], [350, 88],
        [230, 105], [440, 95], [85, 130], [520, 118],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.2 : 0.7} fill="white" opacity={0.4 + (i % 4) * 0.1} />
      ))}

      {/* Mountain silhouettes */}
      <polygon
        points="0,235 60,195 110,215 170,175 230,200 290,165 330,185 390,162 440,190 490,168 540,200 590,180 600,195 600,400 0,400"
        fill="#080f1e"
      />
      <polygon
        points="0,260 80,235 140,248 210,228 270,240 340,222 400,238 460,220 530,242 600,230 600,400 0,400"
        fill="#050c18"
      />

      {/* Runway surface */}
      <polygon
        points="105,400 495,400 308,216 292,216"
        fill="#06111f"
        opacity="0.9"
      />

      {/* Horizon glow at vanishing point */}
      <rect width="600" height="400" fill="url(#vpGlow)" />

      {/* Runway edge lines */}
      <line x1="105" y1="400" x2="292" y2="216" stroke="white" strokeWidth="1.5" strokeOpacity="0.85" />
      <line x1="495" y1="400" x2="308" y2="216" stroke="white" strokeWidth="1.5" strokeOpacity="0.85" />

      {/* Centerline dashes — perspective-aware: bigger at bottom, smaller near horizon */}
      {[0, 0.14, 0.28, 0.42, 0.55, 0.67, 0.78, 0.87, 0.93].map((t, i) => {
        const y1 = 400 - t * 184;
        const y2 = y1 - (1 - t) * 16 - 4;
        const opacity = 0.15 + t * 0.55;
        return (
          <line key={i} x1="300" y1={y1} x2="300" y2={y2}
            stroke="white" strokeWidth={2 - t * 1.2} strokeOpacity={opacity} />
        );
      })}

      {/* Left edge lights */}
      {[0.08, 0.22, 0.37, 0.52, 0.65, 0.77, 0.87].map((t, i) => {
        const cx = 105 + t * (292 - 105);
        const cy = 400 - t * (400 - 216);
        return (
          <circle key={i} cx={cx} cy={cy}
            r={2.8 - t * 1.8} fill="#6FA3D4"
            opacity={0.5 + t * 0.4}
          />
        );
      })}

      {/* Right edge lights */}
      {[0.08, 0.22, 0.37, 0.52, 0.65, 0.77, 0.87].map((t, i) => {
        const cx = 495 - t * (495 - 308);
        const cy = 400 - t * (400 - 216);
        return (
          <circle key={i} cx={cx} cy={cy}
            r={2.8 - t * 1.8} fill="#6FA3D4"
            opacity={0.5 + t * 0.4}
          />
        );
      })}

      {/* Vanishing point glow dot */}
      <circle cx="300" cy="216" r="5" fill="#4a8fd4" opacity="0.5" />
      <circle cx="300" cy="216" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020810] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-mono font-bold text-lg tracking-tight text-white">
          RoughRunway
        </span>
        <Button asChild size="sm" className="gap-2">
          <Link href="/dashboard">
            Build your model
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-mono uppercase tracking-widest text-[#6FA3D4] opacity-80">
              Accountant Quits Web3 · April 2026
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Know your runway.
              <br />
              <span className="text-[#6FA3D4]">Before you run out.</span>
            </h1>
            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              Crypto treasury runway modeling for Web3 orgs. Input your assets,
              set your burn rate, stress-test scenarios — know exactly how long
              your money lasts.
            </p>
          </div>

          <Button asChild size="lg" className="gap-2 text-base px-8 py-6">
            <Link href="/dashboard">
              Build your model
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex flex-wrap gap-3 pt-2">
            {["No login", "Free to use", "Shareable link"].map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 rounded border border-white/10 text-white/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hero graphic — swap for <img src="/hero.png" /> once you have one */}
        <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#050d1a]">
          <RunwayIllustration />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 bg-[#040b17]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <div key={label} className="space-y-2">
              <div className="h-px w-8 bg-[#6FA3D4] mb-4" />
              <h3 className="font-semibold text-white">{label}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI agent section */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-[#6FA3D4] opacity-70">
              Agentic
            </p>
            <h2 className="text-3xl font-bold leading-tight">
              Ask your AI agent
              <br />to build the model.
            </h2>
            <p className="text-white/50 leading-relaxed max-w-sm">
              RoughRunway exposes a machine-readable API. Give Claude or ChatGPT a
              plain-English description of your org — it builds the model and hands
              you back a link.
            </p>
            <p className="text-xs text-white/30 font-mono">
              Discovery: <span className="text-white/50">/.well-known/ai-plugin.json</span>
              {" · "}
              <span className="text-white/50">/llms.txt</span>
              {" · "}
              <span className="text-white/50">/openapi.json</span>
            </p>
          </div>

          <div className="space-y-3">
            {/* Example prompt */}
            <div className="rounded-xl border border-white/10 bg-[#050d1a] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                <Terminal className="h-3.5 w-3.5 text-white/30" />
                <span className="text-xs font-mono text-white/30">You → Claude</span>
              </div>
              <p className="px-4 py-4 text-sm text-white/70 font-mono leading-relaxed">
                Go to roughrunway.com and build a runway model for a 10-person DeFi
                team with $1.5M USDC, 50 ETH at $3,500, and 100M native tokens at
                $0.08. Monthly burn is $150k.
              </p>
            </div>

            {/* Example response */}
            <div className="rounded-xl border border-[#2E7D32]/30 bg-[#2E7D32]/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2E7D32]/10">
                <span className="text-xs font-mono text-[#4ADE80]/60">Claude → You</span>
              </div>
              <div className="px-4 py-4 space-y-2">
                <p className="text-sm text-white/60 font-mono leading-relaxed">
                  Built your model — $1.5M USDC + 50 ETH + 100M NEX tokens,
                  $150k/mo burn, 10-person team.
                </p>
                <p className="text-sm text-[#6FA3D4] font-mono break-all">
                  roughrunway.com/dashboard#model=N4Ig…
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020810]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-sm text-white/20">
            Built for the{" "}
            <span className="text-white/40">Accountant Quits Web3 Hackathon</span>
            {" "}· April 2026
          </span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/dashboard" className="hover:text-white/60 transition-colors">
              Launch tool
            </Link>
            <Link
              href="https://github.com/hewi333/roughrunway"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
