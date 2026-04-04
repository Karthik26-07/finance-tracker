'use client'

import React, { useTransition, useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Account, Category } from '@/lib/db/schema'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface TransactionFiltersProps {
  accounts: Account[]
  categories: Category[]
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current values from search params
  const type = searchParams.get('type') || ''
  const accountId = searchParams.get('accountId') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const initialSearch = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'date_desc'

  const [currentSearch, setCurrentSearch] = useState(initialSearch)

  // Sync local search state with URL if it changes externally (e.g. clear filters)
  useEffect(() => {
    setCurrentSearch(initialSearch)
  }, [initialSearch])

  // Debouncing effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSearch !== initialSearch) {
        updateQueryParam('search', currentSearch || undefined)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentSearch, initialSearch])

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

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  const hasActiveFilters = type || accountId || categoryId || initialSearch || sort !== 'date_desc'

  return (
    <div className={`space-y-6 transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Premium Search and Quick Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative group flex-1 w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Search transactions, tags, or locations..."
            value={currentSearch}
            onChange={(e) => setCurrentSearch(e.target.value)}
            className="w-full pl-11 pr-12 py-3 rounded-2xl bg-surface/50 backdrop-blur-md border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-text-primary placeholder:text-text-muted/40 shadow-sm"
          />
          {currentSearch && (
            <button 
              onClick={() => setCurrentSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary hover:bg-highlight/50 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-tertiary/10 text-tertiary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-tertiary/20 transition-all active:scale-95 whitespace-nowrap shadow-sm"
          >
            <X className="w-4 h-4" />
            Reset Audit
          </button>
        )}
      </div>

      {/* Filter Categories & Chips */}
      <div className="flex flex-col gap-6">
        {/* Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-xl border border-border/40 shadow-sm">
             <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary font-mono">Type Filter</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: '', label: 'All Operations' },
              { id: 'income', label: 'Income', color: 'bg-secondary' },
              { id: 'expense', label: 'Expense', color: 'bg-tertiary' },
              { id: 'transfer', label: 'Transfer', color: 'bg-primary' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => updateQueryParam('type', t.id || undefined)}
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border border-border/30 ${
                  type === t.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10 border-primary' 
                  : 'bg-surface/60 text-text-secondary hover:bg-surface/80 hover:text-text-primary shadow-sm'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modular Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Account Select */}
           <div className="space-y-1.5 focus-within:-translate-y-0.5 transition-transform">
             <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Balance Node</label>
             <div className="relative group">
                <select 
                  value={accountId} 
                  onChange={(e) => updateQueryParam('accountId', e.target.value || undefined)}
                  className="appearance-none w-full pl-4 pr-10 py-3 rounded-2xl bg-surface/50 backdrop-blur-sm border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm text-xs font-bold text-text-primary"
                >
                  <option value="">All Accounts</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/60 group-hover:text-primary transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
             </div>
           </div>

           {/* Category Select */}
           <div className="space-y-1.5 focus-within:-translate-y-0.5 transition-transform">
             <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Category Ontology</label>
             <div className="relative group">
                <select 
                  value={categoryId} 
                  onChange={(e) => updateQueryParam('categoryId', e.target.value || undefined)}
                  className="appearance-none w-full pl-4 pr-10 py-3 rounded-2xl bg-surface/50 backdrop-blur-sm border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm text-xs font-bold text-text-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/60 group-hover:text-primary transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
             </div>
           </div>

           {/* Sort Select */}
           <div className="space-y-1.5 focus-within:-translate-y-0.5 transition-transform">
             <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Audit Sequencing</label>
             <div className="relative group">
                <select 
                  value={sort} 
                  onChange={(e) => updateQueryParam('sort', e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-3 rounded-2xl bg-surface/50 backdrop-blur-sm border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm text-xs font-bold text-text-primary"
                >
                  <option value="date_desc">Newest Logs First</option>
                  <option value="date_asc">Oldest Logs First</option>
                  <option value="amount_desc">Amount: High Value</option>
                  <option value="amount_asc">Amount: Low Value</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/60 group-hover:text-primary transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
