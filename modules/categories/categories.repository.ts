import { BaseRepository } from '../shared/base.repository'
import { categories, type Category, type NewCategory } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { or, eq, and, isNull } from 'drizzle-orm'

export class CategoryRepository extends BaseRepository<typeof categories, Category, NewCategory, any> {
  constructor(database: any = db) {
    super(database, categories)
  }

  withTransaction(tx: any): this {
    return new CategoryRepository(tx) as this
  }

  async getUserAndSystemCategories(userId: string) {
    return this.db
      .select()
      .from(categories)
      .where(or(
        isNull(categories.userId),
        eq(categories.userId, userId),
        eq(categories.isSystem, true)
      ))
      .orderBy(categories.name)
  }

  async getCategoriesByType(userId: string, type: 'income' | 'expense' | 'both') {
    const typeFilter = type === 'both' ? undefined : or(eq(categories.type, type), eq(categories.type, 'both'))
    
    return this.db
      .select()
      .from(categories)
      .where(and(
        or(isNull(categories.userId), eq(categories.userId, userId)),
        typeFilter
      ))
      .orderBy(categories.name)
  }

  async getByIdWithUserId(id: string, userId: string) {
    return this.findFirst(and(eq(categories.id, id), eq(categories.userId, userId)))
  }
}
