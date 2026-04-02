import React from 'react'
import { TransferForm } from '@/components/forms/TransferForm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAccountsWithBalance } from '@/lib/db/queries/accounts'

export default async function TransferPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const accounts = await getAccountsWithBalance(session.user.id)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display tracking-tight">Transfer Funds</h1>
        <p className="text-text-secondary mt-1">Move money between your accounts.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-ambient">
        {accounts.length < 2 ? (
          <div className="text-center p-8">
            <p className="text-text-secondary">You need at least 2 accounts to make a transfer.</p>
          </div>
        ) : (
          <TransferForm accounts={accounts} />
        )}
      </div>
    </div>
  )
}
