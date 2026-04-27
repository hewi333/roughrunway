import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  Flame,
  ArrowDownToLine,
  GitBranch,
  LineChart,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

interface SectionMeta {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionMeta[] = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "quickstart", label: "Quick start", icon: ArrowRight },
  { id: "treasury", label: "Treasury", icon: Wallet },
  { id: "burn", label: "Burn", icon: Flame },
  { id: "inflows", label: "Inflows", icon: ArrowDownToLine },
  { id: "scenarios", label: "Scenarios", icon: GitBranch },
  { id: "projections", label: "Reading projections", icon: LineChart },
  { id: "sharing", label: "Share & export", icon: Share2 },
  { id: "ai", label: "AI assistant", icon: Sparkles },
];

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 scroll-mt-24" id={id}>
      <p className="text-placard uppercase tracking-[0.2em] text-swiss-red dark:text-aviation-red-dark">
        <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red dark:bg-aviation-red-dark rounded-sm" />
        {eyebrow}
      </p>
      <h2 className="text-h1 font-bold tracking-tight text-foreground mt-2">{title}</h2>
      {description && (
        <p className="text-body-lg text-muted-foreground mt-2 max-w-2xl">{description}</p>
      )}
    </header>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-mountain-white dark:bg-panel-dark p-4 overflow-x-auto">
      <code className="font-mono text-caption text-foreground leading-relaxed">{children}</code>
    </pre>
  );
}

function FieldRow({ name, type, children }: { name: string; type: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b border-knob-silver/40 dark:border-knob-silver-dark/30 last:border-b-0">
      <div className="space-y-1">
        <div className="font-mono text-caption font-semibold text-foreground">{name}</div>
        <div className="text-placard uppercase tracking-widest text-muted-foreground">{type}</div>
      </div>
      <div className="text-body text-muted-foreground">{children}</div>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-mountain-white dark:bg-background text-foreground">
      <div className="h-1 w-full bg-swiss-red" />

      {/* Top nav bar — matches the landing page */}
      <nav className="border-b border-knob-silver/40 dark:border-knob-silver-dark/30 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 min-w-0">
            <Image src="/RR-logo.png" alt="RoughRunway" width={24} height={24} className="rounded-sm flex-shrink-0" />
            <span className="font-mono font-bold text-sm sm:text-base tracking-tight text-foreground truncate">
              RoughRunway
            </span>
            <span className="hidden sm:inline text-placard uppercase tracking-[0.2em] text-muted-foreground ml-2">
              / docs
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard">
                Build model
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <header className="max-w-3xl mb-12 sm:mb-16">
          <p className="text-placard uppercase tracking-[0.2em] text-swiss-red dark:text-aviation-red-dark">
            <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red dark:bg-aviation-red-dark rounded-sm" />
            Flight Manual
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mt-3 leading-[1.05]">
            Model your runway like a pilot reads the dash.
          </h1>
          <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl">
            Everything you need to set up a treasury, stress-test scenarios, and read the
            projection chart. No backend, no signup — your model lives in your browser and
            travels via shareable URL.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* Sticky table of contents */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="text-placard uppercase tracking-[0.2em] text-muted-foreground mb-3">
              On this page
            </div>
            <nav className="flex flex-col">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="group flex items-center gap-2.5 py-2 text-body text-muted-foreground hover:text-foreground border-l-2 border-transparent hover:border-swiss-red dark:hover:border-aviation-red-dark pl-3 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-swiss-red dark:group-hover:text-aviation-red-dark" />
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Body */}
          <article className="space-y-16 min-w-0">
            <section>
              <SectionHeading
                id="overview"
                eyebrow="Overview"
                title="What RoughRunway models"
                description="A deterministic projection engine that simulates monthly cash, liquidations, and unmet deficits across a 12–18 month horizon."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  RoughRunway answers two questions:{" "}
                  <span className="font-medium text-foreground">how long does the money last</span>{" "}
                  on liquid reserves alone (hard runway), and{" "}
                  <span className="font-medium text-foreground">how much further can you go</span>{" "}
                  if you start liquidating volatile assets at a haircut (extended runway).
                </p>
                <p>
                  The math is pure — no AI, no random sampling. Every dollar of burn, every token sold,
                  every haircut applied is reproducible from the inputs. The AI assistant only helps
                  you set up the inputs faster; it never touches the projection itself.
                </p>
              </div>
              <Callout variant="info" className="mt-6">
                Your model never leaves your browser. We don&apos;t have a database. Sharing is done
                by encoding the entire model into the URL hash with{" "}
                <code className="font-mono">lz-string</code>.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="quickstart"
                eyebrow="Quick Start"
                title="From zero to runway in five steps"
              />
              <ol className="space-y-4">
                {[
                  ["Open the dashboard.", "The default model has placeholder values you can wipe or adapt."],
                  ["Add your treasury.", "Stablecoins, fiat, and any volatile assets you hold."],
                  ["Define burn.", "Headcount, infra, marketing, anything that costs money each month."],
                  ["Add expected inflows.", "Revenue, grants, scheduled token unlocks."],
                  ["Read the chart.", "Hard runway is the solid line. Extended runway is the dashed line."],
                ].map(([step, desc], i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 h-7 w-7 rounded-knob bg-swiss-red dark:bg-aviation-red-dark text-white font-mono text-caption font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-body font-medium text-foreground">{step}</p>
                      <p className="text-body text-muted-foreground">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Callout variant="tip" className="mt-6">
                Don&apos;t want to fill in fields? Click <span className="font-medium">AI Setup</span>{" "}
                on the dashboard, paste a one-line description of your org, and the assistant will
                draft a complete model you can edit.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="treasury"
                eyebrow="Treasury"
                title="What you hold today"
                description="Three asset classes. Stablecoins and fiat are spent directly; volatile assets get liquidated only when reserves run dry."
              />
              <div className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-card p-5">
                <FieldRow name="stablecoins" type="USD">
                  USDC, USDT, DAI, etc. Spent first to cover monthly burn. No haircut applied.
                </FieldRow>
                <FieldRow name="fiat" type="USD">
                  Cash in a bank account. Spent alongside stablecoins.
                </FieldRow>
                <FieldRow name="volatileAssets[]" type="tokens × price">
                  ETH, BTC, native tokens, alts. Each has a haircut, liquidity profile, and
                  liquidation priority that determines the order they get sold.
                </FieldRow>
              </div>
              <Callout variant="warning" className="mt-6" title="Liquidity matters">
                Volatile assets with <code className="font-mono">maxSellUnit: percent_of_volume</code>{" "}
                are capped by daily volume × percent — months where you wanted to sell more but
                couldn&apos;t will appear in the chart as <em>liquidity-constrained</em>.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="burn"
                eyebrow="Burn"
                title="What leaves the treasury each month"
                description="Categories like Headcount, Infrastructure, Marketing. Each is a flat monthly USD figure — model raises and cuts via scenarios, not by editing the base number."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Burn is the sum of all category amounts per month. The engine subtracts inflows
                  to get <span className="font-medium text-foreground">net burn</span>, then draws
                  from stablecoins → fiat → volatile assets in that order.
                </p>
              </div>
              <Callout variant="tip" className="mt-6">
                If your burn is mostly headcount, model it as a single &ldquo;Headcount&rdquo;
                category. Scenarios can then add a synthetic{" "}
                <code className="font-mono">headcountChange</code> override to simulate hires or cuts.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="inflows"
                eyebrow="Inflows"
                title="What comes in"
                description="Revenue, grants, scheduled raises, vested token releases. Modeled as recurring monthly amounts or one-time injections."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Inflows reduce net burn for the month they arrive in. A one-time grant of $500K
                  in month 4 will appear as a single positive blip; a $50K/mo recurring revenue line
                  flattens the curve across the entire horizon.
                </p>
              </div>
            </section>

            <section>
              <SectionHeading
                id="scenarios"
                eyebrow="Scenarios"
                title="Stress-test without rewriting your model"
                description="A scenario is a layer of overrides on top of the base model. The base never changes — overlays just produce alternate projection lines on the chart."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Use scenarios for the questions that keep you up at night:
                </p>
                <ul className="space-y-2 pl-1">
                  {[
                    ["Bear -50%", "Halve all volatile asset prices."],
                    ["Bull +100%", "Double them."],
                    ["Hire 5 engineers", "Add $75k/mo to headcount."],
                    ["Lose biggest customer", "Remove a recurring inflow line."],
                    ["Raise $2M seed", "Add a one-time inflow in month 3."],
                  ].map(([name, what]) => (
                    <li key={name} className="flex gap-3">
                      <span className="font-mono text-caption font-semibold text-foreground min-w-[140px]">
                        {name}
                      </span>
                      <span>{what}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Callout variant="info" className="mt-6">
                Scenarios reference base-model IDs. If you delete a category that a scenario
                overrides, that override is silently skipped — your scenario won&apos;t break, it
                just won&apos;t apply that one rule.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="projections"
                eyebrow="Projections"
                title="How to read the chart"
                description="The dashboard&apos;s main chart shows two runway lines and an optional composition stack underneath."
              />
              <div className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-card p-5 space-y-0">
                <FieldRow name="Hard Runway" type="solid line">
                  Stablecoin + fiat balance over time. The first month this hits zero is your hard
                  runway depletion date.
                </FieldRow>
                <FieldRow name="Extended Runway" type="dashed line">
                  Hard balance + proceeds from liquidating volatile assets at their haircut. Always
                  ≥ hard runway.
                </FieldRow>
                <FieldRow name="Composition" type="stacked area">
                  Toggle on to see the stables / fiat / volatile breakdown each month. Useful for
                  spotting when liquidations kick in.
                </FieldRow>
                <FieldRow name="Liquidity-constrained" type="badge">
                  A red badge appears on months where you wanted to sell more volatile assets than
                  the daily-volume cap allowed. Surfaces as{" "}
                  <code className="font-mono">unmetDeficit</code> in the data.
                </FieldRow>
              </div>
              <Callout variant="success" className="mt-6" title="Reading runway color">
                Green &gt; 12 months. Gold 6–12 months. Red &lt; 6 months. The summary cards at the
                top of the dashboard mirror these thresholds.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="sharing"
                eyebrow="Share & Export"
                title="Move models between humans (and agents)"
                description="No accounts, no cloud — every model serializes to a URL or a JSON file."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Click <span className="font-medium text-foreground">Share</span> to copy a URL
                  with your model encoded in the hash. Anyone who opens it loads the same model
                  locally — nothing is uploaded. Click{" "}
                  <span className="font-medium text-foreground">Export</span> for a JSON file you
                  can email or commit to a repo.
                </p>
                <p>The URL format looks like:</p>
              </div>
              <div className="mt-3">
                <CodeBlock>https://roughrunway.app/dashboard#model=N4IgZg9hIFwgxgUwM4...</CodeBlock>
              </div>
              <Callout variant="warning" className="mt-6" title="Long URLs are fine">
                Compressed model hashes routinely exceed 2KB. Email clients and Slack handle this
                without issue, but some chat systems truncate at ~4KB — use Export → JSON if you
                hit a wall.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="ai"
                eyebrow="AI Assistant"
                title="Drafting models with Perplexity Sonar"
                description="The assistant only writes inputs — it never runs the projection. The math stays deterministic."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Two AI surfaces exist:
                </p>
                <ul className="space-y-2 pl-1">
                  <li className="flex gap-3">
                    <span className="font-mono text-caption font-semibold text-foreground min-w-[140px]">
                      AI Setup
                    </span>
                    <span>
                      Paste a sentence (&ldquo;5-person Solana DeFi protocol with $2M USDC and 100
                      ETH&rdquo;) and the assistant drafts a full model.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-caption font-semibold text-foreground min-w-[140px]">
                      AI Scenario
                    </span>
                    <span>
                      Describe a market condition (&ldquo;ETH crashes 60% and we lose our biggest
                      customer&rdquo;) and it generates the override layer.
                    </span>
                  </li>
                </ul>
              </div>
              <Callout variant="info" className="mt-6">
                The AI is optional. If <code className="font-mono">PERPLEXITY_API_KEY</code> isn&apos;t
                configured, those buttons return a friendly 503 and everything else still works.
              </Callout>
            </section>

            {/* Closing CTA */}
            <section className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-card p-8 sm:p-10 text-center">
              <p className="text-placard uppercase tracking-[0.2em] text-swiss-red dark:text-aviation-red-dark mb-3">
                <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red dark:bg-aviation-red-dark rounded-sm" />
                Cleared for takeoff
              </p>
              <h2 className="text-h1 font-bold tracking-tight text-foreground">
                Your runway is one paste away.
              </h2>
              <p className="text-body-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                Open the dashboard, paste a description of your org into AI Setup, and you&apos;ll
                have a model in under a minute.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/dashboard">
                    Build model
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
