import { relations } from 'drizzle-orm'
import { users } from './users'
import { accounts } from './accounts'
import { transactions } from './transactions'
import { categories } from './categories'
import { recurringRules } from './recurring'
import { budgets } from './budgets'
import { groups, groupMembers, groupTransactions, groupSplits } from './groups'
import { dailyBalanceSnapshots } from './snapshots'

export const usersRelations = relations(users, ({ many }) => ({
  accounts:       many(accounts),
  transactions:   many(transactions),
  recurringRules: many(recurringRules),
  budgets:        many(budgets),
}))

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user:         one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
  snapshots:    many(dailyBalanceSnapshots),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user:          one(users,      { fields: [transactions.userId],          references: [users.id] }),
  account:       one(accounts,   { fields: [transactions.accountId],       references: [accounts.id] }),
  category:      one(categories, { fields: [transactions.categoryId],      references: [categories.id] }),
  recurringRule: one(recurringRules, { fields: [transactions.recurringRuleId], references: [recurringRules.id] }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user:         one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
  budgets:      many(budgets),
}))

export const recurringRulesRelations = relations(recurringRules, ({ one }) => ({
  user:     one(users,      { fields: [recurringRules.userId],     references: [users.id] }),
  account:  one(accounts,   { fields: [recurringRules.accountId],  references: [accounts.id] }),
  category: one(categories, { fields: [recurringRules.categoryId], references: [categories.id] }),
}))

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user:     one(users,      { fields: [budgets.userId],     references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}))

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
  members: many(groupMembers),
  transactions: many(groupTransactions),
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user:  one(users,  { fields: [groupMembers.userId],  references: [users.id] }),
}))

export const groupTransactionsRelations = relations(groupTransactions, ({ one, many }) => ({
  group:    one(groups,       { fields: [groupTransactions.groupId],    references: [groups.id] }),
  paidByMember: one(groupMembers, { fields: [groupTransactions.paidBy], references: [groupMembers.id] }),
  category: one(categories,   { fields: [groupTransactions.categoryId], references: [categories.id] }),
  splits:   many(groupSplits),
}))

export const groupSplitsRelations = relations(groupSplits, ({ one }) => ({
  groupTransaction: one(groupTransactions, { fields: [groupSplits.groupTransactionId], references: [groupTransactions.id] }),
  member:           one(groupMembers,      { fields: [groupSplits.memberId],           references: [groupMembers.id] }),
  settledVia:       one(transactions,      { fields: [groupSplits.settledViaTransactionId], references: [transactions.id] }),
}))

export const dailyBalanceSnapshotsRelations = relations(dailyBalanceSnapshots, ({ one }) => ({
  account: one(accounts, { fields: [dailyBalanceSnapshots.accountId], references: [accounts.id] }),
}))
