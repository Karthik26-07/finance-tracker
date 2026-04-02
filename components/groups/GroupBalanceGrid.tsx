'use client'

import React from 'react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'

interface GroupBalanceGridProps {
  group: any
}

export function GroupBalanceGrid({ group }: GroupBalanceGridProps) {
  // Assuming these fields are calculated in the query or passed from group object
  const totalSpend = 4820.00 // group.totalSpend
  const youOwe = group.owed || 0
  const youAreOwed = Math.max(0, (group.paid || 0) - youOwe) 

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Total Spend */}
      <div className="p-6 bg-highlight/30 rounded-3xl border border-border/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
           <TrendingUp size={80} className="text-primary" />
        </div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 font-mono opacity-60">Collective Spend</p>
        <h4 className="text-3xl font-black text-text-primary tabular-nums tracking-tighter relative z-10 leading-none">₹{totalSpend.toLocaleString()}</h4>
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1.5 w-full bg-highlight/50 rounded-full overflow-hidden border border-border/10">
            <div className="h-full bg-primary w-2/3 shadow-sm shadow-primary/20 transition-all duration-1000"></div>
          </div>
          <span className="text-[10px] font-black text-text-muted opacity-80 uppercase tracking-widest font-mono">67%</span>
        </div>
      </div>

      {/* You Owe */}
      <div className="p-6 bg-tertiary/5 rounded-3xl border border-tertiary/20 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
           <TrendingDown size={80} className="text-tertiary" />
        </div>
        <p className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] mb-3 font-mono opacity-60">You Owe Others</p>
        <h4 className="text-3xl font-black text-tertiary tabular-nums tracking-tighter relative z-10 leading-none">₹{youOwe.toLocaleString()}</h4>
        <p className="text-[10px] text-tertiary/60 mt-4 italic font-bold uppercase tracking-widest font-mono">Pay requested via 2 nodes</p>
      </div>

      {/* You Are Owed */}
      <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/20 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-500 pointer-events-none">
           <Wallet size={80} className="text-secondary" />
        </div>
        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 font-mono opacity-60">You Are Owed</p>
        <h4 className="text-3xl font-black text-secondary tabular-nums tracking-tighter relative z-10 leading-none">₹{youAreOwed.toLocaleString()}</h4>
        <button className="mt-4 text-[10px] text-secondary font-black uppercase tracking-widest hover:underline flex items-center gap-1.5 font-mono">
          Settlement Tracking <span className="text-[14px]">→</span>
        </button>
      </div>
    </div>
  )
}
