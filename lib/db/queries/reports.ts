import { db } from '@/lib/db'
import { transactions, accounts, categories } from '@/lib/db/schema'
import { eq, and, desc, asc, lte, gte, sql, sum } from 'drizzle-orm'
import { startOfMonth, subMonths, format, endOfMonth } from 'date-fns'

export async function getReportsData(userId: string, from?: string, to?: string) {
  const fromDate = from || format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const toDate = to || format(endOfMonth(new Date()), 'yyyy-MM-dd')

  // 1. Get Monthly Comparison (Last 6 Months)
  const sixMonthsAgo = format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd')
  const monthlyFlow = await db
    .select({
      month: sql<string>`DATE_TRUNC('month', ${transactions.date}::date)`,
      income: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
      expense: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, sixMonthsAgo)
    ))
    .groupBy(sql`DATE_TRUNC('month', ${transactions.date}::date)`)
    .orderBy(asc(sql`DATE_TRUNC('month', ${transactions.date}::date)`))

  // 2. Category Breakdown
  const categoryBreakdown = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
      value: sql<number>`SUM(${transactions.amount})`
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense'),
      gte(transactions.date, fromDate),
      lte(transactions.date, toDate)
    ))
    .groupBy(categories.id, categories.name, categories.color, categories.icon)
    .orderBy(desc(sql`SUM(${transactions.amount})`))

  // 3. Top Spending (Top 20 Transactions)
  const topSpending = await db
    .select({
      id: transactions.id,
      description: transactions.note,
      amount: transactions.amount,
      date: transactions.date,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense'),
      gte(transactions.date, fromDate),
      lte(transactions.date, toDate)
    ))
    .orderBy(desc(transactions.amount))
    .limit(20)

  // 4. Tax Highlights (Categories with potential tax relevance - simulated by total spend)
  // In a real app, this might filter by isTaxDeductible flag.
  const taxSummaries = await db
    .select({
      categoryName: categories.name,
      total: sql<number>`SUM(${transactions.amount})`,
      count: sql<number>`COUNT(*)`
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, fromDate),
      lte(transactions.date, toDate)
    ))
    .groupBy(categories.name)
    .orderBy(desc(sql`SUM(${transactions.amount})`))

  // 5. Overall Stats
  const [overallStats] = await db
    .select({
      totalIncome: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
      totalExpense: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
      transactionCount: sql<number>`COUNT(*)`
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, fromDate),
      lte(transactions.date, toDate)
    ))

  return {
    monthlyFlow: monthlyFlow.map(m => ({
      ...m,
      month: format(new Date(m.month), 'MMM yyyy'),
      net: (m.income || 0) - (m.expense || 0)
    })),
    categoryBreakdown,
    topSpending,
    taxSummaries,
    stats: {
      totalIncome: overallStats?.totalIncome || 0,
      totalExpense: overallStats?.totalExpense || 0,
      count: overallStats?.transactionCount || 0,
      net: (overallStats?.totalIncome || 0) - (overallStats?.totalExpense || 0)
    }
  }
}
