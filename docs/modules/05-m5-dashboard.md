# M5 — Dashboard & Analytics

## Purpose
At-a-glance financial health overview with widgets, charts, and key metrics.

---

## Features

### Dashboard Widgets
- [ ] Net Worth card (sum of all account balances)
- [ ] This Month: Income vs Expense bar + net
- [ ] Spending by Category donut chart
- [ ] Daily Spend Trend line chart (last 30 days)
- [ ] Account Balances mini cards
- [ ] Top 5 Expenses this month
- [ ] Budget Status progress bars
- [ ] Upcoming Recurring (next 7 days)
- [ ] Recent Transactions list

### Date Range
- [ ] Date range picker (quick pills + custom)
- [ ] Quick selects: Today, This Week, This Month, Last Month, Custom

### Charts
- [ ] Donut: Category split (Recharts)
- [ ] Line: Daily trend (Recharts)
- [ ] Bar: Monthly income vs expense
- [ ] Sparklines: Account balance mini-trends

---

## File Structure

```
app/
└── (dashboard)/
    └── dashboard/
        └── page.tsx

components/
└── dashboard/
    ├── DashboardGrid.tsx
    ├── NetWorthCard.tsx
    ├── IncomeExpenseCard.tsx
    ├── SpendingByCategory.tsx
    ├── DailyTrendChart.tsx
    ├── AccountCards.tsx
    ├── RecentTransactions.tsx
    ├── UpcomingRecurring.tsx
    ├── BudgetProgress.tsx
    └── DateRangePicker.tsx

lib/
├── db/queries/dashboard.ts
└── utils/chartConfig.ts
```

---

## Widget Specifications

### Net Worth Card
```
┌──────────────────────────────┐
│  TOTAL NET WORTH             │
│  ₹2,45,300.00               │
│  ↑ +₹12k this month         │
└──────────────────────────────┘
```

### Income vs Expense (This Month)
```
┌──────────────────────────────┐
│  THIS MONTH                  │
│  In:  ₹75,000                │
│  Out: ₹42,000                │
│  Net: +₹33,000              │
└──────────────────────────────┘
```

### Spending by Category (Donut)
```
┌──────────────────────────────┐
│  SPENDING BY CATEGORY        │
│       [Donut Chart]          │
│  Housing    40%  ████       │
│  Food       25%  ██▌        │
│  Transport  15%  █▌         │
└──────────────────────────────┘
```

### Daily Trend
```
┌──────────────────────────────┐
│  DAILY SPEND TREND           │
│  /\/\/\___/\/\               │
│  Last 30 days                │
└──────────────────────────────┘
```

---

## Dashboard Queries (`lib/db/queries/dashboard.ts`)

```ts
// Get net worth (sum of all account balances)
export async function getNetWorth(userId: string)

// Get income/expense summary for date range
export async function getIncomeExpenseSummary(userId: string, dateRange)

// Get spending by category
export async function getSpendingByCategory(userId: string, dateRange)

// Get daily trend data
export async function getDailyTrend(userId: string, days: number)

// Get account balances
export async function getAccountBalances(userId: string)

// Get upcoming recurring
export async function getUpcomingRecurring(userId: string)
```

---

## Components to Create

### Page
- [ ] `app/(dashboard)/dashboard/page.tsx` - Dashboard grid (design ref: `dashboard_m5/code.html`)

### Widgets
- [ ] `components/dashboard/NetWorthCard.tsx`
- [ ] `components/dashboard/IncomeExpenseCard.tsx`
- [ ] `components/dashboard/SpendingByCategory.tsx`
- [ ] `components/dashboard/DailyTrendChart.tsx`
- [ ] `components/dashboard/AccountCards.tsx`
- [ ] `components/dashboard/RecentTransactions.tsx`
- [ ] `components/dashboard/UpcomingRecurring.tsx`
- [ ] `components/dashboard/BudgetProgress.tsx`
- [ ] `components/dashboard/DateRangePicker.tsx`

### Utils
- [ ] `lib/utils/chartConfig.ts` - Recharts config (colors, fonts)
- [ ] `lib/utils/formatCurrency.ts` - Currency formatting

---

## Design Reference

**Primary:** `docs/design-ref/dashboard_m5/`
- `code.html` — Net worth card, income/expense cards, spending velocity bar chart, donut chart, recent activity table
- `screen.png` — Full visual reference

**Design Plan:** `docs/04-ui-design-plan.md`
- Bento grid layout system
- Chart styling (Recharts integration)
- Progress bar components

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Widget card elevation and surface hierarchy
- Data visualization color palette

---

## Design Specifications

### Layout (Bento Grid)
```
┌─ NET WORTH ─────┐ ┌─ THIS MONTH ──────┐
│ ₹2,45,300       │ │ In: ₹75k  Out: ₹42k│
│ +₹12k this month│ │ Net: +₹33k         │
└─────────────────┘ └───────────────────┘

┌─ SPENDING BY CATEGORY ────┐ ┌─ DAILY TREND ─────────┐
│                           │ │ /\/\/\___/\/\         │
│  [Donut Chart]            │ │                       │
│                           │ │ Last 30 days          │
└───────────────────────────┘ └───────────────────────┘

┌─ ACCOUNTS ───────────────────────────────────────────┐
│  HDFC: ₹45,230  Cash: ₹2,100  GPay: ₹12,500          │
└──────────────────────────────────────────────────────┘

┌─ RECENT TRANSACTIONS ────┐ ┌─ UPCOMING RECURRING ───┐
│  Zomato    ₹450  Food    │ │ Netflix  ₹649  3 Jan   │
│  Salary  ₹75000  Income  │ │ Rent   ₹12000  5 Jan   │
│  ...                     │ │ ...                     │
└──────────────────────────┘ └────────────────────────┘
```

### Grid System
- 12-column CSS Grid
- Widgets span 3/4/6/12 columns based on importance
- Responsive: stack on mobile, 2-col on tablet, 3-4 col on desktop

### Colors
- **Net Worth**: Primary (`#003178`)
- **Income**: Secondary (`#006b5f`) green
- **Expense**: Tertiary (`#71000c`) coral/red
- **Charts**: Categorical palette (6 colors)

---

## Implementation Checklist

### Queries
- [ ] `getNetWorth(userId)`
- [ ] `getIncomeExpenseSummary(userId, dateRange)`
- [ ] `getSpendingByCategory(userId, dateRange)`
- [ ] `getDailyTrend(userId, days)`
- [ ] `getAccountBalances(userId)`
- [ ] `getUpcomingRecurring(userId)`
- [ ] `getRecentTransactions(userId, limit)`

### Components
- [ ] Build all widget components
- [ ] Build date range picker
- [ ] Build dashboard grid layout

### Charts
- [ ] Configure Recharts with design tokens
- [ ] Build donut chart component
- [ ] Build line chart component
- [ ] Build bar chart component

### Testing
- [ ] Test date range changes
- [ ] Test chart rendering
- [ ] Test responsive layout
