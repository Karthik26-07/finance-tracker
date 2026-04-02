import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, and, or, isNull } from 'drizzle-orm'

export async function getCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(or(
      isNull(categories.userId),
      eq(categories.userId, userId)
    ))
    .orderBy(categories.name)
}

export async function getCategoriesByType(userId: string, type: 'income' | 'expense' | 'both') {
  const typeFilter = type === 'both' ? undefined : or(eq(categories.type, type), eq(categories.type, 'both'))
  
  return db
    .select()
    .from(categories)
    .where(and(
      or(isNull(categories.userId), eq(categories.userId, userId)),
      typeFilter
    ))
    .orderBy(categories.name)
}
