'use client'

import React, { useState, useTransition } from 'react'
import { Category } from '@/lib/db/schema'
import { deleteCategory } from '@/modules/categories/categories.action'
import { CategoryForm } from '../forms/CategoryForm'
import { Trash2, Edit3, Eye, ArrowRight, X, Info, Layers } from 'lucide-react'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'
import { toast } from '@/lib/store/useToast'

interface CategoryItemProps {
  category: Category
  subCategories?: Category[]
  allCategories: Category[]
  level?: number
  onExplore: () => void
}

export function CategoryItem({ 
  category, 
  subCategories = [], 
  allCategories,
  level = 0,
  onExplore
}: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
        toast.success(`Category "${category.name}" de-initialized`)
      }
      setIsDeleting(false)
    })
  }

  const hasSubs = subCategories.length > 0
  const accentColor = category.color || '#003178'

  return (
    <div className="group animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
      <div 
        className="relative flex flex-col h-full p-6 bg-surface border border-border/10 rounded-[36px] hover:border-primary/25 transition-all duration-500 overflow-hidden"
      >
        {/* Deep Field Ambient Glow */}
        <div 
          className="absolute -top-12 -right-12 w-32 h-32 blur-2xl opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 rounded-full pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />
        
        {/* Top Intelligence Area: Badges and Action Cluster */}
        <div className="flex items-center justify-between mb-5">
           <div className="min-w-20">
             <span 
               className="px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] rounded-full border border-border/10 leading-none transition-all"
               style={{ color: accentColor, backgroundColor: `${accentColor}12` }}
             >
               {category.type === 'both' ? 'Hybrid' : category.type}
             </span>
           </div>
           
           <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* Explorer Action (Eye) */}
              <div className="relative group/tooltip">
                <button 
                  onClick={onExplore}
                  className="relative p-1.5 text-text-muted/40 hover:text-primary bg-highlight/0 hover:bg-primary/10 rounded-xl transition-all"
                >
                  <Eye size={15} />
                  {hasSubs && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white text-[7px] font-black flex items-center justify-center rounded-full border border-background tabular-nums">
                      {subCategories.length}
                    </span>
                  )}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-[8px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg shadow-primary/20">
                  Deep Explore
                </div>
              </div>

              {!category.isSystem && (
                <>
                  {/* Configuration Action (Edit) */}
                  <div className="relative group/tooltip">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-text-muted/40 hover:text-secondary bg-highlight/0 hover:bg-secondary/10 rounded-xl transition-all"
                    >
                      <Edit3 size={15} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-secondary text-[8px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Configure
                    </div>
                  </div>

                  {/* De-initialize Action (Delete) */}
                  <div className="relative group/tooltip">
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting || isTransitioning}
                      className="p-1.5 text-text-muted/40 hover:text-tertiary bg-highlight/0 hover:bg-tertiary/10 rounded-xl transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-tertiary text-[8px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Remove
                    </div>
                  </div>
                </>
              )}
           </div>
        </div>

        {/* System Node Focal Point: Icon & Title */}
        <button 
          onClick={onExplore}
          className="flex-1 flex flex-col items-center text-center space-y-4 outline-none group/identity cursor-pointer"
        >
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all group-hover/identity:scale-110 group-hover/identity:shadow-xl duration-500 bg-background border border-border/5"
            style={{ color: accentColor }}
          >
            {category.icon || '📁'}
          </div>
          
          <div className="space-y-0.5 flex flex-col items-center">
            <h3 className="text-base font-black text-text-primary tracking-tight leading-tight group-hover/identity:text-primary transition-all font-display">
              {category.name}
            </h3>
            {category.description ? (
               <p className="text-[10px] text-text-secondary/50 font-medium leading-relaxed italic line-clamp-2 max-w-50">
                {category.description}
               </p>
            ) : (
               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-highlight/20 border border-border/5">
                 <span className="text-[7px] font-black text-text-muted/20 uppercase tracking-widest leading-none">Atomic System Node</span>
               </div>
            )}
          </div>
        </button>
      </div>


      {isEditing && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-surface p-8 rounded-[40px] border border-border/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Node Tuning</span>
                </div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight font-display">Configure Category</h2>
              </div>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2 hover:bg-highlight/50 rounded-xl text-text-muted transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <CategoryForm 
              categoryId={category.id} 
              initialData={{
                name: category.name,
                type: category.type as 'income' | 'expense' | 'both',
                color: category.color,
                icon: category.icon,
                parentId: category.parentId,
                description: category.description
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
        title="Delete Node?"
        description={`Are you sure you want to de-initialize &ldquo;${category.name}&rdquo;? All linked financial traces will be unassigned.`}
        confirmText="De-initialize Node"
        onConfirm={onConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  )
}

