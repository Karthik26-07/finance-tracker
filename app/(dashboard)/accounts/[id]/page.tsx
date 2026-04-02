import React from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getAccountById, getAccountTransactions } from '@/lib/db/queries/accounts'

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const accountId = (await params).id;
  const account = await getAccountById(accountId, session.user.id)
  
  if (!account) {
    notFound()
  }

  const transactions = await getAccountTransactions(accountId)
  const balance = parseFloat(account.balance || '0')
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(balance)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div 
             className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${account.color ? '' : 'bg-elevated'}`}
             style={account.color ? { backgroundColor: account.color, color: '#fff' } : undefined}
          >
            {account.icon || '🏦'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-display tracking-tight">{account.name}</h1>
            <p className="text-text-secondary mt-1 uppercase tracking-wider text-xs font-semibold">{account.type}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/accounts/${account.id}/edit`}
            className="px-4 py-2 bg-surface border border-border-subtle rounded-xl text-text-primary font-medium hover:bg-elevated transition-colors"
          >
            Edit Account
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-3xl border border-border-subtle bg-linear-to-br from-surface to-elevated p-8 shadow-ambient">
            <p className="text-sm uppercase tracking-widest text-text-secondary font-semibold mb-2">Current Balance</p>
            <h2 className="text-4xl font-bold text-text-primary tabular-nums tracking-tight">{formattedBalance}</h2>
          </div>
        </div>

        <div className="md:col-span-2">
           <div className="rounded-3xl border border-border-subtle bg-surface shadow-sm h-full overflow-hidden">
             <div className="p-6 border-b border-border-subtle flex justify-between items-center">
               <h3 className="font-semibold text-lg">Recent Transactions</h3>
             </div>
             
             {transactions.length === 0 ? (
               <div className="p-8 text-center text-text-secondary">
                 No transactions found for this account.
               </div>
             ) : (
               <div className="divide-y divide-border-subtle">
                 {transactions.map(tx => {
                   const amount = parseFloat(tx.amount || '0')
                   const isPositive = tx.type === 'income' || (tx.type === 'transfer' && tx.transferToAccountId === account.id)
                   const formattedAmount = new Intl.NumberFormat('en-IN', {
                     style: 'currency',
                     currency: 'INR',
                   }).format(amount)

                   // Simple determination of whether it effectively added or subtracted
                   const actualAmountStr = (tx.type === 'expense' || (tx.type === 'transfer' && tx.accountId === account.id)) ? `-${formattedAmount}` : `+${formattedAmount}`
                   const amountClass = actualAmountStr.startsWith('-') ? 'text-text-primary' : 'text-accent-success'

                   return (
                     <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-elevated/50 transition-colors">
                       <div>
                         <p className="font-medium text-text-primary">{tx.note || tx.type}</p>
                         <p className="text-sm text-text-secondary">{new Date(tx.date).toLocaleDateString()}</p>
                       </div>
                       <div className={`font-semibold tabular-nums ${amountClass}`}>
                         {actualAmountStr}
                       </div>
                     </div>
                   )
                 })}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
