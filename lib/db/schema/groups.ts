import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum, numeric, date } from 'drizzle-orm/pg-core'
import { users } from './users'
import { categories } from './categories'
import { transactions } from './transactions'

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

export const groupSplits = pgTable('group_splits', {
  id:                         uuid('id').primaryKey().defaultRandom(),
  groupTransactionId:         uuid('group_transaction_id').notNull().references(() => groupTransactions.id, { onDelete: 'cascade' }),
  memberId:                   uuid('member_id').notNull().references(() => groupMembers.id),
  amountOwed:                 numeric('amount_owed', { precision: 15, scale: 2 }).notNull(),
  isSettled:                  boolean('is_settled').default(false),
  settledAt:                  timestamp('settled_at', { withTimezone: true }),
  settledViaTransactionId:    uuid('settled_via_transaction_id').references(() => transactions.id),
})
