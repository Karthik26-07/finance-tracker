'use server'

import { createTransactionSchema, updateTransactionSchema, bulkDeleteSchema, importTransactionsSchema } from '@/lib/validations/transactions'
import { revalidatePath } from 'next/cache'
import { executeServerAction } from '@/lib/server-action-middleware'
import { ValidationError, ErrorResponse } from '@/lib/errors'
import { TransactionService } from './transactions.service'

const transactionService = new TransactionService()

export async function createTransaction(input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      const parsed = createTransactionSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid transaction data')
      }

      await transactionService.createTransaction(session!.user.id, parsed.data)

      revalidatePath('/transactions')
      revalidatePath('/accounts')
      revalidatePath('/dashboard')
      return { success: true }
    },
    { action: 'createTransaction' }
  )
}

export async function updateTransaction(id: string, input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      const parsed = updateTransactionSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid transaction data')
      }

      await transactionService.updateTransaction(id, session!.user.id, parsed.data)

      revalidatePath('/transactions')
      revalidatePath('/accounts')
      revalidatePath('/dashboard')
      return { success: true }
    },
    { action: 'updateTransaction' }
  )
}

export async function deleteTransaction(id: string): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      await transactionService.deleteTransaction(id, session!.user.id)

      revalidatePath('/transactions')
      revalidatePath('/accounts')
      revalidatePath('/dashboard')
      return { success: true }
    },
    { action: 'deleteTransaction' }
  )
}

export async function bulkDeleteTransactions(input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async (session) => {
      const parsed = bulkDeleteSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid input data')
      }

      await transactionService.bulkDeleteTransactions(parsed.data.ids, session!.user.id)

      revalidatePath('/transactions')
      revalidatePath('/accounts')
      revalidatePath('/dashboard')
      return { success: true }
    },
    { action: 'bulkDeleteTransactions' }
  )
}

export async function importTransactions(input: unknown): Promise<ErrorResponse | { success: true, count: number }> {
  return executeServerAction(
    async (session) => {
      const parsed = importTransactionsSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid import data')
      }

      const { accountId, transactions: trans } = parsed.data
      const result = await transactionService.importTransactions(session!.user.id, accountId, trans)

      revalidatePath('/transactions')
      revalidatePath('/accounts')
      revalidatePath('/dashboard')
      return { success: true, count: result.count }
    },
    { action: 'importTransactions' }
  )
}
