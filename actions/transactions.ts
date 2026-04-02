'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transactions, accounts, categories } from '@/lib/db/schema'
import { createTransactionSchema, updateTransactionSchema, bulkDeleteSchema, ImportTransactionRow } from '@/lib/validations/transactions'
import { eq, sql, and, inArray, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { executeServerAction } from '@/lib/server-action-middleware'
import { AuthError, ValidationError, ErrorResponse } from '@/lib/errors'

export async function createTransaction(input: unknown): Promise<ErrorResponse | { success: true, id: string }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to create a transaction')
      }

      const parsed = createTransactionSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid transaction data')
      }

      const data = parsed.data
      const userId = session.user.id

      // 1. Verify user owns the account
      const [account] = await db.select().from(accounts).where(and(eq(accounts.id, data.accountId), eq(accounts.userId, userId))).limit(1)
      if (!account) {
        throw new AuthError('NOT_FOUND', 'Account not found or access denied')
      }

      // 2. If it's a transfer, verify user owns the target account
      if (data.type === 'transfer' && data.transferToAccountId) {
        const [targetAccount] = await db.select().from(accounts).where(and(eq(accounts.id, data.transferToAccountId), eq(accounts.userId, userId))).limit(1)
        if (!targetAccount) {
          throw new AuthError('NOT_FOUND', 'Target account not found or access denied')
        }
      }

      let newTxId = ''

      // 3. Execute DB transaction for atomicity
      await db.transaction(async (tx) => {
        const [newTx] = await tx.insert(transactions).values({
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId || null,
          type: data.type,
          amount: data.amount.toString(),
          date: data.date,
          time: data.time || null,
          note: data.note || null,
          tags: data.tags || null,
          transferToAccountId: data.transferToAccountId || null,
          receiptUrl: data.receiptUrl || null,
          location: data.location || null,
        }).returning({ id: transactions.id })

        newTxId = newTx.id

        // Update balances
        if (data.type === 'income') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${data.amount}` }).where(eq(accounts.id, data.accountId))
        } else if (data.type === 'expense') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${data.amount}` }).where(eq(accounts.id, data.accountId))
        } else if (data.type === 'transfer' && data.transferToAccountId) {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${data.amount}` }).where(eq(accounts.id, data.accountId))
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${data.amount}` }).where(eq(accounts.id, data.transferToAccountId))
        }
      })

      await logger.info('Transaction created', { action: 'createTransaction', transactionId: newTxId, userId })
      revalidatePath('/transactions')
      revalidatePath('/accounts')
      revalidatePath(`/accounts/${data.accountId}`)

      return { success: true, id: newTxId }
    },
    { action: 'createTransaction' }
  )
}

export async function importTransactions(accountId: string, rows: ImportTransactionRow[]): Promise<ErrorResponse | { success: true, count: number }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to import transactions')
      }
      const userId = session.user.id

      // 1. Verify user owns account
      const [account] = await db.select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, userId))).limit(1)
      if (!account) {
        throw new AuthError('NOT_FOUND', 'Account not found')
      }

      // 2. Map Categorires
      const allCategories = await db.select().from(categories).where(or(eq(categories.userId, userId), eq(categories.isSystem, true)))
      const categoryMap = new Map<string, string>()
      allCategories.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id))

      let totalImpact = 0

      // 3. Transactional Insert
      await db.transaction(async (tx) => {
        for (const row of rows) {
          const categoryId = row.categoryName ? categoryMap.get(row.categoryName.toLowerCase()) : null

          await tx.insert(transactions).values({
            userId,
            accountId,
            categoryId,
            type: row.type,
            amount: row.amount.toString(),
            date: row.date,
            note: row.note || null,
          })

          if (row.type === 'income') totalImpact += row.amount
          else if (row.type === 'expense') totalImpact -= row.amount
        }

        // 4. Single balance update
        await tx.update(accounts).set({
          balance: sql`${accounts.balance} + ${totalImpact}`
        }).where(eq(accounts.id, accountId))
      })

      await logger.info('Transactions imported', { action: 'importTransactions', count: rows.length, userId })
      revalidatePath('/transactions')
      revalidatePath('/accounts')

      return { success: true, count: rows.length }
    },
    { action: 'importTransactions' }
  )
}

export async function updateTransaction(id: string, input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to update transaction')
      }

      const parsed = updateTransactionSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid transaction data')
      }

      const data = parsed.data
      const userId = session.user.id

      // 1. Verify user owns the transaction
      const [existingTx] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).limit(1)
      if (!existingTx) {
        throw new AuthError('NOT_FOUND', 'Transaction not found or access denied')
      }

      // 2. Execute DB transaction for balance update
      await db.transaction(async (tx) => {
        const oldAmount = parseFloat(existingTx.amount)
        const oldType = existingTx.type
        const oldAccountId = existingTx.accountId
        const oldTransferToAccountId = existingTx.transferToAccountId

        // First, revert old balance changes
        if (oldType === 'income') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${oldAmount}` }).where(eq(accounts.id, oldAccountId))
        } else if (oldType === 'expense') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${oldAmount}` }).where(eq(accounts.id, oldAccountId))
        } else if (oldType === 'transfer' && oldTransferToAccountId) {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${oldAmount}` }).where(eq(accounts.id, oldAccountId))
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${oldAmount}` }).where(eq(accounts.id, oldTransferToAccountId))
        }

        // Apply new values (or use existing if not provided)
        const newAccountId = data.accountId || oldAccountId
        const newAmount = data.amount !== undefined ? data.amount : oldAmount
        const newType = data.type || oldType
        const newTransferToAccountId = data.type === 'transfer' ? (data.transferToAccountId || oldTransferToAccountId) : null

        // Apply new balance changes
        if (newType === 'income') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${newAmount}` }).where(eq(accounts.id, newAccountId))
        } else if (newType === 'expense') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${newAmount}` }).where(eq(accounts.id, newAccountId))
        } else if (newType === 'transfer' && newTransferToAccountId) {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${newAmount}` }).where(eq(accounts.id, newAccountId))
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${newAmount}` }).where(eq(accounts.id, newTransferToAccountId))
        }

        // Update transaction row
        await tx.update(transactions).set({
          accountId: newAccountId,
          categoryId: data.categoryId !== undefined ? (data.categoryId || null) : existingTx.categoryId,
          type: newType,
          amount: newAmount.toString(),
          date: data.date || existingTx.date,
          time: data.time !== undefined ? (data.time || null) : existingTx.time,
          note: data.note !== undefined ? (data.note || null) : existingTx.note,
          tags: data.tags !== undefined ? (data.tags || null) : existingTx.tags,
          transferToAccountId: newTransferToAccountId,
          receiptUrl: data.receiptUrl !== undefined ? (data.receiptUrl || null) : existingTx.receiptUrl,
          location: data.location !== undefined ? (data.location || null) : existingTx.location,
          updatedAt: new Date(),
        }).where(eq(transactions.id, id))
      })

      await logger.info('Transaction updated', { action: 'updateTransaction', transactionId: id, userId })
      revalidatePath('/transactions')
      revalidatePath('/accounts')

      return { success: true }
    },
    { action: 'updateTransaction' }
  )
}

export async function deleteTransaction(id: string): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to delete transaction')
      }

      const userId = session.user.id

      // 1. Verify user owns transaction
      const [existingTx] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).limit(1)
      if (!existingTx) {
        throw new AuthError('NOT_FOUND', 'Transaction not found or access denied')
      }

      // 2. Execute DB transaction for balance update
      await db.transaction(async (tx) => {
        const amount = parseFloat(existingTx.amount)
        const type = existingTx.type
        const accountId = existingTx.accountId
        const transferToAccountId = existingTx.transferToAccountId

        // Revert balance changes
        if (type === 'income') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, accountId))
        } else if (type === 'expense') {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, accountId))
        } else if (type === 'transfer' && transferToAccountId) {
          await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, accountId))
          await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, transferToAccountId))
        }

        // Delete row
        await tx.delete(transactions).where(eq(transactions.id, id))
      })

      await logger.info('Transaction deleted', { action: 'deleteTransaction', transactionId: id, userId })
      revalidatePath('/transactions')
      revalidatePath('/accounts')

      return { success: true }
    },
    { action: 'deleteTransaction' }
  )
}

export async function bulkDeleteTransactions(input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to delete transactions')
      }

      const parsed = bulkDeleteSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid selection')
      }

      const { ids } = parsed.data
      const userId = session.user.id

      // 1. Verify user owns all transactions
      const existingTxs = await db.select().from(transactions).where(and(inArray(transactions.id, ids), eq(transactions.userId, userId)))
      if (existingTxs.length !== ids.length) {
        throw new AuthError('NOT_FOUND', 'Some transactions not found or access denied')
      }

      // 2. Execute DB transaction for bulk delete and balance updates
      await db.transaction(async (tx) => {
        for (const txRecord of existingTxs) {
          const amount = parseFloat(txRecord.amount)
          const type = txRecord.type
          const accountId = txRecord.accountId
          const transferToAccountId = txRecord.transferToAccountId

          // Revert balance changes
          if (type === 'income') {
            await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, accountId))
          } else if (type === 'expense') {
            await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, accountId))
          } else if (type === 'transfer' && transferToAccountId) {
            await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, accountId))
            await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, transferToAccountId))
          }
        }

        // Delete all rows
        await tx.delete(transactions).where(and(inArray(transactions.id, ids), eq(transactions.userId, userId)))
      })

      await logger.info('Transactions bulk deleted', { action: 'bulkDeleteTransactions', count: ids.length, userId })
      revalidatePath('/transactions')
      revalidatePath('/accounts')

      return { success: true }
    },
    { action: 'bulkDeleteTransactions' }
  )
}
