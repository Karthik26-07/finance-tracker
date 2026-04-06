import { z } from 'zod'

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer'])

const emptyToNull = (val: unknown) => (val === '' ? null : val)

const baseFields = {
  type: transactionTypeEnum,
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  accountId: z.string().uuid({ message: 'Invalid account ID' }),
  categoryId: z.preprocess(emptyToNull, z.string().uuid({ message: 'Invalid category ID' }).optional().nullable()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  time: z.preprocess(emptyToNull, z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)').optional().nullable()),
  note: z.preprocess(emptyToNull, z.string().max(500, { message: 'Note must be 500 characters or less' }).optional().nullable()),
  tags: z.array(z.string()).optional().nullable(),
  transferToAccountId: z.preprocess(emptyToNull, z.string().uuid({ message: 'Invalid transfer target account ID' }).optional().nullable()),
  receiptUrl: z.preprocess(emptyToNull, z.string().url({ message: 'Invalid receipt URL' }).optional().nullable()),
  location: z.preprocess(emptyToNull, z.string().max(200).optional().nullable()),
}

export const createTransactionSchema = z.object(baseFields).refine((data) => {
  if (data.type === 'transfer' && !data.transferToAccountId) {
    return false
  }
  return true
}, {
  message: 'Transfer must have a destination account',
  path: ['transferToAccountId'],
}).refine((data) => {
  if (data.type === 'transfer' && data.accountId === data.transferToAccountId) {
    return false
  }
  return true
}, {
  message: 'Cannot transfer to the same account',
  path: ['transferToAccountId'],
})

export const updateTransactionSchema = z.object(baseFields).partial()

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid({ message: 'Invalid transaction ID' })).min(1, { message: 'Select at least one transaction' }),
})

export const importTransactionRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amount: z.coerce.number().positive(),
  type: transactionTypeEnum,
  categoryName: z.string().optional(),
  note: z.string().optional(),
})

export const transactionFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: transactionTypeEnum.optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc'),
})

export const importTransactionsSchema = z.object({
  accountId: z.string().uuid(),
  transactions: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: z.coerce.number(),
    category: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
  })),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type TransactionFilters = z.infer<typeof transactionFilterSchema>
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>
export type ImportTransactionRow = z.infer<typeof importTransactionRowSchema>
export type ImportTransactionsInput = z.infer<typeof importTransactionsSchema>
