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
  console.log('✅ Seeded system categories')
}

// Run directly with: npx tsx lib/db/seed.ts
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
