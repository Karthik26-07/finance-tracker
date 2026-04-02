'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { accounts, transactions } from '@/lib/db/schema'
import { createAccountSchema, updateAccountSchema, transferSchema } from '@/lib/validations/accounts'
import { eq, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { executeServerAction } from '@/lib/server-action-middleware'
import { AuthError, ValidationError, ErrorResponse } from '@/lib/errors'

export async function createAccount(input: unknown): Promise<ErrorResponse | { success: true, id: string }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to create an account')
      }

      const parsed = createAccountSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid account data')
      }

      const data = parsed.data
      const userId = session.user.id
      
      const [newAccount] = await db.insert(accounts).values({
        userId,
        name: data.name,
        type: data.type,
        openingBalance: (data.openingBalance || 0).toString(),
        balance: (data.openingBalance || 0).toString(),
        color: data.color || null,
        icon: data.icon || null,
      }).returning({ id: accounts.id })

      await logger.info('Account created', { action: 'createAccount', accountId: newAccount.id, userId: session.user.id })
      revalidatePath('/accounts')
      return { success: true, id: newAccount.id }
    },
    { action: 'createAccount' }
  )
}

export async function updateAccount(id: string, input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to update account')
      }

      const parsed = updateAccountSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid account data')
      }

      // Ensure user owns account
      const [existing] = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id))).limit(1)
      if (!existing) {
        throw new AuthError('NOT_FOUND', 'Account not found')
      }

      await db.update(accounts).set({
        ...parsed.data,
        openingBalance: parsed.data.openingBalance !== undefined ? parsed.data.openingBalance.toString() : undefined,
        updatedAt: new Date()
      }).where(eq(accounts.id, id))

      await logger.info('Account updated', { action: 'updateAccount', accountId: id, userId: session.user.id })
      revalidatePath('/accounts')
      revalidatePath(`/accounts/${id}`)
      return { success: true }
    },
    { action: 'updateAccount' }
  )
}

export async function archiveAccount(id: string): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to archive account')
      }

      const [existing] = await db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id))).limit(1)
      if (!existing) {
        throw new AuthError('NOT_FOUND', 'Account not found')
      }

      await db.update(accounts).set({
        isActive: false,
        updatedAt: new Date()
      }).where(eq(accounts.id, id))

      await logger.info('Account archived', { action: 'archiveAccount', accountId: id, userId: session.user.id })
      revalidatePath('/accounts')
      return { success: true }
    },
    { action: 'archiveAccount' }
  )
}

export async function transferFunds(input: unknown): Promise<ErrorResponse | { success: true }> {
  return executeServerAction(
    async () => {
      const session = await auth()
      if (!session?.user?.id) {
        throw new AuthError('UNAUTHORIZED', 'Please log in to transfer funds')
      }
      const userId = session.user.id

      const parsed = transferSchema.safeParse(input)
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid transfer data')
      }

      const { fromAccountId, toAccountId, amount, date, note } = parsed.data

      // Ensure user owns both accounts
      const fromAcc = await db.select().from(accounts).where(and(eq(accounts.id, fromAccountId), eq(accounts.userId, session.user.id))).limit(1)
      const toAcc = await db.select().from(accounts).where(and(eq(accounts.id, toAccountId), eq(accounts.userId, session.user.id))).limit(1)

      if (!fromAcc.length || !toAcc.length) {
        throw new AuthError('NOT_FOUND', 'One or both accounts not found')
      }

      // Execute DB transaction
      await db.transaction(async (tx) => {
        const transferNote = note || `Transfer: ${fromAcc[0].name} to ${toAcc[0].name}`
        
        // 1. Insert transaction record (linked to 'from' account as a transfer out)
        const [transferOutTx] = await tx.insert(transactions).values({
          userId: userId,
          accountId: fromAccountId,
          type: 'transfer',
          amount: amount.toString(),
          date,
          note: transferNote,
          transferToAccountId: toAccountId
        }).returning({ id: transactions.id })
        
        // Let's explicitly log the transfer into the destination account too 
        // For accounting, some people record an 'income/transfer-in' on the target account,
        // but Drizzle/our schema uses 'transferToAccountId' which indicates the 'from' transaction 
        // reduces balance of fromAccount and increases balance of toAccount.
        // Wait, does the schema imply 2 transaction rows or 1?
        // Schema definition for transferToAccountId suggests 1 transaction row that links both.
        
        // 2. Adjust from account balance (decrement)
        await tx.update(accounts)
          .set({ balance: sql`${accounts.balance} - ${amount}` })
          .where(eq(accounts.id, fromAccountId))

        // 3. Adjust to account balance (increment)
        await tx.update(accounts)
          .set({ balance: sql`${accounts.balance} + ${amount}` })
          .where(eq(accounts.id, toAccountId))
      })

      await logger.info('Funds transferred', { action: 'transferFunds', from: fromAccountId, to: toAccountId, amount, userId: session.user.id })
      revalidatePath('/accounts')
      revalidatePath(`/accounts/${fromAccountId}`)
      revalidatePath(`/accounts/${toAccountId}`)
      
      return { success: true }
    },
    { action: 'transferFunds' }
  )
}
