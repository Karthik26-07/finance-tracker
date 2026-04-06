import React from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AccountRepository } from '@/modules/accounts/accounts.repository'
import { AccountList } from '@/components/accounts/AccountList'
import { PageHeader } from '@/components/ui/PageHeader'

const accountRepository = new AccountRepository()

export default async function AccountsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const accounts = await accountRepository.getAccountsByUserId(session.user.id)

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Accounts & Wallets"
        subtitle="Manage your liquidity across all nodes"
      >
        <Link 
          href="/accounts/transfer"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-border/60 rounded-2xl text-xs font-bold text-text-primary hover:bg-highlight transition-all active:scale-95 shadow-sm"
        >
          Transfer Funds
        </Link>
        <Link 
          href="/accounts/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
        >
          + Add Account
        </Link>
      </PageHeader>

      <AccountList accounts={accounts} />
    </div>
  )
}
