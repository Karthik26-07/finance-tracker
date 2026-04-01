# M6 — Reports

## Purpose
Deep-dive financial analysis and statements with opening/closing balances.

---

## Report Types

### 6.1 Transaction Report
- [ ] Filter by: date range, category, account, tags, amount range, type
- [ ] Paginated table with sort
- [ ] Export: CSV, PDF, Excel

### 6.2 Daily Statement
- [ ] Select account + date
- [ ] Opening balance, transactions, closing balance
- [ ] Navigation: prev/next day

### 6.3 Monthly Statement
- [ ] Select account + month/year
- [ ] Opening balance, daily summary rows (expandable), closing balance
- [ ] Expand/collapse day to see transactions
- [ ] Color-coded rows (green=positive, red=negative)

### 6.4 Category Report
- [ ] Spending per category over period
- [ ] Month-over-month comparison
- [ ] Donut + bar charts
- [ ] Drill-down to transactions

### 6.5 Income vs Expense Report
- [ ] Monthly bar chart (last 12 months)
- [ ] Line overlay: net savings rate
- [ ] Summary stats

### 6.6 Group Settlement Report
- [ ] Outstanding balances per group
- [ ] Settlement history
- [ ] Debt simplification visualization

---

## File Structure

```
app/
├── (dashboard)/
│   └── reports/
│       ├── page.tsx (hub)
│       ├── daily/page.tsx
│       ├── monthly/page.tsx
│       ├── by-category/page.tsx
│       └── cashflow/page.tsx
└── api/
    └── reports/
        ├── summary/route.ts
        ├── daily/route.ts
        ├── monthly/route.ts
        ├── by-category/route.ts
        ├── cashflow/route.ts
        └── export/route.ts

components/
└── reports/
    ├── ReportHub.tsx
    ├── DailyStatement.tsx
    ├── MonthlyStatement.tsx
    ├── CategoryReport.tsx
    ├── CashFlowReport.tsx
    └── ExportButtons.tsx

lib/
├── db/queries/reports.ts
├── utils/reports.ts (balance calculations)
└── utils/export.ts (CSV, PDF, Excel builders)
```

---

## Opening/Closing Balance Computation

### Algorithm

```
Opening Balance for account A on date D:
  = A.opening_balance
  + SUM(all income for A where date < D)
  - SUM(all expense for A where date < D)

Closing Balance for account A on date D:
  = Opening Balance + totalIn - totalOut (for day D)
```

### Pre-computed Snapshots

For performance, use `daily_balance_snapshots` table:

```ts
// lib/db/queries/reports.ts
export async function getDailySnapshot(accountId: string, date: string) {
  // 1. Try pre-computed snapshot
  const [snapshot] = await db.select()
    .from(dailyBalanceSnapshots)
    .where(and(
      eq(dailyBalanceSnapshots.accountId, accountId),
      eq(dailyBalanceSnapshots.date, date)
    ))

  if (snapshot) return snapshot

  // 2. Compute on the fly
  return computeSnapshotOnTheFly(accountId, date)
}
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/reports/page.tsx` - Report type selector
- [ ] `app/(dashboard)/reports/daily/page.tsx` - Daily statement
- [ ] `app/(dashboard)/reports/monthly/page.tsx` - Monthly statement
- [ ] `app/(dashboard)/reports/by-category/page.tsx` - Category breakdown
- [ ] `app/(dashboard)/reports/cashflow/page.tsx` - Income vs expense

### Components
- [ ] `components/reports/ReportHub.tsx` - Type selector
- [ ] `components/reports/DailyStatement.tsx` - Daily view
- [ ] `components/reports/MonthlyStatement.tsx` - Monthly expandable
- [ ] `components/reports/CategoryReport.tsx` - Category with charts
- [ ] `components/reports/CashFlowReport.tsx` - Cash flow trends
- [ ] `components/reports/ExportButtons.tsx` - CSV/PDF/Excel export

### Utils
- [ ] `lib/utils/reports.ts` - Balance calculations
- [ ] `lib/utils/export.ts` - Export formatters
- [ ] `lib/db/queries/reports.ts` - Report queries

---

## Export Implementation

### CSV Export
```ts
// app/api/reports/export/route.ts
export async function GET(req: Request) {
  const rows = await getFilteredTransactions(userId, filters)
  const csv = buildCsv(rows)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="transactions.csv"',
    },
  })
}
```

### PDF Export (via pdfkit)
- Header: User name, date range, account
- Transaction table
- Summary footer: totals, net

### Excel Export (via exceljs)
- Sheet 1: Transactions
- Sheet 2: Category Summary
- Sheet 3: Monthly Summary

---

## Design Reference

**Primary:** `docs/design-ref/reports_m6/` (contains "Recurring Deductions" HTML - actually M8 content)
- `code.html` — Financial analysis dashboard, income vs expense bar chart, spending allocation donut, category breakdown table
- `screen.png` — Full visual reference

**Note:** The folder name suggests M6 Reports, but the HTML content shows recurring deductions/budget tracking. Use this for financial chart patterns and export UI.

**Design Plan:** `docs/04-ui-design-plan.md`
- Bar chart and donut chart styling
- Export button patterns (CSV/PDF/Excel)
- Statement table layouts

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Data visualization guidelines
- Financial report typography

---

## Design Specifications

### Daily Statement
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
├─────────────────────────────────────────────────────────┤
│  Total Debits:  -₹970.00                                │
│  Total Credits: +₹0.00                                  │
├─────────────────────────────────────────────────────────┤
│  Closing Balance (end of day):           ₹45,230.50     │
└─────────────────────────────────────────────────────────┘
```

### Monthly Statement
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
│ ▼ 3 Jan    | 0        | 649.00   | 36,151.00   | 1         │
│    └ Netflix Subscription  Subscriptions  -₹649.00          │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Queries
- [ ] `getDailyStatement(accountId, date)`
- [ ] `getMonthlyStatement(accountId, month, year)`
- [ ] `getCategoryReport(userId, dateRange)`
- [ ] `getCashFlowReport(userId, months)`

### Pages
- [ ] Build report hub
- [ ] Build daily statement page
- [ ] Build monthly statement page
- [ ] Build category report page
- [ ] Build cash flow report page

### Export
- [ ] Implement CSV export
- [ ] Implement PDF export
- [ ] Implement Excel export

### Testing
- [ ] Test balance calculations
- [ ] Test expand/collapse rows
- [ ] Test export formats
