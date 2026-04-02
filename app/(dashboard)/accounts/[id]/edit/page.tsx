import React from 'react'
import { AccountForm } from '@/components/forms/AccountForm'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getAccountById } from '@/lib/db/queries/accounts'

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const accountId = (await params).id;
  const account = await getAccountById(accountId, session.user.id)

  if (!account) {
    notFound()
  }

  const initialData = {
    name: account.name,
    type: account.type,
    color: account.color || '',
    icon: account.icon || '',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display tracking-tight">Edit Account</h1>
        <p className="text-text-secondary mt-1">Update details for {account.name}.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-ambient">
        <AccountForm accountId={account.id} initialData={initialData} />
      </div>
    </div>
  )
}
