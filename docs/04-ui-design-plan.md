# 04 — UI / UX Design Plan

## Design Direction

**Aesthetic**: Clean financial-grade UI — dark-mode-first with a deep navy/slate palette, sharp typography, data-dense but not cluttered. Think "premium banking app meets developer tool."

**Tone**: Authoritative, trustworthy, fast. Users are handling real money — the UI must feel stable and precise.

---

## Design Tokens

### Color Palette

```css
:root {
  /* Background layers */
  --bg-base:        #0F1117;   /* Page background */
  --bg-surface:     #161B27;   /* Cards, panels */
  --bg-elevated:    #1E2435;   /* Modals, dropdowns */
  --bg-highlight:   #252D42;   /* Hover states */

  /* Brand */
  --accent-primary: #4F8EF7;   /* Blue — CTAs, links */
  --accent-success: #34D399;   /* Green — income, positive */
  --accent-danger:  #F87171;   /* Red — expense, alerts */
  --accent-warning: #FBBF24;   /* Yellow — budget warnings */
  --accent-purple:  #A78BFA;   /* Purple — group expenses */

  /* Text */
  --text-primary:   #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted:     #475569;

  /* Borders */
  --border-subtle:  #1E2D40;
  --border-default: #2A3A50;

  /* Chart colors (categorical) */
  --chart-1: #4F8EF7;
  --chart-2: #34D399;
  --chart-3: #FBBF24;
  --chart-4: #F87171;
  --chart-5: #A78BFA;
  --chart-6: #38BDF8;
  --chart-7: #FB7185;
}
```

### Typography

```css
/* Display / Headings */
--font-display: 'Sora', sans-serif;   /* Numbers, big stats */

/* Body */
--font-body: 'DM Sans', sans-serif;   /* UI text, labels */

/* Monospace (amounts, IDs) */
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
--text-xs:   11px;
--text-sm:   13px;
--text-base: 14px;
--text-md:   16px;
--text-lg:   20px;
--text-xl:   24px;
--text-2xl:  32px;
--text-3xl:  48px;
```

### Tailwind Config Extension (`tailwind.config.ts`)

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:      '#0F1117',
          surface:   '#161B27',
          elevated:  '#1E2435',
          highlight: '#252D42',
        },
        accent: {
          primary: '#4F8EF7',
          success: '#34D399',
          danger:  '#F87171',
          warning: '#FBBF24',
          purple:  '#A78BFA',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

### Spacing & Radius

```css
--radius-sm:  4px;
--radius-md:  8px;
--radius-lg:  12px;
--radius-xl:  16px;
--radius-pill: 999px;
```

---

## Layout System

### Shell Layout (App Router)

The layout is defined in `app/(dashboard)/layout.tsx`. The sidebar is a persistent Server Component; only interactive sub-parts (collapse toggle, active link highlight) are Client Components.

```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)          │  MAIN CONTENT AREA           │
│                           │                              │
│  Logo                     │  Top Bar (breadcrumb, user)  │
│  ─────────────            │  ─────────────────────────── │
│  Dashboard                │                              │
│  Transactions             │   <children />               │
│  Accounts                 │   (Server or Client page)    │
│  Groups                   │                              │
│  Reports                  │                              │
│  Recurring                │                              │
│  Budgets                  │                              │
│  ─────────────            │                              │
│  Settings                 │                              │
│  Profile                  │                              │
└──────────────────────────────────────────────────────────┘
```

On smaller screens (< 1024px): sidebar collapses to an icon rail or hamburger menu. No bottom navigation — this is a web-first app.

```ts
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-bg-base">
      <Sidebar user={session.user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

### Grid System
- Dashboard: 12-col CSS Grid, widgets span 3/4/6/12 columns
- Reports: Full-width tables with sticky headers
- Modals: Centered, max-width 560px, backdrop blur via shadcn Dialog

---

## Component Library

### File Structure

```
components/
├── ui/                   # shadcn/ui primitives (Button, Dialog, etc.)
├── layout/
│   ├── Sidebar.tsx       # Server Component
│   ├── TopBar.tsx        # Client Component (user menu)
│   └── PageHeader.tsx
├── charts/
│   ├── DonutChart.tsx    # Recharts wrapper — spending by category
│   ├── LineChart.tsx     # Daily spend trend
│   ├── BarChart.tsx      # Monthly income vs expense
│   └── Sparkline.tsx     # Account balance mini-trend
├── forms/
│   ├── TransactionForm.tsx    # Client Component
│   ├── AccountForm.tsx
│   ├── GroupExpenseForm.tsx
│   └── RecurringRuleForm.tsx
└── transactions/
    ├── TransactionList.tsx     # Client Component (TanStack Query)
    ├── TransactionItem.tsx
    └── TransactionFilters.tsx
```

### Financial Amount Display

```ts
// components/ui/Amount.tsx
interface AmountProps {
  value: number
  type?: 'income' | 'expense' | 'neutral'
  size?: 'sm' | 'base' | 'lg' | 'xl'
}

// Amounts: font-mono, right-aligned
// Income:  text-accent-success
// Expense: text-accent-danger
// Neutral: text-text-primary
```

### Transaction List Item

```
┌─────────────────────────────────────────────────┐
│  🍕  Food & Dining          ₹450.00            │
│      Zomato · 14 Jan        Savings Account     │
└─────────────────────────────────────────────────┘
Icon | Category+Note | Date+Account | Amount
```

### Account Card

```
┌──────────────────────────────┐
│  💳 HDFC Savings             │
│                              │
│  ₹45,230.50                 │
│  ↑ ₹12,000  ↓ ₹8,400       │
│  (this month)                │
└──────────────────────────────┘
```

### Budget Progress Bar

```
Food & Dining              ₹3,200 / ₹5,000
[████████████░░░░░░░░░]   64%
```
Green < 60%, Yellow 60-80%, Red > 80%

### Stat Card (Dashboard Widget)

```
┌──────────────────────────────┐
│  TOTAL EXPENSES              │
│  ₹28,450.00                 │
│  ▲ 12% from last month      │
└──────────────────────────────┘
```

---

## Screen Wireframes

### Dashboard

```
┌─ NET WORTH ──────────┐ ┌─ THIS MONTH ─────────┐
│ ₹2,45,300            │ │ In: ₹75k  Out: ₹42k  │
│ +₹12k this month     │ │ Net: +₹33k            │
└──────────────────────┘ └──────────────────────┘

┌─ SPENDING BY CATEGORY ────┐ ┌─ DAILY TREND ───────────┐
│                           │ │ /\/\/\___/\/\           │
│  [Donut Chart]            │ │                         │
│                           │ │ Last 30 days            │
└───────────────────────────┘ └─────────────────────────┘

┌─ ACCOUNTS ────────────────────────────────────────────┐
│  HDFC: ₹45,230  Cash: ₹2,100  GPay: ₹12,500           │
└───────────────────────────────────────────────────────┘

┌─ RECENT TRANSACTIONS ─────┐ ┌─ UPCOMING RECURRING ────┐
│  Zomato    ₹450  Food     │ │ Netflix  ₹649  3 Jan     │
│  Salary  ₹75000  Income   │ │ Rent   ₹12000  5 Jan     │
│  ...                      │ │ ...                      │
└───────────────────────────┘ └─────────────────────────┘
```

Dashboard page is a **Server Component** — data fetched via Drizzle on the server for instant first paint. Interactive widgets (date range picker, account filter) are Client Components that refetch via TanStack Query.

### Add Transaction Modal

```
┌─────────────────────────────────────────────┐
│  Add Transaction                      [✕]   │
│ ─────────────────────────────────────────── │
│  [Expense]  [Income]  [Transfer]            │
│                                             │
│  Amount:  ₹ [_______________]               │
│  Account: [HDFC Savings    ▼]               │
│  Category:[Food & Dining   ▼]               │
│  Date:    [14 Jan 2025     📅]              │
│  Note:    [_______________]                 │
│  Tags:    [+Add tag]                        │
│  Receipt: [📷 Attach → Supabase Storage]    │
│                                             │
│  🔄 Make Recurring                          │
│                                             │
│  [Cancel]              [Save Transaction]   │
└─────────────────────────────────────────────┘
```

Form submits via a **Server Action** (`actions/transactions.ts`). On success, `revalidatePath` refreshes the transaction list without a full page reload.

### Group Expense Screen

```
┌─ Goa Trip 2025 ───────────────────────────────────────┐
│  Members: Ravi, Priya, Arun, You                        │
│  Total Spent: ₹24,500   Your Share: ₹6,125             │
│                                                         │
│  You owe Ravi: ₹1,200    Priya owes you: ₹800           │
│                                                         │
│  [+ Add Expense]  [Settle Up]                           │
│ ─────────────────────────────────────────────────────── │
│  Hotel Booking    ₹12,000   Paid by: Ravi   14 Jan      │
│    You: ₹3,000  Priya: ₹3,000  Arun: ₹3,000  Ravi: ₹3k │
│  Beach Dinner     ₹2,400    Paid by: You     15 Jan     │
│    You: ₹600   Priya: ₹600   ...                        │
└───────────────────────────────────────────────────────┘
```

---

## Interaction Patterns

### Quick Add (Floating Action Button)
- FAB on all dashboard pages (bottom-right)
- Click → opens shadcn Dialog with compact transaction form
- Fields: Amount + Category only (minimum viable)
- "More options" expands to full form

### Date Navigation (Reports)
- Arrow buttons to go prev/next month
- Click date header → shadcn Popover with calendar
- Quick pills: Today, This Week, This Month, Last Month, Custom

### Optimistic Updates (TanStack Query)
For transactions and other mutations, use `useMutation` with `onMutate` optimistic update + `onError` rollback so the UI feels instant even before the server responds.

### Empty States
Each empty list has an illustration + CTA:
- No transactions: "No expenses yet. Click + to add your first."
- No groups: "Planning a trip? Create a group to split expenses."
- No budgets: "Set a budget to track your spending limits."

### Loading States
- Dashboard widgets: skeleton cards (shadcn Skeleton) rendered as Server Component fallback in `loading.tsx`
- Tables: skeleton rows while data loads

---

## Next.js-Specific Patterns

### Server vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| `layout.tsx` | Server | Auth check, sidebar render |
| `page.tsx` (most pages) | Server | Initial data fetch, SEO |
| `TransactionList.tsx` | Client | Filtering, pagination, mutations |
| `DashboardCharts.tsx` | Client | Recharts requires DOM APIs |
| `TransactionForm.tsx` | Client | React Hook Form, interactivity |
| `Sidebar.tsx` (links) | Server | Static nav, no interactivity needed |
| `TopBar.tsx` (user menu) | Client | Dropdown, session display |

### Route Loading with `loading.tsx`

```ts
// app/(dashboard)/transactions/loading.tsx
import { TransactionListSkeleton } from '@/components/transactions/TransactionListSkeleton'
export default function Loading() {
  return <TransactionListSkeleton />
}
```

### Error Handling with `error.tsx`

```ts
// app/(dashboard)/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <p className="text-accent-danger">Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Hamburger menu, single-column layout, sheet modals |
| Tablet | 768–1024px | Collapsible sidebar, 2-col dashboard grid |
| Desktop | > 1024px | Persistent sidebar, 3–4 col dashboard grid |

The app is **web-first** with responsive design. No PWA/offline/install-prompt features are included.
