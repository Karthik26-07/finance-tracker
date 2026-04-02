'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description?: string | null
    icon?: string | null
    color?: string | null
    isActive?: boolean | null
    memberCount: number
    balance?: number // Individual balance for current user in this group
  }
}

export function GroupCard({ group }: GroupCardProps) {
  const searchParams = useSearchParams()
  const activeGroupId = searchParams.get('groupId')
  const isActive = activeGroupId === group.id

  const balance = group.balance || 0
  const isOwed = balance > 0
  const isOwing = balance < 0

  return (
    <Link href={`/groups?groupId=${group.id}`} scroll={false}>
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`p-5 rounded-3xl transition-all cursor-pointer border-l-4 ${
          isActive 
            ? 'bg-surface border-primary shadow-ambient' 
            : 'bg-surface-container-low hover:bg-surface border-transparent hover:border-border/50'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                isActive ? 'bg-primary text-white' : 'bg-highlight text-text-secondary'
              }`}
              style={!isActive && group.color ? { backgroundColor: `${group.color}20`, color: group.color } : undefined}
            >
              {group.icon || (group.name.toLowerCase().includes('trip') ? '🏖️' : group.name.toLowerCase().includes('home') ? '🏠' : '👥')}
            </div>
            <div>
              <h4 className={`font-black tracking-tight ${isActive ? 'text-primary' : 'text-text-primary'}`}>{group.name}</h4>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                {group.memberCount} members • Active
              </p>
            </div>
          </div>
          <ChevronRight size={18} className={`${isActive ? 'text-primary' : 'text-text-muted'} transition-transform group-hover:translate-x-1`} />
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] text-text-muted uppercase font-black tracking-[0.15em] mb-0.5">Individual Balance</p>
            <p className={`text-xl font-black font-mono tabular-nums leading-none tracking-tighter ${
              isOwed ? 'text-secondary' : isOwing ? 'text-tertiary' : 'text-text-muted'
            }`}>
              {isOwed ? '+' : ''}₹{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="flex -space-x-2">
            {[1, 2, 3].slice(0, Math.min(group.memberCount, 3)).map((_, i) => (
              <div 
                key={i} 
                className="w-7 h-7 rounded-full border-2 border-surface bg-highlight flex items-center justify-center text-[10px] font-bold text-text-muted shadow-sm"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {group.memberCount > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-surface bg-elevated flex items-center justify-center text-[9px] font-black text-text-muted shadow-sm uppercase tracking-tighter">
                +{group.memberCount - 3}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
