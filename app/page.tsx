import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
          Built for the Accountant Quits Web3 Crypto Hackathon · Powered by Perplexity
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          When do we run out of money?
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600">
          CryptoRunway is a self-serve treasury runway forecasting tool for
          small crypto orgs. Two runway numbers — cash-only and with realistic
          token liquidation. No login. No backend. Your data never leaves your
          browser.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            data-action="open-dashboard"
            className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Open dashboard
          </Link>
          <Link
            href="https://github.com/"
            className="text-base font-semibold text-neutral-700 hover:text-primary"
          >
            View on GitHub →
          </Link>
        </div>
      </div>

      <footer className="mt-24 text-center text-xs text-neutral-500">
        <p>
          Agent-friendly:{" "}
          <Link href="/.well-known/agent-instructions.md" className="underline">
            /.well-known/agent-instructions.md
          </Link>{" "}
          ·{" "}
          <Link href="/schema/model.json" className="underline">
            /schema/model.json
          </Link>
        </p>
      </footer>
    </main>
  );
}
