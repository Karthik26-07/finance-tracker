'use client'

import React, { useState, useMemo, useTransition } from 'react'
import { Category } from '@/lib/db/schema'
import { CategoryItem } from './CategoryItem'
import { CategoryForm } from '../forms/CategoryForm'
import { Plus, Search, Filter, Layers, ChevronDown, X } from 'lucide-react'
import { CategoryExplorer } from './CategoryExplorer'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'
import { Modal } from '../ui/Modal'
import { deleteCategory } from '@/actions/categories'
import { toast } from '@/lib/store/useToast'

interface CategoryListProps {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'both'>('all')
  const [isAdding, setIsAdding] = useState(false)
  const [activeExplorerId, setActiveExplorerId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isDeletingTransition, startDeletingTransition] = useTransition()
  const [addingSubParentId, setAddingSubParentId] = useState<string | null>(null)

  const activeExplorerCategory = useMemo(() => 
    categories.find(c => c.id === activeExplorerId), 
  [categories, activeExplorerId])

  const explorerSubCategories = useMemo(() => 
    categories.filter(c => c.parentId === activeExplorerId),
  [categories, activeExplorerId])

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === 'all' || c.type === filterType || c.type === 'both'
      return matchesSearch && matchesType
    })
  }, [categories, search, filterType])

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    
    startDeletingTransition(async () => {
      const result = await deleteCategory(deletingCategory.id)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        toast.success(`Category "${deletingCategory.name}" de-initialized`)
        setDeletingCategory(null)
        if (deletingCategory.id === activeExplorerId) setActiveExplorerId(null)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 transition-colors group-focus-within:text-primary" size={16} />
            <input 
              type="text" 
              placeholder="Search category nodes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border/10 rounded-2xl focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center p-1 bg-surface border border-border/10 rounded-2xl gap-1">
            {(['all', 'income', 'expense', 'both'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-text-muted hover:bg-highlight hover:text-text-primary'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  filterType === type ? 'bg-white animate-pulse' : 'bg-text-muted/30'
                }`} />
                {type === 'all' ? 'System' : type === 'both' ? 'Hybrid' : type === 'income' ? 'Input' : 'Output'}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all text-[11px] font-extrabold uppercase tracking-widest whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={3} />
          Initialize Node
        </button>
      </div>

      {/* Categories Content Grid */}
      <div>
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
             {filteredCategories.map((category) => (
                <CategoryItem 
                  key={category.id} 
                  category={category} 
                  allCategories={categories}
                  subCategories={categories.filter(sub => sub.parentId === category.id)}
                  onExplore={() => setActiveExplorerId(category.id)}
                />
              ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-elevated/30 rounded-4xl border border-dashed border-border/10 flex flex-col items-center">
            <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mb-6 text-text-muted/20">
              <Layers size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-primary tracking-tight">System Identity: Undefined</h3>
            <p className="text-text-secondary/60 max-w-xs mx-auto mt-2 text-sm font-medium">
              No categories match your request. Initialize a new node to expand your system.
            </p>
          </div>
        )}
      </div>

      {/* Explorer Modal: High-Fidelity Deep Dive */}
      {activeExplorerCategory && (
        <CategoryExplorer 
          category={activeExplorerCategory}
          subCategories={explorerSubCategories}
          onClose={() => setActiveExplorerId(null)}
          onEdit={(c) => setEditingCategory(c)}
          onDelete={(c) => setDeletingCategory(c)}
          onAddSub={(parentId) => setAddingSubParentId(parentId)}
        />
      )}

      {/* Creation Modal: Root Nodes */}
      <Modal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="Initialize Category"
        subtitle="Define a new architectural node for your system"
      >
        <CategoryForm 
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          isModal
          onSuccess={() => setIsAdding(false)}
        />
      </Modal>

      {/* Sub-Node Creation Modal */}
      <Modal
        isOpen={!!addingSubParentId}
        onClose={() => setAddingSubParentId(null)}
        title="Create Sub-Node"
        subtitle="Extend the hierarchy of your financial system"
      >
        <CategoryForm 
          initialData={{ parentId: addingSubParentId! }}
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          isModal
          onSuccess={() => setAddingSubParentId(null)}
        />
      </Modal>

      {/* Editing Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Configure Node"
        subtitle="Tune the parameters of this architectural element"
      >
        {editingCategory && (
          <CategoryForm 
            categoryId={editingCategory.id}
            initialData={{ 
              name: editingCategory.name,
              type: editingCategory.type as 'income' | 'expense' | 'both',
              color: editingCategory.color,
              icon: editingCategory.icon,
              description: editingCategory.description,
              parentId: editingCategory.parentId
            }}
            categories={categories.map(c => ({ id: c.id, name: c.name }))}
            isModal
            onSuccess={() => setEditingCategory(null)}
          />
        )}
      </Modal>

      <ConfirmationDialog 
        isOpen={!!deletingCategory}
        title="Remove Node Strategy?"
        description={`Are you sure you want to de-initialize "${deletingCategory?.name}"? All nested traces will be decoupled.`}
        confirmText="De-initialize"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCategory(null)}
        variant="danger"
      />
    </div>
  )
}

