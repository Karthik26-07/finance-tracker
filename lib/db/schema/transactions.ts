import { pgTable, uuid, varchar, numeric, text, boolean, date, time, timestamp, index, pgEnum } from 'drizzle-orm/pg-core'
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
  recurringRuleId:     uuid('recurring_rule_id'),
  groupId:             uuid('group_id'),
  transferToAccountId: uuid('transfer_to_account_id').references(() => accounts.id),
  receiptUrl:          text('receipt_url'),
  location:            varchar('location', { length: 200 }),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_transactions_user_date').on(table.userId, table.date),
  index('idx_transactions_account').on(table.accountId),
  index('idx_transactions_category').on(table.categoryId),
])
