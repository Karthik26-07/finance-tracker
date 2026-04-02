import React from 'react'
import { AccountForm } from '@/components/forms/AccountForm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewAccountPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display tracking-tight">Create Account</h1>
        <p className="text-text-secondary mt-1">Add a new bank account, wallet, or credit card.</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-ambient">
        <AccountForm />
      </div>
    </div>
  )
}
