# 02 — Database Schema

## Entity Relationship Overview

```
User ──< Account ──< Transaction >── Category
                          │
                          ├──< TransactionSplit >── GroupMember
                          │
                          └── RecurringRule

User ──< Group ──< GroupMember
              └──< GroupTransaction ──< GroupSplit

User ──< Budget >── Category
User ──< RecurringRule
```

All schema is defined using **Drizzle ORM** in `lib/db/schema/`. The SQL representation is shown alongside each table for reference.

---

## Drizzle Client Setup (`lib/db/index.ts`)

```ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,   // connection pool size
})

export const db = drizzle(client, { schema })
```

---

## Drizzle Config (`drizzle.config.ts`)

```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

---

## Tables

### `users` (`lib/db/schema/users.ts`)

```ts
import { pgTable, uuid, varchar, char, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 100 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  currency:     char('currency', { length: 3 }).default('INR'),
  timezone:     varchar('timezone', { length: 50 }).default('Asia/Kolkata'),
  avatarUrl:    text('avatar_url'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
```

---

### `accounts` (`lib/db/schema/accounts.ts`)

Represents a financial account: bank account, cash wallet, credit card, etc.

```ts
import { pgTable, uuid, varchar, numeric, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const accountTypeEnum = pgEnum('account_type', [
  'bank', 'cash', 'credit', 'wallet', 'investment'
])

export const accounts = pgTable('accounts', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:           varchar('name', { length: 100 }).notNull(),
  type:           accountTypeEnum('type').notNull(),
  balance:        numeric('balance', { precision: 15, scale: 2 }).default('0.00'),
  openingBalance: numeric('opening_balance', { precision: 15, scale: 2 }).default('0.00'),
  color:          varchar('color', { length: 7 }),
  icon:           varchar('icon', { length: 50 }),
  isActive:       boolean('is_active').default(true),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
```

---

### `categories` (`lib/db/schema/categories.ts`)

```ts
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense', 'both'])

export const categories = pgTable('categories', {
  id:       uuid('id').primaryKey().defaultRandom(),
  userId:   uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // NULL = system default
  name:     varchar('name', { length: 100 }).notNull(),
  icon:     varchar('icon', { length: 50 }),
  color:    varchar('color', { length: 7 }),
  type:     categoryTypeEnum('type').notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

Default system categories seeded via `drizzle-seed` or a migration script: Food, Transport, Rent, Utilities, Entertainment, Healthcare, Shopping, Salary, Freelance, Investment, etc.

---

### `transactions` (`lib/db/schema/transactions.ts`)

Core table — every money movement lives here.

```ts
import { pgTable, uuid, varchar, numeric, text, boolean, date, time, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'
import { categories } from './categories'

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
  recurringRuleId:     uuid('recurring_rule_id'),   // FK added after recurring table
  groupId:             uuid('group_id'),             // FK added after groups table
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

### `groups` (`lib/db/schema/groups.ts`)

A group represents a set of people sharing expenses (e.g., "Goa Trip", "Flat Mates").

```ts
export const groups = pgTable('groups', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdBy:   uuid('created_by').notNull().references(() => users.id),
  icon:        varchar('icon', { length: 50 }),
  color:       varchar('color', { length: 7 }),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

---

### `group_members` (`lib/db/schema/groups.ts`)

```ts
export const groupMemberRoleEnum = pgEnum('group_member_role', ['admin', 'member'])

export const groupMembers = pgTable('group_members', {
  id:       uuid('id').primaryKey().defaultRandom(),
  groupId:  uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId:   uuid('user_id').references(() => users.id), // NULL = external member
  name:     varchar('name', { length: 100 }),
  email:    varchar('email', { length: 255 }),
  role:     groupMemberRoleEnum('role').default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
})
```

---

### `group_transactions` (`lib/db/schema/groups.ts`)

```ts
export const splitTypeEnum = pgEnum('split_type', ['equal', 'percentage', 'exact', 'shares'])

export const groupTransactions = pgTable('group_transactions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  groupId:     uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  title:       varchar('title', { length: 200 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidBy:      uuid('paid_by').notNull().references(() => groupMembers.id),
  date:        date('date').notNull(),
  note:        text('note'),
  receiptUrl:  text('receipt_url'),
  splitType:   splitTypeEnum('split_type').default('equal'),
  categoryId:  uuid('category_id').references(() => categories.id),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

---

### `group_splits` (`lib/db/schema/groups.ts`)

Who owes what for each group transaction.

```ts
export const groupSplits = pgTable('group_splits', {
  id:                         uuid('id').primaryKey().defaultRandom(),
  groupTransactionId:         uuid('group_transaction_id').notNull().references(() => groupTransactions.id, { onDelete: 'cascade' }),
  memberId:                   uuid('member_id').notNull().references(() => groupMembers.id),
  amountOwed:                 numeric('amount_owed', { precision: 15, scale: 2 }).notNull(),
  isSettled:                  boolean('is_settled').default(false),
  settledAt:                  timestamp('settled_at', { withTimezone: true }),
  settledViaTransactionId:    uuid('settled_via_transaction_id').references(() => transactions.id),
})
```

---

### `recurring_rules` (`lib/db/schema/recurring.ts`)

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
  dayOfWeek:          smallint('day_of_week'),          // 0=Sun … 6=Sat (weekly)
  dayOfMonth:         smallint('day_of_month'),          // 1–31 (monthly)
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
  nextRunIdx: index('idx_recurring_next_run').on(table.nextRunDate).where(sql`${table.isActive} = true`),
}))
```

---

### `budgets` (`lib/db/schema/budgets.ts`)

Monthly spending limits per category.

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

### `daily_balance_snapshots` (`lib/db/schema/snapshots.ts`)

Pre-computed for fast opening/closing balance reports.

```ts
export const dailyBalanceSnapshots = pgTable('daily_balance_snapshots', {
  id:        uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  date:      date('date').notNull(),
  opening:   numeric('opening', { precision: 15, scale: 2 }).notNull(),
  closing:   numeric('closing', { precision: 15, scale: 2 }).notNull(),
  totalIn:   numeric('total_in', { precision: 15, scale: 2 }).default('0'),
  totalOut:  numeric('total_out', { precision: 15, scale: 2 }).default('0'),
}, (table) => ({
  uniqueAccountDate:    unique('uq_snapshot_account_date').on(table.accountId, table.date),
  accountDateIdx:       index('idx_snapshot_account_date').on(table.accountId, table.date),
}))
```

---

## Schema Barrel Export (`lib/db/schema/index.ts`)

```ts
export * from './users'
export * from './accounts'
export * from './categories'
export * from './transactions'
export * from './groups'
export * from './recurring'
export * from './budgets'
export * from './snapshots'
```

---

## Drizzle Relations (`lib/db/schema/relations.ts`)

```ts
import { relations } from 'drizzle-orm'
import { users, accounts, transactions, categories, recurringRules, budgets } from '.'

export const usersRelations = relations(users, ({ many }) => ({
  accounts:       many(accounts),
  transactions:   many(transactions),
  recurringRules: many(recurringRules),
  budgets:        many(budgets),
}))

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user:         one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user:          one(users,          { fields: [transactions.userId],          references: [users.id] }),
  account:       one(accounts,       { fields: [transactions.accountId],       references: [accounts.id] }),
  category:      one(categories,     { fields: [transactions.categoryId],      references: [categories.id] }),
  recurringRule: one(recurringRules, { fields: [transactions.recurringRuleId], references: [recurringRules.id] }),
}))
```

---

## Computed Views

### `v_monthly_summary`

```sql
CREATE VIEW v_monthly_summary AS
SELECT
  t.user_id,
  t.account_id,
  DATE_TRUNC('month', t.date::timestamp) AS month,
  SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE -t.amount END) AS net
FROM transactions t
GROUP BY t.user_id, t.account_id, DATE_TRUNC('month', t.date::timestamp);
```

---

## Migration Workflow

```bash
# Generate a migration after schema change
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Push schema directly in development (no migration file)
npx drizzle-kit push

# Open Drizzle Studio to inspect data
npx drizzle-kit studio
```

---

## Seed Script (`lib/db/seed.ts`)

```ts
import { db } from './index'
import { categories } from './schema'

const SYSTEM_CATEGORIES = [
  { name: 'Food & Dining',    icon: 'utensils',     color: '#F87171', type: 'expense' as const, isSystem: true },
  { name: 'Transport',         icon: 'car',          color: '#FBBF24', type: 'expense' as const, isSystem: true },
  { name: 'Rent & Housing',    icon: 'home',         color: '#A78BFA', type: 'expense' as const, isSystem: true },
  { name: 'Utilities',         icon: 'zap',          color: '#38BDF8', type: 'expense' as const, isSystem: true },
  { name: 'Entertainment',     icon: 'tv',           color: '#FB7185', type: 'expense' as const, isSystem: true },
  { name: 'Healthcare',        icon: 'heart-pulse',  color: '#34D399', type: 'expense' as const, isSystem: true },
  { name: 'Shopping',          icon: 'shopping-bag', color: '#4F8EF7', type: 'expense' as const, isSystem: true },
  { name: 'Salary',            icon: 'briefcase',    color: '#34D399', type: 'income'  as const, isSystem: true },
  { name: 'Freelance',         icon: 'laptop',       color: '#4F8EF7', type: 'income'  as const, isSystem: true },
  { name: 'Investment Return', icon: 'trending-up',  color: '#FBBF24', type: 'income'  as const, isSystem: true },
]

export async function seed() {
  await db.insert(categories).values(SYSTEM_CATEGORIES).onConflictDoNothing()
  console.log('Seeded system categories')
}
```
