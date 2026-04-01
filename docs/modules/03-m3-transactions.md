# M3 — Transactions (Core)

## Purpose
The heart of the app. All money in/out is a transaction.

---

## Features

### Transaction CRUD
- [ ] Add income / expense / transfer
- [ ] Fields: amount, category, account, date, time, note, tags, receipt
- [ ] Edit / delete transaction
- [ ] Bulk actions: delete, re-categorize

### Filtering & Sorting
- [ ] Filter by: date range, category, account, type, tags, amount range
- [ ] Sort by: date, amount, category
- [ ] Search by note/tags

### File Upload
- [ ] Receipt image upload to Supabase Storage
- [ ] Client-side compression before upload

### Optimistic UI
- [ ] TanStack Query for background sync
- [ ] Optimistic updates on mutations

---

## Database Schema

### transactions table (`lib/db/schema/transactions.ts`)

```ts
export const txTypeEnum = pgEnum('tx_type', ['income', 'expense', 'transfer'])

export const transactions = pgTable('transactions', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  userId:              uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId:           uuid('account_id').notNull().references(() => accounts.id),
  categoryId:          uuid('category_id').references(() => categories.id),
  type:                txTypeEnum('type').notNull(),
  amount:              numeric('amount', { precision: 15, scale: 2 }).notNull(),
  note:                text('note'),
  tags:                text('tags').array(),
  date:                date('date').notNull(),
  time:                time('time'),
  isRecurring:         boolean('is_recurring').default(false),
  recurringRuleId:     uuid('recurring_rule_id'),
  groupId:             uuid('group_id'),
  transferToAccountId: uuid('transfer_to_account_id').references(() => accounts.id),
  receiptUrl:          text('receipt_url'),
  location:            varchar('location', { length: 200 }),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userDateIdx:    index('idx_transactions_user_date').on(table.userId, table.date),
  accountIdx:     index('idx_transactions_account').on(table.accountId),
  categoryIdx:    index('idx_transactions_category').on(table.categoryId),
}))
```

---

## File Structure

```
app/
├── (dashboard)/
│   └── transactions/
│       ├── page.tsx (list with filters)
│       └── [id]/
│           ├── page.tsx (detail)
│           └── edit/page.tsx
└── api/
    └── transactions/
        ├── route.ts (GET list, POST create)
        ├── [id]/route.ts (GET, PUT, DELETE)
        ├── bulk/route.ts (DELETE multiple)
        └── import/route.ts (POST CSV)

actions/
└── transactions.ts

components/
└── transactions/
    ├── TransactionList.tsx
    ├── TransactionItem.tsx
    ├── TransactionFilters.tsx
    ├── TransactionForm.tsx
    └── ReceiptUpload.tsx

lib/
├── db/queries/transactions.ts
├── validations/transactions.ts
└── supabase.ts (upload helper)
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/transactions/page.tsx` - Filterable list (design ref: `transactions_m3/code.html`)
- [ ] `app/(dashboard)/transactions/[id]/page.tsx` - Transaction detail
- [ ] `app/(dashboard)/transactions/[id]/edit/page.tsx` - Edit form

### Components
- [ ] `components/transactions/TransactionList.tsx` - Paginated table
- [ ] `components/transactions/TransactionItem.tsx` - Row component
- [ ] `components/transactions/TransactionFilters.tsx` - Filter bar
- [ ] `components/forms/TransactionForm.tsx` - Add/edit modal
- [ ] `components/transactions/ReceiptUpload.tsx` - Image upload

### Server Actions (`actions/transactions.ts`)
- [ ] `createTransaction(input)` - Create with balance update
- [ ] `updateTransaction(id, input)` - Update with balance recalc
- [ ] `deleteTransaction(id)` - Delete with balance recalc
- [ ] `bulkDelete(ids)` - Delete multiple
- [ ] `importTransactions(csv)` - CSV import

### Validation Schemas (`lib/validations/transactions.ts`)
- [ ] `createTransactionSchema` - All required fields
- [ ] `updateTransactionSchema` - Partial
- [ ] `bulkDeleteSchema` - Array of IDs
- [ ] `importSchema` - CSV parsing validation

---

## Transaction Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Type | income/expense/transfer | ✅ | Toggle buttons |
| Amount | Number | ✅ | Tabular nums, right-aligned |
| Account | Select | ✅ | User's accounts |
| Date | Date picker | ✅ | Default today |
| Time | Time picker | optional | Default current time |
| Category | Hierarchical select | ✅ | System + custom |
| Note | Textarea | optional | Max 500 chars |
| Tags | Multi-tag input | optional | Comma-separated |
| Receipt | Image upload | optional | Supabase Storage |

---

## API Routes

### GET /api/transactions
Query params: page, limit, type, accountId, categoryId, dateFrom, dateTo, minAmount, maxAmount, tags, search, sort

### POST /api/transactions
Body: CreateTransactionInput

### GET /api/transactions/:id
Single transaction with relations

### PUT /api/transactions/:id
Update transaction

### DELETE /api/transactions/:id
Delete transaction

### DELETE /api/transactions/bulk
Body: { ids: string[] }

### POST /api/transactions/import
Body: FormData (CSV file)

---

## Balance Update Flow

```
Create Transaction
     │
     ▼
DB Transaction:
  1. INSERT INTO transactions
  2. UPDATE accounts SET balance = balance ± amount
     │
     ▼
Invalidate balance snapshot
     │
     ▼
revalidatePath('/transactions')
revalidatePath('/accounts')
revalidatePath('/dashboard')
```

---

## Design Reference

**Primary:** `docs/design-ref/transactions_m3/`
- `code.html` — Stats bar (bento), filter pills, paginated table with checkboxes
- `screen.png` — Full visual reference

**Design Plan:** `docs/04-ui-design-plan.md`
- Amount display: `tabular-nums`, income=emerald, expense=coral
- Filter bar with pill buttons
- Bulk selection pattern

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Table row hover states (background shift, no borders)
- Glassmorphism on filter bar

---

## Design Specifications

### Transaction List (from design ref)
```
┌─────────────────────────────────────────────────────────┐
│  Stats Bar (Bento style)                                │
│  Total In | Total Out | Net                            │
├─────────────────────────────────────────────────────────┤
│  Filter Pills                                           │
│  [Date] [Category] [Account] [Type] [+Advanced]        │
├─────────────────────────────────────────────────────────┤
│  Table                                                  │
│  Date | Description | Category | Account | Amount      │
│  ─────────────────────────────────────────────────────  │
│  Rows with hover state, checkbox for bulk actions      │
└─────────────────────────────────────────────────────────┘
```

### Amount Display
- **Income**: `text-secondary` (emerald) with `+` prefix
- **Expense**: `text-tertiary` (coral/red) with `-` prefix
- **Font**: `font-mono tabular-nums` for alignment

---

## Implementation Checklist

### Schema
- [ ] Create transactions table migration
- [ ] Add indexes for performance
- [ ] Run drizzle-kit generate + migrate

### Queries
- [ ] `getTransactions(userId, filters)`
- [ ] `getTransactionById(id, userId)`
- [ ] `getTransactionsByAccount(accountId, dateRange)`
- [ ] `getTransactionsByCategory(categoryId, dateRange)`

### Pages
- [ ] Build transaction list page with filters
- [ ] Build transaction detail page
- [ ] Build add/edit modal

### Server Actions
- [ ] Implement CRUD actions
- [ ] Implement bulk delete
- [ ] Implement CSV import

### Testing
- [ ] Test balance updates
- [ ] Test filter combinations
- [ ] Test receipt upload
- [ ] Test optimistic updates
