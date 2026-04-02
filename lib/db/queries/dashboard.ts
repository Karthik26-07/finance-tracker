import { db } from '@/lib/db'
import { transactions, accounts, categories } from '@/lib/db/schema'
import { eq, and, desc, asc, lte, gte, sql, sum, count } from 'drizzle-orm'
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from 'date-fns'

export async function getDashboardData(userId: string) {
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)
  
  const fromDate = format(currentMonthStart, 'yyyy-MM-dd')
  const toDate = format(currentMonthEnd, 'yyyy-MM-dd')

  // 1. Get current month stats
  const [currentMonthStats] = await db
    .select({
      income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, fromDate),
      lte(transactions.date, toDate)
    ))

  // 2. Get net worth (sum of all account balances)
  const [netWorthData] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${accounts.balance}), 0)`
    })
    .from(accounts)
    .where(eq(accounts.userId, userId))

  // 3. Get spending by category (this month) - Fixing the order by alias issue
  const categorySpending = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      total: sql<number>`CAST(SUM(${transactions.amount}) AS numeric)`
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense'),
      gte(transactions.date, fromDate),
      lte(transactions.date, toDate)
    ))
    .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color)
    .orderBy(desc(sql`SUM(${transactions.amount})`))

  // 4. Get daily spending for chart (last 30 days)
  const thirtyDaysAgoDate = new Date()
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30)
  const thirtyDaysAgo = format(thirtyDaysAgoDate, 'yyyy-MM-dd')
  
  const dailySpending = await db
    .select({
      date: transactions.date,
      total: sql<number>`CAST(SUM(${transactions.amount}) AS numeric)`
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense'),
      gte(transactions.date, thirtyDaysAgo)
    ))
    .groupBy(transactions.date)
    .orderBy(asc(transactions.date))

  // 5. Recent transactions
  const recentTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit: 5,
    with: {
      account: true,
      category: true
    }
  })

  return {
    summary: {
      netWorth: Number(netWorthData?.total || 0),
      monthlyIncome: Number(currentMonthStats?.income || 0),
      monthlyExpense: Number(currentMonthStats?.expense || 0),
      netSavings: Number((currentMonthStats?.income || 0) - (currentMonthStats?.expense || 0))
    },
    categorySpending,
    dailySpending,
    recentTransactions
  }
}
