import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="text-placard uppercase text-muted-foreground mb-4">
            Treasury runway · Crypto organizations
          </div>
          <h1 className="text-display text-foreground mb-6">Rough Runway</h1>
          <p className="text-body-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
            Financial runway modeling for crypto protocols. Plan, simulate, and
            optimize your treasury with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-16">
            <Button asChild size="lg" variant="knob" className="text-body-lg px-8">
              <Link href="/dashboard">
                Launch the Tool
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="text-body-lg px-8">
              <Link href="/setup">Setup Wizard</Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="text-body-lg px-8">
              <Link
                href="https://github.com/hewi333/roughrunway"
                target="_blank"
              >
                View on GitHub
              </Link>
            </Button>
          </div>

          <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark p-8 max-w-4xl mx-auto mb-16 shadow-sm">
            <div className="text-placard uppercase text-muted-foreground mb-2">
              Powered by
            </div>
            <h2 className="text-h2 text-foreground mb-4">Perplexity</h2>
            <p className="text-body text-muted-foreground mb-8">
              Rough Runway leverages Perplexity's Sonar API to provide real-time
              market insights and AI-powered scenario analysis for crypto
              treasuries.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureTile
                label="Instrument"
                title="Real-time Modeling"
                body="Instantly model your runway with complex treasury compositions."
              />
              <FeatureTile
                label="Autopilot"
                title="AI Scenarios"
                body="Create custom scenarios with natural language using Perplexity."
              />
              <FeatureTile
                label="Radio"
                title="Shareable Models"
                body="Export and share your models with team members via URL."
              />
            </div>
          </div>

          <div className="text-caption text-muted-foreground">
            <p>Built at the Accountant Quits Web3 Hackathon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureTile({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="border border-knob-silver dark:border-knob-silver-dark rounded-panel p-4 text-left">
      <div className="text-placard uppercase text-muted-foreground mb-1">{label}</div>
      <h3 className="text-h3 text-foreground mb-2">{title}</h3>
      <p className="text-body text-muted-foreground">{body}</p>
    </div>
  );
}
