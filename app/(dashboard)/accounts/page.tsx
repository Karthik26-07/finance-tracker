import React from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAccountsWithBalance } from '@/lib/db/queries/accounts'
import { AccountList } from '@/components/accounts/AccountList'

export default async function AccountsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const accounts = await getAccountsWithBalance(session.user.id)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary font-display tracking-tighter">Accounts & Wallets</h1>
          <p className="text-text-secondary text-sm font-medium opacity-80 uppercase tracking-widest font-mono mt-1 whitespace-nowrap overflow-hidden">Manage your liquidity across all nodes</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/accounts/transfer"
            className="px-4 py-2 bg-surface border border-border-subtle rounded-xl text-text-primary font-medium hover:bg-elevated transition-colors"
          >
            Transfer Funds
          </Link>
          <Link 
            href="/accounts/new"
            className="px-4 py-2 bg-linear-to-r from-primary to-primary-container text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            + Add Account
          </Link>
        </div>
      </div>

      <AccountList accounts={accounts} />
    </div>
  )
}
