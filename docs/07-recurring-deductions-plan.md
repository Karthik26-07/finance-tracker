# 07 — Recurring Deductions Plan

## Overview

Recurring Deductions allow users to define rules for automatic transactions that repeat on a schedule — subscriptions, EMIs, rent, salary, bills. The system auto-creates transaction records when the scheduled date arrives.

The job runs via **Vercel Cron** at midnight UTC, calling `POST /api/cron/process-recurring`.

---

## Frequency Types

### 1. Daily
- Fires every single day
- Use case: daily commute allowance, per-diem logging

### 2. Weekly
- Fires on a specific day of the week (Monday–Sunday)
- Use case: weekly grocery run, weekly team lunch

### 3. Monthly
- Fires on a specific day of the month (1–31)
- Smart handling: if day is 31 and month has 30 days → uses last day of month
- Use case: rent, EMI, salary, Netflix

### 4. Custom Interval
- Fires every N days
- Use case: every 15 days, every 45 days

### 5. Date Range Only (One-Time Scheduled)
- Fires once on a specific future date
- Use case: insurance annual renewal reminder

---

## Rule Data Model (Drizzle)

Defined in `lib/db/schema/recurring.ts`. See `02-database-schema.md` for the full schema.

```ts
// Key fields:
{
  frequency:          'daily' | 'weekly' | 'monthly' | 'custom'
  dayOfWeek:          0-6   // for weekly
  dayOfMonth:         1-31  // for monthly
  customIntervalDays: number // for custom
  startDate:          string // ISO date
  endDate:            string | null  // null = runs forever
  nextRunDate:        string // pre-computed next scheduled date
  lastRunDate:        string | null
  isActive:           boolean
}
```

---

## Scheduling Logic

### Vercel Cron (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/process-recurring",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Cron Route Handler

```ts
// app/api/cron/process-recurring/route.ts
import { auth } from '@/lib/auth'
import { processRecurringRules } from '@/lib/jobs/recurring'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await processRecurringRules()
  return Response.json({ processed: result.count, errors: result.errors })
}
```

### Processing Job (`lib/jobs/recurring.ts`)

```ts
import { db } from '@/lib/db'
import { recurringRules, transactions, accounts } from '@/lib/db/schema'
import { and, eq, lte, or, isNull, gte } from 'drizzle-orm'
import { format, addDays, addMonths, setDate, getDaysInMonth } from 'date-fns'

export async function processRecurringRules() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const dueRules = await db.select().from(recurringRules)
    .where(and(
      eq(recurringRules.isActive, true),
      lte(recurringRules.nextRunDate, today),
      or(isNull(recurringRules.endDate), gte(recurringRules.endDate, today))
    ))

  let count = 0
  const errors: string[] = []

  for (const rule of dueRules) {
    try {
      await db.transaction(async (tx) => {
        // 1. Create transaction record
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
          .set({ balance: sql`balance + ${delta}`, updatedAt: new Date() })
          .where(eq(accounts.id, rule.accountId))

        // 3. Compute next run date
        const nextDate = computeNextRunDate(rule)

        // 4. Update rule
        await tx.update(recurringRules)
          .set({
            lastRunDate:  today,
            nextRunDate:  nextDate ?? today, // keep same date if no next (rule ends)
            isActive:     nextDate !== null,  // auto-deactivate if past end date
            updatedAt:    new Date(),
          })
          .where(eq(recurringRules.id, rule.id))
      })
      count++
    } catch (err) {
      errors.push(`Rule ${rule.id}: ${(err as Error).message}`)
    }
  }

  return { count, errors }
}
```

### Next Run Date Computation

```ts
function computeNextRunDate(rule: typeof recurringRules.$inferSelect): string | null {
  const today = new Date()

  switch (rule.frequency) {
    case 'daily':
      return format(addDays(today, 1), 'yyyy-MM-dd')

    case 'weekly': {
      let next = addDays(today, 1)
      while (next.getDay() !== rule.dayOfWeek!) {
        next = addDays(next, 1)
      }
      return format(next, 'yyyy-MM-dd')
    }

    case 'monthly': {
      const nextMonth = addMonths(today, 1)
      const daysInNextMonth = getDaysInMonth(nextMonth)
      const clampedDay = Math.min(rule.dayOfMonth!, daysInNextMonth)
      return format(setDate(nextMonth, clampedDay), 'yyyy-MM-dd')
    }

    case 'custom':
      return format(addDays(today, rule.customIntervalDays!), 'yyyy-MM-dd')

    default:
      return null
  }
}
```

---

## UI: Recurring Rule List

```
┌──────────────────────────────────────────────────────────────┐
│  Recurring Deductions                        [+ Add Rule]    │
├──────────────────────────────────────────────────────────────┤
│  🎬 Netflix           ₹649/month  3rd of month   ● Active   │
│     Streaming · HDFC Savings · Next: 3 Feb 2025              │
├──────────────────────────────────────────────────────────────┤
│  🏠 Monthly Rent      ₹12,000/month  1st of month ● Active  │
│     Rent · HDFC Savings · Next: 1 Feb 2025                   │
├──────────────────────────────────────────────────────────────┤
│  🚌 Daily Commute     ₹50/day     Daily          ⏸ Paused   │
│     Transport · Cash · Paused on 20 Jan 2025                 │
├──────────────────────────────────────────────────────────────┤
│  💰 Salary            ₹75,000/month  1st of month ● Active  │
│     Income · HDFC Savings · Next: 1 Feb 2025                 │
└──────────────────────────────────────────────────────────────┘
```

---

## UI: Add/Edit Rule Form

```
┌──────────────────────────────────────────┐
│  New Recurring Rule                 [✕]  │
│ ──────────────────────────────────────── │
│  Name:     [Netflix Subscription    ]    │
│  Type:     [● Expense]  [○ Income]       │
│  Amount:   ₹ [649                  ]    │
│  Account:  [HDFC Savings          ▼]    │
│  Category: [Subscriptions         ▼]    │
│                                          │
│  Frequency:                              │
│  [Daily] [Weekly] [●Monthly] [Custom]    │
│                                          │
│  Day of Month: [3 ▼]                    │
│                                          │
│  Start Date:  [03 Jan 2025       📅]    │
│  End Date:    [No end date         ]    │
│                                          │
│  Note:     [Streaming subscription ]    │
│                                          │
│  Preview next 3 occurrences:             │
│  • 3 Feb 2025                            │
│  • 3 Mar 2025                            │
│  • 3 Apr 2025                            │
│                                          │
│  [Cancel]          [Save Rule]           │
└──────────────────────────────────────────┘
```

The "preview" is computed client-side in the form using the same `computeNextRunDate` logic (shared `lib/utils/recurring.ts`).

---

## Server Action (`actions/recurring.ts`)

```ts
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { recurringRules } from '@/lib/db/schema'
import { createRecurringRuleSchema } from '@/lib/validations/recurring'
import { revalidatePath } from 'next/cache'

export async function createRecurringRule(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const parsed = createRecurringRuleSchema.parse(Object.fromEntries(formData))

  await db.insert(recurringRules).values({
    ...parsed,
    userId: session.user.id,
    nextRunDate: parsed.startDate,
  })

  revalidatePath('/recurring')
}
```

---

## Dashboard Integration

**"Upcoming This Week" widget on Dashboard:**

```
Upcoming Recurring (next 7 days)
─────────────────────────────────
 3 Feb  Netflix           -₹649
 5 Feb  Rent              -₹12,000
 7 Feb  EMI HDFC          -₹8,500
─────────────────────────────────
 Total upcoming:          -₹21,149
```

Query:
```ts
const upcoming = await db.select().from(recurringRules)
  .where(and(
    eq(recurringRules.userId, userId),
    eq(recurringRules.isActive, true),
    lte(recurringRules.nextRunDate, format(addDays(new Date(), 7), 'yyyy-MM-dd'))
  ))
  .orderBy(asc(recurringRules.nextRunDate))
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Rule created mid-month (day already passed) | `nextRunDate` set to next month's date |
| Monthly rule on 31st, month has 28 days | Clamped to last day of that month (28th) |
| User edits amount of active rule | New amount applies from next run only |
| User deletes a rule | Existing transactions remain; rule row deleted |
| Account deleted with active rules | Rule auto-paused (FK constraint will error; handle in delete action) |
| Cron missed a run (Vercel outage) | On next run, all overdue rules (`nextRunDate <= today`) are processed |
| Vercel cold start delay | Cron timeout is 30s; bulk processing is handled in batches if needed |
