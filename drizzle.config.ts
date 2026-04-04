import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: [
    'users', 
    'accounts', 
    'categories', 
    'transactions', 
    'groups', 
    'group_members', 
    'group_transactions', 
    'group_splits', 
    'recurring_rules', 
    'budgets', 
    'daily_balance_snapshots', 
    'sessions'
  ],
} satisfies Config


