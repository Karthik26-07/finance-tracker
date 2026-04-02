'use client'

import React from 'react'
import Link from 'next/link'
import { Account } from '@/types'

// Setup mapping for account type colors
// bank: #4F8EF7 (blue)
// cash: #34D399 (green)
// credit: #F87171 (red)
// wallet: #FBBF24 (yellow)
// investment: #A78BFA (purple)
const typeColors = {
  bank: 'bg-chart-1 text-white',
  cash: 'bg-chart-2 text-white',
  credit: 'bg-chart-4 text-white',
  wallet: 'bg-chart-3 text-white',
  investment: 'bg-chart-5 text-white',
}

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const balance = parseFloat(account.balance || '0')
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(balance)

  // fallback to generic symbol if no icon provided
  const IconSpan = account.icon ? account.icon : (account.type === 'bank' ? '🏦' : account.type === 'cash' ? '💵' : account.type === 'credit' ? '💳' : '💼')
  
  const typeStyle = typeColors[account.type as keyof typeof typeColors] || 'bg-elevated text-text-primary'

  return (
    <Link href={`/accounts/${account.id}`} className="block group">
      <div className="rounded-3xl bg-surface p-5 shadow-sm transition-all hover:shadow-ambient hover:bg-elevated/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${account.color ? '' : typeStyle}`}
              style={account.color ? { backgroundColor: account.color, color: '#fff' } : undefined}
            >
              {IconSpan}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary font-display truncate max-w-37.5">{account.name}</h3>
              <p className="text-xs text-text-secondary uppercase tracking-wider">{account.type}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-xl font-black text-text-primary tabular-nums tracking-tighter">
            {formattedBalance}
          </p>
        </div>
      </div>
    </Link>
  )
}
