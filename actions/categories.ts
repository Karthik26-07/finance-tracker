'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categories, transactions } from '@/lib/db/schema'
import { createCategorySchema, updateCategorySchema } from '@/lib/validations/categories'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { executeServerAction } from '@/lib/server-action-middleware'
import { AuthError, ValidationError, ErrorResponse } from '@/lib/errors'

export async function createCategory(input: unknown): Promise<ErrorResponse | { success: true, id: string }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to create a category')
      }

      const parsed = createCategorySchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid category data')
      }

      const data = parsed.data
      const userId = session.user.id

      const [newCategory] = await db.insert(categories).values({
        userId,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        parentId: data.parentId,
        description: data.description,
        isSystem: false,
      }).returning({ id: categories.id })

      await logger.info('Category created', { action: 'createCategory', categoryId: newCategory.id, userId: session.user.id })
      revalidatePath('/categories')
      return { success: true, id: newCategory.id }
    },
    { action: 'createCategory' }
  )
}

export async function updateCategory(id: string, input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to update category')
      }

      const parsed = updateCategorySchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid category data')
      }

      // Ensure user owns category and it's not a system category
      const [existing] = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, session.user.id), eq(categories.isSystem, false))).limit(1)
      if (!existing) {
        throw new AuthError('NOT_FOUND', 'Category not found or cannot be modified')
      }

      await db.update(categories).set({
        ...parsed.data,
      }).where(eq(categories.id, id))

      await logger.info('Category updated', { action: 'updateCategory', categoryId: id, userId: session.user.id })
      revalidatePath('/categories')
      return { success: true }
    },
    { action: 'updateCategory' }
  )
}

export async function deleteCategory(id: string): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to delete category')
      }

      // Ensure user owns category and it's not a system category
      const [existing] = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, session.user.id), eq(categories.isSystem, false))).limit(1)
      if (!existing) {
        throw new AuthError('NOT_FOUND', 'Category not found or cannot be deleted')
      }

      // Check if it has subcategories
      const [sub] = await db.select().from(categories).where(eq(categories.parentId, id)).limit(1)
      if (sub) {
        throw new ValidationError('Cannot delete category with subcategories. Reassign or delete subcategories first.')
      }

      // Handle transactions: set categoryId to null
      await db.update(transactions).set({ categoryId: null }).where(eq(transactions.categoryId, id))

      await db.delete(categories).where(eq(categories.id, id))

      await logger.info('Category deleted', { action: 'deleteCategory', categoryId: id, userId: session.user.id })
      revalidatePath('/categories')
      revalidatePath('/transactions')
      return { success: true }
    },
    { action: 'deleteCategory' }
  )
}
