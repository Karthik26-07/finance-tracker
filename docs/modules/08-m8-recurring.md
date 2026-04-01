# M8 — Recurring Deductions

## Purpose
Auto-log repeated income/expenses: subscriptions, EMIs, rent, salary, bills.

---

## Features

### Rule Management
- [ ] Create rule: name, amount, account, category, frequency
- [ ] Frequencies: Daily, Weekly, Monthly, Custom (every N days)
- [ ] Enable / pause / resume rule
- [ ] Edit rule
- [ ] Delete rule

### Scheduling
- [ ] Start date, end date (optional)
- [ ] Next run date pre-computation
- [ ] Preview: "Next occurrences" timeline

### Auto-Processing
- [ ] Vercel Cron fires at 00:00 UTC
- [ ] Calls `POST /api/cron/process-recurring`
- [ ] Creates transaction + updates balance
- [ ] Updates rule's `nextRunDate` and `lastRunDate`

### Dashboard Integration
- [ ] "Upcoming This Week" widget
- [ ] Shows next 7 days of recurring deductions

---

## Database Schema

### recurring_rules table (`lib/db/schema/recurring.ts`)

```ts
export const frequencyEnum = pgEnum('frequency', ['daily', 'weekly', 'monthly', 'custom'])

export const recurringRules = pgTable('recurring_rules', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  userId:             uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId:          uuid('account_id').notNull().references(() => accounts.id),
  categoryId:         uuid('category_id').references(() => categories.id),
  name:               varchar('name', { length: 200 }).notNull(),
  type:               txTypeEnum('type').notNull(),
  amount:             numeric('amount', { precision: 15, scale: 2 }).notNull(),
  frequency:          frequencyEnum('frequency').notNull(),
  dayOfWeek:          smallint('day_of_week'),          // 0=Sun … 6=Sat
  dayOfMonth:         smallint('day_of_month'),          // 1–31
  customIntervalDays: integer('custom_interval_days'),   // custom frequency
  startDate:          date('start_date').notNull(),
  endDate:            date('end_date'),                  // NULL = indefinite
  nextRunDate:        date('next_run_date').notNull(),
  lastRunDate:        date('last_run_date'),
  isActive:           boolean('is_active').default(true),
  note:               text('note'),
  createdAt:          timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:          timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  nextRunIdx: index('idx_recurring_next_run').on(table.nextRunDate)
    .where(sql`${table.isActive} = true`),
}))
```

---

## File Structure

```
app/
├── (dashboard)/
│   └── recurring/
│       ├── page.tsx (list)
│       ├── [id]/
│       │   ├── page.tsx (detail)
│       │   └── edit/page.tsx
│       └── preview/page.tsx
├── api/
│   └── recurring/
│       ├── route.ts
│       ├── [id]/route.ts
│       ├── [id]/pause/route.ts
│       ├── [id]/resume/route.ts
│       └── preview/route.ts
└── api/
    └── cron/
        └── process-recurring/route.ts

actions/
└── recurring.ts

components/
└── recurring/
    ├── RecurringList.tsx
    ├── RecurringItem.tsx
    ├── RecurringForm.tsx
    ├── FrequencySelector.tsx
    ├── NextOccurrencesPreview.tsx
    └── UpcomingWidget.tsx

lib/
├── jobs/recurring.ts
├── utils/recurring.ts (next date computation)
└── validations/recurring.ts
```

---

## Frequency Types

### 1. Daily
Fires every single day.

### 2. Weekly
Fires on specific day of week (0-6, Sun-Sat).

### 3. Monthly
Fires on specific day of month (1-31).
- Smart handling: if day 31 and month has 30 days → uses last day

### 4. Custom Interval
Fires every N days.

---

## Cron Processing Job

```ts
// lib/jobs/recurring.ts
export async function processRecurringRules() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const dueRules = await db.select().from(recurringRules)
    .where(and(
      eq(recurringRules.isActive, true),
      lte(recurringRules.nextRunDate, today),
      or(isNull(recurringRules.endDate), gte(recurringRules.endDate, today))
    ))

  for (const rule of dueRules) {
    await db.transaction(async (tx) => {
      // 1. Create transaction
      await tx.insert(transactions).values({
        userId:         rule.userId,
        accountId:      rule.accountId,
        categoryId:     rule.categoryId,
        type:           rule.type,
        amount:         rule.amount,
        date:           today,
        note:           rule.note,
        isRecurring:    true,
        recurringRuleId: rule.id,
      })

      // 2. Update account balance
      const delta = rule.type === 'income' ? Number(rule.amount) : -Number(rule.amount)
      await tx.update(accounts)
        .set({ balance: sql`balance + ${delta}` })
        .where(eq(accounts.id, rule.accountId))

      // 3. Compute next run date
      const nextDate = computeNextRunDate(rule)

      // 4. Update rule
      await tx.update(recurringRules)
        .set({
          lastRunDate:  today,
          nextRunDate:  nextDate ?? today,
          isActive:     nextDate !== null,
        })
        .where(eq(recurringRules.id, rule.id))
    })
  }
}
```

### Next Date Computation

```ts
// lib/utils/recurring.ts
function computeNextRunDate(rule) {
  switch (rule.frequency) {
    case 'daily':
      return addDays(today, 1)
    case 'weekly':
      // Find next occurrence of dayOfWeek
    case 'monthly':
      // Handle month-end edge cases
    case 'custom':
      return addDays(today, rule.customIntervalDays)
  }
}
```

---

## Vercel Cron Config

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-recurring",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Cron Route Protection

```ts
// app/api/cron/process-recurring/route.ts
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processRecurringRules()
  return Response.json({ processed: result.count, errors: result.errors })
}
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/recurring/page.tsx` - Rule list
- [ ] `app/(dashboard)/recurring/[id]/page.tsx` - Rule detail
- [ ] `app/(dashboard)/recurring/[id]/edit/page.tsx` - Edit form

### Components
- [ ] `components/recurring/RecurringList.tsx`
- [ ] `components/recurring/RecurringItem.tsx`
- [ ] `components/forms/RecurringRuleForm.tsx`
- [ ] `components/recurring/FrequencySelector.tsx`
- [ ] `components/recurring/NextOccurrencesPreview.tsx`
- [ ] `components/dashboard/UpcomingRecurring.tsx`

### Server Actions (`actions/recurring.ts`)
- [ ] `createRecurringRule(input)`
- [ ] `updateRecurringRule(id, input)`
- [ ] `deleteRecurringRule(id)`
- [ ] `pauseRecurringRule(id)`
- [ ] `resumeRecurringRule(id)`

---

## Design Reference

**Primary:** `docs/design-ref/recurring_deductions_m8/` (contains "Budgets" HTML - actually M9 content)
- `code.html` — Budget cards with progress bars, budget status indicators (Over Limit/Healthy/Nearing Limit), spending trajectory chart
- `screen.png` — Full visual reference

**Note:** The folder name suggests M8 Recurring, but the HTML content shows budget tracking. Use this for budget progress UI, not recurring rules.

For recurring rules UI patterns, refer to the general design principles in `docs/design-ref/equilibrium_finance/DESIGN.md`.

**Design Plan:** `docs/04-ui-design-plan.md`
- Progress bar components
- Status badge patterns (Active/Paused)
- Frequency selector patterns

---

## UI Screens

### Recurring List
```
┌──────────────────────────────────────────────────────────────┐
│  Recurring Deductions                        [+ Add Rule]    │
├──────────────────────────────────────────────────────────────┤
│  🎬 Netflix           ₹649/month  3rd of month   ● Active   │
│     Streaming · HDFC Savings · Next: 3 Feb 2025              │
├──────────────────────────────────────────────────────────────┤
│  🏠 Monthly Rent      ₹12,000/month  1st of month ● Active  │
│     Rent · HDFC Savings · Next: 1 Feb 2025                   │
└──────────────────────────────────────────────────────────────┘
```

### Add Rule Form
```
┌──────────────────────────────────────────┐
│  New Recurring Rule                 [✕]  │
│ ──────────────────────────────────────── │
│  Name:     [Netflix Subscription    ]    │
│  Type:     [● Expense]  [○ Income]       │
│  Amount:   ₹ [649                  ]     │
│  Account:  [HDFC Savings          ▼]     │
│  Category: [Subscriptions         ▼]     │
│                                          │
│  Frequency:                              │
│  [Daily] [Weekly] [●Monthly] [Custom]    │
│                                          │
│  Day of Month: [3 ▼]                     │
│  Start Date:  [03 Jan 2025       📅]     │
│  End Date:    [No end date         ]     │
│                                          │
│  Preview next 3 occurrences:             │
│  • 3 Feb 2025                            │
│  • 3 Mar 2025                            │
│  • 3 Apr 2025                            │
│                                          │
│  [Cancel]          [Save Rule]           │
└──────────────────────────────────────────┘
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Rule created mid-month (day passed) | `nextRunDate` set to next month |
| Monthly rule on 31st, month has 28 days | Clamped to last day (28th) |
| User edits amount of active rule | New amount applies from next run |
| User deletes rule | Existing transactions remain |
| Account deleted with active rules | Rule auto-paused |
| Cron missed a run | Catch-up: process all `nextRunDate <= today` |

---

## Implementation Checklist

### Schema
- [ ] Create recurring_rules table
- [ ] Add index on `nextRunDate` where `isActive = true`
- [ ] Run drizzle-kit generate + migrate

### Job
- [ ] Implement `processRecurringRules()`
- [ ] Implement `computeNextRunDate()`
- [ ] Configure Vercel Cron in `vercel.json`
- [ ] Add `CRON_SECRET` to env

### Pages
- [ ] Build recurring list page
- [ ] Build add/edit form
- [ ] Build preview component

### Dashboard
- [ ] Build "Upcoming This Week" widget

### Testing
- [ ] Test all frequency types
- [ ] Test edge cases (month-end)
- [ ] Test cron endpoint
- [ ] Test pause/resume
