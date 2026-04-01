import { pgTable, uuid, numeric, date, index, unique } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const dailyBalanceSnapshots = pgTable('daily_balance_snapshots', {
  id:        uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  date:      date('date').notNull(),
  opening:   numeric('opening', { precision: 15, scale: 2 }).notNull(),
  closing:   numeric('closing', { precision: 15, scale: 2 }).notNull(),
  totalIn:   numeric('total_in', { precision: 15, scale: 2 }).default('0'),
  totalOut:  numeric('total_out', { precision: 15, scale: 2 }).default('0'),
}, (table) => [
  unique('uq_snapshot_account_date').on(table.accountId, table.date),
  index('idx_snapshot_account_date').on(table.accountId, table.date),
])
