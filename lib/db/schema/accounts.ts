import { pgTable, uuid, varchar, numeric, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'
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

export type Account = InferSelectModel<typeof accounts>
export type NewAccount = InferInsertModel<typeof accounts>
