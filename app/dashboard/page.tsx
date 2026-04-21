/**
 * Dashboard page — the main app.
 *
 * This is a SCAFFOLD. The implementation harness should replace this with
 * the real dashboard per docs/03-ARCHITECTURE.md §"Page Layout (Dashboard)".
 *
 * Target layout:
 *   AppShell (fixed 320px sidebar + main content area)
 *     Sidebar: TreasuryPanel, BurnPanel, InflowPanel, LiquidationPanel, ScenarioPanel
 *     Main: RunwaySummaryCards, ProjectionChart, MonthlyBreakdownTable, ScenarioComparison
 *
 * Integration notes:
 *   - Zustand store in lib/store.ts (to be built) holds the CryptoRunwayModel
 *   - useMemo over computeProjection(model) from lib/projection-engine.ts
 *   - On first visit, seed with the Nexus Labs demo model (see docs/04-BUILD-PLAN.md §"Demo data")
 *   - Auto-hydrate from the #model= URL fragment if present (see docs/07-AGENT-ARCHITECTURE.md §"Shareable URLs")
 *   - Mobile viewport → render MobileInterstitial instead
 */

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <div className="max-w-xl rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Dashboard placeholder</h1>
        <p className="mt-4 text-neutral-600">
          The dashboard UI will be built per{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
            docs/03-ARCHITECTURE.md
          </code>
          . The projection engine, types, and scenario engine are already
          implemented and tested — see{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
            lib/
          </code>{" "}
          and{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
            tests/
          </code>
          .
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Run <code>npm test</code> to validate the engine against the 9 canonical
          fixtures.
        </p>
      </div>
    </main>
  );
}
