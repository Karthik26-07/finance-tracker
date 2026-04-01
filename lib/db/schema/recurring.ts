import { pgTable, uuid, varchar, numeric, text, boolean, date, timestamp, index, smallint, integer, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { accounts } from './accounts'
import { categories } from './categories'
import { txTypeEnum } from './transactions'

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
}, (table) => [
  index('idx_recurring_next_run').on(table.nextRunDate).where(sql`${table.isActive} = true`),
])
