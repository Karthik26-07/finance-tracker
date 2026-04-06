import { BaseService } from '../shared/base.service'
import { AccountRepository } from './accounts.repository'
import { TransactionRepository } from '../transactions/transactions.repository'
import { AuthError } from '@/lib/errors'
import { sql } from 'drizzle-orm'

export class AccountService extends BaseService {
  private accountRepository: AccountRepository
  private transactionRepository: TransactionRepository

  constructor() {
    super()
    this.accountRepository = new AccountRepository()
    this.transactionRepository = new TransactionRepository()
  }

  async createAccount(userId: string, data: any) {
    return this.accountRepository.create({
      userId,
      name: data.name,
      type: data.type,
      openingBalance: (data.openingBalance || 0).toString(),
      balance: (data.openingBalance || 0).toString(),
      color: data.color || null,
      icon: data.icon || null,
    })
  }

  async updateAccount(id: string, userId: string, data: any) {
    const existing = await this.accountRepository.getAccountWithUserId(id, userId)
    if (!existing) {
      throw new AuthError('NOT_FOUND', 'Account not found')
    }

    return this.accountRepository.update(id, {
      ...data,
      openingBalance: data.openingBalance !== undefined ? data.openingBalance.toString() : undefined,
      updatedAt: new Date()
    })
  }

  async archiveAccount(id: string, userId: string) {
    const existing = await this.accountRepository.getAccountWithUserId(id, userId)
    if (!existing) {
      throw new AuthError('NOT_FOUND', 'Account not found')
    }

    return this.accountRepository.update(id, {
      isActive: false,
      updatedAt: new Date()
    })
  }

  async transferFunds(userId: string, data: { fromAccountId: string, toAccountId: string, amount: number, date: string, note?: string | null }) {
    const fromAcc = await this.accountRepository.getAccountWithUserId(data.fromAccountId, userId)
    const toAcc = await this.accountRepository.getAccountWithUserId(data.toAccountId, userId)

    if (!fromAcc || !toAcc) {
      throw new AuthError('NOT_FOUND', 'One or both accounts not found')
    }

    await this.accountRepository.transaction(async (tx) => {
      const transferNote = data.note || `Transfer: ${fromAcc.name} to ${toAcc.name}`
      
      await this.transactionRepository.withTransaction(tx).create({
        userId,
        accountId: data.fromAccountId,
        type: 'transfer',
        amount: data.amount.toString(),
        date: data.date,
        note: transferNote,
        transferToAccountId: data.toAccountId
      })
      
      await this.accountRepository.withTransaction(tx).update(data.fromAccountId, {
        balance: sql`${this.accountRepository.getTable().balance} - ${data.amount}` as any
      })

      await this.accountRepository.withTransaction(tx).update(data.toAccountId, {
        balance: sql`${this.accountRepository.getTable().balance} + ${data.amount}` as any
      })
    })

    return { success: true }
  }
}
