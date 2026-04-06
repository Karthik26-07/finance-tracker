import { BaseRepository } from '../shared/base.repository'
import { accounts, transactions, type Account, type NewAccount } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { and, eq, desc } from 'drizzle-orm'

export class AccountRepository extends BaseRepository<typeof accounts, Account, NewAccount, any> {
  constructor(database: any = db) {
    super(database, accounts)
  }

  withTransaction(tx: any): this {
    return new AccountRepository(tx) as this
  }

  async getAccountWithUserId(id: string, userId: string) {
    return this.findFirst(and(eq(accounts.id, id), eq(accounts.userId, userId), eq(accounts.isActive, true)))
  }

  async getAccountsByUserId(userId: string) {
    return this.db
      .select()
      .from(accounts)
      .where(and(
        eq(accounts.userId, userId),
        eq(accounts.isActive, true)
      ))
      .orderBy(accounts.name)
  }

  async getAccountTransactions(accountId: string) {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(50)
  }
}
