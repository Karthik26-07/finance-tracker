'use server'

import { createAccountSchema, updateAccountSchema, transferSchema } from '@/lib/validations/accounts'
import { revalidatePath } from 'next/cache'
import { executeServerAction, requireAuth } from '@/lib/server-action-middleware'
import { ValidationError, ErrorResponse } from '@/lib/errors'
import { AccountService } from './accounts.service'

const accountService = new AccountService()

export async function createAccount(input: unknown): Promise<ErrorResponse | { success: true, id: string }> {
  return executeServerAction(
    async () => {
      const userId = await requireAuth()
      const parsed = createAccountSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid account data')
      }

      const newAccount = await accountService.createAccount(userId, parsed.data)
      revalidatePath('/accounts')
      return { success: true, id: newAccount.id }
    },
    { action: 'createAccount' }
  )
}

export async function updateAccount(id: string, input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const userId = await requireAuth()
      const parsed = updateAccountSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid account data')
      }

      await accountService.updateAccount(id, userId, parsed.data)
      revalidatePath('/accounts')
      return { success: true }
    },
    { action: 'updateAccount' }
  )
}

export async function archiveAccount(id: string): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const userId = await requireAuth()
      await accountService.archiveAccount(id, userId)

      revalidatePath('/accounts')
      return { success: true }
    },
    { action: 'archiveAccount' }
  )
}

export async function transferFunds(input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
       const userId = await requireAuth()
      const parsed = transferSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid transfer data')
      }

      await accountService.transferFunds(userId, {
        ...parsed.data,
        amount: Number(parsed.data.amount)
      })

      revalidatePath('/accounts')
      revalidatePath('/transactions')
      return { success: true }
    },
    { action: 'transferFunds' }
  )
}
