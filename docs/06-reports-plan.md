# 06 — Reports Module Plan

## Overview

Reports are the analytical backbone of FinTrack. They transform raw transaction data into actionable financial insights. Every report supports filtering, date ranges, and export.

Reports use a combination of:
- **Server Components** for initial data fetch (Drizzle queries at request time)
- **Route Handlers** for client-side filter changes (TanStack Query refetches)
- **`daily_balance_snapshots` table** for fast opening/closing balance lookups

---

## Report 1: Transaction Report

**Purpose**: Search, filter, and browse all transactions.

### Filters
- Date range (with quick picks: Today, This Week, This Month, Custom)
- Account (All / specific account)
- Type (All / Income / Expense / Transfer)
- Category (multi-select)
- Tags (multi-select)
- Amount range (min / max)
- Search text (note, merchant)

### Columns
| Column | Sortable |
|--------|----------|
| Date | ✅ |
| Description/Note | ❌ |
| Category | ✅ |
| Account | ✅ |
| Type | ✅ |
| Amount | ✅ |
| Tags | ❌ |

### Summary Row
At top of filtered results:
```
Showing 48 transactions  |  Total In: ₹75,000  |  Total Out: ₹32,450  |  Net: +₹42,550
```

### Export Options
- CSV (all columns, streamed response)
- PDF (formatted table with header/footer via `pdfkit`)
- Excel (with formatting via `exceljs`)

---

## Report 2: Daily Statement

**Purpose**: Mirror a bank's daily statement — opening balance, transactions, closing balance.

### UI Layout
```
┌─────────────────────────────────────────────────────────┐
│  Daily Statement                                        │
│  Account: [HDFC Savings ▼]    Date: [14 Jan 2025 📅]   │
├─────────────────────────────────────────────────────────┤
│  Opening Balance (start of day):         ₹46,200.50     │
├─────────────────────────────────────────────────────────┤
│  Time     Description        Category    Amount         │
│  ─────────────────────────────────────────────          │
│  09:15    Zomato             Food        -₹450.00       │
│  12:00    Petrol             Transport   -₹500.00       │
│  14:30    ATM Withdrawal     Cash        -₹20.00 (fee)  │
├─────────────────────────────────────────────────────────┤
│  Total Debits:  -₹970.00                                │
│  Total Credits: +₹0.00                                  │
├─────────────────────────────────────────────────────────┤
│  Closing Balance (end of day):           ₹45,230.50     │
└─────────────────────────────────────────────────────────┘
```

### Navigation
- ← Previous Day / Next Day →
- Jump to date via calendar picker (shadcn Popover + Calendar)

---

## Report 3: Monthly Statement

**Purpose**: Month-level view with day-by-day running balance — like a bank statement.

### UI Layout
```
┌──────────────────────────────────────────────────────────────┐
│  Monthly Statement                                           │
│  Account: [HDFC Savings ▼]    Month: [January 2025 ▼]       │
├──────────────────────────────────────────────────────────────┤
│  Opening Balance (1 Jan):                      ₹38,000.00   │
├──────────────────────────────────────────────────────────────┤
│  Date      | In (₹)   | Out (₹)  | Balance (₹) | Txns      │
│  ──────────────────────────────────────────────────────────  │
│ ▶ 1 Jan    | 0        | 0        | 38,000.00   | 0         │
│ ▶ 2 Jan    | 0        | 1,200.00 | 36,800.00   | 2         │
│ ▼ 3 Jan    | 0        | 649.00   | 36,151.00   | 1         │
│    └ Netflix Subscription  Subscriptions  -₹649.00          │
│ ▶ 4 Jan    | 75,000   | 0        | 111,151.00  | 1         │
│   ...                                                        │
├──────────────────────────────────────────────────────────────┤
│  Total Income:   ₹75,000.00                                 │
│  Total Expense:  ₹42,769.50                                 │
│  Net Change:     +₹32,230.50                                │
│  Closing Balance (31 Jan):                     ₹70,230.50   │
└──────────────────────────────────────────────────────────────┘
```

### Features
- Expand/collapse any day to see its transactions (client-side, no extra fetch)
- Color-coded rows: green days (net positive), red days (net negative)
- Month navigation arrows
- Print/PDF export

---

## Report 4: Category Breakdown

**Purpose**: Understand where money went by category.

### UI Layout
- Donut chart (top): share of each category
- Bar chart: category spending month-over-month (last 6 months)
- Table: Category | This Month | Last Month | % Change | Budget | % Used

### Drill-Down
Click any category → filter transactions to that category + period

---

## Report 5: Cash Flow Report

**Purpose**: Income vs Expense trend over time.

### Charts
- Stacked bar: monthly income (green) vs expense (red) for last 12 months
- Line overlay: net savings per month
- Summary stats: average monthly income, average expense, savings rate

---

## Report 6: Group Settlement Report

**Purpose**: See group financial activity and outstanding balances.

### Screens

#### 6.1 Group Overview
```
Group: Goa Trip 2025
Period: 13-16 Jan 2025
Total Group Spend: ₹24,500

Member Breakdown:
  Ravi    Paid: ₹14,000  Owes: ₹6,125  Net: +₹7,875
  You     Paid: ₹4,800   Owes: ₹6,125  Net: -₹1,325
  Priya   Paid: ₹3,200   Owes: ₹6,125  Net: -₹2,925
  Arun    Paid: ₹2,500   Owes: ₹6,125  Net: -₹3,625
```

#### 6.2 Settlement Plan (Simplified)
```
Arun pays Ravi:  ₹3,625
Priya pays Ravi: ₹2,925
You pay Ravi:    ₹1,325
```
Uses debt-simplification algorithm to minimize the number of transactions needed.

#### 6.3 Settlement History
Table of all recorded settlements with date, payer, receiver, amount, method.

---

## Opening & Closing Balance Computation

### Algorithm

```
Opening Balance for account A on date D:
  = A.opening_balance
  + SUM(all income transactions for A where date < D)
  - SUM(all expense transactions for A where date < D)

Closing Balance for account A on date D:
  = Opening Balance for D
  + SUM(income transactions on D)
  - SUM(expense transactions on D)
```

### Pre-computation Strategy

For performance, we maintain `daily_balance_snapshots` in PostgreSQL. There is no Redis layer — all balance data comes directly from the database.

```ts
// lib/db/queries/reports.ts
import { db } from '@/lib/db'
import { dailyBalanceSnapshots, transactions, accounts } from '@/lib/db/schema'
import { eq, and, lt, gte, lte, sum, sql } from 'drizzle-orm'

export async function getDailySnapshot(accountId: string, date: string) {
  // 1. Try pre-computed snapshot in DB
  const [snapshot] = await db.select()
    .from(dailyBalanceSnapshots)
    .where(and(
      eq(dailyBalanceSnapshots.accountId, accountId),
      eq(dailyBalanceSnapshots.date, date)
    ))
    .limit(1)

  if (snapshot) return snapshot

  // 2. Compute on the fly from transactions
  return computeSnapshotOnTheFly(accountId, date)
}

async function computeSnapshotOnTheFly(accountId: string, date: string) {
  const [account] = await db.select({ openingBalance: accounts.openingBalance })
    .from(accounts)
    .where(eq(accounts.id, accountId))

  const [priorTotals] = await db.select({
    totalIn:  sql<number>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)`,
    totalOut: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)`,
  }).from(transactions)
    .where(and(
      eq(transactions.accountId, accountId),
      lt(transactions.date, date)
    ))

  const opening = Number(account.openingBalance) + priorTotals.totalIn - priorTotals.totalOut

  const [dayTotals] = await db.select({
    totalIn:  sql<number>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)`,
    totalOut: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)`,
  }).from(transactions)
    .where(and(
      eq(transactions.accountId, accountId),
      eq(transactions.date, date)
    ))

  return {
    opening,
    closing:  opening + dayTotals.totalIn - dayTotals.totalOut,
    totalIn:  dayTotals.totalIn,
    totalOut: dayTotals.totalOut,
  }
}
```

### Snapshot Population

Snapshots are written by the Vercel Cron job (`/api/cron/process-recurring`) which runs nightly. When a historical transaction is edited or deleted, the relevant snapshots are invalidated and recomputed immediately via a Drizzle `DELETE` + re-insert.

---

## Export Implementation

### CSV Export (Streaming)

```ts
// app/api/reports/export/route.ts
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'csv'

  const rows = await getFilteredTransactions(session.user.id, searchParams)

  if (format === 'csv') {
    const csv = buildCsv(rows)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      },
    })
  }

  if (format === 'pdf') {
    const pdfBuffer = await buildPdf(rows)
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="transactions.pdf"',
      },
    })
  }
}
```

### CSV Format

```
Date,Description,Category,Account,Type,Amount,Tags,Note
2025-01-14,Zomato,Food & Dining,HDFC Savings,Expense,-450.00,"food,lunch",Biryani
```

### PDF Export
- Header: User name, date range, account
- Transaction table
- Summary footer: totals, net
- Generated via `pdfkit` on the server

### Excel Export
- Sheet 1: Transactions
- Sheet 2: Category Summary
- Sheet 3: Monthly Summary
- Generated via `exceljs`
