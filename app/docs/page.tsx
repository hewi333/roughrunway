import React from "react";

function DocSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-panel border border-knob-silver dark:border-knob-silver-dark shadow-sm p-6 mb-6">
      <div className="text-placard uppercase text-muted-foreground">{label}</div>
      <h2 className="text-h2 text-foreground mt-1 mb-4">{title}</h2>
      <div className="space-y-4 text-body text-muted-foreground">{children}</div>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-placard uppercase text-muted-foreground">Manual</div>
          <h1 className="text-h1 text-foreground mt-1 mb-4">Rough Runway Documentation</h1>
          <p className="text-body-lg text-muted-foreground">
            Learn how to use Rough Runway to model your crypto protocol's financial runway.
          </p>
        </div>

        <DocSection label="Onboarding" title="Getting Started">
          <p>
            Rough Runway helps you model your crypto protocol's financial runway by
            simulating different scenarios based on your treasury composition and
            burn rate.
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Start by configuring your treasury in the Treasury panel</li>
            <li>Set up your burn categories in the Burn panel</li>
            <li>Add inflow categories in the Inflows panel</li>
            <li>Create scenarios to test different market conditions</li>
            <li>Analyze the projections to understand your runway</li>
          </ol>
        </DocSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocSection label="Treasury" title="Treasury Configuration">
            <p>In the Treasury panel, you can configure your protocol's assets:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stablecoins (USDC, USDT, DAI, etc.)</li>
              <li>Fiat currencies</li>
              <li>Volatile assets (ETH, BTC, native tokens, etc.)</li>
            </ul>
            <p>
              For volatile assets, you can specify liquidity profiles that affect
              how they can be liquidated.
            </p>
          </DocSection>

          <DocSection label="Scenarios" title="Scenario Modeling">
            <p>Scenarios allow you to test different market conditions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Bear market conditions</li>
              <li>Bull market conditions</li>
              <li>Increased burn rates</li>
              <li>New funding rounds</li>
            </ul>
            <p>
              Each scenario can override specific parameters to see how they
              affect your runway.
            </p>
          </DocSection>
        </div>

        <DocSection label="Readout" title="Understanding the Projections">
          <div>
            <h3 className="text-h3 text-foreground">Hard Runway</h3>
            <p>
              Based on liquid assets only (stablecoins and fiat). This represents
              the most conservative estimate of your runway.
            </p>
          </div>
          <div>
            <h3 className="text-h3 text-foreground">Extended Runway</h3>
            <p>
              Includes volatile assets at their haircut value. This represents a
              more optimistic but still conservative estimate.
            </p>
          </div>
          <div>
            <h3 className="text-h3 text-foreground">Liquidity Constraints</h3>
            <p>
              The model will highlight months where liquidity constraints might
              affect your ability to meet obligations.
            </p>
          </div>
        </DocSection>

        <DocSection label="Transmit" title="Export and Share">
          <p>You can export your models and share them with team members:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Export models as compressed text files</li>
            <li>Generate shareable URLs for collaboration</li>
            <li>Import models from other team members</li>
          </ul>
        </DocSection>
      </div>
    </div>
  );
}
