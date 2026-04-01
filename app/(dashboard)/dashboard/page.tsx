import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display">
          Welcome back, {session?.user?.name || "User"}
        </h1>
        <p className="text-text-secondary/70 mt-2 font-body text-sm">
          {`Here's your financial summary`}
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-6 shadow-ambient">
          <p className="text-sm text-text-secondary/70 font-body">Net Worth</p>
          <p className="text-3xl font-bold text-text-primary font-display mt-2 tabular-nums">
            $0.00
          </p>
        </div>
        <div className="bg-surface rounded-xl p-6 shadow-ambient">
          <p className="text-sm text-text-secondary/70 font-body">
            This Month Income
          </p>
          <p className="text-3xl font-bold text-secondary font-display mt-2 tabular-nums">
            $0.00
          </p>
        </div>
        <div className="bg-surface rounded-xl p-6 shadow-ambient">
          <p className="text-sm text-text-secondary/70 font-body">
            This Month Expenses
          </p>
          <p className="text-3xl font-bold text-tertiary font-display mt-2 tabular-nums">
            $0.00
          </p>
        </div>
      </div>

      <p className="text-sm text-text-secondary/60 font-body">
        💡 M5: Dashboard widgets coming soon
      </p>
    </div>
  );
}
