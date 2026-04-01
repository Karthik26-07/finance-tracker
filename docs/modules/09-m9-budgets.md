# M9 — Budgets

## Purpose
Set spending limits per category and track progress with alerts.

---

## Features

### Budget Management
- [ ] Create budget: category, amount, period (monthly/weekly)
- [ ] Edit budget
- [ ] Delete budget
- [ ] Budget per category

### Period Types
- [ ] Monthly budget (default)
- [ ] Weekly budget
- [ ] Specific month/year budget (optional)

### Progress Tracking
- [ ] Budget utilization calculation
- [ ] Progress bars on dashboard
- [ ] Alert at X% threshold (configurable per budget)

### Reports
- [ ] Budget vs actual comparison
- [ ] Overspending alerts

---

## Database Schema

### budgets table (`lib/db/schema/budgets.ts`)

```ts
export const budgetPeriodEnum = pgEnum('budget_period', ['monthly', 'weekly'])

export const budgets = pgTable('budgets', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId:  uuid('category_id').notNull().references(() => categories.id),
  amount:      numeric('amount', { precision: 15, scale: 2 }).notNull(),
  period:      budgetPeriodEnum('period').default('monthly'),
  month:       smallint('month'),     // 1–12 (NULL = all months)
  year:        smallint('year'),      // (NULL = all years)
  alertAtPct:  smallint('alert_at_pct').default(80),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

---

## File Structure

```
app/
├── (dashboard)/
│   └── budgets/
│       ├── page.tsx (list)
│       └── [id]/
│           └── edit/page.tsx
└── api/
    └── budgets/
        ├── route.ts (GET list, POST create)
        ├── [id]/route.ts (PUT, DELETE)
        └── utilization/route.ts

actions/
└── budgets.ts

components/
└── budgets/
    ├── BudgetList.tsx
    ├── BudgetItem.tsx
    ├── BudgetForm.tsx
    ├── BudgetProgress.tsx
    └── BudgetAlert.tsx

lib/
├── db/queries/budgets.ts
└── validations/budgets.ts
```

---

## Budget Utilization Calculation

```ts
// lib/db/queries/budgets.ts
export async function getBudgetUtilization(userId: string, period: 'month' | 'week') {
  const budgets = await db.select().from(budgets)
    .where(eq(budgets.userId, userId))

  const utilization = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await getSpendingForCategory(
        budget.categoryId,
        budget.period === 'monthly' ? 'this_month' : 'this_week'
      )

      const pct = (spent / Number(budget.amount)) * 100

      return {
        ...budget,
        spent,
        utilizationPct: pct,
        status: pct >= budget.alertAtPct ? 'warning' : 'ok',
      }
    })
  )

  return utilization
}
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/budgets/page.tsx` - Budget list with progress

### Components
- [ ] `components/budgets/BudgetList.tsx`
- [ ] `components/budgets/BudgetItem.tsx`
- [ ] `components/forms/BudgetForm.tsx`
- [ ] `components/budgets/BudgetProgress.tsx`
- [ ] `components/budgets/BudgetAlert.tsx`
- [ ] `components/dashboard/BudgetWidget.tsx`

### Server Actions (`actions/budgets.ts`)
- [ ] `createBudget(input)`
- [ ] `updateBudget(id, input)`
- [ ] `deleteBudget(id)`

### Validation Schemas (`lib/validations/budgets.ts`)
- [ ] `createBudgetSchema` - CategoryId, amount, period, alertAtPct
- [ ] `updateBudgetSchema` - Partial

---

## Design Reference

**Primary:** `docs/design-ref/budgets_m9/` (contains "Settings & Export" HTML - actually M10 content)
- `code.html` — Profile form with avatar upload, category management grid, export options (CSV/PDF/JSON), import wizard with drag-drop, danger zone
- `screen.png` — Full visual reference

**Note:** The folder name suggests M9 Budgets, but the HTML content shows Settings & Export. Use `docs/design-ref/recurring_deductions_m8/` for budget progress UI instead.

**Design Plan:** `docs/04-ui-design-plan.md`
- Progress bar components with status colors
- Budget alert threshold patterns

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Card-based budget listing
- Status indicator patterns

---

## Design Specifications

### Budget List
```
┌──────────────────────────────────────────────────────┐
│  Budgets                            [+ New Budget]   │
├──────────────────────────────────────────────────────┤
│  🍽️ Food & Dining                                    │
│  ₹3,200 / ₹5,000    [████████████░░░░░░░░░]  64%    │
│  Status: ✅ On track                                 │
├──────────────────────────────────────────────────────┤
│  🚗 Transport                                        │
│  ₹4,800 / ₹5,000    [██████████████████░░]  96%     │
│  Status: ⚠️ Near limit                               │
├──────────────────────────────────────────────────────┤
│  🏠 Rent & Housing                                   │
│  ₹12,000 / ₹10,000  [████████████████████]  120%    │
│  Status: ❌ Over budget                              │
└──────────────────────────────────────────────────────┘
```

### Progress Bar Colors
- **Green**: < 60%
- **Yellow**: 60-80%
- **Red**: > 80%

### Alert States
- **Warning**: utilization >= alertAtPct (default 80%)
- **Over**: utilization > 100%

---

## Dashboard Widget

```
┌─ BUDGET STATUS ──────────────────────┐
│  Food & Dining    [██████░░]  64%    │
│  Transport        [████████░]  85% ⚠ │
│  Entertainment    [███░░░░░]  30%    │
│                                      │
│  [View All Budgets]                  │
└──────────────────────────────────────┘
```

---

## Implementation Checklist

### Schema
- [ ] Create budgets table
- [ ] Run drizzle-kit generate + migrate

### Queries
- [ ] `getBudgets(userId)`
- [ ] `getBudgetUtilization(userId, period)`
- [ ] `getSpendingForCategory(categoryId, period)`

### Pages
- [ ] Build budget list page
- [ ] Build add/edit form

### Dashboard
- [ ] Build budget progress widget

### Alerts
- [ ] Implement alert threshold logic
- [ ] Add visual warning states

### Testing
- [ ] Test utilization calculation
- [ ] Test alert thresholds
- [ ] Test period types (monthly/weekly)
