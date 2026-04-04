'use client'

import React, { useState, useEffect } from 'react'
import { AccountCard } from './AccountCard'
import { Account } from '@/types'
import { Wallet } from 'lucide-react'

interface AccountListProps {
  accounts: Account[]
}

export function AccountList({ accounts }: AccountListProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (accounts.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-border-subtle rounded-3xl bg-surface/50">
        <p className="text-text-secondary mb-4">No accounts found.</p>
        <p className="text-sm">Create an account to start tracking your finances.</p>
      </div>
    )
  }

  // Calculate Net Worth
  const totalBalance = accounts.reduce((acc, account) => acc + parseFloat(account.balance || '0'), 0)
  
  const formatNetWorth = (val: number) => {
    if (!isMounted) return `₹${val.toFixed(2)}`
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val)
  }

  return (
    <div className="space-y-8">
      {/* Net Worth Summary */}
      <div className="rounded-3xl border border-border-subtle bg-linear-to-br from-surface to-elevated p-8 shadow-ambient relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
           <Wallet size={120} className="text-primary" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-text-secondary font-black font-mono mb-2">Aggregate Net Worth</p>
        <h2 className="text-4xl font-black text-text-primary tabular-nums tracking-tighter relative z-10">{formatNetWorth(totalBalance)}</h2>
        <p className="text-xs text-text-muted mt-2 font-medium opacity-70">Calculated across {accounts.length} active nodes</p>
      </div>

      {/* Account Grid */}
      <div>
        <h3 className="text-lg font-black tracking-tight text-text-primary mb-6">
          Your Account Nodes
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {accounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  )
}
