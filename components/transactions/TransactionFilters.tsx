'use client'

import React, { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Account, Category } from '@/lib/db/schema'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface TransactionFiltersProps {
  accounts: Account[]
  categories: Category[]
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Helper to update a search param
  const updateQueryParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  // Get current values from search params
  const type = searchParams.get('type') || ''
  const accountId = searchParams.get('accountId') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'date_desc'

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  const hasActiveFilters = type || accountId || categoryId || search || sort !== 'date_desc'

  return (
    <div className={`space-y-4 transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
        <input 
          type="text"
          placeholder="Search by note, location or tags..."
          value={search}
          onChange={(e) => updateQueryParam('search', e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-sm"
        />
      </div>

      {/* Filter Chips/Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 p-1.5 bg-highlight rounded-xl mr-2">
          <SlidersHorizontal className="w-4 h-4 text-text-secondary ml-1" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary mr-2 font-mono">Filters</span>
        </div>

        {/* Type Select */}
        <select 
          value={type} 
          onChange={(e) => updateQueryParam('type', e.target.value || undefined)}
          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>

        {/* Account Select */}
        <select 
          value={accountId} 
          onChange={(e) => updateQueryParam('accountId', e.target.value || undefined)}
          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Accounts</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>

        {/* Category Select */}
        <select 
          value={categoryId} 
          onChange={(e) => updateQueryParam('categoryId', e.target.value || undefined)}
          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        {/* Sort Select */}
        <select 
          value={sort} 
          onChange={(e) => updateQueryParam('sort', e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="amount_desc">Highest Amount</option>
          <option value="amount_asc">Lowest Amount</option>
        </select>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tertiary/10 text-tertiary text-sm font-medium hover:bg-tertiary/20 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
