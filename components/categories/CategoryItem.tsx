'use client'

import React, { useState, useTransition } from 'react'
import { Category } from '@/lib/db/schema'
import { deleteCategory } from '@/actions/categories'
import { CategoryForm } from '../forms/CategoryForm'
import { Trash2, Edit3, ChevronRight, ChevronDown } from 'lucide-react'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'
import { toast } from '@/lib/store/useToast'

interface CategoryItemProps {
  category: Category
  subCategories?: Category[]
  allCategories: Category[]
}

export function CategoryItem({ category, subCategories = [], allCategories }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isTransitioning, startTransition] = useTransition()

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const onConfirmDelete = async () => {
    setShowDeleteConfirm(false)
    startTransition(async () => {
      setIsDeleting(true)
      const result = await deleteCategory(category.id)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        toast.success(`Category "${category.name}" deleted`)
      }
      setIsDeleting(false)
    })
  }

  const hasSubs = subCategories.length > 0

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
      <div 
        className="group flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:shadow-ambient transition-all"
        style={{ borderLeftColor: category.color || 'var(--color-primary)', borderLeftWidth: '6px' }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasSubs}
            className={`p-1.5 rounded-lg hover:bg-highlight transition-colors flex items-center justify-center ${!hasSubs ? 'opacity-0 cursor-default' : ''}`}
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          
          <div className="w-10 h-10 flex items-center justify-center bg-highlight rounded-xl text-xl shrink-0">
            {category.icon || '📁'}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary truncate">{category.name}</h3>
            <p className="text-xs text-text-muted capitalize">{category.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
           {category.isSystem && (
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold text-text-muted bg-highlight rounded-full border border-border-subtle mr-2">
                System
              </span>
           )}
          
          {!category.isSystem && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                title="Edit Category"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting || isTransitioning}
                className="p-2 text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded-xl transition-colors"
                title="Delete Category"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasSubs && (
        <div className="pl-8 sm:pl-12 space-y-2 border-l-2 border-border-subtle ml-6">
          {subCategories.map(sub => (
            <CategoryItem 
              key={sub.id} 
              category={sub} 
              allCategories={allCategories}
              subCategories={allCategories.filter(allC => allC.parentId === sub.id)}
            />
          ))}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Edit Category</h2>
                <p className="text-sm text-text-secondary">Changes will apply immediately</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-highlight rounded-xl text-text-muted">✕</button>
            </div>
            <CategoryForm 
              categoryId={category.id} 
              initialData={{
                name: category.name,
                type: category.type as 'income' | 'expense' | 'both',
                color: category.color,
                icon: category.icon,
                parentId: category.parentId
              }}
              categories={allCategories.map(c => ({ id: c.id, name: c.name }))}
              isModal
              onSuccess={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}

      <ConfirmationDialog 
        isOpen={showDeleteConfirm}
        title="Delete Category?"
        description={`Are you sure you want to delete &ldquo;${category.name}&rdquo;? This action cannot be undone and transactions in this category will be unassigned.`}
        confirmText="Delete Category"
        onConfirm={onConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  )
}
