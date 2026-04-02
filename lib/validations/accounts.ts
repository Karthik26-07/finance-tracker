import { z } from 'zod'

export const createAccountSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }).max(100, { message: 'Name must be 100 characters or less' }),
  type: z.enum(['bank', 'cash', 'credit', 'wallet', 'investment'], {
    message: 'Account type is required',
  }),
  openingBalance: z.coerce.number().default(0),
  color: z.string().length(7, { message: 'Color must be a valid hex code' }).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
})

export const updateAccountSchema = createAccountSchema.partial()

export const transferSchema = z.object({
  fromAccountId: z.string().uuid({ message: 'Invalid from account' }),
  toAccountId: z.string().uuid({ message: 'Invalid to account' }),
  amount: z.coerce.number().positive({ message: 'Transfer amount must be greater than 0' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  note: z.string().max(500, { message: 'Note must be less than 500 characters' }).optional().nullable(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Cannot transfer to the same account",
  path: ["toAccountId"]
})

export type CreateAccountInput = z.output<typeof createAccountSchema>
export type UpdateAccountInput = z.output<typeof updateAccountSchema>
export type TransferInput = z.output<typeof transferSchema>
