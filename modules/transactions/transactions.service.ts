import { BaseService } from '../shared/base.service'
import { TransactionRepository } from './transactions.repository'
import { AccountRepository } from '../accounts/accounts.repository'
import { CategoryRepository } from '../categories/categories.repository'
import { AuthError } from '@/lib/errors'
import { sql } from 'drizzle-orm'

export class TransactionService extends BaseService {
  private transactionRepository: TransactionRepository
  private accountRepository: AccountRepository
  private categoryRepository: CategoryRepository

  constructor() {
    super()
    this.transactionRepository = new TransactionRepository()
    this.accountRepository = new AccountRepository()
    this.categoryRepository = new CategoryRepository()
  }

  async createTransaction(userId: string, data: any) {
    const account = await this.accountRepository.getAccountWithUserId(data.accountId, userId)
    if (!account) {
      throw new AuthError('NOT_FOUND', 'Account not found')
    }

    const impact = data.type === 'income' ? Number(data.amount) : -Number(data.amount)

    await this.transactionRepository.transaction(async (tx) => {
      await this.transactionRepository.withTransaction(tx).create({
        userId,
        ...data,
      })

      await this.accountRepository.withTransaction(tx).update(data.accountId, {
        balance: sql`${this.accountRepository.getTable().balance} + ${impact}` as any
      })
    })

    return { success: true }
  }

  async updateTransaction(id: string, userId: string, data: any) {
    const existing = await this.transactionRepository.getByIdWithUserId(id, userId)
    if (!existing) {
      throw new AuthError('NOT_FOUND', 'Transaction not found')
    }

    await this.transactionRepository.transaction(async (tx) => {
      const txRepo = this.transactionRepository.withTransaction(tx)
      const accRepo = this.accountRepository.withTransaction(tx)

      // 1. Revert Old Impact
      const oldImpact = existing.type === 'income' ? -Number(existing.amount) : Number(existing.amount)
      await accRepo.update(existing.accountId, {
        balance: sql`${this.accountRepository.getTable().balance} + ${oldImpact}` as any
      })

      // 2. Apply New Impact
      const newAccountId = data.accountId || existing.accountId
      const newType = data.type || existing.type
      const newAmount = data.amount || existing.amount
      const newImpact = newType === 'income' ? Number(newAmount) : -Number(newAmount)

      await accRepo.update(newAccountId, {
        balance: sql`${this.accountRepository.getTable().balance} + ${newImpact}` as any
      })

      // 3. Update Transaction
      await txRepo.update(id, {
        ...data,
        updatedAt: new Date()
      })
    })

    return { success: true }
  }

  async deleteTransaction(id: string, userId: string) {
    const existing = await this.transactionRepository.getByIdWithUserId(id, userId)
    if (!existing) {
      throw new AuthError('NOT_FOUND', 'Transaction not found')
    }

    await this.transactionRepository.transaction(async (tx) => {
      const impact = existing.type === 'income' ? -Number(existing.amount) : Number(existing.amount)
      
      await this.accountRepository.withTransaction(tx).update(existing.accountId, {
        balance: sql`${this.accountRepository.getTable().balance} + ${impact}` as any
      })

      await this.transactionRepository.withTransaction(tx).delete(id)
    })

    return { success: true }
  }

  async bulkDeleteTransactions(ids: string[], userId: string) {
    const existing = await this.transactionRepository.getByIdsWithUserId(ids, userId)
    if (existing.length !== ids.length) {
      throw new AuthError('NOT_FOUND', 'One or more transactions not found')
    }

    await this.transactionRepository.transaction(async (tx) => {
      for (const t of existing) {
        const impact = t.type === 'income' ? -Number(t.amount) : Number(t.amount)
        await this.accountRepository.withTransaction(tx).update(t.accountId, {
          balance: sql`${this.accountRepository.getTable().balance} + ${impact}` as any
        })
      }
      await this.transactionRepository.withTransaction(tx).bulkDeleteWithUserId(ids, userId)
    })

    return { success: true }
  }

  async importTransactions(userId: string, accountId: string, transactionsToImport: any[]) {
      const account = await this.accountRepository.getAccountWithUserId(accountId, userId)
      if (!account) {
        throw new AuthError('NOT_FOUND', 'Account not found')
      }

      const allCategories = await this.categoryRepository.getUserAndSystemCategories(userId)
      const categoryMap = new Map<string, string>()
      allCategories.forEach((c: any) => categoryMap.set(c.name.toLowerCase(), c.id))

      let totalImpact = 0

      await this.transactionRepository.transaction(async (tx) => {
        const txRepo = this.transactionRepository.withTransaction(tx)
        
        const mappedTransactions = transactionsToImport.map((t: any) => {
          const categoryId = categoryMap.get(t.category?.toLowerCase()) || null
          const amount = Math.abs(Number(t.amount))
          const type = (Number(t.amount) >= 0 ? 'income' : 'expense') as 'income' | 'expense' | 'transfer'
          
          totalImpact += Number(t.amount)

          return {
            userId,
            accountId,
            categoryId,
            amount: amount.toString(),
            type,
            date: t.date,
            note: t.description || t.note || null,
          }
        })

        await txRepo.createMany(mappedTransactions)

        await this.accountRepository.withTransaction(tx).update(accountId, {
          balance: sql`${this.accountRepository.getTable().balance} + ${totalImpact}` as any
        })
      })

      return { success: true, count: transactionsToImport.length }
  }

  async getTransactionStats(userId: string, from?: string, to?: string) {
    return this.transactionRepository.getStats(userId, from, to)
  }
}
