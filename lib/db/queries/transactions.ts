import { db } from '@/lib/db'
import { transactions, accounts, categories } from '@/lib/db/schema'
import { eq, and, desc, asc, lte, gte, ilike, or, arrayContains, SQL } from 'drizzle-orm'
import { TransactionFilters } from '@/lib/validations/transactions'

export async function getTransactions(userId: string, filters?: TransactionFilters) {
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

  return db.query.transactions.findMany({
    where: and(...where),
    orderBy: [orderBy, desc(transactions.createdAt)],
    with: {
      account: true,
      category: true
    }
  })
}

export async function getTransactionById(id: string, userId: string) {
  return db.query.transactions.findFirst({
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

export async function getTransactionStats(userId: string, from?: string, to?: string) {
  const where: (SQL | undefined)[] = [eq(transactions.userId, userId)]
  if (from) where.push(gte(transactions.date, from))
  if (to) where.push(lte(transactions.date, to))

  const results = await db.query.transactions.findMany({
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
