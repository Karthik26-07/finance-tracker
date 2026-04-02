'use client'

import React, { useState, useMemo } from 'react'
import { Category } from '@/lib/db/schema'
import { CategoryItem } from './CategoryItem'
import { CategoryForm } from '../forms/CategoryForm'
import { Plus, Search, Filter, Layers } from 'lucide-react'

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'both'>('all')
  const [isAdding, setIsAdding] = useState(false)

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === 'all' || c.type === filterType || c.type === 'both'
      return matchesSearch && matchesType
    })
  }, [categories, search, filterType])

  // Split into parents and children for grouping
  const topLevel = useMemo(() => filteredCategories.filter(c => !c.parentId), [filteredCategories])
  
  // When search is active, we flatten the view for easier finding
  const viewMode = search ? 'flat' : 'tree'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-surface p-4 sm:p-5 rounded-3xl border border-border shadow-ambient">
        <div className="flex-1 min-w-60 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={20} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-highlight/50 border border-transparent rounded-2xl focus:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense' | 'both')}
              className="appearance-none bg-highlight/50 pl-11 pr-10 py-3.5 rounded-2xl border border-transparent focus:border-primary/20 hover:bg-highlight focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Multi-type</option>
            </select>
          </div>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3.5 rounded-2xl hover:brightness-110 active:brightness-95 transition-all shadow-lg hover:shadow-xl active:scale-95"
            title="Create New Category"
          >
            <Plus size={20} />
            <span className="font-semibold hidden sm:inline">New Category</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {viewMode === 'tree' ? (
          topLevel.length > 0 ? (
            topLevel.map(cat => (
              <CategoryItem 
                key={cat.id} 
                category={cat} 
                allCategories={categories}
                subCategories={categories.filter(s => s.parentId === cat.id)}
              />
            ))
          ) : (
            <div className="py-24 text-center bg-surface rounded-3xl border-2 border-dashed border-border-subtle">
              <div className="w-16 h-16 bg-highlight rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                <Layers size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">No Categories Found</h3>
              <p className="text-text-muted max-w-xs mx-auto mt-1">Start by creating a category or filter to see existing ones</p>
            </div>
          )
        ) : (
          filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <CategoryItem 
                key={cat.id} 
                category={cat} 
                allCategories={categories}
              />
            ))
          ) : (
             <div className="py-24 text-center bg-surface rounded-3xl border-2 border-dashed border-border-subtle">
               <p className="text-text-muted">No results matching &ldquo;{search}&rdquo;</p>
             </div>
          )
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">New Category</h2>
                <p className="text-sm text-text-secondary">Structure your finance tracking</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-2 hover:bg-highlight rounded-xl text-text-muted"
                title="Cancel"
              >
                ✕
              </button>
            </div>
            <CategoryForm 
              categories={categories.map(c => ({ id: c.id, name: c.name }))}
              isModal
              onSuccess={() => setIsAdding(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
