import React, { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTransactions, getTransactionStats } from '@/lib/db/queries/transactions'
import { getAccountsWithBalance } from '@/lib/db/queries/accounts'
import { getCategories } from '@/lib/db/queries/categories'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionActions } from '@/components/transactions/TransactionActions'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface TransactionsPageProps {
  searchParams: Promise<{
    type?: string
    accountId?: string
    categoryId?: string
    search?: string
    sort?: string
    from?: string
    to?: string
  }>
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const params = await searchParams

  const filters = {
    type: params.type as 'income' | 'expense' | 'transfer' | undefined,
    accountId: params.accountId,
    categoryId: params.categoryId,
    search: params.search,
    sort: (params.sort || 'date_desc') as 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc',
    from: params.from,
    to: params.to,
  }

  const [transactions, stats, accounts, categories] = await Promise.all([
    getTransactions(userId, filters),
    getTransactionStats(userId, filters.from, filters.to),
    getAccountsWithBalance(userId),
    getCategories(userId),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-text-primary font-display mb-1">Transactions</h1>
          <p className="text-text-secondary text-sm font-medium opacity-80 uppercase tracking-widest font-mono">Master your financial pulse</p>
        </div>
        
        <TransactionActions accounts={accounts} />
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-surface border border-border/60 rounded-[2.5rem] shadow-sm space-y-4 hover:border-secondary/40 transition-all hover:shadow-ambient overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-2 h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold text-[10px] uppercase tracking-widest font-mono">Inflow</span>
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-secondary tabular-nums tracking-tighter">
              +₹{stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-text-muted mt-1 font-medium">Total earned across filters</p>
          </div>
        </div>

        <div className="p-8 bg-surface border border-border/60 rounded-[2.5rem] shadow-sm space-y-4 hover:border-tertiary/40 transition-all hover:shadow-ambient overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-2 h-full bg-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between">
            <span className="text-text-muted font-bold text-[10px] uppercase tracking-widest font-mono">Outflow</span>
            <div className="p-3 bg-tertiary/10 rounded-2xl">
              <TrendingDown className="w-5 h-5 text-tertiary" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-tertiary tabular-nums tracking-tighter">
              -₹{stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-text-muted mt-1 font-medium">Total spent across filters</p>
          </div>
        </div>

        <div className="p-8 bg-linear-to-br from-primary to-primary-container border border-primary/20 rounded-[2.5rem] shadow-2xl shadow-primary/20 space-y-4 transform hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-white/60 font-bold text-[10px] uppercase tracking-widest font-mono">Net Flow</span>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-white tabular-nums tracking-tighter">
              ₹{stats.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/50 mt-1 font-medium">Your current net savings</p>
          </div>
        </div>
      </div>

      {/* Filters (Self-managed SearchParams client component) */}
      <div className="bg-highlight/30 rounded-[3rem] border border-border/50 p-3 shadow-inner">
        <div className="p-8 bg-surface rounded-[2.5rem] border border-border-subtle shadow-sm">
          <TransactionFilters accounts={accounts} categories={categories} />
        </div>
      </div>

      {/* Transaction List with History Wrapper (Bulk Actions support) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
           <h2 className="text-lg font-black tracking-tight text-text-primary">Ledger History</h2>
           <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest font-mono">Results: {transactions.length}</span>
           </div>
        </div>
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  )
}
