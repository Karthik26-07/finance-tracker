'use client'

import React from 'react'
import { Plus, Receipt } from 'lucide-react'
import { CreateGroupDialog } from './CreateGroupDialog'
import { ManualGroupExpenseDialog } from './ManualGroupExpenseDialog'

interface GroupActionsProps {
  groups: any[]
  userId: string
}

export function GroupActions({ groups, userId }: GroupActionsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false)

  return (
    <>
      <div className="flex gap-3">
         <button 
           onClick={() => setIsCreateModalOpen(true)}
           className="flex items-center justify-center gap-2.5 px-6 py-3 bg-surface border border-border/60 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-highlight transition-all active:scale-95 shadow-sm font-mono"
         >
            <Plus size={14} strokeWidth={3} className="text-primary" />
            Initialize Node
         </button>
         <button 
           onClick={() => setIsManualModalOpen(true)}
           className="flex items-center justify-center gap-2.5 px-6 py-3 bg-linear-to-br from-primary to-primary-container text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg shadow-primary/20 transition-all active:scale-95 font-mono"
         >
            <Receipt size={14} strokeWidth={3} />
            Manual Post
         </button>
      </div>

      <CreateGroupDialog 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <ManualGroupExpenseDialog 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        groups={groups}
        userId={userId}
      />
    </>
  )
}
