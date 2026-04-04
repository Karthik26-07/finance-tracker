'use client'

import React from 'react'
import { Category } from '@/lib/db/schema'
import { X, ArrowRight, Layers, LayoutGrid, Info, Settings2, Trash2, Edit3, Plus, ChevronRight } from 'lucide-react'

interface CategoryExplorerProps {
  category: Category
  subCategories: Category[]
  onClose: () => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddSub: (parentId: string) => void
}

export function CategoryExplorer({ 
  category, 
  subCategories, 
  onClose,
  onEdit,
  onDelete,
  onAddSub
}: CategoryExplorerProps) {
  const accentColor = category.color || '#003178'

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 lg:p-8 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-4xl bg-surface rounded-[48px] border border-border/10 shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Aesthetic Header Background */}
        <div className="relative h-48 shrink-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface" />
          
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 bg-background/50 backdrop-blur-md hover:bg-highlight rounded-2xl text-text-muted transition-all z-10"
          >
            <X size={24} />
          </button>

          <div className="absolute inset-0 p-10 flex items-end">
            <div className="flex items-center gap-8 w-full">
               <div 
                 className="w-24 h-24 rounded-4xl bg-background border border-border/10 shadow-xl flex items-center justify-center text-5xl shrink-0"
                 style={{ color: accentColor }}
               >
                 {category.icon || '📁'}
               </div>
               <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span 
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-border/10 leading-none"
                      style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
                    >
                      {category.type === 'both' ? 'Hybrid System' : `${category.type} Protocol`}
                    </span>
                    {category.isSystem && (
                      <span className="text-[10px] font-black text-text-muted/30 uppercase tracking-[0.2em]">Core Architecture</span>
                    )}
                  </div>
                  <h2 className="text-4xl font-black text-text-primary tracking-tight font-display">{category.name}</h2>
               </div>
            </div>
          </div>
        </div>

        {/* Content Explorer Area */}
        <div className="flex-1 overflow-y-auto p-10 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Sidebar: Metadata & Protocols */}
            <div className="lg:col-span-1 space-y-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Info size={16} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Metadata</span>
                  </div>
                  <div className="bg-highlight/20 border border-border/5 rounded-4xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/5 pb-4">
                       <div className="space-y-0.5">
                         <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">Sub-Nodes</p>
                         <p className="text-2xl font-black text-text-primary tabular-nums">{subCategories.length}</p>
                       </div>
                       <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <Layers size={20} />
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest ml-1">Logic Definition</p>
                      <div className="relative pl-4">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 rounded-full" />
                        <p className="text-sm font-medium text-text-secondary leading-relaxed italic break-all">
                          {category.description || "No specific system logic defined for this node."}
                        </p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Settings2 size={16} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Controls</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => onEdit(category)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-highlight/30 hover:bg-primary/10 border border-border/5 rounded-2xl transition-all group"
                    >
                      <span className="text-sm font-bold text-text-primary group-hover:text-primary">Configure</span>
                      <Edit3 size={16} className="text-text-muted group-hover:text-primary" />
                    </button>
                    {!category.isSystem && (
                      <button 
                        onClick={() => onDelete(category)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-highlight/30 hover:bg-tertiary/10 border border-border/5 rounded-2xl transition-all group"
                      >
                        <span className="text-sm font-bold text-text-primary group-hover:text-tertiary">Remove Node</span>
                        <Trash2 size={16} className="text-text-muted group-hover:text-tertiary" />
                      </button>
                    )}
                  </div>
               </div>
            </div>

            {/* Main Column: System Hierarchy */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <LayoutGrid size={16} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Hierarchy Explorer</span>
                </div>
                <button 
                  onClick={() => onAddSub(category.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all active:scale-95"
                >
                  <Plus size={14} />
                  New sub-node
                </button>
              </div>

              {subCategories.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {subCategories.map(sub => (
                    <div 
                      key={sub.id}
                      className="group/item flex items-center justify-between p-4 bg-highlight/10 hover:bg-highlight/30 border border-border/5 rounded-[28px] transition-all"
                    >
                      <div className="flex items-center gap-5">
                         <div 
                           className="w-12 h-12 rounded-2xl bg-background border border-border/5 flex items-center justify-center text-2xl shrink-0 transition-transform group-hover/item:scale-110"
                           style={{ color: sub.color || accentColor }}
                         >
                           {sub.icon || '📁'}
                         </div>
                         <div className="space-y-0.5">
                            <h4 className="text-base font-black text-text-primary tracking-tight">{sub.name}</h4>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40">{sub.type}</span>
                               {sub.description && (
                                 <>
                                   <div className="w-1 h-1 rounded-full bg-text-muted/20" />
                                   <span className="text-[10px] font-medium text-text-muted/50 italic truncate max-w-50">{sub.description}</span>
                                 </>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(sub)}
                          className="p-2 text-text-muted/40 hover:text-primary transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(sub)}
                          className="p-2 text-text-muted/40 hover:text-tertiary transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="ml-2 w-px h-6 bg-border/5" />
                        <div className="p-2 text-text-muted/20">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-highlight/5 border border-dashed border-border/10 rounded-4xl flex flex-col items-center">
                   <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-4 text-text-muted/10">
                     <Layers size={32} />
                   </div>
                   <p className="text-text-muted/40 font-black uppercase tracking-[0.2em] text-[10px]">No Nested Architectures</p>
                   <p className="text-[11px] text-text-muted/30 mt-1">This node is currently an atomic system unit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
