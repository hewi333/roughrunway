import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Alpine runway hero ──────────────────────────────────────────────────────
// Snowy mountain amphitheater with a centerline runway cutting through.
// Swiss-red accents: aircraft tail, runway threshold bars, edge beacons.

function AlpineRunway() {
  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F1FA" />
          <stop offset="55%" stopColor="#BFD8EE" />
          <stop offset="100%" stopColor="#F5F5F5" />
        </linearGradient>
        <linearGradient id="farRange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8CA9C4" />
          <stop offset="100%" stopColor="#C9D8E6" />
        </linearGradient>
        <linearGradient id="midRange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6F8CA8" />
          <stop offset="70%" stopColor="#B7C7D7" />
          <stop offset="100%" stopColor="#E0E8F0" />
        </linearGradient>
        <linearGradient id="nearRange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F6A84" />
          <stop offset="60%" stopColor="#97AEC5" />
          <stop offset="100%" stopColor="#EDF2F7" />
        </linearGradient>
        <linearGradient id="runway" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D4A58" />
          <stop offset="100%" stopColor="#1F262E" />
        </linearGradient>
        <linearGradient id="snowfield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D6E1EB" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="600" height="400" fill="url(#sky)" />

      {/* Soft sun glow */}
      <circle cx="480" cy="90" r="70" fill="#FFE9D0" opacity="0.55" />
      <circle cx="480" cy="90" r="28" fill="#FFF4E2" opacity="0.9" />

      {/* Far range */}
      <polygon
        points="0,210 70,170 130,190 200,150 260,175 330,140 390,165 450,138 510,170 570,150 600,165 600,260 0,260"
        fill="url(#farRange)"
      />

      {/* Mid range */}
      <polygon
        points="0,245 50,205 120,225 190,185 250,215 320,175 380,200 440,170 500,205 560,185 600,200 600,285 0,285"
        fill="url(#midRange)"
      />

      {/* Snow caps on mid range peaks */}
      <path d="M190,185 L205,195 L215,190 L225,200 L240,193 L250,215 L235,210 L220,218 L205,212 Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M320,175 L335,188 L345,182 L355,195 L365,188 L380,200 L360,198 L345,205 L330,198 Z" fill="#FFFFFF" opacity="0.85" />
      <path d="M440,170 L455,182 L465,176 L478,188 L490,180 L500,205 L480,200 L465,208 L450,200 Z" fill="#FFFFFF" opacity="0.85" />

      {/* Near range (left shoulder) */}
      <polygon
        points="0,400 0,270 50,240 110,265 170,235 210,260 230,290 180,320 120,340 60,360"
        fill="url(#nearRange)"
      />
      {/* Left shoulder snow */}
      <path d="M50,240 L70,252 L85,245 L100,260 L110,265 L95,268 L80,272 L65,268 Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M110,265 L130,250 L150,245 L170,235 L165,255 L150,262 L135,268 L120,270 Z" fill="#FFFFFF" opacity="0.75" />

      {/* Near range (right shoulder) */}
      <polygon
        points="600,400 600,270 540,245 480,265 420,232 380,258 360,290 410,318 475,340 545,358"
        fill="url(#nearRange)"
      />
      {/* Right shoulder snow */}
      <path d="M540,245 L520,255 L505,250 L490,262 L480,265 L495,270 L510,272 L525,268 Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M480,265 L460,250 L440,245 L420,232 L425,254 L440,262 L455,268 L470,270 Z" fill="#FFFFFF" opacity="0.75" />

      {/* Valley snowfield (foreground around the runway) */}
      <polygon
        points="0,400 0,360 60,360 120,340 180,320 230,290 240,300 360,300 370,290 420,318 475,340 545,358 600,360 600,400"
        fill="url(#snowfield)"
      />

      {/* Runway surface — dark asphalt wedge */}
      <polygon
        points="215,400 385,400 318,252 282,252"
        fill="url(#runway)"
      />

      {/* Runway threshold bars (red displaced threshold marking — Swiss red) */}
      <g>
        <rect x="230" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="244" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="258" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="272" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="322" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="336" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="350" y="388" width="6" height="10" fill="#DC2626" />
        <rect x="364" y="388" width="6" height="10" fill="#DC2626" />
      </g>

      {/* Runway edge stripes (white) */}
      <line x1="215" y1="400" x2="282" y2="252" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.95" />
      <line x1="385" y1="400" x2="318" y2="252" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.95" />

      {/* Perspective centerline dashes */}
      {[0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.82, 0.9].map((t, i) => {
        const y1 = 400 - t * 148;
        const y2 = y1 - (1 - t) * 14 - 5;
        const opacity = 0.3 + t * 0.55;
        return (
          <line
            key={i}
            x1="300"
            y1={y1}
            x2="300"
            y2={y2}
            stroke="#FFFFFF"
            strokeWidth={2.2 - t * 1.2}
            strokeOpacity={opacity}
          />
        );
      })}

      {/* Edge beacons — alternating white / Swiss red */}
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.82].map((t, i) => {
        const lx = 215 + t * (282 - 215);
        const rx = 385 - t * (385 - 318);
        const cy = 400 - t * (400 - 252);
        const color = i % 2 === 0 ? "#DC2626" : "#FFFFFF";
        return (
          <g key={i}>
            <circle cx={lx} cy={cy} r={2.6 - t * 1.5} fill={color} />
            <circle cx={rx} cy={cy} r={2.6 - t * 1.5} fill={color} />
          </g>
        );
      })}

      {/* Distant pine trees dotted on near shoulders */}
      {[
        [55, 352], [80, 345], [100, 338], [135, 330], [165, 320],
        [470, 335], [500, 348], [525, 352], [540, 356], [555, 358],
      ].map(([x, y], i) => (
        <polygon
          key={i}
          points={`${x},${y - 8} ${x - 3},${y} ${x + 3},${y}`}
          fill="#2F4636"
          opacity="0.75"
        />
      ))}

      {/* Aircraft — small jet on the runway with red tail */}
      <g transform="translate(292,330)">
        {/* fuselage */}
        <ellipse cx="8" cy="4" rx="12" ry="3" fill="#F5F5F5" stroke="#2A2A2A" strokeWidth="0.5" />
        {/* wings */}
        <polygon points="2,4 16,3 16,5 2,5" fill="#D6D6D6" />
        {/* tail (Swiss red) */}
        <polygon points="0,4 -5,-2 -2,4" fill="#DC2626" />
        <rect x="-3" y="3.5" width="2" height="1" fill="#FFFFFF" />
        {/* nose */}
        <circle cx="18" cy="4" r="1.5" fill="#2A2A2A" />
      </g>

      {/* Airfield beacon at horizon — small flag pin */}
      <g transform="translate(300,246)">
        <rect x="-0.5" y="0" width="1" height="10" fill="#2A2A2A" />
        <polygon points="0,0 7,2.5 0,5" fill="#DC2626" />
      </g>
    </svg>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

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

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #E8F1FA 0%, #DCE8F3 55%, #F5F5F5 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
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
              <Button asChild size="lg" variant="outline" className="gap-2 text-base px-6 py-6">
                <Link href="/docs">
                  Read the docs
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["No login", "Free to use", "Shareable link"].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-precise border border-knob-silver bg-white text-ink-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Alpine hero graphic */}
          <div className="rounded-panel overflow-hidden border border-knob-silver/60 bg-white shadow-[0_10px_40px_-15px_rgba(79,106,132,0.4)]">
            <AlpineRunway />
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
