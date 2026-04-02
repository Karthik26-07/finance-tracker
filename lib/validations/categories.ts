import { z } from 'zod'

export const categoryTypeEnum = z.enum(['income', 'expense', 'both'])

const baseFields = {
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be #RRGGBB)').optional().nullable(),
  type: categoryTypeEnum,
  parentId: z.preprocess(
    (val) => (val === '' ? null : val),
    z.string().uuid('Invalid parent category ID').optional().nullable()
  ),
}

export const createCategorySchema = z.object(baseFields)
export const updateCategorySchema = z.object(baseFields).partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
