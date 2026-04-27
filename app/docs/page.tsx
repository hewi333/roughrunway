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
            Documentation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mt-3 leading-[1.05]">
            Model your runway.
          </h1>
          <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl">
            Set up a treasury, run scenarios, and read the projection chart. No
            backend, no signup — your model lives in the browser and travels by
            shareable URL.
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
                description="A deterministic projection engine over a 12, 15, or 18-month horizon."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  RoughRunway answers two questions:{" "}
                  <span className="font-medium text-foreground">how long the money lasts</span>{" "}
                  on liquid reserves alone (hard runway), and{" "}
                  <span className="font-medium text-foreground">how much further it goes</span>{" "}
                  if you liquidate volatile assets at a haircut (extended runway).
                </p>
                <p>
                  The projection is pure math — no AI in the engine, no random
                  sampling. Every dollar of burn, every token sold, and every
                  haircut is reproducible from the inputs. AI assists only with
                  drafting and editing inputs.
                </p>
              </div>
              <Callout variant="info" className="mt-6">
                Models never leave the browser. There is no database. Sharing
                encodes the entire model into the URL hash with{" "}
                <code className="font-mono">lz-string</code>.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="quickstart"
                eyebrow="Quick start"
                title="From zero to runway"
              />
              <ol className="space-y-4">
                {[
                  ["Open the dashboard.", "Either load the demo model or jump in with a clean slate."],
                  ["Add your treasury.", "Stablecoins, fiat, and any volatile assets you hold."],
                  ["Define burn.", "Headcount, infrastructure, marketing — anything that costs money each month."],
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
                Prefer to describe your org in words? Use the AI setup wizard at{" "}
                <code className="font-mono">/setup</code> to draft a model from a
                short description, or use the{" "}
                <span className="font-medium">Edit in words</span> box inside any
                panel to patch fields with natural language.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="treasury"
                eyebrow="Treasury"
                title="What you hold today"
                description="Three asset classes. Stablecoins and fiat fund burn first; volatile assets are liquidated only when reserves run out."
              />
              <div className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-card p-5">
                <FieldRow name="stablecoins" type="USD">
                  USDC, USDT, DAI, and similar. Treated as cash equivalents — no
                  haircut.
                </FieldRow>
                <FieldRow name="fiat" type="USD">
                  Cash held in a bank account. Spent alongside stablecoins.
                </FieldRow>
                <FieldRow name="volatileAssets[]" type="tokens × price">
                  ETH, BTC, native tokens, and alts. Each carries a haircut, a
                  liquidity profile, and a liquidation priority that determines
                  the order assets are sold.
                </FieldRow>
              </div>
              <Callout variant="warning" className="mt-6" title="Liquidity matters">
                Volatile assets configured with{" "}
                <code className="font-mono">maxSellUnit: percent_of_volume</code>{" "}
                are capped by daily volume × percent. Months where the cap binds
                are flagged as <em>liquidity-constrained</em> in the chart and
                in the Monthly Breakdown table.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="burn"
                eyebrow="Burn"
                title="What leaves the treasury each month"
                description="A flat monthly USD figure per category. Use scenarios to model raises and cuts rather than editing the baseline."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Burn is the sum of all category amounts per month. The engine
                  subtracts inflows to get{" "}
                  <span className="font-medium text-foreground">net burn</span>,
                  then draws from stablecoins and fiat first; volatile assets are
                  only sold once liquid reserves are depleted.
                </p>
              </div>
              <Callout variant="tip" className="mt-6">
                Headcount-heavy teams can keep a single Headcount category and
                model hires or cuts via a scenario&apos;s{" "}
                <code className="font-mono">headcountChange</code> override.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="inflows"
                eyebrow="Inflows"
                title="What comes in"
                description="Revenue, grants, scheduled raises, and token releases — modeled as monthly amounts or one-time events."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Inflows reduce net burn for the month they land in. A one-time
                  $500K grant in month 4 produces a single positive blip; a
                  $50K/mo recurring revenue line flattens the curve across the
                  horizon.
                </p>
              </div>
            </section>

            <section>
              <SectionHeading
                id="scenarios"
                eyebrow="Scenarios"
                title="Stress-test without rewriting the base"
                description="A scenario is a layer of overrides on top of the base model. The base never changes — overlays produce alternate projection lines on the chart."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>Built-in templates cover the common stress cases:</p>
                <ul className="space-y-2 pl-1">
                  {[
                    ["Bear Market", "Native -50%, ETH -30%, revenue -30%, native haircut +10."],
                    ["Aggressive Hiring", "Add headcount and the corresponding monthly burn."],
                    ["Emergency Cuts", "Trim non-essential burn categories."],
                    ["Token Crash", "Shock the native token price downward."],
                  ].map(([name, what]) => (
                    <li key={name} className="flex gap-3">
                      <span className="font-mono text-caption font-semibold text-foreground min-w-[160px]">
                        {name}
                      </span>
                      <span>{what}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Callout variant="info" className="mt-6">
                Scenarios reference base-model IDs. If you delete a category that
                a scenario overrides, that override is silently skipped — the
                scenario keeps applying its other rules.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="projections"
                eyebrow="Projections"
                title="Reading the chart"
                description="Two runway lines and an optional composition stack."
              />
              <div className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-card p-5 space-y-0">
                <FieldRow name="Hard runway" type="solid line">
                  Stablecoin + fiat balance over time. The first month it hits
                  zero is your hard-runway depletion date.
                </FieldRow>
                <FieldRow name="Extended runway" type="dashed line">
                  Hard balance plus proceeds from liquidating volatile assets at
                  their haircut. Always ≥ hard runway.
                </FieldRow>
                <FieldRow name="Composition" type="stacked area">
                  Toggle on to see the stables / fiat / volatile breakdown each
                  month. Useful for spotting when liquidations begin.
                </FieldRow>
                <FieldRow name="Liquidity-constrained" type="badge">
                  A red badge marks months where the engine wanted to sell more
                  volatile assets than the liquidity cap allowed. The shortfall
                  carries forward as{" "}
                  <code className="font-mono">unmetDeficit</code>.
                </FieldRow>
              </div>
              <Callout variant="success" className="mt-6" title="Status thresholds">
                Healthy &gt; 12 months. Warning 6–12 months. Critical &lt; 6
                months. The summary cards at the top of the dashboard use the
                same thresholds.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="sharing"
                eyebrow="Share & export"
                title="Move models between people and agents"
                description="No accounts and no cloud — every model serializes to a URL or a JSON file."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>
                  Click <span className="font-medium text-foreground">Share</span>{" "}
                  to copy a URL with the model encoded in the hash. Anyone who
                  opens it loads the same model locally; nothing is uploaded.
                  Click <span className="font-medium text-foreground">Export</span>{" "}
                  for a JSON file you can email or commit to a repo.
                </p>
                <p>The URL format looks like:</p>
              </div>
              <div className="mt-3">
                <CodeBlock>https://roughrunway.com/dashboard#model=N4IgZg9hIFwgxgUwM4...</CodeBlock>
              </div>
              <Callout variant="warning" className="mt-6" title="Long URLs are expected">
                Compressed model hashes routinely exceed 2KB. Email and most
                chat clients handle this without issue. If a tool truncates the
                link, use Export → JSON instead.
              </Callout>
            </section>

            <section>
              <SectionHeading
                id="ai"
                eyebrow="AI assistant"
                title="Drafting and editing with Perplexity Sonar"
                description="The assistant only writes inputs. The projection itself stays deterministic."
              />
              <div className="space-y-4 text-body text-muted-foreground">
                <p>Three AI surfaces are available:</p>
                <ul className="space-y-2 pl-1">
                  <li className="flex gap-3">
                    <span className="font-mono text-caption font-semibold text-foreground min-w-[140px]">
                      Setup wizard
                    </span>
                    <span>
                      At <code className="font-mono">/setup</code>, paste a
                      description of your org and the assistant drafts a full
                      model.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-caption font-semibold text-foreground min-w-[140px]">
                      Edit in words
                    </span>
                    <span>
                      Inside Treasury, Burn, and Inflows, describe a change in
                      plain English — the assistant returns a diff you can
                      review and apply.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-caption font-semibold text-foreground min-w-[140px]">
                      Scenario builder
                    </span>
                    <span>
                      Describe a market condition and the assistant generates
                      the override layer for a new scenario.
                    </span>
                  </li>
                </ul>
              </div>
              <Callout variant="info" className="mt-6">
                AI is optional. If{" "}
                <code className="font-mono">PERPLEXITY_API_KEY</code> is not
                configured, AI surfaces return a 503 and everything else
                continues to work.
              </Callout>
            </section>

            {/* Closing CTA */}
            <section className="rounded-panel border border-knob-silver dark:border-knob-silver-dark bg-card p-8 sm:p-10 text-center">
              <p className="text-placard uppercase tracking-[0.2em] text-swiss-red dark:text-aviation-red-dark mb-3">
                <span className="inline-block h-2 w-2 mr-2 align-middle bg-swiss-red dark:bg-aviation-red-dark rounded-sm" />
                Ready to model
              </p>
              <h2 className="text-h1 font-bold tracking-tight text-foreground">
                Build a model in under a minute.
              </h2>
              <p className="text-body-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                Open the dashboard or describe your org in the setup wizard to
                get a runway projection you can share with one link.
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
