import React from 'react'
import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { getTransactionById } from '@/lib/db/queries/transactions'
import { getAccountsWithBalance } from '@/lib/db/queries/accounts'
import { getCategories } from '@/lib/db/queries/categories'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditTransactionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params
  const userId = session.user.id

  const [transaction, accounts, categories] = await Promise.all([
    getTransactionById(id, userId),
    getAccountsWithBalance(userId),
    getCategories(userId),
  ])

  if (!transaction) {
    notFound()
  }

  const initialData = {
    type: transaction.type,
    amount: parseFloat(transaction.amount),
    accountId: transaction.accountId,
    categoryId: transaction.categoryId || undefined,
    date: transaction.date,
    time: transaction.time || undefined,
    note: transaction.note || undefined,
    tags: transaction.tags || undefined,
    transferToAccountId: transaction.transferToAccountId || undefined,
    receiptUrl: transaction.receiptUrl || undefined,
    location: transaction.location || undefined,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/transactions" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Transactions</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary font-display">Edit Transaction</h1>
          <p className="text-text-secondary mt-2">Adjust details for this entry</p>
        </div>
      </div>

      <div className="p-8 bg-surface rounded-[40px] border border-border-subtle shadow-xl shadow-primary/5">
        <TransactionForm 
          transactionId={id}
          initialData={initialData} 
          accounts={accounts} 
          categories={categories} 
        />
      </div>

      {/* Info Card */}
      <div className="p-6 bg-highlight/30 rounded-3xl border border-border-subtle border-dashed">
        <h4 className="font-bold text-text-primary mb-2">Notice</h4>
        <p className="text-sm text-text-secondary leading-relaxed">
          Updating this transaction will automatically recalculate the associated account balances. If this is a transfer, both accounts will be updated accordingly.
        </p>
      </div>
    </div>
  )
}
