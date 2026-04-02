import { db } from '@/lib/db'
import { accounts, transactions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function getAccountsWithBalance(userId: string) {
  return db
    .select()
    .from(accounts)
    .where(and(
      eq(accounts.userId, userId),
      eq(accounts.isActive, true)
    ))
    .orderBy(accounts.name)
}

export async function getAccountById(id: string, userId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(
      eq(accounts.id, id),
      eq(accounts.userId, userId),
      eq(accounts.isActive, true)
    ))
    .limit(1)
  
  return account || null
}

export async function getAccountTransactions(accountId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(50) // Adjust limit as needed or add pagination later
}
