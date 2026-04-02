'use client'

import React from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface SummaryStatsProps {
  data: {
    netWorth: number
    monthlyIncome: number
    monthlyExpense: number
    netSavings: number
  }
}

export function SummaryStats({ data }: SummaryStatsProps) {
  const stats = [
    {
      label: 'Net Worth',
      value: data.netWorth,
      Icon: Wallet,
      iconColor: 'text-primary',
      bg: 'bg-primary/10',
      description: 'Combined balance',
    },
    {
      label: 'Monthly Income',
      value: data.monthlyIncome,
      Icon: TrendingUp,
      iconColor: 'text-secondary',
      bg: 'bg-secondary/10',
      description: 'Total inflow this month',
    },
    {
      label: 'Monthly Expense',
      value: data.monthlyExpense,
      Icon: TrendingDown,
      iconColor: 'text-tertiary',
      bg: 'bg-tertiary/10',
      description: 'Total outflow this month',
    },
    {
      label: 'Net Savings',
      value: data.netSavings,
      Icon: PiggyBank,
      iconColor: 'text-accent-success',
      bg: 'bg-accent-success/10',
      description: 'Income minus expenses',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="group p-6 bg-surface border border-border/50 rounded-3xl shadow-ambient hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
        >
          {/* Background Decorative Icon */}
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
             <stat.Icon size={80} className={stat.iconColor} />
          </div>
          
          {/* Foreground Icon */}
          <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.iconColor} flex items-center justify-center mb-6`}>
            <stat.Icon size={20} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">{stat.label}</h3>
            <p className="text-2xl font-black text-text-primary tracking-tighter tabular-nums font-mono">
              ₹{Math.abs(stat.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            {stat.value >= 0 ? (
              <div className="flex items-center gap-1 text-accent-success">
                <ArrowUpRight size={14} strokeWidth={3} />
                <span className="text-[10px] font-black font-mono">FLOW:POS</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-accent-danger">
                <ArrowDownRight size={14} strokeWidth={3} />
                <span className="text-[10px] font-black font-mono">FLOW:NEG</span>
              </div>
            )}
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60 ml-auto">{stat.description}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
