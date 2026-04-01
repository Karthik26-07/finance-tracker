import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 text-text-primary">
      <main className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text-secondary">
            Precision finance with architected clarity
          </div>

          <div className="space-y-6">
            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
              Build stronger budgets, cleaner accounts, and smarter spending.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-text-secondary">
              FinTrack brings your portfolio together in a premium light
              workspace with clear totals, elegant cards, and fast action
              buttons.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-base font-semibold text-white shadow-ambient transition hover:bg-primary-container sm:w-auto"
            >
              Go to Login
            </Link>
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-full border border-border-subtle bg-surface px-6 py-4 text-base font-semibold text-text-primary transition hover:bg-elevated sm:w-auto"
            >
              Create account
            </Link>
          </div>
        </section>

        <section className="rounded-4xl border border-border bg-surface p-8 shadow-ambient">
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-text-secondary">
                  Snapshot
                </p>
                <h2 className="text-3xl font-semibold text-text-primary">
                  Accounts & performance
                </h2>
              </div>
              <span className="inline-flex rounded-full bg-accent-success/10 px-3 py-1 text-xs font-semibold text-accent-success">
                +4.2%
              </span>
            </div>

            <p className="text-text-secondary">
              Track balances, trends, and budget health in a clean, organized
              view built for quick decisions.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-border-subtle bg-background p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-text-secondary">
                <span>Total Net Worth</span>
                <span className="text-text-primary font-semibold">
                  Updated 5m ago
                </span>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold">₹248,590.32</p>
                  <p className="text-text-secondary">Balance across accounts</p>
                </div>
                <span className="rounded-full bg-accent-success/10 px-3 py-1 text-xs font-semibold text-accent-success">
                  +2.4%
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border-subtle bg-background p-5">
                <p className="text-sm text-text-secondary">Expenses</p>
                <p className="mt-4 text-2xl font-bold text-accent-danger">
                  ₹24,980
                </p>
              </div>
              <div className="rounded-3xl border border-border-subtle bg-background p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">Budget usage</p>
                  <span className="text-xs font-semibold text-text-secondary">
                    62%
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/70">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "62%" }}
                  />
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  ₹24,980 of ₹40,000
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
