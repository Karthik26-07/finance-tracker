'use server'

import { createCategorySchema, updateCategorySchema } from '@/lib/validations/categories'
import { revalidatePath } from 'next/cache'
import { executeServerAction, requireAuth } from '@/lib/server-action-middleware'
import { ValidationError, ErrorResponse } from '@/lib/errors'
import { CategoryService } from './categories.service'

const categoryService = new CategoryService()

/**
 * Handle category creation with type-safe validation and auth
 */
export async function createCategory(input: unknown): Promise<ErrorResponse | { success: true, id: string }> {
  return executeServerAction(
    async () => {
      const userId = await requireAuth()
      const parsed = createCategorySchema.safeParse(input)
      if (!parsed.success) {
         throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid category data')
      }

      const newCategory = await categoryService.createCategory(userId, parsed.data)
      revalidatePath('/categories')
      return { success: true, id: newCategory.id }
    },
    { action: 'createCategory' }
  )
}

/**
 * Update category details
 */
export async function updateCategory(id: string, input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const userId = await requireAuth()
      const parsed = updateCategorySchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid category data')
      }

      await categoryService.updateCategory(id, userId, parsed.data)
      revalidatePath('/categories')
      return { success: true }
    },
    { action: 'updateCategory' }
  )
}

/**
 * Safe deletion of user-owned categories
 */
export async function deleteCategory(id: string): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const userId = await requireAuth()
      await categoryService.deleteCategory(id, userId)

      revalidatePath('/categories')
      revalidatePath('/transactions')
      return { success: true }
    },
    { action: 'deleteCategory' }
  )
}
