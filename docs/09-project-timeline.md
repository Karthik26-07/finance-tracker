# 09 — Project Timeline & Milestones

## Phases Overview

```
Phase 1: Foundation       Weeks 1–3    Core auth + accounts + transactions
Phase 2: Analytics        Weeks 4–5    Dashboard + basic reports
Phase 3: Advanced Reports Weeks 6–7    Daily/Monthly statements + export
Phase 4: Group Expenses   Weeks 8–10   Groups, splits, settlements
Phase 5: Recurring        Weeks 11–12  Recurring deductions + budgets
Phase 6: Polish & Launch  Weeks 13–15  Performance, testing, deploy
```

---

## Phase 1: Foundation (Weeks 1–3)

**Goal**: Usable core — can log money in and out.

### Week 1: Project Setup + Auth
- [ ] Next.js 15 project scaffold (App Router, TypeScript, TailwindCSS)
- [ ] shadcn/ui setup + design tokens configured in `tailwind.config.ts`
- [ ] Drizzle ORM + postgres.js setup
- [ ] Supabase project created (PostgreSQL + Storage buckets)
- [ ] `drizzle.config.ts` pointed at Supabase DATABASE_URL
- [ ] NextAuth.js v5 with Credentials provider (email + password)
- [ ] Auth pages: `/login`, `/register`, `/forgot-password`
- [ ] `middleware.ts` protecting all `(dashboard)/*` routes
- [ ] User table schema + seed

### Week 2: Accounts + Categories
- [ ] Drizzle schema: `accounts`, `categories`
- [ ] `drizzle-kit generate` + `drizzle-kit migrate` for initial migration
- [ ] System categories seed script
- [ ] Account CRUD (Route Handlers + Server Actions)
- [ ] Account list screen with balance cards (`/accounts`)
- [ ] Account detail page (`/accounts/[id]`)
- [ ] Custom category CRUD (`/settings/categories`)
- [ ] Transfer between accounts (DB transaction via Drizzle)

### Week 3: Transactions Core
- [ ] Drizzle schema: `transactions`
- [ ] Transaction CRUD (Route Handlers + Server Actions)
- [ ] Transaction list with filters — `/transactions` (TanStack Query)
- [ ] Add transaction modal (React Hook Form + Zod)
- [ ] Account balance auto-update in DB transaction on create/edit/delete
- [ ] Receipt image upload → Supabase Storage (`/api/upload`)
- [ ] Basic search (note/tags via `ilike`)

**Phase 1 Milestone**: User can log income + expenses, see account balances.

---

## Phase 2: Analytics (Weeks 4–5)

**Goal**: Dashboard gives a meaningful financial overview.

### Week 4: Dashboard Widgets
- [ ] Drizzle aggregate queries for summary stats
- [ ] Net worth card (sum of all accounts)
- [ ] This month income vs expense bar
- [ ] Spending by category donut chart (Recharts)
- [ ] Recent transactions list widget
- [ ] Account balance mini-cards
- [ ] Date range picker for dashboard

### Week 5: Charts + Budget Basics
- [ ] Daily spend trend (line chart, 30 days)
- [ ] Monthly income vs expense comparison (6 months)
- [ ] Drizzle schema: `budgets`
- [ ] Budget creation UI + Server Action
- [ ] Budget utilization progress bars on dashboard
- [ ] Dashboard layout (CSS Grid, responsive)
- [ ] `loading.tsx` skeleton states for all dashboard widgets

**Phase 2 Milestone**: Dashboard shows meaningful financial health at a glance.

---

## Phase 3: Advanced Reports (Weeks 6–7)

**Goal**: Full reporting suite with opening/closing balances.

### Week 6: Daily & Monthly Statements
- [ ] Drizzle schema: `daily_balance_snapshots`
- [ ] `computeSnapshotOnTheFly()` utility
- [ ] Daily statement Route Handler + UI (`/reports/daily`)
- [ ] Monthly statement Route Handler + UI (`/reports/monthly`)
- [ ] Expand/collapse rows (client-side)
- [ ] Month navigation
- [ ] Snapshot population in Vercel Cron nightly job setup

### Week 7: Reports Suite + Export
- [ ] Transaction report (full filters + sort) — `/reports`
- [ ] Category breakdown report — `/reports/by-category`
- [ ] Cash flow (income vs expense trend) — `/reports/cashflow`
- [ ] CSV export (`/api/reports/export?format=csv`)
- [ ] PDF export via `pdfkit` (`/api/reports/export?format=pdf`)
- [ ] Excel export via `exceljs`

**Phase 3 Milestone**: All reporting features working, data exportable.

---

## Phase 4: Group Expenses (Weeks 8–10)

**Goal**: Full Splitwise-like group expense tracking.

### Week 8: Groups + Members
- [ ] Drizzle schema: `groups`, `group_members`
- [ ] Group CRUD (Route Handlers + Server Actions)
- [ ] Add members (app users + external)
- [ ] Group list screen (`/groups`)
- [ ] Group detail screen with 3 tabs (`/groups/[id]`)

### Week 9: Group Transactions + Splits
- [ ] Drizzle schema: `group_transactions`, `group_splits`
- [ ] Add group expense form (all 4 split methods)
- [ ] `computeSplits()` utility
- [ ] Group expense list
- [ ] Edit / delete group expense
- [ ] `calculateGroupBalances()` + `simplifyDebts()` utilities

### Week 10: Settlements + Group Reports
- [ ] `settleDebt()` Server Action (auto-creates personal transaction)
- [ ] Settlement history tab
- [ ] Group settlement report (`/reports/groups`)
- [ ] Receipt upload for group expenses → Supabase Storage

**Phase 4 Milestone**: Full group expense tracking with settlements.

---

## Phase 5: Recurring + Budgets (Weeks 11–12)

**Goal**: Automated recurring deductions and budget tracking.

### Week 11: Recurring Deductions
- [ ] Drizzle schema: `recurring_rules`
- [ ] Recurring rule CRUD (all frequencies)
- [ ] Vercel Cron setup in `vercel.json` + `CRON_SECRET` env var
- [ ] `processRecurringRules()` job in `lib/jobs/recurring.ts`
- [ ] `computeNextRunDate()` utility (date-fns)
- [ ] Edge case handling (month-end, paused, end-date)
- [ ] "Next occurrences" preview (client-side computation)
- [ ] Upcoming recurring widget on dashboard

### Week 12: Budgets + Alerts
- [ ] Budget CRUD per category (Server Actions)
- [ ] Budget utilization calculation (Drizzle aggregate query)
- [ ] Alert at X% (UI warning state, configurable per budget)
- [ ] Budget vs actual comparison in `/reports`
- [ ] Budget progress bars in dashboard widget

**Phase 5 Milestone**: Full automation and budget monitoring working.

---

## Phase 6: Polish & Launch (Weeks 13–15)

**Goal**: Production-ready, tested, deployed.

### Week 13: Responsive Design + UX
- [ ] Responsive layout for all pages (mobile-accessible sidebar collapse)
- [ ] Quick add FAB + Dialog
- [ ] Loading skeletons (`loading.tsx`) for all pages
- [ ] Error boundaries (`error.tsx`) for all pages
- [ ] Empty states with illustrations on all list views
- [ ] `not-found.tsx` pages
- [ ] Toast notifications (shadcn Sonner)

### Week 14: Performance + Security
- [ ] Pagination + TanStack Table for long transaction lists
- [ ] Image optimization — client-side compression before upload to Supabase
- [ ] Security audit (auth guard coverage, Zod on all inputs, row-level userId filter)
- [ ] Rate limiting on auth endpoints via Vercel Edge middleware
- [ ] Sentry integration (client + server)
- [ ] CSV import wizard (column mapping UI)

### Week 15: Testing + Deployment
- [ ] Unit tests: balance calculation, debt simplification, recurring logic
- [ ] Integration tests: transaction CRUD, group flows (Vitest)
- [ ] E2E tests: add transaction, create group, recurring (Playwright)
- [ ] Vercel deployment (connected to GitHub)
- [ ] Supabase production project setup (separate from dev)
- [ ] Environment variables configured in Vercel dashboard
- [ ] Domain + SSL setup
- [ ] Seed demo data for new users

**Phase 6 Milestone**: 🚀 Production launch.

---

## Gantt Chart (Abbreviated)

```
Week:        1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
─────────────────────────────────────────────────────────
Setup        ██
Auth         ██ ██
Accounts        ██ ██
Transactions        ██ ██
Dashboard               ██ ██
Reports                    ██ ██
Groups                           ██ ██ ██
Recurring                                   ██ ██
Budgets                                        ██
Polish                                              ██ ██
Testing                                               ██ ██
Deploy                                                   ██ ██
```

---

## Tech Debt & Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Balance calculation bugs on edit/delete | Medium | High | Thorough unit tests, recompute from transactions |
| Vercel Cron missing runs | Low | Medium | Catch-up logic: process all overdue `nextRunDate <= today` rules |
| Group debt calculation edge cases | Medium | Medium | Unit tests for all split methods + floating-point rounding |
| Large transaction history perf | Low | Medium | Pagination, Drizzle query indexes, balance snapshots |
| Supabase Storage file growth | Low | Low | Compress images client-side before upload |
| Vercel function timeout (large exports) | Low | Medium | Stream CSV response; chunk PDF generation |
| Drizzle migration conflicts in team dev | Low | Low | Always generate migrations via `drizzle-kit generate`, never `push` in CI |
