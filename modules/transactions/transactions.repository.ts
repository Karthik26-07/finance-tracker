import { BaseRepository } from '../shared/base.repository'
import { transactions, type Transaction, type NewTransaction } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { and, eq, inArray, gte, lte, or, ilike, arrayContains, desc, asc, type SQL } from 'drizzle-orm'
import { TransactionFilters } from '@/lib/validations/transactions'

export class TransactionRepository extends BaseRepository<typeof transactions, Transaction, NewTransaction, any> {
  constructor(database: any = db) {
    super(database, transactions)
  }

  withTransaction(tx: any): this {
    return new TransactionRepository(tx) as this
  }

  async getByIdWithRelations(id: string, userId: string) {
    return (this.db.query as any).transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, userId)
      ),
      with: {
        account: true,
        category: true
      }
    })
  }

  async getFiltered(userId: string, filters?: TransactionFilters) {
    const where: (SQL | undefined)[] = [eq(transactions.userId, userId)]

    if (filters) {
      if (filters.from) where.push(gte(transactions.date, filters.from))
      if (filters.to) where.push(lte(transactions.date, filters.to))
      if (filters.accountId) where.push(eq(transactions.accountId, filters.accountId))
      if (filters.categoryId) where.push(eq(transactions.categoryId, filters.categoryId))
      if (filters.type) where.push(eq(transactions.type, filters.type))
      if (filters.minAmount) where.push(gte(transactions.amount, filters.minAmount.toString()))
      if (filters.maxAmount) where.push(lte(transactions.amount, filters.maxAmount.toString()))
      if (filters.search) {
        where.push(or(
          ilike(transactions.note, `%${filters.search}%`),
          ilike(transactions.location, `%${filters.search}%`)
        ))
      }
      if (filters.tags && filters.tags.length > 0) {
        where.push(arrayContains(transactions.tags, filters.tags))
      }
    }

    let orderBy: SQL = desc(transactions.date)
    if (filters?.sort) {
      switch (filters.sort) {
        case 'date_asc': orderBy = asc(transactions.date); break
        case 'date_desc': orderBy = desc(transactions.date); break
        case 'amount_asc': orderBy = asc(transactions.amount); break
        case 'amount_desc': orderBy = desc(transactions.amount); break
      }
    }

    return (this.db.query as any).transactions.findMany({
      where: and(...where),
      orderBy: [orderBy, desc(transactions.createdAt)],
      with: {
        account: true,
        category: true
      }
    })
  }

  async getStats(userId: string, from?: string, to?: string) {
    const where: (SQL | undefined)[] = [eq(transactions.userId, userId)]
    if (from) where.push(gte(transactions.date, from))
    if (to) where.push(lte(transactions.date, to))

    const results = await (this.db.query as any).transactions.findMany({
      where: and(...where),
      columns: {
        type: true,
        amount: true
      }
    })

    let income = 0
    let expense = 0

    for (const tx of results) {
      const val = parseFloat(tx.amount)
      if (tx.type === 'income') income += val
      else if (tx.type === 'expense') expense += val
    }

    return { income, expense, net: income - expense }
  }

  async getByIdWithUserId(id: string, userId: string) {
    return this.findFirst(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  }

  async getByIdsWithUserId(ids: string[], userId: string) {
    return this.findWhere(and(inArray(transactions.id, ids), eq(transactions.userId, userId)))
  }

  async bulkDeleteWithUserId(ids: string[], userId: string) {
    return this.deleteWhere(and(inArray(transactions.id, ids), eq(transactions.userId, userId)))
  }
}
