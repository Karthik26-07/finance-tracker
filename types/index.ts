import type { InferSelectModel } from 'drizzle-orm'
import type {
  users, accounts, categories, transactions,
  groups, groupMembers, groupTransactions, groupSplits,
  recurringRules, budgets, dailyBalanceSnapshots,
} from '@/lib/db/schema'

// Inferred DB types
export type User              = InferSelectModel<typeof users>
export type Account           = InferSelectModel<typeof accounts>
export type Category          = InferSelectModel<typeof categories>
export type Transaction       = InferSelectModel<typeof transactions>
export type Group             = InferSelectModel<typeof groups>
export type GroupMember       = InferSelectModel<typeof groupMembers>
export type GroupTransaction  = InferSelectModel<typeof groupTransactions>
export type GroupSplit        = InferSelectModel<typeof groupSplits>
export type RecurringRule     = InferSelectModel<typeof recurringRules>
export type Budget            = InferSelectModel<typeof budgets>
export type DailySnapshot     = InferSelectModel<typeof dailyBalanceSnapshots>

// Extended session user type
export type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

// Transaction filter type used in queries
export type TransactionFilters = {
  type?: 'income' | 'expense' | 'transfer'
  accountId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
}
