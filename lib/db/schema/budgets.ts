import { pgTable, uuid, numeric, timestamp, smallint, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'
import { categories } from './categories'

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
