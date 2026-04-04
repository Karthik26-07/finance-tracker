'use client'

import React, { useTransition, useState, useEffect } from 'react'
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
    <div className={`space-y-4 transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Premium Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Filter by note, location or tags..."
          value={currentSearch}
          onChange={(e) => setCurrentSearch(e.target.value)}
          className="w-full pl-11 pr-12 py-3 rounded-2xl border border-border/40 bg-surface/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-sm text-sm"
        />
        {currentSearch && (
          <button 
            onClick={() => setCurrentSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary hover:bg-highlight rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Categories */}
      <div className="flex flex-col gap-4 overflow-x-auto no-scrollbar pb-2">
        {/* Type Filter Chips */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-highlight rounded-xl border border-border/5">
             <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary font-mono">Type</span>
          </div>
          {[
            { id: '', label: 'All' },
            { id: 'income', label: 'Income', color: 'text-secondary' },
            { id: 'expense', label: 'Expense', color: 'text-tertiary' },
            { id: 'transfer', label: 'Transfer', color: 'text-primary' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => updateQueryParam('type', t.id || undefined)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                type === t.id 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-surface border-border/50 text-text-secondary hover:bg-highlight hover:border-border'
              }`}
            >
              {t.label}
            </button>
          ))}
          
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-tertiary/10 text-tertiary text-[10px] font-black uppercase tracking-widest hover:bg-tertiary/20 transition-all active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
        </div>

        {/* Dropdowns for more specific filtering */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
           {/* Account Select */}
           <div className="relative shrink-0">
             <select 
               value={accountId} 
               onChange={(e) => updateQueryParam('accountId', e.target.value || undefined)}
               className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-surface border border-border/50 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all cursor-pointer shadow-sm min-w-40"
             >
               <option value="">Balance Nodes: All</option>
               {accounts.map(acc => (
                 <option key={acc.id} value={acc.id}>{acc.name}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <Search className="w-3 h-3" />
             </div>
           </div>

           {/* Category Select */}
           <div className="relative shrink-0">
             <select 
               value={categoryId} 
               onChange={(e) => updateQueryParam('categoryId', e.target.value || undefined)}
               className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-surface border border-border/50 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all cursor-pointer shadow-sm min-w-40"
             >
               <option value="">Ontology: All Categories</option>
               {categories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <SlidersHorizontal className="w-3 h-3" />
             </div>
           </div>

           {/* Sort Select */}
           <div className="relative shrink-0">
             <select 
               value={sort} 
               onChange={(e) => updateQueryParam('sort', e.target.value)}
               className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-surface border border-border/50 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all cursor-pointer shadow-sm min-w-40"
             >
               <option value="date_desc">Audit: Newest Logs</option>
               <option value="date_asc">Audit: Oldest Logs</option>
               <option value="amount_desc">Flow: High to Low</option>
               <option value="amount_asc">Flow: Low to High</option>
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <Search className="w-3 h-3" />
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
