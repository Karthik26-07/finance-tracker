# 03 — Module Plan

## Module Overview

```
FinTrack
├── M1: Auth & User Management
├── M2: Accounts & Wallets
├── M3: Transactions (Core)
├── M4: Categories & Tags
├── M5: Dashboard & Analytics
├── M6: Reports
├── M7: Group Expenses
├── M8: Recurring Deductions
├── M9: Budgets
└── M10: Settings & Export
```

All modules follow the Next.js App Router conventions:
- **Pages** live in `app/(dashboard)/<module>/`
- **API endpoints** live in `app/api/<module>/`
- **Server Actions** live in `actions/<module>.ts`
- **Drizzle queries** are co-located or in `lib/db/queries/<module>.ts`

---

## M1 — Auth & User Management

**Purpose**: Handle user identity, authentication, and profile.

### Features
- Register with email + password
- Login → NextAuth.js JWT session
- Forgot password (email OTP via Resend or Nodemailer)
- Profile: name, currency preference, timezone, avatar (Supabase Storage)
- Session-based auth guard via `middleware.ts`

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/login` | Login form (Server + Client Component) |
| Page | `/register` | Registration form |
| Page | `/forgot-password` | Password reset |
| Page | `/settings/profile` | Edit profile |
| Route Handler | `GET/PUT /api/users/me` | Profile CRUD |
| Route Handler | `POST /api/auth/[...nextauth]` | NextAuth handler |
| Server Action | `actions/auth.ts → register()` | Create account |
| Server Action | `actions/auth.ts → updateProfile()` | Update profile |

### Auth Middleware (`middleware.ts`)

```ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/(dashboard)/:path*'],
}
```

---

## M2 — Accounts & Wallets

**Purpose**: Manage multiple financial accounts (bank, cash, UPI wallets, credit cards).

### Features
- Add account with name, type, opening balance, color, icon
- View list of all accounts with current balance
- Edit / archive account
- Transfer between accounts (creates two linked transactions in a DB transaction)
- Account-specific transaction history

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/accounts` | Cards showing all accounts |
| Page | `/accounts/[id]` | Account detail + transactions |
| Route Handler | `GET /api/accounts` | List accounts |
| Route Handler | `POST /api/accounts` | Create account |
| Route Handler | `PUT /api/accounts/[id]` | Update account |
| Route Handler | `DELETE /api/accounts/[id]` | Archive account |
| Route Handler | `POST /api/accounts/transfer` | Transfer between accounts |
| Server Action | `actions/accounts.ts → createAccount()` | Form submission |
| Server Action | `actions/accounts.ts → transferFunds()` | Transfer form |

### Drizzle Query Example

```ts
// lib/db/queries/accounts.ts
export async function getAccountsWithBalance(userId: string) {
  return db.select().from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.createdAt))
}
```

---

## M3 — Transactions (Core)

**Purpose**: The heart of the app. All money in/out is a transaction.

### Features
- Add income / expense / transfer
- Fields: amount, category, account, date, time, note, tags, receipt photo (Supabase Storage)
- Edit / delete transaction
- Filter: by date range, category, account, type, tags, amount range
- Sort: date, amount, category
- Bulk actions: delete, re-categorize
- Search by note/tags
- Optimistic UI updates via TanStack Query

### Transaction Form Fields
| Field | Type | Required |
|-------|------|----------|
| Type | income / expense / transfer | ✅ |
| Amount | Number | ✅ |
| Account | Select from user's accounts | ✅ |
| Date | Date picker | ✅ |
| Time | Time picker | optional |
| Category | Hierarchical select | ✅ |
| Note | Text | optional |
| Tags | Multi-tag input | optional |
| Receipt | Image upload → Supabase Storage | optional |
| Recurring | Toggle → opens recurring rule form | optional |

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/transactions` | Paginated, filterable list |
| Page | `/transactions/[id]` | Transaction detail |
| Route Handler | `GET /api/transactions` | List with filters + pagination |
| Route Handler | `POST /api/transactions` | Create transaction |
| Route Handler | `PUT /api/transactions/[id]` | Update transaction |
| Route Handler | `DELETE /api/transactions/[id]` | Delete transaction |
| Route Handler | `DELETE /api/transactions` | Bulk delete |
| Route Handler | `POST /api/transactions/import` | CSV import |
| Route Handler | `POST /api/upload` | Receipt image upload to Supabase |
| Server Action | `actions/transactions.ts → createTransaction()` | Create via form |
| Server Action | `actions/transactions.ts → deleteTransaction()` | Delete |

### Drizzle Query Example

```ts
// lib/db/queries/transactions.ts
export async function getTransactions(userId: string, filters: TransactionFilters) {
  const conditions = [eq(transactions.userId, userId)]

  if (filters.type)       conditions.push(eq(transactions.type, filters.type))
  if (filters.accountId)  conditions.push(eq(transactions.accountId, filters.accountId))
  if (filters.dateFrom)   conditions.push(gte(transactions.date, filters.dateFrom))
  if (filters.dateTo)     conditions.push(lte(transactions.date, filters.dateTo))
  if (filters.search)     conditions.push(ilike(transactions.note, `%${filters.search}%`))

  return db.select().from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts,   eq(transactions.accountId, accounts.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date))
    .limit(filters.limit ?? 25)
    .offset(filters.offset ?? 0)
}
```

---

## M4 — Categories & Tags

**Purpose**: Organize transactions for reporting and budgeting.

### Features
- System default categories (seeded via migration script)
- User-created custom categories (with sub-categories)
- Color + icon per category
- Merge categories (re-assign all transactions)
- Tags: free-form text tags stored as `text[]` array on transactions

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/settings/categories` | Manage categories tree |
| Route Handler | `GET /api/categories` | List all (system + user) |
| Route Handler | `POST /api/categories` | Create custom category |
| Route Handler | `PUT /api/categories/[id]` | Update |
| Route Handler | `DELETE /api/categories/[id]` | Delete + reassign transactions |
| Server Action | `actions/categories.ts → createCategory()` | Form submission |

---

## M5 — Dashboard & Analytics

**Purpose**: At-a-glance financial health overview.

### Widgets
| Widget | Description | Data Source |
|--------|-------------|-------------|
| **Net Worth** | Sum of all account balances | Drizzle query on accounts |
| **This Month** | Income vs Expense bar + net | Aggregated transactions |
| **Spending by Category** | Donut chart | GROUP BY category |
| **Daily Spend Trend** | Line chart — last 30 days | GROUP BY date |
| **Account Balances** | Mini cards | accounts table |
| **Top 5 Expenses** | This month | ORDER BY amount DESC |
| **Budget Status** | Progress bars per budget | budgets + transactions join |
| **Upcoming Recurring** | Next 7 days deductions | recurring_rules |
| **Recent Transactions** | Last 10 entries | transactions |

### Chart Types
- Donut: Category split
- Line: Daily trend, balance over time
- Bar: Monthly income vs expense comparison
- Stacked Bar: Category breakdown by month
- Sparklines: Account balance mini-trends

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page (SSR) | `/dashboard` | Grid of widgets, date range picker |
| Route Handler | `GET /api/dashboard/summary` | Aggregated stats for date range |
| Route Handler | `GET /api/dashboard/chart-data` | Chart data endpoint |

### Server-Side Rendering

Dashboard data is fetched on the server via Drizzle queries in Server Components, making the first paint instant:

```ts
// app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { getDashboardSummary } from '@/lib/db/queries/dashboard'

export default async function DashboardPage() {
  const session = await auth()
  const summary = await getDashboardSummary(session.user.id, { period: 'this_month' })
  return <DashboardClient initialData={summary} />
}
```

---

## M6 — Reports

**Purpose**: Deep-dive financial analysis and statements.

### Report Types

#### 6.1 Transaction Report
- Filter by: date range, category, account, tags, amount range, type
- Paginated table with export (CSV, PDF)

#### 6.2 Daily Statement
- Select account + date → opening balance, transactions, closing balance

#### 6.3 Monthly Statement
- Select account + month/year
- Opening balance, daily summary rows (expandable), closing balance

#### 6.4 Category Report
- Spending per category over period, month-over-month comparison

#### 6.5 Income vs Expense Report
- Monthly bar chart + savings rate calculation

#### 6.6 Group Settlement Report
- Outstanding balances, settlement history per group

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/reports` | Report type selector |
| Page | `/reports/daily` | Daily statement |
| Page | `/reports/monthly` | Monthly statement |
| Page | `/reports/by-category` | Category breakdown |
| Page | `/reports/cashflow` | Income vs expense |
| Route Handler | `GET /api/reports/daily` | Daily statement data |
| Route Handler | `GET /api/reports/monthly` | Monthly statement data |
| Route Handler | `GET /api/reports/by-category` | Category data |
| Route Handler | `GET /api/reports/export` | CSV / PDF export |

---

## M7 — Group Expenses

**Purpose**: Track shared expenses and settlements among a group.

### Features
- Create a group (Goa Trip, Flat Mates, Office Lunch)
- Add members (app users + external by name/email)
- Add group expense: title, amount, who paid, split method
- Split methods: Equal, By Percentage, Exact Amounts, By Shares
- Settle up: record a payment to settle a debt
- View group balance: who owes you, who you owe

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/groups` | List of groups |
| Page | `/groups/[id]` | Group detail: expenses + balances |
| Route Handler | `GET /api/groups` | List user's groups |
| Route Handler | `POST /api/groups` | Create group |
| Route Handler | `GET /api/groups/[id]` | Group detail + balances |
| Route Handler | `PUT /api/groups/[id]` | Update group |
| Route Handler | `POST /api/groups/[id]/members` | Add member |
| Route Handler | `GET /api/groups/[id]/transactions` | List group transactions |
| Route Handler | `POST /api/groups/[id]/transactions` | Add group expense |
| Route Handler | `GET /api/groups/[id]/balances` | Who owes whom |
| Route Handler | `POST /api/groups/[id]/settle` | Record settlement |
| Server Action | `actions/groups.ts → addGroupExpense()` | Add expense form |
| Server Action | `actions/groups.ts → settleDebt()` | Settle form |

---

## M8 — Recurring Deductions

**Purpose**: Auto-log repeated income/expenses (EMIs, subscriptions, salary).

### Features
- Create rule: name, amount, account, category, frequency, start/end date
- Frequencies: Daily, Weekly (pick day), Monthly (pick date), Custom (every N days)
- Enable / pause / stop a rule
- Preview: "Next occurrences" timeline
- Auto-processes at midnight via Vercel Cron → `POST /api/cron/process-recurring`

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/recurring` | List of all rules |
| Route Handler | `GET /api/recurring` | List rules |
| Route Handler | `POST /api/recurring` | Create rule |
| Route Handler | `PUT /api/recurring/[id]` | Update rule |
| Route Handler | `DELETE /api/recurring/[id]` | Delete rule |
| Route Handler | `PATCH /api/recurring/[id]/pause` | Pause |
| Route Handler | `PATCH /api/recurring/[id]/resume` | Resume |
| Route Handler | `GET /api/recurring/preview` | Preview next N occurrences |
| Route Handler | `POST /api/cron/process-recurring` | Vercel Cron endpoint |
| Server Action | `actions/recurring.ts → createRule()` | Form submission |

### Cron Route Handler

```ts
// app/api/cron/process-recurring/route.ts
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processRecurringRules()
  return Response.json({ processed: result.count })
}
```

---

## M9 — Budgets

**Purpose**: Set spending limits per category and track progress.

### Features
- Set monthly / weekly budget per category
- Dashboard widget showing budget utilization
- Alert when X% of budget is consumed
- Budget vs actual comparison report

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/budgets` | Budget list with progress bars |
| Route Handler | `GET /api/budgets` | List budgets with utilization |
| Route Handler | `POST /api/budgets` | Create budget |
| Route Handler | `PUT /api/budgets/[id]` | Update budget |
| Route Handler | `DELETE /api/budgets/[id]` | Delete budget |
| Server Action | `actions/budgets.ts → setBudget()` | Form submission |

---

## M10 — Settings & Export

**Purpose**: App configuration and data management.

### Features
- Profile settings (name, currency, timezone, avatar → Supabase Storage)
- Category management
- Account management
- Export all data: CSV, PDF, Excel
- Import from CSV (with column mapping wizard)
- Backup & restore (JSON export/import)
- Delete account + all data

### Next.js Routes
| Type | Path | Description |
|------|------|-------------|
| Page | `/settings` | Tabbed settings page |
| Page | `/settings/profile` | Profile form |
| Page | `/settings/categories` | Category management |
| Route Handler | `GET /api/reports/export` | Data export endpoint |
| Server Action | `actions/auth.ts → deleteAccount()` | Delete account |

---

## Module Dependency Graph

```
Auth (M1)
  └─▶ All other modules (session required via middleware)

Accounts (M2)
  └─▶ Transactions (M3)
  └─▶ Dashboard (M5)
  └─▶ Reports (M6)
  └─▶ Recurring (M8)

Transactions (M3)
  ├─▶ Dashboard (M5)
  ├─▶ Reports (M6)
  └─▶ Group Expenses (M7)

Categories (M4)
  ├─▶ Transactions (M3)
  ├─▶ Reports (M6)
  └─▶ Budgets (M9)

Recurring (M8)
  └─▶ Transactions (M3) [creates transactions via cron]
```
