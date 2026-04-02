import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAccountsWithBalance } from '@/lib/db/queries/accounts'
import { getCategories } from '@/lib/db/queries/categories'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTransactionPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const [accounts, categories] = await Promise.all([
    getAccountsWithBalance(userId),
    getCategories(userId),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/transactions" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Transactions</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary font-display">Record Transaction</h1>
          <p className="text-text-secondary mt-2">Log your daily spending or income stream</p>
        </div>
      </div>

      <div className="p-8 bg-surface rounded-[40px] border border-border-subtle shadow-xl shadow-primary/5">
        <TransactionForm accounts={accounts} categories={categories} />
      </div>

      {/* Quick Tips Card */}
      <div className="p-6 bg-highlight/30 rounded-3xl border border-border-subtle border-dashed">
        <h4 className="font-bold text-text-primary mb-2">💡 Quick Pro Tip</h4>
        <p className="text-sm text-text-secondary leading-relaxed">
          Record your expenses as they happen to maintain the highest accuracy. You can always attach receipts later to keep your records audit-ready.
        </p>
      </div>
    </div>
  )
}
